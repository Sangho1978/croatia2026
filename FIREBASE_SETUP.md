> MIX03: 최신 설정은 `FIREBASE_MIX03.md`와 `README_MIX03.md`를 우선하세요. 아래는 기존 버전 안내입니다.

# Firebase 적용 안내 · MIX01

## 기준과 보존 범위
첨부한 **화장실·추천앱 최신정보 보강판 분리형(1).zip**을 기준으로 했습니다. Firebase 프로젝트·API 키·DB 주소·TRIP_CODE는 변경하지 않았습니다. 조편성이 바뀌었지만 기존 `g1p1` 등 **사람별 슬롯 키는 그대로**입니다. 이 키를 현재 조번호로 해석하면 안 됩니다. 현재 조·직책은 roster.js에서 읽습니다. `u1~u28` 방식으로 새로 바꾸지 않았습니다.

기존 데이터는 삭제하지 마세요. `locations`, `locationHistory`, `attendanceCurrent`, `attendance` 경로를 유지합니다. 이번 버전에서 추가한 데이터 경로는 `expenses`, `financeManagers`, `photoAlbums`뿐입니다.

## 1. 기존 설정
- Authentication → Sign-in method → Anonymous를 Enabled로 유지합니다.
- 기존 Realtime Database와 Google Maps 설정을 유지합니다.
- 앱을 GitHub Pages의 HTTPS 주소로 엽니다. ZIP의 모든 파일을 동일한 배포 폴더에 올립니다.

## 2. 경비·공동앨범 규칙 추가
`firebase.rules.additions.json`에는 **새 기능에 필요한 세 개의 최상위 노드만** 들어 있습니다. 기존 Rules의 `rules` 안에 이 세 노드를 추가하고 Publish 하세요. 이 파일만 전체 Rules로 교체하면 기존 위치·출석 규칙이 사라지므로 그렇게 하면 안 됩니다.

이미 별도의 강화된 위치·출석 Rules를 사용한다면 반드시 보존하세요. 로컬 병합 도구를 제공합니다.

```sh
node tools/merge-rules.mjs existing-rules.json > merged-rules.json
```

`existing-rules.json`에는 Firebase Console에 현재 게시된 Rules를 복사해 저장합니다. 이 도구는 기존 노드를 덮어쓰거나 서버에 게시하지 않습니다. 루트에 `.read: true`, `.write: true` 또는 인증 전체 허용 조건이 있으면 자식 제한을 무력화할 수 있어 중단합니다.

`firebase.rules.compatibility.json`은 **첨부 원본의 기본 Rules에 추가 기능을 합친 완전한 참고 예제**입니다. 위치·출석에 이미 강화한 규칙이 있다면 이 예제로 전체 교체하지 마세요. 호환 예제의 기존 위치·출석 권한은 원본과 같은 익명인증 기반이며 실명 검증이나 엄격한 출석 관리자 권한을 제공하지 않습니다.

## 3. 운영진 네 기기 승인 · 최초 한 번
운영진 각자 자신의 휴대폰과 사용할 브라우저에서 로그인합니다. 더보기 → 공동경비에 표시되는 Firebase UID를 확인합니다. Firebase Console → Realtime Database → Data에 아래 경로를 **직접 추가**합니다.

```text
financeManagers
  SNU17-CRO-2026-A7K9P4
    위재복_기기의_실제_UID: "위재복"
    한상호_기기의_실제_UID: "한상호"
    장현웅_기기의_실제_UID: "장현웅"
    이상미_기기의_실제_UID: "이상미"
```

값은 Boolean true가 아니라 **정확한 이름 문자열**입니다. 위 UID 문구를 실제 UID로 반드시 바꾸세요. `financeManagers.example.json`은 모양을 보여주는 예시이며 실제 UID가 들어 있지 않습니다. 기존 DB 전체를 가져오기/교체하지 말고 해당 경로만 추가하세요.

앱의 ‘권한 다시 확인’을 누르면 승인 여부가 반영됩니다. 이름이 운영진이더라도 등록된 UID가 아니면 공유 저장은 거부됩니다. 일반 조장·교수는 운영진 권한을 자동으로 받지 않습니다.

이 승인은 **브라우저의 Firebase 익명 UID**에 대한 승인이지 이름+전화 뒷자리의 신원 보증은 아닙니다. 운영진이 브라우저를 변경하거나 사이트 데이터를 지우면 UID가 바뀔 수 있어 재승인이 필요합니다. 운영진 기기를 공용으로 사용하지 마세요. 사용하지 않는 기기 UID는 Console에서 제거합니다.

## 저장되는 경비 데이터
- 사용일·내용·분류·금액·통화·결제자·메모
- 전체 또는 개별 선택 방식
- 참여자 고정 ID와 이름·당시 조번호 목록
- 참여 인원수 (0명 불가, 전체는 교수 포함 28명)
- 최초 작성자·마지막 수정자 UID와 이름
- 서버 저장시각, 변경 버전

Rules는 등록된 운영진만 경비 읽기/쓰기를 허용하고, 참여 인원수가 등록된 명단의 실제 선택 수와 맞는지 검증하도록 작성했습니다. 저장은 한 기록 단위로 원자적으로 보내며 수정 시 ETag가 다르면 충돌로 표시합니다. 강제 덮어쓰지 않습니다. 저장 실패는 공유 성공으로 표시하지 않으며 로컬 초안으로만 남깁니다.

## 공동사진
Google Photos/Google Drive의 공유앨범 URL을 저장합니다. 앨범 링크는 로그인 사용자들이 열 수 있고, 링크 변경은 승인된 운영진만 가능합니다. 사진 원본 업로드·권한은 외부 사진 서비스에서 관리하며 Firebase Storage에 사진을 직접 올리지 않습니다.

## 검증 범위
UI와 요청/응답·동시 수정·권한 분기는 **로컬 모의 HTTP 서버**로 테스트했습니다. 실제 운영 Firebase에는 접속/저장/Rules 게시를 하지 않았습니다. Rules는 JSON/표현식 정적 검사와 정책 시나리오를 검사했으며 Firebase Emulator 설치는 네트워크 제약으로 수행하지 못했습니다. 실제 기기 두 대로 ‘운영진 저장 → 다른 운영진 조회’와 ‘일반 사용자 경비 접근 거부’를 게시 후 확인해야 합니다.

## 공식 문서
- https://firebase.google.com/docs/database/security/rules-conditions
- https://firebase.google.com/docs/reference/security/database
- https://firebase.google.com/docs/database/rest/save-data
