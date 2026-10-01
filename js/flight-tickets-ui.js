/* MIX54 Croatia personal-only flight / E-ticket UI */
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
  function leg(title,l,extra=''){
    return `<div class="flight-leg"><div class="flight-leg-top"><b>${esc(title)} · ${esc(l.flight)}</b><span>${esc(l.seat||'좌석 미표기')}</span></div><div class="route">${esc(l.route)}</div><div class="meta">${esc(l.date)} · ${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}${extra?' · '+esc(extra):''}</div>${l.reservation?copyLine('예약번호',l.reservation):''}</div>`;
  }
  function reminderBox(which){
    const r=DATA.twaySeatReminder?.[which];if(!r)return'';
    const live=Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart);
    return `<div class="tway-seat-reminder${live?' tway-seat-live':''}"><b>${live?'✓ 지금 확인':'⏰ 티웨이 좌석지정 알림'} · ${esc(r.flight)}</b>${esc(r.display)}부터 출발 24시간 전 좌석지정 여부를 확인하세요.</div>`;
  }
  function personalCard(m){
    const tw=m.tway,ro=m.ryanair.outbound,rr=m.ryanair.return;
    return `<article class="flight-personal"><small>MY FLIGHT · PRIVATE VIEW</small><h3>${esc(m.name)} <span class="en-name">${esc(m.englishName)}</span></h3><div class="en-name">${esc(m.org)} · ${esc(m.group)}조</div>
      <div class="flight-id-grid"><div class="flight-id-box"><small>TW 예약번호</small><div class="flight-code-row"><span class="flight-code">${esc(tw.reservation)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.reservation)}">복사</button></div></div><div class="flight-id-box"><small>항공권 번호</small><div class="flight-code-row"><span class="flight-code">${esc(tw.ticket)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.ticket)}">복사</button></div></div></div>
      ${reminderBox('outbound')}
      <div class="flight-leg-list">${leg('출국',tw.outbound,'좌석지정 확인 필요')}${leg('로마 → 두브로브니크',ro,'공항 체크인')}${leg('자그레브 → 로마',rr,'공항 체크인')}${reminderBox('return')}${leg('귀국',tw.return,'좌석지정 확인 필요')}</div>
      <div class="flight-actions"><a class="primary" href="${esc(tw.eticket)}" download="${esc(m.name)}_TW_E-ticket.pdf">⇩ 내 E-ticket 다운로드</a><a class="secondary" href="${esc(tw.eticket)}" target="_blank" rel="noopener">내 PDF 보기</a><button class="secondary" type="button" data-flight-copy="${esc(m.englishName)}">영문명 복사</button></div><div class="flight-personal-only-note">이 화면에는 로그인한 본인의 항공정보만 표시됩니다. 단체 전체 좌석·예약 목록은 표시하지 않습니다.</div></article>`;
  }
  function scheduleLeg(label,l,opts={}){
    const seat=opts.seat||l.seat||'';
    const actions=[];
    if(opts.reservation)actions.push(copyBtn('예약번호',opts.reservation));
    if(opts.ticket)actions.push(copyBtn('항공권',opts.ticket));
    if(opts.eticket)actions.push(`<a href="${esc(opts.eticket)}" target="_blank" rel="noopener">내 E-ticket</a>`);
    return `<div class="personal-day-leg"><div class="personal-day-leg-top"><b>${esc(label)} · ${esc(l.flight)}</b>${seat?`<span class="personal-day-seat">${esc(seat)}</span>`:''}</div><div class="personal-day-route">${esc(l.route)}</div><div class="personal-day-meta">${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}${opts.note?' · '+esc(opts.note):''}</div>${actions.length?`<div class="personal-day-actions">${actions.join('')}</div>`:''}</div>`;
  }
  function scheduleCard(m,date){
    const tw=m.tway,ro=m.ryanair.outbound,rr=m.ryanair.return;let body='';
    if(date==='2026-10-12'){
      body=reminderBox('outbound')+scheduleLeg('내 항공',tw.outbound,{reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket,note:'티웨이'})+scheduleLeg('내 환승 항공',ro,{reservation:ro.reservation,seat:ro.seat,note:'Ryanair'});
    }else if(date==='2026-10-17'){
      body=scheduleLeg('내 항공',rr,{reservation:rr.reservation,seat:rr.seat,note:'Ryanair'})+reminderBox('return');
    }else if(date==='2026-10-18'){
      body=scheduleLeg('내 귀국 항공',tw.return,{reservation:tw.reservation,ticket:tw.ticket,eticket:tw.eticket,note:'티웨이 · 출발 24시간 전 좌석지정 확인'});
    }else return'';
    return `<section class="personal-flight-day" data-personal-flight-date="${esc(date)}"><div class="personal-flight-day-head"><div><small>MY FLIGHT · ${esc(date.slice(5).replace('-','/'))}</small><b>${esc(m.name)}님의 실제 항공편</b></div><span>본인 전용</span></div>${body}</section>`;
  }
  function renderSchedule(){
    document.querySelectorAll('.personal-flight-day').forEach(x=>x.remove());
    if((window.GSPA_TRIP_ID||'croatia')!=='croatia')return;
    const m=own();if(!m||!Array.isArray(window.days)&&typeof days==='undefined')return;
    document.querySelectorAll('#dayPanels .panel').forEach((panel,i)=>{
      const d=(typeof days!=='undefined'&&days[i])||null;if(!d)return;
      const html=scheduleCard(m,d.date);if(!html)return;
      const holder=document.createElement('div');holder.innerHTML=html;
      const point=panel.querySelector('.day-summary');point?.insertAdjacentElement('afterend',holder.firstElementChild);
    });
  }
  function render(){
    if((window.GSPA_TRIP_ID||'croatia')!=='croatia')return;
    const box=document.getElementById('flightTicketsApp');if(!box)return;
    const m=own();
    box.innerHTML=`<div class="flight-shell"><div class="flight-source-note"><strong>개인 전용 항공정보</strong><br>로그인한 크로아티아팀 원우 본인의 예약번호·항공권 번호·좌석·E-ticket만 표시합니다.</div>${m?personalCard(m):'<div class="flight-login-note"><b>로그인한 원우의 개인 항공권만 확인할 수 있습니다.</b><br><small>크로아티아팀 원우 27명 전용 · 전체 명단/좌석표 미표시</small></div>'}</div>`;
    renderSchedule();paintQuick();
  }
  function activeReminder(){
    for(const k of ['outbound','return']){const r=DATA.twaySeatReminder?.[k];if(r&&Date.now()>=Date.parse(r.availableFrom)&&Date.now()<Date.parse(r.depart))return r}return null;
  }
  function paintQuick(){
    const b=document.getElementById('myFlightQuick');if(!b)return;const m=own();
    if(!m){b.hidden=true;return}b.hidden=false;const r=activeReminder();
    b.innerHTML=`<span class="ico">✈</span><span><b>${r?'티웨이 좌석지정 확인':'내 항공권 · E-ticket'}</b><small>${r?`${esc(r.flight)} · 출발 24시간 전 확인 가능`:`내 예약번호 · E-ticket · Ryanair 좌석 ${esc(m.ryanair.outbound.seat)}/${esc(m.ryanair.return.seat)}`}</small></span><span class="arr">›</span>`;
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-flight-copy]');if(b){e.preventDefault();copyValue(b.dataset.flightCopy,b)}});
  window.addEventListener('cro-auth-change',()=>{render();renderSchedule();paintQuick()});
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='flights')render();if(e.detail?.view==='schedule')renderSchedule()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();renderSchedule();paintQuick()},{once:true});else{render();renderSchedule();paintQuick()}
})();
