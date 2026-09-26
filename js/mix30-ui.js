/* MIX45: collapsible Today journey map. Google Maps online with local schematic fallback. */
(function(){
  'use strict';
  const ROUTE_POINTS=window.CRO_ROUTE_POINTS||{};
  let mapDate='';
  function operationalDay(){const d=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));if(d<days[0].date)return days[0];if(d>days[days.length-1].date)return days[days.length-1];return days.find(x=>x.date===d)||days[0]}
  function dayLabel(){const now=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));if(now<days[0].date)return'첫날 여행일정 보기';if(now>days[days.length-1].date)return'마지막 여행일정 보기';return'오늘 여행일정 보기'}
  function fillPanel(){const d=operationalDay(),label=document.getElementById('todayJourneyToggleLabel'),meta=document.getElementById('todayJourneySummary'),date=document.getElementById('todayJourneyDate'),title=document.getElementById('todayJourneyTitle'),stops=document.getElementById('todayJourneyStops'),link=document.getElementById('todayJourneyGoogleLink');if(label)label.textContent=dayLabel();if(meta)meta.textContent=d.route||d.title;if(date)date.textContent=d.date.slice(5).replace('-','/');if(title)title.textContent=d.title;if(link){link.href=d.map||'#schedule';link.hidden=!d.map}const pts=ROUTE_POINTS[d.date]||[];if(stops)stops.innerHTML=pts.map((p,i)=>`<span class="today-stop"><i>${i+1}</i>${p.n}</span>`).join('')}
  function setState(text){const e=document.getElementById('todayJourneyMapState');if(e)e.textContent=text||''}
  function render(){const box=document.getElementById('todayJourneyMap');if(!box||!window.GSPA_RouteMap)return;const d=operationalDay(),pts=ROUTE_POINTS[d.date]||[];mapDate=d.date;setState(navigator.onLine===false?'오프라인 동선도':'Google Maps 불러오는 중…');window.GSPA_RouteMap.render(box,pts,{label:d.title}).then(engine=>setState(engine==='google'?'Google Maps · 번호 순서':engine==='osm'?'OpenStreetMap 임시 표시 · Google Maps 자동 재시도':'오프라인 동선도')).catch(()=>setState('지도 연결 필요'))}
  function init(){fillPanel();const panel=document.getElementById('todayJourneyPanel');if(panel){panel.open=false;panel.addEventListener('toggle',()=>{if(panel.open){fillPanel();render()}})}window.addEventListener('hashchange',()=>{if(location.hash==='#today'||!location.hash){fillPanel();if(panel?.open)render()}});window.addEventListener('online',()=>{if(panel?.open)render()});setInterval(()=>{fillPanel();if(panel?.open&&mapDate!==operationalDay().date)render()},60000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
