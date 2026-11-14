# FIX-14 PLAN (1-4: rocks, fig gate, vines, rotten fork). Branch t-fix-14 from origin/main@73e7bed0 (0.9.8). 11-14 12:2x AM ET
Packet: origin/ccr-ea739a2f-dfcee4:reference/packets/2026-11-14/FIX-14.md. Rows R-165.227, .212, .216, .229, .206.
## Step 1: what is there today (measured in code at 73e7bed0, and on the real page: `npx vite --port 5199`, seed 1, Normal, 412x915)
| Thing | Today (where) | Read against Matt |
|---|---|---|
| "Rocks" on 1-4 | They are kapok POD columns (podfall.ts), not rockfall.ts drops; they fall at rockfall's ROCK.speed 620 px/s (podfall.ts:38, rockfall.ts:27) | a 340 px column is 0.55 s of fall: "drop too quickly" |
| Pod beats | steady 3.6 s, grown 3.0 s, quick 2.3 s (w1Arc14.ts:84); Easy stretches x1.5 (TELL/EASY_STRETCH, :75) | |
| Tell (warn) | 1.0 s Normal, 1.5 s Easy (w1Arc14.ts:75, POD.tellMin) | |
| Pods per screen | 0-2 columns a field (teach 0; pods 2; push 1; under fire 2, ON both push vines; push-two 1; columns 2; drop 1; hollow 1 on the quick beat; crown 2); POD.seen 480 px, tells 1.5 s apart (POD.apart) | under fire puts pods on the vines he must push: the push and the dodge at once |
| How the tell is drawn | the pod itself wobbles (0.14 rad) and pale fluff tufts trickle down its column (vineFieldArt.ts:223-237); the vine and bough do not change; no colour | Matt: "too much going on"; tufts are small and pale on a busy green backdrop. His ask: the vine changes colour |
| Fig gate, gate of one (gate 0) | the fig tears free when its top reaches the bough's top (fig top 7025 vs bough 7022); his head is then 24 px UNDER the bough's underside; the fig falls back DOWN its column; the gate opens and he climbs onto the bough | head never above the underside while shut on this run; the only "locked" sign is the thorn tangle's settle/pull (GATE.settle 0.4 s, pull 0.7 s) |
| Fig gate, gate of two (gate 1) | run A: a pod knocked him off mid-push; run B: after the first fig freed, his head reached 24 px under the underside and he dropped off the vine top 300 px back to the foot (gate still shut) | "wonky": a top that drops you |
| The lid's rule in code | a shut gate stops his FEET 4 px under the bough's top (GATE.lid, vineField.ts:245): written on the feet, not the head, so wherever the lid is what stops him his body would be 44 px over the bough | Matt's "goes over the top" is this rule's shape; NOT yet reproduced on the page (my runs end at the vine top first). Next: Matt's frames from the lead, then the planted case |
| Vine climb on 1-4 (field) | one hand: up 220 px/s, DOWN a slide 440 (x2); two hands: up 352 (x1.6), down 110; pushing 132 one hand / 220 two (vineField.ts:32, vinePair.ts CLIMB_SPEED) | |
| Taking two hands | a side push steps hands ONLY when up/down are not held (engine.ts:2102): he must stop climbing to take or drop a hand; a side push with no vine there, held, hops him off | the stop-start is the "wonky" |
| Two vs one, 360 px field | one hand 1.64 s, two hands 1.02 s: 0.6 s saved, but a pod hits on EITHER hand's line (fieldPlay.ts:109): two columns of exposure | Matt: "worse than doing one" |
| Petals two-handed | he hangs midway between the two vines (handsX); a petal laid on a vine's line is ~40 px off his middle | "you can't collect petals doing two arms" (not yet planted as a test) |
| 1-5 vines (Matt likes) | plain climbs, 220 px/s up AND down, no field, no hands (w1Arc15.ts:75) | |
| Air steer off a vine | the same PHYS on both stages (airAcc 1700, airDec 520, airStop 1300; physics.ts) | the gap to 1-5 is the field climb (slide x2, stop-to-step), not the air |
Repro: `PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/FIX-14/figrepro.mjs 5199 <out> normal <gate#>` (logs head vs bough each 0.2 s; Playwright video renders the page in a corner here, so the clip for Matt is built from per-frame screenshots).
## Step 2 (SHOW FIRST, not built): two upright mock clips to the lead
(a) one vine vs two past a telegraphed pod: the bough/vine it hangs from shakes and turns a warm warning colour, dust trickles, 1.5 s+ before a slower drop; two hands visibly beat one up. (b) the fig lock: thatch tied down over the gap, ties strain as the fig rises, SNAP at full push; Pokey's head stops at the bough's underside. Code-drawn stand-ins for the mock only; art pieces named for the lead's HF batch.
## Step 3+ waits for Matt's pick (packet steps 3-5).
