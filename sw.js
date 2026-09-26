const STATIC='gspa-static-v43';
const GUIDE='gspa-guidebook-shared-v2';
const CORE=[
  "./index.html",
  "./trips.html",
  "./platform/trips.js",
  "./platform/login-directory.js",
  "./js/trip-context.js",
  "./js/trip-data-loader.js",
  "./js/trip-ui.js",
  "./js/route-map-engine.js",
  "./trips/turkiye1/data.js",
  "./css/mix40-multitrip.css",
  "./css/mix43-fixes.css",
  "./manifest.webmanifest",
  "./css/action-first.css",
  "./css/app.css",
  "./css/attendance-prep.css",
  "./css/compact-header.css",
  "./css/expense-ledger.css",
  "./css/field-tools.css",
  "./css/integration.css",
  "./css/mix03.css",
  "./css/mix30-ui.css",
  "./css/mix31-ui.css",
  "./css/mix32-ui.css",
  "./css/mix35-final.css",
  "./css/mix36-ui.css",
  "./css/mix37-ui.css",
  "./css/mix38-ui.css",
  "./css/shop-food.css",
  "./css/travel-news.css",
  "./css/usability.css",
  "./js/app-core.js",
  "./js/attendance-notify.js",
  "./js/attendance.js",
  "./js/compact-header.js",
  "./js/config.js",
  "./js/expense-fx.js",
  "./js/expenses.js",
  "./js/field-tools.js",
  "./js/flight-details.js",
  "./js/fx-service.js",
  "./js/guidebook-cache.js",
  "./js/integration.js",
  "./js/location-session.js",
  "./js/low-data.js",
  "./js/mix30-ui.js",
  "./js/mix34-offline.js",
  "./js/mix35-final.js",
  "./js/mix36-ui.js",
  "./js/mix37-ui.js",
  "./js/mobile-ui.js",
  "./js/net-meter.js",
  "./js/ops.js",
  "./js/photos.js",
  "./js/preparation.js",
  "./js/receipt-ai.js",
  "./js/receipt-ocr.js",
  "./js/receipt-store.js",
  "./js/router.js",
  "./js/runtime-support.js",
  "./js/shop-food.js",
  "./js/time-dual.js",
  "./js/travel-news.js",
  "./js/usability.js",
  "./js/videos.js",
  "./js/xlsx-lite.js",
  "./data/checklist.js",
  "./data/flight-plan.js",
  "./data/hotels.js",
  "./data/itinerary.js",
  "./data/route-points.js",
  "./data/roster.js",
  "./data/hana-eur.json",
  "./assets/images/embedded_03_15d3ba61ec.jpg",
  "./assets/images/login_three_countries.jpg",
  "./assets/images/hotel_grand_park.jpg",
  "./assets/images/hotel_plaza_duce.jpg",
  "./assets/images/hotel_ilirija.jpg",
  "./assets/images/hotel_kadoor.jpg",
  "./assets/images/hotel_ergife.jpg",
  "./assets/images/turkiye1/bosphorus.jpg",
  "./assets/images/turkiye1/cistern.jpg",
  "./assets/images/turkiye1/pamukkale.jpg",
  "./assets/images/turkiye1/ephesus.jpg",
  "./assets/images/turkiye1/bursa.jpg",
  "./assets/images/turkiye1/antalya_cruise.jpg",
  "./assets/images/turkiye1/istanbul_core.jpg",
  "./assets/images/turkiye1/pierre_loti.jpg",
  "./assets/images/turkiye1/hotel_hampton.jpg",
  "./assets/images/turkiye1/hotel_ramada.jpg",
  "./assets/images/turkiye1/hotel_adempira.jpg",
  "./assets/images/turkiye1/hotel_doubletree.jpg",
  "./assets/images/turkiye1/hotel_sheraton.jpg"
];
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(STATIC);for(const u of CORE){try{await c.add(new Request(u,{cache:'default'}))}catch(_){}}await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>(k.startsWith('croatia-static-')||k.startsWith('gspa-static-'))&&k!==STATIC).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const decoded=decodeURIComponent(url.pathname);
  const isGuide=/\/docs\/(?:croatia_guidebook|turkiye1_guidebook)\.pdf$/i.test(decoded)||/\/docs\/[^/]*안내책자\.pdf$/u.test(decoded);
  e.respondWith((async()=>{
    const cache=await caches.open(isGuide?GUIDE:STATIC);
    const hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;
    try{const res=await fetch(req);if(res&&res.ok){try{await cache.put(req,res.clone())}catch(_){}}return res}catch(err){
      if(req.mode==='navigate'){const indexHit=await cache.match('./index.html',{ignoreSearch:true});if(indexHit)return indexHit}
      if(req.destination==='image')return new Response('',{status:204,statusText:'Offline image not cached'});
      throw err;
    }
  })());
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of cs){if('focus'in c){await c.focus();try{c.navigate('./#group')}catch(_){}return}}if(self.clients.openWindow)return self.clients.openWindow('./#group')})())});
