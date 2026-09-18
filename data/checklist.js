// MIX02: departure preparation only. Stable keys + exact-text legacy migration.
const CHECK_GROUPS=[
  {
    "title": "여권 · 예약 · 보험",
    "desc": "",
    "items": [
      [
        "여권 원본 · 유효기간 및 서명 확인",
        "필수",
        "prep_passport",
        "chk2_0_0"
      ],
      [
        "여권 사진면 휴대폰·클라우드 저장",
        "필수",
        "prep_passport-copy",
        "chk2_0_1"
      ],
      [
        "TW405/TW406 항공권·예약번호 저장",
        "필수",
        "prep_flights",
        "chk2_0_2"
      ],
      [
        "Ryanair 최종 편명·시간·터미널 확인",
        "필수",
        "prep_ryanair",
        ""
      ],
      [
        "모바일 탑승권 발급 일정 확인 · 발급 후 오프라인 저장",
        "필수",
        "prep_boarding",
        ""
      ],
      [
        "여행자보험 증권·긴급연락처 저장",
        "필수",
        "prep_insurance",
        "chk2_0_5"
      ],
      [
        "호텔 영문 주소·일정표 오프라인 저장",
        "필수",
        "prep_hotel-address",
        "chk2_0_6"
      ]
    ]
  },
  {
    "title": "돈 · 카드 · 통신",
    "desc": "",
    "items": [
      [
        "해외결제 가능한 신용카드/트래블카드 2장 분산 보관",
        "필수",
        "prep_cards",
        "chk2_1_0"
      ],
      [
        "비상현금 50~100€ 소액권 준비",
        "필수",
        "prep_cash",
        "chk2_1_1"
      ],
      [
        "유료 화장실용 유로 동전 준비",
        "권장",
        "prep_coins",
        ""
      ],
      [
        "카드 해외사용 알림·해외결제 차단 여부 확인",
        "필수",
        "prep_card-settings",
        "chk2_1_2"
      ],
      [
        "eSIM/로밍 신청 · 출국 전 개통 방법 확인",
        "필수",
        "prep_roaming",
        ""
      ],
      [
        "조장·운영진·교수님·여행사 연락처 저장",
        "필수",
        "prep_contacts",
        ""
      ]
    ]
  },
  {
    "title": "캐리어 · 기내 가방",
    "desc": "",
    "items": [
      [
        "티웨이·Ryanair 예약에 포함된 수하물 무게와 크기 확인",
        "필수",
        "prep_baggage",
        ""
      ],
      [
        "액체류 용기 · 투명 지퍼백 준비 및 항공 보안규정 확인",
        "필수",
        "prep_liquids",
        ""
      ],
      [
        "보조배터리 기내 반입 규정 확인 · 단자 보호 준비",
        "필수",
        "prep_battery-rules",
        ""
      ],
      [
        "캐리어 이름표·연락처 표기",
        "권장",
        "prep_tag",
        "chk2_2_4"
      ],
      [
        "캐리어 잠금장치 · 휴대용 저울 준비",
        "권장",
        "prep_lock",
        ""
      ],
      [
        "여권·상비약·충전기 등 기내 가방에 따로 정리",
        "필수",
        "prep_cabin",
        ""
      ],
      [
        "세면도구·충전기 정리용 파우치 준비",
        "권장",
        "prep_pouch",
        ""
      ]
    ]
  },
  {
    "title": "10월 옷차림 · 신발",
    "desc": "",
    "items": [
      [
        "얇은 긴팔 2~3벌",
        "날씨",
        "prep_long-sleeves",
        "chk2_3_0"
      ],
      [
        "경량패딩 또는 얇은 보온재킷",
        "날씨",
        "prep_warm-layer",
        "chk2_3_1"
      ],
      [
        "바람막이/방풍 겉옷",
        "날씨",
        "prep_windbreaker",
        "chk2_3_2"
      ],
      [
        "접이식 우산 또는 얇은 우비",
        "날씨",
        "prep_rain",
        "chk2_3_3"
      ],
      [
        "플리트비체용 미끄럼 적은 운동화/트레킹화",
        "필수",
        "prep_shoes",
        "chk2_3_4"
      ],
      [
        "여분 양말 · 젖었을 때 교체용",
        "날씨",
        "prep_socks",
        "chk2_3_5"
      ],
      [
        "모자·선글라스·선크림",
        "권장",
        "prep_sun",
        "chk2_3_6"
      ],
      [
        "스르지산·해안 바람 대비 목도리/얇은 스카프",
        "날씨",
        "prep_scarf",
        "chk2_3_7"
      ]
    ]
  },
  {
    "title": "전자기기 · 관광 용품",
    "desc": "",
    "items": [
      [
        "휴대폰 충전기·케이블",
        "필수",
        "prep_charger",
        "chk2_6_0"
      ],
      [
        "보조배터리",
        "필수",
        "prep_powerbank",
        "chk2_6_1"
      ],
      [
        "멀티어댑터 또는 C/F형 변환플러그",
        "필수",
        "prep_adapter",
        "chk2_6_2"
      ],
      [
        "멀티탭/USB 충전허브",
        "권장",
        "prep_hub",
        "chk2_6_3"
      ],
      [
        "3.5mm 이어폰 · 단체 수신기 연결 확인",
        "필수",
        "prep_earphone",
        "chk2_4_4"
      ],
      [
        "작은 크로스백/슬링백 준비",
        "권장",
        "prep_crossbag",
        ""
      ],
      [
        "500ml 물병",
        "권장",
        "prep_water",
        "chk2_4_2"
      ],
      [
        "사진 저장공간 10GB 이상 확보",
        "권장",
        "prep_storage",
        "chk2_6_4"
      ]
    ]
  },
  {
    "title": "세면 · 개인 건강",
    "desc": "",
    "items": [
      [
        "칫솔·치약·면도기 등 개인 세면도구",
        "필수",
        "prep_toiletries",
        ""
      ],
      [
        "평소 복용약 여행일수+2일분",
        "필수",
        "prep_personal-meds",
        "chk2_5_0"
      ],
      [
        "필요한 약의 처방전·영문 설명 또는 알레르기 정보 준비",
        "해당",
        "prep_med-document",
        ""
      ],
      [
        "밴드·소독티슈·물집패치",
        "권장",
        "prep_first-aid",
        "chk2_5_4"
      ],
      [
        "평소 사용하는 멀미약 등 개인 상비약 준비",
        "해당",
        "prep_motion",
        ""
      ],
      [
        "무릎·손목 등 필요한 보호대",
        "해당",
        "prep_brace",
        "chk2_5_7"
      ],
      [
        "휴대용 티슈·물티슈·손소독제",
        "권장",
        "prep_tissues",
        ""
      ]
    ]
  },
  {
    "title": "연수 준비 · 앱 점검",
    "desc": "",
    "items": [
      [
        "여행 가이드북 로그인·출석 화면 미리 확인",
        "필수",
        "prep_login-test",
        ""
      ],
      [
        "휴대폰 위치 권한과 위치공유 작동 미리 확인",
        "필수",
        "prep_location-test",
        ""
      ],
      [
        "Google Maps 오프라인 지역 저장",
        "권장",
        "prep_offline-map",
        "chk2_6_5"
      ],
      [
        "번역 앱과 필요한 언어팩 미리 준비",
        "권장",
        "prep_translation",
        ""
      ],
      [
        "내 조·발표 역할·연수보고서 주제 확인",
        "필수",
        "prep_research",
        ""
      ],
      [
        "현장 메모용 노트·펜 또는 휴대폰 메모앱 준비",
        "권장",
        "prep_memo",
        ""
      ],
      [
        "공동사진 앨범 링크와 사진 백업 방법 확인",
        "권장",
        "prep_album",
        ""
      ]
    ]
  }
];
