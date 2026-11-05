# A7 notes: R3 (fun by math) and R4 (mobile and architecture) against ENGINE-SPEC.md (engine-spec 7f4373c)

Rows: R3 60, R4 25 (85). Used 10, partial 21, missing 13, contradicted 1, n/a 40 (time logs, physics-feel constants, source list).
Whole spec read (L1-1635); each MISSING was also searched under other wordings (quit/churn/persist, glicko/rating, flow,
ncd/distance/between rolls, npvi/regular/swing, thumb/σ/calibrat, touch, catalog/fingerprint, stream/seed, elastic, stuck/stall/loop).

## (a) The 10 most important MISSING / CONTRADICTED rows, ranked for repetition across the whole game

1. **R3:265 (W1), CONTRADICTED by spec L799-800, L901.** R3: "`groupsOf` ... splits groups at any 1.0 s (Normal) / 2.0 s (Easy)
   pause ... On Normal every group is a single move or a pair: the stage is beats with rests between them, not rhythm groups. The fix is
   a relative boundary (F13)." The spec lays "A 1.0-1.2 s pad after every second burst on Normal" (L799) and passes "Normal's longest
   run 14.9 / 19.2 s" (L901) on that fixed boundary. Why it matters: tempo is where R3 found the sameness Matt feels (W11: "one tempo"
   flagged on all 16 layouts of all 9 stages). If the rest boundary cannot see phrases, every world's pacing line can pass while every
   stage still plays at one even beat. The relative boundary appears nowhere in the spec.
2. **R3:609 (idea 8), MISSING.** "Length-calibrated NCD ... a stage against itself ≈ 0.09, against a shuffle ≈ 0.62 at our lengths;
   judge NCD inside that range." The spec has no sequence distance at all, between rolls or between stages. Its variety gate counts
   pieces (share, run, new, neighbours share ≤ half, L32-41), so two stages with the same pieces in the same order pattern, or 16 rolls
   that differ only in sizes, are not caught. Ties to the PARTIAL at R3:337 (W12: "1-1 has 2 distinct terrain move strings").
3. **R4:570 (idea 7), MISSING.** "Layer-locked rerolls ... keep the node list and bars, reroll steps; keep steps, reroll surfaces and
   hazards. Needs one RNG stream per node and per layer." The code already has it (`w1mix.ts:26-27` "one RNG stream per seed and salt
   ... every node and layer draws from its own stream", `:939`), but the spec neither requires it nor uses it as a debug switch. Without
   it nobody can show which layer gives a world its variety, so a world built later can quietly lose a layer's variety.
4. **R3:601 (idea 4), MISSING.** "Rate stages like chess players (F16, Glicko-2 with phantom matches) ... a world's spread is its band,
   and the survivorship fix stops hard late stages from looking easy." The spec's dial (L628) is a formula of world and stage, never
   checked by a measured rating. Flat difficulty across worlds is one of the ways a 90-stage game reads as "the same"; the dial
   promises a ramp but nothing measures that the ramp happens.
5. **R4:98 / R4:559 (lesson 7, idea 4), MISSING.** "Our first-timer bot's noise ... came from Gemini's research ... not from Matt's or a
   tester's recordings ... the answer swings from 0.0 to 1.6 expected falls a stage on those two settings alone." Every bot-judged spec
   line (E[lives] L644, floors L651, both bots 4/4 L908) rests on that noise. Matters for the difficulty ramp in every world.
6. **R3:305 (W6), MISSING.** "`FT_ADULT.thumb = [0.03, 0.03]` ... A 30 ms phone thumb is steadier than their best condition ... Suggest
   adult σ = 45 ms, rising with hazard speed." Same effect as 5: Normal reads easier than it is, so the dial's later-world risk is
   underestimated everywhere.
7. **R3:615 (idea 12), MISSING.** "Knob elasticities ... a measured Δ(success) per pixel or per unit of speed for each builder knob, so a
   builder can hit a target by arithmetic." The dial's values are "estimates, to be tuned on Matt's play" (L635-636); without
   elasticities, each world's numbers are tuned by hand per stage instead of hitting distinct targets.
8. **R3:599 (idea 3), MISSING.** "A player population on top of the bots ... It turns 'is this too hard?' into 'who leaves here?'.
   Run in §4.7: it singles out one jump on 1-1 Easy" (45% of Easy starters lost). Retention, not variety, but it is game-wide.
9. **R4:567 (idea 6), MISSING.** "Plot where the bots end ... so a helper and the lead see clusters at a glance." Tools exist
   (`tools/engine/cp3-stuck.ts`, `cp4-stuck.ts` print stuck x by idea as text); the spec never names them or a picture.
10. **R4:563 (idea 5), MISSING.** "Pin the gesture-recogniser constants and the `FORGIVE` table ... into each curated roll's manifest
    ... A control tweak is a level change." The stage profile (L1208-1230) has no touch field. Low for repetition.

PARTIALs that matter more for repetition than most of the MISSING rows above (the spec has the shape, not the number):
- R3:607 novelty **band** (spec has a floor "something new every 572 px" L397, no upper bound; R3: "too high diversity leads to odd
  connections", Shu et al.). R3:605 flow share ("A perfectly even stage scores zero by construction, which is the D26 complaint in a
  formula"); spec only orders node jobs (L339-351, L655). R3:610 rhythm type is drawn per node (L1120-1121) but never measured by nPVI.
- R4:547 coverage gate: "a palette option is laid 0 times over the 16 shipped layouts" fails. Spec has can't-reach = 0 (L1139) but
  no check that pieces in the library are ever laid; R4 measured "28 of World 8's 80 authored sections are in no shipped roll".
- R3:337 (W12) roll-to-roll sameness: spec judges each of 16 rolls against the old 1-1, never rolls against each other.

## (b) Places the spec claims a source and the research says something different (or more)

- **Spec L799 (Gemini's rest pad) vs R3 L208-211.** Spec: "A 1.0-1.2 s pad after every second burst on Normal." R3 F13: "The table's
  Normal row: 8-12 actions in 10-14 s, rests 1.0-1.2 s. Inside-burst interval = 0.91-2.0 s, typical 12 s / 9 = 1.33 s, which is longer
  than its own rest pad (1.0-1.2 s) ... By its own definitions a Gemini burst is a row of rests." No source named at L799, but the
  number is the Gemini table's; R3 rejects it as a rest definition.
- **Spec L496, L508 ("Easy at 0.35-0.55 actions a second") vs R3 L210 and L274.** The band is Gemini's (`GEMINI-PCG-RESEARCH.md:290`,
  per R3 W2). R3: "Easy: 3-4 in 6-8 s gives 2.0-4.0 s intervals against a 2.0-2.5 s rest." The spec later admits "the band is not
  calibrated" (L802, L854) and moves to "no denser than the old 1-1's Easy range" (L892), which is the right direction, but CP3's Easy
  rulings from L496 to L878 were all fought against the uncalibrated band.
- **Spec L509 "(the plan's 5-20 s groups)" vs R3 L200 and L547.** Launchpad: "group lengths 5, 10, 15 or 20 s; joined by a rest
  platform." The spec caps Easy at 20 s but sets Normal at "no worse than main's 29 s" (L800); R3: "8 of 9 stages have a phrase over
  20 s with no rest ... STAGE-RULES §0b.1 ... failing". The spec's Normal line keeps the failure R3 named.
- **Spec L505 "(§2.5's finding, R3 W2)":** consistent with R3 L272-281. R3 adds what the spec does not carry: "raise the density of
  *lenient* actions ... without raising the hazard sum (F1). Density and difficulty are two different dials." Spec's dial table
  (L638-648) has no density dial; density appears only as a pass line.
- **Spec L109 "(R3 F10)":** consistent ("Kicking turtle shells 0.345", R3 L170). R3's limit not carried: "Correlations from one game's
  short sessions; fun was not predictable from level parameters alone" (L181).
- **Spec L644 "DESIGNER §2.3; bots judge it":** the E[lives] idea is R3 F1/idea 1, but the numbers are not R3's (see c), and R3 warns
  "The timing-only form under-predicts our misses badly ... Use bot rates, not the closed form, for s_i" (L48-49); the spec does not
  say which bot or which form.
- **Spec L1138 "PLAN.md E1/E9: 932 -> 41 rejections once one predicate was shared" vs R4 L456-462.** R4's experiment with a hand copy
  got 932 -> 413 and "80 px is still proposed and still refused ... two hand-written models of the same jump drift". Not a conflict:
  the spec's 41 is with the shared predicate R4 asked for; R4's 413 is the copy. Consistent.

## (c) Spec numbers that a research row in these files answers directly

| Spec line | Spec value | Research line | Research value | Reading |
|---|---|---|---|---|
| L644 | E[lives] Normal 0.5 → 3.0 over d 0-1 | R3 L42-44 | World 1 Normal ≤ 1.0, rising about +0.5 a world | W1 fits (0.5-0.95). Spec climbs 2.5 × 0.091 = 0.23 a world, half R3's +0.5; 10-9 = 3.0 vs about 5.5 by R3's ramp |
| L644 | E[lives] Easy 0.2 → 1.0 | R3 L43 | World 1 Easy ≤ 0.3 | 1-9 (d 0.18) gets 0.2 + 0.8 × 0.18 = 0.345, over R3's 0.3 |
| L435, L658 | 1-5 E[lives] about 0.7 (d 0.09) | R3 L483; R4 L525-526 | old 1-5 Normal E[costly miss] 0.00 (jump bots); first-timer 1 life in 2 runs | the budget is far above what 1-5 delivered; no measured E[lives] of the new 1-5 is reported (L897-909), and no E[lives] check exists in `/home/user/mix` (grep) |
| L652 | every teach step miss ≤ 0.01 | R3 L60 | teach beat ≥ 0.97 | spec stricter (0.99) |
| L651 | per-jump floors: Normal adult ≥ 70% (W1-5), 50% (W6-10); Easy kid ≥ 85% | R3 L60-61, L294-297 | first test 0.85 Normal / 0.92 Easy; practise ≥ 0.95; "32 × 0.3 = 9.6 lives" at a 70% floor | spec has floors only; R3's per-job targets absent; R3 L500 notes 1-1 fails the 0.95 practice target on both settings |
| L508, L816 | Easy density ≤ 0.55 (band 0.35-0.55) | R3 L273-274, L404-412 | Gemini Easy 0.35-0.55; measured old W1 Easy 0.26-0.80, old 1-1 Easy 0.44 | spec's own old-1-1 Easy is 0.575 (L870): the two tools count moves differently (R3 drops small hops, L415) |
| L801 | Normal density 0.80 accepted; main 0.57 | R3 L273-274, L381 | Gemini Normal 0.75-1.15; measured old 1-1 Normal 0.41 | spec's "main 0.57" and R3's 0.41 for the same stage differ by counting rule |
| L799 | Normal rest pad 1.0-1.2 s | R3 L208-209 | in-burst interval 1.33 s typical | pad shorter than a normal interval: not a rest |
| L503, L752 | Easy breather 2-3 s; Easy rests 4-5 s | R3 L210 | Gemini Easy rest 2.0-2.5 s vs 2.0-4.0 s intervals | 2-3 s breather can equal an ordinary Easy interval; the 4-5 s rests clear it |
| L390, L504 | bursts of 4-6 pieces (Easy 3-5) | R3 L208-210 | Gemini 8-12 actions in 10-14 s Normal, 3-4 in 6-8 s Easy | spec's bursts are shorter than Gemini's on Normal; measured phrases in R3 L546 are 5-12 moves |
| L509, L800, L816 | longest run without a rest: Easy ≤ 20 s, Normal ≤ 29 s | R3 L200, L547 | Launchpad groups 5-20 s; 8 of 9 old stages have a phrase > 20 s | Normal line allows what R3 calls the failure |
| L510 | dead time ≤ 2.5 s | R3 L325-327 | STAGE-RULES 4 s; 2.0 s Normal / 3.0 s Easy; code 2.5 s | spec picks the code's number |
| L397 | something new every ≤ 572 px, never > 1,516 px | R3 L136-138, L143-144 | novelty inside a band [L, U] set from Matt's favourites (Shu: 74 of 100 segments inside) | spec has the floor side only |
| L261, L851 | judged on 16 rolls | R3 L120-121 | sd of each expressive-range metric over 200 rolls ≥ 0.05; between rolls mean NCD ≥ 0.35 (L143) | no roll-spread number in spec |
| L41, L135 | neighbours share ≤ half their ideas or pieces | R3 L329-335 | move-order cosine 0.00-0.10, NCD 0.64-0.85 for every W1 pair (at shuffle baseline 0.62) | R3 supports gating pieces and tempo, not move order; spec does that |
| L37, L1152 | Normal flat jump 180 px (157-185) as road gap | R3 L233, L556 | full jump carries 185 px (3.9 bodies), rises 103 px | consistent |
| L643 | risky pieces per burst 0-1 → 3-4 Normal, 0 → 2 Easy | R4 L557 | expected falls per node: intro 0, spike 0.2-0.4, climax 0.3-0.6 | spec counts pieces, not expected falls; R4 L479-482: traced geometry gives ~0 falls, so risk must come from placed pieces, which the dial does |
| L366 | single-jump rise about 90 px | R4 L432-437, L444 | 80 and 90 px rises never laid in 16 layouts; clumsy short flick can't reach 80/90 px up | R4 shows the tracer's short-flick try refuses 80-90 px rises (1-2 palettes); the spec does not say whether n9's 90 px rise was traced with that try |
