# BUILD-29 REPORT: 2-9 "The River King's Court" (the World 2 finale; R-165.449), release 6
Branch t-build-29, cut from origin/t-eng-29 = 098047713 (the lead's named base). Session 1 started 5:45 PM ET Thu 11/26 (by `date`).

## EXACT NEXT STEP (session 10 hand-over, BUILD-29-j, 10:38 AM ET Fri 11/27; head = this commit)
ReadNotifications first (D140); the lead has two messages from j to answer (the kid on Easy, below). Box 10 DID steps 1-4, 5 in part:
1. MERGED t-eng-29 7387d089a (B) at 0419d0736, no conflicts; tsc clean. CI tool line on a FROZEN tree of 0419d0736: 429, 427 pass, 1 fail,
   1 todo (chase bots ENG-B4, inherited). The fail was OURS (registrycheck: 2-9 drawcheck/seeds/flown): all three now in (below).
   (The first tool-line run was thrown away: D115, src edited under it; re-run on a frozen worktree.)
2. fly.sh (flown/quiet-j.txt): nothing counted over 4 s, Normal 1-6 (the shrine walk 5.41-5.68 raw, 1.34-1.40 counted). libstage 24 x
   both (flown/roll-j.txt): CLEAN 24/24 both, 0 thrown, no refusal. Easy wheel try easyV 114.24: 4.32 s, over (flown/easy-wheel-j.txt);
   the lead RULED: keep easyV 45.7; Easy's own quiet judge is the engine ask R-165.538.
3. KICK HINT (14bb9b41): socket t-kick, barge brick's quay t 0.7 (126 px from the lip), words in kitLib29's tips (KICK_29): 1694 px before
   the guard Normal, 1754 Easy (the river 984 px). Not refused: the kit had no words and no socket. Test on ALL 100 listed seeds both
   settings (with the guard test, a75c69455); plants RED (removed: 'found 0'; on the landing t 0.1: '168 px before the guard').
4. addlevel (bots/addlevel-j.txt, then -j2.txt after the judged row): list 100/100 --check PASS (version 243229eb; the relist came out
   byte-identical); FLOWN: flight-2-9-j.txt, normal-2-9 rows in flownArcs (within 0-7 px of 2-7's), judged on the row; registered
   everywhere. Pin grep 185 files; the 11 reading 2-9's list: 54/55, the red puzzleCamera 'leaving a room' = the same numbers on
   0419d0736, INHERITED (ENG-CAM29 R-165.513).
5. BOTS x40 (-j2): adult/child/middle 40/40 both, expert Normal 40/40; kid Normal 0/40 (rule 4: not softened); KID EASY 5/40: all 40 at
   the shrine, 0 hits, 35 fail on 1-4 rescues; every stuck place beside an uncleared snapper (dance 125, snappers 95, guard 7; 228
   kicked, 92 left; bots/kid-easy-j.jsonl). WHY it stalls is NOT traced yet. SENT to the lead with a reversible fix on Easy only (the
   dance wave at 2, or a pause stone before each snapper): WAIT 20 min for the ruling, then your own reversible call (CI #89).
RUNNING at hand-over: drawcheck with 2-9 as a scenario, same limits (flown/drawcheck-j.txt; read it, name every 2-9 call site).
NEXT: (a) the lead's kid ruling, laid + bots again; (b) drawcheck's result; (c) the FIRST-LOOK stills, upright first, from the committed
lay (a worktree, vite 5199, stills-at-setting.mjs; /tmp/claude-0/beats.ts printed each beat's x and draw path: banks 'ground' as on 2-5/2-7,
stones 'painted rock', snap stones own art, logs river art, the wheel own art, the barge a log in river art (G3)); (d) the full gate run
(step 8) on a frozen candidate, the lock as two runs on 7387d089a, 6 shards, every seedlist --check, clipcheck, tierBots, generalitycheck.
LEARNED (j): a stage's registry gate goes red on the CI tool line the moment its row enters the table: run registrycheck --stage before
the tool line, not after it. I edited src under a running tool line (D115 again): start long runs in a worktree from the first one.

## (superseded) EXACT NEXT STEP (session 9 hand-over, BUILD-29-i; QUEUED until ENG-QUIET's B lands on t-eng-29, still 28c848dbd at 9:33 PM ET Thu 11/26)
Head: this commit. ReadNotifications first (D140). The lead APPROVED all three proposals (below) and they are LAID (5286a1bc7): the gate
stone, the court wheel R120 V132.28 easyV45.7 N4 + a 150 px street + a 50 px step up, two barges + the guard at t 0.4; wheelflights
--write (only the court row moved: Normal step 1.67 s, Easy walk-off 2.73 s); AS LAID notes in 2-9.md; the code comments updated.
- NEW TEST (the lead's order): w2Arc29.test "the king's posted guard is laid on EVERY seed" (seeds 1-12 both, past the barge's river);
  plant t 0.6: RED ('normal seed 1: one posted guard (found 0)'). Tests on the changed rows: 68/68 (badges, wheel, w2, w2Arc29,
  stageBackdrops, w1NewArt, wheelChannel). tsc clean.
- Quiet re-flown on the laid tree (flown/quiet-applied.txt): over 4 s only the let-go 5.41-5.81 and the twist 5.65-6.83 (B's).
- Roll, libstage 24 x both (flown/roll-applied-i.txt): 0 thrown, every pool section laid, CLEAN 0/24: the ONLY refusing line is the
  quiet line, and Easy's rows carry Normal's (seed 1 both: '5.7 s ... at x 15020', the twist): the pair is judged together.
  Easy's own wheel ride (a turn 16.5 s) reads 10.5 s quiet in parts.ts easy, but quietJudge judges Normal only (listRules.ts:85).
- hint.2-9.kick (the guard's first-meeting line) is kept in dotLinesData but laid by no socket on the kit stage: nothing moved with him.
- ENGINE-WORTHY (the lead logs the row): a ruled enemy socket the engine refuses vanishes with no error.
NEXT, when B lands: merge t-eng-29 (no force, conflicts named); fly.sh once (expect nothing over 4 s); libstage 24 x both (expect
clean); then addlevel (seed list), bots x40 every tier (rule 28; every miss traced), drawcheck (2-9 is NOT in limits.json's five
stages: ask the lead how it is measured, D131), the FIRST LOOK stills (upright first, to the lead), the whole suite's totals.

## (superseded) EXACT NEXT STEP (session 9, BUILD-29-i; WAITING for the lead's ruling on the three quiet proposals, sent 9:28 PM ET Thu 11/26)
Head: this commit. ReadNotifications first (D140). Box 9 DID:
1. MERGED t-eng-29 at 28c848dbd (G6, COURT_SAG), no conflicts (c42447a23). judge29 + ENG-29's per-grip read on the merged head
   (flown/judge29-g6-i.txt, modelgrip29-g6-i.txt), seeds 1-3: every court liana at both grips (0.70, 0.95) has ONE early/late
   Normal >= 0.73 / 1.13 s, Easy >= 1.10 / 1.93 s (bars 0.20 / 0.30). PASS.
2. THREE DATA PROPOSALS flown together (probes/parts.ts = ENG-QUIET's, probes/fly.sh; quietOf's goal share applied), Normal seeds 1-6,
   worst stretch per beat (flown/quiet-c2-worst.txt; base quiet-base.txt; the diff is flown/quiet-c2.patch, NOT in the tree):
   - GATE 4.87 -> 3.46: a second stone on bank b (rock 'rb' at 0.5); the 400 px walk, Dot's tip and its distance stay.
     (Rejected: bank b 400 -> 150, worst 4.00 on s4, no margin: quiet-c1.txt.)
   - TERRACE 10.5-12.0 -> 3.59: court wheel R120 V132.28 easyV45.7 N4 (a bucket every two beats; flown wheelN4.txt: step 1.67 s, Easy
     walk-off 2.73 s) + the top street 300 -> 150 + a 50 px step up after it (rise 'z'): lift 184 + 50 px. N4 alone is 4.12-5.83
     (quiet-c1.txt: the walk after the wheel).
   - BARGE 5.45 -> 3.85: barge29 logs 3 -> 2 (river 1440 -> 984 px, a barge still every two bars). The posted guard is REFUSED at t 0.5,
     0.6, 0.8 with two logs (silently: guards NONE) and laid at t 0.4 on 24/24 both settings (guard-logs2-t0.*.txt, guard-c2.txt).
   With all three: seed 4 builds (it threw 'pool is spent' before), every seed both settings builds, tsc clean. Still over 4 s: let-go
   5.41-5.81 and twist 5.65-6.83 (B clears them, ENG-QUIET's lane). Stage total Normal 148-155 s (was 158-162).
NEXT: the lead's ruling per beat. If the lead is quiet 20 minutes: apply quiet-c2.patch on t-build-29 as my own reversible
recommendation (say so first). Then, once B lands on t-eng-29: merge it, wheelflights --write for the court row, re-fly the quiet line;
only then rules 28/29 (rolls clean 24 x both), addlevel, bots, drawcheck, stills, the suite. No bots, seed list or stills before.

## (superseded) EXACT NEXT STEP (session 8 hand-over, BUILD-29-h; STOPPED for the lead's ruling on the quiet line, stage-wide)
Head: this commit. ReadNotifications first (D140). Box 7 (BUILD-29-g) left no section here; its state is in the commit 16825e931 message.
Box 8 DID (each on t-build-29; files in flown/):
1. RULING (a), the court wheel on street 'edge' (w2.ts W2_WHEELS.court), flown with wheelflights --write: Normal R160 V58.79 N6 step
   3.33 s (floor 1.5), Easy walk-off 2.57 s (floor 2.5), a miss rides round. It does NOT clear the quiet line: the ride is half a turn on
   any street (route.ts:417-420 prices a wheel as half a period + half a turn; beats.ts:131 counts 0.5 s busy). At one bucket a bar
   (2.85 s, N6) that is 8.55 s. (guard-t0.3-edge.txt)
2. RULING (b), the posted guard: z t 0.3, 0.4 and 0.5 are refused on 14 of 24 seeds, both settings ('no clear ground', pipeline.ts:3681
   patchFor: the barge landing's safe spot). t 0.6 (336 px in) is clean, and the 'pool is spent' throws fall back to 1 (they were the
   refused post banning the barge section). The lead APPROVED the smallest passing t: t 0.6 is in w2Arc29.ts:182. (guard-t0.*.txt)
3. N4 wheels flown (probes/wheelN4.ts, wheelN4.txt). Normal, a bucket every two beats: R160 step 1.2 s and R140 1.37 s FAIL; R120
   V132.28 passes, step 1.67 s, ride + wait 3.56 s, lift 184 px (not 264). Easy at R120 (G4: one R): a bar 2.2 s and 3 beats 1.7 s FAIL
   the 2.5 s walk-off; 5 beats V45.7 passes, walk 2.73 s; 6 beats V38.08, walk 3.27 s.
   ROLLED in a frozen worktree only (court R120 V132.28 easyV45.7 N4 edge + guard t 0.6): 0 throws, but 0 of 24 clean, all on the quiet
   line (roll-n4-guard06.txt). NOT in the tree: the lead's condition was quiet <= 4 s.
4. THE WHOLE PICTURE (probes/quiet29.ts, every stretch over 4 s, not only the worst; quiet29-n4.txt). On seeds 1-6, all six of these
   are over 4 s on every seed: gate 4.9; let-go (beat 4 liana) 5.4-5.8; double (the twist) 5.7-6.8; terrace 4.1-5.8 (even at N4);
   barge 5.5; shrine 5.0-5.3. The drum's waits (a bar for ONE) read as nothing to do across the stage. Tuning one beat at a time is D148.
NEXT (the lead's ruling first; no data change until it comes): does a timed wait on 2-9's drum count as quiet in the time model (an
engine or inspector question: no rule is changed here), or does each of the six beats get something to do or a shorter wait (data:
the keeper and the designer)? Then rules 28/29 from step 1 (rolls clean 24 x both), G6, addlevel, bots, drawcheck, stills, the suite.
G6 LANDED (ENG-29-i, after this hand-over was sent): t-eng-29 = 28c848dbd (fast-forward from d1038af49; COURT_SAG in riverLay.ts
lockedDrops; stricter than the engine on Easy grip 0.95 at locks 0.88/0.90). Merge it (no force), then probes/judge29.ts 3 on the court
(>= 0.20 s Normal / 0.30 Easy both sides of ONE). ENG-29 probes/modelgrip29.ts + cmpgrip29.py read a court the way the engine lane did.

## (superseded) EXACT NEXT STEP (session 6 hand-over, BUILD-29-f; box clock reached)
Head: this commit. ReadNotifications first (D140). Box 6 DID: the liana note marked APPROVED (level.md, lead 11-26); R2 part 1 (the
stageTable row `'2-9': { kit: 'w2-29' }`, unjudged as the draft rolled; listed.ts KITS + WORLD; 5c2961080, listing tests 16/0); R2 part 2
STARTED (the hand-built 2-9 deleted: w2Stages.ts '2-9' + COURT_GOAL_29 + W2_PUZZLES '2-9' + bellGate/bellGallery/guard; w2Sections.ts
W2Plan '2-9', its flavours and its PLANS row; dotTips/dotLinesData hint.2-9.kick/court/guards; w2Stages.test's court test;
w2Puzzles.test's two court-bell tests; puzzleCamera.test's leave-the-room test RE-POINTED to the kit stage's own bell room (plain
ground; the court bell's engine code stays held there); P-03 (puzzleGateWall.test) re-pointed to the kit's gated room, 4/0; tsc clean.
FOUND by the 41 test files that name 2-9 or Dot's lines (301 tests, 296 pass, 5 fail on 2cb7b0a4a): listed through the game's own
config, 2-9 built NO seed of 24 ('node n7 "Pg1>": threat snapper*3: laid 5'): the draft's goal (GOAL_29, countSet) lived only in
draft29Cfg. FIXED in data: stagePlan.ts's 2-9 row in 2-5's form `{ ...S('gauntlet', ..., MISSION_29's words), count: 5 }` (the
keeper's mission too). That cleared 4 of the 5 (plainWalk x2, w1NewArt and P-03 all failed on that build). RE-RUN on 8500f85a0 (plainWalk + w1NewArt + puzzleCamera): 20 tests, 18 pass, 2 fail:
puzzleCamera (below) and plainWalk's one-jump steps, a 2-9 DATA defect (7 lines, seeds 1-3, Normal): the 50 px step at x 8724
(beat 4) and x 15210 / 15352 (the twist) a straight flick does not climb (4 of the 7 only leaning away; seed 2 x 8724 both ways).
It is w2Arc29.ts:158/:166 `rock('rc', 'c', 0.15)`: a 110-120 px moss stone 50 px tall on the court liana's far bank, 34 px past the lip
where he lands (the bank 340 px at y 770-838, the stone at y 720-788). The draft never met plainWalk (the seam has no stage row).
MY RECOMMENDATION (the lead's call: it moves the flown landing): `rock('rc', 'z', 0.5)`, the far bank's middle, as 'ra' sits on 'a';
then RE-FLY both lianas both settings (probes/oneMarginG.ts at 365 px, judge29.ts 3) BEFORE use (rule 24), then plainWalk on 2-9. ENGINE-WORTHY (rule 26, not coded around): puzzleCamera's
leave-the-room test on the kit's bell room: the camera's y jumps 54 px in one frame walking out left at 390x844
((3772.9, -494.0) -> (3757.8, -440.0); the bar is 24). 2-9's old room never hit it. The test stays as the honest check: it is RED
until an engine lane fixes the camera (or the lead rules a different room).
SHARDS on a6a74323a (frozen): s2 830/830 0 fail; s3, s4, s5 running at the hand-over (s4: 588 so far, its one 'not ok' the known
R-165.312 todo).
1. THE SUITE for a6a74323a: shards 2-5 were running in BUILD-29-f's container at the hand-over (frozen worktree); their totals go to
   the lead from it if it lives; if not, re-run 2-5 (CLAUDE.md glob, 661 files, sorted, `awk 'NR%6==i'`) + bargeRow.test.
2. G6: COURT_SAG was NOT yet on t-eng-29 (head d1038af49 at the hand-over). When ENG-29-i's hash comes: merge (no force; conflicts
   named), probes/judge29.ts 3, the court >= 0.20 Normal / 0.30 Easy both sides.
3. R2 part 2, LEFT (in order): (a) the keeper's words (origin/t-keeper-23-29 reference/story/lines-2-9.md): mission on the card
   (DONE: stagePlan.ts's row), the page
   (pokeyJournal.ts '2-9': "The whole court danced to the king's drum. I danced too, slowly, but on the beat. Then I rang his bell."),
   sealed (stagePlan.ts SEALED_LINES '2:gauntlet' = LINES_29.sealed), the journal card The King's Drum (DRUM_CARD_29), goalStart /
   goalLate as 2-3's GOAL_LINES_23 (read w2Arc23.test.ts:55-62 for how they are held), the old rows the keeper names
   (dotLinesData way.2-9 and its :171/:187 rows; read lines-2-9.md:28-40 first); the clue 'A Crooked Crown' STAYS; journalMet
   royal_guard ['2-9'] stays (the posted guard is the same guard, row 7). (b) w2Arc29.test.ts on w2Arc27.test.ts's pattern, the
   keeper's lines held verbatim. (c) the whole suite, then `npx tsx tools/engine/addlevel.ts 2-9` (it pins the list and runs castBots
   x40 both settings: run it AFTER G6 lands, rule 20). (d) drawcheck with 2-9, the FIRST LOOK stills at 2x, upright first, to the lead.
   (e) tools/inspect/draft29.ts and the DRAFT_ID_29 seam go once castBots runs on the listed '2-9' (new replaces old).
4. TO THE LEAD (information): with 2-9's court bell gone, World 2 has ONE puzzle room (2-8's cages); STAGE-RULES:188 asks for 2-3
   puzzle MOMENTS a world (the new 2-9's bell is a beat, not a room). stageSheets '2-9' ['foe:guard','foe:turtle'] kept (the posted
   guard and the snappers).

## (superseded) EXACT NEXT STEP (session 5 hand-over, BUILD-29-e, 8:36 PM ET Thu 11/26 by `date`; box clock reached)
Head: this commit (src as a6a74323a: the court lianas 365 px). ReadNotifications first (D140). Steps 0-2 of session 4 are DONE (below).
1. THE SUITE for a6a74323a = 9731ac221's 6 shards (the CLAUDE.md glob, 661 files, round robin `awk 'NR%6==i'` on the sorted list)
   + `src/game/gen2/bargeRow.test.ts` re-run (3/3 here; the ONLY test that imports w2Arc29.ts; no test reads level.md). Shard 0 on
   9731ac221: 607 tests, 606 pass, 0 fail, 1 todo. Shards 1-5 were running in BUILD-29-e's container at the hand-over: if their totals
   did not reach the lead, run shards 1-5 FIRST (frozen worktree, D115).
2. G6: when ENG-29-i's landing hash comes (t-eng-29), merge it into t-build-29 and re-run probes/judge29.ts 3 (needs no env now: the
   data is in the file) and the 6 shards; the court must still read Normal >= 0.20 / Easy >= 0.30 both sides (here, on wip dcd3c8452:
   Normal beat 4 0.93 / 1.13, twist 0.73 / 1.37; Easy 1.10 / 1.93 both).
3. (R2, ruled) LIST 2-9: mirror 2-7's two commits: 7c040dfd4 (stageTable row `'2-9': { kit: 'w2-29', judged: ... }`, the kit union,
   listed.ts KITS + WORLD with kitLib29) and 3c53f63b2 (the hand-built 2-9 deleted: w2Stages.ts '2-9' + W2_PUZZLES + COURT_GOAL_29,
   w2Sections.ts W2Plan '2-9' and its rows, stageSheets, stagePlan, dotLinesData/dotTips, the hand build's tests re-pointed; the
   keeper's words from origin/t-keeper-23-29 lines-2-9.md on the card, journal and find; a w2Arc29.test.ts like w2Arc27.test.ts).
   Then `npx tsx tools/engine/addlevel.ts 2-9` (READY or MISSING by file), drawcheck with 2-9 in its scenarios, the FIRST LOOK stills
   at 2x (the court, the barge, the twist, the home), upright first, judged as Matt on a phone; the upright ones to the lead.
4. Bots x40 both settings on the listed court (rule 28: every moved row traced against bots/castbots-9731ac221.jsonl). Only the two
   lianas moved (their length; x unchanged), so beat 4 and the twist are the rows to trace.
5. The kid (the 2-5 snapper bot gap) stays the bots' lane. Two copies of reference/design/2-9.md (t-design-29 and here, with beat 5
   and the AS LAID note): name it at the integration merge.

## Session 5 (BUILD-29-e): the court lianas, flown
- a6a74323a: both court lianas 410 -> 365 px (w2Arc29.ts `liana`, one length for beat 4 and the twist; top, reach, lock 0.90 unchanged).
  level.md gets a World 2 section: R1 written as the lead ruled (rule 4 judged in seconds for timing windows), and a liana note
  PROPOSED for the lead's retro.
- WHY (flown/court-sweep-normal.txt, the engine, the child's let-go HOLDVINE=1 RIGHT=1 FLICK=1, 4 bars, seed 1): at 410 the twist's
  grip 0.95 ONE drops in water j 0..+6 at 0.90 (as ENG-29-h read). The twist alone: 340 / 350 / 360 / 370 px all pass Normal (worst
  0.73 s), 380 gives 0.17 s late. Lock alone: 0.93 / 0.94 / 0.96 pass Normal (worst 0.57 s at 0.94 beat 4) but move beat 4 too.
  Easy's own build check (LIANA_RIVER.wait.easy 0.60 s, probes/build29.ts): 350 px refuses (0.63 s), 355-370 build seeds 1-3 both.
  G6's court judge (wip dcd3c8452, COURT_SAG; probes/judge29.ts) on beat 4: 340-395 px pass both settings, 410 Easy 0.07 s late
  (ENG-29-i's warning), 430 Easy misses ONE. 365 = the middle of where all three pass (15 px from 350 and 380).
- THE TABLE (flown/court365-s1..3.txt; probes/oneMarginG.ts = ENG-29's oneMarginR.ts with a GRIPS list; tree = t-build-29 + wip
  dcd3c8452 + probes/court-env.patch, XLEN=TLEN=365): ONE early / late in seconds, the same on seeds 1, 2 and 3:
  | liana | grip 0.7 | 0.8 | 0.88 | 0.95 |
  |---|---|---|---|---|
  | Normal beat 4 (x8099) | 1.00 / 1.50 | 1.03 / 1.07 | 1.07 / 1.07 | 1.10 / 1.07 |
  | Normal twist (x14671 / 14813 / 14955) | 0.80 / 1.30 | 0.87 / 1.30 | 0.90 / 1.30 | 0.90 / 1.30 |
  | Easy beat 4 (x8312) | 1.13 / 1.50 | 1.20 / 1.50 | 1.23 / 1.50 | 1.27 / 1.50 |
  | Easy twist (x15079 / 15191 / 15303) | 1.13 / 1.50 | 1.20 / 1.50 | 1.23 / 1.50 | 1.27 / 1.50 |
  Every ONE lands; the bar (0.20 Normal, 0.30 Easy) is cleared by 0.60 s or more. Easy is never under Normal in seconds (rule 4).
  (1.50 is the probe's +45-frame edge: the late side runs past it.) G6's judge at 365 (flown/court365-judge.txt): Normal beat 4
  0.93 / 1.13, twist 0.73 / 1.37; Easy 1.10 / 1.93 both; seeds 1-3 the same.
- NOTE: the judge is not yet wired into the build (at 410 the draft still builds with the twist's 0.00 s late), so "it builds" is not
  the gate; judge29.ts's printed margins are.
- ROLL (yield29.ts 1 40, a6a74323a frozen): Normal 40/40 clean, Easy 40/40 clean. tsc clean; bargeRow.test 3/3.
- NOT done this box: R2 (listing, drawcheck, stills), bots x40 on the changed court, shards 1-5's totals (running at the hand-over).
- Lessons applied: D115 (every run on a frozen worktree), D119 (no heredoc in a commit chain), D128, D134, D138, D140, D145 (the
  number names its flight), D146 (totals with the hash).

## (superseded) EXACT NEXT STEP (session 4 hand-over, BUILD-29-d, 8:22 PM ET Thu 11/26 by `date`; GO given; box clock reached)
Head: this commit (src as 9731ac221). ReadNotifications first (D140).
0. THE SUITE on 9731ac221 was running in BUILD-29-d's container at the hand-over (6 shards round robin, the CLAUDE.md glob, 661 files).
   If BUILD-29-d has not sent its totals to the lead, run the 6 shards on this head FIRST (CI #93: they go with any ruling request).
1. THE PLAN went to the lead as information (below, "Session 4"); two RULINGS to ask WITH the shard totals: (R1) rule 4 on the wide
   stones (Easy's share of the bar 39% / 64% vs Normal's 41% / 65%, its safe TIME longer: recommend judge in seconds, lay as is);
   (R2) the page's way in for drawcheck and the FIRST LOOK stills: `window.__play('2-9')` plays the OLD 2-9 (the draft has no
   stageTable row); recommend list 2-9 now with addlevel (new replaces old). 20 minutes with no reply: take (R2) on t-build-29.
2. On (R2): `npx tsx tools/engine/addlevel.ts 2-9` (READY or MISSING by file), then drawcheck with 2-9 added to its scenarios, then the
   stills at 2x (the court, the barge, the twist, the home), upright first, judged as Matt on a phone.
2b. THE LEAD'S FINDING (after the hand-over; ENG-29-h on the child's own let-go input): the TWIST's court liana (Normal x14389 on
   their seed; x14671 on seed 1 here, grip 0.95) misses ONE at lock 0.88 and 0.90, and at 0.92 has a one-frame late hole (1.00 / 0.10 s);
   x7903 (beat 4) is fine at 0.92 (1.07 / 0.70); Easy passes at every lock. Lock 0.90 does NOT clear the 0.20 s bar there. 2-9's DATA,
   this lane: change that liana's grip band (or its length, or the lock) so ONE gives >= 0.20 s early AND late on Normal at every grip
   the child can catch; FLY it with reference/qa-reports/ENG-29/probes/oneMargin.ts (origin/t-eng-29-wip) on the child's input before
   use, the table in this REPORT; then castBots child x40 both settings as the real-play check. (Matches box 4's own read:
   flown/lock29-090.txt, the twist ONE 0.06 s early at 0.90.) Do this BEFORE (R2)'s listing: listing re-pins on the final data.
3. The kid (rule 28, traced below) is the 2-5 snapper bot gap, not 2-9 data: name it to the lead as ENGINE-WORTHY; never soften Normal.
4. Two copies of reference/design/2-9.md (t-design-29 and here, with beat 5 and the AS LAID note): name it at the integration merge.

## Session 4 (BUILD-29-d): what was done, on which head
- Merged origin/t-eng-29 d1038af49 (be70f523e) then origin/t-eng-stone29 9506c2c39 (98bdb8739): no conflicts, no force. After each:
  tsc clean; the CI tool line (gates.yml:157) 427 tests, 426 pass, 0 fail, 1 todo (ENG-B4's chase-bot TODO), both times.
- 9731ac221: landing-g2g3.patch applied (the posted guard on the barge's far bank, barge29 look 'barge'); TEMPO_29 doubleIn
  ['w2-29-double'] (built: st.tempo.double = the twist section's [x0, x1) on both settings, seeds 1-2) and lock 0.90; the stones
  130 px (snap.w 130), Normal 62 px water, Easy its own twin rows at 92 (teach29e, two29e, wave29e); beat 5 TWO in step (two29/two29e);
  reference/design/2-9.md brought from t-design-29 562a8e719 with beat 5 and an AS LAID note (NAME IT: it is now on two branches).
- The far bank of the barge 300 -> 560 px, the guard t 0.75 -> 0.8 (FOUND by the roll: 19 of 40 a setting failed `posted: s14/guard
  ... no clear ground`: the stage's last flag (ROLLED_FLAGS.last 2000) lands on that bank, e.g. seed 7 Normal the flag at 27813 on
  the bank 27713+300, and the guard keeps SAFE_APPROACH 200 + 24 px from a flag; at 300 px both cannot stand there). Data, not engine:
  the engine refused by name, as G2 says it must.
- ROLL (yield29.ts, 9731ac221's tree): Normal 40/40 clean, Easy 40/40 clean.
- BUILT (rule 27, probes/widths.ts seed 1): beat 1 Normal 2 x 130 at 62 px, Easy 2 x 130 at 92 px; the pads 5 x 130 at 50.
- FLOWN (probes/stone29.ts = snapBand.ts at the court's gaps; flown/stone29-*.txt): Normal 130+62 2 in step [12--] 41%, wave x5 [12--]
  65%; Easy 130+92 2 in step [12--] 39%, wave x2 [12--] 64%, wave x5 [12--] 63%; 83-102 px all read the same on Easy. The design's counts
  hold (safe from ONE, TWO forgiven, never THREE). Rule 4: Easy's share is 2 points under Normal's at every Easy gap; in seconds Easy's
  safe time is longer (2 in step 0.39 x 3.30 = 1.29 s vs 0.41 x 2.85 = 1.17 s; wave 2.11 s vs 1.85 s). To the lead (R1).
- LOCK 0.90 FLOWN on the draft's own lianas (probes/lock29.ts, flown/lock29-090.txt vs -092.txt), seeds 1-3: beat 4 Normal window 1.90 s,
  ONE 0.37 s early / 0.57 late (0.92: 1.83 s, 0.43 / 0.51); the TWIST Normal 1.17 s, ONE 0.06 s early / 0.54 late (0.92: 2.20 s, 0.11 /
  0.48); Easy 3.20 s, ONE 1.58 / 0.64 both lianas. ONE is inside every window; the twist's early side is 2 frames at 0.90 (named).
- The keeper's lines-2-9.md (origin/t-keeper-23-29 e5f754d8d) has NO beat-5 line, so no "only on ONE" to re-approve.
- BOTS (tools/inspect/draft29.ts on a worktree of 9731ac221, no stand-in; bots/castbots-9731ac221.jsonl, 360 rows):
  | bot | Normal pass / min s / median | Easy pass / min s / median |
  |---|---|---|
  | expert | 40/40, 177.5, 195.6 | (no Easy profile in CAST_BOTS) |
  | middle | 40/40, 200.3, 214.1 | 40/40, 197.0, 211.2 |
  | adult | 40/40, 174.1, 182.0 | 40/40, 180.9, 189.5 |
  | child | 40/40, 351.8, 371.0 | 40/40, 267.0, 291.5 |
  | kid | 0/40 (38 stranded, 2 shrine), 237, 419 | 8/40 (40 at the shrine, goal full; 32 with rescues), 226.8, 260.1 |
  The 2-minute floor: every run of every tier is over 120 s (fastest 174.1 s, the adult on Normal).
- KID, traced (rule 28; probes/kidTrace.ts, with the fixture id 2-91): every miss is at a snapper (Easy 32/32, Normal 40/40).
  Easy s1: x 12103, f ~1900-2170, he walks up to the first snapper (patch 12138-12240), it goes alert/strike/rear, he backs and
  comes again, never bops, rescued. Easy s2: rescues at 12163, 13581, 23178 (beat 5's first and third snapper, beat 8). Normal s1:
  x 11670-11776, f 1820-2140, the same dither at the first snapper (11730-11832), bitten (foe:turtle 25 hits a run), stranded.
  2-5 (the same w2Cast snapper, listed): kid 0/40 both settings, every miss at a turtle (BUILD-25 castrows-2-5-25d.jsonl), "the kid is
  not the bar" there. The cause is the kid bot's foe skill against an on-beat snapper: a BOT gap (ENGINE-WORTHY, the bots' lane).
- drawcheck NOT RUN: it plays limits.json scenarios through `window.__play(<stage id>)`; the draft is not on a stageTable row, so
  '2-9' is the old stage. The dev fixtures (homeFixtureStage etc.) are engine code in App.tsx and stageGenerator.ts. To the lead (R2).
- BOX 3's open item 6 (a model name in 664f9e24f's trailer) stands; not rewritten.

## (superseded) EXACT NEXT STEP (session 3 hand-over, BUILD-29-c, 6:29 PM ET Thu 11/26 by `date`; the lead's HAND OVER NOW (helper cap); GO for laying not given)
The next box starts when ENG-29-f (t-eng-29) and ENG-STONE29 (t-eng-stone29) land. ReadNotifications first (D140).
1. **THE BARGE: ENG-29-f reads which of the four is false** (G3's own check, the lead's ruling). Box 3 already read it and sent it to
   ENG-29-f and the lead: the false need is **st.tempo**. On addc4a20 + 7cfbe307c (barge29 `look: 'barge'`), riverFaults on the barge reads
   look 'barge' on all 4 logs, no liana over, the SAFE stand true (bank right edge == r.x0, 420 px solid), st.tempo UNSET: the pipeline
   sets st.tempo only at the end of layChaseStage (pipeline.ts:4353), after checkAndRepair -> checkStage -> riverFaults (pipeline.ts:4417).
   Proof: with only bargeBound reading `st.tempo ?? st.gen2?.brief?.tempo` (scratch, frozen tree), the draft rolls Normal 40/40 and Easy
   40/40 clean (flown/yield-f-tempofix.txt; was 0/40). Built waits: Normal 5.700 s vs 2 bars 5.70 s, Easy 6.600 vs 6.60 s. No 2-9 data
   fix beyond `look: 'barge'`. Probe: probes/barge29.ts. ON LANDING: check ENG-29-f's fix is in, then roll the 40 x both settings.
2. **G2's socket shape is READY** as `landing-g2g3.patch` (w2Arc29.ts only: import W2_POSTED_GUARD, add it to SNAPPERS_29, a socket
   `{ id: 'guard', role: 'enemy', on: 'z', t: 0.75, allow: [W2_POSTED_GUARD.id] }` on the barge's far bank, and barge29 `look: 'barge'`).
   Proven in the scratch tree (seeds 1-3 both settings: one guard, post -1, uncounted, royal, 225 px into the 300 px far bank, 0 errors;
   probes/guard29.ts). Apply it (`git apply`) only after t-eng-29 with G2 + G3 is merged into t-build-29.
3. **The court, laid but the stones** (rule 27, built, seed 1 both settings, probes/widths.ts): pads 5 x 130 px with 50 px gaps both
   settings; wheel W2_WHEELS.court R160 (5c89954e1, flown); goal countSet 5 of 7 (laid). Stones still 80/30 (2-5's): when ENG-STONE29
   lands, the stones 130 px, Normal gap 60, Easy 50 (RULED A), then FLY them before use (CI #92: in step 3 safe only from ONE, the wave
   of 5 from ONE or TWO).
4. Met order on the landing-state tree (probes/teach.ts 1,2), both settings the same beats in order: gate hear logs pads let-go rest
   snappers double rest terrace dance rest quay barge shrine; w29.drum at 688, first stone 2210 (1,522 px, rule 6 holds), no foe before
   the snappers beat (first at 11,641 Normal s1); w29.roar 500 px into the twist.
5. NOT DONE (stopped by the hand-over): the bots x40 (draft29.ts, each bot its own background lane, kid adult child middle expert; on
   the landed tree with no --barge-stand-in), drawcheck on the draft (D131: drawcheck plays only limits.json scenarios; find the draft's
   way in or name the gap to the lead), and THE PLAN to the lead in under 20 lines. Then each engine hash as it comes: merge (no force,
   conflicts named), roll 40 x both settings, every error named.
6. Box 3's miss: commit 664f9e24f's trailer names a model (the packet's "never a model name in a commit"); later commits use
   `Co-Authored-By: Claude <noreply@anthropic.com>`. Not rewritten (no force-push).

## (superseded) NEXT STEP (session 2 hand-over, BUILD-29-b; STEP 0 (b)/(c) NOT yet sent as a whole; GO not given: nothing laid)
**RULED (A), the STONES (the lead's reply to box 2):** the court's stones are WIDE snap stones, 130 px: Normal 130 + 60, Easy 130 + 50,
flown again on the landed piece before use. A pieces lane, ENG-STONE29, builds a second flown snap-stone width (SNAP_LAY a 130 px stone
with its own gap band MEASURED on the real engine; snapFaults and rideLay's judge read the band per stone width; 2-5's 80 px stone
unchanged), landing on t-eng-stone29; the lead gives its hash to this box. Beats 5 and 8 are NOT re-designed. The lead's words: "The next
box lays everything else in the court (pads 130/50 as flown, the rest of the beats) and drops the stones in when ENG-STONE29 lands."
(Confirm with the lead that this is the GO for laying, rule 25, before the first laid line, if the GO message is not plain.)
0. Re-fetch t-build-29, t-eng-29-wip and the lead's branch; ReadNotifications (D140). THE GOAL IS RULED AND LAID: the lead's A (countSet,
   7 seated: beat 5 three, beat 8 four, goal 5 of 7, Easy easyMode's share), in the draft at this head; seeds 1,2,3,5,8 both settings
   roll with ONE error left, the barge's 'a log every 5.7 s, over 4' (+ its echo on Easy). READ THE LEAD'S REPLY on the STONES (sent
   this session): RULED (A), above.
1. ENG-29-e's G3 is on t-eng-29-wip 8d49caa27 (NOT landed on t-eng-29; its message: RiverRow look 'barge', w2-next#barge, logW 384 ->
   ~504 whole; riverFaults judges a barge row by 2 bars of the stage's tempo (riverLay.ts BARGE_BARS) ONLY when the brief has a tempo, no
   liana hangs over that river, and the near bank is a SAFE stand). To roll on it before it lands: a frozen worktree of t-build-29 with
   8d49caa27 merged in (never merged into t-build-29 until the lead says), the draft's barge29 row `look: 'barge'`, its bank 'a' a plain
   bank (it is): then the yield `npx tsx reference/qa-reports/BUILD-29/probes/yield29.ts 1 40` must be 40/40 clean both settings.
   BOX 2 TRIED IT (scratchpad worktree wt-g3 = 51157a6f0 + merge of 8d49caa27, the barge29 row `look: 'barge'`; flown/
   yield-draft-51157a6f0+8d49caa27.txt): 0 of 40 clean, and the ONLY rule on all 40 rolls both settings is still the LOG beat's 'a log
   every 5.7 s, over 4' (the top-up's snapper errors are GONE with the goal ruling: 40 of 40 have no other error). So riverLay.ts:199's
   `bargeBound` is undefined on the draft's barge: one of d.look (the built DriftInfo's look), st.tempo, `over` (a liana over it) or
   safeStand (riverLay.ts:197: a solid whose right edge is within 2 px of r.x0) is false. FIRST: read which, with a committed probe
   file (not `tsx -e`, which hung), then: if it is the stand (likely: the river 'c' is laid `after: 'a'`, its x0 may not meet the bank's
   edge within 2 px) or look not carried, it is ENG-29-e's (message them with the numbers, rule 26); if it is the draft's data, fix it.
   Also check 456 px / 80 px/s = 5.70 s against 2 bars x 2.85 = 5.70 s: equal, inside the +1e-6 bound, but Easy is 462/70 = 6.6 s
   against 2 x 3.3 = 6.6 s: equal too; a hair over on either is a refusal, so read the built spacing.
2. G2 is on t-eng-29-wip 232f2bcbe (NOT landed; ENG-29-e's note): add W2_POSTED_GUARD (w2Cast.ts, id 'royal-guard-posted', tag
   'posted') to SNAPPERS_29's creatures and an enemy socket on beat 10's landing piece (the barge's far bank 'z') with allow
   ['royal-guard-posted']; laid both settings, from no threat, never cut on Easy, faces the nearest river, Enemy.uncounted (out of the
   goal, the HUD and the sealed exit); patchFor keeps him 224 px from a flag on that piece and off its jump clearance, else the roll
   fails by name. journalMet royal_guard stays ['2-9']: KEEP stageSheets 'foe:guard' and journalMet's royal_guard off the deletion list.
2. ENG-29-e's G1/G2/G3/G6 notes (t-eng-29-wip): when G3 lands, re-roll WITHOUT the stand-in; when G2 lands, the guard on beat 10's landing.
3. READY-29 on the draft, each ONCE on a frozen worktree of the head (git worktree add --detach; chattr -R +i src tools; node_modules
   symlinked), each lane its OWN run_in_background call (never a shell '&'):
   - the bots x40: `npx tsx tools/inspect/draft29.ts --seeds 1-40 --bots <bot> --barge-stand-in` one lane per bot (kid adult child
     middle expert; about 3 s a run): every tier at the shrine both settings, no run under 120 s, each tier's FASTEST clean run named,
     every miss traced (rule 28: two runs a cause, seed, x, frame, what took him). Session 2's partial look (top-up goal, superseded):
     adult Normal 12/12 at the shrine, 153-168 s; `pass` false on seeds 3 and 8 though at the shrine: read why (goal got 5 / 6 of 5).
   - met order (D130) and teach-first: `npx tsx reference/qa-reports/BUILD-29/probes/teach.ts 1,2` (tips from gen2.fills, sections,
     enemies, all BUILT). Session 2 (top-up goal): `w29.drum` at x 688, the first stone at 2210: 1,522 px before (800+ holds) on both
     settings; `w29.roar` 500 px into the twist. BUT Normal's top-up seats a snapper at x 2000, between the drum tip and the first stone
     (rule 6 'nothing that hurts in between' and rule 7 fail): re-read after the goal ruling (countSet lays no top-up).
   - drawcheck on the draft (D131) and yield done in step 1.
   - FLOWN AGAIN on 098047713 (rule 24): `reference/specs/sims/court29.ts` (copied from t-design-29) in the frozen worktree
     scratchpad/wt-base; this session ran `beat` on both settings (results below if they landed; else re-run): the stones at 30 px,
     the pads at 50 (margin 0.67 / 1.07 s on the design), the run row; then `hop` (119 px). The court wheel is FLOWN (below).
4. Send STEP 0 (b) READY-29 and (c) THE PLAN (the table below, as ruled, with each tier's fastest clean run and the deletion list), then
   WAIT for GO.

## Session 2 (BUILD-29-b), done, each pushed to t-build-29
- 894031cb5 snap stones at 30 px (the lead's (vi): rideLay's snap judge's 74 errors a roll gone; pads stay 50); the draft's goal 5 on its
  config (GOAL_29; the hand build's config said 15 and topped up to 17).
- 5bf40bc3f deal exact (2-6's form) + the snappers brick content 'ground': gen2 had served the pads brick to the `Pp1&>` node and the
  snappers brick to `Pf1>` (both practise + floating): 'content p: no piece on a clock laid' and the snapper asks gone; every roll of
  seeds 1-2 both settings lays gate hear logs pads let-go rest snappers double rest terrace dance rest quay barge shrine.
- 5c89954e1 the court wheel a World 2 row W2_WHEELS.court {R160, V58.79, easyV50.77, N6, in} (the lead's G4), FLOWN
  (`npx tsx tools/engine/wheelflights.ts --write`; only its 2 rows added): Normal turn 17.1 s, bucket 2.85 s (a bar), board tap 100%,
  step-off 3.93 s; Easy turn 19.8 s, bucket 3.30 s (Easy's bar), step-off 4.87 s (Easy never tighter, rule 4; 2-6's floor 1.5 s).
- 553de213f tools/inspect/draft29.ts (tempoToys' onToy on the draft; fixture id DRAFT_ID_29 '2-91' because withFixtureConfig refuses
  the game's own 2-9, whose config would top up to 17); `--barge-stand-in` lays the barge as a court river (the game's roll refuses
  every unclean seed, and the barge is unclean until G3).
- The 40-seed yield (head aa4c5b1a7, top-up goal): 0 of 40 clean on both settings, the barge on 40 (alone on 19); under it the top-up's
  snappers: 'snapper*2: laid 3' 20 rolls, 'a floor over its ground' 6. Sent to the lead as the GOAL ruling.
- FLOWN AGAIN on 098047713 (rule 24; t-design-29's court29.ts `beat`, frozen worktree; flown/beat-{normal,easy}-098047713.txt), a
  RUN row (right held, a tap on every beat B 0.71 s Normal), floors 130 px: Normal G30 clean, pad margin 0.70 s, a beat late 0.43 s,
  2 in step from count 1-2 (47% of phases); G50 clean, margin 0.67 s (= the design), a beat late 0.43 s; G60-70 clean but a beat late
  SWIMS; G80+ swims. Easy G30 clean, margin 1.07 s, a beat late 0.90 s; G50 the same (1.07 / 0.90; = the design). So the stones at 30 and
  the pads at 50 fly clean on BOTH settings at the run pitch, Easy never tighter.
- BUILT widths (rule 27; probes/widths.ts, seed 1 both settings): the pads are 130 px at 50 px water (= the sim's W130 G50: clean, margin
  0.67 s Normal / 1.07 s Easy, the design's numbers HOLD). The snap STONES are 80 px at 30 px water (pitch 110 px), NOT the design's
  130 + 60 (pitch 190). **FLOWN at W80 G30 the stones LOSE the design's counts** (flown/beat-*.txt, RUN W80 G 30): Normal 3 in step
  safe from count 1 or 2 (45%; design: only from ONE, 16%), 5 in step safe from ONE (17%; design: never), the WAVE of 5 safe ONLY from
  count 3 (22%; design: from ONE or TWO, 65%); Easy the same shape (wave x5 from 3 only, 22%; wave x2 from 2 or 3, not ONE). The
  design's counts come back at the 190 px pitch: Normal W80 G110 (3 in step from ONE 16%, wave x5 from ONE/TWO 65%) but a beat late
  swims and Easy W80 G100-110 swims; W130 G60 Normal holds them (the design's row). rideLay's snap judge refuses anything but 30-40 px
  beside a stone. SENT TO THE LEAD (a design-level ruling: beats 5 and 8 as designed cannot be laid with 80 px stones at 30).
- The hop (flown/hop-*.txt): Normal a tap at a run 0.43 s, 119 px (= the design); from a stand 106 px; 0.28 s on the floor between
  beat hops. Easy 0.43 s, 119 px; 0.39 s between hops (Easy's beat 0.82 s).
- MY MISS, owned: the first bot lanes went up as ONE background run with a shell '&' and `wait` (the box's rule: never). Stopped at
  once (pkill; 0 left), re-run as one background call a bot; then stopped again for the goal finding (their numbers are superseded).

## Session 1 hand-over (history; its steps 0 and 3 (i)-(vii) are done or ruled above)
THE LEAD HAS RULED (its message after G1-G3): G1, G2 and G3 (option A, look 'barge') go to ONE pieces lane, ENG-29-e on t-eng-29; YES
to pads and stones at 50 px on both settings (Normal's stones FLOWN at 50 in READY before use); after GO lay every beat that needs none
of G1-G3; beat 6 and the guard wait for ENG-29-e. G4 (the wheel's Easy R) and G5 (the 's' letter) were sent after: read its reply.
0. G5 decides how the draft's node string is written: if the lead rules (B), the draft's ARC_29 writes the two liana beats `Xr1>:#water`
   and `Wr1>:#water` (2-4's letter) and the REPORT names the change from 2-9.md:50; if (A), wait for the lane's TYPE_OF_LETTER 's'.
1. Re-fetch t-build-29 and the lead's branch; ReadNotifications (D140); read the lead's replies (G4, G5).
2. Read the base gates' results: scratchpad gates-base/summary.txt is LOST with this container, so if the lead has no numbers from
   session 1 for the CI tool line, re-run it once on a frozen worktree of 098047713 (`git worktree add --detach`, chattr +i all but
   src/game/gen2/proven, run_in_background): the 6 `npx tsx` lines of gates.yml's `rolled` job. Session 1's results so far are below.
3. THE DRAFT EXISTS (session 1): `src/game/gen2/worlds/w2Arc29.ts` (2-5's brick form; test seam only, nothing imports it; tsc clean,
   listed.test 3/3, generalitycheck PASS). Rolled once a setting, seeds 1-2 (`npx tsx reference/qa-reports/BUILD-29/probes/draft1.ts`):
   it BUILDS (26.6-27.4k px; Normal 17 enemies, Easy 11; target 15 = the hand build's config, not yet 2-9's goal) with 33-41 gen2 errors
   a roll, by kind. DONE in session 1 (710f7ed59 + the next commit): the lead's rulings G4 (wheel `court29` R160 both settings), G5 (B: `Xr1>`,
   `Wr1>`, a change from 2-9.md:50) and the lock 0.92 (READY (a), TEMPO_29.lock); (i) and (ii) below. The re-roll's errors left: (vi) 74,
   (iii) 26, (vii) 6, (iv) 6, and the P/C beat nodes ('content p: no piece on a clock laid'; 'threat snapper*2: laid N'): the pads brick
   and the snappers brick are both practise + floating, so gen2 may serve either to any P node; give each beat's brick what only its node
   asks (read pipeline's node-to-section match first). FIX IN DATA (mine, in order): (i) the node string's `&turtle*2` -> `&snapper*2` (the cast's id is `snapper`, as
   ARC_25; 'no creature of that id'); (ii) beat 4's river DEEP (`court`, not `court29s`): its node `Xr1>:#water` asks deep ('hazard
   #water: laid soft'; 2-9.md:55 said splash-back, the node string wins: name it); (iii) the snapper patches clear of every higher floor
   in the bonk's landing ('cast: turtle ... a floor N px over its ground'); (iv) fly the court wheel: `npx tsx tools/engine/wheelflights.ts`
   and commit its table ('has not been flown'); (v) the beat-nodes' clocked piece ('content p: no piece on a clock laid'): read which
   node, the weight pads are not a clock (ENG-29d's skip). TO THE LEAD FIRST (rules, never loosened by me): (vi) **snap stones at 50 px
   are refused**: rideLay's snap judge holds 30-40 px of water beside a stone ('not 30-40 (one tap hop)', 74 a roll): the lead's YES to
   50 px holds for the PADS only; my recommendation: stones at 30 (2-5's flown row) and the court's shares flown again at 30; (vii) **the
   barge's log every 5.7 s is over the river judge's 4 s** ('a log every 5.7 s, over 4'): a barge is a carrier, not a log to time; the
   rule's exception for a `barge` look belongs in ENG-29-e with G3, or the barge row becomes two logs a bar (the lead's call).
4. When the draft rolls with no errors: a READY tool `tools/inspect/draft29.ts` on tempoToys.ts's pattern (onToy: plantSeedList + withTestStage + castRun) and run, each ONCE:
   yield first (D125: tools/engine/yield.ts's measure on the draft), drawcheck on the draft (D131), castBots x40 both settings, met order
   (D130: first met, never first by x), teach-first (Dot 800 px+ before beat 1), and FLOWN AGAIN on 098047713 (rule 24): the run row's
   hop 119 px, pad and stone water at 50 px on BOTH settings (my proposal, below), the pads' margin (0.67 s / 1.07 s), the court
   lianas' locked let-go window (riverLay.ts:376 lockedDrops(...).window on each built court liana: 2-9.md's 2.00 / 2.40 s came from 2-1's).
5. Send STEP 0 to the lead (a) gates (b) READY-29 (c) THE PLAN, then WAIT for GO. The level is not laid before GO.

## STEP 0 so far
### (a) Engine gates on the base 098047713 (frozen worktree, chattr +i, 0 chattr errors)
- tsc: exit 0. generalitycheck: exit 0. coveragecheck (tools/difficulty/coveragecheck.ts): exit 0.
- The tempo/drum toys + listed.test (gen2/tempo, gen2/tempoToy, tempo, tempoResume, drum, drumBus, drumEngine, gen2/listed): 32 pass, 0 fail.
- The CI tool line (gates.yml `rolled`): line 1 (the tool tests) 427 tests, 0 fail, 1 todo (= ENG-29's count); lines 2-4 (tipwalk, storyTipScan, teachFirstScan) exit 0; lines 5-6 (registrycheck, tierBots) running at hand-over: re-run them once if no result reached the lead.
- Inherited and named, never BUILD-29's: firstTimerBot.test.ts:177 KID_RUNS_59 (R-165.473 / R-165.477, the release line's own).

### Gaps found (sent to the lead at once, rule 26; ENGINE-WORTHY; none coded around)
- **G1 the twist's doubled drum has no data path** (the lead's (c)): the node string has `Ws1>:#water` (beat 6). TempoSpec (tempo.ts:19-28)
  has no span where the drum doubles; engine.ts:642-647 drumStep calls sound.drumTick(b, gameTime) with no `doubled` (conductor.ts:563
  defaults false); drum.ts:14 drumHits(doubled) exists but nothing reaches it. The `double` river row (speed 140, log 127.5 = 1.425 s =
  two beats; Easy keeps court's 70/159, one log a bar) is plain data, no gap. A pieces lane builds: the field, the engine passing it on
  both settings, a toy (hits within a frame of the half-beat inside the span; RED with the field ignored).
- **G2 the posted royal guard** (PICKS-29-32.md:50-62, the lead's rulings (1), (4), (5)): gen2 cannot lay it (w2Cast.ts:15 lays the plain
  turtle only; the one royal spawn is the hand build's guard(), w2Stages.ts:193, which goes), and goals.ts:77 goalCounts counts every
  enemy, so a posted guard would enter the gauntlet's count. Needs a posted-royal cast row and an out-of-count field read by goalCounts,
  the sealed exit and the HUD.
- **G3 the barge's look**: RiverRow.look is only 'raft' (riverLay.ts:42); w2-next#barge (deck 386, whole 507) needs a `look: 'barge'`
  draw path; no `barge` frame is in src/assets/w2-next on this base. Lead's call: (A, recommended) the G1 lane; (B) the builder with the pack.
- **G4 Easy's wheel radius** (2-9.md:23-24: Normal R180, Easy R160): WheelRow (wheelLay.ts:32-39) has one R for both settings (easyV
  only). Found after the message; goes to the lead in STEP 0. My recommendation (reversible, data): R160 on BOTH settings (Normal
  V = 2*pi*160/17.1 = 58.8 px/s, one bucket a bar), flown on the real engine for Normal's step-off before it is used (2-6's floor 1.5 s);
  else a per-setting R path in the pieces lane.
- **G5 the node letter `s` (swing) is UNLAID** (found after the G4 message): nodeLetters.ts:67 `s: { name: "swing", ..., unlaid: "the swing
  vine (liana) as a content block: its emitter keyed by letter is not built" }`, and nodeAsks.ts:40 TYPE_OF_LETTER has no `s`, so
  askMisses (nodeAsks.ts:131-133) names every `Xs1>` / `Ws1>` node "Later: the swing vine ...": 2-9.md:50's string passes checkCode but
  its two liana beats cannot be laid as written. 2-4 wrote its liana beats with `r` (ARC_24 'A Tr Pg Pr Xw R Pf Wr ...', content
  'rope'). Lead's call: (B, my recommendation, data, reversible) the draft writes `Xr1>:#water` and `Wr1>:#water`, the bricks content
  'rope' as 2-4's; (A) the lane maps `s` to a type. The other letters lay: p (CLOCK_LETTER, a clocked piece: stones, pads, wheel
  buckets), w, f, b; `Uc^<` asks every section of the node be 'climb', so the wheel brick is typed 'climb' (2-6 typed its wheels 'rope').
- NOT a gap (the lead's YES): Easy's 50 px pad water: lay pads and stones at 50 px on BOTH settings (Normal flew clean
  over 30-70, 2-9.md:10-11); Normal's stone shares at 50 must be flown (they were flown at 60).
- ENG-29's NEW item, the child's ~1.25 lives a run on the run-pitch pads on Normal: it WILL show on 2-9's draft (beat 3 is a 5-pad run
  row; the toy's was 4). Rule 4: Normal is never softened for the child; READY measures it on the draft and names it.

### (b) READY-29, measured so far: ENG-29's STILL OPEN (a) and (b) on the court liana 2-9 lays at beat 4
2-9's beat 4 is the toy's liana: 2-4's `first-drop` (anchor 165 px past the bank, 410 over, 410 long) over the `court` row, locked at
COURT_TEMPO.lock 0. Probe `reference/qa-reports/BUILD-29/probes/oneLock.ts` (committed; the tempo toy, seeds 1-2, every court liana,
riverLay.ts lockedLianas; the "sides" = how far the LIANA'S PHASE may move against the bar, each way, before a press on ONE misses:
the lock's margin, NOT a press's lag: a later press also moves the river, so ONE's place inside the press window is NOT yet measured,
and lockedDrops does not report it; the window and share columns ARE lockedDrops' own press-time numbers), on 098047713:
| lock | Normal window / share | ONE early / LATE side | Easy window / share | ONE early / LATE side |
|---|---|---|---|---|
| 0 (today) | 1.23 s / 77% | 0.66 s / **0.29 s** | 1.97 s / 91% | >= 1.65 s (probe cap) / **0.31 s** |
| 0.935 | 1.83 s / 81% | 0.47 s / 0.47 s | 2.10 s / 93% | >= 1.65 s / 0.53 s |
| 0.92 | 1.83 s / 83% | 0.43 s / 0.51 s | 2.13 s / 95% | >= 1.65 s / 0.58 s |
(identical on every court liana of seeds 1-2, 18 lianas a setting.)
- **(a) the let-go window:** at today's lock 0 ONE lands, but the lock sits 0.29 s (Normal) / 0.31 s (Easy) of phase from where ONE
  stops landing, and the press window is 1.23 s Normal (2-9.md's 2.00 / 2.40 s came from 2-1's liana and do not hold on 2-4's). At lock
  0.92 the window is 1.83 s Normal / 2.13 s Easy and the lock's margin 0.43 / 0.51 s. PROPOSAL (the lead's call): (1) the court's lock
  0.92 (data: one number in 2-9's tempo), (2) a gate on the window AND on ONE's place in it: lockedDrops reports ONE's early and late
  margin (a small add, a pieces lane: today it returns only `one`), and tempoFaults refuses a court liana whose press on ONE has under
  0.40 s Normal / 0.50 s Easy either side (Easy never tighter, rule 4), with the window >= 1.5 s Normal / 2.0 s Easy. The numbers are
  proposals until ONE's press margin is measured; re-check on the draft's own lianas (beat 6's over `double` too) and with the bots'
  ONE press (ENG-29d onOne) before the lock is used.
- **(b) the river offset:** ONE's check alone is NOT enough on this liana: it passes at 0.29 s of late margin. The design's 'river 5
  frames ahead' was there to centre ONE; with no offset path, moving the LOCK does the same job for the liana (the river and the drum
  stay on the bar), so no river-offset path is needed if the margin gate above lands and the lock moves. The lead's call.

### (c) THE PLAN (draft; one line per beat: token, piece, data field, brick it borrows)
Node string, verbatim (2-9.md:50): `A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Ws1>:#water R Uc^< Cp1&>:#water:&turtle*2 R Pb1^< Sw1> E`
Brief: archetype gauntlet (stagePlan.ts:88 row), `tempo: COURT_TEMPO` { beats 4, bar 2.85, easyStretch 3.3/2.85, lock 0 }.
| # | Token | Piece | Data field | Brick borrowed |
|---|---|---|---|---|
| 0 | A | the water gate, the drum alone, Dot's `drum` TEACH 800 px+ before beat 1 | LINES_29.drum, teachTips | 2-4 'w2-24-edge' shape |
| 1 | Tp1<:#soft | 2 snap stones in step, splash-back | PadRow by 'snap', clock 'court', count 0.7125, gap 50 | 2-5 'one-stone'/'three' |
| 2 | Pw1> | a court river, a log a bar | W2_RIVERS.court (exists) | 2-1 'first-log' / 2-4 ride row |
| 3 | Pf1> | 5 small weight pads, run pitch | PadRow by 'weight', 5 x 'small', gap 50 | the toy's PADS_SECTION |
| 4 | Xs1>:#water + R | 2-4's liana over a court river, locked | brief tempo lock; court row | 2-4 'w2-24-first-drop' |
| 5 | Pp1&>:&turtle*2 | 3 in step from ONE, 2 snappers on the court's jaws | snap row 3 stones; w2Cast turtle onBeat | 2-5 'three' + 'awake' |
| 6 | Ws1>:#water + R | the twist: `double` logs under the liana | NEW river row `double` {speed 140, logW 127.5; easy = court's}; **G1** | 2-4 'w2-24-drop-ride-drop' |
| 7 | Uc^< | the wheel up the terrace, one bucket a bar | NEW W2_WHEELS row `court` {R 180 (G4), V 66.14, easyV 50.77, N 6, street 'in'} + flight | 2-6 wheelBrick |
| 8 | Cp1&>:#water:&turtle*2 + R, heart | the wave of 5 (Easy waves of 2), a court log, 2 snappers | snap row with per-stone offsets | 2-5 'wave' + 'quickening' |
| 9 | Pb1^< | World 2's bounce up the quay | the bounce (wired) | 2-6 'wheel-bounce' / 2-1 'spring' |
| 10 | Sw1> | the King's Barge, quay to steps; the guard on the landing (**G2**); the bell on the arch | NEW river row `barge` {speed 80, logW 384; easy 70/390, look 'barge' **G3**}; puzzleKit bell | 2-4 'w2-24-jetty' raft row |
| 11 | E | the shrine; `rang` after the bell | exit totem | 2-6 EXIT |
- The 2-minute floor: the arc is ~190 s Normal (2-9.md:34-48); each tier's fastest clean run is READY's to measure on the draft.
- The goal: gauntlet, `goalStart` "Chase off {n} snappers to open the sanctuary" (proposed n = 5 of 7, Easy its own); the count must be
  met BEFORE the barge on every roll (the keeper's ask: a locked shrine needs a way back; the barge carries one way only), so beat 10
  carries no snapper and the top-up's 2 extra land on beats 5 and 8 (to check on the draft).
- The hand build's DELETION LIST (after GO; new replaces old): w2Stages.ts '2-9' (W2_STAGES :35, COURT_GOAL_29 :41, W2_PUZZLES :51,
  targetCount :990), w2Sections.ts '2-9' (W2Plan :21, :91, :110, :355), levelSeeds.ts:25, stageSheets.ts:93 (KEEP 'foe:guard' and
  journalMet.ts:13 royal_guard IF G2 lands: the posted guard meets the card; else both retire with the lead's ruling), dotLinesData.ts
  :155 hint.2-9.court and :156 hint.2-9.guards with dotTips.ts :35, :140 (the keeper's conflict 4), stagePlan.ts:88's desc -> MISSION_29,
  pokeyJournal.ts:68 -> the keeper's page. Tests re-pointed, assertions kept: w2Stages.test.ts, w2Puzzles.test.ts, puzzleCamera.test.ts,
  puzzleGateWall.test.ts, stageBackdrops.test.ts ('2-9' -> courtFar-s11 beside w2evening), w1NewArt.test.ts, badges.test.ts (ids only).

## Lessons applied (session 1)
D125 (yield first, planned), D126/D141 (the CI tool line on the base), D128 (stamps from `date`), D130 (met order, planned), D131
(drawcheck on the draft, planned), D134 (push + ls-remote before hand-over), D140 (ReadNotifications at step boundaries).
