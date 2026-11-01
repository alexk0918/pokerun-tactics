/* ================= PMD particle player =================
   Every visual effect in combat is a real Pokémon Mystery Dungeon particle sheet
   (assets/fx, from PMDCollab RawAsset). Sheets are horizontal strips of square frames;
   directional sheets (Dir8) have one row per facing in PMD order: down, down-right,
   right, up-right, up, up-left, left, down-left. */
const FXIMG={};
function fxImg(n){let im=FXIMG[n];if(!im){im=FXIMG[n]=new Image();im.src='assets/fx/'+n+'.png';}return im;}
const fxOk=n=>!!FXM[n];

// per-type looks: impact, projectile, and a default size (scale) for each
const TFX={
  Normal:  {hit:'Hit_Neutral',hs:.55,shot:'Swift_Star',ss:1},
  Fire:    {hit:'Fire_Fang_Hit',hs:.5,shot:'Ember',ss:1},
  Water:   {hit:'Bubble_Pop_Blue',hs:1.3,shot:'Bubbles_Blue',ss:1.2},
  Grass:   {hit:'Leaf_Storm_Hit',hs:.85,shot:'Razor_Leaf',ss:.7},
  Electric:{hit:'Spark',hs:.42,shot:'Charge_Beam_Shot',ss:.75},
  Ice:     {hit:'Ice_Fang_Hit',hs:.38,shot:'Ice_Shard',ss:.6},
  Fighting:{hit:'Force_Palm_Hit',hs:.5,shot:'Aura_Sphere_Shot',ss:.7},
  Poison:  {hit:'Sludge',hs:1,shot:'Poison_Ball_Ranger',ss:.55},
  Ground:  {hit:'Mud_Bomb_Hit',hs:.42,shot:'Mud_Shot_Ball',ss:.6},
  Flying:  {hit:'Gust_Wind',hs:.65,shot:'Air_Slash_Particle',ss:1.2},
  Psychic: {hit:'Zen_Headbutt_Hit',hs:.6,shot:'Psycho_Cut_Shot',ss:.75},
  Bug:     {hit:'Bug_Bite',hs:.45,shot:'String_Shot_Ball',ss:1},
  Rock:    {hit:'Rock_Smash',hs:.45,shot:'Rock_Piece_Rotating',ss:1.2},
  Ghost:   {hit:'Shadow_Claw_Hit',hs:.6,shot:'Shadow_Ball',ss:.9},
  Dragon:  {hit:'Dragon_Rush_Front',hs:.42,shot:'Dragon_Pulse_Ball',ss:.6},
  Dark:    {hit:'Night_Slash_Hit',hs:.5,shot:'Psycho_Cut_Shot_Dark',ss:.75},
  Steel:   {hit:'Metal_Burst_Hit',hs:1.2,shot:'Metal_Ball_Ranger',ss:.6},
  Fairy:   {hit:'Captivate_Sparkles',hs:.5,shot:'Light_Ball_Pink',ss:.22},
};
// colour families for generic bursts and rings
const PUFFS={Black:[40,40,50],Blue:[80,140,255],Brown:[150,100,60],Green:[90,200,90],Pink:[255,130,200],Purple:[150,90,220],Red:[240,80,70],White:[235,240,245],Yellow:[255,220,80]};
const CIRC={Blue:'Blue',Green:'Green',Pink:'Pink',Purple:'Purple',Red:'Red',White:'White',Yellow:'Yellow',Black:'Purple',Brown:'Red'};
function hexRGB(c){if(!c||c[0]!=='#')return[255,255,255];if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1,7),16);return[n>>16&255,n>>8&255,n&255];}
const cdist=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
const FXCOL={};
function colFamily(col){if(FXCOL[col])return FXCOL[col];const c=hexRGB(col);let best='White',bd=1e9;for(const k in PUFFS){const d=cdist(c,PUFFS[k]);if(d<bd){bd=d;best=k;}}return FXCOL[col]=best;}
const TYPECOL={};
function typeOfCol(col){if(col in TYPECOL)return TYPECOL[col];const c=hexRGB(col);let best=null,bd=2600;for(const k in TFX){if(!TYPES[k])continue;const d=cdist(c,hexRGB(TYPES[k]));if(d<bd){bd=d;best=k;}}return TYPECOL[col]=best;}

// frame time: short sheets play at PMD speed, long ones are sped up to stay snappy
function fxFT(frames){return frames<=10?.055:Math.max(.022,.62/frames);}
let fxRecent=[];
/* play a particle once. o: {sc, sy (vertical squash), alpha, row, ft, loop (seconds), back (draw under units), add (additive), follow (unit)} */
function pfx(name,x,y,o={}){
  if(typeof SIM!=='undefined'&&SIM.on)return null;const m=FXM[name];if(!m)return null;
  if(!o.force&&OPTS.fx<2&&fx.filter(q=>q.pmd).length>5)return null;
  if(!o.force){const now=performance.now();fxRecent=fxRecent.filter(r=>now-r.t<90);if(fxRecent.some(r=>r.n===name&&Math.abs(r.x-x)<8&&Math.abs(r.y-y)<8))return null;fxRecent.push({n:name,x,y,t:now});}
  const ft=o.ft||fxFT(m[0]),dur=o.loop||m[0]*ft;
  const p={pmd:name,x,y,fr:m[0],sz:m[1],rows:m[2],row:o.row||0,ft,t:0,life:dur,max:dur,sc:o.sc||1,sy:o.sy||1,alpha:o.alpha??1,add:o.add,back:o.back,follow:o.follow,oy:o.oy||0,vy:o.vy||0,vx:0,g:0,fade:o.fade,filter:o.filter};
  fxImg(name);fx.push(p);return p;
}
function drawPfx(p){const im=FXIMG[p.pmd];if(!im||!im.complete||!im.naturalWidth)return;
  let f=Math.floor(p.t/p.ft);f=p.loopAnim?f%p.fr:Math.min(p.fr-1,f);
  const s=p.sz,w=s*p.sc,h=s*p.sc*p.sy,x=p.follow?p.follow.x:p.x,y=p.follow?p.follow.y+p.oy:p.y;
  ctx.globalAlpha=p.alpha*(p.fade?Math.min(1,p.life/p.max*2):1);if(p.add)ctx.globalCompositeOperation='lighter';if(p.filter)ctx.filter=p.filter;
  ctx.drawImage(im,f*s,(p.row%p.rows)*s,s,s,Math.round(x-w/2),Math.round(y-h/2),Math.round(w),Math.round(h));
  if(p.filter)ctx.filter='none';if(p.add)ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}

/* type-flavoured impact on a unit */
function typeHit(tg,type,scale=1){const T=TFX[type]||TFX.Normal;return pfx(T.hit,tg.x+rnd(-3,3),tg.y-11+rnd(-3,3),{sc:T.hs*scale});}
function typeOf(c){return(c&&c.mv&&c.mv.t)||(c&&D[c.dex]&&D[c.dex].t[0])||'Normal';}
/* projectile look for a shooter */
function shotLook(type){const T=TFX[type]||TFX.Normal;return{pmd:T.shot,ss:T.ss};}
function drawShot(p){const m=FXM[p.pmd];if(!m){return false;}const im=fxImg(p.pmd);if(!im.complete||!im.naturalWidth)return true;
  p.at=(p.at||0)+1/60;const ft=m[0]<=10?.06:.04,f=Math.floor(p.at/ft)%m[0],s=m[1];
  let row=0;if(m[2]>1){const q=p.trail.length?p.trail[p.trail.length-1]:{x:p.x-1,y:p.y};row=m[2]>=8?dirFrom(p.x-q.x,p.y-q.y):0;}
  const w=s*(p.ss||1);ctx.globalAlpha=1;
  // faded afterimages of the same sprite instead of square trails
  p.trail.forEach((q,i)=>{if(i%2)return;ctx.globalAlpha=(i+1)/p.trail.length*.35;ctx.drawImage(im,f*s,row*s,s,s,Math.round(q.x-w/2),Math.round(q.y-w/2),Math.round(w),Math.round(w));});
  ctx.globalAlpha=1;ctx.drawImage(im,f*s,row*s,s,s,Math.round(p.x-w/2),Math.round(p.y-w/2),Math.round(w),Math.round(w));return true;}

/* generic replacements for the old pixel bursts */
function pmdBurst(x,y,col,n,pow){const ty=typeOfCol(col),k=Math.max(.7,Math.min(1.6,.6+n/30))*Math.max(.8,Math.min(1.5,pow||1));
  if(ty){const T=TFX[ty];pfx(T.hit,x,y,{sc:T.hs*k});}else pfx('Puff_'+colFamily(col),x,y,{sc:.8*k});}
function pmdRing(x,y,col){const f=CIRC[colFamily(col)]||'White';pfx('Circle_'+f+'_Out',x,y,{sc:.62,sy:.55,alpha:.9});}
function pmdSpark(x,y,col,n){pfx(n>=8?'Hit_Super_Effective':'Hit_Neutral',x,y,{sc:n>=8?.5:.4});}

/* persistent status visuals, refreshed from update() */
function statusFx(u,dt){if(u.dead||OPTS.fx<2)return;u.sfxT=(u.sfxT||0)-dt;
  if(u.shield>0&&!u.shOn){u.shOn=1;pfx('Protect',0,0,{follow:u,oy:-12,sc:.5,alpha:.55,force:1});}else if(u.shield<=0)u.shOn=0;
  if(u.sfxT>0)return;u.sfxT=.75;
  if(u.stun>0)pfx('Lucky_Chant_Star_Yellow',0,0,{follow:u,oy:-30,sc:1,force:1});
  else if(u.burn)pfx('Ember',u.x+rnd(-5,5),u.y-8,{sc:.75,force:1});
  else if(u.poison)pfx('Bubbles_Purple',u.x+rnd(-5,5),u.y-12,{sc:.9,force:1});
  else if(u.chill)pfx('Ice_Shard_Hit_Sparkle',u.x+rnd(-6,6),u.y-14,{force:1});
  else if(u.para)pfx('Spark',u.x+rnd(-5,5),u.y-12,{sc:.22,force:1});
  else if(u.conf)pfx('Lucky_Chant_Star_Violet',0,0,{follow:u,oy:-30,force:1});
  else if(u.seed)pfx('Leech_Seed_Sprout',u.x+rnd(-5,5),u.y-6,{force:1});}

/* a chest from PMD treasure boxes: brown (floor), purple (alpha or challenge), white/silver (act boss) */
const BOXIMG={};
function boxImg(t){return BOXIMG[t]||(BOXIMG[t]=Object.assign(new Image(),{src:'assets/items/box-'+t+'.png'}));}
function chestTier(){const fk=floorKind(run.floor),nk=typeof nodeK==='function'?nodeK(run.floor):'';return fk==='elite'||fk==='boss'?'silver':(nk==='alpha'||nk==='challenge'||run.pendingRelic)?'rare':'normal';}
function drawPmdChest(c,t){
  const im=boxImg(c.tier||'normal'),sc=c.tier==='silver'?2.4:c.tier==='rare'?2.2:2,x=Math.round(c.x),bob=c.open?0:-Math.abs(Math.sin(t*3))*2,y=Math.round(c.y-6+bob);
  ctx.fillStyle='rgba(10,30,10,.35)';ctx.beginPath();ctx.ellipse(x,c.y+3,11*sc/2,3.5,0,0,7);ctx.fill();
  if(im.complete&&im.naturalWidth){let w=16*sc,a=1;if(c.open){const k=Math.min(1,(c.t-(c.openAt||0))/.4);a=1-k;w*=1+k*.5;}
    if(a>0){ctx.globalAlpha=a;ctx.drawImage(im,Math.round(x-w/2),Math.round(y-w/2-(c.open?(w-16*sc)*.5:0)),Math.round(w),Math.round(w));ctx.globalAlpha=1;}}
}
function openChestFx(c){c.openAt=c.t;pfx('Moonlight_Sparkles',c.x,c.y-20,{sc:1.1,force:1});pfx('Circle_Yellow_Out',c.x,c.y-4,{sc:.7,sy:.55,force:1});pfx('Hit_Super_Effective',c.x,c.y-10,{sc:.7,force:1});}
// warm the cache for the sheets used most
for(const k in TFX){fxImg(TFX[k].hit);fxImg(TFX[k].shot);}
['Protect','Chest_Light','Chest_Open','Moonlight_Sparkles','Lucky_Chant_Star_Yellow','Hit_Neutral','Hit_Super_Effective'].forEach(fxImg);

/* PMD beams for line effects (chains, lasers): Column_<colour> cross-sections that swell and fade,
   or RSE lightning tiles for yellow/electric links */
const BEAMIMG={};
function beamImg(n){return BEAMIMG[n]||(BEAMIMG[n]=Object.assign(new Image(),{src:'assets/beam/'+n+'/Body.png'}));}
function drawBeamFx(p){
  const fam=colFamily(p.col),dx=p.x2-p.x1,dy=p.y2-p.y1,len=Math.hypot(dx,dy);if(len<2)return true;
  const ang=Math.atan2(dy,dx),k=1-Math.max(0,p.life)/p.max;
  const zap=fam==='Yellow'&&!p.solid;const im=beamImg(zap?'Lightning_RSE':'Column_'+(fam==='Brown'?'Tan':fam));
  if(!im.complete||!im.naturalWidth)return false;
  ctx.save();if(p.filter)ctx.filter=p.filter;ctx.translate(p.x1,p.y1);ctx.rotate(ang-Math.PI/2);ctx.globalAlpha=Math.min(1,p.life/p.max*2.5);
  if(zap){const f=(Math.floor(k*8)%2)*2,th=14+(p.w||1)*4;for(let y=0;y<len;y+=th){const h=Math.min(th,len-y);ctx.drawImage(im,f*32,0,32,32*h/th,-th/2,y,th,h);}}
  else{const f=Math.min(13,Math.floor(k*14)),th=5+(p.w||1)*3;ctx.drawImage(im,f*32,0,32,1,-th/2,0,th,len);}
  ctx.restore();ctx.globalAlpha=1;return true;}
