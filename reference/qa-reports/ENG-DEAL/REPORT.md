# ENG-DEAL (R-165.541): the deal follows the code's letters, every slot, every job

## THE EXACT NEXT STEP (box 1; written 11:16 AM ET Fri 11-27 by `date`)
Branch `t-eng-deal` holds the fix (commit c6340c0d8 on t-eng-w3 9818cc87). NOT gated, NOT landed.
1. Scratch trees (re-make if the container is gone): `$S/kit` = worktree of 9818cc87 + `git merge 1b300ebc3` + `git apply`
   origin/t-audit-w3:reference/qa-reports/AUDIT-W3/scratch.patch + `...W3_DOWN_TOWER` appended to w3AuditBricks' return (imported from
   ./w3.ts) + this branch's pipeline.ts; `$S/kitold` = the same with 9818cc87's pipeline.ts; `$S/base` = worktree of 9818cc87.
   node_modules symlinked into each.
2. Running when written: the lock base `npx tsx tools/engine/lockall.ts --layouts 16 --out $S/base.json` in `$S/base`; then
   `$S/rolls.sh`: 3-1 wide (new), 3-2 and 3-3 wide right/level, new and old (codes: origin/t-kit-w3b
   reference/qa-reports/KIT-W3b/rolls/codes-trim-rolled.txt). If gone: re-run them (one at a time, two heavy runs at most).
3. Then on this branch's head, frozen per D115 (src/game/gen2/proven/ writable): tsc + generalitycheck; the CI tool line; `lockall
   --layouts 16 --check $S/base.json` with the counts line (a LISTED stage that moves STOPS the landing: send each to the lead); the
   suite in 6 shards; tierBots 9/9 if any World 1-2 stage moved.
4. Land: merge onto origin/t-eng-w3 (no force, never rebase); send the lead the hash, each shard's totals, before/after counts.

## The defect and its root
- 3-1's n13 `Sf1_<` asks f. Its job is `signature`, and `CONTENT_JOBS` (src/game/gen2/pipeline.ts:837 on 9818cc87) leaves the
  signature out of the mix, so `dealContent` (pipeline.ts:847) never reads n13's letter (its `askedType` at :859 runs only over the
  content jobs' slots). n13 is left with no `content`, and the lay's `jobFits` (pipeline.ts:2296: "a section of another type never fills
  a typed node") has no type to hold: each of its three slots takes any section that serves 'signature'. On the KIT tree that is
  w3-shelf-hops in one slot and the audit kit's ground drops in the others: "1 of 3" / "2 of 3 sections are ground".
- A second, quieter way to the same miss: a typed node, loosened (`loose` 1 when no section of its type is left), took ANY type, and
  a node took an UNTYPED section even at loose 0. For a lettered node both lay a kind the code did not write.

## The fix (general: no stage id, seed or x)
- After the deal, every node whose code writes a content letter is that letter's type (`TYPE_OF_LETTER`), whatever its job. A letterless
  node is left as the deal leaves it (free if outside the mix).
- `typeFits` (one rule, read by the lay's `jobFits` and the planner's pool fit): a lettered node takes only a section of exactly its type,
  at every loosening (loose 2, the job dropped, still holds the letter and keeps its "pool short" note); a deal-typed node as before.
- A lettered node no section fits refuses by name: `gen2 <stage>: node nX asks 'f' (floating): no f section in the pool` (or "no f
  section left for slot k (n in the pool, m laid already)").

## Toys (src/game/gen2/dealLetters.test.ts, the toy legs world)
- a lettered signature node of three slots is dealt three floating: RED on 9818cc87 ("node n4 asks f and is dealt nothing"), green after;
- a letterless signature node lays both kinds over six seeds: green before and after;
- the pool with no floating section: the roll refuses "node n4 asks 'f' (floating): no f section in the pool": RED before (no throw).

## Proof so far: 3-1 on the KIT tree (4 seeds x both, AUDIT_CAP=20 roll.sh 3-1 w3 <trimmed code> down down)
- BEFORE (old pipeline): 15 lines, identical to KIT-W3a's after4-31-w3.txt (31-before-w3.txt here), clean 0/8.
- AFTER: **clean 8/8**, 0 refusal lines (31-after-w3.txt here). n13's 12 lines are gone. The 3 tower lines (blind drops, catch passes its
  storey, flags) are gone only because the plans changed on these seeds; they are not fixed by this change.
