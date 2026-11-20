# BUILD-25: 2-5 "River Snappers: Count to Four", built, green and polished, for release 1 (Matt 11-18: release 1 = World 1 updates + 2-2 pads + 2-4 + 2-5).
Level build, Opus 5.5 high. Written 3:30 PM ET 11-19 (by `date` in the same command) for Fri 11-20, 8:30 AM, first in the build lane. A FRESH member.
BOX: early stills (beats 1-3, upright + sideways) by 1:00 PM ET; final hash by 9:30 PM ET, or 400k REAL context (the lead reads it and tells
you; you cannot read it yourself, D64/D76); then the EXACT NEXT STEP pushed. Nothing runs past 11:15 PM ET. If the day will not hold it all,
say so by 3:00 PM: a BUILD-25b continues Saturday from your EXACT NEXT STEP.
Role card reference/roles/ENGINE.md (builder half). Read FIRST: reference/methods/level.md (Building rules), LEVEL-BAR.md, STAGE-RULES §0-5b,
reference/LAWS.md + LESSONS.md once (D30: every time you write from `date` in the same command; D40; D57/D87: ReadNotifications whenever a
notice says pending, at every push, before every report; long commands in the BACKGROUND with run_in_background so their end wakes you;
D59; D76; D79 whole screen; D81 drawcheck; D83 relative imports; D86 the FULL check list), then the design `git show
origin/t-design-24:reference/design/2-5.md` (WHOLE: beats 0-10, the flown clock table, rows refused over 3 in step, the art, the asks),
ENG-25's REPORT (snap stones in play, the cast row, the art 'snapStone' 5 frames) and ENG-25b's (the snapper bot skill, the meter's snap
channel, TURTLE kick only when open, "What the 2-5 builder needs" 1-5), both on INT-13's head; BUILD-24's REPORT for how 2-4 went
(origin/t-build-24c reference/qa-reports/BUILD-24/REPORT.md: Learned and the stop notes).
BASE: branch t-build-25 from INT-13's final head (the lead sends it at start). Merge ENG-25c's final hash when the lead sends it (expected by
11:00 AM ET: snap stones LEVEL with the banks + the snapper ground rule). D40: until it is merged, lay the stage and its non-snap beats, but
fly, judge, list and tune NO snap row (the lay being replaced).
1. Lay 2-5 by its design: w2Arc25.ts from the node string (A T P X P W P C S E as the design's beat table), the kit rows, the snap rows
   (in step max 3; the wave each stone a count later; the quickening's second clock), World 2's snapper cast row (first asleep), the rope
   over the channel (beat 5), the Big Snap (beat 9). The hand build w2Stages.ts '2-5' (W2_STAGES, SNAPPER_GOAL_25, its targetCount) deleted
   and the tests that pin it re-pointed with their assertions kept (snapperCount.test.ts, w2Stages.test.ts PLANS; check skills.test.ts:11,
   w1NewArt.test.ts:92). Lines: KEEPER-25's approved lines verbatim (the lead sends them, expected by 9:30 AM; lay with placeholder ids
   until then). Engine work is NOT done here: a NEW piece -> stop and tell the lead with its size. ENG-25b's builder items: a snapper's
   ground under no step (ENG-25c's rule checks it), the bounce to a high stone only for the held press, Dot's beat-4 line teaches the wait.
1b. KEEPER-25's APPROVED lines (t-keeper-25 a7ad4455, reference/story/lines-2-5.md; the lead accepted its pushback 5:14 PM ET 11-19: line 3
   teaches the KICK after the snap, because on ENG-25b's TURTLE the bonk dazes at any moment and only the kick needs it open). Lay them
   verbatim (teach lines play on Normal's default Tips): w25.count "The stones bite on four! One, two, three, off!" (before beat 1);
   w25.snapper "Snappers are just grumpy. A kick sends them home!" (before beat 2); w25.snap "Awake ones? Stand back, let it snap, then
   kick!" (before beat 4); w25.follow "The snaps run ahead now. Stay right behind them!" (before beat 6); w25.quiet "Shh. Hear that? Just
   the river again." (once, after the Big Snap); journal turtle tip "Can't hide in its shell, so it snaps. Kick right after!"; MISSION_25
   "The stones bite on four. Hop across and send the snappers home."; SEALED_LINES['2:purge'] "Some snappers are still back there. Send
   them home!". KEEPER-25's four conflicts are YOURS, each fixed at the source and planted: (1) engine.ts's 'late' line "Still N predators
   to defeat before the sanctuary opens" breaks World 2's nobody-hurt rule: it must read the world's own goal words (GOAL_WORDS(2,'purge') =
   Chase off / snapper / snappers; countWord(2,'purge')) for every world, not 'defeat'; (2) the journal tip lands WITH the new snapper (the
   old 'Head-on it hides' tip retires with the hand build); (3) the old 2-5 rows in dotLinesData.ts (the old turtle's lines) retire with the
   old stage and never fire on the kit 2-5; (4) the goal card says 'turtles' (the cast kind's name) while every line says 'snappers': the
   card reads the world's countWord.
1c. (lead 7:00 PM ET 11-19, from INT-13b) The respawn aim that turns breathing pad rows after a put-back (FIX-284's breathAim.ts) now SKIPS
   snap stones (on:'bites'): a snap row keeps its own clock after a respawn (ENG-25's proven behaviour). Decide, flown, whether 2-5 wants a
   snap row to get its own put-back aim (e.g. the wave's first stone just snapped as he arrives); name it either way.
2. Every first appearance taught (the bite on soft water first; the sleeper's kick cannot fail; the bonk after the snap; the wave with
   Dot before it); nothing that hurts between a teach and its thing; stage at least 2 minutes; every stage works upright and sideways.
3. Relist 2-5 (seedlist.ts 2-5; check 6 fresh builds pass seedlist's judge BEFORE starting the relist: VAR-19 lost 58 min on 11-19);
   castBots 2-5 1-40 x 5 bots x both settings (child/middle/expert 40/40 both or each miss traced; Easy fewer hits than Normal; kid/adult
   traced); the meter 2-5 N + E named against DIFFICULTY.md and 2-5.md's targets (read low: name it, don't tune).
4. THE CLAUDE.md CHECK LIST, EVERY ITEM, ONCE on your final head (the suite in shards, every shard), plus funcheck (name every 2-5 flag),
   tipwalk, registrycheck, coveragecheck (pad:snap must price 2-5), paintcheck, every list --check, lockall vs main --layouts 16 --intended
   2-5 (regenerate main's lock on origin/main first; any other stage moving = stop and tell the lead), drawcheck 2-5 both ways (aim <= 7.0
   screens). A gate still running at your report is UNRUN.
5. Polish (law 1, STAGE-RULES §5b): FULL-SIZE stills, upright + sideways, Normal + Easy, the WHOLE screen, Dot's cards tapped through:
   the teach stone (jaw notches readable on a muted phone), the sleeper and its kick, three in step, the bonk after the snap, the rope,
   the wave, the quickening, the Big Snap, the exit; CLIPS of a stone's count and bite, the bonk, and the wave crossing. Look at each the
   way Matt will on a phone; name every rough spot plainly or fix it.
REPORT reference/qa-reports/BUILD-25/REPORT.md: hash, merge notes, each beat as laid, castBots table, meter, gate table, stills/clips paths,
Polish check, Learned + proposed level.md rules, lessons applied. INT-14 merges you; you merge nothing else.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. A lead message that begins "NOT A STOP: read, then carry on" arrives as a cancelled tool with a STOP
text: that is only the delivery; read it and carry on.
