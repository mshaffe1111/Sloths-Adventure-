# W3-PIECES: every World 3 engine piece in dependency order, in chains that run side by side (R-165.449, R-165.450)

The lead, Wed 11-25. Taken from each stage's design (t-design-31-32, t-design-33-35, t-design-36-39: the 'Engine (2 NEW...)' sections) and
WORLD-3-PLAN §2 (t-plan-w3). A stage builds the day its pieces are READY (LANES rule 2). Packets: reference/packets/2026-11-25/.
All land on t-eng-w3 (merge, no force), so each chain merges the others' landings in before it lands.

## The chains (a chain is one helper's queue; chains run in parallel)
| Chain | Order (size) | Unlocks |
|---|---|---|
| DOWN | ENG-DOWNBOT (running): 3-1's down lay + the bots to the shrine | 3-1 |
| A: noise | ENG-NOISE (S) -> ENG-VINE + 3-5's deep sleep (M) -> ENG-LURE + 3-3's bot skills (S + S-M) -> 3-5's bot skills (S-M) -> ENG-SLEEPER (3-8, S-M) | 3-3, 3-5, 3-8 |
| B: light | ENG-DARK (M) -> ENG-SPORE (S-M) -> ENG-MOON + wait-for-light (M + S) -> ENG-LIGHT (3-6, M) -> ENG-FERN (3-7, S) | 3-1, 3-4, 3-6, 3-7 |
| C: hang | HANG-SPEC (Matt's answer, by Thu morning) -> ENG-ROOT (M) | 3-2, 3-5 beats 3 + 9, 3-7, 3-9 |
| Last | METER-W3 (M: dark, spore, ocelot, jaguar, shimmy, thorn vine channels) once A and B's first pieces land; 3-9's V preview (S) and bait-and-slip (S) | all; 3-9 |
| Art | ART-W3 (F4: batch 1, stand + climb) -> batch 2 (roots, rims, glowworm patch, stalactite, cap, chute, moonflower) | all |

## Which stage waits on what
| Stage | Pieces it needs | Earliest READY |
|---|---|---|
| 3-1 | DOWNBOT, DARK, SPORE (+ LENGTH: the kid's fastest clean 101 s < 120 s) | Thu |
| 3-2 | PROWL (in main), ROOT (after Matt's hang answer), DARK | Fri |
| 3-3 | NOISE, LURE + bot skills, SPORE (the patch's cloud) | Fri |
| 3-4 | DARK, MOON + wait-for-light | Fri |
| 3-5 | NOISE, VINE + deep sleep, 3-5 bot skills, ROOT | Sat |
| 3-6 | DARK, LIGHT | Sat |
| 3-7 | FERN, ROOT, running left (2-7's, in) | Sat |
| 3-8 | VINE, SLEEPER, lianas (1-6's, in) | Sun |
| 3-9 | everything + V preview + bait-and-slip | Sun |

## The honest load (to say to Matt on Friday evening)
Engine pieces left: 5 M (DARK, VINE, MOON, LIGHT, ROOT) + METER-W3 (M) + about 8 S. At about 2 h an M and 1 h an S that is about 20 h of
engine time; split over chains A, B and C it is about 7 h each, so the pieces can be done by Saturday if three engine lanes run from
Thursday. The nine builds at 2 h each are 18 h of build time on top. That is the risk: if the pieces run late, 3-8 and 3-9 slip past Sunday.
The cut, if needed (Friday evening's question): 3-8 and 3-9 to the next week, or 3-7's fern to a simpler find.

## Catch-ahead from 2-8's fork (CI #80, level.md rule 24, 11-25)
No World 3 design has a two-road fork. 3-5's 'quiet way vs loud way' is a choice by MOVE (climb, hang, land on moss vs a big drop): READY-35
flies a full-run walk-off, a single and a double from every beat's top and shows which way each takes (a plain run-off must never be the
only way down past a sleeper). 3-7's secret is off the main route: its entry (a hang to the fern) is flown the same way.
