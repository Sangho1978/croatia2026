/* MIX55 Croatia personal flight UI - Trinity vs Ryanair clearly separated */
(function(){
  'use strict';
  const DATA=window.CRO_FLIGHT_TICKETS||{members:[]};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user=()=>{try{return typeof currentUser!=='undefined'?currentUser:null}catch(_){return null}};
  const own=()=>{const u=user();return u&&DATA.members.find(x=>x.memberId===u.memberId&&x.name===u.name)};
  async function copyValue(value,btn){
    value=String(value||'');if(!value)return;
    try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}
    catch(_){return}
    if(btn){const old=btn.textContent;btn.textContent='복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)}
  }
  window.flightCopy=copyValue;
  const copyBtn=(label,value)=>value?`<button type="button" class="flight-copy" data-flight-copy="${esc(value)}">${esc(label)} 복사</button>`:'';
  function copyLine(label,value){return `<div class="copy-line"><span><b>${esc(label)}</b> ${esc(value)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(value)}">복사</button></div>`}
  function carrierBadge(kind){return kind==='trinity'?'<span class="carrier-badge carrier-trinity">TRINITY</span>':'<span class="carrier-badge carrier-ryanair">RYANAIR</span>'}
  function leg(title,l,kind,extra=''){
    return `<div class="flight-leg flight-leg-${kind}"><div class="flight-leg-top"><b>${carrierBadge(kind)} ${esc(title)} · ${esc(l.flight)}</b><span>${esc(l.seat||'좌석 미표기')}</span></div><div class="route">${esc(l.route)}</div><div class="meta">${esc(l.date)} · ${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}${extra?' · '+esc(extra):''}</div>${l.reservation?copyLine('예약번호',l.reservation):''}</div>`;
  }
  function reminderBox(which){
    const r=DATA.twaySeatReminder?.[which];if(!r)return'';
    const live=Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart);
    return `<div class="tway-seat-reminder${live?' tway-seat-live':''}"><b>${live?'✓ 지금 확인':'⏰ 트리니티항공 사전 좌석지정 일정'} · ${esc(r.flight)}</b><strong>${esc(r.display)}</strong>부터 출발 24시간 전입니다. 사전 좌석지정 가능 여부를 확인하세요.</div>`;
  }
  function trinityPanel(m){
    const tw=m.tway;
    return `<section class="carrier-panel carrier-panel-trinity"><div class="carrier-panel-head"><div>${carrierBadge('trinity')}<small>개인 E-ticket</small></div><strong>트리니티항공</strong></div><p class="carrier-desc">개인별로 발행된 트리니티항공 예매 확인증(E-ticket)입니다. TW405·TW406의 예약번호와 항공권 번호는 동일 E-ticket에서 확인합니다.</p>
      <div class="flight-id-grid"><div class="flight-id-box"><small>예약번호 Reservation No</small><div class="flight-code-row"><span class="flight-code">${esc(tw.reservation)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.reservation)}">복사</button></div></div><div class="flight-id-box"><small>항공권 번호 Ticket No</small><div class="flight-code-row"><span class="flight-code">${esc(tw.ticket)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.ticket)}">복사</button></div></div></div>
      ${reminderBox('outbound')}
      <div class="flight-leg-list">${leg('인천 → 로마',tw.outbound,'trinity','개인 E-ticket')}${reminderBox('return')}${leg('로마 → 인천',tw.return,'trinity','개인 E-ticket')}</div>
      <div class="flight-actions"><a class="primary" href="${esc(tw.eticket)}" download="${esc(m.name)}_Trinity_E-ticket.pdf">⇩ 내 트리니티 E-ticket 다운로드</a><a class="secondary" href="${esc(tw.eticket)}" target="_blank" rel="noopener">내 트리니티 E-ticket 보기</a></div></section>`;
  }
  function ryanairPanel(m){
    const ro=m.ryanair.outbound,rr=m.ryanair.return,g=DATA.ryanairGroupDocument||{};
    return `<section class="carrier-panel carrier-panel-ryanair"><div class="carrier-panel-head"><div>${carrierBadge('ryanair')}<small>단체 예약 확인서</small></div><strong>Ryanair</strong></div><p class="carrier-desc">개인 좌석·예약번호는 아래에서 바로 확인하고, 발행 원본은 팀 전체 탑승객이 함께 표시된 Ryanair 단체 예약 확인서를 엽니다.</p>
      <div class="flight-leg-list">${leg('로마 → 두브로브니크',ro,'ryanair','공항 체크인')}${leg('자그레브 → 로마',rr,'ryanair','공항 체크인')}</div>
      <div class="flight-actions"><a class="primary ryanair-doc" href="${esc(g.path)}" target="_blank" rel="noopener">Ryanair 단체 확인서 바로보기</a><a class="secondary ryanair-doc" href="${esc(g.path)}" download="${esc(g.downloadName||'Ryanair_Group_Reservation.pdf')}">⇩ Ryanair 단체 확인서 다운로드</a></div><div class="group-doc-note">※ 단체 확인서에는 크로아티아팀 전체 탑승객 이름과 좌석이 포함됩니다.</div></section>`;
  }
  function personalCard(m){
    return `<article class="flight-personal"><small>MY FLIGHT · PRIVATE VIEW</small><h3>${esc(m.name)} <span class="en-name">${esc(m.englishName)}</span></h3><div class="en-name">${esc(m.org)} · ${esc(m.group)}조</div><div class="carrier-legend"><span>${carrierBadge('trinity')} 개인 E-ticket · TW405/TW406</span><span>${carrierBadge('ryanair')} 단체 예약 확인서 · FR5975/FR8836</span></div>${trinityPanel(m)}${ryanairPanel(m)}<div class="flight-actions flight-actions-last"><button class="secondary" type="button" data-flight-copy="${esc(m.englishName)}">영문명 복사</button></div><div class="flight-personal-only-note">항공편·예약번호·항공권 번호·좌석은 로그인한 본인 기준으로 표시합니다. Ryanair 원본 PDF만 요청에 따라 단체 예약 확인서로 제공합니다.</div></article>`;
  }
  function scheduleLeg(label,l,opts={}){
    const seat=opts.seat||l.seat||'';const actions=[];const kind=opts.kind||'trinity';
    if(opts.reservation)actions.push(copyBtn('예약번호',opts.reservation));
    if(opts.ticket)actions.push(copyBtn('항공권',opts.ticket));
    if(opts.eticket)actions.push(`<a href="${esc(opts.eticket)}" target="_blank" rel="noopener">트리니티 개인 E-ticket</a>`);
    if(opts.groupDoc)actions.push(`<a href="${esc(opts.groupDoc)}" target="_blank" rel="noopener">Ryanair 단체 확인서</a>`);
    return `<div class="personal-day-leg personal-day-${kind}"><div class="personal-day-leg-top"><b>${carrierBadge(kind)} ${esc(label)} · ${esc(l.flight)}</b>${seat?`<span class="personal-day-seat">${esc(seat)}</span>`:''}</div><div class="personal-day-route">${esc(l.route)}</div><div class="personal-day-meta">${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}${opts.note?' · '+esc(opts.note):''}</div>${actions.length?`<div class="personal-day-actions">${actions.join('')}</div>`:''}</div>`;
  }
  function scheduleCard(m,date){
    const tw=m.tway,ro=m.ryanair.outbound,rr=m.ryanair.return,g=DATA.ryanairGroupDocument||{};let body='';
    if(date==='2026-10-12'){
      body=scheduleLeg('내 항공',tw.outbound,{kind:'trinity',reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket,note:'개인 E-ticket'})+scheduleLeg('내 환승 항공',ro,{kind:'ryanair',reservation:ro.reservation,seat:ro.seat,groupDoc:g.path,note:'단체 예약 확인서'});
    }else if(date==='2026-10-17'){
      body=reminderBox('return')+scheduleLeg('내 항공',rr,{kind:'ryanair',reservation:rr.reservation,seat:rr.seat,groupDoc:g.path,note:'단체 예약 확인서'});
    }else if(date==='2026-10-18'){
      body=scheduleLeg('내 귀국 항공',tw.return,{kind:'trinity',reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket,note:'로마 현지 10/17 21:15부터 사전 좌석지정 확인'});
    }else return'';
    return `<section class="personal-flight-day" data-personal-flight-date="${esc(date)}"><div class="personal-flight-day-head"><div><small>MY FLIGHT · ${esc(date.slice(5).replace('-','/'))}</small><b>${esc(m.name)}님의 실제 항공편</b></div><span>본인 전용</span></div>${body}</section>`;
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
    box.innerHTML=`<div class="flight-shell"><div class="flight-source-note"><strong>항공사별로 구분된 개인 항공정보</strong><br><b>TRINITY</b>는 개인 E-ticket, <b>RYANAIR</b>는 개인 좌석·예약번호와 단체 예약 확인서로 구분합니다.</div>${m?personalCard(m):'<div class="flight-login-note"><b>로그인한 원우의 개인 항공정보만 확인할 수 있습니다.</b><br><small>크로아티아팀 원우 27명 전용</small></div>'}</div>`;
    renderSchedule();paintQuick();
  }
  function activeReminder(){for(const k of ['outbound','return']){const r=DATA.twaySeatReminder?.[k];if(r&&Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart))return r}return null}
  function paintQuick(){
    const b=document.getElementById('myFlightQuick');if(!b)return;const m=own();if(!m){b.hidden=true;return}b.hidden=false;const r=activeReminder();
    b.innerHTML=`<span class="ico">✈</span><span><b>${r?'트리니티 사전 좌석지정 확인':'내 항공권 · E-ticket'}</b><small>${r?`${esc(r.flight)} · 출발 24시간 전 확인 구간`:`TRINITY 개인 E-ticket · RYANAIR 좌석 ${esc(m.ryanair.outbound.seat)}/${esc(m.ryanair.return.seat)}`}</small></span><span class="arr">›</span>`;
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-flight-copy]');if(b){e.preventDefault();copyValue(b.dataset.flightCopy,b)}});
  window.addEventListener('cro-auth-change',()=>{render();renderSchedule();paintQuick()});
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='flights')render();if(e.detail?.view==='schedule')renderSchedule()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();renderSchedule();paintQuick()},{once:true});else{render();renderSchedule();paintQuick()}
})();
