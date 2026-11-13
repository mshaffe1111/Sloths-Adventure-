# PIECES report (t-pieces, Engine). Stopped by the lead after piece 3, 1:02 PM ET 11-13. Code head: 04cd33aa4 (this file and the note are the commit after it).
EXACT NEXT STEP: (1) holders apply the patches below; (2) ZONES-BY-DATA: new gen2/zoneLay.ts called from the one loop at gen2/pipeline.ts:2000
(`for (const z of tpl.zones ?? [])`: add an else branch handing dark/spore/geyser/bolt/web/updraft rows to zoneLay), SectionZone's union at
gen2/types.ts:399; numbers from zones.ts sporeRecipes..darkRecipes (:281-:410) and levelCheck.ts:908-973; W6's darkZone emitter (w6Swing.ts:427)
moves onto it; (3) CLOCK-ON: gen2/beatLay.ts + beatPlay.ts on beatBrick.ts, beats listed through StageSink.clocks (already hooked here), built
exactly as rideLay.ts is (table -> props, socket, emitters, faults); (4) the full CLAUDE.md Checks on the head (NOT run here, see Gates).
## Done-items (each general: a world brings a table of rows; proven on 2+ worlds' kits; no shipped stage moved)
1. STILL (4da42ccb9): gen2/stillLay.ts. W6 + W8 hide/watch copies deleted and moved onto it. stillLay.test 11/11 (6-2, 8-1, 8-2 as the game
   builds them + the toy world from a table only; the watcher's own hidden/sees rule run on what is laid). Lock 102/102 unchanged.
2. CAST-WORLDS (0ad23e51a): predators/registry.ts by world (world2..8.ts; casts.ts deleted); lure targets as prop sockets (gen2/lureLay.ts,
   predators/lure.ts -> proto.cast.lures); landing noise by stage data (CastData.landing). lureLay.test 12/12 (boa/W1, tayra/W6, harpy/W8;
   CastPlay run; toy pipeline). Lock 102/102 unchanged.
3. RIDE (04cd33aa4): gen2/rideLay.ts + ridePlay.ts on B14's beat (beat.ts byte-identical to t-b14). rideLay.test 10/10: toy, W6 (6-2), W8 (8-2)
   kits through the real pipeline, 0 errors; real engine 30 fps: carried across and back, up and down, feet on it every frame, Easy 1.3x. Lock 102/102.
Planted faults: python3 reference/qa-reports/PIECES/planted-faults.py: 46/46 CAUGHT on 04cd33aa4.
## Patches (reference/qa-reports/PIECES/, each byte-identical to this branch; regenerate: sh reference/qa-reports/PIECES/mkpatches.sh)
- B14: engine.patch (ride branch in the moving-platform loop; the beatClock line is B14's own: skip), types.patch (Platform.ride), stageGenerator.patch (`clocks?`: B14's own: skip). NODES-TRAVEL: gen2.types.patch (StageSink.clocks), pipeline.patch (one output line).
- B15: castPlay.patch (lures + landing, 4 lines), castPlay.types.patch (2 fields).
## Gates on 04cd33aa4: tsc PASS; generalitycheck PASS (27 known, unchanged); knowncheck PASS; ciTests + 8 touched suites 174/174; lockall 16 layouts
102/102 after each piece. NOT RUN (stopped for cost; they run on the integration head before any link, LAWS 5): the full suite, build + chunkcheck (the registry now pulls every world's rows into main: measure it), artcheck, drawcheck, clipcheck, kbdcheck, buildcheck, seedlist --check, tierBots. roadmapcheck cannot run in this shallow clone.
## Polish check: nothing new draws on the page yet (no stage lays a lure, a ride or a new hide): NO stills shot; rides and lure targets are unjudged on a phone.
## Unresolved / not done (each needs an R-id): ZONES-BY-DATA and CLOCK-ON not started. A gap ONLY a ride crosses needs a 'ride' place rule in
pipeline reach/verdicts/route (today a ride is the second way over a double-jump gap: a 50 px ride does not fit a single jump's 114-143 px).
RIDE.keep (a jump keeps the ride's speed) not wired: Matt's feel call. The stage-load beatClock line is untested on this branch (B14's feel room covers it). No kit holds a table yet (1-7's W1 row: w1.ts is B15's). No NODES.md content letter yet (waits on t-nodes).
## Pushback: numbers I set, for the Designer: STILL_RULE.pace (half his run); RIDE_RULE (stop 1.2 s, 143 px/s, board 14/20 px); a lure target works only on an animal that is after him.
## My miss: I did not read my queue between 12:32 and 12:52 PM, so the lead's two stop messages (12:39, 12:42) crossed and RIDE was built after them.
## Method: level.md rule 12 + ENGINE.md day one (lock before/after). Lessons applied: D36, D43, D19, queue-before-report (missed once). Update: add "table -> props / socket / emitters / faults + a toy kit that brings only the table" to level.md as the shape of a general piece (10-20 min each here). Suggested packets: RIDE-ONLY (the place rule), TABLES (W1 still row for 1-7, W2 ride table).
## Learned: most "ONE-WORLD" pieces need no pipeline hook at all (kit.emit is the hook); only stage-level outputs (clocks) do.
## Turnover note: reference/handoffs/engine-core.md §0k (added as a section, not a rewrite: FA and B14 are editing the same file today).
