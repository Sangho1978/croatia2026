# MIX19 공동경비 삭제 검증

## 확인된 원인
기존 삭제는 과거 경비 레코드 전체를 최신 스키마로 다시 PUT했습니다. 예전 기록에 최신 필수필드(예: merchant 등)가 없으면 Firebase가 레코드 전체를 다시 검증하면서 삭제 표시 업데이트까지 거절할 수 있었습니다.

## 수정
- 삭제는 전체 PUT이 아니라 tombstone/audit 필드만 PATCH합니다.
- deleted=true, deletedAt, deletedBy, deletedByName, deletedClock, updatedAt/By, revision만 갱신합니다.
- Firebase Rules에 삭제 전용 write/validate 분기를 추가해 과거 레코드도 삭제 표시할 수 있게 했습니다.
- 삭제된 기록은 activeRecord()에서 제외되어 날짜별 장부, 합계, CSV, Excel 정산에 즉시 포함되지 않습니다.

## UI 모의 Firebase 검증
과거 스키마 예시(merchant 없음)를 사용해 Chromium에서 직접 클릭 테스트했습니다.
- 한상호: 삭제 버튼 1개 -> PATCH 1회 -> 장부에서 0건, 오류 0
- 이상미: 삭제 버튼 1개 -> PATCH 1회 -> 장부에서 0건, 오류 0
- 김남구: 삭제 버튼 0개 -> PATCH 0회 -> 기록 유지, 오류 0

운영 Firebase에는 실제 삭제 테스트를 수행하지 않았습니다. 최신 firebase.rules.json을 Realtime Database Rules에 게시한 뒤 실제 기록 한 건으로 최종 확인해야 합니다.
