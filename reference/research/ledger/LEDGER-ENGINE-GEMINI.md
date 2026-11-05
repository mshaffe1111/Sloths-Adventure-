# Research ledger: Gemini's "Constructive Level Generation Architecture" (engine research, 2026-11-04)

Helper: research dissection, 2026-11-04 evening. Source: `reference/research/engine-2026-11-04/GEMINI-ENGINE-ARCHITECTURE.txt`
(587 lines, 96 KB), every line read, every table row, formula, JSON example and the works-cited list (line 587).

Compared against: `reference/engine/LEAD-SKETCH.md` ("LS n" = its item n), `reference/W1-REBUILD-PLAN.md` ("W1P"),
`reference/STAGE-RULES.md` §0, §0b, §0c, §1b, §2 ("SR"), the earlier ledgers in `reference/research/ledger/` and
`reference/GEMINI-LEDGER.md`. Code was read and every claim about our game checked:

- this branch (ccr-0d59a91c-oy3imz): `src/game/physics.ts`, `src/game/gen2/` (pipeline.ts, variety.ts, types.ts, game.ts, DESIGN.md),
  `tools/validate/` (core.ts, evaluate.ts, variety.ts, mechanics.ts), `src/game/layoutMemory.ts`, `src/game/goals.ts`,
  `src/audio/styles.ts`, `src/game/types.ts`, `src/game/capuchin.ts`, `src/game/touchGestures.ts`, `src/game/cameraFollow.ts`,
  `src/game/gpuLayer.ts`, `src/game/engine.ts`;
- the beat tracer and the W1 builders are NOT on this branch. They were read with `git show` at `origin/w1-rhythm` 5ef13375
  (2026-11-04 22:13 UTC): `src/game/beatTrace.ts` ("BT"), `src/game/w1Rhythm.ts` ("WR"), `src/audio/scenes.ts`, `src/game/engine.ts`;
  and `origin/w1-rhythm-b` 6dae405d: `src/game/w1Rise.ts` ("RISE"). The two branches' beatTrace.ts differ (md5 a8946a59 vs 3eec0b6d);
  line numbers below are w1-rhythm's.

Framing (the lead's steer, Matt's words): judge each idea by whether it moves us in a better direction, not by whether every
detail fits our game. Section 1 is the big picture; detail errors are kept short in section 6.

Status words: IN = in the game or tools today; PART = some of it; NOT = nothing in code.

Measured here (scratch scripts, not committed): `reachJump(0,false)` = 174.7 px, `reachJump(0,true)` = 313.2 px (ratio 1.79); the
worked example's move string checked against its own rules (section 7).

---

## 1. What it proposes, in plain words: the big picture

Matt's framing for this file (2026-11-04): Gemini "wasn't supposed to, per se, get our game exactly the way that it's supposed to
be. It was more of driving us in a better direction than where we are today." This ledger judges each idea that way. The detail
errors are real but small, and they sit at the end (sections 6-7).

### The direction it points us in

**Stop making stages by rolling and curating, and start compiling them.** Today we make a stage one of two ways. We roll hundreds of
layouts and keep the best (gen2, Worlds 5-8), or an AI helper hand-writes 400-1,200 lines of TypeScript for each stage (the W1
rebuild: `w1Rhythm.ts`, `w1Rise.ts`). Both are expensive: the first keeps the AI in a "roll, check, reroll, fix" loop, and the second
pays for every stage in full. Gemini's answer: put what a stage *means* in a small data file (about 20 lines), put everything that
*makes it work* in code that never changes per stage, and have the code turn the first into the second in fixed passes. A stage is
then right because of how it was built, and the checker becomes a safety net, not the way we search.

**Get variety at the big scale, not only the small one.** Its diagnosis (L3) is the sharpest thing in the file. We make variety at
the smallest scale: no 3-4 move repeats, under 45-55% alike. That gives "statistical white noise": every 30 seconds holds the same mix
of moves, going the same way at the same pace, so every stage feels the same even when it passes every check. The cure is variety
at three scales at once:
- **the map's shape** (a loop back, a high/low split, a chimney, a hub with spokes), which changes the direction you travel and what
  the camera does;
- **the section patterns** (a deck with lockouts, so a pattern can't come back soon);
- **the beat** (which notes the moves fall on, and hazards timed against the beat).

This matches Matt's own words in STAGE-RULES §0c and the W1 rebuild's map-shape and beat-feel columns. Gemini turns them into an
engine.

### The architecture, in one picture

```
 WorldProfile (~60 lines: tempo feel, world rule, animals, pattern deck)
 StageSpec    (~20 lines: map shape, 6-8 nodes with tension, the pair, puzzle, miss cost)
 MesoPatterns (~30 per world: a few moves on beats, platform kinds, animal slots, petal arcs, the floor under a miss)
        |
  Pass 1  TOPOLOGY    map shape -> 6-8 nodes, each a box on the map with a way in and a way out (loops and splits close)
  Pass 2  DECK        each node draws 2-4 patterns; a pattern is locked out for the next 4 draws
  Pass 3  BEAT TRACER Pokey's real jumps on the beat put every surface under his feet; the clumsy thumb is checked; the path
                      folds (a switchback vine, a bounce) when it would leave what both phone orientations can see;
                      hazards are timed against the beat
  DECORATE            animals bound to platform ROLES (a snake on a flat deck, a boa guarding a ledge's exit, an eagle only
                      under open sky); petals 70/15/15 in arcs along the jumps; seeds; a set cost for each miss
  VERIFY + HEAL       our checker and bots; small misses fixed in code (a dead walk gets a hop, a repeated seam gets the
                      runner-up pattern); anything left comes back as a 15-line blame log naming the data line and the fix
```

All the numbers come from formulas of each node's tension (density, gap as a share of reach, platform width, enemy spacing, rests).
The builder and the checker read the same formulas.

### What it would buy us

- **Cost.** A new stage becomes a ~20-line spec plus whatever repair the blame log asks for, against 400-1,200 lines of hand-written
  TypeScript today (WR, RISE), or a curation loop over hundreds of rolls (gen2). Gemini's own numbers (< 1,500 tokens a stage, 98%
  first pass) are guesses, but the direction is right. The lead's sketch estimates the same kind of gain: about 0.2-0.4% of Matt's
  week per stage after a 3-5% build, against 1.5-2% per hand-built stage today.
- **Cheaper repairs.** Modules small enough that the AI loads only two files, and failures that say what to change. Today, every
  repair round starts with the AI reading big files to work out what a flag means.
- **Variety the player feels.** Map shapes change the direction of travel, the deck changes the patterns, and beat-timed hazards
  change *when* things happen as well as *where*. That covers two of the three things Matt keeps naming: layouts that repeat, and
  stages that play alike. The third, the look, is the part Gemini leaves out (section 7).

### How it fits what we have

We already have about half of it, built at different times for different worlds:
- the beat tracer, our Pass 3 core (BT, on w1-rhythm and w1-rhythm-b);
- a deck without replacement with cooldowns (gen2 `variety.ts`);
- seeded sub-streams (`rngFor`);
- a threat budget, a sawtooth difficulty and a four-act node graph (gen2 `pipeline.ts`);
- a local repair loop (`checkAndRepair`);
- the 70/15/15 petal rule;
- the checker and the bots.

What is missing is the spine that joins them: the spec and pattern formats, the topology pass, the decorator by roles, auto-heal and
blame logs. Gemini's recommended build order (L547-561: day 1 deck + spec wired to the tracer, then topology and decoration, then
world profiles, then all specs) fits the lead's sketch almost item for item (section 3, item 14).

---

## 2. Ideas we don't have (ranked by how far they move us in a better direction: less cost per stage, less repetition)

Ranking (re-ranked on the lead's steer): first come the ideas that change HOW we build (a stage compiled from data, the macro shape,
patterns as data, beat-timed hazards), because they buy cost and variety together. Then the ideas that cut repair tokens. Then the
smaller rules. "Hard" means build effort for us. Each idea keeps its source line, what we have today and the effort.

1. **A stage is a ~20-line spec, compiled by code (L63, L297-323).** Today: NOT for beat stages. Each W1 stage is hand-written
   TypeScript: 1-2 and 1-5 share WR's 1,200 lines (`buildRhythmStage`, WR:881), 1-1 is RISE's 403 (`buildIntoCanopy`, RISE:59).
   gen2 has data manifests (gen2/types.ts WorldManifest, SectionTemplate) but no per-stage spec: the stage comes from `stagePlan.ts`
   plus a roll. How hard: hard (it is the engine). This is LS 3 already; Gemini's StageSpec is a concrete shape for it (section 5).
2. **Topology pass: node boxes, entry/exit vectors, four shapes, split closure (L61, L69, L463, L377).** Today: NOT as code. gen2
   only runs right (`flow: 'right'`, pipeline.ts:373) and refuses ascents (pipeline.ts:315); the W1 shapes (rise, loop-back, split,
   chimney, trail) are hand-placed per stage (WR header, RISE header). A tracer Trace knows only x0, x1, yOut (BT:104-128).
   Hub-and-spoke exists nowhere. The closure rule for a split ("sum of dx on the high road = sum on the low road ... reconnect at the
   exact same pixel", L69) is new. How hard: hard (2D layout and closure), but it is the only piece that changes the macro shape,
   which Gemini rightly calls the cure for "every 30-second window the same".
3. **Beat-relative meso-patterns as data (L257, L327-373).** "a MesoPattern defines a Beat-Relative Kinematic Chain with bound
   platform roles and aspect-safe angle constraints" (steps with beatOffset, moveCode, platformType, platformRole, enemySlot,
   pickupArc, consequenceFloor; no x, y). Today: PART. gen2's sections are laid in their own pixel space (pipeline.ts:376-441
   LocalLayout, layLocal); the tracer's NodeSpec is bars + steps (BT:58-73) with only move, dy and surface, written by hand per node
   in WR/RISE. How hard: medium (a pattern = a NodeSpec fragment plus slots; the tracer already does the placing).
4. **Hazards timed in counterpoint to the beat (L79, L369).** "a monkey throws fruit on beat 1 that lands on beat 3 while Pokey jumps
   on beat 2, or an eagle shadow locks on during a two-bar sustain and strikes on the downbeat of bar 3". Today: NOT. `hazardSpots`
   puts static hazards on the lines the beat avoided (BT:566); nothing moving is timed to the beat. How hard: medium. Adds a variety
   dimension (when, not where) that move-letter variety can't see.
5. **Structured blame log with the exact fix (L476-487).** "the verifier must never emit an opaque 'Stage Failed' message that forces
   the AI assistant to guess what went wrong. Instead, the verifier emits a Structured Blame and Auto-Repair Prescription in fewer
   than 15 lines of JSON". Today: PART. The tracer throws one sentence with the step and pixels (BT:445 "the landing at ... isn't on
   screen ... at take-off from ..."), the validator gives `{rule, what, source}` flags (tools/validate/evaluate.ts:117-124); neither
   names the data line to change or a fix. How hard: easy-medium (a shared `Blame` type, both tools emit it, one fix hint per rule).
   Biggest token saver: every repair round today starts with the AI reading code to work out what a flag means.
6. **Tiny modules over one frozen types file (L454-472).** "every TypeScript module in the level generator must remain under 150
   lines (~1,200 tokens) and share a frozen interface contract ... so the AI coding assistant only ever needs two files loaded".
   Today: NOT. gen2/pipeline.ts is 1,987 lines, gen2/types.ts 605, WR 1,200, BT 663, RISE 403. How hard: medium (a split of the
   engine-to-be; the 150-line cap is unrealistic for the tracer, see section 7.6, but "two files in context" is the right target).
7. **Local auto-healer before any error (L489).** Three fixes: a short landing (≤ 48 px) split between the two ledges; any run over
   2.5 s "split at the midpoint with a beat-aligned small hop (J) or mushroom bounce"; a repeated 3-move run at a node seam fixed by
   swapping the next node's opening pattern for the runner-up. Today: PART. The tracer sizes ledges from every clumsy try so short
   landings can't happen (BT:402-421), but it only reports dead walks (`deadWalks`, BT:589) and a builder fills them by hand (W1P:
   "fix it with a slope, a hop or a critter, never just flag it"); gen2 has a local repair loop (pipeline.ts:1771 `checkAndRepair`);
   nothing swaps a pattern at a seam. How hard: easy for the dead-walk fill and the seam swap once patterns exist.
8. **Tension drives the numbers (L129, L167, L253 Φcurve).** Density ρ(T) and gap share W_gap(T) as formulas of each node's tension,
   and a check that the measured tension matches the planned one. Today: PART. gen2 nodes carry a tension (pipeline.ts:285-295) that
   only weights the section bag (pipeline.ts:704); the gap cap is one number per difficulty (gen2/types.ts:579 MARGIN 0.65 / 0.82); the
   tracer's gap is wherever the beat puts it, under a cap (BT:410-421); nothing measures planned against actual tension. LS 1 asks for
   exactly this formula file. How hard: easy-medium.
9. **Animals bound to platform roles, with a pairwise threat cap (L177-203).** "every animal ... must be bound to an explicit Platform
    Role in data rather than spawned at arbitrary coordinates", and H_pair = w_move x w_e x ψ_runway ≤ H_max(D, T). Today: PART.
    gen2 checks a creature's ground (pipeline.ts:1461 `terrainOK`, minGround) and keeps creatures apart in px (pipeline.ts:1171-1172
    SAME_CREATURE 420, ANY_APART 120); the validator flags any enemy within 150 px of a landing (mechanics.ts:247 LANDING_CLEAR). No
    role per animal, no pairwise product. How hard: medium.
10. **The Inverse Velocity-Threat Law (L533).** "slow-down zones (mud, silk, shimmy_rope, water) are banned from appearing as empty
   traversal corridors": either the floor under a faster upper route or paired with an active dodge. Today: NOT as a rule (SR §0.2
   "every hazard must matter" is the nearest; the validator tags hurry/patience, tools/validate/mechanics.ts:212, but doesn't flag an
   empty slow stretch). How hard: easy as a validator flag, medium in the builder.
11. **Visual beat pulse for muted and Bluetooth players (L529).** "mushrooms squash on beat b-0.5 and expand on beat b, wind particles
    flash 2 beats before a gust, and petal arcs pulse along the jump parabola". Today: NOT (no beat-synced visual found in src/game;
    audio/adaptive.ts pulses only the music). How hard: easy-medium, and small code-drawn touches are allowed (CLAUDE.md polish rule).
    It is what makes the beat readable at all with the sound off.
12. **Contain cause-and-effect to bonus spots (L537).** Flags from stage s only change a Node-2 or Node-4 bonus in stage s+1 (a hazard
    becomes a vine or mushroom shortcut, or a hidden-find gate opens); the main path never changes, so no 2^k layouts to check.
    Today: NOT (part 2 ledger #7 and C15 put cause-and-effect "Later"). How hard: easy as a rule; it makes the idea affordable.
13. **An asymmetric late window (L529).** "-3 frames early and +6 frames late via extended Coyote Time". Today: PART. Coyote is 133 ms
    Normal / 167 ms Easy (physics.ts:41-42); the tracer's tries are symmetric ±100 ms on both settings (BT:150, 326-332). How hard:
    easy (one more try in TRIES, at least on Easy).
14. **Fold the path instead of failing (L81).** When the next landing would leave the view both orientations share, insert a
    switchback vine, a bounce mushroom or a lift. Today: PART. The tracer checks the landing upright and sideways and throws
    (BT:443-447); nothing folds. How hard: medium (needs vines and mushrooms in the tracer first).
15. **Bigram entropy floor (L219).** Normalized bigram entropy of the move string ≥ 0.68, against two-move ping-pong (JVJVJV). Today:
    NOT (the validator counts 4-runs and back-to-back 3-runs, core.ts:188-212). How hard: easy. Low value alone.
16. **A gesture cooldown in the tracer (L501).** At least 8 frames (267 ms) after a double jump or a drop before a punch or kick is
    asked for. Today: NOT; the tracer has no attacks (BT:48 Move = hop / jump / double). How hard: easy once combat is traced.
17. **Frame-harmonic beats (L505).** Tempos where 1800/BPM (or 3600/BPM) is a whole number, so a beat is a whole number of 30 fps
    frames. Today: NOT; 1-4's beat is 125.1 and 1-5's 136.0 (scenes.ts comment, w1-rhythm, lines 181-182). How hard: easy (snap
    `stageBeatBpm` to the nearest harmonic inside BEAT_ROOM). Value low: the thumb's ±100 ms dwarfs the 33 ms rounding; it matters for beat-timed hazards and pulses.
18. **Mount the GPU layer per node (L541).** Only nodes i-1, i, i+1 attached, one atlas, ≤ 3 draw calls a node. Today: NOT (the GPU
    layer is stage 0 and draws nothing yet, gpuLayer.ts:2-6). How hard: medium, later; needs node boxes (idea 2).
19. **A composite flow score (L251).** 0.30 curve fidelity + 0.25 beat alignment + 0.20 variety + 0.15 vertical flow + 0.10 agency.
    Today: NOT (the validator flags; bands.ts gives a difficulty score, not this). How hard: medium; weights unproven, calibrate on
    Matt's ratings first. Its "beat alignment" part (share of the bot's take-offs on a beat) is worth having alone: nothing measures
    whether the beat stages are played on the beat.
20. **Golden-seed placement by rule (L215).** Seed 1 on the risky road of the split, seed 2 in the puzzle room, seed 3 on an optional
    skill branch late in the stage. Today: NOT as a rule (seeds placed by hand, protoStage.ts:526 `goldenSeed`). How hard: easy.

---

## 3. Where it contradicts the lead's sketch or our rules

Each one judged by direction: does Gemini's side move us somewhere better?
- **Keep ours:** 1 (tempo from the music), 3 (pieces per world), 4 (variety includes the look), 7 (difficulty bands), 8 (slot
  order), 12 (petal goal set from the bots).
- **Take the idea, our numbers:** 2 (a curve per stage, placed differently each time), 5 and 6 (density and group lengths as
  formulas of tension, with our bounds), 9 (a builder cap on the checker's own measure), 10 and 11 (miss-cost tiers and enemy runway
  as data, tuned to our validator).
- **No real conflict:** 13 (which world first). The engine can start in World 1.
- **Item 14** is where Gemini and the sketch agree.

1. **Who sets the tempo.** Gemini (L505, L509-524): "All 10 WorldProfile tempos must therefore be restricted to Exact Frame-Harmonic
   ... BPMs", with a table from 90 BPM (World 1) to 138.46 (World 10). Ours (W1P): "The player hears each stage's own music, so the beat
   the moves fall on IS that music's beat, not a number we invent ... Never type a stage's BPM". Our worlds' music: W1 126-134, W2
   94-102, W3 66-74 (6/8), W4 84-92, W5 100-108, W6 86-94, W7 64-72, W8 84-92 (6/8), W9 112-120, W10 78-84 (src/audio/styles.ts:94,
   109, 127, 138, 151, 167, 180, 195, 207, 220). Gemini's table is invented; its frame-harmonic idea can still be applied inside each
   world's own range (section 4, row F65).
2. **One fixed curve, typed into every spec.** Gemini (L61, L133-150, L313-322): Nodes 1-2 Ki, 3-4 Sho, 5-6 Ten, 7-8 Ketsu, with one
   tension table (0.20, 0.35, 0.55, 0.45, 0.75, 0.85, 1.00, 0.25), and its example StageSpec copies it. Ours (W1P): "Every stage has all
   seven parts, but no two stages place them the same way (the ledger, 11-04 part 2: a fixed curve is itself a pattern the player
   feels): where the spike sits, how long the rest is, and which pair the counter-melody brings must differ from the stage before."
3. **How many pieces a world needs.** Gemini (L63): "adding a new world requires one WorldProfile JSON, one mutator rule (~40 lines of
   TypeScript), and 2 to 3 world-themed meso-patterns" (its W4 deck has 8). Ours: SR §0c.4 "each world has at least 3 templates per
   pacing tag (12+), each with at least 3 parameter variants"; SR §1c "at least 14 distinct section types per world"; CLAUDE.md (Matt,
   2026-10-30) "I'd rather have more pieces and have that variety". Gemini's number is the "barely squeak past" Matt ruled out.
4. **Variety measured on move letters only.** Gemini (L44 row 94, L217-225, L568-570): the deck, entropy and Levenshtein/Jaccard on the
   move string carry all variety. Ours: SR §0c.5 "A node only counts as different when what the player stands on, faces or uses
   changes: the terrain and platform kinds, the hazard, the animal and its trick, the mechanic, the direction of travel, the art pieces
   on screen"; SR §0c.6 "the validator's move string and look grid"; LS 5 has an "art dressing" step. Gemini has no art step at all.
5. **Action density.** Gemini (L131): Easy 0.35-0.85 actions/s, Normal 0.50-1.35. Ours (SR §2 "Pacing"): "0.75-1.15 actions/s Normal,
   0.35-0.55 Easy, 1.1-1.4 a chase"; the validator's tight line is 1.15 (core.ts TIGHT_RATE) and its intro line 0.8 (INTRO_RATE); W1P
   intro "1 action every 2.5 s" (0.4/s). Gemini's Easy top is 55% above ours; its Normal top is a chase.
6. **Rhythm group and rest lengths.** Gemini (L113): groups 6.0-10.0 s, rests 1.5-2.2 s, 16 groups a stage. Ours: SR §0b.1 groups of
   "5, 10, 15 or 20 s"; SR §0b.2 part 4 "a 15-20 s dense finale ... ending at the exit"; SR §2 rest pads "1.0-1.2 s Normal, 2.0-2.5 s
   Easy"; validator REST_PAD_SECS 1.0 / 2.0 and FINALE_TIGHT_MAX 20 (core.ts). Gemini has no long finale group, and its Node 8 is an
   8.5 s "cooldown sprint" (L398) where W1P wants the finale "ending AT the exit (the cool-down is a few seconds, not a walk)".
7. **Difficulty across worlds.** Gemini (L243-245): D(w,s) = 0.12 + 0.055(w-1) + 0.032(s-1) ..., a stage ramp (0.288) five times a
   world step (0.055), plus "That 0.20 reduction at the opening of every new world". Ours (SR §1b): "no stage may leave its world's
   band: World 2's stage 8 must never be as hard as a World 4 stage. Bands may overlap their neighbours a little, never by a whole
   world." By Gemini's formula W2-S8 = 0.399, above W4-S1 (0.285), W5-S1 (0.340) and W6-S1 (0.395). Our code: bandFor (pipeline.ts:231,
   10 + 55(w-1)/9, band -1.5 to +7.5) with STAGE_HEAT (pipeline.ts:237), stage 1 "just under the last of the world before".
8. **Slot order.** Gemini (L245): "Within each world, Stages 4 and 7 introduce a -0.06 relief dip" in every world. Ours: part 2 ledger
   #1 (research L402: "Never keep the Puzzle stage at X-7 and the Vertical stage at X-6 in every single world"), SR §0b.6 "UNDER REVIEW".
9. **Similarity: generator and checker on different scales.** Gemini (L223-225): 0.5 x (1 - Levenshtein/len) + 0.5 x 4-gram Jaccard
   ≤ 0.42 "establishes a 3% to 13% safety buffer below the headless checker's 45%-55% rejection zone". Ours: cosine of 3-gram counts
   (core.ts:221-237; evaluate.ts:34 NEIGHBOUR_MAX 0.45, core.ts:237 SIMILAR_MAX 0.55) plus a look grid (evaluate.ts:147-158). LS 6: "The
   checker reads the same formulas". A cap on one metric guarantees nothing on another.
10. **What a miss costs.** Gemini (L237) Tier 1: a miss drops "3-5 tiles onto a safe lower moss ledge ... requiring a 5-8 s vine or climb
    (C) recovery loop with zero health damage". Ours: the validator calls a miss that costs "more than about 4 s to get back" a bite
    (mechanics.ts:106-110 FALL_BITE_PX 200, FALL_BITE_SECS 4); W1P "Long falls hurt ... more than 400 px costs a heart on Normal".
    Gemini's "safe" tier is our "bites" tier. Its Tier 3 respawn "at the start of the current Rhythm Group" is finer than ours
    (checkpoint at each node's entrance, BT:506; SR §0b.2 checkpoints on the rests before parts 3 and 4).
11. **Enemy runway.** Gemini (L203): "at least 1.0 s (30 frames) of safe flat ground" before any enemy's trigger (Easy, and Normal under
    tension 0.60), i.e. 285 px at full run. Ours: never within 150 px of a landing (mechanics.ts:247, "research §6"). Not a clash in
    spirit; Gemini is about twice as strict.
12. **Petal goal.** Gemini (L207, L211): goal "equals 75% of total stage petals", P_total fixed at 100. Ours: goals.ts:21 Normal collect
    0.875 for every stage not rebuilt; W1P about 75%; 1-2's share dropped to 0.6 today from the first-timer runs (WR:905 at 5ef13375,
    commit "no thinning of the shared path (it took 1-2 to about 27 petals and sealed the door for the fixed first-timer)"). SR §0c.5:
    petals never count as variety; petals.ts:24 PER_SCREEN 6 and "no rows" limit a fixed 100.
13. **Where to start.** Gemini (L549): day 1 for "World 4 (or World 5)". W1P: World 1 stages 1-1 to 1-5 first, tonight, for the testers.
14. **Agrees with the sketch on the core:** formulas file (LS 1 ≈ section 4), world profile (LS 2 ≈ WorldProfile), ~20-line stage spec
    (LS 3 ≈ StageSpec), template library (LS 4 ≈ MesoPatterns), beat-traced placement and deterministic seed (LS 5 ≈ passes 3 and
    L377). It adds what the sketch lacks: topology as its own pass, a deck with lockout, blame logs, auto-heal, module size limits.
    The sketch has what Gemini lacks: art dressing and "cross-world fingerprints" (LS 6).

---

## 4. Formulas and numbers

"Used?" = do we use this formula or number today. Our value cites code or rules.

| # | Line | Formula / number | Used? | Our current value |
|---|---|---|---|---|
| F1 | 109 | N ∈ [6, 8] pacing nodes per standard stage | PART | W1 nodes tagged 7 ways (WR:33 intro/ramp/spike/rest/counter/climax/cool); gen2 SPINE 9 nodes (pipeline.ts:285-295) |
| F2 | 109 | T_skilled ∈ [120, 150] s; T_first ∈ [180, 300] s | IN | Matt: skilled ≥ 2:00, target 2:30; first-timer 2-5 min (W1P, SR §0.5); gen2 QUICK 120 s (pipeline.ts:203) |
| F3 | 111 | F_skilled = 30·T_skilled ∈ [3600, 4500] frames | NOT | we count seconds (engine sim in 1/60 s slices, engine.ts:505) |
| F4 | 113 | rhythm group d ∈ [6.0, 10.0] s; rest r ∈ [1.5, 2.2] s | NOT | groups 5-20 s (SR §0b.1), 10-14 s Normal / 6-8 s Easy (SR §2); rest pads 1.0 / 2.0 s (core.ts REST_PAD_SECS) |
| F5 | 115 | T_skilled = Σ_i (τ_puzzle(i) + Σ_g (d + r)) | NOT | length from the quick route's clock (validator) and stageTime.ts's model (gen2Model, pipeline.ts:217) |
| F6 | 117 | τ_puzzle ∈ [12, 18] s, once, Node 4 or 6 | NOT | no rule |
| F7 | 117 | 16 x (6.2 + 1.6) + 12 = 136.8 s | — | arithmetic right; its own spec has 14 groups (L314-321) |
| F8 | 121 | T_first = η_hes·T_skilled + ΔT_branch + Σ p_miss·G_i·τ_penalty | NOT | first-timer bot measures it (tools/inspect/firsttimer.ts) |
| F9 | 119-123 | η_hes ≈ 1.22, ΔT_branch ≈ 25 s, p_miss ≈ 0.25, τ_penalty ≈ 8.0 s → 223.9 s | NOT | bot press latency N(+90, 65) Easy / N(+30, 30) Normal, 0.4 / 0.2 s hesitation (GEMINI-LEDGER F3) |
| F10 | 127 | sustained ρ > 1.6 actions/s (96 APM) → thumb fatigue | NOT | tight line 1.15 (core.ts TIGHT_RATE); chase 1.1-1.4 (SR §2) |
| F11 | 127 | BPM ∈ [90, 138.46]; T_beat = 60/BPM ∈ [0.433, 0.667] s | NOT | 64-134 BPM across worlds (styles.ts) |
| F12 | 129 | ρ_i = ρ_min(D) + (ρ_max - ρ_min)·T_i^1.15 | NOT | tension not bound to density |
| F13 | 131 | Easy ρ 0.35-0.85; Normal ρ 0.50-1.35 actions/s | NOT | Easy 0.35-0.55, Normal 0.75-1.15 (SR §2) |
| F14 | 136-150 | node tensions 0.20, 0.35, 0.55, 0.45, 0.75, 0.85, 1.00, 0.25; Easy ρ 0.43, 0.50, 0.60, 0.55, 0.71, 0.76, 0.85, 0.45; Normal ρ 0.63, 0.75, 0.93, 0.84, 1.11, 1.20, 1.35, 0.67; rests 2.2, 1.8, 1.6, 2.2, 1.5, 2.0, 1.5, 0 s (table is consistent with F12, checked) | PART | gen2 SPINE tensions 0.1, 0.3, 0.6, 0.1, 0.72, 0.1, 0.85, 0.95, 0 (pipeline.ts:285-295); W1P intro 0.4/s, ramp 1 every 1.2 s |
| F15 | 157 | y(k) = y0 + k·v_y0 - ½k(k+1)g; x(k) = x0 + Σ(η_air·v_x0 + j·a_wind) | NOT | engine: 1/60 s slices, pad read per 30 fps frame, gravUp 1900 / gravDown 2500, hang x0.72 near the top while held, cut to 230 on release (physics.ts:18-23, BT:247-290) |
| F16 | 159 | k_land,1 = ⌊2v_y0/g⌋; double at k ≈ ⌊v_y0/g⌋ | NOT | JUMP_AIRTIME 0.630 s (physics.ts:137); tracer's double at the first frame past the top (BT:264-268) |
| F17 | 159 | R_2 ≈ 1.75·R_1 | — | measured 313.2 / 174.7 = 1.79 (reachJump, flat) |
| F18 | 163 | R_safe = η_air·R_max - (δ_early + ΔK_dj)·v_x0 | NOT | tracer simulates each clumsy try instead (BT:326-339) |
| F19 | 165 | Easy δ_early 5 frames (167 ms), δ_dj 5, η_air 0.80 → R_safe ≈ 0.62 R_max | PART | tracer Easy: ±100 ms, air 0.85, hold 0.7, short hold 0.6 (BT:150-154, 341); gen2 Easy margin 0.65 (types.ts:579). F18 with our physics (9.5 px a frame, R_1 175, R_2 313) gives about 0.50-0.53, not 0.62 |
| F20 | 165 | Normal δ_early 3 frames (100 ms), δ_dj 3, η_air 0.90 → R_safe ≈ 0.78 R_max | PART | tracer ±100 ms, air 0.85, short hold 0.8; gen2 Normal margin 0.82. F18 with our physics: about 0.72-0.74 |
| F21 | 167 | W_gap/R_max = γ_min(D) + (γ_max - γ_min)·T_i | NOT | one cap per difficulty (pipeline.ts:99 maxGap) |
| F22 | 169 | single-jump gap share Easy [0.25, 0.55], Normal [0.35, 0.75] of R_1 | NOT | cap 0.65 / 0.82 of reach, and never past levelCheck's 0.97 x reach - 70 (pipeline.ts:99-104); tracer: reach x 0.97 - 70 - 2 - 15 (BT:421) |
| F23 | 169 | double-jump gap share Easy [0.40, 0.60], Normal [0.50, 0.78] of R_2 | NOT | same caps |
| F24 | 171 | W_plat ≥ W_hitbox + 2·δ_early·v_x0 + W_buffer(1 - T) | PART | pad = shortest to longest clumsy landing + INSIDE 8 + SLOP 10 (BT:157, 410, 476); MIN_LEDGE 90 (BT:175) |
| F25 | 173 | W_plat 3.5 x W_sloth (T = 1, Normal) to 7.0 x W_sloth (T = 0.2, Easy) | NOT | Pokey ~44 px wide (physics.ts:172 LAND_HALF 21 = 0.48 x 44): 154-308 px against our floor 90 px |
| F26 | 182-192 | animal footprints: snake deck ≥ 5.0 W (≈ 220 px) + 1.5 W runway; boa ≥ 3.5 W from entry; eagle 4.0 s open sky; cat ≥ 8.0 W (≈ 352 px); monkey perch +2.5-4.5 H_sloth | PART | creature minGround (gen2/types.ts:47, pipeline.ts:1461); heroBox 56 x 116 (BT:170) |
| F27 | 182-192 | hazard weights w_e: snake 1.2, boa 1.0, eagle 1.6, cat 1.5, spider 1.1, monkey 1.4 | PART | gen2 creature threat cost (gen2/types.ts:42, "2 for a beetle, 4 for a cliff hopper") |
| F28 | 197 | E_cpm(w, D) = E_base(D) + α_E(D)·(w - 1) | NOT | section threat budget 2 + 6·heat (pipeline.ts:270); ~35% enemy-free target (mechanics.ts:248) |
| F29 | 199 | Easy E_base 3.5, α 0.35 (3.5 → 6.65/min, ~8 → 15 a stage); Normal 5.5, α 0.65 (5.5 → 11.35, ~12 → 25) | NOT | Easy enemy share 60% (gen2/types.ts:582 EASY_ENEMY_SHARE) |
| F30 | 201 | Δt_enemy ≥ 60/E_cpm·(1.25 - 0.50·T_i); floor 4.5 s Easy, 2.5 s Normal | NOT | px spacing: same creature 420 px, any 120 px (pipeline.ts:1171-1172) |
| F31 | 203 | H_pair = w_move(m_prev) x w_e x ψ_runway ≤ H_max(D, T_i); w_move and H_max never given | NOT | — |
| F32 | 203 | ≥ 1.0 s (30 frames) flat runway before an enemy's trigger (Easy; Normal T < 0.60) | PART | no enemy within 150 px of a landing (mechanics.ts:247) |
| F33 | 207 | goal = 75% of P_total; 70% shared + 15% + 15% | PART | Matt's 70/30 (W1P), RISE splitPetals; goals.ts:21 0.875 elsewhere; 1-2 now 0.6 (WR:905) |
| F34 | 209-211 | P_encountered = 0.85·P_total; margin (0.85 - 0.75)/0.85 = 11.76% | IN (as test) | W1P "goal ≤ shared path + the smaller road - 5%" |
| F35 | 211 | P_total = 100, P_goal = 75, P_shared 70 in 3-to-5 petal arcs | NOT | petal pass, PER_SCREEN 6 (petals.ts:24) |
| F36 | 213 | p_A,k = p_B,k = round(15 / K_split) | NOT | (rounding breaks the 100 total at K_split = 2: 4 x 8 = 32) |
| F37 | 217 | no adjacent identical substring of length 1-4; no symbol 3 times running | PART | flags a 4-run seen more than 3 times, a 3-run back to back 3 times (core.ts:188-212) |
| F38 | 219 | H_2(S) = -(1/log2 of alphabet size)·Σ P(a,b) log2 P(b given a) ≥ 0.68 | NOT | — |
| F39 | 223 | Sim = 0.5(1 - d_Lev/max len) + 0.5·J_4 ≤ 0.42 | NOT | cosine of 3-grams: 0.45 stage before, 0.55 any earlier (evaluate.ts:34, core.ts:237) |
| F40 | 225 | 42% cap = 3-13% buffer under 45-55% | NOT | — |
| F41 | 237 | Tier 1 (T ≤ 0.45): drop 3-5 tiles, lose 3-5 petals, 5-8 s recovery, 0 damage | PART | catch bough 82 px under a gap (RISE:30 CATCH_DOWN); bites over 200 px or 4 s (mechanics.ts:109-110) |
| F42 | 237 | Tier 2 (0.45 < T ≤ 0.80): mud/silk slow-down or bramble, 1 HP or 10 s slow penalty | NOT | — |
| F43 | 237 | Tier 3 (T > 0.80): -1 HP, respawn at the current rhythm group | PART | long falls > 400 px hurt on Normal on the beat stages (engine.ts:845-847 at w1-rhythm; W1P); node checkpoints (BT:506) |
| F44 | 243 | D(w,s) = 0.12 + 0.055(w-1) + 0.032(s-1) - 0.06·[s ∈ {4,7}] + 0.08·[s = 10] | PART | bandFor: 10 + 55(w-1)/9, band [-1.5, +7.5] (pipeline.ts:231); STAGE_HEAT 0.05, 0.3, 0.45, 0.35, 0.6, 0.5, 0.75, 0.65, 1.0 (pipeline.ts:237) |
| F45 | 245 | D(w,9) = Base + 0.256; D(w+1,1) = Base + 0.055 (a 0.20 drop) | NOT | our drop is about 2.4 D units of a 9-unit band |
| F46 | 251 | F_flow = 100(0.30Φ_curve + 0.25Φ_rhythm + 0.20Φ_variety + 0.15Φ_vertical + 0.10Φ_agency) | NOT | flags, no score |
| F47 | 253 | Φ_curve = 1 - mean of the gap between measured and planned tension | NOT | — |
| F48 | 253 | Φ_rhythm: take-offs within ±1 frame (±33.3 ms) of a beat or half-beat | NOT | nothing measures the bot's take-offs against the beat |
| F49 | 253 | Φ_variety = min(1, H_2/0.75)·(1 - max Sim) | NOT | — |
| F50 | 253 | Φ_vertical: minus stalled-frame share, plus normalized σ_y | PART | map shape in 12 parts (tools/validate/variety.ts:84 shapeOf) |
| F51 | 253 | Φ_agency: a split or loop with both roads viable; 100% of hazards C_miss > 0 | PART | missCost (mechanics.ts:145) |
| F52 | 253, 580 | accept F_flow ≥ 80.0 (L253) / ≥ 82.0 (L580) | NOT | (its two thresholds disagree) |
| F53 | 261 | 1800/112.5 = 16.000 frames a beat | NOT | 1-4 beat 125.1, 1-5 136.0 (scenes.ts, w1-rhythm, comment lines 181-182) |
| F54 | 274-276 | gust tailwind 0.18 px/frame², headwind -0.14, 4-bar cycle (2 calm, 2 gust), telegraph 24 frames | NOT | wind exists in W4 (stagePlan.ts:71 "Crosswind"; capuchin.ts:9-12 gusts) |
| F55 | 279 | creak delay Easy 36 frames (1.2 s), Normal 20 (0.67 s) | PART | creaking limbs ~0.6 s, snap twigs ~0.15 s (SR §0b.4) |
| F56 | 280-281 | mud speed x0.55, silk x0.45 | NOT checked | — |
| F57 | 294 | lockout 4 draws | PART | section cooldown coolN (pipeline.ts:767), prop cooldown 2 (pipeline.ts:1253), CooldownQueue "14 chunk ids" (variety.ts:131) |
| F58 | 446 | 56 moves, 36.4% similarity, 2.15 s max rest, 122.4 s skilled, 214.0 s first-timer, 85% petals, F 88.4 | — | never run: the string is 57 moves; N1 repeats JB/BJ back to back, the seams give JJ three times and JWJ JWJ once, normalized bigram entropy 0.56 < its 0.68; N7 has 4 enemies in 16.8 s against its own ≥ 6.0 s spacing (checked here) |
| F59 | 489 | shortfall ≤ 48 px → +Δx/2 and -Δx/2; split runs > 2.5 s (75 frames) | PART | dead walk 2.5 s (core.ts:142, BT:166), reported not fixed |
| F60 | 489 | auto-heal raises first pass ~80% → > 98% | NOT | unmeasured |
| F61 | 497 | 1.2 s lookahead sideways vs 0.45 s upright for a W+J | NOT | not measured for us |
| F62 | 497 | ISSB 12 x 12 tiles; anchors: left 25% (east), bottom 25% (chimney), top 30% (drops) | PART | both views checked: upright 400 x 880, sideways 1100 x 540 world px (BT:180-183); camera looks across gaps (cameraFollow.ts:180-191) |
| F63 | 501 | ρ > 1.2 → gesture collisions; 8-frame (267 ms) cooldown after a double jump or drop; thumb hides bottom-right 20% upright; Pokey at 55% height, bottom 25% clear | NOT | Pokey kept inside heroPad 0.17-0.90 of the view (cameraFollow.ts:190) |
| F64 | 505 | 110 BPM = 16.36 frames; 16/17 alternation = 33.3 ms, 6-10 px of reach | — | 33.3 ms x 285 px/s = 9.5 px with our run speed (physics.ts:9) |
| F65 | 505 | require 1800/BPM or 3600/BPM to be whole | NOT | harmonic tempos inside our ranges: W1 128.57 (14 f) or 124.14 (14.5); W2 94.74 (19) or 100 (18); W3 69.23 (26) or 72 (25); W4 85.71 (21) or 90 (20); W5 100 (18) or 105.88 (17); W6 90 (20); W7 66.67 (27) or 69.23 (26); W8 85.71 or 90; W9 112.5 (16) or 120 (15); W10 78.26 (23) or 81.82 (22) |
| F66 | 510-524 | its world tempos 90, 94.74, 100, 112.5, 105.88, 120, 120, 128.57, 128.57, 138.46 | NOT | styles.ts (section 3 item 1) |
| F67 | 529 | Bluetooth lag 120-220 ms (4-7 frames); window -3 / +6 frames | PART | coyote 133 / 167 ms, buffer 133 / 200 ms (physics.ts:41-42); tracer ±100 ms (BT:150) |
| F68 | 533 | a 50% speed drop with no more decisions feels stuck; skilled leap over, clumsy trudge 3 s | NOT | — |
| F69 | 537 | 2^k layouts per stage with k flags | — | — |
| F70 | 541 | 7,000-10,000 px a 3-5 min stage; nodes i-1, i, i+1 mounted; ≤ 3 draw calls a node | NOT | not measured here; 120 s of pure running at 285 px/s would be 34,200 px |
| F71 | 549 | day 1: ~250 lines, 8 hours, < $3, 10/10 first roll, similarity ~52% → < 38% | — | unmeasured promise |
| F72 | 561 | 85 specs ≈ 1,700 lines; 200 builds (100 stages x 2 settings) | — | — |
| F73 | 566-582 | targets: yield ≥ 85% / 98% (legacy < 15%); similarity ≤ 42% max, < 32% world mean; 0 repeated runs, H_2 ≥ 0.68; rest ≤ 2.2 s, 100% slow-downs active; 120-150 / 180-300 s; 0 blind leaps; 85% single-pass petals; F ≥ 82; < 1,500 tokens a stage (legacy 40,000-150,000+) | — | legacy numbers unsourced; ours: gen2 keeps the best 16 of a few hundred rolls (gen2/DESIGN.md Part A) |

---

## 5. Data formats and how they would map onto our code today

**WorldProfile (L259-295, `world_04_wind_canopy.json`).** `worldId`, `name`, `bpm` 112.5, `framesPerBeat` 16, `timeSignature` [4,4],
`mutator` {type PERIODIC_GUST, cycleBars 4, calmBars 2, gustBars 2, tailwindAccelPxPerFrame2 0.18, headwindAccelPxPerFrame2 -0.14,
telegraphLeadFrames 24}, `kinematicModifiers` {branchCreakDelayFrames {easy 36, normal 20}, mudSpeedMultiplier 0.55,
silkSpeedMultiplier 0.45}, `allowedAnimals` [eagle, monkey, coiled_boa, spider], `mesoPatternDeck` (8 ids), `lockoutCooldownDraws` 4.
- Maps onto gen2's `WorldManifest` (gen2/types.ts: moves, creatures with threat and terrain, props, decor sets, band); `allowedAnimals`
  ≈ `manifest.creatures`, deck ≈ the world's SectionTemplates, lockout ≈ CooldownQueue length (pipeline.ts:767).
- `bpm` and `timeSignature` must NOT be typed: read from the music (BT:636 `stageBpm`; styles.ts `meter` 16 or 12). Our W3 and W8
  are in 12 (styles.ts:127, 195), which the [4,4] field and the tracer's 8-eighth bar (BT:199 "is not 8 eighths") can't express.
- `framesPerBeat` is derived, not data. `mutator` has no home in code yet (part 2 ledger #2: world-wide mutators NOT).
- What it lacks against LS 2: the art kit, owned mechanics, signature, difficulty level, and Easy versions of the mutator.

**StageSpec (L297-323, `w4_s3_spec.json`).** `stageId`, `worldId`, `seed`, `mapShape` HIGH_LOW_SPLIT, `primaryMechanic` W,
`secondaryMechanic` V, `supportMechanics` [B, J, S], `rhythmMotifBeats` [1.0, 1.0, 0.5, 0.5, 1.0], `puzzleBlueprintId`,
`puzzleNodeIndex` 4, `splitNodeIndex` 3, `causeEffectOut` {flag, unlocksInStage, effect}, `causeEffectIn` {requireFlag,
bonusShortcutNode}, and 8 `nodes` {id, phase, tension, groups, vector, consequence}.
- Nearest today: one row of W1P's table (job, map shape, note values, beat feel, pair, look, signature) plus `stagePlan.ts`'s
  `S(kind, name, goal)` and `LevelConfig`. Nothing reads a spec; WR/RISE hard-code each stage.
- `rhythmMotifBeats` (durations in beats) would become our `bars` strings ('x' beat, 'o' off-beat, 'h' half, '.' run; BT:9-10,
  `gridHits` BT:196); our form already carries the beat feel the validator compares (tools/validate/variety.ts:58 `rhythmOf`).
- `nodes[].vector` (EAST, EAST_UP, SPLIT_E, PUZZLE_BOX, UP_CHIMNEY, EAST_DOWN, EAST_FAST, EAST_EXIT) ≈ WR's `LNode.dir` and `tier`
  (WR LNode, around line 36-50), but ours is only ±1 horizontally.
- `nodes[].consequence` (TIER1_PETAL_LOOP, TIER2_BRANCH_DROP, TIER3_GROUP_RESET) ≈ RISE's `Under` = 'soft' / 'catch' / 'pit'
  (RISE:44) and fallZones (RISE:68, 142).
- Missing against LS 3 and W1P: the slot job, the look, the signature moment, Dot's line, goal type. Missing against W1P's "differ
  in at least four columns" rule: nothing in the spec says how it must differ from its neighbour.

**MesoPattern (L325-373, `MP_GUST_VINE_LEAP.json`).** `patternId`, `requiredMechanics` [W, V, J], `moveSignature` "JVWJ",
`durationBeats` 8, `aspectSafeMaxSlopeDeg` 28, `steps`: (0) beatOffset 0, J, SOLID_LIMB, role Gatekeeper_Ledge, enemySlot {coiled_boa,
minTension 0.50, runwayBeats 2.0}, pickupArc {PETAL_TRAJECTORY, 3}; (1) beatOffset 2, V, SWING_VINE, swingPeriodBeats 2.0,
releaseOnBeat 3.0, pickupArc {PETAL_APEX, 2}; (2) beatOffset 3, W, TAILWIND_BOOST, doubleJumpBeatOffset 4.0, followup J,
consequenceFloor {dropTiles 4, ROTTEN_CATCH_BRANCH, returnMove C}; (3) beatOffset 6, REST, CREAKING_BRANCH, role Open_Canopy_Span,
enemySlot {eagle, monkey, minTension 0.65, counterpointBeatOffset -1.0}, holdBeats 2.0.
- Maps onto a fragment of the tracer's `NodeSpec` (BT:58-73): `beatOffset` → a mark in `bars`; `moveCode` J → Step.move 'jump' /
  'hop' / 'double'; `platformType` SOLID_LIMB / CREAKING_BRANCH → Surface 'branch' / 'crumble' (BT:50). V, W, C, S, REST and
  SWING_VINE, WIND_ZONE have no tracer type yet (Move is hop / jump / double only, BT:48).
- `enemySlot` ≈ gen2's `Socket` kind 'enemy' (gen2/types.ts:234, 256) plus a role; `pickupArc` ≈ the petal pass; `consequenceFloor` ≈
  RISE's catch bough (CATCH_DOWN 82, RISE:30).
- Clashes with our numbers: `swingPeriodBeats` 2.0 at 112.5 BPM is 1.07 s, but our lianas swing on their own with a 2.85 s period
  Normal, 3.3 s Easy (pipeline.ts:122-125, VINE) and the player waits for them (lianaSeconds, pipeline.ts:211). A REST of 2 beats
  (1.07 s) on a CREAKING_BRANCH whose own profile says it gives way after 20 frames (0.67 s) is a fall, not a rest.

**Compiled entities (L403-444).** Node 2, group 0, startBeat 32, startFrame 512: SOLID_LIMB box (1080, 180, 240 x 32), takeoff
(1304, 180) beat 34 frame 544, 3 petals; SWING_VINE anchor (1490, -20) length 180, grab (1442, 148) beat 35 frame 560, release
(1548, 142) beat 36 frame 576, clumsy margin early3 26 px / late3 31 px PASS; WIND_ZONE box (1548, -40, 360 x 320) accelX 0.18,
double-jump trigger (1692, 164) beat 37 frame 592, catch floor (1520, 310) w 380 returnVineX 1870; CREAKING_BRANCH (1864, 156,
220 x 28) landing (1896, 156) beat 38 frame 608, creak 20 frames, landing clearance 32 px PASS.
- Maps onto our `Trace` (BT:104-128: ledges, landings with from/to, gaps, checkpoint, safe paths, avoided lines) and then
  `Platform` / `Vine` in protoStage.ts. Our Trace keeps seconds, not frames, and is richer on safety (`safe`, `avoided`).
- Its takeoff at 1304 is 16 px from the ledge's end (1320); our rule is that every jump leaves at least TAKEOFF_SLACK 70 px of room
  (physics.ts:169). The frame numbers are consistent (16 frames a beat).

**Blame log (L478-487).** `stageId`, `status` FAILED_CONSTRUCTIVE_ASSERTION, `failedModule`, `location` {nodeId 6, groupIndex 1,
patternId, stepIndex 2}, `violation` PORTRAIT_SIGHTLINE_EXCEEDED, `measuredValuePx` 512, `maxAllowedPx` 430, `exactFixInstruction`.
- Maps onto the tracer's thrown Error (BT:380-466: step number, px, a reason) and the validator's flag {rule, what, source, x or t}
  (evaluate.ts:117-172). Both lack: which data line, the limit as a number, and the fix. 430 px for "portrait" does not match our
  narrowest upright view, 400 px of world (BT:180-183).

**Node table of the worked example (L379-399)** is a fifth format: per node the patterns drawn, the move string, enemies by role,
petals, seconds. Our nearest is the validator's per-stage page (move string, pacing strip, flags) and WR's `LNode` (tag, pair, tier,
dir, x0, x1, y, bars, density, seconds). A per-node row like this is a good shape for the plan each builder sends the lead (W1P
"Each builder sends the lead its stage plan (node table + a top-down layout still)").

---

## 6. Facts about our game it gets wrong (only the ones that would change a decision)

These change what we build:

1. **Tempo comes from our music, not a table.** Its world tempos (L509-524: 90 BPM rising to 138.46) don't match ours. Ours are W1
   126-134 through W10 78-84; W3 and W8 are in 12 time (styles.ts:94-220). The W1 plan's rule stands: read the beat from the
   music (BT:636 `stageBpm`). Keep the idea of a whole number of 30 fps frames per beat, applied inside each world's own range
   (F65).
2. **The music changes per session** (scenes.ts:184-196 at w1-rhythm), so a layout can't follow one song's bassline (Arch 4 Track 2,
   L79). The beat-timed hazards from Arch 4 (Track 3) still work, because the beat stays fixed per stage.
3. **The tracer exists only on the w1-rhythm and w1-rhythm-b branches, as two different copies, and it places jumps only** (hop /
   jump / double onto bank / branch / stump / crumble, BT:48-50). Pass 3's "platforms, vines, ropes, mushrooms" means extending it.
   The two copies need to become one before the engine builds on it.
4. **We already have the deck with lockouts** (variety.ts:58-210, used by gen2 pipeline.ts:767-831), and gen2's worlds still felt
   alike. The deck is needed but not enough. The bigger buys are the topology pass and the look (section 7.1).
5. **Our checker compares stages by cosine of 3-move counts plus a look grid** (core.ts:221-237, evaluate.ts:147-158), not by
   Levenshtein/Jaccard. A builder cap has to be on the checker's own measure.
6. **Our physics is 1/60 s steps with two gravities and a hang at the top** (physics.ts:18-23, engine.ts:505), not one gravity per
   30 fps frame. Its reach formulas are a guide to the shape, and our numbers come from the tracer's simulation.
7. **Monkeys don't attack in our game** (capuchin.ts:2-12: thief, lookout, guard; not an EnemyType, types.ts:37-50). The role table
   (L179-193) is a good idea, but its rows must be our animals: snake, boa, eagle, ocelot/jaguar/tayra, spider, frog, caiman, turtle.
8. **The petal goal isn't a fixed 75% everywhere.** goals.ts:21 uses 0.875 on stages not yet rebuilt, and 1-2 moved to 0.6 today from
   the first-timer runs (WR:905 at 5ef13375). Keep the 70/15/15 split (Matt's), and set the goal from the bots.

Smaller slips that change nothing are left in the table (E-rows): world names, viewport pixel sizes, seed counts, legacy roll
counts.

## 7. What's weak or unproven in it (at the level of direction)

1. **It leaves out how a stage looks.** All its variety guarantees are on the move letters (deck, entropy, string distance). Matt's
   rule (SR §0c.5) is that a node only counts as different when the terrain, hazard, animal, direction or art change, and gen2 shows
   that a deck alone doesn't get there. The engine needs one more pass Gemini doesn't have: art dressing by node and role, with the
   look measure (evaluate.ts look grid) in the checker (LS 5 has the dressing step).
2. **It is thin on pieces.** "2 to 3 world-themed meso-patterns" for a new world (L63) is the "barely squeak past" Matt ruled out.
   The engine cuts the cost of each stage, not the number of pieces a world needs (SR §0c.4: 12+, §1c: 14+).
3. **One fixed tension curve copied into every spec** (L133-150, L313-322) would itself become the pattern the player feels (W1P,
   part 2 ledger). The spec should place the curve's parts, and the checker should require neighbours to differ, as the W1P table
   does.
4. **The numbers are its own** (L105: "original architectural derivations"), and its showcase run (L446) was never run: its own
   example breaks its own repeat and entropy rules (section 4 F58; E176-E186). Treat every number as a first guess to calibrate on our
   bots and on Matt's play. Never treat one as a target.
5. **Its recommended design hand-waves the hardest part:** closing a loop or a split (Arch 1's "elastic bridge", L63). Our W1 stages
   1-2 and 1-3 are exactly a loop and a split, so this needs real design before it is promised.
6. **The cost claims are unmeasured** (4-5 days, < $3 on day 1, < 1,500 tokens a stage). The direction holds; the sizes don't. The
   tracer alone is 663 lines today against the "~140" it budgets.
7. **Its difficulty formula lets worlds overlap too much** (W2-S8 harder than W4-S1, against SR §1b). It is the one formula to reject
   outright. Our bandFor and STAGE_HEAT already do this job (pipeline.ts:231-237).

---

## 8. The full ledger table

Columns: # | research line | what it says (numbers kept) | in the lead's sketch? (LS item) | in rules / plan / validator? (cite) |
status in code (IN / PART / NOT, file:line) | proposal. "—" = nothing. Grepped `reference/GEMINI-LEDGER.md` and the three earlier
ledgers for each idea; where they already rule, it is noted.

| # | Line | What it says | Lead sketch? | Rules / plan / validator | Code | Proposal |
|---|---|---|---|---|---|---|
| E1 | 3 | Diagnosis: "Micro-Markov Uniformity Trap": variety at the move level converges on white noise; every 30 s window the same mix, left to right, same camera pace | yes (problem) | SR §0c "Why today's way fails" | validator measures moves and looks only (evaluate.ts:117-158) | adopt as diagnosis: passing the move checks is not variety |
| E2 | 3 | Generate-and-test puts paid AI tokens in an unbounded loop; shift to hierarchical constructive compilation; 85 stages; ~20-line change per stage | yes ("85 to go", LS 3) | — | gen2 roll-and-curate (gen2/DESIGN.md Part A) | adopt (it is the engine's goal) |
| E3 | 7 | Split declarative intent (data) from kinematic/topological enforcement (code); too much geometry in templates is memorized, too much freedom is unplayable | yes (LS 2-5) | — | PART gen2 manifests (gen2/types.ts) vs passes (pipeline.ts) | adopt |
| E4 | 11 | Spelunky: 4x4 room grid, guaranteed critical path, room types; probabilistic chunks | no | — | NOT | not taken (we are a side-scroller); keep its failure as a lesson (E5) |
| E5 | 11 | Spelunky failure: hazards from neighbouring rooms combine into unavoidable hits | no | — | gen2 SAME_CREATURE / ANY_APART (pipeline.ts:1171-1172) PART | adopt via the pairwise cap (E109) |
| E6 | 13 | Dead Cells: concept graph per biome (entrance, combat, treasure, merchant, exit; branching ratio; entrance-exit distance) + tagged hand-made rooms; generator code kept small | partly (LS 3-4) | — | PART gen2 missionGraph (pipeline.ts:285-375), no branching ratio | consider for hub-and-spoke search stages |
| E7 | 13 | Dead Cells failure: branching rooms overlap in 2D, fixed with buffer corridors | no | — | NOT (gen2 runs right only, pipeline.ts:373) | note for a topology pass (E37) |
| E8 | 15 | Rayman Legends: x_i = ∫ v_x dt maps beat times to positions; percussion → attacks, melody → jumps, sustains → ropes | yes (LS 5) | W1P "the beat is the music's beat" | PART BT traceNode turns slots into x by running (BT:354-385); stem mapping NOT | have the mapping; consider a per-world beat-to-move table (E58) |
| E9 | 15 | Rayman failure: no topological freedom; one hesitation fails; late variety only by visual distortion | no | W1P (player-paced, not auto-run) | IN as caution (player can stop) | keep: never lock his speed to the music |
| E10 | 17 | Celeste: no generation; 4 layers per screen; screen-snap camera; buffer, coyote, corner correction; Assist Mode in code only | no | SR §2 "Jump forgiveness" | IN coyote / buffer (physics.ts:40-43), ASSIST (physics.ts:46-70) | have; keep assist in code, never in stage data |
| E11 | 17 | Celeste failure: hand-tuning hundreds of screens costs too much when paying per token | yes (problem) | — | WR 1,200 lines for 1-2 + 1-5; RISE 403 for 1-1 | this is us now; the reason for the engine |
| E12 | 19 | Downwell: one vertical fall-line, rest caverns at fixed depths | no | — | NOT | not taken |
| E13 | 19 | Rogue Legacy: point-buy hazard budget scaled by distance from the entrance | no | — | IN gen2 threat budget (gen2/types.ts:42; pipeline.ts:270) | have |
| E14 | 19 | Rogue Legacy failure: static geometry memorized when only enemies vary | no | SR §0c.5 | — | have the rule; check gen2 against it |
| E15 | 21 | Kishotenketsu: one primary mechanic, introduce, combine with a second, twist, mastery; filler when mechanics are disconnected | yes (LS 3 pair) | SR §0b.2, W1P "one named pair" | PART gen2 phases (pipeline.ts:285-295), WR tags (WR:33) | have |
| E16 | 21 | Hades: deck without replacement, recent templates banned, relief guaranteed after intense rooms | no | SR §0c.2 | IN ShuffleBag / CooldownQueue / WorldOnce (variety.ts:58, 135, 195), used in layStage (pipeline.ts:767-831) | have; it did not cure sameness alone (section 6.4) |
| E17 | 21 | Ori: momentum chains over elevation; escape sequences became memorization spikes when readability dropped | no | — | NOT | note (risk of beat stages that only work memorized) |
| E18 | 25 | Launchpad: rhythm first (groups 5-10 s, density), then a geometry grammar; one rhythm gives dozens of layouts | yes (LS 5) | SR §0b.1 | PART BT + WR fitSteps (WR:147) picks steps for fixed bars | adopt "many geometries per rhythm" in the pattern library |
| E19 | 25 | Launchpad limitation: generate-and-cull at the macro level | — | — | IN (gen2 curation) | note: same weakness |
| E20 | 27 | Tanagra: beat timeline, 4 single-beat + 4 multi-beat patterns, constraint solver computes (x, y, w); relax or backtrack at the pattern level in ms | no | — | PART BT forward only, throws (BT:380-447); WR fitSteps up to 160 tries (WR:147) | consider pattern-level backtracking in place of a throw |
| E21 | 29 | Polymorph: action density, leniency, pairwise adjacency; difficulty super-additive (gap then enemy on the landing) | no | mechanics.ts:247 LANDING_CLEAR 150 | PART (checked, not built in) | adopt in the builder (E109) |
| E22 | 29 | Dahlskog/Togelius: 23 meso-patterns (2-Horde, 3-Horde, Roof Valley, Pillar Gap, Enemy Valley, Risk and Reward, 3-Path); micro/meso/macro; micro slices break, meso is the minimum unit | yes (LS 4) | SR §0c.2-4 | PART gen2 SectionTemplate; W1 none | adopt a meso layer for beat stages |
| E23 | 31 | ASP (clingo): global rules, every solution valid by definition | no | — | NOT | not taken (cost) |
| E24 | 31 | WFC fails global reachability without a movement graph or repair | no | — | NOT | not taken |
| E25 | 31 | Graph segmentation BWTA/PDS: 86% mean, 96% peak agreement with human rooms | no | — | — | not relevant (map segmentation); unverified |
| E26 | 31 | Chunk-level modification 83.5% first-pass playable vs 80.0% baseline; whole-level 74.1% | no | GEMINI-LEDGER D3 | PART gen2 checkAndRepair (pipeline.ts:1771) | supports local repair; numbers unverified |
| E27 | 36 | Table: Spelunky data = 10x8-tile templates with chunk markers; code = 4x4 walk | no | — | NOT | restates E4 |
| E28 | 38 | Table: Dead Cells data = concept graphs + CastleDB/LDtk rooms; code = matcher, bounding-box solver, enemy budget | no | — | PART | restates E6 |
| E29 | 40 | Table: Rayman data = stem timelines; code = x = v_x·t | yes | W1P | PART | restates E8 |
| E30 | 42 | Table: Celeste data = OGMO JSON screens + events; code = camera, coyote, assist | no | — | PART | restates E10 |
| E31 | 44 | Table: Downwell / Rogue Legacy data = slices tagged by exits and spawn slots; failure memorized geometry | no | — | PART | restates E12-14 |
| E32 | 46 | Table: Launchpad data = rhythm group parameters + grammar probabilities | yes | — | PART | restates E18 |
| E33 | 48 | Table: Tanagra failure = high solver complexity on 2D branching graphs | no | — | — | restates E20 |
| E34 | 50 | Table: Polymorph / Mario AI: evolutionary search needs thousands of evaluations; raw n-grams break topology | no | — | — | restates E21-22 |
| E35 | 52 | Table: WFC data = exemplar maps / adjacency; fails reachability | no | — | — | restates E24 |
| E36 | 57 | Enforce constraints before or during placement, not by rejection; 80%+ first-pass validity | yes | — | gen2 roll-and-curate | adopt as goal |
| E37 | 61 | Pass 1: mapShape (loop_back, high_low_split, chimney, hub_and_spoke) → DAG or single-cycle graph | yes (LS 3 map shape) | W1P map-shape column; 11-04 L595 | NOT as code (gen2 right only, pipeline.ts:315, 373); W1 shapes hand-placed | adopt (topology module) |
| E38 | 61 | 6-8 nodes mapped Ki 1-2, Sho 3-4, Ten 5-6, Ketsu 7-8 | partly | W1P 7 parts placed differently per stage | PART WR:33, pipeline.ts:285 | contradicts W1P (section 3.2): keep ours |
| E39 | 61 | Each node a non-overlapping 2D box with entry and exit vectors | no | — | NOT (Trace has x0, x1, yOut, BT:104-128) | adopt (needed for loops, chimneys, culling) |
| E40 | 61 | Pass 2: 2-4 meso-patterns per node from a stateful deck, locked out for M = 4 draws | yes (LS 4) | SR §0c.2 | IN for gen2 sections (variety.ts:135) | have; extend to beat patterns |
| E41 | 61 | "mathematically preventing 3-4 move repetitions before a single pixel" | — | — | — | not true even in its own example (E176-E183); keep the validator's run check |
| E42 | 61 | Example patterns: Vine_Transfer_Over_Mud, Rotten_Branch_Cascade, Snake_Stomp_Bridge, Eagle_Shadow_Sprint | yes (LS 4 vine chain...) | — | NOT on beat stages | adopt names as seeds for the W1 library |
| E43 | 61 | Pass 3: tempo + rhythm motif → beat times; tracer simulates Pokey at 30 fps; places platforms, vines, ropes, mushrooms; checks the clumsy thumb | yes (LS 5) | W1P | PART BT ledges only (BT:48-50) | adopt: add vine, rope, bounce moves to the tracer |
| E44 | 63 | Data: WorldProfile (BPM, mutator, deck, roster); StageSpec ~20 lines; ~30 MesoPatterns | yes (LS 2-4) | — | PART gen2 WorldManifest | adopt; BPM read from music |
| E45 | 63 | Code: graph layout engine, deck shuffler, tracer, pickup and enemy role binder | yes (LS 5) | — | PART | adopt |
| E46 | 63 | New stage = 20 lines; new world = profile + ~40-line mutator + 2-3 meso-patterns | yes (claimed buy) | SR §0c.4 12+, §1c 14+ | — | contradicts (section 3.3): pieces stay 12+ per world |
| E47 | 63 | Variety on three scales: macro topologies, meso deck (cross-stage Jaccard < 42%), micro BPM and swing/bounce physics | yes (LS 6) | SR §0c.7 fingerprints | PART tempoAlike, shapeAlike (tools/validate/variety.ts:68-106) | adopt the three-scale framing, add look (SR §0c.5) |
| E48 | 63 | Node tension T_i ∈ [0,1] drives gap-reach ratio and enemy adjacency budget | yes (LS 1) | — | PART tension weights sections only (pipeline.ts:704) | adopt (E99, E109) |
| E49 | 63 | Arch 1 weak point: elastic bridge at loop/split merge; 4-5 days | — | — | — | note; closure needed (E52) |
| E50 | 67 | Arch 2: CSP over 80-120 beats with (x, y, w, m, h) domains; AC-3 + backtracking | no | — | NOT | not taken |
| E51 | 69 | Reachability: (dx, dy) ∈ R(m, BPM, D, Wind) | yes (LS 1) | — | IN forward check vs level check (BT:410-424) | have |
| E52 | 69 | Split closure: Σdx and Σdy equal on both roads (beats 20-35 vs 20-38), merge at one pixel | no | W1P 1-3 high/low split | NOT (RISE roads hand-placed) | adopt as a tracer feature for two roads |
| E53 | 69 | Anti-repetition: moves i..i+2 never equal i+3..i+5 | — | core.ts RUN3_BACK 3 (core.ts:189) | PART (flags at 3 repeats) | consider flagging 2 back-to-back |
| E54 | 69 | Dead walk: w_i / v_run ≤ 2.5 s | — | W1P | IN core.ts:142, BT:166 | have |
| E55 | 69 | Arch 2: ~30 lines per stage; UNSAT at beat 47 opaque to an AI; 8-12 days | — | — | — | not taken |
| E56 | 73 | Arch 3: inertial flow-ribbon spline C(u); chimney bends up, loop folds, split forks | no | — | NOT | consider as the topology's representation (cheap) |
| E57 | 73 | Markov tiling P(M_k given M_k-1, phase, slope) learned from the strongest W1-4 patterns; 23x23 table | no | — | NOT | not taken: learning from W1-4 copies the sameness |
| E58 | 73 | Seam welding: adjust only the bridge platform between chunks with the tracer | no | 11-04 L603 aprons | PART BT 200 px aprons (BT:146) | have the apron; welding not needed yet |
| E59 | 73 | Arch 3: ~15 lines a stage, 3-4 days; Markov cycles; spline curvature distorts puzzle rooms | — | — | — | note |
| E60 | 77 | Orientation paradox: a leap fair sideways is blind upright, a drop readable upright is blind sideways | no | SR §1 | IN both views checked (BT:180-183, 443-447) | have |
| E61 | 79 | 4-track lead sheet, 32-64 bars; Track 1: kick → ground jump or bounce, snare → double or vine grab, hi-hat → run or shimmy, rest → safe platform | no | W1P beat feel | PART one track: 'x' 'o' 'h' '.' (BT:9-10) | consider a per-world mark-to-move table |
| E62 | 79 | Track 2: bassline → direction θ ∈ [-90°, +90°]: rising → climb, falling → drop, root → sprint, octave split → high/low split | no | — | NOT | not taken: music differs per session (scenes.ts:184-196) |
| E63 | 79 | Track 3: hazards in call-and-response (fruit thrown beat 1 lands beat 3 while Pokey jumps beat 2; eagle locks 2 bars, strikes on bar 3's downbeat) | no | W1P hazards on the avoided line | NOT (hazardSpots static, BT:566) | adopt beat-timed hazards (section 2.4) |
| E64 | 79 | Track 4: dynamics pp → mf → ff encode the node tension curve | no | — | PART music has mood/danger layers (audio/adaptive.ts:14, 139), not tied to tension | consider |
| E65 | 81 | Inscribed Safe Sightline Box: the intersection of upright and sideways views around the camera anchor; fold the path (wall-bounce mushroom, lift, switchback vine) when it would leave | no | — | PART checks and throws (BT:443-447) | adopt folding as an auto-fix |
| E66 | 81 | "no two songs can ever produce the same layout"; puzzle rooms need a "fermata"; 5-6 days; build Arch 1 + ISSB + counterpoint | — | — | — | adopt the recommendation's shape, not the song claim |
| E67 | 86 | Comparison table, inspiration row (Arch 1 Dead Cells + Launchpad + Hades ... Arch 4 Rayman + turtle folding + dual-viewport math) | — | — | — | — |
| E68 | 88 | Comparison, data row: 20-line spec + profile + ~30 patterns / rules + bounds / spline + 23x23 tables / 4-track lead sheet | yes | — | — | — |
| E69 | 90 | Comparison, code row: layout solver + deck + tracer + role binder / AC-3 / spline + Markov + welder / transpiler + ISSB | yes | — | — | — |
| E70 | 92 | Comparison, cost row: ~20 lines a stage, ~60 a world / ~30 / ~15 / ~25 bars | yes (LS buy) | — | — | unmeasured |
| E71 | 94 | Comparison, variety row: shapes x deck lockout x BPM / exclusion constraints / entropy + cooldown / song structure | — | — | — | — |
| E72 | 96 | Comparison, difficulty row: tension drives gap, enemy adjacency and rest / hard bounds / slope + chunk rating / velocity scales subdivision | — | — | — | — |
| E73 | 98 | Comparison, weak points row: merge bridge / opaque UNSAT / weak hub_and_spoke / fermata | — | — | — | — |
| E74 | 100 | Comparison, build cost row: 4-5 / 8-12 / 3-4 / 5-6 days | — | — | — | unmeasured |
| E75 | 105 | The coefficients are "original architectural derivations" | — | — | — | treat every number as a guess to calibrate |
| E76 | 109 | N ∈ [6, 8] nodes per stage (stages 1-9) | partly | W1P, 11-04 L531 | PART (WR:33, pipeline.ts:285) | have |
| E77 | 109 | T_skilled 120-150 s; T_first 180-300 s | — | SR §0.5, W1P | IN QUICK (pipeline.ts:203) | have |
| E78 | 111 | F_skilled = 30·T = 3600-4500 frames | — | — | NOT | not needed |
| E79 | 113 | 8 nodes x G_i rhythm groups of 6.0-10.0 s, rests 1.5-2.2 s | yes (LS 1 pace) | SR §0b.1, §2 | PART core.ts REST_PAD_SECS, GROUP_MAX | contradicts (section 3.6) |
| E80 | 115 | T_skilled = Σ (τ_puzzle + Σ (d + r)) | yes (LS 1 length) | — | NOT | adopt as the spec's length budget |
| E81 | 117 | τ_puzzle 12-18 s, once, in node 4 or 6 | — | SR §3 | NOT as rule | consider |
| E82 | 117 | Worked: 16 groups x (6.2 + 1.6) + 12 = 136.8 s | — | — | — | arithmetic right; spec has 14 groups |
| E83 | 119 | First-timer: hesitation x1.22, branches +25 s, miss recovery | — | — | IN bot measures (tools/inspect/firsttimer.ts) | use as a predictor; the bot rules |
| E84 | 123 | p_miss 0.25, τ_penalty 8.0 s → T_first 223.9 s (3.73 min) | — | — | — | arithmetic right; unproven |
| E85 | 127 | ρ = required thumb inputs a second; above 1.6/s (96 APM) fatigue and misreads | — | SR §2 chase 1.1-1.4 | PART TIGHT_RATE 1.15 | unproven; keep ours |
| E86 | 127 | BPM 90-138.46; beat 0.433-0.667 s | — | W1P | NOT (styles.ts 64-134) | contradicts |
| E87 | 129 | ρ_i = ρ_min + (ρ_max - ρ_min)·T^1.15 | yes (LS 1) | — | NOT | adopt the shape with our bounds |
| E88 | 131 | Easy 0.35-0.85, Normal 0.50-1.35 actions/s | — | SR §2 Easy 0.35-0.55, Normal 0.75-1.15 | — | contradicts (section 3.5) |
| E89 | 136 | Node 1 Ki: safe intro + Dot tip; T 0.20; Easy 0.43; Normal 0.63; rest 2.2 s | — | W1P intro 0.4/s | PART | keep ours (0.4) |
| E90 | 138 | Node 2 Ki: repeat with a petal arc; 0.35; 0.50; 0.75; 1.8 s | — | W1P ramp | PART | — |
| E91 | 140 | Node 3 Sho: primary + animal trick or branch type; 0.55; 0.60; 0.93; 1.6 s | — | SR §0b.2 | PART | — |
| E92 | 142 | Node 4 Sho: high/low split OR puzzle room; mid-stage relief; 0.45; 0.55; 0.84; 2.2 s | — | W1P rest node | PART | — |
| E93 | 144 | Node 5 Ten: world mutator or second hazard in counterpoint; 0.75; 0.71; 1.11; 1.5 s | — | W1P counter-melody | PART | — |
| E94 | 146 | Node 6 Ten: first climax, multi-beat chain vine → bounce → stomp; 0.85; 0.76; 1.20; 2.0 s | — | W1P spike | PART | — |
| E95 | 148 | Node 7 Ketsu: mastery combining all; 1.00; 0.85; 1.35; 1.5 s | — | W1P climax | PART | Normal 1.35 over our tight line |
| E96 | 150 | Node 8 Ketsu: cooldown sprint, petal shower, exit; 0.25; 0.45; 0.67; 0 s | — | W1P "ending AT the exit" | PART | keep ours (a few seconds) |
| E97 | 157 | Per-frame Euler with one g and wind | — | — | NOT (1/60 slices, two gravities, BT:247-290) | wrong for us (section 6.4) |
| E98 | 159 | Landing frame ⌊2v/g⌋; double at apex; R_2 ≈ 1.75 R_1 | — | — | measured 1.79 | close; keep ours |
| E99 | 161 | Clumsy thumb: late (absorbed by coyote), early (loses δ·v), second-flick timing δ_dj, air control η | — | SR §2 | PART BT TRIES (BT:326-339), no δ_dj | adopt: add an off-apex second flick to TRIES |
| E100 | 163 | R_safe = η_air·R_max - (δ_early + ΔK_dj)·v_x0 | — | — | NOT | consider as the explanation of margins |
| E101 | 165 | Easy 5 frames early, 5 dj, η 0.80 → 0.62; Normal 3, 3, 0.90 → 0.78 | — | GEMINI-LEDGER D2 | PART margins 0.65 / 0.82 (gen2/types.ts:579); BT 100 ms both settings (BT:150) | consider 167 ms early on Easy; with our physics its formula gives ~0.50-0.53 Easy, ~0.72-0.74 Normal |
| E102 | 167 | Gap share = γ_min + (γ_max - γ_min)·T | yes (LS 1 gap vs reach) | — | NOT | adopt within the level check's cap |
| E103 | 169 | Single: Easy 0.25-0.55, Normal 0.35-0.75 of R_1; double: Easy 0.40-0.60, Normal 0.50-0.78 of R_2 | yes | — | NOT | adopt as starting ranges, calibrate on bots |
| E104 | 171 | W_plat ≥ hitbox + 2·δ_early·v + buffer·(1 - T) | — | — | PART pads from the clumsy spread (BT:402-476) | consider a tension-scaled floor |
| E105 | 173 | Pads 3.5 x W_sloth (climax, Normal) to 7.0 x (intro, Easy) | — | — | NOT (MIN_LEDGE 90, BT:175) | consider: 154-308 px against our 90 px floor |
| E106 | 177 | Enemy on a landing multiplies difficulty; every animal bound to a platform role in data | — | mechanics.ts:247 | PART terrainOK (pipeline.ts:1461) | adopt roles |
| E107 | 182 | Snake: punch to daze then stomp; Flat_Combat_Deck ≥ 5.0 W; 1.5 W runway; w_e 1.2 | — | W1P 1-3 combat triangle | IN snake (types.ts:38) | adopt the role; numbers to test |
| E108 | 184 | Coiled boa: kick to clear; Gatekeeper_Ledge ≥ 3.5 W from the entry, blocking a bridge, rope or seed; 1.0 | — | — | IN boa (types.ts:43; WR:902 BOA_LINE) | adopt the role |
| E109 | 186 | Eagle: shadow locks, dives; Open_Canopy_Span, no ceiling for 4.0 s; banned on breaking branches; 1.6 | — | — | IN shadow (engine.ts:671, 2809) | adopt the ceiling and no-crumble rules |
| E110 | 188 | Stalking cat: ≥ 8.0 W runway with a vine or mushroom escape at the far end; 1.5 | — | — | PART ocelot / jaguar / tayra (types.ts:40-45) | map to our prowlers |
| E111 | 190 | Spider: drops on silk, slow webs; above ropes or in chimneys; paired with S; 1.1 | — | — | PART spider (types.ts:47); silk drop not found | check behaviour before use |
| E112 | 192 | Monkey: throws fruit on an arc; perch +2.5-4.5 H_sloth above the path; fruit on off-beats; 1.4 | — | — | wrong: capuchins never hurt (capuchin.ts:2-12) | not taken as stated |
| E113 | 197 | E_cpm = E_base + α_E·(w - 1) | yes (LS 1 enemy spacing) | mechanics.ts:248 35% enemy-free | NOT (threat 2 + 6·heat, pipeline.ts:270) | consider |
| E114 | 199 | Easy 3.5 + 0.35 (3.5 → 6.65/min); Normal 5.5 + 0.65 (5.5 → 11.35) | — | — | NOT | unproven; check against 35% enemy-free |
| E115 | 201 | Δt ≥ 60/E·(1.25 - 0.5·T), floors 4.5 s Easy / 2.5 s Normal | yes | — | PART px spacing (pipeline.ts:1171-1172) | adopt time spacing; its own N7 breaks it |
| E116 | 203 | H_pair = w_move x w_e x ψ_runway ≤ H_max(D, T) (w_move, H_max not given) | — | — | NOT | adopt the idea, define the numbers ourselves |
| E117 | 203 | 1.0 s (30 frames, ~285 px) flat runway before an enemy trigger on Easy and Normal T < 0.6 | — | LANDING_CLEAR 150 px (mechanics.ts:247) | PART | consider (stricter) |
| E118 | 207 | Petals: goal 75% of total; golden seeds 3 a stage; hidden finds 1-2 | yes (LS 1 70/15/15) | W1P | PART goals.ts:21 0.875; WR:905 0.6; seeds vary (engine.ts:2907) | set goals from the bots (section 6.8) |
| E119 | 207 | 70% shared + 15% high + 15% low | yes | W1P (Matt) | IN RISE splitPetals; WR 1-2 splits | have |
| E120 | 209 | Single-pass yield 0.85 x total | — | W1P | IN (test) | have |
| E121 | 211 | Forgiveness (0.85 - 0.75)/0.85 = 11.76% ("+10%") | — | W1P "- 5%" rule | IN | have |
| E122 | 211 | P_total = 100; 70 shared in 3-to-5 petal parabolic arcs along the traced jump, teaching where to jump | — | §0c.5, PER_SCREEN 6 | NOT | consider arcs on the beat parabola; no fixed 100 |
| E123 | 213 | Branch petals round(15/K_split) each | — | — | NOT | minor bug (rounding breaks 100) |
| E124 | 215 | Seed 1 on the risky road of the Sho split (Risk and Reward), seed 2 in the puzzle room, seed 3 on an optional skill branch in node 6-7 | — | — | NOT (hand-placed, protoStage.ts:526) | consider as a placement rule |
| E125 | 217 | No adjacent identical substring of length 1-4; no symbol 3 times running | — | core.ts:188-212 | PART | consider tightening; its two rules overlap |
| E126 | 219 | Normalized bigram entropy H_2 ≥ 0.68 | — | — | NOT | consider (cheap); its example scores 0.56 |
| E127 | 223 | Sim = 0.5 Levenshtein part + 0.5 4-gram Jaccard ≤ 0.42 | — | part 2 ledger C3; core.ts:237 | NOT | not taken: cap our own metric instead |
| E128 | 225 | 42% cap leaves 3-13% under the 45-55% zone | — | evaluate.ts:34 | — | adopt the buffer idea on our cosine |
| E129 | 230 | Budget table: petals 70 / 15 / 15 = 100 | yes | W1P | IN | have |
| E130 | 232 | Budget table: goal 75, margin 10, unvisited 15 | — | W1P | IN | have |
| E131 | 234 | Budget table: similarity cap ≤ 42%, buffer 3-13%, rejection > 55% | — | — | — | see E127 |
| E132 | 237 | A miss always costs something (C_miss > 0) without bottomless-pit rage | — | mechanics.ts:145 missCost | IN | have |
| E133 | 237 | Tier 1 (T ≤ 0.45): drop 3-5 tiles to moss or water, lose 3-5 petals, 5-8 s climb back, no damage | — | FALL_BITE_SECS 4 (mechanics.ts:110) | PART RISE catch boughs (RISE:30) | contradicts (section 3.10) |
| E134 | 237 | Tier 2 (0.45-0.80): drop from the high road into mud or silk, or brambles (1 HP or 10 s slow) | — | — | NOT | consider; a 10 s slow clashes with E152 |
| E135 | 237 | Tier 3 (> 0.80): -1 HP, respawn at the start of the current rhythm group | — | W1P long falls hurt | PART engine.ts:845-847 (w1-rhythm); checkpoints per node (BT:506) | consider group-level respawn on Normal climaxes |
| E136 | 241 | A linear ramp fatigues; needs breathers | — | SR §1b | IN STAGE_HEAT (pipeline.ts:237) | have |
| E137 | 243 | D(w,s) = 0.12 + 0.055(w-1) + 0.032(s-1) - 0.06 dips at 4, 7 + 0.08 at 10 | yes (LS 2) | SR §1b | PART bandFor (pipeline.ts:231) | contradicts §1b (section 3.7) |
| E138 | 245 | World w stage 9 = Base + 0.256; world w+1 stage 1 = Base + 0.055 (0.20 drop); passes the old peak by stage 6 | — | SR §1b | — | not taken; its own claim is wrong (stage 8) |
| E139 | 245 | Stages 4 and 7 relief dips (hub_and_spoke or puzzle) in every world | — | part 2 ledger #1 | PART dips at 4, 6, 8 (pipeline.ts:237) | contradicts (section 3.8) |
| E140 | 251 | Flow score = 100(0.30 curve + 0.25 rhythm + 0.20 variety + 0.15 vertical + 0.10 agency) | yes (LS 6) | — | NOT | consider after calibrating on Matt's ratings |
| E141 | 253 | Φ_curve = 1 - mean gap between measured and planned tension | — | — | NOT | adopt (cheap, the tracer knows the plan) |
| E142 | 253 | Φ_rhythm = share of the bot's take-offs within ±33 ms of a beat or half-beat, minus dead walks | — | — | NOT | adopt as an "on the beat" share, with a realistic window |
| E143 | 253 | Φ_variety = min(1, H_2/0.75)·(1 - max Sim) | — | — | NOT | consider |
| E144 | 253 | Φ_vertical = minus stalled frames, plus elevation spread (FDG 2015) | — | — | PART shapeOf (tools/validate/variety.ts:84) | consider |
| E145 | 253 | Φ_agency = a split or loop with both roads viable + every hazard costs | — | — | PART missCost | adopt the split check |
| E146 | 253 | Accept at ≥ 80 with zero hard violations | — | — | NOT | later |
| E147 | 257 | Data inheritance: profile once, spec overrides ~20 lines, patterns beat-relative with no px | yes | — | PART gen2 sections px-local (pipeline.ts:376-441) | adopt beat-relative patterns |
| E148 | 261 | Frame-harmonic tempo: 112.5 BPM = 16.000 frames a beat | — | — | NOT (1-4 125.1, 1-5 136.0) | consider snapping inside BEAT_ROOM |
| E149 | 263-268 | WorldProfile: worldId 4, "Whistling Wind Canopy", bpm 112.5, framesPerBeat 16, 4/4 | yes (LS 2) | — | PART WorldManifest | map (section 5); W4 is Mist Cascades |
| E150 | 269-277 | Mutator PERIODIC_GUST: 4-bar cycle, 2 calm + 2 gust, tailwind 0.18, headwind -0.14 px/frame², telegraph 24 frames | yes (LS 2 mutator) | part 2 ledger #2 | NOT as data (W4 gusts in code, capuchin.ts:9-12) | adopt the mutator slot |
| E151 | 278-282 | Kinematic modifiers: creak delay 36 / 20 frames; mud x0.55; silk x0.45 | — | SR §0b.4 creak ~0.6 s | PART | have the creak; speeds unchecked |
| E152 | 283 | allowedAnimals eagle, monkey, coiled_boa, spider | yes (LS 2 roster) | — | PART manifest.creatures | monkey wrong (E112) |
| E153 | 284-293 | Deck of 8: GUST_VINE_LEAP, ROTTEN_BRANCH_CASCADE, MUSHROOM_EAGLE_DODGE, ROPE_SHIMMY_FRUIT_ARC, BOA_KICK_BRIDGE, SILK_SLIDE_CHIMNEY, CREAKING_STEPPING_STONES, WIND_GLIDE_DOUBLE_JUMP | yes (LS 4) | SR §0c.4 12+ | — | names useful; 8 is under our 12+ |
| E154 | 294 | lockoutCooldownDraws 4 | — | — | PART CooldownQueue | have |
| E155 | 300-304 | StageSpec: stageId, worldId, seed 849204, mapShape HIGH_LOW_SPLIT | yes (LS 3) | W1P | NOT | adopt |
| E156 | 305-307 | primaryMechanic W, secondaryMechanic V, supportMechanics B J S | yes (LS 3 pair) | W1P one pair | NOT | adopt as the pair field |
| E157 | 307 | rhythmMotifBeats [1.0, 1.0, 0.5, 0.5, 1.0] | yes (LS 3 beat feel) | W1P note values | PART bars strings (BT:9-10) | use our bars form |
| E158 | 308-310 | puzzleBlueprintId PUZ_COUNTERWEIGHT_PULLEY_2SWITCH, puzzleNodeIndex 4, splitNodeIndex 3 | — | SR §3 | PART puzzleKit rooms as data (SR §3) | adopt |
| E159 | 311 | causeEffectOut: flag W4_S3_SLUICE_OPENED unlocks in W4_S4, FLOOD_LOWER_ROOTS | — | part 2 ledger #7 | NOT | see E191 |
| E160 | 312 | causeEffectIn: requireFlag W4_S2_VINE_BRIDGE_DROPPED, bonusShortcutNode 2 | — | — | NOT | see E191 |
| E161 | 314 | Node 1: KI 0.20, 2 groups, EAST, TIER1_PETAL_LOOP | — | — | — | one row of the fixed curve (E38) |
| E162 | 315 | Node 2: KI 0.35, 2, EAST_UP, TIER1 | — | — | — | — |
| E163 | 316 | Node 3: SHO 0.55, 2, SPLIT_E, TIER2_BRANCH_DROP | — | — | — | — |
| E164 | 317 | Node 4: SHO 0.45, 1, PUZZLE_BOX, TIER1 | — | — | — | — |
| E165 | 318 | Node 5: TEN 0.75, 2, UP_CHIMNEY, TIER2 | — | — | — | — |
| E166 | 319 | Node 6: TEN 0.85, 2, EAST_DOWN, TIER2 | — | — | — | — |
| E167 | 320 | Node 7: KETSU 1.00, 2, EAST_FAST, TIER3_GROUP_RESET | — | — | — | — |
| E168 | 321 | Node 8: KETSU 0.25, 1, EAST_EXIT, TIER1 | — | — | — | — |
| E169 | 330-334 | MesoPattern header: required W V J, signature JVWJ, 8 beats, aspect-safe max slope 28° | yes (LS 4) | — | NOT | adopt the header (slope limit is new) |
| E170 | 336-345 | Step 0: beat 0, J, SOLID_LIMB, Gatekeeper_Ledge, boa slot (min tension 0.50, runway 2 beats), 3-petal arc | — | — | NOT | adopt the step shape |
| E171 | 346-353 | Step 1: beat 2, V, SWING_VINE, swing period 2 beats, release on beat 3, 2 petals at apex | — | — | NOT | clashes with our self-swinging lianas (2.85 s, pipeline.ts:122-125) |
| E172 | 354-363 | Step 2: beat 3, W tailwind, double jump at beat 4, followup J, miss floor 4 tiles down onto a rotten catch branch, return by climbing | — | — | NOT | adopt the miss-floor field |
| E173 | 364-371 | Step 3: beat 6, REST on CREAKING_BRANCH, Open_Canopy_Span, eagle or monkey slot (min 0.65, counterpoint -1 beat), hold 2 beats | — | — | NOT | internal clash: a 2-beat rest on a 20-frame creak |
| E174 | 377 | Seeds: hash (seed, node, group, pass) through mulberry32 sub-streams | yes (LS 5 seed) | — | IN rngFor (pipeline.ts:73), salts per pass (pipeline.ts:1536) | have |
| E175 | 377 | Worked topology: nodes 1-2 (0,0) → (2140, +320); split 3A to +640, 3B to +120; merge (3680, +380); node 5 chimney +420, +980 with switchbacks under 540 px wide upright, steps under 420 px tall sideways; goal (7840, +520) | — | — | — | its view sizes are not ours (~400 wide upright, ~540 tall sideways, BT:180-183) |
| E176 | 382 | N1 KI 0.20: WIND_GLIDE_DOUBLE_JUMP → CREAKING_STEPPING_STONES; JWJBJBJ; 1 boa; 10 petals + Dot tip; 15.2 s | — | — | — | string breaks its own length-2 ban |
| E177 | 384 | N2 KI 0.35: GUST_VINE_LEAP → BOA_KICK_BRIDGE (+ W4_S2 shortcut); JVWJBJVC; boa + spider; 10; 16.0 s | — | — | — | — |
| E178 | 386 | N3A SHO 0.55 high: MUSHROOM_EAGLE_DODGE → GUST_VINE_LEAP; JWBJVWJ; eagle + monkey; 15 + seed 1; 16.5 s | — | — | — | GUST_VINE_LEAP again 1 node later (lockout is 4 draws: N2 drew it 2 draws before) |
| E179 | 388 | N3B SHO 0.45 low: ROPE_SHIMMY_FRUIT_ARC → CREAKING_STEPPING_STONES; CSJBSJB; 2 spiders, 1 boa; 15; 17.8 s alt | — | — | — | CREAKING_STEPPING_STONES 3 draws after N1 (inside the lockout) |
| E180 | 390 | N4 SHO 0.45 puzzle: PUZ_COUNTERWEIGHT_PULLEY_2SWITCH; PCJPJ; monkey switch guard; 8 + seed 2; 14.8 s | — | — | — | — |
| E181 | 392 | N5 TEN 0.75: SILK_SLIDE_CHIMNEY → ROTTEN_BRANCH_CASCADE; CSBVCJBJ; 2 spiders, monkey; 14; 17.6 s | — | — | — | — |
| E182 | 394 | N6 TEN 0.85: GUST_VINE_LEAP → ROPE_SHIMMY_FRUIT_ARC; JVWJCSJV; eagle, monkey, boa; 12 + seed 3; 17.0 s | — | — | — | GUST_VINE_LEAP a third time |
| E183 | 396 | N7 KETSU 1.00: ROTTEN_BRANCH_CASCADE → MUSHROOM_EAGLE_DODGE; BJVWJBJWJ; 2 eagles, monkey, boa; 10; 16.8 s | — | — | — | 4 enemies in 16.8 s breaks its own ≥ 6.0 s spacing |
| E184 | 398 | N8 KETSU 0.25: WIND_GLIDE_DOUBLE_JUMP (victory); JWJVJ; none; 6; 8.5 s | — | W1P short cool-down | — | 8.5 s outro longer than W1P wants |
| E185 | 401-444 | Compiled entities for node 2 group 0: limb, vine (grab beat 35, release beat 36, clumsy margins 26 / 31 px PASS), gust zone (accel 0.18, catch floor w 380), creaking branch (landing beat 38, creak 20 frames, clearance 32 px PASS) | — | — | PART Trace (BT:104-128) | take-off 16 px from the edge vs TAKEOFF_SLACK 70 (physics.ts:169) |
| E186 | 446 | Verification trace: 56 moves, 0 repeated runs, 36.4% max similarity, 2.15 s max rest, 122.4 s skilled, 214.0 s first-timer, 85% petals, flow 88.4 | — | — | — | never run: the string is 57 moves, repeats JB/BJ in N1 and JJ at 3 seams, entropy 0.56 < 0.68 (checked here) |
| E187 | 450 | Token cost ∝ (context + output) x repair rounds; never have the AI emit raw geometry | yes (problem) | — | — | adopt |
| E188 | 454 | Every module < 150 lines (~1,200 tokens) plus a frozen ~100-line types.ts; two files in context | no | — | NOT (pipeline.ts 1,987; WR 1,200; BT 663) | adopt the two-file target (section 2.6) |
| E189 | 459 | types.ts: WorldProfile, StageSpec, MesoPattern, BeatTrace, DiagnosticReport | partly | — | PART gen2/types.ts (605 lines), BT types | adopt |
| E190 | 461 | prng.ts ~45 lines: mulberry32 + forkSeed(base, "node_3_enemies") so enemy edits never move platforms | — | — | IN rngFor salts (pipeline.ts:73) | have |
| E191 | 463 | topology.ts ~120 lines: 4 shapes x 8 nodes → non-overlapping boxes with anchors | yes (LS 3) | — | NOT | adopt (section 2.2) |
| E192 | 465 | deck.ts ~90 lines: lockout, bigram entropy, cross-stage n-gram repulsion | yes (LS 4) | — | PART variety.ts | extend |
| E193 | 467 | beatTracer.ts ~140 lines: stepper, ISSB folding, clumsy margins | yes (LS 5) | — | PART BT 663 lines without folding | 140 lines unrealistic |
| E194 | 469 | decorator.ts ~110 lines: roles, 70/15/15 arcs, 3 seeds, 3-tier floors | yes (LS 5 pickups, enemies) | — | PART gen2 fillSockets (pipeline.ts:1194) | adopt |
| E195 | 471 | bossBuilder.ts ~130 lines: three parallel ways to win (combat, environment trap, rhythmic bounce counter) | no | part 1 ledger (boss "Ways") | NOT (bosses hand-built, pipeline.ts:245; bossDefs.ts) | not now |
| E196 | 476-487 | Blame log in < 15 lines of JSON: module, node / group / pattern / step, violation, measured, limit, exact fix | no | — | PART BT throws a sentence (BT:445), flags {rule, what, source} (evaluate.ts:117) | adopt (section 2.5) |
| E197 | 486 | Example fix: lower doubleJumpBeatOffset 4.5 → 4.0, or fold with a switchback mushroom when dx > 430 | — | — | — | 430 px "portrait" not ours (400) |
| E198 | 489 | One-prompt repair under 500 tokens with a blame log | — | — | — | unproven |
| E199 | 489 | Auto-heal 1: short by ≤ 48 px → extend take-off +Δx/2, shift landing -Δx/2 | — | — | PART pads sized from every clumsy try (BT:402-421) | have by construction |
| E200 | 489 | Auto-heal 2: a flat or rope run over 2.5 s (75 frames) split at its middle with a beat hop or mushroom | — | W1P "never just flag it" | PART deadWalks reported (BT:589) | adopt automatic fill |
| E201 | 489 | Auto-heal 3: a repeated 3-move run at a seam → swap the next node's opening pattern for the runner-up | — | — | NOT | adopt |
| E202 | 489 | Auto-heal lifts first pass from ~80% to over 98%, zero tokens | — | — | — | unproven |
| E203 | 493 | Academic generators assume a desktop, a controller, 60 fps | — | — | — | framing |
| E204 | 497 | Fit-to-height vs fit-to-width loses half the view; a W+J gets 1.2 s lookahead sideways, 0.45 s upright | — | SR §1 | PART landingInView both views (BT:305) | measure ours before believing it |
| E205 | 497 | ISSB = a 12 x 12 tile square visible in both orientations | — | — | PART intersection 400 x 540 world px (BT:180-183) | adopt as a named constant in px |
| E206 | 497 | Camera anchor by node vector: Pokey at left 25% going east, bottom 25% in chimneys, top 30% for drops | — | camera-framing-proposal branch | PART camera looks across gaps (cameraFollow.ts:180-191) | consider; a big screen change: show Matt first |
| E207 | 501 | Gesture collision: a double-jump flick then a tap or kick at ρ > 1.2 is read as one drag | — | — | flick vs drag by speed (touchGestures.ts:8-16) | measure on our gestures first |
| E208 | 501 | The right thumb hides the bottom-right 20% upright | — | clipcheck insets (CLAUDE.md) | PART heroPad (cameraFollow.ts:190) | consider |
| E209 | 501 | Gesture cooldown: ≥ 8 frames (267 ms) after a double jump or drop before a punch or kick | — | — | NOT (no attacks in BT, BT:48) | adopt when combat is traced (section 2.16) |
| E210 | 501 | Upright: Pokey at 55% height; bottom 25% a thumb zone that never covers hazards | — | — | PART | consider; show Matt first |
| E211 | 505 | 110 BPM = 16.36 frames a beat; 16/17 alternation; 33 ms; 6-10 px of reach | — | — | 33 ms x 285 px/s = 9.5 px | true, but small against the thumb's ±100 ms; matters for beat-timed hazards and pulses |
| E212 | 505 | Tempos only where 1800/BPM or 3600/BPM is whole | — | W1P music's beat | NOT | consider within each world's range (F65) |
| E213 | 510 | World 1 Lush Floor 90.00 BPM, 20 frames, 666.7 ms | — | — | styles.ts:94 126-134 | tempo from our music; keep the whole-frames idea (F65) |
| E214 | 512 | World 2 Mud & Roots 94.74, 19, 633.3 | — | — | styles.ts:109 94-102 | tempo from our music; keep the whole-frames idea (F65) |
| E215 | 514 | World 3 Vine Gorges 100.00, 18, 600.0 | — | — | styles.ts:127 66-74, 12 time | tempo from our music; keep the whole-frames idea (F65) |
| E216 | 516 | World 4 Wind Canopy 112.50, 16, 533.3 | — | — | styles.ts:138 84-92 | tempo from our music; keep the whole-frames idea (F65) |
| E217 | 518 | World 5 Flooded Basin 105.88, 17, 566.7 | — | — | styles.ts:151 100-108 | tempo from our music; keep the whole-frames idea (F65) |
| E218 | 520 | Worlds 6-7 Silk Caverns 120.00, 15, 500.0 | — | — | styles.ts:167 86-94, :180 64-72 | tempo from our music; keep the whole-frames idea (F65) |
| E219 | 522 | Worlds 8-9 Storm Peaks 128.57, 14, 466.7 | — | — | styles.ts:195 84-92 (12 time), :207 112-120 | tempo from our music; keep the whole-frames idea (F65) |
| E220 | 524 | World 10 Final Apex 138.46, 13, 433.3 | — | — | styles.ts:220 78-84 | tempo from our music; keep the whole-frames idea (F65) |
| E221 | 529 | Bluetooth earbuds lag 120-220 ms (4-7 frames); many play muted | — | GEMINI-LEDGER F3 (bot latency only) | NOT (no offset; conductor.ts:152 latencyHint only) | adopt E222, E223 |
| E222 | 529 | Asymmetric window: -3 frames early, +6 late via longer coyote on ledges, vines, mushrooms | — | SR §2 coyote | PART coyote 133 / 167 ms (physics.ts:41-42); BT ±100 ms (BT:150) | consider a +200 ms try on Easy |
| E223 | 529 | Visual beat pulse: mushrooms squash on b-0.5 and spring on b; wind particles flash 2 beats before a gust; petal arcs pulse | — | — | NOT | adopt (section 2.11) |
| E224 | 533 | Sloth velocity paradox: a 50% slow-down with no more decisions feels like molasses (linked to the 55/100) | — | SR §0.2 | — | adopt |
| E225 | 533 | Inverse Velocity-Threat Law: slow zones never empty corridors; under a faster route (skilled leap over, clumsy trudge 3 s) or paired with a rhythmic dodge | — | — | PART tempoOf (mechanics.ts:212) | adopt as builder rule + validator flag |
| E226 | 537 | Cause-and-effect that changes the main path means 2^k layouts to check | — | part 2 ledger C15 | — | adopt the warning |
| E227 | 537 | Contain it to node-2 or node-4 bonus changes (a hazard becomes a vine or mushroom shortcut, or a hidden-find gate opens) | — | — | NOT | adopt (section 2.12) |
| E228 | 541 | A 3-5 min stage is 7,000-10,000 px across 8 nodes | — | — | not measured | check before using |
| E229 | 541 | Mounting every tile at once drops mid-range Android from 30 to 15 fps | — | PERFORMANCE-RULES | PART culling exists (bankCull.test.ts) | unverified for us |
| E230 | 541 | Mount nodes i-1, i, i+1 as containers; one atlas; ≤ 3 draw calls a node | — | — | NOT (gpuLayer stage 0, gpuLayer.ts:2-6) | later (needs node boxes) |
| E231 | 549 | Day 1 (~250 lines): types, prng, deck; 8 patterns for W4 or W5; 3 specs; wire into the tracer; 8 hours, < $3 | yes (LS build cost) | W1P starts with W1 | — | different first world (section 3.13); the order of work fits |
| E232 | 549 | Day-1 win: 10 of 10 pass on roll 1, 0 repeats, 0 dead walks, similarity ~52% → < 38% (legacy 15-50 rolls) | — | — | — | unproven; gen2 rolls a few hundred and keeps 16 (gen2/DESIGN.md) |
| E233 | 553 | Phase 2 (days 2-4): topology.ts with 4 shapes; ISSB check; decorator (70/15/15, roles, 3 tiers) | yes | — | — | adopt the order (topology before decor) |
| E234 | 553 | 4 puzzle blueprints: pulley counterweight, vine-switch gate, rotten-floor sequence, wind/water redirect | — | SR §3; 11-04 L598 | PART puzzleKit.ts rooms | consider as kit entries |
| E235 | 557 | Phase 3 (days 5-7): 10 profiles with harmonic BPMs 90-138.46 | yes (LS 2) | — | — | BPMs from music instead |
| E236 | 557 | Mutators: W4 canopy wind, W5 rising/lowering water, W6 sticky silk, W7 rolling fruit/boulders, W8 firefly sight radius | yes (LS 2) | part 2 ledger #2 | NOT as data | adopt the mutator idea; its world-to-mutator list needs our worlds |
| E237 | 557 | bossBuilder: three victory loops verified by three bot personas | no | — | NOT | not now |
| E238 | 561 | Phase 4 (days 8-10): 85 specs (~1,700 lines); 100 stages x Easy and Normal = 200 builds in Node | yes | — | — | adopt the batch check idea |
| E239 | 561 | Node chunks bound to Pixi container pools; smooth upright/sideways anchor changes at 30 fps | — | — | NOT | later |
| E240 | 566 | Target: constructive yield ≥ 85% raw / ≥ 98% healed (legacy < 15%) | — | — | — | unproven |
| E241 | 568 | Target: similarity ≤ 42% max pairwise, < 32% world mean (legacy 45-55%) | — | evaluate.ts:34 | — | measure on our metric |
| E242 | 570 | Target: 0 repeated 3-4 runs; H_2 ≥ 0.68 | — | core.ts:188-212 | PART | — |
| E243 | 572 | Target: ≤ 2.2 s max rest; 100% of slow-downs active | — | core.ts:142 (2.5) | PART | its 2.2 clashes with its 2.5 |
| E244 | 574 | Target: 120-150 s skilled, 180-300 s first-timer | — | SR §0.5 | IN | have |
| E245 | 576 | Target: 0 blind leaps upright or sideways | — | — | IN tracer (BT:443-447) on beat stages | have for beat stages |
| E246 | 578 | Target: exactly 85% single-pass petal yield | — | W1P | IN (test) | have |
| E247 | 580 | Target: flow ≥ 82 on all 100 stages (legacy ~55, the owner's rating) | — | — | NOT | its 80 vs 82 disagree |
| E248 | 582 | Target: < 1,500 tokens per new stage (legacy 40,000-150,000+) | yes (LS 0.2-0.4% of a week) | — | — | unmeasured |
| E249 | 587 | 51 works cited: Launchpad, Tanagra, Polymorph, Dahlskog, FDG 2015, Sure Footing, plus generic pages (Yarn package, Copilot template, Reddit, Bluesky, Podnews) and arXiv 2610.38987 | — | — | — | thin sourcing; academic summaries match, the % figures are unverified |
