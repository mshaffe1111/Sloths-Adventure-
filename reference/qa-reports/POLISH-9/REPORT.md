# POLISH-9 REPORT (t-polish-9 from origin/t-polish-8@76ae0baf; lead session_01FhBbYNzGRJBDMzn6XbtQK2; R-165.228)
Opus 5.5 high. 5:28-5:32 AM ET 11-14, stopped on the lead's pause (5:31). Context at report: about 12% of 1M (my estimate; D64).
**NOT GREEN, stopped early.** Item 1 (F) answered: it IS a bot artifact, fixed in the bot. Items 2-3 not started.

## EXACT NEXT STEP (the next 1-1 member, one step)
1. Add the toy planted test for the fix below to tools/inspect/firsttimer.test.ts (or src/game/firstTimerBot.test.ts): FT_ADULT on a
   toy floor with a 255 px level put-back gap; after the put-back his next jump is taken within edgeAim+60 px of the lip, never from where
   he was set down. Plant: delete `!graceHeld &&` (firsttimer.ts, the blockedT line) -> red. Then run the bot pins this change can move:
   src/game/firstTimerBot.test.ts (KID_RUNS_59, 5-9's Easy goal), w6Stages, teachSpoken, goalsEasy, requiredMove, feelPairRoom,
   castBots.test, bands.test; any pin that moves is re-measured with its reason, never loosened.
2. Then POLISH-9's packet items 2-3 unchanged: the 17 re-pins (POLISH-7 f8ced0e gates-summary), the 1-1 first-run lock (seed 9652),
   castBots 1-1 L1-10 kid+adult both settings, the full CLAUDE.md checks (buildcheck alone), stills (bounce teach + a stone stair, both ways).
3. Kid Normal layout 10 is still rescued once: locate it from rescueXs against the built pieces (POLISH-8's method) before (G).

## Done
- **(F) evidence: the adult's Normal rescues were a bot artifact.** FT_TRACE on 1-1 Normal layout 3: the test gap is 7630 -> 7885 (255 px,
  practice bank 7398-7630). Try 1, a running single from 7602: put back (right, he does not know the double is needed yet). Put back at
  7514, he held right and stood still for 0.37 s, then a STANDING double from 7514-7517 (116 px before the lip, `run false`) three
  times, each 20 px short of the far bank, then rescued. Cause: after a put-back or respawn the engine ignores a held thumb for 0.35 s
  (engine.ts:5668 and :5833 `inputGrace = 0.35`, "for a thumb still held from before the fall"); FT_ADULT's stopReact is 0.30 s, so the
  bot read that hold as "stopped dead against something" (firsttimer.ts blockedT) and jumped where it stood. FT_KID's stopReact is 0.40 s,
  which is why the kid rarely did it (9/10 vs 4/10). The tier bots were already exempt (`who.holdQ && t - backAt < 1`).
- **Fix (tools/inspect/firsttimer.ts only, no stage change):** blockedT does not count while the engine's own `inputGrace` > 0 (reads the
  engine's value, D19). Layout 3 after: put back at 7605, a run-up double from 7605 lands at 7872 -> ok, 0 rescues.
- **castBots 1-1 Normal layouts 1-10 (gates/castbots-1-1-kid-adult-normal.txt, this head):** adult **4/10 -> 10/10** (median 142.3 s);
  kid 9/10 unchanged (layout 10 rescued once, not yet located). So with the bot fixed, 1-1 Normal's double test does not strand an
  adult first-timer on any of the 10; the rules hold (law 22), no (G) row needed for adults.
- tsc clean (gates/g-tsc.txt). tierBots.test 7/7 (gates/g-tierbots.txt): tier bots and calibration unchanged, as expected (exempt already).

## UNRUN (D59; cut by the pause, named)
The toy planted test (packet item 1's "with a toy test"); the other bot-pinning suites in step 1; Easy castBots; the 17 re-pins; the
first-run lock; the full CLAUDE.md checks (unit suite, build, chunkcheck, artcheck, drawcheck, clipcheck, knowncheck, generality,
roadmapcheck, kbdcheck, buildcheck, seedlist --check); stills. No game code changed on this branch (tools/inspect only).
## Polish check: no stills taken (UNRUN). ## Pushback: none on the packet; bands.md's 67-72% is the flight sim's share, not tester data
(the testers never played a 250+ px double: 0.9.5's gaps were 195-228); the evidence used is the bot's own trace against the engine's code.
## Suggestions: none new. ## Method used: level.md (rules 5, 12, 14, 18), BOTS.md, bands.md; FT_TRACE / FT_FRAMES (firsttimer.ts:716-721).
## Lessons applied: D15 (test the measuring tool first: it was the tool), D19 (the bot reads the engine's own grace, not a copied 0.35),
D57 (queue read at push), D59 (nothing left running; UNRUN named), D63 (judged on the bot's frame-by-frame positions), D64.
## Method update (level.md, proposed): "Before a stage change for a bot's rescue, FT_TRACE the run and FT_FRAMES the 2 s before the failed
try: a jump from where a put-back set him (`run false`) is the bot, not the stage." Proof: found in 3 runs, about 10 minutes.
## Learned: the game's 0.35 s steer hold after a put-back looks like a wall to any bot whose stopReact is under it.
## Turnover note: not rewritten (cut by the pause); this REPORT's EXACT NEXT STEP is the resume point.
