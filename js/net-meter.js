/* MIX06: cumulative request/response BODY estimate in this browser.
 * Not carrier usage: excludes map tiles, third-party apps, SSE streams, TLS, HTML/CSS/JS.
 * Totals begin when MIX06 is first opened; storage errors degrade to session-only.
 */
(function(){
  'use strict';
  const nativeFetch=window.fetch.bind(window),encoder=new TextEncoder(),KEY='cro.traffic.cumulative.v6';
  const totals={sent:0,received:0,requests:0};let persisted={sent:0,received:0,requests:0},saved=null,flushTimer=0,paintQueued=false,storageOK=true;
  const empty=()=>({sent:0,received:0,requests:0,since:Date.now()});
  function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&['sent','received','requests','since'].every(k=>Number.isFinite(v[k])&&v[k]>=0)?v:empty()}catch(_){storageOK=false;return empty()}}
  saved=read();
  function bytes(x){if(x==null)return 0;if(typeof x==='string')return encoder.encode(x).byteLength;if(x instanceof URLSearchParams)return encoder.encode(x.toString()).byteLength;if(x instanceof Blob)return x.size;if(x instanceof ArrayBuffer)return x.byteLength;return 0}
  function cumulative(){const b=saved||empty();return {sent:b.sent+totals.sent-persisted.sent,received:b.received+totals.received-persisted.received,requests:b.requests+totals.requests-persisted.requests,since:b.since}}
  function pretty(b){return b>=1048576?(b/1048576).toFixed(2)+' MB':(b/1024).toFixed(1)+' KB'}
  function flush(){
    clearTimeout(flushTimer);flushTimer=0;
    const delta={sent:totals.sent-persisted.sent,received:totals.received-persisted.received,requests:totals.requests-persisted.requests};
    if(!delta.sent&&!delta.received&&!delta.requests)return;
    const latest=storageOK?read():saved;const next={...latest,sent:latest.sent+delta.sent,received:latest.received+delta.received,requests:latest.requests+delta.requests};
    try{localStorage.setItem(KEY,JSON.stringify(next))}catch(_){storageOK=false}
    saved=next;persisted={...totals};paint();
  }
  function paint(){
    const c=cumulative(),b=c.sent+c.received,e=document.getElementById('trafficTotal');
    if(e)e.textContent='\ub370\uc774\ud130\uc0ac\uc6a9\ub204\uc801 '+pretty(b);
    window.dispatchEvent(new CustomEvent('cro-traffic',{detail:{...c,total:b,session:totals.sent+totals.received,storageOK}}));
  }
  function changed(){if(!paintQueued){paintQueued=true;queueMicrotask(()=>{paintQueued=false;paint()})}if(!flushTimer)flushTimer=setTimeout(flush,600)}
  window.fetch=async function(input,options){
    let url='';try{url=typeof input==='string'?input:input.url||String(input)}catch(_){}
    const track=/firebasedatabase\.app|firebaseio\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|open-meteo\.com|frankfurter\.(app|dev)|open\.er-api\.com|cloudfunctions\.net|run\.app/.test(url);
    if(track){totals.sent+=bytes(options?.body);totals.requests++;changed()}
    const res=await nativeFetch(input,options);
    if(track){res.clone().arrayBuffer().then(b=>{totals.received+=b.byteLength;changed()}).catch(()=>{})}
    return res;
  };
  window.AppTraffic={totals,paint,flush,get cumulative(){return cumulative()},description:()=>{
    const c=cumulative();return '\ub370\uc774\ud130\uc0ac\uc6a9\ub204\uc801 '+pretty(c.sent+c.received)+'\nMIX06 \uc801\uc6a9 \uc774\ud6c4, \uc774 \ube0c\ub77c\uc6b0\uc800 \uae30\uc900\n\uc9d1\uacc4 \uc2dc\uc791 '+new Date(c.since).toLocaleString('ko-KR')+'\n\uc694\uccad '+c.requests+'\ud68c \u00b7 \uc774\ubc88 \uc811\uc18d '+pretty(totals.sent+totals.received)+'\n\uc1a1\uc2e0 '+pretty(c.sent)+' / \uc218\uc2e0 '+pretty(c.received)+'\n\n\uc571 fetch \uc694\uccad\u00b7\uc751\ub2f5 \ubcf8\ubb38 \ucd94\uc815\uce58\uc785\ub2c8\ub2e4. SSE \uc2a4\ud2b8\ub9bc\uc740 \uc81c\uc678\ub429\ub2c8\ub2e4. \uc9c0\ub3c4 \ud0c0\uc77c\u00b7\ud1b5\uc2e0 \ud5e4\ub354\u00b7TLS\u00b7HTML/CSS/JS\u00b7\uc678\ubd80 \uc571 \uc0ac\uc6a9\ub7c9\uc740 \ud3ec\ud568\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. \ud1b5\uc2e0\uc0ac \uccad\uad6c\ub7c9\uacfc \ub2e4\ub985\ub2c8\ub2e4.\n\ube0c\ub77c\uc6b0\uc800 \ubcc0\uacbd/\uc0ac\uc774\ud2b8 \ub370\uc774\ud130 \uc0ad\uc81c \uc2dc \uc774\uc5b4\uc9c0\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.'+(storageOK?'':'\n\uc800\uc7a5\uc18c \ucc28\ub2e8: \uc774\ubc88 \uc811\uc18d\uc5d0\uc11c\ub9cc \uc9d1\uacc4');
  }};
  document.addEventListener('DOMContentLoaded',paint);
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
  window.addEventListener('storage',e=>{if(e.key===KEY){saved=read();paint()}});
})();
