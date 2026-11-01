"use strict";
/* PokéRun Tactics — move animations and legendary cinematics.
   1) Every signature move whose name matches a Pokémon Mystery Dungeon animation sheet plays that sheet on what it hits
      (or on the caster for heals, shields and buffs), on top of the type-matched impact.
   2) Legendary Pokémon get dramatic, on-board effects that never cover the field or slow the game: a big charge-up
      behind the caster, a shockwave ring, their own stack of PMD impacts on every target (with strikes from the sky
      for some), a lingering afterglow and a short screen shake. */

/* ---------- 1) move-name animations ---------- */
const MVFX={};
function moveSheet(name){if(name in MVFX)return MVFX[name];const N=String(name).replace(/[ \-']/g,'_').replace(/__+/g,'_');
  const c=[N+'_Hit',N+'_Front',N,N+'_Hit_Front',N+'_Ranger',N+'_Explosion',N+'_Shot'].find(k=>FXM[k]&&FXM[k][2]===1);return MVFX[name]=c||null;}
const fitSc=n=>{const m=FXM[n];return m?Math.max(.3,Math.min(1.3,52/m[1])):1;};
// called when a signature move goes off
function moveFxCast(u){if(SIM.on)return;const K=u.kit;const name=K.sig&&K.sig.names?K.sig.names[Math.min(K.si,K.sig.names.length-1)]:u.mv.n;const sh=moveSheet(name);
  u.mvFx=null;if(!sh)return;
  if(K.type==='heal'||K.type==='guard'||K.sig.selfFx){pfx(sh,u.x,u.y-14,{sc:fitSc(sh),force:1});return;}
  u.mvFx={sh,until:combatT+1.2,seen:new Set()};}
// called from damage() for every move hit
function moveFxHit(src,tg){const m=src.mvFx;if(!m||combatT>m.until||m.seen.has(tg))return;m.seen.add(tg);if(m.seen.size>4)return;pfx(m.sh,tg.x,tg.y-12,{sc:fitSc(m.sh),force:1});}

/* ---------- 2) legendary cinematics ---------- */
// col: signature colour · charge: sheets behind the caster · impact: sheets on each target · self: played on the caster instead
// sky: strike from above onto targets ('bolt' = lightning, otherwise a falling sheet) · hue: colour filter for its effects
const LEG={
  144:{col:'#bff0ff',charge:['Mega_Background_Light_Blue'],impact:['Sheer_Cold_Front','Ice_Shard_Hit']},
  145:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  146:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Fire_Spin_Front','Explosion']},
  150:{col:'#c58cff',charge:['Psycho_Boost_Back'],impact:['Psycho_Boost_Front','Circle_Purple_Out']},
  151:{col:'#ff9be6',charge:['Healing_Wish_Charge'],impact:['Ancient_Power_Front','Light_Ball_Pink']},
  243:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  244:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Sacred_Fire_Pillar','Eruption']},
  245:{col:'#7fd8ff',charge:['Mega_Background_Light_Blue'],impact:['Water_Spout_Splash','Hydro_Cannon','Circle_Blue_Out']},
  249:{col:'#cfe8ff',charge:['Mega_Background_White'],impact:['Gust_Blue','Hit_Super_Effective']},
  250:{col:'#ffb347',charge:['Mega_Background_Yellow'],impact:['Sacred_Fire_Pillar','Sacred_Fire_Ranger']},
  251:{col:'#a8e070',charge:['Mega_Background_White'],self:['Heal_Bell','Moonlight_Sparkles']},
  377:{col:'#c8a070',charge:['Ancient_Power_Back'],impact:['Rock_Wrecker_Hit','Ancient_Power_Front']},
  378:{col:'#bff0ff',charge:['Ancient_Power_Back'],impact:['Ice_Shard_Hit','Sheer_Cold_Front']},
  379:{col:'#c0c8d8',charge:['Ancient_Power_Back'],impact:['Metal_Burst','Close_Combat']},
  380:{col:'#ff9be6',charge:['Mega_Background_Red'],impact:['Heart_Swap_Hit','Mist_Ball']},
  381:{col:'#9fd4ff',charge:['Mega_Background_Light_Blue'],impact:['Mirror_Shot_Hit','Circle_Blue_Out']},
  382:{col:'#3a7cff',charge:['Mega_Background_Light_Blue'],impact:['Water_Spout_Up','Water_Spout_Splash']},
  383:{col:'#ff6a2c',charge:['Mega_Background_Red'],impact:['Eruption','Earth_Power_Eruption']},
  384:{col:'#7fe3a8',charge:['Dragon_Dance'],impact:['Dragon_Rush_Front','Draco_Meteor_Explosion'],sky:'Draco_Meteor_Streaks'},
  385:{col:'#ffe27a',charge:['Wish'],impact:['Draco_Meteor_Explosion','Light_Ball_Yellow'],sky:'Draco_Meteor_Streaks'},
  386:{col:'#ff6a5a',charge:['Psycho_Boost_Back'],impact:['Psycho_Boost_Front','Explosion']},
  480:{col:'#ffe27a',charge:['Nasty_Plot_Think'],self:['Psych_Up','Moonlight_Sparkles']},
  481:{col:'#ff9be6',charge:['Healing_Wish_Charge'],self:['Healing_Wish_Hit','Heart_Swap']},
  482:{col:'#7fb8ff',charge:['Nasty_Plot'],impact:['Psycho_Boost_Front']},
  483:{col:'#5a8ae0',charge:['Mega_Background_Light_Blue'],impact:['Roar_Of_Time','Roar_Of_Time_Cloud']},
  484:{col:'#ff9be6',charge:['Mega_Background_Red'],impact:['Spacial_Rend','Spacial_Rend_Hit']},
  485:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Magma_Storm_Front','Explosion']},
  486:{col:'#e8e0c0',charge:['Ancient_Power_Back'],impact:['Crush_Grip_Hit','Explosion']},
  487:{hue:'saturate(1.3)',col:'#7a5ad0',charge:['Shadow_Force_Smoke_Reverse'],impact:['Shadow_Force_Front','Shadow_Force_Hit']},
  488:{col:'#ff9be6',charge:['Lunar_Dance_Back'],self:['Lunar_Dance_Front','Lunar_Dance_Moon']},
  489:{col:'#7fd8ff',charge:['Mega_Background_Light_Blue'],self:['Aqua_Ring']},
  490:{col:'#5aa8ff',charge:['Heart_Swap'],impact:['Hydro_Cannon','Water_Spout_Splash']},
  491:{col:'#5a3a8a',charge:['Dark_Void_Back'],impact:['Dark_Void_Front','Dark_Void_Sparkle']},
  492:{col:'#a8e070',charge:['Mega_Background_White'],impact:['Seed_Flare','Seed_Flare_Burst']},
  493:{col:'#fff6c0',charge:['Mega_Background_White'],impact:['Light_Ball_White','Explosion'],sky:'Light_Ball_Yellow'},
  494:{col:'#ff7a2c',charge:['Flare_Blitz_Charge_Back'],impact:['Flare_Blitz_Hit_Front','Explosion']},
  638:{col:'#c0c8d8',charge:['Swords_Dance'],impact:['Close_Combat','Hit_Super_Effective']},
  639:{col:'#c8a070',charge:['Swords_Dance'],impact:['Close_Combat','Rock_Wrecker_Hit']},
  640:{col:'#7fe3a8',charge:['Swords_Dance'],impact:['Leaf_Blade','Hit_Super_Effective']},
  641:{col:'#cfe8ff',charge:['Tailwind'],impact:['Gust','Hit_Super_Effective']},
  642:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  645:{col:'#c08850',charge:['Ancient_Power_Back'],impact:['Earthquake_Ranger','Fissure']},
  643:{hue:'hue-rotate(185deg) saturate(1.4) brightness(1.1)',col:'#7fd8ff',charge:['Mega_Background_Light_Blue','Fire_Spin_Back'],impact:['Sacred_Fire_Pillar','Flare_Blitz_Hit_Front','Explosion']},
  644:{hue:'hue-rotate(170deg) saturate(1.6)',col:'#5ab0ff',charge:['Charge_Up','Discharge'],impact:['Discharge','Charge_Beam_Hit'],sky:'bolt'},
  646:{hue:'saturate(.6) brightness(1.2)',col:'#bff0ff',charge:['Mega_Background_Light_Blue'],impact:['Sheer_Cold_Front','Ice_Shard_Hit']},
  647:{col:'#7fd8ff',charge:['Swords_Dance'],impact:['Hydro_Cannon','Close_Combat']},
  648:{col:'#ffe27a',charge:['Mega_Background_Yellow'],self:['Uproar','Music_Notes_Uproar']},
  716:{col:'#ff9be6',charge:['Mega_Background_White','Moonlight_Sparkles'],impact:['Light_Ball_Pink','Moonlight_Sparkles','Explosion'],sky:'Light_Ball_Pink'},
  717:{col:'#d04060',charge:['Mega_Background_Red','Dark_Pulse_Back'],impact:['Dark_Pulse_Front','Shadow_Force_Hit_Dark']},
  718:{col:'#7fe3a8',charge:['Mega_Background_Yellow'],impact:['Thorn_Green','Earthquake_Ranger'],sky:'Thorn_Green'},
  719:{hue:'hue-rotate(290deg) saturate(1.3)',col:'#ff9be6',charge:['Power_Gem_Charge'],impact:['Power_Gem_Hit','Stone_Edge']},
  720:{col:'#c58cff',charge:['Psycho_Cut_Hole'],impact:['Psycho_Cut_Hole','Psycho_Boost_Front']},
  721:{col:'#e0f0ff',charge:['Mega_Background_Red','Water_Spout_Up'],impact:['Water_Spout_Splash','Lava_Plume_Smoke','Explosion']},
  649:{col:'#ff9a3c',charge:['Charge_Beam_Start'],impact:['Charge_Beam_Hit','Explosion']},
  773:{col:'#e8e8f0',charge:['Swords_Dance'],impact:['Tri_Attack_Hit','Hit_Super_Effective']},
  785:{col:'#ffe14d',charge:['Charge_Up','Mega_Background_Yellow'],impact:['Discharge_Hit','Charge_Beam_Hit'],sky:'bolt'},
  786:{col:'#ff9be6',charge:['Mega_Background_White','Psych_Up'],impact:['Psycho_Boost_Front','Light_Ball_Pink']},
  787:{col:'#7fe3a8',charge:['Mega_Background_Yellow','Ingrain'],impact:['Leaf_Blade','Frenzy_Plant'],sky:'Thorn_Green'},
  788:{col:'#9fe0ff',charge:['Mega_Background_Light_Blue','Aqua_Ring'],impact:['Hydro_Cannon','Moonlight_Sparkles']},
  791:{col:'#ffd34d',charge:['Mega_Background_Yellow','Sun'],impact:['Flare_Blitz_Hit_Front','Metal_Burst_Hit','Explosion'],sky:'Light_Ball_Yellow'},
  792:{col:'#b07aff',charge:['Mega_Background_White','Lunar_Dance_Moon'],impact:['Shadow_Force_Hit_Light','Moonlight_Sparkles']},
  800:{col:'#fff6c0',charge:['Mega_Background_White','Power_Gem_Charge'],impact:['Light_Ball_White','Explosion'],sky:'Light_Ball_White'},
  801:{col:'#ffb3e6',charge:['Mega_Background_White','Flash_Cannon_Sparkle_Gather'],impact:['Flash_Cannon_Release','Light_Ball_Pink']},
  802:{col:'#5a4878',charge:['Shadow_Force_Smoke_Reverse'],impact:['Shadow_Force_Hit_Dark','Close_Combat']},
  807:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit','Hit_Super_Effective'],sky:'bolt'},
  809:{col:'#c0c8d8',charge:['Metal_Burst_Charge'],impact:['Gigaton_Hammer_PMDO','Metal_Burst_Hit']},
  888:{col:'#9fd4ff',charge:['Swords_Dance','Mega_Background_Light_Blue'],impact:['Slash_Blue_RSE','Hit_Super_Effective'],sky:'Light_Ball_Blue'},
  889:{col:'#ff7a7a',charge:['Protect','Mega_Background_Red'],impact:['Close_Combat','Metal_Burst_Hit']},
  890:{col:'#ff4a6a',charge:['Mega_Background_Red','Dragon_Pulse_Charge'],impact:['Dragon_Pulse_Particle_Red','Explosion'],sky:'Light_Ball_Pink'},
  892:{col:'#8a6cd6',charge:['Focus_Energy'],impact:['Close_Combat','Shadow_Force_Hit_Dark']},
  893:{col:'#7fe3a8',charge:['Ingrain'],impact:['Power_Whip_Hit_Front','Leaf_Storm_Hit']},
  894:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge','Charge_Beam_Hit'],sky:'bolt'},
  895:{col:'#8a6cff',charge:['Dragon_Dance','Mega_Background_White'],impact:['Dragon_Pulse_Particle_Purple','Explosion']},
  896:{col:'#bff0ff',charge:['Mega_Background_Light_Blue'],impact:['Sheer_Cold_Front','Icicle_Spear']},
  897:{col:'#8a6cd6',charge:['Shadow_Force_Smoke_Reverse'],impact:['Shadow_Ball','Shadow_Force_Hit']},
  898:{col:'#7fe3a8',charge:['Psych_Up','Synthesis_Sparkle'],impact:['Leaf_Storm_Hit','Psycho_Boost_Front']},
  905:{col:'#ff9be6',charge:['Mega_Background_White','Captivate_Hearts'],impact:['Petal_Dance_Front','Light_Ball_Pink']},
  1001:{col:'#5a8a40',charge:['Mega_Background_Yellow','Ingrain'],impact:['Dark_Pulse_Front','Leech_Seed_Sprout']},
  1002:{col:'#bff0ff',charge:['Swords_Dance'],impact:['Icicle_Spear','Night_Slash_Hit']},
  1003:{col:'#8a6a3a',charge:['Mega_Background_Yellow'],impact:['Earthquake_Ranger','Fissure']},
  1004:{col:'#ff6a2c',charge:['Mega_Background_Red','Fire_Spin_Back'],impact:['Fire_Blast','Explosion']},
  1007:{col:'#ff7a3c',charge:['Sun','Mega_Background_Red'],impact:['Close_Combat','Explosion'],sky:'Light_Ball_Yellow'},
  1008:{col:'#7fd8ff',charge:['Charge_Up','Mega_Background_Light_Blue'],impact:['Discharge','Charge_Beam_Hit'],sky:'bolt'},
  1014:{col:'#c86bd6',charge:['Focus_Energy'],impact:['Poison_Jab','Close_Combat']},
  1015:{col:'#c86bd6',charge:['Psych_Up'],impact:['Psycho_Boost_Front','Gunk_Shot_Hit']},
  1016:{col:'#ff9be6',charge:['Captivate_Hearts'],impact:['Beat_Up','Gunk_Shot_Hit']},
  1017:{col:'#7fe3a8',charge:['Mega_Background_Yellow','Swords_Dance'],impact:['Power_Whip_Hit_Front','Leaf_Blade']},
  1024:{col:'#ffffff',charge:['Mega_Background_White','Swift_Star'],impact:['Light_Ball_White','Explosion'],sky:'Light_Ball_White'},
  1025:{col:'#c86bd6',charge:['Mega_Background_Red','Curse'],impact:['Gunk_Shot_Hit','Poison_Trap_Spike']},
  10169:{col:'#c58cff',charge:['Mega_Background_White','Psych_Up'],impact:['Psycho_Boost_Front','Ice_Shard_Hit']},
  10170:{col:'#ff9a3c',charge:['Focus_Energy'],impact:['Close_Combat','Hit_Super_Effective'],sky:'bolt'},
  10171:{col:'#8a3060',charge:['Mega_Background_Red','Dark_Pulse_Back'],impact:['Dark_Pulse_Front','Fire_Blast']},
};
const legOf=u=>LEG[baseOf(u.dex)]||null;
const CINE={shake:0};
const RING={'#7fd8ff':'Blue','#5ab0ff':'Blue','#3a7cff':'Blue','#9fd4ff':'Blue','#bff0ff':'White','#cfe8ff':'White','#fff6c0':'Yellow','#ffe14d':'Yellow','#ffe27a':'Yellow','#ffb347':'Yellow','#ff7a2c':'Red','#ff6a2c':'Red','#ff6a5a':'Red','#ff9be6':'Pink','#c58cff':'Purple','#7a5ad0':'Purple','#5a3a8a':'Purple','#a8e070':'Green','#7fe3a8':'Green','#c8a070':'Red','#c08850':'Red','#c0c8d8':'White','#e8e0c0':'White','#ff9a3c':'Red','#5a8ae0':'Blue'};
const ringOf=L=>'Circle_'+(RING[L.col]||'White')+'_Out';
// at cast time: a big charge-up on the caster (no overlay, no pause)
function legendCast(u){if(SIM.on)return 0;const L=legOf(u);if(!L)return 0;
  for(const[i,s]of L.charge.entries())pfx(s,u.x,u.y-14,{sc:Math.max(.6,Math.min(1.5,84/(FXM[s]?FXM[s][1]:70))),alpha:.95,force:1,ft:.045,filter:L.hue});
  pfx(ringOf(L),u.x,u.y-4,{sc:.9,sy:.5,force:1});
  u.legPend={L,until:combatT+2.5,seen:new Set()};
  if(L.self)schedule(.3,()=>{for(const s of L.self)pfx(s,u.x,u.y-16,{sc:fitSc(s)*1.5,force:1,filter:L.hue});pfx(ringOf(L),u.x,u.y-4,{sc:1.3,sy:.5,force:1});for(const a of alive(u.team))if(a!==u)pfx('Moonlight_Sparkles',a.x,a.y-16,{force:1,filter:L.hue});});
  return 0;}
// when a legendary's move hits each target: sky strike, layered impacts, shockwave, afterglow, shake
function legendHit(src,tg){const p=src.legPend;if(!p||combatT>p.until||p.seen.has(tg))return;p.seen.add(tg);if(p.seen.size>5)return;const L=p.L,first=p.seen.size===1;
  if(L.sky==='bolt'){for(let k=0;k<(first?3:1);k++)schedule(k*.05,()=>fx.push({line:1,x1:tg.x+rnd(-16,16),y1:tg.y-190,x2:tg.x+rnd(-3,3),y2:tg.y-8,life:.4,max:.4,col:'#ffe14d',w:3,filter:L.hue}));}
  else if(L.sky)pfx(L.sky,tg.x,tg.y-40,{sc:FXM[L.sky]&&FXM[L.sky][1]>200?.4:.9,force:1,filter:L.hue});
  L.impact.forEach((s,i)=>schedule(i*.07,()=>pfx(s,tg.x,tg.y-12,{sc:Math.max(.55,Math.min(1.7,(first?92:72)/(FXM[s]?FXM[s][1]:70))),force:1,filter:L.hue})));
  schedule(.05,()=>pfx(ringOf(L),tg.x,tg.y-4,{sc:first?1.3:.9,sy:.5,force:1}));
  if(first)schedule(.25,()=>pfx('Hit_Super_Effective',tg.x,tg.y-14,{sc:.9,force:1,filter:L.hue}));
  if(OPTS.shake!==0)CINE.shake=Math.max(CINE.shake,first?.3:.15);}
const cineSlow=()=>1;
function drawCine(){}
function cineShake(dtReal){if(CINE.shake<=0)return{x:0,y:0};CINE.shake=Math.max(0,CINE.shake-dtReal);const m=CINE.shake*8;return{x:rnd(-m,m),y:rnd(-m,m)};}
