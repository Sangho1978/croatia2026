/* MIX86: real-time temperature in the compact top-left header (Open-Meteo current observations).
 * The itinerary's selected forecast date must never change this current observation.
 * No device GPS or location permission is requested; use today's scheduled city.
 */
(function(){
  'use strict';
  const PERIOD=30*60*1000,MAX_AGE=90*60*1000;
  const CACHE='cro.current-weather.'+(window.GSPA_TRIP_ID||'croatia');
  let lastAttempt=0,requesting=false;
  window.GSPA_CurrentWeather={status:'loading',temperature:null};
  // Show fresh cached conditions immediately after reload (clearly labeled "saved").
  try{
    const cached=JSON.parse(localStorage.getItem(CACHE)||'null');
    const t=typeof weatherTarget==='function'?weatherTarget():null;
    if(cached?.date===t?.date&&t?.date===(typeof croDate==='function'?croDate():null)&&Number.isFinite(cached?.temperature)&&Date.now()-cached.fetchedAt<MAX_AGE){
      window.GSPA_CurrentWeather={...cached,status:'cached'};
    }
  }catch(_){ }

  function spot(){
    if(typeof weatherTarget!=='function')return null;
    const w=weatherTarget();
    // Only label a temperature "current" if the trip has a location for this day.
    if(!w||w.date!==(typeof croDate==='function'?croDate():''))return null;
    return w;
  }
  function publish(data){window.GSPA_CurrentWeather=data;window.dispatchEvent(new Event('cro-current-weather'));}
  async function refresh(force=false){
    if(requesting||(!force&&document.hidden))return;
    const w=spot();
    if(!force&&Date.now()-lastAttempt<PERIOD&&window.GSPA_CurrentWeather?.date===w?.date)return;
    if(!w){publish({status:'unavailable',temperature:null});return;}
    lastAttempt=Date.now();requesting=true;
    const controller=new AbortController(),limit=setTimeout(()=>controller.abort(),12000);
    try{
      const tz=typeof weatherTimeZone==='function'?weatherTimeZone(w):(window.GSPA_TRIP_TIMEZONE||'Europe/Zagreb');
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(w.lat)}&longitude=${encodeURIComponent(w.lon)}&current=temperature_2m,weather_code&timezone=${encodeURIComponent(tz)}`;
      const response=await fetch(url,{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json(),c=data?.current,temp=Number(c?.temperature_2m);
      if(c?.temperature_2m==null||!Number.isFinite(temp))throw new Error('Current temperature unavailable');
      const observed=String(c.time||'').match(/T(\d{2}:\d{2})/);
      const state={status:'ok',temperature:temp,icon:typeof weatherIcon==='function'?weatherIcon(Number(c.weather_code)):'🌤️',observedTime:observed?observed[1]:'--:--',place:w.name,date:w.date,fetchedAt:Date.now()};
      try{localStorage.setItem(CACHE,JSON.stringify(state));}catch(_){ }
      publish(state);
    }catch(error){
      let saved=null;try{saved=JSON.parse(localStorage.getItem(CACHE)||'null');}catch(_){ }
      if(saved?.date===w.date&&Number.isFinite(saved?.temperature)&&Date.now()-saved.fetchedAt<MAX_AGE){
        publish({...saved,status:'cached'});
      }else publish({status:'error',temperature:null,place:w.name,date:w.date});
    }finally{clearTimeout(limit);requesting=false;}
  }
  window.GSPA_refreshCurrentWeather=()=>{lastAttempt=0;return refresh(true);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>refresh(true),{once:true});
  else refresh(true);
  setInterval(()=>refresh(false),5*60*1000); // Detect date/city changes without extra calls inside the refresh interval.
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false)});
})();
