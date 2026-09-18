import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {mergeFinanceRules}=require('./merge-rules-core.js');
const file=process.argv[2];
if(!file)throw Error('Usage: node tools/merge-rules.mjs current-rules.json > merged-rules.json');
const current=JSON.parse(fs.readFileSync(file,'utf8'));
const patch=JSON.parse(fs.readFileSync(new URL('../firebase.rules.finance-simple.json',import.meta.url),'utf8'));
process.stdout.write(JSON.stringify(mergeFinanceRules(current,patch),null,2)+'\n');
