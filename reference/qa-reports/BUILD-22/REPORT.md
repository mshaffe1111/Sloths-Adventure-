# BUILD-22 REPORT: 2-2 "Petals for the Crown" laid by data on t-int-11's head, every bot GREEN but the kid on Normal; X is a STOPGAP
Branch t-build-22 (from origin/t-eng-22, + t-fix-21, t-art-w2, then origin/t-int-11 at the lead's 4:47 PM ET message). Worked 4:00 PM ET on.
Head of the numbers below: **42faa831** (castBots, relist); the lock and full-suite lines name their own heads.

## EXACT NEXT STEP
1. **X, the spur pond (the lead's ruling A; 2-2 does not go to Matt before it).** Engine, any world, by data: a pad row whose far end is a
   dead-end stone (no far bank), the way on from the NEAR bank, laid by gen2 (`place: { kind: 'pads', ... }` today always lays a far bank
   ahead: pipeline.ts, the 'pads' branch of layLocal), plus the bots' out-and-back skill (go out for the flower, wait on the stone for the
   rise, come back), with a planted toy (level.md rule 21). Then replace `w2-22-far-stone` (w2Arc22.ts, marked `// STOPGAP`, row
   `stopgapX22`) with the spur brick; Dot's `stone` line moves to the stone; `git grep STOPGAP -- src` must come back empty.
2. **The meter has no price for pads: coveragecheck FAILS** (`(c) 2-2 easy seed 3: unpriced piece platform:moving ... a moving floor on
   no clock the meter reads`). A pad row needs a score.ts channel and a 'pad' row in reference/design/meter-coverage.json (ENG-22 step 3's
   'pad' item; the known list may not grow). Meter work, not level data.
3. Integration onto t-int-11: merge t-build-22 (it already holds t-int-11 @ 07af44ac); run the gates there (below: what ran here, what did not).
4. Stills (step 4 of the packet) once X lands and the bots are GREEN on that head (rule 29): the first pad, a pad row mid-sink, the
   breathing row, the crown lily, Normal and Easy, upright and sideways, whole screen (D79).

## Done (commits on t-build-22)
1. **ENG-22's EXACT NEXT STEP 1-4.** (1a 001395a0) The rise toy's Easy reds were two bot faults, traced frame by frame: padRead read the
   floor at his middle and lost the bank a pixel past its end (the plain edge's jump then went blind onto a beat pad); and it read the
   breath on the walk up, so a stretched Easy breath was spent before he hopped. All 12 toy runs GREEN. The plants were luck-dependent
   (the breath plant went green on variant 1 once the floor fault was fixed), so each plant now runs 4 variants a tier and goes red only
   where the same run crossed with the skill on. Measured (4 variants x middle/child x Normal/Easy, ok/X + lives at the pond):
   keep OFF: 9 red of 16 (child N 17/18/14/26 lives); ON: 0 red. rise OFF: 6 red; ON: 2 red (child N v3 stuck at the toy kit's 48 px
   step past the pond, not a pad; child E v2: chained calibrated double presses). breath OFF: 3 red; ON: 1 (middle N v4: two double
   presses). (1b f1d3d494) src/game/gen2/padSection.test.ts: place 'pads' on World 2's and World 6's ground, the rows rolled clean with
   pads/stones/clocks/riders as their data, Easy x1.5, every padFaults rule planted on a built pond, a pad sinking under him and a beat
   row breathing in step in RealPlay; padRide.test.ts in gates.yml. **Not plantable:** padFaults' "whole again within 4 s": a sunk pad is
   back within its hold + RIDE.padRise (0.6 s) whatever its clock, so the rule only binds if padRise grows past 3.4 s (named in the test).
   'pad' in meter-coverage.json: NOT done, see EXACT NEXT STEP 2 (it needs a channel, not a row).
2. **STEP 0** (reference/qa-reports/BUILD-22/STEP0.md, c1424e98); **GO 4:17 PM ET** (lead message): A) every other beat first, then the
   spur; B) the crown piece approved as Architect; C) greed on beat 9's small pads; D) Easy splash-back but the finale; E) petal look; F)
   double presses named; G) hand-off. **STOPGAP X approved 4:25 PM ET** (my message said 4:46: typed, wrong; see Lessons).
3. **The build (data).** (3a 1afbec0f) ART-W2's pad states in riverArt.ts drawPad (by size, read from width: up = w2-pad-small / M-03-a;
   the second half of the shiver = the -sunk painting; under = w2-pad-ripple), the sheet's lily stays the fallback. **The crown lily**:
   'crown' in a pad row (rideLay PAD_LAY.crownW 300), a solid floor with `Platform.art: 'crownLily'` (never a `pad`, so no bot pad read or
   padFaults count touches it), drawn by the pad piece: M-02-a + w2-crown-bud, w2-crown-open once he has stood on it (padPiece crownOpen).
   (3b afc5f151) w2Arc22.ts, kit 'w2-22' (stageTable, listed): graph `A Tw Pw R Pg Xw R Wf R Pg Mf R S R L E`. Design changes, each
   forced by a rule: V4 needs the test X before the twist (so the STOPGAP), V5 a rest after S ('S R L'), L is structural (no content
   letter); content 3 water / 2 ground / 2 floating (the V11 cap). (3c e54ca1ac) **New replaces old**: World 2's placeholder arcs and
   bricks are deleted (w2.ts); w2.test.ts's look / river / first-deep-river checks now hold the real 2-2; river.test.ts reads the river
   lesson's stage from the manifest. (3d 4a381ede) w2Arc22.test.ts: the keeper's lines verbatim (lines-2-2.md brought from
   t-story@50da9e58) and said, the arc beat for beat on 3 seeds x 2 settings, padFaults clean, ponds by the beat (Easy safe but the
   finale; every Easy pad clock >= Normal's), teach lines 800+ px before with no deep water between, the crown once with `lily` before it
   and `crown` after, flowers lilac and white only (passion, lotus: the keeper's fault 1). (3g 390868aa) World 2's checks caught **the
   plank walk drawn as the code-drawn bridge** (canopy_bridge -> terrain drawBridge in World 2): now World 2's painted banks with two
   gaps; a pond's own floors (pads, crown, stones at the pad line) exempted from "nothing under a splash-back river" (they sit ON it).
   (3h 4f1863b8) the breath as two in-step runs of one row with a bank between (one row key = one clock). (3i 42faa831) the pond's log
   lane with 200 px logs (Easy 220). addlevel 2-2 --relist: READY on every step but bots at 4:31 PM ET (rolls 24/24 both, list, flight,
   registry); relisted after each data change: 100 proven of 100, `seedlist 2-2 --check` PASS on 42faa831.

## castBots 2-2 1-40 (rule 28), head 42faa831 (after t-int-11's walked-path door, INT-10d 2cc8be2a)
| bot | Normal | Easy |
|---|---|---|
| child | 40/40, 353 s median, 209 lives | 40/40, 249 s, 29 lives |
| middle | 40/40, 195 s, 109 lives | 40/40, 175 s, 23 lives |
| expert | 40/40, 171 s, 82 lives | (no Easy expert) |
| adult | 40/40, 131 s, 65 lives | 40/40, 131 s, 4 lives |
| kid | **34/40** (5 rescued x1: seeds 4, 21, 11, 19, 39; seed 5 x3) | 40/40, 131 s, 11 lives |
Easy is never harder: every tier fewer lives on Easy. No run under 2:00 (min 124 s). The kid on Normal is named, not tuned: rule 4 (Normal
never softened for the kid). Traces (two runs per cause, FT_FRAMES / FT_MISSED / harms by section):
- **Bot fault, fixed (3e 3fe3bd46):** middle N seed 6, 8 lives at ONE 110 px small-to-big gap (x 19,460-19,525): padRead took the plain
  edge's jump plan (the next floor at his height, a bank 900 px on: 'double') and the spot memory then kept the double a failed double
  had left. A pond hop is now a single (every pond water is under a held single's reach, padFaults); his own 25% second press stays.
- **Bot fault, fixed (3e):** kid E seed 3 (and 11): slid off the stone into the breath row while it was under, three splash-backs,
  rescued: padRead let go at 30 px; now at the clock-ride wait's stand distance (aimQ p25 + 31, or 22 + edgeAim).
- **Data, fixed (3h):** adult E seeds 3 and 32, kid E 22 and 30: ran across the breath row's 136 px stone onto a pad late in its breath.
- **Door, fixed by t-int-11 (the lead):** expert/middle/child sealed doors 1-4 flowers short on my base: the door asked 87.5% of every
  flower laid; INT-10d counts only walked-path petals. My two socket shuffles made it worse (named under Learned).
- **Data, fixed (3i):** kid N seed 3: five lives on the log lane (x 20,889-21,282). Left: kid N seeds 33 and 3: lives in both-kinds and
  the deep pond.
- **Named, not modelled away (ruling F):** the tier bots double-press 25% of jumps (calibrated, firsttimer.ts:204-229); off a pad that
  overshoots a 136 px stone into deep water. It is most of the Normal lives at the ponds.

## Gates (law 5, member scope: what this change touches)
- tsc PASS (42faa831). generalitycheck PASS, knowncheck PASS. roadmapcheck: cannot run in this shallow clone ("proofs cannot be checked
  (fetch-depth 0)"). **coveragecheck FAIL** (EXACT NEXT STEP 2). `seedlist 2-2 --check` PASS.
- Unit tests run here: padSection.test.ts 15/15 and padRide.test.ts 18/18 together on 42faa831, w2Arc22.test.ts 6/6, w2.test.ts 6/6,
  river.test.ts pass, ciTests pass.
- **Full suite and lockall: see the two lines below** (each heavy check once, on frozen worktrees).
- drawcheck / clipcheck / build / chunkcheck / artcheck: **UNRUN here** (riverArt.ts gained 8 small images and the pad piece draws them);
  the integration head runs them.

## Polish check
**No stills shot** (rule 29: the stage moves once X lands). Named rough spots: X is a STOPGAP (not the design); the plank walk is World 2's
bank, not jetty planks (no painted World 2 plank piece: an art job); Dot's `note` line at Meeca's note is not wired (finds.ts lays
w2_note on World 2's stage 2 by itself; no find line hook was found in the time); the giant lily far off at beat 0 (design: "far off, its
flower closed") is not laid; no heron, fish rings or frog (the design's look list); the pond art (ART-W2's cuts) is not preloaded with the
World 2 atlas (stagePreload.ts): it may pop in on the first pond.

## Method used
level.md Building rules 21-29 (toys first, STEP 0 and GO, engine gaps reported, built stage judged, 40 seeds traced before fixing),
stage-fix.md. **Lessons applied:** D19 (the toys and tests roll through gen2 and the listed row), D23 (merged t-int-11 before judging the
bots), D39/D69 (each toy's plant measured against the same run on), D43 (nothing names a stage in engine code; generality PASS), D46 (pond
reach), D50 (teach lines on Normal and Easy), D51 (2-2 in the World 2 checks that walk it), D57 (queue read at every push), D59 (no job
left running), D75 (proven on 2-2's real row), D77 (hand-off at laid + listed + bots + lock + suite), D79 (the plank walk's bridge caught
on the whole stage), D80 (the door is not mine to model; the lead pointed at INT-10d).

## Mistakes (mine) and the standard each changes
- **A typed time (D20/D30 repeated):** my 4:25 PM message to the lead said 4:46, and commit afc5f151 repeats it. Every later message and
  file time comes from `date` in the same command; corrected in w2Arc22.ts (b652a4b9). Not rewritten in history (pushed).
- **Built bots on a stale door:** I traced sealed doors and moved flowers twice before merging t-int-11, which already held the fix.
  Standard: merge the integration head named as the base BEFORE judging bots (D23 says so; I merged only the packet's named branches).
- **`lockall.ts --help` started a full run** (no help flag): read a tool's usage from its header before passing a flag (D32).

## Learned (for the next level builder) and proposed rule changes
- A flower on a short bank between two hops is flown over by every bot; but moving socket flowers off them made the door worse, because
  the shared fill then lays its own where no socket petal is within 1,050 px. Proposed World 2 note: a pond stage's flowers ride its pads
  and sit on the long banks; judge flower placement only on the walked-path door (INT-10d), never on the raw count.
- One pad row laid twice keeps one clock (`pads-<row>`): the way to make two runs breathe in step with a real rest between.
- Proposed rule (bots): a planted toy is judged over several variants against the same runs with the skill on; one run a tier was luck.

## ENGINE-WORTHY
1. The spur pond (X), above. 2. The meter's pad channel (coveragecheck), above. 3. A pad row's stone width is one constant
(rideLay PAD_LAY.stoneW 136): a per-row stone width would let a breathing row's rest be a stone, not a bank. 4. The bots' spot memory keeps
'double' after a failed double (firsttimer.ts SpotMemory.plan): fixed for ponds only (padRead asks a single); every other edge still has it.

## Turnover note
reference/handoffs/engine-core.md not rewritten (the pond engine notes are in this REPORT, sections Done 1 and 3).
