# Difficulty synthesis: how to score a level before players see it (DIFF-SYNTH, 2026-11-15)

Sections 1-8 were written from Matt's uploads alone (the Gemini deep-research report and seven papers), before reading
our own `reference/design/DIFFICULTY-MODEL.md` (first commit 7967bd7); §9 compares. `[G §x]` = the Gemini report
(section heading x); paper keys are in the source list. **[Inference]** = my own reasoning. Gemini tags its own
inventions "[Author Inference]"; I carry them as **[G-inference]**: a formula Gemini invented is not a finding, even
next to real citations. "via G" = a source I could only see through Gemini (not uploaded, not checked by me).

## 1. The answer in plain words
1. **Score what a level costs the player, not what it looks like.** The best single number is the *expected time a
   player wastes failing and walking back* before clearing it: chance of failing each part × what each failure costs
   (G's "Expected Excess Loss Time"; McMillen's "difficulty = chance of death × penalty for dying" in seconds)
   [G §"Combining Difficulty Factors"]. A geometry-only score cannot see the penalty half.
2. **Whether the player can choose when to jump matters more than the gap.** On a safe ledge the player lines the
   jump up on their own clock: small timing error. Forced by a moving platform, a cycle, a chase or a watcher, it
   becomes a timed press against an outside clock, which HCI work measures as far less reliable, and worse on touch
   [G §2, Lee & Oulasvirta 2016 via G]. This split explains a level rated "medium" by its gaps that testers called
   "really easy".
3. **Multiply inside a checkpoint, add across checkpoints.** Survival multiplies along a segment (hearts absorb some
   slips); expected wasted time adds across segments. Never average obstacles: ten 1% jumps are not one 10% jump.
4. **Score only the required path**, the easiest valid route where it forks; optional risk gets its own number [G §4].
5. **Formula to filter, calibrated bots to judge, real players to fix the scale.** In a large live mobile game, layout
   features alone did no better than a constant guess; simulated play carried the signal (PUZZLE p19). A bot better
   than the target player cannot rank easy levels (PUZZLE p22). The pre-play score is a calibrated prediction.
6. **Felt difficulty is partly separate from failing.** Measured failure predicted loss rates well but felt difficulty
   weakly (r = 0.32; Aponte et al. 2011 via G); total deaths said nothing about enjoyment (r = −0.008) while deaths
   piled at one spot did (r = −0.70; Birk et al. 2015 via G). So: a chokepoint check, and a felt-difficulty rating in
   validation.
Solid: points 1, 3, 4, 5 (arithmetic, cited practice, PUZZLE's data). Grounded but unproven on platformers: point 2's
exact numbers. Every weight, cap and the 0-100 mapping in Gemini's model is G-inference, to be fitted to our players.

## 2. The recommended model
**Inputs.** From the *layout* (blocks + physics + camera): each obstacle's timing slack W_raw (range of moments that
still clear it) and which edge forgiveness touches; press_i = 1 if the player cannot stop and choose the moment;
clock period P_i; visible time t_prev before the last moment to act, outside the thumbs, per orientation; threats at
once N_sim, choices B, first meeting ν; watcher warning t_warn, look-away t_safe, jump airtime t_air; damage d and
hearts H; clean seconds from the last checkpoint t_back. From the *mode*: coyote F_coy, buffer F_buf, hearts. From the
*player profile* (literature seeds, then fitted to play): reaction τ_react, phone lag τ_phone, self-paced timing noise
σ_m, outside-clock aim/noise c_μ, c_σ, stop-signal time μ_stop. From *calibration*: T_50, the scale constant.

**Steps** (G's pipeline [G §"Recommended Pre-Play Difficulty Scoring Model", Steps 1-6], with my corrections):
1. **Required path:** graph of the blocks, optional detours cut, split at checkpoints into segments k = 1..M; at a
   fork keep the route with least expected loss (Mourato's easiest-route rule, via G).
2. **Effective window:** W_eff = max(½Δt, (⌊W_raw/Δt⌋ + coy·F_coy + buf·F_buf)·Δt), Δt = 33.3 ms [G-inference].
   **Correction [Inference]:** coyote widens only the late edge of a *takeoff from a ledge*; buffer only a *re-jump on
   landing*; neither widens a landing window. G's worked example adds coyote to a landing-tight jump and gets
   q = 3.7%; without it the same formula gives **q = 30%** (my recomputation, σ = 48 ms, W = 100 ms).
3. **Chance of failing one obstacle:** q_i = 1 − S_temp·S_touch·S_watch (independent channels).
   - unpressured: S_temp = erf(W_eff/(2√2·σ_exec)), σ_exec = σ_m(1 + 0.15·max(0, N_sim − 1)) [weights G-inference;
     σ_m 35.9-61.1 ms adults, Isaksen 2015 via G];
   - pressured (Lee & Oulasvirta's temporal pointing, via G): E = 1 − ½[erf((1−c_μ)W/(√2·c_σD)) + erf(c_μW/(√2·c_σD))],
     D = the clock's span, noise × load L = (1 + 0.22(N_sim−1))(1 + 0.15·log2 B)(1 + 0.2ν) [load weights G-inference].
     **Caution [Inference]:** with G's constants (c_μ 0.131, c_σ 0.0805) this gives 21% error even at W/D = 0.5 and
     35% at 0.25: too high a floor for a game jump, likely from how the lab task defined D. Use it to *rank* until
     c_μ, c_σ are refit on bot-vs-human data.
   - touch: S_touch = erf(W_b/(2√2·σ_touch)), ≈ 1 for half-screen zones (§5).
   - watcher: S_watch = [1 − Φ((μ_s − t_warn)/σ_s)]·[1 − 0.6·clip(t_air/t_safe − 0.45, 0, 0.65)], μ_s = μ_stop +
     τ_phone (+80 ms with other threats), σ_s = 0.28μ_s [stop-signal race: Logan, via G; 0.45, 0.6, 0.28 G-inference].
4. **Segment with hearts:** carry the chance of each hearts-left count along the segment; a hit takes d, a pit all;
   at 0 hearts add that chance × (t_back + respawn) to the segment's loss L_k; P_k = chance of reaching the end alive.
   Renewal: **expected deaths (1 − P_k)/P_k; expected wasted time E[T_k] = L_k/P_k** (standard renewal-reward).
5. **Level and scale:** T = Σ E[T_k] + 0.35·(max E[T_k] − mean E[T_k]); **Score = 100·T/(T + T_50)**, T_50 = 25 s
   Normal, 12 s Easy [all G-inference]. The shape is sound (0 at no waste, never 100) [Inference]; set T_50 from our
   judged levels.
6. **Bot check:** 500 runs per segment with τ_react + τ_phone delay, frame-quantized Gaussian timing noise, a tap-rate
   cap, stop-signal noise; > 10 points from the formula and the bot wins, with a note on the block. 500 runs ≈ ±4.4
   points on a 50% pass rate (1.96·√(p(1−p)/500)).
7. **Fit to humans:** logit(P_human,k) = β0 + β1·logit(P_bot,k) + Σβ_j·x_j,k per segment (King's model, Gudmundsson
   et al. 2018 via G; PUZZLE does the same with factorisation machines, Eq. 1 p10).

**Why wasted time wins** [G §"Combining Difficulty Factors"]: a weighted sum ignores order, checkpoints and hearts
(Launchpad's own authors: "We hesitate to quantify the difficulty of generated levels", Smith & Whitehead 2010 via G);
whole-level survival ignores checkpoints (four 50% segments = 4 deaths, one 6.25% gauntlet = 15); retries ignore
the walk back.

## 3. The factors, how each is measured, and the numbers
Each factor enters the model at one place, never as a free weight. Numbers are G's 30 fps phone benchmarks [G §3].
| Factor | Measured as | Enters as | Numbers given | Rests on |
|---|---|---|---|---|
| Precision | slack window (ms/frames), landing width (tiles) | W_eff | Easy ≥ 7 fr (233 ms), ≥ 4 tiles; Normal 4-6 fr; climax 3 fr | G-inference from Celeste constants |
| Timing (outside clock) | press flag, W/D (ID_t = log2(D/W)) | pressured S_temp | > 50% error at ID_t ≥ 3 bits in the lab model | L&O 2016 via G; caution §2 |
| Reading / reaction | visible time before last moment to act | reaction deficit | adult game RT 288 ms + ~65 ms phone: < 353 ms (11 fr) cannot be reacted to; fair ≥ 600 ms (18 fr); kids ≥ 1,000 ms | Isaksen via G; HOWFAST p1 |
| Pressure / density | threats at once, taps/s, gap between rests | load L, σ_exec | adult max 7.7 taps/s, sustained < 2.5/s; a rest every 8-15 s | Isaksen via G; Launchpad rest beats via G |
| Stakes / setback | damage/hearts × walk-back seconds | hearts chain, t_back | Normal 2 hearts, 10-20 s back (cap 25-30 s); Easy 4 hearts, 5-10 s | G-inference from studio practice |
| Novelty / learning | first 2 meetings ν = 1 | load ×1.2; teach gate | first meetings ~1.2× timing noise | G-inference; Nintendo/Ubisoft teaching grammar via G |
| Decisions / fake-outs | choices B (Hick-Hyman log2 B), incongruent cues | load; cuts t_prev | a fake-out adds ~114 ms in youths (699 vs 585 ms) | cognitive-control study via G |
| Being watched | t_warn, t_safe vs t_air, stop-signal RT | S_watch; momentum check | SSRT adults ~200-210 ms, ages 6-8 ~297 ± 89; warn ≥ 500 ms Normal / ≥ 850 Easy; t_safe ≥ 2.2·t_air (3.0 Easy) | SSRT: Williams et al. 1999 via G; thresholds G-inference |
| Endurance | obstacles and seconds per checkpoint | P_k = Π(1−q) | Easy 3-5 (8-12 s); Normal 5-10 (12-25 s); climax 10-14 | G-inference |
**Interactions a sum cannot show [Inference, agreeing with G]:** a freeze right where the next gap needed a run-up
(only a bot sees it; G §3, Lescieux 2022 via G); a threat both fast and briefly visible; high stakes on a mechanic
not yet learned.

## 4. Required challenge vs optional risk, and why raw deaths mislead
- **Score the required path; rate optional risk separately.** "when the path section presents two or more
  alternatives, the difficulty value that is considered is the lowest, as we assume that the user would pick the
  easiest possible solution" (Mourato, Birra & dos Santos 2012/13 via G). Studio practice: a safe main path with
  risky collectibles beside it (Super Mario Run's coin tiers, Rayman's Lums, Shovel Knight's breakable checkpoints)
  lets cautious and bold players share a level [G §4].
- **Raw deaths mislead** (Birk, Lürig & Mandryk 2015 via G): total deaths vs enjoyment r = −0.008 (p = 0.98); their
  DPLI = max death density/√(total deaths) vs enjoyment r = −0.70 (p = 0.017). Deaths pile up from chasing pickups,
  reckless play near a cheap respawn, and quitters never log theirs. **[Inference]** p = 0.017 at r = −0.70 implies
  about 11 levels: a strong direction, a weak number.
- **Log instead** [G §4-5]: each death with cause and *required* vs *near optional* (within 2.5 s of an optional
  branch, G-inference); excess time (actual − clean); first-try and attempt clear rates; quits; death concentration.
  **[Inference]** An easiest-route bot gives the required score, a greedy pickup bot the mastery score.

## 5. Children vs adults, touch and phone
**Touch (verified, FFITTS).** A finger adds a fixed spread to normal aiming error: σ_a = 0.94 mm in 1D, 1.5 mm in 2D
("We suggest that 0.94 and 1.5 mm are used as approximations for σ_a", p9-10). Adults (18-45, index finger) missed 2D
circles 66% at 2.4 mm, 25-27% at 4.8 mm, 7% at 7.2 mm (Table 3, p6). So a required tap on anything under ~10 mm is a
real failure channel; half-screen zones remove it. G's "1.8 mm spread on an 11 mm target" is not in the paper
(largest target 7.2 mm), and its "50% underestimate" is an index comparison that the paper's own table puts at 32%.
Limits: adults, index finger, not thumbs on a fixed button.
**Latency (verified, HOWFAST).** 45 adults dragging on a near-zero-lag rig: 1 and 10 ms did not differ; 25-50 ms cost
~12-16% throughput and ~16% time at 50 ms, mostly in fine positioning (Fig. 7, p7). Taps: mean noticeable delay
64 ms (SD 24); "if input were restricted to tapping, most users appear to not even notice improvements in latency
below 40ms" (p8). Phones run 50-125 ms (p1). G's "every additional 15-25 ms degrades accuracy, especially on small
targets" is not what the paper says. **[Inference]** Phone lag is a fixed delay that eats reaction time (add it in
every t_prev check) and hurts continuous control (vine climb, drags) more than a self-paced tap. G's 65 ms budget
(touch 27.5-46 ms + half a 30 fps frame; Kämäräinen 2017 via G) is reasonable.
**Children (all via G).**
- Touch: first-tap misses 23.1% vs adults 16.9%; ages 7-10 missed 30% of 6.35 mm targets; a 10 px dead gutter nearly
  doubled misses (Anthony et al. 2012/13). ≥ 20 × 20 mm targets under 9; ages 3-5 cannot reliably hold one button
  while tapping another; adult-like dexterity near 11 (Sherwin & Nielsen 2019, NN/G).
- Reaction (visual + decision): 1,010 ± 430 ms ages 6-7, 830 ± 330 (8-9), 810 ± 300 (10-14), 570 ± 170 adults
  (Bucsuházy & Semela 2017). Stopping: SSRT ~297 ± 89 ms at 6-8 vs ~200-210 ms young adults (Williams et al. 1999).
- Reading: grade 1 ~60 words/min in spring (29 in winter), grade 3 ~112, adults ~238-260 silent (Hasbrouck & Tindal
  2017). Teach by showing; Dot's lines short and held on screen.
- **[Inference]** G's child profile (τ = 480 ms, σ_m = 85 ms) is a chosen midpoint: 480 ms is faster than the 6-9
  data above and 85 ms has no source. Fit both to play, and judge Easy at the slow end (75th-percentile child).
**Family games [G §6]:** no contact damage but the same physics (Mario Wonder's Yoshi/Nabbit), hover, on-the-spot
respawn (LEGO), stigma-free assists (Celeste). **[Inference]** Easy cuts the penalty and widens windows; it never plays
for the child (players rarely used Nintendo's auto-clear, Tanabe via G).

## 6. Hard but fair vs cheap: a checklist a level must pass
**Cheap** = failing for a reason the player could not see, could not react to, or did not cause. G's 12 checks
[G §"Hard but Fair Versus Cheap"], edited, plus two of mine; the tool that runs each is in brackets. Thresholds
are G's starting values, set later from our testers, never from opinion.
1. **Seen in time:** every required hazard, gap and landing visible outside the thumbs, both orientations, ≥ 600 ms
   (18 fr) Normal / ≥ 1,000 ms (30 fr) Easy before the last moment to act. *(camera replay)*
2. **No blind drops:** every required fall shows its landing, or a coin trail marks it. *(camera replay)*
3. **Taught before it can hurt:** first meeting with a mechanic or enemy has no pit and no lethal hit. *(world scan)*
4. **No window below the floor:** no required raw window under 3 fr Normal / 5 fr Easy, counting only forgiveness on
   that edge (§2). *(physics scan)*
5. **No fast releases:** no required release within 3 fr (~12% more errors on touch release, L&O via G). *(physics)*
6. **Touch targets:** half-screen zones, or buttons ≥ 11 mm Normal / ≥ 20 mm Easy, flush to the edge. *(UI check)*
7. **Soft hitboxes:** hazard hurt-boxes ≤ 75% of the art; landing boxes generous. *(art inventory)*
8. **Fair watcher:** sight + sound warning ≥ 500 ms Normal / ≥ 850 ms Easy; look-away ≥ 2.2× (Easy 3.0×) the airtime
   of a jump made under it. *(block data)*
9. **Restart from a freeze:** from a standstill at every safe freeze spot, the next gap still clears. *(bot)*
10. **Rests:** no dense chain over 15 s without a ≥ 2 s rest spot. *(bot timeline)*
11. **Short walk back:** ≤ 25-30 s clean between checkpoints Normal (12-15 s Easy); respawn ≤ 0.8 s; health restored
    at checkpoints. *(layout)*
12. **No single chokepoint:** in 500 bot runs, no beat holds > 45% of deaths when > 2 deaths are expected. *(bot)*
13. **[Inference] No hidden fake-out** on the required path: anything that looks safe and is not shows a tell before
    it matters, and is taught first. *(block data)*
14. **[Inference] Bot and formula agree** within 10 points, or the block carries the reason. *(bot)*

## 7. Validation against real players
**What the uploads show.**
- **Bots carry the signal:** "Only with the inclusion of agent data, it is possible to have more accurate predictions
  than a simple constant average"; agent features were "5-6 times more impactful than the level features" (PUZZLE
  p19). Cold-start error fell from ~1.2 to ~0.9 attempts per level (Fig. 8, p17); pass-rate MAE 8.1% vs King's
  4.0-6.6% (p21).
- **A too-good bot cannot rank easy levels:** "since the agent consistently performed better than most players, it
  did not differentiate easily between the easy to medium difficulty levels" (PUZZLE p22); predictions pulled to the
  middle, easy over-rated, hard under-rated (p19). **[Inference]** This is our Easy band and our 1-7-style miss.
- **Predict bands first:** "classifying the levels into easy, medium, and hard difficulties rather than directly
  predicting the number of attempts" (PUZZLE p21).
- **Wrong players, wrong answer:** speedrunners' failure data tracked the designers' intended curve at r = 0.27 vs
  0.63 for a geometry-plus-enemy-threat model, because speedrunners "tend to be highly skilled" (LADDER §IV; 8 levels,
  no significance test: weak).
- **Felt difficulty follows real difficulty; fun may not:** perceived difficulty tracked the actual tier (5.34 to
  3.84) while fun did not differ (p = 0.39) (DDA pp18-20; 31 adults).
**The plan** (G's minimum experiment [G §"Validation Plan"], corrected):
1. **Levels** across the predicted scale, plus G's two diagnostic pairs: (a) tight-but-unpressured jumps vs wider jumps
   under a watcher and a cycle; (b) one chain with 3 checkpoints + 2 hearts vs none + 1 heart. Each pair must separate
   in the predicted direction.
2. **Correction [Inference]:** G says 12 levels give 88% power "to verify ρ ≥ 0.75". The arithmetic gives 88% power to
   show ρ > 0 *if* the true ρ is 0.75; around an observed 0.75 the 95% interval with 12 levels is ~0.30-0.93. Twelve
   levels can falsify, not certify. Use ≥ 20 short levels in rotating subsets, plus every level already judged.
3. **Players** of the target age per mode, both orientations; ~15-20 per group for ±20% on a pass rate (5 per round
   finds usability problems, cannot fix a scale) [G §5, NN/G, Faulkner 2003 via G]. **Log** required-path attempts,
   clears, excess time, death position + cause, quits, and one-tap felt difficulty 1-5 and fun 1-5 per level.
4. **Pass:** predicted score ranks with median excess time and with felt difficulty (G proposes ρ ≥ 0.75 and ≥ 0.70);
   band hit rate as the headline; Easy clear rates within ±15 points. **If it fails:** compare where humans and bots
   die per block, refit c_σ, μ_stop, T_50 and bot noise on part of the levels, check on the rest.

## 8. Where the sources disagree, and which I trust
1. **Failure rate vs felt difficulty:** Aponte et al. predict loss well (MAE 0.07) but felt difficulty weakly
   (r = 0.32, via G); DDA found felt difficulty tracking the real tier (pp18-20). *Trust both:* felt difficulty follows
   big differences, not small ones. Score with wasted time; validate against felt ratings separately.
2. **Layout formula vs simulation:** LADDER's geometry model beat player-failure data (0.63 vs 0.27); PUZZLE found
   layout alone no better than a constant. *Trust PUZZLE:* checked against real outcomes in a big live game, where
   LADDER used 8 levels, a designer's curve and speedrunners. Both say *who* plays decides the answer.
3. **Average bot vs best bot:** Rovio found upper-percentile bot runs predicted pass rates better (Roohi 2021 via G);
   PUZZLE found a too-strong bot flattened the easy end. **[Inference]** No real conflict: the right bot matches the
   target player, per tier. For Easy, a strong bot is the wrong bot.
4. **Adjusting during play vs fixed modes:** Hunicke's Hamlet adjusted covertly (via G); no adjustment method
   "demonstrably surpasses static difficulty settings" (DDA p1); the flow essay calls indirect methods prone to "a
   less than optimal experience" (MATH p2, opinion); Brändle et al. 2025 (via G) found that hiding learning progress
   breaks the difficulty-enjoyment link. *Trust:* fixed, honest modes and a right planned band; no hidden physics changes.
5. **Mario Maker clear rates as targets:** G maps our world bands onto SMM2 percentiles (median 25%, quartiles
   10%/50%; numbers verified, SMM2 p2). *Reject the mapping:* "The clear rate is simply the ratio clears/attempts"
   (p2), over self-selected, partly troll user levels (p7); the 54/84/98% label effects are near-circular (the label
   is built from clear rate, p2, p5); no R², no layout features; G's "strongly driven by upload time" is ~2% (p5).
   A 25% per-attempt median would crush Easy. Our bands come from our own per-player data.
6. **How far to trust G's citations:** the papers are real and headline numbers mostly right, but details drift
   (§5), and `math_in_games_difficulty` is a practitioner essay with no mathematics ("creating Flow in games remains
   more an art than science", MATH p2). **Rule:** "via G" is a lead to check; G-inference a guess to fit.

## 9. Our model (DIFFICULTY-MODEL.md) against the research
Read only after §1-8 were committed (7967bd7). "OURS" = `reference/design/DIFFICULTY-MODEL.md` on t-diff-research.
**Agrees, and is ahead of Gemini:** required path only, optional risk out (OURS §1); independent channels multiplied
per beat; the stakes recursion E_k = (E_{k−1} + t_k)/q_k *is* renewal loss, with lost time as the unit; calibrated
bots as the number and the formula as explanation and predictor, disagreements kept as findings (what PUZZLE found
works); flown arcs from the real engine, so forgiveness is counted on the right edge (G's coyote error cannot happen);
hard-vs-cheap as checks, not weights; no live adjustment.
**Where the research says it is wrong or missing something:**
1. **Holding still is slips only.** OURS models the eagle as a slip rate λ. The research adds not *stopping in time*
   after the warning (stop-signal race: SSRT ~200-210 ms adults, ~297 ± 89 ms ages 6-8, plus phone lag; via G), being
   *already airborne* when the look turns (t_air vs t_safe; G-inference), and no run-up left after a freeze (G §3;
   LADDER's model also missed moving threats, §IV). This was the 1-7 blind spot.
2. **Reaction time has no number** (OURS §2, Missing 3). Seeds: adult in-game 288 ms (Isaksen via G) + phone
   50-125 ms (HOWFAST p1); children 830-1,010 ms at ages 6-9 with wide spread (Bucsuházy via G).
3. **No chokepoint term:** deaths piled at one beat predict lost enjoyment where totals do not (Birk via G). G4
   (p > 0.5 needs a flag) is close but not a concentration measure.
4. **Validation is in-sample on three anchors:** per-beat r = 0.94 is on the runs the bots were fitted to (OURS §3
   says so); the scale's two constants are fitted on three stages. Needed: held-out stages, ≥ 20 levels, testers of
   the right age per mode, a felt rating apart from failures (§7; Aponte; DDA; LADDER).
5. **Release is treated like press,** yet it is noisier (~12%, L&O via G); liana release is OURS' uncalibrated cell.
6. **The Easy reference may be too strong:** a better-than-most bot flattens the easy end (PUZZLE p22).
7. **Per-minute only hides walk-back length,** a felt cost of its own (G §3 endurance, checklist 11).
**Changes, ranked** (each with its check first, LAWS 22):
1. **Watcher channel:** p_hold = 1 − (1 − p_slip)(1 − p_stop)(1 − p_air), p_stop = Φ((SSRT + lag − t_warn)/σ), p_air
   from t_air/t_safe; plus the bot gate "from a standstill at every safe freeze spot, the next gap clears".
   *Check:* the 1-7 eagle beats get a nonzero, explained p.
2. **Reaction-time sweep** per tier, phone lag added, in the reading channel and G5. *Check:* p_read shown as a
   range; any beat whose range crosses 0.1 on Normal is flagged.
3. **Chokepoint gate:** share of Monte Carlo deaths at the worst beat; fail at > 45% with > 2 expected deaths.
4. **Out-of-sample validation:** predict, then play: ≥ 20 levels with both diagnostic pairs, right-age testers per
   mode, felt difficulty 1-5 + fun 1-5 after each, band hit rate as the headline; refit A and L0 on more than three
   anchors, with stages held out.
5. **Release spread** in the tier profiles, and the gate "no required release inside 3 frames".
6. **Easy judged at the slow end:** child-tier lost time at its 75th-percentile run, not the mean.
7. **Total lost seconds and flag spacing** beside L; gate ≤ 25-30 s Normal, ≤ 12-15 s Easy between flags
   (G-inference starting values).
8. **Keep Mario Maker clear rates out of the bands** (§8.5); OURS cites the 25% median only as context. Keep it so.

## 10. Test: World 1 rated with this model (added 11-15, 12:00-12:20 AM ET, at the lead's request)
**Method.** Score = 100·T/(T + T_50), T = expected wasted seconds per run on the required path (§2 step 5; T_50 = 25 s
Normal, 12 s Easy, G-inference). Reference player: middle tier on Normal, child tier on Easy (tester-calibrated tier
bots, BOTS.md). **MEASURED:** miss counts by kind, from 4 runs × 4 layouts per cell (METER-1 bots.jsonl on
origin/t-meter-1, 2026-11-14; 1-7 is the old eagle, before ENG-WATCH). **ESTIMATED:** seconds per miss: put-back
4 s (2-6), hit 3 s (2-4), life back to the flag 20 s (10-30), rescue = 8 tries at one spot 32 s (16-48), sealed door
(goal not full) 30 s (15-60); ranges in brackets. Time-based excess was tried and dropped: layout-to-layout spread
(±15 s with no misses) swamps it at 4 runs. Factor mix = METER-1's layout meter channels (meter-after.json, a
layout reading). **Disclosure:** for §9 I had read OURS, which names Matt's 1-1/1-2/1-3 anchors; nothing else known.
| Stage | Normal (middle) T s → score | Easy (child) T s → score | Carried by (measured misses; meter mix) | Hardest beat | Verdict |
|---|---|---|---|---|---|
| 1-5 | 38.8 (19.5-58) → **61** (44-70) | 22.0 (11-33) → **65** (48-73) | 28 put-backs + 2 lives + 1 hit / 4 runs (Easy: 22 put-backs); single, puzzle, double | double/puzzle beats (ESTIMATED from put-backs) | **Hard but fair** on Normal: most fails are instant soft retries; the 2 lives are the cost to check. Easy is too hard for its slot: the child bot fails 5.5×/run |
| 1-4 | 34.8 (18-59) → **58** (42-70) | 62.5 (31-105) → **84** (72-90) | 5 hits, 2 rescues, 2 of 4 sealed doors; climb, hazard (falling pods) | climb under the pods (ESTIMATED) | **Suspect / possibly cheap:** rescues + sealed doors = a chokepoint and a goal missed, and the expert bot fails more than middle (5.5 vs 1.8/run) = bot defect named in OURS §2.7. Re-run before judging |
| 1-7 | 2.2 (1.5-3) → **8** (6-11) | 0 → **0** | 3 hits / 4 runs; meter: single, watch, catch, swing | mossy-lianas (meter 5.1 pts: watch 2.3, swing 1.7) | **Easy, fair** for adults. My watcher channel (ranked change 1): eagle tell 0.5 s (METER-1 REPORT), adult stop 210 + 65 ms lag → p_stop ≈ 0.2% per look; a 6-8-year-old ≈ 9%. So the eagle costs adults almost nothing: consistent with "really easy" |
| 1-1 | 2.0 (1-3) → **7** (4-11) | 0 → **0** | 2 put-backs / 4 runs; single, double | canopy-rungs-level (testers 0.83 fails/run, MEASURED, OURS §3) | **Fair**, gentle |
| 1-2 | 1.0 (0.5-1.5) → **4** (2-6) | 2.0 (1-3) → **14** (8-20) | 1 put-back (Easy: 2); single, bounce | bounce beats (ESTIMATED) | **Fair**, very easy; Easy above Normal is a small-sample artefact (2 put-backs) |
| 1-3 | 0.8 (0.5-1) → **3** (2-4) | 0 → **0** | 1 hit; single, creature-choice | creature-choice (ESTIMATED) | **Fair**, the easiest |
**Ranking, hardest to easiest (Normal):** 1-5 (61) ≈ 1-4 (58) ≫ 1-7 (8) ≈ 1-1 (7) > 1-2 (4) > 1-3 (3). The 1-5/1-4 order
and the 1-7/1-1 order are inside the cost ranges, so they are ties. **Easy:** 1-4 (84, suspect) > 1-5 (65) ≫ 1-2 (14)
> 1-1, 1-3, 1-7 (0).
**Against what is known.** 1-1 > 1-2 > 1-3 matches the anchors above (my scores 7 > 4 > 3). 1-7 lands with 1-1, far
under 1-4/1-5: matches Matt's "really easy" on the old eagle. Testers exist only on 1-1, where the middle bot tracks
them per beat (OURS §3, in-sample). **What the test shows about the model [Inference]:** (1) the gap between World 1's
easy and hard stages is a factor of ~20 in wasted time; a 0-100 scale with T_50 = 25 s puts World 1's hardest stages
near 60, far above G's World 1 band (5-21), so T_50 or the bands must move: an argument for fitting T_50 on these
anchors, not taking G's value. (2) The per-miss costs decide 1-4 vs 1-5: measuring walk-back seconds per miss kind
(ranked change 7) is the next data to collect. (3) Easy 1-4 and 1-5 score above their Normal: either the child bot
is too weak there, or Easy keeps too much of Normal's challenge; the fact to check first is 1-4's rescues.

## Sources
Uploaded by Matt, 2026-11-14, read in full (PDF page numbers):
- **G**: Gemini Deep Research, "Pre-Play Difficulty Scoring and Level Design for a 30 FPS Mobile Platformer"
  (`Platformer_Level_Difficulty_Modeling.docx`), answering `reference/research/GEMINI-DIFFICULTY-PROMPT.md`; cited
  by section heading. A secondary summary; its ~134-work list is the trail for everything "via G".
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
- **SMM2**: Furia, C. A., Mocci, S. (2025). What Makes a Level Hard in Super Mario Maker 2? arXiv:2507.21078
  (preprint). (`What_Makes_a_Level_Hard_in_Super_Mario.pdf`)
- **MATH**: Jeppsen, I. B. (c. 2009-10). Methods Used in Game Development to Foster FLOW. Practitioner paper, venue not
  printed, pp. 241-245. (`math_in_games_difficulty.pdf`) No data or formulas; used only for its stated position.
- Not used: one upload was a veterinary lab report, not research.
Cited only through G (not uploaded, so not checked here): Aponte, Levieux & Natkin 2011; Isaksen, Gopstein & Nealen
2015; Isaksen et al. 2018; Mourato & Santos 2010; Mourato, Birra & dos Santos 2012/13; Smith & Whitehead 2010; Smith
et al. 2011 (Launchpad); Lee & Oulasvirta 2016; Birk, Lürig & Mandryk 2015; Gudmundsson et al. 2018; Roohi et al. 2021;
Brändle, Wu & Schulz 2025; Hunicke 2005; Lescieux 2022; Williams et al. 1999; Bucsuházy & Semela 2017; Anthony et al.
2012/13; Sherwin & Nielsen 2019 (NN/G); Hasbrouck & Tindal 2017; Kämäräinen et al. 2017; Faulkner 2003; and the
developer sources (McMillen, Thorson, Yacht Club Games, McEntee, Tanabe). Full references and URLs are in G's list.
