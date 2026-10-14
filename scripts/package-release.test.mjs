import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {
  validateCleanliness,
  collectReleaseFiles,
  createDeterministicTarGz,
  createDeterministicZip,
  computeSha256,
  packageRelease,
  isForbidden,
  computeCrc32,
  DEFAULT_EPOCH
} from './package-release.mjs';

test('isForbidden identifies prohibited and allowed patterns', () => {
  assert.equal(isForbidden('.env'), true);
  assert.equal(isForbidden('.env.production'), true);
  assert.equal(isForbidden('.env.example'), false);
  assert.equal(isForbidden('terraform.tfstate'), true);
  assert.equal(isForbidden('terraform.tfstate.backup'), true);
  assert.equal(isForbidden('infra.tfplan'), true);
  assert.equal(isForbidden('credentials.json'), true);
  assert.equal(isForbidden('server.key'), true);
  assert.equal(isForbidden('cert.pem'), true);
  assert.equal(isForbidden('script.pyc'), true);
  assert.equal(isForbidden('.terraform/providers/registry.terraform.io'), true);
  assert.equal(isForbidden('node_modules/express/index.js'), true);
  assert.equal(isForbidden('terraform.tfvars.example'), false);
  assert.equal(isForbidden('main.tf'), false);
  assert.equal(isForbidden('README.md'), false);
});

test('computeCrc32 computes standard IEEE 802.3 CRC32', () => {
  const buf = Buffer.from('123456789', 'utf8');
  assert.equal(computeCrc32(buf), 0xcbf43926);
});

test('validateCleanliness validates required files and rejects forbidden artifacts in fixture', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'package-test-'));
  try {
    // Missing required files in empty temp dir
    const resEmpty = validateCleanliness(temp);
    assert.equal(resEmpty.valid, false);
    assert.ok(resEmpty.errors.some(e => e.includes('package.json')));

    // Create minimal mock repo
    fs.writeFileSync(path.join(temp, 'package.json'), JSON.stringify({ name: 'test', version: '1.0.0' }));
    fs.writeFileSync(path.join(temp, 'CHANGELOG.md'), '# Changelog');
    fs.writeFileSync(path.join(temp, 'README.md'), '# Readme');
    fs.writeFileSync(path.join(temp, 'LICENSE'), 'MIT');
    fs.writeFileSync(path.join(temp, 'mkdocs.yml'), 'site_name: Test');
    fs.mkdirSync(path.join(temp, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(temp, 'docs/RELEASE-CHECKLIST.md'), '# Checklist');

    // Create 22 dummy lessons
    const lessons = [];
    for (let i = 1; i <= 22; i++) {
      const lessonRel = `docs/lesson-${i}.md`;
      fs.writeFileSync(path.join(temp, lessonRel), `# Lesson ${i}`);
      lessons.push({ path: lessonRel, title: `Lesson ${i}` });
    }
    fs.writeFileSync(path.join(temp, 'docs/lesson-inventory.json'), JSON.stringify({ lessons }));

    const resValid = validateCleanliness(temp);
    assert.equal(resValid.valid, true);
    assert.equal(resValid.errors.length, 0);

    // Introduce a forbidden artifact
    fs.writeFileSync(path.join(temp, 'secret.tfstate'), '{}');
    const resForbidden = validateCleanliness(temp);
    assert.equal(resForbidden.valid, false);
    assert.ok(resForbidden.errors.some(e => e.includes('secret.tfstate')));
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('createDeterministicTarGz and createDeterministicZip generate reproducible archives', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'package-archive-test-'));
  try {
    fs.writeFileSync(path.join(temp, 'fileA.txt'), 'Content A\n');
    fs.writeFileSync(path.join(temp, 'fileB.txt'), 'Content B\n');
    const files = ['fileA.txt', 'fileB.txt'];

    const tarPath1 = path.join(temp, 'out1.tar.gz');
    const tarPath2 = path.join(temp, 'out2.tar.gz');
    createDeterministicTarGz(files, temp, tarPath1, { epoch: DEFAULT_EPOCH, archivePrefix: 'test-v1' });
    createDeterministicTarGz(files, temp, tarPath2, { epoch: DEFAULT_EPOCH, archivePrefix: 'test-v1' });

    assert.equal(computeSha256(tarPath1), computeSha256(tarPath2));

    const zipPath1 = path.join(temp, 'out1.zip');
    const zipPath2 = path.join(temp, 'out2.zip');
    createDeterministicZip(files, temp, zipPath1, { epoch: DEFAULT_EPOCH, archivePrefix: 'test-v1' });
    createDeterministicZip(files, temp, zipPath2, { epoch: DEFAULT_EPOCH, archivePrefix: 'test-v1' });

    assert.equal(computeSha256(zipPath1), computeSha256(zipPath2));
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('packageRelease packages the real repository and writes checksums.sha256', () => {
  const root = process.cwd();
  const tempDist = fs.mkdtempSync(path.join(os.tmpdir(), 'package-real-dist-'));
  try {
    const result = packageRelease(root, { distDir: tempDist });
    assert.equal(result.version, '1.0.0');
    assert.equal(result.artifacts.length, 2);
    assert.ok(result.filesCount >= 20);

    const checksumsFile = path.join(tempDist, 'checksums.sha256');
    assert.ok(fs.existsSync(checksumsFile));
    const lines = fs.readFileSync(checksumsFile, 'utf8').trim().split('\n');
    assert.equal(lines.length, 2);

    for (const line of lines) {
      const [hash, filename] = line.trim().split(/\s+/);
      const artifactPath = path.join(tempDist, filename);
      assert.ok(fs.existsSync(artifactPath));
      assert.equal(computeSha256(artifactPath), hash);
    }
  } finally {
    fs.rmSync(tempDist, { recursive: true, force: true });
  }
});
