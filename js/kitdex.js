/* PokéRun Tactics: in-game Kit Dex. Lines are discovered by owning any member (saved across runs).
   Starters, Pikachu and Eevee lines are always known. */
const DEXKEY='pokerun.kitdex';
let DEXSEEN=new Set();
try{DEXSEEN=new Set(JSON.parse(localStorage.getItem(DEXKEY)||'[]'));}catch(e){}
let DEXMODE=null;
const dexMode=()=>DEXMODE||(DEXMODE=buildMode('nat'));
const ALWAYS_KNOWN=()=>[...STARTERS.flat(),25,133];
function dexLineOf(dex){const M=dexMode();return M.roots.find(r=>M.lines[r].mem.includes(dex));}
function dexKnown(root){if(DEXSEEN.has(root))return true;const mem=dexMode().lines[root].mem;return ALWAYS_KNOWN().some(d=>mem.includes(d));}
// called from renderUI: anything you own gets discovered
function dexLearnOwned(){if(!run||SIM.on)return;let added=0;
  for(const u of allOwned()){const r=dexLineOf(FORMS&&FORMS[u.dex]?FORMS[u.dex].base:u.dex);if(r&&!DEXSEEN.has(r)){DEXSEEN.add(r);added++;if(!SIM.on)toast(`New Kit Dex entry: ${D[r].n} line`);}}
  if(added)try{localStorage.setItem(DEXKEY,JSON.stringify([...DEXSEEN]));}catch(e){}}
// kit text for one species, computed at 2★ with no items in a neutral National Dex context
function dexStage(d,root){const saved=MODE;MODE=dexMode();try{const u=mkUnit(root);u.star=2;u.dex=d;const c=makeCombatant(u,1,3,5,{},1);const K=kitOf(d);
  return{d,n:D[d].n,move:K.sig?K.mv.n:moveName(d),role:K.role||K.cls,cls:K.cls,pp:c.maxMana,range:c.range,type:K.mv.t,desc:K.sig?K.sig.d(c,K.si):moveDesc(c)};}catch(e){return{d,n:D[d].n,move:'?',role:'',cls:'',pp:0,range:0,type:'',desc:''};}finally{MODE=saved;}}
let dexGen=1,dexQ='',dexFrom=null;
function showKitDex(from){
  dexFrom=from||(run?'game':'title');hideTip();
  if(dexFrom==='title')mode='dex';
  const M=dexMode(),gens=[1,2,3,4,5,6,7,8,9];
  const roots=M.roots.filter(r=>M.lines[r].region+1===dexGen);
  const known=M.roots.filter(dexKnown).length;
  const q=dexQ.toLowerCase();
  const rows=roots.filter(r=>!q||(dexKnown(r)&&M.lines[r].mem.some(d=>D[d].n.toLowerCase().includes(q))));
  ov.innerHTML=`<div class="scrim"></div><div class="screen dexscreen"><div class="win dexwin">
    <div class="dexhead"><div><h2>Kit Dex</h2><div class="lbl">${known} / ${M.roots.length} lines discovered · numbers at 2★ with no items</div></div>
      <input class="dexfind" id="dexfind" type="search" placeholder="Find a Pokémon" value="${esc(dexQ)}" aria-label="Find a Pokémon"><button class="btn" id="dexclose">Close</button></div>
    <div class="dextabs">${gens.map(g=>{const rs=M.roots.filter(r=>M.lines[r].region+1===g);return`<button class="dextab" data-g="${g}" aria-pressed="${g===dexGen}">Gen ${ROMAN[g-1]} <small>${rs.filter(dexKnown).length}/${rs.length}</small></button>`;}).join('')}</div>
    <div class="dexlist" id="dexlist">${rows.map(r=>{const L=M.lines[r],ok=dexKnown(r);
      if(!ok)return`<div class="dexent unknown"><div class="dexpor">${L.mem.slice(0,3).map(d=>`<img src="${por(d)}" alt="">`).join('')}</div><div><div class="dexname">???</div><div class="sc">Buy this Pokémon to discover its kit.</div></div></div>`;
      const st=L.mem.map(d=>dexStage(d,r));const top=st.filter(s=>sigOf(s.d)).pop()||st[st.length-1];
      return`<div class="dexent"><div class="dexpor">${L.mem.slice(0,4).map(d=>`<img src="${por(d)}" alt="${esc(D[d].n)}">`).join('')}</div><div class="dexbody">
        <div class="dexname">${L.mem.map(d=>esc(D[d].n)).join(' → ')} <span class="chip" style="background:#c9961d">₽${L.cost}</span> <span class="sigrole">${esc(top.role)}</span></div>
        <p class="dexmv"><b>${esc(top.move)}</b> <span class="sc">${esc(top.n)} · ${top.type} · ${top.pp} PP · range ${top.range}</span></p><div class="dexdesc">${top.desc}</div>
        ${st.length>1?`<details><summary>Other stages</summary>${st.filter(s=>s!==top).map(s=>`<p class="dexmv"><b>${esc(s.move)}</b> <span class="sc">${esc(s.n)} · ${s.pp} PP · range ${s.range}</span></p><div class="dexdesc">${s.desc}</div>`).join('')}</details>`:''}</div></div>`;}).join('')||'<p class="sc">Nothing matches.</p>'}</div></div></div>`;
  ov.querySelectorAll('.dextab').forEach(b=>b.onclick=()=>{dexGen=+b.dataset.g;showKitDex(dexFrom);});
  const f=$('dexfind');f.oninput=()=>{dexQ=f.value;const pos=f.selectionStart;showKitDex(dexFrom);const g=$('dexfind');g.focus();g.setSelectionRange(pos,pos);};
  $('dexclose').onclick=closeKitDex;
}
function closeKitDex(){if(dexFrom==='title')showTitle();else ov.innerHTML='';}
