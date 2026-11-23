# Architect turnover note (rewritten 2026-11-23 by PLAN-2H; the 11-10 note's rulings kept below)

## Open
- **The piece plan is TWO-HOUR-PLAN.md** (reference/plans/, PLAN-2H 11-23, t-plan-2h): §The truth table (75 pieces, 10 kits, art per
  world), §Per stage (2-8..10-9 + 10 hidden), §The schedule (6 waves, one row per piece, GREEN-by dates), §The risks (R1-R8). It
  replaces ENGINE-NEEDS.md §1-2 (11-13); ENGINE-NEEDS §3-4 (ADD-LEVEL, the vine field's returns) still stand.
- Waiting on the lead: R5 (two piece members through Waves 1-2, or World 3 and World 4 slip a week); ENG-PROWL off LANES (landed 11-20);
  main merged into t-eng-27 before BUILD-27 (its coverage table and LINE_SKILL are behind main).
- Refresh the truth table at the start of every wave (each Monday): re-run the reads in reference/methods/piece-plan.md and flip rows.
- From the 11-10 note, still open: E0's verdict schema (ADR-001/002) and the frame-time gate (R-165.65) are not re-checked here.

## Where things live
- What gen2 can lay: PlaceRule (gen2/types.ts:295-342), SectionZone (gen2/types.ts:492-494: tide, wind only), GraphBrief fields
  (gen2/types.ts:696; t-eng-27 adds pacer, post), WorldManifest tables (gen2/types.ts:110-239: rivers, pads, wheels, creak ...), the lay
  files gen2/*Lay.ts, legs.ts (travel by leg), tower.ts (up/down).
- Which stages are designed-arc rows: gen2/worlds/stageTable.ts (1-1..2-5 on main). Worlds 5-8's OLD gen2 kits: gen2/game.ts:90-96.
- Bot skill + meter channel per piece id: reference/design/meter-coverage.json (bot = tools/inspect/firsttimer.ts symbol, channel =
  tools/difficulty/score.ts symbol); the gate is tools/difficulty/coveragecheck.ts (holds stage-table rows + shipped worlds).
- Per-stage mechanics from the map: reference/qa-reports/ENGINE-NEEDS/map-tally.txt. Designs: 2-6..2-8 on t-design-26, 2-9 on
  t-design-29, 3-1/3-2 t-design-31-32, 3-3..3-5 t-design-33-35, 3-6..3-9 + 3-hidden t-design-36-39 (each `**NEW n**` line is a piece).
- Art per world: src/game/art/inventory/wN.json (cols: world_best, engine_slot 'landing/...' or 'climbable/...', scale_ok).
- Decisions (11-10): reference/architecture/ADR-001-verdicts.md, ADR-002-first-run.md; types in src/game/gen2/verdicts.types.ts.

## Rulings to keep
- A piece lands WITH its bot skill and its meter channel, proven on a real stageTable row (D75), or it is not done (TWO-HOUR-PLAN).
- PART (runtime exists, gen2 does not lay it, or one old kit does) counts as MISSING for READY.
- A verdict is a name in VerdictName; a roll is a tagged RollVerdict; no "accepted with warnings"; out-of-scope checks are listed in
  `notJudged`, never dropped. One PromiseRegistry feeds promises11 and seedListBreaches.
- A planted failure is sized against the rule it trips. A drop's outcome and its look are one record.

## Traps hit
- The clone is SHALLOW (depth 50): `rev-list --count` and merge-base lie; roadmapcheck FAILs until `git fetch --unshallow`.
- The lead's branch is not main: read code at origin/main (a detached worktree), not the checkout's src.
- `types.ts` is three files (gen2/types.ts, src/game/types.ts, predators/types.ts): cite with the folder.
- The tool output is trimmed past about 4,000 characters: write long reads to a scratch file and Read a range.
- node_modules is absent in a fresh worktree: `bun install --frozen-lockfile` (4 s); it leaves the tracked tree clean.
