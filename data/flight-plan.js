/* MIX26 · 2026-09-22 guide-booklet flight schedule.
 * The final issued E-ticket / airline day-of-operation notice always has priority.
 */
(function(){
'use strict';
const SOURCE={
  booklet:'2026-09-22 안내소책자',
  airline:'https://www.ryanair.com/',
  terminal:'https://www.adr.it/web/aeroporti-di-roma-en/pax-fco-airport-map',
  map:'https://www.adr.it/web/aeroporti-di-roma-en/pax-fco-airport-map',
  times:'https://help.ryanair.com/hc/en-gb/categories/12488813755537-At-the-Airport-On-Board'
};
const out={flight:'FR5975',origin:'FCO',destination:'DBV',depart:'2026-10-12T23:30:00+02:00',arrive:'2026-10-13T00:50:00+02:00',minutes:80,terminal:'로마 FCO 도착 후 Terminal 1 Ryanair 카운터 이동 · 소책자 도보 약 10분',confirmed:true,basis:SOURCE.booklet};
const back={flight:'FR8836',origin:'ZAG',destination:'FCO',depart:'2026-10-17T22:10:00+02:00',arrive:'2026-10-17T23:35:00+02:00',minutes:85,terminal:'자그레브 국제공항 → 로마 FCO · 도착 터미널/게이트는 당일 확인',confirmed:true,basis:SOURCE.booklet};
const exact={
 '2026-10-12':['2026-10-12T09:35:00+09:00','2026-10-12T12:35:00+09:00','2026-10-12T19:15:00+02:00','2026-10-12T23:30:00+02:00'],
 '2026-10-13':['2026-10-13T00:50:00+02:00','2026-10-13T02:00:00+02:00','2026-10-13T02:30:00+02:00','2026-10-13T07:00:00+02:00','2026-10-13T09:00:00+02:00','2026-10-13T18:00:00+02:00',null],
 '2026-10-14':['2026-10-14T07:00:00+02:00',null,'2026-10-14T15:00:00+02:00','2026-10-14T18:00:00+02:00',null],
 '2026-10-15':['2026-10-15T07:00:00+02:00',null,null,null,null,'2026-10-15T18:00:00+02:00',null],
 '2026-10-16':['2026-10-16T07:00:00+02:00',null,null,null,null,null,'2026-10-16T18:00:00+02:00',null],
 '2026-10-17':['2026-10-17T07:00:00+02:00',null,null,null,null,null,'2026-10-17T22:10:00+02:00','2026-10-17T23:35:00+02:00'],
 '2026-10-18':['2026-10-18T07:00:00+02:00',null,null,null,null,'2026-10-18T16:30:00+02:00','2026-10-18T21:15:00+02:00'],
 '2026-10-19':['2026-10-19T16:10:00+09:00',null]
};
for(const d of days)d.eventInstants=exact[d.date]||d.events.map(()=>null);
function next(d){
  if(!d?.eventInstants)return null;
  const now=Date.now();
  for(let i=0;i<d.events.length;i++){
    const iso=d.eventInstants[i],t=iso?Date.parse(iso):NaN;
    if(Number.isFinite(t)&&t>=now){
      const mins=Math.ceil((t-now)/60000),raw=String(d.events[i][0]||''),time=(raw.match(/\d{1,2}:\d{2}/)||[raw])[0];
      return {time,label:d.events[i][1],count:mins>=1440?Math.floor(mins/1440)+'일 후':mins>=60?Math.floor(mins/60)+'시간 '+mins%60+'분 후':mins+'분 후'};
    }
  }
  return {time:'일정 종료',label:'해당 날짜의 확정 시각 일정이 종료되었습니다.',count:''};
}
window.FlightPlan={out,back,SOURCE,next,checked:'2026-09-22'};
})();
