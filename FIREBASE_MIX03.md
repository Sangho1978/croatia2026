# MIX03 Firebase 적용 안내

## 0. 기준판
`croatia2026_mix02_github_pages.zip`에 요청 부분만 병합했습니다. 위치·출석 식별키는 기존 값을 유지합니다. 기존 데이터를 삭제하지 마세요.

Project: `croatia-2026-gspa`  
Trip: `SNU17-CRO-2026-A7K9P4`  
Realtime Database: `https://croatia-2026-gspa-default-rtdb.asia-southeast1.firebasedatabase.app`

## 1. 공유 저장 승인 오류의 의미
이름 로그인과 Firebase 운영진 승인은 별개입니다. 운영진 이름으로 로그인해도 해당 브라우저의 Firebase UID가 승인되지 않으면 공동경비를 읽거나 저장할 수 없습니다.

인증 주체는 기기 하드웨어 ID가 아니라 **현재 브라우저의 Firebase 익명 사용자 UID**입니다. 같은 휴대폰에서도 Chrome과 카카오톡 내부 브라우저는 UID가 다를 수 있습니다. 브라우저 데이터를 삭제하면 재승인이 필요할 수 있습니다.

## 2. 익명 인증
Firebase Console > Authentication > Sign-in method > Anonymous > Enable. 기존에 켜져 있으면 유지합니다.

## 3. Rules는 현재 전체 규칙에 병합
1. Realtime Database > Rules의 현재 전체 내용을 백업합니다.
2. ZIP의 `tools/merge-rules.html`을 브라우저에서 엽니다. 현재 Rules를 붙여넣고 병합합니다.
3. 병합 결과를 검토한 뒤 Firebase Rules에 붙여넣고 Publish합니다.

Node.js 사용 시에는:
```sh
node tools/merge-rules.mjs current-rules.json > merged-rules.json
```

`firebase.rules.additions.json`은 **추가/업데이트할 금융 노드만** 담고 있습니다. 이 파일만으로 전체 Rules를 덮어쓰면 안 됩니다. 위치·출석의 기존 제한을 제거하지 마세요. 사용자 정의 금융 Rules가 있으면 병합 도구는 자동 덮어쓰기를 거부합니다.

`firebase.rules.compatibility.json`은 기존 기본구조 참고용입니다. 운영 서버에 추가한 개별 보안 규칙은 포함하지 않을 수 있어 **그대로 전체 교체용으로 쓰지 마세요.**

## 4. 운영진 UID 승인 (Data 화면)
실제 사용할 휴대폰 브라우저에서 로그인 > 더보기 > 공동경비 > 경로 복사.

Realtime Database > **Data**에서:
```text
financeManagers/SNU17-CRO-2026-A7K9P4/ACTUAL_FIREBASE_UID
```
값은 다음 중 로그인한 운영진의 **이름 문자열**입니다.
- `"위재복"`: 팀장
- `"한상호"`: 부팀장
- `"장현웅"`: 부팀장
- `"이상미"`: 총무

**Boolean `true`가 아닙니다.** `ACTUAL_FIREBASE_UID`는 예시일 뿐이므로 실제 UID로 대체합니다. Data 편집기에서 유형을 String으로 선택하고 이름을 입력하면 됩니다. 등록 후 앱의 **권한 다시 확인**을 누릅니다. 크롬에서 승인했다면 크롬에서 계속 사용하세요.

## 5. 오류 분류
|화면 안내|확인할 부분|
|---|---|
|승인 정보를 읽을 수 없음|financeManagers의 본인 UID `.read` 규칙 누락|
|승인 데이터 없음|Data에 해당 UID 등록|
|true/객체 값|이름 String으로 수정|
|이름 불일치|로그인 운영진 이름과 승인 값을 맞춤|
|승인은 통과, expenses 거부|expenses MIX03 Rules 병합 확인|
|영수증 저장 실패|expenseReceipts Rules, 사진 형식/크기 확인|

## 6. 영수증 사진 저장
영수증만 건당 3장, 장당 300 KiB(307,200 bytes) 이하 JPEG로 압축하여 **Realtime Database**에 저장합니다. Firebase Storage는 사용하지 않으므로 새 Storage 설정은 필요없습니다. 사진는 운영진만 조회합니다.

```text
expenses/<trip>/<expense-id>/receiptSummary
expenseReceipts/<trip>/<expense-id>/<batch-id>/r1..r3
```

목록에는 사진 장수만 받고, `영수증 보기`를 눌렀을 때만 사진를 불러옵니다. Base64는 압축된 JPEG보다 약 1/3 더 큰 문자열이므로 사진 3장 최대 용량은 JSON 본문 약 1.23 MB입니다(헤더 별도). 대량 여행사진용은 아닙니다.

공유 저장 실패 시 텍스트는 localStorage, 사진는 IndexedDB 초안으로 남겁니다. 원본 영수증은 별도 보관하세요. 사진 업로드 뒤 경비 갱신에서 충돌하면 연결되지 않은 사진 배치가 남을 수 있습니다. 이전 사진도 자동삭제하지 않으므로 연수 종료 후 백업하고 보관기간을 정해 정리하세요.

## 7. 위치 시작 조건
HTTPS 주소에서 로그인하면 기본적으로 위치공유를 시작합니다. 최초 브라우저 위치 허용은 필요합니다. 명시적으로 끈 사용자의 선택은 유지합니다. 화면이 열려 있을 때 5분 간격으로 전송하며 화면 잠금/백그라운드 전송을 보장하지 않습니다. 조회시간이 오래된 상대를 ON이라고 단정하지 않습니다.

## 8. 실서버 확인
이 작업에서 실제 Firebase Rules를 게시하거나 데이터를 쓰지 않았습니다. 게시 후 운영진 두 브라우저에서 영수증 1장을 저장/조회하고, 일반 사용자의 접근이 거부되는지 확인하세요.

## Official references
- https://firebase.google.com/docs/auth/web/anonymous-auth
- https://firebase.google.com/docs/database/security/rules-conditions
- https://firebase.google.com/docs/database/rest/save-data#section-conditional-requests
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
