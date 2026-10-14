import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Default deterministic epoch: 2026-10-14T00:00:00Z (Unix: 1791936000)
export const DEFAULT_EPOCH = 1791936000;

export const EXCLUDED_DIRS = new Set([
  '.git',
  '.kilo',
  '.tmp',
  '.cache',
  '.tools',
  '.worktrees',
  'node_modules',
  '__pycache__',
  '.terraform',
  '.terragrunt-cache',
  'dist',
  'site'
]);

export const FORBIDDEN_FILE_PATTERNS = [
  /^(?:\.aws|\.azure|\.config\/gcloud)\//,
  /(?:^|\/)\.terraform\//,
  /(?:^|\/)\.terragrunt-cache\//,
  /(?:^|\/)node_modules\//,
  /(?:^|\/)(?:\.env(?:\..*)?|[^/]*\.tfstate(?:\..*)?|[^/]*\.(?:tfplan|plan|pem|key)|\.terraformrc|terraform\.rc|credentials\.json|application_default_credentials\.json)$/,
  /\.pyc$/,
  /(?:^|\/)(?:\.DS_Store|Thumbs\.db)$/
];

export const REQUIRED_FILES = [
  'package.json',
  'docs/lesson-inventory.json',
  'CHANGELOG.md',
  'README.md',
  'LICENSE',
  'mkdocs.yml',
  'docs/RELEASE-CHECKLIST.md'
];

// Precompute CRC32 table for deterministic ZIP generation
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c;
}

export function computeCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function isForbidden(relPath) {
  const normalized = relPath.replaceAll('\\', '/');
  if (/\.(?:example|sample)$/.test(normalized)) return false;
  return FORBIDDEN_FILE_PATTERNS.some(re => re.test(normalized));
}

export function validateCleanliness(root = process.cwd(), options = {}) {
  const errors = [];
  const warnings = [];

  // 1. Check core required release files
  for (const req of REQUIRED_FILES) {
    const full = path.resolve(root, req);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      errors.push(`Missing required release file: ${req}`);
    }
  }

  // 2. Check complete 22-lesson curriculum from inventory
  const invPath = path.resolve(root, 'docs/lesson-inventory.json');
  if (fs.existsSync(invPath)) {
    try {
      const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
      if (Array.isArray(inv.lessons)) {
        if (inv.lessons.length < 22) {
          errors.push(`Lesson inventory contains fewer than 22 lessons (found ${inv.lessons.length})`);
        }
        for (const lesson of inv.lessons) {
          if (!lesson.path || !fs.existsSync(path.resolve(root, lesson.path))) {
            errors.push(`Missing inventoried lesson: ${lesson?.path}`);
          }
        }
      } else {
        errors.push('docs/lesson-inventory.json missing lessons array');
      }
    } catch (e) {
      errors.push(`Failed to parse lesson inventory: ${e.message}`);
    }
  }

  // 3. Scan for forbidden artifacts across root
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll('\\', '/');
      const base = entry.name;
      if (EXCLUDED_DIRS.has(base)) continue;
      if (entry.isSymbolicLink()) {
        errors.push(`Symbolic link detected in working tree: ${rel}`);
        continue;
      }
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.isFile()) {
        if (isForbidden(rel)) {
          errors.push(`Forbidden artifact detected in packaging scope: ${rel}`);
        }
      }
    }
  }
  scan(root);

  // 4. Git status inspection
  try {
    const gitStatus = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (gitStatus.length > 0) {
      const changeCount = gitStatus.split('\n').filter(Boolean).length;
      const statusMsg = `Working tree contains ${changeCount} uncommitted or untracked changes.`;
      if (options.strict) {
        errors.push(`Strict release check failed: ${statusMsg}`);
      } else {
        warnings.push(`${statusMsg} (Packaging active working tree; run with --strict to require git clean).`);
      }
    }
  } catch (err) {
    warnings.push(`Git status inspection unavailable: ${err.message}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function collectReleaseFiles(root = process.cwd()) {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replaceAll('\\', '/');
      const base = entry.name;
      if (EXCLUDED_DIRS.has(base)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        if (!isForbidden(rel)) {
          files.push(rel);
        }
      }
    }
  }

  walk(root);
  // Sort files lexicographically for deterministic packaging
  files.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  return files;
}

// Build a single 512-byte POSIX ustar tar header block
function createTarHeader(name, size, mode, mtime, typeflag = '0') {
  const buf = Buffer.alloc(512, 0);

  // name: up to 100 bytes
  buf.write(name.slice(0, 100), 0, 100, 'utf8');

  // mode: 8 bytes octal
  buf.write(mode.toString(8).padStart(6, '0') + ' \0', 100, 8, 'ascii');

  // uid: 8 bytes octal (0)
  buf.write('000000 \0', 108, 8, 'ascii');

  // gid: 8 bytes octal (0)
  buf.write('000000 \0', 116, 8, 'ascii');

  // size: 12 bytes octal
  buf.write(size.toString(8).padStart(11, '0') + ' ', 124, 12, 'ascii');

  // mtime: 12 bytes octal
  buf.write(mtime.toString(8).padStart(11, '0') + ' ', 136, 12, 'ascii');

  // chksum: 8 spaces initially for checksum calculation
  buf.fill(0x20, 148, 156);

  // typeflag: 1 byte
  buf.write(typeflag, 156, 1, 'ascii');

  // magic & version: "ustar\0" + "00"
  buf.write('ustar\0', 257, 6, 'ascii');
  buf.write('00', 263, 2, 'ascii');

  // uname & gname
  buf.write('root\0', 265, 5, 'ascii');
  buf.write('root\0', 297, 5, 'ascii');

  // Calculate checksum (sum of all 512 bytes with chksum field as spaces)
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    sum += buf[i];
  }

  // Write checksum: 6 octal digits + null + space
  buf.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii');

  return buf;
}

export function createDeterministicTarGz(files, root, outputPath, options = {}) {
  const epoch = options.epoch ?? (process.env.SOURCE_DATE_EPOCH ? parseInt(process.env.SOURCE_DATE_EPOCH, 10) : DEFAULT_EPOCH);
  const prefix = options.archivePrefix ?? '';
  const chunks = [];

  for (const rel of files) {
    const full = path.resolve(root, rel);
    const content = fs.readFileSync(full);
    const entryPath = prefix ? `${prefix}/${rel}` : rel;
    const mode = rel.endsWith('.sh') ? 0o755 : 0o644;

    // Handle long path (> 100 bytes) using GNU tar @LongLink extension
    const entryBytes = Buffer.byteLength(entryPath, 'utf8');
    if (entryBytes > 100) {
      const nameBuf = Buffer.from(entryPath + '\0', 'utf8');
      const longHeader = createTarHeader('././@LongLink', nameBuf.length, 0o644, epoch, 'L');
      chunks.push(longHeader);
      chunks.push(nameBuf);
      const namePad = (512 - (nameBuf.length % 512)) % 512;
      if (namePad > 0) chunks.push(Buffer.alloc(namePad, 0));
    }

    const header = createTarHeader(entryPath, content.length, mode, epoch, '0');
    chunks.push(header);
    chunks.push(content);
    const pad = (512 - (content.length % 512)) % 512;
    if (pad > 0) chunks.push(Buffer.alloc(pad, 0));
  }

  // End of tar: two 512-byte blocks of zeros
  chunks.push(Buffer.alloc(1024, 0));

  const tarBuffer = Buffer.concat(chunks);
  // gzip with fixed mtime: 0 and maximum compression for bit-for-bit determinism
  const gzipBuffer = zlib.gzipSync(tarBuffer, { level: 9, mtime: 0 });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, gzipBuffer);
  return { path: outputPath, size: gzipBuffer.length, filesCount: files.length };
}

export function createDeterministicZip(files, root, outputPath, options = {}) {
  const epoch = options.epoch ?? (process.env.SOURCE_DATE_EPOCH ? parseInt(process.env.SOURCE_DATE_EPOCH, 10) : DEFAULT_EPOCH);
  const prefix = options.archivePrefix ?? '';

  // Calculate DOS date and time from epoch timestamp
  const date = new Date(epoch * 1000);
  const dosTime = ((date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (Math.floor(date.getUTCSeconds() / 2))) & 0xffff;
  const dosDate = (((date.getUTCFullYear() - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate()) & 0xffff;

  const localHeaders = [];
  const centralEntries = [];
  let currentOffset = 0;

  for (const rel of files) {
    const full = path.resolve(root, rel);
    const content = fs.readFileSync(full);
    const entryPath = prefix ? `${prefix}/${rel}` : rel;
    const nameBuf = Buffer.from(entryPath, 'utf8');
    const crc = computeCrc32(content);
    const uncompressedSize = content.length;

    // Use raw deflate compression (standard zip method 8)
    const compressed = zlib.deflateRawSync(content, { level: 9 });
    const compressedSize = compressed.length;
    const isExecutable = rel.endsWith('.sh');
    const unixMode = isExecutable ? 0o100755 : 0o100644;

    // Local file header (30 bytes + nameBuf.length)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed: 2.0
    localHeader.writeUInt16LE(0x0800, 6);     // flags: UTF-8 encoded filename
    localHeader.writeUInt16LE(8, 8);          // compression: deflate
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // extra field length

    localHeaders.push(localHeader, nameBuf, compressed);

    // Central directory header (46 bytes + nameBuf.length)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(0x0314, 4);     // version made by: Unix 2.0
    centralHeader.writeUInt16LE(20, 6);         // version needed: 2.0
    centralHeader.writeUInt16LE(0x0800, 8);     // flags: UTF-8
    centralHeader.writeUInt16LE(8, 10);         // compression: deflate
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);         // extra field length
    centralHeader.writeUInt16LE(0, 32);         // comment length
    centralHeader.writeUInt16LE(0, 34);         // disk number start
    centralHeader.writeUInt16LE(0, 36);         // internal file attributes
    centralHeader.writeUInt32LE(((unixMode << 16) >>> 0), 38); // external file attributes
    centralHeader.writeUInt32LE(currentOffset, 42);  // relative offset of local header

    centralEntries.push(centralHeader, nameBuf);

    currentOffset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDirOffset = currentOffset;
  const centralDirBuffer = Buffer.concat(centralEntries);
  const centralDirSize = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // start disk
  eocd.writeUInt16LE(files.length, 8);  // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);         // comment length

  const zipBuffer = Buffer.concat([...localHeaders, centralDirBuffer, eocd]);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, zipBuffer);
  return { path: outputPath, size: zipBuffer.length, filesCount: files.length };
}

export function computeSha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function packageRelease(root = process.cwd(), options = {}) {
  const distDir = path.resolve(root, options.distDir ?? 'dist');
  const pkgPath = path.resolve(root, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error('package.json not found in repository root.');
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version || '1.0.0';
  const name = pkg.name || 'terraform-complete-guide';
  const releaseTag = `v${version}`;
  const archivePrefix = `${name}-${releaseTag}`;

  console.log(`[package-release] Validating repository cleanliness for ${name} ${releaseTag}...`);
  const cleanliness = validateCleanliness(root, options);

  if (cleanliness.warnings.length > 0) {
    for (const w of cleanliness.warnings) {
      console.log(`  [notice] ${w}`);
    }
  }

  if (!cleanliness.valid) {
    const msg = cleanliness.errors.join('\n  ');
    throw new Error(`Repository cleanliness validation failed:\n  ${msg}`);
  }
  console.log('  [cleanliness] Repository cleanliness verified.');

  const files = collectReleaseFiles(root);
  console.log(`[package-release] Collected ${files.length} release files.`);

  fs.mkdirSync(distDir, { recursive: true });

  const tarGzFilename = `${name}-${releaseTag}.tar.gz`;
  const tarGzPath = path.join(distDir, tarGzFilename);
  console.log(`[package-release] Building deterministic tarball: ${tarGzFilename}...`);
  const tarResult = createDeterministicTarGz(files, root, tarGzPath, { archivePrefix, ...options });

  const zipFilename = `${name}-${releaseTag}.zip`;
  const zipPath = path.join(distDir, zipFilename);
  console.log(`[package-release] Building deterministic zip: ${zipFilename}...`);
  const zipResult = createDeterministicZip(files, root, zipPath, { archivePrefix, ...options });

  // Compute and record SHA256 hashes
  const tarHash = computeSha256(tarGzPath);
  const zipHash = computeSha256(zipPath);

  const checksumsFilename = 'checksums.sha256';
  const checksumsPath = path.join(distDir, checksumsFilename);
  const checksumsContent = `${tarHash}  ${tarGzFilename}\n${zipHash}  ${zipFilename}\n`;
  fs.writeFileSync(checksumsPath, checksumsContent, 'utf8');

  console.log('\n[package-release] Release artifacts generated successfully:');
  console.log(`  ${tarGzFilename} (${(tarResult.size / 1024).toFixed(1)} KB) - SHA256: ${tarHash}`);
  console.log(`  ${zipFilename} (${(zipResult.size / 1024).toFixed(1)} KB) - SHA256: ${zipHash}`);
  console.log(`  ${checksumsFilename} - SHA256 checksum manifest created.`);

  return {
    version,
    releaseTag,
    filesCount: files.length,
    artifacts: [
      { name: tarGzFilename, path: tarGzPath, size: tarResult.size, sha256: tarHash },
      { name: zipFilename, path: zipPath, size: zipResult.size, sha256: zipHash }
    ],
    checksumsPath
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const strict = process.argv.includes('--strict');
    packageRelease(process.cwd(), { strict });
  } catch (error) {
    console.error(`\n[package-release:error] ${error.message}`);
    process.exitCode = 1;
  }
}
