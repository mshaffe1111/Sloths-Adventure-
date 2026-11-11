# E0a report (R-165.61: verdicts and flown reach), Engine, attempt 4 (attempts 3, 2 and 1 below, as they stood). Branch t-engine-e0a from t-engine-putback@41c2e248
**Method used:** test-first on planted rolls. Main's lock recorded before the first change. Every reach and band figure is entered as data with its spec line. The verdicts were then run on the 138 listed seeds and the full suite was diffed against A1's base.
**Lessons applied:** D37: the behaviour claims are proved with a pasted run (1-1 builds below), not taken from a summary. D36: worktrees for main and the base, own branch checked with `git status -sb`. The pins come from origin/main, never from memory.




## Attempt 4 (51a7c617): the lead's ruling on what closes a slot
`realFalls`: a slot is closed only by a solid piece AT its lip level, meaning its top is within 10 px of a lip or it plugs the lip. The piece must also have no lower floor inside the slot that he could step off and walk in under. Red first on ddc10c90 (seed 172 was not refused); it is green now.
- Seed 172 x30784..31835 is refused: a real hole.
- Seed 476's stone still plugs its slot.
- Attempt 5 (96dd2fd9, the lead's second line): an opening under his body (32 px) is no drop whatever covers it, and a piece he can pass under closes nothing. So seed 323 (23 px) is not a fall and seed 172 stays refused. Red first; verdicts tests 30/30 with promises11; lock 101/102.
**Re-run:** seedlist --check refuses 138/138. By name: teach.double-no-gap-after 138, band.out 131, floor.unmarked 109, block.lesser-passes 62, block.spare-thin 52, drop.untyped 31. Lock: 101/102, exit 0. verdicts.test: 28/28. Main chunk: 4,180,585 bytes.
**Full suite, 3 shards:** 822/68, 775/32 and 754/26 pass/fail. That is 126 failures, all because 1-1 cannot build (123 by its error text; the dump child, the seed-list test and recipes.test build 1-1 too). A1's base has 0.

## Attempt 3 (d88d8fcd), superseded by 4
petalPass.ts `reachOpts` passes linkArcs on 1-1 (:32, :44, :94); red first, a flower past a 256 px gap. Spare-thin rounding is pinned by a test. Its first realFalls was replaced in attempt 4.

## Attempt 2 (the Critic's 3 verdict bugs and the lead's finish reach), f7207710 + this commit
Each fix had a planted red first (verdicts.test.ts tests 22-25). The reds were run before the fix: Normal bank `134 x16 not in 136-140`, classify `double-teach-rise` where `single-rise` was expected, `the far bank is reached (1)` was false, and the headroom asserts failed. After the fix, verdicts.test.ts is 25/25.
1. **A bank is a block.** `thinLaid` reads the shape the way layStage builds it: bank is a block; branch 24 and stone 22 are thin; hollow uses its art's height. Normal D now lays 136-140 and Easy 128-132. w1.test's exitDy failure is green with no change to w1.ts.
2. **headroomOf** counts only solid pieces 50 px or taller, over the 70 px take-off run and the flight, never over the landing. headroom.cuts-arc now refuses 0 seeds (was 39).
3. **classify(a, inTeach, setting).** A 'double' place that is not a declared double block, and whose figure fits the single band, is now a single section.
4. **stageGenerator `finishReach`.** 1-1 passes the flown arcs (linkArcs) to validateStage; other stages behave as before. Test: a flower past a 256 px gap stays, on both settings; 1-2 still uses the closed form.
**Re-run results:**
- seedlist --check refuses 138/138. By name: teach.double-no-gap-after 138, band.out 131, **floor.unmarked 113 (it did NOT fall away)**, block.lesser-passes 62, block.spare-thin 52, drop.untyped 34. The new floor.unmarked hits are 60 px unmarked gaps in the full search (seed 476 Normal x 22458..22518). Replaying the stored plans gave only 9, so the moved envelope lays new 60 px seams. Cause not found yet: OPEN.
## 1. Done-items (6): 1, 2, 3, 6 met; 4 met as a measurement (nothing could be re-proven); 5 NOT met (see Pushback)
1. **Each name planted** (verdicts.test.ts, 21/21 green). There is one red per name, printed as `# red:` in its own test: arc.single-gap-over, arc.single-rise-over, block.lesser-passes, block.spare-thin, block.taught-fails, band.out, headroom.cuts-arc, floor.unmarked, drop.lethal-in-no-lethal, drop.unwarned, drop.look-lies, drop.untyped, teach.double-no-gap-after, teach.double-gap-unsafe, first-run.drift (firstRunVerdicts). A clean twin is accepted on both settings. reach.unflown appears only in the notJudged list of an unflown-scope roll (1-2 Normal), together with the 7 arc names. A test also reads ALL_VERDICTS against the 16-name union in verdicts.types.ts. verdicts.types.ts is byte-identical to c4687177.
2. **Flown figures on 1-1's path.** reach.ts holds every row of reach.md §2 and bands.md §1-2, each with its `source`. On 1-1 the pipeline reads it through `gapFor` (level double 262 N, not 229.8), `riseCap` (Easy double 132 / thin 128, not 113.9), `bounceLipOverCap`, `blockBreaches(arcsOf)`, and the seam stone's `jumpOK`. checkStage passes `validateStage(…, {arcs})` and promises11 runs `doubleGap` on lesser/link arcs. The test strips comments from verdicts.ts and reach.ts and finds no reachJump, JUMP_RISE, DOUBLE_RISE, BOUNCE_REACH, TAKEOFF_SLACK or physics. It also pins the 1-1 envelope figures.
3. **Outside 1-1 nothing moved.** `lockall --check lockall-main-0.9.5.json --intended 1-1` gives `101/102 stages unchanged` and exit 0. Only 1-1 changed (intended). The lock names the stages whose gen2 gained verdicts and drops, which are not hashed: 5-7, 5-9, 6-1..6-9 (7 stages), 7-1..7-9 (6), 8-1..8-9 (7). Test: 5-7 and 7-1 on both settings hash equal to origin/main@181d2846 (platforms, falls, errors and plan, plus gen2 less the two fields), and each carries NOT_JUDGED_ALL plus one Drop per fall. `falls` is untouched everywhere.
4. **Seed list.** `seedlist 1-1 --check` (full search, both settings) prints FAIL, exit 1: "the verdicts refuse **138 of 138** listed seeds". Seeds refused by each name: teach.double-no-gap-after 138, band.out 130, floor.unmarked 112, block.lesser-passes 66, block.spare-thin 52, headroom.cuts-arc 39, drop.untyped 31, drop.look-lies 1. Replaying the stored plans instead also refuses 138/138 (band.out and block.lesser-passes 138). Re-prove: seeds 1-40 kept **0 of 40**, and provenGen2Stage's 24-seed walk finds none either. provenSeeds.ts is NOT rewritten: an empty list moves the same throw into Play. It stays stale, and `--check` FAILS by name until C1. The first-run check is wired (firstRun11.ts, absent: stated).
5. **tsc clean; vite build passes; artcheck and knowncheck PASS.** **The full suite is RED:** 822/68, 775/32 and 753/27 pass/fail across the 3 shards (127 failures, bc7e1f9a). A1's base on the same shards is 784/807/784 pass, 0 fail, so every failure is E0a's:
   - 126 come from "1-1 cannot build": the error is `gen2 1-1 (normal): no seed of 24 from 172 builds cleanly … verdict band.out … bounce-teach 212 px, under 232`. These include the CT/climb tests that host toys in RealPlay('1-1'), the dump child, recipes.test, and V19b and the forks ("0 clean rolls").
   - 1 is w1.test's exitDy row (w1-stair-test/b -416 laid -390, and two stair-test-back rows): the thin rise clamp is now the band's 134 where the authored value is 138. That is C1's data.
   - gapPx.test was updated to the new rule (the Easy double envelope is the flick, 287; past it the lay refuses by name).
   - roadmapcheck FAILs on the shallow clone (environment). drawcheck and clipcheck were not run: they build 1-1, which throws.
6. **Turnover note:** reference/handoffs/engine-core.md is rewritten (§0a rulings, open row, §2 files, traps 15-16).

## 2. Polish check
No screen changed and there are no stills: E0a is gate code. The visible effect on this branch is real and bad: **1-1 does not build at all** (the pasted error above). It must never reach a test link or main without C1.

## 3. Pushback (rule 3)
- **DoD 5 cannot be met while DoD 4 holds.** The frozen bands refuse every roll today's w1.ts can lay. DOUBLE_TEACH gaps of 195-203 are crossed by one jump (246). Bounce lips of 200-220 are climbed by a bounce alone (223). Thin double rungs of 136-140 are over the thin band (128-134). So 1-1 throws and about 125 tests that build Play's 1-1 go red. No honest switch exists (no on/off: "new replaces old"). The full suite can only be green on the E0+C1 integration branch, as ADR-001 says. Ruling asked: move DoD 5 to the integration branch, judged after C1.
- `Gen2Meta.verdicts` is `Partial<Record<Difficulty, RollVerdict>>` and optional, not the PACKETS.md `Record`. A Normal build never builds Easy, so it cannot hold Easy's verdict without doubling build time. An Easy build carries both.

## 4. Suggestions (ready packets)
- **C1:** classify reads `move`/`block` and the landing's thickness. A 'double' piece with dy above 50 px is the rise form, and a level one is the double gap (Normal only). A bounce lip in a T-node is the teach (232-246), elsewhere the U/V test (236-250).

## 5. Unresolved
- Raised gaps were never flown. On 1-1 they keep the closed-form envelope capped by the band, and validateStage adds flown links only for level jumps (20 px or less). A Designer flight of raised gaps would retire that last closed-form use.
- rulers.ts holds no reach figure (grep), so nothing there changed.

## 6. Method update
Before attributing failures, run the full suite on the base branch in the same shards, then classify each failure by its error text. Here that showed 126 of 127 share one cause.

## 7. Turnover note
reference/handoffs/engine-core.md, rewritten this task.
