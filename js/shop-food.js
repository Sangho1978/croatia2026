/* MIX24 · itinerary-matched food, seasonal produce and shopping guide */
(function(){
  const STORE_KEY='croatia2026-shop-checks-v1';
  const sourceLinks={
    dubrovnikGastro:'https://visitdubrovnik.hr/gastronomy/',
    dubrovnikMandarin:'https://visitdubrovnik.hr/activities/others/',
    splitMarket:'https://visitsplit.com/en/517/pazar',
    splitTaste:'https://visitsplit.com/clients/1/downloads/63mbniuyaxa33rr.pdf?lang=en',
    zadarMarket:'https://zadar.travel/lifestyle/city-market-and-fishmarket',
    zadarMaraska:'https://zadar.travel/news/zadar-the-city-of-premium-natural-liqueurs-and-brandies',
    maraska:'https://maraska.hr/en/',
    ninSalt:'https://www.solananin.hr/en/webshop/flower-of-salt-nin/',
    zagreb:'https://www.infozagreb.hr/en/about-zagreb/basic-facts',
    dolac:'https://www.infozagreb.hr/en/news/dolac-market-flavours-scents-and-rhythm-of-the-city-en',
    kras:'https://www.kras.hr/en/products',
    romeFood:'https://www.turismoroma.it/en/page/rome-eat-traditional-recipes',
    romeStreet:'https://www.turismoroma.it/en/node/47318',
    romeMarket:'https://www.turismoroma.it/en/node/34976',
    eataly:'https://www.turismoroma.it/en/places/eataly-roma-termini',
    italySeason:'https://sapermangiare.an.crea.gov.it/528/prodotti-di-stagione.html',
    customs:'https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?cnslKnwlSrno=427&mi=6822',
    customsDuty:'https://customs.go.kr/gimhae/cm/cntnts/cntntsView.do?cntntsId=829&mi=6516'
  };

  const guide=[
    {
      id:'dubrovnik',dates:'10/13–14',title:'두브로브니크',sub:'Old Town · Lapad · 출발 전 Gruž',emoji:'🇭🇷',
      fit:'10/13 성벽·스르지산, 10/14 Old Town 자유탐방 뒤 두체 이동. 무거운 쇼핑은 10/14 출발 직전이 가장 편합니다.',
      eat:[
        ['로자타 Rozata','두브로브니크식 크렘 캐러멜. 달고 부드러워 한국인 입맛에 가장 무난한 현지 디저트.','◎'],
        ['해산물·그릴 생선','아드리아 해산물은 이 지역의 핵심. 생선구이·문어샐러드처럼 재료 맛이 선명한 메뉴부터 추천.','◎'],
        ['아란치니 Arancini','설탕에 절인 오렌지 껍질. 커피와 잘 맞고 포장 제품은 선물로도 좋음.','◎'],
        ['말린 무화과·꿀','현지 전통 간식. 신선과일보다 귀국용 선물로 다루기 편함.','○']
      ],
      fruit:[
        ['네레트바 만다린','10월이 수확철. 남부 달마티아에서 가장 계절감이 확실한 과일. 현지에서 바로 먹기.'],
        ['석류','두브로브니크 리비에라에서 가을에 익는 대표 과일. 시장에서 소량 시식 추천.'],
        ['포도·사과·배','10월 시장에서 쉽게 만나는 가을 과일. 장거리 이동 전에는 소량 구매.']
      ],
      buy:[
        ['달마티아 엑스트라버진 올리브오일','한국인 추천','소형 병·틴이 휴대와 선물에 유리. 빵에 찍어 맛보고 산도/원산지 확인.'],
        ['아란치니·말린 무화과','한국인 추천','가볍고 상온 보관이 쉬워 단체 선물용으로 실용적.'],
        ['라벤더 향주머니·비누','선물용','식품이 아닌 가벼운 기념품. 액체 오일보다는 향주머니·비누가 이동 편함.'],
        ['지역 꿀','부모님 선물','유리병 무게를 고려해 작은 용량 추천.']
      ],
      places:[
        {n:'Gundulić Square Market',why:'10/13~14 Old Town 동선 안. 제철 과일·말린 과일·현지 소품을 보기 좋음.',map:'https://www.google.com/maps/search/?api=1&query=Gunduliceva+Poljana+Market+Dubrovnik',tag:'동선 최적'},
        {n:'Gruž Market',why:'Grand Hotel Park/Lapad 쪽에서 접근하기 좋고 10/14 두체 출발 전 쇼핑에 유리. 오전 방문 권장.',map:'https://www.google.com/maps/search/?api=1&query=Gruz+Market+Dubrovnik',tag:'출발 전'},
        {n:'Tommy Supermarket',why:'Kraš 과자·커피·포장식품·물 등 가격 비교용. 시장보다 포장 제품을 사기 편함.',map:'https://www.google.com/maps/search/?api=1&query=Tommy+Supermarket+Dubrovnik',tag:'마트'}
      ],
      sources:[['두브로브니크 공식 미식 안내',sourceLinks.dubrovnikGastro],['네레트바 만다린 수확 안내',sourceLinks.dubrovnikMandarin]]
    },
    {
      id:'split',dates:'10/15',title:'스플리트 · 트로기르',sub:'디오클레티아누스 궁전 · Pazar · Trogir',emoji:'🇭🇷',
      fit:'스플리트 핵심관광 후 11:30 중식. Pazar는 궁전 동쪽 벽 바로 옆이라 별도 이동 없이 둘러보기 좋습니다.',
      eat:[
        ['파슈티차다 Pašticada','와인·향신료·말린 과일로 오래 익힌 소고기와 뇨키. 갈비찜류를 좋아하면 만족도가 높음.','◎'],
        ['페카 Peka','고기나 문어·감자를 철제 뚜껑 아래 천천히 익히는 달마티아 대표요리. 보통 사전 주문 필요.','◎'],
        ['그릴 생선 + 블리트바','담백한 생선과 근대·감자 조합. 한식 생선구이에 익숙한 사람에게 무난.','◎'],
        ['프리툴레 Fritule','작은 도넛 같은 달마티아 간식. 식후나 이동 중 간식으로 좋음.','○']
      ],
      fruit:[
        ['석류·포도','달마티아의 가을 과일. Pazar에서 제철 상태를 직접 보고 소량 구매.'],
        ['사과·배','버스 이동 중 먹기 편한 가을 과일. 씻어서 당일 섭취 권장.'],
        ['만다린','10월 남부 크로아티아에서 제철이 시작되므로 보이면 한두 봉지만 현지 섭취용으로 추천.']
      ],
      buy:[
        ['달마티아 올리브오일','한국인 추천','관광지 기념품점보다 Pazar 주변 식품점·마트에서 원산지/용량 비교.'],
        ['무화과 잼·말린 무화과','한국인 추천','빵·요거트와 잘 맞고 상온 선물로 편함.'],
        ['허브솔트·올리브','실속형','소형 포장은 여러 명 선물에 좋음. 올리브는 액체 누수 주의.'],
        ['Kraš 과자·Napolitanke','단체 선물','가볍고 나눠주기 쉬움. 대형마트가 보통 선택 폭이 넓음.']
      ],
      places:[
        {n:'Split Pazar (Green Market)',why:'디오클레티아누스 궁전 동쪽 바로 옆. 제철과일·채소·꿀·건과일·현지식품을 일정에 가장 자연스럽게 넣을 수 있음.',map:'https://www.google.com/maps/search/?api=1&query=Pazar+Split+Green+Market',tag:'동선 최적'},
        {n:'Split Fish Market (Peškarija)',why:'생선은 사가기보다 현지 식문화 체험용. 오전 방문 시 아드리아 수산물을 보기 좋음.',map:'https://www.google.com/maps/search/?api=1&query=Fish+Market+Split',tag:'먹거리 체험'},
        {n:'Trogir Old Town 식품·기념품점',why:'트로기르 자유보행 중 작은 올리브오일·허브·과자를 추가 구매하기 쉬움. 가격 비교 권장.',map:'https://www.google.com/maps/search/?api=1&query=local+products+Trogir+Croatia',tag:'보충 쇼핑'}
      ],
      sources:[['Split 관광청 Pazar',sourceLinks.splitMarket],['Split 공식 미식 가이드',sourceLinks.splitTaste]]
    },
    {
      id:'zadar',dates:'10/16',title:'자다르',sub:'St Donatus · Cathedral · Sea Organ',emoji:'🇭🇷',
      fit:'08:50~10:20 핵심관광이라 시간이 짧습니다. 성 도나트·대성당 주변에서 15~20분 안에 살 수 있는 품목만 추천합니다.',
      eat:[
        ['파그 치즈 Paški sir','짭짤하고 진한 양젖 치즈. 얇게 맛보면 와인·올리브와 잘 맞음. 귀국 반입은 검역 확인 필요.','◎'],
        ['달마티아 프로슈토','현지에서 치즈와 함께 맛보기 좋지만 육가공품은 한국 귀국용 구매 비추천.','○'],
        ['마라스카 체리 제품','자다르 특산 sour cherry. 리큐어가 부담되면 주스·시럽·잼·체리 제품으로 선택 가능.','◎']
      ],
      fruit:[
        ['석류·포도·사과','자다르 시장의 가을 기본 과일. 시간이 짧으므로 먹을 만큼만 구매.'],
        ['견과류·꿀','시장 주변에서 상온 간식으로 구하기 쉬워 장거리 이동에 실용적.']
      ],
      buy:[
        ['Nin 플뢰르 드 셀','한국인 추천','50~125g 소형 소금은 가볍고 깨질 걱정이 적어 선물 효율이 높음.'],
        ['Maraska Amarena·Maraschino','자다르 대표','체리 잼·시럽은 비주류 선물, Maraschino는 성인용 리큐어.'],
        ['Kraš 초콜릿·웨하스','단체 선물','시내 마트에서 함께 사면 효율적.'],
        ['파그 치즈','현지 맛보기','냉장·검역 변수가 있어 귀국 선물보다는 현지 시식 우선.']
      ],
      places:[
        {n:'Maraska Shop Zadar',why:'대성당·성 도나트와 가까운 구시가지 전문점. Maraschino·Amarena 계열을 짧은 시간에 고르기 좋음.',map:'https://www.google.com/maps/search/?api=1&query=Maraska+Shop+Zadar',tag:'10~15분'},
        {n:'Zadar City Market',why:'구시가지 안에서 과일·치즈·꿀·견과 등 현지 식재료를 볼 수 있음. 오전 동선과 잘 맞음.',map:'https://www.google.com/maps/search/?api=1&query=Zadar+City+Market',tag:'제철'},
        {n:'Konzum / 현지 슈퍼',why:'Nin 소금·Kraš·포장식품을 빠르게 비교구매할 때 유리.',map:'https://www.google.com/maps/search/?api=1&query=Konzum+Zadar+Old+Town',tag:'빠른 쇼핑'}
      ],
      sources:[['Zadar 공식 시장 안내',sourceLinks.zadarMarket],['Zadar 관광청 Maraska 안내',sourceLinks.zadarMaraska],['Nin 소금 공식',sourceLinks.ninSalt]]
    },
    {
      id:'zagreb',dates:'10/17',title:'자그레브',sub:'Jelačić · Upper Town · 자유시간',emoji:'🇭🇷',
      fit:'13:00~16:10 핵심관광·자유시간 뒤 바로 석식과 공항 이동. 이날이 크로아티아 기념품을 최종 정리하기 가장 좋은 날입니다.',
      eat:[
        ['슈트루클리 Štrukli','치즈를 넣어 삶거나 구운 자그레브 대표 음식. 한국의 치즈만두·그라탱 중간 느낌이라 접근성이 좋음.','◎'],
        ['자그레브 스테이크','햄·치즈를 넣은 송아지 커틀릿. 돈가스류를 좋아하면 익숙한 편.','◎'],
        ['커피 + Kraš 디저트','자그레브는 느긋한 카페문화가 강함. 자유시간에 짧게 경험하기 좋음.','○']
      ],
      fruit:[
        ['사과·배','10월 내륙 크로아티아의 대표 가을 과일.'],
        ['밤·포도','가을 시장에서 계절감이 좋은 품목. 밤은 구운 간식으로 현지 섭취 추천.']
      ],
      buy:[
        ['Kraš Bajadera','한국인 추천 1순위','헤이즐넛·아몬드 누가 프랄린. 선물 포장이 좋고 크로아티아 브랜드 정체성이 명확.'],
        ['Kraš Napolitanke','가성비','웨하스라 가볍고 여러 명에게 나눠주기 좋음.'],
        ['Kraš Griotte','성인 선물','사워체리+리큐어 프랄린. 알코올 4% 제품이므로 어린이 선물에는 제외.'],
        ['Franck Jubilarna 커피','커피 선물','크로아티아 대중 커피를 집에서 경험하기 좋은 품목.'],
        ['Licitar 하트','비식품 기념품','크로아티아 전통 문양 기념품. 가볍고 검역 걱정 없음.']
      ],
      places:[
        {n:'Kraš & Shop · Varšavska',why:'Jelačić·Ilica 자유시간 동선에서 Kraš 선물을 한 번에 정리하기 좋음. 당일 영업시간 확인.',map:'https://www.google.com/maps/search/?api=1&query=Kras+Shop+Varsavska+Zagreb',tag:'최종 쇼핑'},
        {n:'Dolac Market',why:'Jelačić 광장 바로 위. 제철 과일·꿀·현지 먹거리를 보기 좋지만 오후에는 품목이 줄 수 있어 열려 있으면 빠르게 방문.',map:'https://www.google.com/maps/search/?api=1&query=Dolac+Market+Zagreb',tag:'시장'},
        {n:'Ilica · 중심가 슈퍼마켓',why:'Kraš·Franck·포장식품 가격 비교용. 공항 가기 전 무거운 액체류는 이때 최종 결정.',map:'https://www.google.com/maps/search/?api=1&query=supermarket+Ilica+Zagreb',tag:'가격 비교'}
      ],
      sources:[['Zagreb 공식 미식 안내',sourceLinks.zagreb],['Dolac 공식 안내',sourceLinks.dolac],['Kraš 공식 제품',sourceLinks.kras]]
    },
    {
      id:'rome',dates:'10/18',title:'로마',sub:'Colosseum · Trevi · Pantheon · Navona → FCO',emoji:'🇮🇹',
      fit:'10/12 FCO 환승일에는 항공·식사가 우선이므로 쇼핑을 미루고, 10/18 귀국일에 정리하는 편이 좋습니다. 16시 전 관광 종료가 우선이라 중앙 동선에서는 소형 식품만 사고 부족한 선물은 FCO에서 마무리하세요.',
      eat:[
        ['카르보나라','달걀·구안찰레·Pecorino Romano·후추. 크림 없는 정통 스타일을 한 번은 꼭.','◎'],
        ['카초 에 페페','Pecorino와 후추 중심의 단순한 파스타. 치즈 좋아하는 한국인에게 호응도가 높음.','◎'],
        ['그리차·아마트리치아나','로마 4대 파스타 비교용. 여러 명이면 서로 다른 메뉴를 나눠 맛보기 좋음.','◎'],
        ['수플리 Supplì','토마토 리조또 안에 치즈를 넣어 튀긴 로마식 간식. 자유식 시간이 짧을 때 유용.','◎']
      ],
      fruit:[
        ['감 Cachi','이탈리아 공식 제철표상 10~11월. 한국 감과 비교해 현지에서 먹어보기 좋음.'],
        ['포도 Uva','10월까지 제철. 시장에서 소량 구매해 현지 섭취.'],
        ['밤 Castagne','10~11월 제철. 구운 밤이 보이면 간식으로 추천.'],
        ['사과·배','10월 제철. 버스 이동 전 가벼운 간식으로 무난.']
      ],
      buy:[
        ['커피 Illy·Lavazza 등','한국인 추천','틴·분쇄커피·캡슐은 가볍고 선물하기 쉬움. 캡슐 규격 확인.'],
        ['건조 파스타','가성비','한국에서 보기 힘든 모양을 고르면 여행 선물 느낌이 큼.'],
        ['트러플 소금·소스','한국인 추천','오일보다 소금이 가볍고 파손·액체 문제도 적음. 성분과 트러플 함량 확인.'],
        ['소형 EVOO','요리 선물','250ml 안팎 또는 틴 포장이 실용적. 100ml 초과 액체는 위탁수하물 계획.'],
        ['초콜릿·비스킷','단체 선물','Venchi·Baci류 또는 마트 현지 제품. 무게 대비 만족도가 높음.']
      ],
      places:[
        {n:"Campo de' Fiori",why:'Pantheon·Piazza Navona와 가까워 오전~이른 오후에 제철 과일·건식재료를 보기 좋음. 시장은 일찍 끝나는 편이라 시간 확인.',map:'https://www.google.com/maps/search/?api=1&query=Campo+de+Fiori+Rome',tag:'동선 인접'},
        {n:'Mercato Centrale Roma · Termini',why:'여러 이탈리아 식품을 한곳에서 먹고 살 수 있는 선택지. 일정이 Termini 쪽을 지나갈 때만 이용.',map:'https://www.google.com/maps/search/?api=1&query=Mercato+Centrale+Roma',tag:'원스톱'},
        {n:'Eataly Roma Termini',why:'품질 좋은 포장 식품·커피·파스타를 고르기 편함. 별도 이동이 생기면 무리하지 말고 공항 쇼핑으로 대체.',map:'https://www.google.com/maps/search/?api=1&query=Eataly+Roma+Termini',tag:'선물용'},
        {n:'FCO 출국장',why:'시간이 부족하거나 액체류 포장이 걱정될 때 마지막 보충. 시내보다 비쌀 수 있으므로 가벼운 선물 중심.',map:'https://www.google.com/maps/search/?api=1&query=Fiumicino+Airport+shopping',tag:'마지막 보충'}
      ],
      sources:[['로마 공식 전통요리',sourceLinks.romeFood],['로마 공식 스트리트푸드',sourceLinks.romeStreet],['Mercato Trionfale 공식 안내',sourceLinks.romeMarket],['이탈리아 공식 제철표',sourceLinks.italySeason]]
    }
  ];

  const topPicks=[
    {id:'bajadera',icon:'🍫',n:'Bajadera',d:'크로아티아 대표 Kraš 프랄린. 선물 포장·상온·브랜드 정체성의 균형이 가장 좋음.',where:'자그레브에서 최종 구매',tag:'한국인 선물 ◎'},
    {id:'olive',icon:'🫒',n:'달마티아 올리브오일',d:'두브로브니크·스플리트에서 맛보고 소형 병/틴으로 구매. 요리 좋아하는 사람 선물.',where:'두브로브니크·스플리트',tag:'부모님 선물 ◎'},
    {id:'ninsalt',icon:'🧂',n:'Nin 플뢰르 드 셀',d:'가볍고 상온 보관, 50~125g 소형 포장이라 단체 선물에 특히 실용적.',where:'자다르·크로아티아 마트',tag:'실용 선물 ◎'},
    {id:'marasca',icon:'🍒',n:'Maraska 체리 제품',d:'자다르 고유성이 뚜렷함. 술이 부담되면 Amarena 잼·시럽·체리 제품 선택.',where:'자다르 Maraska Shop',tag:'지역 특산 ◎'},
    {id:'kraswafer',icon:'🧇',n:'Kraš Napolitanke',d:'가볍고 여러 명에게 나눠주기 좋은 웨하스. 마트에서 쉽게 구매.',where:'크로아티아 전역',tag:'가성비 ◎'},
    {id:'romefood',icon:'☕',n:'로마 커피·파스타·트러플 소금',d:'한국 여행객이 반복적으로 찾는 실용 식품. 마지막 날에는 무거운 유리병보다 가벼운 포장 우선.',where:'로마 중심·FCO',tag:'한국인 쇼핑 ◎'}
  ];

  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function loadChecks(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch(e){return {}}}
  function saveChecks(v){try{localStorage.setItem(STORE_KEY,JSON.stringify(v))}catch(e){}}
  function currentTripCity(){
    const d=new Date();
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zagreb',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const y=parts.find(x=>x.type==='year')?.value,m=parts.find(x=>x.type==='month')?.value,day=parts.find(x=>x.type==='day')?.value;
    const key=`${y}-${m}-${day}`;
    return ({'2026-10-13':'dubrovnik','2026-10-14':'dubrovnik','2026-10-15':'split','2026-10-16':'zadar','2026-10-17':'zagreb','2026-10-18':'rome'})[key]||'all';
  }
  function renderTop(){
    const el=document.getElementById('shopTopPicks'); if(!el)return;
    const checks=loadChecks();
    el.innerHTML=topPicks.map(x=>`<article class="shop24-pick ${checks[x.id]?'is-checked':''}" data-shop-check-card="${esc(x.id)}"><button type="button" class="shop24-check" data-shop-check="${esc(x.id)}" aria-pressed="${checks[x.id]?'true':'false'}">${checks[x.id]?'✓':'＋'}</button><div class="shop24-pick-icon">${x.icon}</div><div><span>${esc(x.tag)}</span><h4>${esc(x.n)}</h4><p>${esc(x.d)}</p><small>📍 ${esc(x.where)}</small></div></article>`).join('');
  }
  function placeCard(p){return `<article class="shop24-place"><div><span>${esc(p.tag)}</span><h4>${esc(p.n)}</h4><p>${esc(p.why)}</p></div><a href="${esc(p.map)}" target="_blank" rel="noopener noreferrer">지도 ↗</a></article>`}
  function renderCity(id){
    const host=document.getElementById('shopFoodContent');if(!host)return;
    const rows=id==='all'?guide:guide.filter(x=>x.id===id);
    host.innerHTML=rows.map(g=>`<section class="shop24-city" data-shop-city="${g.id}">
      <div class="shop24-cityhead"><div><span>${g.emoji} ${esc(g.dates)} · ${esc(g.sub)}</span><h3>${esc(g.title)}</h3></div><b>${g.id==='rome'?'ITALY':'CROATIA'}</b></div>
      <p class="shop24-fit">🚌 <strong>연수 동선:</strong> ${esc(g.fit)}</p>
      <div class="shop24-columns">
        <div class="shop24-block"><h4>🍽️ 꼭 먹기</h4>${g.eat.map(x=>`<div class="shop24-row"><div><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div><span>${esc(x[2])}</span></div>`).join('')}</div>
        <div class="shop24-block"><h4>🍊 10월 제철</h4>${g.fruit.map(x=>`<div class="shop24-fruit"><b>${esc(x[0])}</b><p>${esc(x[1])}</p></div>`).join('')}<div class="shop24-fruit-warning">⚠ 생과일은 현지에서 먹고 귀국용으로 사지 않는 것을 권장합니다. 한국 입국 시 검역대상입니다.</div></div>
      </div>
      <div class="shop24-block shop24-buy"><h4>🎁 사기 좋은 것</h4>${g.buy.map(x=>`<div class="shop24-buyrow"><div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div><p>${esc(x[2])}</p></div>`).join('')}</div>
      <div class="shop24-block"><h4>📍 실제 일정에 넣기 좋은 구매처</h4><div class="shop24-places">${g.places.map(placeCard).join('')}</div></div>
      <div class="shop24-sources"><span>근거</span>${g.sources.map(s=>`<a href="${esc(s[1])}" target="_blank" rel="noopener noreferrer">${esc(s[0])} ↗</a>`).join('')}</div>
    </section>`).join('');
  }
  function setFilter(id){
    document.querySelectorAll('[data-shop-filter]').forEach(b=>{const on=b.dataset.shopFilter===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
    renderCity(id);
  }
  function init(){
    if(!document.getElementById('shopFoodContent'))return;
    renderTop();
    setFilter(currentTripCity());
    document.addEventListener('click',e=>{
      const f=e.target.closest('[data-shop-filter]'); if(f){setFilter(f.dataset.shopFilter);return}
      const b=e.target.closest('[data-shop-check]'); if(b){
        const c=loadChecks(),id=b.dataset.shopCheck;c[id]=!c[id];saveChecks(c);renderTop();
      }
    });
  }
  document.addEventListener('DOMContentLoaded',init);
  window.ShopFoodGuide={guide,setFilter};
})();
