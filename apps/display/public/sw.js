const VERSION='starkid-display-v1';
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(c=>c.addAll(['/','/models/earth.glb','/models/mars.glb'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('starkid-display-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET')return;
 if(url.origin!==location.origin){if((url.hostname==='epic.gsfc.nasa.gov'&&url.pathname.includes('/archive/')||url.hostname==='images-assets.nasa.gov'))event.respondWith(caches.open(VERSION).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;const r=await fetch(event.request);if(r.ok||r.type==='opaque'){const keys=(await cache.keys()).filter(k=>k.url.includes('/archive/')||k.url.includes('images-assets.nasa.gov'));if(keys.length>=8)await cache.delete(keys[0]);await cache.put(event.request,r.clone());}return r;}));return;}
 if(url.pathname.startsWith('/api/display/'))return;
 if(url.pathname.startsWith('/src/')||url.pathname.startsWith('/@'))return;
 event.respondWith(caches.open(VERSION).then(async cache=>{if(event.request.mode==='navigate'){try{const r=await fetch(event.request);if(r.ok)await cache.put('/',r.clone());return r;}catch{return await cache.match('/')||Response.error();}}const hit=await cache.match(event.request);if(hit)return hit;const r=await fetch(event.request);if(r.ok)await cache.put(event.request,r.clone());return r;}));
});
