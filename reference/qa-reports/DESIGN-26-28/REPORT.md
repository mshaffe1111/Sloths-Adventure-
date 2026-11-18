# DESIGN-26-28 REPORT (Designer, t-design-26 from origin/main 6e7b85f8; started 2:25 PM ET 11-18, written 2:57 PM ET by date; packet reference/packets/2026-11-18/DESIGN-26-28.md)
**EXACT NEXT STEP (lead):** rule on Pushback 1-5 (1 decides whether 2-7/2-8 need a third NEW: the two-ground legs), then write the engine packets from each design's "Engine" paragraph, 2-6's wheel first.

## Done-items (packet) and evidence
1. **reference/design/2-6.md, 2-7.md, 2-8.md, built-ready as 2-4.md:** one idea; tributes (loved, taught, ours, not copied; B's cited quotes + one of A's optional reads each); beats table (s, bits,
   there, does, feels); first appearances taught, Dot 800 px+ before, asks for the story keeper (no lines); Normal + Easy targets PASTED (DIFFICULTY.md:61-63: 15.0 / <= 9.0; 18.0 / <= 10.8; 17.0 / <= 10.2).
2. **Node strings pass checkCode with leg marks** (`npx tsx reference/specs/sims/nodes2628.ts`, out/nodes2628.txt): 2-6 B's as pitched; 2-7 and 2-8 changed (Pushback 1), all "no errors".
3. **Every number flown on the real engine through InputEngine** (realPlay.ts 30 fps, 80 ms tap; relative imports, D83): wheel26.ts (2-6: board / ride / step-off / jump-off, every phase, 18 wheels x
   both settings), river27.ts (2-7: the push off logs both ways; crossings by expert / careful middle / ride-only on 6 rows, every phase; the bank run), flood28.ts (2-8: Pokey on the engine leading
   2-3's follower contract; low vs high road; dawdles; T_CLOSE; set-backs; the fetch). Outputs: reference/specs/sims/out/{wheel26,river27,flood28}-{normal,easy}.txt.
   2-6: bucket spacing 2.4-3.4 s, turn 14-21 s, step-on 100% of phases (tap), the step-off windows, a miss rides round or splashes in the pond (never a pit). 2-7: the push +7/+9 px with, -4/-5
   against; the boat 45 s Normal / 53 s Easy for the designed home leg (careful middle wins by 2.9 / 5.2 s, ride-only loses by 3.6 / 2.1 s) and the rule that sets it from any laid leg; the post doors
   at the engine's 40 px pick-up reach (engine.ts:3308). 2-8: T_CLOSE 26 s from the last cage on both settings (prompt tail + 4 s / + 8 s), the high road +7.2 / +5.5 s, a set-back costs ~34 / ~30 s.
4. **"The first run back left" RULED in 2-7.md** (a /L run leg after a rightward run leg, >= 1/3 of content nodes with S and E, the run lay only; 1-4's tower storeys excluded) with a proposed check.
5. **Engine list per level (2 NEW max: file, size, toy) and order; the hand build each replaces and its pinned tests; art asks (wheel, bucket, mail boat, letters, open door, weir; 2-8's waiting pose).**
6. **Gates:** sims tsc 0 errors (temp tsconfig extending the project's, types node, lib ES2023; project tsc 0); roadmapcheck PASS (after unshallow + full fetch); knowncheck PASS.

## Polish check
Docs only, no stills. Read each design against its out/ file line by line: fixed an Easy wheel cell (4.0 -> 4.57 s), a count (6 of 10 -> 6 of 11), a wrong cite (physics.ts:200-202 -> 198-204
airStep, in 3 files), two hand-typed header times (re-stamped by date, D30). Sims tested before trusting (D15): 5 sim bugs found and fixed (a left wall at x = 0; level-crossing read on a landing frame;
a bunch threshold under the line's own length; a home stop short of the tail; a tap-only bot that could never cross against the current).

## Pushback (rulings wanted)
1. **Out-and-back on one ground mirrors onto itself** (pipeline.ts:2541 leftSum = 2 cur.x + ASIDE at gy = cur.y; legs.test.ts:20 tests /U then /L only). By the code, B's `R /L` lays the home leg over
   the out leg; W2's run corridor is 480 px tall (w2.ts:142). 2-7 now drops a /D column at the weir (out along the mill-race, home on the river below); 2-8 rises carved steps (Uc1^) before /L. Unflown:
   the engine's first toy proves it; if it needs a new lay that is a THIRD NEW (2-7). And a liana on a left leg is refused (legs.ts:151): B's home-leg `Cs1>` became `Cf1>` (stilt porches).
2. **The carry rule does not throw** (flown): a jump steered out of a bucket/log at 50-80 px/s clears 7-12 px more (176 -> 183-185; bucket 162 -> 170-174): past his run speed the air brakes him.
   B's 2-6 beat 8 ("the wheel throws you") and 2-7's "the longest, fastest jumps in World 2" do not hold. 2-6's twist is now a jump UP off the top (flown); 2-7's home thrill is the race.
3. **With the current the river sets the pace** (87-137 px/s for all three players; a bank 272 px/s): skill buys 1.5-2.4 s a river. The race is decided on the banks; B's Easy "~8 s behind" breaks
   "never by riding the current" (the middle/ride-only gap is 7.3 s): Easy's margin is 5.2 s.
4. **"Never by standing still"** read as never by letting the current carry him (standing still always loses: the boat never waits). Ruled in 2-7.md; the lead may read it otherwise.
5. **2-3's follower contract stops the line at a step DOWN** (a walk-off is `hold`, a WAIT): 2-8's high road needs "a step <= 60 px walked off is a walk" in NEW 2. And the pulley-cage tests 2-3's design moved
   to 2-8 must move again (to 2-9). Also: `twin` -80 against the current is REFUSED for any careful player (29 px/s, 39 s median, 1 of 98 stuck).

## Suggestions (outside my walls; ready packets)
1. ENGINE-LEGS (xhigh, first): a stageTable toy `A Pg1> Pw1> R /D Dg1_ /L Tg1< Pw1> R Sw1> E`: the left leg on a ground clear of the out leg, its rivers flowing left, flags/petals/bots; RED with the /D removed.
2. ENGINE 2-6 / 2-7 / 2-8 (each the design's "Engine" paragraph verbatim; done = toys RED with the plant; READY on a stageTable row, rule 23).
3. GATE (Critic): nodeCode test "the first run back left" (2-7.md's ruling) over every shipped graph.

## Unresolved
2-7's stilt-house beat (C) is flown as a `twin` crossing (a ceiling), not as itself; the boat's lane on an upright screen is unproven (stills); the wheel's upright fit (R160-200 vs a 440 px view) is the
first still to shoot; bits per beat are estimates (the meter reads the built stage); flood28's line ignores y (a dip is paddled at pace, as the contract says); quotes not re-opened (from PITCH-26B).

## Method used / Lessons applied / Method update
Used: methods/level.md rules 1-9, 21-24; DESIGNER.md; 2-4.md as the format. Lessons: D30/D42 (times by date; two typed times caught and re-stamped), D15 (sims tested first), D34 (cites read on main,
one wrong cite fixed), D49/D60 (targets and flags pasted), D58, D41 (art against 89.1 px), D46 (every miss lands on soft water or rides round), D53 (fast gates before push), D36, D59 (no job running), D83.
**Method update (level.md rule 24, proposed):** "Fly every player tier the design leans on (expert / careful middle / passive), not one bot; a race or a margin is set between two flown tiers. Check a
mechanic the pitch says 'throws' or 'carries' with the thumb steering, as a player does. Before designing a left leg, read legs.ts's refusals (liana, room) and where the leg is laid."
**Learned:** an out-and-back is two grounds or it is one overlapping leg; a moving floor feels fast only when the thumb is NOT steering; the line (not the hero) is the clock in a rescue.
Turnover note: reference/handoffs/designer.md rewritten (header, §0 Now, §5 two traps), in this branch's commit.
