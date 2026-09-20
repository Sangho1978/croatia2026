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
