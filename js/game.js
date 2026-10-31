"use strict";
/* PokéRun Tactics — data-driven build covering every Pokémon (#1–1025).
   Moves and trait numbers are placeholders until each one gets a real design. */

/* ================= Static tables ================= */
const TYPES={Normal:'#9a9a72',Fire:'#ea7a2c',Water:'#4a7fe0',Grass:'#5fae45',Electric:'#e0b415',Ice:'#5cc4c6',Fighting:'#c03a2b',Poison:'#9a45a4',
  Ground:'#c9a24f',Flying:'#8f7ad8',Psychic:'#ec5a87',Bug:'#93a51c',Rock:'#b29d3b',Ghost:'#6a5294',Dragon:'#6a3cf0',Dark:'#6b5646',Steel:'#8f93b0',Fairy:'#e07fb0'};
const REGIONS=['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar','Paldea'];
const REGCOL=['#c9483c','#b8901c','#23897d','#5a6fc0','#45454f','#2f74b5','#e07a2f','#7a3fa8','#c23a5a'];
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX'];
const STARTERS=[[1,4,7],[152,155,158],[252,255,258],[387,390,393],[495,498,501],[650,653,656],[722,725,728],[810,813,816],[906,909,912]]; // grass, fire, water
const MOVES={Normal:['Body Slam','Hyper Voice'],Fire:['Flare Blitz','Flamethrower'],Water:['Waterfall','Surf'],Grass:['Leaf Blade','Energy Ball'],
  Electric:['Wild Charge','Thunderbolt'],Ice:['Ice Punch','Ice Beam'],Fighting:['Close Combat','Aura Sphere'],Poison:['Poison Jab','Sludge Bomb'],
  Ground:['Earthquake','Earth Power'],Flying:['Brave Bird','Air Slash'],Psychic:['Zen Headbutt','Psychic'],Bug:['X-Scissor','Bug Buzz'],
  Rock:['Stone Edge','Power Gem'],Ghost:['Shadow Claw','Shadow Ball'],Dragon:['Dragon Claw','Dragon Pulse'],Dark:['Crunch','Dark Pulse'],
  Steel:['Iron Head','Flash Cannon'],Fairy:['Play Rough','Moonblast']};
const HEALNAME={Normal:'Wish',Fairy:'Moonlight',Grass:'Synthesis',Psychic:'Heal Pulse',Water:'Life Dew'};
const GUARDNAME={Steel:'Iron Defense',Rock:'Harden',Ground:'Harden',Grass:'Ingrain',Water:'Withdraw',Bug:'Harden',Psychic:'Barrier',Ice:'Barrier',Ghost:'Protect',Normal:'Protect',Fairy:'Protect',Poison:'Acid Armor',Dragon:'Protect',Dark:'Protect',Fighting:'Bulk Up',Fire:'Protect',Electric:'Protect',Flying:'Roost'};
const STUNTYPES=new Set(['Electric','Ice','Rock','Ground']);
const KIND_TXT={
  strike:(v,st)=>`Hits the target for <b>${v}</b> damage${st?' and stuns it for 0.75s':''}.`,
  dash:v=>`Dashes at the weakest enemy for <b>${Math.round(v*1.1)}</b> damage.`,
  blast:(v,st)=>`Blasts the target for <b>${v}</b> damage and adjacent enemies for <b>${Math.round(v*.5)}</b>${st?', stunning the target for 0.75s':''}.`,
  guard:v=>`Gains a <b>${Math.round(v*1.4)}</b> HP shield, then strikes for <b>${Math.round(v*.4)}</b> damage.`,
  heal:v=>`Restores <b>${Math.round(v*1.1)}</b> HP to the most injured ally.`,
};
// Type traits (breakpoints 2 / 4). e = stat effects per tier.
const TT={
  Normal:{e:[{hp:.2},{hp:.4}],d:'+20% / +40% max HP.'},
  Fire:{e:[{dmg:.15},{dmg:.35}],d:'+15% / +35% damage.'},
  Water:{e:[{mana:25},{mana:50}],d:'Start battle with +25 / +50 PP.'},
  Grass:{e:[{regen:.02},{regen:.04}],d:'Restore 2% / 4% max HP per second.'},
  Electric:{e:[{as:.15},{as:.35}],d:'+15% / +35% Attack Speed.'},
  Ice:{e:[{crit:.15},{crit:.3}],d:'15% / 30% chance to land a 1.5x critical hit.'},
  Fighting:{e:[{dmg:.1,as:.1},{dmg:.2,as:.2}],d:'+10% / +20% damage and Attack Speed.'},
  Poison:{e:[{ab:.2},{ab:.45}],d:'Moves deal +20% / +45% damage.'},
  Ground:{e:[{armor:20},{armor:45}],d:'+20 / +45 Armor.'},
  Flying:{e:[{dodge:.12},{dodge:.25}],d:'12% / 25% chance to dodge attacks.'},
  Psychic:{e:[{ab:.25,mana:10},{ab:.5,mana:20}],d:'Moves deal +25% / +50% damage. +10 / +20 starting PP.'},
  Bug:{e:[{as:.2},{as:.4}],d:'+20% / +40% Attack Speed.'},
  Rock:{e:[{shield:.2},{shield:.4}],d:'Start battle with a shield of 20% / 40% max HP.'},
  Ghost:{e:[{ls:.15},{ls:.3}],d:'Heal for 15% / 30% of damage dealt.'},
  Dragon:{e:[{hp:.15,dmg:.1},{hp:.3,dmg:.2}],d:'+15% / +30% max HP and +10% / +20% damage.'},
  Dark:{e:[{crit:.2,dmg:.05},{crit:.4,dmg:.1}],d:'20% / 40% crit chance and +5% / +10% damage.'},
  Steel:{e:[{dr:.1},{dr:.22}],d:'Take 10% / 22% less damage.'},
  Fairy:{e:[{regen:.01,mana:15},{regen:.02,mana:30}],d:'Restore 1% / 2% max HP per second. +15 / +30 starting PP.'},
};
const RT={ // region traits, National mode only
  Kanto:{e:[{hp:.15},{hp:.3}],d:'+15% / +30% max HP.'},
  Johto:{e:[{as:.15},{as:.3}],d:'+15% / +30% Attack Speed.'},
  Hoenn:{e:[{shield:.15},{shield:.3}],d:'Shield of 15% / 30% max HP.'},
  Sinnoh:{e:[{armor:15},{armor:35}],d:'+15 / +35 Armor.'},
  Unova:{e:[{dmg:.12},{dmg:.25}],d:'+12% / +25% damage.'},
  Kalos:{e:[{mana:20},{mana:40}],d:'Start battle with +20 / +40 PP.'},
  Alola:{e:[{regen:.015},{regen:.03}],d:'Restore 1.5% / 3% max HP per second.'},
  Galar:{e:[{hp:.1,dmg:.08},{hp:.2,dmg:.15}],d:'+10% / +20% max HP and +8% / +15% damage.'},
  Paldea:{e:[{crit:.15},{crit:.3}],d:'15% / 30% crit chance.'},
};
const BP=[2,4];
const STRATS=[
  {id:'ember',name:'Ember Gambit',type:'Fire',si:1,risk:'Aggressive',pts:['Fire Pokémon deal +15% damage.','Win streaks of 2+ pay an extra ₽1 per win.','Losses cost 2 more Trainer HP.'],guide:'Build around Fire. Push your streak.'},
  {id:'tidal',name:'Tidal Fortress',type:'Water',si:2,risk:'Steady',pts:['Start with 125 Trainer HP.','Your Pokémon take 10% less damage.','Water Pokémon start with +10 PP.'],guide:'Hold the line with Water tanks.'},
  {id:'verdant',name:'Verdant Investment',type:'Grass',si:0,risk:'Scaling',pts:['Start each floor with ₽10+ saved to raise your income by ₽1 (up to ₽4).','Grass Pokémon restore +1% max HP per second.'],guide:'Save early, spend late. Grass sustains.'},
];
const AUGS={
  silver:[{id:'berry',name:'Berry Basket',d:'Gain ₽6 right now.'},{id:'quickclaw',name:'Quick Claw',d:'Your team gains +12% Attack Speed.'},{id:'oran',name:'Oran Rations',d:'Your team gains +120 max HP.'}],
  gold:[{id:'rarecandy',name:'Rare Candy',d:'Gain a random 2★ Pokémon on your bench.'},{id:'focusband',name:'Focus Band',d:'Once per battle, each of your Pokémon survives a fainting blow with 1 HP.'},{id:'muscleband',name:'Muscle Band',d:'Your team deals +18% damage.'}],
  prismatic:[{id:'resolve',name:"Trainer's Resolve",d:'+1 team size for the rest of the run.'},{id:'amulet',name:'Amulet Coin',d:'Gain an extra ₽3 at the start of every floor.'},{id:'champion',name:"Champion's Belt",d:'Your team deals +30% damage and gains +15% Attack Speed.'}],
};
const ACTS=[{name:'Verdant Clearing'},{name:'Ember Canyon'},{name:'Tidepool Grotto'}];
const FLOORS=15;
const STARM=[1,1.8,3.24], ABM=[1,1.6,2.6];
const floorKind=f=>f<=3?'wild':(f===5||f===10)?'elite':f===15?'boss':'trainer';
const teamCap=f=>(f<=2?2:f<=4?3:f<=7?4:f<=10?5:f<=13?6:7)+(run&&run.aug&&run.aug.id==='resolve'?1:0);
const ODDS=f=>f<=3?[.75,.25,0,0,0]:f<=6?[.5,.35,.15,0,0]:f<=9?[.3,.35,.25,.1,0]:f<=12?[.2,.3,.3,.17,.03]:[.15,.25,.3,.22,.08];
const TRAINERS=['Youngster Ben','Lass Mira','Bug Catcher Rik','Picnicker Jo','Camper Theo','Hiker Bram','Beauty Celine','Ace Trainer Noor','Bird Keeper Paz','Fisher Wen','Ranger Ash','Twins Ada & Ida'];
const RIVALS=['Rival Kade','Rival Sora'];

/* ================= Helpers ================= */
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=n=>String(n).padStart(4,'0');
const por=dex=>`assets/${pad(dex)}/portrait.png`;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= Pokédex & modes ================= */
let D={}, KIDS={}, SM={}, ROOTS=[];
let MODE=null;
function family(i){const out=[i];for(const k of KIDS[i]||[])out.push(...family(k));return out;}
function buildMode(id){
  const gen=id==='nat'?0:+id.slice(3);
  let S;
  if(!gen)S=new Set(Object.keys(D).map(Number));
  else{S=new Set();for(const r of ROOTS){const f=family(r);if(f.some(i=>D[i].g===gen))f.filter(i=>D[i].g<=gen).forEach(i=>S.add(i));}}
  const kids=i=>(KIDS[i]||[]).filter(k=>S.has(k));
  const sub=i=>{const o=[i];for(const k of kids(i))o.push(...sub(k));return o;};
  const roots=[...S].filter(i=>!D[i].f||!S.has(D[i].f)).sort((a,b)=>a-b);
  const lines={};
  for(const r of roots){
    const mem=sub(r),mx=Math.max(...mem.map(i=>D[i].bst)),stages=depth(r,kids);
    lines[r]={root:r,mem,stages,leg:mem.some(i=>D[i].L||D[i].M),score:mx-(stages-1)*30+mx/1000,region:Math.min(...mem.map(i=>D[i].g))-1};
  }
  // cost tiers by rank within the mode: 25% / 30% / 28% / 17% of non-legendary lines, legendaries and mythicals = 5
  const ranked=roots.filter(r=>!lines[r].leg).sort((a,b)=>lines[a].score-lines[b].score);
  const cuts=[.25,.55,.83];
  ranked.forEach((r,i)=>{const q=i/ranked.length;lines[r].cost=q<cuts[0]?1:q<cuts[1]?2:q<cuts[2]?3:4;});
  for(const r of roots)if(lines[r].leg)lines[r].cost=5;
  const byCost=[1,2,3,4,5].map(c=>roots.filter(r=>lines[r].cost===c));
  const starGen=gen||1+Math.floor(Math.random()*9);
  return{id,gen,S,kids,roots,lines,byCost,starGen,label:gen?`Gen ${ROMAN[gen-1]}`:'National',region:gen?REGIONS[gen-1]:'National Dex'};
}
function depth(i,kids){return 1+Math.max(0,...kids(i).map(k=>depth(k,kids)));}
const lineOf=u=>MODE.lines[u.root];
const nameOf=u=>D[u.dex].n;
function finalOf(dex){let d=dex;for(let i=0;i<3;i++){const k=MODE.kids(d);if(!k.length)break;d=pick(k);}return d;}

/* derived unit stats: species shape × cost tier × star */
function kindOf(dex){
  const s=D[dex].s,t=D[dex].t[0];
  const special=s[3]>s[1]*1.1;
  const bulk=(s[0]+s[2]+s[4])/3,off=(s[1]+s[3]+s[5])/3;
  const tanky=bulk>off*1.15;
  if(tanky&&special&&HEALNAME[t]&&s[4]>=s[2])return'heal';
  if(tanky)return'guard';
  if(special)return'blast';
  if(s[5]>=90&&s[5]>=s[1]*.9)return'dash';
  return'strike';
}
function moveName(dex){const k=kindOf(dex),t=D[dex].t[0];
  if(k==='heal')return HEALNAME[t];if(k==='guard')return GUARDNAME[t];return MOVES[t][k==='blast'?1:0];}
function roleOf(dex){return{heal:'Support',guard:'Tank',blast:'Caster',dash:'Assassin',strike:'Bruiser'}[kindOf(dex)];}
function unitStats(dex,cost,star){
  const sp=D[dex],s=sp.s,avg=sp.bst/6,r=x=>clamp(x/avg,.4,2),sm=STARM[star-1];
  const k=kindOf(dex);
  return{
    hp:(420+cost*110)*sm*(.65+.35*r(s[0])),
    atk:(38+cost*9)*sm*(.6+.4*r(Math.max(s[1],s[3]))),
    armor:clamp(10+28*r((s[2]+s[4])/2),8,75),
    as:clamp(.5+.25*r(s[5]),.45,1.1),
    range:k==='heal'||k==='blast'?(k==='heal'?2:3):1,
    mana:k==='guard'?90:k==='heal'?80:70, start:k==='guard'?30:10,
    kind:k, v:(110+cost*45)*ABM[star-1],
  };
}

/* ================= Canvas ================= */
const W=640,H=360;
const cv=$('cv'), ctx=cv.getContext('2d');
const stage=$('stage');
function fit(){const w=innerWidth-32,h=innerHeight-16;const s=Math.min(w/1280,h/720);stage.style.transform=`scale(${s})`;stage.style.margin=`${(720*s-720)/2}px ${(1280*s-1280)/2}px`;}
addEventListener('resize',fit);fit();
const R=17,HW=Math.sqrt(3)*R,SQ=0.78,RS=1.5*R*SQ,COLS=7,ROWS=8;
const BX=320-(COLS*HW+HW/2)/2+HW/2, BY=56;
const hexXY=(c,r)=>({x:BX+c*HW+(r&1?HW/2:0),y:BY+r*RS});
const BENCH_Y=246, BENCH_N=9, BENCH_DX=29;
const benchXY=i=>({x:320+(i-(BENCH_N-1)/2)*BENCH_DX,y:BENCH_Y});
const cube=(c,r)=>{const x=c-(r-(r&1))/2;return[x,-x-r,r];};
const hdist=(a,b)=>{const p=cube(a.c,a.r),q=cube(b.c,b.r);return Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]),Math.abs(p[2]-q[2]));};
function nbrs(c,r){const d=(r&1)?[[1,0],[-1,0],[1,-1],[0,-1],[1,1],[0,1]]:[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]];
  return d.map(([dc,dr])=>({c:c+dc,r:r+dr})).filter(h=>h.c>=0&&h.c<COLS&&h.r>=0&&h.r<ROWS);}
function hexPath(g,x,y,rad,sq){g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);g.lineTo(x+rad*Math.cos(a),y+rad*Math.sin(a)*sq);}g.closePath();}

/* ================= Sprites (loaded on demand) ================= */
const SPR={}, LOADING={};
function loadImg(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});}
function ensure(dex){
  if(SPR[dex])return Promise.resolve(SPR[dex]);
  if(LOADING[dex])return LOADING[dex];
  return LOADING[dex]=(async()=>{
    const m=SM[dex]||null,k=pad(dex),s={m,img:{},por:null,top:-22,k:m&&m.a.Idle?Math.min(1,60/m.a.Idle[2]):1};
    const jobs=[loadImg(por(dex)).then(i=>s.por=i)];
    if(m)for(const[w,v]of Object.entries(m.a))jobs.push(loadImg(`assets/${k}/${v[0]}.png`).then(i=>s.img[w]=i));
    await Promise.all(jobs);
    if(m&&s.img.Idle){try{const a=m.a.Idle,fw=a[1],fh=a[2];const c=document.createElement('canvas');c.width=fw;c.height=fh;const g=c.getContext('2d');g.drawImage(s.img.Idle,0,0,fw,fh,0,0,fw,fh);
      const d=g.getImageData(0,0,fw,fh).data;let top=fh/2;outer:for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)if(d[(y*fw+x)*4+3]>10){top=y;break outer;}s.top=top-fh/2;}catch(e){s.top=-14;}}
    else if(m)s.m=null;
    SPR[dex]=s;return s;
  })();
}
const preload=(list,ms=4000)=>Promise.race([Promise.all([...new Set(list)].map(ensure)),new Promise(r=>setTimeout(r,ms))]);
const DIR={down:0,dr:1,right:2,ur:3,up:4,ul:5,left:6,dl:7};
function dirFrom(dx,dy){const a=Math.atan2(dy,dx);const o=Math.round(a/(Math.PI/4));return[2,1,0,7,6,5,4,3][(o+8)%8];}
function animOf(dex,anim){const s=SPR[dex];if(!s||!s.m)return null;return s.m.a[anim]&&s.img[anim]?s.m.a[anim]:(anim==='Faint'&&s.m.a.Hurt?s.m.a.Hurt:s.m.a.Idle);}
function animLen(dex,anim){const a=animOf(dex,anim);return a?a[3].reduce((x,y)=>x+y,0)/60:.5;}
function hitTime(dex,anim){const a=animOf(dex,anim);if(!a)return .25;if(a[4]<0)return animLen(dex,anim)*.5;let t=0;for(let i=0;i<a[4];i++)t+=a[3][i];return t/60;}
function drawSprite(dex,anim,t,dir,x,y,{loop=true,alpha=1,scale=1}={}){
  const s=SPR[dex];if(!s){ensure(dex);return;}
  ctx.globalAlpha=alpha;
  if(!s.m){ // no PMD sprite yet: bobbing portrait token
    if(s.por){const b=Math.round(Math.sin(t*4)*1.5),z=Math.round(24*scale);
      ctx.fillStyle='#1b2430';ctx.fillRect(Math.round(x-z/2)-1,Math.round(y-z/2-4+b)-1,z+2,z+2);ctx.drawImage(s.por,Math.round(x-z/2),Math.round(y-z/2-4+b),z,z);}
    ctx.globalAlpha=1;return;}
  let name=anim;if(!s.m.a[name]||!s.img[name])name=(anim==='Faint'&&s.img.Hurt)?'Hurt':'Idle';
  const a=s.m.a[name],im=s.img[name];if(!im){ctx.globalAlpha=1;return;}
  const fw=a[1],fh=a[2],d=a[3],total=d.reduce((p,q)=>p+q,0);
  let f=Math.floor(t*60);f=loop?f%total:Math.min(f,total-1);let i=0;while(f>=d[i]){f-=d[i];i++;}
  scale*=s.k;const rows=Math.round(im.height/fh),row=rows>=8?dir:0,w=fw*scale,h=fh*scale;
  ctx.drawImage(im,i*fw,row*fh,fw,fh,Math.round(x-w/2),Math.round(y-h/2),w,h);
  ctx.globalAlpha=1;
}

/* ================= Environment (Act I forest clearing) ================= */
let BG=null;
function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;}
function vnoise(x,y,sc,s){const X=Math.floor(x/sc),Y=Math.floor(y/sc),fx=x/sc-X,fy=y/sc-Y;const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=hash(X,Y,s),b=hash(X+1,Y,s),c=hash(X,Y+1,s),d=hash(X+1,Y+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
const hex2rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function renderForest(){
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const img=g.createImageData(W,H),Dd=img.data;
  const inner=['#6aa646','#78b44f','#86c25a','#94cc66'].map(hex2rgb),outer=['#2f6630','#3a7434','#44803a','#4f8e3e'].map(hex2rgb),dirt=['#9a7d4c','#a98a56','#b89a62'].map(hex2rgb);
  const CX=320,CY=150,RX=250,RY=150;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const d=Math.hypot((x-CX)/RX,(y-CY)/RY)+(vnoise(x,y,22,3)-.5)*.22;
    const n=vnoise(x,y,9,1)*.7+vnoise(x,y,3,2)*.3;const dither=((x+y)&1)?.06:-.06;let pal,idx;
    if(d<.92){pal=inner;idx=clamp(Math.floor((n+dither)*4),0,3);const dn=vnoise(x,y,30,7);if(dn>.72&&Math.abs(y-CY)>40&&d>.55){pal=dirt;idx=clamp(Math.floor((n+dither)*3),0,2);}}
    else if(d<1.0){const t=(d-.92)/.08;pal=(hash(x,y,5)<t)?outer:inner;idx=clamp(Math.floor((n+dither)*4),0,3);if(pal===inner)idx=Math.max(0,idx-1);}
    else{pal=outer;idx=clamp(Math.floor((n+dither)*4-(d-1)*3),0,3);}
    const col=pal[idx];const o=(y*W+x)*4;Dd[o]=col[0];Dd[o+1]=col[1];Dd[o+2]=col[2];Dd[o+3]=255;
  }
  g.putImageData(img,0,0);
  const px=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
  for(let i=0;i<520;i++){const x=rnd(0,W),y=rnd(0,H);const d=Math.hypot((x-CX)/RX,(y-CY)/RY);if(d>1.02)continue;const dark=d<.9?'#5b9a3f':'#3a7434';px(x,y,1,2,dark);px(x+2,y-1,1,3,dark);px(x+4,y,1,2,dark);}
  for(let i=0;i<120;i++){const x=rnd(0,W),y=rnd(0,H);const d=Math.hypot((x-CX)/RX,(y-CY)/RY);if(d>.98||d<.6)continue;const col=pick(['#f4f0e6','#ffd84a','#ff7a8a','#b7a2ff']);px(x-1,y,3,1,col);px(x,y-1,1,3,col);px(x,y,1,1,'#ffe9a8');}
  for(let i=0;i<14;i++){const a=rnd(0,Math.PI*2),d=rnd(.82,.96);const x=CX+Math.cos(a)*RX*d,y=CY+Math.sin(a)*RY*d;g.fillStyle='#00000030';g.beginPath();g.ellipse(x+1,y+3,6,2.5,0,0,7);g.fill();
    const s=rnd(3,6);px(x-s,y-s+2,s*2,s,'#8a9196');px(x-s+1,y-s+1,s*2-2,1,'#b5bcbf');px(x-s+1,y+1,s*2-2,1,'#5d6468');}
  for(let r=0;r<ROWS;r++)for(let col=0;col<COLS;col++){const p=hexXY(col,r);hexPath(g,p.x,p.y,R-1.2,SQ);g.fillStyle=r>=4?'rgba(255,255,230,.16)':'rgba(255,255,255,.08)';g.fill();
    g.lineWidth=1;g.strokeStyle='rgba(34,66,24,.45)';g.stroke();hexPath(g,p.x,p.y-1,R-3,SQ);g.strokeStyle='rgba(255,255,255,.10)';g.stroke();}
  for(let i=0;i<BENCH_N;i++){const p=benchXY(i);g.fillStyle='#00000035';g.beginPath();g.ellipse(p.x,p.y+3,12,4.5,0,0,7);g.fill();
    g.fillStyle='#7a5532';g.beginPath();g.ellipse(p.x,p.y+1,11,4.5,0,0,7);g.fill();g.fillStyle='#b98a55';g.beginPath();g.ellipse(p.x,p.y,10,3.6,0,0,7);g.fill();g.strokeStyle='#8f6638';g.beginPath();g.ellipse(p.x,p.y,6,2,0,0,7);g.stroke();}
  const trees=[];
  for(let i=0;i<2600&&trees.length<150;i++){const x=rnd(-20,W+20),y=rnd(-30,H+30);const d=Math.hypot((x-CX)/RX,(y-CY)/RY);if(d<1.04)continue;
    const s=rnd(13,23)+(d>1.3?3:0);if(trees.some(t=>Math.hypot(t.x-x,(t.y-y)*1.4)<(t.s+s)*.62))continue;trees.push({x,y,s});}
  for(let i=0;i<46;i++){const a=rnd(0,Math.PI*2),d=rnd(.97,1.06);trees.push({x:CX+Math.cos(a)*RX*d,y:CY+Math.sin(a)*RY*d,s:rnd(6,9),bush:1});}
  trees.sort((a,b)=>a.y-b.y);
  const circ=(cx,cy,r,col)=>{g.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy));g.fillRect(Math.round(cx-w),Math.round(cy+dy),2*w+1,1);}};
  for(const t of trees){const{x,y,s}=t;g.fillStyle='rgba(10,30,10,.35)';g.beginPath();g.ellipse(x+3,y+1,s*.95,s*.38,0,0,7);g.fill();let cy=y-s*.55;
    if(!t.bush){px(x-2,y-9,5,10,'#5a3b24');px(x+1,y-9,2,10,'#3d2716');cy=y-9-s*.6;}
    circ(x,cy,s,'#1d4527');for(let k=0;k<5;k++){const a=k/5*Math.PI*2+hash(x|0,y|0,k);circ(x+Math.cos(a)*s*.62,cy+Math.sin(a)*s*.5,Math.round(s*.45),'#1d4527');}
    circ(x-s*.12,cy-s*.12,Math.round(s*.82),'#2c6435');circ(x-s*.28,cy-s*.3,Math.round(s*.55),'#3d7f3d');circ(x-s*.4,cy-s*.45,Math.round(s*.26),'#58a04a');
    for(let k=0;k<6;k++)px(x+rnd(-s*.6,s*.3),cy+rnd(-s*.7,0),1,1,'#7cc25e');}
  const vg=g.createRadialGradient(CX,CY-10,80,CX,CY,380);vg.addColorStop(0,'rgba(255,240,180,.10)');vg.addColorStop(.55,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(5,20,10,.55)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  return c;
}

/* ================= Run state ================= */
let run=null, mode='loading', uidc=1;
let units=[],fx=[],proj=[],texts=[],leaves=[],wander=[];
let drag=null,speed=1,combatT=0,events=[],enemyPreview=[];
let evoQueue=[],evoOpen=false;

function newRun(strat){
  const tidal=strat.id==='tidal';
  const boss=pickBoss();
  run={strat,hp:tidal?125:100,maxHp:tidal?125:100,gold:4,floor:1,streak:0,invest:0,aug:null,augTier:null,
    board:{},bench:Array(BENCH_N).fill(null),shop:[],results:[],wins:0,boss,featured:featured(strat)};
}
function pickBoss(){
  const legs=MODE.byCost[4].filter(r=>SM[finalOf(r)]);
  const r=legs.length?pick(legs):MODE.byCost.slice().reverse().find(l=>l.length)[0];
  let d=finalOf(r);for(let i=0;i<5&&!SM[d];i++)d=finalOf(r);
  return{root:r,dex:d};
}
function featured(strat){
  const st=STARTERS[MODE.starGen-1][strat.si];
  const others=shuffle(MODE.roots.filter(r=>r!==st&&MODE.lines[r].cost<=3&&D[r].t.includes(strat.type)&&SM[r])).slice(0,2);
  return[st,...others];
}
const mkUnit=(root,star=1)=>({uid:uidc++,root,dex:root,star});
function mkEnemy(root,star){const u=mkUnit(root,star);for(let s=2;s<=star;s++){const k=MODE.kids(u.dex);if(k.length)u.dex=pick(k);}return u;}
const boardUnits=()=>Object.entries(run.board).map(([k,u])=>{const[c,r]=k.split(',').map(Number);return{u,c,r};});
const allOwned=()=>[...run.bench.filter(Boolean),...Object.values(run.board)];

/* traits */
function countTraits(list){const seen=new Set(),ct={};
  for(const u of list){const key=u.root+':'+u.dex;if(seen.has(u.root))continue;seen.add(u.root);
    for(const t of D[u.dex].t)ct[t]=(ct[t]||0)+1;
    if(!MODE.gen){const rg=REGIONS[lineOf(u).region];ct[rg]=(ct[rg]||0)+1;}}
  return ct;}
const traitDef=k=>TT[k]||RT[k];
const tierOf=(k,n)=>BP.filter(b=>n>=b).length;

/* shop */
function rollCost(f){const o=ODDS(f);let x=Math.random(),c=0;while(c<4&&x>=o[c]){x-=o[c];c++;}
  for(let d=0;d<5;d++){for(const cc of[c-d,c+d])if(cc>=0&&cc<5&&MODE.byCost[cc].length)return cc+1;}return 1;}
function rollShop(first){
  run.shop=[];for(let i=0;i<5;i++)run.shop.push(pick(MODE.byCost[rollCost(run.floor)-1]));
  if(first)run.shop[0]=run.featured[0];
  preload(run.shop,2000);
}
function buy(i){
  const root=run.shop[i];if(!root||mode!=='plan')return;const L=MODE.lines[root];
  if(run.gold<L.cost){toast(`Not enough Pokédollars for ${D[root].n}.`);return;}
  const copies=allOwned().filter(u=>u.dex===root&&u.star===1).length;
  const slot=run.bench.indexOf(null);
  if(slot<0&&copies<2){toast('Your bench is full. Release a Pokémon first.');return;}
  run.gold-=L.cost;run.shop[i]=null;const u=mkUnit(root);ensure(root);
  if(slot>=0)run.bench[slot]=u;else{const v=run.bench.findIndex(b=>b&&b.dex===root&&b.star===1);run.bench[v]=u;}
  combine();renderUI();
}
function locate(u){for(const[k,v]of Object.entries(run.board))if(v===u){const[c,r]=k.split(',').map(Number);return{kind:'board',c,r,...hexXY(c,r)};}
  const i=run.bench.indexOf(u);if(i>=0)return{kind:'bench',i,...benchXY(i)};return null;}
function removeUnit(u){for(const k in run.board)if(run.board[k]===u)delete run.board[k];const i=run.bench.indexOf(u);if(i>=0)run.bench[i]=null;}
function combine(){
  let changed=true;
  while(changed){changed=false;const groups={};
    for(const u of allOwned()){if(u.star>=3)continue;const k=u.dex+':'+u.star;(groups[k]=groups[k]||[]).push(u);}
    for(const k in groups){const list=groups[k];if(list.length<3)continue;
      const ordered=list.sort((a,b)=>(locate(a).kind==='board'?0:1)-(locate(b).kind==='board'?0:1));
      const keep=ordered[0];removeUnit(ordered[1]);removeUnit(ordered[2]);keep.star++;
      const p=locate(keep);burst(p.x,p.y-10,'#fff7c2',26,1.4);burst(p.x,p.y-10,TYPES[D[keep.dex].t[0]],14,1);
      evolveStep(keep);changed=true;break;}
  }
}
function evolveStep(u){
  const before=nameOf(u),ks=MODE.kids(u.dex);
  if(ks.length===1){u.dex=ks[0];ensure(u.dex);toast(`${before} evolved into ${nameOf(u)}!`);}
  else if(ks.length>1){evoQueue.push({u,ks,before});ks.forEach(ensure);if(!evoOpen)showEvoChoice();}
  else toast(`${before} is now ${u.star}★!`);
}
function sellValue(u){return lineOf(u).cost*Math.pow(3,u.star-1)-(u.star>1?1:0);}
function sell(u){run.gold+=sellValue(u);removeUnit(u);renderUI();}

/* enemies */
function buildEnemy(f){
  const kind=floorKind(f),list=[];
  if(kind==='wild'){
    const n=[2,3,4][f-1];const pool=[...MODE.byCost[0],...MODE.byCost[1]].filter(r=>SM[r]);
    for(let i=0;i<n;i++)list.push({u:mkEnemy(pick(pool),1),mult:.5+f*.08});
  }else{
    const n=teamCap(f)-(run.aug&&run.aug.id==='resolve'?1:0)+(kind==='elite'?1:0);
    const p2=clamp((f-3)*.1+(kind==='elite'?.2:0),0,.85),p3=clamp((f-10)*.07,0,.35);
    const mult=1+(f-4)*.035+(kind==='elite'?.1:0)+(kind==='boss'?.1:0);
    if(kind==='boss'){const b=mkUnit(run.boss.root,1);b.dex=run.boss.dex;list.push({u:b,mult:1,boss:1});}
    const k=kind==='boss'?4:n;
    for(let i=0;i<k;i++){const root=pick(MODE.byCost[Math.min(rollCost(f+2),4)-1]);const x=Math.random();list.push({u:mkEnemy(root,x<p3?3:x<p3+p2?2:1),mult});}
  }
  const taken=new Set();
  const place=rows=>{for(let t=0;t<60;t++){const r=pick(rows),c=Math.floor(rnd(0,COLS));const k=c+','+r;if(!taken.has(k)){taken.add(k);return{c,r};}}
    for(let r=0;r<4;r++)for(let c=0;c<COLS;c++)if(!taken.has(c+','+r)){taken.add(c+','+r);return{c,r};}};
  return list.map(e=>{const pos=e.boss?(taken.add('3,2'),{c:3,r:2}):place(unitStats(e.u.dex,1,1).range>1?[0,1]:[3,2,3]);return{...e,...pos};});
}
function trainerName(f){const k=floorKind(f);if(k==='wild')return'Wild Pokémon';if(k==='boss')return`${D[run.boss.dex].n}, Guardian of the Grove`;if(k==='elite')return RIVALS[f===5?0:1];return TRAINERS[(f*7+run.strat.id.length)%TRAINERS.length];}

/* ================= Floor flow ================= */
async function startFloor(){
  const f=run.floor;
  if(f>1){let inc=5+run.invest+(run.aug&&run.aug.id==='amulet'?3:0);
    if(run.strat.id==='verdant'&&run.gold>=10&&run.invest<4){run.invest++;inc++;toast(`Investment matured: income is now ₽${5+run.invest}.`);}
    run.gold+=inc;}
  enemyPreview=buildEnemy(f);rollShop(f===1);
  await preload([...enemyPreview.map(e=>e.u.dex),...allOwned().map(u=>u.dex),run.boss.dex]);
  mode='plan';showGameUI(true);renderUI();
  if(f===2&&!run.aug)showAugment();else banner(`Floor ${f}`,trainerName(f),1400);
}
function startCombat(){
  if(mode!=='plan'||evoOpen)return;
  const cap=teamCap(run.floor);
  for(let i=0;i<BENCH_N&&Object.keys(run.board).length<cap;i++){const u=run.bench[i];if(!u)continue;
    const rows=unitStats(u.dex,1,1).range>1?[6,7,5]:[4,5];let placed=false;
    for(const r of rows){for(const c of[3,2,4,1,5,0,6])if(!run.board[c+','+r]){run.board[c+','+r]=u;run.bench[i]=null;placed=true;break;}if(placed)break;}}
  if(!Object.keys(run.board).length){toast('Put at least one Pokémon on the field.');return;}
  if(Object.keys(run.board).length>cap){toast(`Too many Pokémon on the field (${Object.keys(run.board).length}/${cap}).`);return;}
  hideTip();mode='combat';units=[];events=[];combatT=0;proj=[];texts=[];
  const mine=boardUnits(),ptr=countTraits(mine.map(x=>x.u)),etr=countTraits(enemyPreview.map(e=>e.u));
  for(const b of mine)units.push(makeCombatant(b.u,0,b.c,b.r,ptr,1));
  for(const e of enemyPreview)units.push(makeCombatant(e.u,1,e.c,e.r,etr,e.mult,e.boss));
  renderUI();
}
function makeCombatant(u,team,c,r,tr,mult,boss){
  const L=lineOf(u),st=unitStats(u.dex,L.cost,u.star);
  const x={u,team,c,r,hp:st.hp*mult,atk:st.atk*mult,as:st.as,armor:st.armor,range:st.range,maxMana:st.mana,mana:st.start,kind:st.kind,v:st.v*mult,
    dmg:1,taken:1,regen:0,shield:0,crit:0,dodge:0,ls:0,abm:1,focus:false,boss:!!boss};
  if(boss){x.hp*=5.5;x.atk*=1.9;x.v*=2;x.armor+=15;}
  const eff=[];
  for(const t of D[u.dex].t){const ti=tierOf(t,tr[t]||0);if(ti)eff.push(TT[t].e[ti-1]);}
  if(!MODE.gen){const rg=REGIONS[L.region],ti=tierOf(rg,tr[rg]||0);if(ti)eff.push(RT[rg].e[ti-1]);}
  let hpM=1,asM=1,shieldF=0;
  for(const e of eff){hpM+=e.hp||0;x.dmg+=e.dmg||0;x.mana+=e.mana||0;x.regen+=e.regen||0;asM+=e.as||0;x.armor+=e.armor||0;x.dodge+=e.dodge||0;x.abm+=e.ab||0;shieldF+=e.shield||0;x.ls+=e.ls||0;x.crit+=e.crit||0;x.taken*=1-(e.dr||0);}
  if(team===0){const s=run.strat.id,ty=D[u.dex].t;
    if(s==='ember'&&ty.includes('Fire'))x.dmg+=.15;
    if(s==='tidal'){x.taken*=.9;if(ty.includes('Water'))x.mana+=10;}
    if(s==='verdant'&&ty.includes('Grass'))x.regen+=.01;
    const a=run.aug&&run.aug.id;
    if(a==='quickclaw')asM+=.12;if(a==='oran')x.hp+=120;if(a==='muscleband')x.dmg+=.18;if(a==='champion'){x.dmg+=.3;asM+=.15;}if(a==='focusband')x.focus=true;}
  x.hp*=hpM;x.maxHp=x.hp;x.as*=asM;x.shield=x.hp*shieldF;
  const p=hexXY(c,r);
  return Object.assign(x,{x:p.x,y:p.y,dex:u.dex,dir:team?DIR.down:DIR.up,anim:'Idle',animT:Math.random(),loop:true,cd:rnd(.1,.5),target:null,move:null,stun:0,dead:false,deadT:0,flash:0,busy:0});
}

/* ================= Combat ================= */
const alive=t=>units.filter(u=>!u.dead&&u.team===t);
const occupied=(c,r,ex)=>units.some(u=>u!==ex&&!u.dead&&((u.c===c&&u.r===r)||(u.move&&u.move.c===c&&u.move.r===r)));
function setAnim(u,a,loop=false){u.anim=a;u.animT=0;u.loop=loop;}
function schedule(dt,fn){events.push({t:combatT+dt,fn});}
function stepCombat(dt){
  combatT+=dt;
  for(let i=events.length-1;i>=0;i--)if(events[i].t<=combatT){const e=events[i];events.splice(i,1);e.fn();}
  for(const u of units){
    u.animT+=dt;u.flash=Math.max(0,u.flash-dt);
    if(u.dead){u.deadT+=dt;continue;}
    if(!u.loop&&u.animT>=animLen(u.dex,u.anim)&&!u.move)setAnim(u,'Idle',true);
    if(u.regen>0)u.hp=Math.min(u.maxHp,u.hp+u.maxHp*u.regen*dt);
    if(u.stun>0){u.stun-=dt;continue;}
    u.cd-=dt;u.busy-=dt;
    if(u.move){u.move.t+=dt/u.move.dur;const k=Math.min(1,u.move.t);u.x=u.move.fx+(u.move.tx-u.move.fx)*k;u.y=u.move.fy+(u.move.ty-u.move.fy)*k;
      if(k>=1){u.c=u.move.c;u.r=u.move.r;u.move=null;setAnim(u,'Idle',true);}continue;}
    if(u.busy>0)continue;
    if(!u.target||u.target.dead){const foes=alive(1-u.team);if(!foes.length)continue;foes.sort((a,b)=>hdist(u,a)-hdist(u,b)||Math.random()-.5);u.target=foes[0];}
    const tg=u.target,d=hdist(u,tg);
    if(d<=u.range){u.dir=dirFrom(tg.x-u.x,(tg.y-u.y)/SQ);
      if(u.mana>=u.maxMana){cast(u,tg);continue;}
      if(u.cd<=0){attack(u,tg);u.cd=1/u.as;}}
    else{const opts=nbrs(u.c,u.r).filter(h=>!occupied(h.c,h.r,u)).map(h=>({...h,d:hdist(h,tg)+Math.random()*.3}));opts.sort((a,b)=>a.d-b.d);
      if(opts.length&&opts[0].d<d+.2){const h=opts[0],p=hexXY(h.c,h.r);u.move={c:h.c,r:h.r,fx:u.x,fy:u.y,tx:p.x,ty:p.y,t:0,dur:.42};u.dir=dirFrom(p.x-u.x,(p.y-u.y)/SQ);setAnim(u,'Walk',true);}
      else u.target=null;}
  }
  const a=alive(0).length,b=alive(1).length;
  if((!a||!b||combatT>45)&&!events.some(e=>e.end))events.push({t:combatT+1.1,end:1,fn:()=>endCombat(a&&b?(hpFrac(0)>=hpFrac(1)):!!a)});
}
const hpFrac=t=>{const l=units.filter(u=>u.team===t);return l.reduce((s,u)=>s+Math.max(0,u.hp)/u.maxHp,0)/l.length;};
const tcol=u=>TYPES[D[u.dex].t[0]];
function attack(u,tg){
  const anim=u.range>1?'Shoot':'Attack';setAnim(u,anim);const ht=hitTime(u.dex,anim);u.busy=Math.min(animLen(u.dex,anim),.55);
  schedule(ht,()=>{if(u.dead)return;
    if(u.range>1)shoot(u,tg,tcol(u),()=>damage(u,tg,u.atk,false));else{damage(u,tg,u.atk,false);spark(tg.x,tg.y-10,'#ffffff',5);}
    u.mana=Math.min(u.maxMana,u.mana+10);});
}
function shoot(u,tg,col,onHit,size=2){proj.push({x:u.x,y:u.y-10,tg,col,onHit,size,trail:[]});}
function damage(src,tg,amt,isAb){
  if(!tg||tg.dead)return 0;
  if(!isAb&&tg.dodge&&Math.random()<tg.dodge){texts.push({x:tg.x,y:tg.y-22,txt:'Miss',col:'#cfe0ff',life:.7});return 0;}
  let crit=Math.random()<src.crit;
  let d=amt*src.dmg*(isAb?src.abm:1)*(crit?1.5:1)*(100/(100+Math.max(0,tg.armor)))*tg.taken;
  let left=d;if(tg.shield>0){const s=Math.min(tg.shield,left);tg.shield-=s;left-=s;}
  tg.hp-=left;tg.flash=.15;tg.mana=Math.min(tg.maxMana,tg.mana+Math.min(12,d*.04));
  if(src.ls&&!src.dead)src.hp=Math.min(src.maxHp,src.hp+d*src.ls);
  texts.push({x:tg.x+rnd(-6,6),y:tg.y-22,txt:Math.round(d)+(crit?'!':''),col:isAb?'#ffd34d':crit?'#ffb08a':'#ffffff',big:isAb||crit,life:.9});
  if(tg.hp<=0){
    if(tg.focus){tg.focus=false;tg.hp=1;texts.push({x:tg.x,y:tg.y-30,txt:'Focus Band!',col:'#ff8a7a',life:1.2});}
    else{tg.dead=true;tg.hp=0;setAnim(tg,'Faint');tg.move=null;burst(tg.x,tg.y-8,'#ffffff',10,.7);}
  }else if(!tg.move&&tg.busy<=0&&Math.random()<.3){setAnim(tg,'Hurt');tg.busy=.2;}
  return d;
}
function heal(u,amt){if(u.dead)return;const h=Math.min(u.maxHp-u.hp,amt);u.hp+=h;if(h>1)texts.push({x:u.x,y:u.y-24,txt:'+'+Math.round(h),col:'#7dff7a',life:.9});}
function cast(u,tg){
  u.mana=0;const v=u.v,k=u.kind,stun=STUNTYPES.has(D[u.dex].t[0]);
  const anim=k==='strike'||k==='dash'?'Attack':'Shoot';setAnim(u,anim);u.busy=Math.min(animLen(u.dex,anim),.7);
  texts.push({x:u.x,y:u.y-34,txt:moveName(u.dex),col:'#ffffff',life:1.1,label:1});
  const col=tcol(u),adj=t=>alive(t.team).filter(o=>o!==t&&hdist(o,t)<=1);
  schedule(hitTime(u.dex,anim),()=>{if(u.dead)return;
    switch(k){
      case'strike':damage(u,tg,v,true);if(stun)tg.stun=Math.max(tg.stun,.75);burst(tg.x,tg.y-10,col,14,1);break;
      case'dash':{const w=alive(1-u.team).sort((a,b)=>a.hp-b.hp)[0];if(w){shoot(u,w,col,()=>{damage(u,w,v*1.1,true);burst(w.x,w.y-10,col,14,1);},3);}break;}
      case'blast':shoot(u,tg,col,()=>{damage(u,tg,v,true);if(stun)tg.stun=Math.max(tg.stun,.75);adj(tg).forEach(o=>damage(u,o,v*.5,true));burst(tg.x,tg.y-8,col,20,1.2);burst(tg.x,tg.y-8,'#ffffff',6,.8);},3);break;
      case'guard':u.shield+=v*1.4;ring(u.x,u.y-8,'#dfe8ff');damage(u,tg,v*.4,true);break;
      case'heal':{const al=alive(u.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(al){heal(al,v*1.1);ring(al.x,al.y-8,'#c6ff8a');burst(al.x,al.y-12,'#e9ffb0',12,.6);}break;}
    }});
}
function endCombat(win){
  mode='result';const f=run.floor;
  if(win){run.wins++;run.streak=Math.max(1,run.streak+1);let g=1;if(run.strat.id==='ember'&&run.streak>=2)g++;run.gold+=g;run.results[f]='win';banner('Victory!',`+₽${g}`,1500);}
  else{run.streak=0;const surv=alive(1).reduce((s,u)=>s+u.u.star,0);let dmg=2+surv+Math.floor(f/4)+(floorKind(f)==='boss'?6:0);if(run.strat.id==='ember')dmg+=2;
    run.hp=Math.max(0,run.hp-dmg);run.results[f]='loss';banner('Defeat',`Trainer takes ${dmg} damage`,1600);}
  renderUI();
  setTimeout(()=>{units=[];proj=[];if(run.hp<=0)return showEnd(false);if(f>=FLOORS)return showEnd(true);run.floor++;startFloor();},1800);
}

/* ================= Effects ================= */
function burst(x,y,col,n,pow){for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),s=rnd(20,70)*pow;fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.7-20,life:rnd(.35,.7),max:.7,col,sz:Math.random()<.4?2:1,g:90});}}
function spark(x,y,col,n){for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),s=rnd(30,60);fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.18,max:.18,col,sz:1,g:0});}}
function ring(x,y,col){fx.push({ring:1,x,y,r:4,life:.45,max:.45,col});}
function initLeaves(){leaves=[];for(let i=0;i<22;i++)leaves.push({x:rnd(0,W),y:rnd(-H,H),vx:rnd(4,12),vy:rnd(10,22),ph:rnd(0,7),col:pick(['#9fd16a','#c7d95a','#7fbf4f','#e0c25a'])});}

/* ================= Loop ================= */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(mode==='combat')for(let i=0;i<speed;i++)stepCombat(dt);
  update(dt*(mode==='combat'?speed:1));try{draw(now/1000);}catch(e){console.error(e);}requestAnimationFrame(frame);}
function update(dt){
  for(const p of fx){p.life-=dt;if(!p.ring){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;}else p.r+=40*dt;}fx=fx.filter(p=>p.life>0);
  for(const t of texts){t.life-=dt;t.y-=(t.label?10:22)*dt;}texts=texts.filter(t=>t.life>0);
  for(const p of proj){const tx=p.tg.x,ty=p.tg.y-10,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),sp=260*dt;p.trail.push({x:p.x,y:p.y});if(p.trail.length>6)p.trail.shift();
    if(d<=sp||p.tg.dead){p.done=1;if(!p.tg.dead)p.onHit();}else{p.x+=dx/d*sp;p.y+=dy/d*sp;}}proj=proj.filter(p=>!p.done);
  for(const l of leaves){l.ph+=dt*2;l.x+=(l.vx+Math.sin(l.ph)*10)*dt;l.y+=l.vy*dt;if(l.y>H+10||l.x>W+10){l.y=rnd(-40,-5);l.x=rnd(-40,W);}}
  if(mode==='title'||mode==='modes'||mode==='strategy')for(const w of wander){w.t+=dt;
    if(w.move){w.move.t+=dt/w.move.dur;const k=Math.min(1,w.move.t);w.x=w.move.fx+(w.move.tx-w.move.fx)*k;w.y=w.move.fy+(w.move.ty-w.move.fy)*k;if(k>=1){w.move=null;w.anim='Idle';w.wait=rnd(.6,2.4);}}
    else{w.wait-=dt;if(w.wait<=0){const tx=clamp(w.x+rnd(-70,70),150,490),ty=clamp(w.y+rnd(-40,40),70,250);w.move={fx:w.x,fy:w.y,tx,ty,t:0,dur:Math.hypot(tx-w.x,ty-w.y)/28+.2};w.dir=dirFrom(tx-w.x,ty-w.y);w.anim='Walk';w.t=0;}}}
}
const starScale=s=>1+(s-1)*.08;
function draw(t){
  ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
  if(BG)ctx.drawImage(BG,0,0);else{ctx.fillStyle='#13201a';ctx.fillRect(0,0,W,H);}
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<3;i++){const x=150+i*150+Math.sin(t*.3+i)*8;ctx.fillStyle=`rgba(255,240,190,${.035+.015*Math.sin(t*.7+i*2)})`;ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x+40,-10);ctx.lineTo(x+150,H);ctx.lineTo(x+90,H);ctx.closePath();ctx.fill();}
  ctx.restore();
  const list=[];
  if(mode==='title'||mode==='modes'||mode==='strategy')for(const w of wander)list.push({dex:w.dex,anim:w.anim,t:w.t,dir:w.dir,x:w.x,y:w.y,shadow:1});
  if(run&&['plan','augment','combat','result'].includes(mode)){
    if(drag){for(let r=4;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r);hexPath(ctx,p.x,p.y,R-2,SQ);const hov=drag.over&&drag.over.kind==='board'&&drag.over.c===c&&drag.over.r===r;ctx.fillStyle=hov?'rgba(255,230,120,.45)':'rgba(255,255,255,.12)';ctx.fill();}
      if(drag.over&&drag.over.kind==='bench'){const p=benchXY(drag.over.i);ctx.fillStyle='rgba(255,230,120,.5)';ctx.beginPath();ctx.ellipse(p.x,p.y,12,5,0,0,7);ctx.fill();}}
    if(mode==='combat'||mode==='result'){for(const u of units){if(u.dead&&u.deadT>1.2)continue;list.push({dex:u.dex,anim:u.anim,t:u.animT,dir:u.dir,x:u.x,y:u.y,loop:u.loop,alpha:u.dead?Math.max(0,1-u.deadT/1.2):1,cu:u,shadow:1,sc:(u.boss?1.25:starScale(u.u.star))});}}
    else{for(const b of boardUnits()){if(drag&&drag.u===b.u)continue;const p=hexXY(b.c,b.r);list.push({dex:b.u.dex,anim:'Idle',t:t+b.u.uid*.37,dir:DIR.up,x:p.x,y:p.y,pu:b.u,shadow:1,sc:starScale(b.u.star)});}
      for(const e of enemyPreview){const p=hexXY(e.c,e.r);list.push({dex:e.u.dex,anim:'Idle',t:t+e.u.uid*.29,dir:DIR.down,x:p.x,y:p.y,pu:e.u,enemy:1,shadow:1,sc:e.boss?1.25:starScale(e.u.star)});}}
    run.bench.forEach((u,i)=>{if(!u||(drag&&drag.u===u))return;const p=benchXY(i);list.push({dex:u.dex,anim:'Idle',t:t+u.uid*.41,dir:DIR.down,x:p.x,y:p.y-2,pu:u,bench:1});});
  }
  list.sort((a,b)=>a.y-b.y);
  for(const s of list)if(s.shadow){ctx.fillStyle=`rgba(10,30,10,${.35*(s.alpha??1)})`;ctx.beginPath();ctx.ellipse(s.x,s.y+1,9*(s.sc||1),3.2,0,0,7);ctx.fill();}
  for(const s of list){const o={loop:s.loop!==false,alpha:s.alpha??1,scale:s.sc||1};drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,o);
    if(s.cu&&s.cu.flash>0){ctx.globalCompositeOperation='lighter';drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,{...o,alpha:.6});ctx.globalCompositeOperation='source-over';}}
  for(const p of proj){p.trail.forEach((q,i)=>{ctx.globalAlpha=(i+1)/p.trail.length*.6;ctx.fillStyle=p.col;ctx.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,p.size,p.size);});
    ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.fillRect(Math.round(p.x)-p.size/2-1,Math.round(p.y)-p.size/2-1,p.size+2,p.size+2);ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x)-p.size/2,Math.round(p.y)-p.size/2,p.size,p.size);}
  for(const p of fx){ctx.globalAlpha=Math.max(0,p.life/p.max);if(p.ring){ctx.strokeStyle=p.col;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.45,0,0,7);ctx.stroke();}else{ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.sz,p.sz);}}
  ctx.globalAlpha=1;
  for(const s of list){if(s.bench&&mode!=='plan')continue;drawBar(s);}
  for(const l of leaves){ctx.fillStyle=l.col;ctx.fillRect(Math.round(l.x),Math.round(l.y),2,1);ctx.fillRect(Math.round(l.x)+1,Math.round(l.y)+1,1,1);}
  if(drag)drawSprite(drag.u.dex,'Walk',t,DIR.down,drag.x,drag.y-6);
  ctx.setTransform(1,0,0,1,0,0);
  for(const tx of texts){ctx.globalAlpha=Math.min(1,tx.life*2.5);ctx.font=tx.label?'600 16px "Pixelify Sans",sans-serif':tx.big?'700 22px "Pixelify Sans",sans-serif':'700 17px "Pixelify Sans",sans-serif';
    ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1b2430';ctx.strokeText(tx.txt,tx.x*2,tx.y*2);ctx.fillStyle=tx.col;ctx.fillText(tx.txt,tx.x*2,tx.y*2);}
  ctx.globalAlpha=1;
}
function drawBar(s){
  const sp=SPR[s.dex];if(!sp||(!s.cu&&!s.pu))return;
  const top=s.y-6+sp.top*(s.sc||1)*sp.k-6;const x=Math.round(s.x)-12,y=Math.round(Math.max(4,top));
  let hp=1,mana=0,shield=0,team=s.enemy?1:0,star=1;
  if(s.cu){if(s.cu.dead)return;hp=s.cu.hp/s.cu.maxHp;mana=s.cu.mana/s.cu.maxMana;shield=Math.min(1,s.cu.shield/s.cu.maxHp);team=s.cu.team;star=s.cu.u.star;}
  else{star=s.pu.star;const st=unitStats(s.pu.dex,1,1);mana=st.start/st.mana;}
  ctx.fillStyle='#1b2430';ctx.fillRect(x-1,y-1,26,6);ctx.fillStyle='#3a3f45';ctx.fillRect(x,y,24,3);
  ctx.fillStyle=team?'#e8524a':'#56d14e';ctx.fillRect(x,y,Math.round(24*hp),3);
  if(shield>0){ctx.fillStyle='#e6edf2';ctx.fillRect(x+Math.round(24*hp),y,Math.max(1,Math.round(24*shield)),3);}
  ctx.fillStyle='#2b3550';ctx.fillRect(x,y+3,24,1);ctx.fillStyle='#5aa8ff';ctx.fillRect(x,y+3,Math.round(24*mana),1);
  const cols=['#d7905a','#cfd8e0','#ffd34d'];for(let i=0;i<star;i++)star3(x+12-(star*5)/2+i*5+2,y-4,cols[star-1]);
}
function star3(x,y,c){ctx.fillStyle='#1b2430';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.fillStyle=c;ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);}

/* ================= Pointer ================= */
function toInternal(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function unitAt(x,y){
  if(!run)return null;
  for(let i=0;i<BENCH_N;i++){const u=run.bench[i];if(!u)continue;const p=benchXY(i);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+6)return{u,from:{kind:'bench',i}};}
  if(mode==='plan'||mode==='augment'){
    for(const b of boardUnits()){const p=hexXY(b.c,b.r);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+8)return{u:b.u,from:{kind:'board',c:b.c,r:b.r}};}
    for(const e of enemyPreview){const p=hexXY(e.c,e.r);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+8)return{u:e.u,enemy:1,mult:e.mult,boss:e.boss};}
  }else if(mode==='combat'||mode==='result')for(const u of units){if(u.dead)continue;if(Math.abs(x-u.x)<13&&y>u.y-28&&y<u.y+8)return{u:u.u,cu:u};}
  return null;
}
function dropTarget(x,y){
  for(let i=0;i<BENCH_N;i++){const p=benchXY(i);if(Math.abs(x-p.x)<14&&Math.abs(y-p.y)<16)return{kind:'bench',i};}
  let best=null,bd=1e9;for(let r=4;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r);const d=Math.hypot(x-p.x,(y-p.y)/SQ);if(d<bd){bd=d;best={kind:'board',c,r};}}
  if(bd<R*1.05)return best;if(y>286)return{kind:'sell'};return null;
}
cv.addEventListener('pointerdown',e=>{const p=toInternal(e);const hit=unitAt(p.x,p.y);
  if(!hit||hit.enemy||hit.cu||mode!=='plan'||evoOpen)return;drag={u:hit.u,from:hit.from,x:p.x,y:p.y,over:null};hideTip();cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{const p=toInternal(e);
  if(drag){drag.x=p.x;drag.y=p.y;drag.over=dropTarget(p.x,p.y);const sell=drag.over&&drag.over.kind==='sell';$('shop').classList.toggle('sell',sell);$('sellzone').textContent=`Release ${nameOf(drag.u)} for ₽${sellValue(drag.u)}`;return;}
  const hit=unitAt(p.x,p.y);if(hit){showTip(hit.u,e,hit);cv.style.cursor=hit.enemy||hit.cu?'help':'grab';}else{hideTip();cv.style.cursor='default';}});
cv.addEventListener('pointerleave',()=>{if(!drag)hideTip();});
cv.addEventListener('pointerup',()=>{
  if(!drag)return;const t=drag.over,u=drag.u,from=drag.from;drag=null;$('shop').classList.remove('sell');
  if(!t||mode!=='plan'){renderUI();return;}
  if(t.kind==='sell'){sell(u);return;}
  const getAt=t=>t.kind==='bench'?run.bench[t.i]:run.board[t.c+','+t.r];
  const setAt=(t,v)=>{if(t.kind==='bench')run.bench[t.i]=v;else{const k=t.c+','+t.r;if(v)run.board[k]=v;else delete run.board[k];}};
  const other=getAt(t);if(other===u){renderUI();return;}
  if(from.kind==='bench'&&t.kind==='board'&&!other&&Object.keys(run.board).length>=teamCap(run.floor)){toast(`Your team is full (${teamCap(run.floor)}). Swap a Pokémon instead.`);renderUI();return;}
  setAt(from,other||null);setAt(t,u);renderUI();});
cv.addEventListener('contextmenu',e=>e.preventDefault());

/* ================= UI ================= */
const chip=(txt,col)=>`<span class="chip" style="background:${col}">${txt}</span>`;
const typeChips=dex=>D[dex].t.map(t=>chip(t,TYPES[t])).join('');
function showTip(u,e,hit={}){
  const L=lineOf(u),st=unitStats(u.dex,L.cost,u.star),cu=hit.cu,mult=hit.mult||1,tip=$('tip');
  const bm=hit.boss||(cu&&cu.boss)?[5.5,1.9,2]:[1,1,1];
  const hp=cu?`${Math.round(cu.hp)}/${Math.round(cu.maxHp)}`:Math.round(st.hp*mult*bm[0]);
  const atk=cu?Math.round(cu.atk*cu.dmg):Math.round(st.atk*mult*bm[1]);
  const v=Math.round((cu?cu.v:st.v*mult*bm[2]));
  const enemy=hit.enemy||(cu&&cu.team);
  const evo=MODE.kids(u.dex).map(k=>D[k].n);
  tip.innerHTML=`<div class="top"><img src="${por(u.dex)}" alt=""><div><div class="lbl">${enemy?'Opponent':`Cost ₽${L.cost} · ${roleOf(u.dex)}`}</div><h3>${esc(D[u.dex].n)}</h3>
    <div class="stars">${'★'.repeat(u.star)}</div><div class="chips">${typeChips(u.dex)}${MODE.gen?'':chip(REGIONS[L.region],REGCOL[L.region])}</div></div></div>
    <div class="stats"><div><span class="lbl">HP</span><b>${hp}</b></div><div><span class="lbl">Attack</span><b>${atk}</b></div><div><span class="lbl">Speed</span><b>${(cu?cu.as:st.as).toFixed(2)}</b></div>
    <div><span class="lbl">Armor</span><b>${Math.round(cu?cu.armor:st.armor)}</b></div><div><span class="lbl">Range</span><b>${st.range}</b></div><div><span class="lbl">PP</span><b>${cu?Math.round(cu.mana):st.start}/${st.mana}</b></div></div>
    <div class="ab"><b>${moveName(u.dex)}</b><p>${KIND_TXT[st.kind](v,STUNTYPES.has(D[u.dex].t[0]))}</p></div>
    ${!enemy&&u.star<3&&evo.length?`<div class="lbl" style="margin-top:8px">${u.star===1?'At 2★':'At 3★'}: ${evo.length>1?'choose '+esc(evo.join(' / ')):'evolves into '+esc(evo[0])}</div>`:''}`;
  const sr=stage.getBoundingClientRect(),sc=sr.width/1280;let x=(e.clientX-sr.left)/sc+18,y=(e.clientY-sr.top)/sc-40;
  tip.style.display='block';const th=tip.offsetHeight;if(x>1280-306)x-=330;y=clamp(y,80,720-th-10);tip.style.left=x+'px';tip.style.top=y+'px';
}
function hideTip(){$('tip').style.display='none';}
let toastT=0;function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',2200);}
function banner(title,sub,ms){const h=$('bannerhost');h.innerHTML=`<div class="banner win">${esc(title)}${sub?`<small>${esc(sub)}</small>`:''}</div>`;setTimeout(()=>{if(h.firstChild&&h.firstChild.textContent.startsWith(title))h.innerHTML='';},ms);}
function showGameUI(on){['hud','traits','mods','shop'].forEach(id=>$(id).hidden=!on);}
function renderUI(){
  if(!run)return;const f=run.floor;
  $('hpnum').textContent=run.hp;const fr=run.hp/run.maxHp,hb=$('hpbar');hb.firstElementChild.style.width=(fr*100)+'%';hb.className='hpbar'+(fr<.3?' low':fr<.6?' mid':'');
  $('goldnum').textContent=run.gold;$('teamnum').innerHTML=`${Object.keys(run.board).length}<small>/${teamCap(f)}</small>`;
  $('floorlbl').textContent=`Floor ${f} / ${FLOORS}`;$('actname').textContent=ACTS[0].name;$('modelbl').textContent=MODE.gen?`${MODE.label} · ${MODE.region}`:'National Dex';
  let tr='';for(let i=1;i<=FLOORS;i++){const k=floorKind(i);let cls='node';if(k==='trainer')cls+=' pb';if(k==='elite')cls+=' elite';if(k==='boss')cls+=' boss';if(i===2)cls+=' aug';
    if(run.results[i])cls+=run.results[i]==='loss'?' lost':' done';if(i===f)cls+=' cur';
    const inner=k==='wild'?`<svg viewBox="0 0 16 16"><path d="M2.5 13.5C2.5 6.5 7 2.5 13.5 2.5c0 6.5-4 11-11 11z" fill="#5fae45" stroke="#24303d" stroke-width="1.2"/></svg>`:k==='boss'?`<img src="${por(run.boss.dex)}" alt="">`:'';
    tr+=`${i>1?'<span class="link"></span>':''}<span class="${cls}" title="Floor ${i}: ${k==='wild'?'Wild Pokémon':k==='boss'?'Boss: '+esc(D[run.boss.dex].n):k==='elite'?'Rival':'Trainer'}${i===2?' · Augment':''}">${inner}</span>`;}
  $('track').innerHTML=tr;
  const ct=countTraits(Object.values(run.board));
  const keys=Object.keys(ct).sort((a,b)=>tierOf(b,ct[b])-tierOf(a,ct[a])||ct[b]-ct[a]||a.localeCompare(b));
  const MAXT=10,shown=keys.slice(0,MAXT);
  $('traits').innerHTML=keys.length?shown.map(k=>{const n=ct[k],ti=tierOf(k,n),T=traitDef(k),isType=!!TT[k];
    const col=isType?TYPES[k]:REGCOL[REGIONS.indexOf(k)];
    return`<div class="trait ${ti?'t'+ti:'off'}" title="${esc(k)}: ${esc(T.d)}"><div class="hex"><span class="in" style="background:${col}">${k.slice(0,3).toUpperCase()}</span></div><div><div class="nm">${k}</div><div class="bp">${BP.map(b=>n>=b?`<b>${b}</b>`:b).join(' › ')}</div></div><div class="ct">${n}</div></div>`;}).join('')+(keys.length>MAXT?`<div class="more">+${keys.length-MAXT} more</div>`:'')
    :`<div class="hint">Place Pokémon on the field to activate type${MODE.gen?'':' and region'} bonuses.</div>`;
  const s=run.strat;let mh=`<div class="mod"><div class="k">Strategy</div><div class="v">${s.name}</div><p>${s.guide}</p></div>`;
  if(run.aug)mh+=`<div class="mod ${run.augTier}"><div class="k">${run.augTier} augment</div><div class="v">${run.aug.name}</div><p>${run.aug.d}</p></div>`;
  if(s.id==='verdant')mh+=`<div class="mod"><div class="k">Invested income</div><div class="v">+₽${run.invest} / floor</div></div>`;
  if(run.streak>1)mh+=`<div class="mod"><div class="k">Win streak</div><div class="v">${run.streak} wins</div></div>`;
  mh+=`<div class="mod"><div class="k">Next opponent</div><div class="v">${esc(trainerName(f))}</div><p>Hover their Pokémon on the field to scout them.</p></div>`;
  $('mods').innerHTML=mh;
  const plan=mode==='plan',owned=new Set(allOwned().filter(u=>u.star<3).map(u=>u.root));
  $('cards').innerHTML=run.shop.map((r,i)=>{if(!r)return`<div class="card empty" aria-hidden="true"></div>`;const L=MODE.lines[r];
    return`<button class="card c${L.cost}${run.gold<L.cost?' poor':''}${owned.has(r)?' owned':''}" data-i="${i}" ${plan?'':'disabled'} aria-label="Buy ${esc(D[r].n)} for ${L.cost}"><div class="band"><span class="name">${esc(D[r].n)}</span><span class="cost">₽${L.cost}</span></div>
      <div class="body"><img class="por" src="${por(r)}" alt=""><div class="info"><span class="role">${roleOf(r)} · Range ${unitStats(r,1,1).range}</span><div class="chips">${typeChips(r)}${MODE.gen?'':chip(REGIONS[L.region],REGCOL[L.region])}</div><span class="role">${moveName(r)}</span></div></div></button>`;}).join('');
  $('reroll').disabled=!plan||run.gold<2;$('fight').disabled=!plan;$('fight').textContent=mode==='combat'?'Battling…':'Battle!';
}
$('cards').addEventListener('click',e=>{const c=e.target.closest('.card');if(c&&c.dataset.i)buy(+c.dataset.i);});
$('cards').addEventListener('pointermove',e=>{const c=e.target.closest('.card');const r=c&&c.dataset.i?run.shop[+c.dataset.i]:null;if(r)showTip({uid:0,root:r,dex:r,star:1},e);else hideTip();});
$('cards').addEventListener('pointerleave',hideTip);
$('reroll').onclick=()=>{if(run.gold<2||mode!=='plan')return;run.gold-=2;rollShop(false);renderUI();};
$('fight').onclick=startCombat;
$('speed').onclick=()=>{speed=speed===1?2:1;$('speed').setAttribute('aria-pressed',speed===2);};
addEventListener('keydown',e=>{if(mode!=='plan'||evoOpen)return;if(e.key==='d'||e.key==='D')$('reroll').click();if(e.key===' '){e.preventDefault();startCombat();}});

/* ================= Screens ================= */
const ov=$('overlay');
function bestOf(id){try{return localStorage.getItem('pokerun.best.'+id);}catch(e){return null;}}
function setBest(id,v){try{const b=+(localStorage.getItem('pokerun.best.'+id)||0);if(v>b)localStorage.setItem('pokerun.best.'+id,v);}catch(e){}}
function setWander(dexes){wander=dexes.map((d,i)=>({dex:d,x:200+(i%5)*60+rnd(-10,10),y:110+Math.floor(i/5)*70+rnd(-10,10),dir:0,anim:'Idle',t:rnd(0,2),wait:rnd(0,2)}));preload(dexes);}
function showTitle(){
  mode='title';showGameUI(false);run=null;MODE=null;
  setWander(shuffle(ROOTS.filter(r=>SM[r])).slice(0,10));
  ov.innerHTML=`<div class="screen"><div class="logo">PokéRun<small>Tactics</small></div><div class="tag">Autobattler roguelike · ${ROOTS.length} evolution lines · Act I</div>
    <button class="btn go" id="start" style="font-size:26px;padding:12px 36px;margin-top:10px">Start Run</button></div>
    <div class="credit">Sprites and portraits from the <a href="https://sprites.pmdcollab.org/" target="_blank" rel="noopener">PMD SpriteCollab</a> contributors. Pokédex data from <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>. Fan project, not affiliated with Nintendo, Game Freak or The Pokémon Company.</div>`;
  $('start').onclick=showModes;$('start').focus();
}
function showModes(){
  mode='modes';
  const tiles=REGIONS.map((rg,i)=>{const n=buildModeCount('gen'+(i+1));const b=bestOf('gen'+(i+1));
    return`<button class="mode win" data-m="gen${i+1}"><div class="meta">Gen ${ROMAN[i]}</div><h2>${rg}</h2><div class="row">${STARTERS[i].map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}">`).join('')}</div>
      <div class="meta">${n} lines${b?` · <span style="color:var(--leaf)">best ${b}/15</span>`:''}</div></button>`;}).join('');
  const nb=bestOf('nat');
  const legs=shuffle(ROOTS.filter(r=>D[r].L&&SM[r])).slice(0,9);
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Choose a region</h1><p class="sub">Each region uses the Pokémon introduced in that generation, plus older relatives that gained new evolutions there.</p>
    <div class="modes">${tiles}<button class="mode win nat" data-m="nat"><div class="meta">Every generation</div><h2>National Dex</h2>
      <div class="grid5">${legs.map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}">`).join('')}</div>
      <p>All ${Object.keys(D).length.toLocaleString()} Pokémon across ${ROOTS.length} evolution lines. Region bonuses are active.</p>
      <div class="meta">${nb?`Best ${nb}/15`:'Not cleared yet'}</div></button></div></div>
    <button class="btn back" id="back">Back</button>`;
  ov.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{MODE=buildMode(b.dataset.m);showStrategy();});
  $('back').onclick=showTitle;
}
const MODECOUNT={};
function buildModeCount(id){if(!MODECOUNT[id])MODECOUNT[id]=buildMode(id).roots.length;return MODECOUNT[id];}
function showStrategy(){
  mode='strategy';
  const feats=STRATS.map(featured);
  setWander(shuffle(MODE.roots.filter(r=>SM[r])).slice(0,10));
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Choose your strategy</h1><p class="sub">${MODE.gen?`${MODE.label} · ${MODE.region}`:'National Dex'}. Your strategy is a guideline for the whole run. It shapes your first shop and rewards one way of playing.</p>
  <div class="picks">${STRATS.map((s,i)=>`<button class="pick win" data-i="${i}"><div class="lbl">${s.risk}</div><h2>${s.name}</h2>
    <div class="por3">${feats[i].map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}">`).join('')}</div>
    <ul>${s.pts.map(p=>`<li>${p}</li>`).join('')}</ul><div class="guide">${s.guide}</div></button>`).join('')}</div></div>
    <button class="btn back" id="back">Back</button>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{const s=STRATS[+b.dataset.i];newRun(s);run.featured=feats[+b.dataset.i];ov.innerHTML='';startFloor();});
  $('back').onclick=showModes;
}
function showAugment(){
  mode='augment';$('bannerhost').innerHTML='';
  const x=Math.random(),tier=x<.25?'silver':x<.75?'gold':'prismatic';run.augTier=tier;
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner ${tier}">${tier.toUpperCase()} AUGMENT</div><h1 class="h1">Choose an augment</h1><p class="sub">Augments last for the rest of the run.</p>
    <div class="picks">${AUGS[tier].map((a,i)=>`<button class="pick win aug tier-${tier}" data-i="${i}"><div class="gem"></div><h2>${a.name}</h2><p>${a.d}</p></button>`).join('')}</div></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{const a=AUGS[tier][+b.dataset.i];run.aug=a;ov.innerHTML='';mode='plan';
    if(a.id==='berry')run.gold+=6;
    if(a.id==='rarecandy'){const slot=run.bench.indexOf(null);const root=pick(MODE.roots.filter(r=>MODE.lines[r].cost<=3));
      if(slot>=0){const u=mkUnit(root);u.star=2;run.bench[slot]=u;ensure(root);evolveStep(u);}}
    combine();renderUI();if(!evoOpen)banner(`Floor ${run.floor}`,trainerName(run.floor),1400);});
}
function showEvoChoice(){
  const job=evoQueue.shift();if(!job){evoOpen=false;return;}
  evoOpen=true;hideTip();
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">${esc(job.before)} is evolving!</h1><p class="sub">Choose what it evolves into.</p>
    <div class="evo">${job.ks.map(k=>`<button class="pick win" data-k="${k}"><img src="${por(k)}" alt=""><h2>${esc(D[k].n)}</h2><div class="chips">${typeChips(k)}</div><div class="lbl">${roleOf(k)} · ${moveName(k)}</div></button>`).join('')}</div></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{job.u.dex=+b.dataset.k;ensure(job.u.dex);ov.innerHTML='';evoOpen=false;
    toast(`${job.before} evolved into ${D[job.u.dex].n}!`);combine();renderUI();if(evoQueue.length)showEvoChoice();});
}
function showEnd(won){
  mode='over';showGameUI(false);setBest(MODE.id,run.wins);
  const team=Object.values(run.board).concat(run.bench.filter(Boolean)).sort((a,b)=>b.star-a.star).slice(0,7);
  const where=MODE.gen?MODE.region:'National Dex';
  ov.innerHTML=`<div class="scrim"></div><div class="screen">
    <h1 class="h1">${won?`${where}: Act I cleared!`:'Your run has ended'}</h1>
    <p class="sub">${won?`${esc(D[run.boss.dex].n)} steps aside. The path out of the clearing leads on.`:`Your team fell on Floor ${run.floor} of the ${ACTS[0].name}.`}</p>
    <div class="win" style="padding:14px 20px;display:flex;flex-direction:column;gap:12px;align-items:center">
      <div class="endstat"><div><span class="lbl">Floors won</span><b>${run.wins}</b></div><div><span class="lbl">Trainer HP</span><b>${run.hp}</b></div><div><span class="lbl">Strategy</span><b style="font-size:20px">${run.strat.name}</b></div>${run.aug?`<div><span class="lbl">Augment</span><b style="font-size:20px">${run.aug.name}</b></div>`:''}</div>
      <div style="display:flex;gap:6px">${team.map(u=>`<img src="${por(u.dex)}" alt="${esc(nameOf(u))}" title="${esc(nameOf(u))} ${'★'.repeat(u.star)}" style="width:56px;height:56px;image-rendering:pixelated;border:2px solid var(--ink);border-radius:6px">`).join('')}</div>
    </div>
    ${won?`<div class="acts">${ACTS.map((a,i)=>`<div class="win ${i?'lock':''}"><div class="lbl">Act ${ROMAN[i]}</div><b>${a.name}</b><div class="lbl" style="margin-top:4px">${i?'Coming soon':'Cleared'}</div></div>`).join('')}</div>`:''}
    <button class="btn go" id="again" style="font-size:22px;padding:10px 30px">New run</button></div>`;
  $('again').onclick=showTitle;
}

/* ================= Boot ================= */
(async()=>{
  try{await document.fonts.load('700 20px "Pixelify Sans"');}catch(e){}
  const[dex,spr]=await Promise.all([fetch('data/pokedex.json').then(r=>r.json()),fetch('data/sprites.json').then(r=>r.json())]);
  for(const d of dex){d.bst=d.s.reduce((a,b)=>a+b,0);D[d.id]=d;if(d.f)(KIDS[d.f]=KIDS[d.f]||[]).push(d.id);}
  ROOTS=dex.filter(d=>!d.f).map(d=>d.id);
  for(const k in spr)SM[+k]=spr[k];
  BG=renderForest();initLeaves();
  showTitle();
  requestAnimationFrame(frame);
})();
