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
| `creature` | patrol, stomp, timed, watcher, swarm (by behaviour) | 1-3 on |
| `hazard` | the world's taught hazards (ruling 3: they return in later worlds) | per world |
| `puzzle` | the hand-built rooms | W1 rooms; W2 more |
| `pressure` | chase, rising water, closing light | 1-5 (W1's chase, by story) |
| `fork` / risk-reward | a high/low split whose harder road holds a FIND | all |
| `secret` | an alcove off the line | all |
| `setpiece` | the stage's signature (unique in the game) | per stage |

### 7.3 World 1's MIX (real), and World 2's (DRAFT for Matt)

**World 1, shares of content nodes across the world:**

| Type | W1 share | Arc (0 until taught, a peak over 2-3 stages, then a floor) | Source |
|---|---|---|---|
| ground | 30 | 1-1 on; peak 1-1 to 1-3; floor 15 | MATT ("World 1 = jumping, climbing, learning"); ES M3 L2045 (a staple is about a third or more) |
| floating | 18 | 1-1 (late window) on; peak 1-4 to 1-6 | the float floor: floating + crumble ≤ 25.3% (old 1-1, LABELS §4). 18 + 7 = 25 |
| climb | 12 | stair 1-1; kapok 1-4; peak 1-4 to 1-6 | MATT ("climbing"); the ladder (1-4) |
| rope | 12 | shimmy 1-3, liana 1-6; peak 1-6 to 1-8 | the ladder (moveLadder.ts; main's taught-at) |
| bounce | 8 | 1-1; peak 1-1 to 1-2; floor 4 | main's 1-1 (mushroom on 16/16 layouts) |
| crumble | 7 | creaky 1-5; peak 1-5 to 1-7 | the ladder (creaky 1-5, C9) |
| creature | 6 | 1-3 on (combat); peak 1-3 to 1-5 | the ladder (punch 1-3); NODE-MIX §C (5) |
| puzzle | 4 | the W1 rooms only | the rooms rule (hand-built) |
| fork | 3 | all | NODE-MIX §C (forks and secrets 5, split with secret) |
| secret | 0 as content; it rides as a `reward` job on forks and rests | — | §1 choice-reward |
| pressure | 0 as content; 1-5's chase is a set piece by story | — | ES slot roles (the story overrides) |

- These shares are mine, set from the sources listed. No shipped game publishes a per-type mix (NODE-MIX §C gives examples only), so
  the split between types is **JUDGMENT, anchored to Matt's words and our measured floors**, and is measured over many seeds against
  this target (NODE-MIX §B.8).
- **1-1's own deal**, from 1-1's teaches and window: ground 40 (at the cap), floating 22 (last third only), climb 15, bounce 13,
  fork 10.

**World 2 (DRAFT for Matt to see; "lighter, more puzzles"):**

| Type | puzzle | water (drift logs, pads, stones) | rope (swing) | floating (incl. lifts) | ground | climb | crumble | creature | fork | bounce |
|---|---|---|---|---|---|---|---|---|---|---|
| W2 share | 18 | 22 | 10 | 14 | 10 | 8 | 5 | 5 | 4 | 4 |

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
  - ground: #1, #2, #7, #8, #24;
  - floating: #3, #10, #20, #27;
  - climb: #9, #12, #13, #25, #29;
  - bounce: #5, #6, #21;
  - fork: #4, #14, #22, #28;
  - structural: #11, #15, #16, #17, #18, #19, #23, #26, #30.

## 8. The node code (designer, 11-05 5:17 PM; Matt, via the lead: "our own compact notation", so every stage plan reads as a short string and variety shows at a glance)

### 8.1 One token per node

A token is written `JOB content move shape find tempo`, with no spaces. Only the JOB is always there.
- `Tg1^<` = teach, on the ground, the jump, rising, patience.
- `Xf2>` = test, on floating pieces, the double jump, flat, hurry.

**JOB: one capital letter (§1).**

| Letter | Job | Letter | Job | Letter | Job |
|---|---|---|---|---|---|
| A | arrive | T | teach | P | practise |
| X | test | C | combine | W | twist |
| R | rest (holds a Dot spot) | S | signature (set piece) | F | fork |
| U | climb (up) | D | descent (down) | M | flow (momentum run) |
| H | hidden alcove (reward) | K | chase (pressure) | Z | puzzle room |
| B | arena (battle) | Y | story beat | V | boss preview |
| G | change of pace | L | finale | E | exit (the arrival) |

- `cooldown-in-node` has no letter: every hard node cools at its end (§1).
- `choice-reward` is the `+` mark below.
- `ending-fork` is a pattern, `F[L^+|R_] E`, not a letter.

**content: one small letter (§7.2).** Only content jobs carry one. A, R, Y, L and E are structural and never do (§7.1).

| Letter | Type | Letter | Type | Letter | Type |
|---|---|---|---|---|---|
| g | ground jump run | f | floating pieces | w | water crossing |
| r | rope and vine | c | climb (stair) | b | bounce |
| k | crumble | e | creature | h | hazard |

- The puzzle, pressure, fork and setpiece types are written by their job letter alone (Z, K, F, S).
- After S, the letters say what the set piece uses. S is still its own type and never counts in the mix (§7.6).

**move: a digit.** 1 is the jump, 2 is the double, as the node needs it. Bounce is the `b` content. Run is the arrive's.

**shape (§2): flat is no mark.**

| Mark | Shape |
|---|---|
| `^` | rising |
| `_` | falling |
| `^^` | shaft (straight up) |
| `@` | loop-back |
| `*` | hub |
| `F[ \| ]` | two-road |

The height dial (§3) shares `^` and `_`: a node's height and its rising or falling shape say the same thing, so the code keeps one mark.

**find: `+`.** A find sits on this node: the golden seed or a keepsake, never petals (§1 `choice-reward`).

**tempo: `>` hurry, `<` patience.**
- Every content token carries one, because tempo is rolled and never a default (§3).
- On a fork, the mark after the bracket covers both roads.

**Not in the string, kept in the data:**
- the rating (1-10), which the cadence check reads (optional long form: `Xf2>:7`);
- density;
- the terrain family.
The string stays short enough to read on a phone.

### 8.2 A stage string

A stage string is the tokens in order, with spaces between them.

A fork is written `F[high road|low road]`:
- each road is its own run of tokens;
- the high road comes first;
- both roads end at the next token after the bracket (they rejoin);
- the fork counts as ONE `fork` content node, and its roads' tokens don't count again in the deal.

Example: `F[Pb2^+|Pg1]<` is a fork, patience on both roads.
- The high road practises a bounce into the double, rising, with the find.
- The low road practises the jump on the ground.

### 8.3 Validity rules

The engine rejects a string that breaks one of these rules and names the rule and token, for example "V5 at token 9".

| # | Rule | Source |
|---|---|---|
| V1 | Content letters only on content jobs. A, R, Y, L and E take none, and their shape is flat | §7.1 |
| V2 | **T is flat or rising, never inside a fork, and its move appears for the first time.** One T per move in the brief's `teaches`, in the teach order (run is A's) | §1; WORLD-RULEBOOK §4; CoachOverlay.tsx:10 |
| V3 | P, X, C, W, M, U and S use only moves already taught earlier in the string. X's move is required (the limited-bot gate) | §1 |
| V4 | W only after at least one X | §1 |
| V5 | **Right after X, W or S comes R**, or E when it is the stage's last node. The quiet arrival is flat with no hard input, which meets the rest rule | §1; WORLD-RULEBOOK §4 |
| V6 | Exactly one S, in the last third of the stage's time | §1; §4 |
| V7 | F has two roads that both finish and rejoin. The high road carries `+`. No T inside | §1 fork, choice-reward |
| V8 | U is `c` and rising. `^^` only in a stage that owns the shaft (W1: 1-4) | §1 climb |
| V9 | D is falling (`_`) | §1 descent |
| V10 | Shapes the stage may use. 1-1 NOW: flat, `^`, `_` and the fork. `^^`, `@` and `*` are LATER | §6 |
| V11 | **No type over 40%** of the stage's content tokens (S and the structural letters don't count). **No type on two neighbouring content tokens.** Structural tokens between them don't separate them. The one exception is a P right after its own T | §7.4 |
| V12 | Windows. In 1-1, `f` only in the last third (window [0.67, 1]) | §7.3; W1-NEW-SECTIONS |
| V13 | Slot jobs: K never in a world's first stage; V only at X-9; G at X-6 (a world's story moves these) | §1; supervisor's notes in §6 |
| V14 | **The type counts match the stage's deal, give or take 1** (the seed's jitter). F slots take `fork`, and no other slot does | §7.5 |
| V15 | `ending-fork` `F[L^+\|R_] E` is the last node before E. LATER, not 1-1 | §1 (Matt, 11-05) |

### 8.4 The sprint graphs in code, and under 1-1's brief

A graph is jobs and shapes only; the deal fills in the content (§7.5).

| Graph | Code | Under 1-1's brief (teaches jump, double, bounce; ends quiet; trend up) |
|---|---|---|
| A | `A T P F R X R S E` | `A T T T P F R X R S E` |
| B | `A T M R C U X R S R L E` | `A T T T M R C U X R S E` (quiet: `R L` goes) |
| C | `A P F X R W R D_ S E` | `A T T T P F X R W R D_ S E` (the brief forces the teaches in) |
| D | `A T P R U F X R S E` | `A T T T P R U F X R S E` |

- Under 1-1's brief, the T slot becomes three teaches: jump, double, bounce.
- V11 then forces the double onto a different type from the jump. The double is taught on the stair (`Tc2^`), so the three teaches read `Tg1 Tc2^ Tb`.

Variety at a glance: the four skeletons differ in where the fork, the climb, the flow and the twist sit, and in how many rests there are.

### 8.5 Three example 1-1 rolls

1-1's deal is ground 40, floating 22, climb 15, bounce 13, fork 10, over its content slots, give or take 1, under the caps.

**Roll 1 (graph A):** `A Tg1< Tc2^< Tb> Pg2> F[Pb2^+|Pg1]< R Xf2> R Sf2> E`
- Types: ground 2, climb 1, bounce 1, fork 1, floating 1.
- Floating comes only at the test, in the last third. The set piece is the double chain on floating logs.

**Roll 2 (graph B):** `A Tg1> Tc2^< Tb< Mg2> R Cb2< Uc^> Xf2> R Sf2< E`
- Types: ground 2, climb 2, bounce 2, floating 1. This graph has no fork slot, so fork deals 0 (V14).
- The combine is bounce then double (the stage's pair). The flow is a hurry run of doubles.

**Roll 3 (graph D):** `A Tg1< Tc2^> Tb> Pg2< R Uc^< F[Pb2^+|Pg1]> Xf2> R Sf2< E`
- Types: ground 2, climb 2, bounce 1, fork 1, floating 1.
- It climbs before it splits, then ends on a floating test and the double chain.

Reading the three together on a phone:
- Roll 1 splits early.
- Roll 2 runs a flow and has no split.
- Roll 3 climbs, then splits.
- Their tempo strings differ (`<<>><>>`, `><<><>><`, `<>><<>><`), and no tempo profile repeats (§5).

### 8.6 In the data
- A world's graph list (§4) is stored as code strings.
- A roll is saved as its filled string, next to the seed. The ledger (§5) compares strings: the same skeleton means the same graph, and the same tempo marks mean the same tempo profile.
- One parser reads the strings and checks V1-V15, and fails with the rule and the token.
- The engine-core porter builds the parser. Until then, these rules are the spec.
