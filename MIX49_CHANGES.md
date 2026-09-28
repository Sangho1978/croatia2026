# MIX49 변경사항

## 1. 모든 연수팀 홈 화면 바로가기 공통화
- 크로아티아, 튀르키예 1팀, 향후 튀르키예 2팀, 이탈리아 북부가 같은 설치 도우미를 사용합니다.
- 공통 로그인 화면에서도 `홈 화면에 추가` 버튼을 제공합니다.
- 팀별 앱으로 들어간 경우 설치 이름과 시작 URL이 해당 팀으로 자동 설정됩니다.
- 팀별 manifest를 분리했습니다.
  - `manifest-croatia.webmanifest`
  - `manifest-turkiye1.webmanifest`
  - `manifest-turkiye2.webmanifest`
  - `manifest-italy-north.webmanifest`
- 공통 포털은 `manifest.webmanifest`를 사용합니다.
- 설치 안내 문구와 localStorage 키도 팀별로 분리되어, 한 팀의 안내 확인이 다른 팀에 영향을 주지 않습니다.
- PWA 공통 아이콘 `assets/icons/gspa-192.png`, `gspa-512.png`를 추가했습니다.

## 2. 튀르키예 1팀 공동경비 관리자 확대
- 공동경비 관리자: `남상모 · 김수연 · 김수정`
- 앱 화면의 등록/수정/삭제 권한과 Firebase Rules의 경비·영수증 쓰기 검증에 김수정을 추가했습니다.
- 출석 시작/리셋 관리자는 기존대로 `남상모 · 김수정`입니다.
- 위치 전체 리셋 관리자는 기존대로 `남상모`입니다.

## 3. Firebase Rules
- 최신 전체 Rules: `firebase.rules.multitrip.MIX49.json`
- 복사용: `Firebase_Rules_MIX49_복사용.txt`
- 현재본 별칭: `firebase.rules.current.json`, `Firebase_Rules_현재_전체복사용.txt`
- 김수정의 공동경비 쓰기 권한을 실제 서버에서 허용하려면 MIX49 Rules 게시가 필요합니다.

## 4. 캐시
- 서비스워커 캐시 버전을 `gspa-static-v49`로 올렸습니다.
- 새 manifest와 PWA 공통 아이콘을 오프라인 핵심 캐시에 추가했습니다.
