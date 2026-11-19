"use strict";
/* PokéRun Tactics — controller support (standard gamepad mapping: Xbox-style layouts such as the AYN Thor).
   Left stick moves a visible cursor; the D-pad snaps between targets and hides the cursor (the target is highlighted instead). A selects: press A on a Pokémon or item to pick it up and A again to place it
   (holding A and dragging also works).
   B back / cancel · X reroll · Y level up · Start battle / open chest · Select menu · LB hide or show the shop · RB release Pokémon under cursor
   In menus: the D-pad moves a highlight from button to button (scrolling lists to keep it in view), A presses it, LB / RB switch tabs,
   the right stick scrolls the list under the highlight, and pushing the cursor against the edge of a list scrolls it too.
   Y (or X) on a Pokémon screen (roster editor, partner pick, collection) turns unit cards on or off; while on, the card follows the highlight.
   Right stick zooms (up/down) and pans (left/right) the board · R3 resets the zoom · L3 battle speed. Cursor speed and dead zone live in Settings › Gamepad. */
const PAD={on:false,x:640,y:360,prev:[],aDown:false,downEl:null,lastMove:0,repeat:{},el:null,hint:null,cur:false};
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
// controller mode switches on silently (also during the loading screen) and is remembered for next time
function padShow(on){
  if(PAD.on===on)return;PAD.on=on;
  PAD.el.hidden=!on;document.body.classList.toggle('pad',on);
  try{localStorage.setItem('pokerun-input',on?'pad':'mouse');}catch(e){}
  if(on&&window.LOAD&&!LOAD.gone)LOAD.pad();
}
// the element under the controller cursor gets the same highlight as a mouse hover / keyboard focus
let padHoverEl=null;
function padSetHover(t){if(t===padHoverEl)return;if(padHoverEl)padHoverEl.classList.remove('padhover');padHoverEl=t;if(t)t.classList.add('padhover');}
function padHover(){const f=!PAD.cur&&padFocusEl();if(f){padSetHover(f);return;}const p=padClient();const el=document.elementFromPoint(p.x,p.y);
  padSetHover(el&&el.closest?el.closest('[data-craft],button,.pick,.mode,.card,.srow,.slot:not(.empty),.trait,.mcard,input'):null);}

/* ---------- menus: a focus highlight moved by the D-pad ---------- */
const padMenu=()=>typeof menuRoot==='function'?menuRoot():null;
function padFocusEl(){const r=padMenu(),a=document.activeElement;return r&&a&&a!==document.body&&r.contains(a)?a:null;}
function padPutCursorOn(el){if(!el||!PAD.el)return;const r=padStageRect(),k=r.width/1280,b=el.getBoundingClientRect();
  PAD.x=clamp((b.left+b.width/2-r.left)/k,4,1276);PAD.y=clamp((b.top+b.height/2-r.top)/k,4,716);PAD.cur=false;padSetHover(el);}
// focus an element, keep it in view and put the (hidden) cursor on it
function padFocus(el){if(!el)return;el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});padPutCursorOn(el);}
function padMenuNav(root,dx,dy){
  let cur=padFocusEl();
  // after moving the free cursor with the stick, start from whatever it points at
  if(PAD.cur){const p=padClient(),el=document.elementFromPoint(p.x,p.y),t=el&&el.closest&&el.closest(NAVSEL);if(t&&root.contains(t)){t.focus({preventScroll:true});cur=t;}}
  // settings rows change their value with left / right
  if(cur&&dx&&cur.classList.contains('srow')){cur.dispatchEvent(new KeyboardEvent('keydown',{key:dx<0?'ArrowLeft':'ArrowRight',bubbles:true,cancelable:true}));padPutCursorOn(cur);return;}
  navMove(root,dx,dy);const f=padFocusEl();if(f)padFocus(f);
}
// a freshly opened screen highlights its main choice (or its first button) so you can see where you are
function padDefault(root){const vis=e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&!e.closest('[hidden]');};
  for(const q of['[data-autofocus]','.pt.on','.rpick.on','#pgo','.ctile.on'])for(const e of root.querySelectorAll(q))if(vis(e)&&!e.disabled)return e;
  return[...root.querySelectorAll(NAVSEL)].find(e=>vis(e)&&e.tagName!=='INPUT')||null;}
// Y: unit cards on Pokémon tiles; the toggle stays on while you move between Pokémon until Y is pressed again
const CARDTILE='.rt[data-r],.pt[data-r],.ctile[data-r]';
function padCardTarget(){const f=!PAD.cur&&padFocusEl();if(f)return f.closest(CARDTILE);const p=padClient(),el=document.elementFromPoint(p.x,p.y);return el&&el.closest?el.closest(CARDTILE):null;}
function padCards(menu){
  if(!PAD.card||!menu){if(PAD.cardEl){PAD.cardEl=null;hideTip();}return;}
  const t=padCardTarget(),r=t&&+t.dataset.r;
  if(!t||!r){if(PAD.cardEl){PAD.cardEl=null;hideTip();}return;}
  const b=t.getBoundingClientRect(),moved=!PAD.cardPos||Math.abs(PAD.cardPos-b.top)>3;
  if(t!==PAD.cardEl||moved){PAD.cardEl=t;PAD.cardPos=b.top;showLineCard(r,t);}}
// LB / RB: previous / next tab of the screen's tab group (settings sections, Kit Dex generations, collection costs)
function padTab(root,d){const g=root.querySelector('[data-tabgroup]');if(!g)return false;
  const tabs=[...g.querySelectorAll('button:not(:disabled)')];if(!tabs.length)return true;
  let i=tabs.findIndex(t=>t.classList.contains('on')||t.getAttribute('aria-selected')==='true'||t.getAttribute('aria-pressed')==='true');
  const n=tabs[(i<0?0:i+d+tabs.length)%tabs.length];n.click();
  // the screen may have been redrawn: highlight the selected tab in the new one
  requestAnimationFrame(()=>{const g2=root.querySelector('[data-tabgroup]');if(!g2)return;const t=g2.querySelector('.on,[aria-selected="true"],[aria-pressed="true"]');if(t)padFocus(t);});
  return true;}
// the scrollable list to move: the one holding the highlight, else the one under the cursor, else the screen's first
function padScroller(root){const isS=e=>{if(!e||e===document.body)return false;const cs=getComputedStyle(e);return/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+4;};
  const up=e=>{for(;e&&e!==root.parentElement;e=e.parentElement)if(isS(e))return e;return null;};
  const p=padClient();return up(padFocusEl())||up(document.elementFromPoint(p.x,p.y))||[...root.querySelectorAll('*')].find(isS)||null;}
function padDraw(){PAD.el.style.left=PAD.x+'px';PAD.el.style.top=PAD.y+'px';PAD.el.classList.toggle('grab',PAD.aDown);let onCv=false;if(!PAD.cur){const p=padClient(),e=document.elementFromPoint(p.x,p.y);onCv=e===cv;}
  PAD.el.classList.toggle('snap',!PAD.cur);PAD.el.style.visibility=PAD.cur||onCv?'':'hidden';}

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
  PAD.cur=false;
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
  const back=document.querySelector('#overlay #back, #overlay #skip, #overlay #setclose, #overlay #dexclose, #overlay [data-back]');if(back){back.click();return;}
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
  if(mag>DZ){const sp=(mag-DZ)/(1-DZ),v=(420+1100*sp*sp)*(OPTS.padSens||1);PAD.cur=true;PAD.x=clamp(PAD.x+ax/mag*sp*v*dt,4,1276);PAD.y=clamp(PAD.y+ay/mag*sp*v*dt,4,716);
    if(now-PAD.lastMove>30){PAD.lastMove=now;padFire('pointermove');}}
  // right stick: zoom (up/down) and pan (left/right) the board, or a fine cursor nudge if chosen in Settings (in menus it scrolls lists, below)
  const rx=gp.axes[2]||0,ry=gp.axes[3]||0,inMenu=!!padMenu();
  if(OPTS.padRS==='fine'&&!inMenu){if(Math.hypot(rx,ry)>.3){PAD.cur=true;PAD.x=clamp(PAD.x+rx*220*(OPTS.padSens||1)*dt,4,1276);PAD.y=clamp(PAD.y+ry*220*(OPTS.padSens||1)*dt,4,716);padFire('pointermove');}}
  else if($('pause').hidden&&!document.querySelector('#overlay .screen')){if(Math.abs(ry)>.3)camZoom(Math.exp(-(ry-Math.sign(ry)*.3)*1.2*(OPTS.zoomSpd||1)*dt));if(Math.abs(rx)>.3)camPan((rx-Math.sign(rx)*.3)*260*dt,0);}
  const menu=padMenu();
  if(menu){
    if(!PAD.cur&&!padFocusEl()){const d=padDefault(menu);if(d)padFocus(d);}
    if(padRepeat(gp,BTN.UP,now))padMenuNav(menu,0,-1);if(padRepeat(gp,BTN.DOWN,now))padMenuNav(menu,0,1);
    if(padRepeat(gp,BTN.LEFT,now))padMenuNav(menu,-1,0);if(padRepeat(gp,BTN.RIGHT,now))padMenuNav(menu,1,0);
    // right stick scrolls the list; the cursor pushed against a list's top or bottom edge scrolls it as well
    if(Math.abs(ry)>.25){const s=padScroller(menu);if(s)s.scrollTop+=(ry-Math.sign(ry)*.25)*1100*dt;}
    if(Math.abs(rx)>.35){const s=padScroller(menu);if(s)s.scrollLeft+=(rx-Math.sign(rx)*.35)*900*dt;}
    if(PAD.cur){const p=padClient(),el=document.elementFromPoint(p.x,p.y);let s=el;const isS=e=>{const cs=getComputedStyle(e);return/(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+4;};
      while(s&&s!==menu&&!isS(s))s=s.parentElement;
      if(s&&s!==menu){const b=s.getBoundingClientRect(),edge=Math.min(40,b.height*.15);if(p.y<b.top+edge)s.scrollTop-=700*dt;else if(p.y>b.bottom-edge)s.scrollTop+=700*dt;}}
  }else{
  if(padRepeat(gp,BTN.UP,now))padSnap(0,-1);if(padRepeat(gp,BTN.DOWN,now))padSnap(0,1);
  if(padRepeat(gp,BTN.LEFT,now))padSnap(-1,0);if(padRepeat(gp,BTN.RIGHT,now))padSnap(1,0);}
  // A: press = pointerdown (starts drags), release = pointerup + click
  // in a menu, A presses the highlighted button directly (it may sit in a scrolled list)
  const foc=menu&&!PAD.cur&&padFocusEl();
  if(padEdge(gp,BTN.A)&&foc){PAD.aMenu=true;if(foc.tagName==='INPUT')foc.focus();else{foc.click();}}
  else if(padEdge(gp,BTN.A)){PAD.aDown=true;PAD.downEl=padFire('pointerdown');}
  if(PAD.aMenu&&!padPressed(gp,BTN.A))PAD.aMenu=false;
  if(PAD.aDown&&!padPressed(gp,BTN.A)){PAD.aDown=false;const up=padFire('pointerup');
    if(PAD.downEl&&(PAD.downEl===up||PAD.downEl.contains(up)||up.contains(PAD.downEl))&&up!==cv)padClickAt(up);PAD.downEl=null;}
  if(padEdge(gp,BTN.B))padBack();
  if(padEdge(gp,BTN.X)&&!menu&&run&&mode==='plan'&&!paused)reroll();
  // Y toggles unit cards (X too: on Nintendo-style layouts the button labelled Y reports as X)
  if((padEdge(gp,BTN.Y)||padEdge(gp,BTN.X))&&menu&&document.querySelector(CARDTILE)){if(typeof setCards==='function')setCards(!PAD.card);else{PAD.card=!PAD.card;PAD.cardEl=null;if(!PAD.card)hideTip();}if(typeof sfx==='function')sfx('select');}
  else if(padEdge(gp,BTN.Y)&&!menu&&run&&mode==='plan'&&!paused)buyXP();
  padCards(menu);
  if(padEdge(gp,BTN.START)){const s=document.querySelector('#overlay #m-continue, #overlay #m-new, #overlay #start, #overlay #again, #overlay #evgo, #overlay #pgo, #overlay #rgo, #overlay #rsave');if(s)s.click();else if(paused)closePause();else if(run&&mode==='loot')openChest();else if(run&&mode==='plan')startCombat();}
  if(padEdge(gp,BTN.SELECT)&&run&&!document.querySelector('#overlay .screen')){if(paused)closePause();else openPause();}
  if(menu&&(padEdge(gp,BTN.LB)||padEdge(gp,BTN.RB))){padTab(menu,padEdge(gp,BTN.LB)?-1:1);}
  else if(padEdge(gp,BTN.LB)&&run&&!paused)toggleShop();
  if(padEdge(gp,BTN.L3))$('speed').click();
  // RT opens the unit menu for the Pokémon under the cursor (same as right-click)
  if(padEdge(gp,BTN.RT)&&run&&!document.querySelector('#overlay .screen')){const p=padClient();const q=toInternal({clientX:p.x,clientY:p.y});const h=unitAt(q.x,q.y);if(h&&h.u)showUnitMenu(h.u,h);}
  if(padEdge(gp,BTN.R3))camReset();
  if(!menu&&padEdge(gp,BTN.RB)&&run&&(mode==='plan'||mode==='loot')){const r=padStageRect(),p=padClient();const q=toInternal({clientX:p.x,clientY:p.y});const o=ownedAt(q.x,q.y);if(o)sell(o.u);}
  PAD.prev=gp.buttons.map(b=>b.pressed);
  padDraw();padHover();
}
// while the loading screen is up: notice the controller (any button or stick) without acting on anything yet
function padWake(){const gp=navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean).find(p=>p.connected&&p.buttons.length>=10):null;if(!gp)return;
  if(gp.buttons.some(b=>b.pressed)||gp.axes.some(a=>Math.abs(a)>.4)){padShow(true);LOAD.pad();}PAD.prev=gp.buttons.map(b=>b.pressed);}
function padInit(){
  PAD.el=document.createElement('div');PAD.el.id='padcursor';PAD.el.hidden=true;PAD.el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2l15 9-6.5 1.5L15 20l-3 1.4-3.3-7.4L3 18z" fill="#fff" stroke="#24303d" stroke-width="2" stroke-linejoin="round"/></svg>';
  stage.appendChild(PAD.el);
  // played with a controller last time: start in controller mode (moving the mouse switches back)
  try{if(localStorage.getItem('pokerun-input')==='pad')padShow(true);}catch(e){}
  addEventListener('gamepadconnected',()=>padShow(true));
  addEventListener('mousemove',e=>{if(PAD.on&&e.isTrusted)padShow(false);});
  addEventListener('touchstart',()=>{if(PAD.on)padShow(false);},{passive:true});
  let last=performance.now();
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;try{if(window.LOAD&&!LOAD.gone)padWake();else padPoll(dt);}catch(e){console.error(e);}requestAnimationFrame(loop);};
  requestAnimationFrame(loop);
}
padInit();
