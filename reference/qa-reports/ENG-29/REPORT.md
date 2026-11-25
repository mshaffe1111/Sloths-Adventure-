# ENG-29 REPORT: 2-9's NEW 1 (the court's tempo) and NEW 2 (the drum you hear), built ahead (R-165.449)

## EXACT NEXT STEP (session 3 hand-over; NEW 2 WIRED; the gates ran ONCE on the frozen head 39cd60123: ONE red outside the base set, STOPPED)
Re-fetch t-eng-29-wip first. Then, in order:
0. THE RED (not mine to wave through; the order said stop): src/game/gen2/listed.test.ts:52 'nothing in the game calls withTestStage: tests
   only' fails on src/game/gen2/worlds/w2TempoToy.ts (session 2's 1f919f98e). The file never CALLS it: two doc comments NAME it (:6 'The row a
   test builds with `withTestStage({ [TEMPO_ID]: tempoRow() }, ...)`', :18 'withTestStage refuses a listed one'), and the rule's scan is a
   plain text match. The fix (the file, never the rule, LAWS 22): reword both comments without the word (e.g. ':6 the row a test lays
   through listed.ts's test seam', ':18 the test seam refuses a listed one'); then listed.test.ts GREEN, and the planted RED: the word put
   back names the file. Comment-only, so no stage, roll or chunk can move; re-run the suite shard that holds listed.test.ts and the
   text-scanning tests the lead names (or the suite, the lead's call on the budget).
1. The 1b merge: merge the release-4 hash the lead names (it brings the bot fix: pacerLay 23/23) into t-eng-29-wip (no force); resolve by
   hand; tsc. Re-run the planted toys on the merge: tempo.test, tempoToy.test, tempoResume.test, drum.test, drumBus.test, drumEngine.test
   (each GREEN, and each planted RED still RED). Then lockall against the merge's own base and the suite shards + the CI tool line once:
   pacerLay must now be 23/23 and listed.test green (any red is a stop).
2. Only then packet step 3: the bots on 2-9.
3. At ENG-29's end: rewrite reference/handoffs/engine-core.md's tempo/drum entry (the drum's path: engine drumStep -> sound -> conductor
   drumTick -> DrumSchedule; the layering trap; DRUM_AHEAD 3 frames and why; the hold at loseLife). Not done in session 3.
STILL OPEN (name for READY-29 if not done): (a) the LOCKED let-go window (2-9.md:21: 2.00 s Normal, 2.40 s Easy): lianaDrops judges every
relative phase, not the locked one alone; (b) 2-9.md:21's 'river 5 frames ahead of the swing; Easy 0': TempoSpec has one `lock`; (c) the
twist's `doubled` has no data path yet (DrumSchedule and drumTick take it; nothing lays a twist cue, the engine passes none); (d) the drum
is only heard on the real page: no listening check yet (a clip of 2-9's court with sound, both settings, for the lead's ear); (e) hitstop
and the boss's slow motion step game time slower than the audio clock for a moment: the hits already ahead (at most 3 frames) sound a
little early there; 2-9 has no hitstop or slow motion on the court today.

## Session 3 (ENG-29-c), NEW 2 (b): the drum WIRED, on the audio clock (9b60aeac0)
- src/audio/conductor.ts: `drumTick(beat, gameNow, doubled?)` and `drumHold(gameNow)`; a `drumBus` GainNode (0.55) to the effects bus;
  each cue `(boom ? taiko : woodblock)(core, bus, at, boom 0.9 / tok 0.6)` (instruments.ts, never fx()). A cut (game time stands or goes
  back, or the engine's hold): the bus fades to 0 in 20 ms, is let go (disconnected 80 ms on) and the next hit gets a new bus, so the
  cut hits never sound. No core (headless), muted, or the context not running: nothing (the schedule starts again from game time, a
  jump, never a burst). The conductor takes the ENGINE's DrumBeat: nothing in src/audio imports the game.
- src/game/audio.ts: `sound.drumTick`, `sound.drumHold` (type-only import of DrumBeat).
- src/game/engine.ts: `drumStep()` (the stage's tempo -> its beat on this run's setting via tempo.ts tempoBeat, made once per tempo)
  after `this.clock.step(dt)` and in the `if (this.down)` branch after stepDown (game time standing: the backstop); `sound.drumHold(gameTime)`
  in loseLife where the down is set, on a stage with a tempo. No stage id, seed or x (generalitycheck PASS, 26 literals, 26 known).
- drum.ts, two fixes the on-frame model found: (1) DRUM_AHEAD 2 -> 3 frames: the loop (engine.ts) catches a late frame up in up to
  THREE steps in one audio moment, so a 2-frame stall's hits were never on the audio clock before it (they sounded up to 16.7 ms late);
  the down's drumHold cuts what is ahead, so the longer lookahead never sounds through a lost life. (2) the clocks' distance (audio less
  game time) is the least over the last DRUM_ANCHOR = 4 running steps, not the step alone: a late frame's first catch-up step sees game
  time a frame behind the audio clock, and a hit entering the lookahead then was anchored a frame late. Reset on a stand, a back, a jump
  and a hold.
- Tests (all GREEN; each RED planted and seen RED, then removed):
  - drum.test.ts 7/7: the new 'late frames' test, a minute of the real loop (a late frame every 7 or every 3 frames, 1 then 2 frames
    late, in turn), both settings: every hit within 1 ms of its beat, every beat 1-59 s once. RED by name: ON THE FRAME (the step that passes
    the beat: 'the hit at game x s sounds y ms late', the worst a frame or more); anchored on the step alone; two frames ahead.
  - drumBus.test.ts 3/3 (new): the conductor on a fake core: one bus to the effects bus, every hit at its beat on the audio clock, ONE the
    boom; the hold fades the bus in 20 ms and lets it go; through the down nothing; after it, a NEW bus and every hit on a beat of the new
    distance. Headless / muted / suspended: nothing, nothing thrown. The layering: no value import of ../game/ and no tempo.ts in src/audio
    (RED planted: `import { tempoBeat } from '../game/tempo.ts'` in drum.ts names 'drum.ts').
  - drumEngine.test.ts 2/2 (new): the toy's real row in the real engine with a spy on `sound`: 120 steps, a drumTick each with the engine's
    gameTime and the court's Normal beat (0.7125 s); loseLife('pit'): drumHold once at that game time; 10 down steps: drumTick each, game
    time standing; no heroNoise 'drum'. 1-1 (no tempo): no drumTick, no drumHold, a life lost included. RED planted: the hold removed;
    the down-branch call removed (each fails the first test).
- Gates ONCE on the frozen head 39cd60123 (a worktree at that hash, `git status` empty after every run):
  - tsc: clean.
  - lockall (base: the merge 791735cfa, before every ENG-29 commit, 3,264 builds of 102 stages; --layouts 16, nothing intended):
    102/102 stages unchanged, exit 0. (Its line 'gen2 gained verdicts and drops (not hashed)' lists every gen2 stage carrying verdicts,
    lockall.ts:29; not a change.)
  - The suite, 6 shards (the CLAUDE.md glob, 657 files, round robin): 4,223 tests, 4,216 pass, 4 fail, 3 todo. The 4: pacerLay.test.ts
    :190 (the 'normal seed 3' row), :254, :280 = the base set (D135's lines), AND listed.test.ts:52 on w2TempoToy.ts (step 0 above: a NEW
    red, session 2's, not in the base set).
  - The CI tool line (library, seedlist, yield, travelBots, paintFall): 57/57.
  - tierBots: 9/9.
  - BASE_PATH build: exit 0; chunkcheck: PASS.
- Session 1's '3 more neither pass nor fail' is most likely the same 3 todo this run counts (not checked on 791735cfa).
- My own slips this session (LESSONS rules I broke, no harm landed): one shell '&' (npm ci, the first call; the order says never) and one
  heredoc in the same && chain as `git commit` (9b60aeac0's message; D119). Both after that went through files and run_in_background.
- The chunk (on 9b60aeac0, the same code): BASE_PATH build + chunkcheck PASS; the drum's code is in assets/audio-*.js (99,927 B) and tempo.ts's code ('whole number of
  beats') is in assets/oldgen-*.js, not the audio chunk.

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
tsc on the merge: clean. The suite (6 shards, frozen worktree) on the merge 791735cfa: 4,199 tests, 4,193 pass, 3 fail = pacerLay rows
{8, 22, 23} = R-165.439's base set (release 4's bot fix makes pacerLay 23/23; the 1b merge brings it). (The record as the lead
gave it; the 3 more of 4,199 that are neither pass nor fail were not broken out.)

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
