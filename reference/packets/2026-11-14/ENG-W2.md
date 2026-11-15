# ENG-W2: World 2's gen2 kit + the river as a gen2 section, so 2-1 and 2-2 build in under 2 hours each (Matt R-165.254). Opus 5.5 xhigh (engine). Written 6:41 PM ET 11-14.
Role card: reference/roles/ENGINE.md. Read level.md rules 21-22 first, then ONLY: reference/design/pitches/PITCH-A.md on origin/t-pitch-a
lines 77-200 (2-1, 2-2 and the ranked engine list); gen2/worlds/stageTable.ts (whole); ONE existing kit as your pattern (gen2/worlds/w6.ts +
w6Ground.ts: how a world's kit, rows and look are wired); src/game/w2Stages.ts:1-60 and w2Sections.ts:90-110, 319-323, 536-540 (today's
hand-built World 2); river.ts and engine.ts:1840-1860 (drift logs, the bank taking him); gen2/rideLay.ts and ride.ts:1-30, 95-115.
Why: both pitches agree no World 2 level can be built in 2 hours until World 2 is on gen2. This is that foundation, built once for the world.
Branch: t-eng-w2 from origin/t-int-9@1c7f6b95.
 (1) MUST: gen2/worlds/w2.ts (+ ground/sections as the w6 pattern needs): World 2's kit from the INVENTORY (src/game/art/inventory.ts; every
     piece at its scale against Pokey's 89.1 px, R-165.107), its look by world data, water as deadly gaps (gen2 waterWarnings, already wired),
     STAGE_TABLE rows '2-1' and '2-2' on the kit with placeholder arcs that roll; the hand-built 2-1/2-2 path in w2Stages.ts/stageGenerator.ts
     :2895-2900 deleted for those two only once the gen2 rows roll (new replaces old). Planted: a w2 kit test; generalitycheck clean.
 (2) THEN (the pitches are picked: 2-1.md and 2-2.md on origin/t-pitch-b): the river as a gen2 section: drift logs between banks from data (river.ts's logs; riverLay.ts new), recipes for a log you ride,
     a log on a clock, a river flowing back; a bot skill that rides a log and steps off (planted toy, the middle and child bots). Proven on
     World 2's kit and one other world's (rule 21).
ENGINE-WORTHY from DESIGN-FINAL (7:49): a river log moves him by position (engine.ts:1848), so a jump off it keeps none of its speed,
while a ride does (ride.ts:19): one carry rule for everything that carries him, planted. And flowerReach.ts:139 never puts a petal on pads
or logs. Final designs: reference/design/2-1.md and 2-2.md on origin/t-pitch-b (b85dba7f) replace PITCH-A as your source.
STORY (keeper, canon): reference/design/PICKS-19-22.md "Story keeper rulings": the village dug into the bank (not stilts), the
arrival scene at 2-1's gate, no mushroom bounce in World 2 (a bent Guadua bamboo or palm frond), the counter-flow as an eddy by an islet.
Proof in reference/qa-reports/ENG-W2/REPORT.md: stills of a rolled 2-1 upright + sideways (Normal), the bot ride clip with the frame named,
the WHOLE suite on your head, lockall --check (only 2-1/2-2 move; list them), drawcheck on 2-1 if it is in limits.json (add it: D51).
READY-TO-BUILD (D75): 2-1's row must roll AND list through addlevel (quiet line, help room, seed list), not only roll.
Report "Learned", ENGINE-WORTHY, and EXACT NEXT STEP for the 2-1 builder (what is data-only from here).
BOX: report by 9:50 PM ET, or at 40% real context (400k). Progress message at 8:50 PM with (1)'s state. No shell wait loops (D67);
read your queue at every push. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
