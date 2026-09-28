/* MIX49: Common PWA/home-screen install helper for every study-abroad team. */
(function(){
  'use strict';
  let deferred=null;
  let installed=window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;

  function state(){
    const bootstrap=window.GSPA_TRIP_BOOTSTRAP===true;
    const trip=window.GSPA_TRIP||null;
    const q=new URLSearchParams(location.search);
    const requested=(q.get('trip')||'').trim();
    const id=bootstrap&&!requested?'portal':(trip?.id||requested||'portal');
    const label=id==='portal'?'GSPA 국외연수':(trip?.shortName||trip?.name||({'croatia':'크로아티아','turkiye1':'튀르키예 1팀','turkiye2':'튀르키예 2팀','italy-north':'이탈리아 북부'}[id])||'국외연수');
    return {id,label};
  }
  function key(suffix){return `gspa.pwa.${state().id}.${suffix}`}
  function isMobile(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'')||matchMedia('(max-width:900px)').matches}
  function wrap(){return document.getElementById('loginInstallWrap')}
  function btn(){return document.getElementById('loginInstallBtn')}
  function paint(){
    const w=wrap(),b=btn();if(!w||!b)return;
    const s=state();w.hidden=installed||!isMobile();
    b.textContent=installed?'✓ 홈 화면에 설치됨':'📲 홈 화면에 추가';
    const small=w.querySelector('small');if(small)small.textContent=`${s.label} 바로가기`;
  }
  function toast(msg){
    let e=document.getElementById('pwaInstallToast');
    if(!e){e=document.createElement('div');e.id='pwaInstallToast';e.className='pwa-install-toast';document.body.appendChild(e)}
    e.innerHTML=msg+'<button type="button" aria-label="닫기">×</button>';
    e.classList.add('show');e.querySelector('button[aria-label="닫기"]').onclick=()=>e.classList.remove('show');
    clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),9000);
  }
  async function install(){
    const s=state();
    if(installed){toast('<b>이미 홈 화면 앱으로 실행 중입니다.</b>');return}
    if(deferred){
      const p=deferred;deferred=null;
      try{
        await p.prompt();const c=await p.userChoice;
        if(c?.outcome==='accepted'){
          installed=true;paint();localStorage.setItem(key('installed'),'1');return;
        }
      }catch(_){ }
    }
    const isiOS=/iPhone|iPad|iPod/i.test(navigator.userAgent||'');
    toast(isiOS?`<b>${s.label} 홈 화면 추가</b><br>공유 버튼 → <b>홈 화면에 추가</b>를 선택하세요.`:`<b>${s.label} 바로가기</b><br>Chrome 메뉴 <b>⋮ → 홈 화면에 추가 / 앱 설치</b>를 선택하세요.`);
  }
  function maybePromptAfterLogin(){
    if(installed||!isMobile())return;
    const s=state();
    if(localStorage.getItem(key('installHint'))==='shown')return;
    localStorage.setItem(key('installHint'),'shown');
    setTimeout(()=>toast(`<b>${s.label}을(를) 홈 화면에 추가할 수 있습니다.</b><br><button type="button" id="pwaToastInstall">바로가기 만들기</button>`),700);
    setTimeout(()=>{const x=document.getElementById('pwaToastInstall');if(x)x.onclick=install},760);
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;paint()});
  window.addEventListener('appinstalled',()=>{installed=true;deferred=null;paint();localStorage.setItem(key('installed'),'1')});
  window.addEventListener('DOMContentLoaded',()=>{
    paint();btn()?.addEventListener('click',install);
    if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  });
  window.GSPA_PWA={install,paint,maybePromptAfterLogin};
})();
