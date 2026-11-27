# ENG-DEAL (R-165.541): the deal follows the code's letters, every slot, every job

## THE EXACT NEXT STEP (box 3; written 12:08 PM ET Fri 11-27 by `date`)
THE LEAD ACCEPTED the 1-8 record move on a condition: `seedlist <id> --check` for 1-8 AND every list on the candidate, plus tierBots 9/9;
all pass -> land with 1-8 named in the commit and here as "intended: graph types now written; no laid field moves"; 1-8's list fails ->
STOP and send it. DONE on `$S/head` (8ad1a8e9): tierBots 9/9; seedlists PASS 1-8 (100), 1-1 (161), 1-2, 1-3, 1-4 (100 each), 1-5 (150),
1-7, 1-9 (100 each); shards 1-4: 725/0, 617/0, 763/0, 736/0. RUNNING: shards 5-6 (`$S/shards.txt`); seedlists 2-1..2-5 then 1-6
(`$S/seedlists.sh`, `$S/seedlists.txt`). When all pass: merge this branch onto a fresh fetch of origin/t-eng-w3 (no force, no rebase),
tsc + generalitycheck on the merge, push, ls-remote, then send the landed hash to the lead AND KIT-W3a-e (session_01FhBbYNzFgpSDqYvvxo7xXs).
### Box 2's step (the lock, done)
LOCK: base 9818cc87 3264 builds / 102 stages; check on 037f82071: "lock: 101/102 stages unchanged", the move "1-8: gen2" (LISTED).
Why (probe `$S/probe18.mts`, 32 builds field by field): the ONLY gen2 field that differs is `graph`: 1-8 (no mix, so the deal returned
early) now carries its code letters' types on 7 nodes (n2 hazard, n3/n10 ground, n5/n13 rope, n7 bounce, n9 hazard); plan, sections,
errors and every non-gen2 part are identical. SENT to the lead with my recommendation (land, 1-8 named intended; the record says what the
code says). WAITING for the lead's word (CI #89: 20 minutes, from the send just after 11:36 AM ET by `date`, then my own recommendation).
Running: tierBots on `$S/head` (log `$S/tierbots.log`), shards 3-6. Then land per item 4.
### Box 1's step (items 1-3 done but the landing)
Branch `t-eng-deal` holds the fix (commit c6340c0d8 on t-eng-w3 9818cc87). NOT gated, NOT landed. DONE: 3-1 w3 + wide, 3-2 and 3-3 old
vs new (below); tsc 0; generalitycheck PASS; CI tool line 50/50; the lock BASE on 9818cc87 (3264 builds of 102 stages, `$S/base.json`);
shard 1 of 6: 725 pass, 0 fail. RUNNING on the frozen worktree `$S/head` (8ad1a8e9; code the same as this branch's head): shards 2-6
(`$S/shards.sh $S`, totals to `$S/shards.txt`) and `lockall --layouts 16 --check $S/base.json` (log `$S/lock-check.log`). Next: read
the check's counts line; a LISTED stage that moved STOPS the landing (send each and why to the lead); tierBots 9/9 if World 1-2 moved;
then item 4, and send the landed hash to the lead AND to KIT-W3a-e (session_01FhBbYNzFgpSDqYvvxo7xXs; the lead's word).
- Own miss (D119): box 1's commit c87cb1d0d ran a heredoc and the commit in one command. The commit is right (pushed, ls-remote matched);
  every later report edit is its own call, before the commit.
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
- 3-1 on the WIDE pool (AUDIT_CAP=20 roll.sh 3-1 wide, down down): KIT's after4-31-wide.txt 17 lines -> **clean 7/8**; one line left,
  easy seed 4 "flags: none before the hard node n5, 14183 px along the way (within 2400 px)" (on KIT's list before; flag spacing,
  not the deal). 31-after-wide.txt here.

## 3-2 and 3-3 on the same KIT tree (wide pool, right/level, KIT-W3b's codes-trim-rolled codes; old = 9818cc87's pipeline)
Line counts sum each "Nx" line. Files 32-kitold / 32-kit / 33-kitold / 33-kit here. Neither stage rolls clean, before or after (0/8).
- 3-2: 144 -> 143 lines. Content-kind lines 8 -> **0**: the S (Sf) node's "content 'f': 1 of 1 sections are bounce" and n11's (Cg) "content
  'g': 4 of 4 sections are floating[, climb]" are gone (n11 now lays ground). Moved: n11's 7 "pool short (n11 combine: no ground section
  left)" now read "no section for the job left" (the same slots, the letter held); NEW on n11: "creatures (&): no creature laid" and
  "threat ocelot*2: laid 0" (World 3 has no ground combine brick with an ocelot: a missing brick, KIT-W3b's lane, now named by the ask
  instead of hidden behind a floating stand-in); S's "threat ocelot*3: laid 1" -> "laid 2".
- 3-3: 250 -> 216 lines. Content-kind lines 22 -> 14; **the 14 left are all 'l' (lure): "no lure laid"**: 'l' has no section type yet
  (TYPE_OF_LETTER has none), so an l node stays free and the ask names it: ENG-LURE's. n11's (Cg) "content 'g': sections are climb /
  floating / bounce" lines are gone, with the same NEW "no creature laid" / "ocelot*2: laid 0" as 3-2; Sb's threat counts moved.
