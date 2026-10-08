/* MIX69: restore a compact route map inside Schedule without duplicating the itinerary.
   The Location tab remains people-only. Map marker numbers follow CRO_ROUTE_POINTS order. */
(function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routePoints=()=>window.CRO_ROUTE_POINTS||{};
  const dayList=()=>Array.isArray(window.days)?window.days:(typeof days!=='undefined'&&Array.isArray(days)?days:[]);

  function panelMarkup(d,i){
    const pts=routePoints()[d.date]||[];
    if(!pts.length)return '';
    const mapAction=d.map?`<a class="schedule-route-open" href="${esc(d.map)}" target="_blank" rel="noopener">Google Maps에서 보기</a>`:'';
    return `<section class="schedule-route-panel schedule-route-panel-compact" data-route-date="${esc(d.date)}" aria-label="${esc(d.date)} 일정 동선 지도">
      <div class="schedule-route-compact-head">
        <div><small>ROUTE</small><b>일정 동선</b><span>${esc(d.route||d.title||'')}</span></div>
        <em>번호는 시간순</em>
      </div>
      <div class="schedule-route-map-wrap">
        <div id="scheduleRouteMap-${i}" class="schedule-route-map" aria-label="${esc(d.title||'일정')} 동선 지도"></div>
        <div id="scheduleRouteState-${i}" class="schedule-route-state">동선 지도를 준비합니다.</div>
      </div>
      <div class="schedule-route-compact-foot"><span>지도 번호 1 → ${pts.length}</span>${mapAction}</div>
    </section>`;
  }
  function mapEl(i){return document.getElementById('scheduleRouteMap-'+i)}
  function stateEl(i){return document.getElementById('scheduleRouteState-'+i)}
  function setState(i,msg){const el=stateEl(i);if(el)el.textContent=msg||''}

  function mount(){
    const list=dayList();
    document.querySelectorAll('#dayPanels .panel').forEach((panel,i)=>{
      if(panel.querySelector('.schedule-route-panel-compact')||!list[i])return;
      const host=document.createElement('div');host.innerHTML=panelMarkup(list[i],i);
      const route=host.firstElementChild;if(!route)return;
      const weather=panel.querySelector('.day-weather-box');
      const agenda=panel.querySelector('.day-main-grid');
      if(weather)weather.insertAdjacentElement('afterend',route);
      else if(agenda)agenda.insertAdjacentElement('beforebegin',route);
      else panel.appendChild(route);
    });
  }

  async function render(i){
    const d=dayList()[i],box=mapEl(i);if(!d||!box||!window.GSPA_RouteMap)return;
    const pts=routePoints()[d.date]||[];
    if(!pts.length){setState(i,'표시할 이동지점이 없습니다.');return;}
    setState(i,navigator.onLine===false?'오프라인 동선도':'지도 불러오는 중…');
    try{
      const engine=await window.GSPA_RouteMap.render(box,pts,{label:d.title||d.route||'일정 동선'});
      setState(i,engine==='google'?'Google Maps · 번호는 시간순':engine==='osm'?'OpenStreetMap 표시 · 번호는 시간순':'오프라인 동선도 · 번호는 시간순');
    }catch(_){setState(i,'지도 연결이 필요합니다.');}
  }
  function activeIndex(){return [...document.querySelectorAll('#dayPanels .panel')].findIndex(p=>p.classList.contains('active'))}
  function scheduleVisible(){const el=document.getElementById('schedule');return !!(el?.classList.contains('app-view-active')||location.hash==='#schedule')}
  function ensureActive(){mount();const i=activeIndex();if(i>=0&&scheduleVisible())setTimeout(()=>render(i),80)}
  function bind(){
    document.getElementById('dayTabs')?.addEventListener('click',()=>setTimeout(ensureActive,100));
    window.addEventListener('cro-route',e=>{if(e.detail?.view==='schedule')setTimeout(ensureActive,60)});
    window.addEventListener('online',ensureActive);
    window.addEventListener('resize',()=>{const i=activeIndex();if(i>=0)window.GSPA_RouteMap?.invalidate(mapEl(i))},{passive:true});
  }
  function init(){mount();bind();ensureActive()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
