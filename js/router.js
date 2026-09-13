
(function(){
  const primary=new Set(['today','schedule','location','attendance']);
  const allSections=()=>[...document.querySelectorAll('main > section[id].app-view')];
  const backdrop=()=>document.getElementById('appMoreBackdrop');
  const sheet=()=>document.getElementById('appMoreSheet');
  let currentView='today';

  function normalizeHash(){
    const raw=(location.hash||'').replace(/^#\/?/,'');
    if(!raw) return {view:'today',sub:''};
    const bits=raw.split('/').filter(Boolean);
    const first=bits[0];
    if(document.getElementById(first)?.classList.contains('app-view')) return {view:first,sub:bits.slice(1).join('/')};
    // legacy #section or nested anchor
    const el=document.getElementById(first);
    const sec=el?.closest?.('section.app-view');
    if(sec) return {view:sec.id,sub:first};
    return {view:'today',sub:''};
  }
  function routeHash(view,sub){return '#/'+view+(sub?'/'+sub:'')}
  function setNavActive(view){
    document.querySelectorAll('.bottom .app-nav-btn[data-route]').forEach(b=>b.classList.toggle('is-active',b.dataset.route===view));
    document.getElementById('moreNavBtn')?.classList.toggle('is-active',!primary.has(view));
  }
  function showView(view,sub,{replace=false,scroll=true}={}){
    const target=document.getElementById(view);
    if(!target||!target.classList.contains('app-view')) view='today';
    currentView=view;
    allSections().forEach(sec=>{
      const active=sec.id===view;
      sec.classList.toggle('app-view-active',active);
      sec.setAttribute('aria-hidden',active?'false':'true');
    });
    setNavActive(view); closeMore();
    if(view==='schedule' && sub && typeof days!=='undefined' && typeof selectDay==='function'){
      const idx=days.findIndex(d=>d.date===sub); if(idx>=0) selectDay(idx);
    }
    if(view==='location' && typeof locRefreshAll==='function') setTimeout(()=>locRefreshAll(false),80);
    if(view==='attendance' && typeof attRefresh==='function') setTimeout(()=>attRefresh(false),80);
    if(scroll){requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));}
    const desired=routeHash(view,sub && view==='schedule'?sub:'');
    if(location.hash!==desired){history[replace?'replaceState':'pushState'](null,'',desired);}
    // explicit nested anchor within a secondary view, only when user asked for it
    if(sub && view!=='schedule'){
      requestAnimationFrame(()=>{const el=document.getElementById(sub);if(el)el.scrollIntoView({block:'start',behavior:'smooth'});});
    }
  }
  function go(view,sub=''){showView(view,sub)}
  function openMore(){
    const bd=backdrop(); if(!bd)return; bd.classList.add('open');bd.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    setTimeout(()=>sheet()?.querySelector('button')?.focus(),40);
  }
  function closeMore(){const bd=backdrop();if(!bd)return;bd.classList.remove('open');bd.setAttribute('aria-hidden','true');document.body.style.overflow='';}

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-route]');
    if(nav && (nav.closest('.bottom')||nav.closest('.app-sheet')||nav.closest('.app-subbar'))){e.preventDefault();go(nav.dataset.route);return;}
    if(e.target.closest('#moreNavBtn')||e.target.closest('.app-subbar-menu')){e.preventDefault();openMore();return;}
    if(e.target.closest('.app-sheet-close')){closeMore();return;}
    if(e.target===backdrop()){closeMore();return;}
    const a=e.target.closest('a[href^="#"]');
    if(!a)return;
    const href=a.getAttribute('href');
    if(!href||href==='#')return;
    const id=href.slice(1);
    const sec=document.getElementById(id);
    if(sec?.classList.contains('app-view')){e.preventDefault();go(id);return;}
    const nested=document.getElementById(id);const parent=nested?.closest?.('section.app-view');
    if(parent){e.preventDefault();showView(parent.id,id);}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore()});
  window.addEventListener('popstate',()=>{const r=normalizeHash();showView(r.view,r.sub,{replace:true});});
  window.addEventListener('hashchange',()=>{const r=normalizeHash();if(r.view!==currentView)showView(r.view,r.sub,{replace:true});});

  // keep schedule URL in sync without scrolling the whole document
  if(typeof selectDay==='function'){
    const legacySelectDay=selectDay;
    selectDay=function(i){
      legacySelectDay(i);
      if(currentView==='schedule' && typeof days!=='undefined' && days[i]){
        history.replaceState(null,'',routeHash('schedule',days[i].date));
        document.querySelectorAll('#dayTabs .tab')[i]?.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
      }
    };
  }

  window.AppRouter={go,openMore,closeMore,showView};
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.classList.add('spa-mode');
    const bd=backdrop(); if(bd)bd.addEventListener('touchmove',e=>{if(e.target===bd)e.preventDefault()},{passive:false});
    const r=normalizeHash(); showView(r.view,r.sub,{replace:true,scroll:false});
  });
})();
