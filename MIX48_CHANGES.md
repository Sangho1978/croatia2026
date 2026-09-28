# MIX48 변경사항

- 튀르키예 1팀 출석 관리자: **남상모, 김수정**
  - 두 사람 모두 출석 회차 시작 / 제목수정 / 리셋 UI 사용 가능
  - 출석 회차 `createdBy`는 실제 실행자 이름으로 저장
  - 위치 전체 리셋 관리자는 기존대로 남상모, 공동경비 관리자는 기존대로 남상모·김수연 유지
- Firebase Realtime Database Rules MIX48 포함
  - `attendanceCurrent/SNU17-TURKIYE1-2026`에 남상모·김수정 시작/수정 권한 반영
- 튀르키예 1팀 전용 홈 화면 설치(PWA) 추가
  - `index.html?trip=turkiye1`에서 로그인 화면에 `홈 화면에 추가` 버튼 표시
  - 로그인 후 최초 1회 홈 화면 추가 안내 표시
  - Android Chrome의 설치 프롬프트 지원, 미지원 시 메뉴 경로 안내
  - 전용 manifest / 192·512 아이콘 / start_url을 튀르키예 1팀으로 고정
- 서비스워커 캐시 `gspa-static-v48`
