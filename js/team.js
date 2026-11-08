"use strict";
/* PokéRun Tactics — team strategies and the perk hooks they share with augments.
   When a run starts you're offered 3 team strategies (one reroll per card) and lock one in for the whole run. The 14 type
   strategies live in data.js; the general ones (money, battle, safety, shop, XP and item helpers, like small augments) are
   built from INVDEF below. INVDEF also keeps every older card so saves from before the change still load.

   Hooks (shared with augments, see perks()): gain() on pick · floor() each floor · inc(pay) extra floor income ·
   after(win,fought) after a battle · buy(u) · sell(u) · reroll() · level(lv) · combine(u) · act() a new act ·
   chest() · start(mine,foes) · kill(src,tg) · fall(tg) · numbers: cap, pad, per, imin, streak, rr, xpc, xpp,
   sell(u), price(root), hpLoss · free(root) · show() a short status for the run panel. */

const S=id=>{run.invS=run.invS||{};return run.invS[id]=run.invS[id]||{};};
const onField=()=>Object.values(run.board);
const randRoot=c=>pick(MODE.byCost[c-1]&&MODE.byCost[c-1].length?MODE.byCost[c-1]:MODE.byCostAll[c-1]);
const topCost=()=>{let c=1;for(let i=0;i<5;i++)if(LVODDS[run.level][i]>0)c=i+1;return c;};
const addComp=()=>{if(run.bag.length<BAGMAX)run.bag.push(mkComp(randComp(),[]));};
const addCraft=()=>{if(run.bag.length<BAGMAX)run.bag.push({k:randCraft(),mut:[]});};
const say=t=>{if(!SIM.on)toast(t);};

const INVDEF=[
  /* ----- steady income ----- */
  {id:'thrifty',icon:'berry-pots',name:'Thrifty',d:'If you have less than ₽15 when income arrives, gain ₽6.',inc:()=>run.gold<15?6:0},
  {id:'travellight',icon:'air-balloon',name:'Travel Light',d:'If your bench is empty when income arrives, gain ₽6.',inc:()=>run.bench.every(x=>!x)?6:0},
  {id:'stockpile',icon:'box-gold',name:'Stockpile',d:'If your bench is full when income arrives, gain ₽5.',inc:()=>run.bench.every(Boolean)?5:0},
  {id:'goldrush',icon:'big-nugget',name:'Gold Rush',d:'+₽5 income every floor, but rerolls cost ₽1 more.',inc:()=>5,rr:1},
  {id:'compound',icon:'amulet-coin',name:'Compound Interest',d:'Interest pays ₽1 for every ₽6 you have instead of ₽10, and its cap rises by ₽1.',per:6,cap:1},
  {id:'hypercompound',icon:'relic-crown',name:'Hypercompound',d:'Interest has no cap of ₽5 any more: it keeps paying ₽1 per ₽10, up to ₽15.',cap:10},
  {id:'patron',icon:'leaders-crest',name:'Patron of the Arts',d:'Your interest and streak gold are both doubled, but your base income is ₽4 lower.',inc:()=>-4+interestOf()+streakGold()},
  /* ----- payouts that mature ----- */
  {id:'trustfund',icon:'luxury-ball',name:'Trust Fund',d:'Gain ₽20 now and ₽30 at the start of every new act.',gain(){run.gold+=20;},act(){run.gold+=30;say('Trust Fund: +₽30');}},
  {id:'printer',icon:'nugget',name:'Money Printer',d:'Pays ₽1 at the next floor, then ₽1 more at every floor after that (up to ₽6 a floor).',
    inc:p=>{const s=S('printer'),g=Math.min(6,(s.n||0)+1);if(p)s.n=g;return g;},show:()=>`₽${Math.min(6,(S('printer').n||0)+1)} next floor`},
  {id:'nestegg',icon:'mystery-egg',name:'Nest Egg',d:'₽20 of your gold is locked away (when you have it) and grows 22% every floor. After 6 floors it hatches for about ₽66, and a new egg is laid.',
    gain(){this.lay();},lay(){const s=S('nestegg');if(run.gold>=20){run.gold-=20;s.v=20;s.n=0;}},
    floor(){const s=S('nestegg');if(!s.v)return this.lay();s.v*=1.22;s.n++;if(s.n>=6){const g=Math.round(s.v);run.gold+=g;s.v=0;say(`Nest Egg hatched: +₽${g}!`);}},show:()=>S('nestegg').v?`₽${Math.round(S('nestegg').v)} · ${6-S('nestegg').n} floor(s)`:'waiting for ₽20'},
  {id:'volatile',icon:'comet-shard',name:'Volatile Asset',d:'An asset worth ₽10 changes value every floor (×0.6 to ×1.8). When it\'s worth ₽40 or more, it pays out in full and a new one starts at ₽10.',
    gain(){S('volatile').v=10;},floor(){const s=S('volatile');s.v=Math.max(2,Math.round((s.v||10)*(.6+Math.random()*1.2)));if(s.v>=40){run.gold+=s.v;say(`Volatile Asset paid out ₽${s.v}!`);s.v=10;}},show:()=>`worth ₽${S('volatile').v||10}`},
  {id:'lucky7',icon:'lucky-egg',name:'Lucky Seven',d:'If your gold ends in a 7 when income arrives (₽7, ₽17, ₽27…), gain ₽7. Then ₽14 the next time, then ₽21…',
    inc:p=>{const s=S('lucky7');if(run.gold%10!==7)return 0;const g=7*((s.n||0)+1);if(p)s.n=(s.n||0)+1;return g;},show:()=>`next prize ₽${7*((S('lucky7').n||0)+1)}`},
  {id:'allin',icon:'relic-gold',name:'All In',d:'Gain ₽60 now. You earn no interest for the rest of this act.',gain(){run.gold+=60;S('allin').a=actOf();},noInterest:()=>S('allin').a===actOf(),show:()=>S('allin').a===actOf()?'no interest this act':'interest is back'},
  {id:'loyalty',icon:'soothe-bell',name:'Loyalty Card',d:'Every 3 floors in a row without selling a Pokémon pays ₽12.',sold(){S('loyalty').n=0;},
    floor(){const s=S('loyalty');s.n=(s.n||0)+1;if(s.n>=3){s.n=0;run.gold+=12;say('Loyalty Card: +₽12');}},show:()=>`${S('loyalty').n||0}/3 floors`},
  {id:'patience',icon:'iron-ball',name:'Patience',d:'+₽2 income for every floor in a row you\'ve gone without rerolling (up to +₽8).',reroll(){S('patience').n=0;},
    floor(){const s=S('patience');s.n=(s.n||0)+1;},inc:()=>Math.min(8,2*Math.max(0,(S('patience').n||1)-1)),show:()=>`${Math.max(0,(S('patience').n||1)-1)} floor(s) without rerolling`},

  /* ----- streaks, wins and losses ----- */
  {id:'bull',icon:'muscle-band',name:'Bull Market',d:'Each win in a row raises your income by ₽2 more (up to +₽10). A loss resets it.',inc:()=>run.streak>0?Math.min(10,2*run.streak):0},
  {id:'bear',icon:'black-sludge',name:'Bear Market',d:'Each loss in a row pays more than the last: ₽3, ₽6, ₽9, up to ₽12.',after(win){if(!win){const g=Math.min(12,3*Math.abs(Math.min(-1,run.streak)));run.gold+=g;return`Bear Market +₽${g}`;}}},
  {id:'hedge',icon:'protective-pads',name:'Hedge Fund',d:'Streak gold pays ₽1 more, and uses your longest win or loss streak this act, even after it ends.',
    floor(){const s=S('hedge');if(s.a!==actOf()){s.a=actOf();s.m=0;}s.m=Math.max(s.m||0,Math.abs(run.streak));},streak:()=>{const m=S('hedge').m||0,c=Math.abs(run.streak),g=x=>x>=5?3:x>=4?2:x>=2?1:0;return 1+Math.max(0,g(m)-g(c));},show:()=>`best streak ${S('hedge').m||0}`},
  {id:'warchest',icon:'box-silver',name:'War Chest',d:'Beating a rival or a guardian pays ₽15.',after(win){const k=floorKind(run.floor);if(win&&(k==='elite'||k==='boss')){run.gold+=15;return'War Chest +₽15';}}},
  {id:'flawless',icon:'focus-sash',name:'Flawless Bonus',d:'Win a battle without any of your Pokémon fainting to get ₽6.',after(win,fought,lost){if(win&&!lost){run.gold+=6;return'Flawless +₽6';}}},
  {id:'mvp',icon:'leaders-crest',name:'MVP Bonus',d:'After every battle, your top damage dealer earns ₽1 per 1,500 damage (up to ₽6).',
    after(win,fought,lost){const top=Math.max(0,...units.filter(c=>c.team===0).map(c=>c.mDmg||0)),g=Math.min(6,Math.floor(top/1500));if(g){run.gold+=g;return`MVP +₽${g}`;}}},
  {id:'commission',icon:'honey',name:'Commission',d:'Every 2 enemies your team knocks out pay ₽1 at the next income.',kill(){S('commission').k=(S('commission').k||0)+1;},
    inc:p=>{const s=S('commission'),g=Math.floor((s.k||0)/2);if(p)s.k=(s.k||0)%2;return g;},show:()=>`${S('commission').k||0} knockouts banked`},
  /* ----- Trainer HP ----- */
  {id:'insurance',icon:'rocky-helmet',name:'Insurance',d:'Pay ₽1 every floor. The first two losses of every act cost no Trainer HP and pay out ₽10 each.',inc:()=>-1,
    shield(){const s=S('insurance');if(s.a!==actOf()){s.a=actOf();s.n=0;}if(s.n>=2)return false;s.n++;run.gold+=10;say('Insurance paid out ₽10');return true;},show:()=>{const s=S('insurance');return`${s.a===actOf()?2-(s.n||0):2} claim(s) left this act`;}},
  {id:'parachute',icon:'sacred-ash',name:'Golden Parachute',d:'The first time your Trainer HP would drop to 0, you\'re left at 25 instead and gain ₽30.',
    save(){const s=S('parachute');if(s.done)return false;s.done=1;run.hp=25;run.gold+=30;say('Golden Parachute! Back to 25 HP and +₽30');return true;},show:()=>S('parachute').done?'used':'ready'},
  {id:'crowdfund',icon:'heal-ball',name:'Crowdfunding',d:'+₽1 income for every 8 Trainer HP you\'re missing.',inc:()=>Math.floor((run.maxHp-run.hp)/8)},
  {id:'highroller',icon:'dusk-stone',name:'High Roller',d:'While you have more than 30 Trainer HP, every floor costs you 2 HP but pays ₽6 more income.',inc:()=>run.hp>30?6:0,floor(){if(run.hp>30)run.hp-=2;}},

  /* ----- the shop ----- */
  {id:'freeagent',icon:'cherish-ball',name:'Free Agency',d:'The first Pokémon you buy each floor is free.',free:()=>S('freeagent').f!==effFloor(run.floor),buy(){S('freeagent').f=effFloor(run.floor);},show:()=>S('freeagent').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'trending',icon:'soothe-bell',name:'Trending',d:'Every floor, three Pokémon lines are trending (shown in Run info). Buying one pays ₽4 back, twice a floor.',
    floor(){const p=shuffle(MODE.byCost.flat().filter(r=>MODE.lines[r].cost<=topCost()));const s=S('trending');s.r=p.slice(0,3);s.n=0;},
    buy(u){const s=S('trending');if((s.r||[]).includes(u.root)&&(s.n||0)<2){s.n=(s.n||0)+1;run.gold+=4;say('Trending: +₽4');}},show:()=>{const r=S('trending').r||[];return r.length?r.map(x=>D[x].n).join(', '):'—';}},
  {id:'rebate',icon:'gold-bottle-cap',name:'Reroll Rebate',d:'Every 2nd reroll gives your ₽ back.',reroll(){const s=S('rebate');s.n=(s.n||0)+1;if(s.n%2===0){run.gold+=rerollCost();say('Reroll Rebate: refunded');}},show:()=>S('rebate').n%2?'next reroll is refunded':'—'},
  {id:'jackpot',icon:'lucky-punch',name:'Jackpot',d:'Every reroll has a 6% chance to hit the jackpot for ₽40.',reroll(){if(Math.random()<.06){run.gold+=40;say('JACKPOT! +₽40');}}},
  {id:'bluechip',icon:'master-ball',name:'Blue Chip',d:'+₽2 income for every ₽4 or ₽5 Pokémon on your field.',inc:()=>2*onField().filter(u=>lineOf(u).cost>=4).length},
  /* ----- selling ----- */
  {id:'firesale',icon:'charcoal',name:'Fire Sale',d:'The first Pokémon you sell each floor goes for double.',sell:u=>S('firesale').f!==effFloor(run.floor)?sellValue(u):0,sold(){S('firesale').f=effFloor(run.floor);},show:()=>S('firesale').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'tradein',icon:'up-grade',name:'Trade-In',d:'Selling a Pokémon has a 40% chance to bring a random Pokémon one cost higher to your bench.',
    sold(u){const c=Math.min(5,lineOf(u).cost+1);if(Math.random()<.4&&run.bench.includes(null)){gainUnit(randRoot(c),1);say('Trade-In: a new Pokémon arrived');}}},

  /* ----- stars and Pokémon ----- */
  {id:'midas',icon:'gold-leaf',name:'Midas Touch',d:'Every 2★ you make pays ₽2. Every 3★ you make brings a completed item.',combine(u){if(u.star===2)run.gold+=2;if(u.star===3){addCraft();say('Midas Touch: a completed item');}}},
  {id:'shrine',icon:'relic-statue',name:'Shrine Offering',d:'Every floor, ₽2 is offered at the shrine. Every 4th floor, it gives back a 2★ Pokémon of the highest cost you can roll.',inc:()=>-2,
    floor(){const s=S('shrine');s.n=(s.n||0)+1;if(s.n%4===0&&run.bench.includes(null)){gainUnit(randRoot(topCost()),2);say('Shrine Offering: a 2★ Pokémon');}},show:()=>`${4-(S('shrine').n||0)%4} floor(s) to the gift`},
  {id:'apprentice',icon:'muscle-band',name:'Apprenticeship',d:'Every floor, your lowest-star Pokémon on the field permanently gains +20 max HP and +2 Attack and Sp. Atk.',
    floor(){const u=onField().sort((a,b)=>a.star-b.star||lineOf(a).cost-lineOf(b).cost)[0];if(u){u.g=u.g||{};u.g.hp=(u.g.hp||0)+20;u.g.atk=(u.g.atk||0)+2;u.g.spa=(u.g.spa||0)+2;}}},
  {id:'angel',icon:'soothe-bell',name:'Angel Investor',d:'+₽1 income for every different set you have active on the field (up to ₽8).',inc:()=>{const tr=countTraits(onField());return Math.min(8,Object.keys(tr).filter(k=>SETS[k]&&tierOf(k,tr[k])).length);}},

  /* ----- XP and levels ----- */
  {id:'tuition',icon:'wise-glasses',name:'Tuition',d:'Buying XP gives 2 extra XP.',xpp:2},
  {id:'tutor',icon:'exp-share',name:'Private Tutor',d:'Gain 4 extra XP every floor, but your base income is ₽1 lower.',inc:()=>-1,floor(){gainXP(4);}},
  {id:'practice',icon:'rare-candy',name:'Practice Rolls',d:'Every reroll gives 1 XP.',reroll(){gainXP(1);}},
  {id:'scholar',icon:'rare-candy',name:'Scholarship',d:'Every time your trainer level goes up, gain ₽8.',level(lv){run.gold+=8;say(`Scholarship: +₽8 for level ${lv}`);}},
  {id:'exchange',icon:'up-grade',name:'XP Exchange',d:'When income arrives, every ₽2 you have over ₽50 turns into 1 XP.',floor(){if(run.gold>50&&run.level<MAXLV){const x=Math.floor((run.gold-50)/2);run.gold-=x*2;gainXP(x);if(x)say(`XP Exchange: +${x} XP`);}}},

  /* ----- items, chests and paths ----- */
  {id:'crate',icon:'box-normal',name:'Supply Crate',d:'Every 2nd floor, a random item component arrives.',floor(){const s=S('crate');s.n=(s.n||0)+1;if(s.n%2===0){addComp();say('Supply Crate: a component');}},show:()=>S('crate').n%2?'a component next floor':'a component in 2 floors'},
  {id:'scrap',icon:'metal-coat',name:'Scrap Dealer',d:'+₽1 income for every item your field holds (up to ₽6).',inc:()=>Math.min(6,onField().reduce((s,u)=>s+u.items.length,0))},
  {id:'treasuremap',icon:'town-map',name:'Treasure Map',d:'Every chest you open also holds ₽6.',chest(){run.gold+=6;}},
  {id:'pathfinder',icon:'mach-bike',name:'Pathfinder',d:'Taking a Mystery, Pokémon Center or Kecleon Shop path pays ₽10.',node(k){if(['event','center','shop'].includes(k)){run.gold+=10;say('Pathfinder: +₽10');}}},
  /* ----- added ----- */
  {id:'hoarder',icon:'box-normal',name:'Hoarder',d:'Every item in your bag counts as ₽5 toward interest.',pad:()=>5*run.bag.length,show:()=>`+₽${5*run.bag.length} toward interest`},
  {id:'monopoly',icon:'leaders-crest',name:'Type Monopoly',d:'+₽1 income for every Pokémon on your field that shares your starting strategy\'s type (up to ₽6).',
    inc:()=>Math.min(6,onField().filter(u=>D[u.dex].t.includes(run.strat.type)).length),show:()=>`${run.strat.type}: ₽${Math.min(6,onField().filter(u=>D[u.dex].t.includes(run.strat.type)).length)} a floor`},
  {id:'stakes',icon:'dusk-stone',name:'High Stakes',d:'Before every rival and guardian battle, half your gold is staked. Win and you get it back doubled; lose and it\'s gone.',
    start(){const k=floorKind(run.floor);if((k==='elite'||k==='boss')&&run.gold>=2){const s=S('stakes');s.bet=Math.floor(run.gold/2);run.gold-=s.bet;say(`High Stakes: ₽${s.bet} on the line`);}},
    after(win){const s=S('stakes');if(!s.bet)return;const b=s.bet;s.bet=0;if(win){run.gold+=b*2;return`High Stakes: won ₽${b}`;}return`High Stakes: lost ₽${b}`;}},
];
const INVMAP=Object.fromEntries(INVDEF.map(a=>[a.id,a]));

/* ---------- the shared hook system ---------- */
const myInvs=()=>((run&&run.invs)||[]).map(x=>INVMAP[x.id]).filter(Boolean);
function perkRun(h,...a){const out=[];for(const p of perks())if(typeof p[h]==='function'){try{const r=p[h](...a);if(r!=null&&r!==false&&r!==0)out.push(r);}catch(e){console.warn(p.id,h,e);}}return out;}
function perkNum(h,...a){let s=0;for(const p of perks()){const v=p[h];if(typeof v==='number')s+=v;else if(typeof v==='function'){try{const r=v.apply(p,a);if(typeof r==='number')s+=r;}catch(e){console.warn(p.id,h,e);}}}return s;}
// the first perk that says yes wins (insurance, parachute, free buys)
const perkAny=(h,...a)=>perks().some(p=>typeof p[h]==='function'?!!p[h].apply(p,a):!!p[h]);
const invIs=id=>!!(run&&run.invs&&run.invs.some(x=>x.id===id));
// interest pieces (game.js interestOf uses these)
const interestPad=()=>perkNum('pad');
const interestPer=()=>Math.min(run.strat.id==='verdant'?8:10,...perks().filter(p=>p.per).map(p=>p.per));

/* ---------- team strategies: the 14 type strategies (data.js) plus the general ones below ---------- */
// general team strategies: no type, one job each (the money cards that don't copy a type strategy's rule)
const GENERAL={thrifty:'Economy',travellight:'Economy',stockpile:'Economy',goldrush:'Economy',patron:'Economy',hoarder:'Economy',
  trustfund:'Payout',printer:'Payout',nestegg:'Payout',volatile:'Payout',lucky7:'Payout',allin:'Payout',loyalty:'Payout',
  warchest:'Battle',stakes:'Battle',flawless:'Battle',mvp:'Battle',
  insurance:'Safety',parachute:'Safety',crowdfund:'Safety',highroller:'Safety',
  trending:'Shop',jackpot:'Shop',bluechip:'Shop',firesale:'Shop',tradein:'Shop',
  shrine:'Team',apprentice:'Team',angel:'Team',
  practice:'XP',scholar:'XP',exchange:'XP',
  scrap:'Items',pathfinder:'Items'};
const GEN_STRATS=Object.entries(GENERAL).map(([id,risk])=>{const a=INVMAP[id];return Object.assign(Object.create(a),{type:null,risk,pts:[a.d],general:1});});
const TEAMSTRATS=STRATS.concat(GEN_STRATS);
const teamStrat=id=>TEAMSTRATS.find(s=>s.id===id);
// a type strategy only appears if this mode has at least 3 lines of its type (Gen I has too few Dragons and Ghosts)
function teamStratPool(){const typeLines=t=>MODE.roots.filter(r=>MODE.lines[r].mem.some(d=>D[d].t.includes(t))).length;
  return TEAMSTRATS.filter(s=>s.general||s.si!=null||typeLines(s.type)>=3);}
// Start run → region → the run begins and offers 3 team strategies (one reroll per card). Once taken it's locked in.
function beginRun(){
  const SL=teamStratPool(),feats={};for(const s of SL)if(!s.general)feats[s.id]=featured(s);
  newRun(null,Object.values(feats).flat());
  const ids=shuffle(SL.map(s=>s.id)).slice(0,3);
  showTeamStrat({SL,feats,ids,rr:[0,0,0]});
}
function showTeamStrat(O){
  mode='augment';showGameUI(false);hideTip();$('bannerhost').innerHTML='';music(musicForRun());
  const card=(id,i)=>{const s=teamStrat(id);const img=s.general?iconOf(s.icon):por(O.feats[id][0]);
    return`<div class="augcard tier-gold tscard" data-i="${i}"><button class="augpick" data-pick="${i}"><div class="augic${s.general?'':' por'}"><img src="${img}" alt=""></div>
      <span class="augtag t-econ"${s.type?` style="background:${TYPES[s.type]}"`:''}>${s.type?`${s.type} · `:''}${s.risk}</span><h2>${esc(s.name)}</h2>
      <ul class="tspts">${s.pts.map(p=>`<li>${p}</li>`).join('')}</ul>${s.general?'':`<div class="tsfeat"><span class="lbl">First shop</span>${O.feats[id].map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}" title="${esc(D[d].n)}">`).join('')}</div>`}</button>
      <button class="btn sm augrr" data-rr="${i}" ${O.rr[i]?'disabled':''}>${O.rr[i]?'Rerolled':'Reroll'}</button></div>`;};
  ov.innerHTML=`<div class="scrim"></div><div class="screen augscreen"><h1 class="h1">Choose a team strategy</h1>
    <p class="sub">${MODE.gen?`${MODE.label} · ${MODE.region}`:'National Dex'}. Your team strategy helps you for the whole run. Once you take it, it's locked in. Each card can be rerolled once.</p>
    <div class="augrow">${O.ids.map(card).join('')}</div></div>`;
  ov.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const s=teamStrat(O.ids[+b.dataset.pick]);ov.innerHTML='';applyStrat(s,O.feats[s.id]);startFloor();toast(`Team strategy: ${s.name}`);});
  ov.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rr;if(O.rr[i])return;const p=O.SL.filter(s=>!O.ids.includes(s.id));if(p.length)O.ids[i]=pick(p).id;O.rr[i]=1;showTeamStrat(O);});
}

/* ---------- saves from before the cleanup: removed picks become their closest replacement ---------- */
const INV_RENAMED={allowance:'goldrush',tipjar:'bull',consolation:'bear',nightowl:'goldrush',earlybird:'goldrush',coinflip:'volatile',piggy:'nestegg',moneytree:'printer',
  savings:'hypercompound',leverage:'hypercompound',goose:'hypercompound',smallchange:'compound',flatrate:'thrifty',pocketmoney:'scholar',futures:'warchest',venture:'allin',
  sponsor:'bull',streaker:'hedge',tollroad:'flawless',bounty:'commission',heist:'commission',laststand:'crowdfund',reserves:'crowdfund',policy:'insurance',coupon:'freeagent',
  referral:'freeagent',luckyroll:'rebate',cashback:'rebate',collection:'bluechip',shortsell:'freeagent',yardsale:'firesale',royalties:'midas',wishstar:'shrine',
  studybond:'tutor',subsidy:'tuition',fasttrack:'tuition',overflow:'exchange',booster:'crate',treasury:'crate',lottery:'volatile',deflation:'freeagent',
  appraiser:'firesale',dividends:'midas',merger:'midas',scout:'shrine'};
const AUG_RENAMED={berry:'harvest',intim:'lightscreen',candy:'innerfocus',comppack:'harvest',bargain:'stealthrock',feather:'longreach',warmup:'guts',piggyaug:'stamina',
  irondef:'stamina',stickyweb:'stealthrock',focusen:'suckerpunch',grabbag:'chainlight',study:'tagteam',combattrain:'tagteam',scaryface:'gravity',training:'outnumbered',
  egg:'reinforce',spoils:'lockon',secondwind:'perish',legend:'copymachine',champion:'grandprize'};
function migratePerks(r){
  if(r.invs)r.invs=r.invs.map(x=>({id:INV_RENAMED[x.id]||x.id})).filter((x,i,a)=>INVMAP[x.id]&&a.findIndex(y=>y.id===x.id)===i);
  if(r.augs)r.augs=r.augs.map(x=>({...x,id:AUG_RENAMED[x.id]||x.id})).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);
}
