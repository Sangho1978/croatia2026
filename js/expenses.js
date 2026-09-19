/* Shared expense log, participation snapshot and per-browser private drafts. */
(function(){
  let owner='',storageReady=false,records={},selected=new Set(),mode='all',editId=null,editEtag=null,original=null,saveBusy=false,fetchEpoch=0,pendingId=null;
  let receiptItems=[],receiptChanged=false,receiptBusy=false,receiptBatch=null,receiptEpoch=0;
  const all=()=>TEAM_MEMBERS.slice().sort((a,b)=>(a.group||5)-(b.group||5)||a.groupOrder-b.groupOrder);
  const keyOf=u=>u.memberId;
  const escape=s=>Integration.escape(s);
  const draftKey=()=> 'cro.expense.draft.v1.'+(currentUser?.name||'');
  const status=(text,kind='')=>Integration.feedback(document.getElementById('expenseFeedback'),text,kind);
  function money(minor,currency){return currency==='EUR'?'€'+(minor/100).toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2}):'₩'+minor.toLocaleString('ko-KR')}
  function nowLocalDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function dualTime(ts){return window.AppTime?AppTime.dual(ts):{croatiaShort:'-',koreaShort:'-',croatia:'-',korea:'-'}}
  function timeFields(ts){const d=window.AppTime?AppTime.stored(ts):{epoch:ts,croatia:'',korea:''};return d}
  function requireStaff(){if(!Integration.canManageFinance())throw Error('공동경비는 이상미·한상호만 사용합니다.')}
  function formMarkup(){return `<div id="expenseAccess" class="finance-access"><b>공유 기록 불러오는 중</b></div>
    <div class="expense-action-map"><b>지금 할 일 · 경비 입력</b><span>① 사용내역 · ② 참여자 · ③ 저장</span></div><div class="finance-grid"><div class="finance-panel"><h3 id="expenseFormTitle">사용 내역 입력</h3><form id="expenseForm" class="finance-form">
    <div class="finance-row"><label class="field">사용일<input id="exDate" type="date" required /></label><label class="field">분류<select id="exCategory"><option>식사</option><option>교통</option><option>입장·체험</option><option>간식·음료</option><option>공용물품</option><option>기타</option></select></label></div>
    <label class="field">사용 내용<input id="exTitle" maxlength="120" placeholder="예: 두브로브니크 점심 식사" required /></label>
    <div class="finance-row"><label class="field">결제 통화<select id="exCurrency"><option value="EUR">EUR · 유로</option><option value="KRW">KRW · 원</option></select></label><label class="field">전체 사용금액<input id="exAmount" inputmode="decimal" placeholder="0.00" required /></label></div>
    <label class="field">결제자<input id="exPayer" maxlength="60" placeholder="실제 결제한 사람 또는 공용카드" /></label>
    <h4 style="margin:5px 0">참여자 선택</h4><div class="expense-mode" role="group" aria-label="경비 참여 범위"><button type="button" data-expense-mode="all">전체 · 28명</button><button type="button" data-expense-mode="selected">개별 선택</button></div>
    <div class="part-count" aria-live="polite"><span><b id="exParticipantCount">28</b>명 참여</span><small id="exSelectionNote">교수님 포함 전체</small></div>
    <div id="exParticipantBox" class="participant-scroll" hidden></div>
    <label class="field">메모<textarea id="exMemo" maxlength="1000" placeholder="불참자 사유, 영수증 위치 등"></textarea></label>
    <fieldset class="receipt-field"><legend>\uc601\uc218\uc99d \uc0ac\uc9c4 <small>\ucd5c\ub300 3\uc7a5</small></legend><div class="receipt-choose"><label>\uc0ac\uc9c4 \uc120\ud0dd<input id="receiptFiles" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple /></label><label>\uce74\uba54\ub77c \ucd2c\uc601<input id="receiptCamera" type="file" accept="image/*" capture="environment" /></label></div><p class="quiet">\uc7a5\ub2f9 300KB \uc774\ud558\ub85c \uc555\ucd95\ud569\ub2c8\ub2e4. \uae00\uc528\uac00 \uc798 \ubcf4\uc774\ub294\uc9c0 \ud655\uc778\ud558\uace0, \uce74\ub4dc\ubc88\ud638\ub294 \uac00\ub824 \uc8fc\uc138\uc694.</p><div id="receiptEditor" class="receipt-editor"></div><div id="receiptMessage" class="quiet" role="status"></div></fieldset>
    <div class="expense-actions"><button type="submit" id="expenseSave" disabled>✓ 저장</button><button type="button" class="secondary" id="expenseDraft">기기에 초안 저장</button><button type="button" class="secondary" id="expenseNew">새 기록</button></div>
    <div id="expenseFeedback" class="form-feedback" role="status" aria-live="polite"></div>
    </form></div><div class="finance-panel"><div class="expense-entry-head"><h3>공유된 경비</h3><button type="button" class="edit-expense" id="expenseRefresh">새로고침</button></div><div class="ledger-filters"><label>\uc2dc\uc791\uc77c<input id="ledgerFrom" type="date"></label><label>\uc885\ub8cc\uc77c<input id="ledgerTo" type="date"></label><label class="ledger-search">\ub0b4\uc6a9\u00b7\uacb0\uc81c\uc790<input id="ledgerSearch" type="search" placeholder="\uc608: \uc810\uc2ec, \uacf5\uc6a9\ubb3c\ud488"></label></div><div class="ledger-tools"><button id="ledgerClear" type="button">\ud544\ud130 \ucd08\uae30\ud654</button><button id="ledgerExport" type="button">\ubaa9\ub85d CSV \uc800\uc7a5</button></div><div id="ledgerDaily"></div><div id="expenseTotals" class="expense-totals"></div><p class="quiet" id="expenseListInfo">저장된 기록을 확인 중입니다.</p><div id="expenseRecords"></div></div></div>`}
  function renderBase(){
    document.getElementById('expensesApp').innerHTML=formMarkup();
    const form=document.getElementById('expenseForm');
    form.addEventListener('submit',e=>{e.preventDefault();save()});
    form.addEventListener('input',()=>{pendingId=pendingId||newId()});
    document.getElementById('expenseDraft').onclick=()=>saveDraft(true);
    document.getElementById('expenseNew').onclick=()=>{if(formHasValues()&&!confirm('입력 중인 내용을 비우고 새 기록을 작성할까요?'))return;newForm();};
    document.getElementById('expenseRefresh').onclick=()=>load();
    document.getElementById('receiptFiles').onchange=addReceiptFiles;
    document.getElementById('receiptCamera').onchange=addReceiptFiles;
    ['ledgerFrom','ledgerTo','ledgerSearch'].forEach(id=>document.getElementById(id).oninput=renderRecords);
    document.getElementById('ledgerClear').onclick=()=>{['ledgerFrom','ledgerTo','ledgerSearch'].forEach(id=>document.getElementById(id).value='');renderRecords()};
    document.getElementById('ledgerExport').onclick=exportLedger;
    newForm();restoreDraft();
  }
  function newId(){return 'ex_'+Date.now()+'_'+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2))}
  function formHasValues(){return !!document.getElementById('exTitle')?.value||!!document.getElementById('exAmount')?.value}
  function newForm(){
    document.getElementById('expenseForm').reset();document.getElementById('exDate').value=nowLocalDate();document.getElementById('exPayer').value=currentUser?.name||'';
    editId=null;editEtag=null;original=null;pendingId=newId();receiptItems=[];receiptChanged=false;receiptBatch=null;receiptEpoch++;renderReceiptEditor();selected=new Set(all().map(keyOf));mode='all';
    document.getElementById('expenseFormTitle').textContent='공동경비 기록';renderSelection();status('');
  }
  function snapshot(){return {date:document.getElementById('exDate').value,title:document.getElementById('exTitle').value,category:document.getElementById('exCategory').value,currency:document.getElementById('exCurrency').value,amount:document.getElementById('exAmount').value,payer:document.getElementById('exPayer').value,memo:document.getElementById('exMemo').value,mode,selected:[...selected],pendingId,editId,editEtag,original,receiptChanged,receiptBatch}}
  function saveDraft(explicit=false){
    if(!Integration.canManageFinance()||!document.getElementById('expenseForm'))return;
    try{localStorage.setItem(draftKey(),JSON.stringify(snapshot()));ReceiptStore.saveDraft(currentUser.name,{items:receiptItems,batchId:receiptBatch,changed:receiptChanged,pendingId}).catch(()=>status('\uc601\uc218\uc99d \uc784\uc2dc\uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \uc0ac\uc9c4\uc744 \uc6d0\ubcf8\uc73c\ub85c \ubcf4\uad00\ud574 \uc8fc\uc138\uc694.','error'));if(explicit)status('이 기기에 초안만 저장했습니다. 다른 운영진에게는 아직 공유되지 않았습니다.','success')}catch(_){status('기기 저장 공간이 부족하거나 저장이 차단되었습니다.','error')}
  }
  function restoreDraft(){
    try{const d=JSON.parse(localStorage.getItem(draftKey())||'null');if(!d)return;
      for(const [id,k] of [['exDate','date'],['exTitle','title'],['exCategory','category'],['exCurrency','currency'],['exAmount','amount'],['exPayer','payer'],['exMemo','memo']])document.getElementById(id).value=d[k]||'';
      selected=new Set((d.selected||[]).filter(id=>TEAM_MEMBERS.some(u=>u.memberId===id)));mode=d.mode==='all'?'all':'selected';if(mode==='all')selected=new Set(all().map(keyOf));
      pendingId=d.pendingId||newId();editId=d.editId||null;editEtag=d.editEtag||null;original=d.original||null;renderSelection();
      const seq=++receiptEpoch,user=currentUser.name;receiptChanged=!!d.receiptChanged;receiptBatch=d.receiptBatch||null;
      ReceiptStore.loadDraft(user).then(v=>{if(seq!==receiptEpoch||currentUser?.name!==user)return;if(v?.pendingId===pendingId){receiptItems=v.items||[];receiptChanged=v.changed;receiptBatch=v.batchId;}renderReceiptEditor();}).catch(()=>{});status('기기에 저장된 초안을 복원했습니다. 아직 공유 저장되지는 않았습니다.');
    }catch(_){status('이전 초안을 읽을 수 없어 새 기록으로 시작합니다.')}
  }
  function renderSelection(){
    document.querySelectorAll('[data-expense-mode]').forEach(b=>{const on=b.dataset.expenseMode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    document.getElementById('exParticipantCount').textContent=selected.size;
    document.getElementById('exSelectionNote').textContent=mode==='all'?'교수님 포함 전체':'선택한 사람만 저장';
    const box=document.getElementById('exParticipantBox');box.hidden=mode==='all';
    if(mode==='selected')box.innerHTML=[1,2,3,4,0].map(g=>`<div class="part-group-title"><span>${g?g+'조':'인솔 교수'}</span><button type="button" data-expense-group="${g}">이 그룹 선택/해제</button></div><div class="participants-grid">${all().filter(u=>u.group===g).map(u=>`<label class="participant-option"><input type="checkbox" data-participant="${u.memberId}" ${selected.has(u.memberId)?'checked':''}/><span>${escape(u.name)}<small>${u.leader?'조장':u.presenter?'발표':u.group?'조원':'교수님'}${u.tripRole?' · '+escape(u.tripRole):''}</small></span></label>`).join('')}</div>`).join('');
  }
  function accessMessage(message,ok=false){
    const el=document.getElementById('expenseAccess');if(!el)return;
    el.className='finance-access'+(ok?' approved':'');
    el.innerHTML=`<b>${ok?escape(currentUser?.name)+' \u00b7 \uacf5\ub3d9\uacbd\ube44':'\uacf5\uc720 \uc800\uc7a5 \uc5f0\uacb0 \ud655\uc778'}</b><p>${escape(message)}</p>${!ok?'<button type="button" class="edit-expense" id="expenseRecheck">\ub2e4\uc2dc \uc5f0\uacb0</button>':''}`;
    document.getElementById('expenseRecheck')?.addEventListener('click',()=>load());
    const save=document.getElementById('expenseSave');if(save)save.disabled=!ok||saveBusy||receiptBusy;
  }
  async function load(){
    if(!Integration.canManageFinance()||!document.getElementById('expenseSave'))return;
    const epoch=++fetchEpoch,name=currentUser.name;
    storageReady=false;document.getElementById('expenseSave').disabled=true;
    try{
      // Anonymous Firebase auth remains. No device approval lookup is made.
      const r=await Integration.api('expenses/'+TRIP_CODE,{headers:{'X-Firebase-ETag':'true'}});
      if(epoch!==fetchEpoch||currentUser?.name!==name||!Integration.canManageFinance())return;
      records=r.data||{};storageReady=true;renderRecords();
      accessMessage('\uc774\uc0c1\ubbf8\u00b7\ud55c\uc0c1\ud638 \uacf5\ub3d9\uacbd\ube44 \uad00\ub9ac',true);
    }catch(e){
      if(epoch!==fetchEpoch||currentUser?.name!==name)return;
      storageReady=false;records={};renderRecords();
      const msg=(e.status===401||e.status===403)?'\uae30\uae30 \uc2b9\uc778\uc774 \uc544\ub2cc Rules \ubcc0\uacbd\uc774 \ud544\uc694\ud569\ub2c8\ub2e4. MIX04 \uacbd\ube44 \uaddc\uce59\uc744 \ud55c \ubc88\ub9cc \uc801\uc6a9\ud574 \uc8fc\uc138\uc694.':e.message;
      accessMessage(msg,false);
    }
  }
  function visibleItems(){
    const from=document.getElementById('ledgerFrom')?.value||'',to=document.getElementById('ledgerTo')?.value||'',q=(document.getElementById('ledgerSearch')?.value||'').trim().toLowerCase();
    return Object.entries(records).filter(([,r])=>r&&r.id&&(!from||r.date>=from)&&(!to||r.date<=to)&&(!q||(r.title+' '+r.category+' '+r.payerName+' '+r.memo).toLowerCase().includes(q))).sort((a,b)=>b[1].date.localeCompare(a[1].date)||(b[1].createdAt||0)-(a[1].createdAt||0));
  }
  function renderRecords(){
    if(!document.getElementById('expenseRecords'))return;
    const items=visibleItems(),sums={EUR:0,KRW:0},daily={};
    items.forEach(([,r])=>{if(r.currency in sums&&Number.isFinite(r.amountMinor)){sums[r.currency]+=r.amountMinor;(daily[r.date]??={EUR:0,KRW:0,n:0})[r.currency]+=r.amountMinor;daily[r.date].n++;}});
    document.getElementById('expenseTotals').innerHTML=['EUR','KRW'].map(c=>`<div class="expense-total"><small>${c} \uc870\ud68c \ud569\uacc4</small><b>${money(sums[c],c)}</b></div>`).join('');
    document.getElementById('ledgerDaily').innerHTML=Object.entries(daily).sort(([a],[b])=>b.localeCompare(a)).map(([d,v])=>`<div class="ledger-day"><b>${escape(d)}</b><span>${v.n}\uac74 \u00b7 ${v.EUR?money(v.EUR,'EUR'):''}${v.EUR&&v.KRW?' / ':''}${v.KRW?money(v.KRW,'KRW'):''}</span></div>`).join('');
    document.getElementById('expenseListInfo').textContent=(storageReady?'\uacf5\uc720\uae30\ub85d '+Object.keys(records).length+'\uac74 \uc911 '+items.length+'\uac74 \ud45c\uc2dc':'\uc5f0\uacb0 \ud6c4 \uacf5\uc720 \uae30\ub85d\uc744 \ubd88\ub7ec\uc635\ub2c8\ub2e4.')+' \u00b7 EUR/KRW\ub294 \ubcc4\ub3c4 \ud569\uc0b0';
    document.getElementById('expenseRecords').innerHTML=items.length?items.map(([id,r])=>{
      const names=Object.values(r.participants||{}).map(u=>u.name),baseTs=typeof r.updatedAt==='number'?r.updatedAt:(r.updatedClock?.epoch||0),dt=dualTime(baseTs),stamp=`현지 ${r.updatedClock?.croatia?String(r.updatedClock.croatia).slice(5,16):dt.croatiaShort} · 한국 ${r.updatedClock?.korea?String(r.updatedClock.korea).slice(5,16):dt.koreaShort}`;
      const photos=r.receiptSummary?.count||0;
      return `<article class="expense-entry" data-expense-id="${escape(id)}"><div class="expense-entry-head"><h4>${escape(r.title)}</h4><b>${money(r.amountMinor,r.currency)}</b></div><div class="ledger-primary"><span>${escape(r.date)}</span><strong>${r.participantCount}\uba85 \ucc38\uc5ec</strong><span>${escape(r.category)}</span></div><div class="meta">\uacb0\uc81c ${escape(r.payerName||'\ubbf8\uc9c0\uc815')} \u00b7 \uae30\ub85d ${escape(r.updatedByName)}</div><div class="expense-dual-time">${stamp}</div><details><summary>${r.selectionMode==='all'?'\uc804\uccb4':'\uac1c\ubcc4'} \ucc38\uc5ec \uba85\ub2e8 \u00b7 ${r.participantCount}\uba85</summary><div>${names.map(escape).join(' \u00b7 ')}${r.memo?'<p>'+escape(r.memo)+'</p>':''}</div></details><div class="ledger-tools"><button type="button" class="edit-expense" data-edit-expense="${escape(id)}">\uc218\uc815</button>${photos?`<button type="button" data-view-receipts="${escape(id)}">\uc601\uc218\uc99d ${photos}\uc7a5 \ubcf4\uae30</button>`:'<span class="quiet">\uc601\uc218\uc99d \uc5c6\uc74c</span>'}</div><div class="receipt-gallery" data-receipt-gallery="${escape(id)}" hidden></div></article>`;
    }).join(''):'<div class="empty-card">\uc870\ud68c\ub41c \uae30\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</div>';
  }
  function exportLedger(){
    if(!Integration.canManageFinance()||!storageReady)return;const rows=[['\uc0ac\uc6a9\uc77c','\ub0b4\uc6a9','\ubd84\ub958','\ud1b5\ud654','\uae08\uc561','\ucc38\uc5ec\uc778\uc6d0','\ucc38\uc5ec\uc790','\uacb0\uc81c\uc790','\uba54\ubaa8','\uc601\uc218\uc99d \uc7a5\uc218','\uc800\uc7a5\uc2dc\uac01(\ud06c\ub85c\uc544\ud2f0\uc544)','\uc800\uc7a5\uc2dc\uac01(\ud55c\uad6d)'],...visibleItems().map(([,r])=>[r.date,r.title,r.category,r.currency,r.currency==='EUR'?(r.amountMinor/100).toFixed(2):r.amountMinor,r.participantCount,Object.values(r.participants||{}).map(u=>u.name).join(' / '),r.payerName||'',r.memo||'',r.receiptSummary?.count||0,(r.updatedClock?.croatia||dualTime(r.updatedAt).croatia),(r.updatedClock?.korea||dualTime(r.updatedAt).korea)])];
    const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,m=>"'"+m).replace(/"/g,'""')+'"';
    const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='croatia-expenses-'+nowLocalDate()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function edit(id){
    try{requireStaff();if(!storageReady)throw Error('공유 저장 연결을 확인해 주세요.');
      if(formHasValues()&&!confirm('작성 중인 입력 대신 이 공유 기록을 불러올까요?'))return;
      const r=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{headers:{'X-Firebase-ETag':'true'}});
      if(!Integration.canManageFinance()||!r.data)return;
      const d=r.data;editId=id;editEtag=r.etag;original=d;pendingId=id;receiptItems=[];receiptChanged=false;receiptBatch=null;receiptEpoch++;renderReceiptEditor();
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
    if(saveBusy||receiptBusy)return;
    try{requireStaff();const data=validate();if(!storageReady)throw Error('공유 저장 연결을 먼저 확인해 주세요. 입력은 기기 초안으로 보관합니다.');
      saveBusy=true;document.getElementById('expenseSave').disabled=true;saveDraft(false);status('Firebase 공유 저장 중…');
      const name=currentUser.name,uid=localStorage.getItem('fb_uid'),id=editId||pendingId||newId();
      let receiptSummary=original?.receiptSummary||null;
      if(receiptChanged){status('\uc601\uc218\uc99d \uc0ac\uc9c4 \uacf5\uc720 \uc800\uc7a5 \uc911...');receiptBatch=receiptBatch||ReceiptStore.newBatch();try{receiptSummary=await ReceiptStore.upload(id,receiptItems,receiptBatch)}catch(e){throw Error('\uc601\uc218\uc99d \uc800\uc7a5 \uc2e4\ud328: '+e.message+' \uacbd\ube44 \uae30\ub85d\uc740 \uc544\uc9c1 \ubcc0\uacbd\ud558\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4. expenseReceipts Rules\ub97c \ud655\uc778\ud558\uc138\uc694.');}}
      if(currentUser?.name!==name)throw Error('\uc0ac\uc6a9\uc790\uac00 \ubcc0\uacbd\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
      const clientNow=Date.now(),clock=timeFields(clientNow);const r={...data,id,createdBy:original?.createdBy||uid,createdByName:original?.createdByName||name,createdAt:original?.createdAt||{'.sv':'timestamp'},createdClock:original?.createdClock||timeFields(typeof original?.createdAt==='number'?original.createdAt:clientNow),updatedBy:uid,updatedByName:name,updatedAt:{'.sv':'timestamp'},updatedClock:clock,revision:(original?.revision||0)+1,...(receiptSummary?{receiptSummary}:{})};
      const headers={'if-match':editId?editEtag:'null_etag'};
      if(editId&&!editEtag)throw Error('기록 버전 확인에 실패했습니다. 공유 기록을 다시 불러와 주세요.');
      const res=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{method:'PUT',headers,body:JSON.stringify(r)});
      if(currentUser?.name!==name)return;
      localStorage.removeItem(draftKey());await ReceiptStore.removeDraft(name).catch(()=>{});newForm();records[id]=res.data||r;renderRecords();status('✓ 저장 완료 · '+r.participantCount+'명 · 현지 '+clock.croatia.slice(5,16)+' · 한국 '+clock.korea.slice(5,16),'success');
    }catch(e){saveDraft(false);status(e.message+' 입력은 초안에 남아 있습니다.','error')}
    finally{saveBusy=false;const b=document.getElementById('expenseSave');if(b)b.disabled=!storageReady;}
  }
  function renderReceiptEditor(){
    const box=document.getElementById('receiptEditor');if(!box)return;
    if(!receiptChanged&&original?.receiptSummary){box.innerHTML=`<p>\uc800\uc7a5\ub41c \uc601\uc218\uc99d ${original.receiptSummary.count}\uc7a5\uc744 \uc720\uc9c0\ud569\ub2c8\ub2e4.</p><button type="button" id="loadReceiptEdit">\uc0ac\uc9c4 \ubd88\ub7ec\uc640 \ud3b8\uc9d1</button>`;document.getElementById('loadReceiptEdit').onclick=async()=>{const seq=++receiptEpoch;receiptBusy=true;try{const xs=await ReceiptStore.read(editId,original.receiptSummary);if(seq!==receiptEpoch)return;receiptItems=xs;receiptChanged=true;receiptBatch=ReceiptStore.newBatch();renderReceiptEditor()}catch(e){status(e.message,'error')}finally{receiptBusy=false}};return;}
    box.innerHTML=receiptItems.map((r,i)=>`<figure class="receipt-thumb"><img src="${escape(r.dataUrl)}" alt="\uc601\uc218\uc99d \ubbf8\ub9ac\ubcf4\uae30 ${i+1}"><figcaption>${Math.ceil(r.bytes/1024)} KB <button type="button" data-remove-receipt="${i}" aria-label="\uc0ac\uc9c4 ${i+1} \uc81c\uac70">\uc81c\uac70</button></figcaption></figure>`).join('')||'<p class="quiet">\uc120\ud0dd\ud55c \uc0ac\uc9c4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>';
  }
  async function addReceiptFiles(e){
    if(receiptBusy||saveBusy){e.target.value='';return;}
    if(!receiptChanged&&original?.receiptSummary){status('\uae30\uc874 \uc0ac\uc9c4\ub97c \ubd88\ub7ec\uc640 \ud3b8\uc9d1\ud55c \ub4a4 \ucd94\uac00\ud574 \uc8fc\uc138\uc694.','error');e.target.value='';return;}
    const files=[...e.target.files],seq=++receiptEpoch;e.target.value='';
    if(receiptItems.length+files.length>3){status('\uacbd\ube44 \ud55c \uac74\ub2f9 \uc0ac\uc9c4\ub294 3\uc7a5\uae4c\uc9c0\uc785\ub2c8\ub2e4.','error');return;}
    receiptBusy=true;document.getElementById('expenseSave').disabled=true;
    try{const processed=[];for(const f of files){status('\uc0ac\uc9c4 \uc555\ucd95 \uc911...');processed.push(await ReceiptStore.compress(f));if(seq!==receiptEpoch)return;}receiptItems.push(...processed);receiptChanged=true;receiptBatch=ReceiptStore.newBatch();renderReceiptEditor();saveDraft(false);status('\uc0ac\uc9c4 \ubbf8\ub9ac\ubcf4\uae30\uc5d0\uc11c \uae00\uc528\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694. \uacf5\ub3d9\uacbd\ube44\uc5d0 \uc800\uc7a5\uc744 \ub204\ub974\uba74 \uacf5\uc720\ub429\ub2c8\ub2e4.');}
    catch(err){status(err.message,'error')}finally{receiptBusy=false;const b=document.getElementById('expenseSave');if(b)b.disabled=!storageReady;}
  }
  async function showReceipts(id,button){
    const box=[...document.querySelectorAll('[data-receipt-gallery]')].find(e=>e.dataset.receiptGallery===id);if(!box)return;
    if(!box.hidden){box.hidden=true;return;}box.hidden=false;box.textContent='\uc601\uc218\uc99d \ubd88\ub7ec\uc624\ub294 \uc911...';const name=currentUser?.name;
    try{requireStaff();const items=await ReceiptStore.read(id,records[id]?.receiptSummary);if(currentUser?.name!==name||!Integration.canManageFinance())return;box.innerHTML=ReceiptStore.gallery(items)||'<p>\uc0ac\uc9c4\ub97c \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</p>'}catch(e){box.textContent=e.message;}
  }
  function onAuth(){fetchEpoch++;receiptEpoch++;receiptItems=[];receiptChanged=false;receiptBatch=null;receiptBusy=false;storageReady=false;owner='';records={};selected.clear();editId=null;editEtag=null;original=null;const box=document.getElementById('expensesApp');if(box)box.replaceChildren();}
  function onRoute(){
    if(AppRouter.current!=='expenses')return;
    if(!Integration.canManageFinance()){AppRouter.go('today');return;}
    if(owner!==currentUser.name){owner=currentUser.name;renderBase();renderRecords();}
    load();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-expense-mode]');if(b){mode=b.dataset.expenseMode;if(mode==='all')selected=new Set(all().map(keyOf));renderSelection();}
    const g=e.target.closest('[data-expense-group]');if(g){const ids=all().filter(u=>u.group===+g.dataset.expenseGroup).map(keyOf),on=ids.every(id=>selected.has(id));ids.forEach(id=>on?selected.delete(id):selected.add(id));renderSelection();}
    const ed=e.target.closest('[data-edit-expense]');if(ed)edit(ed.dataset.editExpense);
    const remove=e.target.closest('[data-remove-receipt]');if(remove&&!saveBusy&&!receiptBusy){receiptItems.splice(+remove.dataset.removeReceipt,1);receiptChanged=true;receiptBatch=ReceiptStore.newBatch();receiptEpoch++;renderReceiptEditor();saveDraft(false);}
    const view=e.target.closest('[data-view-receipts]');if(view)showReceipts(view.dataset.viewReceipts,view);
  });
  document.addEventListener('change',e=>{const id=e.target.dataset.participant;if(id){e.target.checked?selected.add(id):selected.delete(id);document.getElementById('exParticipantCount').textContent=selected.size;}});
  window.addEventListener('cro-role-ready',onAuth);window.addEventListener('cro-route',onRoute);
  window.addEventListener('pagehide',()=>{if(formHasValues())saveDraft(false)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&formHasValues())saveDraft(false);else if(!document.hidden&&AppRouter.current==='expenses')load()});
  setInterval(()=>{if(!document.hidden&&AppRouter.current==='expenses'&&!saveBusy)load()},60000);
  window.Expenses={reload:load,open:()=>AppRouter.go('expenses')};
})();