# REPORT: R-165.61 Architect, attempt 2 (2026-11-10)
Attempt 2 delta (the lead's five): BUDGET plants fixed (every-frame p95 plant + one 60 ms max plant, CI needs exit 1 from each);
`notJudged` on RollVerdict (ADR-001 decision 3 says why, not a PromiseDef scope gate); 8 ms attributed to the previous lead; E0's list
names provenSeeds.ts and the lock; E2 has Normal's re-ask and everything past 1-1 BLOCKED on help.md §5; ADR-002 carries the lead's
ruling. tsc clean again.

## 1. Done-items
1. PASS. ADR-001 (reference/architecture/ADR-001-verdicts.md) + types (src/game/gen2/verdicts.types.ts): setting-aware FlownArc /
   BandTable from reach.md and bands.md (flick-based, `'none'` as a value), headroom (`headroom.cuts-arc`), floors (`floor.unmarked`),
   every drop a typed soft|lethal record with outcome AND look (`drop.look-lies`, `drop.unwarned`, `drop.untyped`), the brief's
   FallPolicy with `drop.lethal-in-no-lethal` (any lethal drop in 1-1 fails by name; `StageDrops<'no-lethal'>` is SoftDrop[] at
   compile time), 16 names in VerdictName, RollVerdict a tagged union. Each decision's "rules out" is listed.
2. PASS. ADR-002 (ADR-002-first-run.md): FirstRunLayout in NEW src/game/gen2/firstRun11.ts, a replay entry with a per-setting lock;
   RunPick 'first' until a finish of 1-1 on any setting, then the proven list's order; types only.
3. PASS. reference/architecture/PACKETS.md: E1 recorder, E2 help, E3 WebGL stage 0, C1 re-lay + first-run layout (every bands.md §5
   row, R-165.72), plus C2 (art R-165.85) and E0 (added: someone must implement the verdicts). Shared files and who goes first:
   provenSeeds/lock E0->C1 (one PR); w1.ts C1->C2 (C2 shares it: props/decor entries only, after C1); playRecorder.ts E1->E2;
   engine.ts E2->E3. No other overlap.
4. PASS. reference/architecture/BUDGET.md: 8 ms (update 2 / draw 5 / slack 1, a target, unmeasured), bundle, and E4: the
   frame-time gate (rAF callback timing, CPU x4, p95 <= 8, max 50, planted 12 ms busy frame CI must see fail), with its file list.
5. PASS. `npx tsc --noEmit -p .` exit 0 (after `bun install --frozen-lockfile`; node_modules was missing).
Not run (per brief): tests, build, perf gates. Types only: no caller changed, so no roll moves from this commit.

## 2. Polish check
No screens: types and notes only.

## 3. Pushback
- Frozen inputs: none wrong. One reading to confirm: A1's soft fall spares land only ("anywhere that is not water"); R-165.53 says no
  lethal drops in 1-1. The schema treats any water gap in 1-1 as `drop.lethal-in-no-lethal`, so C1 must lay none (or A1 extends).
- The packet allowed types.ts edits; I made none there: A1 edits types.ts and an Architect hunk would collide. E0 adds the fields.

## 4. Suggestions
- E0 (PACKETS.md) is a ready packet: objective, files, done-items (planted roll per verdict name; lockall --check: only 1-1 moves).
- E4 (BUDGET.md) is a ready packet for R-165.65.
- The Designer flies Normal past 1-1 so `reach.unflown` can be enforced everywhere.

## 5. Unresolved
- E4's throttle rate is uncalibrated against the three phones; the gate is a CI stand-in until then (said in BUDGET.md).
- The Dot-lines file for E2 is named by role (the story keeper's), not verified by path.

## 6. Method update
- reference/methods (gates.md, when E0 lands): "a roll passes only by `accepted: true`; a new check adds its VerdictName and a planted
  failing roll first".

## 7. Turnover note
reference/handoffs/architect.md rewritten, same commit as this report.
