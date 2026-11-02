"use strict";
/* PokéRun Tactics — augments (TFT-style).
   You pick one of three augments on floors 2 and 10 of Acts I and II, and on floor 2 of every later act.
   All three choices share a tier (silver, gold or prismatic); each card can be rerolled once, and one card is
   often a set augment (Heart / Crest / Crown) for a set you already play. Augments last the rest of the run. */

const AUG_FLOORS=a=>a<2?[2,10]:[2];
const AUGTAG={combat:'Combat',econ:'Economy',status:'Status',items:'Items',team:'Team',set:'Set',weather:'Weather'};
const WEATHER_TXT={sun:'harsh sunlight (Fire moves +20%, Water moves −15%)',rain:'rain (Water moves +20%, Fire moves −15%)',
  sand:'a sandstorm (everything but Rock, Ground and Steel loses 1% max HP per second)',snow:'snow (your Ice Pokémon get +20 Def and Sp. Def, enemies lose 10% Attack Speed, everything but Ice loses 1% max HP per second)'};
const augStrongest=()=>{let b=null,v=-1;for(const u of Object.values(run.board)){const x=lineOf(u).cost*Math.pow(3,u.star-1)+u.items.length*.5;if(x>v){v=x;b=u;}}return b;};
const bySet=(k,c0,c1)=>{const out=[];for(let c=c0;c<=c1;c++)for(const r of MODE.byCost[c-1]||[])if(lineSets(r).includes(k))out.push(r);return out;};
function gainUnit(root,star=1){const slot=run.bench.indexOf(null);if(slot<0){if(!SIM.on)toast('Your bench is full, so the Pokémon left.');return false;}
  const u=mkUnit(root);u.star=star;run.bench[slot]=u;if(!SIM.on)ensure(root);if(star>1)for(let s=2;s<=star;s++)evolveStep(u);combine();return true;}
const gainItems=(n,craft)=>{for(let i=0;i<n;i++){const it=craft?{k:randCraft(),mut:[]}:mkComp(randComp(),[]);if(run.bag.length<BAGMAX)run.bag.push(it);}};

const AUGDEF=[
  /* ---------------- silver ---------------- */
  {id:'static',t:'silver',tag:'status',icon:'zap-plate',name:'Static',d:'Your team\'s basic attacks have a 30% chance to add 1 Paralysis.'},
  {id:'ppoint',t:'silver',tag:'status',icon:'poison-barb',name:'Poison Point',d:'Your team\'s basic attacks have a 30% chance to add 1 Poison.'},
  {id:'fbody',t:'silver',tag:'status',icon:'flame-orb',name:'Flame Body',d:'Your team\'s basic attacks have a 30% chance to add 1 Burn.'},
  {id:'berry',t:'silver',tag:'econ',icon:'berry-pots',name:'Berry Basket',d:'Gain ₽10 right now.',gain(){run.gold+=10;}},
  {id:'tailwind',t:'silver',tag:'combat',icon:'quick-powder',name:'Tailwind',d:'Your team gains +10% Attack Speed.',e:{as:.1}},
  {id:'oran',t:'silver',tag:'combat',icon:'sitrus-berry',name:'Oran Rations',d:'Your team gains +150 max HP.',e:{hpF:150}},
  {id:'irondef',t:'silver',tag:'combat',icon:'iron',name:'Iron Defense',d:'Your team gains +15 Defense and +15 Sp. Def.',e:{def:15,res:15}},
  {id:'focusen',t:'silver',tag:'combat',icon:'dire-hit',name:'Focus Energy',d:'Your team gains +15% critical-hit chance.',e:{crit:.15}},
  {id:'quickstart',t:'silver',tag:'combat',icon:'quick-claw',name:'Quick Start',d:'Your Pokémon start every battle with +20 PP.',e:{mana:20}},
  {id:'leftovers',t:'silver',tag:'combat',icon:'leftovers',name:'Leftovers',d:'Your team restores 1% of its max HP every second.',e:{regen:.01}},
  {id:'candy',t:'silver',tag:'econ',icon:'rare-candy',name:'Candy Jar',d:'Gain 6 XP now, and +1 XP at the start of every floor.',gain(){gainXP(6);},floor(){gainXP(1);}},
  {id:'comppack',t:'silver',tag:'items',icon:'box-normal',name:'Component Pack',d:'Gain 2 random item components now.',gain(){gainItems(2,false);}},
  {id:'frontline',t:'silver',tag:'team',icon:'rusted-shield',name:'Front Line',d:'Your Pokémon in the two front rows gain +20% max HP.',ef:x=>x.row<=5?{hpP:.2}:null},
  {id:'backline',t:'silver',tag:'team',icon:'wide-lens',name:'Back Line',d:'Your Pokémon in the two back rows deal +15% damage.',ef:x=>x.row>=6?{dmg:.15}:null},
  {id:'bargain',t:'silver',tag:'econ',icon:'premier-ball',name:'Bargain Bin',d:'Your first reroll on every floor is free.',floor(){run.freeRerolls=Math.max(run.freeRerolls||0,1);}},
  {id:'pickup',t:'silver',tag:'items',icon:'honey',name:'Pickup',d:'After every win, a 35% chance to find a random item component.',after(win){if(win&&Math.random()<.35){gainItems(1,false);return'Pickup found a component';}}},
  {id:'thickfat',t:'silver',tag:'combat',icon:'big-malasada',name:'Thick Fat',d:'Your team takes 10% less damage.',e:{dr:.1}},
  {id:'intim',t:'silver',tag:'combat',icon:'razor-fang',name:'Intimidate',d:'Enemies start every battle with 10% less Attack and Sp. Atk.',x:{intim:.1}},
  /* ---------------- gold ---------------- */
  {id:'hexer',t:'gold',tag:'status',icon:'spell-tag',name:'Hex Maniac',d:'Your team deals +5% damage for each different status condition on the target (up to +30%).'},
  {id:'outbreak',t:'gold',tag:'status',icon:'toxic-orb',name:'Outbreak',d:'When an enemy with status conditions faints, half of each of its stacks spread to enemies within 2 hexes.'},
  {id:'egg',t:'gold',tag:'team',icon:'mystery-egg',name:'Daycare Egg',d:'Gain a random 2★ Pokémon (₽1 to ₽3) on your bench.',gain(){gainUnit(pick(MODE.roots.filter(r=>MODE.lines[r].cost<=3&&MODE.byCost[MODE.lines[r].cost-1].includes(r))),2);}},
  {id:'endure',t:'gold',tag:'combat',icon:'focus-sash',name:'Endure',d:'Once per battle, each of your Pokémon survives a fainting blow with 1 HP.',e:{focus:1}},
  {id:'swords',t:'gold',tag:'combat',icon:'choice-band',name:'Swords Dance',d:'Your team deals +20% damage.',e:{dmg:.2}},
  {id:'grabbag',t:'gold',tag:'items',icon:'box-silver',name:'Item Grab Bag',d:'Gain a random completed item and a random component now.',gain(){gainItems(1,true);gainItems(1,false);}},
  {id:'richer',t:'gold',tag:'econ',icon:'amulet-coin',name:'Rich Get Richer',d:'Gain ₽10 now, and your interest cap rises by ₽3.',gain(){run.gold+=10;}},
  {id:'study',t:'gold',tag:'econ',icon:'exp-share',name:'Study Hall',d:'Buying XP gives 6 XP instead of 4.'},
  {id:'implants',t:'gold',tag:'items',icon:'metal-coat',name:'Cybernetic Implants',d:'Your Pokémon holding at least one item gain +200 max HP and +10% damage.',ef:x=>x.u.items.length?{hpF:200,dmg:.1}:null},
  {id:'biggame',t:'gold',tag:'team',icon:'master-ball',name:'Big Game',d:'Your ₽4 and ₽5 Pokémon gain +25% max HP and +20% damage.',ef:x=>x.cost>=4?{hpP:.25,dmg:.2}:null},
  {id:'littlebud',t:'gold',tag:'team',icon:'friend-ball',name:'Little Buddies',d:'Your ₽1 and ₽2 Pokémon gain +30% max HP and +25% Attack Speed.',ef:x=>x.cost<=2?{hpP:.3,as:.25}:null},
  {id:'sitrus',t:'gold',tag:'combat',icon:'sitrus-berry',name:'Sitrus Stash',d:'Each of your Pokémon heals 25% of its max HP the first time it drops below half.',e:{sitrus:.25}},
  {id:'drain',t:'gold',tag:'combat',icon:'shell-bell',name:'Drain Punch',d:'Your team heals for 15% of the damage it deals.',e:{ls:.15}},
  {id:'spell',t:'gold',tag:'combat',icon:'wise-glasses',name:'Spellslinger',d:'Your Pokémon\'s moves deal +20% damage.',e:{ab:.2}},
  {id:'training',t:'gold',tag:'team',icon:'muscle-band',name:'Training Grounds',d:'After every battle, each Pokémon that fought gains +10 max HP and +1 Attack and Sp. Atk, permanently.',
    after(win,fought){for(const u of fought){u.g=u.g||{};u.g.hp=(u.g.hp||0)+10;u.g.atk=(u.g.atk||0)+1;u.g.spa=(u.g.spa||0)+1;}}},
  {id:'thrill',t:'gold',tag:'combat',icon:'razor-claw',name:'Thrill of the Hunt',d:'When your Pokémon knock out an enemy, they heal 20% of their max HP.',e:{killHeal:.2}},
  {id:'scaryface',t:'gold',tag:'combat',icon:'smoke-ball',name:'Scary Face',d:'Enemies have 10% less Attack Speed.',x:{enemyAS:.1}},
  {id:'drought',t:'gold',tag:'weather',icon:'flame-plate',name:'Drought',d:`Every battle starts in ${WEATHER_TXT.sun}. Your Fire Pokémon gain +15% Attack Speed.`,x:{weather:'sun'},ef:x=>x.types.includes('Fire')?{as:.15}:null},
  {id:'drizzle',t:'gold',tag:'weather',icon:'splash-plate',name:'Drizzle',d:`Every battle starts in ${WEATHER_TXT.rain}. Your Water Pokémon gain +10 PP at the start.`,x:{weather:'rain'},ef:x=>x.types.includes('Water')?{mana:10}:null},
  {id:'sandstream',t:'gold',tag:'weather',icon:'earth-plate',name:'Sand Stream',d:`Every battle starts in ${WEATHER_TXT.sand}. Your Rock, Ground and Steel Pokémon gain +20 Defense.`,x:{weather:'sand'},ef:x=>x.types.some(t=>t==='Rock'||t==='Ground'||t==='Steel')?{def:20}:null},
  {id:'snowwarn',t:'gold',tag:'weather',icon:'icicle-plate',name:'Snow Warning',d:`Every battle starts in ${WEATHER_TXT.snow}.`,x:{weather:'snow'}},
  /* ---------------- prismatic ---------------- */
  {id:'plague2',t:'prismatic',tag:'status',icon:'toxic-plate',name:'Plague Doctor',d:'Status conditions your team applies add double the stacks, and your Burn, Poison and Leech Seed deal +25% damage.'},
  {id:'resolve',t:'prismatic',tag:'team',icon:'leaders-crest',name:"Trainer's Resolve",d:'+1 team size for the rest of the run.'},
  {id:'payday',t:'prismatic',tag:'econ',icon:'nugget',name:'Pay Day',d:'Gain an extra ₽3 at the start of every floor.'},
  {id:'champion',t:'prismatic',tag:'combat',icon:'choice-specs',name:"Champion's Belt",d:'Your team deals +30% damage and gains +15% Attack Speed.',e:{dmg:.3,as:.15}},
  {id:'candymtn',t:'prismatic',tag:'econ',icon:'rare-candy',name:'Rare Candy Mountain',d:'Gain 30 XP now.',gain(){gainXP(30);}},
  {id:'ace',t:'prismatic',tag:'team',icon:'star-piece',name:'Ace Trainer',d:'Your strongest Pokémon on the field (highest cost and stars) gains +60% max HP, +40% damage and +25% Attack Speed.',ef:x=>x.u===x.ace?{hpP:.6,dmg:.4,as:.25}:null},
  {id:'secondwind',t:'prismatic',tag:'combat',icon:'sacred-ash',name:'Second Wind',d:'Each of your Pokémon gets back up once per battle with 30% HP.',e:{revive:.3}},
  {id:'itemrain',t:'prismatic',tag:'items',icon:'box-gold',name:'Item Rain',d:'Gain 2 random completed items now.',gain(){gainItems(2,true);}},
  {id:'legend',t:'prismatic',tag:'team',icon:'master-ball',name:'Legendary Encounter',d:'A random ₽5 Pokémon joins your bench now.',gain(){const p=MODE.byCost[4].length?MODE.byCost[4]:MODE.byCostAll[4];if(p.length)gainUnit(pick(p),1);}},
  {id:'goldtix',t:'prismatic',tag:'econ',icon:'gold-bottle-cap',name:'Golden Ticket',d:'Shop rerolls cost ₽1 instead of ₽2, and you get a free reroll every floor.',floor(){run.freeRerolls=Math.max(run.freeRerolls||0,1);}},
  {id:'harmony',t:'prismatic',tag:'team',icon:'soothe-bell',name:'Harmony',d:'Your team gains +4% damage and +4% max HP for every active set you have.',ef:x=>{const n=Object.keys(x.tr).filter(k=>SETS[k]&&tierOf(k,x.tr[k])).length;return{dmg:.04*n,hpP:.04*n};}},
  {id:'hyperdrive',t:'prismatic',tag:'combat',icon:'power-herb',name:'Hyperdrive',d:'Your Pokémon\'s moves cost 25% less PP and they start with +15 PP.',e:{ppCut:.25,mana:15}},
  /* ---------------- forms and kinship ---------------- */
  {id:'regional',t:'silver',tag:'team',icon:'town-map',name:'Regional Tour',d:'Your regional-form Pokémon (Alolan, Galarian, Hisuian, Paldean) gain +20% max HP and +10% damage.',ef:x=>D[x.u.dex]&&D[x.u.dex].rf?{hpP:.2,dmg:.1}:null},
  {id:'formchange',t:'gold',tag:'team',icon:'reveal-glass',name:'Form Change',d:'Your Pokémon in an alternate form (regional forms, Oricorio styles, Lycanroc, Wormadam cloaks, Deoxys formes, fusions) gain +15% max HP, damage and Attack Speed.',
    ef:x=>{const d=shownDex(x.u),dd=D[d];return(dd&&(dd.rf||dd.af))||x.u.fuse||x.u.forme?{hpP:.15,dmg:.15,as:.15}:null;}},
  {id:'fusionreactor',t:'prismatic',tag:'team',icon:'prison-bottle',name:'Fusion Reactor',d:'Fused Pokémon gain +30% max HP, damage and Attack Speed. If you have none, a random fusion-ready legendary (Kyurem, Necrozma or Calyrex) joins your bench.',
    ef:x=>x.u.fuse?{hpP:.3,dmg:.3,as:.3}:null,gain(){if(allOwned().some(u=>[646,800,898].includes(baseOf(u.dex))))return;const p=[646,800,898].filter(r=>MODE.lines[r]);if(p.length)gainUnit(pick(p),1);}},
  {id:'gathering',t:'prismatic',tag:'set',icon:'soul-dew',name:'Legendary Gathering',d:'Every kinship set you have active (Wolf Pack, Tao Trio, Island Guardians, Eeveelutions…) counts one extra member.',kin:1},
  {id:'packleader',t:'gold',tag:'set',icon:'razor-claw',name:'Pack Leader',d:'Kinship sets need one fewer member: each counts one extra as long as you have at least one member.',kinAll:1},
];
// set augments for every type and class: Heart (+1), Crest (+1 and a Pokémon), Crown (+2 and a 2★ Pokémon)
for(const k of Object.keys(SETS).filter(k=>SETS[k].cat==='type'||SETS[k].cat==='class'||SETS[k].trait)){
  const icon=SETS[k].cat==='type'&&typeof PLATES!=='undefined'&&PLATES[k]?PLATES[k]:'leaders-crest';
  AUGDEF.push({id:'heart:'+k,t:'silver',tag:'set',set:k,icon,name:`${k} Heart`,d:`Counts as one extra ${k} for your sets (needs at least one ${k} on the field).`,sets:{[k]:1}});
  AUGDEF.push({id:'crest:'+k,t:'gold',tag:'set',set:k,icon,name:`${k} Crest`,d:`Counts as one extra ${k} for your sets, and a random ₽2 or ₽3 ${k} Pokémon joins your bench.`,sets:{[k]:1},gain(){const p=bySet(k,2,3);if(p.length)gainUnit(pick(p),1);}});
  AUGDEF.push({id:'crown:'+k,t:'prismatic',tag:'set',set:k,icon,name:`${k} Crown`,d:`Counts as two extra ${k} for your sets, and a random 2★ ₽3 or ₽4 ${k} Pokémon joins your bench.`,sets:{[k]:2},gain(){const p=bySet(k,3,4);if(p.length)gainUnit(pick(p),2);}});
}
const AUGMAP=Object.fromEntries(AUGDEF.map(a=>[a.id,a]));
// legacy table (the bot and older code read it): every non-set augment by tier
const AUGS={silver:AUGDEF.filter(a=>a.t==='silver'&&!a.set),gold:AUGDEF.filter(a=>a.t==='gold'&&!a.set),prismatic:AUGDEF.filter(a=>a.t==='prismatic'&&!a.set)};

/* ---------- state ---------- */
const myAugs=()=>((run&&run.augs)||[]).map(x=>AUGMAP[x.id]).filter(Boolean);
function augIs(id){return!!(run&&run.augs&&run.augs.some(x=>x.id===id));}
function augDue(){if(!run||mode==='over')return false;const fl=AUG_FLOORS(actOf());if(!fl.includes(run.floor))return false;return!(run.augsAt||[]).includes(effFloor(run.floor));}
// per-unit combat effects
function augE(u,col,row,tr){
  const out={},L=lineOf(u),x={u,col,row,tr,cost:L.cost,star:u.star,types:D[u.dex].t,ace:null};
  for(const a of myAugs()){if(a.e)addE(out,a.e);if(a.ef){if(a.id==='ace')x.ace=x.ace||augStrongest();const r=a.ef(x);if(r)addE(out,r);}}
  return out;}
// team-wide battle flags (weather, intimidate, ...)
function augTeamX(tx){for(const a of myAugs())if(a.x)for(const k in a.x){if(typeof a.x[k]==='number')tx[k]=(tx[k]||0)+a.x[k];else if(!tx[k])tx[k]=a.x[k];}}
// extra set counts from Hearts, Crests and Crowns
function augSetBonus(ct){for(const a of myAugs()){if(a.sets)for(const k in a.sets)if(ct[k])ct[k]+=a.sets[k];if(a.kin||a.kinAll)for(const k in ct)if(SETS[k]&&SETS[k].kin&&(a.kinAll||tierOf(k,ct[k])))ct[k]+=1;}}
function augOnFloor(){for(const a of myAugs())if(a.floor)a.floor();}
function augAfter(win,fought){const msgs=[];for(const a of myAugs())if(a.after){const m=a.after(win,fought);if(m)msgs.push(m);}return msgs;}
const augInterestCap=()=>augIs('richer')?3:0;
const rerollCost=()=>augIs('goldtix')?1:2;
const xpBuyAmount=()=>augIs('study')?6:4;

/* ---------- choosing ---------- */
function rollAugTier(){const n=(run.augs||[]).length,x=Math.random();
  if(actOf()>=ACTS.length)return x<.4?'gold':'prismatic';
  if(n===0)return x<.3?'silver':x<.8?'gold':'prismatic';
  return x<.15?'silver':x<.65?'gold':'prismatic';}
function augPool(tier,exclude){const own=new Set((run.augs||[]).map(x=>x.id));return AUGDEF.filter(a=>a.t===tier&&!a.set&&!own.has(a.id)&&!exclude.has(a.id));}
function setAugFor(tier,exclude){
  // a set augment for one of the sets you already play (weighted toward your biggest)
  const ct=countTraits(allOwned());const ks=Object.keys(ct).filter(k=>SETS[k]&&(SETS[k].cat==='type'||SETS[k].cat==='class'||SETS[k].trait));if(!ks.length)return null;
  ks.sort((a,b)=>ct[b]-ct[a]);const k=Math.random()<.6?ks[0]:pick(ks.slice(0,4));
  const id=({silver:'heart:',gold:'crest:',prismatic:'crown:'}[tier])+k;
  if(exclude.has(id)||(run.augs||[]).some(x=>x.id===id))return null;return AUGMAP[id];}
function rollAugCard(tier,exclude,allowSet){
  if(allowSet&&Math.random()<.5){const s=setAugFor(tier,exclude);if(s)return s;}
  const p=augPool(tier,exclude);return p.length?pick(p):null;}
function rollAugChoices(tier){
  const ex=new Set(),out=[];
  for(let i=0;i<3;i++){const a=rollAugCard(tier,ex,i===2);if(a){out.push(a.id);ex.add(a.id);}}
  return out;}
function applyAug(a,tier){
  run.augs=run.augs||[];run.augs.push({id:a.id,tier:tier||a.t});
  (run.augsAt=run.augsAt||[]).push(effFloor(run.floor));
  if(a.gain)a.gain();combine();}
function botAug(){const t=rollAugTier();const ch=rollAugChoices(t);if(ch.length)applyAug(AUGMAP[pick(ch)],t);else (run.augsAt=run.augsAt||[]).push(effFloor(run.floor));}

/* ---------- the selection screen ---------- */
function showAugment(){
  mode='augment';$('bannerhost').innerHTML='';hideTip();peekOff();
  if(!run.augOffer||run.augOffer.at!==effFloor(run.floor)){const t=rollAugTier();run.augOffer={at:effFloor(run.floor),tier:t,ids:rollAugChoices(t),rr:[0,0,0]};}
  const O=run.augOffer,tier=O.tier,n=(run.augs||[]).length;
  const card=(id,i)=>{const a=AUGMAP[id];if(!a)return'';
    return`<div class="augcard tier-${tier}" data-i="${i}"><button class="augpick" data-pick="${i}"><div class="augic"><img src="${iconOf(a.icon)}" alt=""></div>
      <span class="augtag t-${a.tag}">${AUGTAG[a.tag]}${a.set?' · '+esc(a.set):''}</span><h2>${esc(a.name)}</h2><p>${a.d}</p></button>
      <button class="btn sm augrr" data-rr="${i}" ${O.rr[i]?'disabled':''}>${O.rr[i]?'Rerolled':'Reroll'}</button></div>`;};
  const mine=myAugs();
  ov.innerHTML=`<div class="scrim"></div><div class="screen augscreen"><div class="tierbanner ${tier}">${tier.toUpperCase()} AUGMENT · ${['FIRST','SECOND','THIRD','FOURTH','FIFTH'][n]||'#'+(n+1)} PICK</div>
    <h1 class="h1">Choose an augment</h1><p class="sub">Augments last for the rest of the run. Each card can be rerolled once.</p>
    <div class="augrow">${O.ids.map(card).join('')}</div>
    <div class="lootacts"><button class="btn" id="augteam">View team</button></div>
    ${mine.length?`<div class="augmine"><span class="lbl">Your augments</span>${mine.map(a=>`<span class="augchip t-${a.t}" title="${esc(a.d)}"><img src="${iconOf(a.icon)}" alt="">${esc(a.name)}</span>`).join('')}</div>`:''}</div>`;
  ov.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const a=AUGMAP[O.ids[+b.dataset.pick]];run.augOffer=null;ov.innerHTML='';mode='plan';applyAug(a,tier);renderUI();
    toast(`${a.name}: ${a.d}`);if(!evoOpen)afterAugment();});
  ov.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rr;if(O.rr[i])return;const ex=new Set(O.ids);const a=rollAugCard(tier,ex,true);if(a){O.ids[i]=a.id;}O.rr[i]=1;showAugment();});
  $('augteam').onclick=()=>{hideTip();ov.innerHTML='';peekOn('Back to augments',showAugment);};
}
function afterAugment(){if(gimDue())return showGimmickChoice();banner(`Floor ${run.floor}`,trainerName(run.floor),1400);}
