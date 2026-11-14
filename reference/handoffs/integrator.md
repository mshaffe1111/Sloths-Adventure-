# Handoff: the integrator (merges the GREEN branches into the next test link). Rewritten by INT-9, 11-14.

No role card yet (INT-7's and INT-8's suggestion: reference/roles/INTEGRATOR.md). Until then: the packet, gates.md, release.md (test
link part), this note, and the last INT-n REPORT (reference/qa-reports/INT-n/REPORT.md).

## Open now (INT-9 stopped 4:17 PM ET 11-14 at the lead's word, before item 6)
- origin/t-int-9@0c1d3cab holds link #3 minus the new 1-6. The next integrator starts at INT-9's REPORT "EXACT NEXT STEP":
  merge t-build-16 when ENG-16F is GREEN, delete the old 1-6 (R-165.238; requiredMove.test is RED until then), the D70 line review,
  roll every listed stage, the full gate run once on the final head, 1-6 stills and clips, then the lead builds EnK5.
- The strip-join list (qa-reports/INT-9/haze/strip-joins.txt) goes with POLISH-10's STRIP-JOINS packet (R-165.237c), not to the integrator.

## How INT-9 ran (copy it)
1. Read every branch's REPORT top lines; skip a branch that is not GREEN on its own head and say so.
2. One worktree per job: the main checkout for merges and edits, a FROZEN worktree (`git worktree add --detach`, node_modules symlinked)
   for gates and the served build (`npx vite --port 3218` there), a scratch worktree for bisects. Never edit a tree a run is reading.
3. Conflicts: a resolver script (keep ours / theirs / both / custom per hunk), every choice written in the merge commit. Generated
   files are re-made, never hand-merged: inventory/*.json from CATALOG-MASTER.csv (`python3 tools/art/catalog_master.py --emit`),
   NODE-KEY.html (`npx tsx tools/engine/nodekey.ts`). CSV: union by id, the newer row where both changed.
4. Right after the merges and tsc: roll every listed stage (`npx tsx tools/engine/libstage.ts --stage <id> --seeds 8`) and run every
   list's `seedlist --check`. A clean merge can still leave a stage unrollable (INT-9: POLISH-6's settle vs 1-7's pits). Bisect by
   merging two branches alone in the scratch tree; probe with an env-gated log, never a committed one.
5. Fix at the root with a planted test, or stop and ask the lead with the options; never ease a gate's reading (LAWS 22).
6. Then the full gate script (qa-reports/INT-9/gates/run.sh: gates.yml's tool line read from the file), stills and clips last.

## Traps hit
- `grep -o '...[^\n]*'` stops at the letter n (basic regex): read a workflow line with python, not grep.
- Shooters copied one folder deeper need their `root` path fixed; clip tools need `PW=/opt/node-tools/node_modules/playwright/index.mjs`.
- stills-at-setting.mjs marks every tip shown: it cannot prove "no tip on the floor". Use TIPS's tipsclip.mjs (real time, Dot's bubble).
- No `sleep` waits (D67): Monitor or run_in_background notices.
- A time in a message is pasted from `date` in the same step (INT-9 typed one 2 minutes ahead: D30).
