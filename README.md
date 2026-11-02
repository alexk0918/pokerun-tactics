# PokéRun Tactics

A Pokémon autobattler roguelike in the style of TFT, The Last Flame and Guildrun, played on a hex board with Pokémon Mystery Dungeon sprites.

**Play:** https://alexk0918.github.io/pokerun-tactics/

## Modes

- **Gen I–IX:** each region uses the Pokémon introduced in that generation, plus older relatives that gained new evolutions there (Gen II includes Pichu → Pikachu → Raichu, Gen IV includes Eevee's eight evolutions).
- **National Dex:** all 1,025 Pokémon across 541 evolution lines, with region bonuses on top of type bonuses.

## How a run works

- Pick a region, then a team strategy (Ember Gambit, Tidal Fortress or Verdant Investment).
- A run has three acts of 15 floors each: wild Pokémon on floors 1–2, rivals on floors 5 and 10, a legendary guardian on floor 15, and a route choice for every other floor (see below). Your team, gold, items, relics and augments carry over between acts.

### Acts and Endless mode

| Act | Scenery | Enemy theme | Guardian |
|---|---|---|---|
| I · Verdant Clearing | Forest | Grass, Bug, Normal, Flying | Guardian of the Grove |
| II · Ember Canyon | Red-rock canyon | Fire, Ground, Rock, Fighting | Guardian of the Canyon |
| III · Tidepool Grotto | Sea cave | Water, Ice, Dark, Ghost | Guardian of the Grotto |

- About 70% of enemy Pokémon come from the act's theme types (drawn from every line in the mode, not just your shop pool), and trainers are themed too (Hikers and Firebreathers in the canyon, Swimmers and Hex Maniacs in the grotto). The guardian is a legendary of the act's theme when the mode has one, and never one you've already beaten.
- Each act hits harder: more enemies per team, more 2★ and 3★ Pokémon, more items, enemies rolling up to ₽5 shops, and tougher guardians.
- Beating a guardian clears the act: your trainer heals to full HP, you can take a relic, and the next act starts with its own carousel. Each act also lets you switch your generation gimmick on floor 4 (or keep the one you have).
- Beat Act III's guardian to become Champion, then choose **Enter Endless mode** to keep going. Endless builds new acts forever (Thunder Plains, Haunted Ruins, Sky Pillar, Frozen Peak, Toxic Marsh, then around again), each one +12% stronger than the last on top of the floor curve, with a themed guardian at the end of each.
- Floor 1 opens with a carousel: eight ₽1 Pokémon walk a ring, each holding an item component. Pick one and it joins your bench while its item goes to your bag. Floors 6 and 11 bring more carousels with Pokémon your trainer level can roll, and the floor-11 carousel carries some finished items.
- Augments come on floors 2 and 10 of Acts I and II, and floor 2 of every later act (see Augments).
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

Every line in the game, Generation I–IX plus every regional form, now has a hand-designed signature kit instead of the generic move, built around the Pokémon's design, and kits are being added generation by generation. Branch evolutions get their own moves, and often a different role (Gardevoir is a back-line Seer, Gallade a dueling Blade Knight; Persian a Cat Burglar, Perrserker a shielded Viking). Some Gen II kits summon helpers (Honchkrow calls a Murkrow lackey), set the weather (Politoed, Tyranitar) or revive allies (Ho-Oh). Gen III adds weather setters (Kyogre, Groudon, Pelipper, Torkoal), Castform's weather-reading Weather Ball, partner bonuses (Plusle and Minun, Volbeat and Illumise, Lunatone and Solrock, Latias and Latios), Dusclops' Pain Split and Shedinja's Wonder Guard. Gen IV kits lean on the status system: Luxray paralyzes the enemy with the most PP, Drapion and Toxicroak stack Poison, Abomasnow chills, Carnivine plants Leech Seed, Rotom takes whichever appliance you pick from the Rotom Catalog (tap the catalog icon over it while planning, swap any time): Heat, Wash, Frost, Fan or Mow Rotom change its type, sets, stats and status, and leaving it unplugged calls lightning strikes down on random enemies across the board, Regigigas has Slow Start, and Arceus's Judgment leaves a random status on every enemy. Gen V adds Reshiram and Zekrom (stronger together), the Forces of Nature (Tornadus, Thundurus, Landorus) with Prankster starts, Genesect's Download, Meloetta's Relic Song, Samurott's lingering splinters, Stoutland's Retaliate and many more status builders. Gen VI brings Aegislash's Stance Change, Zygarde's Power Construct, Xerneas's and Yveltal's team-wide Fairy and Dark Auras, Hoopa pulling the enemy back line through a Hyperspace Hole, Volcanion's burning Steam Eruption, and Malamar's Topsy-Turvy. Their shop cards show a red "Signature" tag, and the tooltip lists the role. Some highlights:

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
| Rowlet → Decidueye | Arrow Quill | Spirit Shackle pins the farthest enemy: stun, slow and 20% armor pierce |
| Dartrix → Hisuian Decidueye | Bow Ronin | Branch evolution. Triple Arrows rain on the target and its neighbours, shredding Defense; each cast stacks crit chance, and every 3 takedowns over the run add an arrow (up to 6) |
| Litten → Incineroar | Heel Wrestler (Fire tank) | Shielded Darkest Lariat spins through every adjacent enemy and heals; Intimidate at the start of battle |
| Popplio → Primarina | Soprano | Sparkling Aria: a barrage of singing bubbles, then heals and cleanses the whole team |
| Pikipek → Toucannon | Beak Cannon | Beak Blast heats up for 1s (burning anyone who touches it), then blasts the biggest group |
| Grubbin → Vikavolt | Bug Railgun | Charjabug boosts adjacent allies (Battery); Vikavolt charges a stunning Zap Cannon |
| Turtonator | Shell Trap (Fire tank) | A shielded trap that explodes on everything within 2 hexes the moment it's hit |
| Pyukumuku | Sea Cucumber | Counter doubles basic-attack damage back while braced; Innards Out when it faints |
| Type: Null → Silvally | RKS Chimera | Multi-Attack takes your team's most common type |
| Jangmo-o → Kommo-o | Scale Warrior | Clangorous Soul trades HP for stacking Attack, Defense and speed, then Clanging Scales |
| Tapu Koko / Lele / Bulu / Fini | Island Guardians | Each sets a terrain for your team (Electric speed, Psychic power, Grassy regen, Misty cleansing); Nature's Madness cuts a quarter of a foe's HP |
| Cosmog → Solgaleo / Lunala | Radiant Sun / Moone Emissary | Sunsteel Strike ignores shields and half of Defense; Moongeist Beam pierces a line; Shadow Shield halves early damage |
| Ultra Beasts | Beast Boost | Every Ultra Beast grows stronger with each takedown: Nihilego's neurotoxin, Kartana's Sacred Sword, Xurkitree's Discharge, Blacephalon's Mind Blown… |
| Rookidee → Corviknight | Armored Raven | Iron Defense, then a Body Press that scales with Defense; Mirror Armor |
| Applin → Flapple / Appletun / Dipplin → Hydrapple | Apple branches | Grav Apple dive, Apple Acid that ripens into healing, sticky Syrup Bombs, and a Fickle Beam that sometimes fires every head |
| Cramorant | Gulp Diver | Dives for a catch, then spits an Arrokuda or a Pikachu at the next enemy that hits it |
| Chewtle → Drednaw | Snapping Turtle | Jaw Lock holds both of them in place |
| Rolycoly → Coalossal | Coal Furnace | Tar Shot, and Steam Engine speeds it up whenever Fire or Water hits it |
| Galar fossils | Fossil biters | Bolt Beak and Fishious Rend hit twice as hard on the first cast |
| Duraludon → Archaludon | Alloy Tower | Electro Shot charges (instantly in rain); Stamina |
| Zacian / Zamazenta | Heroes | Behemoth Blade (double against giants) and a shielding Behemoth Bash |
| Kubfu → Urshifu | Wushu Master | Wicked Blow always crits and ignores shields |
| Glastrier / Spectrier / Calyrex | Steeds and King | Glacial Lance, Astral Barrage (both grow with takedowns), and a healing Leaf Storm |
| Sprigatito → Meowscarada | Stage Magician | Flower Trick always crits; every knockout adds crit damage for the rest of the run |
| Fuecoco → Skeledirge | Soul Singer | Torch Song stacks Sp. Atk in battle, and every song adds +1 Sp. Atk for the run |
| Quaxly → Quaquaval | Dancing Duck | Aqua Step stacks Attack Speed in battle and +1% for the run with every cast |
| Pawmi → Pawmot / Rellor → Rabsca | Revival Blessing | Once per battle, brings a fainted ally back at 40% HP |
| Nacli → Garganacl | Salt Golem | Salt Cure eats away HP over time (double against Water and Steel) |
| Tinkatink → Tinkaton | Hammer Smith | Gigaton Hammer every other cast, +50% against bulkier foes |
| Dondozo + Tatsugiri | Commander | Together, Tatsugiri hides inside Dondozo and Dondozo gets +50% stats |
| Paradox Pokémon | Protosynthesis / Quark Drive | Ancient ones power up in sun; future ones always start powered up |
| Treasures of Ruin | Ruinous auras | Each weakens every enemy's Attack, Defense, Sp. Atk or Sp. Def by 15% |
| Koraidon / Miraidon | Box legends | Orichalcum Pulse sets sun; Hadron Engine boosts your Electric moves |
| Terapagos | Terastal | Tera Shell halves damage while healthy; Tera Starstorm hits every enemy and shields your team |
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

### Kit Dex

The Kit Dex (main menu, or the Dex button next to battle speed) lists every kit by generation, with numbers calculated at 2★. Lines are discovered by owning any member of them, through the shop, Kecleon, events or anything else, and discoveries are saved across runs. Undiscovered lines show only a blurred hint. Every starter line, plus Pikachu and Eevee, is known from the start.

Ranged Pokémon (anything with more than 1 range) reach 2 hexes further than their kit's base range, so casters and artillery in your back row can hit the enemy front line.

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
- Trainer level (2–10) sets how many Pokémon you can field and the shop odds, structured like TFT. You gain 2 XP per floor and can buy 4 XP for ₽4. XP to the next level is TFT's curve scaled to a 15-floor run: 2, 4, 6, 12, 20, 28, 40, 48.
- Shop odds use TFT's table, so a cost never appears before its level. The tab above the shop shows the current odds.

| Level | ₽1 | ₽2 | ₽3 | ₽4 | ₽5 |
|---|---|---|---|---|---|
| 2 | 100% | | | | |
| 3 | 75% | 25% | | | |
| 4 | 55% | 30% | 15% | | |
| 5 | 45% | 33% | 20% | 2% | |
| 6 | 30% | 40% | 25% | 5% | |
| 7 | 19% | 30% | 35% | 15% | 1% |
| 8 | 18% | 25% | 32% | 22% | 3% |
| 9 | 10% | 20% | 25% | 35% | 10% |
| 10 | 5% | 10% | 20% | 40% | 25% |

- Kecleon stock, event eggs and trades also stay within the costs your level can roll.
- Shortcuts: D rerolls, F buys XP, Space starts the battle or opens the chest.

### Items

- The **Eject Pack** takes every item off a Pokémon and puts them back in your bag. It turns up in rival, alpha and challenge chests (and sometimes at Kecleon's).
- Drag a component over another component (in the bag, or onto a Pokémon holding one) to see what they'd make. In chest choices, hover any recipe to see the finished item.

- A chest appears after every battle. Open it and pick one of three items, or skip for ₽2. Regular chests hold components (plus the odd consumable or gimmick item); completed items come from challenge, alpha and rival chests (or the Super Rod relic).
- **Reroll items** in a chest for ₽2, going up ₽1 each time for that chest.
- **View team** hides the chest choice so you can check your board, sets and items; **Back to the chest** (or the Battle button) brings it back.
- Items work like TFT: 8 components (Protein, Calcium, Carbos, Iron, Zinc, HP Up, PP Up, Dire Hit) combine into 36 completed items. Put two components on the same Pokémon, or drop one on another in your bag. Each Pokémon holds up to 3 items, and selling it returns them to the bag.
- Items can roll mutators (Shiny, Blazing, Vampiric, Swift, Sturdy, Charged, Lucky, Golden, Growing, Thorny, Blessed, Shadow) that carry over when components combine.
- Consumables: Rare Candy (copy a Pokémon), Potion, Nugget, Honey.

### Relics

Beating a rival (floors 5 and 10) lets you pick one of three relics, then one of three enhancers. Relics are team-wide effects such as Exp. Share, Coin Case, Dowsing Machine or Poké Flute. Alpha Pokémon have a 25% chance to drop a relic, and Kecleon Shops sell them.

### Status conditions and weather

Statuses stack, like the afflictions in The Last Flame and Guildrun: every hit adds stacks, more stacks hit harder, and stacks last 4s after the last hit before halving every 2s. Pips above each health bar show the stacks (BR 6 = 6 Burn).

| Status | Effect | Immune |
|---|---|---|
| Burn | 0.25% max HP/s per stack (max 20). Deals 15% less physical damage, heals half as much | Fire |
| Poison | 0.3% max HP/s per stack (max 20), turning toxic: up to double damage the longer it stays on (full after 10s). Heals a third less | Poison, Steel |
| Paralysis | −5% Attack Speed per stack (max 10) | Electric |
| Chill | −4% Defense and Sp. Def per stack (max 10) | Ice |
| Confusion | 8% chance per stack (max 5) that an attack hurts itself instead | — |
| Leech Seed | Drains 0.3% max HP/s per stack (max 10) into whoever planted it | Grass |

Pokémon apply them through their kits, sets and abilities. Electric moves that stun also paralyze, Ice moves that slow or freeze also chill, and Psychic, Ghost and Fairy moves that flinch also confuse. To build around them:

- Enhancers: Charcoal (Burn), Toxic Orb (Poison), Cell Battery (Paralysis), Never-Melt Ice (Chill and bonus damage to chilled enemies), Twisted Spoon (Confusion), Miracle Seed (Leech Seed), and Black Sludge (Poison).
- Relics: Magmarizer (Burn jumps on a faint), Poison Barb (Poison never wears off), Electirizer (Paralysis slows 7% per stack), Snowball (Chill lowers defenses 6% per stack), Sticky Barb (+1 stack on everything) and Full Heal (defensive: half status damage, statuses fade twice as fast).
- Augments: Static, Poison Point and Flame Body (Silver), Hex Maniac (+6% damage per different status on the target) and Outbreak (statuses spread when an enemy faints) (Gold), Plague Doctor (double stacks, +25% status damage) (Prismatic).

Weather now does what it does in the games, with PMD weather art on screen (rain streaks and splashes, falling hail and snow, blowing sand, heat shimmer and sun flares) and a banner explaining it:

- Harsh sunlight: Fire moves +20%, Water −15%, and nothing can be chilled.
- Rain: Water moves +20%, Fire −15%, and burns wear off twice as fast.
- Sandstorm: everything that isn't Rock, Ground or Steel takes 1% max HP per second; Rock types get +50% Sp. Def.
- Snow and hail: everything that isn't Ice takes 1% max HP per second; Ice types get +50% Defense.

### Sets

Every Pokémon belongs to several sets, and each set activates at its breakpoints (counting different Pokémon on the field). Hover a set to see its bonuses the TFT way. Breakpoints you've reached are green, and the value for your current tier is highlighted. Other tiers' values, and bonuses that unlock at higher counts, are greyed out.

Sets scale like TFT traits, with bronze, silver, gold and prismatic medals. Type sets and most classes go 2 / 4 / 6 / 8; the bigger styles and the regions (National Dex) go 2 / 4 / 6. The top tier is built to be hard to reach with a 10-Pokémon team and does something big: Fire's Wildfire makes Burn permanent, Ice's Absolute Zero freezes enemies at 10 Chill, Ghost's Undying brings each Ghost back once, Poison's Venom Tide doubles Poison damage, Juggernauts become immune to status, Tricksters' statuses add 50% more stacks, Water's Tsunami hits every enemy for 10% max HP every 5 seconds, and so on (hover a set in game for the full text).

**Type Plates** are this game's emblems: a Plate held by a Pokémon makes it count as that type for sets, so the prismatic tiers become reachable. Rival chests often hold one (usually for a type you're already running), and Kecleon sometimes sells one for ₽10.

**Type sets (2 / 4 / 6 / 8)** each change how the fight plays:

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

### Regional forms

Alolan, Galarian, Hisuian and Paldean forms are lines of their own, with their own sprites, types, stats and signature kits:

- **New lines:** Alolan Rattata, Sandshrew, Vulpix, Diglett, Meowth, Geodude and Grimer; Galarian Meowth (→ Perrserker), Ponyta, Slowpoke (→ Galarian Slowbro or Slowking), Farfetch'd (→ Sirfetch'd), Corsola (→ Cursola), Zigzagoon (→ Obstagoon), Darumaka, Yamask (→ Runerigus), Stunfisk and the three Galarian birds; Hisuian Growlithe, Voltorb, Qwilfish (→ Overqwil), Sneasel (→ Sneasler) and Zorua; White-Striped Basculin (→ Basculegion); the three Paldean Tauros breeds and Paldean Wooper (→ Clodsire).
- **Branch evolutions** you choose when the Pokémon evolves: Alolan Raichu, Alolan Exeggutor, Alolan Marowak, Galarian Weezing, Galarian Mr. Mime (→ Mr. Rime), Hisuian Typhlosion, Samurott, Lilligant, Braviary, Goodra, Avalugg and Decidueye.
- Alolan forms belong to the Gen VII pool, Galarian and Hisuian forms to Gen VIII, and Paldean forms to Gen IX (all of them in National Dex). Hisuian lines count as Sinnoh for the region sets.

### Alternate forms, fusions and kinship sets

- **Form units:** Sandy and Trash Wormadam (Burmy branches), Pom-Pom, Pa'u and Sensu Oricorio (their own shop units), Midnight and Dusk Lycanroc (Rockruff branches), Low Key Toxtricity and Rapid Strike Urshifu (branches). Each has its own sprite, type and kit.
- **Fusions:** own Kyurem with Zekrom or Reshiram (DNA Splicers), Necrozma with Solgaleo or Lunala (N-Solarizer / N-Lunarizer), or Calyrex with Glastrier or Spectrier (Reins of Unity), and its menu (right-click / RT) offers the fusion. A cut-in plays, the partner joins the fusion, and the fused Pokémon gets its fused stats, a new move and +10% max HP and damage per star of its partner. Separate them from the same menu (selling a fusion returns the partner). A fused Necrozma **Ultra Bursts** into Ultra Necrozma at half HP.
- **Deoxys:** a meteorite falls when you get one and you pick its forme (Normal, Attack, Defense or Speed); change it from its menu between battles. Each forme plays its Psycho Boost differently.
- **Kinship sets** count different members rather than lines, so two Lycanroc forms from the same Rockruff line both count: Wolf Pack (Lycanroc forms), Dance Troupe (Oricorio styles), Cloak Society (Wormadam cloaks), Two Styles (Urshifu), Duet (Toxtricity), Eeveelutions, Tao Trio (a fused Kyurem counts as its partner too), Weather Trio, Island Guardians, Ruinous Treasures, Swords of Justice, Lake Guardians, Legendary Beasts, Ancient and Future Paradox Pokémon, and Ultra Beasts.
- **Augments:** Regional Tour, Form Change, Fusion Reactor, Legendary Gathering and Pack Leader play into forms and kinship sets.

### Trait sets

Fourteen sets come from the Pokédex itself (body, weight, egg group and category), so they mix every type and generation. A line keeps its traits as it evolves (they come from the form it grows into), and each Pokémon has at most two.

| Set | Who | Breakpoints | Effect |
|---|---|---|---|
| Titans | lines that grow to 150 kg+ | 2 / 4 / 6 | +20/40/70% max HP; each stomps at the start, stunning adjacent enemies |
| Pocket-Sized | lines that stay under 15 kg | 2 / 4 / 6 | Dodge; at 6, ducks out of the fight for 3s instead of fainting, back with 30% HP |
| Sky Squadron | winged lines | 2 / 4 / 6 | Take off, then dive on the farthest enemy (damage at 4, stun at 6) |
| Serpents | snake-bodied lines | 2 / 4 | Basic attacks build Coil; every 5th (3rd) constricts: held 1s and a burst of damage |
| Kaiju | Monster egg group | 2 / 4 / 6 | Grow with every cast; at 6 the third cast makes them giant |
| Phantasms | Amorphous egg group | 2 / 4 | Melt into a puddle instead of fainting, reform with 30/50% HP |
| Living Stone | Mineral egg group | 2 / 4 / 6 | A stone shield (10/20/35% max HP) that rebuilds every 4s |
| Showstoppers | Human-Like egg group | 2 / 4 / 6 | The top member takes the Spotlight (bonus damage and speed; its casts give the team PP); two at 6 |
| Deep Sea | Water 2 / Water 3 egg groups | 2 / 4 / 6 | Bonus damage to enemies below half HP; at 6, finish off anything below 15% |
| Fae Folk | Fairy egg group | 2 / 4 / 6 | Every 4s a random ally makes a Wish and heals 8/15/25% |
| Mouse Brigade | mice and other rodents | 2 / 3 / 4 | Faster for every other rodent; at 4, knockouts find cheese (₽1) |
| Fox Spirits | the Fox Pokémon | 2 / 3 | Each conjures a decoy illusion that draws attacks |
| Nursery | lines that hatch from a baby | 1 / 2 / 3 | Half damage next to an ally; survivors grow stronger over the run; cheer adjacent allies at 3 |
| Team Rocket | Team Rocket's Pokémon | 2 / 4 / 6 | Knockouts can steal ₽1; at 6, fainting Rocket Pokémon blast off in an explosion |

Every pool can complete every trait set: if a generation has too few lines for a set's top breakpoint (plus one), guest lines from the nearest generations join its pool, and National Dex pools are topped up the same way. Heart, Crest and Crown augments exist for trait sets too.

### Non-sprited Pokémon

A few lines don't have PMD sprites yet. By default they're left out (a branch without sprites is dropped, and a line that couldn't evolve without one is skipped). Turn on **Settings › General › Enable non-sprited Pokémon** to add them as round portrait tokens; it applies to new runs.

### Starter bonds

Every starter line (Gen I–IX, plus Hisuian Decidueye) grows with its **Friendship**, which it earns in each battle it fights while your Partner set is active. The bond stays even when Partner isn't active, so investing early pays off for the whole run:

- **Grass starters (Overgrow Bond):** +2% max HP and +1% move damage per Friendship. At 20, your whole team restores 1% max HP per second.
- **Fire starters (Blaze Bond):** +2% move damage and +1% Attack Speed per Friendship. At 20, they start every battle with +30 PP.
- **Water starters (Torrent Bond):** +2% move damage and +1 Defense and Sp. Def per Friendship. At 20, they start every battle with a 25% max HP shield.

### Augments

You pick one of three augments on floors 2 and 10 of Acts I and II and on floor 2 of every later act (5 in a full run, plus one per endless act). All three cards share a tier: the first pick is Silver 30% / Gold 50% / Prismatic 20%, later picks Silver 15% / Gold 50% / Prismatic 35%, and endless picks Gold 40% / Prismatic 60%. Each card can be rerolled once, and **View team** hides the screen so you can check your board first.

There are 51 hand-made augments plus Heart / Crest / Crown augments for every type and class:

- **Combat:** Tailwind, Oran Rations, Iron Defense, Focus Energy, Quick Start, Leftovers, Thick Fat, Intimidate (Silver); Endure, Swords Dance, Sitrus Stash, Drain Punch, Spellslinger, Thrill of the Hunt, Scary Face (Gold); Champion's Belt, Second Wind, Hyperdrive (Prismatic).
- **Team building:** Front Line, Back Line (Silver); Daycare Egg, Big Game, Little Buddies, Training Grounds (Gold); Trainer's Resolve, Ace Trainer, Legendary Encounter, Harmony (Prismatic).
- **Economy:** Berry Basket, Candy Jar, Bargain Bin (Silver); Rich Get Richer, Study Hall (Gold); Pay Day, Rare Candy Mountain, Golden Ticket (Prismatic).
- **Items:** Component Pack, Pickup (Silver); Item Grab Bag, Cybernetic Implants (Gold); Item Rain (Prismatic).
- **Status:** Static, Poison Point, Flame Body (Silver); Hex Maniac, Outbreak (Gold); Plague Doctor (Prismatic).
- **Weather (Gold):** Drought, Drizzle, Sand Stream and Snow Warning start every battle in that weather and buff the matching types.
- **Sets:** a *Heart* (Silver) counts as one extra of that type or class, a *Crest* (Gold) adds one and gives you a ₽2–3 Pokémon of it, and a *Crown* (Prismatic) adds two and gives you a 2★ ₽3–4 Pokémon. One of the three cards is often a set augment for a set you already play.

### Scouting

Once you've invested in a set (3+ different lines and ₽6+ worth of units, from floor 3), shop slots have a chance to show Pokémon from your two most-invested sets. The chance grows with investment and with every shop that misses. Scouted cards are tagged in the shop. Each shop that misses adds 12% (15% in National Dex), so a dry streak ends quickly. Lines that are in both of your top sets are favoured. The National Dex pool is about seven times bigger than a single generation's, so there scouting starts on floor 2 at 2 lines and ₽5.

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

On floor 4 of each act you choose one key item. In later acts you can switch to one you haven't used, or keep your current one.

- **Mega Bracelet (Gen VI):** Mega Stones drop only for Pokémon you own (96 Megas, including Legends: Z-A). There's no cap: every Pokémon holding its stone Mega Evolves the moment the stone is dropped on it, and starts each battle in Mega form with its real Mega stats and ability. Toggle any Mega off or on from its unit menu.
- **Z-Power Ring (Gen VII):** Z-Crystals let a Pokémon with a matching move type turn its first move each battle into a Z-Move.
- **Dynamax Band (Gen VIII):** Max Mushrooms raise a Pokémon's Dynamax Level (up to 10). Your Dynamax pick grows huge for 10 seconds with Max Moves that change the battlefield. Pokémon with a Gigantamax form unlock it at 3 mushrooms and use their G-Max Move.
- **Tera Orb (Gen IX):** Tera Shards work like emblems: the holder counts as that type for sets. Your Tera pick Terastallizes each battle, counting twice toward its Tera type.

Rivals and the boss use a gimmick of their own.

Forms that don't have a PMD sprite yet use the base Pokémon's sprite tinted toward the form's colors, plus a badge: a Key Stone over Megas, a red cloud crown for Gigantamax, a gold crown for Crowned forms and wind swirls for Therian forms. Pokémon with no PMD sprite at all appear as round portrait tokens with a type-colored ring. Re-running the asset scripts picks up new SpriteCollab sprites automatically.

### Screen layout and camera

Built to stay readable on small handheld screens such as the AYN Thor:

- Pokémon and items can be moved with two taps or clicks: one to pick up, one to place. Tapping the shop while carrying a Pokémon releases it, and Esc or B puts it back. Dragging still works.
- A slim top bar holds trainer HP, the route tracker, level, Pokédollars, battle speed and the Menu button.
- The Menu (Esc, Select on a controller, or the Menu button) pauses the game. It holds run info (strategy, augment, gimmick target, relics, income, scouting, next opponent), the Kit Dex, Settings and Quit to title.
- The shop hides behind its tab (Tab, LB). Hidden, it leaves one slim row with the buttons and small portraits of the offers. The bag folds up the same way (B key). Both tuck themselves away during battles unless you turn that off.
- The board zooms to fill whatever space the HUD leaves, so it gets bigger with the shop hidden and in battle. Zoom further with the mouse wheel, + and −, or the right stick. Pan by dragging empty ground (any mouse button, in planning and in battle) or with the right stick.
- **Battle meter:** a panel on the right during battles (and showing the last battle while you plan). Tabs for Damage, Healing and Damage taken list each Pokémon's total with a bar and its per-second rate below, plus a team total. Switch between your team and the enemies; collapse it with its header.
- **Unit menu:** right-click a Pokémon (or press RT on a controller) to open a panel with its full details, all held items and gimmick items (hover for tooltips), the Mega Evolution toggle and Rotom's Catalog. Battles pause while it's open. 0 or R3 resets.

### Visual effects

Every move effect, impact, projectile, beam, status sparkle and chest is a Pokémon Mystery Dungeon asset from [PMDCollab RawAsset](https://github.com/PMDCollab/RawAsset): type-matched particle sheets for hits and projectiles (directional sheets turn to face their flight), column and lightning beams for links and chains, Protect bubbles for shields, and PMD treasure boxes for chests. A brown box follows normal floors, a purple box follows alpha and challenge fights, and a silver box follows the act rivals on floors 5 and 10.

### Move animations and legendary cinematics

Signature moves whose name matches a Pokémon Mystery Dungeon animation (Flamethrower, Close Combat, Earthquake, Head Smash, Draco Meteor and about 150 more) play that animation on what they hit, or on the caster for heals and shields, on top of the type-matched impact.

Legendary Pokémon get dramatic effects that stay on the board and never cover the field or slow the game: a big charge-up behind them, a shockwave ring, their own stack of PMD impacts on every target, strikes from the sky for some, a lingering afterglow and a short screen shake (Settings › Display can turn the shake off). Each has its own look: Reshiram's Blue Flare burns blue, Zekrom's Bolt Strike calls down a triple blue lightning strike, Dialga's Roar of Time sends time-warp clouds, Giratina's Shadow Force bursts from the shadows, Arceus's Judgment rains light.

### Settings

Settings are split into sections like PokéRogue's: General (battle speed, damage numbers, shop and bag behaviour), Display (board auto-fit, zoom speed, move effects, light rays), Audio (no sound yet), Gamepad (cursor speed, stick dead zone, right-stick mode, button list), Controls (keyboard and mouse list) and Data (delete the saved run, forget Kit Dex discoveries, reset settings).

### Saving

Runs save automatically in your browser. Continue from the main menu.

## Controller

Plays with any standard gamepad (Xbox-style layouts such as the AYN Thor) in a browser that supports the Gamepad API:

| Input | Action |
|---|---|
| Left stick | Move the cursor (speed and dead zone in Settings › Gamepad) |
| RT | Open the unit menu for the hovered Pokémon |
| Right stick | Zoom (up/down) and pan (left/right) the board, or a fine cursor nudge if set in Settings |
| D-pad | Snap to the next button, card, item, carousel Pokémon or board Pokémon |
| A | Select. Press A on a Pokémon or item to pick it up, move, then press A again to place it (holding A and dragging also works) |
| B | Back / put down what you are carrying / close the menu |
| X | Reroll |
| Y | Level up |
| LB | Hide or show the shop |
| RB | Release the Pokémon under the cursor |
| L3 | Toggle battle speed |
| R3 | Reset the zoom |
| Start | Continue or new game / battle / open chest |
| Select | Menu (pauses the game) |

## Project layout

```
index.html          markup and styles
js/data.js          balance tables: items, relics, acts, levels
js/augments.js      augments, set augments and the augment screen
js/sets.js          sets, ability passives, kit tuning
js/game.js          game logic
js/forms.js         form changes and generation gimmicks
js/route.js         route choices, events, Kecleon shops, enhancers, unit mutators
js/kits.js          kit building blocks, set gear and the first signature kits
js/kits_gen1.js     Generation I signature kits
js/kits_gen2.js     Generation II signature kits (and Gen II branches of Gen I lines)
js/kits_gen3.js     Generation III signature kits (and Gen III branches)
js/kits_gen4.js     Generation IV signature kits
js/kits_gen5.js     Generation V signature kits
js/kits_gen6.js     Generation VI signature kits
js/status.js        stacking status conditions and weather
js/cine.js          move-name animations and legendary cinematics
js/kitdex.js        in-game Kit Dex and discoveries
js/fx.js            PMD particle player, beams, PMD chests
js/fx_manifest.js   frame layout of every particle sheet
js/carousel.js      carousel rounds
js/ui.js            pause menu, settings, collapsible shop and bag
js/gamepad.js       controller support
data/pokedex.json   species, types, base stats, evolutions (from PokéAPI)
data/sprites.json   PMD animation metadata
data/kits.json      per-species move, heal/guard move and abilities (from PokéAPI)
data/forms.json     Mega, Gigantamax, battle and item forms (from PokéAPI)
assets/fonts/       Pokémon Emerald font built from pret/pokeemerald glyphs
assets/fx/          PMD particle sheets (PMDCollab RawAsset)
assets/beam/        PMD beam sheets (PMDCollab RawAsset)
assets/XXXX/        PMD sprites and portrait for National Dex #XXXX (form ids above 10000)
```

Run locally with any static server, for example `python3 -m http.server`, then open http://localhost:8000.

## Credits

Sprites and portraits are from the [PMD SpriteCollab](https://sprites.pmdcollab.org/) project and belong to their individual artists ([credits](https://github.com/PMDCollab/SpriteCollab)). Move effects, beams and treasure boxes are Pokémon Mystery Dungeon assets (Spike Chunsoft) collected by [PMDCollab RawAsset](https://github.com/PMDCollab/RawAsset). Pokédex data and item sprites come from [PokéAPI](https://pokeapi.co/). The font is built from Pokémon Emerald's glyphs in the [pret/pokeemerald](https://github.com/pret/pokeemerald) decompilation.

This is a non-commercial fan project and is not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Pokémon is a trademark of Nintendo, Game Freak and Creatures.
