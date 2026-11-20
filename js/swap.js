"use strict";
/* PokéRun Tactics — Croagunk's Swap Shop (from Explorers of Sky).
   Trade an item for a random different one:
   - a component becomes a different random component;
   - a completed item becomes a different completed item that shares one of its two components.
   Mutations and enhancers stay on the item. Prices rise each act. Open it from the button under the bag. */
const SWAP_DEX=453;
const swapCost=kind=>{if(run&&run.freeSwap)return 0;const a=actOf();return kind==='comp'?2+a:4+2*a;};
const swapKind=it=>isComp(it)?'comp':isCraft(it)&&!isEnh(it)?'craft':null;
function swapResult(it){
  if(isComp(it)){const o=CORDER.split('').filter(c=>c!==it.k);return{...it,k:pick(o)};}
  const [a,b]=it.k.split(''),keys=Object.keys(CRAFT).filter(k=>k!==it.k&&(k.includes(a)||k.includes(b)));
  return{...it,k:pick(keys)};}
// every item you could swap: the bag first, then what your Pokémon hold
function swapList(){const out=[];run.bag.forEach((it,i)=>{if(swapKind(it))out.push({it,where:'bag',i});});
  for(const u of allOwned())(u.items||[]).forEach((it,i)=>{if(swapKind(it))out.push({it,where:'unit',u,i});});return out;}
function swapDo(e){const kind=swapKind(e.it),c=swapCost(kind);if(run.gold<c){sfx('error');return false;}
  if(run.freeSwap)run.freeSwap--;else{run.gold-=c;perkRun('spent',c,'swap');}const nu=swapResult(e.it);
  if(e.where==='bag')run.bag[e.i]=nu;else{e.u.items[e.i]=nu;if(typeof combine==='function')combine();}
  run.swaps=(run.swaps||0)+1;return nu;}
function showSwapShop(msg){
  if(!run||mode!=='plan')return;hideTip();
  const L=swapList(),cc=swapCost('comp'),ci=swapCost('craft');
  const row=(e,n)=>{const k=swapKind(e.it),c=k==='comp'?cc:ci;return`<button class="setopt swapopt" data-sw="${n}" ${run.gold<c?'disabled':''}><img src="${iconOf(itemDef(e.it).id)}" alt=""><b>${esc(itemName(e.it))}</b><span>${e.where==='bag'?'In your bag':'Held by '+esc(D[e.u.dex].n)} · ${k==='comp'?'becomes a random component':'becomes another item sharing a component'}</span><em>₽${c}</em></button>`;};
  const body=`<div class="keeper"><img class="kpor" src="assets/${pad(SWAP_DEX)}/portrait.png" alt="Croagunk"><div class="kbubble">${msg||'Kekeke! Bring me something and I\'ll swap it for something else. What you get is up to luck!'}</div></div>
    <div class="swapprices"><span>Component ₽${cc}</span><span>Completed item ₽${ci}</span><span class="muted">${run.freeSwap?'Next trade is free (Rocket)':'Prices go up each act'}</span></div>
    <div class="setgrid">${L.length?L.map(row).join(''):'<p class="muted">You have no components or completed items to swap.</p>'}</div>`;
  setMenu("Croagunk's Swap Shop",'Trade an item for a random one. Mutations and enhancers stay on it.',body,{cls:'swapwin'});
  ov.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.sw];const before=itemName(e.it);const nu=swapDo(e);if(!nu)return;
    sfx('coin',100);setTimeout(()=>sfx('treasure',300),180);renderUI();showSwapShop(`Kekeke! Your ${esc(before)} is now <b>${esc(itemName(nu))}</b>!`);
    const nb=ov.querySelector(`[data-sw="${b.dataset.sw}"]`);if(nb)nb.focus();});}
