/* MIX03: web timetables are references, NOT confirmed group e-tickets.
 * ISO instants explicitly carry offsets; every displayed transfer is an estimate.
 * Replace this file with final e-ticket times when available.
 */
(function(){
const SOURCE={
  out:'https://www.flight.info/FR5975',out2:'https://info.flightmapper.net/flight/Ryanair_FR_5975',
  back:'https://www.flight.info/FR8836',
  airline:'https://www.ryanair.com/gb/en',
  times:'https://help.ryanair.com/hc/en-gb/articles/12890551921425-When-should-I-arrive-at-the-airport',
  bag:'https://help.ryanair.com/hc/en-gb/articles/12890531028497-How-far-in-advance-can-I-drop-my-bag-at-the-bag-drop-counter',
  terminal:'https://www.roma-airport.com/fiumicino-fco-airlines',
  map:'https://www.adr.it/web/aeroporti-di-roma-en/fiumicino-shop-eat-maps',
  zag:'https://www.zagreb-airport.hr/en/passengers',dbv:'https://www.airport-dubrovnik.hr/'
};
const out={flight:'FR5975',origin:'FCO',destination:'DBV',departure:'2026-10-12T23:30:00+02:00',arrival:'2026-10-13T00:50:00+02:00',minutes:80,confirmed:false,checked:'2026-09-18',terminal:'FCO T1 (\uc77c\ubc18 \uc6b4\uc601\uc548\ub0b4 \uae30\uc900, \ub2f9\uc77c \ud655\uc778)',source:SOURCE.out};
const back={flight:'FR8836',origin:'ZAG',destination:'FCO',departure:'2026-10-17T22:10:00+02:00',arrival:'2026-10-17T23:35:00+02:00',minutes:85,confirmed:false,checked:'2026-09-18',terminal:'ZAG \uc5ec\uac1d\ud130\ubbf8\ub110 / FCO \ub3c4\ucc29 T1 \uc608\uc0c1',source:SOURCE.back};
// Keep the original non-flight dates, guide ids, maps, hotels and attraction data.
const d12=days.find(d=>d.date==='2026-10-12'),d13=days.find(d=>d.date==='2026-10-13'),d17=days.find(d=>d.date==='2026-10-17'),d18=days.find(d=>d.date==='2026-10-18');
const rows12=[
['09:35 KST','\uc778\ucc9c T1 3\uce35 B\uce74\uc6b4\ud130 \uc55e \uc9d1\uacb0 (\uae30\uc874 \uc548\ub0b4\ucc45\uc790)','2026-10-12T09:35:00+09:00'],
['12:35 KST','TW405 \uc778\ucc9c \ucd9c\ubc1c (\uae30\uc874 \uc790\ub8cc)','2026-10-12T12:35:00+09:00'],
['19:15 CEST','TW405 \ub85c\ub9c8 FCO \ub3c4\ucc29 \u00b7 T3 \uc608\uc0c1 / \ub2f9\uc77c \ud655\uc778','2026-10-12T19:15:00+02:00'],
['19:15~20:25','[\uc608\uc0c1] \ud558\uae30\u00b7\uc785\uad6d\uc2ec\uc0ac\u00b7\uc704\ud0c1\uc218\ud558\ubb3c \uc218\ub839 (70\ubd84, \ud63c\uc7a1 \uc2dc \uc5f0\uc7a5)','2026-10-12T19:15:00+02:00'],
['20:25~20:40','[\uc608\uc0c1] FCO T3 \u2192 T1 \uc774\ub3d9\u00b7\uc7ac\uc9d1\uacb0 (10~15\ubd84)','2026-10-12T20:25:00+02:00'],
['20:40~21:25','[\ucd94\ucc9c] \uacf5\ud56d \uc800\ub141 \uac04\ub2e8\uc2dd 45\ubd84 \u00b7 \uc785\uad6d\uc9c0\uc5f0 \uc2dc \ud3ec\uc7a5\uc2dd \uc6b0\uc120','2026-10-12T20:40:00+02:00'],
['21:30~22:00','[\ucd94\ucc9c] Ryanair \uc218\ud558\ubb3c \uc7ac\uc704\ud0c1 \u00b7 \uc77c\ubc18 \ub9c8\uac10 22:50, \ud604\uc7a5\uc548\ub0b4 \uc6b0\uc120','2026-10-12T21:30:00+02:00'],
['22:00~22:30','[\uc608\uc0c1] \ubcf4\uc548\uac80\uc0ac\u00b7\ud0d1\uc2b9\uad6c \uc774\ub3d9','2026-10-12T22:00:00+02:00'],
['22:30','[\ucd94\ucc9c] \ud0d1\uc2b9\uad6c \uc804\uc6d0 \uc9d1\uacb0 \u00b7 \ucd9c\ubc1c 30\ubd84 \uc804(23:00)\uae4c\uc9c0\ub294 \ub3c4\ucc29','2026-10-12T22:30:00+02:00'],
['23:30 CEST','[\uc870\ud68c \uc2dc\uac04\ud45c] FR5975 FCO \u2192 DBV \ucd9c\ubc1c \u00b7 1\uc2dc\uac04 20\ubd84','2026-10-12T23:30:00+02:00']
];
const rows13=[
['00:50 CEST','[\uc870\ud68c \uc2dc\uac04\ud45c] FR5975 DBV \ub3c4\ucc29 \u00b7 10/13(\ud654) \uc0c8\ubcbd','2026-10-13T00:50:00+02:00'],
['00:50~01:35','[\uc608\uc0c1] \ud558\uae30\u00b7\uc218\ud558\ubb3c\u00b7\uc778\uc6d0\ud655\uc778 45\ubd84 (\uc27c\uac90 \uc5ed\ub0b4 \uc774\ub3d9)','2026-10-13T00:50:00+02:00'],
['01:35~01:45','[\uc608\uc0c1] \uacf5\ud56d \ubc84\uc2a4 \ud0d1\uc2b9 10\ubd84','2026-10-13T01:35:00+02:00'],
['01:45~02:15/02:25','[\uc608\uc0c1] DBV \u2192 Grand Hotel Park \ucc28\ub7c9 30~40\ubd84','2026-10-13T01:45:00+02:00'],
['02:15~02:25','[\uc608\uc0c1] Grand Hotel Park \ub3c4\ucc29 \u00b7 \uc9c0\uc5f0\u00b7\uc8fc\ucc28 \uc0c1\ud669\uc5d0 \ub530\ub77c \ubcc0\ub3d9','2026-10-13T02:15:00+02:00'],
['02:25~02:45','[\ucd94\ucc9c] \uac1d\uc2e4 \ubc30\uc815\u00b7\ucde8\uce68 \u00b7 10/12\ubc15 \uc608\uc57d/\uc2ec\uc57c \ub3c4\ucc29 \ud638\ud154 \uc0ac\uc804\ud1b5\ubcf4 \ud544\uc694','2026-10-13T02:25:00+02:00']
];
const rows17=[
['16:30~18:00','[\uae30\uc874 \ucd94\ucc9c\uc548] \uc800\ub141 \uc2dd\uc0ac 1\uc2dc\uac04 30\ubd84','2026-10-17T16:30:00+02:00'],
['18:10~18:50','[\uc608\uc0c1] \uc790\uadf8\ub808\ube0c \uc2dc\ub0b4 \u2192 ZAG \ucc28\ub7c9 30~40\ubd84','2026-10-17T18:10:00+02:00'],
['18:50~20:10','[\uc608\ube44\uc2dc\uac04] \uacf5\ud56d \uc9d1\uacb0\u00b7\ud0d1\uc2b9\uad8c\u00b7\uc218\ud558\ubb3c \ud655\uc778, \uce74\uc6b4\ud130 \uc5f4\ub9bc \ud655\uc778','2026-10-17T18:50:00+02:00'],
['20:10~20:50','[\ucd94\ucc9c] Ryanair \uc218\ud558\ubb3c \uc704\ud0c1\u00b7\ubcf4\uc548\uac80\uc0ac \u00b7 \uc77c\ubc18 \uc704\ud0c1\ub9c8\uac10 21:30','2026-10-17T20:10:00+02:00'],
['21:15','[\ucd94\ucc9c] \ud0d1\uc2b9\uad6c \uc9d1\uacb0 \u00b7 \ucd5c\uc18c 21:40\uae4c\uc9c0 \ub3c4\ucc29','2026-10-17T21:15:00+02:00'],
['22:10 CEST','[\uc870\ud68c \uc2dc\uac04\ud45c] FR8836 ZAG \u2192 FCO \ucd9c\ubc1c \u00b7 1\uc2dc\uac04 25\ubd84','2026-10-17T22:10:00+02:00'],
['23:35 CEST','[\uc870\ud68c \uc2dc\uac04\ud45c] FCO \ub3c4\ucc29 \u00b7 T1 \uc608\uc0c1/\ub2f9\uc77c \ud655\uc778','2026-10-17T23:35:00+02:00'],
['23:35~10/18 00:15','[\uc608\uc0c1] \ud558\uae30\u00b7\uc218\ud558\ubb3c \uc218\ub839 \u00b7 \ud604\uc9c0 \ub0a0\uc9dc\uac00 18\uc77c\ub85c \ubc14\ub01d\ub2c8\ub2e4.','2026-10-17T23:35:00+02:00']
];
const rows18=[
['00:15~00:25','[\uc608\uc0c1] FCO \ud130\ubbf8\ub110 \uc55e \ubc84\uc2a4 \ud0d1\uc2b9','2026-10-18T00:15:00+02:00'],
['00:25~00:50/01:00','[\uc608\uc0c1] FCO \u2192 The Caesar Roma \ucc28\ub7c9 25~35\ubd84','2026-10-18T00:25:00+02:00'],
['00:50~01:00','[\uc608\uc0c1] \ud638\ud154 \ub3c4\ucc29 \u00b7 10/17\ubc15 \uc608\uc57d/\ub291\uc740 \uccb4\ud06c\uc778 \ud655\uc778','2026-10-18T00:50:00+02:00']
];
function apply(d,rows,keep){if(!d)return;const old=d.events.filter(keep||(()=>false));d.events=rows.map(x=>x.slice(0,2)).concat(old);d.eventInstants=rows.map(x=>x[2]).concat(old.map(x=>{const m=x[0].match(/(\d{1,2}):(\d{2})/);return m?d.date+'T'+m[1].padStart(2,'0')+':'+m[2]+':00+02:00':null}));}
apply(d12,rows12);
if(d12){d12.meal='FCO \ud658\uc2b9 4\uc2dc\uac04 15\ubd84(19:15~23:30) \uae30\uc900. 20:40~21:25 \uacf5\ud56d \uac04\ub2e8\uc2dd 45\ubd84 \ucd94\ucc9c. \uc9c0\uc5f0 \uc2dc \uc2dd\uc0ac\ubcf4\ub2e4 \uc7ac\uc704\ud0c1\u00b7\ud0d1\uc2b9 \uc6b0\uc120. \ud56d\uacf5\uad8c \ubcc4\ub3c4 \uc608\uc57d\uc73c\ub85c \uac00\uc815\ud588\uc73c\uba70 \uc218\ud558\ubb3c \uc5f0\uacb0 \uc5ec\ubd80\ub294 \uc778\uc194\uc790 \ud655\uc778.';d12.moves=[['\u2708 \ud56d\uacf5','ICN \u2192 FCO','13\uc2dc\uac04 40\ubd84 (KST/CEST \ubcf4\uc815)'],['\ud83d\udeb6 \ud130\ubbf8\ub110','FCO T3 \u2192 T1','10~15\ubd84 \uc608\uc0c1'],['\u2708 \ud56d\uacf5','FR5975 FCO \u2192 DBV','23:30 \u2192 \uc775\uc77c 00:50 / 1\uc2dc\uac04 20\ubd84']];}
apply(d13,rows13,()=>true);
if(d17){const old=d17.events.filter(x=>{const m=x[0].match(/(\d{1,2}):(\d{2})/);return m&&+m[1]<16});d17.events=old;apply(d17,rows17,()=>true);const combined=d17.events.map((e,i)=>({e,t:d17.eventInstants[i]})).sort((a,b)=>new Date(a.t)-new Date(b.t));d17.events=combined.map(x=>x.e);d17.eventInstants=combined.map(x=>x.t);}
apply(d18,rows18,()=>true);
function next(d){if(!d.eventInstants)return null;const now=Date.now();for(let i=0;i<d.events.length;i++){const t=Date.parse(d.eventInstants[i]);if(Number.isFinite(t)&&t>=now){const mins=Math.ceil((t-now)/60000);return {time:d.events[i][0].split('~')[0],label:d.events[i][1],count:mins>=1440?Math.floor(mins/1440)+'\uc77c \ud6c4':mins>=60?Math.floor(mins/60)+'\uc2dc\uac04 '+mins%60+'\ubd84 \ud6c4':mins+'\ubd84 \ud6c4'};}}return {time:'\uc77c\uc815 \uc885\ub8cc',label:'\ub2e4\uc74c \ud604\uc9c0 \ub0a0\uc9dc \uc77c\uc815\uc744 \ud655\uc778\ud558\uc138\uc694.',count:''};}
window.FlightPlan={out,back,rows12,rows13,rows17,rows18,SOURCE,next,checked:'2026-09-18'};
})();
