# Architect turnover note (rewritten 2026-11-10, R-165.61)

## Open
- E0 (verdicts + reach data + first-run picker) is the packet that implements ADR-001/002; it is not yet dispatched. It and C1 (the
  1-1 re-lay) must ship as ONE PR: E0 alone fails most proven 1-1 seeds.
- Normal past 1-1 has no flown reach (reach.md scope). `reach.unflown` is reported, not enforced, there until the Designer flies it.
- E4's frame-time gate is a CI stand-in (Chromium, CPU x4) until calibrated on the three phones.

## Where things live
- Types: src/game/gen2/verdicts.types.ts (the only file the Architect wrote in src/). types.ts was NOT touched: A1
  (t-engine-putback@41c2e248) edits it, and a second edit there would collide; E0 adds Gen2Meta's `verdicts` / `drops` fields.
- Decisions: reference/architecture/ADR-001-verdicts.md, ADR-002-first-run.md. File lists: PACKETS.md. Budgets: BUDGET.md.
- Today's falls: pipeline.ts `falls` (gaps' kind), `lethalSpans` (pipeline.ts:1053), promises11.ts floorlessGaps (w1Pits). A1's
  softFallStage (pipeline.ts on A1) reads Gen2Meta.softFalls; engine softOn reads it. A1 keeps water lethal.
- 1-1 is built by stageGenerator.ts gen2Roll11 -> testlink1_1.ts play11Seed -> seedList buildPlayStage; not in GEN2_STAGES.

## Rulings to keep
- A verdict is a name in VerdictName; a roll is a tagged RollVerdict; no "accepted with warnings"; out-of-scope checks are listed in
  `notJudged`, never dropped.
- A planted failure must be sized against the rule it trips (a p95 plant on every frame, not 1 in 30).
- ADR-002: a retry before the first finish of 1-1 is still the first run (the lead, 11-10).
- A drop's outcome and its look are one record; soft and lethal looks never overlap.
- One PromiseRegistry feeds promises11 and seedListBreaches; the setting filter is `settings`, never a substring.

## Traps hit
- node_modules is absent in a fresh container: `bun install --frozen-lockfile` (5 s) before tsc; there is no package-lock.json.
- art-raw-2026-11-07 is an art-only tree (W1/, W2/, cut/, contact sheets); `git diff` against main is meaningless, use ls-tree.
