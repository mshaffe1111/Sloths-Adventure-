# ADR-003: the stage kit, one core with pluggable modes (R-165.111 kit step 1, 2026-11-11)

**Types:** `src/game/stageKit.types.ts` (types only; nothing imports it at run time, so no stage moves). **Proof of the refusals:**
`src/game/stageKit.types.test.ts` (each `@ts-expect-error` fails tsc if the bad line ever compiles; planted: making the bad tower legal
fails tsc with "Unused '@ts-expect-error'"). **Built on:** origin/main and CAPABILITY.md (t-architect-capability). **Replaced this sprint
by:** nothing (D40).

## Context
- Matt, 11-11: after 1-1 we must mass-produce varied stages (down, up, left, Frogger lanes, rescues, puzzles), not 1-1 laid out again.
- CAPABILITY.md §1: much exists, but which way a stage travels is read in three engine places off `objectiveType === 'ascent'` and
  `proto.w4.descent` (engine.ts:2268, :2532, :3219-3235). The exit clamp pins him at a left-hand exit. Every special rule (chase, tide,
  lantern, slide, Dot's flight) is a one-off `proto` flag or a hand-wired field in engine.ts. Every timer keeps its own clock. gen2
  lays only `flow: 'right'`.
- Matt's outside analysis (ideas/MATT-30-IDEAS-ARCHITECTURE-2026-11-11.md) proposes layout + clock + rule change. That fits, but its
  "mix freely, zero changes" does not: a rule that moves reach moves every verdict (CAPABILITY.md §4).

## Decision
1. **One description per stage, `StageBrief`:** mission x spatial profile x clocks x mutators x mechanics, plus the fall rule, the reach
   claim, and what it teaches. A designer's variety matrix (R-165.111 step 2) fills one brief per stage.
2. **The shape fixes the travel.** `SpatialProfile` is a tagged union: run and rooms go right or left, a tower goes up, a shaft or
   switchback goes down, an arena stays. `Travel` adds 'left' and 'down' as values today's engine does not yet honour (step 2 does).
3. **One core engine, never separate engines.** `StageMode` answers the core's travel questions (best, progress, further, past,
   bounds, lead). `MutatorRun` is the one plug for a rule module. The core keeps hearts, lives, saves, the result, input and physics.
   `ModeHost` is the common part of DotHost and SlideHost. Today's three runs move onto it in kit step 2.
4. **One clock type.** `ClockDef` has phases (a 'warn' before a hurting 'on'), an offset to stagger lanes, and `easyStretch >= 1` (Easy is
   never faster). A timed mechanic must name its clock (`MechanicUse`); an unclocked lane hazard cannot be written.
5. **Mutators say whether they move reach.** Each kind fixes `reach: 'same' | 'changes'` (tether and time-scale change it today). A
   `ReachClaim` of 'flown' may list only reach-moving mutators, and a stage whose mutators are not covered is judged with ADR-001's
   `reach.unflown`, never silently.
6. **Old stages need no new data.** `MissionKindOf<ObjectiveType>` reads today's objective as a mission. `FallRule` repeats ADR-001's
   FallPolicy until E0a merges; then it becomes an alias.

## What it rules out
- A second engine for a stage type, with its own physics, saves and gates to drift and re-prove.
- Travel read from `objectiveType` or `proto` flags in new code; a left- or down-running stage that the progress bar, checkpoints, help
  ladder or bots read as rightward.
- A tower that runs down, an arena that travels, a lane hazard with no beat, a beat with no warning phase, Easy faster than Normal.
- A rule that changes his reach mixed into a stage and judged against the plain-flown arcs.

## Consequences (the next packets; allowed files do not overlap C1's: w1.ts, w1.test.ts, firstRun11.ts, provenSeeds.ts, seed lists)
- **Kit step 2, travel mode (Engine, 6-10 h, after E0a and A2 merge):** engine.ts (the three places, plus the help-ladder "past"),
  helpLadder.ts, new src/game/stageModes.ts, tools/inspect/firsttimer.ts and tierBots.ts (progress by travel). Lockall: no stage
  moves. 4-7 reads `travel: 'down'`.
- **Kit step 3, verdicts by brief (Architect then Engine, 6-8 h, after E0a merges):** gen2/reach.ts and verdicts.ts and their types
  read `StageBrief.reach` instead of `stageId === '1-1'`. Only 1-1 is flown, so the lock must not move.
- **Kit step 4, gen2 lays every travel (Engine, 8-12 h):** gen2/pipeline.ts flow from `SpatialProfile`.
- **Mechanic pieces (Engine, in parallel):** each adds its `MechanicId` value, its file, and a fairness check. A clocked one reads `ClockState`.
- Bundle: zero bytes today (types only). Perf: `MutatorRun.draw` adds layers that drawcheck counts like any other.
