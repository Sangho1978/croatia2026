# MIX04 - 공동경비 간편 권한

기준: croatia2026_mix03_github_pages.zip

## 변경한 부분
- 공동경비 메뉴·조회·저장·영수증·CSV: 로그인 이름이 이상미 또는 한상호인 경우만 앱에서 허용.
- 공동경비에서 financeManagers/UID 조회·등록·승인 안내 제거.
- 팀장·부팀장·총무 직책과 조편성은 유지.
- 로그인·위치·출석·일정·관광·화장실·추천앱·사진앨범 기능은 수정하지 않았습니다.

## 적용: 딸로 사람별 등록 없음
1. index.html, css, js, data, assets를 기존 GitHub Pages 위치에 덮어씁니다.
2. tools/merge-rules.html을 열고 Firebase의 현재 전체 Rules를 붙여넣으세요.
3. 변경 결과를 Firebase Console > Realtime Database > Rules에 붙여넣고 Publish합니다. 그 다음 앱을 새로고침합니다.

Firebase Anonymous는 기존대로 Enabled를 유지합니다. 경비 사용을 위한 Data/UID 등록은 필요 없습니다. 기존 경비·영수증·위치·출석 데이터는 삭제하지 마세요.

`firebase.rules.finance-simple.json`은 경비 2개 노드만 담았으므로 이 파일만 가지고 전체 Rules를 교체하면 안 됩니다. 병합 도구는 위치·출석·앨범 등 다른 규칙을 유지합니다. 서버에 접속하거나 자동으로 게시하지 않습니다.

## 중요: 화면 제한이며 실명인증이 아님
요청하신 간편 방식입니다. 이상미·한상호라는 실제 신원을 Firebase에서 검증하지 않습니다. 경비·영수증 읽기는 인증 사용자에게 열려 있으며 변조된 클라이언트는 화면 제한을 우회할 수 있습니다. 쓰기에서 기록자 이름 두 명과 UID/금액/참여자/사진 형식을 검사하지만, 클라이언트가 이름을 가장하는 것까지는 막지 못합니다. 카드번호·계좌번호 등 민감정보는 영수증에서 가려 주세요.

공동사진 앨범의 링크 편집 권한은 별도 기존 방식을 그대로 유지합니다. 영수증 사진는 공동경비와 함께 간편화했습니다.

이전 안내문은 reference_mix03에 보관했으며 현재 경비 설정 절차가 아닙니다.

## References
https://firebase.google.com/docs/database/security
https://firebase.google.com/docs/rules/basics
