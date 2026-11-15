# FIX-21 REPORT: 2-1 green and showable. Engine, Opus 5.5 high. Branch t-fix-21 from t-build-21@842dc885.
Method: reference/methods/level.md (rules 21-29), stage-fix.md, render-fix.md. Lessons applied: D15 (tested the bot before trusting it:
the trace, not the table), D19 (tests call the game's build: RealPlay, buildGen2Stage), D21 (spread: every W2 strip measured, 1-6/1-9
swept), D36, D40 (no patch of the old builder's 1-6/1-9), D57 (MISSED once: the 1:53 ruling sat unread until my push), D59, D62
(stills print the BUILT seed/setting), D69 (plants RED), D79 (the whole screen judged).

## EXACT NEXT STEP = integration onto link #5
1. Take 82743678 (the bounce-alone rule, self-contained; INT-10d already cherry-picks it onto link #4 for 1-6/1-9), then t-fix-21's
   head for 2-1 (relist, data, the safe over pass, w2mist-mid, the log handover: engine.ts + src/game/logHandover.test.ts of ec96fe0c
   only; ec96fe0c's bot half is reverted in cbc82ff3).
2. On the integration head: 1-6 and 1-9 move (their bounce walls 226-237 px are held to the bounce alone): relist, bots, lock there.
3. The gates UNRUN here are listed under Unresolved; run them on the integration head.

## Done-items
BOTS_TABLE

## Polish check
STILLS

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
UNRESOLVED

## Method update
- level.md rule 28: a "same shape passes elsewhere" claim is checked with a sweep of the BUILT stages before it is written (a 30-line
  finder: mushroom + face within 140 px over 200 px).
- render-fix.md: a pixel probe must repaint the ground squares and hit-test them in world coordinates (engine-core.md 0zf trap).

## Learned
The bot table is a symptom list: 2-1's kid/adult 0/40 hid two causes (the untaught combo AND a walking rider drowning at a bank).

## Turnover note
reference/handoffs/engine-core.md section 0zf (this commit).
