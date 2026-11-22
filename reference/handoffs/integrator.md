# Handoff: the integrator (merges GREEN branches into a release candidate or test link). Rewritten by INT-R4, 11-22 (release 3).

No role card yet (INT-7/8/9/9b's suggestion: reference/roles/INTEGRATOR.md). Until then: the packet, methods/gates.md "THE FULL SET",
methods/release.md "Before the PR", this note, and the last INT REPORT (reference/qa-reports/INT-R4/REPORT.md, then INT-R3/REPORT.md).

## Open now (release 3 = 0.10.2, target Mon 11-23)
- release-0.10.2 at 5d8a7eb79 = the FALLBACK candidate: main 2a87f4cda + t-ui-372 01cc35139 (2-3 + the edge marker) + t-art-next
  8feca1123 (R-165.379 sheet grades) + the 0.10.2 bump and the lead-approved What's New 'Walk them home'. Reports ride on top of it.
- THE FULL SET on 5d8a7eb79: see INT-R4/REPORT.md's table (run 1 without the suite, then the suite alone).
- Packet step 4 waits on the lead: if t-build-26 is FINAL, merge origin/t-build-26 (2-6 + 1-4), 2-6/1-4 What's New lines to the lead
  first, THE FULL SET again. If the lead calls the checkpoint missed, 5d8a7eb79 is release 3. No PR until Matt's "push".

## How a release integration runs (copy it)
1. Read every branch's REPORT top lines; skip a branch that is not GREEN on its own head and say so.
2. Worktrees: your own for merges and edits (`git worktree add -B release-x.y.z <dir> origin/release-x.y.z`); a FROZEN detached worktree at
   the exact head for the gate run (node_modules symlinked from yours); main frozen in a third (for lockall's base). Never edit a tree a
   run is reading (D115). `git fetch --unshallow` first: roadmapcheck refuses a shallow clone.
3. Install: `npm ci --legacy-peer-deps` (plain npm ci fails ERESOLVE on vite 8 vs esbuild 0.25; CI uses --legacy-peer-deps too).
4. Conflicts: generated files re-made, never hand-merged (catalog: `python3 -I tools/art/hfnext/catalogclips.py <all clips, comma list from
   src/assets/hero/clips/*.webp>`, then `python3 -I tools/art/catalog_master.py --emit`; inventory.test's pinned count re-measured).
5. tsc + the CI tool line (gates.yml's `npx tsx --test tools/engine/library.test.ts ...` line) right after EACH merge (D92).
6. Version bump: package.json AND package-lock.json's own two "version" fields (lines 3 and 9, as 0.10.1 did); What's New top entry in
   Pokey's own voice ('I ...'), at most 4 short lines, sent to the lead BEFORE the commit; whatsNew.test + playerText.test after.
7. THE FULL SET in TWO background runs with a 7,200,000 ms timeout (D122): reference/qa-reports/INT-R4/tools/run1.sh <frozen> <main frozen>
   (INT-R3's fullset.sh without the suite, + fundiff, castcmp, npm run build:store, slotconfirm), then run2.sh <frozen> (the suite).
   funcheck is judged by fundiff.sh (IDENTICAL 22/22 vs INT-14's ruled debt, else a red); castBots by castcmp.py (0 differing rows).
8. A red: bisect in a scratch worktree, measure what moved, show it on the game, then fix at the root or ask the lead with options.

## Traps hit
- The heavy gates are slow: seed lists about 42 min, the suite about 31 min, paintcheck about 15 min, drawcheck 6, clipcheck 4 (INT-R3).
  One chain with the suite in it passed the 2 h tool limit; split it.
- Never `sleep` in the foreground to wait for a run: end the turn; the run's completion wakes you (D113).
- `?layout=N` plays variant N+1 (stageGenerator.ts rollLayoutVariant); a test's setLayoutVariant(v) is `window.__play(id, v)`.
- tsx scripts with top-level await must be .mts.
- `rm -f $VAR/*` is refused by the safety check: use a literal absolute path.
- Times: paste from `date` in the same step; messages to the lead carry no clock times (D109).
- Other members may message you with commits to take: the lead decides scope; say so to both.
