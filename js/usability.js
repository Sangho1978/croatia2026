/* MIX05: device-clock display, independent directory, concise emergency contacts.
 * No database writes, location polling changes or financial permission changes.
 */
(function(){
  'use strict';
  const LOCAL_ZONE='Europe/Zagreb', KOREA_ZONE='Asia/Seoul';
  const formatters=new Map();let clockTimer=0,memberFilter='all';
  function fmt(at,zone){
    if(!formatters.has(zone))formatters.set(zone,new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));
    const p=formatters.get(zone).formatToParts(new Date(at));const get=k=>p.find(x=>x.type===k)?.value||'';
    return {time:get('hour')+':'+get('minute'),date:get('month')+'/'+get('day')+' '+get('weekday'),day:get('year')+'-'+get('month')+'-'+get('day')};
  }
  function clockPaint(){
    clearTimeout(clockTimer);const now=Date.now();
    for(const [suffix,zone] of [['Local',LOCAL_ZONE],['Korea',KOREA_ZONE]]){
      const v=fmt(now,zone),t=document.getElementById('clock'+suffix),d=document.getElementById('clock'+suffix+'Date');
      if(t){t.textContent=v.time;t.dateTime=new Date(now).toISOString();t.title=zone+' \u00b7 \uae30\uae30 \uc2dc\uacc4 \uae30\uc900';}
      if(d){d.textContent=v.date;d.title=v.day;}
    }
    // Minute boundary refresh; no network request, no work while in background.
    if(!document.hidden)clockTimer=setTimeout(clockPaint,60000-Date.now()%60000+30);
  }
  const esc=s=>Integration.escape(s);
  function renderDirectory(){
    const box=document.getElementById('directoryRoster');if(!box)return;
    const input=document.getElementById('directorySearch'),q=(input.value||'').replace(/\s+/g,'').toLowerCase();
    document.getElementById('directoryFilters').innerHTML=[['all','\uc804\uccb4'],['staff','\uc6b4\uc601\uc9c4'],['lead','\uc870\uc7a5'],['1','1\uc870'],['2','2\uc870'],['3','3\uc870'],['4','4\uc870'],['0','\uad50\uc218']].map(([f,n])=>`<button type="button" data-directory-filter="${f}" aria-pressed="${f===memberFilter}" class="${f===memberFilter?'active':''}">${n}</button>`).join('');
    document.getElementById('directoryStaff').innerHTML='<strong>\uc5f0\uc218 \uc6b4\uc601\uc9c4</strong><br>'+Object.entries(STAFF_ROLES).map(([name,role])=>esc(role)+' '+esc(name)).join(' \u00b7 ');
    const people=TEAM_MEMBERS.filter(u=>{
      const hay=[u.name,u.org,u.title,u.tripRole,u.leader?'\uc870\uc7a5':'',u.presenter?'\ubc1c\ud45c':'',u.group?u.group+'\uc870':'\uad50\uc218'].join('').replace(/\s+/g,'').toLowerCase();
      return (!q||hay.includes(q))&&(memberFilter==='all'||(memberFilter==='staff'&&u.tripRole)||(memberFilter==='lead'&&u.leader)||String(u.group)===memberFilter);
    });
    document.getElementById('directoryCount').textContent='\uc804\uccb4 28\uba85 \u00b7 \ud604\uc7ac '+people.length+'\uba85 \ud45c\uc2dc';
    box.innerHTML=[1,2,3,4,0].map(g=>{
      const list=people.filter(u=>u.group===g).sort((a,b)=>a.groupOrder-b.groupOrder);if(!list.length)return '';
      return `<section class="people-group" data-directory-group="${g}"><header><h3>${g?g+'\uc870':'\uc778\uc194 \uad50\uc218'}</h3><span>${list.length}\uba85</span></header><div class="people-grid">${list.map(Integration.personCard).join('')}</div></section>`;
    }).join('')||'<div class="empty-card">\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</div>';
  }
  function emergencyCards(){
    const definitions=[['\uc704\uc7ac\ubcf5','\ud300\uc7a5'],['\uc774\uc0c1\ubbf8','\ucd1d\ubb34'],['\ud55c\uc0c1\ud638','\ubd80\ud300\uc7a5'],['\uc7a5\ud604\uc6c5','\ubd80\ud300\uc7a5'],['\ub098\uc885\ubbfc','\uc778\uc194 \uad50\uc218']];
    const contacts=definitions.map(([name,role])=>{const u=TEAM_MEMBERS.find(p=>p.name===name);return u?{...u,callRole:role}:null}).filter(Boolean);
    // This contact is retained from MIX04, not independently re-verified here.
    contacts.push({name:'\uc5ec\ud589\uc0ac \uc778\uc194\uc790',callRole:'\uc5ec\ud589\uc0ac',phone:'010-9416-1883',org:'\uae30\uc874 \uc548\ub0b4\uc790\ub8cc \uc5f0\ub77d\ucc98'});
    const root=document.getElementById('emergencyContacts');if(!root)return;
    root.innerHTML=contacts.map(u=>`<article class="emergency5-card"><div><span>${esc(u.callRole)}</span><h3>${esc(u.name)}</h3><small>${esc(u.phone)}</small></div><a href="tel:+82${u.phone.replace(/\D/g,'').slice(1)}" aria-label="${esc(u.name)}\uc5d0\uac8c \uc804\ud654">\u260e \uc804\ud654</a></article>`).join('');
  }


  // MIX10: immediate interaction feedback for field actions.
  let toastTimer=0;
  function actionToast(text,kind=''){
    const el=document.getElementById('appActionToast');if(!el||!text)return;
    clearTimeout(toastTimer);el.className='app-action-toast show '+kind;el.textContent=text;
    toastTimer=setTimeout(()=>{el.classList.remove('show')},kind==='error'?3200:1900);
  }
  function inlineLocationFeedback(text,kind=''){
    const el=document.getElementById('locationActionFeedback');if(!el)return;
    el.className='action-inline-feedback '+(kind?'is-'+kind:'');el.textContent=text;
  }
  function buttonBusy(button,busy,label){
    if(!button)return;if(busy){button.dataset.originalLabel=button.dataset.originalLabel||button.textContent;button.classList.add('is-busy');button.disabled=true;if(label)button.firstChild.textContent=label;}
    else{button.classList.remove('is-busy');button.disabled=false;if(button.dataset.originalLabel)button.textContent=button.dataset.originalLabel;}
  }
  function markDone(button){if(!button)return;button.classList.add('is-done');setTimeout(()=>button.classList.remove('is-done'),900)}
  function nowLabel(){if(window.AppTime){const v=AppTime.stored(Date.now());return '현지 '+v.croatia+' · 한국 '+v.korea}return new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}
  function installLocationActionFeedback(){
    if(window.__croLocFeedbackInstalled)return;window.__croLocFeedbackInstalled=true;
    const send0=window.locUpdateNow,refresh0=window.locRefreshAll,map0=window.locToggleMap;
    if(typeof send0==='function')window.locUpdateNow=async function(high=false){
      const b=document.getElementById('locSendNowBtn');buttonBusy(b,true,'◎ 위치 확인 중…');inlineLocationFeedback('현재 GPS 위치를 확인하고 있습니다.','working');actionToast('현재 위치 확인 중…','working');
      try{await send0(high);const state=window.LocationSession?.state;if(state?.phase==='permission'||state?.phase==='error')throw Error(state.message||'위치 전송을 확인해 주세요.');markDone(b);inlineLocationFeedback('✓ 위치 전송 완료 · '+nowLabel(),'success');actionToast('✓ 현재 위치를 전송했습니다.','success');}
      catch(e){inlineLocationFeedback('⚠ '+(e.message||e),'error');actionToast('위치 전송 실패 · 확인이 필요합니다.','error');throw e}
      finally{buttonBusy(b,false);}
    };
    if(typeof refresh0==='function')window.locRefreshAll=async function(manual=false){
      const b=document.getElementById('locRefreshBtn');if(manual){buttonBusy(b,true,'↻ 불러오는 중…');inlineLocationFeedback('일행의 최근 위치를 불러오고 있습니다.','working');actionToast('일행 위치 새로고침 중…','working');}
      try{await refresh0(manual);if(manual){markDone(b);inlineLocationFeedback('✓ 일행 위치를 새로고침했습니다. · '+nowLabel(),'success');actionToast('✓ 일행 위치를 새로고침했습니다.','success');}}
      catch(e){if(manual){inlineLocationFeedback('⚠ '+(e.message||e),'error');actionToast('일행 위치 조회 실패','error');}throw e}
      finally{if(manual)buttonBusy(b,false);}
    };
    if(typeof map0==='function')window.locToggleMap=function(force=false){
      const before=document.getElementById('locMap')?.classList.contains('show');const r=map0(force);const after=document.getElementById('locMap')?.classList.contains('show');
      const b=document.getElementById('locMapToggleBtn');if(b)b.textContent=after?'✕ 지도 닫기':'⌖ 지도 보기';
      inlineLocationFeedback(after?'✓ 지도를 열었습니다. 아래 지도 영역을 확인하세요.':'지도를 닫았습니다.',after?'success':'');actionToast(after?'✓ 지도 열림':'지도 닫힘',after?'success':'');markDone(b);return r;
    };
  }
  function paintLocationPageState(){
    const el=document.getElementById('locationPageState');if(!el)return;const s=window.LocationSession?.state;
    el.classList.remove('is-on','is-error');
    if(!currentUser){el.textContent='○ 로그인 전';return}
    if(s?.want&&s?.lastSentAt){el.textContent='● 위치 ON · '+ago(s.lastSentAt);el.classList.add('is-on')}
    else if(s?.phase==='permission'||s?.phase==='error'){el.textContent='⚠ 확인 필요';el.classList.add('is-error')}
    else if(s?.want){el.textContent='◌ 위치 준비 중'}else el.textContent='○ 위치 OFF';
  }
  function globalPressFeedback(e){
    const hit=e.target.closest('button,a.btn,.app-sheet-grid button,.app-nav-btn');if(!hit||hit.disabled)return;
    hit.classList.add('ux-clicked');setTimeout(()=>hit.classList.remove('ux-clicked'),180);
    if(hit.matches('.app-nav-btn'))return;
    if(hit.closest('.app-sheet-grid'))actionToast((hit.querySelector('span')?.textContent||'메뉴')+' 열기');
    else if(hit.id==='attStartBtn')actionToast('출석 시작 요청을 보냈습니다.','working');
    else if(hit.id==='attResetBtn')actionToast('출석 리셋을 처리합니다.','working');
    else if(hit.id==='attMyBtn'&&!hit.disabled)actionToast('내 출석을 확인합니다.','working');
    else if(hit.matches('[data-header-toggle]'))actionToast(document.body.classList.contains('header-expanded')?'상단 정보를 접습니다.':'상단 상세정보를 펼칩니다.');
  }

  document.addEventListener('input',e=>{if(e.target.id==='directorySearch')renderDirectory()});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-directory-filter]');if(b){memberFilter=b.dataset.directoryFilter;renderDirectory();document.querySelector('[data-directory-filter="'+memberFilter+'"]')?.focus({preventScroll:true})}});
  document.addEventListener('visibilitychange',clockPaint);
  window.addEventListener('pageshow',clockPaint);
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='members')renderDirectory()});
  document.addEventListener('click',globalPressFeedback,true);
  window.addEventListener('cro-location-state',paintLocationPageState);
  window.addEventListener('cro-route',paintLocationPageState);
  document.addEventListener('DOMContentLoaded',()=>{clockPaint();renderDirectory();emergencyCards();installLocationActionFeedback();paintLocationPageState()});
  window.TripClocks={format:fmt,refresh:clockPaint};
})();
