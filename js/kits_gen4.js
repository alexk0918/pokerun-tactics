/* Generation IV signature kits (Sinnoh lines and Gen IV branches). */

// --- Sinnoh starters ---
kit({ids:[387,388,389],role:'Island Turtle',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75,85],start:20,pf:[.8,1,1.15],names:['Withdraw','Razor Leaf','Earthquake'],mvType:'Grass'},
  staged(seq(B.shield(.15),B.hit(.9,{proj:false})),seq(B.shield(.2),B.cone(.8,{say:'Fires Razor Leaves',fx:{seed:1}})),
    seq(B.shield(.2),B.nova(.95,{say:'Then shakes the ground',r:2,fx:{slow:[.2,2]}}),B.control({seed:3},{n:2,say:'Seeds sprout from its back toward'}))));
kit({ids:[390,391,392],role:'Flame Monkey',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Ember','Mach Punch','Close Combat'],mvType:'Fire'},
  {d:(c,i)=>i===0?B.hit(1,{fx:{burn:.01}}).d(c,i):i===1?B.hit(1,{dash:1,to:'weak',fx:{burn:.01}}).d(c,i):`Unleashes a flurry on the target: 4 blows for ${DT(c,.42)} each, every blow adding 1 Burn. Then it vaults to the weakest enemy and strikes it for ${DT(c,.8)}.`,
   cast(c,tg,i){if(i<2)return(i?B.hit(1,{dash:1,to:'weak',fx:{burn:.01}}):B.hit(1,{fx:{burn:.01}})).cast(c,tg,i,{});
     for(let k=0;k<4;k++)schedule(k*.1,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.42);addStatus(tg,'burn',1,c);});
     schedule(.5,()=>{if(c.dead)return;const t=pickT(c,tg,'weak');if(!t)return;dashTo(c,t,true,.15);schedule(.17,()=>{if(!c.dead&&!t.dead)hitAb(c,t,.8);});});}});
kit({ids:[393,394,395],role:'Emperor',cls:'Mystic',cat:'spec',range:3,mana:[60,65,75],pf:[.8,1,1.15],names:['Bubble Beam','Brine','Hydro Pump'],mvType:'Water',tail:(c,i)=>i===2?'Its Steel armor gives it a shield of 10% <span class="s-hp">max HP</span> each cast.':''},
  {d:(c,i)=>i===0?B.hit(1,{fx:{slow:[.2,2]}}).d(c,i):i===1?`Hits the weakest enemy with Brine for ${DT(c,1.1)}, +50% if it's below half HP.`:`Gains a shield of ${HPT(c,.1)}, then fires a Hydro Pump through the target that hits every enemy in a line for ${DT(c,1.25)}.`,
   cast(c,tg,i){if(i===0)return B.hit(1,{fx:{slow:[.2,2]}}).cast(c,tg,i,{});if(i===1){const t=pickT(c,tg,'weak');fire(c,t,'#5aa8ff',()=>hitAb(c,t,1.1*(t.hp<t.maxHp/2?1.5:1)),{});return;}
     c.shield+=c.maxHp*.1;B.beam(1.25,{col:'#5aa8ff'}).cast(c,tg,2);}});

// --- Common Sinnoh Pokémon ---
kit({ids:[396,397,398],role:'Brave Raptor',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Quick Attack','Dual Wingbeat','Brave Bird'],mvType:'Flying'},
  {d:(c,i)=>i===0?B.hit(1,{dash:1}).d(c,i):i===1?B.hit(.55,{n:2,dash:1,to:'weak'}).d(c,i):`Dives onto the farthest enemy for ${DT(c,1.7)}, taking 10% of its own <span class="s-hp">max HP</span> in recoil.`,
   cast(c,tg,i){if(i<2)return(i?B.hit(.55,{n:2,dash:1,to:'weak'}):B.hit(1,{dash:1})).cast(c,tg,i,{});const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.7);hurt(c,c.maxHp*.08,null);boom(t,'#cfe8ff');});}});
kit({ids:[399,400],role:'Dam Builder',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.05],names:['Super Fang','Aqua Jet'],mvType:'Normal'},
  {d:(c,i)=>`${i?`Builds a dam: itself and adjacent allies gain a shield of ${HPT(c,.1)}. Then it`:'It'} bites the target with Super Fang, taking 10% of its current HP (at least ${DT(c,.8)}).`,
   cast(c,tg,i){if(i)B.shield(.1,{who:'adjacent'}).cast(c,tg,1);schedule(.25,()=>{if(c.dead||tg.dead)return;const v=Math.max(V(c,.8),tg.hp*.12);damage(c,tg,v,{ab:1,cat:'phys',tru:1,noCrit:1});});}});
kit({ids:[401,402],role:'Cricket Bard',cls:'Artillery',cat:'spec',range:2,mana:[60,65],pf:[.8,1.05],names:['Bug Bite','Bug Buzz'],mvType:'Bug'},
  staged(B.hit(1),{d:c=>`Plays a song through the target and enemies up to 2 hexes behind it for ${DT(c,.9)} (70% to the others), adding 2 Confusion to each.`,
    cast(c,tg){B.cone(.9,{depth:2,fx:{conf:2},col:'#e07a3a'}).cast(c,tg,1);if(!SIM.on)pfx('Music_Notes_Uproar',c.x,c.y-24,{sc:1.4,force:1});}}));
kit({ids:[403,404,405],role:'Gleam Lion',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Spark','Wild Charge','Supercell Slam'],mvType:'Electric',tail:(c,i)=>i===2?'<b>X-ray eyes:</b> it hunts the enemy with the most PP.':''},
  {d:(c,i)=>i===0?`Sparks the target for ${DT(c,1)}, adding 2 Paralysis.`:i===1?`Charges the target for ${DT(c,1.2)}, adding 3 Paralysis and taking 5% of its own <span class="s-hp">max HP</span> in recoil.`:`Leaps onto the enemy with the most PP and slams it for ${DT(c,1.5)}, adding 4 Paralysis and draining 15 PP.`,
   cast(c,tg,i){if(i===0){hitAb(c,tg,1);addStatus(tg,'para',2,c);return;}
     const t=i===2?(foesOf(c).sort((a,b)=>b.mana-a.mana)[0]||tg):tg;dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,i===2?1.5:1.2);addStatus(t,'para',i===2?4:3,c);if(i===2)t.mana=Math.max(0,t.mana-15);else hurt(c,c.maxHp*.05,null);if(!SIM.on)pfx('Spark',t.x,t.y-12,{sc:.5,force:1});});}});
kit({ids:[408,409],role:'Skull Bash',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.8,1.15],names:['Headbutt','Head Smash'],mvType:'Rock'},
  staged(B.hit(1.1,{proj:false,fx:{flinch:.3}}),{d:c=>`Head Smashes the target for ${DT(c,2.2)}, stunning it for 0.6s and taking 10% of its own <span class="s-hp">max HP</span> in recoil.`,
    cast(c,tg){hitAb(c,tg,2.2);stun(tg,.6);hurt(c,c.maxHp*.12,null);boom(tg,'#c8a070',2);}}));
kit({ids:[410,411],role:'Bulwark',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75],start:20,pf:[.8,1.05],names:['Iron Defense','Wide Guard'],mvType:'Steel'},
  staged(B.shield(.2,{def:12}),seq(B.shield(.15,{who:'adjacent',def:15}),B.hit(.8,{proj:false,fx:{shred:6}}))));
kit({ids:[412,413],role:'Cloak Shell',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[65,75],start:20,pf:[.8,1.05],names:['Protect','Leaf Storm'],mvType:'Bug'},
  staged(B.shield(.2),seq(B.shield(.2),B.blast(1,{what:'a Leaf Storm',r:1,fx:{seed:1}}))));
kit({ids:[414],role:'Night Moth',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.1,names:['Quiver Dance'],mvType:'Bug'},
  seq(B.ramp({spa:.08,as:.08}),B.hit(1.1,{what:'a Bug Buzz',fx:{sdef:6}})));
kit({ids:[415,416],role:'Hive Queen',cls:'Mystic',cat:'spec',range:[2,3],mana:[60,75],pf:[.8,1.1],names:['Bug Bite','Attack Order'],mvType:'Bug',tail:(c,i)=>i?'<b>Defend Order:</b> each cast also shields adjacent allies for 10% of their max HP.':''},
  staged(B.hit(1),{d:c=>`Orders her hive to attack: 6 Combee dive at enemies within 4 hexes for ${DT(c,.35)} each, and adjacent allies are shielded for 10% of their <span class="s-hp">max HP</span>.`,
    cast(c,tg){B.barrage(6,.35,{what:'Combee',col:'#ffd34d'}).cast(c,tg,1);B.shield(.1,{who:'adjacent'}).cast(c,tg,1);}}));
kit({ids:[417],role:'Spark Squirrel',cls:'Trickster',cat:'spec',range:2,mana:60,pf:1,names:['Nuzzle'],mvType:'Electric'},
  {d:c=>`Nuzzles the 3 nearest enemies for ${DT(c,.6)} each, adding 4 Paralysis, then calls Follow Me: a shield of ${HPT(c,.15)}.`,
   cast(c,tg){for(const q of foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,3)){hitAb(c,q,.6);addStatus(q,'para',4,c);}c.shield+=c.maxHp*.15;}});
kit({ids:[418,419],role:'Sea Weasel',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Aqua Jet','Aqua Jet'],mvType:'Water',tail:(c,i)=>i?'In rain it gains +20% <span class="s-as">Attack Speed</span>.':''},
  {d:(c,i)=>`Jets into the weakest enemy for ${DT(c,1)}${i?`, then spins into the next weakest for ${DT(c,.8)}`:''}.`,
   begin(c,i){if(i&&battle.weather==='rain')c.as*=1.2;},
   cast(c,tg,i){const ts=foesOf(c).sort((a,b)=>a.hp-b.hp).slice(0,i?2:1);ts.forEach((t,k)=>schedule(k*.25,()=>{if(c.dead||t.dead)return;dashTo(c,t,false,.14);schedule(.16,()=>{if(!c.dead&&!t.dead)hitAb(c,t,k?.8:1);});}));}});
kit({ids:[420,421],role:'Sunflower Gift',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[65,75],pf:[.8,1.05],names:['Synthesis','Flower Gift'],mvType:'Grass'},
  staged(B.heal(.85,{}),{d:c=>`Calls the sun (if no weather is active) and blooms: every ally heals ${HT(c,.3)} and gains +10% <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> for 4s.`,
    cast(c,tg){setWeather(c,'sun');B.heal(.3,{who:'team'}).cast(c,tg,1);B.buff({atk:.12,spa:.12},{who:'team',dur:4}).cast(c,tg,1);}}));
kit({ids:[422,423],role:'Sea Slug',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[65,75],start:20,pf:[.8,1.05],names:['Mud Bomb','Earth Power'],mvType:'Ground'},
  staged(seq(B.shield(.15),B.hit(.9,{fx:{slow:[.2,2]}})),{d:c=>`Recovers ${HT(c,.6)} of its own HP, then lets loose an Earth Power burst at the target that hits it and enemies within 1 hex for ${DT(c,1)} (70% to the others).`,
    cast(c,tg){heal(c,HEALV(c,.6));B.blast(1,{r:1,col:'#c08850'}).cast(c,tg,1,{});}}));
kit({ids:[425,426],role:'Balloon Spirit',cls:'Trickster',cat:'spec',range:3,mana:[60,65],pf:[.8,1.05],names:['Hex','Shadow Ball'],mvType:'Ghost',tail:(c,i)=>i?'<b>Aftermath:</b> when it faints, the Pokémon that knocked it out takes 15% of its max HP.':''},
  {d:(c,i)=>`Casts Hex on the target for ${DT(c,i?1.2:1)}, +20% for each different status condition on it.${i?' Then it drifts a Shadow Ball at the enemy with the most statuses for 60% as much.':''}`,
   begin(c,i){if(i)c.fx.aftermath=.15;},
   cast(c,tg,i){fire(c,tg,'#9b6bff',()=>hitAb(c,tg,(i?1.2:1)*(1+.2*stCount(tg))),{size:4});if(i){const o=foesOf(c).sort((a,b)=>stCount(b)-stCount(a))[0];if(o)schedule(.25,()=>{if(!c.dead&&!o.dead)fire(c,o,'#9b6bff',()=>hitAb(c,o,.72*(1+.2*stCount(o))),{size:4});});}}});
kit({ids:[427,428],role:'Bunny Boxer',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1.1],names:['Pound','High Jump Kick'],mvType:'Normal'},
  staged(B.hit(.5,{n:2,proj:false}),{d:c=>`Its first cast each battle is a Fake Out that flinches the target for 1s. After that it High Jump Kicks the farthest enemy for ${DT(c,1.6)}.`,
    cast(c,tg){if(!c.fakeOut){c.fakeOut=1;stun(tg,1);hitAb(c,tg,.6);return;}const t=pickT(c,tg,'far');dashTo(c,t,true,.22);schedule(.24,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.6,{type:'Fighting'});});}}));
kit({ids:[431,432],role:'Alley Boss',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Fake Out','Body Slam'],mvType:'Normal'},
  staged({d:c=>`Its first cast each battle is a Fake Out that flinches the target for 1s. After that it scratches for ${DT(c,1.1)}.`,cast(c,tg){if(!c.fakeOut){c.fakeOut=1;stun(tg,1);}hitAb(c,tg,1.1);}},
    seq(B.hit(1.3,{proj:false,fx:{para:3}}),B.shield(.1))));
kit({ids:[434,435],role:'Stink Bomb',cls:'Trickster',cat:'phys',range:[1,2],mana:[60,70],pf:[.8,1.05],names:['Poison Jab','Toxic Gas'],mvType:'Poison'},
  staged(B.hit(1,{proj:false,fx:{psn:.015}}),seq(B.zone(.06,{at:'cluster',r:1,dur:5,say:'Sprays a cloud of toxic gas',fx:{psn:.01},col:'#a35bd6'}),B.hit(1.1,{to:'strong',dash:1}))));
kit({ids:[436,437],role:'Bell Ward',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[70,80],start:20,pf:[.8,1.05],names:['Confuse Ray','Reflect'],mvType:'Steel'},
  staged(seq(B.shield(.2),B.control({conf:2},{to:'strong',say:'Fires a Confuse Ray at'})),seq(B.shield(.1,{who:'team'}),B.control({conf:2},{n:2,say:'Rings out at'}),B.hit(.9,{what:'a Gyro Ball'}))));
kit({ids:[441],role:'Mimic Bird',cls:'Trickster',cat:'spec',range:2,mana:55,pf:1.05,names:['Chatter'],mvType:'Flying'},
  B.cone(.9,{say:'Chatters noisily',depth:2,fx:{conf:2}}));
kit({ids:[442],role:'Keystone Spirits',cls:'Juggernaut',type:'guard',cat:'spec',range:3,mana:75,start:20,pf:1.1,names:['Shadow Ball'],mvType:'Ghost'},
  {d:c=>`Gains a shield of ${HPT(c,.2)} and releases 6 of its 108 spirits, which haunt random enemies within 4 hexes for ${DT(c,.32)} each and add 1 Confusion.`,
   cast(c,tg){c.shield+=c.maxHp*.2;B.barrage(6,.32,{what:'spirits',fx:{conf:1},col:'#7a5ad0'}).cast(c,tg,0);}});
kit({ids:[449,450],role:'Sand Hippo',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[70,80],start:20,pf:[.85,1.1],names:['Sand Tomb','Earthquake'],mvType:'Ground',tail:()=>'<b>Sand Stream:</b> starts the battle with a sandstorm if no weather is active.'},
  {d:(c,i)=>i?`Slacks off to heal ${HT(c,.5)} of its own HP, then sets off an Earthquake that hits every enemy within 2 hexes for ${DT(c,1)}.`:B.zone(.08,{r:1,dur:4,say:'Traps the target in a Sand Tomb',fx:{slow:[.3,1]},col:'#d8b070'}).d(c,i),
   begin(c){schedule(.1,()=>setWeather(c,'sand'));},
   cast(c,tg,i){if(!i)return B.zone(.08,{r:1,dur:4,fx:{slow:[.3,1]},col:'#d8b070'}).cast(c,tg,i);heal(c,HEALV(c,.5));schedule(.25,()=>{if(!c.dead)B.nova(1,{r:2,col:'#c08850'}).cast(c,tg,1);});}});
kit({ids:[451,452],role:'Scorpion',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Poison Fang','Cross Poison'],mvType:'Poison',tail:(c,i)=>i?'<b>Sniper:</b> its crits deal +30% damage.':''},
  {d:(c,i)=>i?`Slashes the target twice for ${DT(c,.7)} each with +35% crit chance; each slash adds 4 Poison.`:`Bites the target for ${DT(c,1)} and adds 4 Poison.`,
   cast(c,tg,i){if(!i){hitAb(c,tg,1);addStatus(tg,'poison',4,c);return;}for(let k=0;k<2;k++)schedule(k*.15,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.7,{cr:.35});addStatus(tg,'poison',4,c);});}});
kit({ids:[453,454],role:'Toxic Boxer',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.1],names:['Poison Jab','Sucker Punch'],mvType:'Poison',tail:(c,i)=>i?'Deals +30% damage to poisoned enemies.':''},
  {d:(c,i)=>i?`Sucker Punches the enemy about to cast (the most PP) for ${DT(c,1.2)} (+30% if it's poisoned), adding 5 Poison.`:B.hit(1,{proj:false,fx:{psn:.015}}).d(c,i),
   cast(c,tg,i){if(!i)return B.hit(1,{proj:false,fx:{psn:.015}}).cast(c,tg,i,{});const t=foesOf(c).sort((a,b)=>b.mana-a.mana)[0]||tg;dashTo(c,t,true,.15);schedule(.17,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.2*(t.poison?1.3:1));addStatus(t,'poison',5,c);});}});
kit({ids:[455],role:'Flytrap',cls:'Trickster',cat:'phys',range:2,mana:65,pf:1.1,names:['Power Whip'],mvType:'Grass'},
  {d:c=>`Lashes a vine around the farthest enemy and drags it next to itself, then Power Whips it for ${DT(c,1.3)} and plants 3 Leech Seed.`,
   cast(c,tg){const t=pickT(c,tg,'far');pullTo(c,t);schedule(.3,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.3);addStatus(t,'seed',3,c);});}});
kit({ids:[456,457],role:'Neon Fish',cls:'Mystic',cat:'spec',range:3,mana:[60,65],pf:[.8,1.05],names:['Water Pulse','Hydro Pump'],mvType:'Water'},
  staged(B.hit(1,{fx:{conf:2}}),seq(B.hit(1.3,{to:'strong',fx:{conf:2}}),B.control({conf:1},{n:2,say:'Its glowing fins dazzle'}))));
kit({ids:[459,460],role:'Frost Tree',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:[70,80],start:20,pf:[.85,1.1],names:['Powder Snow','Blizzard'],mvType:'Ice',tail:()=>'<b>Snow Warning:</b> starts the battle with snow if no weather is active.'},
  {d:(c,i)=>`${B.shield(i?.2:.15).d(c,i)} Then it ${i?`whips up a Blizzard: every enemy within 2 hexes takes ${DT(c,.95)} and gains 3 Chill.`:`blows Powder Snow at the target for ${DT(c,.9)}, adding 2 Chill.`}`,
   begin(c){schedule(.1,()=>setWeather(c,'snow'));},
   cast(c,tg,i){c.shield+=c.maxHp*(i?.2:.15);schedule(.3,()=>{if(c.dead)return;if(!i){if(!tg.dead){hitAb(c,tg,.9);addStatus(tg,'chill',2,c);}return;}
     for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,.95);addStatus(q,'chill',3,c);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:1.6,force:1});});}});
// Rotom: the player picks its appliance with the Rotom Catalog (any time while planning) and can swap freely.
const ROTOM_APP={
  heat:{fid:10008,n:'Heat Rotom',obj:'Oven',ty:'Fire',d:'adds 4 Burn'},
  wash:{fid:10009,n:'Wash Rotom',obj:'Washing machine',ty:'Water',d:'knocks it back and adds 2 Confusion'},
  frost:{fid:10010,n:'Frost Rotom',obj:'Fridge',ty:'Ice',d:'adds 4 Chill'},
  fan:{fid:10011,n:'Fan Rotom',obj:'Fan',ty:'Flying',d:'also blows through every enemy behind it for 70%'},
  mow:{fid:10012,n:'Mow Rotom',obj:'Lawn mower',ty:'Grass',d:'plants 4 Leech Seed'},
};
const rotomDex=u=>u&&u.app&&ROTOM_APP[u.app]?ROTOM_APP[u.app].fid:u.dex;
function rotomHit(c,tg,f){const A=ROTOM_APP[f],ty=A?A.ty:'Electric';
  fire(c,tg,TYPES[ty],()=>{hitAb(c,tg,1.1,{type:ty});
    if(f==='heat')addStatus(tg,'burn',4,c);if(f==='wash'){knock(c,tg);addStatus(tg,'conf',2,c);}if(f==='frost')addStatus(tg,'chill',4,c);if(f==='mow')addStatus(tg,'seed',4,c);if(!A)addStatus(tg,'para',4,c);
    if(f==='fan')for(const q of alive(tg.team).filter(q=>q!==tg&&hdist(q,tg)<=2&&hdist(q,c)>hdist(tg,c)))hitAb(c,q,.77,{type:ty});typeHit(tg,ty,1.1);},{type:ty,size:4});}
kit({ids:[479],role:'Appliance Ghost',cls:'Mystic',cat:'spec',range:3,mana:60,pf:1.1,names:['Thunderbolt'],mvType:'Electric',
  tail:c=>'<b>Rotom Catalog:</b> tap the catalog icon over Rotom while planning to choose its appliance; you can change it any time. Each appliance also changes its type (and sets) and raises its stats.'},
  {d:c=>{const a=c&&c.u&&c.u.app,A=ROTOM_APP[a];return A?`${A.n}: possesses the ${A.obj.toLowerCase()} and attacks the target for ${DT(c,1.1)} (${A.ty}), which ${A.d}.`:
     `Unplugged: calls down 5 lightning strikes on random enemies anywhere on the board, each dealing ${DT(c,.45)} and adding 2 Paralysis.`;},
   begin(c){const A=ROTOM_APP[c.u&&c.u.app];if(A){transform(c,A.fid,{label:A.n+'!',col:TYPES[A.ty]});c.app=c.u.app;}},
   cast(c,tg){if(c.app)return rotomHit(c,tg,c.app);
     for(let k=0;k<5;k++)schedule(k*.13,()=>{if(c.dead)return;const fs=foesOf(c);if(!fs.length)return;const t=pick(fs);hitAb(c,t,.45,{type:'Electric'});addStatus(t,'para',2,c);
       if(!SIM.on){fx.push({line:1,x1:t.x+rnd(-6,6),y1:t.y-150,x2:t.x,y2:t.y-8,life:.3,max:.3,col:'#ffe14d',w:2});pfx('Discharge_Hit',t.x,t.y-10,{sc:.35,force:1});}});}});
// catalog icon over owned Rotom while planning
const CATIMG=Object.assign(new Image(),{src:'assets/items/rotom-catalog.png'});
function rotomOwned(){if(!run)return[];const out=[];for(const b of boardUnits())if(b.u.root===479){const p=hexXY(b.c,b.r);out.push({u:b.u,x:p.x+10,y:p.y-30});}
  run.bench.forEach((u,i)=>{if(u&&u.root===479){const p=benchXY(i);out.push({u,x:p.x+10,y:p.y-30});}});return out;}
function drawRotomChips(t){if(mode!=='plan'||drag||itemDrag)return;for(const r of rotomOwned()){const y=r.y+Math.sin(t*3)*1.5;ctx.fillStyle='#1b2430';ctx.fillRect(r.x-6,y-6,12,12);ctx.fillStyle='#f7f6ee';ctx.fillRect(r.x-5,y-5,10,10);if(CATIMG.complete&&CATIMG.naturalWidth)drawIcon(CATIMG,r.x-5,y-5,10,10);}}
function rotomChipAt(x,y){if(mode!=='plan')return null;return rotomOwned().find(r=>Math.abs(x-r.x)<8&&Math.abs(y-r.y)<8)||null;}
function showRotomCatalog(u){hideTip();
  const opts=[[null,479,'Unplugged','Electric','Lightning strikes on random enemies across the board (5 strikes, 2 Paralysis each)']].concat(Object.entries(ROTOM_APP).map(([k,A])=>[k,A.fid,A.n,A.ty,`${A.obj}: ${A.d}`]));
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Rotom Catalog</h1><p class="sub">Pick an appliance for ${esc(nameOf(u))}. You can switch any time while planning.</p>
    <div class="evo">${opts.map(([k,fid,n,ty,d])=>`<button class="pick win${(u.app||null)===k?' cur':''}" data-k="${k||''}"><img src="${por(fid)}" alt=""><h2>${esc(n)}</h2><div class="chips">${typeChips(fid)}</div><div class="lbl">${esc(d)}</div></button>`).join('')}</div>
    <button class="btn" id="back">Keep it as it is</button></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{u.app=b.dataset.k||null;if(u.app)ensure(ROTOM_APP[u.app].fid);ov.innerHTML='';toast(u.app?`Rotom possessed the ${ROTOM_APP[u.app].obj.toLowerCase()}!`:'Rotom left its appliance.');renderUI();});
  $('back').onclick=()=>{ov.innerHTML='';};ov.querySelector('.pick').focus();}

// --- Sinnoh legends ---
kit({ids:[480],role:'Being of Knowledge',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.1,names:['Yawn'],mvType:'Psychic'},
  {d:c=>`Shares its knowledge: every ally gains 15 PP and heals ${HT(c,.25)}. Then it makes the strongest enemy drowsy, putting it to sleep for 1.5s after a 1s delay.`,
   cast(c,tg){for(const a of alive(c.team)){gainMana(a,15);heal(a,HEALV(c,.25));}const t=pickT(c,tg,'strong');schedule(1,()=>{if(!c.dead&&t&&!t.dead)stun(t,1.5);});}});
kit({ids:[481],role:'Being of Emotion',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.1,names:['Healing Wish'],mvType:'Psychic'},
  seq(B.heal(.5,{who:'team'}),B.control({conf:2},{n:3,say:'Stirs up the feelings of'})));
kit({ids:[482],role:'Being of Willpower',cls:'Striker',cat:'spec',range:3,mana:60,pf:1.2,names:['Nasty Plot'],mvType:'Psychic'},
  seq(B.ramp({spa:.12}),B.hit(1.4,{to:'weak'})));
kit({ids:[483],role:'Time Lord',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.15,names:['Roar of Time'],mvType:'Dragon'},
  {d:c=>`Roars, bending time: fires a beam through the target that hits every enemy in a line for ${DT(c,1.8)}, then every enemy is slowed by 25% for 3s. Dialga must rest for 1s afterwards.`,
   cast(c,tg){B.beam(1.8,{col:'#5a8ae0'}).cast(c,tg,0);for(const q of foesOf(c))applyFx(c,q,{slow:[.25,3]},0);c.busy=Math.max(c.busy,1);}});
kit({ids:[484],role:'Space Render',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.15,names:['Spacial Rend'],mvType:'Dragon'},
  {d:c=>`Folds space to pull the farthest enemy next to the target, then rends a cone through the target and enemies up to 3 hexes behind it for ${DT(c,1.5)} (70% to the others), with +30% crit chance.`,
   cast(c,tg){const far=pickT(c,tg,'far');if(far&&far!==tg){const h=nbrs(tg.c,tg.r).find(h=>!occupied(h.c,h.r,far));if(h){const p=hexXY(h.c,h.r);far.move={c:h.c,r:h.r,fx:far.x,fy:far.y,tx:p.x,ty:p.y,t:0,dur:.2};}}
     schedule(.25,()=>{if(c.dead||tg.dead)return;const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=3&&hdist(f,c)>=hdist(tg,c))];for(const q of ts)hitAb(c,q,1.5*(q===tg?1:.7),{cr:.3});lineFx(c,tg,'#ff9be6',3,.3);});}});
kit({ids:[485],role:'Magma Forge',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:80,start:20,pf:1.1,names:['Magma Storm'],mvType:'Fire'},
  seq(B.shield(.2),B.zone(.12,{at:'cluster',r:1,dur:5,say:'Traps enemies in a Magma Storm',fx:{burn:.01},col:'#ff7a2c'})));
kit({ids:[486],role:'Slow Titan',cls:'Juggernaut',cat:'phys',range:1,mana:80,start:0,pf:1.2,names:['Crush Grip'],mvType:'Normal',tail:()=>'<b>Slow Start:</b> −50% <span class="s-atk">Attack</span> and <span class="s-as">Attack Speed</span> for the first 6s of battle.'},
  {d:c=>`Crushes the target in its grip for ${DT(c,1)}, up to triple damage the healthier the target is.`,
   begin(c){c.atk*=.5;c.as*=.5;schedule(6,()=>{if(!c.dead){c.atk*=2;c.as*=2;if(!SIM.on)texts.push({x:c.x,y:c.y-36,txt:'Got its act together!',col:'#ffe27a',life:1.2,label:1});}});},
   cast(c,tg){hitAb(c,tg,1+2*tg.hp/tg.maxHp);boom(tg,'#ffffff',2);}});
kit({ids:[487],role:'Distortion',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.15,names:['Shadow Force'],mvType:'Ghost'},
  {d:c=>`Vanishes into the Distortion World for 1s (can't be targeted), then strikes the weakest enemy for ${DT(c,1.8)}, ignoring 50% of its defenses and shields.`,
   cast(c,tg){B.airborne(1).cast(c);schedule(1.05,()=>{if(c.dead)return;const t=pickT(c,tg,'weak');if(!t)return;dashTo(c,t,true,.12);schedule(.14,()=>{if(c.dead||t.dead)return;t.shield*=.5;hitAb(c,t,1.8,{pen:.5});boom(t,'#7a5ad0',2);});});}});
kit({ids:[488],role:'Lunar Dancer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:['Moonlight'],mvType:'Psychic'},
  seq(B.heal(.5,{who:'team',cleanse:1}),B.shield(.2,{who:'lowest'})));
kit({ids:[489],role:'Sea Drifter',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1,names:['Aqua Ring'],mvType:'Water'},
  seq(B.heal(.8,{cleanse:1}),B.zone(0,{at:'self',r:1,dur:5,heal:.02,say:'Surrounds itself with an Aqua Ring'})));
kit({ids:[490],role:'Sea Prince',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Tail Glow'],mvType:'Water'},
  {d:c=>`Its tail glows: it shakes off its own status conditions and gains +10% <span class="s-spa">Sp. Atk</span> for the battle (stacks). Then it fires a Hydro Pump at the target for ${DT(c,1.3)}.`,
   cast(c,tg){cureStatus(c);c.spa*=1.12;schedule(.25,()=>{if(!c.dead&&!tg.dead)fire(c,tg,'#5aa8ff',()=>hitAb(c,tg,1.3),{size:4});});}});
kit({ids:[491],role:'Nightmare',cls:'Trickster',cat:'spec',range:3,mana:80,pf:1.2,names:['Dark Void'],mvType:'Dark',tail:()=>'<b>Bad Dreams:</b> sleeping or stunned enemies take 3% of their max HP per second.'},
  {d:c=>`Engulfs the 3 nearest enemies in a Dark Void, putting them to sleep for 1.5s, then hits the target with a Dark Pulse for ${DT(c,1.1)}.`,
   begin(c){every(c,1,()=>{for(const q of foesOf(c))if(q.stun>0)hurt(q,q.maxHp*.03,c);});},
   cast(c,tg){for(const q of foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,3)){stun(q,1.5);if(!SIM.on)pfx('Dark_Void_Sparkle',q.x,q.y-14,{force:1});}schedule(.25,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.1);});}});
kit({ids:[492],role:'Gratitude',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.15,names:['Seed Flare'],mvType:'Grass'},
  {d:c=>`Fires a Seed Flare at the biggest group of enemies: ${DT(c,1.2)} to the center and 70% to adjacent enemies, planting 3 Leech Seed in each and lowering <span class="s-def">Sp. Def</span> by 10. Then every ally heals ${HT(c,.3)}.`,
   cast(c,tg){B.blast(1.2,{at:'cluster',r:1,fx:{seed:3,sdef:10},col:'#a8e070'}).cast(c,tg,0,{});B.heal(.3,{who:'team'}).cast(c,tg,0);}});
kit({ids:[493],role:'Original One',cls:'Mystic',cat:'spec',range:3,mana:90,pf:1.2,names:['Judgment'],mvType:'Normal'},
  {d:c=>`Passes Judgment: every enemy takes ${DT(c,1.1)} and receives 3 stacks of a random status condition.`,
   cast(c,tg){for(const q of foesOf(c)){hitAb(c,q,1.1);addStatus(q,pick(['burn','poison','para','chill','conf','seed']),3,c);if(!SIM.on)pfx('Light_Ball_Yellow',q.x,q.y-40,{sc:.3,force:1});}}});

// tuning pass: Gen IV kit damage against generic units of the same cost
for(const[d,m]of Object.entries({389:.6,392:.75,395:.7,409:.85,419:.85,435:.8,441:.7,460:.7,450:.75,423:.9,426:.9,457:.9,417:.9,402:.9,493:.8,484:.8,482:.9,
  400:1.2,411:1.2,432:1.1,428:1.2,479:1.15,437:1.1,414:1.05}))tuneSig(+d,m);
for(const[d,m]of Object.entries({493:.85,484:.85,483:.85,487:.85,491:.9,485:.9}))tuneSig(+d,m);
