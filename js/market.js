"use strict";
/* PokéRun Tactics — the Market: investments that work with any team (inspired by Currency Wars' economy, not copied).
   League Bonds  lock Pokédollars away for 3 floors and pay back +40%. Locked money earns no interest,
                 but bonds aren't capped like interest is, so they're how a rich trainer keeps growing.
   Sponsor Shares follow your results: wins push the price up, losses pull it down (plus some market noise),
                 and every 4 shares pay ₽1 a floor. Buy into a win streak, sell before it ends.
   Daycare       leave one Pokémon from your bench: it frees the slot and gains a star after a few floors,
                 for a small fee each floor.
   Goldenrod Loan borrow now (₽10 or ₽20) for a power spike, and pay back 130% out of your next two floors' income.
   Everything settles when floor income arrives. */

const MKT={bondRate:.4,bondFloors:3,bondMax:3,bondSizes:[5,10,20],
  shareMin:3,shareMax:40,shareCap:12,divPer:4,win:.12,loss:-.1,noise:.08,
  loanSizes:[10,20],loanRate:.3,
  dayNeed:[0,3,5],dayFee:u=>1+Math.floor(lineOf(u).cost/2)};

function inv(){if(!run.inv)run.inv={bonds:[],shares:0,price:10,hist:[10],day:null,loan:null,paid:0};return run.inv;}
const bondValue=()=>inv().bonds.reduce((s,b)=>s+b.amt,0);
const shareValue=()=>inv().shares*inv().price;

/* ---------- settling at floor income ---------- */
// returns lines for the income toast
function marketSettle(){
  if(!run.inv)return[];const I=run.inv,log=[];
  // bonds mature
  for(const b of I.bonds)b.left--;
  const done=I.bonds.filter(b=>b.left<=0);I.bonds=I.bonds.filter(b=>b.left>0);
  for(const b of done){const pay=Math.round(b.amt*(1+MKT.bondRate));run.gold+=pay;log.push(`bond paid ₽${pay}`);}
  // shares move with your last result, plus noise
  const r=run.lastRes==='win'?MKT.win:run.lastRes==='loss'?MKT.loss:0;run.lastRes=null;
  I.price=clamp(Math.round(I.price*(1+r+(Math.random()*2-1)*MKT.noise)*10)/10,MKT.shareMin,MKT.shareMax);I.hist.push(I.price);if(I.hist.length>16)I.hist.shift();
  const div=Math.floor(I.shares/MKT.divPer);if(div){run.gold+=div;log.push(`₽${div} dividend`);}
  // the daycare charges its fee and the Pokémon grows
  if(I.day){const D0=I.day,fee=MKT.dayFee(D0.u);
    if(run.gold>=fee){run.gold-=fee;D0.steps++;log.push(`₽${fee} daycare`);
      if(D0.u.star<3&&D0.steps>=MKT.dayNeed[D0.u.star]){D0.steps=0;D0.u.star++;D0.gain=(D0.gain||0)+1;log.push(`${nameOf(D0.u)} grew to ${D0.u.star}★ at the Daycare`);}}
    else log.push('no money for the daycare fee');}
  // the loan takes its installment
  if(I.loan){const due=Math.min(I.loan.owe,I.loan.inst);const pay=Math.min(run.gold,due),short=due-pay;run.gold-=pay;I.loan.owe-=due;
    if(short>0){run.hp=Math.max(1,run.hp-short);log.push(`loan: ₽${pay} paid, ${short} Trainer HP for the rest`);}else log.push(`loan −₽${pay}`);
    if(I.loan.owe<=0)I.loan=null;}
  return log;
}

/* ---------- actions ---------- */
function buyBond(amt){const I=inv();if(mode!=='plan'||run.gold<amt||I.bonds.length>=MKT.bondMax)return false;run.gold-=amt;I.bonds.push({amt,left:MKT.bondFloors});return true;}
function tradeShares(n){const I=inv();if(mode!=='plan')return false;
  if(n>0){const k=Math.min(n,MKT.shareCap-I.shares,Math.floor(run.gold/Math.ceil(I.price)));if(k<=0)return false;run.gold-=k*Math.ceil(I.price);I.shares+=k;return true;}
  const k=Math.min(-n,I.shares);if(k<=0)return false;run.gold+=k*Math.floor(I.price);I.shares-=k;return true;}
function takeLoan(amt){const I=inv();if(mode!=='plan'||I.loan)return false;const owe=Math.round(amt*(1+MKT.loanRate));run.gold+=amt;I.loan={owe,inst:Math.ceil(owe/2)};return true;}
function dropOff(u){const I=inv();if(mode!=='plan'||I.day||!run.bench.includes(u)||u.star>=3)return false;
  if(u.fuse){toast('Separate the fusion first.');return false;}removeUnit(u);I.day={u,steps:0};return true;}
function pickUp(){const I=inv();if(mode!=='plan'||!I.day)return false;const slot=run.bench.indexOf(null);if(slot<0){toast('Free a bench slot first.');return false;}
  const u=I.day.u,g=I.day.gain||0;run.bench[slot]=u;I.day=null;if(!SIM.on)ensure(u.dex);
  // a star gained at the Daycare evolves it the same way combining does
  for(let s=0;s<g;s++)evolveStep(u);combine();return true;}

/* ---------- the Market screen ---------- */
function mkSpark(h){const w=150,ht=34,mx=Math.max(...h),mn=Math.min(...h),sp=Math.max(1,mx-mn);
  return`<svg class="spark" viewBox="0 0 ${w} ${ht}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="2.5" points="${h.map((v,i)=>`${(i/(Math.max(1,h.length-1))*(w-4)+2).toFixed(1)},${(ht-3-(v-mn)/sp*(ht-6)).toFixed(1)}`).join(' ')}"/></svg>`;}
function showMarket(){
  if(!run||mode!=='plan'||evoOpen)return;if(ov.innerHTML.trim())return;hideTip();
  mode='market';renderMarket();
}
function closeMarket(){ov.innerHTML='';mode='plan';renderUI();}
function renderMarket(){
  const I=inv(),pr=I.price,trend=I.hist.length>1?I.price-I.hist[I.hist.length-2]:0;
  const bench=run.bench.filter(u=>u&&u.star<3&&!u.fuse);
  const card=(cls,title,sub,body)=>`<div class="mk win ${cls}"><h2>${title}</h2><p class="sc">${sub}</p>${body}</div>`;
  ov.innerHTML=`<div class="scrim"></div><div class="screen market"><div class="tierbanner gold">THE MARKET</div><h1 class="h1">Invest your Pokédollars</h1>
    <p class="sub">You have <b>₽${run.gold}</b>. Everything here settles when your next floor's income arrives.</p>
    <div class="mkgrid">
    ${card('bond','League Bonds',`Lock money away for ${MKT.bondFloors} floors, get back +${MKT.bondRate*100}%. Locked money earns no interest, but bonds have no cap.`,
      `<div class="mkrow">${MKT.bondSizes.map(a=>`<button class="btn sm" data-bond="${a}" ${run.gold<a||I.bonds.length>=MKT.bondMax?'disabled':''}>₽${a} → ₽${Math.round(a*(1+MKT.bondRate))}</button>`).join('')}</div>
       <div class="mklist">${I.bonds.length?I.bonds.map(b=>`<span class="chip">₽${b.amt} · ${b.left} floor${b.left>1?'s':''}</span>`).join(''):'<span class="sc">No bonds yet.</span>'}</div>`)}
    ${card('share','Sponsor Shares',`Your sponsor's price rises when you win and falls when you lose. Every ${MKT.divPer} shares pay ₽1 each floor.`,
      `<div class="mkprice"><b>₽${pr.toFixed(1)}</b><span class="${trend>0?'up':trend<0?'down':''}">${trend>0?'▲':trend<0?'▼':'•'} ${Math.abs(trend).toFixed(1)}</span>${mkSpark(I.hist)}</div>
       <div class="mkrow"><button class="btn sm" data-sh="1" ${run.gold<Math.ceil(pr)||I.shares>=MKT.shareCap?'disabled':''}>Buy 1 (₽${Math.ceil(pr)})</button><button class="btn sm" data-sh="-1" ${I.shares?'':'disabled'}>Sell 1 (₽${Math.floor(pr)})</button><button class="btn sm" data-sh="-99" ${I.shares?'':'disabled'}>Sell all</button></div>
       <div class="mklist"><span class="sc">You own <b>${I.shares}</b> / ${MKT.shareCap} · worth ₽${Math.floor(I.shares*pr)}</span></div>`)}
    ${card('day','Daycare',`Leave a bench Pokémon here: it frees the slot and gains a star (${MKT.dayNeed[1]} floors to 2★, ${MKT.dayNeed[2]} to 3★). Small fee each floor.`,
      I.day?`<div class="mkday"><img src="${por(shownDex(I.day.u))}" alt=""><div><b>${esc(nameOf(I.day.u))}</b> ${'★'.repeat(I.day.u.star)}<br><span class="sc">${I.day.u.star<3?`${I.day.steps} / ${MKT.dayNeed[I.day.u.star]} floors to ${I.day.u.star+1}★ · ₽${MKT.dayFee(I.day.u)} a floor`:'Fully grown'}</span></div></div>
        <div class="mkrow"><button class="btn sm" id="mk-pick">Pick up</button></div>`
      :`<div class="mkrow mkbench">${bench.length?bench.map(u=>`<button class="mkpor" data-day="${run.bench.indexOf(u)}" title="Drop off ${esc(nameOf(u))} (₽${MKT.dayFee(u)} a floor)"><img src="${por(shownDex(u))}" alt="${esc(nameOf(u))}"><span>${'★'.repeat(u.star)}</span></button>`).join(''):'<span class="sc">Put a 1★ or 2★ Pokémon on your bench to drop it off.</span>'}</div>`)}
    ${card('loan','Goldenrod Loan',`Borrow now, pay back ${Math.round((1+MKT.loanRate)*100)}% over your next two floors. If you can't pay, it costs Trainer HP.`,
      I.loan?`<div class="mklist"><span class="sc">You owe <b>₽${I.loan.owe}</b>: ₽${Math.min(I.loan.owe,I.loan.inst)} next floor.</span></div>`
      :`<div class="mkrow">${MKT.loanSizes.map(a=>`<button class="btn sm" data-loan="${a}">Borrow ₽${a} (repay ₽${Math.round(a*(1+MKT.loanRate))})</button>`).join('')}</div>`)}
    </div><button class="btn go" id="back">Done</button></div>`;
  const re=()=>{sfx('coin');renderMarket();renderUI();};
  ov.querySelectorAll('[data-bond]').forEach(b=>b.onclick=()=>{if(buyBond(+b.dataset.bond))re();});
  ov.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{if(tradeShares(+b.dataset.sh))re();});
  ov.querySelectorAll('[data-loan]').forEach(b=>b.onclick=()=>{if(takeLoan(+b.dataset.loan))re();});
  ov.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{if(dropOff(run.bench[+b.dataset.day]))re();});
  const pk=$('mk-pick');if(pk)pk.onclick=()=>{if(pickUp())re();};
  $('back').onclick=closeMarket;
}
