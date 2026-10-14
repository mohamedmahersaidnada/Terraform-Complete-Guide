import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const REQUIRED_FILES = [
  'main.tf',
  'versions.tf',
  'variables.tf',
  'outputs.tf',
  'README.md',
];

export const MANDATORY_TAG_KEYS = [
  'Environment',
  'ManagedBy',
  'CostCenter',
  'Owner',
];

export const CLOUD_LAB_DIRS = [
  'examples/cloud-labs/aws',
  'examples/cloud-labs/azure',
  'examples/cloud-labs/gcp',
];

function fail(message) {
  throw new Error(message);
}

export function verifyLabStructure(labDir) {
  for (const file of REQUIRED_FILES) {
    const fullPath = join(labDir, file);
    if (!existsSync(fullPath)) {
      fail(`Missing required file '${file}' in ${labDir}`);
    }
  }
}

export function verifyRequiredVersion(labDir) {
  const versionsFile = join(labDir, 'versions.tf');
  const content = readFileSync(versionsFile, 'utf8');
  const match = content.match(/required_version\s*=\s*"([^"]+)"/);
  if (!match) {
    fail(`Could not find required_version in ${versionsFile}`);
  }
  const versionConstraint = match[1].trim();
  if (versionConstraint !== '~> 1.14.0') {
    fail(`Invalid required_version '${versionConstraint}' in ${versionsFile}. Expected '~> 1.14.0'.`);
  }
}

export function verifyMandatoryTags(labDir) {
  const mainContent = readFileSync(join(labDir, 'main.tf'), 'utf8');
  const varsContent = readFileSync(join(labDir, 'variables.tf'), 'utf8');
  const combined = `${mainContent}\n${varsContent}`;

  // Check that all mandatory tag keys exist either in locals or variables
  for (const tag of MANDATORY_TAG_KEYS) {
    const hasTagKey =
      new RegExp(`\\b${tag}\\b\\s*=`).test(combined) ||
      new RegExp(`"\\b${tag}\\b"\\s*=`).test(combined) ||
      new RegExp(`\\bvar\\.${tag.toLowerCase()}\\b`).test(combined);

    if (!hasTagKey) {
      fail(`Missing enforcement of mandatory tag '${tag}' in ${labDir}`);
    }
  }

  // Verify mandatory_tags local exists
  if (!/locals\s*{[\s\S]*mandatory_tags\s*=/.test(mainContent)) {
    fail(`Expected 'mandatory_tags' defined in locals in ${join(labDir, 'main.tf')}`);
  }
}

export function checkCloudLabs(root = repository) {
  const passed = [];
  for (const relDir of CLOUD_LAB_DIRS) {
    const labDir = resolve(root, relDir);
    if (!existsSync(labDir)) {
      fail(`Cloud lab directory does not exist: ${relDir}`);
    }

    verifyLabStructure(labDir);
    verifyRequiredVersion(labDir);
    verifyMandatoryTags(labDir);

    passed.push(relDir);
    console.log(`PASS ${relDir}: all 5 files present, required_version '~> 1.14.0', mandatory tags enforced.`);
  }

  console.log(`Cloud labs verification: ${passed.length}/${CLOUD_LAB_DIRS.length} labs passed successfully.`);
  return passed;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    checkCloudLabs();
    process.exit(0);
  } catch (err) {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  }
}
