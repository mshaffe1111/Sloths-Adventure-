# P13: 1-3 proven (plumbing beside W1C, then F13). `t-13-proof` from origin/t-w1-creatures (+ t-12-fly, + F13 t-13-finish), 2026-11-12 ET.
Final numbers: F13 4d553c9b (1-3 with the two-snakes beat, W1C's last head, t-int-2). No PR. STILL OWED: the seed list (blocked: the
quiet line, F13's geometry, below) and the stills re-shoot on the final head.

## Done items (evidence)
1. **Completable** (castBots.ts, real engine, both settings, F13 4d553c9b, seeds 1-130: P13/castBots-real-f13-4d553c9b-*.txt):
   adult, child, middle, expert 130/130 on Normal AND Easy, kid Easy 130/130; kid Normal 123/130: 7 stranded one short of the goal
   (he shoves the awake finale snake instead of clearing it, then cannot get up its log on the turn-back; every other tier clears it:
   a bot limit, not a softlock, the lead accepted it 2:01). **Kid apart** (R-165.150, the <50 px block he can walk into).
   **Length, min s N/E** (seeds 1-130): kid 124.9/125.3, adult 134.6/132.9, middle 209.9/189.2, child 425.1/265.6, expert 184.3.
2. **Bots know a trap** (firsttimer.ts castPlan, from `e.cast` only): told by Dot, he goes for a handle whose load hangs over an
   uncleared animal beyond it, keeps it as a goal (walks back after overshooting: W1C's trace), punches from anywhere in its measured
   reach (-10..85 px): KID/ADULT on the move (their thumbs never let go, R-165.59), tiers by taps. On a cast stage: he turns back
   from a sealed shrine once Dot says why; a tier's thumb lift holds his stopped count at a log face (child N 9/16 -> 16/16, A/B).
   castBots.test.ts 6/6 (5 planted, red without; 1 named a behaviour check). tierBots.test 7/7 and firstTimerBot.test: 1-1 and 5-9
   unchanged. **The bar: every tier told of traps AND springs trap0, Normal and Easy** (one middle Easy roll of 130 missed it).
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
6. **Seed list**: NOT recorded. 123 of seeds 1-130 pass the bots (every tier, both settings, no rescue, >= 120 s:
   P13/proven-1-3-candidates.json). 1-1's own filter (seedlist.ts, as the lead ruled) then keeps **0 of 123**: the QUIET LINE (4 s)
   fails on every roll, 8-11 s inside w1-13-stone-stair after its stone trap (seed 1: flat ground x 10481-11892 with only flowers),
   and the search's repair throws "the pool is spent" (a designed graph has no spare piece). To F13 (geometry) and the lead, 3:05 PM.
   seedlist.ts itself is general (any listed stage by its row); `--merge <candidates> --in-order --count 100` records once it passes.
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
