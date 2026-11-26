# BUILD-29 REPORT: 2-9 "The River King's Court" (the World 2 finale; R-165.449), release 6
Branch t-build-29, cut from origin/t-eng-29 = 098047713 (the lead's named base). Session 1 started 5:45 PM ET Thu 11/26 (by `date`).

## EXACT NEXT STEP (session 1 hand-over; STEP 0 NOT yet sent as a whole: the gaps G1-G4 were sent to the lead early, rule 26)
1. Re-fetch t-build-29 and the lead's branch; ReadNotifications (D140); read the lead's reply to the G1-G4 message (below).
2. Read the base gates' results: scratchpad gates-base/summary.txt is LOST with this container, so if the lead has no numbers from
   session 1 for the CI tool line, re-run it once on a frozen worktree of 098047713 (`git worktree add --detach`, chattr +i all but
   src/game/gen2/proven, run_in_background): the 6 `npx tsx` lines of gates.yml's `rolled` job. Session 1's results so far are below.
3. BUILD THE DRAFT as a test-seam row (nothing listed, nothing deleted, rule 25): `src/game/gen2/worlds/w2Arc29.ts` on 2-6's pattern
   (w2Arc26.ts: brick(), kitLib26, ARC_26 verbatim from the design) and the toy's (w2TempoToy.ts: `withTestStage({ '2-9': row })`, a
   brief with `tempo: COURT_TEMPO`), the bricks as "THE PLAN" below names them; beat 6 laid on a `double` river row WITHOUT the doubled
   drum (G1 open) and NO guard (G2 open), each marked in the REPORT, never in code as a stopgap.
4. A READY tool `tools/inspect/draft29.ts` on tempoToys.ts's pattern (onToy: plantSeedList + withTestStage + castRun) and run, each ONCE:
   yield first (D125: tools/engine/yield.ts's measure on the draft), drawcheck on the draft (D131), castBots x40 both settings, met order
   (D130: first met, never first by x), teach-first (Dot 800 px+ before beat 1), and FLOWN AGAIN on 098047713 (rule 24): the run row's
   hop 119 px, pad and stone water at 50 px on BOTH settings (my proposal, below), the pads' margin (0.67 s / 1.07 s), the court
   lianas' locked let-go window (riverLay.ts:376 lockedDrops(...).window on each built court liana: 2-9.md's 2.00 / 2.40 s came from 2-1's).
5. Send STEP 0 to the lead (a) gates (b) READY-29 (c) THE PLAN, then WAIT for GO. The level is not laid before GO.

## STEP 0 so far
### (a) Engine gates on the base 098047713 (frozen worktree, chattr +i, 0 chattr errors)
- tsc: exit 0. generalitycheck: exit 0. coveragecheck (tools/difficulty/coveragecheck.ts): exit 0.
- The tempo/drum toys + listed.test (gen2/tempo, gen2/tempoToy, tempo, tempoResume, drum, drumBus, drumEngine, gen2/listed): 32 pass, 0 fail.
- The CI tool line (gates.yml `rolled`, 6 lines): running at hand-over (see EXACT NEXT STEP 2).
- Inherited and named, never BUILD-29's: firstTimerBot.test.ts:177 KID_RUNS_59 (R-165.473 / R-165.477, the release line's own).

### Gaps found (sent to the lead at once, rule 26; ENGINE-WORTHY; none coded around)
- **G1 the twist's doubled drum has no data path** (the lead's (c)): the node string has `Ws1>:#water` (beat 6). TempoSpec (tempo.ts:19-28)
  has no span where the drum doubles; engine.ts:642-647 drumStep calls sound.drumTick(b, gameTime) with no `doubled` (conductor.ts:563
  defaults false); drum.ts:14 drumHits(doubled) exists but nothing reaches it. The `double` river row (speed 140, log 127.5 = 1.425 s =
  two beats; Easy keeps court's 70/159, one log a bar) is plain data, no gap. A pieces lane builds: the field, the engine passing it on
  both settings, a toy (hits within a frame of the half-beat inside the span; RED with the field ignored).
- **G2 the posted royal guard** (PICKS-29-32.md:50-62, the lead's rulings (1), (4), (5)): gen2 cannot lay it (w2Cast.ts:15 lays the plain
  turtle only; the one royal spawn is the hand build's guard(), w2Stages.ts:193, which goes), and goals.ts:77 goalCounts counts every
  enemy, so a posted guard would enter the gauntlet's count. Needs a posted-royal cast row and an out-of-count field read by goalCounts,
  the sealed exit and the HUD.
- **G3 the barge's look**: RiverRow.look is only 'raft' (riverLay.ts:42); w2-next#barge (deck 386, whole 507) needs a `look: 'barge'`
  draw path; no `barge` frame is in src/assets/w2-next on this base. Lead's call: (A, recommended) the G1 lane; (B) the builder with the pack.
- **G4 Easy's wheel radius** (2-9.md:23-24: Normal R180, Easy R160): WheelRow (wheelLay.ts:32-39) has one R for both settings (easyV
  only). Found after the message; goes to the lead in STEP 0. My recommendation (reversible, data): R160 on BOTH settings (Normal
  V = 2*pi*160/17.1 = 58.8 px/s, one bucket a bar), flown on the real engine for Normal's step-off before it is used (2-6's floor 1.5 s);
  else a per-setting R path in the pieces lane.
- NOT a gap (my recommendation, reversible): Easy's 50 px pad water: lay pads and stones at 50 px on BOTH settings (Normal flew clean
  over 30-70, 2-9.md:10-11); Normal's stone shares at 50 must be flown (they were flown at 60).
- ENG-29's NEW item, the child's ~1.25 lives a run on the run-pitch pads on Normal: it WILL show on 2-9's draft (beat 3 is a 5-pad run
  row; the toy's was 4). Rule 4: Normal is never softened for the child; READY measures it on the draft and names it.

### (c) THE PLAN (draft; one line per beat: token, piece, data field, brick it borrows)
Node string, verbatim (2-9.md:50): `A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Ws1>:#water R Uc^< Cp1&>:#water:&turtle*2 R Pb1^< Sw1> E`
Brief: archetype gauntlet (stagePlan.ts:88 row), `tempo: COURT_TEMPO` { beats 4, bar 2.85, easyStretch 3.3/2.85, lock 0 }.
| # | Token | Piece | Data field | Brick borrowed |
|---|---|---|---|---|
| 0 | A | the water gate, the drum alone, Dot's `drum` TEACH 800 px+ before beat 1 | LINES_29.drum, teachTips | 2-4 'w2-24-edge' shape |
| 1 | Tp1<:#soft | 2 snap stones in step, splash-back | PadRow by 'snap', clock 'court', count 0.7125, gap 50 | 2-5 'one-stone'/'three' |
| 2 | Pw1> | a court river, a log a bar | W2_RIVERS.court (exists) | 2-1 'first-log' / 2-4 ride row |
| 3 | Pf1> | 5 small weight pads, run pitch | PadRow by 'weight', 5 x 'small', gap 50 | the toy's PADS_SECTION |
| 4 | Xs1>:#water + R | 2-4's liana over a court river, locked | brief tempo lock; court row | 2-4 'w2-24-first-drop' |
| 5 | Pp1&>:&turtle*2 | 3 in step from ONE, 2 snappers on the court's jaws | snap row 3 stones; w2Cast turtle onBeat | 2-5 'three' + 'awake' |
| 6 | Ws1>:#water + R | the twist: `double` logs under the liana | NEW river row `double` {speed 140, logW 127.5; easy = court's}; **G1** | 2-4 'w2-24-drop-ride-drop' |
| 7 | Uc^< | the wheel up the terrace, one bucket a bar | NEW W2_WHEELS row `court` {R 180 (G4), V 66.14, easyV 50.77, N 6, street 'in'} + flight | 2-6 wheelBrick |
| 8 | Cp1&>:#water:&turtle*2 + R, heart | the wave of 5 (Easy waves of 2), a court log, 2 snappers | snap row with per-stone offsets | 2-5 'wave' + 'quickening' |
| 9 | Pb1^< | World 2's bounce up the quay | the bounce (wired) | 2-6 'wheel-bounce' / 2-1 'spring' |
| 10 | Sw1> | the King's Barge, quay to steps; the guard on the landing (**G2**); the bell on the arch | NEW river row `barge` {speed 80, logW 384; easy 70/390, look 'barge' **G3**}; puzzleKit bell | 2-4 'w2-24-jetty' raft row |
| 11 | E | the shrine; `rang` after the bell | exit totem | 2-6 EXIT |
- The 2-minute floor: the arc is ~190 s Normal (2-9.md:34-48); each tier's fastest clean run is READY's to measure on the draft.
- The goal: gauntlet, `goalStart` "Chase off {n} snappers to open the sanctuary" (proposed n = 5 of 7, Easy its own); the count must be
  met BEFORE the barge on every roll (the keeper's ask: a locked shrine needs a way back; the barge carries one way only), so beat 10
  carries no snapper and the top-up's 2 extra land on beats 5 and 8 (to check on the draft).
- The hand build's DELETION LIST (after GO; new replaces old): w2Stages.ts '2-9' (W2_STAGES :35, COURT_GOAL_29 :41, W2_PUZZLES :51,
  targetCount :990), w2Sections.ts '2-9' (W2Plan :21, :91, :110, :355), levelSeeds.ts:25, stageSheets.ts:93 (KEEP 'foe:guard' and
  journalMet.ts:13 royal_guard IF G2 lands: the posted guard meets the card; else both retire with the lead's ruling), dotLinesData.ts
  :155 hint.2-9.court and :156 hint.2-9.guards with dotTips.ts :35, :140 (the keeper's conflict 4), stagePlan.ts:88's desc -> MISSION_29,
  pokeyJournal.ts:68 -> the keeper's page. Tests re-pointed, assertions kept: w2Stages.test.ts, w2Puzzles.test.ts, puzzleCamera.test.ts,
  puzzleGateWall.test.ts, stageBackdrops.test.ts ('2-9' -> courtFar-s11 beside w2evening), w1NewArt.test.ts, badges.test.ts (ids only).

## Lessons applied (session 1)
D125 (yield first, planned), D126/D141 (the CI tool line on the base), D128 (stamps from `date`), D130 (met order, planned), D131
(drawcheck on the draft, planned), D134 (push + ls-remote before hand-over), D140 (ReadNotifications at step boundaries).
