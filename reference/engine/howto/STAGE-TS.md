# How-to, part 1: running a stage through the engine's gates (tools/engine/stage.ts)

Written by the engine-core porter, 11-05 3:50 PM ET, against engine-core 1b6aecde6, for the designer's 5:10 pass. Part 2
(MIXER-DATA.md, the designer's) covers writing the stage's data. This part covers the one command that judges it, and how to read what
it says.

## 1. The one command

```
npx tsx tools/engine/stage.ts <id>              # e.g. 1-1: about 2 min
npx tsx tools/engine/stage.ts <id> --plant      # adds the stage itself as a neighbour: the neighbour check must FAIL (it proves the check bites)
```

Options: `--layouts N` (default 16, both settings), `--neighbours N` (rolls per neighbour, default 4), `--out <dir>` (default
`reference/engine/stage-reports`).

It builds the stage from its spec the way the game builds it (Normal and Easy, layouts 1..N), runs every gate below, prints one line
per gate, and writes `reference/engine/stage-reports/<id>.md`. It exits 1 if any gate fails. **Every gate must PASS on 16 x 2 before
the stage is done.** A NOT RUN row is not a pass: it names a check that no tool makes yet.

## 2. The gates, in the order they run

| Gate | What it checks | Where the number comes from |
|---|---|---|
| spec | the spec is complete and legal: every move a node uses is taught before it, each deck's ideas exist, the pieces fit the theme, Normal's length starts at 120 s or more | `src/game/mixer/spec.ts` checkSpec; the moves taught before the stage come from the move table, `src/game/moveLadder.ts` |
| level check (N x 2) | every build can be finished: every jump makes it, every pickup can be reached, the exit is reached | `tools/inspect/eraRoll.ts` checkRoll, the game's own level check (`src/game/levelCheck.ts`) |
| length | a quick player's time (Normal) sits inside the profile's band; Easy is at or over its floor | `src/game/stageTime.ts` modelAll, fast player; the band is the spec's `profile.length` |
| quiet stretches | no stretch of the route over 4 s with nothing to do | `tools/inspect/eraRoll.ts` measureRoll, RULES.quietMax |
| pass lines | splits (two roads 120 px or more apart for over 300 px) and the two-road share of the stage, medians over the Normal builds | `src/game/passLines.ts`: the measure is engine-runs' `layout.py zones`; the line is the stage's **measured reference row** in `REFERENCE` (1-1: old 1-1's medians on main). Never the profile's words |
| stage lines | per phone view (pickups, hazard kinds, standing kinds, upright views with play in the upper half), the float share, the idea count, landings up or down, something new every N px; Normal and Easy | engine-runs' own tools, called as they are: `tools/engine/runs/dump.ts` then `layout.py`, `support.py`, `ideas.py` and CP1's `reference/engine/cp1/measure2.py`; lines in `REFERENCE` |
| neighbours | the stage plays unlike every other engine-built stage of its world: no roll pair over 0.78 cosine of action 3-grams, no 20 s stretch that plays alike | the 200-roll tool's own sameness rules (`tools/inspect/eraRoll.ts` RULES, `analyze.ts` cosine, `lookalike.ts` looksAlike). Live, old stages are reported, not judged, against `tools/engine/neighbourknown.json` (the designer's ruling, ENGINE-SPEC c62a778d; R-165.47) |
| tests | the stage's own test file, `src/game/stage<w><m>.test.ts` (1-1: `stage11.test.ts`, the old 1-1's promises kept on the new stage) | the suite's test runner |

The repo's gates (tsc, the test list, vite, drawcheck, clipcheck and the rest) are not repeated here: their list is
`.github/workflows/gates.yml` and `reference/methods/gates.md`, and they run before any merge.

## 3. Reading a breach

Each FAIL line says what was measured, the line it missed, and where the line came from. Examples from 1-1 on 1b6aecde6:

| The report says | It means | What to do |
|---|---|---|
| `quiet stretches: normal 15: 5.5 s quiet (max 4)` | layout 15 has 5.5 s of walking with nothing to do | an engine finding (the lay): report it to the planner with the layout and setting |
| `pass lines: splits at 120 px: median 5, line 34 (old 1-1 on main ...)` | the stage has 5 two-road stretches where its reference had 34 | an engine finding: the stage's data can't add branching the engine doesn't lay. Never lower the line |
| `stage lines: normal upright standing kinds: 5, line <= 4` | some upright phone view shows 5 kinds of things to stand on | report it; it is one of ENGINE-SPEC §E.4's known misses for 1-1 |
| `neighbours: 1-5: a 20 s stretch plays alike (1-1 roll 1 vs 1-5 roll 1)` | a 20 s stretch of 1-1 plays like one of 1-5 | an engine finding (shared pool, fixed shapes) |
| `neighbours: 1-3 (live): ..., and not on tools/engine/neighbourknown.json` | the stage now plays like a live stage it did not before | a new likeness: report it; the known list only shrinks |
| `tests: 1-1: nothing can cost a life: ...` | one of the old stage's promises is broken on the new one | the test names the x and the layout; report it |
| `NOT RUN: boughs + creaky share` | no tool measures it yet | not a pass; say so in the stage's report |

**The rule for a breach: report it, never patch around it.** If the stage's data (its spec) is right by its page and a gate still
fails, it is an engine finding for the planner. Never change a line, a known list, a test or the engine to make a stage pass (Law 22).

## 4. What stage.ts does not do yet

- stills (upright and sideways) and the stage map: NOT RUN. Today's stills are shot with a dev build and a scratch Playwright script;
  stage.ts will call the tool once there is one to call.
- boughs + creaky share and "no idea twice in a row": NOT RUN, no tool prints them.
- a brief (generatePlan's input) in place of a spec: coming, once the planner's generator lands.
