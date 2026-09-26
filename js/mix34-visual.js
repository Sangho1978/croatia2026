/* MIX34: make visual mode genuinely different while sharing all data/functions. */
(function(){
  'use strict';
  const DATE_IMAGE={
    '2026-10-12':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-13':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-14':'assets/images/embedded_03_15d3ba61ec.jpg',
    '2026-10-15':'assets/images/embedded_04_04e59957ea.jpg',
    '2026-10-16':'assets/images/embedded_05_931c47baf8.jpg',
    '2026-10-17':'assets/images/embedded_05_931c47baf8.jpg',
    '2026-10-18':'assets/images/embedded_06_4c10f14f07.jpg',
    '2026-10-19':'assets/images/embedded_01_74401fc172.jpg'
  };
  const CITY_IMAGE={
    '#city-dubrovnik':'assets/images/embedded_03_15d3ba61ec.jpg',
    '#city-split':'assets/images/embedded_04_04e59957ea.jpg',
    '#city-trogir':'assets/images/embedded_04_04e59957ea.jpg',
    '#city-zadar':'assets/images/embedded_05_931c47baf8.jpg',
    '#city-plitvice':'assets/images/embedded_05_931c47baf8.jpg',
    '#city-zagreb':'assets/images/embedded_05_931c47baf8.jpg',
    '#city-rome':'assets/images/embedded_06_4c10f14f07.jpg',
    '#city-orvieto':'assets/images/embedded_06_4c10f14f07.jpg',
    '#city-assisi':'assets/images/embedded_07_7f488a7a9d.jpg',
    '#city-civita':'assets/images/embedded_08_c24458c789.jpg'
  };
  const esc=s=>String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  function schedule(){
    const panels=[...document.querySelectorAll('#dayPanels>.panel')];
    if(typeof days==='undefined'||!panels.length)return;
    panels.forEach((panel,i)=>{
      const d=days[i];if(!d)return;
      panel.dataset.date=d.date;
      panel.style.setProperty('--visual-day-image',`url('${DATE_IMAGE[d.date]||DATE_IMAGE['2026-10-13']}')`);
      const summary=panel.querySelector('.day-summary');
      if(summary&&!summary.querySelector('.visual-day-eyebrow')){
        const eye=document.createElement('div');eye.className='visual-day-eyebrow';eye.innerHTML=`<span>${esc(d.date.slice(5).replace('-','/'))}</span><b>${esc((d.flow||[]).slice(0,3).join(' · ')||d.title)}</b>`;summary.prepend(eye);
      }
      const cards=[...panel.querySelectorAll('.day-attraction-card')], data=((typeof DAY_ATTRACTIONS!=='undefined'&&DAY_ATTRACTIONS[d.date])||[]);
      cards.forEach((card,j)=>{
        if(card.querySelector('.visual-attraction-photo'))return;
        const item=data[j]||{},src=CITY_IMAGE[item.a]||DATE_IMAGE[d.date];if(!src)return;
        const media=document.createElement('div');media.className='visual-attraction-photo';media.innerHTML=`<img src="${esc(src)}" alt="" loading="lazy" decoding="async"><span>${String(j+1).padStart(2,'0')}</span>`;
        card.prepend(media);
      });
    });
  }
  function guide(){
    document.querySelectorAll('#guide article.city-guide').forEach(a=>{
      const d=a.querySelector(':scope > .inside > details.read-more');
      if(d)d.dataset.visualManaged='1';
    });
  }
  function apply(){
    schedule();guide();
    const visual=document.documentElement.dataset.uiMode==='visual';
    document.querySelectorAll('#guide article.city-guide > .inside > details.read-more[data-visual-managed="1"]').forEach(d=>{
      if(visual){d.open=true;d.dataset.openedByVisual='1'}
      else if(d.dataset.openedByVisual==='1'){d.open=false;delete d.dataset.openedByVisual}
    });
  }
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(apply));
  window.addEventListener('cro-ui-mode',()=>requestAnimationFrame(apply));
  window.addEventListener('cro-route',e=>{if(['schedule','guide'].includes(e.detail?.view))requestAnimationFrame(apply)});
})();
