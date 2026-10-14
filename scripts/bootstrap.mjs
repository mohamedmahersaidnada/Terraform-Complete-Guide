import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const within = (root, candidate) => { const rel=path.relative(root,candidate);return rel!=='..'&&!rel.startsWith(`..${path.sep}`)&&!path.isAbsolute(rel); };
export function install(target, root=source) {
  root=fs.realpathSync(root);target=fs.realpathSync(target);
  if(within(root,target)||within(target,root))throw new Error('Source and target must be separate directory trees.');
  const mappings=['core','adapters','.claude','.gemini','CLAUDE.md','GEMINI.md','docs/MULTI-PROVIDER.md','docs/MCP-GUIDE-CLAUDE.md'].map(item=>[item,item]);
  mappings.push(['templates/project-memory','project-memory'],['templates/docs','docs']);
  const files=[];
  function collect(src,dst){
    const stat=fs.lstatSync(src);if(stat.isSymbolicLink())throw new Error(`Refusing source symlink: ${src}`);
    if(stat.isDirectory()){for(const name of fs.readdirSync(src))collect(path.join(src,name),path.join(dst,name));}
    else if(stat.isFile())files.push([src,dst]);
  }
  for(const [from,to] of mappings)collect(path.join(root,from),path.join(target,to));
  // Preflight every parent before writing anything. Never follow destination links.
  for(const [,dst] of files){
    const ancestors=[];
    for(let cursor=dst;cursor!==target;cursor=path.dirname(cursor)){
      if(!within(target,cursor))throw new Error('Destination escaped target.');
      ancestors.push(cursor);
    }
    for(const cursor of ancestors.reverse()){
      if(fs.existsSync(cursor)||fs.lstatSync(cursor,{throwIfNoEntry:false})){
        const stat=fs.lstatSync(cursor);
        if(stat.isSymbolicLink())throw new Error(`Refusing destination symlink: ${cursor}`);
        if(cursor!==dst&&!stat.isDirectory())throw new Error(`Destination parent is not a directory: ${cursor}`);
        if(cursor===dst&&!stat.isFile())throw new Error(`Destination is not a regular file: ${cursor}`);
      }
    }
  }
  let installed=0,skipped=0;
  for(const [src,dst] of files){
    if(fs.existsSync(dst)){skipped++;continue;}
    fs.mkdirSync(path.dirname(dst),{recursive:true});
    fs.copyFileSync(src,dst,fs.constants.COPYFILE_EXCL);installed++;
  }
  return {installed,skipped};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length!==3)throw new Error('Usage: node scripts/bootstrap.mjs /existing/target (existing files are never overwritten)');console.log(install(process.argv[2]));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
