# Engine lanes, round 1 (the new lead, 2026-11-11 6:15 PM ET). Three packets, one session each, Fable 5.2 high (Matt 11-11)

Shared for all three:
- **Base:** origin/release-0.9.6 at 06bbd29f (the 0.9.6 candidate, about to become main). Do not rebase it; if main moves, merge main.
- **First, before any tool call:** `git fetch origin ccr-702d3c49-i33jeq` and read from it: reference/roles/README.md ("Lean output"),
  reference/roles/ENGINE.md, reference/LAWS.md, reference/TEAM.md "Cost rules", reference/plans/ENGINE-PLAN.md (why this matters).
  Read the real code before trusting any summary of it (D37).
- **The rule for engine code (D43):** works for any stage; no stage id, seed number or x position written into engine code (only in
  world data). Never loosen a fairness rule, verdict threshold or STAGE-RULES number to make a number pass.
- **Gates (TEAM.md cost rule 4):** tsc, the tests for what you touched, the fast gates (artcheck, knowncheck, roadmapcheck,
  buildcheck); plus the lock checks named in your done list, once, at the end. Not the full suite; one runner does that at integration.
- **Budget and stop line:** the hours named. At the budget, stop, push and report what is left. A safe-keeping push at least hourly.
- **Return:** a pushed branch (confirm with git ls-remote), REPORT.md on it (60 lines or fewer: done-items with evidence, pushback,
  what's left, turnover note), reference/handoffs/engine-core.md's section for your lane rewritten, and a send_message to the lead
  (session_01FhBbYP63h7cCX8DyW69stq) of 10 lines or fewer: status, branch@commit, done-items passed/total, blockers. No PR.
- **Blocked or a frozen input is wrong:** PUSHBACK.md on the branch, message the lead, and carry on with what you can.

## EN-Y: the generator's yield (R-165.120, GAME-MAP A9 with what it needs of A5). Branch t-engine-yield. Budget 8 h.
Objective: gen2 lays a clean stage from most fresh seeds, so a stage stops depending on hunting through seeds.
Why: gen2 lays a clean 1-1 from a fresh seed 2 times in 120 (audit B02, R-165.120). Laying a stage costs 6-8 h today, much of it seed
hunting and re-review, and all 86 generated stages inherit the generator. Built on: release-0.9.6. Replaced this sprint by: nothing.
Read: reference/ROADMAP.md R-165.120; on origin/t-audit-engine-b: reference/audits/2026-11-11/ENGINE-AUDIT-B.md (B02 and its
neighbours), src/game/gen2/audit-b/probes/yield.ts, src/game/gen2/audit-b/w1-yield.test.ts; on origin/t-architect-capability:
reference/architecture/CAPABILITY.md §2; reference/STAGE-RULES.md (the bar).
1. Measure first (about 2 h): over 200 fresh seeds on Normal and 200 on Easy, the clean rate and the count of rolls each refusing rule
   stops (V19b, "pool short", and the rest). Commit the probe as a test-side tool. Message the lead the table, then go on (don't wait).
2. Fix the biggest causes in the generator, in general ways (a bigger pool, repair or retry inside a roll, placement that knows the
   rules), never by loosening a rule.
Done:
1. Fresh-seed clean rate on 1-1 is 50% or more on Normal and on Easy (200 seeds each), from the committed probe, with a before/after
   table. If the causes show 50% can't be reached without loosening a rule, report the ceiling you reached and exactly what blocks it.
2. No verdict threshold or STAGE-RULES number changed (show the diff of verdicts and reach files).
3. `npx tsx tools/engine/seedlist.ts 1-1 --check` passes. If your change moves the stage a proven seed lays, STOP before re-recording
   anything and report the trade to the lead (the lead decides; never re-record a list to pass).
4. tsc, the gen2 and worlds tests, the fast gates. No stage id, seed or x literal added to engine code.

## EN-T: travel as a mode (GAME-MAP A2 + A3, ADR-003 kit step 2). Branch t-engine-travel. Budget 10 h.
Objective: the engine reads which way a stage travels (right, left, up, down) from data, so the exit, checkpoints, the progress bar,
the help ladder's "past" and the bots are right on a stage going any direction.
Why: today travel is read in three engine places from `objectiveType === 'ascent'` and `proto.w4.descent`, and gen2 lays only right.
Every up, down and left stage in the map (about 27 generated, plus the old runs) needs this. Built on: release-0.9.6 + the stage kit
types. Replaced this sprint by: nothing.
First: merge origin/t-architect-stagekit (29da608f: src/game/stageKit.types.ts, its test, ADR-003) into your branch.
Read: reference/architecture/ADR-003-stage-kit.md; CAPABILITY.md "step 2" on origin/t-architect-capability; engine.ts around
:2268, :2532, :3219-3235 and the exit clamp.
Write: engine.ts, helpLadder.ts, new src/game/stageModes.ts, tools/inspect/firsttimer.ts, tools/inspect/tierBots.ts, their tests.
Done:
1. Every travel question (best, progress, further, past, bounds, camera lead, exit) is answered by the StageMode; no new reads of
   objectiveType or proto flags for travel, and the three old ones are gone.
2. A test per direction proves the exit, a checkpoint, progress and the help ladder's "past": right (1-1), down (4-7 reads
   travel 'down'), up (an existing climb stage), left (a test-only fixture stage; nothing shipped names it).
3. The first-timer and tier bots measure progress by travel (a test on an up stage and a left fixture).
4. Once, at the end: the stage lock check (lockall --check, see reference/methods/gates.md): no stage moves. And
   `npx tsx tools/engine/seedlist.ts 1-1 --check` passes.
5. tsc, touched tests, the fast gates. Not in scope: gen2 laying other directions (A7, next), the old special runs as modes (A4, next).

## EN-G: engine-wide defects and the generality gate (R-165.116, R-165.117, R-165.123 = GAME-MAP A1). Branch t-engine-guards. Budget 8 h.
Objective: the game runs at the right speed and keeps every save, and the build fails whenever someone hard-codes one level into the engine.
Why: R-165.116: one late frame leaves a 30 fps phone running at 1.5x speed (engine.ts:1284-1295). R-165.117: the game refuses its own
save once 5-M is cleared or at 34 finds, so a long-time player loses progress. R-165.123: gen2 became 1-1-only by hard-coding (D43).
Built on: release-0.9.6. Replaced this sprint by: nothing.
Read: reference/ROADMAP.md rows R-165.116, .117, .123; the failing tests on origin/t-audit-engine-a (reference/audits/2026-11-11/tests-a/,
ENGINE-AUDIT-A.md A01) and origin/t-audit-engine-c (tests-c/, ENGINE-AUDIT-C.md, the save finding); reference/PLAY-STORE-RULES.md on saves;
reference/PERFORMANCE-RULES.md (the 30 fps lock).
Order: .116, then .117, then the gate.
Done:
1. R-165.116: the audit's failing test brought in as a real test and passing; one late frame never speeds the game up; the loop stays
   locked at 30 fps.
2. R-165.117: the audit's failing save test(s) brought in and passing; every save the game writes loads back (a test writes a
   finished-game save and a 34-find save and loads them); old saves from 0.9.5 still load.
3. R-165.123: a gate (tools/engine/generalitycheck.mjs or similar) that fails on a stage id, seed number or x-position literal in engine
   code. Engine code = the core engine and gen2's machinery; world data, seed lists and per-stage scripts may name stages (write the
   paths down in the tool). Today's literals go in a known-debt list that may only shrink (like tools/perf/clipknown.json). A planted
   literal fails it (a test proves it). Added to .github/workflows/gates.yml, CLAUDE.md "Checks" (one clause) and reference/methods/gates.md.
4. tsc, touched tests, the fast gates; `npx tsx tools/engine/seedlist.ts 1-1 --check` passes.
