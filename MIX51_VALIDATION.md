# MIX51 검증결과

- 전체 JavaScript `node --check`: 통과
- JSON / webmanifest 파싱: 통과
- index.html / trips.html 중복 ID: 없음
- 로컬 script/link/img 참조 누락: 없음
- 4개 팀별 manifest start_url 확인
  - 크로아티아: `?trip=croatia`
  - 튀르키예 1팀: `?trip=turkiye1`
  - 튀르키예 2팀: `?trip=turkiye2`
  - 이탈리아 북부: `?trip=italy-north`
- 서비스워커 캐시 버전: `gspa-static-v51`
- Firebase Rules / DB 구조: MIX50과 동일(변경 없음)

## MIX51 설치 안내 동작
- 카카오톡 UA 감지 시 최초 1회 자동 안내창 표시
- Android: Chrome/Samsung Internet 외부 열기 안내 + 주소 복사
- iPhone/iPad: Safari 외부 열기 및 공유 → 홈 화면에 추가 안내 + 주소 복사
- Clipboard API 실패 시 fallback 복사 시도 후 수동 선택창 표시
- 일반 브라우저는 기존 PWA 설치 prompt가 있으면 우선 사용
