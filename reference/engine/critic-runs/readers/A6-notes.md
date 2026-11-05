# A6 notes: R1-shipped-pipelines.md + R2-academic-pcg.md against ENGINE-SPEC.md (engine-spec 7f4373c)

Read: all 1,635 spec lines, both research files in full. Code checked: /home/user/mix @ 7d9ad9a9 (origin/engine-mixer).
Counts: 83 rows (R1 44, R2 39). Used 15, PARTIAL 32, MISSING 9, CONTRADICTED 3, n/a 24.

## (a) The 10 most important MISSING / CONTRADICTED rows, ranked for repetition across the whole game

1. **R1:39, CONTRADICTED by spec L237.** Research: SMBF "We keep track to avoid duplicates so you can play through the game several
   times and not see duplicate chunks"; Shovel Knight "You can't show the same magic trick twice!" Spec L237: "'No idea twice' is
   withdrawn", with only "no idea twice in a row" (L241) and "no idea over ... about 40%" (L242). Why: the owner's complaint is
   repetition. Under the spec an idea may fill 40% of a stage, and across 90+ stages no rule stops the same ideas cycling. The ruling
   rests on one stage (the old 1-1's 3-idea cycle). R1 measured that this is how gen2 Worlds 5-8 got repetitive (355/368 rolls).
2. **R1:514, MISSING.** "A save-wide ledger of shown units ... a unit seen anywhere in this save is out of the bag until the world's
   pool is spent." Spec cross-stage memory is only "neighbouring stages share no more than half" (L41, L133) and the 1-1 vs 1-5 rule
   (L989). Stages 2 apart can match fully. Nothing in src/game/mixer or tools/engine keeps one (grep: no ledger, no cooldown).
3. **R2:707, CONTRADICTED by L1120.** "a node's bars can be *selected* from the onsets of the bars the music will actually play ...
   would give each stage a rhythm that differs because its tune differs." Spec L1120: "Rhythm: the player's rhythm, not the song
   (Matt, 11-04)". This is a decision by Matt, not an oversight. It does give up a free source of difference between stages, because
   each stage has its own tune. R1:572 backs the spec (Nintendo dropped rhythm as the frame).
4. **R2:671, MISSING.** "Measure the space, not just the rolls ... It tells a builder *before rolling* whether a node can be varied at
   all." The spec checks 16 finished rolls (L261, L395). It never asks whether a deck plus its size bands can produce different
   rolls. In every later world that is the first sign that a world's kit is too thin.
5. **R1:95, CONTRADICTED by L1090-1091.** Tezuka: "The basic stage known as 1-1 was actually something we came up with at the very
   end"; Yacht Club "loop back around to revisit earlier areas". Spec: 1-1 is built second, right after 1-5, and "1-2 to 1-4 wait for
   his OK on 1-1". Also the old 1-1 is a permanent bar (L1092). With no re-grade, stages built early in each world keep the weaker
   variety of the mixer as it stood then.
6. **R2:536, MISSING.** "A search earns its keep only when the constraints get tight, which is exactly what the engine will add:
   pinned moments, a target rise or fall per node ... and kind quotas ... Then random retry's acceptance collapses." The spec adds
   exactly those: kind or size change every 2 pieces, "4 of every 5 landings step up or down" (L393-394), band per node (L1214),
   per-stage caps (L1225), and "never a reroll" (L259). It never says how a roll meets all of them. The likely outcome is narrower
   decks, which means more repeats.
7. **R1:548, MISSING.** SMBF critics: "you can get stuck with an extremely difficult section only to get another one that's a
   cakewalk". Joins are sized to the next idea's first move (L278-279), but difficulty is never compared between neighbouring
   bursts, and nothing in the spec carries a per-idea rating to compare.
8. **R1:524, MISSING.** DKCR's grade board ("trying them over and over until they all had a ◎"), and Cliff going from "the most fun"
   to "the least fun". The spec has a regression lock (L1464) and a known list that only shrinks (L1619), but no re-grade of earlier
   stages after the bar rises.
9. **R2:680, MISSING.** Tanagra: "the value of a variable should be the same as the last time the solver was run. These constraints
   are then relaxed if no solution can be found." The spec's regression lock and fingerprints (L1345, L1464) freeze whole rolls. They
   do not keep the other nodes stable when one node is edited. This bears on cost more than on repetition.
10. **R2:527, MISSING.** "*sample uniformly* from the valid space (count-weighted descent) ... removes `fitSteps`' measured climb
    bias and its lower spread." The shuffle bag at L249-250 spreads sizes, but it does not sample count-weighted. Low impact.
(Also MISSING, low: R1:546 no re-roll on death, already in game code `layoutMemory.ts`; R2:704 seed the search, but there is no
search to seed.)

PARTIAL rows that matter almost as much (the gap in each is a whole-game fix):
- R2:694, compression distance across a world. The spec has neighbour share (L41) and a neighbour feel check (L1042-1044) only.
  R2 calls the world-wide check "a one-line 'do these feel like one stage played six times?' check".
- R2:663 / R2:72, limited-agent teach gate. Spec L311-312 uses it for collectibles only (see (b)).
- R1:48, pool to slot ratio. See (c).

## (b) Where the spec claims a source and the research says something else

1. **Shovel Knight's ramp-and-cool.** Spec L501-502: "The stage then breathes before its creek and its master fork, as Shovel
   Knight's ramp-and-cool asks." That is one added rest node (n7b). Research R1:62-63 and R1:348 say the ramp and cool happens at
   every scale: "the last part of each room is harder than the first part... each set of rooms is more challenging than the last
   set... Every moment of gameplay, big or small, is ramping up then cooling down, cyclically." The spec's dial is one linear d per
   stage (L628, L635), with no cadence inside a node or a burst.
2. **"Length from units, never from filling a clock."** Spec L669: "Length still comes from units, never from filling a clock".
   STAGE-RULES §0c.1, which R1:54-55 quotes, says the same. But spec L383: "11 nodes of one idea each come out either too short
   (88-101 s against 120 s) or, stretched, as long runs of one piece". The fix at L390 lays "2-3 short bursts of 4-6 pieces each,
   drawn from its deck", and decks hold 2-3 ideas. So the clock floor set the burst count, and ideas repeat to fill it. L1181 does
   the same for 1-1 ("Length comes from more ground bursts (3 a node in n2-n7)"). R1:550-552: "SMBF fixed the count of units per
   level (8) and Shovel Knight the rooms (about 26); the time follows from the units."
3. **The limited-agent bot.** Spec L311-312: "That uses the limited-agent bot: the bot without the move can't reach it." R2:667-668:
   the validator has only one limited agent, `noHide`, and "nothing in tools/ or src/ uses `noHide` as a must-fail gate today".
   There is none in mixer code @7d9ad9a9 either (grep 'limited|noHide' in src/game/mixer and tools/engine: no hits). The spec relies
   on a tool that does not exist for any move but hide.
4. **R1-R4 named as inputs (spec L7), but L237 overturns R1's top two lessons without citing them.** L237 withdraws "No idea twice"
   on the old 1-1 alone. R1:39-46 is the research's "most direct, code-proven cause of sameness".

## (c) Spec numbers that a research row in my files answers directly

| Spec line, value | Research line, value |
|---|---|
| L41/L133: neighbours share ≤ 50% of pieces or ideas | R1:39 SMBF: 0 duplicate chunks across a save; R1:188-189 STAGE-RULES §0c.4: a template in ≤ 3 of a world's stages |
| L242: one idea ≤ about 40% of a stage | R1:42 STAGE-RULES §0c.2 "no template more than twice in a stage"; SMBF never twice |
| L208-209 + L390: about 18 ideas for 11 nodes × 2-3 bursts (22-33 slots), about 0.55-0.8:1 | R1:58 "the floor is 1:1 with no repeats, SMBF's is about 10:1" |
| L514: 9-11 distinct ideas a roll | R1:285 SMBF: 8 chunks from 70-100 per level |
| L667: neighbouring stages differ ≥ 20% in length | R1:334-335 Shovel Knight: about 26 rooms each, "A consistent length means that every stage will take a similar amount of time" |
| L297, L426: a flag only before a hard node, ≤ 4,000 px apart | R1:294 SMBF: "A checkpoint after every chunk" |
| L114: at most one new move or idea a stage | R1:297 SMBF "at least one new mechanic is introduced in almost every single light world level"; R1:336 SK "about 5 enemies and 5 objects planned" |
| L261, L395: every line judged on 16 rolls | R2:169 Launchpad ERA on 10,000 levels; R2:290 Horn et al. 1,000 each; R2:204 Tanagra 500 |
| L628-632: d rises 0.18 a world, and each world starts at the previous world's middle (a sawtooth) | R2:80-82 Sorenson & Pasquier: a periodic curve is "much more regular than ... Super Mario Bros." with no late peak (that finding is about curves inside a level; across worlds it is my inference) |

## (d) Primary-source checks (origin/engine-design:reference/engine/designer-sources/)

1. **Launchpad TCIAIG 2011** (`users-soe-ucsc-edu-ejw-papers-Smith-Launchpad-TCIAIG-2011-pdf.txt`). Found verbatim:
   - "Launchpad can guarantee level playability by creating locally playable components and connecting them with safe walking areas"
     (R2:48);
   - "if the design criteria became more sophisticated, for example by allowing a designer to specify the kinds of geometry in
     particular regions of a level, then a search-based stitching together of rhythm groups may become more appropriate" (R2:66);
   - "The linearity bias is an unintended side effect", "upward staircase pattern" and "a larger number of stompers than expected"
     (R2:175-183).

   **Not in this file:** "14 different kinds of geometry for jumps". R2:38 credits that line to Smith et al. 2009 §8.2 (FDG 2009),
   which is not saved, so it cannot be checked here. R2:524 and R2:644 restate it as "Launchpad's grammar offers 14 jump kinds" and
   "Launchpad had 14 + 5". The TCIAIG text supports neither, so the ranking's headline number rests on an unsaved source.
2. **Tanagra FDG 2010** (`users-soe-ucsc-edu-ejw-papers-smith-tanagra-fdg2010-pdf.txt`). Found verbatim:
   - "We have found it useful to keep separate the choice of a geometry pattern (using ABL) from the instantiation of that pattern
     (using Choco)" (R2:57);
   - the backtracking order "1. Relaxing absolute positioning constraints on other geometry" (R2:59);
   - "the value of a variable should be the same as the last time the solver was run. These constraints are then relaxed if no
     solution can be found" (R2:89, R2:680);
   - "stops itself from searching after 500 milliseconds" (R2:200);
   - "Making a change to a small section of a level, such as moving a single platform, can have a wide impact" (R2:88).
3. Spelunky (Kazemi part 2, `tinysubversions-com-spelunkyGen2-.txt`). "Each room type has typically 8 to 16 templates" (R1:228) is
   there.
4. **SMBF "We keep track to avoid duplicates"** (R1:39, behind ranks 1-2 above): **not checkable.** No saved primary source holds it.
   The designer-sources README lists the gamingbolt SMBF page as "returned inline (not saved)", and the quote appears only in
   secondary copies (DESIGNER.md:413 on engine-design, and R1 itself).
