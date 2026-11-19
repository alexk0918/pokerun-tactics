"use strict";
/* PokéRun Tactics — trait sets in battle (Titans, Sky Squadron, Fox Spirits, Showstoppers, Fae Folk …).
   Every Pokémon has its types, its class and at most one of these (see originOf in game.js).
   Membership comes from data/traits.json (Pokédex weight, body shape, egg groups and categories). */

function traitsOnStart(u,F,foes){
  if(u.decoy)return;
  // Titans: an opening stomp
  if(F.titan){for(const o of foes)if(hdist(o,u)<=1){stun(o,F.titan);if(F.titanDmg)hurt(o,u.maxHp*F.titanDmg,u);}if(F.titanPP)for(const o of foes)o.mana=Math.max(0,o.mana-F.titanPP);if(!SIM.on){ring(u.x,u.y-4,'#c9a46b');burst(u.x,u.y,'#b08a5a',18,1.2);}}
  // Sky Squadron: take off, then dive onto the farthest enemy
  if(F.sky){u.airT=combatT+1;u.busy=Math.max(u.busy,1.05);u.target=null;if(!SIM.on)burst(u.x,u.y-10,'#cfe8ff',14,1);
    schedule(1,()=>{if(u.dead||(mode!=='combat'&&!SIM.on))return;const t=skyTarget(u);if(!t)return;dashTo(u,t,true,.25);
      if(F.sky>=2)schedule(.27,()=>{if(u.dead||t.dead)return;damage(u,t,(u.base||50)*.6+Math.max(u.atk,u.spa)*.5,{ab:1,cat:u.cat,noCrit:1});if(F.sky>=3)stun(t,.8);if(!SIM.on)boom(t,'#cfe8ff',2);});});}
  // Living Stone: a shell that rebuilds every 4s
  if(F.stone){u.shield+=u.maxHp*F.stone;every(u,F.stoneFast?2:4,()=>{u.shield=Math.max(u.shield,u.maxHp*F.stone);if(!SIM.on)ring(u.x,u.y-6,'#a8a8b0');});}
  // Mouse Brigade: faster for every other rodent
  if(F.mouse){const n=units.filter(a=>a!==u&&!a.dead&&!a.decoy&&a.team===u.team&&a.fx.mouse).length;u.as*=1+F.mouse*n;}
  // Nursery: cheer on adjacent allies
  if(F.cheer)for(const a of units)if(a!==u&&!a.dead&&a.team===u.team&&hdist(a,u)<=1)a.dmg+=F.cheer;
  // Garden: every 3s, heal the most injured ally within 2 hexes
  if(F.bloom)every(u,3,()=>{const a=units.filter(o=>!o.dead&&!o.decoy&&o.team===u.team&&hdist(o,u)<=2&&o.hp<o.maxHp).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];
    if(a){heal(a,u.maxHp*F.bloom);if(!SIM.on)burst(a.x,a.y-16,'#f7b6d2',8,.6);}});
  // Ranch: stronger for every other Ranch Pokémon on the field
  if(F.herd){const n=units.filter(a=>a!==u&&!a.dead&&!a.decoy&&a.team===u.team&&a.fx.herd).length;u.dmg+=F.herd*n;u.def+=(F.herdDef||0)*n;}
  // Oddballs: a random bonus (two at 4)
  if(F.odd&&!(u.u&&u.u.spins))for(let i=0;i<F.odd;i++){const r=Math.floor(Math.random()*4);if(r===0)u.dmg+=.3;else if(r===1)u.as*=1.3;else if(r===2){u.maxHp*=1.4;u.hp*=1.4;}else u.mana=Math.min(u.maxMana||u.mana+40,u.mana+40);
    if(!SIM.on)texts.push({x:u.x,y:u.y-36-i*12,txt:['Power!','Speed!','Bulk!','PP!'][r],col:'#ffb3f0',life:1.2,label:1});}
  // Fox Spirits: an illusion decoy
  if(F.fox){const n=F.nine?3:1;for(let i=0;i<n;i++)foxDecoy(u,F.fox,!!F.nine);}
  if(F.zoro&&/Zor(ua|oark)/.test(D[u.dex].n)){const top=units.filter(a=>!a.dead&&a.team===u.team&&a!==u&&!a.decoy).sort((a,b)=>Math.max(b.atk,b.spa)-Math.max(a.atk,a.spa))[0];if(top){u.drawDex=top.dex;u.fx.taunt=1;}}
}
function foxDecoy(u,p,casts){
  const spots=nbrs(u.c,u.r).filter(h=>!occupied(h.c,h.r)&&h.r>=0&&h.r<ROWS&&h.c>=0&&h.c<COLS);if(!spots.length)return;
  const h=spots.sort((a,b)=>(u.team?b.r-a.r:a.r-b.r))[0];
  const nu=mkUnit(u.u.root);nu.dex=u.dex;nu.star=u.u.star;
  const c=makeCombatant(nu,u.team,h.c,h.r,{},1);c.summon=1;c.decoy=1;c.maxHp=c.hp=u.maxHp*p;c.shield=0;c.fx={};if(casts){c.atk=u.atk*.3;c.spa=u.spa*.3;c.as*=.5;}else{c.atk=c.spa=1;c.maxMana=0;c.mana=0;c.as*=.5;c.kit=Object.assign({},c.kit,{sig:null});}
  units.push(c);if(!SIM.on){ensure(nu.dex);burst(c.x,c.y-10,'#c9a8ff',16,1);texts.push({x:c.x,y:c.y-34,txt:'Illusion!',col:'#c9a8ff',life:1.2,label:1});}
}
// Fae Folk: wishes land on random allies
function wishLoop(side,p){
  const go=()=>{if(mode!=='combat'&&!SIM.on)return;const al=alive(side).filter(a=>!a.decoy);if(!al.length)return;const a=pick(al);
    if(!SIM.on)burst(a.x,a.y-24,'#ffe9a8',8,.5);schedule(2,()=>{if(!a.dead){heal(a,a.maxHp*p);if(typeof tierAt==='function'&&tierAt(side,'Fae Folk')>=3)cureStatus(a);if(!SIM.on)pfx('Healing_Wish_Hit',a.x,a.y-14,{sc:.7,force:1});}});schedule(4,go);};
  schedule(4,go);
}
