# MIX60 validation

- 날씨 상세 UI: 기본예보 / 모델 교차검증 / 공식기관·외부비교 영역 존재 확인.
- Open-Meteo 모델 ID: ECMWF `ecmwf_ifs025`, GFS `ncep_gfs_seamless`, ICON `icon_seamless` 사용.
- 변동성 기준: 최고기온 3°C 이상 또는 강수확률 40%p 이상 확인.
- 예보 기간 분기: 0~3일 / 4~7일 / 8~15일 / 범위 밖 분리 확인.
- 8일 이상: 시간대별 가상값 미표시, 장기 경향만 표시.
- 크로아티아 공식 링크: DHMZ 예보·특보 확인.
- 로마 공식 링크: MeteoAM Lazio 확인.
- Meteoblue 외부 비교 링크 확인.
- JavaScript 전체 문법 검사: PASS.
- index.html 중복 ID: 없음.
- index.html 로컬 script/link 참조: 누락 없음.
- Service Worker CORE 로컬 참조: 114개, 누락 없음.
- Service Worker cache: gspa-static-v60.
- 라스토케 활성 일정/동선 참조: 0건 유지.
