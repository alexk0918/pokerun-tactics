/* Generation VI signature kits (Kalos lines). */

kit({ids:[659,660],role:'Digger',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.05],names:['Dig','Bulldoze'],mvType:'Ground'},
  staged(seq(B.airborne(.6),B.hit(1.1,{dash:1})),seq(B.shield(.15),B.nova(.9,{say:'Then bulldozes the ground',r:1,fx:{slow:[.25,3]}}))));
kit({ids:[661,662,663],role:'Ember Falcon',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Quick Attack','Acrobatics','Brave Bird'],mvType:'Flying',tail:(c,i)=>i===2?'<b>Gale Wings:</b> at full HP its Brave Bird is instant and has no recoil.':''},
  {d:(c,i)=>i===0?B.hit(1,{dash:1}).d(c,i):i===1?`Flips onto the weakest enemy for ${DT(c,1.2)} and adds 2 Burn.`:`Dives onto the farthest enemy in flames for ${DT(c,1.6)}, adding 4 Burn and taking 10% of its own <span class="s-hp">max HP</span> in recoil (none at full HP).`,
   cast(c,tg,i){if(i===0)return B.hit(1,{dash:1}).cast(c,tg,i,{});const t=pickT(c,tg,i===1?'weak':'far'),full=c.hp>=c.maxHp-1;dashTo(c,t,true,full&&i===2?.1:.2);
     schedule(full&&i===2?.12:.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,i===1?1.2:1.6);addStatus(t,'burn',i===1?2:4,c);if(i===2&&!full)hurt(c,c.maxHp*.1,null);});}});
kit({ids:[664,665,666],role:'Pattern Wings',cls:'Mystic',cat:'spec',range:3,mana:[60,65,70],pf:[.8,.9,1.1],names:['Bug Bite','Harden','Powder Storm'],mvType:'Bug'},
  {d:(c,i)=>i===0?B.hit(1).d(c,i):i===1?seq(B.shield(.2),B.hit(.7)).d(c,i):`Scatters patterned scales over the biggest group of enemies: ${DT(c,1)} to each within 1 hex, adding a random status (3 Poison, 3 Paralysis or 2 Confusion) to every one.`,
   cast(c,tg,i){if(i<2)return(i?seq(B.shield(.2),B.hit(.7)):B.hit(1)).cast(c,tg,i,{});const t=pickT(c,tg,'cluster');for(const q of[t,...near(t,1)]){hitAb(c,q,1);const k=pick(['poison','para','conf']);addStatus(q,k,k==='conf'?2:3,c);}boom(t,'#ff9be6',2);}});
kit({ids:[667,668],role:'Pride Lion',cls:'Mystic',cat:'spec',range:2,mana:[60,70],pf:[.8,1.1],names:['Ember','Hyper Voice'],mvType:'Fire',tail:(c,i)=>i?'<b>Pride:</b> +5% damage for each other Fire or Normal ally on the field.':''},
  {d:(c,i)=>i?`Roars a Hyper Voice through the target and enemies up to 2 hexes behind it for ${DT(c,1)} (70% to the others), adding 3 Burn to each.`:B.hit(1,{fx:{burn:.01}}).d(c,i),
   begin(c,i){if(i)c.dmg+=.05*alive(c.team).filter(a=>a!==c&&D[a.dex].t.some(t=>t==='Fire'||t==='Normal')).length;},
   cast(c,tg,i){(i?B.cone(1,{depth:2,fx:{burn:.015},col:'#ff9a3c'}):B.hit(1,{fx:{burn:.01}})).cast(c,tg,i,{});}});
kit({ids:[669,670,671],role:'Flower Queen',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,65,75],pf:[.8,1,1.15],names:['Fairy Wind','Aromatherapy','Floral Healing'],mvType:'Fairy'},
  staged(seq(B.heal(.6,{}),B.hit(.7)),B.heal(.45,{who:'team',cleanse:1}),seq(B.heal(1,{}),B.heal(.3,{who:'team',cleanse:1}),B.shield(.1,{who:'lowest'}))));
kit({ids:[672,673],role:'Mountain Goat',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.85,1.1],names:['Vine Whip','Horn Leech'],mvType:'Grass'},
  staged(B.hit(1,{proj:false,fx:{seed:1}}),{d:c=>`Rams the target with Horn Leech for ${DT(c,1.4)}, healing for half the damage dealt.`,cast(c,tg){const d=hitAb(c,tg,1.4);heal(c,(d||0)*.5);}}));
kit({ids:[674,675],role:'Bamboo Brawler',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Karate Chop','Parting Shot'],mvType:'Fighting',tail:(c,i)=>i?'<b>Iron Fist:</b> punches deal +20% damage.':''},
  staged(B.hit(1.1,{proj:false,cr:.2}),{d:c=>`Uppercuts the target for ${DT(c,1.4*1.2)}, then growls a Parting Shot at the strongest enemy, lowering its <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by 20% for 4s.`,
    cast(c,tg){hitAb(c,tg,1.4*1.2);const t=pickT(c,tg,'strong');if(t){debuff(t,'atk',.2,4);debuff(t,'spa',.2,4);}}}));
kit({ids:[676],role:'Poodle Trim',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:20,pf:1.05,names:['Cotton Guard'],mvType:'Normal',tail:()=>'<b>Fur Coat:</b> takes 20% less physical damage.'},
  {d:c=>`${B.shield(.25).d(c,0)} Then it headbutts the target for ${DT(c,1)}.`,begin(c){c.fx.physDr=(c.fx.physDr||0)+.2;},cast(c,tg){B.shield(.25).cast(c,tg,0);schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1);});}});
kit({ids:[677,678],role:'Psychic Cat',cls:'Trickster',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Confusion','Psybeam'],mvType:'Psychic'},
  staged(B.hit(1,{fx:{conf:1}}),seq(B.beam(1,{what:'a Psybeam',fx:{conf:2},col:'#ff9be6'}),B.shield(.1))));
kit({ids:[679,680],role:'Haunted Blade',cls:'Bruiser',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Shadow Sneak','Shadow Claw'],mvType:'Ghost'},
  staged(B.hit(1,{dash:1,to:'weak'}),B.hit(.6,{n:2,proj:false,cr:.3})));
kit({ids:[681],role:'Royal Sword',cls:'Juggernaut',cat:'phys',range:1,mana:60,start:20,pf:1.15,names:["King's Shield"],mvType:'Steel',tail:()=>'<b>Stance Change:</b> fights in Shield Forme (+25 Defense and Sp. Def); each cast swaps to Blade Forme (+30% Attack, −25 Defense and Sp. Def) for 4s.'},
  {d:c=>`Raises King's Shield (${HPT(c,.15)}) and lowers the <span class="s-atk">Attack</span> of every adjacent enemy by 15% for 3s. Then it swaps to Blade Forme and cuts the target for ${DT(c,1.5)}.`,
   begin(c){c.def+=25;c.res+=25;},
   cast(c,tg){c.shield+=c.maxHp*.15;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))debuff(q,'atk',.15,3);
     if(!c.blade){c.blade=1;c.def-=50;c.res-=50;c.atk*=1.3;schedule(4,()=>{if(c.blade){c.blade=0;c.def+=50;c.res+=50;c.atk/=1.3;}});}
     schedule(.3,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,1.5);if(!SIM.on)pfx('Swords_Dance',c.x,c.y-16,{sc:.6,force:1});}});}});
kit({ids:[682,683],role:'Perfume',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Sweet Scent','Aromatherapy'],mvType:'Fairy',tail:(c,i)=>i?'<b>Healer:</b> adjacent allies shed their status conditions every 5s.':''},
  {d:(c,i)=>i?B.heal(.5,{who:'team',cleanse:1}).d(c,i):seq(B.heal(.7,{}),B.control({conf:1},{n:2,say:'Its scent dazes'})).d(c,i),
   begin(c,i){if(i)every(c,5,()=>{for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)cureStatus(a);});},
   cast(c,tg,i){(i?B.heal(.5,{who:'team',cleanse:1}):seq(B.heal(.7,{}),B.control({conf:1},{n:2}))).cast(c,tg,i,{});}});
kit({ids:[684,685],role:'Sweet Tooth',cls:'Medic',type:'heal',cat:'spec',range:2,mana:[60,65],pf:[.8,1.05],names:['Draining Kiss','Cotton Guard'],mvType:'Fairy'},
  staged(B.hit(1,{heal:.75}),seq(B.hit(1.1,{heal:.75}),B.shield(.15,{who:'lowest'}))));
kit({ids:[686,687],role:'Overturner',cls:'Trickster',cat:'spec',range:3,mana:[60,70],pf:[.8,1.1],names:['Payback','Topsy-Turvy'],mvType:'Dark',tail:(c,i)=>i?'<b>Contrary:</b> enemy debuffs on it raise its stats instead (it gains +10% Sp. Atk whenever it is hit by a move).':''},
  {d:(c,i)=>i?`Hypnotizes the strongest enemy, turning its world upside down: it is confused (3 Confusion) and its <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> buffs are flipped (−20% for 5s). Then Foul Play hits it for ${DT(c,1)} plus 50% of its own <span class="s-atk">Attack</span>.`:B.hit(1.1).d(c,i),
   hitBy(c,src,o){if(c.kit.si===1&&o.ab&&(c.ctN||0)<5){c.ctN=(c.ctN||0)+1;c.spa*=1.1;}},
   cast(c,tg,i){if(!i)return B.hit(1.1).cast(c,tg,i,{});const t=pickT(c,tg,'strong');addStatus(t,'conf',3,c);debuff(t,'atk',.2,5);debuff(t,'spa',.2,5);schedule(.25,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1,{flat:t.atk*.5});});}});
kit({ids:[688,689],role:'Seven Fists',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Rock Tomb','Stone Edge'],mvType:'Rock',tail:(c,i)=>i?'<b>Tough Claws:</b> its contact hits deal +20% damage.':''},
  staged(B.hit(1,{proj:false,fx:{slow:[.25,3]}}),B.hit(.4,{n:4,proj:false,cr:.25})));
kit({ids:[690,691],role:'Toxic Kelp',cls:'Artillery',cat:'spec',range:3,mana:[60,70],pf:[.8,1.1],names:['Acid','Sludge Wave'],mvType:'Poison'},
  staged(B.hit(1,{fx:{psn:.015,sdef:5}}),{d:c=>`Unleashes a Sludge Wave on the biggest group of enemies: ${DT(c,1.1)} to each within 1 hex and 4 Poison.`,
    cast(c,tg){const t=pickT(c,tg,'cluster');for(const q of[t,...near(t,1)]){hitAb(c,q,1.1);addStatus(q,'poison',4,c);}if(!SIM.on)pfx('Sludge_Wave',t.x,t.y-12,{sc:.8,force:1});}}));
kit({ids:[692,693],role:'Pistol Shrimp',cls:'Artillery',cat:'spec',range:4,mana:[60,70],pf:[.8,1.15],names:['Water Pulse','Aura Sphere'],mvType:'Water',tail:(c,i)=>i?'<b>Mega Launcher:</b> its pulse and aura moves deal +20% damage.':''},
  staged(B.hit(1,{fx:{conf:1}}),{d:c=>`Fires an Aura Sphere from its claw at the farthest enemy for ${DT(c,1.6)}, splashing 60% to enemies next to it.`,
    cast(c,tg){const t=pickT(c,tg,'far');fire(c,t,'#5aa8ff',()=>{hitAb(c,t,1.6,{type:'Fighting'});for(const q of near(t,1))hitAb(c,q,.96,{type:'Fighting'});boom(t,'#7fb8ff',2);},{type:'Fighting',size:5,sp:320});}}));
kit({ids:[694,695],role:'Sun Lizard',cls:'Striker',cat:'spec',range:2,mana:[55,60],pf:[.8,1.05],names:['Thunder Shock','Parabolic Charge'],mvType:'Electric',tail:(c,i)=>i?'<b>Dry Skin:</b> heals 2% max HP per second in rain.':''},
  {d:(c,i)=>i?`Discharges a Parabolic Charge: every enemy within 2 hexes takes ${DT(c,.85)} and 2 Paralysis, and it heals for half the damage dealt.`:B.hit(1,{fx:{stun:.3}}).d(c,i),
   begin(c,i){if(i&&battle.weather==='rain')c.regen+=.02;},
   cast(c,tg,i){if(!i)return B.hit(1,{fx:{stun:.3}}).cast(c,tg,i,{});let tot=0;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){tot+=hitAb(c,q,.85)||0;addStatus(q,'para',2,c);}heal(c,tot*.5);if(!SIM.on)ring(c.x,c.y-6,'#ffe14d');}});
kit({ids:[696,697],role:'Despot',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.85,1.15],names:['Crunch','Head Smash'],mvType:'Rock',tail:(c,i)=>i?'<b>Strong Jaw:</b> bites deal +20% damage.':''},
  staged(B.hit(1.2,{proj:false,fx:{shred:6}}),{d:c=>`Crunches the target for ${DT(c,1.2*1.2)} then Head Smashes it for ${DT(c,1.6)}, stunning it for 0.5s and taking 10% of its own <span class="s-hp">max HP</span> in recoil.`,
    cast(c,tg){hitAb(c,tg,1.2*1.2,{type:'Dark'});schedule(.25,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.6);stun(tg,.5);hurt(c,c.maxHp*.1,null);boom(tg,'#c8a070',2);});}}));
kit({ids:[698,699],role:'Aurora',cls:'Mystic',cat:'spec',range:3,mana:[65,75],pf:[.8,1.1],names:['Powder Snow','Aurora Veil'],mvType:'Ice',tail:(c,i)=>i?'<b>Snow Warning:</b> starts the battle with snow if no weather is active.':''},
  {d:(c,i)=>i?`In snow it casts Aurora Veil (every ally takes 15% less damage for 5s). Then it whips up a Blizzard: every enemy within 2 hexes takes ${DT(c,.95)} and 3 Chill.`:B.hit(1,{fx:{chill:2}}).d(c,i),
   begin(c,i){if(i)schedule(.1,()=>setWeather(c,'snow'));},
   cast(c,tg,i){if(!i)return B.hit(1,{fx:{chill:2}}).cast(c,tg,i,{});if(battle.weather==='snow')B.buff({dr:.15},{who:'team',dur:5}).cast(c,tg,1);
     for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,.95);addStatus(q,'chill',3,c);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:1.6,force:1});}});
kit({ids:[701],role:'Luchador',cls:'Striker',cat:'phys',range:1,mana:55,pf:1.15,names:['Flying Press'],mvType:'Fighting'},
  {d:c=>`Leaps high and comes down on the farthest enemy with a Flying Press for ${DT(c,1.6)}, knocking adjacent enemies back.`,
   cast(c,tg){B.airborne(.4).cast(c);schedule(.45,()=>{if(c.dead)return;const t=pickT(c,tg,'far');dashTo(c,t,true,.15);schedule(.17,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.6);for(const q of near(t,1))knock(c,q);boom(t,'#ffffff',2);});});}});
kit({ids:[702],role:'Cheek Pouch',cls:'Medic',type:'heal',cat:'spec',range:2,mana:60,pf:1,names:['Nuzzle'],mvType:'Electric'},
  seq(B.heal(.6,{who:'self'}),B.heal(.5,{}),B.control({para:3},{n:2,say:'Nuzzles'})));
kit({ids:[703],role:'Jewel Guard',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:70,start:20,pf:1.05,names:['Reflect'],mvType:'Rock'},
  seq(B.shield(.15,{who:'team'}),B.hit(.8,{what:'a Power Gem'})));
kit({ids:[704,705,706],role:'Slime Dragon',cls:'Juggernaut',type:'guard',cat:'spec',range:[1,2,2],mana:[65,70,80],start:20,pf:[.8,1,1.15],names:['Dragon Breath','Dragon Pulse','Draco Meteor'],mvType:'Dragon',tail:(c,i)=>i===2?'<b>Gooey:</b> melee attackers are slowed by 20% for 2s.':''},
  {d:(c,i)=>i<2?seq(B.shield(.15),B.hit(i?1.1:1,{fx:{para:2}})).d(c,i):`${B.shield(.2).d(c,i)} Then it calls down a Draco Meteor on the biggest group of enemies: ${DT(c,1.3)} to the center and 70% to adjacent enemies.`,
   hitBy(c,src,o){if(c.kit.si===2&&!o.ab&&src.range===1&&!src.dead){src.slowT=2;src.slowP=Math.max(src.slowP,.2);}},
   cast(c,tg,i){if(i<2)return seq(B.shield(.15),B.hit(i?1.1:1,{fx:{para:2}})).cast(c,tg,i,{});B.shield(.2).cast(c,tg,2);schedule(.3,()=>{if(!c.dead)B.blast(1.3,{at:'cluster',r:1,arc:1,col:'#a07aff'}).cast(c,tg,2,{});});}});
kit({ids:[707],role:'Key Ring',cls:'Trickster',cat:'spec',range:3,mana:55,start:30,pf:1,names:['Fairy Lock'],mvType:'Fairy',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  seq(B.control({stun:.8},{n:2,say:'Locks'}),B.hit(1,{to:'weak',fx:{conf:1}})));
kit({ids:[708,709],role:'Elder Tree',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,75],start:20,pf:[.8,1.1],names:['Branch Poke','Forest\'s Curse'],mvType:'Ghost'},
  staged(seq(B.shield(.15),B.hit(1,{proj:false})),{d:c=>`${B.shield(.2).d(c,1)} Then it curses the forest around it: every enemy within 2 hexes takes ${DT(c,.8)} and 3 Leech Seed.`,
    cast(c,tg){B.shield(.2).cast(c,tg,1);schedule(.3,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,.8);addStatus(q,'seed',3,c);}if(!SIM.on)pfx('Ingrain',c.x,c.y-6,{sc:.9,force:1});});}}));
kit({ids:[710,711],role:'Jack-o\'-Lantern',cls:'Trickster',cat:'spec',range:2,mana:[60,65],pf:[.8,1.05],names:['Trick-or-Treat','Seed Bomb'],mvType:'Ghost'},
  staged(B.hit(1,{fx:{conf:1}}),{d:c=>`Trick-or-Treat: the target becomes part Ghost and takes ${DT(c,1)}, then a Seed Bomb lands on it and enemies next to it for ${DT(c,.8)}, planting 2 Leech Seed.`,
    cast(c,tg){hitAb(c,tg,1);schedule(.25,()=>{if(c.dead||tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,.8,{type:'Grass'});addStatus(q,'seed',2,c);}});}}));
kit({ids:[712,713],role:'Iceberg',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[70,80],start:20,pf:[.8,1.05],names:['Avalanche','Icicle Crash'],mvType:'Ice'},
  staged(seq(B.shield(.2),B.hit(1,{proj:false,fx:{chill:2}})),{d:c=>`${B.shield(.25).d(c,1)} Then icicles crash onto every enemy within 1 hex for ${DT(c,1)} (+50% if it was hit while bracing), adding 3 Chill.`,
    cast(c,tg){const hurtN=c.hits;c.shield+=c.maxHp*.25;schedule(.4,()=>{if(c.dead)return;const k=c.hits>hurtN?1.5:1;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,k);addStatus(q,'chill',3,c);}if(!SIM.on)pfx('Avalanche_Hit',c.x,c.y-14,{sc:1,force:1});});}}));
kit({ids:[714,715],role:'Sound Wyvern',cls:'Artillery',cat:'spec',range:3,mana:[60,70],pf:[.8,1.15],names:['Gust','Boomburst'],mvType:'Flying'},
  staged(B.hit(1,{fx:{knock:1}}),B.cone(1.2,{say:'Blasts a Boomburst',depth:2,fx:{conf:1}})));

// --- Kalos legends ---
kit({ids:[716],role:'Life Tree',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.15,names:['Geomancy'],mvType:'Fairy',tail:()=>'<b>Fairy Aura:</b> your team\'s Fairy moves deal +20% damage.'},
  {d:c=>`Absorbs the life of the land (Geomancy): +20% <span class="s-spa">Sp. Atk</span> and <span class="s-as">Attack Speed</span> for the battle and every ally heals ${HT(c,.3)}. Then it fires a Moonblast for ${DT(c,1.5)}.`,
   begin(c){for(const a of alive(c.team)){a.fx.typeBoost=Object.assign({},a.fx.typeBoost||{});a.fx.typeBoost.Fairy=(a.fx.typeBoost.Fairy||0)+.2;}},
   cast(c,tg){c.spa*=1.2;c.as*=1.2;B.heal(.3,{who:'team'}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead&&!tg.dead)fire(c,tg,'#ff9be6',()=>hitAb(c,tg,1.5),{size:5});});}});
kit({ids:[717],role:'Death Wing',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.15,names:['Oblivion Wing'],mvType:'Flying',tail:()=>'<b>Dark Aura:</b> your team\'s Dark moves deal +20% damage.'},
  {d:c=>`Spreads its wings over the target and enemies up to 2 hexes behind it: ${DT(c,1.5)} (70% to the others), healing for 75% of the damage dealt.`,
   begin(c){for(const a of alive(c.team)){a.fx.typeBoost=Object.assign({},a.fx.typeBoost||{});a.fx.typeBoost.Dark=(a.fx.typeBoost.Dark||0)+.2;}},
   cast(c,tg){let tot=0;const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=2&&hdist(f,c)>=hdist(tg,c))];for(const q of ts)tot+=hitAb(c,q,1.5*(q===tg?1:.7))||0;heal(c,tot*.75);lineFx(c,tg,'#d04060',3,.35);}});
kit({ids:[718],role:'Order Keeper',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:80,start:20,pf:1.15,names:["Thousand Arrows"],mvType:'Ground',tail:()=>'<b>Power Construct:</b> the first time it drops below half HP, it becomes Complete Forme: +50% max HP (and heals that much).'},
  {d:c=>`${B.shield(.2).d(c,0)} Then it fires Thousand Arrows into every enemy within 3 hexes for ${DT(c,.85)}, grounding them (slowed by 25% for 3s).`,
   hitBy(c){if(!c.complete&&c.hp<c.maxHp/2&&c.hp>0){c.complete=1;const add=c.maxHp*.5;c.maxHp+=add;c.hp+=add;if(!SIM.on){texts.push({x:c.x,y:c.y-40,txt:'Complete Forme!',col:'#7fe3a8',life:1.4,label:1});pfx('Mega_Background_Yellow',c.x,c.y-16,{sc:.8,force:1});}}},
   cast(c,tg){B.shield(.2).cast(c,tg,0);schedule(.3,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.85);applyFx(c,q,{slow:[.25,3]},0);}});}});
kit({ids:[719],role:'Diamond Princess',cls:'Vanguard',type:'guard',cat:'phys',range:2,mana:75,start:20,pf:1.15,names:['Diamond Storm'],mvType:'Rock'},
  {d:c=>`Whips up a Diamond Storm: every enemy within 2 hexes takes ${DT(c,1)}, and every ally gains a shield of 15% of its <span class="s-hp">max HP</span>.`,
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))hitAb(c,q,1);B.shield(.15,{who:'team'}).cast(c,tg,0);}});
kit({ids:[720],role:'Mischief Djinn',cls:'Trickster',cat:'spec',range:3,mana:75,pf:1.15,names:['Hyperspace Hole'],mvType:'Psychic'},
  {d:c=>`Opens a ring to the back line: the farthest enemy is pulled through a Hyperspace Hole next to it and takes ${DT(c,1.6)}, ignoring shields.`,
   cast(c,tg){const t=pickT(c,tg,'far');pullTo(c,t);schedule(.3,()=>{if(c.dead||t.dead)return;t.shield=0;hitAb(c,t,1.6);if(!SIM.on)pfx('Psycho_Cut_Hole',t.x,t.y-12,{sc:.9,force:1});});}});
kit({ids:[721],role:'Steam Cannon',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.15,names:['Steam Eruption'],mvType:'Water',tail:()=>'<b>Water Absorb:</b> Water moves heal it instead of hurting it.'},
  {d:c=>`Blasts scalding steam at the biggest group of enemies: ${DT(c,1.5)} to the center and 70% to adjacent enemies, adding 4 Burn to each.`,
   begin(c){c.fx.immune=['Water'];c.fx.absorb=1;},cast(c,tg){B.blast(1.5,{at:'cluster',r:1,fx:{burn:.02},col:'#e0f0ff'}).cast(c,tg,0,{});}});

// tuning pass: Gen VI kit damage against generic units of the same cost
for(const[d,m]of Object.entries({666:.55,678:.85,660:.9,663:1.1,695:.55,681:.6,709:.7,711:.85,691:.9,675:.9,693:.55,668:.65,713:.7,689:.8,699:.85,697:.9,715:.85,673:1.15,703:1.2,720:1.2}))tuneSig(+d,m);
for(const[d,m]of Object.entries({716:1.15,717:1.15,718:1.15,719:1.15,721:1.15}))tuneSig(+d,m);
