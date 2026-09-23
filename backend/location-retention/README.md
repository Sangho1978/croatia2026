# 24시간 위치정보 서버 자동삭제 (MIX26)

이 함수는 `locations`와 `locationHistory`의 24시간 초과 데이터를 매시간 삭제합니다. Admin SDK를 사용하므로 Realtime Database Rules와 별도로 서버에서 정리됩니다.

## 배포

1. Firebase CLI 로그인 후 이 폴더로 이동합니다.
2. `npm install`
3. `firebase use croatia-2026-gspa` (프로젝트 별칭이 없으면 `firebase use --add`)
4. `firebase deploy --only functions:cleanupCroatiaLocations`

정기 실행 주기가 60분이므로 실제 서버 잔존시간은 대략 **24시간~25시간 이내**입니다. 앱 화면은 항상 24시간 초과 데이터를 조회/표시하지 않으며, 로그인한 각 사용자의 본인 이력도 앱이 온라인일 때 자동 정리합니다.
