import assert from 'node:assert/strict';
import { mkdtempSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repository, terraform, removeFixture, fixtureInput } from './check-examples.mjs';

const temp = mkdtempSync(join(tmpdir(), 'terraform-guide-lifecycle-'));
let initialized = false;
let success = false;
try {
  cpSync(join(repository, 'examples/local-basics'), temp, { recursive: true, filter: fixtureInput });
  terraform(temp, ['init', '-input=false', '-no-color']);
  initialized = true;
  terraform(temp, ['plan', '-input=false', '-no-color', '-out=reviewed.tfplan', '-detailed-exitcode'], 2);
  terraform(temp, ['apply', '-input=false', '-no-color', 'reviewed.tfplan']);
  const outputs = JSON.parse(terraform(temp, ['output', '-json']));
  assert.equal(outputs.name.value, 'hello-terraform-dev');
  assert.equal(outputs.environment.value, 'dev');
  terraform(temp, ['plan', '-input=false', '-no-color', '-detailed-exitcode'], 0);
  terraform(temp, ['plan', '-input=false', '-no-color', '-detailed-exitcode', '-var=project=changed'], 2);
  terraform(temp, ['plan', '-input=false', '-no-color', '-detailed-exitcode', '-var=environment=invalid'], 1);
  success = true;
} finally {
  // Keep the isolated state available for investigation if destroy fails.
  try {
    if (initialized) {
      terraform(temp, ['destroy', '-input=false', '-auto-approve', '-no-color']);
      assert.equal(terraform(temp, ['state', 'list']).trim(), '');
    }
    removeFixture(temp);
  } catch (error) { console.error(`Cleanup failed; preserved fixture at ${temp}`); throw error; }
}
if (success) console.log('PASS local lifecycle: reviewed plan/apply, outputs, unchanged=0, changed=2, invalid=1, destroy, empty state.');
