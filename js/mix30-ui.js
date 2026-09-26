/* MIX31 UI helpers: collapsible daily journey map + compact home interactions. */
(function(){
  const ROUTE_POINTS=window.CRO_ROUTE_POINTS||{};

  let map=null;
  let mapDate='';
  let mapPoll=null;

  function operationalDay(){
    const d=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));
    if(d<days[0].date) return days[0];
    if(d>days[days.length-1].date) return days[days.length-1];
    return days.find(x=>x.date===d)||days[0];
  }

  function dayLabel(d){
    const now=(typeof localDate==='function'?localDate():new Date().toISOString().slice(0,10));
    if(now<days[0].date) return '첫날 여행일정 보기';
    if(now>days[days.length-1].date) return '마지막 여행일정 보기';
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
    if(meta)meta.textContent=d.route||d.title;
    if(date)date.textContent=d.date.slice(5).replace('-','/');
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
    if(navigator.onLine===false&&!window.google?.maps){setState('오프라인 · 지도는 인터넷 연결이 필요합니다.');const box=document.getElementById('todayJourneyMap');if(box)box.innerHTML='<div class="offline-map-placeholder compact"><b>지도 연결 필요</b><span>아래 이동지점과 상세 일정은 오프라인에서도 볼 수 있습니다.</span></div>';return;}
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
