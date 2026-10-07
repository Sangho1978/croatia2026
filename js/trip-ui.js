/* MIX43 Türkiye 1 UI/content adapter */
(function(){
'use strict';
if(window.GSPA_TRIP_ID!=='turkiye1')return;
const $=s=>document.querySelector(s);
const guidebook='docs/turkiye1_guidebook.pdf';
const guidebookName='튀르키예1팀_안내책자.pdf';
function ready(){
  document.body.classList.add('trip-turkiye1');
  document.title='튀르키예 1팀 · GSPA 17기 하반기 국외연수';
  const brand=$('.mix-brand b'); if(brand)brand.textContent='튀르키예 서부';
  const ls=$('#loginScreen .login-brand'); if(ls)ls.textContent='SEOUL NATIONAL UNIVERSITY GSPA · 17TH';
  const lh=$('#loginTitle'); if(lh)lh.innerHTML='공공리더십 17기<br><span>하반기 국외연수</span>';
  const lc=$('#loginScreen .login-course'); if(lc)lc.innerHTML='<b>튀르키예 1팀</b> · 10/19–10/27';
  $('#loginScreen')?.classList.add('multi-country-login');

  const guide=$('#guide');
  if(guide)guide.innerHTML=`
    <div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div>
    <h2>역사 · 도시 · 관광 가이드</h2>
    <div class="guide-intro tur-guide-intro"><h3>튀르키예 서부 · 실제 동선 순서로 보기</h3><p>10/20 이스탄불부터 10/26 이스탄불 필드트레이닝까지, 실제 방문 순서에 맞춰 관람 포인트를 정리했습니다. 긴 설명은 관광 정보에만 남기고 현장 사용 버튼은 단순하게 구성했습니다.</p></div>

    <article class="city-guide tur-city" id="city-istanbul">
      <img class="city-cover" src="assets/images/turkiye1/bosphorus.jpg" alt="이스탄불 보스포러스" loading="lazy">
      <div class="inside"><div class="city-kicker">10/20 · 10/25–26 · ISTANBUL</div><h3>이스탄불 · 보스포러스에서 구시가지까지</h3>
      <p class="city-overview">첫날은 보스포러스에서 도시의 전체 지형을 보고, 10/25에는 술탄아흐메트 역사 지구·예레바탄사라이·돌마바흐체·피에롯티를 연결해 봅니다. 10/26은 탁심과 그랜드바자르에서 현대 상권과 전통 시장을 비교합니다.</p>
      <div class="tur-attraction-strip">
        <div><b>보스포러스 크루즈</b><span>유럽·아시아 양안, 돌마바흐체·오르타쾨이·요새 등 도시 스카이라인을 선상에서 확인</span></div>
        <div><b>블루모스크 · 술탄아흐메트</b><span>오스만 종교건축과 비잔틴 유산이 집중된 핵심 역사 지구</span></div>
        <div><b>예레바탄사라이</b><span>동로마 지하 저수조의 336개 기둥과 메두사 받침, 수공간 연출</span></div>
        <div><b>돌마바흐체 · 피에롯티</b><span>후기 오스만 궁전과 골든혼 전망을 대비해서 보기</span></div>
        <div><b>탁심 · 그랜드바자르</b><span>신시가지 보행축과 전통 실내시장의 공간·상업 구조 비교</span></div>
      </div>
      <div class="btns tur-source-btns"><a class="btn" href="https://goturkiye.com/istanbul" target="_blank" rel="noopener">공식 관광정보</a><a class="btn" href="https://www.youtube.com/watch?v=j_754CKmK6Q" target="_blank" rel="noopener">▶ 보스포러스 공식영상</a></div>
      </div>
    </article>

    <article class="city-guide tur-city" id="city-antalya">
      <img class="city-cover" src="assets/images/turkiye1/antalya_cruise.jpg" alt="안탈리아 해안" loading="lazy">
      <div class="inside"><div class="city-kicker">10/21 · ANTALYA</div><h3>안탈리아 · 하드리아누스의 문과 칼레이치</h3>
      <p class="city-overview">로마 시대 성문을 통과해 칼레이치 골목과 항구로 이어지는 동선입니다. 하드리아누스의 문 → 전통가옥·성벽 → 이블리 미나레를 따라 걸으면 로마·셀주크·오스만의 시대층이 자연스럽게 연결됩니다.</p>
      <div class="tur-attraction-strip"><div><b>하드리아누스의 문</b><span>서기 130년 하드리아누스 황제 방문을 기념한 로마 개선문</span></div><div><b>칼레이치</b><span>성벽·전통가옥·항구가 이어지는 안탈리아 구시가지 핵심</span></div><div><b>이블리 미나레</b><span>셀주크 시대를 대표하는 홈이 파인 첨탑</span></div></div>
      <div class="btns tur-source-btns"><a class="btn" href="https://antalya.goturkiye.com/see" target="_blank" rel="noopener">공식 관광정보</a><a class="btn" href="https://www.youtube.com/watch?v=eKQUP2el3zU" target="_blank" rel="noopener">▶ 안탈리아 공식영상</a></div>
      </div>
    </article>

    <article class="city-guide tur-city" id="city-pamukkale">
      <img class="city-cover" src="assets/images/turkiye1/pamukkale.jpg" alt="파묵칼레" loading="lazy">
      <div class="inside"><div class="city-kicker">10/22–23 · PAMUKKALE</div><h3>파묵칼레 · 석회붕과 히에라폴리스</h3>
      <p class="city-overview">온천수가 만든 하얀 석회 테라스와 그 위의 고대 온천도시 히에라폴리스를 한 공간으로 봅니다. 자연경관만 보는 것보다 대극장·네크로폴리스·온천수 흐름을 함께 보면 고대 휴양도시의 기능이 더 잘 보입니다.</p>
      <div class="tur-attraction-strip"><div><b>석회붕</b><span>보호구간은 맨발 관람이 필요한 곳이 있어 미끄럼에 주의</span></div><div><b>히에라폴리스</b><span>대극장·도시유적·온천문화가 결합된 고대 휴양도시</span></div><div><b>선택 열기구</b><span>10/23 새벽 희망자 프로그램 · 기상과 일출시간에 따라 변동</span></div></div>
      <div class="btns tur-source-btns"><a class="btn" href="https://pamukkale.goturkiye.com/" target="_blank" rel="noopener">공식 관광정보</a><a class="btn" href="https://www.youtube.com/watch?v=QOG4Mjet9HA" target="_blank" rel="noopener">▶ 파묵칼레 공식영상</a></div>
      </div>
    </article>

    <article class="city-guide tur-city" id="city-ephesus">
      <img class="city-cover" src="assets/images/turkiye1/ephesus.jpg" alt="에페소" loading="lazy">
      <div class="inside"><div class="city-kicker">10/23 · EPHESUS</div><h3>에페소 · 셀수스 도서관에서 대극장까지</h3>
      <p class="city-overview">대리석대로를 따라 셀수스 도서관·하드리아누스 신전·대극장을 연결해 보면 로마 도시의 공공·상업·문화 공간 규모를 체감할 수 있습니다. 사진은 정면 파사드뿐 아니라 거리축과 건축물의 관계를 함께 담는 것이 좋습니다.</p>
      <div class="btns tur-source-btns"><a class="btn" href="https://izmir.goturkiye.com/ephesus" target="_blank" rel="noopener">공식 관광정보</a><a class="btn" href="https://www.youtube.com/watch?v=HbF9UAsMB0c" target="_blank" rel="noopener">▶ 에페소 공식영상</a></div>
      </div>
    </article>

    <article class="city-guide tur-city" id="city-bursa">
      <img class="city-cover" src="assets/images/turkiye1/bursa.jpg" alt="부르사" loading="lazy">
      <div class="inside"><div class="city-kicker">10/24 · BURSA</div><h3>부르사 · 오스만 제국의 첫 수도</h3>
      <p class="city-overview">톱하네 전망대에서 도시와 울루산의 관계를 먼저 보고, 울루자미에서 초기 오스만 종교건축의 공간을 체감합니다. 이스탄불과 비교하면 제국 초기 수도의 도시 규모와 건축어휘가 더 선명하게 보입니다.</p>
      <div class="btns tur-source-btns"><a class="btn" href="https://bursa.goturkiye.com/" target="_blank" rel="noopener">공식 관광정보</a><a class="btn" href="https://www.youtube.com/results?search_query=Go+Turkiye+Bursa" target="_blank" rel="noopener">▶ 부르사 영상 찾기</a></div>
      </div>
    </article>`;

  const videos=$('#videos');
  if(videos)videos.innerHTML=`
    <div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div>
    <h2>추천 영상</h2><p class="muted">영상은 데이터 사용을 줄이기 위해 자동재생하지 않으며, 눌렀을 때만 YouTube가 열립니다.</p>
    <div class="tur-video-grid">
      <a class="tur-video-card" href="https://www.youtube.com/watch?v=j_754CKmK6Q" target="_blank" rel="noopener"><img src="assets/images/turkiye1/bosphorus.jpg" loading="lazy" alt="보스포러스"><div><small>10/20 · ISTANBUL</small><b>보스포러스 · GoTürkiye</b><span>첫날 크루즈 전에 도시의 양안 지형과 주요 랜드마크 예습</span></div></a>
      <a class="tur-video-card" href="https://www.youtube.com/watch?v=eKQUP2el3zU" target="_blank" rel="noopener"><img src="assets/images/turkiye1/antalya_cruise.jpg" loading="lazy" alt="안탈리아"><div><small>10/21 · ANTALYA</small><b>Antalya · GoTürkiye</b><span>칼레이치·지중해 해안의 분위기와 관광 포인트</span></div></a>
      <a class="tur-video-card" href="https://www.youtube.com/watch?v=QOG4Mjet9HA" target="_blank" rel="noopener"><img src="assets/images/turkiye1/pamukkale.jpg" loading="lazy" alt="파묵칼레"><div><small>10/22–23 · PAMUKKALE</small><b>Pamukkale · GoTürkiye</b><span>석회붕·히에라폴리스 경관을 방문 전에 한 번에 보기</span></div></a>
      <a class="tur-video-card" href="https://www.youtube.com/watch?v=HbF9UAsMB0c" target="_blank" rel="noopener"><img src="assets/images/turkiye1/ephesus.jpg" loading="lazy" alt="에페소"><div><small>10/23 · EPHESUS</small><b>Ephesus · GoTürkiye</b><span>셀수스 도서관·거리축·대극장 규모 예습</span></div></a>
      <a class="tur-video-card" href="https://www.youtube.com/watch?v=Pp00ruIqTGg" target="_blank" rel="noopener"><img src="assets/images/turkiye1/istanbul_core.jpg" loading="lazy" alt="이스탄불 문화"><div><small>10/25–26 · ISTANBUL</small><b>이스탄불 문화 · GoTürkiye</b><span>박물관과 역사문화 공간 중심 영상</span></div></a>
      <a class="tur-video-card" href="https://www.youtube.com/results?search_query=%EB%B6%80%EB%A5%B4%EC%82%AC+%ED%8A%80%EB%A5%B4%ED%82%A4%EC%98%88+%EC%97%AC%ED%96%89+%ED%95%9C%EA%B5%AD%EC%96%B4" target="_blank" rel="noopener"><img src="assets/images/turkiye1/bursa.jpg" loading="lazy" alt="부르사"><div><small>10/24 · BURSA</small><b>부르사 한국어 영상 찾기</b><span>울루자미·톱하네·오스만 첫 수도 배경을 한국어 영상으로 보완</span></div></a>
    </div>`;

  const route=$('#route');
  if(route)route.innerHTML=`<div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div><h2>전체 이동동선</h2><div class="tur-route-hero"><img src="assets/images/turkiye1/bosphorus.jpg" alt="튀르키예 서부"><div><b>인천 → 두바이 → 이스탄불 → 안탈리아 → 파묵칼레 → 에페소 → 마니사 → 부르사 → 이스탄불 → 두바이 → 인천</b><p>날짜별 일정의 동선지도는 인터넷이 있으면 Google Maps로 표시합니다. 데이터가 없을 때는 방문 순서를 로컬 동선도로 확인하고, 연결되면 Google Maps로 다시 표시합니다.</p></div></div>`;

  const more=$('#more');
  if(more)more.innerHTML=`<div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div><h2>여행 정보</h2><div class="card"><h3>튀르키예 현장 핵심</h3><ul><li><b>시차</b> 한국보다 6시간 느림</li><li><b>전압</b> 220V · 50Hz · C/F형이 일반적이나 멀티어댑터 권장</li><li><b>화폐</b> TRY(튀르키예 리라) · 트래블카드/ATM 활용</li><li><b>모스크</b> 노출이 심한 옷은 피하고, 여성은 내부에서 머리를 가릴 스카프 준비 권장</li><li><b>물</b> 음용은 생수 이용</li><li><b>화장실</b> 유료가 많아 소액 리라 준비</li></ul></div><div class="card"><h3>수하물</h3><p><b>에미레이트 국제선</b> 위탁 30kg 1개 · 기내 7kg 1개.</p><p><b>터키항공 국내선</b> 위탁 20kg · 기내 8kg 1개 + 개인 소지품 1개.</p><p>액체류는 용기당 100mL 이하, 1인 1L 투명 지퍼백 기준을 확인하세요.</p></div><div class="card"><h3>안전 · 소매치기</h3><p>탁심·이스티클랄, 술탄아흐메트, 그랜드바자르 등 혼잡지역에서는 가방을 몸 앞으로 두고 여권·현금을 분산 보관하세요.</p></div>`;


  const shop=$('#shopfood');
  if(shop)shop.innerHTML='<div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div><div class="shop24-head"><div><small>TASTE · SHOP</small><h2>먹거리 · 쇼핑</h2></div><b>튀르키예</b></div><div class="card"><h3>현지에서 즐기기</h3><p>케밥 · 피데 · 쾨프테 · 메제 · 로쿰 · 바클라바 · 터키 커피와 차를 일정 중 경험해보세요. 안탈리아에서는 지중해식 메뉴, 이스탄불에서는 시장·카페 문화를 함께 볼 수 있습니다.</p></div><div class="card"><h3>선물</h3><p>로쿰, 포장 바클라바, 터키 커피, 차, 향신료, 올리브오일·비누, 나자르 본주우 같은 소형 기념품이 휴대하기 편합니다. 그랜드바자르는 가격 비교 후 구매하세요.</p></div><div class="card"><h3>Tax Refund</h3><p>안내책자는 비거주 여행객의 KDV 환급 가능성을 안내합니다. 매장에서 Tax Free 서류를 받고 출국 전 세관 확인이 필요한 경우가 있으므로 여권·영수증·구매품을 함께 보관하세요.</p></div>';

  const news=$('#news');
  if(news)news.innerHTML='<div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div><div class="news-head"><div><small class="city-kicker">TRAVEL WATCH</small><h2>튀르키예 현장 확인</h2></div></div><div class="card"><h3>출발·이동 전 공식 확인</h3><p>인터넷이 있을 때만 아래 공식 사이트를 확인합니다. 오프라인에서는 일정·호텔·관광가이드는 그대로 사용할 수 있습니다.</p><div class="btns"><a class="btn" href="https://www.afad.gov.tr/" target="_blank" rel="noopener">AFAD 재난정보</a><a class="btn" href="https://www.istairport.com/en/" target="_blank" rel="noopener">이스탄불 공항</a><a class="btn" href="https://www.turkishairlines.com/" target="_blank" rel="noopener">터키항공</a><a class="btn" href="https://www.emirates.com/" target="_blank" rel="noopener">에미레이트</a></div></div>';

  const em=$('#emergency');
  if(em)em.innerHTML='<div class="app-subbar"><button class="app-subbar-menu" type="button">☰ 전체 메뉴</button><button class="app-subbar-home" data-route="today" type="button">⌂ 오늘</button></div><div class="emergency5-heading"><h2>긴급 · 비상</h2><a href="tel:112">긴급전화 112</a></div><div id="emergencyContacts" class="emergency5-grid"><a class="emergency5-item" href="tel:112"><b>긴급 112</b><span>경찰·응급 공통 긴급번호</span></a><a class="emergency5-item" href="tel:+902123688300"><b>주이스탄불 총영사관</b><span>+90 212 368 8300</span></a><a class="emergency5-item" href="tel:+905340533849"><b>영사관 긴급</b><span>+90 534 053 3849</span></a><a class="emergency5-item" href="tel:+903124687041"><b>주튀르키예 대사관</b><span>+90 312 468 7041</span></a></div><div class="card"><h3>여권·카드 분실</h3><p>여권 분실 시 가까운 경찰기관에 신고하고 분실신고서와 여권용 사진을 준비해 총영사관·대사관에 연락하세요. 카드 분실 시 카드사에 즉시 정지 신고하세요.</p></div><div class="card"><h3>혼잡지역 주의</h3><p>탁심·이스티클랄, 술탄아흐메트, 그랜드바자르, 주요 관광지와 대중교통에서는 가방을 몸 앞으로 두고 여권과 현금을 분산 보관하세요.</p></div>';

  document.querySelectorAll('[data-guidebook-action]').forEach(a=>{
    a.href=guidebook;
    if(a.dataset.guidebookAction==='download')a.download=guidebookName;
    else a.removeAttribute('download');
  });

  const total=Array.isArray(window.TEAM_MEMBERS)?TEAM_MEMBERS.length:27;
  const peers=Array.isArray(window.TEAM_MEMBERS)?TEAM_MEMBERS.filter(u=>u.group>0).length:26;
  const groups=Array.isArray(window.TEAM_MEMBERS)?new Set(TEAM_MEMBERS.filter(u=>u.group>0).map(u=>u.group)).size:3;
  document.querySelectorAll('.team-summary').forEach(el=>el.innerHTML=`<div><b>${total}</b><span>전체</span></div><div><b>${peers}</b><span>원우</span></div><div><b>${groups}</b><span>조</span></div><div><b>1</b><span>인솔 교수</span></div>`);
  const dirp=$('#members .mix-view-heading p');if(dirp)dirp.textContent=`원우 ${peers}명 + 인솔 교수 1명`;
  const miss=$('#attMissingNotice');if(miss && !(typeof attCurrent!=='undefined'&&attCurrent))miss.textContent=`미체크 ${total}명`;
  const expenseIcon=$('[data-route="expenses"] > b');if(expenseIcon)expenseIcon.textContent='₺';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0));else setTimeout(ready,0);
})();
