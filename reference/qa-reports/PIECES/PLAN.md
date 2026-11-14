# PIECES plan (t-pieces, Engine, written 12:16 PM ET). Built on main 0.9.7 + B14's beat clock (merged from t-b14 before piece 3); replaced this sprint by: none.
1. STILL: gen2/stillLay.ts: one data row per world prop (hide: bush kind + width; watch: calm, longest run, reach past the last hide, lesson and
   own-bank sockets, set-back) -> props, sockets, emitters, the pass-6 clip and stillFaults (a watched stretch always has a hide; the next hide is
   reached inside one calm). w6.ts and w8.ts drop their copies and call it; W1 gets its row in a fixture kit (w1.ts is B15's): 3 worlds, lock unchanged.
2. CAST-WORLDS: predators/registry.ts keyed by world (world2.ts.. register the casts.ts drafts where the map first meets them); gen2/lureLay.ts:
   a lure target (bait, perch) as a linked socket pair any kit names; landing noise read from the world's cast row, not a world number.
3. RIDE: gen2/rideLay.ts lays a log / pad / lift from a place row on a named clock; src/game/ridePlay.ts runs ride.ts in the engine (one
   block in engine.ts, by patch); rides subscribe to B14's StageClock (OnBeat) and pass beatFaults.
4. ZONES-BY-DATA: gen2/zoneLay.ts lays dark, spore, geyser, bolt, web, updraft from SectionZone rows (numbers from zones.ts recipes and
   levelCheck's rules); one line each in pipeline.ts and types.ts, by patch.
5. CLOCK-ON: gen2/beatLay.ts lays snap stones and sinking pads (beatBrick.ts) from data on a stage's named clocks; src/game/beatPlay.ts runs them.
Each piece: planted failing tests first, proven on 2+ worlds' kits, lockall unchanged for every shipped stage, seedlist 1-1 --check, stills both ways.
WRITE (new): src/game/gen2/stillLay.ts, lureLay.ts, rideLay.ts, zoneLay.ts, beatLay.ts (+ .test.ts each), src/game/predators/world2.ts..world10.ts,
  src/game/ridePlay.ts, beatPlay.ts (+ tests), reference/qa-reports/PIECES/*, PLAN.md, REPORT.md, PUSHBACK.md.
WRITE (existing, no holder today): gen2/worlds/w6.ts, w8.ts, w6Swing.ts (emitters only), predators/registry.ts, casts.ts, ride.ts, beatBrick.ts, zones.ts.
ASK (lead's word needed before I edit): src/game/castPlay.ts (one line: the landing-noise gate), reference/handoffs/engine-core.md (my turnover section).
BY PATCH ONLY (reference/qa-reports/PIECES/<file>.patch, byte-identical on my branch): src/game/engine.ts, src/game/types.ts (B14), gen2/pipeline.ts, gen2/types.ts (NODES-TRAVEL).
Pushback: the plan sizes these M, M, M, M, L (ENGINE-NEEDS.md:36-37: 14-22 h measured); the stop line is 9 PM. I build in the packet's order, push each whole, and name what is left.
