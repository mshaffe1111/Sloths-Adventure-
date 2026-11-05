# The engine designer's options (2026-11-04 evening)

Written by the engine designer helper on branch `engine-design`. The brief: dream, don't trim; three engine approaches that differ in
kind, plus a wild card; a spec for each; the research lines each rests on; a favourite.

Files opened: everything in `reference/research/README.md`'s list except `PLAN-TO-80.md` and `CONTINUOUS-IMPROVEMENT.md` (barred by
the brief); the six ledgers (not section 4 of LEDGER-ENGINE-PAPERS); `reference/STAGE-RULES.md`; `src/game/physics.ts`;
`beatTrace.ts` and `w1Rhythm.ts` with `git show origin/w1-rhythm:`; `src/game/gen2/` (DESIGN.md, types.ts, variety.ts);
`tools/validate/` (core.ts, mechanics.ts, look.ts, variety.ts). I did not open `reference/engine/LEAD-SKETCH.md`, `STATUS.md`,
`CONTINUOUS-IMPROVEMENT.md` or `PLAN-TO-80.md`. Line references look like `file:line`. The short names: MR = 
`reference/research/MATT-RESEARCH-2026-11-04-full.txt`, GV = `reference/research/GEMINI-VARIETY-2026-11-02-full.txt`, GE =
`reference/research/engine-2026-11-04/GEMINI-ENGINE-ARCHITECTURE.txt`, GC = `.../GEMINI-CRITICAL-AGENTS.txt`, CA =
`.../CARMO-thesis-2024.txt`, TA = `.../TANAGRA-paper.txt`, GP = `reference/GEMINI-PCG-RESEARCH.md`, SR = `reference/STAGE-RULES.md`,
LEG = `reference/research/ledger/LEDGER-ENGINE-GEMINI.md`, LEP = `.../LEDGER-ENGINE-PAPERS.md`, BT = `beatTrace.ts` (w1-rhythm),
WR = `w1Rhythm.ts` (w1-rhythm).

---

## 0. What I checked in our code first (facts the designs lean on)

- **Pokey's body.** Run 285 px/s, jump 640 px/s up, double 540, gravity 1900 up / 2500 down (physics.ts:8-29). Single jump rise
  about 108 px, double about 185 (physics.ts:133-135). Measured reach on the flat: 174.7 px single, 313.2 px double (LEG:24). Coyote
  133 ms Normal / 167 ms Easy, buffer 133 / 200 ms (physics.ts:40-43).
- **The beat tracer already builds by construction, but only jumps.** A node is a BPM plus bars of 8 eighth-note slots; each take-off
  has a move (hop / jump / double), a height and a surface (bank / branch / stump / crumble). It places surfaces under Pokey's
  simulated feet, widens them for a clumsy thumb (100 ms early or late, 85% air speed), checks the landing is on screen upright and
  sideways, and throws when a pattern can't be danced (BT:1-40, BT:44-70, BT:150-172). No vines, ropes, mushrooms, wind or animals
  are traced. Two copies exist on two branches (LEG:16-17, 417-419).
- **The W1 builder finds steps by random retries.** `fitSteps` draws up to 160 random step lists until one traces (WR:149). The 70/15/15
  petal rule is a constant laid on afterwards (WR:367 `PETAL_ROAD = 15 / 70`).
- **gen2 is roll-and-curate.** Hand-drawn sections in their own pixel space, sockets filled by the roll, a check-and-repair loop, then
  hundreds of rolls scored and the best 16 kept (gen2/DESIGN.md part A). It only runs right (LEG:117). It has a shuffle bag and
  cooldowns (gen2/variety.ts:1-14), and gen2's worlds still felt alike (LEG:420-421).
- **The checker reads moves as letters** with J (real fall) / j (safe hop) / U (double) / h already split (tools/validate/core.ts:22-60),
  but no letter carries a direction, and similarity is the cosine of 3-letter counts (core.ts:221-237) plus a look grid (look.ts).
- **Music tempos are the music's, per world:** W1 126-134, W2 94-102, W3 66-74 (6/8), W4 84-92, W5 100-108, W6 86-94, W7 64-72,
  W8 84-92 (6/8), W9 112-120, W10 78-84 (LEG:203-207, from src/audio/styles.ts). Music changes per session except on beat stages
  (LEG:415).

## 1. Ten platformers, studied for this (web research, 2026-11-04)

Eight of the ten are named nowhere in our research files (checked with grep): Super Meat Boy Forever, BIT.TRIP RUNNER, Badland, Tiny
Wings, Jetpack Joyride, Pizza Tower, New Super Mario Bros. (Geometry Dash appears only as a Reddit link in GV's works cited, GV:181 #30,
never discussed). Two are in our files, studied again for what the files miss: Spelunky and Rayman Legends. Three were picked because
critics called them repetitive: Super Meat Boy Forever, New Super Mario Bros., Jetpack Joyride.

**Limit, named plainly:** the research helper could search the web but not open pages in this session, so every fact below comes from
the search results quoting those pages. Where sources disagree or nothing primary was found it says "unconfirmed".

| Game | What was data | What was code | What we steal |
|---|---|---|---|
| **Super Meat Boy Forever** (Team Meat, 2020; criticised) | Hand-made, hand-tested chunks with a difficulty tier; hand-made bosses. Pool size unconfirmed (sources say 40-60, 100, "7,200" chunks) | Picks chunks per stage, orders them by tier, smooths the joins "so levels keep a certain cadence"; a new seed per save | Reviews: "procedural generation doesn't add much" (GamingTrend), it "robs the game of something" (Nintendo Life), the hand-made stages and bosses were the best part. My read: every chunk is a short self-contained test, so no level builds to a landmark. **Steal the warning: every stage needs one hand-made signature moment; generated parts link moments, they never are the stage.** And the difficulty tag on every chunk. |
| **BIT.TRIP RUNNER** (Gaijin, 2010) | Every obstacle placed "exactly as the rhythm of the song dictates"; each action adds a sound to the track | Constant run speed, so distance is song time; no generator | Players remember patterns as music, not as geometry. **Steal: every move the player makes on the beat makes a note, so a clean run sounds like a phrase.** Neuse cut the complicated moves after watching testers. |
| **Geometry Dash** (RobTop, 2013, phone) | Official levels hand-placed in the public editor; beat guideline markers on the song timeline; triggers fire visual events at positions | Fixed speed per mode, so x maps to song time; portals switch the movement mode | A tiny object set feels distinct because each level "performs" its song and switches mode several times. **Steal: mode switches mid-stage (glide, climb, swing, carry) as variety carried by one art set; a beat-guide layer for where big moments land.** |
| **Badland** (Frogmind, 2013, phone) | Every stage hand-built in their own iPad editor, "design a stage, tap a button and test it" | Physics props (chains, saws, clone/shrink power-ups) make the moment-to-moment variety | **Steal: one-tap test from the editor on a phone; physics props that behave a little differently each try.** No generated levels found (unconfirmed). |
| **Tiny Wings** (Illiger, 2011, phone) | The island order and each island's difficulty | Hills generated from smooth curves, a new layout every day (algorithm unconfirmed; a tutorial reconstruction uses cosine curves between random key points) | Randomness inside a hand-tuned feel: players "can't memorize a pattern", the rhythm stays "zen-like". **Steal: generate inside tuned ranges per island; a date seed for a daily variant.** |
| **Jetpack Joyride** (Halfbrick, 2011, phone; criticised as thin) | Obstacle and coin patterns (format unconfirmed; the GDC 2012 talk could not be read) | Random assembly; vehicles; 3 missions at a time | "Only three obstacles", lasers "very predictable". The variety lives in missions and vehicles, which change what you try and how you move on the same course. **Steal: a temporary vehicle or carried thing that changes movement for one section; small missions for replays.** |
| **Pizza Tower** (2023) | Every level hand-made, then played twice: in, and the timed "Pizza Time" escape back, with paths opened and closed | Timer, escape music | One layout, two runs: the escape doubles the use of each piece and is the most praised part. Criticised: "every level climaxes with an escape". **Steal: a return trip through the same place in a changed state (water up, branches broken, dusk), but not in every stage.** |
| **New Super Mario Bros.** (2006-2012; criticised) | Hand-made levels on a fixed set of themes and shared tilesets | — | "Most of the assets and songs seem reused" (Game Informer), "practically indistinguishable" (Nintendojo). Causes: the same theme order every game, one shared song hook, recycled art, few new ideas per level. **Steal the warning: each stage needs its own idea, not only its world's theme; no two stages of a world share the main mechanic plus set piece.** |
| **Spelunky** (Yu, 2008/2012; in our files) | Room templates of 10x8 tiles as 80-character strings, with probabilistic tiles ("2" = 50% solid) and obstacle-block codes filled from a small library of hazard patterns | A 4x4 grid; a walker carves the solution path (1-2 left, 3-4 right, 5 down) and stamps room types by exits (Kazemi's tutorials) | Kazemi shows that fixing the obstacle blocks visibly kills variety: **the small hazard library inside the templates is where much of the variety comes from**, and growing it raises the variety of every template at once. Our files cover the grid (GP:49, GE:11) but not this. |
| **Rayman Legends** (Ubisoft Montpellier, 2013; in our files) | Hand-built music levels, enemies leaping in on the beat; "8-bit" remixes reuse the layout with filters | A dedicated music-sync system (Pavageau); Murfy touch levels | Music levels are its best levels. The 8-bit remix re-dresses a finished layout as a harder variant. Murfy on Vita: "your finger is always in the way". **Steal: the remix as cheap extra content; touch actions big and few, never under the hazard.** |

Sources (from the helper's report): destructoid.com (SMBF preview), gamingbolt.com (Refenes interview), gamingtrend.com, gameinformer.com,
nintendolife.com (SMBF reviews); nintendoworldreport.com/review/23135, gamedeveloper.com "Road to the IGF" (Neuse), ludusnovus.net "One
Measure of Bit.Trip Runner"; robtopgames.com/files/GDEditor.pdf, geometrydash.wiki.gg Level_Editor; en.wikipedia.org Badland,
mobilesyrup.com 2015 Frogmind interview, toucharcade.com 2013; toucharcade.com 2011 Tiny Wings review, kodeco.com Tiny Wings tutorial,
gamestar.de Illiger interview; gdcvault.com/play/1015316, stevivor.com Jetpack review; pcgamer.com Pizza Tower review,
loadlastsave.substack.com; gameinformer.com NSMB2 review, worthplaying.com, shacknews.com, nintendojo.com; tinysubversions.com
spelunkyGen and spelunkyGen2 (Kazemi), Game Maker's Toolkit "How and Why Spelunky Makes its Own Levels"; designingsound.org (Dumas
interview), gamereactor.eu, pocketgamer.com, engadget.com 2014 (Vita Murfy). Full notes: the helper's scratch file, not committed.

**What the ten say together:** the games that feel hand-made at scale make a small hand-made thing (a room, a hazard block, a song)
and multiply it with a guaranteed path (Spelunky), a beat (RUNNER, Geometry Dash, Rayman) or a second use of the same place (Pizza
Tower, Rayman remixes). The ones called repetitive either generated everything with no landmark (SMBF) or reused the same themes and
ideas (NSMB). Phone games add one more: control is simple, so variety has to come from what the world does, not from new buttons.

---

## 2. The problem, as an outsider would put it (5 lines)

1. A small team with an AI builder needs 85 more stages of a phone platformer, and each stage now costs most of a day and about 2% of a weekly AI budget.
2. Stages are either hand-written in code, one at a time, or rolled by the hundred and filtered, and both leak bugs a player sees (floating branches, unreachable petals, hidden routes).
3. Players rate it 55/100 because stages and worlds feel the same: the same few moves, the same direction, the same look, in a different order.
4. The fix has to make a stage right the first time from a short description, in about an hour, with its checks agreeing with how it was built.
5. And it has to make each stage remembered for something, because passing every check has not made any stage memorable.

---

## 3. The options in one table

| | Who decides the layout | When the rules act | The unit reused | Where a new world's variety comes from |
|---|---|---|---|---|
| **A. Phrase solver** | **Search**: a solver picks and places move phrases to meet the stage's spec | **During** building: every placement must satisfy the rules before the next is tried | **A phrase**: 1-4 beats of moves with what's under, beside and against Pokey (e.g. "snap twig into a vine catch over water") | **The world's grammar**: its own phrase list, its meter (the music's beat feel), its hazards that act on the beat |
| **B. Proven rooms** | **Hand (template)**: a designer writes rooms; a stage spec picks 7-9 of them | **Before** building: each room is proven alone over every tempo, setting and mirror once, when it is written; a stage only joins proven rooms by typed doors | **A room**: 8-20 s of play the size of one or two phone screens, stored as beat data plus slots, never as pixels | **New rooms**: each world authors its own 24+ rooms and hazard blocks, with a coverage table that says which are missing |
| **C. Grown canopy** | **Simulation**: trees, roots, water and animals grow and settle by their own rules; a ghost Pokey then plays it | **After** growth: the route is what the ghost found; checks and local repair act on the grown result | **An organism rule**: how a species grows (a kapok's buttresses and limbs, a strangler fig's lattice, a mangrove's stilt roots, a ruin's collapse) | **A new ecology**: each world's species, their growth rules and their states (flood, wind, night) |
| **D. Wild card: the one who went ahead** | **A character**: someone in the story crosses the stage just before Pokey with a different body, and what they do makes the stage | During that character's run (a deed is allowed only if Pokey has a move that answers it) | **A deed**: a cause and its effect (he cut the rope, so the bridge hangs; she laid silk, so the floor sticks) | **The cast ahead**: each world has a different someone ahead, with a different body and different tools |

No two rows share two cells: A and D both act during building, but differ in who decides, the unit and the variety source; B and C
share nothing.

---

## 4. Option A: the phrase solver

### How one stage gets made
1. **Spec** (20 lines, written by an AI helper or the lead): the stage's job, map shape, pair, the pinned signature phrase, the curve
   as places for the seven parts (never one fixed curve: LEG:442-444), what the neighbours already used.
2. **Shape pass**: the map shape (rise, loop-back, split, chimney, trail, hub) becomes 6-9 node boxes, each with a way in, a way out and
   a travel direction (MR:25-29, MR:40-44). A split's two roads get the same entry and exit point as hard constraints (GE:69).
3. **Solve pass**: for each node, a beam search (width 8) over the world's phrases. Each candidate phrase is traced on the stage's
   real beat by the one beat tracer (extended to vines, ropes, mushrooms, wind, animals). A candidate is kept only if every rule holds
   at that moment: reach for the clumsy thumb on that setting; on screen both ways; something holds every surface up; no 3-4 move run
   from this stage or the one before; density inside the part's band; the petals the part owes fit on its surfaces. The search keeps
   the best few by a score (variety against the neighbours, how close the measured tension is to the planned one). When a node can't
   be filled, the solver relaxes in a fixed order (widen a landing, swap a surface, drop a hazard) and writes down every relaxation.
4. **Pinned moment**: the stage's signature phrase is placed first, by hand if needed (Tanagra's pinned pieces, TA:113), and the solver
   fills around it.
5. **Dress pass**: every surface carries its art set from the phrase (a snap twig is always the twig art with the notched underside,
   GV:177); dressing draws from the world's sets with a cap per sprite.
6. **Prove**: the checker replays the solver's own route in the real engine; the builder's move string must equal the checker's move
   string, letter for letter, with direction. A mismatch is a bug in one of them, never "close enough".

### Sample stage spec (World 7, about 20 lines)
```
stage 7-4 "Falling Floors"            # name as approved in stagePlan.ts
job: X-4 wide gaps / change of direction
shape: chimney-down (right, down, left, down, right)
pair: crumble-tile + stone sentry, ON THE SAME BEAT     # the sentry's sweep lands as the tile drops
meter: from music (W7 64-72), feel "wait-and-go": whole notes, hits on 3
parts: intro n1 | ramp n2 | spike n4 | rest n5 (Pokey's line) | counter n6 (brown-vine climb) | climax n7-n8 | cool n9 (3 s)
pin: n7 "tile run under two sentry sweeps, last tile drops as you land on the lip"
phrases: W7 list + returning: W3 thorn-vine (slow climb), W5 silk (contact) as counter-melody
forbid: any 3-move run used by 7-3 or 7-5; liana chains (7-2 owns them)
easy: soft halls under every tile run; sentry sweeps 1.5x slower
petals: goal from the shared path only; split roads 15% each, inside their own phrases
miss: n2-n4 setback (soft hall); n6-n8 a life on Normal
moment: the floor of n8 drops in time with the music's last bar
length: skilled >= 2:15, first-timer 3-5 min
dot: none (World 7: Pokey's own lines)
```

### What makes World 7 feel unlike World 2
World 2's phrases are made of water and rope: pendulum vines over the river, reed drag, logs that move, a steady relaxed beat at
94-102. World 7's are made of stone that keeps time: tiles that fall on the bar, sentries whose sweep is a metronome, brown vines that
snap, at 64-72 with long waits. The solver can only use what is in each world's list (plus returning phrases that are changed and
paired with the new world's mechanic, SR:93-99), so a World 7 stage cannot be built from World 2's moves. Direction differs too: World 7
gets chimneys and descents; World 2 mostly runs across.

### The moment a player remembers
The pinned phrase: in 7-4, the last tile dropping exactly as Pokey lands on the lip, on the last beat of the bar, with the music's
hit. The solver's job is to build the two minutes that make that land.

### How today's failures become impossible
| Failure | Why it can't happen here |
|---|---|
| Petals 70/15/15 that the geometry couldn't hold | Petals are part of each phrase's surfaces, and a part's petal debt is a constraint during the search. A shape whose roads can't hold their share fails in the solve pass with "node n3 low road holds 9 of 15", before anything is built. |
| Branches floating in mid-air | Every surface type has a required holder (trunk, post pair, root, rope); "held" is a constraint checked when the surface is placed. A branch with nothing to hold it has no legal place. |
| One decoration sprite stamped on every piece | The dress pass has a cap (no sprite over 15% of the stage's dressed spots; no two neighbours with the same one) checked as it places. |
| A stage too like the one before because it had two move types | The spec must name 4+ move kinds, one the neighbour didn't use; the solver can't finish a node that repeats a neighbour's 3-move run. Chance can't make a repeat: the neighbour's strings are an input. |
| Easy never reaching the builder | Setting is an input of every trace (the tracer's `easy`); the solver runs once per setting, and a test fails if the Easy and Normal builds are the same, or if any Easy landing is narrower than Normal's. |
| Two copies of the same placement tool | There is one tracer module; every pass imports it. A gate test fails if a second file defines a function with the same job (a list of owned function names). |
| The checker treating hop/jump/double as one move, and ignoring direction | One move type is shared by builder and checker: move x direction (right, left, up, down) x what's under (floor, soft, water, void). The checker reads it from play; it must match the builder's. |
| A route that walked through solid ground and hid 20 s | The route is the real engine's run with collisions, not a link graph; the solver's planned route and the checker's replayed route are compared node by node, and any route through a wall is a mismatch. |

### Expected time and AI cost (guesses until measured)
Engine build: 5-7 days of helper time (the tracer grows vines/ropes/wind/animals, the shape pass, the beam search, the shared move
type), about 6-10% of a week once. Per stage after that: spec 15 min, solve and gates 20-30 min, look and fix 15-30 min: about
1 hour, about 0.3-0.5% of a week. Risk: when the solver can't meet a spec, debugging a search is the hardest thing for an AI helper
(GE:98, "Solver UNSAT errors can be opaque"); the relaxation log is the countermeasure.

---

## 5. Option B: proven rooms

### How one stage gets made
1. **Rooms come first, per world** (SR:150-165's "pieces first, curate once", made strict). A room is 8-20 s of play that fits one
   or two phone screens in both orientations. It is stored as beat data: bars, steps, surfaces, holders, slots for hazards (Spelunky's
   obstacle blocks), petal spots, its art set, its teaching flag, and two typed doors (height band LOW / MID / HIGH and direction,
   CA:673-683). Never pixels: the tracer re-traces it at the stage's BPM and setting, so the same room is never pixel-identical in two
   stages.
2. **Each room is proven alone, once, over its whole range**: every BPM in its world's music range, Easy and Normal, mirrored and not,
   every hazard block in its slots. Proof = the tracer, the checker in the real engine, both orientations' stills, its own petal count
   on its own surfaces. A room that fails anywhere in its range does not enter the library. Proving is a script, not a helper's
   afternoon.
3. **A coverage table per world** (CA:712-746, CA:787-789, LEP:93-94): every door pair x pacing tag x mechanic the world's stages will
   ask for. A hole is a room to write, never a reason to scrape by. Universal "fits anywhere" rooms are capped at 2 per world, because
   they lower variety (CA:831-833).
4. **A stage is a spec that names its rooms** (7-9 of them, one of them the stage's hero room, written by hand for this stage only).
   Joining is a door match plus a short seam the tracer builds (one beat of run). The spec is checked as arithmetic before any build:
   door types match, length adds to 2:00+ for the skilled clock, petals add to the goal on the shared path, no room used in more than
   3 stages of a world, no room in a neighbour stage, 4+ move kinds and one the neighbour lacks.
5. **Build = trace the rooms in order** at the stage's beat and setting, then the gates. Because every room was already proven in this
   range, the stage-level checks only test seams and totals. First-pass right is expected, not hoped.

### Sample stage spec (World 2, about 20 lines)
```
stage 2-4 "Over the Water"
job: X-4 wide gaps / vines
shape: trail across, one high/low split at r4-r5
meter: from music (W2 94-102), feel "swung": dotted half + quarter
rooms:
  r1 w2-bank-steps        (intro, teach: vine over dry bank)      doors LOW>LOW
  r2 w2-reed-wade-hop     (ramp; reeds slow you, hop out)         LOW>MID
  r3 w2-log-roll-pair     (spike; two moving logs on the beat)    MID>MID
  r4 w2-swing-high | r4b w2-raft-low   (split; same doors)        MID>MID
  r5 w2-heron-perch       (rest, Dot's line, checkpoint)          MID>MID
  r6 w1-snap-into-vine*   (counter: W1's snap twig, now over water, changed + paired) MID>HIGH
  r7 HERO 2-4-full-swing  (hand-made for 2-4 only: the full-arc swing over the middle of the river) HIGH>MID
  r8 w2-snapper-snouts    (climax: snapper snouts as 1 s platforms, MR:474)  MID>LOW
  r9 w2-shrine-run        (cool, 3 s)                             LOW>exit
hazard blocks: snapper-1, current-drift, reed-tangle (r2, r3, r8 slots)
easy: every room's Easy trace; r8's snouts hold 1.6 s
petals: goal = shared rooms only; r4 and r4b 15% each
length check: skilled 2:20 by sum of room clocks
```

### What makes World 7 feel unlike World 2
Different rooms, written for that world and drawn in its art: World 2's rooms are river, reeds, logs and ropes on a swung beat;
World 7's are tile halls, sentry corridors and brown-vine walls, on a slow one. Doors differ too: World 7's coverage table asks for
DOWN and UP doors that World 2 barely has. A World 2 room may come back in World 7 only changed and paired with World 7's mechanic
(SR:93-99), so it reads as an echo, not a repeat.

### The moment a player remembers
The hero room. Every stage has one, made by hand for that stage, and the stage is built to arrive at it (Super Meat Boy Forever's lesson:
chunks alone have no landmark). In 2-4 it is the full swing over the middle of the river with the far bank coming into view.

### How today's failures become impossible
| Failure | Why it can't happen here |
|---|---|
| Petals 70/15/15 that the geometry couldn't hold | Each room carries its own proven petal count on its own surfaces. The split is a sum of rooms, checked as arithmetic in the spec, so a shape that can't hold it fails in a second, before a build. |
| Branches floating | A room can't enter the library unless every surface has its holder in the room's own art (proven in its stills); seams are one beat of ground, which has nothing to float. |
| One decoration sprite on every piece | Dressing belongs to the room and its world's sets; the spec check counts sprite use across the stage's rooms (cap 15%, no neighbour pair the same). |
| A stage too like the one before (two move types) | The spec check reads each room's move kinds before building: 4+ kinds, one the neighbour lacks, no shared room with a neighbour. A repeat can't come by chance: there is no chance at the stage level, only named rooms. |
| Easy never reaching the builder | Every room is proven on Easy in the library; a room without an Easy trace has no entry. The build takes the setting as an input, and the gate compares the Easy and Normal builds. |
| Two copies of the placement tool | Rooms are data; one tracer instantiates them. There is nothing to copy. |
| Hop/jump/double as one move, no direction | A room's steps carry move and direction; the checker's letters come from the same type (as in A). |
| A route that walked through ground and hid 20 s | The room's proven route is its real-engine run; a stage's route is the rooms' routes joined at doors. Any difference between the summed room clocks and the stage's measured clock above 5% fails the gate and names the room. |

### Expected time and AI cost (guesses until measured)
Engine build: 3-4 days (room format, the tracer extended to the room's moves, the proving script, the coverage table, the spec
checker), about 4-6% of a week once. Per world: 24-30 rooms at about 20-30 min each including the proving run, plus hazard blocks:
about 10-15 hours, about 2-3% of a week (most of it is the real design work, and it is shared by 9 stages and every replay). Per stage:
spec 15 min, hero room 30-45 min, build and gates 15 min: about 1-1.25 hours, about 0.3-0.4% of a week. Risk: rooms can be memorised
(Rogue Legacy, GE:19); the re-trace at each stage's beat, mirrors, hazard blocks and the 3-stage cap are the answer, and the in-order
QA recording is the judge.

---

## 6. Option C: the grown canopy

### How one stage gets made
1. **Seed**: the spec places a few "founders" (a kapok at x, a fallen giant, a stream) and the world's ecology.
2. **Grow**: each species grows by its own rule for N simulated years: a kapok throws buttress roots and limbs at heights its
   species allows; a strangler fig wraps a trunk and makes a lattice; lianas hang only between two holds whose distance allows a
   swing; a limb under weight sags; old limbs rot into crumbles; water fills the low ground to the season's level. Growth uses Pokey's
   body as a budget: a limb can't grow where it would make a gap no move can cross (a soft constraint the growth leans away from).
3. **Play**: a ghost Pokey (the clumsy thumb, both settings) plays the grown place from start to goal with a move planner, on the
   music's beat where it can. Its route is the stage.
4. **Cut and fix after**: the checks run on the grown result. Small fixes are biological (a limb grows 30 px longer, a liana drops
   lower, a root rises as a step), never a placed plank. Large failures regrow the node from a new seed.
5. **States**: the same grown place is replayed in another state for the return trip or a later stage (flood up, night, wind), Pizza
   Tower's one-place-two-runs.

### Sample stage spec (World 6, about 20 lines)
```
stage 6-3 "Root to Root"
ecology: mangrove (red mangrove stilt roots, buttonwood, strangler fig, tide pools)
founders: buttonwood @ 600; fig-wrapped dead tree @ 2400; channel 3100-3900; old giant @ 4600
years: 40 (more lattice, fewer gaps); tide: mid; season: wet
seesaw: roots tip under weight (6-3's mechanic): species rule "arching root, pivot at the bend"
route: right, then up the fig lattice, then down the giant's roots to the channel, right to the shrine
pin: the seesaw root that tips you onto the fig as the tide surges (bar 3 of the climax)
animals: caiman in deep pools only; herons on dead limbs (roles from the ecology)
easy: tide low (every fall lands in mud), roots tip slower
music: from W6 (86-94)
petals: on the ghost's shared route; the lattice's two ways 15% each
length: grow until the ghost's skilled clock >= 2:15
```

### What makes World 7 feel unlike World 2
They are different places grown by different rules: World 2 is a river bank (willow-like trees, reeds, floating logs, a current that
moves things); World 7 is a ruin being eaten by a forest (stone that falls by a collapse rule, roots that split blocks, vines on
walls). Even the same move (a swing) happens in different shapes because the holds grew differently.

### The moment a player remembers
Places, not patterns: "the giant fig you climb inside", "the old kapok you saw from the floor in 1-1 and stand on top of in 1-4". Growth
makes landmarks the player can see from far away, and the next stage of the world can grow from the same founders.

### How today's failures become impossible
| Failure | Why it can't happen here |
|---|---|
| Petals that the geometry couldn't hold | Petals go on the ghost's route after it is found, so the split's roads exist before any share is set; a road too short for its share gets a smaller share, never petals in the air. |
| Branches floating | Nothing is placed: every limb grows out of a trunk, every root out of the ground. A floating branch can't be grown. |
| One sprite on every piece | Every organism has an age and size; the art comes from its species and age, so no two limbs are the same piece at the same size. |
| Too like the stage before | Different founders and years give different places; the spec check compares the ghost's move string with the neighbour's before accepting. |
| Easy never reaching the builder | Easy is a state of the place (low tide, slower tipping) applied in growth, and the ghost plays both. |
| Two copies of a placement tool | There is no placement tool; there is growth and one ghost. |
| Hop/jump/double as one, no direction | The ghost's planner chooses typed moves with direction; the checker reads the ghost's own route. |
| A route through solid ground | The ghost is the real engine with collisions. |

### Expected time and AI cost (guesses until measured)
Engine build: 7-10 days (growth sim, the ghost planner, biological repairs), about 10-14% of a week once. Per world: a new ecology,
1-2 days (growth rules and art by species and age), about 3-5% of a week. Per stage: spec 10 min, grow and play 10-20 min, look and fix
30-60 min (control is the weak point: growth is hard to steer to an exact curve). Risk: least control over pacing of the four, and
the ghost planner is a hard program.

---

## 7. Option D (wild card): the one who went ahead

Neither the research nor the games I studied build a level this way. The idea: in nearly every world of our story someone crosses the
ground just before Pokey (the soldiers marching Meeca north, the Tarantula Queen's servants, a capuchin thief, the stone sentries'
keeper, the Night Hunters). Simulate that someone first, with **their** body, and let what they do make Pokey's stage.

### How one stage gets made
1. **The base**: a plain traced trail for the one ahead, with their body's numbers (a soldier can't jump but carries planks and ladders;
   a capuchin jumps 1.6x Pokey's reach; a spider abseils).
2. **Their run**: a planner walks them from start to goal and, on the music's bars, picks **deeds** from their list: a soldier lays a
   plank over a gap and later kicks it away behind him; the capuchin snaps a branch as he leaps off it; the servants lay silk across a
   bridge; the soldiers pull a ladder up after them. A deed is allowed only if Pokey has a taught move that answers its effect there
   (the rule acts during their run, deed by deed).
3. **Pokey's stage = the aftermath plus the gap between two bodies.** Where the capuchin jumped further than Pokey can, there must be a
   Pokey way (a vine, a lower road): that is where the stage's puzzles come from. Where the soldier needed a plank, Pokey can use the
   plank, or finds it kicked away.
4. **The one ahead stays on screen as the pacer.** The player sees the thief snap the branch two beats ahead, and the soldier pull up
   the ladder: every hazard is told before it bites (SR §1 "teaching"), and the one ahead waiting at a rest is the rest.
5. Checks as in A and B (the real engine; Pokey's route must match the planner's).

### Sample stage spec (World 5, about 20 lines)
```
stage 5-4 "Silk Bridges"
ahead: two orchid servants (new, needs Matt's approval: who they are and what they say)
their body: walk 0.8x Pokey, no jump, abseil 400 px, lay silk 1 bridge / 2 bars
deeds: lay-silk-bridge (effect: sticky surface, answer: buffered hop), cut-old-thread (effect: a bridge drops, answer: vine),
       wake-spider (effect: a curtain of 3 spiders, MR:469-472, answer: weave on the beat), wait-and-gossip (a rest)
first of each deed: shown with nothing at stake (they lay silk on solid ground first)
map: they abseil twice, so the stage goes across, down, across, down, across
pin: they cut the bridge you are on; you leap to the vine as it falls (bar 2 of the climax)
music: W5 (100-108), feel staccato; deeds land on beat 1, Pokey's answers on 3
easy: deeds every 4 bars, silk holds 1.5 s
petals: on their trail (they drop petals as they walk: why the petals are there)
length: their run lasts 2:30; Pokey's skilled clock >= 2:15
```

### What makes World 7 feel unlike World 2
Who is ahead and what they can do: in World 2 the river villagers' laundry and rafts (ropes strung across, logs set adrift); in World 7
the keeper of the ruins resetting old machines (tiles that drop on his bell, sentries he winds up). Different bodies make different gaps,
so different puzzles, without anyone authoring the puzzles.

### The moment a player remembers
Seeing it happen: the thief snapping the branch you are about to land on, on the beat, and the vine you catch instead. The story walks
in front of you.

### Today's failures
Petals: dropped along the one ahead's real trail, which exists before petals do. Floating: their deeds act on things already held
(a plank lies on two banks or is gone). One sprite: each deed has its own art and state frames. Too like the stage before: the cast,
body and deed list change per stage. Easy: a deed's numbers per setting are inputs to the planner. One tool: the tracer is shared.
Moves and direction, hidden routes: as in A.

### Expected time and AI cost (guesses until measured)
Engine build: 6-9 days (a second body in the tracer, the deed planner, on-screen pacing), about 8-12% of a week once. Per world: a
cast, a body and 8-12 deeds with art and story lines, about 3-4%. Per stage: about 1 hour, 0.3-0.5%. Risk: it needs story approval
from Matt for every cast, and it fits worlds with someone ahead; not every stage has one (World 7's "Alone" is the hardest fit).

---

## 8. Pieces that do two or three jobs at once (for whichever option)

Each one is movement, danger and pacing in one thing, so a stage needs fewer pieces to fill two minutes:
- **The metronome hazard**: a stone sentry's sweep, a tide, a swinging log that keeps the beat. It is the danger, it sets the tempo,
  and its quiet half is the rest (GE:79's "counterpoint", LEG:127-130).
- **The snapper snout**: a danger that becomes a 1 s platform at the top of its snap (MR:474).
- **The false vine snake**: punch it and it becomes the vine you swing on (MR:454, MR:729-732): fight and traversal in one beat.
- **The rising thing that is also the clock**: the tide in 6-8, the floor that falls behind you; it pushes the pace and is the
  stage's length.
- **The silk curtain**: a mistake becomes a 5-second set piece (MR:469-472, MR:489).
- **The return trip**: the same place in a changed state is a second node for free (Pizza Tower; Rayman remixes).
- **The one ahead** (option D): tells, paces and makes the hazards.

---

## 9. What each option rests on (research lines)

**A. Phrase solver**
- Build by construction with a solver over beats: TA:113 (beats as "the glue", the pattern library, Choco "ensuring that the generator
  will never produce an unplayable level"); GE:27 (Tanagra relaxes or backtracks instead of discarding); GE:67-69 (beat-timeline CSP,
  split closure); LEP:33-41, LEP:106-108 (search instead of random retries; WR:149 draws 160 random tries today).
- Rhythm first, geometry under the ghost's feet: MR:49-60, MR:597; GE:25 (Launchpad); GV:61.
- Map shapes as their own pass: MR:21-29, MR:595, MR:601; LEG:116-121.
- Variety at three scales, not move-letter noise: GE:3; LEG:44-51.
- Anti-repeat against neighbours: MR:516-518, MR:583-585; GE:217-225.
- Blame logs and local repair: GE:476-489; LEG:131-146.
- Super-additive difficulty, so hazards are placed with the jump, not after: GE:29, GE:203.
- Carmo as the warning against roll-and-filter: CA:1189-1196, LEP:33-36.

**B. Proven rooms**
- Templates with typed exits and probabilistic content: GP:49 (Spelunky), GP:50 (Dead Cells concept graphs), GP:219 (35-50 chunks per
  world), GP:242-255 (room counts, mirroring, connector height buckets), GE:11-13; and the web: Kazemi's obstacle blocks.
- Sockets multiply a room: GP:63 (4 sockets x 3 = 81).
- Edge labels, coverage table, cap on universal connectors: CA:673-683, CA:712-746, CA:787-789, CA:831-833; LEP:93-97.
- Pieces first, curate once; the variety bar is more pieces: SR:150-165, SR:72-99 (§0c.4 12+ templates, §0c.7 world owns its pieces).
- Puzzle rooms as their own blueprints: MR:46-48, MR:62-71.
- Authoring cost and memorisation, the risks to watch: GE:17 (Celeste's cost), GE:19 (Rogue Legacy memorised rooms).
- Hand-made landmark per stage: the web (SMBF reviews, NSMB reviews); GV:69 (the Ten), GV:65-69 (four cells).

**C. Grown canopy**
- Environmental cohesion, platforms that belong to the biome: GP:40-42.
- Nothing floats, supports painted on: SR:592-599.
- Sloth biology and the world's living rules: MR:368-375, MR:640-659.
- Simulated ghost play as the proof: MR:55-59, MR:88-92.
- Tiny Wings (web): randomness inside tuned ranges.
- WFC's failure as the reason not to grow by tile adjacency: GE:31, CA:1189-1196.

**D. The one who went ahead**
- Hazards from the line the ghost avoided: MR:59 (the nearest research idea, with one body instead of two).
- Diegetic tells and soldier logic: MR:414-415, MR:408-417.
- Enemies as ecological reactions, one rule, a clear tell: MR:437-441.
- Cause and effect, kept local so states don't explode: MR:398-401, GE:537.
- Every hazard reads before it bites: SR:109 (teaching), SR:179 (opening seconds).

**All four**
- One tempo per stage from its own music: LEG:203-207, LEG:411-414; frame-harmonic rounding inside that range: GE:505.
- Clumsy-thumb reach per setting: GE:161-173, GP:75-76, physics.ts:40-43.
- Both orientations and the thumb's shadow: GE:497, GE:501.
- A visual beat for muted or Bluetooth players, and an asymmetric late window: GE:529; LEG:161-170.
- Slow-down zones never empty corridors: GE:533.
- A pair acts on one beat: LEDGER-2026-11-02-full.md item 2; GV:21-54.
- Machines check what machines can check; helpers argue only about what tools can't judge: GC:119, LEDGER-CRITICAL-AGENTS.md:34-35.
- Pieces that do several jobs: GC:85.
- Rules that a test holds a stage to belong in the generator too: SR:459-466; never mirror an engine rule: SR:437-439.

---

## 10. My favourite, what would make me drop it, and what I rejected

**Favourite: B, proven rooms, with one thing from A** (the room's steps are beat data re-traced at each stage's beat and setting, so a
room is never pixels).

Why: the core win is "right on the first pass, in about an hour". Every one of today's failures came from assembling something that
had never been proven as a whole: petals laid on after the shape, branches with no holder, a route the checker invented, Easy that
never ran. B moves all proving to the room, once, over its whole range, by a script, and leaves the stage with nothing but arithmetic
and seams. It also puts the AI's time where Matt wants it: into more pieces, each one designed (his 2026-10-30 rule), and into one
hand-made hero room per stage, which is what the games that feel hand-made at scale actually do (Spelunky's rooms and obstacle blocks,
Celeste's screens) and what the one that felt samey lacked (Super Meat Boy Forever's chunks with no landmark). A is my second choice;
its solver is the better long-term machine, but a search that fails is the hardest thing for an AI helper to debug, and B can be
built in half the time on the tracer we already have. C makes the best places and the least control. D is the most original and makes
the best moments, but it depends on story approval for every cast; I would try it as World 5's signature stage inside B (one hero
room per stage could be "the one ahead" moment) before betting the engine on it.

**What would make me drop B:**
- the in-order QA recording of five room-built stages of one world still reads "the same stage played again" (the look-alike measure
  above 0.30 between neighbour stages in more than 1 pair in 5, or the quality supervisor's verdict), even with hero rooms; or
- proving a room costs more than about 30 minutes of helper time on average, or a world needs more than about 40 rooms to clear its
  coverage table, so the per-stage cost misses an hour; or
- re-tracing one room across its world's tempo range breaks it in more than 1 room in 5 (the rooms would then really be pixels, and
  Rogue Legacy's memorisation follows).

**What I rejected, and why:**
- **Roll and curate (gen2 as it is).** Measured cost (World 8's ~13 hours of re-curation, SR:150-152) and measured sameness (gen2's
  worlds still alike with a deck, LEG:420-421). Checks select instead of build, which is Carmo's 8.8-23% unplayable story with our
  numbers on it (LEP:33-36).
- **Wave Function Collapse.** No control over difficulty without bundles of pieces, can stop when a piece is missing, and fails global
  reachability (CA:607-615, CA:741-746, GE:31).
- **Evolutionary search.** Thousands of evaluations per stage (GE:29, GE:50), each one a real-engine run for us.
- **An AI writing geometry by hand per stage.** It is the 400-1,200 lines a stage we pay for today (LEG:112-115), and the source of
  most of today's bugs.
- **The music's score as the layout** (Gemini's own wild card, GE:77-81). Our music changes per session (LEG:415), and puzzle rooms
  would need the clock stopped.
- **A fresh layout generated on every play.** QA and Matt judge real screens (the laws: judge the real screen in every state); a layout
  nobody has seen can't pass that. Shipping a fixed set of proven builds per stage keeps every screen reviewable.
- **One fixed tension curve copied into every spec** (GE:133-150): the curve itself becomes the pattern the player feels (LEG:442-444).
- **Gemini's difficulty formula** (GE:243-245): it lets World 2's stage 8 be harder than World 4's first (LEG:228-232), against SR §1b.
