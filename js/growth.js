"use strict";
/* PokéRun Tactics — Size and run-long growth.
   Size is a continuous stat: every Pokémon starts at 100%. Growth lines and some sets add to it.
   Each effect of Size scales smoothly and has its own cap (see SIZE). Bigger also means easier to hit. */

const SIZE={
  drawCap:1.8,                       // the sprite is drawn at most 180% big; the stat keeps growing
  cc:(s)=>Math.min(.4,(s-100)/200),  // stuns and slows are shorter
  splash:(s)=>Math.min(.15,(s-100)/500), // basic attacks splash onto enemies next to the target
  anchor:(s)=>Math.min(1,(s-100)/100),   // chance to resist knockback, pulls and swaps
  dodgeLoss:(s)=>(s-100)/200,        // dodge chance lost
  slayer:.001,                       // giant-slayer moves: +0.1% damage per 1% of the target's Size above 100
};
const sizeOf=c=>Math.max(100,c&&c.size||100);
function applySizeLook(c){const f=Math.min(SIZE.drawCap,sizeOf(c)/100);c.scaleMul=(c.scaleMul||1)/(c.sizeLook||1)*f;c.sizeLook=f;}
// grow (or shrink) in battle; hpWith adds that fraction of max HP per 1% of Size gained
function addSize(c,n,hpWith=0){if(!c||c.dead||!n)return;c.size=sizeOf(c)+n;if(hpWith){const k=1+hpWith*n/100;c.maxHp*=k;c.hp*=k;}applySizeLook(c);}
const ccMul=c=>1-SIZE.cc(sizeOf(c));
const dodgeOf=c=>Math.max(0,(c.dodge||0)-SIZE.dodgeLoss(sizeOf(c)));
const anchored=c=>Math.random()<SIZE.anchor(sizeOf(c));
// basic-attack splash for big attackers
function sizeSplash(u,tg,amt){const p=SIZE.splash(sizeOf(u));if(p<=0||tg.dead)return;
  for(const o of alive(tg.team))if(o!==tg&&hdist(o,tg)<=1)damage(u,o,amt*p,{cat:u.cat,noCrit:1,quiet:1,refl:1});}
const SLAYER_MOVES=new Set(['Heavy Slam','Heat Crash','Low Kick','Grass Knot','Body Press']);

/* ---------- growth lines ----------
   Every growth line keeps its stacks (u.gs) for the whole run and through evolution; combining adds them up.
   Nothing here has a cap: past the point where more projectiles would clutter the screen,
   extra stacks make each projectile hit harder instead. */
const stacks=c=>(c&&c.u&&c.u.gs)||0;
const lineIds=root=>{const L=MODE&&MODE.lines[root];return L?L.mem:[root];};
const PROJ_DRAW=12;
// how many projectiles to draw, and how hard each hits, when a count keeps growing past what fits on screen
function overflow(n,cap){cap=Math.min(cap,PROJ_DRAW);return n<=cap?{n,mul:1}:{n:cap,mul:n/cap};}

const GROWTH_NEW=[
  {ids:[246,247,248],n:'Rubble',key:'rubble',on:'battleKill',
    d:u=>`After every battle: +1 Rubble, +1 more if it landed a knockout. Every 6 Rubble adds a rock to its Rock Slide, forever. <span class="sc">(${u.gs||0} Rubble · ${1+Math.floor((u.gs||0)/6)} rocks)</span>`},
  {ids:[320,321],n:'Blubber',key:'blubber',on:'battle',hpPct:.02,size:3,
    d:u=>`After every battle: +1 Blubber, forever. Each adds +2% max HP and +3% Size, so it grows bigger and bulkier together. <span class="sc">(${u.gs||0} Blubber · Size ${100+3*(u.gs||0)}%)</span>`},
  {ids:[316,317],n:'Gullet',key:'gullet',on:'feed',
    d:u=>`<b>Feed</b> it Pokémon from your bench (unit menu). Each ₽ they were worth gives +3% max HP and +1% Size; each of their stars adds 1 Gullet: +12% damage on its move, forever. <span class="sc">(${u.gs||0} Gullet · ₽${u.fed||0} eaten)</span>`},
  {ids:[304,305,306],n:'Iron Diet',key:'iron',on:'battle',per:{def:2},size:1,feed:'item',
    d:u=>`After every battle it eats 1 iron: +2 Defense and +1% Size, forever. <b>Feed</b> it a spare item component for +5 iron. Heavy Slam hits harder the bigger it is. <span class="sc">(${u.gs||0} iron)</span>`},
  {ids:[374,375,376],n:'Computation',key:'data',on:'battle',
    d:u=>`After every battle: +1 Data, forever. Each gives +1% crit chance (past 100%, crit damage instead). With 20 Data it predicts and dodges each enemy's first move every battle. <span class="sc">(${u.gs||0} Data)</span>`},
  {ids:[870],n:'Recruitment',key:'troop',on:'battle',
    d:u=>`Every 3 battles a new trooper joins: it starts with 3 and each one adds a hit to No Retreat. With 6 or more, the squad takes 15% less damage. <span class="sc">(${3+Math.floor((u.gs||0)/3)} troopers)</span>`},
  {ids:[442],n:'Gathered Souls',key:'souls',on:'near',
    d:u=>`Gathers a soul whenever an enemy faints within 2 hexes: +0.3% damage and max HP each, forever. At 108 souls the Odd Keystone is whole: every enemy deals 10% less damage. <span class="sc">(${u.gs||0}/108 souls)</span>`},
  {ids:[957,958,959],n:'Scrap Hammer',key:'scrap',on:'scrap',
    d:u=>`After every battle: +1 scrap, plus 1 for each Steel or Flying enemy it hit. Each scrap makes its hammer moves deal +4% damage, forever. <span class="sc">(${u.gs||0} scrap)</span>`},
  {ids:[878,879],n:'Patina',key:'patina',on:'battle',per:{def:2,res:2},size:1,
    d:u=>`After every battle: +2 Defense and Sp. Def and +1% Size, forever. Heavy Slam hits harder the bigger it is. <span class="sc">(${u.gs||0} battles · Size ${100+(u.gs||0)}%)</span>`},
  {ids:[179,180,181],n:'Wool Growth',key:'wool',on:'battle',
    d:u=>`After every battle its wool grows: +1 wool, forever. It starts each battle with a shield of 3% max HP per wool; when the shield breaks it zaps everything next to it. <span class="sc">(${u.gs||0} wool)</span>`},
  {ids:[440,113,242],n:'Lucky Eggs',key:'eggs',on:'eggs',
    d:u=>`Lays a Lucky Egg after every battle (holds 5). Its healing is +8% stronger per egg it holds. <b>Give</b> an egg to an ally from the unit menu: that ally gains +3% max HP for the rest of the run. <span class="sc">(${u.eggs||0}/5 eggs · ${u.gs||0} laid)</span>`},
  {ids:[932,933,934],n:'Salt Crystals',key:'salt',on:'battle',
    d:u=>`After every battle: +1 salt crystal, forever. Each adds +2% damage to its moves. With 20, allies next to it restore 1% max HP per second. <span class="sc">(${u.gs||0} crystals)</span>`},
  {ids:[550,10016,902],n:'Last Respects',key:'respects',on:'allyFaint',
    d:u=>`Every ally that faints in a battle it fights: +2% damage, forever. <span class="sc">(${u.gs||0} fallen · +${2*(u.gs||0)}%)</span>`},
  {ids:[971,972],n:'Last Respects',key:'respects',on:'allyFaint',
    d:u=>`Every ally that faints in a battle it fights: +2% damage, forever. <span class="sc">(${u.gs||0} fallen · +${2*(u.gs||0)}%)</span>`},
  {ids:[83,10166,865],n:'Sharpened Leek',key:'leek',on:'critBattle',
    d:u=>`After every battle where it lands a critical hit: +1% crit chance and +2% crit damage, forever. <span class="sc">(${u.gs||0} sharpened)</span>`},
  {ids:[235],n:'Sketch',key:'sketch',on:'none',
    d:u=>`After a battle you can let it keep the move it sketched, for the rest of the run.${u.sketch?` <span class="sc">(Keeping: ${esc(kitOf(u.sketch).mv.n)} from ${esc(D[u.sketch].n)})</span>`:''}`},
  {ids:[399,400],n:'Dam Builder',key:'dam',on:'battle',
    d:u=>`After every battle it adds to its dam, forever. When battle starts, allies right behind it get a shield of 2% of its max HP per dam piece. <span class="sc">(${u.gs||0} pieces)</span>`},
  {ids:[95,208],n:'Pressure-Hardened',key:'press',on:'battle',per:{def:2},size:.7,
    d:u=>`After every battle: +2 Defense and +0.7% Size, forever. <span class="sc">(${u.gs||0} battles)</span>`},
];
// the 13 original growth lines get their lore twists
const GROWTH_TWIST={
  129:{d:' At 20 stacks Gyarados gets Intimidate: enemies next to it deal 15% less damage.'},
  63:{d:' Every 25 casts also refunds +5% of its PP after each move.'},
  679:{d:' Each stack also gives +0.5% lifesteal (up to 15%).'},
  746:{d:' While schooling it is huge: +50% Size.'},
  213:{d:' At the start of battle it shares its berry juice: the lowest-HP ally next to it heals 10%.'},
  143:{size:2,d:' It also grows +2% Size per stack, and Rest heals more as it grows.'},
};
function initGrowth(){
  for(const g of GROWTH)for(const id of g.ids){const t=GROWTH_TWIST[id];if(t){if(t.size)g.size=t.size;if(t.d&&!g.twisted){g.d+=t.d;g.twisted=1;}}}
  for(const g of GROWTH_NEW)if(!GROWTH.some(x=>x.key===g.key&&x.ids[0]===g.ids[0]))GROWTH.push(g);
}
initGrowth();

/* stacks earned after a battle (called from endCombat). Returns the number of new stacks. */
function growthGain(G,c,win){
  switch(G.on){
    case 'battle':return 1;
    case 'win':return win?1:0;
    case 'kill':return c.kills;
    case 'cast':return c.casts;
    case 'hit':return Math.floor(c.hits/G.every);
    case 'battleKill':return 1+(c.kills>0?1:0);
    case 'near':return c.grNear||0;
    case 'scrap':return 1+(c.grScrap||0);
    case 'allyFaint':return units.filter(o=>o.team===c.team&&o!==c&&o.dead&&!o.summon).length;
    case 'critBattle':return c.grCrit?1:0;
    case 'eggs':return 1;
  }
  return 0;
}
function growthAfter(G,c,u,n){
  if(G.on==='eggs')u.eggs=Math.min(5,(u.eggs||0)+1);
  if(G.hpPct)u.g.hpP=(u.g.hpP||0)+G.hpPct*n;
}
/* applied to a fresh combatant (makeCombatant) */
function growthCombat(c){
  const u=c.u,G=u&&u.root!==undefined&&MODE&&growthOf(u);c.size=100+(c.fx.size||0);
  if(G){const s=u.gs||0;
    if(G.size)c.size+=G.size*s;
    if(u.fed)c.size+=u.fed;
    switch(G.key){
      case 'data':{let cr=c.crit+.01*s;if(cr>1){c.critD+=cr-1;cr=1;}c.crit=cr;if(s>=20)c.foresee=1;break;}
      case 'troop':{const n=3+Math.floor(s/3);c.abm*=n/3;if(n>=6)c.taken*=.85;break;}
      case 'souls':{c.maxHp*=1+.003*s;c.hp=c.maxHp;c.dmg+=.003*s;if(s>=108)c.keystone=1;break;}
      case 'scrap':c.abm*=1+.04*s;break;
      case 'gullet':c.abm*=1+.12*s;break;
      case 'salt':c.abm*=1+.02*s;if(s>=20)c.fx.soothe=(c.fx.soothe||0)+.01;break;
      case 'respects':c.dmg+=.02*s;break;
      case 'leek':{c.critD+=.02*s;let cr=c.crit+.01*s;if(cr>1){c.critD+=cr-1;cr=1;}c.crit=cr;break;}
      case 'wool':if(s)c.shield+=c.maxHp*.03*s,c.woolShield=1;break;
      case 'eggs':c.healAmp+=.08*(u.eggs||0);break;
    }
    if(G.ids.includes(129)&&s>=20&&c.dex===130)c.fx.intim=(c.fx.intim||0)+.15;
    if(G.ids.includes(63)&&s>=25)c.leppa=(c.leppa||0)+c.maxMana*.05*Math.floor(s/25);
    if(G.ids.includes(679))c.ls+=Math.min(.15,.005*s);
    if(G.ids.includes(746))c.size+=50;
    if(G.ids.includes(213))c.berryShare=1;
    if(G.ids.includes(143)||G.ids.includes(446))c.restAmp=Math.min(1,.005*s);
  }
  if(u&&u.g&&u.g.hpP){c.maxHp*=1+u.g.hpP;c.hp=c.maxHp;c.shield*=1+u.g.hpP;}
  applySizeLook(c);
}
// a battle-start pass for growth effects that touch other units
function growthStart(c){
  const G=c.u&&MODE&&growthOf(c.u);
  if(G&&G.key==='dam'&&stacks(c)){const dir=c.team?-1:1;for(const a of alive(c.team))if(a!==c&&hdist(a,c)===1&&(a.r-c.r)*dir>0){a.shield+=c.maxHp*.02*stacks(c);if(!SIM.on)pfx('Protect',a.x,a.y-12,{sc:.6,force:1});}}
  if(G&&G.key==='blubber'&&sizeOf(c)>=150)schedule(.5,()=>{if(c.dead)return;const foes=alive(1-c.team);if(!foes.length)return;
    const t=foes.map(o=>[o,foes.filter(q=>hdist(q,o)<=1).length]).sort((a,b)=>b[1]-a[1])[0][0];dashTo(c,t,true,.35);
    schedule(.37,()=>{if(c.dead)return;for(const o of alive(1-c.team))if(hdist(o,t)<=1){damage(c,o,c.maxHp*.06,{ab:1,cat:'phys',type:'Water',noCrit:1});knock(c,o);}
      if(!SIM.on){pfx('Water_Spout_Splash',t.x,t.y-8,{sc:1.3,force:1});CINE.shake=Math.max(CINE.shake,.15);texts.push({x:c.x,y:c.y-44,txt:'Bounce!',col:'#7fc8ff',life:1,label:1});}});});
  if(G&&G.key==='sketch')c.sketchy=1;
  if(c.berryShare){const a=alive(c.team).filter(o=>o!==c&&hdist(o,c)<=1).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(a){heal(a,a.maxHp*.1);if(!SIM.on)pfx('Heal_Block_Sparkle',a.x,a.y-14,{sc:.8,force:1});}}
  if(c.keystone){for(const o of alive(1-c.team))o.dmg*=.9;if(!SIM.on){texts.push({x:c.x,y:c.y-44,txt:'Odd Keystone!',col:'#b48cff',life:1.4,label:1});pfx('Grudge_Lights',c.x,c.y-16,{sc:1,force:1});}}
}
// in-battle counters for growth
function growthOnFaint(tg){for(const c of units)if(!c.dead&&c.team!==tg.team&&c.u&&!c.summon&&hdist(c,tg)<=2){const G=MODE&&growthOf(c.u);if(G&&G.key==='souls'){c.grNear=(c.grNear||0)+1;if(!SIM.on)pfx('Grudge_Lights',tg.x,tg.y-12,{sc:.6,force:1});}}}
function growthOnHit(src,tg,crit){if(!src.u||src.team!==0)return;if(crit)src.grCrit=1;
  if(tg&&(D[tg.dex].t.includes('Steel')||D[tg.dex].t.includes('Flying'))){const G=MODE&&growthOf(src.u);if(G&&G.key==='scrap'&&!tg.scrapBy){tg.scrapBy=1;src.grScrap=(src.grScrap||0)+1;}}}
// wool: when the woolly shield breaks, it zaps everything next to it
function woolCheck(c,before){if(c.woolShield&&before>0&&c.shield<=0){c.woolShield=0;for(const o of alive(1-c.team))if(hdist(o,c)<=1){damage(c,o,c.maxHp*.08+c.spa*.4,{ab:1,cat:'spec',type:'Electric',noCrit:1,refl:1});stun(o,.4);}
  if(!SIM.on){pfx('Spark',c.x,c.y-12,{sc:1.2,force:1});texts.push({x:c.x,y:c.y-40,txt:'Static!',col:'#ffe14d',life:1,label:1});}}}

/* ---------- Feed (Gulpin line, Aron line, Snorlax line, and Big Eaters) ---------- */
const FEED_IDS=[316,317,446,143,304,305,306];
function canFeed(u){if(!u||!run)return false;const G=growthOf(u);if(G&&['gullet','iron'].includes(G.key))return true;if(G&&G.ids.includes(143))return true;return typeof bigEaterTier==='function'&&bigEaterTier()>0&&unitSets(u).includes('Big Eaters');}
function feedValue(o){return typeof sellValue==='function'?Math.max(1,sellValue(o)):MODE.lines[o.root].cost*o.star;}
function feedUnit(eater,food){
  const v=feedValue(food),stars=food.star;removeUnit(food);
  const G=growthOf(eater);eater.g=eater.g||{};
  if(G&&G.key==='gullet'){eater.g.hpP=(eater.g.hpP||0)+.03*v;eater.fed=(eater.fed||0)+v;eater.gs=(eater.gs||0)+stars;}
  else if(G&&G.key==='iron'){eater.gs=(eater.gs||0)+Math.max(1,v);eater.g.def=(eater.g.def||0)+2*Math.max(1,v);}
  else if(G&&G.ids.includes(143)){eater.gs=(eater.gs||0)+v;eater.g.hp=(eater.g.hp||0)+50*v;}
  if(typeof bigEatersFeed==='function')bigEatersFeed(eater,v);
  run.fedTotal=(run.fedTotal||0)+v;
  if(!SIM.on){sfx('star',120);const p=locate(eater);if(p)pfx('Swallow',p.x,p.y-14,{sc:1,force:1})||burst(p.x,p.y-12,'#f0c890',16,1);toast(`${nameOf(eater)} ate ${nameOf(food)} (₽${v})!`);}
  renderUI();
}
function feedItem(eater,idx){const it=run.bag[idx];if(!it)return;run.bag.splice(idx,1);eater.gs=(eater.gs||0)+5;eater.g.def=(eater.g.def||0)+10;
  if(typeof bigEatersFeed==='function')bigEatersFeed(eater,2);
  if(!SIM.on){sfx('star',120);toast(`${nameOf(eater)} crunched up ${itemName(it)}: +5 iron!`);}renderUI();}
function showFeedMenu(eater){
  const food=allOwned().filter(o=>o!==eater&&!Object.values(run.board).includes(o));
  const G=growthOf(eater),items=G&&G.key==='iron'?run.bag.map((it,i)=>({it,i})).filter(x=>isComp(x.it)):[];
  ov.innerHTML=`<div class="scrim" id="fd-scrim"></div><div class="screen"><div class="win feedwin"><h1 class="h1">Feed ${esc(nameOf(eater))}</h1>
    <p class="sub">Pick something from your bench${items.length?' or bag':''}. It's eaten for good, and you get no ₽ back.</p>
    <div class="feedgrid">${food.map(o=>`<button class="feedopt" data-food="${o.uid}"><img src="${porImg(o)}" alt=""><span>${esc(nameOf(o))} ${'★'.repeat(o.star)}</span><b>₽${feedValue(o)}</b></button>`).join('')||'<p class="sub">Your bench is empty.</p>'}
    ${items.map(x=>`<button class="feedopt" data-feedit="${x.i}"><img src="${iconOf(itemDef(x.it).id)}" alt=""><span>${esc(itemName(x.it))}</span><b>+5 iron</b></button>`).join('')}</div>
    <div class="umacts"><button class="btn" id="fd-back" data-back>Back</button></div></div></div>`;
  const close=()=>{ov.innerHTML='';renderUI();};
  $('fd-back').onclick=close;$('fd-scrim').onclick=close;
  ov.querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{const o=allOwned().find(x=>x.uid===+b.dataset.food);if(o)feedUnit(eater,o);close();});
  ov.querySelectorAll('[data-feedit]').forEach(b=>b.onclick=()=>{feedItem(eater,+b.dataset.feedit);close();});
  (ov.querySelector('.feedopt')||$('fd-back')).focus();
}
/* ---------- Lucky Eggs ---------- */
function showEggMenu(hen){
  const al=allOwned().filter(o=>o!==hen);
  ov.innerHTML=`<div class="scrim" id="eg-scrim"></div><div class="screen"><div class="win feedwin"><h1 class="h1">Give a Lucky Egg</h1>
    <p class="sub">${esc(nameOf(hen))} holds ${hen.eggs||0} egg${hen.eggs===1?'':'s'}. The ally you pick gains +3% max HP for the rest of the run.</p>
    <div class="feedgrid">${al.map(o=>`<button class="feedopt" data-egg="${o.uid}"><img src="${porImg(o)}" alt=""><span>${esc(nameOf(o))}</span><b>+${Math.round(((o.g&&o.g.hpP)||0)*100)}%</b></button>`).join('')}</div>
    <div class="umacts"><button class="btn" id="eg-back" data-back>Back</button></div></div></div>`;
  const close=()=>{ov.innerHTML='';renderUI();};
  $('eg-back').onclick=close;$('eg-scrim').onclick=close;
  ov.querySelectorAll('[data-egg]').forEach(b=>b.onclick=()=>{const o=allOwned().find(x=>x.uid===+b.dataset.egg);if(o&&hen.eggs>0){hen.eggs--;o.g=o.g||{};o.g.hpP=(o.g.hpP||0)+.03;if(!SIM.on){sfx('star',120);toast(`${nameOf(o)} ate a Lucky Egg: +3% max HP for the run!`);}}close();});
  (ov.querySelector('.feedopt')||$('eg-back')).focus();
}
/* unit-menu actions added by growth lines and sets */
const UNIT_ACTS=[];
function unitActs(u){if(!run||mode!=='plan'||!allOwned().includes(u))return[];const out=[];
  if(canFeed(u))out.push(['feed','Feed…']);
  if(growthOf(u)&&growthOf(u).key==='eggs'&&(u.eggs||0)>0)out.push(['egg',`Give a Lucky Egg (${u.eggs})`]);
  for(const f of UNIT_ACTS){const a=f(u);if(a)out.push(a);}
  return out;}
function unitAct(u,k){if(k==='feed')return showFeedMenu(u);if(k==='egg')return showEggMenu(u);if(typeof setUnitAct==='function')setUnitAct(u,k);}

/* ---------- Larvitar line: Rock Slide that grows a rock per 6 Rubble ---------- */
const rocksOf=(c,i)=>{const n=1+Math.floor(stacks(c)/6);return overflow(n,[3,5,12][i]);};
defSig({ids:[246,247,248],role:'Sand Tyrant',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[65,75,85],start:20,pf:[.8,1,1.3],names:['Rock Slide','Rock Slide','Stone Edge'],mvType:'Rock',
  d:(c,i)=>{const r=rocksOf(c,i),all=1+Math.floor(stacks(c)/6);return`${i?`Gains a shield of <b class="s-hp">${Math.round(c.maxHp*.15)}</b> <span class="sc">(15% <span class="s-hp">max HP</span>)</span>, then b`:'B'}rings down <b>${all}</b> rock${all>1?'s':''} on random enemies within 3 hexes, each dealing ${DT(c,.5*r.mul)}${r.mul>1?' (extra rocks make each one bigger)':''}.${i===2?` Then it drives a <b>Stone Edge</b> into the weakest enemy: ${DT(c,1)} that always crits. <b>Sand Stream:</b> starts the battle with a sandstorm if nothing else set the weather.`:''} <b>Grows:</b> every 6 Rubble adds a rock, forever. <span class="sc">(${stacks(c)} Rubble)</span>`;},
  begin(c,i){if(i===2)setWeather(c,'sand');},
  cast(c,tg,i){if(i)c.shield+=c.maxHp*.15;const r=rocksOf(c,i),pool=foesOf(c).filter(o=>hdist(c,o)<=3);const ts=pool.length?pool:[tg];
    for(let k=0;k<r.n;k++)schedule(k*.08,()=>{if(c.dead)return;const a=ts.filter(o=>!o.dead);if(!a.length)return;const t=pick(a);
      const hit=()=>{if(t.dead)return;hitAb(c,t,.5*r.mul);stun(t,.15);if(!SIM.on)pfx('Rock_Smash',t.x,t.y-10,{sc:.5+.12*Math.min(4,r.mul),force:1});};
      if(SIM.on)hit();else fire(c,t,'#b8a07a',hit,{arc:1,dur:.45,lift:140,side:rnd(-25,25),size:3+Math.min(3,r.mul),type:'Rock'});});
    if(i===2)schedule(r.n*.08+.25,()=>{if(c.dead)return;const t=foesOf(c).sort((a,b)=>a.hp-b.hp)[0];if(!t)return;hitAb(c,t,1,{cr:1});if(!SIM.on){pfx('Stone_Edge',t.x,t.y-14,{sc:1,force:1})||boom(t,'#c9a46b',2);texts.push({x:t.x,y:t.y-36,txt:'Stone Edge!',col:'#e8c48a',life:1,label:1});}});}});
