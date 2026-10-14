import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {check, headings} from './check-docs.mjs';
const fixture=(text,run)=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'guide-docs-'));try{fs.mkdirSync(path.join(dir,'docs'));fs.writeFileSync(path.join(dir,'docs/lesson-inventory.json'),JSON.stringify({schemaVersion:1,lessons:[{path:'README.md',title:'Guide',owner:'maintainers',status:'draft',validation:'unverified'}]}));fs.writeFileSync(path.join(dir,'README.md'),text);run(dir);}finally{fs.rmSync(dir,{recursive:true,force:true});}};
test('valid local fragment and encoded file',()=>fixture('# Guide\n\n[Self](#guide)\n[File](a%20b.md#title)\n',dir=>{fs.writeFileSync(path.join(dir,'a b.md'),'# Title\n');assert.deepEqual(check(dir).errors,[]);}));
test('broken local link fails',()=>fixture('# Guide\n[Missing](absent.md)\n',dir=>assert.match(check(dir).errors.join(),/missing local link/)));
test('broken fragment fails',()=>fixture('# Guide\n[Missing](#absent)\n',dir=>assert.match(check(dir).errors.join(),/missing heading/)));
test('outside root fails',()=>fixture('# Guide\n[Outside](../private.md)\n',dir=>assert.match(check(dir).errors.join(),/outside repository/)));
test('fenced examples and excluded worktree ignored',()=>fixture('# Guide\n\n```md\n[Fake](absent.md)\n```\n',dir=>{fs.mkdirSync(path.join(dir,'.kilo'));fs.writeFileSync(path.join(dir,'.kilo','bad.md'),'broken');assert.deepEqual(check(dir).errors,[]);}));
test('duplicate heading suffix',()=>assert.deepEqual([...headings('# Same\n## Same')],['same','same-1']));
test('unclosed fence and missing language fail',()=>fixture('# Guide\n```\n',dir=>assert.equal(check(dir).errors.length,2)));

test('fenced headings are not anchors',()=>assert.deepEqual([...headings('# Actual\n```md\n# Fake\n```')],['actual']));
test('missing inventory fails',()=>fixture('# Guide\n',dir=>{fs.unlinkSync(path.join(dir,'docs/lesson-inventory.json'));assert.match(check(dir).errors.join(),/missing lesson inventory/);}));

test('colliding heading IDs stay unique',()=>assert.deepEqual([...headings('# A\n## A\n## A-1')],['a','a-1','a-1-1']));
test('short inner fence does not close outer fence',()=>fixture('# Guide\n````md\n```\n[Ignored](missing.md)\n````\n',dir=>assert.deepEqual(check(dir).errors,[])));
test('dot-prefixed local filename is inside root',()=>fixture('# Guide\n[File](..notes.md)\n',dir=>{fs.writeFileSync(path.join(dir,'..notes.md'),'# Notes\n');assert.deepEqual(check(dir).errors,[]);}));
test('reference links are checked',()=>fixture('# Guide\n[Missing][target]\n\n[target]: absent.md\n',dir=>assert.match(check(dir).errors.join(),/missing local link/)));
test('undefined reference links fail',()=>fixture('# Guide\n[Missing][target]\n',dir=>assert.match(check(dir).errors.join(),/undefined reference/)));
for(const malformed of [null,{}, {schemaVersion:1,lessons:{}}, {schemaVersion:1,lessons:[null]}])test(`malformed inventory ${JSON.stringify(malformed)}`,()=>fixture('# Guide\n',dir=>{fs.writeFileSync(path.join(dir,'docs/lesson-inventory.json'),JSON.stringify(malformed));assert.ok(check(dir).errors.length);}));
test('inventory traversal is rejected',()=>fixture('# Guide\n',dir=>{fs.writeFileSync(path.join(dir,'docs/lesson-inventory.json'),JSON.stringify({schemaVersion:1,lessons:[{path:'../private.md'}]}));assert.match(check(dir).errors.join(),/invalid lesson path/);}));
test('review requires real date and evidence',()=>fixture('# Guide\n',dir=>{const target=path.join(dir,'docs/lesson-inventory.json');const data=JSON.parse(fs.readFileSync(target));Object.assign(data.lessons[0],{status:'reviewed',validation:'local',reviewed:'2026-02-30'});fs.writeFileSync(target,JSON.stringify(data));const errors=check(dir).errors.join();assert.match(errors,/invalid review date/);assert.match(errors,/missing lesson evidence/);}));
test('new topic must be inventoried',()=>fixture('# Guide\n',dir=>{fs.mkdirSync(path.join(dir,'basics'));fs.writeFileSync(path.join(dir,'basics/new.md'),'# New\n');assert.match(check(dir).errors.join(),/unlisted lesson/);}));
