# DIFF-ALGO: research and design the hardness meter, a difficulty arc for every level (R-165.172) (the lead, 2026-11-12 8:33 PM ET).
Fable 5.2 high (role engine-fable: diagnosis and design; Matt 8:31 PM: "get Fable to run through and create a difficulty arc, an
algorithm that we build into it"). DESIGN + a measured prototype only; the meter's build and gate are a later Opus packet.
Branch t-diff-algo from the integration head the lead names.

Why (Matt, 11-12 8:26-8:31 PM ET, read his words in reference/STATE.md and STAGE-RULES §1 #5): Normal gets a 0-100 hardness meter, World
10's hardest = 100, each world about its own tenth, stages may go up and down, "when we're in the 9 levels... it feels like a 9 level".
"Assign points to certain things to create difficulties... X amount of creatures, double jumps... the distance of jumps, how many
things are going on at one time... this needs to be factored into every level we build... we're not guessing." Easy is "a casual
playthrough" (always lower). His anchors from playing them: 1-1 = 4 ("more double jumps"), 1-2 a bit above 1-3, 1-3 = 1-2. From 1-4 on,
Normal climbs so adults want it ("not... only [a] kid game").
Read first: reference/roles/README.md, LAWS.md, LESSONS.md, STAGE-RULES.md (§1 #5, §1b, the Pacing row and the bands rule),
reference/GEMINI-PCG-RESEARCH.md (Part 2 §4 density tables) and GEMINI-LEDGER.md, PERFORMANCE-RULES §1 (a meter must cost nothing at
play time), reference/methods/level.md, LEVEL-BAR.md, the designs 1-2/1-3 (origin/t-int-2), 1-4 (origin/t-14-design), and what the
engine already measures (levelCheck, castBots/tierBots, the first-timer bot, inspect.ts, funcheck, the time model).

## Deliver (reference/design/DIFFICULTY.md, 80 lines or fewer, plus a prototype script)
1. The elements that make a stage hard, each with points and WHY (research: published difficulty models for platformers, our own
   bot data): e.g. gap distance vs max jump, timing window ms, double jumps, enemies/creatures by kind, hazards per minute, things at
   once (threat overlap), required precision landings, checkpoint spacing and the cost of a miss, time pressure, new-vs-taught.
2. How they combine into ONE 0-100 number (not a plain sum if overlap matters), and the world bands (with overlap) and the arc rules
   (a breather allowed; a world's last stages near its top; never a whole world over its neighbour).
3. CALIBRATION: a prototype (tools/difficulty/score.ts or similar, read-only, no game change) that scores the stages we have (World 1
   at least, 1-1/1-2/1-3 on Normal and Easy), and shows Matt's anchors hold (1-1 = 4, 1-2 above 1-3, 1-3 = 1-2) without hand-tuning per
   stage; say where it disagrees with him and why.
4. How a designer uses it (a target per level in the design doc; what to change to move a stage up or down) and how a gate would
   check it (the later Opus packet's spec).
Rules: no game code change; never loosen a rule; times from date; every file:line re-grepped before push. Return: push, a send_message
to the lead (session_01FhBbYP63h7cCX8DyW69stq) in 10 lines or fewer with World 1's scores. Time box: 3 hours. Stop line from the lead.
