/* MIX44 route map engine.
 * Online: Google Maps JavaScript API only.
 * Offline / Google API failure: zero-data local route schematic.
 * No OpenStreetMap/Leaflet fallback is used.
 */
(function(){
  'use strict';
  let googlePromise=null;
  const liveMaps=new WeakMap();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function destroy(box){
    const rec=liveMaps.get(box);
    if(rec){
      try{(rec.markers||[]).forEach(m=>m.setMap?.(null));rec.line?.setMap?.(null)}catch(_){ }
      liveMaps.delete(box);
    }
    if(box)box.innerHTML='';
  }

  function schematic(box,pts,label,note){
    if(!box)return;
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
    const nodes=list.map((p,i)=>{
      const xx=x(p),yy=y(p),tx=Math.max(8,Math.min(W-188,xx+12)),ty=Math.max(20,Math.min(H-12,yy-(i%2?12:-24)));
      return `<g><circle cx="${xx}" cy="${yy}" r="15" class="route-svg-dot"/><text x="${xx}" y="${yy+5}" text-anchor="middle" class="route-svg-num">${i+1}</text><rect x="${tx}" y="${ty-17}" rx="8" ry="8" width="176" height="27" class="route-svg-label-bg"/><text x="${tx+8}" y="${ty+2}" class="route-svg-label">${esc(p.n)}</text></g>`;
    }).join('');
    const msg=note||'인터넷이 연결되면 Google Maps로 자동 전환됩니다.';
    box.innerHTML=`<div class="route-schematic" role="img" aria-label="${esc(label||'이동동선')} 임시 동선도"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><defs><pattern id="grid44" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" class="route-svg-grid"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid44)"/><polyline points="${ptsAttr}" class="route-svg-line"/>${nodes}</svg><div class="route-schematic-note">${esc(msg)}</div></div>`;
  }

  function googleKey(){
    try{return typeof GOOGLE_MAPS_API_KEY!=='undefined'?String(GOOGLE_MAPS_API_KEY||''):''}catch(_){return''}
  }

  function waitForExistingScript(resolve,reject){
    let n=0;
    const t=setInterval(()=>{
      n++;
      if(window.google?.maps){clearInterval(t);resolve(window.google.maps)}
      else if(n>=40){clearInterval(t);reject(new Error('Google Maps load timeout'))}
    },250);
  }

  function ensureGoogle(){
    if(window.google?.maps)return Promise.resolve(window.google.maps);
    if(navigator.onLine===false)return Promise.reject(new Error('offline'));
    if(googlePromise)return googlePromise;
    googlePromise=new Promise((resolve,reject)=>{
      const key=googleKey();
      if(!key){reject(new Error('Google Maps API key missing'));return;}
      const existing=document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if(existing){waitForExistingScript(resolve,reject);return;}
      const cb='__gspaGoogleMapsReady44';
      let done=false,timer=null;
      const finishOk=()=>{if(done)return;done=true;if(timer)clearTimeout(timer);try{delete window[cb]}catch(_){ }resolve(window.google.maps)};
      const finishErr=err=>{if(done)return;done=true;if(timer)clearTimeout(timer);try{delete window[cb]}catch(_){ }googlePromise=null;reject(err instanceof Error?err:new Error(String(err||'Google Maps error')))};
      const prevAuth=window.gm_authFailure;
      window.gm_authFailure=function(){finishErr(new Error('Google Maps authentication failed'));if(typeof prevAuth==='function'){try{prevAuth()}catch(_){}}};
      window[cb]=()=>{if(window.google?.maps)finishOk();else finishErr(new Error('Google Maps callback without maps'))};
      const s=document.createElement('script');
      s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${cb}&v=weekly&loading=async&language=ko`;
      s.async=true;s.defer=true;s.dataset.gspaGoogle44='1';s.onerror=()=>finishErr(new Error('Google Maps network load failed'));
      document.head.appendChild(s);
      timer=setTimeout(()=>{if(window.google?.maps)finishOk();else finishErr(new Error('Google Maps load timeout'))},12000);
    }).catch(e=>{googlePromise=null;throw e});
    return googlePromise;
  }

  function drawGoogle(box,pts,opt={}){
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
    if(!list.length)return false;
    destroy(box);
    const center={lat:+list[0].lat,lng:+list[0].lng};
    const map=new google.maps.Map(box,{center,zoom:8,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'cooperative',clickableIcons:false,zoomControl:true});
    const bounds=new google.maps.LatLngBounds();
    const markers=[];
    list.forEach((p,i)=>{
      const pos={lat:+p.lat,lng:+p.lng};bounds.extend(pos);
      const marker=new google.maps.Marker({position:pos,map,label:String(i+1),title:p.n});
      const info=new google.maps.InfoWindow({content:`<b>${esc(p.n)}</b>`});
      marker.addListener('click',()=>info.open({anchor:marker,map}));
      markers.push(marker);
    });
    let line=null;
    if(list.length>1){
      line=new google.maps.Polyline({path:list.map(p=>({lat:+p.lat,lng:+p.lng})),geodesic:true,strokeColor:'#1769aa',strokeOpacity:.88,strokeWeight:4,map});
      map.fitBounds(bounds,38);
    }else{map.setCenter(center);map.setZoom(11)}
    liveMaps.set(box,{map,markers,line});
    setTimeout(()=>{try{google.maps.event.trigger(map,'resize')}catch(_){ }},120);
    return true;
  }

  async function render(box,pts,opt={}){
    if(!box)return false;
    const list=(pts||[]).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lng));
    if(!list.length){schematic(box,list,opt.label,'표시할 이동지점이 없습니다.');return false;}
    if(navigator.onLine===false){schematic(box,list,opt.label,'오프라인 동선도 · Google Maps는 인터넷 연결이 필요합니다.');return false;}
    schematic(box,list,opt.label,'Google Maps 연결 중…');
    try{await ensureGoogle();if(!document.body.contains(box))return false;return drawGoogle(box,list,opt)}
    catch(_){schematic(box,list,opt.label,'Google Maps를 불러오지 못했습니다. 아래 전체 동선 버튼으로 Google Maps를 열 수 있습니다.');return false;}
  }

  function invalidate(box){
    const rec=box&&liveMaps.get(box);if(rec?.map){try{google.maps.event.trigger(rec.map,'resize')}catch(_){}}
  }

  window.GSPA_RouteMap={render,schematic,invalidate,destroy,ensureGoogle};
})();
