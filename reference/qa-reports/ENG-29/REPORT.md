# ENG-29 REPORT: 2-9's NEW 1 (the court's tempo) and NEW 2 (the drum you hear), built ahead (R-165.449)

## EXACT NEXT STEP (session 2 hand-over, 2:18 PM ET; NEW 1 (c) and the resume toy DONE; NEW 2 (b)'s pure schedule DONE; all pushed)
Re-fetch t-eng-29-wip first. The lead's answer on the drum (2-9.md:74): GAME TIME (built so: drum.ts DrumSchedule). Then, in order:
1. NEW 2 (b), the wiring (the schedule itself is done and proven, see Session 2): (a) conductor.ts: a `drumBus` GainNode to the sfx bus and
   `drumTick(tempo, easy, gameNow, doubled = false)`: `const r = this.drum.step({ beats: tempo.beats, beat: tempoBeat(tempo, easy) }, gameNow,
   core.ctx.currentTime, doubled)`; each cue `(c.kind === 'boom' ? taiko : woodblock)(core, this.drumBus, c.at, vel)` (instruments.ts:509, :447;
   never fx()); on `r.cut` or `drumHold(gameNow)` returning true: fade the bus out in ~20 ms, disconnect it, make a new one (the cut hits
   never sound). Guard every call for no audio core (headless). (b) src/game/audio.ts facade: `sound.drumTick(...)`, `sound.drumHold(g)`.
   (c) engine.ts: after `this.clock.step(dt)` (:1806) `if (stage.tempo) sound.drumTick(tempo, easy, this.gameTime)`; in the `if (this.down)`
   branch (:1802) the same call (game time stands: the backstop); and where a life is lost (where `this.down` is set) `sound.drumHold(this.gameTime)`
   (the toy 'without the engine's hold' shows why the hold must come from the engine). No stage id, seed or x (generalitycheck). (d) Tests:
   an engine toy on the tempo row (tempoResume.test.ts's runToy) with a spy on `sound` (drumTick called every step with the engine's
   gameTime, drumHold on a life lost, never on a stage with no tempo); a tempo stage raises no heroNoise 'drum' Sound. (e) The on-frame
   RED is still owed: model a late frame (two steps in one audio moment) and show a drum scheduled at the step that passes the beat lands a
   frame+ late while DrumSchedule's lookahead does not (or name it for READY-29).
2. Step 4: lockall (no listed stage moves: `court` is a new W2_RIVERS row no listed stage names), tsc, the suite shards + the CI tool line
   ONCE on the frozen head. Push; hash to the lead. Then the 1b merge the lead names, the planted toys re-run on it, and only then the bots.
STILL OPEN (name for READY-29 if not done): (a) the LOCKED let-go window (2-9.md:21: 2.00 s Normal, 2.40 s Easy): lianaDrops judges every
relative phase, not the locked one alone; (b) 2-9.md:21's 'river 5 frames ahead of the swing; Easy 0': TempoSpec has one `lock`; (c) the
twist's `doubled` has no data path yet (DrumSchedule takes it; nothing lays a twist cue).

## Session 2 (ENG-29-b), NEW 1 (c): the toy on a REAL row (level.md rule 23) and two checks the tempo lacked
- src/game/gen2/worlds/w2TempoToy.ts (the row; world data, generalitycheck exempt): 2-4's kit cut to its arrival, first drop and drop-ride-drop
  (every river on `court`), a pond of two snap stones on the court's bar (count 0.7125 s, Easy the court's stretch), a rest and the jetty; graph
  'A Tr Pf R S E' under BRIEF_24 with the court's tempo; World 2's finish. W2_RIVERS gets `court` (2-9.md:18: 80/156/72, Easy 70/159).
- src/game/gen2/tempoToy.test.ts 5/5: GREEN seeds 1-4 both settings (gen2.errors [], tempoFaults [], 9 lianas at the lock, 3+ court rivers,
  the stones' clock). RED by name in gen2.errors: speed 82 ('a log every 2.78 s is not a whole number of beats'); the stones' bar 3 s; a
  wave's stagger 0.178 s off. RED by the check gen2 runs (no data path sets them): a liana re-set to 0.618; the stones' clock offset 0.3 s
  (Easy 0.347 s). The same stage WITHOUT the tempo fails the check (the lay is what locks the lianas).
- tempo.ts, caught ahead: a stone's stagger (a wave's Platform.pad.shift) on a beat, a BREATHING row named (breathAim.ts turns it at every
  put-back, off the bar), and the WHEEL (the packet's 'the wheel' was unchecked): a bucket every whole number of beats, bucket 0 at the
  bottom on a beat. tempo.test.ts 6/6 (2-9.md's wheel rows GREEN both settings; R 170 and phase 0.5 named).
- riverSection.test.ts: the every-row test judged Easy by Normal's width; a row with its own Easy numbers lays Easy's (riverRowOn). 15/15.
- The resume toy (src/game/tempoResume.test.ts 1/1): the toy row (seed list planted, withTestStage) in the real engine: a straight run to
  flag 2, the phone cuts it off, the stage entered again there: game time kept, and for 90 frames every liana on the court's bar (its swing
  the bar, its phase the lock, its angle vineAngle at gameTime); RED with the liana clock shifted 0.3 s: every liana named 'off the bar'.
- NEW 2 (b), the schedule (src/audio/drum.ts DrumSchedule, DRUM_AHEAD two frames, DRUM_JUMP 0.25 s): every engine step re-anchors game time
  to the audio clock (at = audioNow + (g - gameNow)); game time standing schedules nothing and cuts what has not sounded; `hold` (the engine,
  the step a life is lost) cuts at once; an owed beat met as game time runs again sounds at once (at most a step late), a JUMP (a restart,
  a resume) never bursts. drum.test.ts 6/6: a minute both settings within a frame, each beat once; a life lost a frame before a beat and
  mid-bar, both settings: every hit on the clocks' beat, no burst; RED a WALL-time drum named (-0.7xx s off); RED without the engine's hold
  (the 8.25 s tok sounds inside the down).
- Gates on this head: tsc clean; generalitycheck PASS; riverLay + riverSection + tempo + tempoToy + tempoResume + drum green. The suite: not
  yet (step 2 above).

## Plan for NEW 2, the drum (hooks read in session 1; the pure part DONE: see the last line)
- A pure scheduler, src/audio/drum.ts: `drumHits(tempo, easy, g0, g1, doubled)` -> the hits with game time g in [g0, g1): ONE (beat index
  % tempo.beats === 0) a 'boom', the rest a 'tok'; doubled = every half beat (the twist, data on the cue). Test it alone (counts, kinds, every
  g on k*B exactly, both settings).
- The audio clock: Conductor (src/audio/conductor.ts:88) already runs a lookahead scheduler in its tick (`this.amb?.update(now + LOOKAHEAD)`,
  :659; LOOKAHEAD 0.6 s, :30). Add `drumTick(gameNow, audioNow)` beside it: schedule every hit with g in [scheduledTo, gameNow + LOOKAHEAD)
  at audio time `audioNow + (g - gameNow)` with instruments.ts `taiko` (:509, sampled bdrum) for BOOM and `woodblock` (:447) or `rim` (:420)
  for tok (DrumVoice: (core, dst, t, vel)); never through `fx()` (:393), which plays NOW and drops by MIN_GAP. The engine calls it each step
  with gameTime when stage.tempo is set (stageGenerator.ts `tempo`, set by gen2's finish).
- A lost life's down: gameTime stands (engine.ts DOWN_SECS 0.75 s): scheduledTo stays, so nothing past gameNow + LOOKAHEAD is ever
  scheduled twice and no beat is skipped; ASK THE LEAD whether 'holds through the down' means the drum keeps time over it (game time
  stands, so the next hits wait) or plays on in wall time; the stage clock standing argues for the first.
- NOT a heroNoise drum (heroNoise.ts:26 `drum: { r: 620, stun: 3 }`): a test that a tempo stage raises no 'drum' Sound.
- Toy: 60 s on both settings, every scheduled audio time minus its beat's audio time within one frame (1/30 s); RED with the drum scheduled
  on the frame (audioNow at the step that passes the beat) or on wall time.

## Step 0: the merge (1:47 PM ET)
t-eng-29-wip cut from origin/t-eng-28 = fda48b3d8; merged origin/release-0.10.3-wip-fixes = 4c73ac2ae (no force). Merge commit 791735cfa.
Three files conflicted, each resolved by hand:
1. src/game/engine.ts (1 hunk, the stage start): the fixes moved `this.startFollow()` to after the player is made (BUILD-23: called before
   the player existed, every stage with proto.follow threw); t-eng-28 had added `this.floodClock = ...` beside the old call. Kept the flood
   clock line, dropped the early `startFollow()` (the fixes' later call stays).
2. tools/inspect/firsttimer.ts (4 hunks, both sides added bot skills): the header doc keeps both (the fixes' HOP-BACK / FETCH-CLOCK /
   NO-LINE-GO, then ENG-28's LEAD-THE-LINE / KEEP-THE-ROAD); `LINE_SKILL` takes every key of both
   ({waitTail, fetch, leadLine, keepRoad, hopBack, fetchClock, noLineGo}); ENG-28's ROAD_TRIPS, FORK_READ, `reroute()`, `floodRoad()` kept
   beside the fixes' CAGE_SKILL, `vineReaches()`, `under()` and the cage move. No line of either side dropped.
3. tools/inspect/lineBot.test.ts (2 hunks): the import takes both sides' names (FT_CHILD and ROAD_TRIPS); both sides' appended tests kept
   (no duplicate top-level names).
tsc on the merge: clean. The suite (6 shards, frozen worktree): running.

## NEW 1 so far (session 1)
- (a) cb6610802: src/game/tempo.ts, the pure check `tempoFaults(st, tempo, easy)`: rivers (a log every whole number of beats, each log's knock
  on a beat), swinging lianas (the swing is the bar, the phase the lock), stage clocks (period whole beats, offset on a beat, Easy's stretch
  the tempo's). Each fault in words, e.g. 'the river at x 1000-1756 (82 px/s, 156 px logs, a log every 2.78 s): a log every 2.78 s is not a
  whole number of beats (the beat 0.7125 s: 3.9 beats)'. src/game/tempo.test.ts on a river laid by the real layRiver with the court row:
  GREEN both settings; RED by name with speed 80 -> 82, the Normal row on Easy, the liana unlocked / no phase / its own period, a log's knock
  0.2 s off, a clock's offset 0.3 s off, a clock of 2.7125 s, Easy's stretch 1.5. 4/4 pass.
- (b) 14ebbfa5e: GraphBrief.tempo (gen2/types.ts) laid LAST in gen2's finish (pipeline.ts layChaseStage: tempo.ts layTempo sets every swinging
  liana's swingPeriod to the bar and swingPhase to the lock, then tempoFaults into the problems); the built stage carries `tempo`
  (stageGenerator.ts) for NEW 2's drum. RiverRow.easy + riverRowOn (riverLay.ts), read at both of the pipeline's river-row reads: a court
  river's own Easy numbers (its speed never stretches). No listed stage names a tempo or an `easy` row, so nothing laid today changes
  (lockall to prove it in step 4). tsc clean; tempo.test + riverLay.test 8/8.
- NEW 2 (a), session 1: src/audio/drum.ts `drumHits(beat, g0, g1, doubled)` (ONE a boom, the rest a tok; hit k exactly k * step, by index, so a
  minute drifts by nothing) and src/audio/drum.test.ts: a minute on both settings, every hit on its beat; windows a frame apart schedule every
  hit once; the twist doubles (8 a bar, ONE the boom). 2/2. Not yet: the conductor's drumTick on the audio clock, the engine's call, the
  planted RED (on the frame / wall time), the no-'drum'-Sound test.
