/* MIX36: consistent daily route maps + mobile/fold UX repair. */
(function(){
  'use strict';
  const P=window.CRO_ROUTE_POINTS||{};
  const maps=new Map();
  const polls=new Map();

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function stateEl(i){return document.getElementById('scheduleRouteState-'+i)}
  function mapEl(i){return document.getElementById('scheduleRouteMap-'+i)}
  function setState(i,msg){const e=stateEl(i);if(e)e.textContent=msg||''}

  function panelMarkup(d,i){
    const pts=P[d.date]||[];
    const stops=pts.map((p,n)=>`<span class="journey-stop"><i>${n+1}</i><span>${esc(p.n)}</span></span>`).join('');
    const mapAction=d.map?`<a class="primary" href="${esc(d.map)}" target="_blank" rel="noopener">Google 지도에서 전체 동선</a>`:'';
    return `<section class="schedule-route-panel" data-route-date="${esc(d.date)}" aria-label="${esc(d.date)} 이동동선">
      <div class="journey-heading"><div><small>${esc(d.date.slice(5).replace('-','/'))} · ROUTE</small><b>${esc(d.title)}</b></div><span class="map-badge">Google Maps</span></div>
      <div class="schedule-route-map-wrap"><div id="scheduleRouteMap-${i}" class="schedule-route-map" aria-label="${esc(d.title)} 지도"></div><div id="scheduleRouteState-${i}" class="schedule-route-state">지도를 준비하고 있습니다.</div></div>
      <div class="journey-stops">${stops}</div>
      <div class="schedule-route-actions">${mapAction}</div>
    </section>`;
  }

  function mount(){
    const panels=[...document.querySelectorAll('#dayPanels .panel')];
    panels.forEach((panel,i)=>{
      if(panel.querySelector('.schedule-route-panel')||!days?.[i])return;
      const summary=panel.querySelector('.day-summary');
      const host=document.createElement('div');host.innerHTML=panelMarkup(days[i],i);
      const route=host.firstElementChild;
      if(summary) summary.insertAdjacentElement('afterend',route); else panel.prepend(route);
    });
  }

  function offlinePlaceholder(i){
    const box=mapEl(i); if(!box)return;
    box.innerHTML='<div class="offline-map-placeholder compact"><b>지도는 인터넷 연결이 필요합니다.</b><span>아래 방문 순서와 일정은 오프라인에서도 확인할 수 있습니다.</span></div>';
    setState(i,'');
  }

  function render(i){
    const d=days?.[i], box=mapEl(i); if(!d||!box)return true;
    const pts=P[d.date]||[];
    if(navigator.onLine===false && !window.google?.maps){offlinePlaceholder(i);return true;}
    if(!window.google?.maps){setState(i,'Google 지도 연결 중…');return false;}
    if(!pts.length){setState(i,'표시할 이동동선이 없습니다.');return true;}
    if(maps.has(i)){
      setState(i,'');
      try{google.maps.event.trigger(maps.get(i),'resize')}catch(_){ }
      return true;
    }
    box.innerHTML='';
    const m=new google.maps.Map(box,{center:{lat:pts[0].lat,lng:pts[0].lng},zoom:8,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative',clickableIcons:false});
    maps.set(i,m);
    const bounds=new google.maps.LatLngBounds();
    pts.forEach((p,n)=>{
      const pos={lat:p.lat,lng:p.lng};bounds.extend(pos);
      const marker=new google.maps.Marker({position:pos,map:m,label:String(n+1),title:p.n});
      const info=new google.maps.InfoWindow({content:`<b>${esc(p.n)}</b>`});
      marker.addListener('click',()=>info.open({anchor:marker,map:m}));
    });
    if(pts.length>1){
      new google.maps.Polyline({path:pts.map(p=>({lat:p.lat,lng:p.lng})),geodesic:true,strokeColor:'#1769aa',strokeOpacity:.88,strokeWeight:4,map:m});
      m.fitBounds(bounds,38);
    }else{m.setCenter({lat:pts[0].lat,lng:pts[0].lng});m.setZoom(11)}
    setState(i,'');
    return true;
  }

  function ensure(i){
    if(!Number.isInteger(i)||i<0)return;
    if(render(i))return;
    try{if(typeof window.locLoadGoogleMap==='function')window.locLoadGoogleMap()}catch(_){ }
    if(polls.has(i))return;
    let tries=0;
    const t=setInterval(()=>{
      tries++;
      if(render(i)||tries>=40){clearInterval(t);polls.delete(i);if(tries>=40&&!window.google?.maps)setState(i,'Google 지도 연결이 지연됩니다. 방문 순서와 전체 동선 버튼을 이용하세요.');}
    },500);
    polls.set(i,t);
  }

  function activeIndex(){return [...document.querySelectorAll('#dayPanels .panel')].findIndex(p=>p.classList.contains('active'))}
  function scheduleVisible(){return document.getElementById('schedule')?.classList.contains('app-view-active')||location.hash==='#schedule'}
  function ensureActive(){if(scheduleVisible())setTimeout(()=>ensure(activeIndex()),70)}

  function bind(){
    const tabs=document.getElementById('dayTabs');
    tabs?.addEventListener('click',()=>setTimeout(ensureActive,90));
    window.addEventListener('cro-route',e=>{if(e.detail?.view==='schedule')ensureActive()});
    window.addEventListener('online',ensureActive);
    window.addEventListener('resize',()=>{const i=activeIndex();if(i>=0&&maps.has(i)){try{google.maps.event.trigger(maps.get(i),'resize')}catch(_){}}},{passive:true});
  }
  function init(){mount();bind();ensureActive()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
