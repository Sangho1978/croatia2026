# MIX43 · 지도/PDF/튀르키예 관광 콘텐츠 수정

## 1. 튀르키예 1팀 안내책자
- 내부 실제 파일 경로를 ASCII 이름 `docs/turkiye1_guidebook.pdf`로 변경하여 모바일/정적호스팅 경로 호환성을 높임.
- 사용자 다운로드 파일명은 `튀르키예1팀_안내책자.pdf` 유지.
- 온라인에서는 브라우저 기본 PDF 보기/다운로드를 사용하여 팝업 차단·비동기 클릭 문제를 피함.
- Service Worker가 최초 요청 성공 후 PDF를 별도 캐시에 저장. 이후 오프라인에서는 저장본 우선.
- 크로아티아도 내부 경로 `docs/croatia_guidebook.pdf`로 동일 원칙 적용.

## 2. 날짜별 동선 지도
- 오늘 화면과 일정 화면의 삽입형 지도에서 Google Maps JavaScript API 의존성을 제거.
- 인터넷 연결 시 Leaflet + OpenStreetMap으로 번호 순서 동선 표시.
- Leaflet CDN 또는 지도 타일을 못 받거나 오프라인이면 즉시 로컬 SVG 동선도로 대체.
- 실제 도로 길찾기는 기존 `Google 지도에서 전체 동선` 버튼으로 별도 제공.
- 따라서 Google Maps API 키/도메인/결제 문제로 일정 지도 영역 전체가 오류화면이 되는 문제를 차단.

## 3. 튀르키예 1팀 관광가이드
- 실제 일정 순서에 맞춰 이스탄불, 안탈리아, 파묵칼레·히에라폴리스, 에페소, 부르사 콘텐츠를 확대.
- 날짜별 관광지 카드에 큰 로컬 이미지, 핵심 설명, 관람 포인트, 공식 관광정보, 추천 영상 링크 제공.
- 추천영상 화면은 자동재생/임베드를 사용하지 않고 썸네일형 카드 → 외부 YouTube 열기 방식으로 데이터 사용 최소화.
- 보스포러스, 안탈리아, 파묵칼레, 에페소 등 GoTürkiye 공식 영상 링크를 우선 배치.

## 4. 항공사 + 편명 표기
### 튀르키예 1팀
- 에미레이트 EK323 · ICN→DXB
- 에미레이트 EK123 · DXB→IST
- 터키항공 TK2412 · IST→AYT
- 에미레이트 EK122 · IST→DXB
- 에미레이트 EK322 · DXB→ICN

### 크로아티아·로마
- 티웨이항공 TW405 · ICN→FCO
- 라이언에어 FR5975 · FCO→DBV
- 라이언에어 FR8836 · ZAG→FCO
- 티웨이항공 TW406 · FCO→ICN

일정 타임라인, 일정 흐름, 구간별 이동, 실시간 다음 일정 등에서 가능한 한 항공사와 편명을 함께 표시.

## 5. 오프라인/데이터 절약
- 일정 자체, 관광 설명, 호텔, 명단, 체크리스트, 로컬 관광이미지는 기존 오프라인 구조 유지.
- 날짜별 동선은 오프라인에서도 로컬 SVG로 표시.
- 외부 지도 타일과 YouTube는 사용자가 실제로 필요할 때만 네트워크 사용.
- 안내책자 PDF는 처음 열 때만 내려받고 이후 캐시 사용.

## 6. 검증
- 전체 JavaScript `node --check` 통과.
- 전체 JSON 파싱 통과.
- index.html 로컬 CSS/JS/img 참조 누락 0건.
- 중복 HTML id 0건.
- Service Worker CORE 참조 누락 0건.
- `turkiye1_guidebook.pdf` 56쪽 / `croatia_guidebook.pdf` 61쪽 파일 형식 확인.
- 로컬 HTTP에서 두 PDF 모두 HTTP 200 + application/pdf 응답 확인.

Firebase Realtime Database 경로/Rules는 MIX42 대비 변경하지 않음.
