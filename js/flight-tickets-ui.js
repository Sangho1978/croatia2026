/* MIX53 Croatia-only personalized flight / E-ticket UI */
(function(){
  'use strict';
  const DATA=window.CRO_FLIGHT_TICKETS||{members:[]};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const user=()=>{try{return typeof currentUser!=='undefined'?currentUser:null}catch(_){return null}};
  const own=()=>{const u=user();return u&&DATA.members.find(x=>x.name===u.name)};
  async function copyValue(value,btn){
    value=String(value||''); if(!value)return;
    try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}}
    catch(_){return}
    if(btn){const old=btn.textContent;btn.textContent='복사됨';btn.classList.add('copied');setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied')},1200)}
  }
  window.flightCopy=copyValue;
  function copyLine(label,value){return `<div class="copy-line"><span><b>${esc(label)}</b> ${esc(value)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(value)}">복사</button></div>`}
  function leg(title,l,extra=''){
    return `<div class="flight-leg"><div class="flight-leg-top"><b>${esc(title)} · ${esc(l.flight)}</b><span>${esc(l.seat||'좌석 미표기')}</span></div><div class="route">${esc(l.route)}</div><div class="meta">${esc(l.date)} · ${esc(l.time)}${l.checkedBag?' · 위탁 '+esc(l.checkedBag):''}${extra?' · '+esc(extra):''}</div>${l.reservation?copyLine('예약번호',l.reservation):''}</div>`;
  }
  function personalCard(m){
    const tw=m.tway,ro=m.ryanair.outbound,rr=m.ryanair.return;
    return `<article class="flight-personal"><small>MY FLIGHT · CROATIA TEAM</small><h3>${esc(m.name)} <span class="en-name">${esc(m.englishName)}</span></h3><div class="en-name">${esc(m.org)} · ${esc(m.group)}조</div>
      <div class="flight-id-grid"><div class="flight-id-box"><small>TW 예약번호</small><div class="flight-code-row"><span class="flight-code">${esc(tw.reservation)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.reservation)}">복사</button></div></div><div class="flight-id-box"><small>항공권 번호</small><div class="flight-code-row"><span class="flight-code">${esc(tw.ticket)}</span><button type="button" class="flight-copy" data-flight-copy="${esc(tw.ticket)}">복사</button></div></div></div>
      <div class="flight-leg-list">${leg('출국',tw.outbound,'좌석 E-ticket 미표기')}${leg('로마 → 두브로브니크',ro,'공항 체크인')}${leg('자그레브 → 로마',rr,'공항 체크인')}${leg('귀국',tw.return,'좌석 E-ticket 미표기')}</div>
      <div class="flight-actions"><a class="primary" href="${esc(tw.eticket)}" download="${esc(m.name)}_TW_E-ticket.pdf">⇩ 내 E-ticket 다운로드</a><a class="secondary" href="${esc(tw.eticket)}" target="_blank" rel="noopener">PDF 보기</a><a class="secondary" href="${esc(DATA.ryanairGroupPdf)}" target="_blank" rel="noopener">Ryanair 단체 예약 확인서</a><button class="secondary" type="button" data-flight-copy="${esc(m.englishName)}">영문명 복사</button></div><div class="flight-download-note">휴대전화에 저장해 두면 공항에서 예약번호·항공권 번호와 함께 바로 확인할 수 있습니다.</div></article>`;
  }
  function teamRows(q=''){
    const key=String(q||'').trim().toUpperCase();
    return DATA.members.filter(m=>!key||`${m.name} ${m.englishName} ${m.org}`.toUpperCase().includes(key)).map(m=>`<div class="flight-team-row"><div><b>${esc(m.name)}</b><small>${esc(m.org)}</small></div><small>${esc(m.englishName)}</small><span class="flight-seat" title="FR5975">${esc(m.ryanair.outbound.seat)}</span><span class="flight-seat" title="FR8836">${esc(m.ryanair.return.seat)}</span></div>`).join('')||'<div class="flight-empty">검색 결과가 없습니다.</div>';
  }
  function renderTeam(q=''){
    const el=document.getElementById('flightTeamRows');if(el)el.innerHTML=teamRows(q);
  }
  function render(){
    if((window.GSPA_TRIP_ID||'croatia')!=='croatia')return;
    const box=document.getElementById('flightTicketsApp');if(!box)return;
    const m=own();
    box.innerHTML=`<div class="flight-shell"><div class="flight-source-note"><b>영문명 대조 완료</b><br>개인 E-ticket의 영문 탑승객명과 Ryanair 단체 예약의 영문명을 대조해 연결했습니다. 본인 예약번호·항공권번호·E-ticket은 로그인한 본인에게만 표시합니다.</div>${m?personalCard(m):'<div class="flight-login-note"><b>로그인 후 내 항공권 정보를 확인할 수 있습니다.</b><br><small>크로아티아팀 원우 27명 전용</small></div>'}<section class="flight-team-card"><div class="flight-team-head"><div><small>TEAM SEATS</small><h3>크로아티아팀 Ryanair 좌석</h3></div><small>FR5975 / FR8836</small></div><input id="flightTeamSearch" class="flight-search" type="search" placeholder="이름 · 영문명 · 기관 검색" aria-label="항공 좌석 검색"><div class="flight-team-row"><b>이름</b><small>영문명</small><span class="flight-seat">5975</span><span class="flight-seat">8836</span></div><div id="flightTeamRows"></div><div class="flight-privacy-note">개인별 예약번호·항공권 번호·E-ticket은 각자 로그인했을 때만 표시합니다. 팀 공용 화면에는 영문명 대조 확인과 Ryanair 좌석만 표시합니다.</div></section></div>`;
    renderTeam();
    document.getElementById('flightTeamSearch')?.addEventListener('input',e=>renderTeam(e.target.value));
    paintQuick();
  }
  function paintQuick(){
    const b=document.getElementById('myFlightQuick');if(!b)return;
    const m=own();
    if(!m){b.hidden=true;return}b.hidden=false;
    b.innerHTML=`<span class="ico">✈</span><span><b>내 항공권 · E-ticket</b><small>FR5975 ${esc(m.ryanair.outbound.seat)} · FR8836 ${esc(m.ryanair.return.seat)} · 예약/항공권 복사</small></span><span class="arr">›</span>`;
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-flight-copy]');if(b){e.preventDefault();copyValue(b.dataset.flightCopy,b)}});
  window.addEventListener('cro-auth-change',()=>{render();paintQuick()});
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='flights')render()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();paintQuick()},{once:true});else{render();paintQuick()}
})();
