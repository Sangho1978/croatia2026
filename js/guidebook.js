(function(){
'use strict';
const esc=s=>Integration.escape(String(s??''));
function render(){
 const root=document.getElementById('guidebookApp'),g=window.CRO_GUIDEBOOK;if(!root||!g)return;
 const flightRows=g.flights.map(x=>`<tr><td>${esc(x[0])}</td><th>${esc(x[1])}</th><td>${esc(x[2])}</td><td>${esc(x[3])}</td></tr>`).join('');
 const schedule=(window.days||[]).map((d,i)=>`<article class="booklet-day"><div><span>${i+1}일차 · ${esc(d.date.slice(5).replace('-','/'))}</span><h3>${esc(d.title)}</h3></div><p>${esc(d.route)}</p><div class="booklet-day-events">${(d.events||[]).slice(0,7).map(e=>`<span><b>${esc(e[0])}</b>${esc(e[1])}</span>`).join('')}</div><button type="button" data-booklet-day="${esc(d.date)}">일정 상세 보기</button></article>`).join('');
 const cards=g.cards.map(c=>`<details class="booklet-card"><summary><span class="booklet-icon">${c.icon}</span><span><b>${esc(c.title)}</b><small>안내소책자 ${esc(c.page)}</small></span></summary><ul>${c.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`).join('');
 const hotels=g.hotels.map(h=>`<article class="booklet-hotel"><span>${esc(h[0])}</span><h3>${esc(h[1])}</h3><p>${esc(h[2])}</p><div><a href="tel:${esc(h[3].replace(/\s+/g,''))}">${esc(h[3])}</a><a target="_blank" rel="noopener" href="${esc(h[4])}">지도 ↗</a></div></article>`).join('');
 root.innerHTML=`
  <div class="booklet-hero"><span>OFFICIAL FIELD BRIEF · ${esc(g.version)}</span><h3>${esc(g.title)}</h3><p>변경된 공식 일정과 현장에서 바로 필요한 소책자 정보를 한 화면에 모았습니다. <b>현장 변경 시 인솔자·항공사 당일 안내가 우선</b>입니다.</p></div>
  <section class="booklet-meeting"><div><small>공항 집결</small><b>${esc(g.meeting.when)}</b><span>${esc(g.meeting.where)}</span></div><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Incheon+International+Airport+Terminal+1">인천공항 지도 ↗</a></section>
  <section class="booklet-block"><div class="booklet-section-head"><div><small>FLIGHT</small><h3>항공편 한눈에</h3></div><span>소책자 p.2</span></div><div class="booklet-table-wrap"><table><thead><tr><th>날짜</th><th>편명</th><th>출발</th><th>도착</th></tr></thead><tbody>${flightRows}</tbody></table></div></section>
  <section class="booklet-block"><div class="booklet-section-head"><div><small>ITINERARY</small><h3>09/22 변경 일정</h3></div><span>소책자 p.33–36</span></div><div class="booklet-days">${schedule}</div></section>
  <section class="booklet-block"><div class="booklet-section-head"><div><small>ESSENTIALS</small><h3>현장 필수정보</h3></div><span>터치해 펼치기</span></div><div class="booklet-cards">${cards}</div></section>
  <section class="booklet-quick" aria-label="현장 바로가기"><button type="button" data-booklet-route="emergency"><b>!</b><span>긴급·대사관</span></button><button type="button" data-booklet-route="check"><b>✓</b><span>준비물 체크</span></button><button type="button" data-booklet-route="hotels"><b>▣</b><span>호텔·지도</span></button><button type="button" data-booklet-route="location"><b>⌖</b><span>일행 위치</span></button></section>
  <section class="booklet-block"><div class="booklet-section-head"><div><small>HOTELS</small><h3>확정 숙박호텔</h3></div><span>소책자 p.37–51</span></div><div class="booklet-hotels">${hotels}</div></section>
  <div class="booklet-source-note"><b>자료 기준</b> 2026-09-22 여행사 안내소책자. 소책자 안에서도 수신기 충전단자처럼 서로 다른 표기가 있는 항목은 앱이 임의로 정정하지 않고 ‘최종 확인 필요’로 표시했습니다.</div>`;
 root.querySelectorAll('[data-booklet-day]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const date=b.dataset.bookletDay;AppRouter?.go('schedule',date)}));
 root.querySelectorAll('[data-booklet-route]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();AppRouter?.go(b.dataset.bookletRoute)}));
}
document.addEventListener('DOMContentLoaded',render);window.addEventListener('cro-route',e=>{if(e.detail?.view==='guidebook')render()});
})();
