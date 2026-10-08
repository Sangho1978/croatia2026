/* MIX62: distance is always based on the logged-in user current/active cached fix; location map focuses on active shared positions. */
/* MIX50. App-wide session (not tied to any route). Based on MIX03. Per-login location session, explicit OFF, group colour and distance.
 * Uses the original member slots; does not reinterpret slot names as groups.
 * A visible web page can refresh every five minutes, not guarantee background GPS.
 */
(function(){
  'use strict';
  const PERIOD=300000, FRESH=300000, LEASE=600000, RETAIN=24*60*60*1000, PRUNE_EVERY=60*60*1000;
  let epoch=0,want=false,phase='off',message='',fix=null,ack=0,readAt=0,loggingOut=false;
  let owner=null,writeJob=null,refreshJob=null,retryStop=null,timer=null,readTimer=null,pruneJob=null,lastPruneAt=+(localStorage.getItem('cro.loc.prunedAt')||0);
  const stopKey='cro.location.stopPending.v3';
  const esc=s=>Integration.escape(s);
  const valid=r=>!!r&&Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&r.lat>=-90&&r.lat<=90&&r.lng>=-180&&r.lng<=180&&Number.isFinite(r.ts);
  const age=r=>valid(r)?Math.max(0,Date.now()-r.ts):Infinity;
  const enabled=r=>valid(r)&&r.sharing!==false&&age(r)<=LEASE&&(!r.expiresAt||r.expiresAt>Date.now());
  const same=(n,u)=>n===epoch&&currentUser?.slot===u?.slot;
  function latestSelf(){return fix&&Date.now()-fix.ts<=FRESH?fix:null}
  function referenceSelf(){
    if(!want)return null;
    const live=latestSelf();if(live)return live;
    const cached=currentUser?.slot?locCache[currentUser.slot]:null;
    return valid(cached)&&cached.sharing!==false&&age(cached)<=LEASE?cached:null;
  }
  function textClock(ts){return typeof ts==='number'&&window.AppTime?AppTime.label(ts):(typeof ts==='number'?new Date(ts).toLocaleString('ko-KR'):'-')}
  function locationRegion(r){
    if(!valid(r))return {label:'',zone:''};const lat=+r.lat,lng=+r.lng;
    if(lat>=32&&lat<=40.2&&lng>=123.5&&lng<=132.5)return {label:'한국',zone:'Asia/Seoul'};
    if(lat>=42.2&&lat<=46.8&&lng>=13.1&&lng<=19.7)return {label:'크로아티아',zone:'Europe/Zagreb'};
    if(lat>=35.0&&lat<=47.4&&lng>=6.0&&lng<=19.0)return {label:'이탈리아',zone:'Europe/Rome'};
    return {label:'최근',zone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'};
  }
  function locationClock(r){if(!valid(r))return '-';const z=locationRegion(r);if(window.AppTime)return `${z.label} ${AppTime.short(r.ts,z.zone)}`;return `${z.label} ${new Date(r.ts).toLocaleString('ko-KR',{timeZone:z.zone,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}`;}
  function distance(a,b){const r=x=>x*Math.PI/180,p=r(b.lat-a.lat),q=r(b.lng-a.lng),v=Math.sin(p/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(q/2)**2;return 6371000*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,v))))}
  function distanceInfo(r,u){
    if(currentUser?.slot===u?.slot)return {label:want?'나 · 기준점':'나 · 마지막 위치',metres:want?0:null};
    if(!valid(r)||age(r)>=RETAIN)return {label:'최근 24시간 위치 없음',metres:null};
    const me=referenceSelf();if(!me)return {label:'내 위치를 켜면 거리 계산',metres:null};
    const m=distance(me,r),near=m<Math.max(me.accuracy||0,r.accuracy||0),past=!enabled(r);
    const value=m<1000?Math.round(m/10)*10+' m':(m/1000).toFixed(1)+' km';
    return {label:(near?'오차범위 · ':'')+'나와 '+value+(past?' · 상대 마지막 위치':''),metres:m};
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
    const toggle=document.getElementById('locationHeaderToggle');if(toggle){toggle.textContent=want?'위치 ON':'위치 OFF';toggle.disabled=!currentUser;toggle.dataset.state=want?'on':'off';toggle.setAttribute('aria-checked',String(!!want));toggle.setAttribute('aria-label',want?'위치공유 끄기':'위치공유 켜기');}
    const quick=document.getElementById('briefLocationLink');if(quick){quick.disabled=!currentUser;quick.dataset.state=want?'on':'off';quick.setAttribute('aria-checked',String(!!want));quick.setAttribute('aria-label',want?'위치공유 끄기 · 위치기록 24시간 보호':'위치공유 켜기 · 위치기록 24시간 보호');}
    const state=document.getElementById('locShareStatus');if(state)state.textContent=label+(message?' \u2014 '+message:'');
    const home=document.getElementById('todayLocationState');if(home)home.textContent=label;
    const basis=document.getElementById('locationDistanceBasis');if(basis){const ref=referenceSelf();basis.textContent=ref?('거리: 내 위치 기준 · 마지막 위치는 24시간까지만 표시'):('다른 일행 위치는 계속 볼 수 있습니다 · 거리는 상단 위치를 켜면 표시됩니다');}
    window.dispatchEvent(new CustomEvent('cro-location-state'));
  }
  function permissionError(e){if(e.code===1){phase='permission';message='\ube0c\ub77c\uc6b0\uc800\uc758 \uc0ac\uc774\ud2b8 \uc124\uc815\uc5d0\uc11c \uc704\uce58\ub97c \ud5c8\uc6a9\ud574 \uc8fc\uc138\uc694.'}else{phase='error';message=e.message||'\uc704\uce58 \ud655\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.'}}
  function getFix(high=false){return new Promise((resolve,reject)=>{
    if(!window.isSecureContext||!navigator.geolocation){const e=Error('HTTPS \uc8fc\uc18c\ub97c \uc678\ubd80 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \uc5f4\uc5b4 \uc8fc\uc138\uc694.');e.code=1;reject(e);return;}
    navigator.geolocation.getCurrentPosition(p=>resolve({lat:+p.coords.latitude.toFixed(5),lng:+p.coords.longitude.toFixed(5),accuracy:Math.round(p.coords.accuracy||0),ts:p.timestamp||Date.now()}),reject,{enableHighAccuracy:high,maximumAge:30000,timeout:15000});
  })}
  async function request(path,options={}){const tk=await token(),ctrl=new AbortController(),tid=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(firebaseConfig.databaseURL.replace(/\/$/,'')+'/'+path+'.json?auth='+encodeURIComponent(tk),{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})},cache:'no-store',signal:ctrl.signal});const t=await r.text();locCount(new TextEncoder().encode(t).length+(options.body?new TextEncoder().encode(options.body).length:0));if(!r.ok){let msg='\uc704\uce58 \uc5f0\uacb0 \uc2e4\ud328 ('+r.status+')';if(r.status===401)msg='Firebase \uc778\uc99d\uc774 \ub9cc\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.';if(r.status===403){const isLocation=/^(locations|locationOwners|locationHistory)\//.test(path);msg=isLocation?'\uc774 \uae30\uae30\uc758 Firebase \uc778\uc99d ID\uac00 \uc774\uc804 \uc704\uce58 \uc2ac\ub86f\uacfc \ub2ec\ub77c\uc84c\uc2b5\ub2c8\ub2e4. MIX50 Firebase Rules\ub97c \uc801\uc6a9\ud558\uba74 \uac19\uc740 \uc774\ub984\u00b7\uc2ac\ub86f\uc73c\ub85c \uc790\ub3d9 \ubcf5\uad6c\ub429\ub2c8\ub2e4.':'Firebase \uc811\uadfc \uad8c\ud55c\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.';}const e=Error(msg);e.status=r.status;e.path=path;throw e}return t&&t!=='null'?JSON.parse(t):null}finally{clearTimeout(tid)}}
  async function requestQuery(path,query=''){
    const tk=await token(),ctrl=new AbortController(),tid=setTimeout(()=>ctrl.abort(),12000);
    try{
      const base=firebaseConfig.databaseURL.replace(/\/$/,'');
      const url=base+'/'+path+'.json?auth='+encodeURIComponent(tk)+(query?'&'+query:'');
      const r=await fetch(url,{cache:'no-store',signal:ctrl.signal}),t=await r.text();
      locCount(new TextEncoder().encode(t).length);
      if(!r.ok){const e=Error(r.status===401||r.status===403?'24시간 자동삭제를 위해 최신 Firebase Rules를 적용해 주세요.':'위치 정리 연결 실패 ('+r.status+')');e.status=r.status;throw e}
      return t&&t!=='null'?JSON.parse(t):null;
    }finally{clearTimeout(tid)}
  }
  function retentionPaint(textValue,ok=true){
    const el=document.getElementById('locRetentionStatus');if(!el)return;
    el.textContent=textValue;el.dataset.state=ok?'ok':'warning';
  }
  async function pruneOwnHistory(force=false){
    if(!currentUser||!navigator.onLine)return false;
    if(pruneJob)return pruneJob;
    if(!force&&Date.now()-lastPruneAt<PRUNE_EVERY)return false;
    const u={...currentUser},uid=localStorage.getItem('fb_uid')||'';
    if(!uid)return false;
    pruneJob=(async()=>{
      let removed=0;
      try{
        // A slot becomes readable only after its UID ownership binding exists.
        // First-time users can safely wait until their first successful location send.
        let binding=null;
        try{binding=await request('locationOwners/'+TRIP_CODE+'/'+u.slot)}catch(_){
          retentionPaint('최근 24시간만 표시 · 첫 위치공유 후 본인 기록 자동정리');
          lastPruneAt=Date.now();
          return false;
        }
        if(!binding||binding.uid!==uid){
          retentionPaint('최근 24시간만 표시 · 본인 위치기록 연결 대기');
          lastPruneAt=Date.now();
          return false;
        }
        const cutoff=Date.now()-RETAIN,cutKey=String(cutoff);
        // Current-location node is also removed if this user's last fix itself is older than 24h.
        const current=await request('locations/'+TRIP_CODE+'/'+u.slot);
        if(current&&current.uid===uid&&Number(current.ts||0)<cutoff){
          await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'DELETE'});removed++;
        }
        // History keys are 13-digit epoch milliseconds. Delete in bounded batches.
        for(let round=0;round<8;round++){
          const q='orderBy=%22%24key%22&endAt=%22'+encodeURIComponent(cutKey)+'%22&limitToFirst=400';
          const old=await requestQuery('locationHistory/'+TRIP_CODE+'/'+u.slot,q);
          const entries=Object.entries(old||{}).filter(([k,v])=>/^\d{13}$/.test(k)&&v&&Number(v.ts||k)<cutoff&&(v.uid===uid||(v.slot===u.slot&&v.name===u.name)));
          if(!entries.length)break;
          const patch={};for(const [k] of entries)patch[k]=null;
          await request('locationHistory/'+TRIP_CODE+'/'+u.slot,{method:'PATCH',body:JSON.stringify(patch)});
          removed+=entries.length;
          if(entries.length<400)break;
        }
        lastPruneAt=Date.now();localStorage.setItem('cro.loc.prunedAt',String(lastPruneAt));
        retentionPaint('최근 24시간만 유지 · 본인 기록 자동정리 완료'+(removed?' ('+removed+'건 삭제)':''));
        return true;
      }catch(e){
        retentionPaint('최근 24시간만 표시 · 서버 자동정리 설정을 확인하세요',false);
        return false;
      }finally{pruneJob=null}
    })();
    return pruneJob;
  }

  function applyResetLocal(resetAt,notice='관리자가 전체 위치정보를 초기화했습니다. 다시 공유하려면 직접 시작하세요.'){
    if(resetAt)localStorage.setItem('loc_reset_seen',String(resetAt));
    want=false;phase='off';epoch++;message=notice;fix=null;ack=0;locLastWrite=0;
    clearInterval(timer);timer=null;localStorage.setItem('loc_sharing','0');localStorage.removeItem('loc_lastwrite');
    if(currentUser)localStorage.setItem('cro.loc.auto.'+currentUser.slot,'0');
    paint();renderRoster();
  }
  async function checkResetControl(){
    if(!currentUser)return false;
    try{
      const c=await request('locationControl/'+TRIP_CODE),resetAt=+(c?.resetAt||0),seen=+(localStorage.getItem('loc_reset_seen')||0);
      if(resetAt>seen){applyResetLocal(resetAt);return true;}
    }catch(_){ }
    return false;
  }

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
        if(await checkResetControl())return;
        phase='locating';message='';paint();const p=await getFix(high);
        if(!same(n,u)||!want)return;if(document.hidden){phase='paused';message='화면 복귀 후 다시 갱신합니다.';return;}fix=p;locLastPos={coords:{latitude:p.lat,longitude:p.lng,accuracy:p.accuracy},timestamp:p.ts};renderRoster();
        await token();if(!same(n,u)||!want)return;
        const now=Date.now(),clock=window.AppTime?AppTime.stored(now):null,data={uid:localStorage.getItem('fb_uid'),slot:u.slot,group:u.group,name:u.name,lat:p.lat,lng:p.lng,accuracy:p.accuracy,ts:now,sharing:true,pageState:'foreground',...(clock?{timeCroatia:clock.croatia,timeKorea:clock.korea}: {})};
        phase='sending';paint();
        // MIX50 Rules allow the same named member to reclaim this fixed slot when a browser/PWA creates a new anonymous Firebase UID.
        await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'PUT',body:JSON.stringify(data)});
        if(!same(n,u)||!want)return;
        // 위치 이력은 slot-UID 소유권을 먼저 고정한 뒤 본인 이력에만 기록한다.
        await request('locationOwners/'+TRIP_CODE+'/'+u.slot,{method:'PUT',body:JSON.stringify({uid:data.uid,slot:u.slot,name:u.name})});
        ack=now;locLastWrite=now;localStorage.setItem('loc_lastwrite',String(now));locCache[u.slot]=data;phase='on';paint();renderRoster();
        try{await request('locationHistory/'+TRIP_CODE+'/'+u.slot+'/'+now,{method:'PUT',body:JSON.stringify(data)});void pruneOwnHistory(false)}catch(e){if(same(n,u)&&want)message='현재위치 저장됨 · 내 이동이력 저장 실패';}
      }catch(e){if(same(n,u)&&want){permissionError(e);paint()}}
      finally{writeJob=null;if(same(n,u)){paint();renderRoster();}}
    })();return writeJob;
  }
  async function clearRemote(u){if(!u)return;retryStop=u;localStorage.setItem(stopKey,JSON.stringify({slot:u.slot,name:u.name}));try{let prev=locCache[u.slot];if(!valid(prev)){try{prev=await request('locations/'+TRIP_CODE+'/'+u.slot)}catch(_){prev=null}}if(valid(prev)&&age(prev)<RETAIN){const member=APP_BY_SLOT[u.slot]||u,stopped={...prev,uid:localStorage.getItem('fb_uid')||prev.uid,slot:u.slot,group:Number.isFinite(member.group)?member.group:(prev.group||0),name:member.name||prev.name,sharing:false,stoppedAt:Date.now()};await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'PUT',body:JSON.stringify(stopped)});locCache[u.slot]=stopped}else{try{await request('locations/'+TRIP_CODE+'/'+u.slot,{method:'DELETE'})}catch(_){}}retryStop=null;localStorage.removeItem(stopKey)}catch(e){message='이 기기의 전송은 중지됨. 마지막 위치 OFF 표시는 연결 후 재시도.'}paint();renderRoster()}
  window.locStopSharing=async function(){
    const u=owner?{...owner}:currentUser?{...currentUser}:null;
    want=false;phase='off';epoch++;message='';fix=null;ack=0;locLastWrite=0;
    clearInterval(timer);timer=null;localStorage.setItem('loc_sharing','0');localStorage.removeItem('loc_lastwrite');
    if(u&&!loggingOut)localStorage.setItem('cro.loc.auto.'+u.slot,'0');paint();renderRoster();
    if(writeJob)try{await writeJob}catch(_){}
    await clearRemote(u);
    void pruneOwnHistory(true);
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
    const n=epoch,u={...currentUser};
    refreshJob=(async()=>{
      try{
        await checkResetControl();if(!same(n,u))return;
        const j=await request('locations/'+TRIP_CODE);if(!same(n,u))return;
        const cache={};Object.entries(j||{}).forEach(([k,v])=>{if(APP_BY_SLOT[k]&&valid(v)&&age(v)<RETAIN)cache[k]=v});
        locCache=cache;readError=false;readAt=Date.now();localStorage.setItem('loc_read',String(readAt));
        const e=document.getElementById('locBackendState');if(e)e.textContent='Firebase 조회 정상 · 최근 24시간만 조회·표시 · '+textClock(readAt);
        renderRoster();void pruneOwnHistory(false);
      }catch(e){
        readError=true;const el=document.getElementById('locBackendState');if(el)el.textContent='조회 실패 · 이전 위치일 수 있습니다. '+e.message;
        if(manual)message=e.message;paint();renderRoster();
      }finally{refreshJob=null}
    })();return refreshJob;
  };
  const previousLogout=window.appLogout;
  window.appLogout=async function(){loggingOut=true;try{return await previousLogout.apply(this,arguments)}finally{loggingOut=false}};
  window.updateLiveLocChip=paint;
  // Age is text only. Marker colours never encode elapsed time.
  function statusOf(r){if(!valid(r)||age(r)>=RETAIN)return '최근 24시간 위치 없음';if(r.sharing===false)return 'OFF · 마지막 위치';if(enabled(r))return age(r)<=FRESH?'ON · 최근 위치':'ON · 이전 위치';return '이전 위치 · 현재 ON/OFF 미확인'}
    let readError=false;
  function visibleState(u,r){
    if(valid(r)&&age(r)<RETAIN){
      if(u.slot===currentUser?.slot&&!want)return {label:'OFF',on:false,detail:'마지막 위치 · '+ago(r.ts)};
      if(enabled(r))return {label:'ON',on:true,detail:ago(r.ts)};
      return {label:r.sharing===false?'OFF':'이전',on:false,detail:'마지막 위치 · '+ago(r.ts)};
    }
    return {label:readAt?'OFF':'미확인',on:false,detail:readAt?'24시간 내 위치 없음':'조회 대기'};
  }
  window.renderRoster=function(){
    const box=document.getElementById('locRoster');if(!box)return;
    const focusSlot=document.activeElement?.dataset?.locationSlot;
    const summary=[1,2,3,4,0].map(g=>{
      const list=APP_USERS.filter(u=>u.group===g).sort((a,b)=>a.groupOrder-b.groupOrder);
      const online=list.filter(u=>visibleState(u,locCache[u.slot]).on).length;
      const located=list.filter(u=>valid(locCache[u.slot])&&age(locCache[u.slot])<RETAIN).length;
      return {g,list,online,located};
    });
    const online=summary.reduce((n,g)=>n+g.online,0),located=summary.reduce((n,g)=>n+g.located,0);
    box.className='roster loc5-board is-compact-v73';
    let html='';
    for(const item of summary){
      const {g,located:groupLocated}=item,list=item.list.filter(locUserMatchesFilter);if(!list.length)continue;
      html+=`<section class="loc5-group" data-location-group="${g}" style="--group:${locGroupColor(g)}"><header><h4>${g?g+'조':'인솔 교수'}</h4><span>ON <b>${item.online}</b> · 위치 ${groupLocated}/${item.list.length}</span></header><div class="loc5-members">`;
      for(const u of list){
        const r=locCache[u.slot],di=distanceInfo(r,u),s=visibleState(u,r),me=u.slot===currentUser?.slot;
        const meta=valid(r)&&age(r)<RETAIN?locationClock(r)+' · '+ago(r.ts):s.detail;
        html+=`<button class="loc5-person ${u.leader?'is-leader':''} ${s.on?'is-on':'is-off'}" type="button" data-location-slot="${u.slot}" onclick="locOpenPerson('${u.slot}')" aria-label="${esc(u.name)}, ${s.label}, ${esc(di.label)}"><span class="loc5-name"><b>${esc(u.name)}</b>${u.leader?'<small>조장</small>':''}${me?'<small>나</small>':''}</span><span class="loc5-status">${s.label}</span><span class="distance-value" data-metres="${di.metres??''}">${esc(di.label)}</span><span class="loc5-meta">${esc(meta)}</span></button>`;
      }
      html+='</div></section>';
    }
    box.innerHTML=html;
    if(focusSlot)box.querySelector(`[data-location-slot="${focusSlot}"]`)?.focus({preventScroll:true});
    const liveEl=document.getElementById('locLiveCount'),offEl=document.getElementById('locOffCount'),staleEl=document.getElementById('locStaleCount'),refreshEl=document.getElementById('locLastRefresh');
    if(liveEl)liveEl.textContent=located;if(offEl)offEl.textContent=APP_USERS.length-located;if(staleEl)staleEl.textContent=APP_USERS.filter(u=>enabled(locCache[u.slot])&&age(locCache[u.slot])>FRESH).length;if(refreshEl)refreshEl.textContent=readAt?textClock(readAt):'-';
    const note=document.getElementById('locStateNote');if(note)note.textContent=readError?'조회 실패 · 마지막 위치의 시각을 확인해 주세요.':readAt?'이름을 누르면 마지막 위치와 시간을 확인할 수 있습니다.':'위치 정보를 불러오는 중입니다.';
    paint();updateMarkers();
  };
  document.addEventListener('click',e=>{const g=e.target.closest('[data-loc-group]');if(g){const f=g.dataset.locGroup;locSetFilter(f,document.querySelector('#locFilters [data-filter="'+f+'"]'));}});
  window.locOpenPerson=async function(slot){const u=APP_BY_SLOT[slot],r=locCache[slot],box=document.getElementById('locPersonDetail');if(!u||!box)return;const d=distanceInfo(r,u),me=slot===currentUser?.slot,isAdmin=currentUser?.name===(window.GSPA_TRIP?.locationAdmin||window.GSPA_TRIP?.attendanceOperator||'한상호');box.classList.add('show');let actions='';if(me){actions=`<button class="primary" onclick="locLoadHistory('${slot}',true)">내 24시간 이동이력</button>`}else if(valid(r)){actions=`<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}">Google 지도에서 보기</a>`}const precision=isAdmin&&valid(r)?` · GPS 약 ${Math.round(r.accuracy||0)}m`:'';box.innerHTML=`<div class="loc-simple-head"><h3>${esc(u.name)}</h3><button type="button" onclick="this.closest('#locPersonDetail').classList.remove('show')">닫기</button></div><b>${esc(d.label)}</b><p>${esc(statusOf(r))}${valid(r)?'<br>'+locationClock(r)+' · '+ago(r.ts)+precision:'<br>최근 24시간 내 위치 없음'}</p>${actions?`<div class="actions">${actions}</div>`:''}`;box.scrollIntoView({behavior:'smooth',block:'nearest'});};
  function mapLabel(u,r){const d=distanceInfo(r,u),st=visibleState(u,r),core=d.metres!==null?d.label:st.label;return esc(u.name)+' · '+esc(core)+' · '+esc(ago(r.ts))}
  function popup(u,r){return `<b>${esc(u.name)} · ${u.group?u.group+'조':'교수'}</b><p>${esc(statusOf(r))}<br>${esc(distanceInfo(r,u).label)}<br>${locationClock(r)} · ${ago(r.ts)}</p>`}
  window.makeGoogleOverlay=function(u,r){class M extends google.maps.OverlayView{onAdd(){const d=document.createElement('div');d.className='g-overlay';d.innerHTML=`<div class="group-marker ${u.slot===currentUser?.slot?'is-self':''}" style="--group:${locGroupColor(u.group)}"><span class="group-marker-label">${mapLabel(u,r)}</span></div>`;d.onclick=()=>{googleInfo.setContent(popup(u,r));googleInfo.setPosition({lat:r.lat,lng:r.lng});googleInfo.open(mapObj)};this.div=d;this.getPanes().overlayMouseTarget.appendChild(d)}draw(){const p=this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(r.lat,r.lng));if(this.div){this.div.style.left=p.x+'px';this.div.style.top=p.y+'px'}}onRemove(){this.div?.remove()}}const o=new M();o.setMap(mapObj);return o;};
  let fitKey='';
  window.updateMarkers=function(){if(!mapObj)return;const users=Object.entries(locCache).filter(([k,r])=>APP_BY_SLOT[k]&&locUserMatchesFilter(APP_BY_SLOT[k])&&valid(r)&&age(r)<RETAIN);const key=locMapEngine+'|'+locFilter+'|'+users.map(([k])=>k).sort().join(',');
    if(locMapEngine==='google'&&window.google?.maps&&mapObj.getDiv){googleOverlays.forEach(x=>x.setMap(null));googleOverlays=[];const bounds=new google.maps.LatLngBounds();users.forEach(([k,r])=>{googleOverlays.push(makeGoogleOverlay(APP_BY_SLOT[k],r));bounds.extend({lat:r.lat,lng:r.lng})});if(users.length&&key!==fitKey){if(users.length===1){mapObj.setCenter(bounds.getCenter());mapObj.setZoom(16)}else mapObj.fitBounds(bounds,55);fitKey=key}}
    else if(locMapEngine==='leaflet'&&window.L&&mapObj.invalidateSize){markers.forEach(m=>mapObj.removeLayer(m));markers=[];const pts=[];users.forEach(([k,r])=>{const u=APP_BY_SLOT[k],icon=L.divIcon({className:'dual-leaf',html:`<div class="group-marker ${u.slot===currentUser?.slot?'is-self':''}" style="--group:${locGroupColor(u.group)}"><span class="group-marker-label">${mapLabel(u,r)}</span></div>`,iconSize:[24,24],iconAnchor:[12,12]});markers.push(L.marker([r.lat,r.lng],{icon}).addTo(mapObj).bindPopup(popup(u,r)));pts.push([r.lat,r.lng])});if(pts.length&&key!==fitKey){if(pts.length===1)mapObj.setView(pts[0],16);else mapObj.fitBounds(pts,{padding:[55,55],maxZoom:17});fitKey=key}}
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
    locRefreshAll(false);void pruneOwnHistory(true);ensureSessionLoops();
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
    if(now-lastPruneAt>PRUNE_EVERY)tasks.push(pruneOwnHistory(false));
    await Promise.allSettled(tasks);
  }
  window.addEventListener('online',resumeVisible);
  window.addEventListener('pageshow',resumeVisible);
  window.addEventListener('focus',resumeVisible);
  document.addEventListener('visibilitychange',()=>{paint();if(!document.hidden)resumeVisible()});
  document.addEventListener('resume',resumeVisible);
  document.addEventListener('click',e=>{if(e.target.closest('#locationHeaderToggle,#briefLocationLink')){e.preventDefault();want?locStopSharing():locStartSharing()}});
  window.addEventListener('cro-route',e=>{
    // Keep ON/OFF and the timers alive across today / schedule / group / more.
    ensureSessionLoops();paint();
    if(e.detail?.view==='location'){renderRoster();locRefreshAll(false)}
  });
  document.addEventListener('DOMContentLoaded',()=>{paint();renderRoster();if(currentUser)changed()});
  window.LocationSession={paint,resume:resumeVisible,refresh:()=>locRefreshAll(true),distance,info:distanceInfo,applyAdminReset:(ts)=>applyResetLocal(ts),get state(){return {want,phase,message,owner:owner?.slot,lastSentAt:ack,lastFix:fix,stopPending:!!retryStop,publishEveryMs:PERIOD,readEveryMs:120000,publisherRunning:!!timer,readerRunning:!!readTimer,scope:'app-wide',retentionMs:RETAIN,lastPruneAt}}};
})();
