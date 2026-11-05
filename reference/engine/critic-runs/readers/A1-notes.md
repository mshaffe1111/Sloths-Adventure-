# A1 notes: LEDGER-2026-11-02-full.md, GEMINI-VARIETY-2026-11-02.md, MATT-RESEARCH-2026-11-04.md against ENGINE-SPEC.md (7f4373c)

217 rows: ledger 198, Gemini triage 10, Matt research 9. Spec read L1-1635 in full.
Counts: used 30, partial 76, missing 39, contradicted 9, n/a 63.

## (a) The 10 most important MISSING or CONTRADICTED rows, ranked (repetition across the whole game)

1. **No tempo polarity per world.** LEDGER:109, :276. The research's matrix has a "Wind & Slow-Down Polarity" column per world;
   "Worlds swing between urgency and patience; 'doubles the functional variety'". Why it matters: the spec's world table (L1495-1506)
   gives each world moves, hazards and special stages, never a hurry-or-patience identity. With one shared library (L122-133), worlds
   that share pieces will play at the same tempo. This is the cheapest lever for "every world feels the same".
2. **No hurry and patience version of each mechanic.** LEDGER:273 ("every modifier has a hurry and a patience version, both weighted
   equally"), with :395 (glowworms "light safe footing only while he stands still") and :310. The spec's move ladder (L1280-1299)
   and hazard list (L1302) leave out the game's one shipped patience mechanic. So the ladder's "must keep returning" gates
   (L1533-1548, L1615) can never bring it back, and every returning move comes back in its hurry form only.
3. **No moving pressure in X-8.** LEDGER:124, :360 (X-8 "Rising Hazard / Autoscroll Pressure", "High density (15-20 s groups);
   layers 3+ mechanics"). The spec keeps 1-8's chase and 2-8 "as built" (L1497-1498) and says nothing for worlds 3-10. Giving
   each world a pressure stage made from pieces it already has adds a stage kind that no other stage in the world has.
4. **No slow ground that sends him up to a high road.** LEDGER:116, :290, :291 ("differentiating surface-contact slow-downs from
   volumetric slow-downs"; a wading field forces "the player to seek elevated stilt roots or aerial vines"). The spec's forks
   (L344, L405-412, L1069) are about height only and never give a reason that changes from world to world. Slow ground would
   give W2, W5, W6 and W9 a fork of their own.
5. **No slot roles X-3, X-4, X-6.** LEDGER:355, :356, :358 ("X-6 change of pace, a sense flipped... low tempo"); also :62 (miss 5:
   "a 10-stage World will feel repetitive if all nine platforming levels share the same rhythmic tempo, camera vector, and cognitive
   load"). The profile has a pace word (L1218) and the feel check compares neighbours (L1042-1044). But nothing gives each slot a
   job, so the nine stages of a world can all be the same kind of run.
6. **No mechanical job per act.** LEDGER:136, :369 ("a macro-level Kishotenketsu arc divided across three distinct narrative and
   mechanical Acts"). The dial is one straight line, d = (0.1(w-1) + 0.2(s-1)/8)/1.1 (L628). Later worlds get harder in numbers,
   not in kind.
7. **No twist templates, and no pieces for the unbuilt pairs.** LEDGER:167, :340, :315, :318 (e.g. "wind gusts alter the resting
   angle and period of hanging vines"; bail from a breaking branch onto a vine). These are new beats from zones and pieces that
   already exist, and they could recur in every tree world. The spec's idea lists (L154-172, L536-545) have none of them.
8. **The finale ends in a cool-down (CONTRADICTED).** LEDGER:78, :204, :343. Research: Cell 4 "delivers a 15 to 20-second
   high-density rhythm group... culminating at the stage flag or exit... ending with a rapid conclusion". The spec ends every plan
   with a cool-down node after the master node (L351, L1075). The validator already allows a 20 s finale (FINALE_TIGHT_MAX 20,
   /home/user/mix/tools/validate/core.ts:309). Every stage ending in the same walk-out is itself a repeat.
9. **Checkpoints stay fixed as the game gets harder (CONTRADICTED).** LEDGER:429 ("More layering in Acts II-III needs tighter
   checkpoint spacing") and :431 ("back at the hard part within 2 s"). The spec says the placement rules "never move with d"
   (L650-653), keeps the 4,000 px window (L426) and allows 45 s to the hard node (L300, L303). Later worlds will feel like
   long replays rather than new challenges.
10. **No boss preview in X-9.** LEDGER:130, :361 (X-9 "foreshadows Guardian attack patterns"). Every X-9 is an animal gauntlet. Ten
    stages could each get an identity of their own from their boss's tell.

Also worth a look: MATT-RESEARCH:17. World mutators (W3 noise wakes the Prowler, W5 fake rest spots, W6 camera tightens) would be
R5 for whole-world sameness, but the spec does not have them (PARTIAL only through fast swim and hidden roads). GEMINI-VARIETY:15:
the 25-30% puzzle-beat target is not taken, and 1-5's one puzzle node lost its push block (L375-377).

## (b) Where the spec cites research but the research says something different

- **Swim exits.** Spec L1585 cites "GEMINI-VARIETY row 'Water'", and L1589-1592 says "(the research's rules, adopted)... wide, clear
  exits, at least 3-4 body widths of bank or a ramp out". The cited row, GEMINI-VARIETY:19, says only "wide clear exits", with
  no number. The 3-4 body widths are in GEMINI-VARIETY:28, under section 5 (mission graph): "standard connectors with 3-4
  body-width landing aprons". That is a rule for joins between chunks, not for water. So the number is attributed to the wrong
  rule. Meanwhile the spec's own joins (L279: "a short piece of the same kit, sized to the next idea's first move") carry no
  apron size. MATT-RESEARCH:10 asks for "200-250 px flat aprons between nodes".
- **Group length.** Spec L509: "no Easy run over 20 s without a 2-second rest (the plan's 5-20 s groups)". The research's groups
  (LEDGER:329 "Rhythm groups of 5, 10, 15 or 20 s"; :330 "a rest with no hard input between every two") cap groups at 20 s on
  both settings. The spec applies the 20 s cap to Easy only. On Normal it allows up to main's 29 s (L799-800), and it puts a pad
  only "after every second burst" (L799).
- **"Swim beats are quick in-and-out (the research's rules, adopted): at most 15-20 s under" (L1590-1591).** This matches
  GEMINI-VARIETY:19 "in-and-out every 15-20 s". Its gate "fails over 20 s" (L1596) is consistent. Listed here only to show that
  the rest of that block was checked.
- Other citations in the spec (R3 F10 at L109, R3 W2 at L505, Shovel Knight at L502, DESIGNER §2.3 at L644) point to sources
  outside my three files and are not judged here.

## (c) Numbers in the spec that a research row answers directly

| Spec line | Spec value | Research line | Research value |
|---|---|---|---|
| L300, L303 | replay to the next hard node at most about 45 s | LEDGER:431 (and :144) | back at the hard part within 2 s |
| L426 | flags at most 4,000 px apart, fixed; L650-653 placement never moves with d | LEDGER:429 | tighter spacing in Acts II-III |
| L646 | crumble delay Normal 0.9 to 0.5 s, Easy 1.2 to 0.8 s | LEDGER:286, :287 | snap twig about 0.15 s; creaking limb about 0.60 s |
| L227 | crumbleAfter 0.7 s; Easy tile 1.0 s | LEDGER:287 | creaking limb about 0.60 s |
| L799 | Normal pad 1.0-1.2 s after every second burst | LEDGER:330 | a rest between every two groups |
| L800, L815 | Normal longest run without rest at most 29 s; Easy at most 20 s | LEDGER:329 | groups of 5-20 s |
| L510 | no dead time over 2.5 s | MATT-RESEARCH:9 | "no >2.5 s dead walks" (agrees) |
| L665 | no length cap; over 5 minutes fine | LEDGER:332 | every stage under 5 minutes |
| L1591, L1596 | at most 15-20 s under; fail over 20 s | GEMINI-VARIETY:19 | in-and-out every 15-20 s (agrees) |
| L1592 | exits at least 3-4 body widths | GEMINI-VARIETY:28 | 3-4 body-width landing aprons (for connectors, not water) |
| L279 | join piece "sized to the next idea's first move" (no number) | MATT-RESEARCH:10 | 200-250 px flat aprons between nodes |
| L41, L235 | neighbours share at most half their pieces or ideas | MATT-RESEARCH:9 | at least 45% different from last time (a roll against the last roll, not neighbours) |
| L315 | at most 2 kinds of hazard or animal per phone view | MATT-RESEARCH:23-24 | 1-3 enemies on screen with roles; about 35% of nodes enemy-free; none within 150 px of a landing |
| L219 | boa: "a clear rear-up tell" (no time) | MATT-RESEARCH:21 | one trick each with a 0.5 s warning |
| L341-342, L652 | warm-up and teach at miss chance 0.01 or less | LEDGER:333 | part 1: 5-10 s low-density groups (no number in the spec) |
