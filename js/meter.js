"use strict";
/* PokéRun Tactics — battle meter: damage dealt, healing done and damage taken per Pokémon, with per-second rates. */
const METER={tab:'dmg',side:0,last:null,acc:0};
const MTABS={dmg:{n:'Damage',k:'mDmg',col:'#e2433f',ps:'DPS'},heal:{n:'Healing',k:'mHeal',col:'#3fae54',ps:'HPS'},taken:{n:'Taken',k:'mTaken',col:'#5a7fd6',ps:'per sec'}};
function meterSnap(){
  if(!battle||!units||!units.length)return null;
  const dur=Math.max(1,combatT);
  return{dur,rows:units.map(c=>({dex:c.dex,n:D[c.dex]?D[c.dex].n:'?',team:c.team,summon:!!c.summon,dead:!!c.dead,star:c.u?c.u.star:1,mDmg:c.mDmg||0,mHeal:c.mHeal||0,mTaken:c.mTaken||0}))};
}
const fmtN=v=>v>=10000?(v/1000).toFixed(1)+'k':Math.round(v).toLocaleString();
function renderMeter(force){
  const el=$('meter');if(!el||el.hidden)return;
  if(inFight()&&battle){METER.last=meterSnap();}
  const S=METER.last,T=MTABS[METER.tab],open=!!OPTS.meterOpen;
  el.classList.toggle('closed',!open);$('mtog').setAttribute('aria-expanded',open);
  $('mlbl').textContent=inFight()?'Battle meter':'Last battle';
  el.querySelectorAll('[data-mtab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mtab===METER.tab));
  el.querySelectorAll('[data-mside]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.mside===METER.side));
  if(!open)return;
  const body=$('mrows');
  if(!S){body.innerHTML='<div class="mempty">Fight a battle to see numbers here.</div>';return;}
  const rows=S.rows.filter(r=>r.team===METER.side).sort((a,b)=>b[T.k]-a[T.k]);
  const top=Math.max(1,...rows.map(r=>r[T.k])),tot=rows.reduce((s,r)=>s+r[T.k],0);
  body.innerHTML=rows.map(r=>{const v=r[T.k];return`<div class="mrow${r.dead?' dead':''}"><img src="${por(r.dex)}" alt=""><div class="mmain"><div class="mtop"><span class="mn">${esc(r.n)}${r.summon?' <i>(summon)</i>':''}</span><b>${fmtN(v)}</b></div>
    <div class="mbar"><i style="width:${(v/top*100).toFixed(1)}%;background:${T.col}"></i></div><div class="mps">${fmtN(v/S.dur)} ${T.ps}</div></div></div>`;}).join('')
    +`<div class="mtot"><span>Team total · ${S.dur.toFixed(0)}s</span><b>${fmtN(tot)} <small>(${fmtN(tot/S.dur)}/s)</small></b></div>`;
}
$('meter').addEventListener('click',e=>{
  const t=e.target.closest('[data-mtab]'),sd=e.target.closest('[data-mside]');
  if(e.target.closest('#mtog')){OPTS.meterOpen=OPTS.meterOpen?0:1;saveOpts();CAM.avT=0;CAM.av=null;}
  if(t)METER.tab=t.dataset.mtab;if(sd)METER.side=+sd.dataset.mside;renderMeter(1);});
(function meterLoop(){try{const now=performance.now();if(now-METER.acc>250){METER.acc=now;const el=$('meter');if(el){el.hidden=!run||$('hud').hidden||mode==='carousel'||(!METER.last&&!inFight());renderMeter();}}}catch(e){}requestAnimationFrame(meterLoop);})();
