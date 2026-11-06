"use strict";
/* PokéRun Tactics — form changes and generation gimmicks.
   Battle forms come from real abilities (Stance Change, Disguise, Schooling…) or canon held items (Red Orb, Rusted Sword…).
   Gimmicks: one per act, chosen from Mega Evolution, Z-Moves, Dynamax and Terastallization. */

let FORMS={}, FORMS_BY_BASE={};
const FORM_ITEMS={};           // held item ident -> {id,n,forms:[fid]}
function loadForms(data){
  FORMS=data;
  for(const k in data){const f=data[k],fid=+k,b=D[f.base];
    D[fid]={id:fid,n:f.n,g:b.g,t:f.t,s:f.s,f:0,L:b.L,M:b.M,b:0,bst:f.s.reduce((a,c)=>a+c,0),form:1,base:f.base};
    (FORMS_BY_BASE[f.base]=FORMS_BY_BASE[f.base]||[]).push(fid);
    if(f.kind==='item'){const it=FORM_ITEMS[f.item]=FORM_ITEMS[f.item]||{id:f.item,n:f.itemName,forms:[]};it.forms.push(fid);}
  }
  for(const id in FORM_ITEMS){const it=FORM_ITEMS[id];it.d=`Held item. Lets ${it.forms.map(f=>D[FORMS[f].base].n).join(', ')} take ${it.forms.length>1?'their':'its'} ${it.forms.map(f=>D[f].n).join(' / ')} form in battle.`;}
}
const formOf=(base,kind,pred)=>(FORMS_BY_BASE[base]||[]).find(f=>FORMS[f].kind===kind&&(!pred||pred(FORMS[f])));
const baseOf=dex=>D[dex]&&D[dex].form?D[dex].base:dex;

/* ---------- abilities that change form (also get passive text) ---------- */
const FORM_ABIL={
  'stance-change':'Shield Forme defends; casting a move switches to Blade Forme (attack up, defense down) for 5 seconds.',
  disguise:'The first hit it takes deals no damage and busts its disguise.',
  schooling:'Fights as a giant school while above 25% HP.',
  'zen-mode':'Below half HP, enters Zen Mode (Psychic type, Sp. Atk way up).',
  'shields-down':'Below half HP, its shell breaks: Core form with much higher Attack and Speed.',
  'relic-song':'Using its move switches between Aria and Pirouette Forme.',
  'zero-to-hero':'After its first battle, it becomes Hero Palafin for the rest of the run.',
  'hunger-switch':'Alternates between Full Belly and Hangry Mode each time it uses its move.',
  forecast:'Changes form and type to match the weather.',
  'flower-gift':'In harsh sunlight, blooms into Sunshine form and powers up adjacent allies.',
  'ice-face':'The first physical hit it takes is blocked by its ice face, which then melts.',
  'power-construct':'Below half HP, assembles into Complete Forme and restores HP.',
  'tera-shift':'Terastallizes into Terastal Form at the start of battle.',
};
for(const k in FORM_ABIL)if(!ABILITIES[k])ABILITIES[k]={d:FORM_ABIL[k],e:{}};else ABILITIES[k].d=FORM_ABIL[k];
ABILITIES.disguise={d:FORM_ABIL.disguise,e:{disguise:1}};
ABILITIES['ice-face']={d:FORM_ABIL['ice-face'],e:{iceFace:1}};

/* ---------- transforming a combatant ---------- */
function transform(c,fid,opt={}){
  if(!D[fid]||c.dead||c.dex===fid)return;
  const b=D[c.dex].s,f=D[fid].s,R=(i,p)=>Math.pow(Math.max(1,f[i])/Math.max(1,b[i]),p);
  const frac=c.hp/c.maxHp;c.maxHp*=R(0,.8);c.hp=c.maxHp*frac;
  c.atk*=R(1,.85);c.def*=R(2,.85);c.spa*=R(3,.85);c.res*=R(4,.85);c.as*=R(5,.5);
  const oldAb=kitOf(c.dex).ab,newAb=kitOf(fid).ab;c.dex=fid;
  if(newAb&&!newAb.own&&(!oldAb||newAb.id!==oldAb.id))applyLiveAbility(c,newAb);
  if(!SIM.on){ensure(fid);burst(c.x,c.y-12,opt.col||'#ffffff',opt.big?36:22,opt.big?1.6:1.1);ring(c.x,c.y-8,opt.col||'#ffffff');
    if(opt.label)texts.push({x:c.x,y:c.y-40,txt:opt.label,col:opt.col||'#ffe27a',life:1.6,label:1});}
}
// numeric ability effects that can switch on mid-battle (e.g. a Mega's new ability)
function applyLiveAbility(c,ab){
  const e=ab.e||{};
  if(e.atkP)c.atk*=1+e.atkP;if(e.spaP)c.spa*=1+e.spaP;if(e.as)c.as*=1+e.as;if(e.def)c.def+=e.def;if(e.res)c.res+=e.res;
  if(e.dmg)c.dmg+=e.dmg;if(e.ab)c.abm+=e.ab;if(e.physAb)c.physAb+=e.physAb;if(e.specAb)c.specAb+=e.specAb;if(e.crit)c.crit+=e.crit;
  if(e.regen)c.regen+=e.regen;if(e.dodge)c.dodge+=e.dodge;if(e.ls)c.ls+=e.ls;if(e.dr)c.taken*=1-e.dr;
  for(const k in e)if(typeof e[k]!=='number'||['pinch','lowDmg','moxie','execute','technician','pen','noGuard','aImm','clear','fImm','noCrit','serene','skillLink','multiscale','assault','cloak','helmet','mGuard'].includes(k))c.fx[k]=e[k];
  if(e.weather&&!battle.weather){battle.weather=e.weather;battle.wSide=c.team;battle.wPow=1;if(!SIM.on)texts.push({x:320,y:150,txt:{sun:'The sunlight turned harsh!',rain:'It started to rain!',sand:'A sandstorm kicked up!',snow:'It started to snow!'}[e.weather],col:'#ffe27a',life:1.6,label:1});}
  c.abNow=ab;
}

/* ---------- battle-form hooks (called from combat) ---------- */
const abilOf=c=>{const k=KITS[baseOf(c.dex)];return(k&&k.a)||[];};
const SPECIES_FORM_ABIL={648:'relic-song',718:'power-construct'};
const hasAb=(c,a)=>SPECIES_FORM_ABIL[baseOf(c.dex)]===a||(abilOf(c).includes(a)&&(kitOf(baseOf(c.dex)).ab||{}).id===a);
function formsOnStart(c){
  const base=baseOf(c.dex);
  // held-item forms (canon: Primal Reversion, Origin Forme, Crowned, Therian, masks…)
  for(const it of[...(c.u.items||[]),...(c.u.formItem?[{k:'form:'+c.u.formItem}]:[])]){const FI=it.k.startsWith('form:')&&FORM_ITEMS[it.k.slice(5)];if(!FI)continue;
    const fid=FI.forms.find(f=>FORMS[f].base===base);if(fid){transform(c,fid,{label:FORMS[fid].ident.includes('primal')?'Primal Reversion!':D[fid].n+'!',col:'#ffd34d',big:1});
      if(FORMS[fid].ident.includes('primal'))applyLiveAbility(c,{e:{weather:base===383?'sun':'rain'}});}}
  if(hasAb(c,'schooling')&&c.u.star>=1){const f=formOf(base,'battle');if(f)transform(c,f,{label:'Schooling!',col:'#8fd3ff'});}
  if(hasAb(c,'tera-shift')){const f=formOf(base,'battle');if(f)transform(c,f,{label:'Tera Shift!',col:'#c6f4ff',big:1});}
  if(c.u.hero){const f=formOf(base,'battle');if(f)transform(c,f);}
  if(hasAb(c,'disguise'))c.disguise=Math.max(c.disguise,1);
  if(hasAb(c,'ice-face'))c.iceFace=1;
}
function formsOnWeather(c){
  if(!battle.weather)return;
  if(hasAb(c,'forecast')){const w={sun:'castform-sunny',rain:'castform-rainy',snow:'castform-snowy'}[battle.weather];const f=w&&(FORMS_BY_BASE[351]||[]).find(x=>FORMS[x].ident===w);if(f)transform(c,f,{label:'Forecast!',col:'#ffe27a'});}
  if(hasAb(c,'flower-gift')&&battle.weather==='sun'){const f=formOf(421,'battle');if(f){transform(c,f,{label:'Flower Gift!',col:'#ffb3d1'});for(const o of units)if(o.team===c.team&&hdist(o,c)<=1){o.atk*=1.15;o.res+=15;}}}
}
function formsOnCast(c){
  const base=baseOf(c.dex);
  if(hasAb(c,'stance-change')&&base===681){const blade=formOf(681,'battle');if(blade&&c.dex!==blade){transform(c,blade,{label:'Blade Forme!',col:'#ffd34d'});schedule(5,()=>{if(!c.dead)transform(c,681,{label:'Shield Forme',col:'#b8c7d9'});});}}
  if(hasAb(c,'relic-song')){const p=formOf(648,'battle');if(p)transform(c,c.dex===p?648:p,{label:c.dex===p?'Aria Forme':'Pirouette Forme!',col:'#9ff5c8'});}
  if(hasAb(c,'hunger-switch')){const h=formOf(877,'battle');if(h)transform(c,c.dex===h?877:h,{label:c.dex===h?'Full Belly':'Hangry!',col:'#c79bff'});}
}
function formsOnHp(c){
  const base=baseOf(c.dex),half=c.hp<c.maxHp*.5;
  if(hasAb(c,'zen-mode')&&half&&!c.zenOn){c.zenOn=1;const f=formOf(base,'battle');if(f){transform(c,f,{label:'Zen Mode!',col:'#ff8a7a'});}}
  if(hasAb(c,'shields-down')&&half&&!c.coreOn){c.coreOn=1;const f=formOf(774,'battle');if(f)transform(c,f,{label:'Shields Down!',col:'#ff6b6b'});}
  if(hasAb(c,'power-construct')&&half&&!c.pcOn){c.pcOn=1;const f=formOf(718,'battle');if(f){transform(c,f,{label:'Power Construct!',col:'#7dff7a',big:1});c.hp=Math.min(c.maxHp,c.hp+c.maxHp*.35);}}
  if(hasAb(c,'schooling')&&c.hp<c.maxHp*.25&&base===746&&c.dex!==746){transform(c,746,{label:'The school scattered!',col:'#8fd3ff'});}
}
function formsOnDisguiseBroken(c){if(baseOf(c.dex)===778){const f=formOf(778,'battle');if(f)transform(c,f,{label:'Its disguise was busted!',col:'#ffe27a'});}}
function formsOnIceFace(c){if(baseOf(c.dex)===875){const f=formOf(875,'battle');if(f)transform(c,f,{label:'Ice Face melted!',col:'#c6f4ff'});}}
function formsAfterBattle(u){if(baseOf(u.dex)===964&&(KITS[964].a||[]).includes('zero-to-hero')&&!u.hero){u.hero=1;if(!SIM.on)setTimeout(()=>toast('Palafin became Hero Palafin for the rest of the run!'),1400);}}
// gimmicks stack: every key item you've unlocked keeps working (run.gimmick is just the most recent one)
const gimList=()=>run?(run.gimmicks&&run.gimmicks.length?[...new Set(run.gimmicks)]:(run.gimmick?[run.gimmick]:[])):[];
const gimOn=g=>gimList().includes(g);
// who uses each one-per-battle gimmick (older saves kept a single run.gimTarget for their one gimmick)
function gimT(g){run.gimT=run.gimT||{};if(run.gimT[g]===undefined&&g===run.gimmick&&run.gimTarget)run.gimT[g]=run.gimTarget;return run.gimT[g]||0;}
function setGimT(g,uid){run.gimT=run.gimT||{};gimT(g);for(const k in run.gimT)if(k!==g&&run.gimT[k]===uid)run.gimT[k]=0;run.gimT[g]=uid;}
const ITEMG={stone:'mega',z:'zmove',shard:'tera',mush:'dmax'};
const gimOfItem=it=>ITEMG[it.k.split(':')[1]];
const megaShown=u=>run&&gimOn('mega')&&u.stone&&!u.megaOff&&typeof megaFor==='function'?megaFor(u.dex,u.stone):null;
const shownDex=u=>{if(u.fuse)return u.fuse.fid;if(u.forme)return u.forme;const mg=megaShown(u);if(mg)return mg;if(u.hero){const f=formOf(baseOf(u.dex),'battle');if(f)return f;}if(u.app&&typeof rotomDex==='function')return rotomDex(u);return u.dex;};

/* ---------- generation gimmicks ---------- */
const GIMMICKS={
  mega:{n:'Mega Evolution',gen:'Gen VI · Kalos',key:'mega-bracelet',keyN:'Mega Bracelet',col:'#ff7ad9',
    d:'Find Mega Stones in chests (only for Pokémon you own). Give one to the matching Pokémon and pick it as your Mega: it Mega Evolves early in every battle with its real Mega stats and ability.',
    start:'Starts with a Mega Stone for one of your lines, if any can Mega Evolve.'},
  zmove:{n:'Z-Moves',gen:'Gen VII · Alola',key:'z-power-ring',keyN:'Z-Power Ring',col:'#ffd34d',
    d:'Find Z-Crystals in chests. Give one to a Pokémon whose move matches its type and pick it as your Z user: its first move each battle becomes a Z-Move with huge power that hits everything around the target.',
    start:'Starts with a Z-Crystal matching one of your Pokémon\'s moves.'},
  dmax:{n:'Dynamax',gen:'Gen VIII · Galar',key:'dynamax-band',keyN:'Dynamax Band',col:'#ff4d5e',
    d:'Feed Max Mushrooms to Pokémon to raise their Dynamax Level (up to 10). Your Dynamax pick grows huge for 10 seconds each battle: bonus HP and power by level, and its moves become Max Moves that hit an area and change the battlefield. Pokémon with a Gigantamax form unlock it after eating 3 mushrooms.',
    start:'Starts with 3 Max Mushrooms.'},
  tera:{n:'Terastallization',gen:'Gen IX · Paldea',key:'tera-orb',keyN:'Tera Orb',col:'#7fe7ff',
    d:'Find Tera Shards in chests. A Pokémon holding a shard counts as that type for type sets, like an emblem. Your Tera pick Terastallizes at the start of every battle: its Tera type counts twice and its moves hit 25% harder.',
    start:'Starts with a Tera Shard of your most common type.'},
};
const GIM_ORDER=['mega','zmove','dmax','tera'];
const GIMMICK_FLOOR=4;
const ZNAME={Normal:'Breakneck Blitz',Fire:'Inferno Overdrive',Water:'Hydro Vortex',Electric:'Gigavolt Havoc',Grass:'Bloom Doom',Ice:'Subzero Slammer',Fighting:'All-Out Pummeling',Poison:'Acid Downpour',Ground:'Tectonic Rage',Flying:'Supersonic Skystrike',Psychic:'Shattered Psyche',Bug:'Savage Spin-Out',Rock:'Continental Crush',Ghost:'Never-Ending Nightmare',Dragon:'Devastating Drake',Dark:'Black Hole Eclipse',Steel:'Corkscrew Crash',Fairy:'Twinkle Tackle'};
const ZCRYSTAL={Normal:'normalium-z',Fire:'firium-z',Water:'waterium-z',Electric:'electrium-z',Grass:'grassium-z',Ice:'icium-z',Fighting:'fightinium-z',Poison:'poisonium-z',Ground:'groundium-z',Flying:'flyinium-z',Psychic:'psychium-z',Bug:'buginium-z',Rock:'rockium-z',Ghost:'ghostium-z',Dragon:'dragonium-z',Dark:'darkinium-z',Steel:'steelium-z',Fairy:'fairium-z'};
const ZTYPE=Object.fromEntries(Object.entries(ZCRYSTAL).map(([t,z])=>[z,t]));
const MAXMOVE={Normal:['Max Strike','enemy',{as:-.08},'Enemy Attack Speed −8%'],Fire:['Max Flare','weather','sun','Harsh sunlight'],Water:['Max Geyser','weather','rain','Rain'],Grass:['Max Overgrowth','team',{regen:.01},'Team regen +1%/s'],
  Electric:['Max Lightning','team',{ab:.1},'Team move damage +10%'],Ice:['Max Hailstorm','weather','snow','Snow'],Fighting:['Max Knuckle','team',{atkP:.1},'Team Attack +10%'],Poison:['Max Ooze','team',{spaP:.1},'Team Sp. Atk +10%'],
  Ground:['Max Quake','team',{res:10},'Team Sp. Def +10'],Flying:['Max Airstream','team',{as:.1},'Team Attack Speed +10%'],Psychic:['Max Mindstorm','team',{ab:.1},'Team move damage +10%'],Bug:['Max Flutterby','enemy',{spaP:-.1},'Enemy Sp. Atk −10%'],
  Rock:['Max Rockfall','weather','sand','Sandstorm'],Ghost:['Max Phantasm','enemy',{def:-10},'Enemy Defense −10'],Dragon:['Max Wyrmwind','enemy',{atkP:-.1},'Enemy Attack −10%'],Dark:['Max Darkness','enemy',{res:-10},'Enemy Sp. Def −10'],
  Steel:['Max Steelspike','team',{def:10},'Team Defense +10'],Fairy:['Max Starfall','team',{aImm:1},'Team immune to status']};
const GMAXNAME={3:'Vine Lash',6:'Wildfire',9:'Cannonade',12:'Befuddle',25:'Volt Crash',52:'Gold Rush',68:'Chi Strike',94:'Terror',99:'Foam Burst',131:'Resonance',133:'Cuddle',143:'Replenish',569:'Malodor',809:'Meltdown',812:'Drum Solo',815:'Fireball',818:'Hydrosnipe',823:'Wind Rage',826:'Gravitas',834:'Stonesurge',839:'Volcalith',841:'Tartness',842:'Sweetness',844:'Sandblast',849:'Stun Shock',851:'Centiferno',858:'Smite',861:'Snooze',869:'Finale',879:'Steelsurge',884:'Depletion',892:'One Blow'};
const MUSH_MAX=10, GMAX_MUSH=3;

/* gimmick items live in the bag as {k:'g:stone:charizardite-x'} / 'g:z:firium-z' / 'g:shard:Fire' / 'g:mush' and form items as {k:'form:red-orb'} */
const isGim=it=>it.k.startsWith('g:');
const isFormItem=it=>it.k.startsWith('form:');
// form items (Red Orb, Griseous Orb, masks…) sit in their own slot like Mega Stones, so they never take one of the 3 item slots
const formItemFits=(it,u)=>{const FI=FORM_ITEMS[it.k.slice(5)];return!!FI&&MODE.lines[u.root]&&MODE.lines[u.root].mem.some(m=>FI.forms.some(f=>FORMS[f].base===m));};
function equipFormItem(bi,u){const it=run.bag[bi];
  if(!formItemFits(it,u)){toast(`${nameOf(u)} can't use the ${formItemDef(it).n}.`);return false;}
  run.bag.splice(bi,1);if(u.formItem)run.bag.push({k:'form:'+u.formItem,mut:[]});u.formItem=it.k.slice(5);
  if(!SIM.on)toast(`${nameOf(u)} is holding the ${formItemDef(it).n}. It doesn't use an item slot.`);renderUI();return true;}
// older saves kept form items in the normal item slots
function migrateFormItems(){if(!run)return;run.bag=run.bag.filter(i=>!(typeof i.k==='string'&&i.k.startsWith('gear:')&&!GEAR[i.k.slice(5)]));for(const u of allOwned())u.items=(u.items||[]).filter(i=>!(typeof i.k==='string'&&i.k.startsWith('gear:')&&!GEAR[i.k.slice(5)]));for(const u of allOwned()){const j=(u.items||[]).findIndex(isFormItem);if(j>=0&&!u.formItem){u.formItem=u.items[j].k.slice(5);u.items.splice(j,1);}}}
function gimDef(it){
  const p=it.k.split(':');
  if(p[1]==='stone'){const fids=Object.keys(FORMS).filter(f=>FORMS[f].item===p[2]);const f=FORMS[fids[0]];return{id:p[2],n:f?f.itemName:p[2],d:`Mega Stone. Lets ${fids.map(x=>D[FORMS[x].base].n).join(' / ')} Mega Evolve into ${fids.map(x=>D[x].n).join(' / ')}.`};}
  if(p[1]==='z')return{id:p[2],n:p[2].replace(/(^|-)(\w)/g,(m,a,b)=>(a?' ':'')+b.toUpperCase()).replace(' Z',' Z').replace('ium Z','ium Z'),d:`Z-Crystal. A Pokémon whose move is ${ZTYPE[p[2]]}-type can use the Z-Move ${ZNAME[ZTYPE[p[2]]]}.`};
  if(p[1]==='shard')return{id:p[2].toLowerCase()+'-tera-shard',n:`${p[2]} Tera Shard`,d:`Tera emblem. The holder counts as ${p[2]} type for sets. As your Tera pick, it Terastallizes into the ${p[2]} type.`};
  if(p[1]==='mush')return{id:'max-mushrooms',n:'Max Mushrooms',d:`Drag onto a Pokémon to raise its Dynamax Level by 1 (max ${MUSH_MAX}). Pokémon with a Gigantamax form unlock it at ${GMAX_MUSH} mushrooms.`};
  return{id:'',n:'?',d:''};
}
function formItemDef(it){const FI=FORM_ITEMS[it.k.slice(5)];return FI?{id:FI.id,n:FI.n,d:FI.d}:{id:'',n:'?',d:''};}

const megaFor=(dex,stone)=>(FORMS_BY_BASE[baseOf(dex)]||[]).find(f=>FORMS[f].kind==='mega'&&FORMS[f].item===stone);
const gmaxFor=dex=>formOf(baseOf(dex),'gmax');
function gimEligible(u,g){
  if(!g)return gimList().some(x=>gimEligible(u,x));if(!gimOn(g))return false;
  if(g==='mega')return !!(u.stone&&megaFor(u.dex,u.stone));
  if(g==='zmove')return !!(u.crystal&&ZTYPE[u.crystal]===kitOf(u.dex).mv.t&&kitOf(u.dex).type!=='tank');
  if(g==='dmax')return true;
  if(g==='tera')return !!u.shard;
  return false;
}
function equipGim(bi,u){
  const it=run.bag[bi],p=it.k.split(':');
  if(p[1]==='mush'){if((u.mush||0)>=MUSH_MAX){toast(`${nameOf(u)} is already at Dynamax Level ${MUSH_MAX}.`);return false;}
    u.mush=(u.mush||0)+1;run.bag.splice(bi,1);
    if(u.mush>=GMAX_MUSH&&gmaxFor(u.dex)&&!u.gmax){u.gmax=1;if(!SIM.on)toast(`${nameOf(u)} drank Max Soup and gained the Gigantamax factor!`);}else if(!SIM.on)toast(`${nameOf(u)} is now Dynamax Level ${u.mush}.`);
    if(!gimT('dmax')||!allOwned().some(o=>o.uid===gimT('dmax')))setGimT('dmax',u.uid);
    renderUI();return true;}
  const slot=p[1]==='stone'?'stone':p[1]==='z'?'crystal':'shard',val=p[1]==='shard'?p[2]:p[2];
  if(slot==='stone'&&!(FORMS_BY_BASE[baseOf(u.dex)]||[]).some(f=>FORMS[f].kind==='mega'&&FORMS[f].item===val)&&!lineHasMega(u.root,val)){toast(`${nameOf(u)} can't use that Mega Stone.`);return false;}
  run.bag.splice(bi,1);
  if(u[slot])run.bag.push({k:`g:${p[1]}:${p[1]==='shard'?u[slot]:u[slot]}`,mut:[]});
  u[slot]=val;
  {const g=ITEMG[p[1]];if(g!=='mega'&&(!gimT(g)||!allOwned().some(o=>o.uid===gimT(g)))&&gimEligible(u,g))setGimT(g,u.uid);}
  if(slot==='stone'&&gimOn('mega')&&megaFor(u.dex,val)){u.megaOff=false;const fid=megaFor(u.dex,val);if(!SIM.on){ensure(fid);toast(`${nameOf(u)} Mega Evolved into ${D[fid].n}!`);const p=locate(u);if(p)['#ff5d7a','#ffd34d','#7dff7a','#5ab8ff','#c98bff'].forEach((col,i)=>{burst(p.x,p.y-12,col,10,1.4);schedule&&ring(p.x,p.y-8,col);});}}
  else if(!SIM.on)toast(`${nameOf(u)} is holding the ${gimDef(it).n}.`);renderUI();return true;
}
const lineHasMega=(root,stone)=>MODE.lines[root]&&MODE.lines[root].mem.some(m=>(FORMS_BY_BASE[m]||[]).some(f=>FORMS[f].kind==='mega'&&FORMS[f].item===stone));
function ownedMegaStones(){const out=new Set();for(const u of allOwned())for(const m of MODE.lines[u.root].mem)for(const f of FORMS_BY_BASE[m]||[])if(FORMS[f].kind==='mega')out.add(FORMS[f].item);return[...out];}
function ownedFormItems(){const out=new Set();for(const u of allOwned())for(const m of MODE.lines[u.root].mem)for(const f of FORMS_BY_BASE[m]||[])if(FORMS[f].kind==='item')out.add(FORMS[f].item);return[...out];}
function gimLootItem(only){
  if(!only){for(const g of shuffle(gimList())){const it=gimLootItem(g);if(it)return it;}return null;}
  const g=only;
  if(g==='mega'){const have=new Set([...allOwned().map(u=>u.stone),...run.bag.filter(isGim).map(i=>i.k.split(':')[2])]);const opts=ownedMegaStones().filter(s=>!have.has(s));return opts.length?{k:'g:stone:'+pick(opts),mut:[]}:null;}
  if(g==='zmove'){const ts=[...new Set(allOwned().map(u=>kitOf(u.dex).mv.t))];return{k:'g:z:'+ZCRYSTAL[Math.random()<.75&&ts.length?pick(ts):pick(Object.keys(ZCRYSTAL))],mut:[]};}
  if(g==='dmax')return{k:'g:mush',mut:[]};
  if(g==='tera'){const ts=[...new Set(allOwned().flatMap(u=>D[u.dex].t))];return{k:'g:shard:'+(Math.random()<.5&&ts.length?pick(ts):pick(Object.keys(TYPES))),mut:[]};}
  return null;
}
function gimStarterGift(g){
  const own=allOwned();
  if(g==='mega'){const s=ownedMegaStones();if(s.length)run.bag.push({k:'g:stone:'+pick(s),mut:[]});else run.megaPity=1;}
  if(g==='zmove'){const best=own.sort((a,b)=>lineOf(b).cost*b.star-lineOf(a).cost*a.star)[0];run.bag.push({k:'g:z:'+ZCRYSTAL[best?kitOf(best.dex).mv.t:'Normal'],mut:[]});}
  if(g==='dmax')for(let i=0;i<3;i++)run.bag.push({k:'g:mush',mut:[]});
  if(g==='tera'){const ct={};for(const u of own)for(const t of D[u.dex].t)ct[t]=(ct[t]||0)+1;const t=Object.keys(ct).sort((a,b)=>ct[b]-ct[a])[0]||'Normal';run.bag.push({k:'g:shard:'+t,mut:[]});}
}
function chooseGimmick(id){if(run.gimmick&&!(run.gimmicks||[]).length)run.gimmicks=[run.gimmick];run.gimmick=id;run.gimmicks=run.gimmicks||[];if(!run.gimmicks.includes(id))run.gimmicks.push(id);gimStarterGift(id);renderUI();}

/* ---------- applying a gimmick in battle ---------- */
function applyGimmicks(){
  // Mega Evolution has no cap: every Pokémon holding its Mega Stone (and not switched off in its menu) Mega Evolves
  // the others each power one Pokémon per battle; a Pokémon only uses one gimmick at a time
  const used=new Set();
  if(gimOn('mega'))for(const c of units.filter(c=>c.team===0&&!c.u.megaOff&&gimEligible(c.u,'mega'))){used.add(c);startGimmick(c,'mega',{});}
  for(const g of gimList()){if(g==='mega')continue;const cap=units.find(c=>c.team===0&&!c.summon&&c.u.uid===gimT(g));if(cap&&!used.has(cap)&&gimEligible(cap.u,g)){used.add(cap);startGimmick(cap,g,{mush:cap.u.mush||0,gmax:cap.u.gmax});}}
  // rivals, late trainers and the boss bring a gimmick of their own
  const f=run.floor,k=floorKind(f);
  if(k==='elite'||k==='boss'||(k==='trainer'&&f>=13&&Math.random()<.35)){
    const foes=units.filter(c=>c.team===1&&!c.boss).sort((a,b)=>b.maxHp*b.atk-a.maxHp*a.atk);const cap=k==='boss'?units.find(c=>c.boss):foes[0];
    if(cap){let g=pick(GIM_ORDER);if(k==='boss'&&g==='dmax')g='tera';if(g==='mega'&&!formOf(baseOf(cap.dex),'mega'))g='tera';
      startGimmick(cap,g,{mush:Math.min(10,f-2),enemy:1});}}
}
function startGimmick(c,g,o){
  c.gim=g;
  if(g==='mega'){const fid=o.enemy?formOf(baseOf(c.dex),'mega'):megaFor(c.dex,c.u.stone);if(!fid)return;
    // Mega Evolution pops right away
    schedule(.05,()=>{if(c.dead)return;transform(c,fid,{label:'Mega Evolution!',col:'#ff9be6',big:1});if(!SIM.on)sfx('evolve',300);c.mega=1;c.dmg+=.1;c.as*=1.1;
      if(!SIM.on)['#ff5d7a','#ffd34d','#7dff7a','#5ab8ff','#c98bff'].forEach(col=>burst(c.x,c.y-12,col,10,1.5));});}
  if(g==='zmove'){c.zReady=1;c.mana=Math.min(c.maxMana,c.mana+30);if(o.enemy)c.zType=kitOf(c.dex).mv.t;}
  if(g==='tera'){const t=o.enemy?D[c.dex].t[0]:c.u.shard;c.tera=t;c.teraOn=1;c.maxHp*=1.12;c.hp*=1.12;
    if(!SIM.on){texts.push({x:c.x,y:c.y-40,txt:`Terastallized: ${t}!`,col:'#7fe7ff',life:1.8,label:1});burst(c.x,c.y-12,'#bdf6ff',30,1.4);}}
  if(g==='dmax')schedule(3,()=>{if(!c.dead)dynamax(c,o.mush||0,o.gmax&&!o.enemy);});
}
function dynamax(c,lvl,gmax){
  const hpM=1.4+.04*lvl,pw=1+.025*lvl;
  c.maxHp*=hpM;c.hp*=hpM;c.atk*=pw;c.spa*=pw;c.dmaxOn=1;c.dmaxLvl=lvl;c.scaleMul=1.75;c.ppMul*=1.4;
  const gfid=gmax&&gmaxFor(c.dex);if(gfid){c.gmaxOn=1;if(FORMS[gfid].ownSprite){c.preDmaxDex=c.dex;c.dex=gfid;}}
  if(!SIM.on){texts.push({x:c.x,y:c.y-46,txt:gfid?'Gigantamax!':'Dynamax!',col:'#ff6b7a',life:1.8,label:1});burst(c.x,c.y-14,'#ff4d5e',40,1.8);}
  schedule(10,()=>{if(c.dead)return;c.maxHp/=hpM;c.hp=Math.max(1,c.hp/hpM);c.atk/=pw;c.spa/=pw;c.dmaxOn=0;c.gmaxOn=0;c.scaleMul=1;c.ppMul/=1.4;if(c.preDmaxDex){c.dex=c.preDmaxDex;c.preDmaxDex=0;}
    if(!SIM.on){texts.push({x:c.x,y:c.y-40,txt:'Returned to normal',col:'#ffffff',life:1.2,label:1});burst(c.x,c.y-12,'#ff9aa5',16,1);}});
}
// called by useMove: modifies the move for Z / Max / Tera, returns {name, mult, aoe, after}
function gimmickMove(u,mv){
  if(u.zReady){u.zReady=0;const t=u.zType||ZTYPE[u.u.crystal]||mv.t;if(!SIM.on)for(let i=0;i<4;i++)schedule(i*.08,()=>ring(u.x,u.y-8,'#ffd34d'));return{name:ZNAME[t]||'Z-Move',mult:3,aoe:1,noDodge:1,col:'#ffd34d',big:1};}
  if(u.dmaxOn){const M=MAXMOVE[mv.t]||MAXMOVE.Normal,g=u.gmaxOn&&GMAXNAME[baseOf(u.dex)];
    return{name:g?'G-Max '+g:M[0],mult:(g?1.3:1.1)+.02*(u.dmaxLvl||0),aoe:1,col:'#ff4d5e',big:1,after:()=>maxEffect(u,M,g?2:1)};}
  if(u.teraOn&&(mv.t===u.tera||D[u.dex].t.includes(u.tera)))return{mult:1.25};
  return null;
}
function maxEffect(u,M,pow){
  const[,kind,eff]=M;
  if(kind==='weather'){battle.weather=eff;battle.wSide=u.team;battle.wPow=pow;return;}
  const tgt=kind==='team'?units.filter(o=>!o.dead&&o.team===u.team):units.filter(o=>!o.dead&&o.team!==u.team);
  for(const o of tgt){const e=eff;
    if(e.as)o.as*=1+e.as*pow;if(e.atkP)o.atk*=1+e.atkP*pow;if(e.spaP)o.spa*=1+e.spaP*pow;if(e.def)o.def=Math.max(0,o.def+e.def*pow);if(e.res)o.res=Math.max(0,o.res+e.res*pow);
    if(e.regen)o.regen+=e.regen*pow;if(e.ab)o.abm+=e.ab*pow;if(e.aImm)o.fx.aImm=1;}
}
