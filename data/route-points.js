/* MIX62: shared daily route points. `order` is the chronological display number used by schedule route maps. */
window.CRO_ROUTE_POINTS={
  '2026-10-12':[
    {order:1,n:'인천공항 T1',lat:37.4602,lng:126.4407},
    {order:2,n:'로마 FCO',lat:41.8003,lng:12.2389},
    {order:3,n:'두브로브니크 공항',lat:42.5614,lng:18.2682},
    {order:4,n:'Grand Hotel Park',lat:42.6558,lng:18.0710}
  ],
  '2026-10-13':[
    {order:1,n:'두브로브니크 구시가지',lat:42.6400,lng:18.1100},
    {order:2,n:'Poklisar · 중식',lat:42.64114,lng:18.11103,kind:'meal',mealType:'중식'},
    {order:3,n:'두브로브니크 성벽',lat:42.6412,lng:18.1077},
    {order:4,n:'스르지산',lat:42.6508,lng:18.1117},
    {order:5,n:'Grand Hotel Park · 석식',lat:42.655097,lng:18.072979,kind:'meal',mealType:'석식'}
  ],
  '2026-10-14':[
    {order:1,n:'두브로브니크',lat:42.6400,lng:18.1100},
    {order:2,n:'Hotel Plaža Duće · 석식',lat:43.4420,lng:16.6680,kind:'meal',mealType:'석식'}
  ],
  '2026-10-15':[
    {order:1,n:'두체',lat:43.4420,lng:16.6680},
    {order:2,n:'스플리트',lat:43.5081,lng:16.4402},
    {order:3,n:'트로기르',lat:43.5164,lng:16.2502},
    {order:4,n:'Hotel Trogir Palace · 중식',lat:43.51518,lng:16.2560,kind:'meal',mealType:'중식'},
    {order:5,n:'Restoran Arkada · 석식',lat:43.9386,lng:15.4429,kind:'meal',mealType:'석식',approx:true}
  ],
  '2026-10-16':[
    {order:1,n:'비오그라드',lat:43.9386,lng:15.4429},
    {order:2,n:'자다르',lat:44.1194,lng:15.2314},
    {order:3,n:'Restaurant Borje · 중식',lat:44.76549,lng:15.69079,kind:'meal',mealType:'중식'},
    {order:4,n:'플리트비체',lat:44.8808,lng:15.6163},
    {order:5,n:'Aminess Kadoor Hotel · 석식',lat:45.491699,lng:15.549174,kind:'meal',mealType:'석식'}
  ],
  '2026-10-17':[
    {order:1,n:'카를로바크',lat:45.4929,lng:15.5553},
    {order:2,n:'자그레브',lat:45.8150,lng:15.9819},
    {order:3,n:'CRO.K · 석식',lat:45.81370,lng:15.97705,kind:'meal',mealType:'석식'},
    {order:4,n:'자그레브 공항',lat:45.7429,lng:16.0688},
    {order:5,n:'로마 FCO',lat:41.8003,lng:12.2389},
    {order:6,n:'Ergife Palace',lat:41.8910,lng:12.4145}
  ],
  '2026-10-18':[
    {order:1,n:'Ergife Palace',lat:41.8910,lng:12.4145},
    {order:2,n:'로마 중심부',lat:41.9028,lng:12.4964},
    {order:3,n:'로마 FCO',lat:41.8003,lng:12.2389}
  ],
  '2026-10-19':[
    {order:1,n:'인천국제공항',lat:37.4602,lng:126.4407}
  ]
};
window.GSPA_orderRoutePoints=function(points){
  return [...(points||[])].sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999));
};
