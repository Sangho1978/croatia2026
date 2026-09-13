
(function(){
  const OFFICIAL_DAY_SUMMARY={
    '2026-10-12':'인천 출발 → 로마 도착 → 같은 날 야간 Ryanair로 두브로브니크 이동. 야간편의 정확한 시각은 최종 E-ticket을 우선합니다.',
    '2026-10-13':'두브로브니크 체류 · 구시가지와 주요 문화유산 중심 관광.',
    '2026-10-14':'두브로브니크 자유탐방 후 전용차량으로 두체 이동 · 두체 숙박.',
    '2026-10-15':'두체 → 스플리트 → 트로기르 → 비오그라드. 도시 간 이동은 전용차량 중심.',
    '2026-10-16':'비오그라드 → 자다르 → 플리트비체 국립공원 → 카를로바츠.',
    '2026-10-17':'카를로바츠 → 라스토케 → 자그레브 → 공항 → FR8836 로마 이동.',
    '2026-10-18':'로마 또는 근교 선택 문화시찰 → 로마 FCO → TW406 귀국.',
    '2026-10-19':'TW406 인천 도착 → 수하물·공용물품 확인 후 귀가.'
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
  let attOnlyMissing=false;

  function nowCroParts(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zagreb',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    const get=t=>+(parts.find(p=>p.type===t)?.value||0); return {h:get('hour'),m:get('minute')};
  }
  function operationalDay(){
    const d=localDate(); if(d<'2026-10-12') return days[0]; if(d>'2026-10-19') return days[days.length-1]; return days.find(x=>x.date===d)||days[0];
  }
  function nextEventFor(d){
    const today=localDate();
    if(today<d.date) return {time:d.events?.[0]?.[0]||'',label:d.events?.[0]?.[1]||d.title,count:`여행 시작 D-${Math.max(0,daysDiff(d.date,today))}`};
    if(today>d.date) return {time:'완료',label:'해당 날짜 일정이 종료되었습니다.',count:''};
    const nm=nowCroParts(),cur=nm.h*60+nm.m;
    for(const e of d.events||[]){ const m=String(e[0]).match(/(\d{1,2}):(\d{2})/); if(!m) continue; const em=+m[1]*60 + +m[2]; if(em>=cur){const diff=em-cur;return {time:m[1].padStart(2,'0')+':'+m[2],label:e[1],count:diff<60?`${diff}분 후`: `${Math.floor(diff/60)}시간 ${diff%60}분 후`};} }
    return {time:'오늘',label:'예정된 주요 일정은 마무리 단계입니다.',count:'호텔·개인물품을 확인하세요'};
  }
  function opsRenderToday(){
    const d=operationalDay(),pre=localDate()<'2026-10-12',post=localDate()>'2026-10-19';
    const mode=document.getElementById('todayMode'); if(mode)mode.textContent=pre?'DEPARTURE PREP':post?'TRIP COMPLETE':'TODAY OPERATIONS';
    document.getElementById('todayDate').textContent=(pre?'다가오는 일정 · ':post?'연수 종료 · ':'현지 ')+d.date;
    document.getElementById('todayTitle').textContent=d.title;
    document.getElementById('todayRoute').textContent=d.route;
    const flow=document.getElementById('todayFlow'); if(flow)flow.innerHTML=(d.flow||[]).map((x,i)=>`${i?'<i>›</i>':''}<span>${x}</span>`).join('');
    const nx=nextEventFor(d); document.getElementById('todayNextTime').textContent=nx.time; document.getElementById('todayNextLabel').textContent=nx.label; document.getElementById('todayCountdown').textContent=nx.count;
    const w=WEATHER_SPOTS[d.date]; const ws=document.getElementById('todayWeatherState'); if(ws)ws.textContent=w?`${w.name} ${w.hi}/${w.lo}° 참고`:'도착일';
    const as=document.getElementById('todayAttendanceState'); if(as){const cnt=Object.values(attChecks||{}).filter(x=>x&&x.checked).length; as.textContent=attCurrent?`${cnt}/28 · ${attCurrent.title||attCurrent.type}`:'진행 없음';}
    const ls=document.getElementById('todayLocationState'); if(ls){const sharing=localStorage.getItem('loc_sharing')==='1'; ls.textContent=sharing?(locLastWrite?`${ago(locLastWrite)} 전송`:'공유 ON'):'공유 OFF';}
    document.getElementById('todayOpsNote').innerHTML=`<b>식사·운영</b> ${d.meal||'항공·도착 일정에 맞춰 운영'}<br><b>복장·날씨</b> ${WEATHER_ACTION[d.date]||''}`;
    document.getElementById('todayBtns').innerHTML=(d.map?`<a class="btn primary" target="_blank" rel="noopener" href="${d.map}">📍 오늘 동선 지도</a>`:'')+`<a class="btn" href="#schedule">◷ 오늘 상세일정</a><a class="btn" href="#attendance">✓ 출석</a><a class="btn" href="#location">◎ 위치</a>`;
  }

  function enhanceSchedulePanels(){
    document.querySelectorAll('#dayPanels .panel').forEach((p,i)=>{
      if(p.querySelector('.official-schedule-card')) return; const d=days[i];
      const summary=p.querySelector('.day-summary'); if(!summary)return;
      const box=document.createElement('div'); box.className='official-schedule-card';
      box.innerHTML=`<span class="tag">공식 일정</span><b> ${d.date.slice(5).replace('-','/')} 기본 운영동선</b><p>${OFFICIAL_DAY_SUMMARY[d.date]||d.route}</p><div class="schedule-separator"><div class="official"><b>공식</b><br>여행사·확정 항공·도시 간 이동 순서</div><div class="recommend"><b>추천</b><br>식사·집결·도보 효율을 고려한 현장 시간표</div></div>`;
      summary.insertAdjacentElement('afterend',box);
      const rec=p.querySelector('.recommended-flow'); if(rec)rec.innerHTML='<b>추천 운영안</b><br>공식 이동순서는 유지하고, 28명 승하차·식사·화장실·집결시간을 먼저 확보한 뒤 되돌아가는 도보를 줄이는 방향으로 구성했습니다.';
      const h=[...p.querySelectorAll('.day-main-grid .card h3')].find(x=>x.textContent.includes('추천 일정')); if(h)h.textContent='시간표 · 현장 추천 운영안';
      const wbox=p.querySelector('.day-weather-box'); if(wbox&&!p.querySelector('.weather-action-advice')){const a=document.createElement('div');a.className='weather-action-advice';a.innerHTML=`<b>오늘 준비</b><br>${WEATHER_ACTION[d.date]||''}`;wbox.insertAdjacentElement('afterend',a);}
    });
  }

  function setOnlineState(){const e=document.getElementById('onlineStatusChip');if(!e)return;const on=navigator.onLine;e.textContent=on?'🟢 온라인':'🟠 오프라인 · 저장 일정 이용';e.classList.toggle('online',on);e.classList.toggle('offline',!on);}

  function setupChecklistStages(){
    const groups=[...document.querySelectorAll('#checks .check-group')];
    const map=[['departure'],['departure'],['departure'],['departure','morning'],['departure','morning','free'],['departure','morning'],['departure','morning'],['morning','free'],['morning','checkout'],['return']];
    groups.forEach((g,i)=>g.dataset.stages=(map[i]||['all']).join(','));
  }
  window.filterChecklistStage=function(stage,btn){
    document.querySelectorAll('#checkStageBar button').forEach(x=>x.classList.toggle('active',x===btn));
    document.querySelectorAll('#checks .check-group').forEach(g=>{g.style.display=(stage==='all'||(g.dataset.stages||'').split(',').includes(stage))?'block':'none'});
  };

  function setupMemo(){const m=document.getElementById('fieldMemo');if(!m)return;m.value=localStorage.getItem('cro_field_memo')||'';m.addEventListener('input',()=>localStorage.setItem('cro_field_memo',m.value));}
  function reorderSections(){const main=document.querySelector('main'); if(!main)return;['today','schedule','location','attendance','guide','study','weatherDetail','route','hotels','team','check','videos','emergency','more'].forEach(id=>{const s=document.getElementById(id);if(s)main.appendChild(s)});}
  function adminVisibility(){document.querySelectorAll('.tech-only').forEach(x=>x.style.display=(currentUser?.name==='한상호'?'block':'none'));}

  function haversine(a,b,c,d){const R=6371000,rad=x=>x*Math.PI/180,dp=rad(c-a),dl=rad(d-b),q=Math.sin(dp/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(q));}
  function opsRenderMeetingDistance(){
    const box=document.getElementById('meetingDistanceCard'); if(!box)return;
    if(!attCurrent?.meetingLat||!attCurrent?.meetingLng){box.hidden=true;return;}
    const rows=APP_USERS.map(u=>{const r=locCache[u.slot];if(!r)return null;return {u,r,dist:haversine(attCurrent.meetingLat,attCurrent.meetingLng,r.lat,r.lng)}}).filter(Boolean).sort((a,b)=>b.dist-a.dist);
    const not=APP_USERS.length-rows.length;
    box.hidden=false; box.innerHTML=`<h3>📍 현재 집결지 거리</h3><div class="small muted">${esc(attCurrent.title||'집결')} · 위치공유 기준 · 먼 사람부터 표시${not?` · 위치 미공유 ${not}명`:''}</div><div class="distance-grid">${rows.slice(0,12).map(x=>{const cls=x.dist>500?'far':x.dist>150?'mid':'near',v=x.dist>=1000?(x.dist/1000).toFixed(1)+'km':Math.round(x.dist)+'m';return `<div class="distance-person"><b>${esc(x.u.name)} · ${x.u.group===0?'교수님':x.u.group+'조'}</b><span class="${cls}">${v}</span></div>`}).join('')}</div><div class="btns"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${attCurrent.meetingLat},${attCurrent.meetingLng}">집결지 Google 지도</a></div>`;
  }

  window.attToggleMissing=function(btn){attOnlyMissing=!attOnlyMissing;btn.classList.toggle('active',attOnlyMissing);attRender();};
  window.attRender=function(){
    const title=document.getElementById('attTitle'),meta=document.getElementById('attMeta'),roster=document.getElementById('attRoster'),btn=document.getElementById('attMyBtn'),sum=document.getElementById('attGroupSummary');if(!title||!roster)return;
    if(!attCurrent){title.textContent='현재 진행 중인 출석이 없습니다.';meta.textContent='한상호가 출석을 시작하면 원우 27명과 인솔 교수 1명이 실시간으로 확인할 수 있습니다.';document.getElementById('attCheckedCount').textContent='0';btn.disabled=true;btn.classList.remove('checked');btn.textContent='✓ 내 출석 확인';if(sum)sum.innerHTML='';roster.innerHTML='<div class="att-empty">새 출석이 시작되면 28명의 확인 여부가 여기에 표시됩니다.</div>';opsRenderToday();opsRenderMeetingDistance();return;}
    title.textContent=attCurrent.title||attCurrent.type||'출석 확인'; const count=Object.values(attChecks||{}).filter(x=>x&&x.checked).length,missing=28-count;
    meta.textContent=`${lastSeenClock(attCurrent.createdAt)} 시작 · ${attCurrent.createdBy||''}${attCurrent.meetingLat?' · 집결지 지정':''} · 미확인 ${missing}명`;
    document.getElementById('attCheckedCount').textContent=count;
    const mine=currentUser?attChecks[currentUser.slot]:null;btn.disabled=false;btn.classList.toggle('checked',!!mine?.checked);btn.textContent=mine?.checked?`✓ 확인완료 · ${new Date(mine.ts).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}`:'✓ 내 출석 확인';
    if(sum)sum.innerHTML=[1,2,3,4,0].map(g=>{const mem=APP_USERS.filter(u=>u.group===g),ok=mem.filter(u=>attChecks[u.slot]?.checked).length;return `<span class="att-group-pill ${ok<mem.length?'warn':''}">${g===0?'교수':g+'조'} ${ok}/${mem.length}</span>`}).join('');
    roster.innerHTML=`<div class="att-missing-note">${attOnlyMissing?'미확인자만 표시 중 · ':''}현재 미확인 ${missing}명</div>`;
    [1,2,3,4,0].forEach(g=>{let mem=APP_USERS.filter(u=>u.group===g&&attUserMatchesFilter(u));if(attOnlyMissing)mem=mem.filter(u=>!attChecks[u.slot]?.checked);if(!mem.length)return;mem.sort((a,b)=>Number(!!attChecks[a.slot]?.checked)-Number(!!attChecks[b.slot]?.checked));let h=document.createElement('div');h.className='grouphead';const gOk=mem.filter(u=>attChecks[u.slot]?.checked).length;h.textContent=g===0?'교수님':`${g}조`;roster.appendChild(h);mem.forEach(u=>{let c=attChecks[u.slot],ok=!!c?.checked,row=document.createElement('div');row.className='att-row '+(ok?'':'missing-first');row.innerHTML=`<span class="att-state ${ok?'ok':''}"></span><div class="att-name">${esc(u.name)}<small>${esc(u.org)} · ${u.group===0?'교수님':(u.leader?'조장':'조원')}</small></div><div class="att-status ${ok?'checked':''}">${ok?`확인 · ${new Date(c.ts).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}`:'미확인'}</div>`;roster.appendChild(row)});});
    opsRenderToday();opsRenderMeetingDistance();
  };

  window.attCreateEvent=async function(){
    if(!currentUser||currentUser.name!=='한상호'){alert('출석 시작은 한상호만 사용할 수 있습니다.');return}
    const type=document.getElementById('attType').value,custom=document.getElementById('attCustomTitle').value.trim(),now=Date.now(),d={id:String(now),type,title:custom||type,createdBy:currentUser.name,createdAt:now};
    const use=document.getElementById('attUseMyLocation')?.checked,hint=document.getElementById('attMeetingHint');
    if(use){try{if(hint)hint.textContent='현재 위치를 집결지로 확인 중…';const p=await getPos(true);d.meetingLat=+p.coords.latitude.toFixed(5);d.meetingLng=+p.coords.longitude.toFixed(5);d.meetingAccuracy=Math.round(p.coords.accuracy||0);if(hint)hint.textContent=`집결지 지정 준비 · GPS 정확도 약 ${d.meetingAccuracy}m`;}catch(e){if(hint)hint.textContent='현재 위치를 가져오지 못해 집결지 없이 출석을 시작합니다.';}}
    const b=JSON.stringify(d);try{const tk=await token(),r=await fetch(attCurrentPath()+`?auth=${encodeURIComponent(tk)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:b}),t=await r.text();locCount(b.length+t.length);if(!r.ok)throw Error('출석 시작 실패 — Firebase Rules 확인');attCurrent=d;attChecks={};document.getElementById('attCustomTitle').value='';attRender();}catch(e){alert(e.message||e)}
  };

  // Wrap existing location rendering so dashboard and meeting-distance stay current.
  const _renderRoster=window.renderRoster;
  if(typeof _renderRoster==='function') window.renderRoster=function(){const r=_renderRoster.apply(this,arguments);opsRenderToday();opsRenderMeetingDistance();return r;};
  const _appLogin=window.appLogin;
  if(typeof _appLogin==='function') window.appLogin=async function(){const r=await _appLogin.apply(this,arguments);setTimeout(()=>{adminVisibility();opsRenderToday();},100);return r;};
  const _appLogout=window.appLogout;
  if(typeof _appLogout==='function') window.appLogout=function(){const r=_appLogout.apply(this,arguments);adminVisibility();opsRenderToday();return r;};

  document.addEventListener('DOMContentLoaded',()=>{
    reorderSections(); enhanceSchedulePanels(); setupChecklistStages(); setupMemo(); setOnlineState(); adminVisibility(); opsRenderToday(); opsRenderMeetingDistance();
    window.addEventListener('online',setOnlineState);window.addEventListener('offline',setOnlineState);
    setInterval(opsRenderToday,60000);
  });
})();
