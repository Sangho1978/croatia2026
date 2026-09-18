// Run: node tools/merge-rules.mjs existing-rules.json > merged-rules.json
// No network calls. Does not alter the original file.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const source=process.argv[2];
if(!source)throw Error('Provide the currently deployed Rules JSON as a file.');
const current=JSON.parse(fs.readFileSync(source,'utf8'));
const extra=JSON.parse(fs.readFileSync(new URL('../firebase.rules.additions.json',import.meta.url),'utf8'));
if(!current.rules)throw Error('Missing rules object.');
for(const key of ['.read','.write']){
 if(current.rules[key]!==undefined && current.rules[key]!==false)throw Error('Root-level allow rules would bypass finance restrictions. Remove them deliberately before merging.');
}
for(const key of Object.keys(extra.rules)){
 if(current.rules[key]!==undefined)throw Error('Existing node '+key+' found. Review manually rather than overwrite.');
 current.rules[key]=extra.rules[key];
}
console.log(JSON.stringify(current,null,2));
