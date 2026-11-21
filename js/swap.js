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
let swapSel=0;
function showSwapShop(msg){
  if(!run||mode!=='plan')return;hideTip();
  const L=swapList(),cc=swapCost('comp'),ci=swapCost('craft');if(swapSel>=L.length)swapSel=0;
  const col=it=>isComp(it)?'#9aa3ad':'#e0a526';
  const slot=(it,sub)=>`<div class="kic${msg&&msg.got&&it===msg.got?' pop':''}" style="--tc:${col(it)}"><img src="${iconOf(itemDef(it).id)}" alt=""></div><div>${esc(itemName(it))}</div><small>${sub}</small>`;
  const cur=L[swapSel],kind=cur&&swapKind(cur.it),price=cur?(kind==='comp'?cc:ci):0;
  ov.innerHTML=`<div class="scrim" id="sw-scrim"></div><div class="screen kscene swap2">
    ${keeperStall('croagunk')}
    <div class="ks-head"><div><h1 class="h1">Croagunk's Swap Shop</h1><p>Trade an item for a random one. A component becomes another component; a completed item becomes one that shares a component. Mutations and enhancers stay.</p></div><div class="ks-money"><img src="${iconOf('nugget')}" alt="">₽${run.gold}</div></div>
    <div class="ks-main">${L.length?`
      <div class="swpot" id="swpot"><div class="swslot">${slot(cur.it,`${kind==='comp'?'Component':'Completed'} · ${price?'₽'+price:'Free'}`)}</div><div class="swarrow">➜</div>
        <div class="swslot" id="swout">${msg&&msg.got?slot(msg.got,isComp(msg.got)?'Component':'Completed'):'<div class="q">?</div><small>Random result</small>'}</div></div>
      <div class="swbag"><h3>Your items</h3><div class="switems">${L.map((e,n)=>`<button class="swit${n===swapSel?' on':''}" data-sw="${n}" title="${esc(itemName(e.it))}${e.where==='unit'?' (held by '+esc(D[e.u.dex].n)+')':''}"><img src="${iconOf(itemDef(e.it).id)}" alt="${esc(itemName(e.it))}">${e.where==='unit'?`<img class="held" src="${por(e.u.dex)}" alt="">`:''}</button>`).join('')}</div>
      <div class="swprices"><span>Component ₽${cc}</span><span>Completed ₽${ci}</span><span>${run.freeSwap?'Next swap free (Rocket)':'Prices rise each act'}</span></div></div>`
      :'<p class="kp-empty">You have no components or completed items to swap.</p>'}</div>
    ${keeperTalk('croagunk',`<button class="btn go" id="swgo" ${!cur?'disabled':''}>Swap!${cur?` ₽${price}`:''}</button><button class="btn" id="swclose" data-back>Close</button>`)}</div>`;
  const say=keeperStart(ov.querySelector('.kscene'),'croagunk');
  say(msg?msg.t:"Kekeke! Bring me something and I'll swap it. What you get is up to luck!",msg?msg.e:'Normal');
  const close=()=>{ov.innerHTML='';renderUI();};$('swclose').onclick=close;$('sw-scrim').onclick=close;
  ov.querySelectorAll('[data-sw]').forEach(b=>{b.onclick=()=>{swapSel=+b.dataset.sw;const e=L[swapSel];showSwapShop({t:`Kekeke... ${itemName(e.it)}, is it? That'll be ₽${swapKind(e.it)==='comp'?cc:ci}.`,e:'Happy',focus:'sw'});};
    b.onpointermove=ev=>showItemTip(L[+b.dataset.sw].it,ev);b.onpointerleave=hideTip;});
  if($('swgo'))$('swgo').onclick=()=>{const e=L[swapSel];if(!e)return;const before=itemName(e.it);
    if(run.gold<price&&!run.freeSwap){sfx('error');say('Kekeke... no money, no swap!','Sad');return;}
    const pot=$('swpot');pot.classList.remove('shake');void pot.offsetWidth;pot.classList.add('shake');say('Kekekeke...','Inspired');sfx('coin',100);$('swgo').disabled=true;
    setTimeout(()=>{if(!$('swpot'))return;const nu=swapDo(e);if(!nu){showSwapShop({t:'Kekeke... no money, no swap!',e:'Sad'});return;}sfx('treasure',300);renderUI();
      showSwapShop({t:`Kekeke! Your ${before} is now ${itemName(nu)}!`,e:'Joyous',got:nu,focus:'go'});},650);};
  const f=msg&&msg.focus==='sw'?ov.querySelector('.swit.on'):$('swgo')&&!$('swgo').disabled?$('swgo'):$('swclose');if(f)f.focus({preventScroll:true});
}
