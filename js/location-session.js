/* MIX07. App-wide session (not tied to any route). Based on MIX03. Per-login location session, explicit OFF, group colour and distance.
 * Uses the original member slots; does not reinterpret slot names as groups.
 * A visible web page can refresh every five minutes, not guarantee background GPS.
 */
(function(){
  'use strict';
  const PERIOD=300000, FRESH=300000, LEASE=600000;
  let epoch=0,want=false,phase='off',message='',fix=null,ack=0,readAt=0,loggingOut=false;
  let owner=null,writeJob=null,refreshJob=null,retryStop=null,timer=null,readTimer=null;
  const stopKey='cro.location.stopPending.v3';
  const esc=s=>Integration.escape(s);
  const valid=r=>!!r&&Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&r.lat>=-90&&r.lat<=90&&r.lng>=-180&&r.lng<=180&&Number.isFinite(r.ts);
  const age=r=>valid(r)?Math.max(0,Date.now()-r.ts):Infinity;
  const enabled=r=>valid(r)&&r.sharing!==false&&age(r)<=LEASE&&(!r.expiresAt||r.expiresAt>Date.now());
  const same=(n,u)=>n===epoch&&currentUser?.slot===u?.slot;
  function latestSelf(){return fix&&Date.now()-fix.ts<=FRESH?fix:null}
  function textClock(ts){return typeof ts==='number'&&window.AppTime?AppTime.label(ts):(typeof ts==='number'?new Date(ts).toLocaleString('ko-KR'):'-')}
  function distance(a,b){const r=x=>x*Math.PI/180,p=r(b.lat-a.lat),q=r(b.lng-a.lng),v=Math.sin(p/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(q/2)**2;return 6371000*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,v))))}
  function distanceInfo(r,u){
    if(currentUser?.slot===u?.slot)return {label:'\ub098',metres:0};
    if(!enabled(r))return {label:valid(r)?'\uac70\ub9ac \ubcf4\ub958':'\ubbf8\uacf5\uc720',metres:null};
    const me=latestSelf();if(!me)return {label:'\ub0b4 \uc704\uce58 \ud655\uc778 \ud544\uc694',metres:null};
    const m=distance(me,r),near=m<Math.max(me.accuracy||0,r.accuracy||0);
    return {label:(age(r)>FRESH?'\uc774\uc804 \uc704\uce58 \uae30\uc900 ':'')+(near?'\uc624\ucc28\ubc94\uc704 \ub0b4 ':'')+'\uc57d '+(m<1000?Math.round(m/10)*10+' m':(m/1000).toFixed(1)+' km'),metres:m};
  }
  function stateText(){
    if(!currentUser)return 'OFF \u00b7 \ub85c\uadf8\uc778 \uc804';
    if(!want)return 'OFF'+(retryStop?' \u00b7 \uc911\uc9c0 \uc54c\ub9bc \ub300\uae30':'');
    if(phase==='permission')return 'OFF \u00b7 \uad8c\ud55c \ud5c8\uc6a9 \ud544\uc694';
    if(phase==='locating')return (ack?'ON':'OFF')+' \u00b7 \uc704\uce58 \ud655\uc778 \uc911';
    if(phase==='sending')return (ack?'ON':'OFF')+' \u00b7 \uc804\uc1a1 \uc911';
    if(phase==='error')return (ack?'ON':'OFF')+' \u00b7 \uc804\uc1a1 \uc2e4\ud328';
    if(document.hidden)return 'ON \u00b7 \ud654\uba74 \ubcf5\uadc0 \ud6c4 \uac31\uc2e0';
    return ack?'ON \u00b7 '+ago(ack)+(Date.now()-ack>FRESH?' \u00b7 \uac31\uc2e0 \uc9c0\uc5f0':' \uc804\uc1a1'):'OFF \u00b7 \uc804\uc1a1 \ub300\uae30';
  }
  function paint(){
    const label=stateText(),e=document.getElementById('liveLoc');
    if(e){e.textContent='\ub0b4 \uc704\uce58 '+label;e.dataset.state=want&&ack?'on':'off';e.title=message||'\ub85c\uadf8\uc778 \uc2dc \uc704\uce58\uacf5\uc720 \uc2dc\uc791. \uc9c1\uc811 \ub044\uba74 \uadf8 \uc120\ud0dd\uc744 \uc720\uc9c0\ud569\ub2c8\ub2e4.';e.classList.remove('transmitting','delayed');}
    const toggle=document.getElementById('locationHeaderToggle');if(toggle){toggle.textContent=want?'\ub044\uae30':'\ucf1c\uae30';toggle.disabled=!currentUser;toggle.setAttribute('aria-label',want?'\uc704\uce58\uacf5\uc720 \ub044\uae30':'\uc704\uce58\uacf5\uc720 \ucf1c\uae30');}
    const state=document.getElementById('locShareStatus');if(state)state.textContent=label+(message?' \u2014 '+message:'');
    const home=document.getElementById('todayLocationState');if(home)home.textContent=label;
    const basis=document.getElementById('locationDistanceBasis');if(basis)basis.textContent=(currentUser?.name||'\ub85c\uadf8\uc778 \uc0ac\uc6a9\uc790')+' \uae30\uc900 \uc9c1\uc120\uac70\ub9ac'+(fix?' \u00b7 '+textClock(fix.ts)+' \u00b7 GPS \uc57d '+Math.round(fix.accuracy||0)+' m':' \u00b7 \uc704\uce58 \ud5c8\uc6a9 \ud6c4 \uacc4\uc0b0')+'\n\ub3c4\ubcf4\uac70\ub9ac\uac00 \uc544\ub2d9\ub2c8\ub2e4. 5\ubd84 \ucd08\uacfc \uc0c1\ub300 \uc704\uce58\ub294 \uc2dc\uac01\uc744 \ud655\uc778\ud558\uc138\uc694.';
    window.dispatchEvent(new CustomEvent('cro-location-state'));
  }
  function permissionError(e){if(e.code===1){phase='permission';message='\ube0c\ub77c\uc6b0\uc800\uc758 \uc0ac\uc774\ud2b8 \uc124\uc815\uc5d0\uc11c \uc704\uce58\ub97c \ud5c8\uc6a9\ud574 \uc8fc\uc138\uc694.'}else{phase='error';message=e.message||'\uc704\uce58 \ud655\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'}}
  function getFix(high=false){return new Promise((resolve,reject)=>{
    if(!window.isSecureContext||!navigator.geolocation){const e=Error('HTTPS \uc8fc\uc18c\ub97c \uc678\ubd80 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \uc5f4\uc5b4 \uc8fc\uc138\uc694.');e.code=1;reject(e);return;}
    navigator.geolocation.getCurrentPosition(p=>resolve({lat:+p.coords.latitude.toFixed(5),lng:+p.coords.longitude.toFixed(5),accuracy:Math.round(p.coords.accuracy||0),ts:p.timestamp||Date.now()}),reject,{enableHighAccuracy:high,maximumAge:30000,timeout:15000});
  })}
  async function request(path,options={}){const tk=await token(),ctrl=new AbortController(),tid=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(firebaseConfig.databaseURL.replace(/\/$/,'')+'/'+path+'.json?auth='+encodeURIComponent(tk),{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})},cache:'no-store',signal:ctrl.signal});const t=await r.text();locCount(new TextEncoder().encode(t).length+(options.body?new TextEncoder().encode(options.body).length:0));if(!r.ok){const e=Error(r.status===401||r.status===403?'\uc704\uce58 Firebase Rules/\uc2ac\ub86f \uc18c\uc720\uad8c\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.':'\uc704\uce58 \uc5f0\uacb0 \uc2e4\ud328 ('+r.status+')');e.status=r.status;throw e}return t&&t!=='null'?JSON.parse(t):null}finally{clearTimeout(tid)}}
  // These loops belong to the logged-in session, not the location view.
  // document.hidden refers to the browser document; hidden SPA sections do not pause it.
  function ensureSessionLoops(){
    if(!currentUser)return;
    if(!readTimer)readTimer=setInterval(()=>{
      if(currentUser&&!document.hidden&&navigator.onLine)locRefreshAll(false);
    },120000);
    if(want&&!timer)timer=setInterval(()=>{
      if(currentUser&&want&&!document.hidden&&navigator.onLine&&phase!=='permission')send(false);
    },PERIOD);
  }
  async function send(high=false){
    if(!want||!currentUser||document.hidden||writeJob)return writeJob;
    const n=epoch,u={...currentUser};
    writeJob=(async()=>{
      try{
        phase='locating';message='';paint();const p=await getFix(high);
        if(!same(n,u)||!want)return;if(document.hidden){phase='paused';message='화면 복귀 후 다시 갱신합니다.';return;}fix=p;locLastPos={coords:{latitude:p.lat,longitude:p.lng,accuracy:p.accuracy},timestamp:p.ts};renderRoster();
        await token();if(!same(n,u)||!want)return;
        const now=Date.now(),clock=window.AppTime?AppTime.stored(now):null,data={uid:localStorage.getItem('fb_uid'),slot:u.slot,group:u.group,name:u.name,lat:p.lat,lng:p.lng,accuracy:p.accuracy,ts:now,pageState:'foreground',...(clock?{timeCroatia:clock.croatia,timeKorea:clock.korea}: {})};
        phase='sending';paint();
        await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'PUT',body:JSON.stringify(data)});
        if(!same(n,u)||!want)return;
        ack=now;locLastWrite=now;localStorage.setItem('loc_lastwrite',String(now));locCache[u.slot]=data;phase='on';paint();renderRoster();
        try{await request('locationHistory/'+TRIP_CODE+'/'+u.slot+'/'+now,{method:'PUT',body:JSON.stringify(data)})}catch(e){if(same(n,u)&&want)message='\ud604\uc7ac\uc704\uce58 \uc800\uc7a5\ub428 \u00b7 \uc774\ub3d9\uc774\ub825 \uc800\uc7a5 \uc2e4\ud328';}
      }catch(e){if(same(n,u)&&want){permissionError(e);paint()}}
      finally{writeJob=null;if(same(n,u)){paint();renderRoster();}}
    })();return writeJob;
  }
  async function clearRemote(u){if(!u)return;retryStop=u;localStorage.setItem(stopKey,JSON.stringify({slot:u.slot,name:u.name}));try{await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'DELETE'});retryStop=null;localStorage.removeItem(stopKey);delete locCache[u.slot]}catch(e){message='\uc774 \uae30\uae30\uc758 \uc804\uc1a1\uc740 \uc911\uc9c0\ub428. \uc11c\ubc84 \uc911\uc9c0 \uc54c\ub9bc\uc740 \uc5f0\uacb0 \ud6c4 \uc7ac\uc2dc\ub3c4.'}paint();renderRoster()}
  window.locStopSharing=async function(){
    const u=owner?{...owner}:currentUser?{...currentUser}:null;
    want=false;phase='off';epoch++;message='';fix=null;ack=0;locLastWrite=0;
    clearInterval(timer);timer=null;localStorage.setItem('loc_sharing','0');localStorage.removeItem('loc_lastwrite');
    if(u&&!loggingOut)localStorage.setItem('cro.loc.auto.'+u.slot,'0');paint();renderRoster();
    if(writeJob)try{await writeJob}catch(_){}
    await clearRemote(u);
  };
  window.locStartSharing=async function(){
    if(!currentUser)return;const u=currentUser;
    if(want&&owner?.slot===u.slot){ensureSessionLoops();if(phase==='permission'||phase==='error')await send(false);return;}
    owner={...u};epoch++;want=true;phase='locating';message='';fix=null;ack=0;
    localStorage.setItem('loc_sharing','1');localStorage.setItem('cro.loc.auto.'+u.slot,'1');
    ensureSessionLoops();paint();
    await send(false);if(refreshJob)await refreshJob;await locRefreshAll(false);
  };
  window.locUpdateNow=async function(high=false){
    if(!currentUser)return;if(!want){await locStartSharing();return;}await send(high);
  };
  window.locRefreshAll=async function(manual=false){
    if(!currentUser)return;if(refreshJob)return refreshJob;
    const n=epoch,u={...currentUser};refreshJob=(async()=>{try{const j=await request('locations/'+TRIP_CODE);if(!same(n,u))return;const cache={};Object.entries(j||{}).forEach(([k,v])=>{if(APP_BY_SLOT[k]&&valid(v)&&age(v)<SHOWMAX)cache[k]=v});locCache=cache;readError=false;readAt=Date.now();localStorage.setItem('loc_read',String(readAt));const e=document.getElementById('locBackendState');if(e)e.textContent='Firebase \uc870\ud68c \uc815\uc0c1 \u00b7 '+textClock(readAt);renderRoster()}catch(e){readError=true;const el=document.getElementById('locBackendState');if(el)el.textContent='\uc870\ud68c \uc2e4\ud328 \u00b7 \uc774\uc804 \uc704\uce58\uc77c \uc218 \uc788\uc2b5\ub2c8\ub2e4. '+e.message;if(manual)message=e.message;paint();renderRoster()}finally{refreshJob=null}})();return refreshJob;
  };
  const previousLogout=window.appLogout;
  window.appLogout=async function(){loggingOut=true;try{return await previousLogout.apply(this,arguments)}finally{loggingOut=false}};
  window.updateLiveLocChip=paint;
  // Age is text only. Marker colours never encode elapsed time.
  function statusOf(r){if(!valid(r))return '\uacf5\uc720 \uc5c6\uc74c';if(r.sharing===false)return 'OFF';if(!enabled(r))return '\uac31\uc2e0 \uc9c0\uc5f0 \u00b7 ON \uc5ec\ubd80 \ud655\uc778 \ud544\uc694';return age(r)<=FRESH?'\ucd5c\uadfc \uc704\uce58':'\uc774\uc804 \uc704\uce58 \uae30\uc900'}
  let rosterMode=localStorage.getItem('cro.location.view.v5')==='detail'?'detail':'compact';
  let readError=false;
  function visibleState(u,r){
    if(u.slot===currentUser?.slot && !want)return {label:'OFF',on:false,detail:'\uacf5\uc720 \uc548 \ud568'};
    if(enabled(r))return {label:'ON',on:true,detail:ago(r.ts)};
    if(valid(r)&&r.sharing!==false)return {label:'\uc9c0\uc5f0',on:false,detail:'\uc774\uc804 \uc704\uce58'};
    return {label:readAt?'OFF':'\ubbf8\ud655\uc778',on:false,detail:readAt?'\ubbf8\uacf5\uc720':'\uc870\ud68c \ub300\uae30'};
  }
  window.renderRoster=function(){
    const box=document.getElementById('locRoster');if(!box)return;
    const focusSlot=document.activeElement?.dataset?.locationSlot;
    const summary=[1,2,3,4,0].map(g=>{
      const list=APP_USERS.filter(u=>u.group===g).sort((a,b)=>a.groupOrder-b.groupOrder);
      const online=list.filter(u=>visibleState(u,locCache[u.slot]).on).length;
      return {g,list,online,offline:list.length-online};
    });
    const online=summary.reduce((n,g)=>n+g.online,0);
    const totals=document.getElementById('locGroupTotals');
    if(totals)totals.innerHTML=summary.map(({g,list,online,offline})=>`<button type="button" data-loc-group="${g||'prof'}" style="--group:${locGroupColor(g)}" aria-label="${g?g+'\uc870':'\uad50\uc218'} ON ${online}\uba85, OFF \ubbf8\ud655\uc778 ${offline}\uba85"><span>${g?g+'\uc870':'\uad50\uc218'}</span><b>ON ${online}<small>/${list.length}</small></b></button>`).join('');
    box.className='roster loc5-board '+(rosterMode==='detail'?'is-detail':'is-compact');
    let html='';
    for(const item of summary){
      const {g,online,offline}=item,list=item.list.filter(locUserMatchesFilter);if(!list.length)continue;
      html+=`<section class="loc5-group" data-location-group="${g}" style="--group:${locGroupColor(g)}"><header><h4>${g?g+'\uc870':'\uc778\uc194 \uad50\uc218'}</h4><span><b>ON ${online}</b> \u00b7 OFF/\ubbf8\ud655\uc778 ${offline}</span></header><div class="loc5-members">`;
      for(const u of list){
        const r=locCache[u.slot],di=distanceInfo(r,u),s=visibleState(u,r),me=u.slot===currentUser?.slot;
        const dist=di.label.replace('\uc774\uc804 \uc704\uce58 \uae30\uc900 ','').replace('\uc624\ucc28\ubc94\uc704 \ub0b4 ','');
        const meta=rosterMode==='detail'?`${statusOf(r)}${valid(r)?' \u00b7 '+textClock(r.ts)+' ('+ago(r.ts)+') \u00b7 GPS \uc57d '+Math.round(r.accuracy||0)+'m':''}`:(valid(r)?'최근 '+textClock(r.ts):s.detail);
        html+=`<button class="loc5-person ${u.leader?'is-leader':''} ${s.on?'is-on':'is-off'}" type="button" data-location-slot="${u.slot}" onclick="locOpenPerson('${u.slot}')" aria-label="${esc(u.name)}, ${s.label}, ${esc(di.label)}, \uc0c1\uc138\ubcf4\uae30"><span class="loc5-name"><b>${esc(u.name)}</b>${u.leader?'<small>\uc870\uc7a5</small>':''}${me?'<small>\ub098</small>':''}</span><span class="loc5-status">${s.label}</span><span class="distance-value" data-metres="${di.metres??''}" title="${esc(di.label)}">${esc(dist)}</span><span class="loc5-meta">${esc(meta)}</span></button>`;
      }
      html+='</div></section>';
    }
    box.innerHTML=html;
    if(focusSlot)box.querySelector(`[data-location-slot="${focusSlot}"]`)?.focus({preventScroll:true});
    document.getElementById('locLiveCount').textContent=online;
    document.getElementById('locStaleCount').textContent=APP_USERS.filter(u=>enabled(locCache[u.slot])&&age(locCache[u.slot])>FRESH).length;
    document.getElementById('locOffCount').textContent=APP_USERS.length-online;
    document.getElementById('locLastRefresh').textContent=readAt?textClock(readAt):'-';
    const note=document.getElementById('locStateNote');if(note)note.textContent=readError?'\uc870\ud68c \uc2e4\ud328 \u00b7 \uc800\uc7a5\ub41c \ucd5c\uadfc \uc0c1\ud0dc\uc785\ub2c8\ub2e4. ON\ub3c4 \ub2f9\uc0ac\uc790\uc5d0\uac8c \ud655\uc778\ud574 \uc8fc\uc138\uc694.':readAt?'ON = 최근 수신 · 이름을 누르면 상세':'\uc11c\ubc84 \uc870\ud68c \uc804 \u00b7 \uc704\uce58 \uc0c1\ud0dc\ub97c \ud655\uc778\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.';
    document.querySelectorAll('[data-loc-view]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.locView===rosterMode)));
    paint();updateMarkers();
  };
  document.addEventListener('click',e=>{
    const view=e.target.closest('[data-loc-view]');if(view){rosterMode=view.dataset.locView==='detail'?'detail':'compact';localStorage.setItem('cro.location.view.v5',rosterMode);renderRoster();}
    const g=e.target.closest('[data-loc-group]');if(g){const f=g.dataset.locGroup;locSetFilter(f,document.querySelector('#locFilters [data-filter="'+f+'"]'));}
  });
  window.locOpenPerson=async function(slot){const u=APP_BY_SLOT[slot],r=locCache[slot],box=document.getElementById('locPersonDetail');if(!u||!box)return;const d=distanceInfo(r,u);box.classList.add('show');box.innerHTML=`<div class="loc-simple-head"><h3>${esc(u.name)} \u00b7 ${userGroupText(u)}</h3><button type="button" onclick="this.closest('#locPersonDetail').classList.remove('show')">\ub2eb\uae30</button></div><b>${esc(d.label)}${d.metres!==null&&!Number.isNaN(d.metres)?' \u00b7 \uc9c1\uc120\uac70\ub9ac':''}</b><p>${esc(statusOf(r))}${valid(r)?'<br>'+textClock(r.ts)+' ('+ago(r.ts)+') \u00b7 GPS \uc57d '+Math.round(r.accuracy||0)+'m':''}</p>${valid(r)?`<div class="actions"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}">Google \uc9c0\ub3c4</a><button onclick="locLoadHistory('${slot}',true)">\uc774\ub3d9\uc774\ub825</button><a class="btn" href="tel:+82${u.phone.replace(/\D/g,'').slice(1)}">\uc804\ud654</a></div>`:''}<div id="locHistoryList" class="loc-history-list"></div>`;box.scrollIntoView({behavior:'smooth',block:'nearest'});};
  function mapLabel(u,r){return esc(u.name)+' \u00b7 '+esc(distanceInfo(r,u).label)}
  function popup(u,r){return `<b>${esc(u.name)} \u00b7 ${u.group?u.group+'\uc870':'\uad50\uc218'}</b><p>${esc(distanceInfo(r,u).label)}<br>${textClock(r.ts)} (${ago(r.ts)})<br>GPS \uc57d ${Math.round(r.accuracy||0)} m</p>`}
  window.makeGoogleOverlay=function(u,r){class M extends google.maps.OverlayView{onAdd(){const d=document.createElement('div');d.className='g-overlay';d.innerHTML=`<div class="group-marker" style="--group:${locGroupColor(u.group)}"><span class="group-marker-label">${mapLabel(u,r)}</span></div>`;d.onclick=()=>{googleInfo.setContent(popup(u,r));googleInfo.setPosition({lat:r.lat,lng:r.lng});googleInfo.open(mapObj)};this.div=d;this.getPanes().overlayMouseTarget.appendChild(d)}draw(){const p=this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(r.lat,r.lng));if(this.div){this.div.style.left=p.x+'px';this.div.style.top=p.y+'px'}}onRemove(){this.div?.remove()}}const o=new M();o.setMap(mapObj);return o;};
  let fitKey='';
  window.updateMarkers=function(){if(!mapObj)return;const users=Object.entries(locCache).filter(([k,r])=>APP_BY_SLOT[k]&&locUserMatchesFilter(APP_BY_SLOT[k])&&valid(r)&&r.sharing!==false&&age(r)<SHOWMAX);const key=locMapEngine+'|'+locFilter+'|'+users.map(([k])=>k).sort().join(',');
    if(locMapEngine==='google'&&window.google?.maps&&mapObj.getDiv){googleOverlays.forEach(x=>x.setMap(null));googleOverlays=[];const bounds=new google.maps.LatLngBounds();users.forEach(([k,r])=>{googleOverlays.push(makeGoogleOverlay(APP_BY_SLOT[k],r));bounds.extend({lat:r.lat,lng:r.lng})});if(users.length&&key!==fitKey){if(users.length===1){mapObj.setCenter(bounds.getCenter());mapObj.setZoom(16)}else mapObj.fitBounds(bounds,55);fitKey=key}}
    else if(locMapEngine==='leaflet'&&window.L&&mapObj.invalidateSize){markers.forEach(m=>mapObj.removeLayer(m));markers=[];const pts=[];users.forEach(([k,r])=>{const u=APP_BY_SLOT[k],icon=L.divIcon({className:'dual-leaf',html:`<div class="group-marker" style="--group:${locGroupColor(u.group)}"><span class="group-marker-label">${mapLabel(u,r)}</span></div>`,iconSize:[24,24],iconAnchor:[12,12]});markers.push(L.marker([r.lat,r.lng],{icon}).addTo(mapObj).bindPopup(popup(u,r)));pts.push([r.lat,r.lng])});if(pts.length&&key!==fitKey){if(pts.length===1)mapObj.setView(pts[0],16);else mapObj.fitBounds(pts,{padding:[55,55],maxZoom:17});fitKey=key}}
  };
  window.updateLeafletMarkers=()=>updateMarkers();
  function changed(){
    readAt=0;readError=false;epoch++;want=false;phase='off';owner=currentUser?{...currentUser}:null;fix=null;ack=0;message='';locLastWrite=0;locLastPos=null;clearInterval(timer);timer=null;clearInterval(readTimer);readTimer=null;
    localStorage.setItem('loc_sharing','0');paint();
    if(!currentUser){locCache={};renderRoster();return;}
    try{retryStop=JSON.parse(localStorage.getItem(stopKey)||'null')}catch(_){}
    if(retryStop)clearRemote(retryStop);
    const preference=localStorage.getItem('cro.loc.auto.'+currentUser.slot);
    if(preference!=='0')setTimeout(()=>{if(currentUser&&owner?.slot===currentUser.slot)locStartSharing()},50);
    locRefreshAll(false);ensureSessionLoops();
  }
  window.addEventListener('cro-auth-change',changed);
  let lastResumeAt=0;
  async function resumeVisible(){
    paint();
    if(document.hidden||!currentUser||!navigator.onLine)return;
    ensureSessionLoops();
    const now=Date.now();if(now-lastResumeAt<2500)return;lastResumeAt=now;
    if(retryStop)await clearRemote(retryStop);
    const tasks=[];
    // Request a fresh fix on return only if sharing was already enabled.
    if(want&&phase!=='permission'&&now-ack>45000)tasks.push(send(false));
    if(now-readAt>15000)tasks.push(locRefreshAll(false));
    await Promise.allSettled(tasks);
  }
  window.addEventListener('online',resumeVisible);
  window.addEventListener('pageshow',resumeVisible);
  window.addEventListener('focus',resumeVisible);
  document.addEventListener('visibilitychange',()=>{paint();if(!document.hidden)resumeVisible()});
  document.addEventListener('resume',resumeVisible);
  document.addEventListener('click',e=>{if(e.target.closest('#locationHeaderToggle'))want?locStopSharing():locStartSharing()});
  window.addEventListener('cro-route',e=>{
    // Keep ON/OFF and the timers alive across today / schedule / group / more.
    ensureSessionLoops();paint();
    if(e.detail?.view==='location'){renderRoster();locRefreshAll(false)}
  });
  document.addEventListener('DOMContentLoaded',()=>{paint();renderRoster();if(currentUser)changed()});
  window.LocationSession={paint,resume:resumeVisible,refresh:()=>locRefreshAll(true),distance,info:distanceInfo,get state(){return {want,phase,message,owner:owner?.slot,lastSentAt:ack,lastFix:fix,stopPending:!!retryStop,publishEveryMs:PERIOD,readEveryMs:120000,publisherRunning:!!timer,readerRunning:!!readTimer,scope:'app-wide'}}};
})();
