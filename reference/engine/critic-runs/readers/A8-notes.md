# A8 notes: GEMINI-PCG-RESEARCH.md and GEMINI-LEDGER.md against ENGINE-SPEC.md (engine-spec 7f4373c)

Scope: 137 rows (76 research, 61 ledger). Spec read L1-1635. Engine code checked in /home/user/mix (engine-mixer 7d9ad9a9):
tools/engine runs `levelCheck`/`easyHoldCheck`, `tools/inspect/firsttimer.ts` and the inspector's pacing (cp3-pace16.sh,
1-5 only). Nothing in src/game/mixer or tools/engine imports `era.ts`, `lookalike.ts` or `bands.ts`, and no run compares
one stage with another.

## (a) The 10 most important MISSING / CONTRADICTED rows, ranked (repetition across the whole game)

1. **GEMINI-LEDGER.md:39 (C7), MISSING.** "3-gram cosine across stages (reject > 0.78 adjacent) and 18-beat sliding windows
   (reject < 0.28) ... `tools/inspect/lookalike.ts` ... threshold 0.30". The spec compares stages only by shared ideas or pieces
   ("no more than half", L41, L133) and by a feel check with no number (L1042-1044). Two stages built from different ideas can
   still *play* the same rhythm (jump, jump, bounce, rest). That is the "it's just repetitive" feeling, and it is not measured
   anywhere in Worlds 1-10. The tool and its threshold already exist; the spec just doesn't call them.
2. **GEMINI-PCG-RESEARCH.md:11, MISSING.** "Sameness: weighted action strings; compare every 20-second stretch against the
   world's other stages; reject repeats." This is the summary Matt approved on 10-27. The only window check the spec keeps is
   inside one stage (the fun gate's "repeats, 5 → 0", L492).
3. **GEMINI-PCG-RESEARCH.md:406, MISSING.** Comparing levels of different length: "Never compare two 2-minute levels with a
   single global string edit distance ... Sliding-Window ... N-Gram TF-IDF Cosine". The spec makes lengths vary on purpose (L667:
   neighbours differ by at least 20%), and this is exactly the length-proof measure it would need. It is absent.
4. **GEMINI-LEDGER.md:37 (C5), MISSING.** "Expressive range analysis: 200-1,000 rolls, metric heatmaps, diversity D_sim >= 0.35."
   Every spec line is judged per roll against the old 1-1's floors on 16 rolls (L261, L395-400). Nothing checks that roll 3 and
   roll 9 are different stages. L337 says "Decks are what make two rolls different stages", but that is never measured.
5. **GEMINI-PCG-RESEARCH.md:257, MISSING.** "If all 1,000 levels cluster into one tiny bright spot ... sameness regardless of how
   many random seeds" and "D_sim < 0.35 compared to any previous level generated in the same World ... reject". There is no
   spread check and no same-world distance.
6. **GEMINI-PCG-RESEARCH.md:15, MISSING.** The same tool in Matt's approved list ("Matt asked for this tool on 2026-10-28"). The
   engine doesn't use `era.ts`.
7. **GEMINI-PCG-RESEARCH.md:290 / GEMINI-LEDGER.md:61 (E3), CONTRADICTED L889-892.** Research: "Easy 0.35-0.55 ... Normal
   0.75-1.15 actions/sec". The spec keeps the Easy line (L508, L797: "this line is not loosened"), then moves it to "Easy no denser
   than the old 1-1's Easy range" (L892) and accepts 0.61/0.63. Normal is "not judged on matching main's density" (L801-803).
   Density is the main dial for how busy a stage feels, so it should have a fixed target that holds across worlds.
8. **GEMINI-PCG-RESEARCH.md:105, CONTRADICTED L640.** Research: "Max 65% / Max 82% of physical jump limit". The spec's Normal gap
   runs "0.55 → 0.92" of `jumpOK`'s limit, and `jumpOK` = reach x 0.97 (levelCheck.ts MARGIN). That passes 82% of reach when
   d > 0.80, which is about stage 9-4 onward. This is a late-game fairness issue more than a repetition one.
9. **GEMINI-LEDGER.md:40 (C8), MISSING.** "Horizontal mirroring of rooms". `w1mix.ts` flips only leaf dressing, never an idea's
   piece order. Mirroring is the cheapest way to multiply variety in all ten worlds, with no new art.
10. **GEMINI-PCG-RESEARCH.md:123 and :118, MISSING.** "Level 9 Mastery Gauntlet ... testing every prop, enemy, and move from the
    world" and "Level 4 Combat / Gauntlet". The spec varies stages by their feel profile (L1037-1044) and its move ladder, but has
    no stage *types* with different win conditions. Row :111 (mission deck) is only PARTIAL for the same reason. Without stage
    types, every world's 9 stages are the same kind of left-to-right relic run.
    Runners-up: GEMINI-LEDGER.md:42 (C10 curation, R2); GEMINI-PCG-RESEARCH.md:8 (R2).

Key PARTIALs that matter just as much: :23 and LEDGER:36 (cooldown: the research forbids the same chunk "within 2 levels" and
"twice in the same world run", but the spec lets neighbours share up to half their ideas and keeps no memory across stages or
rolls); :240 (no per-world library-size target, against the research's "28 to 35 handmade chunks per world" for 63 chunks played
per world).

## (b) Where the spec claims a source and the research says otherwise

- **Dead time.** Spec L507-510: "The pass lines are the fun gate's own: ... no dead time over 2.5 s". Research :291: "Easy 3.0
  seconds max ... Normal 2.0 seconds max ... chase 1.2". The fun gate (`tools/inspect/pacing.ts` TARGETS) uses idle 3.0 / 2.0 /
  1.2. So the single 2.5 s line is neither the research's nor the fun gate's. It is too loose for Normal.
- **Rhythm groups.** Spec L497 measures against the research band ("92 s against 6-8 s"), then sets L509: "no Easy run over 20 s
  without a 2-second rest (the plan's 5-20 s groups)". Research :292: "Easy 6-8 seconds (3 to 4 actions per burst) | Normal
  10-14 seconds (8 to 12 actions) | chase 15-20 seconds". 20 s is the research's chase value, applied to Easy.
- **New-world ease-in.** Spec L631-632: "Each new world's first stage starts at the previous world's middle, not its end. That is
  STAGE-RULES §1b's rule that a new world eases in." Research :100: "Level 1 of a new world drops slightly below the end of the
  previous world". The spec drops by half a world (1-9 0.18 → 2-1 0.09, L633), not "slightly".
- **Easy as the same layout.** Spec L179: "Every idea is the same idea on Easy; only its numbers soften". L505 cites R3: "Easy asks
  for fewer moves a second, not the same moves with wider gaps". Research :221: "Easy Mode and Normal Mode should use the exact same
  generator pipeline, differing only in their Kinematic Margin ..., Platform Edge Padding (+2 tiles), Hazard Forgiveness, and
  Objective Quotas" (also :102 "Same Seed, Adapted Rules"). The spec's Easy also drops canopies (L811), lays fewer bursts (L796) and
  adds pads (L503). That is a different layout, which the cited R3 supports and Gemini does not.
- **Consistent claims (no conflict):** L651 "STAGE-RULES §1b's per-jump bot floors" matches research :368 exactly. L1120 "the
  player's rhythm, not the song" matches :462 ("the rhythm that players feel in their hands").

## (c) Spec numbers that a research row answers directly

| Spec line | Spec value | Research line | Research value |
|---|---|---|---|
| L41, L133, L1224 | neighbours share at most half their ideas or pieces (the only cross-stage number) | :434-435, LEDGER:39 | cosine > 0.78 adjacent rejected; window < 0.28 rejected; lookalike 0.30 |
| (none) | no roll-diversity number | :17, :276, LEDGER:37 | D_sim >= 0.35 |
| L510 | dead time at most 2.5 s, both settings | :291 | 3.0 s Easy, 2.0 s Normal, 1.2 s chase |
| L508, L797 → L892 | Easy 0.35-0.55, then "no denser than old 1-1's range"; accepted 0.61 median / 0.63 worst (L889) | :290 | Easy 0.35-0.55 |
| L493, L801 | Normal 0.74 "too sparse" cleared; 0.80 "accepted as provisional" against main's 0.57 | :290 | Normal 0.75-1.15. 0.80 is inside the band; main's 0.57 and 0.74 are under it |
| L509, L816 / L800, L885 | longest run without a rest: Easy 20 s, Normal 29 s | :292 | groups Easy 6-8 s, Normal 10-14 s |
| L390, L504 | bursts of 4-6 pieces (Easy 3-5) | :292 | Easy 3-4 actions, Normal 8-12 actions a burst |
| L503, L752 / L799 | Easy 2-3 s pads between nodes, 4-5 s rests; Normal 1.0-1.2 s after every second burst | :293 | Easy 2.0-2.5 s, Normal 1.0-1.2 s, between every burst |
| L651 | Normal adult 70% (W1-5) / 50% (W6-10), Easy kid 85% | :368 | identical |
| L183-186 | Easy flick at least 300 ms ("298 ms, just under 300") | :369 | Easy W_min 300 ms; Normal 167 ms (no spec value) |
| L640 | gap share Normal 0.55→0.92, Easy 0.45→0.80 of the gate's limit (gate = 0.97 x reach) | :75-76, :105 | at most 0.82 Normal, 0.65 Easy of the physical maximum |
| L642 | landing p50 Easy 260→150 vs Normal 220→110 px (+40 px) | :106 | Easy +2 tiles (about 64 px at the 32 px tiles of :306) |
| L645 | taught animals Easy 0-1→3 vs Normal 0-1→4-5 | :108 | Easy 60% of the enemy budget |
| L643 | risky pieces per burst Normal 0-1→3-4, Easy 0→2 | :370 | peak stress per group: at most 2.5 Easy, 5.5 Normal (summed risk, not a count) |
| L462 (was L360) | marks goal 10/13 Normal (77%), 8/13 Easy (62%) | :109 | collect 100% Normal, 70% Easy |
| L631-633 | next world starts at the last world's middle (−0.09 d) | :100 | "slightly below the end" |
| (none) | no coyote or buffer value | :110 vs :304-305 | the research disagrees with itself: 180/180 Easy, 100/120 Normal vs 167/133 coyote, 200/133 buffer (the game uses 133/167, LEDGER:80) |
| L652 | teach step miss chance at most 0.01 | :317 | Ki: zero lethal failure, max_threat = 0 |
