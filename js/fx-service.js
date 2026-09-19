/* MIX06: latest published EUR/KRW reference rates, NOT a live trading feed.
 * Sources: frankfurter.dev (ECB) / exchangerate-api.com open access.
 * No API key. Cache only a validated successful response; never invent a rate.
 */
(function(){
  'use strict';
  const KEY='cro.fx.reference.v6', HOUR=3600000, RETRY=300000;
  const supported=new Set(['ecb-v2','ecb-v1','er-open']);
  let value=null,mode='empty',attempt=0,lastError='',inFlight=null,log=[];
  const channels=[
    {id:'ecb-v2',label:'ECB / Frankfurter',url:'https://api.frankfurter.dev/v2/rate/eur/krw?providers=ecb',parse:j=>({rate:j.rate,asOf:j.date,base:j.base,quote:j.quote})},
    {id:'ecb-v1',label:'ECB / Frankfurter (v1)',url:'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=KRW',parse:j=>({rate:j.rates?.KRW,asOf:j.date,base:j.base,quote:'KRW'})},
    {id:'er-open',label:'ExchangeRate-API',url:'https://open.er-api.com/v6/latest/EUR',parse:j=>{
      if(j.result!=='success'||!Number.isFinite(j.time_last_update_unix))throw Error('Invalid provider response');
      return {rate:j.rates?.KRW,asOf:new Date(j.time_last_update_unix*1000).toISOString().slice(0,10),base:j.base_code,quote:'KRW'};
    }}
  ];
  function valid(x){
    if(!x||typeof x.rate!=='number'||!Number.isFinite(x.rate)||x.rate<=0)return false;
    if(typeof x.asOf!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.asOf))return false;
    const d=Date.parse(x.asOf+'T00:00:00Z');
    return Number.isFinite(d)&&new Date(d).toISOString().slice(0,10)===x.asOf&&d<=Date.now()+86400000;
  }
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(x)&&supported.has(x.provider)&&Number.isFinite(x.checkedAt)&&x.checkedAt<=Date.now()+60000){value=x;mode='cached'}}catch(_){}
  function set(id,text){const el=document.getElementById(id);if(el)el.textContent=text;}
  function time(t){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Europe/Zagreb',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(t)}
  function ageDays(){return value?Math.floor((Date.now()-Date.parse(value.asOf+'T00:00:00Z'))/86400000):null}
  function paint(){
    const rate=value?.rate,old=value&&ageDays()>4;
    set('liveFxMain',rate?'\u20ac1 = \u20a9'+rate.toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2}):'\ud658\uc728 \uc5f0\uacb0 \ub300\uae30');
    set('fxUpdated',value?'\uae30\uc900\uc77c '+value.asOf+'\n\uc218\uc2e0 '+time(value.checkedAt):'\uc815\uc0c1 \uc218\uc2e0\uac12 \uc5c6\uc74c');
    set('fxSource',value?value.source+(value.provider==='er-open'?' \u00b7 \ub300\uccb4 \ucd9c\ucc98':' \u00b7 \uae30\uc900\ud658\uc728'):'\ucd5c\uc2e0 EUR/KRW \uae30\uc900\ud658\uc728');
    const status=mode==='loading'?'\ucd5c\uc2e0 \uacf5\uc2dc\uac12 \uc870\ud68c \uc911\u2026':mode==='error'?(value?'\uc5f0\uacb0 \uc2e4\ud328 \u00b7 \ub9c8\uc9c0\ub9c9 \uc815\uc0c1 \uc218\uc2e0\uac12 \ud45c\uc2dc. ':'\uc5f0\uacb0 \uc2e4\ud328 \u00b7 \uc784\uc758 \ud658\uc728\uc740 \ud45c\uc2dc\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. ')+lastError:mode==='offline'?'\uc624\ud504\ub77c\uc778 \u00b7 '+(value?'\uc800\uc7a5\ub41c \ud658\uc728\uc785\ub2c8\ub2e4.':'\uc800\uc7a5\ub41c \ud658\uc728\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'):(mode==='cached'?'\uc800\uc7a5\ub41c \ucd5c\uadfc \uacf5\uc2dc\uac12 \u00b7 ':'\uc870\ud68c \uc644\ub8cc \u00b7 ')+(old?'\uae30\uc900\uc77c\uc774 \uc624\ub798\ub418\uc5c8\uc2b5\ub2c8\ub2e4. ':'')+'\ud558\ub8e8 \ub2e8\uc704 \uacf5\uc2dc\uac12\uc785\ub2c8\ub2e4. \ud734\uc77c\uc5d0\ub294 \uac19\uc740 \uac12\uc77c \uc218 \uc788\uc2b5\ub2c8\ub2e4.';
    set('fxStatus',status);
    set('fxDiagnostics',log.length?log.map(x=>x.source+': '+x.message).join('\n'):'\uc790\ub3d9 \ud655\uc778 1\uc2dc\uac04 \uac04\uaca9 \u00b7 \uc2e4\ud328 \uc2dc \ubcf4\uc870 \uacbd\ub85c\ub85c \uc804\ud658');
    const b=document.getElementById('fxRefresh');if(b){b.disabled=mode==='loading';b.textContent=mode==='loading'?'\ud655\uc778 \uc911\u2026':'\ud658\uc728 \uc0c8\ub85c\uace0\uce68'}
    // All guide conversions share this source; no separate guessed conversion.
    if(typeof updateGuidePrices==='function')updateGuidePrices(rate??null);
    window.dispatchEvent(new CustomEvent('cro-fx',{detail:state()}));
  }
  function state(){return {value:value?{...value}:null,mode,lastError,attempt,old:!!value&&ageDays()>4,log:log.map(x=>({...x}))}}
  async function get(channel){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),6000);
    try{
      const r=await fetch(channel.url,{method:'GET',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:ctrl.signal});
      if(!r.ok)throw Error('HTTP '+r.status);
      const j=await r.json(),v=channel.parse(j);
      if(!valid(v)||String(v.base).toUpperCase()!=='EUR'||String(v.quote).toUpperCase()!=='KRW')throw Error('Invalid EUR/KRW payload');
      if(value&&v.asOf<value.asOf)throw Error('Older reference date than saved value');
      return {...v,checkedAt:Date.now(),provider:channel.id,source:channel.label};
    }finally{clearTimeout(timer)}
  }
  async function refresh(force=false){
    if(inFlight)return inFlight;
    if(!navigator.onLine){mode='offline';paint();return state()}
    if(document.hidden&&!force)return state();
    const now=Date.now();
    if(force&&now-attempt<8000&&mode!=='empty'){return state()}
    if(!force&&value&&now-value.checkedAt<HOUR&&mode!=='error'&&mode!=='offline'){paint();return state()}
    if(!force&&mode==='error'&&now-attempt<RETRY)return state();
    attempt=now;mode='loading';log=[];lastError='';paint();
    inFlight=(async()=>{
      for(const c of channels){
        try{const v=await get(c);value=v;mode='ready';log.push({source:c.label,message:'\uc815\uc0c1 \uc218\uc2e0 \u00b7 '+v.asOf});try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}paint();return state()}
        catch(e){log.push({source:c.label,message:e.name==='AbortError'?'\uc751\ub2f5 \uc2dc\uac04 \ucd08\uacfc':e instanceof TypeError?'\ub124\ud2b8\uc6cc\ud06c/CORS \uc5f0\uacb0 \ud655\uc778':e.message||'\uc751\ub2f5 \uc624\ub958'});}
      }
      mode='error';lastError='\uc544\ub798 \ucd9c\ucc98\u00b7\uc5f0\uacb0 \ud655\uc778\uc5d0\uc11c \uc0c1\ud0dc\ub97c \ubcfc \uc218 \uc788\uc2b5\ub2c8\ub2e4.';paint();return state();
    })();
    try{return await inFlight}finally{inFlight=null}
  }
  window.FxService={refresh,get state(){return state()},paint};
  document.addEventListener('click',e=>{if(e.target.closest('#fxRefresh'))refresh(true)});
  document.addEventListener('DOMContentLoaded',()=>{paint();refresh(false);setInterval(()=>{if(!document.hidden)refresh(false)},60000)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
  window.addEventListener('online',()=>refresh(false));
  window.addEventListener('offline',()=>{mode='offline';paint()});
  window.addEventListener('pageshow',()=>{if(document.readyState==='complete')refresh(false)});
})();
