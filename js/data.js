"use strict";
/* PokéRun Tactics — static tables. Numbers here are the balance knobs. */

const TYPES={Normal:'#9a9a72',Fire:'#ea7a2c',Water:'#4a7fe0',Grass:'#5fae45',Electric:'#e0b415',Ice:'#5cc4c6',Fighting:'#c03a2b',Poison:'#9a45a4',
  Ground:'#c9a24f',Flying:'#8f7ad8',Psychic:'#ec5a87',Bug:'#93a51c',Rock:'#b29d3b',Ghost:'#6a5294',Dragon:'#6a3cf0',Dark:'#6b5646',Steel:'#8f93b0',Fairy:'#e07fb0'};
const REGIONS=['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar','Paldea'];
const REGCOL=['#c9483c','#b8901c','#23897d','#5a6fc0','#45454f','#2f74b5','#e07a2f','#7a3fa8','#c23a5a'];
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX'];
const STARTERS=[[1,4,7],[152,155,158],[252,255,258],[387,390,393],[495,498,501],[650,653,656],[722,725,728],[810,813,816],[906,909,912]]; // grass, fire, water

/* Move power multiplier per star level */
const STARB=[1,1.5,2.5];

/* Sets (traits) live in sets.js */

/* ---------- Strategies (Currency Wars–style run guidelines) ---------- */
const STRATS=[
  {id:'ember',name:'Ember Gambit',type:'Fire',si:1,risk:'Aggressive',pts:['Fire Pokémon deal +15% damage.','Win streaks pay double streak gold.','Losses cost 2 more Trainer HP.'],guide:'Build around Fire. Push your streak.'},
  {id:'tidal',name:'Tidal Fortress',type:'Water',si:2,risk:'Steady',pts:['Start with 125 Trainer HP.','Your Pokémon take 10% less damage.','Water Pokémon start with +10 PP.'],guide:'Hold the line with Water tanks.'},
  {id:'verdant',name:'Verdant Investment',type:'Grass',si:0,risk:'Scaling',pts:['Interest pays ₽1 per ₽8 saved (instead of ₽10), up to ₽7.','Grass Pokémon restore +1% max HP per second.'],guide:'Save early, spend late. Grass sustains.'},
];

/* ---------- Augments (floor 2) ---------- */
const AUGS={
  silver:[{id:'static',name:'Static',d:'Your team\'s basic attacks have a 30% chance to add 1 Paralysis.'},{id:'ppoint',name:'Poison Point',d:'Your team\'s basic attacks have a 30% chance to add 1 Poison.'},{id:'fbody',name:'Flame Body',d:'Your team\'s basic attacks have a 30% chance to add 1 Burn.'},{id:'berry',name:'Berry Basket',d:'Gain ₽8 right now.'},{id:'tailwind',name:'Tailwind',d:'Your team gains +10% Attack Speed.'},{id:'oran',name:'Oran Rations',d:'Your team gains +150 max HP.'}],
  gold:[{id:'hexer',name:'Hex Maniac',d:'Your team deals +5% damage for each different status condition on the target (up to +30%).'},{id:'outbreak',name:'Outbreak',d:'When an enemy with status conditions faints, half of each of its stacks spread to enemies within 2 hexes.'},{id:'egg',name:'Daycare Egg',d:'Gain a random 2★ Pokémon on your bench.'},{id:'endure',name:'Endure',d:'Once per battle, each of your Pokémon survives a fainting blow with 1 HP.'},{id:'swords',name:'Swords Dance',d:'Your team deals +20% damage.'}],
  prismatic:[{id:'plague2',name:'Plague Doctor',d:'Status conditions your team applies add double the stacks, and your Burn, Poison and Leech Seed deal +25% damage.'},{id:'resolve',name:"Trainer's Resolve",d:'+1 team size for the rest of the run.'},{id:'payday',name:'Pay Day',d:'Gain an extra ₽3 at the start of every floor.'},{id:'champion',name:"Champion's Belt",d:'Your team deals +30% damage and gains +15% Attack Speed.'}],
};

/* ---------- Items: TFT-style components and recipes ---------- */
const CORDER='PCSIZHUD';
const COMP={
  P:{id:'protein',n:'Protein',d:'+10% Attack',e:{atkP:.1}},
  C:{id:'calcium',n:'Calcium',d:'+10% Sp. Atk',e:{spaP:.1}},
  S:{id:'carbos',n:'Carbos',d:'+10% Attack Speed',e:{as:.1}},
  I:{id:'iron',n:'Iron',d:'+15 Defense',e:{def:15}},
  Z:{id:'zinc',n:'Zinc',d:'+15 Sp. Def',e:{res:15}},
  H:{id:'hp-up',n:'HP Up',d:'+120 max HP',e:{hpF:120}},
  U:{id:'pp-up',n:'PP Up',d:'+12 starting PP',e:{mana:12}},
  D:{id:'dire-hit',n:'Dire Hit',d:'+10% crit chance',e:{crit:.1}},
};
const CRAFT={
  PP:{id:'choice-band',n:'Choice Band',d:'+30% more Attack.',e:{atkP:.3}},
  PC:{id:'life-orb',n:'Life Orb',d:'+25% damage. Each attack costs 2% of the holder\'s max HP.',e:{dmg:.25,orb:.02}},
  PS:{id:'expert-belt',n:'Expert Belt',d:'+15% damage, and +30% more against targets with over 1,500 max HP.',e:{dmg:.15,giant:.3}},
  PI:{id:'razor-fang',n:'Razor Fang',d:'Attacks lower the target\'s Defense by 4 (stacks).',e:{shred:4}},
  PZ:{id:'muscle-band',n:'Muscle Band',d:'Physical moves deal +30% damage.',e:{physAb:.3}},
  PH:{id:'shell-bell',n:'Shell Bell',d:'Heals for 20% of all damage dealt.',e:{ls:.2}},
  PU:{id:'punching-glove',n:'Punching Glove',d:'Attacks restore 8 extra PP.',e:{extraPP:8}},
  PD:{id:'scope-lens',n:'Scope Lens',d:'Moves can critically hit. +15% crit chance.',e:{abCrit:1,crit:.15}},
  CC:{id:'choice-specs',n:'Choice Specs',d:'+30% more Sp. Atk.',e:{spaP:.3}},
  CS:{id:'metronome',n:'Metronome',d:'Each attack grants +5% Attack Speed for the rest of battle (up to +60%).',e:{metroAS:.05}},
  CI:{id:'absorb-bulb',n:'Absorb Bulb',d:'When hit by a move, restores 20 PP and gains +10% Sp. Atk (stacks).',e:{bulb:1}},
  CZ:{id:'wise-glasses',n:'Wise Glasses',d:'Special moves deal +30% damage.',e:{specAb:.3}},
  CH:{id:'flame-orb',n:'Flame Orb',d:'Attacks and moves add 4 Burn to the target. Burned targets heal 50% less and deal 15% less physical damage.',e:{burn:.02}},
  CU:{id:'throat-spray',n:'Throat Spray',d:'Each move used grants +15% Sp. Atk for the rest of battle.',e:{spray:.15}},
  CD:{id:'spell-tag',n:'Spell Tag',d:'Special damage ignores 40% of the target\'s Sp. Def.',e:{specPen:.4}},
  SS:{id:'choice-scarf',n:'Choice Scarf',d:'+25% more Attack Speed.',e:{as:.25}},
  SI:{id:'weakness-policy',n:'Weakness Policy',d:'The first time it takes move damage, gains +40% Attack and Sp. Atk.',e:{wp:.4}},
  SZ:{id:'bright-powder',n:'Bright Powder',d:'20% chance to dodge attacks.',e:{dodge:.2}},
  SH:{id:'wide-lens',n:'Wide Lens',d:'+1 attack range.',e:{range:1}},
  SU:{id:'magnet',n:'Magnet',d:'Every 3rd attack zaps up to 3 enemies for 60 (+30% Sp. Atk) special damage.',e:{magnet:1}},
  SD:{id:'quick-claw',n:'Quick Claw',d:'Attacks have a 25% chance to strike twice.',e:{double:.25}},
  II:{id:'rocky-helmet',n:'Rocky Helmet',d:'Melee attackers take 5% of the holder\'s max HP as damage.',e:{helmet:.05}},
  IZ:{id:'eviolite',n:'Eviolite',d:'If the holder can still evolve: +50% Defense and Sp. Def and +20% max HP.',e:{eviolite:1}},
  IH:{id:'sitrus-berry',n:'Sitrus Berry',d:'Once per battle, heals 35% max HP when dropping below half.',e:{sitrus:.35}},
  IU:{id:'light-clay',n:'Light Clay',d:'At battle start, the holder and adjacent allies gain a shield of 20% max HP.',e:{clay:.2}},
  ID:{id:'focus-sash',n:'Focus Sash',d:'Once per battle, survives a fainting blow with 1 HP.',e:{focus:1}},
  ZZ:{id:'assault-vest',n:'Assault Vest',d:'Takes 25% less special damage.',e:{assault:.25}},
  ZH:{id:'berry-pots',n:'Soothing Berries',d:'Adjacent allies restore 2% max HP per second.',e:{soothe:.02}},
  ZU:{id:'clear-amulet',n:'Clear Amulet',d:'Immune to stuns and flinching. +10% Attack Speed.',e:{stunImm:1,as:.1}},
  ZD:{id:'covert-cloak',n:'Covert Cloak',d:'Takes 25% less damage from moves.',e:{cloak:.25}},
  HH:{id:'leftovers',n:'Leftovers',d:'Restores 3% max HP per second.',e:{regen:.03}},
  HU:{id:'lucky-egg',n:'Lucky Egg',d:'Gain 2 XP after each battle the holder fights.',e:{xp:2}},
  HD:{id:'kee-berry',n:'Kee Berry',d:'The first time it drops below 40% HP, gains +50 Defense and Sp. Def.',e:{kee:50}},
  UU:{id:'leppa-berry',n:'Leppa Berry',d:'After each move, restores 25 PP.',e:{leppa:25}},
  UD:{id:'booster-energy',n:'Booster Energy',d:'For the first 6 seconds of battle: +40% Attack Speed and +20% damage.',e:{booster:1}},
  DD:{id:'amulet-coin',n:'Amulet Coin',d:'Takedowns earn ₽1 (up to ₽2 per battle). +15% crit chance.',e:{coin:1,crit:.15}},
};
const recipeKey=(a,b)=>CORDER.indexOf(a)<=CORDER.indexOf(b)?a+b:b+a;

/* Mutators (The Last Flame–style modifiers rolled onto items) */
const MUTS={
  shiny:{n:'Shiny',d:'+10% max HP and damage',e:{hpP:.1,dmg:.1}},
  blazing:{n:'Blazing',d:'Attacks add 2 Burn',e:{burn:.01}},
  vampiric:{n:'Vampiric',d:'+10% lifesteal',e:{ls:.1}},
  swift:{n:'Swift',d:'+10% Attack Speed',e:{as:.1}},
  sturdy:{n:'Sturdy',d:'+12 Defense and Sp. Def',e:{def:12,res:12}},
  charged:{n:'Charged',d:'+12 starting PP',e:{mana:12}},
  lucky:{n:'Lucky',d:'+10% crit and dodge chance',e:{crit:.1,dodge:.1}},
  golden:{n:'Golden',d:'Earn ₽1 after each win while equipped',e:{gold:1}},
  growing:{n:'Growing',d:'Gains +2% damage permanently after every battle',e:{}},
  thorny:{n:'Thorny',d:'Melee attackers take 3% of the holder\'s max HP',e:{helmet:.03}},
  blessed:{n:'Blessed',d:'Start battle with a shield of 10% max HP',e:{shieldP:.1}},
  shadow:{n:'Shadow',d:'+15% damage, but takes 5% more damage',e:{dmg:.15,dr:-.05}},
};

/* Consumables */
const USE={
  'rare-candy':{id:'rare-candy',n:'Rare Candy',d:'Drag onto a Pokémon to gain a 1★ copy of it.',target:1},
  potion:{id:'potion',n:'Potion',d:'Click to restore 12 Trainer HP.'},
  nugget:{id:'nugget',n:'Nugget',d:'Click to gain ₽6.'},
  honey:{id:'honey',n:'Honey',d:'Click to make your next 4 rerolls free.'},
  'eject-pack':{id:'eject-pack',n:'Eject Pack',d:'Drag onto a Pokémon to take off all of its items and put them back in your bag. Found in rival, alpha and challenge chests.',target:1,rare:1},
};
// consumables that turn up anywhere (the Eject Pack only comes from better chests)
const USE_COMMON=Object.keys(USE).filter(k=>!USE[k].rare);

/* Relics (after defeating a rival) */
const RELICS={
  'exp-share':{n:'Exp. Share',d:'Gain 2 extra XP every floor.'},
  'coin-case':{n:'Coin Case',d:'Interest can go ₽3 higher.'},
  'shiny-charm':{n:'Shiny Charm',d:'Your first reroll each floor is free.'},
  'oval-charm':{n:'Oval Charm',d:'After each win, gain a 1★ copy of a random Pokémon you own.'},
  'soothe-bell':{n:'Soothe Bell',d:'Your Pokémon restore 1.5% max HP per second.'},
  bicycle:{n:'Bicycle',d:'Your Pokémon gain +30% Attack Speed for the first 6 seconds of battle.'},
  'dowsing-machine':{n:'Dowsing Machine',d:'Chests offer 4 choices instead of 3.'},
  'rainbow-wing':{n:'Rainbow Wing',d:'Your Pokémon gain +10% max HP and damage.'},
  'silver-wing':{n:'Silver Wing',d:'Your Pokémon start battle with a shield of 15% max HP.'},
  'town-map':{n:'Town Map',d:'Enemy Pokémon have 10% less HP.'},
  'super-rod':{n:'Super Rod',d:'Chests always offer at least one completed item.'},
  'poke-flute':{n:'Poké Flute',d:'The first of your Pokémon to faint each battle wakes up with 35% HP.'},
  magmarizer:{n:'Magmarizer',d:'When a burned enemy faints, its Burn stacks leap to the nearest enemy.'},
  'poison-barb':{n:'Poison Barb',d:'Poison your team applies never wears off.'},
  electirizer:{n:'Electirizer',d:'Paralysis your team applies slows by 5% per stack instead of 5%.'},
  snowball:{n:'Snowball',d:'Chill your team applies lowers Defense and Sp. Def by 5% per stack instead of 4%.'},
  'sticky-barb':{n:'Sticky Barb',d:'Every status your team applies adds 1 extra stack.'},
  'full-heal':{n:'Full Heal',d:'Status conditions deal half damage to your Pokémon and wear off twice as fast.'},
};

/* Pokémon that grow stronger over a run (TFT-style stackers) */
const GROWTH=[
  {ids:[129],n:'Splash Training',on:'battle',per:{hp:30,atk:3},d:'After every battle it fights: +30 HP and +3 Attack, permanently.'},
  {ids:[63],n:'Mind Expansion',on:'cast',per:{spa:3},d:'Each time it uses its move: +3 Sp. Atk, permanently.'},
  {ids:[56],n:'Rage Fist',on:'hit',every:6,per:{atk:2},d:'For every 6 hits it takes: +2 Attack, permanently.'},
  {ids:[143,446],n:'Leftovers Feast',on:'battle',per:{hp:50},d:'After every battle it fights: +50 max HP, permanently.'},
  {ids:[213],n:'Berry Juice',on:'battle',per:{def:3,res:3},d:'After every battle it fights: +3 Defense and Sp. Def, permanently.'},
  {ids:[349],n:'Prism Scale',on:'win',per:{hp:25,spa:3},d:'After every win: +25 HP and +3 Sp. Atk, permanently.'},
  {ids:[624],n:'Supreme Overlord',on:'kill',per:{atk:5},d:'Each takedown: +5 Attack, permanently.'},
  {ids:[679],n:'Blade Collector',on:'kill',per:{atk:3,spa:3},d:'Each takedown: +3 Attack and Sp. Atk, permanently.'},
  {ids:[746],n:'Schooling',on:'battle',per:{hp:40},d:'After every battle it fights: +40 max HP, permanently.'},
  {ids:[819],n:'Stockpile',on:'win',per:{hp:30},gold:.5,d:'After every win: +30 max HP permanently, and a 50% chance to find ₽1.'},
  {ids:[999],n:'Coin Hoard',on:'win',per:{spa:4},gold:1,d:'After every win: +4 Sp. Atk permanently and ₽1.'},
  {ids:[25,172],n:'Static Build-up',on:'cast',per:{as:.015},d:'Each time it uses its move: +1.5% Attack Speed, permanently.'},
  {ids:[133],n:'Adaptability',on:'battle',per:{hp:12,atk:1,spa:1},d:'After every battle it fights: +12 HP, +1 Attack and +1 Sp. Atk, permanently.'},
];

/* ---------- Run structure ---------- */
const ACTS=[{name:'Verdant Clearing'},{name:'Ember Canyon'},{name:'Tidepool Grotto'}];
const FLOORS=15;
const STARM=[1,1.8,3.24];
const floorKind=f=>f<=3?'wild':(f===5||f===10)?'elite':f===15?'boss':'trainer';
// trainer level, structured like TFT: XP to go from level L to L+1 follows TFT's curve scaled to a 15-floor run
// (TFT 2·6·10·20·36·48·76·84 → about 0.55×), +2 XP after every floor, and XP can be bought at ₽4 for 4 XP. Max level 10.
const XPNEXT={2:2,3:4,4:6,5:12,6:20,7:28,8:40,9:48};
const MAXLV=10;
// shop odds by trainer level for costs 1..5 (TFT's table): a cost never appears before its level
const LVODDS={2:[1,0,0,0,0],3:[.75,.25,0,0,0],4:[.55,.3,.15,0,0],5:[.45,.33,.2,.02,0],6:[.3,.4,.25,.05,0],7:[.19,.3,.35,.15,.01],8:[.18,.25,.32,.22,.03],9:[.1,.2,.25,.35,.1],10:[.05,.1,.2,.4,.25]};
// enemy team size by floor (wild floors set separately)
const ECOUNT={4:3,5:4,6:4,7:4,8:5,9:5,10:5,11:5,12:6,13:6,14:6,15:4};
const ELEVEL=f=>clamp(Math.round(2+f*.38),3,8);
const TRAINERS=['Youngster Ben','Lass Mira','Bug Catcher Rik','Picnicker Jo','Camper Theo','Hiker Bram','Beauty Celine','Ace Trainer Noor','Bird Keeper Paz','Fisher Wen','Ranger Ash','Twins Ada & Ida'];
const RIVALS=['Rival Kade','Rival Sora'];
