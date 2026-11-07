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
  // each strategy is a different way to make or spend money, paired with one type (si: the starter it features, if any)
  {id:'overcharge',name:'Overcharge',type:'Electric',risk:'Tempo',pts:['Level up costs ₽3 instead of ₽4.','Electric Pokémon get +15% Attack Speed.'],guide:'Level fast, field more Pokémon early.'},
  {id:'foresight',name:'Foresight',type:'Psychic',risk:'Rolling',pts:['Your first reroll every floor is free.','Psychic Pokémon start with +15 PP.'],guide:'Roll a little every floor to hit your 3★s.'},
  {id:'underdog',name:'Underdog',type:'Fighting',risk:'Comeback',pts:['Loss streaks pay double streak gold.','Fighting Pokémon deal +25% damage while you\'re at half Trainer HP or less.'],guide:'Lose early, bank gold, then hit back hard.'},
  {id:'tamer',name:'Dragon Tamer',type:'Dragon',risk:'Fast 8',pts:['Your shop rolls ₽4 and ₽5 Pokémon as if you were one level higher.','Dragon Pokémon get +12% max HP.'],guide:'Rush levels and chase the big Pokémon.'},
  {id:'swarm',name:'Swarm Tactics',type:'Bug',risk:'Reroll',pts:['Combining to 2★ pays ₽1; combining to 3★ pays ₽4.','Bug Pokémon get +10% Attack Speed.'],guide:'Stay low, collect copies, chain 3★s.'},
  {id:'armory',name:'Armory',type:'Steel',risk:'Items',pts:['Start with 2 item components, and get another every 4 floors.','Your Pokémon take 6% less damage; Steel Pokémon 12%.'],guide:'Slam strong items early and stay healthy.'},
  {id:'wager',name:'Haunted Wager',type:'Ghost',risk:'High risk',pts:['Start with 75 Trainer HP.','Every floor pays ₽2 more income.','Ghost Pokémon deal +10% damage.'],guide:'Trade Trainer HP for a much richer run.'},
  {id:'glacial',name:'Glacial Patience',type:'Ice',risk:'Saving',pts:['Each floor you don\'t buy a Pokémon pays ₽3.','Ice Pokémon start each battle with a shield of 12% max HP.'],guide:'Skip buying while you build interest, then strike.'},
  {id:'pickpocket',name:'Pickpocket',type:'Dark',risk:'Combat gold',pts:['Each knockout by your Pokémon has a 30% chance to steal ₽1 (up to ₽3 a battle).','Dark Pokémon get +10% crit chance.'],guide:'Win fights to fund your shop.'},
  {id:'charm',name:'Lucky Charm',type:'Fairy',risk:'Loot',pts:['Every chest you open also holds ₽3.','Fairy Pokémon heal and shield 20% more.'],guide:'Take every chest and grow from loot.'},
  {id:'collector',name:'Collector',type:'Normal',risk:'Flexible',pts:['Every 4th Pokémon you buy is free.','Normal Pokémon get +10% max HP.'],guide:'Buy freely and keep your options open.'},
];

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
/* Acts: each has its own scenery, enemy theme (enemy teams lean on these types), trainer classes and guardian.
   After Act III's guardian the run can go on in Endless mode, which builds new acts from ENDLESS_ACTS forever. */
const ACTS=[
  {name:'Verdant Clearing',bg:'forest',types:['Grass','Bug','Normal','Flying'],guard:'Guardian of the Grove',theme:'Forest Pokémon: Grass, Bug, Normal and Flying',
    tr:['Youngster','Lass','Bug Catcher','Picnicker','Camper','Bird Keeper','Aroma Lady','Pokémon Ranger']},
  {name:'Ember Canyon',bg:'canyon',types:['Fire','Ground','Rock','Fighting'],guard:'Guardian of the Canyon',theme:'Canyon Pokémon: Fire, Ground, Rock and Fighting',
    tr:['Hiker','Firebreather','Black Belt','Ruin Maniac','Kindler','Battle Girl','Worker','Biker']},
  {name:'Tidepool Grotto',bg:'grotto',types:['Water','Ice','Dark','Ghost'],guard:'Guardian of the Grotto',theme:'Grotto Pokémon: Water, Ice, Dark and Ghost',
    tr:['Swimmer','Fisherman','Sailor','Diver','Hex Maniac','Channeler','Skier','Beauty']},
];
const ENDLESS_ACTS=[
  {name:'Thunder Plains',bg:'plains',types:['Electric','Steel','Normal'],guard:'Storm Guardian',theme:'Plains Pokémon: Electric, Steel and Normal',tr:['Guitarist','Engineer','Scientist','Cyclist']},
  {name:'Haunted Ruins',bg:'ruins',types:['Ghost','Dark','Poison','Psychic'],guard:'Ruin Guardian',theme:'Ruin Pokémon: Ghost, Dark, Poison and Psychic',tr:['Hex Maniac','Medium','Punk','Psychic']},
  {name:'Sky Pillar',bg:'sky',types:['Dragon','Flying','Fairy'],guard:'Sky Guardian',theme:'Sky Pillar Pokémon: Dragon, Flying and Fairy',tr:['Dragon Tamer','Bird Keeper','Fairy Tale Girl','Ace Trainer']},
  {name:'Frozen Peak',bg:'snow',types:['Ice','Steel','Rock'],guard:'Peak Guardian',theme:'Peak Pokémon: Ice, Steel and Rock',tr:['Skier','Boarder','Hiker','Veteran']},
  {name:'Toxic Marsh',bg:'marsh',types:['Poison','Bug','Water','Grass'],guard:'Marsh Guardian',theme:'Marsh Pokémon: Poison, Bug, Water and Grass',tr:['Bug Maniac','Fisherman','Punk Girl','Ninja Boy']},
];
const TRNAMES=['Ben','Mira','Rik','Jo','Theo','Bram','Celine','Noor','Paz','Wen','Ash','Ada','Kofi','Lena','Ivo','Rhea','Tomas','Yuki','Sana','Oren'];
// scenery palettes: ground (inner/outer), dirt patches, canopy (dark→light, last is the highlight), trunks, falling particles
const BGPAL={
  forest:{inner:['#6aa646','#78b44f','#86c25a','#94cc66'],outer:['#2f6630','#3a7434','#44803a','#4f8e3e'],dirt:['#9a7d4c','#a98a56','#b89a62'],tuft:['#5b9a3f','#3a7434'],
    can:['#1d4527','#2c6435','#3d7f3d','#58a04a','#7cc25e'],trunk:['#5a3b24','#3d2716'],flow:['#f4f0e6','#ffd84a','#ff7a8a','#b7a2ff'],glow:'rgba(255,240,180,.10)',edge:'rgba(5,20,10,.55)',void:'#13201a',leaf:['#9fd16a','#c7d95a','#7fbf4f','#e0c25a']},
  canyon:{inner:['#c98a4f','#d39758','#dca463','#e4b06f'],outer:['#7a3a26','#8a442c','#985034','#a65c3c'],dirt:['#9a6038','#a86c42','#b6784c'],tuft:['#b0703c','#8a442c'],
    can:['#4a2318','#6b3322','#8a4a30','#a8643f','#c98058'],trunk:null,flow:['#ffd84a','#ff9a4a','#f4f0e6'],glow:'rgba(255,200,120,.12)',edge:'rgba(30,8,4,.55)',void:'#2a120a',leaf:['#ff9a4a','#ffd34d','#ff6a3a']},
  grotto:{inner:['#5f9c9a','#6aa8a4','#76b3ad','#84bdb5'],outer:['#1d4a6b','#22557a','#286089','#2e6b96'],dirt:['#c9b98a','#d4c495','#ddd0a2'],tuft:['#4f8a88','#22557a'],
    can:['#14324a','#1f4a66','#2c6283','#3f7fa0','#86d0dc'],trunk:null,flow:['#ff9ac0','#ffe27a','#bff4ff'],glow:'rgba(200,240,255,.10)',edge:'rgba(2,12,30,.6)',void:'#06182a',leaf:['#bff4ff','#e8fbff','#9fe0ff']},
  plains:{inner:['#a8b84a','#b4c454','#c0ce60','#cad86c'],outer:['#4a5a2a','#566832','#62743a','#6e8042'],dirt:['#9a8a4c','#a99856','#b8a862'],tuft:['#8c9c3a','#566832'],
    can:['#2e3a1c','#45552a','#5c7038','#7a8f48','#c9d870'],trunk:['#5a4a2a','#3a2e18'],flow:['#ffe95a','#f4f0e6','#ffd84a'],glow:'rgba(255,250,170,.12)',edge:'rgba(20,20,5,.55)',void:'#1a1a0c',leaf:['#ffe95a','#fff6a0','#e0e070']},
  ruins:{inner:['#6e6880','#787290','#827c9a','#8c86a4'],outer:['#2a2238','#322a44','#3a3250','#433a5c'],dirt:['#5a5266','#665e72','#726a7e'],tuft:['#5e5874','#322a44'],
    can:['#1a1426','#2a2040','#3e3058','#5a4878','#9a88c8'],trunk:['#4a4050','#2e2836'],flow:['#c9a8ff','#8affc8','#f4f0e6'],glow:'rgba(200,170,255,.08)',edge:'rgba(8,4,16,.65)',void:'#0c0814',leaf:['#c9a8ff','#8affc8','#e0d0ff']},
  sky:{inner:['#b8c4d0','#c2ccd8','#ccd6e0','#d6dee8'],outer:['#6a8ec0','#7698c8','#82a2d0','#8eacd8'],dirt:['#9aa6b4','#a6b2c0','#b2becc'],tuft:['#a2aebc','#7698c8'],
    can:['#9ab4dc','#b4c8e6','#cad8ee','#e2ecf8','#ffffff'],trunk:null,flow:['#ffd84a','#ff9ac0','#ffffff'],glow:'rgba(255,255,255,.12)',edge:'rgba(20,40,80,.45)',void:'#4a6a9a',leaf:['#ffffff','#e8f0ff','#ffe9a8']},
  snow:{inner:['#dfe8ef','#e6eef4','#edf3f8','#f4f8fb'],outer:['#8aa4b8','#96aec2','#a2b8cc','#aec2d6'],dirt:['#b8d8ec','#c4e0f2','#d0e8f6'],tuft:['#c8d6e0','#96aec2'],
    can:['#1f3a3a','#2c4f4c','#3d6660','#5a8a80','#e8f2f6'],trunk:['#4a3a2e','#2e241c'],flow:['#bfe8ff','#ffffff','#9fd0ff'],glow:'rgba(220,240,255,.12)',edge:'rgba(20,30,50,.5)',void:'#1a2836',leaf:['#ffffff','#e8f4ff','#d0e8ff']},
  marsh:{inner:['#5a7a3e','#64844a','#6e8e52','#78985c'],outer:['#2a3a26','#30422c','#384a32','#405238'],dirt:['#6a4a6e','#765478','#825e84'],tuft:['#4a6a34','#30422c'],
    can:['#1a2a18','#26402a','#34563a','#4a7048','#8aa860'],trunk:['#3a3024','#241c14'],flow:['#c070ff','#ffd84a','#8aff8a'],glow:'rgba(200,255,150,.06)',edge:'rgba(10,15,8,.6)',void:'#0e140c',leaf:['#a070d0','#8aa860','#c0e070']},
};
// an act is 10 floors. Enemy strength still follows the original 15-floor curve, compressed: floor f of an act
// fights like a later floor of the old curve (oldF / dFloor in game.js), so floor 10's guardian is as strong as it always was
const FLOORS=10,FSC=1.5;
const STARM=[1,1.8,3.24];
const floorKind=f=>f<=2?'wild':f===5?'elite':f===FLOORS?'boss':'trainer';
// trainer level, structured like TFT: XP to go from level L to L+1 follows TFT's curve scaled to a 15-floor run
// (TFT 2·6·10·20·36·48·76·84 → about 0.55×), +2 XP after every floor, and XP can be bought at ₽4 for 4 XP. Max level 10.
const XPNEXT={2:2,3:4,4:6,5:12,6:20,7:28,8:40,9:48};
const MAXLV=10;
// shop odds by trainer level for costs 1..5 (TFT's table): a cost never appears before its level
const LVODDS={2:[1,0,0,0,0],3:[.75,.25,0,0,0],4:[.55,.3,.15,0,0],5:[.45,.33,.2,.02,0],6:[.3,.4,.25,.05,0],7:[.19,.3,.35,.15,.01],8:[.18,.25,.32,.22,.03],9:[.1,.2,.25,.35,.1],10:[.05,.1,.2,.4,.25]};
// enemy team size by floor (wild floors set separately)
const ECOUNT={4:3,5:4,6:4,7:4,8:5,9:5,10:5,11:5,12:6,13:6,14:6,15:4};
const ELEVEL=f=>clamp(Math.round(2+f*.38),3,8);
// extra enemy power per act (on top of the floor curve) and guardian power per act
const ACTSCALE=[1,1,1.06,1.1];
const BOSSCALE=[1,1.15,1.85,2.2];
const TRAINERS=['Youngster Ben','Lass Mira','Bug Catcher Rik','Picnicker Jo','Camper Theo','Hiker Bram','Beauty Celine','Ace Trainer Noor','Bird Keeper Paz','Fisher Wen','Ranger Ash','Twins Ada & Ida'];
const RIVALS=['Rival Kade','Rival Sora'];
