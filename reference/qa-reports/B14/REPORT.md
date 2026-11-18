# B14 REPORT: 1-4 "Up the Kapok" (t-b14). B14c (fresh, 12:54 PM ET), box to 3:30 PM. Times from `date`.
**EXACT NEXT STEP (in order):** 1. The engine owner (the lead assigned it): the turn vine 26 px off its bough (pipeline.ts
clearClimbs moves a vine whose top is exactly at a ledge's end CLIMB_CLEAR off it; a tower turn's vine is placed exactly there).
Evidence, seed 1 (listed): vine x 88, 7342 -> 6981; bough 'a' (s3, rotting) x 114-334 at 6981. RealPlay from (166, 7342): left to the
vine, up 3 s -> hangs at x 45, y 7004; then right alone -> falls to 7342; right+jump -> lands on 'a' (x 166, 6981); up+jump+right
-> 'a' (x 287). So the way holds for a player who jumps, not for one who steps. 2. Then the bot (firsttimer.ts): its route
(findRoute on buildRoll; the engine stage's own check fails while gates are shut) climbs that vine straight onto the stair's sound
wood (88,7342 -> 334,7061) and asks an 80 px hop to 'z' (dip 80); then the hollow's "fell back down from here" (374, 1946) and the
crown's "the way on is 120 px up" (429, 1321). One at a time, a RealPlay probe first; `castBots --stage 1-4 --seeds 1-6 --setting
both --par 6`, then 1-40. 3. R-165.192, then flyer + ants (art on t-art-1113), only after 1-2.
HELD for the t-b15 merge (unchanged): b14-hunks-2's engine hunk and firsttimer-markclimb.patch (origin/t-b15@c31ece1b).
## Done (B14c; evidence)
1. The lead's difficulty call (87f2a7fc): teach stays 3.6 s; beats 7-9 and the crown on a grown 3.0 s beat (1.8 s safe; pods already
   down beat 7's push vines); the hollow on a quick 2.3 s beat (1.1 s safe); each beat's 'on' from its OWN longest column (was all
   beats from the longest anywhere). score.ts counts a pod down a gate's fig vine (it walked gates open and missed every push-vine pod;
   --check 14/14). **1-4 Normal 3.3 (was 2.9), Easy 2.9** (seeds 1-6; 1-1..1-3 unchanged: 4 / 1 / 0.9).
2. Seed list (fae502e5): `seedlist.ts 1-4 --count 100`: 100 of 100 clean both settings; `--check` PASS; provenIndex line.
3. Stills (cbe090f0), fresh save, seed 1, every section upright + sideways: stills-14c (Normal), stills-14c-easy (Easy). The shooter
   set Easy by URL, which the game ignores: B14's earlier "Easy" stills were Normal. Fixed (sets the save's setting and reloads).
4. src/assets/ui/ctest-1-4.webp (880x425, 31 KB; ctest-14.mjs): real game, Normal, Pokey two-handed under a fig bunch in the push
   field, the gate bough over him, HUD off. Review copy stills-14c/ctest-1-4.jpg. ControlTestGate.tsx shows it (the keeper's alt);
   ctest-1-1.webp deleted (new replaces old), its catalog row replaced (CATALOG-MASTER.csv, --emit); gates.yml runs `seedlist 1-4 --check`.
## Polish check
port-s13-hollow (Normal): six vines, figs on 1 and 3, gate bough with fungus, reads at his size. Easy port-s13-hollow: vine 3's
bunch gone (Easy's one fewer), Dot's Hush Fern line (the Notch's fern, by design). land-s9-under-fire: figs on both push vines, a
pod's fluff tell on vine 4; the gate bough's middle sits under the progress bar when he stands at the foot (camera; named, not fixed).
port-s15-crown: the long vines are right of the upright frame at the stair's foot (mid bough x 590-870); the camera follows. Pokey
reads faded in some stills: the shooter's own invincibleTimer, not the game. Not judged one by one: the rest of the 64 stills.
## Not done (named plainly)
- **Score below band:** Normal 3.3 vs 4.5 +-1. The design's 0.8-0.9 s of 2.4 s can't be built inside our rules: a field is at most
  450 px (w1Arc14.test.ts, "sound wood within 450 of every point"), so a column's 'on' tops out at 1.2 s, and a window can't go below
  the 1.0 s tell. 1.1 s is the floor. The rest of the gap is the flyer and ants (out tonight) and the hollow's single column.
- **Bots 0 of 3 seeds pass** (castBots seeds 1-3, every bot, both settings: rescues). Diagnosis and evidence: EXACT NEXT STEP 1-2.
  Not fixed tonight: the level bug is the engine owner's; the bot's route work didn't fit the box.
## Gates (on 7744b49c / cbe090f0, 1:40-2:20 PM)
PASS: tsc, vite build, chunkcheck, artcheck, knowncheck, generalitycheck, roadmapcheck (after `git fetch --unshallow`), kbdcheck,
seedlist 1-1 and 1-4 --check, tool tests (33/33), score.ts --check, w1Arc14 + podfall tests. **FAIL drawcheck: 1-4 sideways spot 1
(x 922, y 5699) drawImageScreens 8.01 > 7.5** (drawcheck-b14c.txt): backdrop scenery.ts:2078 drawFitted ~3 screens, ground chunks 1,
vignette 1, lanePool scenery.ts:1506; 1-4's own art is small (drawGate). Not mine to cut (scenery.ts); the limit is not loosened.
buildcheck FAILED once at p95 196 ms while the suite ran beside it: rerun alone. Suite: capped run stopped at 2,458 (my 25 min cap);
reds: inventory.test.ts:155 (ART's "1-4 falling pod" slot, CATALOG-MASTER gaps line), rollGuard.test.ts:42 (1-5 layout 173901: 110 s
< 120, B15's stage). Uncapped rerun in flight at the stop (suite2). Not run: clipcheck, tierBots (1-1 unchanged).
## Learned / proposed level.md rules
- A stills tool sets the setting the way the game reads it (the save), then checks a still shows Easy's difference (D50's spirit).
- A meter reads a gated field as the player must play it: every push vine climbed, so its pods are on the way.
- A beat's 'on' comes from its own columns, never the stage's longest (one tall field made every beat slow).
Method: level.md 1-15. Lessons: D41, D46, D50, D51, D15 (tested the meter before trusting it), D40 (left the lay to its owner).
