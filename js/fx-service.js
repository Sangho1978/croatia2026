/* MIX11: Hana Bank EUR/KRW base-rate service.
 * Priority: optional server endpoint -> public Hana-published market page mirror -> bundled last verified Hana snapshot.
 * Never relabel ECB/market rates as Hana Bank rates.
 * The browser checks every 15 minutes while visible; bank publication itself may not change that often.
 */
(function(){
  'use strict';
  const KEY='cro.fx.hana.v11', REFRESH=60*60*1000, RETRY=2*60*1000;
  const MIRROR='https://r.jina.ai/https://www.etoday.co.kr/market/exchange-rates?varCurCd=EUR';
  const LOCAL='data/hana-eur.json';
  let value=null,mode='empty',attempt=0,lastError='',inFlight=null,log=[];
  function num(v){const n=typeof v==='number'?v:Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:null}
  function valid(x){
    const r=num(x?.rate??x?.baseRate);if(!x||r===null||r<900||r>2500)return false;
    const d=x.asOf||x.date;if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;
    return true;
  }
  function normalize(x,provider,source){
    if(!x)return null;const r=num(x.rate??x.baseRate),d=x.asOf||x.date;
    const out={rate:r,baseRate:r,asOf:d,date:d,announcedAt:x.announcedAt||x.time||'',round:num(x.round),checkedAt:Date.now(),provider,source:source||x.source||'하나은행',sourceUrl:x.sourceUrl||''};
    if(!valid(out))throw Error('하나은행 EUR 매매기준율 응답 형식 확인 필요');return out;
  }
  function koreaYear(){return +new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date())}
  function textOf(raw){
    if(!raw)return ''; if(!/[<>]/.test(raw))return raw.replace(/\s+/g,' ').trim();
    try{const d=new DOMParser().parseFromString(raw,'text/html');d.querySelectorAll('script,style,noscript').forEach(x=>x.remove());return (d.body?.textContent||raw).replace(/\s+/g,' ').trim()}catch(_){return raw.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
  }
  function parsePublishedPage(raw){
    const t=textOf(raw);if(!/하나은행/.test(t)||!/(유로\s*EUR|EUR\s*유로|유럽.*유로)/i.test(t))throw Error('하나은행 EUR 표기를 찾지 못했습니다.');
    let m=t.match(/유로\s*EUR\s*([\d,]+(?:\.\d+)?)/i)||t.match(/EUR\s*([\d,]+(?:\.\d+)?)/i);
    if(!m)throw Error('EUR 매매기준율을 찾지 못했습니다.');
    const rate=num(m[1]);if(rate===null||rate<900||rate>2500)throw Error('EUR 환율 범위를 확인해 주세요.');
    const stamp=t.match(/(\d{2})\.(\d{2})\s+(\d{2}:\d{2})\s+하나은행\s*고시회차\s*(\d+)\s*회/i);
    let asOf='',announcedAt='',round=null;
    if(stamp){const y=koreaYear();asOf=`${y}-${stamp[1]}-${stamp[2]}`;announcedAt=stamp[3];round=+stamp[4]}
    if(!asOf){const d=t.match(/(20\d{2})[-./](\d{2})[-./](\d{2})/);if(d)asOf=`${d[1]}-${d[2]}-${d[3]}`}
    if(!asOf)throw Error('하나은행 고시 기준일을 확인하지 못했습니다.');
    return normalize({rate,asOf,announcedAt,round,sourceUrl:'https://www.etoday.co.kr/market/exchange-rates?varCurCd=EUR'},'hana-public-mirror','하나은행 고시 · 공개페이지 중계');
  }
  try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(x)){value=x;mode='cached'}}catch(_){ }
  function set(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
  function localTime(t){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(t))}
  function ageDays(){return value?Math.floor((Date.now()-Date.parse(value.asOf+'T00:00:00+09:00'))/86400000):null}
  function sourceDetail(){if(!value)return '하나은행 EUR 매매기준율';const r=value.round?` · ${value.round}회`:'';const t=value.announcedAt?` ${value.announcedAt}`:'';return `하나은행 · ${value.asOf.slice(5).replace('-','/')} ${t}${r}`.replace(/\s+/g,' ').trim()}
  function paint(){
    const rate=value?.rate,old=value&&ageDays()>4;
    set('liveFxMain',rate?`€1 = ₩${rate.toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'하나은행 환율 연결 대기');
    set('fxUpdated',value?sourceDetail():'하나은행 최신 고시 확인 중');
    set('fxSource',value?`하나은행 EUR 매매기준율 · ${mode==='snapshot'?'저장 스냅샷':'1시간 자동 확인'}`:'하나은행 EUR 매매기준율');
    let status='';
    if(mode==='loading')status='하나은행 최신 고시값 확인 중…';
    else if(mode==='error')status=(value?'연결 실패 · 마지막 하나은행 확인값을 표시합니다. ':'하나은행 환율을 불러오지 못했습니다. ')+lastError;
    else if(mode==='offline')status='오프라인 · '+(value?'마지막 하나은행 확인값 표시':'저장된 하나은행 환율 없음');
    else status=(mode==='snapshot'?'내장된 마지막 확인값 · ':'조회 완료 · ')+(old?'기준일이 오래되었습니다. ':'')+'하나은행 매매기준율은 고시 회차에 따라 변경됩니다.';
    set('fxStatus',status);
    const checked=value?.checkedAt?localTime(value.checkedAt):'-';
    set('fxDiagnostics',log.length?log.map(x=>x.source+': '+x.message).join('\n'):`1시간 간격 확인 · 마지막 확인 ${checked}`);
    const b=document.getElementById('fxRefresh');if(b){b.disabled=mode==='loading';b.textContent=mode==='loading'?'확인 중…':'하나은행 환율 새로고침'}
    if(typeof updateGuidePrices==='function')updateGuidePrices(rate??null);
    window.dispatchEvent(new CustomEvent('cro-fx',{detail:state()}));
  }
  function state(){return {value:value?{...value}:null,mode,lastError,attempt,old:!!value&&ageDays()>4,log:log.map(x=>({...x}))}}
  async function getJsonEndpoint(url){
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),8000);try{const r=await fetch(url,{cache:'no-store',credentials:'omit',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return normalize(await r.json(),'hana-endpoint','하나은행 API/중계 endpoint')}finally{clearTimeout(timer)}
  }
  async function getMirror(){
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),8000);try{const r=await fetch(MIRROR,{cache:'no-store',credentials:'omit',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return parsePublishedPage(await r.text())}finally{clearTimeout(timer)}
  }
  async function getSnapshot(){const r=await fetch(LOCAL+'?v=20260920-MIX11',{cache:'no-store'});if(!r.ok)throw Error('내장 스냅샷 없음');const j=await r.json();return normalize(j,'hana-snapshot','하나은행 고시 · 내장 스냅샷')}
  async function refresh(force=false){
    if(inFlight)return inFlight;if(!navigator.onLine){if(!value){try{const v=await getSnapshot();value=v;try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}}catch(_){}}mode='offline';paint();return state()}if(document.hidden&&!force)return state();
    const now=Date.now();if(force&&now-attempt<7000&&mode!=='empty')return state();if(!force&&value&&now-value.checkedAt<REFRESH&&mode!=='error'&&mode!=='offline'&&mode!=='snapshot'){paint();return state()}if(!force&&mode==='error'&&now-attempt<RETRY)return state();
    attempt=now;mode='loading';lastError='';log=[];paint();
    inFlight=(async()=>{
      const endpoint=(typeof HANA_FX_ENDPOINT==='string'?HANA_FX_ENDPOINT.trim():'');
      if(endpoint){try{const v=await getJsonEndpoint(endpoint);value=v;mode='ready';log.push({source:'하나은행 endpoint',message:`정상 · ${sourceDetail()}`});localStorage.setItem(KEY,JSON.stringify(v));paint();return state()}catch(e){log.push({source:'하나은행 endpoint',message:e.name==='AbortError'?'시간 초과':e.message||'오류'})}}
      try{const v=await getMirror();value=v;mode='ready';log.push({source:'공개페이지 중계',message:`정상 · ${sourceDetail()}`});localStorage.setItem(KEY,JSON.stringify(v));paint();return state()}catch(e){log.push({source:'공개페이지 중계',message:e.name==='AbortError'?'시간 초과':'조회 실패 · '+(e.message||'오류')})}
      try{const v=await getSnapshot();if(!value||v.asOf>=value.asOf)value=v;mode='snapshot';log.push({source:'내장 스냅샷',message:`사용 · ${sourceDetail()}`});if(value)localStorage.setItem(KEY,JSON.stringify(value));paint();return state()}catch(e){log.push({source:'내장 스냅샷',message:e.message||'오류'})}
      mode='error';lastError='하나은행 공식/중계 연결 설정을 확인해 주세요.';paint();return state();
    })();try{return await inFlight}finally{inFlight=null}
  }
  window.FxService={refresh,get state(){return state()},paint,parsePublishedPage};
  document.addEventListener('click',e=>{if(e.target.closest('#fxRefresh'))refresh(true)});
  document.addEventListener('DOMContentLoaded',()=>{paint();refresh(false);setInterval(()=>{if(!document.hidden)refresh(false)},60000)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});window.addEventListener('online',()=>refresh(false));window.addEventListener('offline',()=>{mode='offline';paint()});window.addEventListener('pageshow',()=>refresh(false));
})();
