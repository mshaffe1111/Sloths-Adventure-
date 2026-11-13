# Method: fixing an engine audit's findings (many findings, test-first, with sub-helpers)
Last proven: 2026-11-11/12, t-engine-fixes (EN-F) to e80cf630, 71 commits: 58 audit findings and leads fixed or ruled out by a red-then-
green test, 3 more shown fixed by the base, every helper commit read by a Critic. Owner of the last update: EN-F (engine).

## When to use it
An audit (or several) has left confirmed findings, most with a proof test outside the suite, and the job is to fix them, not re-audit.

## Steps
1. Base: the branch the brief names. Save the base stage lock first, in a worktree pinned to the base (`git worktree add --detach`),
   so later edits cannot leak into it: `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/lock-base.json`.
2. Read each finding's code at its quoted text (line numbers drift between the audit's base and yours). A finding the base already
   fixed is not re-fixed: prove it with a test through the real path (EN-F A-02, input-loop-clock) and say which commit fixed it.
3. Per finding: the audit's test into `src/` (fix imports only, keep the asserts), see it red, fix the root, see it green, tsc, the
   generality gate, the tests that import what you touched; one commit named by the id. A test that passes on the base proves nothing:
   plant the old code (or the wrong fix) and see it red (EN-F A-02 reverted a0760620's hunk; A-05 planted the audit's own fix).
4. Split by area into sub-helpers in worktrees (`isolation: worktree`), each with its own file list; the owner keeps the engine core.
   Cherry-pick their commits as they land, run tsc after every pick (two helpers' commits can each pass alone and break together:
   EN-F's saveFlag signature), and resolve conflicts by keeping both sides' intent.
5. A fresh Critic reads every helper commit, then the owner's own. Every item goes back to its author with exactly what to redo.
6. Final gates once, on one pinned head, after the last pick: the full suite, seedlist, lock --check against step 1, tierBots, build
   and chunkcheck, artcheck, knowncheck, drawcheck, clipcheck, kbdcheck (`setsid` a script that appends each result to one log).

## The bar
Every finding in the report as FIXED <commit> / NOT REPRODUCED <proof> / PARKED <reason>; any changed number or look on screen named.

## Pitfalls we already paid for
- 11-11: four helpers each running the full suite on a 4-core box (load 33): every suite crawled, the owner's was killed by someone's
  process cleanup, and an hour of results was lost. Helpers run only their touched tests; the owner runs the suite once on the merged
  head. Nobody kills processes by pattern (pkill -f): only PIDs they started.
- 11-11: a wide test run in the main checkout froze editing of engine.ts for 20 minutes (a later test file would load the new code).
  Long runs go in a worktree pinned to a commit.
- 11-11: helpers sharing one scratchpad overwrote each other's `engine.bak`. Each helper names its scratch files with its lane.
- 11-11: the audit's "fixed looks like" is a hypothesis: A-05's literal fix (11 px per drawn frame) would have put his head 70 px under
  the HUD at 15 fps. Test the fix the audit names before taking it.
- 11-11: fast helpers write tests from made-up key shapes (`sloth_seed_3-7_seed`) that hide the bug; real keys come from the writer.

## To try
- A gate that plays every stage through loop() headless and fails on any 'frame error' (the Critic's suggestion on A-12).
