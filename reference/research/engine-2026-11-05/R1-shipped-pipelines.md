# R1: how shipped platformers built and varied their levels, and how fast (researcher 1 of 4, 2026-11-05)

Scope: how commercial 2D platformers (generated and hand-made) split data from code, what unit they reused, how they kept variety
and fairness, which tools made a level fast, and what failed. Then our own code measured against the main idea, on real stages.

Tags used on every number: **(measured)** = I ran it or counted it myself; **(dev-reported)** = the developer said it in the source;
**(estimate)** = my own arithmetic from reported numbers. A quote is always copied from the page or file named next to it.

---

## 1. Planned vs actual time

- Planned: about 75 minutes.
- Actual: started 02:17 UTC (09:17 pm ET, 11-04), finished about 02:58 UTC (09:58 pm ET): about 41 minutes **(measured, `date`
  in the shell at start and end)**. That is over half the plan, but under it. Where the time went: 61 pages and 3 code
  repositories opened and read (section 6); 5 measurement scripts run against our real gen2 and World 1 code (section 3.0);
  writing. What I did NOT get to, plainly: the Celeste GDC 2017 level-design talk itself (GDC Vault was in maintenance and
  YouTube is blocked by the proxy, see section 6 "could not open"), Shovel Knight deep dive part 5 (404), and the Dead Cells GDC
  2019 talk (Vault down). Where Celeste is concerned I used only Maddy Thorson's own written words.

---

## 2. The big lessons, ranked, for our engine

Ranked by how directly each one fights "every stage feels the same" and the 12-hour hand-built stage.

**L1. Every hybrid that shipped made the hand-made unit big and whole, and kept the generator small and dumb.** Spelunky's unit is a
10x8-tile room template picked by its job on the path, with 5x3 obstacle blocks and dice-roll tiles inside it (source code,
`scrRoomGen.gml:26-47`). Dead Cells' unit is a hand-designed room per biome and purpose, placed by a hand-drawn graph: "the key for
us was in having the algorithm involved in the most restrained way possible" (Bénard). Super Meat Boy Forever's unit is a whole
Super Meat Boy-sized level, "designed and decorated by hand... played through it to give it a par and a difficulty rating", and the
generator only picks 8 of them and orders them (Refenes). For us: the engine's job is choosing and ordering whole designed beats, not
inventing geometry. Our gen2 section is already this shape (`src/game/gen2/types.ts:325-362`); World 1's beat stages are not (they
are 1,349 + 602 lines of bespoke TypeScript, section 3.0).

**L2. No unit repeats inside a level, and the whole game remembers what it has shown.** SMBF: "We keep track to avoid duplicates so
you can play through the game several times and not see duplicate chunks." Shovel Knight: "You can't show the same magic trick
twice!" and "No gameplay concepts should overstay their welcome". **Our measured state: 355 of 368 shipped gen2 rolls (Worlds 5-8)
use one template 3 or more times in one stage, though our own STAGE-RULES §0c.2 (line 80) says "no template more than twice in a
stage"; the worst is 14 times (8-9, roll 3, `w8-guard-night`)** (measured, section 3.0). This is the most direct, code-proven
cause of sameness I found. A cap alone does not fix it: with `maxPerStage` 2 on every template (the hook is at `pipeline.ts:798`)
none of 48 rolls of 6-2, 8-6 and 8-9 builds (measured, 3.0 Run F). The fix is the order SMBF used: enough distinct units per stage
first, then the cap as a construction rule, then length from the units, not a clock.

**L3. The pool must be several times bigger than what one level uses, and it is cut per level, not shared.** SMBF: "Each Level has
between 70 and 100 Chunks that it can choose from" for 8 used, about 10 to 1 (estimate from dev-reported numbers). Spelunky Classic:
8 to 16 templates per room type plus 16 ground and 10 air obstacle blocks in the Mines alone (counted in code, section 3.1). Ours:
a gen2 stage fills 16-27 slots from 6-13 distinct templates (measured); the kits hold 15-76 templates, but only 12-40 fit the
stage's archetype, and per phase it is as few as 2-4 (8-6: 4 for its 5 ki slots). Pass 3 then fills "each node... with sections
until its share of the seconds is met" (`pipeline.ts:702`), which is the clock-filling our own STAGE-RULES §0c.1 retired ("Length
comes from nodes, never from filling a clock", line 77). **Measured what-if: capping every template at 2 uses a stage makes 0 of 48
rolls of 6-2, 8-6 and 8-9 build ("no section fits node n3 (sho)"); removing the theme cut changes nothing** (3.0 Run F). So the
pool is too small for the clock, not the shuffle too narrow. Lesson: count "distinct pieces this stage may use, per phase" against
"slots this stage has, per phase"; the floor is 1:1 with no repeats, SMBF's is about 10:1.

**L4. Difficulty is a cadence of rated units, ramping and cooling at every scale.** SMBF: chunks "randomly selected based on their
difficulty which was presented in a certain cadence... start the player out slow, ramp them up a bit, bring them back down, and then
finish with a bang." Shovel Knight: "the last part of each room is harder than the first part... each set of rooms is more
challenging than the last set... Every moment of gameplay, big or small, is ramping up then cooling down, cyclically." **Ours,
measured on 8-6 roll 0: template difficulty is 6-7 from the third slot on for 19 of 27 slots; the only lower numbers are rests (2)
and the book-ends** (section 3.0). The tension labels ramp; the pieces do not. The engine needs rated units spread across the whole
1-10 band and a cadence that drops after a peak, inside each node and across the stage.

**L5. Each new thing is taught in three steps, and the middle step is a safe locked door.** Ubisoft's rational design (Rayman
Origins): "exposition, validation and challenge... Validation is most effective when done in a safe area, blocking the player's
progression to force learning." Shovel Knight introduces Grapps in four rooms, safe first, then with a pit, then a "test", then a
cool-down with a secret. Our rule "the first appearance of a mechanic is taught" (CLAUDE.md) covers exposition; a mandatory safe,
blocking validation beat before the first real test is new.

**L6. Every level carries one named surprise, and a surprise has a test.** Mouri (Wonder): "I wanted to include at least one element
in each course that would surprise or delight players." Tanabe (DKC Returns): "the goal is to try to create, at some level, a
memorable moment in every level." Wonder's filter for a surprise: "a connection between pre-Wonder Effect and during", "having
players suddenly be able to do something they couldn't before", and "having it be explained simply with one short phrase". For
us: a stage spec field, `signature`, that must be unique across the game and pass those three tests.

**L7. Grey first, judged, then art; and the loop between an edit and a play must be short.** Hollow Knight: "The whole world is just
built from black tiles... we can just hit play... a world was two days to do the tiles... and then another four days to do the art
pass, and then that took it to a level that was probably, 85%, 90% there." Ori: blockout until "everyone loves the blockout level
and then it eventually gets the 'design approved' stamp" before art. Tezuka on 1985: "We would draw the stage layout on graph paper...
The next day, it would come back as a playable level." Our build is fast (324-441 ms a stage, measured); our slow part is judging.

**L8. Finishing is a list of passes, each looking at the whole game for one thing.** Yacht Club: blocker pass, custom-properties
pass, speedrunner pass, background-art pass, screen-shake pass, 3D pass; "Going over the levels repeatedly in passes helps
tremendously with cohesion." Polish took "about 4 intensive months". Several of these map onto checks a machine can run.

**L9. Fairness comes from the generator AND from the hero's tools.** Derek Yu: "there are some challenges with randomized platform
level design that are smoothed over by the implementation of destructible terrain and climbing tools." Celeste's forgiveness list
"all centered around widening timing/positioning windows". Refenes: "level design and controls [must] be symbiotic". A generated
stage is safer when the hero has a generous rescue move.

**L10. Build the first stage of a world last, and re-grade early stages after later ones get better.** Tezuka: "The basic stage
known as 1-1 was actually something we came up with at the very end while balancing the overall difficulty." Retro's Cliff area was
"the most fun" then, after the others were redone, "the least fun" and was remade. Yacht Club: "By the end of the project we're
always better at making levels, so we also loop back around to revisit earlier areas."

---

## 3. Per game

### 3.0 Our own code, measured against the main idea (L1-L4)

I ran six scratch scripts (not committed; in my scratchpad) through `npx tsx` from the repo, building each stage with the game's
own entry `buildGen2ForGame` (`src/game/gen2/game.ts:134`) on Normal, or `buildGen2Stage` with the shipped seed for the what-ifs.

**Run A, pool vs slots, roll 0 (a first play), Worlds 6-8** (measured; output trimmed to the per-stage lines):

```
6-1: kit pool 15, 22 slots, 11 distinct; most-repeated w6s-root-island x4; modelled 197 s, 9.0 s per slot; pool:slots 0.68:1
6-2: kit pool 33, 23 slots, 7 distinct; most-repeated w6-watch-reeds x8; modelled 211 s, 9.2 s per slot; pool:slots 1.43:1
6-4: kit pool 46, 16 slots, 7 distinct; most-repeated w6-long-flat x4; modelled 150 s, 9.4 s per slot; pool:slots 2.88:1
World 6: union pool 68 templates (0 use sub-blocks), first play shows 39; mean 9.5 s per slot; 168 slots in 8 stages
7-6: kit pool 42, 23 slots, 11 distinct; most-repeated w7-stair-flat x5; modelled 218 s, 9.5 s per slot; pool:slots 1.83:1
World 7: union pool 63 templates (0 use sub-blocks), first play shows 37; mean 9.6 s per slot; 129 slots in 6 stages
8-1: kit pool 76, 27 slots, 9 distinct; most-repeated w8-loft-climb x7; modelled 216 s, 8.0 s per slot; pool:slots 2.81:1
8-6: kit pool 51, 27 slots, 8 distinct; most-repeated w8-glide-gust x9; modelled 191 s, 7.1 s per slot; pool:slots 1.89:1
8-9: kit pool 42, 19 slots, 6 distinct; most-repeated w8-monarch-guard-posts x7; modelled 248 s, 13.0 s per slot; pool:slots 2.21:1
World 8: union pool 147 templates (0 use sub-blocks), first play shows 49; mean 9.3 s per slot; 166 slots in 7 stages
```

The full plan of 8-6, slot by slot (measured): `w8-gate-gusts > w8-glide-first > w8-glide-gust > w8-glide-gust > w8-glide-gust >
w8-glide-gust > w8-glide-gust-pair > w8-glide-gust > w8-glide-gust-pair > w8-glide-gust > w8-glide-gust-pair > w8-rest-glide-fork >
w8-rest-glide > w8-glide-dark > w8-glide-gust-hunter > w8-glide-gust-pair > w8-glide-gust > w8-glide-gust-hunter > ...`. Nine of 27
slots are one template. That is the SMBF opposite: SMBF never shows a chunk twice in a level.

**Why so few distinct pieces per stage** (measured, Run B: kit size, then templates that fit the stage's archetype and the world's
moves, an upper bound, then used, then the eligible count per phase):

```
6-2 (stealth): kit 33; archetype-eligible 16; move-eligible 16; used 7; eligible by phase {"rest":3,"goal":3,"start":3,"ki":5,"sho":10,"ten":10,"ketsu":9}
8-1 (sprint): kit 76; archetype-eligible 40; move-eligible 40; used 9; eligible by phase {"start":5,"rest":6,"goal":6,"ki":16,"sho":28,"ten":26,"ketsu":21}
8-6 (sprint): kit 51; archetype-eligible 15; move-eligible 15; used 8; eligible by phase {"start":3,"rest":2,"goal":2,"ki":4,"sho":7,"ten":9,"ketsu":9}
8-9 (gauntlet): kit 42; archetype-eligible 12; move-eligible 12; used 6; eligible by phase {"rest":2,"goal":2,"start":3,"sho":7,"ten":7,"ketsu":7,"ki":3}
```

My first guess was the roll's theme (`pipeline.ts:687` THEME, applied at `pipeline.ts:769`, each roll favouring a third to a half
of the pool, added because "rolls looked alike", comment at `pipeline.ts:678-686`). **Run F disproved it** (measured, every shipped
seed of each stage, built with `buildGen2Stage` and the kit's manifest changed):

```
6-2 as shipped:      built 16/16; mean 7.6 distinct of 23.3 slots; worst repeat 8x
6-2 no theme cut:    built 16/16; mean 7.6 distinct of 23.3 slots; worst repeat 8x
6-2 cap 2 per stage: built 0/16 | roll 0 threw: gen2 6-2: no section fits node n3 (sho); roll 1 threw: ... n3 (sho); roll 2 threw: ... n2 (ki)
8-6 as shipped:      built 16/16; mean 7.6 distinct of 27.1 slots; worst repeat 12x
8-6 no theme cut:    built 16/16; mean 7.6 distinct of 27.1 slots; worst repeat 12x
8-6 cap 2 per stage: built 0/16 | roll 0 threw: gen2 8-6: no section fits node n2 (ki); roll 1 threw: ... n3 (sho); ...
8-9 as shipped:      built 16/16; mean 6.0 distinct of 20.7 slots; worst repeat 14x
8-9 no theme cut:    built 16/16; mean 6.0 distinct of 20.7 slots; worst repeat 14x
8-9 cap 2 per stage: built 0/16 | roll 0 threw: gen2 8-9: no section fits node n5 (ten); ...
```

The theme cut is not binding here (a node's bag is topped up to one more than the cooldown, `pipeline.ts:678-686`, and with 2-9
candidates per phase that keeps nearly all of them). Run G (measured, every gen2 stage of Worlds 6-8, roll 0) counted slots per
phase against templates that fit the phase, the archetype and the world's moves only: on that loose count the stages are short just
4 templates in all for "at most twice" and 35 for "no repeats" (8-6: `ki 5/4, sho 5/7, rest 5/2, ten 9/9`). Since the real
build still fails under a cap of 2, the binding cut is in the filters that count leaves out (`pipeline.ts:792-800`: lessons taught
before this stage via `uses`, hang needs, bans) and the corridor clamp (`pipeline.ts:818-820`). I did not pin down which one in the
time; a second script that copied those filters did not reproduce the shipped picks, so I am not reporting its numbers. The real cause: each node is filled to its share of the clock
(`pipeline.ts:702`) from 2-9 candidates, so the pieces must repeat, and with our own cap of 2 the stage cannot be built at all.
SMBF and Shovel Knight start from the other end: the number of distinct designed units fixes the level's length (8 chunks; about
26 rooms), never a clock.

**Run C, our own rule against every shipped roll** (measured, 368 rolls built, all of `GEN2_SEEDS`):

```
World 5: 28/32 shipped rolls use some template 3+ times (§0c.2 says at most twice); worst 5x at 5-7 roll 0: w5-high-road
World 6: 128/128 shipped rolls use some template 3+ times; worst 8x at 6-2 roll 0: w6-watch-reeds; on roll 0, 5 templates sit in more than 3 stages (§0c.4)
World 7: 87/96 shipped rolls use some template 3+ times; worst 5x at 7-1 roll 1: w7-gallery; on roll 0, 6 templates sit in more than 3 stages
World 8: 112/112 shipped rolls use some template 3+ times; worst 14x at 8-9 roll 3: w8-guard-night; on roll 0, 2 templates sit in more than 3 stages
```

So STAGE-RULES §0c.2 ("no template more than twice in a stage", `reference/STAGE-RULES.md:80`) and §0c.4 ("No template appears in
more than 3 of a world's stages", line 84) are written but not enforced on the gen2 worlds. Caveat, plainly: some repeats are rest
sections (`w8-rest-bough`), which hurt less than a repeated challenge; the rule as written counts them.

**Run D, the difficulty cadence** (measured; `phase:template difficulty/node tension` per slot):

```
8-6 -> start:1/0.10 ki:4/0.30 ki:6/0.30 ki:6/0.30 ki:6/0.30 ki:6/0.30 sho:7/0.60 sho:6/0.60 sho:7/0.60 sho:6/0.60 sho:7/0.60
       rest:2/0.10 rest:2/0.10 ten:7/0.72 ten:7/0.72 ten:7/0.72 ten:6/0.72 ten:7/0.72 rest:2/0.10 rest:2/0.10 rest:2/0.10
       ten:7/0.85 ten:6/0.85 ten:7/0.85 ten:7/0.85 ketsu:6/0.95 goal:2/0.00
6-1 -> start:1 ki:3 ki:3 ki:4 ki:3 sho:5 sho:5 sho:5 sho:6 rest:1 rest:3 ten:5 ten:7 ten:6 ten:6 rest:3 rest:1 ten:7 ten:6 ketsu:5 ketsu:6 goal:1
```

6-1 ramps (3 to 5 to 6-7); 8-6 is at 6-7 from slot 3 to the end apart from rests. The template `difficulty` is the author's 1-10
rating (`types.ts:330-331`), an estimate, not a measurement of play.

**Run E, how long a stage takes to build** (measured, mean of 5): gen2 8-6 324 ms; World 1's 1-2 (beat-traced) 441 ms, 170
platforms, 37,112 px wide. The machine is not the bottleneck.

**World 1's hand-built stages, as cost** (measured from git): `src/game/w1Rhythm.ts` 1,349 lines (1-2 and 1-5; `layout12` at line
529 and `layout15` at line 769 are each about 240 lines of bespoke code), 32 commits from 2026-11-04 18:22 to 11-05 02:01 UTC;
`src/game/w1Rise.ts` 602 lines (1-1), 13 commits from 18:14 to 01:47; `src/game/beatTrace.ts` 668 lines, 9 commits. The stage is
code, not data. Every shipped game below keeps its stages as data (tiles, text templates, rooms in an editor) and its rules as code.

What we already have that the shipped games also had (so not new): mirrored units (`types.ts:358`; Spelunky "rooms also randomly get
mirrored", Kazemi); Spelunky-style sub-blocks as a type (`types.ts:347-353`) but **no world uses them** (measured: `grep subBlocks
src/game/gen2/worlds` finds nothing); a stage keeps its layout until cleared (`src/game/layoutMemory.ts:7-13`), which is exactly
SMBF's fix (3.3); a safe start (STAGE-RULES §1c step 3), like Spelunky's arrow traps kept away from the entrance (3.1).

### 3.1 Spelunky (Classic 2008, HD 2012, Spelunky 2 2020)

- **Data vs code.** Data: room templates as 80-character strings, one per 10x8 room, plus 5x3 obstacle strings, typed straight into
  the script (`scrRoomGen.gml:26-47`: "ROOMS are 10x8 tile areas... OBSTACLES are 5x3 tile chunks that are randomized within
  rooms"). Code: the 4x4 path walk (`scrLevelGen.gml:97-133`), the tile dice (`scrRoomGen.gml`: `tile == "2" and rand(1,2) == 1`
  is a 50% block, `"7" and rand(1,3) == 1` a 33% spike, `"4" and rand(1,4) == 1` a 25% push block), and the entity pass. In
  Spelunky 2 the data left the code: a plain-text `.lvl` file per area, with the area's dials ("\-altar_room_chance 0 // 1/N
  chance of an altar room (default = 14)"), trap and monster chances ("\%arrowtrap_chance 35", "\+frog 30"), tile codes with the
  dice written in the code's name ("\?floor%50 2 // 50% chance of floor, 50% chance of empty"), and template tags (Spelunky 2 level
  file format as kept by the modding tool modlunky2, test fixture `crates/ml2_levels/tests/fixtures/test-level-in.lvl:5-100`).
- **Unit reused.** A room by its job: "0: a side room... 1: a room that is guaranteed to have a left exit and a right exit... 2...
  bottom... 3... top" (Kazemi part 1). "Each room type has typically 8 to 16 templates" (Kazemi part 2). Derek Yu: "Each room is
  selected from a set of room templates. Which set it's selected from depends on where the room lies on the path from the entrance
  to the exit. There are randomized 'chunks' in each room template that add some variation." (makegames, "The Full Spelunky on
  Spelunky"). Counted in the Mines code (measured, `scrRoomGen.gml:54-300`: start room line 54, end room 71, side 86, top-exit 153, drop 220, ground obstacle 266,
  air obstacle 288): start room 8 templates, end room 6, left-right path
  rooms 12, top-exit path rooms 8, side rooms 11, drop rooms 12, then 16 ground and 10 air obstacle blocks.
- **Variety.** Four nested dice: room type, template within type, obstacle block within template, tile within block. Kazemi's tool
  lets you re-roll each layer alone; "a relatively small obstacle block, when designed well, can create numerous scenarios". Spelunky
  2 adds tags: "!flip Flip the following template to make another", "!rare The next template is rare (only 5% chance of a rare
  template being used)", "!hard The next template is hard (only appear in the second two levels of the area)", "!liquid" (a budget
  on liquid rooms) (`test-level-in.lvl:99-105`).
- **Fairness.** The solution path is built first, so a route always exists (Kazemi part 1: "generating the level's solution path,
  before the spikes, arrow traps, enemies, and treasures are added"). Traps keep off the entrance: an arrow trap needs distance
  `n > 48` and not `(y == oEntrance.y and n < 144)` (`scrEntityGen.gml`, the `with oBlock` pass). And the hero's tools: "there are
  some challenges with randomized platform level design that are smoothed over by the implementation of destructible terrain and
  climbing tools" (Yu). Yu's own verdict: "You can't develop levels that are as good as hand-made levels, but it's exciting to run
  around in a dungeon that you know no one else has ever seen."
- **Tools.** A string in a script for Classic; a text file with comments and tags for Spelunky 2 (plain text means anyone can edit,
  diff and share it).
- **What failed / costs.** Cook (2020) on the trade: "in our experience adding PCG can actually increase the complexity of the
  development process", and that replayability and cost claims have no studies behind them. Yu's purpose was not replay but "to
  reduce the reliance on rote learning in platformers" (Cook, citing Yu's 2016 book).
- **New for us** (grep of `reference/`: no "rare template", no stage-gated template tag): the `!rare` and `!hard` tags. Our
  `SectionTemplate` has `weight`, `difficulty`, `phases` and `maxPerStage` but no rarity tier and no "not before stage N of the
  world" field (`types.ts:325-362`).

### 3.2 Dead Cells (Motion Twin, 2017-2018)

- **Data vs code.** Data: the fixed world map ("The overall design of the map of the island... All of this never changes no matter
  the loaded variant (seed)"), hand rooms ("tiles") in CastleDB, and one concept graph per biome. Code: the matcher ("For each node,
  the algorithm tries a random room... and tests to see if it complies with the instructions given by the graph... If it doesn't
  match, the algorithm tries another room"), the enemy budget, the loot (Bénard, Game Developer 2017; same text on deepnight.net).
- **Unit.** A room with a purpose, per biome: "A room designed to host a hidden treasure won't be the same as another hosting a
  merchant... rooms used in the prison aren't reused in the sewers. This allows us to give each level its own strongly defined
  identity."
- **Variety and fairness.** Per-biome graphs set "length of the level, number of specials tiles, how much of the biome will be a
  labyrinthine, how many tiles separate the entrance from the nearest exit"; "we made the ramparts much more straightforward and
  linear than the sewers." Enemies by budget per combat tile ("1 monster for every 5 tiles... some monsters being more dangerous...
  will count for 10 tiles, some can't be used more than once per tile or level, some can't be with other monsters on the same
  platform"). Pacing from the L4D AI Director idea: "dramatic peaks and relaxing 'breaks'".
- **What failed.** The first prototype: "the level design took a great big hit. In short it was illogical, chaotic and left you with
  no feeling of consistency or immersion in the world." Before that: "we went for the traditional, handmade way... we quickly
  realised that we wouldn't have the time to do it properly". Our ledger already holds this game (LEDGER-ENGINE-GEMINI E6, E7, E28);
  the primary source confirms it and adds the per-room-type purpose and the "monster costs N tiles" budget (we have a threat budget,
  `types.ts` CreatureDef.threat).

### 3.3 Super Meat Boy Forever (Team Meat, 2020) — not in any of our research (grep "Meat Boy": 0 files)

The closest shipped cousin to us: an auto-runner born as a phone design ("I wanted to see if I could make a Meat Boy game that felt
like Meat Boy that only used one button... always run and could change directions by jumping off walls", Refenes, GamingBolt 2021),
two buttons, hand chunks assembled by seed.

- **Data vs code.** Data: chunks, each "a section of a level that we've designed and decorated by hand. These are usually about the
  size of a Super Meat Boy level from the 2010 game. They have a defined start and a defined end... played through it to give it a
  par and a difficulty rating." Code: pick, order by difficulty, sum the pars. Both games split "the palette and level
  information": a chapter's art is one palette, a level is small data ("new level data which is anywhere between 5 KB and 50 KB";
  in Super Meat Boy it was "essentially run-length encoded", Isetta interview).
- **Unit and pool.** "A Level is a collection of 8 Chunks. Each Level has between 70 and 100 Chunks that it can choose from... 1-1 has
  their own collection of 100, 1-2 has 100" (dev-reported). Earlier: "40-60 mini-levels or chunks... PER LEVEL" (2017). Pool per
  slot: about 9-12 to 1 (estimate). "We have 300 in chunks in the first 3 levels of the game."
- **Variety.** No repeats across the save: "We keep track to avoid duplicates so you can play through the game several times and not
  see duplicate chunks." One seed per save: "each game save file itself has its own 'seed'" (AV Club). Bosses are fixed, not
  rolled (gemsbok: "The boss levels, meanwhile, are not randomized at all").
- **Fairness, and what failed.** "Originally levels regenerated each time you died... you would basically just play through until you
  got lucky enough to get to the end. That didn't feel right." The fix: "randomly selected based on their difficulty which was
  presented in a certain cadence and they didn't regenerate once you died... start the player out slow, ramp them up a bit, bring
  them back down, and then finish with a bang" (GamingBolt 2017). A checkpoint after every chunk (gemsbok). Critics still hit the
  join: "the level chunk approach means you can get stuck with an extremely difficult section only to get another one that's a
  cakewalk. The inconsistency really puts a hamper on the whole experience" (GamingTrend); "Zero flair and zero soul" (GameCritics).
  The defence (gemsbok): "at least one new mechanic is introduced in almost every single light world level."
- **Speed.** "there's about 7200 levels to make. So that take a lot of time and decoration" (Refenes 2019); "I... grossly
  underestimated the amount of time"; about four years "at a really healthy pace" (dev-reported).
- **For us.** Our "stage keeps its layout until cleared" (`layoutMemory.ts:7-13`) is SMBF's fix already. What is new: a pool many
  times the slot count, rated chunks, the cadence, and a save-wide no-repeat ledger. The failure to copy-proof: rated difficulty
  that does not match felt difficulty gives "inconsistent difficulty spikes" between neighbours; so the rating must come from the
  bots' measured play, not the author's guess (our `difficulty` is an author guess, 3.0 Run D).

### 3.4 Celeste (Maddy Makes Games / EXOK, 2018)

- **Data vs code.** Hand-made screens. In Maddy Thorson's words the method was holistic: "For Celeste we're making the game
  holistically, which is a fancy-sounding word for figuring it out as we go... We're always zooming in and out from level to area to
  full game perspectives to re-evaluate our work, and a lot gets cut or repurposed" (GDC 2017 Level Design Workshop preview).
  The engine is deliberately simple: "All colliders are axis-aligned bounding boxes... All collider positions, widths, and heights are
  integer numbers" (Celeste & TowerFall Physics), which makes every screen's numbers exact and reusable.
- **Fairness.** Forgiveness in code, not in levels: coyote time, jump buffering, half gravity at the peak, corner correction, "Wide
  Wall-Jump Window... 2 pixels from a wall", stamina refunds: "All are centered around widening timing/positioning windows, so that
  everything is fudged a tiny bit in the player's favor" (Celeste & Forgiveness). Our ledger has these (LEDGER-ENGINE-GEMINI E10;
  `physics.ts:40-43`).
- **Tools and constraints.** Noel Berry on the PICO-8 original: "Constraints forced us to find the core... We maxed out every limit"
  (MIGW 2025 report).
- **What it costs us to copy.** Hundreds of hand-tuned screens: our ledger already calls this "this is us now" (E11). I could not open
  the GDC talk itself (section 1); nothing below relies on it.

### 3.5 Shovel Knight: Specter of Torment (Yacht Club, 2017; deep dive 2020) — not in our research (grep "Shovel": 0 files)

The most concrete written method from a shipped hand-made platformer I found.

- **Data vs code.** Rooms (screens) made in their level tool, with per-object properties ("we have to set that Cogslotter's SPAWNTYPE
  to SINGLE_KILL"); code is the mobility and the objects.
- **The unit and the budget.** "Each level should have about 26 regular rooms and 6 secret optional rooms. This formula was counted
  roughly from Mega Man (which has 25 rooms)... A consistent length means that every stage will take a similar amount of time."
  "Each level starts with about 5 enemies and 5 objects planned. Some enemies and objects are used every level... Those don't count!
  ... No unitaskers allowed!" (Part 1).
- **Variety.** Game-wide cooldown on worn-out ideas: "We felt we'd seen enough weighted platform puzzles in the Lich Yard... We put
  these elements 'on cooldown' for Specter and did not include them." Look: Plague of Shadows failed here, "a screenshot of a Plague
  of Shadows level looks incredibly similar to a screenshot of a Shovel Knight level", so "we decided to make an additional tile set
  theme for each level". Ingredients move to where they work: "It's more important that an entire level's ingredients work in
  unison than it is to retain one cool idea!" Stage shape follows theme: Flying Machine rooms "stacked on top of one another", Lost
  City "headed downward"; "as the game progresses the levels start flatter and grow more towering".
- **Teaching an enemy** (Part 2, Grapps): first room safe and legible (a ceiling stops an off-screen jump), then a pit, then "the
  'test' of the room", then "a little cooldown to relax" with a secret, then a mixed room, then the long final test. "Each room is a
  little Zen garden." "about 10% of our design process involves thinking up fun scenarios, and about 90% involves wrangling with the
  spacing requirements". "Buffer space is needed at the entrance and exit of each screen so you feel safe entering new rooms."
- **Ramping.** "Every moment of gameplay, big or small, is ramping up then cooling down, cyclically." Three structures named: Mega
  Man/Shovel Knight (introduce, complicate, layer, test, cool down, all combine before the boss), Mario ("easing up and giving the
  player a playground... This is what makes Mario levels feel 'playful'"), Donkey Kong Country ("a single idea, with the difficulty
  and complexity constantly ramping upward for the entire level... 'tense'"). And a warning: "If you take the escalation of your
  setups too far… that can lead to some robotic-feeling or predictable level design."
- **Passes** (Part 4): blocker, custom properties, speedrunner ("As soon as you enter the room, they're always positioned in the ideal
  spot"), background art ("the moving platforms... all have tracks drawn into the background", "the background fades to black right
  above [a bottomless pit]"), screen shake, 3D. Part 3: pickups placed as signals ("Gems as Breadcrumbs", "Gems as Safety... tell the
  player that it's safe to fall down here"), and "we removed nearly half of them".
- **Speed and what failed.** "The levels in Specter Knight's campaign took the greater part of a year"; polish "about 4 intensive
  months" (dev-reported). Planned 50:50 new to reused, got "closer to 95:5"; reusing Specter's levels for King Knight failed: "we
  ended up starting from scratch again". Tool pain: "adding a small bit of length means having to shift the remaining components of
  the level over... this was an all too frequent and tedious level design task".

### 3.6 Donkey Kong Country Returns (Retro Studios, 2010)

- **Process.** An open grade board: "all the names of the levels were written on [the whiteboard]. We adopted a system of evaluating
  the status of the levels with symbols like ○ or △ or × and trying them over and over until they all had a ◎ mark" (Tanabe,
  Iwata Asks). Grades drift as the bar rises: Cliff was "the most fun", then "after all the other levels had been redone... the
  least fun!", so it was remade (Kynan Pearson).
- **Per-level surprise.** "One of our goals from the beginning was to create these memorable moments... the goal is to try to create,
  at some level, a memorable moment in every level" (Tanabe, Game Developer 2011).
- **A single enemy can cost a boss.** The stacked hairy enemies took remakes until "that spot was turning out to be as much work as
  making one boss!"; the fix was a readable tell: "if you don't get pretty close to them, nothing happens, but if you get too close
  and don't get away quickly enough, you're a goner" (Tabata).
- **Structure.** One idea per level ramping all the way (Yacht Club's reading, 3.5).

### 3.7 Hollow Knight (Team Cherry, 2017)

- **What failed first.** Room shuffling: "we'd make all these prefab rooms and they'd be rearranged... Those were the potential exits
  and stuff, that we had to account for... S1, S2, S3, that's secret 1, 2, 3. Each one of those could be taken up by a grub, or
  nothing, or a chest." Gibson: "It was a headache. It wasn't fun." Pellen: "It wasn't fun from a storytelling perspective, and wasn't
  fun from a technical or design perspective" (PC Gamer). That is exactly the Spelunky/gen2 shape, abandoned for a hand world.
- **Tools and speed.** "The whole world is just built from black tiles that are 64x64 pixels. They're very quick to paint in, and from
  there we can just hit play"; "a world was two days to do the tiles, based on the sketches, and then another four days to do the art
  pass... probably, 85%, 90% there"; then one person's interactivity pass: "I spent a month, at one point, just making every enemy in
  the game, just in one block. So then I'd have a pallet, and I'd go through each area, a week maybe?" (dev-reported). "There was no
  time for" tiling, enemies, iterating and dressing in the textbook order.
- **Variety.** "We tried to have a really diverse range of enemies, so even when you're just kind of seeing the world... you stumble
  across a room you missed last time, and it's got a weird, fat enemy that doesn't exist anywhere else." Simplicity let parts join:
  "because they all had that same pedigree and simplicity, when it came time to move those things together, nothing was discordant."
  A cut for the player's head, not the schedule: the Bone Forest went because "potentially another very, very large area was just
  pushing people too far".

### 3.8 Ori (Moon Studios, 2015, 2020)

- **Tools and gate.** "Our world-building tools for our design department were honestly quite simplistic... start with a strong
  concept on paper. Then we move on to the blockout phase where we simply draw polygons... present your level to other designers to
  get harsh and honest feedback. Repeat that process a few times until everyone loves the blockout level and then it eventually gets
  the 'design approved' stamp" (Mahler, Game Developer 2020).
- **Cost.** "Creating Ori and the Blind Forest's prologue ultimately took us a whopping 8 months" (Mahler 2023). "300+ levels" in Will
  of the Wisps; speedrunners hired to find breaks.
- **What failed.** "we even tested if procedural enemies or procedural locomotion would work in Ori... and we failed pretty dang
  hard... every enemy behavior tree had to be considered separately."

### 3.9 Rayman Origins, Legends, Jungle Run (Ubisoft Montpellier / Pastagames) — the rational-design method is not in our research

- **Tools.** UbiArt began as a pattern tool: "Artists make some patterns, like samples, and we use them to quickly model levels, as to
  have a forest, for example. Everything started from this tool" (Ancel, Game Developer 2011). Music levels: "a system was put in
  place, allowing us to write kind of a music sheet which the level designers would be able to use as a grid in order to 'rhythm'
  their levels" and "footsteps sounds were all getting snapped on the music's semiquavers beat" (Dumas, Designing Sound).
- **Method** (McEntee, "Rational Design: The Core of Rayman Origins", 2012): mechanics broken into inputs and "atomic parameters",
  each studied at five values, "No influence on difficulty (simply written as ˩), easy, normal, hard, and impossible (simply written
  as ∞)... there is no such thing as a vague atomic parameter." Teaching in "exposition, validation and challenge"; validation "in a
  safe area, blocking the player's progression to force learning". Variety, subtractive: "rather than adding new mechanics and new
  learning, remove half of the mechanics the player has become comforted by". A "variety matrix": list "all the abilities, tools,
  activities, time and space options, and then each row consists of x's and o's in a random configuration, with the result being the
  possible gameplay variant." "Exotic" levels "need to be sparse"; one-off modes like the shooter levels. A forced-scroll level made
  simple on purpose: "I had to compensate and make the challenges quite simple, almost as simple as the challenges found in the
  second or third level". Readability: "all of the dangerous gameplay elements from all of the varied worlds in the game share a
  similar spiky silhouette"; "All platforms share a yellow-green color across all the different worlds".
- **Speed.** Jungle Run (phone, one-touch, 40 levels): "the team of 11 designers from the Rayman team... were put on a mission to
  design most of the game's 40 levels over the course of a week, during which I designed three levels" (McEntee portfolio,
  dev-reported): about 3-4 levels per designer-week (estimate). The levels "are split into four groups (Jump, Fly, Wall Run & Punch)
  based on a new mechanic that is introduced for each batch" (IGN). This was possible because the mechanics, art and tool already
  existed from Origins.
- **What failed.** Ancel: "We had some levels no one could even play, but the level designer himself!... I began to repeat to myself
  how important it was that someone like me could finish the game."

### 3.10 Nintendo: Super Mario Bros. (1985), Maker (2015), Run (2016), 3D Land (2011), Wonder (2023)

- **1985 tools and speed.** "We would draw the stage layout on graph paper and hand it to the programmers. The next day, it would come
  back as a playable level... For corrections, like 'move this block up one space,' we would place tracing paper over the original."
  "They almost never clicked on the first try... when you build it yourself, you inevitably make it too hard. The basic stage known
  as 1-1 was actually something we came up with at the very end" (Tezuka, shmuplations). Whole game about six months.
- **Maker.** Born from the tools team: "the idea behind Mario Maker came from our internal tools team. They were working on a
  prototype for a Mario course editor... started playing with that and thought it was really fun" (Tezuka, NWR). Miyamoto: the
  internal tools "use a keyboard and mouse" and the Maker tools "are probably 10 times, even 100 times more powerful than those
  original course-making tools" (Time 2015). Instant edit-play is the speed: "you can be playing and pause and make a change and
  resume playing right there". And the lesson Tezuka drew at GDC 2024: players had the same parts, yet "some of them were not very
  good!" — "whether they come alive or fall flat is dependent on the level designer" (Eurogamer).
- **Run (phone, one thumb).** From speedrun videos: "they tend to run all the way through the course without ever stopping". Skill
  through objects, not inputs: "having those styles of jump be controlled not through a combination of controls but through special
  blocks that enable Mario to do special jumps at certain times in the level" (Miyamoto, Wired). Replay of one course by coin sets:
  "slight changes to the timing of their taps in order to get all of the colored coins" (Time 2016).
- **3D Land.** Hayashida moved from "lots of different gameplay concepts in a single stage" (Galaxy) to "a very clear concept on a
  stage" kept through it, then the four-part kishōtenketsu; the twist is the point: "That ten [twist] that really surprises people"
  (Eurogamer 2015). Already in our research (GEMINI-PCG-RESEARCH.md:34); now verified against a quote.
- **Wonder — the admission behind "everything feels the same".** Mouri: "Previous 2D Mario games featured variations of challenges
  that would scale up in difficulty as players progressed. This time, though, we decided not to focus on creating such variations
  but rather on offering a large number of surprises... I wanted to include at least one element in each course that would surprise
  or delight players." Hayashida: "What used to be wondrous back then is no longer wondrous today, neither for players nor for us
  developers." Ideas: "over 2,000" sticky notes; filters: "a connection between pre-Wonder Effect and during the Wonder Effect",
  "having players suddenly be able to do something they couldn't before", "having it be explained simply with one short phrase"
  (GDC 2024 via Eurogamer); test teams of "one game designer, one artist, one programmer, and one sound engineer"; "more than half"
  of prototyped ideas cut; badges as course modifiers ("over 20 different badges... top picks from more than 50 prototypes").
  Rhythm, from the sound side: "the level designers didn't know much about beat or meter, and the sound team wasn't familiar with
  level design... we came up with a course where you make your character jump on every fourth beat" (Kondo, Ask the Developer 2).
  Process: "In 2D Mario games, you spend as much time as possible adjusting courses until the end of development".
- **The criticised one: New Super Mario Bros. U.** "recycles the old ideas belonging to the 3 previous 'New' Mario titles and creates
  one uninteresting, but familiar, Mario game... Mario's cost effectiveness during development because of reusable art assets and an
  already established game engine" (Dual Analog 2012). Wonder's interview is Nintendo's own answer to it.

### 3.11 N++ (Metanet, 2015-2016)

- **Unit.** A single-screen level, "each level being a little bespoke arena to dance in".
- **Volume and what ran out.** "after more than 4500 levels made during N++'s development, we're out of ideas" and "before N++ we'd
  already made several thousand levels, and we were running low on ideas!... As level designers we desperately needed 'fresh blood'
  to give us more possibilities" — answered with "6 new enemies" (Game Developer 2016). 2,360 levels shipped at the 2015 launch count
  (U of T). So about half of what was made shipped (estimate from the two numbers, different dates). Same lesson as Matt's rule:
  variety comes from more pieces, not more layouts of the same pieces.

### 3.12 BIT.TRIP BEAT (Gaijin, 2009) and Alto's Adventure (Snowman, 2015), short

- BIT.TRIP: rushed content shows: bosses "had to be done in roughly two to three days. As you can imagine, that doesn't lead to well
  thought out design... they definitely feel rushed" (Neuse postmortem). Weekly audits worked: "Nearly every Friday, we would sit down
  and do an audit of the game, tearing it apart discipline by discipline."
- Alto's: generated terrain plus changing conditions plus a task layer: "the mountain is procedurally generated and the weather and
  time of day are always changing. In addition, at the start of a run the player is assigned three objectives" (Game Developer case
  study). Note against Matt's rule (STAGE-RULES §0c.5, petals never count as variety): a task layer changes a replay, not a first play.

### 3.13 How fast teams made a level (all dev-reported unless marked)

| Game | Unit | Reported speed / volume |
|---|---|---|
| Super Mario Bros. (1985) | course on graph paper | next-day turnaround per edit; game in about 6 months |
| Super Meat Boy Forever | hand chunk, 8 per level | 70-100 chunks per level; "about 7200 levels to make"; about 4 years |
| Shovel Knight: Specter | 26 + 6 rooms per level | "greater part of a year" for the levels; polish "about 4 intensive months" |
| Hollow Knight | area of tiled rooms | tiles 2 days + art 4 days per area to "85%, 90%"; enemy pass about a week per area |
| Rayman Jungle Run | phone level | 11 designers, most of 40 levels in about a week (≈ 3-4 per designer-week, estimate) |
| Ori | prologue | 8 months for one sequence |
| N++ | one screen | 4,500+ made, 2,360 shipped (estimate: half kept) |
| BIT.TRIP BEAT | boss | 2-3 days each, felt rushed |
| Ours, World 1 (measured, git) | beat-traced stage in TS | 1-2 + 1-5: 1,349 lines, 32 commits over ~7.6 h; 1-1: 602 lines, 13 commits over ~7.5 h (overlapping) |

---

## 4. Ideas none of our research mentions

Checked by grep over `reference/` (`*.md`, `*.txt`) for each name or term; each is absent or only named in passing.

1. **A hard per-stage no-repeat cap, enforced by construction, with a pool sized to the slots** (SMBF; Shovel Knight "magic trick
   twice"). Our rule exists on paper (STAGE-RULES §0c.2) but the code breaks it in 355 of 368 shipped rolls (3.0 Run C). New is the
   enforcement and the pool math: before a stage is laid, count distinct eligible templates per phase against the slots per phase;
   if fewer, the engine refuses and names the missing pieces (Matt's "build more pieces, never reroll"), and the stage's length
   comes from its units, never from filling a clock (today's Pass 3 fills to a clock, `pipeline.ts:702`; with a cap of 2 no roll of
   6-2, 8-6 or 8-9 builds, 3.0 Run F, which is exactly the missing-pieces list the engine should print).
2. **A save-wide ledger of shown units** (SMBF "We keep track to avoid duplicates"): a unit seen anywhere in this save is out of the
   bag until the world's pool is spent. Ours is per stage (cooldown 4, `pipeline.ts:766`), plus the stage before's closing sections
   (`recent`, `seeds.ts:36-37`), plus `WorldOnce` for sub-block versions nobody uses (`pipeline.ts:778`).
3. **Rarity and position tags on units** (Spelunky 2 `!rare` 5%, `!hard` "only appear in the second two levels of the area"): a rare
   unit makes a stage feel special when it appears; a stage-gated unit lets the world grow without a new mechanic.
4. **Ubisoft's rational design kit**: five-value atomic parameters (none/easy/normal/hard/impossible, each a number); a safe,
   blocking validation beat between exposition and challenge; subtractive variety (take half the moves away for a stage); the
   variety matrix (random x/o rows over abilities, tools, activities, time and space to force combinations nobody would pick).
5. **One named surprise per stage, with Wonder's three tests** (link before and during; you can suddenly do something new; it says in
   one short phrase), and DKCR's "a memorable moment in every level". As data: `signature` on each stage spec, unique across the game.
6. **An open grade board per stage, re-graded after later stages improve** (DKCR ○△×◎; Cliff went from most fun to least). Nintendo
   and Yacht Club both loop back to early levels; Tezuka made 1-1 last. For us: build each world's first stage last, and re-run the
   quality grade of earlier stages after every later one ships.
7. **Shovel Knight's level budget as a stage contract**: about 26 rooms + 6 secrets (from Mega Man's 25), 5 new enemies + 5 new
   objects per level, "no unitaskers", every element interacts with the others, and a game-wide "on cooldown" list for exhausted
   ideas. Plus the finishing passes as automatable checks (blocker, spawn properties, speedrunner timing, background-art signals,
   screen-shake buffer art).
8. **Skill carried by level objects for a one-thumb game** (Super Mario Run's special jump blocks): advanced moves come from a block
   or prop at a place, not from an input combination. Fits our touch-only rule.
9. **Ratings from play, not from the author**: SMBF's critics show what an author's difficulty rating does when it is wrong
   ("extremely difficult section only to get another one that's a cakewalk"). Our template `difficulty` is an author's 1-10
   (`types.ts:330-331`); rate it from the bots' measured deaths and time instead.
10. **Grey approval before art, as a stamp** (Ori's "design approved"; Hollow Knight's black tiles first). A stage spec passes the
    bots and the lead's look in grey before any Hugging Face art is chosen for it, so art money is not spent on a layout that changes.

---

## 5. Mistakes others made that we must avoid

1. **Shuffling prefab rooms with exit sockets and secret slots, without a designed path** (Hollow Knight's jam version: "It was a
   headache. It wasn't fun"; Dead Cells' first prototype: "illogical, chaotic"). Both fixed it with more hand structure: a fixed map
   and graph (Dead Cells), or no generation (Hollow Knight).
2. **Re-rolling the level when the player dies** (SMBF's first version: "play through until you got lucky"). We already keep a
   layout until cleared (`layoutMemory.ts:7-13`); keep it.
3. **Neighbouring units with mismatched difficulty** (SMBF's reviews: "inconsistent difficulty spikes"). Rate from play and smooth
   the cadence at the joins.
4. **The same unit many times in one level, because length is filled to a clock from too few units** (our own gen2: up to 14
   uses of one template, 3.0 Run C; Pass 3 fills each node to its share of the seconds, `pipeline.ts:702`). SMBF fixed the count of
   units per level (8) and Shovel Knight the rooms (about 26); the time follows from the units.
5. **A flat difficulty after the opening** (our 8-6: 6-7 from slot 3 on, 3.0 Run D) where every shipped method ramps and cools.
6. **A sequel that looks the same in a screenshot** (Plague of Shadows; NSMBU "recycles the old ideas"). Each world needs its own tile
   set and its own ingredients, which our §0c.7 already asks.
7. **Procedural enemies or locomotion** (Ori: "failed pretty dang hard"). Keep creatures hand-made with simple, readable tells.
8. **Designers who can beat only their own levels** (Ancel); "when you build it yourself, you inevitably make it too hard" (Tezuka);
   Yacht Club: "We almost always make the game too difficult, then pull back". Our kid and first-timer bots and Matt's play are the
   counter; keep them before the lead's own judgement.
9. **Rushing a piece in 2-3 days at the end** (BIT.TRIP's bosses "feel rushed"). Plan the pieces first (our §1c).
10. **A tool that makes small layout fixes expensive** (Yacht Club's shifting "dozens of art layers and objects... one piece at a
    time"; Tezuka's next-day graph paper). Our stages as hand code (1,349 lines for two stages) are this mistake; units as data with
    positions relative to their own anchors (gen2's sockets, "never a fixed x, y", `types.ts:7`) avoid it.
11. **Generating to save effort.** Cook: PCG "can actually increase the complexity of the development process"; Dead Cells and
    Spelunky generate for replay and against rote learning, and both still hand-make every unit. SMBF made "literally thousands" of
    chunks by hand. The engine saves layout effort only if the units are made once and used without repeats.
12. **Running out of ideas with the same pieces** (N++ after 4,500 levels needed "fresh blood": new enemies). Matt's rule already.

---

## 6. Sources actually opened (61 pages, 3 code repositories)

Code (cloned and read; untrusted copies kept in my scratchpad, not in the repo):
1. Spelunky Classic source (Derek Yu / Mossmouth, GameMaker; community HD port): https://github.com/yancharkin/SpelunkyClassicHD —
   read `scripts/scrRoomGen/scrRoomGen.gml` (488 lines), `scripts/scrLevelGen/scrLevelGen.gml` (304), `scripts/scrEntityGen/scrEntityGen.gml` (lines 60-175).
2. Spelunky 2 level-file format, community tool: https://github.com/spelunky-fyi/modlunky2 — read `crates/ml2_levels/tests/fixtures/test-level-in.lvl` (268 lines). A test fixture in the game's own format, not Mossmouth's file.
3. Our repo (gen2, World 1, layoutMemory, STAGE-RULES, ledgers), cited by file:line above.

Pages (all opened with the fetch tool and read in full unless noted):
4. https://tinysubversions.com/spelunkyGen/
5. https://tinysubversions.com/spelunkyGen2/
6. https://www.tumblr.com/makegames (Derek Yu's blog: "The Full Spelunky on Spelunky", "Firm, But Fair", the book post)
7. https://www.tumblr.com/makegames/41267990744/before-spelunky-i-started-a-simple-little (a tileset post; no level content)
8. https://arxiv.org/pdf/2004.01768 (Cook 2020, cites Yu's book)
9. https://www.gamedeveloper.com/design/building-the-level-design-of-a-procedurally-generated-metroidvania-a-hybrid-approach-
10. https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/
11. https://gamingbolt.com/super-meat-boy-forever-interview-a-meaty-return
12. https://gamingbolt.com/super-meat-boy-forever-interview-controls-levels-story-and-more
13. https://www.avclub.com/super-meat-boy-forever
14. https://www.theyoungfolks.com/video-games/131648/super-meat-boy-forevers-tommy-refenes-on-accessibly-challenging-game-design-pax-east-2019/
15. https://github.com/Isetta-Team/Isetta-Website-Raw/blob/master/docs/interviews/TommyRefenes-interview.md
16. https://gamecritics.com/jarrod-johnston/super-meat-boy-forever-review/
17. https://gamingtrend.com/reviews/frustrating-follow-up-super-meat-boy-forever-review/
18. https://thegemsbok.com/art-reviews-and-articles/super-meat-boy-forever-analysis/
19. https://maddythorson.medium.com/celeste-forgiveness-31e4a40399f1
20. https://maddythorson.medium.com/four-years-of-celeste-7dccdcc3f7f4 (no level content)
21. https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html
22. https://www.gamedeveloper.com/design/gdc-2017-level-design-workshop
23. https://www.gamedeveloper.com/design/video-the-level-design-of-i-celeste-i- (page only; the video could not be played)
24. https://explosionnetwork.com/celeste-in-conversation-with-maddy-thorson-noel-berry-migw-2025/
25. https://www.myperfectconsole.com/episodes/82 (no level content)
26. https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-1-5/
27. https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-2-5/
28. https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-3-5/
29. https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-4-5/
30. https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Donkey-Kong-Country-Returns/Iwata-Asks-Donkey-Kong-Country-Returns/3-A-Meeting-at-5-AM/3-A-Meeting-at-5-AM-212413.html
31. https://iwataasks.nintendo.com/interviews/wii/donkey-kong-country-returns/0/2/ (same interview, US text)
32. https://www.gamedeveloper.com/business/turning-nintendo-the-i-donkey-kong-country-returns-i-interview
33. https://www.nintendoworldreport.com/feature/25582/gdc-2011-retro-studios-donkey-kong-swinging-across-oceans (only the intro loaded)
34. https://www.pcgamer.com/how-to-design-a-great-metroidvania-map/
35. https://gameinformer.com/2018/10/15/the-making-of-hollow-knight
36. https://www.orithegame.com/qa-with-thomas-mahler-celebrating-8-years-of-ori-the-game/
37. https://www.gamedeveloper.com/design/q-a-designing-the-gorgeous-metroidvania-i-ori-and-the-will-of-the-wisps-i-
38. https://www.gamedeveloper.com/design/the-evolutionary-process-of-building-i-rayman-origins-i-
39. https://www.gamedeveloper.com/design/rational-design-the-core-of-i-rayman-origins-i-
40. https://designingsound.org/2017/12/06/rayman-fun-sound-music-an-interview-with-francois-dumas/
41. https://chrismcentee.com/portfolio-items/intern-level-designer-rayman-origins/
42. https://chrismcentee.com/portfolio-items/game-level-designer-rayman-jungle-run/
43. https://www.gamedeveloper.com/design/video-the-tools-used-to-design-i-rayman-legends-i- (page only)
44. https://www.ign.com/articles/2012/09/21/rayman-jungle-run-review
45. https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-1/
46. https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-2/
47. https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-3/
48. https://www.eurogamer.net/how-super-mario-bros-wonders-devs-narrowed-down-2000-ideas-for-its-effects (report of the GDC 2024 talk)
49. https://www.eurogamer.net/how-nintendos-best-mario-levels-were-structured-using-chinese-poetry (quotes Hayashida's Gamasutra interview)
50. https://shmuplations.com/supermariobros/
51. https://time.com/4030885/super-mario-maker-nintendo-wii-u/
52. http://www.nintendoworldreport.com/interview/37850/interview-with-takashi-tezuka-on-yoshis-woolly-world-mario-maker
53. https://www.gamedeveloper.com/design/lessons-of-game-design-learned-from-super-mario-maker (a player-designer's blog; secondary)
54. https://www.wired.com/2016/12/miyamoto-interview-2/
55. https://time.com/4594652/super-mario-run-shigeru-miyamoto-interview-iphone-apple-2016/
56. https://www.dualanalog.com/review-new-super-mario-bros-u-new-console-same-mario/
57. https://www.nintendolife.com/reviews/nintendo-switch/new_super_mario_bros_u_deluxe
58. https://www.gamedeveloper.com/audio/journey-of-4-thousand-5-hundred-days
59. https://www.utoronto.ca/news/ninja-n-video-game-takes-n-whole-new-level-make-2360-levels
60. https://www.gamedeveloper.com/design/postmortem-gaijin-games-i-bit-trip-beat-i-
61. http://www.harrynesbitt.com/blog/the-making-of-altos-adventure/
62. https://www.gamedeveloper.com/design/alto-s-adventure-case-study
63. https://80.lv/articles/altos-adventure-a-game-with-style
64. https://www.youtube.com/watch?v=4RlpMhBKNr0 (page loaded, no transcript in it)

Could not open (tried): https://www.gdcvault.com/play/1024307/Level-Design-Workshop-Designing-Celeste (Vault maintenance);
the same talk's transcript through youtube-transcript-api (proxy 403 for youtube.com), youtubetotranscript.com (bot-blocked) and
youtube-transcript.io (empty); https://old.reddit.com/r/NintendoSwitch/comments/7tuubc/ (login required);
https://www.yachtclubgames.com/blog/specter-of-torment-level-design-deep-dive-5-5/ (404); https://tcrf.net/Spelunky_2/Unused_Level_Data
(bot-blocked); https://gamedev.stackexchange.com/questions/79043/obstacle-spawn-constraints-in-jetpack-joyride (returned nothing).

---

## 7. Method update (LAWS 4; method file `reference/methods/research-ledger.md`)

- Worked better, with proof: running our own generator against the source's rule turned a soft idea into a hard number in minutes
  (355/368 rolls break §0c.2, 3.0 Run C). A research method step to add: "for every top lesson, write a 20-line script that measures
  our shipped stages against it, and paste the output".
- Worked better: when a page is big, saving the fetch result and reading it in parts kept every line read (Rational Design, 84 KB).
- Failed, and why: talk videos (GDC Vault, YouTube) are unreachable from this container; budget for written sources first and say
  so early. Proposed edit to `research-ledger.md` step 1: "Video talks cannot be fetched here (proxy blocks youtube.com; Vault may
  be down): name the talk as unread and look for the speaker's own written version."
