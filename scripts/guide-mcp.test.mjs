import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createGuide } from './guide-mcp.mjs';

test('stdio protocol negotiates, searches, reads, reports status and rejects unsafe calls', async () => {
  const scriptPath = fileURLToPath(new URL('./guide-mcp.mjs', import.meta.url));
  const child = spawn(process.execPath, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = ''; let stderr = '';
  child.stdout.on('data', c => output += c); child.stderr.on('data', c => stderr += c);
  const done = new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(Error(`exit ${code}: ${stderr}`))); });
  const messages = [
    { id: 1, method: 'tools/list' },
    { id: 2, method: 'initialize', params: { protocolVersion: 'unsupported-future-version', capabilities: {}, clientInfo: { name: 'test', version: '1' } } },
    { method: 'notifications/initialized' },
    { id: 3, method: 'tools/list' },
    { id: 4, method: 'tools/call', params: { name: 'search_lessons', arguments: { query: 'terraform' } } },
    { id: 5, method: 'tools/call', params: { name: 'read_lesson', arguments: { path: 'basics/intro-and-installation.md' } } },
    { id: 6, method: 'tools/call', params: { name: 'read_lesson', arguments: { path: '../.aws/credentials' } } },
    { id: 7, method: 'tools/call', params: { name: 'current_status', arguments: {} } },
    { id: 8, method: 'shell/execute' },
    { id: 9, method: 'tools/call', params: { name: 'search_lessons', arguments: { query: 'x', shell: 'anything' } } },
    { id: 10, method: 'ping' }
  ];
  child.stdin.end(messages.map(m => JSON.stringify({ jsonrpc: '2.0', ...m })).join('\n') + '\n{invalid}\n');
  await done;
  const responses = output.trim().split('\n').map(JSON.parse);
  const get = id => responses.find(r => r.id === id);
  assert.equal(get(1).error.code, -32000);
  assert.equal(get(2).result.protocolVersion, '2025-11-25');
  assert.equal(get(3).result.tools.length, 3);
  assert.ok(get(3).result.tools.every(t => t.annotations.readOnlyHint));
  assert.ok(JSON.parse(get(4).result.content[0].text).results.length > 0);
  assert.match(get(5).result.content[0].text, /^# /);
  assert.equal(get(6).result.isError, true);
  assert.match(get(7).result.content[0].text, /implementation-status/);
  assert.equal(get(8).error.code, -32601);
  assert.equal(get(9).result.isError, true);
  assert.deepEqual(get(10).result, {});
  assert.equal(get(null).error.code, -32700);
  assert.equal(stderr, '');
});

test('allowlist rejects traversal, non-lessons, metadata disclosure and oversized content', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-mcp-'));
  try {
    fs.mkdirSync(path.join(root, 'docs')); fs.mkdirSync(path.join(root, 'basics'));
    fs.writeFileSync(path.join(root, 'docs/lesson-inventory.json'), JSON.stringify({ lessons: [{ path: 'basics/test.md' }, { path: 'basics/../../secret.md' }] }));
    fs.writeFileSync(path.join(root, 'basics/test.md'), '# Safe lesson\nTerraform');
    const call = createGuide(root);
    assert.equal(call('read_lesson', { path: 'basics/test.md' }), '# Safe lesson\nTerraform');
    for (const p of ['.env', 'docs/lesson-inventory.json', 'basics/../../secret.md', 'C:/secret.md', 'basics\\test.md']) assert.throws(() => call('read_lesson', { path: p }));
    assert.throws(() => call('search_lessons', { query: '' }));
    assert.throws(() => call('current_status', { path: '.env' }));
    fs.writeFileSync(path.join(root, 'basics/test.md'), 'x'.repeat(262145));
    assert.throws(() => call('read_lesson', { path: 'basics/test.md' }));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('directory junctions cannot escape the repository', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-mcp-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-mcp-outside-'));
  try {
    fs.mkdirSync(path.join(root, 'docs'));
    fs.writeFileSync(path.join(root, 'docs/lesson-inventory.json'), JSON.stringify({ lessons: [{ path: 'basics/secret.md' }] }));
    fs.writeFileSync(path.join(outside, 'secret.md'), 'private');
    fs.symlinkSync(outside, path.join(root, 'basics'), process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => createGuide(root)('read_lesson', { path: 'basics/secret.md' }));
  } finally { fs.rmSync(root, { recursive: true, force: true }); fs.rmSync(outside, { recursive: true, force: true }); }
});
