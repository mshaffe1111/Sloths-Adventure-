# Method: the engine study (one engine plan for a batch of levels; architect). First written by ENGINE-STUDY-678, 2026-11-13 5:02 PM ET.
Use when designs for 2+ levels are in and the engine work must be planned once (R-165.205). Output: reference/plans/ENGINE-<id>.md, 80 lines or fewer.
## Steps (ENGINE-678 took them in this order)
1. Fetch every branch the designs and the ledger name; `git merge-base --is-ancestor` each PASSED branch against the base: name what is not in (D48).
2. Save the designs to the scratchpad and read the combined NEW-blocks table first, then each design's "Building blocks" line only.
3. Verify each row in code on the base: grep the symbol, read the 5-20 lines around it, cite file:line; EXISTS rows are dropped, rows that share
   one runtime merge. Grep the art inventory (src/game/art/inventory/*.json) for every art row: reuse what is there before buying (D41 sizes).
4. Look for the shared-file bottleneck (engine.ts, pipeline.ts, nodeCode.ts): if 3+ packets need the same file, the first packet is the hook that frees it.
5. Grammar: the code's table (nodeCode.ts CONTENT_OF) wins over the key page and the designs' strings (D7); name every mismatch.
6. Waves by D40 (what the rest sits on first; what a planned job replaces waits or is deferred); two lanes with disjoint WRITE lists.
7. Estimates: per-box $ median from LEVEL-LOG member costs and hours from git commit times (D25), never guesses.
8. Re-grep every cite LAST (D52); fast gates (tsc, roadmapcheck on a full clone: `git fetch --unshallow` then `git fetch origin`, knowncheck, generality).
## Pitfalls
- roadmapcheck fails on a shallow or partly fetched clone ("shallow clone" / "commit ... not in this history"): unshallow and fetch all, then re-run.
- Bash output over ~4,000 characters is trimmed: save long docs to the scratchpad and read them with the Read tool.
