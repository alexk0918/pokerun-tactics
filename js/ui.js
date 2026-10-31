"use strict";
/* PokéRun Tactics — small-screen UI: collapsible shop and bag, pause menu, settings. */

/* ---------- collapsible shop and bag ---------- */
let shopPeek=false,bagPeek=false,panelKey='';
const inFight=()=>mode==='combat'||mode==='result';
function shopIsOpen(){if(mode==='carousel')return false;return inFight()&&OPTS.autoHide?shopPeek:!!OPTS.shopOpen;}
function bagIsOpen(){return inFight()&&OPTS.autoHide?bagPeek:!!OPTS.bagOpen;}
function applyPanels(){
  if(!run)return;if(!inFight())shopPeek=bagPeek=false;
  const so=shopIsOpen(),bo=bagIsOpen(),key=so+'|'+bo;if(key===panelKey)return;panelKey=key;
  const sh=$('shop');sh.classList.toggle('mini',!so);$('shoptog').setAttribute('aria-expanded',so);$('shoptogl').textContent=so?'Hide shop':'Show shop';
  const bg=$('bag');bg.classList.toggle('closed',!bo);$('bagtog').setAttribute('aria-expanded',bo);
  CAM.avT=0;CAM.av=null;
}
function toggleShop(){if(inFight()&&OPTS.autoHide)shopPeek=!shopIsOpen();else{OPTS.shopOpen=OPTS.shopOpen?0:1;saveOpts();}applyPanels();}
function toggleBag(){if(inFight()&&OPTS.autoHide)bagPeek=!bagIsOpen();else{OPTS.bagOpen=OPTS.bagOpen?0:1;saveOpts();}applyPanels();}
$('shoptog').onclick=toggleShop;$('bagtog').onclick=toggleBag;
$('minicards').addEventListener('click',e=>{if(e.target.closest('.mcard[data-i]')){if(inFight()&&OPTS.autoHide)shopPeek=true;else{OPTS.shopOpen=1;saveOpts();}applyPanels();}});
$('minicards').addEventListener('pointermove',e=>{const c=e.target.closest('.mcard[data-i]');const r=c?run.shop[+c.dataset.i]:null;if(r)showTip(mkUnit(r),e);else hideTip();});
$('minicards').addEventListener('pointerleave',hideTip);
(function panelLoop(){try{applyPanels();}catch(e){}requestAnimationFrame(panelLoop);})();

/* ---------- gimmick shortcut on the HUD ---------- */
function renderGimBtn(){const b=$('gimbtn');if(!run||!run.gimmick){b.hidden=true;return;}const GM=GIMMICKS[run.gimmick];
  const tgt=allOwned().find(u=>u.uid===run.gimTarget&&gimEligible(u));b.hidden=false;
  b.innerHTML=`<img src="${iconOf(GM.key)}" alt="">${tgt?`<img src="${por(shownDex(tgt))}" alt="">`:'Pick'}`;b.title=`${GM.n}: ${tgt?nameOf(tgt)+' will use it':'choose who uses it'} (opens the menu)`;}
$('gimbtn').onclick=()=>openPause();

/* ---------- pause menu ---------- */
function openPause(){if(!run||evoOpen)return;if(ov.innerHTML.trim())return toast('Finish this choice first.');
  paused=true;hideTip();drag=null;$('pause').hidden=false;
  $('psub').textContent=`${MODE.gen?MODE.label+' · '+MODE.region:'National Dex'} · Floor ${run.floor} / ${FLOORS}`;
  renderUI();$('p-resume').focus();}
function closePause(){paused=false;const p=$('pause');if(p)p.hidden=true;}
$('menubtn').onclick=()=>{if(paused)closePause();else openPause();};
$('p-resume').onclick=closePause;$('pscrim').onclick=closePause;$('p-run').onclick=()=>{};
$('p-set').onclick=()=>{$('pause').hidden=true;showSettings('game');};
$('p-quit').onclick=()=>{const b=$('p-quit');if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Press again to quit';setTimeout(()=>{b.dataset.sure='';b.textContent='Quit to title';},2500);return;}
  b.dataset.sure='';b.textContent='Quit to title';closePause();if(mode==='combat'||mode==='result'){units=[];proj=[];}saveRun();setTimeout(showTitle,160);};
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!run)return;if(cancelCarry()){e.preventDefault();return;}if(ov.innerHTML.trim()&&!paused)return;if($('setclose')){$('setclose').click();return;}if($('dexclose')&&paused){closeKitDex();return;}
    e.preventDefault();if(paused)closePause();else openPause();return;}
  if(paused||!run||evoOpen||ov.innerHTML.trim())return;
  if(e.key==='Tab'){e.preventDefault();toggleShop();}
  else if(e.key==='b'||e.key==='B')toggleBag();
  else if(e.key==='+'||e.key==='=')camZoom(1.15);else if(e.key==='-'||e.key==='_')camZoom(1/1.15);else if(e.key==='0')camReset();
});

/* ---------- settings (sections, PokéRogue style) ---------- */
const SET_TABS=[
  {id:'general',n:'General',rows:[
    {k:'speed',n:'Battle speed',v:[1,2],l:['Normal','Fast'],on:v=>{speed=v;$('speed').setAttribute('aria-pressed',v===2);}},
    {k:'dmg',n:'Damage numbers',v:[1,0],l:['On','Off']},
    {k:'autoHide',n:'Tuck the shop and bag away in battle',v:[1,0],l:['On','Off']},
    {k:'shopOpen',n:'Shop while planning',v:[1,0],l:['Shown','Hidden']},
    {k:'bagOpen',n:'Bag while planning',v:[1,0],l:['Shown','Hidden']}]},
  {id:'display',n:'Display',rows:[
    {k:'autoZoom',n:'Fit the board to the screen',v:[1,0],l:['On','Off'],d:'Zooms in on the field when the shop is hidden and during battles.'},
    {k:'zoomSpd',n:'Zoom speed',v:[.6,1,1.6],l:['Slow','Normal','Fast']},
    {k:'fx',n:'Move effects',v:[2,1],l:['Full','Reduced'],d:'Reduced plays fewer particles at once and drops status sparkles.'},
    {k:'rays',n:'Light rays',v:[1,0],l:['On','Off']}]},
  {id:'audio',n:'Audio',rows:[],note:'PokéRun has no music or sound effects yet. Volume settings will appear here when it does.'},
  {id:'gamepad',n:'Gamepad',rows:[
    {k:'padSens',n:'Cursor speed',v:[.5,.75,1,1.25,1.5,2],l:['50%','75%','100%','125%','150%','200%']},
    {k:'padDZ',n:'Stick dead zone',v:[.1,.18,.26],l:['Small','Normal','Large']},
    {k:'padRS',n:'Right stick',v:['zoom','fine'],l:['Zoom and pan','Fine cursor']}],
   info:[['Left stick','Move the cursor'],['D-pad','Jump between buttons and Pokémon'],['A','Select · press on a Pokémon or item to pick it up, again to place it'],['B','Back · put down what you are carrying'],['X','Reroll the shop'],['Y','Level up'],['LB','Hide or show the shop'],['RB','Release the Pokémon under the cursor'],['Right stick','Zoom (up/down) and pan (left/right)'],['R3','Reset the zoom'],['L3','Battle speed'],['Start','Battle · open the chest · confirm'],['Select','Menu']]},
  {id:'controls',n:'Controls',rows:[],info:[['Click','Select, buy, open the chest'],['Click, then click','Pick up a Pokémon or item, then place it (dragging also works)'],['Right-drag','Pan the board'],['Mouse wheel','Zoom the board'],['+ / − / 0','Zoom in, out, reset'],['Space','Battle · open the chest'],['D','Reroll'],['F','Level up'],['Tab','Hide or show the shop'],['B','Hide or show the bag'],['Esc','Menu']]},
  {id:'data',n:'Data',rows:[],acts:[['o-del','Delete saved run'],['o-dex','Forget Kit Dex discoveries'],['o-reset','Reset all settings']]},
];
let setTab='general',setFrom='title';
function optIdx(r){const i=r.v.indexOf(OPTS[r.k]);return i<0?0:i;}
function showSettings(from,tab){
  setFrom=from||setFrom;if(tab)setTab=tab;const T=SET_TABS.find(t=>t.id===setTab)||SET_TABS[0];
  const rows=T.rows.map((r,i)=>{const k=optIdx(r);return`<div class="srow" data-r="${i}"><div><span>${r.n}</span>${r.d?`<small>${r.d}</small>`:''}</div>
    <div class="sval"><button class="sarr" data-r="${i}" data-d="-1" aria-label="Previous value for ${esc(r.n)}">‹</button><b>${r.l[k]}</b><button class="sarr" data-r="${i}" data-d="1" aria-label="Next value for ${esc(r.n)}">›</button></div></div>`;}).join('');
  const info=T.info?`<div class="sinfo">${T.info.map(([a,b])=>`<div><kbd>${a}</kbd><span>${b}</span></div>`).join('')}</div>`:'';
  const acts=T.acts?T.acts.filter(([id])=>id!=='o-del'||readSave()).map(([id,n])=>`<button class="mi opt danger" id="${id}"><span>${n}</span><b>›</b></button>`).join(''):'';
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="win setwin">
    <div class="stabs" role="tablist">${SET_TABS.map(t=>`<button class="stab" role="tab" data-t="${t.id}" aria-selected="${t.id===setTab}">${t.n}</button>`).join('')}</div>
    <div class="sbody">${T.note?`<p class="snote">${T.note}</p>`:''}${rows}${acts}${info}</div>
    <div class="sfoot"><span class="lbl">‹ › or ← → change a value · settings save automatically</span><button class="btn" id="setclose">Back</button></div></div></div>`;
  ov.querySelectorAll('.stab').forEach(b=>b.onclick=()=>showSettings(null,b.dataset.t));
  const bump=(i,d)=>{const r=T.rows[i];const k=(optIdx(r)+d+r.v.length)%r.v.length;OPTS[r.k]=r.v[k];saveOpts();if(r.on)r.on(r.v[k]);panelKey='';CAM.av=null;
    const row=ov.querySelector(`.srow[data-r="${i}"] b`);if(row)row.textContent=r.l[k];};
  ov.querySelectorAll('.sarr').forEach(b=>b.onclick=e=>{e.stopPropagation();bump(+b.dataset.r,+b.dataset.d);});
  ov.querySelectorAll('.srow').forEach(rw=>{rw.tabIndex=0;rw.onclick=()=>bump(+rw.dataset.r,1);rw.onkeydown=e=>{if(e.key==='ArrowLeft'){e.preventDefault();bump(+rw.dataset.r,-1);}if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();bump(+rw.dataset.r,1);}};});
  const sure=(id,fn)=>{const b=$(id);if(!b)return;b.onclick=()=>{if(b.dataset.sure){fn();showSettings();toast('Done.');}else{b.dataset.sure=1;b.querySelector('span').textContent='Press again to confirm';}};};
  sure('o-del',()=>clearSave());
  sure('o-dex',()=>{DEXSEEN.clear();try{localStorage.removeItem(DEXKEY);}catch(e){}});
  sure('o-reset',()=>{const keep={shopOpen:OPTS.shopOpen,bagOpen:OPTS.bagOpen};Object.assign(OPTS,{speed:1,dmg:1,autoHide:1,autoZoom:1,zoomSpd:1,fx:2,rays:1,padSens:1,padRS:'zoom',padDZ:.18},keep);saveOpts();speed=1;});
  $('setclose').onclick=closeSettings;
  const f=ov.querySelector(`.stab[aria-selected="true"]`);if(f)f.focus();
}
function closeSettings(){if(setFrom==='game'){ov.innerHTML='';if(paused)$('pause').hidden=false;}else showTitle();}
function showOptions(){showSettings('title','general');}
