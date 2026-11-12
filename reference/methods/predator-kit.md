# Method: a creature on the predator kit (a new animal, or changing one)
Last proven: 2026-11-11, t-engine-predators, 13 animals as data on one machine (EN-P). Owner of the last update: EN-P.
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
## Pitfalls we already paid for
- 11-11: tests under `src/game/predators/` are NOT run by the repo's test command (it lists folders, not subfolders). Kit tests live
  at `src/game/predator*.test.ts`.
- 11-11: a test that imports helpers from another test file runs that file's tests twice. Shared helpers go in `fixtures.ts`.
- 11-11: all tests green proved little: one planted fault in 25 survived, then one in 35 (a test stood where it could not see the
  fault). Plant the fault for every rule.
- 11-11: `posted` widened to "anything with no speed" and a charger began walking home after its charge. A rule that classifies by a
  number needs a test for the animal on the other side of the line.
## Tried and didn't work
- A sweeper's dive aimed where he was when the tell began: he outran it every time, so the bush lesson meant nothing. The dive
  follows him; only hiding before the tell ends calls it off.
## To try
- A clocked "looking" window (thorn vine, eaglets). Acts in two parts (the night harpy's slide, then its shock). The kicked shell
  bowling others over.
