import { readFileSync, readdirSync, realpathSync, existsSync, statSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { resolve, relative, isAbsolute, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function fixtureInput(source) {
  const name=source.split(/[\\/]/).at(-1);
  return name!=='.terraform' && !/\.tfstate(?:\.|$)|\.(?:tfplan|plan)$|\.tfvars(?:\.json)?$/.test(name);
}
export function removeFixture(temp) {
  const resolved = resolve(temp);
  const parent = resolve(tmpdir());
  if (dirname(resolved) !== parent || !/^terraform-guide-(check|lifecycle|manifest)-/.test(resolved.slice(parent.length + 1))) fail('Refusing cleanup outside generated temporary fixture.');
  rmSync(resolved, { recursive: true, force: true });
}
function fail(message) { throw new Error(message); }
function inside(root, path) {
  const rel = relative(root, path);
  return rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(rel);
}
export function validateManifest(root = repository, file = 'examples/manifest.json') {
  const manifest = JSON.parse(readFileSync(resolve(root, file), 'utf8'));
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.examples) || !manifest.examples.length || !Array.isArray(manifest.modules)) fail('Manifest needs schemaVersion 1, nonempty examples, and modules array.');
  const seen = new Set();
  for (const entry of [...manifest.examples, ...manifest.modules]) {
    if (!entry || typeof entry.path !== 'string' || !/^examples\/[a-zA-Z0-9_/-]+$/.test(entry.path)) fail('Invalid example path.');
    const target = resolve(root, entry.path);
    if (!inside(resolve(root, 'examples'), target) || !existsSync(target) || !inside(realpathSync(resolve(root, 'examples')), realpathSync(target))) fail(`Missing or escaping path: ${entry.path}`);
    const key = realpathSync(target).toLowerCase();
    if (seen.has(key)) fail(`Duplicate root: ${entry.path}`);
    seen.add(key);
    if (!readdirSync(target).some(name => name.endsWith('.tf'))) fail(`No Terraform files: ${entry.path}`);
    for (const field of ['lesson', 'runtime', 'testClass', 'cost']) if (typeof entry[field] !== 'string' || !entry[field].trim()) fail(`Missing ${field}: ${entry.path}`);
    const lesson = resolve(root, entry.lesson);
    if (!inside(root, lesson) || !existsSync(lesson) || !lesson.endsWith('.md') || !statSync(lesson).isFile() || !inside(realpathSync(root),realpathSync(lesson))) fail(`Missing or escaping lesson: ${entry.lesson}`);
    if (!['local', 'mocked', 'static', 'live'].includes(entry.testClass) || typeof entry.cloudCredentials !== 'boolean') fail(`Invalid classification: ${entry.path}`);
    if (entry.testClass === 'local' && (entry.cloudCredentials || entry.cost !== 'none')) fail(`Local lab must declare no cloud credentials or cost: ${entry.path}`);
    if (['local','mocked'].includes(entry.testClass)) {
      const testDirs=[target,join(target,'tests')].filter(existsSync);
      if(!testDirs.some(dir=>readdirSync(dir,{withFileTypes:true}).some(e=>e.isFile()&&/\.tftest\.(hcl|json)$/.test(e.name))))fail(`Executable lab needs native tests: ${entry.path}`);
    }
  }
  function walk(path) {
    const entries = readdirSync(path, { withFileTypes: true });
    if (entries.some(e => e.isFile() && e.name.endsWith('.tf')) && !seen.has(realpathSync(path).toLowerCase())) fail(`Unlisted Terraform directory: ${relative(root, path)}`);
    for (const entry of entries) {
      if(entry.isSymbolicLink())fail(`Symlinks are not supported in examples: ${relative(root,join(path,entry.name))}`);
      if (entry.isDirectory() && entry.name!=='.terraform') walk(join(path, entry.name));
    }
  }
  walk(resolve(root, 'examples'));
  return manifest;
}

export function terraform(cwd, args, expected = 0) {
  const env = { ...process.env, TF_IN_AUTOMATION: '1', TF_INPUT: '0' };
  // User CLI arguments/data paths must not redirect the isolated verification.
  for (const key of Object.keys(env)) if (key.startsWith('TF_CLI_ARGS') || key.startsWith('TF_VAR_') || key === 'TF_DATA_DIR' || key === 'TF_WORKSPACE') delete env[key];
  const result = spawnSync('terraform', args, { cwd, env, encoding: 'utf8', shell: false, timeout: 180000 });
  if (result.error) fail(`Cannot run terraform ${args[0]}: ${result.error.message}`);
  if (result.status !== expected) fail(`terraform ${args.join(' ')}: expected exit ${expected}, got ${result.status}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

export function verifyTestSummary(output) {
  const messages=output.trim().split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
  const summary=messages.findLast(message=>message.type==='test_summary')?.test_summary;
  if(!summary||summary.status!=='pass'||!Number.isInteger(summary.passed)||summary.passed<1||summary.failed!==0||summary.errored!==0||summary.skipped!==0)fail('Native tests need at least one passing run and no failures, errors or skips.');
  return summary.passed;
}

export function checkExamples(root = repository) {
  const manifest = validateManifest(root);
  const failures = [];
  for (const entry of [...manifest.examples, ...manifest.modules]) {
    const temp = mkdtempSync(join(tmpdir(), 'terraform-guide-check-'));
    let testingStarted=false, succeeded=false;
    try {
      cpSync(resolve(root, 'examples'), join(temp, 'examples'), { recursive: true, filter: fixtureInput });
      const cwd = resolve(temp, entry.path);
      terraform(cwd, ['fmt', '-check', '-recursive']);
      if (entry.testClass !== 'static') {
        terraform(cwd, ['init', '-backend=false', '-input=false', '-no-color']);
        terraform(cwd, ['validate', '-no-color']);
      }
      if (['local', 'mocked'].includes(entry.testClass)) {
        testingStarted=true;
        const count=verifyTestSummary(terraform(cwd, ['test', '-json']));
        console.log(`Native tests: ${count} passed.`);
      }
      succeeded=true;
      console.log(`PASS ${entry.path}: format${entry.testClass !== 'static' ? ', init, validate' : ' (static reference)'}${['local', 'mocked'].includes(entry.testClass) ? `, ${entry.testClass} tests` : '; no execution'}`);
    } catch (error) { failures.push(entry.path); console.error(`FAIL ${entry.path}: ${error.message}`); }
    finally {
      if(testingStarted&&!succeeded)console.error(`Test failure; preserved private fixture for cleanup/recovery: ${temp}`);
      else removeFixture(temp);
    }
  }
  if (failures.length) fail(`${failures.length} example(s) failed: ${failures.join(', ')}`);
  console.log(`Checked ${manifest.examples.length} roots and ${manifest.modules.length} modules.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { checkExamples(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
