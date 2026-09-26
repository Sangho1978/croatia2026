/* MIX30 UI helpers: collapsible daily journey map + compact home interactions. */
(function(){
  const ROUTE_POINTS={
    '2026-10-12':[
      {n:'로마 FCO',lat:41.8003,lng:12.2389},
      {n:'두브로브니크 공항',lat:42.5614,lng:18.2682},
      {n:'Grand Hotel Park',lat:42.6558,lng:18.0710}
    ],
    '2026-10-13':[
      {n:'Grand Hotel Park',lat:42.6558,lng:18.0710},
      {n:'두브로브니크 구시가지',lat:42.6400,lng:18.1100},
      {n:'두브로브니크 성벽',lat:42.6412,lng:18.1077},
      {n:'스르지산',lat:42.6508,lng:18.1117}
    ],
    '2026-10-14':[
      {n:'두브로브니크',lat:42.6400,lng:18.1100},
      {n:'Hotel Plaža Duće',lat:43.4420,lng:16.6680}
    ],
    '2026-10-15':[
      {n:'두체',lat:43.4420,lng:16.6680},
      {n:'스플리트',lat:43.5081,lng:16.4402},
      {n:'트로기르',lat:43.5164,lng:16.2502},
      {n:'비오그라드 나 모루',lat:43.9386,lng:15.4429}
    ],
    '2026-10-16':[
      {n:'비오그라드',lat:43.9386,lng:15.4429},
      {n:'자다르',lat:44.1194,lng:15.2314},
      {n:'플리트비체',lat:44.8808,lng:15.6163},
      {n:'카를로바크',lat:45.4929,lng:15.5553}
    ],
    '2026-10-17':[
      {n:'카를로바크',lat:45.4929,lng:15.5553},
      {n:'라스토케',lat:45.1215,lng:15.5844},
      {n:'자그레브',lat:45.8150,lng:15.9819},
      {n:'자그레브 공항',lat:45.7429,lng:16.0688}
    ],
    '2026-10-18':[
      {n:'Ergife Palace',lat:41.8910,lng:12.4145},
      {n:'로마 중심부',lat:41.9028,lng:12.4964},
      {n:'로마 FCO',lat:41.8003,lng:12.2389}
    ],
    '2026-10-19':[
      {n:'인천국제공항',lat:37.4602,lng:126.4407}
    ]
  };

  let map=null;
  let mapDate='';
  let mapPoll=null;

  function operationalDay(){
    const d=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));
    if(d<'2026-10-12') return days[0];
    if(d>'2026-10-19') return days[days.length-1];
    return days.find(x=>x.date===d)||days[0];
  }

  function dayLabel(d){
    const now=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));
    if(now<'2026-10-12') return '첫날 여행일정 보기';
    if(now>'2026-10-19') return '마지막 여행일정 보기';
    return '오늘 여행일정 보기';
  }

  function fillPanel(){
    const d=operationalDay();
    const label=document.getElementById('todayJourneyToggleLabel');
    const meta=document.getElementById('todayJourneySummary');
    const date=document.getElementById('todayJourneyDate');
    const title=document.getElementById('todayJourneyTitle');
    const stops=document.getElementById('todayJourneyStops');
    const link=document.getElementById('todayJourneyGoogleLink');
    if(label)label.textContent=dayLabel(d);
    if(meta)meta.textContent=`${d.date.slice(5).replace('-','/')} · ${d.title}`;
    if(date)date.textContent=d.date;
    if(title)title.textContent=d.title;
    if(link){
      link.href=d.map||'#schedule';
      link.hidden=!d.map;
    }
    const pts=ROUTE_POINTS[d.date]||[];
    if(stops)stops.innerHTML=pts.map((p,i)=>`<span class="today-stop"><i>${i+1}</i>${p.n}</span>`).join('');
  }

  function setState(text){
    const e=document.getElementById('todayJourneyMapState');
    if(e)e.textContent=text||'';
  }

  function renderMap(){
    const box=document.getElementById('todayJourneyMap');
    if(!box)return;
    const d=operationalDay();
    const pts=ROUTE_POINTS[d.date]||[];
    if(!window.google?.maps){setState('Google 지도 연결 중…');return false;}
    if(!pts.length){setState('표시할 이동동선이 없습니다.');return true;}
    if(!map||mapDate!==d.date){
      mapDate=d.date;
      map=new google.maps.Map(box,{center:{lat:pts[0].lat,lng:pts[0].lng},zoom:8,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative',clickableIcons:false});
      const bounds=new google.maps.LatLngBounds();
      pts.forEach((p,i)=>{
        const pos={lat:p.lat,lng:p.lng}; bounds.extend(pos);
        const marker=new google.maps.Marker({position:pos,map,label:String(i+1),title:p.n});
        const info=new google.maps.InfoWindow({content:`<b>${p.n}</b>`});
        marker.addListener('click',()=>info.open({anchor:marker,map}));
      });
      if(pts.length>1){
        new google.maps.Polyline({path:pts.map(p=>({lat:p.lat,lng:p.lng})),geodesic:true,strokeColor:'#1769aa',strokeOpacity:.85,strokeWeight:4,map});
        map.fitBounds(bounds,38);
      }else{
        map.setCenter({lat:pts[0].lat,lng:pts[0].lng}); map.setZoom(11);
      }
    }
    setState('');
    setTimeout(()=>{try{google.maps.event.trigger(map,'resize')}catch(_){ }},80);
    return true;
  }

  function ensureMap(){
    if(renderMap())return;
    try{ if(typeof locLoadGoogleMap==='function') locLoadGoogleMap(); }catch(_){ }
    clearInterval(mapPoll);
    let tries=0;
    mapPoll=setInterval(()=>{
      tries++;
      if(renderMap()||tries>=40){
        clearInterval(mapPoll);mapPoll=null;
        if(tries>=40&&!window.google?.maps)setState('Google 지도 연결이 지연됩니다. 아래 버튼으로 전체 동선을 열 수 있습니다.');
      }
    },500);
  }

  function init(){
    fillPanel();
    const panel=document.getElementById('todayJourneyPanel');
    if(panel){
      panel.open=false;
      panel.addEventListener('toggle',()=>{if(panel.open){fillPanel();ensureMap();}});
    }
    window.addEventListener('hashchange',()=>{if(location.hash==='#today'||!location.hash){fillPanel();if(panel?.open)ensureMap();}});
    setInterval(()=>{fillPanel(); if(panel?.open&&mapDate!==operationalDay().date){map=null;ensureMap();}},60000);
  }

  document.addEventListener('DOMContentLoaded',init);
})();
