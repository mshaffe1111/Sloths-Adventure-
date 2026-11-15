# ENG-16I REPORT: the moved lists re-proved; 1-6 NOT GREEN (bots), two causes traced, one fixed (R-165.246)
t-build-16 from ba374aee; packet reference/packets/2026-11-14/ENG-16I.md (+ the lead's 9:00 and 9:02 PM orders: petal table first, then
the bot skill, suite + lock, no stills). Code head 9380bc5d; report head below. Start 8:21 PM ET.

## EXACT NEXT STEP
1. ENG-PETAL (lead's): one walked-path petal model for gen2 fillSockets AND petalPass fillGaps, never a pit floor or stair (spec:
   bots/expert-petals-table.md; expert Normal 7/40, child 21, middle 13 are sealed doors). Then relist 1-6, re-prove the 29.
2. The 10 rescued runs left on 9380bc5d (bots/rescues-9380bc5d.txt; vy -157 is the snake's startle hop, engine.ts:5411), each a
   bot skill to plant first (level.md rule 21). Seed, rescue x, frame, what took him:
   kid N s1 x 23710 f4127, kid N s20 x 24025 f3808, kid E s21 x 23443 f3330: snake-on-vine l1, the down-coming snake startles
     him off (or off at the foot with no leap, s20), 3 pit falls; kid N s32 x 32914 f5129: risers l1, startled off backward;
   kid N s14 x 39223 f5747: false liana, he grabs the still one again each time; child N s34 x 43897 f17774 and middle N s34
     f11891: one gorge pit, 8 falls; kid N s2 x 45304 f7724: gorge, 20 s on the last pit's floor ("the way on is 104 px up");
   kid E s18 x 18610 f2715: past the chain, a 241 px wall, 20 s. child E s2: rescued in castBots, clean in the tracer: unexplained.
3. Four suite reds that ENG-16H's commits brought in (GREEN on t-tools-2@19b45a06, RED on ba374aee, before any ENG-16I commit;
   gates/suite-cecbb948.txt): gen2Pits.test.ts:61 (1-6 seed 1 Normal: a slot under a bank beside a pit, the pit floors);
   softFalls11.test.ts:128 (8-3 layout 2 no longer main's ground: pitHoleFill moved 8-3's platforms, lock); stageSheets.test.ts:63
   (W1_ROOMS) and writtenKeys.test.ts:31 (sloth_seed_1-7_seed): the 1-7 merge again. Not traced: cut at the box.
4. The meter: w1Arc16.test.ts:124 "1-6 on the difficulty meter" is the known red (R-165.261's ruler), untouched.

## Done (each with its head)
- seedlist --check (ba374aee code): 1-2, 1-3, 1-4, 1-5, 1-7 PASS (100 each). 1-1 FAILED: 28985, 31449, 25331 searched to new plans
  (walked span), 25331 breaks Easy room-for-help, first-run.drift both settings. Relisted IN ORDER (161 of 162; variants 1-111 unmoved;
  159 plans identical): --check PASS 161 (a75ce97d, again f1e5e25c). First-run lock re-recorded: only collectibles moved; with ONLY
  59a4c0dc's lay hunk reverted the build gives the old hashes, both settings (firstrun-lock.txt; the lead accepted 9:00 PM).
- 1-6 relisted (addlevel --relist, 47447f3b): rolls 24/24 both settings, 100 of 100, version 53afa472, --check PASS.
- castBots 1-6 seeds 1-40 both settings: a75ce97d (bots/castBots-1-6-a75ce97d.txt) Normal kid 7, adult 25, child 21, middle 13,
  expert 7; Easy kid 39, adult 40, child 39, middle 40. 9380bc5d: Normal kid 34, adult 39, child 21, middle 13, expert 7; Easy kid
  38, adult 40, child 39, middle 40; rescued runs ~50 -> 10. NOT 0 rescues, NOT 0 sealed: not green.
- Cause 1 (rescues), fixed in firsttimer.ts (every stage): out of the pit past a crumbled creaky limb, the stair top under the NEXT
  liana beats the walk back (the joined pit floors had opened it); a climb toward it is followed heading forward. A person's way out
  proven (bots/pitout-7-creaky.txt, pitout-3-gorge.txt). pitClimb.test.ts 15/15; plants 2/2 CAUGHT (planted-faults.out.txt).
- Cause 2 (sealed doors), traced, not fixed (lead's ruling): bots/expert-petals-table.md, every left petal classed (29/29, 22/22).
- Merge repair: artDress, forgive, levelWalls tests borrowed 1-7's hand plan, which the t-tools-2 merge deleted (GREEN on both merge
  parents, RED on 8b8dc02a): pair 1-8/1-9, shell 1-8 (ec524b42). The same root, 12 reds in shard 1: t-tools-2 listed and flew 1-7
  (INT-9), t-build-16's judgedTable/listed/verdicts tests used it as the fixture and the never-flown stage: moved to 1-8 (cecbb948).
  Assertions unchanged. verdicts.test's 5-7/7-1 main pins re-pinned: only gen2.fills moved, the revert proof in mainpins.txt.
- Lock (lockall --check vs t-tools-2@19b45a06, on a75ce97d; no non-test src change since): 72/102 unchanged; moved 1-6 (intended) +
  exactly ENG-16H's 29 walked-span stages; goals and size also moved on 1-2 and 8-2 (lock-check-a75ce97d.txt).
- Gates: tsc, knowncheck, generality, roadmapcheck PASS (cecbb948); tool tests 116/116, tierBots 7/7 (87ce9b50: no tools or game
  code change since); build + chunkcheck + artcheck + kbdcheck PASS, seedlist 1-1 --check PASS 161 (f1e5e25c; game code = cecbb948's).
  drawcheck PASS (617 s, 1-6 both ways), clipcheck PASS (83 known), buildcheck alone PASS (Normal p95 131 ms) on f1e5e25c (only
  tests and reference/ differ from cecbb948). Whole suite on cecbb948: 3555 tests, 3548 pass, 5 fail (the meter + step 3's four).

## Polish check
None shot: the lead's 9:02 PM order (ENG-PETAL moves 1-6's petals again). The false liana's warning before the grab is NOT judged.

## Pushback / found
- 1-6's design: with the pit floors joined, a miss off the first liana can walk UNDER the creaky limb to the next stair: the beat skips.
- ENG-16H's walked span did not fix the expert (18/40 -> 7/40) and drops a flower per setting on 1-1's first run (40 px guard).

## Learned / Method update (proposed)
- level.md rule 21, extended: a change to the STAGE's escape geometry (a floor joined, a hole filled) re-runs every bot toy for that
  pit; the old hole hid the bots' missing skill as a lost life (2973477d: 0 rescues, lives 1).
- seedlist --merge --in-order needs --count >= the list's length, or it stops at SEED_LIST_MIN (my first try cut 1-1 to 100).
  My miss: I pushed where.ts (a qa-report script inside tsc) before running tsc; my own tsc caught it. D53 covers qa-report scripts.

## Lessons applied / Turnover
D19 (the tracer reads walkedSpan itself), D29 (roll-pinned 1-1 check and tierBots after the relist), D30 (times from date), D36
(worktrees), D55 (context % each message), D57 (queue read at pushes). Turnover: reference/handoffs/engine-core.md 0zd.
