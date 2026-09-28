/* MIX51: Cross-platform PWA/home-screen helper + Kakao in-app browser guidance. */
(function(){
  'use strict';
  let deferred=null;
  let installed=window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;

  function ua(){return navigator.userAgent||''}
  function isIOS(){return /iPhone|iPad|iPod/i.test(ua())}
  function isAndroid(){return /Android/i.test(ua())}
  function isKakao(){return /KAKAOTALK|KakaoTalk/i.test(ua())}
  function isSamsungInternet(){return /SamsungBrowser/i.test(ua())}
  function isChrome(){return /Chrome|CriOS/i.test(ua())&&!/EdgA|OPR|SamsungBrowser/i.test(ua())}
  function isSafari(){return isIOS()&&/Safari/i.test(ua())&&!/CriOS|FxiOS|EdgiOS|OPiOS|KAKAOTALK/i.test(ua())}

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
  function isMobile(){return /Android|iPhone|iPad|iPod/i.test(ua())||matchMedia('(max-width:900px)').matches}
  function wrap(){return document.getElementById('loginInstallWrap')}
  function btn(){return document.getElementById('loginInstallBtn')}

  function canonicalUrl(){
    const s=state();
    try{
      const base=new URL('./index.html',location.href);
      if(s.id&&s.id!=='portal')base.searchParams.set('trip',s.id);
      else base.search='';
      base.hash='';
      return base.href;
    }catch(_){return location.href.split('#')[0]}
  }

  function paint(){
    const w=wrap(),b=btn();if(!w||!b)return;
    const s=state();w.hidden=installed||!isMobile();
    b.textContent=installed?'✓ 홈 화면에 설치됨':'📲 홈 화면에 추가';
    const small=w.querySelector('small');
    if(small){
      if(isKakao())small.textContent='카카오톡에서는 안내에 따라 외부 브라우저에서 추가';
      else if(isIOS())small.textContent=`${s.label} · Safari 공유 → 홈 화면에 추가`;
      else small.textContent=`${s.label} 바로가기`;
    }
  }

  function toast(msg){
    let e=document.getElementById('pwaInstallToast');
    if(!e){e=document.createElement('div');e.id='pwaInstallToast';e.className='pwa-install-toast';document.body.appendChild(e)}
    e.innerHTML=msg+'<button type="button" aria-label="닫기">×</button>';
    e.classList.add('show');e.querySelector('button[aria-label="닫기"]').onclick=()=>e.classList.remove('show');
    clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),9000);
  }

  async function copyAddress(button){
    const url=canonicalUrl();let ok=false;
    try{await navigator.clipboard.writeText(url);ok=true}catch(_){
      try{
        const ta=document.createElement('textarea');ta.value=url;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();ok=document.execCommand('copy');ta.remove();
      }catch(__){ }
    }
    if(button){
      const old=button.textContent;button.textContent=ok?'✓ 주소 복사됨':'주소를 길게 눌러 복사';button.classList.toggle('copied',ok);
      setTimeout(()=>{button.textContent=old;button.classList.remove('copied')},2200);
    }
    if(!ok){
      const field=document.getElementById('pwaAddressText');if(field){field.hidden=false;field.value=url;field.focus();field.select()}
    }
    return ok;
  }

  function ensureGuide(){
    let m=document.getElementById('pwaInstallGuide');if(m)return m;
    m=document.createElement('div');m.id='pwaInstallGuide';m.className='pwa-guide-backdrop';m.hidden=true;
    m.innerHTML=`<section class="pwa-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="pwaGuideTitle">
      <button class="pwa-guide-close" type="button" aria-label="닫기">×</button>
      <div class="pwa-guide-icon">📲</div>
      <h2 id="pwaGuideTitle">홈 화면 바로가기</h2>
      <p id="pwaGuideLead" class="pwa-guide-lead"></p>
      <ol id="pwaGuideSteps" class="pwa-guide-steps"></ol>
      <div class="pwa-guide-url"><span>접속 주소</span><code id="pwaGuideUrl"></code></div>
      <textarea id="pwaAddressText" class="pwa-address-text" readonly hidden></textarea>
      <div class="pwa-guide-actions">
        <button id="pwaCopyAddress" class="pwa-copy-btn" type="button">🔗 주소 복사</button>
        <button id="pwaGuideDone" class="pwa-done-btn" type="button">확인</button>
      </div>
      <p class="pwa-guide-foot">홈 화면에 추가하면 다음부터 주소를 입력하지 않고 바로 실행할 수 있습니다.</p>
    </section>`;
    document.body.appendChild(m);
    const close=()=>{m.hidden=true;document.body.classList.remove('pwa-guide-open')};
    m.querySelector('.pwa-guide-close').onclick=close;
    m.querySelector('#pwaGuideDone').onclick=close;
    m.querySelector('#pwaCopyAddress').onclick=e=>copyAddress(e.currentTarget);
    m.addEventListener('click',e=>{if(e.target===m)close()});
    return m;
  }

  function showGuide(reason='manual'){
    const s=state(),m=ensureGuide();
    const lead=m.querySelector('#pwaGuideLead'),steps=m.querySelector('#pwaGuideSteps');
    m.querySelector('#pwaGuideUrl').textContent=canonicalUrl();
    m.querySelector('#pwaAddressText').value=canonicalUrl();
    let list=[];
    if(isKakao()){
      lead.innerHTML=`<b>카카오톡 안에서 열린 화면입니다.</b><br>카카오톡 내장 브라우저에서는 홈 화면 설치가 제한될 수 있습니다.`;
      list=isIOS()
        ?['카카오톡 우측 상단 메뉴에서 <b>Safari로 열기</b>를 선택합니다.','메뉴가 보이지 않으면 아래 <b>주소 복사</b> 후 Safari 주소창에 붙여넣습니다.','Safari의 <b>공유(□↑) → 홈 화면에 추가</b>를 누릅니다.']
        :['카카오톡 우측 상단 메뉴에서 <b>다른 브라우저로 열기</b>를 선택합니다.','<b>Chrome 또는 Samsung Internet</b>으로 연 뒤 홈 화면에 추가합니다.','외부 브라우저 열기가 없으면 아래 <b>주소 복사</b> 후 브라우저 주소창에 붙여넣습니다.'];
    }else if(isIOS()){
      lead.innerHTML=`<b>${s.label}</b>을 아이폰·아이패드 홈 화면에 추가할 수 있습니다.`;
      list=isSafari()
        ?['Safari 하단의 <b>공유(□↑)</b> 버튼을 누릅니다.','목록에서 <b>홈 화면에 추가</b>를 선택합니다.','이름을 확인한 뒤 <b>추가</b>를 누릅니다.']
        :['가장 확실한 방법은 이 주소를 <b>Safari</b>에서 여는 것입니다.','아래 <b>주소 복사</b> 후 Safari 주소창에 붙여넣습니다.','Safari의 <b>공유(□↑) → 홈 화면에 추가</b>를 선택합니다.'];
    }else{
      lead.innerHTML=`<b>${s.label}</b>을 홈 화면에 추가할 수 있습니다.`;
      if(isSamsungInternet())list=['브라우저 메뉴 <b>☰ 또는 ⋮</b>를 누릅니다.','<b>페이지 추가 → 홈 화면</b> 또는 <b>앱 설치</b>를 선택합니다.'];
      else if(isChrome()||isAndroid())list=['브라우저 우측 상단 <b>⋮</b> 메뉴를 누릅니다.','<b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 선택합니다.'];
      else list=['브라우저 메뉴에서 <b>홈 화면에 추가 / 앱 설치</b>를 찾습니다.','메뉴가 없으면 아래 주소를 복사해 Chrome·Safari·Samsung Internet에서 엽니다.'];
    }
    steps.innerHTML=list.map(x=>`<li>${x}</li>`).join('');
    m.hidden=false;document.body.classList.add('pwa-guide-open');
    setTimeout(()=>m.querySelector('.pwa-guide-close')?.focus(),40);
    try{sessionStorage.setItem(reason==='kakao'?'gspa.pwa.kakaoGuide.session':key('guide'),'shown')}catch(_){ }
  }

  async function install(){
    if(installed){toast('<b>이미 홈 화면 앱으로 실행 중입니다.</b>');return}
    if(isKakao()){showGuide('kakao');return}
    if(deferred){
      const p=deferred;deferred=null;
      try{
        await p.prompt();const c=await p.userChoice;
        if(c?.outcome==='accepted'){
          installed=true;paint();localStorage.setItem(key('installed'),'1');return;
        }
      }catch(_){ }
    }
    showGuide('manual');
  }

  function maybePromptAfterLogin(){
    if(installed||!isMobile())return;
    if(isKakao()){
      try{if(sessionStorage.getItem('gspa.pwa.kakaoGuide.session')==='shown')return}catch(_){ }
      setTimeout(()=>showGuide('kakao'),500);return;
    }
    if(localStorage.getItem(key('installHint'))==='shown')return;
    localStorage.setItem(key('installHint'),'shown');
    const s=state();
    setTimeout(()=>toast(`<b>${s.label}을(를) 홈 화면에 추가할 수 있습니다.</b><br><button type="button" id="pwaToastInstall">바로가기 만들기</button>`),700);
    setTimeout(()=>{const x=document.getElementById('pwaToastInstall');if(x)x.onclick=install},760);
  }

  function autoKakaoGuide(){
    if(installed||!isKakao())return;
    try{if(sessionStorage.getItem('gspa.pwa.kakaoGuide.session')==='shown')return}catch(_){ }
    setTimeout(()=>showGuide('kakao'),650);
  }

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;paint()});
  window.addEventListener('appinstalled',()=>{installed=true;deferred=null;paint();localStorage.setItem(key('installed'),'1')});
  window.addEventListener('DOMContentLoaded',()=>{
    paint();btn()?.addEventListener('click',install);
    autoKakaoGuide();
    if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  });
  window.GSPA_PWA={install,paint,maybePromptAfterLogin,showGuide,copyAddress,isKakao};
})();
