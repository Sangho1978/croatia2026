/* MIX12: attendance in-app notices + optional system notifications while the web app is alive.
 * This is not server push. When the browser/app is fully closed or suspended, a backend Web Push/FCM sender is required.
 */
(function(){
  'use strict';
  const trip=(typeof TRIP_CODE!=='undefined'?TRIP_CODE:'trip'),START_KEY='cro.att.notice.start.'+trip,DONE_KEY='cro.att.notice.done.'+trip;
  let reg=null;
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
  function toast(text,kind='start'){
    let el=document.getElementById('attendanceGlobalNotice');if(!el){el=document.createElement('div');el.id='attendanceGlobalNotice';el.className='attendance-global-notice';el.setAttribute('role','status');el.setAttribute('aria-live','assertive');document.body.appendChild(el)}
    el.className='attendance-global-notice show '+kind;el.textContent=text;clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),5500);
    const local=document.getElementById('attAnnouncement');if(local){local.hidden=false;local.className='att-announcement '+kind;local.textContent=text;}
    if(navigator.vibrate)try{navigator.vibrate(kind==='done'?[100,60,100]:[80])}catch(_){}
  }
  async function ensureSW(){if(!('serviceWorker'in navigator)||!window.isSecureContext)return null;try{reg=reg||await navigator.serviceWorker.register('./sw.js?v=20260920-MIX12',{scope:'./'});return reg}catch(_){return null}}
  async function system(title,body,tag){if(!('Notification'in window)||Notification.permission!=='granted')return false;const r=await ensureSW();if(!r)return false;try{await r.showNotification(title,{body,tag,renotify:true,data:{url:'./#group'},badge:'',silent:false});return true}catch(_){return false}}
  async function enable(){
    const help=document.getElementById('attNotifyHelp');
    if(isIOS()&&!standalone()){toast('아이폰은 Safari에서 홈 화면에 추가한 뒤 알림을 켤 수 있습니다.','info');if(help)help.textContent='iPhone: 홈 화면에 추가 후 알림 허용';paint();return}
    if(!('Notification'in window)||!('serviceWorker'in navigator)){toast('이 브라우저는 시스템 알림을 지원하지 않습니다. 앱 안 알림은 계속 표시됩니다.','info');if(help)help.textContent='시스템 알림 미지원 · 앱 안 알림 사용';paint();return}
    try{await ensureSW();const p=Notification.permission==='default'?await Notification.requestPermission():Notification.permission;if(p==='granted'){toast('출석 시작·완료 시스템 알림을 켰습니다.','done');if(help)help.textContent='시스템 알림 허용됨'}else{toast('알림 권한이 허용되지 않았습니다. 앱 안 알림은 계속 표시됩니다.','info');if(help)help.textContent='알림 권한 미허용'}}catch(_){toast('알림 설정을 확인해 주세요. 앱 안 알림은 계속 표시됩니다.','info')}paint();
  }
  function paint(){const b=document.getElementById('attNotifyBtn'),h=document.getElementById('attNotifyHelp');if(!b)return;if(isIOS()&&!standalone()){b.textContent='🔔 알림 사용 방법';return}if(!('Notification'in window)){b.textContent='🔔 앱 안 알림';return}if(Notification.permission==='granted'){b.textContent='🔔 알림 ON';b.classList.add('is-on');if(h)h.textContent='앱 실행 중 출석 시작·완료 알림'}else{b.textContent='🔔 알림 켜기';b.classList.remove('is-on')}}
  function announceStart(meta){if(!meta?.id)return;const last=localStorage.getItem(START_KEY);if(last===meta.id)return;localStorage.setItem(START_KEY,meta.id);const name=meta.title||'출석체크',text=`${name}가 시작되었습니다. 출석체크 해주세요.`;toast(text,'start');system('출석체크 시작',text,'attendance-'+meta.id+'-start')}
  function announceComplete(meta){if(!meta?.id)return;const last=localStorage.getItem(DONE_KEY);if(last===meta.id)return;localStorage.setItem(DONE_KEY,meta.id);const text=`${meta.title||'출석체크'} — 28명 모두 출석 체크가 완료되었습니다.`;toast(text,'done');system('출석체크 완료',text,'attendance-'+meta.id+'-done')}
  document.addEventListener('DOMContentLoaded',()=>{paint();ensureSW()});
  window.AttendanceNotify={enable,announceStart,announceComplete,paint,get supported(){return 'Notification'in window&&'serviceWorker'in navigator},get truePush(){return false}};
})();
