# Research: where it all is (for anyone designing the engine or a stage)

Read the sources, not summaries. Every claim about OUR game must be checked in code (the research invents some).

| File | What it is |
|---|---|
| `reference/GEMINI-PCG-RESEARCH.md` | Matt's first research (2026-10-27, four parts): procedural generation, level design numbers |
| `reference/GEMINI-LEDGER.md` | that research, recommendation by recommendation, with status in code (2026-10-28) |
| `reference/research/GEMINI-VARIETY-2026-11-02-full.txt` | the Nov 2 report (31 cited sources: Smith's rhythm groups, Kishotenketsu, Celeste, game feel) |
| `reference/research/MATT-RESEARCH-2026-11-04-full.txt` | the Nov 4 research (119 KB): WebGL, node-graph generator, BPM beat maps, validator, enemies, bosses, mutators, build order |
| `reference/research/ledger/LEDGER-2026-11-02-full.md` | the Nov 2 report line by line (140 rows): what we have, missed, contradictions |
| `reference/research/ledger/LEDGER-2026-11-04-part1.md` | Nov 4 research lines 1-389 (183 rows) |
| `reference/research/ledger/LEDGER-2026-11-04-part2.md` | Nov 4 research lines 390-end (165 rows) |
| `reference/research/MATT-RESEARCH-2026-11-04.md`, `GEMINI-VARIETY-2026-11-02.md` | the lead's short summaries (known to be thin: D29) |
| `reference/STAGE-RULES.md` | Matt's fixed rules and the numbers every stage must meet |
| `reference/PLAN-TO-80.md` | the plan from 55/100 to 80+ |
| `reference/W1-REBUILD-PLAN.md` | how 1-1 to 1-5 were rebuilt on 11-04 (beat-traced, by hand) |
| `reference/research/../CONTINUOUS-IMPROVEMENT.md` | defects and root causes (D26 "everything feels the same", D29, D30) |
| `reference/qa-reports/world1-baseline.md` | the quality supervisor's in-order play of old World 1 ("one stage played six times") |

Code worth knowing: `src/game/beatTrace.ts` (beat-traced placement), `src/game/w1Rhythm.ts` (1-2/1-5 generator), `src/game/gen2/`
(the roll-and-curate generator for later worlds), `src/game/physics.ts`, `src/game/engine.ts`, `tools/validate/` (the checker),
`src/game/layoutMemory.ts` (replays), `src/audio/scenes.ts` (per-stage music tempo).
