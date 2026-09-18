/* Shared expense log, participation snapshot and per-browser private drafts. */
(function(){
  let owner='',approved=false,records={},selected=new Set(),mode='all',editId=null,editEtag=null,original=null,saveBusy=false,fetchEpoch=0,pendingId=null;
  const all=()=>TEAM_MEMBERS.slice().sort((a,b)=>(a.group||5)-(b.group||5)||a.groupOrder-b.groupOrder);
  const keyOf=u=>u.memberId;
  const escape=s=>Integration.escape(s);
  const draftKey=()=> 'cro.expense.draft.v1.'+(currentUser?.name||'');
  const status=(text,kind='')=>Integration.feedback(document.getElementById('expenseFeedback'),text,kind);
  function money(minor,currency){return currency==='EUR'?'€'+(minor/100).toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2}):'₩'+minor.toLocaleString('ko-KR')}
  function nowLocalDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function requireStaff(){if(!Integration.isStaff())throw Error('팀장·부팀장·총무 전용 기능입니다.')}
  function formMarkup(){return `<div id="expenseAccess" class="finance-access"><b>운영진 권한 확인 중</b><p>Firebase 기기 ID 승인 여부를 확인합니다.</p></div>
    <div class="finance-grid"><div class="finance-panel"><h3 id="expenseFormTitle">공동경비 기록</h3><form id="expenseForm" class="finance-form">
    <div class="finance-row"><label class="field">사용일<input id="exDate" type="date" required /></label><label class="field">분류<select id="exCategory"><option>식사</option><option>교통</option><option>입장·체험</option><option>간식·음료</option><option>공용물품</option><option>기타</option></select></label></div>
    <label class="field">사용 내용<input id="exTitle" maxlength="120" placeholder="예: 두브로브니크 점심 식사" required /></label>
    <div class="finance-row"><label class="field">결제 통화<select id="exCurrency"><option value="EUR">EUR · 유로</option><option value="KRW">KRW · 원</option></select></label><label class="field">전체 사용금액<input id="exAmount" inputmode="decimal" placeholder="0.00" required /></label></div>
    <label class="field">결제자<input id="exPayer" maxlength="60" placeholder="실제 결제한 사람 또는 공용카드" /></label>
    <h4 style="margin:5px 0">참여자 선택</h4><div class="expense-mode" role="group" aria-label="경비 참여 범위"><button type="button" data-expense-mode="all">전체 · 28명</button><button type="button" data-expense-mode="selected">개별 선택</button></div>
    <div class="part-count" aria-live="polite"><span><b id="exParticipantCount">28</b>명 참여</span><small id="exSelectionNote">교수님 포함 전체</small></div>
    <div id="exParticipantBox" class="participant-scroll" hidden></div>
    <label class="field">메모<textarea id="exMemo" maxlength="1000" placeholder="불참자 사유, 영수증 위치 등"></textarea></label>
    <div class="expense-actions"><button type="submit" id="expenseSave" disabled>공동경비에 저장</button><button type="button" class="secondary" id="expenseDraft">기기에 초안 저장</button><button type="button" class="secondary" id="expenseNew">새 기록</button></div>
    <div id="expenseFeedback" class="form-feedback" role="status" aria-live="polite"></div><p class="quiet">‘전체’는 원우 27명과 교수님 1명입니다. 교수님을 제외하려면 개별 선택에서 해제하세요. 참여 인원은 출석 결과와 별도로 저장됩니다.</p>
    </form></div><div class="finance-panel"><div class="expense-entry-head"><h3>공유된 경비</h3><button type="button" class="edit-expense" id="expenseRefresh">새로고침</button></div><div id="expenseTotals" class="expense-totals"></div><p class="quiet" id="expenseListInfo">저장된 기록을 확인 중입니다.</p><div id="expenseRecords"></div></div></div>`}
  function renderBase(){
    document.getElementById('expensesApp').innerHTML=formMarkup();
    const form=document.getElementById('expenseForm');
    form.addEventListener('submit',e=>{e.preventDefault();save()});
    form.addEventListener('input',()=>{pendingId=pendingId||newId()});
    document.getElementById('expenseDraft').onclick=()=>saveDraft(true);
    document.getElementById('expenseNew').onclick=()=>{if(formHasValues()&&!confirm('입력 중인 내용을 비우고 새 기록을 작성할까요?'))return;newForm();};
    document.getElementById('expenseRefresh').onclick=()=>load();
    newForm();restoreDraft();
  }
  function newId(){return 'ex_'+Date.now()+'_'+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2))}
  function formHasValues(){return !!document.getElementById('exTitle')?.value||!!document.getElementById('exAmount')?.value}
  function newForm(){
    document.getElementById('expenseForm').reset();document.getElementById('exDate').value=nowLocalDate();document.getElementById('exPayer').value=currentUser?.name||'';
    editId=null;editEtag=null;original=null;pendingId=newId();selected=new Set(all().map(keyOf));mode='all';
    document.getElementById('expenseFormTitle').textContent='공동경비 기록';renderSelection();status('');
  }
  function snapshot(){return {date:document.getElementById('exDate').value,title:document.getElementById('exTitle').value,category:document.getElementById('exCategory').value,currency:document.getElementById('exCurrency').value,amount:document.getElementById('exAmount').value,payer:document.getElementById('exPayer').value,memo:document.getElementById('exMemo').value,mode,selected:[...selected],pendingId,editId,editEtag,original}}
  function saveDraft(explicit=false){
    if(!Integration.isStaff()||!document.getElementById('expenseForm'))return;
    try{localStorage.setItem(draftKey(),JSON.stringify(snapshot()));if(explicit)status('이 기기에 초안만 저장했습니다. 다른 운영진에게는 아직 공유되지 않았습니다.','success')}catch(_){status('기기 저장 공간이 부족하거나 저장이 차단되었습니다.','error')}
  }
  function restoreDraft(){
    try{const d=JSON.parse(localStorage.getItem(draftKey())||'null');if(!d)return;
      for(const [id,k] of [['exDate','date'],['exTitle','title'],['exCategory','category'],['exCurrency','currency'],['exAmount','amount'],['exPayer','payer'],['exMemo','memo']])document.getElementById(id).value=d[k]||'';
      selected=new Set((d.selected||[]).filter(id=>TEAM_MEMBERS.some(u=>u.memberId===id)));mode=d.mode==='all'?'all':'selected';if(mode==='all')selected=new Set(all().map(keyOf));
      pendingId=d.pendingId||newId();editId=d.editId||null;editEtag=d.editEtag||null;original=d.original||null;renderSelection();status('기기에 저장된 초안을 복원했습니다. 아직 공유 저장되지는 않았습니다.');
    }catch(_){status('이전 초안을 읽을 수 없어 새 기록으로 시작합니다.')}
  }
  function renderSelection(){
    document.querySelectorAll('[data-expense-mode]').forEach(b=>{const on=b.dataset.expenseMode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    document.getElementById('exParticipantCount').textContent=selected.size;
    document.getElementById('exSelectionNote').textContent=mode==='all'?'교수님 포함 전체':'선택한 사람만 저장';
    const box=document.getElementById('exParticipantBox');box.hidden=mode==='all';
    if(mode==='selected')box.innerHTML=[1,2,3,4,0].map(g=>`<div class="part-group-title"><span>${g?g+'조':'인솔 교수'}</span><button type="button" data-expense-group="${g}">이 그룹 선택/해제</button></div><div class="participants-grid">${all().filter(u=>u.group===g).map(u=>`<label class="participant-option"><input type="checkbox" data-participant="${u.memberId}" ${selected.has(u.memberId)?'checked':''}/><span>${escape(u.name)}<small>${u.leader?'조장':u.presenter?'발표':u.group?'조원':'교수님'}${u.tripRole?' · '+escape(u.tripRole):''}</small></span></label>`).join('')}</div>`).join('');
  }
  function accessMessage(message,ok=false,uid=''){
    const el=document.getElementById('expenseAccess');if(!el)return;el.className='finance-access'+(ok?' approved':'');
    el.innerHTML=`<b>${ok?'공동경비 공유 권한 확인됨':'공유 저장을 위한 기기 승인 필요'}</b><p>${escape(message)}</p>${uid?'<small>이 기기의 Firebase UID</small><code class="uid-box">'+escape(uid)+'</code>':''}<button type="button" class="edit-expense" id="expenseRecheck">권한 다시 확인</button>`;
    document.getElementById('expenseRecheck').onclick=()=>load();
    document.getElementById('expenseSave').disabled=!ok||saveBusy;
  }
  async function load(){
    if(!Integration.isStaff())return;
    const epoch=++fetchEpoch,name=currentUser.name;
    approved=false;document.getElementById('expenseSave').disabled=true;
    try{
      await token();const uid=localStorage.getItem('fb_uid');
      const role=await Integration.api('financeManagers/'+TRIP_CODE+'/'+uid);
      if(epoch!==fetchEpoch||currentUser?.name!==name)return;
      if(role.data!==name){accessMessage('최초 1회 Firebase Data에서 financeManagers/'+TRIP_CODE+'/'+uid+' 값을 '+name+'으로 등록해 주세요. 초안은 이 기기에 저장할 수 있습니다.',false,uid);records={};renderRecords();return;}
      approved=true;accessMessage(name+' · '+STAFF_ROLES[name]+' / 승인된 운영진 4명만 조회·수정할 수 있습니다.',true);
      const r=await Integration.api('expenses/'+TRIP_CODE,{headers:{'X-Firebase-ETag':'true'}});
      if(epoch!==fetchEpoch||currentUser?.name!==name)return;
      records=r.data||{};renderRecords();
    }catch(e){if(epoch!==fetchEpoch)return;approved=false;records={};renderRecords();accessMessage(e.message,false,localStorage.getItem('fb_uid')||'');}
  }
  function renderRecords(){
    const items=Object.entries(records).filter(([,r])=>r&&r.id).sort((a,b)=>b[1].date.localeCompare(a[1].date)||(b[1].createdAt||0)-(a[1].createdAt||0));
    const sums={EUR:0,KRW:0};items.forEach(([,r])=>{if(r.currency in sums&&Number.isFinite(r.amountMinor))sums[r.currency]+=r.amountMinor});
    document.getElementById('expenseTotals').innerHTML=['EUR','KRW'].map(c=>`<div class="expense-total"><small>${c} 사용 합계</small><b>${money(sums[c],c)}</b></div>`).join('');
    document.getElementById('expenseListInfo').textContent=(approved?'공유 기록 '+items.length+'건':'아직 공유 기록을 조회하지 않았습니다.')+' · 서로 다른 통화는 합산하지 않습니다.';
    document.getElementById('expenseRecords').innerHTML=items.length?items.map(([id,r])=>{
      const names=Object.values(r.participants||{}).map(u=>u.name);const dateTime=typeof r.updatedAt==='number'?new Intl.DateTimeFormat('ko-KR',{timeZone:'Europe/Zagreb',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(r.updatedAt):'시각 확인 중';
      return `<article class="expense-entry" data-expense-id="${escape(id)}"><div class="expense-entry-head"><h4>${escape(r.title)}</h4><b>${money(r.amountMinor,r.currency)}</b></div><div class="meta">${escape(r.date)} · ${escape(r.category)} · 결제 ${escape(r.payerName||'미지정')}<br>기록 ${escape(r.updatedByName)} · ${dateTime}</div><details><summary>${r.selectionMode==='all'?'전체':'개별'} 참여 <strong>${r.participantCount}명</strong> · 명단 보기</summary><div>${names.map(escape).join(' · ')}${r.memo?'<br>메모: '+escape(r.memo):''}</div></details><button type="button" class="edit-expense" data-edit-expense="${escape(id)}">수정</button></article>`;
    }).join(''):'<div class="empty-card">공유된 경비 기록이 없습니다.<br>권한 승인 후 기록을 저장하면 여기에 나타납니다.</div>';
  }
  async function edit(id){
    try{requireStaff();if(!approved)throw Error('운영진 기기 승인 후 수정할 수 있습니다.');
      if(formHasValues()&&!confirm('작성 중인 입력 대신 이 공유 기록을 불러올까요?'))return;
      const r=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{headers:{'X-Firebase-ETag':'true'}});
      if(!Integration.isStaff()||!r.data)return;
      const d=r.data;editId=id;editEtag=r.etag;original=d;pendingId=id;
      for(const [el,k] of [['exDate','date'],['exTitle','title'],['exCategory','category'],['exCurrency','currency'],['exPayer','payerName'],['exMemo','memo']])document.getElementById(el).value=d[k]||'';
      document.getElementById('exAmount').value=d.currency==='EUR'?(d.amountMinor/100).toFixed(2):String(d.amountMinor);
      selected=new Set(Object.keys(d.participants||{}));mode=d.selectionMode;renderSelection();document.getElementById('expenseFormTitle').textContent='공유 기록 수정';status('참여 명단과 인원수도 함께 수정됩니다.');
      document.getElementById('expenseFormTitle').scrollIntoView({block:'start',behavior:'smooth'});
    }catch(e){status(e.message,'error')}
  }
  function validate(){
    const x=snapshot(),title=x.title.trim();if(!title)throw Error('사용 내용을 입력해 주세요.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date))throw Error('사용일을 선택해 주세요.');
    let raw=x.amount.trim();if(x.currency==='EUR')raw=raw.replace(',','.');
    const valid=x.currency==='EUR'?/^\d+(\.\d{1,2})?$/.test(raw):/^\d+$/.test(raw);
    if(!valid)throw Error(x.currency==='EUR'?'유로 금액은 소수점 두 자리까지 입력해 주세요.':'원화 금액은 원 단위 정수로 입력해 주세요.');
    const amountMinor=Math.round(Number(raw)*(x.currency==='EUR'?100:1));if(!Number.isSafeInteger(amountMinor)||amountMinor<=0||amountMinor>1000000000000)throw Error('금액을 다시 확인해 주세요.');
    if(!selected.size)throw Error('참여자를 한 명 이상 선택해 주세요.');
    const participants={};all().filter(u=>selected.has(keyOf(u))).forEach(u=>participants[keyOf(u)]={name:u.name,group:u.group});
    if(Object.keys(participants).length!==selected.size)throw Error('참여자 목록을 다시 선택해 주세요.');
    return {date:x.date,title,category:x.category,currency:x.currency,amountMinor,payerName:x.payer.trim(),memo:x.memo.trim(),selectionMode:mode,participants,participantCount:selected.size};
  }
  async function save(){
    if(saveBusy)return;
    try{requireStaff();const data=validate();if(!approved)throw Error('기기 승인 전입니다. ‘기기에 초안 저장’을 사용하고 Firebase 설정을 확인해 주세요.');
      saveBusy=true;document.getElementById('expenseSave').disabled=true;saveDraft(false);status('Firebase 공유 저장 중…');
      const name=currentUser.name,uid=localStorage.getItem('fb_uid'),id=editId||pendingId||newId();
      const r={...data,id,createdBy:original?.createdBy||uid,createdByName:original?.createdByName||name,createdAt:original?.createdAt||{'.sv':'timestamp'},updatedBy:uid,updatedByName:name,updatedAt:{'.sv':'timestamp'},revision:(original?.revision||0)+1};
      const headers={'if-match':editId?editEtag:'null_etag'};
      if(editId&&!editEtag)throw Error('기록 버전 확인에 실패했습니다. 공유 기록을 다시 불러와 주세요.');
      const res=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{method:'PUT',headers,body:JSON.stringify(r)});
      if(currentUser?.name!==name)return;
      localStorage.removeItem(draftKey());newForm();records[id]=res.data||r;renderRecords();status('공동경비 저장 완료 · '+r.participantCount+'명 참여 명단을 함께 저장했습니다.','success');
    }catch(e){saveDraft(false);status(e.message+' 입력은 초안에 남아 있습니다.','error')}
    finally{saveBusy=false;const b=document.getElementById('expenseSave');if(b)b.disabled=!approved;}
  }
  function onAuth(){fetchEpoch++;approved=false;owner='';records={};selected.clear();editId=null;editEtag=null;original=null;const box=document.getElementById('expensesApp');if(box)box.replaceChildren();}
  function onRoute(){
    if(AppRouter.current!=='expenses')return;
    if(!Integration.isStaff()){AppRouter.go('today');return;}
    if(owner!==currentUser.name){owner=currentUser.name;renderBase();renderRecords();}
    load();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-expense-mode]');if(b){mode=b.dataset.expenseMode;if(mode==='all')selected=new Set(all().map(keyOf));renderSelection();}
    const g=e.target.closest('[data-expense-group]');if(g){const ids=all().filter(u=>u.group===+g.dataset.expenseGroup).map(keyOf),on=ids.every(id=>selected.has(id));ids.forEach(id=>on?selected.delete(id):selected.add(id));renderSelection();}
    const ed=e.target.closest('[data-edit-expense]');if(ed)edit(ed.dataset.editExpense);
  });
  document.addEventListener('change',e=>{const id=e.target.dataset.participant;if(id){e.target.checked?selected.add(id):selected.delete(id);document.getElementById('exParticipantCount').textContent=selected.size;}});
  window.addEventListener('cro-role-ready',onAuth);window.addEventListener('cro-route',onRoute);
  window.addEventListener('pagehide',()=>{if(formHasValues())saveDraft(false)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&formHasValues())saveDraft(false);else if(!document.hidden&&AppRouter.current==='expenses')load()});
  setInterval(()=>{if(!document.hidden&&AppRouter.current==='expenses'&&!saveBusy)load()},60000);
  window.Expenses={reload:load,open:()=>AppRouter.go('expenses')};
})();