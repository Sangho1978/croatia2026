/* Freeze/estimate KRW equivalents for EUR expenses using Hana Bank base-rate observations. */
(function(){
  'use strict';
  const KEY='cro.expense.hana.history.v1';
  let history={};try{history=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){history={}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(history))}catch(_){}}
  function ingest(v){if(!v||!v.asOf||!Number.isFinite(+v.rate))return;history[v.asOf]={rate:+v.rate,asOf:v.asOf,announcedAt:v.announcedAt||'',round:v.round||null,provider:v.provider||'hana',source:v.source||'하나은행 매매기준율',capturedAt:Date.now()};save()}
  function current(){const v=window.FxService?.state?.value;if(v)ingest(v);return v||null}
  function nearest(date){const keys=Object.keys(history).filter(d=>d<=date).sort().reverse();return keys.length?history[keys[0]]:null}
  async function endpointRate(date,time){
    const url=typeof HANA_FX_ENDPOINT==='string'?HANA_FX_ENDPOINT.trim():'';if(!url)return null;
    const sep=url.includes('?')?'&':'?';const q='currency=EUR&date='+encodeURIComponent(date)+(time?'&time='+encodeURIComponent(time):'');const ctrl=new AbortController(),tid=setTimeout(()=>ctrl.abort(),8000);
    try{const r=await fetch(url+sep+q,{cache:'no-store',credentials:'omit',signal:ctrl.signal});if(!r.ok)return null;const j=await r.json(),rate=+(j.baseRate??j.rate);const asOf=j.date||j.asOf||date;if(!Number.isFinite(rate)||rate<900||rate>2500)return null;const v={rate,asOf,announcedAt:j.announcedAt||j.time||'',round:j.round||null,provider:'hana-endpoint',source:j.source||'하나은행 매매기준율'};ingest(v);return v}finally{clearTimeout(tid)}
  }
  async function quote(date,time){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;
    if(history[date])return {...history[date],exact:true,basis:'해당일 하나은행 확인값'};
    try{const v=await endpointRate(date,time);if(v)return {...v,exact:v.asOf===date,basis:v.asOf===date?(time?'사용일·시각 기준 하나은행 조회값':'해당일 하나은행 조회값'):'하나은행 조회값'};}catch(_){ }
    const c=current();if(c&&c.asOf===date)return {...c,exact:true,basis:'해당일 하나은행 현재 고시'};
    const n=nearest(date);if(n)return {...n,exact:n.asOf===date,basis:n.asOf===date?'해당일 하나은행 확인값':'직전 확인 가능한 하나은행 고시로 추정'};
    if(c)return {...c,exact:false,basis:'현재 확인 가능한 하나은행 고시로 추정'};
    return null;
  }
  function krw(amount,rate){return Math.round((+amount||0)*(+rate||0))}
  window.ExpenseFx={quote,ingest,krw,get history(){return {...history}}};
  window.addEventListener('cro-fx',e=>ingest(e.detail?.value));
  document.addEventListener('DOMContentLoaded',()=>{const v=current();if(v)ingest(v)});
})();
