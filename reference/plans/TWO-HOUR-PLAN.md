# TWO-HOUR-PLAN: how every level from here to World 10 becomes a 2-hour job, and stays one (the lead, 11-23; Matt R-165.409)

Matt, 11-23 11:43 AM ET: "I need to understand how you're planning the 2-hour level. Design and how you're starting to get the pieces in
to implement it. And that's big picture ... how to get a 2-hour level in and keep it holding in World 7."

## What a 2-hour level IS (the definition the whole plan serves)
A level job is ONLY: lay the designed node string on the stage's row (gen2), Dot's approved words verbatim, the seed list by the tool, the
bots, the stills and the gates. Everything else is done BEFORE it starts:
- every mechanic it uses is a GREEN engine piece (general gen2 lay, planted toy, proven on two worlds' kits);
- the bots already play every move it needs (a bot SKILL per piece, built with the piece; the bots were the biggest time sink in World 2:
  2-6's 35 sessions were mostly bot fidelity and engine found mid-level);
- its world's kit is on gen2 and its art is in the inventory at Pokey's scale;
- its design names only "Now" pieces (NODE-KEY) and its Normal meter number; its words are approved.
Measured today: 1-7 took ONE builder once its engine was ready (LEAD-PERSONA); 1-6 took four because the bots could not swing. That gap
is the whole plan.

## The machine that keeps it 2 hours (four lanes, always ahead)
1. **Pieces lane (engine + bot skill + meter channel), two worlds ahead.** One library of pieces for the whole game, built once in
   dependency order (reference/plans/ENGINE-NEEDS.md ranked list, refreshed below). A piece lands with its bot skill or it is not done.
2. **World kit day, one world ahead:** the world's kit on gen2 (as w2.ts), its cast rows, its art batch on Hugging Face cut at scale into
   the inventory (WORLD-3-PLAN §3 is the model), BEFORE its first stage is built.
3. **Design lane, one world ahead:** pitch -> pick -> design for a whole world in a day (World 3 did it on 11-19), from the library;
   at most ONE new piece per level, and that piece goes to the pieces lane first; the story keeper's words with the design.
4. **Build lane: the 2-hour level jobs,** one level per job, budget 2 h, hard stop 4 h; a missing piece found mid-build stops the
   build and goes to lane 1 (never built inside it).
And the time inside the level job comes down: addlevel/registrycheck do the registration in one step (built 11-13); the gates run in
parallel (stills while the suite runs); the full slow set (THE FULL SET) runs once per release on the combined head.

## Where it holds or breaks: the late worlds (the reason to plan now)
The common pieces (up, clock, ride, still, water, swing, follow, left) mostly exist after Worlds 1-2. The late worlds bring the rare,
hard ones (ENGINE-NEEDS §2 "later, by hand"): leash and drowsy (W5), the machine's timed door and relic chair (W7), heat (W9), hold
(W10), chase (7-6), dark at full strength (W6, W8: 17 stages), glide down a drop (4-7, 8-6), crumbling vine (7-5, 9-3), break/push (7-2).
World 7 holds 2 hours only if its pieces (machine, break/push, crumbling vine, chase) and their BOT SKILLS are green before its designs are
final; that is about two weeks before its builds. The bosses (R-1: 7-10 to complete) are their own lane, not level jobs.

## The order (to be made exact by PLAN-2H today)
Week of 11-23: World 2 done (2-7, 2-6, 2-8, 2-9), World 3 READY (kit, dark + light, prowlers, art batch 1, designs). Then each week: the
current world's builds at 2 h each, the next world's kit + designs, and the pieces for the world after it.

## What exists vs what is missing (PLAN-2H, an Architect job today in the first free slot)
ENGINE-NEEDS.md's truth table is from 11-13. PLAN-2H refreshes it against today's code: for EVERY remaining stage (2-8, 2-9, World 3 to
World 10, the hidden stages), each piece and each bot skill GREEN or MISSING with file:line, its size from measured history, the world it
first serves, and the wave order; plus each world's kit and art status. Output: this plan's exact schedule, one row per piece.

## The scoreboard line (every report to Matt)
Hours per level job vs 2 h (LEVEL-LOG); pieces landed ahead this week vs the plan; worlds READY ahead of their builds.
