
(function(){
  const meta={
    today:['TODAY','오늘 필요한 정보부터 빠르게'],
    weatherDetail:['WEATHER','시간대별 기온·강수·바람 확인'],
    route:['JOURNEY','전체 이동 흐름을 먼저 파악'],
    schedule:['ITINERARY','날짜 선택 후 동선부터 관광지까지 한 흐름'],
    guide:['GUIDE','역사와 도시 이야기를 현장에서 읽기'],
    hotels:['STAY','숙박지 위치와 기본 정보'],
    team:['TEAM','조별 구성·연락처를 한눈에'],
    videos:['VIDEO','이동 전 짧게 보는 사전답사'],
    location:['LIVE LOCATION','조별·개인별 최근 위치 확인'],
    attendance:['CHECK-IN','28명 실시간 집결·탑승 확인'],
    check:['PREPARATION','출발 전 챙길 것과 준비할 것']
  };
  function buildHeaders(){
    Object.entries(meta).forEach(([id,[eyebrow,sub]])=>{
      const sec=document.getElementById(id); if(!sec||sec.querySelector(':scope > .section-heading')) return;
      const h=sec.querySelector(':scope > h2'); if(!h) return;
      const wrap=document.createElement('div'); wrap.className='section-heading';
      const main=document.createElement('div'); main.className='section-heading-main';
      const e=document.createElement('div'); e.className='section-eyebrow'; e.textContent=eyebrow;
      const sn=document.createElement('div'); sn.className='section-sub'; sn.textContent=sub;
      h.parentNode.insertBefore(wrap,h); main.appendChild(e); main.appendChild(h); main.appendChild(sn); wrap.appendChild(main);
    });
  }
  function navObserver(){
    if(document.querySelector('.bottom .app-nav-btn')) return;
    const links=[...document.querySelectorAll('.bottom a[href^="#"]')];
    const byId=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
    const sections=[...byId.keys()].map(id=>document.getElementById(id)).filter(Boolean);
    const setActive=(id)=>{links.forEach(a=>a.classList.toggle('is-active',a===byId.get(id)));const a=byId.get(id);if(a)a.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});};
    const io=new IntersectionObserver(entries=>{
      const vis=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(vis)setActive(vis.target.id);
    },{rootMargin:'-18% 0px -68% 0px',threshold:[0,.08,.2]});
    sections.forEach(s=>io.observe(s));
    links.forEach(a=>a.addEventListener('click',()=>setActive(a.getAttribute('href').slice(1))));
    setActive((location.hash||'#today').slice(1));
  }
  function topButton(){
    const b=document.createElement('button');b.className='mobile-top-btn';b.type='button';b.setAttribute('aria-label','맨 위로');b.textContent='↑';
    b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});document.body.appendChild(b);
    window.addEventListener('scroll',()=>b.classList.toggle('show',window.scrollY>850),{passive:true});
  }
  function externalLinks(){
    document.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer'});
  }
  function collapseOtherInlineDetails(){
    document.addEventListener('toggle',e=>{
      const d=e.target;if(!(d instanceof HTMLDetailsElement)||!d.classList.contains('inline-attraction-detail')||!d.open)return;
      const scope=d.closest('.day-attraction-grid')||d.closest('.attraction-list')||document;
      scope.querySelectorAll('details.inline-attraction-detail[open]').forEach(x=>{if(x!==d)x.open=false});
    },true);
  }
  document.addEventListener('DOMContentLoaded',()=>{buildHeaders();navObserver();topButton();externalLinks();collapseOtherInlineDetails();});
})();
