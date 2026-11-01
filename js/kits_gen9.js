/* Generation IX signature kits (Paldea and Kitakami lines). */

// helpers: raise a Pokémon's best attacking stat; Paradox boosts (Protosynthesis in sun, Quark Drive for the future ones)
const bestUp=(c,p)=>{if(c.atk>=c.spa)c.atk*=1+p;else c.spa*=1+p;};
const paradox=(c,future)=>{if(future||battle.weather==='sun'){bestUp(c,.3);if(!SIM.on)texts.push({x:c.x,y:c.y-34,txt:future?'Quark Drive!':'Protosynthesis!',col:future?'#7fd8ff':'#ffb347',life:1.2,label:1});}};
const PARA_A=()=>'<b>Protosynthesis:</b> in harsh sun its best attacking stat rises 30%.';
const PARA_F=()=>'<b>Quark Drive:</b> its best attacking stat rises 30% at the start of battle.';

// --- starters (each one also scales over the run) ---
kit({ids:[906,907,908],role:'Stage Magician',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,.95,1.1],names:['Leafage','Magical Leaf','Flower Trick'],mvType:'Grass',
  tail:(c,i)=>i===2?`<b>Encore:</b> each knockout it scores adds +5% critical damage for the rest of the run (now +${((c.u&&c.u.mk)||0)*5}%, up to +50%).`:''},
  {d:(c,i)=>i===0?B.hit(1.1,{dash:1}).d(c,i):i===1?`Throws a Magical Leaf at the weakest enemy for ${DT(c,1.25)}; it can't miss.`:`Tosses a trick bouquet at the weakest enemy for ${DT(c,1.4)}. It always lands a critical hit.`,
   begin(c,i){if(i===2)c.critD+=Math.min(.5,((c.u&&c.u.mk)||0)*.05);},kill(c){if(c.u&&c.team===0&&c.kit.si===2)c.u.mk=Math.min(10,(c.u.mk||0)+1);},
   cast(c,tg,i){if(i===0)return B.hit(1.1,{dash:1}).cast(c,tg,i,{});const t=pickT(c,tg,'weak');
     fire(c,t,i===2?'#ff7ad9':'#7fe3a8',()=>{if(i===2)damage(c,t,V(c,1.4)*(1+c.critD),{ab:1,cat:'phys',type:'Grass',noCrit:1});else hitAb(c,t,1.25);if(i===2&&!SIM.on)pfx('Petal_Dance_Flower_Pink',t.x,t.y-12,{sc:.9,force:1});},{sp:360,size:4});}});
kit({ids:[909,910,911],role:'Soul Singer',cls:'Mystic',cat:'spec',range:3,mana:[60,70,80],pf:[.8,.95,1.1],names:['Ember','Incinerate','Torch Song'],mvType:'Fire',
  tail:(c,i)=>i===2?`<b>Encore:</b> every Torch Song it sings permanently adds +1 Sp. Atk (now +${(c.u&&c.u.ts)||0}, up to +60). <b>Unaware:</b> ignores enemy Defense boosts.`:''},
  staged(B.hit(1.1,{fx:{burn:.01}}),B.cone(1,{say:'Breathes Incinerate',fx:{burn:.01}}),{d:c=>`Sings a Torch Song through the target and enemies up to 2 hexes behind it for ${DT(c,1.3)} (70% to the others), adding 3 Burn and raising its own <span class="s-spa">Sp. Atk</span> by 10% for the battle (stacks).`,
    cast(c,tg){B.cone(1.3,{depth:2,col:'#ff7a3c',fx:{burn:.015}}).cast(c,tg,2);c.spa*=1.1;if(c.u&&c.team===0&&(c.u.ts||0)<60){c.u.ts=(c.u.ts||0)+1;c.u.g=c.u.g||{};c.u.g.spa=(c.u.g.spa||0)+1;}}}));
kit({ids:[912,913,914],role:'Dancing Duck',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,.95,1.1],names:['Water Gun','Aqua Cutter','Aqua Step'],mvType:'Water',
  tail:(c,i)=>i===2?`<b>Encore:</b> every Aqua Step permanently adds +1% Attack Speed (now +${(c.u&&c.u.qs)||0}%, up to +30%).`:''},
  {d:(c,i)=>i===0?B.hit(1.1).d(c,i):i===1?B.hit(1.2,{proj:false,cr:.2}).d(c,i):`Dances to the weakest enemy with Aqua Step for ${DT(c,1.4)} and raises its <span class="s-as">Attack Speed</span> by 10% for the battle (stacks).`,
   begin(c,i){if(i===2)c.as*=1+((c.u&&c.u.qs)||0)/100;},
   cast(c,tg,i){if(i<2)return(i?B.hit(1.2,{proj:false,cr:.2}):B.hit(1.1)).cast(c,tg,i,{});const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.18);
     schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.4);c.as*=1.1;if(c.u&&c.team===0&&(c.u.qs||0)<30)c.u.qs=(c.u.qs||0)+1;boom(t,'#5ab8ff',2);});}});

// --- Paldea ---
kit({ids:[935],role:'Ember Knight',cls:'Bruiser',cat:'phys',range:1,mana:55,pf:.9,names:['Flame Charge'],mvType:'Fire'},seq(B.hit(1.1,{dash:1,fx:{burn:.01}}),B.buff({as:.1})));
kit({ids:[915,916],role:'Truffle Hog',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.1],names:['Tackle','Body Slam'],mvType:'Normal',tail:(c,i)=>i?'<b>Thick Fat:</b> takes 15% less damage.':'',begin(c,i){if(i)c.taken*=.85;}},
  staged(seq(B.heal(.5,{who:'self'}),B.hit(.9,{proj:false})),seq(B.heal(.6,{who:'self'}),B.hit(1.3,{proj:false,fx:{stun:.5}}))));
kit({ids:[917,918],role:'Trap Spider',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.05],names:['Bug Bite','Silk Trap'],mvType:'Bug'},
  {d:(c,i)=>`Spins a Silk Trap: protected from all damage for ${i?1.2:.8}s, and every enemy that attacks it in that time is slowed by 30% for 3s. Then it bites the target for ${DT(c,1)}.`,
   cast(c,tg,i){c.protT=combatT+(i?1.2:.8);c.silkT=c.protT;if(!SIM.on)ring(c.x,c.y-8,'#e8e0c0');schedule(i?1.2:.8,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1);});},
   hitBy(c,src){if(c.silkT>combatT&&src&&src.team!==c.team)applyFx(c,src,{slow:[.3,3]},0);}});
kit({ids:[919,920],role:'Lunge Hopper',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Struggle Bug','First Impression'],mvType:'Bug',tail:(c,i)=>i?'<b>Tinted Lens:</b> +10% damage.':'',begin(c,i){if(i)c.dmg+=.1;}},
  staged(B.hit(1,{dash:1,fx:{weaken:.1}}),{d:c=>`Hops onto the farthest enemy with First Impression for ${DT(c,1.5)} (+50% on its first cast each battle).`,
    cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5*(c.casts<=1?1.5:1));boom(t,'#b8d860',2);});}}));
kit({ids:[921,922,923],role:'Revival Mouse',cls:'Striker',cat:'phys',range:1,mana:[55,60,70],pf:[.8,.95,1.1],names:['Thunder Shock','Nuzzle','Double Shock'],mvType:'Electric',
  tail:(c,i)=>i===2?'<b>Revival Blessing:</b> once per battle, its first cast after an ally faints brings that ally back with 40% HP.':''},
  {d:(c,i)=>i===0?B.hit(1,{fx:{para:1}}).d(c,i):i===1?B.hit(1.1,{dash:1,fx:{para:2}}).d(c,i):`Releases a Double Shock into the target for ${DT(c,1.6)}, adding 2 Paralysis.`,
   cast(c,tg,i){if(i<2)return(i?B.hit(1.1,{dash:1,fx:{para:2}}):B.hit(1,{fx:{para:1}})).cast(c,tg,i,{});
     if(!c.blessed){const f=units.find(u=>u.team===c.team&&u.dead&&!u.summon);if(f){c.blessed=1;f.dead=false;f.hp=f.maxHp*.4;f.deadT=0;cureStatus(f);setAnim(f,'Idle',true);if(!SIM.on){texts.push({x:f.x,y:f.y-30,txt:'Revival Blessing!',col:'#ffe14d',life:1.2,label:1});ring(f.x,f.y-6,'#ffe14d');}}}
     if(!tg.dead){hitAb(c,tg,1.6);addStatus(tg,'para',2,c);boom(tg,'#ffe14d',2);}}});
kit({ids:[924,925],role:'Mouse Family',cls:'Combo',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Double Hit','Population Bomb'],mvType:'Normal',tail:(c,i)=>i?'<b>Technician:</b> weak hits deal +20% damage (included).':''},
  staged(B.hit(.55,{n:2,proj:false}),{d:c=>`The whole family attacks with Population Bomb: 6 to 10 hits on the target for ${DT(c,.18*1.2)} each.`,
    cast(c,tg){const n=6+Math.floor(Math.random()*5);for(let k=0;k<n;k++)schedule(k*.07,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.18*1.2);if(!SIM.on)spark(tg.x+rnd(-6,6),tg.y-12,'#f0e0c0',4);});}}));
kit({ids:[926,927],role:'Bread Dog',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.05],names:['Play Rough','Body Press'],mvType:'Fairy',tail:(c,i)=>i?'<b>Well-Baked Body:</b> Fire moves give it +20 Defense instead of hurting it.':'',
  begin(c,i){if(i){c.fx.immune=[...(c.fx.immune||[]),'Fire'];}}},
  {...staged(seq(B.shield(.15),B.hit(1,{proj:false,fx:{weaken:.1}})),{d:c=>`${B.shield(.2).d(c,1)} Then it Body Presses the target for <b class="s-atk">${Math.round(r5(c.base)+c.def*4)}</b> <span class="sc">(${r5(c.base)} + 400% <span class="s-def">Defense</span>)</span> physical damage.`,
    cast(c,tg){B.shield(.2).cast(c,tg,1);schedule(.25,()=>{if(c.dead||tg.dead)return;damage(c,tg,r5(c.base)+c.def*4,{ab:1,cat:'phys',type:'Fighting'});boom(tg,'#f0d090',2);});}}),
   hitBy(c,src,o){if(c.kit.si&&o&&o.type==='Fire')c.def+=20;}});
kit({ids:[928,929,930],role:'Olive Oracle',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,65,75],pf:[.8,.95,1.1],names:['Absorb','Giga Drain','Energy Ball'],mvType:'Grass',tail:(c,i)=>i===2?'<b>Seed Sower:</b> when hit, it covers the ground in grass: allies next to it heal 2% max HP.':''},
  {...staged(seq(B.hit(.9),B.heal(.5)),seq(B.heal(.8),B.hit(.9)),seq(B.heal(.35,{who:'team'}),B.hit(1.1,{fx:{sdef:10}}))),
   hitBy(c){if(c.kit.si===2&&(c.sowT||0)<combatT){c.sowT=combatT+1;for(const a of alive(c.team))if(hdist(a,c)<=1)heal(a,a.maxHp*.02,true);}}});
kit({ids:[931],role:'Gang Parrot',cls:'Striker',cat:'phys',range:1,mana:60,pf:1,names:['Brave Bird'],mvType:'Flying',tail:()=>'<b>Hustle:</b> +10% damage.',begin(c){c.dmg+=.1;}},
  {d:c=>`Dives at the farthest enemy with Brave Bird for ${DT(c,1.6)}, taking 8% of its own max HP in recoil.`,cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.6);hurt(c,c.maxHp*.08,null);});}});
kit({ids:[932,933,934],role:'Salt Golem',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70,80],start:20,pf:[.8,.95,1.1],names:['Rock Throw','Salt Cure','Salt Cure'],mvType:'Rock',tail:(c,i)=>i===2?'<b>Purifying Salt:</b> immune to status conditions.':'',begin(c,i){if(i===2)c.fx.aImm=1;}},
  staged(seq(B.shield(.15),B.hit(1)),{d:c=>`${B.shield(.2).d(c,1)} Then it salts the target for ${DT(c,1)}, and Salt Cure eats away 1% of its max HP every half second for 4s (2% against Water and Steel).`,
    cast(c,tg){B.shield(.2).cast(c,tg,1);saltCure(c,tg);}},{d:c=>`${B.shield(.25,{def:15}).d(c,2)} Then it salts the target and every enemy next to it for ${DT(c,1)}, and Salt Cure eats away 1% of their max HP every half second for 4s (2% against Water and Steel).`,
    cast(c,tg){B.shield(.25,{def:15}).cast(c,tg,2);if(!tg.dead)for(const q of[tg,...near(tg,1)])saltCure(c,q);}}));
function saltCure(c,t){if(t.dead)return;hitAb(c,t,1);const m=D[t.dex].t.some(x=>x==='Water'||x==='Steel')?2:1;for(let k=1;k<=8;k++)schedule(k*.5,()=>{if(!t.dead)hurt(t,t.maxHp*.01*m,c);});if(!SIM.on)burst(t.x,t.y-10,'#f0f0f0',10,.6);}
kit({ids:[938,939],role:'Electro Frog',cls:'Juggernaut',cat:'spec',range:1,mana:[60,75],start:20,pf:[.85,1.1],names:['Thunder Shock','Discharge'],mvType:'Electric',tail:(c,i)=>i?'<b>Electromorphosis:</b> every hit it takes gives it 4 PP.':''},
  {...staged(B.hit(1,{fx:{para:1}}),B.nova(1.1,{say:'Discharges electricity',r:1,col:'#ffe14d',fx:{para:2}})),hitBy(c){if(c.kit.si)gainMana(c,4);}});
kit({ids:[940,941],role:'Storm Gull',cls:'Artillery',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Spark','Hurricane'],mvType:'Electric',tail:(c,i)=>i?'<b>Wind Power:</b> starts battles with +15 PP.':'',begin(c,i){if(i)gainMana(c,15);}},
  staged(B.hit(1,{fx:{para:1}}),seq(B.chain(3,1,{fx:{para:1},col:'#ffe14d'}),B.blast(.6,{at:'cluster',r:1,what:'a Hurricane',col:'#cfe8ff',fx:{conf:1}}))));
kit({ids:[942,943],role:'Boss Dog',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Bite','Crunch'],mvType:'Dark',tail:(c,i)=>i?'<b>Intimidate:</b> enemies within 2 hexes start with 15% less Attack for 6s.':'',
  begin(c,i){if(i)for(const o of foesOf(c).filter(o=>hdist(o,c)<=2&&!o.fx.clear))debuff(o,'atk',.15,6);}},staged(B.hit(1.1,{proj:false,fx:{flinch:.3}}),B.hit(1.5,{proj:false,fx:{shred:15}})));
kit({ids:[944,945],role:'Toxic Painter',cls:'Trickster',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Poison Fang','Gunk Shot'],mvType:'Poison',tail:(c,i)=>i?'<b>Poison Puppeteer:</b> enemies it poisons are also confused.':''},
  staged(B.hit(1.1,{proj:false,fx:{psn:.01}}),{d:c=>`Hurls Gunk Shot at the target for ${DT(c,1.5)}, adding 4 Poison and 2 Confusion.`,cast(c,tg){fire(c,tg,'#a060c0',()=>{hitAb(c,tg,1.5);addStatus(tg,'poison',4,c);addStatus(tg,'conf',2,c);},{size:5});}}));
kit({ids:[946,947],role:'Tumble Ghost',cls:'Trickster',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Infestation','Power Whip'],mvType:'Ghost',tail:(c,i)=>i?'<b>Wind Rider:</b> +15% Attack Speed.':'',begin(c,i){if(i)c.as*=1.15;}},
  staged(B.zone(.2,{say:'Infests the ground',r:1,dur:4,col:'#8a6cd6'}),B.hit(1.4,{dash:1,to:'weak',fx:{seed:2}})));
kit({ids:[948,949],role:'Root Jelly',cls:'Trickster',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Mega Drain','Spore'],mvType:'Grass'},
  staged(seq(B.hit(1),B.heal(.3,{who:'self'})),seq(B.control({sleep:1.2},{n:2,say:'Puffs Spores at'}),B.hit(1.2,{fx:{seed:2}}))));
kit({ids:[950],role:'Ambush Crab',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.05,names:['Crabhammer'],mvType:'Rock',tail:()=>'<b>Anger Shell:</b> the first time it drops below half HP, +30% Attack and Attack Speed.'},
  {...B.hit(1.4,{proj:false,cr:.25}),hitBy(c,src,o,d){if(!c.ang&&c.hp-d<c.maxHp/2){c.ang=1;c.atk*=1.3;c.as*=1.3;if(!SIM.on)texts.push({x:c.x,y:c.y-30,txt:'Anger Shell!',col:'#ff6b6b',life:1,label:1});}}});
kit({ids:[951,952],role:'Spicy Pepper',cls:'Mystic',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Ember','Spicy Extract'],mvType:'Fire'},
  staged(B.hit(1,{fx:{burn:.01}}),{d:c=>`Squirts Spicy Extract at the target: its <span class="s-def">Defense</span> drops by 25 (its Attack rises 10%). Then a Flamethrower hits it for ${DT(c,1.4)}, adding 3 Burn.`,
    cast(c,tg){if(tg.dead)return;tg.def=Math.max(0,tg.def-25);tg.atk*=1.1;schedule(.25,()=>{if(c.dead||tg.dead)return;fire(c,tg,'#ff6a2c',()=>{hitAb(c,tg,1.4);addStatus(tg,'burn',3,c);});});}}));
kit({ids:[953,954],role:'Sun Roller',cls:'Mystic',cat:'spec',range:3,mana:[55,70],pf:[.8,1.05],names:['Struggle Bug','Revival Blessing'],mvType:'Psychic',tail:(c,i)=>i?'<b>Revival Blessing:</b> once per battle, its first cast after an ally faints brings that ally back with 40% HP.':''},
  {d:(c,i)=>i?`Shields every ally for ${HPT(c,.1)}, then hits the target with Psychic for ${DT(c,1.2)}.`:B.hit(1,{fx:{weaken:.1}}).d(c,i),
   cast(c,tg,i){if(!i)return B.hit(1,{fx:{weaken:.1}}).cast(c,tg,i,{});
     if(!c.blessed){const f=units.find(u=>u.team===c.team&&u.dead&&!u.summon);if(f){c.blessed=1;f.dead=false;f.hp=f.maxHp*.4;f.deadT=0;cureStatus(f);setAnim(f,'Idle',true);if(!SIM.on)texts.push({x:f.x,y:f.y-30,txt:'Revival Blessing!',col:'#ffe14d',life:1.2,label:1});}}
     B.shield(.1,{who:'team'}).cast(c,tg,i);fire(c,tg,'#ff9be6',()=>hitAb(c,tg,1.2));}});
kit({ids:[955,956],role:'Lumina Bird',cls:'Mystic',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Confusion','Lumina Crash'],mvType:'Psychic',tail:(c,i)=>i?'<b>Speed Boost:</b> +5% Attack Speed every 3s.':'',begin(c,i){if(i)every(c,3,()=>{c.as*=1.05;});}},
  staged(B.hit(1,{fx:{conf:1}}),B.hit(1.4,{col:'#ff9be6',fx:{sdef:25}})));
kit({ids:[957,958,959],role:'Hammer Smith',cls:'Bruiser',cat:'phys',range:1,mana:[55,65,75],pf:[.8,.95,1.15],names:['Fairy Wind','Brutal Swing','Gigaton Hammer'],mvType:'Steel',tail:(c,i)=>i===2?'<b>Mold Breaker:</b> the Gigaton Hammer deals +50% to enemies with more max HP than Tinkaton.':''},
  staged(B.hit(1,{fx:{weaken:.1}}),B.nova(.9,{say:'Swings its hammer',r:1}),{d:c=>`Brings down the Gigaton Hammer on the target for ${DT(c,2)} (+50% to bulkier enemies), stunning it for 0.6s. Every other cast it uses Play Rough instead (${DT(c,1.1)}).`,
    cast(c,tg){if(tg.dead)return;if(c.gigaT){c.gigaT=0;hitAb(c,tg,1.1);return;}c.gigaT=1;hitAb(c,tg,2*(tg.maxHp>c.maxHp?1.5:1));stun(tg,.6);if(!SIM.on)pfx('Gigaton_Hammer_PMDO',tg.x,tg.y-14,{sc:1,force:1});}}));
kit({ids:[960,961],role:'Triple Eel',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1.1],names:['Wrap','Triple Dive'],mvType:'Water'},
  staged(B.hit(1,{proj:false,fx:{slow:[.2,2]}}),B.hit(.5,{n:3,dash:1,to:'weak'})));
kit({ids:[962],role:'Stork Bomber',cls:'Artillery',cat:'phys',range:3,mana:65,pf:1.05,names:['Rock Throw'],mvType:'Flying',tail:()=>'<b>Big Pecks:</b> its Defense can\'t be lowered.',begin(c){c.fx.clear=1;}},
  B.barrage(3,.65,{what:'boulders',splash:1,col:'#c8b090',fx:{stun:.3}}));
kit({ids:[963,964],role:'Hero Dolphin',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.8,1.15],names:['Aqua Jet','Jet Punch'],mvType:'Water',tail:(c,i)=>i?'<b>Zero to Hero:</b> after its first battle it becomes Hero Palafin for the rest of the run.':''},
  staged(B.hit(1.1,{dash:1}),B.hit(.6,{n:3,dash:1,to:'weak',proj:false})));
kit({ids:[965,966],role:'Engine Revver',cls:'Juggernaut',cat:'phys',range:1,mana:[55,70],start:20,pf:[.85,1.1],names:['Poison Gas','Spin Out'],mvType:'Steel',tail:(c,i)=>i?'<b>Filter:</b> takes 15% less damage.':'',begin(c,i){if(i)c.taken*=.85;}},
  staged(B.nova(.8,{say:'Belches Poison Gas',r:1,fx:{psn:.01}}),B.nova(1.3,{say:'Spins Out its wheels',r:1,fx:{shred:10,psn:.01}})));
kit({ids:[967],role:'Ride Lizard',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.05,names:['Shed Tail'],mvType:'Dragon'},
  {d:c=>`Sheds its tail (pays 15% of its max HP) to give the most injured ally a shield of 25% of that ally's max HP, then rushes the weakest enemy with Dragon Rush for ${DT(c,1.4)}.`,
   cast(c,tg){hurt(c,c.maxHp*.15,null);const a=alive(c.team).filter(a=>a!==c).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a)a.shield+=a.maxHp*.25;const t=pickT(c,tg,'weak');dashTo(c,t,true,.2);schedule(.22,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.4);});}});
kit({ids:[968],role:'Earth Eater',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1,names:['Shed Tail'],mvType:'Steel',tail:()=>'<b>Earth Eater:</b> Ground moves heal it instead of hurting it.',begin(c){c.fx.immune=[...(c.fx.immune||[]),'Ground'];c.fx.absorb=1;}},
  seq(B.shield(.25,{def:15}),B.hit(1.1,{proj:false,fx:{flinch:.3}})));
kit({ids:[969,970],role:'Toxic Crystal',cls:'Artillery',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Rock Throw','Power Gem'],mvType:'Rock',tail:(c,i)=>i?'<b>Toxic Debris:</b> melee attackers that hit it gain 1 Poison.':''},
  {...staged(B.hit(1),B.barrage(4,.6,{what:'toxic crystals',splash:1,col:'#ff9be6',fx:{psn:.01}})),hitBy(c,src,o){if(c.kit.si&&src&&src.team!==c.team&&o.auto&&hdist(src,c)<=1)addStatus(src,'poison',1,c);}});
kit({ids:[971,972],role:'Ghost Dog',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.05],names:['Lick','Last Respects'],mvType:'Ghost'},
  staged(seq(B.shield(.15),B.hit(1,{proj:false,fx:{para:1}})),{d:c=>`Pays its Last Respects to the target for ${DT(c,1.3)}, +50% for every ally that has fainted this battle.`,
    cast(c,tg){if(tg.dead)return;const n=units.filter(u=>u.team===c.team&&u.dead).length;hitAb(c,tg,1.3*(1+.5*n));boom(tg,'#8a6cd6',1+Math.min(2,n));}}));
kit({ids:[974,975],role:'Ice Whale',cls:'Juggernaut',cat:'phys',range:1,mana:[60,75],start:20,pf:[.85,1.1],names:['Powder Snow','Avalanche'],mvType:'Ice',tail:(c,i)=>i?'<b>Thick Fat:</b> takes 15% less damage.':'',begin(c,i){if(i)c.taken*=.85;}},
  staged(B.hit(1,{proj:false,fx:{chill:1}}),{d:c=>`Waits a moment, then brings an Avalanche down on every enemy within 1 hex for ${DT(c,1.2)} (double if it was hit while waiting), adding 2 Chill.`,
    cast(c,tg){const h=c.hits;c.busy=Math.max(c.busy,.5);schedule(.5,()=>{if(c.dead)return;const k=c.hits>h?2:1;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1.2*k);addStatus(q,'chill',2,c);}if(!SIM.on)pfx('Avalanche_Hit',c.x,c.y-14,{sc:1,force:1});});}}));
kit({ids:[976],role:'Fillet Fish',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.05,names:['Psycho Cut'],mvType:'Psychic',tail:()=>'<b>Sharpness:</b> +10% damage.',begin(c){c.dmg+=.1;}},
  {d:c=>`The first time each battle it uses Fillet Away (pays 25% of its max HP for +30% Attack and Attack Speed). Then it slashes the weakest enemy with Psycho Cut for ${DT(c,1.4)}.`,
   cast(c,tg){if(!c.fillet){c.fillet=1;hurt(c,c.maxHp*.25,null);c.atk*=1.3;c.as*=1.3;}const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.2);schedule(.22,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.4,{cr:.2});});}});
kit({ids:[977],role:'Big Catfish',cls:'Juggernaut',cat:'phys',range:1,mana:75,start:20,pf:1.05,names:['Wave Crash'],mvType:'Water',tail:()=>'<b>Commander:</b> with a Tatsugiri on your team, Tatsugiri hides inside it and it gains +50% Attack, Defense and Attack Speed.',
  begin(c){if(alive(c.team).some(a=>baseOf(a.dex)===978)){c.atk*=1.5;c.def*=1.5;c.as*=1.5;}}},
  {d:c=>`Crashes a huge wave into the target and every enemy next to it for ${DT(c,1.4)} (70% to the others), knocking them back.`,cast(c,tg){if(tg.dead)return;for(const q of[tg,...near(tg,1)]){hitAb(c,q,1.4*(q===tg?1:.7));knock(c,q);}boom(tg,'#5ab8ff',3);}});
kit({ids:[978],role:'Commander',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.05,names:['Draco Meteor'],mvType:'Dragon',tail:()=>'<b>Commander:</b> with a Dondozo on your team, it rides inside (can\'t be targeted) and fires from there.',
  begin(c){if(alive(c.team).some(a=>a.dex===977)){c.airT=9999;c.target=null;every(c,.5,()=>{if(c.airT>combatT&&!alive(c.team).some(a=>a.dex===977))c.airT=0;});}}},
  {d:c=>`Calls a Draco Meteor down on the biggest group of enemies: ${DT(c,1.5)} to the center and 70% to adjacent enemies. Its own <span class="s-spa">Sp. Atk</span> drops 10%.`,
   cast(c,tg){B.blast(1.5,{at:'cluster',r:1,arc:1,col:'#8a6cff'}).cast(c,tg,0,{});c.spa*=.9;}});
kit({ids:[980],role:'Mud Fish',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1,names:['Toxic Spikes'],mvType:'Poison',tail:()=>'<b>Unaware:</b> takes 10% less damage. Melee attackers gain 1 Poison.',begin(c){c.taken*=.9;}},
  {...seq(B.shield(.2),B.nova(1,{say:'Scatters Toxic Spikes',r:1,fx:{psn:.015}})),hitBy(c,src,o){if(src&&src.team!==c.team&&o.auto&&hdist(src,c)<=1)addStatus(src,'poison',1,c);}});
kit({ids:[996,997,998],role:'Ice Dragon',cls:'Striker',cat:'phys',range:1,mana:[55,65,75],pf:[.8,.95,1.15],names:['Ice Shard','Icicle Crash','Glaive Rush'],mvType:'Dragon',tail:(c,i)=>i===2?'<b>Thermal Exchange:</b> Fire moves raise its Attack by 10% instead of burning it.':''},
  staged(B.hit(1,{dash:1,fx:{chill:1}}),B.hit(1.3,{proj:false,fx:{chill:2,flinch:.3}}),{d:c=>`Charges the strongest enemy with Glaive Rush for ${DT(c,2)}. It takes 30% more damage for 2s afterwards.`,
    cast(c,tg){const t=pickT(c,tg,'strong');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,2);c.taken*=1.3;schedule(2,()=>{c.taken/=1.3;});boom(t,'#bff0ff',3);});}}));
kit({ids:[1012,1013],role:'Matcha Ghost',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,70],pf:[.8,1.05],names:['Absorb','Matcha Gotcha'],mvType:'Grass',tail:(c,i)=>i?'<b>Hospitality:</b> at the start of battle, adjacent allies heal 10% max HP.':''},
  staged(seq(B.hit(.9),B.heal(.5)),{d:c=>`Whisks Matcha Gotcha over every enemy within 2 hexes for ${DT(c,.8)} (30% chance to burn), healing the most injured ally for half the damage dealt.`,
    cast(c,tg){let tot=0;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){tot+=hitAb(c,q,.8)||0;if(Math.random()<.3)addStatus(q,'burn',2,c);}const a=alive(c.team).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a)heal(a,tot*.5);if(!SIM.on)ring(c.x,c.y-6,'#a8d860');}}));

// --- Paradox Pokémon ---
kit({ids:[984],role:'Ancient Tusk',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Headlong Rush'],mvType:'Ground',tail:PARA_A,begin(c){paradox(c,0);}},
  {d:c=>`Charges the target with Headlong Rush for ${DT(c,1.7)}, then spins away hazards (Rapid Spin: cures its own status). Its Defense drops 10.`,cast(c,tg){if(tg.dead)return;dashTo(c,tg,false,.18);schedule(.2,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.7);cureStatus(c);c.def=Math.max(0,c.def-10);boom(tg,'#c8a070',3);});}});
kit({ids:[985],role:'Ancient Puff',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.05,names:['Wish'],mvType:'Fairy',tail:PARA_A,begin(c){paradox(c,0);}},
  seq(B.heal(.4,{who:'team'}),B.control({sleep:1},{to:'strong',say:'Sings to'})));
kit({ids:[986],role:'Ancient Fungus',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.1,names:['Spore'],mvType:'Grass',tail:PARA_A,begin(c){paradox(c,0);}},
  seq(B.control({sleep:1},{to:'target',say:'Puffs Spore at'}),B.hit(1.5,{proj:false,fx:{seed:2}})));
kit({ids:[987],role:'Ancient Wraith',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.15,names:['Moonblast'],mvType:'Fairy',tail:PARA_A,begin(c){paradox(c,0);}},
  seq(B.hit(1.3,{col:'#ff9be6',fx:{weaken:.1}}),B.hit(.8,{to:'weak',col:'#8a6cd6'})));
kit({ids:[988],role:'Ancient Moth',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.1,names:['Leech Life'],mvType:'Bug',tail:PARA_A,begin(c){paradox(c,0);}},B.hit(1.5,{proj:false,heal:.5}));
kit({ids:[989],role:'Ancient Magnet',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Earth Power'],mvType:'Electric',tail:PARA_A,begin(c){paradox(c,0);}},seq(B.blast(1.2,{at:'cluster',r:1,col:'#c8a070',fx:{sdef:10}}),B.chain(2,.8,{fx:{para:1}})));
kit({ids:[990],role:'Future Phan',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Iron Head'],mvType:'Steel',tail:PARA_F,begin(c){paradox(c,1);}},seq(B.shield(.15),B.hit(1.4,{dash:1,fx:{flinch:.3}})));
kit({ids:[991],role:'Future Delibird',cls:'Striker',cat:'spec',range:3,mana:60,pf:1.1,names:['Freeze-Dry'],mvType:'Ice',tail:PARA_F,begin(c){paradox(c,1);}},B.hit(.75,{n:2,to:'weak',col:'#bff0ff',fx:{chill:2}}));
kit({ids:[992],role:'Future Fists',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Drain Punch'],mvType:'Fighting',tail:PARA_F,begin(c){paradox(c,1);}},B.hit(1.5,{proj:false,heal:.5,fx:{para:1}}));
kit({ids:[993],role:'Future Hydra',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Hurricane'],mvType:'Flying',tail:PARA_F,begin(c){paradox(c,1);}},B.blast(1.4,{at:'cluster',r:1,col:'#cfe8ff',fx:{conf:1}}));
kit({ids:[994],role:'Future Moth',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.1,names:['Fiery Dance'],mvType:'Fire',tail:PARA_F,begin(c){paradox(c,1);}},seq(B.blast(1.3,{at:'cluster',r:1,col:'#ff7a3c',fx:{burn:.015}}),B.ramp({spa:.1})));
kit({ids:[995],role:'Future Tyrant',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1.05,names:['Wild Charge'],mvType:'Rock',tail:PARA_F,begin(c){paradox(c,1);}},seq(B.shield(.2),B.hit(1.4,{dash:1,fx:{para:2}})));
kit({ids:[1005],role:'Ancient Dragon',cls:'Striker',cat:'phys',range:1,mana:65,pf:1.15,names:['Crunch'],mvType:'Dark',tail:PARA_A,begin(c){paradox(c,0);}},seq(B.ramp({atk:.1,as:.1}),B.hit(1.4,{dash:1,to:'weak',fx:{shred:10}})));
kit({ids:[1006],role:'Future Knight',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Spirit Break'],mvType:'Fairy',tail:PARA_F,begin(c){paradox(c,1);}},
  {d:c=>`Alternates its blades: Spirit Break the weakest enemy for ${DT(c,1.4)} (lowering its Sp. Atk by 20% for 4s), or a Moonblast at the strongest for ${DT(c,1.4)}.`,
   cast(c,tg){c.alt=!c.alt;const t=pickT(c,tg,c.alt?'weak':'strong');if(c.alt){if(hdist(c,t)>1)dashTo(c,t,true,.18);schedule(.2,()=>{if(!c.dead&&!t.dead){hitAb(c,t,1.4);debuff(t,'spa',.2,4);}});}else fire(c,t,'#ff9be6',()=>hitAb(c,t,1.4,{cat:'spec'}),{size:5});}});
kit({ids:[1009],role:'Ancient Wake',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Hydro Steam'],mvType:'Water',tail:()=>PARA_A()+' Hydro Steam is stronger (not weaker) in sun.',begin(c){paradox(c,0);}},
  {d:c=>`Blasts Hydro Steam through every enemy in a line for ${DT(c,1.5)} (+30% in sun).`,cast(c,tg){B.beam(1.5*(battle.weather==='sun'?1.3:1),{col:'#e0f0ff'}).cast(c,tg,0);}});
kit({ids:[1010],role:'Future Blade',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Psyblade'],mvType:'Psychic',tail:PARA_F,begin(c){paradox(c,1);}},B.hit(1.5,{dash:1,to:'weak',cr:.2}));
kit({ids:[1020],role:'Ancient Flame',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Burning Bulwark'],mvType:'Fire',tail:PARA_A,begin(c){paradox(c,0);}},
  {d:c=>`Raises a Burning Bulwark: protected for 1s, and every melee attacker in that time gains 3 Burn. Then it lunges with Raging Fury for ${DT(c,1.4)}.`,
   cast(c,tg){c.protT=combatT+1;c.bulT=c.protT;schedule(1,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.4,{type:'Fire'});});},hitBy(c,src,o){if(c.bulT>combatT&&src&&src.team!==c.team&&hdist(src,c)<=1)addStatus(src,'burn',3,c);}});
kit({ids:[1021],role:'Ancient Storm',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.15,names:['Thunderclap'],mvType:'Electric',tail:PARA_A,begin(c){paradox(c,0);gainMana(c,20);}},
  seq(B.hit(1.1,{col:'#ffe14d',fx:{para:2}}),B.cone(1.2,{say:'Breathes a Dragon Pulse',depth:2,col:'#8a6cff'})));
kit({ids:[1022],role:'Future Boulder',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Mighty Cleave'],mvType:'Rock',tail:PARA_F,begin(c){paradox(c,1);}},
  {d:c=>`Cleaves the target with Mighty Cleave for ${DT(c,1.6)}, cutting through shields and protection.`,cast(c,tg){if(tg.dead)return;tg.shield=0;tg.protT=0;hitAb(c,tg,1.6);boom(tg,'#c8b090',2);}});
kit({ids:[1023],role:'Future Crown',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.15,names:['Tachyon Cutter'],mvType:'Steel',tail:PARA_F,begin(c){paradox(c,1);}},B.hit(.8,{n:2,to:'strong',col:'#c0d8ff'}));

// --- Treasures of Ruin, box legends and Kitakami ---
const ruin=(c,stat,p)=>{if(c.fx.ruin2)p*=2;for(const o of units)if(o.team!==c.team&&!o.dead){if(stat==='def'||stat==='res')o[stat]=Math.max(0,o[stat]*(1-p));else o[stat]*=1-p;}};
kit({ids:[1001],role:'Ruinous Tablets',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:75,start:25,pf:1.1,names:['Ruination'],mvType:'Dark',tail:()=>'<b>Tablets of Ruin:</b> every enemy has 15% less Attack.',begin(c){ruin(c,'atk',.15);}},
  {d:c=>`${B.shield(.2).d(c,0)} Then Ruination halves the current HP of the target (up to ${DT(c,2)}), and it leeches 2 Leech Seed onto it.`,
   cast(c,tg){B.shield(.2).cast(c,tg,0);if(!tg.dead){damage(c,tg,Math.min(tg.hp*.5,V(c,2)),{ab:1,cat:'spec',tru:1,noCrit:1});addStatus(tg,'seed',2,c);}}});
kit({ids:[1002],role:'Ruinous Sword',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Icicle Crash'],mvType:'Ice',tail:()=>'<b>Sword of Ruin:</b> every enemy has 15% less Defense.',begin(c){ruin(c,'def',.15);}},
  B.hit(1.5,{dash:1,to:'weak',cr:.2,fx:{chill:2}}));
kit({ids:[1003],role:'Ruinous Vessel',cls:'Juggernaut',cat:'phys',range:1,mana:75,start:20,pf:1.1,names:['Ruination'],mvType:'Ground',tail:()=>'<b>Vessel of Ruin:</b> every enemy has 15% less Sp. Atk.',begin(c){ruin(c,'spa',.15);}},
  {d:c=>`Stomps the ground with Ruination: every enemy within 2 hexes loses a quarter of its current HP (up to ${DT(c,1.4)} each) and is slowed by 25% for 3s.`,
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){damage(c,q,Math.min(q.hp*.25,V(c,1.4)),{ab:1,cat:'phys',tru:1,noCrit:1});applyFx(c,q,{slow:[.25,3]},0);}if(!SIM.on){ring(c.x,c.y-6,'#8a6a3a');burst(c.x,c.y,'#b08a5a',20,1.3);}}});
kit({ids:[1004],role:'Ruinous Beads',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.15,names:['Overheat'],mvType:'Fire',tail:()=>'<b>Beads of Ruin:</b> every enemy has 15% less Sp. Def.',begin(c){ruin(c,'res',.15);}},
  {d:c=>`Erupts with Overheat on the biggest group of enemies: ${DT(c,1.7)} to the center and 70% to adjacent enemies, adding 3 Burn. Its own <span class="s-spa">Sp. Atk</span> drops 10%.`,
   cast(c,tg){B.blast(1.7,{at:'cluster',r:1,col:'#ff6a2c',fx:{burn:.015}}).cast(c,tg,0,{});c.spa*=.9;}});
kit({ids:[1007],role:'Winged King',cls:'Striker',cat:'phys',range:1,mana:65,pf:1.2,names:['Collision Course'],mvType:'Fighting',tail:()=>'<b>Orichalcum Pulse:</b> turns the sunlight harsh, and in sun its Attack rises 30%.',
  begin(c){setWeather(c,'sun');if(battle.weather==='sun')c.atk*=1.3;}},
  {d:c=>`Collides with the strongest enemy for ${DT(c,1.8)} (+30% against Pokémon weak to Fighting: Normal, Rock, Steel, Ice and Dark).`,
   cast(c,tg){const t=pickT(c,tg,'strong');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;const se=D[t.dex].t.some(x=>['Normal','Rock','Steel','Ice','Dark'].includes(x));hitAb(c,t,1.8*(se?1.3:1));boom(t,'#ff7a3c',3);});}});
kit({ids:[1008],role:'Paradox King',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.2,names:['Electro Drift'],mvType:'Electric',tail:()=>'<b>Hadron Engine:</b> your Electric moves deal +20% damage and it starts with +20 PP.',
  begin(c){gainMana(c,20);for(const a of alive(c.team)){a.fx.typeBoost=Object.assign({},a.fx.typeBoost||{});a.fx.typeBoost.Electric=(a.fx.typeBoost.Electric||0)+.2;}}},
  {d:c=>`Drifts through the enemy line with Electro Drift: every enemy in a line takes ${DT(c,1.6)} and gains 2 Paralysis.`,cast(c,tg){B.beam(1.6,{col:'#7fd8ff',fx:{para:2}}).cast(c,tg,0);}});
kit({ids:[1014],role:'Toxic Hound',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Bulk Up'],mvType:'Poison',tail:()=>'<b>Toxic Chain:</b> its hits have a 30% chance to add 3 Poison.'},
  seq(B.ramp({atk:.1}),B.shield(.15),B.hit(1.4,{proj:false,fx:{psn:.015}})));
kit({ids:[1015],role:'Toxic Monkey',cls:'Trickster',cat:'spec',range:3,mana:60,pf:1.1,names:['Fake Out'],mvType:'Psychic',tail:()=>'<b>Toxic Chain:</b> its move adds 3 Poison.'},
  seq(B.hit(.8,{to:'strong',fx:{stun:.6}}),B.hit(1.2,{fx:{psn:.015,conf:1}})));
kit({ids:[1016],role:'Toxic Pheasant',cls:'Artillery',cat:'phys',range:3,mana:65,pf:1.1,names:['Beat Up'],mvType:'Dark',tail:()=>'<b>Toxic Chain:</b> its strikes add Poison.'},
  {d:c=>`Calls on its whole team for Beat Up: one strike on the target for every ally still standing, ${DT(c,.4)} each, adding 1 Poison per strike.`,
   cast(c,tg){const n=alive(c.team).length;for(let k=0;k<n;k++)schedule(k*.1,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,.4);addStatus(tg,'poison',1,c);}});}});
kit({ids:[1017],role:'Masked Dancer',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Ivy Cudgel'],mvType:'Grass',tail:()=>'<b>Embody Aspect:</b> +15% Attack Speed at the start of battle.',begin(c){c.as*=1.15;}},
  B.hit(1.5,{dash:1,to:'weak',cr:.3,fx:{seed:2}}));
kit({ids:[1024],role:'Terastal',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:80,start:25,pf:1.15,names:['Tera Starstorm'],mvType:'Normal',tail:()=>'<b>Tera Shell:</b> takes half damage while above 75% HP.',
  begin(c){c.tsh=1;c.taken*=.5;},hitBy(c,src,o,d){if(c.tsh&&c.hp-d<c.maxHp*.75){c.tsh=0;c.taken/=.5;}}},
  {d:c=>`Unleashes a Tera Starstorm: every enemy takes ${DT(c,.6)}, and your team gains a shield of ${HPT(c,.08)} each.`,
   cast(c,tg){for(const q of foesOf(c))hitAb(c,q,.6);B.shield(.08,{who:'team'}).cast(c,tg,0);if(!SIM.on)ring(c.x,c.y-6,'#ffffff');}});
kit({ids:[1025],role:'Mochi Master',cls:'Trickster',cat:'spec',range:3,mana:70,pf:1.15,names:['Malignant Chain'],mvType:'Poison',tail:()=>'<b>Poison Puppeteer:</b> enemies it poisons are also confused. <b>Shell Armor:</b> can\'t take critical hits.',begin(c){c.fx.noCrit=1;}},
  {d:c=>`Lashes a Malignant Chain at the 3 enemies with the most HP: ${DT(c,1)} each, adding 4 Poison and 2 Confusion.`,
   cast(c,tg){for(const q of foesOf(c).sort((a,b)=>b.hp-a.hp).slice(0,3)){hitAb(c,q,1);addStatus(q,'poison',4,c);addStatus(q,'conf',2,c);lineFx(c,q,'#c86bd6',2,.3);}}});
kit({ids:[973],role:'Synchronized Flock',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.05,names:['Close Combat'],mvType:'Fighting',tail:()=>'<b>Costar:</b> starts battle with the PP of the ally next to it, if higher.',begin(c){const a=alive(c.team).filter(a=>a!==c&&hdist(a,c)<=1).sort((x,y)=>y.mana-x.mana)[0];if(a&&a.mana>c.mana)c.mana=Math.min(c.maxMana,a.mana);}},
  B.hit(1.6,{dash:1,to:'weak',fx:{shred:10}}));

// tuning pass: Gen IX kit damage against the earlier generations at the same cost (kitbal9)
for(const[d,m]of Object.entries({923:1.3,961:1.2,925:1.4,941:.5,956:.9,978:.65,975:.8,962:.8,976:.85,911:1.15,949:1.25,943:1.2,967:1.3}))tuneSig(+d,m);
for(const[d,m]of Object.entries({989:.6,994:.65,993:.65,970:.7,1021:.75,991:.8,1009:.85,1023:.85,987:.9,1016:1.4}))tuneSig(+d,m);
