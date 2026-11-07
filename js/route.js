/* PokéRun Tactics: route choices, floor types, events, Kecleon shops, enhancers and unit mutators */

/* ================= Floor types ================= */
const FIXED={1:'wild',2:'wild',5:'rival',10:'boss'};
const isRouteFloor=f=>f<=FLOORS&&!FIXED[f];
const NODES={
  battle:{n:'Trainer Battle',icon:'poke-ball',tag:'Normal',col:'#e2433f',d:'A regular trainer battle.',r:'Chest'},
  challenge:{n:'Challenge',icon:'ultra-ball',tag:'Hard',col:'#2b2b2f',d:'A stronger trainer with one extra Pokémon, some of them mutated.',r:'Better chest · +₽3'},
  alpha:{n:'Alpha Pokémon',icon:'dusk-ball',tag:'Mini-boss',col:'#b8352c',d:'A huge, enraged Alpha Pokémon and its escorts.',r:'Enhancer · rich chest · 25% relic'},
  endurance:{n:'Endurance',icon:'timer-ball',tag:'Survive',col:'#d8742a',d:'Wild Pokémon keep coming in waves. Last as long as you can, up to 40 seconds.',r:'Rewards at 15 / 25 / 40s'},
  timeattack:{n:'Time Attack',icon:'quick-ball',tag:'Speed',col:'#3d79d6',d:'Knock out a giant target as fast as you can. Its guards don\'t count.',r:'Best rewards under 15s'},
  event:{n:'Mystery',icon:'mystery-egg',tag:'Event',col:'#8a6ce0',d:'Something is happening on this path. No telling what.',r:'?'},
  center:{n:'Pokémon Center',icon:'max-potion',tag:'Rest',col:'#e86aa0',d:'No battle. Rest, train, or pick up a supply.',r:'Heal · XP · supplies'},
  shop:{n:'Kecleon Shop',icon:null,tag:'Shop',col:'#4d9a3a',d:'Spend Pokédollars on Pokémon, items, enhancers and relics. Some Kecleon are mutated.',r:'Shop'},
  wild:{n:'Wild Pokémon',icon:'poke-ball',tag:'Wild',col:'#5fae45'},
  rival:{n:'Rival',icon:'great-ball',tag:'Mini-boss',col:'#3d79d6'},
  boss:{n:'Guardian',icon:'master-ball',tag:'Boss',col:'#8a6ce0'},
};
const NONCOMBAT=new Set(['event','center','shop']);
const END_LIMIT=40,END_T=[15,25,40],TA_LIMIT=40,TA_T=[40,25,15];
const KECLEON=352;
function nodeK(f){const n=run&&run.nodes&&run.nodes[f];if(n)return n.k;return FIXED[f]||'battle';}
const nodeIcon=k=>k==='shop'?por(KECLEON):iconOf(NODES[k].icon);

function planAct(){
  // two Kecleon shops show up on the route each act
  run.shopFloors=[pick([3,6]),pick([7,8,9])];run.nodes={};run.route=null;run.seenEv=[];
}
function genRoute(f){
  if(!isRouteFloor(f))return null;
  const combatOnly=f===GIMMICK_FLOOR,g=oldF(f);
  const opts=[Math.random()<.85||combatOnly?'battle':pick(['event','endurance'])];
  const hard=g<=4?['challenge','challenge','endurance']:g<6?['challenge','challenge','endurance','timeattack']:['challenge','alpha','alpha','endurance','timeattack'];
  opts.push(pick(hard.filter(k=>!opts.includes(k))));
  if(Math.random()<.45){const third=(combatOnly?['endurance','timeattack','challenge']:g>=6?['event','event','event','endurance','endurance','timeattack','timeattack','center']:g<=4?['event','event','endurance']:['event','event','timeattack']).filter(k=>!opts.includes(k));if(third.length)opts.push(pick(third));}
  if(!combatOnly&&(run.shopFloors.includes(f)||(f>3&&Math.random()<.06))&&!opts.includes('shop')){if(opts.length<3)opts.push('shop');else opts[2]='shop';}
  if(!combatOnly&&g>=6&&run.hp<run.maxHp*.35&&!opts.includes('center')&&Math.random()<.35){if(opts.length<3)opts.push('center');else if(opts[2]!=='shop')opts[2]='center';}
  const cen=opts.indexOf('center');
  if(cen>=0&&((run.centersOffered||0)>=2||run.lastCenterOffer===f-1)){opts.splice(cen,1);if(opts.length<2)opts.push(pick(['event','endurance','timeattack'].filter(k=>!opts.includes(k))));}
  if(opts.includes('center')){run.centersOffered=(run.centersOffered||0)+1;run.lastCenterOffer=f;}
  return opts.map(k=>({k}));
}
function nodeName(f){
  const n=run.nodes&&run.nodes[f];if(!n)return null;
  const big=enemyPreview.find(e=>e.u.alpha||e.u.tgt);
  if(n.rocket)return'Team Rocket';
  if(n.k==='challenge')return`${trainerTitle(f)} (Challenge)`;
  if(n.k==='alpha')return big?`Alpha ${D[big.u.dex].n}`:'Alpha Pokémon';
  if(n.k==='endurance')return'Endurance: survive the waves';
  if(n.k==='timeattack')return big?`Time Attack: defeat ${D[big.u.dex].n}`:'Time Attack';
  if(NONCOMBAT.has(n.k))return NODES[n.k].n;
  return null;
}
function nodeModHtml(){
  const k=nodeK(run.floor);if(!['challenge','alpha','endurance','timeattack'].includes(k))return'';
  const N=NODES[k],p={challenge:'Better chest and +₽3 if you win.',alpha:'Enhancer, rich chest, 25% relic.',
    endurance:`Survive ${END_T[0]}s to win. Better rewards at ${END_T[1]}s and ${END_T[2]}s.`,timeattack:`Defeat the target in ${TA_LIMIT}s. Best under ${TA_T[2]}s.`}[k];
  return`<div class="mod nodem" style="border-color:${N.col}"><div class="k"><img src="${nodeIcon(k)}" alt="">${N.n}</div><div class="v">${esc(trainerName(run.floor))}</div><p>${p}</p></div>`;
}

/* ---------- big enemies (Alpha / Time Attack target) ---------- */
function bigEnemy(f){const pool=foePool([...MODE.byCost[2],...MODE.byCost[3]]),tp=foePool([...MODE.byCostAll[2],...MODE.byCostAll[3]]).filter(r=>SM[finalOf(r)]&&inTheme(r));const root=pick(tp.length&&Math.random()<.7?tp:pool);const u=mkUnit(root,actOf()>=2?3:2);u.dex=finalOf(root);return genFoe(u);}
function bigify(c){
  if(c.u.alpha){c.hp*=2.8;c.maxHp=c.hp;c.atk*=1.3;c.spa*=1.3;c.def+=10;c.res+=10;c.shield=c.maxHp*(c.fx.shieldP||0);c.scaleMul=1.4;c.alpha=1;}
  if(c.u.tgt){c.hp*=2.4+dFloor(run.floor)*.05;c.maxHp=c.hp;c.atk*=.55;c.spa*=.55;c.shield=0;c.scaleMul=1.4;c.isTgt=1;}
  return c;
}

/* ---------- combat hooks ---------- */
function routeOnStart(etr){
  battle.node=nodeK(run.floor);battle.etr=etr;battle.wave=0;
  if(battle.node==='endurance')for(let t=7;t<END_LIMIT;t+=7)schedule(t,spawnWave);
}
function freeHex(rows){const opts=[];for(const r of rows)for(let c=0;c<COLS;c++)if(!occupied(c,r))opts.push({c,r});return opts.length?pick(opts):null;}
function spawnWave(){
  if(mode!=='combat'||!battle||battle.node!=='endurance')return;
  battle.wave++;const f=run.floor,w=battle.wave;
  const n=Math.min(2+Math.ceil(w/2),5),room=Math.max(0,9-alive(1).length);
  const F=dFloor(f),o=LVODDS[enemyLv(F)],mult=(1.02+(Math.min(F,60)-4)*.03)*(1+w*.1)*endlessMul()*(hasRelic('town-map')?.9:1);
  for(let i=0;i<Math.min(n,room);i++){
    const root=themedRoot(rollCostFor(o));const x=Math.random();const u=mkFoe(root,x<clamp((F-15)*.04,0,.5)?3:x<clamp((F-4)*.05+w*.05,0,.85)?2:1);
    const pos=freeHex([0,1,2]);if(!pos)break;
    const c=makeCombatant(u,1,pos.c,pos.r,battle.etr||{},mult);c.cd=.6;units.push(c);
    if(!SIM.on){ensure(u.dex);burst(c.x,c.y-10,'#ffb35c',14,1);}
  }
  if(!SIM.on)texts.push({x:320,y:200,txt:`Wave ${w+1}!`,col:'#ffb35c',life:1.4,label:1,big:1});
}
function combatEndCheck(){
  if(events.some(e=>e.end))return;
  const a=alive(0).length,b=alive(1).length,nk=battle.node;let win=null;
  if(nk==='endurance'){
    if(!a){battle.survT=combatT;win=combatT>=END_T[0];}
    else if(combatT>=END_LIMIT){battle.survT=END_LIMIT;win=true;}
    else if(!b&&!battle.waveSoon){battle.waveSoon=1;schedule(1.2,()=>{battle.waveSoon=0;spawnWave();});}
  }else if(nk==='timeattack'){
    const tg=units.find(u=>u.isTgt);
    if(!tg||tg.dead){battle.clearT=combatT;win=true;}
    else if(!a||combatT>=TA_LIMIT)win=false;
  }else if(!a||!b||combatT>45)win=a&&b?(hpFrac(0)>=hpFrac(1)):!!a;
  if(win!==null)events.push({t:combatT+(SIM.on?0:1.1),end:1,fn:()=>endCombat(win)});
}
function nodeTier(win){
  const nk=battle&&battle.node;
  if(nk==='endurance'){const t=battle.survT??combatT;return END_T.filter(x=>t>=x).length;}
  if(nk==='timeattack'){if(!win)return 0;const t=battle.clearT??combatT;return TA_T.filter(x=>t<=x).length;}
  return win?1:0;
}
// gold bonus, extra trainer damage and a result label for the banner
function routeResult(win){
  const nk=battle.node,tier=nodeTier(win),n=run.nodes[run.floor]||{};run.lastTier=tier;
  const out={gold:0,dmgMul:1,dmgAdd:0,label:''};
  if(nk==='endurance'||nk==='timeattack'){run.tierLog=run.tierLog||{};(run.tierLog[nk]=run.tierLog[nk]||[]).push(nk==='endurance'?Math.floor(battle.survT??combatT):tier);}
  if(nk==='challenge'){if(win)out.gold+=3;else out.dmgAdd+=2;}
  if(nk==='alpha'&&!win)out.dmgAdd+=3;
  if(nk==='endurance'){out.gold+=[0,2,4,7][tier];out.label=`Survived ${Math.floor(battle.survT??combatT)}s`+(tier?` · ${['','Bronze','Silver','Gold'][tier]}`:'');if(!win)out.dmgMul=.8;}
  if(nk==='timeattack'){out.gold+=[0,2,4,7][tier];out.label=win?`Cleared in ${(battle.clearT??combatT).toFixed(1)}s · ${['','Bronze','Silver','Gold'][tier]}`:'Out of time';if(!win)out.dmgMul=.6;}
  if(win&&n.bonus)out.gold+=n.bonus;
  return out;
}
function lootQuality(win){
  if(!win)return 0;const nk=nodeK(run.floor),t=run.lastTier||0;
  if(nk==='alpha')return 2;if(nk==='challenge')return 1;
  if(nk==='endurance'||nk==='timeattack')return t>=3?2:t>=2?1:0;
  return 0;
}

/* ================= Flow ================= */
// after the chest (and relic): enhancer reward, then the route choice
function afterFloor(){
  chest=null;
  if(run.pendingEnh){run.pendingEnh=false;run.enhChoices=enhChoices(3);mode='reward';
    if(SIM.on){run.bag.length<BAGMAX&&run.bag.push({k:'enh:'+run.enhChoices[0],mut:[]});run.enhChoices=null;}
    else{showEnhPick();return'enh';}}
  const nf=run.floor+1;
  if(isRouteFloor(nf)){run.route=genRoute(nf);mode='route';
    if(SIM.on)return chooseRoute(SIM.routePick?SIM.routePick(run.route):Math.floor(Math.random()*run.route.length));
    showRoute();return'route';}
  ov.innerHTML='';return nextFloor();
}
function chooseRoute(i){const o=run.route&&run.route[i];if(!o)return;run.nodes[run.floor+1]=o;perkRun('node',o.k);run.route=null;ov.innerHTML='';return nextFloor();}
// non-combat floors
function startNode(){
  const f=run.floor,k=nodeK(f);enemyPreview=[];run.results[f]=run.results[f]||null;
  if(k==='event'){if(!run.ev)run.ev={id:pickEvent()};if(SIM.on)return autoEvent();showEvent();}
  else if(k==='center'){if(!run.ev)run.ev={id:'center'};if(SIM.on)return autoEvent();showEvent();}
  else if(k==='shop'){if(!run.ks)run.ks=genKShop();if(SIM.on){run.ks=null;return finishNode();}showKecleon();}
}
function finishNode(){run.ev=null;run.ks=null;run.results[run.floor]=run.results[run.floor]||'event';hideTip();
  if(run.floor>=FLOORS)return guardianDone(true);return afterFloor();}
// an event turning into a battle on the same floor
function nodeToBattle(node){run.nodes[run.floor]=node;run.ev=null;ov.innerHTML='';setupCombatFloor(true);}

/* ================= Route screen ================= */
function showRoute(){
  mode='route';hideTip();const nf=run.floor+1;renderUI();
  const ahead=[5,10,15].find(x=>x>nf);
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner gold">FLOOR ${nf} / ${FLOORS}</div><h1 class="h1">Choose your path</h1>
    <p class="sub">${ahead?`${ahead===15?'The Guardian':'A rival'} waits on floor ${ahead}.`:''} Harder paths pay out more.</p>
    <div class="picks route">${run.route.map((o,i)=>{const N=NODES[o.k];return`<button class="pick win path" data-i="${i}" style="--nc:${N.col}">
      <div class="icon${o.k==='shop'?' kec':''}"><img src="${nodeIcon(o.k)}" alt=""></div><span class="tier" style="background:${N.col}">${N.tag}</span>
      <h2>${N.n}</h2><p>${N.d}</p><div class="rew"><span class="lbl">Reward</span> ${N.r}</div></button>`;}).join('')}</div></div>`;
  ov.querySelectorAll('.path').forEach(b=>b.onclick=()=>chooseRoute(+b.dataset.i));
  saveRun();
}

/* ================= Enhancers ================= */
// One tier. Every enhancer pairs a real stat package with an effect big enough to shape a build.
// d(c,it): c is the holder's combatant (when shown on a Pokémon) so numbers are computed; it is the item (for stacks).
const eA='<span class="s-atk">Attack</span>',eSA='<span class="s-spa">Sp. Atk</span>',eHP='<span class="s-hp">max HP</span>',eDF='<span class="s-def">Defense</span>',eSD='<span class="s-def">Sp. Def</span>',eAS='<span class="s-as">Attack Speed</span>';
const ePH='<span class="s-atk">physical</span>',eSP='<span class="s-spa">special</span>',eTR='<span class="s-true">true</span>';
// "30 + 30% Attack", or with a holder: "123 (30 + 30% Attack)"
function eN(c,base,ratio,stat){const sn={atk:'Attack',spa:'Sp. Atk',hp:'max HP'}[stat],cl={atk:'s-atk',spa:'s-spa',hp:'s-hp'}[stat];
  const f=`${base?base+' + ':''}<span class="${cl}">${Math.round(ratio*100)}% ${sn}</span>`;if(!c)return f;
  const v=base+ratio*(stat==='hp'?c.maxHp:c[stat]);return`<b class="${cl}">${Math.round(v)}</b> <span class="sc">(${f})</span>`;}
const ENH={
  'quick-powder':{n:'Quick Powder',e:{as:.25,qpRamp:.03},d:()=>`+25% ${eAS}. Each basic attack adds +3% ${eAS} for the battle (up to 15 times). At 15 stacks, every attack also ricochets to an enemy within 2 hexes of the target for 50% damage.`},
  'metal-coat':{n:'Metal Coat',e:{def:30,res:30,dr:.1,ironShield:.12},d:c=>`+30 ${eDF} and ${eSD}, and takes 10% less damage. When an enemy move hits it, gains a shield of ${eN(c,0,.12,'hp')} (once every 3s).`},
  'thick-club':{n:'Thick Club',e:{atkP:.35,pctHit:.03,clubStun:.6},d:()=>`+35% ${eA}. Basic attacks deal bonus ${ePH} damage equal to 3% of the target's ${eHP}, and every 5th attack bonks the target, stunning it for 0.6s.`},
  'light-ball':{n:'Light Ball',e:{spaP:.3,mana:15,lightChain:.25},d:()=>`+30% ${eSA} and +15 starting PP. Moves arc lightning to the 2 nearest other enemies for 25% of the damage dealt.`},
  'lucky-punch':{n:'Lucky Punch',e:{crit:.25,critD:.3,abCrit:1,critPP:5},d:()=>`+25% crit chance and +30% crit damage. Moves can crit, and every critical hit restores 5 PP.`},
  'big-root':{n:'Big Root',e:{ls:.2,healAmp:.25,ohShield:.25},d:c=>`Heals for 20% of all damage dealt and its heals are 25% stronger. Healing past full HP becomes a shield, up to ${eN(c,0,.25,'hp')}.`},
  'starf-berry':{n:'Starf Berry',e:{lowAS:.5,lowLs:.2,lowDef:20},d:()=>`While below half HP: +50% ${eAS}, +20% lifesteal and +20 ${eDF}.`},
  'enigma-berry':{n:'Enigma Berry',e:{sitrus:.35,enigma:25},d:c=>`The first time it drops below half HP: heals ${eN(c,0,.35,'hp')}, gains +25 ${eDF} and ${eSD}, and heals allies within 1 hex for 15% of their ${eHP}.`},
  'deep-sea-tooth':{n:'Deep Sea Tooth',e:{as:.15,kraken:1},stack:'triggers',d:(c,it)=>{const st=(it&&it.st)||0;return`+15% ${eAS}. Every 3rd basic attack deals ${eN(c,30,.3,'atk')} bonus ${eTR} damage. <b>Grows:</b> +1% for every time this tooth has triggered this run${st?` (now +${st}%)`:''}.`;}},
  'rare-bone':{n:'Rare Bone',e:{atkF:20},stack:'takedowns',d:(c,it)=>{const st=(it&&it.st)||0;return`+20 ${eA}. Each takedown heals ${eN(c,0,.1,'hp')} and permanently adds +2 ${eA} and ${eSA} to this bone${st?` (now +${2*st})`:''}.`;}},
  'soul-dew':{n:'Soul Dew',e:{mana:20,archangel:.1},d:()=>`+20 starting PP. Every 4 seconds in battle: +10% ${eSA}, stacking for the rest of the fight.`},
  'electric-seed':{n:'Electric Seed',e:{as:.15,chainHit:1},d:c=>`+15% ${eAS}. Every 3rd basic attack chains lightning to the 3 enemies nearest the target for ${eN(c,40,.4,'spa')} ${eSP} damage, paralyzing them for 0.3s.`},
  'black-sludge':{n:'Black Sludge',e:{toxic:1},d:()=>`Basic attacks add 1 Poison and moves add 2; poisoned targets heal a third less. (Poison: 0.3% of the target's ${eHP} per second per stack, up to 20.)`},
  'reaper-cloth':{n:'Reaper Cloth',e:{curse:1},d:()=>`Moves curse the target for 5s. Cursed enemies take 15% more damage from everyone, and when one faints it bursts for 20% of its ${eHP} as ${eSP} damage to enemies within 1 hex.`},
  'smoke-ball':{n:'Smoke Ball',e:{dodgeN:3,dodgePP:10},d:()=>`Dodges the first 3 attacks each battle. Each dodge restores 10 PP and adds +10% ${eAS} for the battle.`},
  'loaded-dice':{n:'Loaded Dice',e:{skillLink:1,hitsB:1,multiAmp:.2,double:.25},d:()=>`Multi-hit moves always land the maximum number of hits plus one and deal +20% damage. Basic attacks have a 25% chance to strike twice.`},
  'ability-shield':{n:'Ability Shield',e:{stunImm:1,aImm:1,res:25,def:10,shieldPP:15},d:()=>`Immune to stuns and status conditions. +25 ${eSD} and +10 ${eDF}. Each stun it shrugs off restores 15 PP (at most once per second).`},
  'red-card':{n:'Red Card',e:{hpF:150,halfShield:.35,redCard:1.2},d:c=>`+150 HP. The first time it drops below half HP: gains a shield of ${eN(c,0,.35,'hp')} and stuns enemies within 1 hex for 1.2s.`},
  'adrenaline-orb':{n:'Adrenaline Orb',e:{adren:.15,killPP:25},d:()=>`Each time an ally faints: +15% ${eAS} and +10% damage for the battle (up to 3 times). Each takedown restores 25 PP.`},
  'room-service':{n:'Room Service',e:{slowAura:.2,shredAura:20},d:()=>`At the start of battle, enemies within 2 hexes lose 20% ${eAS} and 20 ${eDF} and ${eSD} for 8 seconds.`},
  'charcoal':{n:'Charcoal',e:{onBurn:1,abBurn:3,burnDmg:.25},d:()=>`Basic attacks add 1 Burn and moves add 3. Burns it applies deal +25% damage. (Burn: 0.25% of the target's ${eHP} per second per stack, and it deals 15% less ${ePH} damage.)`},
  'toxic-orb':{n:'Toxic Orb',e:{onPsn:1,abPsn:3,vsPsn:.1},d:()=>`Basic attacks add 1 Poison and moves add 3. Deals +10% damage to poisoned enemies. (Poison: 0.3% of the target's ${eHP} per second per stack, and its healing is cut by a third.)`},
  'cell-battery':{n:'Cell Battery',e:{onPara:1,abPara:3,as:.1},d:()=>`+10% ${eAS}. Basic attacks add 1 Paralysis and moves add 3. (Paralysis: −5% ${eAS} per stack, up to 10.)`},
  'never-melt-ice':{n:'Never-Melt Ice',e:{onChill:1,abChill:2,vsChill:.15},d:()=>`Basic attacks add 1 Chill and moves add 2. Deals +15% damage to chilled enemies. (Chill: −4% ${eDF} and ${eSD} per stack, up to 10.)`},
  'twisted-spoon':{n:'Twisted Spoon',e:{abConf:3,spaP:.15},d:()=>`+15% ${eSA}. Moves add 3 Confusion. (Confusion: each attack has an 10% chance per stack to hurt itself instead.)`},
  'miracle-seed':{n:'Miracle Seed',e:{onSeed:1,abSeed:2,seedHeal:.5},d:()=>`Basic attacks plant 1 Leech Seed and moves plant 2. Its seeds heal it 50% more. (Leech Seed: drains 0.3% of the target's ${eHP} per second per stack into whoever planted it.)`},
  'sacred-ash':{n:'Sacred Ash',e:{revive:.5,ashFull:.25},d:c=>`Revives once with ${eN(c,0,.5,'hp')} and full PP, then deals +25% damage for the rest of the battle.`},
};
const enhText=(k,c,it)=>ENH[k]?ENH[k].d(c||null,it):'';
// computed numbers for completed items whose effect depends on the holder's stats
const hpN=(c,p)=>`<b class="s-hp">${Math.round(c.maxHp*p)}</b>`;
const ITEMCALC={
  SU:c=>`Every 3rd attack zaps up to 3 enemies for ${eN(c,60,.3,'spa')} ${eSP} damage.`,
  II:c=>`Melee attackers take ${hpN(c,.06)} damage per hit.`,
  IU:c=>`Battle-start shield: ${hpN(c,.18)} (also on adjacent allies, based on their HP).`,
  IH:c=>`Heals ${hpN(c,.35)} below half HP, once per battle.`,
  HH:c=>`Restores ${hpN(c,.03)} HP per second.`,
  ZH:()=>`Adjacent allies restore 2% of their max HP per second.`,
  PC:c=>`Each attack costs ${hpN(c,.02)} HP.`,
  CH:()=>`Adds 4 Burn per hit (0.25% of the target's max HP per second per stack).`,
  UD:()=>`Lasts the first 6 seconds of battle.`,
};
function itemCalc(it,c){const out=[];if(c&&ITEMCALC[it.k])out.push(ITEMCALC[it.k](c));if(it.enh&&ENH[it.enh])out.push(`<span class="enhl">${ENH[it.enh].n}: ${enhText(it.enh,c,it)}</span>`);return out.length?`<br><span class="calc">${out.join('<br>')}</span>`:'';}
const isEnh=it=>typeof it.k==='string'&&it.k.startsWith('enh:');
const enhKey=it=>it.k.slice(4);
function enhDef(it){const k=enhKey(it),E=ENH[k];return{id:k,n:E.n,d:E.d(null,it)};}
// Signature enhancers are rarer: about 40% of rolls
const rollEnh=()=>pick(Object.keys(ENH));
function enhChoices(n){return shuffle(Object.keys(ENH)).slice(0,n);}
const canEnhance=it=>isCraft(it)&&!it.enh;
function applyEnh(enh,target){if(!canEnhance(target))return false;target.enh=enhKey(enh);return true;}
function enhOnUnit(bi,u){
  const it=run.bag[bi],tg=u.items.find(canEnhance);
  if(!tg){toast(u.items.some(isCraft)?`${nameOf(u)}'s items are already enhanced.`:`${nameOf(u)} needs a completed item to enhance.`);return false;}
  applyEnh(it,tg);run.bag.splice(bi,1);
  if(!SIM.on){const p=locate(u);burst(p.x,p.y-12,'#5fe0c8',22,1.2);toast(`${ENH[tg.enh].n} enhanced ${itemName(tg)} on ${nameOf(u)}!`);}
  renderUI();return true;
}
function enhInBag(i,j){const a=run.bag[i],b=run.bag[j];
  if(isEnh(b)&&!isEnh(a))return enhInBag(j,i);
  if(!isEnh(a)||!b)return false;if(!canEnhance(b)){toast(isCraft(b)?'That item already has an enhancer.':'Enhancers go on completed items.');return true;}
  applyEnh(a,b);run.bag.splice(i,1);if(!SIM.on)toast(`Enhanced ${itemName(b)} with ${ENH[b.enh].n}!`);renderUI();return true;}
function showEnhPick(){
  mode='reward';hideTip();
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner enh">ENHANCER</div><h1 class="h1">Choose an enhancer</h1><p class="sub">Drag an enhancer onto a completed item (in your bag or on a Pokémon) to add its effect. One per item.</p>
    <div class="picks">${run.enhChoices.map((k,i)=>itemCard({k:'enh:'+k,mut:[]},i)).join('')}</div><button class="btn skip" id="skip">Skip and take ₽3</button></div>`;
  ov.querySelectorAll('.pick').forEach(b=>b.onclick=()=>{if(run.bag.length>=BAGMAX){toast('Your bag is full.');return;}run.bag.push({k:'enh:'+run.enhChoices[+b.dataset.i],mut:[]});run.enhChoices=null;afterFloor();});
  $('skip').onclick=()=>{run.gold+=3;run.enhChoices=null;afterFloor();};
  saveRun();
}

/* ================= Unit mutators ================= */
const MUTCOL={shiny:'#ffe27a',blazing:'#ff7a3c',vampiric:'#c8304a',swift:'#7fe0ff',sturdy:'#b8c4cf',charged:'#ffe14d',lucky:'#7dff7a',golden:'#f5c645',growing:'#8ed16a',thorny:'#5c9a4a',blessed:'#fff6d0',shadow:'#7a3fd0'};
const KFILTER={shiny:'hue-rotate(260deg) saturate(1.3)',blazing:'sepia(1) saturate(4) hue-rotate(-25deg)',vampiric:'hue-rotate(230deg) saturate(1.6) brightness(.8)',swift:'hue-rotate(60deg) saturate(1.2)',
  sturdy:'grayscale(.75) brightness(1.1)',charged:'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.2)',lucky:'hue-rotate(-30deg) saturate(1.7)',golden:'sepia(1) saturate(2.6) brightness(1.15)',
  growing:'hue-rotate(-60deg) saturate(1.3)',thorny:'hue-rotate(100deg) saturate(.8)',blessed:'brightness(1.35) saturate(.5)',shadow:'brightness(.45) saturate(1.8) hue-rotate(200deg)'};
const unitMutName=u=>u&&u.mut&&MUTS[u.mut]?MUTS[u.mut].n:'';
function drawUnitAura(s,t){
  const u=s.cu?s.cu.u:s.pu;if(!u||(s.cu&&s.cu.dead))return;const sc=s.sc||1;
  const cu=s.cu;
  if(cu&&cu.protT>combatT){ctx.strokeStyle=`rgba(214,140,255,${.7+.2*Math.sin(t*10)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(s.x,s.y-10*sc,15*sc,18*sc,0,0,7);ctx.stroke();ctx.fillStyle='rgba(200,107,214,.18)';ctx.fill();}
  if(cu&&cu.markT>combatT){const y=s.y-34*sc;ctx.strokeStyle='#ff7ad9';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(s.x,y,6,3,0,0,7);ctx.stroke();ctx.fillStyle='#ff7ad9';ctx.fillRect(Math.round(s.x)-1,Math.round(y)-1,2,2);}
  if(cu&&cu.curseT>combatT&&Math.random()<.2)fx.push({x:s.x+rnd(-6,6),y:s.y-rnd(6,20),vx:0,vy:-16,life:.5,max:.5,col:'#9b6bff',sz:1,g:0});
  if(u.alpha||u.tgt){const pulse=.22+.1*Math.sin(t*5);ctx.fillStyle=u.alpha?`rgba(255,60,40,${pulse})`:`rgba(120,190,255,${pulse})`;ctx.beginPath();ctx.ellipse(s.x,s.y-10*sc,15*sc,19*sc,0,0,7);ctx.fill();}
  if(u.mut&&MUTCOL[u.mut]){const c=hex2rgb(MUTCOL[u.mut]),a=u.mut==='shadow'?.42:.28,pulse=a+.1*Math.sin(t*4+u.uid);
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${pulse})`;ctx.beginPath();ctx.ellipse(s.x,s.y-9*sc,12*sc,16*sc,0,0,7);ctx.fill();
    if(Math.random()<(u.mut==='shadow'?.25:.08))fx.push({x:s.x+rnd(-8,8)*sc,y:s.y-rnd(4,22)*sc,vx:0,vy:-14,life:.6,max:.6,col:u.mut==='shadow'?'#3a1670':MUTCOL[u.mut],sz:u.mut==='shadow'?2:1,g:0});}
}
function drawRouteHud(t){
  if(!battle||!run||(mode!=='combat'&&mode!=='result'))return;const nk=battle.node;if(nk!=='endurance'&&nk!=='timeattack')return;
  let txt,col='#ffe27a';
  if(nk==='endurance'){const s=Math.min(END_LIMIT,battle.survT??combatT),nx=END_T.find(x=>s<x);txt=`Survived ${s.toFixed(1)}s`+(nx?` · next reward at ${nx}s`:' · Gold!');if(s<END_T[0])col='#ff9a8a';}
  else{const s=battle.clearT??combatT,nx=[...TA_T].reverse().find(x=>s<=x);txt=`${s.toFixed(1)}s`+(nx?` · ${nx===TA_T[2]?'Gold':nx===TA_T[1]?'Silver':'Bronze'} if under ${nx}s`:' · Out of time');
    const tg=units.find(u=>u.isTgt&&!u.dead);if(tg){const bob=Math.sin(t*6)*2,q=w2s(tg.x,tg.y-48*(tg.scaleShown||1)),x=Math.round(q.x*2),y=Math.round(q.y*2)+bob*2;ctx.fillStyle='#1b2430';ctx.beginPath();ctx.moveTo(x-12,y-14);ctx.lineTo(x+12,y-14);ctx.lineTo(x,y);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.moveTo(x-8,y-12);ctx.lineTo(x+8,y-12);ctx.lineTo(x,y-3);ctx.closePath();ctx.fill();}}
  ctx.font='32px PokeEmerald,"Pixelify Sans",sans-serif';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#1b2430';ctx.strokeText(txt,640,450);ctx.fillStyle=col;ctx.fillText(txt,640,450);
}

/* ================= Kecleon shop ================= */
const KPRICE={unit:c=>c+2,comp:4,craft:9,enh:8,relic:12,use:3,mut:2};
function genKShop(){
  const mutated=Math.random()<.25,mut=mutated?pick(Object.keys(MUTS)):null;
  const rm=base=>mutated?(Math.random()<.7?[mut]:[]):rollMut(base);
  const stock=[];
  const o=LVODDS[run.level];
  for(let i=0;i<2;i++){const c=rollCostFor(o),root=pick(MODE.byCost[c-1]);const m=mutated?(Math.random()<.7?mut:null):(Math.random()<.25?pick(Object.keys(MUTS)):null);
    stock.push({t:'unit',root,mut:m,price:KPRICE.unit(c)+(m?KPRICE.mut:0)});}
  for(let i=0;i<2;i++){const it=mkComp(randComp(),rm(.2));stock.push({t:'item',it,price:KPRICE.comp+(it.mut.length?KPRICE.mut:0)});}
  {const it={k:randCraft(),mut:rm(.3)};stock.push({t:'item',it,price:KPRICE.craft+(it.mut.length?KPRICE.mut:0)});}
  for(const k of [rollEnh(),rollEnh()])stock.push({t:'item',it:{k:'enh:'+k,mut:[]},price:KPRICE.enh});
  {const r=shuffle(Object.keys(RELICS).filter(x=>!run.relics.includes(x)))[0];if(r)stock.push({t:'relic',id:r,price:KPRICE.relic});}
  stock.push({t:'item',it:{k:pick(Math.random()<.3?['eject-pack']:USE_COMMON),mut:[]},price:KPRICE.use});
  if(Math.random()<.5)stock.push({t:'item',it:rollPlate(),price:10});
  return{mut,stock};
}
function kBuy(i){
  const s=run.ks.stock[i];if(!s||s.sold)return;
  if(run.gold<s.price){toast('Kecleon: "You don\'t have enough money!"');return;}
  if(s.t==='unit'){const slot=run.bench.indexOf(null);if(slot<0){toast('Your bench is full.');return;}const u=mkUnit(s.root);u.mut=s.mut||undefined;run.bench[slot]=u;ensure(s.root);}
  else if(s.t==='item'){if(run.bag.length>=BAGMAX){toast('Your bag is full.');return;}run.bag.push(JSON.parse(JSON.stringify(s.it)));}
  else if(s.t==='relic')run.relics.push(s.id);
  run.gold-=s.price;s.sold=1;
  if(s.t==='unit')combine();
  renderUI();showKecleon();
}
function kCardName(s){if(s.t==='unit')return(s.mut?MUTS[s.mut].n+' ':'')+D[s.root].n;if(s.t==='relic')return RELICS[s.id].n;return itemName(s.it);}
function kCardIcon(s){if(s.t==='unit')return por(s.root);if(s.t==='relic')return iconOf(s.id);return iconOf(itemDef(s.it).id);}
function kCardTag(s){if(s.t==='unit')return`Pokémon · ₽${MODE.lines[s.root].cost}`;if(s.t==='relic')return'Relic';const t=itemTier(s.it);return t==='common'?'Component':t==='epic'?'Completed':t==='enh'?'Enhancer':'Consumable';}
function showKecleon(){
  mode='kshop';hideTip();if(!SIM.on)music('kecleon');const K=run.ks,M=K.mut?MUTS[K.mut]:null;
  const line=M?`Heh heh... Today everything has a certain ${M.n.toLowerCase()} touch. ${M.d}.`:'Welcome! Take your time and buy whatever you like!';
  ov.innerHTML=`<div class="scrim"></div><div class="screen kshop">
    <div class="win khead${M?' mutated':''}" style="${M?`--mc:${MUTCOL[K.mut]}`:''}"><img class="kpor" src="${por(KECLEON)}" alt="" style="${M?`filter:${KFILTER[K.mut]}`:''}"><div><div class="lbl">${M?'Mutated shop':'Kecleon Shop'}</div><h2>${M?M.n+' ':''}Kecleon</h2><p>${esc(line)}</p></div><div class="kgold"><span class="lbl">Your money</span><b>₽${run.gold}</b></div></div>
    <div class="kgrid">${K.stock.map((s,i)=>`<button class="win kcard${s.sold?' sold':''}${run.gold<s.price&&!s.sold?' poor':''}${s.t==='unit'?' unit':''}" data-k="${i}" ${s.sold?'disabled':''}>
      <div class="kic${s.t==='relic'?' relic':''}${s.t==='item'&&isEnh(s.it)?' enh':''}"><img src="${kCardIcon(s)}" alt="">${(s.t==='unit'?s.mut:s.t==='item'&&s.it.mut.length)?'<i class="mutdot"></i>':''}</div>
      <div class="kinfo"><span class="lbl">${kCardTag(s)}</span><b>${esc(kCardName(s))}</b></div><span class="kprice">${s.sold?'Sold':'₽'+s.price}</span></button>`).join('')}</div>
    <button class="btn go" id="kleave">Leave the shop</button></div>`;
  ov.querySelectorAll('.kcard').forEach(b=>{b.onclick=()=>kBuy(+b.dataset.k);
    b.onpointermove=e=>{const s=K.stock[+b.dataset.k];if(s.t==='unit'){const u=mkUnit(s.root);u.mut=s.mut;showTip(u,e);}else if(s.t==='relic')showInfoTip(`<div class="top"><img src="${iconOf(s.id)}" alt="" style="width:48px;height:48px"><div><div class="lbl">Relic</div><h3 style="font-size:24px">${RELICS[s.id].n}</h3></div></div><div class="ab"><p>${RELICS[s.id].d}</p></div>`,e);else showItemTip(s.it,e);};
    b.onpointerleave=hideTip;});
  $('kleave').onclick=()=>{hideTip();finishNode();};
  saveRun();
}

/* ================= Events ================= */
const gainBag=it=>{if(run.bag.length>=BAGMAX){run.gold+=2;return`Your bag was full, so you sold ${itemName(it)} for ₽2.`;}run.bag.push(it);return`You got ${itemName(it)}.`;};
const loseHp=n=>{run.hp=Math.max(1,run.hp-n);return`You lost ${n} HP.`;};
const healHp=n=>{const h=Math.min(n,run.maxHp-run.hp);run.hp+=h;return`You recovered ${h} HP.`;};
const benchRoom=()=>run.bench.indexOf(null)>=0;
function giveUnit(root,star=1,mut){const slot=run.bench.indexOf(null);if(slot<0)return null;const u=mkUnit(root);u.mut=mut||undefined;run.bench[slot]=u;if(!SIM.on)ensure(root);
  for(let s=2;s<=star;s++){u.star=s;evolveStep(u);}combine();return u;}
const lineRootOf=dex=>Object.keys(MODE.lines).map(Number).find(r=>MODE.lines[r].mem.includes(dex));
const strongest=()=>allOwned().sort((a,b)=>lineOf(b).cost*b.star*b.star-lineOf(a).cost*a.star*a.star)[0];
const EVENTS={
  snorlax:{n:'A Snorlax blocks the path',img:()=>por(143),txt:'A huge Snorlax is fast asleep across the trail. It doesn\'t look like it will move any time soon.',
    opts:[{t:'Sneak around it',d:'50%: find an item. 50%: it rolls onto you (−8 HP).',fn:()=>Math.random()<.5?'You slip past and find something it was sleeping on. '+gainBag(mkComp(randComp(),rollMut(.25))):'It rolls over in its sleep, right onto you! '+loseHp(8)},
      {t:'Leave it a berry',d:'Pay ₽4. It might leave something behind.',cost:4,fn:()=>{run.gold-=4;return'It munches the berry and rolls away, revealing a completed item. '+gainBag({k:randCraft(),mut:rollMut(.3)});}},
      {t:'Wake it up!',d:'Fight it as an Alpha. Enhancer if you win.',ok:()=>!!lineRootOf(143)&&(!MODE.gen||MODE.gen===1),fn:()=>{nodeToBattle({k:'alpha',force:143});return null;}},
      {t:'Leave it be',d:'Turn back and take the long way around.',fn:()=>'You tiptoe back the way you came. The snoring fades behind you.'}]},
  egg:{n:'A Mysterious Egg',img:()=>iconOf('mystery-egg'),txt:'An Egg is resting alone in the tall grass. It\'s warm, and something inside is moving.',
    opts:[{t:'Take the Egg',d:'It hatches into one of the priciest Pokémon your level can find (needs bench space).',ok:benchRoom,fn:()=>{const top=maxCostAt(run.level);const root=pick([...MODE.byCost[top-1],...(top>1?MODE.byCost[top-2]:[])]);giveUnit(root);return`It hatched into ${D[root].n}! It joined your bench.`;}},
      {t:'Return it to its owner',d:'+₽4 and +5 HP.',fn:()=>{run.gold+=4;return'You find a Breeder searching the grass nearby. They thank you with ₽4 and a snack. '+healHp(5);}},
      {t:'Leave it alone',d:'Its parent is probably nearby.',fn:()=>'You leave the Egg where it is. Something rustles in the bushes as you walk away.'}]},
  berry:{n:'A Berry Tree',img:()=>iconOf('sitrus-berry'),txt:'A Berry tree heavy with fruit stands in a sunny patch of the clearing.',
    opts:[{t:'Pick some Berries',d:'+15 HP.',fn:()=>'The Berries are sweet and ripe. '+healHp(15)},
      {t:'Shake it hard',d:'60%: two components. 40%: something falls on you.',fn:()=>Math.random()<.6?'Two things fall out of the branches! '+gainBag(mkComp(randComp(),[]))+' '+gainBag(mkComp(randComp(),[])):'A startled Pokémon drops on your head! '+loseHp(10)+' '+gainBag(mkComp(randComp(),[]))},
      {t:'Take a cutting',d:'Gain a Potion.',fn:()=>'You carefully take a cutting and brew it into medicine. '+gainBag({k:'potion',mut:[]})},
      {t:'Walk on',d:'Leave the tree be.',fn:()=>'You leave the tree for the wild Pokémon.'}]},
  trade:{n:'A traveling trader',img:()=>iconOf('luxury-ball'),txt:'A trainer with a backpack full of Poké Balls offers to trade. "Your weakest for something better? Deal?"',
    opts:[{t:'Trade',d:'Your cheapest 1★ Pokémon for a 1★ one costing ₽1 more.',ok:()=>allOwned().some(u=>u.star===1),fn:()=>{const mine=allOwned().filter(u=>u.star===1).sort((a,b)=>lineOf(a).cost-lineOf(b).cost)[0];const c=Math.min(maxCostAt(run.level),lineOf(mine).cost+1);const root=pick(MODE.byCost[c-1]);
        const nm=nameOf(mine);for(const it of mine.items)run.bag.push(it);const loc=locate(mine);const nu=mkUnit(root);nu.mut=mine.mut;if(loc.kind==='board')run.board[loc.c+','+loc.r]=nu;else run.bench[loc.i]=nu;if(!SIM.on)ensure(root);combine();return`You traded ${nm} for ${D[root].n}!`;}},
      {t:'Decline',d:'Nothing happens.',fn:()=>'"Suit yourself!" The trader wanders off.'}]},
  tutor:{n:'The Move Tutor',img:()=>iconOf('tm-normal'),txt:'An old Move Tutor offers lessons. "I can teach your Pokémon to hit harder. For a price."',
    opts:[{t:'Private lesson',d:'₽5: your strongest Pokémon gets +20 Attack and Sp. Atk for the run.',cost:5,ok:()=>allOwned().length>0,fn:()=>{run.gold-=5;const u=strongest();u.g.atk=(u.g.atk||0)+20;u.g.spa=(u.g.spa||0)+20;return`${nameOf(u)} learned to hit harder!`;}},
      {t:'Group lesson',d:'₽12: every Pokémon on the field gets +8 Attack and Sp. Atk.',cost:12,ok:()=>Object.keys(run.board).length>0,fn:()=>{run.gold-=12;for(const u of Object.values(run.board)){u.g.atk=(u.g.atk||0)+8;u.g.spa=(u.g.spa||0)+8;}return'Your whole team trained together.';}},
      {t:'No thanks',d:'Leave.',fn:()=>'"Come back when you\'re serious."'}]},
  daycare:{n:'The Day Care',img:()=>iconOf('premier-ball'),txt:'A kindly couple runs a Day Care by the path. "We can raise one of your Pokémon in no time."',
    opts:[{t:'Raise a Pokémon',d:'₽7: your best 1★ Pokémon becomes 2★ and evolves.',cost:7,ok:()=>allOwned().some(u=>u.star===1),fn:()=>{run.gold-=7;const u=allOwned().filter(x=>x.star===1).sort((a,b)=>lineOf(b).cost-lineOf(a).cost)[0];const nm=nameOf(u);u.star=2;evolveStep(u);combine();return`${nm} grew to 2★!`;}},
      {t:'Drop by for tea',d:'+8 HP.',fn:()=>'The old couple pours you a cup of tea. '+healHp(8)},
      {t:'Keep walking',d:'Leave.',fn:()=>'You wave as you pass the Day Care fence.'}]},
  gamecorner:{n:'Game Corner',img:()=>iconOf('coin-case'),txt:'Someone has set up a slot machine in the middle of the forest. It\'s blinking invitingly.',
    opts:[{t:'Play slots',d:'₽3: 15% for ₽20, 35% for ₽6.',cost:3,fn:()=>{run.gold-=3;const x=Math.random();if(x<.15){run.gold+=20;return'Jackpot! You won ₽20!';}if(x<.5){run.gold+=6;return'Three Cherries. You won ₽6.';}return'No luck this time.';}},
      {t:'Bet big',d:'₽10: 30% chance for ₽30.',cost:10,fn:()=>{run.gold-=10;if(Math.random()<.3){run.gold+=30;return'Triple 7s! You won ₽30!';}return'The machine eats your coins.';}},
      {t:'Walk away',d:'Leave.',fn:()=>'You walk past without looking back.'}]},
  ruins:{n:'Unown Ruins',img:()=>por(201),txt:'Strange letters cover a crumbling stone wall. A cluster of Unown hums as you approach.',
    opts:[{t:'Decipher the wall',d:'Gain an enhancer, but lose 5 HP.',fn:()=>'The letters rearrange into a word you somehow understand. '+gainBag({k:'enh:'+rollEnh(),mut:[]})+' '+loseHp(5)},
      {t:'Take the stone tablet',d:'Gain a random relic, but lose 12 HP.',ok:()=>run.hp>14&&Object.keys(RELICS).some(r=>!run.relics.includes(r)),fn:()=>{const r=pick(Object.keys(RELICS).filter(x=>!run.relics.includes(x)));run.relics.push(r);return`You got the ${RELICS[r].n}! The Unown lash out. `+loseHp(12);}},
      {t:'Leave quietly',d:'Nothing happens.',fn:()=>'The humming fades behind you.'}]},
  shrine:{n:'A forest shrine',img:()=>iconOf('odd-keystone'),txt:'A small, mossy shrine sits between two roots. People have left offerings here.',
    opts:[{t:'Make an offering',d:'₽6: every item on your strongest Pokémon becomes Blessed.',cost:6,ok:()=>allOwned().some(u=>u.items.some(i=>!isGim(i)&&!isFormItem(i))),fn:()=>{run.gold-=6;const u=allOwned().filter(x=>x.items.length).sort((a,b)=>b.items.length-a.items.length)[0];for(const it of u.items)if(!(it.mut||[]).includes('blessed')&&(it.mut||[]).length<2)it.mut=[...(it.mut||[]),'blessed'];return`A soft light settles on ${nameOf(u)}'s items.`;}},
      {t:'Pray',d:'+10 HP.',fn:()=>'A calm breeze passes through the clearing. '+healHp(10)},
      {t:'Leave it',d:'Nothing happens.',fn:()=>'You bow your head and move on.'}]},
  rocket:{n:'Team Rocket ambush!',img:()=>por(52),txt:'"Prepare for trouble!" A pair of grunts and their Meowth block the trail and demand your money.',
    opts:[{t:'Battle them',d:'A Challenge battle. +₽5 if you win.',fn:()=>{nodeToBattle({k:'challenge',bonus:5,rocket:1});return null;}},
      {t:'Pay them off',d:'Lose ₽5.',fn:()=>{const g=Math.min(5,run.gold);run.gold-=g;return`They grab ₽${g} and blast off.`;}},
      {t:'Run for it',d:'Lose 6 HP.',fn:()=>'You escape, scraped up. '+loseHp(6)}]},
  fossil:{n:'A fossil lab',img:()=>iconOf('old-amber'),txt:'A scientist has set up a tent with a strange machine. "I found this fossil nearby. Shall I revive it?"',
    opts:[{t:'Revive it',d:'₽6: gain a Pokémon (a fossil line if this region has one).',cost:6,ok:benchRoom,fn:()=>{run.gold-=6;const fos=FOSSIL_IDS.map(lineRootOf).filter(r=>r&&MODE.lines[r]);const root=fos.length?pick(fos):pick(MODE.byCost[2]);giveUnit(root);return`The machine whirs... ${D[root].n} joined your bench!`;}},
      {t:'Sell it to them',d:'+₽5.',fn:()=>{run.gold+=5;return'The scientist happily pays ₽5.';}},
      {t:'Leave the lab',d:'Nothing happens.',fn:()=>'"Your loss!" The machine keeps humming as you leave.'}]},
  grotto:{n:'A hidden grotto',img:()=>iconOf('poke-ball'),txt:'Three Poké Balls lie in a quiet grotto behind the trees. You only have room for one.',
    opts:['Left','Middle','Right'].map(s=>({t:`Take the ${s.toLowerCase()} one`,d:'Could be anything.',fn:()=>{const x=Math.random();
      if(x<.25)return'It\'s a completed item! '+gainBag({k:randCraft(),mut:rollMut(.3)});if(x<.45)return'It\'s an enhancer! '+gainBag({k:'enh:'+rollEnh(),mut:[]});
      if(x<.7)return'It\'s a component. '+gainBag(mkComp(randComp(),rollMut(.3)));if(x<.85)return'It\'s a consumable. '+gainBag({k:pick(USE_COMMON),mut:[]});run.gold+=8;return'It\'s full of coins: ₽8!';}})).concat([{t:'Leave them',d:'Someone may be coming back for these.',fn:()=>'You leave the grotto as you found it.'}])},
  cipher:{n:'A shadowy lab',img:()=>iconOf('dusk-ball'),txt:'A Cipher admin steps out of a dark tent. "I can unlock the hidden power in your Pokémon. There is a small... cost."',
    opts:[{t:'Accept',d:'A random Pokémon on the field becomes Shadow: +15% damage, takes 5% more damage.',ok:()=>Object.values(run.board).some(u=>!u.mut),fn:()=>{const u=pick(Object.values(run.board).filter(x=>!x.mut));u.mut='shadow';return`${nameOf(u)} is wreathed in dark energy. It's now Shadow ${nameOf(u)}.`;}},
      {t:'Take a sample instead',d:'Gain a Shadow component.',fn:()=>gainBag(mkComp(randComp(),['shadow']))},
      {t:'Refuse',d:'Leave.',fn:()=>'"You\'ll regret this." The tent is gone when you look back.'}]},
  stone:{n:'A glowing stone',img:()=>iconOf(run.gimmick?GIMMICKS[run.gimmick].key:'odd-keystone'),txt:'Something buried in the roots is glowing with the same light as your key item.',need:()=>gimList().length>0,
    opts:[{t:'Dig it up',d:'Gain an item for your generation gimmick.',fn:()=>{const g=gimLootItem();return g?gainBag(g):'It crumbles to dust.';}},
      {t:'Leave it',d:'Nothing happens.',fn:()=>'You leave it to glow in peace.'}]},
  center:{n:'Pokémon Center',img:()=>iconOf('max-potion'),txt:'"Welcome to the Pokémon Center! We restore your tired Pokémon to full health." Choose one service.',
    opts:[{t:'Rest',d:'Restore 25% of your Trainer HP.',fn:()=>'Nurse Joy patches up your team. '+healHp(Math.round(run.maxHp*.25))},
      {t:'Train',d:'+6 XP.',ok:()=>run.level<MAXLV,fn:()=>{gainXP(6);return`You trained hard. You're now trainer level ${run.level}.`;}},
      {t:'Pick up supplies',d:'Gain two random consumables.',fn:()=>'The Poké Mart counter has a few spare things. '+gainBag({k:pick(USE_COMMON),mut:[]})+' '+gainBag({k:pick(USE_COMMON),mut:[]})},
      {t:'Just pass through',d:'Nothing happens.',fn:()=>'You wave to Nurse Joy and head back out.'}]},
};
function pickEvent(){const ids=Object.keys(EVENTS).filter(k=>k!=='center'&&!run.seenEv.includes(k)&&(!EVENTS[k].need||EVENTS[k].need()));const id=ids.length?pick(ids):'grotto';run.seenEv.push(id);return id;}
const optOk=o=>(!o.cost||run.gold>=o.cost)&&(!o.ok||o.ok());
function evChoose(i){
  const E=EVENTS[run.ev.id],o=E.opts[i];if(!o||!optOk(o)||run.ev.res)return;
  const res=o.fn();if(res===null)return; // became a battle
  run.ev.res=res;run.ev.pick=i;renderUI();if(!SIM.on)showEvent();
}
function autoEvent(){const E=EVENTS[run.ev.id];const ok=E.opts.map((o,i)=>i).filter(i=>optOk(E.opts[i]));if(run.ev.id==='center')evChoose(run.hp<run.maxHp*.6?0:1);else if(ok.length)evChoose(pick(ok));if(mode==='plan'||mode==='combat')return;return finishNode();}
function showEvent(){
  mode='event';hideTip();const E=EVENTS[run.ev.id],ev=run.ev;
  ov.innerHTML=`<div class="scrim"></div><div class="screen"><div class="tierbanner ${ev.id==='center'?'center':'event'}">${ev.id==='center'?'POKÉMON CENTER':'EVENT'} · FLOOR ${run.floor}</div>
    <div class="win event"><div class="evimg"><img src="${E.img()}" alt=""></div><div class="evbody"><h2>${esc(E.n)}</h2><p>${esc(E.txt)}</p>
    ${ev.res?`<p class="evres">${esc(ev.res)}</p><button class="btn go" id="evgo">Continue</button>`:
      `<div class="evopts">${E.opts.map((o,i)=>`<button class="evopt" data-i="${i}" ${optOk(o)?'':'disabled'}><b>${esc(o.t)}</b><span>${esc(o.d)}</span></button>`).join('')}</div>`}</div></div></div>`;
  ov.querySelectorAll('.evopt').forEach(b=>b.onclick=()=>evChoose(+b.dataset.i));
  if(ev.res){$('evgo').onclick=finishNode;$('evgo').focus();}
  saveRun();
}
