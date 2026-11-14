# BUILD-17 REPORT: 1-7 A Very Good Bush (R-165.204): Step 0 redos + the level. Opus 5.5 high. 12:31 PM to ~2:10 PM ET 11-14
Branch t-build-17 from t-eng-e2@1f66e7a9. Code head of the gates: 8995a732 (+ aa377280: tools/inspect only, its gates re-run: see Gates).
Lessons applied: D36 (frozen worktrees for gates, shots, plants), D40 (Step 0 first), D49, D57, D59, D61/D65/D69 (every caption prints its state), D67.

## EXACT NEXT STEP
1. Merge 1-6's StageSpec.gathers (t-build-16) and give 1-7 `gathers: 'petals'` in stagePlan: then its exit seals and SEALED_17 ('1:stealth') speaks.
2. Registration left (addlevel/registrycheck): **flown** (`FLIGHT_STAGE=1-7 npx tsx reference/specs/sims/flight.ts normal all`, rows in
   flownArcs.ts, `judged: 'normal-1-7'`); **drawcheck** (add "1-7" to tools/perf/limits.json scenarios, the Critic's file); **sheets**: a listed
   stage never reads STAGE_DRAWS (stageSheets.ts:192 is in the `built` branch only), so 1-7's props2 (its bushes) is not preloaded: an Engine
   packet: listed stages take their STAGE_DRAWS row (registrycheck --stage 1-7 then clean).
3. `addlevel 1-7 --relist` after 2, with the bots (1-40).

## ENGINE-WORTHY (level.md rule 22: workarounds in 1-7's data the next level would also need; NOT moved, for the integrator)
1. w1Arc17.ts:274 the still finish (clipWatches + castWatches) runs in finish17: World 1 has no decorate pass, so every W1 stealth stage repeats it; it belongs in w1World's kit.
2. w1Arc17.ts:288 W17_JOIN: a watched stretch ends at a gap (stillLay watchedRun), so a beat whose question crosses a gap needs a socket/row option "watch across gaps".
3. w1Arc17.ts:286 lianas marked mossy by section tag in the finish: no SectionPiece field carries `mossy` to Vine; a `mossy` place option on 'swing'.
4. w1Arc17.ts:305 the perched eagle swapped in by the finish, its snag put on open bark: castWatches/WatchRow has no `perch` option.
5. w1Arc17.ts:310 Easy's free first pass on every stretch: WatchRow.free has only 'lesson'; an 'easy-all' value.
6. w1Arc17.ts:322 each still prop tagged with its own id so a socket asks for one cover kind: stillProps tags only hide/cover.
7. w1Arc17.ts:107 lineId (`w17.<key>`): a kit tip whose id equals a move lesson ('creak', 'swing') is silently never said (pipeline tips vs lessons).
8. w1Arc17.ts:95 rock(): the quiet line (tools/inspect deadTime) counts hops, never hiding, so stealth stretches need hop props to pass it.
9. w1Arc17.ts:85 liana(): 1-6's SHORT perch + drop is re-written here; w1Swing.ts should export lianaRun.
10. stageSheets.ts:192: listed stages never read STAGE_DRAWS (1-7's props2 not preloaded); registrycheck names it.

## Done-items
| Item | Evidence |
|---|---|
| Step 0.1 perch clear of the HUD by >= 24 px | SNAG_PERCH 56 / snagB.perch 712 (90 cleared 4 px sideways at zoom 0.763). shoot-perch captions: sideways CLEAR 30 px, upright 387, every perched still PASS. Lead PASS 1:21 PM. ENGINE LINES sweepPose.ts:45, w17Art.ts:46 |
| Step 0.2 hanging + liana stills | Real defect found: hanging moss NEVER hid him (the cast's hero: holding excluded p.hanging). Fixed engine.ts:4625-4626, stillness.ts:32+44 (a creep along the rope is moving), castPlay.ts CastHero.hanging; hangCover.test.ts. Stills: hanging true calmNow 1 Dot's box gone; liana swinging true calmNow 1; both ways. Lead PASS |
| w1Arc17 | gen2/worlds/w1Arc17.ts: `A T M R X R P C R W R S R L E` (1-7.md's two T beats are one brick: V2 allows one teach); kitLib17 + finish17 (World 1's still finish, mossy lianas, one eye over a beat's gaps, the perch on open bark, Easy free first passes); stage-table row, listed kit. Old 1-7 deleted (protoStage plan + 3 builders, w1Sections rows, stage17.test + 1-7 tests in qaW123/watcher; bankCull now on 3-3) |
| Dot's lines verbatim | reference/story/lines-1-7.md byte-for-byte from t-keeper-17@a8dd2409; w1Arc17.test parses it: LINES_17, SEALED_17, MISSION_17 equal; no "hold still"/"only sees what moves"; 9b keyed '1:stealth' never '1:harvest'; journal, way.1-7, wayside, GAP-MAP rewritten; 1-7-only crouch rows deleted (eng.watch.*.bush stay: World 6/8 watcher zones say them) |
| Teach 800+ px, nothing between | w1Arc17.test: 7 teach lines each >= 800 px before its beat's eye, no eagle between, seeds 1-4 both settings |
| Rolls / list | libstage 24/24 clean both settings, 1 beat order, 196-203 s Normal; seed list 100/100, `--check` PASS, quiet line worst 3.8 s |
| Meter | Normal 5.4 (5.1-5.7), Easy 2.3 (2.2-2.4), seeds 1-4 (on 6213af67, before SHORT lianas; lianas counted as swings, R-165.239) |
| Bots | BUILD-16c's c8f67aa7 + 5b0b1121 cherry-picked; mine: hold a MOSSY liana through the look; climb back out of a shallow pit whose far wall is over a double (pitClimb.test "shallow pit", RED without). Seeds 1-12 both settings on c01dbf6f: 106/108; Normal 6 kid ACCEPTED by the lead (moved under the look, knocked off 3x: beat 10's test); Easy 11 FIXED: on aa377280 (bots12b.jsonl) 107/108, kid Easy 12/12, the only rescue the accepted kid Normal 6; every other bot 12/12 both settings |
| Planted faults | planted-faults.py: 14/14 CAUGHT (planted.out.txt + the snag fault) |
| Stills / clips | stills/: 9 beats x upright/sideways x Normal/Easy, each caption the game's state; clips/: bush, bare bark, creaky limb, mossy liana, perch, both ways (clips.log names the frame of each look) |

## Polish check (stills/, judged at 1x)
PASS: bare bark (no tint, seen), moss carpet (tinted, hidden), mossy liana (swinging, tinted), perch (snag on open bark, whole eagle under the
HUD sideways), creaky limb (on it, the dive's tell). ROUGH, named: (a) Dot's box covers the lower or upper screen in many stills: the shooter
puts him past each line's spot, so the line fires as the still is taken (captions say "dismissed" from before it fired): in play the line
comes 800 px earlier; (b) a second eagle (the next stretch's) in view at beat 12 on one still; (c) the perch CLIP missed the look (frame -1);
(d) the arrival's far-off screech is not laid (no sound-only cue in the kit; Dot's line names it).

## Pushback
1-7.md's LONG-gap lianas ask 1-6's low hold, which 1-7 never teaches: laid SHORT (any hold flies; the question is the hide). Easy 2.3 is under ~3 (allowed: <= 0.6 x N).

## Unresolved
Gathers seal (step 1); 3 registrations (step 2); movesJournal.ts:237 still opens the crouch 'hide' page on hint.1-7.hide (kept: dotGuide.test reads it).

## Learned (proposed level.md rules)
1. A kit tip id equal to a move lesson ('creak', 'swing') is never said: a stage's lines get their own ids (check: the stage test that every line is said).
2. A watched stretch ends at a gap: a beat whose question is across a gap joins its eye in the finish. 3. The quiet line counts hops, not hiding:
a stealth stretch gets a 50-56 px stump about every 1000 px (a 34-40 px rock is walked over). 4. A bot rule steering toward ground checks his
hands first. 5. Place a sweeper's snag on open bark (never on cover). 6. A shooter that teleports must also let go of vines and wait out lines.

## Turnover
reference/handoffs/engine-core.md section 0x.
