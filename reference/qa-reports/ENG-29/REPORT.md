# ENG-29 REPORT: 2-9's NEW 1 (the court's tempo) and NEW 2 (the drum you hear), built ahead (R-165.449)

## EXACT NEXT STEP (session 1 hand-over, head 14ebbfa5e)
Re-fetch t-eng-29-wip first (session 1 may push ONE REPORT-only commit with the merge's suite verdict). Then NEW 1 step (c), the toy on a REAL row:
1. `src/game/gen2/tempoToy.test.ts` (new): a stageTable row by `withTestStage` (src/game/gen2/listed.ts:84) whose kit is World 2's with 2-4's
   liana-over-a-river section (kit 'w2-24', w2Arc24.ts) plus a STONE row (2-5's snap jaws, kit 'w2-25' / w2Arc25.ts: its ClockDef on the stage's
   `clocks`), and a `court` river row `{ dir: 1, speed: 80, logW: 156, gap: 72, logs: 3, easy: { speed: 70, logW: 159 } }` (W2_RIVERS gets
   `court` with this; Content's numbers from 2-9.md:18), the brief carrying `tempo: { beats: 4, bar: 2.85, easyStretch: 3.3 / 2.85, lock: 0 }`.
   Pattern to copy: src/game/gen2/floodLay.test.ts:17-40 (a kit whose brief names the piece, built by buildGen2Stage). GREEN: gen2.errors []
   on seeds 1-4, both settings, AND tempoFaults(st, tempo, easy) [] AND every laid liana's swingPhase === lock. RED, each by name in
   gen2.errors: the court row's speed 80 -> 82 ('a log every 2.78 s is not a whole number of beats'); the liana unlocked (re-set swingPhase
   0.618 after the lay: 'not locked to the bar'); the stone clock's offset off a beat.
2. The resume toy (the third RED of 2-9.md's NEW 1): on that stage in the real engine (src/game/lianaClock.test.ts's harness:
   saveEngineHarness.ts run/standAt/step + flagResume.ts flagFor), after a flag resume the liana's ONE is on the bar:
   `tempoFaults` clean on the engine's vines AND vineAngle(v, e.vineClock) at gameTime k*bar equals the straight run's; RED with the engine's
   test seam `vineClock` set off the bar (vineShift 0.3 s): 'off the bar'. (vineClock already IS gameTime + a test-only shift, ENG-285.)
3. Then NEW 2 (the drum), see Plan below. tsc + the touched tests; push; ls-remote.
OPEN QUESTIONS: (a) ANSWERED in session 1: the lock in gen2's FINISH does not invalidate the river checks: lianaDrops
(riverLay.ts:326-342) judges every relative phase of swing and logs (j over one log spacing, m frames) with the period vinePeriod gives,
which is TIMED.period under withSetting = the bar. What NO check proves yet is the LOCKED relation's own let-go window (2-9.md:21: 2.00 s
Normal, 2.40 s Easy at the lock): add it to the toy in (1) as a done-item (lianaDrops at the locked offset only) or name it for READY-29.
(b) 2-9.md:21 says 'Locked (river 5 frames ahead of the swing;
Easy 0)': TempoSpec has ONE lock; if the design means a per-setting lock, add `easyLock` (or the river's offset) and a test.

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
