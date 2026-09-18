// Offline merge only. Does not publish, delete database data, or relax root rules.
// node tools/merge-rules.mjs current-rules.json > merged-rules.json
import fs from 'node:fs';
const path=process.argv[2];if(!path)throw Error('Provide your currently deployed Realtime Database Rules JSON.');
const current=JSON.parse(fs.readFileSync(path,'utf8'));
const extra=JSON.parse(fs.readFileSync(new URL('../firebase.rules.additions.json',import.meta.url),'utf8'));
const previous=JSON.parse(fs.readFileSync(new URL('./finance-mix02-baseline.json',import.meta.url),'utf8'));
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])]));return v}
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
if(!current.rules)throw Error('Missing rules object');
for(const k of ['.read','.write'])if(current.rules[k]!==undefined&&current.rules[k]!==false)throw Error('Broad root rule '+k+' would bypass finance restrictions. Review manually.');
if(Object.keys(current.rules).some(k=>k.startsWith('$')))throw Error('Root wildcard rules require manual review.');
for(const [key,node] of Object.entries(extra.rules)){
 const existing=current.rules[key];
 if(existing!==undefined&&!equal(existing,previous.rules[key])&&!equal(existing,node))throw Error('Custom rules at '+key+'. Not overwritten; manually merge after backup.');
 current.rules[key]=node;
}
process.stdout.write(JSON.stringify(current,null,2)+'\n');
