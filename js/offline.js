"use strict";
/* PokéRun Tactics — play offline.
   Everything the game can show is listed in asset-manifest.json (built by tools/manifest.py).
   While the game loads, the core pack (items, effects, sounds, tiles, data, the substitute Pokémon) is saved on this device;
   then every Pokémon's sprites, portraits and shinies download in the background, the current run's Pokémon first.
   Saves always live on this device (localStorage), so a run started offline simply carries on when you reconnect.
   Anything that still can't load falls back to a substitute after a few seconds (see loadImg in game.js). */
const OFF={PACK:'pokerun-pack',APP:'pokerun-app-v2',man:null,have:null,queue:[],busy:0,done:0,total:0,bytes:0,got:0,state:'idle',pri:new Set()};
const OFFKEY='pokerun-pack-v1';
function offHave(){if(OFF.have)return OFF.have;try{OFF.have=JSON.parse(localStorage.getItem(OFFKEY)||'{}');}catch(e){OFF.have={};}return OFF.have;}
let offSaveT=0;function offSave(){if(offSaveT)return;offSaveT=setTimeout(()=>{offSaveT=0;try{localStorage.setItem(OFFKEY,JSON.stringify(OFF.have));}catch(e){}},1500);}
addEventListener('pagehide',()=>{try{localStorage.setItem(OFFKEY,JSON.stringify(OFF.have));}catch(e){}});
const offOK=()=>'caches' in window&&location.protocol!=='file:';
async function offManifest(){if(OFF.man)return OFF.man;
  try{const r=await fetch('asset-manifest.json',{cache:'no-cache'});if(r.ok){OFF.man=await r.json();try{localStorage.setItem(OFFKEY+'-man',JSON.stringify({v:OFF.man.v}));}catch(e){}return OFF.man;}}catch(e){}
  try{const c=await caches.open(OFF.APP);const r=await caches.match('asset-manifest.json',{ignoreSearch:true});if(r){OFF.man=await r.json();return OFF.man;}}catch(e){}
  return null;}
// fetch one file into the pack (only if it's new or changed)
async function offGet(cache,[path,size,h]){const have=offHave();if(have[path]===h)return true;
  try{const r=await fetch(path,{cache:have[path]?'reload':'default'});if(!r.ok)return false;await cache.put(path,r);have[path]=h;OFF.got+=size;offSave();return true;}catch(e){return false;}}
async function offRun(list,cache,conc,onStep){let i=0,ok=0;const work=async()=>{while(i<list.length){const e=list[i++];if(await offGet(cache,e))ok++;OFF.done++;onStep&&onStep();}};
  await Promise.all(Array.from({length:conc},work));return ok;}
/* during the loading screen: the core pack and the game's own files */
async function offCore(L){if(!offOK())return;try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});}catch(e){}
  const man=await offManifest();if(!man)return;const cache=await caches.open(OFF.PACK);const have=offHave();
  const need=man.core.filter(e=>have[e[0]]!==e[2]);
  // the game shell, so the page itself opens offline
  try{const app=await caches.open(OFF.APP);const shell=['./','index.html','asset-manifest.json','sw.js',...[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean)];
    await Promise.all(shell.map(u=>fetch(u).then(r=>r.ok&&app.put(u,r)).catch(()=>0)));}catch(e){}
  if(!need.length||!navigator.onLine)return;
  const total=need.length;let n=0;const t0=performance.now();
  await Promise.race([offRun(need,cache,8,()=>{n++;if(L)L.set(88+Math.round(8*n/total),`Packing for offline play… ${Math.round(100*n/total)}%`);}),new Promise(r=>setTimeout(r,45000))]);
}
/* in the background: every Pokémon (and the music), current run first */
function offAll(){if(!offOK()||OFF.state==='running')return;OFF.state='running';(async()=>{
  const man=await offManifest();if(!man){OFF.state='idle';return;}const cache=await caches.open(OFF.PACK);const have=offHave();
  // if the browser cleared the cache, forget what we thought we had
  try{const keys=new Set((await cache.keys()).map(r=>decodeURI(new URL(r.url).pathname)));const base=decodeURI(new URL('.',location.href).pathname);for(const k in have)if(!keys.has(base+k)){delete have[k];}offSave();}catch(e){}
  const all=[];for(const d in man.dex)for(const e of man.dex[d])all.push(e);for(const e of man.music)all.push(e);for(const e of man.core)all.push(e);
  OFF.total=all.length;OFF.bytes=all.reduce((a,e)=>a+e[1],0);OFF.got=all.filter(e=>have[e[0]]===e[2]).reduce((a,e)=>a+e[1],0);
  OFF.done=all.filter(e=>have[e[0]]===e[2]).length;offPill();
  const pending=()=>{const out=[];for(const d of OFF.pri)for(const e of(man.dex[d]||[]))if(have[e[0]]!==e[2])out.push(e);
    if(out.length)return out;return all.filter(e=>have[e[0]]!==e[2]);};
  let fails=0;
  while(true){if(!navigator.onLine){OFF.state='paused';offPill();await new Promise(r=>addEventListener('online',r,{once:true}));OFF.state='running';}
    const list=pending().slice(0,40);if(!list.length)break;OFF.pri.clear();
    const before=OFF.done;const ok=await offRun(list,cache,(typeof mode!=='undefined'&&mode==='combat')?2:5,null);offPill();
    if(!ok){if(++fails>5){OFF.state='error';offPill();return;}await new Promise(r=>setTimeout(r,5000));}else fails=0;}
  OFF.state='ready';offPill();})();}
// the Pokémon a run can meet download first
function offPrioritize(dexes){const m=OFF.man;if(!m)return;for(const d of dexes){const k=String(d);if(m.dex[k])OFF.pri.add(k);const s=typeof SM!=='undefined'&&SM[d]&&SM[d].base;if(s&&m.dex[String(s)])OFF.pri.add(String(s));}}
/* a small status pill on the title screen */
function offPill(){let el=document.getElementById('offpill');if(!el){el=document.createElement('div');el.id='offpill';document.body.appendChild(el);}
  const pct=OFF.bytes?Math.floor(100*OFF.got/OFF.bytes):0,mb=x=>Math.round(x/1e6);
  const txt=!navigator.onLine?(OFF.state==='ready'?'Offline: everything is saved on this device':`Offline: playing from this device (${pct}% saved)`)
    :OFF.state==='ready'?'Ready to play offline':OFF.state==='error'?'Offline pack paused: will retry next time'
    :OFF.total?`Saving for offline play: ${pct}% (${mb(OFF.got)} of ${mb(OFF.bytes)} MB)`:'';
  el.textContent=txt;el.className=(!navigator.onLine?'off ':'')+(OFF.state==='ready'?'ok':'');el.hidden=!txt||(typeof run!=='undefined'&&run&&typeof mode!=='undefined'&&mode!=='title'&&navigator.onLine);}
addEventListener('online',()=>{offPill();if(typeof toast==='function')toast('Back online. Your progress is saved on this device.');if(OFF.state!=='ready')offAll();});
addEventListener('offline',()=>{offPill();if(typeof toast==='function')toast('You\'re offline. Keep playing: everything saves on this device.');});
setInterval(()=>{if(OFF.state==='running')offPill();},2000);
