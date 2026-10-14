import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, renameSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { terraform } from './check-examples.mjs';

// Only built-in terraform_data; no credentials, downloads, or cloud resources.
const fixture = mkdtempSync(join(tmpdir(), 'terraform-guide-recovery-'));
let initialized = false;
const config = path => `terraform {\n required_version = "~> 1.14.0"\n backend "local" { path = "${path}" }\n}\nresource "terraform_data" "record" { input = "recovery-drill" }\n`;
const addresses = () => terraform(fixture, ['state', 'list']).trim();
try {
  writeFileSync(join(fixture, 'main.tf'), config('before.tfstate'));
  terraform(fixture, ['init', '-input=false', '-no-color']);
  initialized = true;
  terraform(fixture, ['apply', '-auto-approve', '-input=false', '-no-color']);
  const backup = terraform(fixture, ['state', 'pull']);
  writeFileSync(join(fixture, 'backup.tfstate'), backup, 'utf8');
  const original = JSON.parse(backup);
  assert.equal(addresses(), 'terraform_data.record');
  writeFileSync(join(fixture, 'main.tf'), config('after.tfstate'));
  // -force-copy is confined to this disposable, known-empty local destination.
  terraform(fixture, ['init', '-migrate-state', '-force-copy', '-input=false', '-no-color']);
  assert.equal(addresses(), 'terraform_data.record');
  assert.equal(JSON.parse(terraform(fixture, ['state', 'pull'])).lineage, original.lineage);
  const migrated = readFileSync(join(fixture, 'after.tfstate'), 'utf8');
  renameSync(join(fixture, 'after.tfstate'), join(fixture, 'simulated-loss.tfstate'));
  assert.equal(existsSync(join(fixture, 'after.tfstate')), false);
  terraform(fixture, ['state', 'push', 'backup.tfstate']);
  const restored = JSON.parse(terraform(fixture, ['state', 'pull']));
  assert.equal(restored.lineage, original.lineage);
  assert.deepEqual(restored.resources, JSON.parse(migrated).resources);
  assert.equal(addresses(), 'terraform_data.record');
  terraform(fixture, ['plan', '-detailed-exitcode', '-input=false', '-no-color']);
  console.log('PASS local migration and loss/restore: address, lineage, resource IDs preserved; no-change plan.');
} finally {
  try {
    if (initialized) {
      terraform(fixture, ['destroy', '-auto-approve', '-input=false', '-no-color']);
      assert.equal(addresses(), '');
    }
    const target = resolve(fixture);
    if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('terraform-guide-recovery-')) throw new Error('Unsafe cleanup target');
    rmSync(target, { recursive: true, force: true });
    console.log('PASS cleanup: empty state and disposable fixture removed.');
  } catch (error) {
    console.error(`Cleanup incomplete; inspect isolated fixture: ${fixture}`);
    throw error;
  }
}
