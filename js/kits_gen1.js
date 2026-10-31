/* Generation I signature kits. Each line's ids run from first stage to last (later-generation relatives included).
   Starters, Pikachu, Machamp, Gengar, Marowak and Snorlax live in kits.js. */

// --- Bugs ---
kit({ids:[10,11,12],role:'Pollinator',cls:'Mystic',cat:'spec',range:[2,1,3],mana:[60,70,75],pf:[.8,1,1.1],names:['String Shot','Harden','Sleep Powder'],mvType:'Bug'},
  staged(B.hit(.9,{fx:{slow:[.3,3]}}),B.shield(.25,{def:20}),seq(B.control({sleep:1.6},{say:'Scatters sleep powder over',r:1,at:'cluster',col:'#e0c8ff'}),B.blast(.7,{what:'a Bug Buzz',at:'cluster',r:1}))));
kit({ids:[13,14,15],role:'Stinger',cls:'Trickster',cat:'phys',range:1,mana:[60,70,65],start:[10,10,30],pf:[.8,1,1.1],names:['Poison Sting','Harden','Fell Stinger'],mvType:'Bug',
  tail:(c,i)=>i===2?'<b>Fell Stinger:</b> each knockout with it adds +20% <span class="s-atk">Attack</span> for the battle.':''},
  staged(B.hit(1,{fx:{psn:.015}}),B.shield(.25,{def:20}),{d:(c,i)=>B.hit(.45,{dash:1,to:'weak',n:3,fx:{psn:.02}}).d(c,i),cast(c,tg,i){const x={};B.hit(.45,{dash:1,to:'weak',n:3,fx:{psn:.02}}).cast(c,tg,i,x);schedule(.6,()=>{if(x.t&&x.t.dead&&!c.dead)c.atk*=1.2;});}}));
kit({ids:[123,212],role:'Blade Dancer',cls:'Bruiser',cat:'phys',range:1,mana:[55,60],pf:[1,1.25],names:['Fury Cutter','Bullet Punch'],mvType:'Bug',
  d:(c,i)=>i?`Strikes first with a lightning-fast punch for ${DT(c,.7)}, twice. <b>Technician:</b> starts battle with 40 PP and each knockout refunds 30 PP.`:`Slashes the target for ${DT(c,.8)}. <b>Fury Cutter:</b> each cast in a row on the same enemy doubles the damage (up to ×4).`,
  begin(c,i){if(i)c.mana=Math.max(c.mana,40);},
  cast(c,tg,i){if(i){for(let k=0;k<2;k++)schedule(k*.12,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,.7);if(tg.dead)gainMana(c,30);if(!SIM.on)spark(tg.x,tg.y-12,'#c9c9d6',8);}});return;}
    c.fury=c.furyT===tg?Math.min(4,(c.fury||1)*2):1;c.furyT=tg;hitAb(c,tg,.8*c.fury);boom(tg,'#8fd16a',c.fury>2?2:1);if(!SIM.on&&c.fury>1)texts.push({x:tg.x,y:tg.y-34,txt:'×'+c.fury,col:'#d6f08a',life:.8,label:1});}});
kit({ids:[127],role:'Guillotine',cls:'Bruiser',cat:'phys',range:1,mana:80,pf:1.4,names:['Vise Grip'],mvType:'Bug'},
  {d:c=>`Clamps the target, holding it in place for 1.5s and dealing ${DT(c,1.2)}. If the target is left below 20% HP, its horns snap shut and it's knocked out instantly.`,
   cast(c,tg){if(tg.dead)return;stun(tg,1.5);hitAb(c,tg,1.2);if(!tg.dead&&tg.hp<tg.maxHp*.2){hurt(tg,tg.hp+tg.shield+1,c);if(!SIM.on)texts.push({x:tg.x,y:tg.y-36,txt:'Guillotine!',col:'#ff6b6b',life:1.1,label:1});}boom(tg,'#c9a46b',2);}});
kit({ids:[46,47],role:'Spore Host',cls:'Trickster',cat:'phys',range:1,mana:[75,80],pf:[.9,1.1],names:['Stun Spore','Spore'],mvType:'Grass'},
  staged(B.hit(1,{fx:{stun:.8}}),seq(B.hit(1.1,{heal:.3,fx:{sleep:2}}),B.control({sleep:1.2},{say:'Then the mushroom puffs more spores over',r:1,at:'target'}))));
kit({ids:[48,49],role:'Dust Weaver',cls:'Mystic',cat:'spec',range:3,mana:[70,65],pf:[.9,1.15],names:['Psybeam','Quiver Dance'],mvType:'Bug'},
  staged(B.hit(1.1,{fx:{sdef:6}}),seq(B.ramp({spa:.12,as:.08}),B.hit(.9,{fx:{sdef:8}}))));

// --- Birds and Normal types ---
kit({ids:[16,17,18],role:'Gale Rider',cls:'Artillery',cat:'spec',range:3,mana:[65,70,80],pf:[.8,1,1.2],names:['Gust','Air Slash','Hurricane'],mvType:'Flying'},
  staged(B.hit(1.1,{fx:{knock:1}}),B.hit(1.2,{fx:{flinch:.5}}),B.blast(1.05,{what:'a Hurricane',r:1,fx:{knock:1,flinch:.3}})));
kit({ids:[21,22],role:'Drill Diver',cls:'Striker',cat:'phys',range:1,mana:[60,70],pf:[.9,1.2],names:['Fury Attack','Drill Run'],mvType:'Flying'},
  staged(B.hit(.4,{n:3}),seq(B.hit(1.1,{dash:1,to:'far'}),B.beam(.7,{what:'its drill',fx:{shred:8}}))));
kit({ids:[84,85],role:'Triple Threat',cls:'Combo',cat:'phys',range:1,mana:[60,65],pf:[.9,1.15],names:['Double Hit','Tri Attack'],mvType:'Normal'},
  {d:(c,i)=>`Each of its ${i?'three':'two'} heads pecks a different nearby enemy for ${DT(c,.6)}${i?', and every peck burns, freezes or paralyzes at random':''}.`,
   cast(c,tg,i){const ts=foesOf(c).filter(f=>hdist(f,c)<=2).sort((a,b)=>hdist(a,c)-hdist(b,c));const n=i?3:2;for(let k=0;k<n;k++){const t=ts[k%Math.max(1,ts.length)]||tg;schedule(k*.1,()=>{if(c.dead||t.dead)return;hitAb(c,t,.6);if(i)applyFx(c,t,{tri:1},i);spark(t.x,t.y-12,'#ffd8a0',6);});}}});
kit({ids:[83],role:'Leek Knight',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.25,names:['Leaf Blade'],mvType:'Grass',
  d:c=>`Slashes with its leek for ${DT(c,1.2)} with +40% crit chance. <b>Keen Eye:</b> every cast adds +6% crit chance for the battle.`,
  cast(c,tg){hitAb(c,tg,1.2,{cr:.4});c.crit+=.06;boom(tg,'#8fd16a');}});
kit({ids:[19,20],role:'Gnawer',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.9,1.1],names:['Hyper Fang','Super Fang'],mvType:'Normal'},
  {d:(c,i)=>`Bites the target for ${DT(c,.8)}${i?` plus <span class="s-true">true</span> damage equal to 20% of its current HP — devastating against big targets`:' with a 30% chance to flinch'}.`,
   cast(c,tg,i){hitAb(c,tg,.8);if(i&&!tg.dead)damage(c,tg,tg.hp*.2,{ab:1,tru:1,noCrit:1});else if(Math.random()<.3)stun(tg,.35);boom(tg,'#d8c8a8');}});
kit({ids:[52,53],role:'Cat Burglar',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.9,1.2],names:['Pay Day','Slash'],mvType:'Normal',
  d:(c,i)=>`${i?`Slashes the target for ${DT(c,1.1)} with +50% crit chance.`:`Flings coins at the target for ${DT(c,.9)}.`} <b>Pay Day:</b> each cast has a 35% chance to drop ₽1 (up to ₽2 per battle).`,
  cast(c,tg,i){hitAb(c,tg,i?1.1:.9,{cr:i?.5:0});if(c.team===0&&(battle.payN||0)<2&&Math.random()<.35){battle.payN=(battle.payN||0)+1;run.gold++;if(!SIM.on)texts.push({x:c.x,y:c.y-36,txt:'+₽1',col:'#ffd34d',life:1});}}});
kit({ids:[174,39,40],role:'Singer',cls:'Juggernaut',type:'guard',cat:'spec',range:1,mana:[80,80,85],start:20,pf:[.8,.9,1.1],names:['Sing','Sing','Hyper Voice'],mvType:'Normal'},
  staged(B.control({sleep:1.2},{say:'Sings a lullaby to',n:2}),B.control({sleep:1.5},{say:'Sings a lullaby to',n:3}),seq(B.control({sleep:1.5},{say:'Sings a lullaby to',n:3}),B.nova(.8,{say:'Then belts out a Hyper Voice',r:2}))));
kit({ids:[108,463],role:'Licker',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[75,80],start:20,pf:[.9,1.1],names:['Lick','Power Whip'],mvType:'Normal'},
  staged(seq(B.shield(.18),B.hit(.9,{proj:false,fx:{stun:1}})),seq(B.shield(.22),B.hit(.8,{to:'far',fx:{pull:1,stun:1}}))));
kit({ids:[115],role:'Parent',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:75,start:20,pf:1.1,names:['Dizzy Punch'],mvType:'Normal',
  tail:()=>'<b>Parental Bond:</b> her baby joins in, hitting again for 50%.'},B.hit(1,{proj:false,echo:.5,fx:{stun:.6}}));
kit({ids:[128],role:'Raging Bull',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.2,names:['Raging Bull'],mvType:'Normal'},
  {d:c=>`Charges the target, shattering any shield it has, then hits it for ${DT(c,1.2)} and knocks it back.`,cast(c,tg){tg.shield=0;hitAb(c,tg,1.2);knock(c,tg);boom(tg,'#d8a878',2);}});
kit({ids:[137,233,474],role:'Program',cls:'Mystic',cat:'spec',range:3,mana:[65,65,70],pf:[.9,1.1,1.35],names:['Tri Attack','Tri Attack','Hyper Beam'],mvType:'Normal',
  tail:(c,i)=>i===2?'<b>Adaptability:</b> each cast adds +8% damage for the battle.':''},
  staged(B.hit(1.1,{fx:{tri:1}}),B.chain(2,.9,{fx:{tri:1},col:'#ff9be6'}),{d:(c,i)=>B.beam(1.5,{charge:.6}).d(c,i),cast(c,tg,i){B.beam(1.5,{charge:.6,col:'#ffb0e8'}).cast(c,tg,i);c.dmg+=.08;}}));
kit({ids:[132],role:'Mimic',cls:'Trickster',cat:'phys',range:1,mana:70,pf:1,names:['Transform'],mvType:'Normal'},
  {d:()=>`<b>Transform:</b> at the start of battle, it turns into a copy of the strongest enemy, taking its move, range and PP (but keeping its own stats).`,
   begin(c){schedule(.1,()=>{const t=foesOf(c).sort((a,b)=>b.u.star*lineOf(b.u).cost-a.u.star*lineOf(a.u).cost||b.maxHp-a.maxHp)[0];if(!t)return;
     c.dex=t.dex;c.kit=t.kit;c.mv=t.mv;c.maxMana=t.maxMana;c.range=t.range;c.cat=t.cat;c.pf=t.pf;c.kind=t.kind;if(!SIM.on){ensure(t.dex);burst(c.x,c.y-10,'#c8a8ff',20,1.2);texts.push({x:c.x,y:c.y-36,txt:'Transform!',col:'#d8c0ff',life:1.2,label:1});}});},
   cast(c,tg){hitAb(c,tg,1);}});
kit({ids:[133],role:'Evolution',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.1,names:['Last Resort'],mvType:'Normal'},
  {d:c=>`Hits the target for ${DT(c,1.1)}, +25% for every different type on your field (Adaptability).`,cast(c,tg){const nt=new Set(alive(c.team).flatMap(a=>D[a.dex].t)).size;hitAb(c,tg,1.1*(1+.25*Math.max(0,nt-1)/3));boom(tg,'#d8c0a0',2);}});
kit({ids:[134],role:'Tide Guardian',cls:'Juggernaut',type:'heal',cat:'spec',range:2,mana:80,start:20,pf:1,names:['Aqua Ring'],mvType:'Water'},
  seq(B.shield(.2,{def:25}),B.zone(0,{at:'self',r:1,dur:5,heal:.025,say:'Surrounds itself with a ring of water',col:'#6fb8ff'})));
kit({ids:[135],role:'Needle Storm',cls:'Striker',cat:'phys',range:2,mana:60,pf:1,names:['Pin Missile'],mvType:'Electric',tail:()=>'Each cast also adds +8% <span class="s-as">Attack Speed</span> for the battle.'},
  seq(B.barrage(6,.3,{what:'electrified needles',col:'#ffe14d'}),B.ramp({as:.08})));
kit({ids:[136],role:'Flare Blitzer',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.3,names:['Flare Blitz'],mvType:'Fire',tail:()=>'It takes recoil equal to 15% of the damage dealt.'},
  {d:c=>B.hit(1.4,{dash:1,fx:{burn:.02}}).d(c,0),cast(c,tg){const x={};B.hit(1.4,{dash:1,fx:{burn:.02}}).cast(c,tg,0,x);schedule(.3,()=>{if(!c.dead)hurt(c,V(c,1.4)*.15*.5,null);});}});

// --- Poison ---
kit({ids:[23,24],role:'Constrictor',cls:'Trickster',cat:'phys',range:1,mana:[65,70],pf:[.9,1.15],names:['Wrap','Glare'],mvType:'Poison'},
  staged(B.hit(.9,{fx:{stun:.8}}),seq(B.control({stun:1.4},{say:'Glares at the',to:'strong'}),B.hit(1.1,{dash:1,fx:{psn:.02}}))));
kit({ids:[29,30,31],role:'Matriarch',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[75,80,85],start:20,pf:[.8,1,1.2],names:['Double Kick','Body Slam','Earth Power'],mvType:'Ground'},
  staged(B.hit(.5,{n:2,proj:false}),seq(B.shield(.18),B.hit(1,{proj:false,fx:{stun:.5}})),seq(B.shield(.2,{who:'adjacent'}),B.nova(.8,{say:'Then the ground erupts around her',r:1,fx:{sdef:8}}))));
kit({ids:[32,33,34],role:'Tyrant',cls:'Bruiser',cat:'phys',range:1,mana:[65,70,75],pf:[.8,1,1.2],names:['Poison Jab','Horn Attack','Earth Power'],mvType:'Ground',tail:(c,i)=>i===2?'<b>Sheer Force:</b> deals +25% move damage.':''},
  staged(B.hit(1,{fx:{psn:.015}}),B.hit(1.15,{dash:1,fx:{psn:.02}}),B.blast(1.3,{what:'an Earth Power eruption',r:1,fx:{sdef:10}})));
kit({ids:[41,42,169],role:'Bloodsucker',cls:'Striker',cat:'phys',range:1,mana:[55,55,50],pf:[.8,1,1.15],as:1.1,names:['Leech Life','Leech Life','Cross Poison'],mvType:'Flying'},
  staged(B.hit(1,{heal:.5}),B.hit(1.1,{dash:1,to:'far',heal:.5}),B.hit(.6,{dash:1,to:'weak',n:2,heal:.4,fx:{psn:.02}})));
kit({ids:[43,44,45],role:'Drainer',cls:'Mystic',cat:'spec',range:3,mana:[65,70,75],pf:[.8,1,1.2],names:['Absorb','Mega Drain','Giga Drain'],mvType:'Grass'},
  staged(B.hit(1,{heal:.5}),B.hit(1.15,{heal:.5}),seq(B.hit(1.25,{heal:.5}),B.control({stun:.7},{say:'Then shakes out Stun Spore over',r:1,at:'target',col:'#ffe48a'}))));
kit({ids:[69,70,71],role:'Pitcher',cls:'Bruiser',cat:'phys',range:1,mana:[65,70,75],pf:[.8,1,1.2],names:['Vine Whip','Wrap','Swallow Whole'],mvType:'Grass'},
  staged(B.hit(1,{fx:{slow:[.2,2]}}),B.hit(.9,{to:'far',fx:{pull:1}}),{d:c=>`Snaps its vine around the farthest enemy, drags it into its mouth and chomps down for ${DT(c,1.3)} while it's held for 1s.`,
    cast(c,tg){const t=pickT(c,tg,'far');pullTo(c,t);schedule(.3,()=>{if(c.dead||t.dead)return;stun(t,1);hitAb(c,t,1.3);boom(t,'#9fd16a',2);});}}));
kit({ids:[72,73],role:'Jellyfish',cls:'Artillery',cat:'spec',range:2,mana:[70,75],pf:[.8,1.05],names:['Acid','Sludge Wave'],mvType:'Poison'},
  staged(B.hit(1,{fx:{sdef:8}}),B.nova(.85,{say:'Releases a Sludge Wave',r:2,fx:{psn:.02}})));
kit({ids:[88,89],role:'Sludge',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[75,80],start:20,pf:[.8,1],names:['Sludge','Toxic Pool'],mvType:'Poison'},
  staged(B.hit(1,{proj:false,fx:{psn:.02}}),seq(B.shield(.18),B.zone(.12,{at:'self',r:1,dur:5,say:'Oozes a toxic pool',fx:{psn:.015},col:'#a35bd6'}))));
kit({ids:[109,110],role:'Smog Cloud',cls:'Trickster',cat:'spec',range:3,mana:[70,75],pf:[.8,1],names:['Smog','Toxic Fumes'],mvType:'Poison',tail:()=>'<b>Aftermath:</b> when it faints, it bursts a final cloud where it stood.'},
  {d:(c,i)=>B.zone(.14,{at:'cluster',r:1,dur:i?5:3,say:'Blankets',fx:{psn:.015,slow:[.2,1]}}).d(c,i),cast(c,tg,i){B.zone(.14,{at:'cluster',r:1,dur:i?5:3,fx:{psn:.015,slow:[.2,1]},col:'#9b8fb0'}).cast(c,tg,i);},
   hitBy(c,src,o,d){if(c.hp-d<=0&&!c.aftermath){c.aftermath=1;zone(c,c,1,3,'#9b8fb0',z=>{for(const q of inZone(z,1-c.team))hitAb(c,q,.12,{noCrit:1,quiet:1});});}}});

// --- Ground and Rock ---
kit({ids:[27,28],role:'Roller',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1],names:['Rollout','Rollout'],mvType:'Rock'},
  {d:(c,i)=>`Curls up and rolls into the target ${i?4:3} times, each hit 40% stronger than the last (starting at ${DT(c,.45)}).`,
   cast(c,tg,i){const n=i?4:3;for(let k=0;k<n;k++)schedule(k*.16,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.45*Math.pow(1.4,k));if(!SIM.on)burst(tg.x,tg.y-6,'#d8c48a',6,.8);});}});
kit({ids:[50,51],role:'Burrower',cls:'Striker',cat:'phys',range:1,mana:[60,65],pf:[.8,1],names:['Dig','Triple Dig'],mvType:'Ground'},
  {d:(c,i)=>`Burrows underground for 0.6s (can't be hit), then pops up under the weakest enemy and strikes ${i?'three times':'once'} for ${DT(c,i?.5:1.1)}${i?' each':''}.`,
   cast(c,tg,i){B.airborne(.6).cast(c);schedule(.6,()=>{if(c.dead)return;const t=pickT(c,tg,'weak');dashTo(c,t,true,.12);for(let k=0;k<(i?3:1);k++)schedule(.15+k*.1,()=>{if(!c.dead&&!t.dead){hitAb(c,t,i?.5:1.1);if(!SIM.on)burst(t.x,t.y,'#b08a5a',8,.8);}});});}});
kit({ids:[74,75,76],role:'Boulder',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[75,80,85],start:25,pf:[.8,1,1.2],names:['Rock Throw','Rock Blast','Heavy Slam'],mvType:'Rock',
  tail:(c,i)=>i===2?`<b>Explosion:</b> when it faints, it blows up, dealing ${HPT(c,.3)} as <span class="s-atk">physical</span> damage to enemies within 1 hex.`:''},
  {d:(c,i)=>staged(B.hit(1,{fx:{flinch:.3}}),seq(B.shield(.18),B.hit(.35,{n:4})),seq(B.shield(.22,{def:20}),B.hit(1.2,{proj:false,fx:{stun:.8}}))).d(c,i),
   cast(c,tg,i){staged(B.hit(1,{fx:{flinch:.3}}),seq(B.shield(.18),B.hit(.35,{n:4})),seq(B.shield(.22,{def:20}),B.hit(1.2,{proj:false,fx:{stun:.8}}))).cast(c,tg,i);},
   hitBy(c,src,o,d,i){if(c.kit.si===2&&c.hp-d<=0&&!c.boomed){c.boomed=1;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))damage(c,q,c.maxHp*.3,{ab:1,cat:'phys',noCrit:1,refl:1});boom(c,'#ffb35c',3);}}});
kit({ids:[95,208],role:'Rock Serpent',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[80,85],start:20,pf:[.9,1.1],names:['Sand Tomb','Iron Tail'],mvType:'Rock'},
  staged(seq(B.shield(.2),B.hit(.9,{proj:false,fx:{stun:1.2,shred:8}})),seq(B.shield(.25,{def:25}),B.cone(1,{say:'Sweeps its iron tail',fx:{knock:1}}))));
kit({ids:[111,112,464],role:'Stampede',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[75,80,85],start:20,pf:[.8,1,1.2],names:['Horn Attack','Drill Run','Rock Wrecker'],mvType:'Ground'},
  staged(B.hit(1.1,{proj:false}),seq(B.shield(.18),B.beam(.9,{what:'a horn charge',fx:{knock:1}})),seq(B.shield(.2),B.blast(1.2,{what:'a Rock Wrecker boulder',at:'cluster',r:1,arc:1,fx:{stun:.8}}))));
kit({ids:[138,139],role:'Spike Shell',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[75,80],start:20,pf:[.8,1.05],names:['Water Gun','Spike Cannon'],mvType:'Rock'},
  staged(seq(B.shield(.18),B.hit(1)),seq(B.shield(.2,{def:15}),B.hit(.3,{n:5,fx:{shred:2}}))));
kit({ids:[140,141],role:'Scythe Fossil',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Aqua Jet','Razor Shell'],mvType:'Water'},
  staged(B.hit(1.1,{dash:1}),seq(B.hit(.9,{dash:1,to:'weak'}),B.nova(.6,{say:'Then whirls its scythes',r:1,fx:{shred:8}}))));
kit({ids:[142],role:'Sky Raptor',cls:'Striker',cat:'phys',range:1,mana:70,pf:1.25,names:['Stone Edge'],mvType:'Rock'},B.hit(1.3,{dash:1,to:'far',cr:.3}));

// --- Fire ---
kit({ids:[37,38],role:'Wisp Fox',cls:'Mystic',cat:'spec',range:3,mana:[65,70],pf:[.8,1],names:['Will-O-Wisp','Nine Tails'],mvType:'Fire'},
  {d:(c,i)=>B.barrage(i?9:3,.22,{what:'ghostly wisps',fx:{burn:.01}}).d(c,i),cast(c,tg,i){B.barrage(i?9:3,.22,{what:'wisps',fx:{burn:.01},col:'#8fb8ff',size:2}).cast(c,tg,i);}});
kit({ids:[58,59],role:'Legendary Hound',cls:'Bruiser',cat:'phys',range:1,mana:[70,70],start:[10,45],pf:[.9,1.2],names:['Flame Wheel','Extreme Speed'],mvType:'Fire',tail:(c,i)=>i?'Starts battle with 45 PP.':''},
  staged(B.hit(1.1,{dash:1,fx:{burn:.015}}),seq(B.hit(1.1,{dash:1,to:'far'}),B.nova(.6,{say:'Then flares up',r:1,fx:{burn:.015}}))));
kit({ids:[77,78],role:'Charger',cls:'Striker',cat:'phys',range:1,mana:[60,60],pf:[.8,1],names:['Flame Charge','Flare Charge'],mvType:'Fire',tail:()=>'Each charge also adds +10% <span class="s-as">Attack Speed</span> for the battle.'},
  seq(B.hit(.9,{dash:1,to:'far',fx:{burn:.015}}),B.ramp({as:.1})));
kit({ids:[240,126,467],role:'Flame Cannon',cls:'Artillery',cat:'spec',range:3,mana:[70,75,80],pf:[.8,1,1.25],names:['Ember','Flamethrower','Fire Blast'],mvType:'Fire'},
  staged(B.hit(1,{fx:{burn:.01}}),B.cone(.95,{say:'Blasts flames',fx:{burn:.015}}),B.blast(1.2,{what:'a Fire Blast shell',at:'cluster',r:1,arc:1,fx:{burn:.02}})));
kit({ids:[146],role:'Flame Phoenix',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.35,names:['Fire Spin'],mvType:'Fire',tail:()=>'<b>Overheat:</b> each cast also lowers its own <span class="s-spa">Sp. Atk</span> by 8%.'},
  {d:c=>seq(B.blast(1.4,{what:'an Overheat blast',at:'cluster',r:1}),B.zone(.15,{at:'cluster',r:1,dur:4,say:'Then leaves a Fire Spin',fx:{burn:.01}})).d(c,0),
   cast(c,tg){seq(B.blast(1.4,{what:'an Overheat blast',at:'cluster',r:1,col:'#ff7a2c'}),B.zone(.15,{at:'cluster',r:1,dur:4,fx:{burn:.01},col:'#ff7a2c'})).cast(c,tg,0);c.spa*=.92;}});

// --- Water ---
kit({ids:[54,55],role:'Headache',cls:'Mystic',cat:'spec',range:3,mana:[70,70],pf:[.8,1.05],names:['Confusion','Psychic Blast'],mvType:'Psychic'},
  {d:(c,i)=>`Its headache builds as it takes damage. Releases it at the target for ${DT(c,1)} plus <b>30%</b> of all damage it has taken this battle${c&&c.ache?` (now +${Math.round(c.ache*.3)})`:''}${i?', and confuses the target (stunned for 0.8s)':''}.`,
   hitBy(c,src,o,d){c.ache=(c.ache||0)+d;},cast(c,tg,i){fire(c,tg,'#ffe48a',()=>{damage(c,tg,V(c,1)+(c.ache||0)*.3,{ab:1,cat:'spec',type:'Psychic'});if(i)stun(tg,.8);boom(tg,'#ffe48a',2);},{size:5,sp:260});c.ache=(c.ache||0)*.5;}});
kit({ids:[60,61,62],role:'Brawling Tadpole',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,75,80],start:20,pf:[.8,1,1.2],names:['Bubble','Hypnosis','Circle Throw'],mvType:'Water'},
  staged(B.hit(1,{fx:{slow:[.25,2]}}),seq(B.shield(.18),B.control({sleep:1.5},{to:'strong',say:'Hypnotizes'})),seq(B.shield(.22),B.hit(1.2,{proj:false,fx:{knock:1,stun:.8}}))));
kit({ids:[79,80],role:'Slowpoke Tail',cls:'Medic',type:'heal',cat:'spec',range:2,mana:[80,85],pf:[.9,1.1],names:['Slack Off','Yawn'],mvType:'Water'},
  staged(B.heal(1,{who:'self'}),{d:c=>`Slacks off, healing itself for ${HT(c,.9)}, then yawns at the strongest enemy: 1.5s later, it falls asleep for 2s.`,
    cast(c,tg){heal(c,HEALV(c,.9));const t=pickT(c,tg,'strong');if(!SIM.on)texts.push({x:t.x,y:t.y-30,txt:'*yawn*',col:'#c6b3ff',life:1,label:1});schedule(1.5,()=>{if(!t.dead)applyFx(c,t,{sleep:2},1);});}}));
kit({ids:[81,82,462],role:'Magnet Array',cls:'Mystic',cat:'spec',range:3,mana:[70,75,80],pf:[.8,.95,1.15],names:['Zap Cannon','Zap Cannon','Zap Cannon'],mvType:'Electric'},
  {d:(c,i)=>B.barrage(i+1,1,{what:'slow Zap Cannon orbs',fx:{stun:1}}).d(c,i),cast(c,tg,i){B.barrage(i+1,1,{fx:{stun:1},col:'#ffe14d',size:5}).cast(c,tg,i);}});
kit({ids:[86,87],role:'Iceberg',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[75,80],start:20,pf:[.8,1.05],names:['Ice Shard','Ice Beam'],mvType:'Ice'},
  staged(seq(B.shield(.18),B.hit(1,{fx:{slow:[.3,2]}})),seq(B.shield(.2),B.beam(.9,{what:'an Ice Beam',fx:{freeze:.8}}))));
kit({ids:[90,91],role:'Spike Shell',cls:'Combo',cat:'phys',range:[1,2],mana:[65,70],pf:[.8,1.1],names:['Clamp','Shell Smash'],mvType:'Ice',tail:(c,i)=>i?'Shell Smash lowers its <span class="s-def">Defense</span> by 10 each time.':''},
  staged(B.hit(.9,{proj:false,fx:{stun:.6}}),{d:c=>`Smashes its shell for +20% <span class="s-atk">Attack</span> and <span class="s-as">Attack Speed</span> (stacks), then fires 5 Icicle Spears at the target for ${DT(c,.3)} each.`,
    cast(c,tg){c.atk*=1.2;c.as*=1.2;c.def=Math.max(0,c.def-10);B.hit(.3,{n:5,col:'#dff6ff'}).cast(c,tg,1,{});}}));
kit({ids:[98,99],role:'Crabhammer',cls:'Bruiser',cat:'phys',range:1,mana:[75,85],pf:[1,1.5],names:['Vise Grip','Crabhammer'],mvType:'Water'},
  staged(B.hit(1.1,{proj:false,fx:{stun:.6}}),B.hit(1.6,{proj:false,cr:.5,fx:{knock:1}})));
kit({ids:[116,117,230],role:'Dragon Current',cls:'Artillery',cat:'spec',range:3,mana:[65,70,75],pf:[.8,1,1.2],names:['Water Gun','Twister','Dragon Pulse'],mvType:'Dragon',tail:(c,i)=>i===2?'<b>Swift Swim:</b> +30% <span class="s-as">Attack Speed</span> in rain.':''},
  {d:(c,i)=>staged(B.hit(1.05),B.blast(.9,{what:'a Twister',r:1,fx:{flinch:.3}}),B.beam(1.2,{what:'a Dragon Pulse'})).d(c,i),cast(c,tg,i){staged(B.hit(1.05),B.blast(.9,{what:'a Twister',r:1,fx:{flinch:.3}}),B.beam(1.2,{what:'a Dragon Pulse',col:'#8f7bff'})).cast(c,tg,i);},
   begin(c,i){if(i===2&&battle.weather==='rain')c.as*=1.3;}});
kit({ids:[118,119],role:'Horn Diver',cls:'Bruiser',cat:'phys',range:1,mana:[65,70],pf:[.85,1.1],names:['Horn Attack','Horn Drill'],mvType:'Water'},
  {d:(c,i)=>`Drives its horn into the target for ${DT(c,1.15)}.${i?' If that leaves it below 15% HP, the Horn Drill knocks it out instantly.':''}`,
   cast(c,tg,i){hitAb(c,tg,1.15);if(i&&!tg.dead&&tg.hp<tg.maxHp*.15){hurt(tg,tg.hp+tg.shield+1,c);if(!SIM.on)texts.push({x:tg.x,y:tg.y-36,txt:'Horn Drill!',col:'#ff6b6b',life:1,label:1});}boom(tg,'#ffb0a0');}});
kit({ids:[120,121],role:'Star Core',cls:'Mystic',cat:'spec',range:3,mana:[65,70],pf:[.8,1],names:['Swift','Swift'],mvType:'Normal',tail:()=>'<b>Natural Cure:</b> every cast cures its own burn and poison.'},
  {d:(c,i)=>B.barrage(i?5:3,.4,{what:'stars that never miss'}).d(c,i),cast(c,tg,i){c.burn=c.poison=null;B.barrage(i?5:3,.4,{col:'#ffe27a',size:3}).cast(c,tg,i);}});
kit({ids:[129,130],role:'Rising Serpent',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.5,1.1],names:['Splash','Dragon Dance'],mvType:'Water'},
  staged({d:()=>`Splashes around. Nothing happens... but it dodges the next attack.`,cast(c){c.dodgeN=(c.dodgeN||0)+1;if(!SIM.on)texts.push({x:c.x,y:c.y-34,txt:'Splash!',col:'#bfe4ff',life:.9,label:1});}},
    seq(B.ramp({atk:.15,as:.12}),B.hit(1.2,{dash:1,fx:{flinch:.3}}))));
kit({ids:[131],role:'Ferry',cls:'Medic',type:'heal',cat:'spec',range:3,mana:80,pf:1.1,names:['Ice Beam'],mvType:'Ice'},
  seq(B.beam(.9,{what:'an Ice Beam',fx:{freeze:.7}}),B.heal(.5,{who:'adjacent'})));

// --- Electric ---
kit({ids:[100,101],role:'Living Bomb',cls:'Artillery',cat:'spec',range:1,mana:[80,85],start:20,pf:[1,1.3],names:['Self-Destruct','Explosion'],mvType:'Electric',
  d:(c,i)=>`Rolls into the biggest group of enemies and explodes, dealing ${DT(c,1.6)} to every enemy within ${i?2:1} hex${i?'es':''}. It loses 40% of its current HP but stays in the fight.`,
  cast(c,tg,i){const t=pickT(c,tg,'cluster');if(t&&hdist(c,t)>1)dashTo(c,t,false,.2);schedule(.25,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,c)<=(i?2:1)))hitAb(c,q,1.6);c.hp*=.6;boom(c,'#ffd34d',3);});}});
kit({ids:[239,125,466],role:'Thunder Boxer',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.2],names:['Thunder Punch','Thunder Punch','Wild Charge'],mvType:'Electric',tail:(c,i)=>i===2?'<b>Motor Drive:</b> each cast adds +10% <span class="s-as">Attack Speed</span> for the battle.':''},
  {d:(c,i)=>seq(B.hit(1,{proj:false,fx:{stun:.4}}),B.chain(i?2:1,.5,{col:'#ffe14d'})).d(c,i),cast(c,tg,i){seq(B.hit(1,{proj:false,fx:{stun:.4}}),B.chain(i?2:1,.5,{col:'#ffe14d'})).cast(c,tg,i);if(i===2)c.as*=1.1;}});
kit({ids:[145],role:'Thunderbird',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.3,names:['Thunder'],mvType:'Electric'},
  {d:c=>`Calls down Thunder on the 3 enemies with the most HP, each taking ${DT(c,1.1)} and paralyzed for 0.6s.`,
   cast(c,tg){for(const[k,t]of foesOf(c).sort((a,b)=>b.hp-a.hp).slice(0,3).entries())schedule(k*.1,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.1);stun(t,.6);if(!SIM.on)fx.push({line:1,x1:t.x+rnd(-6,6),y1:0,x2:t.x,y2:t.y-10,life:.3,max:.3,col:'#fff6a0',w:3});});}});

// --- Psychic and Fairy ---
kit({ids:[173,35,36],role:'Moon Fairy',cls:'Medic',type:'heal',cat:'spec',range:2,mana:[75,75,80],pf:[.8,.95,1.1],names:['Moonlight','Moonlight','Metronome'],mvType:'Fairy'},
  {d:(c,i)=>i<2?B.heal(1,{}).d(c,i):`Waggles its finger and uses a random move: a team heal (${HT(c,.6)} each), a Moonblast (${DT(c,1.6)}), a team shield (${HPT(c,.15)}), or a lullaby that puts the 3 nearest enemies to sleep for 1.5s.`,
   cast(c,tg,i){if(i<2)return B.heal(1,{}).cast(c,tg,i);const r=Math.floor(Math.random()*4);const bs=[B.heal(.6,{who:'team'}),B.blast(1.6,{what:'a Moonblast',r:0,col:'#ff9be6'}),B.shield(.15,{who:'team'}),B.control({sleep:1.5},{n:3})];
     if(!SIM.on)texts.push({x:c.x,y:c.y-42,txt:['Heal Pulse!','Moonblast!','Protect!','Sing!'][r],col:'#ffc6e8',life:1.1,label:1});bs[r].cast(c,tg,i,{});}});
kit({ids:[63,64,65],role:'Teleporter',cls:'Mystic',cat:'spec',range:3,mana:[60,65,70],pf:[.8,1,1.25],names:['Confusion','Psybeam','Psyshock'],mvType:'Psychic',
  d:(c,i)=>`Hits the target with a psychic wave for ${DT(c,1.15)}${i===2?', calculated against its <span class="s-def">Defense</span> instead of Sp. Def':''}. <b>Teleport:</b> the first time it drops below half HP, it blinks to a safe spot in your back row and restores 40 PP.`,
  cast(c,tg,i){fire(c,tg,'#ff9be6',()=>{damage(c,tg,V(c,1.15),i===2?{ab:1,cat:'phys',type:'Psychic'}:{ab:1,cat:'spec',type:'Psychic'});boom(tg,'#ff9be6');},{sp:320,size:4});},
  hitBy(c,src,o,d){if(!c.tele&&c.hp-d<c.maxHp*.5&&c.hp-d>0){c.tele=1;const rows=c.team?[0,1]:[7,6];for(const r of rows){const h=shuffle([0,1,2,3,4,5,6]).map(q=>({c:q,r})).find(h=>!occupied(h.c,h.r,c));if(h){const p=hexXY(h.c,h.r);if(!SIM.on)burst(c.x,c.y-10,'#ff9be6',14,1);c.move=null;c.c=h.c;c.r=h.r;c.x=p.x;c.y=p.y;gainMana(c,40);break;}}}}});
kit({ids:[96,97],role:'Dream Eater',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:[75,75],start:20,pf:[.8,1.1],names:['Hypnosis','Dream Eater'],mvType:'Psychic'},
  {d:(c,i)=>`Swings its pendulum at the strongest enemy, putting it to sleep for 1.8s.${i?` Then eats its dream for ${DT(c,1.3)}, healing for 60% of the damage. Sleeping targets take +50%.`:''}`,
   cast(c,tg,i){const t=pickT(c,tg,'strong');applyFx(c,t,{sleep:1.8},i);if(i)schedule(.4,()=>{if(c.dead||t.dead)return;const d=hitAb(c,t,1.3*(t.stun>0?1.5:1));heal(c,d*.6);boom(t,'#c6b3ff');});}});
kit({ids:[102,103],role:'Coconut Battery',cls:'Artillery',cat:'spec',range:3,mana:[70,80],pf:[.8,1],names:['Egg Bomb','Egg Bomb'],mvType:'Grass'},
  {d:(c,i)=>B.barrage(i?6:4,.35,{what:'Egg Bombs',splash:1}).d(c,i),cast(c,tg,i){B.barrage(i?6:4,.35,{splash:1,col:'#fff0c8',size:4}).cast(c,tg,i);}});
kit({ids:[439,122,866],role:'Mime',cls:'Mystic',cat:'spec',range:3,mana:[75,75,80],pf:[.8,1,1.15],names:['Light Screen','Barrier','Reflect'],mvType:'Psychic'},
  staged(B.buff({dr:.15},{who:'adjacent',dur:4}),seq(B.buff({dr:.25},{who:'adjacent',dur:4}),B.hit(.9)),seq(B.buff({dr:.25},{who:'team',dur:4}),B.hit(1))));
kit({ids:[238,124],role:'Diva',cls:'Mystic',cat:'spec',range:3,mana:[70,75],pf:[.8,1.1],names:['Lovely Kiss','Ice Beam'],mvType:'Ice'},
  staged(B.control({sleep:1.6},{to:'strong',say:'Blows a kiss at'}),seq(B.control({sleep:2},{to:'strong',say:'Blows a Lovely Kiss at'}),B.beam(1,{what:'an Ice Beam',fx:{freeze:.5}}))));
kit({ids:[150],role:'Genetic Apex',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.4,names:['Psystrike'],mvType:'Psychic',
  d:c=>`Fires 4 Psystrike bolts that spread across enemies, each dealing ${DT(c,.5)} calculated against <span class="s-def">Defense</span>. <b>Recover:</b> the first time it drops below half HP, it heals ${HPT(c,.35)}.`,
  cast(c,tg){const ts=shuffle(foesOf(c));for(let k=0;k<4;k++)schedule(k*.1,()=>{const a=ts.filter(f=>!f.dead);if(!a.length||c.dead)return;const t=a[k%a.length];fire(c,t,'#c89bff',()=>damage(c,t,V(c,.5),{ab:1,cat:'phys',type:'Psychic'}),{arc:1,dur:.45,lift:60,side:rnd(-50,50),retarget:1});});},
  hitBy(c,src,o,d){if(!c.recov&&c.hp-d<c.maxHp*.5&&c.hp-d>0){c.recov=1;schedule(.1,()=>{if(!c.dead)heal(c,c.maxHp*.35);});}}});
kit({ids:[151],role:'Ancestor',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.3,names:['Ancestral Power'],mvType:'Psychic',
  d:c=>`Reads the battle and picks the best move: if an ally is below 40% HP it heals your whole team for ${HT(c,.5)} each; if 3+ enemies are bunched together it blasts them for ${DT(c,1.2)}; otherwise it fires a Psychic shot at the weakest enemy for ${DT(c,1.6)}.`,
  cast(c,tg){if(alive(c.team).some(a=>a.hp<a.maxHp*.4))return B.heal(.5,{who:'team'}).cast(c,tg,0);const cl=cluster(c);if(cl&&near(cl,1).length>=2)return B.blast(1.2,{at:'cluster',r:1,col:'#ff9be6'}).cast(c,tg,0,{});B.hit(1.6,{to:'weak',col:'#ff9be6'}).cast(c,tg,0,{});}});

// --- Fighting ---
kit({ids:[56,57,979],role:'Rage Fist',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.15],names:['Karate Chop','Cross Chop','Rage Fist'],mvType:'Fighting',
  d:(c,i)=>`Punches the target for ${DT(c,1)}, +3% for every time it has been hit this battle (up to +150%)${c?` (now +${Math.min(150,3*(c.hits||0))}%)`:''}.${i===2?' Heals for 30% of the damage.':''}`,
  cast(c,tg,i){const d=hitAb(c,tg,1*(1+Math.min(1.5,.03*(c.hits||0))));if(i===2)heal(c,d*.3);boom(tg,'#ff8a6b',c.hits>20?2:1);}});
kit({ids:[236,106],role:'Kicker',cls:'Bruiser',cat:'phys',range:1,mana:[65,70],pf:[.9,1.3],names:['Rolling Kick','High Jump Kick'],mvType:'Fighting',tail:(c,i)=>i?'If the target dies before it lands, it crashes and takes 10% of its own max HP.':''},
  staged(B.hit(1.1,{proj:false,fx:{flinch:.3}}),B.hit(1.7,{dash:1,to:'far'})));
kit({ids:[107],role:'Boxer',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.15,names:['Elemental Punches'],mvType:'Fighting',
  d:c=>`Cycles through its punches: Fire Punch (burns), Ice Punch (freezes for 0.8s), Thunder Punch (paralyzes for 0.6s). Each hits for ${DT(c,1.05)}.${c&&c.cyc!=null?` Next: ${['Fire','Ice','Thunder'][(c.cyc||0)%3]} Punch.`:''}`,
  cast(c,tg){const k=(c.cyc=(c.cyc||0))%3;c.cyc++;hitAb(c,tg,1.05);applyFx(c,tg,[{burn:.02},{freeze:.8},{stun:.6}][k],0);boom(tg,['#ff7a2c','#bff0ff','#ffe14d'][k]);}});

// --- Ice and Flying legends ---
kit({ids:[144],role:'Blizzard Bird',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.2,names:['Blizzard'],mvType:'Ice',tail:()=>'<b>Sheer Cold:</b> frozen enemies left below 15% HP shatter instantly.'},
  {d:c=>B.nova(.9,{say:'Whips up a Blizzard',r:3,fx:{freeze:.9,slow:[.2,3]}}).d(c,0),cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.9);applyFx(c,q,{freeze:.9,slow:[.2,3]},0);if(!q.dead&&q.hp<q.maxHp*.15)hurt(q,q.hp+q.shield+1,c);}if(!SIM.on)for(let k=0;k<30;k++)fx.push({x:c.x+rnd(-70,70),y:c.y-rnd(0,60),vx:rnd(-20,20),vy:30,life:.8,max:.8,col:'#eaf8ff',sz:1,g:0});}});
kit({ids:[147,148,149],role:'Guardian Dragon',cls:'Bruiser',cat:'phys',range:1,mana:[65,70,80],pf:[.8,1,1.2],names:['Dragon Tail','Dragon Pulse','Rescue Flight'],mvType:'Dragon'},
  staged(B.hit(1.05,{proj:false,fx:{knock:1}}),B.beam(1,{what:'a Dragon Pulse'}),{d:c=>`Flies to your most injured ally and shields it for ${HPT(c,.25)} (of the ally's max HP), then whips up a Hurricane on the enemies closest to that ally for ${DT(c,1)}, knocking them back.`,
    cast(c,tg){const al=alive(c.team).filter(a=>a!==c).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||c;al.shield+=al.maxHp*.25;if(al!==c){const opts=nbrs(al.c,al.r).filter(h=>!occupied(h.c,h.r,c));if(opts.length){const h=opts[0],p=hexXY(h.c,h.r);c.move={c:h.c,r:h.r,fx:c.x,fy:c.y,tx:p.x,ty:p.y,t:0,dur:.3};}}
      if(!SIM.on)ring(al.x,al.y-8,'#ffd8a0');schedule(.35,()=>{if(c.dead)return;for(const q of foesOf(c).filter(f=>hdist(f,al)<=2).slice(0,3)){hitAb(c,q,1);knock(c,q);}});}}));

kit({ids:[114,465],role:'Vine Net',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[75,80],start:20,pf:[.9,1.1],names:['Bind','Power Whip'],mvType:'Grass'},
  seq(B.control({stun:[.8,1.1]},{say:'Ensnares',n:[2,3]}),B.nova(.6,{say:'Then squeezes, lashing',r:1}),B.heal(.6,{who:'self'})));

/* ---- power tuning from balance sims: multiplies one evolution stage's move power ---- */
function tuneSig(dex,mult){const S=SIGS[dex];if(!S)return;const i=sigStage(S,dex);if(Array.isArray(S.pf)){S.pf=S.pf.slice();S.pf[i]*=mult;}else if(S.ids.length===1)S.pf*=mult;else{S.pf=S.ids.map(()=>S.pf);S.pf[i]*=mult;}}
for(const[d,m]of Object.entries({22:.7,51:.65,124:.7,106:.7,28:.8,101:.45,100:.6,65:.6,99:.65,141:.7,97:.7,139:.75,474:.6,467:.7,462:.65,230:.7,91:.55,121:.55,120:.7,73:.75,117:.75,82:.8,464:.8,466:.8,103:.55,102:.7,130:.7,59:.75,142:.85,146:.7,145:.7,150:.7,144:.8,
  107:1.3,20:1.25,53:1.3,24:1.3,38:.85,57:.85,979:.85,42:.85,169:.85}))tuneSig(+d,m);
for(const[d,m]of Object.entries({91:.7,103:.8,102:.85,22:.75,51:.7,124:.75,106:.8,28:.8,119:.85,107:.8,85:.8,139:.8,110:.85,34:.85,65:.85,97:.85,141:.85,466:.85,212:.8,135:.85,464:.85}))tuneSig(+d,m);
