"use strict";
/* PokéRun Tactics — sets (traits), ability passives and kit tuning.
   Effect keys are read by makeCombatant() / combat hooks in game.js. */

/* ---------- Sets ----------
   cat: type | class | style | region
   bp: breakpoints (distinct Pokémon needed)
   m: effects for members, per tier;  t: effects for the whole team, per tier;  x: special flags per tier
   d: description per tier */
const SETS={
  /* Types (from the Pokémon's current types) */
  Normal:{cat:'type',bp:[2,4,6],m:[{hpP:.15},{hpP:.3},{hpP:.5}],d:'Normal Pokémon gain +15% / +30% / +50% max HP.'},
  Fire:{cat:'type',bp:[2,4,6],m:[{dmg:.12},{dmg:.25},{dmg:.45}],d:'Fire Pokémon deal +12% / +25% / +45% damage.'},
  Water:{cat:'type',bp:[2,4,6],m:[{mana:20},{mana:40},{mana:70}],d:'Water Pokémon start battle with +20 / +40 / +70 PP.'},
  Grass:{cat:'type',bp:[2,4,6],m:[{regen:.015},{regen:.03},{regen:.05}],d:'Grass Pokémon restore 1.5% / 3% / 5% max HP per second.'},
  Electric:{cat:'type',bp:[2,4,6],m:[{as:.12},{as:.25},{as:.45}],d:'Electric Pokémon gain +12% / +25% / +45% Attack Speed.'},
  Ice:{cat:'type',bp:[2,4,6],m:[{crit:.12},{crit:.25},{crit:.4}],t:[{},{},{enemyAS:.15}],d:'Ice Pokémon gain +12% / +25% / +40% crit chance. At 6, enemies are chilled (−15% Attack Speed).'},
  Fighting:{cat:'type',bp:[2,4,6],m:[{dmg:.08,as:.08},{dmg:.15,as:.15},{dmg:.25,as:.25}],d:'Fighting Pokémon gain +8% / +15% / +25% damage and Attack Speed.'},
  Poison:{cat:'type',bp:[2,4,6],m:[{ab:.15,poisonHit:.01},{ab:.3,poisonHit:.015},{ab:.5,poisonHit:.025}],d:'Poison Pokémon\'s moves deal +15% / +30% / +50% damage and their attacks poison (1% / 1.5% / 2.5% max HP per second).'},
  Ground:{cat:'type',bp:[2,4,6],m:[{def:15},{def:35},{def:60}],d:'Ground Pokémon gain +15 / +35 / +60 Defense.'},
  Flying:{cat:'type',bp:[2,4,6],m:[{dodge:.1},{dodge:.2},{dodge:.3}],d:'Flying Pokémon dodge 10% / 20% / 30% of attacks.'},
  Psychic:{cat:'type',bp:[2,4,6],m:[{ab:.2,mana:10},{ab:.4,mana:20},{ab:.65,mana:30}],d:'Psychic Pokémon\'s moves deal +20% / +40% / +65% damage, and they start with +10 / +20 / +30 PP.'},
  Bug:{cat:'type',bp:[2,4,6],m:[{as:.15},{as:.3},{as:.5}],d:'Bug Pokémon gain +15% / +30% / +50% Attack Speed.'},
  Rock:{cat:'type',bp:[2,4,6],m:[{shieldP:.15},{shieldP:.3},{shieldP:.5}],d:'Rock Pokémon start battle with a shield of 15% / 30% / 50% max HP.'},
  Ghost:{cat:'type',bp:[2,4,6],m:[{ls:.12},{ls:.25},{ls:.4}],d:'Ghost Pokémon heal for 12% / 25% / 40% of damage dealt.'},
  Dragon:{cat:'type',bp:[2,4,6],m:[{hpP:.1,dmg:.1},{hpP:.2,dmg:.2},{hpP:.35,dmg:.35}],d:'Dragon Pokémon gain +10% / +20% / +35% max HP and damage.'},
  Dark:{cat:'type',bp:[2,4,6],m:[{crit:.15,dmg:.05},{crit:.3,dmg:.1},{crit:.45,dmg:.2}],d:'Dark Pokémon gain +15% / +30% / +45% crit chance and +5% / +10% / +20% damage.'},
  Steel:{cat:'type',bp:[2,4,6],m:[{dr:.08},{dr:.16},{dr:.28}],d:'Steel Pokémon take 8% / 16% / 28% less damage.'},
  Fairy:{cat:'type',bp:[2,4,6],m:[{regen:.01,res:12,mana:10},{regen:.02,res:25,mana:20},{regen:.03,res:40,mana:30}],d:'Fairy Pokémon gain HP regen (1% / 2% / 3%), Sp. Def (+12 / +25 / +40) and starting PP (+10 / +20 / +30).'},

  /* Classes (what the Pokémon's kit is built to do) */
  Vanguard:{cat:'class',bp:[2,4,6],m:[{shieldP:.15,def:10,res:10},{shieldP:.3,def:20,res:20},{shieldP:.5,def:35,res:35}],d:'Vanguards start with a shield of 15% / 30% / 50% max HP and +10 / +20 / +35 Defense and Sp. Def.',icon:'🛡'},
  Juggernaut:{cat:'class',bp:[2,4,6],m:[{hpP:.2,dr:.05},{hpP:.4,dr:.1},{hpP:.7,dr:.15}],d:'Juggernauts gain +20% / +40% / +70% max HP and take 5% / 10% / 15% less damage.'},
  Bruiser:{cat:'class',bp:[2,4,6],m:[{hpP:.15},{hpP:.3},{hpP:.5}],t:[{hpF:60},{hpF:120},{hpF:220}],d:'Your team gains +60 / +120 / +220 max HP. Bruisers gain +15% / +30% / +50% more.'},
  Striker:{cat:'class',bp:[2,4,6],m:[{as:.15,crit:.1},{as:.3,crit:.2},{as:.5,crit:.3}],d:'Strikers gain +15% / +30% / +50% Attack Speed and +10% / +20% / +30% crit chance.'},
  Mystic:{cat:'class',bp:[2,4,6],m:[{spaP:.15},{spaP:.3},{spaP:.5}],t:[{res:10},{res:20},{res:35}],d:'Your team gains +10 / +20 / +35 Sp. Def. Mystics gain +15% / +30% / +50% Sp. Atk.'},
  Artillery:{cat:'class',bp:[2,4,6],m:[{ab:.2,splash:.15},{ab:.4,splash:.3},{ab:.7,splash:.5}],d:'Artillery moves deal +20% / +40% / +70% damage and splash 15% / 30% / 50% harder.'},
  Combo:{cat:'class',bp:[2,4,6],m:[{hitsB:1,as:.1},{hitsB:2,as:.2},{hitsB:3,as:.3}],d:'Combo Pokémon\'s multi-hit moves strike +1 / +2 / +3 extra times, and they gain +10% / +20% / +30% Attack Speed.'},
  Trickster:{cat:'class',bp:[2,4,6],m:[{ailP:.2,dodge:.08},{ailP:.4,dodge:.15},{ailP:.65,dodge:.25}],d:'Tricksters\' moves are 20% / 40% / 65% more likely to inflict status, and they dodge 8% / 15% / 25% of attacks.'},
  Medic:{cat:'class',bp:[2,4,6],m:[{healAmp:.25},{healAmp:.5},{healAmp:.9}],t:[{regen:.005},{regen:.01},{regen:.015}],d:'Your team restores 0.5% / 1% / 1.5% max HP per second. Medics heal 25% / 50% / 90% more.'},

  /* Styles (how the Pokémon plays, from its real abilities and lineage) */
  Sun:{cat:'style',bp:[2,4],m:[{as:.15},{as:.3}],x:[{weather:'sun'},{weather:'sun',wPow:2}],d:'Summons harsh sunlight: Fire moves +20% (+35% at 4), Water moves −15%. Sun Pokémon gain +15% / +30% Attack Speed.'},
  Rain:{cat:'style',bp:[2,4],m:[{as:.15,regen:.01},{as:.3,regen:.02}],x:[{weather:'rain'},{weather:'rain',wPow:2}],d:'Summons rain: Water moves +20% (+35% at 4), Fire moves −15%. Rain Pokémon gain Attack Speed and HP regen.'},
  Sandstorm:{cat:'style',bp:[2,4],m:[{def:15,res:15},{def:30,res:30}],x:[{weather:'sand'},{weather:'sand',wPow:2}],d:'Summons a sandstorm that chips enemies for 1% (2% at 4) max HP per second unless they\'re Rock, Ground or Steel. Sandstorm Pokémon gain +15 / +30 Defense and Sp. Def.'},
  Snow:{cat:'style',bp:[2,4],m:[{dodge:.1},{dodge:.2}],x:[{weather:'snow'},{weather:'snow',wPow:2}],d:'Summons snow: Ice Pokémon gain +20 (+40 at 4) Defense and enemies lose 10% (20%) Attack Speed. Snow Pokémon dodge 10% / 20% of attacks.'},
  Intimidator:{cat:'style',bp:[2,4],m:[{},{}],x:[{intim:.12},{intim:.25}],d:'Enemies start battle with −12% / −25% Attack and Sp. Atk.'},
  'Last Stand':{cat:'style',bp:[2,4],m:[{lowDmg:.3,lowLs:.12},{lowDmg:.6,lowLs:.25}],d:'Below half HP, Last Stand Pokémon deal +30% / +60% damage and heal for 12% / 25% of it.'},
  Momentum:{cat:'style',bp:[2,4],m:[{momentum:.06},{momentum:.12}],d:'Each takedown by your team gives Momentum Pokémon +6% / +12% damage and Attack Speed for the rest of battle.'},
  Ironclad:{cat:'style',bp:[2,4],m:[{dr:.12},{dr:.25}],d:'Ironclad Pokémon take 12% / 25% less damage.'},
  Toxic:{cat:'style',bp:[2,4],m:[{poisonHit:.02},{poisonHit:.035}],t:[{},{poisonHit:.01}],d:'Toxic Pokémon\'s attacks poison for 2% / 3.5% max HP per second. At 4, your whole team\'s attacks also poison.'},
  Powerhouse:{cat:'style',bp:[2,4],m:[{atkP:.15,spaP:.15},{atkP:.35,spaP:.35}],d:'Powerhouse Pokémon gain +15% / +35% Attack and Sp. Atk.'},
  Sharpshooter:{cat:'style',bp:[2,4],m:[{crit:.2,critD:.2},{crit:.4,critD:.4}],d:'Sharpshooters gain +20% / +40% crit chance and +20% / +40% crit damage.'},
  Regrowth:{cat:'style',bp:[2,4],m:[{regen:.02},{regen:.04}],t:[{regen:.005},{regen:.01}],d:'Regrowth Pokémon restore 2% / 4% max HP per second, and your team restores 0.5% / 1%.'},
  Phantom:{cat:'style',bp:[2,4],m:[{dodge:.15},{dodge:.3}],t:[{dodge:.05},{dodge:.1}],d:'Phantoms dodge 15% / 30% of attacks; the rest of your team dodges 5% / 10%.'},
  Charged:{cat:'style',bp:[2,4],m:[{zap:45,as:.1},{zap:100,as:.2}],d:'Every 3rd attack from a Charged Pokémon zaps up to 3 enemies for 45 / 100 special damage. +10% / +20% Attack Speed.'},
  Partner:{cat:'style',bp:[2,3],m:[{hpP:.15,dmg:.15},{hpP:.3,dmg:.3}],d:'Starter Pokémon (plus Pikachu and Eevee) gain +15% / +30% max HP and damage.'},
  Fossil:{cat:'style',bp:[2,3],m:[{revive:.3},{revive:.6}],d:'The first time a Fossil Pokémon faints, it is revived with 30% / 60% HP.'},
  Pseudo:{cat:'style',bp:[2,3],m:[{hpP:.15,dmg:.15,as:.1},{hpP:.3,dmg:.3,as:.2}],d:'Pseudo-legendary lines gain +15% / +30% max HP and damage and +10% / +20% Attack Speed.'},

  /* Regions (National Dex only) */
  Kanto:{cat:'region',bp:[2,4],m:[{hpP:.15},{hpP:.3}],d:'Kanto Pokémon gain +15% / +30% max HP.'},
  Johto:{cat:'region',bp:[2,4],m:[{as:.15},{as:.3}],d:'Johto Pokémon gain +15% / +30% Attack Speed.'},
  Hoenn:{cat:'region',bp:[2,4],m:[{shieldP:.15},{shieldP:.3}],d:'Hoenn Pokémon start with a shield of 15% / 30% max HP.'},
  Sinnoh:{cat:'region',bp:[2,4],m:[{def:15,res:15},{def:35,res:35}],d:'Sinnoh Pokémon gain +15 / +35 Defense and Sp. Def.'},
  Unova:{cat:'region',bp:[2,4],m:[{dmg:.12},{dmg:.25}],d:'Unova Pokémon deal +12% / +25% damage.'},
  Kalos:{cat:'region',bp:[2,4],m:[{mana:20},{mana:40}],d:'Kalos Pokémon start battle with +20 / +40 PP.'},
  Alola:{cat:'region',bp:[2,4],m:[{regen:.015},{regen:.03}],d:'Alola Pokémon restore 1.5% / 3% max HP per second.'},
  Galar:{cat:'region',bp:[2,4],m:[{hpP:.1,dmg:.08},{hpP:.2,dmg:.15}],d:'Galar Pokémon gain +10% / +20% max HP and +8% / +15% damage.'},
  Paldea:{cat:'region',bp:[2,4],m:[{crit:.15},{crit:.3}],d:'Paldea Pokémon gain +15% / +30% crit chance.'},
};
const SETCAT_LABEL={type:'Type',class:'Class',style:'Style',region:'Region'};
const CLASSCOL={Vanguard:'#5b7fa8',Juggernaut:'#7a6a55',Bruiser:'#b5532f',Striker:'#c9961d',Mystic:'#7a5ad0',Artillery:'#c0444f',Combo:'#2f8f86',Trickster:'#8a3f9a',Medic:'#4d9a3a'};
const STYLECOL='#24303d';

/* Styles that come from real abilities (any of the species' abilities) */
const STYLE_ABIL={
  Sun:['drought','chlorophyll','solar-power','flower-gift','leaf-guard','harvest','protosynthesis','orichalcum-pulse','desolate-land'],
  Rain:['drizzle','swift-swim','rain-dish','hydration','dry-skin','primordial-sea'],
  Sandstorm:['sand-stream','sand-rush','sand-force','sand-veil','sand-spit'],
  Snow:['snow-warning','slush-rush','ice-body','snow-cloak','ice-scales'],
  Intimidator:['intimidate','pressure','unnerve','as-one-glastrier','as-one-spectrier'],
  'Last Stand':['overgrow','blaze','torrent','swarm','guts','defiant','competitive','anger-point','berserk','marvel-scale','unburden','justified'],
  Momentum:['moxie','beast-boost','speed-boost','soul-heart','chilling-neigh','grim-neigh','supreme-overlord','quick-feet','steam-engine'],
  Ironclad:['sturdy','rock-head','solid-rock','filter','multiscale','battle-armor','shell-armor','clear-body','full-metal-body','heavy-metal','prism-armor','shadow-shield','fur-coat','fluffy','stamina','weak-armor'],
  Toxic:['poison-point','poison-touch','stench','corrosion','merciless','effect-spore','liquid-ooze','toxic-debris','poison-puppeteer'],
  Powerhouse:['huge-power','pure-power','hustle','sheer-force','tough-claws','iron-fist','strong-jaw','technician','adaptability','reckless','sharpness','mega-launcher','gorilla-tactics','skill-link'],
  Sharpshooter:['keen-eye','sniper','super-luck','compound-eyes','tinted-lens','no-guard'],
  Regrowth:['regenerator','natural-cure','shed-skin','healer','poison-heal','cheek-pouch','gluttony'],
  Phantom:['levitate','cursed-body','infiltrator','frisk','telepathy','anticipation','illusion','disguise','prankster'],
  Charged:['static','lightning-rod','volt-absorb','motor-drive','plus','minus','electric-surge','galvanize','transistor'],
};
const STYLE_ORDER=['Partner','Fossil','Pseudo','Sun','Rain','Sandstorm','Snow','Intimidator','Charged','Toxic','Momentum','Powerhouse','Sharpshooter','Regrowth','Phantom','Ironclad','Last Stand'];
const PARTNER_IDS=[1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912,25,172,133];
const FOSSIL_IDS=[138,140,142,345,347,408,410,564,566,696,698,880,881,882,883];
const PSEUDO_IDS=[147,246,371,374,443,633,704,782,885,996];

/* ---------- Ability passives (real Pokémon abilities) ----------
   Each Pokémon uses the first of its abilities that has an entry here. */
const A=(d,e)=>({d,e});
const ABILITIES={
  overgrow:A('Below 1/3 HP, deals +50% damage.',{pinch:.5}),blaze:A('Below 1/3 HP, deals +50% damage.',{pinch:.5}),torrent:A('Below 1/3 HP, deals +50% damage.',{pinch:.5}),swarm:A('Below 1/3 HP, deals +50% damage.',{pinch:.5}),
  intimidate:A('At battle start, nearby enemies lose 15% Attack.',{intim:.15}),
  pressure:A('Nearby enemies gain 30% less PP.',{pressure:.3}),unnerve:A('Nearby enemies gain 20% less PP.',{pressure:.2}),
  static:A('Melee attackers have a 30% chance to be paralyzed.',{touch:{ail:1,c:.3}}),
  'flame-body':A('Melee attackers have a 30% chance to be burned.',{touch:{ail:4,c:.3}}),
  'poison-point':A('Melee attackers have a 30% chance to be poisoned.',{touch:{ail:5,c:.3}}),
  'effect-spore':A('Melee attackers have a 30% chance to be poisoned, paralyzed or put to sleep.',{touch:{ail:-1,c:.3}}),
  'cute-charm':A('Melee attackers have a 30% chance to become infatuated (stunned 0.6s).',{touch:{ail:7,c:.3}}),
  'cursed-body':A('Attackers have a 20% chance to be stunned for 0.6s.',{touch:{ail:7,c:.2,any:1}}),
  'rough-skin':A('Melee attackers take 4% of this Pokémon\'s max HP.',{helmet:.04}),'iron-barbs':A('Melee attackers take 4% of this Pokémon\'s max HP.',{helmet:.04}),
  gooey:A('Melee attackers are slowed (−20% Attack Speed for 3s).',{touch:{slow:.2,c:1}}),'tangling-hair':A('Melee attackers are slowed (−20% Attack Speed for 3s).',{touch:{slow:.2,c:1}}),'cotton-down':A('Attackers are slowed (−15% Attack Speed for 3s).',{touch:{slow:.15,c:1,any:1}}),
  levitate:A('Immune to Ground moves. Dodges 10% of attacks.',{immune:['Ground'],dodge:.1}),
  'sand-veil':A('Dodges 12% of attacks (25% in a sandstorm).',{dodge:.12,wDodge:{sand:.13}}),'snow-cloak':A('Dodges 12% of attacks (25% in snow).',{dodge:.12,wDodge:{snow:.13}}),
  sturdy:A('Survives the first fainting blow each battle with 1 HP.',{focus:1}),
  multiscale:A('Takes 40% less damage while at full HP.',{multiscale:.4}),'shadow-shield':A('Takes 40% less damage while at full HP.',{multiscale:.4}),'tera-shell':A('Takes 40% less damage while at full HP.',{multiscale:.4}),
  'thick-fat':A('Takes 20% less special damage.',{assault:.2}),heatproof:A('Takes 20% less special damage.',{assault:.2}),'ice-scales':A('Takes 30% less special damage.',{assault:.3}),fluffy:A('Takes 25% less damage from melee attacks.',{meleeDr:.25}),'fur-coat':A('Takes 30% less physical damage.',{physDr:.3}),
  filter:A('Takes 20% less damage from moves.',{cloak:.2}),'solid-rock':A('Takes 20% less damage from moves.',{cloak:.2}),'prism-armor':A('Takes 20% less damage from moves.',{cloak:.2}),
  'battle-armor':A('Can\'t be critically hit. +10 Defense.',{noCrit:1,def:10}),'shell-armor':A('Can\'t be critically hit. +10 Defense.',{noCrit:1,def:10}),
  guts:A('Below half HP, gains +35% Attack.',{lowAtk:.35}),'marvel-scale':A('Below half HP, gains +35 Defense.',{lowDef:35}),'toxic-boost':A('Below half HP, gains +35% Attack.',{lowAtk:.35}),'flare-boost':A('Below half HP, gains +35% Sp. Atk.',{lowSpa:.35}),
  unburden:A('Below half HP, gains +40% Attack Speed.',{lowAS:.4}),
  'huge-power':A('+50% Attack.',{atkP:.5}),'pure-power':A('+50% Attack.',{atkP:.5}),'gorilla-tactics':A('+30% Attack.',{atkP:.3}),
  hustle:A('+30% Attack, but 10% of attacks miss.',{atkP:.3,miss:.1}),
  adaptability:A('Moves deal +25% damage.',{ab:.25}),'sheer-force':A('Moves deal +25% damage but never inflict status.',{ab:.25,noAil:1}),
  'tough-claws':A('Physical moves deal +20% damage.',{physAb:.2}),'iron-fist':A('Physical moves deal +20% damage.',{physAb:.2}),'strong-jaw':A('Physical moves deal +25% damage.',{physAb:.25}),sharpness:A('Physical moves deal +25% damage.',{physAb:.25}),reckless:A('Physical moves deal +20% damage.',{physAb:.2}),
  'mega-launcher':A('Special moves deal +25% damage.',{specAb:.25}),'punk-rock':A('Special moves deal +20% damage; takes 20% less special damage.',{specAb:.2,assault:.2}),
  technician:A('Moves with 60 power or less deal +50% damage.',{technician:.5}),'skill-link':A('Multi-hit moves always strike the maximum number of times.',{skillLink:1}),
  'speed-boost':A('Gains +6% Attack Speed every 2 seconds.',{speedBoost:.06}),'steam-engine':A('Gains +6% Attack Speed every 2 seconds.',{speedBoost:.06}),'quick-feet':A('Gains +5% Attack Speed every 2 seconds.',{speedBoost:.05}),
  moxie:A('Each takedown grants +12% Attack.',{moxie:.12}),'beast-boost':A('Each takedown grants +12% Attack and Sp. Atk.',{moxie:.12}),'chilling-neigh':A('Each takedown grants +12% Attack.',{moxie:.12}),'grim-neigh':A('Each takedown grants +12% Sp. Atk.',{moxie:.12}),'soul-heart':A('Each takedown on the field grants +10% Sp. Atk.',{moxie:.1}),'supreme-overlord':A('Each takedown grants +12% Attack.',{moxie:.12}),
  defiant:A('When hit by a move, gains +10% Attack (stacks).',{enrage:.1}),competitive:A('When hit by a move, gains +10% Sp. Atk (stacks).',{enrage:.1}),justified:A('When hit by a move, gains +10% Attack (stacks).',{enrage:.1}),'anger-point':A('When critically hit, gains +40% Attack.',{angerPoint:.4}),stamina:A('When hit, gains +3 Defense (stacks).',{stamina:3}),rattled:A('When hit by a move, gains +8% Attack Speed (stacks).',{rattled:.08}),berserk:A('Below half HP, gains +30% Sp. Atk.',{lowSpa:.3}),
  'weak-armor':A('When hit by a physical move, loses 5 Defense but gains +12% Attack Speed.',{weakArmor:1}),
  regenerator:A('Restores 2% max HP per second.',{regen:.02}),'natural-cure':A('Immune to status. Restores 1% max HP per second.',{aImm:1,regen:.01}),'shed-skin':A('Immune to status. Restores 1% max HP per second.',{aImm:1,regen:.01}),'poison-heal':A('Restores 3% max HP per second.',{regen:.03}),'rain-dish':A('Restores 1% max HP per second (3% in rain).',{regen:.01,wRegen:{rain:.02}}),'ice-body':A('Restores 1% max HP per second (3% in snow).',{regen:.01,wRegen:{snow:.02}}),'dry-skin':A('Immune to Water moves. Restores 2% max HP per second in rain.',{immune:['Water'],wRegen:{rain:.02}}),hydration:A('Immune to status in rain. +1% HP regen.',{regen:.01}),
  'own-tempo':A('Immune to status and flinching.',{aImm:1,fImm:1}),oblivious:A('Immune to status.',{aImm:1}),'inner-focus':A('Immune to flinching and Intimidate. +10 Sp. Def.',{fImm:1,clear:1,res:10}),insomnia:A('Immune to status.',{aImm:1}),'vital-spirit':A('Immune to status.',{aImm:1}),limber:A('Immune to status.',{aImm:1}),immunity:A('Immune to status.',{aImm:1}),'water-veil':A('Immune to status.',{aImm:1}),'magma-armor':A('Immune to status.',{aImm:1}),'leaf-guard':A('Immune to status.',{aImm:1}),'sweet-veil':A('Immune to status.',{aImm:1}),'pastel-veil':A('Immune to status.',{aImm:1}),'purifying-salt':A('Immune to status. Takes 20% less special damage.',{aImm:1,assault:.2}),'good-as-gold':A('Immune to status and debuffs. Takes 15% less damage from moves.',{aImm:1,clear:1,cloak:.15}),comatose:A('Immune to status.',{aImm:1}),
  steadfast:A('Immune to flinching. Gains +10% Attack Speed when hit by a move.',{fImm:1,rattled:.1}),
  'clear-body':A('Immune to debuffs. +10 Defense.',{clear:1,def:10}),'white-smoke':A('Immune to debuffs. +10 Defense.',{clear:1,def:10}),'full-metal-body':A('Immune to debuffs. +15 Defense.',{clear:1,def:15}),'hyper-cutter':A('Immune to debuffs.',{clear:1}),'big-pecks':A('Immune to debuffs.',{clear:1}),'mirror-armor':A('Immune to debuffs. +10 Sp. Def.',{clear:1,res:10}),
  'keen-eye':A('+15% crit chance.',{crit:.15}),'compound-eyes':A('+15% crit chance.',{crit:.15}),'super-luck':A('+20% crit chance.',{crit:.2}),sniper:A('+10% crit chance. Critical hits deal 2x.',{crit:.1,critD:.5}),
  'serene-grace':A('Move side effects are twice as likely.',{serene:1}),
  'tinted-lens':A('Damage ignores 25% of the target\'s defenses.',{pen:.25}),'mold-breaker':A('Damage ignores 25% of the target\'s defenses.',{pen:.25}),teravolt:A('Damage ignores 25% of the target\'s defenses.',{pen:.25}),turboblaze:A('Damage ignores 25% of the target\'s defenses.',{pen:.25}),infiltrator:A('Damage ignores shields and 15% of defenses.',{pen:.15,ignoreShield:1}),scrappy:A('Damage ignores 20% of the target\'s defenses.',{pen:.2}),unaware:A('Ignores enemy buffs. +15 Defense and Sp. Def.',{def:15,res:15}),
  analytic:A('Deals +25% damage to targets below half HP.',{execute:.25}),
  'no-guard':A('Attacks can\'t be dodged. +10% damage.',{noGuard:1,dmg:.1}),
  'magic-guard':A('Immune to burn, poison, recoil and contact damage.',{mGuard:1}),'rock-head':A('Takes no recoil damage. +10 Defense.',{noRecoil:1,def:10}),
  prankster:A('Starts battle with +35 PP.',{mana:35}),'early-bird':A('Starts battle with +25 PP.',{mana:25}),
  aftermath:A('When it faints, its attacker takes 15% of its own max HP.',{aftermath:.15}),
  disguise:A('The first hit it takes deals no damage.',{disguise:1}),
  'water-absorb':A('Immune to Water moves; healed by them.',{immune:['Water'],absorb:1}),'storm-drain':A('Immune to Water moves; healed by them.',{immune:['Water'],absorb:1}),'volt-absorb':A('Immune to Electric moves; healed by them.',{immune:['Electric'],absorb:1}),'lightning-rod':A('Immune to Electric moves; they raise its Sp. Atk.',{immune:['Electric'],absorbBuff:1}),'motor-drive':A('Immune to Electric moves; they raise its Attack Speed.',{immune:['Electric'],absorbBuff:1}),'flash-fire':A('Immune to Fire moves; they power up its own Fire moves.',{immune:['Fire'],absorbBuff:1}),'well-baked-body':A('Immune to Fire moves.',{immune:['Fire'],def:10}),'sap-sipper':A('Immune to Grass moves; they raise its Attack.',{immune:['Grass'],absorbBuff:1}),'earth-eater':A('Immune to Ground moves; healed by them.',{immune:['Ground'],absorb:1}),
  gluttony:A('Once per battle, heals 25% max HP when dropping below half.',{sitrus:.25}),'cheek-pouch':A('Once per battle, heals 30% max HP when dropping below half.',{sitrus:.3}),harvest:A('Twice per battle, heals 20% max HP when dropping below half.',{sitrus:.2,sitrusN:2}),ripen:A('Once per battle, heals 35% max HP when dropping below half.',{sitrus:.35}),
  pickup:A('25% chance to find ₽1 after each battle.',{pickup:.25}),'honey-gather':A('25% chance to find ₽1 after each battle.',{pickup:.25}),pickpocket:A('25% chance to find ₽1 after each battle.',{pickup:.25}),
  healer:A('Adjacent allies restore 1% max HP per second.',{aura:{regen:.01}}),'friend-guard':A('Adjacent allies take 10% less damage.',{aura:{dr:.1}}),battery:A('Adjacent allies deal +12% move damage.',{aura:{ab:.12}}),'power-spot':A('Adjacent allies deal +12% move damage.',{aura:{ab:.12}}),'flower-veil':A('Adjacent allies are immune to status.',{aura:{aImm:1}}),plus:A('Adjacent allies gain +10% Attack Speed.',{aura:{as:.1}}),minus:A('Adjacent allies gain +10% Attack Speed.',{aura:{as:.1}}),
  drought:A('Summons harsh sunlight at battle start.',{weather:'sun'}),drizzle:A('Summons rain at battle start.',{weather:'rain'}),'sand-stream':A('Summons a sandstorm at battle start.',{weather:'sand'}),'snow-warning':A('Summons snow at battle start.',{weather:'snow'}),'orichalcum-pulse':A('Summons harsh sunlight. +20% Attack in sun.',{weather:'sun',wAtk:{sun:.2}}),'primordial-sea':A('Summons heavy rain.',{weather:'rain'}),'desolate-land':A('Summons extreme sunlight.',{weather:'sun'}),
  chlorophyll:A('+15% Attack Speed (+50% in sun).',{as:.15,wAS:{sun:.35}}),'swift-swim':A('+15% Attack Speed (+50% in rain).',{as:.15,wAS:{rain:.35}}),'sand-rush':A('+15% Attack Speed (+50% in a sandstorm).',{as:.15,wAS:{sand:.35}}),'slush-rush':A('+15% Attack Speed (+50% in snow).',{as:.15,wAS:{snow:.35}}),
  'solar-power':A('+15% Sp. Atk (+45% in sun).',{spaP:.15,wSpa:{sun:.3}}),'sand-force':A('+10% damage (+30% in a sandstorm).',{dmg:.1,wDmg:{sand:.2}}),protosynthesis:A('For the first 8 seconds: +30% damage (all battle in sun).',{boostStart:.3,wBoost:'sun'}),'quark-drive':A('For the first 8 seconds: +30% damage.',{boostStart:.3}),
  'cloud-nine':A('Cancels weather. +10 Sp. Def.',{noWeather:1,res:10}),'air-lock':A('Cancels weather. +10 Sp. Def.',{noWeather:1,res:10}),
  stench:A('Attacks have a 10% chance to make the target flinch.',{flinch:.1}),
  'poison-touch':A('Attacks have a 25% chance to poison.',{hitAil:{ail:5,c:.25}}),corrosion:A('Attacks have a 20% chance to badly poison.',{hitAil:{ail:5,c:.2}}),merciless:A('Always crits poisoned targets.',{merciless:1}),'toxic-debris':A('When hit by a physical move, poisons the attacker.',{touch:{ail:5,c:.5}}),'poison-puppeteer':A('Its poison also confuses (stuns 0.4s).',{hitAil:{ail:5,c:.2}}),
  'liquid-ooze':A('Drain moves used against it hurt the attacker instead. +10 Sp. Def.',{res:10}),
  'run-away':A('Dodges 8% of attacks.',{dodge:.08}),telepathy:A('Dodges 8% of attacks.',{dodge:.08}),anticipation:A('Dodges 10% of attacks.',{dodge:.1}),frisk:A('Dodges 6% of attacks and has +10% crit chance.',{dodge:.06,crit:.1}),'tangled-feet':A('Dodges 10% of attacks.',{dodge:.1}),illusion:A('Dodges the first 2 attacks it takes.',{dodgeN:2}),
  synchronize:A('When inflicted with status, the attacker suffers it too. +10 Sp. Def.',{res:10}),trace:A('+10% damage.',{dmg:.1}),download:A('+15% Attack and Sp. Atk.',{atkP:.15,spaP:.15}),protean:A('+15% move damage.',{ab:.15}),libero:A('+15% move damage.',{ab:.15}),rivalry:A('+12% damage.',{dmg:.12}),klutz:A('+10% Attack.',{atkP:.1}),moody:A('+10% damage and Attack Speed.',{dmg:.1,as:.1}),contrary:A('+12 Defense and Sp. Def.',{def:12,res:12}),
  'shield-dust':A('Immune to status.',{aImm:1}),overcoat:A('Immune to weather and status from melee attackers.',{noWeatherChip:1,res:8}),bulletproof:A('Takes 20% less special damage.',{assault:.2}),soundproof:A('Takes 15% less damage from moves.',{cloak:.15}),damp:A('+10 Defense and Sp. Def.',{def:10,res:10}),
  'heavy-metal':A('+20 Defense.',{def:20}),'light-metal':A('+15% Attack Speed.',{as:.15}),galvanize:A('Moves deal +20% damage.',{ab:.2}),transistor:A('Electric moves deal +25% damage.',{typeBoost:{Electric:.25}}),'dragons-maw':A('Dragon moves deal +25% damage.',{typeBoost:{Dragon:.25}}),steelworker:A('Steel moves deal +25% damage.',{typeBoost:{Steel:.25}}),'rocky-payload':A('Rock moves deal +25% damage.',{typeBoost:{Rock:.25}}),'water-bubble':A('Water moves deal +30% damage; immune to burn.',{typeBoost:{Water:.3},aImm:1}),
  'electric-surge':A('Electric moves deal +20% damage for allies.',{typeBoost:{Electric:.2}}),'psychic-surge':A('Psychic moves deal +20% damage.',{typeBoost:{Psychic:.2}}),'grassy-surge':A('Restores 1.5% max HP per second.',{regen:.015}),'misty-surge':A('Immune to status. +10 Sp. Def.',{aImm:1,res:10}),
  'as-one-glastrier':A('At battle start, nearby enemies lose 15% Attack. Takedowns grant +12% Attack.',{intim:.15,moxie:.12}),'as-one-spectrier':A('Nearby enemies gain 20% less PP. Takedowns grant +12% Sp. Atk.',{pressure:.2,moxie:.12}),
  truant:A('Enormous power (+60% Attack and Sp. Atk) but attacks 35% slower.',{atkP:.6,spaP:.6,as:-.35}),
  'slow-start':A('+40% Attack, but deals 30% less damage for the first 8 seconds.',{atkP:.4,boostStart:-.3}),
  'bad-dreams':A('Nearby enemies gain 20% less PP. +10% damage.',{pressure:.2,dmg:.1}),
  'victory-star':A('+10% damage and crit chance.',{dmg:.1,crit:.1}),
  'fairy-aura':A('Fairy moves deal +30% damage.',{typeBoost:{Fairy:.3}}),'dark-aura':A('Dark moves deal +30% damage.',{typeBoost:{Dark:.3}}),
  'stance-change':A('+25 Defense and Sp. Def, and moves deal +15% damage.',{def:25,res:25,ab:.15}),
  'zen-mode':A('Below half HP, gains +35% Sp. Atk.',{lowSpa:.35}),
  forecast:A('+10 Defense and Sp. Def; benefits from any weather.',{def:10,res:10,wAS:{sun:.2,rain:.2,snow:.2,sand:.2}}),
  multitype:A('+15% to all stats.',{hpP:.15,dmg:.15,def:15,res:15}),'rks-system':A('+15% to all stats.',{hpP:.15,dmg:.15,def:15,res:15}),
  'wonder-skin':A('Takes 15% less damage from moves.',{cloak:.15}),mummy:A('Melee attackers are slowed (−15% Attack Speed for 3s).',{touch:{slow:.15,c:1}}),
  'ball-fetch':A('25% chance to find ₽1 after each battle.',{pickup:.25}),'zero-to-hero':A('+25% damage after the first 6 seconds.',{boostStart:-.25,dmg:.25}),
  'commander':A('+15% damage and Defense.',{dmg:.15,def:15}),'costar':A('+10% damage.',{dmg:.1}),'opportunist':A('Each takedown grants +10% Attack.',{moxie:.1}),'seed-sower':A('When hit, adjacent allies restore HP.',{aura:{regen:.01}}),
  'huge-power-alt':A('',{}),
  'wonder-guard':A('Takes 60% less damage from moves.',{cloak:.6}),'huge-power-alt':A('',{}),
};

/* ---------- Kit tuning ---------- */
// Base move power at 80 power, 1★, multiplied by (power/80) (clamped) × star × cost factor.
const KIT={
  castBase:95, castRatio:1.5,     // single-target damage moves
  healBase:110, healRatio:1.3,
  guardBase:120,
  rapidEvery:3, rapidPow:.7,      // Strikers fire their move as a free follow-up every Nth attack
  tankHp:.35,                     // Juggernauts have no move but +35% HP
};
const AIL={1:{n:'paralysis',stun:.6,slow:.25,t:3},2:{n:'sleep',stun:1.4},3:{n:'freeze',stun:1},4:{n:'burn',dot:.02,t:4},5:{n:'poison',dot:.015,t:6},6:{n:'confusion',stun:.5},7:{n:'infatuation',stun:.6}};
const STATKEY={2:'atk',3:'def',4:'spa',5:'res',6:'as'};
