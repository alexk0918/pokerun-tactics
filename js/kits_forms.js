/* Regional forms: Alolan, Galarian, Hisuian and Paldean lines (and branch evolutions). */

// --- Alola ---
kit({ids:[10091,10092],role:'Night Gang',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Bite','Sucker Punch'],mvType:'Dark',tail:(c,i)=>i?'<b>Hustle:</b> +10% damage.':'',begin(c,i){if(i)c.dmg+=.1;}},
  staged(B.hit(1.1,{proj:false,fx:{flinch:.2}}),B.hit(1.3,{dash:1,to:'weak',cr:.15})));
kit({ids:[10100],role:'Surf Rider',cls:'Mystic',cat:'spec',range:3,mana:70,pf:1.1,names:['Psychic'],mvType:'Electric',tail:()=>'<b>Surge Surfer:</b> +15% Attack Speed.',begin(c){c.as*=1.15;}},
  seq(B.beam(1,{what:'a Psychic wave',col:'#ff9be6',fx:{conf:1}}),B.chain(3,.9,{fx:{para:1},col:'#ffe14d'})));
kit({ids:[10101,10102],role:'Ice Roller',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,70],start:25,pf:[.85,1.1],names:['Powder Snow','Icicle Spear'],mvType:'Ice',tail:(c,i)=>i?'<b>Slush Rush:</b> +30% Attack Speed in snow.':'',begin(c,i){if(i&&battle.weather==='snow')c.as*=1.3;}},
  staged(seq(B.shield(.15),B.hit(1,{proj:false,fx:{chill:1}})),seq(B.shield(.2),B.hit(.45,{n:4,proj:false,fx:{chill:2}}))));
kit({ids:[10103,10104],role:'Snow Fox',cls:'Mystic',cat:'spec',range:3,mana:[60,75],pf:[.8,1.1],names:['Powder Snow','Blizzard'],mvType:'Ice',tail:(c,i)=>i?'<b>Snow Warning:</b> starts snow when the battle begins.':'',begin(c,i){if(i)setWeather(c,'snow');}},
  staged(B.hit(1.1,{fx:{chill:1}}),{d:c=>`In snow it first raises an Aurora Veil: every ally gains a shield of ${HPT(c,.1)}. Then a Blizzard hits the biggest group of enemies for ${DT(c,1.3)} (70% to adjacent enemies), adding 3 Chill.`,
    cast(c,tg){if(battle.weather==='snow')B.shield(.1,{who:'team'}).cast(c,tg,1);B.blast(1.3,{at:'cluster',r:1,col:'#dff6ff',fx:{chill:3}}).cast(c,tg,1,{});}}));
kit({ids:[10105,10106],role:'Steel Mole',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Metal Claw','Iron Head'],mvType:'Steel'},
  staged(B.hit(1.1,{dash:1,fx:{shred:5}}),seq(B.airborne(.5),B.hit(.6,{n:3,dash:1,to:'weak',fx:{flinch:.3}}))));
kit({ids:[10107,10108],role:'Coy Cat',cls:'Trickster',cat:'spec',range:3,mana:[55,65],pf:[.8,1.05],names:['Fake Out','Dark Pulse'],mvType:'Dark',tail:(c,i)=>i?'<b>Fur Coat:</b> takes 20% less physical damage.':'',begin(c,i){if(i)c.fx.physDr=(c.fx.physDr||0)+.2;}},
  staged(B.hit(.9,{fx:{stun:.5}}),seq(B.ramp({spa:.15}),B.hit(1.2,{fx:{flinch:.3}}))));
kit({ids:[10109,10110,10111],role:'Magnet Boulder',cls:'Juggernaut',cat:'phys',range:1,mana:[55,65,75],start:20,pf:[.8,.95,1.1],names:['Thunder Punch','Rollout','Heavy Slam'],mvType:'Rock',tail:(c,i)=>i===2?'<b>Galvanize:</b> its Normal-type attacks are Electric.':''},
  staged(B.hit(1,{proj:false,fx:{para:1}}),seq(B.shield(.15),B.hit(1.1,{proj:false,fx:{stun:.4,para:1}})),seq(B.shield(.2),B.nova(1.1,{say:'Rolls into a magnetized Heavy Slam',r:1,fx:{stun:.5,para:2}}))));
kit({ids:[10112,10113],role:'Toxic Gems',cls:'Juggernaut',cat:'phys',range:1,mana:[60,70],start:20,pf:[.85,1.1],names:['Poison Fang','Knock Off'],mvType:'Dark',tail:(c,i)=>i?'<b>Poison Touch:</b> its basic attacks have a 30% chance to add 1 Poison.':''},
  staged(seq(B.shield(.15),B.hit(1,{proj:false,fx:{psn:.01}})),{d:c=>`${B.shield(.2).d(c,1)} Then it Knocks Off the target's shield and hits it for ${DT(c,1.3)} (+50% if it holds an item), adding 3 Poison.`,
    cast(c,tg){B.shield(.2).cast(c,tg,1);schedule(.25,()=>{if(c.dead||tg.dead)return;tg.shield=0;hitAb(c,tg,1.3*(tg.u&&tg.u.items&&tg.u.items.length?1.5:1));addStatus(tg,'poison',3,c);boom(tg,'#c86bd6',2);});}}));
kit({ids:[10114],role:'Tall Tree',cls:'Artillery',cat:'phys',range:2,mana:70,pf:1.1,names:['Dragon Hammer'],mvType:'Dragon',tail:()=>'<b>Frisk:</b> its long neck reaches 2 hexes.'},
  B.blast(1.4,{what:'its long neck in a Dragon Hammer',col:'#8a6cff',fx:{stun:.4}}));
kit({ids:[10115],role:'Fire Dancer',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.15,names:['Shadow Bone'],mvType:'Ghost',tail:()=>'<b>Cursed Body:</b> attackers have a 30% chance to lose 20 PP.'},
  {d:c=>`Twirls a flaming Shadow Bone into the target twice for ${DT(c,.75)} each plus <b class="s-atk">${((c.u&&c.u.ss)||0)*3}</b> bone damage (+3 for every knockout its line has scored this run), adding 2 Burn.`,
   kill(c){if(c.u)c.u.ss=(c.u.ss||0)+1;},hitBy(c,src,o){if(src&&src.team!==c.team&&src.maxMana&&Math.random()<.3)src.mana=Math.max(0,src.mana-20);},
   cast(c,tg){for(let k=0;k<2;k++)schedule(k*.2,()=>{if(c.dead||tg.dead)return;damage(c,tg,V(c,.75)+((c.u&&c.u.ss)||0)*3,{ab:1,cat:'phys',type:'Ghost'});if(k)addStatus(tg,'burn',2,c);boom(tg,'#8a6cd6');});}});

// --- Galar ---
kit({ids:[10161],role:'Pirate Cat',cls:'Bruiser',cat:'phys',range:1,mana:55,pf:.9,names:['Metal Claw'],mvType:'Steel'},B.hit(1.1,{proj:false,fx:{shred:10}}));
kit({ids:[10162,10163],role:'Unicorn',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Confusion','Psycho Cut'],mvType:'Psychic',tail:(c,i)=>i?'<b>Pastel Veil:</b> its cast cures adjacent allies of Poison.':''},
  staged(B.hit(1.1,{dash:1,fx:{conf:1}}),{d:c=>`Gallops to the weakest enemy and slashes with Psycho Cut for ${DT(c,1.5)} (+15% crit chance), then cures adjacent allies of Poison.`,
    cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5,{cr:.15});for(const a of alive(c.team))if(hdist(a,c)<=1&&a.poison){a.poison=null;}boom(t,'#ff9be6',2);});}}));
kit({ids:[10164,10165,10172],role:'Toxic Sage',cls:'Mystic',cat:'spec',range:3,mana:[60,70,70],pf:[.8,1.1,1.05],names:['Confusion','Shell Side Arm','Eerie Spell'],mvType:'Poison',
  tail:(c,i)=>i===1?'<b>Quick Draw:</b> 30% chance each cast to fire again at half power.':i===2?'<b>Curious Medicine:</b> its cast also cures your team of status conditions.':''},
  staged(B.hit(1.1,{fx:{conf:1}}),{d:c=>`Fires a Shell Side Arm at the biggest group of enemies: ${DT(c,1.3)} to the center and 70% to adjacent enemies (physical or special, whichever hurts more), adding 3 Poison.`,
    cast(c,tg){const go=m=>{const t=pickT(c,tg,'cluster');if(!t)return;fire(c,t,'#c86bd6',()=>{for(const q of[t,...near(t,1)]){const cat=(q.def<q.res)?'phys':'spec';hitAb(c,q,1.3*m*(q===t?1:.7),{cat});addStatus(q,'poison',3,c);}boom(t,'#c86bd6',2);},{size:5});};go(1);if(Math.random()<.3)schedule(.4,()=>{if(!c.dead)go(.5);});}},
   {d:c=>`Casts an Eerie Spell on the target for ${DT(c,1.3)}, draining 20 of its PP, and cures your team of status conditions.`,
    cast(c,tg){fire(c,tg,'#ff9be6',()=>{hitAb(c,tg,1.3);tg.mana=Math.max(0,(tg.mana||0)-20);},{size:5});for(const a of alive(c.team))cureStatus(a);}}));
kit({ids:[10166],role:'Leek Squire',cls:'Striker',cat:'phys',range:1,mana:60,pf:.95,names:['Brutal Swing'],mvType:'Fighting',tail:()=>'<b>Steadfast:</b> +15% critical-hit chance.',begin(c){c.crit+=.15;}},B.hit(1.2,{proj:false,cr:.1}));
kit({ids:[10167],role:'Smog Gentleman',cls:'Juggernaut',cat:'spec',range:1,mana:70,start:20,pf:1.05,names:['Strange Steam'],mvType:'Fairy',tail:()=>'<b>Neutralizing Gas:</b> enemies within 2 hexes gain PP 10% slower.',begin(c){for(const o of foesOf(c).filter(o=>hdist(o,c)<=2))o.ppMul*=.9;}},
  seq(B.shield(.15),B.cone(1.1,{say:'Blows Strange Steam',depth:2,col:'#ffb3e6',fx:{conf:2}})));
kit({ids:[10168],role:'Ice Mime',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:65,start:25,pf:1,names:['Freeze-Dry'],mvType:'Ice'},seq(B.shield(.15,{who:'adjacent'}),B.hit(1,{proj:false,fx:{chill:2}})));
kit({ids:[10169],role:'Cruel Gaze',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.15,names:['Freezing Glare'],mvType:'Psychic',tail:()=>'<b>Competitive:</b> +20% Sp. Atk whenever an enemy lowers its stats.'},
  B.beam(1.5,{what:'a Freezing Glare',col:'#c58cff',fx:{chill:3,conf:1}}));
kit({ids:[10170],role:'Strong Legs',cls:'Striker',cat:'phys',range:1,mana:65,pf:1.15,names:['Thunderous Kick'],mvType:'Fighting',tail:()=>'<b>Defiant:</b> +20% Attack whenever it is hit by a move that lowers its stats.'},
  {d:c=>`Dashes to the weakest enemy and lands a Thunderous Kick for ${DT(c,1.7)}, lowering its <span class="s-def">Defense</span> by 20.`,
   cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.7);t.def=Math.max(0,t.def-20);boom(t,'#ff9a3c',3);});}});
kit({ids:[10171],role:'Malevolent',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.15,names:['Fiery Wrath'],mvType:'Dark',tail:()=>'<b>Berserk:</b> +30% Sp. Atk the first time it drops below half HP.'},
  {...B.nova(1.1,{say:'Erupts in Fiery Wrath',r:3,col:'#8a3060',fx:{flinch:.3}}),
   hitBy(c,src,o,d){if(!c.bsk&&c.hp-d<c.maxHp/2){c.bsk=1;c.spa*=1.3;}}});
kit({ids:[10173],role:'Ghost Coral',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:65,start:25,pf:.95,names:['Night Shade'],mvType:'Ghost',tail:()=>'<b>Cursed Body:</b> attackers have a 30% chance to lose 20 PP.'},
  {...seq(B.shield(.2),B.hit(1,{proj:false})),hitBy(c,src){if(src&&src.team!==c.team&&src.maxMana&&Math.random()<.3)src.mana=Math.max(0,src.mana-20);}});
kit({ids:[10174,10175],role:'Punk Raccoon',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.85,1.1],names:['Snarl','Night Slash'],mvType:'Dark'},
  staged(B.hit(1,{proj:false,fx:{weaken:.1}}),B.hit(1.3,{dash:1,cr:.25})));
kit({ids:[10176,10177],role:'Snow Daruma',cls:'Bruiser',cat:'phys',range:1,mana:[55,70],pf:[.85,1.1],names:['Ice Punch','Icicle Crash'],mvType:'Ice',tail:(c,i)=>i?'<b>Gorilla Tactics:</b> +25% Attack.':'',begin(c,i){if(i)c.atk*=1.25;}},
  staged(B.hit(1.1,{proj:false,fx:{chill:1}}),B.hit(1.5,{proj:false,fx:{chill:3,flinch:.3}})));
kit({ids:[10179],role:'Clay Mask',cls:'Juggernaut',cat:'phys',range:1,mana:65,start:20,pf:.95,names:['Brutal Swing'],mvType:'Ground'},seq(B.shield(.2),B.nova(.8,{say:'Swings its clay tablet',r:1})));
kit({ids:[10180],role:'Snap Trap',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:65,start:25,pf:1,names:['Snap Trap'],mvType:'Steel',tail:()=>'<b>Mimicry:</b> its type shifts with the terrain.'},
  {d:c=>`Sets a Snap Trap with a shield of ${HPT(c,.2)}: for 3s, every melee attacker that hits it is clamped (held for 1s) and takes ${DT(c,.6)}.`,
   cast(c,tg){c.shield+=c.maxHp*.2;c.trapS=combatT+3;if(!SIM.on)ring(c.x,c.y-6,'#a8b8c8');},
   hitBy(c,src,o){if(c.trapS>combatT&&src&&src.team!==c.team&&o.auto&&hdist(src,c)<=1&&!src.dead&&!o.refl)schedule(.05,()=>{if(src.dead||c.dead)return;stun(src,1);damage(c,src,V(c,.6),{ab:1,cat:'phys',refl:1,type:'Steel'});});}});

// --- Hisui ---
kit({ids:[10229,10230],role:'Rock Hound',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[60,75],start:25,pf:[.85,1.1],names:['Rock Throw','Head Smash'],mvType:'Rock',tail:(c,i)=>i?'<b>Intimidate:</b> enemies within 2 hexes start with 15% less Attack for 6s.':'',
  begin(c,i){if(i)for(const o of foesOf(c).filter(o=>hdist(o,c)<=2&&!o.fx.clear))debuff(o,'atk',.15,6);}},
  staged(seq(B.shield(.15),B.hit(1,{fx:{burn:.01}})),seq(B.shield(.25),B.hit(1.4,{dash:1,fx:{stun:.5,burn:.01}}))));
kit({ids:[10231,10232],role:'Bomb Bloom',cls:'Artillery',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Thunder Shock','Chloroblast'],mvType:'Grass'},
  staged(B.hit(1,{fx:{para:1}}),{d:c=>`Fires a Chloroblast through every enemy in a line for ${DT(c,1.8)}, paying 10% of its own <span class="s-hp">max HP</span>.`,
    cast(c,tg){hurt(c,c.maxHp*.1,null);B.beam(1.8,{col:'#a8ff5c'}).cast(c,tg,1);}}));
kit({ids:[10233],role:'Spirit Flame',cls:'Mystic',cat:'spec',range:3,mana:75,pf:1.15,names:['Infernal Parade'],mvType:'Ghost'},
  {d:c=>`Leads an Infernal Parade into the biggest group of enemies: ${DT(c,1.3)} to the center and 70% to adjacent enemies, doubled against enemies with a status condition, adding 3 Burn.`,
   cast(c,tg){const t=pickT(c,tg,'cluster');fire(c,t,'#8a6cd6',()=>{for(const q of[t,...near(t,1)]){const st=q.burn||q.poison||q.para||q.conf||q.chill||q.seed;hitAb(c,q,1.3*(q===t?1:.7)*(st?2:1));addStatus(q,'burn',3,c);}boom(t,'#8a6cd6',3);},{arc:1,dur:.6,lift:80,side:0,size:5});}});
kit({ids:[10234],role:'Barb Ball',cls:'Trickster',cat:'phys',range:1,mana:55,pf:.95,names:['Barb Barrage'],mvType:'Poison'},B.hit(1.1,{proj:false,fx:{psn:.01,flinch:.2}}));
kit({ids:[10235],role:'Venom Claw',cls:'Striker',cat:'phys',range:1,mana:55,pf:.95,names:['Poison Jab'],mvType:'Poison'},B.hit(1.1,{dash:1,to:'weak',fx:{psn:.01}}));
kit({ids:[10236],role:'Ronin Blade',cls:'Striker',cat:'phys',range:1,mana:65,pf:1.15,names:['Ceaseless Edge'],mvType:'Dark',tail:()=>'<b>Sharpness:</b> its slashes deal +10% damage.',begin(c){c.dmg+=.1;}},
  {d:c=>`Slips behind the weakest enemy and cuts it with Ceaseless Edge for ${DT(c,1.5)}, scattering splinters around it: enemies within 1 hex take ${DT(c,.2)} every half second for 3s.`,
   cast(c,tg){const t=pickT(c,tg,'weak');if(hdist(c,t)>1)dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.5);zone(c,t,1,3,'#6b4bb8',z=>{for(const q of inZone(z,1-c.team))hitAb(c,q,.2,{noCrit:1,quiet:1});});});}});
kit({ids:[10237],role:'Blossom Dancer',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.15,names:['Victory Dance'],mvType:'Fighting'},
  seq(B.ramp({atk:.1,as:.1}),B.hit(1.5,{dash:1,proj:false})));
kit({ids:[10238,10239],role:'Phantom Fox',cls:'Trickster',cat:'spec',range:3,mana:[55,70],pf:[.8,1.1],names:['Shadow Sneak','Bitter Malice'],mvType:'Ghost',tail:()=>'<b>Illusion:</b> the first hit it takes deals no damage.',begin(c){c.disguise=Math.max(c.disguise,1);}},
  staged(B.hit(1.1,{fx:{flinch:.3}}),B.hit(1.4,{to:'strong',col:'#8a6cd6',fx:{weaken:.2,chill:2}})));
kit({ids:[10240],role:'Psy Eagle',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Esper Wing'],mvType:'Psychic',tail:()=>'<b>Sheer Force:</b> +15% damage.',begin(c){c.dmg+=.15;}},
  seq(B.blast(1.3,{at:'cluster',r:1,what:'an Esper Wing',col:'#ff9be6'}),B.buff({as:.1})));
kit({ids:[10241,10242],role:'Shell Dragon',cls:'Juggernaut',cat:'spec',range:1,mana:[60,75],start:20,pf:[.85,1.1],names:['Shelter','Dragon Pulse'],mvType:'Steel',tail:(c,i)=>i?'<b>Gooey:</b> melee attackers lose 10% Attack Speed for 3s.':''},
  {...staged(seq(B.shield(.2,{def:15}),B.hit(1,{proj:false})),seq(B.shield(.25,{def:15}),B.cone(1.2,{say:'Breathes a Dragon Pulse',col:'#8a6cff'}))),
   hitBy(c,src,o){if(c.kit.si&&src&&src.team!==c.team&&o.auto&&hdist(src,c)<=1&&!src.dead)applyFx(c,src,{slow:[.1,3]},0);}});
kit({ids:[10243],role:'Glacier Fortress',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:25,pf:1.05,names:['Mountain Gale'],mvType:'Ice',tail:()=>'<b>Strong Jaw:</b> +10% damage.',begin(c){c.dmg+=.1;}},
  seq(B.shield(.2),B.blast(1.3,{r:1,what:'a Mountain Gale of ice boulders',col:'#bff0ff',fx:{stun:.5,chill:2}})));
kit({ids:[10247],role:'Ghost Fish',cls:'Striker',cat:'phys',range:1,mana:55,pf:.95,names:['Aqua Jet'],mvType:'Water'},B.hit(1.1,{dash:1,to:'weak'}));

// --- Paldea ---
const raging=(c,tg,m,fx)=>{if(tg.dead)return;tg.shield=0;dashTo(c,tg,false,.18);schedule(.2,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,m);applyFx(c,tg,fx,0);boom(tg,tcol(c),3);});};
kit({ids:[10250],role:'Combat Bull',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Raging Bull'],mvType:'Fighting',tail:()=>'<b>Intimidate:</b> enemies within 2 hexes start with 15% less Attack for 6s.',begin(c){for(const o of foesOf(c).filter(o=>hdist(o,c)<=2&&!o.fx.clear))debuff(o,'atk',.15,6);}},
  {d:c=>`Charges the target with Raging Bull for ${DT(c,1.6)}, smashing its shield first.`,cast(c,tg){raging(c,tg,1.6,{});}});
kit({ids:[10251],role:'Blaze Bull',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Raging Bull'],mvType:'Fire'},
  {d:c=>`Charges the target with a blazing Raging Bull for ${DT(c,1.5)}, smashing its shield first and adding 3 Burn.`,cast(c,tg){raging(c,tg,1.5,{burn:.015});}});
kit({ids:[10252],role:'Aqua Bull',cls:'Juggernaut',cat:'phys',range:1,mana:65,start:20,pf:1.05,names:['Raging Bull'],mvType:'Water'},
  {d:c=>`${B.shield(.15).d(c,0)} Then it charges the target with a surging Raging Bull for ${DT(c,1.4)}, smashing its shield and slowing it by 25% for 3s.`,cast(c,tg){B.shield(.15).cast(c,tg,0);raging(c,tg,1.4,{slow:[.25,3]});}});
kit({ids:[10253],role:'Poison Mudfish',cls:'Juggernaut',cat:'phys',range:1,mana:60,start:20,pf:.9,names:['Poison Tail'],mvType:'Poison'},seq(B.shield(.15),B.hit(1,{proj:false,fx:{psn:.01}})));

// tuning pass: regional forms against generic units of the same line cost (kitbalF)
for(const[d,m]of Object.entries({10100:.6,10115:1.3,10240:.65,10232:.8,10165:.8,10242:1.2}))tuneSig(+d,m);
