import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  checkCloudLabs,
  verifyLabStructure,
  verifyRequiredVersion,
  verifyMandatoryTags,
  REQUIRED_FILES,
  MANDATORY_TAG_KEYS,
} from './check-cloud-labs.mjs';

function createLabFixture(customFiles = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cloud-lab-fixture-'));
  try {
    for (const file of REQUIRED_FILES) {
      let content = '# default';
      if (file === 'versions.tf') {
        content = 'terraform {\n  required_version = "~> 1.14.0"\n}\n';
      } else if (file === 'main.tf') {
        content = `
locals {
  mandatory_tags = {
    Environment = var.environment
    ManagedBy   = var.managed_by
    CostCenter  = var.cost_center
    Owner       = var.owner
  }
}
`;
      } else if (file === 'variables.tf') {
        content = `
variable "environment" { default = "sandbox" }
variable "managed_by" { default = "Terraform" }
variable "cost_center" { default = "training" }
variable "owner" { default = "cloud-lab-user" }
`;
      }
      if (customFiles[file] !== undefined) {
        content = customFiles[file];
      }
      if (content !== null) {
        writeFileSync(join(dir, file), content, 'utf8');
      }
    }
    return dir;
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw err;
  }
}

test('verifyLabStructure passes when all 5 files are present', () => {
  const dir = createLabFixture();
  try {
    assert.doesNotThrow(() => verifyLabStructure(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyLabStructure throws when a required file is missing', () => {
  const dir = createLabFixture({ 'outputs.tf': null });
  try {
    assert.throws(() => verifyLabStructure(dir), /Missing required file 'outputs\.tf'/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyRequiredVersion passes for ~> 1.14.0', () => {
  const dir = createLabFixture({ 'versions.tf': 'terraform {\n  required_version = "~> 1.14.0"\n}\n' });
  try {
    assert.doesNotThrow(() => verifyRequiredVersion(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyRequiredVersion throws for mismatched version constraint', () => {
  const dir = createLabFixture({ 'versions.tf': 'terraform {\n  required_version = ">= 1.14.0"\n}\n' });
  try {
    assert.throws(() => verifyRequiredVersion(dir), /Invalid required_version/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyMandatoryTags throws when a tag is omitted', () => {
  const dir = createLabFixture({
    'main.tf': 'locals { mandatory_tags = { Environment = "sandbox" } }',
    'variables.tf': 'variable "environment" { default = "sandbox" }',
  });
  try {
    assert.throws(() => verifyMandatoryTags(dir), /Missing enforcement of mandatory tag/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('checkCloudLabs passes on current repository cloud labs', () => {
  const passed = checkCloudLabs();
  assert.equal(passed.length, 3);
});
