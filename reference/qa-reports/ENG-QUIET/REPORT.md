# ENG-QUIET: is a wait for ONE on 2-9's drum "quiet"? (Engine, from t-build-29 4c3ff9d8)

## LANDED (ENG-QUIET-e, 11-27 10:15 AM ET): t-eng-29 28c848dbd -> 7387d089a (fast-forward, ls-remote confirmed). EXACT NEXT STEP: the lead's (2-9's build)
- The one red, re-pinned by property: tools/inspect/firsttimer.test.ts run-up test, old '2-4 child Normal seed 8' -> the first of
  2-4's listed rows (child, Normal) with a run-up jump runPress judged; on this list seed 4 (82.63 s, judged 0.16, flown 0.16).
  Same assertions (a run-up jump; every one held at least as judged; shrine; no rescue), same bot, same setting. Its seed is found, never
  an x. PLANT (startJump's runUpHold max off): RED on seed 4, flown 0.085 s vs 0.16 judged. Rows with the property on 1-60: 4 12 14 19 27
  36 37 48 49 50 55 58 59 (11 of 13 RED under the plant).
- Gates on 7387d089a: CI tool line 429 tests 428 pass 0 fail 1 todo; widened pin grep (185 files) 1458 tests 1443 pass 13 fail 2 todo;
  tsc clean; generalitycheck PASS (26/26). The 13 reds are ALL red on 28c848dbd too (not this lane): src/game/firstTimerBot.test.ts:177
  5-9 KID_RUNS_59 (inherited, R-165.535) and 12 in tools/validate/validate.test.ts + world1.test.ts (on no CI line). On f589b979a the pin
  set was 14 fail: those 13 + the run-up test.
- No shard holds the re-pinned file (the 6 shards are src only). lockall unchanged: a test-only change over f589b979a (diff:
  tools/inspect/firsttimer.test.ts only).
- Countermeasure (D151): the widened grep catches 185 files; release.md item 6 should name it.

## RED, NOT LANDED (ENG-QUIET-d, 11-27 9:35 AM ET): t-eng-29 stays 28c848dbd; the lead rules the next step
- The CI tool line on frozen f589b979a: 429 tests, 427 pass, 1 FAIL (#195 the chase-bots child-fork line is a TODO, not a fail).
  First failing line: tools/inspect/firsttimer.test.ts:369 `not ok 232 - on the run it was found on, 2-4 child Normal seed 8: the
  run-up's jump ... is held at least as long as runPress judged it; the row ends at the shrine with no rescue` -> error 'he made a
  run-up jump' (expected true, actual false). The same test alone: 28c848dbd PASS, f589b979a FAIL. Variant 8 is one of 2-4's 20 rebuilt
  rows (row 9), so the new roll removes the run-up this test was pinned to. The release.md item-6 grep (setPick11|roll11Seed|
  provenSeedFor) does not find this test (it pins a roll through firstTimer(stage, variant)), so the seed-pinning run passed 34/34
  without it. Countermeasure to propose: widen the item-6 grep to tests that call firstTimer/castRun/RealPlay on a listed stage.
- Green at the red: seed-pinning 34/34, tsc, generalitycheck, lockall --check (99/102 unchanged; only 2-1, 2-4 and 2-7 moved, as
  intended), tierBots 9/9, shard 1 691/0, seed lists 1-1..1-5. Still running then: seed lists 1-6.., shards 2-6.
- FINAL GATES on frozen f589b979a (ENG-QUIET-d, 11-27 10:00 AM ET; the lead ruled: ENG-QUIET-e re-pins and lands, not this box):
  seedlist --check ALL 15 lists PASS (1-1..1-9, 2-1..2-5, 2-7). Shards: 1 691/0, 2 692/0, 3 830/1, 4 740/0, 5 635/0, 6 651/0.
  Shard 3's red is NOT this candidate's: src/game/firstTimerBot.test.ts:177 `not ok 208 - 5-9's Easy goal rests on the kid's runs:
  re-measured, they are still the ones recorded (gen2/game.ts KID_RUNS_59)` (actual has 8, 9; expected 3, 5, 6 ...) FAILS alone on
  28c848dbd too (pre-existing on t-eng-29's base; 5-9 is not a stage this change touches; lockall shows 5-9 unchanged).
- Not fixed, as ruled. The fix belongs to whoever the lead names: re-pin the test to a roll that still holds a run-up (properties, not x),
  or keep 2-4 v8's old roll.

## EXACT NEXT STEP (box 4 hand-over, ENG-QUIET-d, 11-27 9:03 AM ET; NOT landed: t-eng-29 still 28c848dbd; work branch t-eng-quiet-b = f589b979a, unchanged in box 4)
1. RULED (the lead, 11-27 9:05 AM ET): KEEP THE ROLLS; C1-C3 logged as one bots row. Go on with step 2 below (gates list as ruled:
   tsc, the CI tool line, ALL 15 seed lists, lockall ONE run (102 stages), the 6 shards, tierBots, generalitycheck), then land on t-eng-29.
   GATES on f589b979a (box 4, in progress at the hand-over): seed-pinning tests 34/34 PASS; tsc clean; generalitycheck PASS (26 literals,
   26 known); lockall baseline re-recorded on 28c848dbd (3264 builds, 102 stages; scratch lock-base.json); shard 1 691 pass 0 fail;
   seedlist --check 1-1..1-4 PASS. RUNNING in ENG-QUIET-d's container: seedlist the other 11 lists, shards 2-6, lockall --check
   (--intended 2-1,2-4,2-7), the CI tool line, tierBots. If that container is gone: re-run those five on f589b979a, then land.
   RULED (the lead, after the hand-over): ENG-QUIET-d lands it once EVERY gate is green (fast-forward only, ls-remote, hash + shard
   totals to the lead); ANY red: no land, no fix, record the red and its first failing line, tell the lead, stop.
   If there is no reply in 20 minutes, take that reversible recommendation and go on to step 2 (box 3's step 3, unchanged: every
   roll/seed-pinning test, then GATES once on f589b979a, freeze per D115 with src/game/gen2/proven/ writable, land on t-eng-29 as a
   fast-forward, message the lead with each shard's totals).
2. If the lead rules "narrow B" or "a pieces lane" instead, nothing in t-eng-quiet-b is kept as is: re-plan from the ruling.

### Box 4 findings (ENG-QUIET-d, 11-27): rule 28, every moved bot row traced
Variants are 0-based (list row = variant + 1). Evidence in box4/ (one probe file per run, named new|old-stage-variant-bot-setting) and
the probes miss.ts (stalls, rescues, lives with the piece under each), geo.ts (blocks, logs, rivers of a variant), frames.ts (his state
changes between two x). The old list = 88b5611b4's src/game/gen2/proven/ checked into a worktree of f589b979a (same engine and bots).
- 2-7 old list on the 35 changed variants (box4/bots27-old.jsonl, done): **309/315 -> new 305/315**. 10 rows worse (kid N v48 v68;
  child N v7 v11 v43 v51 v58 v65 v85; child E v43), 6 rows better (kid N v67; child N v36 v67; child E v27; middle N v36; middle E v16).
  None under the floor either list.
- Every new miss on 2-4 and 2-7 is one of three BOT causes, each also seen on the OLD list; no LAYOUT cause found (the piece each miss is
  in has the same geometry in the old and the new roll, shifted in x/y; so no still: there is no new hazard to show):
  - C1 set-down loop (he walks off a plain water gap without jumping, is set back near the edge, repeats; 3 or 8 times = rescued):
    NEW 2-4 child E v64: root-planks, a 98 px flat water gap 13480..13578, set down at 13410, walks off at 13501 (frames f4105..f4300),
    8 loops, rescued to 13649; the OLD roll has the same gap (13593..13691) and he jumps it at 13611. NEW 2-7 porches: child N v7
    (11795), v58 (11920), child E v43 (11800), kid N v68 (11630). OLD 2-7 porches: kid N v67 (11941, x3), child E v27 (12285, x8);
    OLD 2-1 child E v85 (17470, x8).
  - C2 a 20 s stand at water with logs (never boards), then rescued: NEW 2-4 child E v85: long-relay, stand at 22863 (logs 160 px every
    232 px at 75 px/s, identical to the old roll's), then a 50 px far-bank step at 24192 = OLD 2-4 child E v74's miss (step at 23875,
    same piece). NEW 2-7 at-him child N v11 (8834), v51 (9221); upstream child N v43 (13952), v85 (14202). OLD 2-7 the same stands,
    11-13 s, recovered: at-him v11 (9415), v51 (9858), v43 (8934); upstream v8, v71, v75.
  - C3 the kid rides a no-land log to its end and slides off without jumping for the liana: NEW 2-4 kid N v66: x 16855, 3 times
    (t92.1, 96.3, 104.8), 3 lives at one place -> rescued; the piece is identical in the old roll (log x1 = vine x - 90, speed 100;
    only the liana's swayPhase 0 vs 4). The same slide on the NEW list's passing rows v1 (16839), v64 (16825), v78 (16602), and on the
    OLD list 3 times over 10 old variants (passing). 2-7 kid N v48: 3 water lives in upstream then set down x3 at 13196 (C3 + C1);
    old v48 lost a life in upstream too.
- The 2-4 brief's reading "hangs on drop-ride-drop's vine and is rescued" is not what happened: that vine stall (8136 / 8204, 13-14 s)
  recovers on its own and shows on 7 OLD child Easy rows (v1 v2 v7 v8 v47 v72 v94); the rescues are C1 (v64) and C2 (v85).
- Recommendation: keep the rolls. The moves are the same three bot loops landing on different variants (2-7: 10 worse, 6 better, same
  causes both ways), not a layout the old quiet judge refused for a reason. Narrowing B costs 2-9 what B is for: its let-go and log-catch beats counted busy, so its drum wait is not refused as quiet
  (box 1-3). The bot fixes (C1 take-off after a set-down near an edge; C2 boarding a
  log after a long stand; C3 the jump from a log's end to the liana) are a Critic bot packet, not a pieces lane.

## Box 3 next step (superseded by box 4; box 3 hand-over, ENG-QUIET-c; NOT landed: t-eng-29 still 28c848dbd; work branch t-eng-quiet-b = f589b979a)
t-eng-quiet-b now holds the candidate 88b5611b4 + 74d88d236 (2-1's and 2-4's lists rebuilt under B) + f589b979a (2-7's list rebuilt).
Lists only (src/game/gen2/proven/seeds-2-{1,4,7}.ts + provenIndex.ts); no engine or tools change in box 3. NEXT BOX, in order:
1. 2-4's three new bot misses (below) are UNRESOLVED: trace each (rule 28: two runs per cause, seed, x, frame, what took him) and bring
   the lead a ruling request BEFORE the gates: the child on Easy hangs on drop-ride-drop's vine ("no way on", x 8136 v64 / 8204 v85) and
   is rescued; the kid on Normal v66 is rescued after 3 water lives. Old rolls of those variants: all three PASS. The repeat run
   (castBots 2-4 --seeds 64,85,66 --bots child,kid, both) reproduced all three exactly (same times, same stuck points: the bots are deterministic), so each is one cause, not noise.
2. 2-7's bots on its 35 changed variants (castBots 2-7 --seeds 2,7,8,10,11,14,16,18,19,21,26,27,32,36,43,48,51,58,63,65,67,68,69,71,
   72,74,75,76,79,80,82,85,86,87,89 --setting both --rows): NEW list (frozen f589b979a) DONE: 305/315, none under the floor; misses: kid
   Normal v48, v68 (rescued x1); child Normal v7, v43, v51, v58, v65, v85 (x1), v11 (x2); child Easy v43 (x1) (box3/bots27-new.jsonl).
   The OLD list's run (frozen 88b5611b4) was still RUNNING at the hand-over: re-run it (scratch only) and diff the misses old vs new;
   trace every NEW one (rule 28) as in step 1.
3. Then item 3-5 of the packet: every roll/seed-pinning test (release.md item 6:
   npx tsx --test $(grep -rln "setPick11\|roll11Seed\|provenSeedFor" src --include=*.test.ts)), then GATES once on the final candidate
   (tsc; the CI tool line; seedlist --check on ALL 15 lists; lockall --check ONE run vs 28c848dbd's lock (re-record it: box 1/2's lock was
   scratch only); suite in 6 shards; tierBots; generalitycheck), freeze per D115 with src/game/gen2/proven/ writable, land on t-eng-29 as
   a fast-forward (no force), message the lead: hash, each shard's totals, list verdicts. Ships with release 6, not release 5.

### Box 3 findings (ENG-QUIET-c, 11-27)
- 2-7's OWN cause (packet item 1), named and proven: ENG-26e step 1, 5a67dba93 (t-build-26, 11-21 12:29 PM ET): the drop judge, Easy's
  flags/steps and the water lesson read water through river.ts waterUnder (a storey floor between the fall and the water ends the fall).
  2-7's list (42a5e6ef9) was built on t-build-27e (5a6847ffe) without it; INT-R5's merge b3195f31e ('merge t-build-27e @ 801cae9e8')
  joined them, and from there the search keeps rolls the old judge refused. Seed 3: roll 0's w2-27-stilts at slot 12 was refused
  'verdict drop.unwarned (normal): the first water at x 5326..5468 has no Dot line' (instrumented scratch tree) and is kept now; the list
  holds roll 1 (seed 10946). Proof: 801cae9e8 PASSES; 801cae9e8 + 5a67dba93 alone FAILS the same seeds (3 8 9 11 12 15 17 19 20 22 ...);
  bisect (first-parent) 768e1dcd7 good .. b3195f31e bad. Not on main (2-7 is not listed there): no shipped list is stale.
- Correction to box 2: 2-7 is not 'seed 22' alone. On base 28c848dbd and on 88b5611b4 alike the check fails seeds 3 8 9 11 12 15 17 19 20
  22 ... (the check prints its first 20 lines only), both settings. The rebuild changed 35 of 100 plans. 2-1 and 2-4 likewise moved more
  than one seed each (6 and 20, below).
- Rebuilt lists (seedlist <id> --count 100; every list was seeds 1..100 before and is the same seeds in the same order after, so no
  variant moved to another seed):
  - 2-1 (74d88d236): 100/100, version 1950fa0c -> 0c8ad7fe, quiet longest 4 s; changed seeds 3 9 28 83 86 100 (variants 2 8 27 82 85 99),
    each now its first roll (rerolls 1 -> 0): B's let-go/log-catch beats pass the quiet judge first time.
  - 2-4 (74d88d236): 100/100, version 08c32188 -> 917a538d, quiet longest 3.7 s; changed seeds 2 3 8 9 19 31 48 50 62 65 67 73 75 77 79 81
    82 85 86 95 (variants = seed - 1), each now its first roll (rerolls 1-8 -> 0).
  - 2-7 (f589b979a): 100/100, version dcdc8f40 -> c9e1e269 (the SAME version BUILD-28-e built on t-build-28-wip, 241695723), quiet longest 1.1 s, outro 860-880 px; changed seeds 3 8 9 11 12 15
    17 19 20 22 27 28 33 37 44 49 52 59 64 66 68 69 70 72 73 75 76 77 80 81 83 86 87 88 90 (variants = seed - 1).
- castBots on every changed variant, both settings, old list (frozen 88b5611b4) vs new (frozen 74d88d236), five bots:
  - 2-1 (6 variants, 54 runs each): old 53/54 (child Easy v85 rescued) -> new 54/54; none under the floor. Water lives: child Normal 4 -> 2,
    middle Normal 0 -> 2, expert Normal 2 -> 3.
  - 2-4 (20 variants, 180 runs each): old 179/180 (child Easy v74 rescued) -> new 177/180; none under the floor. NEW misses, all on changed
    rolls: child Easy v64 (rescued x1; stuck 'on a vine at 8136,746 with no way on', then 'set down here 8 times' at 13558), child Easy
    v85 (rescued x2; the vine at 8204,823, water ahead 22863, a 50 px step 24192), kid Normal v66 (rescued x1 after 3 water lives).
    v64's and v85's vine is in w2-24-drop-ride-drop (6036-9128 / 6156-9248) on BOTH old and new layouts; on the old rolls the child
    passes with no stuck spot. Water lives (sum over 20): kid N 18 -> 25, adult N 15 -> 20, child N 75 -> 88, middle N 51 -> 37,
    expert N 56 -> 57.
- Lessons applied: D115 (every run on a frozen worktree; the builds ran in the main tree with nothing reading it), D134 (this step pushed
  before the message), D135 (2-7's red named, not carried as 'inherited'), D140 (notifications read at each boundary), D143.
- Evidence: reference/qa-reports/ENG-QUIET/box3/bots2{1,4}-{old,new}.jsonl, bots24-rep.jsonl (castBots --rows, one run a line).

## EXACT NEXT STEP (box 2 hand-over, 11-26 10:50 PM ET; NOT landed: t-eng-29 still 28c848dbd; candidate 88b5611b4 untouched)
THE LEAD RULED (a), not (b): rule B stays general (rule 22); (b) would keep 2-9's own list search on today's beats (its let-go 5.4 s and
twist still refused, so 2-9 could not list). NEXT BOX (Friday morning), in order: (1) DONE in box 2, base 28c848dbd `seedlist --check`: 2-4 PASS (100), 2-1 PASS (100)
= their staleness is B's; 2-7 seed 22 RED on the base too (same line, both settings) = INHERITED, already stale on t-eng-29 before B
(its cause is not B: name it before the rebuild); (2) rebuild 2-1's, 2-4's and 2-7's lists under B on t-eng-29, every changed seed
traced (the new attempt replayed, bots on it, rule 28), every roll/seed-pinning test re-run (release.md item 6); they ship with release 6,
not release 5. Box 2 (below) found it: rule B moves THREE proven lists' search (not the shipped replays). On frozen 88b5611b4, `seedlist.ts <id> --check`:
2-4 seed 65, 2-1 seed 100, 2-7 seed 22 (both settings each): 'its replay differs from its search (platforms, vines, rivers,
collectibles): rebuild the list' (src/game/gen2/seedList.ts:277). Cause: the list search's quiet judge, tools/engine/listRules.ts:25
quietOf -> :31 pickRoute (eraRoll.ts:180, beats a minute) + the new let-go/log-catch beats, so the search accepts a different attempt
for those seeds. A route-picking-only variant would NOT fix this: quietOf itself is the judgment B changes. Choices for the lead:
(a) rebuild 2-1, 2-4, 2-7's lists under B (their listed layouts change; every roll/seed-pinning test re-run, release.md item 6);
(b) the list search's quietOf keeps today's beats (B for the inspector/score/2-9's line only). Is 28c848dbd red on the same three?
the base check (wt-base) was RUNNING at the hand-over: run `seedlist.ts 2-4 --check` (then 2-1, 2-7) on 28c848dbd FIRST.
DONE on frozen 88b5611b4 (box 2):
- lockall --check vs 28c848dbd's lock (recorded this box: 3264 builds of 102 stages), one run, no --intended: 102/102 unchanged, exit 0.
- seedlist --check PASS: 1-1 (161), 1-2, 1-3, 1-4, 1-5 (150), 1-7, 1-8, 1-9, 2-2, 2-3, 2-5, 1-6. FAIL: 2-1, 2-4, 2-7 (above).
- Suite shards (tests/pass/fail/todo): 1: 692/691/0/1; 2: 692/692/0/0; 3: 831/830/1/0 (KID_RUNS_59, the inherited red: '5-9's Easy goal
  rests on the kid's runs', gen2/game.ts); 4: 740/740/0/0; 5: 636/635/0/1; 6: 652/651/0/1. Only red: KID_RUNS_59.
- generalitycheck PASS (26 literals, 26 known). tierBots 9/9 PASS (candidate only; no base run was started).

## EXACT NEXT STEP (box 1 hand-over; the lead RULED B + the locked let-go wait; C not in; no clock cap)
Candidate: t-eng-quiet-b = 88b5611b4, cut from t-eng-29 28c848dbd (G6 in it; a fast-forward of t-eng-29). It holds: beats.ts
'lianaDrop'/'logCatch' move beats (V, busy for s.dt); score.ts:1156 skips move:lianaDrop/logCatch; route.ts: on a stage with a tempo the
let-go's wait is lockedLianas' (the grid's if there is no tempo, or Infinity); planted tools/inspect/letGoBeat.test.ts, added to
gates.yml:157. Both tests were RED on the old code ('no move beat for the lianaDrop at x 3105'; 'wait 0.300, want 0.283') and are green now.
DONE on it: tsc clean; coveragecheck PASS (16 built stages); letGoBeat.test 2/2.
DONE on the real change (the candidate's tools diff applied to t-build-29, uncommitted, 2-9 lives there; verdicts-after.txt,
sect29-after.txt, rest-before/after.txt):
- 2-9: the let-go and the twist are no longer over 4 s on any seed. Still over: gate 4.9, terrace 10.5-12.0, barge 5.5 (the designer's).
- Fail -> pass (seeds 1-6): 2-1 s3 4.5 -> 3.5; 2-4 s2 4.1 -> 3.4, s3 4.1 -> 3.3 (2-4: 4.0-4.1 -> 3.3-3.4 on all six). NO pass -> fail on any
  of the 16 listed stages. Every other stage: the same number. (2-2 s6's simulated flip was C's: C is not in.)
- restCheck no-rest bursts (inspector report only): 2-1 s3 2 -> 1; 2-4 6-8 -> 0-2. Every other stage unchanged.
- Side effect to know: pickRoute picks the pickups route by beats a minute (eraRoll.ts:180), so more beats can switch that choice.
- The CI tool line (gates.yml:157) on 88b5611b4: tests 429, pass 428, fail 0, plus 1 already-open TODO (chase bots ENG-B4)
  (ciline-88b5611b4.txt).
- lockall recorded on origin/main 4bf2cbaaa and on 28c848dbd (3264 builds, 102 stages each; ~10 min each, kept only in box 1's scratch).
  The candidate's `--check` against the 28c848dbd lock was STILL RUNNING at the hand-over.
NOT DONE (next box, in order; ReadNotifications first, D140):
1. lockall: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on 28c848dbd and `--out lock-main.json` on origin/main
   (each in its own run_in_background call), then on the candidate `--check` against each, with NO --intended: no layout may move
   (against main, name every move t-eng-29's own commits make, D132).
2. `npx tsx tools/engine/seedlist.ts <id> --check` for 1-1 (CI's) and 2-4.
3. Gates once on the final hash: tsc, the CI tool line (gates.yml:157), the suite shards (totals for THAT hash), tierBots,
   generalitycheck.
4. Land: `git push origin t-eng-quiet-b:t-eng-29` (fast-forward, never force); send the lead the hash.
MISS (box 1): one background command used a shell '&' to run two locks side by side, which the brief forbids. Next box: separate
run_in_background calls.

## The answer in one line
The model does not price a wait for ONE as quiet: it hardly prices one at all. Of 2-9's six over-4 s stretches, two (the let-go and
the twist) are quiet because of a model hole (a let-go has no beat). The other four are walking, a ride, and a probe slip. A clock rule
clears none of them.

## 1. 2-9's six, broken into parts (Normal, seeds 1-3, 5, 6; seed 4 throws 'pool is spent' on this tree; parts29-s*.txt, probes/parts.ts)
| beat | over 4 s | walking | waiting for a clock (in the model) | other | why |
|---|---|---|---|---|---|
| gate | 4.9 | 4.6 + 0.24 drop | 0 | 0 | the opening walk (start section into 'hear'), no clock in the model at all |
| let-go | 5.4-5.8 | 1.5-1.9 | 0.33 (lianaDrop wait/2) | boarding swing 0.98 hidden (C); let-go 2.91 = swing-out 1.37 + flat 1.20 + wait 0.33, NO beat (B) | B |
| twist | 5.7-6.8 | 1.9-3.1 | 0.38 | swing 0.98 hidden (C); let-go 2.76 = 1.18 + 1.20 + 0.38, no beat (B) | B |
| terrace | 10.5-12.0 (this tree, N6) | 1.05-2.5 | 1.43 (half a bar for a bucket) | the ride, half a turn: 8.55 | a RIDE; route.ts:417-420 + beats.ts:131 count 0.5 s busy |
| barge | 5.5 | 0 | 0 | the hop on 0.40 hidden (C); 5.05 riding the logs across 1440 px | a ride |
| shrine | 5.0-5.3 raw | 5.1 | 0 | after the posted snapper | quietOf counts only the share before the goal (listRules.ts:38): 0.19, so 0.95 s. NOT over: quiet29.ts skipped the share |

Why the let-go and twist wait 5.4-6.8 s when a bar is 2.85 s: they do not wait for ONE. The model's clock wait there is 0.33-0.38 s. The
let-go move ('lianaDrop', route.ts:482) has no case in findBeats (beats.ts switch, ~:131), so the whole let-go is "nothing to do". It does
not wait for one particular ONE: route.ts:481 prices the let-go from the UNLOCKED grid (lianaDrops: every phase pair, worst 0.67/0.77 s);
the court is LOCKED (lockedDrops: worst 0.17 s, a press on ONE lands, window 2.1 s). Small, but the model is the wrong one.

C (a tie in the beat clock): when the 'river crossing: read the logs' beat (dur 1.0, beats.ts:343) sits at the same base as the move onto
the river, the move sorts first and its busy time runs INSIDE the 1 s read (beats.ts:371 sorts by base only; analyze.ts:44 takes the
max). The swing (0.98) or the hop (0.40) counts as nothing.

## 2. 2-5 (the other clocked stage): how it passes
Counted worst 3.4-3.7 s on seeds 1-6 (parts25-s*.txt). Every stretch over 2.5 s is walking (plus the C-hidden hop or jump, 5 a seed). No
let-go and no wheel on its route, so no clock wait is priced anywhere. It passes because its walks are short, not because its clocks
are priced differently.

## 3. The rule
Proposal (the brief's): a wait on a VISIBLE and AUDIBLE clock counts busy for at most one period of that clock; the rest is quiet. Toys
(probes/toys.ts, toys.txt; P = 2.85 s):
- a one-bar clock wait: busy (0.00 s quiet). Now: 2.85 quiet inside a move's time, 0.00 as a beat's dur.
- a 3-bar idle wait on the clock: 5.70 s quiet, OVER 4. Now: 8.55 inside a move, 0.00 as a dur (a dur is busy with no cap, today).
- a plain stand, no clock: quiet (2.85 / 4.50; the 4.5 s one is over).
On 2-9 it clears NOTHING: let-go 5.4 -> 5.1, twist 5.7-6.8 -> 5.3-6.4, terrace 10.5 -> 9.1. The model's clock waits are 0.3-1.4 s.

What does clear beats, per section (probes/verdicts.ts SECT=1; both only shrink a stretch, never lengthen one):
- B (a let-go or log catch is a move beat, busy for its whole time, like a swing): let-go -> 2.6, twist -> 2.6-3.1. CLEARS BOTH.
  This is the written rule, not a new one: STAGE-RULES line 160 "timing choices ... vines count as action". The model missed a kind.
- C (at one base, a wait comes before the move): barge 5.5 -> 5.1, let-go -> 4.4-4.8. Clears nothing alone.
- With B + C, still over 4 s (the DESIGNER's: something to do, or shorter): gate 4.9 (a walk), terrace 10.5-12.0 (a ride), barge 5.1
  (a ride).

## 4. Listed stages' verdicts (seeds 1-6 each, as the tree has it and with B, C, B+C; verdicts-all.txt)
16 listed stages (1-1..1-9, 2-1, 2-2, 2-3, 2-4, 2-5, 2-7, 2-9), seeds 1-6 Normal, quietOf's measure. Monotone checked on every run
(0 cases where B, C or B+C made a stretch longer), so NO pass can turn into a fail: every proven seed list still passes the quiet line.
Fail -> pass on these raw seeds (the lists are fixed; only a rebuild would take them): 2-1 s3 4.5 -> 3.5 (B), s5 4.2 -> 3.5 (C); 2-2 s6
4.2 -> 3.9 (C); 2-4 s2, s3 4.1 -> 3.3 (B; 2-4's worst falls 4.0-4.1 -> 3.3-3.4 on all six: 48 let-gos/catches). 2-9: no flip (the
terrace ride keeps it over). Every other stage: the same number each way.
Beyond the quiet line, B and C move other readings: restCheck's no-rest bursts (an inspector report only, not a list gate) change on
2-1, 2-2, 2-4 (7-8 -> 0), 2-7, 2-9; and B needs score.ts:1156 to skip `move:lianaDrop`/`move:logCatch` (priced by lianaChallenges from
the segs) or the meter refuses the new beats as unpriced. So B is a beats.ts + score.ts change, with 2-4's and 2-9's lock and meter rows
to re-check.

## Lessons applied
D128 (stamps from `date`), D134 (next step at the top, pushed before the hand-over), D140 (ReadNotifications each step), D145 (a 2-5
number is not a 2-9 ruling: 2-5's pass was read from its own stretches), D130 (the stretch's own parts, not the section label).
