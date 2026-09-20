# Firebase MIX14 공동경비 규칙 적용

이번 버전은 공동경비 기록에 **영수증 OCR 결과, 사용시각, 하나은행 환율, 원화 환산 추정액, 현지/한국 저장시각**을 추가로 저장합니다.

## 중요
- 기존 Realtime Database 전체 Rules를 지우지 마세요.
- `tools/merge-rules.html`을 열어 현재 Firebase Console의 Rules 전체를 붙여넣고 병합한 결과를 다시 Rules에 게시하세요.
- 이 작업은 공동경비 관련 규칙만 최신화하고 위치·출석 규칙은 보존하기 위한 것입니다.
- `firebase.rules.finance-simple.json`은 병합용 참고 규칙입니다.

## 적용 순서
1. Firebase Console → Realtime Database → Rules에서 현재 Rules 전체 복사
2. `tools/merge-rules.html` 열기
3. 현재 Rules 붙여넣기 → 병합
4. 생성된 전체 Rules 검토 후 Firebase Console에 붙여넣기 → Publish
5. 한상호 또는 이상미로 앱 로그인 → 공동경비 테스트 저장

## AI 영수증 판독
AI 영수증 판독은 Firebase Rules가 아니라 별도의 서버 함수가 필요합니다. `AI_RECEIPT_SETUP.md`를 참고하세요. API 키는 GitHub Pages의 JavaScript에 넣으면 안 됩니다.
