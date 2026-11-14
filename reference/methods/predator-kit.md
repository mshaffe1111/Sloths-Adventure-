# Method: a creature on the predator kit (a new animal, or changing one)
Last proven: 2026-11-12, t-w1-creatures, the snake and drop traps in the real engine (W1C); 11-11, 13 animals as data (EN-P). Owner of the last update: W1C.
## When to use it
Any creature that can hurt, block or chase Pokey. Design: `reference/design/PREDATORS.md`. Code: `src/game/predators/`.
## Steps
1. **The sheet first.** The animal's row in PREDATORS.md §2 and §3: the real animal, our twist, ONE habit (not one its world's cast
   already has), its tell (seen and heard), 2-3 ways to beat it with how each ends, the way its world teaches first. The story keeper
   reviews the row before any code.
2. **Its place in the cast**: `roster.ts` (`HABIT`, `CASTS`). `predatorRoster.test.ts` fails if two animals in a world share a habit.
3. **Write its worked example before its data** (copy a block of `predatorWorld1.test.ts`): the tell and the attack on both
   settings, then one test per way to beat it, each named the way a player would say it. Run it: it must fail.
4. **Its data**: one `PredatorDef` (start from today's numbers and say in a comment why any number changes). Never a stage id, a
   seed or an x: a stage hands the kit a `Post`. Numbers that differ by setting go in `easy` (never harder; `checkPredator` refuses).
5. **A new rule in `core.ts` only when data cannot say it**, and only from a failing test. Then add a planted fault for it to
   `reference/qa-reports/EN-P/planted-faults.py` and run it: every fault must be CAUGHT (a survivor means a test is missing).
6. Every run of a predator in a test goes through `fixtures.ts` `run`, which asserts the tell gate on every step.
## The bar
`predatorWorld1.test.ts`: read top to bottom it says how the snake, the eagle and the boa play. `planted-faults.txt`: 35 of 35 caught.
## Checks before reporting
`npx tsc --noEmit -p .`; `npx tsx --test src/game/predator*.test.ts`; the planted faults; the stage lock recorded at the base and
checked after (`tools/engine/lockall.ts --layouts 2`); `npx tsx tools/engine/seedlist.ts 1-1 --check`; `npx vite build` and the main
JS bytes against the base. When an animal is wired into a stage, the whole gate list applies and it is judged on the phone.
## Wiring a cast into a stage (W1C, 11-12: the snake and drop traps run in the real engine)
1. **The stage names its cast in its BRIEF** (`GraphBrief.cast: ['snake']`); the pipeline writes `proto.cast = { kinds, traps }` on
   the built stage (`castOf`), and only then. The engine's `startCast()` hands every animal of a named kind to `castPlay.ts`
   (`CastPlay`): the kit steps it; `predatorAI.ts` never does (`if (e.kit) continue`). No cast named: nothing changes (the lock).
2. **A new kind a cast may name** goes in `predators/registry.ts` (as it plays in that world, `inWorld`) and needs a `CreatureDef`
   row in its world's cast file (`gen2/worlds/w1Cast.ts`; a sleeper is its own row with `extra: { asleep: true }`).
3. **A drop trap is a prop PAIR** (the load is the receptor on the animal's ground, the handle the source; both sockets `dn: 0`):
   `W1_TRAP_PAIRS`, the two SOCKETS 85-130 px apart (the hung load ends 140-190 px from the handle). `armedTraps()` (the kit's `emit`
   and `spawn`) writes `proto.cast.traps` only for a load an animal of the cast stands under, hangs it over the middle of that
   animal's patch and seats a sleeper under it. The machine is `dropTrap.ts`; the art `castArt.ts` (a stand-in until painted).
4. **Proof in the real engine:** `castEngine.test.ts` (engineCoreHarness; the arena is planted, the cast started by the engine's own
   start) and `castPlay.test.ts` (no engine), then `python3 reference/qa-reports/W1C/planted-faults.py`: every fault CAUGHT.
5. **A whole stage built on it:** 1-3, `gen2/worlds/w1Arc13.ts` (one graph, one piece a beat, all its own; `reference/design/1-3.md`),
   held by `tools/engine/library13.test.ts`; played by `npx tsx tools/inspect/castBots.ts --stage 1-3 --seeds 1-6` (P13's bots).
6. **On the phone:** `tools/engine/runs/trap-stills.mjs <port> <out> <prefix> <stage> <layout> [trap]` (needs
   `PW=/opt/node-tools/node_modules/playwright/index.mjs` here): before, the trap, the glide, after, upright and sideways. It only
   writes a still when the engine says the thing it is named for is true on that frame.
## Pitfalls we already paid for
- 11-12: a handle 230 px from its load put the hive half off an upright phone and the snake out of sight. An upright phone shows
  about 425 px of stage with him a third of the way in: 190 px is the most a handle may stand from its load.
- 11-12: in the page a raw `input.state.punchPressed = true` is cleared before the engine reads it; a tool punches with
  `input.triggerTouchPunch()`. (The engine test's PlainInput takes the raw flag.)
- 11-12: the first 8 real-engine tests passed and 2 of 23 planted faults SURVIVED (the test started the cast itself; the snake does
  not read stillness). A wiring test must let the engine's own start do the wiring, and each input the kit takes needs an animal
  that reads it (the boa for stillness).
- 11-11: tests under `src/game/predators/` are NOT run by the repo's test command (it lists folders, not subfolders). Kit tests live
  at `src/game/predator*.test.ts`.
- 11-11: a test that imports helpers from another test file runs that file's tests twice. Shared helpers go in `fixtures.ts`.
- 11-11: all tests green proved little: one planted fault in 25 survived, then one in 35 (a test stood where it could not see the
  fault). Plant the fault for every rule.
- 11-11: `posted` widened to "anything with no speed" and a charger began walking home after its charge. A rule that classifies by a
  number needs a test for the animal on the other side of the line.
- 11-12: a kit's `spawn` hook that MOVES its animal (a sleeper seated under its trap's load) made Easy drop that animal with no
  error: the builder finds what Normal kept by its fill's x (`keptFoes`). The pipeline now carries the fill with the animal; if you
  write a hook that moves anything, roll BOTH settings and count before you push.
- 11-12: a block placed ON a piece (`place: { kind: 'on' }`) is `main` unless told: a flag stood on a snake's log and emptied its
  socket (13 snakes fell to 12 on some seeds). Say `main: false` on anything an animal owns.
- 11-12: World 1 paints a log-style block 24-26 px thick as its fallen log and one 50-56 px thick as a bright green hedge. Look at
  each new piece on a still at every size it is laid; a style name is not a picture.
- 11-12: Easy lays Normal's KIND at each socket and then cuts by count (the first of a kind, then 60%): four of nine trapped logs
  stood empty on Easy. `Socket.easy 'stay'` keeps the animal a piece is built round (softened), and the cut passes it by.
- 11-12: a stage that changed builder (hand-built to the kit) passed all its own tests and broke eight others, two of them real
  game bugs (a crash on the second visit; a journal page waiting on a deleted line). Run the WHOLE suite before anyone plays it.
- 11-12: Dot's line 232 px before the thing it teaches is read too late at a walk (265 px a second, about 3 s to read). A teach line
  goes 800 px and more before its thing, nothing that hurts in between, and the kit lists it in `teachTips`.
- 11-12: never `git add -A` in a side worktree that links `node_modules`: the link was committed and replaced the real folder on
  checkout. Commit by path there.
- A sweeper (World 1's eagle) has no body on the ground: the kit moves its EYE. It is drawn from its kit state by sweepPose.ts (far off
  between passes, in at the edge for the screech, over its eye with its shadow for the pass, the dive in its tell), never by the enemy
  loop; a flying sweeper `rides` its eye so the box that hurts arrives with the drawn dive (ENG-E1, 11-14: without it the act flew 700 px/s
  from the far end of the stretch while the bird was already drawn on him).
- A tell drawn ON Pokey (the moss) is judged BEHIND every cover it shows in: green Pokey behind a 0.62 see-through green bush was a ghost
  nobody could find (ENG-E1's still, shots/moss-in-bush-before-fix.png); the bush now thins as the moss comes in (protoArt drawBushArt).

## Tried and didn't work
- 11-12: a step-up ledge under the first vine, so the first-timer bots would land and stop at it: they overshot it the same way
  (they decide to stop AT the handle and walk on about 220 px). The level was not the cause; the trace went to the bots' owner.
- A sweeper's dive aimed where he was when the tell began: he outran it every time, so the bush lesson meant nothing. The dive
  follows him; only hiding before the tell ends calls it off.
## To try
- A clocked "looking" window (thorn vine, eaglets). Acts in two parts (the night harpy's slide, then its shock). The kicked shell
  bowling others over.
