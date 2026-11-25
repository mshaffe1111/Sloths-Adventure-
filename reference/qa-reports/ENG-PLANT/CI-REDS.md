# ENG-PLANT-CI: the 9 CI-tool-line reds on c27 (session 4 hand-over written 12:57 PM ET 11-25 by `date`; sessions 3, 2 and 1 below it)

## EXACT NEXT STEP (session 5)
1. Red 4 (the lead's order item 2, word for word: "Red 4 (hopJudged Easy 5: edgeWait predicted a fall, but the engine's overSmall
   steered him back onto #18 at 23.6 px past its middle against a 22.5 px threshold): the per-frame hopFlight vs engine comparison. The
   BOT's model matches the ENGINE (judged = flown). A toy each way. Then the races + flips again."). Build the probe on frozen
   /home/user/fz-ci7 (b0f55fc13): copy hopFlight (firsttimer.ts:1078) into a probe with a per-frame print (b.x, b.vy, steer before and
   after the thumb, past vs 0.15 w, the log's x), fly it for #18 with Easy 5's edgeWait args (t 21.77, x 16688; HOP_TRACE's row gives
   the hop, thumb and ThumbAt), and print the run's own frames beside it (rowprobe.mts W0=21.7 W1=22.3, plus the run's overSmall result
   per frame); the first frame they part names the wrong side. Fix general, a toy each way, on CI-7.
2. Then on the final head, once each (at most two heavy runs at a time): the races (margins.mts, 10), the known flips (ci-tools/set1-m.sh
   + cmp3.py vs c27: 21 rows = c27, the 2 named child rows below may differ; 0 BAR PASS -> FAIL), the 4 files (only reds 5-9 red), the
   wide sample (wide-m.sh on the c-report branch, seeds 1-10, every bot, both settings, 2-1/2-2/2-4: 0 BAR PASS -> FAIL vs main), 2-7 x40
   (at or above 29/40), tierBots 9/9 and tsc. Push, ls-remote, send the lead the hash and one line per item.
Setup in a fresh container: `npm ci --no-audit --no-fund --legacy-peer-deps`, frozen trees as below (git worktree add --detach, symlink
node_modules, chattr -R +i src tools, chattr -i src/game/gen2/proven); tools from ci-tools/*.txt (use the repo's node_modules/.bin/tsx).

## SESSION 4 END STATE: HEAD = CI-7 b0f55fc13 (CI-6 + the kid's front stand narrowed) + this file. Order item 1 CONVERGED
**The bisect (data/ci/bisect-21.txt; frozen fz-base d742d0469 = c27's head, fz-ci1 246d90533, fz-ci2 82b7f4c8d, fz-ci3 fa132c831,
fz-ci6 cc4251ece; 6-11 s a row):** c27's head reproduces c27 exactly; **CI-1 moves all three rows**; CI-2 moves child N11 again (CI-1
369.0 s 2 lives -> 357.2 s 1 life); CI-3 = CI-4 = CI-6 on all three (their code is race-leg only: SKILLS.race, the pacer; 2-1 has none).
Inside CI-1, one toggle at a time on CI-6 (var.sh): kid N19 returns to c27 EXACTLY with ft:3847 (the refused-log front stand) at 31;
the two child rows part from c27 at WaitAim.fresh (CI-1's honest aim).
| row | c27 | CI-6 | the candidate and the line | first parting (data/ci/partings-21.txt) | judged |
|---|---|---|---|---|---|
| 2-1 kid Normal 19 | FAIL 156.4 s r2 l6 | FAIL 159.2 s r3 l8 | CI-1, frontStandPx(kid) 31 -> 50 at the refused-log front stand (CI-6 ft:3847) | f2981 t 99.37, log #86 (drift BACK at him), x 19565, 40 px behind its front: c27 walks to 31 and hops on to #85 (t 99.50, lands); CI-6: 40 <= 50, no walk, he stands still and is ridden back | **NOT INTENDED**: the 50 is a let-go at FULL run; standing still there is no run-on to cover, so he stands where no hop is judged landing. No kid case was traced for CI-1 (its case: the child's reAim toy phase 1.5). **Narrowed in CI-7: c26StandPx = frontStandPx for the child (SKILLS.reAim's tier), 31 for every other tier, at c26's three front stands (ft:3693, 3854, 3888); raceStandPx untouched** |
| 2-1 child Easy 2 | PASS 268.7 s r0 l0 | PASS 288.2 s r0 l0 | CI-1, the honest aim: tablePick's `if (this.aim.fresh(t)) return null` (ft:2035 on CI-7), from ft:3474 | f2172 t 72.37, log #43 (drift his way), x 8602: the wait's draw (CI-7 ft:3462) single 0.038 refused, tablePick IN THE SAME FRAME (0.000 s apart) refused by fresh; c27 re-picked padPause's double 0.219 onto #44 | **INTENDED, named**: the traced case's own shape (riverRide's honest-aim toy phase 0: "a re-draw 0.000 s apart"); +19.5 s, 0 lives, PASS |
| 2-1 child Normal 11 | PASS 376.1 s r0 l0 | PASS 357.2 s r0 l1 | the same (ft:2035), then CI-2 (the judged hop: CI-1 l2 -> CI-2 l1) | f4504 t 150.10, log #64 (his way), x 14292: the same shape (draw single 0.091, tablePick refused 0.000 s apart); c27 hopped on to #65 | **INTENDED, named**; the life is downstream, 52 s later on another draw path: t 202.67 the upstream hop off #86 at x 19689 judged q -2 (the aim judged landing, the drawn thumb noise falls: the child's own fumble), in the water at x 19953 f6109 |
**CI-7 (frozen fz-ci7 b0f55fc13; data/ci/set1-ci7, cmp3.py): the 10 known-flip files, 23 rows: 21 = c27 ROW FOR ROW (kid N19 back to c27;
2-2/2-4 unchanged), the 2 moved = the two named child rows above; 0 BAR PASS -> FAIL.** riverRide on CI-7: 29 tests, 27 pass, 2 fail =
:266 (red 7) and :282 (red 9), the plants lane's; the reAim toys (reds 1-2) and the race-leg front-stand toy GREEN. tsc clean.
The races are not re-run on CI-7: the middle (the racer) is not the reAim tier and its stand stays 31, raceStandPx is unchanged, so CI-7
cannot move a race; they are re-run once on the final head (next step 2).
Lessons applied (session 4): D115 (verdicts on chattr-frozen trees; toggles only on /home/user/bis, one run at a time), D119 (commit
messages from a file), D128 (stamps from date), D133 (narrowed to the traced tier, no sweep), D134 (pushed and ls-remote'd before the
message), D138 (re-fetched before the first commit), rule 28 (every moved row bisected to its candidate and line and traced by frame
before the fix), law 22 (no test weakened).


## SESSION 3 END STATE: HEAD = CI-6 12cd548e4 (CI-5 NARROWED, the lead's ruling item 1) + this file. CI-5 36da03dd4 is SUPERSEDED
**CI-6 (firsttimer.ts, from CI-4's code):** `raceStandPx(who)` = frontStandPx(who) + one frame at maxRun (the decision frame; adult 41,
kid/child 60) at the two race-leg places only (CI-3's walk in the race branch, CI-4's landing ride stop), and stopMeant where the race
branch's walk ends (he stands within raceStandPx of a log's front on the race leg). DROPPED from CI-5: the `here` standingOnId fallback,
the general stopMeant (handed {}, c26's {}, the clockHeld stand), frontStandPx's own change (c26's stands keep 31 / 50).
**On frozen fz-ci6:** racefront every tier every phase 7-34 px behind the front, no water (CI-4: adult 3 waters, 7/8 past the front);
the riverRide test 'on the race leg, a log running his way...' GREEN (RED on CI-4); tsc clean.
**The 10 known flips (data/ci/set1-ci6 vs data/q/set1-c27 and data/ci/set1-ci4): 7 of 10 files = c27 ROW FOR ROW** (2-2 adult N, 2-2 kid
E, 2-2 kid N, 2-4 adult N, 2-4 child E, 2-4 child N, 2-4 kid E); **the three 2-1 files = CI-4's rows, NOT c27's** (child E2 288.2 s vs
268.7; child N11 1 life vs 0; kid N19 8 lives vs 6, N21 the same): moved by CI-1..CI-4, before this session, NOT yet traced. CI-5's
kid FAIL -> PASS rows are gone with the general stopMeant (none named as intended now). The 2-2 adult N4 fault leaves the rows as on
c27, so per ruling item 2 it is NOT fixed here: for R-165.424's list, the trace is in the SESSION 3 HAND-OVER below (f2986 t 99.53, #79).
**The 10 races (data/ci/margins-ci6.txt): 10/10 WON.** Margins (s; c27 / CI-4 / CI-6): home N1 7.21/8.41/7.81; N2 31.24/23.34/18.94;
N3 17.06/12.76/22.76; post N4 17.80/29.20/25.70; post N5 19.70/8.30/27.00 (2 race lives); home E1 19.77/23.67/25.87; E2 18.22/25.32/
25.32 (2 lives); E3 8.57/13.67/9.37; post E4 22.73/30.83/26.03; E5 29.70/32.60/24.80. Noise measured: rows move 5-19 s between candidates
(draw-path changes once a run parts), as ruling item 3 asks to name.
**Session 4 starts at ruling item 1's remainder:** trace the three 2-1 files' moves to CI-1..CI-4 (bisect fz-ci1 acf29a092 / fz-ci2
82b7f4c8d / fz-ci4 with set1-m.sh's 2-1 lines; CI-1's frontStandPx(child) is the first suspect, as :282's child N40 on CI-1), and either
make them c27's or name each as an intended move with its trace; then ruling items 2-4 (R-165.424 entry; REPORT with the noise; red 4;
the final checks). Not run on CI-6 yet: the 4 files, the wide sample, tierBots.

## SESSION 3 HAND-OVER (ENG-PLANT-CI-c; started 12:19 PM ET 11-25). HEAD = CI-5 36da03dd4 + its test 455d5f7e4 + this file. STOPPED: A NEW FAULT (brief)
**Item 1, the adult walk-off: TRACED and FIXED in the toy (CI-5 36da03dd4, firsttimer.ts).** racefront adult phase 0 on CI-4 (probe
ci-tools/racefront.mts.txt, `ONLY=adult DBG=1 DBGT=adult DBGP=0 F0=200 F1=100 PDBG=1`; it now prints stopMeant/releaseLeft/lastSteer):
(a) the walk let go 23 px from #10's front at 260 px/s: the walk is judged once a frame, so it lets go up to one frame's run (9.5 px)
INSIDE frontStandPx; (b) the stand it falls to (the handed stand's `return {}`, and c26's front stand `{}`) set no stopMeant, so the
adult's late lift-off (no holdQ: thumbify re-arms every frame, R-165.59) held {right} 3 frames (stopMeant false, releaseLeft 0 each frame,
lastSteer 1), 5 px past the front; (c) THE GATE THAT PRESSED IN THE AIR: ft:3922, the edge's generic blind press
(`if (!drops) return this.decide(dir, this.jumpFor(...))`, decide's stack in ci-tools/racefront-decide.mts.txt), reached because
`here = floorAt(p.x)` reads NOTHING once his middle passes the log's front while he still stands on it. CI-5: frontStandPx counts the
decision frame ((releaseMax[1] + 1) frames: adult 41, child/kid 60); stopMeant at every front stand (handed {}, c26's {}, the
clockHeld stand); `here` falls back to the engine's standingOnId when it is a drift/moving floor. racefront on CI-5: every tier, every
phase, 5-34 px behind the front, no water (adult 15-28; CI-4 adult 13 past to 5 behind, 3 waters). **Test** riverRide.test.ts 'on the race
leg, a log running his way...' (appended; reds 5-9's tests untouched): RED on CI-4 (adult 7/8 phases past the front), GREEN on CI-5.
Upstream (racefront-up.mts.txt, logs AT him): CI-4 -> CI-5 middle 0.5 and 1.5 hop -> handed (rides back to the bank; he stands 10 px
further back), expert 1 'hop 7 px past the front' -> handed, adult 0 log -> handed.
**The races on CI-5 (frozen fz-ci5; data/ci/margins-ci5.txt, CI-4's in margins-ci4.txt): 10/10 WON.** Margin (s; c27 / CI-4 / CI-5):
home N1 7.21/8.41/4.41; N2 31.24/23.34/21.94; N3 17.06/12.76/20.26; post N4 17.80/29.20/17.90; **post N5 19.70/8.30/3.60**;
home E1 19.77/23.67/19.57; E2 18.22/25.32/24.22; E3 8.57/13.67/30.27; post E4 22.73/30.83/26.03; E5 29.70/32.60/30.80.
Post N5 CI-4 vs CI-5 part at t 71.70 on #45 (CI-5 lets go of the front-stand walk a frame earlier); both at q#55 at t 89.63 within 2 px;
the 4.7 s goes after that (draw-path, not traced). Rows move +-5 to 17 s between candidates: **post N5's 3.6 s is inside that spread.**
**The 10 known flips (set1-m.sh, data/ci/set1-ci4 and set1-ci5, vs data/q/set1-c27 on the c-report branch):** CI-4 already differs from
c27 on the three 2-1 files (child E2 288.2 s, child N11 1 life, kid N19 8 lives: CI-1..4, NOT traced). CI-5 moves 8 of 10 files vs CI-4:
the KID rows FAIL -> PASS (2-4 kid Easy 2,12,13,19,20; 2-2 kid Normal 3,33; 2-1 kid Normal 19: the stand is a stop he means, the
intended move); **three rows LOSE A LIFE: 2-2 adult N4 (0 -> 1, +16.4 s), 2-4 adult N6 (0 -> 1, +8.6 s), 2-1 child N11 (1 -> 2).**
**THE NEW FAULT (2-2 adult N4, traced, ci-tools/rowprobe.mts.txt `ALL=1`):** the runs part at f2986 t 99.53 on log #79 (drift, his way):
he RAN at 268 px/s past its front (x 20265, front 20258: 7 px past; not a front stand: a run at the lip). CI-4: the blind press (ft:3922)
flew him off from there and he landed. CI-5 (`here` = the log by standingOnId): the log's judged gates hold him STANDING 13 px PAST the
front, vx 0, for 9+ s (t 99.6 -> 108.5+, carried his way), 6 s behind CI-4 from then; the life is a sinking pad (#116 x 29,664, t 143.5).
So the blind press hid a run past the log's front at full run; judged, he stands past the front where no hop is judged landing.

## EXACT NEXT STEP (session 4): THE LEAD'S RULING after the STOP, word for word
"LEAD RULING (D133: narrow, never sweep). Good STOP and a clean trace.
1. CI-5 is TOO WIDE: it moves 8 of 10 known-flip files, and 3 rows lose a life. The likely sweeper is `here` falling back to standingOnId on EVERY drift/moving floor, plus stopMeant at EVERY front stand. Session 4 NARROWS CI-5 to the traced cases only: the race-leg front stand (CI-3/CI-4's place), counting the decision frame there. The aim: the known flips match c27 row for row, except the intended kid FAIL -> PASS rows, each named.
2. The 2-2 adult N 4 fault (he runs past log #79's front, and the blind press was hiding it) exists on main's path too, just masked. If the narrowed CI-5 leaves 2-2/2-4/2-1's rows as on c27, it does NOT get fixed in this merge: it goes on R-165.424's list with your trace. Only if the narrowing cannot avoid moving those rows do you fix it, and then STOP and tell me first.
3. The race margins: the bar is every race WON. Margins are reported, not gated. 3.6 s WON is WON. Name the noise you measured (5-17 s between candidates) in the REPORT.
4. Then red 4 (bot model = engine), then the final checks as in your brief (the 4 files with only reds 5-9 left, the wide sample, tierBots, tsc).
Hand over on your box with this word for word in the EXACT NEXT STEP. If session 4's narrowing also fails to converge, STOP and send me the table: I will then decide the scope of this merge."
How (session 3's notes): trees fz-ci4 4da085f92, fz-ci5 36da03dd4 (chattr). Tools: ci-tools/*.txt -> /home/user/tl/*.mts; set1-m.sh +
margins.mts from release-0.10.3-wip-plant-c-report reference/qa-reports/ENG-PLANT/tools/; c27's flips: that branch's data/q/set1-c27/.
Compare each set1 jsonl (sorted by seed: pass, lives, time, rescues) vs c27 AND vs data/ci/set1-ci4. The narrowing: drop the `here`
standingOnId fallback; stopMeant and the decision frame only where the race-leg walk (SKILLS.race, the pacer on, the log his way) ends;
c26's frontStandPx untouched elsewhere; racefront + the new riverRide test must stay GREEN. The 2-2 adult N4 trace for R-165.424: above.

## SESSION 2 HAND-OVER (ENG-PLANT-CI-b; started 11:58 AM ET 11-25). HEAD = CI-4 4da085f92 = a CANDIDATE, NOT DONE: do not merge it yet
Branch release-0.10.3-wip-plant-ci: acf29a092 (session 1) -> 82b7f4c8d CI-2 RE-APPLIED (the lead's ruling: the judged hop is the hop
flown) -> fa132c831 CI-3 (the race front stand in the race branch) -> 4da085f92 CI-4 (the race front stand in the landing ride stop)
-> this file. Probes: reference/qa-reports/ENG-PLANT/ci-tools/race-probe.mts.txt and racefront.mts.txt (copy to /home/user/tl/*.mts).

**Post middle Normal 5's 3.20 s race loss on CI-2, TRACED (race-probe on frozen CI-1 acf29a092 vs CI-2 82b7f4c8d):** the runs part at
t 75.13 (the race double off #44 onto #43: CI-1's overSmall let go over #44 for 3 frames; CI-2 does not, as ruled) and land 2.4 px
apart; the drift-log timing then compounds. The LOSS: on #51 (a log running his way, the race leg) he came down at a run at 84.97 and
the LANDING RIDE STOP (landRide, ENG-PLANT-i, firsttimer.ts ~3950: a log running his way with no floor ahead is ridden, 'a stop he
means') stood him 143 px behind its front for 4.3 s. That stop sits OUTSIDE the race branch, so the race gate never looked; from the
front the double onto #52 lands (CI-1 took it from the front at 84.13). Ridden to bank #50, raced from #51 at 89.63: LOST by 3.20 s
(130.9 vs the boat 127.7). **A separate bot fault CI-2 exposes, not the race's margin**: c26 gave the FRONT STAND only to a log running
BACK at him. CI-3 adds it in the race branch, CI-4 in the landing stop, on the race leg only (SKILLS.race, the pacer off), and walks only
where the log is handed on to a floor or he can walk back from the front before it goes under (the handed stand's own check).

**Measured on CI-4 (frozen fz-ci4):** post middle Normal 5 WON 119.4 vs 127.7 (margin 8.3 s; CI-1 108.0, margin 19.7 s: MOVED, not yet
traced); home middle Normal 1 WON 107.5 vs 115.91 (margin 8.4 s; CI-1 not measured yet). The toy (racefront, the race leg's logs his
way, gap 150, 8 phases, 4 tiers): CI-2 the middle stands 46-184 px behind the front in phases 0-1.5 (the landing stop); CI-4 every
tier waits within 2-33 px of the front in every phase. CI-3's four files (fz-ci3): 60 tests, 6 fail = reds 4-9 exactly; reds 1-3 GREEN,
both race tests WON; :282's child Normal 40 the same as CI-1 (bankUp on 0 lives, off 1). CI-4's four files: see the line below.
**CI-4's four files (frozen fz-ci4): 60 tests, 54 pass, 6 fail = reds 4-9 exactly** (hopJudged 9/10: Easy 5 only; firsttimer :185, lianaRide
DROP ON A LOG + A VINE FROM A LOG, riverRide :266 adult N12 'still clean', :282 child N40 on 0 / off 1); reds 1-3 GREEN; both race tests WON.

## EXACT NEXT STEP (session 3)
0. Setup as session 1's step 0; frozen trees: fz-ci1 acf29a092, fz-ci2 82b7f4c8d, fz-ci4 4da085f92 (chattr; D115).
1. The toy each way, as TESTS (riverRide.test.ts, from racefront.mts.txt; read by what he does, never where): (a) race leg, a log his
   way: every tier waits within frontStandPx(who) + 12 px of the front, never mid-log: RED on CI-2 (middle 46-184 px back), GREEN on CI-4;
   (b) the same river with NO pacer (not a race): the landing stop stands him where he lands, as c27 (no row moved off the race leg);
   (c) a race-leg log whose run ends in the water with no floor (racefront's 4th arg `tail` > 0, short river): no walk to its front.
2. **CI-3/CI-4 DEFECT, TRACED (fix FIRST; the candidates are not mergeable until it is):** the front-stand walk runs the ADULT OFF the
   log's front. racefront adult phase 0 (`ONLY=adult DBG=1 DBGT=adult DBGP=0 F0=70 F1=106 FS=2` for frames; `PDBG=1` for intend vs pad
   per frame): stood 40 px behind #10's front (f70), 40 > frontStandPx 31, so the walk. intend {right} from x 1142; the PAD lags it 3
   frames (pad {} at 1142-1146, {right} from 1149); intend lets go at x 1174 (about 29 px from the front, ~1203) but the pad keeps {right}
   3 MORE frames (1174, 1186, 1198) at 260-268 px/s: no slowing at all; at x 1210 (past the front) `pending` is set and a press fires at
   x 1222 in the air (which gate set it: NOT traced; no gate should press past the front onto nothing), into the water, set back to bank
   #1 (x 850: the toy's 'handed#1'). Same in phases 2 and 3; phases 0.5/1.5/3.5 'hop' from 3-13 px past the front. So frontStandPx
   (12 px slide + releaseMax[1] = 2 frames for the adult) is short of the pad's measured release lag here (3 frames + the decision
   frame). Fix it general: the walk lets go where his stop from his CURRENT speed with the pad's real release lag ends before the front
   (read how rhythm/thumbify delays a let-go for each tier: firsttimer.ts rhythm() ~4825), and find the gate that pressed off the front.
   c26's upstream front stand uses the same number: check it with the toy flowing at him (racefront with dir -1) too.
3. The post margin move 19.7 -> 8.3 s (and home Normal 1 vs CI-1): race-probe CI-1 vs CI-4, the first frame they part and why (CI-2 parts
   from CI-1 at t 75.13; CI-3/4 part from CI-2 at t 69.63, the front-stand walk on #44, then a race double at 69.83).
4. The brief's CI line on CI-4: the 10 races (every race WON, margins vs c27) + the 10 known flips (ENG-PLANT's tools/margins.mts.txt,
   set1-m.sh.txt on release-0.10.3-wip-plant-c-report), each moved row traced to CI-2/3/4. Then red 4, reds 5-9, :282 as session 1's
   steps 2-3; then the final head's checks (tsc, CI tool line 0 fail, tierBots 9/9, wide sample 0 BAR PASS -> FAIL vs main).

## SESSION 1 (kept)
ENG-PLANT-CI: the 9 CI-tool-line reds on c27 (session 1, started 11:37 AM ET 11-25 by the hook's stamp; this file written 11:49 AM ET 11-25, updated 11:55 AM ET 11-25)

Engine (bots), Opus 5.5 xhigh. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Branch **release-0.10.3-wip-plant-ci** (cut from d742d0469 = c27 +
raceSure deleted). ENG-PLANT-s merges this branch into its own; this branch never merges into release-0.10.3.
**Code head: af45a4de0 = CI-1 246d90533's code** (reds 1-2: the two reAim toys; can move the child and the kid only). **CI-2 0a9a49b91
(red 3) is REJECTED and reverted: a NEW FAULT, 2-7's race post middle Normal 5 LOST by 3.20 s (hopJudged #26, GREEN on c27 and on
CI-1); the lead is told (STOP, per the brief).** Tools: /home/user/tl (not in git; described below). Base release-0.10.3 = dfe631913.
**CI-1's four-file run (frozen fz-ci1, 60 tests): 53 pass, 7 fail = the 9 less the two reAim toys; 'SKILLS.reAim is the CHILD bot's
alone' GREEN. ONE MOVED ROW: riverRide :282's child Normal seed 40 on 2-1, with bankUp ON now 0 lives (c27: 1); off still 1 (so :282
reads '1 more' instead of '0 more'; still red, bar 5). A child row, CI-1 can move it (frontStandPx / the reAim floor): NOT YET TRACED.**
**CI-2's four-file run (frozen fz-ci2): 53 pass, 7 fail = reds 4-9 + the NEW race loss (#26 'the race LOST by 3.20 s'); red 3 GREEN.**

## The 9 on c27's head d742d0469, measured here (4 files, frozen tree fz-head): 60 tests, 51 pass, 9 fail, the same 9 as the REPORT
On the base dfe631913 (frozen fz-base; riverRide + lianaRide + hopJudged): hopJudged 4/4 GREEN, lianaRide GREEN (both plants), both
reAim toys GREEN; riverRide's base reds are :119 ride, :165 handed, :229 cross clean, :266 upstream, :282 bankUp (c27 fixed the first 3).

| # | red | first candidate red (bisected on the lean line dfe -> c2 80eb0784 -> c3 60bbf14c -> c3b a64f02ce -> 06b5316b -> c4 6b5f43da -> c19 9035c553 -> c20..c27) | cause (traced) | status |
|---|---|---|---|---|
| 1 | riverRide :344 reAim 'aims again' (GREEN half) | **c26 51ffe7ea** (also red at c20 d9681e40, fixed at c21) | (a) c26's front-stand walk (`return side(dir)`) came BEFORE the reAim expiry; the child's rhythm eats the walk (intend {right}, rhythm {}), so he stood 46 px from the front with the stale tap for 1.2 s and rode back (phase 0.5; base re-drew at +0.467 s and hopped). (b) phase 1.5: FRONT_STAND_PX let go at 31 px for every tier (2 frames late lift-off); the child lifts off up to 4 frames late (releaseMax [1,4]) and stood 9 px PAST the log's end, where no gate is reached (fell, a life) | **FIXED in CI-1**: reAim expiry before the walk; `frontStandPx(who)` = 12 px slide + releaseMax[1] frames at full run (adult family 31 unchanged; kid and child 50). Toy GREEN (all 6 phases hop), RED half still red with reAim off |
| 2 | riverRide :355 reAim 'honest aim' (re-draw inside stopReact) | **c2's merge 80eb0784** (0.200 s), 0.000 s from **c3b a64f02ce** | c2: padPause's refused flick drew an aim on log #13 (ft:3234 on c2), the upstream gate's new wait drew again 0.2 s later on the same log (f354 -> f360). c3b on: tablePick drew a whole hop for its thumb in the same frame as the refused aim (ft:1997 after ft:3413, f160 phase 0) | **FIXED in CI-1**: WaitAim keeps the last aim drawn on the same log inside the child's stopReact (no draw); tablePick waits until the aim was refused for his stopReact (then draws, a re-draw after his reaction). react = 0 for tiers without reAim: unchanged. Toy GREEN |
| 3 | hopJudged 2-7 home middle **Normal 2** ('padPause q#50 ... double \| came down #49 drift') | **c26 51ffe7ea** (GREEN through c25 6fb42bd1) | TRACED (CI-1, /home/user/tl/hj-probe.mts): the race hop at t 82.73 put him on #49; padPause judged a double off #49 onto #50 at t 83.97; at t 84.333 (falling, x 12517, #49 spans 12509..12659) overSmall read #49, the log he LEFT, past its middle and steered back (pad right), the second press at 84.400, down on #49's end. The judge (hopFlight) reads overSmall for the judged landing only | OPEN. CI-2 0a9a49b91 (a hop a gate judged off a drifting log sets jump.snapFrom = the log he leaves, so overSmall never steers back onto it) turned it GREEN (and Normal 5 / Easy 2) but moved the middle's home runs (judged hops 31/36/34/37 -> 34/33/36/31) and LOST race post middle Normal 5 by 3.20 s: REJECTED, reverted (af45a4de0). Waits on the lead (STOP) |
| 4 | hopJudged 2-7 home middle **Easy 5** ('edgeWait q#-2 judged t 21.77 x 16688 ... came down #18 drift') | **c2's merge 80eb0784** (red on every candidate after; base GREEN); unchanged on CI-2 | PART-TRACED (CI-1, hj-probe): off bank #14 (y 721) at x 16687.8, a 0.052 s single toward log #18 (y 749, 16670..16820 at the press); in the air pad right to t 21.933, {} at 21.967, then LEFT from 22.000 (overSmall: over #18 past its middle, steered back) and down on #18 at 22.200. The judge flew the drawn thumb and predicted no landing (q -2). Next: fly hopFlight for #18 with this row's thumb (thumbAt) beside the engine frame by frame and find the first frame they part (the thumb's travel on a turn, or the steer-back's frame) | OPEN |
| 5 | lianaRide DROP ON A LOG plant (RED half: off lives 0,1,0,0,0,0, bar >= 4) | **c19 9035c553** (c4 + the judged run-up, SKILLS.runUp); c4 GREEN | the judged run-up made the middle cross gap280 without dropOnLog (not traced which press) | OPEN: re-plant at the SAME bar or retire per R-165.432 (full search) |
| 6 | lianaRide A VINE FROM A LOG plant (RED half: easy off 0,0,0,0,1, bar: none) | **c22 52bcce62** (c21 f96df63e GREEN) | c22 (the landing keeps only the pull-back inside his run-out) put him where a catch off a log comes without vineFromLog (not traced) | OPEN: re-plant or retire per R-165.432 |
| 7 | firsttimer :185 boardHop plant | red on the base too (ENG-28's table) | (D135: fix or retire here, never carry) | OPEN |
| 8 | riverRide :266 upstream plant ('upstream off, still clean: adult normal seed 12') | red on the base too | | OPEN |
| 9 | riverRide :282 bankUp plant ('bankUp off, 0 more lives: child normal seed 40') | red on the base too | | OPEN |

## EXACT NEXT STEP (session 2)
0. Setup: `npm ci --no-audit --no-fund --legacy-peer-deps`; `git fetch --unshallow origin` (background); check out
   release-0.10.3-wip-plant-ci in the main checkout (head 246d90533 or later). Frozen trees (D115): `git worktree add --detach
   /home/user/fz-ci1 246d90533` and `/home/user/fz-head d742d0469`, symlink node_modules, `chattr -R +i src tools`, `chattr -i
   src/game/gen2/proven`. Bisect worktrees /home/user/bis, /home/user/bis2 (not frozen; one run at a time each). Recreate the tools
   below in /home/user/tl.
1. FIRST: the lead's word on CI-2 (STOP sent: it fixes red 3 and loses race post middle Normal 5 by 3.20 s). Until then nothing on red 3.
   When the lead rules: trace the lost race on fz-ci2 vs fz-ci1 (castBots/homeToys' race leg, middle Normal 5, the first frame they
   part and the hop whose air steer changed), and narrow the rule to the case traced (e.g. only a hop judged onto a log AHEAD of the
   take-off log), never loosening hopJudged.
   Also trace CI-1's moved row (riverRide :282's child Normal 40 on 2-1, bankUp on: 1 life -> 0): which life, at what x, and which of
   CI-1's three pieces (reAim before the walk, frontStandPx, the reaction floor) moved it (toggle each on unfrozen copies).
2. Red 4 (Easy 5) as its row says. Measured at the hand-over (/home/user/tl/hj-thumb.mts on fz-ci2; the same row on CI-1): the judge
   flew qs 17,18 (edgeWait), h single 0.052, thumb.release 1,1,1,1,1,1,0,2,..., thumbAt {last 1, driftPx 30, armed false, releaseLeft
   0, travel/slip done, speed 320, once true}. The engine: want {} at t 21.933 (overSmall let-go) with 1 late lift-off frame (release[5]
   = 1), {} at 21.967, LEFT from 22.000 with NO travel delay (lastSteer was 0), down on #18 at 22.200 (x 16753). The steer-back at
   22.000 came at 23.6 px past #18's middle against overSmall's 22.5 (0.15 w): a hair. Next: copy hopFlight into a probe with a
   per-frame print (its helpers imported) and fly it for #18 with this row's args beside the engine's x per frame; the first frame they
   part names the side that is wrong (the judge's thumb or steer model, or the engine's overSmall threshold reading p.x at a different
   frame). Fix it general, a toy each way.
3. The plants (reds 5-9): for each, the same bar searched on the head per R-165.432 (every listed stage with the mechanic, every bot,
   both settings); re-plant at the same bar where a live case exists, else retire with the search as evidence (the skill's code stays).
   5 and 6 are toy plants (lianaRide's gap280 / catch toys): first try the toy's other rolls and variants at the same bar.
4. If CI-1 (or a fix for 3-4) moves bot behaviour: on that head, once, the 10 races + the 10 known flips vs c27 row for row (only the
   rows meant to change, each traced: CI-1 can move the CHILD and the KID only: frontStandPx (both) and the reAim floor (child); a red-3 fix (CI-2 shape) can
   move EVERY tier that presses a gate-judged hop off a log (the middle's races included): each moved race row traced to it), and the
   wide sample (seeds 1-10, 2-1/2-2/2-4) 0 BAR PASS -> FAIL vs main. The scripts are ENG-PLANT's (REPORT, session 15's item 1:
   tools/margins.mts.txt, set1-m.sh.txt, wide-m.sh.txt on release-0.10.3-wip-plant-c-report). At most two heavy runs at a time.
5. DONE = the CI tool line at 0 fail, tsc, tierBots 9/9 on the head; push; ls-remote; send the lead the hash and one line per red.
   Lead's deadline for the 9: 1:30 PM ET; hard stop 3:30 PM ET.

## Tools (in /home/user/tl, not committed; recreate from here)
- bisect.sh: `W=<worktree> bisect.sh <out> <test file> <name pattern> <hash...>`: checks out each hash in W, runs the filtered test
  with the tap reporter, appends '== hash N ok M fail' and the not-ok/error lines.
- reaim-probe.mts `<tree> <phase> [all]`: riverRide's reAim toy river (the toy's own pieces), the first on-log draw stubbed to the
  0.033 s tap; prints every on-log drawHop with its frame and caller lines (stack), and with 'all' every 3rd frame (x, vx, log,
  distance to the front by sim.p.x 'fs', and the intend/rhythm pads, by wrapping run.intend and run.rhythm).

Lessons applied: D115 (verdict runs on chattr-frozen trees; probes only on trees not being edited), D119 (commit message from a file),
D128 (stamps from date), D134 (pushed and ls-remote'd before the hand-over), D135 (base reds named, not carried), D133 (one candidate,
not stacked), rule 28 (each red bisected to its first candidate and traced by frame before any fix), law 22 (no test weakened).
