# P13: 1-3 proven (plumbing beside W1C). `t-13-proof` from origin/t-w1-creatures (+ origin/t-12-fly @ed329f74), 2026-11-12 ET. No PR.
Base for the numbers: W1C @26f72b31 (1-3 in World 1's shipped kit). STILL OWED: W1C's trap0 teach placement and `teachTips: ['traps']`
in w1.ts, then the re-fly and the seed list (item 6), which waits for the lead's OK.

## Done items (evidence; numbers on W1C 7d9efa0d, the real 1-3 in World 1's shipped kit)
1. **Completable** (castBots.ts, real engine, seeds 1-40, both settings: P13/castBots-real-7d9efa0d-1-40.txt): adult, middle,
   expert, child Easy, kid Easy 40/40; kid Normal 39/40 (seed 11 stranded at 9/10, a snake near); child Normal 37/40 (3 rescues at
   shipped World 1 steps). No softlock, no unwinnable roll. Earlier heads: castBots-real-1-60.txt, castBots-1-40-*.txt (test-side).
   **Kid tier apart** (R-165.150, the <50 px block he walks into): 39/40 N, 40/40 E now; before the bot fix 24/30 N, 29/30 E.
2. **Bots know a trap** (firsttimer.ts castPlan, from `e.cast` only): told by Dot (a line naming the vine and a blow), he goes for a
   handle whose load hangs over an uncleared animal beyond it, keeps it as a goal (walks back if he overshoots: W1C's trace), and
   punches from anywhere in its measured reach (-10..85 px): KID/ADULT on the move (their thumbs never let go, R-165.59), tiers by
   taps. castBots.test.ts 5/5 (planted on 2-2, each red without). He turns back from a sealed shrine on a cast stage once Dot says why.
   tierBots.test 7/7 (1-1 unchanged); firstTimerBot.test's 5-9 kid runs unchanged.
   **The bar: every tier told of traps 40/40 AND springs trap0 40/40, Normal and Easy.** Traps sprung per tier 306-327 of 360.
3. **Flown rows**: FLIGHT_STAGE=1-3, both settings (P13/fly/): Easy identical to easy-any; Normal 0-5 px under 1-2's. 8
   `normal-1-3` rows (flownArcs.ts, sourced chain.md §1; single hold's any the flown 244). Row `judged: 'normal-1-3'`. **Real 1-3:
   120/120 clean Normal and Easy, seeds 1-120 and 50001-50120, 240/240 judged, 0 thrown** (clean.ts, any listed stage).
4. **"excuse me"**: a wayside line waits on a moment by data (`StageWay.on`, engine `moments` 'cast:<way>', GuideView.moments,
   DotGuide). Fires on the first punch-glide only: castMoments.test.ts (real engine: no punch, a shove, a trap: no line; the first
   punch-glide: the line; the trap line stays W1C's), wayside.test.ts. Red without, green with.
5. **Stage rules**: TEACH (the lead's ruling, my lane): `StageHint.teach` / `WorldManifest.teachTips` -> Dot's teach line: waits up
   to 60 s, skips the gap (soon), stays its reading time, cuts in over a stock info card after 1.5 s, never cut by a stock lesson; the
   stock foe lesson skips an animal under a set trap (dotTeach.test.ts 6/6, teachTips.test.ts, castMoments.test.ts; RealPlay passes
   the flag). **LENGTH FAILS (to W1C): min s N/E kid 114.9/116.1 (Easy median 119.0), adult 119.9/120.3**, child 379.8/252.4,
   middle 178.4/165.1, expert N 157.9. Landing noise: W1C's TAUGHT.landing = World 2. funcheck: the test-side 1-3 added ONE breach
   (Easy "looks like an earlier stage" 8 vs 6); the other 11 are on the base (P13/funcheck-*.txt); not re-run on 7d9efa0d.
6. **Seed list**: NOT recorded: blocked by the 2-min floor (7 of 40 seeds clear it for every tier). Filter = 1-1's own (seedlist.ts:
   clean both settings, verdicts accepted, quiet line <= 4 s) PLUS the bots via --merge (castBots --proven: every tier, both
   settings, shrine, goal full, no rescue, none under 120 s: item 6's "rolls that pass 1-5"). First seed would be the first proven.
7. **Stills** (P13/stills/, the REAL game, layout 1 = seed 1, Normal, the adult first-timer's run, each moment in the run's state:
   ft-moments.ts + ft-stills.mjs): first snake, first trap, first punch-glide, the gallery, the end; upright and sideways.

## Polish check (P13/stills, the contact sheet looked at)
- First snake: the sleeper coiled under the hive, the vine by his hand, both on one upright screen. OK.
- First trap (trap0 now): the hive lies on the empty branch, the snake gone. OK. Gallery sideways: the stone over a snake, its vine.
- **Rough, named:** the goal sign reads 0/10 in every still, the end too: my still tool sets the count after the start and the HUD
  is not refreshed by it (the run itself counted 10/10). A still-tool limit, not the game; not fixed.
- **Rough, named:** the engine lets Pokey walk INTO a block under 50 px (a 35 px stump in w1-log-walk) and stand inside it against
  the log behind (engine.ts 2431 `height < 50` is no wall). Shipped World 1 behaviour, not 1-3's; the child bot's rescues come from it.

## Gates (final head: see the last commit's message for the run)
tsc clean; gen2+worlds 442/442 after the table pin; full src/game/*.test.ts: 4 red, the SAME 4 red on origin/t-w1-creatures (sent to
W1C: cameraLead.test.ts x3, its 1-3 snake fixture; artUse.test.ts:20 reaverAtlasData#ultprep off the allow list); mine (5-9 kid runs)
fixed. seedlist 1-1 --check PASS 355; lock 16 layouts: 101/102 unchanged, 1-3 intended; generality PASS (27 known); tierBots 7/7;
castBots.test 4/4; vite build, chunkcheck, artcheck, knowncheck PASS. Not run: drawcheck, clipcheck, kbdcheck, buildcheck (no
drawing or menu touched); roadmapcheck (shallow clone).

## Method update
Worked: fly the bots on the real roll before trusting a teach (the 1.5 s tip was only visible in the bot's Dot). Failed: my first
still script placed Pokey on the stage as built (all snakes, 0/10): stills of a run must carry the run's state (ft-stills.mjs).
Edit for reference/methods/stage-fix.md: "a new mechanic's tip: fly every tier, report told-of and first-sprung per tier".
