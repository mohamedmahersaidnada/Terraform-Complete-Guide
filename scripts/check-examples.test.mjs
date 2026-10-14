import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateManifest, removeFixture, fixtureInput, verifyTestSummary } from './check-examples.mjs';

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'terraform-guide-manifest-'));
  try {
    mkdirSync(join(root, 'examples/local'), { recursive: true });
    writeFileSync(join(root, 'examples/local/main.tf'), 'resource "terraform_data" "test" {}');
    writeFileSync(join(root, 'examples/local/local.tftest.hcl'), 'run "check" { command = plan }');
    writeFileSync(join(root, 'lesson.md'), '# Lesson');
    const manifest = { schemaVersion: 1, examples: [{ path: 'examples/local', lesson: 'lesson.md', runtime: 'Terraform 1.14.8', testClass: 'local', cost: 'none', cloudCredentials: false }], modules: [] };
    const save = () => writeFileSync(join(root, 'examples/manifest.json'), JSON.stringify(manifest));
    save(); run(root, manifest, save);
  } finally { removeFixture(root); }
}
test('accepts an explicit local root', () => fixture(root => assert.equal(validateManifest(root).examples.length, 1)));
test('rejects empty inventory', () => fixture((root, m, save) => { m.examples = []; save(); assert.throws(() => validateManifest(root), /nonempty/); }));
test('rejects missing inventory', () => fixture(root => assert.throws(() => validateManifest(root, 'absent.json'), /ENOENT/)));
test('rejects duplicate roots', () => fixture((root, m, save) => { m.examples.push(m.examples[0]); save(); assert.throws(() => validateManifest(root), /Duplicate/); }));
test('rejects unlisted runnable roots', () => fixture(root => { mkdirSync(join(root, 'examples/unlisted')); writeFileSync(join(root, 'examples/unlisted/main.tf'), ''); assert.throws(() => validateManifest(root), /Unlisted/); }));
test('rejects traversal', () => fixture((root, m, save) => { m.examples[0].path = 'examples/../../outside'; save(); assert.throws(() => validateManifest(root), /Invalid/); }));
test('rejects missing lesson', () => fixture((root, m, save) => { m.examples[0].lesson = 'missing.md'; save(); assert.throws(() => validateManifest(root), /Missing/); }));
test('rejects cloud credentials classified local', () => fixture((root, m, save) => { m.examples[0].cloudCredentials = true; save(); assert.throws(() => validateManifest(root), /Local lab/); }));
test('cleanup refuses repository path', () => assert.throws(() => removeFixture(process.cwd()), /Refusing/));
test('executable classification needs tests',()=>fixture(root=>{unlinkSync(join(root,'examples/local/local.tftest.hcl'));assert.throws(()=>validateManifest(root),/needs native tests/);}));
test('test setup directories must be inventoried',()=>fixture(root=>{mkdirSync(join(root,'examples/local/tests/setup'),{recursive:true});writeFileSync(join(root,'examples/local/tests/setup/main.tf'),'');assert.throws(()=>validateManifest(root),/Unlisted/);}));
test('fixtures exclude private inputs and generated artifacts',()=>{for(const name of ['prod.auto.tfvars','terraform.tfvars.json','custom.tfstate.backup','secret.tfplan','.terraform'])assert.equal(fixtureInput(`/root/${name}`),false,name);for(const name of ['main.tf','safe.tfvars.example','.terraform.lock.hcl','tests'])assert.equal(fixtureInput(`/root/${name}`),true,name);});
test('lesson must be a regular Markdown file',()=>fixture((root,m,save)=>{m.examples[0].lesson='examples/local';save();assert.throws(()=>validateManifest(root),/escaping lesson/);}));
test('null manifest produces an actionable schema error',()=>fixture(root=>{writeFileSync(join(root,'examples/manifest.json'),'null');assert.throws(()=>validateManifest(root),/schemaVersion/);}));
test('native result requires real passing runs',()=>{const message={type:'test_summary',test_summary:{status:'pass',passed:4,failed:0,errored:0,skipped:0}};assert.equal(verifyTestSummary(JSON.stringify(message)),4);message.test_summary.passed=0;assert.throws(()=>verifyTestSummary(JSON.stringify(message)),/at least one/);assert.throws(()=>verifyTestSummary(''),/at least one/);message.test_summary.passed=1;message.test_summary.skipped=1;assert.throws(()=>verifyTestSummary(JSON.stringify(message)),/no failures/);});
