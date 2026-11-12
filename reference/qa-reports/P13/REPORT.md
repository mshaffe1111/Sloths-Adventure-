# P13: 1-3 proven (plumbing beside W1C). `t-13-proof` from origin/t-w1-creatures (+ origin/t-12-fly @ed329f74), 2026-11-12 ET. No PR.
Base for the numbers: W1C @26f72b31 (1-3 in World 1's shipped kit). STILL OWED: W1C's trap0 teach placement and `teachTips: ['traps']`
in w1.ts, then the re-fly and the seed list (item 6), which waits for the lead's OK.

## Done items (evidence; bots on W1C 87069d9d, the real 1-3 in World 1's shipped kit; the list waits for F13's final head)
1. **Completable** (castBots.ts, real engine, both settings, seeds 1-40 and 41-130: P13/castBots-real-87069d9d-*.txt): adult,
   child, middle, expert 130/130 on Normal AND Easy, kid Easy 130/130; kid Normal 118/130: 12 stranded at 8-9/10 (he shoves the
   awake finale snake instead of clearing it, then cannot get up its log on the turn-back: every other tier clears it, so a bot
   limit, not a softlock; the lead accepted it 2:01). No unwinnable roll. **Kid apart** (R-165.150, the <50 px block): see above.
2. **Bots know a trap** (firsttimer.ts castPlan, from `e.cast` only): told by Dot, he goes for a handle whose load hangs over an
   uncleared animal beyond it, keeps it as a goal (walks back after overshooting: W1C's trace), punches from anywhere in its measured
   reach (-10..85 px): KID/ADULT on the move (their thumbs never let go, R-165.59), tiers by taps. On a cast stage: he turns back
   from a sealed shrine once Dot says why; a tier's thumb lift holds his stopped count at a log face (child N 9/16 -> 16/16, A/B).
   castBots.test.ts 6/6 (5 planted, red without; 1 named a behaviour check). tierBots.test 7/7 and firstTimerBot.test: 1-1 and 5-9
   unchanged. **The bar: every tier told of traps AND springs trap0 on 130/130 rolls, Normal and Easy.** Traps sprung 87-90%.
3. **Flown rows**: FLIGHT_STAGE=1-3, both settings (P13/fly/): Easy identical to easy-any; Normal 0-5 px under 1-2's. 8
   `normal-1-3` rows (flownArcs.ts, sourced chain.md §1; single hold's any the flown 244). Row `judged: 'normal-1-3'`. **Real 1-3:
   120/120 clean Normal and Easy, seeds 1-120 and 50001-50120, 240/240 judged, 0 thrown** (clean.ts, any listed stage).
4. **"excuse me"**: a wayside line waits on a moment by data (`StageWay.on`, engine `moments` 'cast:<way>', GuideView.moments,
   DotGuide). Fires on the first punch-glide only: castMoments.test.ts (real engine: no punch, a shove, a trap: no line; the first
   punch-glide: the line; the trap line stays W1C's), wayside.test.ts. Red without, green with.
5. **Stage rules** (on 7d9efa0d; length re-measured on 87069d9d in 6): TEACH (the lead's ruling, my lane): `StageHint.teach` / `WorldManifest.teachTips` -> Dot's teach line: waits up
   to 60 s, skips the gap (soon), stays its reading time, cuts in over a stock info card after 1.5 s, never cut by a stock lesson; the
   stock foe lesson skips an animal under a set trap (dotTeach.test.ts 6/6, teachTips.test.ts, castMoments.test.ts; RealPlay passes
   the flag). **LENGTH FAILS (to W1C): min s N/E kid 114.9/116.1 (Easy median 119.0), adult 119.9/120.3**, child 379.8/252.4,
   middle 178.4/165.1, expert N 157.9. Landing noise: W1C's TAUGHT.landing = World 2. funcheck: the test-side 1-3 added ONE breach
   (Easy "looks like an earlier stage" 8 vs 6); the other 11 are on the base (P13/funcheck-*.txt); not re-run on 7d9efa0d.
6. **Seed list**: NOT recorded: the lead records it on F13's FINAL head (a new beat changes every roll), with his OK first.
   Filter = 1-1's own (seedlist.ts: clean both settings, verdicts accepted, quiet line <= 4 s) PLUS the bots via --merge (castBots
   --proven: every tier, both settings, shrine, goal full, no rescue, none under 120 s; item 6's "rolls that pass 1-5"). Yield on
   87069d9d: 117 of seeds 1-130 (13 out: 12 kid N strands, 1 kid N 119.5 s). Length then: min s kid 119.5/121.0, adult 123.8/124.0.
7. **Stills** (P13/stills/, the REAL game, layout 1 Normal, the adult first-timer's own run, each moment in the run's state:
   ft-moments.ts + ft-stills.mjs). Tool fixed per the lead (2:36): the HUD count is the run's, traps keep their exact state, moments
   trap-set and trap-falling added. To be re-shot on F13's final head.

## Polish check (P13/stills, contact sheets looked at)
- trap0 set: the hive hangs over the sleeping snake, the vine by his hand, upright and sideways. Mid-fall and after: the load lands
  on the log, the snake gone. The gallery sideways: the stone over a snake, its vine. OK.
- **Named:** upright, trap0's sleeping snake sits at the screen's right edge (W1C named it). At the totem the HUD reads 11/10 (the run
  cleared 11 of a goal of 10): asked the lead whether over-target display is intended.
- **Named:** the engine lets Pokey walk INTO a block under 50 px and stand inside it (engine.ts `height < 50` is no wall): R-165.150.

## Gates (t-13-proof on W1C 219502e1)
tsc clean; full src/game + components + audio: 2556 pass, red only w1Pits.test.ts:58 (red on W1C's own head too: F13's); gen2+
worlds green; generality PASS (27 known); tierBots 7/7; castBots.test 6/6; seedlist 1-1 --check PASS 355; lock 16 layouts: 101/102
unchanged, 1-3 intended (on 26f72b31); vite build, chunkcheck, artcheck, knowncheck PASS. Not run: drawcheck, clipcheck, kbdcheck,
buildcheck (no drawing or menu changed); roadmapcheck (shallow clone). The lock and the 1-1 check re-run on the final head.

## Method update
Worked: fly the bots on the real roll before trusting a teach (the 1.5 s tip was only visible in the bot's Dot). Failed: my first
still script placed Pokey on the stage as built (all snakes, 0/10): stills of a run must carry the run's state (ft-stills.mjs).
Edit for reference/methods/stage-fix.md: "a new mechanic's tip: fly every tier, report told-of and first-sprung per tier".
