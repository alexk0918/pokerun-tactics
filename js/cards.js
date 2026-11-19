"use strict";
/* PokéRun Tactics — item, relic and augment cards (TFT-style).
   Icon, name and tier up top; stats as icon chips; the effect as one short paragraph with stat and type icons
   inline; recipes or components in a footer. The same parts make the compact hover tooltip. */

// every stat uses the item that raises it in the main games
const STAT_ICON={hp:'hp-up',atk:'protein',spa:'calcium',def:'iron',res:'zinc',as:'carbos',pp:'pp-up',crit:'dire-hit',ls:'shell-bell',regen:'big-root',dodge:'bright-powder',rng:'wide-lens',shield:'rusted-shield'};
const STAT_WORDS=[['Attack Speed','as'],['attack speed','as'],['Sp. Atk','spa'],['Sp. Def','res'],['Attack','atk'],['Defense','def'],['max HP','hp'],['crit chance','crit'],['PP','pp'],['lifesteal','ls'],['dodge','dodge'],['Dodge','dodge'],['range','rng'],['Range','rng'],['shield','shield'],['Shield','shield']];
const TYPE_LIST=['Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
const statImg=k=>`<img class="ii" src="${iconOf(STAT_ICON[k])}" alt="">`;
const typeImg=t=>`<img class="ti" src="assets/types/${t.toLowerCase()}.png" alt="">`;
const STAT_RE=new RegExp('\\b('+STAT_WORDS.map(w=>w[0].replace('.','\\.')).join('|')+')(?![\\w-])','g');
const TYPE_RE=new RegExp('\\b('+TYPE_LIST.join('|')+')\\b(?![-\\w])','g');
const STAT_OF=Object.fromEntries(STAT_WORDS);
// add stat and type icons to effect text (text only, never inside a tag); each stat or type once per card
function iconize(html){if(!html)return'';const seen=new Set();
  return html.split(/(<[^>]*>)/).map((part,i)=>{if(i%2)return part;
    return part.replace(STAT_RE,w=>{const k=STAT_OF[w];if(seen.has(k))return w;seen.add(k);return statImg(k)+w;})
      .replace(TYPE_RE,t=>{if(seen.has(t))return t;seen.add(t);return typeImg(t)+t;});}).join('');}

// a component's stat as a chip: "+10% Attack" with the Protein icon
const COMP_STAT={P:'atk',C:'spa',S:'as',I:'def',Z:'res',H:'hp',U:'pp',D:'crit'};
const statChip=(k,txt)=>`<span class="ichip">${statImg(k)}${txt}</span>`;
const compChip=o=>statChip(COMP_STAT[o],COMP[o].d.replace(' starting',''));

const TIER_COL={common:'#9aa3ad',epic:'#e0a526',use:'#4d9a3a',relic:'#8b5cf6',enh:'#2fb8a0',gear:'#e05a9a',badge:'#c9961d',spc:'#d68a1d',gim:'#3d79d6',formi:'#c0392b',silver:'#a9b4bf',gold:'#e0a526',prismatic:'#c86bff'};
function tierLabel(it,t){if(t==='relic')return'Relic';if(isBadge(it))return'Guild Badge';
  return t==='gear'?'Set gear':t==='spc'?'Special item':t==='enh'?'Enhancer':t==='common'?'Component':t==='epic'?(it.enh?'Enhanced item':'Completed'):t==='gim'?(GIMMICKS[gimOfItem(it)]||{n:'Gimmick item'}).n:t==='formi'?'Form item':'Consumable';}

// extra lines an item can carry: enhancer and mutations
function itemExtras(it){const out=[];
  if(it.enh&&ENH[it.enh])out.push(`<p class="enhl"><b>${ENH[it.enh].n}:</b> ${enhText(it.enh,null,it)}</p>`);
  for(const m of it.mut||[])out.push(`<p class="mut"><b>${MUTS[m].n}:</b> ${MUTS[m].d}${m==='growing'&&it.gs?` (now +${pct(it.gs)})`:''}.</p>`);
  return out.join('');}

/* the parts of a card: {t, col, id, name, label, chips, desc, rec, foot} */
function cardParts(it){
  if(isRelicId(it)){const R=RELICS[it];return{t:'relic',col:TIER_COL.relic,id:it,name:R.n,label:'Relic',chips:'',desc:iconize(`<p>${R.d}</p>`),rec:'',foot:''};}
  const t=itemTier(it),D0=itemDef(it),col=isBadge(it)?TIER_COL.badge:(TIER_COL[t]||TIER_COL.use);
  const P={t:isBadge(it)?'badge':t,col,id:D0.id,name:itemName(it),label:tierLabel(it,t),chips:'',desc:'',rec:'',foot:''};
  if(isComp(it)){P.chips=compChip(it.k);
    P.rec=`<div class="irec">${CORDER.split('').map(o=>{const c=CRAFT[recipeKey(it.k,o)];return`<div data-craft="${recipeKey(it.k,o)}" title="${esc(COMP[o].n)} → ${esc(c.n)}"><img src="${iconOf(COMP[o].id)}" alt="${esc(COMP[o].n)}">→<img src="${iconOf(c.id)}" alt="${esc(c.n)}"></div>`;}).join('')}</div>`;
    P.foot=`<div class="ifoot">Builds into 8 items · hover a recipe for details</div>`;
    P.desc=itemExtras(it);}
  else if(isCraft(it)){const [a,b]=it.k.split('');P.chips=a===b?statChip(COMP_STAT[a],doubleStat(a)):compChip(a)+compChip(b);
    P.desc=iconize(`<p>${CRAFT[it.k].d}</p>`+itemExtras(it));
    P.foot=`<div class="ifoot"><img src="${iconOf(COMP[a].id)}" alt="">+<img src="${iconOf(COMP[b].id)}" alt=""> ${esc(COMP[a].n)} + ${esc(COMP[b].n)}</div>`;}
  else if(isEnh(it)){P.desc=iconize(`<p>${D0.d}</p>`+itemExtras(it));P.foot=`<div class="ifoot">Drop on a completed item · one per item</div>`;}
  else{P.desc=iconize(`<p>${D0.d}</p>`+itemExtras(it));}
  return P;}
// two of the same component: show the summed stat ("+20% Attack")
function doubleStat(o){return COMP[o].d.replace(/(\d+)/,n=>String(+n*2)).replace(' starting','');}

const cardHead=(P,big)=>`<div class="iband"></div><div class="ihead"><div class="iico"><img src="${iconOf(P.id)}" alt=""></div><div class="inm"><h2>${esc(P.name)}</h2><div class="itier">${P.label}</div></div></div>`;
// a pick card (loot, relics, enhancers, shop)
function cardHtml(it,i,cls=''){const P=cardParts(it);
  return`<button class="pick icard p-${P.t} ${cls}" data-i="${i}" style="--tc:${P.col}">${cardHead(P)}${P.chips?`<div class="ichips">${P.chips}</div>`:''}${P.desc?`<div class="idesc">${P.desc}</div>`:''}${P.rec}${P.foot}</button>`;}
// the compact hover tooltip
function cardTip(it,head,hint){const P=cardParts(it);
  return`${head?`<div class="ihint top">${head}</div>`:''}<div class="icard tipcard p-${P.t}" style="--tc:${P.col}">${cardHead(P)}${P.chips?`<div class="ichips">${P.chips}</div>`:''}${P.desc?`<div class="idesc">${P.desc}</div>`:''}${P.rec}${hint?`<div class="ifoot">${hint}</div>`:P.foot}</div>`;}

/* augment cards: same layout, tier frame (prismatic shimmers), a tag chip */
function augCardHtml(a,tier,i,O){
  return`<div class="acard" data-i="${i}"><button class="augpick icard ${tier==='prismatic'?'prism':''} p-${tier}" data-pick="${i}" style="--tc:${TIER_COL[tier]||TIER_COL.silver}">
    <div class="iband"></div><div class="ihead"><div class="iico"><img src="${iconOf(a.icon)}" alt=""></div><div class="inm"><h2>${esc(a.name)}</h2><div class="itier">${tier} augment</div></div></div>
    <div class="ichips"><span class="itag t-${a.tag}">${AUGTAG[a.tag]}${a.set?' · '+esc(a.set):''}</span></div><div class="idesc"><p>${iconize(a.d)}</p></div></button>
    <button class="btn sm augrr" data-rr="${i}" ${O.rr[i]?'disabled':''}>${O.rr[i]?'Rerolled':'Reroll'}</button></div>`;}
