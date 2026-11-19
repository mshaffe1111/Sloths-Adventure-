# INT-13 REPORT (DRAFT, written 3:52 PM ET 11-19; t-int-13 from t-int-12 ce4ad461)

## Merges (packet order)
| # | Branch @ hash | Merge | Conflicts and resolution |
|---|---|---|---|
| 0 | t-gate-292 @ 65a5fc21 | 4fd05d11 | none; methods/gates.md row 8c (paintcheck) |
| 1 | t-time-168b @ de3539c7 | b69ca274 | gates.yml tool line (union); gates.md timecheck row relabelled 5d |
| - | CLAUDE.md (lead-approved wording) | fa990e3c | paintcheck clause after timecheck's; paintFall.test on the tool-test command |
| 2 | t-eng-23 @ 9e306581 | 01349f90 | tool line (union); engine-core.md both kept (§0ENG23; TIME-168 §0zl -> §0zl-168) |
| 3 | t-eng-25b @ 73318234 | ec32943c | engine.ts cast step (INT-12 freeze block + this.clock); pipeline.ts wet = river(by difficulty)+pads+snap+beatCast; firsttimer.ts imports joined, SKILLS dropOnLog+vineFromLog+bonkAfterSnap, dup PredatorDef import dropped; CSV union + inventory w2/w6 re-emitted (catalog_master.py --emit); HF-SPEND both + combined |
| 3b | t-eng-26 @ 64acd5f5 (ENG-26b generality GREEN; carries t-meter-3) | e7479340 | pipeline.ts imports + wet += wheel; w2.ts both type imports; score.ts snap + wheel + liana channels all kept; SKILLS += rideWheel |
| 3b | t-meter-4 @ 8dd661d0 | 05589645 | score.ts imports joined; tool line (union) |
| 3b | t-art-w2a @ 4f664fde | 522cf4b4 | HF-SPEND; art-director §0g-w2a/§0g-22p; engine-core §0W2A; cast.json re-emitted |
| 3c | t-art-w2b @ c877623e | baf5d277 | CSV union (9,500 rows, no dup id); cast.json re-emitted (7,318 ids); HF-SPEND combined ~$49.0; art-director §0h |
| 4 | t-eng-285 | (waiting for ENG-285c's final) | dry run: firsttimer physics import; riverRide.test.ts 2-1 plants vs t-build-24c (ENG-285c's restatement = the lead's rulings 1, 2) |
| 5 | t-fix-284 | (waiting for FIX-284b's final) | dry run: engine.ts imports, padPiece.ts (snap stone + FIX-284 width), ride.ts comment |
| 6 | t-var-19 | DEFERRED (VAR-19b; only on the lead's green final by 9:30 PM) | |
| 7 | t-build-24c | (waiting for BUILD-24d's final) | dry run: gates.yml, engine.ts/stageSheets.ts imports, riverRide.test.ts (above) |

## EXACT NEXT STEP (for INT-13 or INT-13b)
1. Merge each final the lead sends, in order 4, 5, 7 (6 only on the lead's word). tsc after each. Tests run in a pinned worktree, never mid-merge.
2. After ALL merges: timecheck --range origin/main..HEAD (3 known breaches: ENG-23 REPORT:17/:99 '3:15 PM' -> 3:09, VAR-1 REPORT:4 '3:50 PM' -> 3:45); fix the stamps.
3. seedlist --check every listed stage; relist what a merge invalidated; relist 2-1 once, then castBots 2-1; ONE tierBots recalibration (BOTS.md).
4. Every gate once on the final head (packet list); castBots; funcheck vs reference/qa-reports/INT-12/funcheck-main-6e7b85f8.txt (main unchanged); lockall --check vs main's lock (record on main: lockall --layouts 16 --out).
5. Stills (2-4 raft/let-go glow/left bank join; 2-2 big pads + L1 Normal padbig1-edgeR via FIX-284's shootfinal.mjs); meter 2-2/2-4 N+E.

## Gates so far
- tsc PASS after each merge. Prep head baf5d277: suite (3 shards) and lockall vs main RUNNING at the time above.
