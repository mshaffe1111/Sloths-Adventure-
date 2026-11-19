# INT-13 REPORT (hand-off to INT-13b; written 5:28 PM ET 11-19 at the lead's word, context box)

## EXACT NEXT STEP (INT-13b starts here; t-int-13 @ 2a895bcc, every merge below is in)
1. Read §"Gates per head" below for the f993eb31 runs (12 list checks, suite): any list RED = relist it (owner rule: 2-1/2-2
   FIX-284, 2-4 BUILD-24c, every other ENG-285's relist; 1-9 is ENG-285's list, t-var-19 is NOT merged). Packet KNOWN: relist 2-1
   ONCE after every merge (METER-3's route.ts line), then castBots 2-1 1-40 x tiers x both. Any suite red: fix at its source with
   the owning branch's evidence, never loosen.
2. When BUILD-24e sends its final: merge t-build-24c's head again (docs only, expected clean; 2-4 provisional until then: the lead).
3. ONE recalibration (BOTS.md): `npx tsx tools/inspect/tierBots.ts --stage 1-1 --tiers child,middle,expert --seeds 1-40 --setting both --calibrate`;
   recommit reference/qa-reports/R-165.59/calibration-main.jsonl only if it moved; tierBots.test must pass; if it no longer matches
   the testers, stop and tell the lead.
4. EVERY gate once on the final head (CLAUDE.md order + gates.md, D86): tsc; suite in 3 shards (use a 2 h background timeout: the 30 min
   default killed one here); BASE_PATH vite build + chunkcheck; artcheck; drawcheck; clipcheck; knowncheck; generality; roadmapcheck
   (fetch --unshallow done here); timecheck; paintcheck (time it: CLAUDE.md says "about 18 minutes", correct it to the measured figure,
   the lead's word); kbdcheck; buildcheck ALONE; every list --check; the CI tool line exactly as gates.yml has it (CI=1 FORCE_COLOR=1);
   tierBots; coveragecheck; registrycheck; tipwalk; funcheck vs reference/qa-reports/INT-12/funcheck-main-6e7b85f8.txt (main is still
   6e7b85f8); lockall --check vs main's lock (record it on a main worktree: `lockall.ts --layouts 16 --out lock-main.json`, 7.5 min)
   with --intended 1-6,1-7,1-8,1-9,2-1,2-2,2-4,3-8,4-4,6-1,6-3,6-6,6-7,7-5,7-9,8-3,8-5 (ENG-285's 15 + 2-2 + 2-4; any other = stop, tell
   the lead); castBots 1-40 x tiers x both on every stage whose data, list or bots moved.
5. Stills (upright + sideways, whole screen): 2-4's raft, a let-go with the glow lit, the left river bank join; 2-2's big pads with
   Pokey on one; the lead's re-shoot: 2-2 L1 Normal first big pad's right edge
   (`DIFF=normal node reference/qa-reports/FIX-284/shootfinal.mjs <port> <out> 2-2 1 big1:0.88:edgeR`), confirm the pond-to-bank seam,
   the dark strip, the underground water patch and the petals over the soil are gone. Meter 2-2 + 2-4 (N + E) vs DIFFICULTY.md.
6. Finish this REPORT (gate table, castBots table, funcheck before/after, stills, rough spots), rewrite reference/handoffs/engine-core.md's
   top for INT-13, push, tell the lead. Then STOP: the lead builds test link #2.

## Merges (packet order; tsc 0 after every one)
| # | Branch @ hash | Merge | Conflicts and resolution |
|---|---|---|---|
| 0 | t-gate-292 @ 65a5fc21 | 4fd05d11 | none; methods/gates.md row 8c (paintcheck) |
| 1 | t-time-168b @ de3539c7 | b69ca274 | gates.yml tool line (union); gates.md timecheck row 5d |
| - | CLAUDE.md, the lead's approved wording | fa990e3c | paintcheck clause after timecheck's; paintFall.test on the tool-test command |
| 2 | t-eng-23 @ 9e306581 | 01349f90 | tool line; engine-core.md (§0ENG23; TIME-168's §0zl -> §0zl-168) |
| 3 | t-eng-25b @ 73318234 | ec32943c | engine.ts cast step (INT-12 freeze + this.clock); pipeline.ts wet faults; firsttimer.ts imports + SKILLS (dup PredatorDef import dropped); CSV union, inventory re-emitted (catalog_master.py --emit); HF-SPEND combined |
| 3b | t-eng-26 @ 64acd5f5 (ENG-26b generality GREEN) | e7479340 | pipeline.ts imports + wet += wheel; w2.ts; score.ts snap + wheel + liana channels; SKILLS += rideWheel |
| 3b | t-meter-4 @ 8dd661d0 | 05589645 | score.ts imports; tool line |
| 3b | t-art-w2a @ 4f664fde | 522cf4b4 | HF-SPEND; art-director.md; engine-core.md; cast.json re-emitted |
| 3c | t-art-w2b @ c877623e | baf5d277 | CSV (9,500 rows, no dup id); cast.json (7,318 ids); HF-SPEND combined ~$49.0 |
| 4 | t-eng-285 @ b84163d6 (ENG-285c final) | 29865500 | firsttimer.ts physics import; engine-core.md |
| 5 | t-fix-284 @ d85be1eb (FIX-284b final) | e95bed18 | engine.ts imports; padPiece.ts (snap stone kept + FIX-284's floor width); ride.ts comment |
| 6 | t-var-19 | NOT MERGED (deferred; VAR-19b) | |
| 7 | t-build-24c @ 98261a27 (BUILD-24d; 24e docs to come) | f993eb31 | riverRide.test.ts = ENG-285c's plants (the lead's ruling); engine.ts + stageSheets.ts imports; engine-core.md. Merge note checked: no `, true` on letGoFall/fallOnLog; CUE.climbFrames 0; score.test PREDATOR READ (8a78d0ec) in |
| - | timecheck fixes | 2a895bcc | ENG-23 REPORT:17/:99 3:15 -> 3:09 PM; VAR-1 REPORT:4 3:50 -> 3:45 PM ET. timecheck --range origin/main..HEAD PASS |

## Gates per head
- baf5d277 (prep, 0-3c): suite 3,898 tests, 3,896 pass, 0 fail, 2 todo (pre-existing); drawcheck PASS 698 s; lockall vs main
  99/102 (moved 1-6, 1-7, 1-9 = INT-12's, nothing new); timecheck: the 3 known only.
- e95bed18 (after 4, 5): suite and CI tool line stopped at merge 7, 0 fails up to the stop (not a result).
- f993eb31 (after 7): 12 list checks (1-1..1-9, 2-1, 2-2, 2-4) and the suite RUNNING at the time above: results below when in.

## Odd things seen
- A test run in the merge tree read conflict markers (2 false reds at merge 3): tests now run in a pinned worktree only.
- rerere is on in this clone (resolutions for t-fix-284 recorded on a side head, replayed at merge 5).
- ENG-285c sent its final hash to me directly (5:06 PM); ls-remote matched.
