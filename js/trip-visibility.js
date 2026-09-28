/* MIX44 trip-specific menu visibility. */
(function(){
  'use strict';
  function apply(){
    const trip=window.GSPA_TRIP_ID||'croatia';
    const cro=trip==='croatia';
    document.querySelectorAll('[data-route="apps"],[data-route="toilets"],[data-route="fieldphotos"]').forEach(el=>{el.hidden=!cro;el.setAttribute('aria-hidden',String(!cro))});
    ['apps','toilets','fieldphotos'].forEach(id=>{const sec=document.getElementById(id);if(sec){sec.hidden=!cro;sec.setAttribute('aria-hidden',String(!cro))}});
    document.querySelectorAll('#appMoreSheet a[href^="trips.html"],.mix-trip-switch').forEach(el=>el.remove());
    if(!cro){
      const h=location.hash.replace(/^#\/?/,'').split('/')[0];
      if(h==='apps'||h==='toilets'||h==='fieldphotos')setTimeout(()=>window.AppRouter?.go('more'),0);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('cro-route',e=>{
    if((window.GSPA_TRIP_ID||'croatia')==='croatia')return;
    if(e.detail?.view==='apps'||e.detail?.view==='toilets'||e.detail?.view==='fieldphotos')setTimeout(()=>window.AppRouter?.go('more'),0);
  });
})();
