"use strict";
/* PokéRun Tactics — stacking status conditions and weather.
   Statuses stack like The Last Flame's and Guildrun's afflictions: every application adds stacks, more stacks
   hit harder, and stacks wear off by halves when they aren't refreshed (4s, then every 2s).
   Burn       0.25% max HP/s per stack (max 20). Burned Pokémon deal 15% less physical damage. Fire types are immune.
   Poison     0.3% max HP/s per stack (max 20). Poisoned Pokémon heal 33% less. Poison and Steel types are immune.
   Paralysis  −3% Attack Speed per stack (max 10), and each attack has a 3%-per-stack chance to be fully paralyzed. Electric types are immune.
   Chill      −5% Attack Speed per stack. At 3 stacks the Pokémon freezes solid for 1.2s (then 4s immune). Ice types are immune; nothing freezes in harsh sunlight.
   Confusion  each attack has an 8%-per-stack chance (max 5) to hurt itself instead.
   Leech Seed 0.3% max HP/s per stack (max 10), healing whoever planted it. Grass types are immune. */
const ST={
  burn:  {n:'Burn',ab:'BRN',col:'#f08030',per:.0025,max:20,imm:['Fire']},
  poison:{n:'Poison',ab:'PSN',col:'#a040a0',per:.003,max:20,imm:['Poison','Steel']},
  para:  {n:'Paralysis',ab:'PAR',col:'#e0b020',max:10,imm:['Electric']},
  chill: {n:'Chill',ab:'FRZ',col:'#68b8d8',max:3,imm:['Ice']},
  conf:  {n:'Confusion',ab:'CNF',col:'#e0508a',max:5,imm:[]},
  seed:  {n:'Leech Seed',ab:'SEED',col:'#58a838',per:.003,max:10,imm:['Grass']},
};
const STK=Object.keys(ST);
// item/enhancer keys: on<X> = stacks per basic attack, ab<X> = stacks per move hit
const STFX={Burn:'burn',Psn:'poison',Para:'para',Chill:'chill',Conf:'conf',Seed:'seed'};
const isMine=src=>src&&src.team===0&&!!run;
const stCount=t=>STK.filter(k=>t[k]&&t[k].n>0).length;
const chillMax=src=>isMine(src)&&hasRelic('snowball')?2:3;
function addStatus(t,k,n,src,o={}){
  const S=ST[k];if(!S||!t||t.dead||!(n>0))return;
  if(t.fx.aImm)return;if((k==='burn'||k==='poison')&&(t.fx.dotImm||t.fx.mGuard))return;
  if(S.imm.some(ty=>D[t.dex].t.includes(ty)))return;
  if(k==='chill'&&((battle&&battle.weather==='sun')||(t.frzCd||0)>combatT||t.stunImm))return;
  if(!o.raw){let m=1;if(isMine(src)&&augIs('plague2'))m*=2;if(src&&src.fx&&src.fx.stPow)m*=1+src.fx.stPow;n=Math.max(1,Math.round(n*m))+(isMine(src)&&hasRelic('sticky-barb')?1:0);}
  const cur=t[k],max=k==='chill'?chillMax(src):S.max;
  t[k]={n:Math.min(max,(cur?cur.n:0)+n),t:4,src:src||(cur&&cur.src)||null};
  if(k==='poison')t.griev=Math.max(t.griev||0,combatT+4);
  if(k==='chill'&&t.chill.n>=max){t.chill=null;t.frzCd=combatT+4;const dur=(o.freeze||1.2)+(src&&src.fx&&src.fx.freezeAdd||0);stun(t,dur);t.frozenT=combatT+dur;
    if(!SIM.on){texts.push({x:t.x,y:t.y-30,txt:'Frozen!',col:'#bff0ff',life:1,label:1});pfx('Ice_Fang_Hit',t.x,t.y-12,{sc:.4,force:1});}}
}
// the old single-value DoT API, now adding stacks (p = % max HP/s it used to deal)
function setDot(t,k,p,dur,src){addStatus(t,k,Math.max(1,Math.round(p/.005)),src);}
function addToxic(u,t){addStatus(t,'poison',2,u);}
function cureStatus(u){for(const k of STK)u[k]=null;}
function statusTick(u,dt){
  for(const k of['burn','poison','seed']){const s=u[k];if(!s||u.dead)continue;const src=s.src;
    let dps=u.maxHp*ST[k].per*s.n;
    if(src&&src.fx&&src.fx[k+'Dmg'])dps*=1+src.fx[k+'Dmg'];if(isMine(src)&&augIs('plague2'))dps*=1.25;if(u.team===0&&run&&hasRelic('full-heal'))dps*=.5;
    if(k==='poison'&&u.poisonHeal){heal(u,dps*dt,true);continue;}
    if(u.fx.mGuard)continue;
    hurt(u,dps*dt,src);
    if(k==='seed'&&src&&!src.dead)heal(src,dps*dt*(1+(src.fx.seedHeal||0)),true);}
  if(u.dead)return;
  for(const k of STK){const s=u[k];if(!s)continue;
    if(k==='poison'&&isMine(s.src)&&hasRelic('poison-barb'))continue;
    const fast=((k==='burn'&&battle.weather==='rain')?2:1)*(u.team===0&&run&&hasRelic('full-heal')?2:1);
    s.t-=dt*fast;if(s.t<=0){s.n=Math.floor(s.n/2);s.t=2;if(s.n<=0)u[k]=null;}}
}
// returns true when the attack is lost to paralysis or confusion
function statusSkip(u){
  if(u.para&&Math.random()<.03*u.para.n*(isMine(u.para.src)&&hasRelic('electirizer')?2:1)){stun(u,.5);u.para.n=Math.max(0,u.para.n-2);if(!u.para.n)u.para=null;
    if(!SIM.on){texts.push({x:u.x,y:u.y-30,txt:'Paralyzed!',col:'#ffe14d',life:.8,label:1});pfx('Spark',u.x,u.y-12,{sc:.35,force:1});}return true;}
  if(u.conf&&Math.random()<.08*u.conf.n){hurt(u,autoAmt(u)*.4,null);u.conf.n--;if(!u.conf.n)u.conf=null;u.busy=.4;
    if(!SIM.on){texts.push({x:u.x,y:u.y-30,txt:'Confused!',col:'#ff9be6',life:.8,label:1});pfx('Dizzy_Punch_Hit',u.x,u.y-14,{sc:.5,force:1});}return true;}
  return false;
}
const statusAS=u=>Math.max(.4,1-.03*(u.para?u.para.n:0)-.05*(u.chill?u.chill.n:0));
// damage multiplier from statuses (attacker burned, target frozen/poisoned, Hex Maniac augment)
function statusDmg(src,tg,o){let m=1;
  if(src.burn&&o.cat==='phys'&&!o.tru)m*=.85;
  if(tg.poison&&src.fx.vsPsn)m*=1+src.fx.vsPsn;
  if(tg.frozenT>combatT&&src.fx.vsFrz)m*=1+src.fx.vsFrz;
  if(isMine(src)&&augIs('hexer'))m*=1+Math.min(.3,.06*stCount(tg));
  return m;}
// statuses that come from items, enhancers and augments
function statusOnHit(u,tg){for(const x in STFX){const v=u.fx['on'+x];if(v)addStatus(tg,STFX[x],v,u);}
  if(isMine(u)){for(const[a,k]of[['static','para'],['ppoint','poison'],['fbody','burn']])if(augIs(a)&&Math.random()<.3)addStatus(tg,k,1,u);}}
function statusOnAb(src,tg){for(const x in STFX){const v=src.fx['ab'+x];if(v)addStatus(tg,STFX[x],v,src);}}
// a fainting enemy passes its statuses on (Outbreak augment, Magmarizer relic)
function statusOnFaint(tg){if(tg.team!==1||!run)return;
  const near2=alive(tg.team).filter(o=>o!==tg&&hdist(o,tg)<=2);
  if(augIs('outbreak'))for(const k of STK)if(tg[k]&&tg[k].n>1&&k!=='chill')for(const o of near2)addStatus(o,k,Math.ceil(tg[k].n/2),tg[k].src,{raw:1});
  if(hasRelic('magmarizer')&&tg.burn){const o=alive(tg.team).filter(x=>x!==tg).sort((a,b)=>hdist(a,tg)-hdist(b,tg))[0];if(o){addStatus(o,'burn',tg.burn.n,tg.burn.src,{raw:1});if(!SIM.on)lineFx(tg,o,'#ff7a2c',2,.3);}}}
// status pips over the HP bar
const PIP={burn:'BR',poison:'PS',para:'PA',chill:'FZ',conf:'CF',seed:'LS'};
function drawStatusPips(cu,x,y){let px=x;ctx.font='6px PokeEmerald,"Pixelify Sans",sans-serif';ctx.textAlign='left';
  for(const k of STK){const s=cu[k];if(!s||!s.n)continue;const S=ST[k],txt=PIP[k]+s.n,w=Math.ceil(ctx.measureText(txt).width)+2;
    ctx.fillStyle='#1b2430';ctx.fillRect(px-1,y-1,w+2,7);ctx.fillStyle=S.col;ctx.fillRect(px,y,w,5);ctx.fillStyle='#fff';ctx.fillText(txt,px+1,y+5);px+=w+3;}}
function statusTipHtml(cu){const on=STK.filter(k=>cu[k]&&cu[k].n);if(!on.length&&!(cu.frozenT>combatT))return'';
  return`<div class="sts">${on.map(k=>`<span class="stp" style="background:${ST[k].col}">${ST[k].n} ${cu[k].n}</span>`).join('')}${cu.frozenT>combatT?'<span class="stp" style="background:#68b8d8">Frozen</span>':''}</div>`;}

/* ---------- weather: game effects ---------- */
const WX_INFO={sun:'Harsh sunlight · Fire moves +20%, Water −15% · nothing can freeze',rain:'Rain · Water moves +20%, Fire −15% · burns wear off twice as fast',
  sand:'Sandstorm · all but Rock, Ground and Steel types take 1% max HP/s · Rock types +50% Sp. Def',snow:'Snow and hail · all but Ice types take 1% max HP/s · Ice types +50% Defense'};
function weatherStart(u){const w=battle.weather;if(!w)return;const ty=D[u.dex].t;
  if(w==='sand'&&ty.includes('Rock'))u.res*=1.5;if(w==='snow'&&ty.includes('Ice'))u.def*=1.5;}
function weatherTick(u,dt){const w=battle.weather;if(!w||u.dead||u.fx.mGuard||u.fx.noWeatherChip)return;const ty=D[u.dex].t;
  if(w==='sand'&&!ty.some(t=>t==='Rock'||t==='Ground'||t==='Steel'))hurt(u,u.maxHp*.01*battle.wPow*dt,null);
  if(w==='snow'&&!ty.includes('Ice'))hurt(u,u.maxHp*.01*battle.wPow*dt,null);}

/* ---------- weather: PMD animation ---------- */
const WXIMG={};const wxImg=n=>WXIMG[n]||(WXIMG[n]=Object.assign(new Image(),{src:'assets/weather/'+n+'.png'}));
['rain','hail','snow','sandstorm','heat','sun'].forEach(wxImg);
const WX={drops:[],last:0,acc:0};
const imgOk=im=>im.complete&&im.naturalWidth;
function drawWeather(t){
  const w=battle&&(mode==='combat'||mode==='result')?battle.weather:null;const dt=Math.min(.05,Math.max(0,t-WX.last));WX.last=t;
  if(!w){WX.drops=[];return;}
  const g=ctx,Wd=cv.width,Ht=cv.height;g.save();g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;
  const tint={sun:'rgba(255,190,80,.08)',rain:'rgba(30,60,120,.16)',sand:'rgba(170,120,40,.12)',snow:'rgba(220,235,255,.12)'}[w];g.fillStyle=tint;g.fillRect(0,0,Wd,Ht);
  const tile=(im,fw,fh,f,sc,ox,oy,a)=>{if(!imgOk(im))return;g.globalAlpha=a;const W2=fw*sc,H2=fh*sc;ox=((ox%W2)+W2)%W2;oy=((oy%H2)+H2)%H2;
    for(let y=-H2+oy;y<Ht;y+=H2)for(let x=-W2+ox;x<Wd;x+=W2)g.drawImage(im,f*fw,0,fw,fh,Math.floor(x),Math.floor(y),W2,H2);g.globalAlpha=1;};
  if(w==='sand'){const im=wxImg('sandstorm');tile(im,120,32,0,4,t*900,t*60,.22);tile(im,120,32,0,6,t*600+300,-t*40,.14);}
  if(w==='sun'){const im=wxImg('heat');tile(im,120,32,0,6,t*30,Math.sin(t)*10,.06);const s=wxImg('sun');
    if(imgOk(s)){const pts=[[0,150,100,1.6],[1,330,220,.9],[2,470,300,.8],[4,560,350,1],[5,700,430,1.2],[6,780,480,1]];g.globalCompositeOperation='lighter';
      for(const[f,x,y,sc]of pts){g.globalAlpha=.35+.1*Math.sin(t*2+f);const z=104*sc;g.drawImage(s,f*104,0,104,104,x-z/2,y-z/2,z,z);}g.globalCompositeOperation='source-over';g.globalAlpha=1;}}
  if(w==='snow'){tile(wxImg('snow'),32,32,Math.floor(t*10)%16,4,t*40,t*90,.45);tile(wxImg('snow'),32,32,(Math.floor(t*10)+7)%16,3,t*25+50,t*60+40,.3);}
  if(w==='rain'||w==='snow'){const im=wxImg(w==='rain'?'rain':'hail'),fs=w==='rain'?16:24,sc=w==='rain'?3:2.2,rate=w==='rain'?140:28,vy=w==='rain'?1400:620,vx=w==='rain'?-180:-160;
    WX.acc+=dt*rate;while(WX.acc>=1){WX.acc--;WX.drops.push({x:Math.random()*(Wd+300),y:-40,ty:120+Math.random()*(Ht-200),land:-1});}
    for(const d of WX.drops){if(d.land<0){d.x+=vx*dt;d.y+=vy*dt;if(d.y>=d.ty)d.land=0;}else d.land+=dt;}
    WX.drops=WX.drops.filter(d=>d.land<.24);
    if(imgOk(im))for(const d of WX.drops){let f;if(w==='rain')f=d.land<0?0:1+Math.min(3,Math.floor(d.land/.06));else f=d.land<0?Math.floor(t*8+d.x)%2:2+Math.min(1,Math.floor(d.land/.12));
      const z=fs*sc;g.globalAlpha=w==='rain'?.75:.9;g.drawImage(im,f*fs,0,fs,fs,Math.round(d.x-z/2),Math.round(d.y-z),z,z);}g.globalAlpha=1;}
  // what the weather does, under the HUD
  if(mode==='combat'){const txt=WX_INFO[w];g.font='16px PokeEmerald,"Pixelify Sans",sans-serif';g.textAlign='center';const tw=g.measureText(txt).width+24,y=(CAM.av?CAM.av.t*2:116)+18;
    g.fillStyle='rgba(15,28,21,.78)';g.fillRect(640-tw/2,y-15,tw,22);g.fillStyle='#ffe9b0';g.fillText(txt,640,y+1);}
  g.restore();
}

const ST_DESC={burn:'0.25% max HP/s per stack (max 20). Deals 15% less physical damage and heals half as much. Fire types are immune.',
  poison:'0.3% max HP/s per stack (max 20). Heals a third less. Poison and Steel types are immune.',
  para:'−3% Attack Speed per stack (max 10), and a 3% chance per stack that an attack fails. Electric types are immune.',
  chill:'−5% Attack Speed per stack. At 3 stacks it freezes solid for 1.2s, then can\'t be chilled for 4s. Ice types are immune; nothing freezes in sun.',
  conf:'8% chance per stack (max 5) that an attack hurts itself instead.',
  seed:'Drains 0.3% max HP/s per stack (max 10) into whoever planted it. Grass types are immune.'};
function statusGuideHtml(){return`<div class="mod" style="grid-column:1 / -1"><div class="k">Status conditions</div><p>Every hit adds stacks. Stacks last 4s after the last hit, then halve every 2s.</p>${STK.map(k=>`<p><span class="stp" style="background:${ST[k].col}">${PIP[k]} ${ST[k].n}</span> ${ST_DESC[k]}</p>`).join('')}<p><b>Weather:</b> ${Object.values(WX_INFO).join(' · ')}</p></div>`;}
