/* MIX33 dual UI modes. Presentation only; all functions/data are shared. */
(function(){
  const KEY='cro.ui.mode';
  const HERO={
    '2026-10-12':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-13':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-14':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-15':'assets/images/embedded_04_04e59957ea.jpg',
    '2026-10-16':'assets/images/embedded_05_931c47baf8.jpg',
    '2026-10-17':'assets/images/embedded_05_931c47baf8.jpg',
    '2026-10-18':'assets/images/embedded_06_4c10f14f07.jpg',
    '2026-10-19':'assets/images/embedded_01_74401fc172.jpg'
  };
  function day(){try{return typeof localDate==='function'?localDate():new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(_){return '2026-10-13'}}
  function hero(){const d=day();const src=HERO[d]||HERO['2026-10-13'];document.documentElement.style.setProperty('--mix33-hero-image',`url('${src}')`)}
  function mode(){return document.documentElement.dataset.uiMode==='visual'?'visual':'field'}
  function icon(m){return m==='visual'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'}
  function paint(){const b=document.getElementById('uiModeToggle');if(!b)return;const m=mode();b.innerHTML=icon(m);b.setAttribute('aria-label',m==='visual'?'현장 운영형 화면으로 전환':'카드형 화면으로 전환');b.title=m==='visual'?'현장 운영형':'카드형';hero()}
  function set(m){m=m==='visual'?'visual':'field';document.documentElement.dataset.uiMode=m;try{localStorage.setItem(KEY,m)}catch(_){}paint();window.dispatchEvent(new CustomEvent('cro-ui-mode',{detail:{mode:m}}));}
  function init(){paint();document.getElementById('uiModeToggle')?.addEventListener('click',()=>{set(mode()==='visual'?'field':'visual');try{window.showAppToast?.(mode()==='visual'?'카드형 화면':'현장 운영형 화면')}catch(_){}});setInterval(hero,60000)}
  document.addEventListener('DOMContentLoaded',init);
  window.CroUIMode={get mode(){return mode()},set};
})();