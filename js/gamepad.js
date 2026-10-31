"use strict";
/* PokéRun Tactics — controller support (standard gamepad mapping: Xbox-style layouts such as the AYN Thor).
   Left stick moves a cursor, D-pad snaps between targets. A selects: press A on a Pokémon or item to pick it up and A again to place it
   (holding A and dragging also works).
   B back / cancel · X reroll · Y level up · Start battle / open chest · Select menu · LB hide or show the shop · RB release Pokémon under cursor
   Right stick zooms (up/down) and pans (left/right) the board · R3 resets the zoom · L3 battle speed. Cursor speed and dead zone live in Settings › Gamepad. */
const PAD={on:false,x:640,y:360,prev:[],aDown:false,downEl:null,lastMove:0,repeat:{},el:null,hint:null};
const BTN={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,SELECT:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15};

function padStageRect(){return stage.getBoundingClientRect();}
function padClient(){const r=padStageRect(),k=r.width/1280;return{x:r.left+PAD.x*k,y:r.top+PAD.y*k};}
function padFire(type,extra={}){
  const p=padClient();let el=document.elementFromPoint(p.x,p.y)||document.body;
  // a Pokémon drag started on the board keeps receiving events, like pointer capture
  if(typeof drag!=='undefined'&&drag&&(type==='pointermove'||type==='pointerup')){const hit=el;cv.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,pointerId:7,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:1,...extra}));return hit;}
  const init={bubbles:true,cancelable:true,clientX:p.x,clientY:p.y,pointerId:7,pointerType:'mouse',isPrimary:true,button:0,buttons:type==='pointerup'?0:(PAD.aDown?1:0),...extra};
  el.dispatchEvent(new PointerEvent(type,init));
  if(type==='pointermove')el.dispatchEvent(new MouseEvent('mousemove',init));
  return el;
}
function padShow(on){
  if(PAD.on===on)return;PAD.on=on;
  PAD.el.hidden=!on;document.body.classList.toggle('pad',on);
  if(on&&typeof toast==='function')toast('Controller connected. Stick or D-pad to move, A to select, hold A to drag.');
}
function padDraw(){PAD.el.style.left=PAD.x+'px';PAD.el.style.top=PAD.y+'px';PAD.el.classList.toggle('grab',PAD.aDown);}

/* targets for D-pad snapping, in stage coordinates */
function padTargets(){
  const r=padStageRect(),k=r.width/1280,out=[];
  const sel=document.querySelector('#overlay .screen')?'#overlay button, #overlay .pick, #overlay .mode, #overlay .srow':!$('pause').hidden?'#pause button, #mods [data-relic]':'#shop button:not(:disabled), #shop .card, #slots .slot:not(.empty), #bag .baghead, #hud button:not([hidden]), #traits .trait, #overlay button';
  document.querySelectorAll(sel).forEach(el=>{if(el.closest('[hidden]'))return;const b=el.getBoundingClientRect();if(!b.width)return;out.push({x:(b.left+b.width/2-r.left)/k,y:(b.top+b.height/2-r.top)/k});});
  if(!document.querySelector('#overlay .screen')&&$('pause').hidden&&typeof run!=='undefined'&&run&&['plan','loot','combat','result','carousel'].includes(mode)){
    const toStage=(px,py)=>{const q=w2s(px,py-10);return{x:q.x*2,y:q.y*2};};
    for(const b of boardUnits()){const p=hexXY(b.c,b.r);out.push(toStage(p.x,p.y));}
    run.bench.forEach((u,i)=>{if(u){const p=benchXY(i);out.push(toStage(p.x,p.y));}});
    if(mode==='plan')for(const e of enemyPreview){const p=hexXY(e.c,e.r);out.push(toStage(p.x,p.y));}
    if(chest&&!chest.open)out.push(toStage(chest.x,chest.y+4));
    if(mode==='plan')for(const r of rotomOwned())out.push(toStage(r.x,r.y+10));
    if(mode==='carousel'&&run.car)for(const o of run.car.opts)if(o.pos)out.push(toStage(o.pos.x,o.pos.y));
    // while dragging, empty field hexes and bench slots are valid targets too
    if(drag||itemDrag){for(let rr=4;rr<ROWS;rr++)for(let c=0;c<COLS;c++){const p=hexXY(c,rr);out.push(toStage(p.x,p.y+6));}for(let i=0;i<BENCH_N;i++){const p=benchXY(i);out.push(toStage(p.x,p.y+8));}}
  }
  return out;
}
function padSnap(dx,dy){
  const t=padTargets();let best=null,bs=1e9;
  for(const p of t){const vx=p.x-PAD.x,vy=p.y-PAD.y,d=Math.hypot(vx,vy);if(d<8)continue;
    const along=(vx*dx+vy*dy)/d;if(along<.5)continue;const perp=Math.abs(vx*dy-vy*dx);
    const sc=d+perp*2;if(sc<bs){bs=sc;best=p;}}
  if(best){PAD.x=best.x;PAD.y=best.y;padFire('pointermove');}
}
function padPressed(gp,i){const b=gp.buttons[i];return !!b&&(b.pressed||b.value>.5);}
function padEdge(gp,i){return padPressed(gp,i)&&!PAD.prev[i];}
function padRepeat(gp,i,now){ // edge + auto-repeat for D-pad
  if(!padPressed(gp,i)){PAD.repeat[i]=0;return false;}
  if(!PAD.prev[i]){PAD.repeat[i]=now+380;return true;}
  if(now>=PAD.repeat[i]){PAD.repeat[i]=now+120;return true;}return false;
}
function padClickAt(el){const b=el&&el.closest&&el.closest('button, .pick, .mode, .card');if(b&&!b.disabled)b.click();}
function padBack(){
  if(cancelCarry())return;
  const back=document.querySelector('#overlay #back, #overlay #skip, #overlay #setclose, #overlay #dexclose');if(back){back.click();return;}
  if(paused){closePause();return;}
  hideTip();
}
function padPoll(dt){
  const pads=navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[];
  const gp=pads.find(p=>p.connected&&p.buttons.length>=10);
  if(!gp)return;
  const now=performance.now();
  const ax=gp.axes[0]||0,ay=gp.axes[1]||0,mag=Math.hypot(ax,ay);
  const DZ=OPTS.padDZ||.18,any=mag>.25||gp.buttons.some(b=>b.pressed);
  if(any&&!PAD.on)padShow(true);
  if(!PAD.on){PAD.prev=gp.buttons.map(b=>b.pressed);return;}
  // stick: analog cursor with acceleration
  if(mag>DZ){const sp=(mag-DZ)/(1-DZ),v=(420+1100*sp*sp)*(OPTS.padSens||1);PAD.x=clamp(PAD.x+ax/mag*sp*v*dt,4,1276);PAD.y=clamp(PAD.y+ay/mag*sp*v*dt,4,716);
    if(now-PAD.lastMove>30){PAD.lastMove=now;padFire('pointermove');}}
  // right stick: zoom (up/down) and pan (left/right) the board, or a fine cursor nudge if chosen in Settings
  const rx=gp.axes[2]||0,ry=gp.axes[3]||0;
  if(OPTS.padRS==='fine'){if(Math.hypot(rx,ry)>.3){PAD.x=clamp(PAD.x+rx*220*(OPTS.padSens||1)*dt,4,1276);PAD.y=clamp(PAD.y+ry*220*(OPTS.padSens||1)*dt,4,716);padFire('pointermove');}}
  else if($('pause').hidden&&!document.querySelector('#overlay .screen')){if(Math.abs(ry)>.3)camZoom(Math.exp(-(ry-Math.sign(ry)*.3)*1.2*(OPTS.zoomSpd||1)*dt));if(Math.abs(rx)>.3)camPan((rx-Math.sign(rx)*.3)*260*dt,0);}
  if(padRepeat(gp,BTN.UP,now))padSnap(0,-1);if(padRepeat(gp,BTN.DOWN,now))padSnap(0,1);
  if(padRepeat(gp,BTN.LEFT,now))padSnap(-1,0);if(padRepeat(gp,BTN.RIGHT,now))padSnap(1,0);
  // A: press = pointerdown (starts drags), release = pointerup + click
  if(padEdge(gp,BTN.A)){PAD.aDown=true;PAD.downEl=padFire('pointerdown');}
  if(PAD.aDown&&!padPressed(gp,BTN.A)){PAD.aDown=false;const up=padFire('pointerup');
    if(PAD.downEl&&(PAD.downEl===up||PAD.downEl.contains(up)||up.contains(PAD.downEl))&&up!==cv)padClickAt(up);PAD.downEl=null;}
  if(padEdge(gp,BTN.B))padBack();
  if(padEdge(gp,BTN.X)&&run&&mode==='plan'&&!paused)reroll();
  if(padEdge(gp,BTN.Y)&&run&&mode==='plan'&&!paused)buyXP();
  if(padEdge(gp,BTN.START)){const s=document.querySelector('#overlay #m-continue, #overlay #m-new, #overlay #start, #overlay #again, #overlay #evgo');if(s)s.click();else if(paused)closePause();else if(run&&mode==='loot')openChest();else if(run&&mode==='plan')startCombat();}
  if(padEdge(gp,BTN.SELECT)&&run&&!document.querySelector('#overlay .screen')){if(paused)closePause();else openPause();}
  if(padEdge(gp,BTN.LB)&&run&&!paused)toggleShop();
  if(padEdge(gp,BTN.L3))$('speed').click();
  if(padEdge(gp,BTN.R3))camReset();
  if(padEdge(gp,BTN.RB)&&run&&(mode==='plan'||mode==='loot')){const r=padStageRect(),p=padClient();const q=toInternal({clientX:p.x,clientY:p.y});const o=ownedAt(q.x,q.y);if(o)sell(o.u);}
  PAD.prev=gp.buttons.map(b=>b.pressed);
  padDraw();
}
function padInit(){
  PAD.el=document.createElement('div');PAD.el.id='padcursor';PAD.el.hidden=true;PAD.el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2l15 9-6.5 1.5L15 20l-3 1.4-3.3-7.4L3 18z" fill="#fff" stroke="#24303d" stroke-width="2" stroke-linejoin="round"/></svg>';
  stage.appendChild(PAD.el);
  addEventListener('gamepadconnected',()=>{});
  addEventListener('mousemove',e=>{if(PAD.on&&e.isTrusted)padShow(false);});
  addEventListener('touchstart',()=>{if(PAD.on)padShow(false);},{passive:true});
  let last=performance.now();
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;try{padPoll(dt);}catch(e){console.error(e);}requestAnimationFrame(loop);};
  requestAnimationFrame(loop);
}
padInit();
