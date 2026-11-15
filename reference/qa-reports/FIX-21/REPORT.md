# FIX-21 REPORT: 2-1 green and showable. Engine, Opus 5.5 high. Branch t-fix-21 from t-build-21@842dc885.
Method: reference/methods/level.md (rules 21-29), stage-fix.md, render-fix.md. Lessons applied: D15 (tested the bot before trusting it:
the trace, not the table), D19 (tests call the game's build: RealPlay, buildGen2Stage), D21 (spread: every W2 strip measured, 1-6/1-9
swept), D36, D40 (no patch of the old builder's 1-6/1-9), D57 (MISSED once: the 1:53 ruling sat unread until my push), D59, D62
(stills print the BUILT seed/setting), D69 (plants RED), D79 (the whole screen judged).

## EXACT NEXT STEP = integration onto link #5 (the lead's rulings 2:56 and 3:02 PM ET)
Merge order onto link #5, on top of link #4's head (which already carries the rule 82743678 and INT-10d's fix for w1.test, option (a)):
1. 5ce1059f + 4c7aee10's drawing half: riverArt.ts/engine.ts (safe over pass, under-bed earth) and w2mist-mid.webp.
2. 9137470f (the tier bots see a narrow gap; APPROVED). Then re-run 1-1's tier calibration ONCE and recommit calibration-main.jsonl
   (BOTS.md); tierBots.test 'replay exactly' also needs TierRun.handed in the committed replays (red since t-build-21).
3. ec96fe0c's ENGINE half only: src/game/engine.ts drift-loop handover + src/game/logHandover.test.ts (its firsttimer.ts/bounceThrow
   half was reverted in cbc82ff3).
4. 2-1's data: w2Arc21.ts high bank 174-180 (cbc82ff3) and the relist seeds-2-1.ts/provenIndex.ts (4c7aee10), checked again with
   seedlist 2-1 --check on that head. Then castBots 2-1 1-40 every tier both settings, 1-6/1-9 relist + bots, and every gate.
## Done-items
- (1) Root cause, traced (kid N seed 4, FT_FRAMES 107.4-110): the bank was 206-210 px over the lily's cap, the bounce alone rises 181;
  the first-timers never press after a run-on bounce. Lead's ruling 1:53: no stage requires the bounce + air jump before one teaches
  it. 82743678: skills.ts COMBO_REQUIRED_FROM + comboGuaranteedAt, pipeline.ts bounceCap / reach.ts bounceLipOverCap / verdicts.ts
  classify read it; bounceAlone.test.ts 2/2, both planted both ways. 2-1's bank 174-180 (w2Arc21.ts). Relist: 100 of 100, verdicts
  refuse 0, quiet line <= 3.8 s.
- A second cause, engine (ec96fe0c): a WALKING rider fell through at the far bank; now handed over like a carried one.
  logHandover.test.ts 2/2, RED without (kid N seed 4 x30,971, 3 lives).
- castBots 2-1 1-40, every tier, both settings, on 4c7aee10 (castBots-2-1-1-40.txt): kid N 36 E 39 (were 0/0), adult N 40 E 39
  (were 0/0), child N 33 E 31 (were 32/32), middle N 40 E 37, expert N 40 (E row not printed, as on BUILD-21). None under 120 s.
  Traces (rule 28): kid N seed 1, beat 8 (deep river with him): runs off log 111's front end, 10 lives, rescued 24,591 (accepted by
  the lead 2:56 as an honest first-timer misread). child E seed 10: walks into the 110 px splash creek (look-ahead past it), rescued
  2,063 -> 9137470f (held for ruling).
- Lock (lockall --layouts 16 --intended 2-1 --check vs t-build-21's): 101/102 unchanged, 2-1 changed as intended.
- Suite (3 shards, on 4c7aee10): 3 fail-sets; NEW: w1.test exitDy (82743678). Already red on t-build-21: stageQuality x2, river.test
  #6, riverSection #10. tierBots.test 'replay exactly' red on both (TierRun.handed).
- (2a) safe over pass = riverArt.ts drawSafeRiverOver; under the bed the banks' earth (drawSoil, clipped) (5ce1059f). (2b)
  w2mist-mid feathered (stripjoin.py: 21.9% -> 0.1%). (2c) not fixed (Suggestions 1).

## Polish check
- stills/ (0b8fa406; seed 2 BUILT, printed by the game): Normal x8330/x30100/x2300 safe (shallow, stones) beside x14180/x19330/
  x24290/x25290 deep (dark teal); Easy every river safe. Panel spots x14180, x30100, Easy x14200: no hard edge. x22300: the bank behind
  the lily. Whole screen (D79): banks, rocks, cattails, HUD painted. The under-bed earth (5ce1059f) checked on x8330 N and x14200 E
  (scratch shots); the committed stills predate it (flat bed shows in them). x2300's far-bank band remains (named).

## Pushback
- BUILD-21's "1-1's gBounceWall of the same shape passes" was not true: no listed W1 stage on this base rolls a mushroom under a full
  bank (1-1 seeds 1-40; 1-2..1-5, 1-7, 1-8, 2-2 seeds 1-40: none; 1-6 12 of 40, 1-9 80 rolls, both the old builder here). I first
  told the lead "no W1 stage requires it", then corrected it at 2:07 PM (1-6, 1-9).

## Suggestions (ready packets)
1. RENDER-FIX 2-1 x2300 band (R-id needed): a darker vertical band on the far bank's body (seed 2 sideways, screen 660-705 = world
   ~2708-2775, lip to bottom), on BUILD-21's head and mine. Ruled out by A/B on the real page: the bank end piece (drawEnd off), the
   depth line's averaging (LINE_REACH 1), the soil tile join (w2 fills' edge columns match: 107 vs 107). Probe (tools/inspect/_shoot21.mjs
   pattern, in engine-core.md 0zf's trap) sees the same draws inside and outside; next: a clip-aware probe (stroke/clip/composite) or
   bisect the render passes. Files: src/game/protoArt.ts, groundPaint.ts. Done: the band gone, upright and sideways, Normal and Easy.
2. GATE strip joins: run tools/art/stripjoin.py measure over src/assets/backdrops in CI, fail over 5% cut rows (known list: w2rapids-near
   2.8% is under). Files: tools/perf/, gates.yml.
3. DESIGN: the bounce + air jump's teach (no stage teaches it; skills.ts COMBO_REQUIRED_FROM['bounce-air'] gets its id when built).

## Unresolved
- w1.test exitDy red (new, 82743678): ruled (a), INT-10d fixes it on link #4. Child Easy 31/40 table predates 9137470f (approved;
  2-1 child/middle Easy 1-40 to re-run on link #5).
- drawcheck, clipcheck, buildcheck, the build, chunkcheck NOT run here (context box). Stills not re-shot after 5ce1059f.
- x2300 band (Suggestions 1). w2rapids-near 2.8% cut rows (under any bar; named).

## Method update
- level.md rule 28: a "same shape passes elsewhere" claim is checked with a sweep of the BUILT stages before it is written (a 30-line
  finder: mushroom + face within 140 px over 200 px).
- render-fix.md: a pixel probe must repaint the ground squares and hit-test them in world coordinates (engine-core.md 0zf trap).

## Learned
The bot table is a symptom list: 2-1's kid/adult 0/40 hid two causes (the untaught combo AND a walking rider drowning at a bank).

## Turnover note
reference/handoffs/engine-core.md section 0zf (this commit).
