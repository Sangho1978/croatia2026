# MIX75 검증

- JavaScript syntax: PASS
- JSON files: 23 parsed
- index local refs: 106, missing 0
- Service Worker refs: 155, missing 0
- duplicate HTML ids: 0
- 티셔츠 데이터: 28명, 4개 조 × 7명
- 얼굴 파일: 28/28 존재, ASCII 파일명 사용
- 사용자 제공 v11 원본 얼굴 이미지 SHA-256 집합과 현재 28개 이미지: 완전 일치
- 티셔츠 얼굴 28개 + jeans: Service Worker CORE 사전 캐시
- Firebase attendance Croatia read rule: `auth != null` — 인증된 모든 크로아티아 접속자 공용 조회
- 각 조장: 자기 조 선택/확정/리셋 유지
- 한상호: 1~4조 선택/확정/리셋 + 4개 조 전체 초기화
- 티셔츠 메뉴: 크로아티아 전용 + 무지개 강조 스타일
