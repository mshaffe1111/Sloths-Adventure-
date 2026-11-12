# D12: 1-2 The Petal Trail, designed and built. `t-12-design` from origin/t-12-ship. Started 1:40 PM ET; finished 5:47 PM ET. No PR.
**EXACT NEXT STEP:** INT-2 merges this branch and FX's final head into t-int-2. Then I cut ONE small branch, t-12-note, from that head:
a `findSpot` socket on the twist's hollow floor 'hf' at t 0.6 (by its root), the roots line back on the lip bank 'a', and a test (the
find on that floor every roll, both settings; the line said once). RF3 fixes the hollow painter (w1Pits #17, the one red left); FX takes
the flags off the mushrooms (R-165.156). Then 1-2's seed list, with the lead's OK.

## Done-items (packet D12 and the lead's rulings since)
1. **Design** `reference/design/1-2.md` (60 lines): PASS from the lead at 2:06 PM ET, kept in step with the build.
2. **Built as data in World 1's kit** (`src/game/gen2/worlds/w1Arc12.ts`): ONE graph `A T P R U R X R W R S R C E`, one brick a beat.
   Its arrival, five rests and exit are its own pieces, and the pool is its own; the old rolled 1-2 is deleted. Matt's three
   (`chain.mount`, `landing.dead-zone`, `bounce.no-purpose`), every other verdict and generalitycheck hold on every roll, both settings.
3. **Stills from the real game** in `stills/`: every beat upright 412x915 and sideways 915x412 at 2x, plus two contact sheets.
4. **Purpose, design check (4):** a full jump cleared every thorn bed from beat 4 on. The generator lays no gap past 114 px, so a bed
   can't be widened past a jump. **Ruling A:** on Normal from beat 4, each cap is as wide as its stump, so the caps are his only
   footing over thorns. The stair went from 160 to 110 px stumps (160 px caps were out of scale). The lesson, again and Easy keep wood.
5. **The thorns cost (P12S's finding: 49-66 px hollows caught him on the lip):** on Normal from beat 4, stumps are chain.md's
   narrowest (110) and each step sits at the top of its band. The pits between pillars are 102-110 px, chain.md's widest (75-110), so a
   miss falls in. A new test holds the pit band; it caught Easy's stair at 28-36 px (band 35-70), now 35-40.
6. **Dot's thorn lines, CLEARED:** I merged t-13-proof for P13's `teachTips` and its Tips fix. On the real page on NORMAL, Dot says
   "Ooh, thorns..." at x 2515, held about 7 s, and "Hop on..." at x 3021 (stills `1a`, `1c`). Main's "The petals go up" is cut, so the
   stair has no line.
7. **P12S's reds on 1-2's content, and the set-back model (the lead's, to me):** plainWalk "one-jump steps" FIXED in data (a rest's
   root stood 36 px past a 24 px step). The thorn bed is a SET-BACK, not a dip or a landing: plainWalk "dips", w1Pits #13 and
   stageQuality's narrow landings now read it so (`jumpEdges` never counts a hurt floor), never loosened. The new `thornSetBack.test.ts`
   (real engine, 1-1/1-2/1-3, 2 seeds, both settings) holds every hurt floor taught first, really fallen into and setting him back
   safely, with planted faults both ways. w1Pits #17 is RF3's painter.

## Numbers (rolls, tests and bots on 90934682; d4d296fc after it changes only how tests and stageMetrics read the thorn bed: rolls the same)
| what | result |
|---|---|
| rolls, seeds 1-12, both settings (`tools/engine/library.ts --seeds 12`) | CLEAN 24 of 24, the 14 beats in order; quiet line at most 3.7 s (binds at 4); flags 14-15 Normal, 10-12 Easy; 210-213 s typical |
| tier bots, seeds 1-8 (`runTier` plus a heartFall hook) | Normal 24 of 24 at the shrine, 0 lives lost (child 316-383 s, middle 157-174, expert 141-150); Easy 16 of 16, 0 lives lost, 5 soft set-backs |
| thorn hits, Normal, seeds 1-8 | expert 4 (beat 6: 2 runs of 8; again 1, finale 1); middle 0; child 0. With wood (9bf82531), beat 6: child 1, middle 0, expert 0 |
| harvest goal on natural runs (138c3b36) / `library.test.ts` (in CI) | 0 sealed doors in 32 runs / 19 of 19, 6 planted faults caught (a bare-wood cap, a pit out of band, teachTips left out, a missing beat, a line with no words, thorns in the twist) |
| every gate on d4d296fc (CLAUDE.md "Checks", a frozen worktree; later: docs, and library.test's pit plant, its gates re-run) | tsc, build, chunkcheck, artcheck, knowncheck, generalitycheck, kbdcheck, drawcheck, `seedlist 1-1 --check` (258 seeds), tool tests 30 of 30 (31 of 31 at 779d1b8f, with the pit plant), tierBots 7 of 7: PASS. Suite 3082 pass, 2 fail, 1 todo: w1Pits #17 (RF3's painter) and yield.test (1-1, 11 of 30, the same on t-12-ship). buildcheck FAIL (1-1 p95 367 ms vs 150, red on base). roadmapcheck FAIL (level.md not in the methods index, red on both bases), fixed at 950d3ea2: PASS. clipcheck FAIL: "Dot's first tip" over 1-3 never opens (no Skip button in 30 s), the same on t-13-proof (P13's) |
| lock (`lockall --layouts 16 --check`, base 45c56488) | 100 of 102 stages unchanged; only 1-2 (mine) and 1-3 (P13's, merged from t-13-proof) |

## Polish check (stills in `stills/`, judged at phone size)
- **At the bar:** each 110 px cap reads as a spotted mushroom on its own pillar, with a thorn pit between (`4a`, `6-long`, `10a`,
  `12a` sideways). Dot's two lines sit clear of the path both ways (`1a`, `1c`). The twist's floor and petals show from its lip (`8a`).
- **NOT at the bar, named:** (a) Flags stand on floor mushrooms (`2-again`, `12a`; R-165.156, FX). (b) The Keeper's Bell sits where
  addFinds puts it (FX's find spot). (c) The "roots" read as stones. (d) Upright, a chain's first cap is half off-screen from its lip
  (`6-long-upright`). (e) Sideways, the stair's top cap is under the menu leaf (`4a`). (f) Behind the stair's pillars a hollow wall is
  cut straight (w1Pits #17, RF3).
## Pushback
The thorns cost only for a mid-chain Jump or a stop: chain.md's spacing makes a thumb-held crossing clean (child and middle bots, 0).

## Method used / Lessons applied
`reference/methods/level.md`'s steps, in order. D46 (petals only where a clean path reaches); D8/D14 (the natural run meets the goal);
D19 (judged on the page the player sees: it found the Tips drop that the data test could not); D40 (built on P12S's road; P12S's red
on the old 1-2 fixed in the redesign); D36 (gates in my own frozen worktrees); D30/D42 (times from `date`). I broke D30 twice: at
3:26 PM I told the lead "3:40", and again at 4:25 "4:28"; each corrected in the next message. Countermeasure: `date` in the same step.
## Method update (for level.md, step 5)
Walk the real page on Normal (Tips) and Easy (Help) and read Dot's card at each teach line; log `callbacks.onGuide`. A still taken by
placing him mid-stage fires every line he passed: mark them heard first.
## Learned
| 1-2 | D12 (Opus), 11-12 | Better: the first level checked for PURPOSE after it passed every verdict (its beds could be jumped, its thorns never cost), and fixed | Proposed: 19. Any bed the generator allows (gap at most 114 px level) is one a full jump clears, so a bounce chain's purpose comes from cap-only footing, not bed width. 20. A danger must be able to cost: lay its pits at the widest the spec allows and count the hits per tier. 21. A teach line is proven on the real page under both settings' Dot defaults. 22. Read a line's row first: a cut line is never said. |
Turnover: `reference/handoffs/designer.md`, rulings 21-23 and the open items for 1-2.
