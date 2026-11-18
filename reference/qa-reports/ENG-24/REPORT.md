# ENG-24 REPORT: 2-4's two new engine pieces (a liana over a river; the drop-on-log and vine-from-log bot skills), proven on planted toys
Engine, t-eng-24 from origin/main 6e7b85f8. Started 11:06 AM ET 11-18 (by `date`). Packet reference/packets/2026-11-18/ENG-24.md (lead branch).
Commits: bef5445a (NEW 1), 4d1c2834 (NEW 2), cd312838 (2b: the bot's log changes held to liana rivers), then this report's commit (HEAD below).

## EXACT NEXT STEP (lead)
1. Rule on Suggestion A (the meter can't price a let-go onto a log: needed before 2-4's DIFFICULTY verdict) and Suggestion B (the toy clips
   need a dev fixture: not done here).
2. Hand the 2-4 builder "What the 2-4 builder needs" below.

## Done-items (packet) and evidence
1. **NEW 1, the liana over a river.** Data: `{ kind: 'river', after: <liana>, row }` lays the water from the bank the liana (or its chain)
   is caught from, under the liana, to the far bank (pipeline.ts 'river' branch `riverFrom`; the liana's `hang.gap` is the water). No
   type change. General: no stage id or x (generalitycheck PASS). The judge is gen2/riverLay.ts `lianaRiverFaults`, called from
   riverFaults(st, difficulty) (checkStage passes the setting). It holds the drop on both clocks, never the hop rule (the hop rule gives
   way under a liana in riverFaults AND levelCheck):
   - Normal: at least 40% of let-go moments land on a log, and the worst wait on the vine is at most one swing.
   - Easy: at least 85%, and the worst wait is at most 0.6 s.
   - A liana no bank reaches must be caught by a jump off a log (`logCatches`). On Easy its river runs at most 80 px/s (LIANA_RIVER).
   - **The judge flies what the engine does.** physics.ts `pressLaunches` is pressWindow's press, pulled out with pressWindow unchanged.
     Its numbers match the designer's real-engine flight (2-4.md table, swingLog.ts) to the point:

     | Row | Normal (share, wait) | Easy (share, wait) | Designer's flight (Normal / Easy) |
     |---|---|---|---|
     | long | 86%, 0.60 s | 92%, 0.57 s | 86% 0.63 s / 92% 0.53 s |
     | ride / deep | 82 / 81%, 0.63 / 0.60 s | 89%, 0.57 s | 82 / 81% 0.67 s / 89-90% 0.57 s |
     | twin | 80%, 0.60 s | 88%, 0.57 s | 80% 0.63 s / 89% 0.60 s |
     | lashed | 88%, 0.63 s | 93%, 0.60 s | 88% 0.67 s / 93% 0.53 s |
     | gap200 | 51%, 1.50 s | 56%, 1.67 s | 51% 1.20 s / 56% 1.37 s |
     | gap280 | 41%, 2.70 s | 46%, 2.93 s | 41% 2.70 s / 46% 2.93 s |

     The full table is in reference/qa-reports/ENG-24/calib.ts. A coarse RealPlay flight agrees within 4 points, in its own test.
   - **Found on the way: physics.airStep lacks the engine's in-air turn push** (engine.ts:2567 `reversing`, PHYS.airTurn). Every check's
     back-swing hop under-steers by 20-30 px (backProbe.ts). It is now opt-in (`turn`), used by the liana judge and the bot only. This is
     the lead's ruling 11:28 AM: named debt, R-165.285.
   - **Toy:** tools/inspect/lianaRiverToys.ts, a liana over `long` in a section rolled the game's way (listed.ts withTestStage, a planted
     one-seed list, World 2's finish, id 2-94). It builds clean on both settings.
2. **NEW 2, the bot skills** (tools/inspect/firsttimer.ts SKILLS):
   - **`dropOnLog`:** he lets go only when the let-go, as the engine plays it (the same pressLaunches launch), comes down on a log. It
     must land at his thumb's lag and at half a spread either side.
   - **`vineFromLog`:** he jumps off the moving log when the jump, with the log's carry, catches the liana. It must catch at three lags,
     moving and standing, and he must take off while still on the log; the press waits standing.
   - **Both run through the real input timing:** RealPlay.useRealInput sends the bot's pad through the game's own InputEngine, as
     TouchController does. It is proven: a Pad tap at a run gives 0.43 s of air, against FakeInput's 0.30 s.
   - **The bot's log changes are held to liana rivers** (`lianaRiver`), so every shipped river's bot run is as on main (riverRide 18/18).
     The changes: no pad pause on a log running his way (it flicked him blind into the water), no liana-wait at a log's moving front, and
     no random second press on an aimed drop.
3. **Nothing shipped moved.** The gate table is below. lockall vs main: 102/102 stages unchanged (on bef5445a and on 4d1c2834; cd312838
   changes tools/ and reference/ only).
4. **Clips: NOT DONE** (Unresolved 1). The runs are recorded (clipRecord.ts). The page can't draw the toy without a dev fixture.
5. **Turnover note:** engine-core.md §0zl (the place, the judge, the bot, the real input, the debt, the traps). The probe scripts use
   relative imports (D83): reference/qa-reports/ENG-24/*.ts.

## The toys: red/green proof
| Toy (test) | With it | PLANTED (without it) |
|---|---|---|
| liana over `long`, logs taken out (lianaRiver.test 4) | builds clean both settings, riverFaults [] | refused: "0 logs, under 2" + levelCheck "fewer than two logs" |
| logs 400 px apart under the liana (lianaRiver.test 5) | n/a | no roll of 1-60 lays it; refused by name "32% ... under 40%", "waits 3.07 s ... over 2.85 s" |
| gap280 under a liana (lianaRiver.test 6) | riverFaults [], levelCheck no hop error | the liana removed: "past a hop" (riverFaults) + "too far to hop" (levelCheck) |
| catch toy, Easy at 110 px/s (lianaRiver.test 7) | Normal not held to it | Easy refused "caught from a log on a river at 110 px/s, over Easy's 80" |
| drop-on-log, gap280 (Easy `deep`), middle Normal v1-5 (lianaRide.test 2) | 0,0,0,0,0 lives, each onto a log | 1,0,5,2,0 = 8 lives (expert: 0x5 vs 1,0,1,1,4) |
| vine-from-log, catch toy (twin, Easy `long`), middle v1-5 (lianaRide.test 3) | caught off a log 4/5 Normal (v4: 0), 4/5 Easy (v5: from the bank at the swing's back end) | 0/5, 0/5 (rides the log to the bank) |
| the source's own rules, planted out (planted-faults.py) | lianaRiver.test 7/7 | 5/5 CAUGHT: judge off, hop kept (riverFaults), hop kept (levelCheck), the turn off, river laid from the liana |

## Gate table (the head each ran on)
| Gate | Result | Head |
|---|---|---|
| `npx tsc --noEmit -p .` | 0 errors | HEAD (re-run at the end) |
| the suite (the CLAUDE.md set, once) | SUITE_RESULT | SUITE_HEAD |
| lockall --layouts 16 vs main's lock | 102/102 stages unchanged | bef5445a, 4d1c2834 |
| seedlist 1-1 --check | SEEDLIST_RESULT | SEEDLIST_HEAD |
| generalitycheck | PASS (61 engine files, 26 literals, 26 known) | HEAD (re-run at the end) |
| knowncheck | PASS | HEAD (re-run at the end) |
| roadmapcheck | FAIL (13): the SAME 13 on main's own tree in this container (A-39/A-40...: commits on branches not fetched here); none from this branch | cd312838 and main 6e7b85f8 |
| coveragecheck | PASS (12 built stages, 25 pieces, 6 known) - and the meter does NOT price a liana-to-log drop (below) | 4d1c2834 |
| riverRide / padRide / clockRide | 18/18; padRide + clockRide 45/45 total with riverRide on 4d1c2834 (re-run on HEAD: BOTGATES_RESULT) | cd312838 / HEAD |
| lianaRiver.test / lianaRide.test (gates.yml) | 7/7, 3/3 | cd312838 |

**The meter (METER rules): it cannot price a liana-to-log drop. The missing channel:**
- score.ts on the toys (meterProbe.ts) reads only `ride-board` (boarding the logs from the bank) and `ride-off`. Its route
  (tools/inspect/route.ts) has no move from a swinging liana onto a drift, and score.ts has no channel for it.
- coveragecheck passes only because no built stage lays one yet. Once 2-4 is a row, its route will ride the logs from the bank and never
  read the drop (Suggestion A).

## What the 2-4 builder needs
1. **The s token** (a liana whose landing is the river):
   - the liana: `{ key: 'L', shape: 'liana', place: { kind: 'swing', after: <bank>, top: [410, 410], reach: [165, 165], len: [410, 410] } }`
   - the far bank: `{ key: 'far', shape: 'bank', place: { kind: 'river', after: 'L', row }, main: true, landing: true }`
2. **The w token** (the way on is a liana caught off a log):
   - the same pieces with the liana out of every bank's reach (reach ~430).
   - its foot well over the log. At len 410 its foot sits at the bank's top, so the log carries him into it and no jump is asked; the toy
     uses len 320 under a 410 top. The designer should name beat 4's length.
3. **Easy twins:** gen2 lays Easy from Normal's plan, so a Normal-only row needs an Easy twin version (sub-block versions, 2-1's brick
   pattern: `easy ? 'deep' : 'gap280'`). gap200/gap280/lashed are not in W2_RIVERS yet (data for the builder; the toy's own are in
   lianaRiverToys TOY_RIVERS).
4. **Beat 6 (liana, log, liana, log, no bank):** expressible as two swings after the same bank (reach 165 and ~600) and one river after
   the second. The judge holds each liana over the window. **UNTESTED:** fly a two-liana toy first.
5. **Bots:** the skills are always on outside a test. castBots runs FakeInput; the skills were proven through InputEngine (Suggestion D).
6. **The meter's reading of 2-4 will miss its drops until Suggestion A lands.**

## Polish check
No player-facing screen changed (engine judge, gen2 place, bot and test harness only). The one look item, the clips, is not done, and the
draft frames are not fit to show: the page drew 2-1's baked ground under the toy (Unresolved 1).

## Pushback
1. **"Toy: a liana over `long`" cannot be the bot plant.** `long` lands 86% of let-gos with no skill, and today's bots crossed it with 0-1
   lives. The drop skill's plant is on gap280 (the design's hardest drop); `long` stays the place/judge toy.
2. **The catch toy at 2-1's liana length asked no jump.** The packet's catch only exists if the liana's foot is above a riding Pokey. The
   design names no length for beat 4; it should.
3. **The meter can't price the new piece** (the gate table). This is a METER packet, not this one's walls.

## Suggestions (ready packets)
A. **METER-24** (Engine/METER, high):
   - Objective: price a let-go onto a drift. Add a route.ts move from a swing onto a drift (and a jump from a drift to a liana), and a
     score.ts channel from riverLay `lianaDrops` (per release: log2(1 + period / window), 2-4.md's form, on the flown share). Add the
     meter-coverage.json row.
   - Files: tools/inspect/route.ts, tools/difficulty/score.ts, reference/design/meter-coverage.json.
   - Done: meterProbe.ts on the drop toy shows a swing-drop challenge at the liana; coveragecheck holds it.
B. **CLIP-24** (fresh member, ~1 h):
   - Objective: the toys on the real page. Add a dev-only `?fixture=liana-drop|liana-catch`, chaseFixtureStage.ts's pattern, so the page
     builds the toy natively.
   - Then: replay clipRecord.ts's runs, or replay the recorded touch calls through clipPress.mjs. reference/qa-reports/ENG-24/
     lianaClip-draft.mjs is the frame loop.
   - Done: upright and sideways mp4s of the drop onto a gap280 log, and the catch off a log and drop onto the next.
   - Or wait for 2-4 laid (rule 29: shoot once on the real stage).
C. **R-165.285** (the lead's): airStep's turn everywhere + full re-lock.
D. **BOTS-RI:** castBots and tierBots through `realInput` for World 2 on, with the tiers re-calibrated (the real hop is 0.43 s; FakeInput's
   is 0.30 s).
E. **The pad pause on a with-flow log**, everywhere (not only under a liana): the flick-on-blind fault is general. It moves 2-1's
   seed-pinned plants, so re-measure them with it.

## Unresolved
1. **Clips (packet item 4): not done.** The recordings exist; the page needs a dev fixture (Suggestion B).
2. **The catch toy's boarding lives:** middle Normal variant 3 loses 2-3 lives with the skills on or off (2 off). It is the existing ride,
   not these skills. Traced as far as "stands on the log ~0.3 s, then runs off its front"; the branch steering him is not found. The test
   holds the catch count, not lives, on that toy.
3. **The child bot on Normal gap280** still loses 3-7 lives with the skill. Rule 4: Normal is judged by middle/adult/expert, not the child.
   Easy's child crosses clean.
4. **`back` row:** 65% here vs the design's 73%. The design's figure is grip 0.7 only; the judge takes the worse grip. It is not a drop
   row in 2-4.

## Method used
reference/roles/ENGINE.md day one (main's lock first, planted failure first), methods/level.md rules 21/23/24, gates.md.

## Lessons applied
- D19: the judge calls the engine's own press (pressLaunches) and is proven against RealPlay.
- D15: the measuring tool was tested first (the judge vs the designer's real flight caught the wrong clock pairing and the missing air
  turn).
- D43 / rule 16: no stage id or x in engine code (generality PASS).
- Rule 21: bots proven on toys with plants.
- Rule 23: the toy is on a listed row, rolled the game's way.
- D20/D30: times from `date`.
- D36: git status and ls-remote at each push.
- D77/D78: the box (proofs named for a fresh member).
- Rule 28: every miss traced (the pause, the second press, the late let-go, the pending walk), except Unresolved 2, named.

## Learned (for the next builder / engineer)
- **Measure the bot WITHOUT the skill before writing the skill.** Both of the packet's toys were passed by today's bot (a dense row; a
  liana foot the log carries him into).
- **Fly a new judge against the designer's real-engine grid frame by frame.** One DUMP comparison found a missing engine rule (airTurn)
  in minutes.
- **A bot change that skips a random draw moves every seed-pinned plant after it.** Hold behaviour changes to where they are proven, or
  re-measure the plants.

## Method update (proposed)
- **methods/level.md rule 21 (bots proven on a toy), add:** "Run the toy with the skill OFF first. A toy today's bot already passes
  proves nothing; pick the design's hardest row for the plant."
- **gates.md (or a judge note), add:** "A judge that models a flight carries a test against RealPlay on a coarse grid of the same presses."

## Turnover note
reference/handoffs/engine-core.md §0zl, rewritten in this report's commit.
