# INT-2: integration for 0.9.7 and Matt's 1-3 test link (2026-11-12 ET). Branch `t-int-2` from origin/t-int-engine@d0276817
Final head **465023ef** (code); this report after it. Every merge its own merge commit; root REPORT.md files moved to reference/qa-reports/<name>/.

## Merges, conflicts and how each was settled
1. t-11-pass@36a4ef1c -> c3ee9a26; t-render-fixes@b8e98fac -> 70feb2f5; t-pit-polish@0e7c3e6b -> 9130cd03: no conflicts.
2. ccr-702d3c49-i33jeq @8ac8007b/@a910ce67/@26e4f859 -> 075f8c02/a37f35c2/e57e8dda: docs; both sides' rows kept. R-165.129 duplicate
   (1bde88e8): the lead's thorn bed keeps it, t-int-engine's "eight tool-side tests" is R-165.139. Form-only: the lead's .138/.141/
   .143/.146 times in the R-12 form; BUILD-PLAN 758.25.
3. t-12-fly@ed329f74 -> fcfb1138: verdict lists unioned (count 20); chain.mount's control gets a real purpose (b8c05d91, lead's call).
4. t-audit-fixes@98149355 -> 5ccbd6c9; t-engine-inventory@621a3d2b -> 2ff4f8ce (test glob + src/game/art; HF-SPEND both sections).
5. The lead's PROOF-1 fixes: 03686053 NOT_IN_CI -> ciTests.known.json under knowncheck; 54544169 R-165.152 bare-plugin guard by
   call shape (8 plants caught, old missed 6); 3cfb5469 R-165.153 inWorld -> predators/ways.ts, roster.ts DATA_ONLY. Plant logs here.
6. Passed-not-merged (D48, PASSED-NOT-MERGED.md): E1 4c44b104; w11-analyst 73475148 (report.py: analyst's + E1's move counting and
   self-test); ADRs c2a7ad30, reach 0817ab0d, 1-2 packets cd7efcbf (docs only; HEAD's verdicts.types.ts / flight.ts kept).
7. t-yield-2@a5bff66c -> d9563016; t-render-2@a5d166c5 -> 1dd7e3bb (carries W1C@133f542d, kept: all ancestors of t-13-finish;
   registry.ts import -> ways.ts; aa453eba gates.yml runs library13.test).
8. t-13-finish@3a7e8a6c -> ba380381 and @d0cf0b0c (F13 final) -> 465023ef: gates.yml, registry.ts = t-13-finish's (supersets).
9. t-fx@e085120c -> 357c0e74: provenIndex.ts (generated) = FX's 1-1 (257, dbbf97db, lead-approved) + HEAD's 1-3 (100). FX's flag
   rule also re-placed 1-3's flags/petals/dress: STOPPED and reported; the lead accepted it (a).
10. t-12-design@489ae984 -> 864314c1: tools/engine/library.ts poolReport = D12's rewrite (over F13's patch to the old one); W1C's root
   REPORT.md -> qa-reports/W1C/ (90a54102). t-render-3@18afc7b0 and t-12-design@6d2cb506 (D12's note) -> d68930d4: no conflicts.
Guard: `git ls-tree HEAD node_modules` empty after every merge.

## Step 3: every CLAUDE.md check once, on 465023ef
| Check | Result |
|---|---|
| tsc | PASS |
| full suite (CLAUDE.md glob, src/game/art included) | PASS: 3,119 tests, 3,117 pass, 0 fail, 2 TODO (4-3 bottomless wall check, marked todo) |
| yield.test.ts:62 yield floor (F13's red) | PASS. Came with t-11-pass (11 of 30), fixed by t-yield-2 (d9563016); F13's base 1480e843 predates Y2 |
| BASE_PATH build + chunkcheck | PASS: index 666,832 B, stagekit 756,432 B, 41 JS files |
| artcheck / drawcheck / clipcheck | PASS / PASS (478 s) / PASS, 83 known (the 1-3 Skip red gone) |
| knowncheck / generalitycheck / roadmapcheck | PASS / PASS (37 files, 27 known) / PASS |
| kbdcheck | PASS (its stills overwrote tracked images; restored) |
| seedlist 1-1 --check / 1-3 --check | PASS 257 / PASS 100 |
| CI tools tests (library, seedlist, yield, travelBots, library13, castBots) / tierBots | 56/56 / 7/7 |
| 1-3 proven filter, dry run (castBots, 100 listed, every bot, defaults, both) | 100/100 proven, 0 lives lost, none under 120 s |
| lock vs 357c0e74 (tonight, pre-1-2) | 100/102: only 1-2 and 1-3 (gen2, hints) |
| lock vs d0276817 (the day) | 99/102: only 1-1, 1-2, 1-3 |
| **buildcheck** (1-1 p95 normal/easy, CPU x4, budget 150) | **FAIL 446/430**. See below |
| test link | builds (489 assets; filesmap 495, first build on this machine); NOT published |

## buildcheck, measured quiet one at a time (logs in the scratchpad's bc/)
d0276817 104/85 PASS; W1C pre-merge d03487f7 114/82 PASS; t-11-pass@36a4ef1c alone 259/269; c3ee9a26 285/241; 91af3475 316/249;
cd7efcbf 290/261; d9563016 (Y2) 474/494; 1480e843 277/259; 465023ef 446/430. Two steps: P11's t-11-pass (+~180 ms) and Y2's
t-yield-2 (+~180 ms); every other merge flat within noise. Budget untouched. Owners: P11 and Y2, via the lead (R-165.163).

## Left
- buildcheck red (above): blocks 0.9.7 in CI, not tonight's link.
- reference/art/catalog-rows-w1traps.csv (14 rows) not yet in CATALOG-MASTER.csv: waits for the lead (needs --emit + checks).
- The lead's ROADMAP rows keep landing as "N-M h (a guess)", which roadmapcheck refuses (R-12).
- t-designer-reach@e97542b4 (post-pass bands.md edit) not merged: never passed.
