# BUILD-29 REPORT: 2-9 "The River King's Court" (the World 2 finale; R-165.449), release 6
Branch t-build-29, cut from origin/t-eng-29 = 098047713 (the lead's named base). Session 1 started 5:45 PM ET Thu 11/26 (by `date`).

## EXACT NEXT STEP (session 16, BUILD-29-p, hand-over 8:41 PM ET Fri 11/27 by `date`; head = this commit, on branch t-build-29-m, NOT on t-build-29)
BOX CLOCK (by `date`): start 8:13:27 PM ET; no stops (npm ci tracked in the background, 1 min; vite tracked; the importer run started
8:27:02 PM inside the box and is finished and recorded past the line, the lead's standing rule); hand-over at the time above.
WHERE IT IS: origin/t-build-29 is STILL f4e77273 (not landed). The src head is **09e29447** (on 3e3ca0ee: the court's four polish fixes);
this hand-over commit adds only reference/. Pushed to **t-build-29-m**. `git ls-remote` at 8:26 PM: main 49fdc8cb6, t-build-29 f4e77273.
DONE, the brief's step 1 (all four, src changed, so all BEFORE the freeze):
(a) THE CARPETS: each was a 200 px heap = 125 px tall = **1.40x** Pokey (frame 460x287, pokey_units 89.1), stepped, in the play plane.
   Now each carpet is TWO clumps of the same picture, scaled whole (never squashed), **64 px = 40 px tall = 0.45x**, mirrored so their high
   ends meet in a soft mound (no stair face), sunk 4 px (w2Arc29.ts COURT_29 clumpW/clumpApart/carpetSink). The still decided: it reads
   as low lily clumps at his knee he walks through, beside the ferns (stills-p/p-2-9-*-court-*.jpg); back layer NOT needed.
   THE SCALE GATE, why it did not flag 1.3x: **RED, named (not fixed: a rule change is the lead's)**: (1) the gate judges CATALOG ROWS, never
   a placement: tools/art/catalog_master.py:617-627 SCALE_RANGE sets each row's scale_ok from the catalog's own on-screen size;
   src/game/art/inventory.ts:128 and src/game/art/invDress.ts:58 refuse a row by that verdict; a proto.decor piece is sized by its stage
   (`w`, e.g. the old w2Arc29.ts:281 `w: C.carpetW` = 200) and NOTHING compares a placed decor's drawn height with any range: the gate is
   blind to decor. (2) Even if it read placements, 'decor near' is (0.2, 2.0) (catalog_master.py:624), which admits 1.4x: the failure is
   SHAPE (a stepped top in the step band, 0.5-1.0 of his height, on his walking line), which no height range for decor encodes.
   THE GATE RUN on 2-9 (stills-p/scalegate-run.txt): w2.test "the kit ... in scale with Pokey (R-165.107)" + inventory.test and
   invDress.test scale tests: **6/6 PASS**, and they PASS the old 1.4x court too: the lilyCarpet ROW is in scale (pokey_scale 0.91,
   scale_ok true) and the court's pieces are not in World 2's kit at all (w2.ts names none of lilyCarpet/dais/throne): a placement is
   never read. Blind to decor: RED as named above.
   PROPOSED CHECK (for the lead): a placement gate over every stage's proto.decor/dress: a decor-near piece on his walk line drawn in the
   'step' band (0.5-1.0 Pokey) is named unless it is standable. The 2-9 test is its first instance (below).
(b) THE DAIS: NOT a keying fringe. The band is a PAINTED light-grey ground shadow (opaque: alpha ~250, rgb ~210,200,190, the frame's
   bottom ~35%, measured on w2-props.webp#dais 0,1552 420x255; the throne's foot has the same strip, rows 360-420 of 420). The atlas is
   lossy VP8 + ALPH (re-encoding it would degrade every frame), so it is re-tinted at load: riverArt.ts W2_SHADOW_RETINT {dais 0.58,
   throne 0.84} + shadowRetint (pale, colourless -> dark brown, as see-through as it was pale), cached per piece, one drawImage as before.
   Crops before/after at 1:1: stills-p/p-dais-before-after.jpg (left: the white oval; right: a soft dark shadow). ROUGH, NAMED: at 2x a
   hairline light rim stays on the left pad's lower edge (anti-aliased edge pixels darker than 185); not visible at 1x.
(c) THE OVERLAPS: the frog and crab were proto.dress `w2Frog`/`w2Crab`, laid at RUNTIME by addDress (protoStage.ts), AFTER finish29, so
   finish29 could not see them. Fix at the cause: every court piece is marked `clear` (W2Decor.clear, riverArt.ts); protoStage.ts
   dressClear keeps DECOR_CLEAR = 24 px off a `clear` piece and addDress runs placeDress (moved clear, never deleted: the designer's
   ruling) on a stage that has one. Opt-in: only 2-9 carries `clear`. TEST w2Arc29.test "nothing is laid in it": all 100 listed seeds x
   both settings AS PLAY BUILDS THEM (generateStage + layout): **200 built, the court on 200, nothing in it** (dressing within 24 px,
   creature boxes). PLANTS: (1) a frog set on the dais is named; dressClear refuses it marked, allows it unmarked; (2) the REAL plant,
   clear marks removed from finish29: **RED on Normal layout 2: w2Crab@28389 in lilyCarpet@28353/28401, w2Frog@28496 in lilyCarpet@28523**
   (stills-p/plant-clear-off-seeds.txt). Restored after. MOVED, NOT DELETED: on all 200, 0 dressing pieces dropped (proto.dressDropped);
   Easy layout 1's frog and crab moved along their bank to x 30394/30456, just past the shrine (30038) (stills-p/dress-moved.txt).
(d) "classList of null": index.html:64, the boot slab's `<image onload>` called document.getElementById('boot').classList with no guard;
   the splash's done() removes #boot 900 ms after the game is ready (index.html:95-99), so a slab that finishes later throws. A GAME
   error (on a slow phone too), fixed at its cause: the handler checks #boot. index.html is IDENTICAL on main 49fdc8cb6, f4e77273 and
   3e3ca0ee. Runs: on OUR tree 5 of 5 loads threw (stills-o x4, a probe x1); on MAIN (worktree /home/user/wt-main, vite 5200) 0 of 3
   (stills-p/classlist-main.txt): the race is the same code, our branch only shifts its timing; WHICH src change shifts it is NOT traced.
   After the fix: 0 errors on 5 loads of our tree (the 4 stills, a probe). f4e77273 not run (same index.html; named).
TESTS on 09e29447: tsc CLEAN; generalitycheck PASS (26 literals, 26 known); w2Arc29.test whole file **12/12** (stills-p/w2Arc29-whole.txt).
STEP 2 (pre-freeze), STARTED 8:27:02 PM: `git diff --name-only 49fdc8cb6 HEAD -- src tools` = 91 files (prefreeze-p/changed.txt);
   their own tests + every test importing one directly = **470 test files** (prefreeze-p/tests.txt; 50 under tools/), 6 shards, 3 at a time
   (4 cores). AT THE LINE (8:41 PM): shard1 FINISHED, **544 tests, 543 pass, 1 FAIL**; shards 0, 2, 3 running, 4 and 5 queued (the run is
   finished and recorded past the line, in a later commit: "STEP 2 RESULT" below). So far: shard0 88 ok, shard2 462 ok + 1 TODO (not a
   fail: support/roost R-165.312 `# TODO`), shard3 154 ok.
   **RED 1 (not traced, by the rule: no new work after the line): src/game/mixer/support.test.ts:41** "a stone step seated on a deep bank
   stands ..." -> `no seated island-earth stone in gen2 1-1 seeds 1-24` (prefreeze-p/shard1.txt:2223). It builds gen2 1-1 (seeds 1-24) and
   reads terrain.ts footingsFor; nothing in it names 2-9. NOTE: src/game/mixer/*.test.ts is NOT in CLAUDE.md's suite globs, so the
   earlier boxes' suite runs may never have run this file: run it ALONE on main 49fdc8cb6 (/home/user/wt-main) and on this head first.
STEP 2 RESULT (recorded past the line; the run started 8:27:02 PM inside the box, ended 9:12:07 PM; prefreeze-p/clock.txt, totals.txt):
   470 files on 09e29447: **3413 tests, 3401 pass, 8 FAIL** (shard0 603/606 + 1 TODO, shard1 543/544, shard2 629/635 + 1 TODO, shard3
   619/619, shard4 535/536 + 1 TODO, shard5 472/473 + 1 TODO; the TODOs are marked `# TODO` and are not fails). NONE of the failing test
   files changed vs main (`git diff 49fdc8cb6 HEAD` empty for each). NOT TRACED (no new work after the line); each: alone on main and on
   this head FIRST:
   1. tools/inspect/riverRide.test.ts:278 (shard0.txt:3576), the child on Normal 2-1 with against-the-flow off = **R-165.574, named
      in the brief (the CI line), not traced**.
   2. src/game/mixer/stumps.test.ts:40 (shard0.txt:1564) "a log on a stump is thin ...": `no log on a stump was laid: the test reads nothing`.
   3. src/game/mixer/support.test.ts:27 (assert at :41; shard1.txt:2219) "a stone step seated on a deep bank stands ...": `no seated
      island-earth stone in gen2 1-1 seeds 1-24`. (2 and 3 both find NO piece on gen2 1-1 / mixer builds: the same cause is likely, a
      1-1 build or footing change; a guess until run on main.)
   4-8. tools/validate/validate.test.ts:216 (chase: outrun false, caught 0, reached true), :537 (route down at x 150: through the branch),
      :547 (route: the middle ledge on the way), :555 (route: down at x 700 inside the fall zone), :568 (beats: a 160 px rotten stretch
      that holds 0.25 s is a hop) (shard2.txt:3680-3910). Five in one file on the route/beat judge: likely one cause.
   NOTE: src/game/mixer/*.test.ts and tools/validate/*.test.ts are NOT in CLAUDE.md's suite globs: if CI runs them (ciTests.test says
   every test file has a workflow), check gates.yml to see whether main's CI is green on them before calling any of them ours.

LEFT (the next box, in order):
a. ReadNotifications. `git fetch origin t-build-29-m && git checkout -B t-build-29 origin/t-build-29-m`; ls-remote main 49fdc8cb6,
   t-build-29 f4e77273 (moved: stop, tell the lead).
b. STEP 2's 8 reds (STEP 2 RESULT above; riverRide:278 is R-165.574, named): each file ALONE on main 49fdc8cb6 and on this head;
   born here -> fixed at its cause; on main too -> named to the lead. Then any other red: run that file ALONE on main 49fdc8cb6 (worktree /home/user/wt-main exists) and on this head, name
   file:line. Then FREEZE in a detached worktree (dispatch-packet.md:81).
c. STEP 3 on the frozen head: the lock --check half against main base sha256 764b4dd982f2af88 + key-set diff (R-165.577). EXPECTED MOVES:
   2-9 (decor AND proto.dress now: the court's dressing moved clear); 2-5 proto.dress; 2-1/2-4 = 74d88d236; verdict-only lines. Anything
   else red. Then the suite in 6 shards, 0 fail; box 14's LEFT list (CI line, riverRide:278 = R-165.574 named; seedlist every list;
   tierBots; registrycheck 2-9; drawcheck 2-9 (the court is now 6 clumps + dais + throne = 8 decor draws, was 5: watch the per-frame
   limits; the re-tint is one drawImage per piece as before); castBots x40 both settings; the three tip scans; timecheck after
   `git fetch --unshallow origin`; stills of record (the court, the roar on the page, the frog crops) looked at first.
d. LAND: fast-forward f4e77273 (no force); ls-remote equal; the debrief (level.md).
LEARNED (p): (1) A finish that dresses a stage cannot see what the RUNTIME lays after it (addDress): test a new set piece as Play builds
   the stage (generateStage), never only as the pipeline does: the headless probe on all 200 found NOTHING, the page found the frog.
(2) A pale band in a cut is measured before it is called a fringe: alpha ~250 meant painted, and a lossy atlas means fix it at draw.
(3) A page error that shows on one tree and not another with the same file is a RACE: name the unguarded line, not the branch.
PROPOSED RULE CHANGES (for the lead, level.md): (i) "a set piece a finish adds is marked `clear` and tested as Play builds the stage:
   nothing laid in it, every listed seed, both settings" (the check: w2Arc29.test's court test). (ii) the placement scale check in (a).
LESSONS APPLIED: D7/D24 (the value read on both trees: the page probe on main and ours); law 3 (each fact checked before acting: the
   frog's source, the band's alpha, the error's line); law 22 (no test bar loosened: the court test's sinks moved WITH the code, from
   COURT_29); ReadNotifications at the push (one: the lead's NOT A STOP, hand over at the line); time from `date`.

## (superseded) EXACT NEXT STEP (session 15, BUILD-29-o, hand-over 8:10 PM ET Fri 11/27 by `date`; head = this commit, on branch t-build-29-m, NOT on t-build-29)
BOX CLOCK (by `date`): start 7:57:00 PM ET (`TZ=America/New_York date` 19:57:00); no stops (npm ci tracked in the background, 1 min);
hand-over at the time above, inside the 28-minute box. Nothing left running (vite stopped).
WHERE IT IS: origin/t-build-29 is STILL f4e77273 (not landed: the gates are not run on the new head). The new src head is **889835c7**
(on box 14's 43f20100f = frozen ae5d22ce6 + reference/); this hand-over commit adds only this report. Pushed to **t-build-29-m**.
`git ls-remote` at 8:09 PM: main 49fdc8cb6, t-build-29 f4e77273 (both unmoved).
DONE (all five reds fixed at their cause; none by a weaker test or a grown list):
1. THE FIVE REDS PROVEN FIRST, each file run ALONE on main 49fdc8cb6 and on t-build-29 f4e77273 (worktrees /home/user/wt-main,
   /home/user/wt-f4e; logs reds-o/wt-*.txt): on MAIN all green (verdicts 33/33, groundwork 5/5, artUse 1/1, judgedTable 6/6); on
   f4e77273 the same five red (verdicts #24, groundwork #4, artUse #1, judgedTable #1 and #3). So all five were BORN ON OUR BRANCH.
2. (r1) 2-9's eight flown rows entered in reference/specs/chain.md §1 ("Rows ... Normal 2-9", 2-7's form at :101) and flownArcs.ts
   cites `chain.md §1 "2-9: ..."`; the FIGURES UNCHANGED (each cited string checked present in chain.md). verdicts 33/33, flown12 4/4.
3. (r4, r5) judgedTable.test.ts's two expected JUDGED tables gain '2-9': 'normal-2-9' (2-7's method). judgedTable 6/6.
4. (r2) PROVEN BY THE RUN (reds-o/goalprobe-*.txt, the test's own loop): main checks 6 (2-8 10/10, **2-9 23 of 30**, 3-3 14/19, 3-9
   21/28, 4-8 20/20, 4-9 13/17); f4e77273 checks 5, the same five with the SAME counts: only the hand-built 2-9 is gone, ENG-LATE's
   kind-counting (R-165.569) cut nothing. THE CHECK MOVED (law 22): w2Arc29.test "2-9's Normal goal lands in Matt's band" (the same band
   and slack as groundwork.test:83-86), as Play builds it (withGoals), on ALL 100 listed seeds: goal 5 of 7 animals on every one (0.714;
   Easy 3) (reds-o/goal29-out.txt). PLANTS: 7 of 7, 3 of 7, Easy over Normal, each named; with the band switched off the test goes RED
   ("a goal of 7 of 7 is named", reds-o/plant-off.txt). Only then groundwork's hand floor 6 -> 5, the reason in a comment. groundwork 5/5.
5. (r3) THE COURT DRESSED: finish29 (w2Arc29.ts; listed.ts FINISH 'w2-29', 2-6's finish26 method, decor only): the hand-built court's
   own sizes (w2Sections.ts:485-491 on main): lily carpets 200 px at 170 apart, the dais 250, the empty throne 200 on it, the shrine 340
   past the throne; each piece whole on the shrine's ground at its height (a carpet that would hang over the barge's river is not laid).
   artUse.test PASSES with artUse.allow.json UNCHANGED; inventory w2.json slots `proto.decor key throne / dais / lilyCarpet`, scale_ok.
   w2Arc29.test "the King's Court is dressed ..." on all 100 listed seeds BOTH settings, as Play finishes it (playFinish): one throne on
   one dais, 2+ carpets (3 on every seed shot), each whole on ground. It is decor only: nothing he stands on moves, so no bot can see it,
   but the lock's 2-9 decor hash moves (2-9 already moves in every part).
6. On the final tree (889835c7): tsc CLEAN; generalitycheck PASS; the six touched files together (artUse, groundwork, judgedTable,
   verdicts, flown12, w2Arc29): **tests 58, pass 58, fail 0** (reds-o/final-six.txt).
POLISH CHECK (stills-o/, vite on the working tree at 889835c7's src, seed 1, Pokey stood on the first carpet, 6 s after the card):
- o-2-9-normal-court-sideways.jpg: the court READS: Pokey on the lily carpet, three carpets leading to the bamboo throne on its lily dais;
  Pokey drawn IN FRONT of the carpet. Good. (The first shot at 1.5 s had the stage card up and his blink: re-shot.)
- o-2-9-normal-court-upright.jpg: two carpets and Pokey; the throne is off screen right (550 px on). Fine.
- o-2-9-easy-court-{upright,sideways}.jpg: as Normal, Dot's "Still 3 snappers" box up.
ROUGH, NAMED (not fixed; the next box judges and fixes, or the lead rules):
- (a) each lily-carpet heap stands about 1.3x Pokey's height with a stepped top, at the OLD court's 200 px: it may read as something to
  stand on (level.md: what looks standable must be standable). The art is a heap of pads, not a flat runner. Options: a smaller width
  (inventory pokey_scale 0.91; I did not prove what width that scale names), or the carpets set behind the throne's line. Not decided.
- (b) EASY: the quay's frog on its stone sits inside the third carpet, and a crab overlaps the dais's left edge (sideways still).
  finish29 must keep clear of the stage's other decor (or move the court), with a test that no court piece overlaps other decor.
- (c) one page error on every shot: "Cannot read properties of null (reading 'classList')" (the still script's jump via __play; also
  seen on box 14's? not checked). Trace or name it.
LEFT (the next box, in order):
a. ReadNotifications. `git fetch origin t-build-29-m && git checkout -B t-build-29 origin/t-build-29-m`; `git ls-remote`: main 49fdc8cb6,
   t-build-29 f4e77273 (if either moved, stop and tell the lead).
b. Fix rough (a) and (b) above (the lead may rule on (a)); re-shoot the four stills (`PW=/opt/node-tools/node_modules/playwright/index.mjs
   node reference/qa-reports/BUILD-29/stills-o/court.mjs 5199 <out> normal|easy`, vite on the tree) and judge at 1x and 2x.
c. STEP 2 OF THE BRIEF (not started): the WHOLE test file of every importer of every src file changed vs MAIN
   (`git diff --name-only 49fdc8cb6 HEAD -- src`: 79 files; listed.ts is new in that set and imported widely) + tsc + generality;
   then re-freeze the head in a detached worktree (dispatch-packet.md:81), `chattr`, ls-remote.
d. STEP 3: the lock --check half against the SAME main base (sha256 764b4dd982f2af88) with the key-set diff (R-165.577); expected
   moves = box 14's (2-9 every part, its decor now too; 2-5 proto.dress; 2-1/2-4 = 74d88d236; verdict-only lines) and nothing more;
   the suite in 6 shards, 0 fail; then box 14's LEFT list in order (CI line with riverRide:278 = R-165.574 named, not traced; seedlist
   every list; tierBots; registrycheck 2-9; drawcheck 2-9 (the court adds three decor draws: watch the per-frame limits); castBots x40
   both settings; the three tip scans; stills incl. the roar on the page and the frog crops).
e. STEP 4: LAND as a fast-forward of f4e77273 (no force); ls-remote equal; the debrief.
LEARNED (o): (1) prove a red's birth with the TEST'S OWN LOOP as a probe on both trees (goalprobe.mts): it named the one lost stage and
the five unchanged counts in seconds, where reading the diff would have been a guess. (2) A still shot 1.5 s after __play catches the
stage card and the spawn blink: wait 6 s and set invincibleTimer 0 before judging layering. (3) Moving dress onto a bank another
finish already dresses collides on one setting only (Easy's frog): test a new finish against the stage's existing decor.
PROPOSED RULE CHANGE (for the lead, level.md): "A stage's own finish that adds decor is tested against every other decor on the stage
(no overlap) on every listed seed, both settings" (the check: a test like w2Arc29's court test).
LESSONS APPLIED: D7/D24 (the probe read the value on both trees, not the diff); :23 (ReadNotifications before the report: none queued);
time from `date` (every time above); D18 (no acceptance on my own tests: the gates are LEFT and named).
## (superseded) EXACT NEXT STEP (session 14, BUILD-29-n, hand-over 7:08 PM ET Fri 11/27 by `date`; head = this commit, on branch t-build-29-m, NOT on t-build-29)
BOX CLOCK (by `date`): start 6:46:33 PM ET; stops (each with its cause): 6:52:42-7:03:14 PM the lock's --check half run ALONE (10m32s against the base's 7m10s: nothing heavy beside it, by the brief), the roar script and this report written meanwhile; 7:03:52-7:05:58 the 2-stage lock across 74d88d236, alone; the suite started 7:06 and was RUNNING at the hand-over (finished and recorded after it, below); hand-over at the time above (inside the 28-minute box).
WHERE IT IS: origin/t-build-29 is STILL f4e77273 (not landed: the one gate run is NOT finished). The FROZEN head is **ae5d22ce6**
(step 0 only, on top of box 13's 6ce989f8e); this hand-over commit adds only reference/ (report, stills-n tools and logs). Pushed to
**t-build-29-m** (safe-keeping). The next box: `git fetch origin t-build-29-m && git checkout -B t-build-29 origin/t-build-29-m`; freeze
ae5d22ce6 again (`git worktree add --detach <dir> ae5d22ce6`, node_modules link, `chattr -R +i src tools`, `chattr -i src/game/gen2/proven`)
and run only what is LEFT below on it (every gate already recorded here was read on ae5d22ce6; src has not changed since).
DONE:
0. THE LEAD'S CORRECTION (ae5d22ce6): w2Arc29.ts:73 `TEACH_29 = ['drum', 'roar']` (lines-2-9.md:41-42, D50); box 13's storyTips entry
   and its comment DELETED (w2Arc29.ts is now box 12's file plus the one word). Words unchanged (LINES_29.roar). No other file names
   TEACH_29 or w29.roar (grep of src and tools).
1. PRE-FREEZE on ae5d22ce6's tree: tsc CLEAN (5.4 s); generalitycheck PASS; **storyTipScan --check PASS "0 laid tip line(s) dropped on
   Tips (Normal's default) over 17 listed stage(s), 158 laid line(s) read"**; **teachFirstScan 2-9: "0 miss(es) over 200 roll(s) of 1
   listed stage(s)"** (stills-n/*-step0.txt); the WHOLE files (box 13's 14 + every importer of w2Arc29: bargeRow, riverLay, w2Stages +
   teachFirstScan.test, tipwalk.test; 19 files): **tests 156, pass 156, fail 0**. `git ls-remote` at 6:51 PM: main 49fdc8cb6, t-build-29
   f4e77273 (unmoved), t-eng-late 6ce4aa9b. FROZEN: /home/user/frozen-n at ae5d22ce6, immutable (lsattr shown).
2. THE ONE GATE RUN, on ae5d22ce6 (each line its verdict and counts):
   - **THE LOCK, the --check half, ALONE** (nothing else ran beside it but two git commands): `lockall.ts --layouts 16 --check
     base.json` (main 49fdc8cb6's base, sha256 764b4dd982f2af88 verified), 6:52:42-7:03:14 PM ET (10m32s), exit 1 (no --intended
     passed): **"lock: 98/102 stages unchanged"**. Moved: **2-9** (every part: the level); **2-5: proto.dress** (ENG-DECOR's, named);
     **2-1 and 2-4: the whole lay**; "gen2 gained verdicts and drops (not hashed)" on 40 stages (verdict-only lines). NOTHING ELSE MOVED.
     gates/lockcheck-ae5d22ce6.txt. VERDICT: PASS (every move is one the brief names).
   - **2-1 / 2-4 ACROSS 74d88d236** (the one 1-stage lock, as BUILD-28-o did; 74d88d236 changes only seeds-2-1.ts, seeds-2-4.ts and
     provenIndex.ts): recorded at 74d88d236 (detached tree), checked on ae5d22ce6: **"lock: 2/2 stages unchanged"**, exit 0, 7:03:52-
     7:05:58 PM. So the head's 2-1 and 2-4 are exactly 74d88d236's lay. gates/lock-2-1-2-4-across-74d88d236.txt. VERDICT: PASS.
   - **timecheck** `node tools/timecheck.mjs --repo . --range 49fdc8cb6..HEAD` on ae5d22ce6: **"183 commits, 8 files, 2052 lines they
     wrote, 47 stamps: PASS"**. gates/timecheck-ae5d22ce6.txt.
   - **THE SUITE in 6 shards** (deploy.yml:38's own `--test-shard=i/6`, the CLAUDE.md glob) on ae5d22ce6, three at a time: STARTED
     7:06 PM, FINISHED 7:50:25 PM (after the hand-over; finished and recorded, nothing new started): **tests 4264, pass 4256,
     FAIL 5, todo 3** (shard 1: 761 / 759 / 2 fail; 2: 669 / 669; 3: 659 / 659; 4: 778 / 774 / 3 fail / 1 todo; 5: 733 / 732 / 1 todo;
     6: 664 / 663 / 1 todo). gates/suite-ae5d22ce6.txt and the reds' text in gates/suite-ae5d22ce6-shard{1,4}-reds.txt. VERDICT: RED.
     THE FIVE REDS, NOT YET PROVEN OURS OR INHERITED (none run on main yet; the next box does that FIRST, each ALONE on 49fdc8cb6):
     (r1) src/game/gen2/verdicts.test.ts:191 (assert :196) "the verdict path holds no closed-form figure": actual
          'reference/qa-reports/BUILD-29/flown/flight-2-9-j.txt "2-9: single-hold 123 / 113, gap 134 / 217 / 243"' (a BUILD-29 file).
     (r2) src/game/groundwork.test.ts:71 (assert :90) "goals: every hand-built stage of Worlds 1-4 with a count lands in Matt's band on
          Normal": '5 stages checked' expected true, got false (the hand-built 2-9 was deleted: likely a count of stages it expected).
     (r3) src/game/artUse.test.ts:20 "every packed piece and art file is drawn, or on the reasoned allow-list": unused W2
          src/game/w2PropsData.ts#dais, #lilyCarpet, #throne (the old court's props).
     (r4) src/game/gen2/judgedTable.test.ts:25 and (r5) :74: the judged table holds '2-9': 'normal-2-9', which the tests' expected table lacks.
     All five read as 2-9's own (its row, its old props, its flown file), but that is a READING, not a proof: run each on main 49fdc8cb6
     ALONE; one that passes on main is ours, traced and fixed at its cause (no test weakened, no allow-list grown: LAWS 5, 22); one
     inside ENG-LATE's files is bisected between its commits and box 13's before it is named.
LEFT (the next box, in order, on ae5d22ce6 frozen):
a. ReadNotifications. `git ls-remote`: main 49fdc8cb6, t-build-29 f4e77273 (if either moved, stop and tell the lead). Re-freeze ae5d22ce6.
b. THE FIVE SUITE REDS FIRST (item 2: r1-r5): each on main 49fdc8cb6 ALONE, then fixed where ours, then the 6 shards again on the new frozen head. Then, each with its verdict
   and counts line: the CI tool line (gates.yml:157, the whole list); seedlist --check for EVERY list (`registrycheck.ts --lists`, all
   shards); tierBots (`npx tsx --test tools/inspect/tierBots.test.ts`); `registrycheck.ts --stage 2-9`; drawcheck; `castBots.ts --stage
   2-9 --seeds 1-40` both settings; storyTipScan --check; `tipwalk.ts --layouts 4`; `teachFirstScan.ts --check --seeds 20`. (storyTipScan
   and teachFirstScan 2-9 already PASS on this same src, item 1, but run on the main tree before the freeze: run them on the frozen tree.)
   No list is rebuilt, so no pin grep is due. The lock half is DONE (above): do not re-run it.
   KNOWN RED (the lead's message to box 14, "NOT A STOP"): tools/inspect/riverRide.test.ts:278 (the 2-1 upstream plant: 'upstream off, 1
   more lives (at least 5): on child normal seed 8 ...') fails on ANY branch holding main's C14 re-plant AND 74d88d236's 2-1 list; ours
   holds both (BUILD-28-p proved it on main 49fdc8cb6 + 74d88d236 alone). It is **R-165.574**, owned by release 6's integration: name it
   with its failing text, do NOT trace it, do NOT touch the test, count the rest as usual. Any OTHER red is yours to prove on main.
c. THE STILLS OF RECORD on ae5d22ce6 (vite on the frozen tree), upright AND sideways, Normal AND Easy, judged at 1x and 2x: the roar line
   (stills-n/roar.mjs, below: a FRESH context for each shot); Easy's frog at the quay (dress list x 29464) and the frog upright both settings
   (crop by eye); the journal page with fix (1)'s line (pokeyJournal.ts:69); guard / quay / pads on both settings (stand him with y =
   top - height). Name any rough spot plainly (the frog's pale outline at 1x).
d. LAND: `git push origin <head>:t-build-29` as a fast-forward of f4e77273 (no force); `git ls-remote` equal; message the lead the hash
   and every counts line. The head that lands is this branch's head (src = ae5d22ce6's; later commits reference/ only).
e. THE DEBRIEF (level.md): what 2-9 is; bot numbers both settings; the job's clock across boxes 12-14; Learned.
THE ROAR STILL, HOW (read from the code, not tried yet on the page): engine.ts:3355-3368 says a stage tip only when (a) he is past h.x,
(b) his FEET (y + height) are inside h.band, (c) he is not swimming, and (d) `tipHeard(stage, 'tip:<text>')` is false: a tip marked heard is
NEVER said again on that device. Box 13's shoot.mjs set y = the platform's top and roar.mjs y = top - 2 (read in their code), so his
feet stood a body BELOW the bank, outside the band: the likely cause (a reading of the code, NOT yet proven on the page; its scripts made
a fresh context per shot, so tipHeard is not the cause there). stills-n/roar.mjs does it the engine's way: a fresh context per shot, every other tip
marked said, Pokey stood with feet ON a bank top inside the band 60-380 px before the tip, then the page's own touch input holds right
(`e.input.triggerTouchMove('right')`, TouchController.tsx's call) with the page's loop running. Run: vite on the FROZEN tree
(`cd <frozen> && npx vite --port 5199`), then `PW=/opt/node-tools/node_modules/playwright/index.mjs node
reference/qa-reports/BUILD-29/stills-n/roar.mjs 5199 <out> normal` (and easy). Judge each by eye at 1x and 2x.
LEARNED (n): (1) a once-per-device tip can be tried ONCE per context: every still of a tip starts from a fresh context (tipHeard). (2) a
placed Pokey stands with y = top - height: his feet, not his head, on the bank (h.band is judged on the feet).
LESSONS APPLIED: :23 (ReadNotifications first and before the report: none queued); :27 (the kind read in lines-2-9.md:41-42, the importers grepped across src and tools); :31/:54 (every time pasted from `date`); :83 (no gate left running at the stop: the suite was waited for and recorded); D115 (every run on the frozen, immutable tree).
## (superseded) EXACT NEXT STEP (session 13, BUILD-29-m, hand-over 6:42 PM ET Fri 11/27 by `date`; head = this commit, on branch t-build-29-m, NOT on t-build-29)
BOX CLOCK (by `date`): start 6:21:42 PM ET; stops (each with its cause): 6:26 the roar line did not show on the real page from a teleport
(Pokey placed at the tip's x, 20 s wait: the line never rose; the scan passes, the page still is NOT proven); 6:27-6:29 the frog found by
eye on a full still after the probe's world-to-screen sum missed (the dress `b` is not screen y less camera y: crop by eye, not by sum);
6:32-6:34 the roar line walked in twice, not raised (below); hand-over at the time above (inside the 28-minute box).
WHERE IT IS: origin/t-build-29 is STILL f4e77273 on purpose (ENG-LATE is not landed until the one gate run passes); this box's head is
pushed to **t-build-29-m** (safe-keeping). The next box: `git fetch origin t-build-29-m && git checkout -B t-build-29 origin/t-build-29-m`.
DONE (steps 1-3, 5 in part, 4 in part):
1. MERGE t-eng-late 6ce4aa9b: a fast-forward from f4e77273 (`git merge --ff-only 6ce4aa9b`). tsc CLEAN; generalitycheck PASS (71 engine
   files, 26 literals, 26 known).
2. THE KEEPER'S FIX (2)(a) (637063bdd): way.2-9, dotLinesData.ts:167 BOTH slots (old and new text) and wayside.ts:103 (the row's key for
   swapLine), word for word: "I bet Meeca admired the whole river out loud." lines-2-9.md:104 names it. wayside.test.ts WHOLE: 17/17.
3. R-165.571 (637063bdd): w2Arc29.ts manifest `storyTips: { ...(M.storyTips ?? {}), [lineId29('roar')]: 'Dot' }` (2-1's form, R-165.412;
   the engine's kind for a once-only line said on every help setting with the story switch on, types.ts:239-241; pipeline.ts:3648 lays it
   `story: 'Dot'`). Words verbatim (LINES_29.roar unchanged). The built stage's hint (2-9 L1 seed 2, Normal): {x 14237, "That's the king!
   Now the drum's twice as fast!", story: "Dot"}. **storyTipScan --check PASS: "0 laid tip line(s) dropped on Tips (Normal's default)
   over 17 listed stage(s), 158 laid line(s) read"** (stills-m/storyTipScan-637063bdd.txt). NOTE FOR THE LEAD: lines-2-9.md:41-42 names
   `roar` a TEACH line (D50); the brief and row :19 say a story beat. Both kinds are said on Normal's default Tips; I laid STORY as the
   brief ordered. If the keeper wants TEACH (Dot waits for a clear moment), it is one word: TEACH_29 = ['drum', 'roar'] and no storyTips.
5 (in part). WHOLE FILES on 637063bdd (the 13 test files that import dotLinesData / wayside / w2Arc29, plus tools/engine/storyTipScan.test.ts):
   bossCards, castMoments, dotLines, gen2/tips, w1Arc14, w1Arc18, w2Arc27, w2Arc29, pokeyJournal, storyStyle, w5Order, w5Teach, wayside,
   storyTipScan: **tests 136, pass 136, fail 0** (w5Order's goal-line test now green: ENG-LATE's fix).
4 (in part, DISCOVERY, not the stills of record: shoot again on the frozen head). vite 5199, 2-9 layout 1 (seed 2), 2x, stills-m/shoot.mjs:
   - THE FROG (judged by eye at a 3x crop, stills-m/frog-normal-sideways-crop3x.jpg): Normal sideways at the quay's bank (x 25075): a green
     frog sitting on a grey stone, beside the kingfisher on its post and the reed bundle: it reads as a FROG, not a turtle. Polish note,
     named plainly: a thin pale outline rings the frog-and-stone cut at 3x; at phone size it reads as the sticker outline the other dress
     pieces carry, not a fringe. Easy's frog is at x 29464 (dress list), its crop is NOT yet judged (my crop missed it: crop by eye).
     A second frog stands at the start (x 316), seen beside Pokey in the wayside still; a third at x 6453.
   - THE WAYSIDE LINE (stills-m/wayside-normal-upright.jpg): Normal upright, "I bet Meeca admired the whole river out loud." whole in
     Pokey's box, top of screen, two lines, nothing cut. Shown on all four (Normal/Easy x upright/sideways: the DOM text found each time);
     only Normal upright judged by eye.
   - THE ROAR LINE: NOT shown on the real page. NOT judged. Tried three ways (stills-m/roar.mjs): a teleport to the tip's x; the
     keyboard (no effect: touch only); his x stepped 7 px a frame from 420 px before the tip to 80 px past it, the engine running
     (6:33 PM): no Dot box (the bank, flag and river read; no line). The engine-level proof is storyTipScan (PASS, above). Next box:
     use tipwalk's way (a gate on the list, it walks Dot's tips) or read how a tip fires (engine.ts / DotGuide.tsx queue) before shooting.
   - The journal line (fix (1), pokeyJournal.ts:69): NOT shot.
6 (the lock's BASE only, run ALONE after the hand-over push, nothing else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out
   base.json` on main 49fdc8cb6 (detached worktree), 6:34:48-6:41:58 PM ET (7m10s), exit 0: **"lock: wrote 3264 builds of 102 stages"**.
   Committed gzipped: gates/lock-base-49fdc8cb6.json.gz (sha256 of the json 764b4dd982f2af88...; `gunzip -k` it, then `--check` it on
   the frozen head ALONE). Log: gates/lock-base-49fdc8cb6.txt.
LEFT (the next box, in order):
a. ReadNotifications. Check out t-build-29-m (above). `git ls-remote` t-build-29 f4e77273, t-eng-late 6ce4aa9b, main 49fdc8cb6.
b. STILLS on the head: (i) the roar line: walk Pokey into the twist's bank from the left (hold right a second from about 400 px before
   x 14237 Normal / 14665 Easy, the engine running, not a teleport), screenshot when Dot's box shows; (ii) Easy's frog crop (x 29464), and
   the frog upright both settings (Pokey at frog x - 200 puts it on an upright screen); (iii) the journal page with fix (1)'s words;
   (iv) guard / quay / pads, both settings, both ways (the Easy sideways quay still fell to x 25683: place on the quay's own top).
   Judge each by eye at a crop before calling it.
c. PRE-FREEZE then FREEZE in a detached worktree (dispatch-packet.md line 81), then THE ONE GATE RUN (brief step 6, every line; the
   lock's base is done above: run only the `--check` half), LAND
   (step 7: fast-forward origin/t-build-29 to the frozen head, no force), DEBRIEF (step 8).
LEARNED (m): (1) a teleport does not say a tip: Dot's guide needs him to walk in (shoot lines by walking, the engine running). (2) a dress
   record's `b` is not screen y less camera y: find the piece by eye on the full still, then crop.
LESSONS APPLIED: :23 (ReadNotifications first: none queued); :24 (merged ENG-LATE before shooting; every still names its head);
   :27 (the kind read in types.ts and pipeline.ts, not a comment; the importers grepped across src and tools).
## (superseded) EXACT NEXT STEP (session 12, BUILD-29-l, 5:39 PM ET Fri 11/27 by `date`; head = this commit)
BOX CLOCK (the 2-hour level clock's dry run, by `date`): start 5:27:46 PM ET; stops (each with its cause): 5:29 PM the new river test RED on its own plant (the plant left the river window: fixed in 1 min by stretching the river with its row); 5:31 merge (a) 1 conflict; 5:32 merge (b) 7 conflicts + one tsc follow-on (w2Arc26.test.ts:75); 5:37 the 47-file word run 2 RED (Q1 ours-words, Q2 ours-earlier; 2 min to prove each on its base); hand-over 5:39 PM ET (inside the 28-minute box).
ReadNotifications first. Box 12 DID steps 1, 2, 3, 3b fix (1), 4b, and 4 in part (discovery stills); fix (2) is HELD (a red, below); NOT 5-8 (freeze, the
one gate run, land, debrief): the next box starts at the two questions below, then step 5 on this head. Inputs unchanged at hand-over: `git ls-remote` t-eng-29 337ba7d0b, main 49fdc8cb6.
1. RIVERS (R-165.544, c15d5015): w2Arc29.test.ts "2-9's log rivers are fair on every listed seed, both settings (riverFaults == [])":
   all 100 listed seeds x both settings pass; floor 5 log rivers a build, one barge row; total >= 1000 judged. The plant (the barge river
   and its row stretched 900 px: the three barges' gap 300 px past a hop) is named in the test; with riverFaults' hop rule switched off
   (riverLay.ts:188 `false &&`, reverted, diff empty) it goes RED: "its logs are not evenly spaced | a barge every 9.4 s, over 2 bars
   (5.70 s) | no bank at one end" (no hop fault). riverLay.test.ts's floor RE-SCOPED with its reason in a comment: { '2-8': 0 } after the
   main merge (W2_STAGES holds only 2-8; 2-6 is gen2's and judged in w2Arc26.test.ts:75); a hand-built plan added without a floor fails.
   ROW FOR THE LEAD: a test that counted a deleted build's rivers (riverLay.test.ts:40 floor 10) went to 0 when 2cb7b0a4a deleted the
   hand-built 2-9; cause: the gen2 2-9 had no riverFaults check of its own (rule 12: every new arc's test file carries the world's
   fairness judges). Countermeasure proposed below (Learned).
2. MERGES (no rebase, no force):
   (a) t-eng-29 337ba7d0b at 12321f6a: ONE conflict, src/game/puzzleCamera.test.ts (comments + list): ours' 2-9 line kept, theirs'
       2-8 line and derived roomStages() kept (replaces the hand list). tsc CLEAN; generalitycheck PASS (26 literals, 26 known).
   (b) main 49fdc8cb6 at 4b605cdf: SEVEN conflicts, both sides kept: gates.yml (main's tool line + ours' letGoBeat/tempoToys tests);
       listed.ts KITS + WORLD, stageTable.ts kit union, flownArcs.ts nW2, provenIndex.ts (main's 2-6 rows AND ours' 2-9 rows);
       w2Sections.ts W2Plan '2-8' (both deletions kept); firsttimer.ts imports (ours' flood + main's wheel). Follow-on: w2Arc26.test.ts:75
       `riverFaults(st)` -> `riverFaults(st as never)` (tsc weak-type error against ours' widened parameter, ENG-29-f; as w2Arc21/24 do;
       no assertion changed). tsc CLEAN; generalitycheck PASS (26/26).
   Whole files on 4b605cdf: firstTimerBot 12/12, firsttimer 18/18, puzzleCamera 4/4, riverLay 4/4, w2Arc26 5/5, w2Arc29 7/7, w2Stages 3/3.
3. KID_RUNS_59 (firstTimerBot.test.ts:177): PASSES on the merged head (file 12/12): no re-record.
3b. THE KEEPER'S TWO FIXES (review-2-8-2-9.md, t-story f6c57c925), word for word: (1) pokeyJournal.ts:69 + lines-2-9.md:32/:35 -> "The
   whole court danced to the king's drum. I danced too, on the beat, mostly. Then I rang his bell."; (2) way.2-9, dotLinesData.ts:167
   both slots -> "Bet Meeca admired the whole river out loud.": HELD, NOT COMMITTED (QUESTION 1 to the lead). Applied as written (both
   slots AND wayside.ts:103, WAYSIDE[2].stages[9]: its text is the row's key for swapLine, so the old slot and wayside.ts change
   together or the game falls back to the old words), the 47 test files importing pokeyJournal / dotLinesData / wayside / dotLines gave
   465 tests, 462 pass, 2 fail, 1 todo (R-165.312, known): (i) wayside.test.ts:49 "2-9: Pokey's own thought is in the first person: Bet
   Meeca admired the whole river out loud." OURS, the words: the line is Pokey's (pokey('start', ...)) and has no "I". No test changed;
   the words were reverted (diff empty). Options for the keeper: "I bet Meeca admired the whole river out loud." (9 words, first person,
   under 10), or the line moves to Dot. (ii) w5Order.test.ts:905 '2-9: "Still 9 snappers to chase off" is not counted': OURS from
   BEFORE this box (fails ALONE on t-build-29 0384423f8 and on 4b605cdf; PASSES alone on main 49fdc8cb6), not the words. Cause:
   2-9's own late goal line (stagePlan.ts:245 '2:gauntlet' late, BUILD-29) never swaps to the 'goal.late' row, and dotLines.ts:274
   marks a line counted only by that row's id, so Dot would say a stale count late in 2-9 (the 5-3 bug, QA v198). ENGINE-WORTHY
   (rule 22/26: any stage-owned late goal line has it): QUESTION 2 to the lead (who fixes it: an engine lane in dotLines.ts, counted
   by the stage's goalLine('late') pattern, or a data row). Box 11's shard 1 was partial and did not reach it.
   With fix (1) only: pokeyJournal / playerText / w2Arc29 / wayside 117/117.
   LINE STILLS: the wayside bubble ("Bet Meeca ...", the held words) is in every still of step 4, upright and sideways: it reads whole,
   in Pokey's box, top of screen upright and over the dirt sideways, nothing cut. The journal page still is NOT shot (next box).
4. STILLS (the frog, not the turtle), layout 1 (builds seed 2), 412x915 and 915x412 at 2x, Normal AND Easy, from the merged head's working
   tree (vite 5199, stills-at-setting.mjs; spots pads 24780/25640, quay 25850/26714, guard 27350/28290 Normal/Easy), contact sheets
   committed as stills-l/sheet-l-upright.jpg and sheet-l-sideways.jpg (the 12 full stills are in the box's scratchpad only). DISCOVERY,
   not the stills of record (rule 29: bots not yet run on the merged head; shoot again on the frozen head). What I judged: the lily pad,
   the quay and the barge's river, the guard in its red ring, both settings, both ways; Pokey readable; nothing cut. NOT JUDGED: the frog
   in place of the decorative turtle (at sheet size I could not tell it by eye): the next box crops each spot to the dress pieces.
4b. RE-ROLL (flown/roll-l.txt, 4b605cdf, libstage 24 x both): CLEAN 24/24 both, thrown 0, 1 beat order, cast turtle 8-8, no refusal, no
   pool section unlaid. Against roll-j: Normal identical; Easy width 29587-30266 px (j 29586-30259): main's or ENG-DECOR's, not a refusal.
THE LEAD'S ANSWERS (received after the hand-over): Q1: the keeper approved "I bet Meeca admired the whole river out loud." (9 words, Pokey's
   line, one form for both slots: dotLinesData.ts way.2-9 old AND new text, and wayside.ts:103, word for word). Q2: an ENGINE fix,
   R-165.569, by ENG-LATE on its own branch from 7b55f15bf, landed on t-build-29; the next 2-9 box starts after that landing.
NEXT (box 13): ReadNotifications; after ENG-LATE lands, apply Q1's words, run the 47 importing test files whole (wayside.test:49 and
   w5Order.test:905 must both pass); then step 5 PRE-FREEZE on this head (tsc; generality; the whole test file of every source changed in box 12 and its importers,
   already run above: re-run only if src moves; ls-remote t-eng-29 / main), FREEZE (dispatch-packet.md:81), then step 6's ONE gate run,
   7 land, 8 debrief. The lock's expected moves vs main: 2-9 and 2-5's proto.dress (ENG-DECOR); ALSO watch 2-1 and 2-4: provenIndex
   carries ours' versions (2-1 0c8ad7fe, 2-4 917a538d; main 1950fa0c, 08c32188), so seedlist --check for 2-1 and 2-4 is the first to read. DISCOVERY after the hand-over
   push, on 7b55f15b (working tree = that head, by `date` 5:48 PM ET): seedlist --check 2-1, 2-4, 2-6, 2-9 each PASS (100 seeds, each clean on
   both settings); the other lists are not run. The ONE gate run still runs them all on the frozen head.
LEARNED (l): (1) a merge's semantic conflict (a widened parameter vs another branch's typed caller) is caught only by tsc after EACH merge,
   as the brief ordered: w2Arc26.test.ts:75 did not conflict in git. (2) A floor counted across stages hides which stage it counted; a
   per-plan floor table names it, and a new plan without a floor fails.
LESSONS APPLIED: :24 (merged main and t-eng-29 before shooting; the stills name their head); :27 (each red proven ALONE on its base and on
   main before naming it ours or inherited; grep of the importers, not one file).
PROPOSED RULE (level.md, for the lead): "A designed arc's test file carries its world's fairness judges on every listed seed, both settings
   (World 2: riverFaults), with a plant, BEFORE the hand build it replaces is deleted" (check: the deleting commit's diff adds that test).
## (superseded) EXACT NEXT STEP (session 11, BUILD-29-k, 10:47 AM ET Fri 11/27 by `date`; head = this commit; src UNCHANGED since 1846b25b3)
ReadNotifications first (D140). Box 11 DID steps 1-3 and 5; 4 and 6 are RUNNING (below):
1. KID EASY RULING (sent to the lead): LEAVE the lay, named R-165.512. Same metric, castBots --bots kid --setting easy x40 on 1846b25b:
   2-5 (the only other World 2 stage that lays snappers; 2-7 has none) 4/40, all 40 at the shrine, 96 rescues, 22 hits, 280 kicked / 80
   left, 206 of 225 stuck spots 'a turtle near' (bots/kid-easy-25-k.txt/.jsonl). 2-9 (j2) 5/40, all at the shrine, 0 hits, 228 kicked / 92
   left (j's earlier jsonl: 4/40, 77 rescues, 18 hits, 205 of 227 beside a turtle). 2-9 is in line with 2-5, not worse.
   TRACE, seed 3, the rescue at 225.0 s (bots/kid-easy-2-9-s3-trace-k.txt; probe probes/kid-trace-k.patch + .mts, reverted): the snapper
   at 23901 patrols facing away, turns HEAD-ON (alert, d -1) at 205.0 s as he closes to about 60 px, and cycles alert/rear/strike/recover
   facing him for 20 s; the kid presses only left/right, dithers 30-60 px in front, never presses a kick. Cause: HEAD-ON (rule 28), the
   bot's head-on handling, not the beat or the reach.
2. FIRST-LOOK STILLS (step 5), layout 1 (builds seed 2) Normal, upright then sideways, from the committed lay (wt at 1846b25b, vite 5199,
   PW=/opt/node-tools/node_modules/playwright/index.mjs): stills-k/sheet-upright.jpg, sheet-sideways.jpg, 13 spots, one per beat.
   Draw paths (beats.mts, the built stage): gate/hear/rest banks 'ground' (as 2-5/2-7); hear stones painted rock; logs river art; pads =
   bouncy moss_stone drawn as a lily pad; the wheel its own art; snappers the turtle sheet; the guard its own sheet ('guard', red ring);
   barge a log in river art. Nothing in the lay fails the bar. Tool or shared effects, NOT the lay: the opening story bubble stays up
   (engine paused) and sideways it sits over the ground ahead; lives fall x3 -> x1 across the stills (placed near snappers); x24900 is
   mid-bounce (placed on the lily pad 24847-24917).
3. GATES on the frozen worktree (1846b25b; src = candidate): tsc CLEAN; generalitycheck PASS (26 literals, 26 known).
4. THE LEAD'S RULING on the stills: the lay PASSES. One change: the decorative turtle (World 2's shared clutter look
   ['w2ReedBundle','w2Turtle','w2KingfisherPost'], dressNewLooks.ts, rolled by artDress.dressSets) stands on 2-9 beside real snappers.
   RULED B: an ENGINE lane, ENG-DECOR, writes a HAZARD_LOOKALIKE data table {w2Turtle: family 'turtle', swap 'w2Frog'} plus a swap in
   protoStage.addDress for any dress piece whose family is in the stage's cast. Its test covers every listed seed of every stage, with a plant.
   The lock moves on 2-5 and 2-9 ONLY, both named. It lands on t-eng-29 beside ENG-CAM29 (rule 26: protoStage is not a Content card's file).
   No stage id goes in engine code (generalitycheck), so this is by cast, not by 2-9.
5. The gates on 1846b25b are DISCOVERY only (the lead's ruling): drawcheck (22 scenarios incl. 2-9), the lock as two runs (base on
   7387d089a, check on 1846b25b) and the 6 shards were running at this stamp in the scratchpad; their totals are below if they finished.
   - DRAWCHECK (step 4) PASS, 22 scenarios incl. 2-9, the same limits, 899 s, no breach (flown/drawcheck-k.txt). For 2-9 only the
     reported note shrunkOver2_5x 9.00 at spot 0 (fails over 32; 2-5 9.75, 2-7 11.00). Its top call sites: paintedScenery.ts:104/102
     (drawGroundFlora) 2.76 + 2.24/frame and sheetBake.ts:125 (drawSheet) 2.55/frame, the same as 2-3/2-4/2-5/2-7.
LEARNED (k): (1) a bot's low pass rate on one stage means nothing until the same metric runs on the stage's siblings: 2-5 at 4/40
put 2-9's 5/40 in line in one 4-minute run, before any re-lay. (2) A two-line stderr probe (the foe's state at each rescue, then every
6 frames over the stall) named the cause in two runs; keep it as probes/kid-trace-k.patch. (3) stills-at-setting needs
PW=/opt/node-tools/node_modules/playwright/index.mjs from a worktree (index.js gives no named chromium). (4) The lead's ruling came in
5 minutes because the message carried the numbers, the trace and the choice together.
PROPOSED RULE (level.md, for the lead): "a kid-bot miss on a stage is compared on the same metric with the world's other stages that lay
the same foe, and one stall is traced to its frame, before any re-lay" (check: the report carries both numbers and the trace file).
   - SHARD 1 (discovery, partial at hand-over: 1068 results, 2 fail):
     (i) ctestPicker.test.ts:78 'the survey names 1-4 ... nothing of the old single stage': fails on 7387d089a too, INHERITED.
     (ii) riverLay.test.ts:40 'the hand-built World 2 stages lay every log river ... (seeds 1-3)': '0 log rivers judged' (floor 10).
     It is OURS: it passes on 7387d089a. 2cb7b0a4a (BUILD-29-f) deleted the hand-built 2-9 from W2_STAGES (new replaces old), which
     held the last counted log rivers (2-6 and 2-8 count none). And the gen2 2-9's rivers are judged by riverFaults NOWHERE (w2Arc29.test
     has none), so the river fairness check was lost, not just the count. NOT fixed in box 11 (no time to prove it).
NEXT (box 12) FIRST, before the merge: the riverLay fix, as 2-6's was (riverLay.test's own comment: "2-6 is gen2's now, BUILD-26: its
     millrace is judged by riverFaults in w2Arc26.test.ts"):
     - w2Arc29.test.ts gets "2-9's log rivers are fair on every listed seed, both settings (riverFaults == [])", with a count floor;
     - prove it with a plant (a barge log's gap widened past the reach): RED;
     - then riverLay's floor is re-scoped to what W2_STAGES still lays, with the reason in a comment (Law 22: the check MOVES to 2-9's
       gen2 lay, it is not loosened);
     - tell the lead the row (a test that judged a deleted build), with its cause.
     The other discovery gates died with the box: the lock base run reached 8-1; shards 2-6 never started.
NEXT (box 12): ReadNotifications. When ENG-DECOR and ENG-CAM29 land on t-eng-29, merge t-eng-29 (no force, conflicts named), then:
   - re-shoot the guard/quay/pads stills: the frog, not the turtle;
   - registrycheck --stage 2-9, then the FINAL gate run on that frozen head: tsc; the CI tool line; the 6 shards with totals;
   - the lock as two runs (--layouts 16 --out base.json on the merged t-eng-29 head, then --check base.json on ours): only 2-9 moves;
   - seedlist --check for every list (16); clipcheck; tierBots; generalitycheck; drawcheck if anything that draws moved;
   - freeze per D115 with src/game/gen2/proven/ writable; the WIDENED pin grep (CI #98) if any list is rebuilt;
   - bots x40 only if the merge moves the lay.

## (superseded) EXACT NEXT STEP (session 10 hand-over, BUILD-29-j, 10:37 AM ET Fri 11/27 by `date`; head = this commit)
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
