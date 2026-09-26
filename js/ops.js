
(function(){
  const OFFICIAL_DAY_SUMMARY={
    '2026-10-12':'09:35 인천 T1 B카운터 집결 → 티웨이항공 TW405 12:35 출발 → 로마 19:15 도착 → 라이언에어 FR5975 23:30 두브로브니크 이동.',
    '2026-10-13':'00:50 두브로브니크 도착 → 02:30 호텔 휴식 → 09:00 1일 패스 관광 → 18:00 석식.',
    '2026-10-14':'두브로브니크 자유탐방 후 전용차량으로 두체 이동 · 두체 숙박.',
    '2026-10-15':'두체 → 스플리트 → 트로기르 → 비오그라드. 도시 간 이동은 전용차량 중심.',
    '2026-10-16':'비오그라드 → 자다르 → 플리트비체 국립공원 → 카를로바크.',
    '2026-10-17':'카를로바크 → 라스토케 → 자그레브 → 라이언에어 FR8836 22:10 출발 → 로마 23:35 도착 → Ergife Palace.',
    '2026-10-18':'PLAN 1~4 선택 문화시찰 → 16:30 로마공항 이동 → 티웨이항공 TW406 21:15 귀국.',
    '2026-10-19':'16:10 티웨이항공 TW406 인천 도착 → 수하물·공용물품 확인 후 귀가.'
  };
  // Major next-step timeline. Exact booklet times are marked exact; untimed visits use clearly-labeled operating estimates.
  const LIVE_AGENDA={
    '2026-10-12':[
      ['2026-10-12T09:35:00+09:00','인천공항 T1 B카운터 집결',false],
      ['2026-10-12T12:35:00+09:00','티웨이항공 TW405 인천 출발',false],
      ['2026-10-12T19:15:00+02:00','로마 FCO 도착',false],
      ['2026-10-12T23:30:00+02:00','라이언에어 FR5975 로마 출발',false]
    ],
    '2026-10-13':[
      ['2026-10-13T00:50:00+02:00','두브로브니크 공항 도착',false],
      ['2026-10-13T02:30:00+02:00','Grand Hotel Park 도착·휴식',false],
      ['2026-10-13T07:00:00+02:00','호텔 조식',false],
      ['2026-10-13T09:00:00+02:00','두브로브니크 1일 패스 관광 시작',false],
      ['2026-10-13T12:30:00+02:00','중식',true],
      ['2026-10-13T14:00:00+02:00','성벽·스르지산·유람선 일정',true],
      ['2026-10-13T18:00:00+02:00','석식',false]
    ],
    '2026-10-14':[
      ['2026-10-14T07:00:00+02:00','호텔 조식',false],
      ['2026-10-14T09:00:00+02:00','두브로브니크 자유탐방',true],
      ['2026-10-14T12:30:00+02:00','자유식',true],
      ['2026-10-14T15:00:00+02:00','두체 방향 호텔 이동',false],
      ['2026-10-14T18:00:00+02:00','석식',false]
    ],
    '2026-10-15':[
      ['2026-10-15T07:00:00+02:00','호텔 조식',false],
      ['2026-10-15T07:45:00+02:00','스플리트 이동',true],
      ['2026-10-15T08:15:00+02:00','스플리트 핵심관광',true],
      ['2026-10-15T11:30:00+02:00','트로기르 이동',true],
      ['2026-10-15T12:10:00+02:00','트로기르 구시가지 관광',true],
      ['2026-10-15T14:00:00+02:00','비오그라드 나 모루 이동',true],
      ['2026-10-15T18:00:00+02:00','석식',false]
    ],
    '2026-10-16':[
      ['2026-10-16T07:00:00+02:00','호텔 조식',false],
      ['2026-10-16T07:30:00+02:00','자다르 이동',true],
      ['2026-10-16T08:10:00+02:00','자다르 관광',true],
      ['2026-10-16T09:30:00+02:00','플리트비체 이동',true],
      ['2026-10-16T12:00:00+02:00','중식',true],
      ['2026-10-16T12:45:00+02:00','플리트비체 국립공원 관람',true],
      ['2026-10-16T16:00:00+02:00','카를로바크 이동',true],
      ['2026-10-16T18:00:00+02:00','석식',false]
    ],
    '2026-10-17':[
      ['2026-10-17T07:00:00+02:00','호텔 조식',false],
      ['2026-10-17T08:00:00+02:00','라스토케 이동',true],
      ['2026-10-17T08:45:00+02:00','라스토케 관광',true],
      ['2026-10-17T10:00:00+02:00','자그레브 이동',true],
      ['2026-10-17T11:30:00+02:00','자그레브 관광·자유시간',true],
      ['2026-10-17T19:30:00+02:00','자그레브 공항 이동·수속',true],
      ['2026-10-17T22:10:00+02:00','라이언에어 FR8836 자그레브 출발',false],
      ['2026-10-17T23:35:00+02:00','로마 FCO 도착',false]
    ],
    '2026-10-18':[
      ['2026-10-18T07:00:00+02:00','호텔 조식',false],
      ['2026-10-18T08:30:00+02:00','선택 문화시찰 시작',true],
      ['2026-10-18T12:30:00+02:00','자유식',true],
      ['2026-10-18T16:30:00+02:00','로마 FCO 이동',false],
      ['2026-10-18T21:15:00+02:00','티웨이항공 TW406 로마 출발',false]
    ],
    '2026-10-19':[
      ['2026-10-19T16:10:00+09:00','인천국제공항 도착',false]
    ]
  };
  const WEATHER_ACTION={
    '2026-10-12':'장거리 비행과 야간 환승일입니다. 기내·공항 냉방에 대비해 얇은 겉옷을 손가방에 두고, 도착 후 사용할 세면·충전물품은 쉽게 꺼낼 수 있게 준비하세요.',
    '2026-10-13':'두브로브니크 성벽과 스르지산은 바람과 햇빛 노출이 큽니다. 바람막이·모자·선글라스·물, 계단에 편한 신발을 권장합니다.',
    '2026-10-14':'해안 자유탐방 후 장거리 차량 이동일입니다. 오전에는 가벼운 겉옷, 차량 안에서는 체온조절용 얇은 옷을 준비하세요.',
    '2026-10-15':'스플리트·트로기르는 석재 골목과 계단이 많습니다. 미끄럼이 적고 오래 걸어도 편한 신발, 해안 바람 대비 얇은 방풍복이 좋습니다.',
    '2026-10-16':'플리트비체는 해안보다 훨씬 쌀쌀하고 데크가 젖으면 미끄럽습니다. 경량패딩/보온 겉옷 + 방풍복 + 작은 우산/우비 + 접지 좋은 신발을 우선하세요.',
    '2026-10-17':'라스토케·자그레브는 아침 기온이 낮을 수 있고 야간 항공 이동이 있습니다. 겹쳐입기와 보조배터리·여권·탑승권 점검이 중요합니다.',
    '2026-10-18':'로마 시내는 장시간 도보가 예상됩니다. 얇은 겉옷과 물을 준비하고, 공항 이동 전 16시 전후 집결시간을 최우선으로 확인하세요.',
    '2026-10-19':'도착일입니다. 수하물·공용물품·개인 여권/지갑/휴대전화 누락 여부를 마지막으로 확인하세요.'
  };

  const TRIP_WEATHER_ACTION=window.GSPA_TRIP_ID==='turkiye1'?{"2026-10-19":"야간 장거리 비행일입니다. 여권·탑승권·보조배터리와 기내에서 사용할 얇은 겉옷을 손가방에 준비하세요.","2026-10-20":"두바이 환승 뒤 이스탄불에 도착합니다. 기내·공항 냉방과 보스포러스 바람에 대비해 겹쳐 입을 옷을 준비하세요.","2026-10-21":"안탈리아는 비교적 온화하지만 구시가지 석재길을 오래 걷습니다. 편한 신발과 햇빛 대비 용품이 좋습니다.","2026-10-22":"파묵칼레는 아침저녁 기온차가 큽니다. 바람막이·가벼운 외투와 석회붕 관람에 편한 신발을 준비하세요.","2026-10-23":"에페소 야외유적은 걷는 시간이 길고 그늘이 적습니다. 물·모자·편한 신발을 준비하고 열기구 선택자는 새벽 보온에 유의하세요.","2026-10-24":"부르사는 아침저녁이 쌀쌀할 수 있습니다. 모스크 방문에 적절한 복장과 가벼운 외투를 준비하세요.","2026-10-25":"이스탄불 핵심관광은 도보 이동이 많고 모스크 내부 관람이 포함됩니다. 편한 신발과 단정한 복장을 준비하세요.","2026-10-26":"필드트레이닝 후 공항 이동일입니다. 쇼핑품·여권·수하물 무게를 미리 확인하고 16시 공항 이동을 우선하세요.","2026-10-27":"귀국일입니다. 두바이 환승 후 인천 도착까지 여권·휴대전화·공용물품 누락 여부를 확인하세요."}:WEATHER_ACTION;


  function nowCroParts(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:(window.GSPA_TRIP_TIMEZONE||'Europe/Zagreb'),hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const get=t=>+(parts.find(p=>p.type===t)?.value||0); return {h:get('hour'),m:get('minute')};
  }
  function operationalDay(){
    const d=localDate(),first=days[0],last=days[days.length-1]; if(!first)return null; if(d<first.date)return first;if(d>last.date)return last;return days.find(x=>x.date===d)||first;
  }
  function shortDateLabel(date){
    const dt=new Date(date+'T12:00:00Z');
    const wd=['일','월','화','수','목','금','토'][dt.getUTCDay()];
    return `${date.slice(5).replace('-','/')}(${wd})`;
  }
  function countdownText(ms,approx=false){
    if(ms<=0)return'곧 시작';
    const mins=Math.ceil(ms/60000),prefix=approx?'약 ':'';
    if(mins>=1440){const d=Math.floor(mins/1440),h=Math.floor((mins%1440)/60);return `${prefix}${d}일${h?` ${h}시간`:''} 후`;}
    if(mins>=60)return `${prefix}${Math.floor(mins/60)}시간 ${mins%60}분 후`;
    return `${prefix}${mins}분 후`;
  }
  function nextEventFor(d){
    const now=Date.now(),all=[];
    for(const day of days){(day.events||[]).forEach((ev,i)=>{const iso=day.eventInstants?.[i],t=iso?Date.parse(iso):NaN;if(Number.isFinite(t))all.push({date:day.date,iso,label:ev[1],t,timeLabel:String(ev[0]||'')});});}
    all.sort((a,b)=>a.t-b.t);const e=all.find(x=>x.t>=now);
    if(e){const zone=e.iso.includes('+09:00')?'Asia/Seoul':e.iso.includes('+04:00')?'Asia/Dubai':(window.GSPA_TRIP_TIMEZONE||'Europe/Zagreb');const time=(e.timeLabel.match(/\d{1,2}:\d{2}/)||[])[0]||new Intl.DateTimeFormat('ko-KR',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(e.t));const dayPrefix=e.date!==d.date?shortDateLabel(e.date)+' · ':'';return {time,label:dayPrefix+e.label,count:countdownText(e.t-now,false),approx:false};}
    const first=all[0],last=all[all.length-1];if(first&&now<first.t)return {time:(first.timeLabel.match(/\d{1,2}:\d{2}/)||['--:--'])[0],label:shortDateLabel(first.date)+' · '+first.label,count:countdownText(first.t-now,false),approx:false};if(last&&now>last.t)return {time:'완료',label:'전체 공식 일정이 종료되었습니다.',count:'수하물·공용물품을 확인하세요',approx:false};return {time:'--:--',label:'다음 일정을 확인 중입니다.',count:'',approx:false};
  }
  function paintTodayStay(d){
    const strip=document.getElementById('todayStayStrip'),name=document.getElementById('todayStayName'); if(!strip||!name)return;
    const h=window.CRO_HOTEL_BY_DATE?.[d.date];
    if(!h){strip.hidden=true;return;}
    name.textContent=h.name; strip.hidden=false;
  }
  function opsRenderToday(){
    const d=operationalDay(),pre=localDate()<days[0].date,post=localDate()>days[days.length-1].date;
    const mode=document.getElementById('todayMode'); if(mode)mode.textContent=pre?'출발 준비':post?'여행 종료':'오늘 여행';
    document.getElementById('todayDate').textContent=(pre?'다가오는 일정 · ':post?'연수 종료 · ':'')+shortDateLabel(d.date)+' · '+(days.indexOf(d)+1)+'일차';
    document.getElementById('todayTitle').textContent=d.title;
    document.getElementById('todayRoute').textContent=d.route;
    const flow=document.getElementById('todayFlow'); if(flow)flow.innerHTML=(d.flow||[]).map((x,i)=>`${i?'<i>›</i>':''}<span>${x}</span>`).join('');
    const nx=nextEventFor(d); document.getElementById('todayNextTime').textContent=nx.time; document.getElementById('todayNextLabel').textContent=nx.label; document.getElementById('todayCountdown').innerHTML=`${nx.count}${nx.approx?' <span class="ops-next-live">예상</span>':''}`; paintTodayStay(d);
    const w=WEATHER_SPOTS[d.date]; const ws=document.getElementById('todayWeatherState'); if(ws)ws.textContent=document.getElementById('liveWeatherMain')?.textContent||(w?`${w.name} ${w.hi}/${w.lo}° 참고`:'도착일');
    const as=document.getElementById('todayAttendanceState'); if(as){const cnt=Object.values(attChecks||{}).filter(x=>x&&x.checked).length; as.textContent=attCurrent?`${cnt}/${APP_USERS.length} · ${attCurrent.title||attCurrent.type}`:'진행 없음';}
    const ls=document.getElementById('todayLocationState'); if(ls){const sharing=localStorage.getItem('loc_sharing')==='1'; ls.textContent=sharing?(locLastWrite?`${ago(locLastWrite)} 전송`:'공유 ON'):'공유 OFF';}
    const mealBrief=String(d.meal||'항공·도착 일정에 맞춰 운영').split(/[.!?]/)[0]; const weatherBrief=String(TRIP_WEATHER_ACTION[d.date]||'').split(/[.!?]/)[0]; document.getElementById('todayOpsNote').innerHTML=`<b>식사</b> ${mealBrief}<br><b>오늘 준비</b> ${weatherBrief}`;
    if(window.LocationSession)LocationSession.paint();
    document.getElementById('todayBtns').innerHTML=`<a class="btn" href="#schedule">◷ 상세 일정</a><a class="btn" href="#check">✓ 여행 준비</a>`;
  }

  function enhanceSchedulePanels(){
    document.querySelectorAll('#dayPanels .panel').forEach((p,i)=>{
      const d=days[i];
      const wbox=p.querySelector('.day-weather-box');
      if(wbox&&!p.querySelector('.weather-action-advice')){
        const a=document.createElement('div');a.className='weather-action-advice';a.innerHTML=`<b>오늘 준비</b><br>${TRIP_WEATHER_ACTION[d.date]||''}`;wbox.insertAdjacentElement('afterend',a);
      }
    });
  }

  function setOnlineState(){const e=document.getElementById('onlineStatusChip');if(!e)return;const on=navigator.onLine;e.textContent=on?'🟢 온라인':'🟠 오프라인 · 저장 일정 이용';e.classList.toggle('online',on);e.classList.toggle('offline',!on);}

  function setupMemo(){const m=document.getElementById('fieldMemo');if(!m)return;m.value=localStorage.getItem((window.GSPA_TRIP_STORAGE_PREFIX||'cro')+'_field_memo')||'';m.addEventListener('input',()=>localStorage.setItem((window.GSPA_TRIP_STORAGE_PREFIX||'cro')+'_field_memo',m.value));}
  function reorderSections(){const main=document.querySelector('main'); if(!main)return;['today','schedule','location','attendance','guide','study','weatherDetail','route','hotels','team','check','videos','emergency','more'].forEach(id=>{const s=document.getElementById(id);if(s&&s.parentElement===main)main.appendChild(s)});}
  function adminVisibility(){document.querySelectorAll('.tech-only').forEach(x=>x.style.display=(currentUser?.name===(window.GSPA_TRIP?.attendanceOperator||'한상호')?'block':'none'));}

  function haversine(a,b,c,d){const R=6371000,rad=x=>x*Math.PI/180,dp=rad(c-a),dl=rad(d-b),q=Math.sin(dp/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(q));}
  function opsRenderMeetingDistance(){
    const box=document.getElementById('meetingDistanceCard'); if(!box)return;box.hidden=true;return;
    if(!attCurrent?.meetingLat||!attCurrent?.meetingLng){box.hidden=true;return;}
    const rows=APP_USERS.map(u=>{const r=locCache[u.slot];if(!r)return null;return {u,r,dist:haversine(attCurrent.meetingLat,attCurrent.meetingLng,r.lat,r.lng)}}).filter(Boolean).sort((a,b)=>b.dist-a.dist);
    const not=APP_USERS.length-rows.length;
    box.hidden=false; box.innerHTML=`<h3>📍 현재 집결지 거리</h3><div class="small muted">${esc(attCurrent.title||'집결')} · 위치공유 기준 · 먼 사람부터 표시${not?` · 위치 미공유 ${not}명`:''}</div><div class="distance-grid">${rows.slice(0,12).map(x=>{const cls=x.dist>500?'far':x.dist>150?'mid':'near',v=x.dist>=1000?(x.dist/1000).toFixed(1)+'km':Math.round(x.dist)+'m';return `<div class="distance-person"><b>${esc(x.u.name)} · ${x.u.group===0?'교수님':x.u.group+'조'}</b><span class="${cls}">${v}</span></div>`}).join('')}</div><div class="btns"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${attCurrent.meetingLat},${attCurrent.meetingLng}">집결지 Google 지도</a></div>`;
  }

  // MIX02 attendance owns its UI and network state; dashboard stays subscribed.
  window.addEventListener('cro-att-change',()=>{opsRenderToday();opsRenderMeetingDistance();});

  // Wrap existing location rendering so dashboard and meeting-distance stay current.
  const _renderRoster=window.renderRoster;
  if(typeof _renderRoster==='function') window.renderRoster=function(){const r=_renderRoster.apply(this,arguments);opsRenderToday();opsRenderMeetingDistance();return r;};
  const _appLogin=window.appLogin;
  if(typeof _appLogin==='function') window.appLogin=async function(){const r=await _appLogin.apply(this,arguments);setTimeout(()=>{adminVisibility();opsRenderToday();},100);return r;};
  const _appLogout=window.appLogout;
  if(typeof _appLogout==='function') window.appLogout=function(){const r=_appLogout.apply(this,arguments);adminVisibility();opsRenderToday();return r;};

  document.addEventListener('DOMContentLoaded',()=>{
    reorderSections(); enhanceSchedulePanels(); setupMemo(); setOnlineState(); adminVisibility(); opsRenderToday(); opsRenderMeetingDistance();
    window.addEventListener('online',setOnlineState);window.addEventListener('offline',setOnlineState);
    setInterval(opsRenderToday,30000);
  });
})();
