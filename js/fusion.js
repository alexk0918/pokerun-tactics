"use strict";
/* PokéRun Tactics — dramatic form changes.
   Fusions: Kyurem + Zekrom/Reshiram (DNA Splicers), Necrozma + Solgaleo/Lunala (N-Solarizer/N-Lunarizer),
   Calyrex + Glastrier/Spectrier (Reins of Unity). Fuse from the unit menu while you own both; the partner joins
   the fusion (its stars make the fusion stronger) and comes back if you separate them or sell the fusion.
   Formes: Deoxys picks its forme when you get it (a meteorite falls), and can change it from its menu between battles. */

const FUSE_ITEM={646:'DNA Splicers',800:'N-Solarizer and N-Lunarizer',898:'Reins of Unity'};
const isFusionForm=f=>FORMS[f]&&FORMS[f].kind==='fusion';
// stat scaling when a unit fights in another form (same rule as an in-battle form change)
function formStats(c,fid,partner){
  if(!D[fid])return;const b=D[c.dex].s,f=D[fid].s,R=(i,p)=>Math.pow(Math.max(1,f[i])/Math.max(1,b[i]),p);
  c.maxHp*=R(0,.8);c.hp=c.maxHp;c.atk*=R(1,.85);c.def*=R(2,.85);c.spa*=R(3,.85);c.res*=R(4,.85);c.as*=R(5,.5);c.dex=fid;
  if(partner){const k=1+.1*partner.star;c.maxHp*=k;c.hp=c.maxHp;c.dmg+=.1*partner.star;c.fused=1;}
}
function fusionOptions(u){
  if(!u||u.fuse)return[];const base=baseOf(u.dex);
  return Object.keys(FORMS).map(Number).filter(f=>isFusionForm(f)&&FORMS[f].base===base).map(fid=>{
    const pd=FORMS[fid].partner,partner=allOwned().find(p=>p!==u&&!p.fuse&&(p.dex===pd||baseOf(p.dex)===pd));return{fid,partner,pd};});
}
function returnPartner(p){if(!p)return;const slot=run.bench.indexOf(null);
  if(slot>=0){run.bench[slot]=p;if(!SIM.on)toast(`${nameOf(p)} returned to your bench.`);}
  else{run.gold+=sellValue(p);for(const it of p.items||[])run.bag.push(it);if(!SIM.on)toast(`No bench space, so ${nameOf(p)} was released for ₽${sellValue(p)}.`);}}
function fuse(u,o){
  if(!o.partner||mode!=='plan')return;removeUnit(o.partner);u.fuse={fid:o.fid,p:o.partner};
  if(SIM.on)return;ensure(o.fid);fusionScene(u.dex,o.partner.dex,o.fid,`${FUSE_ITEM[baseOf(u.dex)]||'Fusion'}`);renderUI();
}
function unfuse(u){if(!u.fuse||mode!=='plan')return;if(run.bench.indexOf(null)<0){toast('Free a bench slot first.');return;}const p=u.fuse.p;u.fuse=null;run.bench[run.bench.indexOf(null)]=p;
  if(!SIM.on){toast(`${nameOf(u)} and ${nameOf(p)} separated.`);renderUI();}}
// the cut-in: both portraits slam together, a flash, then the fused form
function fusionScene(a,b,fid,item){
  const el=document.createElement('div');el.className='fusescene';
  el.innerHTML=`<div class="fsl"><img src="${por(a)}" alt=""></div><div class="fsr"><img src="${por(b)}" alt=""></div><div class="fsflash"></div>
    <div class="fsres"><img src="${por(fid)}" alt=""><b>${esc(D[fid].n)}</b><span>${esc(item)}</span></div>`;
  $('stage').appendChild(el);setTimeout(()=>el.classList.add('done'),2300);setTimeout(()=>el.remove(),2700);
  const p=Object.values(run.board).concat(run.bench).find(x=>x&&x.fuse&&x.fuse.fid===fid);const L=p&&locate(p);
  if(L){burst(L.x,L.y-12,'#ffffff',40,1.8);ring(L.x,L.y-8,'#ffe27a');}
}

/* ---------- Deoxys: pick a forme ---------- */
const FORME_BASES={386:[386,10001,10002,10003]};
const FORME_TXT={386:'Normal Forme: balanced, with a powerful Psycho Boost.',10001:'Attack Forme: its Psycho Boost hits far harder, but it\'s fragile.',10002:'Defense Forme: shields itself and its allies, very hard to take down.',10003:'Speed Forme: blinks between targets, striking three times.'};
function showFormePick(u){
  const base=baseOf(u.dex),opts=FORME_BASES[base];if(!opts)return;u.formeAsked=1;hideTip();
  const prevMode=mode;mode='augment';opts.forEach(ensure);
  ov.innerHTML=`<div class="scrim"></div><div class="screen formescreen"><div class="meteor"></div><div class="tierbanner prismatic">A METEORITE FELL</div><h1 class="h1">Choose ${esc(D[base].n)}'s forme</h1>
    <p class="sub">You can change it again from its menu (right-click) between battles.</p>
    <div class="picks">${opts.map(f=>{const s=D[f].s;return`<button class="pick win forme${(u.forme||base)===f?' cur':''}" data-f="${f}"><div class="icon"><img src="${por(f)}" alt=""></div><h2 style="font-size:20px">${esc(D[f].n)}</h2>
      <div class="fstats"><span>HP ${s[0]}</span><span>Atk ${s[1]}</span><span>Def ${s[2]}</span><span>SpA ${s[3]}</span><span>SpD ${s[4]}</span><span>Spe ${s[5]}</span></div><p class="sc">${FORME_TXT[f]||''}</p></button>`;}).join('')}</div></div>`;
  ov.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const f=+b.dataset.f;u.forme=f===base?null:f;ov.innerHTML='';mode=prevMode==='augment'?'plan':prevMode;
    const L=locate(u);if(L&&!SIM.on){burst(L.x,L.y-12,'#ff9be6',36,1.6);ring(L.x,L.y-8,'#ffffff');}toast(`${D[f].n}!`);renderUI();});
}
// any Deoxys that joins (shop, carousel, augment, event) asks for its forme once
(function formeWatch(){try{if(run&&mode==='plan'&&!ov.innerHTML.trim()&&!evoOpen){const u=allOwned().find(x=>FORME_BASES[baseOf(x.dex)]&&!x.formeAsked);if(u)showFormePick(u);}}catch(e){}requestAnimationFrame(formeWatch);})();
