# MIX45 · Google Maps 우선 + OpenStreetMap 자동 대체/복귀

## 원인 점검
- MIX38과 MIX44의 `GOOGLE_MAPS_API_KEY` 값은 동일합니다. 통합본에서 키 자체가 바뀐 것은 아닙니다.
- MIX44 화면의 회색 Google 지도 오류는 Maps JavaScript 라이브러리는 내려왔지만 실제 지도 렌더링 단계에서 인증/리퍼러/결제/할당량 계열 오류가 발생할 때 나타나는 형태입니다.
- 멀티트립 통합 후 앱 진입 URL/경로가 달라졌기 때문에 Google Cloud API 키의 HTTP referrer 제한이 과거 크로아티아 경로만 허용한다면 현재 URL이 거부될 가능성이 큽니다.
- MIX44에는 일정 지도용 로더와 위치 지도용 로더가 따로 있어 `gm_authFailure` 처리 주체가 나뉘어 있었습니다. 또한 Google JS callback 이후 늦게 발생하는 인증 실패를 일정 지도 로더가 놓칠 수 있었습니다.

## MIX45 수정
1. `js/map-provider.js`를 새로 만들고 Google Maps JavaScript API를 앱 전체에서 한 번만 로드합니다.
2. `gm_authFailure`를 페이지 수명 동안 유지하여 Google callback 뒤에 발생하는 인증 실패도 감지합니다.
3. 일정 지도/오늘 지도/실시간 위치 지도 모두 Google Maps를 첫 번째 엔진으로 사용합니다.
4. Google Maps가 실패하면 OpenStreetMap(Leaflet)으로 자동 전환합니다.
5. OpenStreetMap 표시 중 60초 간격의 저빈도 재시도로 Google Maps가 정상화되었는지 확인하고, 정상 타일이 로드되면 Google Maps로 자동 복귀합니다.
6. 인터넷 자체가 없으면 외부 지도 요청을 반복하지 않고 로컬 동선도를 표시합니다.
7. 서비스워커 캐시는 `gspa-static-v45`로 갱신했습니다.

## Google Cloud에서 확인할 항목
- Maps JavaScript API가 활성화되어 있는지
- 결제 계정이 프로젝트에 연결되어 있는지
- API 키 애플리케이션 제한이 `HTTP referrers (web sites)`인지
- 허용 사이트에 현재 GitHub Pages 주소가 포함되어 있는지
  - 권장: `https://o1978.github.io/*`
  - 별도 repository 경로로 운영하면 해당 경로도 필요에 따라 추가
- 과거 특정 경로만 등록돼 있으면 멀티트립 루트 주소를 추가

Google 설정을 수정한 뒤 페이지를 새로 열면 바로 Google Maps를 우선 시도합니다. 이미 OpenStreetMap이 표시 중인 페이지도 온라인 상태라면 자동 재시도로 Google Maps에 복귀합니다.
