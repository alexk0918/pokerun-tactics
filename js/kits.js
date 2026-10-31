/* PokéRun Tactics: signature kits.
   A signature kit replaces a line's generic move with a hand-designed ability that matches the Pokémon's design.
   Each kit lists its evolution line in `ids`; array values are per stage (index = position in ids). */

const SIGS={};
function defSig(S){for(const id of S.ids)SIGS[id]=S;}
function sigOf(dex){if(SIGS[dex])return SIGS[dex];const F=typeof FORMS!=='undefined'&&FORMS[dex];return F&&SIGS[F.base]||null;}
function sigStage(S,dex){const F=typeof FORMS!=='undefined'&&FORMS[dex];const b=F?F.base:dex;const i=S.ids.indexOf(b);return i<0?S.ids.length-1:i;}
const sv=(v,i)=>Array.isArray(v)?v[Math.min(i,v.length-1)]:v;
function applySig(K,dex){
  const S=sigOf(dex);if(!S)return K;const i=sigStage(S,dex);
  Object.assign(K,{sig:S,si:i,type:S.type||'cast',cls:S.cls,cat:S.cat,range:sv(S.range,i),mana:sv(S.mana,i),start:sv(S.start??10,i),aoe:0,hits:1,role:S.role,
    sigPf:sv(S.pf,i),asMul:S.as||1,mv:Object.assign({},K.mv,{n:sv(S.names,i),t:S.mvType||K.mv.t,hmin:0,hmax:0,ail:0,fl:0,dr:0,st:[]}),
    ladder:S.ids.length>1?S.ids.filter(x=>D[x]).map(x=>({dex:x,n:sv(S.names,S.ids.indexOf(x))})):null});
  return K;
}

/* ---------- shared helpers ---------- */
const V=(c,m=1,cat=c.cat)=>(c.base+KIT.castRatio*c.pf*(cat==='spec'?c.spa:c.atk))*m;
// colored damage text for tooltips: "123 (40 + 150% Sp. Atk) special damage"
function DT(c,m=1,cat=c.cat,kind){
  const k=cat==='spec'?'spa':'atk',sn=cat==='spec'?'Sp. Atk':'Attack',w=kind||(cat==='spec'?'special':'physical'),kc=kind==='true'?'true':k;
  return`<b class="s-${kc}">${Math.round(V(c,m,cat))}</b> <span class="sc">(${Math.round(c.base*m)} + <span class="s-${k}">${pct(KIT.castRatio*c.pf*m)} ${sn}</span>)</span> <span class="s-${kc}">${w}</span> damage`;
}
const tierLine=(on,t)=>`<span class="${on?'tier-on':'tier-off'}">${t}</span>`;
const foesOf=c=>alive(1-c.team);
const near=(t,r)=>alive(t.team).filter(o=>o!==t&&hdist(o,t)<=r);
function hitAb(c,t,m,o={}){if(!t||t.dead)return 0;const cat=o.cat||c.cat;return damage(c,t,V(c,m,cat)+(o.flat||0),{ab:1,cat,type:c.mv.t,...o});}
function boom(t,col,sz=1){if(SIM.on)return;burst(t.x,t.y-10,col,14*sz,1+.3*sz);ring(t.x,t.y-6,col);if(sz>1)ring(t.x,t.y-6,'#ffffff');}
function debuff(t,stat,p,dur){if(t.dead)return;t[stat]*=1-p;schedule(dur,()=>{t[stat]/=1-p;});}
// projectile: fast bullet, or an arcing missile (Kai'Sa style) that curves in from the side
function fire(c,t,col,onHit,o={}){
  if(!t)return;if(SIM.on){if(!t.dead)onHit();return;}
  const p={x:c.x,y:c.y-12,tg:t,col,onHit,size:o.size||3,trail:[],sp:o.sp||260};
  if(o.arc){const mx=(c.x+t.x)/2,my=(c.y+t.y)/2-10;p.arc={sx:c.x,sy:c.y-12,cx:mx+(o.side??rnd(-40,40)),cy:Math.min(c.y,t.y)-(o.lift||70),t:0,dur:o.dur||.6};p.retarget=o.retarget?1-c.team:-1;}
  proj.push(p);
}
// leap or dash to a free hex next to the target (behind it, seen from the attacker, when `behind`)
function dashTo(c,t,behind,dur=.2){
  const opts=nbrs(t.c,t.r).filter(h=>!occupied(h.c,h.r,c));if(!opts.length)return false;
  opts.sort((a,b)=>behind?hdist(b,c)-hdist(a,c):hdist(a,c)-hdist(b,c));
  const h=opts[0],p=hexXY(h.c,h.r);c.move={c:h.c,r:h.r,fx:c.x,fy:c.y,tx:p.x,ty:p.y,t:0,dur};c.dir=dirFrom(p.x-c.x,(p.y-c.y)/SQ);c.target=t;
  if(!SIM.on)for(let i=0;i<8;i++)fx.push({x:c.x+rnd(-5,5),y:c.y-rnd(4,20),vx:0,vy:0,life:.35,max:.35,col:tcol(c),sz:2,g:0});
  return true;
}
function knock(c,t){if(t.dead||t.stunImm)return;const opts=nbrs(t.c,t.r).filter(h=>!occupied(h.c,h.r,t)&&hdist(h,c)>hdist(t,c));if(!opts.length)return;
  const h=pick(opts),p=hexXY(h.c,h.r);t.move={c:h.c,r:h.r,fx:t.x,fy:t.y,tx:p.x,ty:p.y,t:0,dur:.18};stun(t,.25);}
function cluster(c){let best=null,bn=-1;for(const o of foesOf(c)){const n=near(o,1).length;if(n>bn||(n===bn&&hdist(o,c)<hdist(best,c))){bn=n;best=o;}}return best;}
function lineHits(c,t){const dx=t.x-c.x,dy=(t.y-c.y)/SQ,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  return foesOf(c).filter(o=>{const ox=o.x-c.x,oy=(o.y-c.y)/SQ,pr=ox*ux+oy*uy;return pr>0&&Math.abs(ox*uy-oy*ux)<15;});}
function lineFx(a,b,col,w=1,life=.35){if(!SIM.on)fx.push({line:1,x1:a.x,y1:a.y-12,x2:b.x,y2:b.y-10,life,max:life,col,w});}
/* ground zones: hexes that tick every half second */
function zone(c,at,rad,dur,col,fn,friendly){battle.zones=battle.zones||[];battle.zones.push({c:at.c,r:at.r,rad,until:combatT+dur,col,fn,acc:0,team:c.team,friendly});}
const inZone=(z,team)=>alive(team).filter(o=>hdist(o,z)<=z.rad);
function tickZones(dt){if(!battle||!battle.zones)return;for(const z of battle.zones){z.acc+=dt;while(z.acc>=.5){z.acc-=.5;z.fn(z);}}battle.zones=battle.zones.filter(z=>combatT<z.until);}
function drawZones(t){if(!battle||!battle.zones||(mode!=='combat'&&mode!=='result'))return;
  for(const z of battle.zones){const c=hex2rgb(z.col),a=.16+.06*Math.sin(t*8+z.c),fade=Math.min(1,(z.until-combatT)*2);
    for(let r=0;r<ROWS;r++)for(let q=0;q<COLS;q++)if(hdist({c:q,r},z)<=z.rad){const p=hexXY(q,r);hexPath(ctx,p.x,p.y,R-2,SQ);ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*fade})`;ctx.fill();
      if(!z.friendly&&Math.random()<.06)fx.push({x:p.x+rnd(-8,8),y:p.y-rnd(0,6),vx:0,vy:-22,life:.5,max:.5,col:z.col,sz:1,g:0});}}}

/* ================= Signature kits ================= */
// Inteleon: a sniper. Basic attacks go to the front; the move picks off the back line.
defSig({ids:[816,817,818],role:'Sniper',cls:'Mystic',cat:'spec',range:[3,4,4],mana:[85,90,90],pf:[.9,1.1,1.3],as:.85,names:['Water Gun','Water Pulse','Snipe Shot'],
  d:(c,i)=>`Basic attacks hit the nearest enemy. Its move ignores range: it takes aim at the <b>farthest</b> enemy for 0.5s, then fires a shot that can't be dodged for ${DT(c,2)}, ignoring 30% of the target's <span class="s-def">Sp. Def</span>. Can crit.${i===2?' A knockout refunds 30 PP.':''}`,
  cast(c,tg,i){const far=foesOf(c).sort((a,b)=>hdist(c,b)-hdist(c,a)||a.hp-b.hp)[0]||tg;c.busy=Math.max(c.busy,.6);
    lineFx(c,far,'#ff4d4d',1,.5);
    schedule(.5,()=>{if(c.dead||far.dead)return;fire(c,far,'#bff0ff',()=>{hitAb(c,far,2,{pen:.3,cr:.15});boom(far,'#7fd8ff');if(far.dead&&i===2)gainMana(c,30);},{sp:760,size:3});});}});

// Chesnaught: the knight. Spiky armor punishes attackers; Body Press scales with Defense.
const chesM=[.6,.8,1];
defSig({ids:[650,651,652],role:'Knight',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:80,start:25,pf:1,names:['Vine Whip','Needle Arm','Spiky Shield'],mvType:'Grass',
  begin(c,i){c.thorns=()=>(10+.35*c.def)*(c.spikyT>combatT?3:1)*chesM[i];},
  d:(c,i)=>`<b>Passive:</b> enemies that hit it with basic attacks take <b class="s-atk">${Math.round((10+.35*c.def)*chesM[i])}</b> <span class="sc">(10 + <span class="s-def">35% Defense</span>)</span> <span class="s-atk">physical</span> damage.<br><b>${sv(['Vine Whip','Needle Arm','Spiky Shield'],i)}:</b> gains a <b class="s-hp">${Math.round((c.maxHp*.18+c.base*.5)*chesM[i])}</b> <span class="sc">(18% <span class="s-hp">max HP</span>)</span> shield and triples its spikes for 4s, then Body Presses the target and adjacent enemies (70%) for <b class="s-def">${Math.round((c.base*.6+2*c.def)*chesM[i])}</b> <span class="sc">(${Math.round(c.base*.6*chesM[i])} + <span class="s-def">${Math.round(200*chesM[i])}% Defense</span>)</span> <span class="s-atk">physical</span> damage.`,
  cast(c,tg,i){const m=chesM[i];c.shield+=(c.maxHp*.18+c.base*.5)*m;c.spikyT=combatT+4;if(!SIM.on){ring(c.x,c.y-8,'#8fd16a');burst(c.x,c.y-12,'#d9c48a',16,1);}
    schedule(.35,()=>{if(c.dead||tg.dead)return;for(const t of[tg,...near(tg,1)])damage(c,t,(c.base*.6+2*c.def)*m*(t===tg?1:.7),{ab:1,cat:'phys',type:'Fighting'});boom(tg,'#c9a46b',2);});}});

// Delphox: the mage. Exploding fireballs that leave flame pillars behind.
defSig({ids:[653,654,655],role:'Mage',cls:'Mystic',cat:'spec',range:3,mana:75,pf:[.75,.9,1],names:['Ember','Psybeam','Mystical Fire'],mvType:'Fire',
  d:(c,i)=>`Hurls a fireball that explodes on the target for ${DT(c,1.1)} (70% to adjacent enemies) and lowers their <span class="s-spa">Sp. Atk</span> by 20% for 4s.${i?` Leaves a pillar of flame for ${i===2?3:2}s that deals ${DT(c,.12)} every half second to enemies inside.`:''}`,
  cast(c,tg,i){fire(c,tg,'#ff8a3c',()=>{for(const t of[tg,...near(tg,1)]){hitAb(c,t,t===tg?1.1:.77);debuff(t,'spa',.2,4);}boom(tg,'#ff8a3c',2);
    if(i)zone(c,tg,1,i===2?3:2,'#ff7a2c',z=>{for(const o of inZone(z,1-c.team))hitAb(c,o,.12,{noCrit:1,quiet:1});});},{size:5,sp:240});}});

// Greninja: the ninja. Vanishes behind the weakest enemy and throws shuriken.
defSig({ids:[656,657,658],role:'Assassin',cls:'Trickster',cat:'spec',range:1,mana:[75,70,65],start:20,pf:[.9,1.1,1.3],names:['Bubble','Water Shuriken','Water Shuriken'],mvType:'Water',
  d:(c,i)=>`Dashes behind the weakest enemy within 5 hexes and throws ${[2,3,4][i]} shuriken at it, each dealing ${DT(c,.45)}. <b>Protean:</b> a knockout refunds half its PP.`,
  cast(c,tg,i){const t=foesOf(c).filter(o=>hdist(c,o)<=5).sort((a,b)=>a.hp-b.hp)[0]||tg;if(hdist(c,t)>1)dashTo(c,t,true);
    for(let k=0;k<[2,3,4][i];k++)schedule(.22+k*.1,()=>{if(c.dead||t.dead)return;fire(c,t,'#bfeaff',()=>{hitAb(c,t,.45);if(t.dead)gainMana(c,c.maxMana*.5);},{sp:460,size:2});});}});

// Ceruledge: cursed knight. Bitter Blade heals for part of the damage it deals.
defSig({ids:[937],role:'Cursed Knight',cls:'Bruiser',cat:'phys',range:1,mana:70,pf:1.15,names:['Bitter Blade'],mvType:'Fire',
  d:c=>`Lunges at its target and slashes it and adjacent enemies for ${DT(c,1.2)} (60% to adjacent enemies). Heals for 40% of the damage dealt, or 80% while below half HP.`,
  cast(c,tg){if(hdist(c,tg)>1)dashTo(c,tg);schedule(.15,()=>{if(c.dead||tg.dead)return;let dealt=0;for(const t of[tg,...near(tg,1)])dealt+=hitAb(c,t,t===tg?1.2:.72);heal(c,dealt*(lowHp(c,.5)?.8:.4));boom(tg,'#9f6bff',2);});}});

// Armarouge: siege knight. Lobs a cannonball into the biggest crowd.
defSig({ids:[936],role:'Cannon Knight',cls:'Artillery',cat:'spec',range:3,mana:90,pf:1.05,names:['Armor Cannon'],mvType:'Fire',
  d:c=>`Locks onto the biggest group of enemies and lobs a cannonball for ${DT(c,1.6)} to the center and 75% to adjacent enemies. The recoil lowers its own <span class="s-def">Defense</span> and <span class="s-def">Sp. Def</span> by 6 each time (stacks).`,
  cast(c,tg){const t=cluster(c)||tg;c.busy=Math.max(c.busy,.4);fire(c,t,'#ffb347',()=>{for(const o of[t,...near(t,1)])hitAb(c,o,o===t?1.6:1.2);boom(t,'#ffb347',3);},{arc:1,dur:.75,size:5,lift:120,side:0,retarget:1});
    c.def=Math.max(0,c.def-6);c.res=Math.max(0,c.res-6);}});

// Dragapult: launches Dreepy like missiles. More darts every few casts, for the whole run (Ezreal / Kai'Sa style).
const dartsOf=(c,i)=>[2,3,4][i]+Math.min(8,Math.floor(((c.u&&c.u.ss)||0)/4));
defSig({ids:[885,886,887],role:'Marksman',cls:'Combo',cat:'phys',range:3,mana:60,pf:[.65,.8,.9],names:['Infestation','Dragon Darts','Dragon Darts'],mvType:'Dragon',
  d:(c,i)=>{const n=dartsOf(c,i),ss=(c.u&&c.u.ss)||0,maxed=n-[2,3,4][i]>=8;return`Launches <b>${n}</b> Dreepy that arc through the air and spread across enemies within 4 hexes, each dealing ${DT(c,.42)}. <b>Grows:</b> every 4 casts adds another dart for the rest of the run (up to +8). ${maxed?'Fully grown!':`Next dart in ${4-ss%4} cast${4-ss%4>1?'s':''} (${ss} casts so far).`}`;},
  cast(c,tg,i){const n=dartsOf(c,i),pool=shuffle(foesOf(c).filter(o=>hdist(c,o)<=4));const ts=pool.length?pool:[tg];
    for(let k=0;k<n;k++)schedule(k*.07,()=>{if(c.dead)return;const a=ts.filter(o=>!o.dead);if(!a.length)return;const t=a[k%a.length];
      fire(c,t,k%2?'#7be0c8':'#b48cff',()=>hitAb(c,t,.42),{arc:1,dur:.5+Math.random()*.3,size:3,lift:50+Math.random()*70,side:(k%2?1:-1)*(20+Math.random()*60),retarget:1});});
    if(c.u)c.u.ss=(c.u.ss||0)+1;}});

// Swalot: Cho'Gath. Swallows weak enemies whole and keeps the HP forever.
defSig({ids:[316,317],role:'Devourer',cls:'Juggernaut',cat:'spec',range:1,mana:80,start:20,pf:[1,1.3],names:['Stockpile','Swallow'],mvType:'Poison',
  begin(c){c.scaleMul=1+Math.min(.35,((c.u&&c.u.ss)||0)*.012);},
  d:c=>{const s=(c.u&&c.u.ss)||0;return`Swallows the weakest enemy within 2 hexes for ${DT(c,1,'spec','true')} plus <b class="s-hp">${Math.round(c.maxHp*.06)}</b> <span class="sc">(6% <span class="s-hp">max HP</span>)</span>. <b>Grows:</b> a knockout permanently adds +25 <span class="s-hp">max HP</span>, heals 15% and makes it a little bigger. Feasts so far: <b>${s}</b> (+${s*25} HP).`;},
  cast(c,tg){const t=foesOf(c).filter(o=>hdist(c,o)<=2).sort((a,b)=>a.hp-b.hp)[0]||tg;if(hdist(c,t)>1)dashTo(c,t);
    schedule(.18,()=>{if(c.dead||t.dead)return;damage(c,t,V(c,1)+c.maxHp*.06,{ab:1,cat:'spec',tru:1,type:'Poison'});boom(t,'#a35bd6',2);
      if(t.dead&&c.u){c.u.ss=(c.u.ss||0)+1;c.u.g.hp=(c.u.g.hp||0)+25;c.maxHp+=25;heal(c,c.maxHp*.15);c.scaleMul=1+Math.min(.35,c.u.ss*.012);if(!SIM.on)texts.push({x:c.x,y:c.y-42,txt:'Feast! +25 HP',col:'#7dff7a',life:1.3,label:1});}});}});

// Marowak: Nasus. Its bone hits harder with every swing and every knockout, forever.
defSig({ids:[104,105],role:'Bone Collector',cls:'Bruiser',cat:'phys',range:1,mana:55,pf:[1,1.25],names:['Bone Club','Bonemerang'],mvType:'Ground',
  d:(c,i)=>{const s=(c.u&&c.u.ss)||0;return`${i?'Throws its bone through the target and catches it on the way back, hitting twice':'Clubs the target'} for ${DT(c,i?.65:1.1)} plus <b class="s-atk">${s*3}</b> bonus <span class="s-atk">physical</span> damage${i?' each time':''}. <b>Grows:</b> +1 stack per cast and +5 per knockout with it, forever. Stacks: <b>${s}</b> (+3 damage each).`;},
  cast(c,tg,i){const hit=()=>{if(c.dead||tg.dead)return;damage(c,tg,V(c,i?.65:1.1)+((c.u&&c.u.ss)||0)*3,{ab:1,cat:'phys',type:'Ground'});boom(tg,'#e8dcc0');if(tg.dead&&c.u)c.u.ss=(c.u.ss||0)+5;};
    if(c.u)c.u.ss=(c.u.ss||0)+1;if(i){fire(c,tg,'#efe6cf',hit,{arc:1,dur:.35,lift:25,size:3});schedule(.5,()=>{if(!tg.dead&&!c.dead)fire(c,tg,'#efe6cf',hit,{arc:1,dur:.35,lift:25,side:-30,size:3});});}else hit();}});

// Salamence: Smolder. A Bagon practicing to fly; every hit is practice, and milestones unlock new powers.
const prac=c=>(c.u&&c.u.ss)||0;
defSig({ids:[371,372,373],role:'Dragon in Training',cls:'Mystic',cat:'spec',range:2,mana:[55,50,45],pf:[.8,1,1.2],names:['Ember','Dragon Breath','Dragon Breath'],mvType:'Dragon',
  d:c=>{const s=prac(c);return`Breathes dragonfire at the target for ${DT(c,.9)} plus <b class="s-spa">${Math.round(s*.8)}</b> bonus (0.8 per stack). <b>Grows:</b> +1 stack per enemy hit, +3 per knockout, forever. Stacks: <b>${s}</b>.<br>${tierLine(s>=25,'25: also hits enemies next to the target')}<br>${tierLine(s>=80,'80: leaves burning ground for 3s')}<br>${tierLine(s>=160,'160: executes enemies left below 12% HP')}`;},
  cast(c,tg){const s=prac(c),ts=[tg,...(s>=25?near(tg,1):[])];
    fire(c,tg,'#8f7bff',()=>{for(const t of ts){if(t.dead)continue;hitAb(c,t,.9*(t===tg?1:.6),{flat:s*.8});if(c.u)c.u.ss=(c.u.ss||0)+1;
        if(!t.dead&&s>=160&&t.hp<t.maxHp*.12){hurt(t,t.hp+t.shield+1,c);if(!SIM.on)texts.push({x:t.x,y:t.y-36,txt:'Executed!',col:'#ff6b6b',life:1.1,label:1});}
        if(t.dead&&c.u)c.u.ss+=3;}
      boom(tg,'#8f7bff',2);if(s>=80)zone(c,tg,1,3,'#7a5cff',z=>{for(const o of inZone(z,1-c.team))hitAb(c,o,.1,{noCrit:1,quiet:1});});},{size:5,sp:230});}});

// Pikachu line: chain lightning.
defSig({ids:[172,25,26],role:'Storm Chaser',cls:'Mystic',cat:'spec',range:3,mana:70,pf:[.5,.62,.75],names:['Thunder Shock','Thunderbolt','Thunderbolt'],mvType:'Electric',
  d:(c,i)=>`Fires a bolt at the target for ${DT(c,1)} that chains to ${[1,3,5][i]} more enemies, losing 15% with each jump. The first target is paralyzed for 0.5s.`,
  cast(c,tg,i){const hitS=[];let cur=tg,prev=c;
    for(let k=0;k<1+[1,3,5][i]&&cur;k++){const t=cur,p=prev,m=Math.pow(.85,k);hitS.push(t);
      schedule(k*.08,()=>{if(c.dead||t.dead)return;lineFx(p,t,'#ffe14d',2,.25);hitAb(c,t,m);if(k===0)stun(t,.5);if(!SIM.on)spark(t.x,t.y-10,'#fff6a0',8);});
      prev=t;cur=foesOf(c).filter(o=>!hitS.includes(o)&&hdist(o,t)<=3).sort((a,b)=>hdist(a,t)-hdist(b,t))[0];}}});

// Machamp: four arms, a flurry of punches.
defSig({ids:[66,67,68],role:'Brawler',cls:'Combo',cat:'phys',range:1,mana:70,pf:[1.3,1.6,1.9],names:['Karate Chop','Cross Chop','Dynamic Punch'],mvType:'Fighting',
  begin(c,i){if(i===2)c.fx.noGuard=1;},
  d:(c,i)=>`Throws ${[2,3,4][i]} rapid punches at the target, each dealing ${DT(c,.42)}. The last one confuses it, stunning it for 1s.${i===2?' <b>No Guard:</b> its basic attacks can\'t be dodged.':''}`,
  cast(c,tg,i){const n=[2,3,4][i];for(let k=0;k<n;k++)schedule(k*.12,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,.42);if(!SIM.on)spark(tg.x+rnd(-5,5),tg.y-12,'#ffb36b',7);if(k===n-1){stun(tg,1);boom(tg,'#ffb36b');}});}});

// Gengar: hexer. Shadow Balls shred Sp. Def; Cursed Body drains PP from enemies that target it.
defSig({ids:[92,93,94],role:'Hexer',cls:'Trickster',cat:'spec',range:3,mana:70,pf:[.75,.9,1.05],names:['Lick','Shadow Ball','Shadow Ball'],mvType:'Ghost',
  d:c=>`Hurls a Shadow Ball for ${DT(c,1.2)} that lowers the target's <span class="s-def">Sp. Def</span> by 12 for the rest of the battle (stacks). <b>Cursed Body:</b> when an enemy's move hits it, there's a 30% chance that enemy loses 30 PP.`,
  hitBy(c,src,o){if(o.ab&&!o.refl&&src&&src.team!==c.team&&src.maxMana&&Math.random()<.3){src.mana=Math.max(0,src.mana-30);if(!SIM.on)texts.push({x:src.x,y:src.y-30,txt:'Disabled!',col:'#c39bff',life:1,label:1});}},
  cast(c,tg){fire(c,tg,'#6b4bb8',()=>{hitAb(c,tg,1.2);tg.res=Math.max(0,tg.res-12);boom(tg,'#6b4bb8',2);},{size:6,sp:190});}});

// Lucario: hits harder the more hurt it is.
defSig({ids:[447,448],role:'Aura Fighter',cls:'Bruiser',cat:'spec',range:2,mana:65,pf:[1,1.35],names:['Force Palm','Aura Sphere'],mvType:'Fighting',
  d:c=>`Fires an Aura Sphere for ${DT(c,1.15)}, increased by up to 100% based on its own missing HP. <b>Justified:</b> each cast adds +6% damage for the rest of the battle.`,
  cast(c,tg){const miss=1-c.hp/c.maxHp;fire(c,tg,'#5fb0ff',()=>{hitAb(c,tg,1.15*(1+miss));boom(tg,'#5fb0ff',1+Math.round(miss*2));},{sp:320,size:4+Math.round(miss*3)});c.dmg+=.06;}});

// Garchomp: dives onto the back line.
defSig({ids:[443,444,445],role:'Land Shark',cls:'Bruiser',cat:'phys',range:1,mana:65,start:[10,25,40],pf:[1.15,1.4,1.6],names:['Dragon Rage','Dragon Claw','Dragon Rush'],mvType:'Dragon',
  begin(c,i){if(i===2)c.helmet+=.03;},
  d:(c,i)=>`${i?'Leaps onto the farthest enemy':'Charges the target'} and crashes down for ${DT(c,1.3)} to it and adjacent enemies (70%), stunning them for 0.6s.${i===2?' <b>Rough Skin:</b> melee attackers take 3% of its <span class="s-hp">max HP</span>.':''}`,
  cast(c,tg,i){const t=i?(foesOf(c).sort((a,b)=>hdist(c,b)-hdist(c,a)||a.hp-b.hp)[0]||tg):tg;if(hdist(c,t)>1)dashTo(c,t,true,.35);c.busy=Math.max(c.busy,.45);
    schedule(.36,()=>{if(c.dead||t.dead)return;for(const o of[t,...near(t,1)]){hitAb(c,o,o===t?1.3:.91);stun(o,.6);}boom(t,'#c9a46b',3);});}});

// Toxapex: the fortress. Untouchable for a moment, and it poisons whoever tries.
defSig({ids:[747,748],role:'Fortress',cls:'Vanguard',type:'guard',cat:'spec',range:1,mana:70,start:20,pf:1,names:['Poison Sting','Baneful Bunker'],mvType:'Poison',
  d:(c,i)=>`Hides in a bunker for ${[1.2,2][i]}s: immune to all damage, and any enemy that attacks it is badly poisoned (2% <span class="s-hp">max HP</span> per second for 4s). <b>Regenerator:</b> afterwards it heals <b class="s-hp">${Math.round(c.maxHp*.1)}</b> <span class="sc">(10% <span class="s-hp">max HP</span>)</span>.`,
  cast(c,tg,i){const d=[1.2,2][i];c.protT=combatT+d;c.protPoison=.02;if(!SIM.on)ring(c.x,c.y-8,'#c86bd6');schedule(d,()=>{if(!c.dead)heal(c,c.maxHp*.1);});}});

// Blissey: the nurse. Big heal, then a Wish for the whole team.
const bliss=c=>(c.base+KIT.healRatio*c.spa)*(1+c.healAmp);
defSig({ids:[440,113,242],role:'Nurse',cls:'Medic',type:'heal',cat:'spec',range:2,mana:75,pf:1,names:['Pound','Soft-Boiled','Soft-Boiled'],mvType:'Normal',
  d:(c,i)=>`Heals the most injured ally for <b class="s-hp">${Math.round(bliss(c))}</b> <span class="sc">(${Math.round(c.base)} + <span class="s-spa">${pct(KIT.healRatio)} Sp. Atk</span>)</span> and cures burn and poison.${i?` <b>Wish:</b> 1.5s later, every ally heals ${i===2?30:20}% of that.`:''}`,
  cast(c,tg,i){const h=bliss(c),al=alive(c.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(al){heal(al,h);al.burn=al.poison=null;if(!SIM.on){ring(al.x,al.y-8,'#ffc6e0');burst(al.x,al.y-12,'#fff0f6',14,.7);}}
    if(i)schedule(1.5,()=>{if(c.dead)return;for(const o of alive(c.team)){heal(o,h*(i===2?.3:.2));if(!SIM.on)burst(o.x,o.y-14,'#ffe27a',6,.5);}});}});

// Rillaboom: the drummer. Hits everything nearby; Grassy Surge heals allies standing in it.
defSig({ids:[810,811,812],role:'Drummer',cls:'Artillery',cat:'phys',range:1,mana:80,pf:[.8,1,1.2],names:['Branch Poke','Razor Leaf','Drum Beating'],mvType:'Grass',
  d:(c,i)=>`Beats its drum, hitting every enemy within 2 hexes for ${DT(c,.85)} and slowing their <span class="s-as">Attack Speed</span> by 25% for 3s.${i?` <b>Grassy Surge:</b> grass covers the ground around it for 4s, healing allies inside for ${i===2?2:1.2}% <span class="s-hp">max HP</span> per second.`:''}`,
  cast(c,tg,i){for(const o of foesOf(c).filter(o=>hdist(o,c)<=2)){hitAb(c,o,.85);o.slowT=3;o.slowP=Math.max(o.slowP,.25);}
    if(!SIM.on){ring(c.x,c.y-6,'#7fd36a');schedule(.12,()=>ring(c.x,c.y-6,'#cfeeb0'));}
    if(i)zone(c,c,2,4,'#5fbf4a',z=>{for(const o of inZone(z,c.team))heal(o,o.maxHp*(i===2?.01:.006),true);},true);}});

// Cinderace: the striker. Pyro Ball bounces between enemies, and every kick speeds it up.
defSig({ids:[813,814,815],role:'Striker',cls:'Striker',cat:'phys',range:[1,1,2],mana:60,pf:[.4,.5,.58],names:['Ember','Flame Charge','Pyro Ball'],mvType:'Fire',
  d:(c,i)=>`Kicks a flaming ball at the target for ${DT(c,.75)}${[0,1,3][i]?` that bounces to ${[0,1,3][i]} more enem${[0,1,3][i]>1?'ies':'y'}`:''}. Each hit has a 30% chance to burn (1.5% <span class="s-hp">max HP</span> per second for 3s). <b>Libero:</b> each kick adds +6% <span class="s-as">Attack Speed</span> for the battle.`,
  cast(c,tg,i){const hit=[];const kick=(from,t,left)=>fire(from,t,'#ff6a2c',()=>{hitAb(c,t,.75);if(Math.random()<.3)setDot(t,'burn',.015,3,c);hit.push(t);if(!SIM.on)burst(t.x,t.y-10,'#ffb35c',8,.8);
      const nx=foesOf(c).filter(o=>!hit.includes(o)&&hdist(o,t)<=3).sort((a,b)=>hdist(a,t)-hdist(b,t))[0];if(left>0&&nx&&!c.dead)kick(t,nx,left-1);},{arc:1,dur:.32,lift:30,size:4});
    kick(c,tg,[0,1,3][i]);c.as*=1.06;}});

// Charizard: a cone of fire through the target.
defSig({ids:[4,5,6],role:'Flamethrower',cls:'Artillery',cat:'spec',range:2,mana:75,pf:[.55,.7,.85],names:['Ember','Flame Burst','Flamethrower'],mvType:'Fire',
  d:(c,i)=>`Breathes a cone of fire: the target and enemies ${i===2?'up to 2 hexes':'right'} behind it take ${DT(c,1)} (70% to the others) and burn for 1% <span class="s-hp">max HP</span> per second for 4s.`,
  cast(c,tg,i){const ts=[tg,...alive(tg.team).filter(o=>o!==tg&&hdist(o,tg)<=(i===2?2:1)&&hdist(o,c)>=hdist(tg,c))];
    if(!SIM.on){for(let k=0;k<26;k++){const f=Math.random(),x=c.x+(tg.x-c.x)*f*1.3,y=c.y-12+(tg.y-c.y)*f*1.3;fx.push({x:x+rnd(-6,6)*f,y:y+rnd(-5,5)*f,vx:(tg.x-c.x)*.6,vy:(tg.y-c.y)*.6-10,life:rnd(.25,.45),max:.45,col:pick(['#ff7a2c','#ffd34d','#ff4d2c']),sz:2,g:0});}}
    for(const t of ts){hitAb(c,t,t===tg?1:.7);setDot(t,'burn',.01,4,c);}}});

// Venusaur: Solar Beam, a line through every enemy behind the target. Instant in sun.
defSig({ids:[1,2,3],role:'Solar Cannon',cls:'Mystic',cat:'spec',range:3,mana:90,pf:[.9,1.1,1.4],names:['Vine Whip','Razor Leaf','Solar Beam'],mvType:'Grass',
  d:c=>`Charges sunlight for 1s (instantly in harsh sunlight), then fires a beam through the target that hits every enemy in a line for ${DT(c,1.5)}.`,
  cast(c,tg){const go=()=>{if(c.dead||tg.dead)return;const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const t of ts){hitAb(c,t,1.5);if(!SIM.on)burst(t.x,t.y-10,'#d8ff7a',10,1);}
      if(!SIM.on){const dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy)||1;fx.push({line:1,x1:c.x,y1:c.y-12,x2:c.x+dx/L*420,y2:c.y-12+dy/L*420,life:.4,max:.4,col:'#f4ffb0',w:5});}};
    if(battle.weather==='sun')go();else{c.busy=Math.max(c.busy,1.05);if(!SIM.on)for(let k=0;k<5;k++)schedule(k*.18,()=>{if(!c.dead)burst(c.x,c.y-16,'#fff6a0',5,.4);});schedule(1,go);}}});

// Blastoise: shell up, then fire both cannons and push enemies back.
defSig({ids:[7,8,9],role:'Cannon Tank',cls:'Vanguard',type:'guard',cat:'spec',range:2,mana:85,start:25,pf:[.8,1,1.2],names:['Water Gun','Water Pulse','Hydro Pump'],mvType:'Water',
  d:(c,i)=>`Withdraws into its shell for a <b class="s-hp">${Math.round(c.maxHp*.15)}</b> <span class="sc">(15% <span class="s-hp">max HP</span>)</span> shield, then ${i===2?'fires both cannons at the 2 nearest enemies':'fires at the target'} for ${DT(c,.8)}${i===2?' each':''}, knocking ${i===2?'them':'it'} back a hex.`,
  cast(c,tg,i){c.shield+=c.maxHp*.15;if(!SIM.on)ring(c.x,c.y-8,'#9fd4ff');const ts=i===2?foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,2):[tg];
    for(const t of ts)fire(c,t,'#7fc4ff',()=>{hitAb(c,t,.8);knock(c,t);boom(t,'#7fc4ff');},{sp:420,size:5});}});

// Gardevoir: Future Sight marks the strongest enemies, then strikes them all at once.
defSig({ids:[280,281,282],role:'Seer',cls:'Mystic',cat:'spec',range:3,mana:80,pf:[.7,.9,1.05],names:['Confusion','Psychic','Future Sight'],mvType:'Psychic',
  d:(c,i)=>`Foresees the ${[1,2,3][i]} strongest enem${i?'ies':'y'} (highest <span class="s-atk">Attack</span> or <span class="s-spa">Sp. Atk</span>) and marks ${i?'them':'it'}. 2s later, each takes ${DT(c,1.15)}.`,
  cast(c,tg,i){const ts=foesOf(c).sort((a,b)=>Math.max(b.atk,b.spa)-Math.max(a.atk,a.spa)).slice(0,[1,2,3][i]);for(const t of ts)t.markT=combatT+2;
    schedule(2,()=>{if(c.dead)return;for(const t of ts)if(!t.dead){hitAb(c,t,1.15);boom(t,'#ff7ad9',2);}});}});
