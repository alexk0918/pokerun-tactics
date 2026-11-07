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
function renderGimBtn(){const b=$('gimbtn'),L=gimList();if(!run||!L.length){b.hidden=true;return;}b.hidden=false;
  b.innerHTML=L.map(g=>`<img src="${iconOf(GIMMICKS[g].key)}" alt="">`).join('');b.title=`${L.map(g=>GIMMICKS[g].n).join(', ')}: choose who uses them (opens the menu)`;}
$('gimbtn').onclick=()=>openPause();

/* ---------- pause menu ---------- */
function openPause(){if(!run||evoOpen)return;if(ov.innerHTML.trim())return toast('Finish this choice first.');
  paused=true;hideTip();drag=null;$('pause').hidden=false;
  $('psub').textContent=`${MODE.gen?MODE.label+' · '+MODE.region:'National Dex'} · ${actLabel()} · Floor ${run.floor} / ${FLOORS}`;
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
    {k:'bagOpen',n:'Bag while planning',v:[1,0],l:['Shown','Hidden']},
    {k:'unsprited',n:'Enable non-sprited Pokémon',v:[0,1],l:['Off','On'],d:'Adds the evolution lines that don\'t have PMD sprites yet (they fight as round portrait tokens). Applies to new runs.'}]},
  {id:'display',n:'Display',rows:[
    {k:'autoZoom',n:'Fit the board to the screen',v:[1,0],l:['On','Off'],d:'Zooms in on the field when the shop is hidden and during battles.'},
    {k:'zoomSpd',n:'Zoom speed',v:[.6,1,1.6],l:['Slow','Normal','Fast']},
    {k:'fx',n:'Move effects',v:[2,1],l:['Full','Reduced'],d:'Reduced plays fewer particles at once and drops status sparkles.'},
    {k:'rays',n:'Light rays',v:[1,0],l:['On','Off']},
    {k:'shake',n:'Screen shake on legendary moves',v:[1,0],l:['On','Off']}]},
  {id:'audio',n:'Audio',note:'Music and sound effects are from Pokémon Mystery Dungeon: Explorers of Sky and Rescue Team (see Credits on the title screen).',rows:[
    {k:'masterVol',n:'Master volume',slider:1,on:()=>auVolumes()},
    {k:'musVol',n:'Music',slider:1,on:()=>auVolumes()},
    {k:'sfxVol',n:'Battle sounds',d:'Moves, hits and knockouts',slider:1,on:()=>{auVolumes();sfx('hit',0);}},
    {k:'uiVol',n:'Interface sounds',d:'Shop, menus, level-ups and fanfares',slider:1,on:()=>{auVolumes();sfx('select',0);}}]},
  {id:'gamepad',n:'Gamepad',rows:[
    {k:'padSens',n:'Cursor speed',v:[.5,.75,1,1.25,1.5,2],l:['50%','75%','100%','125%','150%','200%']},
    {k:'padDZ',n:'Stick dead zone',v:[.1,.18,.26],l:['Small','Normal','Large']},
    {k:'padRS',n:'Right stick',v:['zoom','fine'],l:['Zoom and pan','Fine cursor']}],
   info:[['Left stick','Move the cursor'],['D-pad','Jump between buttons and Pokémon'],['A','Select · press on a Pokémon or item to pick it up, again to place it'],['B','Back · put down what you are carrying'],['X','Reroll the shop'],['Y','Level up'],['LB','Hide or show the shop'],['RB','Release the Pokémon under the cursor'],['RT','Open the menu of the Pokémon under the cursor (items, details, Mega toggle)'],['Right stick','Zoom (up/down) and pan (left/right)'],['R3','Reset the zoom'],['L3','Battle speed'],['Start','Battle · open the chest · confirm'],['Select','Menu']]},
  {id:'controls',n:'Controls',rows:[],info:[['Click','Select, buy, open the chest'],['Click, then click','Pick up a Pokémon or item, then place it (dragging also works)'],['Drag empty ground','Pan the board'],['Right-click a Pokémon','Its menu: items, details, Mega toggle'],['Mouse wheel','Zoom the board'],['+ / − / 0','Zoom in, out, reset'],['Space','Battle · open the chest'],['D','Reroll'],['F','Level up'],['Tab','Hide or show the shop'],['B','Hide or show the bag'],['Esc','Menu']]},
  {id:'data',n:'Data',rows:[],acts:[['o-del','Delete saved run'],['o-dex','Forget Kit Dex discoveries'],['o-reset','Reset all settings']]},
];
let setTab='general',setFrom='title';
function optIdx(r){const i=r.v.indexOf(OPTS[r.k]);return i<0?0:i;}
function showSettings(from,tab){
  setFrom=from||setFrom;if(tab)setTab=tab;const T=SET_TABS.find(t=>t.id===setTab)||SET_TABS[0];
  // slider rows (volumes) hold a 0–1 value; the others step through a list of values
  const pctOf=r=>Math.round((OPTS[r.k]??.5)*100)+'%';
  const rows=T.rows.map((r,i)=>{const k=r.slider?0:optIdx(r);return`<div class="srow${r.slider?' slide':''}" data-r="${i}"><div><span>${r.n}</span>${r.d?`<small>${r.d}</small>`:''}</div>
    <div class="sval"><button class="sarr" data-r="${i}" data-d="-1" aria-label="Lower ${esc(r.n)}">‹</button>${r.slider?`<input type="range" min="0" max="100" step="5" value="${Math.round((OPTS[r.k]??.5)*100)}" data-r="${i}" aria-label="${esc(r.n)}"><b>${pctOf(r)}</b>`:`<b>${r.l[k]}</b>`}<button class="sarr" data-r="${i}" data-d="1" aria-label="Raise ${esc(r.n)}">›</button></div></div>`;}).join('');
  const info=T.info?`<div class="sinfo">${T.info.map(([a,b])=>`<div><kbd>${a}</kbd><span>${b}</span></div>`).join('')}</div>`:'';
  const acts=T.acts?T.acts.filter(([id])=>id!=='o-del'||readSave()).map(([id,n])=>`<button class="mi opt danger" id="${id}"><span>${n}</span><b>›</b></button>`).join(''):'';
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="win setwin">
    <div class="stabs" role="tablist">${SET_TABS.map(t=>`<button class="stab" role="tab" data-t="${t.id}" aria-selected="${t.id===setTab}">${t.n}</button>`).join('')}</div>
    <div class="sbody">${T.note?`<p class="snote">${T.note}</p>`:''}${rows}${acts}${info}</div>
    <div class="sfoot"><span class="lbl">‹ › or ← → change a value · settings save automatically</span><button class="btn" id="setclose">Back</button></div></div></div>`;
  ov.querySelectorAll('.stab').forEach(b=>b.onclick=()=>showSettings(null,b.dataset.t));
  const setSlide=(i,v)=>{const r=T.rows[i];OPTS[r.k]=Math.round(clamp(v,0,1)*20)/20;saveOpts();if(r.on)r.on(OPTS[r.k]);
    const row=ov.querySelector(`.srow[data-r="${i}"]`);if(row){row.querySelector('b').textContent=pctOf(r);row.querySelector('input').value=Math.round(OPTS[r.k]*100);}};
  const bump=(i,d)=>{const r=T.rows[i];if(r.slider)return setSlide(i,(OPTS[r.k]??.5)+d*.05);const k=(optIdx(r)+d+r.v.length)%r.v.length;OPTS[r.k]=r.v[k];saveOpts();if(r.on)r.on(r.v[k]);panelKey='';CAM.av=null;
    const row=ov.querySelector(`.srow[data-r="${i}"] b`);if(row)row.textContent=r.l[k];};
  ov.querySelectorAll('.srow input[type=range]').forEach(inp=>{inp.oninput=()=>setSlide(+inp.dataset.r,inp.value/100);inp.onclick=e=>e.stopPropagation();});
  ov.querySelectorAll('.sarr').forEach(b=>b.onclick=e=>{e.stopPropagation();bump(+b.dataset.r,+b.dataset.d);});
  ov.querySelectorAll('.srow').forEach(rw=>{rw.tabIndex=0;rw.onclick=()=>{if(!T.rows[+rw.dataset.r].slider)bump(+rw.dataset.r,1);};rw.onkeydown=e=>{if(e.key==='ArrowLeft'){e.preventDefault();bump(+rw.dataset.r,-1);}if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();bump(+rw.dataset.r,1);}};});
  const sure=(id,fn)=>{const b=$(id);if(!b)return;b.onclick=()=>{if(b.dataset.sure){fn();showSettings();toast('Done.');}else{b.dataset.sure=1;b.querySelector('span').textContent='Press again to confirm';}};};
  sure('o-del',()=>clearSave());
  sure('o-dex',()=>{DEXSEEN.clear();try{localStorage.removeItem(DEXKEY);}catch(e){}});
  sure('o-reset',()=>{const keep={shopOpen:OPTS.shopOpen,bagOpen:OPTS.bagOpen};Object.assign(OPTS,{speed:1,dmg:1,autoHide:1,autoZoom:1,zoomSpd:1,fx:2,rays:1,padSens:1,padRS:'zoom',padDZ:.18,shake:1,unsprited:0,masterVol:.8,musVol:.5,sfxVol:.6,uiVol:.7},keep);auVolumes();saveOpts();speed=1;});
  $('setclose').onclick=closeSettings;
  const f=ov.querySelector(`.stab[aria-selected="true"]`);if(f)f.focus();
}
function closeSettings(){if(setFrom==='game'){ov.innerHTML='';if(paused)$('pause').hidden=false;}else showTitle();}
function showOptions(){showSettings('title','general');}

/* ---------- keyboard menu navigation (arrow keys move between buttons in menus; the board stays mouse/controller) ---------- */
const NAVSEL='button:not(:disabled):not([hidden]),.pick,.mode,.srow,.stab,[tabindex="0"]';
function menuRoot(){const sc=ov.querySelector('.screen');if(sc&&sc.offsetParent!==null)return ov;const pz=$('pause');if(pz&&!pz.hidden)return pz;return null;}
function navMove(root,dx,dy){
  const els=[...root.querySelectorAll(NAVSEL)].filter(el=>{const b=el.getBoundingClientRect();return b.width>0&&b.height>0&&!el.closest('[hidden]');});if(!els.length)return;
  const cur=document.activeElement&&root.contains(document.activeElement)?document.activeElement:null;
  if(!cur){els[0].focus();return;}
  const c=cur.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2;let best=null,bs=1e9;
  for(const el of els){if(el===cur||el.contains(cur)||cur.contains(el))continue;const b=el.getBoundingClientRect(),vx=b.left+b.width/2-cx,vy=b.top+b.height/2-cy,d=Math.hypot(vx,vy);if(d<2)continue;
    const along=(vx*dx+vy*dy)/d;if(along<.4)continue;const sc=d+Math.abs(vx*dy-vy*dx)*2;if(sc<bs){bs=sc;best=el;}}
  if(best){best.focus();best.scrollIntoView&&best.scrollIntoView({block:'nearest'});}}
addEventListener('keydown',e=>{
  if(e.defaultPrevented)return;const ae=document.activeElement;if(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))return;const root=menuRoot();
  const dir={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
  if(root&&dir){
    // settings rows use left/right to change their value
    if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&document.activeElement&&document.activeElement.classList.contains('srow'))return;
    e.preventDefault();navMove(root,dir[0],dir[1]);return;}
  if(root&&(e.key==='Escape'||e.key==='Backspace')&&!run){const b=ov.querySelector('#back,#setclose,#dexclose,#skip');if(b){e.preventDefault();b.click();}}
});

/* ---------- unit menu (right-click a Pokémon, or RT on a controller) ---------- */
let umWasPaused=false;
function showUnitMenu(u,h={}){
  if(!run||ov.innerHTML.trim()||evoOpen)return;
  const owned=allOwned().includes(u);hideTip();
  showTip(u,{clientX:-9999,clientY:-9999},h);$('tip').querySelectorAll('.items').forEach(n=>n.remove());const details=$('tip').innerHTML;hideTip();
  const slots=[0,1,2].map(i=>{const it=u.items[i];return it?`<div class="umslot t-${{epic:'epic',gear:'gear',enh:'enh'}[itemTier(it)]||'common'}" data-uitem="${i}"><img src="${iconOf(itemDef(it).id)}" alt=""><span>${esc(itemName(it))}</span></div>`:`<div class="umslot empty"><span>Empty slot</span></div>`;}).join('');
  const gims=[['stone','Mega Stone','stone'],['crystal','Z-Crystal','z'],['shard','Tera Shard','shard']].filter(([k])=>u[k]).map(([k,n,p])=>{const it={k:`g:${p}:${u[k]}`,mut:[]};return`<div class="umslot gim" data-ugim="${p}:${u[k]}"><img src="${iconOf(itemDef(it).id)}" alt=""><span>${esc(itemDef(it).n)}</span></div>`;}).join('')+(u.formItem?(()=>{const it={k:'form:'+u.formItem,mut:[]};return`<div class="umslot gim" data-uform="${u.formItem}"><img src="${iconOf(itemDef(it).id)}" alt=""><span>${esc(itemDef(it).n)}</span></div>`;})():'')+(u.mush?`<div class="umslot gim"><span>Dynamax Level ${u.mush}${u.gmax?' · Gigantamax':''}</span></div>`:'');
  const mg=u.stone&&gimOn('mega')&&megaFor(u.dex,u.stone);
  const acts=[];
  if(owned&&mg)acts.push(`<button class="btn" id="um-mega">${u.megaOff?'Mega Evolution: Off':'Mega Evolution: On'}</button>`);
  if(owned&&u.root===479&&typeof showRotomCatalog==='function'&&mode==='plan')acts.push(`<button class="btn" id="um-rotom">Rotom Catalog</button>`);
  if(owned&&mode==='plan'&&typeof fusionOptions==='function'){
    for(const o of fusionOptions(u))acts.push(o.partner?`<button class="btn" data-fuse="${o.fid}">Fuse with ${esc(nameOf(o.partner))} → ${esc(D[o.fid].n)}</button>`:`<button class="btn" disabled>${esc(D[o.fid].n)}: needs ${esc(D[o.pd].n)}</button>`);
    if(u.fuse)acts.push(`<button class="btn" id="um-unfuse">Separate ${esc(nameOf(u.fuse.p))}</button>`);
    if(FORME_BASES[baseOf(u.dex)])acts.push(`<button class="btn" id="um-forme">Change forme (Meteorite)</button>`);}
  umWasPaused=paused;if(mode==='combat')paused=true;
  ov.innerHTML=`<div class="scrim" id="um-scrim"></div><div class="screen"><div class="win umwin"><div class="umdetails">${details}</div>
    <div class="umside"><div class="lbl">Held items</div>${slots}${gims?`<div class="lbl" style="margin-top:8px">Gimmick</div>${gims}`:''}
    <div class="umacts">${acts.join('')}<button class="btn" id="back">Close</button></div></div></div></div>`;
  ov.querySelector('.umwin').addEventListener('pointermove',e=>{const s=e.target.closest('[data-uitem]');const g=e.target.closest('[data-ugim]');
    if(s){showItemTip(u.items[+s.dataset.uitem],e);return;}if(g){const[p,v]=g.dataset.ugim.split(':');showItemTip({k:`g:${p}:${v}`,mut:[]},e);return;}const fm=e.target.closest('[data-uform]');if(fm){showItemTip({k:'form:'+fm.dataset.uform,mut:[]},e);return;}hideTip();});
  const close=()=>{hideTip();ov.innerHTML='';paused=umWasPaused;renderUI();};
  $('back').onclick=close;$('um-scrim').onclick=close;
  if($('um-mega'))$('um-mega').onclick=()=>{u.megaOff=!u.megaOff;close();if(!u.megaOff&&!SIM.on){const p=locate(u);if(p){toast(`${nameOf(u)} Mega Evolved!`);['#ff5d7a','#ffd34d','#7dff7a','#5ab8ff','#c98bff'].forEach(col=>burst(p.x,p.y-12,col,10,1.4));}}else toast(`${nameOf(u)} will stay in its normal form.`);};
  ov.querySelectorAll('[data-fuse]').forEach(b=>b.onclick=()=>{const o=fusionOptions(u).find(x=>x.fid===+b.dataset.fuse);ov.innerHTML='';paused=umWasPaused;if(o)fuse(u,o);renderUI();});
  if($('um-unfuse'))$('um-unfuse').onclick=()=>{ov.innerHTML='';paused=umWasPaused;unfuse(u);renderUI();};
  if($('um-forme'))$('um-forme').onclick=()=>{ov.innerHTML='';paused=umWasPaused;showFormePick(u);};
  if($('um-rotom'))$('um-rotom').onclick=()=>{ov.innerHTML='';paused=umWasPaused;showRotomCatalog(u);};
  $('back').focus();
}
