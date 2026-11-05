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
| #121 breaking / creaky at 1-5 | table = ML | engine-mixer: first **1-2** on every roll (11-21 creaky limbs), also 1-4 (9 every roll), 1-5 55-63. main: first 1-5 (8-24). | **MISS** (the table text matches main, not today's build) | The build is what ruling C9 says ships ("1-2 teaches lianas and creaky", ENGINE-SPEC:1756, d272601f, 6dae405d); the table row still reads 1-5 under its `[revised: C9]` tag (ENGINE-SPEC:1288). So the fix is the table's text, not the build. Where it is laid: 1-2's rhythm builder lays creaky limbs: `src/game/w1Rhythm.ts:1192` (`type: 'fragile', creak: q.hold ?? 0.6`); 1-4's kapok lays them: `src/game/protoStage.ts:6175`, `:6392` (`CREAK_S` 0.6 s, `:5655`). |
| #122 liana at 1-6 | table = ML | engine-mixer: first **1-2** (11 lianas every roll), 1-4 2, 1-6 18-31. main: first 1-6. | **MISS** (the table text) | As #121: C9 rules 1-2 teaches lianas; the table row still reads 1-6 (ENGINE-SPEC:1289). Laid at `src/game/w1Rhythm.ts:453` and `:1213` (`vineType: 'swing_liana'`). |
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
| #92 S-9 stepping stone <= 50 px above the water | at 50 px the stone still reads "in the water" on Matt's phone frame (stills, 30/50/70 px, both ways) | No builder lays a water zone at 021ef4e93, so the stills use a **scratch scene**: the engine-render tip (`7f63ed0c1`, which carries the water draw) built for dev with one uncommitted page-hook line, and the scene laid into 1-1 layout 1 at x 520-1760 (a bank, 800 px of drawn water, three 96 x 40 px moss stones, a bank). `node tools/engine/runs/stills-water.mjs` -> `out/stills/92-stone-{30,50,70}px-over-water-{upright,sideways}-SCRATCH.jpg` (2x). Looked at as a phone shows it: at **50 px** the stone's bottom (10 px over the surface) meets the water's lit top, no sky between, both ways; at **70 px** a clear band of background shows under it (it floats). In these stills no base reaches down into the water under a stone (S-9 asks engine-render to draw one; at this tip it does not show). | **PASS** (50 px still reads in the water; 70 does not) | — (the second stone draws as a stacked slab, a different art variant of the same piece) |

**Topic 2: 1 PASS, 1 MISS.**

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
| #2 neighbours share <= half their main pieces (C14: our metric, cap calibrated) | era/lookalike: no 20 s look-alike between stages of a world (SR §2, window 0.30); tagger Jaccard <= 0.75 (calibrated above) | era, mixer W1 neighbours, rolls of 16 with a look-alike: 1-1/1-2 **16**, 1-2/1-3 0, 1-3/1-4 0, 1-4/1-5 0, 1-5/1-6 0, 1-6/1-7 1, 1-7/1-8 0, 1-8/1-9 0. Tagger Jaccard, median (min-max): 1-1/1-2 0.67, 1-2/1-3 0.50, 1-3/1-4 0.62, 1-4/1-5 0.38, **1-5/1-6 0.71 (0.57-0.86)**, 1-6/1-7 0.57 (0.50-0.67), 1-7/1-8 0.33, 1-8/1-9 0.29. | **MISS** (1-1/1-2 plays alike on 16/16 rolls; 1-5/1-6's worst roll 0.86 > 0.75) | The closest windows (`tools/engine/runs/lookpair.ts` -> `out/era/lookpair.txt`, lookalike.ts's own closestLook on eraRoll's windows, layouts 1-4): 1-1 at 44-86 s (its ground nodes) against 1-2's opening and 1-5's floor bursts, distance 0.13-0.29, every one a run of 10-12 `J\|short\|level` jumps with a hop or two. The floor ideas step only +-30 to +-50 px (`src/game/mixer/w1mix.ts:362` bank hops, `:364` stump hop `[40, -40, -70, 30, -30]`, `:413` log jam `[50, -50, 40, -40]`, `:415` floor walk `[30, -30]`), and the look measure calls a rise "up" only over 40 px and "down" only past 60 (`tools/inspect/lookalike.ts:76`), so to it nearly every floor jump is the same short level jump. |
| #8 the variety gate counts the whole library; neighbours <= half | as #2 | as #2 | **MISS** | as #2 |
| #21 a stage is a sequence of node ideas; neighbours <= half | as #2 | as #2 | **MISS** | as #2 |
| #105 neighbours <= half their main pieces | as #2 | as #2 | **MISS** | as #2 |
| #103 1-1 and 1-5 share <= half their ideas | as #2 (the spec keeps the rule though they are not neighbours) | tagger: **1.00 on 16/16 rolls** both settings (the same six: bank hops, bounce up, canopy run, flat walk, high perch, low boughs). The mixer's own node labels: 0.27 (0.18-0.28) Normal, 0.26 Easy (6 shared of 22: bank hops, bank walk, bounce up, crossings, log jam, stump hop). era: a 20 s look-alike on **15/16** rolls. | **MISS** (on our metric and on the tagger; only the mixer's own labels pass, and they are not comparable with the references, which have no labels) | Both are built by one mixer from one floor deck (`w1mix.ts:53` FLOOR = bank hops, stump hop, lily-pad hop, log jam) and one W1 kit; 4 of the 6 shared labels are floor ideas. The alike windows are the floor bursts' short level jumps (as #2: `w1mix.ts:362-415` against `lookalike.ts:76`; 1-1 at 44-86 s vs 1-5 at 130-156 s, distance 0.17-0.29). |
| #115 1-1 vs 1-5 <= half their ideas | as #103 | as #103 | **MISS** | as #103 |
| #15 CP3's 1-5 draws only proven ideas; World 1's 14 | the count and names printed by the tool | `library.ts` IDEAS: **23** (list in `out/ideas-list.txt`), not 14 (or 14 + 4 = 18). 1-5's decks hold `crumbling ledge` and `bridge span` (`stages.ts:25`, `:37`), which the line says wait until proven. | **MISS** (the spec's count is not the code's) | The library grew with 1-1's ideas (floor walk, bounce mound, stump tops, double gap, double chain, top branch). |
| #22 a stage has >= 4 ideas | >= the lower of Matt's references | tagger ideas per stage: old 1-1 6 (4-6), today's 1-3 8, old 1-3 7 (5-8). Lower reference: old 1-1, 4 at worst. Mixer 1-1 **6** (6-6), 1-5 **6** (6-6) both settings. Shipped 1-8 2-3 and the lair 1-10 2 (both fixed set pieces). | **PASS** (1-1, 1-5) | — |
| #40 kind or size band changes at least every 2 pieces | runKS no looser than old 1-1 (<= 7) | longest run of one kind x size band, worst roll: mixer 1-1 **3** Normal / 3 Easy; 1-5 **3** / 2. Old 1-1 7 (3-9). | **PASS** | — |
| #41 canopy over floor as a burst of 2-5 pieces | the 2-5 band covers old 1-1's stretches | old 1-1 canopy stretches (fork + canopy run), boughs each, 16 layouts: 1 piece x32, 3 x28, 4 x15, 5 x35: **78 of 110 (71%)** inside 2-5; 32 are single boughs. (Mixer 1-1: 57 of 194 inside 2-5; 137 single.) | **MISS** (the band leaves out old 1-1's single-bough stretches) | — (a calibration finding: old 1-1's band is 1-5) |
| #43 each node draws only from its own deck | the check fails on a cross-deck draw | 1,600 draws over 1-1 and 1-5 x 16 x 2: **58 outside their node's deck** (1-1 n3's high road drew bank hops 32 times; 1-5 n12's 26 times). The guard that exists throws only for a node's bursts (`w1mix.ts:972`), not for fork roads. | **MISS** | A fork road's second idea falls back to `bank hops` / `stump hop` when its deck's other idea was laid by the node before: `src/game/mixer/w1mix.ts:998`. |
| #44 creaky >= 15% of landings and top 3 | today's 1-5 | 1-5 creaky + crumbling share: Normal **22.1%** (19.9-23.0), Easy 21.4% (20.5-24.2); rank 3 on every Normal roll, 2-3 on Easy. | **PASS** | — |
| #46 bridge only as the stair's top piece | "something new" mean (newMeanPx) no worse than old 1-1's 572 | mixer 1-1: **359** (338-388) px with its bridges, 373 (350-401) with them taken out of the count; Easy 444 / 478. 1-5: 258 / 276. (Lower is more often new.) | **PASS** (with or without the bridge) | — |
| #102 boughs + creaky <= 30% of 1-1's landings | cap at old 1-1's share | old 1-1: **25.3%** (1.0-28.2). Mixer 1-1: Normal **35.3%** (33.5-36.4), Easy 31.9% (30.5-33.5). Over both 30% and old 1-1. | **MISS** | Most of it is **catch branches** under gaps (27.0% of 1-1's landings Normal, 23.2% Easy; plain boughs only 8.4% / 8.6%): the ones under each gap of a safe teach and of the opening seconds (`src/game/mixer/w1mix.ts:1045`, `:1065`, `:1148`) and under each double (`:425`, `:440`). Per build: n2 teach jump 17.9 catches, n7 14.5, n3 9.6, n5 9.4, n10 9.9. Whether a catch branch counts as a "bough" for this cap is the designer's call; counted as one, as CP1's kinds do. |
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
| #142 Fix 1: no stump kind; the planner says which | the fix names the kind the code has | the code has **no stump kind**: a stump is a flag on a log (`w1mix.ts:208`) drawn as a post (`w1mix.ts:798`), 1.5% of W1's landings. The spec answers it later in the same words: "The stump: it is drawing only, never a landing by itself. 1-1's core is bank and log" (ENGINE-SPEC:1697-1698), though Fix 1 at :1409-1411 still reads "Planner: say which". | **PASS** (the spec's answer at :1697 is the code's) | — |
| #143 Fix 2: crumble by the shrine stones only | the fix is struck | not struck: ENGINE-SPEC:1412-1413 still reads it; the correction sits apart at :1446-1452. | **MISS** | — |

Note on #134-#141: ruling C23 (ENGINE-SPEC:1770) moves the worlds column to LABELS.md, now `src/game/mixer/catalog.ts`. Against the
measured inventory at 16 layouts (`out/kind-worlds-16.txt`) the catalogue's own worlds differ too: crumbling floor (catalogue W7-W10;
laid W1, W7, W9, W10, none in W8), drift log (W2, W6, W8; laid W2 only), lily pad (W1, W2, W6; **none laid anywhere**), bounce mushroom
(W1, W3, W4, W7; laid W1, W4, W7). The committed inventory (2 layouts) is what the catalogue was checked against.

**Topic 3: 5 PASS (#22, #40, #44, #46, #142), 21 MISS.**

## 4. The support check and floating (step 6)

No E3 support check existed (grep "support check|unsupported" over `tools/` and `src/game`: only notes in `catalog.ts`), so
`tools/engine/runs/support.py` is the smallest one (its header gives the rule): a landing is held by **ground** (a solid block 50 px or
deeper, which terrain.ts draws down to the screen's bottom, `src/game/groundFloor.ts:4-5`), **rests** on another top, sits on a stump
**post** (`w1mix.ts:208`, `:798`), or is inside a drawn **trunk** (the mixer's `proto.trunks`) or a stage **tree** (`stage.trees`);
otherwise it **floats**. **What it cannot see:** supports the draw adds that the stage data does not carry (gen2's columns under thin
ruin ledges, `columnArt.ts`; the scenery kapoks drawn behind 1-2's canopy logs, commit `38136a2e`), so where those are drawn it is an
upper bound. Command: `python3 -I tools/engine/runs/support.py <dumps of all 10 worlds, 16 x 2>` -> `out/support-all.txt`.

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #130 1-1 float cap <= 15% | <= old 1-1's share | mixer 1-1 floats **25.4%** (23.9-27.7) of landings Normal, 23.9% (21.9-25.2) Easy; old 1-1 25.3% (1.0-28.2). Of 1-1's 61 floating landings a build, **50 are catch branches**, 6 boughs, **3 rope bridges** and 1 perch. | **MISS** (over 15%; level with old 1-1 on the median, 25.4% vs 25.3%) | the catch branches under gaps (`w1mix.ts:425`, `:440`, `:1045`, `:1065`, `:1148`) have nothing under them by design. Bridges are on the "never float" list (ENGINE-SPEC:1357): 3 a build float. The still `out/stills/80-flag-8px-off-top-sideways-SCRATCH.jpg` shows two of these catch pieces, drawn as logs, hanging in the pits beside the flag with nothing under them. |
| #131 1-5 and default <= 25% | <= 25% (and old 1-1's share) | mixer 1-5 **29.4%** (27.2-32.6) Normal, 19.6% (16.6-22.8) Easy. Of its 77 floating landings a build: **27.7 creaky limbs**, 13.5 catch branches, 13.1 perches, 10.1 boughs, **7.2 rope bridges**, **5.1 ruin crumble slabs**. | **MISS** (Normal) | Creaky limbs, bridges and the slab are "never float" kinds (ENGINE-SPEC:1357; LABELS §0 rule 1 for the slab): about 40 of them float in every Normal build. The slab: `w1mix.ts:161` laid "on low floats" (`w1mix.ts:460`). |
| #157 float default "some, <= 25%" | LABELS §4: each world's cap is its shipped share, rounded up to the next 5% | pooled share of floating landings, Normal (Easy within 0.02): W1 37.1% (cap 40%), W2 9.6% (10%), W3 4.9% (5%), W4 18.7% (20%), W5 28.7% (30%), W6 2.1% (5%), W7 22.2% (25%), W8 10.1% (15%), W9 55.2% (60%), W10 62.3% (65%). Floating no-float pieces (rocks, ruin) over 16 builds a stage: W1 82, W2 16, W3 32, W4 16, W5 286, W7 2,923, W8 422, W9 3,595, W10 5,235 (in W7-W10: thin 26-28 px moss_stone and ruin ledges, e.g. 9-1 L1 `moss_stone 112x26 at (1608,505)`). Old W1 (main): 26.0%, and 0 floating rocks. | **MISS** (W1, W5, W9, W10 exceed 25%; the per-world caps above are the measured ones LABELS §4 asks for) | W7-W10's are gen2 ledges (their columns, if drawn, are not in the stage data); not traced further here. |
| #120 exit totem / shrine on a long ground piece | nothing floats (SR:602-603); the gate's foot fits | the W1 gate is drawn **195 x 250 px** (`stageArt.ts:307`, frame 498x638, `stageArtData.ts:12`). Its foot fits on its piece on **16/16** layouts x 2 settings in 1-1 to 1-9 (`out/exitfoot.txt`). What holds the piece up: 1-1, 1-3, 1-5 to 1-7, 1-9, 1-10 ground (16/16); 1-4 a tree; **1-2 Normal a 24 px branch with nothing under it in the data on 14/16** (1-2 draws scenery kapoks the data does not carry, `38136a2e`); **1-8 a 40 px plain piece, floating**, on 16/16 (the chase). | **PASS** for the engine's 1-1 and 1-5; **MISS** for the shipped 1-8 (and 1-2 unproven) | 1-2: `src/game/w1Rhythm.ts:739-740` (the cool-down apron the exit stands on). |
| #80 P-5 flags, marks, hearts: base within 4 px of a top | no visible gap at the chosen tolerance (stills at 0/4/8 px) | numbers (`tools/engine/runs/seat.py` -> `out/seat.txt`): every checkpoint flag in 1-1 and 1-5 stands **0 px** off a top (177 + 338 + 224 + 449 flags). Hearts sit 34-90 px above the top under them and the find 26 px: a pickup's y is its middle and it bobs by design. Meeca's marks are drawn on posts (`vectorArt.ts:1263-1275`, `drawMeecaPost`), not in the stage's pickups. Stills of 1-1's second flag (x 1694) raised 0, 4 and 8 px off its ledge, both ways, the same scratch build (`tools/engine/runs/stills-flag.mjs` -> `out/stills/80-flag-{0,4,8}px-off-top-*-SCRATCH.jpg`): the flag's foot plate sits in the ledge's grass, and no gap reads at 4 px or at 8 px at phone size. | **PASS** (flags 0 px; 4 px reads seated, so does 8) | — |
| #119 crumbling ledge: element as its art shows | the atlas key | the only crumbling-tile art is World 7's ruin slab (`src/game/crumbleArt.ts:1-3`, `src/assets/w7/crumble.webp`), a stone element. The catalogue's own label gives it worlds 7-10 (`catalog.ts:65`), but it is laid in **W1** (1-5's crumbling ledges, `w1mix.ts:161`). | **MISS** (a stone slab in a W1 forest stage) | `src/game/mixer/w1mix.ts:161` |
| #147 1-5's ground breakable is W1 rotten wood, else an art gap | the atlas key | atlas search over all 7,446 packed frames (artuse.mjs's own collector; `tools/engine/runs/atlas-find.mjs` -> `out/atlas-find.txt`, `out/atlas-find2.txt`): no frame named rotten, decay or punk anywhere; W1's breakables are `branchCreak`, `snapL`, `snapR` (protoAtlasData), all branch art. | **MISS: an art gap** (for the picture list; no HF spend made) | — |
| #98 further boughs hang from a shared trunk's side branch | an atlas side-branch frame, else an HF list item | no frame matching side branch / limbSide / forkBranch; W1's only branch frames are `branch` and `branchCreak` (`out/atlas-find2.txt`). | **MISS: an art gap** (for the picture list) | — |

**Topic 4: 1 PASS (#80), 7 MISS (#120 counts as a MISS: it is a rule for every stage, and it passes only for 1-1 and 1-5).**

## 5. Pacing and rests

Commands (engine-mixer worktree): the first-timer sweep `SID=<id> npx tsx tools/engine/runs/ftsweep.ts 1 16` (the real-engine bot,
tools/inspect/firsttimer.ts; adult on Normal, kid on Easy) -> `out/bots/ft-mixer-<id>-16.json`, read per node by
`python3 -I tools/engine/runs/ftnodes.py` -> `out/bots/ftnodes-mixer.txt`; the arc `python3 -I tools/engine/runs/arc.py` ->
`out/arc.txt`; the fun gate's own dead-walk measure with its limit at 0 `SID=<id> npx tsx tools/engine/runs/deadwalk.ts` ->
`out/fun/deadwalk-mixer.txt`.

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #31 up and down node by node, overall trend down (1-5) | the trend matches the profile on every roll, and no two neighbouring nodes move the same way | 1-5 ends lower than it starts on **16/16** rolls both settings (Normal +111 to +922 px, Easy +204 to +1,188). Neighbouring nodes moving the same way, per roll: Normal 0-5 (median 3; 0 on 1 roll), Easy 1-9 (median 4). (1-1, profile "up": ends 390-615 px higher on 16/16, with 2-6 same-way neighbours.) | **MISS** (trend PASS; alternation MISS on 15/16 Normal rolls) | — (n1-n3 all climb on most rolls: n1 up 14/16, n2 13/16, n3 9/16) |
| #33 n3 a local rise (1-5) | the rise visible both ways; n3's time inside its group length (5-20 s) | n3 rises (> 20 px) on 9/16 Normal rolls (by 40-178 px), is level on 5, falls on 2; it is the stage's first rise on 1/16 (n1 rises first on 14). The bot spends 12.1-21.3 s in n3 on Normal, 14.3-22.9 s on Easy. | **MISS** (not a rise on 7/16; over 20 s on 1 Normal and 7 Easy rolls) | — |
| #39 1-5's teach pairs with bank hops; the rest is one short walk | n2's longest eventless walk <= 2.0 s Normal / 3.0 s Easy (GP:291) | n2: Normal **1.8 s** worst (1.7 median), Easy **3.1 s** worst (2.8 median). | **MISS** (Easy by 0.1 s) | n2's 600 px bank (`w1mix.ts:369`) at Easy's x1.35 width. |
| #50 n2's teach bank 900 -> 600 px | eventless walk <= 3.0 s Easy / 2.0 s Normal at 600 (built) and 720 | built at **600** (`w1mix.ts:369`): Normal 1.8 s, Easy 3.1 s, as #39. 720 is not built; making it would be an edit to src/game, which is the planner's. | **MISS** (Easy at 600) | as #39 |
| #94 the double breather adds about a minute (Easy about 5:20) | the measured minute replaces the estimate | **Not run**: the double breather is not built at 021ef4e93 (no such node or option in `stages.ts`); building it is the planner's. For reference, today's Easy quick clock: 1-5 261 s (256-268), 1-1 163 s (155-171) (`out/bots/dial-1-5.txt`, `-1-1.txt`, d 0 row = today's build within its 0.09 dial). | **NOT RUN** | — |
| #95 (a) double breather about 0.52; (b) keep 0.61 | measure (a)'s Easy pacing number | **Not run**, as #94. | **NOT RUN** | — |
| #104 n9 (1-1) the moment: 3-4 rising doubles, catch boughs below | first-test success about 0.85 Normal adult / 0.92 Easy kid (R3:60-61), and every miss lands on a catch bough | counted runs only (validator method step 4): the adult **12 of 16** (4 had 4 rescues), the kid **3 of 16** (13 had 4-6 rescues: the bot, see the method's pitfalls). n9's jump tries that land: adult **0.766** (94 tries), kid **0.647** (17). Misses that cost a life: adult **1.08 a run** in n9, all pit falls; kid 0 lives (Easy's soft falls). | **MISS** (the adult under 0.85, misses not caught; the kid's number rests on 3 runs) | the catch bough under each rising double is `g + 80` px wide, 60 px under the take-off (`src/game/mixer/w1mix.ts:440`); the adult's pit falls pass it. |

**Topic 5: 0 PASS, 5 MISS, 2 not run (the double breather is not built).**

## 6. Difficulty and the dial

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #17 turtles <= 2 in a line on Easy, 3 on Normal | <= 1 heart lost per line | cp2-animals.ts's measure on the shipped 2-5 and 2-9, 16 layouts (`tools/engine/runs/animals.py` -> `out/bots/animals.txt`; turtles within 400 px = a line; only turtles he reached). **Line sizes** (the stage, no bot needed): Normal lays lines of **4** (54 in 2-5, 48 in 2-9 over 16 runs' reach), Easy 1-2. **Hearts per line: not judged.** Under the validator method (`reference/methods/validator.md` step 4, a run with no shrine or over 3 rescues is not counted) no Normal run counts on 2-5 or 2-9 (all 16 end at the sealed door: the adult gets 7-18 of a 16-32 goal) and one Easy run each. Raw, every run: Normal lines of 4 lose <= 1 heart on 51/54 (2-5); Easy pairs on 33/56. | **MISS** (Normal lays lines of 4; the heart part is not judged) | 2-5 and 2-9's shipped W2 builders (not traced to a line here); the bot's goal miss on W2 is the bot's or the stage's, unproven |
| #18 past each animal with <= 1 heart lost | first test ~0.85 Normal adult / ~0.92 Easy kid with none lost (R3:60-61) | counted runs only (as #17): 1-9 adult (5 runs) passes boas with none lost 1.00 and snakes 0.94; 1-9 kid (7 runs) boas **0.85**, snakes 0.96; every meeting counted, not only the first. With <= 1 lost: 100% everywhere counted. Turtles: not judged (as #17; raw Easy no-loss 0.38 / 0.62). | **MISS** (the kid at 1-9's boas, 0.85 against 0.92; turtles not judged) | — |
| #19 a first-timer pausing has about 0.3 s spare at 0.7 s | the spare time >= 0.3 s | the engine breaks a tile exactly `crumbleAfter` after he lands on it (`engine.ts:2484`, `:2592-2594`): 0.7 s Normal, 1.0 s Easy (`w1mix.ts:161`). The first-timer's stop-and-go *(estimate from its own parameters, `firsttimer.ts:114-121`)*: the adult's stopReact 0.30 + thumb 0.03 + late lift about 0.03 = 0.36 s, so **0.34 s spare** at 0.7; the kid's 0.40 + 0.09 + about 0.07 = 0.56 s, so **0.44 s spare** at Easy's 1.0 (0.14 s at 0.7). No FT_PAUSE probe exists (TRIAGE names one; none in tools/). In 32 runs of 1-5 neither bot lost a life or a heart to a crumbling tile (`out/bots/ft-mixer-1-5-16.json`). | **PASS** *(estimate)* | — |
| #63 d = (0.1(w-1) + 0.2(s-1)/8) / 1.1 | bands.ts score rises with every stage inside a world; no stage above the next world's first (SR:133) | `npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer` (seed 1, 2 first-timer trials: the tool's own mode) on main and today's -> `out/bands/inspect-*-W1W4.json`; `python3 -I tools/engine/runs/bandfit.py` -> `out/bands/bandfit.txt`. Old W1-W4 Normal: the score falls from one stage to the next **13** times; **12** stages sit above the next world's first; score = 17.3 + 31.9 d, r = 0.46 (Easy r = 0.16). Today's: 13 falls, 15 above, r = 0.42 (Easy 0.08). | **MISS** (the measured difficulty does not follow d: it rises only loosely with the world and not stage by stage) | the stages are not built to a dial (only the mixer reads d, `w1mix.ts:884`) |
| #64 each dial linear in d | the bots' success falls with d on every knob | `SID=<id> npx tsx tools/engine/runs/dial.ts` (the same plan built at d 0 / 0.45 / 1 through the config; `out/bots/dial-1-5.txt`, `-1-1.txt`): jump-bot mean success on 1-5 Normal 1.000 / 1.000 / 1.000, worst jump 0.98 / 0.99 / 0.99; Easy 1.000 / 1.000 / 1.000, worst 0.93 / 0.955 / 0.945; 1-1 Normal 0.999 at all three. The knobs cannot be moved one at a time without an edit to src/game (they all read one d, `w1mix.ts:884-896`). | **MISS** (success does not fall with d; the bot barely sees the dial) | Easy's rise cap is pinned: the gate's highest Easy rise is **30 px** (`out/bots/flick.txt`), so `max(30, 30 x share)` = 30 px at every d (`w1mix.ts:895-896`); Normal's gap share moves the gap only 54 -> 91 px. |
| #66 rise share Normal 0.50 -> 0.95, Easy 0.40 -> 0.80 | flick window >= 167 ms Normal / 300 ms Easy at the top of each band (GL:72) | the real engine, CP2's window measure (`tools/engine/runs/flick.ts` -> `out/bots/flick.txt`) on the mixer's own pair at each d: Normal at d 1 (rise 76 px, gap 51): full 509 ms, **flick 316 ms**; Easy at d 1 (rise 30, gap 44): full 632 ms, **flick 474 ms**. | **PASS** | — (Easy's top rise is 30 px at every d, as #64) |
| #68 risky pieces a burst | expected falls per node in R4's bands: intro 0, spike 0.2-0.4, climax 0.3-0.6 Normal | lives lost a run per node, adult Normal, counted runs (`out/bots/ftnodes-mixer.txt`): 1-1 (12 runs) n3 0.08, **n4 teach bounce 0.92**, **n9 (climax) 1.08**, the rest 0; 1-5 (16 runs) n4 fork 0.25, n6 0.06, n8 0.06, **n10 master 0.00** (0.19 hits). | **MISS** (1-1's teach and climax over their bands; 1-5's climax under) | 1-1 n4: the bounce mound starts 30 px past its pad over an open drop (`w1mix.ts:407`); every n4 life is a pit fall there. n9 as #104. |
| #70 taught animals a stage | >= 35% animal-free nodes, and no fewer than old W1-W4 at the same d | animals per stage, median of 16 layouts (`out/animals-per-stage.txt`): mixer 1-1 0, **1-5 0**; old 1-1 0, old 1-5 1; old W1: 0, 0, 23, 1, 1, 2, 0, 5, 17; W2 0, 0, 0, 0, 21, 2, 1, 0, 30; W3 0, 0, 18, 2, 0, 0, 0, 0, 21; W4 0, 0, 0, 0, 0, 1, 0, 0, 0. Animal-free nodes: 1-5 100%. | **MISS** (1-5 has 0 against old 1-5's 1) | 1-5's spec lays no animal (`stages.ts:8-41`). |
| #72 timed windows Normal x1.0 -> x0.75, Easy x1.15 -> x0.9 | every piece's window at d 1 >= 300 ms Easy / 167 ms Normal | the timed pieces do not read the dial: creak 0.88 s Normal / 1.2 s Easy (`w1mix.ts:159`), crumble 0.7 / 1.0 s (`w1mix.ts:161`), at every d. So at d 1 they are 880 / 1,200 ms and 700 / 1,000 ms, all over the floors. | **PASS** on the floor (and a finding: the x0.75 line is not built) | `w1mix.ts:159`, `:161` (fixed holds) |
| #73 bursts a node 2 -> 3 | length inside SR:36-38 (2-5 min first-timer) | 1-5 quick clock at d 0 / 0.45 / 1: Normal 251 / 257 / **322 s**, Easy 261 / 263 / **313 s** (bursts 16 / 16 / 19); 1-1 173 / 179 / 186 s (its bursts are fixed at 3, `stages.ts`, so 14 at every d). See the note under this table on reading the quick clock against the first-timer. | **MISS** (1-5 at d 1 is over 5 min on the quick clock alone) | `w1mix.ts:946` (`Math.round(2 + L.dial)`) |
| #100 n7-n9 the only place in 1-1 where a miss costs a setback | only n7-n9 | adult Normal, 12 counted runs, lives lost a run: n3 0.08, **n4 0.92**, n9 1.08; none elsewhere. Kid Easy: 0 lives on its 3 counted runs, 2.3 soft falls a run (soft falls carry no x). | **MISS** (n4 and n3 cost lives too) | as #68 (`w1mix.ts:407`) |

Note on #73: the first-timer's own clock is not always slower than the quick clock: on today's 1-5 the first-timer's median run is 217 s
Normal / 214 s Easy against a quick clock of 252 / 261 s (`out/bots/ft-mixer-1-5-16.json`, `out/clock/clock-mixer-W1W4.txt`), because
the quick clock prices both fork roads' extras. So 322 s at d 1 is read on the quick clock; a first-timer run at d 1 needs the stage built
at d 1 in the bot, which the bot cannot be handed without an edit (`firstTimer(id, seed)` builds the stage itself).

**Topic 6: 2 PASS (#66, #72), 1 PASS by estimate (#19), 8 MISS.** Bot numbers count only the runs the validator method counts (no shrine or over 3 rescues: left out, and listed in the output files).

## 7. Rewards and pickups

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #25 <= 1 heart per risky node; fewer hearts than risky nodes | no heart in a node where the first-timer never loses a heart (MD:77-78) | Normal: 1-1 lays **0** hearts; 1-5 lays 2 (one in n6, where the adult loses 0.06 lives a run, and one at n10's end, where he takes 0.19 hits) against 4 risky nodes. Easy: the kid loses **no** heart on either stage (0 hits, 0 lives in 32 runs), yet Easy lays about 21 hearts a build on 1-1 and 28 on 1-5, in every node (`out/bots/ftnodes-mixer.txt`, hearts column). | **MISS** (Easy) | Easy's pass puts a heart beside every flag (`src/game/easyMode.ts:8`, `:222-224` heartBy); ruling C19 (ENGINE-SPEC:1766) already calls fixing it an engine change. |
| #28 <= about 8 pickups a view | <= old 1-1's max per orientation | pickups in one view (world px the camera shows at clipcheck's sizes inside the insets: **440 x 900 upright, 1,073 x 512 sideways**, `out/views.txt`), max over the stage, median of 16: old 1-1 upright 4 (3-4), sideways 7 (6-8). Mixer 1-1 Normal 2 / 5, **Easy 5 / 7**; 1-5 Normal 3 / 5, **Easy 5 / 6**. | **MISS** (Easy upright, 5 against 4) | — |
| #35 one mark per non-fork node (9), one per fork road (4) | each route's marks reachable on Easy | 1-5 lays 13 marks. The level check finds every pickup reachable (era's validate, `out/era/era-mixer-W1.json` 1-5 `errorKinds` {}); the kid bot collects **13/13 on 11 layouts and 12/13 on 5** (goal 8), the adult 13/13 on 15 (`out/bots/ft-mixer-1-5-16.json`). | **PASS** | — |

**Topic 7: 1 PASS, 2 MISS.**

## 8. Layout and geometry

Commands: `python3 -I tools/engine/runs/layout.py <cp1 dir> <W1 dumps>` -> `out/layout-W1.txt` (CP3's split and two-road rule, its
distance a parameter; fork bands; elements; drops; views); the camera's views `npx tsx tools/engine/runs/views.ts` -> `out/views.txt`; the
jump bot on one rise `npx tsx tools/engine/runs/risewidth.ts` -> `out/bots/risewidth.txt`.

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #1 two roads >= 120 px apart count as a split | the count at the chosen distance matches what Matt sees as two roads on a still | splits (two tops that far apart within 90 px, for over 300 px), at 80 / 120 / 160 / 200 px: old 1-1 34 / 34 / 25 / 25 (14-51 at 120); today's 1-3 18 / 19 / 6 / 4 Normal; mixer 1-5 26 / 26 / 26 / 8; mixer 1-1 10 / 4 / 3 / 3. | **NOT SETTLED** (numbers for the still; the line is Matt's eye, and no still was shot) | — |
| #12 a landing after +40 is >= 110 px | kid success >= 0.92 at the chosen width | the Easy kid's jump bot, +40 onto 90 / 110 / 130 / 150 / 220 / 300 px: **0.985-0.995** at every width (gaps 80 and 110). | **PASS** (90 px already clears it) | — (the jump bot's landing rule does not depend on width in this range, so it cannot pick a width; CP2's real-engine windows, `cp2/cp2-trace-easyfix.out`, are the finer measure) |
| #13 +50 to +70 only onto >= 220 px | as #12 at +50 / +60 / +70 onto 150 / 220 / 300 | kid: +50 0.98-0.995, +60 0.965-0.99, +70 **0.92-0.97**, the same at 90-300 px; adult 0.995-1.0. | **PASS** (150 px clears it; +70 over a 110 px gap is at the line, 0.920) | as #12 |
| #27 phone views | the spec's caps use clipcheck's two viewports minus insets | the spec now names them (ENGINE-SPEC:313: "upright 412 x 915 and sideways 915 x 412, with insets, as ... clipcheck.mjs:54-55"). In world px the camera shows **440 x 900** upright and **1,073 x 512** sideways inside the insets on 1-1 and 1-5 (zoom 0.936 / 0.763; 1-3 405 x 829 upright), read off the real engine's applyZoom (`engine.ts:1095-1117`). | **PASS** | — |
| #29 <= 2 kinds of hazard or animal a view | <= old 1-1's max | kinds of breakable or animal in one view: old 1-1 **0** both ways; mixer 1-1 0; mixer 1-5 **2** (1-2) both ways; today's 1-3 1. | **MISS** on the row's line (1-5's creaky and crumble are its theme; the spec's own 2 passes) | — |
| #30 <= 3 kinds of standing piece a view | <= old 1-1's max per orientation | kinds standing in one view (CP1's kinds, in the play band): old 1-1 4 both ways; mixer 1-1 **5** (5-6); 1-5 **6-7**; today's 1-3 4. | **MISS** (also over the spec's 3 everywhere, old 1-1 included) | — |
| #37 fork roads keep their own height band | the bands never come within the split distance (120 px) | gap between the two roads' height bands (crossing, step-down, catch and perch pieces left out): 1-1 Normal n3 200-250, n5 210-270, n10 220-300; Easy 140-240; 1-5 Normal n4 190-270, n10 170-254; **1-5 Easy n10 100-210**. | **MISS** (1-5 Easy n10's worst roll, 100 px) | the Easy fork keeps its roads within 400 px of each other and 240 px apart at the fork bank (`w1mix.ts:1008`, `ly = hy + 240` on Easy, and the road bands after it); a road's own steps eat into that. |
| #49 a floor idea joins each one-idea or climbing deck | the numbers are in the spec with the commit | the decks carry it (`stages.ts`: n3 `bounce up, the climb, stump hop`; n6 `snap dash, bank hops, log jam`; n7 `rotten-branch drop, stump hop`; n9 `bough stair, the climb, bank hops, log jam`). Today's numbers: 1-5 splits **26** (26-27) Normal / 20 Easy; two-road **41.1%** (40.3-43.0) / 26.7%. The spec's quoted 46-50% (8c8cd997) is not today's. | **MISS** (the spec's number is stale) | — |
| #52 fork share n4 + n10 15-20% each | struck or replaced by the measured line | today's 1-5: n4 **7.1%** (6.2-8.8), n10 7.9% Normal; Easy 5.5%, 6.0%. (The fork's x span over the stage's width.) The line stands unstruck at ENGINE-SPEC:516-517; C11 struck the 30-40% one. | **MISS** | — |
| #53 two forks with >= 3 crossings | (struck by C11) | crossing pieces per fork: **1** (0-2) on 1-1 and 1-5. | **MISS** against the line (C11 struck it, ENGINE-SPEC:1758) | — |
| #79 P-3 ground ends dressed; check drops over 120 px | every drop over 120 px shows a dressed end in stills | per build, bank and ground-log ends over a drop of more than 120 px: mixer 1-1 128 (Normal) / 103 (Easy); 1-5 137 / 138; old 1-1 204. **The stills were not shot**, and the end dressing (`proto.mixDress`) was not dumped. | **NOT RUN** (counts only) | — |
| #87 on Easy about 6 nodes keep the canopy, 3-4 drop it | the number in the spec with its commit | 1-5 Easy: **6** nodes carry a canopy burst on 16/16 rolls; 5 do not (3 of them rests, which never carry one). Normal: 8 and 2. | **PASS** (6 kept) | — |
| #88 kept canopies: fork neighbours and the node after a teach or test | Easy two-road share >= 20% (ES 1175) | Easy two-road share: 1-5 **26.7%** (25.9-27.2); 1-1 23.2% (21.3-24.4). (With and without the rule needs a build switch, an edit to src/game.) | **PASS** (as built) | — |
| #101 splits in the first half from the ground | the number with its commit (ES 1158: 098aff49, splits 2-4) | 1-1 splits 4 (4-5) Normal, 4 Easy, 2 of them in n8-n11, so **2** in n1-n7. | **PASS** | — |
| #108 splits whole stage >= 10 | >= 10 on 16/16 | 1-1: **4** (4-5) Normal, 4 Easy. (At 80 px: 10 (8-12).) | **MISS** | the ground half lays its splits only from its two ground forks; the hollow logs are not wired (ES 1172's ">= 12 with hollow logs"). |
| #109 splits n8-n11 >= 7 | >= 7 | **2** on 16/16, both settings. | **MISS** | n8-n11 is one climb, the double chain and one canopy fork (`stages.ts`); only the fork splits. |
| #110 two-road Normal >= 25% | >= 25% | 1-1 Normal **31.7%** (29.7-33.4). | **PASS** | — |
| #111 two-road Easy >= 20% | >= 20% | 1-1 Easy **23.2%** (21.3-24.4). | **PASS** | — |
| #114 1-1 elements: ground >= 70% n1-n7, tree >= 60% n8-n11, water 0 | shares printed per node range | ground in n1-n7: Normal **69.3%** (68.5-70.7), Easy 72.8%; tree in n8-n11: Normal **59.3%** (55.8-61.4), Easy 59.5% (57.5-62.8); water pieces 0. | **MISS** (Normal ground, both settings' tree, by 0.5-0.7 points on the median) | the catch branches under n1-n7's gaps count as tree (`w1mix.ts:1045`, `:1065`, `:1148`); in n8-n11 the logs of the double chain (`w1mix.ts:438`) count as ground. |
| #162 world default pass lines: today's 1-5 (splits 19, two-road 40%) | the default is no higher than the lowest stage Matt has approved | splits / two-road: old 1-1 34 (14-51) / 61.0%; today's 1-3 Normal 19 (17-19) / 42.7%, **Easy 16 (14-17) / 40.1% (37.8-42.1)**; mixer 1-5 26 / 41.1%, Easy 20 / 26.7%. | **MISS** (today's 1-3 on Easy is under 19 splits and, on its worst roll, under 40%) | — |

**Topic 8: 8 PASS, 10 MISS, 1 not settled (#1), 1 not run (#79).**

## 9. Art and look (the rows not in topic 4)

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #81 P-6 the upright screen is never half empty | >= old 1-1's share of views with play in the upper half | a sliding upright view (440 x 900 world px), the upper half over the play line holding a landing, a pickup, a vine top or a trunk (dressing is not in the stage data, so it is left out for both): old 1-1 **98.0%**; mixer 1-1 93.8% Normal, 94.0% Easy; 1-5 96.1% / 94.2%. All over the spec's 3 views of 4. | **MISS** on the row's line (under old 1-1's 98%) | — |
| #85 S-4 boughs share a tree (2-3 boughs) | 2-3 boughs on a shared tree | old 1-1 cannot be counted (its kapoks are scenery, not in the stage data). Mixer, trunks holding 0 / 1 / 2 / 3 / 4+ boughs: 1-1 Normal 899 / **94** / 35 / 7 / 0; 1-5 Normal 941 / **422** / 252 / 15 / 0. Of the trunks that hold a bough, 69% (1-1) and 61% (1-5) hold one. | **MISS** | — |
| #96 boughs within 220 px share one tree | every such pair on one trunk | pairs of boughs within 220 px on different trunks (or none): 1-1 **54 of 120**; 1-5 **653 of 1,109** (16 builds). | **MISS** | — |
| #97 <= about 3 full trunks a screen width | <= 3 (old 1-1 has no trunks in its data to compare) | trunks a view (the mixer's trunks at width 1 or more, and stage trees): 1-1 upright 2, sideways **3** (2-3); 1-5 upright 2 (2-3), sideways **3**. | **PASS** | — |

**Topic 9: 1 PASS, 3 MISS.**

## 10. Length

Command: `npx tsx tools/engine/runs/clock.ts <tree> 1-4` (cp3-lengths.ts's quick clock, at 16 layouts) -> `out/clock/clock-mixer-W1W4.txt`,
`out/clock/clock-main-W1W4.txt`. **The quick clock does not model the climbing and puzzle stages**: it gives 1-4 3 s, 2-6 5 s, 3-4 5 s,
4-1 1 s, 4-3 1 s, 4-6 3 s: an ascent is timed only from the steps its builder records (`stageTime.ts:152` sends every `ascent` to
`modelAscent`, which sums `stage.meta.ascentChain`, `:221`), and these stages' builders record none. Pairs touching them are left out
below. (A finding for the clock's owner: the length rows cannot be judged on these stages until the clock reads them.)

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #48 1-4 and 1-6 sit >= 20% either side of 1-5's median | the spread old worlds show, floored by #75 | today's 1-5 252 s (245-259); 1-6 215 s: 1-5 is **17%** longer. 1-4: not on the clock (3 s). | **MISS** | — |
| #75 neighbours differ by >= 20% on the quick clock | set from the measured spread of old W1-W4 | old W1-W4 (main), the 21 modelled neighbour pairs: median step **11%**; 10 of 21 reach 20% (32, 26, 40, 28, 35, 28, 40, 24, 62, 61). Today's W1, the 6 modelled pairs: 9, 8, 17, 9, 4, 18%: **0 of 6** reach 20%; median 9%. | **MISS** (today's W1 sits under old worlds' own spread as well as under 20%) | — |
| #77 no two neighbours within 20% | as #75 | as #75 | **MISS** | — |
| #91 the 20% spread judged on Normal's quick clock | as #75 | as #75 (Normal) | **MISS** | — |

**Topic 10: 0 PASS, 4 MISS.**

## 11. Checks

| Row | Line | Measured | Result | Root cause (file:line) |
|---|---|---|---|---|
| #51 Normal's flags no worse than main | the fun gate's flag count <= main's for the same stage | main (68b31e665) has no fun gate (`tools/validate/funcheck.ts` absent), so the baseline is the gate's own known list, which recorded World 1 before the mixer (`tools/validate/funknown.json`). `npx tsx tools/validate/funcheck.ts` on today's (`out/fun/funcheck-mixer.txt`): **FAIL, 12 worse or new**. 1-1 Normal: known 32 stage-layout flags (one tempo 16, repeat 16), now about 71 (+ pacing 9, template repeat 16, dead walk 14); 1-5 Normal: known 33, now about 67 (repeat 1 -> 16, + nothing new 16, + dead walk 3). | **MISS** | 1-1: "the '1-1 bank hops' template 3 times in the stage (§0c.2: at most twice)"; 1-5: "the same four moves 'PJJJ' 11 times" (the gate's own words) |
| #161 both lines kept; judged on whichever fails first | report both lines after the run | a time and cost line (ENGINE-SPEC:1699-1702: line 2, <= 1/3 of 1-5's hand-mix, about 1.2 h, <= 1.1%), not a code measure; nothing to run. | **NOT RUN** (a meter and clock reading) | — |

**Topic 11: 0 PASS, 1 MISS, 1 not run.**

## 12. Process and cost

#3, #4, #23, #55, #57, #58, #61, #106, #107, #155, #158 are readings of Matt's usage meter or a wall clock ("Meter", "Meter on the first one
built", "Clock the first world's pass"). No code run can read the meter, and ruling C15 (ENGINE-SPEC:1762) makes the cost lines history.
**All 11: NOT RUN** (not a code measure). Named here so none is hidden.
