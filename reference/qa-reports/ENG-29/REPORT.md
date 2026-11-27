# ENG-29 REPORT: 2-9's NEW 1 (the court's tempo) and NEW 2 (the drum you hear), built ahead (R-165.449)

## ENG-29-g (box 3, ENG-29-e's packet; 7:29 PM ET Thu 11/26 by `date`): G6 CODED on wip (ca30a4885), NOT landed: the model and the bar's engine read judge DIFFERENT inputs

### EXACT NEXT STEP (box 4)
Re-fetch t-eng-29-wip (head: this REPORT commit; G6 code = ca30a4885 + cf09bd54a, the model on its own input). Run ReadNotifications.
The lead ruled: G6 does NOT land while the model can be looser than the engine; the model never looser on the draft at 0.88 / 0.90 /
0.92, both settings; the real-engine fallback is the lead's call (bring its cost per roll against the model's if the model is not
matched by the end of box 4). The lead's answer on WHICH INPUT the gate judges (asked in the hand-over message) may be in the queue.
`git ls-remote origin t-eng-29`: if it is box 2's landing (d1038af49), merge it into wip. Then:
1. THE MODEL'S INPUT IS NOW MATCHED (below, 'the model's own input'): within 1-2 frames at every band edge, 4/4 Normal liana-grips at
   0.92 seed 1. What is left on that input: the engine's SINGLE-FRAME water holes the model never shows (x14389 grip 0.95: j +4 on 1 bar;
   the '#.#.#.#' run round ONE on some bars with the jump released on the vine, oneMarginR-flick-0.92.txt). Chase one: trace it
   (probes/oneMarginR.ts TRACE=14389 GRIP=0.95 TJ=4 HOLDVINE=1 RIGHT=1 FLICK=1) against probes/fly29.ts (OWN=1 GRIP=0.95) frame by frame;
   a 1-frame hole is either an engine catch quirk the model should carry (then the model reads it) or a harness carry-over.
2. Then re-read the engine on the model's input at 0.88 / 0.90 / 0.92, Normal and Easy, seeds 1-2 (LOCK29 env in the scratch tree:
   t-build-29 + wip + barge29 look 'barge' + `lock: Number(process.env.LOCK29 ?? 0.92)`; node_modules symlinked), and the model's
   (probes/model29.ts); never looser = the model's early/late <= the engine's at every lock and setting; say both and the bar to the
   lead (the 0.20 / 0.30 s bar was read on ANOTHER input, below).
3. If the lead rules the gate must ALSO judge box 2's input (a tap: jump on the press frame only, nothing held): probes/nodir-model.patch
   is a start (no air steering) but it still climbs through the hold; that input also needs pressClimb for ONE frame only (the engine
   climbs only while jump is held). Not built.
4. Then the gates and the landing as box 2's steps 5-6 (6 shards, CI #93; KID_RUNS_59 named; the freeze trap).

### Done this box (pushed to t-eng-29-wip, ls-remote-confirmed)
- **G6 coded** (ca30a4885): riverLay lockedDrops reports `early` and `late` (s): the landing presses contiguous with the press on ONE
  on each side, read round the joint cycle, worst over LIANA_RIVER.grips and the cycle's swings, 0 where ONE misses (`one` kept).
  tempo.ts ONE_MARGIN { normal 0.2, easy 0.3 } (the lead's ruling cited); tempoFaults refuses each short side by name: 'the liana at
  x .. over the river at x ..-..: a press on ONE keeps 0.133 s late, under the 0.2 s a side Normal needs (ONE's margin: ..)'.
  Toy src/game/gen2/oneMargin.test.ts (3): the bar (Easy never under Normal); the tempo toy at its lock 0 GREEN seeds 1-4 both settings
  (model Normal 0.40 / 0.33, Easy 1.40 / 0.40); REFUSED at lock 0.06 by name (ONE still lands, `one` true: the old check is blind;
  Normal late 0.13, Easy late 0.17). PLANTED RED (the refusal filtered to nothing): 'normal seed 1'. tempo.test.ts:33 (the 82 px/s
  row: exactly one fault) now also gets the drifting row's liana fault (0.033 s early), a true fault: the test keeps its count on the
  non-margin faults. tsc clean; tempo, gen2 tempo, tempoToy, lianaRiver, bargeRow, tempoResume, drumDouble 30/30.
- **THE CHECK (scratch: t-build-29 + ca30a4885 + barge29 look 'barge', TEMPO_29.lock from env LOCK29; probes/model29.ts)**, model worst
  early / late, seeds 1-2: 0.92 Normal 0.83 / 0.70 (box 2's engine read 0.37 / 0.17), Easy 1.20 / 0.77 (0.47 / 0.23); 0.90 Normal
  0.83 / 0.20 (0.30 / 0.23), Easy 1.17 / 1.90 (0.37 / 0.33); 0.88 Normal 0.77 / 0.00 (0.20 / 0.33; the model REFUSES x14389). Looser
  at 0.92: the gate as coded passes the lock the bar's read fails. Said to the lead before any landing.
- **WHY (found, probes/fly29.ts, grid29.ts, oneMarginR.ts)**: box 2's engine probe presses with NO direction held and flies with
  nothing held (leap toward p.facing, no air steering); the model flies the press with Right held and jump released (a flick). Same
  press, x7903 grip 0.95 at ONE: the model's launch x 7889.8 y 750.3 vx 520 vy -562 at 5.891 s; the engine's x 7886.9 y 758.1 vx 520
  vy -563 three frames after the press (the same hold to the sweet spot); the river within 1 px. With jump HELD in flight the engine
  GLIDES (vy capped 125 from frame 15) and overshoots to ground at x 8488 (oneMarginR-righthold-J20-0.92.txt): a third input again.
- **The engine on the MODEL's input (the flick; oneMarginR-flick-0.92.txt, seeds 1-2, 4 bars, j +-45)**: Normal x7903 grip 0.7
  1.07 / 1.00 s, grip 0.95 1.17 / 0.70, x14389 grip 0.7 0.90 / 1.27; Easy 1.23-1.50 a side. The grids match the model's
  (grid29-0.92-normal.txt) within about 2 frames on those. The exception: x14389 grip 0.95, the engine '#.#.#.#.#' round ONE (water
  every other frame on the first bar). It moves with the bar the probe starts on: 1 bar per press, MOFF 0 and 2 alternate, MOFF 1 all
  land; with 4 bars MOFF 1 ONE misses (water, j -5..1). The river is one log a bar (3 logs, 228 px pitch at 80 px/s = 2.85 s), so a
  bar-periodic court should not move: unexplained (a harness carry-over or an engine clock that is not the bar's). NOT chased further.
- **The no-direction flight in the engine (traces)**: j +8 at x7903 grip 0.7: vx stays 520 the whole flight (no air steering) and he
  lands in the gap at about x 8290 (water); with Right held vx falls to about 280 (maxRun) and he lands on the log. The model with
  `dir` 0 (probes/nodir-model.patch, NOT applied) reads x7903 grip 0.7 '############.....................########................
  ########################...#######' against the engine's '###########....................####################.....#####...':
  the bands agree, the run round ONE does not (the model misses ONE; the engine lands it on the log's last px).
- **THE INPUT, found (probes/fly29.ts, oneMarginR.ts HOLDVINE)**: the model's press is Right held, jump HELD while he is on the vine
  (pressClimb: his grip climbs through the sweet-spot hold) and released in flight (flyLaunch: no glide). Box 2's probe held jump on the
  press frame only: no climb, launch 27 px lower at grip 0.7 (engine y 675.7 against the model's 648.6, x and v the same), so the flight
  lands a frame sooner. **On the model's own input the engine matches it** (oneMarginR-modelinput-0.92-normal-s1.txt, Normal, seed 1,
  1 bar, j +-45): x7903 grip 0.7 '#########....######...' engine vs '##########.....#####...' model; grip 0.95, x14389 0.7 and 0.95 the
  same within 1-2 frames at each band edge. Engine margins on that input: x7903 1.07 / 1.50 and 1.20 / 0.70, x14389 0.90 / 1.27 and
  1.00 / **0.10** (a single-frame hole at j +4 the model does not show: the one place the model is looser).
- On the flick, the engine would pass 2-9's lock 0.92 (except the flicker), so the 0.20 / 0.30 s bar and "0.92 refused" stand on
  the no-direction read only. The input is the lead's call (asked, with (c) as the default).

## ENG-29-f (box 2, ENG-29-e's packet; hand-over 7:14 PM ET Thu 11/26 by `date`): ruling 0, G1 and G3's tempo fix DONE; G6 MEASURED and RULED (code: box 3); d1038af49 landing

### EXACT NEXT STEP (box 3)
Re-fetch t-eng-29-wip (head: this REPORT commit). Run ReadNotifications. Box 2 handed over with d1038af49's gates running and its landing
on t-eng-29 to follow (the lead's order: d1038af49 = G2, G3 + the tempo fix, ruling 0's toy, G1; KID_RUNS_59 the only inherited red). If
`git ls-remote origin t-eng-29` is not d1038af49, check the box-2 hand-over message for the gate totals and land it first (no force).
Then **G6, the lead's bar (RULED, from the real-engine read below)**, as its OWN candidate on wip:
1. riverLay.ts lockedDrops reports `early` and `late` (s): the landing presses contiguous with the press on ONE (k1) on each side, the
   index i = r*n + k read round the joint cycle (consecutive i are consecutive frames), worst (least) over LIANA_RIVER.grips and the
   cycle's swings. Keep `one`. (riverLay/tempo code only: rideLay.ts SNAP_LAY/SNAP_FAIR/snapFaults are ENG-STONE29's, do not touch.)
2. tempo.ts tempoFaults (via riverLay lockedLianas) refuses a court liana whose ONE press has under **0.20 s early OR late on Normal,
   0.30 s on Easy** (a constant with the lead's ruling cited; Easy never under Normal), the fault naming the liana, the side and both numbers.
3. Toys each way (gen2/tempoToy or a new gen2/oneMargin.test.ts): the tempo toy's court liana at a lock that passes and one that fails
   (find them with the model, e.g. sweep lock 0.80-0.98), RED with the refusal ignored. And the CHECK the lead asked for: the model's
   early/late on 2-9's draft is never looser (larger) than the real engine's read (probes/oneMargin-0.92.txt and the lock sweep below:
   0.92 Normal 0.37/0.17, Easy 0.47/0.23; 0.90 Normal 0.30/0.23, Easy 0.37/0.33; 0.88 Normal 0.20/0.33, Easy 0.30/0.43). The draft lives
   on t-build-29 only, so this check runs in the scratch tree (t-build-29 + wip + barge29 look 'barge') and its numbers go in the REPORT;
   if the model reads looser than the engine anywhere, say so to the lead before landing (the gate would pass a lock the engine fails).
4. lockall --check: no listed stage moves (no listed stage has a locked court liana besides the tempo toy's tests; confirm).
5. Full gates on THAT hash with each shard's totals (CI #93): tsc; the CI tool line; the suite in 6 shards (KID_RUNS_59 named,
   R-165.473); lockall --check; tierBots 9/9; generalitycheck; drawcheck. FREEZE TRAP: src/game/gen2/seedListChunk.test.ts:50 mkdtemp's
   src/game/gen2/proven/planted-XXXXXX, so under a chattr-frozen src it fails EPERM; re-run that one file on an unfrozen worktree of the
   same hash (box 2 did: 2/2 green, tree clean after). The lead is logging the root fix (the test writes to the OS temp dir).
6. Land on t-eng-29 (no force); the hash and what BUILD-29 can lay (TEMPO_29.lock 0.90, flown before use) to the lead.

### Done this box (each pushed to t-eng-29-wip and ls-remote-confirmed)
- **Ruling 0, the posted row's bag exclusion PROVEN** (c46f0a7a): postedGuard.test.ts 'the bag never deals the posted row': the tempo
  toy's stones bank with two OPEN enemy sockets (no allow) over a bag holding a plain turtle (minGround 60, threat 1), with and without
  W2_POSTED_GUARD in the world's list, both settings, seeds 1-4: no royal/uncounted/posted foe dealt, the same foes laid, Normal deals a
  turtle every seed. PLANTED RED (castRows `bag = M.creatures`): 'normal seed 2: the bag dealt the posted row (turtle-royal@4471,775)'.
  postedGuard.test 6/6 green.
- **G1 the twist's doubled drum** (65f7c0187): TempoSpec.doubleIn (the brief's section mark: template ids) and TempoSpec.double (the laid
  x spans, written by the pipeline only); tempo.ts doubleSpans (placed sections of the mark, touching ones merged; a mark laying nothing
  fails the roll by name 'tempo: the drum doubles in ...') and drumDoubled; pipeline.ts lays them on st.tempo; engine.ts drumStep passes
  `doubled` while his middle is inside a span, both settings. Toy src/game/drumDouble.test.ts (2): doubleSpans/drumDoubled unit; the REAL
  engine on the tempo toy with its stones marked, Normal and Easy: the engine's drumTicks through DrumSchedule, inside the span every hit
  within a frame of a half-beat and every half-beat struck (off-beats included), outside whole beats only. PLANTED REDS: the engine
  passing false ('normal: the half-beat at 5.344 s inside the span has no hit'); the pipeline not laying spans ("the built stage carries the
  twist's span (undefined)"). No listed stage names doubleIn, so no listed stage moves (lockall to confirm in the gates). generalitycheck PASS.
- **G3's false need was the ENGINE's** (d1038af49; BUILD-29-c's find, proven by it 40/40 both settings on its scratch): riverFaults read
  st.tempo, which the pipeline sets only after checkStage judges the stage; it now reads `st.tempo ?? st.gen2?.brief?.tempo`. Toy
  bargeRow.test 'built through the pipeline': the tempo toy with its pond laid as a 420 / barge (BARGE) / 300 crossing, brief tempo only,
  both settings, seeds 1-2: the barge laid, no roll refused. PLANTED RED (st.tempo alone): 'normal seed 1: the barge's wait refused'.
  **2-9's data line for BUILD-29's next box** (do not edit t-build-29 from here): w2Arc29.ts:91 `barge29: { dir: 1, speed: 80, logW: 384,
  gap: 72, logs: 3, look: 'barge', easy: { speed: 70, logW: 390 } },` (the draft then builds: the probe's scratch tree rolls seed 1).
- tsc clean on each; targeted runs green: postedGuard 6, drumDouble 2, drumEngine/drum/drumBus/tempo/gen2 tempo/tempoToy/tempoResume 29,
  bargeRow/riverLeft/riverTail/lianaRiver 16.
- The suite in 6 shards on d1038af49 (frozen worktree, CI #93): 1 684 pass / 1 fail (seedListChunk 'planted', EPERM: the freeze trap above;
  2/2 green unfrozen), 2 830/0, 3 737/1 (KID_RUNS_59, inherited R-165.473), 4 674/0 (1 todo R-165.312), 5 702/0, 6 606/0. tsc clean,
  generalitycheck PASS. The CI tool line, lockall --check, tierBots and drawcheck were RUNNING at the hand-over (results in the landing message).
- **G6 measuring method (the real engine)**: oneMargin.ts hangs him on each locked court liana at each grip (LIANA_RIVER.grips 0.7, 0.95)
  on the vine's own clock (vineShift 0: the lock holds), presses let-go at a bar's ONE + j frames (j -45..45) on 4 consecutive bars, and
  scores a press as landing when he next stands on a log of that river or on its far bank within 5 s (water or the vine: a miss). HARNESS
  TRAP found and fixed: the engine holds an early press to the swing's sweet spot (engine.ts holdLeapForSweet, swingLeapWait), so a try
  must run on to its landing and the held leap must be cleared between tries; the first sweep read those as 'regrab'/'fell-off' and cut
  the early side to one frame. First clean read (seed 1, 1 bar, Normal, liana x7903): grip 0.7 early 0.40 s / late 0.17 s; grip 0.95
  early 0.37 s / late 0.33 s.
- **G6 MEASURED (the full sweep, seeds 1 and 2, 4 bars each press, both lianas, both grips; raw: probes/oneMargin-0.92.txt)**, the
  contiguous landing presses either side of the press on ONE, worst over seeds, lianas and bars (both lianas and both seeds read alike):

  | setting (bar) | grip 0.7 early / late | grip 0.95 early / late | WORST early / late | window round ONE |
  |---|---|---|---|---|
  | Normal (2.85 s) | 0.47 / 0.17 s | 0.37 / 0.30 s | **0.37 / 0.17 s** | 0.67 s (grip 0.7) |
  | Easy (3.30 s) | 0.57 / 0.23 s | 0.47 / 0.40 s | **0.47 / 0.23 s** | 0.83 s (grip 0.7) |

  Every miss is water (a let-go that falls short or long of the log); none is a harness read. lockedDrops' model says one=true on all four.
  The LATE side is the short one: at lock 0.92 ONE sits near the end of the landing run (Normal: 5 frames late, 14 early at grip 0.7).
- **The lock moves ONE inside its run (seed 1, 4 bars, scratch tree only: TEMPO_29.lock from an env var there, never committed)**,
  worst early / late over both lianas and grips: lock 0.85 Normal 0.07 / 0.43, Easy 0.17 / 0.57; **0.88** Normal 0.20 / 0.33, Easy
  0.30 / 0.43; **0.90 Normal 0.30 / 0.23, Easy 0.37 / 0.33**; 0.92 Normal 0.37 / 0.17, Easy 0.47 / 0.23. The run is about 0.67-0.73 s
  wide on Normal and 0.83-0.90 s on Easy at every lock; lockedDrops' `one` reads true at all of them (it cannot tell them apart).
- **THE BAR, RULED by the lead as proposed**: tempoFaults refuses a court liana whose press on ONE has under **0.20 s (6
  frames) on either side on Normal, 0.30 s (9 frames) on Easy**, worst over LIANA_RIVER.grips and the joint cycle's swings. 0.92 fails
  it (Normal late 0.17 s); 0.90 passes (Normal 0.30 / 0.23, Easy 0.37 / 0.33), a data move for BUILD-29 (TEMPO_29.lock 0.90).

## ENG-29-e (box 1 hand-over, 6:22 PM ET Thu 11/26 by `date`): G3 and G2 DONE on t-eng-29-wip; G1, G6 and the landing NOT started

### EXACT NEXT STEP (ENG-29-e box 2)
Re-fetch t-eng-29-wip (head 232f2bcbe or this REPORT commit after it). Read the packet (origin/ccr-ea739a2f-dfcee4
reference/packets/2026-11-26/ENG-29-e.md) and run ReadNotifications. Then, in order:
1. **G1 the twist's doubled drum** (not started). Code today: engine.ts:642-647 `drumStep()` calls `sound.drumTick(this.drumBeat.b,
   this.gameTime)` with no `doubled`; conductor.ts:563 drumTick defaults doubled false; src/audio/drum.ts:14 `drumHits(b, g0, g1,
   doubled)` exists. Add ONE data field naming where the drum doubles (my recommendation: an x-span list on TempoSpec, `double?:
   Array<{ x0; x1 }>`, laid from the brief's section mark so no x is in engine code; the engine passes `doubled` while Pokey's x is
   inside a span, on BOTH settings). Toy: every hit within a frame of the half-beat inside the span; RED with the field ignored.
2. **G6 the ONE-margin gate**: riverLay lockedDrops reports ONE's early/late PRESS margin; MEASURE it on 2-9's court liana at lock 0.92
   on the real engine; send the measured numbers and the proposed bar to the lead and WAIT for the bar (it does not time out to my own).
3. G4 only if BUILD-29-b's READY says Normal R160 fails.
4. The gates ONCE on the frozen final candidate (packet list: tsc; the CI tool line; the suite in shards, KID_RUNS_59 named as the
   inherited red R-165.473; lockall --check; tierBots 9/9; generalitycheck; drawcheck, the barge draws), land on t-eng-29 (no force),
   the hash and what BUILD-29-b can lay to the lead AND BUILD-29-b (session_01FhBbYMuSvkYA34wbeNgMjW; box 1 session_01FhBbYJfBMkxGySiVVxdxoU
   is archived).
NOT YET RUN on G2/G3: lockall --check (G2 touches pipeline.ts castRows and fillSockets: a listed stage must not move), drawcheck (the
barge), the full suite, the CI tool line. Targeted runs only, below.

### What landed on t-eng-29-wip (each pushed and ls-remote-confirmed)
- **G3 the barge's look** (396c89d96, 01cb165e7, 8d49caa27; the lead APPROVED the look from the stills): RiverRow.look 'barge'
  (river.ts, riverLay.ts); w2-next#barge packed on row 1 of World 2's next sheet (3304x732, row 0's frames unmoved; the packer
  reference/qa-reports/ENG-29/pack-w2-next.py repacks from the PNG cuts); riverArt.ts bargeBox/logPaint/drawRiverLog draw it with the
  deck (the inventory's walk x 80-1050 at y 222, w2NextArt.ts BARGE_DECK, tied by w2NextArt.test.ts) as the log's whole top, the prow
  ahead the way the river runs; no waterline band over it (the raft skips it too: named, reads as floating); platformPlan's code
  fallback 'barge'; stageManifest loads 'w2-next' with any barge row. Catalog row + inventory re-emitted (catalog_master.py --emit),
  inventory.test 217 cut pieces left. Stills at 2x: stills/barge-normal-0.85-upright.jpg, -0.35-sideways.jpg (a scratch 2-4 row in a
  throwaway worktree, never committed; script barge-stills.mjs).
  **The lead's barge rule**: riverFaults judges a barge row's wait by BARGE_BARS (2) bars of the stage's tempo on that setting, only with
  a tempo, no liana over the river and a SAFE near stand (solid, not crumbling, not moving); else the 4 s log beat. Toys
  gen2/bargeRow.test.ts each way; reds planted (bound ignored: both fail; safe-stand check ignored: the crumbling case fails).
- **G2 the posted royal guard** (232f2bcbe): W2_POSTED_GUARD (w2Cast.ts, tag 'posted', 36x66, 2 hits, royal); pipeline.ts castRows
  leaves 'posted' rows out of the bag; fillSockets lays one only for an enemy socket whose allow names it, on both settings, no threat,
  never cut on Easy, fixed in the spacing; patch of none; facing the nearest river (postFacing); a socket with no clear ground fails the
  roll by name ('posted: ...'). Enemy.post (enemyBrain.ts patrolWalk holds him: a patrol of none made him flip facing every frame) and
  Enemy.uncounted (goals.ts goalCounts, engine.ts both enemiesDefeated++ sites). journalMet royal_guard ['2-9'] unchanged (met on clearing
  2-9). Toys gen2/postedGuard.test.ts (5): laid/posted/facing/count with and without the field (toy world), 2-5 moves no foe with the row
  added, postFacing, patrolWalk each way, the real engine's count each way (2-5's sleeper). Reds planted: goalCounts and engine count
  ignored -> toys 1 and 5 fail. HONEST: the 2-5 no-move toy stays green with castRows' exclusion removed (2-5's sockets all name rows).
- Targeted runs green: inventory, artUse, w2NextArt, bargeRow, riverLeft, riverTail, lianaRiver, postedGuard, goalsEasy, goalsGathers,
  snapperCount, ringKillsCounted, enemyBrain*, predator* (114 pass); tsc clean.
- LEARNED: (1) the inventory JSON is emitted from CATALOG-MASTER.csv (catalog_master.py --emit), never hand-edited; (2) a 2-9 posted
  socket must sit 224 px clear of any flag on its piece (patchFor), so BUILD-29-b places it with that in mind.

## EXACT NEXT STEP (session 4, ENG-29-d: steps 0-3 DONE; a gates-only extension on the FROZEN candidate f569d3957, code unchanged since)
Re-fetch t-eng-29-wip first. Everything after f569d3957 is the REPORT only. If ENG-29-d stopped before landing, in order, on a frozen worktree
of f569d3957 (chattr, src/game/gen2/proven left writable):
1. lockall --layouts 16 --check against a record of c73cb9766 (the merge's base; ENG-29-d's merge 3764c59e9 read 102/102 unchanged).
2. The suite (the CLAUDE.md glob, 6 shards, run_in_background, timeout 7200000): the only red allowed is the INHERITED firstTimerBot.test.ts:177
   KID_RUNS_59 (the lead's ruling: the release line's own, CI-15 0ec009b4d, R-165.473 / R-165.477); pacerLay must be 23/23, listed.test green.
3. The CI tool line (gates.yml:157, now with tools/inspect/tempoToys.test.ts) and tierBots (9/9; the bot change is keyed on a stage's tempo,
   1-1 has none).
4. All green but the inherited one: push t-eng-29-wip's head to t-eng-29 (no force) and send the lead the hash, READY-29's measures and (a)-(e).
STILL OPEN for READY-29: (a) the LOCKED let-go window: now judged for ONE (tempoFaults 'a press on ONE misses'); 2-9.md's 2.00 s Normal /
2.40 s Easy (measured on 2-1's liana) is NOT a gate: the toy's 2-4 lianas read 1.23 s / 1.97 s at the lay's lock (lockedDrops.window), the
lead's call; (b) 'river 5 frames ahead of the swing; Easy 0': still one `lock`, no river offset path (the ONE check stands in for it); (c)
the twist's `doubled`: no data path yet; (d) the drum is heard only on the real page: no listening check yet; (e) hitstop / slow motion
sound the hits already ahead (at most 3 frames) a little early; 2-9 has neither on the court. NEW: Easy's 50 px pad water has no data path
(a pad row has one gap); the child loses ~1.25 lives a run on the run-pitch pads on Normal (it hops in place, then learns).

## GATES ONCE on the frozen candidate f569d3957 (session 4's gates-only extension; every later commit is the REPORT only)
- lockall --layouts 16 vs c73cb9766's record (3,264 builds of 102 stages): 102/102 unchanged (the merge 3764c59e9 read the same).
- The suite (the CLAUDE.md glob, 657 files, 6 shards): 4,225 tests, 4,221 pass, 3 todo, ONE fail: firstTimerBot.test.ts:177 KID_RUNS_59,
  INHERITED (the lead's ruling: the release line's own, CI-15 0ec009b4d, R-165.473 / R-165.477; the same on c73cb9766 alone). pacerLay
  and listed.test (shard 1): no fail. The worktree's `git status` empty after.
- The CI tool line (gates.yml:157, with tools/inspect/tempoToys.test.ts): 427 tests, 426 pass, 0 fail, 1 todo.
- tierBots: 9/9. tsc clean; generalitycheck PASS (on the candidate's code, the main tree).

## Session 4 (ENG-29-d): step 0 (the listed.test red), step 1 (c73cb9766 merged), step 2 (the bots on the court: TWO gaps found and fixed with the piece), step 3 (engine-core.md)
- Step 0 (7b3ea26a): w2TempoToy.ts :6 and :18 reworded ('the row a test lays through listed.ts's test seam', 'the test seam refuses a listed
  one'); listed.test.ts 3/3 GREEN; the word put back at :18: RED 2/3, naming 'src/game/gen2/worlds/w2TempoToy.ts'. Comment-only.
- Step 1 (3764c59e9): merge origin/release-0.10.3 = c73cb9766 into t-eng-29-wip, no force, NO conflicts (engine.ts and firsttimer.ts were
  resolved once already in 791735cfa, so W2-LANE-j's resolution was not needed again). tsc clean. The six toys on the merge: 30/30 GREEN
  (gen2/tempo, gen2/tempoToy, tempo, tempoResume, drum, drumBus, drumEngine, listed). Each planted RED still RED, by name, then removed:
  tempo.ts lay phase lock+0.25 and period x1.1 (tempoToy 'every liana on the bar' fails; a phase of 0 does not bite: the court's lock IS 0);
  engine vineClock +0.3 (tempoResume 'off the bar'); engine drumHold removed and drumStep's drumTick removed (drumEngine fails each);
  `import { tempoBeat } from "../game/tempo.ts"` in drum.ts (drumBus names 'drum.ts'); drum.ts cues at audioNow, ON THE FRAME (drum.test
  4 fail: 'audio clock', 'a lost life's down', 'without the engine's hold'). Gates on the frozen merge: see the gates list below.
- Step 2, castBots on NEW 1's toy row FIRST (c73's bots; ENG-THUMB not landed: the lead has not said so): tools/inspect/tempoToys.ts (the
  toy rolled as the game rolls a listed stage, castBots' cast over it). Before: 34/36 (seeds 1-4, kid/adult/child/middle both settings,
  the expert Normal): middle Easy seed 2 and expert Normal seed 1 reached the shrine with ONE RESCUE each, hung 20 s 'on a vine with no way
  on' (x 2988, x 12738).
  - ROOT CAUSE (a bot gap that only a locked court shows): the bot lets go only at the swing's forward end (LET_GO_AT) and, over logs,
    only when that let-go lands (dropWaits). On the court the liana and its river keep ONE clock (swing = bar = one log), so the
    forward-end moment meets the logs the same way on EVERY bar: if it misses once it misses for good. Locks 0.25/0.5/0.75 cleared the
    middle's roll and only lock 0 stranded it; the expert's hang is the same court with no tempo (2-4's 2.85 s swing and the court river's
    2.85 s log are locked anyway), so the TEMPO did not cause it, the lock did. A person hears the drum: 2-9.md 'let go on ONE'.
  - FIX (the bot, with the piece): firsttimer.ts liana branch `onOne`: on a stage with a tempo, after a whole swing, he presses on the
    drum's ONE (his thumb's lag ahead of it) when that press lands. Keyed on the stage's tempo: NO listed stage's bot can move (none has a
    tempo). After: 36/36, no rescue; Normal times fall (kid ~240 -> ~152 s; the forward-end let-go had been drowning them: kid seed 1 lives
    3 -> 0). Toys each way, tools/inspect/tempoToys.test.ts (added to CI's tool line, gates.yml:157): GREEN the two runs that hung finish
    clean; RED the same court with no drum: the expert hangs on a liana with no way on, to a rescue. Planted RED of the fix itself (the ONE
    press switched off): the GREEN fails, 'middle easy seed 2: shrine, rescues 1, stuck on a vine at 2988,755'.
  - THE JUDGE that missed it (the piece): riverLay lianaDrops judges a liana and its river as FREE clocks (every pair of phases) and runs
    BEFORE layTempo; a locked court plays one pairing only. NEW: riverLay lockedDrops (one joint cycle: share, wait, window = longest run
    that lands, `one` = a press on ONE lands every swing) and lockedLianas (every log river in its rightward frame); tempoFaults names a
    court liana whose press on ONE misses: 'the liana at x N over the river at x A-B: a press on ONE misses its logs on every bar (locked:
    P% of a bar's presses land, the longest run W s)'. tempoToy.test: GREEN every court liana's ONE lands, seeds 1-4 both settings; RED
    the lock at 0.15 of a bar, by name in gen2's errors (on Easy gen2 refuses every seed of the roll: the stage never builds). Planted RED
    of the check (removed): the RED test fails. The toy's numbers at the lay's lock: Normal window 1.23 s (77%), Easy 1.97 s (91%), the same
    on every court liana of seeds 1-4 (2-9.md's 2.00 s / 2.40 s were measured on 2-1's liana; NOT made a gate: the lead's call, below).
  - THE PAD BOT AT THE RUN PITCH (190 px a beat): the toy row had NO run-pitch pad row, so the cast above never met one. NEW:
    w2TempoToy.ts COURT_PADS (2-9.md's beat row: 4 small weight pads, 130 px, over 60 px water) and opts.pads (its pond laid in place of the
    stones'). FOUND a second piece gap: tempoFaults judged the weight pads' clock 'pad-small' (a count that runs only while he stands on that
    pad, ride.ts 'weight') as a court clock ('a cycle of 2 s is not a whole number of beats', 'Easy stretches it 1.5'), so gen2 refused
    every roll with the row. FIX: a clock only weight pads read is skipped (a beat pad's is judged). tempoToy.test: GREEN 4 pads 190 px
    apart, gen2 clean, seeds 1-4 both settings; RED the row breathing on a beat, named; planted RED (the skip removed): 'pad-small' named.
    The cast over it: 36/36, no rescue, no stuck spot on the pads. Lives lost ON the pads (x 4600-5800, --lives): child Normal 5 over
    4 runs, middle Normal 2, none on Easy and none for kid, adult or expert (2-9.md: Normal at the run pitch a missed beat runs off a pad's
    far end; whether the child's 1.25 a run is the bar is READY-29's to measure). Traced (child Normal seed 2, FT_TRACE): onto pad 1
    with a run, then three hops of 0.03-0.08 s held from a stand land back on the same pad ('FELL BACK', run false) until it sinks: 2
    lives; then a 0.27 s hold and the row crossed in four hops a beat apart. The child's own small-pad play (it hops in place, then
    learns), not the court's: NOT retuned here (the child is calibrated on 1-1, BOTS.md); named for READY-29.
- THE STOP (step 1's suite): firstTimerBot.test.ts:177 '5-9's Easy goal rests on the kid's runs (KID_RUNS_59)': kid 5-9 Easy measures
  [8,9,7,7,4,7], recorded [3,5,6,7,6,5]; the same red on a frozen c73cb9766 ALONE. INHERITED, not ENG-29's: the lead's ruling, the release
  line's own red, bisected to CI-15 0ec009b4d (R-165.473, held for Matt as R-165.477); landed with it named.
- Step 3: reference/handoffs/engine-core.md §0zs-TEMPO (the tempo, the locked let-go, the bot on a court, the drum's path, the traps:
  layering, DRUM_AHEAD 3 frames and why, DRUM_JUMP, the hold at loseLife, the comment that trips listed.test; the toy; what is open).
- A miss of mine: one probe ran three locks with a shell '&' and `wait` (the brief says never); every later run went through
  run_in_background. A second: my first STOP message went to my OWN session id (the lead's and mine share a prefix); caught when it
  came back as a notification, and sent again to the lead (session_01FhBbYN2CVHnFXg7XzqKXpM); the 20-minute wait counts from that send.

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
