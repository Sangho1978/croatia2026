/* MIX35 FINAL: one UI only. Adds functional zone identity and Fold-friendly behavior without changing data/functions. */
(function(){
  'use strict';
  const zones={
    travel:['today','schedule','guide','hotels','weatherDetail','route','toilets','apps','videos','shopfood'],
    operations:['location','group','check','study','photos','expenses','members'],
    safety:['news','emergency'],
    info:['more']
  };
  const labels={travel:'TRAVEL',operations:'GROUP · OPERATIONS',safety:'SAFETY',info:'INFO'};
  function applyZones(){
    for(const [zone,ids] of Object.entries(zones)) ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;el.dataset.zone=zone;el.dataset.zoneLabel=labels[zone]});
  }
  function cleanLegacy(){
    document.documentElement.removeAttribute('data-ui-mode');
    try{localStorage.removeItem('cro.ui.mode')}catch(_){}
  }
  function foldHints(){
    const wide=matchMedia('(min-width:600px)').matches;
    document.documentElement.dataset.wide=wide?'true':'false';
  }
  function activeTabIntoView(){
    document.querySelector('#dayTabs .tab.active')?.scrollIntoView?.({block:'nearest',inline:'nearest'});
  }
  function init(){
    cleanLegacy();applyZones();foldHints();
    addEventListener('resize',foldHints,{passive:true});
    addEventListener('orientationchange',()=>setTimeout(foldHints,120),{passive:true});
    document.getElementById('dayTabs')?.addEventListener('click',()=>setTimeout(activeTabIntoView,40));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();