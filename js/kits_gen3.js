/* Generation III signature kits (Hoenn lines, their later relatives, and Gen III branches). */

// a Pokémon on this team with the given dex is alive
const allyDex=(c,...ds)=>alive(c.team).some(a=>a!==c&&ds.includes(a.dex));
// repeating timer while a battle runs
function every(c,dt,fn){const t=()=>{if(c.dead||mode!=='combat'&&!SIM.on)return;fn();schedule(dt,t);};schedule(dt,t);}

// --- Hoenn starters ---
kit({ids:[252,253,254],role:'Forest Ninja',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Leafage','Quick Guard','Leaf Blade'],mvType:'Grass'},
  staged(B.hit(1,{proj:false}),B.hit(.6,{n:2,dash:1,to:'weak'}),
    {d:c=>`Blinks behind the weakest enemy and slashes it for ${DT(c,1.5)} with +40% crit chance. If that knocks it out, it blinks to the next weakest and slashes again for 60%.`,
     cast(c,tg){const go=(m,again)=>{const t=pickT(c,tg,'weak');if(!t)return;dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,m,{cr:.4});if(!SIM.on)pfx('Leaf_Blade',t.x,t.y-12,{sc:.45,force:1});if(t.dead&&again)schedule(.15,()=>go(m*.6,false));});};go(1.5,true);}}));
kit({ids:[255,256,257],role:'Blaze Kicker',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.15],names:['Ember','Double Kick','Blaze Kick'],mvType:'Fire',
  tail:(c,i)=>i===2?'<b>Kick tempo:</b> every 4s in battle it gains +10% <span class="s-as">Attack Speed</span> (up to 5 times).':''},
  {d:(c,i)=>i===0?B.hit(1,{fx:{burn:.01}}).d(c,i):i===1?B.hit(.55,{n:2,proj:false,fx:{burn:.012}}).d(c,i):`Throws three kicks for ${DT(c,.5)} each. The last one has +50% crit chance and adds 4 Burn.`,
   begin(c,i){if(i===2)every(c,4,()=>{if((c.sbN||0)<5){c.sbN=(c.sbN||0)+1;c.as*=1.08;}});},
   cast(c,tg,i){if(i<2)return(i?B.hit(.55,{n:2,proj:false,fx:{burn:.012}}):B.hit(1,{fx:{burn:.01}})).cast(c,tg,i,{});
     for(let k=0;k<3;k++)schedule(k*.14,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.5,{cr:k===2?.5:0});if(k===2)setDot(tg,'burn',.02,4,c);});}});
kit({ids:[258,259,260],role:'Tide Wrestler',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75,80],start:20,pf:[.8,1,1.15],names:['Mud Shot','Muddy Water','Earthquake'],mvType:'Ground'},
  staged(seq(B.shield(.15),B.hit(.9,{fx:{slow:[.25,3]}})),seq(B.shield(.2),B.cone(.8,{say:'Sweeps a wave of muddy water',fx:{slow:[.25,3]}})),seq(B.shield(.2),B.nova(.9,{say:'Then shakes the ground',r:2,fx:{slow:[.25,2]}}))));

// --- Common Hoenn Pokémon ---
kit({ids:[261,262],role:'Pack Hunter',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.85,1.05],names:['Bite','Crunch'],mvType:'Dark',tail:(c,i)=>i?'Deals +30% damage to enemies below half HP.':''},
  {d:(c,i)=>i?`Runs down the weakest enemy and bites it for ${DT(c,1.2)} (+30% if it's below half HP), lowering its <span class="s-def">Defense</span> by 8.`:B.hit(1,{proj:false,fx:{flinch:.3}}).d(c,i),
   cast(c,tg,i){if(!i)return B.hit(1,{proj:false,fx:{flinch:.3}}).cast(c,tg,i,{});const t=pickT(c,tg,'weak');dashTo(c,t,false,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.2*(t.hp<t.maxHp/2?1.3:1));t.def=Math.max(0,t.def-8);});}});
kit({ids:[263,264],role:'Rushdown',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1],names:['Headbutt','Extreme Speed'],mvType:'Normal'},
  staged(B.hit(1,{proj:false,fx:{flinch:.25}}),{d:c=>`Zigzags straight through to the farthest enemy, hitting every enemy on the way for ${DT(c,.8)} and the farthest one for ${DT(c,1.1)}.`,
    cast(c,tg){const t=pickT(c,tg,'far');for(const q of lineHits(c,t))if(q!==t)hitAb(c,q,.8);lineFx(c,t,'#ffffff',2,.25);dashTo(c,t,false,.18);schedule(.2,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.1);});}}));
kit({ids:[862],role:'Blockade',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Obstruct'],mvType:'Dark'},
  {d:c=>`Throws up its arms: a shield of ${HPT(c,.2)}, and for 3s it reflects 40% of the damage melee attackers deal to it, lowering their <span class="s-def">Defense</span> by 10. Then it slams the target for ${DT(c,1)}.`,
   cast(c,tg){c.shield+=c.maxHp*.2;c.fx.reflect=(c.fx.reflect||0)+.4;c.obsT=combatT+3;schedule(3,()=>{c.fx.reflect-=.4;});if(!SIM.on)pfx('Protect',0,0,{follow:c,oy:-12,sc:.55,force:1});schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1);});},
   hitBy(c,src,o){if(c.obsT>combatT&&!o.ab&&src.range===1&&!src.dead)src.def=Math.max(0,src.def-10/3);}});
kit({ids:[265,266,267],role:'Silk Dancer',cls:'Mystic',cat:'spec',range:3,mana:[60,65,70],pf:[.8,.9,1.1],names:['Bug Bite','Harden','Quiver Dance'],mvType:'Bug'},
  staged(B.hit(1),seq(B.shield(.2),B.hit(.7)),seq(B.ramp({spa:.08,as:.06}),B.hit(1.1,{what:'a Bug Buzz',fx:{sdef:6}}))));
kit({ids:[268,269],role:'Toxic Moth',cls:'Trickster',cat:'spec',range:3,mana:[65,70],pf:[.8,1.05],names:['Harden','Toxic Dust'],mvType:'Poison',tail:(c,i)=>i?'<b>Shield Dust:</b> immune to burn, poison, sleep and paralysis.':''},
  {d:(c,i)=>i?B.zone(.1,{at:'cluster',r:1,dur:5,say:'Scatters toxic scales',fx:{psn:.02},col:'#c8a0ff'}).d(c,i):seq(B.shield(.2),B.hit(.7)).d(c,i),
   begin(c,i){if(i)c.fx.aImm=1;},cast(c,tg,i){(i?B.zone(.1,{at:'cluster',r:1,dur:5,fx:{psn:.02},col:'#c8a0ff'}):seq(B.shield(.2),B.hit(.7))).cast(c,tg,i,{});}});
kit({ids:[270,271,272],role:'Rain Dancer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[65,70,75],pf:[.8,1,1.15],names:['Absorb','Mega Drain','Rain Dance'],mvType:'Water',
  tail:(c,i)=>i===2?'In rain it gains +20% <span class="s-as">Attack Speed</span>.':''},
  staged(B.hit(1,{heal:.6}),seq(B.hit(.9,{heal:.6}),B.heal(.4,{})),{d:c=>`Dances up a rainstorm (if no weather is active), then drains the target for ${DT(c,1)} and heals every ally for ${HT(c,.35)}.`,
    cast(c,tg){setWeather(c,'rain');if(battle.weather==='rain'&&!c.swim){c.swim=1;c.as*=1.2;}hitAb(c,tg,1);for(const a of alive(c.team))heal(a,HEALV(c,.35));if(!SIM.on)pfx('Bubbles_Blue',c.x,c.y-20,{sc:1.6,force:1});}}));
kit({ids:[273,274,275],role:'Wind Trickster',cls:'Trickster',cat:'spec',range:2,mana:[60,65,70],pf:[.8,1,1.15],names:['Absorb','Fake Out','Hurricane'],mvType:'Grass'},
  staged(B.hit(1,{heal:.5}),{d:c=>`Its first cast each battle is a Fake Out that flinches the target for 1s. After that it slashes for ${DT(c,1.1)}.`,cast(c,tg){if(!c.fakeOut){c.fakeOut=1;stun(tg,1);}hitAb(c,tg,1.1);}},
    {d:c=>`Fans up a gale: hits the 3 nearest enemies for ${DT(c,.9)}, knocking each back a hex and slowing their <span class="s-as">Attack Speed</span> by 25% for 3s.`,
     cast(c,tg){for(const q of foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,3)){hitAb(c,q,.9);applyFx(c,q,{knock:1,slow:[.25,3]},2);}if(!SIM.on)pfx('Gust',c.x,c.y-14,{sc:.6,force:1});}}));
kit({ids:[276,277],role:'Gutsy Swallow',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Wing Attack','Brave Bird'],mvType:'Flying',tail:(c,i)=>i?'<b>Guts:</b> +30% <span class="s-atk">Attack</span> while burned or poisoned.':''},
  {d:(c,i)=>i?`Dives onto the farthest enemy for ${DT(c,1.6)}, taking 10% of its own <span class="s-hp">max HP</span> in recoil.`:B.hit(1,{dash:1}).d(c,i),
   cast(c,tg,i){if(!i)return B.hit(1,{dash:1}).cast(c,tg,i,{});const gut=(c.burn||c.poison)?1.3:1;const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.6*gut);hurt(c,c.maxHp*.08,null);});}});
kit({ids:[278,279],role:'Storm Pelican',cls:'Mystic',cat:'spec',range:3,mana:[60,75],pf:[.8,1.1],names:['Water Gun','Hydro Pump'],mvType:'Water',tail:(c,i)=>i?'<b>Drizzle:</b> starts the battle with rain if no weather is active.':''},
  {d:(c,i)=>i?`Blasts the target with a Hydro Pump for ${DT(c,1.4)}, knocking it back a hex.`:B.hit(1).d(c,i),begin(c,i){if(i)schedule(.1,()=>setWeather(c,'rain'));},
   cast(c,tg,i){B.hit(i?1.4:1,{fx:i?{knock:1}:null}).cast(c,tg,i,{});}});
kit({ids:[283,284],role:'Eyespot',cls:'Trickster',cat:'spec',range:3,mana:[60,65],pf:[.8,1],names:['Bubble','Silver Wind'],mvType:'Bug'},
  staged(B.hit(1,{fx:{slow:[.2,2]}}),seq(B.control({weaken:.15},{n:3,say:'Flashes its eyespots at'}),B.cone(.9,{say:'Whips up a Silver Wind',fx:{sdef:6}}))));
kit({ids:[285,286],role:'Spore Boxer',cls:'Bruiser',cat:'phys',range:1,mana:[65,70],pf:[.8,1.1],names:['Stun Spore','Spore'],mvType:'Grass',tail:(c,i)=>i?'<b>Technician:</b> its Bullet Seed hits deal +20%.':''},
  staged(seq(B.control({stun:.8},{say:'Shakes stun spores over'}),B.hit(.9,{proj:false})),seq(B.control({sleep:1.4},{say:'Puts to sleep with Spore'}),B.hit(.36,{n:5,proj:false}))));
kit({ids:[287,288,289],role:'Slacker',cls:'Juggernaut',cat:'phys',range:1,mana:[65,60,90],start:[10,10,30],pf:[.8,1,1.25],names:['Yawn','Fury Swipes','Giga Impact'],mvType:'Normal',
  tail:(c,i)=>i===2?'<b>Truant:</b> after its Giga Impact it loafs around for 1.5s.':''},
  staged(seq(B.control({sleep:1.2},{say:'Yawns at'}),B.hit(.8,{proj:false})),B.hit(.38,{n:4,proj:false}),
    {d:c=>`Crashes into the target for ${DT(c,2.6)} and every enemy next to it for 60%.`,cast(c,tg){hitAb(c,tg,2.6);for(const q of near(tg,1))hitAb(c,q,2.6*.6);boom(tg,'#ffffff',2);c.busy=Math.max(c.busy,1.5);}}));
kit({ids:[290,291],role:'Swarm Blade',cls:'Striker',cat:'phys',range:1,mana:[60,55],pf:[.8,1.05],names:['Dig','X-Scissor'],mvType:'Bug',tail:(c,i)=>i?'Each cast also gives it +10% <span class="s-as">Attack Speed</span> for the battle.':''},
  staged(seq(B.airborne(.6),B.hit(1.1,{dash:1})),seq(B.hit(.6,{n:2,dash:1,to:'weak'}),B.ramp({as:.1}))));
kit({ids:[292],role:'Hollow Shell',cls:'Trickster',cat:'phys',range:1,mana:60,pf:1.15,names:['Shadow Sneak'],mvType:'Ghost',tail:()=>'<b>Wonder Guard:</b> moves hurt it only if they are Fire, Flying, Rock, Ghost or Dark. It has half the usual HP.'},
  {d:c=>`Slips through the shadows to the weakest enemy and strikes it for ${DT(c,1.3)}, stealing 10 PP.`,
   begin(c){c.maxHp*=.5;c.hp=Math.min(c.hp,c.maxHp);c.fx.immune=Object.keys(TYPES).filter(t=>!['Fire','Flying','Rock','Ghost','Dark'].includes(t));},
   cast(c,tg){const t=pickT(c,tg,'weak');dashTo(c,t,true,.15);schedule(.18,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.3);t.mana=Math.max(0,t.mana-10);gainMana(c,10);});}});
kit({ids:[293,294,295],role:'Sonic Boom',cls:'Artillery',cat:'spec',range:2,mana:[60,65,75],pf:[.8,1,1.15],names:['Uproar','Hyper Voice','Boomburst'],mvType:'Normal'},
  staged(B.cone(.9,{say:'Shouts'}),B.cone(1,{say:'Booms out a Hyper Voice',depth:2}),B.nova(1.05,{say:'Lets loose a Boomburst',r:2,fx:{flinch:.3}})));
kit({ids:[296,297],role:'Sumo Wall',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75],start:20,pf:[.8,1.1],names:['Arm Thrust','Force Palm'],mvType:'Fighting'},
  staged(seq(B.shield(.15),B.hit(.3,{n:3,proj:false})),seq(B.shield(.2),B.hit(1.1,{proj:false,fx:{knock:1,stun:.6}}))));
kit({ids:[299,476],role:'Magnet Fortress',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[75,80],start:20,pf:[.8,1.1],names:['Rock Tomb','Magnet Pull'],mvType:'Rock'},
  staged(seq(B.shield(.2),B.hit(.9,{fx:{slow:[.3,3]}})),
    {d:c=>`Magnet Pull drags the farthest enemy next to it, then it gains a shield of ${HPT(c,.2)} and its three Mini-Noses fire Power Gems at nearby enemies for ${DT(c,.45)} each.`,
     cast(c,tg){const t=pickT(c,tg,'far');pullTo(c,t);c.shield+=c.maxHp*.2;schedule(.3,()=>{if(!c.dead)B.barrage(3,.45,{what:'Power Gems',r:3}).cast(c,tg,1);});}}));
kit({ids:[300,301],role:'Charm Cat',cls:'Trickster',cat:'spec',range:3,mana:[60,65],pf:[.8,1],names:['Attract','Wish'],mvType:'Normal'},
  staged(seq(B.control({stun:1},{to:'strong',say:'Charms'}),B.hit(.7)),seq(B.control({stun:1},{n:2,say:'Charms'}),B.heal(.5,{}))));
kit({ids:[302],role:'Gem Thief',cls:'Trickster',cat:'phys',range:1,mana:55,start:30,pf:1.1,names:['Knock Off'],mvType:'Dark',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  {d:c=>`Knocks off the target's gear: ${DT(c,1.2)}, +50% if it's holding items, and it loses 15 PP.`,
   cast(c,tg){hitAb(c,tg,1.2*(tg.u&&tg.u.items&&tg.u.items.length?1.5:1));tg.mana=Math.max(0,tg.mana-15);}});
kit({ids:[303],role:'Deceiver',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.15,names:['Play Rough'],mvType:'Fairy'},
  B.hit(1.4,{proj:false,fx:{weaken:.2}}));
kit({ids:[304,305,306],role:'Iron Rhino',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,70,80],start:20,pf:[.8,1,1.15],names:['Metal Claw','Iron Head','Heavy Slam'],mvType:'Steel'},
  staged(B.hit(1,{proj:false,fx:{shred:5}}),seq(B.shield(.2),B.hit(1,{proj:false,fx:{flinch:.3}})),
    {d:c=>`Charges into the farthest enemy for ${DT(c,1)} plus 150% of its own <span class="s-def">Defense</span>, then braces behind a shield of ${HPT(c,.2)}.`,
     cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,false,.25);schedule(.27,()=>{if(c.dead)return;if(!t.dead){hitAb(c,t,1,{flat:1.5*c.def});boom(t,'#c0c8d8',2);}c.shield+=c.maxHp*.2;});}}));
kit({ids:[307,308],role:'Pure Power',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Meditate','High Jump Kick'],mvType:'Fighting'},
  staged(seq(B.ramp({atk:.1}),B.hit(.9,{proj:false})),{d:c=>`Leaps onto the farthest enemy with a High Jump Kick for ${DT(c,1.8)}. If it's knocked out, Medicham meditates: +10% <span class="s-atk">Attack</span> for the battle.`,
    cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.25);schedule(.27,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.8);if(t.dead)c.atk*=1.1;});}}));
kit({ids:[309,310],role:'Storm Hound',cls:'Striker',cat:'spec',range:[1,2],mana:[55,65],pf:[.8,1.05],names:['Spark','Thunder Fang'],mvType:'Electric'},
  staged(B.hit(1,{dash:1,fx:{stun:.3}}),B.chain(3,1,{fx:{stun:.3},col:'#ffe14d'})));
kit({ids:[311],role:'Cheer Plus',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1.05,names:['Helping Hand'],mvType:'Electric',tail:()=>'Cheers harder with Minun on the field: its buff is 50% bigger.'},
  {d:c=>`Cheers on itself and adjacent allies (+15% <span class="s-as">Attack Speed</span> and +10% damage for 4s), then zaps the target for ${DT(c,.8)}, jumping to one more enemy.`,
   cast(c,tg){const k=allyDex(c,312)?1.5:1;B.buff({as:.15*k,dmg:.1*k},{who:'adjacent',dur:4}).cast(c,tg,0);B.chain(1,.8,{col:'#ffe14d'}).cast(c,tg,0);}});
kit({ids:[312],role:'Cheer Minus',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1.05,names:['Nuzzle'],mvType:'Electric',tail:()=>'Cheers harder with Plusle on the field: its shield is 50% bigger.'},
  {d:c=>`Shields the most injured ally for ${HPT(c,.2)} (of its max HP), then nuzzles the target for ${DT(c,.8)}, paralyzing it for 0.6s.`,
   cast(c,tg){const k=allyDex(c,311)?1.5:1;const a=alive(c.team).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a){a.shield+=a.maxHp*.2*k;if(!SIM.on)pfx('Protect_Yellow',0,0,{follow:a,oy:-12,sc:.5,force:1});}hitAb(c,tg,.8);stun(tg,.6);}});
kit({ids:[313],role:'Signal Light',cls:'Trickster',cat:'phys',range:1,mana:60,start:30,pf:1.05,names:['Tail Glow'],mvType:'Bug',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  seq(B.control({shred:10,sdef:10},{to:'strong',say:'Shines a signal on'}),B.hit(1,{proj:false})));
kit({ids:[314],role:'Firefly Queen',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.05,names:['Bug Buzz'],mvType:'Bug',tail:()=>'With Volbeat on the field her fireflies number 6.'},
  {d:c=>`Calls a swarm of 4 fireflies that dive at enemies within 4 hexes for ${DT(c,.45)} each.`,cast(c,tg){B.barrage(allyDex(c,313)?6:4,.45,{what:'fireflies',col:'#fff6a0'}).cast(c,tg,0);}});
kit({ids:[318,319],role:'Blood Shark',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Aqua Jet','Liquidation'],mvType:'Water',tail:(c,i)=>i?'A knockout refunds 40 PP.':''},
  {d:(c,i)=>`${i?'Smells blood and lunges':'Jets'} at the weakest enemy for ${DT(c,i?1.3:1)}.${i?' If that knocks it out, it gets 40 PP back.':''}`,
   cast(c,tg,i){const t=pickT(c,tg,'weak');dashTo(c,t,false,.15);schedule(.17,()=>{if(c.dead||t.dead)return;hitAb(c,t,i?1.3:1);if(i&&t.dead)gainMana(c,40);});}});
kit({ids:[320,321],role:'Leviathan',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[75,80],start:20,pf:[.85,1.1],names:['Water Pulse','Water Spout'],mvType:'Water'},
  staged(seq(B.shield(.2),B.hit(.9,{fx:{flinch:.3}})),{d:c=>`Gains a shield of ${HPT(c,.2)}, then spouts a geyser that hits every enemy within 2 hexes for ${DT(c,1.2)}, scaled by its current HP (40% when nearly fainted).`,
    cast(c,tg){c.shield+=c.maxHp*.2;const k=.4+.6*c.hp/c.maxHp;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))hitAb(c,q,1.2*k);if(!SIM.on){pfx('Water_Spout_Up',c.x,c.y-50,{sc:.45,force:1});ring(c.x,c.y-6,'#5aa8ff');}}}));
kit({ids:[322,323],role:'Volcanic Hump',cls:'Artillery',cat:'spec',range:3,mana:[65,80],pf:[.8,1.15],names:['Ember','Eruption'],mvType:'Fire'},
  staged(B.hit(1,{fx:{burn:.01}}),{d:c=>`Erupts onto the biggest group of enemies: ${DT(c,1.5)} to the center and 70% to adjacent enemies, scaled by its current HP (40% when nearly fainted). Adds 4 Burn.`,
    cast(c,tg){const k=.4+.6*c.hp/c.maxHp;B.blast(1.5*k,{at:'cluster',r:1,arc:1,fx:{burn:.02},col:'#ff7a2c'}).cast(c,tg,1,{});}}));
kit({ids:[324],role:'Smog Kiln',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:75,start:20,pf:1.05,names:['Lava Plume'],mvType:'Fire',tail:()=>'<b>Drought:</b> starts the battle with harsh sunlight if no weather is active.'},
  {d:c=>`${B.shield(.2).d(c,0)} Then it belches a Lava Plume that hits every enemy within 1 hex for ${DT(c,1)} and adds 3 Burn.`,
   begin(c){schedule(.1,()=>setWeather(c,'sun'));},cast(c,tg){B.shield(.2).cast(c,tg,0);schedule(.3,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1);setDot(q,'burn',.015,4,c);}if(!SIM.on)pfx('Lava_Plume_Smoke',c.x,c.y-14,{sc:.6,force:1});});}});
kit({ids:[325,326],role:'Bounce Psychic',cls:'Mystic',cat:'spec',range:3,mana:[60,65],pf:[.8,1.05],names:['Psybeam','Power Gem'],mvType:'Psychic'},
  staged(B.hit(1,{fx:{flinch:.2}}),seq(B.chain(2,1,{col:'#ff9be6'}),B.ramp({spa:.08}))));
kit({ids:[327],role:'Dizzy Dancer',cls:'Trickster',cat:'phys',range:1,mana:60,pf:1.1,names:['Teeter Dance'],mvType:'Normal'},
  {d:c=>`Teeters around: every enemy within 2 hexes is dazed for 0.6s, then it bumps into a random adjacent enemy for ${DT(c,1.1)}.`,
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))stun(q,.6);const adj=foesOf(c).filter(f=>hdist(f,c)<=1);hitAb(c,adj.length?pick(adj):tg,1.1);if(!SIM.on)pfx('Dizzy_Punch_Hit',c.x,c.y-16,{sc:.6,force:1});}});
kit({ids:[328,329,330],role:'Desert Spirit',cls:'Mystic',cat:'spec',range:[1,2,3],mana:[60,65,75],pf:[.8,1,1.15],names:['Sand Tomb','Bug Buzz','Earth Power'],mvType:'Ground',
  tail:(c,i)=>i===2?'Whips up a sandstorm at the start of battle if no weather is active.':''},
  {d:(c,i)=>i===0?B.zone(.08,{r:1,dur:4,say:'Traps the target in a Sand Tomb',fx:{slow:[.3,1]},col:'#d8b070'}).d(c,i):i===1?B.cone(.9,{say:'Buzzes',fx:{sdef:6}}).d(c,i):B.blast(1.3,{what:'an Earth Power eruption',at:'cluster',r:1,fx:{sdef:8},col:'#c08850'}).d(c,i),
   begin(c,i){if(i===2)schedule(.1,()=>setWeather(c,'sand'));},
   cast(c,tg,i){(i===0?B.zone(.08,{r:1,dur:4,fx:{slow:[.3,1]},col:'#d8b070'}):i===1?B.cone(.9,{fx:{sdef:6}}):B.blast(1.3,{at:'cluster',r:1,fx:{sdef:8},col:'#c08850'})).cast(c,tg,i,{});}});
kit({ids:[331,332],role:'Needle Ambusher',cls:'Trickster',cat:'phys',range:1,mana:[60,65],pf:[.8,1.05],names:['Needle Arm','Spiky Shield'],mvType:'Grass'},
  {d:(c,i)=>i?`Raises a Spiky Shield (${HPT(c,.15)}): for 3s melee attackers take 5% of their <span class="s-hp">max HP</span> per hit. Then it Sucker Punches the strongest enemy for ${DT(c,1.2)}.`:B.hit(1,{proj:false,fx:{flinch:.3}}).d(c,i),
    cast(c,tg,i){if(!i)return B.hit(1,{proj:false,fx:{flinch:.3}}).cast(c,tg,i,{});c.shield+=c.maxHp*.15;c.spikyT=combatT+3;const t=pickT(c,tg,'strong');dashTo(c,t,false,.18);schedule(.2,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.2);});},
    hitBy(c,src,o){if(c.spikyT>combatT&&!o.ab&&src.range===1&&!src.dead)hurt(src,src.maxHp*.06,c);}});
kit({ids:[333,334],role:'Cloud Singer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[65,75],pf:[.8,1.1],names:['Sing','Cotton Guard'],mvType:'Flying'},
  staged(seq(B.control({sleep:1.2},{to:'strong',say:'Sings to'}),B.heal(.6,{})),seq(B.heal(.85,{}),B.shield(.1,{who:'adjacent'}),B.control({sleep:1},{to:'strong',say:'Sings to'}))));
kit({ids:[335],role:'Claw Rival',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Crush Claw'],mvType:'Normal',tail:()=>'Deals +50% damage to Poison types (its old rivals).'},
  {d:c=>`Crushes the target for ${DT(c,1.3)}, lowering its <span class="s-def">Defense</span> by 10.`,cast(c,tg){hitAb(c,tg,1.3*(D[tg.dex].t.includes('Poison')?1.5:1));tg.def=Math.max(0,tg.def-10);}});
kit({ids:[336],role:'Venom Fang',cls:'Trickster',cat:'phys',range:1,mana:60,pf:1.1,names:['Poison Fang'],mvType:'Poison',tail:()=>'Deals +50% damage to Normal types (its old rivals).'},
  {d:c=>`Sinks its fangs into the target for ${DT(c,1)} and adds 6 Poison, then lashes the nearest other enemy with its tail for ${DT(c,.6)}.`,
   cast(c,tg){hitAb(c,tg,1*(D[tg.dex].t.includes('Normal')?1.5:1));setDot(tg,'poison',.03,4,c);const o=foesOf(c).filter(f=>f!==tg).sort((a,b)=>hdist(a,c)-hdist(b,c))[0];if(o)schedule(.2,()=>{if(!c.dead&&!o.dead)hitAb(c,o,.6);});}});
kit({ids:[337],role:'Moonstone',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.05,names:['Moonblast'],mvType:'Psychic',tail:()=>'<b>Eclipse:</b> +25% damage while Solrock is on its team.'},
  {d:c=>`Fires moonlight at the target for ${DT(c,1.2)}, lowering its <span class="s-spa">Sp. Atk</span> and <span class="s-atk">Attack</span> by 15% for 4s, and gives itself a shield of ${HPT(c,.1)}.`,
   cast(c,tg){fire(c,tg,'#e8e8ff',()=>{hitAb(c,tg,1.2*(allyDex(c,338)?1.25:1));debuff(tg,'atk',.15,4);debuff(tg,'spa',.15,4);},{sp:260});c.shield+=c.maxHp*.1;}});
kit({ids:[338],role:'Sunstone',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.1,names:['Flare Blitz'],mvType:'Rock',tail:()=>'<b>Eclipse:</b> +25% damage while Lunatone is on its team.'},
  {d:c=>`Rolls into the target ablaze for ${DT(c,1.4)} and burns it, taking 5% of its own <span class="s-hp">max HP</span> in recoil.`,
   cast(c,tg){if(hdist(c,tg)>1)dashTo(c,tg,false,.2);schedule(.22,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.4*(allyDex(c,337)?1.25:1),{type:'Fire'});setDot(tg,'burn',.015,4,c);hurt(c,c.maxHp*.06,null);});}});
kit({ids:[339,340],role:'Quake Whisker',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75],start:20,pf:[.8,1.1],names:['Mud-Slap','Earthquake'],mvType:'Ground',tail:(c,i)=>i?'Senses quakes: it shrugs off stuns 50% faster.':''},
  {d:(c,i)=>i?seq(B.shield(.2),B.nova(.9,{say:'Then sets off an Earthquake',r:2})).d(c,i):seq(B.shield(.15),B.hit(.9,{fx:{slow:[.3,2]}})).d(c,i),
   begin(c,i){if(i)c.stunRes=.5;},cast(c,tg,i){(i?seq(B.shield(.2),B.nova(.9,{r:2})):seq(B.shield(.15),B.hit(.9,{fx:{slow:[.3,2]}}))).cast(c,tg,i,{});}});
kit({ids:[341,342],role:'Brawler Crab',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Crabhammer','Knock Off'],mvType:'Water'},
  staged(B.hit(1.2,{proj:false,cr:.3}),{d:c=>`Hammers the target for ${DT(c,1.2)} with +30% crit chance, then knocks off its gear: another ${DT(c,.6)}, +50% if it holds items, and it loses 15 PP.`,
    cast(c,tg){hitAb(c,tg,1.2,{cr:.3});schedule(.2,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.6*(tg.u&&tg.u.items&&tg.u.items.length?1.5:1),{type:'Dark'});tg.mana=Math.max(0,tg.mana-15);});}}));
kit({ids:[343,344],role:'Clay Totem',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[70,75],start:20,pf:[.8,1.05],names:['Rapid Spin','Light Screen'],mvType:'Psychic'},
  staged(seq(B.shield(.2),B.nova(.6,{say:'Spins',r:1})),seq(B.shield(.1,{who:'team'}),B.blast(1,{what:'an Earth Power burst',r:1}))));
kit({ids:[345,346],role:'Tide Anchor',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[70,75],start:20,pf:[.8,1.05],names:['Ingrain','Giga Drain'],mvType:'Grass'},
  staged(seq(B.zone(0,{at:'self',r:0,dur:5,heal:.03,say:'Ingrains its roots'}),B.hit(.9,{heal:.5})),seq(B.zone(0,{at:'self',r:1,dur:5,heal:.03,say:'Ingrains its roots'}),B.hit(1.1,{heal:.6,to:'weak'}))));
kit({ids:[347,348],role:'Ancient Blade',cls:'Bruiser',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Fury Cutter','X-Scissor'],mvType:'Bug'},
  {d:(c,i)=>`Fury Cutter: slashes the target for ${DT(c,i?.75:.6)}, plus one more slash for every cast this battle (up to ${i?5:4} slashes).`,
   cast(c,tg,i){c.furyN=Math.min(i?5:4,(c.furyN||0)+1);for(let k=0;k<c.furyN;k++)schedule(k*.1,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,i?.75:.6);});}});
kit({ids:[349],role:'Underdog',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:.9,names:['Flail'],mvType:'Water'},
  {d:c=>`Flails at the target for ${DT(c,.8)}, up to triple damage as its own HP runs low.`,cast(c,tg){hitAb(c,tg,.8*(1+2*(1-c.hp/c.maxHp)));}});
kit({ids:[350],role:'Prism Healer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:['Life Dew'],mvType:'Water',tail:()=>'<b>Marvel Scale:</b> +20 <span class="s-def">Defense</span> while it has a status condition.'},
  {d:c=>`Sprinkles Life Dew on every ally for ${HT(c,.45)}, curing burn and poison, then drenches the target for ${DT(c,.9)}.`,
   begin(c){every(c,1,()=>{const s=!!(c.burn||c.poison||c.stun>0);if(s!==!!c.mvOn){c.mvOn=s;c.def+=s?20:-20;}});},
   cast(c,tg){B.heal(.45,{who:'team',cleanse:1}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.9);});}});
kit({ids:[351],role:'Weather Sprite',cls:'Mystic',cat:'spec',range:3,mana:60,pf:1.1,names:['Weather Ball'],mvType:'Normal'},
  {d:c=>`Fires a Weather Ball for ${DT(c,1.3)} whose type follows the weather: Fire in sun (burns), Water in rain (knocks back), Ice in snow (freezes 0.8s), Rock in a sandstorm (lowers <span class="s-def">Defense</span> by 10). With no weather it first conjures one at random.`,
   cast(c,tg){if(!battle.weather)setWeather(c,pick(['sun','rain','snow','sand']));const w=battle.weather,ty={sun:'Fire',rain:'Water',snow:'Ice',sand:'Rock'}[w]||'Normal';
     fire(c,tg,TYPES[ty],()=>{hitAb(c,tg,1.3,{type:ty});if(w==='sun')setDot(tg,'burn',.015,4,c);if(w==='rain')knock(c,tg);if(w==='snow')stun(tg,.8);if(w==='sand')tg.def=Math.max(0,tg.def-10);typeHit(tg,ty,1.2);},{type:ty,size:5});}});
kit({ids:[352],role:'Chameleon',cls:'Trickster',cat:'phys',range:1,mana:60,pf:1.15,names:['Shadow Sneak'],mvType:'Normal'},
  {d:c=>`Turns invisible for 0.8s (can't be targeted), then ambushes the weakest enemy for ${DT(c,1.5)}.`,
   cast(c,tg){B.airborne(.8).cast(c);schedule(.85,()=>{if(c.dead)return;const t=pickT(c,tg,'weak');if(!t)return;dashTo(c,t,true,.12);schedule(.14,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5);});});}});
kit({ids:[353,354],role:'Grudge Doll',cls:'Trickster',cat:'spec',range:[3,1],mana:[60,65],pf:[.8,1.1],names:['Night Shade','Phantom Force'],mvType:'Ghost',tail:(c,i)=>i?'<b>Cursed Body:</b> attackers who hit it have a 20% chance to be dazed for 0.5s.':''},
  {d:(c,i)=>i?`Vanishes for 1s, then strikes the weakest enemy from the shadows for ${DT(c,1.6)}, ignoring 30% of its defenses.`:B.hit(1.1).d(c,i),
   cast(c,tg,i){if(!i)return B.hit(1.1).cast(c,tg,i,{});B.airborne(1).cast(c);schedule(1.05,()=>{if(c.dead)return;const t=pickT(c,tg,'weak');dashTo(c,t,true,.12);schedule(.14,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.6,{pen:.3});});});},
   hitBy(c,src,o){if(c.kit.si===1&&!o.ab&&!src.dead&&Math.random()<.2)stun(src,.5);}});
kit({ids:[355,356,477],role:'Reaper',cls:'Juggernaut',type:'guard',cat:'spec',range:[2,1,1],mana:[65,75,80],start:20,pf:[.8,1,1.15],names:['Night Shade','Pain Split','Poltergeist'],mvType:'Ghost'},
  staged(B.hit(1.1,{fx:{flinch:.2}}),
    {d:c=>`Pain Split: it and the target share their HP evenly (by percentage), then it gains a shield of ${HPT(c,.15)}.`,cast(c,tg){const a=(c.hp/c.maxHp+tg.hp/tg.maxHp)/2;if(tg.hp/tg.maxHp>a)hurt(tg,(tg.hp/tg.maxHp-a)*tg.maxHp,c);if(c.hp/c.maxHp<a)heal(c,(a-c.hp/c.maxHp)*c.maxHp,true);c.shield+=c.maxHp*.15;}},
    {d:c=>`Pain Split with the target (both end at their average HP %), then haunts it with Poltergeist for ${DT(c,1.4)} and a shield of ${HPT(c,.15)}.`,
     cast(c,tg){const a=(c.hp/c.maxHp+tg.hp/tg.maxHp)/2;if(tg.hp/tg.maxHp>a)hurt(tg,(tg.hp/tg.maxHp-a)*tg.maxHp,c);if(c.hp/c.maxHp<a)heal(c,(a-c.hp/c.maxHp)*c.maxHp,true);c.shield+=c.maxHp*.15;schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.4);});}}));
kit({ids:[357],role:'Fruit Tree',cls:'Medic',type:'heal',cat:'spec',range:2,mana:70,pf:1.05,names:['Harvest'],mvType:'Grass'},
  {d:c=>`Shakes fruit off its neck: heals the most injured ally for ${HT(c,.85)} and every ally next to it for ${HT(c,.3)}.`,
   cast(c,tg){const a=alive(c.team).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(!a)return;heal(a,HEALV(c,.85));for(const o of alive(c.team).filter(o=>o!==a&&hdist(o,a)<=1))heal(o,HEALV(c,.3));}});
kit({ids:[359],role:'Disaster Blade',cls:'Striker',cat:'phys',range:1,mana:55,pf:1.15,names:['Night Slash'],mvType:'Dark'},
  B.hit(1.4,{dash:1,to:'weak',cr:.5}));
kit({ids:[361,362],role:'Ice Face',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.8,1.1],names:['Powder Snow','Freeze-Dry'],mvType:'Ice'},
  staged(B.hit(1,{fx:{slow:[.25,2]}}),B.nova(1,{say:'Flash-freezes the air',r:1,fx:{freeze:.9}})));
kit({ids:[478],role:'Snow Wraith',cls:'Trickster',cat:'spec',range:3,mana:65,pf:1.15,names:['Icy Wind'],mvType:'Ghost'},
  {d:c=>`Freezes the weakest enemy for 1s, then hits it with a Shadow Ball for ${DT(c,1.3)} (+30% if it's frozen or slowed).`,
   cast(c,tg){const t=pickT(c,tg,'weak');stun(t,1);schedule(.2,()=>{if(c.dead||t.dead)return;fire(c,t,'#9b6bff',()=>hitAb(c,t,1.3*(t.stun>0||t.slowT>0?1.3:1),{type:'Ghost'}),{type:'Ghost',size:4});});}});
kit({ids:[363,364,365],role:'Ice Roller',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70,80],start:20,pf:[.8,1,1.15],names:['Ice Ball','Icy Wind','Blizzard'],mvType:'Ice'},
  {d:(c,i)=>i<2?`Rolls into the target ${i+3} times; each hit deals ${DT(c,.4)} and 25% more than the last.${i?` Gains a shield of ${HPT(c,.15)} first.`:''}`:`${B.shield(.2).d(c,i)} Then it whips up a Blizzard: every enemy within 2 hexes takes ${DT(c,.9)} and is slowed by 25% for 3s.`,
   cast(c,tg,i){if(i)c.shield+=c.maxHp*(i===2?.22:.15);if(i<2){for(let k=0;k<i+3;k++)schedule(k*.15,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.4*Math.pow(1.25,k));});return;}
     schedule(.3,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,.9);applyFx(c,q,{slow:[.25,3]},2);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:1.6,force:1});});}});
kit({ids:[366,367],role:'Deep Hunter',cls:'Striker',cat:'phys',range:1,mana:[60,60],pf:[.8,1.1],names:['Clamp','Sucker Punch'],mvType:'Water'},
  staged(B.hit(1,{proj:false,fx:{slow:[.3,2]}}),{d:c=>`Lurks, then Sucker Punches the enemy about to cast (the one with the most PP) for ${DT(c,1.3)}, knocking 20 PP off it.`,
    cast(c,tg){const t=foesOf(c).sort((a,b)=>b.mana/Math.max(1,b.maxMana)-a.mana/Math.max(1,a.maxMana))[0]||tg;dashTo(c,t,true,.16);schedule(.18,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.3);t.mana=Math.max(0,t.mana-20);});}}));
kit({ids:[368],role:'Deep Siren',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Shell Smash'],mvType:'Water',tail:()=>'Each Shell Smash also lowers its own <span class="s-def">Defense</span> and <span class="s-def">Sp. Def</span> by 5.'},
  {d:c=>`Smashes its shell (+10% <span class="s-spa">Sp. Atk</span> and <span class="s-as">Attack Speed</span> for the battle), then fires a Hydro Pump through the target that hits every enemy in a line for ${DT(c,1.1)}.`,
   cast(c,tg){c.spa*=1.12;c.as*=1.12;c.def=Math.max(0,c.def-5);c.res=Math.max(0,c.res-5);B.beam(1.1,{col:'#5aa8ff'}).cast(c,tg,0);}});
kit({ids:[369],role:'Living Fossil',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:75,start:20,pf:1.1,names:['Head Smash'],mvType:'Rock',tail:()=>'<b>Rock Head:</b> no recoil.'},
  seq(B.shield(.2),B.hit(1.8,{proj:false,fx:{stun:.5}})));
kit({ids:[370],role:'Heart Scale',cls:'Medic',type:'heal',cat:'spec',range:3,mana:60,pf:1,names:['Attract'],mvType:'Water'},
  seq(B.heal(.75,{}),B.control({stun:.9},{to:'strong',say:'Charms'})));
kit({ids:[374,375,376],role:'Meteor Engine',cls:'Juggernaut',cat:'phys',range:1,mana:[60,65,70],start:[10,10,20],pf:[.8,1,1.15],names:['Take Down','Meteor Mash','Meteor Mash'],mvType:'Steel',
  tail:(c,i)=>i?'<b>Clear Body:</b> its stats can\'t be lowered by enemies.':''},
  {d:(c,i)=>i?`Rockets into ${i===2?'the farthest enemy':'the target'} with a Meteor Mash for ${DT(c,i===2?1.5:1.2)}${i===2?' and 60% to enemies next to it':''}, gaining +10% <span class="s-atk">Attack</span> for the battle (stacks).`:B.hit(1.1,{proj:false}).d(c,i),
   begin(c,i){if(i)c.fx.clear=1;},
   cast(c,tg,i){if(!i)return B.hit(1.1,{proj:false}).cast(c,tg,i,{});const t=i===2?pickT(c,tg,'far'):tg;dashTo(c,t,false,.22);schedule(.24,()=>{if(c.dead||t.dead)return;hitAb(c,t,i===2?1.5:1.2);if(i===2)for(const q of near(t,1))hitAb(c,q,1.5*.6);c.atk*=1.1;if(!SIM.on)pfx('Meteor_Mash_Star',t.x,t.y-14,{sc:.7,force:1});});}});

// --- Hoenn legends ---
kit({ids:[377],role:'Stone Titan',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:80,start:20,pf:1.1,names:['Stone Edge'],mvType:'Rock'},
  seq(B.shield(.25),B.nova(1,{say:'Then raises jagged stones',r:1,fx:{stun:.8}})));
kit({ids:[378],role:'Glacier Titan',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.1,names:['Ice Beam'],mvType:'Ice'},
  seq(B.shield(.15),B.beam(1.2,{what:'an Ice Beam',fx:{freeze:.8},col:'#bff0ff'})));
kit({ids:[379],role:'Iron Titan',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:20,pf:1.1,names:['Body Press'],mvType:'Steel'},
  {d:c=>`${B.shield(.15,{who:'adjacent',def:15}).d(c,0)} Then it Body Presses the target for ${DT(c,.6)} plus 200% of its own <span class="s-def">Defense</span>.`,
   cast(c,tg){B.shield(.15,{who:'adjacent',def:15}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.6,{flat:2*c.def,type:'Fighting'});});}});
kit({ids:[380],role:'Eon Guardian',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.15,names:['Mist Ball'],mvType:'Psychic',tail:()=>'With Latios on the field, both gain +15% <span class="s-spa">Sp. Atk</span>.'},
  {d:c=>`Fires a Mist Ball at the target for ${DT(c,1)} (lowering its <span class="s-spa">Sp. Atk</span> by 20% for 4s), then heals every ally for ${HT(c,.4)}.`,
   begin(c){if(allyDex(c,381))c.spa*=1.15;},cast(c,tg){fire(c,tg,'#ff9be6',()=>{hitAb(c,tg,1);debuff(tg,'spa',.2,4);},{size:4});B.heal(.4,{who:'team'}).cast(c,tg,0);}});
kit({ids:[381],role:'Eon Lancer',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.2,names:['Luster Purge'],mvType:'Psychic',tail:()=>'With Latias on the field, both gain +15% <span class="s-spa">Sp. Atk</span>.'},
  {d:c=>B.beam(1.4,{what:'a Luster Purge',fx:{sdef:10}}).d(c,0),begin(c){if(allyDex(c,380))c.spa*=1.15;},cast(c,tg){B.beam(1.4,{fx:{sdef:10},col:'#9fd4ff'}).cast(c,tg,0);}});
kit({ids:[382],role:'Primordial Sea',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.15,names:['Water Spout'],mvType:'Water',tail:()=>'<b>Drizzle:</b> starts the battle with rain if no weather is active.'},
  {d:c=>`Erupts a Water Spout over every enemy within 3 hexes for ${DT(c,1.1)}, scaled by its current HP (40% when nearly fainted).`,
   begin(c){schedule(.1,()=>setWeather(c,'rain'));},cast(c,tg){const k=.4+.6*c.hp/c.maxHp;const ts=foesOf(c).filter(f=>hdist(f,c)<=3);ts.forEach((q,n)=>schedule(n*.06,()=>{if(c.dead||q.dead)return;hitAb(c,q,1.1*k);if(!SIM.on)pfx('Water_Spout_Splash',q.x,q.y-10,{sc:1.2,force:1});}));}});
kit({ids:[383],role:'Desolate Land',cls:'Bruiser',cat:'phys',range:1,mana:80,pf:1.15,names:['Precipice Blades'],mvType:'Ground',tail:()=>'<b>Drought:</b> starts the battle with harsh sunlight if no weather is active.'},
  {d:c=>B.cone(1.5,{say:'Raises Precipice Blades',depth:2}).d(c,0),begin(c){schedule(.1,()=>setWeather(c,'sun'));},cast(c,tg){B.cone(1.5,{depth:2,col:'#ff7a2c'}).cast(c,tg,0);}});
kit({ids:[384],role:'Sky Dragon',cls:'Striker',cat:'phys',range:1,mana:75,pf:1.15,names:['Dragon Ascent'],mvType:'Dragon',tail:()=>'<b>Air Lock:</b> no weather on the field while it fights.'},
  {d:c=>`Soars out of reach for 0.8s, then dives onto the biggest group of enemies for ${DT(c,2)} to the center and 60% to adjacent enemies. Each dive lowers its own <span class="s-def">Defense</span> by 5.`,
   begin(c){schedule(.15,()=>{if(battle.weather){battle.weather=null;}});},
   cast(c,tg){B.airborne(.8).cast(c);schedule(.85,()=>{if(c.dead)return;const t=pickT(c,tg,'cluster');if(!t)return;dashTo(c,t,false,.15);schedule(.17,()=>{if(c.dead)return;if(!t.dead)hitAb(c,t,2);for(const q of near(t,1))hitAb(c,q,1.2);c.def=Math.max(0,c.def-5);boom(t,'#7fe3a8',2);});});}});
kit({ids:[385],role:'Wishmaker',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:['Doom Desire'],mvType:'Steel'},
  {d:c=>`Makes a Wish (the most injured ally heals ${HT(c,.9)} after 1s) and calls a Doom Desire that lands on the biggest group of enemies 2s later for ${DT(c,1.6)} (70% to adjacent).`,
   cast(c,tg){schedule(1,()=>{if(c.dead)return;const a=alive(c.team).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a)heal(a,HEALV(c,.9));});
     const t=pickT(c,tg,'cluster');if(!SIM.on&&t)pfx('Lucky_Chant_Star_Yellow',t.x,t.y-40,{sc:1.4,force:1,loop:2});schedule(2,()=>{if(c.dead||!t||t.dead)return;for(const q of[t,...near(t,1)])hitAb(c,q,q===t?1.6:1.6*.7);boom(t,'#ffe27a',2);});}});
kit({ids:[386],role:'Alien Virus',cls:'Striker',cat:'spec',range:3,mana:60,pf:1.2,names:['Psycho Boost'],mvType:'Psychic'},
  {d:c=>`Fires a Psycho Boost at the target for ${DT(c,2)}, then its own <span class="s-spa">Sp. Atk</span> drops 15% for 4s.`,
   cast(c,tg){fire(c,tg,'#ff9be6',()=>{hitAb(c,tg,2);boom(tg,'#ff9be6',2);},{size:5,sp:300});debuff(c,'spa',.15,4);}});
kit({ids:[406,315,407],role:'Rose Duelist',cls:'Mystic',cat:'spec',range:3,mana:[60,65,70],pf:[.8,1,1.15],names:['Absorb','Toxic Spikes','Petal Storm'],mvType:'Grass'},
  staged(B.hit(1,{heal:.5}),seq(B.zone(.08,{at:'cluster',r:1,dur:4,say:'Scatters Toxic Spikes',fx:{psn:.015},col:'#a35bd6'}),B.hit(.9)),
    seq(B.barrage(5,.42,{what:'poisoned thorns',fx:{psn:.015}}),B.zone(.08,{at:'cluster',r:1,dur:4,say:'Scatters Toxic Spikes',fx:{psn:.015},col:'#a35bd6'}))));
kit({ids:[433,358],role:'Wind Chime',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[65,70],pf:[.8,1.05],names:['Uproar','Heal Bell'],mvType:'Psychic'},
  staged(seq(B.heal(.6,{}),B.cone(.6,{say:'Rings out'})),seq(B.heal(.35,{who:'team',cleanse:1}),B.control({stun:.5},{n:2,say:'Startles'}))));

// tuning pass: Gen III kit damage against generic units of the same cost
for(const[d,m]of Object.entries({254:.8,275:.8,295:.8,340:.65,310:.65,368:.65,326:.7,407:.6,330:.75,321:.6,260:.6,365:.6,369:.7,362:.85,478:.85,264:.85,311:.8,277:.9,862:.85,289:.75,376:.85,382:.85,386:.85,
  301:1.2,292:1.3,342:1.25,302:1.25,303:1.25,327:1.25,352:1.15,348:1.3,306:1.1,262:1.2,319:1.15,354:1.15,286:1.2}))tuneSig(+d,m);
for(const[d,m]of Object.entries({260:.75,365:.8,321:.8,326:.8,340:.75,275:.85,277:.85,254:.9}))tuneSig(+d,m);
