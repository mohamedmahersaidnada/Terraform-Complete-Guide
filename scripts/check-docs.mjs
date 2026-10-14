import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const excluded = new Set(['.git','.kilo','.agents','.codex','.terraform','.tools','.tmp','.cache','.worktrees','node_modules','site','dist']);
const lessonDirectories = new Set(['basics','core-concepts','state','modules','provisioners','cloud-providers','security','testing','cicd','best-practices']);
const inside = (root, target) => { const rel=path.relative(root,target); return rel!=='..'&&!rel.startsWith(`..${path.sep}`)&&!path.isAbsolute(rel); };
function stripFences(text, onOpen=()=>{}) {
  let fence=null;
  const prose=text.split(/\r?\n/).map((line,i)=>{
    const match=line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if(fence) { if(match&&match[1][0]===fence[0]&&match[1].length>=fence.length&&!match[2].trim())fence=null; return ''; }
    if(match){fence=match[1];onOpen(match[2],i);return '';}
    return line;
  }).join('\n');
  return {prose, unclosed:!!fence};
}
export function discover(root) {
  return fs.readdirSync(root,{withFileTypes:true}).flatMap(e => excluded.has(e.name) || e.isSymbolicLink() ? [] : e.isDirectory() ? discover(path.join(root,e.name)) : e.name.endsWith('.md') ? [path.join(root,e.name)] : []);
}
export function headings(text) {
  text=stripFences(text).prose;
  const used = new Set();
  return new Set([...text.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)].map(m => {
    const base=m[1].toLowerCase().replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}_\-\s]/gu,'').replace(/\s/g,'-');
    let id=base;let n=0;while(used.has(id))id=`${base}-${++n}`;used.add(id);return id;
  }));
}
export function checkFile(file,root) {
  const text=fs.readFileSync(file,'utf8'); const errors=[];
  let previous=0; let h1=0;
  const stripped=stripFences(text,(info,i)=>{if(!info.trim())errors.push(`${i+1}: code fence needs a language`);});
  let prose=stripped.prose.split('\n').map((line,i)=>{
    const h=line.match(/^(#{1,6})\s/); if(h){const level=h[1].length;if(level===1)h1++;if(previous&&level>previous+1)errors.push(`${i+1}: skipped heading level`);previous=level;}
    return line;
  }).join('\n');
  if(stripped.unclosed)errors.push('unclosed code fence');
  if(h1!==1 && !file.endsWith('PULL_REQUEST_TEMPLATE.md'))errors.push('expected exactly one H1');
  const definitions=new Map([...prose.matchAll(/^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)].map(m=>[m[1].trim().toLowerCase(),m[2]]));
  prose=prose.replace(/!?\[([^\]]+)\]\[([^\]]*)\]/g,(match,label,id)=>{const url=definitions.get((id||label).trim().toLowerCase());if(!url){errors.push(`undefined reference link ${id||label}`);return '';}return `[${label}](${url})`;});
  for(const m of prose.matchAll(/!?\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)) {
    const url=m[1];if(/^(https?:|mailto:|tel:)/i.test(url))continue;
    if(/^[a-z][a-z\d+.-]*:/i.test(url)){errors.push(`unsupported link ${url}`);continue;}
    let decoded;try{decoded=decodeURIComponent(url);}catch{errors.push(`invalid URL encoding ${url}`);continue;}
    const [target,fragment]=decoded.split('#');
    const resolved=target?path.resolve(path.dirname(file),target.split('?')[0]):file;
    if(!inside(root,resolved)){errors.push(`link outside repository: ${url}`);continue;}
    if(!fs.existsSync(resolved)){errors.push(`missing local link: ${url}`);continue;}
    if(!inside(fs.realpathSync(root),fs.realpathSync(resolved))){errors.push(`link outside repository: ${url}`);continue;}
    if(fragment&&resolved.endsWith('.md')&&!headings(fs.readFileSync(resolved,'utf8')).has(fragment))errors.push(`missing heading: ${url}`);
  }
  return errors.map(e=>`${path.relative(root,file)}: ${e}`);
}
export function check(root) {
  const files=discover(root);const errors=files.flatMap(f=>checkFile(f,root));
  const inventory=path.join(root,'docs/lesson-inventory.json');
  if(fs.existsSync(inventory)) {
    let data;try{data=JSON.parse(fs.readFileSync(inventory,'utf8'));}catch{errors.push('invalid lesson inventory JSON');}
    const seen=new Set();
    if(data?.schemaVersion!==1||!Array.isArray(data?.lessons)||!data.lessons.length)errors.push('lesson inventory needs schemaVersion 1 and nonempty lessons array');
    for(const l of Array.isArray(data?.lessons)?data.lessons:[]){
      if(!l||typeof l.path!=='string'||!l.path.endsWith('.md')||path.isAbsolute(l.path)||l.path.split(/[\\/]/).includes('..')){errors.push('invalid lesson path');continue;}
      const target=path.resolve(root,l.path);
      if(seen.has(l.path))errors.push(`duplicate lesson ${l.path}`);seen.add(l.path);
      if(!inside(root,target)||!fs.existsSync(target)||!fs.statSync(target).isFile()||!inside(fs.realpathSync(root),fs.realpathSync(target))){errors.push(`missing or escaping lesson ${l.path}`);continue;}
      if(!['draft','reviewed','blocked'].includes(l.status))errors.push(`invalid lesson status ${l.path}`);
      if(typeof l.owner!=='string'||!l.owner.trim()||typeof l.title!=='string'||!l.title.trim())errors.push(`lesson title/owner missing ${l.path}`);
      if(!['unverified','reference','local','mocked','live'].includes(l.validation))errors.push(`invalid lesson validation ${l.path}`);
      if(l.status==='reviewed'){
        if(typeof l.reviewed!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(l.reviewed)||!Number.isFinite(Date.parse(l.reviewed))||new Date(l.reviewed).toISOString().slice(0,10)!==l.reviewed)errors.push(`invalid review date ${l.path}`);
        if(/This section provides guidance|\*\*Draft:/i.test(fs.readFileSync(target,'utf8')))errors.push(`reviewed lesson is still a draft ${l.path}`);
        const evidence=typeof l.evidence==='string'?path.resolve(root,l.evidence):null;
        if(!evidence||!inside(root,evidence)||!fs.existsSync(evidence)||!fs.statSync(evidence).isFile()||!inside(fs.realpathSync(root),fs.realpathSync(evidence)))errors.push(`missing lesson evidence ${l.path}`);
        if(l.validation==='unverified')errors.push(`reviewed lesson needs validation classification ${l.path}`);
      }
    }
    for(const file of files){const relative=path.relative(root,file).split(path.sep).join('/');if(lessonDirectories.has(relative.split('/')[0])&&!seen.has(relative))errors.push(`unlisted lesson ${relative}`);}
  }
  if(!fs.existsSync(inventory))errors.push('missing lesson inventory');
  return {files:files.length,errors};
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const result=check(process.cwd());for(const e of result.errors)console.error(e);console.log(`Documentation: ${result.files} files, ${result.errors.length} errors. External URLs are not gating checks.`);process.exitCode=result.errors.length?1:0;}
