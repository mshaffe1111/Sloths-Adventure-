# ADD-LEVEL REPORT (R-165.187; Engine, Opus 5.5 high; t-add-level; numbers from 0aa89be83 + the one test fix at 535da2ce). 11-13.
EXACT NEXT STEP: lead approves the level.md line below; B15 takes limits.json (1-5 scenario) and runs `addlevel.ts 1-5`.
## Done (evidence)
1. `tools/engine/libstage.ts --stage <id>`: one roll tool from the stageTable row, built as the seed-list search builds. libstage.test.ts 4/4:
   every list's first 6 seeds clean on both settings AND lay the beats the list replays; planted seed+1 fault caught. library13.ts kept.
2. `tools/engine/addlevel.ts <id>`: row, 24 rolls, seed list (only if none; --relist) + --check, castBots 1-40, flight command, every
   registration; DONE/MISSING checklist. Proof: 1-3 with its list deleted, ONE command, 3 m 32 s (P13 by hand ~3 h 50 m): list
   byte-identical (18d380ae, cmp), every bot 40/40 both settings; it flagged the one real gap (CI never checked 1-3's list). replay-1-3.txt.
3. `tools/engine/registrycheck.ts` (gate, 2-7 s, no known list: every miss fails) + registrycheck.test.ts 9/9 (planted: 1-3 out of drawcheck
   fails "1-3 drawcheck"; row, kit, config, routed, attempts, seeds, flown x3, sheets stubbed AND on real builds, ci-seedlist).
4. Root fixes of what the gate found on main (lead's option A): 1-1 joins drawcheck (limits.json scenarios; no limit touched); 1-2's seed
   list (100 of 100 tried, normal filter; still PASS on S1's final route f56d9b21, no rebuild); gates.yml: --check on EVERY list
   (registrycheck --lists), the gate, both new tests (S1's routeHumps line kept).
5. Two tests pinned to 1-2's old runtime roll, fixed without weakening: seedlist.test "no list yet" now removes a list's index line in a
   scratch worktree (same real path); thornSetBack's 36 px plant dropped Pokey inside a deep pit's walls (lips 170-190 px over the floor on
   1-2's listed seed 1): it now drops from above the lips, and a new half proves the wide pit from that height IS fallen into.
6. B15's head (t-b15@21c3316b, scratch): 1-5 lacks a drawcheck scenario, seed list, judged/flown rows; 4 of 6 rolls throw "pool is spent".
## Polish check
Tools only, no screen changed. Read every output line on 1-1, 1-2, 1-3, 1-5; fixed one wrong attribution (a thrown roll reported as a sheet
miss). Drawcheck stills for 1-1 in its run (/tmp/drawcheck-tFs5pn/shots): 1-1 upright 5.63, sideways 6.11 screens (limit 7.5), all limits held.
## Gates
tsc PASS; full suite 3122: 3119 pass, 1 todo, 1 fail (thornSetBack, item 5: now 5/5); tools' tests 73/73; tierBots 7/7; seedlist 1-1/1-2/1-3
--check PASS; registrycheck PASS; lock 101/102 unchanged, only 1-2 (intended); build + chunkcheck + artcheck PASS; drawcheck PASS (d1f290bb,
584 s); generality, roadmapcheck, knowncheck, kbdcheck PASS; buildcheck PASS (easy p95 83 ms). Not run: clipcheck (no screen changed).
## Pushback
- library13.ts stays: its test is 1-3's plan test. stageSheets.test walks listed stages on Normal only; the gate now checks Easy too.
## Proposed level.md step 3 (replaces "copy this tool for your stage"; the lead approves)
3. **Register it in one step:** `npx tsx tools/engine/addlevel.ts <stage>` (rolls, list, bots, flight, every registration: READY or MISSING
   by file); `libstage.ts --stage <stage>` re-rolls while tuning. Check: registrycheck.ts in CI.
## Lessons applied: D51 (now a gate), D19 (gate calls builtOnGen2/stageSheets), D22/law 22 (fixed roots, no known list), D52, D53, rule 12.
## Learned: replaying a finished level's registration is the cheapest proof; a byte-identical list says the build path is the real one.
Turnover: reference/handoffs/engine-core.md §0i.
