# INT-10 report: 1-6 onto Matt's link (#4). Branch t-int-10 (from t-eng-petal 3802db95). Opus 5.5 xhigh.

## EXACT NEXT STEP
PENDING (filled at the end).

## Done-items
1. Merges: t-eng-dr c3c7e658 (70048a22; 12 conflicts, each listed in its message); t-tools-2 already inside; t-meter-1 cfa9019a
   (d4287944; step 3's meter was on no branch). tsc 0.
2. 1-6 petals (98351f29): gen2/walkedSpan.ts hopArcs + petals.ts arcPetals, opt-in GraphBrief.petalArcs (1-6 only; the lead's ruling
   11:10 AM), apex of the middle tier's flown arc of each REQUIRED hop; w1Arc16 bank rows. Petals an upright screen, Normal layouts 1-5
   (screens.mts; screens-after.txt): 1-6 **0.22 -> 0.98, bare 85% -> 34%**; band 1-3 0.86/51%, 1-5 1.04/48%; 1-2/1-3/1-5 unchanged.
   Bank rows alone 0.46; arcs alone 0.72; take-off+apex+landing 1.41 (over the band). gen2/petalArcs.test.ts 5/5.
3. Meter (f569ae61): the anchor is FIXED 1-1 layouts (tools/difficulty/anchor11.ts; the lead's ruling 11:35 AM): the relist had moved
   every reading x0.87. w1Arc16.test's band reads DIFFICULTY.md. 1-6 Easy gentler by data (snake on your vine + creaky landing: SHORT
   on Easy, were LONG; Normal untouched): **Normal 5.66 (slot 6.5 +-1.5), Easy 3.58 -> 3.18, Easy/Normal 0.63 -> 0.56 (<= 0.6)**.
4. Lists (fc8e047d): 1-1 relisted in order (161/161, same seeds and order; 10 seeds' replays had moved after the t-eng-dr merge,
   check-1-1-before.txt; relist-1-1-diff.txt); first-run lock re-recorded (only collectibles moved, 150->103 / 119->82; at 7e9fe4d8^ the
   old hashes exactly: firstrun-bisect.txt, firstrun-parts.txt); calibration-main.jsonl recommitted (every check's pass/fail unchanged),
   tierBots 7/7. 1-6 list: PENDING. castBots 1-6 / 1-4: PENDING.
5. Pins (cd85f0b9): verdicts.test 5-7/7-1 MAIN second hash: only gen2.fills moved (7-1 80 -> 37 fills Normal: ENG-PETAL's walked path);
   at 7e9fe4d8^ main's exactly (mainpins.txt). Others: PENDING (suite).
6. Gates on the head: PENDING.
7. Plants: planted.py 7/7 RED, restored GREEN (planted.out.txt).

## Polish check
PENDING (stills and the walkthrough clip only on GREEN, rule 29).

## Pushback
- The packet's step 3 assumed the band test read DIFFICULTY.md and the meter was in; both were on t-meter-1, merged here.
- "Model the liana let-go and the double's arrival" (step 2) is NOT done: the arcs closed the density gap; the arrival model is open.
- The meter's anchor sat on list positions, so every relist re-scaled every stage (root fixed, the lead's ruling).

## Suggestions
- 1-7 (0.44/66% bare) and 1-8 (0.46/62%) read thin too: `petalArcs: true` in each brief, then lists + castBots (a level packet each).
- 7-1 lost 43 of 80 socket fills to ENG-PETAL's walked path (verdicts pin): a petal-density check per stage (screens.mts as a test).
- seedlist --check prints at most 20 lines: print a count of every breach kind so a first-run drift never hides (seedlist.ts:72).

## Unresolved
PENDING.

## Learned
- Measure the band before building: 1-3/1-5 set the bar in 17 s (screens.mts), and the first try (bank rows) proved the model, not
  the count, was the limit.
- A meter that scales by list positions moves every stage on a relist: anchor to content.
- The meter's Easy is its swing peaks (30 s window); hops under the free bit do not move it.
- Planted-fault scripts that edit source run in their own worktree while bots/lists run.

## Proposed level.md changes
- New rule: "Petals read inside World 1's band (screens.mts) before a level is called done; a hop-heavy level turns on petalArcs."
- New rule: "A level's Easy is judged on the meter's peak window: soften the swing that sets Easy's peak, not the walking."

## Method used / Lessons applied / Method update
methods/level.md, gates.md, seed-list.md. Lessons: D19 (gate on the played stage), D29, D30 (two typed times: corrected to the lead),
D37, D48, D59, D74. Method update: seed-list.md step 6 add "the first-run lock and the meter anchor".

## Turnover note
reference/handoffs/engine-core.md section 0zg (cd85f0b9).
