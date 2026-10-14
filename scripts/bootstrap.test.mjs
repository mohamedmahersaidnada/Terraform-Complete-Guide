import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { install } from './bootstrap.mjs';

test('bootstrap preserves existing files, fills directories and exports clean templates',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'guide-bootstrap-'));
  try{
    fs.mkdirSync(path.join(temp,'docs'));fs.writeFileSync(path.join(temp,'docs/ARCHITECTURE.md'),'Human architecture');
    const first=install(temp);assert.ok(first.installed>0);assert.equal(first.skipped,1);
    assert.equal(fs.readFileSync(path.join(temp,'docs/ARCHITECTURE.md'),'utf8'),'Human architecture');
    assert.ok(fs.existsSync(path.join(temp,'docs/RUNBOOK.md')));
    assert.equal(fs.existsSync(path.join(temp,'docs/lesson-inventory.json')),false);
    assert.match(fs.readFileSync(path.join(temp,'project-memory/STATUS.md'),'utf8'),/not yet onboarded/);
    const second=install(temp);assert.equal(second.installed,0);assert.equal(second.skipped,first.installed+1);
  }finally{if(path.dirname(temp)!==fs.realpathSync(os.tmpdir())&&!path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep))throw new Error('Unsafe fixture path');fs.rmSync(temp,{recursive:true,force:true});}
});
test('bootstrap refuses overlapping source and destination',()=>assert.throws(()=>install(process.cwd()),/separate directory trees/));

for(const mode of ['destination-link','source-link','file-parent'])test(`bootstrap preflight rejects ${mode} without writes`,()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'guide-bootstrap-'));
  try{
    const target=path.join(temp,'target');const external=path.join(temp,'external');fs.mkdirSync(target);fs.mkdirSync(external);
    if(mode==='destination-link'){
      fs.symlinkSync(external,path.join(target,'core'),process.platform==='win32'?'junction':'dir');
      assert.throws(()=>install(target),/destination symlink/);
    }else if(mode==='source-link'){
      const fake=path.join(temp,'source');fs.mkdirSync(fake);fs.symlinkSync(external,path.join(fake,'core'),process.platform==='win32'?'junction':'dir');
      assert.throws(()=>install(target,fake),/source symlink/);
    }else{
      fs.writeFileSync(path.join(target,'core'),'existing');assert.throws(()=>install(target),/not a directory/);
    }
    assert.deepEqual(fs.readdirSync(external),[]);
    assert.equal(fs.existsSync(path.join(target,'CLAUDE.md')),false);
    assert.deepEqual(fs.readdirSync(target),mode==='source-link'?[]:['core']);
  }finally{if(path.dirname(path.resolve(temp))!==path.resolve(os.tmpdir()))throw new Error('Unsafe fixture path');fs.rmSync(temp,{recursive:true,force:true});}
});
