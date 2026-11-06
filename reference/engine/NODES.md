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
| **added (Matt, LATER, not 1-1):** `ending-fork` | choose how the stage ends | the last node before the exit: a high road to a denser finale with a find on it, or a quiet low road to the arrival; both reach the same exit. Code `F[L^+\|R_] E` (§8) | MATT (via the lead, 11-05); NODE-MIX-RESEARCH §E |

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
| sprint | **A** arrive, teach, practise, fork, rest, test, rest, signature, exit · **B** arrive, teach, flow, rest, combine, climb, test, rest, signature, rest, finale, exit · **C** arrive, practise, fork, test, rest, twist, rest, descent, signature, exit · **D** arrive, teach, practise, rest, climb, fork, test, rest, signature, exit (fixed 5:17 PM: the 4:56 PM lists broke two of their own rules, which writing them in the §8 code showed: A and C missed a rest after a test or twist, and B and D had no signature. Cooldown is not a node: every hard node cools at its end, §1) |
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
- **Jobs:** arrive, teach (with the safe validation step), practise, fork, rest, flow, combine (bounce + double), climb, twist, descent, test (the
  required-move gate), signature (the double chain), cooldown-in-node, choice-reward (the golden seed), and a quiet exit.
- **Shapes:** flat, rising, falling, two-road. (Added 5:17 PM: sprint C needs `twist` and `descent`, so both jobs and the falling shape join NOW, or 1-1 rolls 3 graphs, not 4. Both are section data, not new engine: a twist is a taught move turned; a descent is a drop off a log, already in old 1-1's flow.)
- **Dials:** tempo, density, height, terrain, rating. Creatures and hazard are none.
- **Stage graphs:** sprint A-D, rolled under 1-1's brief (teaches, ends quiet, trend up). This replaces the SPINE for 1-1 only,
  behind the lock, with every other stage byte-identical.
- **Gates:**
  - era diversity, now over graph and dials too;
  - the required-move (limited-agent) gate on each teach and test;
  - the cadence check: ratings ramp and cool (R1 L4).

**LATER:**
- the world ledger and its caps (needs a second W1 stage: D44);
- the `ending-fork` (Matt, 11-05: later stages; 1-1 ends on the quiet arrival);
- the neighbour N = 2 check;
- puzzle, arena, pressure, preview and change nodes;
- loop-back, shaft and hub shapes;
- the other archetypes' graphs;
- creature and hazard dials.

### The supervisor's notes, applied (designer, 11-05 4:58 PM ET)
- **Slot roles** (X-6 change of pace, X-8 pressure, X-9 boss preview) are the research's defaults. A world's story briefs override
  them per world: W1's chase is 1-5's, not 1-8's slot by default.
- **World 5 gets its own graph list** (its sewing-box world and its story trail) before any W5 change uses §4's lists.

## 7. Content types and world mixes (designer, 11-05 5:09 PM ET; NODE-MIX-RESEARCH.md on ccr-23292c36-550qmt; Matt: every node's content typed, with per-world percentages rolled per seed)

### 7.1 A node is job × content type × shape × dials
- **Job** (§1) is its role in a mechanic's arc: teach, practise, test, twist, finale (Hayashida's four steps, NODE-MIX §A).
- **Content type** (§7.2) is what fills it: a family with a difficulty ladder inside it (Dahlskog & Togelius: 23 patterns in 5
  families).
- **Shape** (§2) and **dials** (§3) as above.
- **Ruled 5:19 PM (the supervisor's §7 review, the lead accepting):** forks are a SHAPE (§2 `two-road`), not a content type, so no fork share throttles the floor road's splits (old 1-1: splits ≥ 34, two-road ≥ 0.61). Creatures are a DIAL (§3 `creatures`), not a content share: Matt's rule is "about a third of each stage enemy-free, 1-3 on screen" (his 12:15 AM rules, ENGINE-PLAN :55), from 1-3 on. A fork node counts as its LOW road's type.
- **The reward (H) is structural too (added 10:01 AM):** it's a FIND, not content. The deal never types it; it takes its reward section's own type. (Corrected: I first blamed seed 102948 on the deal typing H. The planner showed H already sits outside the deal; the `Hc1` token was a loosened fill. The real root is the engine's required-section check, which measured the seed perch's end from an unclamped entry under the corridor. That's the planner's fix. This rule stands as a held invariant, with a test.)
- **Structural nodes sit OUTSIDE the percentages:** `arrive`, `rest`, `story`, `exit` and `finale` / `arrival` (Smith 2009's
  rest areas). Graphs (§4) name content SLOTS, and the world's mix fills them.

### 7.2 The content-type catalogue (families, then variants; for our worlds)

| Family | Variants | Worlds (teach) |
|---|---|---|
| `ground` jump run | hops, gap jumps, doubles, stone runs, stump stiles, mounds | all (1-1) |
| `floating` pieces | boughs, floating logs, plank spans; moving lifts | all; lifts from W2 (2-7) |
| `water` crossing | lily pads, stones on the bed, drifting logs, rafts, rising water | W1 creek (where water draws), W2, W6 |
| `rope` and vine | shimmy rope, swing, liana, ladder vine, sinking vine, thorn vine | rope 1-3, liana 1-6, thorn W3 |
| `climb` | rising stair of landings; shaft or trunk only where owned | stair 1-1; kapok climb 1-4 |
| `bounce` | perched mushroom, twin bounce, bounce then double | 1-1 |
| `crumble` | snap twig, creaky limb, tipping root, crumbling floor (W7) | creaky 1-5 |
| ~~`creature`~~ | now a DIAL (§3), not a type: patrol, stomp, timed, watcher, swarm (by behaviour) | 1-3 on |
| `hazard` | the world's taught hazards (ruling 3: they return in later worlds) | per world |
| `puzzle` | the hand-built rooms | W1 rooms; W2 more |
| `pressure` | chase, rising water, closing light | 1-5 (W1's chase, by story) |
| ~~`fork`~~ / risk-reward | now a SHAPE (§2 two-road), not a type: a high/low split whose harder road holds a FIND | all |
| `secret` | an alcove off the line | all |
| `setpiece` | the stage's signature (unique in the game) | per stage |

### 7.3 World 1's MIX (real), and World 2's (DRAFT for Matt) (re-set 5:19 PM, after the supervisor's review)

**World 1, shares of content nodes across the world (creatures and forks taken out, the rest re-normalised to 100):**

| Type | W1 share | Arc (0 until taught, a peak over 2-3 stages, then a floor) | Source |
|---|---|---|---|
| ground | 32 | 1-1 on; peak 1-1 to 1-3; floor 15 | MATT ("World 1 = jumping, climbing, learning"); ES M3 L2045 (a staple is about a third or more) |
| floating | 22 | low in 1-1 (last third only); peak at 1-5 (boughs on kapok trunks) and 1-4 to 1-6 | the stage briefs' looks: 1-1.md:51 (boughs late), the 1-2 brief :45-47 (1-5's boughs on kapok). Old 1-1's 25.3% float line is **1-1's line only**, not a world cap (MATT 3:3x PM: "how else are you going to get variety if you're still judging everything off of one stage?") |
| climb | 13 | stair 1-1; kapok 1-4; peak 1-4 to 1-6 | MATT ("climbing"); the ladder (1-4) |
| rope | 13 | shimmy 1-3, liana 1-6; peak 1-6 to 1-8 | the ladder (moveLadder.ts; main's taught-at); 1-6 is lianas |
| bounce | 8 | 1-1; peak 1-1 to 1-2; floor 4 | main's 1-1 (mushroom on 16/16 layouts) |
| crumble | 8 | creaky 1-5; peak 1-5 to 1-7 | the ladder (creaky 1-5, C9) |
| puzzle | 4 | the W1 rooms only | the rooms rule (hand-built) |
| secret | 0 as content; it rides as a `reward` job on forks and rests | — | §1 choice-reward |
| pressure | 0 as content; 1-5's chase is a set piece by story | — | ES slot roles (the story overrides) |

- These shares are mine, set from the sources listed. No shipped game publishes a per-type mix (NODE-MIX §C gives examples only), so
  the split between types is **JUDGMENT, anchored to Matt's words and the stage briefs' looks**, and is measured over many seeds
  against this target (NODE-MIX §B.8). Each stage's own deal follows its brief's look; the world share is the average they make.
- **1-1's own deal** (from 1-1's teaches, its look and window): ground 40 (at the cap), floating 25 (last third only, under old
  1-1's 25.3% line), climb 20 (1-1's trend is up; MATT "climbing"), bounce 15. **JUDGMENT.**

**World 2: AN EXAMPLE only, not a ruling (Matt, via the lead, 5:24 PM: "lighter, more puzzles" was an example). W2's real mix is set when W2's kit is built, with its story, together with the supervisor:**

| Type | puzzle | water (drift logs, pads, stones) | rope (swing) | floating (incl. lifts) | ground | climb | crumble | bounce |
|---|---|---|---|---|---|---|---|---|
| W2 share | 20 | 24 | 11 | 15 | 11 | 9 | 6 | 4 |

- Re-normalised after creatures and forks came out. An example split only (JUDGMENT), to show the shape a world's mix takes.
- "Lighter" comes mostly from the dials: tempo toward patience, low density (NODE-MIX §C, the researcher's own call, unsourced).
- The W1 floor below holds from W2 on.

### 7.4 Caps, rarity and floors
- **Per stage:** no type takes more than 40% of a stage's content nodes (NODE-MIX §B.4).
- **Neighbours:** the same type never fills two neighbouring content nodes, except a `practise` right after its own `teach`.
- No "pick it again" bonus.
- **Rarity tiers** per chunk:
  - common;
  - uncommon;
  - rare (about 5% of draws);
  - unique (the set piece, once in the game).
  Plus a `hard` flag for a world's second half only (Spelunky 2's !rare and !hard).
- **Floor for older worlds' types (from W2 on):** each staple type taught in an earlier world appears in at least about a third of
  the later world's stages, with its longest absence ≤ 8 stages (ES M3 L2045; STAGE-RULES rule 1, "comes back in every later world").

### 7.5 The mechanics
1. **Roll the TYPE first, then the chunk inside it.** Otherwise the type with the most chunks wins: pool size silently becomes weight
   (NODE-MIX §B.1).
2. **DEAL the counts per stage:** largest remainder over the stage's content slots, then a ±1 jitter on the seed. Never roll each node
   on its own, because small samples drift (Smith 2009's chi-square critic).
3. **A BAG across the world:** each stage draws from the world's bag (Tetris 7-bag), so the world's total holds its mix while each
   stage swings.
4. **Order:** the deal assigns types to slots under the caps and the neighbour rule. Then each slot draws a chunk of its type, job and
   phase, under the window and rarity rules.

### 7.6 Two different "signatures"
- **The world's signature mechanic** is its largest-share type (W1: ground jump run) and its identity across the world.
- **The stage's signature** is the `setpiece` job (§1): one per stage, unique in the game, passing Wonder's 3 tests. It is never
  counted in the mix.

### 7.7 Content-type tags for w1.ts (for engine-core)
- **Harvested:**
  - ground: w1-learn, w1-stones, w1-stump-stones, w1-stone-dips, w1-second-jump, w1-leap-stones, w1-stone-road;
  - floating: w1-high-leaps, w1-low-boughs;
  - bounce: w1-cache-stones, w1-hop-bounce, w1-bounce-run;
  - climb: w1-ledges;
  - rope: w1-ropes;
  - structural: w1-meadow.
- **Mine (W1-NEW-SECTIONS):**
  - ground: #1, #2, #7, #8, #24, plus the forks #4, #14, #28;
  - floating: #3, #10, #20, #27, plus the fork #22;
  - climb: #9, #12, #13, #25, #29. #29 is a bough stair and a log span, with no rope, so 1-1's `not: ropes` holds; it sits only in 1-1's last third (ketsu, its boughs float);
  - bounce: #5, #6, #21;
  - fork sections take their LOW road's type (5:19 PM): #4 and #14 are ground, #22 is floating, #28 is ground (its mushroom is the other answer).
  - structural: #11, #15, #16, #17, #18, #19, #23, #26, #30.


## 8. The node code (designer, 11-05 5:17 PM, with the key added at 5:20 PM; Matt, via the lead: "our own compact notation", and "a key of what the different nodes would be, how the engine would define them, and a brief description of how they would play. That way, there's no ambiguity in what we're building")

### 8.0 THE KEY

Each row gives:
- **Code:** the symbol.
- **Name:** what it's called.
- **How the engine defines it:** what must be true for a node to count as it, and which check proves it.
- **How it plays:** what it's like for Pokey.

LATER means it is not built yet and not in 1-1.

**Jobs: one capital letter, always first**

| Code | Name | How the engine defines it | How it plays |
|---|---|---|---|
| A | Arrive | Flat and safe. No ground ends and nothing hurts in the first 1,300 px (STAGE-RULES:161) | You walk in on soft moss floor and look around. Nothing can hurt you yet. |
| T | Teach | **One new move,** in three steps: shown; then a SAFE check that blocks the way until you do the move (a miss costs nothing); then one small challenge. Flat or rising, never on a fork. Gate: a bot without the move can't get past the check | Something new turns up, like a step too tall to hop. You try the new move where missing is safe, then use it once for real. |
| P | Practise | A taught move again, a little changed each time. May sit on a fork. One exact repeat is allowed before a rest | You do the move you just learned a few more times, each one a bit different. |
| X | Test | A taught move under pressure, and **required**: a bot without it fails here, the full bot passes. A rest follows. It eases off at its end | A harder stretch you can only get through by using the move. Then it lets up. |
| C | Combine | Two taught moves on one beat: the stage's pair (1-1: bounce then double) | Two moves back to back, like a mushroom bounce straight into a double jump. |
| W | Twist | A taught move turned around: its rhythm differs from the stretch before. Only after a test. A rest follows | A move you know, used a new way, so the rhythm you just got used to breaks. |
| R | Rest | About twice the local beat, no hard input. Comes after every test, twist and set piece. Holds a Dot spot (a line only where a Matt-approved one fits) | A calm patch to breathe. Dot might say something here. |
| S | Signature (set piece) | One per stage, unique in the game, in the last third. Passes Wonder's 3 tests: it links to before; he can suddenly do something new; it says itself in one phrase. A rest or the exit follows | The one big moment you remember the stage by, like a chain of double jumps across floating logs. |
| F | Fork | Two roads that both finish and rejoin. The high road holds a find. Both roads pass the gates. It counts as its low road's type | The path splits: a harder high road with a treasure, or an easier low road. Both get you there. |
| U | Climb | A rising stair of landings, taught moves only. A straight-up trunk climb only where a stage owns it (W1: 1-4) | You hop up a staircase of logs and ledges toward the treetops. |
| D | Descent | Across and down | You drop down ledge by ledge toward the forest floor. |
| M | Flow | A run of quick beats at the roll's tempo, never more than 2.5 s of dead time (WORLD-RULEBOOK §7.1) | A run where every jump leads straight into the next, without stopping. |
| E | Exit (the arrival) | The end piece where the stage's trend reaches. 1-1: a long high log with the exit totem (main stageGenerator.ts:2136); the clue. A quiet exit is held to the rest rule | You walk out along a long high log to the totem, calm, and the stage is done. |
| L | Finale | 15-20 s at the exit, everything taught, dense. Not in 1-1 (it ends quiet) | The last stretch throws everything you've learned at you, fast. |
| H | Hidden alcove (reward) | A find off the main route, proven reachable. NOW in 1-1 as the planner's `w1-seed-perch` (the golden seed; `required` on every 1-1 roll), re-set 5:32 PM | A sneaky spot off the path with something to find, if you look. |
| K | Chase (LATER) | Moving pressure. Never in a world's first stage. W1's is 1-5's, by story | Something is coming. Keep moving and don't stop. |
| Z | Puzzle room (LATER) | A hand-built room that stays as built | A room where you stop and work out how to get through. |
| B | Arena (LATER) | A fight in a held space; the combat ladder | You hold one spot and deal with the creatures that come. |
| Y | Story beat (LATER) | A beat the brief names (the note, a clue), with no hard input over it | You stop for a moment and something in the story happens. |
| V | Boss preview (LATER) | The boss's attack in small form, at X-9 only | A small taste of what the boss will throw at you. |
| G | Change of pace (LATER) | A sense flipped: slow, dark or a puzzle. X-6's job | The stage suddenly feels different: slower, darker or a head-scratcher. |
| `F[L^+\|R_] E` | Ending fork (LATER, not 1-1) | The last node before the exit. A high road to a denser finale with a find, or a quiet low road to the arrival. Both reach the same exit (Matt, 11-05) | At the end you choose: a tougher climb with a prize, or a calm walk home. |

**Content: one small letter, what the node is made of.** The PIECES column (added 5:24 PM, Matt: "do certain nodes have certain pieces? Vines have to have vines, lily pads need lily pads") draws from LABELS.md. It says what the node MUST have, MAY have and must NEVER have. V18 checks it.

| Code | Name | How the engine defines it | PIECES (from LABELS.md) | How it plays |
|---|---|---|---|---|
| g | Ground jump run | Pieces on the moss floor road: hops, gap jumps, stone runs, stump stiles, mounds. Landings 3.5-7 body widths (G L1844) | **MUST:** the moss floor road under it, and at least one of: moss_stone, a log on a stump-post, a stump, a mound or bank. **MAY:** a low log; dressing off the lane; petals low. **NEVER:** a rock, stone, mound or bank in the air (LABELS rule 1); water pieces; a rope or vine as the way across | You jump along the forest floor over stones, stumps and dips. In 1-1 a miss just drops you to the floor. |
| f | Floating pieces | In 1-1, only in the last third (window [0.67, 1]). Moving lifts are LATER (W2) | **MUST:** at least one floating platform: a solid log, a bough (a solid branch on a trunk within 220 px, or a post, or floating where ruled) or canopy_bridge planks. **MAY:** catch boughs under each gap; a trunk as an anchor. **NEVER:** a floating rock or stone (rule 1); a trunk as a landing (rule 5); a lift in W1 | You hop across branches and logs hanging in the air. |
| c | Climb | A rising stair of landings | **MUST:** a rising stair of landings (log, bough, or moss_stone on a bank or its own base): at least 2/3 of the steps rise, no step goes down (a level rest landing within ±10 px is allowed), and the last landing is above the first (V18, nodePieces.ts; ruled 11-05 with the porter). **MAY:** a stump step. **NEVER:** a trunk as a landing; a vine climb (tree_climb) except in a stage that owns it (W1: 1-4) | Each landing is a little higher than the last, so you go up as you go along. |
| b | Bounce | A bounce, a twin bounce, a bounce into a double | **MUST:** a mushroom (bouncy) seated on the floor, a bank, a stump or a log. **NEVER:** a mushroom in the air; a bouncy branch or stone in W1 (they stay in the worlds they were designed for, W5 and W7-W10. RULED by MATT, 11-05 ~5:40 PM ET: "unless it adds something, then that should stay with the world that it was designed for"); the dressing mushrooms (w1Mushroom and kin are never landings, rule 6) | You land on a mushroom and it springs you up high. |
| r | Rope and vine (LATER; never in 1-1) | Shimmy rope (1-3, main dotLinesData:122), liana. Straight up or down on a vine always climbs | **MUST:** a rope with two anchors at the same height (± 40 px); or a liana anchored to a bough or the canopy with a landing past its arc; or a climb vine whose foot reaches a landing. **NEVER:** in 1-1 (`not: ropes`); a vine top in open sky; a trunk as a landing | You grab a rope or vine and shimmy or swing across. |
| k | Crumble (LATER, 1-5: main dotLinesData:123) | A landing that gives way. A required one is whole again when he respawns | **MUST:** a creaky branch (fragile branch creak) on a trunk or bough, drawn in W1's branch art. **NEVER:** the crumbling stone floor in W1 (that is W7's: LABELS §1, "Never W1"); a crumbling stone in the air | A branch creaks and drops away soon after you land, so don't wait around. |
| w | Water (LATER) | Pads, stones on the bed, drifting logs | **MUST:** a drawn water zone, with lily pads on its surface, stones seated on its bed, or drift logs on a drawn river. **NEVER:** pads, reeds or drift logs off water (rule 3; MATT "lily pads only on water"); a stone floating on the water | You cross water on pads, stones and floating logs. |
| h | Hazard (LATER) | The world's taught hazards, which come back in later worlds | **MUST:** the world's own taught hazard piece (W3: thorn vines hanging or swinging from trunks). **NEVER:** a hazard before its world teaches it; another world's hazard art (rule 4, "no lava in the forest") | Something on the way hurts, so you go over or around it. |

**Gates that prove the PIECES column:**
- engine-render's `padsOffWater` test (w);
- the E3 support check, where rocks never float (g, f, c, k);
- the theme lock (rule 4);
- V18 (§8.3) for the rest. It is new, part of the planner's parser: it reads each realised node's piece kinds against its row.

**Move: a digit**

| Code | Name | How the engine defines it | How it plays |
|---|---|---|---|
| 1 | Jump | A single jump is enough | One hop gets you there. |
| 2 | Double jump | **Required:** a gap or height past a single jump, which a bot without the double fails | You jump, then jump again in the air to reach it. |

**Shape: a mark after the move (flat has no mark)**

| Code | Name | How the engine defines it | How it plays |
|---|---|---|---|
| (none) | Flat | Across, one band | You head straight along. |
| `^` | Rising | Across and up | You climb as you go. |
| `_` | Falling | Across and down | You work your way down. |
| `F[ \| ]` | Two roads | High and low roads that rejoin | You pick a high road or a low road. |
| `^^` | Shaft (LATER, 1-4) | Straight up a column | You go straight up a tall trunk. |
| `@` | Loop-back (LATER) | Bottom left to right, up a shaft, top right to left over the start, then a drop to the exit | You run under, climb up, then run back over where you started. |
| `*` | Hub (LATER) | A centre with an alcove or two off it | A little clearing with hidden corners to poke into. |

**Marks**

| Code | Name | How the engine defines it | How it plays |
|---|---|---|---|
| `+` | Find | The golden seed or a keepsake, proven reachable. Never petals (they're the story's trail, low at marching height) | A treasure sits on the harder road. |
| `>` | Hurry | The node rolls its tempo to hurry (§3; hurry and patience are weighted equally, and the numbers are the planner's tempo range) | Keep moving. The jumps come at you quick. |
| `<` | Patience | The node rolls its tempo to patience | Take your time, look, then go. |
| `&` | Creatures (LATER, 1-3 on) | The creature dial on this node: none (no mark), one kind `&`, a formation `&&`. Matt: about a third of each stage enemy-free, 1-3 on screen | Critters are about, so watch where you land. |

**Kept in the data, with no mark:**
- the rating (1-10, read by the cadence check; the long form is `Xf2>:7`);
- density;
- the terrain family.

### 8.1 One token per node

A token is written `JOB content move shape find creatures tempo`, with no spaces. Only the JOB is always there.
- `Tg1^<` = teach, on the ground, the jump, rising, patience.
- `Xf2>` = test, on floating pieces, the double jump, flat, hurry.

Other rules:
- Only content jobs carry a content letter. A, R, Y, L and E are structural and never do (§7.1).
- After S, the letters say what the set piece uses. S is its own type and never counts in the mix (§7.6).
- Every content token carries a tempo mark, because tempo is rolled, never a default (§3). On a fork, the mark after the bracket covers both roads.
- The height dial (§3) and the rising or falling shape say the same thing, so the code keeps one mark.

### 8.2 A stage string

A stage string is the tokens in order, with spaces between them.

A fork is written `F[high road|low road]`:
- each road is its own run of tokens;
- the high road comes first;
- both roads end at the token after the bracket;
- the fork counts as ONE content node, of its low road's type (forks are a shape, §7.1).

Example: `F[Pb2^+|Pg1]<` is a fork, patience on both roads.
- The high road bounces into a double, rising, with the find.
- The low road practises the jump on the ground.
- It counts as ground.

### 8.3 Validity rules

The engine rejects a string that breaks one of these rules and names the rule and token, for example "V5 at token 9".

| # | Rule | Source |
|---|---|---|
| V1 | Content letters only on content jobs. A, R, Y, L and E take none, and their shape is flat | §7.1 |
| V2 | **T is flat or rising, never inside a fork, and its move appears for the first time.** One T per move in the brief's `teaches`, in the teach order (run is A's) | §1; WORLD-RULEBOOK §4; CoachOverlay.tsx:10 |
| V3 | P, X, C, W, M, U and S use only moves already taught earlier in the string. X's move is required (the limited-bot gate) | §1 |
| V4 | W only after at least one X | §1 |
| V5 | **Right after X, W or S comes R**, or E when it is the last node. An E straight after S must be a real breath: a calm walk-on of at least the rest's length (about 2× the local beat) with no hard input. In W1 that's #15 `w1-quiet-arrival` or #23 `w1-sunlit-log`. #30 `w1-last-step-up` (one hop) may end a stage only after an R (ruled 5:22 PM, supervisor's §8 flag 3) | §1; WORLD-RULEBOOK §4; 1-1.md:23 ("resolve, not triumph") |
| V6 | Exactly one S, in the last third of the stage's time | §1; §4 |
| V7 | F has two roads that both finish and rejoin. The high road carries `+`. No T inside | §1 fork, choice-reward |
| V8 | U is `c` and rising. `^^` only in a stage that owns the shaft (W1: 1-4) | §1 climb |
| V9 | D is falling (`_`) | §1 descent |
| V10 | Shapes the stage may use. 1-1 NOW: flat, `^`, `_` and the fork. `^^`, `@` and `*` are LATER | §6 |
| V11 | **No type over 40%** of the stage's content tokens (S and the structural letters don't count; the cap on a count rounds to the nearest whole node, so 40% of 7 is 3). **No type on two neighbouring content tokens.** Structural tokens between them don't separate them. Two exceptions: a P right after its own T, and **a T may share its type with the node before it**, because a teach brings its ONE new move onto terrain the player already knows (§1 "one new thing"; R1 L5). Ruled 5:22 PM (supervisor's §8 flag 1): the double is taught on ground, on #8 `w1-double-teach` (R2's safe dip; the stage11 promise test checks it), never on a stair | §7.4; §1; R2 3:11 ruling |
| V12 | Windows. In 1-1, `f` only in the last third (window [0.67, 1]) | §7.3; W1-NEW-SECTIONS |
| V13 | Slot jobs: K never in a world's first stage; V only at X-9; G at X-6 (a world's story moves these) | §1; supervisor's notes in §6 |
| V14 | **The type counts match the stage's deal, give or take 1** (the seed's jitter). A fork counts as its low road's type | §7.5; §7.1 |
| V15 | The `ending-fork` `F[L^+\|R_] E` is the last node before E. LATER, not 1-1 | §1 (Matt, 11-05) |
| V17 | **In 1-1, every graph holds at least one F**, so the stage can meet old 1-1's two-road floors (splits ≥ 34, two-road ≥ 0.61; stage.ts passLines). Ruled 5:22 PM (supervisor's §8 flag 2) | §E; stage.ts |
| V18 | **A node's realised pieces match its content row in the key** (§8.0 PIECES: every MUST present, no NEVER). Added 5:24 PM (Matt) | LABELS.md §0, §1, §2 |
| V19 | **A stage whose trend is up never loses height late.** A descent (D) in the last third must be followed, before E, by nodes that leave him HIGHER than where the descent began, and a D is never the last content node before S or E. So in 1-1's graph C (`... R D_ S E`), the S after D_ must rise net above D's start: #10, #44 a or #45, never #44 b, which falls to its long log. Added 6:48 PM (supervisor, round 5) | 1-1.md:23 ("up in the high branches... pointed north"), :47-52; §4 (`trend` biases the shapes) |
| V20 | **A node's type that needs a move comes only after that move's T** (a bounce-type node only after `Tb`). The deal never deals a type before its move is taught. Added 9:33 PM (the planner's dry-cell list) | V3; the teach order |
| V21 | **Hearts follow risk:** a heart is laid only after a spot where a miss or a creature costs something, never on a stretch without one. 1-1 has no damage, so it gets 0 hearts. Added 8:34 AM (the lead, from Matt's 12:15 AM rule) | MATT 11-05 12:15 AM ("a heart only after real risk"); ENGINE-PLAN §7 |
| V16 | `&` only from the stage where creatures are taught (W1: 1-3), and about a third of the stage's time has none | Matt 12:15 AM (ENGINE-PLAN :55) |

### 8.4 The sprint graphs in code, and under 1-1's brief

A graph is jobs and shapes only; the deal fills in the content (§7.5).

| Graph | Code | Under 1-1's brief (teaches jump, double, bounce; ends quiet; trend up) |
|---|---|---|
| A | `A T P F R X R S E` | `A T T T P F R X R S E` |
| B | `A T M F R C U X R S R L E` | `A T T T M F R C U X R S E` (quiet: `R L` goes; the F added 5:22 PM for V17) |
| C | `A P F X R W R D_ S E` | `A T T T P F X R W R D_ S E` (the brief forces the teaches in) |
| D | `A T P R U F X R S E` | `A T T T P R U F X R S E` |

- Under 1-1's brief, the T slot becomes three teaches: jump, double, bounce.
- The three teaches read `Tg1 Tg2 Tb`: the jump and the double both on the ground (the double on #8's safe dip), then the bounce. V11's teach exception allows two ground teaches side by side.

### 8.5 Three example 1-1 rolls

1-1's deal is ground 40, floating 25, climb 20, bounce 15, give or take 1, under the caps.

**Roll 1 (graph A):** `A Tg1< Tg2< Tb> Pc1^> F[Pc2^+|Pb]< R Xf2> R Sf2> E`
- Types: ground 2, bounce 2 (counting the fork's low road), climb 1, floating 1.
- It splits early, with a mushroom on the low road and the find up a stair. Floating comes only at the test.
- The set piece is the double chain on floating logs, then the walk-on to the long log (#15 or #23, V5).

**Roll 2 (graph B):** `A Tg1> Tg2< Tb< Mg2> F[Pb2^+|Pc1^]< R Cb2< Uc^> Xf2> R Sf2< E`
- Types: ground 3, climb 2 (counting the fork's low road), bounce 2, floating 1.
- Its flow is a hurry run of doubles, and it splits straight out of the flow.
- The combine is bounce into double, then the climb.

**Roll 3 (graph D):** `A Tg1< Tg2> Tb> Pb2< R Uc^< F[Pc2^+|Pg1]> Xf2> R Sf2< E`
- Types: ground 3 (counting the fork's low road), bounce 2, climb 1, floating 1.
- It climbs, then splits, with the find on the upper stair.

All three pass V1-V21: the cap, the neighbour rule with its two exceptions, and the deal give or take 1. Their tempo strings differ (`<<>><>>`, `><<><<>><`, `<>><<>><`), so no tempo profile repeats (§5).

### 8.6 In the data
- A world's graph list (§4) is stored as code strings.
- A roll is saved as its filled string, next to the seed. The ledger (§5) compares strings: the same skeleton means the same graph, and the same marks mean the same tempo profile.
- One parser reads the strings and checks V1-V21, and fails with the rule and the token.
- **The planner owns the parser**, inside gen2 (the graphs are its data; the lead, 5:22 PM). Engine-core only reads the realised string from meta. Until the parser exists, these rules are the spec.


### 8.7 The block rule: a teach's check and a test can't be walked round (designer, 11-05 5:32 PM; engine-core 8cb80cf25's required-move gate)

**The finding (engine-core).** On today's mixed 1-1, a bot with NO double and NO bounce finishes all 8 runs. The safe floors and the
fork roads leave a way round, so nothing teaches or tests anything. The root is the data, not the gate (Law 22): no section says
where the way is BLOCKED.

**The physics (physics.ts on engine-core):**
- a single jump rises `JUMP_RISE` ≈ 108 px;
- a jump then a double rises `DOUBLE_RISE` ≈ 185 px;
- a mushroom bounce (bounceV 830) rises about 181 px above the cap and leaves one air jump (engine.ts:4885 `jumpsLeft = 1`), so bounce
  then jump reaches about 258 px above the cap;
- at full run, a single jump's airtime is about 0.63 of a jump-then-double's (0.63 s against 1.01 s from jumpV, doubleV and the two
  gravities), so a single jump crosses about **0.63** of the double's reach.

**The rule.**

| # | Rule |
|---|---|
| B1 | **Every T's safe check and every X holds a BLOCK:** a place where the way on needs the node's move. Nothing bypasses it: not the floor road, a catch bough, a fork road, a stone, a stump, a dressing piece. A miss still lands safe, but BEFORE the block (the floor road returns him to the start of the check), never past it. The floor road resumes after the block |
| B2 | **A double block** is one of: (a) a rise of **130-165 px** from the take-off top to the next landing top, with nothing standable between (over 108 + a 20 px margin, under 185 − 20); or (b) a gap of **0.74-0.86 of the double's reach** (past the single's 0.63 with margin; a teach takes the low end) whose pit leads BACK only: its steps climb to the near side, and its far wall stands at least 130 px over the pit floor |
| B3 | **A bounce block** is a lip **200-225 px above the floor at the mushroom** (over a double from the floor, 185 + 15). The bounce clears it from the cap with room to land. Standing on the perch stump (46-56 px) and doubling must not reach it: lip ≥ stump top + 185 + 15 |
| B4 | **A catch bough** sits at least 130 px under the NEXT landing, so it is never a stair past the block. It only returns him to the take-off |
| B5 | **A fork is never a T or an X.** Both roads finish by design (V7), so the low road is a way round. A section with two answers (#7's mushroom version, #28) is a `twist`, and the gate runs it with BOTH moves taken away (it must fail) and with each one alone (it must pass) |
| B6 | **The gate's model of "without the bounce" removes the mushroom, keeping its stump.** Today it makes the mushroom plain solid. A player can never stand on a mushroom (landing on one always bounces), so a solid cap is a step that doesn't exist in play. With a solid cap, a double off it (185) beats the bounce itself (181), and no bounce could ever be required. For engine-core (play.ts `without`) |

**Fixes in the data (W1-NEW-SECTIONS, for engine-core to enter in w1.ts):**

| Section | Way round now | Fix |
|---|---|---|
| #5 `w1-mushroom-lift` | "walking passes under" the log road; the mound's lip at about 160 px is within a double (185) | **The floor ENDS at the face of a bank whose lip is 200-225 px up (B3).** The mound version: bankW dy [-225, -200], exitDy about -210. The log-road version: the log road starts on that bank's top, and the floor doesn't run under it |
| #8 `w1-double-teach` | gaps at shares [0.6, 0.64], [0.66, 0.7], [0.7, 0.74]: the first two are about what a single jump crosses (0.63) | Shares **[0.74, 0.78], [0.78, 0.82], [0.80, 0.84]** (B2b). The pit's steps lead back only, and its far wall is ≥ 130 px over the pit floor |
| `w1-second-jump`, `w1-leap-stones` (harvest) | the [0.62, 0.66] gap is crossable by a single jump | Every `gDoubleGaps` share ≥ **0.74**. The leap-stones one-gap version becomes [0.74, 0.78] |
| #20 `w1-stump-towers` | each rise is 115-125 px, only 7-17 px over a single jump, with the floor road running under | Rise **[-150, -130]** per tower (B2a). The soft pits under them lead back only (B2b); the out floor's face stands ≥ 130 px over the pit floor |
| #27 `w1-stilt-logs` | each rise is 110-115 px, within a single jump's tolerance | Rise **[-150, -130]** per log (B2a), with the pits as #20 |
| #10, #22, #29 (canopy rungs, weave, bough stair) | catch boughs could stair past a rise | Each rise 130-165 px (B2a); each catch bough ≥ 130 px under the next landing (B4) |
| #21 `w1-bounce-double` | none, but the 'high' version [-360, -340] may be past bounce then jump from the cap (about 258 + cap height) | 'low' **[-290, -270]**, 'high' **[-320, -300]**: over a double from the stump top (about 56 + 185 = 241), under bounce then jump. The full bot proves it |
| #7, #28 (two answers) | each answer bypasses the other | Tag `twist` (B5); the gate runs both moves removed |

The numbers are mine, from physics.ts (JUDGMENT on the 15-20 px margins). The full bot and the move-less bot prove each version
on 16 layouts. **For the planner:** B1-B4 need one place rule, a "block" a section names, which the gate reads: either a rise or a
gap past the single jump, and a pit whose steps lead back only. B2b's shares assume `share` is the fraction of the double's TRUE
reach. If gen2's `share` is of a safe reach, please give me the mapping.

### 8.8 Rulings on engine-core's cadence and job tags (designer, 11-05 5:32 PM)

**Cadence (cadence.ts):** all three accepted, anchored to R1 L4 (the SMBF and Shovel Knight cadence: ramp, then cool). The values are
JUDGMENT, to re-check on 16 layouts once 1-1 builds on gen2.
- **No flat run:** 4 slots in a row whose ratings span ≤ 1, counted from slot 3 (the arrive and the first teaches sit low on purpose).
- **A peak cools by 2 within 2 slots.** V5's rest after every X, W and S does this by itself.
- **The hardest slot is never in the first third.** This matches V6, the set piece in the last third.

**Job tags (w1.ts JOBS), ruled:**

| Section | Proposed | Ruling |
|---|---|---|
| `w1-learn` | arrive, teach | **teach** only. Its soft gaps are ground ends, which an arrive can't have (§1: none in the first 1,300 px). The arrive is `w1-forest-edge` or `w1-meadow` |
| `w1-cache-stones` | practise, choice-reward | **practise.** A choice-reward is a fork's high road (§1). If the cache is off the line, it's `reward` |
| `w1-stone-zigzag`, `w1-log-road`, `w1-mound-log` | practise, fork | **practise.** `fork` only on a section whose high road holds a find socket (V7): #4, #14, #22. The floor road under a raised road counts toward the two-road floors as SHAPE, not as an F node |
| `w1-floor-dash` (#14) | fork, flow | fork, flow, **if** its high road carries the find socket (V7). Otherwise practise, flow |
| `w1-fallen-trunk` (#7) | test | the 'double' version is **test**; the 'mushroom' version is **twist** (B5) |
| `w1-two-answers` (#28) | combine, test | **twist** (B5). A combine is both moves on one beat; this is either move |
| `w1-seed-perch` | reward | **reward**, and H moves to NOW in the key (it's `required` on every 1-1 roll) |
| every other row | as proposed | **accepted** |

**One flag for Matt (LABELS §8):** in W3, W4, W7 and W9 a thin platform is DRAWN as a stone slab. Under the new floating rule it may
float, which puts a floating slab on screen, and rocks don't float. It needs his look at a still. It's not a 1-1 matter.

**§8.7 amended (designer, 11-05 5:44 PM; the porter's measures on engine-core, which replace my estimates):**
- **The reach:** reachJump(0) gives the double 313 px and a single 175 px, so a single is **0.56** of the double, not my 0.63 airtime
  estimate. gen2's `share` is a fraction of the margin's gap, not of the true reach: share 1.0 = 230 px on Normal (MARGIN 0.82)
  and 204 px on Easy (0.65).
- **B2b, gap block (Normal):** the gap is at least 175 + 20 = 195 px, so **share ≥ 0.85**. #8 is [0.85, 0.89], [0.89, 0.93],
  [0.91, 0.95]. Every harvest `gDoubleGaps` share that is meant to block is ≥ 0.85.
- **B2b on Easy:** a gap can't block (204 px at most, against 195 + margin). **On Easy every double block is a RISE (B2a), never a
  gap.** #8's Easy version raises the far bank 130-145 px over the take-off. The Easy margin stays as it is, because it's what keeps
  Easy fair (JUDGMENT).
- **B2a, rise block:** **130-145 px**, under gen2's clamp (riseLimit × 0.95 = 148 px at riseShare 0.8). #20 and #27 are
  [-145, -130]. After the clamp, a block rise must still be ≥ 130 px. If a stage's riseShare clamps it lower, that section can't be
  a T or an X on that stage, and the planner's block rule rejects it there.
- **B3, #5:** the porter's option (b). **The mushroom sits on the floor (no perch); the lip is [-220, -200].**
  - Without the bounce, a double from the floor reaches 185, which is short.
  - The bounce from the cap (about 30 + 181 = 211) plus its one air jump (about 288) clears it.
  - The bounce is the one new thing; the hop after it is a known move.
  - B3's stump clause applies only to perched mushrooms (#21: a double off the stump top reaches 56 + 185 = 241, under its
    [-290, -270]).
- **#10, #22, #29:** 4-5 rises with wider boughs, still 10 s or more and inside the 900 px corridor (the porter's entry). Accepted.
