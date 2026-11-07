"use strict";
/* PokéRun Tactics — investment strategies (in the spirit of Honkai: Star Rail's Currency Wars).
   Your starting strategy is picked once, before the run. Investment strategies are offered during the run, on
   floors 3 and 8 of every act (floor 3 in Endless): pick one of three, all of the same tier (silver, gold or
   prismatic). They're mostly about money: interest, streaks, the shop, selling, XP, items, Trainer HP and payouts
   that take time to mature. Nothing you've been offered comes back later in the run.

   Hooks (shared with augments, see perks()): gain() on pick · floor() each floor · inc(pay) extra floor income ·
   after(win,fought) after a battle · buy(u) · sell(u) · reroll() · level(lv) · combine(u) · act() a new act ·
   chest() · start(mine,foes) · kill(src,tg) · fall(tg) · numbers: cap, pad, per, imin, streak, rr, xpc, xpp,
   sell(u), price(root), hpLoss · free(root) · show() a short status for the run panel. */

const INV_FLOORS=a=>a<3?[3,8]:[3];
const S=id=>{run.invS=run.invS||{};return run.invS[id]=run.invS[id]||{};};
const onField=()=>Object.values(run.board);
const randRoot=c=>pick(MODE.byCost[c-1]&&MODE.byCost[c-1].length?MODE.byCost[c-1]:MODE.byCostAll[c-1]);
const topCost=()=>{let c=1;for(let i=0;i<5;i++)if(LVODDS[run.level][i]>0)c=i+1;return c;};
const addComp=()=>{if(run.bag.length<BAGMAX)run.bag.push(mkComp(randComp(),[]));};
const addCraft=()=>{if(run.bag.length<BAGMAX)run.bag.push({k:randCraft(),mut:[]});};
const say=t=>{if(!SIM.on)toast(t);};

const INVDEF=[
  /* ================= silver ================= */
  {id:'savings',t:'silver',icon:'coin-case',name:'Savings Account',d:'Your interest cap rises by ₽2.',cap:2},
  {id:'allowance',t:'silver',icon:'nugget',name:'Allowance',d:'+₽1 income every floor.',inc:()=>1},
  {id:'tipjar',t:'silver',icon:'amulet-coin',name:'Tip Jar',d:'Every win pays ₽1 more.',after(win){if(win){run.gold+=1;return'Tip Jar +₽1';}}},
  {id:'consolation',t:'silver',icon:'big-pearl',name:'Consolation Prize',d:'Every loss pays ₽2.',after(win){if(!win){run.gold+=2;return'Consolation +₽2';}}},
  {id:'coupon',t:'silver',icon:'premier-ball',name:'Coupon Book',d:'The first Pokémon you buy each floor costs ₽1 less (₽2 and up).',
    price:r=>S('coupon').f!==effFloor(run.floor)&&MODE.lines[r].cost>=2?-1:0,buy(){S('coupon').f=effFloor(run.floor);},show:()=>S('coupon').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'yardsale',t:'silver',icon:'pretty-wing',name:'Yard Sale',d:'The first Pokémon you sell each floor sells for ₽2 more.',
    sell:()=>S('yardsale').f!==effFloor(run.floor)?2:0,sold(){S('yardsale').f=effFloor(run.floor);}},
  {id:'studybond',t:'silver',icon:'exp-share',name:'Study Bond',d:'Every 3rd floor, gain 5 XP.',floor(){const s=S('studybond');s.n=(s.n||0)+1;if(s.n%3===0){gainXP(5);say('Study Bond: +5 XP');}},show:()=>`${3-(S('studybond').n||0)%3} floor(s) to go`},
  {id:'piggy',t:'silver',icon:'star-piece',name:'Piggy Bank',d:'₽1 goes into the bank every floor (it doesn\'t count for interest). After 6 floors it breaks open for double: ₽12.',
    floor(){const s=S('piggy');s.n=(s.n||0)+1;if(s.n>=6){s.n=0;run.gold+=12;say('Piggy Bank: +₽12!');}},show:()=>`₽${S('piggy').n||0} saved`},
  {id:'earlybird',t:'silver',icon:'quick-claw',name:'Early Bird',d:'+₽3 income on floors 2–4 of every act.',inc:()=>run.floor>=2&&run.floor<=4?3:0},
  {id:'nightowl',t:'silver',icon:'moon-stone',name:'Night Owl',d:'+₽3 income on floors 7–9 of every act.',inc:()=>run.floor>=7&&run.floor<=9?3:0},
  {id:'rebate',t:'silver',icon:'gold-bottle-cap',name:'Reroll Rebate',d:'Every 4th reroll gives your ₽ back.',reroll(){const s=S('rebate');s.n=(s.n||0)+1;if(s.n%4===0){run.gold+=rerollCost();say('Reroll Rebate: refunded');}},show:()=>`${4-(S('rebate').n||0)%4} reroll(s) to the rebate`},
  {id:'thrifty',t:'silver',icon:'berry-pots',name:'Thrifty',d:'If you have less than ₽10 when income arrives, gain ₽3 more.',inc:()=>run.gold<10?3:0},
  {id:'flatrate',t:'silver',icon:'relic-copper',name:'Flat Rate',d:'Your interest is never less than ₽2, even when you\'re broke.',imin:2},
  {id:'crate',t:'silver',icon:'box-normal',name:'Supply Crate',d:'Every 4th floor, a random item component arrives.',floor(){const s=S('crate');s.n=(s.n||0)+1;if(s.n%4===0){addComp();say('Supply Crate: a component');}},show:()=>`${4-(S('crate').n||0)%4} floor(s) to the crate`},
  {id:'tuition',t:'silver',icon:'wise-glasses',name:'Tuition',d:'Buying XP gives 1 extra XP.',xpp:1},
  {id:'referral',t:'silver',icon:'friend-ball',name:'Referral Bonus',d:'Every 5th Pokémon you buy pays ₽3.',buy(){const s=S('referral');s.n=(s.n||0)+1;if(s.n%5===0){run.gold+=3;say('Referral Bonus: +₽3');}},show:()=>`${5-(S('referral').n||0)%5} to go`},
  {id:'policy',t:'silver',icon:'sitrus-berry',name:'Health Policy',d:'Losses cost 2 less Trainer HP.',hpLoss:-2},
  {id:'warchest',t:'silver',icon:'box-silver',name:'War Chest',d:'Beating a rival or a guardian pays ₽6.',after(win){const k=floorKind(run.floor);if(win&&(k==='elite'||k==='boss')){run.gold+=6;return'War Chest +₽6';}}},
  {id:'scrap',t:'silver',icon:'metal-coat',name:'Scrap Dealer',d:'Selling a Pokémon pays ₽1 more for every item it holds (the items still come back).',sell:u=>u.items.length},
  {id:'smallchange',t:'silver',icon:'pearl',name:'Small Change',d:'Interest counts as if you had ₽5 more.',pad:5},
  {id:'coinflip',t:'silver',icon:'nugget',name:'Coin Flip',d:'Every floor, flip a coin: heads pays ₽4, tails pays nothing.',inc:p=>p?(Math.random()<.5?4:0):0},
  {id:'loyalty',t:'silver',icon:'soothe-bell',name:'Loyalty Card',d:'Every 3 floors in a row without selling a Pokémon pays ₽4.',sold(){S('loyalty').n=0;},
    floor(){const s=S('loyalty');s.n=(s.n||0)+1;if(s.n>=3){s.n=0;run.gold+=4;say('Loyalty Card: +₽4');}},show:()=>`${S('loyalty').n||0}/3 floors`},
  {id:'travellight',t:'silver',icon:'air-balloon',name:'Travel Light',d:'If your bench is empty when income arrives, gain ₽4.',inc:()=>run.bench.every(x=>!x)?4:0},
  {id:'dividends',t:'silver',icon:'gold-leaf',name:'Dividends',d:'+₽1 income for every 3★ Pokémon you own.',inc:()=>allOwned().filter(u=>u.star>=3).length},
  {id:'practice',t:'silver',icon:'rare-candy',name:'Practice Rolls',d:'Every reroll has a 30% chance to give 1 XP.',reroll(){if(Math.random()<.3)gainXP(1);}},
  {id:'scholar',t:'silver',icon:'rare-candy',name:'Scholarship',d:'Reaching trainer level 5, 6, 7 or 8 pays ₽4 each.',level(lv){if(lv>=5&&lv<=8){run.gold+=4;say(`Scholarship: +₽4 for level ${lv}`);}}},
  {id:'treasuremap',t:'silver',icon:'town-map',name:'Treasure Map',d:'Every chest you open also holds ₽2.',chest(){run.gold+=2;}},
  {id:'streaker',t:'silver',icon:'quick-powder',name:'Streak Keeper',d:'While you\'re on any streak of 2 or more, streak gold pays ₽1 more.',streak:()=>Math.abs(run.streak)>=2?1:0},
  {id:'flawless',t:'silver',icon:'focus-sash',name:'Flawless Bonus',d:'Win a battle without any of your Pokémon fainting to get ₽3.',after(win,fought,lost){if(win&&!lost){run.gold+=3;return'Flawless +₽3';}}},
  {id:'pathfinder',t:'silver',icon:'mach-bike',name:'Pathfinder',d:'Taking a Mystery, Pokémon Center or Kecleon Shop path pays ₽3.',node(k){if(['event','center','shop'].includes(k)){run.gold+=3;say('Pathfinder: +₽3');}}},
  {id:'pocketmoney',t:'silver',icon:'pass-orb',name:'Pocket Money',d:'Gain ₽8 now, and ₽1 every time you level up.',gain(){run.gold+=8;},level(){run.gold+=1;}},

  /* ================= gold ================= */
  {id:'compound',t:'gold',icon:'amulet-coin',name:'Compound Interest',d:'Interest pays ₽1 for every ₽8 you have instead of ₽10.',per:8},
  {id:'bluechip',t:'gold',icon:'master-ball',name:'Blue Chip',d:'+₽1 income for every ₽4 or ₽5 Pokémon on your field.',inc:()=>onField().filter(u=>lineOf(u).cost>=4).length},
  {id:'venture',t:'gold',icon:'big-nugget',name:'Venture Capital',d:'Gain ₽18 now. You pay back ₽2 at each of the next 6 floors.',gain(){run.gold+=18;S('venture').n=6;},
    inc:p=>{const s=S('venture');if(!s.n)return 0;if(p)s.n--;return-2;},show:()=>S('venture').n?`${S('venture').n} payment(s) left`:'paid off'},
  {id:'leverage',t:'gold',icon:'choice-scarf',name:'Leverage',d:'Your interest cap rises by ₽5, but every loss costs ₽3.',cap:5,after(win){if(!win){run.gold=Math.max(0,run.gold-3);return'Leverage −₽3';}}},
  {id:'bull',t:'gold',icon:'muscle-band',name:'Bull Market',d:'Each win in a row raises your income by ₽1 more (up to +₽5). A loss resets it.',inc:()=>run.streak>0?Math.min(5,run.streak):0},
  {id:'bear',t:'gold',icon:'black-sludge',name:'Bear Market',d:'Each loss in a row pays more than the last: ₽2, ₽4, ₽6, up to ₽8.',after(win){if(!win){const g=Math.min(8,2*Math.abs(Math.min(-1,run.streak)));run.gold+=g;return`Bear Market +₽${g}`;}}},
  {id:'hedge',t:'gold',icon:'protective-pads',name:'Hedge Fund',d:'Streak gold uses your longest win or loss streak this act, whichever is higher, even after it ends.',
    floor(){const s=S('hedge');if(s.a!==actOf()){s.a=actOf();s.m=0;}s.m=Math.max(s.m||0,Math.abs(run.streak));},streak:()=>{const m=S('hedge').m||0,c=Math.abs(run.streak),g=x=>x>=5?3:x>=4?2:x>=2?1:0;return Math.max(0,g(m)-g(c));},show:()=>`best streak ${S('hedge').m||0}`},
  {id:'insurance',t:'gold',icon:'rocky-helmet',name:'Insurance',d:'Pay ₽1 every floor. The first loss of every act costs no Trainer HP and pays out ₽10.',inc:()=>-1,
    shield(){const s=S('insurance');if(s.a===actOf())return false;s.a=actOf();run.gold+=10;say('Insurance paid out ₽10');return true;},show:()=>S('insurance').a===actOf()?'used this act':'covered'},
  {id:'futures',t:'gold',icon:'old-amber',name:'Futures Contract',d:'At the start of each act, ₽10 is locked away (if you have it). Beat the guardian and it comes back as ₽25.',
    act(){const s=S('futures');if(run.gold>=10){run.gold-=10;s.held=1;say('Futures Contract: ₽10 locked in');}},gain(){this.act();},
    after(win){const s=S('futures');if(win&&floorKind(run.floor)==='boss'&&s.held){s.held=0;run.gold+=25;return'Futures paid ₽25';}},show:()=>S('futures').held?'₽10 locked in':'nothing locked'},
  {id:'shortsell',t:'gold',icon:'black-glasses',name:'Short Selling',d:'When you sell a Pokémon, the next copy of that line you buy is free.',
    sold(u){(S('shortsell').l=S('shortsell').l||[]).push(u.root);},free:r=>(S('shortsell').l||[]).includes(r),buy(u){const s=S('shortsell');const i=(s.l||[]).indexOf(u.root);if(i>=0)s.l.splice(i,1);}},
  {id:'royalties',t:'gold',icon:'crown-pass',name:'Royalties',d:'Every 3★ you make pays ₽2 at every floor for the rest of the run.',combine(u){if(u.star===3)S('royalties').n=(S('royalties').n||0)+1;},inc:()=>2*(S('royalties').n||0),show:()=>`₽${2*(S('royalties').n||0)} a floor`},
  {id:'tutor',t:'gold',icon:'exp-share',name:'Private Tutor',d:'Gain 3 extra XP every floor, but your base income is ₽1 lower.',inc:()=>-1,floor(){gainXP(3);}},
  {id:'luckyroll',t:'gold',icon:'lucky-egg',name:'Lucky Roll',d:'Every reroll has a 12% chance to be free and pay ₽2.',reroll(){if(Math.random()<.12){run.gold+=rerollCost()+2;say('Lucky Roll! +₽2');}}},
  {id:'appraiser',t:'gold',icon:'scope-lens',name:'Appraiser',d:'Your Pokémon sell for ₽1 more per star (₽1 / ₽2 / ₽3).',sell:u=>u.star},
  {id:'stockpile',t:'gold',icon:'box-gold',name:'Stockpile',d:'If your bench is full when income arrives, gain ₽3.',inc:()=>run.bench.every(Boolean)?3:0},
  {id:'commission',t:'gold',icon:'honey',name:'Commission',d:'Every 4 enemies your team knocks out pay ₽1 at the next income.',kill(){S('commission').k=(S('commission').k||0)+1;},
    inc:p=>{const s=S('commission'),g=Math.floor((s.k||0)/4);if(p)s.k=(s.k||0)%4;return g;},show:()=>`${S('commission').k||0} knockouts banked`},
  {id:'mvp',t:'gold',icon:'leaders-crest',name:'MVP Bonus',d:'After every battle, your top damage dealer earns ₽1 per 2,000 damage (up to ₽4).',
    after(win,fought,lost){const top=Math.max(0,...units.filter(c=>c.team===0).map(c=>c.mDmg||0)),g=Math.min(4,Math.floor(top/2000));if(g){run.gold+=g;return`MVP +₽${g}`;}}},
  {id:'trending',t:'gold',icon:'soothe-bell',name:'Trending',d:'Every floor, one Pokémon line in your shop pool is trending: buying it pays ₽3 back.',
    floor(){const p=MODE.byCost.flat().filter(r=>MODE.lines[r].cost<=topCost());S('trending').r=pick(p);},buy(u){if(u.root===S('trending').r){run.gold+=3;say('Trending: +₽3');}},show:()=>S('trending').r?`${D[S('trending').r].n} line`:'—'},
  {id:'collection',t:'gold',icon:'town-map',name:'Collector\'s Edition',d:'+₽1 income for every different ₽4 or ₽5 line you\'ve owned this run.',
    floor(){const s=S('collection');s.l=s.l||[];for(const u of allOwned())if(lineOf(u).cost>=4&&!s.l.includes(u.root))s.l.push(u.root);},inc:()=>(S('collection').l||[]).length,show:()=>`${(S('collection').l||[]).length} line(s)`},
  {id:'crowdfund',t:'gold',icon:'heal-ball',name:'Crowdfunding',d:'+₽1 income for every 12 Trainer HP you\'re missing.',inc:()=>Math.floor((run.maxHp-run.hp)/12)},
  {id:'trustfund',t:'gold',icon:'luxury-ball',name:'Trust Fund',d:'Gain ₽20 at the start of every new act.',act(){run.gold+=20;say('Trust Fund: +₽20');}},
  {id:'goose',t:'gold',icon:'lucky-egg',name:'Golden Goose',d:'Every floor your interest is at its cap, the cap rises by ₽1 (up to +₽5).',
    floor(){const s=S('goose');if(interestOf()>=interestCapOf()&&(s.n||0)<5)s.n=(s.n||0)+1;},cap:()=>S('goose').n||0,show:()=>`cap +₽${S('goose').n||0}`},
  {id:'tradein',t:'gold',icon:'up-grade',name:'Trade-In',d:'Selling a Pokémon has a 25% chance to bring a random Pokémon one cost higher to your bench.',
    sold(u){const c=Math.min(5,lineOf(u).cost+1);if(Math.random()<.25&&run.bench.includes(null)){gainUnit(randRoot(c),1);say('Trade-In: a new Pokémon arrived');}}},
  {id:'reserves',t:'gold',icon:'max-revive',name:'Emergency Reserves',d:'The first time your Trainer HP drops below 40, gain ₽20 and 3 free rerolls.',
    after(){const s=S('reserves');if(!s.done&&run.hp<40&&run.hp>0){s.done=1;run.gold+=20;run.freeRerolls=(run.freeRerolls||0)+3;return'Emergency Reserves +₽20';}}},
  {id:'cashback',t:'gold',icon:'gold-bottle-cap',name:'Cashback',d:'15% of everything you spend in the shop (Pokémon, rerolls, XP) comes back at the next income.',
    spent(n){S('cashback').s=(S('cashback').s||0)+n;},inc:p=>{const s=S('cashback'),g=Math.floor((s.s||0)*.15);if(p)s.s=0;return g;},show:()=>`₽${Math.floor((S('cashback').s||0)*.15)} pending`},
  {id:'bounty',t:'gold',icon:'scope-lens',name:'Bounty Board',d:'In every battle the toughest enemy has a bounty: knock it out for ₽4.',
    start(mine,foes){const b=foes.slice().sort((a,b)=>b.maxHp-a.maxHp)[0];if(b){b.bounty=1;if(!SIM.on)texts.push({x:b.x,y:b.y-40,txt:'Bounty!',col:'#ffd34d',life:1.6,label:1});}},kill(src,tg){if(tg.bounty){tg.bounty=0;run.gold+=4;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'+₽4',col:'#ffd34d',life:1.2,label:1});}}},
  {id:'apprentice',t:'gold',icon:'muscle-band',name:'Apprenticeship',d:'Every floor, your lowest-star Pokémon on the field permanently gains +20 max HP and +2 Attack and Sp. Atk.',
    floor(){const u=onField().sort((a,b)=>a.star-b.star||lineOf(a).cost-lineOf(b).cost)[0];if(u){u.g=u.g||{};u.g.hp=(u.g.hp||0)+20;u.g.atk=(u.g.atk||0)+2;u.g.spa=(u.g.spa||0)+2;}}},
  {id:'subsidy',t:'gold',icon:'rare-candy',name:'Level Subsidy',d:'Buying XP costs ₽1 less.',xpc:-1},
  {id:'tollroad',t:'gold',icon:'bicycle',name:'Toll Road',d:'Every battle you win against a full enemy team (5 or more) pays ₽2.',after(win){if(win&&units.filter(c=>c.team===1&&!c.summon).length>=5){run.gold+=2;return'Toll Road +₽2';}}},
  {id:'patience',t:'gold',icon:'iron-ball',name:'Patience',d:'+₽2 income for every floor in a row you\'ve gone without rerolling (up to +₽6).',reroll(){S('patience').n=0;},
    floor(){const s=S('patience');s.n=(s.n||0)+1;},inc:()=>Math.min(6,2*Math.max(0,(S('patience').n||1)-1)),show:()=>`${Math.max(0,(S('patience').n||1)-1)} floor(s) without rerolling`},

  /* ================= prismatic ================= */
  {id:'goldrush',t:'prismatic',icon:'big-nugget',name:'Gold Rush',d:'+₽5 income every floor, but rerolls cost ₽1 more.',inc:()=>5,rr:1},
  {id:'hypercompound',t:'prismatic',icon:'relic-crown',name:'Hypercompound',d:'Interest has no cap of ₽5 any more: it keeps paying ₽1 per ₽10, up to ₽15.',cap:10},
  {id:'jackpot',t:'prismatic',icon:'lucky-punch',name:'Jackpot',d:'Every reroll has a 5% chance to hit the jackpot for ₽30.',reroll(){if(Math.random()<.05){run.gold+=30;say('JACKPOT! +₽30');}}},
  {id:'allin',t:'prismatic',icon:'relic-gold',name:'All In',d:'Gain ₽45 now. You earn no interest for the rest of the run.',gain(){run.gold+=45;},noInterest:1},
  {id:'parachute',t:'prismatic',icon:'sacred-ash',name:'Golden Parachute',d:'The first time your Trainer HP would drop to 0, you\'re left at 25 instead and gain ₽30.',
    save(){const s=S('parachute');if(s.done)return false;s.done=1;run.hp=25;run.gold+=30;say('Golden Parachute! Back to 25 HP and +₽30');return true;},show:()=>S('parachute').done?'used':'ready'},
  {id:'volatile',t:'prismatic',icon:'comet-shard',name:'Volatile Asset',d:'An asset worth ₽10 changes value every floor (×0.6 to ×1.8). When it\'s worth ₽40 or more, it pays out in full and a new one starts at ₽10.',
    gain(){S('volatile').v=10;},floor(){const s=S('volatile');s.v=Math.max(2,Math.round((s.v||10)*(.6+Math.random()*1.2)));if(s.v>=40){run.gold+=s.v;say(`Volatile Asset paid out ₽${s.v}!`);s.v=10;}},show:()=>`worth ₽${S('volatile').v||10}`},
  {id:'sponsor',t:'prismatic',icon:'soothe-bell',name:'Sponsorship Deal',d:'Every win pays ₽2 for each win in your current streak (3rd win in a row: ₽6).',after(win){if(win){const g=2*Math.max(1,run.streak);run.gold+=g;return`Sponsor +₽${g}`;}}},
  {id:'freeagent',t:'prismatic',icon:'cherish-ball',name:'Free Agency',d:'The first Pokémon you buy each floor is free.',free:()=>S('freeagent').f!==effFloor(run.floor),buy(){S('freeagent').f=effFloor(run.floor);},show:()=>S('freeagent').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'treasury',t:'prismatic',icon:'box-gold',name:'Royal Treasury',d:'Every 3rd floor, a random completed item arrives.',floor(){const s=S('treasury');s.n=(s.n||0)+1;if(s.n%3===0){addCraft();say('Royal Treasury: a completed item');}},show:()=>`${3-(S('treasury').n||0)%3} floor(s) to go`},
  {id:'printer',t:'prismatic',icon:'nugget',name:'Money Printer',d:'Pays ₽1 at the next floor, then ₽1 more at every floor after that (up to ₽8 a floor).',
    inc:p=>{const s=S('printer'),g=Math.min(8,(s.n||0)+1);if(p)s.n=g;return g;},show:()=>`₽${Math.min(8,(S('printer').n||0)+1)} next floor`},
  {id:'fasttrack',t:'prismatic',icon:'rare-candy',name:'Fast Track',d:'Buying XP costs ₽2 and gives 1 extra XP.',xpc:-2,xpp:1},
  {id:'highroller',t:'prismatic',icon:'dusk-stone',name:'High Roller',d:'Every floor costs you 3 Trainer HP but pays ₽6 more income.',inc:()=>6,floor(){run.hp=Math.max(1,run.hp-3);}},
  {id:'nestegg',t:'prismatic',icon:'mystery-egg',name:'Nest Egg',d:'₽20 of your gold is locked away now (if you have it) and grows 22% every floor. After 6 floors it hatches: about ₽66.',
    gain(){const s=S('nestegg');const a=Math.min(20,run.gold);run.gold-=a;s.v=a;s.n=0;},floor(){const s=S('nestegg');if(!s.v)return;s.v*=1.22;s.n++;if(s.n>=6){const g=Math.round(s.v);run.gold+=g;s.v=0;say(`Nest Egg hatched: +₽${g}!`);}},show:()=>S('nestegg').v?`₽${Math.round(S('nestegg').v)} · ${6-S('nestegg').n} floor(s)`:'hatched'},
  {id:'scout',t:'prismatic',icon:'silph-scope',name:'Talent Scout',d:'A random ₽4 Pokémon joins your bench now, and another at the start of every act.',gain(){gainUnit(randRoot(4),1);},act(){gainUnit(randRoot(4),1);say('Talent Scout: a ₽4 Pokémon joined');}},
  {id:'midas',t:'prismatic',icon:'gold-leaf',name:'Midas Touch',d:'Every 2★ you make pays ₽2. Every 3★ you make brings a completed item.',combine(u){if(u.star===2)run.gold+=2;if(u.star===3){addCraft();say('Midas Touch: a completed item');}}},
  {id:'firesale',t:'prismatic',icon:'charcoal',name:'Fire Sale',d:'The next 8 Pokémon you sell go for double.',gain(){S('firesale').n=8;},sell:u=>S('firesale').n>0?sellValue(u):0,sold(){const s=S('firesale');if(s.n>0)s.n--;},show:()=>`${S('firesale').n||0} sale(s) left`},
  {id:'exchange',t:'prismatic',icon:'up-grade',name:'XP Exchange',d:'When income arrives, every ₽2 you have over ₽50 turns into 1 XP.',floor(){if(run.gold>50&&run.level<MAXLV){const x=Math.floor((run.gold-50)/2);run.gold-=x*2;gainXP(x);if(x)say(`XP Exchange: +${x} XP`);}}},
  {id:'lucky7',t:'prismatic',icon:'lucky-egg',name:'Lucky Seven',d:'If your gold ends in a 7 when income arrives (₽7, ₽17, ₽27…), gain ₽7. Then ₽14 the next time, then ₽21…',
    inc:p=>{const s=S('lucky7');if(run.gold%10!==7)return 0;const g=7*((s.n||0)+1);if(p)s.n=(s.n||0)+1;return g;},show:()=>`next prize ₽${7*((S('lucky7').n||0)+1)}`},
  {id:'heist',t:'prismatic',icon:'grip-claw',name:'Grand Heist',d:'Every enemy your team knocks out has a 20% chance to drop ₽2 (up to ₽8 a battle).',
    kill(src,tg){if(Math.random()<.2&&(battle.heist||0)<8){battle.heist=(battle.heist||0)+2;run.gold+=2;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'+₽2',col:'#ffd34d',life:1.2,label:1});}}},
  {id:'angel',t:'prismatic',icon:'soothe-bell',name:'Angel Investor',d:'+₽1 income for every different set you have active on the field (up to ₽8).',inc:()=>{const tr=countTraits(onField());return Math.min(8,Object.keys(tr).filter(k=>SETS[k]&&tierOf(k,tr[k])).length);}},
  {id:'deflation',t:'prismatic',icon:'poke-doll',name:'Deflation',d:'Every Pokémon in the shop costs ₽1 less (₽2 and up), and sells for ₽1 less. Rerolls cost ₽1 more.',price:r=>MODE.lines[r].cost>=2?-1:0,sell:u=>u.star===1&&lineOf(u).cost>=2?-1:0,rr:1},
  {id:'moneytree',t:'prismatic',icon:'miracle-seed',name:'Money Tree',d:'Pays ₽2 at the next floor, then ₽1 more each floor for 8 floors (₽44 in all), then withers.',
    inc:p=>{const s=S('moneytree');if((s.n||0)>=8)return 0;const g=2+(s.n||0);if(p)s.n=(s.n||0)+1;return g;},show:()=>(S('moneytree').n||0)>=8?'withered':`₽${2+(S('moneytree').n||0)} next floor`},
  {id:'booster',t:'prismatic',icon:'box-silver',name:'Booster Box',d:'Every 2nd floor, gain 2 random item components.',floor(){const s=S('booster');s.n=(s.n||0)+1;if(s.n%2===0){addComp();addComp();say('Booster Box: 2 components');}}},
  {id:'laststand',t:'prismatic',icon:'focus-band',name:'Last-Ditch Fund',d:'While you have 40 Trainer HP or less, income pays ₽7 more.',inc:()=>run.hp<=40?7:0},
  {id:'overflow',t:'prismatic',icon:'wishing-piece',name:'Overflow',d:'Interest past your cap isn\'t lost: every ₽1 of it becomes 1 XP.',
    floor(){const raw=Math.floor((run.gold+interestPad())/interestPer()),over=raw-interestCapOf();if(over>0&&run.level<MAXLV){gainXP(over);say(`Overflow: +${over} XP`);}}},
  {id:'shrine',t:'prismatic',icon:'relic-statue',name:'Shrine Offering',d:'Every floor, ₽2 is offered at the shrine. Every 4th floor, it gives back a 2★ Pokémon of the highest cost you can roll.',inc:()=>-2,
    floor(){const s=S('shrine');s.n=(s.n||0)+1;if(s.n%4===0&&run.bench.includes(null)){gainUnit(randRoot(topCost()),2);say('Shrine Offering: a 2★ Pokémon');}},show:()=>`${4-(S('shrine').n||0)%4} floor(s) to the gift`},
  {id:'merger',t:'prismatic',icon:'prison-bottle',name:'Merger',d:'Whenever you make a 3★, a random 2★ Pokémon one cost higher joins your bench.',combine(u){if(u.star===3){gainUnit(randRoot(Math.min(5,lineOf(u).cost+1)),2);say('Merger: a 2★ Pokémon joined');}}},
  {id:'wishstar',t:'prismatic',icon:'comet-shard',name:'Wishing Star',d:'Every floor, a 12% chance that a random ₽5 Pokémon joins your bench.',floor(){if(Math.random()<.12&&run.bench.includes(null)){gainUnit(randRoot(5),1);say('Wishing Star: a ₽5 Pokémon!');}}},
  {id:'lottery',t:'prismatic',icon:'tm-normal',name:'Lottery Ticket',d:'Every floor, a ₽1 ticket. 1 in 8 tickets wins ₽25.',inc:p=>{if(!p)return-1;if(Math.random()<1/8){say('Lottery Ticket: ₽25!');return 24;}return-1;}},
  {id:'patron',t:'prismatic',icon:'leaders-crest',name:'Patron of the Arts',d:'Your interest and streak gold are both doubled, but your base income is ₽4 lower.',inc:()=>-4+interestOf()+streakGold()},
];
const INVMAP=Object.fromEntries(INVDEF.map(a=>[a.id,a]));
const INVS={silver:INVDEF.filter(a=>a.t==='silver'),gold:INVDEF.filter(a=>a.t==='gold'),prismatic:INVDEF.filter(a=>a.t==='prismatic')};

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

/* ---------- offering ---------- */
function invDue(){if(!run||mode==='over')return false;if(!INV_FLOORS(actOf()).includes(run.floor))return false;return!(run.invsAt||[]).includes(effFloor(run.floor));}
function rollInvTier(){const n=(run.invs||[]).length,x=Math.random();if(actOf()>=ACTS.length)return x<.4?'gold':'prismatic';
  if(n===0)return x<.45?'silver':x<.9?'gold':'prismatic';return x<.25?'silver':x<.7?'gold':'prismatic';}
// nothing you've been offered comes back (unless a tier runs dry)
function invPool(tier,ex){const seen=new Set(run.invSeen||[]);let p=INVS[tier].filter(a=>!ex.has(a.id)&&!seen.has(a.id));if(!p.length)p=INVS[tier].filter(a=>!ex.has(a.id)&&!invIs(a.id));return p;}
function rollInvCard(tier,ex){const p=invPool(tier,ex);return p.length?pick(p):null;}
function rollInvChoices(tier){const ex=new Set(),out=[];for(let i=0;i<3;i++){const a=rollInvCard(tier,ex);if(a){out.push(a.id);ex.add(a.id);}}return out;}
function seenInv(ids){run.invSeen=run.invSeen||[];for(const id of ids)if(!run.invSeen.includes(id))run.invSeen.push(id);}
function applyInv(a,tier){run.invs=run.invs||[];run.invs.push({id:a.id,tier});(run.invsAt=run.invsAt||[]).push(effFloor(run.floor));if(a.gain)a.gain.call(a);combine();}
function botInv(){const t=rollInvTier(),ch=rollInvChoices(t);seenInv(ch);if(ch.length)applyInv(INVMAP[pick(ch)],t);else(run.invsAt=run.invsAt||[]).push(effFloor(run.floor));}
function showInvest(next){
  mode='augment';$('bannerhost').innerHTML='';hideTip();peekOff();showInvest.next=next||showInvest.next;
  if(!run.invOffer||run.invOffer.at!==effFloor(run.floor)){const t=rollInvTier();run.invOffer={at:effFloor(run.floor),tier:t,ids:rollInvChoices(t),rr:[0,0,0]};seenInv(run.invOffer.ids);}
  const O=run.invOffer,tier=O.tier,n=(run.invs||[]).length;
  const card=(id,i)=>{const a=INVMAP[id];if(!a)return'';return`<div class="augcard tier-${tier}" data-i="${i}"><button class="augpick" data-pick="${i}"><div class="augic"><img src="${iconOf(a.icon)}" alt=""></div>
      <span class="augtag t-econ">Investment</span><h2>${esc(a.name)}</h2><p>${a.d}</p></button><button class="btn sm augrr" data-rr="${i}" ${O.rr[i]?'disabled':''}>${O.rr[i]?'Rerolled':'Reroll'}</button></div>`;};
  const mine=myInvs();
  ov.innerHTML=`<div class="scrim"></div><div class="screen augscreen"><div class="tierbanner ${tier}">${tier.toUpperCase()} INVESTMENT · ${['FIRST','SECOND','THIRD','FOURTH','FIFTH','SIXTH'][n]||'#'+(n+1)} PICK</div>
    <h1 class="h1">Choose an investment strategy</h1><p class="sub">On top of your ${esc(run.strat.name)} strategy. Investments last the rest of the run, and each card can be rerolled once.</p>
    <div class="augrow">${O.ids.map(card).join('')}</div><div class="lootacts"><button class="btn" id="augteam">View team</button></div>
    ${mine.length?`<div class="augmine"><span class="lbl">Your investments</span>${mine.map(a=>`<span class="augchip t-${a.t}" title="${esc(a.d)}"><img src="${iconOf(a.icon)}" alt="">${esc(a.name)}</span>`).join('')}</div>`:''}</div>`;
  ov.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const a=INVMAP[O.ids[+b.dataset.pick]];run.invOffer=null;ov.innerHTML='';mode='plan';applyInv(a,tier);renderUI();toast(`${a.name}: ${a.d}`);
    const nx=showInvest.next;showInvest.next=null;if(!evoOpen){if(nx)nx();else banner(`Floor ${run.floor}`,trainerName(run.floor),1400);}});
  ov.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rr;if(O.rr[i])return;const a=rollInvCard(tier,new Set(O.ids));if(a){O.ids[i]=a.id;seenInv([a.id]);}O.rr[i]=1;showInvest();});
  $('augteam').onclick=()=>{hideTip();ov.innerHTML='';peekOn('Back to investments',()=>showInvest());};
}
