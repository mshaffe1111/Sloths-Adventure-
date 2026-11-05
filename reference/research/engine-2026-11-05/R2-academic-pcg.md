# R2: the academic and technical state of the art in platformer level generation

Researcher 2 of 4, 2026-11-05. Topic: what the papers say about building platformer levels that are right by construction and still
different from each other, checked against our code (`src/game/beatTrace.ts`, `src/game/w1Rhythm.ts`, `src/game/physics.ts`,
`src/game/gen2/`, `tools/validate/`, `tools/inspect/`). One file. No other file edited, nothing committed.

How to read the marks: **[measured]** = a number I measured in our code today, or a number the paper itself reports from its own
experiment; **[estimate]** = my judgement or arithmetic on someone else's numbers. Quotes are verbatim from the PDF text I fetched
(PDF line breaks removed). Code citations are `file:line` on this checkout (branch `ccr-0d59a91c-oy3imz`, which has `beatTrace.ts` and
`w1Rhythm.ts`).

---

## 1. Planned vs actual time

- Planned: about 75 minutes.
- Actual: started 02:17 UTC (9:17 PM ET, Nov 4), finished __END__ (see the last line of this file). __ACTUAL__
- Where it went: about 35 minutes reading 24 primary sources (section 6), about 30 minutes on the code experiment (section 4: three
  versions of the script, two of them killed and redesigned when the exhaustive search proved too big), the rest writing.
- What was cut: the Smith & Whitehead 2010 expressive-range workshop paper and the Dormans 2010 paper could not be fetched (both
  bot-walled or unreachable, section 6); I read their methods where the same authors re-published them (Launchpad TCIAIG 2011 §V carries
  the expressive-range method; PCG book ch. 5, co-written by Dormans, carries the mission/space grammars). The Polymorph paper was
  bot-walled too.

---

## 2. The big lessons, ranked, for our engine

Ranked by how much each changes "80% right by construction" and "every stage feels the same".

1. **Our variety problem is a vocabulary problem, not a randomness problem.** Launchpad gets variety from many *kinds* of geometry
   per beat: "The rhythm-based generator provides 14 different kinds of geometry for jumps, 5 different kinds of geometry for moves,
   three different types of rhythm, four different lengths of rhythm, and three different densities" (Smith et al. 2009, §8.2).
   Tanagra has five single-beat patterns plus multi-beat ones; Dahlskog & Togelius found 23 patterns in 5 families in Super Mario Bros.
   I measured our beat-built 1-2 (section 4): one rhythm admits **3,366 to about 3 million** different geometries, but every take-off
   lands on one of **one or two kinds of thing** (a jump onto a branch, a hop onto a branch) on the canopy, and three on the floor.
   The dice only move heights by 10-20 px. That is numeric variety, which players do not see as variety. Launchpad's evaluation
   says the same about Notch's generator: low compression distance "corresponds very well with qualitative observations that the
   levels in Infinite Mario Bros appear quite similar to each other" (Horn et al. 2014, §4.1). **For the engine: a beat's geometry
   must be drawn from a grammar of kinds (Launchpad's Fig. 7: flat gap, gap/no-gap x jump-up/down/spring/fall, enemy-kill,
   enemy-avoid, stomper for wait-move, moving platform for wait-move-wait), and the variety gate must count kinds, not pixels.**

2. **Build by construction; keep checks as the backstop. Every method that did not, paid for it.** Launchpad: "Launchpad can
   guarantee level playability by creating locally playable components and connecting them with safe walking areas" (§VI). Tanagra:
   "a physics model ... guarantees that all geometry placed into the level is playable and meets beat duration constraints" (§3).
   Sorenson & Pasquier's relative encoding: "all unplayable levels are eliminated from the evolutionary search space with this
   encoding" (ICCC 2010, §3.4). Against: ORE "fails to guarantee playability ... it does sometimes create unbeatable levels" (§IV-E);
   Kid Icarus bigram levels were playable 6 times in 1,000 before repair **[measured by Cooper & Sarkar 2020, Table 1]**; Carmo's WFC
   8.8-23% unplayable (LEDGER-ENGINE-PAPERS row 52). Our tracer already is this: on canopy nodes **100% of the sequences fitSteps can
   draw pass the full tracer, Easy trace and checkTrace [measured, section 4]**. Keep it, and extend it, not replace it.

3. **Choose the pattern first, solve its numbers second, and let the numbers flow.** Tanagra: "We have found it useful to keep separate
   the choice of a geometry pattern (using ABL) from the instantiation of that pattern (using Choco), as the precise placement of level
   components is influenced by surrounding geometry" (§5). Its backtracking order is the recipe for our node planner: "1. Relaxing
   absolute positioning constraints on other geometry ... 2. Choose a different geometry pattern ... 3. ... choose new geometry for
   either the next or previous beat" (§5.5). Ours mixes the two: `fitSteps` rolls move, height and surface together and retries
   (w1Rhythm.ts:155-229). On floor nodes that blind retry rejects about half of what it draws (section 4).

4. **Local grammars overgenerate; global intent needs critics, and rich per-region intent needs search, not more rolls.** Smith 2009:
   "design grammars are good at capturing local constraints, but some design constraints are global" (§5). Launchpad's own discussion
   names our case: "if the design criteria became more sophisticated, for example by allowing a designer to specify the kinds of
   geometry in particular regions of a level, then a search-based stitching together of rhythm groups may become more appropriate, as
   the number of candidate levels required ... would be prohibitive" (§VI). A stage spec with a tagged node plan *is* that case. gen2's
   "build a few hundred rolls ... keep the best 16" (gen2/DESIGN.md Part A) is Launchpad's critic stage; it works for global taste,
   not for "this node must teach the twig".

5. **A mechanic must be required, not just present.** Nelson & Smith (PCG book ch. 8.6) generate levels where a property is
   "unavoidable across all alternative solutions"; Green et al. 2018 accept a scene only if "a perfect agent ... wins a level while an
   agent that cannot perform one mechanic loses". We already lost a teach this way: "A catch under the gap made the jump optional: the
   quick route walked off onto it and stepped up" (w1Rhythm.ts:563-564). A "limited-agent" gate (the bot with the mechanic switched
   off must fail the teach node; the full bot must pass) is cheap with our bots and is not in any of our research (section 5).

6. **Difficulty and pacing are curves you build to, with a real arc, not a constant or a sawtooth.** Sorenson & Pasquier: a flow
   fitness gave "a chaotic scattering of platforms" with constant anxiety; a periodic one gave rhythm groups but "its cyclical
   appearance is much more regular than what is observed in the Super Mario Bros. levels" with no peak near the end (§3.4-3.5). Their
   anxiety model is one line: da/dt = c(t) - c_decay. Compton & Mateas measure a jump's difficulty as the "spatial window the avatar can
   start from" and the "temporal window" to correct in mid-air; our tracer already computes both (Landing.shortX/longX/lateX,
   beatTrace.ts:84-110) and throws them away as a pass/fail.

7. **Mixed-initiative beats batch generation for a small team.** Tanagra exists because "Making a change to a small section of a level,
   such as moving a single platform, can have a wide impact and require much of the rest of the level to be modified" (§1), exactly our
   12-hour hand builds. Its trick for local edits is new to our research: "Tanagra sets additional constraints on the solver, that the
   value of a variable should be the same as the last time the solver was run. These constraints are then relaxed if no solution can be
   found" (§5.1).

8. **Players punished hard levels in every study.** Mario AI 2010: "levels with fewer coins and rocks, smaller gaps, and even
   distribution of enemies are, in general, preferred" and "the simplest solution won" (Shaker et al. 2011, §VI, §VII-B). The music
   auto-runner thesis: "users had a very low completion rate", and "consider a level that has 10 rhythmic beats in it, and each beat is
   matched by a jump. The feeling for the user would be very monotonous" (Vanparijs 2022, ch. 6). Beat-locking every take-off is a
   risk of its own.

---

## 3. Per method

Each entry: how it works; how it guarantees playability and variety; cost to build and debug; how it fails; fit for us (a touch-only,
30 fps, beat- and physics-driven phone platformer, 10 worlds x 10 stages, one lead plus AI helpers).

### 3.1 Compton & Mateas 2006, "Procedural Level Design for Platform Games" (AIIDE)

**How.** A four-layer hierarchy: components -> patterns -> cells -> cell structures, "inspired by 'A Novel Representation for Rhythmic
Structure'" from music. Four pattern types: "Basic ... a component, either by itself, or repeated several times with no variation";
"Complex ... the same component, but with the tweaks changed according to some set sequence, such as a series of horizontal jumps of
increasing width"; "Compound ... alternates between basic patterns made of two different types of components ... introduce a rhythmic
pattern at a higher level of abstraction, in the form of changing the rhythm in a rhythmic manner"; "Composite ... two components placed
so close to each other that they require a different kind of action, or a coordinated action, that would not be required for each one
individually". Patterns are built by "hill-climbing towards the target difficulty".

**Guarantees.** A physics model over edges: "basic ballistics calculations can determine where, if at all, the avatar would hit the
second edge"; it computes "the spatial window the avatar can start from" and "the temporal window the player has to change direction
mid-air". Variety comes from the pattern grammar. Failure handling: "Catastrophic results ... are overwritten by testing multiple sets
and numbers of components."

**Cost / failure.** Only a prototype ("an algorithm for building cell structures has been designed, but is not yet implemented"). The
grammar is small to write; the difficulty calculator is the costly part (we already have its equivalent).

**Fit.** High, and the vocabulary is the useful part. "Compound" (the rhythm of the rhythm) and "composite" (two things close enough to
need one coordinated action) are exactly the two things a node plan should be able to ask for. Our NodeSpec has bars and steps
(beatTrace.ts:58-74) but no notion of a pattern made of patterns.

### 3.2 Smith, Cha, Whitehead 2008, "A Framework for Analysis of 2D Platformer Levels"

**How.** Defines rhythm groups: "short, nonoverlapping sets of components that encapsulate an area of challenge ... analogous to
musical phrases. They have a distinct start, middle, and end, and culminate in a cadence ... a place where the rhythm of the player's
movement significantly changes." Coins can split groups: the boundary is where "the player has an opportunity to pause". Cells and
portals model branching.

**Fit.** Already in our rules (STAGE-RULES 43; ledgers). What is not: the **cadence** as a designed thing (a change of rhythm, not only a
flat rest). Our nodes all end on the same flat 200 px apron (beatTrace.ts:146, APRON), a single cadence type.

### 3.3 Smith, Treanor, Whitehead, Mateas 2009, "Rhythm-Based Level Generation for 2D Platformers" (FDG)

**How.** Two tiers: a rhythm generator picks verbs ("move" and "jump", with start and end times; the jump's length is "the amount of
time the player will hold down the 'jump' button"), beat type "regular", "random" or "swing", length 5-20 s, density low/medium/high.
The geometry grammar (its Fig. 7) turns movement states and queued jumps into geometry: `Moving -> Sloped | flat_platform`;
`Jumping -> flat_gap | (gap | no_gap) (jump_up | Down | spring | fall) | enemy_kill | enemy_avoid`; `Waiting-Moving -> stomper`;
`Waiting-Moving-Waiting -> moving_platform_vert | moving_platform_horiz`. "The separation of tiers ensures that the intended rhythm is
always present, regardless of geometric representation." Rhythm groups are joined by "a small platform that acts as a rest area".

**Guarantees.** Playability from the physics model: "the type of jump that the geometry generator chooses at any time must be
constrained by the start time for the next jump, ensuring that one jump finishes before the next jump begins". Variety from the grammar,
then **critics** over 1,000 candidates: a line-distance critic and a chi-square component-frequency critic, because "the level design
space specified by the grammar is simply too large and results in many levels that are undesirable. Attempts to tighten the grammar to
eliminate undesirable levels generally results in eliminating some number of desirable levels."

**Cost.** Small: verbs, a ballistic model, a grammar table, two critics. **Failure.** Its own words: an early attempt that placed
platforms randomly along a line gave levels that were "playable, but they were visually unappealing and not much fun" (§8.1), and
critic values show "a distinct peak far from the lowest value", so most of the 1,000 are thrown away.

**Fit.** Our beatTrace is this paper's rhythm tier done with real physics and a clumsy thumb (beatTrace.ts:1-37, 326-338): stronger on
playability than the paper. Its geometry tier is where we are thin (lesson 1). Note its "waiting" verb: geometry for a *wait* (stomper,
moving platform). Our bars have only take-offs and running ('.'), no wait verb (beatTrace.ts:184-208), so a beat that asks Pokey to
*stop* (a snake passing, a falling twig) cannot be written.

### 3.4 Launchpad: Smith, Whitehead, Mateas, Treanor, March, Cha 2011 (IEEE TCIAIG 3(1))

**How.** The 2009 system, extended and evaluated. Rhythm is generated first; "Received verbs are first converted into a list of
movement states and a queue of jump commands"; jumps "consume some amount of the movement state list", e.g. a flat gap 0.5 s, a spring
1.5 s, and "if the second jump were to occur at 3 s rather than 4 s, the jump onto a spring would no longer be a valid jump" (§IV-B).
Global passes: coins "at the peak of jumps that go over gaps" and a common ground plane.

**Guarantees.** As 2009 (§VI quote in lesson 2). Variety measured by expressive range: linearity (regression on platform centres) and
leniency (a weight per component), 10,000 levels, hex-bin plots, plus Levenshtein edit distance between rhythm groups' geometry codes
with "an insertion and deletion cost of 2 and customized substitution costs", clustered into a treemap.

**How it failed (their findings, worth gold to us).**
- A small "make patterns" rule backfired: "When a component is chosen for inclusion in a rhythm group, the probability of that
  component appearing again is slightly increased ... components that incur a height difference ... are likely to stack up to create
  linear segments of the level. The linearity bias is an unintended side effect" (§V-D).
- Tight rhythms filter geometry: "swing and random rhythms are more constraining ... the physics system filtering out potential geometry
  for beats due to the requirement for the avatar to land before the next jump occurs" -> "a large number of rhythm groups that contain
  geometry that forms an upward staircase pattern" (§V-D). Long components get starved: "new components that require longer amounts of
  time to cross (e.g., a loop-de-loop ...) may be chosen less frequently than desired without also performing tuning on the rhythm
  generator" (§VI).
- A grammar overlap biased the mix: "the wait-move-wait pattern also contains a wait-move, meaning the stomper can be chosen in that
  situation as well. This biases the generator towards creating a larger number of stompers than expected" (§V-D).
- Single path only: "Launchpad does not support the player choosing a path ... and do not support the player turning around" (§V-A).

**Cost.** Low to build; the evaluation tooling is the larger part. **Fit.** Very high. We should copy its *instrumentation* habit (it
found three biases its authors did not intend) and its kind grammar. Our tracer shows the same rhythm-filters-geometry effect: on fast
bars only hops fit (w1Rhythm.ts:210-212: jump only if `room > 0.6`), so dense swung bars become hop staircases, the same failure.

### 3.5 Tanagra: Smith, Whitehead, Mateas, FDG 2010 (the long paper, not the 2-page demo in our repo)

**How.** Beats hold patterns; "ABL chooses the level components that should be placed, while the constraint solver determines their
exact location." Choco variables per platform ("startX, endX, startY, endY, width, and height" with "startX + width = endX"); a gap ties
two platforms ("p1.endX + g.width = p2.startX; p1.endY + g.height = p2.startY"). Editing: draw, remove, "glue", replace geometry; beat
timeline: remove, split, resize beat, so "pacing changes without the need to manipulate geometry".

**Guarantees.** Playability from the physics model and solver; if impossible, it "informs the designer that there is no level that
meets their requirements". Search limits: "typically, solutions are found within 5 milliseconds ... It can take significantly longer to
exhaustively determine that there is no solution, so Tanagra stops itself from searching after 500 milliseconds". Variety: "Choco is
instructed to use a random value in the domain of the variable each time it has to make a decision"; but stability: "the value of a
variable should be the same as the last time the solver was run. These constraints are then relaxed if no solution can be found."

**Expressive range [measured by the authors, 500 levels].** "Tanagra is slightly biased towards creating more linear levels; we
hypothesize that this is because there are more instantiations of geometry patterns that have no height variation", and "biased towards
... more unforgiving levels ... because there are more geometry patterns that contain a level component classified as unforgiving".
Leniency weights: "flat platform: -2, jump to platform with no gap: -1, jump to platform with gap, enemies, or stompers: 1".

**Cost.** Highest of the constructive set: a reactive planner, a solver, working memory, backtracking. **Fit.** Take the architecture
(pattern then numbers; pins; stability-then-relax; a time budget with "no solution" reported), not ABL/Choco. A small TypeScript search
over our steps suffices (section 4 says what that search must check at each prefix).

### 3.6 Sorenson & Pasquier 2010, "The Evolution of Fun" (ICCC) and their Mario AI entry

**How.** A genetic algorithm whose fitness is a model of challenge over time. Challenge of a jump: "c(t) = d(p1,p2) - (fp(p1) + fp(p2))
+ 2fp_max" with the "landing footprint" as margin of error; anxiety "da/dt = c(t) - c_decay"; enemies counted "as a small gap".
Genome: "a sequence of x, y coordinates ... relative to the preceding platform ... the range of these offsets can be limited to the
maximum distance a game character can jump". In the Mario AI entry (Shaker et al. 2011, §V-C) the encoding became free-form, so
"crossover and mutation operations often yield infeasible offspring ... A constraint satisfaction subsystem is used to repair these";
and it supports anchors: "if a designer creates a very challenging segment of a level by hand, the algorithm will naturally create
easier segments on either side".

**Guarantees.** Playability by encoding (relative offsets within reach) or by repair. Variety from the GA. **Cost.** "population
consists of 200 individuals that are evolved for 10,000 generations ... running time was on the order of several hours" (ICCC §3.4); in
the competition, offline only, but "if the original population ... is seeded with existing well-designed levels, new viable designs can
be found quickly, even within the one minute time limit". **Failure.** Flow model: chaos with flat anxiety; periodic model: too regular,
no climax (lesson 6).

**Fit.** The relative encoding is what our tracer already does. The anxiety integral is a two-line, cheap pacing check we could run on
our Trace (it is close to tools/inspect/pacing.ts "tension"), but use it as a target curve, not a fitness to evolve against. GA: no
(hours, untestable on a phone budget).

### 3.7 Mario AI Championship 2010, level generation track (Shaker, Togelius, Yannakakis et al., TCIAIG 3(4) 2011)

**How.** Six entries generating levels for a player's style; judges played pairs and picked the more fun one.
- Weber's ProMP (winner): six left-to-right passes, 14 events with hand weights; playability "by imposing constraints on the items
  created" (PCG book ch. 3.7.2). Weakness by its author: "scaling up the range of the generator is nonintuitive, because adding new event
  types or additional passes may break previously playable levels".
- Shimizu & Hashiyama (2nd): parts evolved offline by designers through interactive evolution, connected left to right; "If there is
  not enough variety in the parts pool, the generated levels may be monotonous".
- Sorenson & Pasquier: GA + constraint repair (3.6). Mawhorter: ORE (3.8). Takahashi & Smith: Hopper, tile-by-tile probabilities that
  rise "with the distance from the last such feature".

**Results [measured by the organisers, 15 judges].** Winner by one vote; "the relationship between level characteristics and fun is
most likely not a simple linear function"; preferred: fewer coins and rocks, smaller gaps, evenly spread enemies; "the simplest solution
won ... it does not attempt any form of large-scale level structure, pacing or anything similar". The authors' own caveat: "imperfect
implementation and a lack of fine-tuning were responsible for the relative failure of the more complex level generators". Protocol
lessons: judges "should play not one but several levels generated by the same level generator ... a generator that always outputs the
same level would probably come across as boring"; and use "A four-alternative forced-choice questionnaire" (adds "both equally fun" and
"neither").

**Fit.** Medium as a method; high as a warning (dense micro-detail reads as structure; hard levels lose) and as a test protocol for our
QA (section 5).

### 3.8 ORE: Mawhorter & Mateas 2010 (CIG)

**How.** Chunks with "anchor points, which represent positions that the player might occupy"; repeatedly pick an anchor, pick a
compatible chunk, integrate; then post-process. "Our current implementation uses a library of 42 chunks, the largest of which is
10x10 tiles"; "it takes around 15 seconds to generate a complete level".

**Guarantees.** None for playability, by design: "it is designed with variety rather than playability as the primary goal". Variety:
emergent combinations "a generator that regularly surprises even its author" (Mario AI paper §V-D).

**Failure.** "it does sometimes create unbeatable levels"; Fig. 8 shows "an unreachable area, a trapped enemy, a location where the
player can get stuck, and a graphical artifact"; "chunk authoring is not an interface that provides much leverage on level design".
**Fit.** Low as a generator for us (no guarantee). One idea worth taking: a chunk library "automatically extracted from a level by
following a play trace through the level and taking periodic snapshots" (§V-B): our Trace already is a play trace.

### 3.9 Dahlskog & Togelius 2013, "Patterns as Objectives for Level Generation" (DPG/FDG workshop)

**How.** 23 patterns in 5 families (Enemies, Gaps, Valleys, Multiple paths, Stairs) from SMB. Levels are "strings of length 200 with an
alphabet of 24 symbols", each a one-tile vertical slice of SMB; a µ+λ ES (population 200, 10,000 generations) maximises the count of
patterns found; "Unplayable sequences are given a high negative number (but not −∞)".

**Results [measured, 24 players].** Pattern-maximising level β: fun 3.79, similar 4.63, hard 2.38 (6-point scales), "a marginal
difference". Failure: "the content alternate[s] between high-intense and low-intense parts" poorly; "tendencies to tightly stack patterns
and overfilling game space"; "the fine-tuning of the fitness function may be problematic when introducing new patterns since the values
for rewarding or punish the level can affect previous configuration". Their earlier concatenation generator had "some limits in the
aspect of variation of the content. The only variation the prototype demonstrated was due to the parameterization (different height,
different length, amount of rewards, amount of risk)", our exact situation in 1-2.

**Fit.** Patterns as *named building blocks* yes (our node plan); patterns as a *fitness to maximise* no (it overfills, and our stages
need rests). Their lesson about parameter-only variation is direct evidence for lesson 1.

### 3.10 Expressive range: Smith & Whitehead 2010; Horn, Dahlskog, Shaker, Smith, Togelius 2014 (FDG)

**How.** Generate many, score each on two or more emergent metrics, plot a 2-D histogram. Horn et al. compare seven generators plus the
original SMB on leniency, linearity (R² of a line on platform end points), density, pattern density, pattern variation and **compression
distance** ("if two strings are similar, you save more space when compressing them together", gzip).

**Results [measured by Horn et al., 1,000 levels each].** Notch generators have the lowest compression distance (0.36-0.53; original SMB
0.76); Launchpad has much higher linearity (0.66) than everyone else (0.02-0.15), "clear that Launchpad was originally designed with
another kind of platform game in mind"; "for lenience, linearity and density ... all generators are bad at providing variance in those
three dimensions".

**Fit.** We already have a 200-roll ERA tool with linearity, leniency and action 3-gram likeness (tools/inspect/era.ts:1-18,
eraRoll.ts:202-220) and a weighted edit distance (tools/inspect/analyze.ts:131-163). What is missing is measuring the *kind* string and
comparing across stages of a world (section 5, idea 4).

### 3.11 Answer set programming: Smith & Mateas 2011 (TCIAIG 3(3)); Nelson & Smith, PCG book ch. 8

**How.** Describe the design space declaratively (choice rules + integrity constraints), let a solver (Clingo) find answer sets. "It is
easier to sculpt a design space by repeatedly carving away undesirable regions (identified by describable flaws) than it is to guess a
procedure which implicitly defines the same space." Playability by generating "a reference solution along with the level design. If a
map contains a valid reference solution, we have a proof (by existence) that it is solvable" (ch. 8.5). Stronger: a property
"unavoidable across all alternative solutions" via a metaprogramming extension that reaches Σ₂ᴾ (ch. 8.6), first developed for
Refraction, where "what makes a given Refraction level desirable ... is strongly tied to which ... skills must be exercised to solve the
level, even if the level admits many possible solutions".

**Cost [measured by the authors].** A 49-line chromatic-maze generator; "generate and save 10 000 unique, desirable mazes ... took 1 s";
"we can only report the generation of a 114-step maze after two hours of computation" at 21x21; "the 'hardest' problems appear to be those
where exactly one answer set ... is the only solution". Limits: "ASP specifically targets NP-complete problems"; floating-point physics is
"impractical with the purely symbolic ASP framework"; "only human inspection is capable of accurately judging the most subtle
properties of artifacts (such as beauty or fun)".

**Fit.** Not Clingo itself (continuous physics, a phone, a TypeScript stack). Take two ideas: (a) express rules as *checkable
constraints on partial designs*, so a search can prune early; (b) "required, not just possible" as a constraint.

### 3.12 WaveFunctionCollapse: Karth & Smith 2017 (FDG); Carmo 2024 (already ledgered)

**How.** WFC is "a non-backtracking, greedy search method": choose the lowest-entropy cell, collapse it by sampled frequency, propagate
arc consistency. Karth & Smith's Clingo surrogate found "zero conflicts" with heuristics disabled, so "the strength of WFC comes from
constraint propagation ... rather than the entropy heuristic". Global constraints break it: requiring every pattern to appear "leads to
hundreds of conflicts for the Skyline scenarios. When Clingo is instructed to globally restart after each conflict (mimicking WFC), it
cannot find a solution within the one-minute timeout"; reachability "a global constraint" needs "a balance of local backtracking and global
restarts".

**Fit.** Low as a generator (our reachability is continuous physics). The transferable lesson: **propagate early, prune partial designs,
backtrack locally**, which is exactly what our exhaustive search in section 4 needed and lacked for leaf-only checks.

### 3.13 Constraint generation with an example playthrough: Cooper, Sturgeon-MKIII 2023 (FDG)

**How.** Encode mechanics as tile rewrite rules over timesteps in one SAT problem, so "the solution to the constraint problem contains
both a level and a playthrough". A 8x12 platformer ("plat") with jump-state tiles, 40 timesteps.

**Failure, in their words.** "Scalability to larger problems may require future work"; "Some of the applications (e.g. plat and vvv) had
relatively low variety"; "the solver would often prefer to generate levels with very short, simple solutions"; "It might be promising to
explore constraint-based approaches to level generation with more continuous physics." **Fit.** Our tracer already yields level +
playthrough (Trace.safe, beatTrace.ts:118-121), with real physics. The warning to keep: solvers drift to the simplest solution unless a
constraint demands otherwise (lesson 5).

### 3.14 Repair instead of regenerate: Cooper & Sarkar 2020 (AIIDE workshop)

**How.** A pathfinder that may make "impossible" moves at a high cost, then edits the level so the path becomes real. **Results
[measured by the authors, 1,000 levels each]:** SMB trigram 995 playable without repair, 5 repaired; Kid Icarus bigram 6 playable, 893
repaired, 101 not; repair agent up to about 4x the default agent's time (150 ms -> 612 ms). **Fit.** gen2 already "fixes just that spot"
(DESIGN.md Part A). For beat nodes the tracer's error already names the step and the reason (beatTrace.ts:380-466): a repair step that
changes only that step is cheaper than `fitSteps`' full reroll.

### 3.15 Grammar/graph missions: Dormans (PCG book ch. 5, Togelius, Shaker & Dormans)

**How.** "A game level is not a singular construction, but rather a combination of two interacting structures: a mission and a space."
Graph grammars for missions (entrance, tasks, locks, keys, goal), applied as scripted rule sequences ("start rule (x1), add task (x6), add
boss (x1), define task (x6), move lock (x5)") because "graph grammars can be hard to control". Multi-step: "Trying to generate everything
at once using only one grammar is a daunting task, and next to impossible to debug and maintain." Three mission-to-space strategies; for
platformers: "Transform a mission into a set of instructions to build a space ... works best for very linear games like platformers".

**Fit.** High for our stage spec (the "mission" = node plan with tags and mechanic pairs; "space" = traced geometry), and for puzzle
rooms with keys (World 5+). Using a fixed rule *sequence* rather than free rewriting is the controllability trick to copy.

### 3.16 Learning from examples: PCGML (Summerville et al. 2018), VGLC, n-grams, MdMCs

**How.** Train on existing levels (n-grams on vertical slices; multi-dimensional Markov chains on tiles; LSTMs; VAEs; GANs). From the
survey: "n = 0 creates essentially random structures and n = 1 creates barely playable levels, n = 2 and n = 3 create rather well-shaped
levels"; this works because of "a large amount of redundancy in the level design"; MCTS on top gives "playability guarantees". Open
problem: "most of this work has relied on designer specified constraints on the generated works ... these do not ensure playability but
instead bias the generators"; and "data scarcity is likely to plague PCGML for the foreseeable future".

**Fit.** Low. We have five beat-built W1 stages, not a corpus, and learning from them would copy the sameness we are fighting (the same
conclusion as LEDGER-ENGINE-GEMINI E57). The one useful piece is the measurement side (n-gram likeness is already in era.ts).

### 3.17 Quality-diversity (MAP-Elites): Sarkar & Cooper 2021; Withington 2020; Khalifa et al. (constrained MAP-Elites)

**How.** "QD algorithms search for a set of diverse and high-quality solutions in a single run by defining subspaces ... that correspond
to different behaviors and return the solution that optimizes a fitness function in each subspace ... a map of cells ... each cell
defines a partition or niche." **Fit.** Medium, as a *selection* rule, not a search: gen2's "keep the best 16 that differ the most"
(DESIGN.md Part A) could become "keep the best roll in each cell of a grid of behaviour features" (e.g. kind mix x height range), which
guarantees coverage instead of hoping distance-based picking finds it.

### 3.18 Music-driven levels: Vanparijs 2022 (Maastricht MSc, The Impossible Game)

**How.** librosa beat tracking -> an action per beat (JUMP / NO JUMP) with a random direction -> a BNF grammar of 13 pieces -> a GA with
critics (line-to-pitch, spike ratio by genre, emptiness, jump ratio, height variety). **Results [measured by the author, 19 survey
respondents].** "the levels were too difficult for the users, as the completion rate was very low"; "the emptiness critic resulted in the
highest correlation to the user ratings"; "the proposed line critic had the strongest negative correlation with user ratings";
monotony when every beat is a jump (lesson 8). **Fit.** The closest published system to our "beat is the music's beat" rule
(beatTrace.ts:600-626). Evidence that following the music too literally costs fun; the rhythm should *select* from the music's grid,
not fill it.

---

## 4. The code experiment and its output

**Question.** Launchpad's claim is "rhythm first, then many geometries per rhythm". Our beatTrace + `fitSteps` does rhythm first too.
For one real rhythm of a real stage: (a) how many geometries does our tracer allow; (b) how often does `fitSteps`' random
generate-and-test fail, and why; (c) would a prefix-pruned search (Tanagra/ASP/WFC style) be cheaper; (d) how many *kinds* of geometry are
in that space (Launchpad's 14 jump kinds vs ours)?

**Method.** Scripts in my scratchpad (not in the repo): `/tmp/claude-0/-home-user-Sloths-Adventure-/de391798-4931-5f52-9808-d419b5307ca4/scratchpad/exp/geomspace.ts`
and `.../exp/geomsample2.ts`. They import the real `traceNode`, `easyNode`, `checkTrace`, `flight` (beatTrace.ts), `fitSteps`, `rhythmLayout`,
`FACE_MARGIN` (w1Rhythm.ts) and build 1-2 roll 1 at its real BPM (128.2, from `stageBpm`, beatTrace.ts:607). For a node, I take its real
bars from the layout and the palette that layout uses (PAL_A copied from w1Rhythm.ts:478; PAL_C from w1Rhythm.ts:707, with the union of
its three rolled surface lists). The candidate steps at each mark are exactly the deterministic part of `fitSteps` (w1Rhythm.ts:166-214:
the `fits` air-time and band rule, jump-or-hop by `room`, the stump/bank remaps). A step sequence is **valid** when it passes what
`fitSteps` demands: Normal trace, Easy trace, and `checkTrace` on both (w1Rhythm.ts:217-221).
- Small spaces: exhaustive depth-first search with prefix pruning (a prefix that fails `traceNode` fails every completion, because
  traceNode processes steps left to right and throws at the first bad one, beatTrace.ts:368-470).
- Large spaces: count the space exactly (memoised by mark and height), then draw sequences *uniformly* from it and test them.
- `fitSteps` with `tries = 1` on 400-1,000 seeds gives its per-try acceptance and its rejection reasons.
- "Shape" = per step (move, up/flat/down, surface): the categorical geometry, the thing a player perceives as a different jump.

**Output [measured, 2026-11-05, 4 cores, other jobs running; ms figures are loose].**

```
1-2 roll 1, node 1 "ramp: jump + hop (swung)" at 128.2 BPM, 8 take-offs, bars ["x.....x.","x.....x.","x.......","x.....x.","x......."], y 410
EXHAUSTIVE: candidate sequences fitSteps can draw (band rules only) 3366; valid after the full tracer + Easy + checkTrace: 3366 (100.00%); traceNode calls 7953, 8.6 s; first valid found after 9 calls
RANDOM (fitSteps, 1 try each, 1000 seeds): accepted 1000 = 100.00% per try -> expected tries 1.0
   distinct accepted: 731 (all inside the exhaustive set: true); coverage of the valid set 21.7%
   bias: distinct geometries drawn 731 vs 865 expected if fitSteps drew uniformly from the valid set
   KINDS: distinct up/flat/down x move x surface shapes in the valid set 33 (of 3366 geometries); drawn 29; per-step vocabulary at this node: jb,hb
   valid set (uniform): mean net climb 30.9 px;  fitSteps draws: mean net climb 23.3 px
   real roll's steps:   20 -10 30 10 -10 30 -10 -10 (height over the entrance, px, per landing)

1-2 roll 1, node 5 "spike: vine landing + hop (swung)" at 128.2 BPM, 7 take-offs, bars ["x...x.x.","..x.x...","x.x....."], y 360
EXHAUSTIVE: candidate sequences 3930; valid 3930 (100.00%); traceNode calls 9264, 9.0 s; first valid found after 8 calls
RANDOM (fitSteps, 1000 seeds): accepted 1000 = 100.00% per try
   bias: distinct geometries drawn 788 vs 883 expected if uniform
   KINDS: 42 shapes (of 3930 geometries); per-step vocabulary: jb,hb
   valid set (uniform): mean net climb -17.8 px;  fitSteps draws: mean net climb -25.5 px

1-2 roll 1, node 0 "intro: run + jump" tier A at 128.2 BPM, 9 take-offs, bars ["x.......",".o......",".o......","..x.....","..x.....","..x.....","x.......",".o.....o","........"], y 330, surfaces branch
UNIFORM over fitSteps' candidate space (3068554 sequences): 1468/1500 valid = 97.9% (+-0.7 pts, 95%) -> about 3003092 valid geometries for this one rhythm
   KINDS among the 1468 valid uniform samples: 1297 distinct up/flat/down x move x surface shapes; per-step vocabulary: jb
SEARCH (prefix-pruned DFS, random order, 20 runs): traceNode calls to the first valid geometry: median 10, max 10
RANDOM (fitSteps, 1 try each, 1000 seeds): accepted 980 = 98.0% per try -> expected tries 1.02
     rejected 20: steps #: the same gap (# px, a jump, # px up) # times in a row
   distinct geometries drawn 980 of 980; distinct shapes drawn 895
   uniform valid: mean net climb -17.3 px, share of steps going up 41%
   fitSteps:      mean net climb -25.7 px, share of steps going up 40%
```

The floor (tier C: banks, stumps, branches, pits), rerun with a fixed key (my first run's key wrote both "bank" and "branch" as `b`;
the valid shares were unaffected, the kind counts were undercounted, so these are the corrected runs):

```
1-2 roll 1, node 9 "ramp: jump + hop (pits now)" tier C at 128.2 BPM, 8 take-offs, bars ["x.......","x...x.x.","..x.x...","....x...","......x.","........"], y 930, surfaces bank/stump/branch
UNIFORM over fitSteps' candidate space (2239680 sequences): 555/1200 valid = 46.3% (+-2.8 pts, 95%) -> about 1035852 valid geometries for this one rhythm
   KINDS among the 555 valid uniform samples: 536 distinct shapes; per-step vocabulary: js,hb,jb,hk,jk
RANDOM (fitSteps, 1 try each, 800 seeds): accepted 449 = 56.1% per try -> expected tries 1.78, each try = 2 traceNode + 2 checkTrace calls (w1Rhythm.ts:218-221)
     rejected 351: step #: the gap is # px: no jump at all (make it a drop, a rise, or a bigger move)
   uniform valid: mean net climb 48.5 px, share of steps going up 49%
   fitSteps:      mean net climb 60.4 px, share of steps going up 52%

1-2 roll 1, node 11 "ramp: jump + hop (pits now)" tier C, 9 take-offs, bars ["x..o.o..","x.x..o.o","........",".o..x..."], y 890
UNIFORM (19928448 sequences): 591/1200 valid = 49.3% (+-2.8 pts) -> about 9814761 valid geometries; vocabulary: js,hb,jb,jk,hk
RANDOM (fitSteps, 800 seeds): accepted 448 = 56.0% per try -> expected tries 1.79; rejected 352: the gap is # px: no jump at all
   uniform valid: mean net climb 31.7 px;  fitSteps: mean net climb 48.8 px

1-2 roll 1, node 12 "climax: jump + hop + drop (swung, densest)" tier C, 10 take-offs, bars ["x...x.x.","..x.x...","x.x.....","....x...","x.x....."], y 790
UNIFORM (576556544 sequences): 612/1200 valid = 51.0% (+-2.8 pts) -> about 294043837 valid geometries; vocabulary: jb,hk,hb,js,jk
RANDOM (fitSteps, 800 seeds): accepted 496 = 62.0% per try -> expected tries 1.61; rejected 304: the gap is # px: no jump at all
   uniform valid: mean net climb -48.9 px;  fitSteps: mean net climb -23.8 px
```
(vocabulary letters: move j/h = jump/hop; surface b/k/s = branch/bank/stump.)

And the search question, on the same three floor nodes (`.../exp/dfs.ts`: a depth-first search over the same candidates, random child
order, 20 orders each, a cap of 5,000 `traceNode` calls):

```
node 9:  DFS prefix check = Normal trace: found a valid geometry in 15/20 runs within 5000 traceNode calls; calls when found: median 9, max 4964
         DFS prefix check = Normal + Easy trace: found a valid geometry in 20/20 runs within 5000 traceNode calls; calls when found: median 18, max 24
node 11: DFS prefix check = Normal trace: found ... in 14/20 runs; calls when found: median 10, max 155
         DFS prefix check = Normal + Easy trace: found ... in 20/20 runs; median 18, max 22
node 12: DFS prefix check = Normal trace: found ... in 13/20 runs; median 11, max 916
         DFS prefix check = Normal + Easy trace: found ... in 20/20 runs; median 22, max 24
```

**What it shows.**
1. **Launchpad's claim holds for us, in the extreme: one 9-take-off rhythm admits about 3.0 million valid geometries [measured,
   ±0.7 pts].** The rhythm tier is not short of options.
2. **On canopy nodes the tracer rejects nothing that `fitSteps` can draw (100%, 100%, 97.9%) [measured].** The only rejection on the
   intro was GAP_REPEAT (beatTrace.ts:167-169, 464-468), a variety rule. So the design space there is set entirely by the palette's
   heights and band, not by physics: "80% right by construction" is already true for these nodes, and the bottleneck for quality is
   what the palette offers.
3. **The space is huge in pixels and tiny in kinds.** Per-step vocabulary: `jb` (jump onto a branch) on the intro; `jb, hb` on the two
   canopy nodes; 33 and 42 categorical shapes among 3,366 and 3,930 geometries. On the intro the 1,297 "shapes" are only up/flat/down
   orders of the *same* move onto the *same* surface. Launchpad's grammar offers 14 jump kinds (springs, falls, enemies to kill or avoid,
   stompers, moving platforms) and a *wait* state. This is the measured mechanism behind "every stage feels the same" in beat-built
   stages: the generator varies numbers, the player perceives kinds.
4. **`fitSteps` is mildly biased, not broken.** It reaches fewer distinct geometries than a uniform draw would (731 vs 865; 788 vs 883)
   and leans downhill (mean net climb 23 vs 31 px; -26 vs -18 px). The cause is in the code: it picks each step's height uniformly among
   the heights that fit (w1Rhythm.ts:206-211), so sequences in narrow parts of the band are over-drawn. Harmless for playability;
   relevant if a curve target (rise, fall) matters.
5. **A search beats random retry only where the tracer actually rejects**, i.e. floor nodes with faces (see the tier C block). There, a
   naive depth-first search with only the Normal-trace prefix check can stall, because the Easy trace and `checkTrace` are applied only at
   the leaves. WFC's lesson (3.12) applies: a search must prune with *every* check on each prefix (Easy trace and checkTrace are also left
   to right), or it thrashes.

**Compared with Launchpad's rhythm-then-geometry.** Same order; ours is stronger on the physics (engine slices, clumsy thumb, camera
framing, beatTrace.ts:326-338, 432-437) and weaker on the geometry grammar (one or two kinds where Launchpad had 14 + 5). Launchpad needed
critics because its grammar overgenerated; ours undergenerates in kind, so critics would have nothing different to choose between.

---

## 5. Ideas none of our research mentions

Checked by searching `reference/research/` (all ledgers, the Gemini and Matt research texts), `reference/GEMINI-LEDGER.md`,
`reference/STAGE-RULES.md`, `reference/PLAN-TO-80.md` and `reference/engine/` for each idea's terms; none found unless noted.

1. **A kind grammar per beat, with a kind-count gate.** Launchpad Fig. 7 / Smith 2009 Fig. 7 give each verb several geometry kinds;
   Compton & Mateas add compound and composite patterns. Gate proposal: per node, the valid space must contain at least K kinds of
   (move x surface x hazard) per take-off and the chosen roll must use at least M; per stage, the kind string's edit distance between
   nodes of the same tag must clear a floor. Measured today (section 4): 1-2's canopy nodes have 1-2 kinds per take-off.
2. **A *wait* verb in the bars.** Launchpad's `Waiting-Moving -> stomper` and `Waiting-Moving-Waiting -> moving platform`. Our marks are
   'x', 'o', 'h', '.' only (beatTrace.ts:184-208): every beat is "take off" or "keep running". A wait mark ('w': stop until something
   passes) opens a whole class of geometry (a snake passing on the bough, a twig falling, a swinging liana coming back) that the tracer
   can also check, because a wait is time on the same ledge.
3. **Limited-agent gate: "required, not just possible".** Green et al. 2018 (perfect vs limited A* agents) and Nelson & Smith's
   "unavoidable across all alternative solutions". For a node tagged as teaching mechanic M, run the route bot with M switched off; it
   must fail, and the full bot must pass. This would have caught the 1-2 catch branch that "made the jump optional" (w1Rhythm.ts:563-564)
   automatically. Cost: one flag per mechanic in the existing bots.
4. **Measure the space, not just the rolls: exact counts and uniform samples per rhythm.** What section 4 did, as a tool: for each
   node, the size of its candidate space, the valid share and the number of kinds. It tells a builder *before rolling* whether a node can
   be varied at all, and it caught that the tracer is not the limit on canopy nodes. (Karth & Smith used the same counting idea to
   explain WFC.) Related and also new: **sample uniformly** from the valid space (count-weighted descent) instead of per-step uniform
   picks, which removes `fitSteps`' measured downhill and repeat bias.
5. **Stability under edits ("same as last time, relax if impossible").** Tanagra §5.1. When a helper or Matt changes one node's bars or
   pins a moment, every other node keeps its solved values unless no solution exists. Today a node change shifts every later node
   (nodes chain by x1/yOut, beatTrace.ts:30-33), and a reroll changes everything. Cheap: seed each node's search with its previous steps
   as the first candidate.
6. **The rhythm of the rhythm (compound patterns) and designed cadences.** Compton & Mateas: "changing the rhythm in a rhythmic manner";
   Smith 2008: a group culminates "in a cadence ... where the rhythm of the player's movement significantly changes". Our node ends are
   one cadence type (a flat apron, beatTrace.ts:146). Proposal: a small set of cadence kinds (a drop, a vine catch, a stop-and-look, a
   rising stair) chosen per seam, counted by the kind gate. (Carmo's "cap universal connectors" is in the papers ledger; cadence *kinds*
   are not.)
7. **Quality-diversity selection for gen2's "best 16".** MAP-Elites keeps the best candidate in each niche of a feature grid; gen2 keeps
   "the best 16 that also differ the most" (DESIGN.md Part A). A niche grid (e.g. kind mix x height range x density) guarantees the 16
   cover the space, and an empty cell tells us which pieces to build (Matt's "more pieces" rule, made visible).
8. **Compression distance across a world, on the kind string.** Horn et al.'s NCD caught the Notch generator's sameness that players
   reported. We have edit distance (analyze.ts:131) and 3-gram cosine (era.ts), per stage. New: gzip distance of the kind strings of
   *different stages of the same world*, a one-line "do these feel like one stage played six times?" check (the QA baseline's words).
9. **Play-test protocol from the Mario AI track.** Judges play *several* levels from the same generator (or several stages in order) and
   answer a 4-alternative forced choice ("A", "B", "both equally fun", "neither"). For Matt and testers this is a fair, cheap way to
   compare a beat-built stage with its alternative, and the "several levels" rule is the direct test for "every stage feels the same".
10. **A jump's difficulty as its window.** Compton & Mateas' spatial and temporal windows. Our tracer already has, per landing, the
    shortest and longest landing over every clumsy try and the latest take-off (Landing.shortX, longX, lateX, beatTrace.ts:96-101). The
    landing pad's spare width over (longX - shortX), and the take-off ledge's spare length in milliseconds of running, are a difficulty
    number per jump for free, a better input to the tension curve than counting obstacles (and an answer to the papers ledger's §5.2).
11. **Seed the search with what already passed QA.** Sorenson & Pasquier: seeding the population "with existing well-designed levels"
    made search fast enough for a one-minute limit. For us: a node's search starts from the steps of the rebuilt W1 nodes of the same tag
    (the papers ledger proposes seeding a *library*; seeding the *search* is different and cheaper).

---

## 6. Source list: every URL actually opened

Read in full (body text; reference lists skimmed):
1. Smith, Whitehead, Mateas, "Tanagra: A Mixed-Initiative Level Design Tool", FDG 2010. https://users.soe.ucsc.edu/~ejw/papers/smith-tanagra-fdg2010.pdf
2. Smith, Whitehead, Mateas, Treanor, March, Cha, "Launchpad: A Rhythm-Based Level Generator for 2-D Platformers", IEEE TCIAIG 3(1),
   2011. https://users.soe.ucsc.edu/~ejw/papers/Smith-Launchpad-TCIAIG-2011.pdf
3. Smith, Treanor, Whitehead, Mateas, "Rhythm-Based Level Generation for 2D Platformers", FDG 2009. https://eis.ucsc.edu/papers/smith-fdg-09.pdf
4. Compton & Mateas, "Procedural Level Design for Platform Games", AIIDE 2006. https://cdn.aaai.org/AIIDE/2006/AIIDE06-022.pdf
5. Dahlskog & Togelius, "Patterns as Objectives for Level Generation", DPG 2013. http://julian.togelius.com/Dahlskog2013Patterns.pdf
6. Sorenson & Pasquier, "The Evolution of Fun: Automatic Level Design through Challenge Modeling", ICCC 2010. https://computationalcreativity.net/iccc2010/papers/sorenson-pasquier.pdf
7. Karth & Smith, "WaveFunctionCollapse is Constraint Solving in the Wild", FDG 2017. https://adamsmith.as/papers/wfc_is_constraint_solving_in_the_wild.pdf
8. Green, Khalifa, Barros, Nealen, Togelius, "Generating Levels That Teach Mechanics", FDG 2018. https://arxiv.org/pdf/1807.06734

Read in the parts named:
9. Shaker et al., "The 2010 Mario AI Championship: Level Generation Track", TCIAIG 3(4), 2011 (intro, entries of Weber, Shimizu &
   Hashiyama, Sorenson & Pasquier, Mawhorter, Takahashi & Smith; results; discussion; Baumgarten's entry not read).
   https://www.um.edu.mt/library/oar/bitstream/123456789/29776/1/The_2010_Mario_AI_championship_level_generation_track_2011.pdf
10. Horn, Dahlskog, Shaker, Smith, Togelius, "A Comparative Evaluation of Procedural Level Generators in the Mario AI Framework", FDG
    2014 (§1-4.3). http://julian.togelius.com/Horn2014Comparative.pdf
11. Smith & Mateas, "Answer Set Programming for Procedural Content Generation: A Design Space Approach", TCIAIG 3(3), 2011 (§I-IV, V.D-E,
    VI intro and RoleModel, VII; the AnsProlog tutorial and DIORAMA/ANTON case studies skimmed). https://adamsmith.as/papers/tciaig-asp4pcg.pdf
12. Mawhorter & Mateas, "Procedural Level Generation Using Occupancy-Regulated Extension", CIG 2010 (§I-III start, IV-E, V, VI).
    https://www.cs.hmc.edu/~pmawhorter/research/papers/procedural_level_generation_using_occupancy_regulated_extension-Mawhorter_Mateas-2010.pdf
13. Smith, Cha, Whitehead, "A Framework for Analysis of 2D Platformer Levels", Sandbox 2008 (§5.1-5.2). https://eis.ucsc.edu/papers/smith-sandbox-08.pdf
14. Shaker, Liapis, Togelius, Lopes, Bidarra, PCG book ch. 3 "Constructive generation methods for dungeons and levels" (intro, §3.6-3.9).
    http://pcgbook.com/chapter03.pdf
15. Togelius, Shaker, Dormans, PCG book ch. 5 "Grammars and L-systems with applications to vegetation and levels" (§5.5-5.6).
    http://pcgbook.com/chapter05.pdf
16. Nelson & Smith, PCG book ch. 8 "ASP with applications to mazes and levels" (§8.5-8.7). http://pcgbook.com/chapter08.pdf
17. Summerville et al., "Procedural Content Generation via Machine Learning (PCGML)", 2018 (n-gram/MdMC sections, open problems A-B).
    https://arxiv.org/pdf/1702.00539 (and abstract page https://arxiv.org/abs/1702.00539)
18. Cooper, "Sturgeon-MKIII: Simultaneous Level and Example Playthrough Generation via Constraint Satisfaction with Tile Rewrite Rules",
    FDG 2023 (body text; ASCII figures stripped). https://pcgworkshop.com/archive/cooper2023sturgeon.pdf
19. Cooper & Sarkar, "Pathfinding Agents for Platformer Level Repair", 2020 (intro, method, Table 1). https://ceur-ws.org/Vol-2862/paper6.pdf
20. Sarkar & Cooper, "Generating and Blending Game Levels via Quality-Diversity in the Latent Space of a VAE", 2021 (abstract, related
    work). https://arxiv.org/pdf/2102.12463
21. Vanparijs, "Procedural Level Generation for 2D Auto-Runner Games Based on Musical Features", MSc thesis, Maastricht 2022 (abstract,
    §4.3-4.6, results, limitations). https://matthewstephenson.info/papers/students/Procedural%20Level%20Generation%20for%202D%20Auto-Runner%20Games%20Based%20on%20Musical%20Features.pdf
22. Withington et al., "On the Evaluation of Procedural Level Generation Systems", 2024 (abstract, intro only). https://arxiv.org/html/2404.18657v1

Abstract pages only (no full text read):
23. Summerville et al., "The VGLC: The Video Game Level Corpus", 2016. https://arxiv.org/abs/1606.07487
24. Summerville & Mateas, "Super Mario as a String", 2016. https://arxiv.org/abs/1603.00930
25. Sorenson & Pasquier, academia.edu page (abstract and related list). https://www.academia.edu/2979259/The_evolution_of_fun_Automatic_level_design_through_challenge_modeling

Tried and failed (not read; nothing here is quoted from them): https://users.soe.ucsc.edu/~ejw/papers/launchpad-tciaig-2011.pdf
(unreachable), https://www.cs.cornell.edu/courses/cs6740/2010fa/papers/smith-expressive-range.pdf (unreachable),
https://users.soe.ucsc.edu/~ejw/papers/smith-pcg2010.pdf (unreachable), https://www.aaai.org/Papers/AIIDE/2006/AIIDE06-022.pdf
(unreachable), https://ojs.aaai.org/index.php/AIIDE/article/view/18755 and its download link (bot wall),
https://dl.acm.org/doi/10.1145/3723498.3723845 (Bazzaz & Cooper, "Level Generation with Constrained Expressive Range", FDG 2025: bot
wall), https://dl.acm.org/doi/pdf/10.1145/1814256.1814267 (Polymorph: bot wall), https://ojs.aaai.org/index.php/AIIDE/article/view/21944/21713
(Sturgeon 2022: 713 characters, no body).

Our files read for this report: reference/LAWS.md, reference/research/README.md, reference/research/ledger/LEDGER-ENGINE-PAPERS.md (all),
the other ledgers by search; src/game/beatTrace.ts (all), src/game/w1Rhythm.ts (1-260, 520-600, 1000-1349), src/game/physics.ts (PHYS,
TAKEOFF_SLACK), src/game/gen2/DESIGN.md (Part A), tools/inspect/era.ts (header), tools/inspect/analyze.ts (editDistance).

Primary sources opened and read beyond the abstract: 22. Finished: __END__.
