# LOCATION PRIVACY MIX26 - 24시간 위치정보 보호

## 화면/클라이언트
- 상단 요약의 위치 셀을 터치하면 위치공유 ON/OFF가 즉시 바뀝니다.
- 현재위치 목록과 지도는 24시간 이내 위치만 조회/표시합니다.
- 이동이력은 본인 Firebase UID에 연결된 자기 슬롯만 읽을 수 있습니다.
- 앱이 온라인으로 연결되면 본인 이동이력 중 24시간 초과분을 자동 삭제합니다. 이를 위해 MIX26 Rules에서 본인 이력 삭제를 허용했습니다.

## 서버 자동삭제
- `backend/location-retention/`의 Scheduled Function을 배포하면 `locations`와 `locationHistory`를 매시간 검사합니다.
- 24시간 초과 항목을 Admin SDK로 삭제합니다.
- 매시간 실행이므로 서버의 실제 최대 잔존은 대략 24~25시간입니다.
- Scheduled Function을 배포하지 않은 경우에도 앱 UI는 24시간 초과 위치를 표시하지 않고, 각 사용자의 오래된 본인 이력은 그 사용자가 다시 온라인일 때 정리됩니다. 그러나 장기간 재접속하지 않는 사용자의 서버 데이터까지 자동삭제하려면 서버 함수를 반드시 배포해야 합니다.

## 적용 파일
- `firebase.rules.json`
- `js/location-session.js`
- `js/compact-header.js`
- `backend/location-retention/`
