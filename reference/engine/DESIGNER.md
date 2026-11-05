# DRAFT: a level engine for Sloths: random, fun, replayable stages built from pieces (designer, 2026-11-04, redone)

**DRAFT (the lead, 2026-11-04 9:16 PM ET):** pushed as a draft. The redesign waits for the research team's notes in
`reference/research/engine-2026-11-05/`. Sections 1-2 (the failures traced, the measurements and the calibration) are the code-side
work the lead asked to keep; sections 4-11 will be redone from the team's sources.

**Folded in (designer, 2026-11-04, 10:06-10:20 PM ET):** the research team's four notes are read in full and folded in. They are
`reference/research/engine-2026-11-05/R1-shipped-pipelines.md`, `R2-academic-pcg.md`, `R3-fun-by-math.md` and
`R4-mobile-and-architecture.md`, on branch `ccr-0d59a91c-oy3imz`, cited below as R1-R4 plus their section. Parts that still hold
are left as written. Every number or claim the notes change carries a mark in place:
- **[11-05 changed]**: a number or claim revised;
- **[11-05 overturned]**: a claim the notes show is wrong;
- **[11-05 confirmed]**: a claim a note measured again and found true;
- **[11-05 new]**: an addition the notes require.

Section 0 lists every mark in one table. The ranking of the options is re-checked in 10.0.

**What this is.** A game plan for the engine that lays out stages. Each stage is made of nodes. Each node rolls in from pieces. Every
roll is different, every roll is fun, and every roll is right the first time. There are three different ways to build it (and a wild
card), each specified far enough to build, then the one I recommend, with its data formats, its maths, its build order and the
checks that hold it. The numbers here are measured on our own physics and our own beat tracer (section 2), not taken from the
research's examples.

**Replaces** the first version of this file (withdrawn: it was written from search snippets, with lines cut short, costs guessed and
no measurement).

**Read for this, in full:** every source in `reference/research/README.md` except the two the brief barred, all six ledgers
(sections 1-7, not LEDGER-ENGINE-PAPERS §4), `reference/STAGE-RULES.md`, `src/game/physics.ts`, `beatTrace.ts` and `w1Rhythm.ts` on
origin/w1-rhythm, gen2 (DESIGN.md, types.ts, variety.ts), `tools/validate/` (core, mechanics, look, variety). Primary web sources
opened page by page (section 9). Not opened: `reference/engine/LEAD-SKETCH.md`, `reference/STATUS.md`,
`reference/CONTINUOUS-IMPROVEMENT.md`, `reference/PLAN-TO-80.md`.

Short names for cites: MR = `reference/research/MATT-RESEARCH-2026-11-04-full.txt`, GV = `GEMINI-VARIETY-2026-11-02-full.txt`,
GE = `engine-2026-11-04/GEMINI-ENGINE-ARCHITECTURE.txt`, GC = `GEMINI-CRITICAL-AGENTS.txt`, CA = `CARMO-thesis-2024.txt`,
GP = `reference/GEMINI-PCG-RESEARCH.md`, SR = `reference/STAGE-RULES.md`, LEG = `ledger/LEDGER-ENGINE-GEMINI.md`, LEP =
`ledger/LEDGER-ENGINE-PAPERS.md`, L02 / L04a / L04b = the 11-02 and 11-04 ledgers, BT = `src/game/beatTrace.ts` and WR =
`src/game/w1Rhythm.ts` (both on origin/w1-rhythm), TFDG = Smith, Whitehead, Mateas, "Tanagra: A Mixed-Initiative Level Design Tool"
(FDG 2010), LP = Smith et al., "Launchpad" (IEEE TCIAIG 2011). The FDG paper is the one LEP:16 asked to fetch; it is read here.

---

## 0. What the 11-05 research changed (every mark in this file, in one place)

| # | Where | Mark | Was | Now | Evidence |
|---|---|---|---|---|---|
| 1 | §1 failure table | new | eight failures | Three more, of the same root ("two descriptions"): (a) gen2 breaks its own "no template more than twice" rule on 355 of 368 shipped rolls, because Pass 3 fills each node to a clock; (b) WR's step proposer and the tracer model one jump two ways, so 94-95% of 1-2's rejected tries are one rule and two palette rises are never laid; (c) the validator labels most double jumps as single jumps | R1 §2 L2, §3.0 Runs C/F/H; R4 §2.2, §5.3; R3 §3 W3 |
| 2 | §2.2 rule 3, §2.3 density | changed | Normal band 0.75-1.15 / 0.45-1.15 take-offs a second, from SR:173 / GP:290 | The table behind that band contradicts itself (its bursts are slower than its own rests). World 1 Normal ships at 0.26-0.41 moves a second on the quick route, inside Easy's band, and Easy plays at Normal's tempo. The band is provisional until it is calibrated on the stages Matt ranks best. Density and difficulty become two separate dials | R3 §2 F13, §3 W1-W2 |
| 3 | §2.3 gap share | overturned | gap share γ follows tension, as a difficulty dial | Traced jumps carry almost no risk for an adult (97-100% clean, 0.00-0.03 expected falls a stage). γ shapes the look and the stride, not the difficulty. Difficulty comes from a per-node expected-falls budget and what sits on the avoided lines; a jump's own difficulty is its landing window | R4 §2.1, §5.4, §5.7; R3 §2 F1, §4.3; R2 §2 L6 |
| 4 | §2.3 rest | changed | fixed rest pad of 1.0-1.2 s Normal / 2.0-2.5 s Easy | A fixed pad cuts every World 1 Normal stage into single moves, so "groups of 5-20 s" is never measured. A rest is a gap of at least 2x the local median interval and at least 1.0 s Normal / 2.0 s Easy. Measured that way, 8 of 9 World 1 stages hold a phrase over 20 s with no rest | R3 §2 F13, §3 W1, W14, §4.5 |
| 5 | §2.3 miss cost | new | a miss cost by tension tier only | Plus a stage survival budget, E[lives] = Σ(1 − s_i) from bot rates, and a node budget for expected falls: Normal World 1 E[lives] ≤ 1.0, Easy ≤ 0.3 (estimates); intro 0, spike 0.2-0.4, climax 0.3-0.6. Practice success ≈ 0.85 / 0.92 / 0.97 | R3 §2 F1-F2, §5 items 1-2; R4 §6 idea 3 |
| 6 | §2.5 finding 5, §2.5b A and B | overturned | Easy's re-rolls show where the constraints are tight, so Easy's pieces need the strictest proof | Easy's re-rolls are mostly one mismatch: the proposer checks a rise with a full-hold jump, while the tracer also demands the short flick. 2,228 of 2,346 Easy rejections are "can't reach 80/90 px up", and those rises are laid 0 times in 16 layouts. The cause is a bug in the proposer, not a tight constraint | R4 §5.3 |
| 7 | §2.5b B | confirmed, extended | random 1.0-1.3 traces vs backtracking 6-12 on canopy nodes | Same on canopy (100% accepted). On floor nodes random accepts 56-62%: about 3-4 trace-equivalents, against 18-24 for a search that prunes on Normal and Easy prefixes. A naive search fails 5-7 of 20 runs. A search pays only once pins, rise targets or kind quotas are added | R2 §4 output and "What it shows" 5-6 |
| 8 | §2.5b C | confirmed, cause found | 13 of 56 kinds of node; 256 of 272 run right | A stage speaks 8-9 landing words, and the two commonest are 39-48%. 66% of 1-2's landings zigzag up and down, because every hop in the palettes goes down and the floor band is 100 px. The canopy palette has one surface. One rhythm admits 3,366 to about 290 million geometries in 1-2 kinds per take-off | R2 §2 L1, §4 experiments 1-2; R4 §5.5 |
| 9 | §2.6 variety maths | changed | measured on the validator's move 3-gram cosine; floor 8 moves, 4 rooms per job | The cosine sits at 0.00-0.10 between every World 1 neighbour while Matt says everything feels the same, so it cannot see the sameness. The floor of 8 moves stands as a floor. The measure becomes kinds per take-off, plus a kind-string compression distance calibrated on our string lengths (self ≈ 0.09, shuffle ≈ 0.62), plus tempo, leniency and look | R3 §3 W11, §2 F7; R2 §5 ideas 1, 8 |
| 10 | §2.6 point 3, §5.1 step 3, §10.2 | changed | 28 rooms a world (4 per job); drop A if a world needs more than about 45 | Shipped pools run several times the slots. Super Meat Boy Forever has 70-100 chunks for 8 used; Spelunky 8-16 per room type; Barrett: "make 81". What binds is the count left per phase after the teaching cut: gen2 has as few as 1-4. Coverage is now counted per (job x phase after teaching) at no fewer than 2 eligible rooms a slot (estimate). A world target is about 50-70 rooms, and the drop condition counts minutes per room, not rooms | R1 §2 L3, §3.0 Run H, §3.3; R4 §2.3 |
| 11 | §3 SMBF row | changed | "40-60 chunks per level" | 40-60 was 2017; later 70-100 per level for 8 used, no chunk repeated across a save, a chunk rated by its par and difficulty, and critics on mismatched neighbours and a diluted finish | R1 §3.3 |
| 12 | §3c (new) | new | — | Rhythm as every stage's frame: Nintendo prototyped and dropped it; a music-driven runner study found every-beat-a-jump monotonous. An open direction question for Matt, not a ruling | R1 §5 item 14, §3.10; R2 §2 L8, §3.18; R4 §3 Alto's |
| 13 | §5.1, §5.5, §11 | new | room fields and stage check | Every room gets per-step kinds, cost and risk measured by bots (not the author), a wait mark, a cadence kind and rarity/position tags. Teach rooms must pass a limited-agent gate. Stages need a validation beat, a named signature, and a ramp-and-cool cadence. Each node gets its own RNG stream (stability under edits) | R1 §2 L4-L6, §4 ideas 2-3, 9; R2 §2 L5, §5 ideas 2-3, 5-6; R4 §6 ideas 7, 9 |
| 14 | §5.7 seams | changed | the shared flat apron is the only universal piece, and safe | Safe still (Barrett's edge contract), but a single cadence: every node ends the same way. Cadence kinds become small proven rooms | R2 §3.2, §5 idea 6; R4 §4 Noita/Barrett |
| 15 | §6.2 B's spec | overturned | "length: solve until skilled clock >= 135 s" | That is the clock-filling that makes gen2 repeat; length comes from the node count | R1 §2 L3 |
| 16 | §7 C | changed | bots judge the archive | The two bots disagree on which stage is hard; the adult bot's thumb is steadier than any measured human; no bot is fitted to recorded play. C cannot be trusted to judge fun until the bots are calibrated. Its archive survives as A's coverage tool | R3 §3 W6, W13; R4 §2.7 |
| 17 | §10 ranking | re-checked: same order, C weaker, A changed | A, then B, C, D | A stays first and the evidence for it is stronger. B stays second, as a hole-filler under pins. C drops from "an option" to parts inside A. See 10.0 | all four |
| 18 | §10.3 "music's score as the layout" | reopened | rejected: the music changes per session | Our themes are symbolic, so take-offs could sit on a selection of the stage theme's own onsets. Whether a stage's theme is fixed needs a check against LEG:415 before this stays rejected | R2 §3.20, §5 idea 12 |
| 19 | §11.3-11.4 | new | build order and gates | Step 0 (any option): one reach predicate shared by proposer and tracer, with a test; a rejection and coverage report; one double-jump rule in the validator. New gates: kind count, limited agent, risk budget, never-laid option, relative group boundary, a stage catalog diffed in CI | R4 §6 ideas 1-2, 11; R3 §3 W3; R2 §5 ideas 1, 3 |

---

## 1. The problem, as an outsider would put it

1. A phone platformer needs 85 more stages; making 5 cost about 8-10% of a week's AI budget and over 12 hours.
2. Stages are either hand-written one by one in code, or rolled by the hundred and filtered; both leak bugs a player sees.
3. Players rate it 55/100 because stages and worlds feel the same: the same few moves, the same direction, the same look.
4. The owner wants stages that roll in fresh from pieces every time, are fun every time, and are right the first time.
5. So the real job is an engine where a stage is a short description plus maths, and the pieces are proven before they are used.

**Today's eight failures, traced to their cause in the code** (each is a test case every option below must make impossible):

| Failure | What happened (commit) | Root cause |
|---|---|---|
| Petals 70/15/15 the shape couldn't hold | 1-2 built as about 81/15/4 after the petal pass (5ef13375); "a split that can't hold its roads re-rolls" (04646306); the bough "can't hold the low road" on rolls 3 and 13 (272b7454) | Petals are placed by a separate pass AFTER the layout, so the layout never promised the space. Launchpad says it outright: games where collectibles are a goal should place them "during geometry generation, rather than as decoration after the fact" (LP §IV.E) |
| Branches floating in mid-air | 48 of 104 boughs floated on 1-1; "a bough no kapok holds grows from a slimmer tree of its own" (1bfe7a42) | No piece carries what holds it up; art is added after geometry |
| One decoration sprite on every piece | every bough "tucks into a leafy clump (World 1's painted bush) at the other" end (f46e68b7), fixed with "three foliage pieces ... flipped and sized at random" (1bfe7a42) | Dressing is a per-piece rule with no stage-wide budget |
| A stage too like the one before (two move types, a repeat by chance) | 1-5's "long wait, onto a short twig, quickly off it" motif "found four times over", fixed by decks with a lockout (acd556ab); 1-3 pulled away from 1-1/1-2 (1496e5e3) | Steps drawn at random from a small palette (WR:149 `fitSteps`, up to 160 random tries); likeness to the neighbour measured only after |
| Easy never reaching the builder | Easy passed to a builder only if the stage is on a list, `EASY_BUILT` (stageGenerator.ts:2841, 82171ab8, 2e5013fe); the rest are softened after building (easyMode.ts) | Difficulty is opt-in plumbing, not an input every pass must take |
| Two copies of the same placement tool | three `splitPetals` (protoStage.ts:409, WR:391, w1Rise.ts:511; "w1Rise's splitPetals as splitPetals11 beside 1-3's", 310de821); two beatTrace.ts copies on two branches (LEG:417-419) | Parallel helpers each write their own; nothing owns a job |
| The checker treating hop/jump/double as one move, and ignoring direction | grams folded j, Q, U into J (core.ts before d42b4400); direction added to repeats only for beat stages (c9e385ff) | The checker has its own vocabulary, re-derived from the built stage, separate from the builder's |
| A route that walked through solid ground, hiding 20 s | "1-2's route fell through its bough past the trunk and skipped 20 s of play" (abd5a588) | The checker's route is its own approximation of movement, not the builder's planned route |
| **[11-05 new]** The same template over and over in one stage | 355 of 368 shipped gen2 rolls (Worlds 5-8) use a template 3+ times, against STAGE-RULES §0c.2's "no more than twice". The worst is 14 times (8-9, `w8-guard-night`). With a cap of 2, none of 48 rolls of 6-2, 8-6 and 8-9 builds (R1 §3.0 Runs C, F) | Pass 3 fills each node "until its share of the seconds is met" (`pipeline.ts:702`). After the archetype and the teaching order, only 1-4 templates are left per phase (R1 §3.0 Run H). The rule and the builder disagree about where length comes from |
| **[11-05 new]** Dice spent on options that never land | 94-95% of 1-2's rejected tries are "a clumsy jump (air 1) can't reach 80/90 px up". Those two rises are laid 0 times in 16 layouts (R4 §5.3) | The proposer (`fitSteps` `fits`, WR:169-171) checks a rise with a full-hold jump; the tracer also demands the short flick (BT `TRIES` row 7). Two models of one jump |
| **[11-05 new]** Double jumps counted as single jumps | J steps that need the double, by the validator's own reach rule: 1-1 14 of 15, 1-6 27 of 34 (R3 §3 W3) | The inspector's route has no double kind (`tools/inspect/route.ts:23`); `toSteps` relabels only Q. Failure 7 above is not fully closed |

Four of the eight share one root: **two descriptions of the same stage that are allowed to disagree** (the layout vs the petal pass,
the builder's moves vs the checker's letters, the builder's route vs the inspector's route, Easy vs Normal). Two more are **pieces
with no contract** (nothing says what holds a branch up or what art it may wear). One is **chance doing design work** (random steps),
one is **ownership** (copies). An engine that fixes these has: one description of a stage that every pass reads; pieces that carry
their own contract and proof; randomness only inside proven ranges; one owner per job.

**[11-05 confirmed]** The three failures the notes added are all the first root, two descriptions that may disagree: the rule vs the
filler, the proposer vs the tracer, the validator vs the inspector. The new countermeasure for all three is the same: one function
that both sides call, with a test that asserts they agree (R4 §6 idea 2).

---

## 2. The maths of a stage, measured on our physics

A stage is laid out by equations. Every option below uses these; they differ in who picks the pieces and when the rules act.

### 2.1 The reach envelope (beatTrace `flight`, engine rules, 1/60 s slices, take-off at full run 285 px/s)

Horizontal px from take-off to where the feet come down through a surface `dy` px above the take-off. "Clumsy" is the tracer's
clumsy thumb (85% air speed). Easy holds a jump 70% (physics.ts EASY_HOLD). Measured by `reference/engine/designer-measure.ts.txt`.

| dy | hop | jump | double | jump Easy | double Easy | jump clumsy | double clumsy | jump air s | double air s |
|---|---|---|---|---|---|---|---|---|---|
| -240 | 193 | 260 | 370 | 234 | 341 | 221 | 314 | 0.91 | 1.30 |
| -120 | 157 | 224 | 334 | 198 | 305 | 191 | 284 | 0.79 | 1.17 |
| -40 | 128 | 200 | 310 | 171 | 281 | 170 | 263 | 0.70 | 1.09 |
| 0 | 109 | 185 | 298 | 154 | 269 | 157 | 253 | 0.65 | 1.04 |
| +40 | 77 | 167 | 285 | 131 | 254 | 142 | 242 | 0.59 | 1.00 |
| +80 | - | 141 | 270 | - | 236 | 120 | 229 | 0.50 | 0.95 |
| +100 | - | 115 | 261 | - | 225 | 98 | 222 | 0.40 | 0.92 |
| +140 | - | - | 239 | - | 187 | - | 203 | - | 0.84 |

What it means for layout: a level jump spans 157-185 px (clumsy to clean): a 28 px spread in reach alone, before take-off timing. A
hop can't climb past about +40; a jump past about +100 (Easy +60); a double past about +140. The double adds about 113 px on the flat.
These are the only legal (dx, dy) pairs any engine may place, per move and per setting.

**[11-05 changed]** "Legal" must be one function that the proposer, the prover and the tracer all call. This table is a measurement
of that function, not a second copy of it. R4 §5.3 shows what a hand copy does: a proposer that tested only the full hold spent
94% of 1-2's dice on 80-90 px rises the tracer refuses, because the tracer also tries the short flick (hold 0.8). A second hand
copy, written to fix it, still drifted at 80 px. The clumsy column above is the 85%-air try only; the binding row for a rise is
the short-flick try.

### 2.2 The beat grid per world (the music's own tempo range, src/audio/styles.ts via LEG:203-207)

| World | BPM | eighth (s) | run px per eighth | a jump spans (eighths) | a double spans | whole frames per beat at (BPM) |
|---|---|---|---|---|---|---|
| 1 | 126-134 | 0.231 | 66 | 2.8 | 4.5 | 128.57 (14 f), 133.33 (13.5) |
| 2 | 94-102 | 0.306 | 87 | 2.1 | 3.4 | 94.74, 100, 97.30 |
| 3 | 66-74 (12-time) | 0.429 | 122 | 1.5 | 2.4 | 66.67, 69.23, 72 ... |
| 4 | 84-92 | 0.341 | 97 | 1.9 | 3.1 | 85.71, 90, 87.80 |
| 5 | 100-108 | 0.288 | 82 | 2.3 | 3.6 | 100, 105.88, 102.86 |
| 6 | 86-94 | 0.333 | 95 | 1.9 | 3.1 | 90, 87.80, 92.31 |
| 7 | 64-72 | 0.441 | 126 | 1.5 | 2.4 | 64.29, 66.67, 69.23, 72 ... |
| 8 | 84-92 (12-time) | 0.341 | 97 | 1.9 | 3.1 | 85.71, 90, 87.80 |
| 9 | 112-120 | 0.259 | 74 | 2.5 | 4.0 | 112.5, 120, 116.13 |
| 10 | 78-84 | 0.370 | 106 | 1.8 | 2.8 | 78.26, 81.82, 80, 83.72 |

Three consequences no research text gave us:
1. **The same piece plays differently in every world, for free.** A bar of `x...x...` is a jump every 0.46 s in World 1 and every
   0.88 s in World 7. Run distance per eighth goes 66 to 126 px. The same written piece is a sprint in World 1 and a measured stride in
   World 7. That is variety by maths, not by authoring.
2. **What a bar may hold depends on the world.** A jump needs 2.8 eighths of air in World 1 but 1.5 in World 7, so World 7 allows a
   jump on every quarter and World 1 does not. Each piece carries a tempo range it is proven for (section 2.4).
3. **Density must be written in actions a second, never marks a bar.** `x...x...` is 1.08 take-offs a second in World 1 (inside the
   Normal band 0.75-1.15, SR:173) but 0.57 in World 7 (a near-rest). A piece is filtered by its density at the stage's tempo:
   ρ = marks per bar x BPM / 240.
   **[11-05 changed]** The band itself is not sound. GP:290's table puts 8-12 actions in 10-14 s, which is 1.33 s between moves:
   longer than its own 1.0-1.2 s rest. Eight actions in 14 s with a rest averages 0.53 a second, under its own 0.75 floor (R3 §2
   F13). What ships is lower still. World 1 Normal runs 0.26-0.41 moves a second on the quick route outside 1-5 (0.68) and 1-8
   (0.80), which is inside Easy's band (R3 §3 W2, §4.1). (R3 counts a whole stage on the quick route with small hops left out; 2.5
   below counts take-offs inside a node's own seconds, so the two numbers differ by the rests and are both true.) The rule
   "density is written in actions a second at the stage's tempo" stands. The numbers in the band are provisional.

Worlds 3 and 8 are in 12-time; the tracer's bars are 8 eighths (BT:200-205 throws otherwise; LEG:349-350). Every option needs a
12-slot bar for those two worlds.

### 2.3 Every number of a node from one formula

For node i with tension T_i ∈ [0, 1] on setting D (Normal or Easy), in world w at tempo b:

- **Density** ρ_i = ρ_min(D) + (ρ_max(D) - ρ_min(D)) · T_i, with our bands: Normal 0.45-1.15 (intro 0.45-0.60 as shipped, 2.5;
  top from SR:173), Easy 0.35-0.55 set on its own (never Normal's beats with narrower gaps: 2.5 finding 1), a chase up to 1.4
  (SR:173). Marks per bar = ρ_i · 240 / b, rounded to a legal mark pattern.
- **Gap**, as a share of the clumsy reach R_c(move, dy, D) from table 2.1: W_gap = R_c · (γ_min(D) + (γ_max(D) - γ_min(D)) · T_i),
  **calibrated on what shipped (2.5): Normal γ 0.35-0.75, Easy 0.25-0.50**. (GE:167-169 gives the form; its own shares were tighter
  than anything QA has played.) The spread of γ inside a stage is checked (p10-p90 at least 0.25 wide on Normal). The tracer then
  sizes the ledges (BT: shortest-to-longest clumsy landing + INSIDE 8 + SLOP 10, minimum 90 px).
  **[11-05 overturned] γ is not a difficulty dial.** Under Isaksen's measured human timing spread (σ 36-61 ms), every traced
  take-off of 1-2 and 1-5 lands 97-100% of whole-stage runs with no fall: 0.00-0.03 expected falls (R4 §5.4). The real-engine
  first-timer lost no heart and no life on 1-2 Normal in two runs, despite 14-19 failed jumps each (R4 §5.7). The tracer makes
  geometry safe by construction, so γ shapes the stride and the look only. The risk the model does find is the kid's late thumb on
  short hops onto narrow pads (27-37 px gaps; 0.98-1.58 expected falls on 1-2 Easy). The bots' misses are mostly "overshot the
  landing", not a late take-off (R3 §4.3). So a jump's difficulty number is its **landing window**: the pad's spare width over the
  tracer's (longX − shortX), plus the take-off ledge's spare run in ms. BT already computes both, as `Landing.shortX/longX/lateX`,
  and uses them only as pass/fail (R2 §2 L6, §5 idea 10).
- **Rest** after a group: Normal 1.0-1.2 s, Easy 2.0-2.5 s (SR:173), in px = 285 · seconds (285-340 px Normal).
  **[11-05 changed]** A fixed pad cannot find groups. With it, World 1 Normal's biggest group is 1-4 moves, so every stage reads as
  single beats with rests and `GROUP_MAX = 20` cannot fire (R3 §3 W1, W14). The boundary is relative: a gap is a rest when it is at
  least 2x the median of the 3 intervals each side **and** at least 1.0 s Normal / 2.0 s Easy (R3 §2 F13). Measured that way, phrases
  are 5-12 moves and 4-24 s, but 8 of 9 World 1 stages hold one phrase over 20 s with no rest (R3 §4.5). The 2x ratio is a choice,
  to calibrate on the stages Matt ranks best paced.
- **Miss cost** by tension: T ≤ 0.45 a catch (no life), 0.45-0.8 a setback or a heart, above 0.8 a life on Normal (GE:237's tiers, our
  validator's FALL_BITE_PX 200 / 4 s, mechanics.ts:109-110). Easy one tier softer, never "nothing" after the first teach.
- **[11-05 new] Risk budget**, the second dial. Density says how much the thumb does; the risk budget says what a miss costs, summed
  over the stage. Per challenge i with bot success s_i: E[misses] = Σ(1 − s_i), E[lives] = Σ(1 − s_i)·[a miss costs a life],
  P(clean) = Π s_i (R3 §2 F1). Per-jump floors (70% / 85%, SR:148) do not bound a stage: 32 life-costing jumps at the 70% floor
  would be 9.6 expected lives (R3 §3 W4). These first budgets are estimates, to tune on Matt's play:
  - stage: Normal World 1 E[lives] ≤ 1.0, rising about 0.5 a world; Easy ≤ 0.3 (R3 §2 F1);
  - node expected falls on Normal: intro 0, spike 0.2-0.4, climax 0.3-0.6 (R4 §6 idea 3);
  - success targets: first test of a new move ≈ 0.85 Normal / 0.92 Easy, the teaching beat ≥ 0.97, practised moves ≥ 0.95 (R3 §2 F2:
    between Wilson's learning optimum and Lomas's finding that easier play is played longer).

  The two dials are set separately. The way to raise density without raising risk is lenient actions: hops, petal arcs over safe
  ground, rides and animal tricks (R3 §3 W2).
- **Enemy spacing**: none within 150 px of a landing (mechanics.ts:247), none on a rest, at least 35% of nodes animal-free (MR:481-484).
- **Liana period** locked to the beat: period = k · beat with k chosen so it lands in [2.6, 3.4] s (our calm swing is 2.85 s Normal,
  3.3 Easy, physics.ts:453, 471). At 130 BPM 6 beats = 2.77 s; at 68 BPM 3 beats = 2.65 s. Then a liana leap lands on the beat like a jump.
- **Stage length**: T_skilled = Σ_nodes Σ_bars (240/b) + Σ waits ≥ 120 s, target 150 s (SR:36-38). That is about 65 bars at World 1's
  tempo and 34 at World 7's: a World 7 stage has half the bars, each twice as long.
  **[11-05 changed]** Length is the sum of the units' clocks, never a clock to fill. Filling to a clock from too few units is what
  makes gen2 repeat (R1 §2 L3). If Σ falls short, the engine names the missing rooms and refuses; it never adds a repeat.

### 2.4 Proof of the core claim: pieces written as beat data survive every tempo

Eight small pieces of the kind WR builds (bars + steps), each traced at every whole BPM of every world's range, Normal and Easy (1,408
traces, `beatTrace.traceNode` + `checkTrace`):

| Piece | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 |
|---|---|---|---|---|---|---|---|---|---|---|
| march: 4 level jumps | 18/18 | 18/18 | 18/18 | 18/18 | 18/18 | 18/18 | 18/18 | 18/18 | 18/18 | 14/14 |
| stairs: 3 jumps +40 | all | all | all | all | all | all | all | all | all | all |
| swung: hop then jump, twice | all | all | all | all | all | all | all | all | all | all |
| double over a pit, then drop | all | all | all | all | all | all | all | all | all | all |
| drop down x3 | all | all | all | all | all | all | all | all | all | all |
| half notes with a double | **7/18** | all | all | all | all | all | all | all | all | all |
| busy: 4 hops on quarters | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| crumble run: 4 equal jumps | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

- 6 of 8 pieces trace clean at every tempo of every world, Normal and Easy. **A piece written as beats, not pixels, is portable.**
- The two that fail everywhere are bad pieces, and the tracer says why: "the gap is N px: no jump at all" (176 traces) and "the
  same gap N times in a row" (176, the research's own rule, MR:585, BT GAP_REPEAT). They are rejected at authoring, never at play.
- "Half notes with a double" fails only at World 1's fast tempo (11 x "still in the air from the last take-off"): the double needs
  4.5 eighths there and the half note gives 4. That is exactly what a per-piece tempo range catches.

This is the single most important measurement in this file: it says the unit can be **proven once, over a range, and reused safely
anywhere in that range**. The three options below all lean on it.

**[11-05 confirmed]** R2 §4 measures the same thing from the other side. On 1-2's canopy nodes, 100% of the step lists the proposer
can draw pass the full tracer, the Easy trace and `checkTrace` (exhaustive over 3,366 and 3,930 sequences). Adding crumble and stump
to the palette kept acceptance at 99-100% (R2 §4 experiment 3). Physics is not what limits a well-written piece; the palette is.

### 2.5 Calibration: what our own hand-tuned beat stages actually ship

`rhythmLayout` (WR) for 1-2 (128.2 BPM) and 1-5 (136.0 BPM), 16 layouts each, Normal and Easy, read node by node
(`reference/engine/designer-calib.ts.txt`). These are the numbers that passed the gates today, so the formulas start from them.

| | 1-2 Normal | 1-2 Easy | 1-5 Normal | 1-5 Easy |
|---|---|---|---|---|
| nodes a stage | 17 | 17 | 10 | 10 |
| expert clock (s) | 157-180 | 154-190 | 170-177 | 157-163 |
| re-rolls needed a layout (random step search) | mean 0.06, max 1 | mean 0.50, max 3 | 0 | 0 |
| intro density (take-offs/s) | 0.56 | 0.56 | 0.57 | 0.57 |
| ramp density mean (range) | 0.62 (0-1.20) | 0.61 (0-1.20) | 0.59 (0-0.83) | 0.66 (0-0.96) |
| spike density | 0.48 (0-1.25) | 0.51 | 0.87 | **0.99** |
| climax density | 0.49 (0-1.07) | 0.50 | 0.89 | **0.96** |
| gap / clumsy reach: p10, median, p90 | 0.19, 0.45, 1.43* | 0.15, 0.26, 1.44* | 0.49, **0.52**, 0.55 | 0.30, 0.34, 0.38 |

(* above 1.0: a vine, a drop or a bounce, which this proxy reads as a jump.)

What it says:
1. **1-5's Easy is denser than its Normal** (spike 0.99 vs 0.87, climax 0.96 vs 0.89 take-offs a second), about twice the Easy band
   (0.35-0.55, SR:173). Easy narrows the gaps (median 0.34 vs 0.52) but keeps every beat, so it asks for more inputs a second, not
   fewer. This is the Easy failure in another form, found by measuring, and the formula must set Easy's density from its own band.
   **[11-05 confirmed, wider]** It holds across World 1: Easy's median gap between moves is within 0.5 s of Normal's on every stage
   (R3 §3 W2, §4.2). And Easy can be harder than Normal on the bots. On 1-1, the Easy kid's P(no costly miss) is 0.61 against the
   Normal adult's 0.75, and one 1-1 Easy jump (x 29277) succeeds in 6% of 200 trials (R3 §3 W5, §4.3). Whether that jump is real is
   still open, because the two bots disagree on it (R3 §4.7).
2. **1-5's gaps are all the same share**: 80% of its gaps sit between 0.49 and 0.55 of the clumsy reach. A stage can pass every rule
   and still feel like one jump repeated. The engine must make the gap share follow tension (2.3) and the checker must report its
   spread (target: p10-p90 at least 0.25 wide on Normal).
3. **The intro is 0.56-0.57 a second in both stages**, above the research's 0.4 (MR:529) but well under the validator's 0.8 intro cap.
   I take 0.45-0.60 as the intro band: the research's number is a floor, ours shipped.
4. **The shipped Normal gap shares are 0.45-0.55, Easy 0.26-0.34.** So the gap band in 2.3 is recalibrated: **Normal 0.35-0.75,
   Easy 0.25-0.50** of the clumsy reach, by tension (my first draft's 0.55-0.90 would have made every Normal gap tighter than anything
   QA has played).
5. **Random step search needs re-rolls** (1-2 Easy up to 3 per layout, WR:149), and 1-2 throws "no steps fit" if the tempo is wrong
   (it did when this script first read the wrong BPM). Written pieces never re-roll: they either prove over their range or they don't.
   **[11-05 overturned, the cause]** The re-rolls do not mean the constraints are tight. 94.4% of 1-2 Normal's rejected tries and
   95.0% of Easy's (2,228 of 2,346) come from one rule, "a clumsy jump (air 1) can't reach 80/90 px up". The proposer offers rises
   the tracer always refuses, and those rises are laid 0 times in 16 layouts (R4 §5.3). 1-5's few rejections are all GAP_REPEAT, a
   variety rule. The conclusion holds and gets stronger: written pieces never re-roll. The proposer should call the tracer's own
   reach test.

### 2.5b Each option's core idea, run on real stage 1-2 (`reference/engine/designer-cores.ts.txt`)

**A's core (a piece proven over a tempo range stays valid):** 1-2 built by WR at every whole BPM of World 1's range, 16 layouts each:

| BPM | Normal built (re-rolls) | Easy built (re-rolls) | Normal expert clock (s) |
|---|---|---|---|
| 126 | 16/16 (1) | 16/16 (8) | 159-183 |
| 128 | 16/16 (1) | 16/16 (9) | 157-180 |
| 130 | 16/16 (0) | 16/16 (17) | 155-181 |
| 132 | 16/16 (0) | 16/16 (17) | 150-179 |
| 134 | 16/16 (0) | 16/16 (17) | 149-177 |

The real stage's nodes are portable across its world's tempo range: every layout builds at every tempo. Two costs show: **Easy leans
on re-rolls** (8-18 across the 16 layouts, against 0-1 on Normal), so Easy's pieces are where the proof must be strictest; and **the
clock falls about 10 s from 126 to 134 BPM**, so a stage's length must be checked at the fast end of its tempo range, not its middle.
**[11-05 overturned]** The first cost was misread. Easy's 8-18 re-rolls are the proposer's dead 80/90 px rises, not a tight Easy
(R4 §5.3, and 2.5 finding 5 above). Easy still needs its own proof, but this table is not evidence that its pieces are fragile.

**B's core (search instead of random steps):** for four 3-bar nodes of 1-2's kind (canopy branches, WR's PAL_A palette), random step
lists found a clean trace in **1.0-1.3 traces** on average (20/20 within fitSteps' 160), while backtracking on traced prefixes used
**6-12**. With a palette this forgiving, random search is not slow, and B's search buys nothing on cost. So the problem with
`fitSteps` is not wasted work; it is that chance decides the motif, which is how 1-5's "long wait, onto a short twig" came back four
times (acd556ab). This weakens B's case and my own first-draft claim that search would be "faster and exact": a search is needed only
where constraints are tight (the Easy re-rolls above), and what random needs is control (decks with a lockout), not replacement.
**[11-05 confirmed, extended; one example withdrawn]** R2 §4 measured the same on canopy nodes and added the floor. On the floor,
random accepts 56-62% a try (about 3-4 trace-equivalents a node). A search that prunes on both Normal and Easy prefixes found an
answer 60 of 60 times in 18-24 calls; one that prunes on Normal alone failed in 5-7 of 20 runs, because Easy and `checkTrace` only
bite at the leaves. So a search is worth it only once the constraints get tight: pinned moments, a rise or fall target per node,
kind quotas. When it is used, it must check every rule on prefixes. "The Easy re-rolls above" is withdrawn as an example of tight
constraints (R4 §5.3).

**C's core (an archive of kinds):** 1-2's 272 nodes over 16 layouts, binned by direction x density band x job: **13 of 56 cells
filled, and 256 of 272 nodes run right** (the only left nodes are the bough leg's counter-melody). The 16 layouts differ in detail
inside the same 13 kinds. This is the measured form of "the rolls barely differ" (SR:303): replay variety today comes from the details
of the same kinds of node. Any option must change the KIND of node per roll (direction, density band, job's room), and C's archive
is the one tool that would show it. Whatever engine is chosen, this binning belongs in its gates.
**[11-05 confirmed; the cause found]** By landing kind (surface x up/flat/down), a whole beat-built stage speaks 8-9 words, and its
two commonest are 39-48% of all landings (R2 §4 experiment 2). The pattern players see is a zigzag: 66% of 1-2's consecutive
landings flip up/down, against about 42% if the directions were independent. It has two causes in the palettes:
- every hop goes down (`hopDy [-40, -30, -20]`, WR:478, 606, 707);
- the floor band is 100 px, so after one or two rises the only fit is down.

Among roll-to-roll distances, "what he lands on" is the smallest part, because the canopy palette has one surface, `['branch']`
(R4 §5.5). One rhythm admits millions of geometries (about 3.0 million for the 9-take-off intro), but only 1-2 kinds per take-off
on the canopy and 5 on the floor (R2 §2 L1, §4). The rolls vary numbers; players see kinds.

### 2.6 How many pieces a world needs: the variety maths

The question "how many rooms per world?" answered with the validator's own measure (cosine of move 3-gram counts, core.ts:221-237;
neighbour limit 0.45, evaluate.ts; any earlier stage 0.55, core.ts:237). A world of 9 stages, 8 nodes each, each node drawn from a
deck of K rooms for its job, a room used in at most 3 stages, half the rooms mirrored; optional hazard blocks that change one move in a
room to another move of the world. 60 worlds simulated per row (`reference/engine/designer-varsim.py`).

| moves a world can tell apart | rooms per job K | hazard blocks | neighbour stages alike (> 0.45) | stage alike an earlier one (> 0.55) |
|---|---|---|---|---|
| 5 | 1 | 0 | 96% | 99% |
| 5 | 4 | 0 | 22% | 28% |
| 5 | 4 | 8 | 9% | 5% |
| 5 | 12 | 8 | 4% | 1% |
| 8 | 1 | 0 | 84% | 93% |
| 8 | 2 | 0 | 26% | 38% |
| 8 | 3 | 8 | 0% | 0% |
| 8 | 4 | 0 | 4% | 1% |
| 12 | 3 | 0 | 6% | 4% |
| 12 | 4 | 8 | 0% | 0% |

What it says:
1. **The number of moves a world can tell apart matters more than the number of rooms.** With 5 move kinds (a run-and-jump world:
   Matt's own complaint), even 12 rooms per job leaves 4-6% of neighbours alike; with 8 kinds, 4 rooms per job is enough. A "move"
   here is what the validator's rhythm token counts: the move, its note value and its direction (core.ts:206-219), so direction and
   the beat multiply the alphabet for free (the ledger's L02 item 4).
2. **Hazard blocks are the cheapest variety per hour of work** (Kazemi's finding, reproduced): at 5 move kinds and 4 rooms per job,
   8 hazard blocks cut alike neighbours from 22% to 9%.
3. **So each world's library is: at least 8 distinguishable moves, at least 4 rooms per job (7 jobs: 28 rooms), at least 8 hazard
   blocks, and one hero room per stage (9).** That is the coverage target in option A, from maths rather than a guess.
4. **The limit of this maths**: synthetic rooms, and a measure gen2 already beat while its worlds still felt alike (SR:335-339,
   LEG:420-421). It sets the floor, not the bar. The look-alike measure (SR:176, 0.30) and the quality supervisor's in-order play stay
   the judge.

**[11-05 changed] What this simulation can and cannot claim.**
- **Point 1 is confirmed from three sides.** R2 §2 L1: the sameness is in the vocabulary, not the dice. Launchpad's grammar offers
  14 jump kinds and 5 move kinds; Dahlskog's concatenation generator varied only by "different height, different length, amount of
  rewards, amount of risk", which is our 1-2.
- **The measure it ran on is blind to what Matt feels.** The validator's move 3-gram cosine is 0.00-0.10 for every World 1
  neighbour pair, and compression distance 0.64-0.85 sits at the shuffle baseline: by move order no stage resembles its neighbour.
  Yet the complaint is "everything feels the same" (R3 §3 W11). The known list agrees: "one tempo" is flagged on all 16 layouts of
  all 9 stages in both settings, and "like the stage before" on one layout of one stage. So the alike-percentages in the table are
  an upper bound on one kind of sameness only, and a zero is not a pass.
- **The gate becomes four numbers:**
  1. kinds per take-off in each node's valid space (at least K) and in the chosen roll (at least M) (R2 §5 idea 1);
  2. compression distance of the stage kind strings across a world, judged inside our calibrated range (self ≈ 0.09, own shuffle
     ≈ 0.62; R3 §2 F7);
  3. tempo and density per stage (R3 W2, W11);
  4. leniency and the look.
- **Novelty is a band, not a cap.** Too similar bores, too different reads as "odd connections"; set the band from Matt's favourite
  stages (R3 §2 F7, Shu et al.).

**[11-05 changed] Point 3's room count is a floor, not the target.**
- **The arithmetic floor.** A world of 9 stages x about 8 nodes is about 72 slots. With no room twice in a stage and none in more
  than 3 stages (SR §0c.2, §0c.4), 4 rooms per job is only about 1:1 with the slots.
- **Shipped games run well above 1:1.**
  - Super Meat Boy Forever: 70-100 chunks per level for 8 used, about 10:1, and no chunk shown twice in a save (R1 §3.3).
  - Spelunky's Mines: 8-16 templates per room type, plus 26 obstacle blocks (R1 §3.1).
  - Leap Day: 700-800 chunks, in daily themed pools (R4 §3).
  - Barrett, on tile sets: "if you thought you wanted about 64... just make 81" (R4 §2.3).
- **What binds is the count per phase after the teaching cut.** gen2's kits hold 15-76 templates, but a stage can use only 8-18,
  and as few as 1-4 per phase (R1 §3.0 Run H).
- **So coverage is counted per (job x phase x lessons taught so far):** at least 2 eligible rooms per slot (estimate, half-way to
  SMBF's 10:1). A world's target is about 50-70 rooms, plus hazard blocks and hero rooms.

This replaces "28 rooms" as the plan's number. Matt's "more pieces" rule says the count is the point, not a cost to avoid.

---

## 3. Ten platformers, read for how their levels are made

Primary pages were opened and read for: Spelunky (Kazemi's two generator lessons), Dead Cells (Bénard's dev diary), Super Meat Boy
Forever (Refenes' interview; Nintendo Life's review), BIT.TRIP RUNNER (Ludus Novus "One Measure"; Neuse's IGF interview), Geometry
Dash (RobTop's editor guide), Badland (Frogmind interview), Tiny Wings (TouchArcade review), Jetpack Joyride (GDC summary), Pizza
Tower (PC Gamer review), New Super Mario Bros. 2 (Game Informer review), Rayman Legends (Dumas interview), and Hayashida on Super
Mario 3D Land. Eight of these games are named nowhere in our research files (Geometry Dash appears only as a Reddit link, GV:181 #30).
Three were picked because critics called them repetitive: Super Meat Boy Forever, New Super Mario Bros., Jetpack Joyride.

| Game | What was data | What was code | What it teaches this engine |
|---|---|---|---|
| **Spelunky** | 4 room types by guaranteed exits; 8-16 templates per type, 10x8 tiles; probabilistic tiles ("4" = 25% pushblock); 5x3 "obstacle blocks" filled from their own small library; random mirroring (Kazemi, spelunkyGen, spelunkyGen2) | a walker draws the solution path (roll 1-5: left, right, down), then rooms are filled by type | **Variety lives in three nested rolls: path, template, obstacle block.** Kazemi's demo: keeping the block template fixed visibly kills variety. Our pieces need slots filled from a separate hazard library |
| **Dead Cells** | hand-made room "tiles" per biome, each with a purpose and entrance/exit counts; a concept graph per biome (length, specials, how labyrinthine) | "for each node, the algorithm tries a random room ... if it doesn't match, the algorithm tries another"; enemy count from combat length, with per-monster rules (Bénard, 2017) | **Keep the algorithm "involved in the most restrained way possible"**: fixed frame by hand, rooms by purpose, rooms never shared between biomes ("rooms used in the prison aren't reused in the sewers"), so each biome has identity |
| **Super Meat Boy Forever** (criticised) | "a pool of 40-60 mini-levels or chunks ... PER LEVEL", each "designed with a difficulty in mind" (Refenes). **[11-05 changed]** 40-60 is the 2017 figure; later "Each Level has between 70 and 100 Chunks" for 8 used, each chunk played "to give it a par and a difficulty rating", and "We keep track to avoid duplicates" across the save (R1 §3.3) | chunks picked "based on their difficulty which was presented in a certain cadence" (start slow, ramp, back down, finish with a bang) | Nintendo Life: it "robs the game of the wonderfully exacting little one-screen death chambers", "we miss being able to learn levels", and "times when the procedural generation ... dishes you out a section of platforming that's impossible to pass". **Lessons: a difficulty cadence works; a stage made only of chunks has no landmark; joins must be proven, not trusted; and a stage you are learning must stay put** (our layoutMemory already keeps a layout until cleared) |
| **BIT.TRIP RUNNER** | every obstacle placed to the song by hand | fixed run speed, so distance is song time | Ludus Novus: one rhythm ("one, and-three") appears eight times in a level with **different obstacles demanding the same buttons**: "Try this. Okay, now the same thing, but harder." Neuse cut moves: "Being able to do too much detracted from the experience". **A rhythm motif repeated with changed dressing teaches; the same dressing repeated bores** |
| **Geometry Dash** (phone) | levels placed by hand in the public editor | fixed speed per mode | the editor's Guideline Creator: "click 'Record' and then click to the song ... vertical lines will be shown in the editor"; a BPM finder. **Beat guides as authoring data: big moments go on the music's strong beats** |
| **Badland** (phone) | every stage hand-built in Frogmind's iPad editor | physics props (chains, saws, clone/shrink pickups) | Badland 2 opened the maze "to snake around, rather than being a pretty much up/down affair" and "Sometimes you fall down, sometimes you go high up". **Direction is the cheapest variety** |
| **Tiny Wings** (phone) | the island order and its tasks | islands "procedurally generated and change in real time each day" (TouchArcade); the hill algorithm itself unconfirmed (Illiger's interview was blocked) | "an almost zen-like rhythm to coasting in and out of the slopes". **Randomness inside a tuned feel; a daily seed for free replay** |
| **Jetpack Joyride** (phone, criticised as thin) | obstacle patterns (format not public; the GDC talk page has no detail) | random assembly, missions, vehicles | "one-button" was a goal; variety came from missions and vehicles that change what you try on the same course. **Vehicles: a section where the same thumb does a new thing** |
| **Pizza Tower** | 19 hand-made levels, "each stage has its own wild gimmicks" | the escape: race the clock back through the level | **One place, two runs**; one gimmick per level that "never stumbles". Also criticised elsewhere for ending every level the same way |
| **New Super Mario Bros. 2** (criticised) | hand-made levels, shared themes and assets | — | "Most of the assets and songs seem reused from the previous two entries, and many levels are easy to forget." **Sameness comes from reused look and sound and no idea per level, not from the generator** |
| **Rayman Legends** | music levels on a "music sheet which the level designers would be able to use as a grid in order to 'rhythm' their levels" (Dumas) | a synchronisation system; footsteps snapped to the music's semiquavers | **A shared beat grid for design and for sound**; "Working with silences is paramount": rests make hits land |
| **Super Mario 3D Land** (Hayashida) | one core concept per stage, "carried through absolutely all the way" | — | four steps: learn it, a harder use, "something of a doozy", mastery. Playtests watch faces, not questionnaires. Stage length fits "a couple of stations" on a train |

### 3b. The papers behind generated platformer levels (read in full)

| Work | Method | What it gives this engine |
|---|---|---|
| **Launchpad** (LP, IEEE TCIAIG 2011) | two tiers: a rhythm generator (type regular / swing / random, length 5-20 s, density low / medium / high), then a geometry grammar turns move/jump/wait states into components under a physics model; rhythm groups joined by a rest platform; many candidates judged by critics (a designer's control line, component frequency by chi-square) | 1) "This separation of tiers ensures that the intended rhythm is always present, regardless of geometric representation": the beat is the contract, geometry the dressing. 2) Coins as a global pass after generation, but for games where collectibles are a goal they "would perhaps be better" placed "during geometry generation": our petals. 3) A late "small implementation detail" (raising the chance a component repeats) caused a strong linearity bias found only by measuring expressive range over 10,000 levels: **measure the engine's range, not single stages**. 4) Swing and random rhythms filter out long components (springs, falls) because the next beat comes too soon: our tempo-range finding (2.4) in their data. 5) Generate-and-test was chosen because its criteria were global; "if the design criteria became more sophisticated ... a search-based stitching together of rhythm groups may become more appropriate" |
| **Tanagra** (TFDG, FDG 2010) | beats hold patterns (flat, gap, enemy, spring, stomper); ABL picks the pattern, the Choco constraint solver places it; the designer pins geometry and edits pacing; backtracking in three steps | 1) **Pick the pattern separately from placing it** ("the precise placement of level components is influenced by surrounding geometry"). 2) Backtracking order: relax positions, then try another pattern, then regenerate a neighbouring beat. 3) Typical solve 5 ms, give up at 500 ms. 4) Stability: "the value of a variable should be the same as the last time the solver was run", relaxed only if no solution: a re-roll that changes one node keeps the rest. 5) Expressive range on linearity and leniency over 500 levels |
| **Dahlskog & Togelius** (DPG 2012) | Super Mario Bros cut into rhythm-group-sized sections; 23 patterns in 5 groups (enemies, gaps, valleys, multiple paths, stairs); "about 15 beats" a level (10 to 30, mean 15.5) | 1) **Each pattern is written as Problem / Solution / Using the pattern / Comments**: the problem the player can otherwise ignore ("the player can act and traverse the level slowly without risk"), and how the pattern forces the skill. That is the right record for our rooms (11.1). 2) "two 2-hordes afford different solutions than one 4-horde": spacing is part of the pattern. 3) A level of about 15 rhythm groups: our 1-2 has 17 nodes, 1-5 10 (2.5) |
| **Sure Footing** (Thompson, Game Developer) | shipped game: an **action generator** (a grammar of actions with costs: stairs, drops, springs, flats; 17 grammars swapped at runtime as "moods") then a **geometry generator** that picks a hand-made chunk for each action symbol, each chunk variant with its own cost; budgets rise as constraints relax; sectors (locales) switch art and turn on mutators; a "tunnel" sprint marks each sector change | the closest shipped relative of options A and B together: **symbols chosen by a grammar, each symbol realised by one of several hand-made, costed variants**. Its "moods" are our stage flavours; its costs are our tension; its sectors are our worlds with their mutators |
| **Carmo** (CA, 2024 thesis) | tiling WFC over 185-197 pieces cut from Super Mario Bros, edge labels LOW/MID/TOP, a difficulty label, an anxiety curve as input | 8.8-23% of levels unplayable in every round (CA:1130-1143); generation stopped when a combination was missing (CA:1004-1011); "all connector" pieces lower variety (CA:831-833). Its variety metric (repeated tiles in 0.05% of levels) said "varied" by counting pieces: the same blind spot as counting move letters |
| **Canossa & Smith** (FDG 2015) | 20 metrics from designers, in four groups: aesthetics (music, sound, texture, salience), difficulty proxies, topology, tactics | the earlier PCG metrics (linearity, leniency, density, pattern variety) "have historically not concerned themselves so much with the visual or auditory experience"; designers rated those as highly important. **Variety the player feels includes the look and the sound**: our §0c.5 rule, from the research side |

**What they say together for us**: beats as the contract (LP, TFDG); patterns recorded as problem and solution (Dahlskog); symbols
chosen by grammar and realised by hand-made costed variants (Sure Footing); measure the generator's range, not single outputs (LP,
TFDG); look and sound count (Canossa & Smith); filtering after the fact leaves unplayable output (Carmo).

**What they say together.** The games that feel hand-made at scale make small hand-made things and multiply them with a guaranteed
path (Spelunky), a purpose graph (Dead Cells), a beat (RUNNER, Rayman, Geometry Dash) or a second use of a place (Pizza Tower). The
ones called repetitive either had no landmark and unproven joins (SMBF) or reused look, music and ideas (NSMB). Phone games keep
controls tiny, so variety must come from what the world does, the direction you travel, and the beat.

### 3c. [11-05 new] What the research team's notes add to sections 3 and 3b

The notes opened about 150 more primary sources: R1 §6 lists 61 pages and 3 code repositories, R2 §6 25 papers, R3 §6 26 and R4 §7
64. I do not copy them here. These are the points that change this design.

- **Hand-made big units, a small dumb generator** (R1 §2 L1). Spelunky's 10x8 room, Dead Cells' room by purpose, SMBF's whole
  level-sized chunk. "the key for us was in having the algorithm involved in the most restrained way possible" (Bénard). Option A's
  shape.
- **Difficulty is a cadence of rated units, ramping and cooling at every scale** (R1 §2 L4: SMBF, Shovel Knight). gen2's 8-6 sits at
  author-rated 6-7 from its third slot to the end, apart from rests (R1 §3.0 Run D). Ratings must come from play, not the author
  (R1 §4 idea 9; SMBF's critics: "an extremely difficult section only to get another one that's a cakewalk").
- **Teach in three steps, the middle one safe and blocking** (R1 §2 L5, Ubisoft's rational design: "exposition, validation and
  challenge"). **And a mechanic must be required, not just present** (R2 §2 L5: Green et al.; Nelson & Smith). Tried on our three
  hide-teach stages: a bot that never hides finishes all 9 layouts, and is faster on 7 (R2 §4 experiment 4).
- **One named surprise per stage, with a test** (R1 §2 L6). Wonder's filters: a link before and during, "suddenly be able to do
  something they couldn't before", and "explained simply with one short phrase"; DKC Returns: "a memorable moment in every level".
  This sharpens A's hero room into a stage field with those three tests.
- **Grey first, judged, then art** (R1 §2 L7: Hollow Knight's black tiles, Ori's "design approved" stamp). The proof and the bots
  pass in grey before any Hugging Face art is chosen.
- **Same ground, a second goal, said plainly** (R4 §2.4: Super Mario Run's colour coins, Fiesta Run's Invasion levels). Cheap
  replay on a beaten roll. The failure is "the same levels that are just disguised as being different".
- **Themed pools per stage** (R4 §2.3 and §6 idea 9, Leap Day). Each stage draws a small pool from the world (two hazards, one
  surface family), so a stage feels like one idea and the world's pieces rotate.
- **Rhythm as every stage's frame is a risk the notes name, and a direction question for Matt, not a ruling.**
  - Nintendo prototyped a jump-in-rhythm Mario and dropped it as the frame: "not really a need for it to be a Mario game". Wonder
    later used rhythm for one course and one badge (R1 §3.10, §5 item 14).
  - A music-driven runner study: when every beat is a jump, "the feeling for the user would be very monotonous" (R2 §2 L8, §3.18).
  - Alto's made its music irregular so it is never memorised; we lock jumps to the beat, which makes the beat itself the repeating
    unit (R4 §3 Alto's).
  - Measured on ours: "one tempo" is flagged on every World 1 stage and layout (R3 §3 W11).

  What this means for the plan: the beat stays the proof of timing (2.4 holds). But a stage should take its take-offs from a
  *selection* of its theme's onsets, not every beat (R2 §3.20, Dance Dance Convolution's placement vs selection). And at least one
  stage a world should break the beat on purpose. Every option below inherits this; it is the open question in 10.0.

---

## 4. The three engines in one table (plus a wild card)

All four make the same kind of stage: a map shape of 7-10 nodes, each node rolled from pieces, a new roll on every replay after a
clear (a stage you are still learning keeps its roll, layoutMemory.ts:6-13). They differ in kind:

| | Who decides the layout | When the rules act | The unit reused | Where a new world's variety comes from |
|---|---|---|---|---|
| **A. Proven Rooms** | **Hand (template)**: designers write rooms; a spec names a deck of rooms per node; the roll draws one | **Before**: each room is proven alone over its whole tempo range, both settings, mirrored, with every hazard block in each slot, when it is written. A stage only checks arithmetic and seams | **A room**: 8-20 s, fits one or two phone screens both ways, stored as beat data + slots (never pixels) | **New rooms and hazard blocks** per world, with a coverage table that names the missing ones |
| **B. Beat Grammar Solver** | **Search**: a solver composes each node from 1-2 bar motifs to hit the node's target numbers (section 2.3) | **During**: every motif placed must satisfy the constraints before the next is tried; backtracks on failure | **A motif**: one or two bars of moves (beat marks + move + dy + surface) | **The world's grammar**: its motif list, its meter, its surfaces and the hazards that act on its beat |
| **C. Bot-Judged Archive** | **Simulation**: populations of bot players play thousands of candidate nodes; the bots' measured experience decides | **After**: candidates are built freely from pieces, then judged by simulated play; only the best of each kind survive | **A whole node candidate**, kept in an archive cell by what it plays like | **The archive grid**: each world defines what "kinds" of node it wants (its descriptor axes), and the archive fills every cell |
| **D. Wild card: The One Who Went Ahead** | **A character**: someone in the story crosses the stage just ahead with a different body; their run makes the obstacles | During their simulated run, deed by deed | **A deed**: a cause and its effect (he cut the rope, so the bridge hangs) | **The cast ahead**: a different someone per world, with a different body and tools |

No two rows share two cells.

---

## 5. Option A: Proven Rooms

### 5.1 How one stage gets made

1. **Rooms are written per world, once.** A room is data: its job tag (intro, ramp, spike, rest, counter, climax, cool, puzzle), its
   pair, its direction (right, left, up, down), its bars and steps, its surfaces and what holds each one up, its hazard slots, its
   petal spots (on its own surfaces), its art set, its two doors (height band LOW / MID / HIGH and direction, CA:673-683), its
   tempo range and its teaching flag.
2. **Each room is proven alone, by a script, over its whole range**: every whole BPM in its world's range, Normal and Easy, mirrored
   and not, each hazard block in each slot. Proof = the tracer traces it, `checkTrace` is clean, the validator's route through it equals
   the room's own planned route, the stills both ways pass, its petals are reachable on its own surfaces. A room that fails anywhere
   in its range is fixed or has its range narrowed (section 2.4: "half notes with a double" gets a range that stops before World 1's
   tempo). Proof runs in seconds per room.
3. **A coverage table per world** (CA:712-746, 787-789; LEP:93-97): every (job tag, door in, door out, direction) the world's stages
   ask for. From the variety maths (2.6), each world needs at least **8 distinguishable moves** (move x note value x direction), at
   least **4 rooms per job** (28 rooms for 7 jobs), at least **8 hazard blocks**, and one hero room per stage. A hole is a room to
   write. "Fits anywhere" rooms capped at 2 a world (CA:831-833).
   **[11-05 changed]** The table is counted per (job x door x direction x **lessons taught by then**), at no fewer than 2 eligible
   rooms per slot. The teaching cut is what starves gen2's phases to 1-4 templates (R1 §3.0 Run H; 2.6 above). The world target is
   about 50-70 rooms, not 28. The coverage gate also fails on any room, palette option or section that **no shipped roll lays**:
   1-2's 80/90 px rises, 1-5's -60, and the 28 of World 8's 80 sections that are in no curated roll (R4 §5.3, §5.6, §6 idea 1).
   **[11-05 new]** Two tags from Spelunky 2 (R1 §3.1, §4 idea 3):
   - `rare`: drawn about 5% of the time, so a stage feels special when it appears;
   - `notBefore`: kept out of a world's early stages, so a world grows without a new mechanic.
4. **A stage is a spec** (about 20 lines): map shape, the node list with each node's job and tension, the pair, the hero room (hand-made
   for this stage only), the deck of allowed rooms per node.
5. **The roll**: for each node, draw from its deck with a shuffle bag and cooldown (gen2/variety.ts already has both), filter by door
   match, by density at this stage's tempo (section 2.2, rule 3) and by what the neighbour stage used; fill each hazard slot from the
   world's hazard blocks (Spelunky's obstacle blocks); mirror if the room allows it. Then trace the rooms in order at the stage's
   beat and setting. Joins are a one-beat run at a matching door height, which cannot fail because both doors are flat aprons at a
   proven band.
6. **The stage check is arithmetic plus seams**: length = Σ room clocks ≥ 120 s; petals: Σ shared ≥ goal and goal ≤ shared + smaller
   road - 5%; no room twice; no 3-move run shared with the neighbour stage; 4+ move kinds and one the neighbour lacks; the measured
   stage clock within 5% of the sum of room clocks (or the room that differs is named).
   **[11-05 new]** Eight more checks the notes require, all on room metadata or cheap bot runs:
   - **kinds:** at least K landing kinds per take-off across the stage, and no two kinds over 50% together (R2 §5 idea 1; today
     39-48% for one pair);
   - **zigzag:** no more than about 45% of consecutive landings flip up/down (estimate, near the 42% independent rate; 1-2 is 66%,
     R2 §4);
   - **risk budget:** Σ room risks inside the stage budget of 2.3 (R3 F1);
   - **cadence:** room costs ramp and cool. A peak is followed by a lower node, and the stage's last third holds its highest cost
     (R1 §2 L4);
   - **groups:** phrases found with the relative boundary of 2.3 sit within 5-20 s (R3 §4.5);
   - **taught twice:** each new mechanic gets a safe validation room that blocks progress, before the first test that costs anything
     (R1 §2 L5);
   - **limited agent:** with the taught move switched off, the bot must fail the teach room or pay a set cost, and the full bot must
     pass it (R2 §5 idea 3; `noHide` already exists, `tools/validate/play.ts:303`);
   - **save-wide:** no room the player has seen in this save is drawn again until the world's pool is spent (R1 §4 idea 2; SMBF).

Because every room was proven in its range, a roll can run **at load, on the phone, every time the player replays**, in milliseconds,
and still be right. That is the "random, replayable" part done safely.

**[11-05 new]** The roll gives each node and each layer (room, hazard block, mirror) its own RNG stream. Kazemi's layer-locked
rerolls then work as a debug switch, and changing one node leaves the rest of the stage alone (R4 §4 Spelunky, §6 idea 7). Tanagra
does the same: "the value of a variable should be the same as the last time", relaxed only when no solution exists (R2 §5 idea 5).
WR today shares one stream, so a change to one palette reshuffles every later node.

### 5.2 Sample stage spec (World 2, about 20 lines)
```
stage: 2-4 "Over the Water"
shape: trail right, one high/low split at n4-n5
pair: vine + current (the swing lands on a log the current moves, on the same beat)
tempo: from music (W2 94-102); feel "swung" (dotted half + quarter)
nodes (job, tension, deck):
  n1 intro  0.20 [w2-bank-steps, w2-reed-hops, w2-dry-vine-teach]   # first vine over dry bank (taught)
  n2 ramp   0.40 [w2-reed-wade-hop, w2-log-pair, w2-stone-skip]
  n3 spike  0.65 [w2-log-roll-pair, w2-current-drift, w2-snapper-hops]
  n4 split  0.55 high: [w2-swing-high, w2-rope-high] | low: [w2-raft-low, w2-shallows-low]
  n5 rest   0.10 [w2-heron-perch, w2-mooring-rest]            # Dot's line here, checkpoint
  n6 counter 0.60 [w1-snap-into-vine*, w5-silk-skim*]          # an earlier world's piece, changed, against W2's current
  n7 HERO   0.85 2-4-full-swing                                # hand-made: the full arc over the middle of the river
  n8 climax 0.95 [w2-snapper-snouts, w2-log-chain-dash]
  n9 cool   0.15 [w2-shrine-run]
hazard blocks: snapper-1, current-drift, reed-tangle
setting: both built from the same rolls; Easy traces every room with easyNode
petals: goal from shared nodes; n4's two roads 15% each (arithmetic, checked before the build)
```

### 5.3 What makes World 7 feel unlike World 2
Different rooms in its own art, never shared (Dead Cells' rule); a different coverage table (World 7 asks for DOWN and UP doors World 2
barely has: chimneys, descents); a tempo half as fast (64-72), so the same kind of room is a slow, weighty stride with long waits and
126 px of run per eighth; World 7's own hazard blocks (falling tiles timed to the bar, sentry sweeps). An earlier world's room may
return only changed and paired with the new world's mechanic (SR:93-99), so it reads as an echo.

### 5.4 The moment a player remembers
The hero room: one per stage, made by hand for it, placed where the spec says, on the stage's strongest beat (Geometry Dash's
guideline idea). SMBF's lesson is that chunks alone never build to a landmark; here the rolled nodes exist to deliver the player to it.
**[11-05 changed]** The hero room carries a `signature`: one short phrase, unique across the game. It must pass Wonder's three
tests: it ties to what came before; the player can suddenly do something they couldn't; it says itself in one short phrase (R1 §2
L6). SMBF's critics praised the fixed bosses and said a chunked finish "trudges" (R1 §3.3, §5 item 13). So the hero room sits at or
near the end, and the stage's ideas combine there (Shovel Knight).

### 5.5 How today's failures become impossible
| Failure | Why it can't happen |
|---|---|
| Petals the shape couldn't hold | Petals belong to rooms, on their own surfaces, proven reachable; a split's share is a sum checked before the build |
| Floating branches | A room can't enter the library unless every surface names its holder and the stills show it; seams are flat aprons |
| One sprite everywhere | The stage check counts sprite use over its rooms (no sprite over 15%, no neighbour pair the same) |
| A stage like the one before | Rooms are named in the spec and the roll filters by the neighbour's runs; no chance at stage level |
| Easy not reaching the builder | No room exists without an Easy proof; setting is a required argument of the roll and the trace |
| Two copies of a placement tool | Rooms are data; one tracer, one roll function, one prover |
| Hop/jump/double as one, no direction | A room's steps carry move + direction; the checker's tokens are generated from the same type. **[11-05 confirmed still live]**: the validator still labels 14 of 15 of 1-1's doubles and 27 of 34 of 1-6's as J (R3 §3 W3), so this fix is needed, not done |
| **[11-05 new]** A template repeated to fill a clock | Length is Σ room clocks. A short stage is refused with the list of missing rooms; a cap of 2 per stage is a build rule, not a check after |
| **[11-05 new]** Dice spent on options that never land | Rooms are written, not proposed, so there is no proposer. The prover and the tracer call one reach function, and a coverage gate fails on any option, room or section no shipped roll lays |
| A route through ground | A room's route is proven in the real engine once; a stage's route is the rooms' routes joined at doors |

### 5.6 What A keeps from gen2, and what it changes (checked in gen2/types.ts and gen2/DESIGN.md B3-B6)

gen2 already has most of A's skeleton, and A should be built from it, not beside it:

| A needs | gen2 today | Keep / change |
|---|---|---|
| rooms with typed doors | `SectionTemplate` with `entry`/`exit` ports (`PortKind` ground / ledge), `exitDy` (types.ts:315-366) | keep; add the door's height band and direction |
| hazard blocks in slots | `subBlocks` (Spelunky's, 2-3 authored versions per block) and `sockets` bound to a piece by key and `t` (DESIGN.md B3-B4) | keep |
| shuffle bag, cooldown, a version used once a world | `ShuffleBag`, `CooldownQueue` preloaded with the previous stage, `WorldOnce` (variety.ts; B3) | keep |
| mirroring | `mirrorable` (types.ts) | keep |
| Easy from the same plan | Easy lays Normal's plan with Easy's rules (B3) | keep, and add Easy's own density band (2.5 finding 1) |
| a room's moves on the music's beat | pieces placed by pixel rules (`jump`/`double`/`pit` as a share of `maxGap`, B3) | **change**: the room's steps are bars and steps, traced by the one tracer at the stage's tempo |
| proof before use | the assembled stage is checked after building, then repaired or re-rolled, then 16 rolls are curated offline (B5, B8) | **change**: each room is proven alone over its whole range when written; the stage check is arithmetic and seams; rolls can happen at load |
| petals in the room | petal arcs and pickups filled in pass 4 after the layout (B4) | **change**: petal spots are room data on the room's own surfaces |
| one route | levelCheck's route and the inspector's quick route, separate (SR:329-334, SR:555-557) | **change**: the room's route is its traced route, replayed in the engine once in proof |
| travel in four directions | right only (`flow: 'right'`, pipeline.ts:373; LEG:117) | **change**: doors carry direction; the coverage table asks for left, up, down |

So A is gen2's assembly (decks, sockets, sub-blocks, Easy plan, repair) with beatTrace's placement, plus proof moved from the stage
to the room. Most of the code exists. The new parts are the room-as-beats format, the prover, the coverage table, and the tracer's
growth.

### 5.7 Why a join between two proven rooms cannot fail (the seam maths)

Each room starts and ends on a flat apron of at least 200 px (BT APRON) at its door's height band. A join is the exit apron of room k
followed by the entry apron of room k+1 at the same band, with one beat of plain run between them (66-126 px across our worlds, table
2.2). So a join is flat ground of at least 466 px: nothing to jump, nothing to miss, about 1.6 s at full run. Doors at different bands
never meet: the deck filter only offers rooms whose entry band equals the last room's exit band, and a change of height happens
inside a room, where it was proven. The join's cost is a rest of about 1.6 s between rooms, which fits the rest pad of SR:173 (1.0-1.2
s Normal) only if the join is shortened. So **the aprons are shared**: the exit apron of room k is the entry apron of room k+1 (one
200 px apron, 0.7 s), which is inside the pad. And because Carmo shows that too many universal connectors lower variety (CA:831-833),
the apron is the only universal piece, and its look is the world's, rolled by the dressing pass.

**[11-05 confirmed; changed on cadence]**
- **Safety is confirmed.** This is Barrett's herringbone edge contract with one edge colour: with an edge every piece meets,
  "the filling algorithm is trivial", with no backtracking (R4 §4 Noita/Barrett).
- **But one edge is one cadence.** Every node ends on the same flat apron, so every rhythm group ends the same way. A rhythm group
  should end in "a cadence ... where the rhythm of the player's movement significantly changes" (R2 §3.2, §5 idea 6).
- **The change.** The apron stays the only universal *edge*. Cadence kinds (a drop, a vine catch, a stop-and-look, a rising stair)
  become small proven rooms of job `cadence`, drawn per seam and counted by the kind check.
- **One finding against "flat is enough".** On 1-2, the first-timer never got onto one take-off edge per layout (0% and 25% at x
  25739 and 20797) and needed 1-2 rescues a run (R4 §5.7). The prover's real-engine run must use the first-timer's short flick, not
  only the tracer's thumb.

### 5.8 Cost (estimates, unmeasured, against today's ~1.6-2% of a week per stage)
Build: 3-4 days (room format, tracer extended to vines/ropes/mushrooms/wind and 12-time bars, prover, coverage table, roll, stage
check), much of it on gen2's existing assembly (5.6). Per world: 28 rooms + 8 hazard blocks + 9 hero rooms (2.6), about 20-30 min a
room with its proof run: 15-20 h, about 3% of a week. Per
stage: spec 15 min, hero room 45 min, gates 15 min: about 1.25 h, 0.3-0.4% of a week. Risk: rooms memorised (Rogue Legacy, GE:19) if
the library is thin; answered by tempo re-trace, mirrors, hazard blocks, 4-per-job decks with 8+ distinguishable moves (2.6), and the in-order QA recording as judge.
**[11-05 changed]** Two numbers change.
- **Per world:** about 50-70 rooms, not 28 (2.6). At 20-30 min a room that is about 17-35 h of helper time, roughly double the
  figure above. Still an estimate.
- **The measured baseline the cost is judged against** (R1 §3.0, §3.13, from git): 1-2 and 1-5 together are 1,349 lines in 32
  commits over about 7.6 h; 1-1 is 602 lines in 13 commits over about 7.5 h. Building a stage takes 0.1-0.4 s. The slow part is
  judging, not the machine (R1 §2 L7; R4 §5.2).
- **For scale** (R1 §3.13):
  - Rayman Jungle Run: 11 designers made most of 40 levels in about a week, on finished tools, so about 3-4 a designer-week.
  - Hollow Knight: an area took 2 days of grey tiles plus 4 days of art.

The case for A is that the room is the reusable part: the 7.6 h we now spend on two stages would buy about 15-20 rooms that serve
every stage of the world.

---

## 6. Option B: Beat Grammar Solver

### 6.1 How one stage gets made

1. **Motifs are written per world**: 1-2 bars each (`x..o....` with its steps), tagged with the moves, surfaces and the hazard that may
   sit on its avoided line (BT `hazardSpots`, MR:59). About 40 per world, each proven over the tempo range like A's rooms (cheap: a
   motif is small).
2. **Shape pass**: the map shape becomes node boxes with entry and exit points and directions (MR:40-44); a split's two roads get the
   same merge point as a hard constraint (GE:69's closure: Σdx high = Σdx low, Σdy high = Σdy low).
3. **Solve each node** with the constraints of section 2.3 as the objective and the rules as hard constraints. Search, as Tanagra
   does it: choose a motif (the pattern), let the tracer place it (the instantiation), check; on failure, in Tanagra's order: relax
   the placement, try another motif, regenerate the neighbouring beat (TFDG §5.5). Beam width 8, a hard time cap per node (Tanagra:
   "typically, solutions are found within 5 milliseconds ... stops itself from searching after 500 milliseconds", TFDG §5.1).
   **[11-05 changed]** Every rule must be checked on prefixes: the Normal trace, the Easy trace and the cheap checks. Pruning on
   Normal alone failed to find any answer in 5-7 of 20 runs (R2 §4). Filter the rules a step can break on its own (MIN_GAP's "no
   jump at all") when the candidate is made, as WFC propagates before it chooses (R2 §3.12, §4 point 5). Draw from the valid space
   uniformly by counting (memoised by mark and height), not one step at a time; the per-step draw biases net climb by 8-25 px
   (R2 §4 point 4).
4. **Hard constraints while placing**: reach by setting (table 2.1); landing on screen both ways (BT VIEWS); a holder for every
   surface; no 3-4 move run from this stage or the neighbour; no gap repeated 4 times; density inside the node's band at this tempo;
   petals owed by the node fit on its surfaces; animals only on surfaces with their footprint.
5. **Soft objective**: distance from the planned tension curve; distance from the neighbour stage's tokens (with direction); the
   number of distinct move kinds.
6. **Pinned pieces**: the hero moment is placed first and never moved; the solver fills around it (Tanagra's "glue geometry", TFDG
   §4.1, and its stability constraints: "the value of a variable should be the same as the last time the solver was run").

### 6.2 Sample stage spec (World 7, about 20 lines)
```
stage: 7-6 "Falling Floors"
shape: chimney down (right, down, left, down, right)
pair: crumble tile + stone sentry, on the same beat (the sentry's sweep lands as the tile drops)
tempo: from music (W7 64-72); feel "wait-and-go": whole notes, hits on 3
nodes: intro 0.2 | ramp 0.4 | spike 0.7 (n3) | rest 0.1 | counter 0.6 (brown-vine climb, W7) | climax 0.9 x2 | cool 0.15
pin: n7 "tile run under two sentry sweeps; last tile drops as you land on the lip", bar 4
motifs: W7 list + returning W3 thorn-vine (patience) and W5 silk skim (contact) for the counter
forbid: 3-move runs used by 7-5 or 7-7; liana chains (7-2 owns them)
easy: soft halls under every tile run; sweeps 1.5x slower; density band 0.35-0.55
petals: goal from the shared path; split roads 15% each inside their own motifs
miss: n2-n4 setback; n6-n8 a life on Normal
length: solve until skilled clock >= 135 s
```
**[11-05 overturned]** The last line is the clock-filling that makes gen2 repeat (R1 §2 L3, `pipeline.ts:702`). It is replaced by
`length: from the 9 nodes; refuse below 120 s and name the node to lengthen`.

### 6.3 World 7 vs World 2
World 2's grammar is water and rope at 94-102 BPM: swung motifs, pendulum vines, reeds, moving logs. World 7's is stone that keeps
time at 64-72 BPM: tiles that fall on the bar, sentries whose sweep is a metronome, long waits. The solver can only use the world's own
motifs (plus changed returning ones), so a World 7 stage cannot be made of World 2's moves; the shape pass gives World 7 chimneys and
descents.

### 6.4 The moment a player remembers
The pinned phrase, landing on the last bar with the music's hit.

### 6.5 Today's failures
Petals: a node's petal debt is a constraint during the search, so a shape that can't hold its share fails with "n4 low road holds 9
of 15" before any build. Floating: every surface type requires a holder at placement. One sprite: the dress budget is a constraint.
Too like the neighbour: the neighbour's strings are an input; a repeat can't be placed. Easy: setting is an input of every trace; the
solver runs once per setting. Copies: one tracer, one solver. Moves and direction: one shared token type. Route through ground: the
route is the tracer's own simulated route with collisions.

### 6.6 Cost (estimates)
Build: 6-8 days (all of A's tracer work, plus the shape pass, the solver, relaxation logs). Per world: 40 motifs, 4-6 h. Per stage:
about 1 h when the solver succeeds; the risk is the stage it can't solve: "debugging an over-constrained CSP ('UNSAT at Beat 47') is
notoriously opaque for an AI coding assistant" (GE:69). Countermeasure: a relaxation log that names the constraint and the beat.
**[11-05 confirmed]** A survey of 120 developers ranks "Debugging difficulty" third of all PCG concerns, at 41.7% (Endrovski,
Dormans & Bidarra 2026, via R4 §2.2, §4). R2 §4 also shows B buys no speed until there are pins and quotas. B's value is that it
makes kinds and pins *exact*, not that it is cheaper.

---

## 7. Option C: Bot-Judged Archive

### 7.1 How one stage gets made

1. **Pieces**: the same motifs and hazard blocks as B, and the same proven rooms as A where they exist.
2. **Generate freely, offline**: for each node of each stage, assemble thousands of candidates from pieces with light rules (doors
   match, reach legal).
3. **Judge by simulated play**: three bot players (the first-timer, the kid on Easy, the skilled adult; tools/inspect already has the
   first two) play every candidate in the real engine. Each candidate gets measured numbers: completion rate per bot, lives lost,
   narrowest input window, how often the player's take-offs land on the beat, dead time, and the tokens it produced.
4. **Keep an archive by kind, not one best** (quality-diversity search, the MAP-Elites method): the world defines 2-3 descriptor axes
   (for example: direction of travel x hurry-vs-patience x main move kind). Each cell of the grid keeps the best candidate of that
   kind. The archive is "full" when every cell the world's stages ask for has a passing candidate.
5. **A stage draws its nodes from the archive cells its spec names**, a different candidate on each replay (each cell keeps its top 3).
6. Expressive range is the archive itself: what Launchpad and Tanagra measured after the fact (linearity and leniency over 500-10,000
   levels, TFDG §7, LP §V) is the engine's working state here.

### 7.2 Sample stage spec (World 6, about 20 lines)
```
stage: 6-3 "Root to Root"
descriptor axes (W6): direction {right, up, down} x tempo {hurry, patience} x main move {swing, seesaw, swim, hop}
nodes (job, cell):
  n1 intro   (right, patience, seesaw)   # the seesaw root taught over mud
  n2 ramp    (right, hurry, hop)
  n3 spike   (up, hurry, swing)
  n4 rest    (right, patience, -)        # Flicker's line
  n5 counter (down, patience, swim)
  n6 climax  (up, hurry, seesaw)  x2
  n7 cool    (right, -, hop)
bots: first-timer Normal >= 70% per jump (W1-5) / 50% (W6-10); kid Easy >= 85% (SR:148)
fitness: on-beat take-offs >= 60%, dead time <= 2.5 s, input window >= 167 ms Normal / 300 ms Easy (GP:369)
replay: each cell keeps its top 3; never the cell candidate played last
tempo: from music (W6 86-94)
```

### 7.3 World 7 vs World 2
Each world sets its own descriptor axes, so the archive is forced to fill different kinds of node: World 2 asks for (across, hurry,
swing over water), World 7 for (down, patience, tile run). Two worlds with different axes cannot produce the same archive.

### 7.4 The moment a player remembers
The cell no other world has (World 6's seesaw-in-a-swell, say), chosen by the bots as the best of its kind.

### 7.5 Today's failures
Bots play the real engine, so a route through solid ground, an unreachable petal, or Easy never built can't pass (the kid bot plays
Easy). Floating and sprite stamping are not caught by bots; they need A's or B's piece contracts. Copies: one generator, one archive.

### 7.6 Cost (estimates)
Build: 5-7 days (archive, descriptor code, the third bot, batch runner). Compute: real-engine bot runs are seconds each; thousands per
node means hours per world on a machine (no AI tokens). Per stage: 30 min of spec and review. Risk: the bots judge what bots can
measure; fun that bots can't see is lost, and a bot bug (D15: the first-timer can't climb mushroom walls) silently empties cells.
This is "roll, check, reroll" made smarter, which is the loop that cost World 8 13 hours (SR:150-152), only with the AI out of it.

**[11-05 changed] C's judge is not ready, and its archive moves into A.**
- **The bots disagree.** The noisy jump bots rate 1-6 among World 1's easiest. The first-timer finds it the hardest by far: 2.7
  lives a minute, 3 game overs a run, 23-29% of the stage stuck (R3 §3 W13).
- **The adult bot is too steady.** Its 30 ms thumb is steadier than the steadiest measured human (Isaksen: 35.9-61.1 ms) (R3 §3
  W6).
- **No bot is fitted to recorded people,** as King fits its bot to players (R4 §2.7). The answer swings from 0.0 to 1.6 expected
  falls a stage on the two noise settings alone (R4 §5.4).
- **Bots judging fun is the weakest link.** Even King and Rovio rate difficulty with bots, not fun, and only after fitting them to
  players (R3 §2 F3).
- **What survives, inside A:**
  - the archive as a coverage tool. Keep the best roll per cell of a kind grid, and ask the engine *for* an empty cell, with a time
    box and a blocklist that becomes a piece-list item (Bazzaz & Cooper 2025, R2 §3.19, §5 idea 7);
  - the bots as the source of every room's `cost` and `risk`, once they are calibrated on testers' recordings
    (`tools/qa/touchReplay.ts`; R4 §6 idea 4).

---

## 8. Option D (wild card): The One Who Went Ahead

Neither the research nor the games above build a level this way. In nearly every world of our story someone crosses the ground just
before Pokey: the soldiers marching Meeca north, a capuchin thief, the Tarantula Queen's servants, the keeper of the ruins, the Night
Hunters. Simulate that someone first, with **their** body, and let what they do make Pokey's stage.

1. **Their run**: a planner walks them from start to goal on the music's bars with their body's numbers (a soldier can't jump but
   carries planks and ladders; a capuchin jumps 1.6 times Pokey's reach; a spider abseils 400 px).
2. **Deeds**: on chosen bars they do something from their list: lay a plank and kick it away behind them; snap a branch as they
   leap off it; lay silk on a bridge; pull a ladder up. A deed is allowed only if Pokey has a taught move that answers its effect there.
3. **Pokey's stage is the aftermath plus the gap between two bodies**: where the capuchin jumped further than Pokey can, a Pokey way
   must exist (a vine, a lower road); that is where puzzles come from without anyone authoring them.
4. **They stay on screen as the pacer**: every hazard is shown before it bites (the thief snaps the branch two beats ahead), and their
   pause is the rest.
5. Pieces underneath are A's rooms or B's motifs; D is a layer that chooses and changes them.

**World 7 vs World 2**: who is ahead and what they can do (the river villagers' rafts and laundry lines vs the keeper winding up old
machines). **The moment**: the thief snapping the branch you are about to land on, on the beat, and the vine you catch instead.
**Failures**: as the layer underneath, plus every deed has its own art and its own proven answer. **Cost**: 6-9 days build; per
world a cast, a body and 8-12 deeds with art and story lines (each needs Matt's approval). It fits worlds with someone ahead; World 7's
"Alone" is the hardest fit.

---

## 9. What each option rests on

**A. Proven Rooms**
- Spelunky's types, templates, probabilistic tiles, obstacle blocks and mirroring: Kazemi, spelunkyGen and spelunkyGen2 (opened); GP:49, GP:242-255; GE:11.
- Dead Cells: rooms by purpose per biome, a concept graph, a restrained algorithm, no room shared between biomes: Bénard 2017 (opened); GP:50; GE:13.
- Edge labels, a coverage table, a cap on universal connectors: CA:673-683, CA:712-746, CA:787-789, CA:831-833; LEP:45-49, LEP:93-97.
- Pieces first, curate once; 12+ templates per world, 14+ section types, 3 per pacing tag: SR:150-165, SR:83-85.
- Puzzle rooms as their own blueprints, proven inside one chunk: MR:46-48, MR:62-71; GP:228-239.
- Sockets multiply a room (4 sockets x 3 = 81): GP:63.
- The portrait/landscape box (500 x 750 px fits both): GP:520-521; BT VIEWS.
- A hand-made landmark per stage: SMBF interview and review (opened); Hayashida (opened); GV:69.
- The core measurement: section 2.4.

**B. Beat Grammar Solver**
- Beats as the unit, pattern choice separate from instantiation, backtracking order, stability, time caps: TFDG §3-§5 (opened); TA:113.
- Rhythm first, geometry under the ghost's feet: MR:49-60, MR:597; LP §IV (opened); GE:25.
- Split closure and the CSP form: GE:67-69.
- Map shapes as a pass: MR:21-29, MR:595, MR:601; LEG:116-121.
- Search over random retries: LEP:106-108 (WR:149 draws 160 random tries).
- Hazards on the avoided line: MR:59; BT hazardSpots.

**C. Bot-Judged Archive**
- Expressive range as the measure of a generator: TFDG §7, LP §V (opened); GP:257-276.
- Noisy bots and the five gate numbers: GP:356-373.
- Carmo's generate-and-filter with numbers: CA:1130-1143 (8.8-23% unplayable), the reason judging after must be the bots' job, not ours.
- Super-additive difficulty that only play reveals: GE:29, GE:203.

**D. The One Who Went Ahead**
- Hazards from the line the ghost avoided, here with two bodies: MR:59.
- Diegetic tells and soldier logic: MR:408-417.
- One-rule enemies with a clear tell: MR:437-441.
- Cause and effect kept local: MR:398-401; GE:537.

**All four**
- Tempo from each stage's music, frame-harmonic rounding inside that range: LEG:203-207, LEG:411-414, GE:505; table 2.2.
- Clumsy-thumb reach per setting: GE:161-173, GP:75-76, physics.ts:40-43; table 2.1.
- Variety at three scales (shape, pattern, beat), not move-letter noise: GE:3; LEG:44-51.
- Petals placed with the geometry: LP §IV.E; GE:207-213 (the 70/15/15 arithmetic).
- One pair per stage, acting on one beat: L02 items 1-2; GV:21-54.
- Direction multiplies every pair: L02 item 4; GV:5; Badland 2 interview (opened).
- The twist breaks the learned rhythm; a 15-20 s dense finale at the exit: L02 items 6-7; GV:69.
- Neighbours differ in shape, tempo and feel; the slot order not fixed: L04b items 1, 17; MR:390-406.
- Machines check what machines can check: GC:119; LEDGER-CRITICAL-AGENTS.md:34-35.
- Rules a test holds belong in the generator; never mirror an engine rule: SR:459-466, SR:437-439.

---

## 10. The recommendation: Option A, Proven Rooms

### 10.0 [11-05 new] Re-ranked against the four notes: the same order, for stronger reasons, with A changed

| Option | What the notes say | Rank |
|---|---|---|
| **A. Proven Rooms** | Every shipped hybrid made the unit big, hand-made and whole, and kept the generator small (R1 §2 L1). Variety at scale came from many small authored pieces plus a few rules, never from rerolling a few (R4 §2.3). An edge contract makes joins unable to fail (R4 §4 Barrett). Build by construction; checks are the backstop (R2 §2 L2). Against it: A today assumes 28 rooms a world, and the notes show that is about 1:1 with the slots | **1st, unchanged, stronger.** It changes in six ways: (1) pools of about 50-70 rooms a world, counted after the teaching cut; (2) a room's cost and risk from bots, not the author; (3) kinds per step and a kind gate; (4) a risk budget beside density; (5) cadence rooms at the seams; (6) a signature hero room near the end |
| **B. Beat Grammar Solver** | Search pays only once pins, rise targets and kind quotas make the constraints tight (R2 §4). Pattern first, numbers second (R2 §2 L3), but "Debugging difficulty" is a top developer complaint (R4 §2.2). Its clock-filling spec repeats gen2's failure (R1 §2 L3) | **2nd, narrowed.** Not a whole engine. A prefix-pruned solver that composes a *candidate* room for a coverage hole, under pins, for a person to approve |
| **C. Bot-Judged Archive** | The bots disagree with each other, are steadier than people, and are not fitted to recorded play (R3 W6, W13; R4 §2.7). Bots judging fun is the step no source has shown | **3rd, folded into A.** The archive and the generate-for-the-empty-cell process become A's coverage tool; bot ratings become A's room costs once calibrated |
| **D. The One Who Went Ahead** | Not tested by the notes. "Skill carried by level objects" (Super Mario Run's special blocks, R1 §4 idea 8) and "the level gives the move, not the thumb" (R4 §2.5) support its core: deeds that give Pokey new moves without new inputs | **Wild card, unchanged.** Worth a single World 6 prototype after A's World 1 |

**The one thing the notes put in doubt for every option, and that only Matt can decide:** whether every stage should be locked to
the music's beat. Nintendo dropped rhythm as the frame. A music-driven runner study found every-beat-a-jump monotonous. Our own
gate flags "one tempo" on all of World 1 (3c; R1 §5 item 14; R2 §2 L8; R3 W11). My view: keep the beat as the timing proof
everywhere, but take-offs follow a selection of the tune's onsets, and one stage a world breaks the beat as its twist. That
question goes to Matt as one multiple-choice question before World 2 is specced.

### 10.1 Why A

- **It is the only option where a roll can happen on the phone, every replay, and be right by proof.** Rooms are proven over their
  whole range before they exist in the game; section 2.4 shows that a beat-data piece proven across a range stays valid across it.
  B proves at build time (a solver that can fail), C proves by sampling (bots that can miss), D needs story approval per world.
- **It kills the shared root of today's failures**: one description per room (geometry, petals, holders, art, route, both settings),
  proven once; the stage is only arithmetic over room metadata plus flat seams.
- **It puts the AI's hours into pieces Matt wants more of** (his 2026-10-30 rule), and into one hand-made hero room per stage.
- **The research and the games agree with it**: Spelunky and Dead Cells shipped this shape; SMBF shows what happens without the hero
  room and without proven joins; NSMB shows what happens when a world reuses another's look.
- **[11-05 confirmed]** R1 §2 L1 (every hybrid that shipped), R2 §2 L2 (build by construction) and R4 §2.3 (many small authored
  pieces) all point the same way. 10.0 has the changes A takes on from them.
- B is my second choice and its parts are not wasted: A's prover IS B's constraint checker run once per room, and B's solver can later
  fill a coverage hole by composing a candidate room for a human to approve.

### 10.2 What would make me drop it
- The in-order QA recording of the first five room-built stages still reads "the same stage played again" (look-alike above 0.30
  between neighbours in more than 1 pair in 5, or the quality supervisor's verdict), with hero rooms in place.
- Proving a room takes more than about 30 minutes of helper time on average, or a world needs more than about 45 rooms (against 2.6's floor of 28 + 9 hero rooms) to fill its
  coverage table, so a stage costs more than about 1.5 hours.
  **[11-05 changed]** The room-count half of this condition is withdrawn. Shipped games use several times more units than slots
  (R1 §2 L3; R4 §2.3), and Matt's rule wants more pieces. The count would fire by design at about 50-70 rooms. The condition is now
  on time only: more than about 30 minutes a room on average, or more than about 1.5 h a stage once a world's rooms exist.
- **[11-05 new]** The bots cannot be calibrated: after fitting to the testers' recordings (R4 §6 idea 4), the first-timer's
  per-stage lives still miss the testers' by more than about 25%. Rooms' costs and risks would then be guesses, and the cadence and
  risk budget would rest on nothing.
- **[11-05 new]** Option A's own kind gate fails on built stages: two kinds over 50% of landings, or zigzag over about 45%, on more
  than 1 stage in 5 after the World 1 coverage table has no holes. That would mean hand rooms still speak a few words, and the
  vocabulary must come from a grammar (B's tier) rather than from more rooms.
- Re-tracing across a world's tempo range breaks more than 1 room in 5 (section 2.4 measured 1 in 8 tempo-dependent, 2 in 8 broken
  everywhere and caught at authoring), which would mean rooms are really pixels.

### 10.3 What I rejected and why
- **Roll and curate as gen2 does it**: World 8's ~13 hours of re-curation (SR:150-152); gen2's worlds still alike with a deck
  (LEG:420-421). Checks select instead of build.
- **Wave Function Collapse**: no control over difficulty, stops on a missing piece, fails global reachability (CA:607-615,
  CA:1004-1011, GE:31); measured 8.8-23% unplayable (CA:1130-1143).
- **Evolutionary search**: thousands of evaluations a level (GE:50), each a real-engine run for us.
- **An AI writing each stage's geometry by hand**: the 400-1,200 lines a stage we pay for today (LEG:112-115), and the source of
  most of today's bugs.
- **The music's score as the layout** (Gemini's wild card, GE:77-81): our music changes per session (LEG:415).
  **[11-05 reopened]** R2 points out that our themes are symbolic (bars of tokens, `src/audio/form.ts:31-56`), so each note onset of
  a stage's theme is known exactly. Take-offs placed on a *selection* of those onsets (accents for jumps, held notes for swings or
  waits) would give each stage a rhythm that differs because its tune differs (R2 §3.20, §5 idea 12). The rejection stands only if
  a stage's theme really changes from session to session. That needs one check of LEG:415 against `styles.ts` / `form.ts` before
  World 2's specs. Not checked tonight (no experiments, per the lead).
- **[11-05 new] Learning from examples (n-grams, GANs) and ASP solvers as the generator.** We have a handful of beat-built stages,
  not a corpus, and learning from them would copy the sameness. ASP cannot express our floating-point physics (R2 §3.11, §3.16).
- **[11-05 new] A genetic algorithm on pacing.** Hours a run (R2 §3.6), and a periodic fitness gives levels "much more regular than
  what is observed" (R2 §2 L6).
- **One fixed tension curve copied into every spec** (GE:133-150): the curve itself becomes the pattern (LEG:442-444; L04b item 10).
- **Gemini's difficulty formula** (GE:243-245): World 2's stage 8 harder than World 4's first (LEG:228-232), against SR §1b.

---

## 11. The game plan for Option A (data, modules, build order, gates)

### 11.1 Data formats

```ts
// one per world (about 40 lines)
interface WorldProfile {
  world: number;
  meter: 8 | 12;                     // eighths per bar (W3, W8: 12)
  tempoFrom: 'music';                // never typed: read stageBpm / styles.ts range
  pairs: string[];                   // the world's own pairs; returning pairs listed separately
  returning: string[];               // earlier-world rooms allowed back, changed (SR:93-99)
  hazards: HazardBlock[];            // the world's obstacle blocks
  art: { surfaces: Record<Surface, string[]>; dressing: string[] };   // painted sets
  density: { normal: [number, number]; easy: [number, number] };      // actions per second (2.3)
  gap: { normal: [number, number]; easy: [number, number] };          // share of clumsy reach (2.3)
}

// one per room (about 40-80 lines)
interface Room {
  id: string;                        // 'w2-log-roll-pair'
  world: number; job: Job;           // intro | ramp | spike | rest | counter | climax | cool | puzzle | hero
  pair?: string; dir: 'right' | 'left' | 'up' | 'down';
  bars: string[];                    // 'x..o....' (or 12 slots)
  steps: Array<{ move: Move; dy: number; surface: Surface; holder: Holder }>;  // holder: trunk | posts | root | rope | ground
  slots: Array<{ step: number; kind: 'hazard' | 'animal'; allow: string[] }>;
  petals: Array<{ step: number; at: 'takeoff' | 'apex' | 'landing'; road?: 'high' | 'low' }>;
  doors: { in: Door; out: Door };    // { band: 'LOW' | 'MID' | 'HIGH', dir }
  tempo: [number, number];           // proven range (narrowed by the prover)
  mirror: boolean; teaches?: string; art: string;
  problem: string;                   // Dahlskog's record: what the player could otherwise do without risk ("walk under the branches")
  solution: string;                  // how this room forces the skill ("the floor ends: the only way on is the swing")
  cost: number;                      // Sure Footing's cost: the room's difficulty, measured by the bots, so tension picks rooms by number
  // [11-05 new] fields the notes require
  kinds: string[];                   // per step: move x up/flat/down x surface x hazard, e.g. 'jU-branch' (R2 §5 idea 1); the kind gate reads these
  risk: { normal: number; easy: number };   // expected falls, from calibrated bots (R3 F1, R4 §6 idea 3); never typed by the author
  window: number[];                  // per step: landing-pad spare px over the tracer's (longX - shortX) (R2 §5 idea 10)
  cadence?: 'drop' | 'vine-catch' | 'stop-look' | 'stair';   // job 'cadence' rooms: how a group ends (R2 §5 idea 6)
  validates?: string;                // the safe, blocking second step of teaching a mechanic (R1 §2 L5)
  rare?: boolean; notBefore?: number;      // Spelunky 2's !rare (about 5%) and !hard (R1 §3.1)
}
// [11-05 new] bars also take 'w': wait on this ledge until something passes (Launchpad's wait-move; R2 §3.3, §5 idea 2).
// A wait is time on one ledge, so the tracer can check it.

// one per stage (about 20 lines): section 5.2
interface StageSpec { id: string; shape: Shape; pair: string; feel: string;
  nodes: Array<{ job: Job; tension: number; deck: string[] | { high: string[]; low: string[] } }>;
  hero: string; petals: { goalShare: number }; length: { skilledMin: 120; target: 150 } }
// [11-05 new] on StageSpec: signature (one short phrase, unique across the game; Wonder's three tests, R1 §2 L6);
// risk: { normal: number; easy: number } (the stage's E[lives] budget, R3 F1); pool (the stage's themed draw from the
// world: two hazards, one surface family; R4 §6 idea 9). On WorldProfile: density bands marked provisional until calibrated
// on Matt's ranked stages (R3 F13, W2; F15 for how to ask him).
```

### 11.2 Modules (each small enough that a helper loads two files: `engine/types.ts` and the one it edits)

| Module | Job | Owner rule |
|---|---|---|
| `engine/types.ts` | the formats above; the one move token type (move x direction x what's under), shared with tools/validate | frozen; changes reviewed by the lead |
| `engine/trace.ts` | THE beat tracer (one copy, merged from w1-rhythm and w1-rhythm-b), grown to vines, ropes, mushrooms, wind and 12-time bars | only file that places geometry |
| `engine/formulas.ts` | section 2.3 as functions of (world, setting, tension, bpm) | the builder and the checker both import it |
| `engine/prove.ts` | proves a room over its range; narrows its tempo range; writes a proof record | runs in CI on every room |
| `engine/coverage.ts` | the per-world table of (job, door in, door out, dir) with room counts; fails on a hole | a gate |
| `engine/roll.ts` | spec + seed + setting -> rooms in order (shuffle bag, cooldown, door and density filters, hazard fill, mirror) | the only roll |
| `engine/stageCheck.ts` | the arithmetic checks of 5.1.6, before tracing | a gate |
| `engine/build.ts` | rolled rooms -> traced stage -> the game's Platform/Vine/Enemy lists (art from the room) | one place |
| `engine/blame.ts` | every failure as {room, step, rule, measured, limit, fix hint} (GE:476-487's idea, LEG:131-136) | every module reports through it |

`splitPetals` (three copies) and `fitSteps` retire: petals are room data; steps are written, never drawn at random.

**[11-05 new]** Four more modules:

| Module | Job | Owner rule |
|---|---|---|
| `engine/reach.ts` (inside trace.ts) | `reachable(move, dy, setting)`: exactly the tracer's `TRIES`. Everything that asks "can he get there" calls it (R4 §6 idea 2) | a property test runs every palette and room option against it |
| `engine/report.ts` | counts every rejection by rule, and every option, room and section by how often shipped rolls lay it (R4 §5.3, §6 idea 1) | a gate: one rule over half of a node's tries, or an option never laid, fails |
| `engine/catalog.ts` | a one-screen text per layout (nodes, bars, steps as move/dy/surface, ledges, petals, goal), checked in and diffed in CI: "if this was intentional, regenerate the catalog" (Brogue CE, R4 §4, §6 idea 11) | the lead reviews a generator change as a text diff |
| `engine/rate.ts` | room cost and risk from calibrated bots; stage ratings and a world's band (Glicko-2 with phantom matches, R3 §2 F16) | the only source of `cost` and `risk` |

### 11.3 Build order (each step has a number that says it worked)

0. **[11-05 new] Fixes to today's code that hold under any option** (on hold with the rest, while Matt's week budget is past its
   limit; listed so they are not lost):
   - one reach predicate shared by `fitSteps` and `traceNode`, with a test over every WR palette (R4 §6 idea 2);
   - the rejection and coverage report (R4 §6 idea 1);
   - one double-jump rule shared by the validator and the inspector (R3 §3 W3);
   - one relative group boundary in `groupsOf` (R3 §2 F13).

   *Done when:* 1-2's rejected tries fall well below half (from 932 Normal / 2,346 Easy), no palette option is laid 0 times,
   1-6's J-needs-double count matches the inspector's `dblNeeded`, and World 1's phrases are measured.
1. **Merge the two tracers into `engine/trace.ts`** and add the shared token type; the validator's tokens come from it. *Done when:*
   both W1 branches' tests pass on the one tracer; `grep` finds one `traceNode`.
2. **Room format + prover, on what already exists**: cut 1-2's and 1-5's nodes (WR) into rooms; prove each over W1's range and Easy.
   *Done when:* every room has a proof record; the prover rejects the two bad pieces of section 2.4 with their reasons.
3. **Roll + stage check + build for World 1**: rebuild 1-2 from a spec. *Done when:* 16 rolls, Normal and Easy, pass funcheck with no
   new flags; the petal share test passes by arithmetic on every roll; Easy's density sits in its own band (0.35-0.55 a second, 2.5
   finding 1) and Normal's gap share spreads at least 0.25 wide p10-p90 (2.5 finding 2); time from spec to gated stage is measured
   (target: under an hour of helper time) and written down.
4. **Coverage table for World 1**; write the missing rooms. *Done when:* no hole; 4+ rooms per job, 8+ distinguishable moves, 8+
   hazard blocks (2.6); the expressive-range run (16 rolls x 9 stages) shows neighbour cosine under 0.45 on 95% of pairs and the
   look-alike measure under 0.30, measured on the built stages, not the simulation.
   **[11-05 changed]** "4+ rooms per job" becomes "at least 2 eligible rooms per slot after the teaching cut" (2.6). The cosine
   target is kept but no longer counts as evidence, since it already sits at 0.00-0.10 (R3 W11). *Done when* adds:
   - the kind gate passes (no two kinds over 50%, zigzag at or under about 45%);
   - the kind-string compression distance between stages sits inside the calibrated 0.09-0.62 range, at a band set from Matt's
     ranked stages;
   - every teach room fails the limited-agent bot.
5. **Tracer growth**: vines with the beat-locked period (2.3), ropes, mushrooms, wind, 12-time bars. *Done when:* each new move has
   a proven test room at every tempo of the worlds that use it.
6. **World 2 end to end** (the research's own bar: World 1 AND World 2 before scaling, L04b item 15). *Done when:* the quality
   supervisor's in-order play of World 1 into World 2 finds no stage "like the one before", and Matt's rating.
7. Then one world at a time: profile, rooms, coverage, specs, gates.

### 11.4 Gates (CI, on every push)
- every room proven over its range (prove.ts), both settings;
- the coverage table has no hole for any stage spec;
- the stage check passes for every spec, for 16 seeds, both settings;
- the validator's tokens equal the builder's tokens for every rolled stage (the end of "two descriptions");
- per stage: Easy density inside Easy's band; Normal gap-share spread at least 0.25 (p10-p90); the engine's expressive range over
  16 rolls of every stage (LP §V, TFDG §7: measure the generator, not one output);
- the existing gates (CLAUDE.md: tsc, tests, vite build, perf, clip, known, roadmap, fun).
- **[11-05 new]**
  - the reach property test (proposer = prover = tracer);
  - the rejection/coverage report, failing on a dead option or on one rule eating over half of a node's tries;
  - the kind gate and the zigzag cap;
  - the risk budget per node and per stage;
  - phrases by the relative boundary inside 5-20 s;
  - the limited-agent gate on every teach room;
  - the stage catalog diff;
  - a flaky check retried once before it turns red, with a weekly list of checks that flicker (Sea of Thieves, R4 §4, §6 idea 10).

  Speed matters as much as coverage: a per-node check runs in milliseconds (a node traces in 4-7 ms, R4 §5.2), so a helper gets
  pass/fail before the 2-minute fun gate. As R4 §4 quotes: "Give Claude something it can run that comes back pass or fail".

### 11.5 The first measurable step (tomorrow, about 2 hours)
Steps 1 and 2 above on 1-2 only: one tracer, 1-2 cut into rooms, every room proven. The number: how many of 1-2's nodes prove clean
over World 1's tempo range on both settings, and how long cutting and proving took.
**[11-05 changed]** Step 0's reach predicate comes first in the same 2 hours, because the prover must use it. A second number is
added: the kinds per take-off and the zigzag share of the cut rooms. That shows on day one whether 1-2's rooms, as written, already
fail the kind gate. R2's numbers say they will: 1-2 kinds on the canopy, 66% zigzag.

---

## 12. Method, and what is still unproven

- **Measured here**: the reach envelope (2.1), the beat grid (2.2), the re-trace test (2.4) with `reference/engine/designer-measure.ts.txt`;
  the calibration on 1-2 and 1-5 (2.5) with `reference/engine/designer-calib.ts.txt` (both run in a checkout of origin/w1-rhythm, renamed to .ts and copied to
  its root: `npx tsx designer-measure.ts`); the variety maths (2.6) with `reference/engine/designer-varsim.py` (`python3 -I`).
- **Traced in the code**: the eight failures (section 1), each to its commit.
- **Unproven**: every cost and time estimate; that 2.6's floor (28 rooms, 8 hazard blocks, 8+ moves a world) is enough for felt variety (the drop test in
  10.2 decides); that bots can fill Option C's archive; the Tiny Wings hill algorithm (Illiger's interview page was blocked); the
  Jetpack Joyride chunk format (the GDC page has no detail).
- **The 12-time bar** for Worlds 3 and 8 is engine work none of the code does today.
- **[11-05 new] Unproven after the notes, and what decides each:**
  - every risk and success target in 2.3 (estimates; Matt's play and calibrated bots decide);
  - the 2x relative group ratio (R3 §4.5: 1.5x and 2.5x give different phrases; Matt's ranking decides);
  - the "2 eligible rooms per slot" target and the 50-70 room estimate (no source gives it for a beat game; the coverage table
    decides);
  - whether the 1-1 Easy 6% jump is real (the two bots disagree; one look on a phone decides, R3 §4.7);
  - whether a stage's theme is fixed, which reopens 10.3 (one code check);
  - whether the beat should frame every stage (Matt decides, 10.0).
- **[11-05 new] Not done by me tonight, on the lead's instruction:**
  - no new experiments; every new number above is the research team's, cited to its note;
  - the notes' source lists were not re-opened by me. The lead checked 32 of their quotes against the fetched pages.
