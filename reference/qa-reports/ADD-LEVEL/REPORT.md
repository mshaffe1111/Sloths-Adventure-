# ADD-LEVEL REPORT (R-165.187; Engine, Opus 5.5 high; t-add-level, head named in the lead message). 11-13.
EXACT NEXT STEP: lead decides A/B on the 2 birth misses (1-1 drawcheck scenario, 1-2 seed list) and approves the level.md line below.
## Done (evidence)
1. `tools/engine/libstage.ts --stage <id>`: one roll tool from the stageTable row, built as the seed-list search builds. libstage.test.ts
   (4): every list's first 6 seeds clean both settings AND lay the beats the list replays; clean-on-both = listed for 1-3; planted seed+1
   fault caught ("1-1 seed 769: verdict drop.untyped"). library13.ts kept: library13.test.ts is 1-3's plan test (no caller moves).
2. `tools/engine/addlevel.ts <id>`: row -> 24 rolls -> seed list (only if none; --relist) + --check -> castBots 1-40 -> flight command -> registry
   misses -> DONE/MISSING checklist. Proof: 1-3 with its list deleted, one command, 3 m 32 s (P13 did it by hand in ~3 h 50 m): list
   byte-identical (18d380ae, cmp), every bot 40/40 both settings, flown judged; it flagged the one real gap (CI never checked 1-3's list).
   Record: replay-1-3.txt.
3. `tools/engine/registrycheck.ts` (gate, 4 s) + registrycheck.test.ts (11, 10 planted: drawcheck entry removed fails "1-3 drawcheck";
   seeds, kit, row, config, routed, attempts, flown x3, sheets stubbed AND on real builds, ci-seedlist, shrink-only). gates.yml: seedlist
   --check over EVERY list (registrycheck --lists), the gate, both new tests.
4. Found by the gate on main: 1-1 was never a drawcheck scenario; 1-2 has no list/stand-in; CI checked only 1-1's list (fixed).
   On B15's head (t-b15@21c3316b, scratch): 1-5 lacks drawcheck scenario, seed list, judged/flown rows; 4 of 6 rolls throw (pool spent).
## Polish check
Tools only: no screen changed. Output read line by line on 1-1, 1-2, 1-3 and B15's 1-5; one wrong attribution fixed (a thrown roll was
reported as a sheet miss; now skipped, sheets checked on seeds that build).
## Gates (on the head in the lead message)
tsc PASS; full unit suite: SEE BELOW; tools' tests: libstage 4/4, registrycheck 11/11; registrycheck PASS; seedlist 1-1/1-3 --check; generality
PASS; knowncheck PASS; roadmapcheck: SEE BELOW. Not run (packet scope, tools only, nothing drawn changed): build, drawcheck, clipcheck.
## Pushback
- "retire the per-stage copies": library13.ts stays; its test is 1-3's beat-for-beat plan test. Moving that test is a 1-3 job, not plumbing.
- stageSheets.test walks listed stages on Normal only (isGen2Stage is false for them); the registry gate now checks Easy too.
## Proposed level.md line (step 3, replaces "copy this tool for your stage"; the lead approves)
3. **Register it in one step:** `npx tsx tools/engine/addlevel.ts <stage>`: rolls, seed list, bots, flight, every registration; READY or a
   MISSING list by file. `libstage.ts --stage <stage>` alone re-rolls while you tune. Check: `registrycheck.ts` in CI.
## Lessons applied
D51 (a new stage joins every stage-walking gate: now a gate), D19 (the gate calls the game's builtOnGen2/stageSheets, not a copy), D52
(cites last), D53 (fast gates before push), rule 12 (each check proven by a plant), rule 15 (read the result before commit).
## Learned
Replaying a finished level's registration is the cheapest proof a tool is right: a byte-identical list says the build path is the real one.
Turnover: reference/handoffs/engine-core.md §0i.
