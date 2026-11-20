# INT-13 REPORT (hand-off to INT-13b; written 5:28 PM ET 11-19 at the lead's word, context box)

## EXACT NEXT STEP (INT-13b starts here; t-int-13 @ 2a895bcc, every merge below is in)
1. 2-1's list is RED on f993eb31 (§"Gates per head"): relist it first; any other list RED later = relist it (owner rule: 2-1/2-2
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
- f993eb31 (after 7; results recorded 5:48 PM ET): suite 3 shards 5:10-5:46 PM: 3,934 tests, 3,932 pass, 0 fail, 2 todo (pre-existing 4-3
  boulder + 1). seedlist --check: 1-1 PASS (161), 1-2, 1-3, 1-4 PASS (100 each), 1-5 PASS (150), 1-6, 1-7, 1-8, 1-9, 2-2, 2-4 PASS (100 each);
  **2-1 FAIL**: verdicts refuse 0 of 100, but 18 lines 'its replay differs from its search (platforms, vines, rivers, collectibles)'
  (seeds 3, 9, 28, ... both settings) + 'seed 100: 4.1 s quiet, over the line 4 s' = the packet's KNOWN 2-1 relist (METER-3's line):
  relist 2-1 ONCE (`npx tsx tools/engine/seedlist.ts 2-1`), then castBots 2-1. Logs: none kept in the repo (scratch only).
- After the timecheck fix (9261367a's parent): timecheck --range origin/main..HEAD PASS.

## Odd things seen
- A test run in the merge tree read conflict markers (2 false reds at merge 3): tests now run in a pinned worktree only.
- rerere is on in this clone (resolutions for t-fix-284 recorded on a side head, replayed at merge 5).
- ENG-285c sent its final hash to me directly (5:06 PM); ls-remote matched.

# INT-13b (fresh integration member; started 5:49 PM ET 11-19; this section first written 7:06 PM ET)

## INT-13b EXACT NEXT STEP: DONE (every item below ran; kept for the record)
Gated head = 4529d5e6 (the last src/tools change). Gate logs: scratchpad only; every result is copied into the gate table below.
1. Read the gate table below; any gate marked RUNNING or UNRUN on 4529d5e6 runs once on t-int-13's head (whose src/, tools/, public/,
   .github/, configs and reference/ outside qa-reports/ and handoffs/ must equal 4529d5e6's: `git diff --name-only 4529d5e6 HEAD`).
2. buildcheck ALONE (nothing else running): `node tools/perf/buildcheck.mjs`.
3. On the final head: timecheck, roadmapcheck, knowncheck, the CI tool line (CI=1 FORCE_COLOR=1, exactly as gates.yml) (they read reference/).
4. Stills not yet shot: the 2-2 put-back (no SPLASH on a risen pad): `node reference/qa-reports/FIX-284/cliprespawn.mjs <port> <out> up`
   and `side`, judged on the first frame after the iris opens, cropped.
5. Send the lead the final hash.

## Merges and commits (INT-13b)
| # | What | Commit | Notes |
|---|---|---|---|
| 1 | 2-1 relisted (METER-3's route line, the packet's KNOWN) | 862b7cc8 | 100 of 100, version 1950fa0c; quiet longest 4 s, median 3.7 s; --check PASS |
| 2 | The one recalibration (BOTS.md) | 64e87365 | ONE run of 200 moved: child Easy v25 303.6 -> 303.5 s; bisected to t-build-24c alone (98261a27); table unchanged; BOTS.md note; tierBots.test 7/7 |
| 3 | t-build-24c @ 92dfd78e (BUILD-24e final, via the lead) | cc8c0e97 | past 98261a27 only reference/qa-reports/ (BUILD-24e/gates x25, BUILD-24 x1); equal trees vs 64e87365 outside qa-reports/ (24 top-level entries, 77 in reference/) |
| 4 | RED fixed at its source: snap stones x breath aim | 4529d5e6 | see "The red" below |

## The red (found by the CI tool line on cc8c0e97; INT-13 never ran that line after merge 5)
snapRide.test.ts 'wave: child, easy crosses unbitten' failed: child easy v1 bitten 2 times at the pond. Bisect (the test alone): prep
baf5d277 PASS, ENG-285 merge 29865500 PASS, FIX-284 merge e95bed18 FAIL, f993eb31 and cc8c0e97 FAIL (FIX-284 alone has no snap stones).
Root: breathAim.ts breathsAhead (FIX-284) aimed every pad with by 'beat' at a put-back; rideLay.ts lays ENG-25b's snap stones as
pad { by: 'beat', on: 'bites' }, so the wave row's bar was aligned on its FIRST stone's stagger ('just out of its bite'), and the second and
third stones, a count and two counts later, were mid-bite as he came. Fix: breathsAhead skips on 'bites' (padPiece.ts and rideLay.ts:430
already tell them apart; the bot and meter were ENG-25's own). Planted test breathAim.test.ts 'a SNAP STONE row' red before, green after;
snapRide 12/12. No laid stage has a snap stone yet (2-5 is not built), so today it changes only the toys. Whether a snap row wants its own
respawn aim is a 2-5 design point (today: none, ENG-25's proven behaviour).

## Gate table (INT-13b; every gate once on 4529d5e6's tree)
Gated tree: 4529d5e6 (the last src/tools change). Every later commit (595f0981, 8efb1bba, fab317c2, cac84a18 and this REPORT) changes only
reference/qa-reports/ and reference/handoffs/engine-core.md (the lead's equal-tree rule, 6:00 PM and 6:05 PM: the only readers of
reference/handoffs in src/ and tools/ are tools/timecheck.mjs + its test and the session hook laws-short.mjs); the gates that read
reference/ (timecheck, roadmapcheck, knowncheck, the CI tool line) run again on the final head (last rows).
| Gate | Head | Result |
|---|---|---|
| tsc | 4529d5e6 | PASS (0) |
| suite, 3 shards | 4529d5e6 | 3,935 tests: 3,933 pass, 0 fail, 2 todo (= main's 3 todo markers, identical) |
| BASE_PATH vite build + chunkcheck | 4529d5e6 tree | PASS; biggest JS cast 1,788,517 B (2,205,787 spare) |
| artcheck | 4529d5e6 tree | PASS |
| drawcheck | 4529d5e6 | PASS (1,070 s) |
| clipcheck | 4529d5e6 tree | FAIL under heavy load (4 'stale' known, 74 of 83 seen, 900 s; 3 suite shards + paintcheck beside it), then PASS quiet (83 known, 324 s): R-165.215's flake (the lead), not rerun again |
| kbdcheck | 4529d5e6 tree | PASS (204 s); its re-shot stills restored to the committed copies |
| paintcheck 0/3, 1/3, 2/3 | 4529d5e6 tree | PASS, 0 new (212 / 107 / 110 known ids). Times under load: 14.5 / 10.6 / 9.5 min here; on cc8c0e97 with less load 5.4 / 6.5 / 6.2 min = 18.1 min summed (CLAUDE.md "about 18 minutes" holds for the parts summed; side by side about 12 min wall) |
| every proven list --check (registrycheck --lists: 1-1..1-9, 2-1, 2-2, 2-4) | 4529d5e6 tree | 12/12 PASS |
| lockall --check vs main 6e7b85f8 (recorded on a main worktree, 3,264 builds) | 4529d5e6 tree | PASS: 85/102 unchanged; moved = exactly the 17 intended (1-6,1-7,1-8,1-9,2-1,2-2,2-4,3-8,4-4,6-1,6-3,6-6,6-7,7-5,7-9,8-3,8-5) |
| castBots 2-1 / 2-2 / 2-4, 1-40, kid,adult,child,middle,expert, both | 4529d5e6 tree | rows identical to cc8c0e97's; 2-1 kid N 32/40 (= ENG-285, INT-11's ruled twin river), rest 40/40; 2-2 kid N 24/40 (FIX-284's final 23), adult N 40/40 (39), rest 40/40; 2-4 = BUILD-24e's (kid N 29/40, same 11 seeds) |
| CI tool line (CI=1 FORCE_COLOR=1, exactly gates.yml) | 4529d5e6 tree | 305 tests: 304 pass, 0 fail, 1 todo (chase bots OPEN, pre-existing). On cc8c0e97: 1 FAIL = the red above |
| tipwalk --layouts 4 / registrycheck / coveragecheck | 4529d5e6 tree | PASS / PASS (12 stages) / PASS |
| tierBots.test | 4529d5e6 tree | 7/7 (after the recalibration) |
| funcheck (advisory) vs INT-12/funcheck-main-6e7b85f8.txt | 4529d5e6 tree | flag for flag = INT-12's final d7cb8240 (nothing new or worse); vs main only INT-12's 1-6 and 1-9 flags. Output: funcheck-final-4529d5e6.txt |
| buildcheck ALONE | 4529d5e6 tree | PASS: Normal p95 91 ms, Easy 52 ms (budget 150) |
| generality, knowncheck, roadmapcheck, timecheck (+ --range origin/main..HEAD) | final head | see the last section |

## Stills (reference/qa-reports/INT-13/stills-b/; judged cropped; whole screens committed for the lead)
- 22-pad: 2-2 L1 Normal (built normal, seed 2) big1 at 0.88, edgeR, up + side: Pokey on the pad's floor; no grey wall, dark strip,
  underground water patch or petals over the soil; the bank's lower face shows BUILD-24c's river-under-bank run as a soft edge.
- 24: 2-4 L1 Normal x9970 catch (Dot: "Flick up when a log drifts close.") and x27750 raft (Dot: "Flick up into the vine to grab it."), up + side.
- 22-putback: cliprespawn.mjs fast, the first frame after the iris opens: up f0045, side f0072: risen pads clean, no SPLASH, no spray,
  only "2 lives left" at the flag.
- The lead judged and accepted them for the test link (8:14 PM message).

## Polish check / anything rough
- FOUND BY THE LEAD on a 2x crop, assigned (not INT-13b's): upright, under river and pond banks the lower bank face reads see-through
  (floor stones through the rock, a faint seam about 140 px in = riverUnderBanks' run end): R-165.323, ENG-24e item 2c.
- Seen and named, not new from the merge (identical in BUILD-24d's / FIX-284b's own stills): 2-4's drifting logs read pale under the
  surface band at the catch beat; 2-2's pond floor ends in a straight cut into the soil, sideways. In the sideways raft frame the HUD score
  pill is caught mid-fade (a frame-timing moment).

## Method used, lessons applied, method update
- Method: methods/gates.md + release.md (re-run a timing test alone; todo count vs main; CI's exact command line).
- Lessons: D30 (every time from date in the same command), D57/D87 (inbox at every push), D59 (no gate left running at report), D86 (the
  full list), D90 (logs to files, summary lines only; stills cropped), D21 (spread the fix to its pair: every by 'beat' reader checked).
- Method update (proposed): (1) after EVERY integration merge run tsc + the CI tool line (the lead made it D92 / release.md step 0);
  (2) heavy gates are not run beside 3 suite shards on a 4-core box: clipcheck and the timing test both broke under load 19.

## Final head
The commit that adds this section; its hash is in the message to the lead. On it: generality, knowncheck, roadmapcheck, timecheck,
timecheck --range origin/main..HEAD and the CI tool line, results in that message.
