/* Generation II signature kits (plus later relatives of Gen II lines, and the Gen II branches of Gen I lines). */

// summon a temporary ally next to a combatant (a bonus unit that doesn't earn rewards)
function summonNear(c,dex,mult=.6){const root=ancestors(dex).slice(-1)[0];if(!MODE.lines[root])return null;const h=nbrs(c.c,c.r).find(h=>!occupied(h.c,h.r));if(!h)return null;
  const u=mkUnit(root);u.dex=dex;const s=makeCombatant(u,c.team,h.c,h.r,(battle.trs||[{},{}])[c.team],mult);s.summon=1;units.push(s);if(!SIM.on){ensure(dex);burst(s.x,s.y-10,'#c8b8ff',12,.8);}return s;}
function setWeather(c,k){if(battle.weather)return;battle.weather=k;battle.wPow=1;battle.wSide=c.team;if(!SIM.on)texts.push({x:320,y:150,txt:{sun:'Harsh sunlight!',rain:'It started to rain!',sand:'A sandstorm kicked up!',snow:'It started to snow!'}[k],col:'#ffe27a',life:1.6,label:1});}

// --- Johto starters ---
kit({ids:[152,153,154],role:'Garden Healer',cls:'Medic',type:'heal',cat:'spec',range:2,mana:[70,75,80],pf:[.8,1,1.1],names:['Synthesis','Synthesis','Aromatherapy'],mvType:'Grass'},
  staged(B.heal(.9,{}),seq(B.heal(.85,{}),B.hit(.6,{fx:{slow:[.2,2]}})),seq(B.heal(.55,{who:'team',cleanse:1}),B.nova(.6,{say:'Then a Petal Blizzard swirls around her',r:1}))));
kit({ids:[155,156,157],role:'Volcano',cls:'Mystic',cat:'spec',range:3,mana:[65,70,85],pf:[.8,1,1.3],names:['Ember','Flame Wheel','Eruption'],mvType:'Fire'},
  staged(B.hit(1,{fx:{burn:.01}}),B.hit(1.1,{dash:1,fx:{burn:.015}}),{d:c=>`Erupts, lobbing magma onto the biggest group of enemies: ${DT(c,1.6)} to the center and 70% to adjacent enemies, scaled by its current HP (full damage at full HP, 40% when nearly fainted). Burns for 2% <span class="s-hp">max HP</span>/s.`,
    cast(c,tg){const k=.4+.6*c.hp/c.maxHp;B.blast(1.6*k,{at:'cluster',r:1,arc:1,fx:{burn:.02},col:'#ff7a2c'}).cast(c,tg,2,{});}}));
kit({ids:[158,159,160],role:'Big Jaw',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.2],names:['Bite','Ice Fang','Crunch'],mvType:'Water',tail:(c,i)=>i===2?'<b>Sheer Force:</b> its bites deal +25% damage.':''},
  staged(B.hit(1,{proj:false,fx:{flinch:.3}}),B.hit(.55,{n:2,proj:false,fx:{freeze:.6}}),B.hit(.55,{n:3,proj:false,fx:{shred:8}})));

// --- Common Johto Pokémon ---
kit({ids:[161,162],role:'Scout',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1],names:['Quick Attack','Fury Swipes'],mvType:'Normal'},
  {d:(c,i)=>`Darts between the ${i?3:2} weakest enemies, striking each for ${DT(c,.6)}.`,
   cast(c,tg,i){const ts=foesOf(c).sort((a,b)=>a.hp-b.hp).slice(0,i?3:2);ts.forEach((t,k)=>schedule(k*.22,()=>{if(c.dead||t.dead)return;dashTo(c,t,true,.15);schedule(.16,()=>{if(!c.dead&&!t.dead){hitAb(c,t,.6);spark(t.x,t.y-12,'#ffe8c0',6);}});}));}});
kit({ids:[163,164],role:'Night Owl',cls:'Mystic',cat:'spec',range:3,mana:[65,70],pf:[.85,1.05],names:['Hypnosis','Air Slash'],mvType:'Flying'},
  staged(B.control({sleep:1.3},{to:'strong',say:'Hypnotizes'}),seq(B.control({sleep:1.6},{to:'strong',say:'Hypnotizes'}),B.hit(1.2,{to:'weak',fx:{flinch:.3}}))));
kit({ids:[165,166],role:'Star Puncher',cls:'Combo',cat:'phys',range:1,mana:[60,65],pf:[.8,1],names:['Comet Punch','Mach Punch'],mvType:'Bug'},
  staged(B.hit(.3,{n:3,proj:false}),seq(B.hit(.3,{n:5,proj:false}),B.buff({dr:.15},{who:'adjacent',dur:4}))));
kit({ids:[167,168],role:'Web Weaver',cls:'Trickster',cat:'phys',range:2,mana:[65,70],pf:[.8,1],names:['String Shot','Sticky Web'],mvType:'Bug'},
  staged(B.hit(1,{fx:{slow:[.3,3]}}),seq(B.zone(.08,{at:'cluster',r:1,dur:5,say:'Spins a Sticky Web',fx:{slow:[.4,1]},col:'#e0e0c8'}),B.hit(.9,{fx:{psn:.02}}))));
kit({ids:[170,171],role:'Angler Light',cls:'Mystic',cat:'spec',range:3,mana:[70,75],pf:[.8,1.05],names:['Spark','Discharge'],mvType:'Electric',tail:()=>'<b>Volt Absorb:</b> Electric moves heal it instead of hurting it.'},
  {d:(c,i)=>i?`Dangles its glowing lure: the farthest enemy is drawn next to it. Then it discharges, hitting every enemy within 1 hex for ${DT(c,1)} and paralyzing them for 0.5s.`:B.hit(1,{fx:{stun:.4}}).d(c,i),
   begin(c){c.fx.immune=['Electric'];c.fx.absorb=1;},
   cast(c,tg,i){if(!i)return B.hit(1,{fx:{stun:.4},col:'#ffe14d'}).cast(c,tg,i,{});const t=pickT(c,tg,'far');pullTo(c,t);schedule(.3,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1);stun(q,.5);}if(!SIM.on){ring(c.x,c.y-6,'#ffe14d');ring(c.x,c.y-6,'#fff6a0');}});}});
kit({ids:[175,176,468],role:'Blessing',cls:'Medic',type:'heal',cat:'spec',range:2,mana:[70,75,75],pf:[.8,.95,1.15],names:['Wish','Draining Kiss','Air Slash'],mvType:'Fairy',tail:(c,i)=>i===2?'<b>Serene Grace:</b> its flinch chance is doubled.':''},
  staged(B.heal(.9,{}),seq(B.heal(.8,{}),B.hit(.6,{heal:.5})),seq(B.hit(.85,{to:'weak',fx:{flinch:.6}}),B.heal(.4,{who:'team'}))));
kit({ids:[177,178],role:'Time Seer',cls:'Mystic',cat:'spec',range:3,mana:[60,70],pf:[.8,1],names:['Stored Power','Psycho Shift'],mvType:'Psychic'},
  staged(seq(B.hit(1),B.ramp({spa:.1})),{d:c=>`Fires a psychic burst for ${DT(c,1.2)} that grows +10% with every cast this battle, and shifts its own burn and poison onto the target.`,
    cast(c,tg){c.xatuN=(c.xatuN||0)+1;hitAb(c,tg,1.2*(1+.1*(c.xatuN-1)));if(c.burn){tg.burn={...c.burn};c.burn=null;}if(c.poison){tg.poison={...c.poison};c.poison=null;}boom(tg,'#ff9be6');}}));
kit({ids:[179,180,181],role:'Lighthouse',cls:'Mystic',cat:'spec',range:3,mana:[65,70,85],pf:[.8,1,1.25],names:['Thunder Shock','Charge Beam','Thunder'],mvType:'Electric',tail:(c,i)=>i?'Each cast also adds +10% <span class="s-spa">Sp. Atk</span> for the battle.':''},
  staged(B.hit(1,{fx:{stun:.3}}),seq(B.beam(.9,{what:'a Charge Beam'}),B.ramp({spa:.1})),seq(B.blast(1.2,{what:'a Thunder bolt',at:'cluster',r:1,fx:{stun:.6},col:'#ffe14d'}),B.ramp({spa:.1}))));
kit({ids:[187,188,189],role:'Cotton Drift',cls:'Trickster',cat:'spec',range:2,mana:[60,65,70],pf:[.8,.95,1.1],names:['Absorb','Cotton Spore','Leech Seed'],mvType:'Grass'},
  staged(B.hit(1,{heal:.5}),B.control({slow:[.35,3]},{say:'Puffs cotton spores over',r:1,at:'cluster',col:'#fff6e0'}),seq(B.control({slow:[.35,3]},{say:'Puffs cotton spores over',r:1,at:'cluster',col:'#fff6e0'}),B.hit(1,{to:'weak',heal:.6,fx:{psn:.015}}))));
kit({ids:[190,424],role:'Twin Tails',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1],names:['Double Hit','Fake Out'],mvType:'Normal',tail:(c,i)=>i?'<b>Technician:</b> its tail hits deal +20% damage.':''},
  staged(B.hit(.55,{n:2,proj:false}),{d:c=>`Its first cast each battle is a Fake Out that flinches the target for 1s. Then its two tails strike twice each for ${DT(c,.32)}.`,
    cast(c,tg){if(!c.fakeOut){c.fakeOut=1;stun(tg,1);}B.hit(.32*1.2,{n:4,proj:false}).cast(c,tg,1,{});}}));
kit({ids:[191,192],role:'Sun Bloom',cls:'Mystic',cat:'spec',range:3,mana:[75,85],pf:[.8,1.15],names:['Mega Drain','Solar Beam'],mvType:'Grass',tail:(c,i)=>i?'<b>Solar Power:</b> +30% <span class="s-spa">Sp. Atk</span> in harsh sunlight.':''},
  staged(B.hit(1,{heal:.5}),{d:c=>`Charges sunlight for 1s (instantly in harsh sunlight), then fires a beam through the target that hits every enemy in a line for ${DT(c,1.4)}.`,
    begin(){},cast(c,tg){if(battle.weather==='sun'&&!c.solar){c.solar=1;c.spa*=1.3;}const b=B.beam(1.4,{charge:battle.weather==='sun'?0:1,what:'a Solar Beam',col:'#f4ffb0'});b.cast(c,tg,1);}}));
kit({ids:[193,469],role:'Speed Glider',cls:'Striker',cat:'spec',range:2,mana:[55,60],pf:[.8,1],names:['Silver Wind','Bug Buzz'],mvType:'Bug'},
  seq(B.hit(1.05,{fx:{sdef:6}}),B.ramp({as:.08})));
kit({ids:[194,195],role:'Mud Dweller',cls:'Vanguard',type:'guard',cat:'phys',range:[1,2],mana:[70,75],start:20,pf:[.8,1],names:['Mud Shot','Earthquake'],mvType:'Ground',tail:(c,i)=>i?'<b>Unaware:</b> ignores enemies\' Defense buffs on its moves.':''},
  staged(seq(B.shield(.15),B.hit(1,{fx:{slow:[.3,3]}})),seq(B.shield(.2),B.nova(.8,{say:'Then shakes the ground',r:2,fx:{slow:[.25,2]}}))));
kit({ids:[980],role:'Toxic Fortress',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:80,start:20,pf:1.1,names:['Toxic Spikes'],mvType:'Poison'},
  seq(B.shield(.22),B.zone(.12,{at:'self',r:2,dur:5,say:'Scatters Toxic Spikes',fx:{psn:.015},col:'#a35bd6'})));
kit({ids:[198,430],role:'Big Boss',cls:'Trickster',cat:'phys',range:1,mana:[60,70],pf:[.85,1.1],names:['Pursuit','Night Slash'],mvType:'Dark',
  tail:(c,i)=>i?'<b>Gang boss:</b> at the start of battle it calls a Murkrow lackey to fight beside it.':''},
  {d:(c,i)=>B.hit(1.1,{dash:1,to:'weak',cr:i?.4:0}).d(c,i),begin(c,i){if(i)schedule(.2,()=>{if(!c.dead)summonNear(c,198,.55);});},cast(c,tg,i){B.hit(1.1,{dash:1,to:'weak',cr:i?.4:0}).cast(c,tg,i,{});}});
kit({ids:[200,429],role:'Hex Witch',cls:'Trickster',cat:'spec',range:3,mana:[65,70],pf:[.8,1.05],names:['Hex','Mystical Fire'],mvType:'Ghost'},
  {d:(c,i)=>`Casts Hex on the target for ${DT(c,1)}, doubled if it's burned, poisoned, stunned or slowed.${i?' Then a Confuse Ray hits the nearest other enemy, stunning it for 0.8s.':''}`,
   cast(c,tg,i){fire(c,tg,'#9b6bff',()=>{const st=tg.burn||tg.poison||tg.stun>0||tg.slowT>0;hitAb(c,tg,st?2:1);boom(tg,'#9b6bff',st?2:1);},{size:4,sp:240});
     if(i){const o=foesOf(c).filter(f=>f!==tg).sort((a,b)=>hdist(a,c)-hdist(b,c))[0];if(o)schedule(.2,()=>{if(!o.dead)stun(o,.8);});}}});
kit({ids:[201],role:'Glyph',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.1,names:['Hidden Power'],mvType:'Psychic'},
  {d:c=>`Fires a glyph of a random type for ${DT(c,1.2)}. Each type does something different: Fire burns, Ice freezes for 0.8s, Electric paralyzes for 0.6s, Poison poisons, Dark lowers Defense by 12.`,
   cast(c,tg){const k=pick(['Fire','Ice','Electric','Poison','Dark']);hitAb(c,tg,1.2,{type:k});applyFx(c,tg,{Fire:{burn:.02},Ice:{freeze:.8},Electric:{stun:.6},Poison:{psn:.02},Dark:{shred:12}}[k],0);boom(tg,TYPES[k]);}});
kit({ids:[203,981],role:'Two Minds',cls:'Mystic',cat:'spec',range:2,mana:[70,75],pf:[.85,1.1],names:['Psybeam','Psychic Noise'],mvType:'Psychic',tail:()=>'<b>Tail head:</b> melee attackers have a 25% chance to get bitten back for 4% of its max HP.'},
  {d:(c,i)=>`${i?'Blasts Psychic Noise at':'Fires a Psybeam at'} the target and every enemy within 1 hex for ${DT(c,1)}${i?'. Enemies hit receive 50% less healing for 5s':''}.`,
   hitBy(c,src,o){if(o.auto&&src.range===1&&Math.random()<.25&&!src.dead)damage(c,src,c.maxHp*.04,{ab:1,cat:'phys',noCrit:1,refl:1});},
   cast(c,tg,i){for(const q of[tg,...near(tg,1)]){hitAb(c,q,q===tg?1:.7);if(i)q.griev=combatT+5;}boom(tg,'#ff9be6',2);}});
kit({ids:[204,205],role:'Spiked Fortress',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[75,80],start:20,pf:[.8,1],names:['Protect','Spikes'],mvType:'Bug'},
  staged(B.shield(.25,{def:15}),seq(B.shield(.22,{def:15}),B.zone(.1,{at:'self',r:2,dur:6,say:'Scatters Spikes',col:'#b8b8a8'}))));
kit({ids:[206,982],role:'Drill Serpent',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.85,1.15],names:['Drill Run','Hyper Drill'],mvType:'Normal',tail:()=>'<b>Serene Grace:</b> 60% chance to paralyze the target for 0.6s.'},
  {d:(c,i)=>`Drills through the target's shield and protection, hitting for ${DT(c,1.3)}.`,cast(c,tg,i){tg.shield=0;tg.protT=0;hitAb(c,tg,1.3);if(Math.random()<.6)stun(tg,.6);boom(tg,'#e8dcc0');}});
kit({ids:[207,472],role:'Night Glider',cls:'Trickster',cat:'phys',range:1,mana:[60,65],pf:[.9,1.1],names:['Wing Attack','Acrobatics'],mvType:'Flying',tail:(c,i)=>i?'<b>Poison Heal:</b> poison heals it instead of hurting it.':''},
  {d:(c,i)=>`Glides to the farthest enemy and strikes for ${DT(c,1.1)}, +50% if it's holding no items.`,begin(c,i){if(i)c.fx.mGuard=0,c.poisonHeal=1;},
   cast(c,tg,i){B.hit(1.1*(c.u.items.length?1:1.5),{dash:1,to:'far'}).cast(c,tg,i,{});}});
kit({ids:[209,210],role:'Bulldog',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.85,1.1],names:['Bite','Play Rough'],mvType:'Fairy'},
  staged(B.hit(1.05,{proj:false,fx:{flinch:.3}}),B.hit(1.25,{proj:false,fx:{weaken:.2}})));
kit({ids:[211,904],role:'Spike Burst',cls:'Trickster',cat:'phys',range:1,mana:[65,70],pf:[.8,1],names:['Pin Missile','Barb Barrage'],mvType:'Poison',tail:(c,i)=>i?'Deals double damage to poisoned enemies.':''},
  {d:(c,i)=>B.nova(.8,{say:'Puffs up and fires barbs',r:i?2:1,fx:{psn:.02}}).d(c,i),cast(c,tg,i){for(const q of foesOf(c).filter(f=>hdist(f,c)<=(i?2:1))){hitAb(c,q,.8*(i&&q.poison?2:1));setDot(q,'poison',.02,4,c);}if(!SIM.on)ring(c.x,c.y-6,'#a35bd6');}});
kit({ids:[213],role:'Berry Fortress',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:30,pf:1,names:['Power Trick'],mvType:'Bug',tail:()=>'<b>Sturdy:</b> survives its first fainting blow.'},
  {d:c=>`Swaps its huge Defense into offense and slams the target for <b class="s-def">${Math.round(c.base*.4+3.4*c.def)}</b> <span class="sc">(${Math.round(c.base*.4)} + <span class="s-def">340% Defense</span>)</span> <span class="s-atk">physical</span> damage.`,
   begin(c){c.focus=Math.max(c.focus,1);},cast(c,tg){damage(c,tg,c.base*.4+3.4*c.def,{ab:1,cat:'phys',type:'Bug'});boom(tg,'#ffd34d',2);}});
kit({ids:[214],role:'Megahorn',cls:'Bruiser',cat:'phys',range:1,mana:75,pf:1.4,names:['Megahorn'],mvType:'Bug',tail:()=>'<b>Guts:</b> +50% move damage while burned or poisoned.'},
  {d:c=>B.hit(1.5,{proj:false,fx:{knock:1}}).d(c,0),cast(c,tg){hitAb(c,tg,1.5*(c.burn||c.poison?1.5:1));knock(c,tg);boom(tg,'#9fd16a',2);}});
kit({ids:[215,461],role:'Ice Claw',cls:'Trickster',cat:'phys',range:1,mana:[60,60],pf:[.85,1.1],names:['Ice Shard','Night Slash'],mvType:'Dark'},
  staged(B.hit(1,{dash:1,to:'weak',fx:{freeze:.5}}),B.hit(.6,{dash:1,to:'weak',n:2,cr:.35,fx:{freeze:.6}})));
kit({ids:[903],role:'Venom Climber',cls:'Trickster',cat:'phys',range:1,mana:60,pf:1.15,names:['Dire Claw'],mvType:'Poison'},
  {d:c=>`Climbs onto the weakest enemy and rakes it for ${DT(c,1.2)}, with a 50% chance to poison, paralyze for 0.6s or put it to sleep for 1s.`,
   cast(c,tg){const x={};B.hit(1.2,{dash:1,to:'weak'}).cast(c,tg,0,x);schedule(.3,()=>{if(x.t&&!x.t.dead&&Math.random()<.5)applyFx(c,x.t,pick([{psn:.025},{stun:.6},{sleep:1}]),0);});}});
kit({ids:[216,217,901],role:'Bloodmoon Bear',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,75,80],start:20,pf:[.8,1,1.25],names:['Fury Swipes','Slash','Headlong Rush'],mvType:'Ground',tail:(c,i)=>i?'<b>Guts:</b> +50% move damage while burned or poisoned.':''},
  {d:(c,i)=>[B.hit(.35,{n:3,proj:false}),B.hit(1.2,{proj:false,fx:{shred:8}}),{d:c=>`Rushes headlong into the biggest group of enemies, hitting everything within 1 hex for ${DT(c,1.4)}. The impact lowers its own <span class="s-def">Defense</span> by 10.`}][i].d(c,i),
   cast(c,tg,i){const g=c.burn||c.poison?1.5:1;if(i<2)return[B.hit(.35*g,{n:3,proj:false}),B.hit(1.2*g,{proj:false,fx:{shred:8}})][i].cast(c,tg,i,{});
     const t=pickT(c,tg,'cluster');if(hdist(c,t)>1)dashTo(c,t,false,.2);schedule(.22,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))hitAb(c,q,1.4*g);c.def=Math.max(0,c.def-10);boom(c,'#c9a46b',3);});}});
kit({ids:[218,219],role:'Lava Shell',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:[75,80],start:20,pf:[.8,1],names:['Ember','Lava Plume'],mvType:'Fire'},
  staged(seq(B.shield(.18),B.hit(1,{proj:false,fx:{burn:.015}})),seq(B.shield(.22),B.zone(.12,{at:'self',r:1,dur:5,say:'Oozes lava',fx:{burn:.01},col:'#ff7a2c'}))));
kit({ids:[220,221,473],role:'Mammoth',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,75,85],start:20,pf:[.8,1,1.25],names:['Ice Shard','Ice Fang','Icicle Crash'],mvType:'Ice'},
  staged(B.hit(1,{proj:false,fx:{slow:[.2,2]}}),seq(B.shield(.18),B.hit(1.1,{proj:false,fx:{freeze:.6}})),seq(B.shield(.2),B.blast(1.2,{what:'falling icicles',at:'cluster',r:1,arc:1,fx:{flinch:.3,slow:[.25,3]},col:'#dff6ff'}))));
kit({ids:[222],role:'Reef',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:75,start:20,pf:1,names:['Life Dew'],mvType:'Water'},seq(B.shield(.18),B.heal(.5,{who:'adjacent'})));
kit({ids:[864],role:'Perish Coral',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.15,names:['Strength Sap'],mvType:'Ghost',tail:()=>'<b>Perish Body:</b> melee attackers are marked; 4s later they take 15% of their max HP as true damage.'},
  {d:c=>`Saps the strongest enemy for ${DT(c,1.1)}, lowering its <span class="s-atk">Attack</span> by 20% for 4s and healing for the same amount.`,
   hitBy(c,src,o){if(o.auto&&src.range===1&&!src.perish&&!src.dead){src.perish=1;schedule(4,()=>{if(!src.dead){damage(c,src,src.maxHp*.15,{ab:1,tru:1,noCrit:1,refl:1});src.perish=0;}});}},
   cast(c,tg){const t=pickT(c,tg,'strong');const d=hitAb(c,t,1.1);debuff(t,'atk',.2,4);heal(c,d);boom(t,'#9b6bff');}});
kit({ids:[223,224],role:'Octazooka',cls:'Artillery',cat:'spec',range:3,mana:[65,75],pf:[.8,1.1],names:['Water Gun','Octazooka'],mvType:'Water',tail:(c,i)=>i?'<b>Sniper:</b> its critical hits deal +50% more damage.':''},
  {d:(c,i)=>i?`Fires an ink blast at the target that splashes enemies within 1 hex for ${DT(c,1)}. Inked enemies miss 30% of their attacks for 3s.`:B.hit(1).d(c,i),
   begin(c,i){if(i)c.critD+=.5;},cast(c,tg,i){if(!i)return B.hit(1).cast(c,tg,i,{});fire(c,tg,'#3a2a4a',()=>{for(const q of[tg,...near(tg,1)]){hitAb(c,q,q===tg?1:.7);q.fx.miss=.3;schedule(3,()=>{q.fx.miss=0;});}boom(tg,'#5a4a6a',2);},{arc:1,dur:.5,lift:50,size:5});}});
kit({ids:[225],role:'Gift Giver',cls:'Trickster',cat:'spec',range:3,mana:60,pf:1.1,names:['Present'],mvType:'Ice'},
  {d:c=>`Tosses a Present at the target: 70% it explodes for ${DT(c,1.5)} to it and adjacent enemies, 20% it heals your most injured ally for 20% of their max HP, 10% it's a coin purse worth ₽1.`,
   cast(c,tg){const x=Math.random();fire(c,tg,'#ff6b6b',()=>{if(x<.7){for(const q of[tg,...near(tg,1)])hitAb(c,q,q===tg?1.5:1);boom(tg,'#ff6b6b',2);}
     else if(x<.9){const a=alive(c.team).sort((p,q)=>p.hp/p.maxHp-q.hp/q.maxHp)[0];if(a)heal(a,a.maxHp*.2);}else if(c.team===0){run.gold++;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'+₽1',col:'#ffd34d',life:1});}},{arc:1,dur:.5,lift:60,size:4});}});
kit({ids:[227],role:'Steel Talon',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1.05,names:['Steel Wing'],mvType:'Steel'},seq(B.shield(.18,{def:20}),B.hit(1.05,{dash:1,to:'far'})));
kit({ids:[228,229],role:'Hellhound',cls:'Mystic',cat:'spec',range:2,mana:[65,70],pf:[.8,1.05],names:['Ember','Nasty Plot'],mvType:'Fire'},
  staged(B.hit(1,{fx:{burn:.015}}),seq(B.ramp({spa:.12}),B.cone(1,{say:'Then breathes a Flamethrower',fx:{burn:.015}}))));
kit({ids:[231,232],role:'Rolling Tusk',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[70,80],start:20,pf:[.8,1.05],names:['Rollout','Rapid Spin'],mvType:'Ground'},
  staged(seq(B.shield(.15),B.hit(1,{proj:false})),seq(B.shield(.2),B.beam(1,{what:'a rolling charge',fx:{knock:1,stun:.5}}))));
kit({ids:[234,899],role:'Psyshield',cls:'Bruiser',cat:'phys',range:1,mana:[65,70],pf:[.85,1.1],names:['Take Down','Psyshield Bash'],mvType:'Psychic'},
  staged(B.hit(1.15,{dash:1}),seq(B.hit(1.15,{dash:1}),B.shield(.15,{def:20}))));
kit({ids:[235],role:'Sketch Artist',cls:'Trickster',cat:'phys',range:1,mana:65,pf:1,names:['Sketch'],mvType:'Normal'},
  {d:()=>`<b>Sketch:</b> at the start of battle it paints a copy of a random enemy's move and uses it for the rest of the fight (keeping its own stats and range).`,
   begin(c){schedule(.1,()=>{const ops=foesOf(c).filter(f=>f.kit.sig);const t=ops.length?pick(ops):pick(foesOf(c));if(!t)return;c.kit=t.kit;c.mv=t.mv;c.maxMana=t.maxMana;c.pf=t.pf;c.cat=t.cat;if(!SIM.on)texts.push({x:c.x,y:c.y-36,txt:'Sketch: '+t.mv.n,col:'#ffd8a0',life:1.3,label:1});});},
   cast(c,tg){hitAb(c,tg,1);}});
kit({ids:[237],role:'Spinner',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.1,names:['Triple Kick'],mvType:'Fighting',tail:()=>'<b>Intimidate.</b>'},
  {d:c=>`Spins on its head, kicking the target three times (${DT(c,.3)}, then 2× and 3× that), then whirls into every enemy within 1 hex for ${DT(c,.5)}.`,
   cast(c,tg){for(let k=0;k<3;k++)schedule(k*.12,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,.3*(k+1));spark(tg.x,tg.y-12,'#ffd8a0',6);}});schedule(.4,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))hitAb(c,q,.5);if(!SIM.on)ring(c.x,c.y-6,'#ffd8a0');});}});
kit({ids:[241],role:'Milk Roller',cls:'Juggernaut',type:'heal',cat:'phys',range:1,mana:75,start:20,pf:1,names:['Milk Drink'],mvType:'Normal'},
  {d:c=>`Drinks milk, healing itself for ${HT(c,.9)}, then Rollouts into the target 3 times, each hit 40% stronger (starting at ${DT(c,.4)}).`,
   cast(c,tg){heal(c,HEALV(c,.9));for(let k=0;k<3;k++)schedule(.25+k*.16,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.4*Math.pow(1.4,k));if(!SIM.on)burst(tg.x,tg.y-6,'#ffd8e8',6,.8);});}});

// --- Gen I branches that arrived in Gen II ---
kit({ids:[182],role:'Petal Dancer',cls:'Mystic',cat:'spec',range:2,mana:70,pf:1.1,names:['Petal Dance'],mvType:'Grass'},
  {d:c=>`Dances, sending three bursts of petals at every enemy within 2 hexes (${DT(c,.35)} each burst), then Quiver Dances for +10% <span class="s-spa">Sp. Atk</span> and +8% <span class="s-as">Attack Speed</span> (stacks).`,
   cast(c,tg){for(let k=0;k<3;k++)schedule(k*.25,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))hitAb(c,q,.35);if(!SIM.on)ring(c.x,c.y-6,'#ff9be6');});c.spa*=1.1;c.as*=1.08;}});
kit({ids:[186],role:'Rain Caller',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.1,names:['Hydro Pump'],mvType:'Water',tail:()=>'<b>Drizzle:</b> if nothing else set the weather, it starts the battle with rain.'},
  {d:c=>`Fires a Hydro Pump through the target, hitting every enemy in a line for ${DT(c,1.1)}. In rain, it also heals allies within 1 hex for 8% of their max HP.`,
   begin(c){setWeather(c,'rain');},cast(c,tg){B.beam(1.1,{what:'a Hydro Pump',col:'#7fc4ff'}).cast(c,tg,0);if(battle.weather==='rain')for(const a of alive(c.team).filter(a=>hdist(a,c)<=1))heal(a,a.maxHp*.08);}});
kit({ids:[199],role:'Royal Strategist',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.1,names:['Chilly Reception'],mvType:'Psychic'},
  {d:c=>`Heals your most injured ally for ${HT(c,1)} and gives it +20% damage for 4s. Then it lectures the strongest enemy with a Psychic blast for ${DT(c,.8)}.`,
   cast(c,tg){const a=alive(c.team).sort((p,q)=>p.hp/p.maxHp-q.hp/q.maxHp)[0];if(a){heal(a,HEALV(c,1));a.dmg+=.2;schedule(4,()=>{a.dmg-=.2;});}schedule(.3,()=>{if(!c.dead)B.hit(.8,{to:'strong',col:'#ff9be6'}).cast(c,tg,0,{});});}});
kit({ids:[196],role:'Sun Psychic',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.3,names:['Psychic'],mvType:'Psychic',tail:()=>'<b>Magic Bounce:</b> immune to status conditions.'},
  {d:c=>B.hit(1.3,{fx:{sdef:10}}).d(c,0),begin(c){c.fx.aImm=1;},cast(c,tg){B.hit(1.3,{fx:{sdef:10},col:'#ff9be6'}).cast(c,tg,0,{});}});
kit({ids:[197],role:'Moonlight Guard',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:25,pf:1,names:['Foul Play'],mvType:'Dark'},
  {d:c=>`Bathes in Moonlight, healing ${HPT(c,.15)}, then turns the target's strength against it: Foul Play deals <span class="s-atk">physical</span> damage equal to ${Math.round(c.base*.6)} plus <b class="s-atk">200% of the target's Attack</b>.`,
   cast(c,tg){heal(c,c.maxHp*.15);damage(c,tg,c.base*.6+2*tg.atk,{ab:1,cat:'phys',type:'Dark'});boom(tg,'#5a4a7a',2);}});
kit({ids:[470],role:'Leaf Blade',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.3,names:['Leaf Blade'],mvType:'Grass',tail:()=>'<b>Leaf Guard:</b> immune to status in harsh sunlight.'},
  {d:c=>B.hit(1.3,{dash:1,cr:.4}).d(c,0),begin(c){if(battle.weather==='sun')c.fx.aImm=1;},cast(c,tg){B.hit(1.3,{dash:1,cr:.4}).cast(c,tg,0,{});}});
kit({ids:[471],role:'Frost Veil',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.2,names:['Ice Beam'],mvType:'Ice',tail:()=>'<b>Snow Cloak:</b> dodges 25% of attacks in snow.'},
  {d:c=>B.beam(1.2,{what:'an Ice Beam',fx:{freeze:.6}}).d(c,0),begin(c){if(battle.weather==='snow')c.dodge+=.25;},cast(c,tg){B.beam(1.2,{what:'an Ice Beam',fx:{freeze:.6},col:'#dff6ff'}).cast(c,tg,0);}});
kit({ids:[700],role:'Fairy Ribbon',cls:'Mystic',cat:'spec',range:2,mana:75,pf:1.1,names:['Hyper Voice'],mvType:'Fairy'},
  {d:c=>`Lets out a Pixilate Hyper Voice that hits every enemy within 2 hexes for ${DT(c,.85)}, and its ribbons heal allies within 2 hexes for 15% of the total damage dealt.`,
   cast(c,tg){let t=0;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2))t+=hitAb(c,q,.85);for(const a of alive(c.team).filter(a=>hdist(a,c)<=2))heal(a,t*.15);if(!SIM.on){ring(c.x,c.y-6,'#ff9be6');ring(c.x,c.y-6,'#ffd8f0');}}});

// --- Legendary and pseudo-legendary ---
kit({ids:[243],role:'Thunder Beast',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.3,names:['Discharge'],mvType:'Electric'},
  B.nova(1,{say:'Discharges lightning',r:2,fx:{stun:.5},col:'#ffe14d'}));
kit({ids:[244],role:'Volcano Beast',cls:'Bruiser',cat:'phys',range:1,mana:75,pf:1.35,names:['Sacred Fire'],mvType:'Fire'},
  seq(B.hit(1.1,{dash:1,to:'cluster'}),B.nova(.9,{say:'Then Sacred Fire erupts',r:1,fx:{burn:.02},col:'#ff7a2c'})));
kit({ids:[245],role:'Aurora Beast',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.25,names:['Surf'],mvType:'Water'},
  seq(B.beam(1.15,{what:'a Surf wave',fx:{knock:1},col:'#7fc4ff'}),B.heal(.4,{who:'team',cleanse:1})));
kit({ids:[246,247,248],role:'Sand Tyrant',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,75,85],start:20,pf:[.8,1,1.3],names:['Rock Throw','Rock Tomb','Stone Edge'],mvType:'Rock',tail:(c,i)=>i===2?'<b>Sand Stream:</b> starts the battle with a sandstorm if nothing else set the weather.':''},
  {d:(c,i)=>[B.hit(1),seq(B.shield(.18),B.hit(1,{fx:{slow:[.3,3]}})),seq(B.shield(.2),B.blast(1.25,{what:'jagged Stone Edges',at:'cluster',r:1,fx:{shred:8}}))][i].d(c,i),
   begin(c,i){if(i===2)setWeather(c,'sand');},cast(c,tg,i){[B.hit(1),seq(B.shield(.18),B.hit(1,{fx:{slow:[.3,3]}})),seq(B.shield(.2),B.blast(1.25,{what:'Stone Edges',at:'cluster',r:1,fx:{shred:8},col:'#c9a46b'}))][i].cast(c,tg,i,{});}});
kit({ids:[249],role:'Sea Guardian',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.35,names:['Aeroblast'],mvType:'Flying'},seq(B.beam(1.4,{what:'an Aeroblast',col:'#dfe8ff'}),B.shield(.12,{who:'team'})));
kit({ids:[250],role:'Rainbow Phoenix',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.3,names:['Sacred Fire'],mvType:'Fire'},
  {d:c=>`If an ally has fainted, its first cast revives that ally with 30% HP (once per battle). Otherwise it calls down Sacred Fire on the biggest group of enemies for ${DT(c,1.3)} (70% to adjacent), burning them for 2% <span class="s-hp">max HP</span>/s.`,
   cast(c,tg){const dead=!c.rez&&units.find(o=>o.team===c.team&&o.dead&&!o.summon&&!occupied(o.c,o.r,o));
     if(dead){c.rez=1;dead.dead=false;dead.deadT=0;dead.hp=dead.maxHp*.3;dead.burn=dead.poison=null;setAnim(dead,'Idle',true);if(!SIM.on){burst(dead.x,dead.y-10,'#ffd34d',24,1.2);texts.push({x:dead.x,y:dead.y-36,txt:'Revived!',col:'#ffd34d',life:1.2,label:1});}return;}
     B.blast(1.3,{at:'cluster',r:1,arc:1,fx:{burn:.02},col:'#ff9a3c'}).cast(c,tg,0,{});}});
kit({ids:[251],role:'Time Traveler',cls:'Medic',type:'heal',cat:'spec',range:2,mana:80,pf:1.1,names:['Heal Bell'],mvType:'Grass'},seq(B.heal(.5,{who:'team',cleanse:1}),B.buff({as:.2},{who:'team',dur:4})));

// --- Later relatives of Gen II lines ---
kit({ids:[298,183,184],role:'Huge Power',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,.95,1.1],names:['Tackle','Aqua Jet','Play Rough'],mvType:'Water',tail:(c,i)=>i===2?'<b>Huge Power:</b> +40% <span class="s-atk">Attack</span>.':''},
  {d:(c,i)=>staged(B.hit(1,{proj:false}),B.hit(1.1,{dash:1}),B.hit(1.2,{dash:1,fx:{weaken:.15}})).d(c,i),begin(c,i){if(i===2)c.atk*=1.4;},cast(c,tg,i){staged(B.hit(1,{proj:false}),B.hit(1.1,{dash:1}),B.hit(1.2,{dash:1,fx:{weaken:.15}})).cast(c,tg,i,{});}});
kit({ids:[360,202],role:'Counter',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,70],start:25,pf:1,names:['Counter','Mirror Coat'],mvType:'Psychic',tail:()=>'It never attacks on its own: its basic attacks deal half damage.'},
  {d:(c,i)=>`Braces for ${i?3:2}s. Everything that damages it during that time takes ${i?100:70}% of the damage straight back, as true damage.`,begin(c){c.atk*=.5;c.spa*=.5;},
   hitBy(c,src,o,d){if(c.counterT>combatT&&src&&!src.dead&&src.team!==c.team&&!o.refl)damage(c,src,d*c.counterK,{ab:1,tru:1,noCrit:1,refl:1});},
   cast(c,tg,i){c.counterT=combatT+(i?3:2);c.counterK=i?1:.7;if(!SIM.on){ring(c.x,c.y-8,'#ff9be6');texts.push({x:c.x,y:c.y-36,txt:i?'Mirror Coat!':'Counter!',col:'#ffc6e8',life:1,label:1});}}});
kit({ids:[438,185],role:'Imposter Tree',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[65,75],start:20,pf:[.8,1.1],names:['Mimic','Wood Hammer'],mvType:'Rock',tail:()=>'<b>Pretending to be a tree:</b> the first 2 attacks against it each battle miss.'},
  {d:(c,i)=>seq(B.shield(.2),B.hit(i?1.3:1,{proj:false})).d(c,i),begin(c){c.dodgeN+=2;},cast(c,tg,i){seq(B.shield(.2),B.hit(i?1.3:1,{proj:false})).cast(c,tg,i);}});
kit({ids:[458,226],role:'Sky Ray',cls:'Mystic',cat:'spec',range:3,mana:[65,75],pf:[.8,1.05],names:['Bubble Beam','Hydro Pump'],mvType:'Water'},
  staged(B.hit(1,{fx:{slow:[.25,2]}}),B.beam(1.1,{what:'a gliding Hydro Pump',fx:{slow:[.25,2]},col:'#7fc4ff'})));

// --- Branch evolutions get their own moves (and often a different role) ---
kit({ids:[863],role:'Viking',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Iron Head'],mvType:'Steel',tail:()=>'<b>Steely Spirit:</b> adjacent allies deal +10% damage.'},
  {d:c=>seq(B.shield(.18,{def:15}),B.hit(1.2,{proj:false,fx:{flinch:.35}})).d(c,0),begin(c){for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)a.dmg+=.1;},cast(c,tg){seq(B.shield(.18,{def:15}),B.hit(1.2,{proj:false,fx:{flinch:.35}})).cast(c,tg,0);}});
kit({ids:[900],role:'Lumberjack',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.15,names:['Stone Axe'],mvType:'Rock'},
  {d:c=>`Brings its stone axes down on the target and every enemy next to it for ${DT(c,1.1)} (70% to the others), leaving sharp splinters there for 4s that deal ${DT(c,.1)} every half second.`,
   cast(c,tg){for(const q of[tg,...near(tg,1)])hitAb(c,q,q===tg?1.1:.77);boom(tg,'#c9a46b',2);zone(c,tg,1,4,'#b8a88a',z=>{for(const q of inZone(z,1-c.team))hitAb(c,q,.1,{noCrit:1,quiet:1});});}});
kit({ids:[475],role:'Blade Knight',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.25,names:['Sacred Sword'],mvType:'Fighting',tail:()=>'<b>Sharpness:</b> +30% crit chance on its move.'},
  {d:c=>`Challenges the strongest enemy to a duel: dashes to it and strikes with Sacred Sword for ${DT(c,1.3)}, ignoring 50% of its Defense.`,cast(c,tg){B.hit(1.3,{dash:1,to:'strong',pen:.5,cr:.3}).cast(c,tg,0,{});}});

/* ---- power tuning for Gen II (see tuneSig in kits_gen1.js) ---- */
for(const[d,m]of Object.entries({182:.6,225:.7,195:.7,205:.7,168:.75,980:.8,162:.85,237:.85,181:.8,178:.85,157:.65,901:.6,196:.65,700:.7,473:.75,904:.75,229:.75,981:.75,470:.75,469:.8,471:.85,903:.85,160:.9,248:.85,243:.8,244:.8,
  184:1.25,210:1.15,166:1.3,982:1.2}))tuneSig(+d,m);
