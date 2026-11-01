"use strict";
/* PokéRun Tactics — move animations and legendary cinematics.
   1) Every signature move whose name matches a Pokémon Mystery Dungeon animation sheet plays that sheet on what it hits
      (or on the caster for heals, shields and buffs), on top of the type-matched impact.
   2) Legendary Pokémon get a cinematic: the screen dims to a spotlight on the caster, a charge-up plays behind it,
      the move name sweeps across the screen, time slows for a moment, and the move lands with a bespoke stack of
      PMD effects, a flash and a screen shake. The full cinematic plays on each legendary's first cast every battle
      (or every cast, or never, from Settings › Display); later casts keep the charge-up and the dramatic impact. */

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
// sky: strike from above onto targets ('bolt' = lightning, otherwise a falling sheet) · tint: screen tint during the cinematic
const LEG={
  144:{col:'#bff0ff',charge:['Mega_Background_Light_Blue'],impact:['Sheer_Cold_Front','Ice_Shard_Hit']},
  145:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  146:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Fire_Spin_Front','Explosion']},
  150:{col:'#c58cff',charge:['Psycho_Boost_Back'],impact:['Psycho_Boost_Front','Circle_Purple_Out'],tint:'rgba(70,20,110,.25)'},
  151:{col:'#ff9be6',charge:['Healing_Wish_Charge'],impact:['Ancient_Power_Front','Light_Ball_Pink']},
  243:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  244:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Sacred_Fire_Pillar','Eruption']},
  245:{col:'#7fd8ff',charge:['Mega_Background_Light_Blue'],impact:['Water_Spout_Splash','Hydro_Cannon','Circle_Blue_Out']},
  249:{col:'#cfe8ff',charge:['Mega_Background_White'],impact:['Gust_Blue','Hit_Super_Effective'],tint:'rgba(120,160,255,.18)'},
  250:{col:'#ffb347',charge:['Mega_Background_Yellow'],impact:['Sacred_Fire_Pillar','Sacred_Fire_Ranger'],tint:'rgba(255,150,40,.18)'},
  251:{col:'#a8e070',charge:['Mega_Background_White'],self:['Heal_Bell','Moonlight_Sparkles']},
  377:{col:'#c8a070',charge:['Ancient_Power_Back'],impact:['Rock_Wrecker_Hit','Ancient_Power_Front']},
  378:{col:'#bff0ff',charge:['Ancient_Power_Back'],impact:['Ice_Shard_Hit','Sheer_Cold_Front']},
  379:{col:'#c0c8d8',charge:['Ancient_Power_Back'],impact:['Metal_Burst','Close_Combat']},
  380:{col:'#ff9be6',charge:['Mega_Background_Red'],impact:['Heart_Swap_Hit','Mist_Ball']},
  381:{col:'#9fd4ff',charge:['Mega_Background_Light_Blue'],impact:['Mirror_Shot_Hit','Circle_Blue_Out']},
  382:{col:'#3a7cff',charge:['Mega_Background_Light_Blue'],impact:['Water_Spout_Up','Water_Spout_Splash'],tint:'rgba(20,60,160,.25)'},
  383:{col:'#ff6a2c',charge:['Mega_Background_Red'],impact:['Eruption','Earth_Power_Eruption'],tint:'rgba(170,40,0,.25)'},
  384:{col:'#7fe3a8',charge:['Dragon_Dance'],impact:['Dragon_Rush_Front','Draco_Meteor_Explosion'],sky:'Draco_Meteor_Streaks'},
  385:{col:'#ffe27a',charge:['Wish'],impact:['Draco_Meteor_Explosion','Light_Ball_Yellow'],sky:'Draco_Meteor_Streaks'},
  386:{col:'#ff6a5a',charge:['Psycho_Boost_Back'],impact:['Psycho_Boost_Front','Explosion'],tint:'rgba(110,20,60,.22)'},
  480:{col:'#ffe27a',charge:['Nasty_Plot_Think'],self:['Psych_Up','Moonlight_Sparkles']},
  481:{col:'#ff9be6',charge:['Healing_Wish_Charge'],self:['Healing_Wish_Hit','Heart_Swap']},
  482:{col:'#7fb8ff',charge:['Nasty_Plot'],impact:['Psycho_Boost_Front']},
  483:{col:'#5a8ae0',charge:['Mega_Background_Light_Blue'],impact:['Roar_Of_Time','Roar_Of_Time_Cloud'],tint:'rgba(30,60,160,.3)'},
  484:{col:'#ff9be6',charge:['Mega_Background_Red'],impact:['Spacial_Rend','Spacial_Rend_Hit'],tint:'rgba(120,40,120,.25)'},
  485:{col:'#ff7a2c',charge:['Mega_Background_Red'],impact:['Magma_Storm_Front','Explosion'],tint:'rgba(170,50,0,.22)'},
  486:{col:'#e8e0c0',charge:['Ancient_Power_Back'],impact:['Crush_Grip_Hit','Explosion']},
  487:{hue:'saturate(1.3)',col:'#7a5ad0',charge:['Shadow_Force_Smoke_Reverse'],impact:['Shadow_Force_Front','Shadow_Force_Hit'],tint:'rgba(30,0,50,.4)'},
  488:{col:'#ff9be6',charge:['Lunar_Dance_Back'],self:['Lunar_Dance_Front','Lunar_Dance_Moon']},
  489:{col:'#7fd8ff',charge:['Mega_Background_Light_Blue'],self:['Aqua_Ring']},
  490:{col:'#5aa8ff',charge:['Heart_Swap'],impact:['Hydro_Cannon','Water_Spout_Splash']},
  491:{col:'#5a3a8a',charge:['Dark_Void_Back'],impact:['Dark_Void_Front','Dark_Void_Sparkle'],tint:'rgba(10,0,30,.45)'},
  492:{col:'#a8e070',charge:['Mega_Background_White'],impact:['Seed_Flare','Seed_Flare_Burst']},
  493:{col:'#fff6c0',charge:['Mega_Background_White'],impact:['Light_Ball_White','Explosion'],sky:'Light_Ball_Yellow',tint:'rgba(255,240,180,.22)'},
  494:{col:'#ff7a2c',charge:['Flare_Blitz_Charge_Back'],impact:['Flare_Blitz_Hit_Front','Explosion']},
  638:{col:'#c0c8d8',charge:['Swords_Dance'],impact:['Close_Combat','Hit_Super_Effective']},
  639:{col:'#c8a070',charge:['Swords_Dance'],impact:['Close_Combat','Rock_Wrecker_Hit']},
  640:{col:'#7fe3a8',charge:['Swords_Dance'],impact:['Leaf_Blade','Hit_Super_Effective']},
  641:{col:'#cfe8ff',charge:['Tailwind'],impact:['Gust','Hit_Super_Effective']},
  642:{col:'#ffe14d',charge:['Charge_Up'],impact:['Discharge_Hit'],sky:'bolt'},
  645:{col:'#c08850',charge:['Ancient_Power_Back'],impact:['Earthquake_Ranger','Fissure']},
  643:{hue:'hue-rotate(185deg) saturate(1.4) brightness(1.1)',col:'#7fd8ff',charge:['Mega_Background_Light_Blue','Fire_Spin_Back'],impact:['Sacred_Fire_Pillar','Flare_Blitz_Hit_Front','Explosion'],tint:'rgba(40,120,255,.28)'},
  644:{hue:'hue-rotate(170deg) saturate(1.6)',col:'#5ab0ff',charge:['Charge_Up','Discharge'],impact:['Discharge','Charge_Beam_Hit'],sky:'bolt',tint:'rgba(10,20,60,.4)'},
  646:{hue:'saturate(.6) brightness(1.2)',col:'#bff0ff',charge:['Mega_Background_Light_Blue'],impact:['Sheer_Cold_Front','Ice_Shard_Hit'],tint:'rgba(150,210,255,.25)'},
  647:{col:'#7fd8ff',charge:['Swords_Dance'],impact:['Hydro_Cannon','Close_Combat']},
  648:{col:'#ffe27a',charge:['Mega_Background_Yellow'],self:['Uproar','Music_Notes_Uproar']},
  649:{col:'#ff9a3c',charge:['Charge_Beam_Start'],impact:['Charge_Beam_Hit','Explosion']},
};
const CINE={on:false,t0:0,dur:1.5,c:null,L:null,name:'',slowUntil:0,shake:0,flash:0,flashCol:'#fff'};
const legOf=u=>LEG[baseOf(u.dex)]||null;
// at cast time, before the move goes off
function legendCast(u){if(SIM.on)return 0;const L=legOf(u);if(!L)return 0;
  const full=OPTS.cine==='always'||(OPTS.cine!=='off'&&!u.cineDone);u.cineDone=1;
  for(const[i,s]of L.charge.entries())pfx(s,u.x,u.y-14,{sc:Math.max(.5,Math.min(1.3,70/(FXM[s]?FXM[s][1]:70)))*(i?1:1.1),alpha:.9,force:1,ft:.05,filter:L.hue});
  u.legPend={L,until:combatT+2.5,seen:new Set()};
  if(L.self)schedule(.35,()=>{for(const s of L.self)pfx(s,u.x,u.y-16,{sc:fitSc(s)*1.3,force:1,filter:L.hue});CINE.flash=.25;CINE.flashCol=L.col;});
  if(full){Object.assign(CINE,{on:true,t0:performance.now(),dur:1500,c:u,L,name:u.mv.n,who:D[u.dex].n,slowUntil:performance.now()+650,shake:0});}
  return full?.25:0;}
// when a legendary's move hits each target
function legendHit(src,tg){const p=src.legPend;if(!p||combatT>p.until||p.seen.has(tg))return;p.seen.add(tg);if(p.seen.size>5)return;const L=p.L;
  if(L.sky==='bolt'){fx.push({line:1,x1:tg.x+rnd(-10,10),y1:tg.y-170,x2:tg.x,y2:tg.y-8,life:.35,max:.35,col:'#ffe14d',w:3,filter:L.hue});}
  else if(L.sky)pfx(L.sky,tg.x,tg.y-40,{sc:FXM[L.sky]&&FXM[L.sky][1]>200?.35:.8,force:1,filter:L.hue});
  L.impact.forEach((s,i)=>schedule(i*.06,()=>pfx(s,tg.x,tg.y-12,{sc:Math.max(.45,Math.min(1.4,70/(FXM[s]?FXM[s][1]:70))),force:1,filter:L.hue})));
  CINE.shake=Math.max(CINE.shake,p.seen.size===1?.45:.25);CINE.flash=Math.max(CINE.flash,.18);CINE.flashCol=L.col;}
// combat time slows while a cinematic is up
const cineSlow=()=>performance.now()<CINE.slowUntil?.3:1;
// screen-space overlay: spotlight, tint, banner, flash
function drawCine(dtReal){const g=ctx;g.save();g.setTransform(1,0,0,1,0,0);
  if(CINE.on){const k=(performance.now()-CINE.t0)/CINE.dur;if(k>=1||!CINE.c||mode!=='combat')CINE.on=false;else{
    const a=k<.15?k/.15:k>.75?(1-k)/.25:1,c=CINE.c,q=w2s(c.x,c.y-14),cx=q.x*2,cy=q.y*2;
    const gr=g.createRadialGradient(cx,cy,30,cx,cy,520);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.25,`rgba(0,0,0,${.25*a})`);gr.addColorStop(1,`rgba(0,0,0,${.62*a})`);
    g.fillStyle=gr;g.fillRect(0,0,cv.width,cv.height);if(CINE.L.tint){g.globalAlpha=a;g.fillStyle=CINE.L.tint;g.fillRect(0,0,cv.width,cv.height);g.globalAlpha=1;}
    // banner: name sweeps in from the left on a colour band
    const sx=k<.2?-700+(k/.2)*700:k>.8?(k-.8)/.2*900:0,by=cv.height*.7;
    g.globalAlpha=a;g.fillStyle='rgba(10,14,20,.78)';g.fillRect(0,by-46,cv.width,78);g.fillStyle=CINE.L.col;g.fillRect(0,by-46,cv.width,4);g.fillRect(0,by+28,cv.width,4);
    g.textAlign='center';g.font='16px PokeEmerald,"Pixelify Sans",sans-serif';g.fillStyle='#e9efe6';g.fillText(CINE.who.toUpperCase(),640+sx,by-20);
    g.font='48px PokeEmerald,"Pixelify Sans",sans-serif';g.lineWidth=8;g.strokeStyle='#1b2430';g.strokeText(CINE.name,640+sx,by+18);g.fillStyle=CINE.L.col;g.fillText(CINE.name,640+sx,by+18);g.globalAlpha=1;}}
  if(CINE.flash>0){g.globalAlpha=Math.min(.55,CINE.flash*2);g.fillStyle=CINE.flashCol;g.globalCompositeOperation='lighter';g.fillRect(0,0,cv.width,cv.height);g.globalCompositeOperation='source-over';g.globalAlpha=1;CINE.flash=Math.max(0,CINE.flash-dtReal);}
  g.restore();}
function cineShake(dtReal){if(CINE.shake<=0)return{x:0,y:0};CINE.shake=Math.max(0,CINE.shake-dtReal);const m=CINE.shake*14;return{x:rnd(-m,m),y:rnd(-m,m)};}
