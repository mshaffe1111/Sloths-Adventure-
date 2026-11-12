# INT-E report: the 11-11 engine work merged into one branch, full gate once. Branch `t-int-engine`, base origin/main @585ef376 (0.9.6)
Gate head: __HEAD__ (written 2026-11-12, ET). Each merged branch's own report: reference/qa-reports/EN-S/, EN-F/, EN-W/, AS-2/ (REPORT.md in each).

## Merges (MERGE, no rebase; pushed after each)
1. **t-engine-split @0e45a527** (e0f0a84a): no conflict.
2. **t-engine-fixes @f85a8729** (f47b7aeb): CLAUDE.md's Checks line; kept both (the split's deploy-base build, the fixes' generality gate).
3. **t-engine-wire @9e3ddc56** (ab3fbdc0): engine.ts (help ladder: the fixes' per-engine `this.easy` + the wire's travel mode), helpLadder.ts
   (the fixes' `unshown()` + the wire's `stood(at: Mark)`), tools/engine/seedlist.ts (the split's lazy list files + the wire's listed row,
   quiet judge, yield lines), methods/README.md (both rows), REPORT.md (moved to qa-reports/EN-F, EN-W). Semantic: the wire's
   `withTestStage` wrote into `PROVEN_SEEDS`, which the split replaced with lazy list files: it now plants through seedList.ts
   `plantSeedList` (new, test-only). Chunk plan: the wire's one new start module, `stageModes.ts`, placed in `stagekit` (483f55fb); its
   other new modules (predator kit, ride, stillness, noise, bricks, listed.ts) are not loaded by the game yet; `clock.ts` was already in stagekit.
4. **t-assets-art82 @144924b7** (70a5c8a0): REPORT.md only (moved to qa-reports/AS-2). No code.
5. **R-165.122 from 2a988785** (9d9ebc94): taken alone (WALL_H, hopLay, its test from 892263da, the author's own fix of it), then
   **REVERTED** (3616dfd9) on the lead's ruling (A), 7:54 AM. See "For the 1-1 track".

## The generality gate (the lead's GO, 7:40 AM): green, the known list shorter
The fixes' gate failed on stage ids the wire and split had put in gen2 files. Fixed with no rule loosened (fd3a2703, e4874223):
- the seed-list exemption follows the list to where the split moved it (proven/, provenIndex.ts);
- **worlds/stageTable.ts** (new, world data): ONE row a stage (its kit by name, flags, judged scope, stand-in); listed.ts LISTED,
  reach.ts JUDGED and seedList.ts standIn read rows; no world kit imported there (no import loop between chunks);
- **WorldManifest.pitPainter** (World 1: 'w1Pits'): dropsOf reads the pit rule, not `world === 1` (the thorn bed's 2 new lines and 2 old debt lines);
- known debt vs the fixes' head: **27 -> 21 entries, 38 -> 29 counted literals**; promises11's 3 re-keyed to its 1 remaining literal.

## The gate, once, on __HEAD__ (BASE_PATH=/Sloths-Adventure-/; times in seconds, ET end)
__TABLE__

## Stage lock (lockall --layouts 16 --check lockall-main-0.9.6.json)
__LOCK__

## funcheck vs main @585ef376 (both FAIL on the same debt; the gate is World 1's known list)
__FUN__

## For the 1-1 track: R-165.122 (hop rocks), commit 9d9ebc94 on this branch (reverted by 3616dfd9)
- `seedlist 1-1 --check`: PASS at merge 4 (70a5c8a0, 355 seeds, 208 s); FAIL right after 9d9ebc94: 36 of 355 listed seeds break
  (22 replays differ from their search, 14 over the 4 s quiet line, each on both settings).
- seedListLoad.test "a failed load ... Play builds the stand-in": green at 70a5c8a0, red after 9d9ebc94: 4106 (the fixed first run,
  the stand-in) no longer replays, so Play falls back to a fresh search (got seed 4174630).
- The hop-rock code itself: hopRocks.test 11/11; with hopLay switched off 0/11. Lock with it: only 1-1 moved (pre-run, 101/102).
- It needs, with it: the rebuilt 1-1 list, the first run re-picked, the calibration recommitted (the follow-up's own later commits).

## Matt's test link
__LINK__
