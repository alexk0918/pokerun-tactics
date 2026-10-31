# PokéRun Tactics

A Pokémon autobattler roguelike in the style of TFT, The Last Flame and Guildrun, played on a hex board with Pokémon Mystery Dungeon sprites.

**Play:** https://alexk0918.github.io/pokerun-tactics/

## Modes

- **Gen I–IX:** each region uses the Pokémon introduced in that generation, plus older relatives that gained new evolutions there (Gen II includes Pichu → Pikachu → Raichu, Gen IV includes Eevee's eight evolutions).
- **National Dex:** all 1,025 Pokémon across 541 evolution lines, with region bonuses on top of type bonuses.

## How a run works

- Pick a region, then a team strategy (Ember Gambit, Tidal Fortress or Verdant Investment).
- Act I has 15 floors: wild Pokémon on floors 1–3, trainers after that, rivals on floors 5 and 10, and a legendary boss on floor 15.
- On floor 2 you pick an augment. The tier rolls Silver (25%), Gold (50%) or Prismatic (25%).
- The shop sells the first stage of each evolution line, priced ₽1–₽5 (₽5 is legendaries and mythicals). Three copies combine into the next star level and evolve; branching lines let you choose the evolution.

## Placeholders

Moves, roles and trait numbers are generated from each species' base stats and types so every Pokémon is playable. They're meant to be replaced one by one with real designs. Items, relics, consumables and interest aren't implemented yet.

## Project layout

```
index.html          markup and styles
js/game.js          game logic
data/pokedex.json   species, types, base stats, evolutions (from PokéAPI)
data/sprites.json   PMD animation metadata
assets/XXXX/        PMD sprites and portrait for National Dex #XXXX
```

Run locally with any static server, for example `python3 -m http.server`, then open http://localhost:8000.

## Credits

Sprites and portraits are from the [PMD SpriteCollab](https://sprites.pmdcollab.org/) project and belong to their individual artists ([credits](https://github.com/PMDCollab/SpriteCollab)). Pokédex data comes from [PokéAPI](https://pokeapi.co/).

This is a non-commercial fan project and is not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Pokémon is a trademark of Nintendo, Game Freak and Creatures.
