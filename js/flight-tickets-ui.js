/* MIX56 Croatia flight UI - concise airline separation, all times local */
(function(){
  'use strict';
  const DATA=window.CRO_FLIGHT_TICKETS||{members:[]};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user=()=>{try{return typeof currentUser!=='undefined'?currentUser:null}catch(_){return null}};
  const own=()=>{const u=user();return u&&DATA.members.find(x=>x.memberId===u.memberId&&x.name===u.name)};
  async function copyValue(value,btn){
    value=String(value||'');if(!value)return;
    try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}catch(_){return}
    if(btn){const old=btn.textContent;btn.textContent='복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)}
  }
  window.flightCopy=copyValue;
  const copyBtn=(label,value)=>value?`<button type="button" class="flight-copy" data-flight-copy="${esc(value)}">${esc(label)} 복사</button>`:'';
  const carrierBadge=kind=>kind==='trinity'?'<span class="carrier-badge carrier-trinity">TRINITY</span>':'<span class="carrier-badge carrier-ryanair">RYANAIR</span>';
  function copyLine(label,value){return `<div class="copy-line"><span><b>${esc(label)}</b><strong>${esc(value)}</strong></span><button type="button" class="flight-copy" data-flight-copy="${esc(value)}">복사</button></div>`}
  function leg(l,kind){
    return `<div class="flight-leg flight-leg-${kind}"><div class="flight-leg-top"><b>${esc(l.flight)}</b>${l.seat?`<span>${esc(l.seat)}</span>`:''}</div><div class="route">${esc(l.route)}</div><div class="meta"><b>현지시간</b> · ${esc(l.date)} · ${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}</div>${l.reservation?copyLine('예약번호',l.reservation):''}</div>`;
  }
  function reminderBox(which){
    const r=DATA.twaySeatReminder?.[which];if(!r)return'';
    const live=Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart);
    return `<div class="tway-seat-reminder${live?' tway-seat-live':''}"><span>⏰</span><div><b>${esc(r.flight)} · 출발 24시간 전 좌석지정 확인</b><strong>${esc(r.display)}</strong></div></div>`;
  }
  function idRow(label,value){return `<div class="flight-id-row"><span>${esc(label)}</span><strong>${esc(value)}</strong><button type="button" class="flight-copy" data-flight-copy="${esc(value)}">복사</button></div>`}
  function trinityPanel(m){
    const tw=m.tway;
    return `<section class="carrier-panel carrier-panel-trinity"><div class="carrier-panel-head"><div>${carrierBadge('trinity')}<b>트리니티항공</b></div><span>개인 E-ticket</span></div><div class="flight-id-stack">${idRow('예약번호',tw.reservation)}${idRow('항공권번호',tw.ticket)}</div>${reminderBox('outbound')}<div class="flight-leg-list">${leg(tw.outbound,'trinity')}${reminderBox('return')}${leg(tw.return,'trinity')}</div><div class="flight-actions"><a class="primary" href="${esc(tw.eticket)}" target="_blank" rel="noopener">E-ticket 바로보기</a><a class="secondary" href="${esc(tw.eticket)}" download="${esc(m.name)}_Trinity_E-ticket.pdf">⇩ E-ticket 다운로드</a></div></section>`;
  }
  function ryanairPanel(m){
    const ro=m.ryanair.outbound,rr=m.ryanair.return,g=DATA.ryanairGroupDocument||{};
    return `<section class="carrier-panel carrier-panel-ryanair"><div class="carrier-panel-head"><div>${carrierBadge('ryanair')}<b>Ryanair</b></div><span>단체 예약 확인서</span></div><div class="flight-leg-list">${leg(ro,'ryanair')}${leg(rr,'ryanair')}</div><div class="flight-actions"><a class="primary ryanair-doc" href="${esc(g.path)}" target="_blank" rel="noopener">단체 확인서 바로보기</a><a class="secondary ryanair-doc" href="${esc(g.path)}" download="${esc(g.downloadName||'Ryanair_Group_Reservation.pdf')}">⇩ 단체 확인서 다운로드</a></div></section>`;
  }
  function personalCard(m){
    return `<article class="flight-personal"><div class="flight-personal-head"><div><small>내 항공권</small><h3>${esc(m.name)} <span>${esc(m.englishName)}</span></h3></div><em>모든 시각 · 현지시간</em></div>${trinityPanel(m)}${ryanairPanel(m)}<div class="flight-personal-footer"><button class="flight-copy" type="button" data-flight-copy="${esc(m.englishName)}">영문명 복사</button></div></article>`;
  }
  function scheduleLeg(l,opts={}){
    const actions=[],kind=opts.kind||'trinity';
    if(opts.reservation)actions.push(copyBtn('예약번호',opts.reservation));
    if(opts.ticket)actions.push(copyBtn('항공권번호',opts.ticket));
    if(opts.eticket)actions.push(`<a href="${esc(opts.eticket)}" target="_blank" rel="noopener">E-ticket 보기</a>`);
    if(opts.groupDoc)actions.push(`<a href="${esc(opts.groupDoc)}" target="_blank" rel="noopener">Ryanair 단체 확인서</a>`);
    return `<div class="personal-day-leg personal-day-${kind}"><div class="personal-day-leg-top"><b>${carrierBadge(kind)} ${esc(l.flight)}</b>${l.seat?`<span class="personal-day-seat">${esc(l.seat)}</span>`:''}</div><div class="personal-day-route">${esc(l.route)}</div><div class="personal-day-meta"><b>현지시간</b> · ${esc(l.time)}</div>${actions.length?`<div class="personal-day-actions">${actions.join('')}</div>`:''}</div>`;
  }
  function scheduleCard(m,date){
    const tw=m.tway,ro=m.ryanair.outbound,rr=m.ryanair.return,g=DATA.ryanairGroupDocument||{};let body='',label='';
    if(date==='2026-10-12'){body=scheduleLeg(tw.outbound,{kind:'trinity',reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket})+scheduleLeg(ro,{kind:'ryanair',reservation:ro.reservation,groupDoc:g.path});label=`${tw.outbound.flight} · ${ro.flight}`;}
    else if(date==='2026-10-17'){body=reminderBox('return')+scheduleLeg(rr,{kind:'ryanair',reservation:rr.reservation,groupDoc:g.path});label=rr.flight;}
    else if(date==='2026-10-18'){body=scheduleLeg(tw.return,{kind:'trinity',reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket});label=tw.return.flight;}
    else return'';
    return `<details class="personal-flight-day personal-flight-day-compact" data-personal-flight-date="${esc(date)}"><summary><span><b>✈ 내 항공권</b><small>${esc(label)} · 현지시간</small></span><em>보기</em></summary><div class="personal-flight-day-content">${body}</div></details>`;
  }
  function renderSchedule(){
    document.querySelectorAll('.personal-flight-day').forEach(x=>x.remove());
    if((window.GSPA_TRIP_ID||'croatia')!=='croatia')return;
    const m=own();if(!m||(!Array.isArray(window.days)&&typeof days==='undefined'))return;
    document.querySelectorAll('#dayPanels .panel').forEach((panel,i)=>{const d=(typeof days!=='undefined'&&days[i])||null;if(!d)return;const html=scheduleCard(m,d.date);if(!html)return;const holder=document.createElement('div');holder.innerHTML=html;const point=panel.querySelector('.day-summary');point?.insertAdjacentElement('afterend',holder.firstElementChild)});
  }
  function render(){
    if((window.GSPA_TRIP_ID||'croatia')!=='croatia')return;
    const box=document.getElementById('flightTicketsApp');if(!box)return;const m=own();
    box.innerHTML=`<div class="flight-shell"><div class="flight-source-note"><b>시간 표기</b><span>모든 출발·도착 시각은 해당 장소 <strong>현지시간</strong> 기준입니다.</span></div>${m?personalCard(m):'<div class="flight-login-note"><b>로그인 후 내 항공권을 확인하세요.</b><br><small>크로아티아팀 전용</small></div>'}</div>`;
    renderSchedule();paintQuick();
  }
  function activeReminder(){for(const k of ['outbound','return']){const r=DATA.twaySeatReminder?.[k];if(r&&Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart))return r}return null}
  function paintQuick(){
    const b=document.getElementById('myFlightQuick');if(!b)return;const m=own();if(!m){b.hidden=true;return}b.hidden=false;const r=activeReminder();
    b.innerHTML=`<span class="ico">✈</span><span><b>${r?'좌석지정 확인':'내 항공권'}</b><small>${r?`${esc(r.flight)} · ${esc(r.display)}`:'트리니티 개인 E-ticket · Ryanair 예약/좌석'}</small></span><span class="arr">›</span>`;
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-flight-copy]');if(b){e.preventDefault();copyValue(b.dataset.flightCopy,b)}});
  window.addEventListener('cro-auth-change',()=>{render();renderSchedule();paintQuick()});
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='flights')render();if(e.detail?.view==='schedule')renderSchedule()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();renderSchedule();paintQuick()},{once:true});else{render();renderSchedule();paintQuick()}
})();
