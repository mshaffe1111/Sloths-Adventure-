# RUNS: every TRIAGE C row, run on our code

Engine measurement helper, 2026-11-05. Input: `reference/engine/TRIAGE.md` on `origin/engine-spec` (106 rows tagged C, #1-#163 by
TRIAGE's own numbering). Every row below names the command, the saved output (`reference/engine/runs/out/`), the measured number, and
PASS or MISS against the row's own line. Lines were not moved (LAWS 22): a run that misses its line is reported as a MISS.

**Time.** Planned about 3 h (11:08 AM-3:00 PM ET). Actual: see the end of this file.

**What was built and measured.**
- **engine-mixer at `021ef4e93`** (the mixer's 1-1 and 1-5, and the shipped builders for every other stage), in a clean detached
  worktree so no run wrote into the planner's tree.
- **main at `68b31e665`** for "old 1-1" and "old W1-W4" (ENGINE-SPEC:11 names the old 1-1 "live on `main`"). Note: main's W1 is NOT
  engine-mixer's shipped W1. engine-mixer carries 126 commits main does not (77 files under `src/game`), among them the rhythm builder
  for 1-2 and 1-5 (`src/game/w1Rhythm.ts:31`, absent on main). Where a row says "old", main was measured; where it says "today's" or
  "shipped", engine-mixer was.
- **16 layouts (1-16) x Normal and Easy** unless a row or a tool says otherwise (moveladder.ts and the mechanics counts are Normal only,
  as the tools are written; era.ts rolls its own 16 layout numbers, the first being 1, `tools/inspect/era.ts:54-70`).
- **The dump** every layout measure reads: `tools/engine/runs/dump.ts` (CP1's `cp1-dump.ts.txt` with more fields, any tree). Proof it
  reads the stage as CP1 did: on main's 1-1 it reproduces CP1's old 1-1 row exactly (kinds 5 (4-5), share 0.468 (0.338-0.692), runKS 7
  (3-9), newMeanPx 572 (360-606), hearts 2 (2-4) Normal / 15 (12-22) Easy, pickSideMax 6 (6-7), pickUpMax 4 (3-4); CP1
  `cp1/table2.txt:2-3`), using CP1's own `measure2.py` unchanged.

**New measures written** (only where none existed; each says so in its header): `tools/engine/runs/ladder-uses.ts` (the mechanics
counts per stage per layout; moveladder.ts keeps only "which stages"), `tools/engine/runs/ladder.py` (reads it against the ladder
table), `tools/engine/runs/dump.ts` (above). Others are named in their rows.

Numbers are **measured** unless marked *(estimate)*.

---

## 1. The move ladder (step 6)

Commands (engine-mixer worktree at 021ef4e93):
- `npx tsx tools/engine/moveladder.ts --layouts 16` -> `out/moveladder-16.json`, `out/moveladder-16.txt` (3 min 39 s, measured)
- `npx tsx tools/engine/runs/ladder-uses.ts --layouts 16` (3 shards) -> `out/raw/ladder-uses-mixer-16.json.gz`;
  `python3 -I tools/engine/runs/ladder.py out/raw/ladder-uses-mixer-16.json` -> `out/ladder-mixer.txt`
- the same on main's W1-W4 (`--root <main worktree>`) -> `out/raw/ladder-uses-main-W1W4-16.json.gz`, `out/ladder-main-W1W4.txt`

Cross-check: ladder-uses.ts's "first stage" and "stages in" agree with moveladder.ts at 16 layouts on every move (liana 64 stages,
trunk 77, breaking 31, rope 16, mushroom 36). **The committed `tools/engine/moveladder.json` was made with 2 layouts** (its own
`layouts: 2`); at 16 layouts 19 rows change (e.g. snake first 1-3 -> 1-2, caiman 6-4 -> 6-2, harpy 7-8 -> 6-5, breaking in 22 -> 31
stages). The engine's ladder should be read from a 16-layout run.

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #121 breaking / creaky at 1-5 | table = ML | engine-mixer: first **1-2** on every roll (11-21 creaky limbs), also 1-4 (9 every roll), 1-5 55-63. main: first 1-5 (8-24). | **MISS** (table matches main, not today's build) | 1-2's rhythm builder lays creaky limbs: `src/game/w1Rhythm.ts:1192` (`type: 'fragile', creak: q.hold ?? 0.6`); 1-4's kapok lays them: `src/game/protoStage.ts:6175`, `:6392` (`CREAK_S` 0.6 s, `:5655`). |
| #122 liana at 1-6 | table = ML | engine-mixer: first **1-2** (11 lianas every roll), 1-4 2, 1-6 18-31. main: first 1-6. | **MISS** | `src/game/w1Rhythm.ts:453` and `:1213` (`vineType: 'swing_liana'`) on 1-2. |
| #123 leaf glide row | row exists, echo/return per ES 1317-1319 | no glide row anywhere: MECHS has none (`tools/validate/mechanics.ts:18-41`), so moveladder.json has none; only warm air (`updraft`, first 4-7, 1 stage). | **MISS** | Gliding is a held input with no placed object, and MECHS counts placed objects only. Needs a glide measure (e.g. gaps a first-timer can cross only by gliding); not written here because a new mechanic count is the planner's tool. |
| #126 own world after the echo | a touch every stage, some in half; spec >= old world | engine-mixer W1-W5 (worst roll): mushroom touch 2/6, some 1/6; rope 1/3, 0/3; trunk 2/3, 0/3; breaking 0/2; liana 0/1; push 0/1; drift (W2) 4/6, 4/6; silk (W5) 0/3. main W1-W4: the same shape (mushroom 2/6 0/6, rope 1/3, trunk 2/3, breaking 0/2, liana 0/1, push 0/1, drift 4/6). Echo (next 2 stages "some"): 0/2 for rope, breaking, push, bush, lift, warm air, swim. | **MISS** (no move meets "a touch every stage" in its own world, on either build) | No builder reads the ladder: "ladder" appears in `src/game/mixer/` only in notes (`catalog.ts:44`, `:48`, `:91`); every shipped stage lays its own kit. Old W1-W4 (main) shows the same gaps, so "no lower than the old world" holds trivially while the spec's own floor fails. |
| #127 every later world >= 1 in 3 | SR:19-20 floor (>= 1 stage a world) and 1-in-3 | any roll, non-lair stages: liana PASS both (W2 4/9 ... W10 9/9); trunk floor PASS, 1-in-3 MISS (W5 3/10); mushroom W2 0/9, W6 0/9; rope W5-W7 0/10, 0/9, 0/9; breaking W2-W4 and W6 0; push only W4 (3/10); bush W2, W5, W7, W9, W10 0; moving W3, W4, W6-W8 0; swim W7-W10 0. | **MISS** (7 of 9 core moves miss the SR floor; 8 of 9 miss 1-in-3) | As #126. |
| #145 trunk climb's first stage, main 1-1 to 1-3 | recorded from the run | main: trunk 1-1 0, 1-2 0, 1-3 0, **first 1-4** (20-22 every roll). engine-mixer: 1-1 3 every roll (the mixer's). | **PASS** (recorded: 1-4 on main; the mixer's 1-1 is the only earlier one) | — |
| #152 animal absences | no taught animal absent > 2 stages (ES 139-140) | longest absence in play order (any roll): boa 38 (1-9 -> 5-6), jaguar 27 (3-9 -> 6-5), ocelot 18 (3-9 -> 5-6), snake 13 (5-8 -> 7-2), eagle 13 (5-8 -> 7-2), caiman 12 (7-8 -> 9-1), harpy 8, tayra 5, turtle 3 (2-5 -> 2-9) and never again after 2-9 (83 stages); frog 1, spider 1 (but gone after 7-9 / 5-9). | **MISS** (9 of 11) | Animals are laid per world builder; nothing spaces them across worlds (as #126). |
| #154 swim | 6-7 teaches; 6-8, 6-9 echo; W6-W8, W10 >= 1 in 3 | calm pools (`swim.ts` kitPools): 6-7 one pool every roll; 0 in every other stage of W6-W10. | **MISS** (teach PASS; echo 0/2; W7, W8, W10 0/9) | The only calm water is a puzzle room's raft well: `src/game/engine.ts:6019-6021` (`calmPools` = `kitPools(this.kit, ...)`), `src/game/swim.ts:8-9`. Drawn water zones (`proto.water`, `engine.ts:5501`) are laid by no builder at 021ef4e93 (0 on all 102 stages x 16 layouts). |

**Topic 1: 1 PASS, 7 MISS.**

## 2. Water (step 6)

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #5 lily-pad hop: small, big, sinking pads | the spec names only built kinds, or the sinking pad goes on the build list | Pad kinds in the code at 021ef4e93 (every `lily: true` site, grep): W1 82-102 px (`src/game/mixer/w1mix.ts:282`, h 12 at `:163`) and 84-104 px (`protoStage.ts:2625`); W2 124-144 px (`w2Stages.ts:465`). No pad sinks: no platform anywhere has a sink behaviour (grep "sink" over `src/game`), and engine-render's water work adds none (its diff at `953834388` draws pads and ripples, `padsOffWater`, no new kind). Pads laid on the real builds, 16 layouts x 2 settings: W1 **0**, W2 4.2% of landings (`out/kinds-world.txt`); the mixer's `lily-pad hop` waits for drawn water (`stages.ts:22`, `:31`). | **MISS** (small: yes; big: only W2's 124-144 px; sinking: not built, so it goes on the build list; ES 575 says "skip it") | — |
| #92 S-9 stepping stone <= 50 px above the water | at 50 px the stone still reads "in the water" on Matt's phone frame (stills, 30/50/70 px, both ways) | **Not run.** No builder at 021ef4e93 lays a water zone (`proto.water` empty on all 102 stages x 16 layouts, `out/ladder-mixer.txt` "waterzone"), so a still needs a scratch layout like engine-render's (`reference/engine/engine-render-11/README.md`), and the draw that sinks a stone's base below the waterline is on engine-render (`953834388`), not on engine-mixer. | **NOT RUN** (named, not hidden) | The water zone and its draw are not on the mixer's build yet. |

**Topic 2: 0 PASS, 1 MISS, 1 not run.**

## 3. Variety and repetition (step 6)

Commands (engine-mixer worktree; main worktree for "old"):
- dumps: `npx tsx tools/engine/runs/dump.ts <tree> <tag> <ids> 16` -> `out/raw/dump-*-16x2.json.gz` (W1 both trees; W2-W4 main; W2-W10 mixer)
- the idea tagger: `python3 -I tools/engine/runs/ideas.py <dumps>` -> `out/ideas-W1.txt`, `out/ideas-mixlabels-11-15.txt`. The tagger is
  CP2's `tag_ideas.py` verbatim; on main's 1-1 layout 1 it gives CP2's own tags (fork 41%, bank hops 38%, flat walk 16%, bounce 3%,
  canopy run 1%, high perch 1%; `cp2/idea-tags.out:1-8`).
- our own sameness gate (ruling C14 names it): `npx tsx tools/inspect/era.ts --worlds 1 --rolls 16 --look 16 --bots 16 --jobs 2` on both
  trees -> `out/era/era-mixer-W1.json`, `out/era/era-main-W1.json` (`lookalikeWith`: rolls of 16 where a 20 s stretch plays like the
  other stage, window < 0.30, `tools/inspect/lookalike.ts:37`)
- landing shares and runs: `python3 -I tools/engine/runs/vary.py <cp1 dir> <dumps>` (CP1's `measure2.py` unchanged) -> `out/vary-W1.txt`
- deck check: `npx tsx tools/engine/runs/deckcheck.ts` -> `out/deckcheck.txt`; library listing `tools/engine/runs/ideas-list.ts` ->
  `out/ideas-list.txt`; kinds per world: `python3 -I tools/engine/runs/kinds-world.py` -> `out/kinds-world.txt`; the labelled inventory
  at 16 layouts: `npx tsx tools/engine/inventory.ts --layouts 16` -> `out/inventory-16.json`, then `tools/engine/runs/kind-worlds.ts` ->
  `out/kind-worlds-16.txt`

**The calibration ruling C14 asks for** (ENGINE-SPEC:1761, "old 1-1 against 1-3, as our two references"): on the tagger's idea sets,
old 1-1 (main) vs today's 1-3 share **0.75** (0.50-0.75) of their ideas, Normal and Easy; old 1-1 vs main's own 1-3 0.50 (0.29-0.75).
So the cap a pair Matt calls different sits at, measured, is **0.75**. (Also measured: main's own 1-1 vs 1-2 share 0.80 (0.67-1.00), and
era finds a 20 s look-alike between main's 1-1 and 1-2 on 16 of 16 rolls: the neighbour problem predates the mixer.)

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #2 neighbours share <= half their main pieces (C14: our metric, cap calibrated) | era/lookalike: no 20 s look-alike between stages of a world (SR §2, window 0.30); tagger Jaccard <= 0.75 (calibrated above) | era, mixer W1 neighbours, rolls of 16 with a look-alike: 1-1/1-2 **16**, 1-2/1-3 0, 1-3/1-4 0, 1-4/1-5 0, 1-5/1-6 0, 1-6/1-7 1, 1-7/1-8 0, 1-8/1-9 0. Tagger Jaccard, median (min-max): 1-1/1-2 0.67, 1-2/1-3 0.50, 1-3/1-4 0.62, 1-4/1-5 0.38, **1-5/1-6 0.71 (0.57-0.86)**, 1-6/1-7 0.57 (0.50-0.67), 1-7/1-8 0.33, 1-8/1-9 0.29. | **MISS** (1-1/1-2 plays alike on 16/16 rolls; 1-5/1-6's worst roll 0.86 > 0.75) | 1-1 and 1-2 both lay long runs of bank hops at one tempo; era's closest windows are bank-hop stretches (`out/era/era-mixer-W1.json` 1-1 `lookalikeWith` {"1-2": 16, "1-5": 15}). |
| #8 the variety gate counts the whole library; neighbours <= half | as #2 | as #2 | **MISS** | as #2 |
| #21 a stage is a sequence of node ideas; neighbours <= half | as #2 | as #2 | **MISS** | as #2 |
| #105 neighbours <= half their main pieces | as #2 | as #2 | **MISS** | as #2 |
| #103 1-1 and 1-5 share <= half their ideas | as #2 (the spec keeps the rule though they are not neighbours) | tagger: **1.00 on 16/16 rolls** both settings (the same six: bank hops, bounce up, canopy run, flat walk, high perch, low boughs). The mixer's own node labels: 0.27 (0.18-0.28) Normal, 0.26 Easy (6 shared of 22: bank hops, bank walk, bounce up, crossings, log jam, stump hop). era: a 20 s look-alike on **15/16** rolls. | **MISS** (on our metric and on the tagger; only the mixer's own labels pass, and they are not comparable with the references, which have no labels) | Both are built by one mixer from one floor deck (`w1mix.ts:53` FLOOR = bank hops, stump hop, lily-pad hop, log jam) and one W1 kit; 4 of the 6 shared labels are floor ideas. |
| #115 1-1 vs 1-5 <= half their ideas | as #103 | as #103 | **MISS** | as #103 |
| #15 CP3's 1-5 draws only proven ideas; World 1's 14 | the count and names printed by the tool | `library.ts` IDEAS: **23** (list in `out/ideas-list.txt`), not 14 (or 14 + 4 = 18). 1-5's decks hold `crumbling ledge` and `bridge span` (`stages.ts:25`, `:37`), which the line says wait until proven. | **MISS** (the spec's count is not the code's) | The library grew with 1-1's ideas (floor walk, bounce mound, stump tops, double gap, double chain, top branch). |
| #22 a stage has >= 4 ideas | >= the lower of Matt's references | tagger ideas per stage: old 1-1 6 (4-6), today's 1-3 8, old 1-3 7 (5-8). Lower reference: old 1-1, 4 at worst. Mixer 1-1 **6** (6-6), 1-5 **6** (6-6) both settings. Shipped 1-8 2-3 and the lair 1-10 2 (both fixed set pieces). | **PASS** (1-1, 1-5) | — |
| #40 kind or size band changes at least every 2 pieces | runKS no looser than old 1-1 (<= 7) | longest run of one kind x size band, worst roll: mixer 1-1 **3** Normal / 3 Easy; 1-5 **3** / 2. Old 1-1 7 (3-9). | **PASS** | — |
| #41 canopy over floor as a burst of 2-5 pieces | the 2-5 band covers old 1-1's stretches | old 1-1 canopy stretches (fork + canopy run), boughs each, 16 layouts: 1 piece x32, 3 x28, 4 x15, 5 x35: **78 of 110 (71%)** inside 2-5; 32 are single boughs. (Mixer 1-1: 57 of 194 inside 2-5; 137 single.) | **MISS** (the band leaves out old 1-1's single-bough stretches) | — (a calibration finding: old 1-1's band is 1-5) |
| #43 each node draws only from its own deck | the check fails on a cross-deck draw | 1,600 draws over 1-1 and 1-5 x 16 x 2: **58 outside their node's deck** (1-1 n3's high road drew bank hops 32 times; 1-5 n12's 26 times). The guard that exists throws only for a node's bursts (`w1mix.ts:972`), not for fork roads. | **MISS** | A fork road's second idea falls back to `bank hops` / `stump hop` when its deck's other idea was laid by the node before: `src/game/mixer/w1mix.ts:998`. |
| #44 creaky >= 15% of landings and top 3 | today's 1-5 | 1-5 creaky + crumbling share: Normal **22.1%** (19.9-23.0), Easy 21.4% (20.5-24.2); rank 3 on every Normal roll, 2-3 on Easy. | **PASS** | — |
| #46 bridge only as the stair's top piece | "something new" mean (newMeanPx) no worse than old 1-1's 572 | mixer 1-1: **359** (338-388) px with its bridges, 373 (350-401) with them taken out of the count; Easy 444 / 478. 1-5: 258 / 276. (Lower is more often new.) | **PASS** (with or without the bridge) | — |
| #102 boughs + creaky <= 30% of 1-1's landings | cap at old 1-1's share | old 1-1: **25.3%** (1.0-28.2). Mixer 1-1: Normal **35.3%** (33.5-36.4), Easy 31.9% (30.5-33.5). Over both 30% and old 1-1. | **MISS** | 1-1's canopy half (n8-n11) and the canopy over every floor burst (`w1mix.ts:973`, `over`) lay boughs and catch branches. |
| #116 1-1 caps: boughs + creaky <= 30% | as #102 | as #102 | **MISS** | as #102 |
| #132 core pieces >= 50% of landings | >= old 1-1's top-3 share | old 1-1's top-3 kinds hold **98.9%** (89.0-99.5). Mixer 1-1's core (bank, log, stone; `stages.ts:52`) **61.8%** (59.8-62.8) Normal, 64.4% Easy; 1-5's core (branch, creaky, bank; `stages.ts:13`) 75.8%, 74.4%. All clear the spec's 50%. | **MISS** on the row's line (old 1-1 has only 5 kinds, so its top 3 is nearly everything; the spec's own 50% passes) | — (a line conflict for the designer: the row's rule fights the kinds line) |
| #134 bank: W1-W4, W6-W10 | table = library | bank (moss_stone >= 60 px) laid in **W1-W7, W9, W10**, not W8 (`out/kinds-world.txt`; library.txt:3 the same). The table leaves out W5 (37.8% of W5's landings) and W7 (71.8%). | **MISS** | — |
| #135 log: W1-W4, W6 | table = library | logs in **all 10 worlds** (W6 88%, W8 89%). | **MISS** | — |
| #136 stump: W1-W4, W6 | table = the atlas | no stump landing kind exists (`library.ts` PIECES: bank, stone, log, mushroom, crumble, branch, creaky, bridge, lily, reed). Atlas `stump` frames (`out/atlas-find.txt`): W1 (protoAtlasData, dressAtlasData `w1Stump`, `w1WoodStump`) and every world W2-W10 (kitAtlasData), plus prop stumps W4, W5, W8. | **MISS** (as a landing it exists nowhere; as art it exists in all 10) | — |
| #137 mushroom: W1, W3, W6 | table = library | bounce pieces in **W1, W3, W4, W5, W7-W10**; none in W2 or **W6**. | **MISS** | — |
| #138 bough: W1, W2's banks, W5, W6, W8 | table = library | branch in **all 10 worlds**. | **MISS** | — |
| #139 creaky: W1, W5, W6, W8 | table = library | creaking limbs (fragile branch with a creak) **W1 only**; other breakables: snap twigs W1, W5, W7-W10. None in W6. | **MISS** | — |
| #140 crumble slab: the row reads W7 only | the row says W7 only | the spec table still reads "W1 (shrine stone, see note 2), W7" (ENGINE-SPEC:1402). Built: the ruin slab is laid in **W1** (1-5's crumbling ledges, 0.4% of W1's landings: `w1mix.ts:161` `style: 'ruin'`), W7, W8, W9, W10. | **MISS** (the row still names W1, and the build still lays the slab in W1, which ES 1446-1452 calls a breach) | `src/game/mixer/w1mix.ts:161`; the art is World 7's (`src/game/crumbleArt.ts:1-3`). |
| #141 bridge: W1, W5, W6 | table = library | bridges in **W1, W2, W5, W8, W9, W10**; none in W6. | **MISS** | — |
| #142 Fix 1: no stump kind; the planner says which | the fix names the kind the code has | the code has **no stump kind**: a stump is a flag on a log (`w1mix.ts:208`) drawn as a post (`w1mix.ts:798`), 1.5% of W1's landings. So the fix's "only drawing" branch holds: 1-1's core is bank and log. The spec still reads "Planner: say which" (ENGINE-SPEC:1409-1411). | **MISS** (answer above; the spec text is not updated) | — |
| #143 Fix 2: crumble by the shrine stones only | the fix is struck | not struck: ENGINE-SPEC:1412-1413 still reads it; the correction sits apart at :1446-1452. | **MISS** | — |

**Topic 3: 4 PASS (#22, #40, #44, #46), 22 MISS.**
