"use strict";
/* PokéRun Tactics — investment strategies (in the spirit of Honkai: Star Rail's Currency Wars).
   Picked once, before the run, right after your starting strategy: one of three cards, each rerollable once.
   There are no tiers, and it lasts the whole run. They're mostly about money: interest, streaks, the shop, selling, XP, items, Trainer HP and payouts
   that take time to mature. Nothing you've been offered comes back later in the run.

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
  {id:'savings',icon:'coin-case',name:'Savings Account',d:'Your interest cap rises by ₽4.',cap:4},
  {id:'allowance',icon:'nugget',name:'Allowance',d:'+₽3 income every floor.',inc:()=>3},
  {id:'tipjar',icon:'amulet-coin',name:'Tip Jar',d:'Every win pays ₽3.',after(win){if(win){run.gold+=3;return'Tip Jar +₽3';}}},
  {id:'consolation',icon:'big-pearl',name:'Consolation Prize',d:'Every loss pays ₽5.',after(win){if(!win){run.gold+=5;return'Consolation +₽5';}}},
  {id:'earlybird',icon:'quick-claw',name:'Early Bird',d:'+₽6 income on floors 2–5 of every act.',inc:()=>run.floor>=2&&run.floor<=5?6:0},
  {id:'nightowl',icon:'moon-stone',name:'Night Owl',d:'+₽6 income on floors 6–9 of every act.',inc:()=>run.floor>=6&&run.floor<=9?6:0},
  {id:'thrifty',icon:'berry-pots',name:'Thrifty',d:'If you have less than ₽15 when income arrives, gain ₽6.',inc:()=>run.gold<15?6:0},
  {id:'flatrate',icon:'relic-copper',name:'Flat Rate',d:'Your interest is never less than ₽4, even when you\'re broke.',imin:4},
  {id:'smallchange',icon:'pearl',name:'Small Change',d:'Interest counts as if you had ₽20 more.',pad:20},
  {id:'coinflip',icon:'nugget',name:'Coin Flip',d:'Every floor, flip a coin: heads pays ₽8, tails pays nothing.',inc:p=>p?(Math.random()<.5?8:0):0},
  {id:'travellight',icon:'air-balloon',name:'Travel Light',d:'If your bench is empty when income arrives, gain ₽6.',inc:()=>run.bench.every(x=>!x)?6:0},
  {id:'stockpile',icon:'box-gold',name:'Stockpile',d:'If your bench is full when income arrives, gain ₽5.',inc:()=>run.bench.every(Boolean)?5:0},
  {id:'goldrush',icon:'big-nugget',name:'Gold Rush',d:'+₽5 income every floor, but rerolls cost ₽1 more.',inc:()=>5,rr:1},
  {id:'compound',icon:'amulet-coin',name:'Compound Interest',d:'Interest pays ₽1 for every ₽6 you have instead of ₽10, and its cap rises by ₽1.',per:6,cap:1},
  {id:'hypercompound',icon:'relic-crown',name:'Hypercompound',d:'Interest has no cap of ₽5 any more: it keeps paying ₽1 per ₽10, up to ₽15.',cap:10},
  {id:'leverage',icon:'choice-scarf',name:'Leverage',d:'Your interest cap rises by ₽6, but every loss costs ₽3.',cap:6,after(win){if(!win){run.gold=Math.max(0,run.gold-3);return'Leverage −₽3';}}},
  {id:'goose',icon:'lucky-egg',name:'Golden Goose',d:'Every floor your interest is at its cap, the cap rises by ₽1 (up to +₽10).',
    floor(){const s=S('goose');if(interestOf()>=interestCapOf()&&(s.n||0)<10)s.n=(s.n||0)+1;},cap:()=>S('goose').n||0,show:()=>`cap +₽${S('goose').n||0}`},
  {id:'patron',icon:'leaders-crest',name:'Patron of the Arts',d:'Your interest and streak gold are both doubled, but your base income is ₽4 lower.',inc:()=>-4+interestOf()+streakGold()},
  {id:'overflow',icon:'wishing-piece',name:'Overflow',d:'Interest past your cap isn\'t lost: every ₽1 of it becomes 1 XP.',
    floor(){const raw=Math.floor((run.gold+interestPad())/interestPer()),over=raw-interestCapOf();if(over>0&&run.level<MAXLV){gainXP(over);say(`Overflow: +${over} XP`);}}},

  /* ----- payouts that mature ----- */
  {id:'piggy',icon:'star-piece',name:'Piggy Bank',d:'Every floor, ₽3 drops into the piggy bank (it doesn\'t count for interest). Every 5 floors it breaks open: ₽15.',
    floor(){const s=S('piggy');s.n=(s.n||0)+1;if(s.n>=5){s.n=0;run.gold+=15;say('Piggy Bank: +₽15!');}},show:()=>`₽${3*(S('piggy').n||0)} saved`},
  {id:'venture',icon:'big-nugget',name:'Venture Capital',d:'Gain ₽40 now. You pay back ₽3 at each of the next 10 floors.',gain(){run.gold+=40;S('venture').n=10;},
    inc:p=>{const s=S('venture');if(!s.n)return 0;if(p)s.n--;return-3;},show:()=>S('venture').n?`${S('venture').n} payment(s) left`:'paid off'},
  {id:'futures',icon:'old-amber',name:'Futures Contract',d:'At the start of each act, ₽10 is locked away (if you have it). Beat the guardian and it comes back as ₽30.',
    act(){const s=S('futures');if(run.gold>=10){run.gold-=10;s.held=1;say('Futures Contract: ₽10 locked in');}},gain(){this.act();},
    after(win){const s=S('futures');if(win&&floorKind(run.floor)==='boss'&&s.held){s.held=0;run.gold+=30;return'Futures paid ₽30';}},show:()=>S('futures').held?'₽10 locked in':'nothing locked'},
  {id:'trustfund',icon:'luxury-ball',name:'Trust Fund',d:'Gain ₽20 now and ₽30 at the start of every new act.',gain(){run.gold+=20;},act(){run.gold+=30;say('Trust Fund: +₽30');}},
  {id:'printer',icon:'nugget',name:'Money Printer',d:'Pays ₽1 at the next floor, then ₽1 more at every floor after that (up to ₽6 a floor).',
    inc:p=>{const s=S('printer'),g=Math.min(6,(s.n||0)+1);if(p)s.n=g;return g;},show:()=>`₽${Math.min(6,(S('printer').n||0)+1)} next floor`},
  {id:'moneytree',icon:'miracle-seed',name:'Money Tree',d:'Pays ₽1, then ₽2, then ₽3… up to ₽8 over 8 floors. Then it\'s replanted and starts again.',
    inc:p=>{const s=S('moneytree'),g=(s.n||0)%8+1;if(p)s.n=(s.n||0)+1;return g;},show:()=>`₽${(S('moneytree').n||0)%8+1} next floor`},
  {id:'nestegg',icon:'mystery-egg',name:'Nest Egg',d:'₽20 of your gold is locked away (when you have it) and grows 22% every floor. After 6 floors it hatches for about ₽66, and a new egg is laid.',
    gain(){this.lay();},lay(){const s=S('nestegg');if(run.gold>=20){run.gold-=20;s.v=20;s.n=0;}},
    floor(){const s=S('nestegg');if(!s.v)return this.lay();s.v*=1.22;s.n++;if(s.n>=6){const g=Math.round(s.v);run.gold+=g;s.v=0;say(`Nest Egg hatched: +₽${g}!`);}},show:()=>S('nestegg').v?`₽${Math.round(S('nestegg').v)} · ${6-S('nestegg').n} floor(s)`:'waiting for ₽20'},
  {id:'volatile',icon:'comet-shard',name:'Volatile Asset',d:'An asset worth ₽10 changes value every floor (×0.6 to ×1.8). When it\'s worth ₽40 or more, it pays out in full and a new one starts at ₽10.',
    gain(){S('volatile').v=10;},floor(){const s=S('volatile');s.v=Math.max(2,Math.round((s.v||10)*(.6+Math.random()*1.2)));if(s.v>=40){run.gold+=s.v;say(`Volatile Asset paid out ₽${s.v}!`);s.v=10;}},show:()=>`worth ₽${S('volatile').v||10}`},
  {id:'lottery',icon:'tm-normal',name:'Lottery Ticket',d:'Every floor, a ₽1 ticket. 1 in 6 tickets wins ₽25.',inc:p=>{if(!p)return-1;if(Math.random()<1/6){say('Lottery Ticket: ₽25!');return 24;}return-1;}},
  {id:'lucky7',icon:'lucky-egg',name:'Lucky Seven',d:'If your gold ends in a 7 when income arrives (₽7, ₽17, ₽27…), gain ₽7. Then ₽14 the next time, then ₽21…',
    inc:p=>{const s=S('lucky7');if(run.gold%10!==7)return 0;const g=7*((s.n||0)+1);if(p)s.n=(s.n||0)+1;return g;},show:()=>`next prize ₽${7*((S('lucky7').n||0)+1)}`},
  {id:'allin',icon:'relic-gold',name:'All In',d:'Gain ₽60 now. You earn no interest for the rest of this act.',gain(){run.gold+=60;S('allin').a=actOf();},noInterest:()=>S('allin').a===actOf(),show:()=>S('allin').a===actOf()?'no interest this act':'interest is back'},
  {id:'loyalty',icon:'soothe-bell',name:'Loyalty Card',d:'Every 3 floors in a row without selling a Pokémon pays ₽12.',sold(){S('loyalty').n=0;},
    floor(){const s=S('loyalty');s.n=(s.n||0)+1;if(s.n>=3){s.n=0;run.gold+=12;say('Loyalty Card: +₽12');}},show:()=>`${S('loyalty').n||0}/3 floors`},
  {id:'patience',icon:'iron-ball',name:'Patience',d:'+₽2 income for every floor in a row you\'ve gone without rerolling (up to +₽8).',reroll(){S('patience').n=0;},
    floor(){const s=S('patience');s.n=(s.n||0)+1;},inc:()=>Math.min(8,2*Math.max(0,(S('patience').n||1)-1)),show:()=>`${Math.max(0,(S('patience').n||1)-1)} floor(s) without rerolling`},

  /* ----- streaks, wins and losses ----- */
  {id:'streaker',icon:'quick-powder',name:'Streak Keeper',d:'While you\'re on any streak of 2 or more, streak gold pays ₽3 more.',streak:()=>Math.abs(run.streak)>=2?3:0},
  {id:'bull',icon:'muscle-band',name:'Bull Market',d:'Each win in a row raises your income by ₽2 more (up to +₽10). A loss resets it.',inc:()=>run.streak>0?Math.min(10,2*run.streak):0},
  {id:'bear',icon:'black-sludge',name:'Bear Market',d:'Each loss in a row pays more than the last: ₽3, ₽6, ₽9, up to ₽12.',after(win){if(!win){const g=Math.min(12,3*Math.abs(Math.min(-1,run.streak)));run.gold+=g;return`Bear Market +₽${g}`;}}},
  {id:'hedge',icon:'protective-pads',name:'Hedge Fund',d:'Streak gold pays ₽1 more, and uses your longest win or loss streak this act, even after it ends.',
    floor(){const s=S('hedge');if(s.a!==actOf()){s.a=actOf();s.m=0;}s.m=Math.max(s.m||0,Math.abs(run.streak));},streak:()=>{const m=S('hedge').m||0,c=Math.abs(run.streak),g=x=>x>=5?3:x>=4?2:x>=2?1:0;return 1+Math.max(0,g(m)-g(c));},show:()=>`best streak ${S('hedge').m||0}`},
  {id:'sponsor',icon:'soothe-bell',name:'Sponsorship Deal',d:'Every win pays ₽2 for each win in your current streak (3rd win in a row: ₽6).',after(win){if(win){const g=2*Math.max(1,run.streak);run.gold+=g;return`Sponsor +₽${g}`;}}},
  {id:'warchest',icon:'box-silver',name:'War Chest',d:'Beating a rival or a guardian pays ₽15.',after(win){const k=floorKind(run.floor);if(win&&(k==='elite'||k==='boss')){run.gold+=15;return'War Chest +₽15';}}},
  {id:'flawless',icon:'focus-sash',name:'Flawless Bonus',d:'Win a battle without any of your Pokémon fainting to get ₽6.',after(win,fought,lost){if(win&&!lost){run.gold+=6;return'Flawless +₽6';}}},
  {id:'tollroad',icon:'bicycle',name:'Toll Road',d:'Every battle you win against a full enemy team (5 or more) pays ₽4.',after(win){if(win&&units.filter(c=>c.team===1&&!c.summon).length>=5){run.gold+=4;return'Toll Road +₽4';}}},
  {id:'mvp',icon:'leaders-crest',name:'MVP Bonus',d:'After every battle, your top damage dealer earns ₽1 per 1,500 damage (up to ₽6).',
    after(win,fought,lost){const top=Math.max(0,...units.filter(c=>c.team===0).map(c=>c.mDmg||0)),g=Math.min(6,Math.floor(top/1500));if(g){run.gold+=g;return`MVP +₽${g}`;}}},
  {id:'commission',icon:'honey',name:'Commission',d:'Every 2 enemies your team knocks out pay ₽1 at the next income.',kill(){S('commission').k=(S('commission').k||0)+1;},
    inc:p=>{const s=S('commission'),g=Math.floor((s.k||0)/2);if(p)s.k=(s.k||0)%2;return g;},show:()=>`${S('commission').k||0} knockouts banked`},
  {id:'bounty',icon:'scope-lens',name:'Bounty Board',d:'In every battle the toughest enemy has a bounty: knock it out for ₽5.',
    start(mine,foes){const b=foes.slice().sort((a,b)=>b.maxHp-a.maxHp)[0];if(b){b.bounty=1;if(!SIM.on)texts.push({x:b.x,y:b.y-40,txt:'Bounty!',col:'#ffd34d',life:1.6,label:1});}},kill(src,tg){if(tg.bounty){tg.bounty=0;run.gold+=5;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'+₽5',col:'#ffd34d',life:1.2,label:1});}}},
  {id:'heist',icon:'grip-claw',name:'Grand Heist',d:'Every enemy your team knocks out has a 30% chance to drop ₽2 (up to ₽8 a battle).',
    kill(src,tg){if(Math.random()<.3&&(battle.heist||0)<8){battle.heist=(battle.heist||0)+2;run.gold+=2;if(!SIM.on)texts.push({x:tg.x,y:tg.y-30,txt:'+₽2',col:'#ffd34d',life:1.2,label:1});}}},

  /* ----- Trainer HP ----- */
  {id:'policy',icon:'sitrus-berry',name:'Health Policy',d:'Losses cost 4 less Trainer HP, and every loss pays ₽2.',hpLoss:-4,after(win){if(!win){run.gold+=2;return'Health Policy +₽2';}}},
  {id:'insurance',icon:'rocky-helmet',name:'Insurance',d:'Pay ₽1 every floor. The first two losses of every act cost no Trainer HP and pay out ₽10 each.',inc:()=>-1,
    shield(){const s=S('insurance');if(s.a!==actOf()){s.a=actOf();s.n=0;}if(s.n>=2)return false;s.n++;run.gold+=10;say('Insurance paid out ₽10');return true;},show:()=>{const s=S('insurance');return`${s.a===actOf()?2-(s.n||0):2} claim(s) left this act`;}},
  {id:'parachute',icon:'sacred-ash',name:'Golden Parachute',d:'The first time your Trainer HP would drop to 0, you\'re left at 25 instead and gain ₽30.',
    save(){const s=S('parachute');if(s.done)return false;s.done=1;run.hp=25;run.gold+=30;say('Golden Parachute! Back to 25 HP and +₽30');return true;},show:()=>S('parachute').done?'used':'ready'},
  {id:'crowdfund',icon:'heal-ball',name:'Crowdfunding',d:'+₽1 income for every 8 Trainer HP you\'re missing.',inc:()=>Math.floor((run.maxHp-run.hp)/8)},
  {id:'reserves',icon:'max-revive',name:'Emergency Reserves',d:'The first time your Trainer HP drops below 40, gain ₽40 and 5 free rerolls.',
    after(){const s=S('reserves');if(!s.done&&run.hp<40&&run.hp>0){s.done=1;run.gold+=40;run.freeRerolls=(run.freeRerolls||0)+5;return'Emergency Reserves +₽40';}}},
  {id:'laststand',icon:'focus-band',name:'Last-Ditch Fund',d:'While you have 50 Trainer HP or less, income pays ₽7 more.',inc:()=>run.hp<=50?7:0},
  {id:'highroller',icon:'dusk-stone',name:'High Roller',d:'While you have more than 30 Trainer HP, every floor costs you 2 HP but pays ₽6 more income.',inc:()=>run.hp>30?6:0,floor(){if(run.hp>30)run.hp-=2;}},

  /* ----- the shop ----- */
  {id:'coupon',icon:'premier-ball',name:'Coupon Book',d:'The first 3 Pokémon you buy each floor cost ₽1 less (₽2 and up).',
    price:r=>{const s=S('coupon');return(s.f!==effFloor(run.floor)||(s.n||0)<3)&&MODE.lines[r].cost>=2?-1:0;},buy(u){const s=S('coupon');if(s.f!==effFloor(run.floor)){s.f=effFloor(run.floor);s.n=0;}if(lineOf(u).cost>=2)s.n++;},
    show:()=>{const s=S('coupon');return`${s.f===effFloor(run.floor)?3-(s.n||0):3} left this floor`;}},
  {id:'freeagent',icon:'cherish-ball',name:'Free Agency',d:'The first Pokémon you buy each floor is free.',free:()=>S('freeagent').f!==effFloor(run.floor),buy(){S('freeagent').f=effFloor(run.floor);},show:()=>S('freeagent').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'deflation',icon:'poke-doll',name:'Deflation',d:'Every Pokémon in the shop costs ₽1 less (₽2 and up), and sells for ₽1 less. Rerolls cost ₽1 more.',price:r=>MODE.lines[r].cost>=2?-1:0,sell:u=>u.star===1&&lineOf(u).cost>=2?-1:0,rr:1},
  {id:'referral',icon:'friend-ball',name:'Referral Bonus',d:'The 3rd and 6th Pokémon you buy each floor pay ₽3 each.',
    buy(){const s=S('referral');if(s.f!==effFloor(run.floor)){s.f=effFloor(run.floor);s.n=0;}s.n++;if(s.n===3||s.n===6){run.gold+=3;say('Referral Bonus: +₽3');}}},
  {id:'trending',icon:'soothe-bell',name:'Trending',d:'Every floor, three Pokémon lines are trending (shown in Run info). Buying one pays ₽4 back, twice a floor.',
    floor(){const p=shuffle(MODE.byCost.flat().filter(r=>MODE.lines[r].cost<=topCost()));const s=S('trending');s.r=p.slice(0,3);s.n=0;},
    buy(u){const s=S('trending');if((s.r||[]).includes(u.root)&&(s.n||0)<2){s.n=(s.n||0)+1;run.gold+=4;say('Trending: +₽4');}},show:()=>{const r=S('trending').r||[];return r.length?r.map(x=>D[x].n).join(', '):'—';}},
  {id:'shortsell',icon:'black-glasses',name:'Short Selling',d:'When you sell a Pokémon, the next copy of that line you buy is free (once a floor).',
    sold(u){(S('shortsell').l=S('shortsell').l||[]).push(u.root);},free:r=>S('shortsell').f!==effFloor(run.floor)&&(S('shortsell').l||[]).includes(r),
    buy(u){const s=S('shortsell');const i=(s.l||[]).indexOf(u.root);if(i>=0&&s.f!==effFloor(run.floor)){s.l.splice(i,1);s.f=effFloor(run.floor);}}},
  {id:'rebate',icon:'gold-bottle-cap',name:'Reroll Rebate',d:'Every 2nd reroll gives your ₽ back.',reroll(){const s=S('rebate');s.n=(s.n||0)+1;if(s.n%2===0){run.gold+=rerollCost();say('Reroll Rebate: refunded');}},show:()=>S('rebate').n%2?'next reroll is refunded':'—'},
  {id:'luckyroll',icon:'lucky-egg',name:'Lucky Roll',d:'Every reroll has a 25% chance to be free and pay ₽3.',reroll(){if(Math.random()<.25){run.gold+=rerollCost()+3;say('Lucky Roll! +₽3');}}},
  {id:'jackpot',icon:'lucky-punch',name:'Jackpot',d:'Every reroll has a 6% chance to hit the jackpot for ₽40.',reroll(){if(Math.random()<.06){run.gold+=40;say('JACKPOT! +₽40');}}},
  {id:'cashback',icon:'gold-bottle-cap',name:'Cashback',d:'25% of what you spend on rerolls and XP comes back at the next income.',
    spent(n,k){if(k!=='buy')S('cashback').s=(S('cashback').s||0)+n;},inc:p=>{const s=S('cashback'),g=Math.floor((s.s||0)*.25);if(p)s.s=0;return g;},show:()=>`₽${Math.floor((S('cashback').s||0)*.25)} pending`},
  {id:'bluechip',icon:'master-ball',name:'Blue Chip',d:'+₽2 income for every ₽4 or ₽5 Pokémon on your field.',inc:()=>2*onField().filter(u=>lineOf(u).cost>=4).length},
  {id:'collection',icon:'town-map',name:'Collector\'s Edition',d:'+₽1 income for every different ₽4 or ₽5 line you\'ve owned this run.',
    floor(){const s=S('collection');s.l=s.l||[];for(const u of allOwned())if(lineOf(u).cost>=4&&!s.l.includes(u.root))s.l.push(u.root);},inc:()=>(S('collection').l||[]).length,show:()=>`${(S('collection').l||[]).length} line(s)`},

  /* ----- selling ----- */
  {id:'yardsale',icon:'pretty-wing',name:'Yard Sale',d:'The first 2 Pokémon you sell each floor sell for ₽2 more.',
    sell:()=>{const s=S('yardsale');return s.f!==effFloor(run.floor)||(s.n||0)<2?2:0;},sold(){const s=S('yardsale');if(s.f!==effFloor(run.floor)){s.f=effFloor(run.floor);s.n=0;}s.n++;}},
  {id:'firesale',icon:'charcoal',name:'Fire Sale',d:'The first Pokémon you sell each floor goes for double.',sell:u=>S('firesale').f!==effFloor(run.floor)?sellValue(u):0,sold(){S('firesale').f=effFloor(run.floor);},show:()=>S('firesale').f===effFloor(run.floor)?'used this floor':'ready'},
  {id:'appraiser',icon:'scope-lens',name:'Appraiser',d:'2★ Pokémon sell for ₽3 more and 3★ Pokémon for ₽8 more.',sell:u=>u.star>=3?8:u.star===2?3:0},
  {id:'tradein',icon:'up-grade',name:'Trade-In',d:'Selling a Pokémon has a 40% chance to bring a random Pokémon one cost higher to your bench.',
    sold(u){const c=Math.min(5,lineOf(u).cost+1);if(Math.random()<.4&&run.bench.includes(null)){gainUnit(randRoot(c),1);say('Trade-In: a new Pokémon arrived');}}},

  /* ----- stars and Pokémon ----- */
  {id:'dividends',icon:'gold-leaf',name:'Dividends',d:'+₽1 income for every 2★ Pokémon you own, and ₽3 for every 3★.',inc:()=>allOwned().reduce((s,u)=>s+(u.star>=3?3:u.star===2?1:0),0)},
  {id:'royalties',icon:'crown-pass',name:'Royalties',d:'Every 2★ you make pays ₽1 at every floor for the rest of the run, and every 3★ ₽3.',combine(u){const s=S('royalties');s.n=(s.n||0)+(u.star===3?3:u.star===2?1:0);},inc:()=>S('royalties').n||0,show:()=>`₽${S('royalties').n||0} a floor`},
  {id:'midas',icon:'gold-leaf',name:'Midas Touch',d:'Every 2★ you make pays ₽2. Every 3★ you make brings a completed item.',combine(u){if(u.star===2)run.gold+=2;if(u.star===3){addCraft();say('Midas Touch: a completed item');}}},
  {id:'merger',icon:'prison-bottle',name:'Merger',d:'Whenever you make a 3★, a random 2★ Pokémon one cost higher joins your bench.',combine(u){if(u.star===3){gainUnit(randRoot(Math.min(5,lineOf(u).cost+1)),2);say('Merger: a 2★ Pokémon joined');}}},
  {id:'scout',icon:'silph-scope',name:'Talent Scout',d:'A random ₽4 Pokémon joins your bench now, and another at the start of every act.',gain(){gainUnit(randRoot(4),1);},act(){gainUnit(randRoot(4),1);say('Talent Scout: a ₽4 Pokémon joined');}},
  {id:'wishstar',icon:'comet-shard',name:'Wishing Star',d:'Every floor, a 15% chance that a random ₽5 Pokémon joins your bench.',floor(){if(Math.random()<.15&&run.bench.includes(null)){gainUnit(randRoot(5),1);say('Wishing Star: a ₽5 Pokémon!');}}},
  {id:'shrine',icon:'relic-statue',name:'Shrine Offering',d:'Every floor, ₽2 is offered at the shrine. Every 4th floor, it gives back a 2★ Pokémon of the highest cost you can roll.',inc:()=>-2,
    floor(){const s=S('shrine');s.n=(s.n||0)+1;if(s.n%4===0&&run.bench.includes(null)){gainUnit(randRoot(topCost()),2);say('Shrine Offering: a 2★ Pokémon');}},show:()=>`${4-(S('shrine').n||0)%4} floor(s) to the gift`},
  {id:'apprentice',icon:'muscle-band',name:'Apprenticeship',d:'Every floor, your lowest-star Pokémon on the field permanently gains +20 max HP and +2 Attack and Sp. Atk.',
    floor(){const u=onField().sort((a,b)=>a.star-b.star||lineOf(a).cost-lineOf(b).cost)[0];if(u){u.g=u.g||{};u.g.hp=(u.g.hp||0)+20;u.g.atk=(u.g.atk||0)+2;u.g.spa=(u.g.spa||0)+2;}}},
  {id:'angel',icon:'soothe-bell',name:'Angel Investor',d:'+₽1 income for every different set you have active on the field (up to ₽8).',inc:()=>{const tr=countTraits(onField());return Math.min(8,Object.keys(tr).filter(k=>SETS[k]&&tierOf(k,tr[k])).length);}},

  /* ----- XP and levels ----- */
  {id:'studybond',icon:'exp-share',name:'Study Bond',d:'Every 2nd floor, gain 6 XP.',floor(){const s=S('studybond');s.n=(s.n||0)+1;if(s.n%2===0){gainXP(6);say('Study Bond: +6 XP');}},show:()=>S('studybond').n%2?'XP next floor':'XP in 2 floors'},
  {id:'tuition',icon:'wise-glasses',name:'Tuition',d:'Buying XP gives 2 extra XP.',xpp:2},
  {id:'subsidy',icon:'rare-candy',name:'Level Subsidy',d:'Buying XP costs ₽1 less and gives 1 extra XP.',xpc:-1,xpp:1},
  {id:'fasttrack',icon:'rare-candy',name:'Fast Track',d:'Buying XP costs ₽2 less, but you get 2 less XP from each floor.',xpc:-2,floor(){run.xp=Math.max(0,run.xp-2);}},
  {id:'tutor',icon:'exp-share',name:'Private Tutor',d:'Gain 4 extra XP every floor, but your base income is ₽1 lower.',inc:()=>-1,floor(){gainXP(4);}},
  {id:'practice',icon:'rare-candy',name:'Practice Rolls',d:'Every reroll gives 1 XP.',reroll(){gainXP(1);}},
  {id:'scholar',icon:'rare-candy',name:'Scholarship',d:'Every time your trainer level goes up, gain ₽8.',level(lv){run.gold+=8;say(`Scholarship: +₽8 for level ${lv}`);}},
  {id:'pocketmoney',icon:'pass-orb',name:'Pocket Money',d:'Gain ₽25 now, and ₽3 every time you level up.',gain(){run.gold+=25;},level(){run.gold+=3;}},
  {id:'exchange',icon:'up-grade',name:'XP Exchange',d:'When income arrives, every ₽2 you have over ₽50 turns into 1 XP.',floor(){if(run.gold>50&&run.level<MAXLV){const x=Math.floor((run.gold-50)/2);run.gold-=x*2;gainXP(x);if(x)say(`XP Exchange: +${x} XP`);}}},

  /* ----- items, chests and paths ----- */
  {id:'crate',icon:'box-normal',name:'Supply Crate',d:'Every 2nd floor, a random item component arrives.',floor(){const s=S('crate');s.n=(s.n||0)+1;if(s.n%2===0){addComp();say('Supply Crate: a component');}},show:()=>S('crate').n%2?'a component next floor':'a component in 2 floors'},
  {id:'booster',icon:'box-silver',name:'Booster Box',d:'Every 3rd floor, gain 2 random item components.',floor(){const s=S('booster');s.n=(s.n||0)+1;if(s.n%3===0){addComp();addComp();say('Booster Box: 2 components');}},show:()=>`${3-(S('booster').n||0)%3} floor(s) to go`},
  {id:'treasury',icon:'box-gold',name:'Royal Treasury',d:'Every 4th floor, a random completed item arrives.',floor(){const s=S('treasury');s.n=(s.n||0)+1;if(s.n%4===0){addCraft();say('Royal Treasury: a completed item');}},show:()=>`${4-(S('treasury').n||0)%4} floor(s) to go`},
  {id:'scrap',icon:'metal-coat',name:'Scrap Dealer',d:'+₽1 income for every item your field holds (up to ₽6).',inc:()=>Math.min(6,onField().reduce((s,u)=>s+u.items.length,0))},
  {id:'treasuremap',icon:'town-map',name:'Treasure Map',d:'Every chest you open also holds ₽6.',chest(){run.gold+=6;}},
  {id:'pathfinder',icon:'mach-bike',name:'Pathfinder',d:'Taking a Mystery, Pokémon Center or Kecleon Shop path pays ₽10.',node(k){if(['event','center','shop'].includes(k)){run.gold+=10;say('Pathfinder: +₽10');}}},
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

/* ---------- offering: once, before the run ---------- */
function rollInvCard(ex){const p=INVDEF.filter(a=>!ex.has(a.id));return p.length?pick(p):null;}
function rollInvChoices(){const ex=new Set(),out=[];for(let i=0;i<3;i++){const a=rollInvCard(ex);if(a){out.push(a.id);ex.add(a.id);}}return out;}
function applyInv(a){run.invs=[{id:a.id}];if(a.gain)a.gain.call(a);}
function botInv(){const ch=rollInvChoices();if(ch.length)applyInv(INVMAP[pick(ch)]);}
// the second half of the strategy screen; done() starts the run
function showInvest(done,back){
  if(done)showInvest.done=done;if(back)showInvest.back=back;
  if(!run.invOffer)run.invOffer={ids:rollInvChoices(),rr:[0,0,0]};
  const O=run.invOffer;
  const card=(id,i)=>{const a=INVMAP[id];if(!a)return'';return`<div class="augcard tier-gold" data-i="${i}"><button class="augpick" data-pick="${i}"><div class="augic"><img src="${iconOf(a.icon)}" alt=""></div>
      <span class="augtag t-econ">Investment</span><h2>${esc(a.name)}</h2><p>${a.d}</p></button><button class="btn sm augrr" data-rr="${i}" ${O.rr[i]?'disabled':''}>${O.rr[i]?'Rerolled':'Reroll'}</button></div>`;};
  ov.innerHTML=`<div class="scrim"></div><div class="screen augscreen">    <h1 class="h1">Choose an investment strategy</h1><p class="sub">It works alongside ${esc(run.strat.name)} for the whole run. You only get one, and each card can be rerolled once.</p>
    <div class="augrow">${O.ids.map(card).join('')}</div><div class="lootacts"><button class="btn" id="invback">Back to strategies</button></div></div>`;
  ov.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const a=INVMAP[O.ids[+b.dataset.pick]];run.invOffer=null;ov.innerHTML='';applyInv(a);
    const d=showInvest.done;showInvest.done=showInvest.back=null;d();toast(`${a.name}: ${a.d}`);});
  ov.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rr;if(O.rr[i])return;const a=rollInvCard(new Set(O.ids));if(a)O.ids[i]=a.id;O.rr[i]=1;showInvest();});
  $('invback').onclick=()=>{const b=showInvest.back;showInvest.done=showInvest.back=null;run=null;b();};
}
