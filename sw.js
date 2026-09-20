self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of cs){if('focus'in c){await c.focus();try{c.navigate('./#group')}catch(_){}return}}if(self.clients.openWindow)return self.clients.openWindow('./#group')})())});
