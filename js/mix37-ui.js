/* MIX37: normalize schedule summary after dynamic render. */
(function(){
  'use strict';
  function normalize(){
    document.querySelectorAll('#schedule .day-summary').forEach((box,idx)=>{
      box.setAttribute('data-mix37','flowfix');
      const flow=box.querySelector('.day-flow');
      if(flow){
        flow.setAttribute('role','list');
        flow.setAttribute('aria-label','오늘 일정 흐름');
        flow.querySelectorAll('.flow-stop').forEach(x=>x.setAttribute('role','listitem'));
      }
    });
  }
  function init(){normalize(); const tabs=document.getElementById('dayTabs'); tabs?.addEventListener('click',()=>setTimeout(normalize,0));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
