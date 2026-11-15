# DIFFICULTY-MODEL: how hard a level is, measured as failure on the required path (R-165.268; DIFF-RESEARCH, written 11-14 10:45-11:20 PM ET)
Matt, 11-14 10:26-10:33 PM ET: "we don't compromise our normal because of a kid's play... enemy, jump difficulty, how often somebody can
die, how fast the things are moving... people can die because they're just being risky... anything's possible if we understand the math."
Base: origin/ccr-ea739a2f-dfcee4@74a5deb2; data read from origin/t-meter-1@cfa9019a (METER-1) and reference/qa-reports/R-165.59/.
Status: a research model and a build plan. No game or tool code changed. Every number below names the file it came from.

## 0. What 1-7 taught us (plain words)
- The meter (DIFFICULTY.md, bits per ask) read 1-7 at 2.2 against a 5.5 target, and could not see the eagle at all: it has no term for
  "hold still while watched" (METER-1 REPORT §3, §5). It got "easy" partly by luck: a missing term, not a measured one.
- The tier bots, which are calibrated to the testers (BOTS.md), already said it: middle tier on Normal, 1-7 = 0.8 misses a run, 0.17 a
  minute, the same as 1-1 (0.15) and far under 1-5 (2.34) and 1-8 (1.81) (METER-1 bots-summary.txt, 4 layouts each).
- The first-timer kid bot (FT_KID, NOT tester-calibrated) took 31 hits in 4 runs of 1-7 Normal (2.57 a minute) and 0 on Easy. By Matt's
  rule that is Easy's job, and Easy already does it. The kid bot is not a Normal reference.
- **Lesson for the model:** a points table is a guess at the chance of failing. A simulated player with tester-measured noise MEASURES
  that chance. So: failure measured by calibrated play is the number; the bits table becomes the explanation and the design-time
  predictor, and every disagreement between them is a finding (a bot blind spot or a missing term), never averaged away.

## 1. The model
**Scope.** Only the REQUIRED path counts: the beats the route must clear to reach the shrine with the goal full. Optional risk (a reward
ledge over a pit, a shortcut, playing fast) is the player's choice, not the level's difficulty ("people die because they're being risky").
The bots play the required route; a reward detour is never in the number. The reference player for Normal is the **middle tier**
(tester-like adult), with expert and child shown beside it; the reference for Easy is the **child tier on Easy**.

**Per beat i, for tier t:** the chance he fails one try, from five channels (Matt's factors), treated as independent for a first version:
  p_i = 1 - (1 - p_prec)(1 - p_time)(1 - p_read)(1 - p_hold)
- **Precision (jump difficulty, landing size).** Margin m short and m long (px of reach to spare either way, from flown arcs, specs/reach.md)
  against the tier's landing spread s_x (from its aimQ / holdQ quantiles, s ~ (p75 - p25) / 1.349, flown): p_prec = Phi(-m_short / s_x)
  + Phi(-m_long / s_x). This is the error-model reading of Fitts (effective width We = 4.133 SD, set at a 4% miss rate; Wikipedia, Fitts's
  law): today's bits are log2 of the same margin ratio, so the meter's bits map onto it; p is what bits can't give: a chance.
- **Timing (moving things, double press, liana release).** A window W_t (frames in which the press works, flown in the engine), the
  tier's aim offset b and timing spread s_t (dbl2Q, lateQ, plus touch jitter): p_time = 1 - [Phi((W_t/2 - b)/s_t) - Phi((-W_t/2 - b)/s_t)].
  This is the shape of Lee & Oulasvirta's temporal-pointing error model (CHI 2016; abstract only, full text blocked here): a press aimed
  at an implicit moment inside a window, with touch adding finger-travel and registration variance. "How fast things move" enters here
  (a faster thing is a shorter window) and in reading; it gets no weight of its own.
- **Reading (enemy, surprise, seeing it in time).** Time available T_av = (distance at which the threat or the landing first shows on
  screen in THAT orientation - the distance at which he must commit) / his speed. Reaction time RT is right-skewed (Wikipedia, Mental
  chronometry: simple visual RT about 190-200 ms, mean > median > mode), its median grows with the choices (Hick: a + b log2(n + 1)), and a
  first meeting or a fake-out adds to it. p_read = P(RT > T_av). Portrait shows less ahead than landscape, so each orientation is scored
  and the stage takes the worse (we ship both).
- **Holding still (the eagle, restraint, "don't press").** A watch of length L that needs no move: a tier slip rate lambda (unwanted
  presses or moves a second while told to wait) gives p_hold = 1 - exp(-lambda L); reaching cover before the look is a reading term with
  T_av = warn - time to run to cover; a fake glance (no tell) is a reading term with the tell set to 0. lambda is NOT measured for any tier
  today (§2): this is the term METER-1 could not price and the first thing to measure.
- **Pressure (things at once, no rest).** k other live demands within 1.5 s widen every spread: s' = s (1 + kappa k). kappa is a design
  value fitted on World 2+ (World 1 has almost no overlap; DIFFICULTY.md §1 says the same of its 50%).
- **Novelty.** The n-th meeting of a move: s_n = s_inf (1 + nu n^-alpha), the power law of practice (Newell & Rosenbloom 1981, cited in
  DIFFICULTY.md, not opened tonight). The taught first beat is n = 1.
Rule: where the bot and these channels disagree, the measured bot number stands and the channel is checked (§2).

**Stakes on top (how often he can die, and what it costs).** Each try that fails costs by kind: a put-back (soft: retry this beat, a few
seconds), a heart (hit; counted in seconds-equivalent H, a design value), or a life (back to the last flag: every beat since the flag is
replayed, and can fail again). With q_i = 1 - p_i, t_i a clean try's seconds and the flag before beat 1 of a segment:
  retries at beat i: R_i = p_i / q_i (geometric)
  life-type failure, restart at the flag: E_k = (E_{k-1} + t_k) / q_k, E_0 = 0 (closed form for equal beats: t * sum_{j=1..k} q^-j)
  put-back-type failure: E_k = E_{k-1} + t_k / q_k + R_k * (put-back seconds)
The recursion is why a flag before the hard beat matters so much: setback grows with every beat between the flag and the miss.

**The level number, per tier and setting.**
- Lost time D = E[finish] - clean finish (seconds spent failing and replaying), plus H per heart; reported as **lost seconds per clean
  minute** L = 60 D / T_clean. This is "how often he dies, and what it costs" in one unit a player feels (time not progressing).
- Beside it: retries per minute (60 sum R_i / T_clean), P(clean run) = prod q_i, and clean-run surprisal B = sum -log2 q_i (bits of
  failure; log survival is how Isaksen et al. read their Flappy Bird game space: 2015 FDG / 2018 IEEE ToG, abstract only).
- **Meter (0-100) = M(L_middle, Normal)**, M monotone, fitted once on anchors (§4). Easy = M(L_child, Easy).
- **Hard but fair vs cheap**, per beat, as checks (no weight): a beat is CHEAP if (a) most of its p is reading (he could not see it in
  time), (b) its setback is long and the replay before it is easy (a long walk back to a hard jump), or (c) its p does not fall on
  retries (luck, not skill: survival analysis of retries, Isaksen & Nealen's learning-rate comparison, abstract only). Fair failure is
  precision or timing that falls with practice, with the restart close. Matt's "hard" is allowed; "cheap" is a defect.

## 2. How WE compute it (what we have, what is missing)
**Have:** the real engine headless (realPlay.ts); the bots on it (castBots.ts, firsttimer.ts; METER-1's botcross.ts driver, one line a run:
hits, lives, put-backs, rescues, time); the tier bots' noise taken from the testers' profiles (BOTS.md: holdQ, aimQ, lateQ, dbl2Q, steerQ
quantiles); flown arcs and reach (specs/reach.md, score.ts); the stage's own lay (flags, chase, rolling, watch ground: score.ts reads them).
**Primary number = Monte Carlo:** each tier bot on N layouts x M noise seeds; every failure tagged to the beat it happened in; p_i = fails /
tries with a Wilson interval; E[finish] measured, so the stakes recursion is a check on the run, not a guess. **Analytic channels (§1)**
from arcs + tier spreads explain each p_i, predict a stage before it is built (the design doc's table), and flag a bot blind spot
wherever channel p >> bot p.
**Missing (named plainly):**
1. Holding still: no tier has a slip rate; no tester window on 1-7. Until a tester or Matt's own play log measures it, lambda is a SWEEP
   (0.02-0.2 a second) reported as a range, never a tuned value.
2. Liana release: the tier bots' release timing is not calibrated (1-6: tier 0.05 vs first-timers 1.89 misses a minute; METER-1 §4).
3. Reaction time: no profile measures it; look / stopReact / heed are FT_ADULT's guesses (BOTS.md, "kept").
4. Calibration base: the tier bots were calibrated on 0.9.5's 1-1 and no longer match the re-laid 1-1 (BOTS.md, 11-11 note).
5. Per-beat tagging: botcross.ts records failures per run, not per beat; only the calibration JSONL has per-piece counts.
6. Sample: 4 layouts a stage is too few (one miss moves a cell 0.25 a run). Target 16 layouts x 3 seeds, with intervals shown.
7. Bot cells that are bot defects, not difficulty (excluded until explained): 1-4 expert 5.5 misses a run vs middle 1.8 (an expert should
   not fail more); 1-6 Normal tier pass rates 0-2 of 4 with near-zero misses (stuck or rescued, not failing a beat).

## 3. Validation
**Per beat, done tonight (testers' tier sheet vs the middle bot, roles only):** 1-1 on 0.9.5, middle tier Normal, the 25 pieces with 5+
runs on both sides (tools/playtesters/profiles/tiers/middle.json `pieces`; R-165.59/calibration-0.9.5.jsonl): fails a run (lives +
put-backs) agree at Pearson r = 0.94, Spearman rho = 0.94. Nonzero pieces, tester vs bot: canopy-rungs-level 0.83 / 0.61, log-chain-rise
0.67 / 0.91, mushroom-chain-back 0.60 / 0.50, double-teach 0.55 / 0.55, dip-double-teach 0.20 / 0.37, leap-stones 0.20 / 0.36,
log-stair-test 0.09 / 0.06; 18 pieces 0 on both. **Honest limits:** in-sample (the bots were fitted on these runs; top-3 pieces were a
target), the 18 shared zeros lift r, and tester n per piece is 5-15. It shows the per-beat measure tracks testers where calibrated, not
that it predicts new stages.
**Per stage, against Matt:** middle Normal misses a minute (bots-summary.txt): 1-1 0.15, 1-2 0.09, 1-3 0.07, 1-4 0.48, 1-5 2.34, 1-6 0.10
(bot cell suspect, §2.7), 1-7 0.17, 1-8 1.81. Matt's 1-1 4 > 1-2 2 > 1-3 1: order holds. 1-7 "really easy": the bots put it with 1-1,
below its 5.5 slot: agrees. **Predictions to test, written before he plays:** 1-8 reads hard (about 1-5's level); 1-5 reads the hardest
of World 1 by failures, mostly soft put-backs (28 of 31): if Matt calls 1-5 "fair, not the hardest", the put-back seconds and the
hard-but-fair checks are what move, never the measured p.
**Protocol (every new stage):** fit M on 1-1..1-3 only; write the predicted band for each held-out stage in reference/design/LEVEL-LOG.md
BEFORE Matt plays it; pass = rank order on held-out stages (Kendall tau >= 0.6 over 5+ stages) and every Matt rating inside the
prediction's interval +-1.5. Tester windows add per-beat rows (roles only, no names). Matt's verdict is the final word; a miss is a
defect with a root cause, not a refit to clear it (LAWS 22).

## 4. How the bands in DIFFICULTY.md §4 map onto it
- The scale, bands and slots keep their meaning: 0-100, each world about its tenth [10w - 11, 10w + 1], the sawtooth T[s], 10-9 = 100.
  Only the number underneath changes: meter = M(L_middle, Normal), M = A log2(1 + L / L0), A and L0 fitted on Matt's 1-1 4 / 1-2 2 / 1-3 1.
  Log because failure rates across a game span orders of magnitude (0.07 to several a minute); the shape is a choice, named as one
  (DIFFICULTY.md rejected a Weber-Fechner law for want of a game study: this is not one, it is a monotone map refitted at World 10).
- The top: 100 = the 10-9 target, set as a lost-time rate (a first value to argue about: the middle tier loses as much time as it plays,
  L = 60 s a minute) and re-checked when World 10 is built.
- "Easy at most 0.6 x Normal" becomes M(L_child, Easy) <= 0.6 M(L_middle, Normal), the same scale.
- Gates G1-G3 stay. New, per beat on Normal: **G4** no required beat with middle p > 0.5 unless a flag sits within 10 s before it; **G5**
  no beat whose p is more than half reading in either orientation (cheap); **G6** the bits meter and the measured number agree within a
  band, or the stage carries the named finding.

## 5. Build plan: METER-2 (tools only; two packets, xhigh engine tier)
**METER-2a, the measure (3-4 h + runs).**
- tools/difficulty/beatfail.ts (new): runs castBots tiers (child, middle, expert) on N layouts x M seeds through firsttimer.ts; tags each
  hit, life and put-back with the route beat (route beats.ts) by x position; writes per-beat tries, fails, Wilson CI, seconds, setback.
  Needs FTRun.harms to carry x (check firsttimer.ts first; add it if missing, tools side only).
- tools/difficulty/expected.ts (new): the stakes recursion from the stage's flags, L, retries a minute, P(clean), B; M fitted on 1-1..1-3.
- Tests (tools/difficulty/model.test.ts, added to the workflow so ciTests.test.ts stays green): recursion vs the closed form; a flag moved
  before a hard beat lowers L and leaves p; a reward ledge off the route changes nothing; an inverted tier (expert > middle) is flagged.
- Plants (each RED when the old behaviour is put back): margin halved -> p up; flag removed -> L up; beat tags shifted one beat -> per-beat
  table red; optional detour counted -> red.
**METER-2b, the channels and the eagle (3-4 h).**
- tools/difficulty/channels.ts (new): p per channel from flown arcs + tier spreads, both orientations (the camera's view ahead).
- firsttimer.ts tier bots: a `slip` rate and watch behaviour; swept 0.02-0.2 a second, reported as a range until a tester or Matt's play log
  measures it; plant: a longer watch -> p_hold up; an off-screen threat in portrait -> G5 red.
- Re-score 1-1..1-8 at 16 layouts x 3 seeds; the prediction table for 1-6 and 1-8 goes to the lead before Matt plays them.
**Size and cost:** about 7-8 h of builder time across the two packets; bot runs about 2,300 (8 stages x 3 tiers x 2 settings x 48), CPU
time unmeasured (time one 1-1 run first and say it). **Built on:** castBots / firsttimer / score.ts as on t-meter-1; if a planned job this
sprint replaces the tier bots' calibration (BOTS.md re-measure), METER-2a waits for it (D40).
**EXACT NEXT STEP:** a cold Critic reviews this file; then METER-2a starts with `beatfail.ts` on 1-1 middle Normal 0.9.5 and reproduces
the r = 0.94 per-piece table above from its own tags before any other stage is scored.

## Sources (opened = read tonight; abstract = only a search summary; cited = from DIFFICULTY.md, not re-opened)
- Opened: Wikipedia, "Fitts's law" (Shannon form, We = 4.133 SD at 4% errors, temporal pointing IDt), https://en.wikipedia.org/wiki/Fitts%27s_law
- Opened: Wikipedia, "Accot-Zhai steering law" (T = a + b integral ds/W(s); speed proportional to width), https://en.wikipedia.org/wiki/Accot%E2%80%93Zhai_steering_law
- Opened: Wikipedia, "Mental chronometry" (visual RT ~190-200 ms; right-skewed; Hick), https://en.wikipedia.org/wiki/Mental_chronometry
- Opened: Wikipedia, "Dynamic game difficulty balancing" (challenge function; rubber band; players playing badly on purpose, Rollings &
  Adams; Hunicke 2005 listed only), https://en.wikipedia.org/wiki/Dynamic_game_difficulty_balancing
- Opened: Wikipedia, "Flow (psychology)" (clear goals, immediate feedback, challenge-skill balance; Chen's Flow), https://en.wikipedia.org/wiki/Flow_(psychology)
- Abstract: Aponte, Levieux & Natkin 2011, "Measuring the level of difficulty in single player video games", Entertainment Computing 2(4)
  205-213, doi:10.1016/j.entcom.2011.04.001 (difficulty as the probability of losing a challenge), https://hal.archives-ouvertes.fr/hal-01125929 (blocked)
- Abstract: Constant, Levieux et al. 2017 (difficulty = the player's estimate of failing; players underestimate high difficulty), via search
- Abstract: Mourato & Santos 2010, "Measuring Difficulty in Platform Videogames", Interaccao 2010, doi:10.2312/pt.20101177 (losing
  probability per obstacle), https://diglib.eg.org/handle/10.2312/pt20101177 (blocked)
- Abstract: Isaksen, Gopstein & Nealen 2015, "Exploring Game Space Using Survival Analysis", FDG; Isaksen, Gopstein, Togelius & Nealen
  2018, IEEE ToG (motor-skill player model, Monte Carlo, survival of scores, 106 M simulated sessions); Isaksen & Nealen, "Comparing
  Player Skill, Game Variants, and Learning Rates Using Survival Analysis" (AAAI), https://bibtex.github.io/FDG-2015-IsaksenGN.html (blocked: pixl.cs.princeton.edu, cdn.aaai.org)
- Abstract: Lee & Oulasvirta 2016, "Modelling Error Rates in Temporal Pointing", CHI 1857-1868, doi:10.1145/2858036.2858143 (implicit aim
  point in a window; three touch timing error sources), https://dblp.uni-trier.de/rec/conf/chi/LeeO16.html (full text blocked)
- Abstract: "What Makes a Level Hard in Super Mario Maker 2?", arXiv 2507.21078 (clear rate = clears / attempts as the proxy; median
  "normal" level 25%), https://arxiv.org/pdf/2507.21078 (blocked); Mario Maker clear-rate press: https://www.gamesradar.com/hardest-super-mario-maker-levels/ (not opened)
- Search only, not opened: Game Developer, "Dissecting Design: the (in)accessible nature of Celeste", https://www.gamedeveloper.com/design/dissecting-design----the-in-accessible-nature-of-celeste ;
  PC Gamer, "Celeste review", https://www.pcgamer.com/celeste-review/ ; Game Developer on Shovel Knight boss tuning from playtests,
  https://www.gamedeveloper.com/design/how-yacht-club-games-created-shovel-knight-s-specter-knight-plague-knight-and-propeller-knight-bosses
- Cited (DIFFICULTY.md): Thorson, "Celeste & Forgiveness"; Yacht Club, "Check Point Design"; Smith et al. 2009 rhythm groups (Launchpad);
  Newell & Rosenbloom 1981; Summerville 2017; Sorenson 2011; Kahneman 1993.
- Not found tonight: Hunicke 2005 full text (Hamlet); a DKC design talk. Hosts blocked from this session: arxiv.org, hal.science, diglib.eg.org,
  pixl.cs.princeton.edu, cdn.aaai.org, displaydaily.com, maddymakesgames.com, yachtclubgames.com, users.soe.ucsc.edu, semanticscholar.org.
