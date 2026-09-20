/* Shared expense manager: receipt-first entry + editable OCR + daily ledger. */
(function(){
  let owner='',storageReady=false,records={},selected=new Set(),mode='all',editId=null,editEtag=null,original=null,saveBusy=false,fetchEpoch=0,pendingId=null;
  let receiptItems=[],receiptChanged=false,receiptBusy=false,receiptBatch=null,receiptEpoch=0,ocrBusy=false,ocrResult=null;
  let expenseTab='entry',ledgerDay='all',ledgerNotice='',fxQuote=null,fxBusy=false,fxSeq=0;
  const TRIP_DATES=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18','2026-10-19'];
  const all=()=>TEAM_MEMBERS.slice().sort((a,b)=>(a.group||5)-(b.group||5)||a.groupOrder-b.groupOrder);
  const keyOf=u=>u.memberId;
  const escape=s=>Integration.escape(s);
  const draftKey=()=> 'cro.expense.draft.v2.'+(currentUser?.name||'');
  const oldDraftKey=()=> 'cro.expense.draft.v1.'+(currentUser?.name||'');
  const status=(text,kind='')=>Integration.feedback(document.getElementById('expenseFeedback'),text,kind);
  function money(minor,currency){return currency==='EUR'?'€'+(minor/100).toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2}):'₩'+minor.toLocaleString('ko-KR')}
  function nowLocalDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function dualTime(ts){return window.AppTime?AppTime.dual(ts):{croatiaShort:'-',koreaShort:'-',croatia:'-',korea:'-'}}
  function timeFields(ts){return window.AppTime?AppTime.stored(ts):{epoch:ts,croatia:'',korea:''}}
  function requireStaff(){if(!Integration.canManageFinance())throw Error('공동경비는 이상미·한상호만 사용합니다.')}
  function weekday(date){try{return new Intl.DateTimeFormat('ko-KR',{weekday:'short',timeZone:'Europe/Zagreb'}).format(new Date(date+'T12:00:00+02:00'))}catch(_){return''}}
  function formMarkup(){return `<div id="expenseAccess" class="finance-access"><b>공유 기록 불러오는 중</b></div>
    <div class="expense-top-tabs" role="tablist"><button type="button" data-expense-tab="entry" class="active">＋ 경비 등록</button><button type="button" data-expense-tab="ledger">▤ 날짜별 장부</button></div>
    <div class="expense-layout-v2">
      <section class="expense-pane expense-pane-entry" data-expense-pane="entry">
        <div class="finance-panel"><h3 id="expenseFormTitle">공동경비 등록</h3><form id="expenseForm" class="finance-form">
          <div class="receipt-first">
            <div class="receipt-first-head"><strong>① 영수증부터</strong><small>촬영/선택 → 자동 읽기 → 확인</small></div>
            <div class="receipt-primary-actions">
              <label class="receipt-action primary">📷 카메라 촬영<input id="receiptCamera" type="file" accept="image/*" capture="environment"></label>
              <label class="receipt-action">🖼 이미지 선택<input id="receiptFiles" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple></label>
            </div>
            <div id="receiptReadStatus" class="ocr-status">${window.ReceiptAI?.configured()?'AI 비전 우선 · 실패 시 자동방향 OCR로 전환':'자동방향·고대비 OCR 사용 · AI 서버는 선택 설정'}</div>
            <div id="ocrReview" class="ocr-review" hidden></div>
            <div id="receiptEditor" class="receipt-editor"></div>
            <div class="receipt-review-note">자동인식 값은 저장 전에 직접 확인·수정할 수 있습니다.</div>
          </div>
          <div class="finance-row"><label class="field">사용일<input id="exDate" type="date" required /></label><label class="field">사용시각<input id="exTime" type="time" /></label></div><div class="finance-row"><label class="field">분류<select id="exCategory"><option>식사</option><option>교통</option><option>입장·체험</option><option>간식·음료</option><option>공용물품</option><option>기타</option></select></label></div>
          <label class="field">사용처 · 상호<input id="exMerchant" maxlength="100" placeholder="예: Konoba Dubrava" required /><span class="field-hint">영수증 상호를 확인해 주세요.</span></label>
          <label class="field">사용 목적<input id="exTitle" maxlength="120" placeholder="예: 두브로브니크 점심 식사" required /></label>
          <div class="finance-row"><label class="field">통화<select id="exCurrency"><option value="EUR">EUR · 유로</option><option value="KRW">KRW · 원</option></select></label><label class="field">전체 금액<input id="exAmount" inputmode="decimal" placeholder="0.00" required /></label></div><div id="expenseFxEstimate" class="expense-fx-estimate">유로 금액을 입력하면 하나은행 매매기준율 기준 예상 원화를 계산합니다.</div>
          <label class="field">결제자<input id="exPayer" maxlength="60" placeholder="실제 결제한 사람 또는 공용카드" /></label>
          <h4 style="margin:5px 0">② 참여자</h4><div class="participant-quick"><button type="button" id="importAttendance">✓ 최근 출석명단 불러오기</button><small>가장 최근 출석체크 완료자를 참여자로 한 번에 선택합니다.</small></div><div class="expense-mode" role="group" aria-label="경비 참여 범위"><button type="button" data-expense-mode="all">전체 · 28명</button><button type="button" data-expense-mode="selected">개별 선택</button></div>
          <div class="part-count" aria-live="polite"><span><b id="exParticipantCount">28</b>명 참여</span><small id="exSelectionNote">교수님 포함 전체</small></div>
          <div id="exParticipantBox" class="participant-scroll" hidden></div>
          <label class="field">메모<textarea id="exMemo" maxlength="1000" placeholder="불참자 사유, 특이사항 등"></textarea></label>
          <div class="expense-actions"><button type="submit" id="expenseSave" disabled>✓ 확인 후 저장</button><button type="button" class="secondary" id="expenseDraft">기기에 초안 저장</button><button type="button" class="secondary" id="expenseNew">새 기록</button></div>
          <div id="expenseFeedback" class="form-feedback" role="status" aria-live="polite"></div>
        </form></div>
      </section>
      <section class="expense-pane expense-pane-ledger" data-expense-pane="ledger" hidden>
        <div class="finance-panel"><div class="expense-entry-head"><h3>날짜별 공동경비 장부</h3><button type="button" class="edit-expense" id="expenseRefresh">↻ 새로고침</button></div>
          <div id="ledgerDayChips" class="ledger-day-chips"></div>
          <div id="ledgerNotice" class="ocr-status success" hidden></div>
          <div id="ledgerHero" class="ledger-hero"></div>
          <button type="button" id="sameDayAdd" class="same-day-add">＋ 선택 날짜에 경비 추가</button>
          <details class="ledger-advanced"><summary>검색 · 기간 · 내보내기</summary><div><div class="ledger-filters"><label>시작일<input id="ledgerFrom" type="date"></label><label>종료일<input id="ledgerTo" type="date"></label><label class="ledger-search">사용처·내용·결제자<input id="ledgerSearch" type="search" placeholder="예: 점심, Konoba, 한상호"></label></div><div class="ledger-tools"><button id="ledgerClear" type="button">필터 초기화</button><button id="ledgerExport" type="button">CSV 저장</button></div></div></details>
          <p class="quiet" id="expenseListInfo">저장된 기록을 확인 중입니다.</p><div id="expenseRecords"></div>
        </div>
      </section>
    </div>`}
  function renderBase(){
    document.getElementById('expensesApp').innerHTML=formMarkup();
    const form=document.getElementById('expenseForm');
    form.addEventListener('submit',e=>{e.preventDefault();save()});
    form.addEventListener('input',e=>{pendingId=pendingId||newId();if(e.target.matches('input,select,textarea'))e.target.classList.remove('ocr-filled');if(['exDate','exTime','exAmount','exCurrency'].includes(e.target.id)){if(['exDate','exTime','exCurrency'].includes(e.target.id))fxQuote=null;scheduleFxEstimate()}});
    document.getElementById('expenseDraft').onclick=()=>saveDraft(true);
    document.getElementById('expenseNew').onclick=()=>{if(formHasValues()&&!confirm('입력 중인 내용을 비우고 새 기록을 작성할까요?'))return;newForm();setExpenseTab('entry')};
    document.getElementById('expenseRefresh').onclick=()=>load();
    document.getElementById('receiptFiles').onchange=addReceiptFiles;
    document.getElementById('receiptCamera').onchange=addReceiptFiles;
    ['ledgerFrom','ledgerTo','ledgerSearch'].forEach(id=>document.getElementById(id).oninput=()=>{ledgerDay='all';renderRecords()});
    document.getElementById('ledgerClear').onclick=()=>{['ledgerFrom','ledgerTo','ledgerSearch'].forEach(id=>document.getElementById(id).value='');ledgerDay='all';renderRecords()};
    document.getElementById('ledgerExport').onclick=exportLedger;
    document.getElementById('sameDayAdd').onclick=()=>{const d=ledgerDay!=='all'?ledgerDay:nowLocalDate();newForm();document.getElementById('exDate').value=d;scheduleFxEstimate();setExpenseTab('entry')};
    document.getElementById('importAttendance').onclick=importLatestAttendance;
    newForm();restoreDraft();setExpenseTab(expenseTab);
  }
  function setExpenseTab(tab){expenseTab=tab==='ledger'?'ledger':'entry';document.querySelectorAll('[data-expense-tab]').forEach(b=>{const on=b.dataset.expenseTab===expenseTab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});document.querySelectorAll('[data-expense-pane]').forEach(p=>p.hidden=p.dataset.expensePane!==expenseTab);if(expenseTab==='ledger')renderRecords()}
  function newId(){return 'ex_'+Date.now()+'_'+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2))}
  function formHasValues(){return !!document.getElementById('exMerchant')?.value||!!document.getElementById('exTitle')?.value||!!document.getElementById('exAmount')?.value||receiptItems.length>0}
  function resetOcr(){ocrResult=null;const r=document.getElementById('ocrReview');if(r){r.hidden=true;r.innerHTML=''}const s=document.getElementById('receiptReadStatus');if(s){s.className='ocr-status';s.textContent=window.ReceiptAI?.configured()?'AI 비전 우선 · 실패 시 자동방향 OCR로 전환':'자동방향·고대비 OCR 사용 · AI 서버는 선택 설정'}}
  function newForm(){
    document.getElementById('expenseForm').reset();document.getElementById('exDate').value=nowLocalDate();document.getElementById('exPayer').value=currentUser?.name||'';
    editId=null;editEtag=null;original=null;pendingId=newId();receiptItems=[];receiptChanged=false;receiptBatch=null;receiptEpoch++;resetOcr();renderReceiptEditor();selected=new Set(all().map(keyOf));mode='all';
    document.getElementById('expenseFormTitle').textContent='공동경비 등록';fxQuote=null;renderSelection();renderFxEstimate();scheduleFxEstimate();status('');
  }
  function snapshot(){return {date:document.getElementById('exDate').value,time:document.getElementById('exTime').value,merchant:document.getElementById('exMerchant').value,title:document.getElementById('exTitle').value,category:document.getElementById('exCategory').value,currency:document.getElementById('exCurrency').value,amount:document.getElementById('exAmount').value,payer:document.getElementById('exPayer').value,memo:document.getElementById('exMemo').value,mode,selected:[...selected],pendingId,editId,editEtag,original,receiptChanged,receiptBatch,ocrResult,fxQuote}}
  function saveDraft(explicit=false){
    if(!Integration.canManageFinance()||!document.getElementById('expenseForm'))return;
    try{localStorage.setItem(draftKey(),JSON.stringify(snapshot()));ReceiptStore.saveDraft(currentUser.name,{items:receiptItems,batchId:receiptBatch,changed:receiptChanged,pendingId}).catch(()=>status('영수증 임시저장에 실패했습니다. 사진 원본을 보관해 주세요.','error'));if(explicit)status('이 기기에 초안을 저장했습니다. 아직 공유 장부에는 반영되지 않았습니다.','success')}catch(_){status('기기 저장 공간이 부족하거나 저장이 차단되었습니다.','error')}
  }
  function restoreDraft(){
    try{const raw=localStorage.getItem(draftKey())||localStorage.getItem(oldDraftKey())||'null',d=JSON.parse(raw);if(!d)return;
      for(const [id,k] of [['exDate','date'],['exTime','time'],['exMerchant','merchant'],['exTitle','title'],['exCategory','category'],['exCurrency','currency'],['exAmount','amount'],['exPayer','payer'],['exMemo','memo']])if(document.getElementById(id))document.getElementById(id).value=d[k]||'';
      selected=new Set((d.selected||[]).filter(id=>TEAM_MEMBERS.some(u=>u.memberId===id)));mode=d.mode==='all'?'all':'selected';if(mode==='all')selected=new Set(all().map(keyOf));pendingId=d.pendingId||newId();editId=d.editId||null;editEtag=d.editEtag||null;original=d.original||null;ocrResult=d.ocrResult||null;fxQuote=d.fxQuote||null;renderSelection();renderFxEstimate();
      const seq=++receiptEpoch,user=currentUser.name;receiptChanged=!!d.receiptChanged;receiptBatch=d.receiptBatch||null;ReceiptStore.loadDraft(user).then(v=>{if(seq!==receiptEpoch||currentUser?.name!==user)return;if(v?.pendingId===pendingId){receiptItems=v.items||[];receiptChanged=v.changed;receiptBatch=v.batchId;}renderReceiptEditor();if(ocrResult)renderOcrReview();}).catch(()=>{});status('기기에 저장된 초안을 복원했습니다. 아직 공유 장부에는 반영되지 않았습니다.');
    }catch(_){status('이전 초안을 읽을 수 없어 새 기록으로 시작합니다.')}
  }
  function renderSelection(){
    document.querySelectorAll('[data-expense-mode]').forEach(b=>{const on=b.dataset.expenseMode===mode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    const c=document.getElementById('exParticipantCount');if(c)c.textContent=selected.size;const n=document.getElementById('exSelectionNote');if(n)n.textContent=mode==='all'?'교수님 포함 전체':'선택한 사람만 저장';
    const box=document.getElementById('exParticipantBox');if(!box)return;box.hidden=mode==='all';if(mode==='selected')box.innerHTML=[1,2,3,4,0].map(g=>`<div class="part-group-title"><span>${g?g+'조':'인솔 교수'}</span><button type="button" data-expense-group="${g}">이 그룹 선택/해제</button></div><div class="participants-grid">${all().filter(u=>u.group===g).map(u=>`<label class="participant-option"><input type="checkbox" data-participant="${u.memberId}" ${selected.has(u.memberId)?'checked':''}/><span>${escape(u.name)}<small>${u.leader?'조장':u.presenter?'발표':u.group?'조원':'교수님'}${u.tripRole?' · '+escape(u.tripRole):''}</small></span></label>`).join('')}</div>`).join('');
  }
  function accessMessage(message,ok=false){
    const el=document.getElementById('expenseAccess');if(!el)return;el.className='finance-access'+(ok?' approved':'');el.innerHTML=`<b>${ok?escape(currentUser?.name)+' · 공동경비':'공유 저장 연결 확인'}</b><p>${escape(message)}</p>${!ok?'<button type="button" class="edit-expense" id="expenseRecheck">다시 연결</button>':''}`;document.getElementById('expenseRecheck')?.addEventListener('click',()=>load());const save=document.getElementById('expenseSave');if(save)save.disabled=!ok||saveBusy||receiptBusy||ocrBusy;
  }
  let fxTimer=null;
  function renderFxEstimate(){
    const box=document.getElementById('expenseFxEstimate');if(!box)return;const cur=document.getElementById('exCurrency')?.value,raw=(document.getElementById('exAmount')?.value||'').replace(',','.'),amt=Number(raw);
    if(cur==='KRW'){box.className='expense-fx-estimate ready';box.textContent=Number.isFinite(amt)&&amt>0?'원화 지출 · '+Math.round(amt).toLocaleString('ko-KR')+'원':'원화 금액을 입력하세요.';return}
    if(fxBusy){box.className='expense-fx-estimate working';box.textContent='하나은행 매매기준율 확인 중…';return}
    if(!fxQuote||!Number.isFinite(amt)||amt<=0){box.className='expense-fx-estimate';box.textContent='유로 금액을 입력하면 하나은행 매매기준율 기준 예상 원화를 계산합니다.';return}
    const krw=ExpenseFx.krw(amt,fxQuote.rate);box.className='expense-fx-estimate ready';box.innerHTML=`<b>≈ ₩${krw.toLocaleString('ko-KR')}</b><span>€${amt.toLocaleString('ko-KR')} × 1€=₩${Number(fxQuote.rate).toLocaleString('ko-KR',{maximumFractionDigits:2})}</span><small>${escape(fxQuote.asOf||'')} · ${escape(fxQuote.basis||'하나은행 매매기준율')} · 실제 카드 청구액과 다를 수 있음</small>`;
  }
  function scheduleFxEstimate(){clearTimeout(fxTimer);fxTimer=setTimeout(refreshFxEstimate,180)}
  async function refreshFxEstimate(){
    const seq=++fxSeq,cur=document.getElementById('exCurrency')?.value,date=document.getElementById('exDate')?.value,time=document.getElementById('exTime')?.value||'';if(cur!=='EUR'){fxQuote=null;renderFxEstimate();return}fxBusy=true;renderFxEstimate();try{const q=await ExpenseFx.quote(date,time);if(seq!==fxSeq)return;fxQuote=q||null}catch(_){if(seq===fxSeq)fxQuote=null}finally{if(seq===fxSeq){fxBusy=false;renderFxEstimate();saveDraft(false)}}
  }
  async function importLatestAttendance(){
    try{requireStaff();status('최근 출석명단 확인 중…');const cur=await Integration.api('attendanceCurrent/'+TRIP_CODE);const id=cur.data?.id;if(!id)throw Error('현재 또는 최근 출석 회차가 없습니다.');const rr=await Integration.api('attendance/'+TRIP_CODE+'/'+id),checks=rr.data||{};const ids=[];for(const u of TEAM_MEMBERS){if(checks[u.slot]?.checked===true)ids.push(u.memberId)}if(!ids.length)throw Error('체크된 출석자가 없습니다.');selected=new Set(ids);mode='selected';renderSelection();status('✓ '+(cur.data?.title||'최근 출석')+' 명단 '+ids.length+'명을 참여자로 불러왔습니다.','success');saveDraft(false)}catch(e){status(e.message,'error')}
  }
  async function load(){
    if(!Integration.canManageFinance()||!document.getElementById('expenseSave'))return;const epoch=++fetchEpoch,name=currentUser.name;storageReady=false;document.getElementById('expenseSave').disabled=true;
    try{const r=await Integration.api('expenses/'+TRIP_CODE,{headers:{'X-Firebase-ETag':'true'}});if(epoch!==fetchEpoch||currentUser?.name!==name||!Integration.canManageFinance())return;records=r.data||{};storageReady=true;renderRecords();accessMessage('이상미·한상호 공동경비 장부 연결됨',true)}
    catch(e){if(epoch!==fetchEpoch||currentUser?.name!==name)return;storageReady=false;records={};renderRecords();const msg=(e.status===401||e.status===403)?'Firebase 공동경비 Rules를 확인해 주세요.':e.message;accessMessage(msg,false)}
  }
  function allRecordDates(){return [...new Set([...TRIP_DATES,...Object.values(records).map(r=>r?.date).filter(Boolean)])].sort().reverse()}
  function visibleItems(){
    const from=document.getElementById('ledgerFrom')?.value||'',to=document.getElementById('ledgerTo')?.value||'',q=(document.getElementById('ledgerSearch')?.value||'').trim().toLowerCase();
    return Object.entries(records).filter(([,r])=>r&&r.id&&(ledgerDay==='all'||r.date===ledgerDay)&&(!from||r.date>=from)&&(!to||r.date<=to)&&(!q||((r.merchant||'')+' '+r.title+' '+r.category+' '+r.payerName+' '+r.memo).toLowerCase().includes(q))).sort((a,b)=>b[1].date.localeCompare(a[1].date)||(b[1].createdAt||0)-(a[1].createdAt||0));
  }
  function renderDayChips(){
    const box=document.getElementById('ledgerDayChips');if(!box)return;const dates=allRecordDates(),today=nowLocalDate();if(!dates.includes(today))dates.unshift(today);box.innerHTML=`<button type="button" data-ledger-day="all" class="${ledgerDay==='all'?'active':''}">전체</button>`+dates.map(d=>`<button type="button" data-ledger-day="${d}" class="${ledgerDay===d?'active':''}">${d.slice(5).replace('-','/')} ${weekday(d)}</button>`).join('');
  }
  function renderRecords(){
    if(!document.getElementById('expenseRecords'))return;const items=visibleItems(),sums={EUR:0,KRW:0},daily={};let estKrw=0;items.forEach(([,r])=>{if(r.currency in sums&&Number.isFinite(r.amountMinor)){sums[r.currency]+=r.amountMinor;(daily[r.date]??={EUR:0,KRW:0,n:0,estKrw:0})[r.currency]+=r.amountMinor;daily[r.date].n++}if(Number.isFinite(r.estimatedKrw)){estKrw+=r.estimatedKrw;(daily[r.date]??={EUR:0,KRW:0,n:0,estKrw:0}).estKrw+=r.estimatedKrw}});renderDayChips();
    const notice=document.getElementById('ledgerNotice');if(notice){notice.hidden=!ledgerNotice;notice.textContent=ledgerNotice}const hero=document.getElementById('ledgerHero');if(hero)hero.innerHTML=`<div class="ledger-kpi"><small>${ledgerDay==='all'?'조회 기록':'선택 날짜'}</small><b>${items.length}건</b></div><div class="ledger-kpi"><small>EUR 합계</small><b>${money(sums.EUR,'EUR')}</b></div><div class="ledger-kpi"><small>KRW 합계</small><b>${money(sums.KRW,'KRW')}</b></div><div class="ledger-kpi"><small>원화 환산 추정</small><b>${estKrw?'≈ '+money(estKrw,'KRW'):'-'}</b></div>`;
    const info=document.getElementById('expenseListInfo');if(info)info.textContent=(storageReady?'공유기록 '+Object.keys(records).length+'건 중 '+items.length+'건 표시':'연결 후 공유 기록을 불러옵니다.')+' · EUR/KRW 별도 합산';
    const grouped={};items.forEach(x=>(grouped[x[1].date]??=[]).push(x));
    document.getElementById('expenseRecords').innerHTML=Object.keys(grouped).length?Object.entries(grouped).sort(([a],[b])=>b.localeCompare(a)).map(([date,rows])=>{
      const d=daily[date]||{EUR:0,KRW:0,n:0,estKrw:0},tot=[d.EUR?money(d.EUR,'EUR'):'',d.KRW?money(d.KRW,'KRW'):''].filter(Boolean).join(' / ');
      return `<section class="ledger-day-group"><div class="ledger-day-head"><h4>${escape(date)} ${weekday(date)}</h4><span>${d.n}건 · ${tot||'합계 없음'}</span></div>${rows.map(([id,r])=>entryMarkup(id,r)).join('')}</section>`;
    }).join(''):'<div class="ledger-empty">이 날짜에 저장된 공동경비가 없습니다.</div>';
  }
  function entryMarkup(id,r){
    const names=Object.values(r.participants||{}).map(u=>u.name),baseTs=typeof r.updatedAt==='number'?r.updatedAt:(r.updatedClock?.epoch||0),dt=dualTime(baseTs),stamp=`현지 ${r.updatedClock?.croatia?String(r.updatedClock.croatia).slice(5,16):dt.croatiaShort} · 한국 ${r.updatedClock?.korea?String(r.updatedClock.korea).slice(5,16):dt.koreaShort}`,photos=r.receiptSummary?.count||0,merchant=r.merchant||'';
    return `<article class="expense-entry" data-expense-id="${escape(id)}"><div class="expense-entry-head"><div>${merchant?`<div class="expense-merchant">${escape(merchant)}</div>`:''}<h4 class="expense-purpose">${escape(r.title)}</h4></div><b>${money(r.amountMinor,r.currency)}</b></div><div class="ledger-primary"><strong>${r.participantCount}명 참여</strong><span>${escape(r.category)}</span></div>${r.currency==='EUR'&&Number.isFinite(r.estimatedKrw)?`<div class="expense-krw-line">≈ ${money(r.estimatedKrw,'KRW')} · 1€=₩${Number(r.fxRate||0).toLocaleString('ko-KR',{maximumFractionDigits:2})} · ${escape(r.fxRateDate||'')} ${r.fxExact===false?'추정':''}</div>`:''}${r.time?`<div class="meta">사용시각 ${escape(r.time)}</div>`:''}<div class="meta">결제 ${escape(r.payerName||'미지정')} · 기록 ${escape(r.updatedByName)}</div><div class="expense-dual-time">${stamp}</div><details><summary>${r.selectionMode==='all'?'전체':'개별'} 참여 명단 · ${r.participantCount}명</summary><div>${names.map(escape).join(' · ')}${r.memo?'<p>'+escape(r.memo)+'</p>':''}</div></details><div class="ledger-tools"><button type="button" class="edit-expense" data-edit-expense="${escape(id)}">수정</button>${photos?`<button type="button" data-view-receipts="${escape(id)}">영수증 ${photos}장 보기</button>`:'<span class="quiet">영수증 없음</span>'}</div><div class="receipt-gallery" data-receipt-gallery="${escape(id)}" hidden></div></article>`;
  }
  function exportLedger(){
    if(!Integration.canManageFinance()||!storageReady)return;const rows=[['사용일','사용처','사용목적','분류','통화','금액','참여인원','참여자','결제자','메모','영수증 장수','하나환율','환율기준일','원화환산추정','저장시각(크로아티아)','저장시각(한국)'],...visibleItems().map(([,r])=>[r.date,r.merchant||'',r.title,r.category,r.currency,r.currency==='EUR'?(r.amountMinor/100).toFixed(2):r.amountMinor,r.participantCount,Object.values(r.participants||{}).map(u=>u.name).join(' / '),r.payerName||'',r.memo||'',r.receiptSummary?.count||0,r.fxRate||'',r.fxRateDate||'',r.estimatedKrw||'',(r.updatedClock?.croatia||dualTime(r.updatedAt).croatia),(r.updatedClock?.korea||dualTime(r.updatedAt).korea)])];
    const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,m=>"'"+m).replace(/"/g,'""')+'"';const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='croatia-expenses-'+nowLocalDate()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function edit(id){
    try{requireStaff();if(!storageReady)throw Error('공유 저장 연결을 확인해 주세요.');if(formHasValues()&&!confirm('작성 중인 입력 대신 이 공유 기록을 불러올까요?'))return;const r=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{headers:{'X-Firebase-ETag':'true'}});if(!Integration.canManageFinance()||!r.data)return;
      const d=r.data;editId=id;editEtag=r.etag;original=d;pendingId=id;receiptItems=[];receiptChanged=false;receiptBatch=null;receiptEpoch++;resetOcr();renderReceiptEditor();
      for(const [el,k] of [['exDate','date'],['exTime','time'],['exMerchant','merchant'],['exTitle','title'],['exCategory','category'],['exCurrency','currency'],['exPayer','payerName'],['exMemo','memo']])document.getElementById(el).value=d[k]||'';document.getElementById('exAmount').value=d.currency==='EUR'?(d.amountMinor/100).toFixed(2):String(d.amountMinor);selected=new Set(Object.keys(d.participants||{}));mode=d.selectionMode;fxQuote=d.fxRate?{rate:d.fxRate,asOf:d.fxRateDate||d.date,exact:d.fxExact!==false,basis:d.fxBasis||'저장 당시 하나은행 매매기준율',source:d.fxSource||'하나은행'}:null;renderSelection();renderFxEstimate();document.getElementById('expenseFormTitle').textContent='공유 기록 수정';scheduleFxEstimate();setExpenseTab('entry');status('날짜·사용처·금액·참여자를 확인한 뒤 저장해 주세요.');document.getElementById('expenseFormTitle').scrollIntoView({block:'start',behavior:'smooth'});
    }catch(e){status(e.message,'error')}
  }
  function validate(){
    const x=snapshot(),merchant=x.merchant.trim(),title=x.title.trim();if(!merchant)throw Error('사용처·상호를 입력해 주세요.');if(!title)throw Error('사용 목적을 입력해 주세요.');if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date))throw Error('사용일을 선택해 주세요.');let raw=x.amount.trim();if(x.currency==='EUR')raw=raw.replace(',','.');const valid=x.currency==='EUR'?/^\d+(\.\d{1,2})?$/.test(raw):/^\d+$/.test(raw);if(!valid)throw Error(x.currency==='EUR'?'유로 금액은 소수점 두 자리까지 입력해 주세요.':'원화 금액은 원 단위 정수로 입력해 주세요.');const amountMinor=Math.round(Number(raw)*(x.currency==='EUR'?100:1));if(!Number.isSafeInteger(amountMinor)||amountMinor<=0||amountMinor>1000000000000)throw Error('금액을 다시 확인해 주세요.');if(!selected.size)throw Error('참여자를 한 명 이상 선택해 주세요.');const participants={};all().filter(u=>selected.has(keyOf(u))).forEach(u=>participants[keyOf(u)]={name:u.name,group:u.group});if(Object.keys(participants).length!==selected.size)throw Error('참여자 목록을 다시 선택해 주세요.');const amountMajor=x.currency==='EUR'?amountMinor/100:amountMinor;const fx=x.currency==='EUR'&&fxQuote?{fxRate:+fxQuote.rate,fxRateDate:fxQuote.asOf||x.date,fxExact:!!fxQuote.exact,fxBasis:fxQuote.basis||'하나은행 매매기준율',fxSource:fxQuote.source||'하나은행',estimatedKrw:ExpenseFx.krw(amountMajor,fxQuote.rate)}:{estimatedKrw:x.currency==='KRW'?amountMinor:null};return {date:x.date,time:x.time||'',merchant,title,category:x.category,currency:x.currency,amountMinor,payerName:x.payer.trim(),memo:x.memo.trim(),selectionMode:mode,participants,participantCount:selected.size,receiptExtracted:!!ocrResult,receiptOcrProvider:ocrResult?.provider||'',receiptOcrConfidence:ocrResult?.confidence||0,...fx};
  }
  async function save(){
    if(saveBusy||receiptBusy||ocrBusy)return;
    try{requireStaff();const data=validate();if(!storageReady)throw Error('공유 저장 연결을 먼저 확인해 주세요. 입력은 기기 초안으로 보관합니다.');saveBusy=true;document.getElementById('expenseSave').disabled=true;saveDraft(false);status('공유 장부 저장 중…');const name=currentUser.name,uid=localStorage.getItem('fb_uid'),id=editId||pendingId||newId();let receiptSummary=original?.receiptSummary||null;
      if(receiptChanged){status('영수증 사진 저장 중…');receiptBatch=receiptBatch||ReceiptStore.newBatch();try{receiptSummary=await ReceiptStore.upload(id,receiptItems,receiptBatch)}catch(e){throw Error('영수증 저장 실패: '+e.message+' 경비 기록은 아직 변경하지 않았습니다.');}}
      if(currentUser?.name!==name)throw Error('사용자가 변경되었습니다.');const clientNow=Date.now(),clock=timeFields(clientNow);const r={...data,id,createdBy:original?.createdBy||uid,createdByName:original?.createdByName||name,createdAt:original?.createdAt||{'.sv':'timestamp'},createdClock:original?.createdClock||timeFields(typeof original?.createdAt==='number'?original.createdAt:clientNow),updatedBy:uid,updatedByName:name,updatedAt:{'.sv':'timestamp'},updatedClock:clock,revision:(original?.revision||0)+1,...(receiptSummary?{receiptSummary}:{})};const headers={'if-match':editId?editEtag:'null_etag'};if(editId&&!editEtag)throw Error('기록 버전 확인에 실패했습니다. 공유 기록을 다시 불러와 주세요.');const res=await Integration.api('expenses/'+TRIP_CODE+'/'+id,{method:'PUT',headers,body:JSON.stringify(r)});if(currentUser?.name!==name)return;
      localStorage.removeItem(draftKey());localStorage.removeItem(oldDraftKey());await ReceiptStore.removeDraft(name).catch(()=>{});records[id]=res.data||r;ledgerDay=r.date;ledgerNotice=`✓ 저장 완료 · ${r.merchant} · ${money(r.amountMinor,r.currency)} · ${r.participantCount}명`;newForm();setExpenseTab('ledger');renderRecords();
    }catch(e){saveDraft(false);status(e.message+' 입력은 초안에 남아 있습니다.','error')}
    finally{saveBusy=false;const b=document.getElementById('expenseSave');if(b)b.disabled=!storageReady||receiptBusy||ocrBusy;}
  }
  function renderReceiptEditor(){
    const box=document.getElementById('receiptEditor');if(!box)return;if(!receiptChanged&&original?.receiptSummary){box.innerHTML=`<p>저장된 영수증 ${original.receiptSummary.count}장을 유지합니다.</p><button type="button" id="loadReceiptEdit">사진 불러와 편집</button>`;document.getElementById('loadReceiptEdit').onclick=async()=>{const seq=++receiptEpoch;receiptBusy=true;try{const xs=await ReceiptStore.read(editId,original.receiptSummary);if(seq!==receiptEpoch)return;receiptItems=xs;receiptChanged=true;receiptBatch=ReceiptStore.newBatch();renderReceiptEditor()}catch(e){status(e.message,'error')}finally{receiptBusy=false}};return;}
    box.innerHTML=receiptItems.map((r,i)=>`<figure class="receipt-thumb"><img src="${escape(r.dataUrl)}" alt="영수증 미리보기 ${i+1}"><figcaption>${Math.ceil(r.bytes/1024)} KB <button type="button" data-ocr-receipt="${i}">${window.ReceiptAI?.configured()?'AI 다시 읽기':'자동 읽기'}</button><button type="button" data-local-ocr="${i}">기기 OCR</button> <button type="button" data-remove-receipt="${i}" aria-label="사진 ${i+1} 제거">제거</button></figcaption></figure>`).join('')||'<p class="quiet">선택한 영수증이 없습니다.</p>';
  }
  function renderOcrReview(){
    const box=document.getElementById('ocrReview');if(!box)return;if(!ocrResult){box.hidden=true;box.innerHTML='';return}const rot=ocrResult.provider==='local'&&ocrResult.rotation?(' · 방향 '+(ocrResult.rotation===270?'왼쪽 90°':ocrResult.rotation===90?'오른쪽 90°':ocrResult.rotation+'°')):'';box.hidden=false;box.innerHTML=`<span>날짜<b>${escape(ocrResult.date||'확인 필요')}</b></span><span>사용처<b>${escape(ocrResult.merchant||'확인 필요')}</b></span><span>금액<b>${ocrResult.amount!=null?escape((ocrResult.currency==='EUR'?'€':'₩')+Number(ocrResult.amount).toLocaleString('ko-KR',{minimumFractionDigits:ocrResult.currency==='EUR'?2:0,maximumFractionDigits:2})):'확인 필요'}</b></span><span>시각<b>${escape(ocrResult.time||'확인 필요')}</b></span><span>판독 방식<b>${ocrResult.provider==='ai'?'AI 비전':'자동방향·고대비 OCR'+rot}</b></span><span>판독 품질<b>${ocrResult.quality?ocrResult.quality+'점':(ocrResult.confidence?ocrResult.confidence+'%':'확인 필요')}</b></span>`;
  }
  function markAuto(id,value){const el=document.getElementById(id);if(!el||value==null||value==='')return;el.value=value;el.classList.add('ocr-filled')}
  function applyOcr(r){ocrResult=r;renderOcrReview();if(r.date)markAuto('exDate',r.date);if(r.time)markAuto('exTime',r.time);if(r.merchant)markAuto('exMerchant',r.merchant);if(r.amount!=null)markAuto('exAmount',r.currency==='EUR'?Number(r.amount).toFixed(2):String(Math.round(r.amount)));if(r.currency)markAuto('exCurrency',r.currency);if(r.category)markAuto('exCategory',r.category);if(r.purpose&&!document.getElementById('exTitle').value.trim())markAuto('exTitle',r.purpose);scheduleFxEstimate();saveDraft(false)}
  async function runOcr(index=0,forceLocal=false,sourceOverride=''){
    if(ocrBusy||!receiptItems[index])return;const st=document.getElementById('receiptReadStatus');ocrBusy=true;const save=document.getElementById('expenseSave');if(save)save.disabled=true;const source=sourceOverride||receiptItems[index].dataUrl;
    try{
      let r=null;
      if(!forceLocal&&window.ReceiptAI?.configured()){
        st.className='ocr-status working';st.textContent='AI 비전으로 영수증 정확 판독 중…';
        try{r=await ReceiptAI.analyze(source)}catch(e){st.textContent='AI 판독 실패 · 자동방향 기기 OCR로 전환 중…';}
      }
      if(!r){st.className='ocr-status working';st.textContent=forceLocal?'자동방향·고대비 OCR로 다시 읽는 중…':'자동방향·고대비 OCR로 읽는 중…';r=await ReceiptOCR.recognize(source,(p,stage)=>{st.textContent=(stage==='고대비 재판독'?'고대비 재판독 중… ':stage&&stage.startsWith('방향')?'영수증 방향 찾는 중… ':'기기 OCR 읽는 중… ')+p+'%'})}
      applyOcr(r);const count=[r.date,r.merchant,r.amount!=null].filter(Boolean).length;st.className='ocr-status '+(count>=2?'success':'error');st.textContent=count>=2?'✓ '+(r.provider==='ai'?'AI 판독':'기기 OCR')+' 완료 · 자동입력 값을 확인하고 틀리면 수정하세요.':'판독이 부족합니다. 사진을 보면서 날짜·사용처·금액을 직접 입력해 주세요.';
    }catch(e){st.className='ocr-status error';st.textContent='자동인식 실패 · '+e.message+' 직접 입력은 계속 가능합니다.'}
    finally{ocrBusy=false;if(save)save.disabled=!storageReady||receiptBusy;renderReceiptEditor()}
  }
  async function addReceiptFiles(e){
    if(receiptBusy||saveBusy){e.target.value='';return}if(!receiptChanged&&original?.receiptSummary){status('기존 사진을 불러와 편집한 뒤 추가해 주세요.','error');e.target.value='';return}const files=[...e.target.files],seq=++receiptEpoch;e.target.value='';if(receiptItems.length+files.length>3){status('경비 한 건당 사진은 3장까지입니다.','error');return}receiptBusy=true;document.getElementById('expenseSave').disabled=true;
    try{const processed=[];let hiRes='';if(files.length&&window.ReceiptOCR?.prepareFile){status('OCR용 고화질 이미지를 준비 중…');try{hiRes=await ReceiptOCR.prepareFile(files[0])}catch(_){hiRes=''}}for(const f of files){status('영수증 사진 압축 중…');processed.push(await ReceiptStore.compress(f));if(seq!==receiptEpoch)return}const firstIndex=receiptItems.length;receiptItems.push(...processed);receiptChanged=true;receiptBatch=ReceiptStore.newBatch();renderReceiptEditor();saveDraft(false);status('영수증을 추가했습니다. 방향을 자동 보정해 주요정보를 읽습니다.');if(files.length)runOcr(firstIndex,false,hiRes||processed[0].dataUrl);}
    catch(err){status(err.message,'error')}finally{receiptBusy=false;const b=document.getElementById('expenseSave');if(b&&!ocrBusy)b.disabled=!storageReady;}
  }
  async function showReceipts(id){
    const box=[...document.querySelectorAll('[data-receipt-gallery]')].find(e=>e.dataset.receiptGallery===id);if(!box)return;if(!box.hidden){box.hidden=true;return}box.hidden=false;box.textContent='영수증 불러오는 중...';const name=currentUser?.name;try{requireStaff();const items=await ReceiptStore.read(id,records[id]?.receiptSummary);if(currentUser?.name!==name||!Integration.canManageFinance())return;box.innerHTML=ReceiptStore.gallery(items)||'<p>사진을 찾지 못했습니다.</p>'}catch(e){box.textContent=e.message}
  }
  function onAuth(){fetchEpoch++;receiptEpoch++;receiptItems=[];receiptChanged=false;receiptBatch=null;receiptBusy=false;ocrBusy=false;ocrResult=null;storageReady=false;owner='';records={};selected.clear();editId=null;editEtag=null;original=null;const box=document.getElementById('expensesApp');if(box)box.replaceChildren()}
  function onRoute(){if(AppRouter.current!=='expenses')return;if(!Integration.canManageFinance()){AppRouter.go('today');return}if(owner!==currentUser.name){owner=currentUser.name;renderBase();renderRecords()}load()}
  document.addEventListener('click',e=>{
    const tab=e.target.closest('[data-expense-tab]');if(tab){setExpenseTab(tab.dataset.expenseTab);return}
    const day=e.target.closest('[data-ledger-day]');if(day){ledgerDay=day.dataset.ledgerDay;renderRecords();return}
    const b=e.target.closest('[data-expense-mode]');if(b){mode=b.dataset.expenseMode;if(mode==='all')selected=new Set(all().map(keyOf));renderSelection()}
    const g=e.target.closest('[data-expense-group]');if(g){const ids=all().filter(u=>u.group===+g.dataset.expenseGroup).map(keyOf),on=ids.every(id=>selected.has(id));ids.forEach(id=>on?selected.delete(id):selected.add(id));renderSelection()}
    const ed=e.target.closest('[data-edit-expense]');if(ed){ledgerNotice='';edit(ed.dataset.editExpense);}
    const remove=e.target.closest('[data-remove-receipt]');if(remove&&!saveBusy&&!receiptBusy&&!ocrBusy){receiptItems.splice(+remove.dataset.removeReceipt,1);receiptChanged=true;receiptBatch=ReceiptStore.newBatch();receiptEpoch++;renderReceiptEditor();saveDraft(false)}
    const ocr=e.target.closest('[data-ocr-receipt]');if(ocr)runOcr(+ocr.dataset.ocrReceipt);const locOcr=e.target.closest('[data-local-ocr]');if(locOcr)runOcr(+locOcr.dataset.localOcr,true);
    const view=e.target.closest('[data-view-receipts]');if(view)showReceipts(view.dataset.viewReceipts);
  });
  document.addEventListener('change',e=>{const id=e.target.dataset.participant;if(id){e.target.checked?selected.add(id):selected.delete(id);document.getElementById('exParticipantCount').textContent=selected.size}});
  window.addEventListener('cro-role-ready',onAuth);window.addEventListener('cro-route',onRoute);
  window.addEventListener('pagehide',()=>{if(formHasValues())saveDraft(false)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&formHasValues())saveDraft(false);else if(!document.hidden&&AppRouter.current==='expenses')load()});
  setInterval(()=>{if(!document.hidden&&AppRouter.current==='expenses'&&!saveBusy)load()},60000);
  window.Expenses={reload:load,open:()=>AppRouter.go('expenses'),tab:setExpenseTab};
})();
