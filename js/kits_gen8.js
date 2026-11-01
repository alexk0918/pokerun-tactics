/* Generation VIII signature kits (Galar lines, plus Applin's and Duraludon's later branches). */

// Skwovet line: stuffs its cheeks, then belly-flops
kit({ids:[819,820],role:'Hoarder',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.1],names:['Stuff Cheeks','Body Slam'],mvType:'Normal'},
  staged(seq(B.heal(.6,{who:'self'}),B.hit(.9,{proj:false})),{d:c=>`Stuffs its cheeks with a berry: heals ${HPT(c,.2)} and gains +20 <span class="s-def">Defense</span> for the battle. Then it Body Slams the target for ${DT(c,1.3)}, stunning it for 0.5s.`,
    cast(c,tg){heal(c,c.maxHp*.2);c.def+=20;if(!SIM.on)burst(c.x,c.y-14,'#ff9a5c',8,.6);schedule(.3,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.3);stun(tg,.5);boom(tg,'#e8c890',2);});}}));

// Rookidee line: Corviknight's Body Press hits harder the tougher it is
kit({ids:[821,822,823],role:'Armored Raven',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[55,65,75],start:25,pf:[.8,.95,1.1],names:['Peck','Pluck','Body Press'],mvType:'Flying',
  tail:(c,i)=>i===2?'<b>Mirror Armor:</b> immune to Intimidate and Defense shred.':'',begin(c,i){if(i===2)c.fx.clear=1;}},
  staged(B.hit(1.1,{dash:1}),seq(B.shield(.15),B.hit(1.1,{proj:false})),{d:c=>`Braces with Iron Defense (+20 <span class="s-def">Defense</span> for the battle) and a shield of ${HPT(c,.2)}, then Body Presses the target and every enemy next to it for <b class="s-atk">${Math.round(r5(c.base*1.2)+(c.def+20)*4)}</b> <span class="sc">(${r5(c.base*1.2)} + 400% <span class="s-def">Defense</span>)</span> physical damage.`,
    cast(c,tg){c.def+=20;c.shield+=c.maxHp*.2;schedule(.3,()=>{if(c.dead||tg.dead)return;for(const q of[tg,...near(tg,1)])damage(c,q,(r5(c.base*1.2)+c.def*4)*(q===tg?1:.7),{ab:1,cat:'phys',type:'Fighting'});boom(tg,'#c0c8d8',3);});}}));

// Blipbug line: Orbeetle screens the team, then confuses
kit({ids:[824,825,826],role:'Cosmic Watcher',cls:'Mystic',cat:'spec',range:3,mana:[55,65,75],pf:[.8,.95,1.1],names:['Struggle Bug','Confusion','Psychic'],mvType:'Psychic'},
  staged(B.hit(.9,{fx:{weaken:.1}}),B.hit(1.1,{fx:{conf:1}}),seq(B.shield(.12,{who:'team'}),B.blast(1.2,{r:1,fx:{conf:2},col:'#ff9be6'}))));

// Nickit line: snarls and pickpockets PP
kit({ids:[827,828],role:'Fox Thief',cls:'Trickster',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Snarl','Foul Play'],mvType:'Dark',tail:(c,i)=>i?'<b>Thief:</b> its Snarl steals 15 PP from each enemy it hits (half of it for itself).':''},
  staged(B.cone(.9,{say:'Snarls',fx:{weaken:.15}}),{d:c=>`Snarls through the target and enemies up to 2 hexes behind it for ${DT(c,1.1)} (70% to the others), lowering their <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by 15% for 4s and stealing 15 PP from each.`,
    cast(c,tg){B.cone(1.1,{depth:2,col:'#a06bd6',fx:{weaken:.15}}).cast(c,tg,1);for(const q of[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=2&&hdist(f,c)>=hdist(tg,c))]){const s=Math.min(q.mana||0,15);q.mana-=s;gainMana(c,s/2);}}}));

// Gossifleur line: cotton spores slow the enemy while Eldegoss heals
kit({ids:[829,830],role:'Cotton Healer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Leafage','Cotton Spore'],mvType:'Grass'},
  staged(seq(B.heal(.7),B.hit(.8)),seq(B.heal(.4,{who:'team'}),B.control({slow:[.3,3]},{n:3,say:'Scatters Cotton Spores over'}))));

// Wooloo line: a woolly charge
kit({ids:[831,832],role:'Woolly Charger',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.1],names:['Tackle','Body Slam'],mvType:'Normal',tail:(c,i)=>i?'<b>Fluffy:</b> takes 20% less physical damage.':'',begin(c,i){if(i)c.fx.physDr=(c.fx.physDr||0)+.2;}},
  staged(seq(B.shield(.15),B.hit(1,{proj:false})),seq(B.shield(.25,{def:15}),B.hit(1.2,{dash:1,fx:{stun:.6}}))));

// Chewtle line: Jaw Lock holds both of them in place
kit({ids:[833,834],role:'Snapping Turtle',cls:'Juggernaut',cat:'phys',range:1,mana:[55,70],start:20,pf:[.85,1.1],names:['Bite','Jaw Lock'],mvType:'Water',tail:(c,i)=>i?'<b>Strong Jaw:</b> bites deal +20% damage (included).':''},
  staged(B.hit(1.1,{proj:false,fx:{flinch:.3}}),{d:c=>`Clamps onto the target with Jaw Lock for ${DT(c,1.5*1.2)}: neither can act for 1.2s, and the target's <span class="s-def">Defense</span> drops by 15.`,
    cast(c,tg){if(tg.dead)return;hitAb(c,tg,1.5*1.2);stun(tg,1.2);c.busy=Math.max(c.busy,1.2);tg.def=Math.max(0,tg.def-15);boom(tg,'#6ab0ff',2);}}));

// Yamper line: Wild Charge onto the back line
kit({ids:[835,836],role:'Spark Hound',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.85,1.1],names:['Spark','Wild Charge'],mvType:'Electric',tail:(c,i)=>i?'<b>Strong Jaw:</b> +10% damage.':'',begin(c,i){if(i)c.dmg+=.1;}},
  staged(B.hit(1,{dash:1,fx:{para:1}}),{d:c=>`Wild Charges the farthest enemy for ${DT(c,1.5)}, adding 2 Paralysis; takes 5% of its own <span class="s-hp">max HP</span> in recoil.`,
    cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5);addStatus(t,'para',2,c);hurt(c,c.maxHp*.05,null);boom(t,'#ffe14d',2);});}}));

// Rolycoly line: a coal engine that speeds up when hit by Fire or Water
kit({ids:[837,838,839],role:'Coal Furnace',cls:'Juggernaut',cat:'spec',range:1,mana:[60,70,80],start:20,pf:[.8,.95,1.1],names:['Rapid Spin','Rock Blast','Tar Shot'],mvType:'Rock',
  tail:(c,i)=>i===2?'<b>Steam Engine:</b> each Fire or Water move that hits it raises its <span class="s-as">Attack Speed</span> by 10% (up to 3 times).':''},
  {...staged(B.nova(.8,{say:'Spins',r:1}),seq(B.shield(.15),B.barrage(3,.5,{what:'rocks'})),seq(B.shield(.2),B.blast(1.1,{at:'cluster',r:1,arc:1,what:'burning tar',col:'#5a4030',fx:{burn:.015,slow:[.3,3]}}))),
   hitBy(c,src,o){if(c.kit.si===2&&o&&(o.type==='Fire'||o.type==='Water')&&(c.steam||0)<3){c.steam=(c.steam||0)+1;c.as*=1.1;}}});

// Applin and its branches: Flapple, Appletun, Dipplin and Hydrapple
kit({ids:[840],role:'Apple Nest',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:60,start:25,pf:.85,names:['Astonish'],mvType:'Grass'},seq(B.shield(.2),B.hit(.8,{proj:false,fx:{flinch:.3}})));
kit({ids:[841],role:'Apple Wing',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.1,names:['Grav Apple'],mvType:'Grass',tail:()=>'<b>Hustle:</b> +10% damage.',begin(c){c.dmg+=.1;}},
  {d:c=>`Flies over the weakest enemy and drops a Grav Apple for ${DT(c,1.5)}, lowering its <span class="s-def">Defense</span> by 15.`,
   cast(c,tg){const t=pickT(c,tg,'weak');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5);t.def=Math.max(0,t.def-15);boom(t,'#c8ff7a',2);});}});
kit({ids:[842],role:'Apple Pie',cls:'Juggernaut',cat:'spec',range:1,mana:70,start:20,pf:1.05,names:['Apple Acid'],mvType:'Grass',tail:()=>'<b>Ripen:</b> its Apple Acid also heals it for 15% of its max HP.'},
  {d:c=>`Splashes Apple Acid over every enemy within 1 hex for ${DT(c,1.1)}, lowering their <span class="s-def">Sp. Def</span> by 15, and heals ${HPT(c,.15)}.`,
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1.1);q.res=Math.max(0,q.res-15);}heal(c,c.maxHp*.15);if(!SIM.on)ring(c.x,c.y-6,'#c8ff7a');}});
kit({ids:[1011],role:'Syrup Cup',cls:'Trickster',cat:'spec',range:3,mana:60,pf:.95,names:['Syrup Bomb'],mvType:'Grass'},B.blast(1,{at:'cluster',r:1,arc:1,what:'a Syrup Bomb',col:'#ff7a5c',fx:{slow:[.3,3]}}));
kit({ids:[1019],role:'Apple Hydra',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.15,names:['Fickle Beam'],mvType:'Dragon',tail:()=>'<b>Regenerator:</b> restores 1% max HP per second.',begin(c){c.regen+=.01;}},
  {d:c=>`Its heads fire a Fickle Beam through the target that hits every enemy in a line for ${DT(c,1.3)}. 30% of the time all its heads join in for double damage.`,
   cast(c,tg){const all=Math.random()<.3;B.beam(1.3*(all?2:1),{col:all?'#ffd34d':'#7fe3a8'}).cast(c,tg,0);if(all&&!SIM.on)texts.push({x:c.x,y:c.y-34,txt:'All heads!',col:'#ffd34d',life:1,label:1});}});

// Silicobra line: spits sand when hit
kit({ids:[843,844],role:'Sand Coil',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.1],names:['Sand Tomb','Coil'],mvType:'Ground',tail:(c,i)=>i?'<b>Sand Spit:</b> the first time it\'s hit each battle, a sandstorm starts (if there\'s no weather).':''},
  {...staged(B.zone(.25,{say:'Traps the target in swirling sand',r:1,dur:4,col:'#d8c08a'}),seq(B.shield(.2),B.ramp({atk:.15}),B.zone(.2,{say:'Then it traps the target in sand',r:1,dur:4,col:'#d8c08a'}))),
   hitBy(c){if(c.kit.si&&!c.spit){c.spit=1;setWeather(c,'sand');}}});

// Cramorant: dives for prey, then spits it at whoever hits it
kit({ids:[845],role:'Gulp Diver',cls:'Artillery',cat:'spec',range:3,mana:65,pf:1.05,names:['Surf'],mvType:'Water',tail:()=>'<b>Gulp Missile:</b> after each dive it holds a catch; the next enemy that hits it gets it spat back for heavy damage (an Arrokuda lowers Defense, a Pikachu paralyzes).'},
  {d:c=>`Dives into the biggest group of enemies with Surf for ${DT(c,1.2)} (70% to adjacent enemies) and comes back up with a catch in its mouth.`,
   cast(c,tg){B.blast(1.2,{at:'cluster',r:1,col:'#5ab8ff'}).cast(c,tg,0,{});c.gulp=Math.random()<.5?'arro':'pika';},
   hitBy(c,src){if(!c.gulp||!src||src.team===c.team||src.dead)return;const g=c.gulp;c.gulp=null;schedule(.05,()=>{if(src.dead)return;damage(c,src,V(c,1.3),{ab:1,cat:'spec',refl:1,type:g==='pika'?'Electric':'Water'});if(g==='pika')addStatus(src,'para',3,c);else src.def=Math.max(0,src.def-15);if(!SIM.on)texts.push({x:c.x,y:c.y-30,txt:'Gulp Missile!',col:'#5ab8ff',life:1,label:1});});}});

// Arrokuda line: a spear-fast strike on the weakest enemy
kit({ids:[846,847],role:'Spear Fish',cls:'Striker',cat:'phys',range:1,mana:[55,60],start:25,pf:[.85,1.1],names:['Aqua Jet','Liquidation'],mvType:'Water',tail:(c,i)=>i?'<b>Propeller Tail:</b> its move always reaches its chosen target.':''},
  staged(B.hit(1.1,{dash:1}),B.hit(.75,{n:2,dash:1,to:'weak',fx:{shred:10}})));

// Toxel line: Toxtricity plays Overdrive
kit({ids:[848,849],role:'Punk Rocker',cls:'Artillery',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Acid','Overdrive'],mvType:'Electric',tail:(c,i)=>i?'<b>Punk Rock:</b> its sound move deals +20% damage (included).':''},
  staged(B.hit(1,{fx:{psn:.01}}),B.cone(1.3*1.2,{say:'Plays a deafening Overdrive',depth:2,col:'#c86bd6',fx:{para:1,psn:.01}})));

// Sizzlipede line: Fire Lash strips armor
kit({ids:[850,851],role:'Fire Centipede',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Ember','Fire Lash'],mvType:'Fire',tail:(c,i)=>i?'<b>Flash Fire:</b> Fire moves heal it instead of hurting it.':'',begin(c,i){if(i){c.fx.immune=[...(c.fx.immune||[]),'Fire'];c.fx.absorb=1;}}},
  staged(B.hit(1,{fx:{burn:.01}}),B.hit(1.4,{proj:false,fx:{burn:.015,shred:15}})));

// Clobbopus line: Octolock squeezes the target's defenses away
kit({ids:[852,853],role:'Octo Grappler',cls:'Juggernaut',cat:'phys',range:1,mana:[55,70],start:20,pf:[.85,1.1],names:['Rock Smash','Octolock'],mvType:'Fighting'},
  staged(B.hit(1.1,{proj:false,fx:{shred:10}}),{d:c=>`Wraps the target in Octolock for ${DT(c,1.2)}: it's held for 1s, then loses 8 <span class="s-def">Defense</span> and Sp. Def every half second for 3s.`,
    cast(c,tg){if(tg.dead)return;hitAb(c,tg,1.2);stun(tg,1);for(let k=1;k<=6;k++)schedule(k*.5,()=>{if(!tg.dead){tg.def=Math.max(0,tg.def-8);tg.res=Math.max(0,tg.res-8);}});boom(tg,'#ff8a5c',2);}}));

// Sinistea line: Shell Smash trades defense for speed and power
kit({ids:[854,855],role:'Haunted Tea',cls:'Mystic',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Astonish','Shell Smash'],mvType:'Ghost'},
  staged(B.hit(1,{fx:{flinch:.3}}),{d:c=>`Shell Smashes: −10 <span class="s-def">Defense</span> and Sp. Def, +15% <span class="s-spa">Sp. Atk</span> and <span class="s-as">Attack Speed</span> for the battle (stacks). Then it fires a Shadow Ball for ${DT(c,1.3)}, lowering Sp. Def by 10.`,
    cast(c,tg){c.def=Math.max(0,c.def-10);c.res=Math.max(0,c.res-10);c.spa*=1.15;c.as*=1.15;fire(c,tg,'#8a6cd6',()=>{hitAb(c,tg,1.3);tg.res=Math.max(0,tg.res-10);},{size:5});}}));

// Hatenna line: Hatterene's Dazzling Gleam floods the back line
kit({ids:[856,857,858],role:'Silent Witch',cls:'Mystic',cat:'spec',range:3,mana:[55,65,80],pf:[.8,.95,1.15],names:['Confusion','Psybeam','Dazzling Gleam'],mvType:'Fairy',tail:(c,i)=>i===2?'<b>Magic Bounce:</b> immune to status conditions.':'',begin(c,i){if(i===2)c.fx.aImm=1;}},
  staged(B.hit(1,{fx:{conf:1}}),B.beam(1,{what:'a Psybeam',col:'#ff9be6',fx:{conf:1}}),B.blast(1.3,{at:'cluster',r:2,what:'a Dazzling Gleam',col:'#ffb3e6',splash:.6})));

// Impidimp line: a prankster turned brute
kit({ids:[859,860,861],role:'Bulk Imp',cls:'Juggernaut',cat:'phys',range:1,mana:[55,65,75],start:20,pf:[.8,.95,1.1],names:['Fake Out','Bulk Up','Spirit Break'],mvType:'Dark'},
  staged(B.hit(.9,{proj:false,fx:{stun:.5}}),seq(B.ramp({atk:.1}),B.hit(1.1,{proj:false})),seq(B.shield(.2),B.hit(1.5,{proj:false,fx:{weaken:.2}}))));

// Sirfetch'd: Meteor Assault, then it rests
kit({ids:[865],role:'Leek Knight',cls:'Striker',cat:'phys',range:1,mana:70,pf:1.15,names:['Meteor Assault'],mvType:'Fighting',tail:()=>'<b>Super Luck:</b> +20% critical-hit chance.',begin(c){c.crit+=.2;}},
  {d:c=>`Charges the strongest enemy with Meteor Assault for ${DT(c,2.1)} (can crit), then catches its breath for 1s.`,
   cast(c,tg){const t=pickT(c,tg,'strong');dashTo(c,t,true,.22);schedule(.25,()=>{if(c.dead||t.dead)return;hitAb(c,t,2.1,{cr:.1});boom(t,'#f0e0a0',3);c.busy=Math.max(c.busy,1);});}});

// Milcery line: Alcremie decorates an ally
kit({ids:[868,869],role:'Sweet Maker',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Draining Kiss','Decorate'],mvType:'Fairy'},
  staged(seq(B.hit(.9),B.heal(.6)),{d:c=>`Heals the most injured ally for ${HT(c,1)}, then Decorates the ally with the highest <span class="s-atk">Attack</span> or <span class="s-spa">Sp. Atk</span>: +25% damage for 5s.`,
    cast(c,tg){B.heal(1).cast(c,tg,1);const a=alive(c.team).filter(a=>a!==c).sort((x,y)=>Math.max(y.atk,y.spa)-Math.max(x.atk,x.spa))[0];if(a){a.dmg+=.25;schedule(5,()=>{a.dmg-=.25;});if(!SIM.on)burst(a.x,a.y-16,'#ffb3e6',12,.8);}}}));

// Falinks: six troopers, one formation
kit({ids:[870],role:'Troop Formation',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1,names:['No Retreat'],mvType:'Fighting'},
  {d:c=>`${B.shield(.2).d(c,0)} The first time each battle it declares No Retreat: +15% <span class="s-atk">Attack</span>, <span class="s-def">Defense</span> and <span class="s-as">Attack Speed</span>. Then all six troopers jab the target for ${DT(c,.3)} each.`,
   cast(c,tg){B.shield(.2).cast(c,tg,0);if(!c.noRet){c.noRet=1;c.atk*=1.15;c.def*=1.15;c.as*=1.15;}for(let k=0;k<6;k++)schedule(.2+k*.08,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,.3);if(!SIM.on)spark(tg.x+rnd(-6,6),tg.y-12,'#ffb36b',5);}});}});

// Pincurchin: a spiny battery
kit({ids:[871],role:'Spiny Urchin',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:65,start:25,pf:1,names:['Spike Cannon'],mvType:'Electric',tail:()=>'<b>Electric Surge:</b> starts battles with +20 PP. Its spines hurt melee attackers.',begin(c){c.helmet+=.04;gainMana(c,20);}},
  B.nova(1,{say:'Fires spines in every direction',r:1,col:'#ffe14d',fx:{para:2}}));

// Snom line: Frosmoth dances, and its scales blunt special attacks
kit({ids:[872,873],role:'Frost Moth',cls:'Mystic',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Powder Snow','Quiver Dance'],mvType:'Ice',tail:(c,i)=>i?'<b>Ice Scales:</b> takes 25% less special damage.':'',begin(c,i){if(i)c.assault+=.25;}},
  staged(B.hit(1,{fx:{chill:1}}),seq(B.ramp({spa:.1,as:.1}),B.blast(1.2,{at:'cluster',r:1,what:'an Ice Beam',col:'#bff0ff',fx:{chill:2}}))));

// Stonjourner: a Power Spot for its neighbours
kit({ids:[874],role:'Henge Stone',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:25,pf:1.05,names:['Heavy Slam'],mvType:'Rock',tail:()=>'<b>Power Spot:</b> adjacent allies\' moves deal +15% damage.',begin(c){for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)a.abm+=.15;}},
  seq(B.shield(.2),B.hit(1.3,{proj:false,fx:{stun:.6}})));

// Eiscue: Icicle Crash (Ice Face comes from its ability)
kit({ids:[875],role:'Ice Face',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:65,start:25,pf:1,names:['Icicle Crash'],mvType:'Ice'},
  seq(B.shield(.15),B.hit(1.3,{proj:false,fx:{chill:3,flinch:.3}})));

// Indeedee: a butler who keeps everyone topped up
kit({ids:[876],role:'Butler',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1,names:['Psychic Surge'],mvType:'Psychic',tail:()=>'<b>Psychic Surge:</b> allies start battles with +10 PP.',begin(c){for(const a of alive(c.team))if(a!==c)gainMana(a,10);}},
  seq(B.heal(.9),B.hit(.9,{fx:{conf:1}})));

// Morpeko: Aura Wheel (Hunger Switch comes from its ability)
kit({ids:[877],role:'Hangry',cls:'Striker',cat:'phys',range:1,mana:55,start:20,pf:1.1,names:['Aura Wheel'],mvType:'Electric'},
  {d:c=>`Rolls an Aura Wheel into the target for ${DT(c,1.4)} (Electric when full, Dark when hangry) and gains +10% <span class="s-as">Attack Speed</span> for the battle.`,
   cast(c,tg){if(tg.dead)return;damage(c,tg,V(c,1.4),{ab:1,cat:'phys',type:c.dex===877?'Electric':'Dark'});c.as*=1.1;boom(tg,c.dex===877?'#ffe14d':'#8a6cd6',2);}});

// Cufant line: Heavy Slam hurts lighter foes more
kit({ids:[878,879],role:'Copper Elephant',cls:'Juggernaut',cat:'phys',range:1,mana:[60,75],start:20,pf:[.85,1.1],names:['Rock Smash','Heavy Slam'],mvType:'Steel',tail:(c,i)=>i?'<b>Sheer Force:</b> +15% damage.':'',begin(c,i){if(i)c.dmg+=.15;}},
  staged(B.hit(1.1,{proj:false,fx:{shred:10}}),{d:c=>`Heavy Slams the target and every enemy next to it for ${DT(c,1.4)} (70% to the others), +50% to enemies with less max HP than Copperajah, stunning them for 0.5s.`,
    cast(c,tg){if(tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,1.4*(q===tg?1:.7)*(q.maxHp<c.maxHp?1.5:1));stun(q,.5);}boom(tg,'#d08a5a',3);}}));

// Galar fossils: Bolt Beak and Fishious Rend hit twice as hard on the first cast
const firstStrike=c=>c.casts<=1?2:1;
kit({ids:[880],role:'Fossil Bolt',cls:'Striker',cat:'phys',range:1,mana:60,start:30,pf:1.05,names:['Bolt Beak'],mvType:'Electric'},
  {d:c=>`Pecks the target with Bolt Beak for ${DT(c,1.3)}, adding 2 Paralysis. The first cast each battle deals double damage.`,cast(c,tg){if(tg.dead)return;hitAb(c,tg,1.3*firstStrike(c));addStatus(tg,'para',2,c);boom(tg,'#ffe14d',2);}});
kit({ids:[881],role:'Fossil Frost',cls:'Juggernaut',cat:'phys',range:1,mana:65,start:25,pf:1,names:['Freeze-Dry'],mvType:'Ice'},
  seq(B.shield(.15),B.nova(1,{say:'Exhales Freeze-Dry',r:1,col:'#bff0ff',fx:{chill:2,para:1}})));
kit({ids:[882],role:'Fossil Jaws',cls:'Striker',cat:'phys',range:1,mana:60,start:30,pf:1.05,names:['Fishious Rend'],mvType:'Water',tail:()=>'<b>Strong Jaw:</b> +10% damage.',begin(c){c.dmg+=.1;}},
  {d:c=>`Darts to the weakest enemy and bites with Fishious Rend for ${DT(c,1.3)}. The first cast each battle deals double damage.`,
   cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.3*firstStrike(c));boom(t,'#5ab8ff',2);});}});
kit({ids:[883],role:'Fossil Glacier',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:65,start:25,pf:1,names:['Fishious Rend'],mvType:'Water'},
  {d:c=>`${B.shield(.2).d(c,0)} Then it bites the target with Fishious Rend for ${DT(c,1.1)} (double on its first cast each battle), adding 2 Chill.`,
   cast(c,tg){B.shield(.2).cast(c,tg,0);schedule(.2,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.1*firstStrike(c));addStatus(tg,'chill',2,c);});}});

// Duraludon line: an alloy tower; Archaludon's Electro Shot charges (instantly in rain)
kit({ids:[884,1018],role:'Alloy Tower',cls:'Artillery',cat:'spec',range:3,mana:[65,80],pf:[.95,1.15],names:['Flash Cannon','Electro Shot'],mvType:'Steel',tail:(c,i)=>i?'<b>Stamina:</b> each hit it takes gives +2 Defense (up to +40).':''},
  {...staged(B.beam(1.2,{what:'a Flash Cannon',col:'#d8e0e8',fx:{sdef:10}}),{d:c=>`Charges for 1s (instant in rain), raising its <span class="s-spa">Sp. Atk</span> by 15% for the battle, then fires an Electro Shot through every enemy in a line for ${DT(c,1.6)}.`,
    cast(c,tg){const go=()=>{if(c.dead||tg.dead)return;c.spa*=1.15;B.beam(1.6,{col:'#ffe14d'}).cast(c,tg,1);};if(battle.weather==='rain')go();else{c.busy=Math.max(c.busy,1.05);schedule(1,go);}}}),
   hitBy(c){if(c.kit.si&&(c.stam||0)<40){c.stam=(c.stam||0)+2;c.def+=2;}}});

// --- Galar legends ---
kit({ids:[888],role:'Hero of Many Battles',cls:'Striker',cat:'phys',range:1,mana:70,pf:1.2,names:['Behemoth Blade'],mvType:'Steel',tail:()=>'<b>Intrepid Sword:</b> +20% <span class="s-atk">Attack</span> at the start of battle.',begin(c){c.atk*=1.2;}},
  {d:c=>`Leaps onto the strongest enemy with Behemoth Blade for ${DT(c,2)}, ignoring its shield (double against Dynamaxed and giant foes).`,
   cast(c,tg){const t=pickT(c,tg,'strong');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;t.shield=0;hitAb(c,t,2*((t.boss||t.dmaxOn||(t.scaleMul||1)>1.2)?2:1));boom(t,'#9fd4ff',3);});}});
kit({ids:[889],role:'Shield of Many Battles',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:25,pf:1.15,names:['Behemoth Bash'],mvType:'Steel',tail:()=>'<b>Dauntless Shield:</b> +25 Defense and Sp. Def at the start of battle.',begin(c){c.def+=25;c.res+=25;}},
  {d:c=>`Raises its shield over itself and adjacent allies (${HPT(c,.2)} each), then Behemoth Bashes the target and every enemy next to it for ${DT(c,1.4)}, stunning them for 0.7s.`,
   cast(c,tg){B.shield(.2,{who:'adjacent'}).cast(c,tg,0);schedule(.25,()=>{if(c.dead||tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,1.4);stun(q,.7);}boom(tg,'#ff7a7a',3);});}});
kit({ids:[890],role:'Darkest Day',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.2,names:['Eternabeam'],mvType:'Dragon',tail:()=>'<b>Pressure:</b> enemies within 2 hexes gain PP 15% slower.',begin(c){for(const o of foesOf(c).filter(o=>hdist(o,c)<=2))o.ppMul*=.85;}},
  {d:c=>`Charges for 0.6s, then fires an Eternabeam through every enemy in a line for ${DT(c,2.2)}. It must recharge for 1s afterwards.`,
   cast(c,tg){c.busy=Math.max(c.busy,.65);schedule(.6,()=>{if(c.dead||tg.dead)return;B.beam(2.2,{col:'#ff4a6a'}).cast(c,tg,0);c.busy=Math.max(c.busy,1);});}});
kit({ids:[891,892],role:'Wushu Master',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.8,1.2],names:['Rock Smash','Wicked Blow'],mvType:'Dark',tail:(c,i)=>i?'<b>Unseen Fist:</b> its Wicked Blow ignores shields.':''},
  staged(B.hit(1.1,{proj:false,fx:{shred:10}}),{d:c=>`Strikes the target with Wicked Blow for ${DT(c,1.4)}. It always lands a critical hit and ignores shields.`,
    cast(c,tg){if(tg.dead)return;tg.shield=0;damage(c,tg,V(c,1.4)*(1+c.critD),{ab:1,cat:'phys',type:'Dark',noCrit:1});boom(tg,'#8a6cd6',3);}}));
kit({ids:[893],role:'Rogue Monkey',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.15,names:['Jungle Healing'],mvType:'Grass'},
  {d:c=>`Whips the target with Power Whip for ${DT(c,1.6)}, then calls Jungle Healing: every ally heals ${HPT(c,.08)} of its own max HP and is cured of status conditions.`,
   cast(c,tg){if(!tg.dead)hitAb(c,tg,1.6);for(const a of alive(c.team)){heal(a,a.maxHp*.08);cureStatus(a);}if(!SIM.on)ring(c.x,c.y-6,'#7fe3a8');}});
kit({ids:[894],role:'Electron',cls:'Striker',cat:'spec',range:3,mana:60,pf:1.15,names:['Thunder Cage'],mvType:'Electric',tail:()=>'<b>Transistor:</b> its Electric move deals +30% damage (included).'},
  {d:c=>`Traps the target in a Thunder Cage for ${DT(c,1.2*1.3)}: it's held for 1s and takes ${DT(c,.25*1.3)} every half second for 3s, gaining Paralysis each time.`,
   cast(c,tg){if(tg.dead)return;hitAb(c,tg,1.2*1.3);stun(tg,1);for(let k=1;k<=6;k++)schedule(k*.5,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.25*1.3,{noCrit:1});addStatus(tg,'para',1,c);});if(!SIM.on)ring(tg.x,tg.y-6,'#ffe14d');}});
kit({ids:[895],role:'Dragon Orb',cls:'Juggernaut',cat:'spec',range:1,mana:75,start:20,pf:1.15,names:['Dragon Energy'],mvType:'Dragon',tail:()=>'<b>Dragon\'s Maw:</b> its Dragon move deals +30% damage (included).'},
  {d:c=>`Unleashes Dragon Energy through the target and enemies up to 2 hexes behind it for ${DT(c,1.6*1.3)} (70% to the others), scaled by its current HP (40% when nearly fainted).`,
   cast(c,tg){const k=.4+.6*c.hp/c.maxHp;B.cone(1.6*1.3*k,{depth:2,col:'#8a6cff'}).cast(c,tg,0);}});
kit({ids:[896],role:'Wild Horse',cls:'Juggernaut',cat:'phys',range:1,mana:75,start:20,pf:1.15,names:['Glacial Lance'],mvType:'Ice',tail:()=>'<b>Chilling Neigh:</b> each takedown raises its <span class="s-atk">Attack</span> by 10%.'},
  {d:c=>`Hurls Glacial Lances into every enemy within 2 hexes for ${DT(c,1.3)}, adding 3 Chill.`,kill(c){c.atk*=1.1;},
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,1.3);addStatus(q,'chill',3,c);}if(!SIM.on){ring(c.x,c.y-6,'#bff0ff');pfx('Ice_Shard_Hit',c.x,c.y-12,{sc:1.2,force:1});}}});
kit({ids:[897],role:'Swift Horse',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Astral Barrage'],mvType:'Ghost',tail:()=>'<b>Grim Neigh:</b> each takedown raises its <span class="s-spa">Sp. Atk</span> by 10%.'},
  {...B.barrage(6,.55,{what:'ghostly riders',r:6,col:'#8a6cd6'}),kill(c){c.spa*=1.1;}});
kit({ids:[898],role:'King of Bountiful Harvests',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:['Leaf Storm'],mvType:'Psychic',tail:()=>'<b>Unnerve:</b> enemies can\'t use berries.'},
  {d:c=>`Heals every ally for ${HT(c,.35)}, then whips up a Leaf Storm at the biggest group of enemies for ${DT(c,1.1)} (70% to adjacent enemies).`,
   cast(c,tg){B.heal(.35,{who:'team'}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead)B.blast(1.1,{at:'cluster',r:1,col:'#7fe3a8'}).cast(c,tg,0,{});});}});
kit({ids:[905],role:'Love-Hate',cls:'Artillery',cat:'spec',range:3,mana:75,pf:1.15,names:['Springtide Storm'],mvType:'Fairy',tail:()=>'<b>Contrary:</b> each cast raises its <span class="s-spa">Sp. Atk</span> by 10% (stacks).'},
  {d:c=>`Whips up a Springtide Storm around the biggest group of enemies: ${DT(c,1.3)} to everything within 2 hexes of it (70% to the others), lowering their <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by 15% for 4s.`,
   cast(c,tg){B.blast(1.3,{at:'cluster',r:2,col:'#ff9be6',fx:{weaken:.15}}).cast(c,tg,0,{});c.spa*=1.1;}});

// tuning pass: Gen VIII kit damage against generic units of the same cost (set from kitbal8)
for(const[d,m]of Object.entries({828:.75,858:.8,873:.75,845:.55,849:.72,879:.8,851:1.25}))tuneSig(+d,m);
for(const[d,m]of Object.entries({897:.7,896:.75,894:.75,895:.75,905:.8}))tuneSig(+d,m);
