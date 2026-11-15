# INT-10b report: the joined soft-pit floor at its root, the reds of the integrated branches, link #4 (1-6 + 1-7's glancing eagle)
Branch t-int-10b (from t-int-10 1750cdbc; + t-int-10 9d8c9fda, ENG-LOOK d2bc1d89/c738e52f, t-eng-watch2 8fbaaacf). Opus 5.5 xhigh.

## EXACT NEXT STEP
PENDING (filled at the end).

## Done-items (heads pasted from git; evidence in this folder)
1. **Root fix (f2ab9fa6, c40a9bb5)**: pipeline.ts `joinPitFloors`: joined soft-pit floors are ONE piece (a floor to a bank lengthened;
   two at one height merged, the later one out of the stage; a step joins at the deeper floor, the shallower deepened). Planted first:
   the toy RED on the old join (plant-first-red.txt). Slot scan, 8 listed W1 stages, raw seeds 1-10 x2: 1-6 10/20 -> 0/20, others 0.
2. **gen2Pits.test:61** builds each W1 stage's first two LISTED seeds (the lead's ruling A 12:07; 1-8 raw seed 2 is a still-fork
   refusal by name): GREEN; the old join RED on a listed 1-6 seed (4c37695c).
3. **Lists**: seedlist --check PASS 1-1..1-6 on the fix (seedlist-checks-fix.txt), 1-7 and 1-8 on the merged head
   (seedlist-checks-merged.txt), 1-4 on the final code (castBots-1-4.txt). No relist needed. tierBots 7/7 (1-1 runs unchanged).
4. **Suite reds of the integrated branches**: artDress 1-8 dressed (a merge collision: 1-8 built the game's way, dcdb036f); chasePiece +
   chaseRespawn A-07/A-07b (ENG-LOOK cherry-picked, 49/49); writtenKeys (1-9's seed-1, bbefea2c); 1-4 paired petals x4 (e451c649 =
   0f450f06: the climb trail under a fig gate starts at the shut lid's head stop, pairPetals' reach 38 px, the harness's first hand);
   8-3 pins L2/L3 restated with the NOJOIN revert proof = main byte for byte (250e0a71; diff-83-join.txt, sheet-83-L2.png).
5. **t-eng-watch2 merged (71d7bedc)**: 4 additive conflicts kept; a spent sweeper never re-checks or glances (planted); the still
   fork's planted facing test re-pointed at EAGLE.passAt 'far' (its old plant no longer took). Glance kept on the still-fork eagle (lead).
6. **Bots (castBots 1-40, child/middle/expert, both settings)**: 1-6 = INT-10's (child N 38/40: s23, s34); 1-7 all 40/40; 1-8 child N
   37/40 (s7/9/13 identical on t-eng-dr: BUILD-18's); 1-4 PENDING.
7. **Plants**: planted.py 12/12 RED, restored GREEN (planted.out.txt).
8. **Gates on the final head**: PENDING (table below).

## Gates (head PENDING)
PENDING

## Polish check
PENDING (8-3 L2 x 4650/7050 judged: one rock floor, no seam, upright + sideways: PASS).

## Pushback
- The packet's "relist 1-1..1-7 as needed": none was needed; every --check passed on the fix.
- The s23 "regression from the t-eng-dr merge" is not caused by it: the stage and the engine's swing are identical at 3802db95; ENG-B6's
  liana-hop hold only moved the bot's random path onto a fault every liana stage has (below).

## Unresolved (named plainly)
- **A liana swings the hanging hero INTO a bank's face; a let-go there falls through the bank** (1-6 child N s23: x 32697 y 765 vs the
  bank top 726, dead at y 1525; s23-trace.txt, s23-frames.txt). swingSetup clips only against neighbours; swingInto.mts: 40/40 1-6
  layouts have a liana foot under a bank top. Pre-existing on every liana stage; the lead 12:27: a separate xhigh packet (R-165.271).
- **The tree_climb grab takes the FIRST vine in reach in list order, not the nearest** (engine.ts ~2086): in 1-4's 55 px field he snaps
  to a neighbour. fieldPetals' harness sets the first hand; the engine fix belongs with R-165.271.
- 1-6 child N s34 (gorge far wall, ENG-PETAL's stair skill) and s23's pit stuck after the fall; 1-8 child N s7/9/13 (BUILD-18's).

## Learned
- A bot "regression" from a merge can be a random path moved onto an old fault: compare the stage and the engine at both heads first.
- lockall/castBots spawn workers that compile what is on disk: merge and edit in a side worktree, fast-forward after.
- A test that stops at its first miss hides the class: list every miss (pairedMisses.mts) before choosing the root.

## Proposed level.md / method changes
- gates.md: a member's seed-list search reads LISTED seeds for "builds" checks; raw seeds are the list's own business.
- seed-list.md: after a merge, diff the merge's parents' versions of every test the merge touched (artDress paired a stage one side deleted).

## Method used / Lessons applied
methods/level.md (rules 12, 14, 19-22, 27-29), gates.md, seed-list.md. Lessons: D19, D29, D36, D37, D40, D43, D48, D59, D67, D74, D79.

## Turnover note
reference/handoffs/engine-core.md section 0zh (commit PENDING).
