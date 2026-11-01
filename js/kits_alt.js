/* Alternate forms: Deoxys formes, fusions (Kyurem, Necrozma, Calyrex), and form units
   (Wormadam cloaks, Oricorio styles, Lycanroc, Low Key Toxtricity, Rapid Strike Urshifu). */

// Deoxys: the forme it took decides how Psycho Boost plays
kit({ids:[386],role:'Alien Virus',cls:'Striker',cat:'spec',range:3,mana:60,pf:1.2,names:['Psycho Boost'],mvType:'Psychic',tail:()=>'<b>Meteorite:</b> choose its forme when you get it (and change it between battles from its menu).'},
  {d:c=>c.dex===10001?`Attack Forme: fires an overloaded Psycho Boost at the target for ${DT(c,2.6)}, then its own <span class="s-spa">Sp. Atk</span> drops 15% for 4s.`
     :c.dex===10002?`Defense Forme: gives itself and adjacent allies a shield of ${HPT(c,.2)}, then fires a Psycho Boost for ${DT(c,1.3)}.`
     :c.dex===10003?`Speed Forme: blinks between the 3 weakest enemies, hitting each with Psycho Boost for ${DT(c,.85)}.`
     :`Fires a Psycho Boost at the target for ${DT(c,2)}, then its own <span class="s-spa">Sp. Atk</span> drops 15% for 4s.`,
   cast(c,tg){
     if(c.dex===10002){B.shield(.2,{who:'adjacent'}).cast(c,tg,0);fire(c,tg,'#ff9be6',()=>hitAb(c,tg,1.3),{size:5});return;}
     if(c.dex===10003){foesOf(c).sort((a,b)=>a.hp-b.hp).slice(0,3).forEach((t,k)=>schedule(k*.15,()=>{if(c.dead||t.dead)return;lineFx(c,t,'#ff9be6',2,.2);hitAb(c,t,.85);boom(t,'#ff9be6');}));return;}
     const m=c.dex===10001?2.6:2;fire(c,tg,'#ff9be6',()=>{hitAb(c,tg,m);boom(tg,'#ff9be6',c.dex===10001?3:2);},{size:c.dex===10001?7:5,sp:300});debuff(c,'spa',.15,4);}});

// Kyurem: Glaciate, or Freeze Shock / Ice Burn once fused
kit({ids:[646],role:'Boundary Dragon',cls:'Mystic',cat:'spec',range:3,mana:85,pf:1.15,names:['Glaciate'],mvType:'Ice',tail:()=>'<b>DNA Splicers:</b> own Zekrom or Reshiram too and you can fuse them from its menu.'},
  {d:c=>c.dex===10022?`<b>Teravolt.</b> Charges a Freeze Shock for 0.5s, then strikes the target and every enemy next to it for ${DT(c,1.8)}, ignoring shields, stunning them for 1s and adding 3 Paralysis.`
     :c.dex===10023?`<b>Turboblaze.</b> Breathes an Ice Burn through the target and every enemy up to 2 hexes behind it for ${DT(c,1.7)} (70% to the others), ignoring shields and adding 5 Burn and 3 Chill.`
     :`Exhales a Glaciate wave over every enemy within 3 hexes: ${DT(c,1)} each and 5 Chill, slowing them by 20% for 3s.`,
   cast(c,tg){
     if(c.dex===10022){c.busy=Math.max(c.busy,.55);schedule(.5,()=>{if(c.dead||tg.dead)return;for(const q of[tg,...near(tg,1)]){q.shield=0;hitAb(c,q,1.8,{cat:'phys'});stun(q,1);addStatus(q,'para',3,c);}if(!SIM.on){pfx('Discharge_Hit',tg.x,tg.y-14,{sc:1.4,force:1});pfx('Ice_Shard_Hit',tg.x,tg.y-10,{sc:1.4,force:1});}});return;}
     if(c.dex===10023){const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=2&&hdist(f,c)>=hdist(tg,c))];for(const q of ts){q.shield=0;hitAb(c,q,1.7*(q===tg?1:.7));addStatus(q,'burn',5,c);addStatus(q,'chill',3,c);if(!SIM.on)burst(q.x,q.y-10,'#bfe8ff',14,1.2);}lineFx(c,tg,'#ffffff',4,.4);return;}
     for(const q of foesOf(c).filter(f=>hdist(f,c)<=3)){hitAb(c,q,1);addStatus(q,'chill',5,c);applyFx(c,q,{slow:[.2,3]},0);}if(!SIM.on)pfx('Icy_Wind',c.x,c.y-14,{sc:2.2,force:1});}});

// Necrozma: Photon Geyser; fused, it uses its partner's move; at half HP a fused Necrozma Ultra Bursts
kit({ids:[800],role:'Prism',cls:'Mystic',cat:'spec',range:3,mana:80,pf:1.15,names:['Photon Geyser'],mvType:'Psychic',
  tail:()=>'<b>Prism Armor:</b> takes 15% less damage. <b>N-Solarizer / N-Lunarizer:</b> fuse with Solgaleo or Lunala from its menu; a fused Necrozma Ultra Bursts at half HP.',begin(c){c.taken*=.85;}},
  {d:c=>c.dex===10157?`<b>Ultra Necrozma.</b> Fires the Light That Burns the Sky through every enemy in a line for ${DT(c,2.4)}, using its higher attacking stat and ignoring shields.`
     :c.dex===10155?`<b>Dusk Mane.</b> Slams into the target with Sunsteel Strike for ${DT(c,2)}, ignoring its shield and 50% of its Defense, then scorches adjacent enemies for ${DT(c,.8)}.`
     :c.dex===10156?`<b>Dawn Wings.</b> Fires a Moongeist Beam through every enemy in a line for ${DT(c,1.7)}, ignoring shields and lowering their Sp. Def by 15.`
     :`Fires a Photon Geyser at the target and every enemy within 1 hex for ${DT(c,1.7)} (70% to the others), using its higher attacking stat.`,
   hitBy(c,src,o,d){if(c.fused&&c.dex!==10157&&c.hp-d<c.maxHp/2&&FORMS[10157]){transform(c,10157,{label:'Ultra Burst!',col:'#fff6c0',big:1});c.hp=Math.min(c.maxHp,c.hp+c.maxHp*.25);gainMana(c,40);}},
   cast(c,tg){const cat=c.atk>c.spa?'phys':'spec';
     if(c.dex===10157){const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts){q.shield=0;hitAb(c,q,2.4,{cat});}if(!SIM.on){const dx=tg.x-c.x,dy=tg.y-c.y,L=Math.hypot(dx,dy)||1;fx.push({line:1,x1:c.x,y1:c.y-12,x2:c.x+dx/L*420,y2:c.y-12+dy/L*420,life:.5,max:.5,col:'#fff6c0',w:10});}return;}
     if(c.dex===10155){if(tg.dead)return;dashTo(c,tg,false,.2);schedule(.22,()=>{if(c.dead||tg.dead)return;tg.shield=0;hitAb(c,tg,2,{pen:.5,cat:'phys'});for(const q of near(tg,1))hitAb(c,q,.8,{cat:'phys'});boom(tg,'#ffd34d',3);});return;}
     if(c.dex===10156){const ts=lineHits(c,tg);if(!ts.includes(tg))ts.push(tg);for(const q of ts){q.shield=0;hitAb(c,q,1.7,{cat:'spec'});q.res=Math.max(0,q.res-15);}lineFx(c,tg,'#b07aff',5,.4);return;}
     if(tg.dead)return;for(const q of[tg,...near(tg,1)])hitAb(c,q,1.7*(q===tg?1:.7),{cat});if(!SIM.on){fx.push({line:1,x1:tg.x,y1:tg.y-160,x2:tg.x,y2:tg.y-6,life:.45,max:.45,col:'#fff6c0',w:8});boom(tg,'#fff6c0',3);}}});

// Calyrex: healing Leaf Storm; riding Glastrier or Spectrier it takes their power
kit({ids:[898],role:'King of Bountiful Harvests',cls:'Medic',type:'heal',cat:'spec',range:3,mana:75,pf:1.15,names:['Leaf Storm'],mvType:'Psychic',
  tail:c=>c.dex===10193?'<b>As One (Chilling Neigh):</b> each knockout raises its Attack by 10%.':c.dex===10194?'<b>As One (Grim Neigh):</b> each knockout raises its Sp. Atk by 10%.':'<b>Reins of Unity:</b> own Glastrier or Spectrier too and it can ride them (fuse from its menu).'},
  {d:c=>c.dex===10193?`<b>Ice Rider.</b> Hurls Glacial Lances into every enemy within 2 hexes for ${DT(c,1.5)}, adding 3 Chill.`
     :c.dex===10194?`<b>Shadow Rider.</b> Rains an Astral Barrage of 7 ghostly riders on enemies, ${DT(c,.6)} each.`
     :`Heals every ally for ${HT(c,.35)}, then whips up a Leaf Storm at the biggest group of enemies for ${DT(c,1.1)} (70% to adjacent enemies).`,
   kill(c){if(c.dex===10193)c.atk*=1.1;if(c.dex===10194)c.spa*=1.1;},
   cast(c,tg){
     if(c.dex===10193){for(const q of foesOf(c).filter(f=>hdist(f,c)<=2)){hitAb(c,q,1.5,{cat:'phys'});addStatus(q,'chill',3,c);}if(!SIM.on){ring(c.x,c.y-6,'#bff0ff');pfx('Ice_Shard_Hit',c.x,c.y-12,{sc:1.4,force:1});}return;}
     if(c.dex===10194){B.barrage(7,.6,{what:'ghostly riders',r:6,col:'#8a6cd6'}).cast(c,tg,0);return;}
     B.heal(.35,{who:'team'}).cast(c,tg,0);schedule(.3,()=>{if(!c.dead)B.blast(1.1,{at:'cluster',r:1,col:'#7fe3a8'}).cast(c,tg,0,{});});}});

// --- form units ---
kit({ids:[10004],role:'Sand Cloak',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1.05,names:['Bulldoze'],mvType:'Ground',tail:()=>'<b>Overcoat:</b> immune to weather damage.',begin(c){c.fx.noWeatherChip=1;}},
  seq(B.shield(.2),B.nova(1.1,{say:'Bulldozes the sand',r:1,col:'#d8c08a',fx:{slow:[.25,3]}})));
kit({ids:[10005],role:'Trash Cloak',cls:'Vanguard',type:'guard',cat:'phys',range:1,mana:70,start:25,pf:1.05,names:['Iron Head'],mvType:'Steel',tail:()=>'<b>Overcoat:</b> immune to weather damage.',begin(c){c.fx.noWeatherChip=1;}},
  seq(B.shield(.25,{def:10}),B.hit(1.3,{proj:false,fx:{flinch:.3}})));
const dance=(ty,col,fx,say)=>({d:c=>`${B.cone(1.2,{say,depth:2}).d(c,0)}${fxText(fx,0)}`,
  begin(c){every(c,.5,()=>{for(const a of alive(c.team))if(a!==c&&hdist(a,c)<=2&&a.casts>(a['dn'+c.u.uid]||0)){a['dn'+c.u.uid]=a.casts;gainMana(c,10);}});},
  cast(c,tg){const ts=[tg,...alive(tg.team).filter(f=>f!==tg&&hdist(f,tg)<=2&&hdist(f,c)>=hdist(tg,c))];for(const q of ts){damage(c,q,V(c,1.2*(q===tg?1:.7)),{ab:1,cat:'spec',type:ty});applyFx(c,q,fx,0);if(!SIM.on)burst(q.x,q.y-10,col,10,1);}lineFx(c,tg,col,3,.3);}});
const DANCER=()=>'<b>Dancer:</b> whenever an ally within 2 hexes uses its move, it gains 10 PP.';
kit({ids:[10123],role:'Cheer Dancer',cls:'Trickster',cat:'spec',range:3,mana:60,pf:1.05,names:['Revelation Dance'],mvType:'Electric',tail:DANCER},dance('Electric','#ffe14d',{para:2},'Dances an electric Revelation Dance'));
kit({ids:[10124],role:'Hula Dancer',cls:'Mystic',cat:'spec',range:3,mana:60,pf:1.05,names:['Revelation Dance'],mvType:'Psychic',tail:DANCER},dance('Psychic','#ff9be6',{conf:2},'Dances a psychic Revelation Dance'));
kit({ids:[10125],role:'Fan Dancer',cls:'Trickster',cat:'spec',range:3,mana:60,pf:1.05,names:['Revelation Dance'],mvType:'Ghost',tail:DANCER},dance('Ghost','#8a6cd6',{weaken:.15},'Dances a ghostly Revelation Dance'));
kit({ids:[10126],role:'Midnight Wolf',cls:'Bruiser',cat:'phys',range:1,mana:60,pf:1.1,names:['Counter'],mvType:'Rock',tail:()=>'<b>No Guard:</b> its attacks can\'t be dodged.',begin(c){c.fx.noGuard=1;}},
  {d:c=>`Braces to Counter for 1.5s: every basic attack against it is struck back for double the damage. Then it hurls a Stone Edge at the target for ${DT(c,1.3)} (+20% crit chance).`,
   cast(c,tg){c.counterT=combatT+1.5;if(!SIM.on)ring(c.x,c.y-8,'#c8b090');schedule(.3,()=>{if(!c.dead&&!tg.dead)hitAb(c,tg,1.3,{cr:.2});});},
   hitBy(c,src,o,d){if(c.counterT>combatT&&src&&src.team!==c.team&&o.auto&&!o.refl&&!src.dead)schedule(.05,()=>{if(!src.dead&&!c.dead)damage(c,src,d*2,{cat:'phys',ab:1,noCrit:1,refl:1});});}});
kit({ids:[10152],role:'Dusk Wolf',cls:'Striker',cat:'phys',range:1,mana:55,start:30,pf:1.1,names:['Accelerock'],mvType:'Rock',tail:()=>'<b>Tough Claws:</b> +15% damage.',begin(c){c.dmg+=.15;}},
  B.hit(.75,{n:2,dash:1,to:'weak',cr:.15,fx:{flinch:.3}}));
kit({ids:[10184],role:'Low Key Rocker',cls:'Artillery',cat:'spec',range:3,mana:70,pf:1.1,names:['Overdrive'],mvType:'Electric',tail:()=>'<b>Punk Rock:</b> its sound move deals +20% damage (included).'},
  B.cone(1.3*1.2,{say:'Plays a low, rumbling Overdrive',depth:2,col:'#7a6cd6',fx:{psn:.015,slow:[.2,3]}}));
kit({ids:[10191],role:'Rapid Strike',cls:'Striker',cat:'phys',range:1,mana:60,pf:1.2,names:['Surging Strikes'],mvType:'Water',tail:()=>'<b>Unseen Fist:</b> its strikes ignore shields.'},
  {d:c=>`Unleashes Surging Strikes: 3 flowing blows on the target for ${DT(c,.5)} each. Every blow is a critical hit and ignores shields.`,
   cast(c,tg){for(let k=0;k<3;k++)schedule(k*.12,()=>{if(c.dead||tg.dead)return;tg.shield=0;damage(c,tg,V(c,.5)*(1+c.critD),{ab:1,cat:'phys',type:'Water',noCrit:1});if(!SIM.on)spark(tg.x,tg.y-12,'#5ab8ff',8);});}});

// tuning pass (kitbalA): form units against the generations at the same cost
for(const[d,m]of Object.entries({10123:.8,10124:.75,10125:.8,10184:.8,10152:.8}))tuneSig(+d,m);
