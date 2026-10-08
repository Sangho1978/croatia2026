# MIX69 검증

- `더보기` 메뉴에서 `data-route="photos"` 0건 확인: 공동사진 메뉴 제거.
- 일정 데이터 10/12~10/19 8일 유지.
- `data/route-points.js` 8일 모두 시간순 `order: 1..N` 연속 확인.
- `js/mix36-ui.js`에서 각 날짜 패널에 `일정 동선` 지도 1개만 추가하며 경유지 목록 중복 표시는 하지 않음.
- `css/mix69-schedule-map.css` 및 HTML 내 동일 보호 CSS로 MIX64의 지도 숨김 규칙을 일정 지도에 한해 재정의.
- 하단 `위치` 메뉴/일행 위치 지도 코드는 변경하지 않음.
- JavaScript 문법 검사 통과 (`js/*.js`, `data/*.js`, `platform/*.js`, `trips/turkiye1/*.js`, `tools/*.js`, `sw.js`).
- JSON 23개 파싱 정상.
- `index.html` 로컬 src/href 96개: 누락 0.
- Service Worker CORE 120개: 누락 0.
- Service Worker 캐시명 MIX69로 갱신.
