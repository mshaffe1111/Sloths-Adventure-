# Architect turnover note (rewritten 2026-11-13 5:02 PM ET by ENGINE-STUDY-678; R-165.205)

## Open
- ENGINE-678 (reference/plans/ENGINE-678.md, t-engine-678): the engine plan for 1-6..1-8. Waiting on the lead: HIDE-ONE deferral, HOOKS as the
  W0 packet, the art list. Nothing built. ENGINE-NEEDS.md (this morning) is the map-wide plan; ENGINE-678 is the next three levels' slice of it.
- t-pieces@69dc3e26 (STILL, CAST-WORLDS, RIDE) and t-nodes@1829470f (VARIETY-2) are NOT in t-int-3: ENGINE-678's INT-5 merges them first.
- From 11-10, still open: E0 (verdicts + reach + first-run picker, ADR-001/002) must ship with C1 as ONE PR; Normal past 1-1 has no flown reach;
  E4's frame-time gate is a CI stand-in until calibrated on phones.

## Where things live
- Plans: reference/plans/ENGINE-NEEDS.md (map-wide), ENGINE-678.md (1-6..1-8). Decisions: reference/architecture/ADR-001/002, PACKETS.md, BUDGET.md.
- Types: src/game/gen2/verdicts.types.ts. HOOKS (ENGINE-678) adds src/game/stagePiece.types.ts: start, step, draw by layer, respawn, hurts.
- Hide rules today: the old watcher (crouch, watcher.ts:159) and the creature kit (stillness.ts Cover/inCover :71-87, castPlay.ts). 1-7 uses the kit.
- Chase: chase.ts (one ChasePlan, no Easy), hand-built by protoStage.ts:6326 buildLongBranch. Letters: nodeCode.ts CONTENT_OF (t-nodes) is the truth.

## Rulings to keep
- A verdict is a name in VerdictName; no "accepted with warnings"; out-of-scope checks listed in `notJudged`.
- The code's letter table wins over NODE-KEY.html and the designs' strings (liana = s, rope = r).
- A shared file needed by 3+ packets gets a hook packet first, so it is held once.

## Traps hit
- No node_modules in a fresh container: `bun install --frozen-lockfile` (3 s) before tsc.
- roadmapcheck FAILs on a shallow or partly fetched clone: `git fetch --unshallow origin <branch>` then `git fetch origin`, re-run.
- Bash output over ~4,000 characters is trimmed: save long docs to the scratchpad and read them with Read.
