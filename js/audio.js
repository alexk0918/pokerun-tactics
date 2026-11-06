"use strict";
/* PokéRun Tactics — audio.
   Music: tracks from the Pokémon Mystery Dungeon games (© Nintendo / Chunsoft / The Pokémon Company), played as background
   music with their original loop points. Credits are in README.md and Settings › Audio. A fan project, not for profit.
   Sound effects: Pokémon Mystery Dungeon: Explorers of Sky samples, as collected by the PMDO project (audinowho/DumpAsset). */

const AU={ctx:null,out:null,mus:null,sfx:null,rev:null,cur:null,timer:null,last:{},burst:[],want:null};

/* ---------- tracks: assets/music/<id>.mp3, looping from a to b (seconds) ---------- */
const MUSIC={
  menu:{n:"Top Menu Theme",a:0,b:27.7295},
  theme:{n:"Pok\u00e9mon Exploration Team Theme",a:0,b:78.5241},
  applewoods:{n:"Apple Woods",a:0,b:86.0},
  treeshroud:{n:"Treeshroud Forest",a:0.9752,b:90.6684},
  skypeakforest:{n:"Sky Peak Forest",a:0.6502,b:74.174},
  mtbristle:{n:"Mt. Bristle",a:0,b:58.6787},
  boulderquarry:{n:"Boulder Quarry",a:1.9505,b:88.797},
  darkcrater:{n:"Dark Crater",a:0.9752,b:74.8061},
  waterfallcave:{n:"Waterfall Cave",a:0,b:86.9418},
  brinecave:{n:"Brine Cave",a:1.3003,b:85.7275},
  icicleforest:{n:"Icicle Forest",a:2.2756,b:126.7007},
  crystalcave:{n:"Crystal Cave",a:0,b:93.3332},
  boss:{n:"Boss Battle!",a:0,b:45.2591},
  dialga:{n:"Dialga's Fight to the Finish!",a:34.4584,b:134.9872},
  kecleon:{n:"Kecleon's Shop",a:0.9752,b:78.9667}
};
// three tracks per act that rotate as you climb, plus the guardian theme
const ACT_TRACKS=[['applewoods','treeshroud','skypeakforest'],['mtbristle','boulderquarry','darkcrater'],['waterfallcave','brinecave','icicleforest']];
const ENDLESS_TRACKS=['crystalcave','applewoods','darkcrater','icicleforest','treeshroud','waterfallcave','boulderquarry','skypeakforest','brinecave','mtbristle'];

/* ---------- setup ---------- */
function auInit(){
  if(AU.ctx)return AU.ctx.state==='suspended'?AU.ctx.resume():null;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{auGraph(new AC());}catch(e){return;}
  auVolumes();AU.timer=setInterval(auTick,25);sfxLoad();
  if(AU.want)music(AU.want,true);
}
// the mixing graph: compressor ← master ← music and effects buses
function auGraph(c){AU.ctx=c;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
  AU.out=c.createGain();AU.out.gain.value=1;AU.out.connect(comp);
  AU.mus=c.createGain();AU.sfx=c.createGain();AU.mus.connect(AU.out);AU.sfx.connect(AU.out);
}
function auVolumes(){if(!AU.ctx)return;const t=AU.ctx.currentTime;
  AU.mus.gain.setTargetAtTime(OPTS.musVol??.5,t,.1);AU.sfx.gain.setTargetAtTime(OPTS.sfxVol??.6,t,.05);}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,auInit,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden){AU.ctx.suspend();if(AU.cur)AU.cur.el.pause();}else{AU.ctx.resume();if(AU.cur)AU.cur.el.play().catch(()=>{});}});
const auOK=()=>AU.ctx&&AU.ctx.state==='running'&&!SIM.on;

/* ---------- the music player ---------- */
// each track streams from an <audio> element through a gain node (so volume works everywhere, iOS too) and crossfades
function music(id,force){
  AU.want=id;if(!AU.ctx)return;if(!force&&AU.cur&&AU.cur.id===id)return;const T=MUSIC[id];if(!T)return;
  const c=AU.ctx,old=AU.cur;
  if(old){old.g.gain.setTargetAtTime(0,c.currentTime,.5);setTimeout(()=>{try{old.el.pause();old.el.removeAttribute('src');old.g.disconnect();}catch(e){}},3000);}
  const el=new Audio();el.src=`assets/music/${id}.mp3`;el.preload='auto';
  // a track without loop points just loops the whole file
  if(!T.a)el.loop=true;
  // if it ever reaches the very end before the loop jump, carry on from the loop start
  else el.addEventListener('ended',()=>{if(AU.cur&&AU.cur.el===el){el.currentTime=T.a;el.play().catch(()=>{});}});
  const g=c.createGain();g.gain.value=0;try{c.createMediaElementSource(el).connect(g);}catch(e){}g.connect(AU.mus);
  g.gain.setTargetAtTime(1,c.currentTime+.1,.7);
  AU.cur={id,el,g,T};el.play().catch(()=>{});
}
function musicStop(){AU.want=null;const o=AU.cur;if(o&&AU.ctx){o.g.gain.setTargetAtTime(0,AU.ctx.currentTime,.4);setTimeout(()=>{try{o.el.pause();}catch(e){}},2500);}AU.cur=null;}
// jump back to the loop start just before the loop end (the file runs a second past it, so the jump is seamless)
function auTick(){const M=AU.cur;if(!M||!M.T.a)return;const el=M.el,t=el.currentTime;if(t>=M.T.b-.02)el.currentTime=M.T.a+(t-M.T.b);}
// which track to play right now
function musicForRun(){if(!run)return'menu';const a=actOf();
  if(floorKind(run.floor)==='boss')return a>=2?'dialga':'boss';
  if(a>=ACT_TRACKS.length)return ENDLESS_TRACKS[(a*3+Math.floor((run.floor-1)/5))%ENDLESS_TRACKS.length];
  return ACT_TRACKS[a][Math.min(2,Math.floor((run.floor-1)/5))];}

/* ---------- sound effects: PMD samples in assets/sfx, decoded once and played from memory ---------- */
const SFX_FILES=['Normal','Normal2','Fire','Fire2','Water','Water2','Grass','Grass2','Electric','Electric2','Ice','Ice2','Fighting','Fighting2','Poison','Poison2','Ground','Ground2','Flying','Flying2','Psychic','Psychic2','Bug','Bug2','Rock','Rock2','Ghost','Ghost2','Dragon','Dragon2','Dark','Dark2','Steel','Steel2','Fairy','Fairy2',
  'hit','crit','miss','faint','buy','sell','reroll','level','star','evolve','win','lose','chest','treasure','pick','lock','coin','error','select'];
// how loud each one sits in the mix (hits are frequent, so they're quiet)
const SFX_VOL={hit:.35,crit:.55,miss:.4,faint:.6,select:.5,lock:.6,coin:.6,buy:.7,sell:.6,reroll:.6};
const SFXBUF={};
function sfxLoad(){if(!AU.ctx||AU.sfxLoading)return;AU.sfxLoading=1;
  for(const k of SFX_FILES)fetch(`assets/sfx/${k}.mp3`).then(r=>r.arrayBuffer()).then(b=>AU.ctx.decodeAudioData(b)).then(buf=>{SFXBUF[k]=buf;}).catch(()=>{});}
// rate limit so a busy battle doesn't turn into noise
function sfxGate(k,gap){const t=performance.now();if((AU.last[k]||0)>t-gap)return false;AU.burst=AU.burst.filter(x=>x>t-150);if(AU.burst.length>=6)return false;AU.last[k]=t;AU.burst.push(t);return true;}
function playBuf(k,vol=1,rate=1){const b=SFXBUF[k];if(!b)return;const c=AU.ctx,s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.playbackRate.value=rate;g.gain.value=vol;s.connect(g);g.connect(AU.sfx);s.start();}
function sfx(k,gap=40){if(!auOK()||!(OPTS.sfxVol??.6)||!sfxGate(k,gap))return;playBuf(k,SFX_VOL[k]??.8,k==='hit'?.92+Math.random()*.16:1);}
// each type has two PMD move sounds; one is picked at random
function sfxMove(type){if(!auOK()||!(OPTS.sfxVol??.6))return;const t=SFXBUF[type]?type:'Normal';if(!sfxGate('mv:'+t,90))return;playBuf(Math.random()<.5?t:t+'2',.7);}
