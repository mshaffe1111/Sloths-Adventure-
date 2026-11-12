# INT-2: integration for 0.9.7 and Matt's 1-3 test link (2026-11-12 ET). Branch `t-int-2` from origin/t-int-engine@d0276817

## Step 1 merges (each its own merge commit; MERGE, never rebase)
1. t-11-pass@36a4ef1c -> c3ee9a26: no conflict (P11 already held d0276817).
2. t-render-fixes@b8e98fac -> 70feb2f5, t-pit-polish@0e7c3e6b -> 9130cd03: no conflicts.
3. ccr-702d3c49-i33jeq@8ac8007b -> 075f8c02: three conflicts, all reference/ docs:
   - reference/methods/README.md: both sides added a list line; kept both (audit-fix.md; board.md + MATT-RELEASE-STEPS.md).
   - reference/BUILD-PLAN.md row (a): same cell on both sides; the lead's side is a superset (it already lists R-165.123); took the lead's.
   - reference/ROADMAP.md: R-165.52-.57 only changed on the lead's side (took the lead's); R-165.123 added on both, t-int-engine's
     adds the known-debt pointer (tools/engine/generality.known.json), kept that one; all other lead rows kept as written.
   Then ccr-702d3c49-i33jeq@a910ce67 (the lead's newer head, handoff line) -> a37f35c2: no conflict.
4. Duplicate R-165.129 -> 1bde88e8: the lead's R-165.129 (thorn bed / pit-wall band) keeps it. t-int-engine's "Eight tool-side tests
   red" is now R-165.139 (ROADMAP row after R-165.138; REPORT.md at the root, 3 mentions). No known list, test or tool named it.
   P11/REPORT.md and MATT-REPORTED.md mean the lead's thorn bed: unchanged.
   roadmapcheck then failed on two lead-side items, fixed in form only: R-165.138's time "1-3 h (a guess)" written in the R-12 form
   as "2 h (no history: a range, 1-3 h)"; BUILD-PLAN's printed Day 1 updated 750.25 -> 752.25 (that 2 h, now counted).

## Step 1 checks (head 1bde88e8)
| Check | Result |
|---|---|
| `npx tsc --noEmit -p .` | PASS |
| `node tools/roadmapcheck.mjs` (full history) | PASS |
| gen2 + worlds suite (456 tests) | **455 pass, 1 FAIL**: src/game/gen2/yield.test.ts:62 "the yield floor: of 30 fresh 1-1 seeds at least 12 lay cleanly on BOTH settings": 11 of 30. Same red on t-11-pass@36a4ef1c alone; PASS (9/9) on d0276817. **From P11's branch** (its new verdicts refuse more fresh seeds). Not loosened; back to P11's owner via the lead. |
| `npx tsx tools/engine/seedlist.ts 1-1 --check` | PASS: 258 seeds, 0 refused, each clean on both settings |
| stage lock (`lockall --layouts 16 --intended 1-1 --check` against d0276817's lock) | PASS: 101/102 unchanged; only 1-1 moved (intended) |

## Step 2 / Step 3
Waiting on the lead's messages.

## Left
- The yield-floor red above (P11 / the lead decides: fix the yield or re-judge the floor; INT-2 does not touch it).
