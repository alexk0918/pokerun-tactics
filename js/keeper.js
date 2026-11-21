"use strict";
/* PokéRun Tactics — shopkeeper scenes.
   A menu run by a Pokémon shows it behind its stall (its PMD idle animation, large) and talks in a PMD text box
   with its portrait, whose expression follows what happens (happy, joyous on a sale, worried when you're short...).
   Portraits: PMDCollab SpriteCollab (assets/<dex>/emo/<Emotion>.png, falling back to the normal portrait). */
const KEEP={
  kecleon:{dex:352,name:'Kecleon',aw:'#4d9a3a',ct:['#b9814a','#8d5a2b','#d9a066'],sign:'Kecleon Shop'},
  croagunk:{dex:453,name:'Croagunk',aw:'#3a62b8',ct:['#7a6a9a','#544570','#9b8bbd'],sign:'Swap Shop'},
  meowth:{dex:52,name:'Meowth',aw:'#b8352c',ct:['#3a3a44','#1f1f26','#5a5a66'],sign:'Rocket HQ'},
  jirachi:{dex:385,name:'Jirachi',aw:'#d9a520',ct:['#4a6fb8','#2f4f8f','#7a9ad8'],sign:'Wish Well'},
  chansey:{dex:113,name:'Chansey',aw:'#e86aa0',ct:['#f2d6c4','#d8b49c','#fff0e4'],sign:'Daycare'},
  marowak:{dex:105,name:'Marowak',aw:'#8d5a2b',ct:['#c9a46a','#9a7440','#e3c48c'],sign:'Dojo'},
  spinda:{dex:327,name:'Spinda',aw:'#c0392b',ct:['#e8d8b8','#c8b48c','#fff2d8'],sign:'Roulette'},
  pelipper:{dex:279,name:'Pelipper',aw:'#3a8ad0',ct:['#d8e4ec','#a8bccb','#f2f8fc'],sign:'Flight Plan'},
  mew:{dex:151,name:'Mew',aw:'#e88ad0',ct:['#f2e4f4','#d4bcd8','#fff4ff'],sign:'Mystery Gift'},
  smeargle:{dex:235,name:'Smeargle',aw:'#6aa84f',ct:['#e8dcc4','#c8b894','#fff6e4'],sign:'Sketch'},
  xatu:{dex:178,name:'Xatu',aw:'#3fa070',ct:['#c8a050','#9a7430','#e8c070'],sign:'Fortunes'},
};
const keepPor=(k,emo)=>`assets/${pad(KEEP[k].dex)}/emo/${emo||'Normal'}.png`;
// the stall: awning, sign, the keeper, the counter
function keeperStall(k,opts={}){const K=KEEP[k];
  return`<div class="kp-stall" style="--aw:${K.aw};--ct1:${K.ct[0]};--ct2:${K.ct[1]};--ct3:${K.ct[2]}"><div class="kp-sign">${esc(opts.sign||K.sign)}</div><div class="kp-awning"></div>
    <div class="kp-spr" data-dex="${K.dex}" style="${opts.filter?`filter:${opts.filter}`:''}"></div><div class="kp-counter"></div></div>`;}
// the PMD text box (buttons can sit at its right)
function keeperTalk(k,extra=''){return`<div class="kp-talk"><img class="kp-pf" src="${keepPor(k,'Happy')}" alt="" onerror="this.onerror=null;this.src='assets/${pad(KEEP[k].dex)}/portrait.png'"><div class="kp-txt"><div class="kp-who">${esc(KEEP[k].name)}</div><div class="kp-say" aria-live="polite"></div></div>${extra?`<div class="kp-acts">${extra}</div>`:''}</div>`;}
// start the idle animation and return say(text, emotion)
let keepTimer=0;
function keeperStart(root,k){const box=root.querySelector('.kp-spr'),K=KEEP[k];clearTimeout(keepTimer);
  if(box){const A=SM[K.dex]&&SM[K.dex].a&&SM[K.dex].a.Idle;
    if(A){const[file,fw,fh,durs]=A,sc=Math.max(3,Math.min(6,Math.floor(250/fh))),n=durs.length;
      box.style.width=fw*sc+'px';box.style.height=fh*sc+'px';box.style.backgroundImage=`url(assets/${pad(K.dex)}/${file}.png)`;box.style.backgroundSize=`${fw*sc*n}px auto`;
      let f=0;const step=()=>{if(!box.isConnected)return;box.style.backgroundPosition=`${-f*fw*sc}px 0`;const d=(durs[f]||8)*1000/60;f=(f+1)%n;keepTimer=setTimeout(step,d);};step();}
    else box.innerHTML=`<img src="${por(K.dex)}" alt="" style="width:120px;height:120px;border-radius:12px">`;}
  const pf=root.querySelector('.kp-pf'),say=root.querySelector('.kp-say');let tk=0;
  return(text,emo)=>{if(!say)return;if(pf&&emo)pf.src=keepPor(k,emo);clearInterval(tk);const plain=String(text);let i=0;say.textContent='';
    if(typeof sfx==='function')sfx('speak',150);
    const fast=typeof OPTS!=='undefined'&&OPTS.fx===0;if(fast){say.innerHTML=plain;return;}
    tk=setInterval(()=>{if(!say.isConnected){clearInterval(tk);return;}i+=2;say.innerHTML=i>=plain.length?plain+' <span class="kp-caret">▼</span>':esc(plain.replace(/<[^>]*>/g,'').slice(0,i));if(i>=plain.length)clearInterval(tk);},18);};}
