# World 10 grab bag: every piece, built before curation (2026-10-31, ~2:15 PM ET, branch w10-pieces)

STAGE-RULES §1c (Matt, Oct 31: "make the pieces ahead of time... not bare minimum... no redundant rework"). This is the whole bag World 10
will be curated from. Nothing here is built until the lead says go; nothing is curated until every piece below is built and checked alone.
World 8's grab bag (`qa-notes/w8/GRAB-BAG.md` on w8-merge) is the model; the beat letters and weights are `tools/inspect/beats.ts`:
h 0.5 (hop), J 1 (jump; `J|moving` is a hop onto a moving platform, its own look-alike kind), V 2 (climb, swing, lift), C 2.2 (animal),
Z 2 (timed or zone hazard), P 2.8 (puzzle step). "S" in the World 10 code is a timing beat (a rod, a gust), counted as Z by the measure.

## 1. Where World 10 stands today (after the merge, w10-pieces ae0b2423)

Stages on gen2: 10-1 The Door Made for Him (sprint), 10-3 Thunder (stealth), 10-6 The Iron Netting (vine runner), 10-7 The Walls
(purge), 10-9 The Fortress Gate (gauntlet). 10-2/10-4/10-5 are ascents (gen2-ascent), 10-8 becomes The Clockwork Gate (special stage),
10-10 is the General. No World 10 seeds yet (the old curation stopped after 10-1 16/16 at 0.355, below today's 0.45 target).

A roll's theme is set by the gate section it opens with (`w10-door-gate-rods`, `w10-storm-gate-spikes`, ...), so **themes per stage =
gates its archetype can open**. Today:

| Stage | Themes today | Section types it can draw today |
|---|---|---|
| 10-1 | rods, spikes, ramparts, gusts (4) | chasms/second jumps, rods, spikes, ramparts, gusts, hoist room |
| 10-3 | rods, spikes, ramparts, gusts as storm walks (4) | storm watch + crates, rods, ramparts, spikes, gusts, patrol, beam room |
| 10-6 | **none** (every roll is the same chain of swings) | swings (chain/banner/rope looks), guard swings |
| 10-7 | rods, spikes (2) | guard walls/yards, spike yard, harpy wall, tower steps, swings, gatehouse room |
| 10-9 | rods, spikes, ramparts, gusts (4) | guarded rods/gusts/rampart, portcullis yard, gatehouse run, drawbridge, swings |

Distinct section types in the world today: 9 (chasm jumps, rods, spike beds, crumbling ramparts, gust lanes, the storm's watch, guards
and hunters, swings, puzzle rooms). Timing beats: 3 (rods, gusts, the storm). Below §1c's 14 / 3, and 10-6 and 10-7 have almost no
theme spread: that is where the variety work has to land.

## 2. The target

- **21 section types** in the world (9 today + 12 new, A-L), **11 timing beats** (rods, gusts, storm + A, B, C, D, E, F, K, L).
- **Every stage 5-6 themes**, each theme leaning on a beat no other theme of that stage has (World 8's lesson: a roll either has it or
  not, which spreads the rolls apart). Aim 0.45+ on every stage without rerolls.
- **Each stage keeps its own new pieces** (curation's `--apart`): no new piece is shared by two stages except where named, so no 20 s
  stretch reads alike between neighbours.
- **Platform styles mixed**: today almost every surface is the moss-stone bank. The new pieces bring the plank on rings, the iron grate,
  the stone balcony, the iron stair, the timber perch and the chain bridge (all painted, on hand), so no style goes over 60%.

## 3. The new pieces

Each: what it plays like, beat, stages, art (on hand / Hugging Face with cost), teaching, the line (under 10 words; World 10 lines are
**Pokey's in 10-1 to 10-5 and Dot's in 10-6 to 10-9**, per `wayside.ts dotPresent`; all new lines go to Matt via the lead), engine work.

### A. Chain lifts (MATT'S MOVING PLATFORMS) — beat `J|moving` + Z timing — 10-1 (taught), 10-6
An iron-banded plank hangs on two chains from the dark above and **rises and sinks on a steady beat** (period 3.0-3.6 s, travel 90-160 px,
a short dwell at each end). Jump on as it comes level with your ledge; ride it up to a wall you can't reach, or cross a row of them, each a
beat out of step with the last. Easy: slower (4.2 s), shorter travel, a wider plank, the plank pauses longer at the lip.
- Versions: one lift up a too-high wall; a row of 2-3 across a chasm (alternating); a lift with a rod above it (10-1 late only).
- Art: **on hand.** `gemini/w9w10-bridges` `plank-ring` (the plank) + the chain of `props-made/w10b` `hanging-iron`, run up off screen.
  Optional HF: a small pulley block where the chain meets the wall (~$0.30).
- Taught: 10-1, first lift over a **soft pit** with a wide ledge to wait on, the lift visible a full cycle before he reaches the lip.
- Line (10-1, Pokey): **"That plank rides the chain. Wait for it."** (8 words, new)
- Engine (shared, the World 9 helper needs the same): a vertical moving platform `Platform.bob {range, period, phase, dwell}` in the
  engine's moving-platform loop (carries the rider up and down); gen2 `SectionPiece.bob`; levelCheck reach at the lift's best and worst
  height; route.ts `timedHop`; the first-timer and kid bots wait for it. One build, used by A, B and C.

### B. Counterweight planks — beat `J|moving` (a pair) — 10-3 (taught), 10-6
Two planks on one chain over a pulley: as one sinks the other rises (the same riser, the second half a cycle behind). Stand on the low
one as the high one reaches the far lip, step across. Reads as its own thing: two moving at once, opposite ways.
- Art: HF **pulley wheel + chain loop + iron counterweight block** (~$0.60); planks on hand. The same wheel and weight are **10-8's**
  counterweight lift (made once, used twice).
- Taught: 10-3, its first pair in a quiet stretch with no storm over it.
- Line (10-3, Pokey): **"One goes up, the other comes down."** (7 words, new)

### C. Gear lifts — beat V (`lift`) + Z timing — 10-9 (taught), 10-6
A stone block on an iron rack rises out of the wall-walk as a great cog turns, holds at the top (2 s), then sinks back into the floor.
Three in a row make a stair that builds and falls on a count: the Clockwork Gate's machinery, met first out on the walls.
- Art: HF **cog wheel (turning, 4 frames) + rack-mounted stone block** (~$0.80); the cog is reused in 10-8 (the gate's gears).
- Taught: 10-9, a single gear lift to a ledge, soft fall under it.
- Line (10-9, Dot): **"The gears lift the stones. Count with them."** (8 words, new)

### D. Drop gates (portcullis run) — beat Z — 10-7
A portcullis over the wall-walk drops and rises on a beat (chains rattle, it shudders: a 1.2 s warning). Run under while it's up. Caught:
a heart and a push back (Normal), a push back only (Easy, with a longer open spell). Two in a row out of step make the hard version.
- Art: **on hand** `props-made/w10a` `portcullis-down` / `portcullis-up` (the room's), drawn mid-drop between them. HF optional: a
  dust burst where it lands (~$0.20).
- Engine: a damaging column zone like the rod's (zones.ts `isDamaging`), its own look (`look: 'portcullis'`); levelCheck's bolt rules.
- Taught: 10-7, the first drop gate where a miss costs nothing (Easy rule there on both settings).
- Line (10-7, Dot): **"That gate drops on a count. Run when it's up!"** (10 words: trim to **"It drops on a count. Run when it's up!"**, 9)

### E. Gutter spouts — beat Z — 10-6, 10-9
A gargoyle spout on the wall pours storm water in a gush across a gap on a beat; inside the gush he is pushed down and back (no hurt,
like a gust downward). Wait on the lip for it to stop, then jump. Easy: weaker gush, longer dry spells.
- Art: **on hand** `w10alt` `spout-b` (unused today); **HF painted water gush, 3 frames + splash** (~$0.50; water is a major look, so
  painted, never code-drawn).
- Engine: the wind zone pushing down (a `dirY`), or its own zone kind; levelCheck's gust rule.
- Taught: 10-6, its first spout over a ledge (not a gap).
- Line (10-6, Dot): **"The gutters overflow. Wait for the gush to stop."** (9 words, new)

### F. Trapdoor grates — beat Z — 10-9
Iron grates in the wall-walk swing open on a beat over a pit (soft on Easy, the world's fall on Normal) and clang shut. Cross while shut;
every crossing has a safe pocket of stone between grates. Not crumbling: they always close again, and a long way round is never needed.
- Art: **on hand** `w10var` `fill-b` (the grate, shut, unused today); HF **grate swung open, 2 frames** (~$0.30).
- Engine: a timed platform (`Platform.blink {period, open, offset}`: solid while shut); levelCheck's pockets; bots wait.
- Taught: 10-9, first grate over a soft pit.
- Line (10-9, Dot): **"Those grates open. Cross when they're shut."** (7 words, new)

### G. Iron stairs — beat h (a run of hops up) — 10-7
The `iron-stair` (w10b, unused today) bolted to a tower face: a quick run of hops up to the tower top, then a drop the other side.
- Art: **on hand** `props-made/w10b` `iron-stair`. No line (no new mechanic).

### H. Scaffold and balconies — beat J up — 10-3, 10-7
Stone balconies (`w10b` `balcony`, unused today) jutting from a tower at staggered heights, a timber scaffold (`w10b` `scaffold`) between
them: jump up from balcony to balcony. A climb without a vine (World 10 has none outside its ascents).
- Art: **on hand.** No line.

### I. Perch posts — beat h J h J (short precise hops) — 10-1
Timber posts with a plank (`w10var` `perch-b`, unused today) stuck in a chasm's side: a row of short hops, a soft pit under them.
- Art: **on hand.** No line.

### J. Chain bridges — beat C on a bridge — 10-7
The painted `chain-bridge` (gemini w9w10-bridges, unused today) slung across a chasm with a soldier on it: a fight on a narrow span.
- Art: **on hand.** No line (the soldier is taught).

### K. Rolling barrels — beat J (over a hazard) + Z — 10-7
Soldiers on a tower roll barrels down the wall-walk's slope on a beat; jump them, or wait in a crenel for the gap. A hit costs a heart
(Normal) or a push back (Easy). The last thing built (a new moving hazard).
- Art: HF **barrel rolling, 4 frames + burst on the wall** (~$0.40).
- Line (10-7, Dot): **"Barrels! Jump them, or wait in a gap."** (7 words, new)

### L. Lantern sweeps — beat Z (stealth) — 10-3
A soldier's lantern on a tower sweeps its beam along the wall: hide behind the crates while it passes (the storm's watch, but the light
moves along the wall instead of flashing it all at once, so it plays apart from the storm's stretches).
- Art: HF **painted lantern beam cone** (~$0.50); the soldier's lantern look is on hand (soldier clips).
- Engine: the watcher (watcher.ts) with a moving window.
- Line (10-3, Pokey): **"A lantern sweep. Stay behind something."** (6 words, new)

## 4. The puzzle room: The Winch House (10-7's second room)

10-7 rolls between its gatehouse (today) and the Winch House, so its room is not the same on every roll (World 8's 8-1 Roost Loft is
the model: a room variant, not an extra puzzle moment; the world keeps 3 gen2 rooms + 10-8's puzzle stage, STAGE-RULES §3's 2-3).
- The drawbridge to the next wall is up. A winch drum by it lowers the bridge when cranked (Pokey's crank pose, World 2's winch), but the
  ratchet slips and the bridge rises again unless a stone is jammed in the pawl. Normal (3 steps): the stone is in an alcove behind a
  lever-raised grate; lever, carry the stone (a walkable path), crank. Easy (2 steps): the stone lies by the winch; carry, crank.
- First-lesson rules: no enemies, no deadly fall, can't be skipped (the bridge is the only way over), shows itself first (the bridge
  lowers a little and slips back as he arrives). Reset post; lost stone respawns.
- Art: HF **winch drum with chain, pawl free and jammed (2 states)** (~$0.80); lever, grate, crate, stone on hand (w10a, w10b).
- Lines (Dot): enter **"The bridge keeps slipping back up."** (6); carry **"Heavy. That should hold it."** (5); open **"It holds!
  Across, quick."** (4). Hints, asked for: **"What stops a wheel from turning back?"**, **"Something heavy, in the teeth."**

## 5. Themes per stage (the curation will draw from these)

| Stage | Themes (gate opens one per roll) | New piece it owns |
|---|---|---|
| 10-1 sprint | rods, spikes, ramparts, gusts, **lifts (A)**, **perches (I)** — 6 | A taught, I |
| 10-3 stealth | storm+rods, storm+spikes, storm+ramparts, storm+gusts, **counterweights (B)**, **lantern sweeps (L)**, + balconies (H) inside — 6 | B taught, L, H |
| 10-6 vine runner | **chains** (today's swings), **lifts+swings (A)**, **counterweights+swings (B)**, **spouts (E)**, **gear lifts (C)** — 5 | E taught |
| 10-7 purge | rods, spikes, **drop gates (D)**, **barrels (K)**, **iron towers (G, H)**, **chain-bridge fights (J)** — 6 | D, K, G, J; Winch House |
| 10-9 gauntlet | rods, spikes, ramparts, gusts, **gear lifts (C)**, **trapdoors (F)**, **spouts (E)** — 7 | C taught, F |

Taught order across the world: A (10-1) before B (10-3) before their reuse in 10-6; E's first is 10-6; D and K in 10-7; C and F in 10-9.
10-6 meets C before 10-9 teaches it, so **C's teaching spot moves to 10-6** if 10-6 keeps it (decided at build: C goes to 10-6 only
after its taught version is proven there; otherwise 10-6 drops C and keeps 4 + 1 new theme from H/G).

## 6. Special stage and boss (planned here, built later when the lead says so)

- **10-8 The Clockwork Gate** (approved mock-up, mock-w9-w10-special): reuses B's pulley wheel and counterweight, C's cog, D's
  portcullis-on-a-beat as its timed shutters. Making those for the grab bag means 10-8's new art is mostly the pendulum, the great
  wheel and the three lamps. Note: the "keep a thumb down to hold on" on the great wheel is void (Matt, 7:55 PM Oct 30: freeze on the
  flash); the wheel panel is redesigned before 10-8 is built (STATUS line 107).
- **10-10 The General** (boss-design): needs nothing from this bag; its storm phase uses the rods' painted bolt (on hand).
- The hold (freeze on the flash) is taught in 10-3 and 10-4 per Matt's boss decision (3:15 PM Oct 30): **10-3's storm theme gets the
  freeze teaching** as part of this pass (the storm's flash is the gust that would tear his grip), unless the lead says it belongs to
  the boss helper.

## 7. Cost and order

Hugging Face (rtx-pro-6000 ~$2.75/h, World 10's last round cost $1.49 for 4 sheets): A pulley 0.30, B wheel+weight 0.60, C cog+block
0.80, D dust 0.20, E gush 0.50, F open grate 0.30, K barrels 0.40, L beam 0.50, Winch 0.80 = **~$4.40**, ~$9 with retries. Inside the
$25; no single job over $3, so none needs the lead's OK first (I'll still log each in `tools/art/hfbatch/jobs.txt`).

Build order (each checked alone, §1c step 3, before the next):
1. The riser engine (A/B/C share it) + A in 10-1 → tell the lead the hunks at once (World 9 reuses it).
2. On-hand pieces G, H, I, J (data and art hook-up only) — cheap variety first.
3. B, then the 10-6 themes (E, lifts and counterweights on swings), D, F, C.
4. L, the Winch House, K last.
5. Then curate once, in neighbour order 10-1, 10-3, 10-6, 10-7, 10-9, the full suite green after each.

Honest expectation: the engine pieces (riser, drop gate, trapdoor, spout push, barrels, sweeping lantern) are most of the work. Tonight
(to 10 PM ET) I expect A, B, D, F and the on-hand pieces built and checked; C, E, K, L and the Winch House may run into the next session,
and curation will not start tonight. I'll say so in NEXT.md rather than start curating early.

## 8. Status (updated as pieces are built; branch w10-pieces; 2026-10-31 ~3:45 PM ET)

| Piece | Sections (stage) | Status | Checked alone (pieceCheck, 6-8 rolls) |
|---|---|---|---|
| A chain lifts | w10-lift-first, -pair, -row (10-1, 10-6), -rods (10-1) | BUILT on World 9's riser (gen2 place 'raft', bob 'raft'); style w10_lift: two chains up to the pulley block, the iron-banded plank | 6/6 each; kid 0.92+, adult 0.97+ |
| B counterweights | w10-cw-first, -row (10-3, 10-6), -storm (10-3) | BUILT; w10_cw: one chain over the cog wheel, the weight on the other side; pairs ride half a cycle apart (w10Game decorate) | first 6/6, storm 4/6, row 4/6; kid 0.93+ |
| C gear lifts | w10-gear-first, -leap (10-6, 10-9), -guard (10-9) | BUILT; w10_gear: bag 'rack' block on its toothed rack, the cog in the bank face below the walk; faster than World 9's pistons (W10_GEAR_SPEED), a fixed 210 px rise | kid 0.95+; 1-2 of 6 pass when gears fill 10-9 (one beat over and over): more gear-theme pieces needed, §10 |
| D drop gates | w10-drop-first, -row, -yard, -high (10-7) | BUILT | pass; kid 0.97+ |
| E gutter spouts | w10-spout-first, -gap, -pair (10-6, 10-9), -guard (10-9) | BUILT; the spout now stands on a wall stub (w10var 'bank-b'), its mouth about 182 px up (the lead's review) | pass 8/8; kid 0.97+ |
| F trapdoor grates | w10-trap-first, -row, -guard, -spikes (10-9) | BUILT (soft pit under every grate) | pass 8/8; kid 0.96+ |
| G/H towers | w10-iron-stair, -balcony-climb, -tower-run (10-7) | BUILT (never mirrored); the stair's stringer stub is gone (the lead's review) | pass; kid 0.85+ |
| I perch posts | w10-perch-run, -climb, -rods (10-1) | BUILT | pass; kid 0.90+ |
| J chain bridges | w10-bridge-fight, -pair, -rods (10-7) | BUILT | pass 8/8; kid 0.97+ |
| K rolling barrels | w10-barrel-first, -run, -steps, -yard (10-7) | BUILT; a TRUE ROLL now: the HF barrel end (round lid, hoop, bung; hfb-w10bag-r2, ~$0.15) turns its distance over its radius (the lead: "a wobble isn't a roll"); a tipped barrel ('barrel-tip') leans on the stack | pass where laid; kid 0.96+ |
| L lantern sweeps | w10-lantern-wall, -steps, -guard (10-3) | BUILT; every other tower its own beam painting (beam-1 / beam-2) | wall 8/8, guard 6/8, steps 4/8 (weight 1) |
| Winch House | 10-7's second room (`required.oneOf`, rolled against the gatehouse) | BUILT | w10Rooms.test 19/19 (real engine: Normal throw, Easy taps) |
| 10-6 themes | w10-net-gate-chains, -spouts, -lifts, -counterweights, -gearlifts | BUILT | - |

Themes per stage now: 10-1 6 (rods, spikes, ramparts, gusts, perches, lifts); 10-3 6 (rods, spikes, ramparts, gusts, lanterns,
counterweights); 10-6 5 (chains, spouts, lifts, counterweights, gear lifts); 10-7 6 (rods, spikes, towers, bridges, drops, barrels); 10-9 7
(rods, spikes, ramparts, gusts, trapdoors, spouts, gear lifts). Every stage clears 5.

The inspector (shared, tools/inspect/beats.ts): boarding a moving plank (lift.ts `bob`, World 9's and World 10's), standing on it or
waiting a step short of it, is a timed beat. The walk on a soft pit's floor under the planks earns nothing (the lead's ruling, 5:02 PM):
World 9's knobs give that walk real hops, drawn in World 10 as rubble (§10).

## 9. Placed from unused (Matt: "We need to use all the art we create")

Every World 10 painting that sat unused before this pass, and where it is now:

| Art | Was | Now |
|---|---|---|
| w10b balcony, scaffold, iron-stair | unused | H balconies, the scaffold walk, G iron stairs (w10PieceArt) |
| w10b hanging-iron | unused | the chains of A/B (drawW10Chain) and the puzzle rooms |
| w10b crate | unused | the puzzle rooms' crate block (w10Rooms) |
| w10var perch-b | unused | I perch posts |
| w10var branch-b (an iron grate) | unused | F trapdoor grates, shut |
| w10var bank-b | unused | E the spout's wall stub |
| w10alt spout-b | unused | E the spout block |
| gemini w9w10-bridges chain-bridge | unused | J chain bridges |
| gemini w9w10-bridges plank-ring | unused | (drawW10Plank, A/B's planks) |
| bag barrel-tip | cut, unused | K: leaning on the barrel stack |
| bag beam-2 | cut, unused | L: every other lantern tower's beam |

Still unused, with a place for each (curation pass, no new art):
- **w10var stump-b** (a rubble mound) and **fill-b** (a crag face): World 10 dressing, rubble at the foot of a wall and the face under
  a high road. They are the HF "b" looks of World 8's own stump and fill, so they go in with a check that World 8's pieces never stand
  next to them.
- **w10var buttress-b** (a crag ledge with a sand top): a ledge style for 10-6's netting (the swing helper's lane).
- **w9w10-bridges plank-hanging** (a plank hung from one chain): a swinging plank, a pendulum the swing builder can carry (10-6).
- **bag winch-jam**: no place, and none possible. The round-1 take (w10bag-a-s62-23, cell 9) never painted a stone in the winch's teeth:
  its cut is the same winch as 'winch', plus the edge of the cog from the cell above. The jammed look stays the winch with the kit stone
  in its teeth. Drop it from the atlas at the next recut.
- **w9w10-bridges rope-bridge, ember-slab, charred-log** are World 9's.

## 10. For curation and later (the lead's notes)

- **Variety:** one gatehouse painting (bag 'gatehouse') is both the drop gate's gatehouse (D) and the lantern tower (L). Where a stage
  holds both, a second tower painting would keep them apart; a later HF batch, not now.
- **10-9 first-timer falls:** 20+ falls on Normal, plus pit rescues on Easy in the swing sections. This is a band and curation item: the
  first-timer bot does not yet wait for World 10's timed hazards (NEXT.md), and 10-9's swing sections need their own look in curation.
- **10-9 needs more pieces around the gear theme (the lead, 5:02 PM):** when gear lifts fill 10-9, a roll is one beat over and over (wait
  for the piston, ride, step off), and 1-2 rolls of 6 pass. Not forced past the measure: 10-9 needs more gear-theme pieces with a
  different beat (a gear lift beside a drop gate or a grate, a gear-driven turning bridge, a guard on the cog's own ledge), so the theme
  is several beats, not one. A grab-bag item for the next pass, built before curation.
- **The lift pits' floor (the lead's ruling, 5:02 PM):** World 9's knobs on a soft pit's floor under a row of moving planks (pipeline
  layStage, BOB.knob*) are kept; under World 10's chain lifts and counterweights they are drawn as fallen rubble (w10var 'stump-b',
  style 'w10_rubble', set in w10Game's decorate on the knobs themselves: no geometry of World 10's own). The inspector's moving-plank
  beat counts only standing on a plank or waiting a step short of it, never the walk on the floor under it.
