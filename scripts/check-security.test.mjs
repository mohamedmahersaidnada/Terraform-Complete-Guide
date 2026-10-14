import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectFile, inspectDependencies } from './check-security.mjs';

const safe = `permissions:\n  contents: read\njobs:\n  check:\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@${'a'.repeat(40)}\n        with:\n          persist-credentials: false\n`;
test('accepts baseline workflow policy', () => assert.deepEqual(inspectFile('.github/workflows/test.yml', safe), []));
test('rejects mutable action and privileged workflow', () => {
  const result = inspectFile('.github/workflows/test.yml', safe.replace('a'.repeat(40), 'main') + '\non:\n  pull_request_target:\n');
  assert.equal(result.length, 2);
});
test('rejects missing workflow controls', () => assert.equal(inspectFile('.github/workflows/test.yaml', 'jobs: {}').length, 2));
test('detects synthetic credential without printing its value', () => {
  for (const secret of ['AK' + 'IA' + 'A'.repeat(16), 'gh' + 'p_' + 'z'.repeat(36), '-----BEGIN ' + 'PRIVATE KEY-----', 'AI' + 'za' + 'x'.repeat(35)]) {
    const result = inspectFile('fixture.txt', secret);
    assert.equal(result.length, 1);
    assert.ok(!result.join().includes(secret));
  }
});
test('rejects private artifacts but allows sanitized template paths', () => {
  for (const name of ['x.tfstate', 'x.tfstate.backup', 'terraform.tfvars', '.env.local', 'a.auto.tfvars.json', 'plan.tfplan']) assert.equal(inspectFile(name, '').length, 1, name);
  assert.deepEqual(inspectFile('terraform.tfvars.example', ''), []);
});
test('requires dependency locks and integrity', () => {
  const root = mkdtempSync(join(tmpdir(), 'guide-security-'));
  try {
    assert.equal(inspectDependencies(root, ['package.json']).length, 1);
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/test': { resolved: 'http://invalid' } } }));
    assert.equal(inspectDependencies(root, ['package.json', 'package-lock.json']).length, 1);
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, 'node_modules/test': { resolved: 'https://example.invalid/test', integrity: 'sha512-synthetic' } } }));
    assert.deepEqual(inspectDependencies(root, ['package.json', 'package-lock.json']), []);
  } finally { rmSync(root, { recursive: true }); }
});

test('checks every job timeout and every checkout credential setting', () => {
  const second = `  unsafe:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@${'b'.repeat(40)}\n`;
  const result = inspectFile('.github/workflows/test.yml', safe + second);
  assert.ok(result.some(x => x.includes('each job')));
  assert.ok(result.some(x => x.includes('each checkout')));
});
test('rejects arbitrary variable files and Windows private paths', () => {
  for (const path of ['org/prod.tfvars', 'org/prod.tfvars.json', 'saved.plan', 'a/private.pem', 'a/private.key', 'a/credentials.json', 'a/.terraformrc', 'org\\prod.tfvars']) {
    assert.ok(inspectFile(path, '').some(x => x.includes('private artifact')), path);
  }
});

test('checks named checkout steps and additional write permissions', () => {
  const unsafe = safe.replace('- uses: actions/checkout', '- name: Fetch source\n        uses: actions/checkout').replace('persist-credentials: false', 'persist-credentials: true');
  assert.ok(inspectFile('.github/workflows/test.yml', unsafe).some(x => x.includes('each checkout')));
  assert.ok(inspectFile('.github/workflows/test.yml', safe.replace('contents: read', 'contents: read\n  issues: write')).some(x => x.includes('write permission')));
});

test('rejects write permissions followed by YAML inline comments', () => {
  for (const permission of ['issues', 'contents', 'id-token', 'packages', 'actions', 'security-events']) {
    const workflow = safe.replace('contents: read', `contents: read\n  ${permission}: write # elevated`);
    assert.ok(inspectFile('.github/workflows/test.yml', workflow).some(x => /(?:write permission|credentialed workflow)/.test(x)), permission);
  }
});
