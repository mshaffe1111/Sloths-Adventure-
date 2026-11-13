# PIECES: the bulk gameplay pieces the map needs, built general now (R-165.186, R-165.197). Fable 5.2 high (engine-fable).
Written 12:11 PM ET by the lead. Branch t-pieces from origin/ccr-ea739a2f-dfcee4. Plan (frozen): reference/plans/ENGINE-NEEDS.md section 2.
Why (Matt, 12:10 PM ET): "Look at what we can build into the engine now, and have... Fable put it together... to get this engine looking
ahead and not reacting... add variety throughout the whole game." Built on: main 0.9.7 + B14's beat clock (t-b14 "BEAT API", PLAN.md);
replaced this sprint by: none.
## Build, in this order, each as a GENERAL piece any world uses (look by world data), planted tests, proven on 2+ worlds' kits:
1. STILL (10 stages, 1-7 first): hide + watcher as world-neutral sockets; W6/W8 emitters move onto it (new replaces old).
2. CAST-WORLDS (lure 8, noise 4, trap 4): the predator registry by world; lure targets as sockets; landing noise by world data.
3. RIDE (11 stages, W2): ride.ts wired; logs, pads, lifts as pieces; rides read B14's beat clock.
4. ZONES-BY-DATA (dark 17 and more): SectionZone gains dark, spore, geyser, bolt, web, updraft, laid from data.
5. CLOCK-ON (20 stages): named clocks reach the engine; beat bricks (snap stones, sinking pads) laid from data, on B14's beat clock.
## Files and shared-file rule (TODAY.md tokens)
New files are yours (gen2/stillLay.ts, lureLay.ts, rideLay.ts, zoneLay.ts, beatLay.ts, predators/world*.ts, tests). src/game/engine.ts
(B14), gen2/pipeline.ts + gen2/types.ts (NODES-TRAVEL) are NOT yours tonight: write each hook as reference/qa-reports/PIECES/<file>.patch
(git diff), keep it byte-identical on your branch, tell the lead; the holder applies it. No shipped stage's lock or seed list moves.
Push each piece whole, one line to the lead each. Full CLAUDE.md Checks on your head at the end. Stop line 9 PM ET or 40% context: then
REPORT.md (30 lines + "Learned") + turnover note. Lean (TODAY.md). Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
