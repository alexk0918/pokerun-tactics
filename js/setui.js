"use strict";
/* PokéRun Tactics — set features you unlock by hitting breakpoints: their menus, their buttons in the side panel,
   and what they put on the board (water lanes, garden plots, the Daycare, the Star, Roulette spins …).
   Every menu is plain buttons, so mouse, keyboard, touch and controller all work the same way. */

const TILES={};
(function(){for(const k of['water','shallow','tallgrass','meadow','sea']){const im=new Image();im.src='assets/tiles/'+k+'.png';TILES[k]=im;}})();
const TILEM={water:{n:20,s:48,ft:.133},shallow:{n:20,s:48,ft:.133},tallgrass:{n:1,s:48,ft:1},meadow:{n:1,s:48,ft:1},sea:{n:11,s:48,ft:.3}};
// fill a hex with a real PMD dungeon tile (animated when the tileset is)
function tileHex(k,c,r,t,alpha=1){const im=TILES[k],m=TILEM[k];if(!im||!im.complete||!im.naturalWidth)return;const p=hexXY(c,r),f=Math.floor(t/m.ft+(c*3+r*5)*.37)%m.n;
  ctx.save();hexPath(ctx,p.x,p.y,R-1,SQ);ctx.clip();ctx.globalAlpha=alpha;ctx.drawImage(im,f*m.s,0,m.s,m.s,Math.round(p.x-17),Math.round(p.y-17),34,34);ctx.restore();ctx.globalAlpha=1;}
function tileAt(k,x,y,w,h,t,alpha=1){const im=TILES[k],m=TILEM[k];if(!im||!im.complete||!im.naturalWidth)return;const f=Math.floor(t/m.ft)%m.n;ctx.globalAlpha=alpha;
  for(let yy=0;yy<h;yy+=24)for(let xx=0;xx<w;xx+=24)ctx.drawImage(im,f*m.s,0,Math.min(48,(w-xx)*2),Math.min(48,(h-yy)*2),Math.round(x+xx),Math.round(y+yy),Math.min(24,w-xx),Math.min(24,h-yy));ctx.globalAlpha=1;}
// one frame of a PMD particle sheet, drawn as a still sprite
function fxStill(name,frame,x,y,sc=1,alpha=1){const m=typeof FXM!=='undefined'&&FXM[name];if(!m)return;const im=fxImg(name);if(!im.complete||!im.naturalWidth)return;const s=m[1],f=Math.max(0,Math.min(m[0]-1,frame));
  ctx.globalAlpha=alpha;ctx.drawImage(im,f*s,0,s,s,Math.round(x-s*sc/2),Math.round(y-s*sc/2),Math.round(s*sc),Math.round(s*sc));ctx.globalAlpha=1;}
const fxFrames=name=>typeof FXM!=='undefined'&&FXM[name]?FXM[name][0]:1;

const fieldCt=()=>run?countTraits(Object.values(run.board)):{};
const featTier=k=>run?tierOf(k,fieldCt()[k]||0):0;
const DAYCARE_XY={x:494,y:200};
function plotsMax(){return[0,1,2,3,3][featTier('Garden')];}

/* ---------- the side-panel buttons ---------- */
const FEATS=[
  {k:'rocket',set:'Team Rocket',need:1,icon:'big-nugget',n:'Rocket HQ',v:()=>`${run.rloot||0} Loot`,open:()=>showRocketHQ()},
  {k:'well',set:'Fae Folk',need:2,icon:'star-piece',n:'Wish Well',v:()=>`${run.wishes||0} Wish${run.wishes===1?'':'es'}`,open:()=>showWishWell()},
  {k:'daycare',set:'Nursery',need:2,icon:'mystery-egg',n:'Daycare',v:()=>`${(run.daycare||[]).length}/${daycareSlots()}`,open:()=>showDaycare()},
  {k:'garden',set:'Garden',need:1,icon:'miracle-seed',n:'Garden Plots',v:()=>PLANT.on?'Planting… tap your hexes':`${(run.plots||[]).length}/${plotsMax()} planted`,open:()=>togglePlant()},
  {k:'dojo',set:'Dojo',need:2,icon:'black-belt',n:'Dojo',v:()=>'Techniques',open:()=>showDojo()},
  {k:'roulette',set:'Oddballs',need:1,icon:'loaded-dice',n:'Roulette',v:()=>'₽1 a spin',open:()=>showRoulette()},
  {k:'flight',set:'Sky Squadron',need:1,icon:'pretty-wing',n:'Flight Plan',v:()=>({back:'Back line',carry:'Carry',healer:'Healer'})[run.flight||'back'],open:()=>showFlightPlan()},
  {k:'myth',set:'Mythical',need:3,icon:'reveal-glass',n:'Mythical Event',v:()=>'A gift awaits',when:()=>run.mythReady,open:()=>showMythEvent()},
  {k:'lab',set:'Fossil',need:2,icon:'old-amber',n:'Revival Lab',v:()=>'Revive a fossil',when:()=>run.labReady,open:()=>showFossilLab()},
];
function featsOpen(){if(!run)return[];const out=FEATS.filter(f=>featTier(f.set)>=f.need&&(!f.when||f.when()));
  const so=run.sketchOffer,su=so&&allOwned().find(u=>u.uid===so.uid);if(su)out.push({k:'sketch',set:'Smeargle',icon:'tm-normal',n:'Sketch',v:()=>`Keep ${kitOf(so.dex).mv.n}?`,open:()=>showSketch()});else if(so)run.sketchOffer=null;
  return out;}
function showSketch(){const so=run.sketchOffer,u=so&&allOwned().find(x=>x.uid===so.uid);if(!u)return;const K=kitOf(so.dex);
  setMenu('Sketch',`${esc(nameOf(u))} sketched <b>${esc(K.mv.n)}</b> from ${esc(D[so.dex].n)}. Keep it for the rest of the run?${u.sketch?` It currently keeps <b>${esc(kitOf(u.sketch).mv.n)}</b>.`:''}`,
    `<div class="setgrid">${optBtn('data-sk="1"',por(so.dex),'Keep '+esc(K.mv.n),'It uses this move every battle','',false)}${optBtn('data-sk="0"',porImg?null:null,'Keep sketching','A new random move each battle','',false)}</div>`,{icon:'tm-normal'});
  ov.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{if(b.dataset.sk==='1')u.sketch=so.dex;else u.sketch=null;run.sketchOffer=null;sfx('click');ov.innerHTML='';renderUI();});}
function setsModsHtml(){if(!run||SIM.on)return'';const fs=featsOpen();const blank=run.bag.map((it,i)=>({it,i})).filter(x=>isBadge(x.it)&&!badgeSet(x.it));
  let h='';if(fs.length||blank.length)h+=`<div class="featrow">${fs.map(f=>`<button class="featbtn" data-feat="${f.k}" ${mode==='plan'||f.k==='flight'?'':'disabled'}><img src="${iconOf(f.icon)}" alt=""><span><b>${f.n}</b><small>${esc(f.v())}</small></span></button>`).join('')}
    ${blank.map(x=>`<button class="featbtn" data-engrave="${x.i}"><img src="${iconOf(badgeIcon(''))}" alt=""><span><b>Engrave badge</b><small>Blank Guild Badge</small></span></button>`).join('')}</div>`;
  for(const k in GATED)h+=`<div class="gated"><b>${esc(k)} capstone locked</b>${GATED[k]==='badge'?'Needs a Guild Badge on the field':`Needs ${capOf(k)} different members`}</div>`;
  return h;}
function featClick(e){const b=e.target.closest('[data-feat],[data-engrave]');if(!b)return false;
  if(b.dataset.engrave!==undefined){showEngraver(+b.dataset.engrave);return true;}
  const f=FEATS.find(x=>x.k===b.dataset.feat);if(f){sfx('click');f.open();}return true;}
// first time a feature unlocks, it gets a moment
function featAnnounce(){if(!run||SIM.on)return;run.featSeen=run.featSeen||[];for(const f of featsOpen())if(!run.featSeen.includes(f.k)){run.featSeen.push(f.k);sfx('achieve');banner(`${f.n} unlocked!`,`${f.set} reached its breakpoint`,2200);}}

/* ---------- shared menu shell ---------- */
function setMenu(title,sub,body,opts={}){
  ov.innerHTML=`<div class="scrim" id="sm-scrim"></div><div class="screen"><div class="win featwin ${opts.cls||''}">${opts.icon?`<img class="setwin-ico" src="${iconOf(opts.icon)}" alt="">`:''}<h1 class="h1">${title}</h1><p class="sub">${sub}</p>${body}
    <div class="umacts">${opts.extra||''}<button class="btn" id="sm-back" data-back>Close</button></div></div></div>`;
  const close=()=>{ov.innerHTML='';renderUI();};$('sm-back').onclick=close;$('sm-scrim').onclick=close;
  const first=ov.querySelector('.setopt:not([disabled]),.featopt:not([disabled])')||$('sm-back');first.focus();
  return close;}
const optBtn=(attr,icon,title,sub,cost,dis)=>`<button class="setopt" ${attr} ${dis?'disabled':''}>${icon?`<img src="${icon}" alt="">`:''}<b>${title}</b><span>${sub}</span>${cost?`<em>${cost}</em>`:''}</button>`;

/* ---------- Rocket HQ ---------- */
// three random deals each floor, from a catalog that grows with the Rocket tier
const HQ_DEALS=[{id:'cash',n:'Launder the take',d:'+₽3',c:5},{id:'reroll',n:'Rigged shop',d:'2 free rerolls',c:4},{id:'xp',n:'Training montage',d:'+4 XP',c:6},
  {id:'copy',n:'Cloning machine',d:'A copy of a random bench Pokémon',c:12},{id:'grunt',n:'Recruit',d:'A random ₽2 or ₽3 Pokémon',c:7,t:1},
  {id:'comp',n:'Hot goods',d:'A random item component',c:8,t:2},{id:'swap',n:'Fence it',d:'A free Swap Shop trade (next one)',c:5,t:2},
  {id:'steal',n:'Steal',d:'A Pokémon from your last opponent',c:15,t:3},{id:'craft',n:'Heist',d:'A random completed item',c:18,t:3}];
function hqStock(){const T=featTier('Team Rocket');if(run.hq&&run.hq.T===T&&run.hq.f===run.floor+'/'+actOf())return run.hq;
  const cat=HQ_DEALS.filter(x=>(x.t||1)<=T&&!(x.id==='steal'&&!(run.lastFoes||[]).length));
  run.hq={T,f:run.floor+'/'+actOf(),s:shuffle(cat.slice()).slice(0,3).map(x=>({...x,sold:0}))};return run.hq;}
function showRocketHQ(){const H=hqStock(),T=featTier('Team Rocket'),L=run.rloot||0;
  const vault=T>=4&&!run.vaultDone;
  const body=`<div class="setgrid">${H.s.map((x,i)=>optBtn(`data-hq="${i}"`,null,x.n,x.d,x.sold?'Sold':`${x.c} Loot`,x.sold||L<x.c)).join('')}
    ${vault?optBtn('data-vault="1"',iconOf('relic-gold'),'Giovanni\'s Gambit',`Cash in all ${L} Loot: ₽${Math.floor(L/3)}${L>=40?', a 2★ ₽4 or ₽5 Pokémon':''}${L>=60?' and a relic':''}`,'Once per run',L<10):''}</div>`;
  const close=setMenu('Rocket HQ',`You have <b>${L} Loot</b>. Earn more from Rocket knockouts${T>=2?' and lost rounds':''}. Three new deals every floor.`,body,{cls:'rocketwin',icon:'big-nugget'});
  ov.querySelectorAll('[data-hq]').forEach(b=>b.onclick=()=>{const x=H.s[+b.dataset.hq];if(x.sold||(run.rloot||0)<x.c)return;run.rloot-=x.c;x.sold=1;hqBuy(x.id);sfx('buy');showRocketHQ();});
  const v=ov.querySelector('[data-vault]');if(v)v.onclick=()=>{const L2=run.rloot||0;run.vaultDone=1;run.rloot=0;run.gold+=Math.floor(L2/3);let msg=`+₽${Math.floor(L2/3)}`;
    if(L2>=40){const pool=[...MODE.byCost[3],...MODE.byCost[4]];const r=pick(pool);if(r&&typeof gainUnit==='function'){gainUnit(r,2);msg+=`, ${D[r].n} 2★`;}}
    if(L2>=60){const rc=shuffle(Object.keys(RELICS).filter(r=>!run.relics.includes(r)))[0];if(rc){run.relics.push(rc);msg+=`, ${RELICS[rc].n}`;}}
    sfx('achieve');banner('Jackpot!',msg,2400);close();};}
function hqBuy(id){
  if(id==='cash')run.gold+=3;else if(id==='reroll')run.freeRerolls=(run.freeRerolls||0)+2;else if(id==='xp')gainXP(4);
  else if(id==='comp'){if(run.bag.length<BAGMAX)run.bag.push({k:randComp(),mut:[]});}
  else if(id==='copy'){const b=run.bench.filter(Boolean);const u=b.length?pick(b):pick(allOwned());if(u&&!addCopy(u.root))toast('Your bench is full.');}
  else if(id==='grunt'){const r=pick([...MODE.byCost[1],...MODE.byCost[2]]);if(r&&!addCopy(r))toast('Your bench is full.');}
  else if(id==='swap'){run.freeSwap=(run.freeSwap||0)+1;}
  else if(id==='craft'){if(run.bag.length<BAGMAX)run.bag.push({k:randCraft(),mut:[]});else toast('Your bag is full.');}
  else if(id==='steal'){const r=pick(run.lastFoes);if(r&&!addCopy(r))toast('Your bench is full.');else if(r)toast(`Stolen: ${D[r].n}!`);}
  renderUI();}

/* ---------- Wish Well ---------- */
// three random wishes each floor
const WISHES=[{id:'reroll',n:'Shooting star',d:'3 free rerolls',c:2},{id:'heal',n:'Healing wish',d:'+8 HP',c:3},{id:'item',n:'Wishing star',d:'A random completed item',c:4},
  {id:'unit',n:'Lucky wish',d:'A random ₽4 Pokémon',c:6},{id:'comp',n:'Falling star',d:'A random component',c:2},{id:'xp',n:'Wish upon a star',d:'+5 XP',c:3},{id:'gold',n:'Star Piece',d:'+₽4',c:2}];
function wishOffers(){if(!run.wishOff||run.wishOff.f!==run.floor+'/'+actOf())run.wishOff={f:run.floor+'/'+actOf(),ids:shuffle(WISHES.map(w=>w.id)).slice(0,3)};return run.wishOff.ids.map(id=>WISHES.find(w=>w.id===id));}
function showWishWell(){const W=run.wishes||0,T=featTier('Fae Folk');
  const offers=wishOffers();
  const jir=T>=4&&!run.jirachiDone;
  const body=`<div class="setgrid">${offers.map(o=>optBtn(`data-wish="${o.id}"`,null,o.n,o.d,`${o.c} Wish${o.c>1?'es':''}`,W<o.c)).join('')}${jir?optBtn('data-jirachi="1"',por(385),'Jirachi\'s Wish','Choose one of three ₽3–₽5 Pokémon, at 2★','8 Wishes · once',W<8):''}</div>`;
  setMenu('Wish Well',`You have <b>${W} Wish${W===1?'':'es'}</b>. Each win with Fae Folk active adds ${T>=3?2:1}.`,body,{icon:'star-piece'});
  ov.querySelectorAll('[data-wish]').forEach(b=>b.onclick=()=>{const o=offers.find(x=>x.id===b.dataset.wish);if((run.wishes||0)<o.c)return;run.wishes-=o.c;
    if(o.id==='comp'){if(run.bag.length<BAGMAX)run.bag.push({k:randComp(),mut:[]});}else if(o.id==='xp')gainXP(5);else if(o.id==='gold')run.gold+=4;else if(o.id==='reroll')run.freeRerolls=(run.freeRerolls||0)+3;else if(o.id==='heal')run.hp=Math.min(run.maxHp,run.hp+8);else if(o.id==='item'){if(run.bag.length<BAGMAX)run.bag.push({k:randCraft(),mut:[]});}else if(o.id==='unit'){const r=pick(MODE.byCost[3]);if(r&&!addCopy(r))toast('Your bench is full.');}
    sfx('heal');showWishWell();});
  const j=ov.querySelector('[data-jirachi]');if(j)j.onclick=()=>showJirachi();}
// Jirachi grants one of three random ₽3–₽5 Pokémon, at 2★
function showJirachi(){const U=typeof unlockedSet==='function'?unlockedSet():null;
  if(!run.jirOff){const pool=MODE.roots.filter(r=>(!U||U.has(r))&&MODE.lines[r].cost>=3&&MODE.lines[r].cost<=5);run.jirOff=shuffle(pool).slice(0,3);}
  const list=run.jirOff;
  ov.innerHTML=`<div class="scrim" id="jr-scrim"></div><div class="screen"><div class="win featwin"><img class="featwin-ico" src="${por(385)}" alt=""><h1 class="h1">Jirachi's Wish</h1><p class="sub">Jirachi offers three wishes. The one you choose joins your bench at 2★.</p>
    <div class="setgrid">${list.map(r=>`<button class="setopt" data-jr="${r}"><img src="${por(r)}" alt=""><b>${esc(D[r].n)}</b><span>₽${MODE.lines[r].cost} · ${esc(kitOf(r).styles.slice(0,2).join(', '))}</span></button>`).join('')}</div>
    <div class="umacts"><button class="btn" id="jr-back" data-back>Back</button></div></div></div>`;
  $('jr-back').onclick=()=>showWishWell();$('jr-scrim').onclick=()=>showWishWell();
  ov.querySelectorAll('[data-jr]').forEach(b=>b.onclick=()=>{if((run.wishes||0)<8)return;const r=+b.dataset.jr;run.wishes-=8;run.jirachiDone=1;if(typeof gainUnit==='function')gainUnit(r,2);else addCopy(r);sfx('achieve');banner('Your wish came true!',`${D[r].n} joined at 2★`,2400);ov.innerHTML='';renderUI();});
  (ov.querySelector('.setopt')||$('jr-back')).focus();}

/* ---------- Daycare ---------- */
function showDaycare(){const S=daycareSlots(),dc=run.daycare||[],bench=run.bench.filter(Boolean);
  const body=`<div class="setgrid">${dc.map((u,i)=>optBtn(`data-dtake="${i}"`,porImg(u),esc(nameOf(u)),`+${Math.round((u.dayB||0)*100)}% · ${u.dayN||0} rounds · tap to take back`,'',false)).join('')}
    ${Array.from({length:Math.max(0,S-dc.length)},()=>`<div class="setopt empty"><b>Empty spot</b><span>Leave a bench Pokémon below</span></div>`).join('')}</div>
    ${dc.length<S?`<div class="lbl">Leave a Pokémon</div><div class="setgrid">${bench.map(u=>optBtn(`data-dleave="${u.uid}"`,porImg(u),esc(nameOf(u)),'★'.repeat(u.star),'',false)).join('')||'<p class="sub">Your bench is empty.</p>'}</div>`:''}`;
  setMenu('Daycare',`Pokémon here don't fight, but grow +1% max HP and damage each round (up to +20%) and sometimes lay an Egg.${featTier('Nursery')>=4?' Proud Parents: an Egg every 2 rounds.':''}`,body,{icon:'mystery-egg'});
  ov.querySelectorAll('[data-dtake]').forEach(b=>b.onclick=()=>{daycareTake(+b.dataset.dtake);showDaycare();});
  ov.querySelectorAll('[data-dleave]').forEach(b=>b.onclick=()=>{const u=allOwned().find(x=>x.uid===+b.dataset.dleave);if(u)daycareDrop(u);showDaycare();});}

/* ---------- Garden plots: planting mode on the board ---------- */
const PLANT={on:false};
function togglePlant(){PLANT.on=!PLANT.on;if(PLANT.on)toast(`Planting: tap your hexes to plant or dig up plots (${(run.plots||[]).length}/${plotsMax()}). A plot that stays put grows each round.`);renderUI();}
function plantAt(c,r){if(r<4||r>=ROWS||c<0||c>=COLS)return false;run.plots=run.plots||[];const i=run.plots.findIndex(p=>p.c===c&&p.r===r);
  if(i>=0){run.plots.splice(i,1);sfx('sell');}else{if(run.plots.length>=plotsMax()){toast('All your plots are planted. Tap one to dig it up first.');return true;}run.plots.push({c,r,st:0});sfx('buy');const p=hexXY(c,r);pfx('Leech_Seed_Sprout',p.x,p.y-8,{sc:.8,force:1});}
  renderUI();return true;}
function hexAtPoint(x,y){let best=null,bd=1e9;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r),d=Math.hypot(x-p.x,(y-p.y)/SQ);if(d<bd){bd=d;best={c,r};}}return bd<R?best:null;}

/* ---------- Dojo ---------- */
function showDojo(){const T=featTier('Dojo');const ds=allOwned().filter(u=>unitSets(u).includes('Dojo'));
  const body=`<div class="dojolist">${ds.map(u=>{const b=beltOf(u),two=T>=3&&b>=3;return`<div class="dojorow"><img src="${porImg(u)}" alt=""><div class="dj-n"><b>${esc(nameOf(u))}</b><span class="belt" style="--bc:${BELTCOL[b]}">${BELT[b]} Belt · ${u.kos||0} KOs</span></div>
    <div class="dj-t">${Object.keys(TECH).map(k=>`<button class="setopt mini${u.tech===k?' on':''}" data-tech="${u.uid}:${k}" title="${esc(TECH[k].d)}"><b>${TECH[k].n}</b></button>`).join('')}</div>
    ${two?`<div class="dj-t">${Object.keys(TECH).map(k=>`<button class="setopt mini${u.tech2===k?' on':''}" data-tech2="${u.uid}:${k}"><b>2nd: ${TECH[k].n}</b></button>`).join('')}</div>`:''}</div>`;}).join('')}</div>
    <p class="sub">${Object.values(TECH).map(t=>`<b>${t.n}</b>: ${t.d}.`).join(' ')}</p>`;
  setMenu('Dojo','Teach each Dojo Pokémon a technique. Belts come from knockouts across the run.',body,{icon:'black-belt'});
  ov.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>{const[id,k]=b.dataset.tech.split(':');const u=allOwned().find(x=>x.uid===+id);if(u)u.tech=k;sfx('click');showDojo();});
  ov.querySelectorAll('[data-tech2]').forEach(b=>b.onclick=()=>{const[id,k]=b.dataset.tech2.split(':');const u=allOwned().find(x=>x.uid===+id);if(u)u.tech2=k;sfx('click');showDojo();});}

/* ---------- Roulette ---------- */
function showRoulette(){const os=allOwned().filter(u=>unitSets(u).includes('Oddballs'));if(os.some(u=>!u.spins))oddSpins();const AL=[...SPINS,...SPINS_X];
  const body=`<div class="setgrid">${os.map(u=>optBtn(`data-spin="${u.uid}"`,porImg(u),esc(nameOf(u)),(u.spins||[]).map(s=>{const S=AL.find(x=>x.k===s);return`${S.n}: ${S.d}`;}).join(' · ')||'No spin yet','Spin again: ₽1',run.gold<1)).join('')}</div>`;
  setMenu('Roulette','Every Oddball spins before each battle. Don\'t like a result? Pay ₽1 to spin that Pokémon again.',body,{icon:'loaded-dice'});
  ov.querySelectorAll('[data-spin]').forEach(b=>b.onclick=()=>{if(run.gold<1)return;const u=allOwned().find(x=>x.uid===+b.dataset.spin);if(!u)return;run.gold--;const T=featTier('Oddballs');u.spins=Array.from({length:T>=2?2:1},()=>rollSpin(T>=3));sfx('reroll');showRoulette();});}

/* ---------- Flight Plan ---------- */
function showFlightPlan(){const cur=run.flight||'back';const P=[['back','Back line','Dive onto the farthest enemy'],['carry','Carry','Dive onto the enemy dealing the most damage'],['healer','Healer','Dive onto their healers and supports first']];
  setMenu('Flight Plan','Where should your Sky Squadron dive?',`<div class="setgrid">${P.map(([k,n,d])=>optBtn(`data-fp="${k}"`,null,n+(cur===k?' ✓':''),d,'',false)).join('')}</div>`,{icon:'pretty-wing'});
  ov.querySelectorAll('[data-fp]').forEach(b=>b.onclick=()=>{run.flight=b.dataset.fp;sfx('click');ov.innerHTML='';renderUI();});}

/* ---------- Mythical Event ---------- */
const MYTH_GIFTS=[
  {id:'relic',n:'Wishing Star',d:'A random relic',icon:'star-piece',fn:()=>{const rc=shuffle(Object.keys(RELICS).filter(r=>!run.relics.includes(r)))[0];if(rc){run.relics.push(rc);return RELICS[rc].n;}run.gold+=10;return'₽10';}},
  {id:'gold',n:'Gold Bottle Cap',d:'+₽15',icon:'gold-bottle-cap',fn:()=>{run.gold+=15;return'₽15';}},
  {id:'unit',n:'Event Distribution',d:'A random 2★ ₽4 Pokémon',icon:'cherish-ball',fn:()=>{const r=pick(MODE.byCost[3]);if(r&&typeof gainUnit==='function')gainUnit(r,2);return r?D[r].n+' 2★':'';}},
  {id:'time',n:'Time Travel',d:'Your next lost battle costs no HP',icon:'gracidea',fn:()=>{run.timeTravel=1;return'Celebi will rewind your next loss';}},
  {id:'candy',n:'Rare Candies',d:'+12 XP',icon:'rare-candy',fn:()=>{gainXP(12);return'+12 XP';}},
];
function showMythEvent(){const gifts=shuffle(MYTH_GIFTS.slice()).slice(0,3);
  setMenu('Mythical Event','A mysterious gift has been distributed. Pick one.',`<div class="setgrid">${gifts.map(g=>optBtn(`data-gift="${g.id}"`,iconOf(g.icon),g.n,g.d,'',false)).join('')}</div>`,{icon:'reveal-glass'});
  ov.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>{const g=MYTH_GIFTS.find(x=>x.id===b.dataset.gift);const r=g.fn();run.mythReady=0;run.mythAct=actOf();sfx('achieve');banner(g.n,r,2000);ov.innerHTML='';renderUI();});}

/* ---------- Revival Lab ---------- */
function showFossilLab(){const roots=shuffle([...new Set(FOSSIL_IDS.map(d=>MODE.roots.find(r=>MODE.lines[r].mem.includes(d))).filter(Boolean))]).slice(0,3);
  setMenu('Revival Lab','The scientists can revive one fossil. It joins your bench.',`<div class="setgrid">${roots.map(r=>optBtn(`data-fos="${r}"`,por(r),D[r].n,`₽${MODE.lines[r].cost} line`,'',false)).join('')}</div>`,{icon:'old-amber'});
  ov.querySelectorAll('[data-fos]').forEach(b=>b.onclick=()=>{const r=+b.dataset.fos;if(!addCopy(r)){toast('Your bench is full.');return;}run.labReady=0;run.labAct=actOf();sfx('achieve');banner('Revived!',D[r].n,1800);ov.innerHTML='';renderUI();});}

/* ---------- on the board ---------- */
function previewLanes(){const T=featTier('Leviathans');if(!T)return null;const s=new Set();for(const b of boardUnits())if(unitSets(b.u).includes('Leviathans')){const cols=T>=2?[b.c-1,b.c,b.c+1]:[b.c];for(const q of cols)if(q>=0&&q<COLS)for(let r=0;r<ROWS;r++)s.add(q+','+r);}return s;}
function setsDrawGround(t){if(!run)return;const inBattle=mode==='combat'||mode==='result';
  // water lanes
  const lanes=inBattle?battle&&battle.lanes:(mode==='plan'?previewLanes():null);
  if(lanes)for(const k of lanes){const[c,r]=k.split(',').map(Number);tileHex('water',c,r,t,inBattle?.82:.45);}
  if(inBattle&&battle&&battle.flood)for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)tileHex('shallow',c,r,t,.55);
  if(inBattle&&battle&&battle.coral)for(const k of battle.coral){const[c,r]=k.split(',').map(Number);tileHex('sea',c,r,t,.6);const p=hexXY(c,r);fxStill('Aqua_Ring',Math.floor(t*8)%fxFrames('Aqua_Ring'),p.x,p.y-2,.35,.5);}
  // garden plots
  if(run.plots&&(mode==='plan'||inBattle))for(const p of run.plots){tileHex('tallgrass',p.c,p.r,t,.9);const q=hexXY(p.c,p.r),bob=Math.sin(t*2+p.c)*1;
    if(p.st>=2){fxStill('Petal_Dance_Flower_Pink',0,q.x-5,q.y-3+bob,.55);fxStill('Petal_Dance_Flower_Yellow',0,q.x+5,q.y-1-bob,.5);}
    else fxStill('Leech_Seed_Sprout',p.st?fxFrames('Leech_Seed_Sprout')-1:2,q.x,q.y-4,.6);}
  if(PLANT.on&&mode==='plan')for(let r=4;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r);hexPath(ctx,p.x,p.y,R-2,SQ);ctx.strokeStyle=`rgba(160,240,140,${.5+.3*Math.sin(t*5)})`;ctx.lineWidth=1.5;ctx.stroke();}
  // the Daycare
  if(daycareSlots()&&['plan','combat','result','loot'].includes(mode)){const D0=DAYCARE_XY,n=daycareSlots();
    ctx.fillStyle='rgba(20,40,20,.35)';ctx.beginPath();ctx.ellipse(D0.x,D0.y+12,30,11,0,0,7);ctx.fill();
    ctx.save();ctx.beginPath();ctx.ellipse(D0.x,D0.y+10,28,10,0,0,7);ctx.clip();tileAt('meadow',D0.x-28,D0.y,56,22,t);ctx.restore();
    (run.daycare||[]).forEach((u,i)=>{const x=D0.x+(n>1?(i?10:-10):0),y=D0.y+10;drawSprite(shownDex(u),'Sleep',t+i,DIR.down,x,y,{scale:.8,shiny:!!u.shiny});fxStill('Sleep_Z',Math.floor(t*6+i*3)%fxFrames('Sleep_Z'),x+8,y-22,.45,.9);});
    ctx.font='9px PokeEmerald,"Pixelify Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff7d6';ctx.strokeStyle='#1b2430';ctx.lineWidth=2.5;ctx.strokeText('Daycare',D0.x,D0.y+30);ctx.fillText('Daycare',D0.x,D0.y+30);}
}
function setsDrawOver(t,list){if(!run)return;
  for(const s of list){const u=s.pu||(s.cu&&s.cu.u);if(!u||s.enemy||(s.cu&&s.cu.team===1))continue;if(s.bench&&mode!=='plan')continue;
    const sp=SPR[s.dex],top=s.y-6+(sp?sp.top*(s.sc||1)*sp.k:-24)-8;
    if(u.isStar&&!s.bench)fxStill('Lucky_Chant_Star_Yellow',Math.floor(t*10)%fxFrames('Lucky_Chant_Star_Yellow'),s.x,top-4,.4);
    if(mode==='plan'&&!s.bench&&u.spins&&u.spins.length){ctx.font='8px PokeEmerald,"Pixelify Sans",sans-serif';ctx.textAlign='center';ctx.lineWidth=2.5;ctx.strokeStyle='#1b2430';const AL=[...SPINS,...SPINS_X];
      u.spins.forEach((k,i)=>{const S=AL.find(x=>x.k===k);const y=top-6-i*9;ctx.strokeText(S.n,s.x,y);ctx.fillStyle=SPINS_X.includes(S)?'#ffd34d':'#ffb3f0';ctx.fillText(S.n,s.x,y);});}}
  if((mode==='combat')&&battle&&battle.mark&&battle.mark[0]&&!battle.mark[0].dead){const m=battle.mark[0];fxStill('Lock_On',Math.floor(t*12)%fxFrames('Lock_On'),m.x,m.y-12,.5,.85);}
}
// planting taps on the board (works for the controller cursor too: its A button clicks where it points)
function setsBoardTap(e){if(!PLANT.on||mode!=='plan'||!run)return false;const p=toInternal(e);const h=hexAtPoint(p.x,p.y);if(!h||h.r<4)return false;plantAt(h.c,h.r);return true;}

/* ---------- Guild Hall event and guardian badges ---------- */
if(typeof EVENTS!=='undefined')EVENTS.guild={n:'A Guild Hall',img:()=>iconOf(badgeIcon('')),need:()=>(run.badgesGot||0)<BADGE_RUN_MAX&&Math.random()<.35,
  txt:'A hall full of trainers trading badges. A Wigglytuff at the counter waves you over: the guild will engrave a badge for your team, for a price.',
  opts:[{t:'Buy a Blank Badge',d:'Pay ₽15.',cost:15,fn:()=>{run.gold-=15;giveBlankBadge('Bought at the Guild Hall');return'The guildmaster presses a blank badge into your hand.';}},
    {t:'Trade a 2★ Pokémon',d:'Give up your cheapest 2★ Pokémon for a Blank Badge.',ok:()=>allOwned().some(u=>u.star===2),fn:()=>{const u=allOwned().filter(x=>x.star===2).sort((a,b)=>lineOf(a).cost-lineOf(b).cost)[0];if(u){for(const it of u.items)run.bag.push(it);removeUnit(u);}giveBlankBadge('Traded at the Guild Hall');return`${u?nameOf(u):'Your Pokémon'} joins the guild. You get a blank badge in return.`;}},
    {t:'Just look around',d:'Leave with nothing.',fn:()=>'You admire the trophy case and head back out.'}]};
function badgeReward(a){return Math.random()<(a>=1?.5:.1);}

function renderFeats(){const el=$('feats');if(!el)return;const show=run&&!SIM.on&&['plan','loot'].includes(mode);el.hidden=!show;if(!show)return;el.innerHTML=setsModsHtml();featAnnounce();}
$('feats')&&$('feats').addEventListener('click',e=>{if(featClick(e))e.stopPropagation();});
