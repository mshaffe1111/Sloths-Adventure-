# ENG-PLANT-q (ENG-PLANT-c session 15, started 10:44 AM ET 11-25 by the hook's stamp; this top written 11:09 AM ET 11-25): **c27 = 1e4b50a1d PUSHED; condition 4 COMPLETE on its exact head, all green; the table sent to the lead** (toys RED c26 / GREEN c27; races 10/10 WON; known flips, wide, 2-7 x40 33/40, 1-4, 2-5 all identical to c26 except the two races)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head: c27 = 1e4b50a1d** on release-0.10.3-wip-plant-c (pushed,
`git ls-remote` confirmed; a fast-forward on c26 51ffe7eab). Data: data/q/. Toy runner (tree-agnostic): tools/toy27-q.mts.txt <tree>.

## EXACT NEXT STEP (session 16)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); report tree `git worktree add --detach
   /home/user/rep origin/release-0.10.3-wip-plant-c-report`; frozen c27: `git worktree add --detach /home/user/fz-c27 1e4b50a1d`, symlink
   node_modules, `chattr -R +i src tools`, `chattr -i src/game/gen2/proven` (and fz-c26 51ffe7eab the same, for RED checks).
1. The full order on c27's exact head (the lead's ruling condition 4), two heavy runs at a time, each once, every castBots run under
   `W1CAP=1` (c27's castBots writes each row's stands past the cap to stderr as `W1CAP {bot,setting,stage,seed,cap:[{t0,x,dur,cycle}]}`;
   any dur >= cycle is a STOP row: send the lead the row with a probe, no fallback):
   - DONE: every race (tools/margins.mts.txt): 10/10 WON, table below.
   - DONE: the 10 known flips (tools/set1-m.sh.txt -> data/q/set1-c27/; `python3 -I tools/set1cmp-p.py.txt data/q/set1-c27 data/c` ->
     data/q/set1-c27-table.txt): **BAR rows PASS 12/12; every row identical to c26's (pass, rescues, lives; sorted diff 0)**; W1CAP: 23
     rows, zero stands past the cap reaching a cycle.
   - DONE: the wide sample (tools/wide-m.sh.txt, 2-4 / 2-1 / 2-2 seeds 1-10, 90 rows each -> data/q/c27-<stage>-w10.jsonl; data/q/c27-wide-vs-main.txt):
     **0 BAR PASS -> FAIL vs main on all three; every row identical to c26's (vs c26: PASS->FAIL 0, FAIL->PASS 0, kid moved 0)**; every
     row ends 'shrine'; W1CAP: zero stands past the cap reaching a cycle (2-4: no stand past the cap at all).
   - DONE: 2-7 x40 (adult/child/middle/expert, seeds 1-40, both, 280 rows -> data/q/c27-2-7-x40.jsonl; data/q/c27-2-7-x40-cmp.txt):
     **33/40 all-pass (bar >= 29; c26 33); vs c26 PASS->FAIL 0, FAIL->PASS 0**; 271 rows identical in time, 9 moved (-4.1 .. +3.6 s, and
     child Normal 38 +26.0 s with 1 more life lost, FAIL on c26 too); every row ends 'shrine'; W1CAP: no stand past the cap at all.
   - DONE: 1-4 and 2-5 seeds 1-40, every bot, both (360 rows each -> data/q/c27-1-4.jsonl, c27-2-5p.jsonl; -cmp.txt): **0 BAR PASS -> FAIL vs
     main; every row identical to c26's** (1-4 BAR all-pass 40/40, 2-5 40/40). Not 'shrine': 1-4 none; 2-5 the kid on Normal, 31 rows
     'stranded', the same 31 on c26 (main 29): the kid is no bar bot and c27 moved none of them; named to the lead. W1CAP: no stand past
     the cap reaching a cycle in any set (2-1 / 2-2 / 2-4 / 2-7 / 1-4 / 2-5: zero stands past the cap at all; the known flips: none >= cycle).
2. DONE: the c27 table sent to the lead (session 15's hand-over message). **NEXT: read the lead's answer**, then child N 13 on c27 (session 14's item vi), then the checklist
   (pacerLay 22/23 re-plants as laid toys 23/23; hopJudged (c27's two toys are its last two tests); the toys for c23-c27; the packet's
   plants or retire per R-165.432; riverRide + firsttimer; the CI tool line 0 fail; tierBots 9/9; timecheck + roadmapcheck). The table again
   before any merge; MERGE into release-0.10.3 (no force) ONLY on the lead's word. REPORT BY 1:00 PM ET; HARD STOP 3:00 PM ET.
3. Watch item, TRACED (data/q/race-hE2-c{26,27}.txt, frames per 0.1 s): home Easy 2 WON -18.22 with 3 race lives lost (c26 -21.72, 1).
   Frame-identical to c26 to t 126.4: at f72 x 6414 (stood from 120.5, W1) c26 went blind at the cap and landed on f76 (Easy); c27 judged
   its hop 0.6 s later and landed on f76 too (t 127.5). The 2 extra lives come 26 s later on a 0.6 s later phase: he ran off the end of
   log #91 at full run into the water (t 153.3, x 2700; the game-over reset puts him at x 3398) and off log #89 (t 155.4, x 3210): the
   ride-on-log section, not c27's cap; c26 met those logs on another phase. Tell the lead in the table as a finding (log-end run-offs on
   2-7's race logs), not a c27 regression; trace one further only if the lead asks.
4. FINDING for later (the lead's words, for R-165.424's list): W1 waits 6 s for logs that pass UNDER the banks and can never bridge (2-7's
   race banks f71/f76, f78/f71, f83, f88-f95: the logs run 28 px below and pass under both banks; the far bank is the way on). A wait
   only for floats a gate can judge would be faster; NOT in this merge.

## Session 15: every race on c27 (data/q/margins-c27.txt; the careful middle; margin = his time - the boat's, below 0 he wins)
| race | c26 51ffe7eab | c27 1e4b50a1d |
|---|---|---|
| home Normal 1 | LOST +11.29 | WON -7.21 |
| home Normal 2 | WON -34.74 | WON -31.24 |
| home Normal 3 | WON -11.86 | WON -17.06 |
| post Normal 4 | WON -12.30 | WON -17.80 |
| post Normal 5 | LOST +13.10 | WON -19.70 |
| home Easy 1 | WON -19.77 | WON -19.77 |
| home Easy 2 | WON -21.72 (1 race life) | WON -18.22 (**3 race lives**) |
| home Easy 3 | WON -10.57 | WON -8.57 |
| post Easy 4 | WON -9.53 (1) | WON -22.73 (0) |
| post Easy 5 | WON -29.70 (1) | WON -29.70 (1) |
All end 'shrine'. Toys (hopJudged.test.ts, fix-agnostic: a hop off a bank within 2 s of a 6 s stand on it is never set back by the water;
the race WON; every stand past the cap < the logs' cycle): c26 home N 1 2 set-backs (off f71 x 6518, f83 x 3659) LOST; post N 5 2 (off
f78) LOST: RED. c27: 0 and 0, WON, WON, no stand past the cap: GREEN (data/q/t-c26.txt, t-c27.txt).

## Session 15: how c27 got here (the two STOPs, both on the ruling's condition 2)
- c27 v1 (the cap judges the logs only, held aim): every stand past the cap 14-16 s > the logs' 11.7 s cycle (home N 1 rescued off f71);
  probe data/q/probe-cap-c27.txt: no log is ever judged at those banks (they run 28 px below and pass under them); the far bank is the way on.
- c27 v2 (the lead's (A)+(B): walk to the lip, judge far bank + logs, held aim): stands 21 s, rescued: the held aim is a short single drawn
  for the logs (0.111-0.159); his own table lands single 0.329 and doubles 0.118 every frame (data/q/probe2-c27.txt).
- c27 (the lead's YES: held aim refused -> tablePick, bankUp's exact shape): GREEN as above.
Lessons applied: D115 (probes only in the unfrozen main checkout, env-gated, restored by git checkout; heavy runs on chattr-frozen fz-c27),
D119 (commit messages from files), D128 (stamps from date), D134 (c27 pushed and ls-remote'd before any long run), D122/D123 (two heavy
runs at a time, timeouts set).

## Session 15: c27 v1 measured (superseded) (the careful middle, Normal; cycle = driftCycle of the logs in view = 11.7 s)
| row | c26 51ffe7eab | c27 33e573b35 (local) |
|---|---|---|
| home N 1 | LOST +11.29, 5 set-backs (t 10.0, 67.9, 129.8, 146.7, 164.8) | LOST +12.79; stands past the cap: f71 x 6518 14.1 s (ended by a RESCUE to f76 x 6352), x 3631 15.4 s |
| post N 5 | LOST +13.10, 7 set-backs | LOST +46.00; stands past the cap: x 8093 16.2 s, 5216 15.8 s, 3853 15.6 s, 2359 14.0 s |
Every stand > 11.7 s: the ruling's STOP. (The toy's set-back read also counts the race's own early ones at t 10.0 / 21.7 and 67.9 / 60.0 on
both trees: a session-16 toy narrows set-backs to those off a bank W1 held him on, or the lead rules the toy reads the race verdict +
the stand bound only.) Lessons applied: D115 (probe only in the unfrozen main checkout, env-gated, restored with git checkout), D119 (no
heredoc in a commit chain: commit message from a file), D128 (stamps from date), D134 (pushed and ls-remote'd before the hand-over message).

# (previous) ENG-PLANT-p (ENG-PLANT-c session 14, started 10:22 AM ET 11-25 by the hook's stamp): c26 built (the front stand, the lead's ruling (A)); toys RED on c25 / GREEN on c26; the known flips 12/12; wide 0 BAR PASS->FAIL; 2-7 x40 33/40; **the race FLIPS: post Normal 5 and home Normal 1 LOST**

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. **Code head: c26 = 51ffe7eab** on release-0.10.3-wip-plant-c
(pushed, `git ls-remote` confirmed). Data: data/p/. Tools: tools/set1cmp-p.py.txt (a set1 row vs main's row).

## (session 14's) EXACT NEXT STEP (session 15, done: c27 built, STOPPED)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background). Freeze (no /home/user/plant-work
   here: from the main checkout) `git worktree add --detach /home/user/fz-c26 51ffe7eab`, symlink node_modules, `chattr -R +i src tools`,
   `chattr -i src/game/gen2/proven`; the same for fz-c25 6a64aa41e (and fz-27e 801cae9e8 for 2-7 traces). Rows: tools/wide.sh-n.txt
   (castBots --json; arg 5 = extra flags), in lanes; compare: tools/cmp-o.py.txt. Race frames: tools/race-frames-p.mts.txt <tree> <home|post>
   <setting> <seed>; margins: tools/margins.mts.txt <tree>. Probes only in the UNFROZEN main checkout, env-gated, `git checkout` after (D115).
1. **THE LEAD'S RULING ON THE RACE FLIPS (received this session, word for word): "they BLOCK the merge. pacerLay's race runs are 2-7's own
   proof that the race is fair, so a WON -> LOST flip is bar-relevant, not a watch item. The fix goes in the bot, where the cause is. The
   race's numbers do NOT change (law 22). Order: 1. Trace home N 1 at bank f83 to the line that fires. Is it c26's front-stand line? Or
   does the run only arrive there on another phase of the logs, so the wait rule that costs 6 s twice is what loses? Then trace post N 5
   the same way. 2. If the front stand's own line fires at f83: narrow c26 again (c27) so it never stands him where the very next log hands
   him straight back. Toy it RED on c26 at home N 1, GREEN on c27. If the cause is the phase plus an older wait rule: name that rule, and
   tell me before you change anything outside c26. 3. On c27 (if any): the toys, the 10 known flips, the wide sample (seeds 1-10,
   2-1/2-2/2-4), 2-7 x40 (at or above 29/40) AND the race margins (every race WON again, margins reported) BEFORE anything else. 4. Then
   child N 13's trace, 1-4/2-5 vs main, and the checklist. The merge still waits for my word. I accept FRONT_STAND_PX = 31 as derived."**
2. **Ruling item 1 DONE (below): the cause is the phase plus the OLDER bank-edge float wait (W1), not c26's line. THE LEAD'S RULING ON
   IT (received this session, word for word): "your proposal is APPROVED as c27. When the bank-edge float wait (W1) hits its 6 s cap, he
   goes only on a hop a gate judges (the floatSure principle, the same as every log hop since c24/c25), or he keeps waiting by choice.
   Never a blind go into the water. It is the same root as the whole job: the judged hop is the hop flown. Conditions: 1. NARROW: only
   the cap's blind go changes. W1's wait itself and the 6 s before the cap are untouched. Nothing else moves. 2. NO DEADLOCK: a bot that
   waits must never wait forever. If no judged hop comes in a full drift cycle of the floats in view, tell me with the row; do not
   invent a fallback. 3. TOYS: RED on c26 at home N 1 and post N 5, GREEN on c27. 4. W1 is SHARED by every river stage, so the full
   order runs on c27: the 10 known flips; the WIDE SAMPLE (seeds 1-10, every bot, both settings, 2-1/2-2/2-4: zero BAR PASS -> FAIL vs
   main); 2-7 x40 (at or above 29/40); EVERY race WON with the margins; 1-4 and 2-5 vs main; zero rows ending stuck or timed out
   anywhere. 5. Then child N 13's trace, then the checklist. The merge waits for my word."**
   **Session 15 does, in order:** (i) read the code after W1 (firsttimer.ts c26 :3620-3624, `if (floats.length && !near) {...}`):
   find what runs when `t - this.edgeWait >= 6` (read at hand-over, not yet probed: on a BANK the fall-through skips the ride-on-log
   section (:3627ff, `here.type === 'drift'` only) and the upstream block (`here.drift` only), sets `this.edgeWait = -1` and reaches the
   edge's own press at :3802ff (`if (!drops && tierEdge) { const kind = this.jumpFor(p, dir, here); ...`: a hop no gate judged, or a
   'late' walk-off): the blind go c27 replaces at the cap; confirm with a probe there first (the fall-through to the edge's own press / walk-off: data/p/probe-*-W.txt: W1's last frame is at 6.03 s, the
   go 0.2 s (home N 1) to 0.6 s (post N 5) later). c27 = at the cap, gateSees (the drawn hop, `this.aim.at` + `drawHop`, margin 24, as the `near` branch above it
   at :3596-3618 does) on the floats in view: judged -> startJump as judged; refused -> stand by choice (clockHeld, pending/lateArmed
   null), no blind go. Nothing before the cap moves (condition 1). (ii) NO DEADLOCK (condition 2): in the toy and in every row, count
   the longest by-choice stand past the cap; if any reaches a full drift cycle of the floats in view (the river's period from
   floatAt) with no judged hop, STOP and send the lead that row; no fallback. (iii) Toys in tools/inspect/riverRide.test.ts (or
   homeToys' test file if the race toys live there; a new file needs gates.yml's CI tool line): home N 1 and post N 5, "no go at W1's cap
   that no gate judged / the race WON", RED on fz-c26, GREEN on c27; commit c27 + toys on release-0.10.3-wip-plant-c, push, freeze.
   (iv) Condition 4's full order on c27's exact head, two heavy runs at a time, each once: the 10 known flips (tools/set1-m.sh.txt);
   the wide sample (2-1/2-2/2-4 seeds 1-10 vs data/c/main-*.jsonl); 2-7 x40 (>= 29/40; c26 33); margins (tools/margins.mts.txt: all 10
   WON, margins listed vs c26 data/p/margins-c26.txt and c25 data/m/margins-c25.txt); 1-4 and 2-5 vs main; and zero rows ending stuck
   ('end' not 'shrine') or timed out in every row set. (v) The table to the lead. (vi) child N 13 on c27, then the checklist (pacerLay 22/23
   re-planted as laid toys 23/23, hopJudged, the toys for c23-c27's rules, the packet's plants, riverRide + firsttimer, the CI tool line
   0 fail, tierBots 9/9, timecheck + roadmapcheck). MERGE into release-0.10.3 (no force) ONLY on the lead's word. REPORT BY 12:30 PM ET;
   HARD STOP 2:30 PM ET.

## The race flips traced (ruling item 1; data/p/race-{hN1,pN5}-{c25,c26}.txt frames per 0.1 s, data/p/probe-{hN1,pN5}-c26-W.txt)
- **Probe** (env-gated in the unfrozen main checkout at c26, restored; the run is byte-identical to the frozen c26 run): a line at each of
  firsttimer.ts's two 6 s edge waits. **W1 = the bank-edge float wait** (c26 :3621-3623, inside the gap branch: `if (floats.length &&
  !near) { edgeWait ...; if (t - this.edgeWait < 6) { clockHeld ...; return {} } }`: "a log or a lily pad drifting across the gap: he
  can see it, so he waits at the edge until it is near, up to 6 s"); W2 = the upstream block's `!bank && !next` wait (:3797-3798).
  **W1 fired 1,606 frames on home N 1 and 1,790 on post N 5; W2 0 on both. c26's two front-stand lines sit in the upstream block, which
  needs him standing on a log; at f83 and f78 he stands on a BANK, so they cannot fire there.**
- **home N 1, bank f83 (x ~3,660):** W1 from t 158.17 (logs #85/#90 drifting, none `near`); at 6.00 s (t 164.17) the wait ENDS with no
  log near and he goes blind (hop at 164.4, vx -143); at 164.8 he is set back to the bank (x 3,572 in the air -> 3,696 on f83, no life
  lost), W1 again 165.33 -> 171.33 (6 s), goes, set back to 3,647, W1 again 171.53 -> 177.53, goes, lands. c25 reached f83 at the same
  time and crossed at 165.5 on its first go. 12 s lost: two blind goes after the 6 s cap.
- **post N 5, bank f78 (x ~5,200):** W1 140.00 -> 146.03, goes blind at 146.6, set back to 5,232 (147.1), W1 147.27 -> 153.30, goes at
  154.0, set back to 5,232 (154.5), W1 155.60 -> 161.6, goes, lands on f83 at 162.8. c25 crossed f78 at about t 143. ~19 s lost there.
- **How the run reaches those banks on another phase:** c26 splits from c25 where the front stand fires on the way OUT (home N 1 log #11
  at t 16.7; post N 5 log #10 at t 11.7: he walks to the front and hops on early), and arrives at the far turn earlier; the logs are on
  another phase when he reaches f83 / f78 coming home, and the old wait's 6 s cap then sends him blind into the water.
- **The rule, named (ruling item 2):** the bank-edge float wait's 6 s cap, then a go no gate judged: when no log comes `near` in 6 s he
  goes anyway, and is set back to the bank; each round costs 6 s more. Older than c26 (the floatSure-era edge wait). **Not changed: the
  lead's word first.**

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
   **c26 hops at t 164.4, is back on f83 at 164.9 (x 3,652 -> 3,693: set back to the bank after a blind go), then stands
   twice ~6 s (the edge wait) and leaves at 177.6: 12 s lost there, at a BANK, after a blind go set back.** Traced to the line (both rows): "The race flips traced" above: the old bank-edge float wait, not c26's line.
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
| 1-4 full rows (360) vs main: BAR PASS -> FAIL | 0 | **0** (40/40 BAR seeds; identical to c25 row for row) |
| 2-5 full rows vs main: BAR PASS -> FAIL | 0 | **0** (360/360 rows, 40/40 BAR seeds; identical to c25 row for row; kid vs main 3, c25's) |

2-7 x40 moved rows, named with their family (condition 5):
- vs the landing, PASS -> FAIL 8: **adult N 11, N 24, child E 30, N 9: cluster A, the lip family (R-165.398)** (session 12's traces);
  **child N 34: D** (session 12); **child N 38: the first-river walk-off, off bank #17 [8,181..8,481] at vx 268 (session 12's trace; filed under
  B+C by place, but its shape is a full-run walk-off off a bank's lip, cluster A's: family the lip family, R-165.398; not the stand)**; **child E 11: cluster A's shuffle (R-165.398)**, moved by the earlier
  crossing (session 13's trace, data/o/trace-expfront-cE11.txt); **child N 13: cluster A, the lip family (R-165.398), first pass (frames, data/p/frames-cN13-{c25,c26}.txt,
  0.1 s): split at t 83.1 on log #22 (c25 stands at x 9,542; c26's front stand walks him to 9,584, hop to log #24 at 84.0); c26 then reaches
  the second river 74 s earlier (t 125.5; c25 199.5), falls off log #43 at x 13,959 (t 127.5), respawns at f28, and loops 8 rounds on the
  solids f26-f31 (x 10,541-11,901, t 128-174): full-run walk-offs (vx 268-285) set back to f26 each time, then rescued to 14,472. The
  band and shape of child E 11's cluster A (walk-offs off solids #25-#27, 10,786-11,655), moved by the earlier path; not a stand on a log.**
  Not fixed in this merge.
- vs the landing, FAIL -> PASS 12: child E 5, E 28, E 32, E 33, N 5, N 11, N 18, N 19, N 22, N 36; middle N 7, N 13.
- vs c25, FAIL -> PASS 12: child E 24, N 10, N 20, N 36, N 40; expert N 18, N 29, N 35; middle E 7, E 11, N 15, N 32 (B+C's six among them).

Lessons applied: D133 (narrow; the order flips -> wide -> x40 -> the rest; no candidate stacked on 10 rows), D134 (pushed + ls-remote
before the hand-over), D115 (every run on a chattr-frozen tree; the fix written in the main checkout, committed first), D119 (commit
messages from a file; no heredoc in a commit chain), D128 (stamps from the hook / `date`), D132 (shipped stages vs MAIN's rows), D135
(the race flip named with its rows, not carried), rule 28 (the race loss's first split found before any change).

