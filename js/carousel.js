"use strict";
/* PokéRun Tactics — carousel rounds (TFT's shared draft, single-player).
   Floor 1 opens with a carousel of ₽1 Pokémon each holding an item component, so every run starts
   with a free unit and a free component. Floor 6 of every act and floor 1 of later acts bring
   another, with Pokémon your trainer level can roll; from Act II they carry some finished items.
   Pick one: the Pokémon joins your bench and its item goes into your bag. Your field is hidden during the carousel. */
const CAROUSEL_FLOORS=[1,6];
let carHover=-1;
const carDue=f=>CAROUSEL_FLOORS.includes(f)&&!(run.carDone||[]).includes(f);
function genCarousel(f){
  const n=8,opts=[],used=new Set(),F=dFloor(f),open=effFloor(f)===1;
  const odds=open?LVODDS[2]:LVODDS[run.level];
  for(let i=0;i<n;i++){let root=null;
    for(let k=0;k<12&&!root;k++){const c=open?1:Math.max(F>=11?2:1,rollCostFor(odds));const mx=maxedRoots(),pool=MODE.byCost[c-1].filter(r=>!used.has(r)&&!mx.has(r));if(pool.length)root=pick(pool);}
    if(!root)root=pick(MODE.byCost[0]);used.add(root);
    // later acts: more finished items and more 2-star Pokémon on the carousel
    const item=F>=11&&i%(F>=30?2:3)===0?{k:randCraft(),mut:[]}:mkComp(randComp(),[]);
    const u=mkEnemy(root,F>=11&&Math.random()<(F>=30?.6:F>=16?.45:.35)?2:1);u.items=[item];
    // Excess Budget: every carousel Pokémon carries a second item
    const item2=run.strat.id==='budget'?mkComp(randComp(),[]):null;if(item2)u.items.push(item2);
    opts.push({u,item,item2,ph:i/n*Math.PI*2});}
  return{f,opts,t:0,picked:-1};
}
function startCarousel(){
  const f=run.floor;run.car=genCarousel(f);
  if(SIM.on){carTake(Math.floor(Math.random()*run.car.opts.length));return;}
  mode='carousel';showGameUI(true);hideTip();
  preload(run.car.opts.map(o=>o.u.dex)).then(()=>{});
  renderUI();banner(effFloor(f)===1?'Opening carousel':'Carousel','Pick a Pokémon — it brings its item',2200);
}
function carPos(o,t){const a=o.ph+t*.32,cx=320,cy=136;return{x:cx+Math.cos(a)*92,y:cy+Math.sin(a)*58,a};}
function carouselSprites(list,t){if(mode!=='carousel'||!run.car)return;const C=run.car;C.t=t;
  C.opts.forEach((o,i)=>{if(C.picked===i&&C.pickT&&t-C.pickT>.5)return;const p=o.pos=carPos(o,t);const dir=dirFrom(-Math.sin(p.a),Math.cos(p.a)*.6);
    list.push({dex:o.u.dex,anim:'Walk',t:t+i*.21,dir,x:p.x,y:p.y,pu:o.u,shadow:1,sc:starScale(o.u.star)*(carHover===i?1.12:1),alpha:C.picked===i?Math.max(0,1-(t-C.pickT)*2):1});});
}
function drawCarouselGround(t){if(mode!=='carousel')return;ctx.strokeStyle='rgba(255,240,190,.35)';ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.lineDashOffset=-t*12;ctx.beginPath();ctx.ellipse(320,136,92,58,0,0,7);ctx.stroke();ctx.setLineDash([]);
  if(carHover>=0&&run.car.opts[carHover].pos){const p=run.car.opts[carHover].pos;ctx.fillStyle='rgba(255,226,122,.35)';ctx.beginPath();ctx.ellipse(p.x,p.y+1,15,6,0,0,7);ctx.fill();}}
function carAt(x,y){if(!run.car)return-1;let best=-1,bd=1e9;run.car.opts.forEach((o,i)=>{if(!o.pos||run.car.picked>=0)return;const dx=x-o.pos.x,dy=y-(o.pos.y-10);const d=Math.hypot(dx,dy*.8);if(d<18&&d<bd){bd=d;best=i;}});return best;}
function carouselHover(p,e){const i=carAt(p.x,p.y);carHover=i;cv.style.cursor=i>=0?'pointer':'default';
  if(i>=0){const o=run.car.opts[i];showTip(o.u,e,{});}else hideTip();}
function carouselClick(p){const i=carAt(p.x,p.y);if(i<0)return;carTake(i);}
function carTake(i){const C=run.car;if(!C||C.picked>=0)return;const o=C.opts[i];C.picked=i;C.pickT=C.t;if(o.u.star>=2)achUnlock('luckyspin');
  o.u.items=[];const slot=run.bench.indexOf(null);
  if(slot>=0){run.bench[slot]=o.u;if(!SIM.on)ensure(o.u.dex);}else{run.gold+=MODE.lines[o.u.root].cost*o.u.star;if(!SIM.on)toast('Your bench is full, so you took its value in Pokédollars.');}
  for(const it of[o.item,o.item2])if(it&&run.bag.length<BAGMAX)run.bag.push(it);
  run.carDone=[...(run.carDone||[]),C.f];
  if(SIM.on){run.car=null;return;}
  hideTip();carHover=-1;dexLearnOwned();
  if(o.pos)pfx('Circle_Yellow_Out',o.pos.x,o.pos.y-2,{sc:.6,sy:.55,force:1}),pfx('Moonlight_Sparkles',o.pos.x,o.pos.y-16,{force:1});
  toast(`${D[o.u.dex].n} joined your bench with ${itemName(o.item)}${o.item2?` and ${itemName(o.item2)}`:''}.`);
  setTimeout(()=>{run.car=null;mode='plan';startFloor();},900);
}
