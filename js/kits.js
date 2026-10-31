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
  const lk=shotLook(o.type||typeOf(c));const p={x:c.x,y:c.y-12,tg:t,col,onHit,size:o.size||3,trail:[],sp:o.sp||260,...lk,ss:lk.ss*(o.size>3?1.3:1)};
  if(o.arc){const mx=(c.x+t.x)/2,my=(c.y+t.y)/2-10;p.arc={sx:c.x,sy:c.y-12,cx:mx+(o.side??rnd(-40,40)),cy:Math.min(c.y,t.y)-(o.lift||70),t:0,dur:o.dur||.6};p.retarget=o.retarget?1-c.team:-1;}
  proj.push(p);
}
// leap or dash to a free hex next to the target (behind it, seen from the attacker, when `behind`)
function dashTo(c,t,behind,dur=.2){
  const opts=nbrs(t.c,t.r).filter(h=>!occupied(h.c,h.r,c));if(!opts.length)return false;
  opts.sort((a,b)=>behind?hdist(b,c)-hdist(a,c):hdist(a,c)-hdist(b,c));
  const h=opts[0],p=hexXY(h.c,h.r);c.move={c:h.c,r:h.r,fx:c.x,fy:c.y,tx:p.x,ty:p.y,t:0,dur};c.dir=dirFrom(p.x-c.x,(p.y-c.y)/SQ);c.target=t;
  if(!SIM.on){pfx('Puff_'+colFamily(tcol(c)),c.x,c.y-6,{sc:.7,force:1});}
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
defSig({ids:[316,317],role:'Devourer',cls:'Juggernaut',cat:'spec',range:1,mana:80,start:20,pf:[.85,1.1],names:['Stockpile','Swallow'],mvType:'Poison',
  begin(c){c.scaleMul=1+Math.min(.35,((c.u&&c.u.ss)||0)*.012);},
  d:c=>{const s=(c.u&&c.u.ss)||0;return`Swallows the weakest enemy within 2 hexes for ${DT(c,1,'spec','true')} plus <b class="s-hp">${Math.round(c.maxHp*.06)}</b> <span class="sc">(6% <span class="s-hp">max HP</span>)</span>. <b>Grows:</b> a knockout permanently adds +20 <span class="s-hp">max HP</span>, heals 15% and makes it a little bigger. Feasts so far: <b>${s}</b> (+${s*20} HP).`;},
  cast(c,tg){const t=foesOf(c).filter(o=>hdist(c,o)<=2).sort((a,b)=>a.hp-b.hp)[0]||tg;if(hdist(c,t)>1)dashTo(c,t);
    schedule(.18,()=>{if(c.dead||t.dead)return;damage(c,t,V(c,1)+c.maxHp*.06,{ab:1,cat:'spec',tru:1,type:'Poison'});boom(t,'#a35bd6',2);
      if(t.dead&&c.u){c.u.ss=(c.u.ss||0)+1;c.u.g.hp=(c.u.g.hp||0)+20;c.maxHp+=20;heal(c,c.maxHp*.15);c.scaleMul=1+Math.min(.35,c.u.ss*.012);if(!SIM.on)texts.push({x:c.x,y:c.y-42,txt:'Feast! +20 HP',col:'#7dff7a',life:1.3,label:1});}});}});

// Marowak: Nasus. Its bone hits harder with every swing and every knockout, forever.
defSig({ids:[104,105],role:'Bone Collector',cls:'Bruiser',cat:'phys',range:1,mana:55,pf:[1,1.25],names:['Bone Club','Bonemerang'],mvType:'Ground',
  d:(c,i)=>{const s=(c.u&&c.u.ss)||0;return`${i?'Throws its bone through the target and catches it on the way back, hitting twice':'Clubs the target'} for ${DT(c,i?.65:1.1)} plus <b class="s-atk">${s*3}</b> bonus <span class="s-atk">physical</span> damage${i?' each time':''}. <b>Grows:</b> +1 stack per cast and +5 per knockout with it, forever. Stacks: <b>${s}</b> (+3 damage each).`;},
  cast(c,tg,i){const hit=()=>{if(c.dead||tg.dead)return;damage(c,tg,V(c,i?.65:1.1)+((c.u&&c.u.ss)||0)*3,{ab:1,cat:'phys',type:'Ground'});boom(tg,'#e8dcc0');if(tg.dead&&c.u)c.u.ss=(c.u.ss||0)+5;};
    if(c.u)c.u.ss=(c.u.ss||0)+1;if(i){fire(c,tg,'#efe6cf',hit,{arc:1,dur:.35,lift:25,size:3});schedule(.5,()=>{if(!tg.dead&&!c.dead)fire(c,tg,'#efe6cf',hit,{arc:1,dur:.35,lift:25,side:-30,size:3});});}else hit();}});

// Bagon line: a Pokémon that dreams of flying. Bagon headbutts, Shelgon hardens its shell, Salamence finally takes to the sky.
defSig({ids:[371,372,373],role:'Sky Dreamer',cls:'Bruiser',cat:'phys',range:1,mana:[60,70,80],start:[10,20,30],pf:[1,1,1.05],names:['Headbutt','Iron Defense','Fly'],mvType:'Dragon',
  d:(c,i)=>[`Rams the target for ${DT(c,1.2)} and flinches it for 0.5s. It always aims a little higher.`,
    `Hardens its shell: gains a <b class="s-hp">${Math.round(c.maxHp*.22)}</b> <span class="sc">(22% <span class="s-hp">max HP</span>)</span> shield and +30 <span class="s-def">Defense</span> for 4s, then headbutts the target for ${DT(c,.9)}.`,
    `Soars out of reach for 1s (can't be targeted or hit), then dives onto the biggest group of enemies for ${DT(c,1.4)} to everything within 1 hex, knocking them back. Then it goes into an <b>Outrage</b> for 4s: +30% <span class="s-as">Attack Speed</span>, and its attacks splash 50% damage to enemies next to the target.`][i],
  cast(c,tg,i){
    if(i===0){if(hdist(c,tg)>1)dashTo(c,tg);schedule(.12,()=>{if(c.dead||tg.dead)return;hitAb(c,tg,1.2);stun(tg,.5);boom(tg,'#7fb0ff');});return;}
    if(i===1){c.shield+=c.maxHp*.22;c.def+=30;schedule(4,()=>{c.def-=30;});if(!SIM.on)ring(c.x,c.y-8,'#c8d0d8');schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,.9);});return;}
    c.airT=combatT+1;c.busy=Math.max(c.busy,1.1);c.target=null;if(!SIM.on){burst(c.x,c.y-10,'#9fd0ff',18,1.2);texts.push({x:c.x,y:c.y-40,txt:'Fly!',col:'#bfe4ff',life:1,label:1});}
    schedule(1,()=>{if(c.dead)return;const t=cluster(c);if(!t)return;dashTo(c,t,false,.15);
      schedule(.16,()=>{if(c.dead)return;for(const o of[t,...near(t,1)]){hitAb(c,o,1.4);knock(c,o);}boom(t,'#7a9cff',3);
        const ch=.3;c.outrageT=combatT+4;c.as*=1+ch;schedule(4,()=>{if(!c.dead)c.as/=1+ch;});});});}});

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
defSig({ids:[443,444,445],role:'Land Shark',cls:'Bruiser',cat:'phys',range:1,mana:65,start:[10,25,40],pf:[1,1.2,1.35],names:['Dragon Rage','Dragon Claw','Dragon Rush'],mvType:'Dragon',
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
    if(al){heal(al,h);cureStatus(al);if(!SIM.on){ring(al.x,al.y-8,'#ffc6e0');burst(al.x,al.y-12,'#fff0f6',14,.7);}}
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
defSig({ids:[4,5,6],role:'Fire Breather',cls:'Artillery',cat:'spec',range:2,mana:75,pf:[.55,.7,.85],names:['Ember','Flame Burst','Flamethrower'],mvType:'Fire',
  d:(c,i)=>`Breathes a cone of fire: the target and enemies ${i===2?'up to 2 hexes':'right'} behind it take ${DT(c,1)} (70% to the others) and burn for 1% <span class="s-hp">max HP</span> per second for 4s.`,
  cast(c,tg,i){const ts=[tg,...alive(tg.team).filter(o=>o!==tg&&hdist(o,tg)<=(i===2?2:1)&&hdist(o,c)>=hdist(tg,c))];
    if(!SIM.on){for(let k=1;k<=5;k++){const f=k/5;schedule(k*.04,()=>pfx('Fire_Blast',c.x+(tg.x-c.x)*f,c.y-12+(tg.y-c.y)*f,{sc:.55+f*.35,force:1}));}}
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

/* ================= Set gear =================
   Like TFT's Faerie crown or Currency Wars' Day Demigod gear: some sets hand you an exclusive item the first time
   they activate. Only that set's Pokémon can wear it, and it gets stronger at higher set tiers. */
const GEAR={
  Partner:{id:'friend-ball',n:'Partner Ribbon',set:'Partner',tiers:[{dmg:.2,hpP:.2},{dmg:.35,hpP:.35,mana:100}],
    lines:['+20% damage and max HP.','+35% damage and max HP, and starts battle with full PP.']},
  Pseudo:{id:'dragon-scale',n:'Apex Fang',set:'Pseudo',tiers:[{apexWear:.35},{apexWear:.6}],
    lines:['The wearer becomes the Apex: +35% max HP, damage and Attack Speed, and it grows bigger.','Radiant: the Apex gains +60% instead.']},
  Fossil:{id:'old-amber',n:'Ancient Amber',set:'Fossil',tiers:[{revive:.5,ancient:.15},{revive:.7,ancient:.25}],
    lines:['Revives once with 50% HP. On reviving, gains +15% to all stats and lets out an Ancient Power blast: 15% of its max HP as special damage to enemies within 1 hex.','Revives with 70% HP and gains +25% instead.']},
  Kanto:{id:'star-piece',n:'Champion Ribbon',set:'Kanto',mission:1,tiers:[{dmg:.25,hpP:.25,as:.15},{dmg:.25,hpP:.25,as:.15}],
    lines:['Earned by collecting all 8 Kanto Badges. +25% damage and max HP and +15% Attack Speed.']},
};
const isGear=it=>typeof it.k==='string'&&it.k.startsWith('gear:');
const gearKey=it=>it.k.slice(5);
function gearDef(it){const G=GEAR[gearKey(it)];return{id:G.id,n:G.n,d:`<b>Exclusive to ${G.set} Pokémon.</b> ${G.lines.map((l,i)=>G.lines.length>1?`<br>(${SETS[G.set].bp[i]}) ${l}`:l).join('')}`};}
function gearEffects(it,u,tr){const G=GEAR[gearKey(it)];if(!unitSets(u).includes(G.set))return{};const ti=tierOf(G.set,tr[G.set]||0);return ti?G.tiers[ti-1]:{};}
function canWearGear(it,u){const G=GEAR[gearKey(it)];return unitSets(u).includes(G.set)&&!u.items.some(isGear)&&u.items.length<3;}
// hand out gear the first time its set is active on the field
function grantGear(){if(!run||!MODE)return;run.gearGot=run.gearGot||[];const ct=countTraits(Object.values(run.board));
  for(const k in GEAR){const G=GEAR[k];if(G.mission||run.gearGot.includes(k)||tierOf(G.set,ct[G.set]||0)<1)continue;run.gearGot.push(k);run.bag.push({k:'gear:'+k,mut:[]});
    if(!SIM.on)banner(`${G.set} gear: ${G.n}`,`Only ${G.set} Pokémon can wear it`,2200);}}
function grantMissionGear(k){run.gearGot=run.gearGot||[];if(run.gearGot.includes(k))return;run.gearGot.push(k);run.bag.push({k:'gear:'+k,mut:[]});if(!SIM.on)setTimeout(()=>banner(`Mission complete: ${GEAR[k].n}`,`Only ${GEAR[k].set} Pokémon can wear it`,2400),1200);}
// unit-earned items were replaced by set gear
const SPECIAL={};const isSpc=it=>false;const spcKey=it=>'';function spcDef(){return{id:'',n:'',d:''};}function specialFor(){return null;}function awardSpecials(){}

// Pawniard line: the leader. Kowtow Cleave never misses and grows as allies fall.
defSig({ids:[624,625,983],role:'Leader',cls:'Bruiser',cat:'phys',range:1,mana:[70,70,75],pf:[1.1,1.4,1.75],names:['Metal Claw','Night Slash','Kowtow Cleave'],mvType:'Dark',
  d:(c,i)=>`${i===2?'Bows, then cleaves':'Slashes'} the weakest enemy within 2 hexes for ${DT(c,1.25)}${i===1?' with +30% crit chance':''}${i===2?'. It can\'t miss, and deals +12% for every ally that has fainted this battle':''}`,
  cast(c,tg,i){const t=foesOf(c).filter(o=>hdist(c,o)<=2).sort((a,b)=>a.hp-b.hp)[0]||tg;if(hdist(c,t)>1)dashTo(c,t);
    const fallen=units.filter(o=>o.team===c.team&&o.dead).length;
    schedule(.15,()=>{if(c.dead||t.dead)return;hitAb(c,t,1.25*(i===2?1+.12*fallen:1),{cr:i===1?.3:0});boom(t,'#c9c9d6',2);});}});

// Munchlax/Snorlax: the glutton. Naps to heal, then flattens everything nearby with its weight.
defSig({ids:[446,143],role:'Glutton',cls:'Juggernaut',type:'guard',cat:'phys',range:1,mana:[80,90],start:20,pf:[.8,1],names:['Lick','Body Slam'],mvType:'Normal',
  d:(c,i)=>`${i?`If it's below 60% HP, it first takes a quick <b>Rest</b>: asleep for 1.5s while healing <b class="s-hp">${Math.round(c.maxHp*.4)}</b> <span class="sc">(40% <span class="s-hp">max HP</span>)</span>. Then it`:'It'} Body Slams the target and adjacent enemies for <b class="s-hp">${Math.round(c.base*.6+c.maxHp*.08)}</b> <span class="sc">(${Math.round(c.base*.6)} + 8% <span class="s-hp">max HP</span>)</span> <span class="s-atk">physical</span> damage, stunning them for 0.6s.`,
  cast(c,tg,i){const slam=()=>{if(c.dead||tg.dead)return;for(const o of[tg,...near(tg,1)]){damage(c,o,(c.base*.6+c.maxHp*.08)*(o===tg?1:.7),{ab:1,cat:'phys',type:'Normal'});stun(o,.6);}boom(tg,'#d8c8a8',3);};
    if(i&&c.hp<c.maxHp*.6){stun(c,1.5);heal(c,c.maxHp*.4);if(!SIM.on)texts.push({x:c.x,y:c.y-38,txt:'Zzz...',col:'#c6b3ff',life:1.4,label:1});schedule(1.55,slam);}else slam();}});

// Gimmighoul/Gholdengo: the treasure keeper. Make It Rain hits harder the richer you are.
const richBonus=c=>c.team===0&&run?Math.min(.3,Math.floor(run.gold/2)*.01):0;
defSig({ids:[999,1000],role:'Treasure Keeper',cls:'Mystic',cat:'spec',range:3,mana:[70,75],pf:[.8,1.15],names:['Astonish','Make It Rain'],mvType:'Steel',
  d:(c,i)=>`Showers coins on the target and every enemy within 1 hex of it for ${DT(c,1)}, plus <b>+1% per ₽2 you have saved</b> (up to +30%; now +${Math.round(richBonus(c)*100)}%). ${i?'Each knockout with it drops ₽1 (up to ₽2 per battle).':''}`,
  cast(c,tg,i){const m=1+richBonus(c);for(const o of[tg,...near(tg,1)]){hitAb(c,o,m*(o===tg?1:.75));if(!SIM.on){pfx('Pay_Day',o.x,o.y-16,{sc:.8,force:1});pfx('Metal_Burst_Hit',o.x,o.y-10,{sc:1.2,force:1});}
      if(i&&o.dead&&c.team===0&&(battle.gholdN||0)<2){battle.gholdN=(battle.gholdN||0)+1;run.gold++;if(!SIM.on)texts.push({x:o.x,y:o.y-30,txt:'+₽1',col:'#ffd34d',life:1});}}}});

/* ================= Kit building blocks =================
   Each block returns {d(c,i), cast(c,tg,i,ctx)}. seq() chains blocks; staged() picks a block per evolution stage.
   Values given as arrays are per stage. ctx carries the chosen target between blocks. */
const P=(v,i)=>Array.isArray(v)?v[Math.min(i,v.length-1)]:v;
const pcnt=v=>Math.round(v*100)+'%';
const HPT=(c,p)=>c?`<b class="s-hp">${Math.round(c.maxHp*p)}</b> <span class="sc">(${pcnt(p)} <span class="s-hp">max HP</span>)</span>`:`${pcnt(p)} <span class="s-hp">max HP</span>`;
const HEALV=(c,m)=>(c.base+KIT.healRatio*c.spa)*(1+c.healAmp)*m;
const HT=(c,m)=>`<b class="s-hp">${Math.round(HEALV(c,m))}</b> <span class="sc">(${Math.round(c.base*m)} + <span class="s-spa">${pcnt(KIT.healRatio*m)} Sp. Atk</span>)</span>`;
// target pickers
function pickT(c,tg,to,r=9){const f=foesOf(c).filter(o=>hdist(c,o)<=r&&!(o.airT>combatT));if(!f.length)return tg;
  if(to==='weak')return f.sort((a,b)=>a.hp-b.hp)[0];if(to==='far')return f.sort((a,b)=>hdist(c,b)-hdist(c,a)||a.hp-b.hp)[0];
  if(to==='strong')return f.sort((a,b)=>Math.max(b.atk,b.spa)-Math.max(a.atk,a.spa))[0];if(to==='cluster')return cluster(c)||tg;if(to==='tank')return f.sort((a,b)=>b.maxHp-a.maxHp)[0];return tg&&!tg.dead?tg:f[0];}
const TO={target:'the target',weak:'the weakest enemy',far:'the farthest enemy',strong:'the strongest enemy',cluster:'the biggest group of enemies',tank:'the bulkiest enemy'};
// status effects shared by every block
function applyFx(c,t,fx,i){if(!fx||t.dead)return;
  if(fx.stun)stun(t,P(fx.stun,i));if(fx.sleep){stun(t,P(fx.sleep,i));if(!SIM.on)texts.push({x:t.x,y:t.y-30,txt:'Zzz',col:'#c6b3ff',life:.8,label:1});}
  if(fx.freeze&&!t.stunImm){stun(t,P(fx.freeze,i));if(!SIM.on)burst(t.x,t.y-10,'#dff6ff',10,.7);}
  if(fx.slow){t.slowT=Math.max(t.slowT,fx.slow[1]);t.slowP=Math.max(t.slowP,P(fx.slow[0],i));}
  if(fx.burn)setDot(t,'burn',P(fx.burn,i),4,c);if(fx.psn)setDot(t,'poison',P(fx.psn,i),4,c);
  if(fx.shred){t.def=Math.max(0,t.def-P(fx.shred,i));}if(fx.sdef){t.res=Math.max(0,t.res-P(fx.sdef,i));}
  if(fx.knock)knock(c,t);if(fx.pull)pullTo(c,t);if(fx.flinch&&Math.random()<P(fx.flinch,i))stun(t,.35);
  if(fx.tri){const k=pick(['burn','chill','para']);if(k==='burn')setDot(t,'burn',.015,4,c);else addStatus(t,k,3,c);}
  if(fx.weaken)debuff(t,'atk',P(fx.weaken,i),4),debuff(t,'spa',P(fx.weaken,i),4);
  for(const k of['para','conf','chill','seed'])if(fx[k])addStatus(t,k,P(fx[k],i),c);
  // moves of the right type also leave a status: Electric stuns paralyze, Ice slows and freezes chill, Psychic/Ghost/Fairy flinches confuse
  const mt=c.mv&&c.mv.t;if(fx.stun&&mt==='Electric')addStatus(t,'para',2,c);if((fx.slow||fx.freeze)&&mt==='Ice')addStatus(t,'chill',2,c);if(fx.flinch&&['Psychic','Ghost','Fairy'].includes(mt))addStatus(t,'conf',1,c);}
function fxText(fx,i){if(!fx)return'';const o=[];
  if(fx.stun)o.push(`stuns for ${P(fx.stun,i)}s`);if(fx.sleep)o.push(`puts it to sleep for ${P(fx.sleep,i)}s`);if(fx.freeze)o.push(`freezes it for ${P(fx.freeze,i)}s`);
  if(fx.slow)o.push(`slows its <span class="s-as">Attack Speed</span> by ${pcnt(P(fx.slow[0],i))} for ${fx.slow[1]}s`);
  if(fx.burn)o.push(`burns for ${(P(fx.burn,i)*100).toFixed(1).replace('.0','')}% <span class="s-hp">max HP</span>/s (4s)`);if(fx.psn)o.push(`poisons for ${(P(fx.psn,i)*100).toFixed(1).replace('.0','')}% <span class="s-hp">max HP</span>/s (4s)`);
  if(fx.shred)o.push(`lowers <span class="s-def">Defense</span> by ${P(fx.shred,i)}`);if(fx.sdef)o.push(`lowers <span class="s-def">Sp. Def</span> by ${P(fx.sdef,i)}`);
  if(fx.knock)o.push('knocks back a hex');if(fx.pull)o.push('drags it next to this Pokémon');if(fx.flinch)o.push(`${pcnt(P(fx.flinch,i))} chance to flinch`);
  if(fx.tri)o.push('burns, chills or paralyzes at random');if(fx.para)o.push(`adds ${P(fx.para,i)} Paralysis`);if(fx.conf)o.push(`adds ${P(fx.conf,i)} Confusion`);if(fx.chill)o.push(`adds ${P(fx.chill,i)} Chill`);if(fx.seed)o.push(`plants ${P(fx.seed,i)} Leech Seed`);if(fx.weaken)o.push(`lowers <span class="s-atk">Attack</span> and <span class="s-spa">Sp. Atk</span> by ${pcnt(P(fx.weaken,i))} for 4s`);
  return o.length?' It '+o.join(', ')+'.':'';}
function pullTo(c,t){if(t.dead||t.stunImm)return;const opts=nbrs(c.c,c.r).filter(h=>!occupied(h.c,h.r,t));if(!opts.length)return;const h=opts.sort((a,b)=>hdist(a,t)-hdist(b,t))[0],p=hexXY(h.c,h.r);
  t.move={c:h.c,r:h.r,fx:t.x,fy:t.y,tx:p.x,ty:p.y,t:0,dur:.25};stun(t,.4);}
// ---- blocks
const B={
  // single hit: o.to target picker, o.dash (melee leap), o.proj (projectile colour), o.cr crit bonus, o.pen, o.n hits, o.echo second hit %, o.heal lifesteal %
  hit:(m,o={})=>({d:(c,i)=>{const n=P(o.n||1,i),to=TO[o.to||'target'];return`${o.dash?`${o.to==='far'?'Leaps onto':'Dashes to'} ${to} and strikes`:o.proj===false?'Strikes':`Hits ${to}`}${n>1?` ${n} times`:''} for ${DT(c,P(m,i))}${n>1?' each':''}${o.cr?`, with +${pcnt(o.cr)} crit chance`:''}${o.pen?`, ignoring ${pcnt(o.pen)} of its defenses`:''}.${o.heal?` Heals for ${pcnt(P(o.heal,i))} of the damage dealt.`:''}${o.echo?` A second hit follows for ${pcnt(o.echo)}.`:''}${fxText(o.fx,i)}`;},
    cast(c,tg,i,x){const t=x.t=pickT(c,tg,o.to,o.range||9);if(!t)return;const n=P(o.n||1,i);if(o.dash&&hdist(c,t)>1)dashTo(c,t,o.to==='far'||o.to==='weak',.22);
      const one=(k)=>{if(c.dead||t.dead)return;const d=hitAb(c,t,P(m,i)*(k===-1?o.echo:1),{cr:o.cr||0,pen:o.pen||0});if(o.heal)heal(c,d*P(o.heal,i));if(k===n-1||k===-1)applyFx(c,t,o.fx,i);if(!SIM.on)spark(t.x,t.y-12,tcol(c),6);};
      for(let k=0;k<n;k++)schedule((o.dash?.22:0)+k*.12,()=>{const go=()=>one(k);if(c.range>1&&o.proj!==false&&!o.dash)fire(c,t,o.col||tcol(c),go,{sp:o.sp||340,size:o.size||3});else go();});
      if(o.echo)schedule((o.dash?.22:0)+n*.12+.2,()=>one(-1));}}),
  // arcing missiles spread across enemies within r
  barrage:(n,m,o={})=>({d:(c,i)=>`Launches ${P(n,i)} ${o.what||'missiles'} that arc down on enemies within ${o.r||4} hexes, each dealing ${DT(c,P(m,i))}${o.splash?' to the enemy it lands on and adjacent enemies':''}.${fxText(o.fx,i)}`,
    cast(c,tg,i){const pool=shuffle(foesOf(c).filter(f=>hdist(c,f)<=(o.r||4)));const ts=pool.length?pool:[tg];const N=P(n,i);
      for(let k=0;k<N;k++)schedule(k*.08,()=>{if(c.dead)return;const a=ts.filter(f=>!f.dead);if(!a.length)return;const t=a[k%a.length];
        fire(c,t,o.col||tcol(c),()=>{for(const q of[t,...(o.splash?near(t,1):[])])hitAb(c,q,P(m,i)*(q===t?1:.6));applyFx(c,t,o.fx,i);},{arc:1,dur:.45+Math.random()*.3,lift:50+Math.random()*60,side:rnd(-60,60),retarget:1,size:o.size||3});});}}),
  chain:(n,m,o={})=>({d:(c,i)=>`Strikes the target for ${DT(c,P(m,i))}, then jumps to ${P(n,i)} more enem${P(n,i)>1?'ies':'y'}, losing ${pcnt(1-(o.decay||.85))} each jump.${fxText(o.fx,i)}`,
    cast(c,tg,i){const hit=[];let cur=tg,prev=c;for(let k=0;k<=P(n,i)&&cur;k++){const t=cur,p=prev,mm=P(m,i)*Math.pow(o.decay||.85,k);hit.push(t);
      schedule(k*.09,()=>{if(c.dead||t.dead)return;lineFx(p,t,o.col||tcol(c),2,.25);hitAb(c,t,mm);applyFx(c,t,o.fx,i);});prev=t;cur=foesOf(c).filter(f=>!hit.includes(f)&&hdist(f,t)<=3).sort((a,b)=>hdist(a,t)-hdist(b,t))[0];}}}),
  // explosion around a point: o.at target|cluster|weak|far, o.r radius, o.arc lob
  blast:(m,o={})=>({d:(c,i)=>`${o.arc?'Lobs':'Fires'} ${o.what||'an attack'} at ${TO[o.at||'target']} that ${o.r===0?'hits it':`explodes on it and every enemy within ${o.r||1} hex${(o.r||1)>1?'es':''}`} for ${DT(c,P(m,i))}${o.r===0?'':` (${pcnt(o.splash||.7)} to the others)`}.${fxText(o.fx,i)}`,
    cast(c,tg,i,x){const t=x.t=pickT(c,tg,o.at);if(!t)return;fire(c,t,o.col||tcol(c),()=>{const r=o.r??1;for(const q of[t,...(r?near(t,r):[])]){hitAb(c,q,P(m,i)*(q===t?1:o.splash||.7));applyFx(c,q,o.fx,i);}boom(t,o.col||tcol(c),2);},
      o.arc?{arc:1,dur:.6,lift:90,side:0,retarget:1,size:5}:{sp:300,size:4});}}),
  nova:(m,o={})=>({d:(c,i)=>`${o.say||'Unleashes a shockwave'} that hits every enemy within ${P(o.r||2,i)} hex${P(o.r||2,i)>1?'es':''} for ${DT(c,P(m,i))}.${fxText(o.fx,i)}`,
    cast(c,tg,i){for(const q of foesOf(c).filter(f=>hdist(f,c)<=P(o.r||2,i))){hitAb(c,q,P(m,i));applyFx(c,q,o.fx,i);}if(!SIM.on){ring(c.x,c.y-6,o.col||tcol(c));schedule(.1,()=>ring(c.x,c.y-6,'#ffffff'));}}}),
  cone:(m,o={})=>({d:(c,i)=>`${o.say||'Sweeps a cone'} through the target and enemies up to ${P(o.depth||1,i)} hex${P(o.depth||1,i)>1?'es':''} behind it for ${DT(c,P(m,i))} (70% to the others).${fxText(o.fx,i)}`,
    cast(c,tg,i){const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=P(o.depth||1,i)&&hdist(f,c)>=hdist(tg,c))];for(const q of ts){hitAb(c,q,P(m,i)*(q===tg?1:.7));applyFx(c,q,o.fx,i);if(!SIM.on)burst(q.x,q.y-10,o.col||tcol(c),10,1);}lineFx(c,tg,o.col||tcol(c),3,.3);}}),
  beam:(m,o={})=>({d:(c,i)=>`${o.charge?`Charges for ${o.charge}s, then fires`:'Fires'} ${o.what||'a beam'} through the target that hits every enemy in a line for ${DT(c,P(m,i))}.${fxText(o.fx,i)}`,
    cast(c,tg,i){const go=()=>{if(c.dead||tg.dead)return;const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts){hitAb(c,q,P(m,i));applyFx(c,q,o.fx,i);}
      if(!SIM.on){const dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy)||1;fx.push({line:1,x1:c.x,y1:c.y-12,x2:c.x+dx/L*420,y2:c.y-12+dy/L*420,life:.35,max:.35,col:o.col||tcol(c),w:4});}};
      if(o.charge){c.busy=Math.max(c.busy,o.charge+.1);schedule(o.charge,go);}else go();}}),
  shield:(p,o={})=>({d:(c,i)=>`Gives ${o.who==='team'?'every ally':o.who==='adjacent'?'itself and adjacent allies':o.who==='lowest'?'the most injured ally':'itself'} a shield of ${HPT(c,P(p,i))}${o.who&&o.who!=='self'?' (of each one\'s max HP)':''}${o.def?` and +${P(o.def,i)} <span class="s-def">Defense</span> and <span class="s-def">Sp. Def</span> for 4s`:''}.`,
    cast(c,tg,i){const ws=o.who==='team'?alive(c.team):o.who==='adjacent'?alive(c.team).filter(a=>hdist(a,c)<=1):o.who==='lowest'?[alive(c.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]]:[c];
      for(const a of ws){if(!a)continue;a.shield+=a.maxHp*P(p,i);if(o.def){const v=P(o.def,i);a.def+=v;a.res+=v;schedule(4,()=>{a.def-=v;a.res-=v;});}if(!SIM.on)ring(a.x,a.y-8,'#dfe8ff');}}}),
  heal:(m,o={})=>({d:(c,i)=>`Heals ${o.who==='team'?'every ally':o.who==='adjacent'?'itself and adjacent allies':o.who==='self'?'itself':'the most injured ally'} for ${HT(c,P(m,i))}${o.cleanse?' and cures burn and poison':''}.`,
    cast(c,tg,i){const ws=o.who==='team'?alive(c.team):o.who==='adjacent'?alive(c.team).filter(a=>hdist(a,c)<=1):o.who==='self'?[c]:[alive(c.team).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]];
      for(const a of ws){if(!a)continue;heal(a,HEALV(c,P(m,i)));if(o.cleanse)cureStatus(a);if(!SIM.on)burst(a.x,a.y-12,'#c6ff8a',8,.6);}}}),
  buff:(st,o={})=>({d:(c,i)=>`Gives ${o.who==='team'?'every ally':o.who==='adjacent'?'itself and adjacent allies':'itself'} ${Object.entries(st).map(([k,v])=>`+${k==='def'||k==='res'?P(v,i):pcnt(P(v,i))} ${{as:'<span class="s-as">Attack Speed</span>',dmg:'damage',atk:'<span class="s-atk">Attack</span>',spa:'<span class="s-spa">Sp. Atk</span>',def:'<span class="s-def">Defense</span>',res:'<span class="s-def">Sp. Def</span>',dr:'damage reduction'}[k]}`).join(', ')} ${o.dur?`for ${o.dur}s`:'for the rest of the battle (stacks)'}.`,
    cast(c,tg,i){const ws=o.who==='team'?alive(c.team):o.who==='adjacent'?alive(c.team).filter(a=>hdist(a,c)<=1):[c];
      for(const a of ws){for(const[k,v0]of Object.entries(st)){const v=P(v0,i);const ap=s=>{if(k==='as'||k==='atk'||k==='spa')a[k]*=s>0?1+v:1/(1+v);else if(k==='dmg')a.dmg+=s*v;else if(k==='dr')a.taken*=s>0?1-v:1/(1-v);else a[k]+=s*v;};ap(1);if(o.dur)schedule(o.dur,()=>ap(-1));}
        if(!SIM.on)spark(a.x,a.y-16,'#ffe27a',6);}}}),
  // status without damage on chosen targets
  control:(fx,o={})=>({d:(c,i)=>`${o.say||'Targets'} ${o.n?`the ${P(o.n,i)} nearest enemies`:o.r?`every enemy within ${o.r} hex${o.r>1?'es':''} of ${TO[o.at||'target']}`:TO[o.to||'target']}.${fxText(fx,i)}`,
    cast(c,tg,i,x){let ts;if(o.n)ts=foesOf(c).sort((a,b)=>hdist(a,c)-hdist(b,c)).slice(0,P(o.n,i));else{const t=x.t=pickT(c,tg,o.at||o.to);ts=o.r?[t,...near(t,o.r)]:[t];}
      for(const q of ts)if(q)applyFx(c,q,fx,i);if(!SIM.on&&ts[0])ring(ts[0].x,ts[0].y-6,o.col||'#c6b3ff');}}),
  zone:(m,o={})=>({d:(c,i)=>`${o.say||'Covers the ground'} around ${o.at==='self'?'itself':TO[o.at||'target']} (${o.r||1} hex${(o.r||1)>1?'es':''}) for ${P(o.dur||4,i)}s. ${o.heal?`Allies inside heal ${pcnt(P(o.heal,i))} <span class="s-hp">max HP</span> per second`:`Enemies inside take ${DT(c,P(m,i))} every half second`}.${fxText(o.fx,i)?' Each tick'+fxText(o.fx,i).slice(3):''}`,
    cast(c,tg,i){const at=o.at==='self'?c:pickT(c,tg,o.at);if(!at)return;
      zone(c,at,o.r||1,P(o.dur||4,i),o.col||tcol(c),z=>{if(o.heal){for(const a of inZone(z,c.team))heal(a,a.maxHp*P(o.heal,i)/2,true);return;}for(const q of inZone(z,1-c.team)){hitAb(c,q,P(m,i),{noCrit:1,quiet:1});applyFx(c,q,o.fx,i);}},!!o.heal);}}),
  ramp:(st)=>({d:(c,i)=>`Powers up: ${Object.entries(st).map(([k,v])=>`+${pcnt(P(v,i))} ${{as:'<span class="s-as">Attack Speed</span>',atk:'<span class="s-atk">Attack</span>',spa:'<span class="s-spa">Sp. Atk</span>',dmg:'damage'}[k]}`).join(', ')} for the rest of the battle (stacks).`,
    cast(c,tg,i){for(const[k,v]of Object.entries(st)){if(k==='dmg')c.dmg+=P(v,i);else c[k]*=1+P(v,i);}if(!SIM.on)burst(c.x,c.y-12,'#ffe27a',10,.7);}}),
  airborne:(dur)=>({d:()=>`Rises out of reach for ${dur}s (can't be targeted or hit).`,cast(c){c.airT=combatT+dur;c.busy=Math.max(c.busy,dur);c.target=null;if(!SIM.on)burst(c.x,c.y-10,'#cfe8ff',14,1);}}),
};
// run blocks in order, half a beat apart
function seq(...bs){return{d:(c,i)=>bs.map(b=>b.d(c,i)).map((t,k)=>!k||/^Then/.test(t)?t:'Then it '+t.charAt(0).toLowerCase()+t.slice(1)).join(' '),cast(c,tg,i){const x={};let t=0;for(const b of bs){const tt=t;schedule(tt,()=>{if(!c.dead)b.cast(c,x.t&&!x.t.dead?x.t:tg,i,x);});t+=b.gap??.3;}}};}
function staged(...bs){return{d:(c,i)=>bs[Math.min(i,bs.length-1)].d(c,i),cast:(c,tg,i,x)=>bs[Math.min(i,bs.length-1)].cast(c,tg,i,x||{})};}
// define a kit from blocks
function kit(base,body){for(const h of['begin','kill','hitBy'])if(body&&body[h]&&!base[h])base[h]=body[h];defSig(Object.assign(base,{d:base.d||((c,i)=>(base.lead?base.lead+' ':'')+body.d(c,i)+(base.tail?' '+base.tail(c,i):'')),cast:base.cast||((c,tg,i)=>body.cast(c,tg,i,{}))}));}
