"use strict";
/* PokéRun Tactics — augments (TFT-style).
   You pick one of three augments on floors 2 and 7 of every act (floor 2 in Endless). Nothing you've been offered
   comes back later in the run.
   All three choices share a tier (silver, gold or prismatic); each card can be rerolled once, and one card is
   often a set augment (Heart / Crest / Crown) for a set you already play. Augments last the rest of the run. */

const AUG_FLOORS=a=>a<3?[2,7]:[2];
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
  /* ---------------- more silver ---------------- */
  {id:'builtdiff',t:'silver',tag:'team',icon:'everstone',name:'Built Different',d:'Your Pokémon that aren\'t part of any active set (types don\'t count) gain +300 max HP and +20% Attack Speed.',
    ef:x=>unitSets(x.u).some(k=>SETS[k]&&SETS[k].cat!=='type'&&tierOf(k,x.tr[k]||0))?null:{hpF:300,as:.2}},
  {id:'cluttered',t:'silver',tag:'econ',icon:'rare-candy',name:'Cluttered Mind',d:'If your bench is full at the start of a floor, gain 4 XP.',floor(){if(run.bench.every(Boolean)){gainXP(4);if(!SIM.on)toast('Cluttered Mind: +4 XP');}}},
  {id:'warmup',t:'silver',tag:'combat',icon:'flame-orb',name:'Warm-Up',d:'After 8 seconds of battle, your team deals +25% damage for the rest of it.',start(mine){schedule(8,()=>{for(const c of mine)if(!c.dead)c.dmg+=.25;});}},
  {id:'firstblood',t:'silver',tag:'combat',icon:'razor-fang',name:'First Blood',d:'The first time your team knocks out an enemy each battle, every one of your Pokémon gains 25 PP.',
    kill(src){if(battle.fb)return;battle.fb=1;for(const c of alive(0))gainMana(c,25);}},
  {id:'patient',t:'silver',tag:'econ',icon:'wise-glasses',name:'Patient Study',d:'After a win, gain 2 XP. After a loss, gain 4.',after(win){gainXP(win?2:4);}},
  {id:'calcloss',t:'silver',tag:'econ',icon:'premier-ball',name:'Calculated Loss',d:'After a loss, gain ₽2 and a free reroll.',after(win){if(!win){run.gold+=2;run.freeRerolls=(run.freeRerolls||0)+1;return'Calculated Loss +₽2';}}},
  {id:'feather',t:'silver',tag:'team',icon:'pretty-wing',name:'Featherweights',d:'Your ₽1 and ₽2 Pokémon gain +20% Attack Speed and dodge 12% of attacks.',ef:x=>x.cost<=2?{as:.2,dodge:.12}:null},
  {id:'bodyguard',t:'silver',tag:'team',icon:'rusted-shield',name:'Bodyguard',d:'Your frontmost Pokémon starts each battle with a shield of 40% of its max HP.',
    start(mine){const f=mine.slice().sort((a,b)=>a.r-b.r||b.maxHp-a.maxHp)[0];if(f)f.shield+=f.maxHp*.4;}},
  {id:'stickyweb',t:'silver',tag:'combat',icon:'silver-powder',name:'Sticky Web',d:'Enemies have 20% less Attack Speed for the first 6 seconds of battle.',start(mine,foes){for(const o of foes)o.as*=.8;schedule(6,()=>{for(const o of foes)o.as/=.8;});}},
  {id:'helping',t:'silver',tag:'team',icon:'soothe-bell',name:'Helping Hand',d:'Each of your Pokémon gains +4% damage for every adjacent ally (up to +24%).',ef:x=>({dmg:.04*adjAllies(x)})},
  {id:'lonewolf',t:'silver',tag:'team',icon:'black-belt',name:'Lone Wolf',d:'Your Pokémon with no adjacent allies gain +30% damage and +15% Attack Speed.',ef:x=>adjAllies(x)?null:{dmg:.3,as:.15}},
  {id:'spite',t:'silver',tag:'combat',icon:'spell-tag',name:'Spite',d:'When one of your Pokémon faints, the enemy that knocked it out loses all its PP.',fall(tg,src){if(src&&src.team===1)src.mana=0;}},
  {id:'piggyaug',t:'silver',tag:'econ',icon:'star-piece',name:'Coin Purse',d:'Gain ₽1 at the start of every floor. Every 5th floor it pays ₽6 instead.',floor(){const s=augS('piggyaug');s.n=(s.n||0)+1;run.gold+=s.n%5===0?6:1;}},
  /* ---------------- more gold ---------------- */
  {id:'blitz',t:'gold',tag:'combat',icon:'quick-powder',name:'Blitz',d:'For the first 6 seconds of battle, your team has +50% Attack Speed.',start(mine){for(const c of mine)c.as*=1.5;schedule(6,()=>{for(const c of mine)c.as/=1.5;});}},
  {id:'lotus',t:'gold',tag:'combat',icon:'scope-lens',name:'Jeweled Lotus',d:'Your Pokémon\'s moves can critically hit, and your team gains +15% crit chance.',e:{abCrit:1,crit:.15}},
  {id:'spoils',t:'gold',tag:'items',icon:'honey',name:'Spoils of War',d:'Every enemy your team knocks out has a 15% chance to drop an item component (up to 2 a battle).',
    kill(){if(Math.random()<.15&&(battle.spoils||0)<2&&run.bag.length<BAGMAX){battle.spoils=(battle.spoils||0)+1;run.bag.push(mkComp(randComp(),[]));}}},
  {id:'combattrain',t:'gold',tag:'team',icon:'muscle-band',name:'Combat Training',d:'After every battle, your strongest Pokémon permanently gains +30 max HP and +3 Attack and Sp. Atk.',
    after(){const u=augStrongest();if(u){u.g=u.g||{};u.g.hp=(u.g.hp||0)+30;u.g.atk=(u.g.atk||0)+3;u.g.spa=(u.g.spa||0)+3;}}},
  {id:'flank',t:'gold',tag:'team',icon:'wide-lens',name:'Flanking',d:'Your Pokémon in the leftmost or rightmost column gain +30% damage and +20% Attack Speed.',ef:x=>x.col===0||x.col===COLS-1?{dmg:.3,as:.2}:null},
  {id:'finalgambit',t:'gold',tag:'combat',icon:'focus-band',name:'Final Gambit',d:'When one of your Pokémon faints, every ally gains +10% damage and Attack Speed for the rest of the battle.',
    fall(tg){if(tg.team!==0)return;for(const c of alive(0)){c.dmg+=.1;c.as*=1.1;}}},
  {id:'bellydrum',t:'gold',tag:'combat',icon:'big-malasada',name:'Belly Drum',d:'Your Pokémon start each battle at 70% HP, but deal +35% damage.',e:{dmg:.35},start(mine){for(const c of mine)c.hp=c.maxHp*.7;}},
  {id:'toxicspikes',t:'gold',tag:'status',icon:'poison-barb',name:'Toxic Spikes',d:'Every enemy starts the battle with 4 Poison.',start(mine,foes){const s=mine[0];if(s)for(const o of foes)addStatus(o,'poison',4,s,{raw:1});}},
  {id:'mentor',t:'gold',tag:'team',icon:'exp-share',name:'Mentorship',d:'Your 1★ Pokémon gain +40% max HP and +25% damage. Your 3★ Pokémon gain +10%.',ef:x=>x.star===1?{hpP:.4,dmg:.25}:x.star>=3?{hpP:.1,dmg:.1}:null},
  {id:'stormfront',t:'gold',tag:'combat',icon:'zap-plate',name:'Storm Front',d:'Every 3 seconds, lightning strikes the enemy with the most HP for 6% of its max HP and stuns it for 0.5s.',
    start(mine,foes){const z=()=>{if(mode!=='combat'&&!SIM.on)return;const t=alive(1).sort((a,b)=>b.hp-a.hp)[0];if(t){hurt(t,t.maxHp*.06,null);stun(t,.5);if(!SIM.on)pfx('Thunder_Shock',t.x,t.y-16,{sc:.9,force:1});}schedule(3,z);};schedule(3,z);}},
  /* ---------------- more prismatic ---------------- */
  {id:'ascension',t:'prismatic',tag:'combat',icon:'sacred-ash',name:'Ascension',d:'After 12 seconds of battle, your team deals +70% damage.',start(mine){schedule(12,()=>{for(const c of mine)if(!c.dead){c.dmg+=.7;if(!SIM.on)texts.push({x:c.x,y:c.y-36,txt:'Ascended!',col:'#ffe27a',life:1,label:1});}});}},
  {id:'levelup',t:'prismatic',tag:'econ',icon:'rare-candy',name:'Level Up!',d:'Buying XP gives 3 extra XP, and every level you reach pays ₽2.',xpp:3,level(){run.gold+=2;}},
  {id:'wondertrade',t:'prismatic',tag:'team',icon:'up-grade',name:'Wonder Trade',d:'At the start of every floor, your cheapest 1★ bench Pokémon is traded for a random Pokémon one cost higher.',
    floor(){const u=run.bench.filter(x=>x&&x.star===1&&!x.fuse).sort((a,b)=>lineOf(a).cost-lineOf(b).cost)[0];if(!u||lineOf(u).cost>=5)return;const c=lineOf(u).cost+1;for(const it of u.items)run.bag.push(it);removeUnit(u);gainUnit(pick(MODE.byCost[c-1].length?MODE.byCost[c-1]:MODE.byCostAll[c-1]),1);if(!SIM.on)toast('Wonder Trade!');}},
  {id:'pandora',t:'prismatic',tag:'items',icon:'box-gold',name:'Pandora\'s Items',d:'Gain 2 components now. At the start of every floor, the items in your bag are rerolled (components stay components, finished stay finished).',
    gain(){gainItems(2,false);},floor(){run.bag=run.bag.map(it=>isCraft(it)?{k:randCraft(),mut:it.mut||[]}:isComp(it)?mkComp(randComp(),it.mut||[]):it);}},
  {id:'cosmic',t:'prismatic',tag:'team',icon:'comet-shard',name:'Cosmic Power',d:'At the start of every floor, your Pokémon on the field permanently gain +25 max HP and +2 Attack and Sp. Atk.',
    floor(){for(const u of Object.values(run.board)){u.g=u.g||{};u.g.hp=(u.g.hp||0)+25;u.g.atk=(u.g.atk||0)+2;u.g.spa=(u.g.spa||0)+2;}}},
  {id:'doubleteam',t:'prismatic',tag:'team',icon:'bright-powder',name:'Double Team',d:'At the start of every battle, your strongest Pokémon makes a copy of itself with half its HP (and none of its items).',
    start(mine){const a=mine.slice().sort((x,y)=>y.maxHp*y.u.star-x.maxHp*x.u.star)[0];if(!a)return;const sp=nbrs(a.c,a.r).filter(h=>!occupied(h.c,h.r)&&h.r>=0&&h.r<ROWS&&h.c>=0&&h.c<COLS);if(!sp.length)return;
      const h=sp[0],nu=mkUnit(a.u.root);nu.dex=a.u.dex;nu.star=a.u.star;const c=makeCombatant(nu,0,h.c,h.r,battle.trs[0],1);c.summon=1;c.maxHp*=.5;c.hp=c.maxHp;units.push(c);if(!SIM.on){ensure(nu.dex);burst(c.x,c.y-10,'#ffffff',16,1);}}},
  {id:'goldenegg',t:'prismatic',tag:'team',icon:'lucky-egg',name:'Golden Egg',d:'Hatches after 5 floors into a random 3★ ₽2 Pokémon.',floor(){const s=augS('goldenegg');s.n=(s.n||0)+1;if(s.n===5){gainUnit(pick(MODE.byCost[1]),3);if(!SIM.on)toast('The Golden Egg hatched!');}}},
  {id:'explosion',t:'prismatic',tag:'combat',icon:'smoke-ball',name:'Explosion',d:'When your Pokémon faint, they explode for 25% of their max HP to adjacent enemies.',
    fall(tg){if(tg.team!==0||tg.decoy)return;for(const o of alive(1))if(hdist(o,tg)<=1)damage(tg,o,tg.maxHp*.25,{ab:1,cat:'phys',noCrit:1,refl:1});if(!SIM.on)pfx('Explosion',tg.x,tg.y-12,{sc:1,force:1});}},
  {id:'rebirth',t:'prismatic',tag:'combat',icon:'sacred-ash',name:'Rebirth',d:'The first of your Pokémon to faint in each battle rises again with full HP and +30% damage.',rise:1},
  {id:'superstar',t:'prismatic',tag:'team',icon:'star-piece',name:'Superstars',d:'Your 3★ Pokémon gain +50% max HP and +40% damage.',ef:x=>x.star>=3?{hpP:.5,dmg:.4}:null},
  {id:'tinytitans',t:'prismatic',tag:'econ',icon:'max-potion',name:'Tiny Titans',d:'+30 Trainer HP and max Trainer HP now, and heal 2 Trainer HP after every win.',gain(){run.maxHp+=30;run.hp+=30;},after(win){if(win)run.hp=Math.min(run.maxHp,run.hp+2);}},
  {id:'metronome',t:'prismatic',tag:'combat',icon:'metronome',name:'Metronome',d:'At the start of every battle, each of your Pokémon rolls a random bonus: +40% damage, +40% Attack Speed, +40% max HP or +40 PP.',
    start(mine){for(const c of mine){const r=Math.floor(Math.random()*4);if(r===0)c.dmg+=.4;else if(r===1)c.as*=1.4;else if(r===2){c.maxHp*=1.4;c.hp*=1.4;}else gainMana(c,40);}}},
  {id:'apex',t:'prismatic',tag:'combat',icon:'razor-claw',name:'Apex Predator',d:'Every time one of your Pokémon knocks out an enemy, it gains +12% damage and Attack Speed for the battle (stacks).',kill(src){if(src&&!src.dead){src.dmg+=.12;src.as*=1.12;}}},
  {id:'wormhole',t:'prismatic',tag:'team',icon:'dusk-stone',name:'Ultra Wormhole',d:'A random 2★ ₽4 Pokémon comes through now, and another at the start of the next act.',gain(){gainUnit(pick(MODE.byCost[3].length?MODE.byCost[3]:MODE.byCostAll[3]),2);augS('wormhole').a=actOf();},
    act(){const s=augS('wormhole');if(s.done)return;s.done=1;gainUnit(pick(MODE.byCost[3].length?MODE.byCost[3]:MODE.byCostAll[3]),2);}},
  {id:'mindmeld',t:'prismatic',tag:'combat',icon:'twisted-spoon',name:'Mind Meld',d:'Whenever one of your Pokémon uses its move, every other ally gains 8 PP.',cast(u){if(u.team!==0)return;for(const c of alive(0))if(c!==u)gainMana(c,8);}},
  {id:'trickroom',t:'prismatic',tag:'combat',icon:'iron-ball',name:'Trick Room',d:'For the first 10 seconds of battle, your slower half of Pokémon gain +80% Attack Speed and the faster half of enemies lose 30%.',
    start(mine,foes){const sl=mine.slice().sort((a,b)=>a.as-b.as).slice(0,Math.ceil(mine.length/2)),fa=foes.slice().sort((a,b)=>b.as-a.as).slice(0,Math.ceil(foes.length/2));
      for(const c of sl)c.as*=1.8;for(const o of fa)o.as*=.7;schedule(10,()=>{for(const c of sl)c.as/=1.8;for(const o of fa)o.as/=.7;});if(!SIM.on)texts.push({x:320,y:130,txt:'Trick Room!',col:'#d48bff',life:1.6,label:1});}},
  {id:'echo',t:'prismatic',tag:'combat',icon:'choice-specs',name:'Echoed Voice',d:'Your team\'s basic attacks have a 30% chance to strike twice.',e:{double:.3}},
];
// set augments for every type and class: Heart (+1), Crest (+1 and a Pokémon), Crown (+2 and a 2★ Pokémon)
for(const k of Object.keys(SETS).filter(k=>SETS[k].cat==='type'||SETS[k].cat==='class'||(SETS[k].cat==='style'&&!SETS[k].kin))){
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
// augments and investment strategies share hooks (see invest.js)
const perks=()=>myAugs().concat(typeof myInvs==='function'?myInvs():[]);
const augS=id=>{run.augSt=run.augSt||{};return run.augSt[id]=run.augSt[id]||{};};
// how many of your Pokémon stand next to this one
const adjAllies=x=>Object.keys(run.board).filter(k=>{const[c,r]=k.split(',').map(Number);return(c!==x.col||r!==x.row)&&hdist({c,r},{c:x.col,r:x.row})===1;}).length;
function augIs(id){return!!(run&&run.augs&&run.augs.some(x=>x.id===id));}
function augDue(){if(!run||mode==='over')return false;const fl=AUG_FLOORS(actOf());if(!fl.includes(run.floor))return false;return!(run.augsAt||[]).includes(effFloor(run.floor));}
// per-unit combat effects
function augE(u,col,row,tr){
  const out={},L=lineOf(u),x={u,col,row,tr,cost:L.cost,star:u.star,types:D[u.dex].t,ace:null};
  for(const a of perks()){if(a.e)addE(out,a.e);if(a.ef){if(a.id==='ace')x.ace=x.ace||augStrongest();const r=a.ef(x);if(r)addE(out,r);}}
  return out;}
// team-wide battle flags (weather, intimidate, ...)
function augTeamX(tx){for(const a of perks())if(a.x)for(const k in a.x){if(typeof a.x[k]==='number')tx[k]=(tx[k]||0)+a.x[k];else if(!tx[k])tx[k]=a.x[k];}}
// extra set counts from Hearts, Crests and Crowns
function augSetBonus(ct){for(const a of myAugs()){if(a.sets)for(const k in a.sets)if(ct[k])ct[k]+=a.sets[k];if(a.kin||a.kinAll)for(const k in ct)if(SETS[k]&&SETS[k].kin&&(a.kinAll||tierOf(k,ct[k])))ct[k]+=1;}}
function augOnFloor(){perkRun('floor');}
function augAfter(win,fought,lost){return perkRun('after',win,fought,lost).filter(m=>typeof m==='string');}
const augInterestCap=()=>augIs('richer')?3:0;
const rerollCost=()=>Math.max(0,(augIs('goldtix')?1:2)+perkNum('rr'));
const xpBuyAmount=()=>(augIs('study')?6:4)+perkNum('xpp');

/* ---------- choosing ---------- */
function rollAugTier(){const n=(run.augs||[]).length,x=Math.random();
  if(actOf()>=ACTS.length)return x<.4?'gold':'prismatic';
  if(n===0)return x<.3?'silver':x<.8?'gold':'prismatic';
  return x<.15?'silver':x<.65?'gold':'prismatic';}
// nothing you've been offered comes back later in the run (unless a tier runs dry)
function augPool(tier,exclude){const own=new Set((run.augs||[]).map(x=>x.id)),seen=new Set(run.augSeen||[]);
  let p=AUGDEF.filter(a=>a.t===tier&&!a.set&&!own.has(a.id)&&!exclude.has(a.id)&&!seen.has(a.id));if(!p.length)p=AUGDEF.filter(a=>a.t===tier&&!a.set&&!own.has(a.id)&&!exclude.has(a.id));return p;}
function seenAug(ids){run.augSeen=run.augSeen||[];for(const id of ids)if(!run.augSeen.includes(id))run.augSeen.push(id);}
function setAugFor(tier,exclude){
  // a set augment for one of the sets you already play (weighted toward your biggest)
  const ct=countTraits(allOwned());const ks=Object.keys(ct).filter(k=>SETS[k]&&(SETS[k].cat==='type'||SETS[k].cat==='class'||(SETS[k].cat==='style'&&!SETS[k].kin)));if(!ks.length)return null;
  ks.sort((a,b)=>ct[b]-ct[a]);const k=Math.random()<.6?ks[0]:pick(ks.slice(0,4));
  const id=({silver:'heart:',gold:'crest:',prismatic:'crown:'}[tier])+k;
  if(exclude.has(id)||(run.augs||[]).some(x=>x.id===id)||(run.augSeen||[]).includes(id))return null;return AUGMAP[id];}
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
  if(a.gain)a.gain.call(a);combine();}
function botAug(){const t=rollAugTier();const ch=rollAugChoices(t);seenAug(ch);if(ch.length)applyAug(AUGMAP[pick(ch)],t);else (run.augsAt=run.augsAt||[]).push(effFloor(run.floor));}

/* ---------- the selection screen ---------- */
function showAugment(){
  mode='augment';$('bannerhost').innerHTML='';hideTip();peekOff();
  if(!run.augOffer||run.augOffer.at!==effFloor(run.floor)){const t=rollAugTier();run.augOffer={at:effFloor(run.floor),tier:t,ids:rollAugChoices(t),rr:[0,0,0]};seenAug(run.augOffer.ids);}
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
  ov.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rr;if(O.rr[i])return;const ex=new Set(O.ids);const a=rollAugCard(tier,ex,true);if(a){O.ids[i]=a.id;seenAug([a.id]);}O.rr[i]=1;showAugment();});
  $('augteam').onclick=()=>{hideTip();ov.innerHTML='';peekOn('Back to augments',showAugment);};
}
function afterAugment(){if(gimDue())return showGimmickChoice();if(invDue())return showInvest();banner(`Floor ${run.floor}`,trainerName(run.floor),1400);}
