# FIX-B REPORT (t-fixb, base ccr-ea739a2f + t-fa@0f5b0550; code head 3e049dc5; written 12:49 PM ET 11-13; gates: see GATES below)
EXACT NEXT STEP: (1) B14b drops src/assets/ui/ctest-1-4.webp (880x425, real game, no HUD) + its CATALOG-MASTER.csv row (copy B4:ui/ctest-1-3's,
then `python3 tools/art/catalog_master.py --emit`); (2) 1-3 alt: keeper's "Pokey on a branch near a sleeping golden snake..." does NOT match my
still (he stands on the ground): reshoot him on a branch or keeper rewrites; ControlTestGate.tsx:121 holds my interim words (not the keeper's);
(3) R-165.122 fix B (perch rock off the walking line), packet below; (4) R-165.150 floor logs: engine walk-over packet; (5) proto.mix field
(protoStage.ts:213) goes with engine.ts's next change (engine.ts:937, :5783 read it; B14's token).
## Done (evidence)
- R-165.174 1-2 chains: measured on the REAL engine (FIXB/cadence.ts): a held or hands-off thumb carries every chain at a steady 0.7-0.83 s beat
  on every entry; root: ONE stray jump press (the bounce leaves him a jump) stopped him on the wood of the lesson's 70 px caps on 160 px stumps
  8-12/23 carried, finale 19/23. Fix (w1Arc12.ts CAP 110, the end chains' cap, every chain): lesson/again 18-21/23 = finale 18-21/23, Easy
  17-23/23 never falls, later chains harder (X 13/23) as Matt asked. Test w1Arc12Cadence.test.ts 4/4; planted CAP=70: 2 red. d3c63212.
- R-165.151 control course gone: stageGenerator CTEST_STAGE_ID + build, stageSheets ctestMixDraws/CTEST_FOES/switches, stagePreload mix code,
  protoStage 'ctest' plan (ctest region only); tests that only built it trimmed; builtOnArcs' old-builder fixture is now 1-1's hand plan (told>0
  holds). ctestCourseGone.test.ts: #ctest 1-2 = real 1-2 (planted: 2 red on old code). f173d0c3, 03c3a59a.
- R-165.157 #ctest: ONE data value playRecorder.ts CTEST_LEVEL_ID='1-4' ('1-3' fallback); App.tsx rolls a fresh layout per run; touchCoach
  coaches a new tester on that stage (was 1-1-only: a new tester got NO coaching; planted 2 red); ctestCoach.test.ts builds+plays the stage
  both settings; ControlTestGate CTEST_PAGES: keeper's cards verbatim (1-4 Climb/Two hands/Push the figs/Heads up; 1-3 Run/Jump/Punch/Drop a
  trap), each checked vs t-b14 vineField.ts + touchGestures.ts:13 (the bird line was untrue, keeper replaced it); still per stage via glob;
  ctest-1-3.webp shot from the real game; ctest-1-1.webp deleted + catalog row swapped (inventory.test caught it). b713b32a..3e049dc5.
- R-165.122 NOT shipped (lead's ruling C): probe FIXB/lowwalk.ts, 12 rolls x2 settings, real engine walk-through counts: 1-1 N 18 / E 13
  (perch rocks 41-46 px under mushrooms 9/4 + 24 px floor planks 9/9), 1-2 0, 1-3 33/33 (24-26 px logs). Perch at 50-56 made 1-1 0 rock
  walk-throughs, list 257/257, lock only 1-1+1-2, BUT forced a bounce to the seed bough on every run (+15 tier-bot rescues at w1-seed-perch):
  reverted c1defb0f; w1.ts, firstRun11.ts, calibration identical to base.
## Polish check
FIXB/stills/12-n-L1-*: lesson x3700 and finale x24950 sideways, again x5650 upright: the lesson's caps now the finale's mushroom. Rough,
not mine: Dot's card covers the lesson chain upright (R-165.140). ctest-1-3.webp: Pokey, the vine, the hive over a sleeping snake; his open-
mouth pose reads startled (acceptable, named).
## Pushback
- The packet's "R-165.150 = data patch" can't fix the 24-26 px logs: they are World 1's painted fallen log (level.md W1 note); only an engine
  walk-over (a solid <=30 px stepped onto by a walk) or a new log look fixes them: every stage's physics, its own packet.
## Suggestions (ready packets)
- R-165.122 B (Designer + Engine): seed perch's rock on a lip/step so the floor path passes beside it; done = lowwalk 1-1 0 rocks, no forced
  bounce (the seed bough optional: a held walk never lands on it), tierBots 0 new rescues, list re-checked, calibration recommitted.
- Inspector route (Critic): a "walk" segment across a mushroom is a bounce; route.ts models it so bots don't stall under a bough.
## Lessons applied: D37 (one pasted real run per claim), D29 (pinned tests after the list change), D40, D50 (coach at default), D54 (grep
the whole tree: found the catalog row), D30 (times from date). Method update (level.md, proposed): "a chain's caps are one width per stage;
judge a chain by a stray press, not only a held thumb"; "a W1 data change runs tierBots before it's called done".
Learned: measure what the player really does (stray presses), not the ideal input; a walk-through fix can move the route (forced bounce).
## GATES (head 3e049dc5): PENDING, filled below when the run ends.
