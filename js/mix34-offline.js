/* MIX34: graceful offline UX. Network-only features fail fast; local travel content keeps working. */
(function(){
  'use strict';
  function toast(msg){if(window.showAppToast)showAppToast(msg);else{const e=document.getElementById('appActionToast');if(e){e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600)}}}
  function set(id,text){const e=document.getElementById(id);if(e)e.textContent=text}
  function paint(){
    const off=navigator.onLine===false;document.documentElement.dataset.offline=off?'true':'false';
    if(off){
      const loc=document.getElementById('locBackendState');if(loc){loc.textContent='오프라인 · 일행 위치 조회·전송은 인터넷 연결 필요';loc.className='note'}
      const map=document.getElementById('locMapEngine');if(map&&!window.google?.maps&&!window.L)map.textContent='지도 엔진: 오프라인 · 인터넷 연결 필요';
      const ns=document.getElementById('travelNewsStatus');if(ns&&!/저장/.test(ns.textContent||''))ns.textContent='오프라인 · 저장된 뉴스만 표시';
    }
  }
  function isExternal(a){try{const u=new URL(a.href,location.href);return /^https?:$/.test(u.protocol)&&u.origin!==location.origin}catch(_){return false}}
  document.addEventListener('click',e=>{
    if(navigator.onLine!==false)return;
    const a=e.target.closest('a[href]');if(a&&isExternal(a)){e.preventDefault();toast('이 기능은 인터넷 연결이 필요합니다.');return}
    if(e.target.closest('#fxRefresh,#travelNewsRefresh,.loc-map-retry'))toast('실시간 조회는 인터넷 연결이 필요합니다.');
  },true);
  window.addEventListener('offline',()=>{paint();toast('오프라인 모드 · 저장된 일정과 여행정보를 사용합니다.')});
  window.addEventListener('online',()=>{paint();toast('인터넷 연결됨 · 실시간 기능을 다시 사용할 수 있습니다.')});
  document.addEventListener('DOMContentLoaded',paint);window.addEventListener('pageshow',paint);
  window.CroNetwork={get online(){return navigator.onLine!==false},paint,need(){if(navigator.onLine===false){toast('인터넷 연결이 필요한 기능입니다.');return false}return true}};
})();
