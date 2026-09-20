# AI 영수증 판독 Firebase Function

GitHub Pages에 OpenAI API 키를 넣으면 안 됩니다. 이 함수가 서버에서만 키를 보관하고 영수증 이미지를 OpenAI Vision에 전달합니다.

## 개요
- 웹앱: Firebase 익명 인증 토큰 + 영수증 이미지 전송
- Function: Firebase 토큰 확인 → OpenAI Responses API Vision (`detail: original`) → JSON 구조화 결과 반환
- 기본 모델: `gpt-5.6-terra` (환경변수 `OPENAI_RECEIPT_MODEL`로 변경 가능)

## 배포 개요
1. Firebase 프로젝트를 Functions 사용 가능한 요금제로 준비합니다.
2. 이 폴더를 Firebase Functions 소스로 사용하거나 기존 functions 프로젝트에 `index.js` 내용을 병합합니다.
3. Secret 등록: `firebase functions:secrets:set OPENAI_API_KEY`
4. `receiptAi` 함수를 `asia-northeast3`에 배포합니다.
5. 배포된 HTTPS URL을 `js/config.js`의 `AI_RECEIPT_ENDPOINT`에 넣습니다.

예: `const AI_RECEIPT_ENDPOINT='https://asia-northeast3-croatia-2026-gspa.cloudfunctions.net/receiptAi';`

OpenAI API 사용료는 ChatGPT 구독과 별도입니다. API 키는 GitHub, HTML, JS에 절대 넣지 마세요.
