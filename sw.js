/* PokéRun Tactics service worker.
   Network first for everything: you always get the newest version when online, and whatever you've
   already played is served from the cache when you're offline. Nothing is ever pinned to an old build. */
const CACHE='pokerun-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    try{const res=await fetch(req);if(res&&res.ok){const c=await caches.open(CACHE);c.put(req,res.clone());}return res;}
    catch(err){const hit=await caches.match(req,{ignoreSearch:false})||await caches.match(req,{ignoreSearch:true});if(hit)return hit;throw err;}
  })());
});
