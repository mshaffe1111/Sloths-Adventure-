# A3 notes: LEDGER-2026-11-04-part2.md against ENGINE-SPEC.md (engine-spec 7f4373c, all 1,635 lines read)

Rows: 242 (section 1 items 1-32, section 2 C1-C18, section 3 F1-F27, section 4 ledger rows 1-165).
Counts: used 20, partial 77, missing 76, contradicted 12, n/a 57.

## (a) The 10 most important MISSING or CONTRADICTED rows, ranked

1. **L18 / L173 / L230 / L238: the same slot order in every world (CONTRADICTED L1462).** Research: "If every world uses the same
   10-stage template in the same order, players will subconsciously feel the formula by World 4"; ledger: "X-9 is a 'gauntlet' ... in
   all 10 worlds". Spec L1462: "every world keeps its stages, names, special stages, rooms, bosses and art". The engine's whole-game plan
   freezes the one pattern the research names as the top cause of game-wide sameness. Nothing in §A-§F checks slot roles across worlds.
2. **L27 / L231: world-wide mutators (MISSING).** "Give each world a macro rule that changes how the stage progression itself works, not
   just the obstacles inside the stages." The spec's world table (L1495-1506) gives each world an element, its own move and hazards, so
   worlds differ only in their parts list. Without a world rule, World 6 plays like World 2 with new art.
3. **L113 / L336: map shape (topology) per stage (PARTIAL, topology missing).** "Linear Wave, Over-Under Loopback, High/Low Parallel
   Split, Vertical Chimney, Hub-and-Spoke"; "By separating Macro-Topology ... from Micro-Rhythm ... Level 8 will never feel like
   Level 7." The spec's `arc` (L1214) only says rises/descends/level/wave, and the feel check (L1042) compares branching and density.
   Every stage is still a left-to-right line of nodes; across 90 stages that one shape is the sameness the owner feels.
4. **L59 / L187 / L236-237: cause and effect between stages (MISSING).** "Make an action in an early stage visibly alter a later stage
   in the same world." The spec has no saved-flag or cross-stage link anywhere. It is the research's second "Structural Breaker" (C15).
5. **L52 / L175 / L290 / L328: order-aware similarity over the last seven stages (PARTIAL).** "Compute the string distance
   [Levenshtein] ... higher than 55% ... compared against Levels N-1 through N-7." The spec compares only neighbours, by an unordered
   set of ideas (L41, L133: "share no more than half their ideas"). Two stages two apart can be identical and still pass.
6. **L47 / L289: no 3-4 move run from the stage before (PARTIAL).** "If the exact sequence [V ➔ B ➔ J] appeared in Level 7, the
   generator is forbidden from using that exact sequence in Level 8." The spec's gate counts pieces and ideas, never the move sequence,
   so the same moves in the same order can recur from stage to stage under different piece names.
7. **L43 / L330: same jump interval four times in a row (PARTIAL).** "Repeats the exact same jump interval four times in a row" fails
   a node. The spec varies piece size every 2 pieces (L393) and names rhythm patterns (L1121), but nothing measures time between moves.
   The research says this is the cheapest direct measure of "I can predict the sequence".
8. **L99 / L366 and L365: stillness and under-branch hanging (MISSING).** "stopping completely for 1.5 seconds triggers environmental
   changes ... within a 400-pixel radius"; under-branch hanging "doubles every branch". Neither is in the move table (L1280-1299).
   Both are moves that change how every existing piece is played in every tree world. That is variety without new art.
9. **L63 / L282-283: animals bound to piece kinds and in formations (PARTIAL, formations missing).** "Wide Flat Ledge (>300 px) → 1
   Armored Guard or Coiled Snake", "Chasm Gap (>250 px) → 1 Hovering Eagle or Vertical Snapper"; Solo Specialist / Stepping-Stone
   Chain / Triggered Swarm. The spec binds animals only to their element (L1564) and counts them per stage (L645). So animals don't
   change with the layout, and one animal plays the same way every time it shows up.
10. **L87 / L309: collectible roles rotated per world (PARTIAL).** "Give collectibles structural roles ... so they never repeat their
    hiding spot" (Flow, Branch-Switch, Patience). The spec has the branch-switch role (fork high road, L306, L434-438) but no flow or
    patience role, and nothing moves the finds, which sit at the same stage number in every world (F15, ledger L210). Across ten worlds,
    every find turns up in the same stage slot.

Also CONTRADICTED, but on purpose and with Matt's backing (not ranked): beat-lock to music (L34, L292, L338, L183 vs spec L1120 "the
player's rhythm, not the song"); a checkpoint at every node (L142, L181, L343 vs L296-300, L426); generate-and-test rerolls (L332 vs L259
"never a reroll").

## (b) Where the spec says it follows research or a source but the research says something different

- **Swimming "is built".** Spec L1585: "GEMINI-VARIETY row 'Water', R-5.22; swimming is built, 87f1e2f6", and L1592: "no slow drag:
  Pokey is fast in water (Matt's 'suddenly fast')". Research (ledger L164): "multiply maxHorizontalSpeed by 1.8 ... hydro-dash ... 1.4x
  normal jump height"; the ledger reports that the code does the opposite. Checked on engine-mixer 7d9ad9a9: `src/game/swim.ts:34-35`
  is still `speed: 150` with the comment "about half a run, so the water feels like water". The spec gives no swim-speed number, so its
  swim-beat gate (L1618) can pass a slow swim.
- **Special stages "kept as built".** Spec L1495-1506 lists each world's special stages. Ledger F25 (L220): "We have four kinds: 4-D,
  5-M, 7-4's perspective slide ... and 8-4's Lantern Run." The spec's W4 row (L1500) has no 4-D, and its W8 row (L1504) has no 8-4
  Lantern Run, so the "keep" promise leaves out two shipped stages.
- **"Golden seed".** Spec L328 and L371-373 use "golden seed" for a story glint that is out of reach on purpose. Research (ledger L252,
  idea L428-429): the "Golden Seed" is a *guaranteed reachable secret spoke on every roll*. The two meanings are opposite. Anyone reading
  the research could take the spec's seed for the research's idea.
- **The moving-platform teach** (spec L1294, L1439-1442) and **"Shovel Knight's ramp-and-cool"** (L502) cite other sources, outside
  this file. Nothing in part 2 contradicts them.

## (c) Numbers in the spec that a research row in this file answers directly

| Spec line | Spec value | Research row | Research value |
|---|---|---|---|
| L510 | "no dead time over 2.5 s" | L179 (C7), L329 (#100) | "over 2.5 seconds with zero inputs" fails: same number |
| L41, L133 | neighbours share at most half (50%) of their ideas | L175 (C3), L328 (#99) | over 55% structural similarity vs N-1..N-7 rejects (different measure, window 1 vs 7) |
| L261, L1097 | 16 of 16 rolls | L104 (item 15), L185 (C13), L363 (#134) | 100 consecutive seeds with zero repetition warnings |
| L296-300, L426 | flags before hard nodes, at most 4,000 px apart, replay up to about 45 s | L142 (item 25), L181 (C9), L343 (#114) | a checkpoint at every node's entrance, respawn under 0.8 s |
| L508, L802 | Easy 0.35-0.55 actions/s stage-wide; Normal 0.80 accepted | L297 (#68), L298 (#69) | node 1 0.4/s (1 per 2.5 s), node 2 0.83/s (1 per 1.2 s) |
| L315 | at most 2 kinds of hazard or animal per phone view | L277 (#48) | 1 to 3 active enemies on screen (a count, not kinds) |
| L643 | rests and teach steps hold 0 risky pieces | L275 (#46), L177 (C5) | at least 3 of 8 nodes have zero enemies; rests 100% sacred |
| L645 | taught animals per stage 0-1 → 4-5 (Normal) | L346 (#117) | platform-role spawning in 65% of nodes, 35% enemy-free |
| L339-351, L1063-1075 | 11-12 nodes a stage | L335 (#106), L198 (F3) | 6-8 nodes a stage |
| L1592 | "fast in water", no number | L164 (item 32), L368 (#139) | max speed x1.8, gravity -0.2 g, dash out at 1.4x jump height |
| L640, L651 | gaps at 0.55-0.92 of the check's limit; bot floors 70%/50%/85% | L333 (#104) | validate from 6-8 px inside the ledge (spec's margin is stronger) |
