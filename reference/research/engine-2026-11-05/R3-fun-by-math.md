# R3: Fun, difficulty, flow, pacing and variety by numbers

Researcher 3 of 4, 2026-11-05. Topic: formulas an engine can build to, each with its source, its numbers, how a bot or a checker
measures it, and where it stops being true. Every number is marked **(measured)** when it came out of our code or a source's own
table, and **(estimate)** when it is my proposal or arithmetic on someone else's number. Code was measured on the work tree at commit
`3276e305` (02:20-02:45 UTC); other helpers committed while I worked (`27389479` landed at 02:17, `c41346d8` at 02:47), so the fun gate
counts below are a snapshot, not a verdict on anyone's work. Scripts I wrote live only in my scratchpad (listed in §4); no repo file
but this one was written.

---

## 1. Planned vs actual time

| | |
|---|---|
| Planned | about 75 minutes |
| Started | 02:17 UTC (9:17 PM ET, Nov 4) |
| Finished | see the last line of this file (stamped when the file was closed) |
| Where the time went | about 35 min reading 26 primary sources end to end (§6); about 25 min writing and running four measuring scripts on all nine World 1 stages, 16 layouts, both settings, plus the fun gate, the inspector's noisy bots and the first-timer bot; the rest writing and checking this file |

---

## 2. The formula sheet

Each entry: the formula, targets per setting, the source, how to measure it with what we have, and its limits.
"Our value" columns are World 1, layout 1, unless said (full tables in §4).

### F1. Per-obstacle hazard and stage survival (Isaksen, Gopstein & Nealen 2015, survival analysis)

* **Formula.** Scores from many simulated runs follow an exponential: P(x) = λe^(−λx); difficulty d = 1 − e^(−λ) is "the theoretical
  probability of crashing into the first pipe", and "1 − d is the expected fraction of simulations that make it through each pipe"
  (their eq. 1-3). For a stage of N priced challenges with per-challenge success s_i:
  * P(clean run) = Π s_i,
  * E[misses] = Σ (1 − s_i),
  * E[lives] = Σ (1 − s_i)·[miss costs a life].
* **Timing-only hazard.** Their player model: a press aimed at the middle of a window W with error ε ~ N(0, σ_p) fails with
  p = 2(1 − Φ(W / 2σ_p)). Measured human σ_p = **35.9 ms** (slow target) to **61.1 ms** (fast target), reaction τ = **288 ms**, at most
  **7.7 presses/s**, 20 players (measured, their §7). Predictions agreed with players' own difficulty ranking **77.9%** of the time
  (109/140) and with their scores **79.3%** (111/140).
* **Targets (estimate).** Do not gate per jump only (see §3, W4): gate the stage sum. Suggested first budgets, to calibrate on Matt's
  play: World 1 Normal E[lives] per first run ≤ 1.0, Easy ≤ 0.3; rising about +0.5 a world on Normal (STAGE-RULES §1b: "later on,
  players are expected to lose lives and replay stages several times").
* **Measure.** The inspector's noisy bots already give s_i for every jump (200 trials each, `report.json` `jumps[].rate`); the sum and
  product are one line each. I computed them (§4.3).
* **Limits.** Assumes independent challenges and a constant hazard; Isaksen fit it only to Flappy Bird, where difficulty is motor
  skill, "not ... path planning or strategic decisions". The timing-only form under-predicts our misses badly: our bots fail mostly
  by *overshooting the landing*, not by a late take-off (§4.3). Use bot rates, not the closed form, for s_i.

### F2. The learning-optimal success rate (Wilson et al. 2019, "The Eighty Five Percent Rule")

* **Formula.** For learners that improve by gradient descent on a binary task with Gaussian noise, learning is fastest at error rate
  ER* = **15.87%**, accuracy about **85%**; it is **82%** for Laplacian noise and **75%** for Cauchy noise (measured/derived in the paper).
  Training at the optimal rate "proceeds exponentially faster than training at a fixed difficulty".
* **Counter-evidence that matters for a kids' phone game.** Lomas et al. 2013 (CHI, 10K and 70K players): "in almost all cases,
  subjects were more engaged and played longer when the game was easier". Largest targets: **63%** success, **34% more trials** and
  **18% more time** than the smallest (**29%** success) (measured, their Table 1). And: "the most engaging design conditions produced
  the slowest rates of learning".
* **Targets (estimate).** First test of a newly taught move: s ≈ 0.85 (Normal adult bot), ≈ 0.92 (Easy kid bot); the teaching beat
  itself ≥ 0.97; practised moves ≥ 0.95. These sit between Wilson (fastest learning) and Lomas (most play).
* **Measure.** Tag each beat teach / first test / practice (our builders already know which is which), read s_i from the noisy bots.
* **Limits.** Wilson is a theorem about binary classification learners, not a measured game result; Lomas is a math game, not a
  platformer. Both are about *rates*, not about feel.

### F3. Pass rate, attempts and churn as the studios define them (Rovio, King, Tactile)

* **Definitions (measured practice).**
  * Rovio (Roohi et al. 2020, Angry Birds Dream Blast, 168 levels, 95,266 players): pass rate = mean over players of 1/attempts; churn
    = "stopped playing for at least 7 days after trying the level at least once".
  * King (Gudmundsson et al. 2018, Candy Crush): "success rate, calculated as the ratio between the total number of successes and the
    total number of attempts"; bot-to-human mapping by binomial regression with a per-level random effect,
    logit(ρ_player,i) = β0 + β1·f(ρ_agent,i) + Σ β_j·x_ij + ε_i + κ_i (their eq. 2). Fitted on 800 levels, tested on 200 unseen; used
    "for more than 1,000 new levels" with stable accuracy.
  * Tactile (Kristensen thesis, ITU): designers' rule of thumb "a change of the move limit by 1 changes the pass rate by 1.5 to 2.0%";
    attempt counts follow a negative binomial; first-attempt players are more skilled than the rest.
* **Population model (Rovio).** 2,000 simulated players with skill, persistence and boredom: pass if a skill draw beats the level's
  difficulty; churn if attempts exceed a persistence draw; churn after a pass with a boredom probability; each failed attempt raises
  skill a little (learning). Removing learning raised pass-rate error from 0.023 to 0.032 MSE; every part helped churn prediction
  (their Table 2, measured).
* **Targets (estimate).** Kids on Easy: pass rate (1/attempts) ≥ 0.8 for every World 1-3 stage; no stage where the simulated
  low-persistence third of players churns before the shrine.
* **Measure.** The first-timer bot already counts lives, game overs and rescues (`ft.json`); attempts per checkpoint segment is a
  re-count of the same data. A population layer is about 50 lines on top (Algorithm 1 of Roohi).
* **Limits.** Both are match-3 puzzle games with move limits; their bots needed human data (King) or a fitted sim2real regression
  (Rovio). Our persistence and boredom numbers are unknown until real players (QA, then Play) give attempts.

### F4. Leniency (Smith's dissertation 2012, §2.2.2, the formula as published)

* **Formula.** leniency = Σ_b time_b · geom_score_b / total_time, with geom_score **0.0 gaps, falls; 0.25 enemies; 0.5 springs,
  stompers; 0.75 moving platforms; 1.0 jumps with no gap**; in Launchpad time_b is "the amount of time between the last time the player
  completed an action and the time the player should take the new action. This means that non-lenient components are judged even
  more harshly if the player has little time to react."
* **Our mapping (estimate).** miss costs a life 0.0, an animal 0.25, a setback 0.5, river/logs 0.75, nothing 1.0 (missCost,
  `tools/validate/mechanics.ts:145`).
* **Reference values (measured, Horn et al. 2014, 1,000 levels each).** Original Super Mario Bros **0.61 (sd 0.18)**; generators
  0.51-0.86.
* **Our values (measured).** World 1 Normal 0.13 (1-8) to 0.98 (1-7); Easy 0.53-0.98 (§4.1).
* **Targets (estimate).** Easy ≥ 0.6 everywhere; Normal World 1 0.4-0.85; a world's finale below its middle stages.
* **Limits.** The weights are Smith's judgment for Launchpad, not measured; the number ignores how hard each gap is. Use it for
  expressive range (spread), not as a difficulty score.

### F5. Linearity (Smith & Whitehead; two published forms)

* **Forms.** (a) Dissertation and Horn 2014: R² of a least-squares line through platform centres (endpoints in Horn). (b) Launchpad
  TCIAIG 2011: "the sum of the absolute values of the distance from each platform midpoint to its expected value on the line, and
  divide by the total number of points", normalised; "levels rarely had a linearity score lower than 0.3".
* **Reference (measured, Horn 2014).** Original SMB **0.02 (0.02)** by R²; Launchpad 0.66 (0.31).
* **Our values (measured).** R²: 1-1 0.93, 1-5 0.97, 1-3 / 1-9 0.00. Form (b) in jump heights (mean |residual| / 108 px): 0.23 (1-5)
  to 9.92 (1-4).
* **Limits.** R² reads a flat stage with small bumps as 0 ("highly non-linear") and a steady ramp as 1; that is how 1-3 scores 0.00
  with only 0.57 jump heights of residual. Use form (b), in jump heights, for "how much up and down".

### F6. Expressive range (Smith & Whitehead 2010; Horn et al. 2014)

* **Method.** Generate many levels (Launchpad used 10,000, Horn 1,000), score each on two emergent metrics, plot a 2-D histogram;
  a generator whose output is one bright spot makes the same level whatever the seed.
* **Our values (measured, 16 layouts).** Within a stage the spread is tiny: leniency sd 0.01-0.04 (1-7: 0.11), linearity sd ≤ 0.08
  (§4.1). Between stages the spread is wide. The rolls of a stage are near one point.
* **Target (estimate).** Per stage, sd of each ERA metric over 200 rolls ≥ 0.05, or the stage is declared a fixed composition (as the
  beat-built stages are) and judged on its one layout.
* **Limits.** "It is important that the metrics used for comparing levels measure emergent properties of levels, rather than simply
  reusing the same parameters used to guide the generator" (Launchpad §V-B).

### F7. Novelty and similarity between sequences

* **Normalised compression distance (Horn 2014, gzip).** NCD(x, y) = (C(xy) − min(C(x), C(y))) / max(C(x), C(y)). Reference
  (measured): original SMB levels against each other **0.76 (0.11)**; the Notch generator **0.53** ("all very similar ... corresponds
  very well with qualitative observations"); pattern-based generators up to 0.86.
* **Calibrate for length (measured on ours).** On our 50-180-move strings, a stage against itself scores **0.08-0.09** and against a
  shuffle of its own moves **0.62-0.63**. So the useful range is 0.09 to about 0.62, not 0 to 1.
* **Tile-pattern KL divergence (Lucas & Volz 2019).** D_KL(P‖Q) = Σ P′(x) log(P′(x)/Q′(x)) over all F_w × F_h windows, ε-smoothed;
  fitness F = −(w·D_KL(P‖Q) + (1 − w)·D_KL(Q‖P)): "w can be used to good effect to control the degree of novelty"; w = 0 asks for no
  new patterns, w = 1 for all the sample's patterns. Their sample level: 90 distinct 2×2 patterns, 570 distinct 4×4.
* **Moderate novelty, not maximum (Shu, Liu & Yannakakis 2021).** "Koster's theory of fun suggests that a game is fun when the patterns
  a player perceives are neither too unfamiliar ... nor too familiar"; their reward is 1 inside a band [L, U] of segment-to-segment
  KL divergence set from human-made overworld levels, lower outside it; "too high diversity leads to odd connections". Their best agent
  kept 74 of 100 segments inside the band.
* **Edit distance (Launchpad TCIAIG).** Levenshtein on per-beat geometry codes, insertion/deletion cost 2, custom substitution costs,
  normalised by length.
* **Our values (measured).** Neighbours' terrain move strings: NCD 0.64-0.85, our 3-gram cosine 0.00-0.10 (§4.2). Rolls of one stage:
  1-1 has 2 distinct terrain strings in 16 layouts (mean NCD 0.12), 1-4 has 7 (0.22).
* **Targets (estimate).** Between rolls of one stage: mean NCD ≥ 0.35 (pairs with STAGE-RULES §2 "Variety across rolls" ≥ 0.35).
  Inside a stage, segment to segment: inside a band set from Matt's three favourite stages, not just under a cap.
* **Limits.** Compression distance on short strings is noisy; it sees order, not meaning (a jump over a pit and a hop on moss are
  different letters only if the alphabet says so).

### F8. Spatial entropy of challenges (Pedersen, Togelius & Yannakakis 2009, eq. 1)

* **Formula.** H_g = −(1/log G) Σ_i (g_i/G) log(g_i/G) over G equal segments of the level (G = number of gaps): 1 when gaps are spread
  evenly, 0 when all sit in one segment.
* **Effect (measured, 480 sessions).** Gap width correlates with reported challenge (+0.409); number of gaps correlates *negatively*
  (−0.287); "a weaker but still significant positive correlation was found between gap entropy, H_g, and challenge".
* **Our values (measured).** H_g 0.56 (1-9) to 0.94 (1-8) Normal.
* **Limits.** Short sessions of a Mario clone; the authors warn "it is possible that challenge or variety ... would factor in more if
  play sessions were longer".

### F9. Frustration from standing still (Pedersen et al. 2009)

* **Model (measured).** A single-neuron model predicts frustration preferences at **88.66%** from four inputs: time standing still
  (weight +3.267), share of time on the last life (−1.851), jump difficulty (−0.995), share of deaths in gaps (+0.233). Fun was the
  hardest to predict (**69.18%**); challenge **77.77%**.
* **Measure.** The first-timer bot's stuck time / stage time (stuck ≥ 8 s, `tools/inspect/firsttimer.ts` `stuck`) is a proxy for
  "standing still". Measured: 1-1 0.00-0.09, 1-2 0.09-0.14, **1-6 0.23-0.29** with 3 game overs per kid run (§4.4).
* **Target (estimate).** stuck share ≤ 0.05 Easy, ≤ 0.10 Normal in Worlds 1-3.
* **Limits.** Use the ranking, not the weights: the inputs were normalised over their own data, and it is a Mario clone.

### F10. What correlated with fun (Pedersen et al. 2009, Table I)

* **Numbers (measured, p < 1%).** Kicking turtle shells **0.345**, coin blocks pressed 0.311, share of enemies killed 0.256, run presses
  0.253, time moving left 0.237, kills minus deaths 0.222, time running 0.192. "The fun inherent in setting of complex chains of events
  with simple actions ... is to our knowledge not part of any of the 'established' theories of what makes games fun."
* **Our analogue.** The boa kick-to-roll (move O, `tools/validate/core.ts:37`) is a shell kick. Measured O count: 1-5 5, 1-9 9 on
  Normal, zero elsewhere in World 1.
* **The 2010 Mario AI level-generation track (Shaker et al. 2011).** Judges played two generators' levels in both orders and answered
  "which game of the two was more fun to play" (a two-alternative forced choice; 6 entries, the first 15 judges). Significant
  correlations: "levels with fewer coins and rocks, smaller gaps, and even distribution of enemies are, in general, preferred ... the
  lower the challenge in a level the higher the preference". The winner by one vote was "the simplest solution": no search, no
  hand-made chunks, no pacing, but levels "densely filled with items, creatures, and landscape features"; the authors warn that judges
  may judge "early or based only on local features".
* **Limits.** Correlations from one game's short sessions; fun was not predictable from level parameters alone.

### F11. Flow as "above your own average" (Nakamura & Csikszentmihalyi 2002)

* **Model.** "Flow is experienced when perceived challenges and skills are above the actor's average levels; when they are below,
  apathy is experienced. Intensity of experience increases with distance from the actor's average levels." The Milan group split
  challenge × skill into **eight channels**; simply matching challenge to skill did not reproduce flow in sampled data (TV watching is
  "low skills match low challenges").
* **Operational form (estimate).** Per 10 s window w: challenge c_w = Σ (1 − s_i) of the challenges in it; skill k_w = the bot's rolling
  success rate. z-score both against the stage's own mean. Flow share = share of windows with z(c) > 0 and z(k) > 0. A flat stage has
  no windows above its own average, so it cannot score flow however well tuned it is.
* **Limits.** The source is self-report sampling of people's days, not games; Chen's thesis (2006) gives the zone only as a picture
  and no numbers.

### F12. Rhythm regularity (Patel & Daniele 2003; Launchpad's rhythm types)

* **Formula.** nPVI = 100/(m − 1) · Σ |d_k − d_{k+1}| / ((d_k + d_{k+1})/2) over successive intervals d. Reference (measured): English
  speech 66.99, French 49.27; English music themes 46.91, French 40.90. A strict short-long swing (1:2) scores 66.7; an even beat 0.
* **Launchpad's rhythm space (Smith diss., Table 1).** Types regular / swing ("a short followed by long beat") / random; density low /
  medium / high; group lengths **5, 10, 15 or 20 s**; joined by a rest platform.
* **Our values (measured).** nPVI of intervals inside groups: 0-56 Normal, 11-61 Easy (§4.2).
* **Target (estimate).** Each world names its rhythm type per group and the checker confirms it: regular < 20, swing 45-75.
* **Limits.** nPVI is order-sensitive and blind to tempo; it says nothing about whether the rhythm matches the music.

### F13. The density table, checked for consistency (Gemini, `reference/GEMINI-PCG-RESEARCH.md:290-293`)

* **Arithmetic.** If bursts of n actions last T_b and are separated by rests T_r, the stage average is D = n / (T_b + T_r), and the mean
  interval inside a burst is T_b / (n − 1). The table's Normal row: 8-12 actions in 10-14 s, rests 1.0-1.2 s. Inside-burst interval =
  0.91-2.0 s, typical 12 s / 9 = **1.33 s**, which is *longer than its own rest pad (1.0-1.2 s)*. Easy: 3-4 in 6-8 s gives 2.0-4.0 s
  intervals against a 2.0-2.5 s rest. By its own definitions a Gemini burst is a row of rests. And 8 actions in 14 s with a 1.1 s
  rest averages 0.53/s, under its own Normal floor of 0.75/s.
* **Fix (estimate).** Define a group boundary relative to the local beat: a gap is a rest when it is ≥ 2× the median interval of the
  moves around it and ≥ 1.0 s (Normal) / 2.0 s (Easy). Then bursts and rests can both be measured. Run on World 1 in §4.5: phrases of
  5-12 moves appear, and so do 20 s+ stretches with no rest on 8 of 9 stages.

### F14. Game-feel numbers from primary code and notes

| Item | Celeste (Player.cs, NoelFB/Celeste) | Ours | Note |
|---|---|---|---|
| Coyote time | `JumpGraceTime = 0.1f` (100 ms, 6 frames at 60 Hz) | 0.133 s Normal, 0.167 s Easy (`src/game/physics.ts:41-42`) | Gemini's "5 frames = 83.3 ms" for Celeste (`GEMINI-PCG-RESEARCH.md:297`) does not match the code |
| Variable jump | `VarJumpTime = .2f`, speed held at −105 while held | release caps rise speed at cutV 230 of 640 (36%) (`physics.ts:20`) | different mechanisms |
| Apex hang | gravity × 0.5 while \|vy\| < 40 (`HalfGravThreshold`) and jump held | gravity × 0.72 while \|vy\| < 90 and held (`physics.ts:196`, `engine.ts:2268`) | step simulation of the constants (§4.6): Celeste 0.177 s of 0.662 s = 27% of airtime at half gravity; ours 0.117 s of 0.650 s = 18% at 0.72 |
| Jump arc | rise 28.5 px = 2.59 bodies (11 px hitbox), air 0.68 s (simulated) | rise 103 px = 2.15 bodies (48 px), air 0.65 s (simulated) | horizontal/vertical reach 2.16 Celeste, 1.80 ours |
| Buffers elsewhere | Mario 1-2 frames, Braid 0.23 s; Disc Room arms killing hitboxes only after up to 50 ms (Pichlmair & Johansen survey) | buffer 0.133 / 0.2 s | Celeste's own buffer is in Input.cs, which I did not open: not verified |

Thorson's "Celeste & Forgiveness" lists ten forgiveness tricks and gives no frame counts; "All are centered around widening
timing/positioning windows, so that everything is fudged a tiny bit in the player's favor."

Swink (2007) gives the principle, not numbers: "If objects are packed in, spaced tightly relative to the avatar's motion, the game will
feel clumsy and oppressive, causing anxiety and frustration. As objects get spaced further apart, the feel becomes increasingly
trivialized ... thoughtless boredom", and "the goal is to find the standard unit from which the game's levels should be constructed. In a
2d game, this could be the number of tiles high and wide for a good-feeling standard jump." Our standard unit (measured): a full jump
rises 2.15 bodies and carries 3.9 bodies (185 px) at full run.

### F15. Rank, don't rate (Yannakakis & Martínez 2015; Pedersen 2009's protocol)

* "Ratings are by nature ordinal values ... any method that treats them as numbers (e.g., average values, t-tests, linear models) is
  fundamentally flawed." Use pairwise preference ("4-alternative forced choice": A more X than B, B more than A, both, neither) and
  Kendall τ or Wilcoxon signed-rank; "comparisons of ratings from different experiment participants must be avoided".
* **Use.** Matt plays two stages back to back and answers one multiple-choice question: which was more fun / harder / more samey.
  That is already how Matt likes to be asked (CLAUDE.md "one multiple-choice question at a time").
* **Limits.** Needs pairs; one person's ranking only calibrates for that person.

### F16. Difficulty curves from win/loss data (Sarkar & Cooper, Glicko-2)

* **Method.** Treat each attempt as a match between player and level; play the history back through Glicko-2 (start 1500); bin by
  rating (50-point bins); fit a logistic curve of the loss rate served to a player of rating x, f(x) = 1 / (1 + e^(−α(x − β))), with
  α ≈ 0.006, β = 1850 "so that players with a starting rating of x = 1500 have a low 10% chance of losing" (check: 1/(1 + e^2.1) = 0.109;
  it reaches 50% at 1850). Survivorship fix: "phantom matches" for every pair
  that never happened, won by the player only if they out-rate the weakest player who beat that level. Without them hard levels look
  easy (Paradox's fitted curve scale σ: −0.46 without, 0.73 with, against a true 1.0; measured, their Table I). They fit a platformer (Iowa James, 14 levels) too.
* **Use (estimate).** Rate every stage against our bot tiers (σ = 36, 50, 61, 80 ms thumbs) and later QA attempts; a world's band is
  the spread of its stage ratings. This is the number STAGE-RULES §1b's bands want.

### F17. Knob elasticity (estimate, after Tactile's rule of thumb)

* For each builder knob (gap px, landing px, TAKEOFF slack, enemy speed, wind strength), measure Δ(bot success) per unit change on a
  fixed stage. Tactile's designers work with one: 1 move ≈ 1.5-2.0% pass rate. With a table of these, a builder hits a target s_i by
  arithmetic instead of rerolling.

---

## 3. Where our current numbers or checks are wrong, with evidence

**W1. The rest pad and the burst contradict each other, in the table and in the code.** (Arithmetic in F13.) In code,
`groupsOf` (`tools/validate/core.ts:346`) splits groups at any 1.0 s (Normal) / 2.0 s (Easy) pause (`REST_PAD_SECS`, `core.ts:344`),
while the new `hasBurst` (`core.ts:300-306`, landed in `27389479` at 02:17) counts 8 moves within 14 s with no pause rule. Measured on
World 1 Normal (§4.2): the biggest group between rest pads holds **1-4 moves**, never 8, yet `hasBurst` says "yes" on 7 of 9 stages. On
Normal every group is a single move or a pair: the stage is beats with rests between them, not rhythm groups. The fix is a relative
boundary (F13).

**W2. World 1's Normal stages sit in the Easy density band, and Easy plays at the same tempo as Normal.** (Measured, §4.1-4.2.)
Normal moves per second: 0.26-0.41 for 1-1, 1-2, 1-3, 1-4, 1-6, 1-7, 1-9; 0.68 (1-5) and 0.80 (1-8, the chase). Gemini's Normal band
is 0.75-1.15, its Easy band 0.35-0.55 (`GEMINI-PCG-RESEARCH.md:290`). Median gap between moves on Normal 2.1-3.1 s outside 1-5 and
1-8; Easy medians match Normal within 0.5 s on every stage. Easy softens what a miss costs (leniency 0.53-0.98 against 0.13-0.98)
but not the tempo. This is on the quick route's clock; a real first-timer is slower (1-1 Normal first-timer 189-204 s against 147 s
quick, measured), so the true density is lower still. Whether that is bad is open: Lomas (F2) found easier games more engaging; Swink
calls spacing that is too wide "thoughtless boredom"; the 2010 Mario AI judges preferred both lower challenge *and* levels densely
filled with things to do (F10). Those two fit together only one way: raise the density of *lenient* actions (hops, pickups arcs over
safe ground, rides, animal tricks) without raising the hazard sum (F1). Density and difficulty are two different dials, and the
builders should be given both. The same pattern holds outside World 1 (measured, Normal layout 1, median gap between moves): 2-1 1.93 s,
2-4 2.09, 2-7 1.44, 4-2 2.21, 4-5 2.88, 6-3 2.39, 8-4 2.78, 10-2 1.34; the biggest group between 1.0 s pads is 2 moves on all but 10-2
(4). (World 2's stages show many moves at the same instant, IOI p10 = 0.00 s, which the density count treats as separate moves.)

**W3. Double jumps are labelled as single jumps.** The route has no double-jump kind (`tools/inspect/route.ts:23`), so every jump link
becomes J "jump over a gap" or "big jump up" (`tools/inspect/beats.ts:115`); `toSteps` re-labels a beat only when it is Q
(`core.ts:128`), so a J stays J even when the gap needs the second jump. By the validator's own single-jump rule
(`gap ≤ 0.97·reach − TAKEOFF_SLACK`, `core.ts:118`), measured J steps that need the double: 1-1 **14 of 15**, 1-6 **27 of 34**, 1-7 9 of
10, 1-8 14 of 23 (Normal, §4.1). The inspector's physics check (`jumps[].dblNeeded`) says only 2 of 1-6's 58 jumps need it. The two
tools disagree on what a double jump is, and the move string the similarity and "nothing new" rules read (`core.ts:254-266`) treats J
and U as different moves. One rule is needed, then U counted.

**W4. Per-jump survival floors are not a stage bound.** STAGE-RULES §1b (line 148) and §2 "Hotspots" (line 184) floor each jump at 70%
(Normal adult) / 85% (Easy kid). Compounded (F1): 1-2 Normal has **32** jumps whose miss costs a life (measured, missCost). At the 70%
floor that is E[lives] = 32 × 0.3 = **9.6 lives** and P(clean) = 0.7^32 ≈ **1e-5** (arithmetic). A floor finds hotspots; it does not
bound difficulty. The measured bot rates are far above the floor (1-2 Normal E[costly misses] 0.00), so this is a missing gate, not a
current fault.

**W5. Easy can be harder than Normal on the bots.** (Measured, §4.3.) 1-1: the Easy kid's P(no costly miss) is **0.61** against the
Normal adult's **0.75**; the kid's worst jump on 1-1 (x 29277, rise 120, gap 111) succeeds **6%** of 200 trials ("overshot the landing"
154 times). It costs nothing (a retry), so funcheck and the floor both miss it, but by F9 it is exactly the standing-still a kid feels as
frustration. And on 1-6 the Easy kid has **3 game overs per run** and spends 23-27% of the stage stuck (first-timer, §4.4).

**W6. The adult bot's thumb is steadier than any measured human.** `FT_ADULT.thumb = [0.03, 0.03]` and `hold = [0.2, 0.035]`
(`tools/inspect/firsttimer.ts:119-120`); the inspector's adult bot uses reactSd 0.03 (`report.json` `bots.adult`). Isaksen measured σ_p =
**35.9 ms at the slowest target and 61.1 ms at the fastest** (a tap-on-time test in a web browser, 20 players), and showed precision
worsens with speed. A 30 ms phone thumb is steadier than their best condition. The kid's 65 ms equals Isaksen's fast-target adult. Suggest adult σ = 45 ms, rising
with hazard speed (estimate).

**W7. The Gemini notes misstate two of Smith's metrics.** Leniency in `GEMINI-PCG-RESEARCH.md:264` runs from −1 to 1 with "Moving
Platform = +0.2, Enemy Patrol = −0.5, Gap over Hazard Pit = −1.0"; Smith's published weights (F4) are 0 to 1 with moving platforms at
**0.75**, and time-weighted. Linearity at line 262-263 says flat ≈ 1.0 and undulating ≈ 0.2; under the R² form a flat stage with bumps
scores about 0 (measured: 1-3 R² **0.00** with 0.57 jump heights of residual). Also line 276's "reject if D_sim < 0.35" has no source in
Smith or Horn; Horn's measured SMB-to-SMB NCD is 0.76.

**W8. Celeste's coyote time is 100 ms, not 83 ms.** `GEMINI-PCG-RESEARCH.md:297, 304` say "5 frames = 83.3 ms"; the released player code
says `JumpGraceTime = 0.1f`. Our 133 / 167 ms is still more generous, which is right for touch; but the number we compared against was
wrong.

**W9. The ledger says we have no apex hang; we do.** `reference/research/ledger/LEDGER-2026-11-02-full.md:292`: "NOT (no apex term in
physics.ts)". `src/game/physics.ts:196` (`if (hold && Math.abs(b.vy) < 90) g *= 0.72`) and `src/game/engine.ts:2268` have had one since
an early commit. It is smaller than Celeste's (F14), so R-156 is "make it bigger", not "add it".

**W10. Three different numbers for the same dead walk.** STAGE-RULES §2 "Dead time" (line 171): "No quiet stretch over about 4 s";
§2 "Pacing" (line 173): "no walk with no action over 2.0 s Normal, 3.0 s Easy"; code `DEAD_WALK = 2.5` for both settings
(`core.ts:153`), with `REST_PAD = 2.5` s more taken off after a group (`core.ts:158`). The gate enforces the third.

**W11. Two similarity caps, and the move-string cosine is stuck at the floor.** STAGE-RULES §2 "Sameness" (line 176) says cosine under
~0.78; `evaluate.ts:36` and `core.ts:277` gate at 0.45 / 0.55. Measured (§4.2): neighbours' terrain 3-gram cosine (letter + way) is
**0.00-0.10** for every World 1 pair, and NCD 0.64-0.85 sits at the shuffle baseline (0.62). By move order every stage is unrelated to
its neighbour, yet Matt's D26 complaint is "everything feels the same". The sameness Matt feels is not in the move order; it is in tempo
(W2: one tempo everywhere), leniency and the look. The known list says the same (measured, `tools/validate/funknown.json`): "like the
stage before" is flagged on 1 layout of 1-7 only, while "one tempo" is flagged on all 16 layouts of all 9 stages in both settings, and
"looks like" on 1-6, 1-7 and 1-9. A move-order gate that sits at zero cannot see the sameness; the tempo and look gates already do.

**W12. Two World 1 stages barely change between rolls.** (Measured, 16 layouts, §4.2.) 1-1 has **2** distinct terrain move strings
(mean NCD 0.12 between rolls); 1-4 has **7** (0.22); the goal route adds pickups (1-1 goal route: 9 distinct, 0.38). Both are rebuilt on
the music's beat, so this may be by design (a fixed composition). If so, say so in STAGE-RULES §2 "Variety across rolls" (target 0.35)
as a named exception, like 4-3 and 4-7.

**W13. The two bots disagree about which stage is hard, and no check combines them.** The noisy jump bots rate 1-6 among the easiest
(Normal E[any miss] 0.05, §4.3); the first-timer bot finds it the hardest by far (2.7 lives a minute, 3 game overs a run, 23-29% of the
stage stuck, §4.4); for 1-1 Easy it is the other way round (jump bots 3.81 expected misses, first-timer 0 lives lost). The jump bots
judge each jump given the right route; the first-timer judges finding the route. A difficulty number needs both (bands.ts already
weighs both, `tools/inspect/bands.ts:43-51`, but funcheck uses neither).

**W14. "Groups of 5-20 s, then a rest" is never measured as written.** With a boundary that can see phrases (§4.5), 8 of 9 World 1
stages hold a phrase over 20 s with no rest on Normal. The fixed 1.0 s pad (W1) splits those phrases into single moves, so the
validator's `GROUP_MAX = 20` check (`core.ts:292`, applied at `core.ts:364`) cannot fire on Normal.

---

## 4. My measurements on real stages, with output

All runs from the repo root, against the real engine (`build()` in `tools/validate/core.ts:87`, D19). Scripts:
`/tmp/claude-0/-home-user-Sloths-Adventure-/de391798-4931-5f52-9808-d419b5307ca4/scratchpad/r3/funmath.ts`, `rhythm.ts`, `ioi.ts`,
`rolls.ts`, `relgroups.ts`, `jumps1.ts`. Raw outputs beside them (`funmath16.out`, `funcheck.out`, `insp.json`, `ft.json`).

### 4.0 The fun gate as it stood

`npx tsx tools/validate/funcheck.ts` (90 s):

```
✗ new: 1-1 normal "nothing bites" on 7 of 16 layouts (1,2,6,8,10,12,16); e.g. 82% of the beats after the first 30 s cost nothing when missed (0 cost a setback, 9 a life)
✗ new: 1-1 normal "dead walk" on 3 of 16 layouts (7,11,14); e.g. 3.5 s of walking with nothing to do at x 24670
the truer rules gate: 1-1, 1-2, 1-4, 1-5; the rest on the old rules, the truer count beside:
  (truer rule) 1-3 normal "pacing": gated on the old rule at 16 layouts, 7 by the truer rule
  ...
FAIL (2 worse or new, 0 to lower or delete; 75 known, 1061 stage-layout flags; 90 s)
```

(Two flags new on 1-1 Normal; another helper was editing World 1 and `funknown.json` during my run, so this is their in-flight state.)

### 4.1 Leniency, linearity, entropy, density, jump windows (`funmath.ts 16`)

```
=== NORMAL (layouts 1-16) ===
stage lay  secs moves  dens  burst  lenien linear  Hgap  H2    J  J-needs-dbl  Wmin_ms  pFail(s=36|61ms)  E[miss]61 P(clean)61  life-J
1-1     1   147    61  0.41  yes    0.84   0.93  0.63  0.77   15      14         422   4.4e-9|5.3e-4    0.002    0.998     9
1-2     1   183    71  0.39  yes    0.30   0.52  0.86  0.72   46       0         457   2.2e-10|1.8e-4    0.005    0.995     32
1-3     1   206    68  0.33  yes    0.55   0.00  0.72  0.90   16       0         457   2.2e-10|1.8e-4    0.001    0.999     12
1-4     1   148    54  0.36  yes    0.76   0.08  0.79  0.89   22       2         427   3.0e-9|4.6e-4    0.004    0.996     0
1-5     1   260   177  0.68  yes    0.25   0.97  0.91  0.73   99       0         457   2.2e-10|1.8e-4    0.017    0.984     99
1-6     1   185    74  0.40  yes    0.72   0.05  0.83  0.86   34      27         166   2.1e-2|1.7e-1    0.179    0.822     1
1-7     1   228    59  0.26  no     0.98   0.02  0.86  0.88   10       9         403   2.2e-8|9.7e-4    0.001    0.999     0
1-8     1   148   118  0.80  yes    0.13   0.27  0.94  0.70   23      14         406   1.8e-8|8.8e-4    0.004    0.996     22
1-9     1   147    47  0.32  no     0.55   0.00  0.56  0.89    6       3         451   3.8e-10|2.2e-4    0.000    1.000     0

expressive range over 16 layouts (Smith & Whitehead): linearity and leniency, mean (sd) [min..max]
  1-1: linearity 0.91 (0.02) [0.89..0.93]   leniency 0.84 (0.01) [0.82..0.85]
  1-2: linearity 0.58 (0.06) [0.50..0.71]   leniency 0.24 (0.04) [0.19..0.33]
  1-3: linearity 0.00 (0.00) [0.00..0.00]   leniency 0.58 (0.03) [0.53..0.63]
  1-4: linearity 0.08 (0.02) [0.04..0.13]   leniency 0.76 (0.01) [0.74..0.77]
  1-5: linearity 0.97 (0.00) [0.97..0.98]   leniency 0.23 (0.01) [0.20..0.26]
  1-6: linearity 0.05 (0.03) [0.02..0.13]   leniency 0.65 (0.04) [0.58..0.72]
  1-7: linearity 0.03 (0.02) [0.00..0.08]   leniency 0.91 (0.11) [0.75..0.98]
  1-8: linearity 0.23 (0.08) [0.00..0.30]   leniency 0.17 (0.05) [0.12..0.30]
  1-9: linearity 0.00 (0.00) [0.00..0.00]   leniency 0.57 (0.03) [0.52..0.61]

=== EASY (layouts 1-16) ===
stage lay  secs moves  dens  burst  lenien linear  Hgap  H2    J  J-needs-dbl  Wmin_ms  pFail(s=36|61ms)  E[miss]61 P(clean)61  life-J
1-1     1   153    67  0.44  yes    0.91   0.94  0.63  0.72   15       7         560   7.5e-15|4.4e-6    0.000    1.000     0
1-2     1   176    58  0.33  yes    0.62   0.68  0.72  0.85   30       1         441   8.9e-10|3.0e-4    0.001    0.999     0
1-3     1   214    67  0.31  yes    0.69   0.00  0.71  0.89   19       0         491   9.3e-12|5.7e-5    0.000    1.000     0
1-4     1   147    52  0.35  yes    0.77   0.06  0.76  0.90   20       2         461   1.5e-10|1.6e-4    0.000    1.000     0
1-5     1   245   177  0.72  yes    0.61   0.98  0.91  0.71  102       0         584   4.4e-16|1.7e-6    0.000    1.000     0
1-6     1   179    71  0.40  yes    0.82   0.05  0.83  0.84   34      27         200   5.4e-3|1.0e-1    0.103    0.898     0
1-7     1   228    59  0.26  yes    0.98   0.02  0.86  0.88   10       9         437   1.3e-9|3.4e-4    0.000    1.000     0
1-8     1   144   116  0.80  yes    0.53   0.26  0.96  0.69   22      14         440   1.0e-9|3.1e-4    0.001    0.999     0
1-9     1   121    34  0.28  yes    0.65   0.00  0.56  0.93    6       3         485   1.6e-11|7.0e-5    0.000    1.000     0
```

How to read it: `dens` moves/s on the quick route (small hops left out); `lenien` F4; `linear` R² (F5a); `Hgap` F8; `H2` normalised
bigram entropy of the move letters (the Gemini ledger's E126 asks ≥ 0.68: every stage passes); `J-needs-dbl` W3; `Wmin` the narrowest
take-off window, slack / 285 px/s + coyote; `pFail` the worst jump's timing-only failure at σ 36 / 61 ms; `E[miss]` and `P(clean)` F1
on timing alone; `life-J` jumps whose miss costs a life (missCost). The timing-only column says World 1's take-offs are nearly
unfailable (W_min ≥ 400 ms on 7 of 9 stages, against STAGE-RULES §1b's 167 / 300 ms floor); 4.3 shows why that is the wrong model.

### 4.2 Rhythm, groups and variety (`ioi.ts`, `rhythm.ts`, `funmath.ts` NCD block, `rolls.ts`)

```
=== normal, layout 1: inter-move intervals (s) and the largest group between rest pads
stage  moves  IOI p10   p50   p90   share<1.0s  share<0.5s  biggestGroup(moves, s)  hasBurst
1-1     61    1.21   2.13   4.27    0.08        0.00            3,   1.5            yes
1-2     71    1.01   2.37   4.32    0.06        0.00            2,   0.8            yes
1-3     68    1.46   2.61   4.92    0.00        0.00            1,   0.0            yes
1-4     54    0.70   2.45   5.03    0.26        0.02            4,   2.4            yes
1-5    177    0.60   1.38   2.66    0.42        0.03            4,   1.6            yes
1-6     74    0.86   2.22   3.91    0.14        0.05            3,   1.4            yes
1-7     59    1.74   2.66   8.37    0.00        0.00            1,   0.0            no
1-8    118    0.19   1.35   1.56    0.36        0.18            4,   1.8            yes
1-9     47    1.14   3.06   5.41    0.02        0.00            2,   1.0            no

=== easy, layout 1
1-1     97    1.07   1.68   3.58    0.08        0.02            8,   8.2            yes
1-2     58    0.75   2.37   4.22    0.14        0.05            6,   5.7            yes
1-3     67    1.27   2.82   5.09    0.00        0.00            5,   5.4            yes
1-4     52    0.69   2.73   5.15    0.25        0.02            7,   5.9            yes
1-5    177    0.66   1.16   2.49    0.41        0.07           20,  21.1            yes
1-6     71    0.98   2.22   3.98    0.13        0.03            5,   7.3            yes
1-7     59    1.74   2.66   8.37    0.00        0.00            2,   1.2            yes
1-8    116    0.38   1.31   1.54    0.36        0.15           53,  56.7            yes
1-9     34    1.17   3.03   6.59    0.00        0.00            2,   1.2            yes
```

nPVI of the intervals inside groups (F12), Normal: 1-1 0, 1-2 8, 1-4 16, 1-5 18, 1-6 42, 1-8 56 (1-3, 1-7, 1-9 have too few in-group intervals);
Easy: 1-1 29, 1-2 47, 1-3 11, 1-4 49, 1-5 46, 1-6 36, 1-7 16, 1-8 61, 1-9 17. Profile roughness (F5b, mean |residual| in jump heights):
1-4 9.9 (the tall climb), 1-2 1.2, 1-6 0.9, others 0.2-0.8. Boa kick-rolls (F10): 1-5 5, 1-9 9 on Normal; none elsewhere.

```
neighbours (layout 1, terrain moves = quick route, letter+way):  NCD   vs our cosine-3gram
  1-1 -> 1-2: NCD 0.64  cosine 0.07      1-5 -> 1-6: NCD 0.85  cosine 0.03
  1-2 -> 1-3: NCD 0.73  cosine 0.00      1-6 -> 1-7: NCD 0.71  cosine 0.06
  1-3 -> 1-4: NCD 0.74  cosine 0.00      1-7 -> 1-8: NCD 0.83  cosine 0.00
  1-4 -> 1-5: NCD 0.85  cosine 0.10      1-8 -> 1-9: NCD 0.85  cosine 0.00
NCD calibration 1-1: layout 1 vs layout 2 = 0.09; layout 1 vs itself = 0.09; vs a shuffle of its own tokens = 0.63
NCD calibration 1-6: layout 1 vs layout 2 = 0.40; layout 1 vs itself = 0.08; vs a shuffle of its own tokens = 0.62

stage  terrain(quick) strings: distinct of 16, mean NCD between rolls   |  goal-route strings: distinct, mean NCD
1-1     2  0.12   |   9  0.38          1-6    16  0.38   |  16  0.51
1-2    16  0.59   |  16  0.59          1-7    16  0.60   |  16  0.50
1-3    16  0.51   |  16  0.53          1-8    12  0.46   |  16  0.47
1-4     7  0.22   |   7  0.22          1-9    16  0.49   |  15  0.45
1-5    16  0.69   |  16  0.69
```

### 4.3 The inspector's noisy bots, compounded (F1) (`npx tsx tools/inspect/inspect.ts --worlds 1 --json …`, 200 trials per jump)

"Costly" = the jump's miss is a fall (not a free retry); E sums 1 − rate; P multiplies the rates of the costly jumps.

```
stage set     jumps  minRate  E[any miss]  E[costly miss]  P(no costly miss)  jumps<0.85  jumps<0.70
1-1  normal    76   0.755       0.57          0.27           0.753             1          0
1-1  easy      74   0.060       3.81          0.45           0.612             6          4
1-2  normal    72   0.960       0.08          0.00           1.000             0          0
1-2  easy      76   0.880       0.44          0.22           0.803             0          0
1-3  normal    50   0.965       0.04          0.00           1.000             0          0
1-3  easy      50   0.860       0.28          0.00           1.000             0          0
1-4  normal    25   1.000       0.00          0.00           1.000             0          0
1-4  easy      25   0.975       0.08          0.01           0.990             0          0
1-5  normal   115   1.000       0.00          0.00           1.000             0          0
1-5  easy     115   0.975       0.06          0.02           0.985             0          0
1-6  normal    58   0.985       0.05          0.00           1.000             0          0
1-6  easy      58   0.890       0.55          0.04           0.961             0          0
1-7  normal    73   1.000       0.00          0.00           1.000             0          0
1-7  easy      73   0.965       0.19          0.00           1.000             0          0
1-8  normal    29   1.000       0.00          0.00           1.000             0          0
1-8  easy      28   0.975       0.05          0.05           0.956             0          0
1-9  normal    33   0.975       0.10          0.00           1.000             0          0
1-9  easy      33   0.920       0.46          0.00           1.000             0          0
```

The stage that teaches the game, 1-1, is World 1's hardest jumping for the Easy kid by a factor of 7 in expected misses (3.81 against
≤ 0.55 elsewhere), with 4 jumps under the 70% line and 6 under the kid's own 85% floor. This is with the early-stage help on: the jump
bots apply `ASSIST` at full strength on Easy ("Easy keeps assist at 1 the whole game", `tools/inspect/jumps.ts:6-10`, `:118-120`).

Against F1's first budgets (Normal E[lives] ≤ 1.0, Easy ≤ 0.3, reading a costly miss as a life): every Normal stage passes (worst 1-1,
0.27); on Easy only 1-1 fails (0.45). Against F2's practice target (each jump ≥ 0.95): 1-1 fails on both settings, 1-2, 1-3, 1-6 and 1-9
fail on Easy.

The hardest jumps' failure reasons (bot's own words): 1-1 Normal x 15331 rate 0.755: "overshot the landing" 46, "flick came out short" 3;
1-1 Easy x 29277 rate 0.06: "overshot the landing" 154, "ran off the ledge before the jump registered" 20, "flick came out short" 14.
So the binding skill is stopping on the landing, not timing the take-off: the timing-only form of F1 (4.1) predicts 0.002 misses on
1-1 Normal where the bots find 0.27.

### 4.4 The first-timer bot (`inspect.ts ... --firsttimer --ft-trials 2`)

```
stage set    who   time(s) quick(s) stuck-s stuck/time loops loop-deaths softFalls lives/min hits/min rescues gameOvers
1-1  easy   KID      182.7   147      8.2   0.045       5     6          7      0.00     0.00   1   0
1-1  easy   KID      178.8   147      0.0   0.000       4     6          8      0.00     0.00   1   0
1-1  normal ADULT    203.5   147     17.3   0.085       6    13         12      0.59     0.00   4   0
1-1  normal ADULT    188.6   147      0.0   0.000       3     5          7      0.32     0.00   1   0
1-2  easy   KID      211.9   183     28.8   0.136       0     0          4      0.00     0.00   3   0
1-2  easy   KID      198.8   183     20.0   0.101       0     0          4      0.00     0.00   2   0
1-2  normal ADULT    203.2   183     19.4   0.095       1     0          0      0.00     0.00   1   0
1-2  normal ADULT    214.6   183     20.0   0.093       1     0          1      0.28     0.00   1   0
1-6  easy   KID      319.5   185     86.9   0.272       9     9          0      1.88     0.38   9   3
1-6  easy   KID      303.5   185     71.0   0.234       7     9          0      1.98     0.20   8   3
1-6  normal ADULT    265.6   185     76.7   0.289      11    12          0      2.71     1.13   10   3
1-6  normal ADULT    262.2   185     66.7   0.254      11    12          0      2.75     0.92   10   3
```

1-6 is the outlier on every measure that predicts frustration (F9) and on the timing model (W_min 166 ms, 4.1): the measures agree.

### 4.5 F13's fix run on World 1: a relative group boundary (`relgroups.ts`)

A gap is a rest when it is ≥ 2× the median of the 3 intervals each side and ≥ 1.0 s (Normal) / 2.0 s (Easy).

```
=== normal, layout 1: fixed pad (core.ts groupsOf) vs relative boundary
stage  fixed: groups, median moves   relative: groups, median moves, median secs, max moves (secs), share of moves in groups of 4+
1-1      56, 1                           7, 7, 9.1 s, 18 (44.5 s), 0.97
1-2      67, 1                           8, 5, 10.6 s, 38 (80.0 s), 0.99
1-3      68, 1                           7, 9, 17.1 s, 20 (53.9 s), 0.94
1-4      40, 1                           9, 5, 3.9 s, 21 (58.9 s), 0.93
1-5     103, 1                          18, 10, 12.1 s, 28 (39.2 s), 0.99
1-6      64, 1                           7, 12, 23.7 s, 25 (60.6 s), 0.97
1-7      59, 1                          14, 5, 9.4 s, 9 (19.3 s), 0.81
1-8      76, 1                           8, 18, 18.0 s, 26 (26.4 s), 0.98
1-9      46, 1                           2, 32, 89.7 s, 32 (89.7 s), 1.00
```

With a relative boundary the stages do fall into phrases (median 5-12 moves, 4-24 s, inside Launchpad's 5-20 s), and the check that
matters appears: 8 of 9 stages have a phrase over 20 s with no rest (1-9 is two phrases, one of them 90 s). That is STAGE-RULES §0b.1
("groups of 5-20 s, a rest between") failing, which the fixed 1.0 s pad cannot see. Limit: the ratio is a choice. At 1.5× the median
phrase is 3-5 moves and 7 of 8 stages still have one over 20 s; at 2.5× phrases merge (1-8 becomes one 130 s phrase). Calibrate it on
the stages Matt ranks as best paced (F15).

### 4.6 Jump arcs (step simulation of the published constants, 1/60 s steps)

```
Celeste full jump: rise 28.5 px (Madeline hitbox 11 px tall: 2.59 bodies), air 0.683 s, run 90 px/s -> 62 px (+HBoost 40)
Pokey full jump: rise 103.0 px (48 px tall: 2.15 bodies), air 0.650 s, hang 0.117 s (18%), run 285 -> 185 px (3.9 bodies)
ratio horizontal/vertical: Celeste 2.16, Pokey 1.80
```

(Our discrete rise is 103 px against `JUMP_RISE` ≈ 108 px, `physics.ts:133`: Euler step order; the level check uses its own tables.)

---

## 5. Ideas none of our research mentions

Checked by searching `reference/research/`, the ledgers, `STAGE-RULES.md` and both Gemini files for each name and key term (Isaksen,
survival, hazard sum, Wilson, 85%, Lomas, churn, persistence, Glicko, phantom, Pedersen, frustration, nPVI, Kullback, pairwise
ranking, MAP-Elites, elasticity): none of these appears as a method. "Pairwise" appears only for enemy adjacency, "85%" only for
petal yields and the kid bot's per-jump floor, and "survival" only as that floor.

1. **A stage survival budget instead of only per-jump floors** (F1, W4): E[lives] = Σ (1 − s_i) from the bots we already run, with a
   world-by-world ramp. This is the missing number for STAGE-RULES §1b's bands.
2. **Teach, test and practise at different success targets** (F2): about 0.97 / 0.85 / 0.95, from the learning-optimal 85% rule and the
   large-sample finding that easier play is played longer.
3. **A player population on top of the bots** (F3, Rovio): skill, persistence, boredom, learning; per stage, the share of a simulated
   low-persistence group that would quit. It turns "is this too hard?" into "who leaves here?".
4. **Rate stages like chess players** (F16, Glicko-2 with phantom matches): bot tiers and later QA attempts as matches; a stage's rating
   is its difficulty, a world's spread is its band, and the survivorship fix stops hard late stages from looking easy.
5. **A frustration meter from standing still** (F9): stuck share from the first-timer bot, gated per setting. On today's numbers it
   flags 1-6 (0.23-0.29, both settings) and 1-2 Easy (0.10-0.14).
6. **Flow as "above the stage's own average"** (F11): windows where challenge and the bot's success are both above the stage's mean.
   A perfectly even stage scores zero by construction, which is the D26 complaint in a formula.
7. **A novelty band, not a cap** (F7, Shu et al.): segment-to-segment divergence held inside [L, U] measured on Matt's favourite
   stages; too similar is boring, too different is "odd connections". Our gates only cap similarity.
8. **Length-calibrated NCD** (F7): a stage against itself ≈ 0.09, against a shuffle ≈ 0.62 at our lengths; judge NCD inside that range.
9. **Rhythm regularity by nPVI and a relative group boundary** (F12, F13): measures regular vs swing vs random, and fixes W1.
10. **Rank, don't rate, for Matt** (F15): one A-or-B question after two stages; Kendall τ against the formulas tells us which formula
    predicts Matt.
11. **Cause-chain moves as a fun lever** (F10): the strongest single fun correlate in the Mario study was a simple action that sets off
    a chain (the shell kick). Our boa roll is one; World 1 uses it on 2 of 9 stages.
12. **Knob elasticities** (F17): a measured Δ(success) per pixel or per unit of speed for each builder knob, so a builder can hit a
    target by arithmetic.
13. **Precision that worsens with speed** (W6, Isaksen 35.9 → 61.1 ms): make the bots' σ a function of how fast the hazard moves.

---

## 6. Sources actually opened (26)

What I read of each is marked: **full** (every section), **parts** (the sections named), **abstract only**.

1. Smith, Whitehead, Mateas, Treanor, March & Cha, "Launchpad: A Rhythm-Based Level Generator for 2-D Platformers", IEEE TCIAIG 2011 —
   https://users.soe.ucsc.edu/~ejw/papers/Smith-Launchpad-TCIAIG-2011.pdf (**parts**: §III-V, rhythm generation, critics, metrics, expressive range)
2. Smith, G., "Expressive Design Tools: Procedural Content Generation for Game Designers", PhD dissertation, UCSC 2012 (**parts**: the
   Launchpad parameter table, linearity, leniency, rhythm-group distance and Endless Web sections; the rest searched) —
   https://users.soe.ucsc.edu/~ejw/dissertations/Gillian-Smith-dissertation.pdf
3. Horn, Dahlskog, Shaker, Smith & Togelius, "A Comparative Evaluation of Procedural Level Generators in the Mario AI Framework",
   FDG 2014 — http://www.fdg2014.org/papers/fdg2014_paper_14.pdf (**parts**: §3-4, metrics and Table 1)
4. Pedersen, Togelius & Yannakakis, "Modeling Player Experience in Super Mario Bros", CIG 2009 —
   https://www.um.edu.mt/library/oar/bitstream/123456789/22955/1/Modeling_player_experience_in_Super_Mario_Bros.pdf (**full**)
   (record page https://www.um.edu.mt/library/oar/handle/123456789/22955; abstract page
   https://www.academia.edu/2425118/Modeling_player_experience_in_Super_Mario_Bros)
5. Isaksen, Gopstein & Nealen, "Exploring Game Space Using Survival Analysis", FDG 2015 —
   http://www.nealen.net/papers/exploring-game-space-FDG2015.pdf (**full**)
6. Wilson, Shenhav, Straccia & Cohen, "The Eighty Five Percent Rule for optimal learning", Nature Communications 2019 —
   https://www.nature.com/articles/s41467-019-12552-4 (**parts**: abstract, theory, results, discussion; methods skimmed)
7. Roohi, Relas, Takatalo, Heiskanen & Hämäläinen, "Predicting Game Difficulty and Churn Without Players", CHI PLAY 2020 (Rovio) —
   https://arxiv.org/abs/2008.12937 and https://arxiv.org/html/2008.12937v1 (**full**)
8. Gudmundsson et al., "Human-Like Playtesting with Deep Learning", CIG 2018 (King) —
   https://gwern.net/doc/reinforcement-learning/imitation-learning/2018-gudmundsson.pdf (**parts**: §IV prediction
   models, binomial regression, results; its Table II numbers did not survive extraction)
9. Kristensen, J. T., "Operationalising Difficulty in Puzzle Games", PhD thesis, ITU 2022 (Tactile Games; **parts**: §2.1 and
   §3.1, the rest searched) — https://researcher.itu.dk/ws/files/109068185/PhD_Thesis_Final_version_Jeppe_Kristensen.pdf
10. Sarkar & Cooper, "Inferring and Comparing Game Difficulty Curves using Player-vs-Level Match Data" —
    https://pmc.ncbi.nlm.nih.gov/articles/PMC8336693/ (**full**)
11. Lomas, Patel, Forlizzi & Koedinger, "Optimizing Challenge in an Educational Game Using Large-Scale Design Experiments", CHI 2013 —
    https://pact.cs.cmu.edu/pubs/Lomas,%20Forlizzi%20&%20Koedinger%202013.pdf (**parts**: abstract,
    background, method, results)
12. Chen, J., "Flow in Games", MFA thesis, USC 2006 — https://www.jenovachen.com/flowingames/Flow_in_games_final.pdf (**full**)
13. Nakamura & Csikszentmihalyi, "The Concept of Flow", Handbook of Positive Psychology 2002 —
    https://nuovoeutile.it/wp-content/uploads/2015/12/2002-Flow.pdf (**parts**: the flow model
    and measurement sections)
14. Swink, S., "Game Feel: The Secret Ingredient", Gamasutra 2007 —
    https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient (**full**)
15. Thorson, M., "Celeste & Forgiveness" — https://maddythorson.medium.com/celeste-forgiveness-31e4a40399f1 (**full**)
16. Celeste player source (Thorson & Berry), Player.cs constants and gravity code —
    https://raw.githubusercontent.com/NoelFB/Celeste/master/Source/Player/Player.cs (**parts**: the constants block and both
    gravity / variable-jump code paths)
17. Pichlmair & Johansen, "Designing Game Feel. A Survey" — https://arxiv.org/html/2011.09201v1 (**parts**: the
    techniques catalogue, §III; searched for every timing number)
18. Lucas & Volz, "Tile Pattern KL-Divergence for Analysing and Evolving Game Levels", GECCO 2019 — https://arxiv.org/pdf/1905.05077 (**parts**: §1-4)
19. Shu, Liu & Yannakakis, "Experience-Driven PCG via Reinforcement Learning: A Super Mario Bros Study", CoG 2021 —
    https://arxiv.org/abs/2106.15877 and https://arxiv.org/html/2106.15877v2 (**full**; its formula images did not survive
    extraction, the definitions in the text did)
20. Yannakakis & Martínez, "Ratings are Overrated!", Frontiers in ICT 2015 —
    https://www.frontiersin.org/articles/10.3389/fict.2015.00013/full (**full**)
21. Yannakakis & Togelius, "Artificial Intelligence and Games", Part III lecture deck (Generate), 2025 —
    https://gameaibook.org/wp-content/uploads/2025/08/III.Generate.pdf (**full**)
22. Patel & Daniele, "An empirical comparison of rhythm in language and music", Cognition 2003 —
    https://labs.la.utexas.edu/gilden/files/2016/04/Patel_Daniele_Cognition.pdf (**full**)
23. "PaceMaker: A Practical Tool for Pacing Video Games", arXiv 2408.15001, 2024 (**full**; useful only for its definition of
    pacing, its intensity formula did not survive extraction) — https://arxiv.org/html/2408.15001v2
24. Linehan, Bellord, Kirman, Morford & Roche, "Learning Curves: Analysing Pace and Challenge in Four Successful Puzzle Games", CHI PLAY
    2014 — **abstract only** (the full text would not load): https://www.academia.edu/22122271/Learning_curves
25. Yannakakis & Togelius, "Experience-Driven Procedural Content Generation", IEEE TAC 2011 — **abstract only**:
    https://www.academia.edu/2425131/Experience_Driven_Procedural_Content_Generation

26. Shaker, Togelius, Yannakakis et al., "The 2010 Mario AI Championship: Level Generation Track", IEEE TCIAIG 2011 —
    https://www.um.edu.mt/library/oar/bitstream/123456789/29776/1/The_2010_Mario_AI_championship_level_generation_track_2011.pdf
    (**parts**: §IV scoring, §VI results, §VII discussion)

Tried and blocked (not counted): the ACM PDFs of Smith & Whitehead 2010 and Hunicke 2005 (bot-blocked), diva-portal (King's "Crushing
Candy Crush" and Purmonen theses: host refused), Wiley's DDA review (bot-blocked), Tenney & Polansky's temporal gestalt paper (scanned
PDF, no text). Celeste's assist-mode usage and death data: I found no figures published by the developers; none are used here.

Closed at 03:0x UTC — see the report to the lead for the exact time.
