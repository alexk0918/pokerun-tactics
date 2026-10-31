"use strict";
/* PokéRun Tactics — game logic. Tables live in data.js. */

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
  const byCost=[1,2,3,4,5].map(c=>roots.filter(r=>lines[r].cost===c));const byCostAll=byCost.map(l=>[...l]);
  const starGen=gen||1+Math.floor(Math.random()*9);
  return{id,gen,S,kids,roots,lines,byCost,byCostAll,starGen,label:gen?`Gen ${ROMAN[gen-1]}`:'National',region:gen?REGIONS[gen-1]:'National Dex'};
}
function depth(i,kids){return 1+Math.max(0,...kids(i).map(k=>depth(k,kids)));}
const lineOf=u=>MODE.lines[u.root];
const nameOf=u=>D[u.dex].n;
function finalOf(dex){let d=dex;for(let i=0;i<3;i++){const k=MODE.kids(d);if(!k.length)break;d=pick(k);}return d;}

/* ================= Kits: real moves + ability passives ================= */
let KITS={},MOVEDB={},ABNAME={};
const KITCACHE={};
const FALLBACK_MOVE={n:'Tackle',t:'Normal',p:40,c:2,tg:10,acc:100,prio:0,st:[],ident:'tackle'};
// the stage a line grows into: the only evolution, or the first one when every branch keeps the same primary type
function nextStage(d){const k=KIDS[d];if(!k||!k.length)return d;if(k.length===1)return k[0];const t=D[d].t[0];return k.every(x=>D[x].t[0]===t)?k[0]:d;}
function ancestors(dex){const a=[];let d=dex;while(d){a.push(d);d=D[d].f;}return a;}
function stylesOf(dex,abs){
  const out=[],anc=ancestors(dex);
  if(anc.some(a=>PARTNER_IDS.includes(a)))out.push('Partner');
  if(anc.some(a=>FOSSIL_IDS.includes(a)))out.push('Fossil');
  if(anc.some(a=>PSEUDO_IDS.includes(a)))out.push('Pseudo');
  for(const a of abs){if(out.length>=2)break;for(const st in STYLE_ABIL)if(STYLE_ABIL[st].includes(a)&&!out.includes(st)){out.push(st);break;}}
  return out.slice(0,2);
}
function kitOf(dex){
  if(KITCACHE[dex])return KITCACHE[dex];
  // A line keeps one play style: unbranched lines use their final form's stats to decide the kit
  let ref=nextStage(dex);while(ref!==dex&&nextStage(ref)!==ref)ref=nextStage(ref);
  const s=D[ref].s,k=KITS[dex]||{},kr=KITS[ref]||{},mv=MOVEDB[k.m]||FALLBACK_MOVE;
  const bulk=(s[0]+s[2]+s[4])/3,off=(s[1]+s[3]+s[5])/3;
  const hm=MOVEDB[k.h]||MOVEDB[kr.h],gm=MOVEDB[k.g]||MOVEDB[kr.g];
  let type='cast';
  if(hm&&bulk>off*1.05&&s[3]>=s[1]*.9&&!['rest','swallow','aqua-ring','ingrain','strength-sap'].includes(hm.ident))type='heal';
  else if(s[0]>=100&&bulk>off*1.12)type='tank';
  else if(bulk>off*1.15)type='guard';
  else if(s[5]>=105&&mv.c===2&&s[1]>=s[3])type='rapid';
  const hits=mv.hmax?(mv.hmin+mv.hmax)/2:1;
  const aoe=mv.tg===11?1:mv.tg===9?2:0;
  let cls;
  if(type==='heal')cls='Medic';else if(type==='tank')cls='Juggernaut';else if(type==='guard')cls='Vanguard';else if(type==='rapid')cls='Striker';
  else if(mv.hmax>1)cls='Combo';else if(aoe)cls='Artillery';
  else if(mv.mc===1||(mv.ail&&(mv.ailc||0)>=20)||(mv.fl||0)>=20)cls='Trickster';
  else cls=mv.c===3?'Mystic':'Bruiser';
  const cat=type==='heal'?'spec':type==='tank'?(s[1]>=s[3]?'phys':'spec'):(mv.c===3?'spec':'phys');
  const range=type==='heal'?2:(cat==='spec'&&(type==='cast'))?3:1;
  const abs=k.a||[],abId=abs.find(a=>typeof FORM_ABIL!=='undefined'&&FORM_ABIL[a])||abs.find(a=>ABILITIES[a]&&ABILITIES[a].d);
  const mana=type==='cast'?clamp(Math.round(55+(mv.p||60)*hits*.25),60,100):type==='heal'?80:type==='guard'?85:0;
  return KITCACHE[dex]={type,cls,mv,hm,gm,hits,aoe,cat,range,mana,ladder:moveLine(dex),start:mv.prio>0?35:type==='guard'?25:10,
    ab:abId?{id:abId,n:ABNAME[abId]||abId,d:ABILITIES[abId].d,e:ABILITIES[abId].e}:null,styles:stylesOf(dex,k.a||[])};
}
function moveLine(dex){if(!KITS[dex]||!KITS[dex].lad)return null;
  const up=ancestors(dex).reverse();let d=dex;const down=[];while(nextStage(d)!==d){d=nextStage(d);down.push(d);}
  const chain=[...up,...down].filter(x=>KITS[x]&&KITS[x].lad);if(chain.length<2)return null;
  return chain.map(x=>({dex:x,n:(MOVEDB[KITS[x].m]||FALLBACK_MOVE).n}));}
const roleOf=dex=>kitOf(dex).cls;
function moveName(dex){const k=kitOf(dex);if(k.type==='heal')return k.hm.n;if(k.type==='tank')return'No move';return k.mv.n;}
function unitStats(dex,cost,star){
  const sp=D[dex],s=sp.s,avg=sp.bst/6,r=x=>clamp(x/avg,.4,2),sm=STARM[star-1],K=kitOf(dex);
  const off=(34+cost*8)*sm,cf=STARB[star-1]*(.7+.15*cost);
  const pf=clamp((K.mv.p||60)*K.hits/80,.6,1.8);
  const base=K.type==='heal'?KIT.healBase*cf:K.type==='guard'?KIT.guardBase*cf:KIT.castBase*pf*cf;
  return{
    hp:(420+cost*110)*sm*(.65+.35*r(s[0]))*(K.type==='tank'?1+KIT.tankHp:1),
    atk:off*(.5+.5*r(s[1])), spa:off*(.5+.5*r(s[3])),
    def:clamp(4+30*r(s[2]),5,80), res:clamp(4+30*r(s[4]),5,80),
    as:clamp(.5+.25*r(s[5]),.45,1.1)*(K.type==='rapid'?1.1:1),
    range:K.range,mana:K.mana,start:K.start,kind:K.type,cat:K.cat,base,pf,
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

/* ================= Items ================= */
const ITEMIMG={};
const iconOf=id=>`assets/items/${id}.png`;
function loadItemImages(){const ids=new Set([...Object.values(COMP).map(c=>c.id),...Object.values(CRAFT).map(c=>c.id),...Object.keys(USE),...Object.keys(RELICS)]);
  for(const id of ids){const i=new Image();i.src=iconOf(id);ITEMIMG[id]=i;}}
const isComp=it=>it.k.length===1&&!!COMP[it.k];
const isCraft=it=>!!CRAFT[it.k];
const isUse=it=>!!USE[it.k];
function itemDef(it){if(isGim(it))return gimDef(it);if(isFormItem(it))return formItemDef(it);if(isComp(it))return COMP[it.k];if(isCraft(it))return CRAFT[it.k];return USE[it.k];}
function itemName(it){const d=itemDef(it);return(it.mut&&it.mut.length?it.mut.map(m=>MUTS[m].n).join(' ')+' ':'')+d.n;}
function itemTier(it){return isGim(it)?'gim':isFormItem(it)?'formi':isComp(it)?'common':isCraft(it)?'epic':'use';}
function addE(t,e){for(const k in e){const v=e[k];if(typeof v==='number')t[k]=(t[k]||0)+v;else if(Array.isArray(v))t[k]=[...(t[k]||[]),...v];else if(v&&typeof v==='object')t[k]=Object.assign({},t[k]||{},v);else t[k]=v;}return t;}
function itemEffects(it){
  const t={};if(isGim(it)||isFormItem(it))return t;
  if(isComp(it))addE(t,COMP[it.k].e);
  if(isCraft(it)){addE(t,COMP[it.k[0]].e);addE(t,COMP[it.k[1]].e);addE(t,CRAFT[it.k].e);}
  for(const m of it.mut||[])addE(t,MUTS[m].e);
  if(it.gs)t.dmg=(t.dmg||0)+it.gs;
  return t;
}
function rollMut(chance){if(Math.random()>=chance)return[];const m=[pick(Object.keys(MUTS))];if(Math.random()<.12){const n=pick(Object.keys(MUTS).filter(k=>k!==m[0]));m.push(n);}return m;}
const mkComp=(k,mut=[])=>({k,mut});
const randComp=()=>CORDER[Math.floor(Math.random()*8)];
const randCraft=()=>recipeKey(randComp(),randComp());
function combineItems(a,b){const mut=[...new Set([...(a.mut||[]),...(b.mut||[])])].slice(0,2);return{k:recipeKey(a.k,b.k),mut,gs:(a.gs||0)+(b.gs||0)};}

/* ================= Run state ================= */
let run=null, mode='loading', uidc=1;
let units=[],fx=[],proj=[],texts=[],leaves=[],wander=[];
let drag=null,speed=1,combatT=0,events=[],enemyPreview=[],chest=null,battle=null;
let evoQueue=[],evoOpen=false;
const BAGMAX=15;
const SIM={on:false}; // headless balancing mode: skips timers and UI

const NATPOOL=[22,26,24,16,12];
function samplePool(keep=[]){if(MODE.gen)return;MODE.byCost=MODE.byCostAll.map((l,i)=>shuffle(l).slice(0,NATPOOL[i]));for(const r of keep){const c=MODE.lines[r].cost-1;if(!MODE.byCost[c].includes(r))MODE.byCost[c].push(r);}}
function newRun(strat,keep=[]){
  samplePool(keep);
  const tidal=strat.id==='tidal';
  run={strat,hp:tidal?125:100,maxHp:tidal?125:100,gold:5,level:2,xp:0,floor:1,streak:0,aug:null,augTier:null,
    board:{},bench:Array(BENCH_N).fill(null),shop:[],results:[],wins:0,boss:pickBoss(),featured:featured(strat),
    bag:[],relics:[],freeRerolls:0,lastIncome:null,stats:{dmg:{}}};
}
const hasRelic=id=>run&&run.relics.includes(id);
const augIs=id=>run&&run.aug&&run.aug.id===id;
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
const mkUnit=(root,star=1)=>({uid:uidc++,root,dex:root,star,items:[],g:{},gs:0});
function mkEnemy(root,star){const u=mkUnit(root,star);for(let s=2;s<=star;s++){const k=MODE.kids(u.dex);if(k.length)u.dex=pick(k);}return u;}
const boardUnits=()=>Object.entries(run.board).map(([k,u])=>{const[c,r]=k.split(',').map(Number);return{u,c,r};});
const allOwned=()=>[...run.bench.filter(Boolean),...Object.values(run.board)];
const teamCap=()=>run.level+(augIs('resolve')?1:0);
const growthOf=u=>{const L=MODE.lines[u.root];if(!L)return null;return GROWTH.find(g=>L.mem.some(i=>g.ids.includes(i)))||null;};

/* ---------- sets ---------- */
function setsOf(dex,root){const K=kitOf(dex),out=[...D[dex].t,K.cls,...K.styles];if(!MODE.gen&&MODE.lines[root])out.push(REGIONS[MODE.lines[root].region]);return out;}
function lineSets(root){MODE.lsCache=MODE.lsCache||{};if(!MODE.lsCache[root]){const s=new Set();for(const d of MODE.lines[root].mem)for(const k of setsOf(d,root))s.add(k);MODE.lsCache[root]=[...s];}return MODE.lsCache[root];}
function unitSets(u){const s=setsOf(u.dex,u.root);if(u.shard&&!s.includes(u.shard))s.push(u.shard);return s;}
function countTraits(list){const seen=new Set(),ct={};
  for(const u of list){if(seen.has(u.root))continue;seen.add(u.root);for(const k of unitSets(u))ct[k]=(ct[k]||0)+1;
    if(run&&run.gimmick==='tera'&&u.shard&&u.uid===run.gimTarget)ct[u.shard]=(ct[u.shard]||0)+1;}
  return ct;}
const traitDef=k=>SETS[k];
const tierOf=(k,n)=>SETS[k]?SETS[k].bp.filter(b=>n>=b).length:0;
function setColor(k){const S=SETS[k];if(!S)return'#55606a';if(S.cat==='type')return TYPES[k];if(S.cat==='class')return CLASSCOL[k];if(S.cat==='region')return REGCOL[REGIONS.indexOf(k)];return STYLECOL;}

/* ---------- scouting (shop pity) ----------
   Once you've put real investment into a set, shop slots can be steered toward it.
   Unlocks from floor 4 for any set with 3+ different lines and ₽8+ of units. */
const SCOUT={minFloor:4,minLines:3,minGold:8,base:.15,perGold:.02,perMiss:.07,cap:.55};
function investment(){const inv={},lines={};
  for(const u of allOwned()){const w=lineOf(u).cost*Math.pow(3,u.star-1);for(const k of setsOf(u.dex,u.root)){inv[k]=(inv[k]||0)+w;(lines[k]=lines[k]||new Set()).add(u.root);}}
  return Object.keys(inv).map(k=>({k,gold:inv[k],lines:lines[k].size})).sort((a,b)=>b.gold-a.gold||b.lines-a.lines);}
function scoutState(){
  const inv=investment();
  const ok=run.floor>=SCOUT.minFloor?inv.filter(x=>x.lines>=SCOUT.minLines&&x.gold>=SCOUT.minGold).slice(0,2):[];
  const p=ok.length?Math.min(SCOUT.cap,SCOUT.base+SCOUT.perGold*(ok[0].gold-SCOUT.minGold)+SCOUT.perMiss*(run.pity||0)):0;
  return{focus:ok.map(x=>x.k),p,top:inv[0]||null};
}

/* ---------- economy ---------- */
function interestOf(){const per=run.strat.id==='verdant'?8:10,cap=(run.strat.id==='verdant'?7:5)+(hasRelic('coin-case')?3:0);return Math.min(cap,Math.floor(run.gold/per));}
function streakGold(){const s=Math.abs(run.streak);let g=s>=5?3:s>=4?2:s>=2?1:0;if(run.strat.id==='ember'&&run.streak>0)g*=2;return g;}
function incomePreview(){return{base:5,interest:interestOf(),streak:streakGold(),extra:augIs('payday')?3:0};}
function gainXP(n){if(run.level>=MAXLV)return;run.xp+=n;while(run.level<MAXLV&&run.xp>=XPNEXT[run.level]){run.xp-=XPNEXT[run.level];run.level++;if(!SIM.on)toast(`Trainer level ${run.level}! You can field ${teamCap()} Pokémon.`);}if(run.level>=MAXLV)run.xp=0;}
function buyXP(){if(mode!=='plan'||run.gold<4||run.level>=MAXLV)return false;run.gold-=4;gainXP(4);renderUI();return true;}

/* ---------- shop ---------- */
function rollCostFor(odds){let x=Math.random(),c=0;while(c<4&&x>=odds[c]){x-=odds[c];c++;}
  for(let d=0;d<5;d++){for(const cc of[c-d,c+d])if(cc>=0&&cc<5&&MODE.byCost[cc].length)return cc+1;}return 1;}
function rollShop(first){
  const o=LVODDS[run.level],sc=first?{focus:[],p:0}:scoutState();
  run.shop=[];run.scouted=[];let hit=false;
  for(let i=0;i<5;i++){let cost=rollCostFor(o),r=null;
    if(sc.focus.length&&Math.random()<sc.p){
      const costs=[cost,...[1,2,3,4,5].filter(c=>c!==cost&&o[c-1]>0).sort((a,b)=>Math.abs(a-cost)-Math.abs(b-cost))];
      for(const c of costs){const cand=MODE.byCost[c-1].filter(x=>lineSets(x).some(k=>sc.focus.includes(k)));if(cand.length){r=pick(cand);break;}}
      if(r){run.scouted[i]=true;hit=true;}}
    run.shop.push(r||pick(MODE.byCost[cost-1]));}
  if(first)run.shop[0]=run.featured[0];
  if(sc.focus.length)run.pity=hit?0:(run.pity||0)+1;
  if(!SIM.on)preload(run.shop,2000);
}
function reroll(){if(mode!=='plan')return false;if(run.freeRerolls>0)run.freeRerolls--;else{if(run.gold<2)return false;run.gold-=2;}rollShop(false);renderUI();return true;}
function buy(i){
  const root=run.shop[i];if(!root||mode!=='plan')return false;const L=MODE.lines[root];
  if(run.gold<L.cost){toast(`Not enough Pokédollars for ${D[root].n}.`);return false;}
  const copies=allOwned().filter(u=>u.dex===root&&u.star===1).length;
  const slot=run.bench.indexOf(null);
  if(slot<0&&copies<2){toast('Your bench is full. Release a Pokémon first.');return false;}
  run.gold-=L.cost;run.shop[i]=null;const u=mkUnit(root);if(!SIM.on)ensure(root);
  if(slot>=0)run.bench[slot]=u;else{const v=run.bench.findIndex(b=>b&&b.dex===root&&b.star===1);run.bench[v]=u;}
  combine();renderUI();return true;
}
function addCopy(root){const slot=run.bench.indexOf(null);if(slot<0)return false;run.bench[slot]=mkUnit(root);if(!SIM.on)ensure(root);combine();return true;}
function locate(u){for(const[k,v]of Object.entries(run.board))if(v===u){const[c,r]=k.split(',').map(Number);return{kind:'board',c,r,...hexXY(c,r)};}
  const i=run.bench.indexOf(u);if(i>=0)return{kind:'bench',i,...benchXY(i)};return null;}
function removeUnit(u){for(const k in run.board)if(run.board[k]===u)delete run.board[k];const i=run.bench.indexOf(u);if(i>=0)run.bench[i]=null;}
function combine(){
  let changed=true;
  while(changed){changed=false;const groups={};
    for(const u of allOwned()){if(u.star>=3)continue;const k=u.dex+':'+u.star;(groups[k]=groups[k]||[]).push(u);}
    for(const k in groups){const list=groups[k];if(list.length<3)continue;
      const ordered=list.sort((a,b)=>(locate(a).kind==='board'?0:1)-(locate(b).kind==='board'?0:1)||b.items.length-a.items.length);
      const keep=ordered[0];
      for(const o of[ordered[1],ordered[2]]){removeUnit(o);
        for(const it of o.items)if(keep.items.length<3)equipRaw(it,keep);else run.bag.push(it);
        for(const s in o.g)keep.g[s]=(keep.g[s]||0)+o.g[s];keep.gs+=o.gs;}
      keep.star++;
      const p=locate(keep);if(!SIM.on){burst(p.x,p.y-10,'#fff7c2',26,1.4);burst(p.x,p.y-10,TYPES[D[keep.dex].t[0]],14,1);}
      evolveStep(keep);changed=true;break;}
  }
}
function evolveStep(u){
  const before=nameOf(u),ks=MODE.kids(u.dex);
  if(ks.length===1){u.dex=ks[0];if(!SIM.on){ensure(u.dex);toast(`${before} evolved into ${nameOf(u)}!`);}}
  else if(ks.length>1){if(SIM.on){u.dex=pick(ks);return;}evoQueue.push({u,ks,before});ks.forEach(ensure);if(!evoOpen)showEvoChoice();}
  else if(!SIM.on)toast(`${before} is now ${u.star}★!`);
}
function sellValue(u){return lineOf(u).cost*Math.pow(3,u.star-1)-(u.star>1?1:0);}
function sell(u){run.gold+=sellValue(u);removeUnit(u);for(const it of u.items)run.bag.push(it);if(u.items.length&&!SIM.on)toast(`${nameOf(u)}'s items went back to your bag.`);renderUI();}

/* ---------- equipping ---------- */
function equipRaw(it,u){
  if(isComp(it)){const j=u.items.findIndex(isComp);if(j>=0){u.items[j]=combineItems(u.items[j],it);return{crafted:u.items[j]};}}
  if(u.items.length>=3)return false;u.items.push(it);return'equipped';
}
function canEquip(it,u){if(isGim(it))return true;if(isFormItem(it))return u.items.length<3;if(isUse(it))return!!USE[it.k].target;if(isComp(it)&&u.items.some(isComp))return true;return u.items.length<3;}
function useItem(bi,u){
  const it=run.bag[bi];if(!it)return false;
  if(isGim(it)){if(!u)return false;return equipGim(bi,u);}
  if(isUse(it)){
    if(USE[it.k].target){if(!u)return false;if(!addCopy(u.root)){toast('Your bench is full.');return false;}}
    else if(it.k==='potion')run.hp=Math.min(run.maxHp,run.hp+12);
    else if(it.k==='nugget')run.gold+=6;
    else if(it.k==='honey')run.freeRerolls+=4;
    run.bag.splice(bi,1);if(!SIM.on)toast(`Used ${USE[it.k].n}.`);renderUI();return true;
  }
  if(!u)return false;
  const r=equipRaw(it,u);
  if(!r){toast(`${nameOf(u)} can't hold more than 3 items.`);return false;}
  run.bag.splice(bi,1);
  if(r.crafted&&!SIM.on){const p=locate(u);burst(p.x,p.y-12,'#ffe27a',22,1.2);toast(`Crafted ${itemName(r.crafted)} on ${nameOf(u)}!`);}
  renderUI();return true;
}
function craftInBag(i,j){const a=run.bag[i],b=run.bag[j];if(!a||!b||i===j||!isComp(a)||!isComp(b))return false;
  const c=combineItems(a,b);run.bag=run.bag.filter((_,k)=>k!==i&&k!==j);run.bag.push(c);if(!SIM.on)toast(`Crafted ${itemName(c)}!`);renderUI();return true;}

/* ---------- enemies ---------- */
function buildEnemy(f){
  const kind=floorKind(f),list=[];
  if(kind==='wild'){
    const n=[2,2,3][f-1];const pool=[...MODE.byCost[0],...MODE.byCost[1]].filter(r=>SM[r]);
    for(let i=0;i<n;i++)list.push({u:mkEnemy(pick(pool),1),mult:.5+f*.07});
  }else{
    const n=ECOUNT[f];
    const p2=clamp((f-3)*.065+(kind==='elite'?.12:0),0,.75),p3=clamp((f-12)*.05,0,.2);
    const mult=(1.14+(f-4)*.03+(kind==='elite'?.06:0))*(hasRelic('town-map')?.92:1);
    if(kind==='boss'){const b=mkUnit(run.boss.root,1);b.dex=run.boss.dex;b.items=[{k:randCraft(),mut:[]},{k:randCraft(),mut:[]}];list.push({u:b,mult:hasRelic('town-map')?.92:1,boss:1});}
    const o=LVODDS[ELEVEL(f)];
    for(let i=0;i<n;i++){const root=pick(MODE.byCost[rollCostFor(o)-1]);const x=Math.random();const u=mkEnemy(root,x<p3?3:x<p3+p2?2:1);
      const pi=clamp((f-4)*.06+(kind==='elite'?.12:0),0,.7);if(Math.random()<pi)u.items.push({k:randCraft(),mut:[]});if(Math.random()<clamp((f-11)*.1,0,.4))u.items.push({k:randCraft(),mut:[]});
      list.push({u,mult});}
  }
  const taken=new Set();
  const place=rows=>{for(let t=0;t<60;t++){const r=pick(rows),c=Math.floor(rnd(0,COLS));const k=c+','+r;if(!taken.has(k)){taken.add(k);return{c,r};}}
    for(let r=0;r<4;r++)for(let c=0;c<COLS;c++)if(!taken.has(c+','+r)){taken.add(c+','+r);return{c,r};}};
  return list.map(e=>{const pos=e.boss?(taken.add('3,1'),{c:3,r:1}):place(unitStats(e.u.dex,1,1).range>1?[0,1]:[3,2,3]);return{...e,...pos};});
}
function trainerName(f){const k=floorKind(f);if(k==='wild')return'Wild Pokémon';if(k==='boss')return`${D[run.boss.dex].n}, Guardian of the Grove`;if(k==='elite')return RIVALS[f===5?0:1];return TRAINERS[(f*7+run.strat.id.length)%TRAINERS.length];}

/* ================= Floor flow ================= */
async function startFloor(){
  const f=run.floor;
  if(f>1){const inc=incomePreview();const total=inc.base+inc.interest+inc.streak+inc.extra;run.gold+=total;run.lastIncome={...inc,total};
    gainXP(2+(hasRelic('exp-share')?2:0));}
  if(hasRelic('shiny-charm'))run.freeRerolls=Math.max(run.freeRerolls,1);
  enemyPreview=buildEnemy(f);rollShop(f===1);chest=null;
  if(!SIM.on)await preload([...enemyPreview.map(e=>e.u.dex),...allOwned().map(u=>u.dex),run.boss.dex]);
  mode='plan';if(SIM.on)return;
  showGameUI(true);renderUI();
  if(f===2&&!run.aug)showAugment();
  else if(f===GIMMICK_FLOOR&&!run.gimmick)showGimmickChoice();
  else{banner(`Floor ${f}`,trainerName(f),1400);if(run.lastIncome&&f>1){const i=run.lastIncome;toast(`+₽${i.total} income: ₽${i.base} base${i.interest?` + ₽${i.interest} interest`:''}${i.streak?` + ₽${i.streak} streak`:''}${i.extra?` + ₽${i.extra} Pay Day`:''}`);}}
}
function autoFill(){
  const cap=teamCap();
  for(let i=0;i<BENCH_N&&Object.keys(run.board).length<cap;i++){const u=run.bench[i];if(!u)continue;
    const rows=unitStats(u.dex,1,1).range>1?[6,7,5]:[4,5];let placed=false;
    for(const r of rows){for(const c of[3,2,4,1,5,0,6])if(!run.board[c+','+r]){run.board[c+','+r]=u;run.bench[i]=null;placed=true;break;}if(placed)break;}}
}
function startCombat(){
  if(mode!=='plan'||evoOpen)return false;
  autoFill();const cap=teamCap(),n=Object.keys(run.board).length;
  if(!n){toast('Put at least one Pokémon on the field.');return false;}
  if(n>cap){toast(`Too many Pokémon on the field (${n}/${cap}). Move some to the bench.`);return false;}
  hideTip();mode='combat';units=[];events=[];combatT=0;proj=[];texts=[];
  battle={coin:0,flute:hasRelic('poke-flute'),weather:null,wPow:1,wSide:-1,kills:[0,0]};
  const mine=boardUnits(),ptr=countTraits(mine.map(x=>x.u)),etr=countTraits(enemyPreview.map(e=>e.u));
  for(const b of mine)units.push(makeCombatant(b.u,0,b.c,b.r,ptr,1));
  for(const e of enemyPreview)units.push(makeCombatant(e.u,1,e.c,e.r,etr,e.mult,e.boss));
  for(const c of units)formsOnStart(c);
  startOfBattle([ptr,etr]);
  for(const c of units)formsOnWeather(c);
  applyGimmicks();
  renderUI();return true;
}
function teamX(tr){const x={};for(const k in tr){const S=SETS[k],ti=tierOf(k,tr[k]);if(ti&&S.x)Object.assign(x,S.x[ti-1]);if(ti&&S.t)addE(x,S.t[ti-1]);}return x;}
function startOfBattle(trs){
  const tx=trs.map(teamX);
  // weather: your sets first, then the enemy's, then weather abilities; Cloud Nine cancels it
  let w=null;
  for(const side of[0,1])if(!w&&tx[side].weather)w={k:tx[side].weather,pow:tx[side].wPow||1,side};
  if(!w)for(const u of units)if(u.fx.weather){w={k:u.fx.weather,pow:1,side:u.team};break;}
  if(units.some(u=>u.fx.noWeather))w=null;
  if(w){battle.weather=w.k;battle.wPow=w.pow;battle.wSide=w.side;if(!SIM.on)texts.push({x:320,y:150,txt:{sun:'Harsh sunlight!',rain:'It started to rain!',sand:'A sandstorm kicked up!',snow:'It started to snow!'}[w.k],col:'#ffe27a',life:1.8,label:1});
    for(const u of units){if(w.k==='snow'&&u.team===w.side&&D[u.dex].t.includes('Ice')){u.def+=20*w.pow;u.res+=20*w.pow;}
      if(w.k==='snow'&&u.team!==w.side)u.as*=1-.1*w.pow;}}
  for(const side of[0,1]){const x=tx[side],foes=units.filter(o=>o.team!==side);
    if(x.intim)for(const o of foes)if(!o.fx.clear){o.atk*=1-x.intim;o.spa*=1-x.intim;}
    if(x.enemyAS)for(const o of foes)o.as*=1-x.enemyAS;}
  for(const u of units){
    const F=u.fx,foes=units.filter(o=>o.team!==u.team),near=r=>foes.filter(o=>hdist(o,u)<=r);
    if(F.intim)for(const o of near(2))if(!o.fx.clear){o.atk*=1-F.intim;}
    if(F.pressure)for(const o of near(2))o.ppMul*=1-F.pressure;
    if(F.aura)for(const o of units)if(o!==u&&o.team===u.team&&hdist(o,u)<=1){const a=F.aura;if(a.regen)o.regen+=a.regen;if(a.dr)o.taken*=1-a.dr;if(a.ab)o.abm+=a.ab;if(a.as)o.as*=1+a.as;if(a.aImm)o.fx.aImm=1;}
    if(F.clay)for(const o of units)if(o.team===u.team&&hdist(o,u)<=1)o.shield+=o.maxHp*F.clay;
    if(F.soothe)for(const o of units)if(o!==u&&o.team===u.team&&hdist(o,u)<=1)o.regen+=F.soothe;
    if(F.booster){u.as*=1.4;u.dmg+=.2;schedule(6,()=>{u.as/=1.4;u.dmg-=.2;});}
    if(F.boostStart&&!(F.wBoost&&battle.weather===F.wBoost)){u.dmg+=F.boostStart;schedule(8,()=>{u.dmg-=F.boostStart;});}
    if(F.boostStart&&F.wBoost&&battle.weather===F.wBoost)u.dmg+=F.boostStart;
    if(u.team===0&&hasRelic('bicycle')){u.as*=1.3;schedule(6,()=>{u.as/=1.3;});}
    if(F.speedBoost){const tick=()=>{if(u.dead)return;if(u.sbN<8){u.sbN++;u.as*=1+F.speedBoost;}schedule(2,tick);};schedule(2,tick);}
    const wk=battle.weather;
    if(wk){if(F.wAS&&F.wAS[wk])u.as*=1+F.wAS[wk];if(F.wSpa&&F.wSpa[wk])u.spa*=1+F.wSpa[wk];if(F.wAtk&&F.wAtk[wk])u.atk*=1+F.wAtk[wk];if(F.wDmg&&F.wDmg[wk])u.dmg+=F.wDmg[wk];if(F.wRegen&&F.wRegen[wk])u.regen+=F.wRegen[wk];if(F.wDodge&&F.wDodge[wk])u.dodge+=F.wDodge[wk];}
  }
}
function makeCombatant(u,team,c,r,tr,mult,boss){
  const L=lineOf(u),K=kitOf(u.dex),st=unitStats(u.dex,L.cost,u.star),g=u.g||{};
  const E={};for(const it of u.items)addE(E,itemEffects(it));
  for(const k of unitSets(u)){const ti=tierOf(k,tr[k]||0);if(ti&&SETS[k].m)addE(E,SETS[k].m[ti-1]);}
  for(const k in tr){const ti=tierOf(k,tr[k]);if(ti&&SETS[k].t)addE(E,SETS[k].t[ti-1]);}
  if(K.ab)addE(E,K.ab.e);
  let taken=1;
  if(team===0){const s=run.strat.id,ty=D[u.dex].t;
    if(s==='ember'&&ty.includes('Fire'))addE(E,{dmg:.15});
    if(s==='tidal'){taken*=.9;if(ty.includes('Water'))addE(E,{mana:10});}
    if(s==='verdant'&&ty.includes('Grass'))addE(E,{regen:.01});
    if(augIs('tailwind'))addE(E,{as:.12});if(augIs('oran'))addE(E,{hpF:150});if(augIs('swords'))addE(E,{dmg:.18});if(augIs('champion'))addE(E,{dmg:.3,as:.15});if(augIs('endure'))E.focus=(E.focus||0)+1;
    if(hasRelic('soothe-bell'))addE(E,{regen:.015});if(hasRelic('rainbow-wing'))addE(E,{hpP:.12,dmg:.12});if(hasRelic('silver-wing'))addE(E,{shieldP:.15});
  }
  if(E.dr)taken*=1-Math.min(.6,E.dr);
  const bm=boss?{hp:5.5,atk:1.55,def:15}:{hp:1,atk:1,def:0};
  let hp=(st.hp*mult+(g.hp||0))*bm.hp+(E.hpF||0);hp*=1+(E.hpP||0);
  let def=st.def+(E.def||0)+(g.def||0)+bm.def,res=st.res+(E.res||0)+(g.res||0)+bm.def;
  if(E.eviolite&&MODE.kids(u.dex).length){def*=1.5;res*=1.5;hp*=1.2;}
  const x={u,team,c,r,boss:!!boss,fx:E,kit:K,mv:K.mv,cat:st.cat,kind:st.kind,base:st.base*mult*(boss?2:1),pf:st.pf,
    hp,maxHp:hp,atk:(st.atk*mult+(g.atk||0))*bm.atk*(1+(E.atkP||0)),spa:(st.spa*mult+(g.spa||0))*bm.atk*(1+(E.spaP||0)),
    def,res,as:st.as*(1+(E.as||0)+(g.as||0)),range:st.range+(E.range||0),maxMana:st.mana,mana:st.mana?st.start+(E.mana||0):0,
    dmg:1+(E.dmg||0),abm:1+(E.ab||0),physAb:E.physAb||0,specAb:E.specAb||0,crit:E.crit||0,critD:.5+(E.critD||0),abCrit:!!E.abCrit,
    ls:E.ls||0,regen:E.regen||0,dodge:Math.min(.6,E.dodge||0),taken,shield:hp*(E.shieldP||0),healAmp:E.healAmp||0,
    focus:E.focus||0,orb:E.orb||0,giant:E.giant||0,shred:E.shred||0,extraPP:E.extraPP||0,metroAS:E.metroAS||0,metroN:0,
    bulb:!!E.bulb,burnP:E.burn||0,spray:E.spray||0,specPen:E.specPen||0,wp:E.wp||0,magnet:!!E.magnet,magN:0,double:E.double||0,
    helmet:E.helmet||0,sitrus:E.sitrus||0,sitrusN:E.sitrusN||1,assault:E.assault||0,stunImm:!!E.stunImm,cloak:E.cloak||0,
    xpEgg:E.xp||0,kee:E.kee||0,leppa:E.leppa||0,coin:!!E.coin,goldMut:E.gold||0,revive:E.revive||0,
    ppMul:1,sbN:0,momN:0,atkN:0,enrN:0,dodgeN:E.dodgeN||0,disguise:E.disguise||0,
    kills:0,casts:0,hits:0,dealt:0,burn:null,poison:null,slowT:0,slowP:0};
  const p=hexXY(c,r);
  return Object.assign(x,{x:p.x,y:p.y,dex:u.dex,dir:team?DIR.down:DIR.up,anim:'Idle',animT:Math.random(),loop:true,cd:rnd(.1,.5),target:null,move:null,stun:0,dead:false,deadT:0,flash:0,busy:0});
}

/* ================= Combat ================= */
const alive=t=>units.filter(u=>!u.dead&&u.team===t);
const occupied=(c,r,ex)=>units.some(u=>u!==ex&&!u.dead&&((u.c===c&&u.r===r)||(u.move&&u.move.c===c&&u.move.r===r)));
function setAnim(u,a,loop=false){if(SIM.on)return;u.anim=a;u.animT=0;u.loop=loop;}
function schedule(dt,fn){events.push({t:combatT+dt,fn});}
const aLen=(u,a)=>SIM.on?.5:animLen(u.dex,a), hTime=(u,a)=>SIM.on?.25:hitTime(u.dex,a);
const lowHp=(u,f)=>u.hp<u.maxHp*f;
function effAS(u){let a=u.as*(1+(u.fx.momentum||0)*u.momN);if(u.fx.lowAS&&lowHp(u,.5))a*=1+u.fx.lowAS;if(u.slowT>0)a*=1-u.slowP;return a;}
function stepCombat(dt){
  combatT+=dt;
  for(let i=events.length-1;i>=0;i--)if(events[i].t<=combatT){const e=events[i];events.splice(i,1);e.fn();}
  const sand=battle.weather==='sand',sandP=.01*battle.wPow;
  for(const u of units){
    u.animT+=dt;u.flash=Math.max(0,u.flash-dt);
    if(u.dead){u.deadT+=dt;continue;}
    if(!SIM.on&&!u.loop&&u.animT>=animLen(u.dex,u.anim)&&!u.move)setAnim(u,'Idle',true);
    if(u.regen>0)heal(u,u.maxHp*u.regen*dt,true);
    for(const k of['burn','poison'])if(u[k]){u[k].t-=dt;if(!u.fx.mGuard)hurt(u,u.maxHp*u[k].p*dt,u[k].src);if(u[k]&&u[k].t<=0)u[k]=null;}
    if(sand&&u.team!==battle.wSide&&!u.fx.mGuard&&!u.fx.noWeatherChip&&!D[u.dex].t.some(t=>t==='Rock'||t==='Ground'||t==='Steel'))hurt(u,u.maxHp*sandP*dt,null);
    if(u.dead)continue;
    if(u.slowT>0)u.slowT-=dt;
    if(u.stun>0){u.stun-=dt;continue;}
    u.cd-=dt;u.busy-=dt;
    if(u.move){u.move.t+=dt/u.move.dur;const k=Math.min(1,u.move.t);u.x=u.move.fx+(u.move.tx-u.move.fx)*k;u.y=u.move.fy+(u.move.ty-u.move.fy)*k;
      if(k>=1){u.c=u.move.c;u.r=u.move.r;u.move=null;setAnim(u,'Idle',true);}continue;}
    if(u.busy>0)continue;
    if(!u.target||u.target.dead){const foes=alive(1-u.team);if(!foes.length)continue;foes.sort((a,b)=>hdist(u,a)-hdist(u,b)||Math.random()-.5);u.target=foes[0];}
    const tg=u.target,d=hdist(u,tg);
    if(d<=u.range){u.dir=dirFrom(tg.x-u.x,(tg.y-u.y)/SQ);
      if(u.maxMana>0&&u.mana>=u.maxMana){cast(u,tg);continue;}
      if(u.cd<=0){attack(u,tg);u.cd=1/effAS(u);}}
    else{const opts=nbrs(u.c,u.r).filter(h=>!occupied(h.c,h.r,u)).map(h=>({...h,d:hdist(h,tg)+Math.random()*.3}));opts.sort((a,b)=>a.d-b.d);
      if(opts.length&&opts[0].d<d+.2){const h=opts[0],p=hexXY(h.c,h.r);u.move={c:h.c,r:h.r,fx:u.x,fy:u.y,tx:p.x,ty:p.y,t:0,dur:.42};u.dir=dirFrom(p.x-u.x,(p.y-u.y)/SQ);setAnim(u,'Walk',true);}
      else u.target=null;}
  }
  const a=alive(0).length,b=alive(1).length;
  if((!a||!b||combatT>45)&&!events.some(e=>e.end))events.push({t:combatT+(SIM.on?0:1.1),end:1,fn:()=>endCombat(a&&b?(hpFrac(0)>=hpFrac(1)):!!a)});
}
const hpFrac=t=>{const l=units.filter(u=>u.team===t);return l.reduce((s,u)=>s+Math.max(0,u.hp)/u.maxHp,0)/l.length;};
const tcol=u=>TYPES[(u.mv&&u.mv.t)||D[u.dex].t[0]]||'#fff';
function stun(tg,t){if(tg.stunImm||tg.dead)return;tg.stun=Math.max(tg.stun,t);}
function gainMana(u,n){if(u.maxMana>0)u.mana=Math.min(u.maxMana,u.mana+n*u.ppMul);}
function autoAmt(u){return u.cat==='spec'?u.spa*.8:u.atk;}
function attack(u,tg){
  const anim=u.range>1?'Shoot':'Attack';setAnim(u,anim);u.busy=Math.min(aLen(u,anim),.55);
  schedule(hTime(u,anim),()=>{if(u.dead)return;
    const hit=()=>{if(tg.dead)return;if(u.fx.miss&&Math.random()<u.fx.miss){if(!SIM.on)texts.push({x:tg.x,y:tg.y-22,txt:'Miss',col:'#cfe0ff',life:.7});return;}
      damage(u,tg,autoAmt(u),{cat:u.cat,auto:1});onHitFx(u,tg);};
    if(u.range>1&&!SIM.on)shoot(u,tg,tcol(u),hit);else{hit();if(!SIM.on)spark(tg.x,tg.y-10,'#ffffff',5);}
    if(u.double&&Math.random()<u.double)schedule(.12,hit);
    gainMana(u,10+u.extraPP);u.atkN++;
    if(u.orb)u.hp=Math.max(1,u.hp-u.maxHp*u.orb);
    if(u.metroAS&&u.metroN<12){u.metroN++;u.as*=(1+u.metroAS*u.metroN)/(1+u.metroAS*(u.metroN-1));}
    if(u.magnet&&++u.magN%3===0)zap(u,60+.3*u.spa,'#ffe14d');
    if(u.fx.zap&&u.atkN%3===0)zap(u,u.fx.zap*(u.u.star>1?1+.5*(u.u.star-1):1),'#ffe14d');
    if(u.kind==='rapid'&&u.atkN%KIT.rapidEvery===0&&!tg.dead)useMove(u,tg,KIT.rapidPow,!(u.zReady||u.dmaxOn));
  });
}
function zap(u,amt,col){alive(1-u.team).sort((a,b)=>hdist(u,a)-hdist(u,b)).slice(0,3).forEach(o=>{damage(u,o,amt,{cat:'spec',noCrit:1});if(!SIM.on)burst(o.x,o.y-10,col,6,.6);});}
function onHitFx(u,tg){
  if(u.shred&&!tg.fx.clear)tg.def=Math.max(0,tg.def-u.shred);
  if(u.burnP)setDot(tg,'burn',u.burnP,4,u);
  if(u.fx.poisonHit)setDot(tg,'poison',u.fx.poisonHit,3,u);
  if(u.fx.hitAil&&Math.random()<u.fx.hitAil.c)applyAil(u,tg,u.fx.hitAil.ail);
  if(u.fx.flinch&&Math.random()<u.fx.flinch&&!tg.fx.fImm)stun(tg,.35);
  // contact abilities on the target
  const T=tg.fx.touch;if(T&&(u.range===1||T.any)&&!u.dead&&Math.random()<T.c){if(T.slow){u.slowT=3;u.slowP=Math.max(u.slowP,T.slow);}else applyAil(tg,u,T.ail===-1?pick([1,2,5]):T.ail);}
}
function setDot(t,k,p,dur,src){if(t.dead||t.fx.mGuard||t.fx.aImm&&k!=='burn'&&false)return;t[k]={p:Math.max(p,t[k]?t[k].p:0),t:Math.max(dur,t[k]?t[k].t:0),src};}
function applyAil(src,t,id){
  const a=AIL[id];if(!a||t.dead||t.fx.aImm)return;
  if(a.stun)stun(t,a.stun);
  if(a.slow){t.slowT=a.t;t.slowP=Math.max(t.slowP,a.slow);}
  if(a.dot)setDot(t,id===4?'burn':'poison',a.dot,a.t,src);
  if(!SIM.on)texts.push({x:t.x,y:t.y-30,txt:a.n,col:'#d8c7ff',life:.8,label:1});
}
function shoot(u,tg,col,onHit,size=2){proj.push({x:u.x,y:u.y-10,tg,col,onHit,size,trail:[]});}
function hurt(tg,d,src){if(tg.dead)return;let left=d;if(tg.shield>0){const s=Math.min(tg.shield,left);tg.shield-=s;left-=s;}tg.hp-=left;checkHp(tg,src);}
function checkHp(tg,src){
  if(tg.sitrus&&tg.sitrusN>0&&tg.hp>0&&tg.hp<tg.maxHp*.5){heal(tg,tg.maxHp*tg.sitrus);tg.sitrusN--;}
  if(tg.kee&&tg.hp>0&&tg.hp<tg.maxHp*.4){tg.def+=tg.kee;tg.res+=tg.kee;tg.kee=0;}
  if(tg.fx.lowDef&&!tg.lowDefOn&&lowHp(tg,.5)){tg.lowDefOn=1;tg.def+=tg.fx.lowDef;}
  if(tg.fx.lowAtk&&!tg.lowAtkOn&&lowHp(tg,.5)){tg.lowAtkOn=1;tg.atk*=1+tg.fx.lowAtk;}
  if(tg.fx.lowSpa&&!tg.lowSpaOn&&lowHp(tg,.5)){tg.lowSpaOn=1;tg.spa*=1+tg.fx.lowSpa;}
  if(tg.hp>0){formsOnHp(tg);return;}
  if(tg.focus>0){tg.focus--;tg.hp=1;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Hung on!',col:'#ff8a7a',life:1.2});return;}
  if(tg.revive>0){tg.hp=tg.maxHp*tg.revive;tg.revive=0;tg.burn=tg.poison=null;if(!SIM.on){texts.push({x:tg.x,y:tg.y-30,txt:'Revived!',col:'#ffe27a',life:1.2});burst(tg.x,tg.y-10,'#ffe27a',16,1);}return;}
  if(tg.team===0&&battle.flute){battle.flute=false;tg.hp=tg.maxHp*.35;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Woke up!',col:'#c6b3ff',life:1.2});return;}
  tg.dead=true;tg.hp=0;setAnim(tg,'Faint');tg.move=null;if(!SIM.on)burst(tg.x,tg.y-8,'#ffffff',10,.7);
  battle.kills[1-tg.team]++;
  for(const o of units)if(!o.dead&&o.team!==tg.team&&o.fx.momentum)o.momN++;
  if(tg.fx.aftermath&&src&&!src.dead&&!src.fx.mGuard)hurt(src,src.maxHp*tg.fx.aftermath,null);
  if(src&&!src.dead&&src.team!==tg.team){src.kills++;
    if(src.fx.moxie){src.atk*=1+src.fx.moxie;src.spa*=1+src.fx.moxie;}
    if(src.coin&&src.team===0&&battle.coin<2){battle.coin++;run.gold++;if(!SIM.on)texts.push({x:src.x,y:src.y-30,txt:'+₽1',col:'#ffd34d',life:1});}}
}
function dmgMult(src,tg){let m=src.dmg;
  if(src.fx.pinch&&lowHp(src,1/3))m+=src.fx.pinch;
  if(src.fx.lowDmg&&lowHp(src,.5))m+=src.fx.lowDmg;
  if(src.fx.momentum)m+=src.fx.momentum*src.momN;
  if(src.fx.execute&&lowHp(tg,.5))m+=src.fx.execute;
  return m;}
function damage(src,tg,amt,o={}){
  if(!tg||tg.dead)return 0;
  if(o.type&&tg.fx.immune&&tg.fx.immune.includes(o.type)){
    if(tg.fx.absorb)heal(tg,tg.maxHp*.08);if(tg.fx.absorbBuff){tg.atk*=1.08;tg.spa*=1.08;tg.as*=1.05;}
    if(!SIM.on)texts.push({x:tg.x,y:tg.y-22,txt:'Immune',col:'#cfe0ff',life:.8});return 0;}
  if(!o.ab&&!src.fx.noGuard){if(tg.dodgeN>0){tg.dodgeN--;if(!SIM.on)texts.push({x:tg.x,y:tg.y-22,txt:'Miss',col:'#cfe0ff',life:.7});return 0;}
    if(tg.dodge&&Math.random()<tg.dodge){if(!SIM.on)texts.push({x:tg.x,y:tg.y-22,txt:'Miss',col:'#cfe0ff',life:.7});return 0;}}
  const canCrit=!o.noCrit&&!tg.fx.noCrit&&(!o.ab||src.abCrit||o.cr);
  const crit=canCrit&&(Math.random()<src.crit+(o.cr||0)||(src.fx.merciless&&tg.poison));
  let d=amt*dmgMult(src,tg)*(crit?1+src.critD:1);
  if(o.ab){d*=src.abm*(1+(o.cat==='phys'?src.physAb:src.specAb));if(o.type&&src.fx.typeBoost&&src.fx.typeBoost[o.type])d*=1+src.fx.typeBoost[o.type];}
  if(o.type&&battle.weather){const w=battle.weather,p=battle.wPow;if(w==='sun'){if(o.type==='Fire')d*=1+(p>1?.35:.2);if(o.type==='Water')d*=.85;}if(w==='rain'){if(o.type==='Water')d*=1+(p>1?.35:.2);if(o.type==='Fire')d*=.85;}}
  if(src.giant&&tg.maxHp>1500)d*=1+src.giant;
  const pen=src.fx.pen||0;
  if(o.cat==='phys')d*=100/(100+tg.def*(1-pen));else if(o.cat==='spec')d*=100/(100+tg.res*(1-src.specPen)*(1-pen));
  if(o.cat==='spec')d*=1-tg.assault;
  if(o.cat==='phys'&&tg.fx.physDr)d*=1-tg.fx.physDr;
  if(!o.ab&&src.range===1&&tg.fx.meleeDr)d*=1-tg.fx.meleeDr;
  if(o.ab)d*=1-tg.cloak;
  if(tg.fx.multiscale&&tg.hp>=tg.maxHp-.5)d*=1-tg.fx.multiscale;
  d*=tg.taken;
  if(tg.disguise>0&&d>0){tg.disguise--;d=0;formsOnDisguiseBroken(tg);if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Disguise!',col:'#ffe27a',life:1});}
  if(tg.iceFace&&o.cat==='phys'&&d>0){tg.iceFace=0;d=0;formsOnIceFace(tg);}
  tg.hits++;src.dealt+=d;
  if(!SIM.on&&d>0){tg.flash=.15;if(OPTS.dmg)texts.push({x:tg.x+rnd(-6,6),y:tg.y-22,txt:Math.round(d)+(crit?'!':''),col:o.ab?(o.cat==='spec'?'#b9a4ff':'#ffd34d'):crit?'#ffb08a':'#ffffff',big:o.ab||crit,life:.9});}
  gainMana(tg,Math.min(12,d*.04));
  if(src.ls&&!src.dead)heal(src,d*src.ls,true);
  if(src.fx.lowLs&&lowHp(src,.5)&&!src.dead)heal(src,d*src.fx.lowLs,true);
  if(!o.ab&&src.range===1&&tg.helmet&&!src.dead&&!src.fx.mGuard)hurt(src,tg.maxHp*tg.helmet,tg);
  if(o.ab){
    if(tg.bulb){gainMana(tg,20);tg.spa*=1.1;}
    if(tg.wp){tg.atk*=1+tg.wp;tg.spa*=1+tg.wp;tg.wp=0;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Policy!',col:'#ffd34d',life:1});}
    if(tg.fx.enrage&&tg.enrN<5){tg.enrN++;tg.atk*=1+tg.fx.enrage;tg.spa*=1+tg.fx.enrage;}
    if(tg.fx.rattled&&tg.enrN<5){tg.enrN++;tg.as*=1+tg.fx.rattled;}
    if(tg.fx.weakArmor&&o.cat==='phys'&&tg.enrN<3){tg.enrN++;tg.def=Math.max(0,tg.def-5);tg.as*=1.12;}
  }
  if(tg.fx.stamina&&tg.hits<=20)tg.def+=tg.fx.stamina/4;
  if(crit&&tg.fx.angerPoint&&!tg.angered){tg.angered=1;tg.atk*=1+tg.fx.angerPoint;}
  if(tg.fx.ignoreShield&&false){}
  hurt(tg,d,src);
  if(!tg.dead&&!SIM.on&&!tg.move&&tg.busy<=0&&Math.random()<.3){setAnim(tg,'Hurt');tg.busy=.2;}
  return d;
}
function heal(u,amt,quiet){if(u.dead)return;if(u.burn)amt*=.5;const h=Math.min(u.maxHp-u.hp,amt);u.hp+=h;if(!quiet&&h>1&&!SIM.on)texts.push({x:u.x,y:u.y-24,txt:'+'+Math.round(h),col:'#7dff7a',life:.9});}
function moveValue(c){
  if(c.kind==='heal'&&!c.strike)return{base:c.base,ratio:KIT.healRatio,stat:c.spa,statN:'Sp. Atk',total:(c.base+KIT.healRatio*c.spa)*(1+c.healAmp)};
  if(c.kind==='guard'&&!c.strike)return{base:c.base*1.3,ratio:.12,stat:c.maxHp,statN:'max HP',total:c.base*1.3+.12*c.maxHp};
  const ratio=KIT.castRatio*c.pf,stat=c.cat==='spec'?c.spa:c.atk;
  return{base:c.base,ratio,stat,statN:c.cat==='spec'?'Sp. Atk':'Attack',total:c.base+ratio*stat};
}
function applyStat(t,stat,ch){const k=STATKEY[stat];if(!k)return;
  if(k==='def'||k==='res')t[k]=Math.max(0,t[k]+8*ch);else if(k==='as')t.as*=Math.max(.5,1+.08*ch);else t[k]*=Math.max(.5,1+.08*ch);}
function hitsFor(u){const mv=u.mv;if(!mv.hmax||mv.hmax<=1)return 1;let n=u.fx.skillLink?mv.hmax:Math.round((mv.hmin+mv.hmax)/2);return n+(u.fx.hitsB||0);}
function useMove(u,tg,pow=1,free=false){
  const mv=u.mv,cat=u.cat,col=tcol(u);
  u.strike=1;let total=moveValue(u).total*pow;u.strike=0;if(u.fx.technician&&mv.p&&mv.p<=60)total*=1+u.fx.technician;
  const G=free?null:gimmickMove(u,mv);if(G)total*=G.mult;
  const aoeK=G&&G.aoe?Math.max(1,u.kit.aoe):u.kit.aoe;
  const baseHits=mv.hmax>1?(mv.hmin+mv.hmax)/2:1,n=hitsFor(u),per=total/baseHits;
  const spl=(u.kit.aoe===2?.5:.6)+(u.fx.splash||0);
  const targets=()=>{if(tg.dead)return[];if(!aoeK)return[tg];const r=aoeK===2?2:1,c=aoeK===2?u:tg;return[tg,...alive(tg.team).filter(o=>o!==tg&&hdist(o,c)<=r)];};
  const go=()=>{const ts=targets();let dealt=0;
    for(let i=0;i<n;i++)schedule(i*.09,()=>{for(const t of ts){if(t.dead)continue;const amt=per*(t===tg?1:spl);dealt+=damage(u,t,G&&G.aoe&&t!==tg?per*.8:amt,{ab:1,cat,type:mv.t,cr:(mv.cr||0)*.25});applyMoveFx(u,t,mv);}
      if(i===n-1){afterMove(u,mv,dealt);if(G&&G.after)G.after();}});
    if(!SIM.on)for(const t of ts)burst(t.x,t.y-10,col,u.kit.aoe?12:14,1);};
  if(!SIM.on&&u.range>1&&!u.kit.aoe)shoot(u,tg,col,go,3);else go();
  if(!free&&!SIM.on){texts.push({x:u.x,y:u.y-34,txt:G&&G.name?G.name:mv.n,col:G&&G.col?G.col:'#ffffff',life:G&&G.big?1.8:1.1,label:1,big:G&&G.big});if(G&&G.big)for(const t of targets())burst(t.x,t.y-10,G.col,30,1.6);}
  else if(free&&!SIM.on)texts.push({x:u.x,y:u.y-34,txt:mv.n,col:'#ffe9a8',life:.8,label:1});
}
function afterMove(u,mv,dealt){
  if(u.dead)return;
  if(mv.dr>0)heal(u,dealt*mv.dr/100*(1+u.healAmp));
  if(mv.dr<0&&!u.fx.noRecoil&&!u.fx.mGuard)hurt(u,dealt*(-mv.dr)/100*.5,null);
  if(mv.st&&mv.st.length&&(mv.mc===7||mv.mc===2)&&Math.random()<((mv.sc||100)/100)*(u.fx.serene?2:1))for(const[s,ch]of mv.st)if(!(ch<0&&u.fx.clear))applyStat(u,s,ch);
}
function applyMoveFx(u,t,mv){
  if(t.dead)return;const ser=u.fx.serene?2:1;
  if(mv.ail&&!u.fx.noAil){const c=(mv.ailc||(mv.mc===1?100:0))/100;if(c>0&&Math.random()<Math.min(1,c*ser*(1+(u.fx.ailP||0))))applyAil(u,t,mv.ail);}
  if(mv.fl&&!u.fx.noAil&&!t.fx.fImm&&Math.random()<mv.fl/100*ser)stun(t,.35);
  if(mv.mc===6&&mv.st&&!t.fx.clear&&Math.random()<((mv.sc||100)/100)*ser)for(const[s,ch]of mv.st)if(ch<0)applyStat(t,s,ch);
}
function cast(u,tg){
  u.mana=0;u.casts++;const K=u.kit;formsOnCast(u);
  const anim=K.type==='heal'||K.type==='guard'||u.range>1?'Shoot':'Attack';setAnim(u,anim);u.busy=Math.min(aLen(u,anim),.7);
  schedule(hTime(u,anim),()=>{if(u.dead)return;
    if((u.zReady||u.dmaxOn)&&K.type!=='cast'&&!tg.dead){useMove(u,tg);if(u.spray)u.spa*=1+u.spray;if(u.leppa)gainMana(u,u.leppa);return;}
    if(K.type==='heal'){const hm=K.hm,v=moveValue(u).total;
      const al=hm.tg===7?u:alive(u.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
      if(al){heal(al,v);if(!SIM.on){ring(al.x,al.y-8,'#c6ff8a');burst(al.x,al.y-12,'#e9ffb0',12,.6);texts.push({x:u.x,y:u.y-34,txt:hm.n,col:'#ffffff',life:1.1,label:1});}}
      if(hm.st)for(const[s,ch]of hm.st)if(ch>0)applyStat(u,s,ch);
      if(!tg.dead&&hdist(u,tg)<=u.range)schedule(.35,()=>{if(!u.dead&&!tg.dead)useMove(u,tg,.5,true);});}
    else if(K.type==='guard'){const gm=K.gm,v=moveValue(u).total;
      u.shield+=gm&&gm.st&&gm.st.length?v:v*1.4;
      if(gm&&gm.st)for(const[s,ch]of gm.st)if(ch>0)applyStat(u,s,ch);
      if(!SIM.on){ring(u.x,u.y-8,'#dfe8ff');texts.push({x:u.x,y:u.y-34,txt:(gm||u.mv).n,col:'#ffffff',life:1.1,label:1});}
      if(!tg.dead&&hdist(u,tg)<=u.range)schedule(.35,()=>{if(!u.dead&&!tg.dead)useMove(u,tg,.6,true);});}
    else useMove(u,tg);
    if(u.spray)u.spa*=1+u.spray;
    if(u.leppa)gainMana(u,u.leppa);
  });
}
function endCombat(win){
  mode='result';const f=run.floor,kind=floorKind(f);
  // growth, lucky eggs, golden items
  const grew=[];let xp=0,gold=0;
  for(const c of units){if(c.team!==0)continue;const u=c.u;formsAfterBattle(u);
    xp+=c.xpEgg;if(win)gold+=c.goldMut;if(c.fx.pickup&&Math.random()<c.fx.pickup)gold++;
    for(const it of u.items)if((it.mut||[]).includes('growing'))it.gs=(it.gs||0)+.02;
    const G=growthOf(u);if(!G)continue;
    let n=G.on==='battle'?1:G.on==='win'?(win?1:0):G.on==='kill'?c.kills:G.on==='cast'?c.casts:G.on==='hit'?Math.floor(c.hits/G.every):0;
    if(n>0){for(const s in G.per)u.g[s]=(u.g[s]||0)+G.per[s]*n;u.gs+=n;grew.push(`${nameOf(u)} +${n}`);if(G.gold)for(let i=0;i<n;i++)if(Math.random()<G.gold||G.gold>=1)gold+=Math.max(1,Math.floor(G.gold));}
  }
  if(xp)gainXP(xp);
  let msg='';
  if(win){run.wins++;run.streak=Math.max(1,run.streak+1);gold+=1;run.results[f]='win';msg=`+₽${gold}`;
    if(hasRelic('oval-charm')){const own=allOwned();if(own.length&&addCopy(pick(own).root))msg+=' · Oval Charm found a Pokémon';}}
  else{run.streak=Math.min(-1,run.streak-1);const surv=alive(1).reduce((s,u)=>s+u.u.star,0);let dmg=3+Math.round(surv*1.5)+Math.floor(f/3)+(kind==='boss'?8:0)+(kind==='elite'?3:0);if(run.strat.id==='ember')dmg+=2;
    run.hp=Math.max(0,run.hp-dmg);run.results[f]='loss';msg=`Trainer takes ${dmg} damage`;}
  run.gold+=gold;
  if(SIM.on){afterResult(win);return;}
  banner(win?'Victory!':'Defeat',msg,1600);
  if(grew.length)setTimeout(()=>toast(`Grew stronger: ${grew.join(', ')}`),900);
  renderUI();
  setTimeout(()=>afterResult(win),1800);
}
function afterResult(win){
  units=[];proj=[];
  if(run.hp<=0)return SIM.on?(mode='over'):showEnd(false);
  if(run.floor>=FLOORS)return SIM.on?(mode='over'):showEnd(win);
  // loot: a chest after every floor, a relic after beating a rival
  run.pendingRelic=win&&floorKind(run.floor)==='elite';
  run.loot=rollLoot(!win);
  mode='loot';
  if(SIM.on)return;
  chest={x:hexXY(3,2).x,y:hexXY(3,2).y,t:0,open:false,kind:run.pendingRelic?'relic':'item'};
  renderUI();
}
function rollLoot(lost){
  const f=run.floor,n=3+(hasRelic('dowsing-machine')?1:0),elite=floorKind(f)==='elite'&&!lost,out=[];
  const pCraft=elite?1:clamp(.08+f*.025,0,.45)*(lost?.5:1),pUse=.15;
  for(let i=0;i<n;i++){const x=Math.random();
    if(x<pCraft)out.push({k:randCraft(),mut:rollMut(.3+f*.015)});
    else if(x<pCraft+pUse&&!elite)out.push({k:pick(Object.keys(USE)),mut:[]});
    else out.push(mkComp(randComp(),rollMut(.12+f*.01)));}
  if(hasRelic('super-rod')&&!out.some(isCraft))out[0]={k:randCraft(),mut:rollMut(.3)};
  if(run.gimmick&&Math.random()<({dmax:.4,mega:.5,zmove:.35,tera:.35}[run.gimmick])*(lost?.6:1)){const g=gimLootItem();if(g)out[out.length-1]=g;}
  if(run.megaPity&&run.gimmick==='mega'){const g=gimLootItem();if(g){out[0]=g;run.megaPity=0;}}
  {const fi=ownedFormItems().filter(x=>!run.bag.some(b=>b.k==='form:'+x)&&!allOwned().some(u=>u.items.some(i=>i.k==='form:'+x)));if(fi.length&&Math.random()<.15)out[1]={k:'form:'+pick(fi),mut:[]};}
  return out;
}
function takeLoot(i){
  if(mode!=='loot')return false;
  if(i<0){run.gold+=2;}else{const it=run.loot[i];if(!it)return false;
    if(isUse(it)&&!USE[it.k].target){run.bag.push(it);}else run.bag.push(it);
    if(run.bag.length>BAGMAX){run.bag.pop();toast('Your bag is full.');return false;}}
  run.loot=null;
  if(run.pendingRelic){run.relicChoices=shuffle(Object.keys(RELICS).filter(r=>!run.relics.includes(r))).slice(0,3);return'relic';}
  return nextFloor();
}
function takeRelic(i){if(run.relicChoices&&run.relicChoices[i])run.relics.push(run.relicChoices[i]);run.relicChoices=null;run.pendingRelic=false;return nextFloor();}
function nextFloor(){run.floor++;chest=null;return startFloor();}

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
  if(chest)chest.t+=dt;
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
  if(run&&['plan','augment','combat','result','loot'].includes(mode)){
    if(drag||itemDrag){for(let r=4;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r);hexPath(ctx,p.x,p.y,R-2,SQ);const ov=drag&&drag.over;const hov=ov&&ov.kind==='board'&&ov.c===c&&ov.r===r;ctx.fillStyle=hov?'rgba(255,230,120,.45)':'rgba(255,255,255,.12)';ctx.fill();}
      if(drag&&drag.over&&drag.over.kind==='bench'){const p=benchXY(drag.over.i);ctx.fillStyle='rgba(255,230,120,.5)';ctx.beginPath();ctx.ellipse(p.x,p.y,12,5,0,0,7);ctx.fill();}}
    if(mode==='combat'||mode==='result'){for(const u of units){if(u.dead&&u.deadT>1.2)continue;list.push({dex:u.dex,anim:u.anim,t:u.animT,dir:u.dir,x:u.x,y:u.y,loop:u.loop,alpha:u.dead?Math.max(0,1-u.deadT/1.2):1,cu:u,shadow:1,sc:(u.boss?1.25:starScale(u.u.star))*(u.scaleMul||1)});}}
    else{for(const b of boardUnits()){if(drag&&drag.u===b.u)continue;const p=hexXY(b.c,b.r);list.push({dex:shownDex(b.u),anim:'Idle',t:t+b.u.uid*.37,dir:DIR.up,x:p.x,y:p.y,pu:b.u,shadow:1,sc:starScale(b.u.star)});}
      if(mode!=='loot')for(const e of enemyPreview){const p=hexXY(e.c,e.r);list.push({dex:e.u.dex,anim:'Idle',t:t+e.u.uid*.29,dir:DIR.down,x:p.x,y:p.y,pu:e.u,enemy:1,shadow:1,sc:e.boss?1.25:starScale(e.u.star)});}}
    run.bench.forEach((u,i)=>{if(!u||(drag&&drag.u===u))return;const p=benchXY(i);list.push({dex:u.dex,anim:'Idle',t:t+u.uid*.41,dir:DIR.down,x:p.x,y:p.y-2,pu:u,bench:1});});
  }
  list.sort((a,b)=>a.y-b.y);
  for(const s of list)if(s.shadow){ctx.fillStyle=`rgba(10,30,10,${.35*(s.alpha??1)})`;ctx.beginPath();ctx.ellipse(s.x,s.y+1,9*(s.sc||1),3.2,0,0,7);ctx.fill();}
  if(chest)drawChest(chest,t);
  for(const s of list){const o={loop:s.loop!==false,alpha:s.alpha??1,scale:s.sc||1};
    const cu=s.cu,F=FORMS[s.dex];
    if(cu&&!cu.dead&&(cu.dmaxOn||cu.mega||(F&&!F.ownSprite))){const col=cu.dmaxOn?'255,60,80':cu.mega?'255,150,230':'255,230,150',pulse=.25+.12*Math.sin(t*6);
      ctx.fillStyle=`rgba(${col},${pulse})`;ctx.beginPath();ctx.ellipse(s.x,s.y-10*(s.sc||1),14*(s.sc||1),18*(s.sc||1),0,0,7);ctx.fill();}
    drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,o);
    if(cu&&cu.teraOn&&!cu.dead){const sp=SPR[s.dex],top=s.y-6+(sp?sp.top*(s.sc||1)*sp.k:-20)-12,cx=Math.round(s.x),c2=TYPES[cu.tera]||'#7fe7ff';
      ctx.fillStyle='#1b2430';ctx.beginPath();ctx.moveTo(cx,top-6);ctx.lineTo(cx+5,top);ctx.lineTo(cx,top+4);ctx.lineTo(cx-5,top);ctx.closePath();ctx.fill();
      ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(cx,top-4);ctx.lineTo(cx+3,top);ctx.lineTo(cx,top+2);ctx.lineTo(cx-3,top);ctx.closePath();ctx.fill();}
    if(s.cu&&s.cu.flash>0){ctx.globalCompositeOperation='lighter';drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,{...o,alpha:.6});ctx.globalCompositeOperation='source-over';}}
  for(const p of proj){p.trail.forEach((q,i)=>{ctx.globalAlpha=(i+1)/p.trail.length*.6;ctx.fillStyle=p.col;ctx.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,p.size,p.size);});
    ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.fillRect(Math.round(p.x)-p.size/2-1,Math.round(p.y)-p.size/2-1,p.size+2,p.size+2);ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x)-p.size/2,Math.round(p.y)-p.size/2,p.size,p.size);}
  for(const p of fx){ctx.globalAlpha=Math.max(0,p.life/p.max);if(p.ring){ctx.strokeStyle=p.col;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.45,0,0,7);ctx.stroke();}else{ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.sz,p.sz);}}
  ctx.globalAlpha=1;
  for(const s of list){if(s.bench&&mode!=='plan'&&mode!=='loot')continue;drawBar(s);drawItems(s);}
  for(const l of leaves){ctx.fillStyle=l.col;ctx.fillRect(Math.round(l.x),Math.round(l.y),2,1);ctx.fillRect(Math.round(l.x)+1,Math.round(l.y)+1,1,1);}
  if(drag)drawSprite(drag.u.dex,'Walk',t,DIR.down,drag.x,drag.y-6);
  ctx.setTransform(1,0,0,1,0,0);
  if(chest&&!chest.open){const bob=Math.sin(t*3)*3;ctx.font='24px PokeEmerald,"Pixelify Sans",sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#1b2430';const txt=chest.kind==='relic'?'Open the rival\'s chest':'Open the chest';
    ctx.strokeText(txt,chest.x*2,chest.y*2-46+bob);ctx.fillStyle='#ffe27a';ctx.fillText(txt,chest.x*2,chest.y*2-46+bob);}
  for(const tx of texts){ctx.globalAlpha=Math.min(1,tx.life*2.5);ctx.font=tx.big?'24px PokeEmerald,"Pixelify Sans",sans-serif':'16px PokeEmerald,"Pixelify Sans",sans-serif';
    ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1b2430';ctx.strokeText(tx.txt,tx.x*2,tx.y*2);ctx.fillStyle=tx.col;ctx.fillText(tx.txt,tx.x*2,tx.y*2);}
  ctx.globalAlpha=1;
}
function drawChest(c,t){
  const x=Math.round(c.x),y=Math.round(c.y-4+(c.open?0:Math.abs(Math.sin(t*3))*-2)),gold=c.kind==='relic';
  const body=gold?'#7a4fc0':'#9a5a2c',dark=gold?'#4f2f86':'#5e3518',trim=gold?'#ffd34d':'#e8b420',lid=gold?'#9b6ee0':'#b8733c';
  ctx.fillStyle='rgba(10,30,10,.35)';ctx.beginPath();ctx.ellipse(x,y+9,14,4,0,0,7);ctx.fill();
  if(!c.open){const gl=.25+.15*Math.sin(t*4);ctx.fillStyle=`rgba(255,226,122,${gl})`;ctx.beginPath();ctx.ellipse(x,y,22,14,0,0,7);ctx.fill();}
  const R=(a,b,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(x+a,y+b,w,h);};
  R(-12,-2,24,11,'#1b2430');R(-11,-1,22,9,body);R(-11,6,22,2,dark);
  R(-13,-10,26,9,'#1b2430');R(-12,-9,24,7,lid);R(-12,-9,24,2,'#ffffff33');
  R(-12,-3,24,2,trim);R(-2,-5,4,6,trim);R(-1,-4,2,3,'#1b2430');R(-9,-9,2,17,trim);R(7,-9,2,17,trim);
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
  if(s.cu&&s.cu.burn){ctx.fillStyle='#ff7a2a';ctx.fillRect(x+25,y,2,2);}
}
function drawItems(s){
  const u=s.cu?s.cu.u:s.pu;if(!u||!u.items||!u.items.length)return;
  const n=u.items.length,z=9,x0=Math.round(s.x-(n*(z+1))/2),y=Math.round(s.y+3);
  u.items.forEach((it,i)=>{const id=itemDef(it).id;if(!ITEMIMG[id]){const im0=new Image();im0.src=iconOf(id);ITEMIMG[id]=im0;}const im=ITEMIMG[id];const x=x0+i*(z+1);ctx.fillStyle=isCraft(it)?'#c9961d':'#1b2430';ctx.fillRect(x-1,y-1,z+2,z+2);ctx.fillStyle='#f7f6ee';ctx.fillRect(x,y,z,z);if(im&&im.complete)ctx.drawImage(im,x,y,z,z);});
}
function star3(x,y,c){ctx.fillStyle='#1b2430';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.fillStyle=c;ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);}

/* ================= Pointer: units ================= */
let itemDrag=null;
function toInternal(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function ownedAt(x,y){
  for(let i=0;i<BENCH_N;i++){const u=run.bench[i];if(!u)continue;const p=benchXY(i);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+8)return{u,from:{kind:'bench',i}};}
  for(const b of boardUnits()){const p=hexXY(b.c,b.r);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+10)return{u:b.u,from:{kind:'board',c:b.c,r:b.r}};}
  return null;
}
function unitAt(x,y){
  if(!run)return null;
  if(mode==='combat'||mode==='result'){for(const u of units){if(u.dead)continue;if(Math.abs(x-u.x)<13&&y>u.y-28&&y<u.y+10)return{u:u.u,cu:u};}
    for(let i=0;i<BENCH_N;i++){const u=run.bench[i];if(!u)continue;const p=benchXY(i);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+8)return{u};}return null;}
  const o=ownedAt(x,y);if(o)return o;
  if(mode==='plan'||mode==='augment')for(const e of enemyPreview){const p=hexXY(e.c,e.r);if(Math.abs(x-p.x)<13&&y>p.y-28&&y<p.y+10)return{u:e.u,enemy:1,mult:e.mult,boss:e.boss};}
  return null;
}
function dropTarget(x,y){
  for(let i=0;i<BENCH_N;i++){const p=benchXY(i);if(Math.abs(x-p.x)<14&&Math.abs(y-p.y)<16)return{kind:'bench',i};}
  let best=null,bd=1e9;for(let r=4;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(c,r);const d=Math.hypot(x-p.x,(y-p.y)/SQ);if(d<bd){bd=d;best={kind:'board',c,r};}}
  if(bd<R*1.05)return best;if(y>286)return{kind:'sell'};return null;
}
cv.addEventListener('pointerdown',e=>{const p=toInternal(e);
  if(mode==='loot'&&chest&&!chest.open&&Math.abs(p.x-chest.x)<22&&Math.abs(p.y-chest.y)<20){openChest();return;}
  if((mode!=='plan'&&mode!=='loot')||evoOpen)return;const hit=ownedAt(p.x,p.y);if(!hit)return;
  drag={u:hit.u,from:hit.from,x:p.x,y:p.y,over:null};hideTip();try{cv.setPointerCapture(e.pointerId);}catch(_){} });
cv.addEventListener('pointermove',e=>{const p=toInternal(e);
  if(drag){drag.x=p.x;drag.y=p.y;drag.over=dropTarget(p.x,p.y);const sell=drag.over&&drag.over.kind==='sell';$('shop').classList.toggle('sell',sell);$('sellzone').textContent=`Release ${nameOf(drag.u)} for ₽${sellValue(drag.u)}`;return;}
  if(itemDrag)return;
  if(mode==='loot'&&chest&&!chest.open&&Math.abs(p.x-chest.x)<22&&Math.abs(p.y-chest.y)<20){cv.style.cursor='pointer';hideTip();return;}
  const hit=unitAt(p.x,p.y);if(hit){showTip(hit.u,e,hit);cv.style.cursor=hit.enemy||hit.cu?'help':'grab';}else{hideTip();cv.style.cursor='default';}});
cv.addEventListener('pointerleave',()=>{if(!drag)hideTip();});
cv.addEventListener('pointerup',()=>{
  if(!drag)return;const t=drag.over,u=drag.u,from=drag.from;drag=null;$('shop').classList.remove('sell');
  if(!t||(mode!=='plan'&&mode!=='loot')){renderUI();return;}
  if(t.kind==='sell'){sell(u);return;}
  const getAt=t=>t.kind==='bench'?run.bench[t.i]:run.board[t.c+','+t.r];
  const setAt=(t,v)=>{if(t.kind==='bench')run.bench[t.i]=v;else{const k=t.c+','+t.r;if(v)run.board[k]=v;else delete run.board[k];}};
  const other=getAt(t);if(other===u){renderUI();return;}
  if(from.kind==='bench'&&t.kind==='board'&&!other&&Object.keys(run.board).length>=teamCap()){toast(`Your team is full (${teamCap()}). Level up or swap a Pokémon.`);renderUI();return;}
  setAt(from,other||null);setAt(t,u);renderUI();});
cv.addEventListener('contextmenu',e=>e.preventDefault());

/* ================= Pointer: items ================= */
function stagePt(e){const sr=stage.getBoundingClientRect(),sc=sr.width/1280;return{x:(e.clientX-sr.left)/sc,y:(e.clientY-sr.top)/sc};}
$('slots').addEventListener('pointerdown',e=>{const s=e.target.closest('.slot');if(!s||s.dataset.i==null||!run.bag[+s.dataset.i])return;e.preventDefault();
  itemDrag={i:+s.dataset.i,sx:e.clientX,sy:e.clientY,moved:false};hideTip();});
addEventListener('pointermove',e=>{
  if(!itemDrag){const s=e.target.closest&&e.target.closest('.slot');if(s&&s.dataset.i!=null&&run&&run.bag[+s.dataset.i])showItemTip(run.bag[+s.dataset.i],e);else if(e.target.closest&&e.target.closest('#bag'))hideTip();return;}
  if(!itemDrag.moved&&Math.hypot(e.clientX-itemDrag.sx,e.clientY-itemDrag.sy)>5){itemDrag.moved=true;const g=$('ghost');g.src=iconOf(itemDef(run.bag[itemDrag.i]).id);g.hidden=false;}
  if(itemDrag.moved){const p=stagePt(e),g=$('ghost');g.style.left=p.x+'px';g.style.top=p.y+'px';
    const el=document.elementFromPoint(e.clientX,e.clientY);if(el===cv){const q=toInternal(e);const o=ownedAt(q.x,q.y);if(o)showTip(o.u,e,{});else hideTip();}}
});
addEventListener('pointerup',e=>{
  if(!itemDrag)return;const d=itemDrag;itemDrag=null;$('ghost').hidden=true;hideTip();
  if(!run||(mode!=='plan'&&mode!=='loot'))return;
  const it=run.bag[d.i];if(!it)return;
  if(!d.moved){if(isUse(it)&&!USE[it.k].target)useItem(d.i,null);return;}
  const el=document.elementFromPoint(e.clientX,e.clientY);
  const slot=el&&el.closest&&el.closest('.slot');
  if(slot&&slot.dataset.i!=null&&+slot.dataset.i!==d.i){if(!craftInBag(d.i,+slot.dataset.i))toast('Only two components can be combined.');return;}
  if(el===cv){const q=toInternal(e);const o=ownedAt(q.x,q.y);if(o){if(isUse(it)&&!USE[it.k].target){toast(`Click ${USE[it.k].n} to use it.`);return;}useItem(d.i,o.u);}}
});

/* ================= UI ================= */
const chip=(txt,col)=>`<span class="chip" style="background:${col}">${txt}</span>`;
const typeChips=dex=>D[dex].t.map(t=>chip(t,TYPES[t])).join('');
const pct=v=>Math.round(v*100)+'%';
const STATN={2:'Attack',3:'Defense',4:'Sp. Atk',5:'Sp. Def',6:'Speed'};
const setChip=k=>`<span class="chip set" style="background:${setColor(k)}">${k}</span>`;
function moveDesc(c){
  const K=c.kit,v=moveValue(c),T=Math.round(v.total),r=`<span class="sc">(${Math.round(v.base)} + ${pct(v.ratio)} ${v.statN})</span>`;
  if(K.type==='tank')return`<p><b>Passive.</b> Has no move; fights with basic attacks and +${pct(KIT.tankHp)} max HP.</p>`;
  if(K.type==='heal'){const hm=K.hm;return`<p><b>${hm.n}</b> <span class="sc">${hm.t} · ${c.maxMana} PP</span></p><p>Restores <b>${T}</b> HP ${r} to ${hm.tg===7?'itself':'the most injured ally'}${hm.st&&hm.st.some(x=>x[1]>0)?' and raises its '+hm.st.filter(x=>x[1]>0).map(x=>STATN[x[0]]).join(', '):''}, then uses <b>${c.mv.n}</b> at 50% power.</p>`;}
  if(K.type==='guard'){const gm=K.gm||c.mv,ups=(gm.st||[]).filter(x=>x[1]>0);return`<p><b>${gm.n}</b> <span class="sc">${gm.t} · ${c.maxMana} PP</span></p><p>Gains a shield of <b>${Math.round(ups.length?v.total:v.total*1.4)}</b> <span class="sc">(${Math.round(v.base*(ups.length?1:1.4))} + ${ups.length?12:17}% max HP)</span>${ups.length?` and raises its ${ups.map(x=>STATN[x[0]]+(x[1]>1?' sharply':'')).join(' and ')}`:''}, then uses <b>${c.mv.n}</b> at 60% power for <b>${Math.round((c.base+KIT.castRatio*c.pf*(c.cat==='spec'?c.spa:c.atk))*.6)}</b> ${c.cat==='spec'?'special':'physical'} damage.</p>`;}
  const mv=c.mv,bits=[];
  const hits=mv.hmax>1?`${mv.hmin===mv.hmax?mv.hmax:mv.hmin+'–'+mv.hmax} hits`:'';
  const who=K.aoe===2?'all enemies within 2 hexes (50%)':K.aoe===1?'the target and adjacent enemies (60%)':'the target';
  bits.push(`${c.kind==='rapid'?`Every ${KIT.rapidEvery}rd attack also uses it at ${pct(KIT.rapidPow)} power. `:''}Hits ${who} for <b>${T}</b> ${c.cat==='spec'?'special':'physical'} damage ${r}${hits?` over ${hits}`:''}.`);
  if(mv.ail&&AIL[mv.ail]){const ch=mv.ailc||(mv.mc===1?100:0);if(ch)bits.push(`${ch}% chance to inflict ${AIL[mv.ail].n}.`);}
  if(mv.fl)bits.push(`${mv.fl}% chance to make the target flinch.`);
  if(mv.dr>0)bits.push(`Heals for ${mv.dr}% of the damage dealt.`);
  if(mv.dr<0)bits.push(`Takes recoil (${Math.round(-mv.dr/2)}% of damage dealt).`);
  if(mv.cr)bits.push('High critical-hit chance; can crit.');
  if(mv.st&&mv.st.length&&mv.mc===6)bits.push(`${mv.sc||100}% chance to lower the target's ${mv.st.map(x=>STATN[x[0]]).join(' and ')}.`);
  if(mv.st&&mv.st.length&&(mv.mc===7||mv.mc===2))bits.push(`${mv.st.some(x=>x[1]<0)?'Changes':'Raises'} its own ${mv.st.map(x=>STATN[x[0]]+(x[1]<0?' (−)':' (+)')).join(', ')}.`);
  if(mv.prio>0)bits.push('Priority move: starts battle with extra PP.');
  return`<p><b>${mv.n}</b> <span class="sc">${mv.t} · ${mv.p||'—'} power · ${c.kind==='rapid'?'follow-up':c.maxMana+' PP'}</span></p><p>${bits.join(' ')}</p>`;
}
function showTip(u,e,hit={}){
  const L=lineOf(u),tip=$('tip'),enemy=hit.enemy||(hit.cu&&hit.cu.team);
  const c=hit.cu||makeCombatant(u,enemy?1:0,0,0,{},hit.mult||1,hit.boss||(hit.cu&&hit.cu.boss));
  const K=c.kit,G=growthOf(u),evo=MODE.kids(u.dex).map(k=>D[k].n);
  const hp=hit.cu?`${Math.round(c.hp)}/${Math.round(c.maxHp)}`:Math.round(c.maxHp);
  const sets=setsOf(u.dex,u.root);
  tip.innerHTML=`<div class="top"><img src="${por(u.dex)}" alt=""><div><div class="lbl">${enemy?'Opponent':`Cost ₽${L.cost}`} · ${K.cls}</div><h3>${esc(D[u.dex].n)}</h3>
    <div class="stars">${'★'.repeat(u.star)}</div><div class="chips">${sets.map(k=>SETS[k]&&SETS[k].cat==='type'?chip(k,TYPES[k]):setChip(k)).join('')}</div></div></div>
    <div class="stats"><div><span class="lbl">HP</span><b>${hp}</b></div><div><span class="lbl">Atk</span><b>${Math.round(c.atk)}</b></div><div><span class="lbl">Sp.Atk</span><b>${Math.round(c.spa)}</b></div><div><span class="lbl">Speed</span><b>${c.as.toFixed(2)}</b></div>
    <div><span class="lbl">Def</span><b>${Math.round(c.def)}</b></div><div><span class="lbl">Sp.Def</span><b>${Math.round(c.res)}</b></div><div><span class="lbl">Range</span><b>${c.range}</b></div><div><span class="lbl">PP</span><b>${c.maxMana?Math.round(c.mana)+'/'+c.maxMana:'—'}</b></div></div>
    <div class="ab">${moveDesc(c)}${K.ladder?`<p class="ladder">${K.ladder.map(x=>x.dex===u.dex?`<b>${esc(x.n)}</b>`:esc(x.n)).join(' → ')}</p>`:''}${K.ab?`<p class="abil"><b>${esc(K.ab.n)}</b> <span class="sc">Ability</span><br>${K.ab.d}</p>`:''}</div>
    ${u.items&&u.items.length?`<div class="items">${u.items.map(it=>`<div><img src="${iconOf(itemDef(it).id)}" alt=""><span><b>${esc(itemName(it))}</b></span></div>`).join('')}</div>`:''}
    ${gimLines(u,enemy)}
    ${G?`<div class="grow"><b>${G.n}</b>: ${G.d}${u.gs?`<br>Grown ${u.gs} time${u.gs>1?'s':''} this run.`:''}</div>`:''}
    ${!enemy&&u.star<3&&evo.length?`<div class="lbl" style="margin-top:8px">${u.star===1?'At 2★':'At 3★'}: ${evo.length>1?'choose '+esc(evo.join(' / ')):'evolves into '+esc(evo[0])}</div>`:''}`;
  placeTip(e);
}
function gimLines(u,enemy){
  if(enemy||!u.uid)return'';const out=[];
  if(u.stone){const f=megaFor(u.dex,u.stone);out.push(`<div><img src="${iconOf(u.stone)}" alt=""><span><b>${esc(gimDef({k:'g:stone:'+u.stone}).n)}</b>${f?` → ${esc(D[f].n)}`:' (evolve it first)'}</span></div>`);}
  if(u.crystal){const ok=ZTYPE[u.crystal]===kitOf(u.dex).mv.t;out.push(`<div><img src="${iconOf(u.crystal)}" alt=""><span><b>${esc(ZNAME[ZTYPE[u.crystal]])}</b>${ok?'':' (needs a '+ZTYPE[u.crystal]+' move)'}</span></div>`);}
  if(u.shard)out.push(`<div><img src="${iconOf(u.shard.toLowerCase()+'-tera-shard')}" alt=""><span><b>Tera ${u.shard}</b>: counts as ${u.shard} type</span></div>`);
  if(u.mush)out.push(`<div><img src="${iconOf('max-mushrooms')}" alt=""><span><b>Dynamax Level ${u.mush}</b>${u.gmax?' · Gigantamax factor':''}</span></div>`);
  if(run&&run.gimmick==='mega'&&!u.stone){const ms=MODE.lines[u.root].mem.flatMap(m=>(FORMS_BY_BASE[m]||[]).filter(f=>FORMS[f].kind==='mega'));if(ms.length)out.push(`<div><span class="sc">Can Mega Evolve: ${ms.map(f=>esc(D[f].n)).join(', ')}</span></div>`);}
  if(run&&run.gimmick==='dmax'&&!u.gmax&&gmaxFor(u.dex))out.push(`<div><span class="sc">Has a Gigantamax form (${GMAX_MUSH} Max Mushrooms)</span></div>`);
  const fi=MODE.lines[u.root].mem.flatMap(m=>(FORMS_BY_BASE[m]||[]).filter(f=>FORMS[f].kind==='item'));if(fi.length)out.push(`<div><span class="sc">Form item: ${[...new Set(fi.map(f=>FORMS[f].itemName))].join(', ')}</span></div>`);
  return out.length?`<div class="items gimrow">${out.join('')}</div>`:'';
}
function itemBody(it,compact){
  const lines=[];
  if(isComp(it)){lines.push(`<p>${COMP[it.k].d}.</p>`);
    lines.push(`<div class="lbl" style="margin:8px 0 4px">Combines into</div><div class="recipes${compact?' compact':''}">${CORDER.split('').map(o=>{const c=CRAFT[recipeKey(it.k,o)];return compact?`<div title="+ ${COMP[o].n} → ${c.n}"><img src="${iconOf(COMP[o].id)}" alt=""><img src="${iconOf(c.id)}" alt="${c.n}"></div>`:`<div><img src="${iconOf(COMP[o].id)}" alt=""><span>→</span><img src="${iconOf(c.id)}" alt=""><span>${c.n}</span></div>`;}).join('')}</div>`);}
  else if(isCraft(it)){lines.push(`<p>${CRAFT[it.k].d}</p><p class="sc">Also: ${COMP[it.k[0]].d}, ${COMP[it.k[1]].d}.</p>`);}
  else lines.push(`<p>${itemDef(it).d}</p>`);
  for(const m of it.mut||[])lines.push(`<p class="mut"><b>${MUTS[m].n}:</b> ${MUTS[m].d}${m==='growing'&&it.gs?` (now +${pct(it.gs)})`:''}.</p>`);
  return lines.join('');
}
function showItemTip(it,e){const tip=$('tip');const t=itemTier(it);
  tip.innerHTML=`<div class="top"><img src="${iconOf(itemDef(it).id)}" alt="" style="width:56px;height:56px"><div><div class="lbl">${t==='common'?'Component':t==='epic'?'Completed item':t==='gim'?(run&&run.gimmick?GIMMICKS[run.gimmick].n:'Gimmick item'):t==='formi'?'Form item':'Consumable'}</div><h3 style="font-size:19px">${esc(itemName(it))}</h3></div></div><div class="ab">${itemBody(it)}</div>
  <div class="lbl" style="margin-top:8px">${isUse(it)?(USE[it.k].target?'Drag onto a Pokémon':'Click to use'):isComp(it)?'Drag onto a Pokémon or another component':isGim(it)?'Drag onto a Pokémon (own slot)':'Drag onto a Pokémon'}</div>`;placeTip(e);}
function showInfoTip(html,e){$('tip').innerHTML=html;placeTip(e);}
function placeTip(e){const tip=$('tip'),sr=stage.getBoundingClientRect(),sc=sr.width/1280;let x=(e.clientX-sr.left)/sc+18,y=(e.clientY-sr.top)/sc-40;
  tip.style.display='block';const th=tip.offsetHeight;if(x>1280-306)x-=330;y=clamp(y,80,720-th-10);tip.style.left=x+'px';tip.style.top=y+'px';}
function hideTip(){$('tip').style.display='none';}
let toastT=0;function toast(m){if(SIM.on)return;const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',2600);}
function banner(title,sub,ms){const h=$('bannerhost');h.innerHTML=`<div class="banner win">${esc(title)}${sub?`<small>${esc(sub)}</small>`:''}</div>`;setTimeout(()=>{if(h.firstChild&&h.firstChild.textContent.startsWith(title))h.innerHTML='';},ms);}
function showGameUI(on){['hud','traits','mods','shop','bag'].forEach(id=>$(id).hidden=!on);}
function renderUI(){
  if(!run||SIM.on)return;saveRun();const f=run.floor;
  $('hpnum').textContent=run.hp;const fr=run.hp/run.maxHp,hb=$('hpbar');hb.firstElementChild.style.width=(fr*100)+'%';hb.className='hpbar'+(fr<.3?' low':fr<.6?' mid':'');
  $('goldnum').textContent=run.gold;$('teamnum').innerHTML=`${Object.keys(run.board).length}<small>/${teamCap()}</small>`;
  $('lvl').textContent=run.level;$('xpbar').firstElementChild.style.width=run.level>=MAXLV?'100%':(run.xp/XPNEXT[run.level]*100)+'%';$('xpbar').title=run.level>=MAXLV?'Max level':`${run.xp}/${XPNEXT[run.level]} XP`;
  $('floorlbl').textContent=`Floor ${f} / ${FLOORS}`;$('actname').textContent=ACTS[0].name;$('modelbl').textContent=MODE.gen?`${MODE.label} · ${MODE.region}`:'National Dex';
  let tr='';for(let i=1;i<=FLOORS;i++){const k=floorKind(i);let cls='node';if(k==='trainer')cls+=' pb';if(k==='elite')cls+=' elite';if(k==='boss')cls+=' boss';if(i===2)cls+=' aug';
    if(run.results[i])cls+=run.results[i]==='loss'?' lost':' done';if(i===f)cls+=' cur';
    const inner=k==='wild'?`<svg viewBox="0 0 16 16"><path d="M2.5 13.5C2.5 6.5 7 2.5 13.5 2.5c0 6.5-4 11-11 11z" fill="#5fae45" stroke="#24303d" stroke-width="1.2"/></svg>`:k==='boss'?`<img src="${por(run.boss.dex)}" alt="">`:'';
    tr+=`${i>1?'<span class="link"></span>':''}<span class="${cls}" title="Floor ${i}: ${k==='wild'?'Wild Pokémon':k==='boss'?'Boss: '+esc(D[run.boss.dex].n):k==='elite'?'Rival (relic reward)':'Trainer'}${i===2?' · Augment':''}">${inner}</span>`;}
  $('track').innerHTML=tr;
  const ct=countTraits(Object.values(run.board));
  const keys=Object.keys(ct).filter(k=>SETS[k]).sort((a,b)=>tierOf(b,ct[b])-tierOf(a,ct[a])||(ct[b]/SETS[b].bp[0])-(ct[a]/SETS[a].bp[0])||a.localeCompare(b));
  const MAXT=5,shown=keys.slice(0,MAXT);
  const tr1=k=>{const n=ct[k],ti=tierOf(k,n),S=SETS[k];
    return`<div class="trait ${ti?'t'+ti:'off'}" data-trait="${k}"><div class="hex"><span class="in" style="background:${setColor(k)}">${k.replace(/ /g,'').slice(0,3).toUpperCase()}</span></div><div><div class="nm">${k}</div><div class="bp">${S.bp.map(b=>n>=b?`<b>${b}</b>`:b).join(' › ')}</div></div><div class="ct">${n}</div></div>`;};
  $('traits').innerHTML=keys.length?shown.map(tr1).join('')+(keys.length>MAXT?`<div class="more" data-more="1">+${keys.length-MAXT} more sets</div>`:'')
    :`<div class="hint">Place Pokémon on the field to activate sets: types, classes, styles${MODE.gen?'':' and regions'}.</div>`;
  const s=run.strat,inc=incomePreview();
  let mh=`<div class="mod mini"><div class="k">Strategy</div><div class="v">${s.name}</div></div>`;
  if(run.aug)mh+=`<div class="mod mini ${run.augTier}" title="${esc(run.aug.d)}"><div class="k">${run.augTier} augment</div><div class="v">${run.aug.name}</div></div>`;
  if(run.gimmick){const GM=GIMMICKS[run.gimmick],el=allOwned().filter(gimEligible);
    const tgt=allOwned().find(u=>u.uid===run.gimTarget&&gimEligible(u));const onField=tgt&&Object.values(run.board).includes(tgt);
    mh+=`<div class="mod gim" style="border-color:${GM.col}"><div class="k"><img src="${iconOf(GM.key)}" alt="">${GM.n}</div>${el.length?`<div class="caps">${el.map(u=>`<button class="cap${u===tgt?' on':''}" data-cap="${u.uid}" aria-label="Use ${esc(GM.n)} with ${esc(nameOf(u))}"><img src="${por(shownDex(u))}" alt=""></button>`).join('')}</div><p>${tgt?(onField?`${esc(nameOf(tgt))} will use it this battle.`:`${esc(nameOf(tgt))} is on the bench.`):'Pick who uses it this battle.'}</p>`:`<p>${{mega:'Find a Mega Stone for one of your Pokémon.',zmove:'Give a Z-Crystal to a Pokémon with a matching move.',dmax:'Put a Pokémon on the field to Dynamax it.',tera:'Give a Tera Shard to a Pokémon.'}[run.gimmick]}</p>`}</div>`;}
  if(run.relics.length)mh+=`<div class="mod"><div class="k">Relics</div><div class="relics">${run.relics.map(r=>`<img src="${iconOf(r)}" alt="${esc(RELICS[r].n)}" data-relic="${r}">`).join('')}</div></div>`;
  mh+=`<div class="mod mini"><div class="k">Next floor income</div><div class="v inc">₽${inc.base+inc.interest+inc.streak+inc.extra}</div><p>₽${inc.base} base · ₽${inc.interest} interest · ₽${inc.streak} ${run.streak<0?'loss':'win'} streak${inc.extra?` · ₽${inc.extra} Pay Day`:''}</p></div>`;
  {const sc=scoutState();
    if(sc.focus.length)mh+=`<div class="mod scout"><div class="k">Scouting</div><div class="v">${sc.focus.join(' · ')}</div><p>Each shop slot has a ${pct(sc.p)} chance to show these sets. Rises after shops that miss.</p></div>`;
    else if(sc.top)mh+=`<div class="mod"><div class="k">Scouting</div><div class="v">${sc.top.k}: ${Math.min(sc.top.lines,SCOUT.minLines)}/${SCOUT.minLines} lines · ₽${Math.min(sc.top.gold,SCOUT.minGold)}/${SCOUT.minGold}</div><p>${run.floor<SCOUT.minFloor?`Unlocks on floor ${SCOUT.minFloor}. `:''}Invest in a set and the shop starts favoring it.</p></div>`;}
  if(mode!=='loot')mh+=`<div class="mod mini"><div class="k">Next opponent</div><div class="v">${esc(trainerName(f))}</div></div>`;
  $('mods').innerHTML=mh;
  const plan=mode==='plan',owned=new Set(allOwned().filter(u=>u.star<3).map(u=>u.root));
  $('cards').innerHTML=run.shop.map((r,i)=>{if(!r)return`<div class="card empty" aria-hidden="true"></div>`;const L=MODE.lines[r];const G=growthOf({root:r});
    return`<button class="card c${L.cost}${run.gold<L.cost?' poor':''}${owned.has(r)?' owned':''}" data-i="${i}" ${plan?'':'disabled'} aria-label="Buy ${esc(D[r].n)} for ${L.cost}"><div class="band"><span class="name">${esc(D[r].n)}</span><span class="cost">₽${L.cost}</span></div>
      <div class="body"><img class="por" src="${por(r)}" alt=""><div class="info"><span class="role" style="color:${CLASSCOL[roleOf(r)]}">${roleOf(r)} · ${moveName(r)}</span><div class="chips">${typeChips(r)}${kitOf(r).styles.map(setChip).join('')}${MODE.gen?'':chip(REGIONS[L.region],REGCOL[L.region])}</div></div></div>${G?'<span class="grows">Grows</span>':''}${run.scouted&&run.scouted[i]?'<span class="scouted">Scouted</span>':''}</button>`;}).join('');
  $('reroll').disabled=!plan||(run.gold<2&&run.freeRerolls<=0);$('rerollcost').textContent=run.freeRerolls>0?`Free ×${run.freeRerolls}`:'₽2';
  $('buyxp').disabled=!plan||run.gold<4||run.level>=MAXLV;
  $('fight').disabled=!plan;$('fight').textContent=mode==='combat'?'Battling…':mode==='loot'?'Open chest':'Battle!';
  if(mode==='loot')$('fight').disabled=false;
  // bag
  $('bagct').textContent=`${run.bag.length}/${BAGMAX}`;
  let sl='';for(let i=0;i<BAGMAX;i++){const it=run.bag[i];sl+=it?`<button class="slot t-${{epic:'epic',use:'use',gim:'gim',formi:'relic'}[itemTier(it)]||'common'}" data-i="${i}" aria-label="${esc(itemName(it))}"><img src="${iconOf(itemDef(it).id)}" alt="">${it.mut&&it.mut.length?'<i class="mutdot"></i>':''}</button>`:`<div class="slot empty"></div>`;}
  $('slots').innerHTML=sl;
}
$('cards').addEventListener('click',e=>{const c=e.target.closest('.card');if(c&&c.dataset.i)buy(+c.dataset.i);});
$('cards').addEventListener('pointermove',e=>{const c=e.target.closest('.card');const r=c&&c.dataset.i?run.shop[+c.dataset.i]:null;if(r)showTip(mkUnit(r),e);else hideTip();});
$('cards').addEventListener('pointerleave',hideTip);
$('mods').addEventListener('pointermove',e=>{const r=e.target.dataset&&e.target.dataset.relic;if(r)showInfoTip(`<div class="top"><img src="${iconOf(r)}" alt="" style="width:48px;height:48px"><div><div class="lbl">Relic</div><h3 style="font-size:19px">${RELICS[r].n}</h3></div></div><div class="ab"><p>${RELICS[r].d}</p></div>`,e);else hideTip();});
$('mods').addEventListener('pointerleave',hideTip);
$('mods').addEventListener('click',e=>{const b=e.target.closest('[data-cap]');if(!b)return;const id=+b.dataset.cap;run.gimTarget=run.gimTarget===id?0:id;renderUI();});
$('traits').addEventListener('pointermove',e=>{const ct=countTraits(Object.values(run.board));
  if(e.target.closest('[data-more]')){const keys=Object.keys(ct).filter(k=>SETS[k]).sort((a,b)=>tierOf(b,ct[b])-tierOf(a,ct[a])||ct[b]-ct[a]);
    showInfoTip(`<div class="lbl">All sets on the field</div><div class="setlist">${keys.map(k=>`<div><span class="dot" style="background:${setColor(k)}"></span>${k}<b>${ct[k]}</b><span class="sc">/ ${SETS[k].bp.join(', ')}</span></div>`).join('')}</div>`,e);return;}
  const el=e.target.closest('.trait');if(!el){hideTip();return;}const k=el.dataset.trait,S=SETS[k],n=ct[k]||0;
  const mem=[...new Set(Object.values(run.board).filter(u=>setsOf(u.dex,u.root).includes(k)).map(u=>u.dex))];
  showInfoTip(`<div class="lbl">${SETCAT_LABEL[S.cat]} set</div><h3 style="font-size:20px;margin:2px 0 6px">${k}</h3><p style="margin:0;line-height:1.4">${S.d}</p><p class="sc" style="margin:6px 0 0">Active at ${S.bp.join(' / ')} different Pokémon. You have ${n}.</p>${mem.length?`<div class="por3" style="display:flex;gap:4px;margin-top:6px">${mem.map(d=>`<img src="${por(d)}" alt="" style="width:30px;height:30px;border:2px solid var(--ink);border-radius:4px">`).join('')}</div>`:''}`,e);});
$('traits').addEventListener('pointerleave',hideTip);
$('reroll').onclick=reroll;
$('buyxp').onclick=buyXP;
$('fight').onclick=()=>{if(mode==='loot')openChest();else startCombat();};
$('speed').onclick=()=>{speed=speed===1?2:1;$('speed').setAttribute('aria-pressed',speed===2);};
addEventListener('keydown',e=>{if(evoOpen||!run)return;
  if(mode==='loot'&&(e.key===' '||e.key==='Enter')){e.preventDefault();openChest();return;}
  if(mode!=='plan')return;if(e.key==='d'||e.key==='D')reroll();if(e.key==='f'||e.key==='F')buyXP();if(e.key===' '){e.preventDefault();startCombat();}});

/* ================= Options & saving ================= */
const OPTS={speed:1,dmg:1};
try{Object.assign(OPTS,JSON.parse(localStorage.getItem('pokerun.opts')||'{}'));}catch(e){}
function saveOpts(){try{localStorage.setItem('pokerun.opts',JSON.stringify(OPTS));}catch(e){}}
const SAVEKEY='pokerun.save.v1';
let saveT=0;
function saveRun(){
  if(!run||SIM.on||!MODE||!['plan','loot','augment'].includes(mode))return;
  clearTimeout(saveT);saveT=setTimeout(()=>{try{
    const r={...run,strat:run.strat.id,aug:run.aug?run.aug.id:null};
    localStorage.setItem(SAVEKEY,JSON.stringify({v:1,t:Date.now(),mode:MODE.id,pool:MODE.gen?null:MODE.byCost,run:r,uidc,
      enemy:enemyPreview.map(e=>({u:e.u,c:e.c,r:e.r,mult:e.mult,boss:e.boss})),state:mode==='loot'?'loot':'plan'}));}catch(e){}},120);
}
function readSave(){try{const d=JSON.parse(localStorage.getItem(SAVEKEY)||'null');return d&&d.v===1?d:null;}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem(SAVEKEY);}catch(e){}}
async function continueRun(){
  const d=readSave();if(!d)return showTitle();
  MODE=buildMode(d.mode);if(d.pool)MODE.byCost=d.pool;
  run=d.run;run.strat=STRATS.find(x=>x.id===run.strat)||STRATS[0];
  run.aug=run.aug?Object.values(AUGS).flat().find(a=>a.id===run.aug)||null:null;
  enemyPreview=d.enemy||[];uidc=d.uidc||1000;ov.innerHTML='';
  await preload([...enemyPreview.map(e=>e.u.dex),...allOwned().map(u=>shownDex(u)),run.boss.dex,...run.shop.filter(Boolean)]);
  showGameUI(true);
  if(d.state==='loot'&&run.loot){mode='loot';chest={x:hexXY(3,2).x,y:hexXY(3,2).y,t:0,open:false,kind:run.pendingRelic?'relic':'item'};}
  else{mode='plan';chest=null;if(run.floor===2&&!run.aug)return showAugment();if(run.floor===GIMMICK_FLOOR&&!run.gimmick)return showGimmickChoice();}
  renderUI();banner(`Floor ${run.floor}`,mode==='loot'?'Open the chest':trainerName(run.floor),1400);
}

/* ================= Screens ================= */
const ov=$('overlay');
function bestOf(id){try{return localStorage.getItem('pokerun.best.'+id);}catch(e){return null;}}
function setBest(id,v){try{const b=+(localStorage.getItem('pokerun.best.'+id)||0);if(v>b)localStorage.setItem('pokerun.best.'+id,v);}catch(e){}}
function setWander(dexes){wander=dexes.map((d,i)=>({dex:d,x:200+(i%5)*60+rnd(-10,10),y:110+Math.floor(i/5)*70+rnd(-10,10),dir:0,anim:'Idle',t:rnd(0,2),wait:rnd(0,2)}));preload(dexes);}
function showTitle(){
  mode='title';showGameUI(false);run=null;MODE=null;chest=null;speed=OPTS.speed;$('speed').setAttribute('aria-pressed',speed===2);
  if(!wander.length||wander.length<14)setWander(shuffle(ROOTS.filter(r=>SM[r])).slice(0,16));
  const d=readSave();
  const sum=d?(()=>{const r=d.run,team=Object.values(r.board).concat(r.bench.filter(Boolean)).sort((a,b)=>b.star-a.star).slice(0,6);
    const st=STRATS.find(x=>x.id===r.strat);const m=d.mode==='nat'?'National Dex':`Gen ${ROMAN[+d.mode.slice(3)-1]} · ${REGIONS[+d.mode.slice(3)-1]}`;
    return`<div class="win save"><div class="lbl">Saved run</div><h3>${m}</h3><p>Floor ${r.floor} / ${FLOORS} · Trainer HP ${r.hp} · ₽${r.gold}</p><p>${st?st.name:''}${r.gimmick?' · '+GIMMICKS[r.gimmick].n:''}</p>
      <div class="team">${team.map(u=>`<img src="${por(shownDex(u))}" alt="${esc(D[u.dex].n)}" title="${esc(D[u.dex].n)} ${'★'.repeat(u.star)}">`).join('')}</div></div>`;})():'';
  ov.innerHTML=`<div class="screen title"><div class="logo">PokéRun<small>Tactics</small></div>
    <div class="menu-row"><nav class="win menu" aria-label="Main menu">
      ${d?'<button class="mi" id="m-continue">Continue</button>':''}
      <button class="mi" id="m-new">New game</button>
      <button class="mi" id="m-options">Options</button>
      <button class="mi" id="m-credits">Credits</button>
    </nav>${sum}</div>
    <div class="tag">Autobattler roguelike · ${ROOTS.length} evolution lines</div></div>
    <div class="credit">Sprites and portraits: <a href="https://sprites.pmdcollab.org/" target="_blank" rel="noopener">PMD SpriteCollab</a> contributors. Pokédex data and item sprites: <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>. Font: Pokémon Emerald glyphs via <a href="https://github.com/pret/pokeemerald" target="_blank" rel="noopener">pret/pokeemerald</a>. Fan project, not affiliated with Nintendo, Game Freak or The Pokémon Company.</div>`;
  if(d)$('m-continue').onclick=continueRun;
  $('m-new').onclick=()=>{if(readSave())return confirmNew();showModes();};
  $('m-options').onclick=showOptions;$('m-credits').onclick=showCredits;
  (d?$('m-continue'):$('m-new')).focus();
}
function confirmNew(){
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="win dialog"><p>Starting a new game will erase your saved run. Continue?</p>
    <div class="row"><button class="btn" id="c-yes">Erase and start</button><button class="btn" id="back">Keep my run</button></div></div></div>`;
  $('c-yes').onclick=()=>{clearSave();showModes();};$('back').onclick=showTitle;$('back').focus();
}
function showOptions(){
  const row=(id,label,val)=>`<button class="mi opt" id="${id}"><span>${label}</span><b>${val}</b></button>`;
  const d=readSave();
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Options</h1><nav class="win menu wide">
    ${row('o-speed','Battle speed',OPTS.speed===2?'Fast':'Normal')}${row('o-dmg','Damage numbers',OPTS.dmg?'On':'Off')}
    ${d?'<button class="mi opt danger" id="o-del"><span>Delete saved run</span><b>›</b></button>':''}
    <button class="mi" id="back">Back</button></nav>
    <p class="sub">Controller: stick or D-pad to move · A select · B back · X reroll · Y level up · Start battle</p></div>`;
  $('o-speed').onclick=()=>{OPTS.speed=OPTS.speed===2?1:2;saveOpts();showOptions();};
  $('o-dmg').onclick=()=>{OPTS.dmg=OPTS.dmg?0:1;saveOpts();showOptions();};
  if(d)$('o-del').onclick=()=>{const b=$('o-del');if(b.dataset.sure){clearSave();showOptions();}else{b.dataset.sure=1;b.querySelector('span').textContent='Press again to delete';}};
  $('back').onclick=showTitle;$('o-speed').focus();
}
function showCredits(){
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Credits</h1><div class="win dialog wide">
    <p><b>PokéRun Tactics</b> by alexk0918.</p>
    <p>Pokémon sprites and portraits: the artists of the <a href="https://sprites.pmdcollab.org/" target="_blank" rel="noopener">PMD SpriteCollab</a>.</p>
    <p>Pokédex, moves, abilities, forms and item sprites: <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>.</p>
    <p>Font: Pokémon Emerald's glyphs, from the <a href="https://github.com/pret/pokeemerald" target="_blank" rel="noopener">pret/pokeemerald</a> decompilation.</p>
    <p class="sc">Non-commercial fan project. Pokémon is © Nintendo, Game Freak and Creatures.</p>
    <div class="row"><button class="btn" id="back">Back</button></div></div></div>`;
  $('back').onclick=showTitle;$('back').focus();
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
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">Choose your strategy</h1><p class="sub">${MODE.gen?`${MODE.label} · ${MODE.region}`:'National Dex: each run draws 100 evolution lines from all 541'}. Your strategy is a guideline for the whole run. It shapes your first shop and rewards one way of playing.</p>
  <div class="picks">${STRATS.map((s,i)=>`<button class="pick win" data-i="${i}"><div class="lbl">${s.risk}</div><h2>${s.name}</h2>
    <div class="por3">${feats[i].map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}">`).join('')}</div>
    <ul>${s.pts.map(p=>`<li>${p}</li>`).join('')}</ul><div class="guide">${s.guide}</div></button>`).join('')}</div></div>
    <button class="btn back" id="back">Back</button>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{const s=STRATS[+b.dataset.i];newRun(s,feats.flat());run.featured=feats[+b.dataset.i];ov.innerHTML='';startFloor();});
  $('back').onclick=showModes;
}
function rollAugTier(){const x=Math.random();return x<.25?'silver':x<.75?'gold':'prismatic';}
function applyAug(a){run.aug=a;
  if(a.id==='berry')run.gold+=8;
  if(a.id==='egg'){const slot=run.bench.indexOf(null);const root=pick(MODE.roots.filter(r=>MODE.lines[r].cost<=3));
    if(slot>=0){const u=mkUnit(root);u.star=2;run.bench[slot]=u;if(!SIM.on)ensure(root);evolveStep(u);}}
  combine();}
function showAugment(){
  mode='augment';$('bannerhost').innerHTML='';
  const tier=rollAugTier();run.augTier=tier;
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner ${tier}">${tier.toUpperCase()} AUGMENT</div><h1 class="h1">Choose an augment</h1><p class="sub">Augments last for the rest of the run.</p>
    <div class="picks">${AUGS[tier].map((a,i)=>`<button class="pick win aug tier-${tier}" data-i="${i}"><div class="gem"></div><h2>${a.name}</h2><p>${a.d}</p></button>`).join('')}</div></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{ov.innerHTML='';mode='plan';applyAug(AUGS[tier][+b.dataset.i]);renderUI();if(!evoOpen)banner(`Floor ${run.floor}`,trainerName(run.floor),1400);});
}
function itemCard(it,i,cls=''){const t=isRelicId(it)?'relic':itemTier(it);
  const id=isRelicId(it)?it:itemDef(it).id,name=isRelicId(it)?RELICS[it].n:itemName(it);
  const body=isRelicId(it)?`<p>${RELICS[it].d}</p>`:itemBody(it,true);
  const tl=t==='common'?'Component':t==='epic'?'Completed':t==='use'?'Consumable':t==='gim'?(run.gimmick?GIMMICKS[run.gimmick].n:'Gimmick'):t==='formi'?'Form item':'Relic';
  return`<button class="pick win item p-${t==='common'?'common':t} ${cls}" data-i="${i}"><div class="icon"><img src="${iconOf(id)}" alt=""></div><span class="tier ${t==='common'?'common':t}">${tl}</span><h2 style="font-size:20px">${esc(name)}</h2><div class="desc">${body}</div></button>`;}
const isRelicId=x=>typeof x==='string'&&RELICS[x];
function openChest(){
  if(mode!=='loot'||!run.loot||(chest&&chest.open))return;
  if(chest){chest.open=true;burst(chest.x,chest.y-8,'#ffe27a',30,1.3);}
  hideTip();
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><h1 class="h1">${run.results[run.floor]==='win'?'Treasure!':'Consolation chest'}</h1><p class="sub">Choose one item. Two components on the same Pokémon combine into a completed item.</p>
    <div class="picks">${run.loot.map((it,i)=>itemCard(it,i)).join('')}</div>
    <button class="btn skip" id="skip">Skip and take ₽2</button></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>chooseLoot(+b.dataset.i));
  $('skip').onclick=()=>chooseLoot(-1);
}
function chooseLoot(i){const r=takeLoot(i);if(r===false)return;ov.innerHTML='';if(r==='relic')showRelics();}
function showGimmickChoice(){
  mode='augment';$('bannerhost').innerHTML='';
  const opts=GIM_ORDER.filter(g=>!(run.gimmicks||[]).includes(g));
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner prismatic">ACT ${ROMAN[0]} · GENERATION GIMMICK</div><h1 class="h1">Choose your key item</h1><p class="sub">You get one generation gimmick for this act. The others can be chosen in later acts.</p>
    <div class="picks gims">${opts.map(g=>{const G=GIMMICKS[g];return`<button class="pick win item gim" data-g="${g}" style="--gc:${G.col}"><div class="icon"><img src="${iconOf(G.key)}" alt=""></div><span class="tier" style="background:${G.col}">${G.gen}</span><h2 style="font-size:24px">${G.n}</h2><div class="desc"><p>${G.d}</p><p class="sc">${G.start}</p></div></button>`;}).join('')}</div></div>`;
  ov.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ov.innerHTML='';mode='plan';chooseGimmick(b.dataset.g);const G=GIMMICKS[run.gimmick];toast(`You received the ${G.keyN}!`);banner(`Floor ${run.floor}`,trainerName(run.floor),1400);});
}
function showRelics(){
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner prismatic">RIVAL DEFEATED</div><h1 class="h1">Choose a relic</h1><p class="sub">Relics affect your whole team for the rest of the run.</p>
    <div class="picks">${run.relicChoices.map((r,i)=>itemCard(r,i)).join('')}</div></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{ov.innerHTML='';takeRelic(+b.dataset.i);});
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
  mode='over';showGameUI(false);setBest(MODE.id,run.wins);chest=null;clearSave();
  const team=Object.values(run.board).concat(run.bench.filter(Boolean)).sort((a,b)=>b.star-a.star).slice(0,7);
  const where=MODE.gen?MODE.region:'National Dex';
  ov.innerHTML=`<div class="scrim"></div><div class="screen">
    <h1 class="h1">${won?`${where}: Act I cleared!`:'Your run has ended'}</h1>
    <p class="sub">${won?`${esc(D[run.boss.dex].n)} steps aside. The path out of the clearing leads on.`:`Your team fell on Floor ${run.floor} of the ${ACTS[0].name}.`}</p>
    <div class="win" style="padding:14px 20px;display:flex;flex-direction:column;gap:12px;align-items:center">
      <div class="endstat"><div><span class="lbl">Floors won</span><b>${run.wins}</b></div><div><span class="lbl">Trainer level</span><b>${run.level}</b></div><div><span class="lbl">Strategy</span><b style="font-size:20px">${run.strat.name}</b></div>${run.aug?`<div><span class="lbl">Augment</span><b style="font-size:20px">${run.aug.name}</b></div>`:''}</div>
      <div style="display:flex;gap:6px">${team.map(u=>`<img src="${por(u.dex)}" alt="${esc(nameOf(u))}" title="${esc(nameOf(u))} ${'★'.repeat(u.star)}" style="width:56px;height:56px;image-rendering:pixelated;border:2px solid var(--ink);border-radius:6px">`).join('')}</div>
      ${run.relics.length?`<div class="relics">${run.relics.map(r=>`<img src="${iconOf(r)}" alt="${esc(RELICS[r].n)}" title="${esc(RELICS[r].n)}">`).join('')}</div>`:''}
    </div>
    ${won?`<div class="acts">${ACTS.map((a,i)=>`<div class="win ${i?'lock':''}"><div class="lbl">Act ${ROMAN[i]}</div><b>${a.name}</b><div class="lbl" style="margin-top:4px">${i?'Coming soon':'Cleared'}</div></div>`).join('')}</div>`:''}
    <button class="btn go" id="again" style="font-size:22px;padding:10px 30px">New run</button></div>`;
  $('again').onclick=showTitle;
}

/* ================= Boot ================= */
(async()=>{
  try{await Promise.all([document.fonts.load('16px PokeEmerald'),document.fonts.load('700 20px "Pixelify Sans"')]);}catch(e){}
  const[dex,spr,kit,frm]=await Promise.all([fetch('data/pokedex.json?v=6').then(r=>r.json()),fetch('data/sprites.json?v=6').then(r=>r.json()),fetch('data/kits.json?v=7').then(r=>r.json()),fetch('data/forms.json?v=6').then(r=>r.json())]);
  KITS=kit.kits;MOVEDB=kit.moves;ABNAME=kit.abilities;
  for(const d of dex){d.bst=d.s.reduce((a,b)=>a+b,0);D[d.id]=d;if(d.f)(KIDS[d.f]=KIDS[d.f]||[]).push(d.id);}
  ROOTS=dex.filter(d=>!d.f).map(d=>d.id);
  for(const k in spr)SM[+k]=spr[k];
  loadForms(frm);
  loadItemImages();
  BG=renderForest();initLeaves();
  showTitle();
  requestAnimationFrame(frame);
})();
