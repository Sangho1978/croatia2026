/* MIX21: device clock, independent directory, overseas emergency playbook.
 * Emergency content is informational only; no database, location, attendance or finance writes.
 */
(function(){
  'use strict';
  const LOCAL_ZONE='Europe/Zagreb', KOREA_ZONE='Asia/Seoul';
  const formatters=new Map();let clockTimer=0,memberFilter='all';
  function fmt(at,zone){
    if(!formatters.has(zone))formatters.set(zone,new Intl.DateTimeFormat('ko-KR',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));
    const p=formatters.get(zone).formatToParts(new Date(at));const get=k=>p.find(x=>x.type===k)?.value||'';
    return {time:get('hour')+':'+get('minute'),date:get('month')+'/'+get('day')+' '+get('weekday'),day:get('year')+'-'+get('month')+'-'+get('day')};
  }
  function clockPaint(){
    clearTimeout(clockTimer);const now=Date.now();
    for(const [suffix,zone] of [['Local',LOCAL_ZONE],['Korea',KOREA_ZONE]]){
      const v=fmt(now,zone),t=document.getElementById('clock'+suffix),d=document.getElementById('clock'+suffix+'Date');
      if(t){t.textContent=v.time;t.dateTime=new Date(now).toISOString();t.title=zone+' \u00b7 \uae30\uae30 \uc2dc\uacc4 \uae30\uc900';}
      if(d){d.textContent=v.date;d.title=v.day;}
    }
    // Minute boundary refresh; no network request, no work while in background.
    if(!document.hidden)clockTimer=setTimeout(clockPaint,60000-Date.now()%60000+30);
  }
  const esc=s=>Integration.escape(s);
  function renderDirectory(){
    const box=document.getElementById('directoryRoster');if(!box)return;
    const input=document.getElementById('directorySearch'),q=(input.value||'').replace(/\s+/g,'').toLowerCase();
    document.getElementById('directoryFilters').innerHTML=[['all','\uc804\uccb4'],['staff','\uc6b4\uc601\uc9c4'],['lead','\uc870\uc7a5'],['1','1\uc870'],['2','2\uc870'],['3','3\uc870'],['4','4\uc870'],['0','\uad50\uc218']].map(([f,n])=>`<button type="button" data-directory-filter="${f}" aria-pressed="${f===memberFilter}" class="${f===memberFilter?'active':''}">${n}</button>`).join('');
    document.getElementById('directoryStaff').innerHTML='<strong>\uc5f0\uc218 \uc6b4\uc601\uc9c4</strong><br>'+Object.entries(STAFF_ROLES).map(([name,role])=>esc(role)+' '+esc(name)).join(' \u00b7 ');
    const people=TEAM_MEMBERS.filter(u=>{
      const hay=[u.name,u.org,u.title,u.tripRole,u.leader?'\uc870\uc7a5':'',u.presenter?'\ubc1c\ud45c':'',u.group?u.group+'\uc870':'\uad50\uc218'].join('').replace(/\s+/g,'').toLowerCase();
      return (!q||hay.includes(q))&&(memberFilter==='all'||(memberFilter==='staff'&&u.tripRole)||(memberFilter==='lead'&&u.leader)||String(u.group)===memberFilter);
    });
    document.getElementById('directoryCount').textContent='\uc804\uccb4 28\uba85 \u00b7 \ud604\uc7ac '+people.length+'\uba85 \ud45c\uc2dc';
    box.innerHTML=[1,2,3,4,0].map(g=>{
      const list=people.filter(u=>u.group===g).sort((a,b)=>a.groupOrder-b.groupOrder);if(!list.length)return '';
      return `<section class="people-group" data-directory-group="${g}"><header><h3>${g?g+'\uc870':'\uc778\uc194 \uad50\uc218'}</h3><span>${list.length}\uba85</span></header><div class="people-grid">${list.map(Integration.personCard).join('')}</div></section>`;
    }).join('')||'<div class="empty-card">\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</div>';
  }
  function emergencyCards(){
    const root=document.getElementById('emergencyContacts');if(!root)return;
    root.innerHTML=`
      <div class="emergency6-priority" role="note">
        <div class="emergency6-priority-icon" aria-hidden="true">!</div>
        <div><b>생명·신체 위험, 중상, 화재, 범죄 진행 중이면 112부터</b><p>크로아티아와 이탈리아 모두 <strong>112</strong>가 유럽 통합 긴급번호입니다. 단순 여권·물품 분실은 112보다 경찰서·대사관·분실센터를 이용하세요.</p></div>
        <a href="tel:112" class="emergency6-call emergency6-call-hot">112 전화</a>
      </div>

      <section class="emergency6-section" aria-labelledby="emergencyCoreTitle">
        <div class="emergency6-section-head"><div><span>QUICK CONTACT</span><h3 id="emergencyCoreTitle">가장 먼저 필요한 연락처</h3></div><small>2026.09.20 확인</small></div>
        <div class="emergency6-contact-grid">
          <article class="emergency6-contact is-primary"><div><span>유럽 공통 · 24시간</span><h4>긴급신고 112</h4><p>경찰 · 소방 · 응급의료. 크로아티아는 영어 신고도 지원합니다.</p></div><a href="tel:112">☎ 112</a></article>
          <article class="emergency6-contact"><div><span>대한민국 외교부 · 24시간</span><h4>영사안전콜센터</h4><p>사건·사고, 긴급 의료, 경찰 신고 등 초기 통역과 영사상담</p></div><div class="emergency6-actions"><a href="tel:+82232100404">☎ +82 2 3210 0404</a><a class="is-link" href="https://www.0404.go.kr/bbs/contsPst/MST0000000000105/5/detail" target="_blank" rel="noopener noreferrer">공식 안내 ↗</a></div></article>
        </div>
        <div class="emergency6-script" aria-label="112 영어 신고 예시">
          <b>112에 영어로 이렇게 말하면 됩니다</b>
          <p><span>1</span><q>I need police / an ambulance / the fire brigade.</q></p>
          <p><span>2</span><q>We are at [호텔·도로·명소 이름 / 주소].</q></p>
          <p><span>3</span><q>There are [숫자] injured people. One person is unconscious / bleeding.</q></p>
          <p><span>4</span><q>My name is [이름]. My phone number is [번호].</q></p>
          <small>통화가 끊기지 않도록 먼저 <strong>무슨 일인지 → 정확한 위치 → 부상자 수·상태 → 신고자 연락처</strong> 순서로 짧게 전달하세요.</small>
        </div>
      </section>

      <section class="emergency6-section" aria-labelledby="emergencyCountryTitle">
        <div class="emergency6-section-head"><div><span>LOCAL EMERGENCY</span><h3 id="emergencyCountryTitle">현지 국가별 긴급 연락처</h3></div></div>
        <div class="emergency6-country-grid">
          <article class="emergency6-country">
            <div class="emergency6-country-title"><b>🇭🇷 크로아티아</b><span>주요 일정 10/13~10/17</span></div>
            <div class="emergency6-number-row"><a href="tel:112"><b>112</b><span>통합 긴급</span></a><a href="tel:192"><b>192</b><span>경찰</span></a><a href="tel:194"><b>194</b><span>응급의료</span></a><a href="tel:193"><b>193</b><span>소방</span></a><a href="tel:195"><b>195</b><span>해상구조</span></a><a href="tel:1987"><b>1987</b><span>도로지원 HAK</span></a></div>
            <div class="emergency6-embassy"><div><span>대한민국 대사관 · 자그레브</span><h4>+385 1 4821 282</h4><p>Ksaverska cesta 111 a-b, 10000 Zagreb<br>월~금 08:30~16:30 · 점심 12:00~12:30</p><p class="emergency6-note">근무시간 외 사건·사고는 영사안전콜센터 +82-2-3210-0404 이용.</p></div><div class="emergency6-actions"><a href="tel:+38514821282">☎ 대사관</a><a class="is-link" href="https://overseas.mofa.go.kr/hr-ko/index.do" target="_blank" rel="noopener noreferrer">대사관 공식 ↗</a><a class="is-link" href="https://www.google.com/maps/search/?api=1&query=Ksaverska+cesta+111+a-b%2C+10000+Zagreb%2C+Croatia" target="_blank" rel="noopener noreferrer">지도 ↗</a></div></div>
          </article>
          <article class="emergency6-country">
            <div class="emergency6-country-title"><b>🇮🇹 이탈리아</b><span>로마 일정 · 환승 포함</span></div>
            <div class="emergency6-number-row emergency6-number-row-italy"><a href="tel:112"><b>112</b><span>통합 긴급</span></a><a href="tel:113"><b>113</b><span>경찰</span></a><a href="tel:115"><b>115</b><span>소방</span></a><a href="tel:118"><b>118</b><span>응급의료</span></a></div>
            <div class="emergency6-embassy"><div><span>대한민국 대사관 · 로마</span><h4>+39 06 420 4021</h4><p>Via Piemonte, 54, 00187 Roma<br>월~금 09:30~12:00, 14:00~16:30</p><p class="emergency6-note"><strong>근무시간 외 사건·사고:</strong> +39 335 185 0499</p></div><div class="emergency6-actions"><a href="tel:+39064204021">☎ 대사관</a><a href="tel:+393351850499">☎ 야간·휴일</a><a class="is-link" href="https://overseas.mofa.go.kr/it-ko/index.do" target="_blank" rel="noopener noreferrer">대사관 공식 ↗</a><a class="is-link" href="https://www.google.com/maps/search/?api=1&query=Via+Piemonte+54%2C+00187+Roma%2C+Italy" target="_blank" rel="noopener noreferrer">지도 ↗</a></div></div>
          </article>
        </div>
      </section>

      <section class="emergency6-section emergency6-guides" aria-labelledby="emergencyGuideTitle">
        <div class="emergency6-section-head"><div><span>ACTION GUIDE</span><h3 id="emergencyGuideTitle">상황별 대처방법</h3></div><small>필요한 항목만 펼치기</small></div>

        <details class="emergency6-guide" open><summary><span>🛂</span><div><b>여권을 분실·도난당했을 때</b><small>경찰 신고 → 대사관 → 긴급여권 → 항공정보 변경</small></div></summary><div class="emergency6-guide-body">
          <ol><li><b>먼저 여권 사본·사진과 예약정보를 확보</b>합니다. 휴대전화나 클라우드에 저장해 둔 여권 사진, 항공권, 숙소 주소를 준비하면 신고와 본인확인이 빨라집니다.</li><li><b>도난·범죄가 의심되면 현지 경찰에 신고</b>하고 분실·도난 신고 접수증 또는 사건번호를 받습니다. 단순 분실이라도 경찰 신고서는 여권 악용 방지와 여행자보험 청구에 유용합니다.</li><li><b>현재 체류국 대한민국 대사관에 연락</b>합니다. 크로아티아는 자그레브 대사관, 이탈리아는 로마 대사관을 이용합니다. 다음 항공편이 임박했다면 먼저 전화해 발급 가능시간과 필요한 원본서류를 확인하세요.</li><li><b>긴급여권 준비</b>: 여권발급신청서, 최근 6개월 여권사진 1매, 여권 사본 또는 사진 부착 신분증, 긴급여권 신청 사유서 등이 기본이며 항공권·분실신고서 등 추가서류를 요구할 수 있습니다. 크로아티아 공관 안내에는 여권 분실 신고서가 구비서류에 포함됩니다.</li><li><b>발급수수료와 당일 접수 가능 여부는 공관에 최종 확인</b>합니다. 수수료·접수방식은 변경될 수 있으므로 이 앱의 고정 금액보다 공관 당일 안내를 우선합니다.</li><li><b>분실 신고되어 무효화된 기존 여권은 다시 찾아도 사용하지 않습니다.</b> 긴급여권은 비전자 단수여권이므로 이후 방문·경유국이 이를 인정하는지도 대사관·항공사에 확인하세요.</li><li><b>항공사에 새 여권정보를 반영</b>하고, 다음 항공편·호텔·렌터카 예약에 구여권번호가 들어간 경우 함께 변경합니다.</li></ol>
          <div class="emergency6-linkrow"><a href="https://overseas.mofa.go.kr/hr-ko/brd/m_27217/view.do?page=4&seq=1347725" target="_blank" rel="noopener noreferrer">크로아티아 긴급여권 안내 ↗</a><a href="https://overseas.mofa.go.kr/it-ko/brd/m_8729/view.do?page=1&seq=1344771" target="_blank" rel="noopener noreferrer">이탈리아 긴급여권 안내 ↗</a><a href="https://www.passport.go.kr/home/kor/contents.do?menuPos=15" target="_blank" rel="noopener noreferrer">외교부 긴급여권 안내 ↗</a></div>
          <div class="emergency6-warning"><b>중요</b> 여권 없이 항공기로 다른 도시·국가로 먼저 이동하려 하지 말고, 항공사와 대사관에 신분증·경찰신고서로 이동 가능한지 먼저 확인하세요.</div>
        </div></details>

        <details class="emergency6-guide"><summary><span>🎒</span><div><b>가방·지갑·휴대전화·카드를 잃어버렸을 때</b><small>분실과 도난을 구분하고, 금융·통신 피해부터 차단</small></div></summary><div class="emergency6-guide-body">
          <ol><li><b>단순 분실이면 마지막 장소부터</b> 호텔·식당·버스·택시·공항 Lost &amp; Found에 즉시 연락합니다. 시간·장소·물건 특징을 구체적으로 전달하세요.</li><li><b>도난이 의심되면 경찰 신고</b> 후 접수증을 받습니다. 이탈리아 대사관도 소지품 도난·분실 시 인근 경찰서 신고와 보험청구용 접수증 수령을 안내합니다.</li><li><b>카드·지갑</b>: 카드사 앱/콜센터에서 즉시 이용정지 → 모바일결제 등록카드 제거 → 현금인출·해외결제 내역 확인 순서로 조치합니다.</li><li><b>휴대전화</b>: iPhone ‘나의 찾기’ 또는 Android ‘내 기기 찾기’로 잠금·분실모드 → 통신사에 USIM/eSIM 정지 → 중요 계정 비밀번호 변경. 위험지역에서 직접 회수하러 가지 않습니다.</li><li><b>여행자보험</b>: 경찰신고서, 구매증빙, 카드 정지내역, 통신사 확인서, 새 물품 구입 영수증 등 증빙을 보관합니다.</li></ol>
          <div class="emergency6-subcard"><b>이번 일정에서 바로 쓸 분실센터</b><div class="emergency6-lost-grid"><div><strong>로마 FCO 공항</strong><p>공항 내 일반 분실물은 ADR 공식 신고폼 이용. <b>여권·신분증 분실은 공항경찰 +39 06 6561 0419</b>에 문의.</p><div class="emergency6-linkrow"><a href="https://www.adr.it/oggetti-smarriti" target="_blank" rel="noopener noreferrer">FCO 공식 분실물 ↗</a><a href="tel:+390665610419">☎ 공항경찰</a></div></div><div><strong>자그레브 공항</strong><p>Lost Property Office: <b>+385 1 4562 170</b>, 매일 08:00~18:00. 분실 시각·장소·물건 특징을 최대한 정확히 전달.</p><div class="emergency6-linkrow"><a href="https://www.zag.aero/en/passengers/at-the-airport/facilities-services/lost-property-office/576" target="_blank" rel="noopener noreferrer">공식 분실물 ↗</a><a href="tel:+38514562170">☎ 분실센터</a></div></div></div><div class="emergency6-linkrow"><a href="https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF47985" target="_blank" rel="noopener noreferrer">로마시 분실물 ↗</a></div><p>위탁수하물이 나오지 않으면 <b>수하물 수취구역을 나가기 전</b> 항공사/지상조업사 Lost &amp; Found에서 PIR(Property Irregularity Report)을 작성하세요. 기내에 두고 내린 물건은 항공사/지상조업사로 문의합니다.</p></div>
        </div></details>

        <details class="emergency6-guide"><summary><span>🩺</span><div><b>응급질환·부상·교통사고</b><small>112 → 위치·증상 전달 → 보험사·렌터카 후속</small></div></summary><div class="emergency6-guide-body">
          <ol><li><b>의식저하, 호흡곤란, 흉통, 심한 출혈, 중증 외상은 112</b>입니다. 사고 장소와 주변 표지·주소를 먼저 확인합니다.</li><li>112에 <b>무슨 일이 생겼는지, 정확한 위치, 부상자 수, 상태, 신고자 이름·전화번호</b>를 짧게 전달합니다.</li><li>교통사고는 2차 사고 위험을 피하고, 안전한 범위에서 차량·번호판·도로상태·상대방 보험정보를 촬영합니다. 부상자나 현장 위험이 있으면 임의로 해결하려 하지 말고 경찰·구급대 안내를 따릅니다.</li><li>렌터카라면 경찰 신고와 별도로 <b>렌터카 회사 및 여행자보험사</b>에도 즉시 사고접수를 합니다. 이해하지 못한 언어의 책임 인정서에는 바로 서명하지 마세요.</li><li>병원 진료 후 <b>진단서·진료기록·영수증·처방전</b>을 보관합니다.</li></ol>
        </div></details>

        <details class="emergency6-guide"><summary><span>🚨</span><div><b>소매치기·강도·범죄 피해</b><small>추격하지 말고 안전 확보 → 112/경찰 → 카드·기기 차단</small></div></summary><div class="emergency6-guide-body">
          <ol><li>가해자를 쫓거나 몸싸움하지 말고 밝고 사람이 많은 곳으로 이동합니다.</li><li>범죄가 진행 중이거나 신체 위협이 있으면 <b>즉시 112</b>. 이미 종료된 절도·소매치기는 가까운 경찰서에서 신고하고 사건번호·접수증을 받습니다.</li><li>분실 카드·휴대전화는 경찰 신고보다 먼저라도 즉시 정지할 수 있습니다. 금융·계정 피해 확산을 먼저 차단하세요.</li><li>통역이 필요하면 영사안전콜센터에 전화해 <b>사건사고 초기대응 통역</b> 지원을 요청할 수 있습니다.</li></ol>
        </div></details>

        <details class="emergency6-guide"><summary><span>👤</span><div><b>일행이 연락두절·실종됐을 때</b><small>마지막 위치 확인 → 안전 우려 시 즉시 신고</small></div></summary><div class="emergency6-guide-body">
          <ol><li>전화·메신저·호텔 객실·약속장소와 앱의 마지막 위치·업데이트 시각을 확인합니다.</li><li>단순 지각이 아니라 <b>안전이 우려되거나 연락두절 상황이 비정상적</b>이면 가까운 경찰서에 신고합니다. 크로아티아 정부는 실종 신고에 24시간을 기다릴 필요가 없다고 안내합니다.</li><li>산악·해상·재난 상황처럼 긴급 수색이 필요하면 <b>112</b>로 바로 신고하고 마지막으로 본 시간·장소·복장·휴대전화번호·사진을 준비합니다.</li></ol>
        </div></details>

        <details class="emergency6-guide"><summary><span>🔥</span><div><b>산불·홍수·폭풍·지진 등 재난</b><small>현지 경보를 우선하고 이동·대피 지시에 따르기</small></div></summary><div class="emergency6-guide-body">
          <ol><li>112 또는 현지 당국 안내를 따르고, 숙소·차량으로 무리하게 되돌아가지 않습니다.</li><li>크로아티아에서는 정부 공식 <b>HR112 Upozorenje</b> 앱이 산불·홍수·폭풍 등 경보를 영어로 제공합니다.</li><li>이탈리아에서는 <b>112 Where ARE U</b> 앱이 위치를 112 상황실로 전송하고 무음·채팅 신고를 지원합니다. 국가 공공경보 <b>IT-alert</b> 메시지를 받으면 안내를 우선 따릅니다.</li></ol>
          <div class="emergency6-linkrow"><a href="https://overseas.mofa.go.kr/hr-ko/brd/m_27217/list.do" target="_blank" rel="noopener noreferrer">HR112 공식 안내 ↗</a><a href="https://www.0404.go.kr/bbs/embsyNtc/1347181/detail?ntnCd=179" target="_blank" rel="noopener noreferrer">112 Where ARE U 안내 ↗</a><a href="https://www.it-alert.gov.it/en/" target="_blank" rel="noopener noreferrer">IT-alert 공식 ↗</a></div>
        </div></details>
      </section>

      <section class="emergency6-section emergency6-sources" aria-labelledby="emergencySourcesTitle">
        <details><summary id="emergencySourcesTitle">공식정보 출처 · 최신 확인 링크</summary><div class="emergency6-source-list"><a href="https://overseas.mofa.go.kr/hr-ko/index.do" target="_blank" rel="noopener noreferrer">주크로아티아 대한민국 대사관</a><a href="https://www.gov.hr/en/112-uniform-european-emergency-phone-number/1184" target="_blank" rel="noopener noreferrer">크로아티아 정부 112</a><a href="https://nestali.gov.hr/prijavi-nestanak-404/404" target="_blank" rel="noopener noreferrer">크로아티아 경찰 실종 신고 안내</a><a href="https://overseas.mofa.go.kr/it-ko/index.do" target="_blank" rel="noopener noreferrer">주이탈리아 대한민국 대사관</a><a href="https://www.salute.gov.it/new/it/news-e-media/notizie/11-febbraio-giornata-europea-del-numero-unico-di-emergenza-112/" target="_blank" rel="noopener noreferrer">이탈리아 보건부 112</a><a href="https://www.0404.go.kr/bbs/contsPst/MST0000000000105/5/detail" target="_blank" rel="noopener noreferrer">외교부 영사안전콜센터</a><a href="https://www.adr.it/oggetti-smarriti" target="_blank" rel="noopener noreferrer">로마 FCO 공항 분실물</a><a href="https://www.zag.aero/en/passengers/at-the-airport/facilities-services/lost-property-office/576" target="_blank" rel="noopener noreferrer">자그레브 공항 분실물</a></div><p>2026-09-20 공식기관 자료를 다시 확인해 반영했습니다. 연락처·근무시간·발급수수료는 변동될 수 있으므로 실제 사건 발생 시 공식 페이지의 당일 안내를 최종 기준으로 사용합니다.</p></details>
      </section>`;
  }


  // MIX10: immediate interaction feedback for field actions.
  let toastTimer=0;
  function actionToast(text,kind=''){
    const el=document.getElementById('appActionToast');if(!el||!text)return;
    clearTimeout(toastTimer);el.className='app-action-toast show '+kind;el.textContent=text;
    toastTimer=setTimeout(()=>{el.classList.remove('show')},kind==='error'?3200:1900);
  }
  function inlineLocationFeedback(text,kind=''){
    const el=document.getElementById('locationActionFeedback');if(!el)return;
    el.className='action-inline-feedback '+(kind?'is-'+kind:'');el.textContent=text;
  }
  function buttonBusy(button,busy,label){
    if(!button)return;if(busy){button.dataset.originalLabel=button.dataset.originalLabel||button.textContent;button.classList.add('is-busy');button.disabled=true;if(label)button.firstChild.textContent=label;}
    else{button.classList.remove('is-busy');button.disabled=false;if(button.dataset.originalLabel)button.textContent=button.dataset.originalLabel;}
  }
  function markDone(button){if(!button)return;button.classList.add('is-done');setTimeout(()=>button.classList.remove('is-done'),900)}
  function nowLabel(){if(window.AppTime){const v=AppTime.stored(Date.now());return '현지 '+v.croatia+' · 한국 '+v.korea}return new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}
  function installLocationActionFeedback(){
    if(window.__croLocFeedbackInstalled)return;window.__croLocFeedbackInstalled=true;
    const send0=window.locUpdateNow,refresh0=window.locRefreshAll,map0=window.locToggleMap;
    if(typeof send0==='function')window.locUpdateNow=async function(high=false){
      const b=document.getElementById('locSendNowBtn');buttonBusy(b,true,'◎ 위치 확인 중…');inlineLocationFeedback('현재 GPS 위치를 확인하고 있습니다.','working');actionToast('현재 위치 확인 중…','working');
      try{await send0(high);const state=window.LocationSession?.state;if(state?.phase==='permission'||state?.phase==='error')throw Error(state.message||'위치 전송을 확인해 주세요.');markDone(b);inlineLocationFeedback('✓ 위치 전송 완료 · '+nowLabel(),'success');actionToast('✓ 현재 위치를 전송했습니다.','success');}
      catch(e){inlineLocationFeedback('⚠ '+(e.message||e),'error');actionToast('위치 전송 실패 · 확인이 필요합니다.','error');throw e}
      finally{buttonBusy(b,false);}
    };
    if(typeof refresh0==='function')window.locRefreshAll=async function(manual=false){
      const b=document.getElementById('locRefreshBtn');if(manual){buttonBusy(b,true,'↻ 불러오는 중…');inlineLocationFeedback('일행의 최근 위치를 불러오고 있습니다.','working');actionToast('일행 위치 새로고침 중…','working');}
      try{await refresh0(manual);if(manual){markDone(b);inlineLocationFeedback('✓ 일행 위치를 새로고침했습니다. · '+nowLabel(),'success');actionToast('✓ 일행 위치를 새로고침했습니다.','success');}}
      catch(e){if(manual){inlineLocationFeedback('⚠ '+(e.message||e),'error');actionToast('일행 위치 조회 실패','error');}throw e}
      finally{if(manual)buttonBusy(b,false);}
    };
    if(typeof map0==='function')window.locToggleMap=function(force=false){
      const before=document.getElementById('locMap')?.classList.contains('show');const r=map0(force);const after=document.getElementById('locMap')?.classList.contains('show');
      const b=document.getElementById('locMapToggleBtn');if(b)b.textContent=after?'✕ 지도 닫기':'⌖ 지도 보기';
      inlineLocationFeedback(after?'✓ 지도를 열었습니다. 아래 지도 영역을 확인하세요.':'지도를 닫았습니다.',after?'success':'');actionToast(after?'✓ 지도 열림':'지도 닫힘',after?'success':'');markDone(b);return r;
    };
  }
  function paintLocationPageState(){
    const el=document.getElementById('locationPageState');if(!el)return;const s=window.LocationSession?.state;
    el.classList.remove('is-on','is-error');
    if(!currentUser){el.textContent='○ 로그인 전';return}
    if(s?.want&&s?.lastSentAt){el.textContent='● 위치 ON · '+ago(s.lastSentAt);el.classList.add('is-on')}
    else if(s?.phase==='permission'||s?.phase==='error'){el.textContent='⚠ 확인 필요';el.classList.add('is-error')}
    else if(s?.want){el.textContent='◌ 위치 준비 중'}else el.textContent='○ 위치 OFF';
  }
  function globalPressFeedback(e){
    const hit=e.target.closest('button,a.btn,.app-sheet-grid button,.app-nav-btn');if(!hit||hit.disabled)return;
    hit.classList.add('ux-clicked');setTimeout(()=>hit.classList.remove('ux-clicked'),180);
    if(hit.matches('.app-nav-btn'))return;
    if(hit.closest('.app-sheet-grid'))actionToast((hit.querySelector('span')?.textContent||'메뉴')+' 열기');
    else if(hit.id==='attStartBtn')actionToast('출석 시작 요청을 보냈습니다.','working');
    else if(hit.id==='attResetBtn')actionToast('출석 리셋을 처리합니다.','working');
    else if(hit.id==='attMyBtn'&&!hit.disabled)actionToast('내 출석을 확인합니다.','working');
    else if(hit.matches('[data-header-toggle]'))actionToast(document.body.classList.contains('header-expanded')?'상단 정보를 접습니다.':'상단 상세정보를 펼칩니다.');
  }

  document.addEventListener('input',e=>{if(e.target.id==='directorySearch')renderDirectory()});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-directory-filter]');if(b){memberFilter=b.dataset.directoryFilter;renderDirectory();document.querySelector('[data-directory-filter="'+memberFilter+'"]')?.focus({preventScroll:true})}});
  document.addEventListener('visibilitychange',clockPaint);
  window.addEventListener('pageshow',clockPaint);
  window.addEventListener('cro-route',e=>{if(e.detail?.view==='members')renderDirectory()});
  document.addEventListener('click',globalPressFeedback,true);
  window.addEventListener('cro-location-state',paintLocationPageState);
  window.addEventListener('cro-route',paintLocationPageState);
  document.addEventListener('DOMContentLoaded',()=>{clockPaint();renderDirectory();emergencyCards();installLocationActionFeedback();paintLocationPageState()});
  window.TripClocks={format:fmt,refresh:clockPaint};
})();
