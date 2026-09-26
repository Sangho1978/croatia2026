/* MIX09: one canonical formatter for Croatia + Korea timestamps. No network access. */
(function(){
  'use strict';
  const CRO=(window.GSPA_TRIP_TIMEZONE||window.GSPA_TRIP_TIMEZONE||'Europe/Zagreb'), KOR='Asia/Seoul';
  const cache=new Map();
  function parts(ts,zone){
    const key=zone+'|long';
    if(!cache.has(key))cache.set(key,new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
    const p=cache.get(key).formatToParts(new Date(Number(ts)||Date.now()));
    const g=t=>p.find(x=>x.type===t)?.value||'';
    return {year:g('year'),month:g('month'),day:g('day'),hour:g('hour'),minute:g('minute'),second:g('second')};
  }
  function full(ts,zone){const p=parts(ts,zone);return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;}
  function short(ts,zone){const p=parts(ts,zone);return `${p.month}/${p.day} ${p.hour}:${p.minute}`;}
  function dual(ts){const n=Number(ts)||Date.now();return {epoch:n,croatia:full(n,CRO),korea:full(n,KOR),croatiaShort:short(n,CRO),koreaShort:short(n,KOR)};}
  function label(ts){const d=dual(ts);return `현지 ${d.croatiaShort} · 한국 ${d.koreaShort}`;}
  function stored(ts){const d=dual(ts);return {epoch:d.epoch,croatia:d.croatia,korea:d.korea};}
  window.AppTime={CROATIA_ZONE:CRO,KOREA_ZONE:KOR,dual,label,stored,full,short};
})();
