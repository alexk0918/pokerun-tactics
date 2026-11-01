/* Generation VII signature kits (Alola lines). */

// Rowlet line: an archer that pins the back line with Spirit Shackle
kit({ids:[722,723,724],role:'Arrow Quill',cls:'Trickster',cat:'phys',range:3,mana:[60,65,70],pf:[.8,.95,1.15],names:['Leafage','Razor Leaf','Spirit Shackle'],mvType:'Grass'},
  staged(B.hit(1.1),B.barrage(3,.55,{what:'razor leaves',col:'#7fe3a8'}),B.hit(1.7,{to:'far',pen:.2,col:'#8a6ce0',fx:{slow:[.4,3],stun:.6}})));

// Litten line: a heel wrestler (Incineroar is a Fire tank)
kit({ids:[725,726,727],role:'Heel Wrestler',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,65,75],start:20,pf:[.85,1,1.15],names:['Ember','Fire Fang','Darkest Lariat'],mvType:'Fire',
  tail:(c,i)=>i===2?'<b>Intimidate:</b> at the start of battle, enemies within 2 hexes lose 15% <span class="s-atk">Attack</span> for 6s.':''},
  {d:(c,i)=>i===0?B.hit(1,{fx:{burn:.01}}).d(c,i):i===1?`${B.shield(.15).d(c,i)} Then it bites the target for ${DT(c,1.2)}, adding 3 Burn with a 30% chance to flinch.`:`${B.shield(.25).d(c,i)} Then it spins a Darkest Lariat into every adjacent enemy for ${DT(c,1)}, ignoring 50% of their Defense, and heals for 25% of the damage dealt.`,
   begin(c,i){if(i===2)for(const o of foesOf(c).filter(o=>hdist(o,c)<=2&&!o.fx.clear))debuff(o,'atk',.15,6);},
   cast(c,tg,i){if(i===0)return B.hit(1,{fx:{burn:.01}}).cast(c,tg,i,{});B.shield(i===1?.15:.25).cast(c,tg,i);
     schedule(.25,()=>{if(c.dead)return;
       if(i===1){if(tg.dead)return;hitAb(c,tg,1.2);addStatus(tg,'burn',3,c);if(Math.random()<.3)stun(tg,.35);return;}
       let tot=0;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))tot+=hitAb(c,q,1,{pen:.5})||0;heal(c,tot*.25);if(!SIM.on){ring(c.x,c.y-8,'#ff6a3c');burst(c.x,c.y-10,'#c03030',16,1.2);}});}});

// Popplio line: a pop-star soprano whose song heals
kit({ids:[728,729,730],role:'Soprano',cls:'Mystic',cat:'spec',range:3,mana:[60,70,80],pf:[.8,.95,1.1],names:['Water Gun','Bubble Beam','Sparkling Aria'],mvType:'Water'},
  staged(B.hit(1.1),B.beam(1,{what:'a Bubble Beam',col:'#8fd3ff',fx:{slow:[.2,2]}}),seq(B.barrage(5,.6,{what:'singing bubbles',col:'#9fe0ff'}),B.heal(.25,{who:'team',cleanse:1}))));

// Pikipek line: Beak Blast burns anyone who touches the heating beak
kit({ids:[731,732,733],role:'Beak Cannon',cls:'Artillery',cat:'phys',range:3,mana:[55,65,75],pf:[.8,.95,1.15],names:['Peck','Rock Blast','Beak Blast'],mvType:'Flying'},
  {d:(c,i)=>i===0?B.hit(1).d(c,i):i===1?B.barrage(3,.5,{what:'rocks'}).d(c,i):`Heats its beak for 1s (melee attackers that hit it gain 3 Burn), then fires a Beak Blast at the biggest group of enemies: ${DT(c,1.6)} to the center and 70% to adjacent enemies.`,
   cast(c,tg,i){if(i<2)return(i?B.barrage(3,.5,{what:'rocks'}):B.hit(1)).cast(c,tg,i,{});c.beakT=combatT+1;c.busy=Math.max(c.busy,1.05);if(!SIM.on)burst(c.x,c.y-14,'#ff9a3c',10,.8);
     schedule(1,()=>{if(!c.dead)B.blast(1.6,{at:'cluster',col:'#ff9a3c'}).cast(c,tg,i,{});});},
   hitBy(c,src,o){if(c.beakT>combatT&&src&&src.team!==c.team&&o.auto&&hdist(src,c)<=1)addStatus(src,'burn',3,c);}});

// Yungoos line: Stakeout punishes fresh targets
kit({ids:[734,735],role:'Stakeout',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Bite','Crunch'],mvType:'Normal',tail:()=>'<b>Stakeout:</b> its move deals +50% damage to enemies above 75% HP.'},
  {d:(c,i)=>`Bites the target for ${DT(c,i?1.4:1.1)}${i?', lowering its <span class="s-def">Defense</span> by 10':''}, with a 30% chance to flinch.`,
   cast(c,tg,i){if(tg.dead)return;hitAb(c,tg,(i?1.4:1.1)*(tg.hp>tg.maxHp*.75?1.5:1));if(i)tg.def=Math.max(0,tg.def-10);if(Math.random()<.3)stun(tg,.35);boom(tg,'#e8d080');}});

// Grubbin line: Vikavolt's Zap Cannon; Charjabug is a living battery
kit({ids:[736,737,738],role:'Bug Railgun',cls:'Artillery',cat:'spec',range:3,mana:[55,65,80],pf:[.8,.9,1.2],names:['Bug Bite','Spark','Zap Cannon'],mvType:'Electric',
  tail:(c,i)=>i===1?'<b>Battery:</b> adjacent allies\' moves deal +10% damage.':i===2?'<b>Levitate:</b> immune to Ground moves.':'',
  begin(c,i){if(i===1)for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)a.abm+=.1;if(i===2)c.fx.immune=[...(c.fx.immune||[]),'Ground'];}},
  staged(B.hit(1),B.hit(.8,{fx:{para:1}}),B.beam(1.6,{charge:.6,what:'a Zap Cannon',col:'#ffe14d',fx:{stun:.7}})));

// Crabrawler line: a boxer with an Ice Hammer
kit({ids:[739,740],role:'Ice Boxer',cls:'Bruiser',cat:'phys',range:1,mana:[55,70],pf:[.85,1.15],names:['Power-Up Punch','Ice Hammer'],mvType:'Ice',tail:()=>'<b>Iron Fist:</b> punches deal +20% damage (included).'},
  staged(seq(B.hit(1.2,{proj:false}),B.ramp({atk:.1})),{d:c=>`Slams an Ice Hammer down on the target and every enemy next to it for ${DT(c,1.6*1.2)} (70% to the others), adding 3 Chill. Its own <span class="s-as">Attack Speed</span> drops 10% for 3s.`,
    cast(c,tg){if(tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,1.6*1.2*(q===tg?1:.7));addStatus(q,'chill',3,c);}debuff(c,'as',.1,3);boom(tg,'#bff0ff',3);}}));

// Oricorio: the dancer copies its allies' rhythm
kit({ids:[741],role:'Dancer',cls:'Trickster',cat:'spec',range:3,mana:60,pf:1.05,names:['Revelation Dance'],mvType:'Fire',tail:()=>'<b>Dancer:</b> whenever an ally within 2 hexes uses its move, it gains 10 PP.'},
  {d:c=>`${B.cone(1.2,{say:'Dances a Revelation Dance',depth:2}).d(c,0)} Then a Feather Dance lowers their <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by 15% for 4s.`,
   begin(c){every(c,.5,()=>{for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=2&&a.casts>(a.dnSeen||0)){a.dnSeen=a.casts;gainMana(c,10);}});},
   cast(c,tg){B.cone(1.2,{depth:2,col:'#ff9a5c',fx:{weaken:.15}}).cast(c,tg,0);}});

// Cutiefly line: Pollen Puff heals allies and hurts enemies
kit({ids:[742,743],role:'Pollen Puffer',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Fairy Wind','Pollen Puff'],mvType:'Bug'},
  staged(seq(B.hit(.9),B.heal(.5)),seq(B.heal(1),B.hit(.9,{fx:{conf:1}}),B.buff({as:.15},{who:'adjacent',dur:4}))));

// Rockruff line: Accelerock strikes first
kit({ids:[744,745],role:'Dusk Wolf',cls:'Striker',cat:'phys',range:1,mana:[55,60],start:30,pf:[.85,1.1],names:['Rock Throw','Accelerock'],mvType:'Rock',tail:(c,i)=>i?'<b>Tough Claws:</b> +10% damage.':'',begin(c,i){if(i)c.dmg+=.1;}},
  staged(B.hit(1.1),B.hit(.7,{n:2,dash:1,to:'weak',fx:{flinch:.3}})));

// Wishiwashi: one tiny fish, or a giant school (Schooling comes from its ability)
kit({ids:[746],role:'School',cls:'Juggernaut',cat:'spec',range:1,mana:70,start:20,pf:1,names:['Surf'],mvType:'Water'},
  B.nova(.65,{say:'Surfs a huge wave',r:1,col:'#5ab8ff',fx:{knock:1}}));

// Mudbray line: Stamina makes Mudsdale harder with every hit
kit({ids:[749,750],role:'Draft Horse',cls:'Juggernaut',cat:'phys',range:1,mana:[60,75],start:20,pf:[.85,1.1],names:['Bulldoze','High Horsepower'],mvType:'Ground',tail:(c,i)=>i?'<b>Stamina:</b> each hit it takes gives +2 Defense (up to +40).':''},
  {...staged(B.nova(.8,{say:'Bulldozes the ground',r:1,fx:{slow:[.25,3]}}),B.hit(1.6,{proj:false,fx:{stun:.5}})),
   hitBy(c){if(c.kit.si&&(c.stam||0)<40){c.stam=(c.stam||0)+2;c.def+=2;}}});

// Dewpider line: Water Bubble supercharges its Water moves
kit({ids:[751,752],role:'Water Bubble',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.1],names:['Bubble','Liquidation'],mvType:'Water',tail:(c,i)=>i?'<b>Water Bubble:</b> its Water moves deal +50% damage.':'',
  begin(c,i){if(i){c.fx.typeBoost=Object.assign({},c.fx.typeBoost||{});c.fx.typeBoost.Water=(c.fx.typeBoost.Water||0)+.5;}}},
  staged(seq(B.shield(.15),B.hit(1)),seq(B.shield(.2),B.hit(1.2,{proj:false,fx:{shred:10}}))));

// Fomantis line: Solar Blade is instant in the sun
kit({ids:[753,754],role:'Bloom Mantis',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Razor Leaf','Solar Blade'],mvType:'Grass',tail:(c,i)=>i?'<b>Contrary:</b> each Solar Blade also raises its <span class="s-atk">Attack</span> by 10% (stacks).':''},
  staged(B.hit(1.1),{d:c=>`Gathers sunlight for 0.5s (instant in harsh sun), then slashes a Solar Blade through the target and the enemy behind it for ${DT(c,1.7)}.`,
    cast(c,tg){const go=()=>{if(c.dead||tg.dead)return;const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=1&&hdist(f,c)>hdist(tg,c))].slice(0,2);for(const q of ts)hitAb(c,q,1.7);c.atk*=1.1;boom(tg,'#c8ff7a',2);};
      if(battle.weather==='sun')go();else{c.busy=Math.max(c.busy,.55);schedule(.5,go);}}}));

// Morelull line: saps the strongest enemy to heal allies
kit({ids:[755,756],role:'Glow Mushroom',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Absorb','Strength Sap'],mvType:'Grass'},
  staged(seq(B.hit(.9),B.heal(.5)),{d:c=>`Saps the strongest enemy, lowering its <span class="s-atk">Attack</span> by 20% for 4s and putting enemies next to it to sleep for 1s (Spore). Then it heals the most injured ally for ${HT(c,1.1)}.`,
    cast(c,tg){const t=pickT(c,tg,'strong');if(t){debuff(t,'atk',.2,4);for(const q of near(t,1))applyFx(c,q,{sleep:1},1);if(!SIM.on)pfx('Spore',t.x,t.y-12,{sc:.8,force:1});}B.heal(1.1).cast(c,tg,1);}}));

// Salandit line: badly poisons the bulkiest enemies
kit({ids:[757,758],role:'Toxic Queen',cls:'Trickster',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Poison Gas','Toxic'],mvType:'Poison',tail:(c,i)=>i?'<b>Corrosion:</b> its Flamethrower deals +15% damage to poisoned enemies.':''},
  staged(B.blast(.9,{at:'cluster',r:1,fx:{psn:.01}}),{d:c=>`Badly poisons the 3 enemies with the most HP (5 Poison each), then hits the target with a Flamethrower for ${DT(c,1.2)}, adding 2 Burn.`,
    cast(c,tg){for(const q of foesOf(c).sort((a,b)=>b.hp-a.hp).slice(0,3)){addStatus(q,'poison',5,c);if(!SIM.on)pfx('Gunk_Shot_Hit',q.x,q.y-12,{sc:.6,force:1});}
      schedule(.3,()=>{if(c.dead||tg.dead)return;fire(c,tg,'#ff7a3c',()=>{hitAb(c,tg,1.2*(tg.poison?1.15:1));addStatus(tg,'burn',2,c);});});}}));

// Stufful line: a hug you don't walk away from
kit({ids:[759,760],role:'Bear Hug',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.1],names:['Brutal Swing','Hammer Arm'],mvType:'Fighting',tail:()=>'<b>Fluffy:</b> takes 20% less physical damage.',begin(c){c.fx.physDr=(c.fx.physDr||0)+.2;}},
  staged(B.nova(.9,{say:'Swings wildly',r:1}),{d:c=>`Grabs the target in a crushing hug, stunning it for 1s, then brings down a Hammer Arm for ${DT(c,1.7)}.`,
    cast(c,tg){if(tg.dead)return;stun(tg,1);c.busy=Math.max(c.busy,.5);schedule(.5,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.7);boom(tg,'#ffb36b',3);});}}));

// Bounsweet line: Tsareena's Trop Kick, and Queenly Majesty
kit({ids:[761,762,763],role:'Fruit Queen',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Rapid Spin','Double Slap','Trop Kick'],mvType:'Grass',
  tail:(c,i)=>i===2?'<b>Queenly Majesty:</b> enemies within 2 hexes gain PP 15% slower.':'',begin(c,i){if(i===2)for(const o of foesOf(c).filter(o=>hdist(o,c)<=2))o.ppMul*=.85;}},
  staged(B.nova(.8,{say:'Spins',r:1}),B.hit(.6,{n:2,proj:false}),B.hit(1.5,{dash:1,to:'weak',fx:{weaken:.2}})));

// Comfey: drapes healing leis on the two most injured allies
kit({ids:[764],role:'Flower Lei',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1,names:['Floral Healing'],mvType:'Fairy',tail:()=>'<b>Triage:</b> heals 20% more on allies below half HP.'},
  {d:c=>`Drapes flower leis on the two most injured allies, healing each for ${HT(c,.8)} and curing their status conditions.`,
   cast(c,tg){for(const a of alive(c.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp).slice(0,2)){heal(a,HEALV(c,.8)*(a.hp<a.maxHp/2?1.2:1));cureStatus(a);if(!SIM.on)burst(a.x,a.y-12,'#ffb3e6',10,.7);}}});

// Oranguru: Instruct makes an ally cast right now
kit({ids:[765],role:'Sage',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.05,names:['Instruct'],mvType:'Psychic'},
  {d:c=>`Instructs the ally closest to full PP, filling its PP so it uses its move at once, then blasts the target with Psychic for ${DT(c,1.1)}.`,
   cast(c,tg){const a=alive(c.team).filter(a=>a!==c&&a.maxMana>0).sort((x,y)=>y.mana/y.maxMana-x.mana/x.maxMana)[0];if(a){a.mana=a.maxMana;if(!SIM.on)spark(a.x,a.y-16,'#ff9be6',8);}
     fire(c,tg,'#ff9be6',()=>hitAb(c,tg,1.1));}});

// Passimian: plays as a team
kit({ids:[766],role:'Ball Thrower',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['U-turn'],mvType:'Fighting',tail:()=>'<b>Receiver:</b> +5% damage and Attack Speed for each other Fighting ally.'},
  {d:c=>`Hurls a berry ball at the weakest enemy for ${DT(c,1.4)}, then U-turns, giving the nearest ally +15 PP.`,
   begin(c){const n=alive(c.team).filter(a=>a!==c&&D[a.dex].t.includes('Fighting')).length;c.dmg+=.05*n;c.as*=1+.05*n;},
   cast(c,tg){const t=pickT(c,tg,'weak');fire(c,t,'#e8c890',()=>hitAb(c,t,1.4),{arc:1,dur:.45,lift:60,side:0,size:4});const a=alive(c.team).filter(a=>a!==c).sort((x,y)=>hdist(x,c)-hdist(y,c))[0];if(a)gainMana(a,15);}});

// Wimpod line: Golisopod's First Impression and Emergency Exit
kit({ids:[767,768],role:'Armored Knight',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[55,70],start:25,pf:[.8,1.15],names:['Struggle Bug','First Impression'],mvType:'Bug',
  tail:(c,i)=>i?'<b>Emergency Exit:</b> the first time it drops below half HP, it gains a shield of 30% max HP.':''},
  {...staged(seq(B.shield(.15),B.hit(.8,{fx:{weaken:.1}})),{d:c=>`${B.shield(.2).d(c,1)} Then it strikes the target with First Impression for ${DT(c,1.6)} (+50% on its first cast each battle).`,
    cast(c,tg){B.shield(.2).cast(c,tg,1);schedule(.25,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.6*(c.casts<=1?1.5:1));boom(tg,'#c0d860',2);});}}),
   hitBy(c,src,o,d){if(c.kit.si&&!c.eeOn&&c.hp-d<c.maxHp/2&&c.hp>0){c.eeOn=1;c.shield+=c.maxHp*.3;if(!SIM.on){texts.push({x:c.x,y:c.y-30,txt:'Emergency Exit!',col:'#c0d860',life:1,label:1});ring(c.x,c.y-8,'#dfe8ff');}}}});

// Sandygast line: a cursed sand castle that hardens in the tide
kit({ids:[769,770],role:'Sand Castle',cls:'Juggernaut',cat:'spec',range:2,mana:[60,75],start:20,pf:[.8,1.1],names:['Sand Tomb','Shore Up'],mvType:'Ghost',tail:(c,i)=>i?'<b>Water Compaction:</b> each Water move that hits it gives +20 Defense (up to +60).':''},
  {...staged(B.zone(.25,{say:'Traps the target in swirling sand',r:1,dur:4,col:'#d8c08a'}),seq(B.heal(1.1,{who:'self'}),B.nova(1,{say:'Drags a ghostly tide over the field',r:2,fx:{weaken:.15}}))),
   hitBy(c,src,o){if(c.kit.si&&o&&o.type==='Water'&&(c.wc||0)<60){c.wc=(c.wc||0)+20;c.def+=20;}}});

// Pyukumuku: Counter while braced, and Innards Out when it falls
kit({ids:[771],role:'Sea Cucumber',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:.9,names:['Counter'],mvType:'Water',tail:()=>'<b>Innards Out:</b> when it faints, the enemy that knocked it out takes 40% of Pyukumuku\'s max HP.'},
  {d:c=>`Braces for 2s with a shield of ${HPT(c,.25)}. While braced, every basic attack against it is countered for double the damage.`,
   cast(c,tg){c.shield+=c.maxHp*.25;c.counterT=combatT+2;if(!SIM.on)ring(c.x,c.y-8,'#ff9ac0');},
   hitBy(c,src,o,d){if(!src||src.team===c.team||src.dead)return;
     if(c.counterT>combatT&&o.auto&&!o.refl)schedule(.05,()=>{if(!src.dead&&!c.dead)damage(c,src,d*2,{cat:'phys',ab:1,noCrit:1,refl:1});});
     if(!c.innards&&d>=c.hp+c.shield){c.innards=1;damage(c,src,c.maxHp*.4,{cat:'phys',ab:1,noCrit:1,refl:1,tru:1});if(!SIM.on)texts.push({x:c.x,y:c.y-30,txt:'Innards Out!',col:'#ff9ac0',life:1,label:1});}}});

// Type: Null line: Silvally's RKS System takes your team's main type
kit({ids:[772,773],role:'RKS Chimera',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.9,1.15],names:['Crush Claw','Multi-Attack'],mvType:'Normal'},
  {d:(c,i)=>i?`Strikes the target with Multi-Attack for ${DT(c,1.6)}. <b>RKS System:</b> the move takes the most common type on your team when battle starts${c.rks?` (now ${c.rks})`:''}.`:`Rakes the target for ${DT(c,1.2)}, lowering its <span class="s-def">Defense</span> by 15.`,
   begin(c,i){if(i){const ct={};for(const a of alive(c.team))for(const t of D[a.dex].t)ct[t]=(ct[t]||0)+1;c.rks=Object.keys(ct).sort((a,b)=>ct[b]-ct[a])[0]||'Normal';}},
   cast(c,tg,i){if(tg.dead)return;if(i){damage(c,tg,V(c,1.6),{ab:1,cat:'phys',type:c.rks||'Normal'});boom(tg,tcol(c),2);}else{hitAb(c,tg,1.2);tg.def=Math.max(0,tg.def-15);}}});

// Minior: meteor shards from orbit (Shields Down comes from its ability)
kit({ids:[774],role:'Meteor Core',cls:'Artillery',cat:'phys',range:3,mana:65,pf:1.1,names:['Rock Slide'],mvType:'Rock'},
  B.barrage(4,.55,{what:'meteor shards',splash:1,col:'#c8b090'}));

// Komala: asleep forever, and swinging its log anyway
kit({ids:[775],role:'Drowsy Log',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.05,names:['Wood Hammer'],mvType:'Normal',tail:()=>'<b>Comatose:</b> can\'t be stunned or given status conditions.'},
  {d:c=>`Swings its log with Wood Hammer at the target and every enemy next to it for ${DT(c,1.4)} (70% to the others), stunning them for 0.5s.`,
   begin(c){c.stunImm=true;c.fx.aImm=1;},cast(c,tg){if(tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,1.4*(q===tg?1:.7));stun(q,.5);}boom(tg,'#c8a070',2);}});

// Turtonator: a Shell Trap that explodes when struck (a Fire tank)
function turtBoom(c){if(c.dead||!c.trapT)return;c.trapT=0;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,.75);addStatus(q,'burn',3,c);}if(!SIM.on){pfx('Explosion',c.x,c.y-12,{sc:1,force:1});ring(c.x,c.y-6,'#ff7a3c');}}
kit({ids:[776],role:'Shell Trap',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:70,start:25,pf:1.05,names:['Shell Trap'],mvType:'Fire',tail:()=>'<b>Shell Armor:</b> can\'t take critical hits.'},
  {d:c=>`Sets a Shell Trap behind a shield of ${HPT(c,.2)}: the next time it's hit within 3s (or when the 3s run out), the trap explodes on every enemy within 2 hexes for ${DT(c,.75)}, adding 3 Burn.`,
   begin(c){c.fx.noCrit=1;},
   cast(c,tg){c.shield+=c.maxHp*.2;c.trapT=combatT+3;const id=c.trapId=(c.trapId||0)+1;schedule(3,()=>{if(c.trapId===id)turtBoom(c);});},
   hitBy(c){if(c.trapT>combatT)schedule(.05,()=>turtBoom(c));}});

// Togedemaru: rolls in with Zing Zap
kit({ids:[777],role:'Spiky Roller',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:60,start:25,pf:1,names:['Zing Zap'],mvType:'Electric',tail:()=>'<b>Iron Barbs:</b> melee attackers are hurt by its spikes.'},
  {d:c=>`${B.shield(.15).d(c,0)} Then it rolls into the target with Zing Zap for ${DT(c,1.2)}, adding 2 Paralysis with a 30% chance to flinch.`,
   begin(c){c.helmet+=.04;},cast(c,tg){B.shield(.15).cast(c,tg,0);schedule(.2,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.2);addStatus(tg,'para',2,c);if(Math.random()<.3)stun(tg,.35);});}});

// Mimikyu: hunts the weakest enemy (Disguise comes from its ability)
kit({ids:[778],role:'Ghost Doll',cls:'Trickster',cat:'phys',range:1,mana:55,pf:1.15,names:['Play Rough'],mvType:'Fairy'},
  {d:c=>`Slips through the shadows to the weakest enemy and plays rough for ${DT(c,1.5)}, lowering its <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by 20% for 4s.`,
   cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.22);schedule(.25,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5);debuff(t,'atk',.2,4);debuff(t,'spa',.2,4);boom(t,'#ff9be6',2);});}});

// Bruxish: Psychic Fangs shatter shields
kit({ids:[779],role:'Gnashing Fish',cls:'Striker',cat:'phys',range:1,mana:55,pf:1.1,names:['Psychic Fangs'],mvType:'Psychic',tail:()=>'<b>Dazzling:</b> enemies within 2 hexes gain PP 10% slower.'},
  {d:c=>`Bites the target with Psychic Fangs for ${DT(c,1.4)}, breaking its shield and lowering its <span class="s-def">Defense</span> by 15.`,
   begin(c){for(const o of foesOf(c).filter(o=>hdist(o,c)<=2))o.ppMul*=.9;},cast(c,tg){if(tg.dead)return;tg.shield=0;tg.def=Math.max(0,tg.def-15);hitAb(c,tg,1.4);boom(tg,'#ff9be6',2);}});

// Drampa: an old dragon that goes Berserk when hurt
kit({ids:[780],role:'Elder Dragon',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Dragon Pulse'],mvType:'Dragon',tail:()=>'<b>Berserk:</b> the first time it drops below half HP, +30% <span class="s-spa">Sp. Atk</span>.'},
  {...B.cone(1.3,{say:'Breathes a Dragon Pulse',depth:2,col:'#8a6cff'}),
   hitBy(c,src,o,d){if(!c.bsk&&c.hp-d<c.maxHp/2){c.bsk=1;c.spa*=1.3;if(!SIM.on)texts.push({x:c.x,y:c.y-30,txt:'Berserk!',col:'#ff6b6b',life:1,label:1});}}});

// Dhelmise: drags the back line in with its anchor
kit({ids:[781],role:'Sea Anchor',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.15,names:['Anchor Shot'],mvType:'Steel',tail:()=>'<b>Steelworker:</b> Anchor Shot deals +20% damage (included).'},
  {d:c=>`Hurls its anchor at the farthest enemy within 3 hexes for ${DT(c,1.5*1.2)}, dragging it next to Dhelmise and slowing its <span class="s-as">Attack Speed</span> by 30% for 3s.`,
   cast(c,tg){const t=pickT(c,tg,'far',3);if(!t)return;fire(c,t,'#a8b8c8',()=>{hitAb(c,t,1.5*1.2);pullTo(c,t);applyFx(c,t,{slow:[.3,3]},0);},{sp:280,size:5});}});

// Jangmo-o line: Kommo-o's Clangorous Soul trades HP for power
kit({ids:[782,783,784],role:'Scale Warrior',cls:'Juggernaut',cat:'phys',range:1,mana:[60,65,80],start:20,pf:[.8,.95,1.15],names:['Dragon Tail','Sky Uppercut','Clangorous Soul'],mvType:'Dragon'},
  staged(B.hit(1.1,{proj:false,fx:{knock:1}}),seq(B.shield(.15),B.hit(1.3,{proj:false,fx:{stun:.5}})),{d:c=>`Clangs its scales: spends 10% of its current HP to raise its <span class="s-atk">Attack</span>, <span class="s-def">Defense</span> and <span class="s-as">Attack Speed</span> by 15% for the battle (stacks), then hits every enemy within 2 hexes with Clanging Scales for ${DT(c,1.2)}.`,
    cast(c,tg){hurt(c,c.hp*.1,null);c.atk*=1.15;c.as*=1.15;c.def*=1.15;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))hitAb(c,q,1.2);if(!SIM.on){ring(c.x,c.y-6,'#ffd34d');ring(c.x,c.y-6,'#ffffff');}}}));

// --- Alola's island guardians ---
function madness(c,t,p){if(t&&!t.dead)damage(c,t,Math.min(t.hp*p,V(c,2.5)),{ab:1,cat:'spec',tru:1,noCrit:1});}
kit({ids:[785],role:'Guardian of Melemele',cls:'Striker',cat:'phys',range:1,mana:70,pf:1.15,names:["Nature's Madness"],mvType:'Electric',tail:()=>'<b>Electric Surge:</b> your Electric Pokémon gain +20% Attack Speed.'},
  {d:c=>`Darts to the farthest enemy and strikes with Nature's Madness, cutting its current HP by 25% (true damage, capped), then calls lightning on 3 random enemies for ${DT(c,.9)} each, adding 2 Paralysis.`,
   begin(c){for(const a of alive(c.team))if(D[a.dex].t.includes('Electric'))a.as*=1.2;},
   cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.22);schedule(.25,()=>{if(c.dead)return;madness(c,t,.25);
     for(const q of shuffle(foesOf(c)).slice(0,3)){hitAb(c,q,.9);addStatus(q,'para',2,c);if(!SIM.on)fx.push({line:1,x1:q.x,y1:q.y-120,x2:q.x,y2:q.y-8,life:.3,max:.3,col:'#ffe14d',w:3});}});}});
kit({ids:[786],role:'Guardian of Akala',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Psychic'],mvType:'Psychic',tail:()=>'<b>Psychic Surge:</b> your team\'s Psychic moves deal +20% damage, and allies start with +15 PP.'},
  {d:c=>`Blasts the target with Psychic for ${DT(c,1.6)}, then a psychic wave hits every enemy next to it for ${DT(c,.7)} and adds 2 Confusion.`,
   begin(c){for(const a of alive(c.team)){a.fx.typeBoost=Object.assign({},a.fx.typeBoost||{});a.fx.typeBoost.Psychic=(a.fx.typeBoost.Psychic||0)+.2;if(a!==c)gainMana(a,15);}},
   cast(c,tg){fire(c,tg,'#ff9be6',()=>{hitAb(c,tg,1.6);for(const q of near(tg,1)){hitAb(c,q,.7);addStatus(q,'conf',2,c);}boom(tg,'#ff9be6',2);},{size:5});}});
kit({ids:[787],role:"Guardian of Ula'ula",cls:'Juggernaut',cat:'phys',range:1,mana:75,start:20,pf:1.15,names:['Horn Leech'],mvType:'Grass',tail:()=>'<b>Grassy Surge:</b> your team restores 1% max HP per second.'},
  {d:c=>`Charges the bulkiest enemy with Horn Leech for ${DT(c,1.7)}, healing for 50% of the damage dealt and knocking it back.`,
   begin(c){for(const a of alive(c.team))a.regen+=.01;},
   cast(c,tg){const t=pickT(c,tg,'tank');dashTo(c,t,false,.22);schedule(.25,()=>{if(c.dead||t.dead)return;heal(c,(hitAb(c,t,1.7)||0)*.5);knock(c,t);boom(t,'#7fe3a8',3);});}});
kit({ids:[788],role:'Guardian of Poni',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:["Nature's Madness"],mvType:'Water',tail:()=>'<b>Misty Surge:</b> every 4s it cures the status conditions of an afflicted ally.'},
  {d:c=>`Calls a healing mist: every ally heals ${HT(c,.45)}. Then Nature's Madness cuts the strongest enemy's current HP by 20% (true damage, capped).`,
   begin(c){every(c,4,()=>{const a=alive(c.team).find(a=>a.burn||a.poison||a.para||a.conf||a.chill||a.seed);if(a)cureStatus(a);});},
   cast(c,tg){B.heal(.45,{who:'team'}).cast(c,tg,0);const t=pickT(c,tg,'strong');schedule(.3,()=>{if(!c.dead)madness(c,t,.2);});}});

// --- Cosmog line: Solgaleo and Lunala ---
kit({ids:[789,790,791],role:'Radiant Sun',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70,80],start:20,pf:[.6,.8,1.2],names:['Tackle','Cosmic Power','Sunsteel Strike'],mvType:'Steel',
  tail:(c,i)=>i===2?'<b>Full Metal Body:</b> immune to Intimidate and Defense shred.':'',begin(c,i){if(i===2)c.fx.clear=1;}},
  staged(B.hit(1),B.shield(.3,{def:20}),{d:c=>`Becomes a blazing sun and slams into the target with Sunsteel Strike for ${DT(c,2)}, ignoring its shield and 50% of its Defense, then scorches every enemy next to it for ${DT(c,.8)}.`,
    cast(c,tg){if(tg.dead)return;dashTo(c,tg,false,.2);schedule(.25,()=>{if(c.dead||tg.dead)return;tg.shield=0;hitAb(c,tg,2,{pen:.5});for(const q of near(tg,1))hitAb(c,q,.8);boom(tg,'#ffd34d',3);});}}));
kit({ids:[792],role:'Moone Emissary',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.2,names:['Moongeist Beam'],mvType:'Ghost',tail:()=>'<b>Shadow Shield:</b> takes 40% less damage until it first drops below 90% HP.'},
  {d:c=>`Fires a Moongeist Beam through the target that hits every enemy in a line for ${DT(c,1.6)}, ignoring shields and lowering their <span class="s-def">Sp. Def</span> by 15.`,
   begin(c){c.sshield=1;c.taken*=.6;},hitBy(c,src,o,d){if(c.sshield&&c.hp-d<c.maxHp*.9){c.sshield=0;c.taken/=.6;}},
   cast(c,tg){const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts){q.shield=0;hitAb(c,q,1.6);q.res=Math.max(0,q.res-15);}
     if(!SIM.on){const dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy)||1;fx.push({line:1,x1:c.x,y1:c.y-12,x2:c.x+dx/L*420,y2:c.y-12+dy/L*420,life:.4,max:.4,col:'#b07aff',w:5});}}});

// --- Ultra Beasts ---
function beastBoost(c){if(c.atk>=c.spa)c.atk*=1.1;else c.spa*=1.1;if(!SIM.on)texts.push({x:c.x,y:c.y-34,txt:'Beast Boost!',col:'#ff9be6',life:1,label:1});}
const BB=()=>'<b>Beast Boost:</b> each takedown raises its highest attacking stat by 10%.';
kit({ids:[793],role:'Parasite',cls:'Trickster',cat:'spec',range:3,mana:70,pf:1.1,names:['Power Gem'],mvType:'Rock',tail:BB},
  {d:c=>`Fires a Power Gem at the target for ${DT(c,1.4)} and injects its neurotoxin: 3 Confusion and 4 Poison.`,kill:beastBoost,
   cast(c,tg){fire(c,tg,'#ffd0f0',()=>{hitAb(c,tg,1.4);addStatus(tg,'conf',3,c);addStatus(tg,'poison',4,c);boom(tg,'#ffd0f0',2);},{size:5});}});
kit({ids:[794],role:'Swollen',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Lunge'],mvType:'Bug',tail:BB},
  {d:c=>`Lunges at the target for ${DT(c,1.6)}, lowering its <span class="s-atk">Attack</span> by 20% for 4s, and drinks for 40% of the damage dealt.`,kill:beastBoost,
   cast(c,tg){if(tg.dead)return;heal(c,(hitAb(c,tg,1.6)||0)*.4);debuff(tg,'atk',.2,4);boom(tg,'#ff7a7a',2);}});
kit({ids:[795],role:'Lissome',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['High Jump Kick'],mvType:'Fighting',tail:()=>BB()+' It dodges 15% of basic attacks.',begin(c){c.dodge=Math.min(.6,c.dodge+.15);}},
  {d:c=>`Leaps onto the farthest enemy with High Jump Kick for ${DT(c,1.8)}.`,kill:beastBoost,
   cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.8);boom(t,'#ffe0a0',2);});}});
kit({ids:[796],role:'Glowing',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Discharge'],mvType:'Electric',tail:BB},
  {...B.chain(4,1.1,{fx:{para:2},col:'#ffe14d'}),kill:beastBoost});
kit({ids:[797],role:'Launch',cls:'Vanguard',type:'guard',cat:'phys',range:2,mana:75,start:25,pf:1.05,names:['Heavy Slam'],mvType:'Steel',tail:BB},
  {...seq(B.shield(.2,{who:'adjacent'}),B.barrage(4,.45,{what:'rocket slams',splash:1,col:'#c8d8e8'})),kill:beastBoost});
kit({ids:[798],role:'Blade',cls:'Striker',cat:'phys',range:1,mana:55,pf:1.15,names:['Sacred Sword'],mvType:'Grass',tail:BB},
  {d:c=>`Cuts the weakest enemy within 3 hexes with Sacred Sword for ${DT(c,1.7)}, ignoring 50% of its Defense.`,kill:beastBoost,
   cast(c,tg){const t=pickT(c,tg,'weak',3);if(hdist(c,t)>1)dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.7,{pen:.5});if(!SIM.on)pfx('Slash',t.x,t.y-12,{sc:1,force:1});});}});
kit({ids:[799],role:'Junkivore',cls:'Juggernaut',cat:'phys',range:1,mana:75,start:20,pf:1.05,names:['Stomping Tantrum'],mvType:'Dark',tail:()=>BB()+' Each takedown also heals 25% of its max HP.'},
  {d:c=>`Throws a Stomping Tantrum, hitting every enemy within 1 hex for ${DT(c,1.3)} and slowing their <span class="s-as">Attack Speed</span> by 25% for 3s.`,
   kill(c){beastBoost(c);heal(c,c.maxHp*.25);},cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1.3);applyFx(c,q,{slow:[.25,3]},0);}if(!SIM.on){ring(c.x,c.y-6,'#6b4bb8');burst(c.x,c.y,'#b08a5a',20,1.3);}}});
kit({ids:[803,804],role:'Poison Pin',cls:'Mystic',cat:'spec',range:3,mana:[60,70],pf:[.85,1.15],names:['Venoshock','Dragon Pulse'],mvType:'Poison',tail:BB},
  {...staged({d:c=>`Sprays Venoshock at the target for ${DT(c,1.1)} (double against poisoned enemies), adding 2 Poison.`,cast(c,tg){fire(c,tg,'#c86bd6',()=>{hitAb(c,tg,1.1*(tg.poison?2:1));addStatus(tg,'poison',2,c);});}},
    B.beam(1.5,{what:'a toxic Dragon Pulse',col:'#c86bd6',fx:{psn:.015}})),kill:beastBoost});
kit({ids:[805],role:'Rampart',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:25,pf:1,names:['Gyro Ball'],mvType:'Steel',tail:BB},
  {...seq(B.shield(.3),B.nova(.9,{say:'Its stacked bricks topple outward',r:1,fx:{slow:[.3,3]}})),kill:beastBoost});
kit({ids:[806],role:'Fireworks',cls:'Artillery',cat:'spec',range:3,mana:75,pf:1.15,names:['Mind Blown'],mvType:'Fire',tail:BB},
  {d:c=>`Blows its own head off in a Mind Blown explosion on the biggest group of enemies: ${DT(c,2)} to the center and 70% to everything within 1 hex, adding 3 Burn. It loses 10% of its max HP.`,kill:beastBoost,
   cast(c,tg){hurt(c,c.maxHp*.1,null);B.blast(2,{at:'cluster',r:1,arc:1,col:'#ff9a3c',fx:{burn:.015}}).cast(c,tg,0,{});}});

// --- Alola's mythicals and Necrozma ---
kit({ids:[800],role:'Prism',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.15,names:['Photon Geyser'],mvType:'Psychic',tail:()=>'<b>Prism Armor:</b> takes 15% less damage.',begin(c){c.taken*=.85;}},
  {d:c=>`Fires a Photon Geyser at the target, a pillar of light that hits it and every enemy within 1 hex for ${DT(c,1.7)} (70% to the others), using its <span class="s-atk">Attack</span> or <span class="s-spa">Sp. Atk</span>, whichever is higher.`,
   cast(c,tg){if(tg.dead)return;const cat=c.atk>c.spa?'phys':'spec';for(const q of[tg,...near(tg,1)])hitAb(c,q,1.7*(q===tg?1:.7),{cat});if(!SIM.on){fx.push({line:1,x1:tg.x,y1:tg.y-160,x2:tg.x,y2:tg.y-6,life:.45,max:.45,col:'#fff6c0',w:8});boom(tg,'#fff6c0',3);}}});
kit({ids:[801],role:'Artificial',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.2,names:['Fleur Cannon'],mvType:'Fairy',tail:()=>'<b>Soul-Heart:</b> +5% <span class="s-spa">Sp. Atk</span> whenever any Pokémon faints.'},
  {d:c=>`Fires a Fleur Cannon through the target, hitting every enemy in a line for ${DT(c,1.8)}. Each cast lowers its own <span class="s-spa">Sp. Atk</span> by 10%.`,
   begin(c){c.shN=0;every(c,.25,()=>{const n=units.filter(u=>u.dead).length;if(n>c.shN){c.spa*=Math.pow(1.05,n-c.shN);c.shN=n;}});},
   cast(c,tg){const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts)hitAb(c,q,1.8);c.spa*=.9;
     if(!SIM.on){const dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy)||1;fx.push({line:1,x1:c.x,y1:c.y-12,x2:c.x+dx/L*420,y2:c.y-12+dy/L*420,life:.45,max:.45,col:'#ffb3e6',w:7});}}});
kit({ids:[802],role:'Gloomdweller',cls:'Striker',cat:'phys',range:1,mana:65,pf:1.15,names:['Spectral Thief'],mvType:'Ghost',tail:()=>'<b>Technician:</b> slips through shadows to reach its target.'},
  {d:c=>`Sinks into the strongest enemy's shadow and strikes with Spectral Thief for ${DT(c,1.7)}, stealing its shield and 10% of its <span class="s-atk">Attack</span> for the battle.`,
   cast(c,tg){const t=pickT(c,tg,'strong');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;c.shield+=t.shield;t.shield=0;const a=t.atk*.1;t.atk-=a;c.atk+=a;hitAb(c,t,1.7);if(!SIM.on)pfx('Shadow_Force_Hit_Dark',t.x,t.y-12,{sc:1,force:1});});}});
kit({ids:[807],role:'Thunderclap',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Plasma Fists'],mvType:'Electric',tail:()=>'<b>Volt Absorb:</b> Electric moves heal it instead of hurting it.',begin(c){c.fx.immune=[...(c.fx.immune||[]),'Electric'];c.fx.absorb=1;}},
  {d:c=>`Dashes to the weakest enemy and throws 4 Plasma Fists for ${DT(c,.5)} each; the last one adds 3 Paralysis and charges its allies' PP by 10.`,
   cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.18);for(let k=0;k<4;k++)schedule(.2+k*.1,()=>{if(c.dead||t.dead)return;hitAb(c,t,.5);if(!SIM.on)spark(t.x,t.y-12,'#ffe14d',8);
     if(k===3){addStatus(t,'para',3,c);for(const a of alive(c.team))if(a!==c)gainMana(a,10);}});}});
kit({ids:[808,809],role:'Hex Nut',cls:'Juggernaut',cat:'phys',range:1,mana:[60,75],start:20,pf:[.8,1.15],names:['Flash Cannon','Double Iron Bash'],mvType:'Steel',tail:(c,i)=>i?'<b>Iron Fist:</b> punches deal +20% damage (included).':''},
  staged(B.hit(1.1,{fx:{sdef:10}}),B.hit(.9*1.2,{n:2,proj:false,fx:{flinch:.3}})));

// tuning pass: Gen VII kit damage against generic units of the same cost (set from kitbal7)
for(const[d,m]of Object.entries({733:.8,746:.4,774:.75,740:.9,730:.72,741:.72,724:.9,780:.8,727:.7,776:.65,775:.9,779:.9,754:1.25,763:1.15}))tuneSig(+d,m);
for(const[d,m]of Object.entries({784:.85,796:.7,797:.65,806:.65,798:.9,804:.9,799:.8,785:.75,786:.85,807:1.2,809:1.1}))tuneSig(+d,m);
