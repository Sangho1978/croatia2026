# MIX44 · Google Maps / 메뉴 정리

- 오늘/일정의 삽입형 동선 지도를 다시 Google Maps JavaScript API 기반으로 통일했습니다.
- MIX43의 OpenStreetMap/Leaflet 동선지도는 제거했습니다. 온라인에서는 Google Maps만 사용합니다.
- 인터넷이 없거나 Google Maps API 로드에 실패하면 외부 지도 대신 로컬 동선도와 명확한 오류 안내를 표시하고, `Google 지도에서 전체 동선` 버튼은 유지합니다.
- 위치공유의 실시간 지도도 Google Maps 전용으로 정리했습니다. Google Maps 오류 시 OpenStreetMap으로 자동 전환하지 않습니다.
- 전체메뉴의 `연수팀` 항목과 상단 연수팀 전환 아이콘을 제거했습니다. 팀 선택은 통합 로그인에서 자동 처리합니다.
- `추천앱`, `화장실`은 크로아티아 전용 기능으로 제한했습니다. 튀르키예 1팀 등 다른 연수팀에서는 메뉴에 표시하지 않고 직접 주소 접근도 여행정보 화면으로 돌립니다.
- 튀르키예 1팀 `전체 이동동선` 안내도 Google Maps 기준 문구로 수정했습니다.
- 서비스워커 정적 캐시를 `gspa-static-v44`로 갱신했습니다.

Firebase Rules / DB 구조는 변경하지 않았습니다.
