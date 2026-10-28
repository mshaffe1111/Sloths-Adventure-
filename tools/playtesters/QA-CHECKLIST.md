# QA checklist (Matt's stage rulebook, 2026-10-28)

From the coders' reference/STAGE-RULES.md (on GitHub with the next release). Use it for every batch from the Worlds 3-4 run on.
Tag each finding: stage, moment in seconds, upright/sideways, Easy/Normal, rule #. The coders' own bots (kid on Easy, adult on
Normal, a first-timer) run before a build reaches QA, so anything found here means their pass missed it: say so clearly.

1. Opening seconds: anything that can hurt in the first ~5 s of plain walking.
2. Tip before hazard: a hit or fall that comes before Dot's (or Flicker's) tip that teaches it.
3. Plain walk: a step, lip or dip that stops a plain walk or plain jump; falling back into the same dip twice.
4. Jumps: a jump that needs perfect timing or a full hold on Easy; a ledge clearly reached but slid off. (Targets: coyote time
   133 ms Normal / 167 ms Easy, jump buffer 133/200 ms, ledge forgiveness ~8/12 px, a jump into a face carries over its lip.)
5. Quiet stretches: more than ~4 s with nothing to do (petals on flat ground count as nothing).
6. Look-alikes: a stretch that feels the same as another stage of the same world, or as the last time you played it.
7. Puzzle rooms: can't see the piece and what it acts on together upright (Pokey shrinking to fit is intended); a puzzle that
   costs a life; a hint that gives it away; a room you can walk past without solving; a carried thing you can't carry without jumping.
8. Dot: speaks in the first seconds, repeats a tip you already did, lines closer than ~10 s apart, over ~10 words, a tip up 20 s+.
9. Goals: a count that can't be met fairly on Normal (87.5% petals, all rescues, 75% predators); totals that disagree.
10. Art: a prop that pops in late, a missing state (a pressed plate that doesn't look pressed, a bell that doesn't swing).
11. Device: frame rate, freezes, and the Device column's browser part (in-app browser, "framed", software drawing in 'env').
12. Anything a 7-10-year-old wouldn't understand or would find unfair.
