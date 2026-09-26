/* MIX01 routing: keep legacy anchors, one app, two group tabs. */
(function(){
  document.body.classList.add('spa-mode');
  let current='today',sub='',sheetOpen=false,returnFocus=null;
  const positions=new Map();
  const views=()=>[...document.querySelectorAll('main > section.app-view')];
  function canonical(view,detail=''){
    if(view==='map')return ['location',detail];
    if(view==='guidebook')return ['more',''];
    if(view==='attendance')return ['group','attendance'];
    if(view==='team'||view==='people')return ['group','people'];
    if(view==='group')return ['group',detail==='people'?'people':'attendance'];
    return [view,detail];
  }
  function parse(){
    const parts=decodeURIComponent(location.hash.replace(/^#\/?/,'' )).split('/').filter(Boolean);
    let [view,detail='']=parts;
    if(!view)return ['today',''];
    [view,detail]=canonical(view,detail);
    if(views().some(e=>e.id===view))return [view,detail];
    const el=document.getElementById(view),parent=el?.closest('section.app-view');
    return parent?[parent.id,el.id]:['today',''];
  }
  function adjustMap(){
    if(typeof mapObj==='undefined'||!mapObj)return;
    setTimeout(()=>{
      if(mapObj.invalidateSize)mapObj.invalidateSize();
      else if(window.google?.maps)google.maps.event.trigger(mapObj,'resize');
    },180);
  }
  function activateGroup(tab){
    document.querySelectorAll('[data-group-pane]').forEach(e=>{
      const on=e.dataset.groupPane===tab;e.classList.toggle('group-pane-active',on);e.setAttribute('aria-hidden',String(!on));
    });
    document.querySelectorAll('[data-group-tab]').forEach(e=>{
      const on=e.dataset.groupTab===tab;e.setAttribute('aria-selected',String(on));e.tabIndex=on?0:-1;
    });
  }
  function showView(view,detail='',options={}){
    [view,detail]=canonical(view,detail);
    if(!views().some(e=>e.id===view))view='today';
    const before=current+'/'+sub;
    positions.set(before,window.scrollY);
    current=view;sub=detail;
    views().forEach(e=>{const on=e.id===view;e.classList.toggle('app-view-active',on);e.setAttribute('aria-hidden',String(!on))});
    document.body.dataset.currentView=view;
    document.querySelectorAll('.bottom [data-route]').forEach(e=>{const on=e.dataset.route===view;e.classList.toggle('is-active',on);if(on)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current')});
    document.getElementById('moreNavBtn')?.classList.toggle('is-active',!['today','schedule','location','group'].includes(view));
    closeMore(false);
    if(view==='group')activateGroup(detail==='people'?'people':'attendance');
    if(view==='schedule'&&/^\d{4}-\d{2}-\d{2}$/.test(detail)&&typeof days!=='undefined'){
      const i=days.findIndex(d=>d.date===detail);if(i>=0)selectDay(i);
    }
    const hash='#/'+view+(view==='group'?'/'+sub:(view==='schedule'&&detail?'/'+detail:''));
    if(location.hash!==hash)history[options.replace?'replaceState':'pushState'](null,'',hash);
    if(options.scroll!==false)requestAnimationFrame(()=>window.scrollTo({top:positions.get(view+'/'+sub)||0,behavior:'instant'}));
    if(detail&&view!=='group'&&view!=='schedule')requestAnimationFrame(()=>document.getElementById(detail)?.scrollIntoView({block:'start',behavior:'smooth'}));
    if(view==='location')adjustMap();
    window.dispatchEvent(new CustomEvent('cro-route',{detail:{view,sub}}));
  }
  function go(view,detail=''){showView(view,detail)}
  function openMore(){
    const b=document.getElementById('appMoreBackdrop');if(!b)return;
    returnFocus=document.activeElement;sheetOpen=true;
    b.classList.add('open');b.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    document.querySelector('main').inert=true;document.querySelector('nav.bottom').inert=true;document.querySelector('.mix-top').inert=true;
    b.querySelector('.app-sheet-close').focus();
  }
  function closeMore(focus=true){
    const b=document.getElementById('appMoreBackdrop');if(!b)return;
    b.classList.remove('open');b.setAttribute('aria-hidden','true');document.body.style.overflow='';
    document.querySelector('main').inert=false;document.querySelector('nav.bottom').inert=false;document.querySelector('.mix-top').inert=false;
    if(sheetOpen&&focus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});sheetOpen=false;
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('#moreNavBtn,.app-subbar-menu')){e.preventDefault();openMore();return}
    if(e.target.closest('.app-sheet-close')||e.target===document.getElementById('appMoreBackdrop')){closeMore();return}
    const tab=e.target.closest('[data-group-tab]');if(tab){showView('group',tab.dataset.groupTab,{scroll:false});return}
    const button=e.target.closest('[data-route]');if(button){e.preventDefault();go(button.dataset.route,button.dataset.sub||'');return}
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const id=a.getAttribute('href').replace(/^#\/?/,'');if(!id)return;
    const parts=id.split('/');const dest=canonical(parts[0],parts[1]||'');
    if(views().some(e=>e.id===dest[0])){e.preventDefault();go(...dest);return}
    const target=document.getElementById(id),sec=target?.closest('section.app-view');if(sec){e.preventDefault();go(sec.id,id)}
  });
  document.addEventListener('keydown',e=>{
    if(sheetOpen){
      if(e.key==='Escape'){e.preventDefault();closeMore()}
      if(e.key==='Tab'){
        const els=[...document.querySelectorAll('#appMoreSheet button')].filter(x=>!x.hidden&&x.offsetParent!==null);
        const first=els[0],last=els[els.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }else if(e.target.matches('[data-group-tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){
      e.preventDefault();const tab=e.target.dataset.groupTab==='people'?'attendance':'people';showView('group',tab,{scroll:false});document.querySelector('[data-group-tab="'+tab+'"]').focus();
    }
  });
  window.addEventListener('popstate',()=>showView(...parse(),{replace:true}));
  window.addEventListener('hashchange',()=>{const [v,d]=parse();if(v!==current||d!==sub)showView(v,d,{replace:true})});
  // Direct selection avoids legacy smooth document jumps, retains weather/inline detail data.
  window.selectDay=function(i){
    document.querySelectorAll('#dayTabs .tab').forEach((x,j)=>{x.classList.toggle('active',i===j);x.setAttribute('aria-selected',String(i===j))});
    document.querySelectorAll('#dayPanels .panel').forEach((x,j)=>x.classList.toggle('active',i===j));
    if(typeof loadDayWeather==='function')loadDayWeather(i);
    if(current==='schedule'&&days[i]){sub=days[i].date;history.replaceState(null,'','#/schedule/'+sub)}
  };
  window.AppRouter={go,showView,openMore,closeMore,get current(){return current},get sub(){return sub}};
  document.addEventListener('DOMContentLoaded',()=>{activateGroup('attendance');showView(...parse(),{replace:true,scroll:false})});
})();