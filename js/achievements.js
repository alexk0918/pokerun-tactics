"use strict";
/* PokéRun Tactics — achievements.
   Saved in this browser (localStorage) across runs. An achievement earned during a fight pops up when the fight
   ends; one earned anywhere else pops up straight away. The Achievements screen (title menu) shows them all,
   with progress for the ones that count up across runs. Simulated runs never earn anything. */
const ACH_KEY='pokerun-ach';
const ACHV=(()=>{try{const d=JSON.parse(localStorage.getItem(ACH_KEY)||'null');if(d&&d.got)return d;}catch(e){}return{got:{},st:{}};})();
function achSave(){try{localStorage.setItem(ACH_KEY,JSON.stringify(ACHV));}catch(e){}}
const achOn=()=>!(typeof SIM!=='undefined'&&SIM.on);
// lifetime counters (and sets kept as lists)
const achN=k=>ACHV.st[k]||0;
function achAdd(k,n=1){if(!achOn()||!n)return;ACHV.st[k]=achN(k)+n;achSave();}
function achSetAdd(k,v){if(!achOn())return;const a=ACHV.st[k]=Array.isArray(ACHV.st[k])?ACHV.st[k]:[];if(!a.includes(v)){a.push(v);achSave();}}
const achSetN=k=>Array.isArray(ACHV.st[k])?ACHV.st[k].length:0;
// per-run tracking (lowest HP, rerolls this act…)
const achR=()=>{run.achR=run.achR||{minHp:run.hp,actMin:run.hp,actRolls:0};return run.achR;};

/* ---------- the list ---------- */
const field=()=>Object.values(run.board);
const typeCount=list=>{const c={};for(const u of list)for(const t of D[u.dex].t)c[t]=(c[t]||0)+1;return c;};
const activeSets=()=>{const ct=countTraits(field());return Object.keys(ct).filter(k=>SETS[k]&&tierOf(k,ct[k])>0).map(k=>({k,t:tierOf(k,ct[k]),max:SETS[k].bp.length}));};
const costs=list=>list.map(c=>MODE.lines[c.u?c.u.root:c.root].cost);
const ACHS=[
  /* battles (checked when a fight ends) */
  {id:'firstwin',ev:'battle',icon:'poke-ball',name:'First Steps',d:'Win your first battle.',t:x=>x.win},
  {id:'rival',ev:'battle',icon:'black-belt',name:'Rival Defeated',d:'Beat a rival.',t:x=>x.win&&x.kind==='elite'},
  {id:'guardian',ev:'battle',icon:'master-ball',name:'Guardian Slayer',d:'Beat a legendary guardian.',t:x=>x.win&&x.kind==='boss'},
  {id:'clean',ev:'battle',icon:'focus-sash',name:'Clean Sweep',d:'Win a battle against 5 or more enemies without any of your Pokémon fainting.',t:x=>x.win&&!x.lost&&x.foes>=5},
  {id:'lastone',ev:'battle',icon:'focus-band',name:'Last One Standing',d:'Win a battle with exactly one of your Pokémon still standing (from a team of 4 or more).',t:x=>x.win&&x.mine.length>=4&&x.mine.filter(c=>!c.dead).length===1},
  {id:'overkill',ev:'battle',icon:'life-orb',name:'Overkill',d:'Deal 15,000 damage in a single battle.',t:x=>x.mine.reduce((s,c)=>s+(c.mDmg||0),0)>=15000},
  {id:'heavy',ev:'battle',icon:'muscle-band',name:'Heavy Hitter',d:'Have one Pokémon deal 6,000 damage in a single battle.',t:x=>x.mine.some(c=>(c.mDmg||0)>=6000)},
  {id:'wall',ev:'battle',icon:'assault-vest',name:'Immovable',d:'Have one Pokémon take 6,000 damage in a single battle and still be standing.',t:x=>x.mine.some(c=>!c.dead&&(c.mTaken||0)>=6000)},
  {id:'blitz',ev:'battle',icon:'quick-claw',name:'Lightning Round',d:'Beat 5 or more enemies in under 8 seconds.',t:x=>x.win&&x.foes>=5&&x.time<8},
  {id:'attrition',ev:'battle',icon:'leftovers',name:'War of Attrition',d:'Win a battle that lasts more than 45 seconds.',t:x=>x.win&&x.time>45},
  {id:'ko5',ev:'battle',icon:'razor-claw',name:'Knockout Artist',d:'Have one Pokémon knock out 5 enemies in a single battle.',t:x=>x.mine.some(c=>(c.kills||0)>=5)},
  {id:'lonewolf',ev:'battle',icon:'scope-lens',name:'Lone Wolf',d:'Win a battle against 3 or more enemies with only one Pokémon on your field.',t:x=>x.win&&x.mine.length===1&&x.foes>=3},
  {id:'clutch',ev:'battle',icon:'sitrus-berry',name:'Down to the Wire',d:'Beat a guardian with 10 Trainer HP or less.',t:x=>x.win&&x.kind==='boss'&&run.hp<=10},
  {id:'cheapwin',ev:'battle',icon:'poke-doll',name:'Bargain Bin',d:'Beat a guardian using only ₽1 and ₽2 Pokémon.',t:x=>x.win&&x.kind==='boss'&&x.mine.length>=3&&costs(x.mine).every(c=>c<=2)},
  {id:'bigwin',ev:'battle',icon:'big-nugget',name:'Big Money',d:'Beat a guardian using only ₽4 and ₽5 Pokémon.',t:x=>x.win&&x.kind==='boss'&&x.mine.length>=3&&costs(x.mine).every(c=>c>=4)},
  {id:'giantslayer',ev:'battle',icon:'iron-ball',name:'Giant Slayer',d:'Beat a guardian while your trainer level is 6 or lower.',t:x=>x.win&&x.kind==='boss'&&run.level<=6},
  {id:'streak5',ev:'battle',icon:'quick-powder',name:'On a Roll',d:'Win 5 battles in a row.',t:()=>run.streak>=5},
  {id:'streak10',ev:'battle',icon:'choice-scarf',name:'Unstoppable',d:'Win 10 battles in a row.',t:()=>run.streak>=10},
  {id:'rockbottom',ev:'battle',icon:'black-sludge',name:'Rock Bottom',d:'Lose 5 battles in a row and live to tell the tale.',t:()=>run.streak<=-5&&run.hp>0},
  {id:'wins100',ev:'battle',icon:'gold-bottle-cap',name:'Battle Hardened',d:'Win 100 battles across all your runs.',t:()=>achN('wins')>=100,p:()=>[achN('wins'),100]},
  {id:'kills1k',ev:'battle',icon:'spell-tag',name:'Centurion',d:'Knock out 1,000 enemies across all your runs.',t:()=>achN('kills')>=1000,p:()=>[achN('kills'),1000]},
  {id:'kills5k',ev:'battle',icon:'reaper-cloth',name:'Legion',d:'Knock out 5,000 enemies across all your runs.',t:()=>achN('kills')>=5000,p:()=>[achN('kills'),5000]},
  /* acts and runs */
  {id:'act1',ev:'act',icon:'leaf-stone',name:'Act I Clear',d:'Clear Act I.',t:x=>x.a>=0},
  {id:'act2',ev:'act',icon:'water-stone',name:'Act II Clear',d:'Clear Act II.',t:x=>x.a>=1},
  {id:'champion',ev:'act',icon:'leaders-crest',name:'Champion',d:'Clear Act III and win a run.',t:x=>x.a>=2},
  {id:'regional',ev:'act',icon:'town-map',name:'Regional Champion',d:'Win a run in a regional mode.',t:x=>x.a===2&&MODE.gen},
  {id:'national',ev:'act',icon:'cherish-ball',name:'National Champion',d:'Win a run in National Dex.',t:x=>x.a===2&&!MODE.gen},
  {id:'perfectact',ev:'act',icon:'shiny-stone',name:'Perfect Act',d:'Clear an act without losing a single battle.',t:()=>!run.results.includes('loss')},
  {id:'comeback',ev:'act',icon:'revive',name:'Comeback Kid',d:'Clear an act after dropping to 20 Trainer HP or less during it.',t:()=>achR().actMin<=20},
  {id:'patience',ev:'act',icon:'iron',name:'Patience Pays',d:'Clear an act without rerolling the shop.',t:()=>achR().actRolls===0},
  {id:'untouch',ev:'act',icon:'protective-pads',name:'Untouchable',d:'Win a run without ever dropping below 50 Trainer HP.',t:x=>x.a===2&&achR().minHp>=50},
  {id:'endless',ev:'act',icon:'comet-shard',name:'Into the Unknown',d:'Clear an act of Endless.',t:x=>x.a>=ACTS.length},
  {id:'indexwin',ev:'act',icon:'leaders-crest',name:'Index Investor',d:'Win a run with an Index Fund.',t:x=>x.a===2&&String(run.strat.id).startsWith('index:')},
  {id:'envwins',ev:'act',icon:'relic-crown',name:'Market Mover',d:'Win runs with 5 different investment environments.',t:()=>achSetN('envWins')>=5,p:()=>[achSetN('envWins'),5]},
  {id:'firstloss',ev:'end',icon:'escape-rope',name:'Learning Experience',d:'Lose a run. It happens to the best of us.',t:x=>!x.won},
  {id:'runs10',ev:'start',icon:'acro-bike',name:'Regular',d:'Start 10 runs.',t:()=>achN('runs')>=10,p:()=>[achN('runs'),10]},
  {id:'runs50',ev:'start',icon:'mach-bike',name:'Lifer',d:'Start 50 runs.',t:()=>achN('runs')>=50,p:()=>[achN('runs'),50]},
  {id:'worldtour',ev:'start',icon:'air-balloon',name:'World Tour',d:'Start runs in 5 different regions (National Dex counts).',t:()=>achSetN('modes')>=5,p:()=>[achSetN('modes'),5]},
  {id:'diversified',ev:'start',icon:'amulet-coin',name:'Diversified',d:'Pick 10 different investment environments.',t:()=>achSetN('envs')>=10,p:()=>[achSetN('envs'),10]},
  /* your team (checked whenever you're not fighting) */
  {id:'star2',ev:'state',icon:'star-piece',name:'Evolution Begins',d:'Make your first 2★ Pokémon.',t:()=>allOwned().some(u=>u.star>=2)},
  {id:'star3',ev:'state',icon:'rare-candy',name:'Three Stars',d:'Make a 3★ Pokémon.',t:()=>allOwned().some(u=>u.star>=3)},
  {id:'star3x3',ev:'state',icon:'relic-gold',name:'Triple Crown',d:'Own three 3★ Pokémon at once.',t:()=>allOwned().filter(u=>u.star>=3).length>=3},
  {id:'legend3',ev:'state',icon:'comet-shard',name:'Living Legend',d:'Make a 3★ ₽5 Pokémon.',t:()=>allOwned().some(u=>u.star>=3&&lineOf(u).cost>=5)},
  {id:'maxlv',ev:'state',icon:'exp-share',name:'Master Trainer',d:'Reach the highest trainer level.',t:()=>run.level>=MAXLV},
  {id:'synergy',ev:'state',icon:'soothe-bell',name:'Synergy',d:'Have 6 sets active at once on your field.',t:()=>activeSets().length>=6},
  {id:'setmax',ev:'state',icon:'crown-pass',name:'Set Master',d:'Reach the top tier of any set.',t:()=>activeSets().some(s=>s.t>=s.max)},
  {id:'purist',ev:'state',icon:'charcoal',name:'Type Purist',d:'Have 6 Pokémon of one type on your field.',t:()=>Object.values(typeCount(field())).some(n=>n>=6)},
  {id:'rainbow',ev:'state',icon:'prism-scale',name:'Rainbow Team',d:'Have 10 different types on your field.',t:()=>Object.keys(typeCount(field())).length>=10},
  {id:'gold50',ev:'state',icon:'nugget',name:'Savings',d:'Hold ₽50.',t:()=>run.gold>=50},
  {id:'gold100',ev:'state',icon:'big-nugget',name:'Tycoon',d:'Hold ₽100.',t:()=>run.gold>=100},
  {id:'fullitems',ev:'state',icon:'choice-band',name:'Fully Loaded',d:'Give one Pokémon 3 completed items.',t:()=>allOwned().some(u=>u.items.filter(isCraft).length>=3)},
  {id:'bagfull',ev:'state',icon:'box-normal',name:'Hoarder',d:'Fill your item bag.',t:()=>run.bag.length>=BAGMAX},
  {id:'prism',ev:'state',icon:'prism-scale',name:'Prismatic',d:'Take a Prismatic augment.',t:()=>(run.augs||[]).some(a=>a.tier==='prismatic')},
  {id:'prism3',ev:'state',icon:'rainbow-wing',name:'Full Spectrum',d:'Have 3 Prismatic augments in one run.',t:()=>(run.augs||[]).filter(a=>a.tier==='prismatic').length>=3},
  {id:'aug5',ev:'state',icon:'star-piece',name:'Augmented',d:'Have 5 augments in one run.',t:()=>(run.augs||[]).length>=5},
  {id:'relic3',ev:'state',icon:'relic-statue',name:'Relic Hunter',d:'Hold 3 relics in one run.',t:()=>(run.relics||[]).length>=3},
  {id:'fullbench',ev:'state',icon:'box-silver',name:'Packed Bench',d:'Fill every bench slot.',t:()=>run.bench.every(Boolean)},
  {id:'fullfield',ev:'state',icon:'friend-ball',name:'Full Squad',d:'Have 9 Pokémon on your field.',t:()=>field().length>=9},
  {id:'fated',ev:'state',icon:'mystery-egg',name:'Fated',d:'Open the Gift of Destiny.',t:()=>run.strat.id==='destiny'&&S('destiny').done},
  {id:'diver',ev:'state',icon:'deep-sea-scale',name:'Treasure Diver',d:'Claim The Sunken Trove.',t:()=>run.strat.id==='sunken'&&S('sunken').done},
  {id:'buys500',ev:'state',icon:'poke-ball',name:'Shopaholic',d:'Buy 500 Pokémon across all your runs.',t:()=>achN('buys')>=500,p:()=>[achN('buys'),500]},
  {id:'rolls1k',ev:'state',icon:'gold-bottle-cap',name:'Reroll Addict',d:'Reroll the shop 1,000 times across all your runs.',t:()=>achN('rolls')>=1000,p:()=>[achN('rolls'),1000]},
  {id:'chests50',ev:'state',icon:'box-gold',name:'Treasure Hunter',d:'Open 50 chests across all your runs.',t:()=>achN('chests')>=50,p:()=>[achN('chests'),50]},
  {id:'centers',ev:'state',icon:'heal-ball',name:'Frequent Visitor',d:'Visit 10 Pokémon Centers.',t:()=>achN('center')>=10,p:()=>[achN('center'),10]},
  {id:'mystery',ev:'state',icon:'old-amber',name:'Mystery Solver',d:'Take 20 Mystery paths.',t:()=>achN('event')>=20,p:()=>[achN('event'),20]},
  {id:'kecleon',ev:'state',icon:'luxury-ball',name:'Kecleon\'s Regular',d:'Visit 10 Kecleon Shops.',t:()=>achN('shop')>=10,p:()=>[achN('shop'),10]},
  {id:'dex100',ev:'state',icon:'poke-radar',name:'Pokédex: 100',d:'Own 100 different evolution lines across all your runs.',t:()=>achSetN('lines')>=100,p:()=>[achSetN('lines'),100]},
  {id:'dex300',ev:'state',icon:'poke-radar',name:'Pokédex: 300',d:'Own 300 different evolution lines across all your runs.',t:()=>achSetN('lines')>=300,p:()=>[achSetN('lines'),300]},
  {id:'dexall',ev:'state',icon:'cherish-ball',name:'Gotta Catch \'Em All',d:'Own every evolution line in the game across all your runs.',t:()=>achSetN('lines')>=ROOTS.length,p:()=>[achSetN('lines'),ROOTS.length]},
  /* one-off moments (unlocked where they happen) */
  {id:'fusion',ev:'once',icon:'dna-splicers',name:'Two Become One',d:'Fuse two Pokémon.'},
  {id:'branch',ev:'once',icon:'up-grade',name:'Branching Path',d:'Choose a branching evolution.'},
  {id:'sell3',ev:'once',icon:'amulet-coin',name:'Selling Out',d:'Sell a 3★ Pokémon.'},
  {id:'luckyspin',ev:'once',icon:'lucky-egg',name:'Lucky Spin',d:'Take a 2★ Pokémon from a carousel.'},
];
const ACHMAP=Object.fromEntries(ACHS.map(a=>[a.id,a]));

/* ---------- earning ---------- */
let achQueue=[];
function achUnlock(id){if(!achOn()||ACHV.got[id]||!ACHMAP[id])return;ACHV.got[id]=Date.now();achSave();
  if(typeof mode!=='undefined'&&mode==='combat')achQueue.push(ACHMAP[id]);else achPop(ACHMAP[id]);}
function achFlush(){const q=achQueue;achQueue=[];q.forEach((a,i)=>setTimeout(()=>achPop(a),300+i*900));}
function achCheck(ev,x={}){if(!achOn()||!run)return;for(const a of ACHS){if(a.ev!==ev||ACHV.got[a.id]||!a.t)continue;let ok=false;try{ok=a.t(x);}catch(e){}if(ok)achUnlock(a.id);}}
// called after every UI refresh outside a fight
function achState(){if(!achOn()||!run||!run.strat||mode==='combat')return;
  const L=ACHV.st.lines=Array.isArray(ACHV.st.lines)?ACHV.st.lines:[];let ch=false;for(const u of allOwned())if(!L.includes(u.root)){L.push(u.root);ch=true;}if(ch)achSave();
  const R=achR();R.minHp=Math.min(R.minHp,run.hp);R.actMin=Math.min(R.actMin,run.hp);
  achCheck('state');}
// at the end of every fight (before the result banner)
function achBattle(win,kind){if(!achOn())return;const mine=units.filter(c=>c.team===0&&!c.summon),foes=units.filter(c=>c.team===1&&!c.summon).length;
  if(win)achAdd('wins');achAdd('kills',mine.reduce((s,c)=>s+(c.kills||0),0));
  const R=achR();R.minHp=Math.min(R.minHp,run.hp);R.actMin=Math.min(R.actMin,run.hp);
  achCheck('battle',{win,kind,mine,foes,lost:mine.some(c=>c.dead),time:combatT});achState();achFlush();}
function achAct(a){if(!achOn())return;if(a===2)achSetAdd('envWins',String(run.strat.id).startsWith('index:')?'index':run.strat.id);achCheck('act',{a});const R=achR();R.actMin=run.maxHp;R.actRolls=0;}
function achRunStart(){if(!achOn())return;achAdd('runs');achSetAdd('modes',MODE.id);achCheck('start');}
function achEnv(s){if(!achOn())return;achSetAdd('envs',String(s.id).startsWith('index:')?'index':s.id);run.achR={minHp:run.hp,actMin:run.hp,actRolls:0};achCheck('start');}

/* ---------- the pop-up and the screen ---------- */
function achPop(a){
  let host=$('achhost');if(!host){host=document.createElement('div');host.id='achhost';document.body.appendChild(host);}
  const el=document.createElement('div');el.className='achpop';el.setAttribute('role','status');
  el.innerHTML=`<img src="${iconOf(a.icon)}" alt=""><div><div class="k">Achievement unlocked</div><b>${esc(a.name)}</b><p>${esc(a.d)}</p></div>`;
  host.appendChild(el);if(typeof sfx==='function')sfx('treasure',300);
  requestAnimationFrame(()=>el.classList.add('in'));
  setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),400);},4200);
}
function showAchievements(back){
  const n=ACHS.filter(a=>ACHV.got[a.id]).length;
  const row=a=>{const got=ACHV.got[a.id],p=!got&&a.p?a.p():null;
    return`<div class="achrow${got?' got':''}"><img src="${iconOf(a.icon)}" alt=""><div><b>${esc(a.name)}</b><p>${esc(a.d)}</p>${p?`<div class="achbar"><span style="width:${Math.min(100,100*p[0]/p[1])}%"></span></div><small>${Math.min(p[0],p[1]).toLocaleString()} / ${p[1].toLocaleString()}</small>`:''}${got?`<small>Unlocked ${new Date(got).toLocaleDateString()}</small>`:''}</div></div>`;};
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Achievements</h1><p class="sub">${n} of ${ACHS.length} unlocked</p>
    <div class="win dialog wide achlist">${ACHS.slice().sort((a,b)=>(ACHV.got[b.id]?1:0)-(ACHV.got[a.id]?1:0)).map(row).join('')}</div>
    <button class="btn" id="back">Back</button></div>`;
  $('back').onclick=back||showTitle;$('back').focus();
}
