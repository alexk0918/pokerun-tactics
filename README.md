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

Each act guarantees a Kecleon Shop among the options on three floors, and there's a small chance of one on any other floor. Pokémon Centers are uncommon: at most two are offered per act, never on back-to-back floors, and they're a bit more likely when your HP is low. The floor track shows the paths you took, with "?" for floors still to choose.

### Events

Mystery paths draw one of 14 events, each at most once per run. Each choice shows its outcome after you pick it, and most events let you just leave:

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

25% of Kecleon are mutated (Shadow Kecleon, Golden Kecleon and so on). A mutated Kecleon is tinted and gives about 70% of its stock that mutator, including the Pokémon.

### Enhancers

Drag an enhancer onto a completed item, in your bag or on a Pokémon, to fuse them. Each item takes one, and enhanced items show a "+" and a teal frame. There's a single tier: every enhancer pairs a real stat package with an effect big enough to shape a build, sitting between The Last Flame's rare and legendary recipes. When an enhanced item is on a Pokémon, its tooltip shows the calculated numbers.

| Enhancer | Effect |
|---|---|
| Quick Powder | +25% Attack Speed, +3% more per attack (15 stacks); fully stacked attacks ricochet to a second enemy |
| Metal Coat | Defenses and damage reduction; a shield whenever a move hits it (3s cooldown) |
| Thick Club | +35% Attack, %-max-HP hits, every 5th attack stuns |
| Light Ball | Sp. Atk and PP; moves arc lightning to 2 more enemies for 25% |
| Lucky Punch | Crit chance and damage, moves can crit, crits restore PP |
| Big Root | Lifesteal and stronger heals; overhealing becomes a shield |
| Starf Berry | Below half HP: Attack Speed, lifesteal and Defense |
| Enigma Berry | At half HP: big heal and defenses for itself, a heal for adjacent allies |
| Deep Sea Tooth | Every 3rd attack deals true damage, growing permanently every time it triggers |
| Rare Bone | +20 Attack; takedowns heal and permanently add Attack and Sp. Atk to the bone |
| Soul Dew | PP, plus Sp. Atk that stacks every 4 seconds |
| Electric Seed | Every 3rd attack chains lightning to 3 enemies and paralyzes them |
| Black Sludge | Stacking Toxic poison; poisoned enemies heal less |
| Reaper Cloth | Moves curse: cursed enemies take more damage and explode when they faint |
| Smoke Ball | Dodges the first 3 attacks; each dodge restores PP and adds Attack Speed |
| Loaded Dice | Max-plus-one multi-hits with bonus damage; 25% double strikes |
| Ability Shield | Immune to stuns and status; restores PP whenever it shrugs off a stun |
| Red Card | +150 HP; at half HP, a big shield and an area stun |
| Adrenaline Orb | Attack Speed and damage as allies fall; takedowns restore PP |
| Room Service | At battle start, enemies within 2 hexes lose Attack Speed and defenses for 8s |
| Sacred Ash | Revives with full PP and bonus damage |

### Mutated Pokémon

Pokémon can carry a mutator too: from Kecleon Shops, the shadowy lab event, or enemies on later floors and Challenge paths. A mutated Pokémon glows in its mutator's color, keeps the mutator when it combines into a higher star, and gets the same bonus a mutated item would.

**Shadow** is a new mutator for both items and Pokémon: +15% damage, but the holder takes 6% more damage.

### Signature kits

Every Generation I line now has a hand-designed signature kit (all 78), and kits are being added generation by generation. Lines with a kit instead of the generic move, built around the Pokémon's design. Their shop cards show a red "Signature" tag, and the tooltip lists the role:

| Line | Role | Kit |
|---|---|---|
| Sobble → Inteleon | Sniper | Basic attacks hit the front; Snipe Shot aims at the farthest enemy, can't be dodged, ignores 30% Sp. Def |
| Chespin → Chesnaught | Knight | Spiky armor damages attackers (scales with Defense); Spiky Shield triples it, then Body Press scales with Defense |
| Fennekin → Delphox | Mage | Exploding fireballs that leave burning pillars and lower Sp. Atk |
| Froakie → Greninja | Assassin | Dashes behind the weakest enemy and throws shuriken; knockouts refund PP |
| Charcadet → Ceruledge | Cursed Knight | Bitter Blade lunges, cleaves and heals for 40% of damage (80% below half HP) |
| Charcadet → Armarouge | Cannon Knight | Lobs an arcing cannonball into the biggest group; recoil lowers its own defenses |
| Dreepy → Dragapult | Marksman | Fires Dreepy that arc in and spread across enemies; gains a dart every 4 casts for the whole run |
| Gulpin → Swalot | Devourer | Swallows the weakest enemy for true damage; each kill permanently adds max HP |
| Cubone → Marowak | Bone Collector | Bone damage stacks forever, +5 per knockout |
| Bagon → Salamence | Sky Dreamer | Bagon headbutts and flinches; Shelgon hardens its shell; Salamence flies out of reach, dives onto the biggest group, then goes into Outrage (splashing attacks) |
| Pichu → Raichu | Storm Chaser | Chain lightning across up to 6 enemies |
| Machop → Machamp | Brawler | Punch flurry ending in a stun; No Guard |
| Gastly → Gengar | Hexer | Shadow Balls shred Sp. Def; Cursed Body drains PP from attackers |
| Riolu → Lucario | Aura Fighter | Aura Sphere grows with missing HP; Justified stacks damage |
| Gible → Garchomp | Land Shark | Leaps onto the back line, area stun |
| Mareanie → Toxapex | Fortress | Baneful Bunker: immune for a moment and poisons attackers, then Regenerator |
| Happiny → Blissey | Nurse | Big heal and cleanse, then Wish heals the team |
| Grookey → Rillaboom | Drummer | Area hit with slow; Grassy Surge heals allies standing in it |
| Scorbunny → Cinderace | Striker | Pyro Ball bounces between enemies; Libero ramps Attack Speed |
| Charmander → Charizard | Fire Breather | Burning cone through the target |
| Bulbasaur → Venusaur | Solar Cannon | Charged beam through a whole line, instant in sun |
| Squirtle → Blastoise | Cannon Tank | Shell shield, then twin cannons with knockback |
| Ralts → Gardevoir | Seer | Future Sight marks the strongest enemies and strikes them 2s later |
| Pawniard → Kingambit | Leader | Cleaves the weakest nearby enemy; Kowtow Cleave can't miss and grows as allies fall |
| Munchlax → Snorlax | Glutton | Rests to heal when hurt, then Body Slams nearby enemies (scales with max HP) |
| Gimmighoul → Gholdengo | Treasure Keeper | Make It Rain hits harder the more Pokédollars you've saved and drops coins on knockouts |

Every kit tooltip shows its PP cost and range, and every damage, heal and shield number is calculated from the Pokémon's current stats.

### Set gear

Inspired by TFT's Faerie crown and Honkai: Star Rail's Day Demigod gear, some sets hand you an exclusive item the first time they activate on your field. Only that set's Pokémon can wear it (one set gear per Pokémon), and it gets stronger at the set's higher tier:

- **Partner Ribbon (Partner):** +20% damage and max HP; at 3, +35% and full PP at the start of battle.
- **Apex Fang (Pseudo):** the wearer becomes the Apex: +35% max HP, damage and Attack Speed; at 3 it turns Radiant (+60%).
- **Ancient Amber (Fossil):** revive with 50% HP, then +15% to all stats and an Ancient Power blast; at 3, 70% HP and +25%.
- **Champion Ribbon (Kanto mission):** earned by collecting all 8 Kanto Badges. +25% damage and max HP, +15% Attack Speed.

### Enhancers

Drag an enhancer onto a completed item, in your bag or on a Pokémon, to fuse them. Each item takes one, and enhanced items show a "+" and a teal frame. There's a single tier: every enhancer pairs a real stat package with an effect big enough to shape a build, sitting between The Last Flame's rare and legendary recipes. When an enhanced item is on a Pokémon, its tooltip shows the calculated numbers.

| Enhancer | Effect |
|---|---|
| Quick Powder | +25% Attack Speed, +3% more per attack (15 stacks); fully stacked attacks ricochet to a second enemy |
| Metal Coat | Defenses and damage reduction; a shield whenever a move hits it (3s cooldown) |
| Thick Club | +35% Attack, %-max-HP hits, every 5th attack stuns |
| Light Ball | Sp. Atk and PP; moves arc lightning to 2 more enemies for 25% |
| Lucky Punch | Crit chance and damage, moves can crit, crits restore PP |
| Big Root | Lifesteal and stronger heals; overhealing becomes a shield |
| Starf Berry | Below half HP: Attack Speed, lifesteal and Defense |
| Enigma Berry | At half HP: big heal and defenses for itself, a heal for adjacent allies |
| Deep Sea Tooth | Every 3rd attack deals true damage, growing permanently every time it triggers |
| Rare Bone | +20 Attack; takedowns heal and permanently add Attack and Sp. Atk to the bone |
| Soul Dew | PP, plus Sp. Atk that stacks every 4 seconds |
| Electric Seed | Every 3rd attack chains lightning to 3 enemies and paralyzes them |
| Black Sludge | Stacking Toxic poison; poisoned enemies heal less |
| Reaper Cloth | Moves curse: cursed enemies take more damage and explode when they faint |
| Smoke Ball | Dodges the first 3 attacks; each dodge restores PP and adds Attack Speed |
| Loaded Dice | Max-plus-one multi-hits with bonus damage; 25% double strikes |
| Ability Shield | Immune to stuns and status; restores PP whenever it shrugs off a stun |
| Red Card | +150 HP; at half HP, a big shield and an area stun |
| Adrenaline Orb | Attack Speed and damage as allies fall; takedowns restore PP |
| Room Service | At battle start, enemies within 2 hexes lose Attack Speed and defenses for 8s |
| Sacred Ash | Revives with full PP and bonus damage |

### Mutated Pokémon

Pokémon can carry a mutator too: from Kecleon Shops, the shadowy lab event, or enemies on later floors and Challenge paths. A mutated Pokémon glows in its mutator's color, keeps the mutator when it combines into a higher star, and gets the same bonus a mutated item would.

**Shadow** is a new mutator for both items and Pokémon: +15% damage, but the holder takes 6% more damage.

### Signature kits

Every Generation I line now has a hand-designed signature kit (all 78), and kits are being added generation by generation. Lines with a kit instead of the generic move, built around the Pokémon's design. Their shop cards show a red "Signature" tag, and the tooltip lists the role:

| Line | Role | Kit |
|---|---|---|
| Sobble → Inteleon | Sniper | Basic attacks hit the front; Snipe Shot aims at the farthest enemy, can't be dodged, ignores 30% Sp. Def |
| Chespin → Chesnaught | Knight | Spiky armor damages attackers (scales with Defense); Spiky Shield triples it, then Body Press scales with Defense |
| Fennekin → Delphox | Mage | Exploding fireballs that leave burning pillars and lower Sp. Atk |
| Froakie → Greninja | Assassin | Dashes behind the weakest enemy and throws shuriken; knockouts refund PP |
| Charcadet → Ceruledge | Cursed Knight | Bitter Blade lunges, cleaves and heals for 40% of damage (80% below half HP) |
| Charcadet → Armarouge | Cannon Knight | Lobs an arcing cannonball into the biggest group; recoil lowers its own defenses |
| Dreepy → Dragapult | Marksman | Fires Dreepy that arc in and spread across enemies; gains a dart every 4 casts for the whole run |
| Gulpin → Swalot | Devourer | Swallows the weakest enemy for true damage; each kill permanently adds max HP |
| Cubone → Marowak | Bone Collector | Bone damage stacks forever, +5 per knockout |
| Bagon → Salamence | Sky Dreamer | Bagon headbutts and flinches; Shelgon hardens its shell; Salamence flies out of reach, dives onto the biggest group, then goes into Outrage (splashing attacks) |
| Pichu → Raichu | Storm Chaser | Chain lightning across up to 6 enemies |
| Machop → Machamp | Brawler | Punch flurry ending in a stun; No Guard |
| Gastly → Gengar | Hexer | Shadow Balls shred Sp. Def; Cursed Body drains PP from attackers |
| Riolu → Lucario | Aura Fighter | Aura Sphere grows with missing HP; Justified stacks damage |
| Gible → Garchomp | Land Shark | Leaps onto the back line, area stun |
| Mareanie → Toxapex | Fortress | Baneful Bunker: immune for a moment and poisons attackers, then Regenerator |
| Happiny → Blissey | Nurse | Big heal and cleanse, then Wish heals the team |
| Grookey → Rillaboom | Drummer | Area hit with slow; Grassy Surge heals allies standing in it |
| Scorbunny → Cinderace | Striker | Pyro Ball bounces between enemies; Libero ramps Attack Speed |
| Charmander → Charizard | Fire Breather | Burning cone through the target |
| Bulbasaur → Venusaur | Solar Cannon | Charged beam through a whole line, instant in sun |
| Squirtle → Blastoise | Cannon Tank | Shell shield, then twin cannons with knockback |
| Ralts → Gardevoir | Seer | Future Sight marks the strongest enemies and strikes them 2s later |
| Pawniard → Kingambit | Leader | Cleaves the weakest nearby enemy; Kowtow Cleave can't miss and grows as allies fall |
| Munchlax → Snorlax | Glutton | Rests to heal when hurt, then Body Slams nearby enemies (scales with max HP) |
| Gimmighoul → Gholdengo | Treasure Keeper | Make It Rain hits harder the more Pokédollars you've saved and drops coins on knockouts |

Every kit tooltip shows its PP cost and range, and every damage, heal and shield number is calculated from the Pokémon's current stats.

### Earned special items

Some lines earn a unique item by taking part in fights. Each one exists once per run, takes a normal item slot and can't be crafted. Progress shows in the Pokémon's tooltip.

- **Leader's Crest:** after 8 takedowns by the Pawniard line. +15% damage, and adjacent allies gain move damage and Attack Speed. Kingambit gains +8% damage for each ally that faints.
- **Snack Stash:** after 6 battles fought by Munchlax or Snorlax. Regeneration, and every 5 seconds it heals your most injured ally.
- **Gold Bottle Cap:** after 6 wins with the Gimmighoul line. Hyper Training: Attack, Sp. Atk, both defenses and Attack Speed.

Values that grow over the run show their progress in the tooltip.

### Reading tooltips and damage

Scaling and damage are color coded:

- Orange: Attack and physical damage.
- Purple: Sp. Atk and special damage.
- White in battle (underlined in tooltips): true damage, which ignores Defense and Sp. Def.
- Green: HP and healing.
- Gold: Defense and Sp. Def.
- Yellow: Attack Speed.

While you drag a Pokémon, or hover one on the field, the hexes it can reach from that spot light up: blue on your side, red on the enemy side.

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

Every Pokémon belongs to several sets, and each set activates at its breakpoints (counting different Pokémon on the field). Hover a set to see its bonuses the TFT way. Breakpoints you've reached are green, and the value for your current tier is highlighted. Other tiers' values, and bonuses that unlock at higher counts, are greyed out.

**Type sets (2 / 4 / 6)** each change how the fight plays:

| Set | Mechanic |
|---|---|
| Normal (Adaptable) | Max HP and damage for every different type on your field |
| Fire (Kindling) | Attacks and moves burn; bonus damage to burning enemies |
| Water (High Tide) | A wave every 5s gives PP; at 6 it also damages every enemy |
| Grass (Photosynthesis) | Regeneration and bonus damage above 75% HP |
| Electric (Static) | Every 3rd attack zaps 3 enemies; at 6 the whole team gets Attack Speed |
| Ice (Frostbite) | Attacks chill; the third chill in a row freezes |
| Fighting (Challenger) | When their target falls they dash to the next one with an Attack Speed burst |
| Poison (Toxin) | Poison cuts healing; at 6 it spreads when a poisoned enemy faints |
| Ground (Earthquake) | Your sturdiest Ground Pokémon stomps every 8 / 6 / 4s, stunning nearby enemies |
| Flying (Tailwind) | Dodges grant stacking Attack Speed |
| Psychic (Mind Link) | Each Psychic move gives every other Psychic ally PP |
| Bug (Swarm) | At 4, a fallen Bug leaves a 1★ copy that keeps fighting; at 6, every one does |
| Rock (Stealth Rock) | Enemies take damage every time they move to a new hex |
| Ghost (Haunt) | Lifesteal; fainting Ghosts lash out at adjacent enemies |
| Dragon (Dragon's Hoard) | Every win with Dragon active adds a permanent damage stack for the run |
| Dark (Pursuit) | Bonus damage to weakened enemies; at 6 takedowns restore PP |
| Steel (Steelworker) | Damage reduction, burn and poison immunity, then reflection |
| Fairy (Charm) | Moves heal your most injured ally |

**Class sets (2 / 4 / 6):**

- Vanguards taunt adjacent enemies at 4.
- Juggernauts become unstoppable at 4.
- Bruisers heal once at half HP.
- Every 3rd Striker attack crits.
- Mystic moves cost less PP.
- Combo hits restore PP.
- Tricksters leap behind the enemy back line at the start of battle.
- Medic overhealing becomes shields at 4.

**Style sets** come from real abilities and lineage. Weather styles set the weather. Two styles grow with you:

- **Partner:** Friendship stacks up over the run, and at 10 the Pokémon hangs on through a fainting blow.
- **Pseudo:** your strongest pseudo-legendary becomes a bigger, stronger Apex; at 3, all of them do.

**Region sets (National Dex only, 2 / 4)** play like their games:

| Region | Mechanic |
|---|---|
| Kanto (Gym Challenge) | Each win earns a Badge (+2.5% damage each); all 8 unlock the Champion Ribbon |
| Johto (Day & Night) | Odd floors are Day (Attack Speed), even floors are Night (crit and damage) |
| Hoenn (Primal Weather) | Shields; at 4, calls sun or rain and gains Attack Speed in it |
| Sinnoh (Time & Space) | Defenses; at 4, enemies lose 40% Attack Speed for the first 4s |
| Unova (Ideals & Truth) | Physical-heavy fields get Attack Speed, special-heavy fields get PP |
| Kalos (Fairy Aura) | PP, and the first move each battle hits much harder |
| Alola (Totem Trial) | Regeneration; at 4, the strongest becomes a Totem with an Attack Speed aura |
| Galar (Power Spot) | HP and damage; at 4, the bulkiest grows giant for 8s |
| Paldea (Terastal Treasure) | Crit, Terastallize after the first move; at 4, +₽1 per win |

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
js/kits.js          kit building blocks, set gear and the first signature kits
js/kits_gen1.js     Generation I signature kits
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
