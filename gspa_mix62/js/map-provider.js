/* MIX45 shared map provider.
 * One Google Maps loader for the whole app, with persistent auth-failure detection.
 * Google is always preferred. Consumers may fall back to OpenStreetMap while Google is unavailable.
 */
(function(){
  'use strict';

  let googlePromise=null;
  let status='idle'; // idle | loading | loaded | healthy | failed
  let reason='';
  let authFailed=false;
  let lastHealthyAt=0;
  let lastAttemptAt=0;

  const emit=()=>{
    try{
      window.dispatchEvent(new CustomEvent('gspa-google-map-status',{detail:{status,reason,authFailed,lastHealthyAt,lastAttemptAt}}));
    }catch(_){ }
  };

  function setStatus(next,why=''){
    status=next;
    reason=why||'';
    if(next==='failed')authFailed=true;
    if(next==='healthy'){
      authFailed=false;
      lastHealthyAt=Date.now();
      reason='';
    }
    emit();
  }

  function key(){
    try{return typeof GOOGLE_MAPS_API_KEY!=='undefined'?String(GOOGLE_MAPS_API_KEY||''):''}catch(_){return''}
  }

  // Keep this hook installed for the whole page lifetime. Google can report auth
  // failure after the JS callback has already fired and after google.maps exists.
  const priorAuthFailure=window.gm_authFailure;
  window.gm_authFailure=function(){
    setStatus('failed','auth');
    try{
      console.warn('[GSPA Maps] Google Maps authentication/referrer/billing failure',{
        origin:location.origin,
        href:location.href
      });
    }catch(_){ }
    if(typeof priorAuthFailure==='function'){
      try{priorAuthFailure()}catch(_){ }
    }
  };

  function waitExisting(resolve,reject){
    let n=0;
    const t=setInterval(()=>{
      n++;
      if(window.google?.maps){clearInterval(t);setStatus('loaded');resolve(window.google.maps)}
      else if(n>=60){clearInterval(t);googlePromise=null;setStatus('failed','timeout');reject(new Error('Google Maps load timeout'))}
    },250);
  }

  function ensureGoogle(options={}){
    const force=!!options.force;
    if(navigator.onLine===false)return Promise.reject(new Error('offline'));
    lastAttemptAt=Date.now();

    // A retry means: allow a fresh map instance to test whether Cloud settings or
    // the network have recovered. The script itself does not need to be reloaded.
    if(force && window.google?.maps){
      authFailed=false;
      status='loaded';
      reason='';
      emit();
      return Promise.resolve(window.google.maps);
    }
    if(window.google?.maps && !authFailed)return Promise.resolve(window.google.maps);
    if(window.google?.maps && authFailed && !force)return Promise.reject(new Error('Google Maps authentication failed'));
    if(googlePromise)return googlePromise;

    googlePromise=new Promise((resolve,reject)=>{
      const apiKey=key();
      if(!apiKey){setStatus('failed','missing-key');googlePromise=null;reject(new Error('Google Maps API key missing'));return;}
      const existing=document.querySelector('script[data-gspa-google-loader="1"],script[src*="maps.googleapis.com/maps/api/js"]');
      if(existing){setStatus('loading');waitExisting(resolve,reject);return;}

      const cb='__gspaGoogleMapsReady45';
      let done=false;
      const finishOk=()=>{
        if(done)return;
        done=true;
        try{delete window[cb]}catch(_){ }
        if(window.google?.maps){setStatus('loaded');resolve(window.google.maps)}
        else{googlePromise=null;setStatus('failed','callback-without-maps');reject(new Error('Google Maps callback without maps'))}
      };
      const finishErr=(why)=>{
        if(done)return;
        done=true;
        try{delete window[cb]}catch(_){ }
        googlePromise=null;
        setStatus('failed',why||'network');
        reject(new Error('Google Maps '+(why||'load failed')));
      };

      window[cb]=finishOk;
      const s=document.createElement('script');
      s.dataset.gspaGoogleLoader='1';
      s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${cb}&v=weekly&loading=async&language=ko`;
      s.async=true;
      s.defer=true;
      s.onerror=()=>finishErr('network');
      setStatus('loading');
      document.head.appendChild(s);
      setTimeout(()=>{
        if(done)return;
        if(window.google?.maps)finishOk();
        else finishErr('timeout');
      },15000);
    }).finally(()=>{
      // Keep a resolved/failed library reusable through window.google.maps, but do
      // not permanently pin a rejected promise.
      if(!window.google?.maps)googlePromise=null;
    });
    return googlePromise;
  }

  function markHealthy(){setStatus('healthy')}
  function markFailure(why='map-render'){setStatus('failed',why)}
  function isFailed(){return status==='failed'||authFailed}
  function isHealthy(){return status==='healthy'&&!authFailed}
  function getStatus(){return{status,reason,authFailed,lastHealthyAt,lastAttemptAt,origin:location.origin,href:location.href}}

  window.GSPA_MapProvider={ensureGoogle,markHealthy,markFailure,isFailed,isHealthy,getStatus};
})();
