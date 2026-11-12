# P13: 1-3 proven (plumbing beside W1C, then F13). `t-13-proof` from origin/t-w1-creatures (+ t-12-fly, + F13 t-13-finish), 2026-11-12 ET.
Final numbers: F13 c925d4e6 (1-3 with the two-snakes beat and the quiet-line fix, W1C's last head, t-int-2). No PR. 1-3's seed list is
RECORDED (100 seeds, first seed 1, the lead's advance OK). Still open on F13's side: the exit vine (would change the rolls: re-record).

## Done items (evidence)
1. **Completable** (castBots.ts, real engine, F13 c925d4e6, seeds 1-130, both settings: P13/castBots-real-f13-c925d4e6-1-130.txt):
   **every tier 130/130 on Normal AND Easy** (kid, adult, child, middle, expert). Earlier kid strands were the bot, not the level:
   strand.ts plays on from each stranded run's exact state and the goal fills every time (P13/strands-*.txt; 10 seeds checked).
   **Length, min s N/E**: kid 133.9/132.7, adult 139.7/138.7, middle 215.5/190.1, child 392.4/274.5, expert 182.0 (rule: >= 120).
   **Kid apart** (R-165.150: the engine lets him walk INTO a block under 50 px; the finale's 25 px log stranded him until the bot fix).
2. **Bots know a trap** (firsttimer.ts castPlan, from `e.cast` only): told by Dot, he goes for a handle whose load hangs over an
   uncleared animal beyond it, keeps it as a goal (walks back after overshooting: W1C's trace), punches from anywhere in its measured
   reach (-10..85 px): KID/ADULT on the move (their thumbs never let go, R-165.59), tiers by taps. On a cast stage: he turns back
   from a sealed shrine once Dot says why; a tier's thumb lift holds his stopped count at a log face (child N 9/16 -> 16/16, A/B).
   On a cast stage he hops up to an animal on a low log rather than punch it from below. castBots.test.ts 6/6 (5 planted). tierBots.test 7/7 and firstTimerBot.test: 1-1 and 5-9
   unchanged. **The bar: every tier told of traps AND springs trap0 on 130/130, Normal and Easy**, heard
   through the game's own setting filter at the phone's default (DotSay.allows: Tips on Normal, Help on Easy). Earlier counts ran with
   no filter: D12 found the teach line dropped on Tips (helpAllows); fixed (a stage teach line passes Tips and Help; planted). A/B,
   seeds 1-10: Normal told 0/10 every tier without the fix, 10/10 with. Real page, defaults (P13/page-teach-lines-defaults.txt): the
   trap line shows on Normal and Easy; 1-3's two plain lines and 1-2's are not teach-marked, so Tips hides them (data: teachTips).
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
6. **Seed list: RECORDED** (src/game/gen2/proven/seeds-1-3.ts + provenIndex.ts): 100 seeds, 1-100, first-run seed 1, on F13
   c925d4e6. Filter: 1-1's own (seedlist.ts: clean both settings, verdicts accepted, quiet line <= 4 s: longest 3.6 s) PLUS the bots
   (castBots --proven: every tier, both settings, shrine, goal full, no rescue, >= 120 s: 130 of 130), fed by --merge --in-order.
   `seedlist 1-3 --check` PASS 100, `1-1 --check` PASS 258. Fix it needed: the quiet measure wrote the goals onto the stage it
   measured (listRules.ts quietOf -> withGoals), so a purge's search differed from its replay; now on a copy. GOAL (to F13 and the
   lead): Normal 13 with 12 traps (the two-snakes vine), Easy 10 with 12 traps: not the trap count the lead asked for.
7. **Stills** (P13/stills/adult-n-1-1-3-L1-*, the REAL game on c925d4e6, layout 1 Normal, the adult first-timer's own run, each
   moment in the run's state: ft-moments.ts + ft-stills.mjs): first snake, trap0 SET, mid-fall, after, first punch-glide, the
   gallery, the end; upright and sideways. **R-165.155** (the lead's): the goal sign stops at its goal (goalShown, 13/13 not 16/13).
   **Purge goal card** (the lead's): "This stage: send 13 snakes on their way" / "to open the shrine." (1: "send 1 boa on its way"),
   the creature from the stage's data (engine goalCreature); purgeCard.test; the card measured on 1-3: no overflow (P13/card/).

## Polish check (P13/stills, a contact sheet of all 14 looked at)
- trap0 set: the hive over the sleeping snake, the vine at his hand, both orientations; mid-fall: the load on its way, Dot's "Off he
  glides" line up, the snake gliding off; after: the load on the log, the branch empty. The count climbs 0, 1, 8, 9, 13 of 13. OK.
- **Named:** upright, trap0's sleeper sits near the right edge (W1C named it); stand-in trap art (ART-W1's); the faint soil line
  (RF2's fix not on this base); the exit vine not painted yet (F13/ART-W1B). R-165.150 (walking into a low log) is a real engine defect.

## Gates (t-13-proof on F13 c925d4e6 + the list)
tsc clean; gen2+worlds 483 pass, 1 red: yield.test.ts:62 (1-1 yield 11 of 30, floor 12), red on F13's c925d4e6 alone too: F13's. Full
src/game earlier on W1C 219502e1: red only w1Pits.test.ts:58 (W1C's own head too: F13's). seedlist 1-3 --check PASS 100, 1-1 PASS 258;
generality PASS; tierBots 7/7; castBots.test 6/6; my tests (dotTeach, castMoments, wayside, teachTips, judgedTable, goalShown) green;
lock 16 layouts 101/102 unchanged, 1-3 intended (W1C 219502e1); vite build, chunkcheck, artcheck, knowncheck PASS (final head). Not run
on the final head: drawcheck, clipcheck, kbdcheck, buildcheck, roadmapcheck (shallow clone); F13 owns 1-3's final-head gates.

## Method update
Worked: fly the bots on the real roll before trusting a teach (the 1.5 s tip was only visible in the bot's Dot). Failed: my first
still script placed Pokey on the stage as built (all snakes, 0/10): stills of a run must carry the run's state (ft-stills.mjs).
Worked: strand.ts (play on from a stranded run's exact state) settles bot-or-level in one run. Edit for reference/methods/stage-fix.md:
"a new mechanic: fly every tier, report told-of and first-sprung per tier; a stranded bot: run strand.ts before calling it a softlock".
