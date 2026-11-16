# TOOLS-1: the three tool faults that slow every level (R-165.239, R-165.244, R-165.245). Opus 5.5 xhigh (shared tools). Written 4:15 PM ET 11-14.
Branch t-tools-1 from origin/t-int-9@fb409960. READ ONLY the three ROADMAP rows (grep "R-165.239 |", "R-165.244 |", "R-165.245 |").
1. R-165.239 meter: tools/inspect/route.ts:402/:413 score every liana twice (grab from a bank and the let-go onto a bank); score.ts:247
   charges 'life' on every swing even over soft ground (jumps use costAt with softPits). One swing per liana; swings over soft ground use
   costAt. Planted test (a liana stage with and without soft moss). Re-score 1-1..1-7 and write the before/after table; a calibrated
   tierBots number must not move (BOTS.md if it must).
2. R-165.244 castBots leak: per-seed goal "need" changes with what ran before it in the same process (castBots.ts:67-71; firsttimer.ts
   :2585-2586's reset doesn't cover it). Find the shared state, isolate each build; planted test (A then B equals B alone).
3. R-165.245 clipcheck flake: 'fresh up: Dot's first tip' (1-3) walks him by wall-clock key hops; drive it by game frames or the touch
   pad (tools/inspect/clipPress.mjs); prove with 10 runs each on base and branch.
Gates scoped (LAWS 5): tools + tsc + the whole suite on your head (named in REPORT) + clipcheck + tierBots. BOX: 2 hours or 40% context
(real figure as above). No wait loops; queue read at every push. Lead: session_01FhBbYNzGRJBDMzn6XbtQK2 (after ~8 PM: lead.md's top line).
