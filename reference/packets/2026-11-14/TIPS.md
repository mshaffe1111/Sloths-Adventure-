# TIPS: teach tips fire where their mechanic is, on climbing stages (R-165.236). Opus 5.5 high. Written 8:44 AM ET 11-14 by the lead.
Branch t-tips from origin/t-int-7 (link #1's head). Evidence: INT-7b's stills/1-4/TIPWALK-1-4-L0.txt and tools/tipwalk.mjs (on t-int-7).
1-4's four tips fire by x alone (pipeline.ts:3008 {x,text}; engine.ts:3124 p.x >= h.x): all four in the first 3 s on the start floor.
1. A tip carries its socket's height band (belowY/aboveY from the placing piece) and fires only inside it (and past x); flat stages keep
   today's behaviour (a planted test that 1-1/1-2/1-5 tips fire at the same frames as before).
2. A gen2 verdict: a teach fires within N px of its mechanic's first appearance (N from the reach numbers; say it); every vertical stage
   checked (D21), tipwalk.mjs promoted to a gate tool with its own test.
3. Before/after clip of 1-4's start + the first creak bough + the first fig gate, upright + sideways, Normal + Easy (D63).
4. R-165.238 (added 10:36 AM ET): delete the old proto 1-6 whole (protoStage.ts seesaw plan, its dotLinesData lines, dotTips.ts references; HAND_STAGES has no '1-6'). Start AFTER t-build-16 lands in t-int-7 so the new 1-6 lines are not touched; grep proves nothing else reads them.
5. Full CLAUDE.md Checks. GREEN or exactly what is red. BOX: 90 minutes or 40% context (400k of 1M). D57, D59, D61-D67.
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
