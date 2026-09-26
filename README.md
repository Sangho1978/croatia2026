# MIX30 - field-first UI / collapsible daily route map

Base: MIX29. Build: 20260926-MIX30.

- Today screen uses the field-first layout.
- New top `오늘 여행일정 보기` card is collapsed by default; when opened it shows the daily Google Maps route with numbered stops.
- Fast actions are reduced to Attendance / Group Location / Emergency.
- Duplicate status cards and repeated instructional copy are visually removed, while all underlying features and DOM hooks are preserved.
- Tourist history, attraction details, prices, booking links and map links remain.
- The compact header keeps one obvious location ON/OFF switch.
- Location retention remains 24 hours.
- `앱 · 여행 안내` is renamed to `여행 정보`.
- Firebase Rules and database structures are unchanged from MIX29.

Deploy the entire ZIP at the existing site root.

---

# MIX07 - contrast, emergency contact, app-wide location

Base archive: croatia2026_mix06_under100_github_pages.zip (54 files).
Output archive: croatia2026.zip (same 54 deployment files).
Build: 20260919-MIX07

Changes limited to:
- index.html: build marker, cache keys for three changed resources, clearer location help.
- css/usability.css: scoped high-contrast white text on the Today itinerary hero.
- js/usability.js: add deputy leader Jang Hyeon-ung from the existing roster.
- js/location-session.js: single app-session send/read loops across all SPA views;
  preserve explicit OFF, stop publishing while browser document is hidden;
  resume on focus/pageshow/visibility/online. No route restarts the publish clock.
- README.md: this release note.

Unchanged: Firebase rules, config/API keys, member IDs, group data, itinerary,
attendance, expenses/receipts, photos, toilet/app information, images.
No database reset and no Firebase Rules update are required by this patch.

Deploy all ZIP contents at the existing site root, preserving folders.
The ZIP has index.html at the root, not inside a second parent folder.
No live Firebase data was written and no Rules were published during testing.

## Location behaviour
After login, sharing starts unless the user previously selected OFF.
Publishing is every 5 minutes while this app is visible, in ANY menu.
Roster reads run every 2 minutes in any menu. This does not require the map tab.
Background apps, screen lock and browser close are not continuous GPS modes.
Location permission and an internet connection remain required.

## Previous release notes (retained)

# MIX06 상단 간소화 · 환율 · 위치 복귀

기준 원본: croatia2026_mix05_github_pages.zip
빌드: 20260919-MIX06

## 적용
ZIP을 풀어 index.html, css, js, data, assets를 기존 GitHub Pages 경로에 함께 덮어씁니다.
새 파일: css/compact-header.css, js/compact-header.js, js/fx-service.js, js/runtime-support.js.
기존 js/app-core.js, js/net-meter.js, js/location-session.js도 교체합니다.
Firebase Rules는 변경하지 않았습니다. 기존 출석·경비·영수증·위치 데이터를 삭제하지 마세요.

## 상단
처음에는 작은 한 줄입니다. 오른쪽 화살표로 펼치고 접을 수 있습니다.
접힘: 날씨 / 현지·한국 시각 / EUR-KRW / 위치 ON-OFF / 데이터 요약.
펼침: 날짜·시각, 환율 기준일·수신시각·출처, 새로고침, 데이터사용누적, 위치 제어, 계정, 긴급, 글자 크기.

## 환율
기존 .app 주소 한 곳 + 실패 시 1,555원 고정값을 제거했습니다.
최신 공시값을 Frankfurter ECB v2 -> v1 -> ExchangeRate-API 순서로 조회합니다.
기준환율은 매초 변하는 시세가 아닙니다. 공시 주기를 표시하고 앱은 1시간에 한 번 확인합니다.
정상 수신값만 저장합니다. 연결 실패는 실패로 표시하고, 저장값을 새 환율처럼 표시하지 않습니다.
환율이 보이지 않으면 상단 펼침 -> 환율 새로고침 -> 환율 출처·연결 확인을 보세요.

## 데이터사용누적
MIX06을 처음 연 때부터 같은 브라우저에서 누적합니다. 이전 버전의 과거 사용량은 복원하지 않습니다.
fetch 요청·응답 본문 추정치이며 통신사 청구량이 아닙니다.
HTML/CSS/JS, 지도 타일, TLS/헤더, SSE 스트림, 외부 앱 사용량은 제외됩니다.

## 위치
로그인 후 기존처럼 위치공유를 시작합니다. 직접 OFF한 선택은 유지됩니다.
앱으로 복귀하면 이전 전송이 45초 이상 지났을 때 새 위치를 확인하고, 일행 목록도 최신화합니다.
위치 화면의 '화면 켜두기'는 지원 브라우저에서 화면 꺼짐을 줄이는 선택 기능입니다.
이것은 백그라운드 GPS가 아닙니다. 다른 앱·잠금·종료 상태의 지속 전송은 HTML/PWA만으로 보장할 수 없습니다.
네이티브 앱 개발 또는 Google Maps의 별도 위치 공유가 필요합니다. Google Maps 공유는 이 앱 Firebase와 자동 연동되지 않습니다.

## 보존
조편성·직책·로그인·출석·경비·영수증·사진·일정·관광·화장실·앱·준비물 데이터는 MIX05를 유지합니다.
기존 관광정보의 출처일을 이번 수정으로 새로 갱신한 것은 아닙니다.


## MIX08 - 2026-09-19 / UI clarity only

- Header: explicit Expand / Collapse labels with filled triangle icons and contrasting states.
- Reopening the header resets its own scroll to the top; closing restores keyboard focus.
- Shared disclosure indicators for guide details, location settings, history and other details.
- Selected navigation / tabs / filters now have stronger contrast; tabs also use a check mark.
- Group navigation now uses a people icon. ON / OFF / attention have text and distinct symbols.
- Short landscape navigation rail fits all five targets.
- No changes to data, Firebase rules, credentials, location timers, attendance or finance services.

Deploy all files with the same paths. The ZIP still has 54 files.
Cache versions were changed for css/compact-header.css and js/compact-header.js only.
Preview screenshots use mock FX, GPS, and database responses (not live participants).


## MIX10 UI feedback
- 위치 현황 4개 세로형 카드를 3개 핵심 수치 + 최근 조회 한 줄 구조로 변경
- 위치 빠른 실행 버튼에 처리중/완료/실패 피드백과 하단 토스트 추가
- 지도 열기 버튼은 열린 상태에서 `지도 닫기`로 변경
- 거리/위치공유 설명은 기본 접힘으로 변경
- 기존 관광 가이드, 일정, Firebase 저장 경로와 데이터 구조는 변경하지 않음

## MIX11 · 하나은행 환율 / 위치시각 / 발표표시
- 상단 환율은 ECB 일반 환율이 아니라 하나은행 EUR 매매기준율 전용으로 변경했습니다.
- 기본 15분 확인, 공개 중계 실패 시 마지막 정상 하나은행 값 또는 `data/hana-eur.json` 스냅샷을 사용합니다.
- 서버/API-ON 프록시가 있으면 `js/config.js`의 `HANA_FX_ENDPOINT`에 URL만 지정할 수 있습니다.
- 예상날씨 온도 카드의 숫자·카드 간격을 축소했습니다.
- 지도 조별 명단에서 모든 사람 이름 아래에 최근 수신 시각(현지/한국)을 표시합니다.
- 변태윤 조장은 `조장`과 `발표` 배지를 함께 표시하며, 팀원 명부의 모든 발표자도 `발표` 배지를 표시합니다.


## MIX12 출석·위치 표시 보강
- 출석 분류: 버스탑승 / 장소집결 / 식사 / 기타, 관리자 제목 편집
- 28/28 체크 시 화면상 자동 완료(자동 종결) 처리. 기존 Firebase 경로와 Rules 변경 없음.
- 출석 시작/완료는 실시간 앱 내부 알림. 사용자가 알림 권한을 켜면 앱이 실행 중인 동안 Service Worker 시스템 알림도 시도.
- 앱이 완전히 종료·정지된 상태의 진짜 푸시는 현재 정적 GitHub Pages+Realtime Database 구조만으로는 불가하며 Web Push/FCM 발송 백엔드가 필요.
- 지도 개인 최근시각은 좌표가 한국이면 한국시간, 크로아티아/이탈리아면 해당 현지시간 하나만 표시.
- 출석 명단에서 변태윤은 조장+발표를 동시에 표시.

## MIX13 공동경비 UX (2026-09-20)
- 공동경비를 `경비 등록` / `날짜별 장부`로 분리
- 영수증 촬영/이미지 선택 시 브라우저에서 OCR을 실행해 날짜·사용처·금액·통화·분류를 자동 입력
- 자동 입력칸은 노란색으로 표시하며 저장 전 사람이 직접 수정 가능
- OCR 원문은 Firebase에 저장하지 않고, 확인한 필드와 OCR 사용 여부/신뢰도만 경비 기록에 저장
- 날짜별로 건수·EUR 합계·KRW 합계를 조회하고 10/12~10/19 날짜 탭으로 빠르게 이동
- 기존 Firebase `expenses` 및 `expenseReceipts` 경로 유지. 기존 Rules 변경 없음
- OCR은 처음 사용할 때 Tesseract.js 모듈을 외부 CDN에서 불러오므로 인터넷 연결이 필요하며, 실패해도 수동 입력과 영수증 저장은 계속 가능


## MIX14 공동경비 개선
- 영수증 AI 비전 판독 endpoint 지원 + 기기 OCR fallback
- 사용일/시각/상호/최종금액/통화/분류 자동 추출 후 수동 수정
- EUR 지출은 하나은행 매매기준율 기준 원화 환산 추정값을 저장
- 최근 출석체크 명단을 공동경비 참여자로 한 번에 불러오기
- 자동 얼굴 식별은 사용하지 않음
- MIX14 공동경비의 추가 저장필드(사용시각·OCR 방식/신뢰도·하나환율·원화추정·현지/한국 저장시각)를 허용하도록 경비 Rules도 갱신했습니다. 기존 전체 Rules를 덮어쓰지 말고 `tools/merge-rules.html`로 한 번 병합해 게시하세요. 자세한 내용은 `FIREBASE_MIX14.md` 참고.

## MIX15 · 영수증 OCR 재설계
- 사용자 제공 실제 영수증 5장으로 방향·금액·날짜 판독을 재검증했습니다 (`OCR_SAMPLE_VALIDATION.md`).
- 저장용 300KB 사진이 아니라 촬영 원본에서 OCR용 고화질 이미지를 임시 생성합니다.
- 자동 회전(0/좌90/우90/180) + 일반 OCR + 적응형 고대비 2차 OCR + 날짜 하단 보정으로 변경했습니다.
- SUBTOTAL/VAT 대신 IMPORTO PAGATO/ZA PLACILO/SKUPAJ/SUM 같은 최종결제 표지를 우선합니다.
- Tesseract worker를 재사용해 회전 재판독 때 OCR 엔진을 매번 새로 다운로드하지 않습니다.
- AI receipt endpoint가 설정되어 있으면 AI 비전을 우선 사용하고, 실패하면 MIX15 로컬 OCR로 자동 전환합니다.


## MIX16 공동경비 조회·영수증 시간 보정
- 공동경비 장부는 로그인한 28명 모두 조회 가능. 등록·수정은 이상미·한상호만 가능.
- 영수증 사용시각은 영수증 날짜와 같은 줄/인접 줄의 시간을 우선하고 승인코드·카드단말기 시간 후보를 감점.
- OCR 화면에는 초가 인식되면 초까지 표시하되 장부 입력은 기존 Firebase 규칙과 호환되는 HH:MM으로 저장.
- 참석자 표기는 `참석명단`으로 통일.
- 날짜별 장부의 기본 날짜는 현재 GPS가 한국이면 한국 날짜, 크로아티아/이탈리아면 현지 날짜. 저장 기록 자체는 사용일(date) 기준으로 묶음.


## MIX17 공동경비 등록 표시 수정
- 한상호·이상미 로그인 시 공동경비 `경비 등록` 탭과 입력 패널이 정상 표시되도록 finance-manager 상태 연결 수정.
- 일반 참가자는 기존대로 날짜별 장부 조회만 표시.
- Firebase Rules/저장경로/기존 데이터 변경 없음.


## MIX18 공동경비 장부/정산
- 장부는 저장일이 아니라 **사용일(date)** 기준으로 묶고 날짜 탭에도 실제 사용일을 추가합니다.
- 한상호·이상미는 건별 `삭제` 가능. 삭제는 사고 방지를 위해 soft-delete이며 합계/조회/Excel에서 제외됩니다.
- 각 기록에 등록(저장) 시각과 마지막 수정 시각을 현지/한국 기준으로 표시합니다.
- `Excel 정산파일`은 오프라인에서도 실제 `.xlsx`를 생성하며 4개 시트를 포함합니다: 경비내역, 참여자별상세, 참여자별정산, 참여자명단.
- 참여자별 분담액과 요약 합계는 Excel 수식과 계산값을 함께 기록합니다.


## MIX19 공동경비 삭제 수정
- 기존 전체 레코드 PUT 삭제표시를 부분 PATCH 방식으로 변경했습니다.
- 과거 스키마로 저장된 경비도 merchant/OCR/환율 필드 차이 때문에 삭제가 막히지 않도록 Rules의 삭제 분기를 분리했습니다.
- 삭제는 soft delete이며 날짜별 장부/합계/CSV/Excel 정산에서 제외됩니다.
- 한상호·이상미만 앱 UI에서 삭제할 수 있습니다.

## MIX20 공동경비 날짜 탭 정렬
- 공동경비 날짜 선택 탭을 왼쪽의 과거 날짜에서 오른쪽의 최신 날짜로 오름차순 정렬합니다.
- 실제 사용일(date) 데이터가 있는 여행기간 밖 날짜도 동일한 순서에 포함합니다.

## MIX21 긴급·비상 해외대응 메뉴 (2026-09-20 확인)
- 긴급 메뉴에서 참가자/운영진/여행사 연락처를 제거하고 실제 해외 긴급 대응용 정보만 남겼습니다.
- 크로아티아·이탈리아 112 및 현지 직접 긴급번호, 주크로아티아/주이탈리아 대한민국 대사관, 외교부 영사안전콜센터를 공식기관 자료로 재검증했습니다.
- 여권 분실·도난, 가방/지갑/휴대전화/카드 분실, 응급질환/교통사고, 범죄피해, 일행 실종, 재난 상황별 대응 절차를 추가했습니다.
- 로마 FCO 및 자그레브 공항 공식 분실물 페이지/연락처, 크로아티아 HR112 Upozorenje, 이탈리아 112 Where ARE U 및 IT-alert 링크를 제공합니다.
- 112 신고 시 바로 읽을 수 있는 영어 전달 순서 예문을 추가했습니다.
- Firebase 데이터/Rules는 변경하지 않습니다. 자세한 출처는 `EMERGENCY_MIX21.md` 참고.

## MIX22 여행 뉴스·재난 알림
- `더보기 → 실시간 뉴스`에서 크로아티아 방문도시와 로마·FCO 관련 최근 7일 주요 뉴스를 확인합니다.
- HINA·HRT·ANSA·Reuters·AP 등 주요 출처를 GDELT 공개 검색으로 조회하고 국가별 최대 12건을 표시합니다.
- 영어 제목은 한국어로 자동 번역하고 원문 제목·원문보기·번역해서 보기 링크를 함께 제공합니다.
- 산불·지진·홍수·대피·공항폐쇄·항공차질·파업·강풍·도로통제 등 일정 영향도가 높은 최근 72시간 기사는 로그인 직후 팝업과 오늘 화면 배너로 우선 노출합니다.
- DHMZ·HAK·Croatia Civil Protection·Italy Protezione Civile·MIT 파업 일정·FCO 실시간 항공편 공식 링크를 함께 제공합니다.
- 앱이 열린 동안 1시간마다 갱신하며, 다시 열었을 때 캐시가 1시간 이상 오래되면 즉시 새로 검색합니다. 정적 PWA가 완전히 종료된 동안의 백그라운드 검색은 보장하지 않습니다.
- Firebase 데이터/Rules 변경 없음. 세부 동작과 공식 링크는 `NEWS_MIX22.md` 참고.

## MIX23 뉴스 UI·연수 일정 선별 개선
- 뉴스 조회 결과를 `정상-주요뉴스 없음 / 주요기사 있음 / 조회 실패`로 명확히 구분합니다. 조회 실패를 뉴스 없음으로 표시하지 않습니다.
- 10/12~10/18 실제 방문도시·FCO/DBV/ZAG 공항·이동경로와 재난/교통/파업 키워드를 함께 대조해 연수 일정 관련 기사만 표시합니다.
- 단순 관광·맛집·호텔·홍보성 기사는 제외하고 HINA/HRT/크로아티아 주요언론, ANSA/Rai/이탈리아 주요언론, Reuters/AP/BBC/Euronews 등을 우선합니다.
- 기사 카드에 `10/16 자다르·플리트비체`처럼 어느 연수일정과 관련되는지 표시합니다.
- 공식기관 링크는 기사 목록 아래 `공식기관 참조 링크`로 분리하고 뉴스가 아닌 고정 확인 링크임을 명시했습니다.
- GDELT 검색을 짧은 지역/주제 쿼리로 나누고, 전면 실패 시 Google News RSS 보조 검색을 시도합니다.
- Firebase 데이터/Rules 변경 없음. 세부 기준은 `NEWS_MIX23.md` 참고.

## MIX24 · 먹거리·쇼핑 (2026-09-20)
- 더보기 → 현장·여행 → `먹거리·쇼핑` 메뉴 추가.
- 실제 연수 일정별 두브로브니크 / 스플리트·트로기르 / 자다르 / 자그레브 / 로마 필터.
- 꼭 먹기, 10월 제철, 쇼핑품목, 실제 동선상 시장·매장 지도 링크, 공식 관광청 근거 제공.
- 한국인 여행 후기에서 반복되는 선물 품목은 실용 추천 배지로 구분하되 통계 순위로 표현하지 않음.
- 생과일·육가공품 등 한국 귀국 검역 주의와 주류 면세범위 안내 추가.
- 쇼핑 TOP 6 체크 상태는 브라우저 localStorage에 저장.


## MIX25 위치정보 개인정보 보호
- 일행의 현재 위치는 최근 24시간 이내 데이터만 화면에 표시합니다.
- 이동이력은 Firebase Rules에서 본인 UID의 slot만 읽을 수 있고, 앱에서는 최근 24시간만 지도에 표시합니다.
- 개인별 위치 이력 목록/전화 기능은 위치 화면에서 제거하고, 본인만 `내 이동이력` 버튼으로 지도에서 확인합니다.
- 한상호 관리자에게만 `전체 위치정보 리셋` UI가 표시됩니다. 리셋 시 현재 위치 + 전체 이동이력 + 소유 바인딩을 삭제하고 reset 신호를 남겨 각 기기의 자동 재전송을 중지합니다.
- 이 변경은 최신 `firebase.rules.json` 게시가 필요합니다.


## MIX26 · 2026-09-23 · 09/22 안내소책자 + 위치 24시간 보호
- 안내소책자 09/22 기준 10/12~10/19 공식 일정, 항공편, 확정 호텔을 반영했습니다.
- `필수안내` 메뉴에 수하물·환전/팁·날씨/옷차림·화장실·EES/ETIAS·안전·대사관·수신기·준비물을 추가했습니다.
- 상단 `위치 ON/OFF` 셀은 지도 이동 링크가 아니라 즉시 토글되는 스위치입니다.
- 화면은 24시간 이내 위치만 표시하고, 각 사용자의 본인 이동이력은 온라인 연결 시 24시간 초과분을 삭제합니다.
- 전체 서버 데이터를 24시간 정책으로 자동 정리하려면 `backend/location-retention/` Scheduled Function을 배포해야 합니다. 실행주기 60분 때문에 서버 잔존은 대략 24~25시간입니다.
- Firebase Rules는 MIX26의 `firebase.rules.json`으로 교체해야 클라이언트의 본인 이력 삭제가 허용됩니다.
- 소책자 p.29(C핀)과 p.30(5핀)의 수신기 충전단자 표기는 서로 달라 앱에서 임의 수정하지 않고 “최종 확인 필요”로 유지했습니다.


## MIX27 · 2026-09-23 · Google Maps 우선 + 필수안내 통합
- 위치 지도는 Google Maps를 기본 엔진으로 유지합니다. 6.5초 강제 전환을 제거하고 20초까지 기다린 뒤 연결이 지연되면 OpenStreetMap을 임시 표시합니다. Google Maps가 뒤늦게 로드되면 자동 복귀합니다.
- 위치 화면에 `Google 지도 다시 연결` 버튼을 추가했습니다. API 인증/도메인/네트워크 오류 시에도 사용자가 직접 재시도할 수 있습니다.
- 별도 `필수안내` 메뉴와 guidebook 전용 JS/CSS/data 파일을 제거했습니다.
- 09/22 소책자 내용은 기존 화면에 통합했습니다: 확정 일정→`일정`, 수하물/준비물/수신기→`여행준비`, 호텔→`호텔`, 대사관/분실→`긴급·비상`, 화장실→`화장실`, Tax Refund/결제→`먹거리·쇼핑`, EES/ETIAS·시차·전압·버스 타코그래프→`앱·여행 안내`.
- 기존 `#/guidebook` 링크는 `앱·여행 안내`로 자동 연결됩니다.

## MIX31 (2026-09-26)
- 안내소책자 보기/다운로드를 일정 상단 한 줄 버튼으로 정리
- 반복 연도·날짜 표시 최소화
- 오늘 화면의 다음 일정 30초 자동 갱신 및 미정 시각 일정의 `예상` 구분
- 오늘 숙박 호텔 바로가기 추가
- 날짜별 일정 상단에 숙박 호텔 핵심정보 추가
- 숙박호텔 메뉴를 각 호텔 공식 사이트 기준 주소·전화·특징으로 전면 갱신
- Ergife Palace 공식 사진 연결 및 이미지 실패 fallback 추가

## MIX31 · 2026-09-26 · 일정·호텔 UX 정리
- 첫 화면 안내소책자 보기/다운로드를 한 줄 링크로 축소하고, 일정 화면도 한 줄 2버튼으로 정리.
- 날짜 탭 아래 날짜 중복과 불필요한 사용설명 문구를 줄이고 관광지 설명은 유지.
- `오늘 → 다음 일정`을 30초마다 현재 시각 기준 갱신하고, 자정 이후 다음 일정까지 연속 표시.
- 날짜별 일정 최상단에 오늘 숙박호텔 핵심정보 배치.
- 호텔 메뉴에 입국심사용 ACCOMMODATION 요약(숙박일·영문명·주소·전화) 추가.
- 5개 호텔 주소·연락처·특징을 공식 홈페이지 기준으로 재확인.
- Ergife Palace 외관 사진을 안내소책자 원본에서 로컬 이미지로 포함.
- Firebase 데이터/Rules 변경 없음.


## MIX32A (2026-09-26)
호텔 정보 카드 통합, 안내소책자 버튼/일정 중복 정리, 모바일 overflow/zoom 보완.


## MIX33 (2026-09-26)
두 UI 통합 스위치, 해외 저데이터 cache-first, 안내소책자 local-first 캐시를 적용했습니다.


## MIX34 · dual UI differentiated + offline-first

- MIX33 재검토 결과, 카드형이 첫 화면/관광가이드 위주의 CSS 차이만 있어 일정 화면 체감 차이가 작았던 문제를 수정.
- 우측 상단 아이콘으로 기존형(field) / 카드형(visual) 즉시 전환, 선택값은 기존처럼 localStorage 유지.
- 기존형은 MIX33 현장 운영 UI를 그대로 유지.
- 카드형 일정: 날짜별 대형 여행지 사진 hero, 한 줄씩 크게 읽는 타임라인, 1열 대형 관광지 카드, 사진+설명 중심 장스크롤 구성.
- 카드형 관광가이드: 도시별 대형 사진(300~560px), 상세 설명 자동 펼침, 명소를 잡지형 1열 읽기 흐름으로 구성.
- 카드형 호텔: 사진 높이 확대 및 카드 여백 강화.
- 오프라인: 서비스워커가 index/CSS/JS/data 핵심 파일을 첫 온라인 접속 후 캐시. PDF는 11MB라 자동 캐시하지 않고 사용자가 처음 열 때만 저장.
- 오프라인에서 일정/관광/호텔/준비물/명부/긴급전화 등 로컬 정보는 사용 가능.
- 인터넷 필수 기능(Firebase 출석·위치·공동경비·공동앨범, Google Maps, 실시간 날씨·환율·뉴스, 외부 사이트)은 즉시 '인터넷 연결 필요' 메시지를 표시하고 긴 타임아웃을 기다리지 않음.
- 날씨는 오프라인 시 저장값 또는 장기 참고값으로 대체. 환율은 네트워크가 없고 캐시도 없으면 번들된 마지막 하나은행 스냅샷 사용. 뉴스는 저장된 마지막 조회분만 표시.
- Google Maps/OSM은 오프라인에서 로드 시도 자체를 중지하고 일정 텍스트/지점 목록은 계속 표시.
- 안내소책자는 Cache Storage 저장본 우선. 오프라인인데 저장본이 없으면 네트워크 이동 대신 명확한 안내를 표시.
- 외부 웹 링크는 오프라인에서 빈 화면으로 이동하지 않고 인터넷 연결 필요 토스트 표시.
- 좁은 화면/Fold의 가로 넘침 방지 CSS 보강.
- Firebase Rules와 데이터 구조는 변경하지 않음.


## MIX35 FINAL (2026-09-26)
Croatia single-UI finalization. See `MIX35_FINAL_CHANGES.md`. Card/visual switch removed; Fold/tablet responsive and MIX34 offline-first behavior retained.
