/* MIX06: optional foreground Screen Wake Lock. NOT background GPS.
 * No service worker, hidden audio, timer hacks or unsolicited sharing changes.
 */
(function(){
  'use strict';
  let wanted=false,sentinel=null,pending=false,generation=0,reason='';
  const supported=()=>window.isSecureContext&&!!navigator.wakeLock?.request;
  const activeUser=()=>!!(typeof currentUser!=='undefined'&&currentUser);
  const loc=()=>window.LocationSession?.state;
  function text(id,value){const e=document.getElementById(id);if(e)e.textContent=value}
  function paint(){
    const b=document.getElementById('screenWakeToggle');if(!b)return;
    const active=!!sentinel&&!sentinel.released;
    b.disabled=!supported()||!activeUser()||(!wanted&&!loc()?.want);
    b.setAttribute('aria-pressed',String(wanted));
    b.textContent=pending?'\ud654\uba74 \uc720\uc9c0 \uc694\uccad \uc911':wanted?'\ud654\uba74 \uc720\uc9c0 \ud574\uc81c':'\ud654\uba74 \ucf1c\ub450\uae30';
    text('screenWakeStatus',!supported()?'\uc774 \ube0c\ub77c\uc6b0\uc800\ub294 \ud654\uba74 \uc720\uc9c0 API\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.':active?'\ud654\uba74 \uc720\uc9c0 \uc911 \u00b7 \ub2e4\ub978 \uc571\u00b7\uc218\ub3d9 \uc7a0\uae08\uc5d0\uc11c\ub294 \uc911\ub2e8\ub429\ub2c8\ub2e4.':reason||'\uc774 \ud654\uba74\uc744 \uc5f4\uc5b4\ub454 \ub3d9\uc548\ub9cc \uc790\ub3d9 \ud654\uba74 \uaebc\uc9d0\uc744 \uc904\uc785\ub2c8\ub2e4.');
  }
  async function release(clear=false){
    generation++;if(clear){wanted=false;reason=''}
    const old=sentinel;sentinel=null;
    if(old&&!old.released)try{await old.release()}catch(_){}
    paint();
  }
  async function acquire(){
    if(!supported()||!wanted||pending||sentinel&&!sentinel.released||document.hidden||!activeUser()||!loc()?.want)return;
    const g=generation;pending=true;reason='';paint();
    try{
      const lock=await navigator.wakeLock.request('screen');
      if(g!==generation||!wanted||document.hidden||!activeUser()||!loc()?.want){await lock.release();return}
      sentinel=lock;
      lock.addEventListener('release',()=>{if(sentinel===lock){sentinel=null;reason=document.hidden?'\ub2e4\ub978 \ud654\uba74\uc5d0\uc11c\ub294 \uc720\uc9c0 \uc911\ub2e8 \u00b7 \ubcf5\uadc0 \uc2dc \uc7ac\uc2dc\ub3c4':'\uc2dc\uc2a4\ud15c\uc774 \ud654\uba74 \uc720\uc9c0\ub97c \ud574\uc81c\ud588\uc2b5\ub2c8\ub2e4.';paint()}});
    }catch(_){reason='\uc808\uc804 \ubaa8\ub4dc\u00b7\uc124\uc815\uc73c\ub85c \ud654\uba74 \uc720\uc9c0\uac00 \uac70\uc808\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc790\ub3d9 \ud654\uba74 \uaebc\uc9d0\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.'}
    finally{pending=false;paint()}
  }
  function openHelp(){const d=document.getElementById('locationHelp');if(!d)return;if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else{d.setAttribute('open','');d.setAttribute('role','dialog')}}
  function closeHelp(){const d=document.getElementById('locationHelp');if(!d)return;if(typeof d.close==='function')d.close();else d.removeAttribute('open')}
  document.addEventListener('click',e=>{
    if(e.target.closest('#screenWakeToggle')){if(wanted)release(true);else{wanted=true;acquire()}return}
    if(e.target.closest('[data-location-help]')){openHelp();return}
    if(e.target.closest('[data-location-help-close]')){closeHelp();return}
    const d=document.getElementById('locationHelp');if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeHelp()}
  });
  window.addEventListener('cro-location-state',()=>{if(!activeUser()||!loc()?.want){if(wanted||sentinel||pending)release(true)}paint()});
  window.addEventListener('cro-auth-change',()=>{release(true);paint()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){reason='\ud654\uba74 \ubcf5\uadc0 \ud6c4 \uc7ac\uc2dc\ub3c4';release(false)}else{acquire();paint()}});
  window.addEventListener('pagehide',()=>release(false));
  window.addEventListener('pageshow',()=>{if(!document.hidden)acquire()});
  document.addEventListener('DOMContentLoaded',paint);
  window.RuntimeSupport={openHelp,get state(){return {wanted,active:!!sentinel&&!sentinel.released,supported:!!supported(),pending,reason}}};
})();
