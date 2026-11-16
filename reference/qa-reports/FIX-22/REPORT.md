# FIX-22 REPORT: 2-2 finished: X is the spur (a dip of World 2 banks, a beat row out to a dead-end stone), the meter prices pads and the rope, bots GREEN

Engine, Opus 5.5 high. Branch t-fix-22 (from t-build-22 @7100589d; merged t-build-22 @8c7e9bfa and t-int-11's final head @90297717).
Head of the numbers below: 6d198be4 (FIX-22 (1g)) unless named. Times are from `TZ=America/New_York date`.

## EXACT NEXT STEP
**Integration of 2-2 onto t-int-11's final head (lists, gates, link).** t-fix-22 already holds t-int-11 @90297717 (merged at b3078786),
so: (1) merge t-fix-22 into the integration branch; (2) `npx tsx tools/engine/seedlist.ts 2-2 --check` (PASS here) and every other list
--check; (3) the full CLAUDE.md gate set on that head, the build and the perf gates included (I ran the member set: below); (4) the lock
against t-int-11's head with `--intended 2-2`; (5) rebuild and republish Matt's test link; (6) Matt plays 2-2 before the retro decides
its numbers (the meter reads 6.4 Normal / 4.7 Easy, under World 2's band: below).

## Done
1. **The spur, by data, any world** (commits 0e4f6d55, b1384feb, 042b8e95, 6b4b87b0, 706ac7b7, 6d198be4).
   - `PadRow.spur` (gen2/rideLay.ts): the row ends in a dead-end stone standing against the far bank's foot (no water past it); its zone
     names the stone (`RiverZone.spur`). Place `pads` with `rope` (gen2/types.ts): the far bank stands level with the rope's ledge, out of
     a double's reach from the stone (189 px apex + 5), and the rope is hung from that ledge over the pond (the way on from the near
     side). Every failure named: a spur with no rope, a rope on a row that is no spur, a ledge reaching over the pond, a far bank inside a
     double's reach (padSection.test.ts, World 2's and World 6's ground, both settings). A socket at a spur far bank's foot (t 0) is on its
     stone, so Dot's `stone` line is said there. The stage's late right/down shifts move the spur's stand point with its stone (it was
     left 90 px above it: no bot ever stood on the stone; planted in w2Arc22.test.ts, red without).
   - The route visits a spur's stone out and back (tools/inspect/route.ts `spurs`). The bots' OUT-AND-BACK (`PAD_SKILL.outBack`): the
     stone is a pin on his way (he is followed no further until he stands there, and never back out to it from the way back, through a
     respawn too). Toy `spur` (padRide.test.ts): middle and child, both settings, to the stone and the shrine; planted, outBack off ->
     red; the pin itself planted (`OUT-AND-BACK's pin`, red without). Three bot faults the stage exposed, each fixed and traced: the
     way-out points beside the way-back ones pulled him back out (stone<->pad for 20 s, 2-2 Easy seeds 12/14/33/36); a rope's line is
     in the air, so he is followed onto it only while he hangs and heads for its start until he stands there (a kid on a step under the
     rope walked off it); a rope he caught that his way does not take yet he drops off (down), as a person does (expert N 30/40 on the
     t-int-11 merge, every rescue hanging on the rope on the way out).
   - **2-2's X** (w2Arc22.ts `thereAndBack`, row `spur22`): the STOPGAP brick and row are deleted (`git grep STOPGAP -- src`: empty). A
     dip of World 2 painted banks only: the high bank, three 63 px steps down, the low bank, two small pads 50 px apart, the stone with its
     petal; back over the pads, up the steps, the rope from the high bank to the far one (224 px over the stone). **Design changes, each
     ruled by the lead:** a BEAT row (5:29 PM: on weight pads a hopper never sinks them, so the stone asked no wait; WAIT-FOR-THE-RISE
     off changed nothing, 16/16 either way); the way on from the near side by the rope (5:10 PM); Dot's `breathe` moved to the garden path,
     800+ px before X, now the first beat row (level.md rule 6; W keeps its flag); the dip (6:45 PM: a ledge over the low bank drew in
     World 1's thin-piece art, w2.test 'the look'; a vine beside the high bank left every tier at its top beside the bank). 50 px gaps:
     at 70 (a 470 px run) a child stood 8 s+ at the bank for a breath long enough. Splash-back on both settings (2-2.md `#soft`).
2. **The meter's pad price** (d439ccf9; f6518021 for the rope): a sinking pad is a dwell (off before it goes under: its stand from its
   clock, a weight pad's count or a beat row's breath, Easy stretched), a beat pad boards on the breath (RW), a weight pad is up whenever
   he comes (no window). Pads are their own pieces (`pad:weight`, `pad:beat`) in coveragecheck's vocabulary and meter-coverage.json. The
   rope shimmy is priced as the self-paced climb it is, ledge to ledge (METER-COVERAGE #7). Planted (rideChannel.test.ts: red before).
   coveragecheck PASS (also: `beat:rolling hazards` had no entry; two known entries no built stage used were taken off: shrink-only).
   **2-2 re-scored (seeds 1-3): 6.4 Normal, 4.7 Easy.** Plainly: under World 2's band (9-21) and the design's 12.5, and Easy is 0.73x
   Normal, over the design's 0.6x. Not tuned (the lead, 6:27 PM: the pad channel is hours old, D80; Matt's play decides first, then the
   retro). The bots' evidence that Easy is gentler: fewer lives on Easy for every tier (table below).
3. **Relisted** (addlevel 2-2 --relist on the final data): rolls 24/24 both settings, 100 proven of 100, `seedlist 2-2 --check` PASS
   (also PASS after the t-int-11 merge).

## castBots 2-2 1-40 (rule 28), head 6d198be4
| bot | Normal | Easy |
|---|---|---|
| child | 40/40, 377 s median, 190 lives | 40/40, 269 s, 22 lives |
| middle | 40/40, 215 s, 105 lives | 40/40, 194 s, 18 lives |
| expert | 40/40, 187 s, 72 lives | (no Easy expert) |
| adult | 40/40, 146 s, 64 lives | 40/40, 148 s, 5 lives |
| kid | **32/40** (8 rescued x1: seeds 2, 4, 6, 7, 24, 25, 32, 33) | 40/40, 148 s, 23 lives |
No run under 2:00 (min 137.2 s). Every tier fewer lives on Easy.
**Kid N, traced (the lead's ruling B, 5:50 PM):** every rescue is at a deep pond on Normal (seed 2: x 28.7k, the finale; seed 6: 29.2k;
seed 24: 20.6k, both kinds), never at X. **ENGINE-WORTHY: KID/ADULT first-timers can't let go of a held steer at a lip (firsttimer.ts
thumbify ~2810).** Frame trace (adult N seed 23 on b1384feb, at W's bank x 12731): padRead returns stop from 39 px out while the
breath is down (ph 'on'), the pad input stays `right` (thumbify re-arms the late release every frame for KID and ADULT, the documented
R-165.59 quirk) and he runs off the lip into the deep water at 270 px/s; each respawn does it again until 5 lives and a rescue. On
t-build-22 the kid was 34/40 by the same cause. A calibration question for R-165.59's owner (the lead), not tonight's.
**1-3 (ropes) proves the rope changes move nothing:** castBots 1-3 1-40 on this head is identical, row for row, to t-int-11's head
(90297717); against t-build-22 the small moves (kid N hits 9 -> 14) came with t-int-11.

## The lock
`lockall --layouts 16 --intended 2-2 --check` against t-build-22 (recorded on a worktree at 7100589d), run at fa273f14: 101/102 stages
unchanged, only 2-2 (intended). Later commits change only spur zones, 2-2's data and bot code; the lock on the integration head is step 4.

## Suite (the member set, once, on the final head)
SEE "Suite result" at the end (filled in when it finished). The first run (at f6518021) had 12 reds that t-build-22 has too (each run on a
base worktree: flagSpan LV-9, riverSection dropsOf, verdicts 5-7 / 7-1, stageQuality x2, registrycheck, chaseBots, riverRide x4; the lead:
fixed on t-int-11's final head) and 3 of mine, all fixed: w2.test 'the look', w2Arc22 'teach line 800+ px before', tierBots 'replay exactly'
(a new TierRun field: now present only on a stage with a spur).

## Stills (reference/qa-reports/FIX-22/stills/, head 6d198be4, layout 1 = seed 2, both settings as BUILT, upright 412x915 and sideways
915x412, 2x; shot by a scratch copy of stills-at-setting.mjs that finds each moment on the built stage)
- `first`: on the bank before beat 1's big pad. `sink`: beat 2's small weight pad gone under (its ripple) and the splash-back, the two
  pads beside it up with their petals. `breath`: beat 6's row shivering (phase 'warn' at the shot). `spur`: Pokey on X's stone, the far
  bank's face beside him, its rope post above (upright: the rope reads across the screen). `crown`: the crown lily open under him.
**Polish check (named, not hidden):**
- Every still carries Dot's idle quip card ("A sloth said 'Oh'..."), the game's own chatter; sideways it covers the middle of the screen
  over the water. Not X's; it is how the page plays idle Dot.
- `spur`: Dot's `stone` line is not on screen in the still (the quip card held the slot); w2Arc22.test 'every line is said' proves it is
  said. Sideways, the rope runs along the top of the screen behind the hearts while he stands on the stone (the camera follows him low);
  it is in view from the high bank, where he takes it.
- `spur`: the stone is drawn as World 2's painted stone column (as BUILD-22's stones), with a lighter band where it meets the water.
- `sink`: shows the pad gone under and the splash, not the moment of the dip; a clip would show the shiver.
- Not shot: a clip of X (out, wait for the breath on the stone, back, up the steps, the rope): rule "an interaction is judged on a clip"
  says it should be; it is the first thing to shoot on the integration head.

## Method used
reference/methods/level.md (rules 21-29), stage-fix.md, gates.md; ENGINE.md day one (lock first, planted failures, the suite).
## Lessons applied
D19 (the gate calls score.ts and the real builds), D23 (merged the latest heads before judging), D79 (judged whole screens: the quip card,
the rope behind the HUD), D80 (did not tune to a meter that could not price the piece), rule 22 (every fault fixed at its root: the pipeline
shift, the bot route/pin/rope faults, never in 2-2's data), rule 26 (the STOPGAP deleted), rule 28 (every miss traced), "a gate must call
the same code the screen calls" (the look test caught World 1 art).
## Learned (for the next builder)
- A spur is out-and-back: the bots' route must pin the stone, or the nearest point jumps to the way back.
- A rope's route line is in the air: any piece under a rope (steps, a low bank) needs the bot to follow it only while hanging.
- World 2 has no thin-ledge art: anything over the ground is a painted bank, a stone or the crown; plan heights as banks and steps.
- Check a new result field against committed replays (TierRun.spurs broke tierBots' replay).
## Method update (proposed)
- level.md: a beat that asks a WAIT must use a row that can make him wait (a beat row); a weight row never sinks under a hopper.
- ENGINE.md traps: a stage-wide shift must move every point a lay records (rivers' spur, safe set-back): add a test per new field.
- Mistake: the stills tool, my first spur shot placed Pokey 10 px short of the stone's line trigger, so Dot's line could not show; place on
  the trigger's far side.
Turnover note reference/handoffs/engine-core.md not rewritten (box); this REPORT stands in for it.
