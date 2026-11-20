# BUILD-25 REPORT: 2-5 "River Snappers: Count to Four", laid; STOPPED at the lead's context plan (section written 12:07 PM ET Fri 11-20, by `date`)

Branch t-build-25 from t-int-14 6ab312e4 (ENG-25c already in, not re-merged). Head: the commit carrying this report.
Packet reference/packets/2026-11-20/BUILD-25.md (on ccr-ea739a2f-dfcee4). STEP 0 plan sent 11:49 AM ET; the lead's GO 11:50 AM ET.

## EXACT NEXT STEP (BUILD-25b, a fresh builder at high, on this head)
1. `npm install --no-audit --no-fund --legacy-peer-deps` (npm ci fails ERESOLVE; then `git checkout package-lock.json`).
2. Write src/game/gen2/worlds/w2Arc25.test.ts (2-4's w2Arc24.test.ts is the pattern; build through listedStage + worldFinish), each with
   a plant in reference/qa-reports/BUILD-25/planted-faults.py:
   - the keeper's lines verbatim from reference/story/lines-2-5.md (LINES_25, MISSION_25 = stagePlan's 2-5 desc, SEALED_25 =
     SEALED_LINES['2:purge'], TURTLE_TIP_25 = journal.ts turtle tip); goalLine('late', 2, 'purge', 2) = "Still 2 snappers to chase off
     before the sanctuary opens"; countWord(2,'purge') = 'snappers'; goalInfo's purge card says "snappers" (purgeNoun);
   - the arc beat for beat (sections: reach one-stone sleeper three awake rest rope wave rest sandbars quickening rest big-snap far-bank);
   - the snap rows by beat (teach freeBite + safe; Normal deep from beat 3 except beat 4; Easy every pond safe; wave 5 Normal / 3 Easy;
     every 0.75 row on clock snap-river, the quickening on snap-quick);
   - 9 snappers, each at its designed socket (no fill with socket 'topup'), the first asleep, clocks snap-river / snap-quick; goal 8
     (config.targetCount, countSet), Easy held to 5; gen2.errors empty;
   - each teach tip (count, snapper, snap, follow) 800+ px before its thing, no snap stone or snapper between; `quiet` past the Big Snap.
   - snapperCount.test.ts (RealPlay('2-5'): the OLD turtle's shell/punch ways) must be re-pointed with its assertion kept ("a snapper
     beaten counts toward the goal"): on the kit 2-5, the sleeper kicked and an awake one stomped-then-kicked each count 1
     (ENG-25's w2Cast.test.ts shows how). skills.test.ts:11 and w1NewArt.test.ts:92 are id-only (check they pass).
   - Plants still owed for accepted engine bits: PadRow.clock (two bars under one name throws; an Easy twin keeps its Normal clock) and
     snapFaults(st, 'normal') skipping the Easy comparison while the Easy build still judges it (snapRow.test.ts).
3. Seed list: **the 6-seed try FAILED the packet's pre-check** (`npx tsx tools/engine/seedlist.ts 2-5 --count 6`, 73 s,
   reference/qa-reports/BUILD-25/seedlist-6.txt): 5 kept of 1,199 fresh seeds (0%), 1,194 refused by THE QUIET LINE (over 4 s with
   nothing to do). Its 5-seed list was NOT committed. Fix the lay first: the long plain banks before each teach (Dot's 800 px: a 700 px
   bank in beat 4, 480+400 in beats 1/2/6), the snapper grounds' 3x150 + 300 banks between snappers, the rests. Trace which x the quiet
   stretches sit at (the tool's refusal names `# s ... at x #`: run one seed with the stage's own quiet report), then give those stretches
   something to do (petals, a rock, a log) without breaking the teach rule (nothing that HURTS between a teach and its thing) or the
   snapper ground rule (no higher floor within 176 px of a patch: a rock must keep away). Only when 6 fresh builds pass, the full relist.
   Then flown rows if the judge asks (2-4: FLIGHT_STAGE=2-4 flight.ts normal all -> flownArcs normal-2-5, stageTable `judged`).
   Run the list judge's R-165.327 seat rule on 2-5's list (the lead, 12:05 PM).
4. Early stills (beats 1-3, upright + sideways) to the lead; then castBots 2-5 1-40 x 5 bots x both settings, meter N+E, the full
   CLAUDE.md gate list on the final head, the packet's polish stills and clips. If the child misses on the count: back to the lead
   before changing anything (the lead, 12:05 PM).
5. drawcheck: add 2-5 to tools/perf/limits.json scenarios (2-4's commit 81b152fa did it).

## Done (commits on t-build-25)
- 726c0071 two engine pieces, each PLANTED (green after, RED planted in the same test): **R-165.336** StageSpec.count -> targetCount +
  LevelConfig.countSet, no top-up (src/game/gen2/countSet.test.ts); **R-165.337** PadRow.freeBite -> Pad.freeBite: a teaching row's
  bite jolts and holds, no heart (snapRow.test.ts last test). Both rulings the lead's 11:50 AM ET.
- 7de7bdf4 2-5 laid (src/game/gen2/worlds/w2Arc25.ts, kit 'w2-25', stageTable + listed.ts): seeds 1-6 Normal and 1-2 Easy build with
  gen2.errors empty, the beats in order, 9 snappers, width ~28.6-29.2k px. Also PadRow.clock (named shared bars) and snapFaults judging
  Easy on the row Easy plays (accepted 12:05 PM; plants owed, step 2).
- 11410e1a the hand-built 2-5 deleted, tests re-pointed, the old turtle's Dot rows retired, lines-2-5.md copied.

## The lead's rulings (this session)
- 11:50 AM: GO on arc, rows, beats; Easy splash-back everywhere; goal by data (b); teach bite no heart; beat 5 fallback OK.
- 11:53 AM: R-165.336 / R-165.337; freeBite on the teach stone only, never keyed off `safe`.
- 12:05 PM: goal 8 of 9 accepted; PadRow.clock + snapFaults change accepted (plant both); short level snapper banks accepted as data:
  NAME in the final REPORT as the same placer root as R-165.312 (the flag placer moving predators).

## Named rough spots / open
- Beat 5's snappers are on the far bank past the rope's landing (the rope's pit has no ground), so 9 laid, not the design's 7.
- The Big Snap's "last snappers dive away" is not built (no animal is laid there); the stage is ~29k px wide (stage time unmeasured).
- Easy keeps all 9 snappers softened (easy 'stay'): the node asks would re-lay any the count cut took, anywhere on the node.
- No gate run yet beyond tsc and generalitycheck PASS (on 726c0071); NOTHING else is green yet: the suite has not run.

## Learned (proposed level.md rules)
- A designed animal needs ground no rolled flag can take: ROLLED flags are laid before sockets and a flag's 200 px approach drops the
  socket; the node ask then re-lays the animal anywhere on the node's banks (once 224 px past Dot's line). Lay it on ground under
  FLAG_SPAN.pad (160 px) or prove its seat on every listed seed.
- Two Pg (same letter, job, content) beats roll in either order: give each a `window` (share of the stage).
Lessons applied: D30 (times from date), D40 (engine pieces first, then the stage), D57 (notifications at push), D87 (seed run backgrounded).
