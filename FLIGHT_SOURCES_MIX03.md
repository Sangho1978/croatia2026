# MIX03 항공 정보 / 예상 이동시간

조회일: 2026-09-18. 단체 전자항공권을 확인한 자료가 아닙니다. **최종 E-ticket과 항공사의 변경 통지가 우선**입니다.

|편명|출발 현지시각|도착 현지시각|소요|
|---|---|---|---|
|FR5975 FCO-DBV|10/12(월) 23:30|10/13(화) 00:50|1시간 20분|
|FR8836 ZAG-FCO|10/17(토) 22:10|10/17(토) 23:35|1시간 25분|

## 출처를 구분했습니다
- Flight.info FR5975: 2026-10-05~10-19 월요일 시간표. https://www.flight.info/FR5975
- Flightmapper FR5975 상호확인. https://info.flightmapper.net/flight/Ryanair_FR_5975
- Flight.info FR8836: 2026-10-03~10-17 토요일 시간표. https://www.flight.info/FR8836
- T'way T3/Ryanair T1은 **비공식 공항 안내의 일반 배치**입니다. 당일 배정을 보장하지 않습니다. https://www.roma-airport.com/fiumicino-fco-airlines
- ADR 공식 터미널 지도. https://www.adr.it/web/aeroporti-di-roma-en/fiumicino-shop-eat-maps
- Ryanair 공식: 수하물/체크인 카운터 2시간 전 도착, 게이트 30분 전 도착 권장. https://help.ryanair.com/hc/en-gb/articles/12890551921425-When-should-I-arrive-at-the-airport
- Ryanair 일반 bag-drop 마감: 출발 40분 전. https://help.ryanair.com/hc/en-gb/articles/12890531028497-How-far-in-advance-can-I-drop-my-bag-at-the-bag-drop-counter

## 10/12~10/13 이동 설계 (예상/추천)
19:15 FCO 도착는 기존 일정 자료를 유지했습니다. 입국·수하물 70분, T3-T1 도보 10~15분, **20:40~21:25 저녁 간단식 45분**, 21:30 재위탁, 22:30 게이트 집결으로 추천했습니다. 지연 시 식사는 포장식으로 바꾸고 수하물·탑승을 우선하세요.

DBV 00:50 도착가 정시이고 수하물/인원확인 45분, 탑승 10분, 차량 30~40분일 때 **10/13 02:15~02:25 Grand Hotel Park 도착**으로 계산했습니다. **10/12박 객실과 심야 체크인**이 필요합니다. 심야 버스·호텔 운영은 여행사 확인사항입니다.

## 10/17~10/18 이동 설계 (예상/추천)
16:30~18:00 저녁, 18:10~18:50 자그레브 시내-ZAG, 20:10 수하물 위탁 시작 목표, 21:15 게이트 집결으로 배치했습니다. 항공은 22:10-23:35이며 수하물 수령 40분, 탑승 10분, 차량 25~35분을 가정해 **10/18 00:50~01:00 The Caesar Roma 도착**로 계산했습니다. **10/17박 객실/지연 체크인**을 확인해주세요.

## 시간 구현
인천 항공시각은 `+09:00`, 로마·크로아티아 이동은 `+02:00` ISO timestamp를 사용합니다. 13일/18일 새벽 이동은 해당 현지일의 일정에 붙였습니다. 최종 항공권이 바뀌면 `data/flight-plan.js`와 표시 문구 `js/flight-details.js`를 함께 갱신하세요.
