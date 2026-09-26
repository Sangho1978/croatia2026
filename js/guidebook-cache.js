/* MIX33 guidebook local-first cache. Browser app cache, not arbitrary OS Downloads access. */
(function(){
  const PDF='docs/croatia_guidebook_20260922.pdf';
  const CACHE='croatia-guidebook-v1';
  const NAME='서울대학교_공공리더십과정_크로아티아_안내소책자_20260922.pdf';
  const abs=()=>new URL(PDF,location.href).href;
  async function cache(){return 'caches'in window?caches.open(CACHE):null}
  async function cached(){try{const c=await cache();return c?await c.match(abs()):null}catch(_){return null}}
  async function getPdf(){
    let r=await cached(); if(r)return {response:r,local:true};
    if(navigator.onLine===false)throw Error('OFFLINE_NO_CACHE'); r=await fetch(PDF,{cache:'default'}); if(!r.ok)throw Error('PDF '+r.status);
    try{const c=await cache();if(c)await c.put(abs(),r.clone())}catch(_){ }
    return {response:r,local:false};
  }
  function state(text){const el=document.getElementById('guidebookCacheState');if(el)el.textContent=text}
  async function paint(){const r=await cached();state(r?'✓ 이 기기에 저장됨 · 이후 데이터 없이 열기':'첫 사용 시 1회 저장 · 이후 저장본 우선')}
  function busy(on){document.querySelectorAll('[data-guidebook-action]').forEach(x=>x.classList.toggle('guidebook-busy',on))}
  async function view(ev){
    ev.preventDefault();const popup=window.open('about:blank','_blank');busy(true);
    try{const {response,local}=await getPdf();const blob=await response.blob();const u=URL.createObjectURL(blob);state(local?'✓ 저장본 열기':'✓ 저장 완료 · 이후 저장본 사용');if(popup)popup.location.href=u;else location.href=u;setTimeout(()=>URL.revokeObjectURL(u),180000)}
    catch(e){if(popup)popup.close();if(navigator.onLine===false||e.message==='OFFLINE_NO_CACHE'){state('오프라인 · 이 기기에 저장된 소책자가 없습니다. Wi-Fi에서 한 번 열어 주세요.');window.showAppToast?.('소책자 저장본이 없습니다. 인터넷 연결 후 한 번 열어 주세요.');}else{location.href=PDF;state('온라인 PDF 열기')}}
    finally{busy(false)}
  }
  async function download(ev){
    ev.preventDefault();busy(true);
    try{const {response,local}=await getPdf();const blob=await response.blob();const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=NAME;document.body.appendChild(a);a.click();a.remove();state(local?'✓ 저장본에서 다운로드':'✓ 저장 완료 · 이후 저장본 사용');setTimeout(()=>URL.revokeObjectURL(u),180000)}
    catch(e){if(navigator.onLine===false||e.message==='OFFLINE_NO_CACHE'){state('오프라인 · 이 기기에 저장된 소책자가 없습니다. Wi-Fi에서 한 번 받아 주세요.');window.showAppToast?.('소책자 저장본이 없습니다. 인터넷 연결이 필요합니다.');}else{location.href=PDF;state('온라인 PDF 열기')}}
    finally{busy(false)}
  }
  document.addEventListener('click',e=>{const a=e.target.closest('[data-guidebook-action]');if(!a)return;(a.dataset.guidebookAction==='download'?download:view)(e)});
  document.addEventListener('DOMContentLoaded',paint);
  window.addEventListener('pageshow',paint);
})();