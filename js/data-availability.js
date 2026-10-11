/* MIX83: no-login-redirect empty-state message for account-specific resources. */
(function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function html(detail){
    return `<section class="gspa-no-data" role="status" aria-live="polite"><span class="gspa-no-data-icon" aria-hidden="true">ⓘ</span><h3>이용 가능한 정보가 없습니다</h3><p>${esc(detail||'현재 계정에 연결된 정보가 없습니다.')}</p></section>`;
  }
  window.GSPA_DataAvailability=Object.freeze({version:'v83',html});
})();
