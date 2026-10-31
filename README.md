# PokéRun Tactics

A Pokémon autobattler roguelike in the style of TFT, The Last Flame and Guildrun, played on a hex board with Pokémon Mystery Dungeon sprites.

**Play:** https://alexk0918.github.io/pokerun-tactics/

## Modes

- **Gen I–IX:** each region uses the Pokémon introduced in that generation, plus older relatives that gained new evolutions there (Gen II includes Pichu → Pikachu → Raichu, Gen IV includes Eevee's eight evolutions).
- **National Dex:** all 1,025 Pokémon across 541 evolution lines, with region bonuses on top of type bonuses.

## How a run works

- Pick a region, then a team strategy (Ember Gambit, Tidal Fortress or Verdant Investment).
- Act I has 15 floors: wild Pokémon on floors 1–2, rivals on floors 5 and 10, a legendary boss on floor 15, and a route choice for every other floor (see below).
- On floor 2 you pick an augment. The tier rolls Silver (25%), Gold (50%) or Prismatic (25%).
- The shop sells the first stage of each evolution line, priced ₽1–₽5 (₽5 is legendaries and mythicals). Three copies combine into the next star level and evolve; branching lines let you choose the evolution. National Dex runs draw a 100-line pool from all 541 so copies are findable.

### Routes

After each floor you choose where to go next from two or three paths. One is usually a regular battle and another a harder option with better rewards:

| Path | What happens | Reward |
|---|---|---|
| Trainer Battle | A regular battle | Chest |
| Challenge | One extra enemy, stronger stats, some mutated enemies | Better chest (4 choices, more completed items) and +₽3 |
| Alpha Pokémon | A huge Alpha Pokémon (2.8× HP, +30% damage) with escorts | Enhancer pick, rich chest, 25% chance of a relic |
| Endurance | Wild waves arrive every 7 seconds and whenever the field is cleared. Survive 15s to win | +₽2 / ₽4 / ₽7 and better loot at 15 / 25 / 40 seconds |
| Time Attack | Knock out a giant target within 40 seconds; its guards don't count | +₽2 / ₽4 / ₽7 and better loot under 40 / 25 / 15 seconds |
| Mystery | A random event (below) | Varies |
| Pokémon Center | No battle: rest (25% HP), train (+6 XP) or take two consumables | |
| Kecleon Shop | Buy Pokémon, components, completed items, enhancers, relics and consumables | |

Each act guarantees a Kecleon Shop among the options on three floors, and there's a small chance of one on any other floor. When your HP is low, a Pokémon Center is more likely to appear. The floor track shows the paths you took, with "?" for floors still to choose.

### Events

Mystery paths draw one of 14 events, each at most once per run. Each offers choices with different risks:

- **A Snorlax blocks the path:** sneak around it, leave it a berry, or wake it up and fight it as an Alpha.
- **A Mysterious Egg:** hatch it into a ₽3–4 Pokémon, or return it.
- **A Berry Tree:** pick berries, shake it, or take a cutting.
- **A traveling trader:** trade up your cheapest 1★ Pokémon.
- **The Move Tutor:** pay for a stat boost on one Pokémon or the whole team.
- **The Day Care:** pay to raise a 1★ Pokémon to 2★.
- **Game Corner:** gamble Pokédollars.
- **Unown Ruins:** trade HP for an enhancer or a relic.
- **A forest shrine:** bless a Pokémon's items or heal.
- **Team Rocket ambush:** fight a Challenge battle for bonus money, pay them off, or run.
- **A fossil lab:** revive a fossil Pokémon or sell the fossil.
- **A hidden grotto:** pick one of three Poké Balls.
- **A shadowy lab:** turn a Pokémon Shadow, or take a Shadow component.
- **A glowing stone:** dig up an item for your generation gimmick.

### Kecleon Shops

The stock: two Pokémon, two components, one completed item, two enhancers, a relic and a consumable. Prices are ₽cost+2 for Pokémon, ₽4 for components, ₽9 for completed items, ₽7 for enhancers, ₽12 for relics and ₽3 for consumables, plus ₽2 for anything mutated.

35% of Kecleon are mutated (Shadow Kecleon, Golden Kecleon and so on). A mutated Kecleon is tinted and gives about 70% of its stock that mutator, including the Pokémon.

### Enhancers

Enhancers work like The Last Flame's recipes. Drop one onto a completed item, either in your bag or on a Pokémon, to add an effect. Each item takes one, and enhanced items show a "+" and a teal frame. There are 20 enhancers:

- **Stat boosts:** Quick Powder, Metal Coat, Thick Club, Light Ball, Lucky Punch, Soul Dew, Big Root, Starf Berry.
- **On-hit effects:** Black Sludge (poison), Electric Seed (paralysis), Spell Tag (bonus damage to weakened enemies).
- **Passives:** Smoke Ball, Loaded Dice, Ability Shield.
- **Triggered effects:** Red Card (shield at half HP), Adrenaline Orb (speed when an ally faints), Room Service (slows nearby enemies at the start of battle), Sacred Ash (revive), Rare Bone (heals and grows on knockouts), Enigma Berry (heal at half HP).

Enhancers come from Alpha Pokémon, rivals, Kecleon Shops and some events.

### Mutated Pokémon

Pokémon can carry a mutator too: from Kecleon Shops, the shadowy lab event, or enemies on later floors and Challenge paths. A mutated Pokémon glows in its mutator's color, keeps the mutator when it combines into a higher star, and gets the same bonus a mutated item would.

**Shadow** is a new mutator for both items and Pokémon: +15% damage, but the holder takes 6% more damage.

### Economy

- Income each floor: ₽5 base, +₽1 per ₽10 saved (max ₽5), and win or loss streak gold. +₽1 per win.
- Trainer level sets how many Pokémon you can field and the shop odds. You gain 2 XP per floor and can buy 4 XP for ₽4.
- Shortcuts: D rerolls, F buys XP, Space starts the battle or opens the chest.

### Items

- A chest appears after every battle. Open it and pick one of three items, or skip for ₽2.
- Items work like TFT: 8 components (Protein, Calcium, Carbos, Iron, Zinc, HP Up, PP Up, Dire Hit) combine into 36 completed items. Put two components on the same Pokémon, or drop one on another in your bag. Each Pokémon holds up to 3 items, and selling it returns them to the bag.
- Items can roll mutators (Shiny, Blazing, Vampiric, Swift, Sturdy, Charged, Lucky, Golden, Growing, Thorny, Blessed, Shadow) that carry over when components combine.
- Consumables: Rare Candy (copy a Pokémon), Potion, Nugget, Honey.

### Relics

Beating a rival (floors 5 and 10) lets you pick one of three relics, then one of three enhancers. Relics are team-wide effects such as Exp. Share, Coin Case, Dowsing Machine or Poké Flute. Alpha Pokémon have a 25% chance to drop a relic, and Kecleon Shops sell them.

### Sets

Every Pokémon belongs to several sets, and each set activates at its breakpoints (counting different Pokémon on the field):

- **Types (18):** from the Pokémon's current types. Breakpoints 2 / 4 / 6.
- **Classes (9):** what its kit does: Vanguard, Juggernaut, Bruiser, Striker, Mystic, Artillery, Combo, Trickster, Medic. Breakpoints 2 / 4 / 6.
- **Styles (17):** how it plays, taken from its real abilities and lineage: Sun, Rain, Sandstorm, Snow, Intimidator, Last Stand, Momentum, Ironclad, Toxic, Powerhouse, Sharpshooter, Regrowth, Phantom, Charged, Partner (starters, Pikachu, Eevee), Fossil and Pseudo. Weather styles change the battlefield.
- **Regions (9):** National Dex only.

### Scouting

Once you've invested in a set (3+ different lines and ₽8+ worth of units, from floor 4), shop slots have a chance to show Pokémon from your two most-invested sets. The chance grows with investment and with every shop that misses. Scouted cards are tagged in the shop.

### Kits: real moves and abilities

- Every Pokémon uses a real move from its level-up learnset. Moves keep their real behavior: multi-hit, spread damage, drain, recoil, status (burn, poison, paralysis, sleep, freeze, confusion), flinch, stat changes, high crit and priority.
- Lines that keep a type through evolution power up their move as they evolve, with moves that play the same way (Squirtle Water Gun → Wartortle Water Pulse → Blastoise Hydro Pump; Charmander Ember → Flame Burst → Flamethrower; Oddish Absorb → Gloom Mega Drain → Vileplume or Bellossom Giga Drain). About 730 Pokémon have a move line, shown in their tooltip. Level-up moves come first; TM or tutor moves fill a step only when needed.
- A line keeps one class from start to finish, decided by its final form (Squirtle and Wartortle are Vanguards like Blastoise).
- Physical moves scale with Attack and are reduced by Defense; special moves scale with Sp. Atk and are reduced by Sp. Def.
- Each Pokémon also gets its real ability as a passive (around 180 implemented), such as Intimidate, Static, Levitate, Multiscale, Speed Boost, Drought or Regenerator.
- Some Pokémon have no active move: Juggernauts (Snorlax, Wailord) are pure HP tanks, and Strikers (fast physical attackers) fire their move as a free follow-up every third attack.
- Some lines grow permanently over a run, such as Magikarp, Abra, Mankey, Munchlax/Snorlax, Shuckle, Feebas, Pawniard, Honedge, Wishiwashi, Skwovet, Gimmighoul, Pichu/Pikachu and Eevee. Their shop card shows a "Grows" tag.

### Form changes

Form-change Pokémon transform the way they do in the games:

- **By ability:** Aegislash (Stance Change), Mimikyu (Disguise), Wishiwashi (Schooling), Darmanitan (Zen Mode), Minior (Shields Down), Meloetta (Relic Song), Palafin (Zero to Hero, permanent after its first battle), Morpeko (Hunger Switch), Castform (Forecast), Cherrim (Flower Gift), Eiscue (Ice Face), Zygarde (Power Construct), Terapagos (Tera Shift).
- **By held item** (drops from chests when you own the Pokémon): Red Orb and Blue Orb (Primal Groudon and Kyogre), Griseous Core, Adamant Crystal, Lustrous Globe, Rusted Sword and Shield, Gracidea, Prison Bottle, Reveal Glass and Ogerpon's masks.

### Generation gimmicks

On floor 4 of each act you choose one key item. The others become available in later acts.

- **Mega Bracelet (Gen VI):** Mega Stones drop only for Pokémon you own (96 Megas, including Legends: Z-A). Pick which Pokémon is your Mega; it Mega Evolves early in each battle with its real Mega stats and ability.
- **Z-Power Ring (Gen VII):** Z-Crystals let a Pokémon with a matching move type turn its first move each battle into a Z-Move.
- **Dynamax Band (Gen VIII):** Max Mushrooms raise a Pokémon's Dynamax Level (up to 10). Your Dynamax pick grows huge for 10 seconds with Max Moves that change the battlefield. Pokémon with a Gigantamax form unlock it at 3 mushrooms and use their G-Max Move.
- **Tera Orb (Gen IX):** Tera Shards work like emblems: the holder counts as that type for sets. Your Tera pick Terastallizes each battle, counting twice toward its Tera type.

Rivals and the boss use a gimmick of their own.

Forms that don't have a PMD sprite yet use the base Pokémon's sprite tinted toward the form's colors, plus a badge: a Key Stone over Megas, a red cloud crown for Gigantamax, a gold crown for Crowned forms and wind swirls for Therian forms. Pokémon with no PMD sprite at all appear as round portrait tokens with a type-colored ring. Re-running the asset scripts picks up new SpriteCollab sprites automatically.

### Saving

Runs save automatically in your browser. Continue from the main menu, which also has Options (battle speed, damage numbers, delete save) and Credits.

## Controller

Plays with any standard gamepad (Xbox-style layouts such as the AYN Thor) in a browser that supports the Gamepad API:

| Input | Action |
|---|---|
| Left stick | Move the cursor (right stick for fine adjustments) |
| D-pad | Snap to the next button, card, item or Pokémon |
| A | Select. Hold A to drag a Pokémon or item, release to drop |
| B | Back / cancel a drag |
| X | Reroll |
| Y | Level up |
| RB | Release the Pokémon under the cursor |
| Start | Continue or new game / battle / open chest |
| Select | Toggle battle speed |

## Project layout

```
index.html          markup and styles
js/data.js          balance tables: items, relics, augments, levels
js/sets.js          sets, ability passives, kit tuning
js/game.js          game logic
js/forms.js         form changes and generation gimmicks
js/route.js         route choices, events, Kecleon shops, enhancers, unit mutators
js/gamepad.js       controller support
data/pokedex.json   species, types, base stats, evolutions (from PokéAPI)
data/sprites.json   PMD animation metadata
data/kits.json      per-species move, heal/guard move and abilities (from PokéAPI)
data/forms.json     Mega, Gigantamax, battle and item forms (from PokéAPI)
assets/fonts/       Pokémon Emerald font built from pret/pokeemerald glyphs
assets/XXXX/        PMD sprites and portrait for National Dex #XXXX (form ids above 10000)
```

Run locally with any static server, for example `python3 -m http.server`, then open http://localhost:8000.

## Credits

Sprites and portraits are from the [PMD SpriteCollab](https://sprites.pmdcollab.org/) project and belong to their individual artists ([credits](https://github.com/PMDCollab/SpriteCollab)). Pokédex data and item sprites come from [PokéAPI](https://pokeapi.co/). The font is built from Pokémon Emerald's glyphs in the [pret/pokeemerald](https://github.com/pret/pokeemerald) decompilation.

This is a non-commercial fan project and is not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Pokémon is a trademark of Nintendo, Game Freak and Creatures.
