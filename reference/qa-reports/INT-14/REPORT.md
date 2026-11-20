# INT-14 REPORT: release 1 (Friday 11-20): merge what is green, hold back what is not, every gate once

## EXACT NEXT STEP (hand-over to INT-14b; written 11:26 AM ET 11-20 at the lead's context call)
**State.** t-int-14 = this commit; the last code merge is bdee80c8 (the 5 early branches; every line below proven on it). Nothing of the
late joiners is merged into t-int-14. Helper scripts: reference/qa-reports/INT-14/scripts/ (set `S=<your scratchpad>`; each logs there):
ciafter.sh (tsc + the CI tool line exactly as gates.yml, in a pinned worktree, after EACH merge, D92), suite.sh (3 shards), lists.sh
(every list or a given list), union.py (doc conflicts: ours then theirs), toolline_union.py (gates.yml tool-line conflict: ours + theirs'
extra files), funlower.py (funknown.json: min(old, run), deletes gone entries, never adds or raises), hold19.py / hold24.py (the edits
the hold branches made). **Disk:** each worktree is 2.6 GB of the session's allowance; at 98% a test's scratch worktree failed ("unable to
write file", a false red on merge 5): keep at most 4 worktrees, remove each when done.
**Proven on bdee80c8** (gates on the early head; every gate still runs ONCE on the final head):
- tsc + CI tool line after each merge: all 5 PASS, 306 tests / 305 pass / 0 fail / 1 todo (the chase-bots todo).
- suite, 3 shards: 3,966 tests / 3,964 pass / 0 fail / 2 todo: PASS.
- every list --check (registrycheck --lists, 12): 12/12 PASS (1-1 161, 1-5 150, the rest 100).
- lockall vs main 6e7b85f8's lock (recorded on a main worktree: `npx tsx tools/engine/lockall.ts --layouts 16 --out <file>`, 9 min):
  PASS, 82/102 unchanged; moved = exactly --intended 1-1,1-6,1-7,1-8,1-9,2-1,2-2,2-4,3-6,3-7,3-8,4-4,6-1,6-3,6-6,6-7,7-5,7-9,8-3,8-5
  (INT-13's 17 + 1-1 platforms PAINT-292 + 3-6/3-7 collectibles ENG-SMALL3). Output: lockall-vs-main-bdee80c8.txt.
- funcheck: FAIL 30 worse or new, 41 to lower or delete (116 known, 1,590 flags): identical flag for flag to INT-13b's final
  (funcheck-final-4529d5e6.txt); main itself FAILs 34 / 53 (INT-12/funcheck-main-6e7b85f8.txt). Output: funcheck-bdee80c8.txt. On the
  FINAL head: `FUNCHECK_WRITE=1` into a copy, then `python3 scripts/funlower.py <committed> <written> tools/validate/funknown.json` (lowers
  the 41 only), re-run funcheck, and list every remaining worse/new flag with its stage for the lead to rule (D93; none ships unruled).
**Hold-backs (pushed, proven, not merged; both on bdee80c8; the section below):** t-int-14-hold19 @ b286f754, t-int-14-hold24 @ 9faad781:
lockall --stages vs main's lock 1/1 UNCHANGED each (32 builds); tsc, registrycheck, coveragecheck, knowncheck PASS; the moved tests green.
To apply one: `git merge origin/t-int-14-hold19` (or -hold24) onto the final head after the other merges; if the late joiner for that
stage was merged first, do NOT merge both: a hold-back applies only to a stage whose branch is not merged.
**Trial of the late joiners' CURRENT heads (NOT finals), t-int-14-trial @ d6b9a246** = bdee80c8 + t-var-19 @ 1c313657 + t-eng-24e @
7f6874db + t-gate-flake @ 7ae0b8a6:
- conflicts only on t-var-19: gates.yml tool line (ours + tools/inspect/posted.test.ts: toolline_union.py) and provenIndex.ts ('1-9'
  VAR-19's version a0046243, the owner; '2-1' ours 1950fa0c, INT-13b's relist). t-eng-24e and t-gate-flake merge clean.
- tsc PASS. CI tool line: 316 tests / 313 pass / 2 FAIL / 1 todo: tools/engine/libstage.test.ts on 1-9 ('1-9 seed 1: the beats its list
  replays' (+ 'w1-19-rest-wall') and '1-9: clean on both = listed'). The SAME 2 are red on t-var-19's own head (run in its worktree):
  VAR-19's, sent to the lead 10:49 AM.
- suite 3 shards: 3,979 tests / 3,975 pass / 1 FAIL / 3 todo: w1Arc19.test "1-9's golden seed" (red on t-var-19's own head too:
  VAR-19's); the 3rd todo is VAR-19's own (R-165.312, the flag placer).
- lists --check 1-9, 2-4, 2-1, 2-2: 4/4 PASS. drawcheck (every stage both ways): PASS (751 s).
**What each late joiner still needs before it merges:** t-var-19: a final with libstage.test and w1Arc19.test green (else hold-19);
t-eng-24e: ENG-24g's final, sent green by the lead (its current head was green on everything above); t-gate-flake: the lead's final.
Until t-gate-flake is in, run clipcheck and buildcheck ALONE and name any load failure R-165.215/R-165.325, never a pass.
**Then (the packet's AFTER ALL MERGES and GATES ONCE, in this order, long ones in the background, nothing beside clipcheck/buildcheck):**
1. merge each late joiner (ciafter.sh after each) or its hold branch; 2. lists.sh on every list; relist one a merge invalidated (say
which and why); 3. ONE recalibration (BOTS.md command; tierBots.test must pass; recommit calibration-main.jsonl; PAINT-292 moved 1-1's
platforms, so watch 1-1); 4. the full gate list on the final head (packet lines 34-43: tsc, suite, BASE_PATH build + chunkcheck,
artcheck, drawcheck, clipcheck ALONE, knowncheck, generality, roadmapcheck (the clone is unshallowed here; a fresh clone needs
`git fetch --unshallow`), timecheck --range origin/main..HEAD, kbdcheck, buildcheck ALONE, every list, the CI tool line, tierBots,
coveragecheck, registrycheck, tipwalk, paintcheck 3 parts with each part's build count, funcheck (above), lockall vs main --intended (the
20 above + every stage a late joiner owns: 1-9 VAR-19, 2-4 ENG-24), castBots 1-40 x 5 bots x both on 1-1, 1-6, 1-8 (PAINT-292) and every
late joiner's stage, the test link file count (`python3 tools/testlink/build.py` in a scratch worktree; refuses over 480), npm run
build:store (release.md's list). 5. Stills: `node reference/qa-reports/INT-14/shootx.mjs <port> <out> <stage> <layout> x:<px>:<name>`
on `npx vite --port <port>` (ORIENT, DIFF; dry run worked on 1-1 L1 easy x15371: Pokey on the painted stone run): 1-1 L1 x15371 + x23560,
1-6 L0 x5977 + L1 x6532 (PAINT-292's spots), 2-2's pads (FIX-284's shootfinal.mjs), a river bank join with a 2x crop to the screen
bottom, 1-9's opening and 2-4's raft + logs' end if in. 6. This REPORT: gate table, castBots table, funcheck flags, stills, rough spots,
release notes draft (below).
**Release notes draft (player words, Pokey's voice, whatsNew.ts style; trim to what ships):** "The forest's stone and log steps are painted
now, flat on top where I stand." / "Petals for the Crown: big lily pads I can stand on, and a quick tap is a little hop." / "The river
king's crown is water hyacinths now." / "Grandma's things: each one I find in a hunt is a different thing." (3-6, 3-7) / IF 1-9 ships:
"New stage, The Boa's Branches: boas snap at anything that moves. Stay still, outsmart them, and collect her petals." / IF 2-4 ships:
"New stage, Over the Water: vines to logs, logs to vines, across the river to the jetty." (1-6/1-7's variety from INT-12 needs the lead's
words: what moved there since 0.9.9.)
**Seen and named (not fixed here):** tools/validate/validate.test.ts is red on t-int-14 (5 of 43: chase, three route, rotten wood) and is
run by NO workflow; outside the release's gates, for the lead to log.

Draft started 10:05 AM ET 11-20 (by `date` in the same command). Integration, session_01FhBbYMMP8GPmAoMx12of76.
Base: t-int-14 from t-int-13 @ d36638be (INT-13b's final). main = 6e7b85f8 (no newer release).

## Merges (packet order; tsc + the CI tool line (gates.yml, CI=1 FORCE_COLOR=1) after EACH merge, D92)
| # | Branch @ hash | Merge | Conflicts and resolution | tsc | CI tool line |
|---|---|---|---|---|---|
| 1 | t-paint-292 @ 05cebafa | d8f3aeb8 | reference/art/HF-SPEND.md: union (INT-13's sections, then PAINT-292's) + the combined balance note (~$49.0) | PASS | PASS: 306 tests, 305 pass, 0 fail, 1 todo |
| 2 | t-eng-noise @ c59928a4 | d1a51eeb | reference/handoffs/engine-core.md: union (§0zq-13b, then §0zq-NOISE) | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 3 | t-eng-prowl @ 33e43c57 | 4d5e0554 | castPlay.ts auto-merged (prey.hanging after prey.covered, beside ENG-NOISE's channel, as the lead's trial); engine-core.md union | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 4 | t-eng-small3 @ 9b1767f9 | acd0046c | engine-core.md union | PASS | PASS: 306 / 305 / 0 fail / 1 todo |
| 5 | t-eng-25c @ d13ebdaa | bdee80c8 | pipeline.ts auto-merged; engine-core.md top: one "Merged at INT-14" line naming today's sections, the INT-13 line kept word for word | PASS | first run FAIL 1 (seedlist.test 'a listed stage with no list yet': "unable to write file" in its scratch worktree = the disk allowance full, 98%, from my own per-merge worktrees); worktrees removed (19 GB free), seedlist.test alone 8/8, the whole line re-run: PASS 306 / 305 / 0 fail / 1 todo |
| - | timecheck fix | c44a3b20 | engine-core.md §0zq-25d heading 11:15 -> 11:10 PM ET (commit fb8f56c1's clock), carried in by merge 5; timecheck --range origin/main..HEAD PASS, timecheck PASS | | |
The 1 todo everywhere: 'chase bots (OPEN, todo): the CHILD bot on Normal reaches the fork' (pre-existing, as INT-13b's).

## Hold-backs, prepared before the late joiners are decided (side branches, pushed; NOT merged)
- **t-int-14-hold19** (b286f754 on bdee80c8): 1-9 ships as main has it (the hand-built 1-9). protoStage HAND_STAGES '1-9' back; the stage
  table's 1-9 row out (kit 'w1-19' kept, unrouted); provenIndex '1-9' out; the player's words main's (Dot's hint.1-9.guard and
  lock.ring.snakes + FIRST_OF, the journal's boa tip, the moves page's ring opening, Pokey's page, the mission, no '1:gauntlet' sealed
  line, stageSheets '1-9'); coverage.known.json = main's (the ring's known gap R-165.272 returns with its stage). Tests moved to a toy
  (law 22, none deleted): w1Arc19.test reads kitLib19 + finish19 as a toy row carrying the designed mission (petals) and pins the player's
  lines by routing; judgedTable's pins follow the table.
- **t-int-14-hold24** (9faad781 on bdee80c8): 2-4 ships as main has it (the hand-built 2-4). w2Sections.ts = main's (it differed only by
  BUILD-24's deletion 81b152fa5) and W2_STAGES '2-4' back; the stage table's 2-4 row out (kit 'w2-24' kept, unrouted); provenIndex '2-4'
  out; main's words (Dot's four hint.2-4 lines, the mission, Pokey's page, the clue); main's w2Stages.test.ts (its 2-4 test) back;
  vineSnake.test runs 2-4 again beside 1-6. Tests moved to a toy: w2Arc24.test (kitLib24 + World 2's finish) pins the words by routing;
  riverRaft.test's listed raft stages follow the table and kitLib24 still lays its raft; judgedTable's pins follow the table.
- **Proof, each:** `lockall.ts --layouts 16 --stages <id> --check <main 6e7b85f8's lock>`: **1/1 unchanged (32 builds)** for 1-9 on hold19
  and 2-4 on hold24. tsc PASS; registrycheck PASS (11 stages); coveragecheck PASS; knowncheck PASS; the moved tests green (w1Arc19 +
  judgedTable 14/14; w2Arc24 + judgedTable + riverRaft 18/18). The full suite runs on whichever final head carries one.

## Method, lessons applied, method update
- Method: methods/release.md (merge discipline, step 0 = D92) and methods/gates.md; the packet's order.
- Lessons: D30 (every time from `date` in the same command), D57/D87 (inbox read at every push; long commands in the background), D59
  (no gate left running at this hand-over: none is), D86 (suite lines carry shard count and totals), D90 (logs to files, summary lines only),
  D92 (tsc + the CI tool line after EACH merge: it caught nothing from the merges, and a disk-full false red that the re-run cleared),
  D93 (every gate line PASS or FAIL; funcheck named FAIL, not "same as").
- Method update (proposed): an integration keeps at most 4 worktrees (2.6 GB each against the session's disk allowance) and checks
  `df` before a test run; a red that reads "unable to write file" is the disk, re-run after freeing space, never a code red.
