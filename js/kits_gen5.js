/* Generation V signature kits (Unova lines, plus Basculegion and Runerigus). */

kit({ids:[494],role:'Victory Star',cls:'Bruiser',cat:'phys',range:1,mana:75,pf:1.15,names:['V-create'],mvType:'Fire',tail:()=>'<b>Victory Star:</b> adjacent allies gain +10% crit chance.'},
  {d:c=>`Blazes into the target with V-create for ${DT(c,1.9)}, adding 4 Burn, then loses 6 <span class="s-def">Defense</span> and <span class="s-def">Sp. Def</span> for the battle.`,
   begin(c){schedule(.1,()=>{for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)a.crit+=.1;});},
   cast(c,tg){if(hdist(c,tg)>1)dashTo(c,tg,false,.2);schedule(.22,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.9);addStatus(tg,'burn',4,c);c.def=Math.max(0,c.def-6);c.res=Math.max(0,c.res-6);boom(tg,'#ff7a2c',2);});}});

// --- Unova starters ---
kit({ids:[495,496,497],role:'Regal Coil',cls:'Trickster',cat:'spec',range:[2,2,3],mana:[60,65,70],pf:[.8,1,1.15],names:['Vine Whip','Leech Seed','Leaf Storm'],mvType:'Grass',tail:(c,i)=>i===2?'<b>Contrary:</b> each Leaf Storm raises its <span class="s-spa">Sp. Atk</span> by 10% for the battle instead of lowering it.':''},
  staged(B.hit(1,{fx:{seed:1}}),seq(B.control({seed:3},{n:2,say:'Plants Leech Seed in'}),B.hit(.9)),
    seq(B.blast(1.3,{what:'a Leaf Storm',at:'cluster',r:1,fx:{seed:2},col:'#7fc04f'}),B.ramp({spa:.1}))));
kit({ids:[498,499,500],role:'Fire Pig',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,75],pf:[.8,1,1.15],names:['Ember','Arm Thrust','Heat Crash'],mvType:'Fire',tail:(c,i)=>i===2?'<b>Reckless:</b> its Heat Crash deals +20% damage.':''},
  staged(B.hit(1,{fx:{burn:.01}}),B.hit(.32,{n:3,proj:false,fx:{burn:.01}}),
    {d:c=>`Body-slams the target with Heat Crash for ${DT(c,1.4)} (+20%) plus 3% of its own <span class="s-hp">max HP</span>, burning it and every adjacent enemy for 3 Burn.`,
     cast(c,tg){hitAb(c,tg,1.4*1.2,{flat:c.maxHp*.03});for(const q of[tg,...near(tg,1)])addStatus(q,'burn',3,c);boom(tg,'#ff7a2c',2);}}));
kit({ids:[501,502,503],role:'Shell Samurai',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Razor Shell','Aqua Cutter','Ceaseless Edge'],mvType:'Water'},
  staged(B.hit(1,{proj:false,fx:{shred:5}}),B.hit(.6,{n:2,dash:1,to:'weak',cr:.2}),
    {d:c=>`Draws its seamitars: dashes to the weakest enemy and slashes it for ${DT(c,1.4)} with +30% crit chance, leaving splinters (a zone that deals ${DT(c,.1)} every half second for 4s) around it.`,
     cast(c,tg){const t=pickT(c,tg,'weak');dashTo(c,t,true,.18);schedule(.2,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.4,{cr:.3});zone(c,t,1,4,'#a8d0ff',z=>{for(const q of inZone(z,1-c.team))hitAb(c,q,.1,{noCrit:1,quiet:1});});});}}));

// --- Common Unova Pokémon ---
kit({ids:[504,505],role:'Lookout',cls:'Trickster',cat:'phys',range:[1,2],mana:[55,60],pf:[.85,1.05],names:['Detect','Hypnosis'],mvType:'Normal'},
  staged(seq(B.shield(.15),B.hit(.9,{proj:false})),seq(B.control({sleep:1.2},{to:'strong',say:'Stares down'}),B.hit(1,{to:'weak'}))));
kit({ids:[506,507,508],role:'Loyal Hound',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[65,70,75],start:20,pf:[.8,1,1.1],names:['Tackle','Work Up','Retaliate'],mvType:'Normal',tail:(c,i)=>i===2?'<b>Retaliate:</b> deals +50% damage for each ally that has fainted this battle (up to +100%).':''},
  {d:(c,i)=>i<2?seq(B.shield(.15),B.hit(1,{proj:false})).d(c,i):`${B.shield(.2).d(c,i)} Then it retaliates against the target for ${DT(c,1.2)}.`,
   cast(c,tg,i){if(i<2)return seq(B.shield(.15),B.hit(1,{proj:false})).cast(c,tg,i,{});c.shield+=c.maxHp*.2;const lost=units.filter(u=>u.team===c.team&&u.dead).length;schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.2*(1+Math.min(1,.5*lost)));});}});
kit({ids:[509,510],role:'Cat Thief',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.1],names:['Fake Out','Night Slash'],mvType:'Dark'},
  staged(B.hit(1,{dash:1,to:'weak',fx:{flinch:.5}}),B.hit(1.3,{dash:1,to:'weak',cr:.4})));
kit({ids:[511,512],role:'Leaf Monkey',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Vine Whip','Seed Bomb'],mvType:'Grass'},
  staged(B.hit(1,{proj:false,fx:{seed:1}}),seq(B.hit(.45,{n:3,proj:false,fx:{seed:1}}),B.heal(.3,{who:'self'}))));
kit({ids:[513,514],role:'Fire Monkey',cls:'Combo',cat:'spec',range:2,mana:[55,60],pf:[.8,1.05],names:['Flame Burst','Fire Pledge'],mvType:'Fire'},
  staged(B.blast(.9,{r:1,fx:{burn:.01}}),B.blast(1.1,{what:'a Fire Pledge',r:1,fx:{burn:.015}})));
kit({ids:[515,516],role:'Water Monkey',cls:'Combo',cat:'spec',range:2,mana:[55,60],pf:[.8,1.05],names:['Water Gun','Scald'],mvType:'Water'},
  staged(B.hit(1),B.cone(1,{say:'Sprays Scald',fx:{burn:.015}})));
kit({ids:[517,518],role:'Dream Eater',cls:'Mystic',cat:'spec',range:3,mana:[65,70],pf:[.8,1.1],names:['Yawn','Dream Eater'],mvType:'Psychic'},
  {d:(c,i)=>i?`Puts the strongest enemy to sleep for 1.4s, then eats its dreams: ${DT(c,1.3)} (+50% to a sleeping or stunned target), healing for half the damage dealt.`:B.control({sleep:1.2},{to:'strong',say:'Lulls to sleep'}).d(c,i),
   cast(c,tg,i){const t=pickT(c,tg,'strong');stun(t,i?1.4:1.2);if(!i)return;schedule(.3,()=>{if(c.dead||t.dead)return;const d=hitAb(c,t,1.3*(t.stun>0?1.5:1));heal(c,d*.5);});}});
kit({ids:[519,520,521],role:'Wing Duelist',cls:'Striker',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Aerial Ace','Dual Wingbeat','Brave Bird'],mvType:'Flying'},
  staged(B.hit(1,{dash:1,cr:.2}),B.hit(.55,{n:2,dash:1,to:'weak'}),B.hit(1.6,{dash:1,to:'far'})));
kit({ids:[522,523],role:'Thunder Zebra',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Shock Wave','Volt Switch'],mvType:'Electric'},
  {d:(c,i)=>i?`Volt Switches: zaps the target for ${DT(c,1.1)} (3 Paralysis), then bolts to the farthest enemy and zaps it too for ${DT(c,.8)} (3 Paralysis).`:`Shocks the target for ${DT(c,1)}, adding 2 Paralysis.`,
   cast(c,tg,i){hitAb(c,tg,i?1.1:1);addStatus(tg,'para',i?3:2,c);if(!i)return;const t=pickT(c,tg,'far');schedule(.25,()=>{if(c.dead||!t||t.dead)return;dashTo(c,t,true,.15);schedule(.17,()=>{if(!c.dead&&!t.dead){hitAb(c,t,.8);addStatus(t,'para',3,c);}});});}});
kit({ids:[524,525,526],role:'Crystal Core',cls:'Juggernaut',type:'guard',cat:'phys',range:[2,2,2],mana:[70,75,85],start:20,pf:[.8,1,1.15],names:['Smack Down','Rock Blast','Stone Edge'],mvType:'Rock',tail:(c,i)=>i===2?'<b>Sand Stream:</b> starts the battle with a sandstorm if no weather is active.':''},
  {d:(c,i)=>`${B.shield(.2).d(c,i)} Then it ${i===0?`smacks the target down for ${DT(c,1)}.`:i===1?`fires 4 Rock Blasts at nearby enemies for ${DT(c,.35)} each.`:`thrusts Stone Edges up under the biggest group: ${DT(c,1.2)} to the center and 70% around it, with +30% crit chance.`}`,
   begin(c,i){if(i===2)schedule(.1,()=>setWeather(c,'sand'));},
   cast(c,tg,i){c.shield+=c.maxHp*.2;schedule(.3,()=>{if(c.dead)return;if(i===0)hitAb(c,tg,1);else if(i===1)B.barrage(4,.35,{what:'rocks',col:'#c8a070'}).cast(c,tg,i);else{const t=pickT(c,tg,'cluster');for(const q of[t,...near(t,1)])hitAb(c,q,q===t?1.2:.84,{cr:.3});boom(t,'#c8a070',2);}});}});
kit({ids:[527,528],role:'Heart Bat',cls:'Mystic',cat:'spec',range:3,mana:[55,60],pf:[.8,1.1],names:['Confusion','Stored Power'],mvType:'Psychic'},
  staged(B.hit(1,{fx:{conf:1}}),seq(B.ramp({spa:.1,as:.05}),B.hit(1.1,{fx:{conf:1}}))));
kit({ids:[529,530],role:'Drill Driver',cls:'Striker',cat:'phys',range:1,mana:[60,65],pf:[.8,1.1],names:['Dig','Drill Run'],mvType:'Ground',tail:(c,i)=>i?'<b>Sand Rush:</b> +40% <span class="s-as">Attack Speed</span> in a sandstorm, and it ignores sandstorm damage.':''},
  {d:(c,i)=>`Burrows underground for 0.6s, then drills up under the ${i?'weakest':'nearest'} enemy for ${DT(c,i?1.5:1.1)}${i?', ignoring 30% of its defenses':''}.`,
   begin(c,i){if(i){c.fx.noWeatherChip=1;if(battle.weather==='sand')c.as*=1.4;}},
   cast(c,tg,i){B.airborne(.6).cast(c);schedule(.65,()=>{if(c.dead)return;const t=i?pickT(c,tg,'weak'):tg;if(!t||t.dead)return;dashTo(c,t,false,.12);schedule(.14,()=>{if(!c.dead&&!t.dead)hitAb(c,t,i?1.5:1.1,{pen:i?.3:0});});});}});
kit({ids:[531],role:'Hearing Nurse',cls:'Medic',type:'heal',cat:'spec',range:3,mana:65,pf:1.05,names:['Heal Pulse'],mvType:'Normal',tail:()=>'<b>Healer:</b> adjacent allies shed their status conditions every 4s.'},
  {d:c=>`Heals the most injured ally for ${HT(c,1)}, then the next one for ${HT(c,.5)}.`,
   begin(c){every(c,4,()=>{for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=1)cureStatus(a);});},
   cast(c,tg){const al=alive(c.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);if(al[0])heal(al[0],HEALV(c,1));if(al[1])heal(al[1],HEALV(c,.5));}});
kit({ids:[532,533,534],role:'Pillar Brawler',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.15],names:['Wake-Up Slap','Brick Break','Hammer Arm'],mvType:'Fighting',tail:(c,i)=>i===2?'<b>Guts:</b> +40% <span class="s-atk">Attack</span> while it has a status condition.':''},
  {d:(c,i)=>i===2?`Slams its concrete pillars down: ${DT(c,1.6)} to the target and 60% to adjacent enemies, stunning the target for 0.5s.`:B.hit(i?1.2:1,{proj:false,fx:i?{shred:8}:{flinch:.3}}).d(c,i),
   cast(c,tg,i){if(i<2)return B.hit(i?1.2:1,{proj:false,fx:i?{shred:8}:{flinch:.3}}).cast(c,tg,i,{});const g=stCount(c)?1.4:1;hitAb(c,tg,1.6*g);stun(tg,.5);for(const q of near(tg,1))hitAb(c,q,.96*g);boom(tg,'#c8a070',2);}});
kit({ids:[535,536,537],role:'Vibration Toad',cls:'Vanguard',type:'guard',cat:'spec',range:[2,2,1],mana:[65,70,80],start:20,pf:[.8,1,1.15],names:['Bubble Beam','Scald','Earth Power'],mvType:'Water'},
  staged(seq(B.shield(.15),B.hit(.9,{fx:{slow:[.2,2]}})),seq(B.shield(.2),B.hit(1,{fx:{burn:.015}})),seq(B.shield(.2),B.nova(.95,{say:'Then sends vibrations through the ground',r:2,fx:{para:2}}))));
kit({ids:[538],role:'Judo Master',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Storm Throw'],mvType:'Fighting'},
  seq(B.shield(.2),B.hit(1.2,{proj:false,cr:1,fx:{knock:1}})));
kit({ids:[539],role:'Karate Master',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Close Combat'],mvType:'Fighting'},
  B.hit(.45,{n:4,proj:false,fx:{shred:4}}));
kit({ids:[540,541,542],role:'Leaf Tailor',cls:'Striker',cat:'phys',range:1,mana:[55,65,60],pf:[.8,.9,1.15],names:['Bug Bite','Protect','Leaf Blade'],mvType:'Bug'},
  staged(B.hit(1,{proj:false}),seq(B.shield(.2),B.hit(.7,{proj:false})),{d:c=>`Stitches between the 2 weakest enemies, slashing each with a leaf blade for ${DT(c,1)} (+40% crit chance) and planting 2 Leech Seed.`,
    cast(c,tg){foesOf(c).sort((a,b)=>a.hp-b.hp).slice(0,2).forEach((t,k)=>schedule(k*.22,()=>{if(c.dead||t.dead)return;dashTo(c,t,true,.14);schedule(.16,()=>{if(!c.dead&&!t.dead){hitAb(c,t,1,{cr:.4});addStatus(t,'seed',2,c);}});}));}}));
kit({ids:[543,544,545],role:'Megapede',cls:'Bruiser',cat:'phys',range:1,mana:[55,60,65],pf:[.8,1,1.15],names:['Poison Tail','Steamroller','Megahorn'],mvType:'Poison'},
  staged(B.hit(1,{proj:false,fx:{psn:.015}}),seq(B.ramp({as:.08}),B.hit(1,{proj:false,fx:{psn:.015}})),
    {d:c=>`Speeds up (+10% <span class="s-as">Attack Speed</span> for the battle), then rams the target with Megahorn for ${DT(c,1.4)} and stings it for 5 Poison.`,cast(c,tg){c.as*=1.1;hitAb(c,tg,1.4);addStatus(tg,'poison',5,c);}}));
kit({ids:[546,547],role:'Cotton Prankster',cls:'Trickster',cat:'spec',range:3,mana:[55,60],start:30,pf:[.8,1.05],names:['Cotton Spore','Moonblast'],mvType:'Fairy',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  staged(B.control({slow:[.35,3]},{say:'Puffs cotton spores over',r:1,at:'cluster',col:'#fff6e0'}),seq(B.control({slow:[.3,3],seed:2},{say:'Blows cotton and seeds over',r:1,at:'cluster',col:'#fff6e0'}),B.hit(1.1,{to:'weak',fx:{weaken:.15}}))));
kit({ids:[548,549],role:'Flower Dancer',cls:'Mystic',cat:'spec',range:3,mana:[60,65],pf:[.8,1.1],names:['Sleep Powder','Quiver Dance'],mvType:'Grass'},
  staged(seq(B.control({sleep:1.2},{to:'strong',say:'Scatters Sleep Powder on'}),B.hit(.8,{heal:.5})),seq(B.ramp({spa:.08,as:.08}),B.blast(1,{what:'a Petal Blizzard',r:1,at:'cluster',col:'#ffc0e0'}))));
kit({ids:[550],role:'Wild Fish',cls:'Striker',cat:'phys',range:1,mana:55,pf:.95,names:['Aqua Tail'],mvType:'Water'},
  B.hit(1.2,{dash:1,to:'weak'}));
kit({ids:[902],role:'Spirit Pack',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.15,names:['Wave Crash'],mvType:'Ghost',tail:()=>'<b>Last Respects:</b> deals +15% damage for each ally that has fainted this battle.'},
  {d:c=>`Crashes into the target on a ghostly wave for ${DT(c,1.6)} and 60% to enemies behind it, taking 5% of its own <span class="s-hp">max HP</span> in recoil.`,
   cast(c,tg){const k=1+.15*units.filter(u=>u.team===c.team&&u.dead).length;hitAb(c,tg,1.6*k,{type:'Water'});for(const q of alive(tg.team).filter(q=>q!==tg&&hdist(q,tg)<=1&&hdist(q,c)>hdist(tg,c)))hitAb(c,q,.96*k);hurt(c,c.maxHp*.06,null);boom(tg,'#5aa8ff',2);}});
kit({ids:[551,552,553],role:'Desert Croc',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.15],names:['Sand Tomb','Crunch','High Horsepower'],mvType:'Ground',tail:(c,i)=>i===2?'<b>Moxie:</b> each knockout gives +10% <span class="s-atk">Attack</span>.':''},
  staged(B.zone(.08,{r:1,dur:4,say:'Traps the target in a Sand Tomb',fx:{slow:[.3,1]},col:'#d8b070'}),B.hit(1.1,{proj:false,fx:{shred:8}}),
    {d:c=>`Stampedes into the target for ${DT(c,1.5)}, lowering its <span class="s-def">Defense</span> by 10. A knockout gives it +10% <span class="s-atk">Attack</span>.`,
     cast(c,tg){hitAb(c,tg,1.5);tg.def=Math.max(0,tg.def-10);if(tg.dead)c.atk*=1.1;}}));
kit({ids:[554,555],role:'Zen Ape',cls:'Bruiser',cat:'phys',range:1,mana:[60,65],pf:[.8,1.15],names:['Fire Fang','Flare Blitz'],mvType:'Fire'},
  staged(B.hit(1,{proj:false,fx:{burn:.015,flinch:.2}}),{d:c=>`Flare Blitzes the target for ${DT(c,1.7)}, adding 5 Burn and taking 10% of its own <span class="s-hp">max HP</span> in recoil.`,
    cast(c,tg){hitAb(c,tg,1.7);addStatus(tg,'burn',5,c);hurt(c,c.maxHp*.08,null);boom(tg,'#ff7a2c',2);}}));
kit({ids:[556],role:'Cactus Dancer',cls:'Trickster',cat:'spec',range:2,mana:60,pf:1.05,names:['Spiky Shield'],mvType:'Grass'},
  {d:c=>`Raises a Spiky Shield (${HPT(c,.15)}): for 3s melee attackers take 5% of their <span class="s-hp">max HP</span> per hit. Then it sprays needles at the 3 nearest enemies for ${DT(c,.6)} each.`,
   cast(c,tg){c.shield+=c.maxHp*.15;c.spikyT=combatT+3;for(const q of foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,3))hitAb(c,q,.6);},
   hitBy(c,src,o){if(c.spikyT>combatT&&!o.ab&&src.range===1&&!src.dead)hurt(src,src.maxHp*.06,c);}});
kit({ids:[557,558],role:'Rock Hermit',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[65,70],start:20,pf:[.8,1.1],names:['Fury Cutter','Shell Smash'],mvType:'Bug'},
  staged(seq(B.shield(.2),B.hit(.9,{proj:false})),{d:c=>`Smashes its shell: +15% <span class="s-atk">Attack</span> and <span class="s-as">Attack Speed</span> for the battle (it loses 5 <span class="s-def">Defense</span>), then X-Scissors the target for ${DT(c,1.2)}.`,
    cast(c,tg){c.atk*=1.15;c.as*=1.15;c.def=Math.max(0,c.def-5);hitAb(c,tg,1.2);}}));
kit({ids:[559,560],role:'Hoodlum',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Brick Break','High Jump Kick'],mvType:'Fighting',tail:(c,i)=>i?'<b>Intimidate:</b> enemies within 2 hexes lose 10% Attack at the start of battle.':''},
  staged(B.hit(1.1,{proj:false,fx:{shred:6}}),seq(B.shield(.1),B.hit(1.5,{dash:1,to:'far'}))));
kit({ids:[561],role:'Ancient Guardian',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.1,names:['Psychic'],mvType:'Psychic'},
  seq(B.shield(.1,{who:'adjacent'}),B.hit(1.3,{fx:{conf:2}})));
kit({ids:[562,563],role:'Coffin Curse',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[65,75],start:20,pf:[.8,1.05],names:['Hex','Mummy'],mvType:'Ghost',tail:(c,i)=>i?'<b>Mummy:</b> melee attackers that hit it are cursed: they deal 10% less damage for 3s.':''},
  {d:(c,i)=>`${B.shield(i?.2:.15).d(c,i)} Then it Hexes the target for ${DT(c,1)}, +20% for each different status condition on it.`,
   cast(c,tg,i){c.shield+=c.maxHp*(i?.2:.15);schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1*(1+.2*stCount(tg)));});},
   hitBy(c,src,o){if(c.kit.si===1&&!o.ab&&src.range===1&&!src.dead&&!(src.mumT>combatT)){src.mumT=combatT+3;debuff(src,'atk',.1,3);debuff(src,'spa',.1,3);}}});
kit({ids:[867],role:'Tablet Ward',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:75,start:20,pf:1.1,names:['Shadow Claw'],mvType:'Ground',tail:()=>'<b>Wandering Spirit:</b> melee attackers that hit it lose 8 <span class="s-def">Defense</span> (once each).'},
  {d:c=>`${B.shield(.2).d(c,0)} Then it slashes the target for ${DT(c,1)} and every adjacent enemy for 60%.`,
   cast(c,tg){c.shield+=c.maxHp*.2;schedule(.3,()=>{if(c.dead)return;if(!tg.dead)hitAb(c,tg,1);for(const q of foesOf(c).filter(f=>f!==tg&&hdist(f,c)<=1))hitAb(c,q,.6);});},
   hitBy(c,src,o){if(!o.ab&&src.range===1&&!src.dead&&!src.wsHit){src.wsHit=1;src.def=Math.max(0,src.def-8);}}});
kit({ids:[564,565],role:'Prototurtle',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[65,75],start:20,pf:[.8,1.1],names:['Aqua Jet','Shell Smash'],mvType:'Water'},
  staged(seq(B.shield(.2),B.hit(1,{dash:1})),seq(B.shield(.2),B.ramp({atk:.1}),B.hit(1.3,{proj:false}))));
kit({ids:[566,567],role:'First Bird',cls:'Striker',cat:'phys',range:1,mana:[55,60],pf:[.85,1.15],names:['Rock Throw','Acrobatics'],mvType:'Flying',tail:(c,i)=>i?'<b>Defeatist:</b> below half HP it deals 25% less damage.':''},
  {d:(c,i)=>`${i?'Flits':'Throws rocks'} at the ${i?'weakest':'nearest'} enemy for ${DT(c,i?1.6:1.1)}.`,
   cast(c,tg,i){const k=i&&c.hp<c.maxHp/2?.75:1;if(!i)return B.hit(1.1,{}).cast(c,tg,i,{});const t=pickT(c,tg,'weak');dashTo(c,t,true,.15);schedule(.17,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1.6*k);});}});
kit({ids:[568,569],role:'Trash Heap',cls:'Vanguard',type:'guard',cat:'phys',range:[1,2],mana:[65,75],start:20,pf:[.8,1.05],names:['Toxic Spikes','Gunk Shot'],mvType:'Poison'},
  staged(seq(B.shield(.15),B.zone(.06,{at:'self',r:1,dur:4,say:'Scatters Toxic Spikes',fx:{psn:.01},col:'#a35bd6'})),seq(B.shield(.2),B.blast(1.1,{what:'a Gunk Shot',r:1,fx:{psn:.02},col:'#a35bd6'}))));
kit({ids:[570,571],role:'Illusionist',cls:'Trickster',cat:'spec',range:[1,3],mana:[55,60],pf:[.8,1.15],names:['Fake Tears','Night Daze'],mvType:'Dark',tail:(c,i)=>i?'<b>Illusion:</b> the first enemy move that targets it hits nothing.':''},
  {d:(c,i)=>i?`Lets off a Night Daze through the target and enemies behind it for ${DT(c,1.2)}, adding 2 Confusion to each.`:`Fakes tears at the target: it loses 10 <span class="s-def">Sp. Def</span>, then takes ${DT(c,1)}.`,
   begin(c,i){if(i)c.illusion=1;},
   cast(c,tg,i){if(!i){tg.res=Math.max(0,tg.res-10);return hitAb(c,tg,1);}B.cone(1.2,{depth:2,fx:{conf:2},col:'#b04050'}).cast(c,tg,1);},
   hitBy(c,src,o){if(c.illusion&&o.ab){c.illusion=0;c.shield+=c.maxHp;schedule(.01,()=>{c.shield=Math.max(0,c.shield-c.maxHp);});if(!SIM.on)texts.push({x:c.x,y:c.y-30,txt:'Illusion!',col:'#ff9be6',life:1,label:1});}}});
kit({ids:[572,573],role:'Tidy Tail',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1.05],names:['Tail Slap','Tail Slap'],mvType:'Normal',tail:(c,i)=>i?'<b>Skill Link:</b> always hits 5 times.':''},
  {d:(c,i)=>`Slaps the target with its tail ${i?5:3} times for ${DT(c,.28)} each.`,cast(c,tg,i){B.hit(.28,{n:i?5:3,proj:false}).cast(c,tg,i,{});}});
kit({ids:[574,575,576],role:'Astral Witch',cls:'Trickster',cat:'spec',range:3,mana:[60,65,70],pf:[.8,1,1.15],names:['Confusion','Psyshock','Psychic'],mvType:'Psychic',tail:(c,i)=>i===2?'<b>Shadow Tag:</b> enemies it hits can\'t move away (rooted) for 1.5s.':''},
  staged(B.hit(1,{fx:{conf:1}}),B.hit(1.1,{fx:{conf:2}}),{d:c=>`Pins the farthest enemy with psychic power: ${DT(c,1.3)}, 2 Confusion, and it can't move for 1.5s.`,
    cast(c,tg){const t=pickT(c,tg,'far');fire(c,t,'#ff9be6',()=>{hitAb(c,t,1.3);addStatus(t,'conf',2,c);t.rootT=combatT+1.5;stun(t,.3);},{size:4});}}));
kit({ids:[577,578,579],role:'Cell Shield',cls:'Medic',type:'heal',cat:'spec',range:3,mana:[60,65,70],pf:[.8,1,1.15],names:['Recover','Psyshock','Future Sight'],mvType:'Psychic'},
  staged(B.heal(.8,{}),seq(B.heal(.6,{}),B.hit(.9)),{d:c=>`Heals the most injured ally for ${HT(c,.7)} and wraps it in gel (a shield of ${HPT(c,.1)}), then foresees an attack that lands on the target 2s later for ${DT(c,1.4)}.`,
    cast(c,tg){const a=alive(c.team).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a){heal(a,HEALV(c,.7));a.shield+=a.maxHp*.1;}schedule(2,()=>{if(!c.dead&&!tg.dead){hitAb(c,tg,1.4);boom(tg,'#ff9be6',2);}});}}));
kit({ids:[580,581],role:'Swan Dancer',cls:'Mystic',cat:'spec',range:3,mana:[60,65],pf:[.8,1.1],names:['Air Slash','Hurricane'],mvType:'Flying'},
  staged(B.hit(1,{fx:{flinch:.3}}),B.blast(1.2,{what:'a Hurricane',r:1,fx:{conf:2,knock:1},col:'#cfe8ff'})));
kit({ids:[582,583,584],role:'Twin Cone',cls:'Mystic',cat:'spec',range:3,mana:[60,65,75],pf:[.8,1,1.15],names:['Icy Wind','Ice Beam','Blizzard'],mvType:'Ice',tail:(c,i)=>i===2?'<b>Snow Warning:</b> starts the battle with snow if no weather is active.':''},
  {d:(c,i)=>i===0?B.cone(.9,{say:'Blows an Icy Wind',fx:{chill:2}}).d(c,i):i===1?B.beam(1.1,{what:'an Ice Beam',fx:{chill:3}}).d(c,i):`Both cones whip up a Blizzard: every enemy within 3 hexes takes ${DT(c,.85)} and gains 3 Chill.`,
   begin(c,i){if(i===2)schedule(.1,()=>setWeather(c,'snow'));},
   cast(c,tg,i){if(i<2)return(i?B.beam(1.1,{fx:{chill:3},col:'#bff0ff'}):B.cone(.9,{fx:{chill:2},col:'#bff0ff'})).cast(c,tg,i,{});for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.85);addStatus(q,'chill',3,c);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:2,force:1});}});
kit({ids:[585,586],role:'Season Stag',cls:'Bruiser',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Take Down','Horn Leech'],mvType:'Grass'},
  staged(B.hit(1.1,{proj:false}),B.hit(1.4,{dash:1,heal:.5})));
kit({ids:[587],role:'Sky Squirrel',cls:'Trickster',cat:'spec',range:3,mana:55,pf:1.05,names:['Nuzzle'],mvType:'Electric'},
  {d:c=>`Glides to the farthest enemy and nuzzles it for ${DT(c,1)}, adding 5 Paralysis, then glides back out of reach for 0.5s.`,
   cast(c,tg){const t=pickT(c,tg,'far');fire(c,t,'#ffe14d',()=>{hitAb(c,t,1);addStatus(t,'para',5,c);},{arc:1,dur:.4});B.airborne(.5).cast(c);}});
kit({ids:[588],role:'Shell Thief',cls:'Bruiser',cat:'phys',range:1,mana:55,pf:.9,names:['Fury Cutter'],mvType:'Bug'},
  B.hit(.4,{n:3,proj:false}));
kit({ids:[589],role:'Lance Knight',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.15,names:['Megahorn'],mvType:'Steel'},
  {d:c=>`Lowers its lances and charges through the target and every enemy in a line behind it for ${DT(c,1.4)}, gaining a shield of ${HPT(c,.15)}.`,
   cast(c,tg){c.shield+=c.maxHp*.15;const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts)hitAb(c,q,1.4);lineFx(c,tg,'#c0c8d8',3,.3);}});
kit({ids:[590,591],role:'Spore Trap',cls:'Trickster',cat:'spec',range:2,mana:[60,70],pf:[.8,1.05],names:['Absorb','Spore'],mvType:'Grass'},
  staged(B.hit(1,{heal:.5,fx:{psn:.01}}),seq(B.control({sleep:1.5},{to:'strong',say:'Puts to sleep with Spore'}),B.zone(.06,{at:'self',r:1,dur:4,say:'Releases toxic spores',fx:{psn:.01},col:'#c080d0'}))));
kit({ids:[592,593],role:'Drowning Veil',cls:'Juggernaut',type:'guard',cat:'spec',range:2,mana:[65,75],start:20,pf:[.8,1.1],names:['Hex','Water Spout'],mvType:'Ghost'},
  {d:(c,i)=>i?`Gains a shield of ${HPT(c,.2)}, then erupts a Water Spout over every enemy within 2 hexes for ${DT(c,1.1)}, scaled by its current HP (40% when nearly fainted), adding 1 Confusion.`:`${B.shield(.15).d(c,i)} Then it Hexes the target for ${DT(c,1)} (+20% per status on it).`,
   cast(c,tg,i){c.shield+=c.maxHp*(i?.2:.15);if(!i){schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1*(1+.2*stCount(tg)));});return;}
     const k=.4+.6*c.hp/c.maxHp;for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,1.1*k,{type:'Water'});addStatus(q,'conf',1,c);}if(!SIM.on)pfx('Water_Spout_Up',c.x,c.y-50,{sc:.45,force:1});}});
kit({ids:[594],role:'Lifeguard',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.05,names:['Wish'],mvType:'Water'},
  seq(B.heal(.6,{who:'adjacent'}),B.shield(.2,{who:'lowest'})));
kit({ids:[595,596],role:'Electro Weaver',cls:'Striker',cat:'spec',range:[2,3],mana:[55,60],pf:[.8,1.1],names:['Electroweb','Thunder'],mvType:'Electric',tail:(c,i)=>i?'<b>Compound Eyes:</b> its strikes never miss and have +20% crit chance.':''},
  staged(B.control({para:3,slow:[.2,2]},{say:'Casts an Electroweb over',r:1,at:'cluster',col:'#ffe14d'}),seq(B.control({para:3},{say:'Casts an Electroweb over',r:1,at:'cluster',col:'#ffe14d'}),B.chain(3,1,{col:'#ffe14d'}))));
kit({ids:[597,598],role:'Iron Thorn',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[70,80],start:20,pf:[.8,1.1],names:['Spikes','Power Whip'],mvType:'Steel',tail:()=>'<b>Iron Barbs:</b> melee attackers take 5% of their max HP each time they hit it.'},
  {d:(c,i)=>`${B.shield(i?.22:.16).d(c,i)} Then it ${i?`whips the target for ${DT(c,1.2)} and plants 2 Leech Seed`:`scatters spikes: enemies within 1 hex take ${DT(c,.6)}`}.`,
   hitBy(c,src,o){if(!o.ab&&src.range===1&&!src.dead)hurt(src,src.maxHp*.05,c);},
   cast(c,tg,i){c.shield+=c.maxHp*(i?.22:.16);schedule(.3,()=>{if(c.dead)return;if(i){if(!tg.dead){hitAb(c,tg,1.2);addStatus(tg,'seed',2,c);}}else for(const q of foesOf(c).filter(f=>hdist(f,c)<=1))hitAb(c,q,.6);});}});
kit({ids:[599,600,601],role:'Gear Engine',cls:'Artillery',cat:'phys',range:2,mana:[60,65,70],pf:[.8,1,1.15],names:['Gear Grind','Gear Grind','Shift Gear'],mvType:'Steel',tail:(c,i)=>i===2?'Each cast shifts gears: +10% <span class="s-as">Attack Speed</span> and <span class="s-atk">Attack</span> for the battle.':''},
  staged(B.hit(.55,{n:2}),B.hit(.6,{n:2}),seq(B.ramp({as:.1,atk:.1}),B.hit(.6,{n:3}))));
kit({ids:[602,603,604],role:'Eel Dynamo',cls:'Mystic',cat:'spec',range:[2,2,1],mana:[60,65,75],pf:[.8,1,1.15],names:['Charge Beam','Thunder Wave','Thunder Fang'],mvType:'Electric',tail:(c,i)=>i===2?'<b>Levitate:</b> immune to Ground moves.':''},
  {d:(c,i)=>i===0?B.beam(.9,{what:'a Charge Beam'}).d(c,i):i===1?`Shocks the target for ${DT(c,1)} and adds 4 Paralysis.`:`Latches onto the target with Thunder Fangs for ${DT(c,1.5)}, adding 4 Paralysis, then discharges at every enemy within 1 hex for ${DT(c,.6)}.`,
   begin(c,i){if(i===2)(c.fx.immune=c.fx.immune||[]).push('Ground');},
   cast(c,tg,i){if(i===0)return B.beam(.9,{col:'#ffe14d'}).cast(c,tg,0);hitAb(c,tg,i===2?1.5:1);addStatus(tg,'para',4,c);if(i===2)for(const q of foesOf(c).filter(f=>f!==tg&&hdist(f,c)<=1))hitAb(c,q,.6);}});
kit({ids:[605,606],role:'Gray Visitor',cls:'Mystic',cat:'spec',range:3,mana:[60,65],pf:[.8,1.1],names:['Psybeam','Beam Barrage'],mvType:'Psychic'},
  staged(B.hit(1,{fx:{conf:1}}),{d:c=>`Flashes its fingers and fires 3 psychic beams at different enemies for ${DT(c,.6)} each, adding 1 Confusion.`,
    cast(c,tg){shuffle(foesOf(c)).slice(0,3).forEach((q,k)=>schedule(k*.12,()=>{if(c.dead||q.dead)return;lineFx(c,q,['#ff5d5d','#ffe14d','#5ab8ff'][k],2,.25);hitAb(c,q,.6);addStatus(q,'conf',1,c);}));}}));
kit({ids:[607,608,609],role:'Soul Lantern',cls:'Mystic',cat:'spec',range:3,mana:[60,65,75],pf:[.8,1,1.15],names:['Ember','Hex','Inferno'],mvType:'Fire',tail:(c,i)=>i===2?'<b>Soul harvest:</b> each enemy knocked out while burned gives it +10% <span class="s-spa">Sp. Atk</span>.':''},
  staged(B.hit(1,{fx:{burn:.01}}),{d:c=>`Hexes the target for ${DT(c,1)}, +20% for each different status on it, and adds 2 Burn.`,cast(c,tg){hitAb(c,tg,1+.2*stCount(tg));addStatus(tg,'burn',2,c);}},
    {d:c=>`Sets every enemy within 3 hexes ablaze: ${DT(c,.75)} each and 5 Burn.`,
     cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.75,{type:'Fire'});addStatus(q,'burn',5,c);}if(!SIM.on)pfx('Fire_Spin_Front',c.x,c.y-14,{sc:.7,force:1});},
     kill(c,t){if(t.burn)c.spa*=1.1;}}));
kit({ids:[610,611,612],role:'Axe Dragon',cls:'Bruiser',cat:'phys',range:1,mana:[60,65,70],pf:[.8,1,1.15],names:['Dragon Claw','Dragon Dance','Outrage'],mvType:'Dragon',tail:(c,i)=>i===2?'<b>Mold Breaker:</b> its moves ignore shields from enemy abilities.':''},
  staged(B.hit(1.1,{proj:false,cr:.2}),seq(B.ramp({atk:.1,as:.08}),B.hit(1.1,{proj:false})),
    {d:c=>`Dragon Dances (+10% <span class="s-atk">Attack</span> and <span class="s-as">Attack Speed</span> for the battle), then rampages: 3 axe swings on the target for ${DT(c,.6)} each, with +25% crit chance.`,
     cast(c,tg){c.atk*=1.1;c.as*=1.1;for(let k=0;k<3;k++)schedule(k*.14,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.6,{cr:.25});});}}));
kit({ids:[613,614],role:'Polar Bear',cls:'Bruiser',cat:'phys',range:1,mana:[60,70],pf:[.8,1.1],names:['Avalanche','Icicle Crash'],mvType:'Ice'},
  staged(B.hit(1.1,{proj:false,fx:{chill:2}}),{d:c=>`Brings Icicle Crash down on the target for ${DT(c,1.5)} and 60% to adjacent enemies, adding 3 Chill to each.`,
    cast(c,tg){for(const q of[tg,...near(tg,1)]){hitAb(c,q,q===tg?1.5:.9);addStatus(q,'chill',3,c);}boom(tg,'#bff0ff',2);}}));
kit({ids:[615],role:'Snow Crystal',cls:'Mystic',cat:'spec',range:3,mana:65,pf:1.1,names:['Freeze-Dry'],mvType:'Ice'},
  {d:c=>`Spins and fires Freeze-Dry at the 3 nearest enemies for ${DT(c,.8)} each (Water types take double), adding 3 Chill.`,
   cast(c,tg){for(const q of foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,3)){hitAb(c,q,.8*(D[q.dex].t.includes('Water')?2:1));addStatus(q,'chill',3,c);}}});
kit({ids:[616],role:'Shell Snail',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:60,start:20,pf:.9,names:['Acid Armor'],mvType:'Bug'},
  seq(B.shield(.2,{def:10}),B.hit(.8,{fx:{psn:.01}})));
kit({ids:[617],role:'Ninja Slug',cls:'Striker',cat:'spec',range:3,mana:50,pf:1.15,names:['Bug Buzz'],mvType:'Bug'},
  {d:c=>`Darts to a spot near the weakest enemy and buzzes it for ${DT(c,1.2)}, lowering its <span class="s-def">Sp. Def</span> by 8. Gains +10% <span class="s-as">Attack Speed</span> for the battle.`,
   cast(c,tg){const t=pickT(c,tg,'weak');hitAb(c,t,1.2);t.res=Math.max(0,t.res-8);c.as*=1.1;}});
kit({ids:[618],role:'Trap Fish',cls:'Trickster',cat:'spec',range:1,mana:60,start:20,pf:1.05,names:['Discharge'],mvType:'Electric'},
  {d:c=>`Lies flat as a trap: gains a shield of ${HPT(c,.15)}, then shocks every enemy within 1 hex for ${DT(c,1)} and adds 3 Paralysis.`,
   cast(c,tg){c.shield+=c.maxHp*.15;for(const q of foesOf(c).filter(f=>hdist(f,c)<=1)){hitAb(c,q,1);addStatus(q,'para',3,c);}if(!SIM.on)pfx('Discharge',c.x,c.y-14,{sc:.4,force:1});}});
kit({ids:[619,620],role:'Kung Fu Weasel',cls:'Combo',cat:'phys',range:1,mana:[55,60],pf:[.8,1.1],names:['Force Palm','High Jump Kick'],mvType:'Fighting'},
  staged(B.hit(1,{proj:false,fx:{para:2}}),{d:c=>`Lashes the target with its whip-like arms for 3 strikes of ${DT(c,.4)} each, then High Jump Kicks the farthest enemy for ${DT(c,1)}.`,
    cast(c,tg){for(let k=0;k<3;k++)schedule(k*.1,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.4);});schedule(.4,()=>{if(c.dead)return;const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(!c.dead&&!t.dead)hitAb(c,t,1);});});}}));
kit({ids:[621],role:'Cave Dragon',cls:'Juggernaut',cat:'phys',range:1,mana:70,start:20,pf:1.1,names:['Dragon Tail'],mvType:'Dragon',tail:()=>'<b>Rough Skin:</b> melee attackers take 4% of their max HP each time they hit it.'},
  {d:c=>`Swings its tail at the target for ${DT(c,1.3)}, flinging it back a hex, and gains a shield of ${HPT(c,.15)}.`,
   hitBy(c,src,o){if(!o.ab&&src.range===1&&!src.dead)hurt(src,src.maxHp*.04,c);},cast(c,tg){hitAb(c,tg,1.3);knock(c,tg);c.shield+=c.maxHp*.15;}});
kit({ids:[622,623],role:'Golem Guard',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[70,80],start:20,pf:[.8,1.15],names:['Shadow Punch','Heat Crash'],mvType:'Ghost',tail:(c,i)=>i?'<b>Iron Fist:</b> punches deal +20% damage.':''},
  staged(seq(B.shield(.2),B.hit(1,{proj:false})),{d:c=>`Rockets into the air (out of reach for 0.7s) and crashes onto the biggest group of enemies for ${DT(c,1.4)} and 60% around it, then gains a shield of ${HPT(c,.2)}.`,
    cast(c,tg){B.airborne(.7).cast(c);schedule(.75,()=>{if(c.dead)return;const t=pickT(c,tg,'cluster');dashTo(c,t,false,.12);schedule(.14,()=>{if(c.dead)return;if(!t.dead)hitAb(c,t,1.4*1.2);for(const q of near(t,1))hitAb(c,q,.84*1.2);c.shield+=c.maxHp*.2;boom(t,'#c8a070',2);});});}}));
kit({ids:[626],role:'Bash Buffalo',cls:'Bruiser',cat:'phys',range:1,mana:65,pf:1.1,names:['Head Charge'],mvType:'Normal'},
  {d:c=>`Charges the farthest enemy with its afro for ${DT(c,1.7)}, knocking it back, and takes 5% of its own <span class="s-hp">max HP</span> in recoil.`,
   cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,false,.22);schedule(.24,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.7);knock(c,t);hurt(c,c.maxHp*.06,null);});}});
kit({ids:[627,628],role:'Valiant Eagle',cls:'Striker',cat:'phys',range:1,mana:[55,65],pf:[.8,1.1],names:['Wing Attack','Brave Bird'],mvType:'Flying'},
  staged(B.hit(1,{dash:1}),{d:c=>`Seizes the weakest enemy and carries it into the sky, dropping it for ${DT(c,1.7)}.`,
    cast(c,tg){const t=pickT(c,tg,'weak');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead||t.dead)return;stun(t,.6);t.airT=combatT+.6;schedule(.6,()=>{if(!c.dead&&!t.dead){hitAb(c,t,1.7);boom(t,'#cfe8ff',2);}});});}}));
kit({ids:[629,630],role:'Bone Vulture',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:[65,75],start:20,pf:[.8,1.05],names:['Gust','Foul Play'],mvType:'Dark'},
  staged(seq(B.shield(.15),B.hit(1)),{d:c=>`Gains a shield of ${HPT(c,.2)}, then turns the strongest enemy's own power on it with Foul Play: damage equal to 150% of that enemy's <span class="s-atk">Attack</span>.`,
    cast(c,tg){c.shield+=c.maxHp*.2;const t=pickT(c,tg,'strong');schedule(.3,()=>{if(!c.dead&&!t.dead)damage(c,t,t.atk*1.5,{ab:1,cat:'phys',type:'Dark'});});}}));
kit({ids:[631],role:'Ant Eater',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Fire Lash'],mvType:'Fire',tail:()=>'Deals +50% damage to Bug types.'},
  {d:c=>`Breathes a tongue of fire over the target and the enemies behind it for ${DT(c,1.1)}, adding 3 Burn and lowering <span class="s-def">Defense</span> by 8.`,
   cast(c,tg){B.cone(1.1,{fx:{burn:.015,shred:8},col:'#ff7a2c'}).cast(c,tg,0);}});
kit({ids:[632],role:'Iron Ant',cls:'Striker',cat:'phys',range:1,mana:55,pf:1.1,names:['First Impression'],mvType:'Bug'},
  {d:c=>`Its first cast is a First Impression for ${DT(c,2)}. After that it bites with Iron Head for ${DT(c,1.1)}, flinching 30% of the time.`,
   cast(c,tg){if(!c.firstImp){c.firstImp=1;return hitAb(c,tg,2);}hitAb(c,tg,1.1);if(Math.random()<.3)stun(tg,.35);}});
kit({ids:[633,634,635],role:'Brutal Dragon',cls:'Mystic',cat:'spec',range:[1,2,3],mana:[60,65,80],pf:[.8,1,1.15],names:['Dragon Breath','Dragon Pulse','Draco Meteor'],mvType:'Dragon',tail:(c,i)=>i===2?'Each Draco Meteor lowers its own <span class="s-spa">Sp. Atk</span> by 10% for 4s.':''},
  staged(B.hit(1,{fx:{para:2}}),B.blast(1.1,{what:'a Dragon Pulse',r:1}),{d:c=>`Calls down 6 meteors on enemies within 4 hexes, each for ${DT(c,.55)} to the enemy it lands on and adjacent enemies.`,
    cast(c,tg){B.barrage(6,.55,{what:'meteors',splash:1,col:'#7a5ad0'}).cast(c,tg,2);debuff(c,'spa',.1,4);}}));
kit({ids:[636,637],role:'Sun Moth',cls:'Mystic',cat:'spec',range:[1,3],mana:[60,75],pf:[.8,1.15],names:['Ember','Quiver Dance'],mvType:'Fire',tail:(c,i)=>i?'<b>Flame Body:</b> melee attackers that hit it gain 2 Burn.':''},
  {d:(c,i)=>i?`Quiver Dances (+10% <span class="s-spa">Sp. Atk</span> and <span class="s-as">Attack Speed</span> for the battle), then scatters burning scales over every enemy within 3 hexes for ${DT(c,.7)} each and 3 Burn.`:B.hit(1,{fx:{burn:.01}}).d(c,i),
   hitBy(c,src,o){if(c.kit.si===1&&!o.ab&&src.range===1&&!src.dead)addStatus(src,'burn',2,c);},
   cast(c,tg,i){if(!i)return B.hit(1,{fx:{burn:.01}}).cast(c,tg,i,{});c.spa*=1.1;c.as*=1.1;for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.7);addStatus(q,'burn',3,c);}if(!SIM.on)pfx('Fire_Spin_Front',c.x,c.y-14,{sc:.7,force:1});}});

// --- Unova legends ---
kit({ids:[638],role:'Iron Will',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:75,start:20,pf:1.15,names:['Sacred Sword'],mvType:'Fighting',tail:()=>'<b>Justified:</b> with Terrakion or Virizion on its team, every member of the trio gains +15% damage.'},
  {d:c=>`Shields itself and adjacent allies for ${HPT(c,.15)}, then cuts the target with Sacred Sword for ${DT(c,1.3)}, ignoring its defense buffs.`,
   begin(c){if(allyDex(c,639,640))c.dmg+=.15;},cast(c,tg){B.shield(.15,{who:'adjacent'}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.3,{pen:.3});});}});
kit({ids:[639],role:'Cavern Will',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.2,names:['Sacred Sword'],mvType:'Fighting',tail:()=>'<b>Justified:</b> with Cobalion or Virizion on its team, every member of the trio gains +15% damage.'},
  {d:c=>`Charges through the line to the farthest enemy, striking everything on the way for ${DT(c,1)} and the farthest enemy for ${DT(c,1.5)}.`,
   begin(c){if(allyDex(c,638,640))c.dmg+=.15;},cast(c,tg){const t=pickT(c,tg,'far');for(const q of lineHits(c,t))if(q!==t)hitAb(c,q,1);dashTo(c,t,true,.2);schedule(.22,()=>{if(!c.dead&&!t.dead){hitAb(c,t,1.5);boom(t,'#c8a070',2);}});}});
kit({ids:[640],role:'Grassland Will',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.2,names:['Leaf Blade'],mvType:'Fighting',tail:()=>'<b>Justified:</b> with Cobalion or Terrakion on its team, every member of the trio gains +15% damage.'},
  {d:c=>`Slashes the 3 weakest enemies in quick succession for ${DT(c,.9)} each, with +30% crit chance and 2 Leech Seed.`,
   begin(c){if(allyDex(c,638,639))c.dmg+=.15;},cast(c,tg){foesOf(c).sort((a,b)=>a.hp-b.hp).slice(0,3).forEach((t,k)=>schedule(k*.2,()=>{if(c.dead||t.dead)return;dashTo(c,t,true,.13);schedule(.15,()=>{if(!c.dead&&!t.dead){hitAb(c,t,.9,{cr:.3,type:'Grass'});addStatus(t,'seed',2,c);}});}));}});
kit({ids:[641],role:'Cyclone Genie',cls:'Mystic',cat:'spec',range:3,mana:70,start:30,pf:1.15,names:['Hurricane'],mvType:'Flying',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  B.blast(1.3,{what:'a Hurricane',at:'cluster',r:1,fx:{conf:2,knock:1},col:'#cfe8ff'}));
kit({ids:[642],role:'Storm Genie',cls:'Mystic',cat:'spec',range:3,mana:70,start:30,pf:1.15,names:['Thunder'],mvType:'Electric',tail:()=>'<b>Prankster:</b> starts each battle with 30 PP.'},
  {d:c=>`Calls down 4 Thunder bolts on random enemies across the board for ${DT(c,.7)} each, adding 3 Paralysis.`,
   cast(c,tg){for(let k=0;k<4;k++)schedule(k*.15,()=>{if(c.dead)return;const fs=foesOf(c);if(!fs.length)return;const t=pick(fs);hitAb(c,t,.7);addStatus(t,'para',3,c);if(!SIM.on)fx.push({line:1,x1:t.x,y1:t.y-150,x2:t.x,y2:t.y-8,life:.3,max:.3,col:'#ffe14d',w:2});});}});
kit({ids:[645],role:'Bounty Genie',cls:'Bruiser',cat:'phys',range:1,mana:75,pf:1.15,names:['Earthquake'],mvType:'Ground',tail:()=>'<b>Sand Force:</b> +30% damage in a sandstorm.'},
  {d:c=>`Shakes the ground: every enemy within 2 hexes takes ${DT(c,1.2)} (+30% in a sandstorm).`,cast(c,tg){B.nova(1.2*(battle.weather==='sand'?1.3:1),{r:2,col:'#c8a070'}).cast(c,tg,0);}});
kit({ids:[643],role:'Truth Flame',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.2,names:['Blue Flare'],mvType:'Fire',tail:()=>'With Zekrom on its team, both legends gain +20% damage.'},
  {d:c=>`Engulfs the biggest group of enemies in Blue Flare: ${DT(c,1.6)} to the center and 70% around it, adding 6 Burn.`,
   begin(c){if(allyDex(c,644))c.dmg+=.2;},cast(c,tg){B.blast(1.6,{at:'cluster',r:1,fx:{burn:.03},col:'#7fd8ff'}).cast(c,tg,0,{});}});
kit({ids:[644],role:'Ideal Bolt',cls:'Bruiser',cat:'phys',range:1,mana:80,pf:1.2,names:['Bolt Strike'],mvType:'Electric',tail:()=>'With Reshiram on its team, both legends gain +20% damage.'},
  {d:c=>`Cloaks itself in lightning and slams into the farthest enemy for ${DT(c,2)}, adding 5 Paralysis, with a crackling shockwave for 50% to adjacent enemies.`,
   begin(c){if(allyDex(c,643))c.dmg+=.2;},cast(c,tg){const t=pickT(c,tg,'far');dashTo(c,t,true,.2);schedule(.22,()=>{if(c.dead)return;if(!t.dead){hitAb(c,t,2);addStatus(t,'para',5,c);}for(const q of near(t,1))hitAb(c,q,1);if(!SIM.on)pfx('Discharge_Hit',t.x,t.y-10,{sc:.5,force:1});});}});
kit({ids:[646],role:'Boundary Dragon',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.15,names:['Glaciate'],mvType:'Ice'},
  {d:c=>`Exhales a Glaciate wave over every enemy within 3 hexes: ${DT(c,1)} each and 5 Chill, slowing them by 20% for 3s.`,
   cast(c,tg){for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,1);addStatus(q,'chill',5,c);applyFx(c,q,{slow:[.2,3]},0);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:2.2,force:1});}});
kit({ids:[647],role:'Resolute Colt',cls:'Striker',cat:'spec',range:1,mana:65,pf:1.2,names:['Secret Sword'],mvType:'Water'},
  {d:c=>`Draws its Secret Sword and cuts through the target and every enemy in a line behind it for ${DT(c,1.4)}, dealing physical damage based on its <span class="s-spa">Sp. Atk</span>.`,
   cast(c,tg){const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts)damage(c,q,V(c,1.4,'spec'),{ab:1,cat:'phys',type:'Fighting'});lineFx(c,tg,'#9fd4ff',3,.3);}});
kit({ids:[648],role:'Melody Muse',cls:'Medic',type:'heal',cat:'spec',range:3,mana:70,pf:1.15,names:['Relic Song'],mvType:'Normal'},
  {d:c=>`Sings a Relic Song: every ally heals ${HT(c,.35)}, and every enemy within 3 hexes takes ${DT(c,.6)} and falls asleep for 0.6s.`,
   cast(c,tg){B.heal(.35,{who:'team'}).cast(c,tg,0);for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,.6);stun(q,.6);}if(!SIM.on)pfx('Music_Notes_Uproar',c.x,c.y-24,{sc:1.6,force:1});}});
kit({ids:[649],role:'Techno Hunter',cls:'Artillery',cat:'spec',range:4,mana:75,pf:1.15,names:['Techno Blast'],mvType:'Bug',tail:()=>'<b>Download:</b> starts the battle with +15% <span class="s-atk">Attack</span> or <span class="s-spa">Sp. Atk</span>, whichever the enemy team defends against worse.'},
  {d:c=>`Fires a Techno Blast through the target that hits every enemy in a line for ${DT(c,1.5)}.`,
   begin(c){const fs=units.filter(u=>u.team!==c.team);const df=fs.reduce((s,u)=>s+u.def,0),rs=fs.reduce((s,u)=>s+u.res,0);if(df<rs)c.atk*=1.15;else c.spa*=1.15;},
   cast(c,tg){B.beam(1.5,{col:'#ff9a3c'}).cast(c,tg,0);}});

// tuning pass (starting values; refined below after measuring)
for(const[d,m]of Object.entries({526: 0.7, 542: 0.7, 617: 0.7, 581: 0.7, 534: 0.7, 593: 0.65, 609: 0.65, 537: 0.6, 549: 0.6, 623: 0.55, 596: 0.5, 569: 0.9, 518: 0.9, 586: 0.9, 516: 0.9, 606: 0.85, 539: 0.85, 538: 0.85, 620: 0.75, 530: 0.75, 503: 0.7, 497: 0.65, 584: 0.6, 571: 0.55, 614: 0.8, 626: 0.85, 631: 0.85, 500: 0.9, 615: 0.8, 637: 0.8, 635: 0.7, 642: 0.8, 645: 0.85, 641: 0.85, 646: 0.85, 640: 0.9, 643: 0.9, 528: 0.85, 505: 0.9, 545: 1.2, 563: 1.15, 555: 1.2, 621: 1.1}))tuneSig(+d,m);
