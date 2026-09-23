(function(){
 const esc=x=>Integration.escape(x);
 function header(leg){return `<div class="flight-head"><b>${leg.flight} · ${leg.origin} → ${leg.destination}</b><span>09/22 안내소책자 기준 · 최종 E-ticket 우선</span></div>`;}
 function card(leg){const f=FlightPlan,out=leg===f.out;
   const line=out?'10/12(월) 23:30 → 10/13(화) 00:50':'10/17(토) 22:10 → 10/17(토) 23:35';
   const hotel=out?'10/13 02:00 호텔 이동 → 02:30 Grand Hotel Park 도착':'23:35 로마 도착 후 · Ergife Palace Hotel & Conference Center 이동·투숙';
   const content=out?'TW405 로마 도착 19:15. 입국 수속과 짐 수령 후 Terminal 1 Ryanair 카운터로 이동(소책자 도보 약 10분)하여 FR5975로 연결합니다.':'자그레브 관광·자유시간·석식 후 공항으로 이동하여 FR8836 탑승. 로마 도착 후 Ergife Palace Hotel로 이동해 투숙합니다.';
   return `<aside class="flight-detail-card">${header(leg)}<h3>${line}</h3><div class="flight-duration">비행 ${leg.minutes}분 · 현지시각 CEST (UTC+2)</div><p>${esc(content)}</p><p><b>공항·터미널</b> ${esc(leg.terminal)}</p><div class="hotel-arrival"><b>호텔 연결</b><span>${hotel}</span></div><details><summary>기준 · 확인사항 보기</summary><p><b>2026-09-22 여행사 안내소책자</b>의 항공시각과 숙박호텔을 앱 일정에 반영했습니다. 실제 운항은 발권된 E-ticket, Ryanair/T'way 앱, 공항 전광판과 인솔자 당일 안내를 최종 기준으로 사용하세요.</p><p>수하물 수령·재위탁, 입국심사, 버스 승하차 시간은 현장 혼잡에 따라 달라질 수 있습니다.</p><div class="actions"><a class="btn" target="_blank" rel="noopener" href="${f.SOURCE.airline}">Ryanair 공식</a><a class="btn" target="_blank" rel="noopener" href="${f.SOURCE.terminal}">FCO 터미널 지도</a><a class="btn" target="_blank" rel="noopener" href="${f.SOURCE.times}">탑승 준비 기준</a></div></details></aside>`;
 }
 function render(){document.querySelectorAll('#dayPanels .panel').forEach((panel,i)=>{const date=days[i]?.date,leg=['2026-10-12','2026-10-13'].includes(date)?FlightPlan.out:['2026-10-17','2026-10-18'].includes(date)?FlightPlan.back:null;if(!leg||panel.querySelector('.flight-detail-card'))return;const temp=document.createElement('div');temp.innerHTML=card(leg);const point=panel.querySelector('.official-schedule-card')||panel.querySelector('.day-summary');point?.insertAdjacentElement('afterend',temp.firstElementChild);});}
 document.addEventListener('DOMContentLoaded',render);
 window.addEventListener('cro-route',render);
})();
