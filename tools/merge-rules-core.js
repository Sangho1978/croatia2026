/* Offline merge. Replaces finance policy at this trip only; never publishes. */
(function(root){
  'use strict';
  const TRIP='SNU17-CRO-2026-A7K9P4',NODES=['expenses','expenseReceipts'];
  function mergeFinanceRules(current,patch){
    if(!current||!current.rules||Array.isArray(current.rules)||typeof current.rules!=='object')throw Error('\ud604\uc7ac Rules \uc804\uccb4 JSON\uc744 \ubd99\uc5ec\ub123\uc5b4 \uc8fc\uc138\uc694.');
    if(['.read','.write'].some(k=>current.rules[k]!==undefined&&current.rules[k]!==false))throw Error('\ucd5c\uc0c1\uc704 \uc804\uccb4 \uacf5\uac1c Rules\uac00 \uc788\uc2b5\ub2c8\ub2e4. \uc804\uccb4 \uaddc\uce59\uc744 \uba3c\uc800 \ud655\uc778\ud574 \uc8fc\uc138\uc694.');
    if(Object.keys(current.rules).some(k=>k.startsWith('$')))throw Error('\ucd5c\uc0c1\uc704 \uc640\uc77c\ub4dc\uce74\ub4dc Rules\uac00 \uc788\uc5b4 \uc790\ub3d9 \ubcc0\uacbd\uc744 \uc911\uc9c0\ud588\uc2b5\ub2c8\ub2e4.');
    const result=JSON.parse(JSON.stringify(current));
    for(const key of NODES){
      const parent=result.rules[key]||{};
      if(typeof parent!=='object'||Array.isArray(parent))throw Error(key+' Rules must be an object.');
      if(Object.keys(parent).some(k=>k.startsWith('$'))||['.read','.write'].some(k=>parent[k]!==undefined&&parent[k]!==false))throw Error(key+' \uc0c1\uc704 \ub610\ub294 \uc640\uc77c\ub4dc\uce74\ub4dc \uaddc\uce59\uc744 \uba3c\uc800 \ud655\uc778\ud574 \uc8fc\uc138\uc694.');
      if(!patch?.rules?.[key]?.[TRIP])throw Error('Missing patch: '+key);
      result.rules[key]={...parent,[TRIP]:JSON.parse(JSON.stringify(patch.rules[key][TRIP]))};
    }
    return result;
  }
  root.mergeFinanceRules=mergeFinanceRules;
  if(typeof module!=='undefined'&&module.exports)module.exports={mergeFinanceRules};
})(typeof window!=='undefined'?window:globalThis);
