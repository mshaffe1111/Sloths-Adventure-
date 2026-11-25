# ENG-PLANT-p (ENG-PLANT-c session 14, started 10:22 AM ET 11-25 by the hook's stamp): c26 built (the front stand, the lead's ruling (A)); toys RED on c25 / GREEN on c26; the known flips 12/12; wide 0 BAR PASS->FAIL; 2-7 x40 33/40; **the race FLIPS: post Normal 5 and home Normal 1 LOST**

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head: c26 = 51ffe7eab** on release-0.10.3-wip-plant-c
(pushed, `git ls-remote` confirmed). Data: data/p/. Tools: tools/set1cmp-p.py.txt (a set1 row vs main's row).

## EXACT NEXT STEP (session 15)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background). Freeze (no /home/user/plant-work
   here: from the main checkout) `git worktree add --detach /home/user/fz-c26 51ffe7eab`, symlink node_modules, `chattr -R +i src tools`,
   `chattr -i src/game/gen2/proven`; the same for fz-c25 6a64aa41e and fz-27e 801cae9e8 (landing) for traces. Rows: tools/wide.sh-n.txt
   (castBots --json; arg 5 = extra flags), in lanes; compare: tools/cmp-o.py.txt (BAR seeds, PASS->FAIL / FAIL->PASS per ref).
1. **THE LEAD'S RULING (wins; session 13's 1b word for word):** c26 = (A) the front stand. Conditions 1-3 DONE; condition 4 DONE
   except 1-4 / 2-5 (below) and THE RACE FLIP; the table is below and went to the lead with this push. **Check ReadNotifications first:
   the lead's word on the race flip decides what comes next.** Until it arrives (never wait idle, D120), in this order:
   (a) 1-4 and 2-5 full rows vs main: if data/p/c26-1-4-{a,b}.jsonl and c26-2-5-{a,b}.jsonl hold 180 rows each, compare (tools/cmp-o.py.txt
   vs data/c/main-1-4.jsonl, main-2-5.jsonl, and data/m/c25-1-4.jsonl, c25-2-5.jsonl); else re-run them on fz-c26 (wide.sh-n, two lanes
   each, seeds 1-20 / 21-40), zero BAR PASS -> FAIL vs main is the bar. (b) TRACE the race flips (rule 28: two traces, one line each):
   home N 1 at bank f83 (x ~3,660, t 164.4-177.6, data/p/race-hN1-c26.txt: the hop handed straight back, then two 6 s edge waits) and
   post N 5 (tools/race-frames-p.mts.txt <tree> post normal 5 on fz-c25 and fz-c26, then cmp the two files for the first split and where
   the 13 s goes). Name whether the front stand's own lines fire there (a log running back at him) or the run only arrives on another
   phase. (c) trace child N 13 on c26 (2-7, the experiment's untraced loss; watch the child's run-on: releaseMax 4 can carry him past
   the front at 31). (d) Send the lead the traces. Condition 6 (the checklist: pacerLay 22/23 re-planted as laid toys 23/23, hopJudged,
   the toys for c23-c26's rules, the packet's plants, riverRide + firsttimer, the CI tool line 0 fail, tierBots 9/9, timecheck +
   roadmapcheck) only on the lead's word after the race flip; the margins are pacerLay's own race runs (margins.mts.txt: pacerLay.test.ts raceRun), so pacerLay must be re-read on c26. MERGE into
   release-0.10.3 (no force) ONLY on the lead's word. HARD STOP 2:30 PM ET.

## c26 (51ffe7eab; c25 6a64aa41e + 13 lines in tools/inspect/firsttimer.ts, the toy in tools/inspect/riverRide.test.ts)
- **Condition 1, NARROW:** both lines sit inside the upstream block (`SKILLS.upstream && here.drift && here.drift.dir !== dir`: a log
  running back at him) and nowhere else; no env gate. (a) refused with the next log in reach (the `floatSure && next` branch, before the
  reAim line): `if (dir * (edgeX - p.x) > FRONT_STAND_PX) { pending = null; lateArmed = null; return side(dir) }`; (b) nothing in reach
  (`!next && !bank`, after `aim.end()`): `return side(dir)` while short of the front. The bank branch, bankUp (its own 30) and every
  other stand are unchanged.
- **Condition 2, NO BARE 30:** `export const FRONT_STAND_PX = Math.round(PHYS.maxRun^2 / (2 PHYS.groundDec) + 2 PHYS.maxRun DT)` = 31:
  his run-on after a let-go at full run, the 12 px slide to a stop and a lift-off up to 2 frames late (19 px), the same 31 the edge plan's
  stand lets go at (`look = aimQ[1] + 31`); let go there, he rests at the front (never past it at that run-on), the furthest-forward
  take-off the gate judges from (gateSees / hopLandsOn fly from p.x). Session 13's experiment walked to 30: one px, not the same value,
  so every row below is c26's own. Named plainly: the 2 frames are the ADULT family's releaseMax[1] (adult, middle, expert); the child
  and kid draw up to 4 (a run-on up to 50 px), so a child let go at 31 can run past the front: what to watch in child N 13's trace.
- **Condition 3, TOYS FIRST** (tools/inspect/riverRide.test.ts, the two 'hand-back loop, B+C' tests; session 13's toy, fix-agnostic):
  **RED on fz-c25** (data/p/toy-handBack-c25.txt: middle E 11 'a floor handed back to 5 times (6 hand-backs)', expert N 29 '5 times (5)'),
  **GREEN on fz-c26** (data/p/toy-handBack-c26.txt, 2/2).

## Condition 4, in order (each on fz-c26 51ffe7eab, frozen, once)
1. **The 10 known flips (+ 2-1 child E 2, 2-4 child N 8): BAR 12/12 PASS** (data/p/set1-c26-table.txt; lives as c25's: 2-4 adult N 6/24/8/32
   l 0/1/1/0, child E 23/11 l0, child N 8 l1 / N 39 l2, 2-1 child N 11 l0, E 2 l0, 2-2 adult N 4 l0 / N 24 l1). The 11 c4-pass kid rows:
   10 FAIL at the SAME places as c25 (R-165.413), E 35 PASS (2-1 kid N 19 rescues 2, c25 3, same place 8,815).
2. **The WIDE SAMPLE (every bot, both settings, seeds 1-10, 90 rows a stage) vs main's rows: BAR PASS -> FAIL 0 on 2-1, 2-2 and 2-4**
   (data/p/c26-<st>-w10.jsonl, c26-wide-vs-main.txt). BAR seeds all-pass 10/10 on each (main 10, 10, 4); 2-4 FAIL -> PASS 6 (adult N 1, 3,
   5, 7, 9, 10: c24's, as before). 2-4 is c25's rows exactly (vs data/m/c25-2-4-w.jsonl: 0 BAR moved, 0 kid moved). Kid (non-BAR) vs
   main moved 7 / 7 / 13 (c25's kid rows already move vs main, R-165.413). **vs c24's own 2-1 rows (data/j/c24-2-1-w.jsonl) 3 kid rows
   moved, all at 2-1's both-ways back river, the front stand's place:** kid E 1 P -> F (set down 3 times at 25,052; main F too), kid E 7
   P -> F (set down 3 times at 25,513; main P), kid N 2 F -> P (c24 set down at 25,814). Non-BAR; named, not traced (the kid's run-on,
   releaseMax 4, is the first suspect). 2-2: 0 moved vs c24.
3. **The race margins (tools/margins.mts.txt on fz-c26; data/p/margins-c26.txt vs data/m/margins-c25.txt): post Normal 5 FLIPS, WON
   -0.10 -> LOST +13.10; home Normal 1 FLIPS too, WON -15.61 -> LOST +11.29.** Both with 0 race lives lost: he is SLOWER, not falling
   (home N 1 him 100.3 -> 127.2 s; post N 5 127.6 -> 140.8). The other 8 race rows still WON (home N 2 -19.54 -> -34.74, N 3 -6.86 ->
   -11.86, post E 4 -20.73 -> -9.53, ...). Where home N 1 loses (tools/race-frames-p.mts.txt, data/p/race-hN1-c25.txt / -c26.txt, frames per 0.1 s): c26 splits at t 16.7 on
   log #11 (x 15,032: the front stand walks him on; c25 stands) and reaches the far turn 20 s AHEAD (x 18,300 at t 39.9; c25 t 59.9); both
   are held at bank f71 (x ~6,510) to t ~136 (the lead evaporates there); both reach bank f83 (x ~3,660) at t ~158. c25 leaves f83 at 165.9;
   **c26 hops at t 164.4, is back on f83 at 164.9 (x 3,652 -> 3,693: a log running back at him handed him straight back), then stands
   twice ~6 s (the edge wait) and leaves at 177.6: 12 s lost there, at a BANK, after a hand-back.** Not yet traced: which log he took at
   164.4, where on it he landed, and why the wait (no next / no bank in reach) is 6 s twice; post N 5 not traced at all.
4. **2-7 seeds 1-40, the 4 BAR bots, both settings, 280 rows (data/p/c26-2-7-x40.jsonl): 33/40 seeds with every BAR row passing
   (landing 29, c25 24): not below 29, no STOP.** Pass/fail IDENTICAL to session 13's experiment row for row (0 moved vs
   data/o/expfront-2-7-x40.jsonl). vs the landing: PASS -> FAIL 8, FAIL -> PASS 12; vs c25: PASS -> FAIL 2, FAIL -> PASS 12 (the lists
   in the table below). The moved rows' traces: sessions 12-13 (data/n, data/o) for all but child N 13 (UNTRACED, next).

## THE TABLE (c26 51ffe7eab; the lead's condition 4 order; condition 5's names)
| check | c25 6a64aa41e | c26 51ffe7eab |
|---|---|---|
| toy: 2-7 middle E 11, no floor handed back to twice, no rescue | RED (5 times, 6 hand-backs) | **GREEN** |
| toy: 2-7 expert N 29, the same | RED (5 times, 5) | **GREEN** |
| the 10 known flips + 2-1 child E 2 + 2-4 child N 8 (BAR) | PASS 12/12 | **PASS 12/12** (lives the same) |
| wide sample seeds 1-10, all bots, both settings: BAR PASS -> FAIL vs main | (2-4 0) | **2-1 0, 2-2 0, 2-4 0** |
| 2-7 x40 BAR seeds all-pass (landing 801cae9e8: 29/40) | 24/40 | **33/40** |
| race margins (careful middle; below 0 he wins) | 10/10 WON, post N 5 -0.10 | **8/10: post N 5 LOST +13.10, home N 1 LOST +11.29** |
| 1-4 and 2-5 full rows vs main | (data/m: c25) | running at hand-over (data/p/c26-1-4-*.jsonl, c26-2-5-*.jsonl) |

2-7 x40 moved rows, named with their family (condition 5):
- vs the landing, PASS -> FAIL 8: **adult N 11, N 24, child E 30, N 9: cluster A, the lip family (R-165.398)** (session 12's traces);
  **child N 34: D** (session 12); **child N 38: the first-river walk-off, off bank #17 [8,181..8,481] at vx 268 (session 12's trace; filed under
  B+C by place, but its shape is a full-run walk-off off a bank's lip, cluster A's: family the lip family, R-165.398; not the stand)**; **child E 11: cluster A's shuffle (R-165.398)**, moved by the earlier
  crossing (session 13's trace, data/o/trace-expfront-cE11.txt); **child N 13: UNTRACED.** Not fixed in this merge.
- vs the landing, FAIL -> PASS 12: child E 5, E 28, E 32, E 33, N 5, N 11, N 18, N 19, N 22, N 36; middle N 7, N 13.
- vs c25, FAIL -> PASS 12: child E 24, N 10, N 20, N 36, N 40; expert N 18, N 29, N 35; middle E 7, E 11, N 15, N 32 (B+C's six among them).

Lessons applied: D133 (narrow; the order flips -> wide -> x40 -> the rest; no candidate stacked on 10 rows), D134 (pushed + ls-remote
before the hand-over), D115 (every run on a chattr-frozen tree; the fix written in the main checkout, committed first), D119 (commit
messages from a file; no heredoc in a commit chain), D128 (stamps from the hook / `date`), D132 (shipped stages vs MAIN's rows), D135
(the race flip named with its rows, not carried), rule 28 (the race loss's first split found before any change).

