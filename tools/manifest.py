#!/usr/bin/env python3
"""Builds asset-manifest.json: every file the game can load, with a short content hash.
The game downloads this list to cache everything for offline play, and re-downloads only files whose hash changed.
Run it after adding or changing assets:  python3 tools/manifest.py"""
import os,json,hashlib
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def h(p):
  with open(p,'rb') as f:return hashlib.sha1(f.read()).hexdigest()[:8]
core=[];dex={};music=[];size=0
for d,_,fs in os.walk(os.path.join(ROOT,'assets')):
  for f in fs:
    p=os.path.join(d,f);rel=os.path.relpath(p,ROOT).replace(os.sep,'/');s=os.path.getsize(p);size+=s
    e=[rel,s,h(p)];parts=rel.split('/')
    if parts[1].isdigit():dex.setdefault(str(int(parts[1])),[]).append(e)
    elif parts[1]=='music':music.append(e)
    else:core.append(e)
for f in sorted(os.listdir(os.path.join(ROOT,'data'))):
  p=os.path.join(ROOT,'data',f);core.append(['data/'+f,os.path.getsize(p),h(p)])
for f in ['icon-192.png','icon-512.png','icon-maskable-192.png','icon-maskable-512.png','manifest.webmanifest']:
  p=os.path.join(ROOT,f)
  if os.path.exists(p):core.append([f,os.path.getsize(p),h(p)])
# the substitute Pokémon shown when a sprite can't load is always part of the core download
core+=dex.get('132',[])
out={'v':hashlib.sha1(json.dumps([core,dex,music]).encode()).hexdigest()[:10],'bytes':size,'core':core,'music':music,'dex':dex}
json.dump(out,open(os.path.join(ROOT,'asset-manifest.json'),'w'),separators=(',',':'))
cb=sum(x[1] for x in core);print(f"{len(core)} core files ({cb/1e6:.1f} MB), {sum(len(v) for v in dex.values())} sprite files in {len(dex)} folders, {len(music)} music, total {size/1e6:.0f} MB")
