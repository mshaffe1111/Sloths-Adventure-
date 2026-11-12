# EN-W report, Engine, 2026-11-11 (written 11:36 PM ET). Branch `t-engine-wire` (base t-engine-predators@9bd5cee6 + t-engine-library@cac3a859). No PR.
Tonight's pieces connected on the 1-2 path. Nothing the game ships moved: stage lock 102/102, seedlist 1-1 PASS, on the final code.

## THE REAL NUMBER (step 4), 120 rolls, seeds 1-120, `npx tsx tools/engine/library.ts --seeds 120 --par 3`
| | Normal | Easy | judged by |
|---|---|---|---|
| WITHOUT `--flown` (1-2 as 1-2): no errors | **61 (51%)** | **61 (51%)** | the level check and node code ONLY: **not the verdicts** |
| WITHOUT `--flown`: THROWN | 59 (49%) | 59 (49%) | |
| WITH `--flown` (filed under 1-1): strictly CLEAN | **118 (98%)** | **118 (98%)** | everything: verdicts and flown arcs |
**Read this before quoting 51%.** It is not the same kind of number as the 98%. Two facts, both checked in the code:
- **What throws the 49%: one cause.** 1-2 has no flown reach rows (`reach.ts` JUDGED holds 1-1 only), so `gapFor` uses the unflown double's
  reach, 230 px, and three of World 1's own sections ask 253-256 px: w1-leap-stones 49, w1-two-answers 9, w1-second-jump 1.
- **The 51% that build are not judged by the verdicts.** `pipeline.ts:3081`: a stage with no JUDGED row carries `NOT_JUDGED_ALL`
  (THE BOUNDARY, packet E0a). `drop.look-lies`, `band.out`, `floor.unmarked` never ran on them.
- **So the honest headline is the flown one: 118 of 120 strictly clean (98%), both settings; was 0% strict and 61% / 56% "but for the
  thorn bed".** The two refused: one pool short (descent/climb has one section), one roll with a single-rise 93 px over its band of 80.
- **Why 61% became 98%, checked by A/B** (the finder switched off by an env line, since removed; same 120 seeds): with every hollow
  refused, the generator's own search dead-ended on any plan holding one and handed back its last try. With the hollow true, it swaps
  the failing section (plans differ in 45 of 109 A/B rolls; seed 2: w1-ledges out, w1-mound-log in). No rule was loosened.
- **What 1-2 still needs to drop the flown stand-in:** its own JUDGED row, which by reach.ts means FLYING 1-2. That is data and a
  decision at the boundary, not engine code; I did not add a row.

## Each step's proof
1. **Merge of t-engine-library**: one conflict (REPORT.md). tsc clean; gen2 + worlds 398 of 398 on the merge; seedlist PASS; lock 102/102.
2. **The thorn bed drawn** (`src/game/w1Pits.ts`): `findW1Pits` reports `kind: 'hurt'` off the piece gen2 marks `pit: 'hurt'` (its floor,
   both lips, any height); `drawW1Pits` paints the pit's dark and the art director's cut brambles (catalog rows w1-thorn-bramble-long and
   -bramble-b, from origin/art-director reference/art/cut, now `src/assets/props/pits/w1-thorn-{long,low}.webp`, 26 + 15 KB; no new art).
   Planted test red then green (`briefPits.test.ts`: every hollow on 12 rolls found, none on a stage without). The level check accepts a
   hollow (the flown rolls pass `validateStage`). **Stills** (a test build: the library's 1-2 kit built in the real page, flown rows):
   `reference/qa-reports/EN-W/thorn-bed-1-1-L2-x{26180,27930}-{upright,sideways}.jpg`.
3. **1-2's double counted by the built stage** (a helper in its own worktree, commit 189fba4): `planBudget` sets `doubleTaught` from the
   world's `lessons` (an EARLIER stage only, and only where the old rule does not already count it); the built config carries it;
   `doubleAllowed`, `validateStage`, easyMode, `jumpLinkGap` and the inspector read it. No stage id. Planted test 0 of 5 then 5 of 5;
   with the flag taken off the same eight 1-2 builds are refused. World 1 ships no `lessons` row: no shipped config gains the field.
5. **The one clock on the fixed step** (`engine.ts`, +5 -1 lines): the engine holds a `StageClock`, steps it where `gameTime += dt` was,
   and `gameTime` is its time. `engineClock.test.ts`: 900 steps of the real engine, `Object.is` each step against the plain sum; red
   before. No stage declares a clock, so nothing reads a beat yet.

## Polish check (I looked at the four stills, upright and sideways): PAINTED, NOT YET POLISHED
- Good: real painted thorns stand in the pit's dark, wall to wall; the hurt floor's mossy slab no longer shows under them.
- **Rough 1:** a hollow under about 70 px wide (the chain bricks' are 50-60) reads as a COLUMN OF ROOTS, not a hole: the two banks'
  painted end faces meet across it (the ground painter, not w1Pits). Thorns show only at its foot. This is the worst one.
- **Rough 2:** the slab's left end face still peeks as a small grey-green box at the bed's left foot.
- **Rough 3:** the dark at the bed's foot is a soft rectangle a little wider than the pit. **Rough 4:** brown thorns on dark earth are
  low contrast on a phone; the family's lighter pieces (tangle-flat, mound) would read better.
- Not wired: the two pictures load on the first frame that shows a hollow, not in the stage preload (stageSheets is keyed by stage id).
- The catalog (CATALOG-MASTER.csv) still files both rows under origin/art-director; not regenerated.

## Checks on the final code (times ET)
- tsc clean. Stage lock **102/102** (`lockall --layouts 2`, base recorded at 9bd5cee6). `seedlist 1-1 --check` PASS (200 seeds).
- artcheck PASS, knowncheck PASS. **Main JS 4,000,463 B; base 3,995,402 B: +5,061 B** (the library merge about 1,470, the painter,
  the clock, the double). **chunkcheck FAILS by 6,159 B** (it failed at the base by 1,098 B; this branch makes it worse).
- gen2 + worlds + library + the new tests on the final code, the core suite, drawcheck, buildcheck: see the last lines below.
- NOT run: clipcheck, kbdcheck, tierBots, roadmapcheck (shallow clone).

## What's left, in order
1. Fly 1-2 (its JUDGED row): then the unflown number is the judged one. 2. The ground painter's end faces over a narrow hollow, and
Roughs 2-4. 3. Preload and catalog rows for the two pictures. 4. Bytes: the main chunk is 6,159 B over its limit.
