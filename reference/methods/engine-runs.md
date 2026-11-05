# Method: settling spec rows by runs on our code
Last proven: 2026-11-05, branch engine-runs (base engine-mixer 021ef4e93), reference/engine/runs/RUNS.md: all 106 TRIAGE C rows, each with
its command, saved output, number and verdict. Owner of the last update: the engine measurement helper.

## When to use it
A spec or triage row says "settle by a run" (TRIAGE tag C): a number the design rests on that our own code can measure. Not for research
rows (R), Matt's calls (M) or rows answered by a cited source (G).

## Steps
1. **Freeze what you measure.** A detached worktree of each tree at a named commit (`git worktree add --detach <dir> <ref>`, node_modules
   symlinked). Runs that write files (moveladder.ts, inventory.ts) then never touch the planner's tree. Name the commit in the report.
2. **Know which tree is "old".** "Old 1-1" is main; "today's" and "shipped" are the work branch. They are NOT the same builders (on
   11-05 the work branch carried 126 commits main does not, among them the rhythm 1-2 and 1-5). Measure both when a row compares them.
3. **One dump, many measures.** `tools/engine/runs/dump.ts <tree> <tag> <ids> 16` builds every stage the way engine.ts does (Normal:
   `withGoals(generateStage(cfg,'normal'))`; Easy: `easyStage(withGoals(generateStage(cfg,'easy')))`), 16 layouts x 2 settings, with every
   platform flag, trunks, trees, the mixer's node plan (`meta.mix.explain`), pickups, flags. Prove the dump first: it must reproduce a
   number already on record (CP1's old 1-1 row, `cp1/table2.txt:2`, through CP1's own `measure2.py`, unchanged).
4. **Use the measure that exists; copy, don't re-derive.** CP1's `measure2.py` (kinds, runs, shares), CP2's `tag_ideas.py` tag() (idea
   sets), CP3's split rule (`split180.py`), the fun gate (`funcheck.ts`, `core.ts deadWalks`), era/lookalike, bands via `inspect.ts
   --firsttimer`, the jump bots (`jumps.ts inspectJumps`), the first-timer (`firsttimer.ts`), cp2-trace's window probe, moveladder.ts,
   inventory.ts, artuse.mjs's frame collector. Where you must copy a function, copy it verbatim and cite the lines. Write a new measure
   only when none exists, the smallest one, and say so in its header (this run: ladder-uses.ts, support.py, seat.py, views.ts, dial.ts).
5. **Bots: count what the validator method counts** (validator.md step 4): a run with no shrine or over 3 rescues is left out and listed.
   A stage where no run counts is NOT JUDGED, never a pass.
6. **Read the row's own line and hold it.** PASS or MISS against the line the row names, even when the line looks wrong (LAWS 22); a line
   that fights another line is a finding for the designer, written beside the MISS.
7. **Every MISS gets the root cause you can see, with file:line.** Open the line; don't guess from a name. If the cause is the spec's text
   (a stale number, a table not updated after a ruling), say so; the build may be right.
8. **Rows a run cannot settle are named, not dropped:** a meter reading, a build that doesn't exist yet, Matt's eye on a still.
9. **Stills for "reads right" rows:** a dev build (`NODE_ENV=development npx vite build`, served), the engine paused, stepped and rendered
   (tools/validate/stills.mjs's way), 2x, upright 412x915 and sideways 915x412. A scene the builders don't lay goes in through ONE
   uncommitted page-hook line in a scratch worktree (`window.__scratch(this.currentStage)` after the stage is built); label every such file
   SCRATCH. Look at every still before writing its verdict.
10. **Push after each topic; message the lead the counts.**

## The bar
- Every row: the command, the output file, the number (measured, or marked estimate), PASS / MISS / NOT RUN, and for a MISS the file:line.
- Example rows at the bar: RUNS.md #43 (the measure, the count, the guard that exists, the line that lets it through: `w1mix.ts:998`);
  #92 (stills at the three heights, both ways, looked at, and the verdict in one sentence); #121 (the build matches ruling C9; the MISS
  is the spec's table text).

## Checks before reporting
Every TRIAGE C id appears in RUNS.md (a script over both files); counts per topic add up; every output file named exists; no edit to
src/ is committed (`git diff origin/<base> --stat -- src` is empty).

## Pitfalls we already paid for
- 2026-11-05: **a committed tool output can be from fewer layouts than you think.** `tools/engine/moveladder.json` was made at 2 layouts;
  at 16, 19 rows change (snake first 1-3 -> 1-2, caiman 6-4 -> 6-2). Re-run at 16 before quoting it.
- 2026-11-05: **the quick clock does not time climbs.** `stageTime.ts:152` times an ascent from `meta.ascentChain`, which the hand
  builders don't record: 1-4 reads 3 s. Leave those stages out of length pairs and say so.
- 2026-11-05: **support from the stage data is an upper bound.** Trunks (`proto.trunks`), trees (`stage.trees`) and resting pieces are
  in the data; gen2's columns and 1-2's scenery kapoks are only drawn. Dump `trees` (the first dump didn't, and read the old stages'
  kapok-held logs as floating).
- 2026-11-05: **the jump bot's success does not depend on landing width** from 90 to 300 px (risewidth.txt); it cannot choose a width.
  Use the real-engine window probe for that.
- 2026-11-05: **a bot run that never reaches the shrine is not a measure of the animals in it** (2-5, 2-9: every adult run ended at the
  sealed door). Count only what the validator counts.
- 2026-11-05: **ruled rows change the line.** Read the "Contradictions ruled" block (ENGINE-SPEC C1-C30) before judging: C9 made 1-2 the
  creaky and liana teach, C14 moved the neighbour rule to our own metric, C15 made cost lines history.

## Tried and didn't work
- Laying a scratch scene into the running engine from the page after the stage loaded: the draw caches its plans at load, so new pieces
  don't draw. Lay it at build time (the page hook) instead.

## To try
- A glide count in tools/validate/mechanics.ts (gaps only a glide clears), so the ladder can hold glide (#123).
- An E3 support check in the engine that reads the draw's own supports (columns, scenery trunks), replacing support.py's upper bound.
- era.ts at 200 rolls as the default for the neighbour rows (R3 F6: 16 rolls can't show the spread).
