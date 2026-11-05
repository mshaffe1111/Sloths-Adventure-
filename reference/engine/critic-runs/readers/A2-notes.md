# A2 notes: LEDGER-2026-11-04-part1.md against ENGINE-SPEC.md (engine-spec 7f4373c)

Rows: 242. Engine-relevant 136, not 106. Used 29, partial 60, missing 40, contradicted 7, n/a 106.
Most n/a rows are boss fights (lines 417-459, 78, 160, 211-212), player physics/input (169, 184, 221, 388-414) and renderer (300, 377-380).
The spec doesn't cover bosses at all except "lairs kept as built" (L1497-1506).

## (a) The 10 most important MISSING or CONTRADICTED rows, ranked by how much they fight repetition across the whole game

1. **Map shapes / topology: 315, 316, 318** (18 and 313 are PARTIAL). Research (ledger 19-21): "the generator must first randomize the shape
   of the level's Node Graph before placing a single platform"; "over-under loop-back, parallel high/low split, zig-zag chimney,
   lock-and-key spoke". The spec only has `arc` (rises / descends / level / wave, L1214) and a trend per stage (L944). Every stage in all
   ten worlds is still a forward run with forks. No stage reverses direction or runs as a vertical chimney or a spoke. The variety
   gate counts pieces and ideas, so two stages with different pieces on the same hallway both pass.
2. **Puzzle blueprints that roll: 52, 343, 334, 345, 346.** Research (ledger 53-56): "a library of 15 to 20 Parameterized Puzzle
   Blueprints where the logic graph is valid, but the spatial layout, order of operations, and physical parameters randomize". In the
   spec, puzzles appear only as a push block "wrapped as a puzzle room" (L376-377, L566) and as ideas on Matt's small-builds list
   (L157, L162, L204). Every world's rooms stay pinned to one stage and are the same on every roll. Nothing mirrors them, changes their
   step order or rolls their ratios.
3. **Replay variety: 205, 207, 308, 367, 368, 369.** Research (ledger 205, 207): "Every time the player selects or replays the stage, a
   new PRNG... seed is rolled"; "exclude the previous run's Macro Topology" and be "at least 45%" different. The spec judges 16 rolls
   offline (L261, L395) but never says when a player gets a new roll, and never compares a roll with the one just played. "Never the
   same burst twice" (L392) applies only inside one stage.
4. **Special stages for W2 and W3: 473, 474** (65, 214, 241, 471 are PARTIAL). Research (ledger 66-67): "every World has one bespoke X-S
   Special Stage... temporary 'Special Moves'... that use your exact same touch buttons in a new way". The spec's column (L1498-1499)
   counts 2-3/2-8 cages and 3-6/3-7 searches as specials. Those are stage types, not new uses of the buttons. Two whole worlds keep no
   change of feel, and no special in any world is tested for whether the buttons change job.
5. **New sloth verbs: 100, 470, 464** (460 and 467 PARTIAL). Research (ledger 102-105): camouflage "so patrolling Night Hunters... pass
   right over him", the belly slide "on steep mud banks (World 2), wet mossy chutes (World 4), or ash slopes (World 9)", and walking under
   thorn-topped branches. The move list (L1278-1299) and ladder (L1533-1548) add none of these. The ladder only makes old moves come
   back more often; it adds no new verb to make later worlds feel different.
6. **Hazards on the avoided line: 43, 341.** Research (ledger 44-45): "Wherever the timeline says Duck or Short-Hop, the generator places
   a hazard... along the alternate trajectory that Ghost Pokey avoided!" The spec places hazards only by element and taught list
   (L1221, L1550-1561), and by clutter caps (L315). Nothing makes the plain hold-right line run into the hazard. In every world a hazard
   can be skipped, so it doesn't change how a stage plays (Matt's "you can outrun them every time").
7. **Search rooms that reassign: 115, 349, 350.** Research (ledger 116-118): "On each run, the N real items are assigned to a different
   subset of alcoves (with subtle environmental tells...)". The spec keeps the searches "as built" (L1499, L1503). There are six
   relic-hunt stages (3-6, 3-7, 5-6, 7-3, 7-7, 9-8), and each one is solved once and then played from memory.
8. **The rest rhythm: 210 (CONTRADICTED L503) and 393.** Research (C6, ledger 210): "forbidden from placing [T] -> [T]... Node 3 must
   roll [R], [F], or [P]"; the ledger warns that "a rest after every group makes every stage the same stop-go". The spec gives Easy "a
   breather pad of 2-3 s between every node" (L503). It has no rule against two hard nodes in a row: 1-5 lays n6 test then n7 twist
   (L346-347). The every-node breather is copied to every stage on Easy (L1085).
9. **7-S bell hall as a World 7 piece: 478.** Research (ledger 479): "invisible platforms; hitting a bell sends a ring that makes them
   solid for 4 s, on a beat"; the ledger says "adopt as a piece in World 7". The library has no timed-solid platform kind. W7's row
   gives it no move of its own (L1503: "—").
10. **Tempo tied to the world: 275 (CONTRADICTED L1120)** (31 and 335 PARTIAL). Research (ledger 32): "picks a tempo (BPM, e.g., 90 BPM
    for relaxed World 2 stages, 130 BPM for urgent World 5/8 stages) and a duration (8 to 14 seconds)". The spec has "the player's
    rhythm, not the song" (L1120) and pace words (L1218). The mixer reads tempo only as calm/steady/brisk, which sets the longest-run
    limit (mix `src/game/mixer/spec.ts:24,107`). So nothing makes a World 2 stage feel different in time from a World 8 stage.

## (b) Where the spec claims a source and this research says something different

- **Swimming "built" and "fast".** Spec L1585: "(GEMINI-VARIETY row "Water", R-5.22; swimming is built, 87f1e2f6)". L1592: "no slow
  drag: Pokey is fast in water (Matt's "suddenly fast")". Research ledger L264 (fact 14): "Swimming is slow, not fast... Ours is about
  half a run (`src/game/swim.ts:34-35`, 150 vs 285 px/s)"; C15 L219: "R-5.22 should change SWIM.speed (at least run speed)". Checked
  in /home/user/mix: `swim.ts:34-35` still reads "about half a run, so the water feels like water", `speed: 150`. The commit the spec
  cites, 87f1e2f6, is the one that set "swim at about half a run". The spec treats as built something its own source says is slow.
  No gate or task changes the speed.
- **Rhythm attributed to 11-04.** Spec L1120: "Rhythm: the player's rhythm, not the song (Matt, 11-04; DESIGNER.md §13.3, PLAN.md)".
  Matt's 11-04 research, as this ledger reads it (L31-41), asks for a BPM per world and 8-14 s rhythm groups placed on the beat. The
  ledger proposes tying that to the music BPM bands already in `styles.ts`. The spec keeps only named patterns (L1121), with no tempo
  number.
- **Special stages "kept as built".** Spec L1495-1506 gives W2 "2-3 and 2-8 cages", W3 "3-6 and 3-7 searches" and W8 only "8-10 lair".
  Ledger L241 (fact 6): seven specials exist: 1-8, 4-7, 4-D, 5-M, 6-8, 7-4, 8-4, plus Thornbark's Hollow. "Only Worlds 2 and 3 have
  none" (L73). The spec's column leaves out 4-D, 6-8 (named only as "hand-built Stilt Climb", L1606), 8-4 Lantern Run and the secret
  stage. A column meant to protect existing stages leaves out some of them.
- **Puzzle and search stages "kept as built" vs the research's rolled blueprints.** Spec L1462: "every world keeps its stages, names,
  special stages, rooms...". Research (ledger 52-63, 115-123) says rooms and searches should roll per seed. Matt's direction is to
  build on what works, but this keeps the parts the research singles out as repeating.

## (c) Spec numbers that a research row answers directly

| Spec line | Spec value | Research row | Research value | Note |
|---|---|---|---|---|
| L640-641 | Normal gaps 0.55→0.92 and rises 0.50→0.95 of the gate's limit; Easy gaps up to 0.80 | 416 (#118, ledger 265-269) | reach exit and collectibles "within a 15% safety margin" (at most 0.85); ledger: gen2 at most 82% Normal, 65% Easy | Over 0.85 from d ≈ 0.81 (9-5 on). Spec Easy at d=1 (0.80) is far over gen2's 65% |
| L510 | no dead time over 2.5 s | 125, 370 (ledger 100) | ">2.5 seconds of flat... walking" | Same number; the research's auto-inject fix is dropped |
| L883 | canopy-end rest 520-560 px flat | 141, 325 (ledger 36) | rest node "400-600 px wide" | Inside the research's band |
| L799 | Normal pad 1.0-1.2 s after every second burst | 216 (C12) | small pads between groups stay short; the wide one is the mid rest | Matches the ledger's adapt |
| L509 | "the plan's 5-20 s groups"; no Easy run over 20 s | 335 (#37, ledger 52), 391 (#93) | rhythm groups 8 to 14 s; nodes 10-15 s | Spec band is wider at both ends |
| L41, L235 | neighbours share at most half their pieces/ideas | 208 (C4), 369 (#71) | at least 45% different (stage vs stage and vs last run) | Spec meets it for neighbours only; not against the last run |
| L664, L1077 | 2:00 floor; 11 nodes; 1-1 at 2:40-3:15 | 209 (C5, ledger 31, 172) | 6-8 nodes of 10-15 s (60-120 s) | Ledger: keep ours, needs 10-16 nodes; spec uses 11 |
| L300, L426 | replay back to the fall at most about 45 s; flags at most 4,000 px apart | 331 (#33, ledger 44) | "sub-1-second node respawns" on the node's own safe ledge | Different measures; spec has no respawn time |
| L278-279 | the join is "a short piece of the same kit", no width | 328, 375 (ledger 41, 113) | flat hazard-free ledge "at least 200 px" / 250 px apron | Spec gives no number |
| L1590 | at most 15-20 s under before a surface or exit | 466 (#168) | "no oxygen timer, relief zones" | Compatible: a design cap, not a breath meter |
| L1592 | "fast in water", no number | 465 (#167, C15) | swim about 3x walk; at least run speed (285 px/s) | Code is 150 px/s |
| L647 | vine/moving windows Normal ×1.0→×0.75, Easy ×1.15→×0.9 | 220 (C16), 463 | keep let-go help on Easy, narrow on Normal from World 3 | Spec narrows both settings with d; consistent |
