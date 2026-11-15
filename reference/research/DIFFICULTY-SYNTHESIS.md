# Difficulty synthesis: how to score a level before players see it (DIFF-SYNTH, 2026-11-15)

Written from Matt's uploads alone (the Gemini deep-research report and six papers), before reading our own
`reference/design/DIFFICULTY-MODEL.md`. Every claim names its source; `[G §x]` is the Gemini report
(`Platformer_Level_Difficulty_Modeling.docx`, section heading x), and the paper keys are in the source list at the end.
**[Inference]** marks my own reasoning. Gemini marks its own inventions "[Author Inference]"; I carry those tags over
as **[G-inference]**, because a formula Gemini invented is not a finding, even when it sits next to real citations.
One upload (a veterinary lab report) is not research and is not used.

## 1. The answer in plain words

1. **Score what a level costs the player, not what it looks like.** The best single number is the *expected time a
   player wastes failing and walking back* before clearing the level: chance of failing each part × what each failure
   costs. Gemini calls it Expected Excess Loss Time [G §"Combining Difficulty Factors"]; it is McMillen's rule
   "difficulty = chance of death × penalty for dying" put into seconds. A geometry-only score cannot see the penalty half.
2. **The chance of failing a jump depends far more on whether the player can choose when to jump than on the gap.**
   Standing on a safe ledge, the player lines the jump up and goes on their own clock: small timing error. Forced by a
   moving platform, a cycle, a chase or a watcher, the jump becomes a *timed press against an outside clock*, which the
   HCI literature measures as far less reliable, worse on touch than on buttons [G §2 "Psychomotor HCI Laws", citing
   Lee & Oulasvirta 2016]. This one split explains a level rated "medium" by gaps that testers called "really easy".
3. **Multiply inside a checkpoint, add across checkpoints.** Survival chances multiply along the run between two
   checkpoints (hearts absorb some slips); the expected wasted time of each run between checkpoints adds up. Never
   average obstacle scores: ten 1% jumps are not one 10% jump [G §"Combining Difficulty Factors"].
4. **Score only the required path.** Optional coins, secrets and risky shortcuts are a separate "mastery" number;
   take the easiest valid route when the level forks [G §4, citing Mourato et al. 2012/13].
5. **Then check the formula with noisy bots, then fix the scale with real players.** A fast formula filters candidates;
   simulated players with human reaction delay and timing noise catch what the formula misses (a freeze that kills the
   run-up for the next gap); a small playtest fits the bot numbers to human pass rates. The pre-play score is a
   *prediction to be calibrated*, not a measurement [G §5; PUZZLE; LADDER].
6. **Players feel difficulty partly apart from failing.** Measured failure predicted real loss rates well but felt
   difficulty only weakly (r = 0.32) [G §2, citing Aponte et al. 2011], and raw death counts told nothing about enjoyment
   (r = −0.008) while deaths piled at one spot did (r = −0.70) [G §4, citing Birk et al. 2015]. So the model needs a
   "chokepoint" term and the validation needs a felt-difficulty rating, not just deaths.

What is solid and what is not: points 1, 3 and 4 are arithmetic plus well-cited design practice; point 2 is grounded in
lab HCI work but its exact numbers are not yet proven on a platformer; every weight, cap and the 0-100 mapping in
Gemini's model are its own inventions [G-inference] and must be fitted to our players before they are trusted.

## 2. The recommended model

### 2.1 Inputs: where each number comes from
| Symbol | Meaning | From |
|---|---|---|
| Δt = 33.3 ms | one frame at 30 fps | engine constant |
| W_raw,i | the timing slack of obstacle i: the range of jump moments that still clear it, from the physics | **layout** (block + physics) |
| F_coy, F_buf | coyote frames (late takeoff), buffer frames (early press before landing) | **mode rule** |
| press_i ∈ {0,1} | 1 if the player cannot stop safely and choose the moment (cycle, chase, crumble, watcher) | **layout** |
| P_i | period of the outside clock (moving platform, cycle) | **layout** |
| t_prev,i | time the threat is visible on screen, outside the thumbs, before the last moment to act | **layout + camera**, per orientation |
| N_sim,i, B_i, ν_i | threats at once; choices at once; first meeting (1/0) | **layout + world order** |
| t_warn, t_safe, t_air | watcher's warning, its look-away, the jump's airtime | **layout + physics** |
| d_i, H | damage, hearts (pits = H) | **mode + block** |
| t_back,i | clean run time from the last checkpoint to obstacle i, plus respawn | **layout** (bot measures it) |
| τ_react, τ_phone, σ_m | reaction delay, touch-to-engine lag, self-paced timing noise | **player profile** (literature, then fitted to play) |
| c_μ, c_σ | aim point and timing noise for presses against an outside clock | **player profile** (Lee & Oulasvirta fit via G; refit) |
| μ_stop | stop-signal reaction time (how fast a player halts) | **player profile** |
| T_50 | wasted seconds that map to score 50 | **calibrated from play** |

### 2.2 The steps (Gemini's pipeline [G §"Recommended Pre-Play Difficulty Scoring Model"], with my corrections)
1. **Required path.** Build the movement graph from the blocks, cut optional detours, split at checkpoints into
   segments k = 1..M; where a segment forks, keep the route with the least expected loss [G Step 1].
2. **Effective window.** W_eff = max(½Δt, (⌊W_raw/Δt⌋ + coy·F_coy + buf·F_buf)·Δt) [G Step 2, G-inference].
   **Correction [Inference]:** coyote time only widens the *late edge of a takeoff from a ledge*; buffering only helps
   a *re-jump on landing*. Neither widens a *landing* window or a mid-air timing. Gemini's worked example adds 3
   coyote frames to a landing-tight jump and so gets q = 3.7%; with no forgiveness on that window the same formula gives
   **q = 30%** (my recomputation, σ = 48 ms, W = 100 ms). Tag every window with which edge forgiveness can touch.
3. **Chance of failing one obstacle**, q_i = 1 − S_temp·S_touch·S_watch (independent channels) [G Step 3]:
   - unpressured: S_temp = erf(W_eff / (2√2·σ_exec)), σ_exec = σ_m(1 + 0.15·max(0, N_sim−1)) [G-inference on top of
     Isaksen's measured noise];
   - pressured: Lee & Oulasvirta's temporal pointing error E = 1 − ½[erf((1−c_μ)W/(√2·c_σD)) + erf(c_μW/(√2·c_σD))],
     with D the clock's span and noise inflated by load L_i = (1+0.22(N_sim−1))(1+0.15·log2 B)(1+0.2ν)
     [G Step 3; the formula is Lee & Oulasvirta's, the load weights are G-inference].
     **Caution [Inference]:** with Gemini's constants (c_μ = 0.131, c_σ = 0.0805) this gives 21% error even at W/D = 0.5
     (a window half the cycle long) and 35% at W/D = 0.25; that floor is too high to be a game jump and probably reflects
     how the lab task defined D, not how a sloth waits for a platform. Refit c_μ, c_σ on bot-vs-human data before use;
     until then use the pressured branch for *ranking*, not absolute rates.
   - touch: S_touch = erf(W_b / (2√2·σ_touch)); ≈ 1 for half-screen zones [G Step 3, on Bi et al. 2013]. See §5.
   - watcher: S_watch = [1 − Φ((μ_s − t_warn)/σ_s)] × [1 − 0.6·clip(t_air/t_safe − 0.45, 0, 0.65)], μ_s = μ_stop + τ_phone
     (+80 ms if other threats) [G Step 3; the stop-signal race is Logan's; both 0.45 and 0.6 are G-inference].
4. **Segment survival with hearts.** Carry a probability over hearts left along the segment; a hit takes d_j, a pit
   takes all; when hearts hit 0, add that chance × (t_back + respawn) to the segment's loss L_k. Single-try survival
   P_k = chance of reaching the end with hearts left. Then by renewal: **expected deaths E[R_k] = (1−P_k)/P_k**,
   **expected wasted time E[T_k] = L_k / P_k** [G Step 4; standard renewal-reward arithmetic].
5. **Level total and the 0-100 scale.** T = Σ_k E[T_k] + 0.35·(max_k E[T_k] − mean_k E[T_k]);
   **Score = 100·T / (T + T_50)**, with T_50 = 25 s Normal, 12 s Easy [G Step 5; γ = 0.35 and both T_50 are G-inference].
   The Hill curve is a sound *shape* (0 when nothing is wasted, never reaching 100, 50 at T_50) [Inference]; the
   constants are guesses. Set T_50 so our existing judged levels land where testers put them (§7).
6. **Bot check.** 500 runs per segment with reaction delay τ_react + τ_phone, Gaussian timing noise quantized to frames,
   a tap-rate cap, and stop-signal noise; if the bot score and the formula disagree by > 10 points, the bot wins and the
   block gets a note [G Step 6]. 500 runs give about ±4.4 points of pass-rate error at p = 0.5 (1.96·√(p(1−p)/500)).
7. **Fit to humans.** Once 15-30 testers have played, fit logit(P_human,k) = β0 + β1·logit(P_bot,k) + Σβ_j x_j,k
   per segment [G Step 6, citing King's GLMM, Gudmundsson et al. 2018; see PUZZLE for the same idea in a mobile game].

**Why expected wasted time beats the alternatives** [G §"Combining Difficulty Factors"]: a weighted sum (Launchpad's
leniency) ignores order, checkpoints and hearts, and its own authors refused to call it difficulty ("We hesitate to
quantify the difficulty of generated levels, as this is a subjective score and dependent on the specific ordering",
Smith & Whitehead 2010 via G); whole-level survival ignores checkpoints (four 50% segments = 4 expected deaths; one
6.25% gauntlet = 15); expected retries ignore how far back a death sends you. Wasted time covers all three.

## 3. The factors, how each is measured, and the numbers
Each factor enters the model at one place; none is a free-standing weight. Numbers are Gemini's 30 fps phone
benchmarks [G §3 table] unless marked; "src" says what they rest on.
| Factor | Measured as | Enters model as | Numbers given | src |
|---|---|---|---|---|
| Precision | slack window W (ms/frames), landing width (tiles) | W_eff in S_temp | Easy ≥ 7 fr (233 ms), ≥ 4 tiles; Normal 4-6 fr; climax 3 fr | G-inference on Celeste constants |
| Timing (outside clock) | press flag, W/D (Lee & Oulasvirta ID_t = log2(D/W)) | pressured S_temp | > 50% error at ID_t ≥ 3 bits (W/D ≤ 1/8) in the lab model | L&O 2016 via G; see caution §2.2 |
| Reading / reaction | visible time before the last moment to act, t_prev | reaction-deficit term on D | adult reaction 288 ms in a game study (Isaksen 2015), + ~65 ms phone: < 353 ms (11 fr) cannot be reacted to; fair ≥ 600 ms (18 fr); kids ≥ 1,000 ms | Isaksen via G; HOWFAST for touch lag |
| Pressure / density | threats at once N_sim, taps/s, gap between rests | load L_i, σ_exec | adult max 7.7 taps/s (Isaksen 2015), sustained < 2.5/s; a rest every 8-15 s | Isaksen via G; Launchpad rest beats |
| Stakes / setback | damage/hearts × walk-back seconds | heart chain + t_back | Normal 2 hearts, 10-20 s back (cap 25-30 s); Easy 4 hearts, 5-10 s | G-inference from studio practice |
| Novelty / learning | first 2 meetings ν = 1 | load ×1.2; teach gate | first meetings ~1.2× timing noise | G-inference; teaching grammar from Nintendo/Ubisoft practice |
| Decisions / fake-outs | choices at once B (Hick-Hyman log2 B), incongruent cues | load; subtracts from t_prev | a fake-out adds ~114 ms decision time in youths (699 vs 585 ms) | cognitive-control study via G |
| Being watched (freeze) | t_warn, t_safe vs t_air, stop-signal RT | S_watch; momentum check | adult SSRT ~200-210 ms, ages 6-8 ~297 ± 89 ms; warn ≥ 500 ms Normal / ≥ 850 ms Easy; t_safe ≥ 2.2·t_air (3.0 Easy) | SSRT: Williams et al. 1999 et al. via G; thresholds G-inference |
| Endurance | obstacles per checkpoint n_k, seconds per segment | the product P_k = Π(1−q) | Easy 3-5 (8-12 s); Normal 5-10 (12-25 s); climax 10-14 | G-inference |

**How they combine [Inference, agreeing with G]:** within one obstacle the channels multiply (a jump must be timed
*and* tapped *and* not caught); along a segment the obstacles multiply; across segments the wasted time adds. The
interactions that matter most are the ones a sum cannot show: a watcher that freezes Pokey right where the next gap
needed a run-up (only a bot sees it [G §3; Lescieux 2022 via G]); a threat that is fast *and* briefly visible (both
shrink the window); and stakes on a new mechanic (high cost before the pattern is learned).

## 4. Required challenge vs optional risk, and why raw deaths mislead
- **Score the required path; rate optional risk separately.** Mourato et al.: "when the path section presents two or
  more alternatives, the difficulty value that is considered is the lowest, as we assume that the user would pick the
  easiest possible solution" [G sources, Mourato, Birra & dos Santos 2012/13]. Optional loops get their own mastery
  score. Studio practice agrees: a safe main path with risky collectibles beside it (Super Mario Run's coin tiers,
  Rayman's Lums, Shovel Knight's breakable checkpoints) lets cautious and bold players share a level [G §4].
- **Why raw deaths mislead** [G §4, citing Birk, Lürig & Mandryk 2015]: total deaths vs enjoyment r = −0.008 (p = 0.98);
  their Death-related Problem Level Indicator DPLI = max death density / √(total deaths) vs enjoyment r = −0.70
  (p = 0.017). Deaths pile up for reasons that are not the level's required difficulty: chasing optional pickups,
  reckless play next to a cheap respawn, and players who quit early never log their deaths (survivorship).
  **[Inference]** p = 0.017 at r = −0.70 implies only about 11 levels; it is a strong *direction*, a weak *number*.
- **What to log instead [G §4, §5]:** every death tagged with cause and with *required path* vs *near optional* (within
  2.5 s of entering an optional branch, G-inference); excess time (actual − clean); first-try and attempt clear rates;
  quits; where deaths concentrate.
- **[Inference] Our bots already separate this:** a bot told to take the easiest route gives the required score; a
  "greedy" bot that takes every optional pickup gives the mastery score; the difference is the optional risk.

## 5. Children vs adults, touch and phone
**Touch accuracy (verified in the upload, FFITTS).** A finger has a fixed spread on top of normal aiming error:
σ_a = 0.94 mm in 1D, 1.5 mm in 2D ("We suggest that 0.94 and 1.5 mm are used as approximations for σ_a", p9-10).
Adults (18-45, index finger, phone) missed 2D circles 66% at 2.4 mm, 25-27% at 4.8 mm and 7% at 7.2 mm (Table 3, p6).
So any required tap on a target under ~10 mm is a real failure channel even for adults; half-screen zones remove it.
Gemini's "1.8 mm spread on an 11 mm target" is **not in the paper** (largest target 7.2 mm); its "50% / 21%
underestimate" is the paper's index-of-difficulty comparison, not a miss rate, and the 50% does not match the paper's
own table (32%). Limits: adults, index finger, two hands, not thumbs on a fixed button [FFITTS p9; reader note].

**Latency (verified, HOWFAST).** On a near-zero-lag rig (45 adults, dragging), 1 ms and 10 ms did not differ, but 25
and 50 ms cost throughput (~12-16%) and time (~16% slower at 50 ms), most in the final fine-positioning phase
(Fig. 7, p7). For taps, the mean noticeable delay was 64 ms (SD 24, range 20-100), and "if input were restricted to
tapping, most users appear to not even notice improvements in latency below 40ms" (p8). Phones run 50-125 ms (p1).
Gemini's "every additional 15-25 ms degrades accuracy, especially on small targets" is **not what the paper says**.
**[Inference]** For us: phone lag is a fixed delay that eats reaction time (add it to τ in t_prev checks) and hurts
continuous control (vine climb, drags) more than a self-paced tap; it does not by itself make a still-standing jump
harder. Gemini's 65 ms phone budget (touch 27.5-46 ms + half a 30 fps frame, Kämäräinen 2017 via G) is reasonable.

**Children (all via G; not in the uploads, so unverified by me).**
- Touch: children missed first taps 23.1% vs adults 16.9%; ages 7-10 missed 30% of 6.35 mm targets; a 10 px dead
  gutter nearly doubled misses (Anthony et al. 2012/13). NN/G: ≥ 20 × 20 mm targets for under-9s; ages 3-5 cannot
  reliably hold one button while tapping another; adult-like dexterity near age 11 (Sherwin & Nielsen 2019).
- Reaction: visual + decision RT 1,010 ± 430 ms (ages 6-7), 830 ± 330 (8-9), 810 ± 300 (10-14), 570 ± 170 (adults
  20-30) (Bucsuházy & Semela 2017). Note the spreads: the slowest quarter of 6-year-olds is near 1.3 s.
- Stopping: SSRT ~297 ± 89 ms at ages 6-8 vs ~200-210 ms young adults (Williams et al. 1999 and replications).
  Children also slow down right after an error (post-error slowing).
- Reading: grade 1 reads ~60 words/min in spring (29 in winter), grade 3 ~112, adults ~238-260 silent
  (Hasbrouck & Tindal 2017). Teach by showing; Dot's lines must be short and stay on screen.
- **[Inference]** Gemini's child profile (τ = 480 ms, σ_m = 85 ms) is a midpoint it chose; 480 ms is *faster* than
  the 6-9 RT data above and σ_m 85 has no source. Treat both as fit-to-play parameters, and score Easy against the
  slow end (say the 75th-percentile child), not the mean, because a 5-year-old is the player who gets stuck.

**What family games do [G §6]:** remove contact damage but keep the physics (Mario Wonder's Yoshi/Nabbit), hover
(Yoshi's Mellow Mode), on-the-spot respawn with no progress loss (LEGO games), player-chosen assists without stigma
(Celeste). The common thread **[Inference]:** Easy cuts the *penalty* and widens *windows*; it never plays for the
child (Nintendo found players rarely used the auto-clear "Super Guide", Tanabe via G).

## 6. Hard but fair vs cheap: a checklist a level must pass
Gemini's 12 checks [G §"Hard but Fair Versus Cheap"], kept where testable, with my edits. **Cheap** = the player
fails for a reason they could not see, could not have reacted to, or did not cause. Each line is a gate a tool can run.
1. **Can see it in time:** every required hazard, gap and landing is visible outside the thumb zones, in portrait and
   landscape, for ≥ 600 ms (18 fr) Normal / ≥ 1,000 ms (30 fr) Easy before the last moment to act. *(camera replay)*
2. **No blind drops:** every required fall shows its landing in frame, or a coin trail marks it. *(camera replay)*
3. **Taught before it can hurt:** the first meeting with any mechanic or enemy has no pit and no lethal hit (our stage
   rule already). *(world-order scan)*
4. **No window below the floor:** no required raw window under 3 fr Normal / 5 fr Easy. **Edit:** count only
   forgiveness that touches that edge (§2.2). *(physics scan)*
5. **No fast-release jumps:** no required jump needs letting go within 3 fr; Gemini cites ~12% more errors on touch
   release than touch-down (L&O via G). *(physics scan)*
6. **Touch targets:** half-screen zones, or buttons ≥ 11 mm Normal / ≥ 20 mm Easy, flush to the edge, no dead gutter;
   kids' misses landed in the gutter (Anthony et al. via G). *(clipcheck-style)*
7. **Soft hitboxes:** hazard hurt-boxes ≤ 75% of the art; landing boxes generous. *(art inventory)*
8. **Fair watcher:** sound + sight warning ≥ 500 ms Normal / ≥ 850 ms Easy; look-away ≥ 2.2× (3.0× Easy) the airtime
   of the jump made under it. *(block data)*
9. **Can restart from a freeze:** from a standstill at any safe freeze spot, the next gap is still clearable. *(bot)*
10. **Rests:** no dense chain over 15 s without a ≥ 2 s rest spot. *(bot timeline)*
11. **Short walk back:** clean time between checkpoints ≤ 25-30 s Normal (12-15 s Easy); respawn ≤ 0.8 s; health
    restored at checkpoints. *(layout)*
12. **No single chokepoint:** in 500 bot runs, no one obstacle has > 45% of the deaths when the level expects > 2
    deaths. *(bot)*
13. **[Inference, added] No hidden fake-out on the required path:** anything that looks safe and is not (a crumble, a
    false floor) shows a tell before it matters, and is taught first. *(block data)*
14. **[Inference, added] Bot and formula agree** within 10 points, or the block carries a note on why. *(bot)*
Thresholds marked G-inference in §3 are starting values: set them from our testers, never from opinion.

## 7. Validation against real players
**What the uploads show about pre-play prediction.**
- **Simulated play carries the signal; layout features alone do not.** In a 1-million-daily-user mobile game, models
  on level features alone did not beat a constant guess; "Only with the inclusion of agent data, it is possible to
  have more accurate predictions than a simple constant average" (PUZZLE p19); agent features were "5-6 times more
  impactful than the level features" (p19). Cold-start error fell from ~1.2 to ~0.9 attempts per level (Fig. 8, p17);
  pass-rate MAE 8.1% vs 4.0-6.6% reported by King (p21).
- **A bot that is too good cannot rank easy levels.** "since the agent consistently performed better than most
  players, it did not differentiate easily between the easy to medium difficulty levels" (PUZZLE p22), and all models
  pulled toward the middle: easy levels over-rated, hard ones under-rated (p19). **[Inference]** This is exactly our
  Easy band and our "medium that played really easy" miss: calibrate bots to the *target* player, and fit the ends.
- **Predict bands before exact numbers.** The authors suggest "classifying the levels into easy, medium, and hard
  difficulties rather than directly predicting the number of attempts" (PUZZLE p21).
- **Failure data from the wrong players misleads.** Difficulty inferred from speedrunners' failures tracked the
  designers' intended curve at only r = 0.27, vs 0.63 for a geometry-plus-enemy-threat model, because speedrunners
  "tend to be highly skilled" (LADDER §IV; 8 levels, no significance test: weak).
- **Felt difficulty follows real difficulty, fun may not.** Across 5 conditions (31 adults), perceived difficulty
  tracked the actual tier (5.34 → 3.84) while fun did not differ (p = 0.39) (DDA pp18-20).

**The plan** (Gemini's minimum experiment [G §"Validation Plan"], corrected):
1. **Levels:** spread across the predicted scale, plus Gemini's two diagnostic pairs: (a) tight-but-unpressured jumps
   vs wider jumps under a watcher and a cycle; (b) the same chain with 3 checkpoints + 2 hearts vs none + 1 heart.
   The model passes only if each pair separates in the predicted direction.
2. **Correction [Inference]:** Gemini claims 12 levels give 88% power "to verify ρ ≥ 0.75". The arithmetic gives 88%
   power to show ρ > 0 *if* the true ρ is 0.75; the 95% interval around an observed 0.75 with 12 levels is about
   0.30-0.93. Twelve levels can falsify the model, not certify it. Use ≥ 20 levels (short ones, each tester plays a
   rotating subset), and count every judged level we already have.
3. **Players:** testers of the target age for each mode (children on Easy, 12+ on Normal), both orientations.
   NN/G-style precision needs ~15-20 per group for ±20% on a pass rate [G §5]; 5 per round finds most *usability*
   problems but cannot fix a scale [G §5, Nielsen-Landauer, Faulkner 2003].
4. **Log:** required-path attempts, clears, excess time (actual − clean), death position + cause, quits, and two
   one-tap ratings after each level: felt difficulty 1-5 and fun 1-5.
5. **Pass:** rank correlation of predicted score with median excess time and with felt difficulty both high
   (Gemini proposes ρ ≥ 0.75 and ≥ 0.70); band hit rate (predicted band = observed band) reported as the main number;
   Easy clear rates within ±15 points. **If it fails:** compare per-block human vs bot hazard (where do they die),
   refit c_σ, μ_stop, T_50 and the bot noise on part of the levels and check the rest (held out).
6. **Fit, then keep fitting:** logit(P_human) = β0 + β1·logit(P_bot) per segment (King, via G); refit as data grows.

## 8. Where the sources disagree, and which I trust
1. **Failure rate vs felt difficulty.** Aponte et al. define difficulty as P(lose) and predict loss rates well
   (MAE 0.07) but felt difficulty weakly (r = 0.32) [G §2]; DDA found felt difficulty tracked the real tier closely
   (DDA pp18-20). *Trust:* both: felt difficulty follows big differences but not small ones. Score with wasted time
   (closest to what failing *costs*); validate against felt ratings as a second, separate test.
2. **Layout formula vs simulation.** LADDER's geometry-plus-threat model beat player-failure data (0.63 vs 0.27); the
   puzzle study found layout features alone no better than a constant, and bots essential. *Trust PUZZLE:* it was
   checked against real outcomes in a big live game; LADDER compared 8 levels to a designer's intended curve using
   speedrunners. Both agree that *who* the simulated or real player is decides the answer. Use the formula as a fast
   filter and the bot as the judge.
3. **Average bot vs best bot.** Rovio found upper-percentile bot runs predicted human pass rates better (Roohi 2021,
   via G); the puzzle study found a too-strong bot flattened the easy end (p22). Not a real conflict
   **[Inference]**: the right bot is the one whose skill matches the target player, per tier. For Easy, a strong bot is
   the wrong bot.
4. **Adjusting during play vs fixed modes.** Hunicke's Hamlet adjusted covertly (via G); the DDA study found no
   method "demonstrably surpasses static difficulty settings" (DDA p1, abstract); the flow paper calls indirect
   methods prone to "a less than optimal experience" (MATH p2, opinion only); Brändle et al. 2025 (via G) found that
   suppressing learning progress breaks the link between difficulty and enjoyment. *Trust:* fixed, honest modes and
   getting the planned band right; no hidden adjustment of jump physics.
5. **Mario Maker clear rates as targets.** Gemini maps our world bands onto SMM2 percentiles (median 25%, quartiles
   10%/50%; verified, SMM2 p2). *Reject the mapping [SMM2 p2, p5, p7; Inference]:* clear rate there is clears/attempts
   over all players ("The clear rate is simply the ratio clears/attempts", p2), on self-selected, partly troll,
   user-made levels; the 54/84/98% label effects are near-circular (the label is built from clear rate); the model
   reports no R² and has no layout features at all. A 25% per-attempt median would be far too hard for Easy. Our bands
   must come from our own per-player data.
6. **How far to trust Gemini's citations.** Spot-checked against the uploads: the papers are real and the headline
   numbers mostly right, but the details drift: FFitts "1.8 mm on 11 mm" is not in the paper, its 50% figure is a
   different quantity, Jota et al. is misworded, and the file named `math_in_games_difficulty` is a 2009-10 practitioner
   essay with no mathematics ("creating Flow in games remains more an art than science", MATH p2). **Rule:** a Gemini
   number marked "via G" is a lead to check, not a fact; anything marked G-inference is a starting guess to fit.

## 9. Our model (DIFFICULTY-MODEL.md) against the research
PLACEHOLDER-OURS

## Sources
Uploaded by Matt, 2026-11-14 (read in full; page numbers are PDF pages):
- **G**: Gemini Deep Research, "Pre-Play Difficulty Scoring and Level Design for a 30 FPS Mobile Platformer"
  (`Platformer_Level_Difficulty_Modeling.docx`), answering `reference/research/GEMINI-DIFFICULTY-PROMPT.md`. Cited by
  section heading. A secondary summary; its own source list (≈134 works) is the trail for anything marked "via G".
- **FFITTS**: Bi, X., Li, Y., Zhai, S. (2013). FFitts Law: Modeling Finger Touch with Fitts' Law. CHI '13, 1363-1372.
  (`fitts_law.pdf`)
- **HOWFAST**: Jota, R., Ng, A., Dietz, P., Wigdor, D. (2013). How Fast is Fast Enough? A Study of the Effects of
  Latency in Direct-Touch Pointing Tasks. CHI '13, 2291-2300. (`howFastIsFastEnoughCHI13.pdf`)
- **PUZZLE**: Kristensen, J. T., Burelli, P. (2024). Difficulty Modelling in Mobile Puzzle Games: An Empirical Study on
  Different Methods to Combine Player Analytics and Simulated Data. arXiv:2401.17436 (journal version: Int. J. of
  Computer Games Technology, 2024). (`Difficulty_Modelling_in_Mobile_Puzzle_Games.pdf`)
- **LADDER**: Adjanohoun, Y. J.-E., Francillette, Y., Tremblay, H., Bouchard, B. (2025). LADDER: Level Analysis Dataset
  for Difficulty Evaluation and Ranking. IEEE GEM 2025. (`...LADDER....mht`, cited by section)
- **DDA**: Fisher, N., Kulshreshth, A. K. (2024). Exploring Dynamic Difficulty Adjustment Methods for Video Games.
  Virtual Worlds 3, 230-255 (MDPI). (`Exploring_Dynamic_Difficulty_Adjustment_Methods_for__Video_Games.pdf`)
- **SMM2**: Furia, C. A., Mocci, S. (2025). What Makes a Level Hard in Super Mario Maker 2? arXiv:2507.21078 (preprint).
  (`What_Makes_a_Level_Hard_in_Super_Mario.pdf`)
- **MATH**: Jeppsen, I. B. (c. 2009-10). Methods Used in Game Development to Foster FLOW. Practitioner paper, venue not
  printed, pp. 241-245. (`math_in_games_difficulty.pdf`) No data or formulas; used only for its stated position.
- Not used: one upload was a veterinary lab report (not research).

Cited only through G (not uploaded, so not checked by me): Aponte, Levieux & Natkin 2011; Isaksen, Gopstein & Nealen
2015 and Isaksen et al. 2018; Mourato & Santos 2010, Mourato, Birra & dos Santos 2012/13; Smith & Whitehead 2010;
Smith et al. 2011 (Launchpad); Lee & Oulasvirta 2016; Huang, Lee et al. 2019; Birk, Lürig & Mandryk 2015;
Gudmundsson et al. 2018; Roohi et al. 2021; Brändle, Wu & Schulz 2025; Hunicke 2005; Williams et al. 1999;
Bucsuházy & Semela 2017; Anthony et al. 2012/13; Sherwin & Nielsen 2019 (NN/G); Hasbrouck & Tindal 2017;
Kämäräinen et al. 2017; Faulkner 2003; McMillen (Super Meat Boy), Thorson (Celeste), Yacht Club Games, McEntee
(Rayman Origins), Tanabe (Nintendo). Full references and URLs are in G's source list.
