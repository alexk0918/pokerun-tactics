/* PokéRun Tactics service worker.
   - The game itself (HTML, scripts, data): network first, so you always get the newest version when online,
     and the cached copy when you're offline.
   - Assets (sprites, portraits, items, effects, sounds): cache first. They're downloaded once into the offline pack
     (js/offline.js keeps them up to date from asset-manifest.json) and then load instantly, online or not.
   - Google Fonts are cached too, so text looks the same offline. */
const APP='pokerun-app-v2',PACK='pokerun-pack';let packC=null;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==APP&&k!==PACK)await caches.delete(k);await self.clients.claim();})()));
const isFont=u=>u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
// requests from the offline downloader (x-pack header) skip the worker: it saves those files itself
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||req.headers.get('x-pack'))return;const url=new URL(req.url);
  const same=url.origin===location.origin;if(!same&&!isFont(url))return;
  const asset=same&&url.pathname.includes('/assets/');
  if(asset||isFont(url)){e.respondWith((async()=>{
    // exact match first: an ignoreSearch lookup scans the whole pack, which is slow with thousands of files
    const c=packC||(packC=await caches.open(PACK));const hit=await c.match(req)||(url.search?await c.match(url.origin+url.pathname):null);if(hit)return hit;
    try{const res=await fetch(req);if(res&&(res.ok||res.type==='opaque'))c.put(req,res.clone());return res;}
    catch(err){return new Response('',{status:504,statusText:'offline'});}
  })());return;}
  e.respondWith((async()=>{
    try{const res=await fetch(req);if(res&&res.ok){const c=await caches.open(APP);c.put(req,res.clone());}return res;}
    catch(err){const hit=await caches.match(req)||await caches.match(req,{ignoreSearch:true})||(req.mode==='navigate'?await caches.match('./index.html',{ignoreSearch:true})||await caches.match('./',{ignoreSearch:true}):null);
      if(hit)return hit;return new Response('',{status:504,statusText:'offline'});}
  })());
});
