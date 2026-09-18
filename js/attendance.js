/* MIX02: one current round, 28 fixed identities, leader-first group board.
 * Existing attendanceCurrent/<trip> and attendance/<trip>/<event>/<slot> paths are unchanged.
 * Firebase REST SSE: https://firebase.google.com/docs/reference/rest/database#section-streaming
 * Start/reset remain limited to the original operator (Han) in the client UI.
 * Existing server-side access rules are intentionally not weakened or replaced here.
 */
(function(){
  'use strict';
  const OPERATOR='한상호', order=[1,2,3,4,0], encoder=new TextEncoder();
  const people=()=>APP_USERS;
  const isAdmin=()=>currentUser?.name===OPERATOR;
  const sameSession=e=>e===authEpoch&&!!currentUser;
  let authEpoch=0,revision=0,refreshTask=null,adminBusy=false,selfBusy=false;
  let known=false,checksKnown=false,lastSync=0,lastPoll=0,lastRetry=0,lastVerify=0;
  let timer=null,currentStream=null,checksStream=null,checksStreamId='',opening=false;
  let currentStreamOK=false,checksStreamOK=false,connectMode='waiting',failure='';
  const sorted=g=>people().filter(u=>u.group===g).sort((a,b)=>Number(b.leader)-Number(a.leader)||a.groupOrder-b.groupOrder);
  const checked=u=>attChecks?.[u.slot]?.checked===true;
  const shortTime=t=>Number.isFinite(+t)&&+t>0?new Intl.DateTimeFormat('ko-KR',{timeZone:'Europe/Zagreb',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(+t)):'';
  function feedback(text='',bad=false){const e=document.getElementById('attFeedback');if(e){e.hidden=!text;e.textContent=text;e.classList.toggle('is-error',bad)}}
  function setMode(){
    if(!currentUser)connectMode='waiting';
    else if(document.hidden)connectMode='paused';
    else if(!navigator.onLine)connectMode='offline';
    else if(currentStreamOK&&(!attCurrent||checksStreamOK))connectMode='live';
    else if(failure)connectMode='error';
    else connectMode=lastSync?'poll':'connecting';
  }
  function syncLabel(){setMode();const time=lastSync?shortTime(lastSync):'';
    return connectMode==='live'?'● 실시간 연결':connectMode==='poll'?'5초 간격 확인'+(time?' · '+time:''):connectMode==='offline'?'연결 끊김'+(time?' · 마지막 '+time:''):connectMode==='error'?'연결 확인 필요'+(time?' · 마지막 '+time:''):connectMode==='paused'?'화면 복귀 시 동기화':connectMode==='connecting'?'연결 중…':'로그인 후 연결';
  }
  function activeMeta(value){return value&&typeof value==='object'&&typeof value.id==='string'?value:null}
  function setMeta(value){
    const next=activeMeta(value),changed=(attCurrent?.id||'')!==(next?.id||'');
    attCurrent=next;known=true;
    if(changed){attChecks={};checksKnown=!next;closeChecks();}
    if(!next)checksKnown=true;
    return changed;
  }
  function notify(){window.dispatchEvent(new CustomEvent('cro-att-change'))}
  function render(){
    const box=document.getElementById('attRoster');if(!box)return;
    const active=!!attCurrent,ready=known&&(!active||checksKnown);
    const done=active&&ready?people().filter(checked).length:0,total=people().length,missing=total-done;
    document.getElementById('attTotalCount').textContent=total;
    document.getElementById('attCheckedCount').textContent=ready?done:'–';
    document.getElementById('attMissingCount').textContent=ready?missing:'–';
    const state=document.getElementById('attStateLabel');
    state.textContent=!known?'연결 중':!active?'대기':!checksKnown?'확인 중':done===total?'모두 확인':'진행 중';
    state.classList.toggle('is-open',active);state.classList.toggle('is-complete',active&&ready&&done===total);
    document.getElementById('attTitle').textContent='28명 출석 확인';
    document.getElementById('attMeta').textContent=active?(shortTime(attCurrent.createdAt)+' 시작 · 크로아티아 시간'):'시작하면 본인의 출석 버튼을 눌러 주세요.';
    const sync=document.getElementById('attSyncStatus');sync.textContent=syncLabel();sync.dataset.mode=connectMode;
    const admin=document.getElementById('attAdmin');admin.classList.toggle('show',isAdmin());admin.hidden=!isAdmin();
    const canWrite=currentUser&&navigator.onLine&&ready&&!adminBusy;
    document.getElementById('attStartBtn').disabled=!canWrite||active;
    document.getElementById('attResetBtn').disabled=!canWrite||!active;
    const mine=currentUser&&checked(currentUser),btn=document.getElementById('attMyBtn');
    btn.disabled=!canWrite||!active||!!mine||selfBusy;
    btn.classList.toggle('checked',!!mine&&active);
    btn.textContent=selfBusy?'저장 중…':!active?'시작을 기다리고 있습니다':mine?'✓ 내 체크완료 · '+shortTime(attChecks[currentUser.slot]?.ts):'✓ 내 출석 체크';
    const notice=document.getElementById('attMissingNotice');
    notice.classList.toggle('all-done',active&&ready&&!missing);
    notice.textContent=!ready?'최신 출석을 불러오는 중입니다.':!active?'회색 이름은 아직 미체크 상태입니다.':!missing?'✓ 28명 모두 체크했습니다.':missing<=10?'미체크 '+missing+'명 · '+people().filter(u=>!checked(u)).map(u=>u.name).join(' · '):'미체크 '+missing+'명 · 아래 조별 회색 이름을 확인하세요.';
    const mini=document.getElementById('att2GroupTotals');
    if(mini)mini.innerHTML=order.map(g=>{const mem=sorted(g),n=active&&ready?mem.filter(checked).length:0;return '<div class="'+(active&&ready&&n===mem.length?'done':'')+'"><span>'+(g?g+'조':'교수')+'</span><b>'+(ready?n:'–')+'<small>/'+mem.length+'</small></b></div>'}).join('');
    notice.hidden=ready&&missing>10;
    // Update small rows in place, so network refreshes do not move scroll or focus.
    for(const g of order){
      const list=sorted(g);let panel=box.querySelector('[data-att-group="'+g+'"]');
      if(!panel){panel=document.createElement('section');panel.className='att2-group';panel.dataset.attGroup=String(g);panel.innerHTML='<header><h4></h4><span class="att2-group-count"></span></header><div class="att2-members"></div>';box.appendChild(panel);}
      const n=active&&ready?list.filter(checked).length:0;
      panel.querySelector('h4').textContent=g?g+'조':'인솔 교수';
      panel.querySelector('.att2-group-count').textContent=(ready?n:'–')+'/'+list.length+(ready?' · 미체크 '+(list.length-n):' · 확인 중');
      panel.classList.toggle('complete',active&&ready&&n===list.length);
      const rows=panel.querySelector('.att2-members');
      for(const u of list){let row=rows.querySelector('[data-att-slot="'+u.slot+'"]');
        if(!row){row=document.createElement('div');row.className='att2-person';row.dataset.attSlot=u.slot;row.dataset.person=u.name;
          const badge=u.leader?'<span class="att2-leader">조장</span>':u.presenter?'<span class="att2-presenter">발표</span>':'';
          row.innerHTML='<span class="att2-lamp" aria-hidden="true"></span><div class="att2-person-name"><b>'+esc(u.name)+'</b>'+badge+'</div><div class="att2-person-state"><strong></strong><time></time></div>';rows.appendChild(row);
        }
        const ok=active&&ready&&checked(u);
        row.classList.toggle('is-checked',!!ok);row.classList.toggle('is-leader',!!u.leader);
        row.querySelector('strong').textContent=!ready?'확인 중':ok?'완료':'미체크';
        const time=row.querySelector('time');time.textContent=ok?shortTime(attChecks[u.slot]?.ts):'';
        row.setAttribute('aria-label',u.name+(u.leader?' 조장':'')+' · '+(!ready?'확인 중':ok?'체크완료 '+time.textContent:'미체크'));
      }
    }
  }
  function markGood(){failure='';lastSync=Date.now();setMode();render();notify()}
  function markError(e){failure=e?.message||'연결 실패';setMode();render()}
  function cleanChecks(data){
    const result={};if(!data||typeof data!=='object')return result;
    for(const u of people()){const c=data[u.slot];if(c&&typeof c==='object'&&c.checked===true)result[u.slot]=c;}
    return result;
  }
  async function request(path,options={}){
    try{return await Integration.api(path,options)}catch(e){
      if([401,403].includes(e.status)){const err=Error('출석 데이터에 접근할 수 없습니다. 기존 Firebase 출석 규칙을 확인해 주세요.');err.status=e.status;throw err}throw e;
    }
  }
  const currentPath=()=> 'attendanceCurrent/'+TRIP_CODE;
  const roundPath=id=>'attendance/'+TRIP_CODE+'/'+id;
  async function refresh(manual=false){
    if(!currentUser)return;
    if(refreshTask)return refreshTask;
    if(!navigator.onLine){markError(Error('오프라인 상태입니다.'));return}
    const epoch=authEpoch;
    refreshTask=(async()=>{
      try{
        const rev=revision,res=await request(currentPath());if(!sameSession(epoch))return;
        if(rev===revision)setMeta(res.data);
        const id=attCurrent?.id,rev2=revision;
        if(id){const checks=await request(roundPath(id));if(!sameSession(epoch))return;if(attCurrent?.id===id&&revision===rev2){attChecks=cleanChecks(checks.data);checksKnown=true;}}
        lastPoll=Date.now();markGood();if(currentStreamOK&&attCurrent&&!checksStream)openCheckStream();
      }catch(e){markError(e);if(manual)feedback(e.message,true)}
      finally{refreshTask=null;}
    })();
    return refreshTask;
  }
  // Firebase relative path put/patch handling, including nested patch paths.
  function setAt(root,path,value){
    const parts=String(path||'/').split('/').filter(Boolean);if(parts.some(x=>['__proto__','constructor','prototype'].includes(x)))throw Error('Invalid event path');
    if(!parts.length)return value;
    let out=root&&typeof root==='object'?JSON.parse(JSON.stringify(root)):{},o=out;
    for(const k of parts.slice(0,-1)){if(!o[k]||typeof o[k]!=='object')o[k]={};o=o[k];}
    const last=parts[parts.length-1];if(value===null)delete o[last];else o[last]=value;return out;
  }
  function applyEvent(root,type,msg){if(type==='put')return setAt(root,msg.path,msg.data);let out=root;
    for(const [k,v] of Object.entries(msg.data||{}))out=setAt(out,(msg.path==='/'?'':msg.path)+'/'+k,v);return out;
  }
  function meterEvent(event){if(window.AppTraffic){AppTraffic.totals.received+=encoder.encode(event.data||'').byteLength;AppTraffic.paint();}}
  function closeChecks(){if(checksStream)checksStream.close();checksStream=null;checksStreamId='';checksStreamOK=false;}
  function closeStreams(){if(currentStream)currentStream.close();currentStream=null;currentStreamOK=false;closeChecks();opening=false;}
  function streamFailed(which,es,why){
    es.close();if(which==='current'&&currentStream===es){currentStream=null;currentStreamOK=false;}if(which==='checks'&&checksStream===es){checksStream=null;checksStreamId='';checksStreamOK=false;}
    if(why)failure=why;lastRetry=Date.now();render();
  }
  function wire(es,which,epoch,id=''){
    const live=()=>sameSession(epoch)&&((which==='current'&&es===currentStream)||(which==='checks'&&es===checksStream&&id===attCurrent?.id));
    if(window.AppTraffic){AppTraffic.totals.requests++;AppTraffic.paint();}
    for(const type of ['put','patch'])es.addEventListener(type,event=>{
      if(!live())return;
      try{
        const msg=JSON.parse(event.data);if(!msg||!Object.prototype.hasOwnProperty.call(msg,'data'))return;meterEvent(event);revision++;
        if(which==='current'){
          currentStreamOK=true;const changed=setMeta(applyEvent(attCurrent,type,msg));
          if(attCurrent&&(changed||!checksStream))openCheckStream();
        }else{checksStreamOK=true;attChecks=cleanChecks(applyEvent(attChecks,type,msg));checksKnown=true;}
        markGood();
      }catch(e){streamFailed(which,es,'실시간 응답을 다시 확인합니다.');refresh(false);}
    });
    es.addEventListener('keep-alive',()=>{if(live()){lastSync=Date.now();render();}});
    es.addEventListener('cancel',event=>{if(live()){meterEvent(event);streamFailed(which,es,'Firebase 출석 조회 권한을 확인해 주세요.');}});
    es.addEventListener('auth_revoked',()=>{if(!live())return;localStorage.setItem('fb_exp','0');streamFailed(which,es,'인증 갱신 중');reconnect();});
    es.onerror=()=>{if(live())streamFailed(which,es,'');};
  }
  async function openCheckStream(){
    if(!currentUser||document.hidden||!navigator.onLine||!window.EventSource)return;
    const epoch=authEpoch,id=attCurrent?.id;if(!id)return;
    if(checksStream&&checksStreamId===id)return;
    closeChecks();checksStreamId=id;
    try{
      const tk=await token();if(!sameSession(epoch)||id!==attCurrent?.id||checksStream||document.hidden)return;
      checksStream=new EventSource(attPath(id)+'?auth='+encodeURIComponent(tk));checksStreamId=id;wire(checksStream,'checks',epoch,id);
    }catch(e){markError(e)}
  }
  async function openStreams(){
    if(!currentUser||document.hidden||!navigator.onLine||!window.EventSource||opening)return;
    if(currentStream){if(attCurrent&&!checksStream)openCheckStream();return}
    const epoch=authEpoch;opening=true;lastRetry=Date.now();
    try{const tk=await token();if(!sameSession(epoch)||document.hidden||currentStream)return;currentStream=new EventSource(attCurrentPath()+'?auth='+encodeURIComponent(tk));wire(currentStream,'current',epoch);if(attCurrent)openCheckStream();}
    catch(e){markError(e)}finally{opening=false;}
  }
  async function reconnect(){closeStreams();await refresh(false);openStreams();}
  function begin(){
    clearInterval(timer);clearInterval(attTimer);
    render();if(currentUser){refresh(false);openStreams();}
    timer=setInterval(()=>{
      if(!currentUser||document.hidden)return;
      const live=currentStreamOK&&(!attCurrent||checksStreamOK);
      if(!live&&Date.now()-lastPoll>=4500)refresh(false);
      if(live&&Date.now()-lastVerify>60000){lastVerify=Date.now();refresh(false);}
      if(!currentStream&&Date.now()-lastRetry>=60000)openStreams();
      if(currentStreamOK&&attCurrent&&!checksStream&&Date.now()-lastRetry>=60000){lastRetry=Date.now();openCheckStream();}
      render();
    },5000);
  }
  async function create(){
    if(!isAdmin()){feedback('시작·리셋은 기존 담당자인 한상호만 사용할 수 있습니다.',true);return}
    if(adminBusy)return;if(!navigator.onLine){feedback('인터넷 연결 후 시작해 주세요.',true);return}
    adminBusy=true;feedback();render();const epoch=authEpoch;
    try{
      const res=await request(currentPath(),{headers:{'X-Firebase-ETag':'true'}});
      if(!sameSession(epoch)||!isAdmin())return;
      if(activeMeta(res.data)){setMeta(res.data);throw Error('이미 진행 중입니다. 다시 확인하려면 리셋 후 시작해 주세요.');}
      if(!res.etag)throw Error('서버 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
      const random=new Uint32Array(1);crypto.getRandomValues(random);const id=String(Date.now())+'-'+random[0].toString(36);
      const data={id,title:'28명 출석 확인',type:'출석 확인',createdBy:OPERATOR,createdAt:{'.sv':'timestamp'}};
      const saved=await request(currentPath(),{method:'PUT',headers:{'if-match':res.etag},body:JSON.stringify(data)});
      if(!sameSession(epoch))return;
      revision++;setMeta(saved.data);attChecks={};checksKnown=true;markGood();openCheckStream();feedback();
    }catch(e){feedback(e.status===412?'다른 기기에서 먼저 시작했습니다. 새 현황을 불러옵니다.':e.message,true);await refresh(false);}
    finally{adminBusy=false;render();}
  }
  async function reset(){
    if(!isAdmin()){feedback('시작·리셋은 기존 담당자인 한상호만 사용할 수 있습니다.',true);return}
    if(adminBusy||!attCurrent)return;
    if(!confirm('현재 출석을 리셋할까요?\n28명이 미체크 대기 상태로 돌아갑니다.\n다시 확인하려면 시작을 누르세요. 이전 기록은 보존됩니다.'))return;
    adminBusy=true;feedback();render();const id=attCurrent.id,epoch=authEpoch;
    try{
      if(!navigator.onLine)throw Error('인터넷 연결 후 리셋해 주세요.');
      const res=await request(currentPath(),{headers:{'X-Firebase-ETag':'true'}});
      if(!sameSession(epoch)||!isAdmin())return;
      if(!res.data){setMeta(null);markGood();return}
      if(res.data.id!==id)throw Error('출석 회차가 바뀌었습니다. 최신 현황을 확인한 후 다시 눌러 주세요.');
      if(!res.etag)throw Error('서버 상태를 확인하지 못했습니다.');
      await request(currentPath(),{method:'DELETE',headers:{'if-match':res.etag}});
      if(!sameSession(epoch))return;
      revision++;setMeta(null);markGood();feedback();
    }catch(e){feedback(e.status===412?'다른 기기에서 출석이 변경되어 리셋하지 않았습니다.':e.message,true);await refresh(false);}
    finally{adminBusy=false;render();}
  }
  async function checkSelf(){
    if(!currentUser||!attCurrent||selfBusy||checked(currentUser))return;
    const user=currentUser,id=attCurrent.id,epoch=authEpoch;selfBusy=true;feedback();render();
    try{
      if(!navigator.onLine)throw Error('인터넷 연결이 없습니다. 연결 후 다시 체크해 주세요.');
      const latest=await request(currentPath());
      if(!sameSession(epoch)||currentUser?.slot!==user.slot)return;
      if(latest.data?.id!==id){revision++;setMeta(latest.data);throw Error('출석이 리셋되거나 바뀌었습니다. 새 출석에서 다시 체크해 주세요.');}
      const path=roundPath(id)+'/'+user.slot;
      const previous=await request(path,{headers:{'X-Firebase-ETag':'true'}});
      let saved=previous.data;
      if(!saved?.checked){
        if(!previous.etag)throw Error('체크 상태를 확인하지 못했습니다. 다시 눌러 주세요.');
        const value={uid:localStorage.getItem('fb_uid')||'',slot:user.slot,name:user.name,group:user.group,checked:true,ts:{'.sv':'timestamp'}};
        saved=(await request(path,{method:'PUT',headers:{'if-match':previous.etag},body:JSON.stringify(value)})).data;
      }
      const confirmRound=await request(currentPath());if(!sameSession(epoch))return;
      if(confirmRound.data?.id!==id){revision++;setMeta(confirmRound.data);throw Error('확인 중 리셋되었습니다. 새 출석에서 다시 눌러 주세요.');}
      if(attCurrent?.id===id){revision++;attChecks[user.slot]=saved;checksKnown=true;markGood();feedback();}
    }catch(e){
      if(e.status===412){await refresh(false);feedback(checked(user)?'이미 체크되었습니다.':'현황이 바뀌었습니다. 다시 확인해 주세요.',!checked(user));}
      else{feedback(e.message,true);await refresh(false);}
    }finally{selfBusy=false;render();}
  }
  window.attRefresh=refresh;window.attRender=render;window.attCreateEvent=create;window.attResetCurrent=reset;window.attToggleSelf=checkSelf;window.attStartPolling=begin;
  window.AttendanceBoard={get status(){return {mode:connectMode,known,checksKnown,round:attCurrent?.id||null,lastSync}},refresh};
  window.addEventListener('cro-auth-change',()=>{authEpoch++;revision++;closeStreams();attCurrent=null;attChecks={};known=false;checksKnown=false;lastSync=0;failure='';selfBusy=false;feedback();begin();});
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='group'&&e.detail?.sub!=='people'&&currentUser){render();refresh(false);openStreams();}});
  window.addEventListener('offline',()=>{closeStreams();render()});
  window.addEventListener('online',()=>{failure='';reconnect()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){closeStreams();render()}else if(currentUser)reconnect()});
  window.addEventListener('pagehide',closeStreams);
  window.addEventListener('pageshow',()=>{if(currentUser)reconnect()});
  document.addEventListener('DOMContentLoaded',begin);
})();