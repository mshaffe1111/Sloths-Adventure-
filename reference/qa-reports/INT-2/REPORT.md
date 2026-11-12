# INT-2: integration for 0.9.7 and Matt's 1-3 test link (2026-11-12 ET). Branch `t-int-2` from origin/t-int-engine@d0276817

## Merges (each its own merge commit; MERGE, never rebase). Root REPORT.md files moved to reference/qa-reports/<name>/.
1. t-11-pass@36a4ef1c -> c3ee9a26; t-render-fixes@b8e98fac -> 70feb2f5; t-pit-polish@0e7c3e6b -> 9130cd03: no conflicts.
2. ccr-702d3c49-i33jeq @8ac8007b -> 075f8c02, @a910ce67 -> a37f35c2, @26e4f859 -> e57e8dda: docs only. methods/README.md both lines;
   BUILD-PLAN row (a) the lead's (superset); ROADMAP: every row from both sides, R-165.123 with t-int-engine's known-list pointer.
3. Duplicate R-165.129 (1bde88e8): the lead's (thorn bed) keeps it; t-int-engine's "eight tool-side tests" is R-165.139 (ROADMAP,
   INT-E report). Form-only fixes so roadmapcheck passes: the lead's R-165.138, .141, .143, .146 times "N-M h (a guess)" written
   "N h (no history: a range, N-M h)"; BUILD-PLAN's printed Day 1 750.25 -> 758.25.
4. t-12-fly@ed329f74 (F12) -> fcfb1138: verdict lists and imports unioned (P11's landing.dead-zone, bounce.no-purpose + F12's
   chain.mount; count 20). F12's chain.mount control met P11's bounce.no-purpose; the lead's call (b8c05d91): the cap gets a purpose
   (past the gap, a block 210 px up beside it), the control still asserts NO verdicts. F12's copy of R-165.139 dropped; .140 kept.
5. t-audit-fixes@98149355 (AF) -> 5ccbd6c9: no conflict.
6. t-engine-inventory@621a3d2b -> 2ff4f8ce: CLAUDE.md / gates.md test glob + `src/game/art/*.test.ts`; HF-SPEND both sections, dated order.
7. The lead's 1:22 PM fixes (PROOF-1 delta): 03686053 NOT_IN_CI -> src/game/ciTests.known.json under knowncheck (shrink-only,
   R-165.143; plant-notinci.txt: an added entry FAILS); 54544169 R-165.152 the bare-plugin guard reads the call's shape (8 planted
   shapes, the old regex missed 6; plant-capplugins.txt); 3cfb5469 R-165.153 inWorld moved to predators/ways.ts (engine code, in the
   gate: 36 files), roster.ts exempt only as data (DATA_ONLY: a function/arrow/class FAILS the gate; plant-roster.txt).
8. PASSED-NOT-MERGED (D48, the lead approved 1:26 PM): t-engine-e1@7a4793b6 -> 4c44b104 (R-165.58 recorder + tests);
   t-w11-analyst@437a3a13 -> 73475148: report.py conflict with E1: the analyst's version, E1's move counting ported in as
   move_counts()/moves() with E1's fixture rows in --self-test (passes; red with `use` uncounted); t-r165-61-verdicts@c4687177 -> c2a7ad30
   (docs: ADRs, ARCHITECTURE, BUDGET, PACKETS, architect.md; kept HEAD's verdicts.types.ts); t-designer-reach@030a4093 -> 0817ab0d
   (reach/bands/help/touch.md; kept HEAD's flight.ts); t-critic-1-2-packet@b904dbc0 -> cd7efcbf (carries t-design-1-2@6c70f6ff,
   PASS carried there by the Critic; kept HEAD's flight.ts; designer.md the 11-11 rewrite). Left out, never passed: t-designer-reach
   e97542b4 (bands.md section 5 thin rows, after the pass). Table: PASSED-NOT-MERGED.md.

## Checks (last run on each head)
| Check | Result |
|---|---|
| tsc | PASS (cd7efcbf) |
| roadmapcheck (full history), knowncheck, generalitycheck | PASS (cd7efcbf; generality 36 files, 27 literals, 27 known) |
| seedlist 1-1 --check | PASS on every head: 258, 0 refused (chain.mount refuses 0) |
| stage lock vs d0276817's | 101/102, only 1-1 (intended) on 1bde88e8, fcfb1138, e57e8dda, 2ff4f8ce, cd7efcbf |
| gen2 + worlds suite | 480/481 on 2ff4f8ce: only src/game/gen2/yield.test.ts:62, 11 of 30 (P11's; 9/9 on d0276817; Y2's). Full suite: Step 3 |
| touched tests | verdicts 31/31; AF's 14/14; art 9/9; ciTests, capPlugins, generality, predator*, playRecorder, recorderMoments green |
| build (deploy base) + chunkcheck | PASS (cd7efcbf): main index 662,504 B unchanged; stagekit +21 B (E1); catalog never in the shipped build |
| artcheck / clipcheck | PASS (2ff4f8ce) / PASS 83 known (e57e8dda) |

## Step 3
Waiting on the lead's word: t-yield-2, t-render-2, t-13-proof, t-w1-art (append catalog-rows-w1traps.csv to CATALOG-MASTER.csv
and run the catalog check), then every CLAUDE.md check once and the test-link build (not published).

## Left
- The yield-floor red (11 of 30): Y2's. INT-2 does not touch yield.test.ts.
- The lead's ROADMAP rows keep landing as "N-M h (a guess)": roadmapcheck refuses that form (R-12).
- knowncheck judges ciTests.known.json against main; until it reaches main it is a "new list" there (as every list was).
