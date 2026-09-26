const STATIC='croatia-static-v33';
const GUIDE='croatia-guidebook-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k.startsWith('croatia-static-')&&k!==STATIC).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const isGuide=url.pathname.endsWith('/docs/croatia_guidebook_20260922.pdf');
  e.respondWith((async()=>{
    const cache=await caches.open(isGuide?GUIDE:STATIC);
    const hit=await cache.match(req,{ignoreSearch:false});if(hit)return hit;
    try{const res=await fetch(req);if(res&&res.ok){try{await cache.put(req,res.clone())}catch(_){}}return res}catch(err){
      if(req.mode==='navigate'){const indexHit=await cache.match(new URL('./index.html',self.registration.scope).href);if(indexHit)return indexHit}
      throw err;
    }
  })());
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of cs){if('focus'in c){await c.focus();try{c.navigate('./#group')}catch(_){}return}}if(self.clients.openWindow)return self.clients.openWindow('./#group')})())});