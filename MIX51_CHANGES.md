# MIX51 — 공통 홈 화면 설치 + 카카오톡 인앱 안내

- 크로아티아, 튀르키예 1팀, 향후 튀르키예 2팀/이탈리아 북부까지 동일한 홈 화면 설치 도우미를 사용합니다.
- 카카오톡 내장 브라우저를 감지하면 최초 1회 설치 안내창을 자동 표시합니다.
- Android 카카오톡: 다른 브라우저로 열기 → Chrome/Samsung Internet → 홈 화면 추가 안내.
- iPhone/iPad 카카오톡: Safari로 열기 → 공유 → 홈 화면에 추가 안내.
- 안내창에 현재 팀의 바로가기 주소와 `주소 복사` 버튼을 제공합니다.
- Clipboard API가 막힌 인앱 브라우저에서는 구형 복사 방식으로 한 번 더 시도하고, 둘 다 실패하면 주소 선택창을 표시합니다.
- 일반 Android Chrome/Samsung Internet, iPhone/iPad Safari도 기기별 안내문을 제공합니다.
- PWA 설치가 가능한 Android 브라우저에서는 기존 `beforeinstallprompt` 설치창을 우선 사용합니다.
- 이미 standalone/PWA로 실행 중이면 설치 안내를 표시하지 않습니다.
- Firebase Rules/DB 구조 변경 없음.
- 서비스워커 캐시: gspa-static-v51.
