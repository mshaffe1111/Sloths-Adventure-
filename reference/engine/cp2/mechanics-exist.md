# Do the 17 shared-library ideas' mechanics already exist? (planner, 2026-11-05 ~12:35 AM ET; checked in the code on `main`)

- **yes**: the engine plays it today, as cited.
- **adapt**: the engine has the behaviour somewhere (another world, a puzzle room or a boss lair), and the idea needs it placed as a
  stage piece.
- **new**: nothing in the engine does it.

Build sizes are estimates.

| Idea | Mechanic | Verdict | Evidence (main) | Build size (estimate) |
|---|---|---|---|---|
| Hollow-log crawl | hide in a hollow; duck | adapt | trunk hollows `protoStage.ts:119`, drawn and used `engine.ts:6099`; ducking `engine.ts:2101`; eagle hide in bushes `engine.ts:1481` | small: a log-shaped hollow placed on the route |
| Root gate | a gate opened by a switch | adapt | the puzzle kit's vine gate opened by a plate (`kitStage.ts:6-7`) | small: a gate piece with the root art |
| Bobbing crates | a platform riding up and down | adapt | World 2's rope-and-basket lift, a 'moving' platform (`types.ts:308`, `lift.ts`); river logs drift sideways (`drift`, protoStage) | small-medium: a lift on a bob cycle, with no rope |
| Reed isles | floating static platform | yes | static platforms; lily pads exist (`protoStage.ts:2294`) | art only |
| Falling stalactites | something that falls on a timer | adapt | World 4's falling trees (`w4Play.ts:96` `fallTrees`); timed zones (`zones.ts:263-401`: geyser, bolt) | small-medium |
| Sleeping bat | creep past a sleeper | adapt | the sleeping snake (`protoStage.ts`, the "Sleeping snake" stretch, `sleepingGuard`) | medium: a new creature type with its tell |
| Counterweight lift | stand on one side to raise the other | adapt | the seesaw in the puzzle kit (`kitStage.ts:12`) | medium: the seesaw as a route piece |
| Updraft ride | rise on warm air | yes | `GeneratedStage.updrafts` (`stageGenerator.ts:97`); the engine lifts an open leaf (`engine.ts:5436`); 4-7 uses it. Needs the glide skill | art only, plus the teach |
| Slung log | a platform swinging on ropes | adapt | only in a boss lair: "a log slung on two ropes... swinging side to side" (`lairCrocObjects.ts:6`) | medium: moved out of the lair into the stage engine |
| Crumbling ledge | breaks a beat after landing | yes | `type: 'fragile'`, `crumbleAfter`, `creak` (`engine.ts:2477-2580`); zone 'crumble' (`zones.ts:401`) | art only |
| Behind the falls | a hidden place behind a waterfall | yes | World 4's waterfall veil: "Behind the water nobody can see you" (`w4Play.ts:385, 401, 765`) | small: as a route branch |
| Push block | push a block for a step | yes | platforms with `push: {min, max}` (`w4Play.test.ts:87`); 1-x's "Push the log" (`w1Sections.ts:101`, protoStage `logPuzzle`) | art only |
| Hanging planks | planks that dip under him | new | only ropes sag (`ropeArt.ts` `ropeDip`); no platform dips | medium |
| Hot rocks | a surface dangerous on a cycle | adapt | timed hazard zones: geyser, bolt, spore (`zones.ts:263-270`) | small-medium: a zone on a platform |
| Secret tunnel | break a cracked floor, drop to a hidden road | adapt | crumble (above); "leaves over secrets" (`engine.ts:423`); secret bushes (`engine.ts:1481` `b.secret`) | small-medium |
| Scaffold climb | climb a structure | yes | climbing vines in every world; `ladders` in ProtoExtras (`protoStage.ts`) | art only |
| Bridge span and fallen column | static walk | yes | static platforms | art only |

**Tally:** 7 yes, 9 adapt, 1 new (hanging planks).

Not checked yet: whether each "yes" plays well as a repeated route piece (rather than the one-off it is today). Each still gets a
real-engine proof before it goes on the sheet (P2).
