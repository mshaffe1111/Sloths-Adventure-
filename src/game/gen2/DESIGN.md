# The new stage generator (gen2)

Written 2026-10-28. First job: World 5's stages 5-7, 5-8 and 5-9. Then Worlds 6-10 (each world's nine stages; stage 10 is the
hand-built guardian, and each world's one signature stage stays hand-built). Built on Matt's Gemini research
(`reference/GEMINI-PCG-RESEARCH.md`) and held to `reference/STAGE-RULES.md`.

---

## Part A. How it works, in plain words (for Matt)

Today a generated stage is one long roll of the dice, and two rolls of the same stage come out 87-100% alike. The new generator
builds a stage the way a person would build it out of Lego: from **building blocks** that we design by hand, joined end to end, with
**slots** in each block where the roll picks what goes in.

- **A building block** (we call it a *section*) is a short stretch of stage, a few seconds long: "two stumps to hop", "a soft pit with
  a spider on the far side", "a carry-the-acorn puzzle". We draw each one once, by hand, with your art in mind. Each world gets about
  30 of them, and many come in two or three versions.
- **Slots** (*sockets*) are the spots inside a block where something can go: a creature, a chair, a cake, a row of petals, a flag,
  Dot's tip. The roll fills them from the world's own toybox, so the same block plays differently each time.
- **Each stage follows a story shape** (Nintendo's four acts): a gentle start, the idea shown safely, the idea made harder, a rest,
  a twist, another rest, a big finish, the shrine. The generator picks blocks to fit each part.
- **It can't build a jump you can't make.** Every gap is sized from Pokey's real jump, with room to spare: on Easy a jump is never more
  than 65% of the furthest Pokey can go, on Normal never more than 82%. Then the stage checker we already use walks every stage
  before you ever see it. If one spot fails, the generator fixes just that spot (a stepping stone, or a different block there) instead
  of throwing the whole stage away.
- **Easy and Normal are the same stage.** The same roll, the same blocks in the same order; Easy just plays it kinder: shorter jumps,
  wider landings, every fall lands in a soft pit, fewer animals at once, gentler animals, no cakes on the path.
- **We ship only the best rolls.** A computer builds a few hundred rolls of each stage, scores them on our inspector, and we keep the
  best dozen or so that also differ the most from each other. Every time you enter a stage you get one of those: always checked,
  always a little different.

```
  the world's toybox            the stage's plan (from stagePlan.ts)
  (blocks, creatures,           "5-7 Don't Touch the Silk: a stealth stage,
   props, decor sets)            about 3 minutes, World 5's difficulty"
          │                                   │
          ▼                                   ▼
   1 BUDGET ─────► 2 STORY SHAPE ─────► 3 PICK + JOIN BLOCKS ─────► 4 FILL THE SLOTS
   how long, how    start · show · grow    end of one block is the     creatures, props, petals,
   hard, how wide   rest · twist · rest    start of the next; every    flags, Dot's tips; pairs
   a jump may be    twist · finish · shrine gap sized from the jump    (a pebble and its bell)
                                                                       always together
                                                                              │
                                                                              ▼
                       6 DRESS ◄──────────────── 5 CHECK + FIX ◄──────────────┘
                       the world's decor set,     the stage checker and the puzzle
                       picked by the roll; never  checker; fix one spot, or swap one
                       the same set two stages    block; re-roll only if that fails;
                       in a row                   then check the clock (2+ minutes)
```

What it needs from you, Matt: the building blocks are drawn around your art, so each new world needs its creatures, its props
(and their state frames: pressed, rung, open), its platforms and two or three decor sets per job (bushes, roots, ground clutter), so
the roll has something to rotate. The decisions waiting on you are at the end (Part C).

---

## Part B. The technical spec

Files (all new, under `src/game/gen2/`):

| File | What | Owner |
|---|---|---|
| `types.ts` | the data shapes: WorldManifest, SectionTemplate, Socket, MissionGraph, StageBudget, Gen2Stage | architect (this) |
| `pipeline.ts` | the six passes, the repair and length loops, `buildGen2Stage` | architect; passes 3-4 extended in phase 2 |
| `variety.ts` | ShuffleBag, CooldownQueue, WorldOnce, poissonPlace, pickWeighted (injected `rng`) | variety helper (merged) |
| `toyWorld.ts` | a four-section test world (fixture for tests and helpers) | architect |
| `pipeline.test.ts` | the end-to-end proof on the toy world | architect |
| `worlds/w5.ts` (phase 2) | World 5's manifest, sections and emitters | phase 2 helpers |
| `seeds.ts` (phase 2) | the curated rolls per stage | the curation tool |

The engine needs no change: `buildGen2Stage` returns a `GeneratedStage` (the shape `buildProtoStage` returns), with the hand-built
stages' `proto` extras (`hints`, `covers`, `beats`, and a world's own extras such as `proto.w5`) and the puzzle kit's `kit.rooms`.

### B1. Pass 1: the budget (`planBudget`)

Input: the stage's `LevelConfig`, the world's manifest, the difficulty. Output: `StageBudget`.

- **Seconds**: `targetSeconds` / `fastFloor` from `stageTime.ts` (5-7: 184 s typical, 125 s fast; 5-8: 174 / 118; 5-9: 199 / 135),
  and a ceiling of 1.1 x target (max 295 s), as the old generator.
- **Difficulty score D(world, stage)** (F2, STAGE-RULES §1b): Gemini's `D_base` from 10 (World 1) to 65 (World 10). Each world's
  band is `[D_base - 1.5, D_base + 7.5]` (World 5: 32.9-41.9; World 6: 39.1-48.1). Neighbouring bands overlap by about 3, never a
  whole world, and the next world's middle sits above this world's top. Inside the band each stage sits at `STAGE_HEAT[stage]` =
  0.05, 0.30, 0.45, 0.35, 0.60, 0.50, 0.75, 0.65, 1.00: up and down (breathers), the ninth the hardest, the first just under the
  previous world's ninth. `heat` (0..1, D's place in the band) is what sections, gap shares and threat are scaled by. Tested.
- **Margins** (D2): `margin` 0.65 Easy / 0.82 Normal of the physical reach (`physics.ts reachJump`), capped at what `levelCheck`
  accepts (its 0.97 and the 70 px take-off slack): `maxGap(dyUp, dbl, margin)`. Flat ground: one jump 114 px Easy / 143 Normal, two
  jumps 204 / 230. Rises: one jump 70 / 88 px, two 120 / 151 (`riseLimit`).
- **Easy's rules**: `landingPad` +48 px on every landing (Gemini's "+2 tiles"); `pit` soft (a mossy floor and a step out; never a
  life); `enemyShare` 0.6; a longer animal tell (`attackCooldown` x1.5 on `easy: 'soften'` sockets); `easy: 'drop'` sockets with a
  hazard prop stay empty; `quiet` 3 s (Normal 2 s). Coyote time and the jump buffer stay the engine's (`physics.ts PHYS`, `ASSIST`;
  G1-G2 are an engine job, not the generator's).
- **Threat**: `2 + 6 x heat` per section of tension 1, scaled by each node's tension.
- **Quota**: the goal (`targetCount`) and what to lay: 1.5 x for a harvest, goal + 1 for a rescue or search.

### B2. Pass 2: the mission graph (`missionGraph`)

From the stage's archetype in `stagePlan.ts` (the story fixes the order: no per-playthrough shuffle, ledger I1). The spine is
Gemini's sawtooth: start 0.1, Ki 0.3, Sho 0.6, rest 0.1 (flag), Ten 0.72, rest 0.1 (flag), Ten 0.85, Ketsu 0.95 (flag), shrine 0.
Each node owns a share of the stage's seconds. Rewrites per archetype: stealth wants `cover` sections, vine runner `swing`, harvest
`pickups`, purge/gauntlet run 0.08 hotter (a gauntlet gets one more twist), rescue/search spread their quota items over the Sho, Ten
and Ketsu nodes. `want` tags weigh the bag; they never filter (a stage is never left with no candidate).
TODO phase 2: an **ascent** (5-8) runs up (`flow: 'up'`: the same stitcher with the axes swapped, the corridor clamp on x, and the
climb steps recorded in `meta.ascentChain` for `stageTime.ts`); rescue/search alcoves become real side branches.

### B3. Pass 3: sections and stitching (`layStage`, `layLocal`)

A **section** is a local-space prefab (Part 3 §1). Its pieces are platforms placed by rules relative to each other, never at fixed
coordinates: `start` (the entry piece; its top-left is local (0, 0)), `walk` (continues the floor, a small step up or down), `jump` /
`double` / `pit` (a gap from the envelope: `share` of `maxGap` for that rise), `on` (a stump `h` px tall standing on a piece) and
`over` (a ledge over a piece). So a rolled width stretches a piece and everything after it follows. Every rise is clamped to the
difficulty's rise limit, every gap to its envelope: **a section cannot be laid unbeatable by its own rolls**.

**Stitching**: the next section's entry anchor is set on the previous exit anchor plus a join (Alto's `P_next = P_prev_exit + delta`):
ground to ground a walk (no gap), a step (a hop up or down, leaning back to the corridor's middle) or a pit (only where the node's
tension allows; never in the start, a rest, the shrine or beside a room); from or onto a ledge a jump sized from the envelope. A soft
pit's floor and its steps out (each no higher than a plain hop) are laid by the stitcher.

**Vertical corridor clamp**: the route's ground stays in `manifest.corridor` [top, bottom]. A section whose `exitDy` would leave it
is never picked; within `soft` px of an edge the bag leans 3:1 to sections that drift back.

**Choosing**: candidates fit the node's phase, the archetype, the unlocked moves, `maxPerStage`, and the teaching rule (a section
that `uses` a mechanic is open only once it was taught: by an earlier stage, `manifest.lessons`, or a section before it that
`teaches` it). Weights: difficulty near the node's tension scaled into the band (`exp(-4 |d/10 - want|)`), x3 for wanted tags, the
corridor lean. A `ShuffleBag` per node kind draws up to three; the `CooldownQueue` (length up to 4 inside a stage, preloaded with
the previous stage's shipped sections, `BuildRequest.recent`: C4 across stages) takes the first not used just now. Mirroring: a
`mirrorable` section flips with even odds (a room never does; painted light stays upper left). Each slot rolls its geometry from
its own stream (`rngFor(seed, 11, slot)`), so swapping one section leaves the others' rolls alone.

Easy lays **Normal's plan** (`Gen2Meta.plan`: section, flip, node, join per slot) from Normal's seed, with Easy's rules.

### B4. Pass 4: the sockets (`fillSockets`)

A socket is bound to a piece by key, `t` (0..1 along its top, rolled from a range) and `dn` (px above it): D6, so it never floats.
Order: **flags** (rests, and wherever 35 s passed without one), **Dot's tips** (the first time a stage meets a mechanic not taught
before), **linked pairs** (A7: a receptor finds a `manifest.pairs` entry whose source fits its `link` socket at a distance in
[minApart, maxApart]; both are filled or neither), **props** (a ShuffleBag per tag set, a CooldownQueue of 2 so a prop is not next
to itself; `easy: 'drop'` hazards stay empty on Easy), **creatures** (a ShuffleBag of the world's creatures; paid from the section's
threat; terrain and `minGround` checked; the patch is cut clear of every safe spot by levelCheck's `SAFE_APPROACH`; nothing in the
first 5 s of walking, §2 "Opening seconds"), then `poissonPlace` over all creatures with the props and every jump fixed (C2: 420 px
between two of a kind, 120 px between any two; stretches longer than the quiet cap with nothing to do are reported as `barren`).
Easy then keeps the first of each kind and 60% of the rest. **Pickups** (rows on a surface), **quota items** (cages, relics: the
node's count shared among its sections' `objective` sockets), **petal arcs** over the jumps (half a beat, E1), a harvest's top-up.
Every roll is drawn whether or not Easy keeps the piece, so the streams stay aligned. A prop reaches the engine through its
world's **emitter** (`WorldKit.emit[propId]`): the manifest stays data, the one piece of code per world writes the extras the
engine already plays (World 5: `proto.w5.chairs`, `cakes`, `threads`, `teapots`).

**Puzzle sections** reuse the puzzle kit as it is: a section's `room` is a `RoomSpec` whose anchors name the section's own pieces by
key (`LocalRoomSpec`); `placeRoom` turns them into platform ids and makes piece ids (and wires) unique (`s7-gate`), and
`addKitPlatforms` adds the gates and lifts once. Rooms follow STAGE-RULES §3 (first-lesson rooms: no creature sockets, no pit join,
`maxPerStage: 1`). Which stages of a world may hold a room (2-3 puzzle moments per world) is a phase 2 manifest field.

### B5. Pass 5: check and repair (`checkAndRepair`, `buildGen2Stage`)

`levelCheck.validateStage` (which runs `puzzleCheck.checkRooms`) on the assembled stage, then **local repair before any re-roll**
(D3): a pickup out of reach / inside a platform / overlapping is taken out (never below a harvest's laid count); an animal too near
a safe spot is taken out; an unreachable route piece gets a stepping stone in the seam before it when that seam is the failing way
in; still failing, or a room that cannot be solved, **that one section is swapped** (banned at its slot; a section that fails at two
slots is banned from the stage and named for its author). Only then a whole re-roll (`seed * 1009 + n * 7919`, up to 6, the old
`LEVEL_ATTEMPTS` role). Then **the clock**: `modelStage` typical and fast must reach the target and the floor and stay under the
ceiling; if not, each node's seconds are scaled (`aim`) and the stage is laid again. Tested end to end (the swap test builds a world
with a broken section).

### B6. Pass 6: dressing (`dress`)

Each decor job's set is chosen by `artRoll.rollLook` (stages take turns between two halves of the sets, the roll picks within the
half: never the same set two stages running, §4), and laid along the main banks through the world's `decorate` (World 5: into
`proto.w5.decor`). `proto.beats` gets one `[x0, x1, "section:phase"]` per section, so the inspector's sections and tension read it.
Breadcrumbs: the petal rows and arcs; phase 2 runs the shared post-passes the old generator runs (`addJumpTrails`, `addFinds`,
`fixPickups`) in the adapter.

### B7. The STAGE-RULES §2 numbers: by construction, and checked after

| Rule | By construction (gen2) | Checked after |
|---|---|---|
| Length (2+ min every roll) | each node fills its share of `targetSeconds`; the length loop on `modelStage` | pipeline test; inspector length; era.ts over 200 rolls |
| Jumps beatable, D2 margins | every gap and rise from `maxGap` / `riseLimit` per difficulty | levelCheck; inspector kid/adult bots (85% / 70%) |
| Crumbling never required | no fragile piece is on a section's main route (phase 2 lint on templates) | levelCheck |
| Opening seconds | the start node is the runway + a quiet section; no creature in the first 5 s | first-timer bot |
| Teaching first | `uses` / `teaches` gate; tips fire on first meeting | first-timer bot (tip before hazard) |
| Plain walk, one-jump out of dips | steps and pit steps under the rise limit; soft pits | first-timer bot, kid bot |
| Dead time / rests | section beats + Poisson `maxGap` report `barren`; rests from the graph | inspector `deadTime`, `restCheck`; the pacing helper's density and rhythm-group measures (E3, E4) |
| Sameness, variety across rolls | bags, cooldowns, mirroring, sockets, sub-blocks | inspector `similar`, `windows`; `tools/inspect/era.ts` diversity >= 0.35 |
| Goals fair | quota laid with a margin; Easy's lower bar from `goals.ts` | inspector `goal`; levelCheck quotas |
| Locked exit explained | a room's `tips.enter` | first-timer bot |

### B8. Seed curation (C10)

`tools/gen2/curate.ts` (phase 2): for each stage, build 300-500 rolls on Normal and Easy, drop any that fails levelCheck or the
clock, score the rest with the inspector (dead time, rests, bots' hotspots, peak stress) and the first-timer bot, then pick 12-16
greedily for **quality first, then the most different from those already picked** (era.ts's 1 - cosine), so the shipped set's
diversity is at least 0.35. It also rejects a set whose rolls share too many sections with the neighbouring stages' sets (C4 across
stages). The picks go to `gen2/seeds.ts`: `GEN2_SEEDS['5-7'] = [ ... ]`; at play the layout variant chooses among them
(`variant % n`): a retry keeps the roll, a fresh entry changes it, every shipped roll is verified.

### B9. A world's building blocks (authoring)

About **28-35 sections per world**, each with **3-5 sockets**, many with 1-2 **sub-blocks** of 2-3 versions, half of them mirrorable.
Spread: about 6 start/rest, 8 Ki (each mechanic shown safely), 10 Sho/Ten, 5 Ketsu (combinations), 2-3 puzzle rooms, plus the
stage-specific ones (5-9's arena gates). Each section is 3-8 seconds of play (600-1500 px). Rules for authors: a section starts and
ends on its ports, never relies on a crumbling piece, keeps rises under the Normal rise limit (the pipeline clamps Easy), keeps its
room narrow and tall (500 x 750, J3), and lists its beats honestly (every hop, jump, creature and prop). Each new section gets a
screenshot sheet (upright and sideways) before Matt sees it in a stage (Show first).

What a world needs from Matt's art: its platforms (bank, branch, stone, its own pieces), its creatures with their tells, every prop
with its state frames, 2-3 decor sets per job, and the backdrops through the day (`stageBackdrops.ts`).

### B10. Phased build plan, with parallel pieces

**Phase 2: World 5's 5-7, 5-8, 5-9** (each piece its own files; interfaces are `types.ts`):

| Piece | Files | Needs |
|---|---|---|
| A. W5 manifest + emitters | `gen2/worlds/w5.ts` (creatures: spider, Butler; props: chair, cake, teapot, thread, sheet, orchid; pairs; decor sets from `w5Stages.ts`' garden) | types.ts |
| B. W5 sections, ground and stealth (5-7) | `gen2/worlds/w5Sections.ts` (about 20: garden runs, stumps, high roads, threads, cakes, Butler, chairs, silk sheets) | A's prop ids |
| C. Vertical flow for 5-8 | `pipeline.ts` `flow: 'up'` (architect) + `gen2/worlds/w5Climb.ts` (bloom-tree climb sections) | types.ts |
| D. 5-9 arena + puzzle rooms | `gen2/worlds/w5Arena.ts` (arena gates, the 2 puzzle-room sections from the kit) | A |
| E. Sub-blocks in layLocal | `pipeline.ts` (architect) | none |
| F. Curation tool | `tools/gen2/curate.ts`, `gen2/seeds.ts` | era.ts, the inspector |
| G. Hook-up (lead, last) | one line in `stageGenerator.generateStage` (`if (GEN2[config.id]) return buildGen2Stage(...)`), `easyMode.easyStage` skipping stones and the animal cut for gen2 stages (it already gives hearts and the goal), the old 5-7..5-9 code deleted (new replaces old) | all |

A, C, E and F start at once; B and D after A's ids (an hour). Nothing reaches `main` until G passes the §5 checks on several rolls.

**Phase 3: World 6** (the mangrove: swing-heavy, water pits): `gen2/worlds/w6*.ts`; pieces for lianas and roots as sockets/pieces
(`PieceShape` gains `liana`), water pits (Normal: a life; Easy: soft), tide zones as props. Then Worlds 7-10 the same way, one
world per helper team.

---

## Part C. Decisions for Matt

1. **How many shipped rolls per stage**: 12 (every one hand-checked by screenshot) or 40 (more variety, spot-checked)? Proposed: 16.
2. **Easy's falls**: every gap on Easy lands in a soft pit (never a life), as Gemini proposes. Keep, or let Easy keep water in the
   worlds where water is the point (World 6)?
3. **Section count**: about 30 sections per world is about two days of building and screenshots per world. Fewer means rolls repeat
   sooner. Proposed: 30.
4. **5-8 Up the Bloom Trees** is a climb: build it on gen2's new upward flow (phase 2, piece C), or keep it hand-built like 5-1..5-5?
