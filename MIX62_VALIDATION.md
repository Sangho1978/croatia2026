# MIX62 검증

- 변경 JS 6개 및 Service Worker `node --check` 통과
- JSON 23개 파싱 통과
- `index.html` 중복 ID 0개
- `index.html` 로컬 src/href 98개, 누락 0개
- Service Worker 로컬 참조 118개(고유 116개), 누락 0개
- `todayJourneyPanel` HTML 제거 확인 (기존 JS는 요소 미존재 시 안전하게 종료)
- 하단 메뉴 `지도` → `위치` 변경 확인
- 10/12~10/18 WEATHER_SPOTS 존재 확인
- 시간별 날씨: 선택 날짜의 제공 가능한 모든 hourly row를 1시간 단위로 렌더링
- 갱신 시각: `Asia/Seoul` 기준으로 표시
- 위치 거리: 로그인 사용자 최신 GPS 또는 최근 활성 캐시 위치 기준
- 동선 포인트: 날짜별 explicit `order` 정렬 후 번호 부여
- ZIP CRC 무결성 검사 완료
