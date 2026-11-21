# ENG-27j REPORT (handed over at the D111 box; base d29258340; branch t-eng-27, head: this commit; merge 24d6ba567, re-plant af127d21e)
## EXACT NEXT STEP (ENG-27k, from t-eng-27 head; read only this section, D90)
G. **The ground's gates on 2d4e0752a are NOT all green yet.** At the hand-over: tsc PASS, suite 1/6 PASS 634/634 (with ENG-GROUND-e's lock
   PASS 102/102 and suite 1/6, the same two). Unrun or running when the container stopped: suite 2-6, tooltests, tierBots, tipwalk,
   coverage, registry, generality, known, roadmap, time, art (chain a) and all of chain b. Run them FIRST, in the background, on a frozen
   worktree at 2d4e0752a: `G=<logdir> H=<worktree> bash reference/qa-reports/ENG-GROUND/run-gates-d.sh a` then `... b` ($G/../tooltests.cmd
   = gates.yml line 157 with the leading '- run:' stripped; node_modules symlinked from the main checkout; `git fetch --unshallow` before
   roadmapcheck and the lock). All green: tell the lead 2d4e0752a is the green ground head. ANY red: the merge 24d6ba567 is already on
   t-eng-27 (safe-keeping, the container is temporary): name the red to the lead with its log tail and wait for the ruling (revert with
   `git revert -m 1 24d6ba567` only on the lead's word).
B. **boardLog's RED half is NOT re-planted yet** (pacerLay.test 'a log drifting his way, still mostly under the lip ... home Easy seed 1;
   RED without it' FAILS on the merged head: 57/58 of the six files; the race now wins without the skill, 85.2 vs 97.53, ENG-27i). Left
   failing on purpose: never loosen, never retire while the skill lives (the lead's ruling). Build its explicit toy in
   tools/inspect/firsttimer.test.ts beside the fromTakeoff one: a bank ending at 1000 (top 600), one log his way 28 px under the lip, the
   river a zone, a level put-back (levelHeight 700). My first toy, boardlog-probe-27j.ts.txt (copy to tools/inspect/_probe.ts; args none:
   a sweep of the log's front at t0 and his start; never commit it as .ts): FT_MIDDLE_EASY from x 940 or 700, cap 4. FOUND: (1) the
   engine's log x froze during his splash while driftX(t) ran on (log800 vs dx846 at t 1.4), so a bare toy's log and the bot's clock part
   after a fall: judge only the first approach; (2) from x 940 with the front at 1000 he ran off the lip onto the log's front and off it
   ON AND OFF ALIKE (the miss itself, but the skill did not engage: underLip reads fa = floorAt(p.x + look) and the log's front was
   already behind his look, so fa was empty); (3) from x 700, fronts 960/975/986: ON fell (t 2.5-3.3), OFF did not; 1000/1015 and from
   500: neither fell. (3) needs tracing before any toy is called a plant (is it the skill's own harm, a rule-28 concern, or the toy?).
   TRACED (3) at front 975, start 700 (boardlog-trace-27j.ts.txt, frame rows every 0.1 s): ON, his look meets the log still mostly under
   the lip, so underLip says no floor ahead and he STOPS where he is, 57 px short of the lip (x 943, t 1.1-1.7); he hops from there at
   t 1.8 and comes down on the log at x 1089, 26 px from its front (log 875-1115), still moving, runs on and jumps off its front at
   t 2.5 into the water (x 1347; no next log, the far bank 485 px on). OFF, he walks to the lip (x 1003, t 1.7), the plain ride wait
   holds him there to t 2.6, he hops at t 2.7 and comes down 88 px in from the front (x 1057 on 905-1145) and rides at the log's speed.
   So on this toy the skill's wait point is WRONG: it holds him at his look distance, not at the lip, and the longer hop lands near
   the log's front. That is the same miss the skill was planted against (coming down near the front and off it), made by the skill.
   Before re-planting: decide with the lead whether underLip should send him on to the lip (as the ride wait does) and only then
   wait; that is a bot change, so rule 28 (row-for-row castBots diff) goes with it. One log only and a 600 px river make this toy
   harsher than any listed row; a second log within a hop would let the ride's own hop save him, so lay ONE log to keep the cause bare.
   The toy must put the log 64 px out of 240 at the moment his look first reaches it (the race's x 7650), not at t0.
   Only if a scan of 2-1..2-7's listed seeds finds a log mostly under the lip at a running approach NOWHERE after the merge: retire
   boardLog WITH its test, by a rule-28 row-for-row castBots diff showing nothing moves.
R. **The race table on the merged head: DONE** (af127d21e, race-27j-merged.txt; raceprobe-27e.ts.txt on a frozen worktree). Middle: home
   12/12 WON, post 12/12 WON (closest: home Easy 3 and post Easy 3/5 by 4.1-5.9 s; home Normal rows in the file). Expert (Normal only:
   no expert bot on Easy): home 6/6, post 6/6 WON. No middle or expert loss, so none to trace. Ride-only: lost 22/24; WON home Normal
   seed 1 (93.5 vs 93.89, +0.4; was lost by 21.5 at 27f) and seed 2 (91.8 vs 92.37, +0.6; won by 0.3 at 27f). pacerLay's 'the ride-only
   player never wins without a fall on the last crossing' (home seeds 1-3, both settings) PASSES, so each of those two wins carries a
   fall on the last crossing (the lead's ruling A: falling in is not winning without effort). Worth the lead's eye: home Normal 1 moved
   from a 21.5 s loss to a 0.4 s win with the merge and the re-plant, by the exemption, not by a clean ride.
S. Then the packet's step 5: stills at 2x both ways (the boat waiting, setting off, docked; the door and letter), THE CLIP of the race leg
   (D63), THE FULL SET (gates.md D96; lockall vs 0eefc707e: only 2-7's toy moves; `git fetch --unshallow` first). Known and NOT ours: the
   wall end's shade seam and water fill and the stretched wall picture (R-165.380, after release 3).
## What was done
1. **The merge** (24d6ba567): origin/t-eng-ground 2d4e0752a into t-eng-27, --no-ff. The two conflicts ENG-27i mapped, nothing else.
   w2.ts lip(): OURS (`p.y >= y - 2 && p.y <= y + LIP_RISE`, a bank on the fall's own storey; it refuses the upper leg 600 over the fall
   that theirs refused too), both comments folded into one. engine-core.md: both sections kept; the "groundStack (NOT merged here yet)"
   line now names the merge and points at §0zq-GROUND. tsc PASS. The six files (pacerLay, pacerBehindBanks, groundStack, legsHome,
   postLay, w2.test) after the re-plant: 57/58, the one fail boardLog's RED half (B above).
2. **fromTakeoff's RED half re-planted on its cause laid explicitly** (af127d21e; the lead's ruling): tools/inspect/firsttimer.test.ts 'in
   the real engine: a jump from a STAND over a laid pond reads the gap from where he stands ...' (sim.bare, the bot's own jumpFor read, as
   ENG-27h's boardHop plant): (a) a stand 165 px before a laid 133 px pond (post Normal seed 5's x 6591), (b) a stand 107 px back on a log
   with the bank 72 px past its front (seed 4's x 2749): each a double with SKILLS.fromTakeoff on, a single with it off (RED, checked);
   and the narrowing rule 28 found holds on as off (running at the pond, a dry pit the same width, a stand 330 px before a 60 px pond:
   each a single). firsttimer.test.ts 13/13 PASS. pacerLay's post Normal 4 and 5 race tests keep their GREEN half (the middle wins both,
   PASS); their RED half moved to the laid toy (comment in place; title says where its RED lives). Not loosened: the skill's RED is
   still proven, now where its cause is laid rather than where the generator happened to lay it.
POLISH CHECK: no screen changed in this packet (a merge and tests); stills and THE CLIP are step S, undone.
LESSONS APPLIED: D111 (the box from `date`; long runs in the background on frozen worktrees from the start), D57 (inbox at each step and
   push), D102 (lean reads), D109 (no clock times in messages), law 22 / the lead's ruling (no test loosened; the failing RED half left
   failing and named rather than dropped), law 3 (the bare toy's first result checked frame by frame before calling it a plant: it was
   not one). LEARNED: a re-plant at the bot's read (jumpFor) on a bare toy is quick and exact; a re-plant of a floor-ahead read
   (boardLog) needs the log placed relative to his look at arrival, and a bare world's log stops during a splash while the bot's clock
   runs on: trace the first approach only.

# ENG-27i REPORT (handed over at the D111 box, 28 min; rewritten 4:02 PM ET by date; first written 3:57 PM ET 11-21 by date). Base 7d5200da8; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27j, from t-eng-27 head; read only this section, D90). 1a is done. ORDER (the lead's): G, R, then 1, 2, 3
G. **The gates on 2d4e0752a first, IN THE BACKGROUND** (origin/t-eng-ground's head, ENG-GROUND-e: "the corner"): a frozen worktree at
   2d4e0752a, CLAUDE.md "Checks" in order (gates.md); read only tails and failures. Nothing else edits that tree while they run.
R. **The re-plant (the lead's ruling on pacerLay's three planted RED halves; see the TRIED note in step 1):** never loosen, never retire a
   test while its skill lives. Re-plant each where its cause still lives: build the toy so the cause is laid EXPLICITLY (the pool or gap it
   needs, not whatever the generator lays there), RED without the skill and GREEN with it, on the MERGED ground (so: on the trial merge
   with ours lip, then carried into the real merge). The three: ENG-27f's fromTakeoff plants, post Normal seeds 4 and 5 (a stand 165 px
   before a 133 px safe pond, x 6591; a stand 107 px back on a log, 72 px past its front, x 2749), and ENG-27g's boardLog plant, home
   Easy seed 1 (a log drifting his way still mostly under the lip). Only if a scan of 2-1..2-7's listed seeds finds the cause NOWHERE after
   the merge, retire the skill WITH its test, proven by a rule-28 row-for-row diff showing nothing moves.
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Sparse worktrees: mkwt-27g.sh.txt (set S to your scratchpad).
   Rule 28 is DONE for the refined boardHop (below): do not re-run it. Its tools: r28patch-27i.py.txt (the refined skill for every tree),
   r28-runner-27h.ts.txt, r28diff-27h.py.txt; probes r28moved/r28lives/r28fire-27i.py.txt, bhfire-27i.ts.txt (+ r28probe-27i.diff.txt:
   NO_HOP=1 turns boardHop alone off, __bhf logs each fire, __up each single the testers' dblShare turns into a double).
1a. **DONE (the lead's ruling (3), before the merge): explain 2-4 child Normal's lives 185 -> 205 IN FULL (a shipped stage).**
   the four untraced lives, one line each (trace runs on hd3; none is a wrong boardHop read): child N 14 x 24458, walked onto log 107 and ran
   off its front (the named walk-off; the fire's single was not the move made); child N 18 x 16483, the same walk-off on log 76; middle N 22
   x 23087, boardHop's single came down on log 102 as read, then the ride's hop off the log fell short (R-165.381); middle N 38 x 16295,
   the single came down on the bank's last 5 px (16126 of 16121), then he walked onto log 73 and off its front. Per row and per zone:
   r28-27i/2-4-childN-lives.txt (hop on vs NO_HOP=1, 35 moved rows, +20): by 1000-px zone, lives on/off (fires): 16k 33/30 (6), 21k 19/23 (4),
   22k 38/37 (12), **23k 41/28 (0)**, 24k 24/22 (13), **25k 23/17 (0)**. So the extra lives sit where boardHop NEVER fires (23k +13, 25k +6).
   Every 2-4 harm in every tier is water (hitBy; child N base 177, 27g head 185, new 205). Seeds 40 and 39 (+6, +5) traced life by life
   (r28-27i/2-4-c39c40-lives.txt): of 16 lives, 11 are a hop FROM a drifting log (here = drift, the ride's, R-165.381) and 5 a jump from a
   bank where boardHop did NOT fire (the bot's own gap read); NONE is a boardHop jump (39's fires 280.6/281.4 at x 21131/21222 are look-ahead
   points 900 px from the life at 280.6; 40's are 206.4 x 15973 and 360.7 x 24175, after its last life). The runs part at the first fire
   and the rest is the same water met at another log phase. Statistically +20 on 228/208 lives is about 1 sigma (sqrt 436 = 21).
   Seeds 10, 12, 13, 27 (+4, +5, +4, +5) the same way (r28-27i/2-4-c10c12c13c27-lives.txt): of 25 lives, 19 from a drifting log (a hop or a
   walk-off: the ride's), 6 from a bank where boardHop did not fire, NONE a boardHop jump. The other ten plus rows (2, 4, 5, 8, 16, 18,
   20, 21, 30, 33) by r28classify-27i.py.txt (r28-27i/2-4-c10rows-lives.txt): 55 lives, 39 from a log, 16 from a bank without a fire, 0 a
   boardHop jump. **ALL 16 rows that gained lives: 96 lives, 69 from a drifting log (R-165.381's hop or the named walk-off), 27 from a bank
   where boardHop did not fire, 0 from a boardHop jump.** Done with 1a: no wrong boardHop read on 2-4; the +20 is the same water met by
   runs that parted at the first fire (likely: it puts the child on logs, where the ride's own faults take him; the off runs' log share was not counted). Sent to the lead.
   Lead's rulings in hand: dblShare's upgrade of a
   boarding single STAYS (BOTS.md calibration); the ride's hop off a drifting log falling short is R-165.381, after 2-7 ships, left alone.
1. **The merge** (packet step 3): origin/t-eng-ground at the lead's green hash (2d4e0752a once G is green), --no-ff.
   A trial on 8a2257760 gave the two conflicts ENG-27g mapped, nothing else: engine-core.md (keep both sections; replace our line 18
   "groundStack (t-eng-ground, NOT merged here yet)..." with its real line, pointing at §0zq-GROUND) and w2.ts lip() (ours
   `p.y >= y - 2 && p.y <= y + LIP_RISE` sits inside theirs `p.y <= y + LIP_RISE && p.y >= y - LIP_RISE`; ours also rejects their
   600-px upper leg; banks() takes y from the river's surface at its rivers call, so try OURS first and settle by both sides' tests).
   **TRIED on 8a2257760 (scratch, never pushed): with OURS lip, tsc clean and 53/56 of the six files; groundStack, w2.test, postLay,
   legsHome, pacerBehindBanks all pass. The 3 fails are pacerLay's planted RED halves, and they fail with THEIRS lip too (28/31):
   ENG-27f's fromTakeoff plants post Normal seeds 4 and 5 and ENG-27g's boardLog plant home Easy seed 1, "without the skill the plant must
   lose", now WIN without it (97.9 s vs boat 100.76; 100.5 vs 103.44; 85.2 vs 97.53): the merged ground took away the descent pools these
   plants were set on (the lead's ruling), so the cause is no longer on the toy. Do NOT loosen them (law 22): the lead's ruling is step R above.**
   Then tsc + pacerLay + pacerBehindBanks + groundStack + legsHome + postLay + w2.test (paths: src/game/gen2/{pacerLay,legsHome,postLay}.test.ts,
   src/game/gen2/worlds/w2.test.ts, src/game/{groundStack,pacerBehindBanks}.test.ts); engine-core.md.
2. The race table on the merged head: raceprobe-27e.ts.txt as tools/inspect/_race.ts, `npx tsx tools/inspect/_race.ts <middle|expert|ride> <home|post>`
   (six in parallel, about 1 min). The PRE-merge reference on 7d5200da8 is race-27i/: middle 12/12 WON home and post (both settings),
   expert 6/6 WON (Normal; no Easy bot), ride-only 0/12 (lost every one, the ride-only claim). Any middle or expert loss after the merge: trace it.
3. Stills 2x both ways (boat waiting, setting off, docked; door and letter: race-stills-27e.mjs, positions from the MERGED roll) and THE CLIP of
   the race leg (cliprec-27e + clip-27e.mjs, D63); THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy; git fetch --unshallow first).
## Rule 28 for the refined boardHop (2-1..2-6, 40 seeds, both settings; r28-27i/<st>-head.jsonl and <st>-diff.txt)
- Tier pass counts base / 27g head / new head: unchanged in every tier and setting, no drop (2-1..2-5 tiers 40/40; 2-6 0/40 at base too).
- Flips vs base: boardHop moved NO kid or adult row; every flip is one of ENG-27g's traced eight (2-1 kid N 11, 2-2 kid N 4, 2-4 kid N
  9/10/16/22/27, adult N 18). No flip from boardHop.
- Moved rows (27g head -> new), every one with a log across a lip in jumpFor: 2-1 87, 2-2 24, 2-3 0, 2-4 111, 2-5 29, 2-6 0.
- Lives 27g head -> new: 2-1 child N 102->93, middle N 51->58, expert N 40->42; 2-2 child N 215->204, child E 41->33, middle N 99->85,
  middle E 13->14, expert N 76->72; 2-4 child N 185->205, middle N 121->116, expert N 137->131; 2-5 middle N 9->7; 2-3, 2-6 same.
- Lives within 3 s after a boardHop FIRE, hop on vs NO_HOP=1 (2-1's 15 screened rows, 2-4's 111 moved rows; 2-2's 24: none after any
  read). Lost the same way with it off: 2-1 4, 2-4 1. The rest, traced (r28-27i/upgrade-probe.jsonl; frames in the trace runs):
  - The single came down ON the log as singleLands said, then a hop FROM the log (here = drift: the ride's, not boardHop's; R-165.381, the lead's) fell short
    0.3-1.3 s later: 2-1 child N 23 (x 24834), middle N 2 (14436), middle N 36 (24854); 2-4 middle N 22 (23087).
  - The testers' double habit: 2-1 child N 23 t 248.3, startJump got boardHop's single, dblShare (firsttimer.ts:3845, about 24%) made it
    a double that flew over log 114 (24606-24756) into the 72 px before log 111 (x 24791). Lead's ruling: it STAYS (the testers' habit).
  - The named log-front walk-off (walked on, rode, ran off the front): 2-4 child N 14 (24458), child N 18 (16483), middle N 38 (16295).
  - 2-4 child N +20 NOT yet explained in full: step 1a.
  - A fire logged 850 px from the life (a look-ahead point): 2-4 child N 12, child N 30: not his jump.
- pacerLay 19/19 on 7d5200da8 (the refined head), pacerLay-27i.txt.
## Done / not done
- Done: packet 1 (r28patch-27i), 2 (the table, sent), the pre-merge race reference. NOT done: 3 (no hash), 4 on the merged head, 5.
- Lessons applied: D57 (queue read at every step and push), D90/D102 (lean reads), D109 (no clock times to the lead), D111 (the box).
- Polish check: no screen changed in what was done (bot and report only); the stills and the clip are step 3 above.
- Learned: the rows run about 1 min per 90 rows on 4 cores (24 jobs in about 12 min, not 40). The __bh read log is a superset; log the fire
  (__bhf) and the executed kind (__up / the trace's jmp) before tracing a life, since a logged single can still go up as a double.

# ENG-27h REPORT (handed over at the lead's D76 call, real context ~325k; written 3:38 PM ET 11-21 by date). Base 71c3a293b; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27i, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Sparse worktrees: mkwt-27g.sh.txt (set S to your scratchpad).
   Patch a worktree for rule 28 with `python3 reference/qa-reports/ENG-27/r28patch-27h.py.txt <wt>` (runs r28patch-27g.py.txt, then adds SKILLS.boardHop where missing,
   all three skills read off with R28_BASE=1, and a log __bh of every jumpFor that meets a log across a lip). NOTE: r28patch-27h's boardHop hunk
   for trees WITHOUT it (t-build-23, t-build-25) is the FIRST cut (no singleLands): update its HOP line and helper to match firsttimer.ts now
   (`&& this.singleLands(p, dir)` and the singleLands helper) before running 2-3/2-5. Runner: r28-runner-27h.ts.txt -> tools/inspect/_r28run.ts
   (prints bhReads/bhFirst). Diff: `python3 reference/qa-reports/ENG-27/r28diff-27h.py.txt <stage> r28-27g/<st>-base.jsonl r28-27g/<st>-head.jsonl <new>.jsonl`.
1. **Rule 28 re-diff for the NARROWED boardHop (this head), 2-1..2-6, 40 seeds both settings: RUN NOTHING YET ON IT.** Trees: 2-1, 2-2, 2-4,
   2-6 on this head; 2-3 on origin/t-build-23 66775dabf; 2-5 on origin/t-build-25 6ddeeead2 (the trees r28-27g's base/head rows ran on, so
   only new head rows are needed: about 40 min on 4 cores, 24 jobs of 10 seeds). The lead's bar: no flip from a wrong read; every moved row
   explained (bhReads > 0); no tier count drops. Then for every moved row run bhev-27h.ts.txt (`_bhev.ts <stage> bot:setting:seed ...`): any
   life within 3 s after a boardHop read gets traced (r28trace-27h.ts.txt + r28cmp-27h.py.txt, NO_HOP=1 for the comparison run; the trace
   needs `(globalThis as any).__run = this;` at the top of pad()). The first cut (a235ceec1, a single wherever a log crossed the lip) gave on
   2-2: 46 moved, no new flip, no count drop, but 4 lives right after its read (middle N 3, 6, 17; expert N 10): middle N 17 traced, the single
   from a stand 35 px back came down 20 px past log 79's front (75 px out) where the double reached log 80. Hence the refinement here: a single
   only where hopLandsOn says a single comes down on a log. Rows of that first cut are obsolete (not committed).
2. pacerLay 19/19 was run on the FIRST cut only: re-run it on this head (and it is in the merge check below).
3. The merge: origin/t-eng-ground at the lead's green hash (ENG-GROUND-d). --no-ff. Trial merge on ef38ee2fd: two conflicts as ENG-27g mapped:
   engine-core.md (two new sections at one spot: keep both; replace our "groundStack (NOT merged here yet)" line with its real line) and
   w2.ts lip(): ours `p.y >= y - 2 && p.y <= y + LIP_RISE` (never over the fall's height) sits inside theirs `p.y <= y + LIP_RISE && p.y >= y -
   LIP_RISE`; settle by both sides' tests. After: tsc + pacerLay 19/19 + pacerBehindBanks + groundStack + legsHome + postLay + firsttimer.test.
4. The packet's steps 3-5 (UNDONE): race table on the merged head (raceprobe-27e.ts.txt; home and post, seeds 1-6, both settings, middle /
   expert / ride-only; any middle or expert loss traced; the named log-front walk-off is not to fix unless it loses a race); stills 2x both
   ways (boat waiting, setting off, docked; door and letter) and THE CLIP of the race leg (cliprec-27e, D63); THE FULL SET (gates.md D96;
   lockall vs 0eefc707e: only the toy; funcheck same-run vs main; git fetch --unshallow first). Then REPORT, "What the 2-7 builder needs".

## ENG-27h: what was done
- **Step 1, the 8 flips: TRACED and ACCEPTED by the lead** (trace-27h.txt): all 8 the boarding hop, all shifted draws after a right read. The
  kid's late lift-off (R-165.59) holds his steer through the wait, so his path is the same and only his draws move; base's air press off a
  log's front made the coyote window and head's did not (2-1, 2-2); on 2-4 the pairs part at the first log river and the extra lives come
  80-150 s later at spots base also loses lives at. The skill lowers those bots' totals (2-1 kid N lives 229 to 193, rescues 11 to 8).
- **A wrong read found off the 8, the lead's GO to narrow:** 2-2 child N 36, jumpFor read the gap past the log under the lip as a double
  over it into the water. **SKILLS.boardHop** (firsttimer.ts jumpFor, logAcross, singleLands): a log his way across the lip, a step down,
  where a single from here comes down on a log: a single. Planted (firsttimer.test, 12/12): the read in a toy (RED with it off; controls:
  a log only 40 px out, plant-checked RED without singleLands; no log; all under the bank; against the flow) and the run it was found on
  (2-2 child N 36, no life within 3 s of such a stand; RED with it off) with middle N 17 as a guard (NOT plant-checked against the first cut).
  tsc clean. Child N 36: 7 lives to 3, the boarding a single onto log 79.
- NOT done: the re-diff on the refined skill, the merge (no hash yet), the race table, stills, THE CLIP, THE FULL SET.

## Lessons applied
D57/D87 (inbox at every step and push), D102 (lean reads; handed over at the call), D109 (no clock times in messages), LAW 3 (each trace
claim checked: rows re-made, draws counted, the liana catch read off the engine), rule 28 (every flip traced; the narrowing's own lives
traced before trusting its re-diff, which caught the first cut's short single).

# ENG-27g REPORT (handed over at the context line). Base 64d1b14f8; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27h, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Worktrees are 2.7 GB each and the disk fills: make
   them sparse (no reference/ except reference/qa-reports/R-165.59/), as ENG-27g's mkwt.sh did (below). Probes: copy each .txt here to
   tools/inspect/_<name>.ts, never commit. ENG-27g's rule-28 runner and patch: r28-runner-27g.ts.txt and r28patch-27g.py.txt here.
1. **Rule 28 for SKILLS.boardLog (c92cf743c): RUN, RED on 8 flips, TRACE THEM FIRST.** Rows and diffs: r28-27g/<stage>-base.jsonl,
   -head.jsonl, -diff.txt (base = both of ENG-27g's skills off, head = both on, the same frozen tree; 2-3 on origin/t-build-23, 2-5 on
   origin/t-build-25 with both hunks, r28patch-27g.py.txt; runner r28-runner-27g.ts.txt; diff r28diff-27g.py.txt).
   - 2-3: base = BUILD-23e 360/360; 75 moved (all the take-off read's; the hop moves none), no flips. 2-5: base = BUILD-25d 360/360;
     214 moved (104 take-off, 170 hop), no flips. 2-6: 0 moved.
   - 2-1: 310 moved, P->F 1 (kid Normal 11), F->P 4. 2-2: 155 moved, P->F 1 (kid Normal 4), F->P 5. 2-4: 337 moved, P->F 6 (kid
     Normal 9, 10, 16, 22, 27; adult Normal 18), F->P 8. Every pass count rose (2-1 kid N 32->35; 2-2 kid N 24->28; 2-4 kid N 30->31,
     adult N 38->39); every moved row has a read a skill changes on its base run (no row unexplained). But the lead's bar is NO flip.
   - Do next: trace the 8 P->F (two runs per cause: the death probe death-27e.ts.txt, or the runner with an onFrame), find whether
     each is the hop's or the take-off read's and at what x, and fix where the cause lives or bring the lead the trace. The kid and
     adult (first-timers) are touched by the hop: it sits in the edge read every bot shares. Then send the lead the table.
2. The merge: origin/t-eng-ground at the hash the lead sends (ENG-GROUND-c has one more fix first). --no-ff. Two conflicts known
   (trial merge on 3e805121d): reference/handoffs/engine-core.md, and src/game/gen2/worlds/w2.ts `lip()` in banks(): this branch has
   `p.y >= y - 2 && p.y <= y + LIP_RISE` (ENG-27e: never over the fall's height), t-eng-ground `p.y <= y + LIP_RISE && p.y >= y - LIP_RISE`
   (ENG-GROUND-b). Settle by running BOTH sides' tests: legsHome, pacerLay, pacerBehindBanks, postLay (this side) and groundStack (its).
   After: tsc + pacerLay 19/19 + pacerBehindBanks + groundStack + legsHome + postLay; engine-core.md's groundStack line.
3. The packet's steps 3-5 (UNDONE): the race table on the final head (home and post, seeds 1-6, both settings, middle / expert /
   ride-only; any middle or expert loss traced); stills 2x both ways (the boat waiting, setting off, docked; the door and letter) and
   THE CLIP of the race leg (D63; ENG-27e's tools, cliprec-27e); THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy;
   funcheck same-run vs main; git fetch --unshallow first).
4. A second fault, NOT fixed (name it to the lead): after boarding, riding a log his way at full speed, he can still run off its front
   (2-7 home Easy seed 2 with the boarding hop: x 11554 off log 57; 9974; 5567). Lives lost per home race with both skills: 2-10.

## ENG-27g: what was done
- **Step 1, rule 28 for the take-off read: ACCEPTED by the lead.** Baselines re-run: 2-3 (t-build-23 unpatched) = BUILD-23e 360/360,
  2-5 (t-build-25 unpatched) = BUILD-25d 360/360 (castdiff-2-3-27g-base.txt, castdiff-2-5-27g-base.txt). Child Normal 30 traced
  (trace-27g.txt 1): the whole fix doubled three of his jumps, all over water; the rescue at x 20968 came from shifted draws, so the
  water-only candidate narrowed nothing. Both 2-7 misses were jumps from a STAND (post 5: 165 px before a 133 px pond; post 4: 107 px
  back on a log); running singles carry 207 px from a press 70 px back (flownArcs single-hold from70). Narrowed (5ef30a5cc): the
  run-up counts only from a stand (under 10 px/s), over water (wetBetween, FIX-21's read made one helper), and while a single can
  carry it. Re-diff: 2-3 75/360 moved, 2-5 104/360, no flips, every tier's pass count held, every moved row a stand over water the
  skill changes on its baseline run (75/75, 104/104; on 30 and 46 of them the baseline single splashed): castdiff-2-3-27g.txt,
  castdiff-2-5-27g.txt, rows castrows-2-3-27g.jsonl / castrows-2-5-27g.jsonl. A stand-only first try (no water test) moved 96 of 2-3,
  some at dry pits (castdiff-2-3-27g-stand.txt). tierBots 1-1 9/9 (tierBots-27g.txt).
- **pacerLay went 17/18 on the narrowing** (home Easy seed 1, middle: 98.4 s vs 97.53): traced (trace-27g.txt 5) to a pre-existing
  walk-off, the bot running off a bank lip onto a log drifting his way still mostly under it, then off its front; 2-4 of the 4-8
  lives EVERY home race lost. The lead: GO, fix it where it lives.
- **SKILLS.boardLog (c92cf743c):** a log drifting his way, a step down, less than half its length past the lip, is no floor ahead, so
  he waits and hops on (the ride wait). Planted (pacerLay.test, home Easy seed 1: wins with it, RED without). With it on, both post
  races win whether the take-off read is on or off (post 5 by 8.1 s with it, 1.0 s without), so the take-off plants run with the
  boarding hop off (where their misses happen). pacerLay 19/19 (pacerLay-27g.txt). Home races, middle, seeds 1-3 both settings: all
  six win with both skills.
- Rule 28 for boardLog: RUN (step 1 above: 8 P->F flips on 2-1, 2-2, 2-4, untraced). NOT done:, the merge (no hash yet), the race table, stills, THE CLIP, THE FULL SET.

## Lessons applied
D57/D87 (inbox read at every step and push), D94 (both baselines re-run before any diff), D96 (gates named UNRUN), D102 (lean reads;
handed over at the line), D105/D109 (no clock times in messages), LAW 3 (a prediction from a collapsed probe was wrong by 80 rows:
checked against the real diff before claiming it), rule 28 (every moved row traced to a read the change makes; two runs per cause).

# ENG-27f REPORT (handed over at the context line; written 2:17 PM ET 11-21 by date). Base 0d8d56a65; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27g, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Probes as .txt here (copy each to tools/inspect/_<name>.ts,
   never commit): raceprobe-27e (`middle,expert,ride home|post [seeds]`), splash-27f (pond put-backs and falls per run: `middle home,post`),
   jumps-27f (frames and re-placements: `tier setting seed home|post [clk0 clk1 every]`), trapx-27f (who wrote his x), riv-27f, under-27f
   (the laid platforms/rivers in an x window), racetrace-27d, death-27e, ride-27e.
1. **Rule 28 for SKILLS.fromTakeoff (d54a47d42)**, the lead's ask: a row-for-row castBots diff on 2-3 and 2-5, and tierBots 1-1 9/9.
   Trace any moved row, or narrow the fix.
   - 2-3 DONE, RED by the rule: castdiff-2-3-27f.txt. On origin/t-build-23 66775dabf with the jumpFor hunk only, against BUILD-23e's
     castbots23e-rows, 183 of 360 rows moved: kid and adult 0; child, middle and expert 33-38 of 40 each. One pass flips: child Normal
     seed 30, P to F (a rescue, time 401.8 to 438.2). The rest are time shifts: any changed jump shifts every later random draw.
     Rows: castrows-2-3-27f-fromTakeoff.jsonl.
   - Do next: (i) confirm the baseline. Run t-build-23 unpatched; it should equal castbots23e (ENG-27e matched Easy 160/160).
     (ii) Trace child Normal 30, two runs per cause. (iii) Narrow the fix and re-diff. Candidate: count the run-up only over WATER
     (the gap between the lip and the landing holds a river or a safe pond, like FIX-21's `past` read): both of 2-7's misses are over
     water. Or ask the lead whether wholesale time shifts with no pass change are accepted.
   - 2-5 NOT DONE: the run here was edited mid-run and is discarded. Do: castBots 2-5 --seeds 1-40 --bots kid,adult,child,middle,expert
     --setting both --rows, on this head with and without the hunk, against reference/qa-reports/BUILD-25/castrows-2-5-25d.jsonl.
     A worktree per run: two runs in one tree race on firsttimer.ts.
   - tierBots 1-1: NOT RUN (`npx tsx --test tools/inspect/tierBots.test.ts`).
2. **The table on the final head (both fixes)**: raceprobe home and post, seeds 1-6, middle/expert/ride, both settings, plus splash-27f.
   Trace every loss (rule 28). Known with the bot fix on the OLD floor (race-27f-fromTakeoff-oldfloor.txt): middle 23/24; post Normal 4
   and 5 now WIN (+1.6, +3.0); NEW losses: middle post Normal 6 (-0.7, four falls) and expert post Normal 4 (-1.1, six falls). No fall
   follows a jump the fix turned into a double: the falls moved with the shifted draws. Ride-only home Easy 1 won +1.5: check its last
   crossing.
3. The packet's step 0: merge origin/t-eng-ground when the lead sends its green hash (--no-ff; tsc + pacerLay 18/18 + pacerBehindBanks
   5/5 + groundStack + legsHome + postLay after). Then the stills and THE CLIP (packet step 2; ENG-27e's commands in the section below),
   groundStack's line in engine-core.md §0zq-27f, and THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy may move).

## ENG-27f: what was done
- **Step 1, the race table after ruling A** (dc7b583e8: race-27f-after-ruling.txt, trace-27f.txt). Middle home 12/12 WON. Middle post
  Easy 6/6; post Normal LOST seed 4 (-1.0) and seed 5 (-8.3, NEW: before ruling A it won only by the rewind of a docked boat). Expert
  Normal 12/12 WON. Ride-only 21/24 lost; its 3 wins each fell on the last crossing (named, not judged).
  - CORRECTION to trace-27f's pond line: the bot did NOT read the notch as a step down (its `drops` was false). It took a single from
    157 px before the pond (jumpFor sized the gap from the lip), then late presses and standing jumps from the put-back spot.
- **(b) the floor, the lead's ruling (1)** (4a7584fb4). pacer.ts riversLeft: after a fall the floor counts each crossing left from the
  respawn, never more than a clean run's margin, never less than one floor; the ride-only cap holds except on the last crossing.
  Planted on post Normal 4: RED on the one floor (2.0 against 2.29: red-27f-floor-single.txt) and per crossing alone (12.6 against a
  clean 6.59: red-27f-floor-percrossing.txt). Two assertions that pinned the one floor now read the ruled rule. pacerLay 16/16.
  - PUSHBACK taken: per crossing alone, an early fall paid 5 s. Post 4's loss was the hop's (a), not the floor's.
- **(a) the bot** (d54a47d42). SKILLS.fromTakeoff: jumpFor counts his ground to the lip with the gap. One root under both misses (the
  pond single from 157 px back; the log hop from 107 px back toward a bank 77 px past the log's front). Planted in pacerLay.test, post
  Normal 4 and 5, RED with the skill off (red-27f-fromTakeoff.txt: 101.5 and 111.7 s against 100.76 and 103.44). pacerLay 18/18; tsc
  clean.
- **Step 3, engine-core.md §0zq-27f** written (groundStack's line waits for the merge).
- NOT done: the merge (no green hash yet), the stills and THE CLIP, THE FULL SET (every gate UNRUN on this head), and rule 28's rest.

## What the 2-7 builder needs
- **The dock rule:** the race is judged at the far bank of the last river that holds the boat whole (lay (A)). DOCKED 0. A docked boat
  stays docked.
- **Fairness after a fall:** the boat is re-placed from the RESPAWN point. It keeps at least one floor (2 s Normal / 3 s Easy) for each
  crossing left, never more than a clean run's margin. Off the last crossing the ride-only cap holds, so a fall a river back with a slow
  log wait can still lose: the middle bot's clean play is what wins.
- **The ground rule (groundStack, t-eng-ground):** not merged here yet. Until then the waiting boat is hidden under the out leg's earth.
- **The bot:** 2-7's tier rows depend on SKILLS.fromTakeoff, and its rule 28 is open (step 1 above).

## Lessons applied
D57/D87 (inbox read at every step and push; long runs in the background), D63 (the clip is still owed: named, not skipped), D94 (2-3's
baseline is BUILD-23e's committed rows on the integration branch, and the baseline re-run is step 1 (i)), D96 (THE FULL SET named as
UNRUN, not claimed), D102 (lean reads; handed over at the line), D105/D109 (no clock times in messages), D107 (none), LAW 3 (my first pond
cause was wrong; checked the fact, corrected it to the lead and here).

# ENG-27e REPORT (handed over at the lead's D102 call; written 1:38 PM ET 11-21 by date). Base 580344077; branch t-eng-27, head below
## EXACT NEXT STEP (ENG-27f, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Probes here as .txt (copy to tools/inspect/ with a
   leading underscore, never commit): raceprobe-27e (`_raceprobe.ts middle,ride|expert home|post [seeds]`; expert has no Easy bot, its
   rows print 'no bot'), racetrace-27d (marks vs the bot), death-27e (`_death.ts tier setting seed home|post`: the 40 frames before each
   life lost), ride-27e (ride-only: lives lost, the clock's re-placements), cliprec-27e (the clip's recorder). Vite dev on 5199
   (`npx vite --port 5199 --strictPort --host 127.0.0.1`); PW=/opt/node-tools/node_modules/playwright/index.mjs.
1. **The race table re-run after ruling A** (the lead: "Middle Normal home 4 and post 4 should win, and any that still loses gets named
   and traced"): raceprobe on home and post, seeds 1-6, middle / expert / ride, into a file. Compare with race-27e-pre-ruling.txt
   (head d3d1d3f15, before ruling A). Trace any middle loss with death-27e + racetrace (seed, x, frame, what took him; rule 28).
   pacerLay.test is 15/15 on 316a7a18e (pacerLay-27e-bots.txt).
2. **THE CLIP (D63)**: the tool is built and tested on 200 frames (it paints on the real page): `npx tsx tools/inspect/_clipRec.ts middle
   normal 1 <rec.json>` (about 35 MB; the race leg of the fixture's roll, POST_CODE seed 1; it WON 99.2 s against 103.21 s before ruling
   A), then `node reference/qa-reports/ENG-27/clip-27e.mjs 5199 <rec.json> <out> sideways` and `upright` (about 1,900 shots each at 2x;
   ffmpeg joins them at 15 fps; its log names every shot where the boat's box is in view). Look at it whole. Known before you start:
   the first stretch of the race leg runs UNDER the out leg (race point 16519 to the out leg's x0 14049 on seed 1) where the out leg's
   painted earth is drawn over the race leg's river (stills 3), so the boat is hidden there until ENG-GROUND's ground paint lands; and
   the boat is drawn only over water (the lead's ruling (a)): over a bank it is behind the bank. Count and name the shots without it.
3. engine-core.md (ENG-27e's packet step 4, not reached): one line each: the pacer (shares, floor + cap, the floor uncapped on the last
   crossing, a docked boat stays docked, DOCKED 0, lay (A), the lane counts the wait river); pacerWaters closed at both ends; the post;
   'under'; w2NextArt; the home fixture; w2.ts banks() on the fall's own storey.
4. THE FULL SET on the final head (gates.md D96; run-gates-27c.sh): lockall --layouts 16 vs 0eefc707e (only the toy may move; ENG-27e's
   bank scan says no listed World 2 stage moves from banks()), funcheck same-run vs main, drawcheck (the pacer's window now also takes the
   rivers touching its ends: no new draw on a stage without a pacer). Any gate without a verdict is UNRUN.

## ENG-27e: what was done (each step, each plant)
- **Step 1, the Easy put-back (d3d1d3f15):** traced by trapping every write to his x/y at frame 2583: engine.ts:2971-2972, the teaching
  river's splash (`river.safe.backX/backY`), on a pond built by src/game/gen2/worlds/w2.ts `banks()`, which took the TOPMOST solid at each
  lip with no floor; on the toy's stacked legs the out leg's ground (id 10, y 680) starts at the race-leg pond's far lip (14821), so the
  splash set him 846 px up. riverAt was right; not one of ENG-26f's four x-only reads (none touches w2.ts), so nothing was cherry-picked
  (the lead agreed). Fix: a bank lies on the fall's own storey (from its height `y` down to LIP_RISE under it). Evidence it moves only
  the toy: all 744 falls and 576 log rivers on 2-1..2-10 x 16 layouts x both settings have one bank candidate per lip, none above y; on
  the toy 5 falls had two (Normal seeds 3, 4, 5; Easy 2, 5). Plants (legsHome.test, RED on 580344077: red-27e-pond / red-27e-play):
  a pond sets him back on its own storey (6 seeds x 2 settings; RED Normal seed 5 at y 730 on a 1503 bank); no one-frame lift off the
  race leg without a life (RED middle Easy seed 2, frames 2584 and 4112).
- **Rule 28:** tierBots 1-1 9/9 PASS. Easy castBots row for row: 2-3 (origin/t-build-23 + the fix) 160/160 identical to BUILD-23e's
  castbots23e-rows; 2-5 (on this base) 160/160 identical base vs head.
- **Step 2, the race table (before ruling A; race-27e-pre-ruling.txt):** middle Easy 12/12 WON (home Easy 2 now +6.3 s, was -0.1);
  middle Normal 10/12, LOST home 4 (-0.1 s; the fix moved it from +2.9: a different early pond changed his timing, and he fell at the
  last river: a hop off log 96's end at x 1353 toward the bank 125 px away peaked 19 px over its top and met its side, frame 4691) and
  post 4 (-1.0 s, the same on the base: three short hops into log rivers, x 13707, 6109, 2582); expert Normal 12/12 WON; ride-only 23/24
  lost, WON home Easy 1 by 0.43 s (on the base too). pacerLay.test was 3/4 on base AND head: ENG-27d's run stopped at its first
  assertion and hid the ride-only one. PUSHBACK-27e.md traced every miss to one root (a fall on the last river, then pacerReplace):
  (i) a DOCKED boat was rewound by a later fall (post Normal 1 and 3 ride-only had lost by 13 s and raced again); (ii) after a fall on
  the last river the race is one crossing, and the capped floor served neither guarantee.
- **The lead's ruling A (316a7a18e):** (i) pacerPiece.respawn: a docked boat stays docked (RED on the old piece: 95.37 -> 27.22,
  red-27e-docked-oldpiece); (ii) pacer.ts pacerReplace: on the LAST crossing (past the far bank of the river before the last) the floor
  holds uncapped; farther out the ride-only cap stands (RED on b05eeac5d: red-27e-lastcrossing). pacerLay.test: every race claim its own
  test (12), the ride-only claim names and excludes a fall on the last crossing, with why (the floor is the child's safety net; falling in
  is not winning without effort). GREEN 15/15; named: ride-only Normal 2 and Easy 1 fell on the last crossing and won (not judged).
- **Step 3, a find in the stills (b05eeac5d):** the waiting boat (and the boat setting off) was NEVER drawn: pacerDraw.ts pacerWaters kept
  rivers strictly inside the race point..dock window, and the river it waits over starts AT the race point; and pacerLay's lane (the
  lowest surface) left that river out, so a lower wait river was cut too (home seed 6). Fixed both; planted pacerBehindBanks 5 (wait
  and dock drawn whole, home and post, both settings, seeds 1-6; RED home Normal 1, then seed 6). ENG-27d's "seen at both ends" held in
  its lay test, not on the page.
- **Stills (stills-27e/, 2x, upright and sideways, fixture seed 1, Normal):** 1 the door shut with the letter in its slot; 2 at the door,
  open, +100; 4 the boat setting off beside him over the first river (drawn now, but DIM: this stretch runs under the out leg); 5 docked
  at the last river's far bank. **3, the boat waiting: NOT seen** (ROUGH, named): the out leg's painted earth covers the first race river
  under it (he stands in front of a wall of earth). The ground paint is ENG-GROUND's (t-eng-ground, not yet pushed when I looked).
  The clip: NOT made (the tool is ready, step 2 above).

## Gates (316a7a18e): tsc PASS; legsHome 7/7; pacerLay 15/15; pacerBehindBanks 5/5; postLay 3/3; tierBots 1-1 9/9 (on d3d1d3f15).
Every other gate UNRUN (THE FULL SET is step 4 above).

## What the 2-7 builder needs
- The dock rule: the boat waits with its bow at the far bank of the race leg's FIRST river that holds it whole and docks at the far bank
  of the LAST; the race is judged at the dock line; a docked boat has won and no later fall rewinds it; after a fall on the last crossing
  the boat keeps the setting's floor (Normal 2 s, Easy 3 s), farther out the floor is capped by the ride-only bound.
- The ground paint is ENG-GROUND's: until it lands, the race leg under the out leg is buried by the out leg's earth (the wait unseen).
- A soft fall's splash pond takes its banks on its own storey (w2.ts banks()); on stacked legs a lip can have two candidates.

## Learned (for the next engine member)
- A test that asserts many claims in one body hides every claim after the first miss: one test per claim (the lead's ruling).
- "Seen" proven in a draw test on a toy box is not seen on the page: shoot the state (wait, set-off, dock) on the real page, fresh page
  each (a spot that sets the race off spoils every spot after it).

Lessons applied: D57/D87 (ReadNotifications at every step and push; long runs in the background), D63 (the clip named NOT made, its
tool ready), D75/D101 (proven on the laid toy and the real page), D96 (gates named UNRUN, not passed), D102 (read by greps and ranges;
handed over at the lead's call), D105, D107, D109 (no clock times in messages).

# ENG-27d REPORT (handed over at the lead's D76 call, real context ~339k; written 12:59 PM ET 11-21 by date). Base 0eefc707e; branch t-eng-27
## EXACT NEXT STEP (ENG-27e, from t-eng-27 head; read only this section, D90)
0. Setup as ENG-27c's step 1 (npm install --legacy-peer-deps, restore package-lock.json). Probes kept here as .txt (copy to tools/inspect/
   with a leading underscore, never commit them): raceprobe-27d.ts.txt (`npx tsx tools/inspect/_raceprobe.ts middle|expert|ride home|post
   [seeds]`; expert has no Easy bot, so its Easy rows throw), racestart-27d.ts.txt (per-frame x/y/down/clock/checkpoint/softAt in a frame
   window), racetrace-27d.ts.txt (the bot's time at each flown mark against the estimate), jumps-27d.ts.txt (every frame he moves > 150 px).
   Stills: race-stills-27d.mjs (DSF=2 for 2x; PW=/opt/node-tools/node_modules/playwright/index.mjs; vite on 5199; shoot on-river spots LAST:
   a spot on a log carries him on the next spot).
1. **THE EASY PUT-BACK (the lead's ruling: fix it in this packet, Option 1; a PLAY change, so rule 28 applies).** Symptom: HOME_CODE Easy
   seed 2, middle bot: on the race leg he drops into the dip at x 14724-14821 (moss_stone piece id 42, top 1530, h 90; banks 14486-14724 and
   14821-15189 at 1470) and at frame 2584 he is set at (14891, 680), on the OUT leg's piece 14822-15102 (id 10), with no life lost and no
   bot rescue (rescues 0). The boat keeps racing, he walks the out leg and the column again, and he loses by 0.08 s. Same jump at frame 4112.
   What it is NOT: softFall/heartFall's softAt. softAt was ON the race leg {x 15000, y 1470, x0 14821, x1 15189} at frames 2570-2583,
   and only became (14891, 680) at frame 2585, after he stood there. No river, no safe pool (st.safeWater null), no down beat.
   NEXT CHECK: what moves him in the frame he is at (14788, 1500) falling into the dip. Suspects, by x alone on a stacked leg: (a) the
   side-push / unstick out of a solid's box (he enters id 42's box from the side and the push puts him on the top of the platform found
   by x: id 10 at 680); (b) a step-up or ledge-grab that picks the top surface at x without his y; (c) a kit's pit/pond set-back (w2Finish).
   Method: in racestart, at frame 2583 copy the engine, step once with a recorder on player.x/y writes, or grep engine.ts for code that
   sets p.y from a platform's y and a find() by x alone (`q.x <= p.x` without `q.y` near `p.y`). Fix the lookup to his leg (as ENG-27b
   did for riverAt), planted RED on this frame (a test: after the race leg's first flag, no frame lifts him from y >= Pacer.yMin to
   y < yMin without a lost life). The flag-as-put-back line the lead approved is NOT made: softAt was right, so it was not the cause;
   make it only if the trace shows a put-back reads softAt.
   Rule 28 after the fix: tierBots 1-1 still 9/9 (npx tsx --test tools/inspect/tierBots.test.ts) and a row-for-row castBots diff on Easy
   for the stages with committed rows (2-3: BUILD-23e rows on origin/t-build-23; 2-5 if on this base). Trace any moved row or narrow the fix.
2. **Then the race table, both settings, after the fix:** raceprobe on home and post, seeds 1-6, middle / expert / ride. Every number in
   the table; name the middle's thinnest win; any middle loss at 7%: which roll and why (racetrace: the mark where he falls behind,
   respawns, log waits). Then `npx tsx --test src/game/gen2/pacerLay.test.ts` must be 4/4 (its bot test is RED today on middle Easy seed 2,
   96.4 s against 96.32 s, from step 1's put-back). A table on lay (A) WITHOUT the fix ran into this session's scratch and is lost with
   it: do not quote it.
3. reference/handoffs/engine-core.md (step 5 of ENG-27d's packet, not reached): one line each on the pacer (shares, floor + cap, DOCKED 0),
   lay (A) (bow race point, wait and dock at far banks, pacerShoreFaults), layer 'under' (the lead's condition 3), the post (postLay's
   cuts, petals.ts marked letters), w2NextArt.ts, the home fixture (?fixture=home, DEV only), and the softAt finding from step 1.
4. THE FULL SET on the final head (gates.md D96; run-gates-27c.sh): lockall --layouts 16 vs 0eefc707e (only the toy may move), funcheck
   same-run vs main (World 1's 22 ruled lines are standing debt), drawcheck PASS (the lead's condition 2: 'under' adds one drawPieces pass
   over the pieces list, no draw on a stage without a pacer), the test-link floor. Any gate without a verdict is UNRUN.
5. Stills of the WAIT and the DOCK under lay (A) (the lead: "your stills show the start"): the boat waiting with its bow at the first wide
   river's far bank, him crossing beside it, and docked at the last wide river's far bank; both ways, 2x. Then THE CLIP (D63, ENG-27d's
   step 3, not reached): the race leg with the boat in every frame, both ways; the door and letter stills on the OUT leg (a HIGH pick).

## ENG-27d: what was done
- **Step 2, the boat behind the banks (2460568a9; the lead's ruling (a) and its follow-up):** a fifth piece layer 'under' in
  stagePiece.types.ts (doc: over the river's body, BEHIND the ground's earth and every platform), drawn once in render() before the drawn
  platforms, the water's sheet and the painted ground (no protoArt hook needed: the painted ground is drawn after all of them). The pacer
  is on 'under' and shows only over the race leg's water (pacerDraw.ts pacerWaters/pacerShown: clipped to each river's x0..x1), its
  waterline on THAT river's surface: the toy's leg has rivers 1427-1507 apart (seed 3), so the lane alone would sink it up to 80 px; its
  ~100 px over its waterline against banks 42-120 px over the lane would show over the grass without the clip. Planted
  (src/game/pacerBehindBanks.test.ts, 4 tests): RED with the boat on 'back' (drawn after the ground) and RED with the clip removed
  ('241 px of it over the bank 0-560: floating over the land'; the high river sinks it); pieceHook.test has 'under' in the frame order.
  Stills 2x, upright and sideways: stills-27d/1-slipping-behind-bank, 2-back-out-of-bank, 3-on-river (looked at: the bow goes under the
  bank's lip and reeds with no hard cut; the hull sits on the water; logs pass in front).
- **The lead's dock ruling, lay (A) (this head):** the race point is the boat's BOW (pacerDraw.ts pacerHull: the hull trails it,
  PACER_SHORE 20 px); gen2/pacerLay.ts waits it with its bow at the far bank of the race leg's FIRST river that holds it whole (its
  length from its art, pacerLength, + 20 px each end) and docks it at the far bank of the LAST such river, so the race is whole flown
  crossings (a first try timed from mid-river charged him a share of a log wait he never pays: the ride-only bot won by 0.5 s).
  pacerShoreFaults (general, by name): its hull at the wait and at the dock lies wholly over one river's water; planted RED in
  pacerLay.test on today's old ends (the column's foot and the exit, both on land). Pacer's doc updated. DOCKED 80 -> 0 (the lead
  accepted): the race is judged at the dock line; 80 px on a log was a free ~1 s (the ride-only bot won by 0.17 s on it); the lay
  test's dock check now asserts no verdict 20 px short and one at the line.
- **Found, not mine (the lead: a separate packet):** wherever the race leg runs UNDER the out leg, the out leg's painted earth is drawn
  down over it (protoArt ground soil runs to the foot): seed 1 POST_CODE x ~14000-18600, Pokey walks in front of solid earth and the
  river at 14173-14911 does not show. stills-27d/4-race-leg-under-out-leg-buried-x14950-*.jpg.

## Gates (this head): tsc PASS; pacerBehindBanks 4/4, pieceHook 8/8, pacerLay 3/4 (the bot test RED: step 1's put-back, named above).
Every other gate UNRUN (THE FULL SET is step 4).

## What the 2-7 builder needs (adds to ENG-27c's list below)
- The boat is seen only over water: its race leg needs TWO rivers that hold it whole (241 px + 20 each end), one near each end; a roll
  without is refused by name. It waits beside the first one's far bank and the race is judged at the last one's far bank, not the exit.
- Stacked legs: the race leg under the out leg is buried in the out leg's painted earth (separate packet) and an Easy put-back can lift
  him to the out leg (step 1). Do not judge 2-7's Easy race before step 1 lands.

## Lessons applied: D57/D87/D105 (notifications at each step; two rulings sat ~10 min once while I traced: own miss), D30/D109 (times
from date, none in messages), D63 (the clip is named open, not skipped), D76/D102 (read lean; handed over at the lead's call),
D86/D96 (every unrun gate named UNRUN), D94 (lock base 0eefc707e named). D101 and D107 are not written anywhere on this checkout.

# ENG-27c REPORT (hand-over at the lead's context line, written 11:17 AM ET 11-21 by date). Base 0eefc707e; branch t-eng-27; code head ad23f8b0a
## EXACT NEXT STEP (ENG-27d, from t-eng-27 head; read only this section, D90)
1. Setup: `npm install --legacy-peer-deps` (restore package-lock.json after). Probes and the stills script are kept here as files:
   raceprobe-27c.ts.txt (copy to tools/inspect/_raceprobe.ts), race-stills-27c.mjs (copy to tools/inspect/, run with
   PW=/opt/node-tools/node_modules/playwright/index.mjs, vite on 5199; the toy is on the page as `?fixture=home[&seed=n]` or __play('2-97')).
2. GATES: ENG-27c started THE FULL SET at 11:15 AM ET on ad23f8b0a (run-gates-27c.sh: chain1 tsc + suite shards 1-6 + CI tool tests +
   tierBots + tipwalk + funcheck + coverage/registry/generality/known/roadmap/time/artcheck; chain2 every seed list --check + paintcheck
   0-2 + build + chunkcheck + clipcheck + kbdcheck + drawcheck + buildcheck; chain3 lockall --layouts 16 base 0eefc707e vs head). Its
   verdicts are appended below under "Gates" if ENG-27c lived to see them; any gate not listed there with a verdict is UNRUN: run it.
   lockall: ONLY the toy may move (no shipped stage has a pacer, a post or a marked petal: petals.ts's change touches marked letters only).
3. THE LANE: RULED (a) by the lead 11:18 AM ET: the boat passes BEHIND the banks (drawn behind the bank's front face: it slips out of
   sight over each bank and comes back in the next river), never in the earth, never floating over land. A draw change: planted (a test
   that the boat is drawn before the bank's face where a bank stands over its lane, RED when drawn over it) + stills both ways. Before: stills-27c/ show the boat on its lane (the race leg's lowest river surface, y 1524): over a
   river, sideways, it reads well (race-bank-both-ways-small.jpg right); upright it sits at the screen's left edge. Over a BANK the lane is
   42 px under the bank top: the hull would sit in the earth (pieces/pacerPiece.ts layer 'back'). Options to show the lead: (a) hidden
   over banks (drawn behind the bank: it 'closes on every river', 2-7.md); (b) a lane in front of the banks' water strip (layer 'front' at
   the bank's foot); (c) lift it over banks (reads as flying). Then: the door stills (him at a slot on the OUT leg: race-stills' spot picks
   the LOWEST piece under x, so for the out leg use a 'high' pick; ENG-27c's door shot landed him on the home leg, deleted) and THE CLIP
   of the race leg with the boat in every frame, both ways (D63): a bot run (homeRun 'middle' with onFrame) recorded, or the page with
   tools/inspect/clip.mjs.
4. Name for the 2-7 builder (below, "What the 2-7 builder needs").

## ENG-27c: what was done
- **Step 1, the shares (ff60ced1b):** PacerRow.margin is a share of the careful middle's time: seconds = min(middle x (1 + share),
  rideOnly - under); W2_RACE.margin {normal 0.07, easy 0.1}; TOY_RACE deleted (the toy races on W2_RACE). Planted: pacerLay.test asserted
  the share first, RED ('normal seed 1: 112.91 s against 105.41 s x 4'), then GREEN.
- **The lead's ruling (b), the respawn floor (ad23f8b0a):** PacerRow.floor {normal 2, easy 3}; pacerReplace keeps max(share x left,
  floor) of margin over his middle time left, the floor capped at the ride-only bound's share of the way left (the ride-only bot WON Easy
  seed 1, 116.6 vs 117.59 s, on the bare floor; the lead ruled the cap stands, 11:13 AM). Planted both ways in pacerLay.test (a respawn a
  fifth from the dock keeps 2 s, RED without the floor; near the dock never past the ride-only bound, RED without it). pacerReplace is
  written so the start is exactly 0 (the share made the old form 1.4e-14).
- **Step 2, the art (ad23f8b0a):** 2-7's 7 frames packed into src/assets/w2-next/w2-next.webp (2313x357, 175 KB; pack-w2-next.py) +
  w2-next.json; 7 catalog rows (from t-art-next, file = the sheet's cells, status 'packed and drawn by id', part ENG-27c) and
  catalog_master.py --emit (w2.json: mailBoat/B, doorOpen; cast.json: letter/B, reply/B). w2NextArt.ts loads and draws by inventory id;
  stageManifest 'w2-next' for a stage with a pacer or a post (stageManifest.test planted both ways); stagePreload starts it. pacerDraw:
  two rowing frames (0.35 s each), waterline on the lane (0.85 of the frame, measured), bow first (mirrored running right). postDraw: the
  shut door w2-props#door 170 px wide (patientDoor's), the open one in its box; letters/replies flutter (0.3 s) at the sheet's 3 cut px a
  unit. World 2's tables name frames on their own (artuse sees them). artUse PASS, artcheck PASS, no code-drawn stand-in.
- **Step 3, NEW 2 the post (ad23f8b0a, from ENG-27b's patch):** the bot failure had FOUR roots, each traced on the bots' own runs and
  fixed, planted: (1) a far bank's slot in the landing of a jump off a LOG (expert Normal 1: off the log 106 px short of the bank, down 172
  px in, over the slot; walkedSpan has no log footing): postLay cuts a full run's jump off the log at the bank's edge, and the take-off
  onto a log ahead; (2) a piece between two gaps the expert DOUBLES across (expert Normal 3): cut a double jump's landing off the piece
  behind; (3) the played stage's petal pass (petals.ts screenExtras) TOOK THE LETTER (middle Normal 3: the letter, lowered to his middle,
  was the lowest petal nearest its neighbours): petalTrail never thins a marked letter (no shipped stage has one); (4) petals inside a
  slot's clearance give way to it (the nearest becomes the letter, the rest are lifted) instead of refusing the spot. The post runs on its
  own toy code POST_CODE ('A Pg1> Xw1> R Fg1> R /D ...': 2-7's longer way out): 11 of 12 rolls lay 2 doors, Easy 6 refused BY NAME (the
  test asserts the name and >= 11 of 12); HOME_CODE stays the legs/race toy ENG-27 measured (homeKit lays the post only on POST_CODE). The
  door test now walks between the two doors, then onto the second. postLay.test 3/3, legsHome 4/4, pacerLay 4/4 (incl. the race bots).
- **The page fixture:** homeFixtureStage.ts, `?fixture=home[&seed=n]` / __play('2-97'), DEV only (as the wheel fixture), POST_CODE.

## The race table (the toy, ENG-27c probe; boat at the ruled shares; Normal 7%, Easy 10%)
HOME_CODE before the floor (seeds 1-6): MIDDLE Normal won 1 (+0.2 s), 2 (+2.9), 3 (+0.6), 4 (+10.8), 6 (+0.8), LOST 5 (-2.7: 4 respawns,
then -2.4 s on the last two crossings waiting for logs, 70-90 px/s against the flown 104-126); MIDDLE Easy won all: +5.6, +5.6, +2.0, +3.7,
+0.3, +0.2; EXPERT Normal lost 1 (-0.1), won 6 by 0.04 s, others +3.8 to +9.1 (no expert bot on Easy); RIDE-ONLY lost all 12 (thinnest
Easy 1 by 1.0 s, Easy 4 by 1.4). POST_CODE (the longer way out), seed 1 Normal: the middle lost by 0.77 s before the floor. The floor
(capped) is in; the table was NOT re-run after it: re-run raceprobe on both codes (seeds 1-6) for the final numbers.

## What the 2-7 builder needs
- The race is THIN at a 7% share: on the toy the middle bot won 5 of 6 Normal rolls, three by under 1 s; a roll's log phase on the
  last reaches decides it. Run the race bots on every listed 2-7 seed (not 1-3) and expect to drop rolls the middle loses; (c) the boat's
  time from the roll's own log phases is the named refinement (the lead: later, not now).
- The post asks wide WALKED ground on the way out: a door never stands in a log's landing, a double jump's landing, beside a flag
  (140 px) or nearer another door than 360 px. 2-7's 6 doors need a long out leg of flat bank; a roll short of room is refused by name.
- The lane over banks is open (item 3 above). The hand build w2Stages.ts '2-7' is the builder's to delete.

## Gates (head ad23f8b0a; verdicts appended as they finish)
Started 11:15 AM ET. tsc PASS (7 s) on ad23f8b0a. EVERY OTHER GATE IS UNRUN: the lead stopped ENG-27c at 11:19 AM ET (D76, real context
~375k) with suite shard 1, the seed lists and the lock's base record mid-run (partial log tails in gates-27c/, no verdicts). THE FULL SET
is ENG-27d's, on its final head after the boat-behind-banks draw change (run-gates-27c.sh, the same chains).

## Learned
- A pickup the engine lays AFTER the trail's pass is planned can still be taken by the pass in the PLAYED stage (buildGen2Stage has no
  petal pass; generateStage does): compare the built stage with the played one (sim.e.collectibles at frame 0) before blaming the lay.
- 'On his path' must include where every tier is in the AIR: logs (no footing) and optional doubles are both outside walkedSpan.
- A rule added by ruling can break another rule of the same feature (the floor let ride-only win): run the whole feature's bots after
  every rule change, not only the test the ruling names.
- Proposed level.md rule: "every pickup a mechanic lays on the path is checked in the PLAYED stage by the bots of every tier".

## Unresolved, named: the lane over banks (lead's call); the door/letter-into-slot stills on the OUT leg and THE CLIP (D63); the race table
re-run after the floor; the gates still running; reference/handoffs/engine-core.md NOT rewritten by ENG-27c (context line): ENG-27d adds
the pacer (shares, floor + cap), the post (postLay's cuts, petals.ts letters), w2NextArt.ts and the home fixture.

## Lessons applied: D30 (times from date; one hand-typed time slipped in a message at 11:00 AM, own miss, corrected), D57/D87/D105
(ReadNotifications at each step and push; long runs in the background), D76/D102 (read lean, handed over at the line), D86/D96 (the
full CI list in the runner, verdicts by name, UNRUN named), D94 (lock against the integration base 0eefc707e), D103 (rulings read
between steps).

# ENG-27b REPORT (stopped by the lead at 10:46 AM ET 11-21, D76: real context ~369k). Base 0eefc707e; branch t-eng-27; code head 5a579bb16
## EXACT NEXT STEP (ENG-27c, from t-eng-27 head; read only this section, D90)
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after). Every engine step below is on THIS head.
2. NEW 2 the post: WIP, NOT committed as code: `git apply reference/qa-reports/ENG-27/ENG-27b-post-wip.patch` (post.ts, gen2/postLay.ts,
   pieces/postPiece.ts, postDraw.ts (no-op until art), gen2/postLay.test.ts; hooks in pipeline.ts layChaseStage + PIECES_OF, types.ts
   Collectible.mark 'letter'|'reply', gen2/types.ts GraphBrief.post, stageGenerator.ts GeneratedStage.post, engine.ts draw hook, w2.ts
   W2_POST_ART, toyHome.ts TOY_DOORS 2). State: tsc PASS; postLay.test tests 1-2 PASS (slot on path on 12 rolls, planted RED 60 px up;
   a door opens on the pass); test 3 (bots) FAILS on 'middle normal seed 1: every letter posted' after the LAST edit (the slot search
   from the walked span's middle out in 20 px steps, SLOT_CLEAR = 2 x PICKUP_APART). Before that edit the bots posted 9/9 but 4 of 12
   rolls were refused ('only 1 route piece'). Find which door the run lacks (scratch probe: compare homeStage(1).post with the played
   stage's sim.e.collectibles letters: the played stage once dropped a NEW letter 38 px from a petal; the slot search may now take over
   a petal the played assembly moves). Then the 12 rolls clean AND 9/9 bot runs, commit.
3. The race margin as SHARES (the lead's ruling, 10:46 AM): PacerRow.margin becomes a share of the careful middle's time, Normal 7%,
   Easy 12% (2-7.md: 3/42.1, 5/47.8 → 0.07, 0.10; the lead said 12% for Easy: use the lead's numbers); pacerLay.ts seconds = min(middle
   x (1 + share), rideOnly - under); W2_RACE.margin {normal: 0.07, easy: 0.12}; DROP TOY_RACE (toyHome.ts) and use W2_RACE on the toy;
   pacerLay.test asserts the share. Re-run pacerLay.test: middle 6/6 ahead, ride-only 6/6 behind (on 5a579bb16 with TOY_RACE x2.5 the
   middle won 6/6, thinly: normal seeds 1, 3 by 0.2 and 0.6 s; expert normal 2/3, lost seed 1 by 0.1 s after 5 deaths).
4. ART (the lead did not rule against): pack 2-7's 7 frames (w2-next#mailBoat, #mailBoatB, #letter, #letterB, #reply, #replyB,
   #doorOpen; cuts at origin/t-art-next:reference/art/hfnext/cut/{boat,boatB,letter,letterB,reply,replyB,door-open}.png, catalog rows
   in t-art-next's CATALOG-MASTER.csv, file 'origin/t-art-next:...') into src/assets/w2-next/w2-next.webp (ENG-ROCK's precedent:
   21af89b4e), rows' file + frame rects, `tools/art/catalog_master.py --emit`; then pacerDraw.ts drawPacer (two rowing frames on its lane,
   ~240 px long against Pokey's 89.1) and postDraw.ts drawDoor / drawPostItem by those ids (w2-props#door is packed already). No
   code-drawn stand-in. Pacer.lane is the race leg's lowest river surface: judge it on stills (behind the banks on layer 'back' it is
   hidden over every bank; the design wants it beside him in every frame: the lane is the open question, show the lead first).
5. Stills of the toy upright + sideways, the whole screen (the boat beside him on the race leg, a letter going into a slot, an open
   door) and a CLIP of the race leg with the boat in every frame (D63). REPORT: the race table, "What the 2-7 builder needs".
6. THE FULL SET (reference/methods/gates.md, D96) on the final head, the suite in shards, lockall vs 0eefc707e, every list --check,
   coveragecheck (the race and the post must price), registrycheck, paintcheck, generalitycheck, tierBots.test, funcheck.
## ENG-27b: what was done (10:48 AM ET)
- Lockall (NEXT STEP 2): 102/102 unchanged, base 0eefc707e vs f2705ecd, 3264 builds each, byte-identical (two --out runs compared by
  --check's logic). Nothing shipped moved.
- Steps 2-3, one root (647e172d9): towerRoute.ts towerCorners left a column's last turn for after the stage's last leg: the bot reached
  the home leg's end, walked 17,500 px back to the column through every river and home again (56-94 lives), and at the column's last
  storey read the way on as straight down through its floor (~13 s, rescued). Now a column of a stage of legs climbs its own last turn
  at its foot (keyed on gen2.tower.legs: up/down towers unchanged). ENG-27's suspect wet() by x alone was ruled out first (a y-aware wet
  changed 0 of 6 rows). Planted: legsHome.test 'the column's last turn...' RED without (seed 1), GREEN with; toy 9/9 finish, 0 rescues,
  1-6 lives; seed 2 left 4 lives vs 6 laid right.
- NEW 1 (5a579bb16): pacer.ts, gen2/pacerLay.ts (rivers matched to flown rows by speed + log length: no RiverZone change), pieces/
  pacerPiece.ts, StageStats.race (badges.ts: the verdict; the medal itself is the Designer's), W2_RACE, SKILLS.race / SKILLS.rideOnly
  (firsttimer.ts), pacerLay.test (4 tests, RED for each bound and an unflown row; the respawn re-place; the bots). Type additions for
  the lead's review: GraphBrief.pacer, GeneratedStage.pacer, StageStats.race (and, in the WIP patch, GraphBrief.post,
  GeneratedStage.post, Collectible.mark 'letter'|'reply').
- RiverZone.way (ENG-27's field): a river in a leg laid left keeps the screen's dir (what the engine moves logs by) but must be judged
  in its own frame: riverFaults reads 'upstream' and 'with him' from dir relative to the way he crosses, and without `way` a fair
  river mirrored left reads as flowing against him (legsHome.test 'judged in its own frame' plants it). The alternative, a dir in his
  frame, would change what every engine reader of dir does; one optional field read only by the judge is the smaller change.
## Gates (code head 5a579bb16 unless named)
| gate | result |
|---|---|
| tsc | PASS (5a579bb16) |
| lockall vs 0eefc707e (f2705ecd) | PASS 102/102 |
| suite shard 1/3 (647e172d9) | PASS 1285/1286, 0 fail |
| suite shards 2/3, 3/3 (647e172d9) | UNRUN at stop (running) |
| seedlist --check 1-1..1-8 (647e172d9) | PASS |
| seedlist --check 1-9, 2-1, 2-2, 2-4, 2-5 | UNRUN at stop |
| legsHome.test, pacerLay.test (5a579bb16) | PASS |
| tierBots.test, THE FULL SET | UNRUN |
## Learned
- A stage of legs breaks every tool that assumed the route ends at the last section (towerCorners' leftover turn): when a bot's route
  looks wrong, print the route's corners before tuning the bot (one print found steps 3 and 4).
- A race decided by an absolute margin is only as fair as the leg is long: state margins as shares (the lead's ruling).
- The played stage can drop a collectible the build laid (the post's new letter 38 px from a petal): test a NEW pickup on the played
  run (homeRun), never only on buildGen2Stage.
## Lessons applied: D76 (stopped at the lead's line), D86/D96 (the full list named, the unrun named), D94 (reds are this branch's),
D101 (proven on the rolled toy, played the game's way), D102 (read by greps and line ranges), D103.

# ENG-27 REPORT (stopped by the lead at 8:33 PM ET 11-20, D76: real context ~427k). Base 0eefc707e; branch t-eng-27; code head 458315ba
## (ENG-27's) EXACT NEXT STEP for ENG-27b: DONE through step 4 and NEW 1; see ENG-27b above
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after: it is tracked).
2. UNRUN, run first: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on 0eefc707e, then `--check lock-base.json` on
   t-eng-27: expect 102/102 unchanged (no shipped graph has a leg mark; levelCheck's run-leg rule and w2Finish's side read only flow 'legs';
   riverAt changes play, not layout). Then the suite in 3 shards (my run was on a mixed working tree: UNRUN), seedlist --check of every
   listed stage (riverAt + firsttimer.ts changed: D86's spread rule), tierBots.test, then THE FULL SET (gates.md) at ENG-27b's final.
3. Bots on the toy (step 0's last open item; `npx tsx reference/qa-reports/ENG-27/botTable.ts middle,expert normal,easy 1,2,3`,
   botTable-1.txt): seed 1 middle/expert finish both settings (192.8 s / 205.3 s, 2-4 lives, 1 rescue); seeds 2-3 drown in the HOME
   leg's rivers (56-94 lives, 900-1100 s). Seed 3 drowns with the home leg laid RIGHT too (probe18.ts: 76 lives): that roll's rows, not
   the left leg. Seed 2 is direction-sensitive (5 lives laid right, 56 left). First death traced (probe19.ts, t 92.1): he runs off the
   near (right) bank at full speed as a log slides out and lands in the 72 px gap. Suspect first: firsttimer.ts:2733 `wet()` reads
   rivers by x alone (the out leg's rivers lie over the home leg: use river.ts riverAt or the leg's own rivers), then the edge look
   (floorAt at p.x + dir*look). Re-run the table; planted toy: seed 2 left within 2x its right-laid lives.
4. The column rescue (every seed): the bot stands ~13 s on the down column's last storey (seed 1: x 18075 y 1217) and is rescued to
   the floor. towerRoute.ts towerCorners `within()` draws a straight diagonal down a no-vine descent (dropsDown): give it each storey's
   end, as it gives a vine field its vines. Planted: rescues 0 on the toy, seeds 1-3.
5. Then the packet's items 1-6: NEW 1 the mail boat pacer, NEW 2 the post, the `race` bot skill, the art by ART-NEXT-b's inventory ids
   (origin/t-art-next f4f724269, reference/qa-reports/ART-NEXT-b/REPORT.md; I did not open it: no id read, none wired), stills/clip.
## Step 0 (the READY toy, show first): DONE for the lay; bots partly (item 3-4 above)
- The toy: src/game/gen2/toyHome.ts `A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E` on World 2's ground and river rows; laid by
  gen2 on a listed test row (tools/inspect/homeToys.ts: withTestStage + plantSeedList + w2Finish, ENG-26's pattern, D75). Map with the
  middle bot's path: toy-map-s1-normal.png (toyMap.ts).
- Planted (src/game/gen2/legsHome.test.ts, 5 tests; legs.test.ts +3): RED same-ground `/L` overlay refused BY NAME on every roll both
  settings ("legs: leg 2 (left) overlays leg 1 (right) ..."); GREEN `/D /L` clean on 6 seeds x both settings, home leg >= LEG_CLEAR (260)
  under the out leg, rivers on it dir -1 way -1, out leg's dir -1 unmarked, >=3 flags and >=10 petals on it, same stage from same seed.
  RED evidence: red-base-0eefc707e.txt (base: the toy throws "a river in a leg laid left is not mirrored yet"; without the shrine fix
  0 petals; without the verdict the RED test fails).
- Engine changes (all general, no stage id: generalitycheck PASS): legs.ts reflectLeg turns a left leg's rivers, logs, splash-back and
  riding petals (tail / wheel pond / sluice refused by name); legOverlaps + LEG_CLEAR; pipeline.ts: no throw for left-leg rivers, the
  start's back wall when a later leg lies beyond it, the overlay refused alone in checkStage (no repair swaps: refuseNotThrow's rule);
  river.ts RiverZone.way (Architect's type: a field ADDED, flag for review) + riverAt/RIVER_DEPTH 120; riverLay.ts riverFaults judges a
  left-crossed river in its own frame; levelCheck.ts hop limit relative to him, 'past the shrine' by the stage's travel, no link between
  two run legs; engine.ts water check by riverAt (was x alone: a life every frame on the home leg under the out leg's river);
  w2.ts w2Finish splash pond on a left leg sets him back on its right bank; firsttimer.ts bots follow the lay's route on a stage of legs.
## Gates (head 458315ba)
| tsc | PASS | generalitycheck | PASS (26 literals, 26 known) | legs.test + legsLay.test + legsHome.test | PASS (25/0 at 8:30 PM ET) |
| suite (3 shards), lockall vs base, seedlist --check (all lists), tierBots, castBots, coverage/registry/paint, drawcheck/clipcheck | UNRUN |
## Found, open (named)
- Inspector phantom (pre-existing): findRoute hops from the out leg's last bank to a way-down column's floor through its wall (levelCheck
  drop links do not see walls; legsLay's DOWN_CODE too). Bots no longer follow it on legs; the meter/coverage tools still read findRoute.
- engine.ts:3607 a SEALED door pushes him back to x - 35, vx -140: wrong way on a stage that ends LEFT (2-7 is a sprint: never seals).
- The toy's home leg is ~3x the out leg (chunkSeconds fills); a level's lengths are its builder's.
## Polish check: no stills/clip of the real page yet (the toy map only). Pushback: none. Learned: an out-and-back puts one leg UNDER another,
and every "by x alone" lookup (river under him, past the shrine, wet ahead, falls' links) breaks: grep `x > r.x0 && x < r.x1` first.
Lessons applied: D30, D57, D59 (the suite named UNRUN), D75, D94, D97. Turnover note: engine-core.md §0zq-27 added (top), this commit.
