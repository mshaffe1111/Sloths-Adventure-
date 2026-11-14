# ADD-LEVEL (R-165.187): "add a level" in one step + a gate that fails when a registration is missing. Opus 5.5 high (engine; tools only).
Written 10:39 AM ET by the lead. Branch t-add-level from origin/ccr-ea739a2f-dfcee4. Plan: reference/plans/ENGINE-NEEDS.md §3 (the Architect's
packet, frozen: read it, and its cites). Why (Matt 10:26 AM): "2 hours from design until tests". Measured: 1-2 4 h 12 m, 1-3 8 h 20 m, of which
1-3's plumbing alone ~3 h 50 m (LEVEL-LOG.md); a new stage is registered by hand in 9+ places and nothing fails when one is missed.
Built on: main 0.9.7; replaced this sprint by: none.
## Done (ENGINE-NEEDS.md §3 items 1-3)
1. tools/engine/libstage.ts --stage <id>: one roll tool for any stage from its stageTable row (retires the per-stage copies; keep
   library13/14/15 working until their stages switch, then delete them in the same branch if their callers move).
2. tools/engine/addlevel.ts <id>: rolls 24 seeds both settings, records the seed list, runs castBots 1-40, prints the flight-sim command,
   lists every place the stage is missing from. Proved by replaying 1-3's registration in one step.
3. tools/engine/registrycheck.ts (gate + planted test: a planted missing drawcheck entry fails); gates.yml runs seedlist --check for EVERY
   list. gates.yml token: S1 holds it until it reports (soon); ask the lead before your gates.yml edit.
4. Tools only (no src/ change): LAWS 5 fast gates + the tools' own tests + the new gate. REPORT.md 30 lines; one line in methods/level.md
   proposed (the new one-step), with the lead approving. Stop line 9:30 PM ET.
B14 and B15 add 1-4/1-5 rows by hand today: your gate must pass on their rows when they land (or list them as named stand-ins).
