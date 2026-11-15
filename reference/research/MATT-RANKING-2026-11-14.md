# Matt's difficulty ranking of World 1 (validation data for the difficulty model), given 11:55 PM ET 11-14, BEFORE seeing any model's table
Matt, verbatim: "Right now i would rate difficulty in this order. 4, 5, 2, 3, 1, 7. 4 hardest and 1 easiest" (read as the list's order:
1-7 last = easiest; the lead confirms with him).
Hardest -> easiest: **1-4 > 1-5 > 1-2 > 1-3 > 1-1 > 1-7**. Source: Matt played all six on his test link; plus two family players (one watched,
one gave feedback on one level; roles only, never names). 1-7 was played before ENG-WATCH's eagle fix (t-eng-watch), so its place may move.
Kept from the DIFF-SYNTH helper until its own table is written (blind test). The lead compares after.
For the record, the meters BEFORE this (Normal): METER-1 (t-meter-1): 1-4 4.3, 1-5 4.0, 1-1 4.0, 1-7 2.2, 1-3 1.1, 1-2 0.9. DIFF-RESEARCH's tier bots
(middle Normal misses/min): 1-5 2.34 highest, then 1-1 > 1-2 > 1-3; 1-7 0.17. Biggest disagreement: Matt puts 1-2 third hardest; both meters put it
near the bottom; and 1-1 second easiest where the meter has it tied for second hardest.

## Why 1-2 is third hardest (Matt, 11:56 PM ET)
"if people don't understand that they can just run across it, they're going to try to adjust their jump in the air, and they're going to mess it
up. That's what [a family player] did, and she started getting frustrated." So 1-2's difficulty is a MISREAD: the bounce chain is easy for a
player who knows to keep running, and hard for one who tries to steer each jump in the air. The difficulty factor is reading/understanding (did
the level teach what to do?), not precision, and its cost was frustration, not just failure. A model that scores only the intended input
(run straight across) will call 1-2 easy and be wrong for first-time players; it must account for the likely WRONG input a newcomer tries.

## Double jumps and how people hold the phone (Matt, 12:00 AM ET)
"the other thing that makes some things hard is like double jumping. It's all timing. So if somebody uses their index finger, it may be different
than their thumb. So double jumps are usually a little bit harder. And other people may try to run with the finger on Pokey, which would make it
harder because their fingers run out of space... usually people tell me double jumping's harder, like one of the harder things to do."
For the model: (1) the double jump's second-press timing is a top-felt difficulty for players (testers' reports, via Matt); its channel must be
calibrated to tester failures, not only the bits formula (DIFFICULTY.md prices it +1.32); (2) input posture changes timing spread: thumb vs index
finger (and two-handed vs one-handed) are different player tiers' spreads; (3) running with a finger ON Pokey runs out of screen: the control's
reach is part of difficulty for that style (a UX question as much as a difficulty one).

## Stress changes timing; vines feel wonky (Matt, 12:00 AM ET)
"double jumping people find difficult because it's all finger timing and how they're pointing based upon if they're excited, if they're running
and jumping from vines can get frustrating to people just because the vines are a little wonky, but it's more of a stressful activity, especially
if you fall down below and you can die from it."
For the model: stakes don't only add setback time, they WIDEN the timing spread (an excited or stressed player presses worse): the pressure
channel must scale the spread by what a miss costs (a death pit below > a soft fall), and a chase or a watcher adds to it. Vines: players find
the lianas "a little wonky" (feel, not difficulty): R-165.271.
