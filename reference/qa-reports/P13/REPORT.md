# P13: 1-3 proven (plumbing beside W1C). `t-13-proof` from origin/t-w1-creatures (+ origin/t-12-fly @ed329f74), 2026-11-12 ET. No PR.
Base for the numbers: W1C @26f72b31 (1-3 in World 1's shipped kit). STILL OWED: W1C's trap0 teach placement and `teachTips: ['traps']`
in w1.ts, then the re-fly and the seed list (item 6), which waits for the lead's OK.

## Done items (evidence)
1. **Completable** (castBots.ts, real 1-3, seeds 1-60, both settings, real engine): adult, middle, expert 60/60 on Normal AND Easy;
   child 56/60 N, 59/60 E. Fails by cause: 5 child rescues, every one a bot quirk on a shipped World 1 section (below), 1 child Easy
   stranded (seed 49). No softlock, no unwinnable roll: every bot that walked past a snake turned back for it once Dot said why.
   reference/qa-reports/P13/castBots-real-1-60.txt. Test-side 1-40 runs before and with the teach line: castBots-1-40-*.txt.
2. **Bots know a trap** (firsttimer.ts castPlan, from `e.cast` only): told by Dot (a line naming the vine/tendril and a blow), he walks
   to a handle whose load hangs over an uncleared animal beyond it, punches, waits for the load. castBots.test.ts (planted on 2-2):
   springs an armed trap with no hit (red without castPlan), passes a trap over nothing, never uses one he was not told of. Also: he
   turns back from a sealed purge shrine once Dot's must line is up (gives up after 20 s with no nearer). tierBots.test 7/7: 1-1 unchanged.
3. **Flown rows**: FLIGHT_STAGE=1-3, both settings (P13/fly/): Easy identical to easy-any; Normal 0-5 px under 1-2's, nothing gained.
   8 `normal-1-3` rows (flownArcs.ts, sourced chain.md §1; the single hold's any is the flown 244, not 1-1's design-to 246). Row
   `judged: 'normal-1-3'`. **Real 1-3: 120/120 clean Normal and Easy, seeds 1-120 and 50001-50120, 240/240 judged, 0 thrown**
   (tools/engine/runs/clean.ts, any listed stage; P13/clean-1-3-*.txt). No rule loosened.
4. **"excuse me"**: a wayside line can wait on a moment by data (`StageWay.on`, engine `moments` 'cast:<way>', GuideView.moments,
   DotGuide). 1-3's line fires on the first punch that sends a snake gliding: castMoments.test.ts (real engine) no punch no line, a
   shove no line, a trap no line (the trap line stays W1C's), the first punch-glide the line; wayside.test.ts. Red without, green with.
5. **Stage rules**: length: expert N min 145.8 s, adult N min 120.8 s; **adult EASY 117.7-119.9 s on 9 of 60 rolls (under 2 min)**:
   to W1C/lead. Teach: DEFECT found and fixed in my lane (the lead's ruling): the trap tip was cut after 1.5 s by the stock "Tap to
   punch" lesson, or never shown. Now `StageHint.teach` / `WorldManifest.teachTips` -> a teach line that waits (60 s), skips the gap
   (soon), stays its reading time, never cut by a stock lesson; the stock foe lesson skips an animal under a set trap (dotTeach.test.ts,
   teachTips.test.ts, castMoments.test.ts, all red then green). With it (preview): every tier told 40/40. **trap0 still missed**: the
   tip is 232 px before trap0's handle, read after he passes it (first trap sprung: child 39/40, middle 19, expert 13, adult 0, kid 0):
   W1C's placement. Landing noise: W1C's TAUGHT.landing = World 2 (nothing wakes in 1-3). funcheck: 1-3 adds ONE breach (test-side:
   Easy "looks like an earlier stage" 8 layouts vs 6); the other 11 breaches are on the base without 1-3 (P13/funcheck-*.txt).
6. **Seed list**: NOT recorded. seedlist.ts is general already; candidates = castBots --proven (every bot, both settings, no rescue,
   none under 2 min): 47 of 60 today (13 out: 9 adult Easy under 2 min, 4 child). First listed seed would be 1. Waits for W1C + OK.
7. **Stills** (P13/stills/, ft-stills.mjs: the run's own state at each moment, test-side roll seed 1 N with the teach preview): first
   snake, first trap, first punch-glide, gallery, end; upright and sideways. To be re-shot on the final head.

## Polish check (P13/stills, the contact sheet looked at)
- First snake: the sleeper coiled under the hive, the vine by his hand, both on one upright screen. OK.
- First trap: the hive lies on the empty branch, the snake gone. OK. (In this run the adult had passed trap0: this is trap 1.)
- **Rough, named:** the goal sign reads 0/10 in every still, the end too: my still tool sets the count after the start and the HUD
  is not refreshed by it (the run itself counted 10/10). A still-tool limit, not the game; not fixed.
- **Rough, named:** the engine lets Pokey walk INTO a block under 50 px (a 35 px stump in w1-log-walk) and stand inside it against
  the log behind (engine.ts 2431 `height < 50` is no wall). Shipped World 1 behaviour, not 1-3's; the child bot's rescues come from it.

## Gates (final head: see the last commit's message for the run)
tsc clean; gen2+worlds 442/442 after the table pin; touched tests green; generality PASS (27 known); tierBots 7/7.
seedlist 1-1 --check / lock 16 layouts (intended 1-3) / full src/game suite / fast gates: RUNNING (filled in below at the stop).

## Method update
Worked: fly the bots on the real roll before trusting a teach (the 1.5 s tip was only visible in the bot's Dot). Failed: my first
still script placed Pokey on the stage as built (all snakes, 0/10): stills of a run must carry the run's state (ft-stills.mjs).
Edit for reference/methods/stage-fix.md: "a new mechanic's tip: fly every tier, report told-of and first-sprung per tier".
