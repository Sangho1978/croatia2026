# MIX22 여행 뉴스·재난 알림

## 목적
크로아티아(두브로브니크·스플리트·트로기르·자다르·플리트비체·자그레브)와 로마·Fiumicino 일정에 영향을 줄 수 있는 재난·기상·교통·파업·공항 차질·안전 뉴스를 여행 중 빠르게 확인한다.

## 동작
- 뉴스 검색: GDELT DOC 2.0 공개 뉴스 검색
- 우선 출처: HINA, HRT, ANSA, Reuters, AP, BBC, Euronews 등
- 최근 범위: 최근 7일, 국가별 최대 12건
- 갱신: 앱이 열린 상태에서 1시간마다. 앱을 다시 열었을 때 마지막 갱신이 1시간 이상 지났으면 즉시 재조회
- 번역: 영문 헤드라인을 무료 번역 서비스로 한국어 자동 번역. 실패하면 원문 제목과 `번역해서 보기` 링크를 제공
- 저장: 기사와 번역 캐시는 해당 브라우저 localStorage에만 저장

## 중요뉴스 첫 화면 노출
기사 제목에서 산불·지진·홍수·적색경보·대피·공항폐쇄·항공취소·파업·강한 폭풍·도로통제 등과 방문지를 함께 판단해 `긴급 확인`을 자동 분류한다. 최근 72시간의 긴급 확인 기사가 있으면 로그인 직후 팝업으로 노출하고 오늘 화면에도 배너를 표시한다. 같은 기사는 12시간 동안 팝업을 반복하지 않는다.

이 분류는 기사 제목을 바탕으로 한 여행 영향 선별이며, 실제 경보·대피·도로통제·운항 여부는 아래 공식기관을 최종 기준으로 확인한다.

## 공식 실시간 확인 링크
- Croatia DHMZ warnings: https://meteo.hr/naslovnica-upozorenja.php?lang=en&tab=upozorenja
- Croatia HAK traffic: https://www.hak.hr/en
- Croatia Civil Protection: https://civilna-zastita.gov.hr/en
- Italy Civil Protection: https://www.protezionecivile.gov.it/en/
- Italy MIT transport strikes: https://scioperi.mit.gov.it/mit2/public/scioperi
- Rome FCO realtime flights: https://www.adr.it/en/web/aeroporti-di-roma-en/pax-fco-realtime-flight

## 뉴스 원문/검색 출처
- GDELT: https://www.gdeltproject.org/
- HINA English: https://www.hina.hr/english
- HRT Voice of Croatia: https://glashrvatske.hrt.hr/en
- ANSA English: https://www.ansa.it/english/
- Reuters: https://www.reuters.com/
- AP: https://apnews.com/

## 제한
정적 GitHub Pages 웹앱은 브라우저/앱이 완전히 종료된 동안 1시간 주기로 백그라운드 검색을 보장할 수 없다. 이 구현은 화면이 열려 있을 때 1시간마다 갱신하며, 재접속 시 오래된 캐시라면 즉시 새로 검색한다. 진짜 백그라운드 푸시는 별도의 서버/FCM/Web Push가 필요하다.
