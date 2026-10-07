/* MIX64: daily schedule route is a compact chronological sequence.
   The main Location tab is reserved for people/location sharing. */
(function(){
  'use strict';
  const P=window.CRO_ROUTE_POINTS||{};
  const points=date=>window.GSPA_orderRoutePoints?window.GSPA_orderRoutePoints(P[date]||[]):[...(P[date]||[])].sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function stopMarkup(p,n){
    const meal=p.kind==='meal';
    const cls=meal?` meal-stop ${p.mealType==='중식'?'meal-lunch':p.mealType==='석식'?'meal-dinner':'meal-free'}`:'';
    return `<span class="journey-stop${cls}"><i>${n+1}</i><span>${esc(p.n)}</span></span>`;
  }
  function panelMarkup(d){
    const pts=points(d.date);
    const stops=pts.length?pts.map(stopMarkup).join(''):'<span class="journey-stop"><span>이동 순서 확인 중</span></span>';
    return `<section class="schedule-route-panel schedule-route-compact" data-route-date="${esc(d.date)}" aria-label="${esc(d.date)} 이동 순서"><div class="journey-heading"><div><small>${esc(d.date.slice(5).replace('-','/'))} · ROUTE · 시간순 번호</small><b>${esc(d.title)}</b></div><span class="route-seq-badge">시간순</span></div><div class="journey-stops">${stops}</div><div class="route-compact-note">지도 메뉴는 일행 위치 확인 전용입니다. 전체 이동경로는 ‘더보기 → 전체동선’에서 확인할 수 있습니다.</div></section>`;
  }
  function mount(){
    [...document.querySelectorAll('#dayPanels .panel')].forEach((panel,i)=>{
      if(!days?.[i])return;
      panel.querySelector('.schedule-route-panel')?.remove();
      const host=document.createElement('div');host.innerHTML=panelMarkup(days[i]);
      const route=host.firstElementChild,summary=panel.querySelector('.day-summary');
      if(summary)summary.insertAdjacentElement('afterend',route);else panel.prepend(route);
    });
  }
  function init(){mount()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
