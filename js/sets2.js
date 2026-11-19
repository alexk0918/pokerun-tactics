"use strict";
/* PokéRun Tactics — trait and kinship sets, second generation.
   Every trait holds 10-25 lines across frontline, damage and support at several costs (js/homes.js).
   Each set has a playstyle of its own; many open a feature (a menu or something on the board) once a breakpoint is hit.
   Capstones (the top breakpoint) are gated:
     badge — needs a Guild Badge for that set on the field (rare: guardian rewards, Guild Hall, Guild Membership, a Guild expedition)
     pool  — needs that many DIFFERENT real members; badges and augments can't fill it. */

for(const k in NEWKIN)KIN[k]=[...new Set([...(KIN[k]||[]),...NEWKIN[k]])];
const CAPS={};
function defSet(k,S,cap){SETS[k]=Object.assign({cat:'style'},S);if(cap)CAPS[k]=cap;if(!ORIGIN_ORDER.includes(k)&&!S.kin)ORIGIN_ORDER.push(k);}
const capOf=k=>SETS[k]&&SETS[k].bp[SETS[k].bp.length-1];

/* ================= Trait sets ================= */
defSet('Team Rocket',{trait:1,bp:[2,4,6,7],feat:'rocket',
  m:[{rloot:1,dmg:.1},{rloot:1.5,dmg:.15},{rloot:1.5,dmg:.2,blast:.15},{rloot:2,dmg:.25,blast:.2}],
  d:'<b>Heist:</b> Rocket knockouts earn 1 / 1.5 / 1.5 / 2 Loot, and Rocket Pokémon deal +10% / +15% / +20% / +25% damage. Spend Loot at <b>Rocket HQ</b> between rounds. At 4, a lost round still earns 3 Loot, and HQ stocks item components. At 6, a Rocket Pokémon that faints blasts off (15% of its max HP to adjacent enemies), and HQ can <b>Steal</b> a copy of a Pokémon from your last opponent. At 7 (needs a Guild Badge): <b>Giovanni\'s Gambit</b>: the Vault opens, cash in all your Loot once for a jackpot.'},'badge');
defSet('Titans',{trait:1,bp:[2,4,6,8],
  m:[{hpP:.2,size:10,titan:1},{hpP:.35,size:15,titan:1,titanDmg:.08,titanGrow:15},{hpP:.5,size:25,titan:1.2,titanDmg:.1,titanGrow:15,titanPP:10},{hpP:.6,size:25,titan:1.2,titanDmg:.1,titanGrow:15,titanPP:10,colossus:1}],
  d:'<b>Earthshaker:</b> Titans gain +20% / +35% / +50% / +60% max HP and +10% / +15% / +25% / +25% Size, and stomp when battle starts, stunning adjacent enemies. At 4, the stomp deals 8% of their max HP, and after 10 seconds every Titan grows another +15% Size. At 6, every Titan stomp drains 10 PP from all enemies. At 8 (needs a Guild Badge): <b>Colossus</b>: your biggest Titan grows +60% Size and +60% max HP, and stomps every 5 seconds, shielding your team for 4% of its max HP.'},'badge');
defSet('Leviathans',{trait:1,bp:[2,3,4,5],
  m:[{lev:1},{lev:2},{lev:2,levWave:1},{lev:2,levWave:1,levRise:1}],
  d:'<b>Water Lanes:</b> when battle starts, each Leviathan floods the lane it stands in (and the lanes beside it at 3). In the water, Leviathans grow +4% Size every 2 seconds (up to +40% a battle), gaining max HP as they grow, and restore 1% max HP per second. At 3, enemies in the water attack 15% slower. At 4, every 6 seconds each Leviathan sends a wave down its lane, hitting enemies for 6% of its max HP and pushing them back. At 5 (needs a Guild Badge): <b>Leviathan Rising</b>: your biggest Leviathan keeps growing without limit, and its waves become tsunamis that stun for 0.6 seconds.'},'badge');
defSet('Sky Squadron',{trait:1,bp:[2,4,6,7],feat:'flight',
  m:[{sky:2},{sky:3,dmg:.2},{sky:3,dmg:.25,skyRe:1},{sky:3,dmg:.3,skyRe:1,airRaid:1}],
  d:'<b>Flight Plan:</b> flyers take off when battle starts (untargetable for 1 second), then dive onto your Flight Plan target: the back line, the carry or the healer. At 4, the dive stuns for 0.8 seconds and they deal +20% damage (+25% at 6, +30% at 7). At 6, a flyer takes off and dives again whenever it lands a knockout. At 7 (needs a Guild Badge): <b>Air Raid</b>: every 6 seconds the whole squadron lifts off together and dive-bombs the target.'},'badge');
defSet('Swarm',{trait:1,bp:[2,4,5,6],
  m:[{hive:.04},{hive:.06,sting:1},{hive:.06,sting:1,order:1},{hive:.1,sting:1,order:1,queen:1}],
  d:'<b>Hive Mind:</b> Swarm Pokémon gain +4% / +6% / +6% / +10% Attack Speed for every Swarm Pokémon still standing (themselves included), updated as they fall. At 4, a Swarm Pokémon that faints leaves a <b>stinging cloud</b> on its hex for 4 seconds. At 5, <b>Attack Order</b>: every 5 seconds the swarm sends bees at the weakest enemy, each Swarm Pokémon adding a sting worth 30% of its Attack. At 6 (needs a Guild Badge): <b>Queen\'s Call</b>: your whole team gets half the Swarm\'s Attack Speed bonus, and the first Swarm Pokémon to faint each battle hatches back as a 1★ copy.'},'badge');
defSet('Creepy Crawlies',{trait:1,bp:[2,4,5,6],
  m:[{sitrus:.2},{sitrus:.3,as:.15},{sitrus:.3,as:.2,molt:1},{sitrus:.35,as:.25,molt:1,metamorph:1}],
  d:'<b>Molting:</b> the first time a Creepy Crawly drops below half HP it sheds its skin and heals 20% / 30% / 30% / 35% of its max HP. At 4, they gain +15% Attack Speed (+20% at 5, +25% at 6). At 5, shedding also cures status and hides it in a cocoon for 2 seconds. At 6 (needs a Guild Badge): <b>Metamorphosis</b>: once per battle, when a Crawly would faint it cocoons for 2 seconds, then bursts out as its next evolution at full HP (a final stage gets +50% to all stats instead).'},'badge');
defSet('Kaiju',{trait:1,bp:[2,3,4,5],
  m:[{kaiju:.07},{kaiju:.1,kaijuGiant:3},{kaiju:.14,kaijuGiant:3,kaijuRoar:1},{kaiju:.14,kaijuGiant:3,kaijuRoar:1,kaijuKing:1}],
  d:'<b>Rampage:</b> Kaiju grow with every move: +7% / +10% / +14% / +14% max HP and damage and +5% Size each cast. At 3, the third cast makes them Giant: +50% max HP and +25% Size. At 4, going Giant lets out a roar that stuns enemies within 2 hexes for 1 second. At 5 (needs a Guild Badge): <b>King of the Monsters</b>: the first Kaiju to go Giant grows another +40% Size on its 6th cast and its moves hit everything within 2 hexes, and every battle a Kaiju goes Giant, all your Kaiju gain +1% max HP for the rest of the run.'},'badge');
defSet('Phantasms',{trait:1,bp:[2,4,5,6],
  m:[{revive:.35,hideRevive:2},{revive:.6,hideRevive:2,ghostDodge:.25},{revive:.6,hideRevive:2,ghostDodge:.25,slime:1},{revive:.6,hideRevive:2,ghostDodge:.25,slime:1,ooze:1}],
  d:'<b>Shapeless:</b> the first time a Phantasm would faint it melts into a puddle, untargetable for 2 seconds, then reforms with 35% / 60% / 60% / 60% HP. At 4, reformed Phantasms dodge 25% of attacks. At 5, the puddle leaves toxic slime on its hex that poisons enemies inside. At 6 (needs a Guild Badge): <b>Ooze Tide</b>: a reforming Phantasm splits off a copy of itself with 40% of its stats.'},'badge');
defSet('Living Stone',{trait:1,bp:[2,4,5,6],
  m:[{stone:.12},{stone:.3,stoneNoCrit:1},{stone:.3,stoneNoCrit:1,shatter:1},{stone:.3,stoneNoCrit:1,shatter:1,sediment:1}],
  d:'<b>Stone Shell:</b> Living Stone start with a shell of 12% / 30% / 30% / 30% max HP that rebuilds every 4 seconds. At 4, they can\'t be critically hit while the shell holds. At 5, a broken shell shatters, hitting adjacent enemies for the shell\'s full value. At 6 (needs a Guild Badge): <b>Sediment</b>: shells grow +1% for every win this run (up to +30%) and rebuild every 2 seconds.'},'badge');
defSet('Showstoppers',{trait:1,bp:[2,4,5,6],
  m:[{show:1},{show:2},{show:3},{show:4}],
  d:'<b>Spotlight:</b> pick your Star with <b>Make Star</b> in its unit menu (otherwise your sturdiest Showstopper takes the stage). The Star gains +25% damage and Attack Speed, and each move it uses gives your team 5 PP. At 4, an Understudy (your next sturdiest Showstopper) gets half the bonus, and each Star cast adds +3% damage for the battle. At 5, if the Star faints the Understudy takes the full Spotlight. At 6 (needs a Guild Badge): <b>Standing Ovation</b>: the Star\'s move echoes at 60% power, and every win gives the Star 1 Fame (+1% damage, forever).'},'badge');
defSet('Deep Sea',{trait:1,bp:[2,4,5,6],
  m:[{deep:.25},{deep:.5,deepX:.15},{deep:.5,deepX:.15},{deep:.5,deepX:.15}],x:[{},{},{pressure:1},{pressure:1,abyss:1}],
  d:'<b>Pressure of the Deep:</b> Deep Sea Pokémon deal +25% / +50% / +50% / +50% damage to enemies below half HP. At 4, they finish off any enemy they hit below 15% HP. At 5, the pressure builds: every 5 seconds, all enemies lose 5% Defense and Sp. Def. At 6 (needs a Guild Badge): <b>The Abyss</b>: every 8 seconds the weakest enemy is dragged under and knocked out if it is below 30% HP (₽1 if it was 2★ or better).'},'badge');
defSet('Reef',{trait:1,bp:[2,3,4,5],
  m:[{reflect:.2,def:10,res:10},{reflect:.3,def:10,res:10,shellGrow:1},{reflect:.3,def:15,res:15,shellGrow:1,crab:1},{reflect:.35,def:15,res:15,shellGrow:1,crab:1,coral:1}],
  d:'<b>Shell Counter:</b> Reef Pokémon gain +10 / +10 / +15 / +15 Defense and Sp. Def and reflect 20% / 30% / 30% / 35% of basic-attack damage back at the attacker. At 3, their shells thicken: every battle a Reef Pokémon survives gives it +2 Defense and Sp. Def, forever. At 4, every 4th hit they take, they Crab Hammer the attacker for 8% of their max HP and stun it for 0.5 seconds. At 5 (needs a Guild Badge): <b>Coral Reef</b>: coral grows around every Reef Pokémon when battle starts; your Pokémon standing in it take 15% less damage and restore 1% max HP per second.'},'badge');
defSet('Riverside',{trait:1,bp:[2,3,4],
  m:[{dodge:.15},{dodge:.2,regen:.015},{dodge:.25,regen:.015}],x:[{},{},{flood:1}],
  d:'<b>Slippery:</b> Riverside Pokémon dodge 15% / 20% / 25% of basic attacks. At 3, they also restore 1.5% max HP per second. With 4 different river lines: <b>Flash Flood</b>: after 8 seconds the field floods; Riverside Pokémon gain +40% Attack Speed, and enemies move 30% slower and attack 15% slower.'},'pool');
defSet('Fae Folk',{trait:1,bp:[2,4,5,6],feat:'well',
  m:[{},{},{},{}],x:[{wish:.1},{wish:.22},{wish:.22,wishCure:1},{wish:.22,wishCure:1}],
  d:'<b>Wish:</b> every 4 seconds a random ally makes a Wish and heals 10% / 22% / 22% / 22% of its max HP 2 seconds later. Every round you win with Fae Folk active adds a Wish to the <b>Wish Well</b>. At 4, the Wish Well opens: spend Wishes on rerolls, healing, items or Pokémon. At 5, Wishes also cure status, and a win adds 2 Wishes. At 6 (needs a Guild Badge): <b>Jirachi\'s Wish</b>: once per run, spend 8 Wishes to call any Pokémon you have unlocked to your bench at 2★.'},'badge');
defSet('Mouse Brigade',{trait:1,bp:[2,4,5,6],
  m:[{mouse:.1},{mouse:.15,cheese:1},{mouse:.15,cheese:1,cheeseHeal:.1},{mouse:.18,cheese:2,cheeseHeal:.1,maus:1}],
  d:'<b>Scurry:</b> rodents gain +10% / +15% / +15% / +18% Attack Speed for every other rodent on the field. At 4, their knockouts find ₽1 of cheese (up to ₽3 a battle). At 5, a rodent that faints drops cheese that heals the nearest ally for 10% max HP. At 6 (needs a Guild Badge): <b>Maushold</b>: every rodent knockout calls in a Tandemaus to fight for the battle (up to 4), and cheese finds up to ₽5.'},'badge');
defSet('Fox Spirits',{trait:1,bp:[2,3,4],
  m:[{fox:.25},{fox:.4,zoro:1},{fox:.4,zoro:1,nine:1}],
  d:'<b>Illusion:</b> when battle starts each Fox conjures a decoy with 25% / 40% / 40% of its max HP that draws enemy attacks. At 3, Zorua and Zoroark take the look of your strongest Pokémon, so enemies go after them first. With 4 different fox lines: <b>Nine Tails</b>: each Fox conjures 3 decoys, and the decoys cast a 30% copy of the Fox\'s move.'},'pool');
defSet('Nursery',{trait:1,bp:[1,2,3,4],feat:'daycare',
  m:[{nursery:1},{nursery:1,grow:1},{nursery:1,grow:1},{nursery:1,grow:1,proud:1}],
  d:'<b>Daycare:</b> babies take half damage while an ally stands next to them. At 2, the <b>Daycare</b> opens beside your bench: a Pokémon left there doesn\'t fight, but gains +1% max HP and damage every round (up to +20%) and has a 25% chance each round to lay an Egg that hatches into a copy of its first stage; babies that survive a battle also grow a little. At 3, the Daycare has 2 spots. At 4 (needs a Guild Badge): <b>Proud Parents</b>: babies fight with +25% to all stats, and the Daycare lays an Egg every 2 rounds, guaranteed.'},'badge');
defSet('Garden',{trait:1,bp:[2,4,5,6],feat:'garden',
  m:[{bloom:.04},{bloom:.06,hpP:.15},{bloom:.09,hpP:.25},{bloom:.09,hpP:.25}],
  d:'<b>Garden Plots:</b> Garden Pokémon heal their most injured ally within 2 hexes for 4% / 6% / 9% / 9% of their max HP every 3 seconds, and you can plant 1 / 2 / 3 / 3 <b>plots</b> on your side of the board. A plot left in place grows each round: Seed, Sprout, then Bloom. Any of your Pokémon standing on a plot restores 0.5% (Seed), 1% (Sprout) or 2% (Bloom) of its max HP per second. At 4, Garden Pokémon gain +15% max HP (+25% at 5), and Pokémon on a Bloom plot deal +15% damage. At 5, Bloom plots also heal allies next to them. At 6 (needs a Guild Badge): <b>Harvest</b>: every 4 rounds each Bloom plot is harvested for ₽3 or an item component.'},'badge');
defSet('Ranch',{trait:1,bp:[2,4,5,6],
  m:[{herd:.04,herdDef:4},{herd:.07,herdDef:7},{herd:.08,herdDef:8,stampede:1},{herd:.1,herdDef:10,stampede:1,roundup:1}],
  d:'<b>Herd:</b> Ranch Pokémon gain +4% / +7% / +8% / +10% damage and +4 / +7 / +8 / +10 Defense for every other Ranch Pokémon on the field. At 5, <b>Stampede</b>: when battle starts they charge 2 hexes forward, knocking back and damaging what they hit. At 6 (needs a Guild Badge): <b>Roundup</b>: the stampede repeats every 8 seconds, and every win grows the herd: +1% max HP and Defense for all Ranch Pokémon, forever.'},'badge');
defSet('Street Gang',{trait:1,bp:[2,4,5,6],
  m:[{execute:.2},{execute:.25,gang:.06},{execute:.3,gang:.06,gangSteal:1},{execute:.35,gang:.08,gangSteal:1,turf:1}],
  d:'<b>Gang Up:</b> Street Gang Pokémon deal +20% / +25% / +30% / +35% damage to enemies below half HP. At 4, the gang <b>marks</b> one enemy: they all go after it, dealing +6% damage for every gang member hitting it (+8% at 6). At 5, taking down the mark steals its strength: the gang gains +10% damage and Attack Speed for the battle. At 6 (needs a Guild Badge): <b>Run the Streets</b>: marked takedowns drop ₽1 (up to ₽3 a battle), and every takedown earns 1 Turf: +1% Attack Speed for the gang, forever.'},'badge');
defSet('Dojo',{trait:1,bp:[2,3,4],feat:'dojo',
  m:[{crit:.15,critD:.2,belts:1},{crit:.2,critD:.3,belts:1,tech:1},{crit:.25,critD:.4,belts:1,tech:2,chainCrit:1}],
  d:'<b>Discipline:</b> Dojo Pokémon gain +15% / +20% / +25% crit chance and +20% / +30% / +40% crit damage, and earn <b>belts</b> from knockouts over the run (Yellow at 5, Brown at 15, Black at 30), each worth +5% crit chance and +10% crit damage. At 3, open the <b>Dojo</b> between rounds to teach each one a technique: Counter, Focus Punch or Bulk Up. With 4 different Dojo lines: <b>Grandmaster</b>: Black Belts use two techniques, and their critical hits chain to an enemy next to the target.'},'pool');
defSet('Mythical',{trait:1,bp:[1,2,3],feat:'myth',
  m:[{hpP:.15,dmg:.15},{hpP:.25,dmg:.25,mana:30},{hpP:.4,dmg:.4,mana:30}],t:[{},{},{dmg:.1}],
  d:'<b>Mythic Aura:</b> Mythical Pokémon gain +15% / +25% / +40% max HP and damage. At 2, they start with +30 PP. With 3 different Mythicals: your whole team deals +10% damage, and once per Act a <b>Mythical Event</b> offers you one of three event gifts.'},'pool');
defSet('Oddballs',{trait:1,bp:[2,4,5],feat:'roulette',
  m:[{odd:1},{odd:2},{odd:2,oddX:1}],
  d:'<b>Roulette:</b> before every battle each Oddball spins for a random bonus: +30% damage, +30% Attack Speed, +40% max HP or +40 PP (two spins at 4). You can see the spins on the board and pay ₽1 at the <b>Roulette</b> to spin one again. At 5 (needs a Guild Badge): <b>Mystery Gift</b>: spins can also land on exotic prizes: copying the strongest enemy\'s set bonuses, a full PP bar, or +60% to everything.'},'badge');
defSet('Big Eaters',{trait:1,bp:[2,4,5,6],
  m:[{eat:.25},{eat:.5,eatSize:1},{eat:.5,eatSize:1,coma:1},{eat:1,eatSize:1,coma:1,bottomless:1}],
  d:'<b>Feast:</b> <b>Feed</b> any bench Pokémon to a Big Eater from its unit menu (it\'s eaten for good, no ₽ back). For every ₽ it was worth, a frontline eater gains +3% max HP, a damage dealer +2% damage and a support +3% healing and shields, forever, and your other Big Eaters get 25% / 50% / 50% / 100% of it. At 4, eaters also grow +1% Size per ₽ eaten. At 5, <b>Food Coma</b>: after using a move, a Big Eater restores 9% of its max HP over 3 seconds. At 6 (needs a Guild Badge): <b>Bottomless</b>: every 3 rounds a free snack (a random ₽1 Pokémon) appears on your bench.'},'badge');

/* ================= Lineage ================= */
Object.assign(SETS.Partner,{bp:[2,3],d:SETS.Partner.d+' With a Partner at 20 Friendship and 3 Partners on the field: <b>Bond Phenomenon</b>: that Partner fights in its Bond form with +40% to all stats.'});
SETS.Partner.m[1]=Object.assign({},SETS.Partner.m[1],{bond:1});
defSet('Fossil',{bp:[2,3,4],feat:'fossil',m:[{revive:.3},{revive:.5},{revive:.5,jurassic:1}],
  d:'<b>Ancient Power:</b> the first time a Fossil Pokémon faints, it revives with 30% / 50% / 50% HP. At 2, you receive the Ancient Amber, gear that makes its Fossil wearer come back even stronger. At 3, the <b>Revival Lab</b> opens: once per Act, revive one of three fossils as a new Pokémon for your bench. With 4 different fossil lines: <b>Jurassic</b>: revived Fossils come back with +50% to all stats.'},'pool');
defSet('Pseudo',{bp:[2,3,4],m:[{hpP:.15,dmg:.1},{hpP:.25,dmg:.2},{hpP:.25,dmg:.2,apexGrow:1}],
  d:'<b>Apex:</b> pseudo-legendary lines gain +15% / +25% / +25% max HP and +10% / +20% / +20% damage. At 2, you receive the Apex Fang: whoever wears it becomes the Apex, with +35% max HP, damage and Attack Speed. At 3, the fang turns Radiant (+60%). With 4 different pseudo-legendaries: <b>Apex Predator</b>: the Apex gains +2% to all stats for every win, forever.'},'pool');

/* ================= Kinship sets (all pool capstones) ================= */
defSet('Eeveelutions',{kin:1,bp:[2,3,4,6],m:[{hpP:.1,dmg:.1},{hpP:.2,dmg:.2},{hpP:.3,dmg:.3},{hpP:.4,dmg:.4,eeveeFull:1}],
  d:'<b>Evolution Stones:</b> different Eeveelutions gain +10% / +20% / +30% / +40% max HP and damage, and each different one on the field gives your whole team a half-strength aura: Vaporeon regen, Jolteon Attack Speed, Flareon burns, Espeon PP, Umbreon defenses, Leafeon crits, Glaceon chill, Sylveon healing. You choose each Eevee\'s evolution when it evolves. With 6 different: <b>Eevee Family</b>: every aura is at full strength.'},'pool');
defSet('Tao Trio',{kin:1,bp:[2,3],m:[{hpP:.15,dmg:.15},{hpP:.3,dmg:.3,dna:1}],
  d:'<b>Yin and Yang:</b> Reshiram, Zekrom and Kyurem gain +15% / +30% max HP and damage. A fused Kyurem counts as both itself and its partner. With all three: <b>DNA Splicers</b>: a fused Kyurem gains +30% to all stats and its moves hit everything next to the target.'},'pool');
defSet('Weather Trio',{kin:1,bp:[2,3],m:[{ab:.15},{ab:.3,hpP:.2,delta:1}],
  d:'<b>Primal Clash:</b> Groudon, Kyogre and Rayquaza\'s moves deal +15% / +30% damage (+20% max HP with all three). With all three: <b>Delta Stream</b>: the weather swings between harsh sun and heavy rain every 6 seconds, and Rayquaza gains +10% damage every time it changes.'},'pool');
defSet('Lake Guardians',{kin:1,bp:[2,3],m:[{mana:20,ab:.15},{mana:30,ab:.25,lakeBond:1}],
  d:'<b>Knowledge, Emotion and Willpower:</b> Uxie, Mesprit and Azelf start with +20 / +30 PP and their moves deal +15% / +25% damage. Each one also lends the team its gift: Uxie +10 starting PP, Mesprit 0.5% max HP regen per second, Azelf +8% damage. With all three: <b>Spirit Bond</b>: when one faints, the others take over its gift at double strength.'},'pool');
defSet('Legendary Beasts',{kin:1,bp:[2,3],m:[{as:.15,dmg:.1},{as:.3,dmg:.2,hooh:1}],
  d:'<b>Burned Tower:</b> Raikou, Entei and Suicune gain +15% / +30% Attack Speed and +10% / +20% damage. With all three: <b>Ho-Oh\'s Blessing</b>: each beast revives once with 50% HP, and Suicune\'s revival cleanses your whole team.'},'pool');
defSet('Swords of Justice',{kin:1,bp:[2,4],m:[{crit:.15,as:.1},{crit:.3,as:.25,pen:.6}],
  d:'<b>Sacred Sword:</b> Cobalion, Terrakion, Virizion and Keldeo gain +15% / +30% crit chance and +10% / +25% Attack Speed. With all four, their attacks ignore 60% of the target\'s defenses.'},'pool');
defSet('Island Guardians',{kin:1,bp:[2,4],m:[{ab:.15,regen:.005},{ab:.3,regen:.01,madness:1}],
  d:'<b>Guardian Deities:</b> the Tapus\' moves deal +15% / +30% damage and they restore 0.5% / 1% max HP per second. With all four: <b>Nature\'s Madness</b>: when battle starts, each Tapu takes 15% of every enemy\'s current HP.'},'pool');
defSet('Legendary Birds',{kin:1,bp:[2,3,4],m:[{as:.15,ab:.15},{as:.2,ab:.25,birdEl:1},{as:.25,ab:.35,birdEl:1,shrine:1}],
  d:'<b>Legendary Flock:</b> the legendary birds gain +15% / +20% / +25% Attack Speed and their moves deal +15% / +25% / +35% damage. At 3, each one\'s attacks carry its element: Articuno chills, Zapdos paralyzes, Moltres burns. With 4 different birds: <b>Shrine of Legends</b>: every 8 seconds a storm of ice, lightning and fire strikes every enemy.'},'pool');
defSet('Tower Duo',{kin:1,bp:[2],m:[{hpP:.25,dmg:.25,revive:.5}],t:[{dmg:.1}],
  d:'<b>Rainbow and Silver:</b> with Lugia and Ho-Oh together, both gain +25% max HP and damage and revive once with 50% HP, and your whole team deals +10% damage.'},'pool');
defSet('Eon Duo',{kin:1,bp:[2],m:[{ab:.3,eon:1}],
  d:'<b>Soul Dew:</b> with Latias and Latios together, their moves deal +30% damage, and every 6 seconds both vanish into the sky for a moment (untargetable for 1 second).'},'pool');
defSet('Legendary Golems',{kin:1,bp:[2,3,4],m:[{def:20,res:20},{def:35,res:35,hpP:.15},{def:50,res:50,hpP:.25,gigas:1}],
  d:'<b>Ancient Golems:</b> the Regis gain +20 / +35 / +50 Defense and Sp. Def (+15% / +25% max HP at 3). With 4 different: <b>Awakening</b>: every Golem starts with a shield of 20% max HP, and Regigigas wakes up at full power (+50% to all stats).'},'pool');
defSet('Creation Trio',{kin:1,bp:[2,3,4],m:[{ab:.2},{ab:.3,creation:1},{ab:.4,creation:1,judgment:1}],
  d:'<b>Time, Space and Antimatter:</b> Dialga, Palkia, Giratina and Arceus\' moves deal +20% / +30% / +40% damage. At 3, their domains warp the battle: with Dialga enemies attack 15% slower, with Palkia your Pokémon gain +1 range, with Giratina enemies deal 10% less damage. With all four: <b>Judgment</b>: every 10 seconds, Arceus strikes every enemy for 10% of its max HP.'},'pool');
defSet('Aura Trio',{kin:1,bp:[2,3],m:[{hpP:.15,dmg:.15},{hpP:.25,dmg:.25,auraTrio:1}],
  d:'<b>Life, Destruction and Order:</b> Xerneas, Yveltal and Zygarde gain +15% / +25% max HP and damage. With all three: Xerneas\' Geomancy gives your team +20% Attack Speed for 8 seconds, Yveltal heals your team for 20% of the damage it deals, and Zygarde rebuilds itself to full HP once below half.'},'pool');
defSet('Light Trio',{kin:1,bp:[2,3],m:[{dmg:.15},{dmg:.25,ultra:1}],
  d:'<b>Blinding Light:</b> Solgaleo, Lunala and Necrozma deal +15% / +25% damage. With all three: <b>Ultra Burst</b>: a fused Necrozma bursts with light on its second move, gaining +50% damage for the rest of the battle.'},'pool');
defSet('Galar Heroes',{kin:1,bp:[2,3],m:[{hpP:.2,dmg:.2,crowned:1},{hpP:.3,dmg:.3,crowned:1,eternamax:1}],
  d:'<b>Hero of Many Battles:</b> Zacian, Zamazenta and Eternatus gain +20% / +30% max HP and damage; Zacian\'s sword adds +30% Attack and Zamazenta\'s shield +30% defenses. With all three: <b>Eternamax</b>: Eternatus grows +60% Size and +60% max HP.'},'pool');
defSet('Crown of Galar',{kin:1,bp:[2,3],m:[{ab:.2},{ab:.35,unity:1}],
  d:'<b>Reins of Unity:</b> Calyrex, Glastrier and Spectrier\'s moves deal +20% / +35% damage. With all three: a riding Calyrex gains +30% to all stats.'},'pool');
defSet('Loyal Three',{kin:1,bp:[2,3],m:[{dmg:.15,toxic:1},{dmg:.25,toxic:1,toxicChain:1}],
  d:'<b>Toxic Chain:</b> Munkidori, Fezandipiti and Ogerpon deal +15% / +25% damage and badly poison what they hit. With all three, poisoned enemies deal 15% less damage.'},'pool');
// older kinship sets keep their effects; their tops become pool capstones
for(const k of ['Wolf Pack','Dance Troupe','Cloak Society','Two Styles','Duet','Ruinous Treasures','Forces of Nature','Ancient','Future','Ultra Beast'])if(SETS[k])CAPS[k]='pool';
SETS.Ancient.bp=[2,4,6];SETS.Ancient.m=[...SETS.Ancient.m,Object.assign({},SETS.Ancient.m[1],{boosterPerm:1})];SETS.Ancient.x=[...(SETS.Ancient.x||[{},{}]),{weather:'sun'}];
SETS.Ancient.d+=' With 6 different: <b>Booster Energy</b>: their best stat is boosted by 30% all battle, sun or not.';
SETS.Future.bp=[2,4,6];SETS.Future.m=[...SETS.Future.m,Object.assign({},SETS.Future.m[1],{boosterPerm:1})];SETS.Future.d+=' With 6 different: <b>Booster Energy</b>: their best stat is boosted by 30% all battle.';
SETS['Ultra Beast'].bp=[2,4,6];SETS['Ultra Beast'].m=[...SETS['Ultra Beast'].m,Object.assign({},SETS['Ultra Beast'].m[1],{beastBoost:.1})];SETS['Ultra Beast'].d+=' With 6 different: <b>Beast Boost</b>: every knockout also raises their best stat by 10% for the battle.';
SETS['Ultra Beast'].bp0=SETS['Ultra Beast'].bp;

/* ================= Guild Badges (the spatula) ================= */
const BADGE_ICON={'':30,Titans:1,Leviathans:2,'Sky Squadron':22,Swarm:10,'Creepy Crawlies':50,Kaiju:16,Phantasms:12,'Living Stone':14,Showstoppers:5,'Deep Sea':24,Reef:31,'Fae Folk':4,
  'Mouse Brigade':11,Nursery:23,'Team Rocket':7,Garden:8,Ranch:21,'Street Gang':18,Oddballs:3,'Big Eaters':6};
const BADGE_RUN_MAX=3,BADGE_SET_MAX=2;
const isBadge=it=>typeof it.k==='string'&&it.k.startsWith('badge:');
const badgeSet=it=>it.k.slice(6);
const badgeIcon=k=>'badge-'+(BADGE_ICON[k]||30);
function badgeDef(it){const k=badgeSet(it);return k?{id:badgeIcon(k),n:`${k} Badge`,d:`<b>Guild Badge.</b> The holder also counts as a <b>${k}</b> Pokémon for sets, and unlocks the ${k} capstone. Takes an item slot.`}
  :{id:badgeIcon(''),n:'Blank Badge',d:'<b>Guild Badge.</b> Use it to engrave it with one of your sets: the holder will count as a member and unlock that set\'s capstone.'};}
const badgeOK=k=>CAPS[k]==='badge';
function canHoldBadge(it,u){const k=badgeSet(it);return!!k&&!unitSets(u).includes(k)&&u.items.length<3&&!u.items.some(isBadge);}
function badgesOwned(){const all=[...run.bag,...allOwned().flatMap(u=>u.items)];return all.filter(isBadge);}
function giveBlankBadge(src){if(!run)return false;run.badgesGot=run.badgesGot||0;if(run.badgesGot>=BADGE_RUN_MAX)return false;run.badgesGot++;run.bag.push({k:'badge:',mut:[]});
  if(!SIM.on){sfx('achieve');banner('Blank Guild Badge!',src||'Engrave it for one of your sets',2200);setTimeout(()=>showEngraver(run.bag.length-1),400);}else simEngrave(run.bag.length-1);return true;}
function engraveChoices(){const ct=countTraits(Object.values(run.board));const held=badgesOwned().map(badgeSet);
  return Object.keys(CAPS).filter(k=>badgeOK(k)&&(ct[k]||0)>=2&&held.filter(x=>x===k).length<BADGE_SET_MAX).sort((a,b)=>(ct[b]||0)-(ct[a]||0));}
function simEngrave(bi){const c=engraveChoices();if(c.length)run.bag[bi].k='badge:'+c[0];}
function showEngraver(bi){
  const it=run.bag[bi];if(!it||!isBadge(it)||badgeSet(it))return;const ch=engraveChoices(),ct=countTraits(Object.values(run.board));
  ov.innerHTML=`<div class="scrim" id="bg-scrim"></div><div class="screen"><div class="win featwin"><h1 class="h1">Badge Engraver</h1>
    <p class="sub">Choose a set to engrave. The badge makes its holder a member, and that set's capstone needs one on the field.${ch.length?'':' You need at least 2 Pokémon of a badge set on the field: keep the badge and engrave it later from your bag.'}</p>
    <div class="setgrid">${ch.map(k=>`<button class="setopt" data-eng="${esc(k)}"><img src="${iconOf(badgeIcon(k))}" alt=""><b>${esc(k)}</b><span>${ct[k]||0} on the field · capstone at ${capOf(k)}</span></button>`).join('')}</div>
    <div class="umacts"><button class="btn" id="bg-back">${ch.length?'Decide later':'Close'}</button></div></div></div>`;
  const close=()=>{ov.innerHTML='';renderUI();};$('bg-back').onclick=close;$('bg-scrim').onclick=close;
  ov.querySelectorAll('[data-eng]').forEach(b=>b.onclick=()=>{it.k='badge:'+b.dataset.eng;if(!SIM.on){sfx('star',140);toast(`Engraved: ${b.dataset.eng} Badge. Give it to a Pokémon to make it a member.`);}close();});
  (ov.querySelector('.setopt')||$('bg-back')).focus();
}

/* ================= Capstone gating ================= */
const GATED={};
function capGate(ct,raw,list){for(const k in GATED)delete GATED[k];
  for(const k in ct){const S=SETS[k],cap=CAPS[k];if(!S||!cap)continue;const top=capOf(k);if(ct[k]<top)continue;
    if(cap==='badge'){const has=list.some(u=>u&&u.items&&u.items.some(it=>isBadge(it)&&badgeSet(it)===k));if(!has){ct[k]=top-1;GATED[k]='badge';}}
    else if((raw[k]||0)<top){ct[k]=top-1;GATED[k]='pool';}}}

/* ================= Battle ================= */
const trOf=side=>battle&&battle.trs?battle.trs[side]:{};
const tierAt=(side,k)=>tierOf(k,(trOf(side)||{})[k]||0);
const membersOf=(side,k)=>alive(side).filter(o=>!o.summon&&o.u&&unitSets(o.u).includes(k));
const sayAt=(c,txt,col)=>{if(!SIM.on)texts.push({x:c.x,y:c.y-40,txt,col:col||'#ffe27a',life:1.3,label:1});};
function setsUnitStart(u,F,foes){
  if(u.decoy)return;
  if(F.titanGrow)schedule(10,()=>{if(!u.dead){addSize(u,F.titanGrow,.5);if(!SIM.on)pfx('Rock_Polish',u.x,u.y-12,{sc:.8,force:1});}});
  if(F.lev&&!SIM.on)pfx('Water_Spout_Up',u.x,u.y-30,{sc:.5,force:1});
  if(F.hive){const tick=()=>{if(u.dead||(mode!=='combat'&&!SIM.on))return;const n=membersOf(u.team,'Swarm').length;const want=1+F.hive*n;u.as*=want/(u.hiveK||1);u.hiveK=want;schedule(1,tick);};tick();}
  if(F.coma)u.coma=1;
  if(F.eat&&u.u){const g=u.u.g||{};if(g.eatSize&&F.eatSize)addSize(u,g.eatSize);}
  if(F.proud){u.atk*=1.25;u.spa*=1.25;u.def*=1.25;u.res*=1.25;u.maxHp*=1.25;u.hp*=1.25;u.as*=1.25;}
  if(F.belts&&u.u){const b=beltOf(u.u);if(b){u.crit+=.05*b;u.critD+=.1*b;}}
  if(F.tech&&u.u)techStart(u,F);
  if(F.bond&&u.u&&(u.u.fr||0)>=20){u.maxHp*=1.4;u.hp*=1.4;u.dmg+=.4;u.as*=1.4;u.def*=1.4;u.res*=1.4;addSize(u,15);sayAt(u,'Bond Phenomenon!','#7fd6ff');if(!SIM.on)pfx('Moonlight_Sparkles',u.x,u.y-16,{sc:1,force:1});}
  if(F.apexGrow&&u.apex&&run){const g=Math.min(.6,(run.apexWins||0)*.02);u.maxHp*=1+g;u.hp*=1+g;u.dmg+=g;u.as*=1+g;}
  if(F.jurassic)u.jurassic=1;
  if(F.boosterPerm){const k=['atk','spa','def','res'].sort((a,b)=>u[b]-u[a])[0];u[k]*=1.3;}
  if(F.gigas&&D[u.dex].n==='Regigigas'){u.atk*=1.5;u.spa*=1.5;u.def*=1.5;u.res*=1.5;u.as*=1.5;sayAt(u,'Awakened!','#ffe27a');}
  if(F.gigas)u.shield+=u.maxHp*.2;
  if(F.crowned){const n=D[u.dex].n;if(n.startsWith('Zacian'))u.atk*=1.3;if(n.startsWith('Zamazenta')){u.def*=1.3;u.res*=1.3;}}
  if(F.eternamax&&D[u.dex].n.startsWith('Eternatus')){addSize(u,60,1);sayAt(u,'Eternamax!','#ff4d8a');}
  if(F.unity&&u.u&&u.u.fuse&&D[u.dex].n.startsWith('Calyrex')){u.atk*=1.3;u.spa*=1.3;u.def*=1.3;u.res*=1.3;u.as*=1.3;}
  if(F.dna&&u.u&&u.u.fuse&&D[u.dex].n.includes('Kyurem')){u.atk*=1.3;u.spa*=1.3;u.def*=1.3;u.res*=1.3;u.as*=1.3;u.fx.splash=(u.fx.splash||0)+.4;u.kit=Object.assign({},u.kit,{aoe:Math.max(1,u.kit.aoe||0)});}
  if(F.toxic)u.fx.poisonHit=(u.fx.poisonHit||0)+.02;
  if(F.birdEl){const n=D[u.dex].n;if(n.includes('Articuno'))u.fx.chillSt=(u.fx.chillSt||0)+1;else if(n.includes('Zapdos'))u.fx.hitAil={c:.15,ail:1};else u.burnP=(u.burnP||0)+.02;}
  if(F.eon)every(u,6,()=>{u.airT=combatT+1;if(!SIM.on)pfx('Wave_Circle_White',u.x,u.y-14,{sc:.7,force:1});});
  if(F.auraTrio){const n=D[u.dex].n;if(n.startsWith('Zygarde'))u.fx.halfShield=(u.fx.halfShield||0)+.5;if(n.startsWith('Yveltal'))u.yvel=1;
    if(n.startsWith('Xerneas'))for(const a of alive(u.team)){a.as*=1.2;schedule(8,()=>{a.as/=1.2;});if(!SIM.on)pfx('Moonlight_Sparkles_2',a.x,a.y-14,{sc:.6,force:1});}}
  if(F.ultra&&u.u&&u.u.fuse&&D[u.dex].n.includes('Necrozma'))u.ultraReady=1;
  if(F.hooh)u.revive=Math.max(u.revive||0,.5),u.hoohRez=1;
}
function setsBattleStart(){
  for(const side of[0,1]){if(side===1)continue;const tr=trOf(side),mine=alive(side),foes=alive(1-side);
    // Showstoppers
    const sT=tierAt(side,'Showstoppers');if(sT){const cand=membersOf(side,'Showstoppers').sort((a,b)=>(b.u.isStar?1e9:0)+b.maxHp-((a.u.isStar?1e9:0)+a.maxHp));
      const st=cand[0];if(st){starOn(st,1);if(sT>=2&&cand[1])starOn(cand[1],.5);battle.star=st;battle.under=cand[1]||null;}}
    // Leviathans: water lanes
    const lT=tierAt(side,'Leviathans');if(lT){battle.lanes=new Set();for(const c of membersOf(side,'Leviathans')){const cols=lT>=2?[c.c-1,c.c,c.c+1]:[c.c];for(const q of cols)if(q>=0&&q<COLS)for(let r=0;r<ROWS;r++)battle.lanes.add(q+','+r);}
      for(const c of membersOf(side,'Leviathans'))leviathanLoop(c,lT);
      if(lT>=2)for(const o of foes)o.laneSlow=1;}
    // Street Gang: the mark
    if(tierAt(side,'Street Gang')>=2)gangMark(side);
    // Deep Sea pressure and the Abyss
    if(tr&&tierAt(side,'Deep Sea')>=3){const tick=()=>{if(mode!=='combat'&&!SIM.on)return;for(const o of alive(1-side)){o.def*=.95;o.res*=.95;}if(!SIM.on)for(const o of alive(1-side))pfx('Bubbles_Blue',o.x,o.y-10,{sc:.5});schedule(5,tick);};schedule(5,tick);}
    if(tierAt(side,'Deep Sea')>=4){const drag=()=>{if(mode!=='combat'&&!SIM.on)return;const t=alive(1-side).filter(o=>!o.boss).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
        if(t&&t.hp<t.maxHp*.3){const src=membersOf(side,'Deep Sea')[0];if(src){if(t.u&&t.u.star>=2&&run&&(battle.abyssG||0)<3){battle.abyssG=(battle.abyssG||0)+1;run.gold++;}hurt(t,t.hp+t.shield+1,src);if(!SIM.on){pfx('Dive',t.x,t.y-8,{sc:1,force:1});texts.push({x:t.x,y:t.y-36,txt:'The Abyss!',col:'#3f7fd6',life:1.2,label:1});}}}schedule(8,drag);};schedule(8,drag);}
    // Swarm: Attack Order and Queen's Call
    const swT=tierAt(side,'Swarm');
    if(swT>=3){const order=()=>{if(mode!=='combat'&&!SIM.on)return;const ms=membersOf(side,'Swarm');const t=alive(1-side).sort((a,b)=>a.hp-b.hp)[0];if(t&&ms.length){for(const m of ms)schedule(rnd(0,.3),()=>{if(!t.dead&&!m.dead)damage(m,t,m.atk*.3,{ab:1,cat:'phys',type:'Bug',noCrit:1});});if(!SIM.on){for(let i=0;i<Math.min(6,ms.length);i++)schedule(i*.06,()=>pfx('Attack_Order_Bee',t.x+rnd(-14,14),t.y-14+rnd(-10,6),{sc:.8,force:1}));}}schedule(5,order);};schedule(5,order);}
    if(swT>=4){const bonus=(1+(SETS.Swarm.m[3].hive)*membersOf(side,'Swarm').length);for(const o of mine)if(!o.fx.hive)o.as*=1+(bonus-1)/2;}
    // Titans: Colossus
    if(tierAt(side,'Titans')>=4){const t=membersOf(side,'Titans').sort((a,b)=>sizeOf(b)-sizeOf(a)||b.maxHp-a.maxHp)[0];if(t){addSize(t,60,1);sayAt(t,'Colossus!','#e8c48a');
      every(t,5,()=>{for(const o of alive(1-side))if(hdist(o,t)<=1+Math.floor((sizeOf(t)-100)/80)){damage(t,o,t.maxHp*.05,{ab:1,cat:'phys',noCrit:1});stun(o,.5);}for(const a of alive(side))a.shield+=t.maxHp*.04;if(!SIM.on){pfx('Earthquake_Ranger',t.x,t.y-4,{sc:1.2,force:1});cineShakeKick&&cineShakeKick(3);}});}}
    // Sky Squadron: Air Raid
    if(tierAt(side,'Sky Squadron')>=4){const raid=()=>{if(mode!=='combat'&&!SIM.on)return;for(const f of membersOf(side,'Sky Squadron'))skyDive(f,3,true);schedule(6,raid);};schedule(6,raid);}
    // Ranch: Stampede
    const rT=tierAt(side,'Ranch');if(rT>=3){const go=()=>{if(mode!=='combat'&&!SIM.on)return;for(const m of membersOf(side,'Ranch'))stampede(m);if(rT>=4)schedule(8,go);};schedule(.3,go);}
    // Riverside: Flash Flood
    if(tierAt(side,'Riverside')>=3)schedule(8,()=>{if(mode!=='combat'&&!SIM.on)return;battle.flood=1;for(const m of membersOf(side,'Riverside'))m.as*=1.4;for(const o of alive(1-side)){o.as*=.85;o.slowP=Math.max(o.slowP||0,.3);o.slowT=99;}
      if(!SIM.on){texts.push({x:320,y:120,txt:'Flash Flood!',col:'#5ab8ff',life:1.6,label:1});for(let i=0;i<8;i++)schedule(i*.05,()=>pfx('Water_Spout_Splash',140+i*50,rnd(80,200),{sc:1.2,force:1}));}});
    // Reef: coral
    if(tierAt(side,'Reef')>=4){battle.coral=new Set();for(const m of membersOf(side,'Reef')){battle.coral.add(m.c+','+m.r);for(const h of nbrs(m.c,m.r))battle.coral.add(h.c+','+h.r);}
      every({dead:false},.5,()=>{for(const a of alive(side))if(battle.coral.has(a.c+','+a.r))heal(a,a.maxHp*.005,true);});}
    // Garden plots
    if(run&&run.plots&&run.plots.length&&tierAt(side,'Garden'))gardenBattle(side);
    // Eeveelutions
    const eT=tierAt(side,'Eeveelutions');if(eT)eeveeAuras(side,eT);
    // Lake Guardians
    if(tierAt(side,'Lake Guardians'))lakeGifts(side,1);
    // Creation Trio
    if(tierAt(side,'Creation Trio')>=2){const ns=membersOf(side,'Creation Trio').map(o=>D[o.dex].n);if(ns.some(n=>n.startsWith('Dialga')))for(const o of foes)o.as*=.85;if(ns.some(n=>n.startsWith('Palkia')))for(const o of mine)o.range+=1;if(ns.some(n=>n.startsWith('Giratina')))for(const o of foes)o.dmg*=.9;}
    if(tierAt(side,'Creation Trio')>=3){const a=membersOf(side,'Creation Trio').find(o=>D[o.dex].n.startsWith('Arceus'));if(a)every(a,10,()=>{for(const o of alive(1-side))damage(a,o,o.maxHp*.1,{tru:1,ab:1,noCrit:1,refl:1});if(!SIM.on){pfx('Judgment',320,140,{sc:2,force:1});texts.push({x:a.x,y:a.y-40,txt:'Judgment!',col:'#fff4c2',life:1.3,label:1});}});}
    // Weather Trio: Delta Stream
    if(tierAt(side,'Weather Trio')>=2){const ray=membersOf(side,'Weather Trio').find(o=>D[o.dex].n.startsWith('Rayquaza'));const swap=()=>{if(mode!=='combat'&&!SIM.on)return;battle.weather=battle.weather==='sun'?'rain':'sun';battle.wPow=2;if(ray&&!ray.dead)ray.dmg+=.1;if(!SIM.on)texts.push({x:320,y:150,txt:battle.weather==='sun'?'Harsh sunlight!':'Heavy rain!',col:'#ffe27a',life:1.2,label:1});schedule(6,swap);};schedule(6,swap);}
    // Island Guardians: Nature's Madness
    if(tierAt(side,'Island Guardians')>=2)for(const t of membersOf(side,'Island Guardians'))schedule(.6,()=>{for(const o of alive(1-side))damage(t,o,o.hp*.15,{tru:1,ab:1,noCrit:1,refl:1});if(!SIM.on)pfx('Dark_Void_Sparkle',320,130,{sc:1.6,force:1});});
    // Legendary Birds: Shrine of Legends
    if(tierAt(side,'Legendary Birds')>=3){const storm=()=>{if(mode!=='combat'&&!SIM.on)return;const bs=membersOf(side,'Legendary Birds');for(const b of bs)for(const o of alive(1-side))damage(b,o,b.spa*.35,{ab:1,cat:'spec',noCrit:1,refl:1});
        if(!SIM.on&&bs.length){texts.push({x:320,y:120,txt:'Shrine of Legends!',col:'#c9f0ff',life:1.4,label:1});for(const o of alive(1-side))pfx(pick(['Ice_Shard_Hit_Sparkle','Discharge_Hit','Fire_Fang_Hit']),o.x,o.y-12,{sc:.8,force:1});}schedule(8,storm);};schedule(8,storm);}
    // Loyal Three: Toxic Chain
    if(tierAt(side,'Loyal Three')>=2)every({dead:false},1,()=>{for(const o of alive(1-side))if(o.poison&&!o.toxDown){o.toxDown=1;o.dmg*=.85;}});
  }
}
function starOn(s,k){s.spotlight=k;s.dmg+=.25*k;s.as*=1+.25*k;if(!SIM.on){texts.push({x:s.x,y:s.y-40,txt:k===1?'Star!':'Understudy',col:'#ffe27a',life:1.4,label:1});pfx(k===1?'Encore_Spotlight_Front':'Flatter_Spotlight',s.x,s.y-20,{sc:.8,force:1});}}
function leviathanLoop(c,lT){let grown=0;const tick=()=>{if(c.dead||(mode!=='combat'&&!SIM.on))return;const inW=battle.lanes&&battle.lanes.has(c.c+','+c.r);
    if(inW){heal(c,c.maxHp*.02,true);const lim=c.fx.levRise&&battle.levBig===c?1e9:40;if(grown<lim){addSize(c,4,.5);grown+=4;if(!SIM.on)pfx('Bubbles_Blue',c.x,c.y-16,{sc:.6});}}schedule(2,tick);};schedule(2,tick);
  if(lT>=4&&!battle.levBig)battle.levBig=membersOf(c.team,'Leviathans').sort((a,b)=>sizeOf(b)-sizeOf(a)||b.maxHp-a.maxHp)[0];
  if(c.fx.levWave)every(c,6,()=>{const hit=alive(1-c.team).filter(o=>Math.abs(o.c-c.c)<=(lT>=2?1:0));const tsu=c.fx.levRise&&battle.levBig===c;
    for(const o of hit){damage(c,o,c.maxHp*.06,{ab:1,cat:'spec',type:'Water',noCrit:1});knock(c,o);if(tsu)stun(o,.6);}
    if(!SIM.on){const p=hexXY(c.c,c.team?ROWS-1:0);for(let r=0;r<ROWS;r++)schedule(r*.04,()=>pfx(tsu?'Water_Spout_Splash':'Aqua_Tail_Wave',hexXY(c.c,c.team?r:ROWS-1-r).x,hexXY(c.c,c.team?r:ROWS-1-r).y-6,{sc:tsu?1.3:.8,force:1}));}});}
function gangMark(side){const pickMark=()=>{const gs=membersOf(side,'Street Gang');if(!gs.length)return null;const t=alive(1-side).sort((a,b)=>hdist(gs[0],a)-hdist(gs[0],b)||a.hp-b.hp)[0];return t;};
  battle.mark=battle.mark||[null,null];battle.mark[side]=pickMark();
  const tick=()=>{if(mode!=='combat'&&!SIM.on)return;const m=battle.mark[side];if(!m||m.dead)battle.mark[side]=pickMark();const mm=battle.mark[side];if(mm)for(const g of membersOf(side,'Street Gang'))if(g.target!==mm&&!(mm.airT>combatT))g.target=mm;schedule(.5,tick);};tick();}
function skyTarget(u){const foes=foesOf(u).filter(o=>!(o.airT>combatT));if(!foes.length)return null;const plan=(run&&u.team===0&&run.flight)||'back';
  if(plan==='carry')return foes.sort((a,b)=>(b.dealt||0)-(a.dealt||0)||Math.max(b.atk,b.spa)-Math.max(a.atk,a.spa))[0];
  if(plan==='healer'){const h=foes.filter(o=>o.kit&&(o.kit.type==='heal'||o.kit.cls==='Medic'||o.kit.cls==='Mystic'));if(h.length)return h.sort((a,b)=>hdist(u,b)-hdist(u,a))[0];}
  return foes.sort((a,b)=>hdist(u,b)-hdist(u,a))[0];}
function skyDive(u,lvl,again){if(u.dead)return;u.airT=combatT+.8;u.busy=Math.max(u.busy,.85);u.target=null;if(!SIM.on)pfx('Gust_Wind',u.x,u.y-10,{sc:.8,force:1});
  schedule(.8,()=>{if(u.dead||(mode!=='combat'&&!SIM.on))return;const t=skyTarget(u);if(!t)return;dashTo(u,t,true,.25);
    schedule(.27,()=>{if(u.dead||t.dead)return;damage(u,t,(u.base||50)*.6+Math.max(u.atk,u.spa)*.5,{ab:1,cat:u.cat,noCrit:1});if(lvl>=3)stun(t,.8);if(!SIM.on){pfx('Brave_Bird_Hit',t.x,t.y-12,{sc:.8,force:1})||boom(t,'#cfe8ff',2);}});});}
function stampede(m){if(m.dead)return;const dir=m.team?1:-1;const tr=nbrs(m.c,m.r).filter(h=>(h.r-m.r)*dir>0&&!occupied(h.c,h.r,m)).sort((a,b)=>Math.abs(a.c-m.c)-Math.abs(b.c-m.c))[0];
  const hit=alive(1-m.team).filter(o=>hdist(o,m)<=2&&(o.r-m.r)*dir>=0).slice(0,3);for(const o of hit){damage(m,o,m.maxHp*.06+m.atk*.4,{ab:1,cat:'phys',noCrit:1});knock(m,o);}
  if(tr){const p=hexXY(tr.c,tr.r);m.move={c:tr.c,r:tr.r,fx:m.x,fy:m.y,tx:p.x,ty:p.y,t:0,dur:.25};}if(!SIM.on){pfx('Smoke_Brown',m.x,m.y-4,{sc:.9,force:1});sayAt(m,'Stampede!','#e8c48a');}}
const EEV={134:'regen',135:'as',136:'burn',196:'pp',197:'def',470:'crit',471:'chill',700:'heal'};
function eeveeAuras(side,eT){const full=eT>=4?1:.5,ms=membersOf(side,'Eeveelutions'),have=new Set(ms.map(o=>EEV[baseOf?baseOf(o.dex):o.dex]||EEV[o.dex]).filter(Boolean));
  for(const a of alive(side)){if(have.has('regen'))a.regen+=.005*full;if(have.has('as'))a.as*=1+.08*full;if(have.has('burn'))a.burnP=(a.burnP||0)+.01*full;if(have.has('pp'))gainMana(a,15*full);
    if(have.has('def')){a.def+=12*full;a.res+=12*full;}if(have.has('crit'))a.crit+=.08*full;if(have.has('chill'))a.fx.chillSt=(a.fx.chillSt||0)+(full>=1?1:0);if(have.has('heal'))a.healAmp+=.15*full;}
  if(!SIM.on&&have.size)texts.push({x:320,y:134,txt:`Eevee auras ×${have.size}`,col:'#f7c58a',life:1.3,label:1});}
function lakeGifts(side,k){for(const g of membersOf(side,'Lake Guardians')){const n=D[g.dex].n;for(const a of alive(side)){if(n==='Uxie')gainMana(a,10*k);if(n==='Mesprit')a.regen+=.005*k;if(n==='Azelf')a.dmg+=.08*k;}}}
function gardenBattle(side){const T=tierAt(side,'Garden');for(const p of run.plots){const at=p.c+','+p.r;const st=p.st||0;
  every({dead:false},.5,()=>{for(const a of alive(side))if(a.c===p.c&&a.r===p.r){heal(a,a.maxHp*[.005,.01,.02][st]*.5,true);}
    if(st>=2&&T>=3)for(const a of alive(side))if(hdist(a,p)===1)heal(a,a.maxHp*.005,true);});
  if(st>=2&&T>=2)for(const a of alive(side))if(a.c===p.c&&a.r===p.r)a.dmg+=.15;}}
function setsCast(u){
  if(u.coma){let n=0;const t=()=>{if(u.dead||n++>=6)return;heal(u,u.maxHp*.015,true);schedule(.5,t);};t();if(!SIM.on)pfx('Sleep_Z',u.x+6,u.y-28,{sc:.6,force:1});}
  if(u.spotlight===1&&battle&&tierAt(u.team,'Showstoppers')>=2)u.dmg+=.03;
  if(u.spotlight===1&&tierAt(u.team,'Showstoppers')>=4)schedule(.6,()=>{if(u.dead)return;const tg=u.target&&!u.target.dead?u.target:foesOf(u)[0];if(tg)useMove(u,tg,.6,true);if(!SIM.on)pfx('Encore_Clap',u.x,u.y-24,{sc:.7,force:1});});
  if(u.fx.kaijuRoar&&u.fx.kaijuGiant&&u.casts===u.fx.kaijuGiant){for(const o of alive(1-u.team))if(hdist(o,u)<=2)stun(o,1);if(!SIM.on){pfx('Hyper_Voice',u.x,u.y-14,{sc:1.2,force:1})||ring(u.x,u.y-8,'#ff7a5c');}
    if(run&&u.team===0)battle.kaijuGiant=1;}
  if(u.fx.kaijuKing&&u.casts===6&&!battle.kingDone&&u.team===0){battle.kingDone=1;addSize(u,40,.5);u.kit=Object.assign({},u.kit,{aoe:2});sayAt(u,'King of the Monsters!','#ff7a5c');}
  if(u.ultraReady&&u.casts===2){u.ultraReady=0;u.dmg+=.5;sayAt(u,'Ultra Burst!','#fff4c2');if(!SIM.on)pfx('Flash_Cannon_Sparkle_Gather',u.x,u.y-16,{sc:1.2,force:1});}
  if(u.yvel)u.yvelOn=1;
}
function setsDmgMul(src,tg,o){let m=1;
  if(src.fx.gang&&battle.mark&&battle.mark[src.team]===tg){const n=membersOf(src.team,'Street Gang').filter(g=>g.target===tg).length;m*=1+src.fx.gang*n;}
  if(battle.lanes&&tg.laneSlow&&battle.lanes.has(tg.c+','+tg.r)&&!tg.laneOn){tg.laneOn=1;tg.as*=.85;}
  if(battle.coral&&battle.coral.has(tg.c+','+tg.r)&&tg.team===0)m*=.85;
  return m;}
function setsAfterHit(src,tg,o,d){
  if(tg.fx.crab&&o.auto&&!src.dead&&!tg.dead){tg.crabN=(tg.crabN||0)+1;if(tg.crabN%4===0){damage(tg,src,tg.maxHp*.08,{ab:1,cat:'phys',type:'Water',noCrit:1,refl:1});stun(src,.5);if(!SIM.on)pfx('Crab_Hammer_PMDO',src.x,src.y-12,{sc:.8,force:1});}}
  if(tg.tech==='bulk'&&(tg.bulkN||0)<20){tg.bulkN=(tg.bulkN||0)+1;tg.dmg+=.02;}
  if(src.yvelOn&&d>0)for(const a of alive(src.team))heal(a,d*.2/Math.max(1,alive(src.team).length),true);
  if(src.fx.chainCrit&&o.crited&&beltOf(src.u)>=3&&!o.chain){const n=alive(tg.team).find(x=>x!==tg&&hdist(x,tg)<=1);if(n)damage(src,n,d*.5,{cat:src.cat,noCrit:1,chain:1,refl:1});}
}
function setsShieldBroke(tg,sb){if(tg.fx.shatter&&!tg.dead){for(const o of alive(1-tg.team))if(hdist(o,tg)<=1)damage(tg,o,sb,{ab:1,cat:'phys',type:'Rock',noCrit:1,refl:1});if(!SIM.on){pfx('Rock_Wrecker_Hit',tg.x,tg.y-10,{sc:.9,force:1});sayAt(tg,'Shatter!','#c8c0b8');}}}
/* faint / would-faint */
function setsWouldFaint(tg){// return true if the unit is saved
  if(tg.fx.metamorph&&!battle.metaDone&&tg.team===0&&!tg.summon){battle.metaDone=1;tg.hp=1;tg.airT=combatT+2;tg.busy=2;tg.target=null;sayAt(tg,'Cocoon…','#d6f08a');if(!SIM.on)pfx('String_Shot_Ball',tg.x,tg.y-12,{sc:1.4,force:1});
    schedule(2,()=>{if(tg.dead)return;const nx=typeof nextStage==='function'?nextStage(tg.dex):null;
      if(nx&&D[nx]){const k=D[nx].s,b=D[tg.dex].s,R=i=>Math.max(1,k[i])/Math.max(1,b[i]);tg.maxHp*=R(0);tg.atk*=R(1);tg.def*=R(2);tg.spa*=R(3);tg.res*=R(4);tg.dex=nx;ensure(nx);}
      else{tg.maxHp*=1.5;tg.atk*=1.5;tg.spa*=1.5;tg.def*=1.5;tg.res*=1.5;tg.as*=1.5;}
      tg.hp=tg.maxHp;sayAt(tg,'Metamorphosis!','#d6f08a');if(!SIM.on)pfx('Silver_Wind',tg.x,tg.y-14,{sc:1.2,force:1})||burst(tg.x,tg.y-12,'#d6f08a',24,1.4);});return true;}
  return false;}
function setsFaint(tg,src){
  const side=tg.team;
  if(tg.fx.sting&&!tg.summon)zone(tg,{c:tg.c,r:tg.r},1,4,'#9fd16a',z=>{for(const o of inZone(z,1-side))addStatus(o,'poison',1,tg);if(!SIM.on)pfx('Smoke_Green',hexXY(z.c,z.r).x,hexXY(z.c,z.r).y-8,{sc:.8});});
  if(tg.fx.queen&&!battle.queenDone&&!tg.summon){battle.queenDone=1;const c0=tg.c,r0=tg.r;schedule(.6,()=>{if(occupied(c0,r0))return;const nu=mkUnit(tg.u.root);const c=makeCombatant(nu,side,c0,r0,battle.trs[side],1);c.summon=1;units.push(c);if(!SIM.on){ensure(nu.dex);pfx('Egg_Sea_Hatch',c.x,c.y-12,{sc:.8,force:1});sayAt(c,'Queen\'s Call!','#d6f08a');}});}
  if(tg.fx.cheeseHeal&&!tg.summon){const a=alive(side).sort((x,y)=>hdist(x,tg)-hdist(y,tg))[0];if(a){heal(a,a.maxHp*tg.fx.cheeseHeal);if(!SIM.on)burst(a.x,a.y-12,'#ffd34d',10,.7);}}
  if(tg.spotlight===1&&battle.under&&!battle.under.dead&&tierAt(side,'Showstoppers')>=3){const u2=battle.under;u2.dmg+=.125;u2.as*=1.1;u2.spotlight=1;if(!SIM.on){texts.push({x:u2.x,y:u2.y-40,txt:'The show goes on!',col:'#ffe27a',life:1.4,label:1});pfx('Encore_Spotlight_Front',u2.x,u2.y-20,{sc:.8,force:1});}}
  if(tg.fx.lakeBond&&!tg.summon){const n=D[tg.dex].n;for(const a of alive(side)){if(n==='Uxie')gainMana(a,20);if(n==='Mesprit')a.regen+=.01;if(n==='Azelf')a.dmg+=.16;}}
  if(tg.fx.slime&&tg.revive===0&&tg.dead)0;
}
function setsRevived(tg){// Phantasm puddles
  if(tg.fx.slime)zone(tg,{c:tg.c,r:tg.r},0,4,'#a35bd6',z=>{for(const o of inZone(z,1-tg.team))addStatus(o,'poison',1,tg);});
  if(tg.fx.ooze&&!tg.oozed&&tg.u){tg.oozed=1;const spot=nbrs(tg.c,tg.r).find(h=>h.r>=0&&h.r<ROWS&&h.c>=0&&h.c<COLS&&!occupied(h.c,h.r));
    if(spot){const nu=mkUnit(tg.u.root);nu.dex=tg.dex;nu.star=tg.u.star;const c=makeCombatant(nu,tg.team,spot.c,spot.r,battle.trs[tg.team],.4);c.summon=1;c.fx=Object.assign({},c.fx,{revive:0,ooze:0});c.revive=0;units.push(c);if(!SIM.on){ensure(nu.dex);pfx('Gastro_Acid_Ball',c.x,c.y-10,{sc:1,force:1});sayAt(c,'Ooze Tide!','#c8a0ff');}}}
  if(tg.hoohRez&&D[tg.dex].n.startsWith('Suicune'))for(const a of alive(tg.team))cureStatus(a);
  if(tg.jurassic){tg.atk*=1.5;tg.spa*=1.5;tg.def*=1.5;tg.res*=1.5;tg.as*=1.5;sayAt(tg,'Jurassic!','#e8c48a');}
}
function setsKill(src,tg){
  if(src.fx.rloot){battle.rl=(battle.rl||0)+src.fx.rloot;if(!SIM.on)texts.push({x:src.x,y:src.y-34,txt:'+Loot',col:'#ff6b6b',life:.9});}
  if(src.fx.skyRe&&!src.dead)schedule(.2,()=>skyDive(src,3));
  if(src.fx.maus&&(battle.maus||0)<4&&!src.summon){battle.maus=(battle.maus||0)+1;const spot=nbrs(src.c,src.r).find(h=>h.r>=0&&h.r<ROWS&&h.c>=0&&h.c<COLS&&!occupied(h.c,h.r));
    if(spot&&MODE.lines[924]){const nu=mkUnit(924);const c=makeCombatant(nu,src.team,spot.c,spot.r,battle.trs[src.team],1);c.summon=1;units.push(c);if(!SIM.on){ensure(924);pfx('Puff_Yellow',c.x,c.y-8,{sc:.8,force:1});sayAt(c,'Maushold!','#ffd34d');}}}
  if(battle.mark&&battle.mark[src.team]===tg&&src.fx.gang){const gs=membersOf(src.team,'Street Gang');
    if(src.fx.gangSteal)for(const g of gs){g.dmg+=.1;g.as*=1.1;}
    if(src.fx.turf&&src.team===0&&run&&(battle.gangG||0)<3){battle.gangG=(battle.gangG||0)+1;run.gold++;if(!SIM.on)texts.push({x:src.x,y:src.y-30,txt:'+₽1',col:'#ffd34d',life:1});}
    battle.mark[src.team]=null;if(!SIM.on)pfx('Lock_On',src.x,src.y-14,{sc:.7,force:1});}
  if(src.fx.turf&&src.team===0&&run)run.turf=(run.turf||0)+1;
  if(src.fx.beastBoost){const k=['atk','spa','def','res'].sort((a,b)=>src[b]-src[a])[0];src[k]*=1+src.fx.beastBoost;}
  if(src.u&&src.team===0&&src.fx.belts)src.u.kos=(src.u.kos||0)+1;
}
function setsEnd(win){
  if(!run)return[];const msgs=[],ct=battle.trs?battle.trs[0]:{},T=k=>tierOf(k,ct[k]||0);
  // Team Rocket loot
  let loot=Math.floor(battle.rl||0);if(!win&&T('Team Rocket')>=2)loot+=3;if(loot){run.rloot=(run.rloot||0)+loot;msgs.push(`+${loot} Loot`);}
  // Fae Folk wishes
  if(win&&T('Fae Folk')){const w=T('Fae Folk')>=3?2:1;run.wishes=(run.wishes||0)+w;msgs.push(`+${w} Wish`);}
  // run-long growth from sets
  for(const c of units){if(c.team!==0||c.summon||!c.u)continue;const u=c.u;u.g=u.g||{};
    if(c.fx.shellGrow&&!c.dead){u.g.def=(u.g.def||0)+2;u.g.res=(u.g.res||0)+2;}
    if(win&&c.spotlight===1&&T('Showstoppers')>=4)u.fame=(u.fame||0)+1;}
  if(win&&T('Ranch')>=4)run.herd=(run.herd||0)+1;
  if(win&&T('Living Stone')>=4)run.sediment=Math.min(30,(run.sediment||0)+1);
  if(battle.kaijuGiant&&T('Kaiju')>=4)run.kaijuHp=(run.kaijuHp||0)+1;
  if(win&&T('Pseudo')>=3)run.apexWins=(run.apexWins||0)+1;
  return msgs;
}
/* per-unit fx that depend on the run (applied in makeCombatant for your side) */
function setsCombatant(c,E){if(c.team!==0||!run||!c.u)return;const u=c.u;
  if(E.herd&&run.herd){c.maxHp*=1+.01*run.herd;c.hp=c.maxHp;c.def*=1+.01*run.herd;}
  if(E.kaiju&&run.kaijuHp){c.maxHp*=1+.01*run.kaijuHp;c.hp=c.maxHp;}
  if(E.turf&&run.turf)c.as*=1+.01*run.turf;
  if(E.sediment&&run.sediment){E.stone=(E.stone||0)+.01*run.sediment;E.stoneFast=1;}
  if(u.fame)c.dmg+=.01*u.fame;
  if(u.isStar)c.isStar=1;
  if(E.eat&&u.g){if(u.g.eatHp){c.maxHp*=1+u.g.eatHp;c.hp=c.maxHp;}if(u.g.eatDmg)c.dmg+=u.g.eatDmg;if(u.g.eatHeal)c.healAmp+=u.g.eatHeal;}
  if(u.dayB){c.maxHp*=1+u.dayB;c.hp=c.maxHp;c.dmg+=u.dayB;}
}

/* ================= Big Eaters ================= */
const FRONTC=new Set(['Vanguard','Juggernaut','Bruiser']),SUPC=new Set(['Mystic','Medic']);
const eatRole=u=>{const c=kitOf(u.dex).cls;return FRONTC.has(c)?'front':SUPC.has(c)?'sup':'dmg';};
function bigEaterTier(){if(!run)return 0;return tierOf('Big Eaters',countTraits(Object.values(run.board))['Big Eaters']||0);}
function eatGain(u,v,k){u.g=u.g||{};const r=eatRole(u);if(r==='front')u.g.eatHp=(u.g.eatHp||0)+.03*v*k;else if(r==='dmg')u.g.eatDmg=(u.g.eatDmg||0)+.02*v*k;else u.g.eatHeal=(u.g.eatHeal||0)+.03*v*k;}
function bigEatersFeed(eater,v){const T=bigEaterTier();if(!T||!unitSets(eater).includes('Big Eaters'))return;const share=SETS['Big Eaters'].m[T-1].eat;
  eatGain(eater,v,1);if(T>=2){eater.g.eatSize=(eater.g.eatSize||0)+v;}
  for(const o of allOwned())if(o!==eater&&unitSets(o).includes('Big Eaters')){eatGain(o,v,share);if(T>=2)o.g.eatSize=(o.g.eatSize||0)+v*share;}}

/* ================= Between rounds ================= */
function setsFloor(){
  if(!run)return;const ct=countTraits(Object.values(run.board)),T=k=>tierOf(k,ct[k]||0);run.setRound=(run.setRound||0)+1;
  // Daycare
  if(run.daycare&&run.daycare.length){for(const u of run.daycare){u.dayB=Math.min(.2,(u.dayB||0)+.01);u.dayN=(u.dayN||0)+1;
    const proud=T('Nursery')>=4,egg=proud?u.dayN%2===0:Math.random()<.25;if(egg){run.eggsOut=(run.eggsOut||0)+1;const first=MODE.lines[u.root]?u.root:u.dex;if(addCopy(first)){if(!SIM.on)toast(`The Daycare found an Egg! It hatched into ${D[first].n}.`);}}}}
  // Garden plots grow
  if(run.plots)for(const p of run.plots)p.st=Math.min(2,(p.st||0)+1);
  if(T('Garden')>=4&&run.setRound%4===0&&run.plots){for(const p of run.plots)if(p.st>=2){if(Math.random()<.5)run.gold+=3;else run.bag.length<BAGMAX&&run.bag.push({k:randComp(),mut:[]});}if(!SIM.on)toast('Harvest! Your Bloom plots paid out.');}
  // Rocket HQ restock
  run.hq=null;
  // Roulette spins
  oddSpins();
  // Bottomless snack
  if(T('Big Eaters')>=4&&run.setRound%3===0){const r=pick(MODE.byCost[0]);if(r&&addCopy(r)&&!SIM.on)toast(`A snack wandered in: ${D[r].n}.`);}
  // Mythical Event and Revival Lab: once per Act
  const act=actOf();if(T('Mythical')>=3&&run.mythAct!==act)run.mythReady=1;
  if(T('Fossil')>=2&&run.labAct!==act)run.labReady=1;
}
function oddSpins(){if(!run)return;const ct=countTraits(Object.values(run.board)),T=tierOf('Oddballs',ct.Oddballs||0);for(const u of allOwned()){if(!unitSets(u).includes('Oddballs')){u.spins=null;continue;}
  const n=T>=2?2:1;u.spins=Array.from({length:n},()=>rollSpin(T>=3));}}
const SPINS=[{k:'dmg',n:'Power',d:'+30% damage'},{k:'as',n:'Speed',d:'+30% Attack Speed'},{k:'hp',n:'Bulk',d:'+40% max HP'},{k:'pp',n:'PP',d:'+40 PP'}];
const SPINS_X=[{k:'copy',n:'Mimic',d:'copies the strongest enemy\'s set bonuses'},{k:'full',n:'Full PP',d:'starts with a full PP bar'},{k:'all',n:'Jackpot',d:'+60% to everything'}];
const rollSpin=x=>x&&Math.random()<.25?pick(SPINS_X).k:pick(SPINS).k;
function applySpins(c){const u=c.u;if(!u||!u.spins||!c.fx.odd)return;for(const s of u.spins){
  if(s==='dmg')c.dmg+=.3;else if(s==='as')c.as*=1.3;else if(s==='hp'){c.maxHp*=1.4;c.hp*=1.4;}else if(s==='pp')c.mana=Math.min(c.maxMana||c.mana+40,c.mana+40);
  else if(s==='full')c.mana=c.maxMana;else if(s==='all'){c.maxHp*=1.6;c.hp*=1.6;c.dmg+=.6;c.as*=1.6;}
  else if(s==='copy'){const top=alive(1-c.team).sort((a,b)=>b.maxHp-a.maxHp)[0];if(top){for(const k of unitSets(top.u)){const ti=tierOf(k,(battle.trs[1-c.team]||{})[k]||0);if(ti&&SETS[k].m)addE(c.fx,SETS[k].m[ti-1]);}}}
  if(!SIM.on){const S=[...SPINS,...SPINS_X].find(x=>x.k===s);texts.push({x:c.x,y:c.y-36,txt:S.n+'!',col:'#ffb3f0',life:1.2,label:1});}}}

/* ================= Dojo ================= */
const beltOf=u=>{const k=(u&&u.kos)||0;return k>=30?3:k>=15?2:k>=5?1:0;};
const BELT=['White','Yellow','Brown','Black'],BELTCOL=['#f4f4f4','#ffd34d','#a5703c','#222'];
const TECH={counter:{n:'Counter',d:'reflects 30% of melee damage back at the attacker'},focus:{n:'Focus Punch',d:'after 2 seconds, its next attack deals triple damage'},bulk:{n:'Bulk Up',d:'+2% damage for every hit it takes (up to +40%)'}};
function techStart(c,F){const u=c.u,ts=[u.tech||'focus'];if(F.tech>=2&&beltOf(u)>=3&&u.tech2)ts.push(u.tech2);
  for(const t of ts){if(t==='counter')c.fx.meleeDr=(c.fx.meleeDr||0),c.fx.reflect=Math.max(c.fx.reflect||0,.3);if(t==='bulk')c.tech='bulk';
    if(t==='focus')schedule(2,()=>{if(c.dead)return;c.focusReady=1;if(!SIM.on)pfx('Focus_Energy',c.x,c.y-14,{sc:.7,force:1});});}}

/* ================= Unit-menu actions from sets ================= */
UNIT_ACTS.push(u=>unitSets(u).includes('Showstoppers')&&tierOf('Showstoppers',countTraits(Object.values(run.board)).Showstoppers||0)?['star',u.isStar?'Star: yes (tap to unset)':'Make Star']:null);
UNIT_ACTS.push(u=>{const t=tierOf('Nursery',countTraits(Object.values(run.board)).Nursery||0);return t>=2&&!Object.values(run.board).includes(u)?['day','Leave at the Daycare']:null;});
function setUnitAct(u,k){
  if(k==='star'){const was=u.isStar;for(const o of allOwned())o.isStar=0;u.isStar=was?0:1;if(!SIM.on)toast(u.isStar?`${nameOf(u)} is your Star!`:'No Star picked: your sturdiest Showstopper takes the stage.');renderUI();}
  if(k==='day')daycareDrop(u);
}
function daycareSlots(){const t=tierOf('Nursery',countTraits(Object.values(run.board)).Nursery||0);return t>=3?2:t>=2?1:0;}
function daycareDrop(u){run.daycare=run.daycare||[];if(run.daycare.length>=daycareSlots()){toast('The Daycare is full.');return;}removeUnit(u);run.daycare.push(u);if(!SIM.on){sfx('star',100);toast(`${nameOf(u)} is staying at the Daycare.`);}renderUI();}
function daycareTake(i){const u=run.daycare[i];if(!u)return;const slot=run.bench.findIndex((x,j)=>!x&&j<BENCH_N);if(slot<0){toast('Your bench is full.');return;}run.daycare.splice(i,1);run.bench[slot]=u;renderUI();}
