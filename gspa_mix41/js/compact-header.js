/* MIX08: explicit expand/collapse controls; MIX07 services and data are unchanged. */
(function(){
  'use strict';
  let queued=false,started=false;
  const $=id=>document.getElementById(id);
  function set(id,v){const e=$(id);if(e&&e.textContent!==v)e.textContent=v}
  function display(expand,focus=false){
    const header=document.querySelector('.compact-top'),panel=$('headerDetails'),b=$('headerToggle');if(!panel||!header||!b)return;
    if(!expand&&(focus||panel.contains(document.activeElement)))b.focus({preventScroll:true});
    const wasHidden=panel.hidden;panel.hidden=!expand;
    if(expand&&wasHidden)panel.scrollTop=0;
    header.dataset.expanded=String(expand);
    b.setAttribute('aria-expanded',String(expand));
    b.setAttribute('aria-label',expand?'\uc0c1\ub2e8 \uc815\ubcf4 \uc811\uae30':'\uc0c1\ub2e8 \uc815\ubcf4 \ud3bc\uce58\uae30');
    set('headerChevron',expand?'\u25b2':'\u25bc');
    set('headerAction',expand?'\uc811\uae30':'\ud3bc\uce58\uae30');
    document.querySelectorAll('.compact-top [data-header-open]').forEach(e=>{
      e.setAttribute('aria-controls','headerDetails');e.setAttribute('aria-expanded',String(expand));
    });
    document.documentElement.style.setProperty('--app-header-h',Math.ceil(header.getBoundingClientRect().height)+'px');
  }
  function mirror(){
    queued=false;
    const weather=$('liveWeatherMain')?.textContent||'',digits=weather.match(/(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?\u00b0/);
    const symbol=weather.match(/[\u2600\u2601\u26c8\u{1f324}\u{1f327}\u{1f328}\u{1f32b}]/u)?.[0]||'\u2601';
    set('briefWeather',digits?symbol+digits[1]+'\u00b0':'\u2601 \ub0a0\uc528');
    set('briefWeatherNote',/\ucc38\uace0|\uc608\uc0c1/.test(weather)?'\uc608\uc0c1\ub0a0\uc528':digits?'\ub0a0\uc528 \uc0c1\uc138':'\ud655\uc778 \uc911');
    const w=document.querySelector('.brief-weather');if(w){w.title=weather;w.setAttribute('aria-label',weather+' \u00b7 \ub0a0\uc528 \uc0c1\uc138')}
    set('briefLocal',$('clockLocal')?.textContent||'--:--');set('briefKorea',$('clockKorea')?.textContent||'--:--');
    const fx=window.FxService?.state,v=fx?.value;
    set('briefFx',v?'\u20a9'+Math.round(v.rate).toLocaleString('ko-KR'):'\u20ac1 \u2014');
    set('briefFxNote',v?'하나 '+v.asOf.slice(5).replace('-','/'):'하나 연결 대기');
    const fxbtn=document.querySelector('.brief-fx');if(fxbtn)fxbtn.title=$('liveFxMain')?.textContent+' \u00b7 '+($('fxUpdated')?.textContent||'');
    const state=window.LocationSession?.state;
    let label='OFF',note='\ub85c\uadf8\uc778 \uc804';
    if(state){
      const sent=state.lastSentAt&&state.want;
      label=sent?'ON':state.want?'\ub300\uae30':'OFF';
      if(state.phase==='permission'){label='OFF';note='\uad8c\ud55c \ud544\uc694'}
      else if(!state.owner){label='OFF';note='\ub85c\uadf8\uc778 \uc804'}
      else if(!state.want){note=state.stopPending?'\uc911\uc9c0 \ub300\uae30':'\uc804\uc1a1 \uc911\uc9c0'}
      else if(state.phase==='error'){label=sent?'ON !':'OFF';note='\uc804\uc1a1 \uc2e4\ud328'}
      else if(document.hidden){note='\ubcf5\uadc0 \ub300\uae30'}
      else if(state.phase==='locating'||state.phase==='sending'){note='\uac31\uc2e0 \uc911'}
      else if(sent){const min=Math.floor(Math.max(0,Date.now()-state.lastSentAt)/60000);note=min<1?'\ubc29\uae08 \uc804\uc1a1':min+'\ubd84 \uc804';if(min>=10)label='ON !'}
      else note='\uc804\uc1a1 \ub300\uae30';
    }
    const tone=label==='ON'?'on':label==='OFF'?(state?.phase==='permission'?'warning':'off'):'warning';
    const glyph=label==='ON'?'\u25cf':label==='OFF'&&tone==='off'?'\u25cb':label==='\ub300\uae30'?'\u2026':'\u26a0';
    set('briefLocation',glyph+' '+label.replace(' !',''));set('briefLocationNote',note);
    const loc=$('briefLocationLink');if(loc){const on=!!state?.want;loc.dataset.state=on?'on':'off';loc.dataset.tone=tone;loc.setAttribute('aria-checked',String(on));loc.disabled=!state?.owner;loc.title=(on?'터치하면 위치공유 OFF':'터치하면 위치공유 ON')+' · 위치 데이터 최근 24시간 보호';loc.setAttribute('aria-label',(on?'위치공유 끄기':'위치공유 켜기')+' · 위치 데이터 최근 24시간 보호');if(!on&&state?.owner)note='터치해서 켜기 · 24h';else if(on)note=(note||'공유 중')+' · 24h';set('briefLocationNote',note)}
    const c=window.AppTraffic?.cumulative,b=c?c.sent+c.received:0;
    set('briefTraffic','\u2195 '+(b>=1048576?(b/1048576).toFixed(1)+'M':(b/1024).toFixed(0)+'K'));
    $('headerToggle')?.setAttribute('title',($('headerToggle').getAttribute('aria-expanded')==='true'?'\uc0c1\ub2e8 \uc811\uae30':'\uc2dc\uac04\u00b7\ud658\uc728\u00b7\ub370\uc774\ud130 \ud3bc\uce58\uae30')+' \u00b7 '+($('trafficTotal')?.textContent||''));
  }
  function schedule(){if(!queued){queued=true;queueMicrotask(mirror)}}
  function init(){if(started)return;started=true;display(false);mirror();
    const area=$('headerDetails');if(area)new MutationObserver(schedule).observe(area,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-state']});
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('#headerToggle')){display($('headerDetails').hidden);return}
    if(e.target.closest('[data-header-open]')){display(true);return}
    if(e.target.closest('[data-header-close]')){display(false,true);return}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('headerDetails')?.hidden&&document.querySelector('.compact-top')?.contains(document.activeElement)){display(false,true)}});
  window.addEventListener('cro-route',()=>display(false));
  for(const name of ['cro-fx','cro-traffic','cro-location-state','cro-auth-change'])window.addEventListener(name,schedule);
  document.addEventListener('DOMContentLoaded',init);
  window.CompactHeader={open:()=>display(true),close:()=>display(false),refresh:mirror};
})();

/* MIX08: presentation only; never reads/writes Firebase or replaces event actions. */
(function(){
  'use strict';
  let pending=false;
  function disclosure(d){
    const summary=d.querySelector(':scope > summary');if(!summary)return;
    if(!d.classList.contains('ui-disclosure'))d.classList.add('ui-disclosure');
    let label=summary.querySelector(':scope > .ui-disclosure-label');
    if(!label){
      label=document.createElement('span');label.className='ui-disclosure-label';
      while(summary.firstChild)label.appendChild(summary.firstChild);
      summary.appendChild(label);
    }
    let action=summary.querySelector(':scope > .ui-disclosure-action');
    if(!action){action=document.createElement('span');action.className='ui-disclosure-action';action.setAttribute('aria-hidden','true');action.innerHTML='<b></b><span></span>';summary.appendChild(action);}
    const arrow=d.open?'\u25b2':'\u25bc',text=d.open?'\uc811\uae30':'\ud3bc\uce58\uae30';
    if(action.firstElementChild.textContent!==arrow)action.firstElementChild.textContent=arrow;
    if(action.lastElementChild.textContent!==text)action.lastElementChild.textContent=text;
    if(summary.getAttribute('aria-expanded')!==String(d.open))summary.setAttribute('aria-expanded',String(d.open));
  }
  function sync(){
    pending=false;
    document.querySelectorAll('main details, #headerDetails details').forEach(disclosure);
    document.querySelectorAll('.people-filters button,.loc-filter button,.expense-mode button,.toilet-filter,.app-reco-tab').forEach(b=>{
      const v=String(b.classList.contains('active'));if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);
    });
    const more=document.getElementById('moreNavBtn');
    if(more){
      const open=document.getElementById('appMoreBackdrop')?.classList.contains('open');
      more.setAttribute('aria-controls','appMoreSheet');
      if(more.getAttribute('aria-expanded')!==String(!!open))more.setAttribute('aria-expanded',String(!!open));
    }
    document.querySelectorAll('.ops-status small').forEach(e=>{if(e.title!==e.textContent)e.title=e.textContent});
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(sync)}
  document.addEventListener('toggle',e=>{if(e.target instanceof HTMLDetailsElement)disclosure(e.target)},true);
  window.addEventListener('cro-route',schedule);
  document.addEventListener('DOMContentLoaded',()=>{
    sync();
    const observer=new MutationObserver(schedule);
    for(const el of [document.querySelector('main'),document.getElementById('headerDetails'),document.getElementById('appMoreBackdrop')]){
      if(el)observer.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open']});
    }
  });
})();
