# What the engine can do, and where we are building 1-1-only (R-165.111 step 1, the Architect, 2026-11-11 9:44 AM ET)

Read-only audit of origin/main plus t-engine-e0a, t-engine-help, t-engine-inventory and t-bots-tiers (fetched 11-11). Every line below
was read in the code (D37). "E0a:" and "help:" mark lines on those branches. Hours are guesses with no history behind them.

## Headline
- **Frogger lanes: PARTLY.** Timed hazards and drifting logs you ride exist. Nothing that hurts moves *across* the path yet: 8-12 h.
- **Descents: PARTLY.** 4-7 is a hand-built descent the engine already tracks. The generator cannot lay one: about 6-10 h to make it a kit.
- **Climbs: YES** (18 ascent stages; hand-built or the old generator). gen2 throws on them.
- **Puzzles: YES** (the puzzle kit: lever, plate, gate, lift, seesaw, sluice, bell; 9 test rooms, rooms in Worlds 2-8). Timed switches: NO, 4-6 h.
- **Right-to-left: NO** for a whole stage. The exit clamp would pin him at the shrine: 6-10 h.
- **Card pick at run time (R-165.98): NO.** The plumbing is half there: 12-20 h, high risk.

## 1. Can do today
| Capability | Verdict | Proof (file:line) and stages | Missing, hours, risk |
|---|---|---|---|
| Left to right | YES | gen2 always lays `flow: 'right'` (gen2/pipeline.ts:353, :502). | None. |
| Right to left | NO | Only one section flips at a time (`mirrored`, pipeline.ts:772-775); the stage still runs right. engine.ts:2268-2271 clamps x at `exitTotemX + SHRINE_STOP`, so an exit on the left pins him there. Checkpoints count `cp.x > checkpoint.x` (engine.ts:2532). | A direction field, plus fixes to the clamp, checkpoints, progress and gen2 flow. 6-10 h; medium risk (tests assume x grows). |
| Descent | PARTLY | 4-7 The Long Drop is hand-built (w4LongDrop.ts; `w4.descent` at :531). The engine knows it: progress (engine.ts:3224-3228) and checkpoints (:2532). | gen2 has no down flow. Making w4LongDrop a reusable kit: 6-10 h. Each new hand-built descent: 4-8 h. Low-medium risk. |
| Climb | YES | `buildAscent` (stageGenerator.ts:2410). Ascent progress at engine.ts:3221-3223. Stages 1-4, 2-6, 3-4, 4-1, 4-3, 4-6, 5-8, 6-8, 7-2, 7-8, 8-7, 9-2, 9-7, 10-2, 10-4, 10-5, 10-8 (stagePlan.ts). | gen2 throws "ascent: phase 2" (pipeline.ts:332). Flow 'up' is typed (gen2/types.ts:552) but never laid. 8-12 h. |
| Camera, height, exit | YES | The camera follows up and down with no fixed height cap (`config.levelHeight`). The exit check reads x and y (rules.ts:218-222). | None. |
| Auto-scroll | PARTLY | There is no camera auto-scroll anywhere. What pushes him on: 1-8's collapse chase (chase.ts), 6-8's rising tide (risingTide.ts), 7-4's slide (w7SlideRun.ts). | A true auto-scroll camera with a deadly screen edge: 4-6 h. Medium risk (the HUD band and landing preview steer the camera too). |
| Water and swim | PARTLY | Calm water: swim, tread, a short dive, climb out (swim.ts, engine.ts:5814-5882). It exists only in 6-7's root well (swim.ts:8). World 2's rivers carry drifting logs (river.ts:13-27). | Pools placed anywhere: 3-5 h. Currents: about 3 h. Real underwater stages (breath, depth, art): 10-20 h, high risk. |
| Frogger lanes | PARTLY | Rocks on timers: 4-1, 4-3, 4-4, 4-9 (rockfall.ts:35-54, with a fairness check). Timed zones: geysers in World 9, bolts in World 10 (zones.ts:22). Drifting logs you ride (engine.ts:1547). | A side-crossing hazard: copy rockfall.ts (motion, hit test, `rockFits`-style fairness check, art). 8-12 h. Medium risk: the checkers must learn timing. |
| Moving platforms | YES | Side-to-side sine (engine.ts:1530; types.ts:300-303). Lifts (lift.ts; 2-7). Self-swinging vines. Crumbling platforms (World 7 gen2). | No up-down or point-to-point path. None in gen2, only crumble (gen2/types.ts:285). 4-8 h; reach checks assume floors stand still. |
| Timed and switch puzzles | YES / PARTLY | Plates, levers, gates wired all/any/not with latching (puzzleKit.ts:63-119; puzzlePlay.ts:1216). Used in 1-4, 1-6, 2-2, 2-3, 2-8, 6-3, 6-7, 7-3, 7-7, 8-2, 8-3, 8-5 and the kit rooms. | No countdown gate. 4-6 h. puzzleCheck proves a room can be reached, not that it can be reached in time. |
| Push, break, stomp | PARTLY | Push logs and boulders: 1-6, 4-3, 4-9 (`Platform.push` types.ts:310; engine.ts:2307). Stomping an animal (fight.ts). Blows break only reed cages (engine.ts:4105). | No breakable wall, rock or crate. 4-6 h: a Platform `hp` hooked in beside the cage code. Low-medium risk. |
| Escorts and followers | PARTLY | Flicker hovers after Pokey in Meeca's stage (meecaPlay.ts:656-679). Freed cage animals hop away. | Nothing walks behind him with physics, falls, or can be lost. 10-16 h, medium risk. |
| Tethers (R-165.110) | NO | Ropes are fixed shimmy ropes that never break (rope.ts:29). Reusable: the rope and vine drawing (ropeArt.ts:216 `drawLairRope`), and 4-4's knot states tied, flying, picking, free (w4Kit.ts:66). | A rope link, stretch-to-break, tie-off posts, and wiring into the engine. 12-20 h; med-high risk (rope physics on phones). |
| Collect-X goals | YES | `ObjectiveType` (types.ts:25-35): sprint, harvest, purge, ascent, stealth, vine_runner, relic_hunt, rescue, gauntlet, boss_lair. Shares in goals.ts:19-25; counted at engine.ts:3030. The locked-exit sign shows "N more" (sanctuaryDoor.ts). | A new goal ("bring N home") touches the union, engine.ts:3030, goalHave and the goal words. 3-5 h, low risk. |
| Boss arenas | YES | One shell built from data for every boss: `buildBoss` (stageGenerator.ts:2592); `BossDef` sets width, perches, vines and pillars (bossAI.ts:252). | A new boss is moves plus art; the arena is free. |
| Secret rooms | PARTLY | One hard-coded gate: 7-7 to S-1 (secret.ts:8; `addSecrets` in stageGenerator.ts). Hidden finds behind ferns (finds.ts). | No general hidden-room piece. "Under the Ruins" is only planned (SECRET-LEVELS.md). 16-30 h, mostly art. |
| Card pick at run time (R-165.98) | NO | buildAhead.ts:14 builds a whole 1-1 stage ahead at idle, not one section. `layLocal` lays one section by itself (pipeline.ts:775). help: the help ladder adds platforms during play and clears them when the stage ends (help: engine.ts:5109-5124, :1237). | Ports at a fixed height (today `exitDy` varies), adding a section to a live stage (platforms, enemies, art warmed, culling), judging each card, and a progress bar that can't use a fixed `levelWidth`. Cheaper: build all three candidates when the stage is built and slide the chosen one into place. 12-20 h, high risk. |
| Hand-built pieces reused | YES within a world, PARTLY across worlds | A hand-built section (`SectionTemplate` with `room`, `maxPerStage`, `feel`; gen2/types.ts:383-422) is laid wherever a stage's plan picks it. Puzzle rooms are built this way (w6Rooms, w7Rooms, w8Rooms; w8Rooms.ts:37 reuses 6-7's numbers). Pieces are drawn by shape (`PieceShape`, gen2/types.ts:201), not by picture. | No shared library across worlds: every section lives in one world's kit. A cross-world library that picks art by the inventory's `engine_slot`: 4-8 h, low risk. Worlds 2-4 stages are whole-stage code, not reusable pieces. |

### Separate engines or one core with modes? Recommendation: one core, pluggable modes
- The engine already plugs in three special modes. DotRun, SlideRun and LanternRun take over input, camera and drawing while hearts,
  lives and the result stay in the core, through a host interface (dotFlightRun.ts:1-5, w7SlideRun.ts:1-7; engine.ts:611-614, 672-673,
  875). Each one, though, is a hand-wired field in an 8,380-line engine.ts.
- The way a stage travels is spread across three places: the exit clamp (engine.ts:2268), checkpoints (:2532) and progress
  (:3221-3228), keyed off `objectiveType === 'ascent'` and `proto.w4.descent`.
- **Separate engines: no.** Each would copy physics, input, saves, hearts, the Play Store rules and every perf gate, and each copy
  would drift and need its own proof. Cost and risk grow with every new stage type.
- **One core plus a `StageMode` interface: yes.** The mode's jobs: set up, step before and after physics, report progress, compare
  checkpoints, set the exit clamp, steer the camera, and add draw layers. A stage's brief picks its mode. Run, ascent, descent and
  run-left become modes, and so do swim, lanes, rescue and auto-scroll.
- Cost: the types (Architect) 3-4 h. Moving direction plus the three existing runs onto it (Engine) 10-16 h. Medium risk: it touches
  the hot loop, so drawcheck and lockall must stay flat.

## 2. Gaps in what we are building now
| Work | 1-1-only? | Proof | Change that makes it general (file, hours) |
|---|---|---|---|
| E0a verdicts | Yes, by design (THE BOUNDARY) | E0a: reach.ts:83 `judgedOnArcs = id === '1-1'`; :86-88 scope; verdicts.types.ts:18 `ReachScope 'normal-1-1' \| 'easy-any'`; :34 seven `SectionKind`s, all hops to the right. E0a: pipeline.ts:2724-2729 picks a drop's look by `world === 1` or `world !== 8`. | Key the scope on the move physics and setting, not the stage id (the arcs come from physics). A stage opts in from its brief (`reach: 'flown'`). Add kinds: drop-down, climb, vine, swim, ride. Classify by \|dx\| so a left-running stage works. A drop's look comes from the world kit. 6-8 h, Architect then Engine, after E0a lands (same files). |
| Flown reach data | Partly | reach.md flew 1-1 on Normal and Easy, on flat ground: single, double, bounce. | Arcs for a drop (reach across by drop height), a swing, a glide (World 5 on), and swimming. Designer flies them: 2-4 h a move set. |
| Help ladder | Yes | help: engine.ts:843 turns it on only when `config.id === '1-1'`. helpLadder.ts:109 and :160-164 count a piece as passed once x reaches `p.x1` (rightward only). Moves are single, double, bounce (:21). The step art is fixed to `w1-boulder-grey-moss` (:35). | Ask the stage's mode whether he is past a piece. Widen the moves. Pick the step art by world from the inventory's `step` layer. Turn it on from the brief. 4-6 h, Engine, after A2 merges. |
| Art inventory | No: general | Lazy per-world files w1..w10 plus cast (inventory.ts:1-8). | Add layers for pushable, breakable, switch, moving and crosser (`Layer`, inventory.ts:11). 1-2 h. |
| Tier bots | Yes | tierBots.ts:6: a seed is a 1-1 variant (`play11Seed`). Calibrated only on 1-1 testers. The bot goes "right on a run, up on a climb" (firsttimer.ts:8) and scores "furthest right" (:608). | Map seeds per stage through GEN2_STAGES and the seed list. Measure progress by the stage's direction. 3-5 h. Calibrating on other stages needs real tester runs there. |
| gen2 pipeline | Right-running only | pipeline.ts:332, :353, :502. 1-1 is not even in GEN2_STAGES: it has its own path (stageGenerator.ts:2850-2870, :3093). | Lay flow 'up', 'down' and 'left' as modes of the same chain (the join reads the mode's main axis). 8-12 h, Engine. |
| worlds/w1.ts | Mostly a 1-1 pool | 51 sections are tagged `feel: ['1-1']` only; 15 others also serve 1-2, 1-3 or 1-5 (w1.ts:71 and the feel tags). | Data, not code: fine. 1-2 to 1-9 need their own sections, and their bands come from their own briefs. |

**What C1 does that other stage types would redo:** nothing in its files (w1.ts, w1.test.ts, firstRun11.ts, provenSeeds.ts, the seed
lists). One trap: if C1 re-lays a section that 1-2, 1-3 or 1-5 share to 1-1's bands, those stages inherit 1-1's numbers. C1 should give
1-1 its own versions of shared sections (`feel: ['1-1']`), not tighten the shared ones.

## 3. The stage kit: mission x direction x mechanic, smallest set, in order
1. **Types first (Architect, 3-4 h, now, parallel with C1).** New file `src/game/stageKit.types.ts`: `StageMode` (section 1),
   `Travel = 'right' | 'left' | 'up' | 'down'`, `Mission` (today's ObjectiveType plus `bring-home`), and `StageBrief { mission, travel,
   mechanics[], fall, reach }`. Types only; no C1 file is touched.
2. **Direction as a mode (Engine, 6-10 h, after E0a and A2 merge).** engine.ts:2268, :2532 and :3221-3228 read `mode.travel`; 4-7's
   `w4.descent` becomes `travel: 'down'`; the bots' progress and the help ladder's "past" read the same thing. This unlocks left-running
   stages and makes descents a kit.
3. **The verdicts by brief (Architect then Engine, 6-8 h, after E0a merges).** Scope by physics and setting; new SectionKinds; look by
   kit (section 2). The Designer flies the drop and swing arcs alongside (2-4 h).
4. **gen2 lays every travel (Engine, 8-12 h).** Flow up, down and left; a shared cross-world set-piece library chosen by `engine_slot`
   (4-8 h, can run in parallel).
5. **Mechanics as kit pieces, any order, each in parallel (Engine, plus art through an approved HF list):** breakable block (4-6 h),
   countdown gate (4-6 h), up-down and point-to-point platforms (4-8 h), calm pools anywhere (3-5 h), side-crossing lane hazard (8-12 h),
   auto-scroll mode (4-6 h).
6. **Big missions after that:** rescue with a tether (12-20 h) and run-time card pick (12-20 h). Each gets a Designer one-pager and a
   mock-up for Matt first.

Steps 1 and 5 never touch C1's files and can start now. Steps 2-4 touch engine.ts, pipeline.ts, reach.ts and verdicts.ts, so they wait
for E0a and A2 to merge (D40). Total to a working kit (steps 1-4): about 25-35 h. Each mechanic after that: 4-12 h.
