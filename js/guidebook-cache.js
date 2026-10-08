/* MIX43 guidebook: native PDF links first, service-worker cache first thereafter.
 * Online clicks are never blocked by JavaScript. Offline clicks use Cache Storage.
 */
(function(){
  'use strict';
  const trip=window.GSPA_TRIP||{};
  const PDF=trip.booklet||'docs/croatia_guidebook_20261008_final.pdf';
  const NAME=trip.bookletDownload||'안내책자.pdf';
  const GUIDE_CACHE='gspa-guidebook-v71-20261008-final';
  const abs=()=>new URL(PDF,location.href).href;
  async function refreshOnlineCopy(){
    if(!('caches'in window)||navigator.onLine===false)return null;
    try{
      const r=await fetch(abs(),{cache:'no-store'});
      if(!r.ok)return null;
      const c=await caches.open(GUIDE_CACHE);await c.put(abs(),r.clone());return r;
    }catch(_){return null}
  }
  function state(t,err=false){const e=document.getElementById('guidebookCacheState');if(e){e.textContent=t;e.classList.toggle('guidebook-error',!!err)}}
  async function cached(){if(!('caches'in window))return null;try{const c=await caches.open(GUIDE_CACHE);return await c.match(abs())}catch(_){return null}}
  async function paint(){state(await cached()?'✓ 이 기기에 저장됨 · 오프라인 사용 가능':'처음 열 때 저장 · 이후 저장본 우선')}
  async function offlineOpen(a,action){
    const r=await cached();
    if(!r){state('오프라인 · 저장된 소책자가 없습니다. Wi‑Fi에서 한 번 열어 주세요.',true);window.showAppToast?.('소책자 저장본이 없습니다.');return}
    const u=URL.createObjectURL(await r.blob());
    if(action==='download'){
      const x=document.createElement('a');x.href=u;x.download=NAME;document.body.appendChild(x);x.click();x.remove();
    }else location.href=u;
    setTimeout(()=>URL.revokeObjectURL(u),180000);
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-guidebook-action]');if(!a)return;
    a.href=PDF;
    if(a.dataset.guidebookAction==='download')a.download=NAME;
    if(navigator.onLine===false){e.preventDefault();offlineOpen(a,a.dataset.guidebookAction);return}
    state('소책자 여는 중 · 완료 후 오프라인에서도 사용 가능');
    void refreshOnlineCopy().finally(()=>setTimeout(paint,300));
  });
  document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-guidebook-action]').forEach(a=>{a.href=PDF;if(a.dataset.guidebookAction==='download')a.download=NAME});paint()});
  window.addEventListener('pageshow',paint);
})();
