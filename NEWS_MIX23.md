# MIX23 연수 일정 중심 여행뉴스 UI/선별 개선

## 화면 구분
1. 최상단 `뉴스 조회 상태`
   - 정상 조회 + 중요기사 없음: `최근 7일 재난·재해·교통·파업 등 연수 일정 관련 주요 뉴스 없음`
   - 중요기사 있음: `연수 일정에 영향 줄 수 있는 주요 기사 N건을 확인했습니다.`
   - 조회 실패: `실시간 뉴스 조회 실패 — 뉴스 유무를 확인하지 못했습니다.`
   - 저장된 데이터가 있으면 마지막 정상 확인 시각과 함께 캐시를 표시한다.
2. `이번 연수 일정 기준으로 선별`
   - 10/12 로마 FCO→두브로브니크
   - 10/13~14 두브로브니크
   - 10/15 스플리트·트로기르
   - 10/16 자다르·플리트비체
   - 10/17 라스토케·자그레브·ZAG
   - 10/18 로마·FCO
3. `기사 목록`
   - 방문지/공항/이동경로와 재난·교통·파업 영향 키워드가 함께 있는 기사만 선별
   - 기사마다 관련 연수일정을 칩으로 표시
4. `공식기관 참조 링크`
   - 뉴스와 분리해 별도 섹션으로 배치
   - 뉴스 기사가 아니라 공식 경보/운항/통제 확인용 고정 링크임을 명시

## 기사 선별 정책
- 우선 출처: HINA, HRT, Jutarnji list, Večernji list, Index.hr, N1 Hrvatska, ANSA, Rai News, Corriere della Sera, la Repubblica, Il Messaggero, Reuters, AP, BBC, Euronews.
- 단순 관광 소개, 맛집, 호텔, `best beaches`, `things to do`, 관광객 기록, 홍보성 콘텐츠는 제외한다.
- 산불·홍수·지진·악천후·대피·산사태, 도로통제, 공항/항공차질, 철도/교통 파업, 페리 중단, 큰 사고 등 실제 일정 영향 키워드가 있어야 한다.
- 방문도시/공항 또는 크로아티아·이탈리아 전국 단위 강한 영향 이벤트와 연결된 기사만 남긴다.
- 최근 72시간 안의 고위험 기사 중 점수가 높은 것은 `긴급 확인`으로 분류해 로그인 직후와 오늘 화면에 우선 노출한다.

## 검색 안정성
- 1차: GDELT DOC 2.0. 기존의 한 개 긴 쿼리 대신 6개의 짧은 주제/지역 쿼리로 분리했다.
- 2차: GDELT가 전혀 응답하지 않거나 결과가 없을 때 Google News RSS를 rss2json을 통해 보조 검색한다.
- 앱이 열린 동안 1시간마다 갱신한다. 재접속 시 마지막 확인 후 1시간 이상 지났으면 즉시 재조회한다.
- 정적 GitHub Pages이므로 앱/브라우저가 완전히 종료된 동안 백그라운드 1시간 갱신은 보장하지 않는다.

## 공식기관 참조 링크
- DHMZ: https://meteo.hr/naslovnica-upozorenja.php?lang=en&tab=upozorenja
- HAK: https://www.hak.hr/en
- Croatia Civil Protection: https://civilna-zastita.gov.hr/en
- Italy Protezione Civile: https://www.protezionecivile.gov.it/en/
- Italy MIT strikes: https://scioperi.mit.gov.it/mit2/public/scioperi
- FCO realtime flights: https://www.adr.it/en/web/aeroporti-di-roma-en/pax-fco-realtime-flight

## Firebase
뉴스 기능은 브라우저 캐시(localStorage)와 공개 검색을 사용하므로 Firebase Rules 변경 없음.
