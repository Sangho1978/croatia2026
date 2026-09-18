
(function(){
const MAPS_SEARCH='https://www.google.com/maps/search/?api=1&query=';
const TOILET_DATA=[
 {id:'dbv-lapad',dates:['2026-10-13','2026-10-14'],city:'두브로브니크',name:'Lapad Market 공중화장실',near:'Grand Hotel Park·Lapad 권역 / 호텔 출발 전 대안',fee:'무료',feeType:'free',hours:'4~11월 07:00~22:00',pay:'무료',source:'Čistoća 운영정보 · 2026',sourceUrl:'https://dubrovacki.slobodnadalmacija.hr/dubrovnik/dubrovnik/zupanija/dubrovnik/za-javne-zahode-traze-cistacice-ili-cistace-prijavili-se-pa-nisu-dosli-na-razgovor-iako-neto-placa-nije-bas-ni-mala-1560175',query:'Lapad Market public toilet Dubrovnik Croatia',note:'호텔 투숙객은 호텔 WC가 가장 편합니다. Lapad 자유시간에 쓸 수 있는 무료 공중화장실 대안.',priority:8},
 {id:'dbv-pile',dates:['2026-10-13','2026-10-14'],city:'두브로브니크',name:'Pile 공중화장실',near:'Pile Gate · Onofrio · 성벽 입장 전',fee:'€1',feeType:'paid',hours:'24시간',pay:'€1/€0.50 동전 · 카드',source:'Čistoća 운영정보 · 2026',sourceUrl:'https://dubrovacki.slobodnadalmacija.hr/dubrovnik/dubrovnik/zupanija/dubrovnik/za-javne-zahode-traze-cistacice-ili-cistace-prijavili-se-pa-nisu-dosli-na-razgovor-iako-neto-placa-nije-bas-ni-mala-1560175',query:'Public Toilet Pile Dubrovnik Croatia',note:'10/13 성벽 입장 전 가장 중요한 화장실 포인트. 28명은 Pile 도착 직후 10분 이용 권장.',priority:1},
 {id:'dbv-new-oldcity',dates:['2026-10-13','2026-10-14'],city:'두브로브니크',name:'구시가지 신설 공중화장실',near:'Između Polača × Marojice Kaboge · Stradun/렉터궁/대성당 인근',fee:'요금 현장 확인',feeType:'unknown',hours:'24시간',pay:'공식 개장안내 요금 미표기',source:'두브로브니크 시청 · 2026.09.01',sourceUrl:'https://www.dubrovnik.hr/vijesti/novi-javni-wc-u-povijesnoj-jezgri-poceo-s-radom-20931',query:'Između Polača Marojice Kaboge public toilet Dubrovnik',note:'2026년 9월 1일 새로 문을 연 최신 시설. 남·여 WC와 유아돌봄 공간이 있습니다.',priority:2},
 {id:'dbv-peskarija',dates:['2026-10-13'],city:'두브로브니크',name:'Peskarija 공중화장실',near:'Old Port · 성 요한 요새 쪽',fee:'€1',feeType:'paid',hours:'24시간',pay:'€1/€0.50 동전 · 카드',source:'Čistoća 운영정보 · 2026',sourceUrl:'https://dubrovacki.slobodnadalmacija.hr/dubrovnik/dubrovnik/zupanija/dubrovnik/za-javne-zahode-traze-cistacice-ili-cistace-prijavili-se-pa-nisu-dosli-na-razgovor-iako-neto-placa-nije-bas-ni-mala-1560175',query:'Public Toilet Peskarija Dubrovnik Croatia',note:'10/13 Old Port 관람 직전·직후 사용하기 좋은 위치.',priority:3},
 {id:'dbv-ploce',dates:['2026-10-14'],city:'두브로브니크',name:'Ploče 공중화장실',near:'Ploče Gate · Old Port 동쪽 접근부',fee:'€1',feeType:'paid',hours:'07:00~21:00',pay:'€1/€0.50 동전 · 카드',source:'Čistoća 운영정보 · 2026',sourceUrl:'https://dubrovacki.slobodnadalmacija.hr/dubrovnik/dubrovnik/zupanija/dubrovnik/za-javne-zahode-traze-cistacice-ili-cistace-prijavili-se-pa-nisu-dosli-na-razgovor-iako-neto-placa-nije-bas-ni-mala-1560175',query:'Public Toilet Ploce Dubrovnik Croatia',note:'10/14 자유탐방에서 Ploče 방향까지 움직일 경우 사용.',priority:4},
 {id:'split-pistura',dates:['2026-10-15'],city:'스플리트',name:'Pistura 공중화장실',near:'Pistura 3 · 황금문/구시가지 북서쪽',fee:'성수기 최근후기 €1',feeType:'paid',hours:'연중 운영 표기 · 당일 확인',pay:'현금 동전 준비 권장',source:'2025 현장후기 + 2026 POI 확인',sourceUrl:'https://park4night.com/en/place/584662',query:'Pistura public toilet Split Croatia',note:'2025년 7월 현장후기에서 성수기 €1 언급. 카드 결제 정보는 후기 간 차이가 있어 동전 준비가 안전합니다.',priority:1},
 {id:'trogir-public',dates:['2026-10-15'],city:'트로기르',name:'Trogir Javni WC',near:'Hrvatskih mučenika bb · 구시가지 접근부',fee:'공식 요금 미확인',feeType:'unknown',hours:'현장 확인',pay:'소액 동전 준비',source:'Trogir 시 공식 자산등록부',sourceUrl:'https://trogir.hr/wp-content/uploads/2020/07/Registar-imovine_Grad-Trogir-2.pdf',query:'Javni WC Hrvatskih mucenika Trogir Croatia',note:'시 공식 자산등록부에 공공 WC로 등재된 위치. 2026 관광객 요금표는 확인되지 않아 현장표지를 우선합니다.',priority:2},
 {id:'zadar-fivewells',dates:['2026-10-16'],city:'자다르',name:'Five Wells · Trg Petra Zoranića 공중화장실',near:'Trg Petra Zoranića 8 · Five Wells/Land Gate',fee:'€1 (2025 여름후기)',feeType:'paid',hours:'10월 당일 운영시간 확인',pay:'동전 전용 사례 다수 · 거스름 없음 주의',source:'최근 Google 후기 모음 · 2025',sourceUrl:'https://www.mojastoritev.si/javna%20kopalnica/public-wc-javna-kopalnica-zadar/object_207757',query:'Public WC Trg Petra Zoranica 8 Zadar Croatia',note:'2025년 6~8월 후기에서 €1·동전 전용이 반복 확인됨. 자다르 짧은 일정에서는 도착 직후 또는 출발 직전 단체 이용이 효율적.',priority:1},
 {id:'zadar-riva',dates:['2026-10-16'],city:'자다르',name:'Riva 공중화장실',near:'자다르 해안 산책로 · Sea Organ 방향 대안',fee:'요금 현장 확인',feeType:'unknown',hours:'10월 운영 현장 확인',pay:'자동결제 시설 운영 이력',source:'Čistoća Zadar 공중WC 시설자료',sourceUrl:'https://www.cistoca-zadar.hr/',query:'Public toilet Riva Zadar Croatia',note:'Čistoća Zadar의 공중WC 운영시설로 확인되는 Riva 권역 대안. 현재 정확한 요금은 현장 자동결제 표시를 확인하세요.',priority:4},
 {id:'plitvice-e1',dates:['2026-10-16'],city:'플리트비체',name:'Entrance 1 화장실',near:'입구 1 · Lower Lakes/Veliki Slap 시작부',fee:'입장객 무료 안내',feeType:'free',hours:'입구 운영시간 내',pay:'추가 요금 없음으로 안내',source:'2026 현지가이드 + 공식 입구정보',sourceUrl:'https://travelplitvice.com/blog/plitvice-entrance-1-vs-entrance-2-guide/',officialUrl:'https://np-plitvicka-jezera.hr/en/home-page-v2-0/',query:'Plitvice Lakes Entrance 1 restroom Croatia',note:'플리트비체 3시간 보행 전 반드시 이용 권장. 최종 입장권에 지정된 입구를 확인하세요.',priority:2},
 {id:'plitvice-e2',dates:['2026-10-16'],city:'플리트비체',name:'Entrance 2 화장실',near:'입구 2 · Upper Lakes/Hotel Jezero 권역',fee:'입장객용 · 추가요금 없음 안내',feeType:'free',hours:'입구 운영시간 내',pay:'추가 요금 없음으로 안내',source:'2026 방문가이드 + 공식 입구정보',sourceUrl:'https://www.travelplitvice.com/guide/complete-plitvice-lakes-travel-guide/',officialUrl:'https://np-plitvicka-jezera.hr/en/home-page-v2-0/',query:'Plitvice Lakes Entrance 2 restroom Croatia',note:'버스가 Entrance 2를 사용할 경우 출발 전 이용. 입장권 지정입구와 실제 버스 하차지 확인이 우선.',priority:3},
 {id:'plitvice-boat',dates:['2026-10-16'],city:'플리트비체',name:'Kozjak 선착장 주변 화장실',near:'보트 랜딩 권역 · 공원 내부 중간 휴식',fee:'입장권 범위 내 시설 안내',feeType:'free',hours:'공원 운영시간 내',pay:'추가요금 표기 없음',source:'2026 Plitvice 방문가이드',sourceUrl:'https://www.travelplitvice.com/guide/complete-plitvice-lakes-travel-guide/',query:'P3 Kozjak Plitvice toilet Croatia',note:'2026 가이드는 주 입구와 보트 랜딩에도 화장실이 있다고 안내합니다. 정확한 개방 위치는 당일 공식 앱 지도를 확인하세요.',priority:5},
 {id:'rastoke-info',dates:['2026-10-17'],city:'라스토케',name:'Rastoke Tourist Info 공중화장실',near:'라스토케 관광안내소 · 공식 2026 관광지도 표기',fee:'요금 현장 확인',feeType:'unknown',hours:'관광안내소 운영시간 확인',pay:'현장표지 확인',source:'Slunj-Rastoke 공식 2026 지도',sourceUrl:'https://slunj-rastoke.hr/wp-content/uploads/2026/02/slunj-karta-a5_2026_comp.pdf',query:'Rastoke Tourist Information public toilet Croatia',note:'08:45~09:45 짧은 산책 일정이므로 버스 하차 직후 필요한 인원부터 이용하는 편이 안전합니다.',priority:1},
 {id:'zagreb-cesarceva',dates:['2026-10-17'],city:'자그레브',name:'Cesarčeva 공중화장실',near:'Ban Jelačić 광장 · European Square',fee:'무료',feeType:'free',hours:'24시간',pay:'무료',source:'InfoZagreb + LoveZagreb',sourceUrl:'https://www.infozagreb.hr/en/travel-plan/tourist-information/useful-information/list-of-public-toilets',extraUrl:'https://www.lovezagreb.hr/en/topics/neighbors-guide/when-nature-calls-you-gotta-go-when-you-gotta-go',query:'Cesarceva public toilet Zagreb Croatia',note:'자그레브 중심에서 가장 실용적인 기준점. 관광청 목록은 24시간, LoveZagreb는 무료라고 안내합니다.',priority:2},
 {id:'zagreb-kaptol',dates:['2026-10-17'],city:'자그레브',name:'Kaptol 공중화장실',near:'자그레브 대성당 · Kaptol',fee:'요금 공식 표기 없음',feeType:'unknown',hours:'06:00~22:00',pay:'현장 확인',source:'InfoZagreb 공식 목록',sourceUrl:'https://www.infozagreb.hr/en/travel-plan/tourist-information/useful-information/list-of-public-toilets',query:'Kaptol public toilet Zagreb Croatia',note:'대성당 관람 전후 사용하기 좋은 공식 공중화장실.',priority:3},
 {id:'zagreb-upper',dates:['2026-10-17'],city:'자그레브',name:'Habdelićeva · Upper Town 공중화장실',near:'Stone Gate · St Mark · 상부도시',fee:'요금 공식 표기 없음',feeType:'unknown',hours:'08:00~21:00',pay:'현장 확인',source:'InfoZagreb 공식 목록',sourceUrl:'https://www.infozagreb.hr/en/travel-plan/tourist-information/useful-information/list-of-public-toilets',query:'Habdeliceva public toilet Zagreb Croatia',note:'Stone Gate와 성 마르코 성당 동선에서 이탈을 줄이는 상부도시 대안.',priority:4}
];

const TRAVEL_APPS=[
 {id:'gmaps',cat:'필수',icon:'🗺️',name:'Google Maps',level:'전원 필수',why:'도보·차량 길찾기, 관광지·화장실 검색, 자유시간 복귀에 가장 자주 쓰게 됩니다.',use:'출국 전 크로아티아와 로마 지역을 오프라인 지도로 저장해 두면 통신이 불안정할 때도 기본 길찾기에 도움이 됩니다.',url:'https://maps.google.com/',label:'Google Maps 열기'},
 {id:'gtrans',cat:'필수',icon:'🌐',name:'Google Translate',level:'전원 권장',why:'크로아티아어·이탈리아어 메뉴, 표지판, 약국·상점 대화에 유용합니다.',use:'출국 전 크로아티아어와 이탈리아어 오프라인 언어팩을 내려받고 카메라 번역 사용법만 익혀두세요.',url:'https://translate.google.com/',label:'Google Translate'},
 {id:'hak',cat:'필수',icon:'🚐',name:'HAK / Croatia Traffic Info',level:'운영진 강력 권장',why:'크로아티아 자동차클럽 공식 교통정보로 도로상태·공사·국경·교통흐름을 확인할 수 있습니다.',use:'10/14 두브로브니크→두체, 10/15 스플리트→비오그라드, 10/16 플리트비체, 10/17 자그레브 이동 전 차량 지연 확인용.',url:'https://www.hak.hr/en',label:'HAK 공식',source:'공식 HAK'},
 {id:'plitvice',cat:'현지특화',icon:'🌲',name:'Plitvice Lakes National Park',level:'10/16 설치 권장',why:'국립공원 공식 앱. 관람코스·주요 지점·주차 위치 저장·식음시설 등 현장정보를 제공합니다.',use:'10/16 입장 전 설치. 3시간 코스에서 현재 위치와 공식 관람루트를 확인하는 보조수단으로 사용하세요.',url:'https://np-plitvicka-jezera.hr/en/applications/',label:'공식 앱 안내',source:'국립공원 공식',caution:'2026.09.15 현재 공식 홈페이지에 임시 폐쇄 경보가 있으므로 앱과 홈페이지에서 운영상태도 함께 확인하세요.'},
 {id:'libertas',cat:'현지특화',icon:'🚌',name:'Libertas Dubrovnik',level:'두브로브니크 자유시간 선택',why:'두브로브니크 시내버스의 노선·정류장·도착시간을 실시간으로 확인할 수 있는 공식 앱입니다.',use:'Grand Hotel Park(Lapad) ↔ Old Town을 자유시간에 개별 이동할 때 유용합니다. 전용버스 일정만 따라갈 경우 필수는 아닙니다.',url:'https://www.libertasdubrovnik.hr/',label:'Libertas 공식',source:'Libertas 공식'},
 {id:'promet',cat:'현지특화',icon:'🚌',name:'Promet Split',level:'스플리트 자유시간 선택',why:'여정계획·실시간 버스 위치·시간표·승차권 기능이 있는 Split 교통 앱입니다.',use:'10/15는 단체 전용버스라 필수 설치는 아닙니다. 자유시간 대중교통 확인용으로만 추천합니다.',url:'https://play.google.com/store/apps/details?id=hr.prometsplit.mobile',label:'Google Play',source:'PROMET d.o.o.',caution:'Google Play 2026 현재 평점이 낮은 편(2.1/5)이므로 결제 기능만 믿기보다 현장 결제 대안을 유지하세요.'},
 {id:'mojzet',cat:'현지특화',icon:'🚋',name:'Moj ZET',level:'자그레브 자유시간 선택',why:'자그레브 공식 ZET 앱으로 트램·버스·푸니쿨라 티켓 구매와 환승 등록을 지원합니다.',use:'10/17 자유시간에 대중교통을 개별 이용할 사람에게 유용합니다. 도보 중심 일정이면 설치하지 않아도 됩니다.',url:'https://www.zet.hr/tickets-and-fares/moj-zet-app/8111',label:'ZET 공식',source:'ZET 공식'},
 {id:'smartzadar',cat:'선택',icon:'📍',name:'Zadar Smart City',level:'자다르 선택',why:'자다르 관광청이 안내하는 앱으로 버스 실시간 도착·라이브 위치·주차 등 도시정보를 제공합니다.',use:'10/16 자다르 체류가 짧아 필수는 아닙니다. 개별 자유일정이 생길 때만 설치하면 충분합니다.',url:'https://zadar.travel/useful-information/getting-around/trasporto-pubblico',label:'Zadar 관광청',source:'Zadar Tourist Board'}
];

let toiletDateFilter='all';
let appCatFilter='전체';
function mapUrl(q){return MAPS_SEARCH+encodeURIComponent(q)}
function esc(x){return String(x??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function feeTextClass(t){return t==='free'?'free':t==='paid'?'paid':'unknown'}
function chooseInitialToiletDate(){
  const d=(typeof croDate==='function'?croDate():new Date().toISOString().slice(0,10));
  if(d>='2026-10-13'&&d<='2026-10-17')return d;
  return 'all';
}
function renderToiletTabs(){
 const el=document.getElementById('toiletDateTabs');if(!el)return;
 const vals=[['all','전체'],['2026-10-13','10/13 두브로브니크'],['2026-10-14','10/14 두브로브니크'],['2026-10-15','10/15 스플리트·트로기르'],['2026-10-16','10/16 자다르·플리트비체'],['2026-10-17','10/17 라스토케·자그레브']];
 el.innerHTML=vals.map(([v,l])=>`<button type="button" class="toilet-filter ${toiletDateFilter===v?'active':''}" data-toilet-filter="${v}">${l}</button>`).join('');
}
function renderToilets(){
 const grid=document.getElementById('toiletGrid'); if(!grid)return;
 renderToiletTabs();
 let list=TOILET_DATA.filter(t=>toiletDateFilter==='all'||t.dates.includes(toiletDateFilter)).sort((a,b)=>(a.priority||99)-(b.priority||99)||a.city.localeCompare(b.city));
 const sum=document.getElementById('toiletSummary');
 if(sum){const cities=[...new Set(list.map(x=>x.city))]; const paid=list.filter(x=>x.feeType==='paid').length,free=list.filter(x=>x.feeType==='free').length;sum.innerHTML=`<span>📍 ${cities.join(' · ')}</span><span>🚻 ${list.length}곳</span><span>🟢 무료 ${free}</span><span>🟠 유료 ${paid}</span><span>⚪ 요금확인 ${list.length-free-paid}</span>`;}
 grid.innerHTML=list.map(t=>`<article class="toilet-card">
  <div class="toilet-card-head"><div class="toilet-ico">🚻</div><div><h3>${esc(t.name)}</h3><div class="toilet-near">📍 ${esc(t.near)}</div></div></div>
  <div class="toilet-badges"><span class="fee-badge ${feeTextClass(t.feeType)}">${t.feeType==='free'?'무료':t.feeType==='paid'?'유료':'요금 확인'} · ${esc(t.fee)}</span><span class="source-badge">${esc(t.source)}</span></div>
  <div class="toilet-facts"><div class="toilet-fact"><small>금액</small><b>${esc(t.fee)}</b></div><div class="toilet-fact"><small>운영시간</small><b>${esc(t.hours)}</b></div><div class="toilet-fact"><small>결제</small><b>${esc(t.pay)}</b></div><div class="toilet-fact"><small>일정</small><b>${t.dates.map(d=>d.slice(5).replace('-','/')).join(' · ')}</b></div></div>
  <div class="toilet-note">${esc(t.note)}</div>
  <div class="toilet-actions"><a class="toilet-map" href="${mapUrl(t.query)}" target="_blank" rel="noopener noreferrer">📍 Google 지도</a><a class="toilet-city-map" href="${mapUrl('public toilet '+t.city+' Croatia')}" target="_blank" rel="noopener noreferrer">주변 WC 검색</a><a class="toilet-source" href="${esc(t.sourceUrl)}" target="_blank" rel="noopener noreferrer">근거 ↗</a>${t.officialUrl?`<a class="toilet-source" href="${esc(t.officialUrl)}" target="_blank" rel="noopener noreferrer">공식 ↗</a>`:''}${t.extraUrl?`<a class="toilet-source" href="${esc(t.extraUrl)}" target="_blank" rel="noopener noreferrer">무료 근거 ↗</a>`:''}</div>
 </article>`).join('');
}
function openToiletsForDate(date){toiletDateFilter=date||'all';renderToilets();if(window.AppRouter)AppRouter.go('toilets');else location.hash='#toilets';}
function compactToilets(date){return TOILET_DATA.filter(t=>t.dates.includes(date)).sort((a,b)=>(a.priority||99)-(b.priority||99)).slice(0,4)}
function decorateScheduleToilets(){
 const panels=[...document.querySelectorAll('#dayPanels .panel')];
 panels.forEach((panel,i)=>{
  if(panel.querySelector('.day-toilet-card'))return;
  const d=window.days?.[i] || (typeof days!=='undefined'?days[i]:null); if(!d)return;
  const list=compactToilets(d.date); if(!list.length)return;
  const box=document.createElement('div');box.className='day-toilet-card';
  box.innerHTML=`<div class="day-toilet-title"><b>🚻 이 날짜 화장실 계획</b><button type="button" class="day-toilet-all" data-open-toilets="${d.date}">전체 보기</button></div>`+list.map(t=>`<div class="day-toilet-row"><div><strong>${esc(t.city)} · ${esc(t.name)}</strong><small>${esc(t.near)}</small></div><span class="day-toilet-price">${esc(t.fee)}</span><a class="day-toilet-map" target="_blank" rel="noopener noreferrer" href="${mapUrl(t.query)}">지도</a></div>`).join('');
  const weather=panel.querySelector('.day-weather-box'); if(weather) weather.insertAdjacentElement('afterend',box); else panel.prepend(box);
 });
}
function renderAppTabs(){const el=document.getElementById('appRecoTabs');if(!el)return;const cats=['전체','필수','현지특화','선택'];el.innerHTML=cats.map(c=>`<button type="button" class="app-reco-tab ${appCatFilter===c?'active':''}" data-appcat="${c}">${c}</button>`).join('')}
function renderApps(){const grid=document.getElementById('travelAppGrid');if(!grid)return;renderAppTabs();const list=TRAVEL_APPS.filter(a=>appCatFilter==='전체'||a.cat===appCatFilter);grid.innerHTML=list.map(a=>`<article class="travel-app-card"><div class="travel-app-head"><div class="travel-app-icon">${a.icon}</div><div><h3>${esc(a.name)}</h3><div class="app-rec-level">${esc(a.level)} · ${esc(a.cat)}</div></div></div><p>${esc(a.why)}</p><div class="app-use"><b>이번 일정에서</b><br>${esc(a.use)}</div>${a.caution?`<div class="app-caution">⚠ ${esc(a.caution)}</div>`:''}<div class="travel-app-actions"><a class="app-official" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.label)} ↗</a>${a.source?`<span class="source-badge">${esc(a.source)}</span>`:''}</div></article>`).join('')}

document.addEventListener('click',e=>{
 const tf=e.target.closest('[data-toilet-filter]'); if(tf){toiletDateFilter=tf.dataset.toiletFilter;renderToilets();return;}
 const ot=e.target.closest('[data-open-toilets]'); if(ot){openToiletsForDate(ot.dataset.openToilets);return;}
 const ac=e.target.closest('[data-appcat]'); if(ac){appCatFilter=ac.dataset.appcat;renderApps();return;}
});
window.openToiletsForDate=openToiletsForDate;
window.TOILET_DATA=TOILET_DATA;
window.TRAVEL_APPS=TRAVEL_APPS;
document.addEventListener('DOMContentLoaded',()=>{
 toiletDateFilter=chooseInitialToiletDate();
 renderToilets();renderApps();decorateScheduleToilets();
 // Re-decorate if schedule was rebuilt by another module later.
 setTimeout(decorateScheduleToilets,250);
});
})();
