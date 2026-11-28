# ENG-DROP (R-165.562): the run lay lays a DESIGNED drop past its corridor, on a real World 3 row

**Box 5 (ENG-DROP-e, a TAIL: gates only, no code) hand-over, stamped Fri Nov 27 8:50 PM ET (`TZ=America/New_York date`). Branch t-eng-drop at 401d000b6
(= 110d234f6 + reference/ only; code = db46ae3e8) + this report commit. ALL 6 SUITE SHARDS GREEN on frozen 110d234f6; NOT landed (the box line
came first). Box 5 started 8:21 PM ET (`date`: Fri Nov 27 20:21:59 EST 2026); line 8:49:59 PM ET.**

## EXACT NEXT STEP (whoever lands starts here)
1. DONE in box 5, FREEZE: `git worktree add --detach /home/user/wt-drop 110d234f6`, node_modules linked, `chattr -R +i src tools && chattr -i
   src/game/gen2/proven` (exit 0); `touch src/x`, `touch tools/x` and an append to src/game/engine.ts -> "Operation not permitted"; the
   proven folder writable (touch + rm ok).
2. DONE in box 5, suite shards 3-6, ONE AT A TIME (a chain script with a STOP file; `b5-gates-summary.txt`, logs `b5-g-shard*.txt.gz`),
   the deploy.yml:38 command word for word, `--test-shard=i/6`:
   - shard 3/6: `# tests 635 # pass 635 # fail 0 # cancelled 0 # skipped 0 # todo 0` (exit 0, 467 s).
   - shard 4/6: `# tests 733 # pass 733 # fail 0 # cancelled 0 # skipped 0 # todo 0` (exit 0, 193 s).
   - shard 5/6: `# tests 652 # pass 650 # fail 0 # cancelled 0 # skipped 0 # todo 2` (exit 0, 577 s). The 2 todos are marked todos in
     files this packet did not change, the same text on 7a580aefc: `R-165.312 ... (flag placer)` (src/game/gen2/worlds/w1Arc19.test.ts)
     and `4-3 in the real engine ...` (src/game/w4RealReach.test.ts:22).
   - shard 6/6: `# tests 654 # pass 653 # fail 0 # cancelled 0 # skipped 0 # todo 1` (exit 0, 336 s; started 8:44 PM ET inside the box,
     finished past the line and recorded). The todo is src/game/w4Runtime.test.ts:392, on 7a580aefc too; it reports `ok ... # TODO`
     (the todo body PASSES): worth the owner's look, it may be closable (not this packet's to change).
   With box 4: all six shards green (703 / 798 / 635 / 733 / 652 / 654), plus lock 102/102 + key-set SAME, timecheck, roadmapcheck,
   tierBots 9/9 and the CI tool line 355/354/0 fail/1 todo. No red anywhere, so nothing to run alone on 7a580aefc.
3. NEXT, LAND (not started: the line came at 8:49:59 PM ET with shard 6 still running): `git ls-remote origin refs/heads/t-eng-w3` was
   7a580aefc51bc13b43102c70fffb6a6a45e24337 at 8:50 PM ET (NOT moved). Just before landing, check it again. Still 7a580aefc:
   fast-forward t-eng-w3 to this report commit (no force, never rebase), `git ls-remote` equal, message the lead the hash and the counts.
   MOVED: STOP, no merge; tell the lead the new hash (the merge is then an engine box with the full re-gate, box 4's step 6).
4. Lessons applied: one gate at a time on an immutable tree (D115); a gate started inside the box finished and recorded past the line,
   no new work after it (D111, the lead's standing rule); times and hashes from `date` / `git ls-remote` in the same step (D30, D36).
   Method used: dispatch-packet.md:81 (freeze), box 4's chain + STOP file. Method update: the STOP file set by a timer at the line
   (`until [ $(date +%s) -ge T ]; do sleep 5; done; touch STOP`) needs no watching and made the hand-over exact (STOP set 8:50:00 PM ET).
   Proposal for the lead: a tail whose last step is a 1-minute landing should be allowed to land past the line once its gates are green
   and `git ls-remote` is unmoved; handing it over costs a successor about 89k of start-up for one fast-forward.


**Box 4 hand-over, stamped Fri Nov 27 8:20 PM ET (`TZ=America/New_York date`). Branch t-eng-drop at 110d234f6 (code = db46ae3e8, unchanged in
box 4) + this report commit. Lock PASSED; gates PARTLY run (below); NOT landed. Box 4 started 7:50 PM ET (`date`: Fri Nov 27 19:50:12 EST 2026).**

## EXACT NEXT STEP (box 5 starts here)
1. DONE in box 4, BASE: `git ls-remote origin refs/heads/t-eng-w3` = 7a580aefc51bc13b43102c70fffb6a6a45e24337 at box 4's start (NOT
   moved), so the saved base `lock-base-7a580aefc.json.gz` stood.
2. DONE in box 4, FREEZE: `git worktree add --detach <wt> 110d234f6`, node_modules linked, `chattr -R +i src tools && chattr -i
   src/game/gen2/proven` (exit 0; `touch src/x` -> "Operation not permitted"). `git diff --stat db46ae3e8 110d234f6 -- src tools` empty.
   `tools/engine/lockall.ts` unchanged since 7a580aefc (`git diff --stat` empty), so base and head were hashed by the same tool.
3. DONE in box 4, THE LOCK ALONE (nothing else running; 6 m 59 s; `b4-lock.txt`, head file `b4-lock-head-110d234f6.json.gz`):
   `lock: wrote 3264 builds of 102 stages` / `lock: 102/102 stages unchanged` / exit 0.
   KEY-SET DIFF (R-165.577, the --check skip trap): `keyset: base 3264 head 3264 only-base 0 only-head 0 SAME`.
4. GATES ONCE on the frozen 110d234f6, one at a time (a chain script, `b4-gates-summary.txt`; logs `b4-g-*.txt.gz`):
   - `node tools/timecheck.mjs`: `time-stamp check over cdffdc627..HEAD: 320 commits, 12 files, 2883 lines they wrote, 61 stamps` PASS (exit 0, 2 s).
   - `node tools/roadmapcheck.mjs`: PASS (exit 0, 5 s).
   - `npx tsx --test tools/inspect/tierBots.test.ts`: `# tests 9 # pass 9 # fail 0 # cancelled 0 # skipped 0 # todo 0` (178 s).
   - the CI tool line (gates.yml:157, verbatim): `# tests 355 # pass 354 # fail 0 # cancelled 0 # skipped 0 # todo 1` (266 s); the todo is
     `not ok 170 - chase bots (OPEN, todo): the CHILD bot on Normal reaches the fork on 2 or more of 3 seeds # TODO` (a marked todo, not a fail).
   - suite shard 1/6 (the deploy.yml:38 globs): `# tests 703 # pass 703 # fail 0 # cancelled 0 # skipped 0 # todo 0` (288 s).
   - suite shard 2/6: `# tests 798 # pass 798 # fail 0 # cancelled 0 # skipped 0 # todo 0` (414 s; it was running at the hand-over, so it was finished and recorded).
   - suite shards 3/6, 4/6, 5/6, 6/6: UNRUN (the box ended at 8:18 PM ET; the chain stopped after the running shard, no new gate started).
5. NEXT (box 5): the gates box 4 did not reach, ONCE, on a fresh freeze of 110d234f6 (or reuse these counts: same hash, same code):
   `npx tsx --test --test-shard=i/6 <the deploy.yml:38 globs>` for i = 3, 4, 5, 6, one at a time (each about 5 min here), each counts line.
   Every red: file:line, run ALONE on 7a580aefc (R-165.550 ctestPicker:78 and R-165.576 mixer/support.test.ts:27 are inherited, owned).
6. LAND (the lead's note, box 4): JUST before landing, `git ls-remote origin refs/heads/t-eng-w3`. Still 7a580aefc: fast-forward t-eng-w3
   to the gated head (no force, never rebase), `git ls-remote` equal. MOVED (the tower, ENG-CATCH-k from t-eng-catch-f, may land
   first): merge it BY HASH (no rebase, no force), name every conflict (pipeline.ts likely) and how both sides were kept; then on the
   merged head: tsc; generality; the pre-freeze set vs 7a580aefc (the whole test file of every src/tools file changed vs 7a580aefc plus
   every test that imports one, dispatch-packet.md D168 on the lead branch); re-freeze; the lock --check vs `lock-base-7a580aefc.json.gz`
   with the key-set diff (expected moves: 1-4 from the tower, R-165.573, plus this packet's own named ones: none so far, 102/102);
   all 6 shards; every red file:line and alone on 7a580aefc. Then message the lead the landed hash and every counts line.
7. Lessons applied (box 4): the lock ran ALONE (D115 frozen, immutable tree); the --check skip trap closed by the key-set diff (R-165.577);
   no gate left running at the hand-over (a running gate finished and recorded, the rest named UNRUN); times from `date` only (D42).
   Method update: a one-gate-at-a-time chain script with a STOP file (`b4-gates-summary.txt`) lets a box hand over on the clock without
   killing a running gate or starting a new one; worth putting in dispatch-packet.md's box rule (the lead's call).


**Box 3 hand-over, stamped Fri Nov 27 7:48 PM ET (`TZ=America/New_York date`). Branch t-eng-drop at db46ae3e8 + this report commit (no code change in box 3). WIP,
NOT gated, NOT landed. Box 3 started 7:22 PM ET (`date`: Fri Nov 27 19:22:33 EST 2026).**

## EXACT NEXT STEP (box 4 starts here)
1. DONE in box 3, PRE-FREEZE on db46ae3e8 (A is in it): tsc exit 0; `generality check: 68 engine files (216 exempt under the engine folders),
   26 literals, 26 known PASS`; the 143 importer files WHOLE (`b2-importers-tests.txt`, which holds w3.test, w3Level.test, w3Noise.test and
   tower.test): `# tests 1074 # pass 1072 # fail 1 # cancelled 0 # skipped 0 # todo 1` (1430 s, `b3-importers.txt.gz`; the todo is
   `not ok 708 ... # TODO R-165.312`, the flag placer, not a fail).
   The ONE red: src/game/mixer/support.test.ts:27 "a stone step seated on a deep bank stands; the same stone moved over air still FAILS":
   `no seated island-earth stone in gen2 1-1 seeds 1-24`. **INHERITED:** run alone on 7a580aefc (a detached worktree) it is the same red,
   `# tests 2 # pass 1 # fail 1` (`b3-support-base.txt`), and the same on db46ae3e8 (`b3-support-head.txt`). No workflow line names
   src/game/mixer/ and CLAUDE.md's suite globs do not cover it (so CI likely never runs it: UNVERIFIED, for the lead). Not this packet's.
2. NEXT (box 4): `git ls-remote origin refs/heads/t-eng-w3` (7a580aefc at box 3's hand-over, NOT moved). If it moved: merge BY HASH (no
   rebase), re-run tsc + generality + tower.test + w3Noise + the importer files the merge touched, and record a NEW lock base with
   `--out` on the NEW t-eng-w3 head ALONE. If not moved: the base is `lock-base-7a580aefc.json.gz` (gunzipped: 3264 builds, 102 stages,
   0 errors, checked in box 3).
3. FREEZE: `git worktree add --detach <wt> <head>`, link node_modules, `chattr -R +i <wt>/src <wt>/tools && chattr -i
   <wt>/src/game/gen2/proven` (chattr works on this disk, tested in box 3). THE LOCK ALONE: `npx tsx tools/engine/lockall.ts --layouts 16
   --out head.json --check base.json` (expected `lock: 102/102 stages unchanged`). Pass --out too: lockall's --check SKIPS a build key the
   base lacks (`if (!w) continue`, lockall.ts:47), so diff the two files' key sets (expected equal, 3264) to prove nothing was skipped.
4. THE GATES ONCE on the frozen head (the CI tool line, gates.yml:157; the suite in 6 shards `--test-shard=i/6`, run_in_background with
   timeout 7200000; `npx tsx --test tools/inspect/tierBots.test.ts`), each with its counts line; every red run alone on the base.
5. LAND on t-eng-w3 (fast-forward or merge, no force, never rebase); `git ls-remote` equal; message the lead the hash and every counts line.


**Box 2 hand-over, stamped Fri Nov 27 7:20 PM ET (`TZ=America/New_York date`). Branch t-eng-drop: box 2's commits on 456a84e5f on 7a580aefc. WIP, NOT
gated, NOT landed. Box 2 started 7:01 PM ET.**

## EXACT NEXT STEP (box 3 starts here)
1. DONE in box 2: the CALL and PUNCH toys onto 3-2's row (the lead's ruling, R-165.564 taken from KIT-W3a-f): `stageOf` and `configOf`
   (w3Noise.test.ts:45-46) return 3-2 (ALONG) for every row; every toy's assertion and plant UNCHANGED (the first test's title now names
   both rows; its assertions on 3-1's draft unchanged). **KIT-W3a-f's saved UNVERIFIED pick patch is therefore NOT applied** (this
   replaces it). w3Noise WHOLE on t-eng-drop: `# tests 11 # pass 11 # fail 0` (93 s, `b2-w3noise.txt`): call drawn 0.10 s from 420 px,
   closest 4 px, heard [bell]; punch 200 px woke, 300 px slept; moss 393 px slept (sleeper 295 px off), stone woke [landing] (293 px off);
   plants red as planted (emitter off: never comes; punch off the channel: sleeps on; moss ignored: woke; undeclared: laid 0 of 40;
   tower: laid 0 of 40).
2. DONE in box 2: THE TRIAL-TREE PROOF (never pushed): scratch branch from 7a580aefc, `git merge 38c1b2b20` (clean), (= b4f4e0523), then `git merge
   4ed27da71` (box 2's head; = 36956dca0): ONE conflict, w3Noise.test.ts, resolved as the union = `trial-union-w3Noise.test.ts.txt` (now box 2's
   resolved file; box 1's copy carried KIT-W3a box 5's punch bug). **The punch bug did NOT survive:** KIT-W3a's `: dropClear(st.platforms,
   fl, e.x)` (t-kit-w3a w3Noise.test.ts:152-153) became `: dropRow(row) ? dropClear(st.platforms, fl, e.x) : true` (the drops' fall
   column is the drops' property; the flat punch toy has no top, so dropClear refused every roll of it). tsc clean. w3Noise WHOLE on the
   trial tree: `# tests 12 # pass 12 # fail 0` (85 s, `b2-trial-w3noise.txt`): 1 rows, 2 call (goal = stone 11555, closest 4 px, [bell]),
   3 PLANT emitter off, 4 punch (200 woke / 300 slept), 5 PLANT punch off channel, 6 moss / stone drop (392 px; 304 / 302 px off), 7 PLANT
   moss ignored, 8 KIT-W3a's PLANT wood across the fall column, 9 ENG-DROP in view (3-2 seed 3, 392 px, clean), 10 PLANT undeclared 0/40,
   11 tower 0/40, 12 dropSeen by name. KIT-W3a-f does the real merge from that file.
3. DONE in box 2 (box 1's step 2): one "no top found" roll printed (`b2-probe-notop.txt`, TOP=bank, 3-2 Normal seed 1): the cliff top
   did NOT merge with the ground before it: it is its own 202 px bank (x 13529-13731, y 443) 10 px short of the floor (x 13741, y 974),
   beside the ground before (x 13394-13529, y 518, 75 px lower). The probe missed it because the fall as laid is **531 px, not 400**
   (its finder wants 400 +- 12); dropSeen passed it (531 is inside AHEAD.down 560, nothing across the fall). For the lead, 1 below.
4. DONE in box 2: 3-1's kit rolls (seeds 1-4 x both, `probe/kitrolls.mts`, fingerprint of platforms, enemies, sections, errors, tower):
   before (7a580aefc) = after (box 2's head), 8/8 identical (`b2-kitrolls-31-base.txt` / `-head.txt`); and after A: 8/8 identical
   (`b2A-kitrolls-31-head.txt`).
4b. DONE in box 2: THE LEAD'S A (answered 7:10 PM ET, word for word in the lead's message: "dropSeen also refuses a drop whose finished
   fall is not its declared depth, by name: 'falls N px, not its declared D'"; conditions: tolerance picked and justified in one line,
   box 1's 12 px unless shown why not; planted on one of the 5 rolls first, RED before the fix, refused by name after; re-count 3-2's
   pick over seeds 1-40 x both after it, every refusal named; w3Noise WHOLE green on t-eng-drop AND on the trial tree; inside this packet).
   - Tolerance: DROP_TOL 12 (the pick's own for the laid exit): the roll's tempo spreads a 400 px drop 392-407 px (pipeline.ts:1430
     `dy *= T.rise`), inside 12; the off rolls are 101-159 px off, far outside it.
   - pipeline.ts `dropSeen(top, floor, platforms, declared?)`: after the view's reach, `falls N px, not its declared D` when
     |fall - declared| > DROP_TOL; checkAndRepair passes the section's own `drop` (d.px). Swapped by name like every other dropSeen miss.
   - PLANTED first, w3Noise.test.ts (the last test, "PLANTED (ENG-DROP, the lead's A)"): 3-2 x both, every laid moss toy's finished fall
     within 400 +- 12, and the deeper rolls refused by name; plus dropSeen on a floor 131 px deeper names "falls 531 px, not its declared
     400". RED before the fix (`b2-planted-RED.txt`): laid 66 of 80, OFF 10 = Normal and Easy seeds 1 (531 px), 16 (532), 22 (501),
     30 (559), 33 (506); refused by name 0. GREEN after (`b2-planted-GREEN.txt`): laid 56 of 80, off 0, refused by name 10
     (`w3-noise-toy-moss: its designed drop of 400 px falls 531 px, not its declared 400`, ...).
   - Re-count (box 1's probe, TOP=bank, `b2A-probe-bank.txt`): Normal clean 40/40, toy laid 28/40, laid in view 28/28, 5 x swapped
     "falls N px, not its declared 400"; Easy the same (40/40, 28/40, 28/28, 5 named). Before A: 33/40 laid, 5 of them off (and 39/40
     clean: the one "pool is spent" THROW is gone after A, the swap changes that roll).
   - Why those 5 fall deeper: not the tempo (outside 392-407); something after the lay moves the top or the floor. Not chased (the
     refusal by name is the lead's ruling); box 3 may print 3-2 Normal seed 1's local lay vs the finished platforms for the roadmap.
   - w3Noise WHOLE after A: t-eng-drop `# tests 12 # pass 12 # fail 0` (98 s, `b2A-w3noise.txt`; the plant: laid 56 of 80, off 0,
     refused by name 10); the trial tree (A merged in, d15bca29c, tsc clean) `# tests 13 # pass 13 # fail 0` (92 s,
     `b2A-trial-w3noise.txt`; the plant: laid 50 of 80, off 0, refused by name 12: KIT-W3a's bricks change the rolls). Every toy and
     plant named in both: call, punch, moss / stone, emitter-off, punch-off-channel, moss-ignored, undeclared 0/40, tower 0/40, dropSeen
     by name, A's plant (and KIT-W3a's wood-across-the-fall plant on the trial tree).
5. THE LOCK, run 1 (base, ALONE): `npx tsx tools/engine/lockall.ts --layouts 16 --out base.json` in a detached worktree at 7a580aefc,
   started about 7:06 PM ET, nothing else heavy beside it: `lock: wrote 3264 builds of 102 stages` (9 m 01 s; `b2-lock-base.txt`).
   The base file is committed as `lock-base-7a580aefc.json.gz` (gunzip it; box 3 does not re-run run 1 unless the base moves)
6. PRE-FREEZE on the head (box 2): tsc exit 0; `generality check: 68 engine files (216 exempt under the engine folders), 26 literals,
   26 known PASS` (and again after A: the same, PASS); the importer run: STARTED on the pre-A head and STOPPED when A changed pipeline.ts
   (a run on a stale head proves nothing): box 3 runs it on the post-A head.
   The importers: every
   importer of pipeline.ts / types.ts / stageTable.ts: by resolved import (`b2-importers-tests.txt`): pipeline.ts 175 importers (131
   tests), gen2/types.ts 156 (72 tests), worlds/stageTable.ts 21 (12 tests); union of test importers **143** files. Then
   `git ls-remote origin refs/heads/t-eng-w3` (7a580aefc at box 2's hand-over): if ENG-CATCH-i's tail moved it, merge BY HASH, re-run
   tsc + generality + tower.test + w3Noise; freeze in a detached worktree; THE LOCK run 2 `--check base.json` on the frozen head ALONE
   (expected 102/102); the gates once (the CI tool line; the suite in 6 shards with totals; tierBots); land on t-eng-w3 (no force).

7. **BOX 3 STARTS HERE:** on t-eng-drop's head (A is in it): tsc; generality; the 143 importer test files (`b2-importers-tests.txt`,
   `npx tsx --test $(cat reference/qa-reports/ENG-DROP/b2-importers-tests.txt)`, totals); `git ls-remote origin refs/heads/t-eng-w3`
   (merge BY HASH if moved, re-run tsc + generality + tower.test + w3Noise); freeze in a detached worktree; lock run 2 `--check` against
   the gunzipped `lock-base-7a580aefc.json.gz` ALONE (expected 102/102; A touches only sections that declare a drop, and no listed stage
   does: any move is a red to prove or send to the lead); the gates once; land on t-eng-w3; message the lead every counts line.

## For the lead (box 2)
1. ANSWERED A by the lead (done, 4b above). The question as asked: the 5 "no top found" rolls fall 531 px, not the declared 400: the run lay's pick reads the median lay (exitDyOf) within DROP_TOL 12,
   but on those rolls the finished fall is 131 px deeper. dropSeen judges view (<= 560) and wood, not the declared depth, so it passes
   them. A designed drop should land at its declared depth or be refused by name; that is a new check (a planted roll first), not in this
   packet. Not the tempo: a jump's dy is scaled by the roll's tempo (pipeline.ts:1430 `dy *= T.rise`), which DROP_TOL's own note
   (pipeline.ts:1756) puts at 392-407 px for a 400 px drop; 531 is outside that, so something after the lay moves the top or the floor
   (box 3: print the section's local lay vs the finished platforms on 3-2 Normal seed 1). Your call: box 3 adds `dropSeen` "falls N px, not its declared D" (the toy's 400 +- 12) or it goes on the roadmap.


**Box 1 hand-over, stamped Fri Nov 27 6:51 PM ET (`TZ=America/New_York date`). Branch t-eng-drop on 7a580aefc. WIP, NOT gated, NOT landed.**

## EXACT NEXT STEP (the successor starts here)
1. DONE in box 1: w3Noise.test.ts WHOLE on t-eng-drop, `# tests 11 # pass 11 # fail 0` (`drop-w3noise.txt`; moss 393 px fall, slept,
   sleeper 295 px off; stone woke on [landing], 293 px off; 3-2 seed 2). The first run (`drop-w3noise-first-run.txt`) was 10/11: :329
   "moss: the sleeper lies about 300 px past where he lands (255 px)": off 3-2's cliff he lands about 185 px in, not 140 as off the tower's
   branch, so the toy's SLEEP_T went 0.55 -> 0.6 (the toy's placement for this row; the +-30 px assertion is unchanged).
2. Check the probe's 5 "no top found" rolls (below): the engine's own dropSeen passed them (no swap), the probe's top-finder (gap 8-20 px,
   |dy - 400| <= 12) missed them. Print one (TOP=bank VERBOSE probe) and say whether the cliff top merged with the ground before it.
3. **Ask the lead first (see "For the lead" 1):** on the trial merge the CALL and PUNCH toys are red too, not only moss/stone.
4. The trial-merge proof: DONE in box 1 up to the run. Recipe: a scratch branch from 7a580aefc, `git merge 38c1b2b20` (clean), then
   `git merge t-eng-drop`: ONE conflict, w3Noise.test.ts, resolved as the union (KIT-W3a's PLANTED dropClear test closed with `});`,
   then this branch's four ENG-DROP tests); the resolved file is `trial-union-w3Noise.test.ts.txt` here (copy it over, tsc clean).
   Its w3Noise WHOLE run was started at 6:53 PM with SLEEP_T 0.55 (before the fix above): result in `trial2-w3noise.txt` if box 1
   recorded it. Re-run it with the saved union file (which now has SLEEP_T 0.6): that is the proof on the trial tree.
5. Then packet steps 4-7 as written: the lock (lockall --layouts 16 on 7a580aefc ALONE, then --check on the frozen head ALONE,
   expected 102/102), 3-1's kit rolls before = after, pre-freeze (every importer of pipeline.ts / types.ts / stageTable.ts, by grep,
   with totals; w3.test, w3Level.test, w3Noise, tower.test), `git ls-remote origin refs/heads/t-eng-w3` (it will move for ENG-CATCH-i:
   merge by hash, re-run tsc + generality + tower.test + w3Noise), freeze in a detached worktree, the gates once, land.

## What is built (on t-eng-drop, tsc clean, generalitycheck PASS 26/26 known at each step)
- `SectionTemplate.drop?: number` (types.ts): a section DECLARES a designed drop (px). General: any section, any world.
- pipeline.ts `dropsPast(t)`: on a run (never a tower), a declared drop within the view's reach down (cameraFollow.ts `AHEAD.down`, 560)
  whose exit as laid (exitDyOf, the median lay) is its declared drop within `DROP_TOL` 12 px may exit past the corridor's floor; the
  corridor test in the weighted pick and in the required-section pick both read it. Every section without `drop` takes exactly the old
  test (the exemption is `&& !dropsPast(t)` on the `endY > bottom` side only).
- `fits`: a declared drop is never picked in a tower (`t.drop === undefined || !tower`).
- After it is laid: the run's ground is its landing (`gy = cur.y`, ctop / cbot / baseline from it, as a run leg's), and its own corridor
  is recorded at that ground; the non-routed stray check now reads each section's own corridor (`corridorOf`, set for every run section;
  identical values on any stage with no drop, since gy never moves there).
- FAILURE PATH, by name: `dropSeen(top, floor, platforms)` (exported) on the FINISHED stage, in checkAndRepair: the fall within AHEAD.down;
  no wood across the fall from the lip to `DROP_LAND` (180) px past the landing's near end; the camera's own look from the lip
  (`landingAhead`, the code the screen runs) finds the landing. A miss swaps that section with the why
  `<id>: its designed drop of N px has wood across its fall (x a-b at y c): he lands on that, not the drop` (or `falls N px, past what the
  view shows under him` / `is not what the view looks to from its lip`), never laid blind and never laid as an ordinary section.
  (First version judged at lay time: the probe showed it passed 28 rolls whose fall the finished stage crossed. Moved to checkAndRepair.)
- `DRAFT_TABLE['3-2'] = { kit: 'w3' }` (worlds/stageTable.ts:93; the packet said listed.ts: it lives in stageTable.ts), laid along.
- w3Noise.test.ts: the drop toys (moss, stone) on 3-2's row (`ALONG`), the call / punch toys still on 3-1's; the drop toy declares
  `drop: DROP`; its top is a CLIFF (bank, ground entry), see the root cause below. New tests: the toy laid on 3-2 in view (dropSeen
  undefined, not a tower); PLANTED: the drop undeclared -> laid 0 of 40; a declared drop in 3-1's tower -> laid 0 of 40; dropSeen names
  wood 280 px under the lip and a 700 px fall.

## Root cause found on the way (why a perch top is refused on a run)
The join into a ledge entry lays a soft pit (pitUnder, cur.x -> ox); R-165.246's hole fill (`joinPitFloors` / `pitHoleFill`) then
stretches that floor under the perch to the next earth, which is the drop's own landing bank: 3-2 seed 3, Normal: the pit floor
20497-20832 at y 688 under the top branch 20608-20821 at y 613, the landing 20832-21632 at y 1005. That is wood 75 px under the lip,
across the fall. A walk-off drop on a run is a cliff: with the top a bank (ground entry) the hole fill finds earth at the edge and lays
nothing. (Content, the toy's data, not an engine exemption; dropSeen still refuses any roll where wood crosses the fall.)

## Proof so far (probe: `reference/qa-reports/ENG-DROP/probe/droppick.mts`, 3-2 draft, seeds 1-40, the moss toy)
| top | setting | clean | toy laid | laid + clean | refused by name (swapped) | in view by the probe's finder |
|---|---|---|---|---|---|---|
| branch (perch) | Normal | 40/40 | 0/40 | 0 | 32 x "has wood across its fall" | - |
| branch (perch) | Easy | 40/40 | 0/40 | 0 | 32 x "has wood across its fall" | - |
| bank (cliff) | Normal | 39/40 | 33/40 | 33 | 0 | 28/33 (5 "no top found": step 2) |
| bank (cliff) | Easy | 39/40 | 33/40 | 33 | 0 | 28/33 (5 "no top found": step 2) |
| bank, drop UNDECLARED (the plant) | Normal / Easy | 40/40 | 0/40 | 0 | - | - |

The one unclean roll both settings: `THROW ... no section fits node n# (ketsu): the pool is spent` (3-2's draft pool, inherited; not the toy).
PUSHBACK's own baseline on the same row: picked 0 of 40.

## Step 1 RED, on the trial merge (scratch branch 7a580aefc + 38c1b2b20 = c7ed0b54, never pushed): w3Noise.test.ts WHOLE
`# tests 8 # pass 0 # fail 8` (549 s; `trial-w3noise-RED.txt`). The drop toys: "no roll of 3-1's draft lays the moss toy" (tests 6, 7,
8). ALSO red: tests 1-5, "no roll of 3-1's draft lays the call toy" / "... the punch toy": KIT-W3a's narrowed bricks take the 1000 px
flat floors off 3-1's tower too. Not in this packet's scope; for the lead.

## For the lead
1. The call and punch toys (1000 px flat floors, w3Noise :1-5) are red on the trial merge as well. Recommendation: move them to 3-2's
   row with the drops (they are flat, a run holds them; one line, `stageOf` returns ALONG for every row), proven on both trees. Your call:
   it widens the packet.
2. The drop toy's top is now a bank (a cliff) where it was a branch: the drop, the floor, the sleeper and every assertion are unchanged.

## Not done yet (honest list)
w3Noise WHOLE on t-eng-drop (running at hand-over), the trial-merge proof, the lock, 3-1 before/after, pre-freeze importers, the merge
of a moved t-eng-w3, the freeze, the gates, the landing. Nothing is landed on t-eng-w3.

## Method used / Lessons applied / Method update
- Method: ENGINE.md day one (planted failure first: the undeclared-drop plant), reference/methods/gates.md for what comes next.
- Lessons applied: "A gate must call the same code the screen calls" (D19): dropSeen uses cameraFollow.ts landingAhead and AHEAD.down,
  the screen's own look; check the fact before acting (the probe caught my lay-time check passing crossed falls); never change a rule
  to get around a defect (law 22: the hole fill R-165.246 is untouched; the toy's top is a cliff).
- Method update (proposal): a guarantee judged on a part-built stage must be re-judged on the finished one: later passes (joinPitFloors)
  add wood. Put "judge on the finished stage (checkAndRepair), never at lay time" in level.md / gates.md for any view or fall rule.

## Learned
A run's soft pit before a perch is stretched under it to the next earth: any section that wants open air under a ledge (a drop, a
glide off) must start on a cliff or be refused by name.
