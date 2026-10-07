/* MIX66: itinerary deduplication guard.
   The Schedule tab owns one numbered timeline. Location stays people-only. */
(function(){
  'use strict';
  function cleanPanel(panel){
    if(!panel)return;
    panel.querySelectorAll('.schedule-route-panel,.day-flow').forEach(x=>x.remove());

    const grid=panel.querySelector('.day-main-grid');
    const agenda=grid?.querySelector('.day-agenda-card');
    if(!grid||!agenda)return;

    const moveCard=[...grid.children].find(x=>x!==agenda && /이동시간/.test(x.querySelector('h3')?.textContent||''));
    if(moveCard){
      const list=moveCard.querySelector('.move-list');
      if(list && !agenda.querySelector('.day-move-details')){
        const count=list.querySelectorAll('.move-row').length;
        const det=document.createElement('details');
        det.className='day-move-details';
        det.innerHTML=`<summary><span>이동시간</span><small>${count}구간 · 필요할 때 펼쳐보기</small></summary>`;
        det.appendChild(list);
        agenda.appendChild(det);
      }
      moveCard.remove();
    }
  }
  function clean(){document.querySelectorAll('#dayPanels .panel').forEach(cleanPanel)}
  function init(){clean();document.getElementById('dayTabs')?.addEventListener('click',()=>setTimeout(clean,0));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
