# A4 notes: LEDGER-ENGINE-GEMINI.md against ENGINE-SPEC.md (engine-spec 7f4373c)

371 rows: 74 used, 143 partial, 73 missing, 8 contradicted, 73 n/a. Research = `r/LEDGER-ENGINE-GEMINI.md`; spec lines are ENGINE-SPEC.md.

## (a) The 10 most important MISSING / CONTRADICTED rows, ranked by how much they matter to repetition across the whole game

1. **L209 (also L442, L502 E38), MISSING, R5. No rule that stages place the curve's parts differently.**
   Research: "Every stage has all seven parts, but no two stages place them the same way (... a fixed curve is itself a pattern the
   player feels): where the spike sits, how long the rest is, and which pair the counter-melody brings must differ from the stage before."
   Spec: the only two plans, 1-5 (L339-351) and 1-1 (L1063-1075), both have 11 nodes, a fork at n4/n5 and n10, a rest at n5/n6, the
   test or moment at n6/n9 and a cool-down at n11. The feel check (L1042-1044) compares branching, up/down, density, commonest kind,
   art and petals, but not node order. If every stage is written to this template, 90 stages share one shape.
2. **L127 (also L527 E63), MISSING, R4. No hazards timed against the player's moves.** Research: "a monkey throws fruit on beat 1
   that lands on beat 3 while Pokey jumps on beat 2 ... Adds a variety dimension (when, not where) that move-letter variety can't see."
   Spec: timed windows only scale each piece's proven window (L647). Its rhythm patterns (L1120-1121: "regular, swing, broken,
   wait-and-go") are never tied to a hazard. Every variety line in the spec measures *where* things are, never *when*.
3. **L224 (also L560 E96, L648 E184), CONTRADICTED. Every stage ends with a cool-down node.** Research (ours): "SR §0b.2 part 4 'a
   15-20 s dense finale ... ending at the exit'" and W1P "ending AT the exit (the cool-down is a few seconds, not a walk)". Spec: n11
   "cool down | bank hops on the forest floor | low → shrine" (L351), and 1-1's n11 "one long high branch ... to the shrine" (L1075).
   That is Gemini's Node 8 "cooldown sprint", which the ledger rejected. Every stage ends the same way.
4. **L600 (E136), CONTRADICTED. Difficulty is a straight ramp inside every world.** Research: "A linear ramp fatigues; needs
   breathers ... IN STAGE_HEAT (pipeline.ts:237) | have". Spec L628-635: d = (0.1(w−1) + 0.2(s−1)/8)/1.1, and "each dial runs
   linearly". So stages 1 to 9 of all 10 worlds climb by the same equal steps. STAGE_HEAT's dips (0.05, 0.3, 0.45, 0.35, 0.6, 0.5 ...)
   are gone, so all worlds share one difficulty contour.
5. **L276 (also L551 E87), MISSING, R3. Density is never planned node by node.** Research: "ρ_i = ρ_min(D) + (ρ_max - ρ_min)·T_i^1.15
   | NOT | tension not bound to density". The diagnosis behind it (L44-46): "every 30 seconds holds the same mix of moves, going the same
   way at the same pace". Spec: one density band per stage and setting (L508, L801). Bursts and rest pads are uniform (L390, L799).
   Nothing makes a test node busier than a warm-up by a number.
6. **L304 (also L592 E128, L595 E131), MISSING, R3. No safety buffer between what the builder aims for and the gate's pass line.**
   Research: "establishes a 3% to 13% safety buffer below the headless checker's 45%-55% rejection zone". Spec: the pass lines *are*
   the old 1-1's own numbers (L395-400: "9 or fewer", "572 px or less"). Misses were accepted as "within the old 1-1's range"
   (Easy density L888-892; Normal density L801). Without a margin, the generator only scrapes past, the "barely squeak past" fault
   Matt ruled out.
7. **L157 (also L689 E225), MISSING, R3. Slow stretches may be empty corridors.** Research: "slow-down zones (mud, silk, shimmy_rope,
   water) are banned from appearing as empty traversal corridors". Spec: the rope must come back in at least 1 of every 3 stages
   (L1539), but the Rope crossing idea is just "hand over hand along a shimmy rope over a gap" (L106). Only swimming gets "no slow
   drag" (L1593). Every world risks the same slow rope filler.
8. **L165 (also L623-624, L691), MISSING, R2. No effects carried from one stage to the next.** Research: "Flags from stage s only
   change a Node-2 or Node-4 bonus in stage s+1 (a hazard becomes a vine or mushroom shortcut, or a hidden-find gate opens); the main path
   never changes". The spec has no cause-and-effect between stages. It is a cheap way to make neighbouring stages and replays differ.
9. **L485 (E21, also L295 F31, L580 E116), MISSING, R2. No check on threats that stack.** Research: "difficulty super-additive (gap
   then enemy on the landing)". Spec: risky pieces are counted one at a time (L643). The clutter cap allows "at most 2 kinds of hazard
   or animal" per view (L316). L317 clears only the jump arc. Taught animals reach 4-5 a stage (L645) with no rule on pairing them.
10. **L171 (also L529 E65), MISSING, R2. When a landing would leave the shared view, the path never folds.** Research: "When the next
    landing would leave the view both orientations share, insert a switchback vine, a bounce mushroom or a lift." Spec: both views
    appear only for clutter and stills (L313, L373). Folding is one of the few mechanisms that would add vertical turns.

**PARTIAL rows that matter as much as the list above** (not ranked there because the spec covers part of each):
- **L116, L501 (E37), L655 (E191). Topology: the macro shape is barely covered.** The spec has only `arc` (rises / descends / level /
  wave, L1214) and high/low splits (L405-412). It has no loop-back, chimney or hub-and-spoke, and every stage runs right. Research L48:
  "the map's shape (a loop back, a high/low split, a chimney, a hub with spokes), which changes the direction you travel and what the
  camera does". The ledger (L420) calls topology "the bigger buy" over the deck.
- **L705 (E241). Similarity is capped only between neighbours.** "≤ 42% max pairwise, < 32% world mean". The spec's only caps are
  "neighbouring stages share no more than half" (L41, L133) and the neighbour feel check (L1042-1044). Stage s against s+2, and one world
  against another, are never compared.
- **L504 (E40), L618 (E154). The pattern lockout is 1 draw where the research has 4.** "locked out for M = 4 draws". Spec: "no idea
  twice in a row" (L241, L391). Only n8 looks back two nodes (L439).
- **L213. No minimum piece count per world.** The research quotes "at least 14 distinct section types per world" and "12+" templates.
  The spec counts 14 for World 1 only (L208) and sets no floor for Worlds 2-10.

## (b) Where the spec says it follows a source and the research says otherwise

1. **The new-world ease-in.** Spec L631-632: "Each new world's first stage starts at the previous world's middle, not its end. That is
   STAGE-RULES §1b's rule that a new world eases in." Research L228-232 quotes SR §1b: "no stage may leave its world's band ... Bands
   may overlap their neighbours a little, never by a whole world". It also quotes the code: bandFor, with stage 1 "just under the last
   of the world before". Under the spec's d, each world's band covers half of each neighbour's (W2 is 0.09-0.27, W3 is 0.18-0.36). W2-9
   equals W4-1 exactly (0.273). Neither "a little" overlap nor "just under the last" holds. The spec also drops STAGE_HEAT without
   saying so.
2. **Where the beat comes from.** Spec L1120: "Rhythm: the player's rhythm, not the song (Matt, 11-04; DESIGNER.md §13.3, PLAN.md)."
   Research L204-205 (W1P, also Matt's era): "The player hears each stage's own music, so the beat the moves fall on IS that music's
   beat ... Never type a stage's BPM". Research L411-413 says "The W1 plan's rule stands: read the beat from the music". Both cite Matt
   on 11-04, and they disagree. Matt or the lead must rule. Until then every beat-based row (beat-timed hazards, the on-the-beat share,
   the frame-harmonic tempo) has no clear home.
3. **Normal density.** Spec L801: "0.80 against main's 0.57 is accepted as provisional (§0 row 2: the band is not calibrated)." Research
   L221-223 quotes SR §2: "0.75-1.15 actions/s Normal". Under that band 0.80 is a pass, not a provisional exception, and main's 0.57
   would fail. The spec judges Normal against main, not against the written band.
4. **Checked and in agreement:** "the plan's 5-20 s groups" (spec L509) matches SR §0b.1 "5, 10, 15 or 20 s" (research L225). The
   Normal pad of 1.0-1.2 s (spec L799) matches SR §2 (research L226). Not checked here: L1589 "the research's rules, adopted" (its
   source is GEMINI-VARIETY, not this file), and L109 "R3 F10" and L505 "R3 W2" (other files).

## (c) Spec numbers that a row in this file answers directly

| Spec line | Spec value | Research line | Research value |
|---|---|---|---|
| L37, L1152 | Normal flat jump "180 px" (PLAN.md 157-185) | L24 | measured `reachJump(0,false)` = 174.7 px |
| L646, L227-228 | crumble Normal 0.9→0.5 s, Easy 1.2→0.8 s; CP2 Normal crumbleAfter 0.7 s, Easy 1.0 s | L319 (F55) | Gemini Easy 1.2 s, Normal 0.67 s; ours (SR §0b.4) creaking limbs ~0.6 s |
| L642, L796 | landing p50 Normal 220→110 px, Easy 260→150 px (Easy ~300 px later), floor 90 | L289 (F25), L569 | 154-308 px (3.5-7.0 × Pokey's 44 px); our floor MIN_LEDGE 90 |
| L640 | gap share Normal 0.55→0.92, Easy 0.45→0.80 *of the level check's limit* | L283-286 (F19, F20, F22) | safe reach Easy 0.62 (ours 0.50-0.53), Normal 0.78 (ours 0.72-0.74) *of R_max*; gen2 margins 0.65 / 0.82; single-jump share Easy 0.25-0.55, Normal 0.35-0.75 of R_1. The bases differ, so the values are not directly comparable. The spec's Normal top (0.92) is above every margin quoted. |
| L645 | taught animals per stage 0-1 → 4-5 Normal, 0-1 → 3 Easy | L293 (F29) | ~12 → 25 a stage Normal, ~8 → 15 Easy (Gemini). The spec may count kinds, not individuals; it does not say. |
| L631-633 | the drop at a new world's first stage = 0.091 (half of a world's 0.18 climb) | L309 (F45) | Gemini 0.20; our bandFor "about 2.4 D units of a 9-unit band" (~0.27 of a band) |
| L462, L360 | marks goal 10/13 = 77% Normal, 8/13 = 62% Easy (was 85% / 65%) | L297 (F33), L247 | Gemini 75%; goals.ts 0.875; 1-2 at 0.6 |
| L826-829 | every route passes all 13 marks (100% on one pass) | L298 (F34) | 85% met on one pass |
| L508; L801 | Easy 0.35-0.55; Normal 0.80 accepted (main 0.57) | L277 (F13), L221-223 | Gemini Easy 0.35-0.85, Normal 0.50-1.35; ours Normal 0.75-1.15 |
| L510 | dead time ≤ 2.5 s | L323 (F59), L518, L707 | 2.5 s (core.ts, Gemini auto-heal); Gemini's own target "≤ 2.2 s max rest" |
| L799, L503, L752 | rest pads: Normal 1.0-1.2 s, Easy 2-3 s, Easy rests 4-5 s | L268 (F4) | Gemini rests 1.5-2.2 s; ours 1.0 / 2.0 s |
| L333; L664 | 1-5 target ~150 s; floor 2:00, no cap | L266 (F2) | skilled 120-150 s; first-timer 180-300 s |
| L339-351, L1063 | 11 nodes a stage | L265 (F1) | 6-8 nodes |
| L390, L648; L241 | 2-3 bursts a node; no repeat in a row (lockout 1) | L504 (E40) | 2-4 patterns a node; lockout 4 draws |
| L219, L313 | boa run-up of one screen's width (400 px upright, 1,100 px sideways) | L296 (F32), L244 | 1.0 s ≈ 285 px (Gemini); validator 150 px |
| L41, L133 | neighbours share at most half their ideas or pieces | L303 (F39), L705 | Gemini ≤ 42% (world mean < 32%); our checker 0.45 neighbour / 0.55 any earlier |
