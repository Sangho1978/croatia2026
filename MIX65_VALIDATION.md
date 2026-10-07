# MIX65 validation

- `data/itinerary.js`: 2026-10-12 ~ 2026-10-19 **8일 일정 존재**
- 일정 렌더 스모크테스트: **날짜 탭 8개 / 일정 패널 8개 생성**
- 생성 탭: `10/12, 10/13, 10/14, 10/15, 10/16, 10/17, 10/18, 10/19`
- 날짜 탭을 먼저 생성하고 날짜별 패널을 독립 렌더링하도록 변경
- 한 날짜의 호텔/관광/촬영가이드 등 부가 블록 오류가 전체 일정 렌더를 중단하지 않도록 fallback 적용
- `selectDay()` 범위를 `#dayTabs`와 `#dayPanels` 내부로 제한
- JavaScript syntax: **61 files OK**
- JSON parse: **23 files OK**
- CSS brace balance: **26 files OK**
- index.html local refs: **99 refs / 0 missing**
- HTML ids: **230 ids / 0 duplicates**
- Service Worker core refs: **116 refs / 0 missing**
- Service Worker cache: `gspa-static-v65-all-dates`
- 활성 HTML/JS/CSS/JSON에서 Rastoke/라스토케 참조: **0건**
