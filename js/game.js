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
  const sp=D[dex],s=sp.s,avg=sp.bst/6,r=x=>clamp(x/avg,.4,2),sm=STARM[star-1],k=kindOf(dex);
  const off=(34+cost*8)*sm;
  return{
    hp:(420+cost*110)*sm*(.65+.35*r(s[0])),
    atk:off*(.5+.5*r(s[1])), spa:off*(.5+.5*r(s[3])),
    def:clamp(4+30*r(s[2]),5,80), res:clamp(4+30*r(s[4]),5,80),
    as:clamp(.5+.25*r(s[5]),.45,1.1),
    range:k==='heal'?2:k==='blast'?3:1,
    mana:k==='guard'?90:k==='heal'?80:70, start:k==='guard'?30:10,
    kind:k, cat:(k==='heal'||s[3]>s[1]*1.1)?'spec':'phys',
    base:KINDS[k].base*STARB[star-1]*(.7+.15*cost),
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
const isComp=it=>it.k.length===1&&COMP[it.k];
const isCraft=it=>!!CRAFT[it.k];
const isUse=it=>!!USE[it.k];
function itemDef(it){if(isComp(it))return COMP[it.k];if(isCraft(it))return CRAFT[it.k];return USE[it.k];}
function itemName(it){const d=itemDef(it);return(it.mut&&it.mut.length?it.mut.map(m=>MUTS[m].n).join(' ')+' ':'')+d.n;}
function itemTier(it){return isComp(it)?'common':isCraft(it)?'epic':'use';}
function addE(t,e){for(const k in e)t[k]=(t[k]||0)+e[k];return t;}
function itemEffects(it){
  const t={};
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

/* ---------- traits ---------- */
function countTraits(list){const seen=new Set(),ct={};
  for(const u of list){if(seen.has(u.root))continue;seen.add(u.root);
    for(const t of D[u.dex].t)ct[t]=(ct[t]||0)+1;
    if(!MODE.gen){const rg=REGIONS[lineOf(u).region];ct[rg]=(ct[rg]||0)+1;}}
  return ct;}
const traitDef=k=>TT[k]||RT[k];
const tierOf=(k,n)=>BP.filter(b=>n>=b).length;

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
  run.shop=[];const o=LVODDS[run.level];for(let i=0;i<5;i++)run.shop.push(pick(MODE.byCost[rollCostFor(o)-1]));
  if(first)run.shop[0]=run.featured[0];
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
function canEquip(it,u){if(isUse(it))return!!USE[it.k].target;if(isComp(it)&&u.items.some(isComp))return true;return u.items.length<3;}
function useItem(bi,u){
  const it=run.bag[bi];if(!it)return false;
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
    const mult=(1.14+(f-4)*.025+(kind==='elite'?.06:0))*(hasRelic('town-map')?.92:1);
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
  hideTip();mode='combat';units=[];events=[];combatT=0;proj=[];texts=[];battle={coin:0,flute:hasRelic('poke-flute')};
  const mine=boardUnits(),ptr=countTraits(mine.map(x=>x.u)),etr=countTraits(enemyPreview.map(e=>e.u));
  for(const b of mine)units.push(makeCombatant(b.u,0,b.c,b.r,ptr,1));
  for(const e of enemyPreview)units.push(makeCombatant(e.u,1,e.c,e.r,etr,e.mult,e.boss));
  // start-of-battle effects
  for(const u of units){
    if(u.clay)for(const o of units)if(o.team===u.team&&hdist(o,u)<=1)o.shield+=o.maxHp*u.clay;
    if(u.soothe)for(const o of units)if(o!==u&&o.team===u.team&&hdist(o,u)<=1)o.regen+=u.soothe;
    if(u.booster){u.as*=1.4;u.dmg+=.2;schedule(6,()=>{u.as/=1.4;u.dmg-=.2;});}
    if(u.team===0&&hasRelic('bicycle')){u.as*=1.3;schedule(6,()=>{u.as/=1.3;});}
  }
  renderUI();return true;
}
function makeCombatant(u,team,c,r,tr,mult,boss){
  const L=lineOf(u),st=unitStats(u.dex,L.cost,u.star),g=u.g||{};
  const E={};for(const it of u.items)addE(E,itemEffects(it));
  for(const t of D[u.dex].t){const ti=tierOf(t,tr[t]||0);if(ti)addE(E,TT[t].e[ti-1]);}
  if(!MODE.gen){const rg=REGIONS[L.region],ti=tierOf(rg,tr[rg]||0);if(ti)addE(E,RT[rg].e[ti-1]);}
  let taken=1;
  if(team===0){const s=run.strat.id,ty=D[u.dex].t;
    if(s==='ember'&&ty.includes('Fire'))addE(E,{dmg:.15});
    if(s==='tidal'){taken*=.9;if(ty.includes('Water'))addE(E,{mana:10});}
    if(s==='verdant'&&ty.includes('Grass'))addE(E,{regen:.01});
    if(augIs('tailwind'))addE(E,{as:.12});if(augIs('oran'))addE(E,{hpF:150});if(augIs('swords'))addE(E,{dmg:.18});if(augIs('champion'))addE(E,{dmg:.3,as:.15});if(augIs('endure'))E.focus=(E.focus||0)+1;
    if(hasRelic('soothe-bell'))addE(E,{regen:.015});if(hasRelic('rainbow-wing'))addE(E,{hpP:.12,dmg:.12});if(hasRelic('silver-wing'))addE(E,{shieldP:.15});
  }
  for(const d of E.dr?[E.dr]:[])taken*=1-d;
  const bm=boss?{hp:5,atk:1.5,def:15}:{hp:1,atk:1,def:0};
  let hp=(st.hp*mult+(g.hp||0))*bm.hp+(E.hpF||0);hp*=1+(E.hpP||0);
  let def=st.def+(E.def||0)+(g.def||0)+bm.def,res=st.res+(E.res||0)+(g.res||0)+bm.def;
  if(E.eviolite&&MODE.kids(u.dex).length){def*=1.5;res*=1.5;hp*=1.2;}
  const x={u,team,c,r,boss:!!boss,cat:st.cat,kind:st.kind,base:st.base*mult*(boss?2:1),
    hp,maxHp:hp,atk:(st.atk*mult+(g.atk||0))*bm.atk*(1+(E.atkP||0)),spa:(st.spa*mult+(g.spa||0))*bm.atk*(1+(E.spaP||0)),
    def,res,as:st.as*(1+(E.as||0)+(g.as||0)),range:st.range+(E.range||0),maxMana:st.mana,mana:st.start+(E.mana||0),
    dmg:1+(E.dmg||0),abm:1+(E.ab||0),physAb:E.physAb||0,specAb:E.specAb||0,crit:E.crit||0,critD:.5,abCrit:!!E.abCrit,
    ls:E.ls||0,regen:E.regen||0,dodge:Math.min(.6,E.dodge||0),taken,shield:hp*(E.shieldP||0),
    focus:E.focus||0,orb:E.orb||0,giant:E.giant||0,shred:E.shred||0,extraPP:E.extraPP||0,metroAS:E.metroAS||0,metroN:0,
    bulb:!!E.bulb,burnP:E.burn||0,spray:E.spray||0,specPen:E.specPen||0,wp:E.wp||0,magnet:!!E.magnet,magN:0,double:E.double||0,
    helmet:E.helmet||0,sitrus:E.sitrus||0,clay:E.clay||0,assault:E.assault||0,soothe:E.soothe||0,stunImm:!!E.stunImm,cloak:E.cloak||0,
    xpEgg:E.xp||0,kee:E.kee||0,leppa:E.leppa||0,booster:!!E.booster,coin:!!E.coin,goldMut:E.gold||0,
    kills:0,casts:0,hits:0,dealt:0,burn:null};
  const p=hexXY(c,r);
  return Object.assign(x,{x:p.x,y:p.y,dex:u.dex,dir:team?DIR.down:DIR.up,anim:'Idle',animT:Math.random(),loop:true,cd:rnd(.1,.5),target:null,move:null,stun:0,dead:false,deadT:0,flash:0,busy:0});
}

/* ================= Combat ================= */
const alive=t=>units.filter(u=>!u.dead&&u.team===t);
const occupied=(c,r,ex)=>units.some(u=>u!==ex&&!u.dead&&((u.c===c&&u.r===r)||(u.move&&u.move.c===c&&u.move.r===r)));
function setAnim(u,a,loop=false){if(SIM.on)return;u.anim=a;u.animT=0;u.loop=loop;}
function schedule(dt,fn){events.push({t:combatT+dt,fn});}
const aLen=(u,a)=>SIM.on?.5:animLen(u.dex,a), hTime=(u,a)=>SIM.on?.25:hitTime(u.dex,a);
function stepCombat(dt){
  combatT+=dt;
  for(let i=events.length-1;i>=0;i--)if(events[i].t<=combatT){const e=events[i];events.splice(i,1);e.fn();}
  for(const u of units){
    u.animT+=dt;u.flash=Math.max(0,u.flash-dt);
    if(u.dead){u.deadT+=dt;continue;}
    if(!SIM.on&&!u.loop&&u.animT>=animLen(u.dex,u.anim)&&!u.move)setAnim(u,'Idle',true);
    if(u.regen>0)heal(u,u.maxHp*u.regen*dt,true);
    if(u.burn){u.burn.t-=dt;hurt(u,u.maxHp*u.burn.p*dt,u.burn.src);if(u.burn.t<=0)u.burn=null;if(u.dead)continue;}
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
  if((!a||!b||combatT>45)&&!events.some(e=>e.end))events.push({t:combatT+(SIM.on?0:1.1),end:1,fn:()=>endCombat(a&&b?(hpFrac(0)>=hpFrac(1)):!!a)});
}
const hpFrac=t=>{const l=units.filter(u=>u.team===t);return l.reduce((s,u)=>s+Math.max(0,u.hp)/u.maxHp,0)/l.length;};
const tcol=u=>TYPES[D[u.dex].t[0]];
function stun(tg,t){if(tg.stunImm||tg.dead)return;tg.stun=Math.max(tg.stun,t);}
function autoAmt(u){return u.cat==='spec'?u.spa*.8:u.atk;}
function attack(u,tg){
  const anim=u.range>1?'Shoot':'Attack';setAnim(u,anim);u.busy=Math.min(aLen(u,anim),.55);
  schedule(hTime(u,anim),()=>{if(u.dead)return;
    const hit=()=>{if(tg.dead)return;damage(u,tg,autoAmt(u),{cat:u.cat});onHitFx(u,tg);};
    if(u.range>1&&!SIM.on)shoot(u,tg,tcol(u),hit);else{hit();if(!SIM.on)spark(tg.x,tg.y-10,'#ffffff',5);}
    if(u.double&&Math.random()<u.double)schedule(.12,hit);
    u.mana=Math.min(u.maxMana,u.mana+10+u.extraPP);
    if(u.orb)u.hp=Math.max(1,u.hp-u.maxHp*u.orb);
    if(u.metroAS&&u.metroN<12){u.metroN++;u.as*=(1+u.metroAS*u.metroN)/(1+u.metroAS*(u.metroN-1));}
    if(u.magnet&&++u.magN%3===0){alive(1-u.team).sort((a,b)=>hdist(u,a)-hdist(u,b)).slice(0,3).forEach(o=>{damage(u,o,60+.3*u.spa,{cat:'spec',ab:false,noCrit:1});if(!SIM.on)burst(o.x,o.y-10,'#ffe14d',6,.6);});}
  });
}
function onHitFx(u,tg){
  if(u.shred)tg.def=Math.max(0,tg.def-u.shred);
  if(u.burnP)tg.burn={p:Math.max(u.burnP,tg.burn?tg.burn.p:0),t:4,src:u};
}
function shoot(u,tg,col,onHit,size=2){proj.push({x:u.x,y:u.y-10,tg,col,onHit,size,trail:[]});}
function hurt(tg,d,src){ // raw HP loss (burn, helmet); can faint
  if(tg.dead)return;let left=d;if(tg.shield>0){const s=Math.min(tg.shield,left);tg.shield-=s;left-=s;}tg.hp-=left;checkHp(tg,src);
}
function checkHp(tg,src){
  if(tg.sitrus&&tg.hp>0&&tg.hp<tg.maxHp*.5){heal(tg,tg.maxHp*tg.sitrus);tg.sitrus=0;}
  if(tg.kee&&tg.hp>0&&tg.hp<tg.maxHp*.4){tg.def+=tg.kee;tg.res+=tg.kee;tg.kee=0;}
  if(tg.hp>0)return;
  if(tg.focus>0){tg.focus--;tg.hp=1;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Hung on!',col:'#ff8a7a',life:1.2});return;}
  if(tg.team===0&&battle.flute){battle.flute=false;tg.hp=tg.maxHp*.35;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Woke up!',col:'#c6b3ff',life:1.2});return;}
  tg.dead=true;tg.hp=0;setAnim(tg,'Faint');tg.move=null;if(!SIM.on)burst(tg.x,tg.y-8,'#ffffff',10,.7);
  if(src&&!src.dead){src.kills++;if(src.coin&&src.team===0&&battle.coin<2){battle.coin++;run.gold++;if(!SIM.on)texts.push({x:src.x,y:src.y-30,txt:'+₽1',col:'#ffd34d',life:1});}}
}
function damage(src,tg,amt,o={}){
  if(!tg||tg.dead)return 0;
  if(!o.ab&&tg.dodge&&Math.random()<tg.dodge){if(!SIM.on)texts.push({x:tg.x,y:tg.y-22,txt:'Miss',col:'#cfe0ff',life:.7});return 0;}
  const crit=!o.noCrit&&(!o.ab||src.abCrit)&&Math.random()<src.crit;
  let d=amt*src.dmg*(crit?1+src.critD:1);
  if(o.ab)d*=src.abm*(1+(o.cat==='phys'?src.physAb:src.specAb));
  if(src.giant&&tg.maxHp>1500)d*=1+src.giant;
  if(o.cat==='phys')d*=100/(100+tg.def);else if(o.cat==='spec')d*=100/(100+tg.res*(1-src.specPen));
  if(o.cat==='spec')d*=1-tg.assault;
  if(o.ab)d*=1-tg.cloak;
  d*=tg.taken;
  tg.hits++;src.dealt+=d;
  if(!SIM.on){tg.flash=.15;texts.push({x:tg.x+rnd(-6,6),y:tg.y-22,txt:Math.round(d)+(crit?'!':''),col:o.ab?(o.cat==='spec'?'#b9a4ff':'#ffd34d'):crit?'#ffb08a':'#ffffff',big:o.ab||crit,life:.9});}
  tg.mana=Math.min(tg.maxMana,tg.mana+Math.min(12,d*.04));
  if(src.ls&&!src.dead)heal(src,d*src.ls,true);
  if(!o.ab&&src.range===1&&tg.helmet&&!src.dead)hurt(src,tg.maxHp*tg.helmet,tg);
  if(o.ab&&tg.bulb){tg.mana=Math.min(tg.maxMana,tg.mana+20);tg.spa*=1.1;}
  if(o.ab&&tg.wp){tg.atk*=1+tg.wp;tg.spa*=1+tg.wp;tg.wp=0;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'Policy!',col:'#ffd34d',life:1});}
  hurt(tg,d,src);
  if(!tg.dead&&!SIM.on&&!tg.move&&tg.busy<=0&&Math.random()<.3){setAnim(tg,'Hurt');tg.busy=.2;}
  return d;
}
function heal(u,amt,quiet){if(u.dead)return;if(u.burn)amt*=.5;const h=Math.min(u.maxHp-u.hp,amt);u.hp+=h;if(!quiet&&h>1&&!SIM.on)texts.push({x:u.x,y:u.y-24,txt:'+'+Math.round(h),col:'#7dff7a',life:.9});}
function moveValue(c){const K=KINDS[c.kind];const stat=K.stat==='auto'?(c.cat==='spec'?c.spa:c.atk):c[K.stat];return{base:c.base,ratio:K.ratio,stat,total:c.base+K.ratio*stat};}
function cast(u,tg){
  u.mana=0;u.casts++;const k=u.kind,stunT=STUNTYPES.has(D[u.dex].t[0]);
  const anim=k==='strike'||k==='dash'?'Attack':'Shoot';setAnim(u,anim);u.busy=Math.min(aLen(u,anim),.7);
  if(!SIM.on)texts.push({x:u.x,y:u.y-34,txt:moveName(u.dex),col:'#ffffff',life:1.1,label:1});
  const col=tcol(u),adj=t=>alive(t.team).filter(o=>o!==t&&hdist(o,t)<=1);
  schedule(hTime(u,anim),()=>{if(u.dead)return;
    const v=moveValue(u).total;
    const fxb=(t,c,n,p)=>{if(!SIM.on)burst(t.x,t.y-10,c,n,p);};
    switch(k){
      case'strike':damage(u,tg,v,{ab:1,cat:'phys'});onHitFx(u,tg);if(stunT)stun(tg,.75);fxb(tg,col,14,1);break;
      case'dash':{const w=alive(1-u.team).sort((a,b)=>a.hp-b.hp)[0];if(w){const go=()=>{damage(u,w,v,{ab:1,cat:'phys'});onHitFx(u,w);fxb(w,col,14,1);};SIM.on?go():shoot(u,w,col,go,3);}break;}
      case'blast':{const go=()=>{damage(u,tg,v,{ab:1,cat:'spec'});onHitFx(u,tg);if(stunT)stun(tg,.75);adj(tg).forEach(o=>damage(u,o,v*.5,{ab:1,cat:'spec'}));fxb(tg,col,20,1.2);};SIM.on?go():shoot(u,tg,col,go,3);break;}
      case'guard':u.shield+=u.base*1.3+u.maxHp*.12;if(!SIM.on)ring(u.x,u.y-8,'#dfe8ff');damage(u,tg,u.base*.3+v-u.base,{ab:1,cat:u.cat});break;
      case'heal':{const al=alive(u.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(al){heal(al,v);if(!SIM.on){ring(al.x,al.y-8,'#c6ff8a');burst(al.x,al.y-12,'#e9ffb0',12,.6);}}break;}
    }
    if(u.spray)u.spa*=1+u.spray;
    if(u.leppa)u.mana=Math.min(u.maxMana,u.mana+u.leppa);
  });
}
function endCombat(win){
  mode='result';const f=run.floor,kind=floorKind(f);
  // growth, lucky eggs, golden items
  const grew=[];let xp=0,gold=0;
  for(const c of units){if(c.team!==0)continue;const u=c.u;
    xp+=c.xpEgg;if(win)gold+=c.goldMut;
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
    if(mode==='combat'||mode==='result'){for(const u of units){if(u.dead&&u.deadT>1.2)continue;list.push({dex:u.dex,anim:u.anim,t:u.animT,dir:u.dir,x:u.x,y:u.y,loop:u.loop,alpha:u.dead?Math.max(0,1-u.deadT/1.2):1,cu:u,shadow:1,sc:(u.boss?1.25:starScale(u.u.star))});}}
    else{for(const b of boardUnits()){if(drag&&drag.u===b.u)continue;const p=hexXY(b.c,b.r);list.push({dex:b.u.dex,anim:'Idle',t:t+b.u.uid*.37,dir:DIR.up,x:p.x,y:p.y,pu:b.u,shadow:1,sc:starScale(b.u.star)});}
      if(mode!=='loot')for(const e of enemyPreview){const p=hexXY(e.c,e.r);list.push({dex:e.u.dex,anim:'Idle',t:t+e.u.uid*.29,dir:DIR.down,x:p.x,y:p.y,pu:e.u,enemy:1,shadow:1,sc:e.boss?1.25:starScale(e.u.star)});}}
    run.bench.forEach((u,i)=>{if(!u||(drag&&drag.u===u))return;const p=benchXY(i);list.push({dex:u.dex,anim:'Idle',t:t+u.uid*.41,dir:DIR.down,x:p.x,y:p.y-2,pu:u,bench:1});});
  }
  list.sort((a,b)=>a.y-b.y);
  for(const s of list)if(s.shadow){ctx.fillStyle=`rgba(10,30,10,${.35*(s.alpha??1)})`;ctx.beginPath();ctx.ellipse(s.x,s.y+1,9*(s.sc||1),3.2,0,0,7);ctx.fill();}
  if(chest)drawChest(chest,t);
  for(const s of list){const o={loop:s.loop!==false,alpha:s.alpha??1,scale:s.sc||1};drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,o);
    if(s.cu&&s.cu.flash>0){ctx.globalCompositeOperation='lighter';drawSprite(s.dex,s.anim,s.t,s.dir,s.x,s.y-6,{...o,alpha:.6});ctx.globalCompositeOperation='source-over';}}
  for(const p of proj){p.trail.forEach((q,i)=>{ctx.globalAlpha=(i+1)/p.trail.length*.6;ctx.fillStyle=p.col;ctx.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,p.size,p.size);});
    ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.fillRect(Math.round(p.x)-p.size/2-1,Math.round(p.y)-p.size/2-1,p.size+2,p.size+2);ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x)-p.size/2,Math.round(p.y)-p.size/2,p.size,p.size);}
  for(const p of fx){ctx.globalAlpha=Math.max(0,p.life/p.max);if(p.ring){ctx.strokeStyle=p.col;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.45,0,0,7);ctx.stroke();}else{ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.sz,p.sz);}}
  ctx.globalAlpha=1;
  for(const s of list){if(s.bench&&mode!=='plan'&&mode!=='loot')continue;drawBar(s);drawItems(s);}
  for(const l of leaves){ctx.fillStyle=l.col;ctx.fillRect(Math.round(l.x),Math.round(l.y),2,1);ctx.fillRect(Math.round(l.x)+1,Math.round(l.y)+1,1,1);}
  if(drag)drawSprite(drag.u.dex,'Walk',t,DIR.down,drag.x,drag.y-6);
  ctx.setTransform(1,0,0,1,0,0);
  if(chest&&!chest.open){const bob=Math.sin(t*3)*3;ctx.font='700 18px "Pixelify Sans",sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#1b2430';const txt=chest.kind==='relic'?'Open the rival\'s chest':'Open the chest';
    ctx.strokeText(txt,chest.x*2,chest.y*2-46+bob);ctx.fillStyle='#ffe27a';ctx.fillText(txt,chest.x*2,chest.y*2-46+bob);}
  for(const tx of texts){ctx.globalAlpha=Math.min(1,tx.life*2.5);ctx.font=tx.label?'600 16px "Pixelify Sans",sans-serif':tx.big?'700 22px "Pixelify Sans",sans-serif':'700 17px "Pixelify Sans",sans-serif';
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
  u.items.forEach((it,i)=>{const im=ITEMIMG[itemDef(it).id];const x=x0+i*(z+1);ctx.fillStyle=isCraft(it)?'#c9961d':'#1b2430';ctx.fillRect(x-1,y-1,z+2,z+2);ctx.fillStyle='#f7f6ee';ctx.fillRect(x,y,z,z);if(im&&im.complete)ctx.drawImage(im,x,y,z,z);});
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
  drag={u:hit.u,from:hit.from,x:p.x,y:p.y,over:null};hideTip();cv.setPointerCapture(e.pointerId);});
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
function moveText(kind,mv,cat,stunT){
  const r=`<span class="sc">(${Math.round(mv.base)} + ${pct(mv.ratio)} ${KINDS[kind].stat==='spa'||(KINDS[kind].stat==='auto'&&cat==='spec')?'Sp. Atk':'Attack'})</span>`,T=Math.round(mv.total);
  switch(kind){
    case'strike':return`Strikes the target for <b>${T}</b> physical damage ${r}${stunT?' and stuns it for 0.75s':''}.`;
    case'dash':return`Dashes at the weakest enemy for <b>${T}</b> physical damage ${r}.`;
    case'blast':return`Blasts the target for <b>${T}</b> special damage ${r} and adjacent enemies for <b>${Math.round(T*.5)}</b>${stunT?'. Stuns the target for 0.75s':''}.`;
    case'guard':return`Gains a shield of <b>${Math.round(mv.base*1.3)}</b> + 12% max HP, then hits for <b>${Math.round(mv.base*.3+mv.ratio*mv.stat)}</b> ${cat==='spec'?'special':'physical'} damage.`;
    case'heal':return`Restores <b>${T}</b> HP ${r} to the most injured ally.`;
  }
}
function showTip(u,e,hit={}){
  const L=lineOf(u),tip=$('tip'),enemy=hit.enemy||(hit.cu&&hit.cu.team);
  const c=hit.cu||makeCombatant(u,enemy?1:0,0,0,{},hit.mult||1,hit.boss||(hit.cu&&hit.cu.boss));
  const mv=moveValue(c),G=growthOf(u),evo=MODE.kids(u.dex).map(k=>D[k].n);
  const hp=hit.cu?`${Math.round(c.hp)}/${Math.round(c.maxHp)}`:Math.round(c.maxHp);
  tip.innerHTML=`<div class="top"><img src="${por(u.dex)}" alt=""><div><div class="lbl">${enemy?'Opponent':`Cost ₽${L.cost} · ${roleOf(u.dex)}`}</div><h3>${esc(D[u.dex].n)}</h3>
    <div class="stars">${'★'.repeat(u.star)}</div><div class="chips">${typeChips(u.dex)}${MODE.gen?'':chip(REGIONS[L.region],REGCOL[L.region])}</div></div></div>
    <div class="stats"><div><span class="lbl">HP</span><b>${hp}</b></div><div><span class="lbl">Atk</span><b>${Math.round(c.atk)}</b></div><div><span class="lbl">Sp.Atk</span><b>${Math.round(c.spa)}</b></div><div><span class="lbl">Speed</span><b>${c.as.toFixed(2)}</b></div>
    <div><span class="lbl">Def</span><b>${Math.round(c.def)}</b></div><div><span class="lbl">Sp.Def</span><b>${Math.round(c.res)}</b></div><div><span class="lbl">Range</span><b>${c.range}</b></div><div><span class="lbl">PP</span><b>${Math.round(c.mana)}/${c.maxMana}</b></div></div>
    <div class="ab"><b>${moveName(u.dex)}</b> <span class="sc">${c.cat==='spec'?'Special':'Physical'}</span><p>${moveText(c.kind,mv,c.cat,STUNTYPES.has(D[u.dex].t[0]))}</p></div>
    ${u.items&&u.items.length?`<div class="items">${u.items.map(it=>`<div><img src="${iconOf(itemDef(it).id)}" alt=""><span><b>${esc(itemName(it))}</b></span></div>`).join('')}</div>`:''}
    ${G?`<div class="grow"><b>${G.n}</b>: ${G.d}${u.gs?`<br>Grown ${u.gs} time${u.gs>1?'s':''} this run.`:''}</div>`:''}
    ${!enemy&&u.star<3&&evo.length?`<div class="lbl" style="margin-top:8px">${u.star===1?'At 2★':'At 3★'}: ${evo.length>1?'choose '+esc(evo.join(' / ')):'evolves into '+esc(evo[0])}</div>`:''}`;
  placeTip(e);
}
function itemBody(it,compact){
  const lines=[];
  if(isComp(it)){lines.push(`<p>${COMP[it.k].d}.</p>`);
    lines.push(`<div class="lbl" style="margin:8px 0 4px">Combines into</div><div class="recipes${compact?' compact':''}">${CORDER.split('').map(o=>{const c=CRAFT[recipeKey(it.k,o)];return compact?`<div title="+ ${COMP[o].n} → ${c.n}"><img src="${iconOf(COMP[o].id)}" alt=""><img src="${iconOf(c.id)}" alt="${c.n}"></div>`:`<div><img src="${iconOf(COMP[o].id)}" alt=""><span>→</span><img src="${iconOf(c.id)}" alt=""><span>${c.n}</span></div>`;}).join('')}</div>`);}
  else if(isCraft(it)){lines.push(`<p>${CRAFT[it.k].d}</p><p class="sc">Also: ${COMP[it.k[0]].d}, ${COMP[it.k[1]].d}.</p>`);}
  else lines.push(`<p>${USE[it.k].d}</p>`);
  for(const m of it.mut||[])lines.push(`<p class="mut"><b>${MUTS[m].n}:</b> ${MUTS[m].d}${m==='growing'&&it.gs?` (now +${pct(it.gs)})`:''}.</p>`);
  return lines.join('');
}
function showItemTip(it,e){const tip=$('tip');const t=itemTier(it);
  tip.innerHTML=`<div class="top"><img src="${iconOf(itemDef(it).id)}" alt="" style="width:56px;height:56px"><div><div class="lbl">${t==='common'?'Component':t==='epic'?'Completed item':'Consumable'}</div><h3 style="font-size:19px">${esc(itemName(it))}</h3></div></div><div class="ab">${itemBody(it)}</div>
  <div class="lbl" style="margin-top:8px">${isUse(it)?(USE[it.k].target?'Drag onto a Pokémon':'Click to use'):isComp(it)?'Drag onto a Pokémon or another component':'Drag onto a Pokémon'}</div>`;placeTip(e);}
function showInfoTip(html,e){$('tip').innerHTML=html;placeTip(e);}
function placeTip(e){const tip=$('tip'),sr=stage.getBoundingClientRect(),sc=sr.width/1280;let x=(e.clientX-sr.left)/sc+18,y=(e.clientY-sr.top)/sc-40;
  tip.style.display='block';const th=tip.offsetHeight;if(x>1280-306)x-=330;y=clamp(y,80,720-th-10);tip.style.left=x+'px';tip.style.top=y+'px';}
function hideTip(){$('tip').style.display='none';}
let toastT=0;function toast(m){if(SIM.on)return;const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',2600);}
function banner(title,sub,ms){const h=$('bannerhost');h.innerHTML=`<div class="banner win">${esc(title)}${sub?`<small>${esc(sub)}</small>`:''}</div>`;setTimeout(()=>{if(h.firstChild&&h.firstChild.textContent.startsWith(title))h.innerHTML='';},ms);}
function showGameUI(on){['hud','traits','mods','shop','bag'].forEach(id=>$(id).hidden=!on);}
function renderUI(){
  if(!run||SIM.on)return;const f=run.floor;
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
  const keys=Object.keys(ct).sort((a,b)=>tierOf(b,ct[b])-tierOf(a,ct[a])||ct[b]-ct[a]||a.localeCompare(b));
  const MAXT=5,shown=keys.slice(0,MAXT);
  $('traits').innerHTML=keys.length?shown.map(k=>{const n=ct[k],ti=tierOf(k,n),T=traitDef(k),isType=!!TT[k];
    const col=isType?TYPES[k]:REGCOL[REGIONS.indexOf(k)];
    return`<div class="trait ${ti?'t'+ti:'off'}" data-trait="${k}"><div class="hex"><span class="in" style="background:${col}">${k.slice(0,3).toUpperCase()}</span></div><div><div class="nm">${k}</div><div class="bp">${BP.map(b=>n>=b?`<b>${b}</b>`:b).join(' › ')}</div></div><div class="ct">${n}</div></div>`;}).join('')+(keys.length>MAXT?`<div class="more">+${keys.length-MAXT} more</div>`:'')
    :`<div class="hint">Place Pokémon on the field to activate type${MODE.gen?'':' and region'} bonuses.</div>`;
  const s=run.strat,inc=incomePreview();
  let mh=`<div class="mod"><div class="k">Strategy</div><div class="v">${s.name}</div><p>${s.guide}</p></div>`;
  if(run.aug)mh+=`<div class="mod ${run.augTier}"><div class="k">${run.augTier} augment</div><div class="v">${run.aug.name}</div><p>${run.aug.d}</p></div>`;
  if(run.relics.length)mh+=`<div class="mod"><div class="k">Relics</div><div class="relics">${run.relics.map(r=>`<img src="${iconOf(r)}" alt="${esc(RELICS[r].n)}" data-relic="${r}">`).join('')}</div></div>`;
  mh+=`<div class="mod"><div class="k">Next floor income</div><div class="v inc">₽${inc.base+inc.interest+inc.streak+inc.extra}</div><p>₽${inc.base} base · ₽${inc.interest} interest · ₽${inc.streak} ${run.streak<0?'loss':'win'} streak${inc.extra?` · ₽${inc.extra} Pay Day`:''}</p></div>`;
  if(mode!=='loot')mh+=`<div class="mod"><div class="k">Next opponent</div><div class="v">${esc(trainerName(f))}</div><p>Hover their Pokémon to scout them.</p></div>`;
  $('mods').innerHTML=mh;
  const plan=mode==='plan',owned=new Set(allOwned().filter(u=>u.star<3).map(u=>u.root));
  $('cards').innerHTML=run.shop.map((r,i)=>{if(!r)return`<div class="card empty" aria-hidden="true"></div>`;const L=MODE.lines[r];const G=growthOf({root:r});
    return`<button class="card c${L.cost}${run.gold<L.cost?' poor':''}${owned.has(r)?' owned':''}" data-i="${i}" ${plan?'':'disabled'} aria-label="Buy ${esc(D[r].n)} for ${L.cost}"><div class="band"><span class="name">${esc(D[r].n)}</span><span class="cost">₽${L.cost}</span></div>
      <div class="body"><img class="por" src="${por(r)}" alt=""><div class="info"><span class="role">${roleOf(r)} · Range ${unitStats(r,1,1).range}</span><div class="chips">${typeChips(r)}${MODE.gen?'':chip(REGIONS[L.region],REGCOL[L.region])}</div><span class="role">${moveName(r)}</span></div></div>${G?'<span class="grows">Grows</span>':''}</button>`;}).join('');
  $('reroll').disabled=!plan||(run.gold<2&&run.freeRerolls<=0);$('rerollcost').textContent=run.freeRerolls>0?`Free ×${run.freeRerolls}`:'₽2';
  $('buyxp').disabled=!plan||run.gold<4||run.level>=MAXLV;
  $('fight').disabled=!plan;$('fight').textContent=mode==='combat'?'Battling…':mode==='loot'?'Open chest':'Battle!';
  if(mode==='loot')$('fight').disabled=false;
  // bag
  $('bagct').textContent=`${run.bag.length}/${BAGMAX}`;
  let sl='';for(let i=0;i<BAGMAX;i++){const it=run.bag[i];sl+=it?`<button class="slot t-${itemTier(it)==='epic'?'epic':itemTier(it)==='use'?'use':'common'}" data-i="${i}" aria-label="${esc(itemName(it))}"><img src="${iconOf(itemDef(it).id)}" alt="">${it.mut&&it.mut.length?'<i class="mutdot"></i>':''}</button>`:`<div class="slot empty"></div>`;}
  $('slots').innerHTML=sl;
}
$('cards').addEventListener('click',e=>{const c=e.target.closest('.card');if(c&&c.dataset.i)buy(+c.dataset.i);});
$('cards').addEventListener('pointermove',e=>{const c=e.target.closest('.card');const r=c&&c.dataset.i?run.shop[+c.dataset.i]:null;if(r)showTip(mkUnit(r),e);else hideTip();});
$('cards').addEventListener('pointerleave',hideTip);
$('mods').addEventListener('pointermove',e=>{const r=e.target.dataset&&e.target.dataset.relic;if(r)showInfoTip(`<div class="top"><img src="${iconOf(r)}" alt="" style="width:48px;height:48px"><div><div class="lbl">Relic</div><h3 style="font-size:19px">${RELICS[r].n}</h3></div></div><div class="ab"><p>${RELICS[r].d}</p></div>`,e);else hideTip();});
$('mods').addEventListener('pointerleave',hideTip);
$('traits').addEventListener('pointermove',e=>{const el=e.target.closest('.trait');if(!el){hideTip();return;}const k=el.dataset.trait,T=traitDef(k),n=countTraits(Object.values(run.board))[k]||0;
  showInfoTip(`<div class="lbl">${TT[k]?'Type':'Region'} bonus</div><h3 style="font-size:20px;margin:2px 0 6px">${k}</h3><p style="margin:0;line-height:1.4">${T.d}</p><p class="sc" style="margin:6px 0 0">Active at ${BP.join(' and ')} different Pokémon. You have ${n}.</p>`,e);});
$('traits').addEventListener('pointerleave',hideTip);
$('reroll').onclick=reroll;
$('buyxp').onclick=buyXP;
$('fight').onclick=()=>{if(mode==='loot')openChest();else startCombat();};
$('speed').onclick=()=>{speed=speed===1?2:1;$('speed').setAttribute('aria-pressed',speed===2);};
addEventListener('keydown',e=>{if(evoOpen||!run)return;
  if(mode==='loot'&&(e.key===' '||e.key==='Enter')){e.preventDefault();openChest();return;}
  if(mode!=='plan')return;if(e.key==='d'||e.key==='D')reroll();if(e.key==='f'||e.key==='F')buyXP();if(e.key===' '){e.preventDefault();startCombat();}});

/* ================= Screens ================= */
const ov=$('overlay');
function bestOf(id){try{return localStorage.getItem('pokerun.best.'+id);}catch(e){return null;}}
function setBest(id,v){try{const b=+(localStorage.getItem('pokerun.best.'+id)||0);if(v>b)localStorage.setItem('pokerun.best.'+id,v);}catch(e){}}
function setWander(dexes){wander=dexes.map((d,i)=>({dex:d,x:200+(i%5)*60+rnd(-10,10),y:110+Math.floor(i/5)*70+rnd(-10,10),dir:0,anim:'Idle',t:rnd(0,2),wait:rnd(0,2)}));preload(dexes);}
function showTitle(){
  mode='title';showGameUI(false);run=null;MODE=null;chest=null;
  setWander(shuffle(ROOTS.filter(r=>SM[r])).slice(0,10));
  ov.innerHTML=`<div class="screen"><div class="logo">PokéRun<small>Tactics</small></div><div class="tag">Autobattler roguelike · ${ROOTS.length} evolution lines · Act I</div>
    <button class="btn go" id="start" style="font-size:26px;padding:12px 36px;margin-top:10px">Start Run</button></div>
    <div class="credit">Sprites and portraits from the <a href="https://sprites.pmdcollab.org/" target="_blank" rel="noopener">PMD SpriteCollab</a> contributors. Item sprites and Pokédex data from <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>. Fan project, not affiliated with Nintendo, Game Freak or The Pokémon Company.</div>`;
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
  const tl=t==='common'?'Component':t==='epic'?'Completed':t==='use'?'Consumable':'Relic';
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
  mode='over';showGameUI(false);setBest(MODE.id,run.wins);chest=null;
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
  try{await document.fonts.load('700 20px "Pixelify Sans"');}catch(e){}
  const[dex,spr]=await Promise.all([fetch('data/pokedex.json').then(r=>r.json()),fetch('data/sprites.json').then(r=>r.json())]);
  for(const d of dex){d.bst=d.s.reduce((a,b)=>a+b,0);D[d.id]=d;if(d.f)(KIDS[d.f]=KIDS[d.f]||[]).push(d.id);}
  ROOTS=dex.filter(d=>!d.f).map(d=>d.id);
  for(const k in spr)SM[+k]=spr[k];
  loadItemImages();
  BG=renderForest();initLeaves();
  showTitle();
  requestAnimationFrame(frame);
})();
