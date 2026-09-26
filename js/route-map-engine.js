/* MIX45 route map engine.
 * Preferred engine: Google Maps.
 * Fallback while Google is unavailable: OpenStreetMap/Leaflet.
 * Offline: local zero-data schematic.
 * When Google recovers, an OSM map is replaced automatically.
 */
(function(){
  'use strict';

  const records=new Map(); // box -> {engine,map,markers,line,retryTimer,pts,opt}
  let leafletPromise=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function cleanupRecord(box,keepRetry=false){
    const rec=records.get(box);
    if(!rec)return;
    try{
      if(rec.engine==='google'){
        (rec.markers||[]).forEach(m=>m.setMap?.(null));
        rec.line?.setMap?.(null);
      }else if(rec.engine==='osm'&&rec.map){
        rec.map.remove?.();
      }
    }catch(_){ }
    if(rec.retryTimer&&!keepRetry)clearTimeout(rec.retryTimer);
    if(!keepRetry)records.delete(box);
  }

  function destroy(box){
    if(!box)return;
    cleanupRecord(box);
    box.innerHTML='';
  }

  function schematic(box,pts,label,note){
    if(!box)return 'schematic';
    cleanupRecord(box);
    box.innerHTML='';
    const list=Array.isArray(pts)?pts.filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng)):[];
    if(!list.length){box.innerHTML='<div class="route-local-empty">표시할 이동지점이 없습니다.</div>';return 'schematic';}
    const W=640,H=300,pad=42;
    let minX=Math.min(...list.map(p=>+p.lng)),maxX=Math.max(...list.map(p=>+p.lng));
    let minY=Math.min(...list.map(p=>+p.lat)),maxY=Math.max(...list.map(p=>+p.lat));
    if(maxX-minX<0.02){minX-=0.01;maxX+=0.01} if(maxY-minY<0.02){minY-=0.01;maxY+=0.01}
    const x=p=>pad+((+p.lng-minX)/(maxX-minX))*(W-pad*2);
    const y=p=>H-pad-((+p.lat-minY)/(maxY-minY))*(H-pad*2);
    const ptsAttr=list.map(p=>`${x(p).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
    const nodes=list.map((p,i)=>{
      const xx=x(p),yy=y(p),tx=Math.max(8,Math.min(W-188,xx+12)),ty=Math.max(20,Math.min(H-12,yy-(i%2?12:-24)));
      return `<g><circle cx="${xx}" cy="${yy}" r="15" class="route-svg-dot"/><text x="${xx}" y="${yy+5}" text-anchor="middle" class="route-svg-num">${i+1}</text><rect x="${tx}" y="${ty-17}" rx="8" ry="8" width="176" height="27" class="route-svg-label-bg"/><text x="${tx+8}" y="${ty+2}" class="route-svg-label">${esc(p.n)}</text></g>`;
    }).join('');
    const msg=note||'인터넷 연결 후 Google Maps를 다시 시도합니다.';
    box.innerHTML=`<div class="route-schematic" role="img" aria-label="${esc(label||'이동동선')} 동선도"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="grid45" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="route-svg-grid"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid45)"/><polyline points="${ptsAttr}" class="route-svg-line"/>${nodes}</svg><div class="route-schematic-note">${esc(msg)}</div></div>`;
    records.set(box,{engine:'schematic',pts:list,opt:{label}});
    return 'schematic';
  }

  function ensureLeaflet(){
    if(window.L)return Promise.resolve(window.L);
    if(navigator.onLine===false)return Promise.reject(new Error('offline'));
    if(leafletPromise)return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-gspa-leaflet="1"]')){
        const css=document.createElement('link');
        css.rel='stylesheet';
        css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        css.dataset.gspaLeaflet='1';
        document.head.appendChild(css);
      }
      const existing=document.querySelector('script[data-gspa-leaflet="1"]');
      if(existing){
        let n=0;const t=setInterval(()=>{n++;if(window.L){clearInterval(t);resolve(window.L)}else if(n>40){clearInterval(t);leafletPromise=null;reject(new Error('Leaflet load timeout'))}},250);return;
      }
      const s=document.createElement('script');
      s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.async=true;s.defer=true;s.dataset.gspaLeaflet='1';
      s.onload=()=>window.L?resolve(window.L):(leafletPromise=null,reject(new Error('Leaflet missing')));
      s.onerror=()=>{leafletPromise=null;reject(new Error('Leaflet network load failed'))};
      document.body.appendChild(s);
    });
    return leafletPromise;
  }

  async function drawLeaflet(box,pts,opt={}){
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
    if(!list.length)return schematic(box,list,opt.label,'표시할 이동지점이 없습니다.');
    if(navigator.onLine===false)return schematic(box,list,opt.label,'오프라인 동선도 · 지도 타일은 인터넷 연결이 필요합니다.');
    try{await ensureLeaflet()}catch(_){return schematic(box,list,opt.label,'Google Maps와 OpenStreetMap을 모두 불러오지 못했습니다.');}

    cleanupRecord(box);
    box.innerHTML='';
    const map=L.map(box,{zoomControl:true,attributionControl:true,preferCanvas:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
    const markers=[];
    const latlngs=[];
    list.forEach((p,i)=>{
      const ll=[+p.lat,+p.lng];latlngs.push(ll);
      const icon=L.divIcon({className:'gspa-route-osm-icon',html:`<span>${i+1}</span>`,iconSize:[30,30],iconAnchor:[15,15]});
      const m=L.marker(ll,{icon,title:p.n}).addTo(map).bindPopup(`<b>${esc(p.n)}</b>`);markers.push(m);
    });
    let line=null;
    if(latlngs.length>1){line=L.polyline(latlngs,{weight:4,opacity:.88}).addTo(map);map.fitBounds(line.getBounds(),{padding:[28,28],maxZoom:12});}
    else map.setView(latlngs[0],11);
    setTimeout(()=>{try{map.invalidateSize()}catch(_){ }},100);
    const rec={engine:'osm',map,markers,line,pts:list,opt,retryTimer:null};
    records.set(box,rec);
    scheduleGoogleRecovery(box);
    return 'osm';
  }

  function scheduleGoogleRecovery(box,delay=60000){
    const rec=records.get(box);
    if(!rec||rec.engine!=='osm'||rec.retryTimer||navigator.onLine===false)return;
    rec.retryTimer=setTimeout(async()=>{
      rec.retryTimer=null;
      if(!box.isConnected||records.get(box)?.engine!=='osm')return;
      try{await render(box,rec.pts,rec.opt,{forceGoogle:true,recovery:true});}catch(_){ }
    },delay);
  }

  async function drawGoogle(box,pts,opt={}){
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
    if(!list.length)return 'schematic';
    cleanupRecord(box);
    box.innerHTML='';

    const center={lat:+list[0].lat,lng:+list[0].lng};
    const map=new google.maps.Map(box,{center,zoom:8,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative',clickableIcons:false,zoomControl:true});
    const bounds=new google.maps.LatLngBounds();
    const markers=[];
    list.forEach((p,i)=>{
      const pos={lat:+p.lat,lng:+p.lng};bounds.extend(pos);
      const marker=new google.maps.Marker({position:pos,map,label:String(i+1),title:p.n});
      const info=new google.maps.InfoWindow({content:`<b>${esc(p.n)}</b>`});
      marker.addListener('click',()=>info.open({anchor:marker,map}));markers.push(marker);
    });
    let line=null;
    if(list.length>1){line=new google.maps.Polyline({path:list.map(p=>({lat:+p.lat,lng:+p.lng})),geodesic:true,strokeColor:'#1769aa',strokeOpacity:.88,strokeWeight:4,map});map.fitBounds(bounds,38);}
    else{map.setCenter(center);map.setZoom(11)}
    records.set(box,{engine:'google',map,markers,line,pts:list,opt,retryTimer:null});

    // A Maps JS callback only proves that the library loaded. A referrer/billing
    // error can arrive after that. Wait for actual tiles before declaring success.
    return await new Promise(resolve=>{
      let settled=false;
      const finish=ok=>{if(settled)return;settled=true;window.removeEventListener('gspa-google-map-status',onStatus);clearTimeout(timer);resolve(ok?'google':'google-failed')};
      const onStatus=e=>{if(e?.detail?.status==='failed')finish(false)};
      window.addEventListener('gspa-google-map-status',onStatus);
      try{google.maps.event.addListenerOnce(map,'tilesloaded',()=>{window.GSPA_MapProvider?.markHealthy?.();finish(true)})}catch(_){ }
      const timer=setTimeout(()=>{
        if(window.GSPA_MapProvider?.isFailed?.())finish(false);
        else finish(false);
      },9000);
      setTimeout(()=>{try{google.maps.event.trigger(map,'resize')}catch(_){ }},120);
    });
  }

  async function render(box,pts,opt={},internal={}){
    if(!box)return 'schematic';
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
    if(!list.length)return schematic(box,list,opt.label,'표시할 이동지점이 없습니다.');
    if(navigator.onLine===false)return schematic(box,list,opt.label,'오프라인 동선도 · 인터넷 연결 후 Google Maps를 다시 시도합니다.');

    schematic(box,list,opt.label,'Google Maps 연결 중…');
    try{
      const provider=window.GSPA_MapProvider;
      if(!provider)throw new Error('Map provider missing');
      await provider.ensureGoogle({force:!!internal.forceGoogle});
      if(!box.isConnected)return 'schematic';
      const result=await drawGoogle(box,list,opt);
      if(result==='google')return 'google';
      provider.markFailure?.('map-render');
    }catch(_){ }

    const fallback=await drawLeaflet(box,list,opt);
    return fallback;
  }

  function invalidate(box){
    const rec=box&&records.get(box);if(!rec)return;
    try{
      if(rec.engine==='google'&&rec.map)google.maps.event.trigger(rec.map,'resize');
      else if(rec.engine==='osm'&&rec.map)rec.map.invalidateSize();
    }catch(_){ }
  }

  function engine(box){return records.get(box)?.engine||''}

  window.addEventListener('online',()=>{
    for(const [box,rec] of records){if(rec.engine==='osm'&&box.isConnected)scheduleGoogleRecovery(box,5000)}
  });

  window.GSPA_RouteMap={render,schematic,invalidate,destroy,ensureGoogle:(o)=>window.GSPA_MapProvider?.ensureGoogle(o),engine};
})();
