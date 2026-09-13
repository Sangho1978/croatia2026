# 아드리아의 길 · CROATIA 2026

GitHub Pages 배포용 정적 SPA 구조입니다.

## 구조
- `index.html`: 화면 골격
- `css/app.css`: 전체 UI
- `js/router.js`: 화면전환 + 더보기 Bottom Sheet
- `js/app-core.js`: 로그인/Firebase/위치/출석/날씨/렌더링 핵심 로직
- `js/config.js`: Firebase/Google Maps 설정
- `data/roster.js`: 원우 27명 + 인솔 교수 1명
- `data/itinerary.js`: 날짜별 일정/관광지/날씨 좌표
- `data/checklist.js`: 체크리스트
- `assets/images/`: HTML에 Base64로 들어 있던 이미지를 분리

## 핵심 UX
- 하단 핵심 메뉴: 오늘 / 일정 / 위치 / 출석 / 더보기
- 더보기: 현재 화면을 잃지 않는 Bottom Sheet
- SPA 방식: 화면을 바꿔도 페이지 전체를 다시 읽지 않음
- 일정: 선택한 날짜 패널만 렌더링/표시
- 650px+ (Z Fold 펼침 등): 더보기 메뉴 3열, 넓은 화면 최적화

## 업데이트
BUILD `20260913-r2`. CSS/JS URL에 `?v=20260913-r2`가 붙어 있어 GitHub Pages에서 소스를 바꾸었을 때 이전 캐시를 덜 타도록 구성했습니다. 다음 배포에서 강한 캐시 우회가 필요하면 index.html의 버전 문자열을 변경하세요.

> 실제 공개 배포 전에는 전화번호/생년/로그인용 전화 끝자리처럼 개인정보를 정적 JS에서 분리하는 것을 권장합니다.
