"use strict";
/* PokéRun Tactics — audio. Everything is synthesized live with the Web Audio API (no audio files):
   original ambient music in a cosy dungeon-crawler spirit, and sound effects for moves, hits and the shop.
   Music: each track is a key, a mode, a chord loop and a few soft instruments (pad, plucked arpeggio, a recurring melody
   motif, bass). Tracks crossfade: a title theme, three tracks per act that rotate as you climb, and a guardian theme.
   Volumes live in Settings › Audio. */

const AU={ctx:null,out:null,mus:null,sfx:null,rev:null,track:null,cur:null,nextT:0,step:0,timer:null,last:{},burst:[],want:null};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const MODES={major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],mixo:[0,2,4,5,7,9,10],lydian:[0,2,4,6,7,9,11],minor:[0,2,3,5,7,8,10],phryg:[0,1,3,5,7,8,10]};

/* ---------- tracks ---------- */
// root: MIDI note · prog: scale degrees, one chord per `bars` bars · arp: chord-tone pattern on 8th notes · mel: motif density
const TRACKS={
  title:  {n:'Morning Mist',     root:62,mode:'major', bpm:70,prog:[0,3,5,4],bars:2,seed:11,pad:.07,arp:{v:.035,pat:[0,1,2,3,2,1,0,2],inst:'pluck'},mel:{v:.05,inst:'flute',dens:.45},bass:{v:.07,pat:'half'}},
  forest1:{n:'Verdant Path',     root:67,mode:'major', bpm:82,prog:[0,4,5,3],bars:2,seed:21,pad:.05,arp:{v:.04,pat:[0,2,1,2,0,2,1,3],inst:'marimba'},mel:{v:.05,inst:'flute',dens:.5},bass:{v:.08,pat:'pulse'},perc:{v:.012,k:'shaker'}},
  forest2:{n:'Mossy Hollow',     root:64,mode:'dorian',bpm:68,prog:[0,3,0,6],bars:2,seed:22,pad:.07,arp:{v:.03,pat:[0,2,3,2],inst:'bell',every:2},mel:{v:.045,inst:'ocarina',dens:.35},bass:{v:.07,pat:'half'}},
  forest3:{n:'Sunbeam Glade',    root:60,mode:'lydian',bpm:88,prog:[0,1,0,4],bars:2,seed:23,pad:.05,arp:{v:.035,pat:[0,1,2,1,3,1,2,1],inst:'pluck'},mel:{v:.05,inst:'flute',dens:.55},bass:{v:.07,pat:'pulse'},perc:{v:.01,k:'shaker'}},
  canyon1:{n:'Ember Trail',      root:57,mode:'mixo',  bpm:84,prog:[0,6,3,0],bars:2,seed:31,pad:.05,arp:{v:.04,pat:[0,2,0,3,0,2,1,2],inst:'pluck'},mel:{v:.05,inst:'ocarina',dens:.45},bass:{v:.09,pat:'pulse'},perc:{v:.014,k:'tom'}},
  canyon2:{n:'Red Cliffs',       root:62,mode:'dorian',bpm:74,prog:[0,6,5,6],bars:2,seed:32,pad:.06,arp:{v:.035,pat:[0,1,2,3],inst:'marimba',every:2},mel:{v:.045,inst:'flute',dens:.4},bass:{v:.08,pat:'half'}},
  canyon3:{n:'Heat Haze',        root:53,mode:'lydian',bpm:66,prog:[0,1,4,0],bars:2,seed:33,pad:.07,arp:{v:.03,pat:[0,2,3,2,1,2],inst:'bell'},mel:{v:.04,inst:'ocarina',dens:.3},bass:{v:.07,pat:'half'}},
  grotto1:{n:'Tidepool',         root:66,mode:'minor', bpm:64,prog:[0,5,2,6],bars:2,seed:41,pad:.07,arp:{v:.03,pat:[0,2,1,3,2,1],inst:'bell'},mel:{v:.045,inst:'flute',dens:.35},bass:{v:.07,pat:'half'}},
  grotto2:{n:'Glimmering Depths',root:59,mode:'dorian',bpm:58,prog:[0,3,6,3],bars:2,seed:42,pad:.08,arp:{v:.028,pat:[0,1,2,3,2,1],inst:'bell',every:2},mel:{v:.04,inst:'ocarina',dens:.3},bass:{v:.07,pat:'half'}},
  grotto3:{n:'Moonlit Cove',     root:63,mode:'major', bpm:70,prog:[0,5,3,4],bars:2,seed:43,pad:.06,arp:{v:.035,pat:[0,2,1,2,3,2,1,2],inst:'marimba'},mel:{v:.045,inst:'flute',dens:.45},bass:{v:.07,pat:'pulse'},perc:{v:.01,k:'shaker'}},
  guardian:{n:'Guardian\'s Theme',root:60,mode:'minor', bpm:96,prog:[0,5,3,4],bars:1,seed:51,pad:.06,arp:{v:.04,pat:[0,1,2,1,0,1,2,3],inst:'pluck'},mel:{v:.05,inst:'ocarina',dens:.55},bass:{v:.1,pat:'pulse'},perc:{v:.02,k:'tom'}},
};
const ACT_TRACKS=[['forest1','forest2','forest3'],['canyon1','canyon2','canyon3'],['grotto1','grotto2','grotto3']];

/* ---------- setup ---------- */
function auInit(){
  if(AU.ctx)return AU.ctx.state==='suspended'?AU.ctx.resume():null;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{auGraph(new AC());}catch(e){return;}
  auVolumes();AU.timer=setInterval(auTick,40);
  if(AU.want)music(AU.want,true);
}
// the mixing graph: compressor ← master ← music / effects buses, plus a shared reverb send
function auGraph(c){AU.ctx=c;AU.nb=null;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
  AU.out=c.createGain();AU.out.gain.value=1.8;AU.out.connect(comp);
  AU.mus=c.createGain();AU.sfx=c.createGain();AU.mus.connect(AU.out);AU.sfx.connect(AU.out);
  // a soft room: generated impulse response
  AU.rev=c.createConvolver();const len=c.sampleRate*2.4,ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2);}
  AU.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.35;AU.rev.connect(rg);rg.connect(AU.out);
}
function auVolumes(){if(!AU.ctx)return;const t=AU.ctx.currentTime;
  AU.mus.gain.setTargetAtTime(OPTS.musVol??.5,t,.1);AU.sfx.gain.setTargetAtTime(OPTS.sfxVol??.6,t,.05);}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,auInit,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume();});
const auOK=()=>AU.ctx&&AU.ctx.state==='running'&&!SIM.on;

/* ---------- instruments ---------- */
function env(g,t,a,peak,d,sus,r,len){const p=g.gain;p.setValueAtTime(0,t);p.linearRampToValueAtTime(peak,t+a);p.setTargetAtTime(peak*sus,t+a,d);p.setTargetAtTime(0,t+len,r);}
function voice(dest,{f,t,len,type='sine',v=.1,a=.01,d=.2,sus=.5,r=.2,cut=0,q=.7,det=0,vib=0,send=0,glide=0}){
  const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(glide)o.frequency.exponentialRampToValueAtTime(Math.max(20,glide),t+len);if(det)o.detune.value=det;
  let n=o;if(cut){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;fl.Q.value=q;o.connect(fl);n=fl;}
  if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.2;lg.gain.value=f*vib;l.connect(lg);lg.connect(o.frequency);l.start(t+.15);l.stop(t+len+r*5);}
  n.connect(g);g.connect(dest);if(send){const sg=c.createGain();sg.gain.value=send;g.connect(sg);sg.connect(AU.rev);}
  env(g,t,a,v,d,sus,r,len);o.start(t);o.stop(t+len+r*6);
}
function inst(name,m,t,len,v,dest){const f=mtof(m);
  if(name==='pluck')voice(dest,{f,t,len:.05,type:'triangle',v,a:.004,d:.18,sus:.15,r:.25,cut:2600,send:.4});
  else if(name==='marimba'){voice(dest,{f,t,len:.04,type:'sine',v,a:.002,d:.15,sus:.1,r:.2,send:.3});voice(dest,{f:f*4,t,len:.02,type:'sine',v:v*.25,a:.001,d:.04,sus:0,r:.05});}
  else if(name==='bell'){voice(dest,{f,t,len:.05,type:'sine',v,a:.003,d:.6,sus:.25,r:1.1,send:.6});voice(dest,{f:f*2.76,t,len:.02,type:'sine',v:v*.3,a:.002,d:.25,sus:0,r:.3,send:.6});}
  else if(name==='flute')voice(dest,{f,t,len,type:'sine',v,a:.06,d:.3,sus:.75,r:.18,vib:.006,send:.45});
  else if(name==='ocarina'){voice(dest,{f,t,len,type:'triangle',v:v*.8,a:.04,d:.3,sus:.7,r:.16,cut:1800,vib:.005,send:.45});}
  else if(name==='bass')voice(dest,{f,t,len,type:'triangle',v,a:.01,d:.3,sus:.6,r:.12,cut:600});
  else if(name==='pad'){for(const d of[-7,7])voice(dest,{f,t,len:len-.4,type:'sawtooth',v:v*.45,a:1,d:1,sus:.85,r:.55,cut:700,q:.3,det:d,send:.6});voice(dest,{f:f/2,t,len:len-.4,type:'triangle',v:v*.6,a:1,d:1,sus:.85,r:.55,send:.35});}
}
function noiseBuf(){if(AU.nb)return AU.nb;const c=AU.ctx,b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return AU.nb=b;}
function noise(dest,{t,len,v=.1,type='bandpass',f=1000,f1=0,q=1,a=.005,r=.08,send=0}){
  const c=AU.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf();s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+len);fl.Q.value=q;
  s.connect(fl);fl.connect(g);g.connect(dest);if(send){const sg=c.createGain();sg.gain.value=send;g.connect(sg);sg.connect(AU.rev);}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(0,t+len,r);s.start(t,Math.random()*.5);s.stop(t+len+r*6);
}

/* ---------- the music engine ---------- */
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function scaleNote(T,deg){const sc=MODES[T.mode],o=Math.floor(deg/sc.length);return T.root+sc[((deg%sc.length)+sc.length)%sc.length]+12*o;}
function chordOf(T,deg){return[0,2,4,6].map(k=>scaleNote(T,deg+k));}
// a 2-bar motif built once per track, then repeated with small variations so the melody is recognisable
function motif(T){const R=rng(T.seed),out=[];let d=4+Math.floor(R()*3);
  for(let i=0;i<16;i++){const strong=i%4===0;if(R()<(strong?T.mel.dens+.25:T.mel.dens*.6)){d+=Math.round((R()-.5)*4);d=clamp(d,0,11);const len=R()<.4?2:R()<.7?1:3;out.push({i,d,len});i+=len-1;}}
  return out;}
function music(id,force){
  AU.want=id;if(!AU.ctx)return;if(!force&&AU.cur&&AU.cur.id===id)return;
  const c=AU.ctx,T=TRACKS[id];if(!T)return;
  // crossfade: the old track's bus fades out while the new one fades in
  if(AU.cur){const old=AU.cur.bus;old.gain.setTargetAtTime(0,c.currentTime,.9);setTimeout(()=>{try{old.disconnect();}catch(e){}},5000);}
  const bus=c.createGain();bus.gain.value=0;bus.connect(AU.mus);bus.gain.setTargetAtTime(1,c.currentTime+.2,1.2);
  AU.cur={id,T,bus,mot:motif(T),R:rng(T.seed*7+3)};AU.step=0;AU.nextT=c.currentTime+.15;
}
function musicStop(){AU.want=null;if(AU.cur&&AU.ctx){const old=AU.cur.bus;old.gain.setTargetAtTime(0,AU.ctx.currentTime,.6);setTimeout(()=>{try{old.disconnect();}catch(e){}},4000);}AU.cur=null;}
function auTick(){
  if(!AU.ctx||!AU.cur||AU.ctx.state!=='running')return;const c=AU.ctx;
  if(AU.nextT<c.currentTime-.5)AU.nextT=c.currentTime+.05;
  while(AU.nextT<c.currentTime+.3){musicStep(AU.cur,AU.step,AU.nextT);AU.nextT+=60/AU.cur.T.bpm/2;AU.step++;}
}
function musicStep(M,s,t){
  const T=M.T,R=M.R,bus=M.bus,e=60/T.bpm/2,stepsPerChord=T.bars*8,ci=Math.floor(s/stepsPerChord)%T.prog.length,inC=s%stepsPerChord,ch=chordOf(T,T.prog[ci]);
  // pad: a long chord at each change (an octave below the melody)
  if(inC===0)for(const m of ch.slice(0,3))inst('pad',m-12,t,stepsPerChord*e,T.pad,bus);
  // bass
  const bp=T.bass.pat==='pulse'?[0,3,4,6]:[0,4];if(bp.includes(s%8))inst('bass',ch[0]-24+(s%8===6?7:0),t,e*(T.bass.pat==='pulse'?1.6:3.5),T.bass.v,bus);
  // arpeggio
  const ev=T.arp.every||1;if(s%ev===0){const k=T.arp.pat[(s/ev)%T.arp.pat.length],m=ch[k%4]+(k>=4?12:0);if(R()<.92)inst(T.arp.inst,m,t,e,T.arp.v*(s%8===0?1.2:1),bus);}
  // melody: the motif plays in a 16-bar cycle (A A' B A), resting for the first phrase of each loop so the track breathes
  const ph=Math.floor(s/16)%8,pos=s%16;if(ph>=2){const var_=ph===5?2:ph===4||ph===7?1:0;
    for(const n of M.mot)if(n.i===pos){let d=n.d+(var_===2?2:0);if(var_===1&&R()<.4)d+=R()<.5?1:-1;let m=scaleNote(T,d)+12;
      // strong beats lean towards chord tones
      if(pos%4===0){const near=ch.map(x=>x+12*Math.round((m-x)/12)).sort((a,b)=>Math.abs(a-m)-Math.abs(b-m))[0];m=near;}
      inst(T.mel.inst,m,t,n.len*e*.95,T.mel.v,bus);}}
  // light percussion
  if(T.perc){if(T.perc.k==='shaker'&&s%2===1)noise(bus,{t,len:.03,v:T.perc.v*(s%4===3?1.3:.8),type:'highpass',f:6000,r:.03});
    if(T.perc.k==='tom'&&(s%8===0||s%8===5))voice(bus,{f:110,glide:55,t,len:.18,type:'sine',v:T.perc.v*4,a:.003,d:.1,sus:.2,r:.1});}
}
// which track to play right now
function musicForRun(){if(!run)return'title';if(floorKind(run.floor)==='boss')return'guardian';
  const a=actOf(),L=ACT_TRACKS[a%ACT_TRACKS.length],i=Math.min(L.length-1,Math.floor((run.floor-1)/5));return L[(i+(a>=ACT_TRACKS.length?a:0))%L.length];}

/* ---------- sound effects ---------- */
// rate limit so a busy battle doesn't turn into noise
function sfxGate(k,gap){const t=performance.now();if((AU.last[k]||0)>t-gap)return false;AU.burst=AU.burst.filter(x=>x>t-120);if(AU.burst.length>=7)return false;AU.last[k]=t;AU.burst.push(t);return true;}
const SFXT=()=>AU.ctx.currentTime+.005;
const MOVE_SFX={
  Normal:t=>{voice(AU.sfx,{f:520,glide:260,t,len:.08,type:'triangle',v:.12,a:.003,d:.06,sus:.2,r:.05});noise(AU.sfx,{t,len:.05,v:.08,f:1800,q:.8});},
  Fire:t=>{noise(AU.sfx,{t,len:.35,v:.14,type:'bandpass',f:500,f1:2400,q:.7,a:.03,r:.15,send:.2});voice(AU.sfx,{f:180,glide:90,t,len:.3,type:'sawtooth',v:.04,cut:700});},
  Water:t=>{for(let i=0;i<4;i++)voice(AU.sfx,{f:400+i*90,glide:900+i*140,t:t+i*.045,len:.07,type:'sine',v:.07,a:.004,d:.05,sus:.3,r:.05,send:.3});},
  Electric:t=>{for(let i=0;i<5;i++)voice(AU.sfx,{f:900+Math.random()*900,t:t+i*.025,len:.025,type:'square',v:.035,a:.001,d:.02,sus:.4,r:.02,cut:4000});noise(AU.sfx,{t,len:.12,v:.05,type:'highpass',f:3000});},
  Grass:t=>{noise(AU.sfx,{t,len:.2,v:.08,type:'bandpass',f:2400,f1:900,q:1.2,a:.02});voice(AU.sfx,{f:1320,t:t+.08,len:.05,type:'sine',v:.05,a:.003,d:.2,sus:.1,r:.3,send:.5});},
  Ice:t=>{for(const[k,f]of[[0,1760],[1,2350],[2,2960]])voice(AU.sfx,{f,t:t+k*.05,len:.03,type:'sine',v:.05,a:.002,d:.3,sus:.1,r:.4,send:.6});},
  Fighting:t=>{voice(AU.sfx,{f:160,glide:60,t,len:.12,type:'sine',v:.22,a:.002,d:.08,sus:.2,r:.06});noise(AU.sfx,{t,len:.04,v:.12,type:'lowpass',f:1500});},
  Poison:t=>{for(let i=0;i<3;i++)voice(AU.sfx,{f:220+Math.random()*120,glide:140,t:t+i*.07,len:.09,type:'sine',v:.08,a:.01,d:.06,sus:.3,r:.05,cut:900});},
  Ground:t=>{noise(AU.sfx,{t,len:.35,v:.18,type:'lowpass',f:300,f1:120,q:.5,a:.02,r:.15});voice(AU.sfx,{f:70,glide:45,t,len:.3,type:'sine',v:.15});},
  Flying:t=>{noise(AU.sfx,{t,len:.28,v:.09,type:'bandpass',f:600,f1:3200,q:2,a:.06,r:.1});},
  Psychic:t=>{voice(AU.sfx,{f:660,t,len:.35,type:'sine',v:.07,a:.05,d:.2,sus:.7,r:.2,vib:.04,send:.5});voice(AU.sfx,{f:990,t:t+.05,len:.3,type:'sine',v:.04,a:.05,d:.2,sus:.6,r:.2,vib:.05,send:.5});},
  Bug:t=>{voice(AU.sfx,{f:240,t,len:.18,type:'sawtooth',v:.04,a:.01,d:.1,sus:.8,r:.05,cut:1400,vib:.08});},
  Rock:t=>{for(let i=0;i<3;i++)noise(AU.sfx,{t:t+i*.05,len:.04,v:.12,type:'lowpass',f:900-i*150,q:1});voice(AU.sfx,{f:120,glide:70,t,len:.12,type:'triangle',v:.1});},
  Ghost:t=>{voice(AU.sfx,{f:520,glide:220,t,len:.45,type:'sine',v:.07,a:.08,d:.3,sus:.7,r:.25,vib:.03,send:.7});},
  Dragon:t=>{voice(AU.sfx,{f:110,glide:80,t,len:.35,type:'sawtooth',v:.07,a:.03,d:.2,sus:.7,r:.15,cut:800,q:4});noise(AU.sfx,{t,len:.3,v:.06,type:'bandpass',f:400,f1:200});},
  Dark:t=>{noise(AU.sfx,{t,len:.2,v:.1,type:'bandpass',f:1600,f1:300,q:1.5,a:.02});voice(AU.sfx,{f:200,glide:120,t,len:.15,type:'triangle',v:.06});},
  Steel:t=>{voice(AU.sfx,{f:880,t,len:.03,type:'square',v:.04,a:.001,d:.15,sus:.1,r:.3,cut:3000});voice(AU.sfx,{f:1235,t,len:.03,type:'sine',v:.06,a:.001,d:.25,sus:.1,r:.4,send:.4});},
  Fairy:t=>{[1568,1976,2349,3136].forEach((f,i)=>voice(AU.sfx,{f,t:t+i*.04,len:.03,type:'sine',v:.045,a:.002,d:.2,sus:.1,r:.3,send:.6}));},
};
const UI_SFX={
  buy:t=>{voice(AU.sfx,{f:988,t,len:.05,type:'square',v:.04,cut:3000});voice(AU.sfx,{f:1319,t:t+.06,len:.12,type:'square',v:.04,cut:3000});},
  sell:t=>{voice(AU.sfx,{f:1319,t,len:.05,type:'square',v:.035,cut:2600});voice(AU.sfx,{f:880,t:t+.06,len:.1,type:'square',v:.035,cut:2600});},
  reroll:t=>{for(let i=0;i<4;i++)voice(AU.sfx,{f:500+i*120,t:t+i*.03,len:.02,type:'triangle',v:.05});},
  level:t=>{[0,4,7,12].forEach((k,i)=>voice(AU.sfx,{f:mtof(72+k),t:t+i*.07,len:.07,type:'square',v:.035,cut:3500,send:.2}));},
  star:t=>{[0,7,12,16,19].forEach((k,i)=>voice(AU.sfx,{f:mtof(76+k),t:t+i*.05,len:.05,type:'sine',v:.06,a:.002,d:.2,sus:.2,r:.3,send:.5}));},
  evolve:t=>{for(let i=0;i<10;i++)voice(AU.sfx,{f:mtof(60+i*3),t:t+i*.06,len:.06,type:'triangle',v:.05,send:.5});voice(AU.sfx,{f:mtof(84),t:t+.65,len:.4,type:'sine',v:.07,a:.01,d:.4,sus:.5,r:.6,send:.7});},
  win:t=>{[[72,0],[76,.12],[79,.24],[84,.36]].forEach(([m,d])=>voice(AU.sfx,{f:mtof(m),t:t+d,len:d===.36?.5:.1,type:'square',v:.045,cut:3000,send:.3}));},
  lose:t=>{[[67,0],[63,.18],[60,.36]].forEach(([m,d])=>voice(AU.sfx,{f:mtof(m),t:t+d,len:.2,type:'triangle',v:.06,send:.3}));},
  chest:t=>{noise(AU.sfx,{t,len:.08,v:.06,type:'lowpass',f:800});[0,4,7,11,14].forEach((k,i)=>voice(AU.sfx,{f:mtof(79+k),t:t+.08+i*.04,len:.04,type:'sine',v:.05,a:.002,d:.2,sus:.2,r:.3,send:.6}));},
  pick:t=>{voice(AU.sfx,{f:mtof(84),t,len:.05,type:'sine',v:.06,send:.4});voice(AU.sfx,{f:mtof(91),t:t+.07,len:.12,type:'sine',v:.05,send:.4});},
  hit:t=>{voice(AU.sfx,{f:200,glide:90,t,len:.05,type:'triangle',v:.06,a:.002,d:.04,sus:.2,r:.03});},
  crit:t=>{voice(AU.sfx,{f:300,glide:120,t,len:.07,type:'square',v:.05,a:.002,d:.05,sus:.2,r:.04,cut:2000});noise(AU.sfx,{t,len:.05,v:.08,type:'highpass',f:2500});},
  faint:t=>{voice(AU.sfx,{f:600,glide:150,t,len:.35,type:'triangle',v:.07,a:.01,d:.2,sus:.6,r:.1});},
  lock:t=>{voice(AU.sfx,{f:1400,t,len:.02,type:'square',v:.03,cut:4000});noise(AU.sfx,{t:t+.03,len:.03,v:.05,type:'bandpass',f:2500,q:3});},
  coin:t=>{voice(AU.sfx,{f:1976,t,len:.04,type:'square',v:.025,cut:5000});voice(AU.sfx,{f:2637,t:t+.05,len:.1,type:'square',v:.025,cut:5000});},
};
function sfx(k,gap=40){if(!auOK()||!(OPTS.sfxVol??.6))return;const f=UI_SFX[k];if(!f||!sfxGate(k,gap))return;try{f(SFXT());}catch(e){}}
function sfxMove(type){if(!auOK()||!(OPTS.sfxVol??.6))return;const f=MOVE_SFX[type]||MOVE_SFX.Normal;if(!sfxGate('mv:'+type,70))return;try{f(SFXT());}catch(e){}}
