# B14 REPORT: 1-4 "Up the Kapok" (t-b14). Stopped at the 40%-context line (TODAY.md), WIP pushed. Times from `date`.
**EXACT NEXT STEP:** merge FA's "no runout beside an exit" + "no way past a shut gate" commit (lead sends it); re-run `castBots --stage 1-4 --seeds 1-6 --setting both --par 6` and fix what still rescues (below); then score.ts, seed list, drawcheck scenario, stills.
## Done (evidence)
1. t-lattice merged onto main 0.9.7 (c0342b3f); B15's engine hook applied (20a5f5f0); FA (eade2441), S1 final (5a856f68), ART (t-art-1113) merged.
2. Pieces, general (no stage ids): the stage beat `beat.ts` on clock.ts (engine builds `GeneratedStage.clocks`; hazards subscribe `{clock, shift}`;
   `beatFaults`); falling pods `podfall.ts` (tell 1.0 s / Easy 1.5 s by the beat's stretch, knock or heart by data, hit by held vines);
   the fig gate `vineField.ts ClusterGate` (shut = no footing, a notch per bunch, springs open; holds its way up and the lay's boughs at
   its height); `fieldPlay.ts` runs them; a freed bunch lands beside animals as a drop-trap load (`castPlay.loadLands`). Tests:
   podfall.test.ts, feelPairRoom.test.ts (touch + the bots' fig step), w1Arc14.test.ts; planted faults: planted-faults.py (see Gates).
3. Feel room v2 (pods, gates) built before the lead's 10:22 cut; kept only as the pieces' touch test bed. Stills: stills/room-*.jpg.
4. The level: `w1Arc14.ts` (own kit w1-14 + finish14 by piece tags; graph A T T R T T P R X R W R S R C E): **12/12 rolls clean and in
   beat order, both settings** (`tools/engine/library14.ts --seeds 12`). Hand-built 1-4 deleted (HAND_STAGES, squirrel lifts, w1Kapok,
   w1Sections rows, stage14*.test.ts); its nest door kept as the crown's dressing (artDress nestDoorAt). Words: the keeper's 4 Dot lines,
   Pokey's halfway (wayside + dotLinesData), journal 1-4. ART's pod, burst, fig bunch and rough bough placed (code shapes only while loading).
## Polish check (upright, Normal, seed 1, at 2c284fea: stills-14/port-s1..s16)
Fields, pods + fluff tell, figs, sagging shut boughs read at phone size. NOT yet judged: sideways, Easy, the painted pieces in place.
## Not done (named plainly)
Bots: castBots seeds 1-6 at ff881c5d: only middle/Normal 2/6 pass; first-timers hit by pods (adult Normal 134 hits) and rescued at
lay runouts beside gates (FA fixing). Score (score.ts granted: beat hazards as windowBits, figs as puzzle), seed list, drawcheck
scenario (limits.json, granted), sideways/Easy stills, hero-climb2 wiring (packed, not wired), flyer + ants, R-165.192 (figs as tools).
**Gates on 5a856f68:** tsc, roadmapcheck, knowncheck, generalitycheck PASS; planted faults 16/16 CAUGHT; 5-9 kid runs + 6-4 diversity
green (were red at 5cf14c9f: S1's earlier head). NOT run on this head: the full suite (at 5cf14c9f 7 red, 4 fixed since, routeHumps' CI
line is ADD-LEVEL's), the build, chunkcheck and the perf gates, the tool tests, seedlist/tierBots: cut at the stop line, named here.
**Pushback:** pods line was 10 words vs §5b.7 (keeper trimmed it); lay runouts beside gates (FA fixing); V2 forces one teach a content type.
## Learned / proposed level.md rules
- A tower stage: never assume a section sits on the floor; feet are boughs. Easy widens `landing` pieces: a field's foot is no landing.
- A flag spot is pad/2 in from a main bough's end and must sit 1500-2400 px of WAY before each hard beat: size rests for it.
- Stills: open a stage with `window.__play(id, layout)`, never autostart (a fresh save keeps it locked); no file saves while shooting.
- Bots read fig work and pod knocks as "stuck": the harness must know a stage's own mechanics (figPush.ts) before its numbers mean anything.
Method: level.md 1-5. Lessons: D50, D51, D41, D40, D23. Turnover: engine-core.md §0j.
