/* Staff roles, current-group rendering and shared Firebase transport. */
(function(){
  let authInFlight=null,filter='all';
  const byName=new Map(TEAM_MEMBERS.map(u=>[u.name,u]));
  const staff=new Set(Object.keys(STAFF_ROLES));
  const isStaff=()=>!!currentUser&&staff.has(currentUser.name);
  const idOf=u=>u.memberId;
  function escape(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function uidFromToken(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).sub||''}catch(_){return ''}}
  function persistToken(j,refresh=false){
    const t=refresh?j.id_token:j.idToken;
    const uid=(refresh?j.user_id:j.localId)||uidFromToken(t);
    if(!t||!uid)throw Error('Firebase 인증 응답을 확인할 수 없습니다.');
    localStorage.setItem('fb_tok',t);localStorage.setItem('fb_uid',uid);
    localStorage.setItem('fb_rf',(refresh?j.refresh_token:j.refreshToken)||localStorage.getItem('fb_rf')||'');
    localStorage.setItem('fb_exp',String(Date.now()+Math.max(60,(+(j.expires_in||j.expiresIn)||3600)-120)*1000));
    return t;
  }
  // Avoid parallel anonymous signups assigning two different device UIDs.
  window.token=async function(){
    const old=localStorage.getItem('fb_tok'),exp=+(localStorage.getItem('fb_exp')||0);
    if(old&&Date.now()<exp){if(!localStorage.getItem('fb_uid')){const u=uidFromToken(old);if(u)localStorage.setItem('fb_uid',u)}return old}
    if(authInFlight)return authInFlight;
    authInFlight=(async()=>{
      const rf=localStorage.getItem('fb_rf');let r,j;
      if(rf){
        r=await fetch('https://securetoken.googleapis.com/v1/token?key='+encodeURIComponent(firebaseConfig.apiKey),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:rf})});
        j=await r.json();if(!r.ok)throw Error('Firebase 인증 갱신 실패. 연결을 확인해 주세요. 기존 기기 ID를 임의로 바꾸지 않았습니다.');
        return persistToken(j,true);
      }
      r=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+encodeURIComponent(firebaseConfig.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
      j=await r.json();if(!r.ok)throw Error('Firebase 익명 인증을 확인해 주세요.');return persistToken(j,false);
    })();
    try{return await authInFlight}finally{authInFlight=null}
  };
  async function api(path,options={}){
    const tk=await token();
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),16000);
    try{
      const url=firebaseConfig.databaseURL.replace(/\/$/,'')+'/'+path+'.json?auth='+encodeURIComponent(tk);
      const res=await fetch(url,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})},cache:'no-store',signal:controller.signal});
      const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch(_){}
      if(!res.ok){const e=Error(res.status===412?'다른 운영진이 수정했습니다. 최신 기록을 다시 불러와 주세요.':[401,403].includes(res.status)?'접근 권한이 없습니다. Firebase 운영진 기기 ID 등록을 확인해 주세요.':'서버 저장·조회에 실패했습니다. ('+res.status+')');e.status=res.status;e.path=path;e.method=options.method||'GET';throw e}
      return {data,etag:res.headers.get('ETag')};
    }catch(e){if(e.name==='AbortError')throw Error('연결 시간이 초과되었습니다. 입력 내용은 초안으로 보관됩니다.');throw e}finally{clearTimeout(timer)}
  }
  function badges(u){let b='';if(u.leader)b+='<span class="role-badge group-lead">조장</span>';if(u.presenter&&!u.leader)b+='<span class="role-badge presenter">발표</span>';if(u.tripRole)b+='<span class="role-badge staff">연수 '+escape(u.tripRole)+'</span>';return b}
  function personCard(u){
    const tel='+82'+u.phone.replace(/\D/g,'').slice(1);
    return `<article class="person-card ${u.leader?'is-leader':''}" data-person="${escape(u.name)}"><div class="person-title"><b>${escape(u.name)}</b>${badges(u)}</div><div class="person-org">${escape(u.org)} · ${escape(u.title)}</div><div class="person-meta">${u.birthYear?u.birthYear+'년생 · 만 '+u.age+'세':'생년·만 나이 미제공'}${u.group===0?' · 인솔 교수':''}</div><div class="person-actions"><a href="tel:${tel}" aria-label="${escape(u.name)}에게 전화">☎ 전화</a><button type="button" data-person-location="${u.slot}">⌖ 위치</button><button type="button" data-person-phone="${escape(u.phone)}">번호 보기</button></div></article>`;
  }
  function renderPeople(){
    const box=document.getElementById('peopleRoster');if(!box)return;
    const q=(document.getElementById('peopleSearch')?.value||'').replace(/\s/g,'').toLowerCase();
    document.getElementById('tripStaff').innerHTML='<strong>연수 운영진</strong><br>팀장 위재복 · 부팀장 한상호 / 장현웅 · 총무 이상미';
    document.getElementById('peopleFilters').innerHTML=[['all','전체'],['1','1조'],['2','2조'],['3','3조'],['4','4조'],['0','교수']].map(([f,label])=>`<button type="button" data-people-filter="${f}" class="${filter===f?'active':''}" aria-pressed="${filter===f}">${label}</button>`).join('');
    let result='';
    for(const g of [1,2,3,4,0]){
      if(filter!=='all'&&filter!==String(g))continue;
      const members=TEAM_MEMBERS.filter(u=>u.group===g&&(!q||(u.name+u.org+u.title+u.tripRole).replace(/\s/g,'').toLowerCase().includes(q))).sort((a,b)=>a.groupOrder-b.groupOrder);
      if(!members.length)continue;
      const total=TEAM_MEMBERS.filter(u=>u.group===g).length;
      result+=`<section class="people-group" data-people-group="${g}"><header><h3>${g?g+'조':'인솔 교수'}</h3><span>${q?members.length+' / ':''}${total}명</span></header><div class="people-grid">${members.map(personCard).join('')}</div></section>`;
    }
    box.innerHTML=result||'<div class="empty-card">검색 결과가 없습니다.</div>';
  }
  function applyIdentity(){
    document.querySelectorAll('[data-staff-only]').forEach(el=>el.hidden=!isStaff());
    const e=document.getElementById('tripRoleText');if(e)e.textContent=currentUser?[(currentUser.group?currentUser.group+'조':'인솔 교수'),currentUser.leader?'조장':'',currentUser.presenter&&!currentUser.leader?'발표':'',currentUser.tripRole?'연수 '+currentUser.tripRole:''].filter(Boolean).join(' · '):'';
    const box=document.getElementById('myFirebaseUid');if(box){box.hidden=true;box.textContent=''}
    if(!isStaff()&&window.AppRouter?.current==='expenses')AppRouter.go('today');
    window.dispatchEvent(new CustomEvent('cro-role-ready'));
  }
  async function showIdentity(){
    const e=document.getElementById('myFirebaseUid');e.hidden=false;e.textContent='인증 ID 확인 중…';
    try{await token();e.textContent=localStorage.getItem('fb_uid')||'기기 ID 확인 실패'}catch(err){e.textContent=err.message}
  }
  function feedback(el,text,kind=''){if(el){el.className='form-feedback '+kind;el.textContent=text}}
  window.Integration={isStaff,idOf,escape,api,showIdentity,renderPeople,feedback,byName,get build(){return '20260918-MIX01'}};
  window.addEventListener('cro-auth-change',applyIdentity);
  document.addEventListener('input',e=>{if(e.target.id==='peopleSearch')renderPeople()});
  document.addEventListener('click',e=>{
    const f=e.target.closest('[data-people-filter]');if(f){filter=f.dataset.peopleFilter;renderPeople()}
    const p=e.target.closest('[data-person-phone]');if(p)alert(p.dataset.personPhone);
    const m=e.target.closest('[data-person-location]');if(m){AppRouter.go('location');setTimeout(()=>locOpenPerson(m.dataset.personLocation),80)}
    if(e.target.closest('#trafficButton'))alert(AppTraffic.description());
  });
  const previousFont=window.applyFontSize;
  if(typeof previousFont==='function')window.applyFontSize=function(px){previousFont(px);document.documentElement.style.fontSize=(Math.max(17,Math.min(25,px))/19*16)+'px'};
  document.addEventListener('DOMContentLoaded',()=>{
    applyFontSize(+(localStorage.getItem('cro_font_size')||19));
    renderPeople();applyIdentity();
    const header=document.querySelector('.mix-top');
    new ResizeObserver(()=>document.documentElement.style.setProperty('--app-header-h',Math.ceil(header.getBoundingClientRect().height)+'px')).observe(header);
  });
})();