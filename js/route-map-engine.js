/* MIX43 schedule/today route map engine.
 * Embedded itinerary maps use OpenStreetMap/Leaflet so they do not depend on a
 * Google Maps JavaScript API key. Google Maps remains available via the route button.
 * Offline or tile/library failures fall back to a zero-data local schematic.
 */
(function(){
  'use strict';
  const LIB={css:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',js:['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js']};
  let leafletPromise=null;
  const liveMaps=new WeakMap();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function destroy(box){
    const m=liveMaps.get(box); if(m){try{m.remove()}catch(_){ } liveMaps.delete(box);}
    box.innerHTML='';
  }
  function schematic(box,pts,label){
    destroy(box);
    const list=Array.isArray(pts)?pts.filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng)):[];
    if(!list.length){box.innerHTML='<div class="route-local-empty">표시할 이동지점이 없습니다.</div>';return;}
    const W=640,H=300,pad=42;
    let minX=Math.min(...list.map(p=>+p.lng)),maxX=Math.max(...list.map(p=>+p.lng));
    let minY=Math.min(...list.map(p=>+p.lat)),maxY=Math.max(...list.map(p=>+p.lat));
    if(maxX-minX<0.02){minX-=0.01;maxX+=0.01} if(maxY-minY<0.02){minY-=0.01;maxY+=0.01}
    const x=p=>pad+((+p.lng-minX)/(maxX-minX))*(W-pad*2);
    const y=p=>H-pad-((+p.lat-minY)/(maxY-minY))*(H-pad*2);
    const ptsAttr=list.map(p=>`${x(p).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
    const nodes=list.map((p,i)=>{const xx=x(p),yy=y(p);const tx=Math.max(8,Math.min(W-188,xx+12));const ty=Math.max(20,Math.min(H-12,yy-(i%2?12:-24)));return `<g><circle cx="${xx}" cy="${yy}" r="15" class="route-svg-dot"/><text x="${xx}" y="${yy+5}" text-anchor="middle" class="route-svg-num">${i+1}</text><rect x="${tx}" y="${ty-17}" rx="8" ry="8" width="176" height="27" class="route-svg-label-bg"/><text x="${tx+8}" y="${ty+2}" class="route-svg-label">${esc(p.n)}</text></g>`}).join('');
    box.innerHTML=`<div class="route-schematic" role="img" aria-label="${esc(label||'이동동선')} 오프라인 동선도"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="grid43" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="route-svg-grid"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid43)"/><polyline points="${ptsAttr}" class="route-svg-line"/>${nodes}</svg><div class="route-schematic-note">오프라인에서도 보이는 동선도 · 실제 도로는 ‘Google 지도에서 전체 동선’ 버튼으로 확인</div></div>`;
  }
  function loadCss(){if(document.querySelector('link[data-leaflet43]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=LIB.css;l.dataset.leaflet43='1';document.head.appendChild(l)}
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.dataset.leaflet43='1';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function ensureLeaflet(){
    if(window.L?.map)return window.L;
    if(leafletPromise)return leafletPromise;
    leafletPromise=(async()=>{loadCss();let last;for(const src of LIB.js){try{await loadScript(src);if(window.L?.map)return window.L}catch(e){last=e}}throw last||new Error('Leaflet load failed')})().catch(e=>{leafletPromise=null;throw e});
    return leafletPromise;
  }
  async function render(box,pts,opt={}){
    if(!box)return false;
    schematic(box,pts,opt.label);
    if(navigator.onLine===false)return false;
    let L;try{L=await ensureLeaflet()}catch(_){return false}
    if(!document.body.contains(box))return false;
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng)); if(!list.length)return false;
    destroy(box);
    const m=L.map(box,{zoomControl:true,attributionControl:true,scrollWheelZoom:false,preferCanvas:true}); liveMaps.set(box,m);
    const tile=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors',crossOrigin:true});
    let gotTile=false; let failed=0;
    tile.on('tileload',()=>{gotTile=true;box.classList.add('route-map-online')});
    tile.on('tileerror',()=>{failed++; if(failed>5&&!gotTile){try{m.remove()}catch(_){ }liveMaps.delete(box);schematic(box,list,opt.label)}});
    tile.addTo(m);
    const ll=[];
    list.forEach((p,i)=>{const div=L.divIcon({className:'route-num-icon',html:`<span>${i+1}</span>`,iconSize:[30,30],iconAnchor:[15,15]});L.marker([+p.lat,+p.lng],{icon:div,title:p.n}).addTo(m).bindTooltip(`${i+1}. ${p.n}`,{direction:'top',offset:[0,-12]});ll.push([+p.lat,+p.lng])});
    if(ll.length>1){L.polyline(ll,{weight:4,opacity:.85,color:'#1769aa'}).addTo(m);m.fitBounds(ll,{padding:[36,36],maxZoom:11})}else m.setView(ll[0],11);
    setTimeout(()=>{if(!gotTile&&document.body.contains(box)){try{m.invalidateSize()}catch(_){}}},900);
    setTimeout(()=>{if(!gotTile&&navigator.onLine===false){try{m.remove()}catch(_){ }liveMaps.delete(box);schematic(box,list,opt.label)}},4500);
    return true;
  }
  function invalidate(box){const m=box&&liveMaps.get(box);if(m){try{m.invalidateSize()}catch(_){}}}
  window.GSPA_RouteMap={render,schematic,invalidate,destroy};
})();
