# PASSED in STATE.md but not on t-int-2 or main (D48), INT-2, 2026-11-12 1:30 PM ET, against t-int-2@2ff4f8ce

Method: `git merge-base --is-ancestor`; `git cherry` (patch-equivalent commits); per file changed since the merge base, whether HEAD
holds the same blob, and whether the branch's diff reverse-applies to HEAD (present) or applies cleanly (missing). Not merged (lead's word).

| Branch @ passed commit | Verdict | Evidence | Recommendation |
|---|---|---|---|
| t-art-catalog-a@e51a7563 | IN (now) | ancestor of t-int-2 since the t-engine-inventory merge (2ff4f8ce); STATE's engine part C aca85740 is also an ancestor | nothing |
| t-c2-art-cut@fa3e6e77, @eddc6b0c, @7fe092d4 | IN (now) | all three ancestors of t-int-2 via t-engine-inventory (2ff4f8ce) | nothing |
| t-engine-inventory@621a3d2b | IN | merged 2ff4f8ce | nothing |
| t-engine-e1@7a4793b6 (R-165.58, play recorder) | **MISSING, code** | 3 commits, 0 cherry-equivalent; its diffs to src/game/playRecorder.ts (12 lines), recorderMoments.test.ts, tools/playtesters/report.py (67) all apply cleanly to HEAD = not there; src/game/playRecorder.test.ts absent. ROADMAP R-165.58: open | merge (base 181d2846, old: expect report.py to meet t-w11-analyst's); full suite after. Its root REPORT.md -> qa-reports/E1/ |
| t-r165-61-verdicts@c4687177 (R-165.61, the Architect's ADRs) | **MISSING, docs** (code superseded) | ADR-001-verdicts.md, ADR-002-first-run.md, ARCHITECTURE.md, BUDGET.md, PACKETS.md, handoffs/architect.md absent on HEAD and main, yet verdicts.ts cites "ADR-001 §3"; its verdicts.types.ts conflicts (the engine's later types replaced it). ROADMAP: "merges with the next release" | merge the reference/ files only; keep HEAD's verdicts.types.ts (the engine's, tested) |
| t-designer-reach@030a4093 (R-165.60, reach spec); branch head now e97542b4 (11-11) | **MISSING, docs** | specs/reach.md, bands.md, help.md, packets/ENGINE-flight-test.md absent on HEAD and main while 20+ / 24 / 11 files name them; designer.md and specs/README.md diffs apply cleanly; sims/flight.ts conflicts (F12's 11-12 world-data version is newer). ROADMAP: "merges with the next release" | merge the spec .md files (at e97542b4 if the lead accepts the post-pass bands.md fix, else 030a4093); keep HEAD's flight.ts |
| t-design-1-2@ee75a0a3 / @d9267c6b (1-2 packets; head 6c70f6ff) | **MISSING, docs** | packets/2026-11-11/{CONTENT-1-2-relay, DESIGN-1-2-notes, ENGINE-1-2-routing}.md, qa-reports/DESIGN-1-2/REPORT.md, specs/sims/{chainlay12, finds11, probe12, ncount12}.ts + out/ absent; chain.md and flight.ts conflict (F12 re-did 1-2's flown rows: qa-reports/F12/fly/) | merge the packets, report and sims (docs); keep HEAD's chain.md/flight.ts, or have F12's owner reconcile chain.md |
| t-critic-1-2-packet@65523e00 (head b904dbc0) | **MISSING, docs** | 39 commits, 0 cherry-equivalent; qa-reports/CRITIC-1-2-packet/* (8 attempts) and handoffs/critic.md absent; carries t-design-1-2@d9267c6b | merge with t-design-1-2 (docs only) |
| t-w11-analyst@469db5d1 (window report; head 437a3a13, attempt 7, 11-11) | **MISSING, tool + docs** | qa-reports/window-2026-11-10/{REPORT, WINDOW}.md and handoffs/analyst.md absent (43 files name the window REPORT); its report.py diff (609 lines) applies cleanly = not there | merge (lead picks 469db5d1 passed or 437a3a13 later); merge after t-engine-e1 (both touch report.py); a report.py check after |

Not merged here: every MISSING row waits for the lead's word. All are based on 181d2846 (11-07) or 5dafe73b (11-11); t-engine-e1,
t-r165-61-verdicts and t-designer-reach each bring a root REPORT.md to move under reference/qa-reports/<branch>/ (as F12's was).
