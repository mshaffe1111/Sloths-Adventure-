# B14 REPORT: 1-4 "Up the Kapok" (t-b14). B14b (fresh, 12:13 PM ET) stopped at its context line, WIP pushed. Times from `date`.
**EXACT NEXT STEP (in order):** 1. The lead's difficulty call (12:29 PM ET): keep the TEACH beat at steady 3.6 s; beat 7 (under-fire)
pods down the push (fig) vines too; the hollow's quick beat 2.4 s with the design's 0.8-0.9 s safe windows, made by its columns' height
(taller columns, a longer fall 'on' in data: on = podOn(len) ~1.5-1.6 s => ~560-620 px at POD.speed 620), never by loosening a rule;
Normal pods a heart (already). Re-score (`npx tsx tools/difficulty/score.ts --stages 1-1,1-2,1-3,1-4 --seeds 1-6 --settings normal,easy
--detail`), tell the lead. 2. Bots: the stuck places below, one at a time (RealPlay probe first: level or bot?), then
`castBots --stage 1-4 --seeds 1-6 --setting both --par 6`, then 1-40. 3. Seed list once bots pass. 4. Stills upright + sideways, both
settings, and the testers' front still src/assets/ui/ctest-1-4.webp (880x425, like ctest-1-1.webp: Pokey two-handed in a field, a fig
bunch in view, real game, Normal; the lead 12:40). 5. Full Checks on the head. 6. R-165.192, then flyer + ants (art on t-art-1113).
HELD for the t-b15 merge (they need B15's own files): b14-hunks-2's engine hunk (drawSeedArt's new signature, B15's protoArt.ts) and
firsttimer-markclimb.patch (B15's new tools/inspect/markClimb.ts; its context also differs here). Both on origin/t-b15@c31ece1b.
## Done (B14b; evidence)
1. Pokey's painted two-hand climb wired (R-165.178, be0b28c4): `heroClips.ts climb2Pick` on any two-vine hold (climbPair > 0), 4 reaches a
   cycle (climbU), still hang when held 0.2 s; drawn at his own height (89.1, D41), width fitted to strands 70-90 apart. Test heroClips.test.ts.
2. B15's engine-sealed.patch applied (35f0cb7e) with its stagePlan `sealedLine` hunk taken identical (the patch does not compile without it).
3. FA's ff239695 merged; 1-4's gate boughs `sealed` (c05a0876); a gate field's foot runs one vine spacing (GATE_RUN 80) past its bough so a
   step off either end lands one storey down (towerFalls); field tops are not landings (af77b01e: Easy widened one past the lay's way up, the
   turn vine stood 26 px past the bough above). **library14 --seeds 12: 12/12 clean and in beat order, both settings.**
4. score.ts reads vine fields (0943e0c9): walked with gates open (`vineField.ts gatesOpened`, tested), each pod a beat window (beatOf: safe =
   period less 'on', Easy stretched; heart or knock), each fig gate a puzzle, crumble counted only at the challenge's own height (1-1..1-3
   unchanged, checked; --check 14/14). **1-4 Normal 2.9 (2.9-3.2, seeds 1-6), Easy 2.8 (2.8-3.0).**
## Polish check
Two-hand climb, upright, Normal seed 1 (stills-14/climb2-port-normal-s1.jpg): a paw on each strand, body between, his size. Sideways shot
taken, NOT judged. Earlier B14 stills (stills-14/port-*) as B14 reported; sideways and Easy still not judged.
## Not done (named plainly)
- **Score below band:** Normal 2.9 vs target 4.5 +-1. Cause: columns are 330 px so a beat's 'on' is 1.2 s: steady safe 2.4 of 3.6 s,
  quick 1.2 of 2.4 (design: 1.2-2.0 and 0.8-0.9); 5 of 9 pods are in the route's way; flyer and ants not built. Easy 2.8 is not half of
  Normal: the rotten-stair jumps (rise 80, the meter's heaviest) are the same on both. The lead decided (12:29 PM ET): EXACT NEXT STEP 1.
- **Bots (seeds 1-3, every bot):** stuck most at the rotten stair (beat 2, ~39 events: "the way on is up"; a plain jump from the sound
  wood DOES land on the exit bough, RealPlay, so it is the 80 px rise against first-timer holds), pod hits at pods:foot / under-fire /
  hollow, the shut 3-bunch gate (bot stands on it unfreed: figPush), the crown liana. The meter flags a "double" at the stair (~21 s).
- **Suite on af77b01e: 3,185 pass, 6 fail.** Fixed since (2d7cc114): judgedTable 453-455 (fixture id was '1-4'), puzzleCamera 650
  (1-4's deleted rooms). Still red, not mine: art/inventory.test.ts:155 (ART's new slot "1-4 falling pod" not on CATALOG-MASTER.md's
  World 1 gaps line), w1Arc15 772 "1-5: every sampled roll ... passes the level check" (B15's stage on this base). Not run: build,
  chunkcheck, perf gates (drawcheck has 1-4 in its scenarios already), tool tests, seedlist/tierBots (cut at the context line).
- Lay fault (the lead sent it to NODES-TRAVEL): a tower turn vine may stand past the end of the bough it climbs to; the verdicts let it through.
## Gates (af77b01e)
tsc PASS; heroClips, vineField, w1Arc14, podfall, feelPairRoom tests PASS; score.ts --check PASS; full suite as above (2 red not mine after 2d7cc114; re-run on the next head).
## Learned / proposed level.md rules
- A piece climbed onto (a field's foot AND top) is never a `landing`: Easy widens landings, and the lay's way up moves with the width.
- A sealed piece (a gate) owns its catch: its own section's wood runs past both ends by a vine spacing.
- A meter or bot built for a run reads a tower wrong (x-only footing, no fields): give it the stage's mechanics before trusting its number.
Method: level.md 1-15. Lessons: D41, D19, D46, D51, D15 (tested the meter before trusting it), D55. Turnover: engine-core.md §0j.
