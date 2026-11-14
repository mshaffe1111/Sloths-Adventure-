# BUILD-17 REPORT: 1-7 A Very Good Bush (R-165.204), Step 0 redos + the level. Opus 5.5 high. 12:31 PM to ~2:00 PM ET 11-14
Branch t-build-17 from t-eng-e2@1f66e7a9. Code head (gates): 25f953c2. Lessons applied: D36 (frozen worktrees for gates, shots, plants), D40 (Step 0 first),
D49 (flags typed from the rules), D57, D59 (gates on the exact head), D61/D65/D69 (each still prints the state that proves it), D67 (no wait loops).

## EXACT NEXT STEP
1. **Bots: RED, 0-rescue rule not met.** On 7871ac16 (seeds 1-6, both settings) every rescue is at a liana: after a missed swing the bot lands in
   World 1's moss pit and will not climb the root stair back (BUILD-16b's open item, the lead's 11:43 ruling "bot climb-back fix first";
   t-build-16 REPORT step 1). Fix that bot (tools/inspect/firsttimer.ts), then `npx tsx tools/engine/addlevel.ts 1-7 --relist` (bots 1-40).
2. Merge 1-6's StageSpec.gathers (t-build-16) and give 1-7 `gathers: 'petals'`: then its exit seals and SEALED_17 ('1:stealth') speaks.
3. Fly 1-7 (registrycheck: "not judged"): `FLIGHT_STAGE=1-7 npx tsx reference/specs/sims/flight.ts normal all`; drawcheck scenario + sheets (registrycheck lists them).

## Done-items
| Item | Evidence |
|---|---|
| Step 0.1 perch clear of HUD >= 24 px both ways | SNAG_PERCH 56 / snagB.perch 712 (90 cleared by only 4 px sideways at zoom 0.763). shoot-perch.mjs captions: perched sideways CLEAR 30 px, upright 387 px, every perched still PASS. ENGINE LINES: sweepPose.ts:45, w17Art.ts:46 |
| Step 0.2 hanging + liana stills | Found a real defect: hanging moss NEVER hid him (engine.ts stepCast holding excluded p.hanging). Fixed engine.ts:4625-4626, stillness.ts:32+44 (a creep along the rope is moving), castPlay.ts CastHero.hanging; hangCover.test.ts (2 planted faults CAUGHT). Stills: hanging true, calmNow 1, Dot's box dismissed; mossy liana isVineSwinging true, calmNow 1; both ways (shots/) |
| w1Arc17 (World 1 data) | src/game/gen2/worlds/w1Arc17.ts: graph `A T M R X R P C R W R S R L E` (1-7.md's two T beats are one brick: V2 allows one teach); 9 eagles a roll (kit, castWatches), 2 taught free (Normal), all free first on Easy; perched eagle at beat 12; 4 mossy lianas Normal / 2 Easy; creaky limbs Normal, sound boughs Easy; old 1-7 deleted (protoStage, w1Sections, 4 tests) |
| Dot's lines verbatim | reference/story/lines-1-7.md copied byte-for-byte from t-keeper-17@a8dd2409 (sha1 0133148); w1Arc17.test parses it and holds LINES_17/SEALED_17/MISSION_17 equal; no "hold still", no "only sees what moves"; 9b keyed '1:stealth' (World 1's only stealth stage), never '1:harvest'; journal + way.1-7 + GAP-MAP rewritten; 1-7-only crouch rows deleted |
| Teach 800+ px, nothing between | w1Arc17.test "Dot teaches BEFORE": 7 teach lines, each >= 800 px before its beat's eye, no eagle watching between, seeds 1-4 both settings |
| Green spacing | test: open bark <= 360 (Easy 300) on every watched beat; bare bark 400-480 (Easy <= 320) |
| libstage | 24/24 clean both settings, 1 beat order (the arc), 196-203 s Normal, 191-198 s Easy |
| Meter (score.ts) | Normal 5.4 (5.1-5.7), Easy 2.3 (2.2-2.4), seeds 1-4 on 6213af67 (before the lianas went SHORT; re-run owed). Lianas counted as swings, R-165.239 named |
| Planted faults | planted-faults.py: see planted.out.txt |
| Gates | gates.sh on 25f953c2: see gates.log |

## Polish check (stills/, each caption prints the state)
(filled at the end of the box)

## Pushback
- The packet's "Easy ~3": 2.3 measured; Easy at 0.6 x Normal is 3.3, under it is allowed. - The arrival's "far-off screech, no shadow" is not laid
  (no sound-only cue exists in the kit); Dot's arrive line names it. - 1-7.md's LONG-gap lianas ask 1-6's low hold, which 1-7 never teaches: SHORT gaps.

## Unresolved (named plainly)
Bots red (above). Goal seal waits for gathers. movesJournal.ts:237 opens the crouch 'hide' page on hint.1-7.hide (kept: dotGuide.test and the
journal read its text); eng.watch.*.bush stay (World 6/8 watcher zones say them). Arrival screech. Clips: clips/ (see Polish).

## Learned (proposed level.md rules)
1. A kit tip id equal to a move lesson ('creak', 'swing') is silently never said: give a stage's lines their own ids. (Check: the stage test that every line is said.)
2. A watched stretch ends at a gap: a beat whose question is across a gap needs its eye joined in the finish. 3. The quiet line counts hops, not
hiding: a stealth stretch needs a 50 px stump to hop every ~1000 px (a 34-40 px rock is walked over and counts nothing).
4. Any bot rule that steers toward ground must check what his hands hold first (the hide rule dropped bots off lianas).

## Turnover
reference/handoffs/engine-core.md section 0x (commit 25f953c2).
