# INT-14 REPORT: release 1 (Friday 11-20): merge what is green, hold back what is not, every gate once

## INT-14b: release 1 finished (late joiners merged, every gate once on the final head) — kept current; last update 2:36 PM ET
**EXACT NEXT STEP (for INT-14c if INT-14b stops):** final CODE head = **453b69c2** (t-int-14 after it adds only: 6ef8de7b the timecheck doc
fix, c4dc1867 funknown.json lowered, 4aa6770d stills, this REPORT). Gates run in worktree /home/user/wt/453b69c2 (gone? `git worktree add
--detach <dir> 453b69c2`, `ln -s <repo>/node_modules <dir>/node_modules`; INT-14/scripts/*.sh need `S=<scratchpad>`). STILL TO RUN:
NOTHING from INT-14b's list: every gate has run once on 453b69c2. Open with the lead: FIX-TAB (t-fix-tab, 1-6's grass tab under the painted stone block), the lead's ruling due 3:30 PM: if a draw-only fix merges, re-run drawcheck, paintcheck 0/3 1/3 2/3, the suite (3 shards) and the CI tool line on the new head and update this table.

**Merges (each from the lead's verified final; D92 = tsc + the CI tool line after each):**
| # | branch @ head (code) | merged as | conflicts | D92 |
|---|---|---|---|---|
| 1 | t-var-19 @ b38d9efb (494c9474, VAR-19f) | f4979d03 (11:46 AM) | gates.yml tool line = ours + posted.test.ts; provenIndex '1-9' = VAR-19's a0046243 (its seeds-1-9.ts), '2-1' = ours 1950fa0c (seeds-2-1.ts untouched by it) | tsc PASS; tool line PASS 315/314/0/1; riverRide's two 2-1 plants GREEN; seeds.test (6-1) GREEN 2/2 |
| 2 | t-eng-24e @ b6d15a11 (a3f430dc = ENG-24g + 24h) | 73717be8 (12:34 PM) | none | tsc PASS; tool line PASS 316/315/0/1 |
| 3 | t-gate-flake @ 68b176b8 (7f05a1c0, GATE-FLAKE-b) | 453b69c2 (1:03 PM) | gates.yml tool line = ours + paintcheck.test.ts (all 35 tool tests of both sides kept) | in the final gates below (319/318/0/1) |
**Held back: nothing.** Both late stages ship (1-9: VAR-19f; 2-4: ENG-24g/h, the lead 12:34 PM); t-int-14-hold19 / -hold24 not applied.
**Relists: none.** Every list --check passes on the final head (below). **Calibration:** the ONE recalibration (BOTS.md command, 1-1, child/
middle/expert, 1-40, both; on 73717be8, t-gate-flake only adds a test hook defaulting to 1) is byte-identical to the committed
calibration-main.jsonl (210 lines): nothing to recommit; tierBots.test PASS on the final head pins it.

**Gate table, final code head 453b69c2 (each ONCE; D93):**
| gate | verdict |
|---|---|
| tsc | PASS |
| suite (3 shards) | PASS: 3 shards, 3,982 tests / 3,979 pass / 0 fail / 3 todo (D86) |
| BASE_PATH vite build + chunkcheck | PASS / PASS |
| artcheck | PASS |
| drawcheck (every stage, both ways) | PASS (747 s) |
| clipcheck (ALONE) | PASS (83 known; 365 s; alone) |
| knowncheck | PASS (also after the funknown lowering) |
| generality | PASS |
| roadmapcheck (unshallowed) | PASS |
| timecheck --range origin/main..HEAD | FAIL on 453b69c2 (1: VAR-19/REPORT.md:243, VAR-19's own record of a typed-ahead "10:12 PM"), fixed at the source in timecheck's own wrong-stamp form ("typed 10:12 PM", meaning unchanged, 6ef8de7b): PASS after (437 commits, 281 stamps) |
| kbdcheck | PASS (129 s, alone; its planted keep-in-view check goes red as it must; re-run after a container restart cut the first run at about 2:30 PM; the keyboard screenshots restored with git checkout both times, never committed) |
| buildcheck (ALONE) | PASS (alone; 1-1 at CPU x4: Normal p50 45 / p95 98 / max 106 ms, Easy p95 57 ms; budget p95 <= 150 ms) |
| every list --check (12) | PASS 12/12: 1-1 (161 seeds), 1-2, 1-3, 1-4, 1-5 (150), 1-6, 1-7, 1-8, 1-9, 2-1, 2-2, 2-4 (100 each), each clean on both settings |
| CI tool line, exactly gates.yml | PASS: 319 tests / 318 pass / 0 fail / 1 todo (the chase-bots todo) |
| tierBots.test | PASS 9/9 |
| coveragecheck | PASS |
| registrycheck | PASS (12 stages, each registered everywhere) |
| tipwalk | PASS |
| paintcheck 0/3, 1/3, 2/3 | PASS each: 34 stages per part; 1,714 / 2,028 / 1,760 builds; 0 new ids |
| funcheck vs base | FAIL: 22 worse/new, all inherited, ruled by the lead 1:38 PM (table below); funknown.json lowered only (104 -> 77) |
| lockall vs main 6e7b85f8 --intended (20) | PASS: 82/102 unchanged; moved = exactly 1-1,1-6,1-7,1-8,1-9,2-1,2-2,2-4,3-6,3-7,3-8,4-4,6-1,6-3,6-6,6-7,7-5,7-9,8-3,8-5 |
| castBots 1-40 x 5 bots x both | PASS: child/middle/expert 40/40 both on 1-8, 1-9, 2-4; 1-1 child N 35/40 and 1-6 child N 39/40, every miss traced to the committed runs (table) |
| test link file count | PASS: 478 files (the tool refuses over 480; the artifact holds 511), python3 tools/testlink/build.py in a scratch worktree of 453b69c2 |
| npm run build:store | PASS ("Store build check passed: dist has no tracking, ads, collector, service worker or outside addresses") |

**castBots (tier bots; kid/adult first-timers in the logs), final code head:**
| stage | child N | child E | middle N | middle E | expert N | misses traced |
|---|---|---|---|---|---|---|
| 1-1 | 35/40 | 40/40 | 40/40 | 40/40 | 40/40 | child N: 5 "shrine rescued x1" on seeds 1,5,7,12,33 = exactly the committed calibration's child-Normal rescues (calibration-main.jsonl): inherited, by design (BOTS.md) |
| 1-6 | 39/40 | 40/40 | 40/40 | 40/40 | 40/40 | child N seed 30 "rescued x1": identical line to ENG-285b's committed cast-1-6.txt (median 483.5 s, lives 9 pit): inherited |
| 1-8 | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 | none |
| 1-9 | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 | none |
| 2-4 | 40/40 | 40/40 | 40/40 | 40/40 | 40/40 | none |
(expert has no Easy tier.) castBots ran on the stages PAINT-292 moved (1-1, 1-6, 1-8) and the late joiners' (1-9, 2-4), as INT-14's hand-over
named; the other lockall-moved stages were cast on INT-13b's final and are unchanged since (no merge here touched their data).

### funcheck debt (final code head 453b69c2, after the lowering c4dc1867): FAIL 22 worse/new, all inherited, ruled by the lead 1:38 PM ET
Accepted for release 1 as named debt (the lead): none new since INT-14's bdee80c8 run (identical stage, rule and layout count; that run
matched INT-13b's green t-int-13, test link #2); 1-2..1-5 are UNCHANGED vs main in lockall and 1-1 plays byte-identically for the bots
(the recalibration), so their moves are the judge's readers, not the stages; main itself fails 34 against its unlowered list. funknown.json
is only lowered (104 -> 77), never raised or added to (law 22). R-165.276/.283/.310's rows are on the lead's ROADMAP (ccr-ea739a2f-dfcee4),
not yet on t-int-14's.

| # | stage | setting | rule | layouts (known) | R-id |
|---|---|---|---|---|---|
| 1 | 1-1 | Normal | dead walk | 16 (14) | R-165.310 (dead-walk reader clocks) |
| 2 | 1-1 | Easy | dead walk | 16 (14) | R-165.310 |
| 3 | 1-5 | Normal | dead walk | 16 (15) | R-165.310 |
| 4 | 1-1 | Normal | pacing | 12 (8) | R-165.48 (1-1's gentle intro) |
| 5 | 1-1 | Easy | pacing | 10 (2) | R-165.48 |
| 6 | 1-1 | Normal | nothing bites | 15 (4) | R-165.50 |
| 7 | 1-1 | Easy | nothing bites | 16 (4) | R-165.50 |
| 8 | 1-2 | Normal | looks like the stage before | 16 (15) | R-165.51 / R-165.283 (readers on locked stages) |
| 9 | 1-2 | Easy | looks like the stage before | 16 (15) | R-165.51 / R-165.283 |
| 10 | 1-2 | Normal | nothing new | 16 (10) | R-165.51 / R-165.283 |
| 11 | 1-2 | Easy | nothing new | 16 (10) | R-165.51 / R-165.283 |
| 12 | 1-3 | Normal | looks like the stage before | 16 (new) | R-165.51 / R-165.283 |
| 13 | 1-3 | Easy | looks like the stage before | 16 (new) | R-165.51 / R-165.283 |
| 14 | 1-3 | Normal | nothing bites | 5 (new) | R-165.51 / R-165.283 |
| 15 | 1-3 | Easy | nothing bites | 8 (1) | R-165.51 / R-165.283 |
| 16 | 1-4 | Normal | pacing | 16 (14) | R-165.222 |
| 17 | 1-4 | Easy | pacing | 16 (new) | R-165.222 |
| 18 | 1-4 | Normal | nothing bites | 16 (new) | R-165.222 |
| 19 | 1-4 | Easy | nothing bites | 16 (new) | R-165.222 |
| 20 | 1-4 | Normal | nothing new | 16 (new) | R-165.222 |
| 21 | 1-4 | Easy | nothing new | 16 (new) | R-165.222 |
| 22 | 1-6 | Normal | repeat ("JJJV" x4 at x 9165) | 6 (new) | R-165.276 (Matt's "fix variety next"): the ONE flag on a stage this release changed |
Known-issues line for the notes: "The fun check still flags World 1 pacing/variety items (22, all present before this release, tracked; one on 1-6)."

**Stills (reference/qa-reports/INT-14/stills-final/, upright + sideways, whole screen, dsf 2; built seed in each name):** 1-1 L1 easy x15371
(painted stones) + L1 normal x23560 (painted logs); 1-6 L0 normal x5977 + L1 easy x6532 (painted stone / stump); 2-2 crown lily + big1 +
big2 (FIX-284's shooter); 2-1 L1 x8420 bank join + 2x crop from the bank face (x8483) to the screen foot; 1-9 L1 x300 + x900 (opening);
2-4 L1 x28400 the raft row (painted rafts), x28920 the jetty join + crop (x28856), x10700 logs' end (rivershot) and x10050 the last log.
**My read (the lead judges):** World 1's painted stones and logs read flat on top, Pokey standing on them; 2-2's pads are big flat floors,
petals purple; banks are solid soil and rock, the river stops at the face; 2-4's rafts are painted rafts reaching the jetty.
**Rough spots, named (not fixed here):** (1) 1-6: soil under neighbouring ground blocks is shaded differently, a vertical tone seam (L0 x5977
sideways near screen x 545; L1 x6532 near x 815) and a small grass tab under the stone block's foot. (2) Under each bank face (2-1 x8483,
2-4 x28856) the river bed's soil meets the bank's soil in a faint straight vertical tone step in the deep soil (upright 2x crops). (3) Shooter
artifacts, not the game: a Dot/Pokey bubble caught mid fade-out (1-1 x23560 sideways, 2-4 raft upright: the frozen clock); the x10700
upright logs'-end still caught a splash with Pokey off the right edge (he was set in the water; x10050 re-shot him on the last log).

**Release notes draft (what a player sees new since 0.9.9; each checked on t-int-14; version + title the lead's):**
- "New stage, The Boa's Branches: boas snap at anything that moves. I stay still, outsmart them, and collect her petals." (1-9, VAR-19f)
- "New stage, Over the Water: vines to logs, logs to vines, across the river to the jetty." (2-4, ENG-24g/h)
- "The forest's fallen logs and stones are painted now, flat on top where I stand." (PAINT-292)
- "1-6 and 1-7 mix things up more: fewer repeated stretches, more different kinds of climbs and hops." (VAR-1; the lead's words)
- "Petals for the Crown: the lily pads are bigger, and a quick tap is a little hop." (FIX-284)
- "The petals drifting down by the river are not all pink anymore." (ART-22p)
- "If I fall in at Petals for the Crown, I'm put back safe on a pad." (FIX-284b)
- "The river king's crown is water hyacinths now." (ART-22p)
- "River banks are solid rock and soil now: no grey wall, nothing see-through." (ENG-24h 2c, BUILD-24c)
- "Grandma's things: each one I find in a hunt is a different thing." (R-165.321; 3-6, 3-7)
- Known issue: "The fun check still flags World 1 pacing/variety items (22, all present before this release, tracked; one on 1-6)."
**Lessons applied:** D30 (every time from `date`), D86/D93 (suite line in full; every gate PASS or FAIL), D92 (CI tool line after each
merge), law 22 (timecheck fixed at the source in the tool's own form; funknown only lowered), D62 (built seed in every still's name).
**Method update:** rivershot.mjs needs `PW=$(node -e "console.log(require.resolve('playwright'))")` here (ESM import misses the global
playwright); drifting logs move before the shot, so shootx's x must be the log's runtime x (printed in its output), not its built x.

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
