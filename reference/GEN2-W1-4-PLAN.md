# Worlds 1-4 onto the new generator (gen2): the plan

Written 2026-10-30 ~11:30 PM ET by a planning helper for the lead. Document only: no game code changed. Measuring script added:
`tools/inspect/spotMemory.ts`. Read with `reference/STAGE-RULES.md`, `src/game/gen2/DESIGN.md` (B9-B12, the World 6/7 checklist) and
`reference/LEAD-PLAYBOOK.md`.

---

## For Matt, in one paragraph

You're right, and now there are numbers on it. Worlds 1-4 are built from hand-made chunks that come in 2-4 versions each, and the
snakes and flowers are built into each chunk. So when a chunk comes back, its snakes are where they were. On 1-3, 98% of the snakes
are within a screen of the same spot from one roll to the next (2-5: 98%, 2-1: 97%, 2-9: 94%, 4-1: 91%). Each World 1 stage can only
come out 3 to 9 different ways (1-2 has just 3), so after three clears you've seen them all. On Worlds 6-7, which use the new
generator, most stages sit at 20-60%. The plan is to rebuild each of Worlds 1-4 the way Worlds 5-7 are built. Each world gets about
30 building blocks with empty slots, and the generator places the animals and flowers itself. We keep the 16 best checked rolls per
stage, and the roll after a clear is always at least half different from the one you just played. Each world keeps its lessons in
the same stage, its story and its boss. The climbs, the 1-8 chase and the 4-7 Long Drop keep their hand-built shape, but their
animals and flowers get rolled too. I'm also flagging that the new generator has the same problem on its own fight stages (5-9's
spiders, 7-1's frogs repeat their spots 73-94% of the time), so we fix that first, for every world. Size: about 30 helper-days of building (about 37 with re-checks and
merges). That's roughly 10 working days, with up to four helpers at once after a 2-day groundwork step. My recommendation is World 1 first, as the
pilot, because it's what every new player and every Play Store reviewer sees.

---

## 1. What we measured (run these yourself to check)

### 1a. Where things are: `tools/inspect/spotMemory.ts` (new)

`npx tsx tools/inspect/spotMemory.ts --rolls 16 --stages 1-1,...` builds each stage 16 times, the way the game builds it on entry.
Hand stages use era.ts's spread of layout numbers. Gen2 stages use their 16 shipped rolls, once each. Everything runs on Normal.
Every enemy and pickup is placed at its share of the way from the start to the shrine, and pairs of rolls are compared:

- **enemySpot**: the share of one roll's enemies that have an enemy of the same kind within 4% of the way in the other roll (about
  one phone screen). 1.00 means every snake is where it was last time.
- **trailSpot**: the same for pickup trails (pickups less than 1.5% apart make one trail), within 1%.
- **enemyOrder**: how alike the order of enemy kinds is (1 minus the edit distance).

Limits:

- It only counts `GeneratedStage.enemies`. The eagle (1-7, 4-5), prowler eyes and thorn vines in some W3 stages, and W4's falling
  rocks are proto extras, so those stages show `n/a`.
- Pairs where one roll has no enemies are left out.

Run 2026-10-30, 11:20 PM ET (raw: the TSV the command prints):

| Stage | built | enemySpot | enemyOrder | enemies per roll | trailSpot |
|---|---|---|---|---|---|
| 1-3 Branch Snakes | hand | **0.98** | 0.90 | 21-28 | 0.57 |
| 1-4 Up the Kapok | hand | 0.62 | 0.81 | 0-3 | 0.44 |
| 1-5 Where She Walked | hand | 0.58 | 0.57 | 1-14 | 0.41 |
| 1-6 First Lianas | hand | 0.44 | 0.56 | 1-10 | 0.54 |
| 1-8 The Long Branch | hand | 0.79 | 0.88 | 5-8 | 0.68 |
| 1-9 The Boa's Branches | hand | 0.80 | 0.80 | 17-22 | 0.62 |
| 2-1 Down to the River | hand | **0.97** | 0.96 | 0-14 | 0.53 |
| 2-2 Petals for the Crown | hand | 0.45 | 0.57 | 0-17 | 0.34 |
| 2-3 Stuck in the Reeds | hand | 0.80 | 0.96 | 0-13 | 0.42 |
| 2-4 Over the Water | hand | 0.83 | 0.85 | 0-11 | 0.38 |
| 2-5 River Snappers | hand | **0.98** | 0.80 | 20-42 | 0.33 |
| 2-6 Up the Bank Houses | hand | 0.43 | 0.68 | 1-4 | 0.61 |
| 2-7 The Mailman's Route | hand | 0.68 | 0.46 | 1-13 | 0.57 |
| 2-8 Before the Water Rises | hand | 0.25 | 1.00 | 0-4 | 0.52 |
| 2-9 The River King's Court | hand | **0.94** | 0.86 | 22-31 | 0.49 |
| 3-3 Footprints in a Circle | hand | 0.81 | 0.78 | 18-26 | 0.37 |
| 3-4 The Sinkhole | hand | 0.25 | 0.75 | 0-4 | 0.57 |
| 3-9 The Prowler's Ring | hand | 0.89 | 0.91 | 20-21 | 0.35 |
| 4-1 The Broken Ledge | hand | **0.91** | 0.88 | 0-16 | 0.40 |
| 4-6 Above the Mist | hand | 0.80 | 0.65 | 0-5 | 0.59 |
| 1-1, 1-2, 1-7, 3-1, 3-2, 3-5..3-8, 4-2..4-5, 4-7..4-9 | hand | n/a (no `enemies`) | | 0 | 0.32-0.82 |
| **gen2 baseline:** 6-3, 6-6, 6-7, 7-3, 7-6, 7-7 | gen2 | **0.19-0.24** | 0.36-0.51 | 0-11 | 0.39-0.61 |
| gen2 6-1, 6-2, 6-4, 6-5, 5-7 | gen2 | 0.49-0.64 | 0.44-0.74 | | 0.42-0.56 |
| gen2 fight stages 5-9, 6-9, 7-5, 7-9, and 7-1 | gen2 | **0.58-0.94** (5-9: 0.94, 7-1: 0.73) | 0.48-1.00 | 22-30 | 0.42-0.63 |

What this says:

1. **Matt's complaint is the enemies.** The fight stages of Worlds 1-4 (1-3, 1-9, 2-5, 2-9, 3-3, 3-9) and the creature runs (2-1,
   2-3, 2-4, 4-1) repeat 80-98% of their spots.
2. **gen2 alone does not fix fight stages.** Its non-fight stages sit at 0.19-0.24, but its purge and gauntlet top-up lays animals
   at fixed points. `fillSockets` places them on "the widest main-route pieces, round by round (middles, then quarters, then
   eighths)" (`src/game/gen2/DESIGN.md` B4), so a fight stage repeats its spots: 5-9 is 0.94. **Step G0 fixes this in gen2 for every
   world.**
3. **The trails differ less than the enemies, but they don't sit still either** (0.32-0.68 everywhere). The flowers "end up" in the
   same places mostly because they ride the same chunks. Gen2's petal arcs follow the jumps, so they will move when the jumps move.

### 1b. The order of moves: `tools/inspect/era.ts` (existing)

`npx tsx tools/inspect/era.ts --worlds 1-4 --rolls 40 --bots 0 --look 1` (287 s). This is diversity as STAGE-RULES §2 measures it:
mean 1 minus the cosine of action 3-grams.

| | stages | diversity |
|---|---|---|
| W1 | 1-1 0.37, 1-2 0.36, 1-3 0.35, 1-5 0.47, 1-6 0.26, 1-7 0.43, 1-9 0.35 | **1-4 0.12, 1-8 0.06** |
| W2 | 2-1 0.40, 2-2 0.47, 2-3 0.48, 2-4 0.41, 2-5 0.42, 2-7 0.40 | **2-6 0.03, 2-8 0.11, 2-9 0.20** |
| W3 | 3-1 0.48, 3-2 0.38, 3-3 0.43, 3-4 0.38, 3-5 0.40, 3-6 0.38, 3-7 0.35, 3-8 0.43, 3-9 0.36 | |
| W4 | 4-1 0.44, 4-2 0.48, 4-4 0.41, 4-5 0.44, 4-8 0.41 | **4-3 0.06, 4-6 0.22, 4-7 0.00, 4-9 0.26** |
| gen2 W5-7, all 400 rolls (`gen2/seeds.ts` `diversity.all`) | 0.26-0.55 | |
| gen2 W5-7, the 16 shipped (`diversity.shipped`) | 0.41-0.55; only 7 of 16 stages are at 0.50 or more | |

Two things follow. **First, this measure hides the problem.** The 2026-10-28 variety pass (`w1Sections.ts`, `w2Sections.ts`,
`w3Sections.ts`, `w4Sections.ts`) moved most W1-4 stages into the same 0.35-0.48 range as gen2's raw rolls. The order of moves
changes, but the spots don't. The `nearest` column is 0.94-1.00 for every W1-4 stage: in 40 rolls, every roll has a near-twin.
**Second, 0.5 between consecutive plays is above what W5-7 ship on average.** So the 0.5 rule has to be enforced in which roll
comes next, not only in curation (G0, step 2).

### 1c. How many different stages a roll can give (W1, W2)

World 1's picks are a pure function of the layout number (`w1Sections.ts:146` `w1Pick`). Each roll draws one "rhythm"
(`w1Sections.ts:153`), and the sections tagged with it are the only candidates, so most slots have a single choice per rhythm.
Distinct `w1Pick` results over layout numbers 1-3000:

| stage | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 1-6 | 1-7 | 1-8 | 1-9 |
|---|---|---|---|---|---|---|---|---|---|
| combos | 9 | **3** | 4 | 3 | 3 | 4 | 3 | 3 | 4 |

World 2 (`w2Sections.ts:134` `w2Picks`): 12 for every stage except 2-6 (3). World 3 (`w3Sections.ts:30` `W3_VERSIONS`): 2-3
versions in each of 5 sections, held to a theme. World 4 (`w4Sections.ts` `W4Roll`): 2-3 versions per section and a theme.
`layoutMemory.ts:113` `awayFrom` keeps the next roll off the last one's versions, for World 1 only. That's why Matt sees it repeat
after a handful of clears.

---

## 2. What gen2 gives a world (the W5-7 model)

A world on gen2 has these files (World 7 is the smallest complete example; World 6 the fullest):

| Piece | W7 file | What it is |
|---|---|---|
| Manifest + emitters | `gen2/worlds/w7.ts` (276 lines) | stage list and archetypes, `pit`, `moves`, creatures (tags, threat), props, `tips` (Dot's lines), `lessons` (what earlier worlds taught, e.g. `boa: '1-9'`, `w7.ts:179`), decor sets |
| Sections | `w7Ground.ts` (813), `w7Swing.ts` (351) | about 30 building blocks with sockets for creatures, props, pickups, flags and tips; sub-blocks with 2-3 versions; `teaches` / `uses` |
| Rooms | `w7Rooms.ts` (186) | the stage's puzzle rooms as `LocalRoomSpec`, required on every roll |
| Game kit | `w7Game.ts` (33) | one kit per stage and difficulty; `required` (`w7Game.ts:20`: the lesson section in its first Ki slot, and the rooms); `forStage` |
| Hook-up | `gen2/game.ts:59` `GEN2_STAGES` | one entry per stage; `finish` (Dot's first line per new animal) |
| Rolls | `gen2/seeds.ts` | 16 curated rolls per stage, from `tools/gen2/curate.ts` |
| Tests | `w7.test.ts`, `w7Rooms.test.ts`, `w7Game.test.ts`, `w7Swing*.test.ts` | DESIGN.md B12 step 6 |

Enemies and flowers are placed by pass 4 (`fillSockets`, DESIGN.md B4), not by the section. That covers creature sockets paid from
a threat budget, `poissonPlace` spacing, nothing in the first 5 s, and nothing near a safe spot. Pickups come in rows, then quota
items, then petal arcs over the jumps. **This is the change Matt is asking for.** The generator owns where the snakes go, and a
fresh roll moves them.

---

## 3. Groundwork before any world (G0, the lead or one architect helper, about 2 helper-days)

G0 runs first because every world depends on it, and two parts also improve W5-7 today.

1. **Rolled spots for fights (gen2 pipeline, `pipeline.ts` pass 4).** The purge/gauntlet top-up (DESIGN B4) currently fills "middles,
   then quarters, then eighths" of the widest pieces. Change it to draw spots from the roll's own stream, spaced by `poissonPlace`,
   with the same exclusions (opening seconds, rests, rooms, 400 px before a flag, under a stump). Then re-curate 5-9, 6-9, 7-5, 7-9
   and 7-1. Target: enemySpot 0.5 or under. **Curation changes for every gen2 stage of those worlds** (DESIGN B8: a pass-4 change
   means curating again), so it has to land before the W8-10 curation or be done again after it. Tell the lead before W8 curation
   starts.
2. **The next roll is at least 0.5 different (layoutMemory + seeds).** `curate.ts` writes, per stage, the 16x16 table of era
   distances and enemySpot between the shipped rolls. `layoutMemory.ts:113` `awayFrom` then picks for gen2 stages a roll whose
   distance from the last one played is 0.5 or more and whose enemySpot is 0.5 or under (random among those). Today it only avoids
   the same index (`layoutMemory.ts:118`). Curation drops any shipped roll that has fewer than 3 such partners. A test
   (`gen2/seeds.test.ts`) holds this for every gen2 stage.
3. **Spot memory in curation.** `curate.ts` imports `spotMemory.ts`'s measure (moved into a shared module) and reports it. The
   shipped set's mean enemySpot must be 0.5 or under.
4. **Seeds per world.** Split `gen2/seeds.ts` into `gen2/seeds/w5.ts` ... `w10.ts`, re-exported by `seeds.ts`. Today `curate.ts
   --out` rewrites the whole file, so four helpers curating at once would collide.
5. **Jump help in the gate.** The touch fairness tests have to pass with Jump help On, Off and On + forward (Matt, 2026-10-30, 4:45 PM
   ET). Today that was measured by editing `DEFAULT_JUMP_HELP` (`jumpHelp.ts:17`) in a scratch worktree. Add a test-only read, e.g.
   `SLOTH_JUMP_HELP=off|keep|forward` in `headlessDom.ts` passed to `?jumphelp=` (`jumpHelp.ts:29` already reads it). Then the gate
   is three runs of the suite. No game behaviour changes.
6. **Climbs: decide.** gen2 refuses an ascent (`missionGraph`, DESIGN B2; the upward flow, piece C, is deferred). Worlds 1-4 have
   six climbs (1-4, 2-6, 3-4, 4-1, 4-3, 4-6). Two ways:
   - **(A, recommended)** keep their hand-built shape. Add a **spot pass**: after the hand builder, strip its creatures and loose
     pickup rows and re-place them with gen2's creature and pickup placer on the stage's own platforms (the same exclusions, the
     same teach-first rule). About 1.5 helper-days, once, reused by 1-8 and 4-7.
   - **(B)** build gen2's upward flow (piece C) so climbs become gen2 stages. About 4 helper-days. Worth it only if W9's "last trees"
     or W10 needs it too. Ask the W9 builder before deciding.

---

## 4. World by world

Columns: what exists (builder `file:line`), what's taught there first, and what it becomes. **gen2** means a gen2 stage: sections,
rooms required, curated. **hand + spots** means the hand geometry is kept and creatures and pickups are rolled by the G0 spot pass.
**hand** means unchanged.

### World 1, The Trail (`protoStage.ts`, sections `w1Sections.ts`; art `protoArt.ts`, `protoAtlasData.ts`, `proto2/3AtlasData.ts`)

| Stage | Today | First taught here (must stay here) | Room | Becomes |
|---|---|---|---|---|
| 1-1 Into the Canopy | `protoStage.ts:1360`, `w1Sections.ts:238` | gaps `:1369`, stones `:1382`, **double jump** `:1392` (`dotTips.ts:26`), bounce mushroom `:1229` | - | gen2 |
| 1-2 The Petal Trail | `:1548`, `w1S:334` | follow the petals `:1555` | - | gen2 (harvest quota) |
| 1-3 Branch Snakes | `:1658`, `w1S:383` | **snake** punch `:1672`; rope guard `:1685`; shimmy card on clear (`skills.ts:37`) | - | gen2 (purge, top-up) |
| 1-4 Up the Kapok | `buildKapok :5307`, `w1S:437` | trunk climb `:5529`, **rope** `:5553` (shimmy required from 1-4, `skills.ts:38`) | squirrel lift `:5489` | hand + spots (climb) |
| 1-5 Where She Walked | `:1810`, `w1S:446` | **crumbling** `:1828` (`dotTips.ts:131`) | - | gen2; secret shiny `:1775` as a required section |
| 1-6 First Lianas | `'proto' :2406`, `w1S:506` | **liana swing** `:2411`; log push `:633`; tree climb `:588` | seesaw show/do/twist `:709/:727/:771` | gen2 (swing sections from `w6Swing.ts`'s kind; seesaw rooms required) |
| 1-7 A Very Good Bush | `:2009`, `w1S:557` | **eagle, bush hiding** `:2021` (`dotTips.ts:29-31`) | acorn meadow `:1971` | gen2 (stealth; the eagle as a world prop with a cover socket) |
| 1-8 The Long Branch | `buildLongBranch :6467`, chase patterns `w1S:670-681` | the chase `:6590` | - | **hand + spots** (the chase is a set piece; its 3 patterns become 6+) |
| 1-9 The Boa's Branches | `:2175`, `w1S:615` | **guard snake** `:2185` (`dotTips.ts:32`); snake-ring lock `:2197` | - | gen2 (gauntlet, top-up; snake-ring lock required, Dot explains it) |
| 1-10 Venom Fang | `bossDefs.ts:175` | | | hand (boss) |

Sections to author: about 30. Material: World 1 has about 90 version bodies across 9 stages (`w1Sections.ts:238-668`). They're
built from `W1Kit` calls (`w1Sections.ts:42`: `pillars`, `busy`, `dip`, `lowStumps`, `bounceWall`, `chain`, `canopy`, `bushRow`...),
so they're recipes, not data. Each recipe becomes a `SectionTemplate` with pieces placed by rule (DESIGN B3) and **its snakes and
petal rows turned into sockets**. Required sections (`WorldManifest.required`): 1-1's double-jump lesson, 1-3's first-snake lesson,
1-5's crumble lesson, 1-6's first liana and seesaw rooms, 1-7's first eagle bush, 1-9's ring lock. All go in the Ki slot, the way
`w7Game.ts:20` holds 7-1's tiles. World 1's `pit` is soft moss (no water in W1). Size: **8 helper-days** (kit 1, sections 3, rooms
1, hook-up and tests 1, curation 1, polish and screenshots 1), plus 1 for 1-8's spot pass and new patterns.

### World 2, The River (`w2Stages.ts`, `w2Sections.ts`; art `riverArt.ts`, `w2PropsData.ts`, `river.ts`)

| Stage | Today | First taught here | Room | Becomes |
|---|---|---|---|---|
| 2-1 Down to the River | `w2Sections.ts:323` | **drifting logs** `:341`, splash `:343`, deep water `:364`, **upstream** `:381`, water warning (`waterTeach.ts:20`) | - | gen2 (water pits; gen2's Easy water rule) |
| 2-2 Petals for the Crown | `w2S:540` | lily pads `:579` | ferry `w2Stages.ts:1010` | gen2 (harvest; ferry room required) |
| 2-3 Stuck in the Reeds | `w2S:653` | cages, swing `:709` | cage lift `w2Stages.ts:929` | gen2 (rescue; cage room required) |
| 2-4 Over the Water | `w2S:750` | **vine swing over water** `:764` | - | gen2 (swing over water: World 6's liana pieces, B11) |
| 2-5 River Snappers | `w2S:809` | **snappers** `:873`, shell kick `:878` | - | gen2 (purge) |
| 2-6 Up the Bank Houses | `buildKapok` village (`w2Stages.ts:102`, `protoStage.ts:5307`) | post climb `:5525` | - | hand + spots (climb) |
| 2-7 The Mailman's Route | `w2S:924` | **basket lift** `:967` (`dotTips.ts:38`) | basket lift | gen2 (lift as a required section) |
| 2-8 Before the Water Rises | `w2S:995` | **rising water** `:1017` | cage islands `w2Stages.ts:758` | gen2 (tide zone: World 6's `tide` zone, B11) |
| 2-9 The River King's Court | `w2S:1065` | **spear guards** (`dotTips.ts:39`); bell gate `:1121` | bell gate `w2Stages.ts:1053`, gallery `:1086` | gen2 (gauntlet; bell gate and gallery required; Dot explains the gate) |
| 2-10 Crocus Rex | `bossDefs.ts:282` | | | hand |

World 2's river pieces (logs that drift, rivers, ponds, posts: `w2Stages.ts` kit) are engine-side and new to gen2. Drifting logs,
lily pads and the ferry need a `PieceShape` or a prop with an emitter, the way World 6 added `liana`. The flavour and `W2Look`
dressing (`w2Sections.ts:26`) becomes the world's decor sets through `artRoll.rollLook`. Size: **8 helper-days** (river pieces in
the pipeline add about 1).

### World 3, The Grotto (`protoStage.ts:2972-3800`, `w3Sections.ts`; art `w3Art.ts`, `w3PropsData.ts`)

| Stage | Today | First taught here | Room | Becomes |
|---|---|---|---|---|
| 3-1 Into the Grotto | `:2972` | **spores** `:2997`, **darkness** `:3005` | - | gen2 |
| 3-2 Glowworm Path | `:3026` | **eyes and fern hiding** `:3054` (`dotTips.ts:44`), glowworms | glow `:2829`, plates `:2778` | gen2 (stealth; rooms required) |
| 3-3 Footprints in a Circle | `:3102` | **prowler** `:3120`, **jaguar** `:3141` | - | gen2 (purge) |
| 3-4 The Sinkhole | `buildSinkhole`, `w3Sections.ts:150` | root climb `:296` | - | hand + spots (climb) |
| 3-5 Sleeping Vines | `:3307` | **thorn vines, freeze** `:3317` | lure bell and pebbles `:3274/:3297` | gen2 (thorn vine as a hazard prop) |
| 3-6 Grandma's Things | `:3380` | **search a rustling fern** `:3395` (`dotTips.ts:51`) | - | gen2 (relic quota) |
| 3-7 Which Fern? | `:3556` | search while still `:3573` | which-fern `:3509` | gen2 (room required) |
| 3-8 Thorn Vine Swing | `:3648` | **thorn-vine swing** `:3658` (`dotTips.ts:50`) | - | gen2 (liana with a thorn socket) |
| 3-9 The Prowler's Ring | `:3760` | prowler-ring lock `:3800` | - | gen2 (gauntlet; ring lock required) |
| 3-10 Shadow Prowler | `bossDefs.ts:418` | | | hand |

World 3 has the most stages on the move (8 of 9) and the underground light rule (STAGE-RULES §4: light from sources). The grotto's
floor and roof dressing (`w3Sections.ts` header) has to go through the world's `decorate` hook. Watch the perf scenario `3-3` in
`tools/perf/limits.json` (3-3 is the `drawImageScreens` worst case, 7.22 of 7.5). Size: **8 helper-days**.

### World 4, The Falls (`protoStage.ts`, `w4*.ts`; art `w4Art.ts`, `w4FallsArt.ts`, `w4FallsData.ts`, `w4Grit.ts`, `w4GritData.ts`, `w4PropsData.ts`, `waterfalls.ts`, `sovereignArt.ts`)

| Stage | Today | First taught here | Room | Becomes |
|---|---|---|---|---|
| 4-1 The Broken Ledge | `buildKapok(cliff)` `:5307` | **falling rocks** `:6165`, patience frond `:5996`; **glide** card on clear (`skills.ts:50`) | knot pulley `:5489` | hand + spots (climb) |
| 4-2 First Glide | `:4056` | **glide** `:4068`, **wind and chimes** `:4092` | - | gen2; leaf secret `:3905` as a required section |
| 4-3 Waterfall Steps | `w4Stage43.ts:81` | water push `:262`, surge `:304`, boulder `:351` | - | **hand** (set piece, no variety target: STAGE-RULES §2) |
| 4-4 Crosswind | `:4625` | wind on swings `:4647`, **Dot's knot** `:4711` | - | gen2 (wind zone on lianas) |
| 4-5 The Sovereign's Dive | `:4164` | **Sky Sovereign** `:4363`, waterfall veil `:4371` | - | gen2 (stealth with the eagle) |
| 4-6 Above the Mist | `buildKapok(mist)` `:5307` | **mist** `:5698`, **eaglets** `:5795` | pinwheel `:5636` | hand + spots (climb; 0.20 accepted, STAGE-RULES §2) |
| 4-7 The Long Drop | `w4LongDrop.ts:68` | warm air, cave drop, grit (`dotTips.ts:76-78`) | - | **hand** (set piece, no variety target); spot pass for its pickups only |
| 4-8 Nests on the Cliff | `:4775`, `w4Nests.ts` | **netting and nests** `:5004`, capuchin guard `:5047` | capuchin trade `:4960` | gen2 (rescue; trade room required) |
| 4-9 The Aerie | `w4Stage49.ts:65` | (finale: reprises every idea) | - | gen2, with a required reprise spine (0.27 accepted today; aim for 0.35 or more) |
| 4-10 Sky Sovereign | `bossDefs.ts:768` | | | hand |

World 4 has only 5 gen2 stages (4-2, 4-4, 4-5, 4-8, 4-9), but it has the hardest pieces: wind zones, mist, the glide (`skills.ts`:
required from 4-7), Normal's sharper tuning (`w4Normal.ts`, LV-2: bands W4 at 40 or more), and the catch rule for falls in climbs
(`w4Catch.test.ts`). Size: **6 helper-days**, plus 1 for the spot pass on 4-1, 4-6 and 4-7.

### What stays hand-built, in all four worlds

- Bosses: 1-10, 2-10, 3-10, 4-10.
- Set pieces: 1-8 (chase), 4-3 (waterfall), 4-7 (long drop).
- Climbs: 1-4, 2-6, 3-4, 4-1, 4-6 (unless G0.6 picks B).
- The extra stage 4-D (`extraStages.ts:14`).

All of these except the bosses and 4-3 get the spot pass, so their animals and flowers move.

---

## 5. What must not change

- **Teaching.** Each mechanic is first taught in the same stage as today (tables above, `dotTips.ts:25-82` `FIRST_OF`), before it
  can hurt. In gen2:
  - the teaching section is `required` in the Ki slot;
  - later sections `uses` it;
  - `manifest.lessons` lists what earlier worlds taught (W2's manifest: `snake: '1-3'`, `swing: '1-6'`...);
  - the skills stay where they are: shimmy taught by clearing 1-3 and required from 1-4, glide taught by clearing 4-1 and
    required from 4-7 (`skills.ts:37-52`).
- **STAGE-RULES §1, on every shipped roll:**
  - 2 minutes or more (climbs count 20 s short);
  - crumbling never required (`checkStage` checks the stage again without fragile pieces, as for World 7's tiles);
  - straight up or down on a vine always climbs;
  - nothing hurts in the first 5 s;
  - Dot explains every locked exit (1-9 and 3-9 ring locks, 2-9 bell gate: a room's `tips.enter`).
- **The world's band** (STAGE-RULES §1b; DESIGN B1 `D_base` 10 for W1, rising). Easy gentler, never empty.
- **The touch fairness tests pass with Jump help On, Off and On + forward** (G0.5). No stage needs On + forward.
- **Perf limits** (`tools/perf/limits.json`): scenarios `1-4`, `2-6`, `3-3` and `4-1` are W1-4 stages. 3-3 moves to gen2, so its
  scenario builds a gen2 roll and must stay under every limit (3-3 is already the drawImageScreens worst case). The other three are
  climbs and keep their geometry.
- **Story.** Stage ids, names and goal text (`stagePlan.ts:29-70`) stay the same. Wayside lines are keyed by world and stage
  number (`wayside.ts:63-135`, saved as `sloth_way_<w>-<m>`), not by x, so they carry over. Dot's in-stage lines that today sit at an
  x in a section (`k.hint(x, ...)`) become each section's tip sockets. Secret shinies (1-5 `:1775`, 1-6 `:840`, 3-9, 4-8 `:4927`) and
  4-2's leaf secret become required sections.
- **Art.** Every prop of Matt's W1-4 sheets stays drawn (`artDress.test.ts` fails on an undrawn kit piece). Each world's decor sets
  rotate through `artRoll.rollLook`. Backdrops go through the day (`stageBackdrops.ts`).

---

## 6. How we know a world is done

Per world, all on the lead's re-run (STAGE-RULES §5), not the helper's word:

1. `npx tsc --noEmit -p .`, then the full suite (CLAUDE.md), plus `npx tsx --test src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts`.
2. **The suite three times**, with Jump help Off, On and On + forward (G0.5).
3. **Curation:** `npx tsx tools/gen2/curate.ts --stages N-1,... --rolls 400 --keep 16 --apart [--rooms 8]`, writing
   `gen2/seeds/wN.ts`. Every one of the 16 rolls per stage passes levelCheck, the clock (2:00 for the quick player, Easy too), quiet
   4 s or under, the kid bot (85%) and the adult bot (70%).
4. **Variety:** the shipped set's era diversity is 0.35 or more (`game.test.ts:49`). **Every shipped roll has at least 3 partners
   0.5 or more away with enemySpot 0.5 or under, and layoutMemory always deals one of them after a clear** (G0.2; tested in
   `seeds.test.ts` and `layoutMemory.test.ts`).
5. **Spot memory:** `npx tsx tools/inspect/spotMemory.ts --stages <the world>` gives mean enemySpot 0.5 or under on every gen2 stage
   and spot-pass stage. Today: 0.80-0.98 on the fight stages.
6. **First-timer bot:** `npx tsx tools/inspect/inspect.ts --worlds N --firsttimer --seed S` for S = 1, 2, 3: tip before hazard, no
   hurt in the opening seconds, goals met. Easy goals come from the kid first-timer (DESIGN B12 step 9).
7. **Bands:** `tools/inspect/bands.ts`. Each stage is inside its world's band, and the world sits above the one before it.
8. `npx vite build` (no asset over 4 MiB), `node tools/perf/artcheck.mjs`, `node tools/perf/drawcheck.mjs`.
9. **Polish (STAGE-RULES §5b):** screenshots of 4 shipped rolls per stage, upright (390x844) and sideways (844x390), looked at as
   Matt will on a phone. Plus a short video of two consecutive plays of one stage side by side, so Matt can see the snakes moved.
10. The old builders are deleted in the same release (new replaces old): the world's blocks in `protoStage.ts` and its
    `HAND_STAGES` entries (`protoStage.ts:59`), `w2Stages.ts`/`w2Sections.ts`, `w1Sections.ts`, `w3Sections.ts`, `w4Sections.ts`
    (except what climbs and set pieces still use). Their tests are deleted or re-pointed (about 50 test files import the hand builders
    today: `stage11-19`, `protoStage`, `w2Stages`, `w2Puzzles`, `w3Stages`, `w3Puzzles`, `w4*`, `qaW123`, `flagSpan`, `easyMode`,
    `groundwork`, `artDress`...). Each deleted test's rule must exist in a gen2 test before it goes (STAGE-RULES §6: "a rule only a
    test knows ships broken rolls").

---

## 7. Risks

| Risk | What happens | What we do |
|---|---|---|
| **Save data** | Every per-stage key is the stage id alone (`sloth_lvl_<id>`, `sloth_layout_<id>`, `sloth_tips_<id>`, `sloth_seed_<id>_<n>`; allowed keys `saveFile.ts:24-45`). Ids don't change, so progress, stars, best times, badges and skills carry over. | Nothing to migrate. |
| **Layout memory** | A stage entered but not cleared keeps its layout number (`layoutMemory.ts:61`). After the update, that number picks one of 16 gen2 rolls (`variant % 16`), so a player mid-learning sees a new layout once. World 1's `p<n>` entries (`layoutMemory.ts:93`) still read as "last played", but map to a seed index that has nothing to do with what they played. | Accept the one-time change (it's what Matt asked for). Test that old `p<n>` and plain entries load without errors. |
| **Best times** | `stageBest.ts` keeps a best time per id. The new 1-3 can be longer or shorter than the old one. | Keep the times. Gen2 stages land in the same `stageTime.ts` target window, so they're comparable. Mention it in the release note. |
| **Golden seeds** | `sloth_seed_<id>_<n>` (`protoStage.ts:6715`) remembers which seed collectibles were taken, by index. Gen2 stages lay seeds in different spots. | Check how gen2 stages lay finds and golden seeds today (`addFinds` runs in the adapter: `gen2/game.ts` header). Keep the count per stage the same, so a taken seed stays taken. |
| **Story keyed to stages** | Halfway scene after stage 5 (`storyWorlds.ts:477`), memories after bosses (`storyChapters.ts:28-31`), wayside by world and stage number, tips per stage id. All by id or number. | No change. A test lists every story beat of W1-4 and checks the stage still exists and isn't secret. |
| **Lessons in the wrong stage** | gen2 draws sections by weight, so a mechanic could show up before its lesson. | `uses`/`teaches`, `required` teaching sections, and `manifest.lessons`. The first-timer bot catches the rest. |
| **New engine pieces** | W2's drifting logs, lily pads, ferry and rising water; W3's thorn vines, spores and darkness; W4's wind, mist and glide. gen2 doesn't have them as pieces or props yet. | Each goes into the pipeline as a general piece, prop or zone with a `checkStage` rule (DESIGN B12 step 2, as World 7's crumbling tiles did), owned by that world's helper. A pipeline change is announced so other worlds re-curate. |
| **Re-curation churn** | Any pipeline change (G0.1, a new piece kind) moves what a seed builds in **every** gen2 world. | Order pipeline changes first (G0, then each world's pipeline piece, merged by the lead), and curate last. Curation is about 30 min per stage, scripted. |
| **W1 is the first impression** | A rough W1 hurts the Play Store review more than any other world. | W1 goes first, as the pilot, with the full polish pass, and Matt plays it before W2-4 start. |
| **Perf** | gen2 decor goes through `decorate`; W3 is near the drawImage limit. | drawcheck on every curated set, not one layout. |

---

## 8. Order of work, sizes, and who owns what

| Step | Work | Helper-days | Owns (files) | Runs with |
|---|---|---|---|---|
| G0 | groundwork (§3): rolled fight spots, next-roll rule, spot gate, seeds split, Jump help env, the climb decision | 2 | `gen2/pipeline.ts`, `gen2/types.ts`, `gen2/seeds*.ts`, `tools/gen2/curate.ts`, `layoutMemory.ts`, `headlessDom.ts`, `tools/inspect/spotMemory.ts` | alone (then re-curate W5-7: 1 day, can overlap W1) |
| SP | the spot pass for hand stages (G0.6 A): 1-4, 1-8, 2-6, 3-4, 4-1, 4-6, 4-7 | 1.5 + 1 (1-8's new chase patterns) | a new `src/game/spotPass.ts`, a hook in `stageGenerator.ts` (one line, the lead), `w1Sections.ts:670` chase patterns | after G0, with W1 |
| W1 | World 1 (pilot) | 8 | new `gen2/worlds/w1.ts`, `w1Ground.ts`, `w1Swing.ts`, `w1Rooms.ts`, `w1Game.ts`, their tests, `gen2/seeds/w1.ts` | SP |
| | **Matt plays W1** | - | | |
| W2 | World 2 | 8 | `gen2/worlds/w2*.ts`, `gen2/seeds/w2.ts`; river pieces in the pipeline (one PR, the lead merges first) | W3, W4 |
| W3 | World 3 | 8 | `gen2/worlds/w3*.ts`, `gen2/seeds/w3.ts`; thorn and spore props | W2, W4 |
| W4 | World 4 | 6 | `gen2/worlds/w4*.ts`, `gen2/seeds/w4.ts`; wind and mist zones | W2, W3 |
| L | per world, at merge: `gen2/game.ts` entries, `stageSheets.ts` (`STAGE_ANIMS`, `GEN2_ROOMS`), `protoStage.ts:59` `HAND_STAGES` and the old builder blocks deleted, old tests deleted or re-pointed, the gate, test link | 0.5 a world | the lead only | |

**Total: about 2 + 1 + 2.5 + 8 + 8 + 8 + 6 + 2 ≈ 37 helper-days with re-curation and merges; about 30 helper-days of building.**
Wall clock: G0 2 days, W1 + SP about 4 days with two helpers, Matt's play, then W2-W4 in parallel about 4 days. **About 10 working
days**, at high effort (CLAUDE.md helper effort: building stages is high).

**No two helpers share a file.** Every world is its own new files. These shared files belong to one owner:

- `gen2/pipeline.ts` and `types.ts`: the G0 helper, then one PR per world for its new piece kinds, merged by the lead in order.
- `gen2/game.ts`, `stageSheets.ts`, `stageGenerator.ts`, `protoStage.ts`, `layoutMemory.ts`: the lead.

Deleting the old builders is the lead's at merge, one world at a time, so a world's helper never edits `protoStage.ts`.

**When:** STATUS says after W8-10 and the bosses. I'd move **G0.1 (rolled fight spots)** ahead of the W8-10 curation: it changes
what every gen2 fight seed builds, and doing it after W8-10 means curating those worlds twice. Everything else can wait for its
turn.

---

## 9. Questions for Matt (the lead asks one at a time)

1. **Climbs (G0.6):**
   - (A) keep their shape and roll only their animals and flowers (recommended, 1.5 days);
   - (B) build the generator's climb mode so they change shape too (4 days, worth it if W9-10 need it).
2. **When:**
   - (A) G0.1 now, before W8-10 curation, and the rest after W8-10 and the bosses (recommended);
   - (B) all of it after W8-10;
   - (C) W1 right after G0, before W8-10.
3. **The 0.5 rule:** is "the next roll after a clear is always at least half different, and the snakes are in different places" the
   promise you want? (The shipped sets as a whole average 0.41-0.55 on W5-7 today. Raising the whole set's average to 0.5 would mean
   about 40 sections a world instead of 30.)
