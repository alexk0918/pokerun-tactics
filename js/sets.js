"use strict";
/* PokéRun Tactics — sets (traits), ability passives and kit tuning.
   Effect keys are read by makeCombatant() / combat hooks in game.js. */

/* ---------- Sets ----------
   cat: type | class | style | region
   bp: breakpoints (distinct Pokémon needed)
   m: effects for members, per tier;  t: effects for the whole team, per tier;  x: special flags per tier
   d: description per tier */
const SETS={
  /* Types (from the Pokémon's current types). Each one changes how the fight plays, not just stats. */
  Normal:{cat:'type',bp:[2,4,6,8],m:[{hpP:.1,adapt:.02},{hpP:.2,adapt:.035},{hpP:.3,adapt:.05},{hpP:.45,adapt:.07}],t:[{},{},{},{adapt:.03}],d:'<b>Adaptable:</b> Normal Pokémon gain +10% / +20% / +30% / +45% max HP, plus +2% / +3.5% / +5% / +7% damage and max HP for every different type on your field. At 8, your whole team gains +3% damage and max HP per type on your field.'},
  Fire:{cat:'type',bp:[2,4,6,8],m:[{burn:.01,burnAmp:.15},{burn:.015,burnAmp:.3},{burn:.02,burnAmp:.5},{burn:.03,burnAmp:.8}],x:[{},{},{},{burnPerm:1}],d:'<b>Kindling:</b> Fire Pokémon\'s attacks and moves add 2 / 3 / 4 / 6 Burn, and they deal +15% / +30% / +50% / +80% damage to burning enemies. At 8, <b>Wildfire</b>: Burn on enemies never wears off.'},
  Water:{cat:'type',bp:[2,4,6,8],m:[{mana:10},{mana:20},{mana:30},{mana:45}],x:[{tide:10},{tide:20},{tide:30,tideDmg:.04},{tide:45,tideDmg:.1}],d:'<b>High Tide:</b> Water Pokémon start with +10 / +20 / +30 / +45 PP. Every 5 seconds a wave rolls in and they gain 10 / 20 / 30 / 45 PP. At 6, the wave also deals 4% max HP as special damage to every enemy. At 8, <b>Tsunami</b>: the wave deals 10% max HP instead.'},
  Grass:{cat:'type',bp:[2,4,6,8],m:[{regen:.015,fullDmg:.15},{regen:.025,fullDmg:.3},{regen:.04,fullDmg:.5},{regen:.06,fullDmg:.8}],t:[{},{},{},{regen:.02}],d:'<b>Photosynthesis:</b> Grass Pokémon restore 1.5% / 2.5% / 4% / 6% max HP per second and deal +15% / +30% / +50% / +80% damage while above 75% HP. At 8, <b>Overgrowth</b>: your whole team restores 2% max HP per second.'},
  Electric:{cat:'type',bp:[2,4,6,8],m:[{as:.1,zap:40},{as:.2,zap:80},{as:.3,zap:140},{as:.45,zap:240}],t:[{},{},{as:.1},{as:.25}],d:'<b>Static:</b> Electric Pokémon gain +10% / +20% / +30% / +45% Attack Speed, and every 3rd attack zaps up to 3 enemies for 40 / 80 / 140 / 240 special damage. At 6, your whole team gains +10% Attack Speed. At 8, <b>Overcharge</b>: +25% instead.'},
  Ice:{cat:'type',bp:[2,4,6,8],m:[{chillSt:1,vsChill:.1},{chillSt:2,vsChill:.2},{chillSt:3,vsChill:.35},{chillSt:5,vsChill:.5,freezeCap:1}],d:'<b>Frostbite:</b> Ice Pokémon\'s attacks add 1 / 2 / 3 / 5 Chill (−4% Defense and Sp. Def per stack), and they deal +10% / +20% / +35% / +50% damage to chilled enemies. At 8, <b>Absolute Zero</b>: an enemy that reaches 10 Chill freezes solid for 2s (once every 6s).'},
  Fighting:{cat:'type',bp:[2,4,6,8],m:[{as:.1,challenge:.3},{as:.2,challenge:.5},{as:.3,challenge:.8},{as:.45,challenge:1.2,killHeal:.3}],d:'<b>Challenger:</b> Fighting Pokémon gain +10% / +20% / +30% / +45% Attack Speed. When their target faints, they dash to the nearest enemy and gain +30% / +50% / +80% / +120% Attack Speed for 3s. At 8, <b>Undisputed</b>: every takedown also heals them for 30% max HP.'},
  Poison:{cat:'type',bp:[2,4,6,8],m:[{poisonHit:.01,ab:.1},{poisonHit:.015,ab:.2},{poisonHit:.025,ab:.35},{poisonHit:.04,ab:.5,poisonDmg:1}],x:[{},{},{plague:1},{plague:1}],d:'<b>Toxin:</b> Poison Pokémon\'s attacks add 2 / 3 / 5 / 8 Poison, and their moves deal +10% / +20% / +35% / +50% damage. At 6, when a poisoned enemy faints, half its Poison spreads to every enemy within 1 hex. At 8, <b>Venom Tide</b>: their Poison deals double damage.'},
  Ground:{cat:'type',bp:[2,4,6,8],m:[{def:15},{def:30},{def:50},{def:80}],x:[{quake:{every:8,pct:.05,stun:.5}},{quake:{every:6,pct:.1,stun:.6}},{quake:{every:4,pct:.1,stun:.8}},{quake:{every:3,pct:.15,stun:1}}],d:'<b>Earthquake:</b> Ground Pokémon gain +15 / +30 / +50 / +80 Defense. Every 8 / 6 / 4 / 3 seconds, your sturdiest Ground Pokémon stomps: enemies within 2 hexes take physical damage equal to 5% / 10% / 10% / 15% of its max HP and are stunned for 0.5 / 0.6 / 0.8 / 1s.'},
  Flying:{cat:'type',bp:[2,4,6,8],m:[{dodge:.1,dodgeAS:.05},{dodge:.2,dodgeAS:.1},{dodge:.3,dodgeAS:.15},{dodge:.45,dodgeAS:.25}],t:[{},{},{},{dodge:.1}],d:'<b>Tailwind:</b> Flying Pokémon dodge 10% / 20% / 30% / 45% of attacks, and every dodge grants +5% / +10% / +15% / +25% Attack Speed for the rest of the battle. At 8, <b>Jet Stream</b>: your whole team dodges 10% of attacks.'},
  Psychic:{cat:'type',bp:[2,4,6,8],m:[{ab:.1,mindLink:10},{ab:.25,mindLink:15},{ab:.4,mindLink:25},{ab:.6,mindLink:40}],t:[{},{},{},{mana:20}],d:'<b>Mind Link:</b> Psychic moves deal +10% / +25% / +40% / +60% damage. Whenever a Psychic Pokémon uses its move, every other Psychic ally gains 10 / 15 / 25 / 40 PP. At 8, <b>Hive Mind</b>: your whole team starts with +20 PP.'},
  Bug:{cat:'type',bp:[2,4,6,8],m:[{as:.15},{as:.25,swarm:1},{as:.4,swarm:2},{as:.6,swarm:2,dmg:.25}],d:'<b>Swarm:</b> Bug Pokémon gain +15% / +25% / +40% / +60% Attack Speed. At 4, the first Bug to faint each battle leaves behind a 1★ copy of its first stage that keeps fighting. At 6, every Bug that faints does, and the copies gain +30% Attack Speed. At 8, <b>Infestation</b>: Bugs also deal +25% damage.'},
  Rock:{cat:'type',bp:[2,4,6,8],m:[{shieldP:.15},{shieldP:.25},{shieldP:.4},{shieldP:.65,stunImm:1}],x:[{rocks:.03},{rocks:.05},{rocks:.1},{rocks:.15}],d:'<b>Stealth Rock:</b> Rock Pokémon start with a shield of 15% / 25% / 40% / 65% max HP. Enemies take 3% / 5% / 10% / 15% of their max HP every time they move to a new hex. At 8, <b>Bedrock</b>: Rock Pokémon can\'t be stunned.'},
  Ghost:{cat:'type',bp:[2,4,6,8],m:[{ls:.1,haunt:.15},{ls:.2,haunt:.25},{ls:.3,haunt:.4},{ls:.45,haunt:.6,revive:.4}],d:'<b>Haunt:</b> Ghost Pokémon heal for 10% / 20% / 30% / 45% of damage dealt. When one faints, it lashes out at enemies within 1 hex for special damage equal to 15% / 25% / 40% / 60% of its max HP. At 8, <b>Undying</b>: each Ghost comes back once with 40% HP.'},
  Dragon:{cat:'type',bp:[2,4,6,8],m:[{hpP:.1,dmg:.1,hoard:1},{hpP:.2,dmg:.15,hoard:1},{hpP:.3,dmg:.25,hoard:1},{hpP:.5,dmg:.45,hoard:1,stunImm:1}],d:'<b>Dragon\'s Hoard:</b> Dragon Pokémon gain +10% / +20% / +30% / +50% max HP and +10% / +15% / +25% / +45% damage. Every battle you win with Dragon active adds a permanent Hoard stack: +1% damage for all your Dragons (up to +40%). At 8, <b>Dragon Lord</b>: Dragons can\'t be stunned.'},
  Dark:{cat:'type',bp:[2,4,6,8],m:[{crit:.15,execute:.15},{crit:.25,execute:.3},{crit:.35,execute:.5,killPP:30},{crit:.5,critD:.3,execute:.8,killPP:50}],d:'<b>Pursuit:</b> Dark Pokémon gain +15% / +25% / +35% / +50% crit chance and deal +15% / +30% / +50% / +80% damage to enemies below half HP. At 6, each takedown restores 30 PP. At 8, <b>Night Terror</b>: takedowns restore 50 PP and their crits deal +30% damage.'},
  Steel:{cat:'type',bp:[2,4,6,8],m:[{dr:.1},{dr:.15,dotImm:1},{dr:.25,dotImm:1,reflect:.15},{dr:.4,dotImm:1,reflect:.3,stunImm:1}],d:'<b>Steelworker:</b> Steel Pokémon take 10% / 15% / 25% / 40% less damage. At 4, they\'re immune to burn and poison. At 6, they reflect 15% of damage taken from attacks back as physical damage. At 8, <b>Fortress</b>: they reflect 30% and can\'t be stunned.'},
  Fairy:{cat:'type',bp:[2,4,6,8],m:[{res:10,fairyHeal:.15},{res:25,fairyHeal:.25},{res:40,fairyHeal:.4},{res:60,fairyHeal:.6}],t:[{},{},{},{ohShield:.25}],d:'<b>Charm:</b> Fairy Pokémon gain +10 / +25 / +40 / +60 Sp. Def, and their moves heal your most injured ally for 15% / 25% / 40% / 60% of the damage dealt. At 8, <b>Fairy Ring</b>: healing past full HP on any of your Pokémon becomes a shield (up to 25% max HP).'},

  /* Classes (what the Pokémon's kit is built to do) */
  Vanguard:{cat:'class',bp:[2,4,6,8],m:[{shieldP:.15,def:10,res:10},{shieldP:.25,def:20,res:20,taunt:1},{shieldP:.4,def:35,res:35,taunt:1},{shieldP:.65,def:60,res:60,taunt:1}],t:[{},{},{},{dr:.1}],d:'Vanguards start with a shield of 15% / 25% / 40% / 65% max HP and +10 / +20 / +35 / +60 Defense and Sp. Def. <b>At 4, they taunt:</b> enemies standing next to a Vanguard must attack it. At 8, <b>Phalanx</b>: your whole team takes 10% less damage.',icon:'🛡'},
  Juggernaut:{cat:'class',bp:[2,4,6,8],m:[{hpP:.2,dr:.05},{hpP:.35,dr:.1,stunImm:1},{hpP:.6,dr:.15,stunImm:1},{hpP:1,dr:.25,stunImm:1,aImm:1}],d:'Juggernauts gain +20% / +35% / +60% / +100% max HP and take 5% / 10% / 15% / 25% less damage. <b>At 4, they can\'t be stunned.</b> At 8, <b>Unstoppable</b>: they\'re also immune to status conditions.'},
  Bruiser:{cat:'class',bp:[2,4,6,8],m:[{hpP:.15,sitrus:.15},{hpP:.3,sitrus:.2},{hpP:.5,sitrus:.3},{hpP:.8,sitrus:.45,lowDmg:.3}],t:[{hpF:60},{hpF:120},{hpF:220},{hpF:400}],d:'Your team gains +60 / +120 / +220 / +400 max HP. Bruisers gain +15% / +30% / +50% / +80% more, and <b>heal 15% / 20% / 30% / 45% max HP</b> the first time they drop below half. At 8, <b>Second Wind</b>: below half HP, Bruisers deal +30% damage.'},
  Striker:{cat:'class',bp:[2,4,6,8],m:[{as:.15,critEvery:1},{as:.3,crit:.1,critEvery:1},{as:.5,crit:.2,critEvery:1},{as:.8,crit:.35,critD:.3,critEvery:1}],d:'Strikers gain +15% / +30% / +50% / +80% Attack Speed and +0% / +10% / +20% / +35% crit chance. <b>Every 3rd basic attack is a guaranteed critical hit.</b> At 8, <b>Killing Edge</b>: their crits deal +30% damage.'},
  Mystic:{cat:'class',bp:[2,4,6,8],m:[{spaP:.1,ppCut:.1},{spaP:.25,ppCut:.2},{spaP:.4,ppCut:.3},{spaP:.65,ppCut:.45}],t:[{res:10},{res:20},{res:35},{res:60}],d:'Your team gains +10 / +20 / +35 / +60 Sp. Def. Mystics gain +10% / +25% / +40% / +65% Sp. Atk, and <b>their moves cost 10% / 20% / 30% / 45% less PP.</b>'},
  Artillery:{cat:'class',bp:[2,4,6],m:[{ab:.2,splash:.15},{ab:.4,splash:.3},{ab:.8,splash:.6,range:1}],d:'Artillery moves deal +20% / +40% / +80% damage and splash 15% / 30% / 60% harder. At 6, <b>Long Barrel</b>: Artillery gain +1 range.'},
  Combo:{cat:'class',bp:[2,4,6],m:[{hitsB:1,as:.1,hitPP:2},{hitsB:2,as:.2,hitPP:3},{hitsB:4,as:.35,hitPP:5}],d:'Combo Pokémon\'s multi-hit moves strike +1 / +2 / +4 extra times, they gain +10% / +20% / +35% Attack Speed, and <b>every hit of a multi-hit move restores 2 / 3 / 5 PP.</b>'},
  Trickster:{cat:'class',bp:[2,4,6,8],m:[{ailP:.2,dodge:.1,blink:1},{ailP:.4,dodge:.15,blink:1},{ailP:.65,dodge:.25,blink:1},{ailP:1,dodge:.35,blink:1,stPow:.5}],d:'<b>Shadow Step:</b> at the start of battle, Tricksters leap behind the enemy back line. Their moves are 20% / 40% / 65% / 100% more likely to inflict status, and they dodge 10% / 15% / 25% / 35% of attacks. At 8, <b>Hex Masters</b>: every status they apply adds 50% more stacks.'},
  Medic:{cat:'class',bp:[2,4,6,8],m:[{healAmp:.25},{healAmp:.5},{healAmp:.9},{healAmp:1.5}],t:[{regen:.005},{regen:.01,ohShield:.15},{regen:.015,ohShield:.25},{regen:.025,ohShield:.4}],d:'Your team restores 0.5% / 1% / 1.5% / 2.5% max HP per second. Medics heal 25% / 50% / 90% / 150% more. <b>At 4, healing past full HP becomes a shield</b> (up to 15% / 25% / 40% max HP).'},

  /* Kinship sets: alternate forms and legendary groups. They count different members, not lines,
     so two Lycanroc forms or three Eeveelutions from the same Eevee line all count. */
  'Wolf Pack':{cat:'style',kin:1,bp:[2,3],m:[{as:.15,dmg:.15},{as:.25,dmg:.25,crit:.15,killPP:15}],d:'<b>Pack Hunt:</b> Lycanroc forms (Midday, Midnight, Dusk) fight as a pack: +15% / +25% Attack Speed and damage. With all three, +15% crit chance and each knockout gives that Lycanroc 15 PP.'},
  'Dance Troupe':{cat:'style',kin:1,bp:[2,4],m:[{mana:20,ab:.15},{mana:40,ab:.35,as:.15}],d:'<b>Revelation Dance:</b> Oricorio styles (Baile, Pom-Pom, Pa\'u, Sensu) start with +20 / +40 PP and their moves deal +15% / +35% damage. With all four, +15% Attack Speed.'},
  'Cloak Society':{cat:'style',kin:1,bp:[2,3],m:[{def:20,res:20,shieldP:.1},{def:40,res:40,shieldP:.2}],d:'<b>Cloaked:</b> Wormadam cloaks (Plant, Sandy, Trash) gain +20 / +40 Defense and Sp. Def and start with a 10% / 20% max HP shield.'},
  'Two Styles':{cat:'style',kin:1,bp:[2],m:[{dmg:.25,crit:.15}],d:'<b>Martial Masters:</b> Single Strike and Rapid Strike Urshifu together: both gain +25% damage and +15% crit chance.'},
  'Duet':{cat:'style',kin:1,bp:[2],m:[{ab:.25,mana:20}],d:'<b>Punk Duet:</b> Amped and Low Key Toxtricity together: both start with +20 PP and their moves deal +25% damage.'},
  'Eeveelutions':{cat:'style',kin:1,bp:[2,3,4],m:[{hpP:.1,dmg:.1},{hpP:.2,dmg:.2},{hpP:.35,dmg:.35}],d:'<b>Adaptability:</b> different Eeveelutions gain +10% / +20% / +35% max HP and damage.'},
  'Tao Trio':{cat:'style',kin:1,bp:[2,3],m:[{dmg:.15,hpP:.15},{dmg:.3,hpP:.3}],d:'<b>Yin and Yang:</b> Reshiram, Zekrom and Kyurem gain +15% / +30% max HP and damage. A fused Kyurem counts as both itself and its partner.'},
  'Weather Trio':{cat:'style',kin:1,bp:[2,3],m:[{ab:.15},{ab:.3,hpP:.2}],d:'<b>Super-Ancient:</b> Groudon, Kyogre and Rayquaza\'s moves deal +15% / +30% damage (+20% max HP with all three).'},
  'Island Guardians':{cat:'style',kin:1,bp:[2,4],m:[{ab:.15,regen:.005},{ab:.3,regen:.01}],d:'<b>Guardian Deities:</b> the Tapus\' moves deal +15% / +30% damage and they restore 0.5% / 1% max HP per second.'},
  'Ruinous Treasures':{cat:'style',kin:1,bp:[2,4],m:[{dmg:.15},{dmg:.3,ruin2:1}],d:'<b>Ruin:</b> the Treasures of Ruin deal +15% / +30% damage. With all four, their ruinous auras are twice as strong.'},
  'Swords of Justice':{cat:'style',kin:1,bp:[2,4],m:[{crit:.15,as:.1},{crit:.3,as:.25}],d:'<b>Justice:</b> Cobalion, Terrakion, Virizion and Keldeo gain +15% / +30% crit chance and +10% / +25% Attack Speed.'},
  'Lake Guardians':{cat:'style',kin:1,bp:[3],m:[{mana:30,ab:.25}],d:'<b>Being of Knowledge, Emotion and Willpower:</b> with Uxie, Mesprit and Azelf together, each starts with +30 PP and its move deals +25% damage.'},
  'Legendary Beasts':{cat:'style',kin:1,bp:[3],m:[{as:.3,dmg:.2}],d:'<b>Burned Tower:</b> with Raikou, Entei and Suicune together, each gains +30% Attack Speed and +20% damage.'},
  'Ancient':{cat:'style',kin:1,bp:[2,4],m:[{atkP:.1,spaP:.1},{atkP:.25,spaP:.25}],x:[{},{weather:'sun'}],d:'<b>Area Zero, past:</b> ancient Paradox Pokémon gain +10% / +25% Attack and Sp. Atk. With 4, every battle starts in harsh sun (Protosynthesis).'},
  'Future':{cat:'style',kin:1,bp:[2,4],m:[{as:.1,dmg:.1},{as:.25,dmg:.25}],d:'<b>Area Zero, future:</b> future Paradox Pokémon gain +10% / +25% Attack Speed and damage.'},
  'Ultra Beast':{cat:'style',kin:1,bp:[2,4],m:[{killHeal:.1},{killHeal:.2,dmg:.2}],d:'<b>Ultra Space:</b> Ultra Beasts heal 10% / 20% max HP on every knockout (+20% damage at 4).'},
  /* Trait sets: Pokédex body types, egg groups and categories. Any type, any generation. */
  Titans:{cat:'style',trait:1,bp:[2,4],m:[{hpP:.25,titan:1},{hpP:.6,titan:2,titanDmg:.08}],d:'<b>Earthshaker:</b> lines that grow to 150 kg or more gain +25% / +60% max HP, and each one stomps when battle starts, stunning adjacent enemies for 1 / 2s. At 4, the stomp also hits them for 8% of the Titan\'s max HP.'},
  'Sky Squadron':{cat:'style',trait:1,bp:[2,4],m:[{sky:2},{sky:3,dmg:.2}],d:'<b>Air Raid:</b> winged lines take off when battle starts (they can\'t be hit for 1s), then dive onto the farthest enemy and strike it. At 4, the dive also stuns for 0.8s and they deal +20% damage.'},
  Kaiju:{cat:'style',trait:1,bp:[2,4],m:[{kaiju:.07},{kaiju:.14,kaijuGiant:3}],d:'<b>Rampage:</b> Monster egg group Pokémon grow with every move they use: +7% / +14% max HP and damage each cast, for the battle. At 4, their third cast makes them giant (+50% max HP).'},
  Phantasms:{cat:'style',trait:1,bp:[2,4],m:[{revive:.35,hideRevive:2},{revive:.6,hideRevive:2,ghostDodge:.25}],d:'<b>Shapeless:</b> Amorphous egg group Pokémon melt into a puddle the first time they would faint: untargetable for 2s, then they reform with 35% / 60% HP. At 4, once reformed they dodge 25% of attacks.'},
  'Living Stone':{cat:'style',trait:1,bp:[2,4],m:[{stone:.12},{stone:.3,stoneNoCrit:1}],d:'<b>Stone Shell:</b> Mineral egg group Pokémon start with a stone shield of 12% / 30% max HP that rebuilds every 4s. At 4, they can\'t be critically hit while the shell holds.'},
  Showstoppers:{cat:'style',trait:1,bp:[2,4],m:[{show:1},{show:3}],d:'<b>Spotlight:</b> your Human-Like egg group Pokémon with the most HP takes the Spotlight: +25% damage and Attack Speed, and every move it uses gives your whole team 5 PP. At 4, the top two share the Spotlight at +60%.'},
  'Deep Sea':{cat:'style',trait:1,bp:[2,4],m:[{deep:.25},{deep:.5,deepX:.15}],d:'<b>Pressure of the Deep:</b> Water 2 and Water 3 egg group Pokémon deal +25% / +50% damage to enemies below half HP. At 4, they finish off any enemy they hit below 15% HP.'},
  'Fae Folk':{cat:'style',trait:1,bp:[2,4],m:[{},{}],x:[{wish:.1},{wish:.22}],d:'<b>Wish:</b> while Fairy egg group Pokémon are on your team, every 4s a random ally makes a Wish and heals 10% / 22% of its max HP 2s later.'},
  'Mouse Brigade':{cat:'style',trait:1,bp:[2,4],m:[{mouse:.1},{mouse:.15,cheese:1}],d:'<b>Scurry:</b> mice and other rodents gain +10% / +15% Attack Speed for every other rodent on the field. At 4, each knockout by a rodent finds ₽1 of cheese (up to ₽3 a battle).'},
  'Fox Spirits':{cat:'style',trait:1,bp:[2,3],m:[{fox:.25},{fox:.4}],d:'<b>Illusion:</b> when battle starts, each Fox Pokémon conjures a decoy of itself with 25% / 40% of its max HP that draws enemy attacks.'},
  Nursery:{cat:'style',trait:1,bp:[1,2,3],m:[{nursery:1},{nursery:1,grow:1},{nursery:1,grow:1,cheer:.1}],d:'<b>Daycare:</b> lines that hatch from a baby Pokémon (Pichu, Cleffa, Riolu, Munchlax…) take half damage while an ally stands next to them. At 2, each one that survives a battle grows a little stronger for the run (+10 HP, +1 Attack and Sp. Atk). At 3, they cheer on adjacent allies (+10% damage).'},
  'Team Rocket':{cat:'style',trait:1,bp:[2,4],m:[{rocket:.5},{rocket:1,blast:.15}],d:'<b>Prepare for trouble:</b> Team Rocket\'s Pokémon have a 50% / 100% chance to steal ₽1 on each knockout (up to ₽3 a battle). At 4, a Rocket Pokémon that faints blasts off in an explosion for 15% of its max HP to adjacent enemies.'},
  Partner:{cat:'style',bp:[2,3],m:[{hpP:.1,dmg:.1,friend:1},{hpP:.2,dmg:.2,friend:2}],d:'<b>Friendship:</b> starters, Pikachu and Eevee gain +10% / +20% max HP and damage. Each battle a Partner Pokémon fights while this is active, it gains 1 Friendship (2 at 3), forever: +1.5% max HP and damage per point, up to 20. At 10 Friendship it <b>hangs on for you</b>, surviving its first fainting blow each battle. At 2, you also receive the Partner Ribbon, gear for one Partner Pokémon.'},
  Fossil:{cat:'style',bp:[2,3],m:[{revive:.3},{revive:.5}],d:'<b>Ancient Power:</b> the first time a Fossil Pokémon faints, it revives with 30% / 50% HP. At 2, you receive the Ancient Amber, gear that makes its Fossil wearer come back even stronger.'},
  Pseudo:{cat:'style',bp:[2,3],m:[{hpP:.15,dmg:.1},{hpP:.25,dmg:.2}],d:'<b>Apex:</b> pseudo-legendary lines gain +15% / +25% max HP and +10% / +20% damage. At 2, you receive the Apex Fang: whoever wears it becomes the Apex, with +35% max HP, damage and Attack Speed. At 3, the fang turns Radiant (+60%).'},

};
const SETCAT_LABEL={type:'Type',class:'Class',style:'Trait',region:'Region'};
const CLASSCOL={Vanguard:'#5b7fa8',Juggernaut:'#7a6a55',Bruiser:'#b5532f',Striker:'#c9961d',Mystic:'#7a5ad0',Artillery:'#c0444f',Combo:'#2f8f86',Trickster:'#8a3f9a',Medic:'#4d9a3a'};
const STYLECOL='#24303d';

/* Styles that come from real abilities (any of the species' abilities) */
const KIN={
  'Wolf Pack':[745,10126,10152],'Dance Troupe':[741,10123,10124,10125],'Cloak Society':[413,10004,10005],'Two Styles':[892,10191],'Duet':[849,10184],
  'Eeveelutions':[134,135,136,196,197,470,471,700],'Tao Trio':[643,644,646,10022,10023],'Weather Trio':[382,383,384],'Island Guardians':[785,786,787,788],
  'Ruinous Treasures':[1001,1002,1003,1004],'Swords of Justice':[638,639,640,647],'Lake Guardians':[480,481,482],'Legendary Beasts':[243,244,245],
  'Ancient':[984,985,986,987,988,989,1005,1009,1020,1021],'Future':[990,991,992,993,994,995,1006,1010,1022,1023],'Ultra Beast':[793,794,795,796,797,798,799,803,804,805,806],
};
// a fused Kyurem counts as the Tao member it absorbed too
const kinDex=u=>{const d=typeof shownDex==='function'?shownDex(u):u.dex,o=[d];if(u.fuse&&u.fuse.p)o.push(u.fuse.p.dex);return o;};
const STYLE_ABIL={
  Sun:['drought','chlorophyll','solar-power','flower-gift','leaf-guard','harvest','protosynthesis','orichalcum-pulse','desolate-land'],
  Rain:['drizzle','swift-swim','rain-dish','hydration','dry-skin','primordial-sea'],
  Sandstorm:['sand-stream','sand-rush','sand-force','sand-veil','sand-spit'],
  Snow:['snow-warning','slush-rush','ice-body','snow-cloak','ice-scales'],
  Intimidator:['intimidate','pressure','unnerve','as-one-glastrier','as-one-spectrier'],
};
// every Pokémon has its types, its class and at most ONE other set (its origin). When several fit, the first one here wins:
// kinship and lineage first, then the rarer Pokédex traits, then the weather and Intimidator abilities
const ORIGIN_ORDER=['Partner','Fossil','Pseudo','Fox Spirits','Nursery','Mouse Brigade','Fae Folk','Titans','Kaiju','Showstoppers','Phantasms','Team Rocket','Living Stone','Deep Sea','Sky Squadron'];
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
  'sand-veil':A('Dodges 10% of attacks (25% in a sandstorm).',{dodge:.1,wDodge:{sand:.15}}),'snow-cloak':A('Dodges 10% of attacks (25% in snow).',{dodge:.1,wDodge:{snow:.15}}),
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
  'speed-boost':A('Gains +5% Attack Speed every 2 seconds.',{speedBoost:.05}),'steam-engine':A('Gains +5% Attack Speed every 2 seconds.',{speedBoost:.05}),'quick-feet':A('Gains +5% Attack Speed every 2 seconds.',{speedBoost:.05}),
  moxie:A('Each takedown grants +10% Attack.',{moxie:.1}),'beast-boost':A('Each takedown grants +10% Attack and Sp. Atk.',{moxie:.1}),'chilling-neigh':A('Each takedown grants +10% Attack.',{moxie:.1}),'grim-neigh':A('Each takedown grants +10% Sp. Atk.',{moxie:.1}),'soul-heart':A('Each takedown on the field grants +10% Sp. Atk.',{moxie:.1}),'supreme-overlord':A('Each takedown grants +10% Attack.',{moxie:.1}),
  defiant:A('When hit by a move, gains +10% Attack (stacks).',{enrage:.1}),competitive:A('When hit by a move, gains +10% Sp. Atk (stacks).',{enrage:.1}),justified:A('When hit by a move, gains +10% Attack (stacks).',{enrage:.1}),'anger-point':A('When critically hit, gains +40% Attack.',{angerPoint:.4}),stamina:A('When hit, gains +3 Defense (stacks).',{stamina:3}),rattled:A('When hit by a move, gains +10% Attack Speed (stacks).',{rattled:.1}),berserk:A('Below half HP, gains +30% Sp. Atk.',{lowSpa:.3}),
  'weak-armor':A('When hit by a physical move, loses 5 Defense but gains +10% Attack Speed.',{weakArmor:1}),
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
  healer:A('Adjacent allies restore 1% max HP per second.',{aura:{regen:.01}}),'friend-guard':A('Adjacent allies take 10% less damage.',{aura:{dr:.1}}),battery:A('Adjacent allies deal +10% move damage.',{aura:{ab:.1}}),'power-spot':A('Adjacent allies deal +10% move damage.',{aura:{ab:.1}}),'flower-veil':A('Adjacent allies are immune to status.',{aura:{aImm:1}}),plus:A('Adjacent allies gain +10% Attack Speed.',{aura:{as:.1}}),minus:A('Adjacent allies gain +10% Attack Speed.',{aura:{as:.1}}),
  drought:A('Summons harsh sunlight at battle start.',{weather:'sun'}),drizzle:A('Summons rain at battle start.',{weather:'rain'}),'sand-stream':A('Summons a sandstorm at battle start.',{weather:'sand'}),'snow-warning':A('Summons snow at battle start.',{weather:'snow'}),'orichalcum-pulse':A('Summons harsh sunlight. +20% Attack in sun.',{weather:'sun',wAtk:{sun:.2}}),'primordial-sea':A('Summons heavy rain.',{weather:'rain'}),'desolate-land':A('Summons extreme sunlight.',{weather:'sun'}),
  chlorophyll:A('+15% Attack Speed (+50% in sun).',{as:.15,wAS:{sun:.35}}),'swift-swim':A('+15% Attack Speed (+50% in rain).',{as:.15,wAS:{rain:.35}}),'sand-rush':A('+15% Attack Speed (+50% in a sandstorm).',{as:.15,wAS:{sand:.35}}),'slush-rush':A('+15% Attack Speed (+50% in snow).',{as:.15,wAS:{snow:.35}}),
  'solar-power':A('+15% Sp. Atk (+45% in sun).',{spaP:.15,wSpa:{sun:.3}}),'sand-force':A('+10% damage (+30% in a sandstorm).',{dmg:.1,wDmg:{sand:.2}}),protosynthesis:A('For the first 8 seconds: +30% damage (all battle in sun).',{boostStart:.3,wBoost:'sun'}),'quark-drive':A('For the first 8 seconds: +30% damage.',{boostStart:.3}),
  'cloud-nine':A('Cancels weather. +10 Sp. Def.',{noWeather:1,res:10}),'air-lock':A('Cancels weather. +10 Sp. Def.',{noWeather:1,res:10}),
  stench:A('Attacks have a 10% chance to make the target flinch.',{flinch:.1}),
  'poison-touch':A('Attacks have a 25% chance to poison.',{hitAil:{ail:5,c:.25}}),corrosion:A('Attacks have a 20% chance to badly poison.',{hitAil:{ail:5,c:.2}}),merciless:A('Always crits poisoned targets.',{merciless:1}),'toxic-debris':A('When hit by a physical move, poisons the attacker.',{touch:{ail:5,c:.5}}),'poison-puppeteer':A('Its poison also confuses (stuns 0.4s).',{hitAil:{ail:5,c:.2}}),
  'liquid-ooze':A('Drain moves used against it hurt the attacker instead. +10 Sp. Def.',{res:10}),
  'run-away':A('Dodges 10% of attacks.',{dodge:.1}),telepathy:A('Dodges 10% of attacks.',{dodge:.1}),anticipation:A('Dodges 10% of attacks.',{dodge:.1}),frisk:A('Dodges 5% of attacks and has +10% crit chance.',{dodge:.05,crit:.1}),'tangled-feet':A('Dodges 10% of attacks.',{dodge:.1}),illusion:A('Dodges the first 2 attacks it takes.',{dodgeN:2}),
  synchronize:A('When inflicted with status, the attacker suffers it too. +10 Sp. Def.',{res:10}),trace:A('+10% damage.',{dmg:.1}),download:A('+15% Attack and Sp. Atk.',{atkP:.15,spaP:.15}),protean:A('+15% move damage.',{ab:.15}),libero:A('+15% move damage.',{ab:.15}),rivalry:A('+10% damage.',{dmg:.1}),klutz:A('+10% Attack.',{atkP:.1}),moody:A('+10% damage and Attack Speed.',{dmg:.1,as:.1}),contrary:A('+12 Defense and Sp. Def.',{def:12,res:12}),
  'shield-dust':A('Immune to status.',{aImm:1}),overcoat:A('Immune to weather and status from melee attackers.',{noWeatherChip:1,res:8}),bulletproof:A('Takes 20% less special damage.',{assault:.2}),soundproof:A('Takes 15% less damage from moves.',{cloak:.15}),damp:A('+10 Defense and Sp. Def.',{def:10,res:10}),
  'heavy-metal':A('+20 Defense.',{def:20}),'light-metal':A('+15% Attack Speed.',{as:.15}),galvanize:A('Moves deal +20% damage.',{ab:.2}),transistor:A('Electric moves deal +25% damage.',{typeBoost:{Electric:.25}}),'dragons-maw':A('Dragon moves deal +25% damage.',{typeBoost:{Dragon:.25}}),steelworker:A('Steel moves deal +25% damage.',{typeBoost:{Steel:.25}}),'rocky-payload':A('Rock moves deal +25% damage.',{typeBoost:{Rock:.25}}),'water-bubble':A('Water moves deal +30% damage; immune to burn.',{typeBoost:{Water:.3},aImm:1}),
  'electric-surge':A('Electric moves deal +20% damage for allies.',{typeBoost:{Electric:.2}}),'psychic-surge':A('Psychic moves deal +20% damage.',{typeBoost:{Psychic:.2}}),'grassy-surge':A('Restores 1.5% max HP per second.',{regen:.015}),'misty-surge':A('Immune to status. +10 Sp. Def.',{aImm:1,res:10}),
  'as-one-glastrier':A('At battle start, nearby enemies lose 15% Attack. Takedowns grant +10% Attack.',{intim:.15,moxie:.1}),'as-one-spectrier':A('Nearby enemies gain 20% less PP. Takedowns grant +10% Sp. Atk.',{pressure:.2,moxie:.1}),
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
