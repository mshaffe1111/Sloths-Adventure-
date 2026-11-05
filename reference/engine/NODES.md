# Nodes, done right: jobs, shapes, dials, stage graphs and the world ledger (designer, 11-05 4:56 PM ET)

**Why:**
- gen2's `missionGraph` gives every stage one fixed 9-node spine (main pipeline.ts:285-295: start, teach, develop, rest, twist,
  rest, twist, climax, goal, with the same shares and tensions). Only a gauntlet adds one twist (:323). A node is only its phase.
- So every gen2 stage has the same skeleton. That is a root of "it's just repetitive", like the 355/368 repeat rolls (R1 L2).
- Matt (via the lead, 11-05): as many variables as possible, so the same level is almost impossible, each variation used at most
  about twice a world.

Kinds of source: RESEARCH (file:line or the R-file's lesson), MATT, MEASURED, JUDGMENT (with its reason).

## 1. Node jobs: what each asks of the player, and its rules

| Job | Asks | Rules | Source |
|---|---|---|---|
| `arrive` | nothing hard; read the place | flat and safe; no ground ends and nothing hurts in the first 1,300 px | STAGE-RULES:161 |
| `teach` | meet one new move | three steps: expose, a SAFE blocking validation, then challenge; one new thing; never forked | R1 L5 (Rayman "exposition, validation and challenge"); LEDGER-ENGINE-GEMINI:479 |
| `practise` | repeat a taught move with small changes | may fork; one exact repeat allowed before a rest | Smith 2009 §5 (ES L1883) |
| `test` | a taught move under pressure | **the move must be required**: a bot without it fails the node, the full bot passes | R2 §2 L5 (Nelson & Smith; Green et al. 2018) |
| `combine` | two taught moves on one beat | the stage's pair | LEDGER-2026-11-02-full.md:24, :33 |
| `twist` | a taught move turned (break the rhythm just learned) | after at least one test; its rhythm differs from the part before | LEDGER-2026-11-02-full.md:72 |
| `rest` | breathe | about 2× the local beat; no hard input; after every test, twist and set piece. It holds a Dot SPOT, a place: a line is set there only when a Matt-approved line fits, never one at every rest | C2; LEDGER-2026-11-02-full.md:330 |
| `reward` (secret alcove) | look off the line | a find, proven reachable, off the main route | LEDGER-2026-11-02-full.md:439; R1 §4.7 (secrets per stage) |
| `signature` (set piece) | the stage's one surprise | one per stage, unique in the game, passing Wonder's 3 tests (it links before and during; he can suddenly do something new; it can be said in one phrase) | R1 L6; R1 §4.5 |
| `pressure` (chase) | move on, don't stop | X-8's moving pressure; never in a first stage | LEDGER-2026-11-02-full.md:124 |
| `climb` | go up | a rising stair of landings, taught moves only; a vertical trunk climb or shaft only in a world or stage that owns it (in W1 that's 1-4: 1-1.md:41) | LEDGER-2026-11-04-part1.md:315-316 (chimney) |
| `descent` | go down | every world has a going-down stretch | LEDGER-2026-11-02-full.md:54 |
| `fork` | choose high or low | both roads finish and rejoin; both judged by the gates | LEDGER-2026-11-04-part1.md:317; WORLD-RULEBOOK §7.10 |
| `puzzle` (room) | think, not reflex | hand-built room; stays as built | the rooms rule (ES "Puzzle rooms that roll") |
| `arena` | a fight in a held space | purge and gauntlet archetypes; the combat ladder | pipeline.ts WANT (arena); R-159.1 |
| `flow` (run) | keep a rhythm going | a run of quick beats on the roll's tempo; no dead time over 2.5 s | R2 §2 L1 (Launchpad rhythm groups); WORLD-RULEBOOK §7.1 |
| `story` | see a story moment | a beat the brief names (the note, a clue); no hard input over it | the brief's `must` |
| `preview` (boss) | glimpse the boss's attack in small form | X-9 only | LEDGER-2026-11-02-full.md:130 |
| `change` (of pace) | a sense flipped: slow, dark or a puzzle | X-6's job; the world's lowest median beat rate | LEDGER-2026-11-02-full.md:358 |
| `finale` | everything taught, dense | 15-20 s at the exit, unless the brief ends quiet | LEDGER-2026-11-02-full.md:78, :204 |
| `exit` | arrive | the end piece where the trend reaches, the exit totem, the clue | main stageGenerator.ts:2136; WORLD-RULEBOOK §2 |
| **added:** `cooldown-in-node` | the last beat of a hard node eases | every hard node ramps, then cools at its end | R1 L4 (SMBF and Shovel Knight cadence) |
| **added:** `choice-reward` | the harder road pays | the high road of a fork holds a FIND (the golden seed, a keepsake), never petals: petals are the story's trail, low at marching height (1-1.md:26-27). The same holds in any world whose trail is story (W5's carvings, Meeca's messages) | LEDGER-2026-11-04-part1.md:317 ("upper harder with collectible") |

## 2. Node shapes

| Shape | What it is | Source |
|---|---|---|
| `flat` | across, one band | LEDGER-2026-11-02-full.md:353 (X-1 across) |
| `rising` | across and up, a stair of landings | LEDGER-2026-11-02-full.md:54 |
| `falling` | across and down | the same (each world has a going-down stretch) |
| `shaft` | straight up a column (chimney) | LEDGER-2026-11-04-part1.md:315-316 |
| `two-road` | high and low, rejoining | LEDGER-2026-11-04-part1.md:317 |
| `loop-back` | bottom left to right, shaft up, top right to left over the start, drop to exit | LEDGER-2026-11-04-part1.md:316 |
| `hub` | a centre with an alcove or two off it | LEDGER-2026-11-04-part2.md:113 (hub for search) |

## 3. Node dials: each node rolls these (none of them is a fixed default)

| Dial | Values | Source |
|---|---|---|
| `tempo` | hurry or patience (each modifier comes in both versions, weighted equally) | LEDGER-2026-11-02-full.md:273, :276 |
| `density` | low / medium / high moves a second, climbing through the stage | LEDGER-2026-11-02-full.md:86, :203 |
| `height` | up / level / down within the node | LEDGER-2026-11-02-full.md:54 |
| `terrain` | the world's terrain families (W1: floor and stones, raised logs, mounds, boughs) | R2 §2 L1 (variety is kinds, not pixels) |
| `creatures` | none / one kind / a formation (solo, chain, swarm), once taught | LEDGER-2026-11-04-part2.md:63 |
| `hazard` | none, or the world's taught hazards | WORLD-RULEBOOK §2 (ruling 3) |
| `rating` | 1-10, in a cadence that ramps and cools | R1 L4 |
| `shape` | §2's list | as §2 |

## 4. Stage shapes: several graphs per archetype, rolled within the brief (replacing the one SPINE)

A stage graph is an ordered list of jobs with shapes. Each archetype has several. A roll picks one the brief allows, then rolls each
node's dials. Every graph obeys WORLD-RULEBOOK §4's order rules: teach before use; a rest after every test, twist and set piece; the
signature in the last third; finale or quiet exit by `ends`.

| Archetype | Graphs (each one a different skeleton) |
|---|---|
| sprint | **A** arrive, teach, practise, fork, rest, test, signature, exit · **B** arrive, teach, flow, rest, combine, climb, test, rest, finale, exit · **C** arrive, practise, fork, test, rest, twist, descent, signature, exit · **D** arrive, teach, practise, rest, climb, fork, test, cooldown, exit |
| relic_hunt / rescue | **A** arrive, teach, hub (alcove), rest, fork (alcove), test, rest, finale, exit · **B** arrive, practise, loop-back with two alcoves, rest, twist, exit · **C** arrive, teach, two-road with a reward on each, rest, signature, exit |
| stealth | **A** arrive, teach (hide), practise, rest, pressure, rest, signature, exit · **B** arrive, change (dark), practise, twist, rest, finale, exit |
| vine_runner | **A** arrive, teach (swing), flow, rest, combine, test, finale, exit · **B** arrive, practise, shaft, rest, twist, signature, exit |
| purge / gauntlet | **A** arrive, arena, rest, arena (twist), rest, finale, exit · **B** arrive, practise, arena, flow, arena, preview, exit |
| ascent | **A** arrive, shaft, rest, shaft (twist), signature, exit · **B** arrive, climb, fork, rest, climb, finale, exit |

**The brief constrains, the roll chooses:**
- `teaches` forces the teach nodes;
- `ends` picks a finale or a quiet exit;
- `trend` biases the shapes (up: rising, climb, shaft);
- `branching` sets the fork count;
- `pair` fills combine.

Graphs are DATA (a world's list), so a world can add its own. These lists are a starting set, and each graph is **JUDGMENT**: the
research gives the jobs and shapes, but no shipped game publishes its graph list. Each is judged by the gates and by Matt's play.

## 5. The world ledger: no variation more than twice a world

**Caps (MATT: "each variation used at most about twice per world"):** across a world's stages, these may each appear in at most 2
stages:
- a stage graph;
- a tempo profile (the node-by-node hurry or patience sequence);
- a signature (unique in the game: R1 L6).

The ledger is world data the generator reads, saved as stages are built (R1 §4.2, SMBF "We keep track to avoid duplicates").

**Neighbours differ on at least N = 2 of these three: tempo, camera direction, thinking load.**
- LEDGER-2026-11-02-full.md:350: "A world feels repetitive if its stages share tempo, camera direction and thinking load".
- STAGE-RULES:58: neighbouring stages must not share a tempo and a camera direction (ES G L1837).
- Differing on 2 of the 3 means a neighbour can never share both tempo and direction (SR:58) nor all three (:350). N = 2 is the
  smallest value that meets both sources.
- Plus the neighbour gate (lookalike < 0.78, not looksAlike).

## 6. What 1-1 needs NOW, and what waits (D44)

**NOW (1-1 alone can prove these):**
- **Jobs:** arrive, teach (with the safe validation step), practise, fork, rest, flow, combine (bounce + double), climb, test (the
  required-move gate), signature (the double chain), cooldown-in-node, choice-reward (the golden seed), and a quiet exit.
- **Shapes:** flat, rising, two-road.
- **Dials:** tempo, density, height, terrain, rating. Creatures and hazard are none.
- **Stage graphs:** sprint A-D, rolled under 1-1's brief (teaches, ends quiet, trend up). This replaces the SPINE for 1-1 only,
  behind the lock, with every other stage byte-identical.
- **Gates:**
  - era diversity, now over graph and dials too;
  - the required-move (limited-agent) gate on each teach and test;
  - the cadence check: ratings ramp and cool (R1 L4).

**LATER:**
- the world ledger and its caps (needs a second W1 stage: D44);
- the neighbour N = 2 check;
- puzzle, arena, pressure, preview and change nodes;
- loop-back, shaft and hub shapes;
- the other archetypes' graphs;
- creature and hazard dials.

### The supervisor's notes, applied (designer, 11-05 4:58 PM ET)
- **Slot roles** (X-6 change of pace, X-8 pressure, X-9 boss preview) are the research's defaults. A world's story briefs override
  them per world: W1's chase is 1-5's, not 1-8's slot by default.
- **World 5 gets its own graph list** (its sewing-box world and its story trail) before any W5 change uses §4's lists.
