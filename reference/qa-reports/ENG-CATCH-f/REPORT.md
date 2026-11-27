# ENG-CATCH-f: the down tower never lays a catch twice; the tower guarantee onto t-eng-w3 (R-165.561)

## EXACT NEXT STEP
(stamp: HANDOVER_STAMP)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message; the code is 056b22736 = 5330e490d's fix + t-eng-w3 7a580aefc merged;
the commits after it are this REPORT only). Steps 1-4 DONE (below); step 5 partly done; steps 6-7 NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run tower.test.ts + towerMend.test.ts + w3Noise.test.ts whole.
2. Finish step 5: PRE_FREEZE_LEFT
3. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
4. Step 6, the gates once on the frozen head: the CI tool line; the suite in 6 shards with totals; THE LOCK as two runs ALONE (nothing
   else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` in a detached worktree at 7a580aefc, then
   `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is EXPECTED only where its old lay put the same
   wood twice (it now lays it once or tries the next anchor): prove each move is that (compare the two lays' catches) or send it to the
   lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
5. Step 7: land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal,
   message the lead the landed hash and every counts line.

## The red, and its root (RED FIRST, on f5f2aa16e)
- src/game/gen2/tower.test.ts WHOLE on f5f2aa16e: 44/45. :856 (ENG-CATCH-b's toy: going down, a bridge started a hop past a vine's
  top that misses the end's fall line), assertion 'no catch is laid twice' (:869): 3 !== 12.
- Traced (a stack print in `put`, removed): the 12 catches are rule 2's bridge 654-716 at y 1256 PUT 10 TIMES by the first lay
  (layCatches(false), the bridge at tower.ts ~:520), then 716-1033 once, then the mend's catch 554-650 under the fall line (keep, remedy
  2/3). Why: the bridge a hop past the vine's top (x 554 + TOWER.hop + 30 = 654) misses the shelf end's fall line (x 626), so the end
  stays open, and each of the lay's 10 passes bridged it again from the same storey. Nothing in `put` refused wood already there.
- Why green on d49de60f0 and red from ENG-CATCH-c box 1 on: the duplicates were always in the first lay; before the mend, the
  second lay (cover = true) left fewer misses and was returned. The mend inside layCatches mends the first lay too, so the second is no
  longer strictly better and the first lay, duplicates and all, is returned. The mend did not lay a catch twice; it exposed the lay
  that did. (The bisect the packet named, by remedy, is answered by the trace: no remedy of the mend puts the duplicate.)

## The fix (general: no stage id, seed or x)
- tower.ts layCatches `already(x0, x1, y, but?)`: wood wholly on solid wood already at its height (|dy| <= 1) lays nothing new.
  `put` refuses it and returns false; every caller counts a piece only when it was put (rule 1's run-on falls through to rule 2; rule
  2 tries the next anchor; rule 3, rule 4's pick); the mend's keep refuses a bough put refuses, and a piece laid again (remedy 1) onto
  wood already there; trimKeep never trims a piece onto other wood; reLay never moves a piece onto other wood. So every catch in a
  tower's final lay is distinct, by construction, on every path that lays or moves one.
- The toy's lay now: 654-716, 716-1033, 536-716 (3 catches, 3 distinct; the shelf's end caught under its fall line, no blind drop).
- PLANT: `put`'s refusal line removed -> tower.test.ts:856 RED (3 !== 12); restored -> green.
- tower.test.ts 45/45, towerMend.test.ts 13/13 (commit 5330e490d). tsc 0; generalitycheck PASS (26 literals, 26 known).

## Merge of t-eng-w3 7a580aefc (by hash, no rebase)
- `git merge --no-ff 7a580aefc` -> 056b22736. NO CONFLICTS: pipeline.ts (both sides changed it: the guarantee's reroll in
  buildRolledOn here, ENG-ROOT / ENG-DEAL there) merged by git with both sides' hunks kept; 50 files from t-eng-w3, tower.ts untouched
  by it. tsc 0; generalitycheck PASS (26 literals, 26 known).

## Open finding (named, not fixed in this box)
- No catch is laid twice now, but a LATER, wider catch may still lie over an earlier one: the toy's 536-716 lies over 654-716 (same
  height). Physically harmless (no new footing, no new end), but two planks drawn over each other can show an end cap in the middle of
  a plank. Proposed next step for the lead: the same rule the other way round (a piece put wholly over laid pieces takes their place),
  with its own planted test; it changes which pieces are listed, so it needs the lock.

## Polish check
Engine-only (the lay). No screen changed in this box; the overlap above is the one rough spot it can show, named.
