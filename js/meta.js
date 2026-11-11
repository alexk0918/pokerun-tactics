"use strict";
/* PokéRun Tactics — meta progression (kept in this browser across runs, like PokéRogue's starters and eggs).
   · Unlocks: National Dex runs only use evolution lines you've unlocked. You start with every Gen I–II line plus all
     the starters; reaching 2★ with a line in any run unlocks it, and eggs unlock more. Regional modes always use their
     full roster.
   · Roster: for National Dex you can pick which unlocked lines appear (saved presets, a minimum per cost).
   · Candy: each line earns candy when it wins battles for you (more for a 3★). Spend it on that line's shiny colours
     and two levels of training (+5% / +10% max HP and damage).
   · Shinies: every sprited Pokémon has a shiny. Unlock a line's shiny with candy, from an egg, or by finding one
     (1 in 200 Pokémon you get is shiny, which unlocks it for good).
   · Eggs: spend an egg voucher to hatch an egg (Common ₽1–2, Rare ₽3, Epic ₽4, Legendary ₽5 lines; every 10th egg
     is Epic or better). New lines unlock; lines you already have give candy instead. 1 in 16 eggs is shiny.
   · Ascension: win a run to unlock the next of 20 difficulty levels, each adding one modifier.
   · Partner: start each run with a ₽1–3 line from your collection on the bench.
   · Profile: trainer level (XP from every run), run history, favourite Pokémon, titles and stump skins.
   Simulated runs never touch any of this. */
const META_KEY='pokerun-meta';
const META=(()=>{let d=null;try{d=JSON.parse(localStorage.getItem(META_KEY)||'null');}catch(e){}
  d=d&&d.v===1?d:{v:1};
  const def={unl:null,candy:{},up:{},shinyOff:{},vouchers:3,eggs:{n:0,pity:0},asc:{max:0,sel:0},xp:0,lvl:1,hist:[],fav:{},
    roster:{sel:-1,presets:[]},partner:{},title:'rookie',titles:['rookie'],stump:'stump',stumps:['stump'],rew:{},found:0};
  for(const k in def)if(d[k]===undefined)d[k]=def[k];return d;})();
const metaOn=()=>!SIM.on;
function metaSave(){if(!metaOn())return;try{localStorage.setItem(META_KEY,JSON.stringify(META));}catch(e){}}

/* ---------- the National Dex line list (independent of the current run) ---------- */
let NATM=null;
const natMode=()=>NATM&&NATM.u===!!OPTS.unsprited?NATM:(NATM=Object.assign(buildMode('nat'),{u:!!OPTS.unsprited}));
const natCost=r=>{const L=natMode().lines[r];return L?L.cost:0;};
const lineName=r=>D[r]?D[r].n:'?';

/* ---------- unlocks ---------- */
function unlockedSet(){
  if(!META.unl){const N=natMode();META.unl=N.roots.filter(r=>D[r].g<=2||STARTERS.flat().includes(r));metaSave();}
  return new Set(META.unl);}
const isUnl=r=>unlockedSet().has(r);
function metaUnlock(r,why){if(!metaOn()||!natMode().lines[r]||isUnl(r))return false;META.unl.push(r);metaSave();
  if(typeof popCard==='function')popCard({img:por(r),k:'New Pokémon unlocked',title:lineName(r),text:why||'It can now appear in National Dex runs.'});return true;}

/* ---------- roster (National Dex only) ---------- */
const ROSTER_MIN=[10,10,8,6,4];
function rosterLines(){const u=unlockedSet(),P=META.roster.presets[META.roster.sel];return P?P.lines.filter(r=>u.has(r)):[...u];}
// the lines the National Dex shop pool may use this run (null: no limit, e.g. simulated runs)
function natAllowed(){if(SIM.on)return null;return new Set(rosterLines());}
function rosterCounts(lines){const c=[0,0,0,0,0];for(const r of lines){const k=natCost(r);if(k)c[k-1]++;}return c;}

/* ---------- candy, training and shinies ---------- */
const SHINY_COST=30,TRAIN_COST=[20,50],TRAIN_BONUS=[0,.05,.1];
const candyOf=r=>META.candy[r]||0;
const upOf=r=>META.up[r]||(META.up[r]={});
function addCandy(r,n){if(!metaOn()||!n)return;META.candy[r]=candyOf(r)+n;}
const trainOf=r=>TRAIN_BONUS[(META.up[r]&&META.up[r].train)||0];
const hasShiny=r=>!!(META.up[r]&&META.up[r].shiny);
const shinyShown=r=>hasShiny(r)&&!META.shinyOff[r];
function buyUpgrade(r,what){const U=upOf(r);
  if(what==='shiny'){if(U.shiny||candyOf(r)<SHINY_COST)return false;META.candy[r]-=SHINY_COST;U.shiny=1;}
  else if(what==='train'){const t=U.train||0;if(t>=2||candyOf(r)<TRAIN_COST[t])return false;META.candy[r]-=TRAIN_COST[t];U.train=t+1;}
  metaSave();return true;}
// a Pokémon joining your team: shiny if you've unlocked that line's shiny, or a rare wild shiny (which unlocks it)
function metaJoin(u){if(!u||!metaOn()||!run)return u;
  if(shinyShown(u.root))u.shiny=1;
  else if(!hasShiny(u.root)&&Math.random()<1/200){u.shiny=1;upOf(u.root).shiny=1;META.found++;metaSave();
    setTimeout(()=>popCard({img:shinyPor(u.root),k:'Shiny found!',title:`Shiny ${lineName(u.root)}`,text:'Its shiny colours are now unlocked for good.'}),400);}
  return u;}
// battles won give candy to every line that fought (and count toward your favourite)
function metaBattle(win){if(!metaOn())return;const seen=new Set();
  for(const c of units)if(c.team===0&&!c.summon&&!seen.has(c.u.root)){seen.add(c.u.root);META.fav[c.u.root]=(META.fav[c.u.root]||0)+1;if(win)addCandy(c.u.root,1);}
  if(win)META.xp+=5;metaLevel();metaSave();}
function metaStar(u){if(!metaOn())return;if(u.star>=2&&natMode().lines[u.root])metaUnlock(u.root,'You reached 2★ with it. It can now appear in National Dex runs.');if(u.star>=3)addCandy(u.root,5);metaSave();}

/* ---------- profile: XP, level, history ---------- */
const lvlNeed=l=>100+25*(l-1);
const LEVEL_REWARDS={5:{stump:'rock'},10:{stump:'leaf',title:'explorer'},15:{stump:'cushion'},20:{stump:'pokeball',title:'veteran'},30:{stump:'crystal',title:'master'},40:{stump:'gold',title:'legend'}};
function metaLevel(){let up=0;while(META.xp>=lvlNeed(META.lvl)){META.xp-=lvlNeed(META.lvl);META.lvl++;up++;META.vouchers++;
    const R=LEVEL_REWARDS[META.lvl];if(R)grant(R);
    if(metaOn())popCard({icon:'exp-share',k:'Trainer level up',title:`Level ${META.lvl}`,text:`+1 egg voucher${R?' · '+rewardText(R):''}`});}
  return up;}
function metaAct(a){if(!metaOn())return;META.vouchers++;META.xp+=Math.round(50*(1+.05*(run.asc||0)));metaLevel();metaSave();}
function metaRunEnd(won){if(!metaOn()||!run||run.metaDone)return;run.metaDone=1;
  const asc=run.asc||0;
  if(won){META.xp+=Math.round(100*(1+.05*asc));META.vouchers+=2+Math.floor(asc/5);
    if(asc>=META.asc.max&&META.asc.max<20){META.asc.max=asc+1;setTimeout(()=>popCard({icon:'relic-crown',k:'Ascension unlocked',title:`Ascension ${META.asc.max}`,text:ASC[META.asc.max-1]}),1500);}}
  const cst=u=>(lineOf(u)||{cost:0}).cost,team=allOwned().sort((a,b)=>b.star-a.star||cst(b)-cst(a)).slice(0,6).map(u=>({d:shownDex(u),s:u.star,sh:u.shiny?1:0}));
  META.hist.unshift({t:Date.now(),m:MODE.id,e:run.strat.name,won:!!won,act:actOf(),f:run.floor,asc,team,lv:run.level});META.hist=META.hist.slice(0,30);
  metaLevel();metaSave();}
const favRoot=()=>Object.entries(META.fav).sort((a,b)=>b[1]-a[1]).map(x=>+x[0])[0];

/* ---------- rewards (achievements, levels) ---------- */
const TITLES={rookie:'Rookie',explorer:'Explorer',veteran:'Veteran',master:'Master Trainer',legend:'Living Legend',champion:'Champion',
  guardian:'Guardian Slayer',perfect:'Perfectionist',tycoon:'Tycoon',collector:'Collector',hatcher:'Egg Hatcher',shiny:'Shiny Hunter',unstoppable:'Unstoppable',ascended:'Ascended'};
const STUMPS={stump:'Tree stumps',rock:'Stepping stones',leaf:'Leaf pads',cushion:'Cushions',pokeball:'Poké Ball pads',crystal:'Crystals',gold:'Golden pedestals',shell:'Seashells',lily:'Lily pads',cloud:'Clouds'};
// default: 1 voucher; the harder ones give more, and some give a title or a stump skin
const ACH_REWARDS={champion:{v:3,title:'champion'},guardian:{v:2,title:'guardian'},perfectact:{v:3,title:'perfect'},gold100:{v:2,title:'tycoon'},
  dex100:{v:3,title:'collector'},dex300:{v:5,stump:'shell'},dexall:{v:10,stump:'cloud'},streak10:{v:3,title:'unstoppable'},untouch:{v:4,stump:'lily'},
  national:{v:3},regional:{v:3},endless:{v:3},act2:{v:2},legend3:{v:2},star3x3:{v:2},setmax:{v:2},kills5k:{v:3},wins100:{v:3},runs50:{v:3},
  buys500:{v:2},rolls1k:{v:2},envwins:{v:3},comeback:{v:2},clutch:{v:2},giantslayer:{v:2},cheapwin:{v:2},bigwin:{v:2},prism3:{v:2},synergy:{v:2},rainbow:{v:2}};
const achReward=id=>ACH_REWARDS[id]||{v:1};
function rewardText(R){const p=[];if(R.v)p.push(`${R.v} egg voucher${R.v>1?'s':''}`);if(R.title)p.push(`title “${TITLES[R.title]}”`);if(R.stump)p.push(`${STUMPS[R.stump]} for your bench`);return p.join(' · ');}
function grant(R){if(R.v)META.vouchers+=R.v;if(R.title&&!META.titles.includes(R.title))META.titles.push(R.title);if(R.stump&&!META.stumps.includes(R.stump))META.stumps.push(R.stump);}
function metaAchReward(id){if(META.rew[id])return null;META.rew[id]=1;const R=achReward(id);grant(R);metaSave();return R;}
// achievements earned before rewards existed get theirs once
function metaRetro(){let n=0;for(const id in (ACHV&&ACHV.got)||{})if(!META.rew[id]){metaAchReward(id);n++;}return n;}

/* ---------- eggs ---------- */
const EGG={common:{n:'Common',c:[1,2],col:'#cfd8dc'},rare:{n:'Rare',c:[3],col:'#64b5f6'},epic:{n:'Epic',c:[4],col:'#ba68c8'},legendary:{n:'Legendary',c:[5],col:'#ffd54f'}};
function hatchEgg(){if(META.vouchers<1)return null;META.vouchers--;META.eggs.n++;META.eggs.pity++;
  let x=Math.random(),tier=x<.6?'common':x<.88?'rare':x<.98?'epic':'legendary';
  if(META.eggs.pity>=10&&(tier==='common'||tier==='rare'))tier=Math.random()<.85?'epic':'legendary';
  if(tier==='epic'||tier==='legendary')META.eggs.pity=0;
  const N=natMode(),pool=EGG[tier].c.flatMap(c=>N.byCostAll[c-1]).filter(r=>SM[r]),locked=pool.filter(r=>!isUnl(r));
  const r=locked.length&&Math.random()<.75?pick(locked):pick(pool);
  const shiny=Math.random()<1/16;const isNew=!isUnl(r);
  if(isNew){META.unl.push(r);}else addCandy(r,10);
  if(shiny)upOf(r).shiny=1;
  if(META.eggs.n>=10&&!META.titles.includes('hatcher'))META.titles.push('hatcher');
  if(shiny&&!META.titles.includes('shiny'))META.titles.push('shiny');
  metaSave();return{r,tier,shiny,isNew};}

/* ---------- ascension ---------- */
const ASC=['Enemies are 4% stronger.','You start with 90 Trainer HP.','Base income is ₽1 lower.','Guardians are 8% stronger.','Rivals are 8% stronger.',
  'Losses cost 2 more Trainer HP.','Enemies are 8% stronger (instead of 4%).','Carousels offer 6 Pokémon instead of 8.','Your interest cap is ₽1 lower.','You start with 80 Trainer HP.',
  'Enemy Pokémon start with +15 PP.','Enemies are 12% stronger.','Buying XP costs ₽1 more.','Guardians are 15% stronger.','Rivals are 15% stronger.',
  'Streak gold is ₽1 lower.','Enemies are 16% stronger.','Enemy Pokémon attack 10% faster.','Losses cost 4 more Trainer HP.','Enemies are 20% stronger and you start with 70 Trainer HP.'];
const asc=()=>run&&run.asc||0;
const ascAt=n=>asc()>=n;
function ascEnemyMul(boss){const a=asc();if(!a)return 1;const k=floorKind(run.floor);
  let m=1+(a>=20?.2:a>=17?.16:a>=12?.12:a>=7?.08:a>=1?.04:0);
  if(boss)m*=1+(a>=14?.15:a>=4?.08:0);if(k==='elite')m*=1+(a>=15?.15:a>=5?.08:0);return m;}
const ascStartHp=()=>ascAt(20)?70:ascAt(10)?80:ascAt(2)?90:100;
const ascIncome=()=>ascAt(3)?1:0;
const ascLoss=()=>ascAt(19)?4:ascAt(6)?2:0;

/* ---------- stump skins (drawn live under the bench) ---------- */
function drawStumpSkin(g,p,skin){const E=(x,y,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
  E(p.x,p.y+3,12,4.5,'#00000035');
  switch(skin){
    case'rock':E(p.x,p.y+1,11,4.6,'#6d7378');E(p.x,p.y,10,3.8,'#9aa3a8');E(p.x-3,p.y-1,4,1.4,'#c3cacd');break;
    case'leaf':E(p.x,p.y+1,11,4.6,'#3e7d32');E(p.x,p.y,10,3.8,'#6abf4b');g.strokeStyle='#3e7d32';g.beginPath();g.moveTo(p.x-8,p.y);g.lineTo(p.x+8,p.y);g.stroke();break;
    case'cushion':E(p.x,p.y+1,11,4.8,'#7b3fa0');E(p.x,p.y-.5,10,4,'#b06ad6');E(p.x,p.y-1,3,1.2,'#e0b3f2');break;
    case'pokeball':E(p.x,p.y+1,11,4.6,'#333');E(p.x,p.y,10,3.8,'#f2f2f2');g.fillStyle='#e53935';g.beginPath();g.ellipse(p.x,p.y,10,3.8,0,Math.PI,2*Math.PI);g.fill();
      g.fillStyle='#333';g.fillRect(p.x-10,p.y-.5,20,1);E(p.x,p.y,2.4,1.2,'#fff');break;
    case'crystal':E(p.x,p.y+1,11,4.6,'#2f6f9f');E(p.x,p.y,10,3.8,'#7fd3ff');E(p.x-2,p.y-1,5,1.6,'#d9f4ff');break;
    case'gold':E(p.x,p.y+1,11,4.8,'#9c7417');E(p.x,p.y,10,3.8,'#f5c542');E(p.x-3,p.y-1,4,1.4,'#fff1b8');break;
    case'shell':E(p.x,p.y+1,11,4.6,'#c98f7a');E(p.x,p.y,10,3.8,'#f6d1c1');g.strokeStyle='#c98f7a';for(const dx of[-5,0,5]){g.beginPath();g.moveTo(p.x,p.y+3);g.lineTo(p.x+dx,p.y-3);g.stroke();}break;
    case'lily':E(p.x,p.y+1,11,4.6,'#2e7d5b');E(p.x,p.y,10,3.8,'#57b98a');g.fillStyle='#2e7d5b';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+10,p.y-1);g.lineTo(p.x+9,p.y+2);g.fill();E(p.x-4,p.y-1,2,1.2,'#f8bbd0');break;
    case'cloud':E(p.x,p.y+1,11,4.6,'#b0bec5');E(p.x-4,p.y-1,6,3,'#fff');E(p.x+4,p.y-1,6,3,'#fff');E(p.x,p.y-2,5,2.6,'#fff');break;
    default:E(p.x,p.y+1,11,4.5,'#7a5532');E(p.x,p.y,10,3.6,'#b98a55');g.strokeStyle='#8f6638';g.beginPath();g.ellipse(p.x,p.y,6,2,0,0,7);g.stroke();}
}

/* ---------- shiny sprites (assets/<dex>/shiny/*) ---------- */
const shinyPor=dex=>`assets/${pad(dex)}/shiny/portrait.png`;
// portrait for a unit or line, shiny when it is
const porOf=(dex,sh)=>sh?shinyPor(dex):por(dex);

/* =================== screens =================== */
const porImg=(dex,sh,cls='',alt='')=>`<img class="${cls}" src="${porOf(dex,sh)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${por(dex)}'">`;
const costChip=c=>`<span class="cchip c${c}">₽${c}</span>`;
let colState={f:'all',c:0,q:'',sel:null};
function showCollection(back){
  const N=natMode(),U=unlockedSet(),S=colState;back=back||showTitle;
  const all=N.roots.filter(r=>SM[r]||OPTS.unsprited);
  const list=all.filter(r=>(S.f==='all'||(S.f==='unl')===U.has(r))&&(!S.c||N.lines[r].cost===S.c)&&(!S.q||(U.has(r)&&lineName(r).toLowerCase().includes(S.q))));
  const nSh=all.filter(hasShiny).length;
  const tile=r=>{const u=U.has(r),c=N.lines[r].cost;return u?`<button class="ctile${S.sel===r?' on':''}" data-r="${r}">${porImg(r,shinyShown(r),'',lineName(r))}<b>${esc(lineName(r))}</b><span>${costChip(c)} ${candyOf(r)?`<i class="candy"></i>${candyOf(r)}`:''}${hasShiny(r)?' <span class="shy">★</span>':''}</span></button>`
    :`<div class="ctile lock">${porImg(r,0,'sil','')}<b>???</b><span>${costChip(c)}</span></div>`;};
  const det=S.sel&&U.has(S.sel)?(()=>{const r=S.sel,U2=upOf(r),t=U2.train||0;return`<div class="cdet win">
      <div class="cdpor">${porImg(r,0,'','Normal')}${hasShiny(r)?porImg(r,1,'','Shiny'):`<div class="nosh">Shiny locked</div>`}</div>
      <h2>${esc(lineName(r))}</h2><p>${costChip(N.lines[r].cost)} · ${N.lines[r].mem.map(d=>esc(D[d].n)).join(' → ')}</p>
      <p class="cc"><i class="candy"></i> <b>${candyOf(r)}</b> candy · won ${META.fav[r]||0} battle${(META.fav[r]||0)===1?'':'s'}</p>
      ${hasShiny(r)?`<button class="btn sm" id="cshow">${META.shinyOff[r]?'Use shiny colours':'Use normal colours'}</button>`:`<button class="btn sm" id="cshiny" ${candyOf(r)<SHINY_COST?'disabled':''}>Unlock shiny · ${SHINY_COST} candy</button>`}
      ${t<2?`<button class="btn sm" id="ctrain" ${candyOf(r)<TRAIN_COST[t]?'disabled':''}>Training ${t?'II':'I'} (+${t?10:5}% HP and damage) · ${TRAIN_COST[t]} candy</button>`:'<p>Fully trained: +10% max HP and damage.</p>'}
      ${t?`<p class="small">Trained: +${t*5}% max HP and damage in every run.</p>`:''}</div>`;})():
    `<div class="cdet win"><h2>Your collection</h2><p>National Dex runs only use lines you've unlocked. Reach 2★ with a line in any run, or hatch it from an egg, to unlock it.</p>
      <p>Lines earn <i class="candy"></i> candy for every battle they win (and 5 for a 3★). Spend it here on shiny colours and training.</p><p>Pick a Pokémon to see its upgrades.</p></div>`;
  ov.innerHTML=`<div class="scrim"></div><div class="screen colscreen"><h1 class="h1">Pokémon collection</h1>
    <p class="sub">${U.size} of ${all.length} lines unlocked · ${nSh} shinies · ${META.vouchers} egg voucher${META.vouchers===1?'':'s'}</p>
    <div class="cbar"><div class="seg">${[['all','All'],['unl','Unlocked'],['lock','Locked']].map(([k,l])=>`<button class="btn sm${S.f===k?' on':''}" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="seg">${[0,1,2,3,4,5].map(c=>`<button class="btn sm${S.c===c?' on':''}" data-c="${c}">${c?'₽'+c:'Any cost'}</button>`).join('')}</div>
      <input id="cq" type="search" placeholder="Search unlocked" value="${esc(S.q)}" aria-label="Search unlocked Pokémon"></div>
    <div class="cwrap"><div class="cgrid">${list.map(tile).join('')||'<p>Nothing here yet.</p>'}</div>${det}</div>
    <div class="row"><button class="btn" id="chatch">Hatchery</button><button class="btn" id="back">Back</button></div></div>`;
  ov.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{S.f=b.dataset.f;showCollection(back);});
  ov.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.c=+b.dataset.c;showCollection(back);});
  ov.querySelectorAll('.ctile[data-r]').forEach(b=>b.onclick=()=>{S.sel=+b.dataset.r;showCollection(back);});
  const q=$('cq');q.oninput=()=>{clearTimeout(q.t);q.t=setTimeout(()=>{S.q=q.value.trim().toLowerCase();showCollection(back);const n=$('cq');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250);};
  if($('cshiny'))$('cshiny').onclick=()=>{if(buyUpgrade(S.sel,'shiny')){sfx('evolve');showCollection(back);}};
  if($('ctrain'))$('ctrain').onclick=()=>{if(buyUpgrade(S.sel,'train')){sfx('level');showCollection(back);}};
  if($('cshow'))$('cshow').onclick=()=>{META.shinyOff[S.sel]=!META.shinyOff[S.sel];metaSave();showCollection(back);};
  $('chatch').onclick=()=>showHatchery(()=>showCollection(back));$('back').onclick=back;
}
let hatchLog=[];
function showHatchery(back){back=back||showTitle;
  const pityLeft=Math.max(1,10-META.eggs.pity);
  const res=hatchLog.slice(0,8).map(h=>`<div class="hres ${h.tier}">${porImg(h.r,h.shiny,'',lineName(h.r))}<b>${h.shiny?'★ ':''}${esc(lineName(h.r))}</b><span>${EGG[h.tier].n} · ${h.isNew?'New!':'+10 candy'}</span></div>`).join('');
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Hatchery</h1>
    <p class="sub">Spend an egg voucher to hatch an egg. New lines unlock for National Dex; a line you already have gives 10 candy instead. 1 in 16 eggs is shiny.</p>
    <div class="win dialog wide hatch"><div class="eggbox"><div class="egg" id="egg"><img src="${iconOf('mystery-egg')}" alt=""></div>
      <p><b>${META.vouchers}</b> egg voucher${META.vouchers===1?'':'s'} · ${META.eggs.n} hatched</p>
      <p class="small">Common 60% (₽1–2) · Rare 28% (₽3) · Epic 10% (₽4) · Legendary 2% (₽5)<br>Epic or better guaranteed within ${pityLeft} egg${pityLeft===1?'':'s'}</p>
      <button class="btn go" id="hatch" ${META.vouchers<1?'disabled':''}>Hatch an egg</button>
      <p class="small">Vouchers come from achievements, act clears, wins and trainer levels.</p></div>
      <div class="hlist">${res||'<p>Your hatches will show up here.</p>'}</div></div>
    <button class="btn" id="back">Back</button></div>`;
  $('hatch').onclick=()=>{const b=$('hatch');b.disabled=true;const egg=$('egg');egg.classList.add('wobble');sfx('select');
    setTimeout(()=>{const h=hatchEgg();if(!h)return showHatchery(back);hatchLog.unshift(h);egg.classList.remove('wobble');egg.classList.add('crack');sfx(h.tier==='legendary'||h.shiny?'evolve':'treasure');
      egg.innerHTML=`<div class="reveal ${h.tier}">${porImg(h.r,h.shiny,'',lineName(h.r))}</div>`;
      setTimeout(()=>showHatchery(back),1300);},1100);};
  $('back').onclick=back;
}
function showProfile(back){back=back||showTitle;
  const fav=favRoot(),N=natMode(),all=N.roots.filter(r=>SM[r]||OPTS.unsprited),U=unlockedSet();
  const best=ACTS.length,won=META.hist.filter(h=>h.won).length;
  const hist=META.hist.slice(0,12).map(h=>`<tr><td>${new Date(h.t).toLocaleDateString()}</td><td>${h.m==='nat'?'National Dex':'Gen '+ROMAN[+h.m.slice(3)-1]}${h.asc?` · A${h.asc}`:''}</td><td>${esc(h.e||'')}</td>
    <td>${h.won?'<b class="ok">Won</b>':`Act ${ROMAN[Math.min(h.act,9)]||h.act+1} · floor ${h.f}`}</td><td class="tm">${(h.team||[]).map(x=>porImg(x.d,x.sh,'',D[x.d]?D[x.d].n:'')).join('')}</td></tr>`).join('');
  const sk=META.stumps.map(k=>`<button class="skin${META.stump===k?' on':''}" data-s="${k}" title="${STUMPS[k]}"><canvas width="36" height="20" data-c="${k}"></canvas><span>${STUMPS[k]}</span></button>`).join('');
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Trainer profile</h1>
    <div class="win dialog wide prof"><div class="ptop">${fav?porImg(fav,shinyShown(fav),'pfav',lineName(fav)):`<img class="pfav" src="${iconOf('poke-ball')}" alt="">`}
      <div><h2>Level ${META.lvl} <small>${esc(TITLES[META.title]||'')}</small></h2><div class="achbar"><span style="width:${100*META.xp/lvlNeed(META.lvl)}%"></span></div><small>${META.xp} / ${lvlNeed(META.lvl)} XP to the next level</small>
      <p>Title: <select id="ptitle">${META.titles.map(t=>`<option value="${t}"${t===META.title?' selected':''}>${TITLES[t]}</option>`).join('')}</select>${fav?` · Favourite: <b>${esc(lineName(fav))}</b>`:''}</p></div></div>
      <div class="pstats">${[['Runs',achN('runs')],['Runs won',won],['Battles won',achN('wins')],['Knockouts',achN('kills')],['Lines unlocked',`${U.size}/${all.length}`],['Shinies',all.filter(hasShiny).length],['Eggs hatched',META.eggs.n],['Achievements',`${Object.keys(ACHV.got).length}/${ACHS.length}`],['Ascension',`${META.asc.max}/20`],['Egg vouchers',META.vouchers]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <h3>Bench style</h3><div class="skins">${sk}</div><p class="small">More styles come from trainer levels and achievements.</p>
      <h3>Recent runs</h3>${hist?`<table class="hist">${hist}</table>`:'<p>No finished runs yet.</p>'}</div>
    <button class="btn" id="back">Back</button></div>`;
  ov.querySelectorAll('canvas[data-c]').forEach(c=>{const g=c.getContext('2d');g.imageSmoothingEnabled=false;drawStumpSkin(g,{x:18,y:9},c.dataset.c);});
  ov.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{META.stump=b.dataset.s;metaSave();showProfile(back);});
  $('ptitle').onchange=e=>{META.title=e.target.value;metaSave();};$('back').onclick=back;
}
// National Dex: pick which unlocked lines can appear
function showRoster(next,back){
  const R=META.roster,U=unlockedSet();
  const row=(i,name,lines)=>{const c=rosterCounts(lines);return`<button class="rpick win${R.sel===i?' on':''}" data-i="${i}"><b>${esc(name)}</b><span>${lines.length} lines · ${c.map((n,k)=>`₽${k+1}: ${n}`).join(' · ')}</span></button>`;};
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">National Dex roster</h1>
    <p class="sub">Choose which of your unlocked lines can appear. Each run still draws a random pool from the roster. Unlock more by reaching 2★ or hatching eggs.</p>
    <div class="rlist">${row(-1,'All unlocked lines',[...U])}${R.presets.map((p,i)=>row(i,p.name,p.lines.filter(r=>U.has(r)))).join('')}</div>
    <div class="row">${R.presets.length<3?'<button class="btn" id="rnew">New roster</button>':''}${R.sel>=0?'<button class="btn" id="redit">Edit</button><button class="btn" id="rdel">Delete</button>':''}
      <button class="btn go" id="rgo">Continue</button><button class="btn" id="back">Back</button></div></div>`;
  ov.querySelectorAll('.rpick').forEach(b=>b.onclick=()=>{R.sel=+b.dataset.i;metaSave();showRoster(next,back);});
  if($('rnew'))$('rnew').onclick=()=>editRoster(-1,next,back);
  if($('redit'))$('redit').onclick=()=>editRoster(R.sel,next,back);
  if($('rdel'))$('rdel').onclick=()=>{R.presets.splice(R.sel,1);R.sel=-1;metaSave();showRoster(next,back);};
  $('rgo').onclick=next;$('back').onclick=back;
}
function editRoster(i,next,back){
  const R=META.roster,U=unlockedSet(),N=natMode(),P=i>=0?R.presets[i]:{name:`Roster ${R.presets.length+1}`,lines:[...U]};
  const sel=new Set(P.lines.filter(r=>U.has(r)));let name=P.name;
  const draw=()=>{const c=rosterCounts([...sel]);const ok=c.every((n,k)=>n>=ROSTER_MIN[k]);
    const col=k=>{const ls=[...U].filter(r=>N.lines[r]&&N.lines[r].cost===k+1).sort((a,b)=>lineName(a).localeCompare(lineName(b)));
      return`<div class="rcol"><h3>₽${k+1} <small class="${c[k]>=ROSTER_MIN[k]?'ok':'bad'}">${c[k]} (min ${ROSTER_MIN[k]})</small></h3><button class="btn sm" data-all="${k}">All</button><button class="btn sm" data-none="${k}">None</button>
        <div class="rtiles">${ls.map(r=>`<button class="rt${sel.has(r)?' on':''}" data-r="${r}" title="${esc(lineName(r))}">${porImg(r,shinyShown(r),'',lineName(r))}</button>`).join('')}</div></div>`;};
    ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Edit roster</h1>
      <p class="sub"><input id="rname" value="${esc(name)}" maxlength="24" aria-label="Roster name"> · Click Pokémon to add or remove them. Each cost needs a minimum so the shop always has something to show.</p>
      <div class="rcols">${[0,1,2,3,4].map(col).join('')}</div>
      <div class="row"><button class="btn go" id="rsave" ${ok?'':'disabled'}>Save roster</button><button class="btn" id="back">Cancel</button></div></div>`;
    $('rname').oninput=e=>{name=e.target.value;};
    ov.querySelectorAll('.rt').forEach(b=>b.onclick=()=>{const r=+b.dataset.r;sel.has(r)?sel.delete(r):sel.add(r);draw();});
    ov.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>{for(const r of U)if(N.lines[r]&&N.lines[r].cost===+b.dataset.all+1)sel.add(r);draw();});
    ov.querySelectorAll('[data-none]').forEach(b=>b.onclick=()=>{for(const r of[...sel])if(N.lines[r]&&N.lines[r].cost===+b.dataset.none+1)sel.delete(r);draw();});
    $('rsave').onclick=()=>{const p={name:name.trim()||'Roster',lines:[...sel]};if(i>=0)R.presets[i]=p;else{R.presets.push(p);R.sel=R.presets.length-1;}metaSave();showRoster(next,back);};
    $('back').onclick=()=>showRoster(next,back);};
  draw();
}
// pick a ₽1–3 partner from your collection (it starts the run on your bench)
function partnerChoices(){const U=unlockedSet(),ok=MODE.gen?null:natAllowed();
  return MODE.roots.filter(r=>U.has(r)&&MODE.lines[r].cost<=3&&(SM[r]||OPTS.unsprited)&&(!ok||ok.has(r))).sort((a,b)=>(META.fav[b]||0)-(META.fav[a]||0)||MODE.lines[a].cost-MODE.lines[b].cost||lineName(a).localeCompare(lineName(b)));}
function showPartner(back){
  const ch=partnerChoices(),cur=META.partner[MODE.id];const sel={r:ch.includes(cur)?cur:0};
  const draw=()=>{ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Choose a partner</h1>
    <p class="sub">Your partner starts the run on your bench at 1★. Pick any ₽1–3 line from your collection that this region has.</p>
    <div class="pgrid"><button class="pt${!sel.r?' on':''}" data-r="0"><img src="${iconOf('poke-ball')}" alt=""><b>No partner</b></button>${ch.map(r=>`<button class="pt${sel.r===r?' on':''}" data-r="${r}">${porImg(r,shinyShown(r),'',lineName(r))}<b>${esc(lineName(r))}</b><span>${costChip(MODE.lines[r].cost)}${trainOf(r)?` · +${trainOf(r)*100}%`:''}</span></button>`).join('')}</div>
    <div class="row"><button class="btn go" id="pgo">Start run</button><button class="btn" id="back">Back</button></div></div>`;
    ov.querySelectorAll('.pt').forEach(b=>b.onclick=()=>{sel.r=+b.dataset.r;draw();});
    $('pgo').onclick=()=>{META.partner[MODE.id]=sel.r;metaSave();ov.innerHTML='';beginRun(sel.r||null);};$('pgo').focus();
    $('back').onclick=back;};
  draw();
}
function ascControl(){if(!META.asc.max)return'';const a=Math.min(META.asc.sel,META.asc.max);
  return`<div class="ascbar win"><b>Ascension</b><button class="btn sm" id="ascm" ${a<=0?'disabled':''} aria-label="Lower ascension">−</button><span class="asclv">${a}</span><button class="btn sm" id="ascp" ${a>=META.asc.max?'disabled':''} aria-label="Raise ascension">+</button>
    <span class="ascd">${a?`A${a}: ${esc(ASC[a-1])}${a>1?` <small>(plus everything below)</small>`:''}`:'No modifiers. Win a run to unlock the next level.'}</span></div>`;}
function wireAsc(redraw){if($('ascm'))$('ascm').onclick=()=>{META.asc.sel=Math.max(0,Math.min(META.asc.sel,META.asc.max)-1);metaSave();redraw();};
  if($('ascp'))$('ascp').onclick=()=>{META.asc.sel=Math.min(META.asc.max,META.asc.sel+1);metaSave();redraw();};}

// a little twinkle that drifts around a shiny Pokémon now and then
function drawShinySparkle(s,t){const id=(s.pu&&s.pu.uid)||(s.cu&&s.cu.u&&s.cu.u.uid)||0,ph=(t*.9+id*.37)%2.4;if(ph>.7)return;
  const a=Math.sin(ph/.7*Math.PI),k=s.sc||1,x=s.x+((id*13)%14-7)*k,y=s.y-14*k-((id*7)%10)*k,r=3.2*a+.5;
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#fff6b0';ctx.beginPath();ctx.moveTo(x,y-r*1.6);ctx.lineTo(x+r*.45,y-r*.45);ctx.lineTo(x+r*1.6,y);ctx.lineTo(x+r*.45,y+r*.45);
  ctx.lineTo(x,y+r*1.6);ctx.lineTo(x-r*.45,y+r*.45);ctx.lineTo(x-r*1.6,y);ctx.lineTo(x-r*.45,y-r*.45);ctx.closePath();ctx.fill();ctx.restore();}
// rewards for achievements earned before rewards existed
addEventListener('load',()=>{try{if(metaRetro())metaSave();}catch(e){}});
