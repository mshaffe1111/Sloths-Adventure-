# BUILD-29 REPORT: 2-9 "The River King's Court" (the World 2 finale; R-165.449), release 6
Branch t-build-29, cut from origin/t-eng-29 = 098047713 (the lead's named base). Session 1 started 5:45 PM ET Thu 11/26 (by `date`).

## EXACT NEXT STEP (session 2 hand-over, BUILD-29-b; STEP 0 (b)/(c) NOT yet sent as a whole; GO not given: nothing laid)
0. Re-fetch t-build-29, t-eng-29-wip and the lead's branch; ReadNotifications (D140). READ THE LEAD'S REPLY on the GOAL (sent this
   session: (A) countSet, 7 snappers seated (beat 5 three, beat 8 four), goal 5 of 7; (B) countSet, the 4 seated, goal 4; (C) keep the
   top-up, an engine lane keeps it inside the snapper nodes). No reply 20 minutes after it was sent: (A), on the draft only (CI #89), said first.
   AND THE LEAD'S REPLY on the STONES (sent this session, design level: built 80 px at 30 px lose the design's counts; (A) a pieces lane
   makes a 130 px snap stone, judged by pitch, laid 130 + 60 Normal / 130 + 50 Easy and flown again; (B) re-design beats 5 and 8 on the
   30 px counts; (C) the lead's row). No reply: (A) is only RECOMMENDED in the REPORT (it needs an engine lane; nothing built by me).
1. Lay the goal ruling in the DRAFT (w2Arc29.ts: draft29Cfg's `countSet: true` with GOAL_29, and the extra `snapper(...)` sockets +
   `snapperGround` patches in `snappers` / `grandDance`), then roll: `npx tsx reference/qa-reports/BUILD-29/probes/draft1.ts 1,2,3,5,8`
   (seed 1: a top-up snapper at x 2000 on beat 1; 3: a floor over a snapper; 5, 8: 'snapper*2: laid 3') and the yield
   `npx tsx reference/qa-reports/BUILD-29/probes/yield29.ts 1 40` on a FROZEN worktree: the only rule left must be the barge's
   'a log every 5.7 s, over 4' (ENG-29-e's G3 carrier rule; and its echo 'Easy could not lay Normal's plan').
2. ENG-29-e's G1/G2/G3/G6 notes (t-eng-29-wip): when G3 lands, re-roll WITHOUT the stand-in; when G2 lands, the guard on beat 10's landing.
3. READY-29 on the draft, each ONCE on a frozen worktree of the head (git worktree add --detach; chattr -R +i src tools; node_modules
   symlinked), each lane its OWN run_in_background call (never a shell '&'):
   - the bots x40: `npx tsx tools/inspect/draft29.ts --seeds 1-40 --bots <bot> --barge-stand-in` one lane per bot (kid adult child
     middle expert; about 3 s a run): every tier at the shrine both settings, no run under 120 s, each tier's FASTEST clean run named,
     every miss traced (rule 28: two runs a cause, seed, x, frame, what took him). Session 2's partial look (top-up goal, superseded):
     adult Normal 12/12 at the shrine, 153-168 s; `pass` false on seeds 3 and 8 though at the shrine: read why (goal got 5 / 6 of 5).
   - met order (D130) and teach-first: `npx tsx reference/qa-reports/BUILD-29/probes/teach.ts 1,2` (tips from gen2.fills, sections,
     enemies, all BUILT). Session 2 (top-up goal): `w29.drum` at x 688, the first stone at 2210: 1,522 px before (800+ holds) on both
     settings; `w29.roar` 500 px into the twist. BUT Normal's top-up seats a snapper at x 2000, between the drum tip and the first stone
     (rule 6 'nothing that hurts in between' and rule 7 fail): re-read after the goal ruling (countSet lays no top-up).
   - drawcheck on the draft (D131) and yield done in step 1.
   - FLOWN AGAIN on 098047713 (rule 24): `reference/specs/sims/court29.ts` (copied from t-design-29) in the frozen worktree
     scratchpad/wt-base; this session ran `beat` on both settings (results below if they landed; else re-run): the stones at 30 px,
     the pads at 50 (margin 0.67 / 1.07 s on the design), the run row; then `hop` (119 px). The court wheel is FLOWN (below).
4. Send STEP 0 (b) READY-29 and (c) THE PLAN (the table below, as ruled, with each tier's fastest clean run and the deletion list), then
   WAIT for GO.

## Session 2 (BUILD-29-b), done, each pushed to t-build-29
- 894031cb5 snap stones at 30 px (the lead's (vi): rideLay's snap judge's 74 errors a roll gone; pads stay 50); the draft's goal 5 on its
  config (GOAL_29; the hand build's config said 15 and topped up to 17).
- 5bf40bc3f deal exact (2-6's form) + the snappers brick content 'ground': gen2 had served the pads brick to the `Pp1&>` node and the
  snappers brick to `Pf1>` (both practise + floating): 'content p: no piece on a clock laid' and the snapper asks gone; every roll of
  seeds 1-2 both settings lays gate hear logs pads let-go rest snappers double rest terrace dance rest quay barge shrine.
- 5c89954e1 the court wheel a World 2 row W2_WHEELS.court {R160, V58.79, easyV50.77, N6, in} (the lead's G4), FLOWN
  (`npx tsx tools/engine/wheelflights.ts --write`; only its 2 rows added): Normal turn 17.1 s, bucket 2.85 s (a bar), board tap 100%,
  step-off 3.93 s; Easy turn 19.8 s, bucket 3.30 s (Easy's bar), step-off 4.87 s (Easy never tighter, rule 4; 2-6's floor 1.5 s).
- 553de213f tools/inspect/draft29.ts (tempoToys' onToy on the draft; fixture id DRAFT_ID_29 '2-91' because withFixtureConfig refuses
  the game's own 2-9, whose config would top up to 17); `--barge-stand-in` lays the barge as a court river (the game's roll refuses
  every unclean seed, and the barge is unclean until G3).
- The 40-seed yield (head aa4c5b1a7, top-up goal): 0 of 40 clean on both settings, the barge on 40 (alone on 19); under it the top-up's
  snappers: 'snapper*2: laid 3' 20 rolls, 'a floor over its ground' 6. Sent to the lead as the GOAL ruling.
- FLOWN AGAIN on 098047713 (rule 24; t-design-29's court29.ts `beat`, frozen worktree; flown/beat-{normal,easy}-098047713.txt), a
  RUN row (right held, a tap on every beat B 0.71 s Normal), floors 130 px: Normal G30 clean, pad margin 0.70 s, a beat late 0.43 s,
  2 in step from count 1-2 (47% of phases); G50 clean, margin 0.67 s (= the design), a beat late 0.43 s; G60-70 clean but a beat late
  SWIMS; G80+ swims. Easy G30 clean, margin 1.07 s, a beat late 0.90 s; G50 the same (1.07 / 0.90; = the design). So the stones at 30 and
  the pads at 50 fly clean on BOTH settings at the run pitch, Easy never tighter.
- BUILT widths (rule 27; probes/widths.ts, seed 1 both settings): the pads are 130 px at 50 px water (= the sim's W130 G50: clean, margin
  0.67 s Normal / 1.07 s Easy, the design's numbers HOLD). The snap STONES are 80 px at 30 px water (pitch 110 px), NOT the design's
  130 + 60 (pitch 190). **FLOWN at W80 G30 the stones LOSE the design's counts** (flown/beat-*.txt, RUN W80 G 30): Normal 3 in step
  safe from count 1 or 2 (45%; design: only from ONE, 16%), 5 in step safe from ONE (17%; design: never), the WAVE of 5 safe ONLY from
  count 3 (22%; design: from ONE or TWO, 65%); Easy the same shape (wave x5 from 3 only, 22%; wave x2 from 2 or 3, not ONE). The
  design's counts come back at the 190 px pitch: Normal W80 G110 (3 in step from ONE 16%, wave x5 from ONE/TWO 65%) but a beat late
  swims and Easy W80 G100-110 swims; W130 G60 Normal holds them (the design's row). rideLay's snap judge refuses anything but 30-40 px
  beside a stone. SENT TO THE LEAD (a design-level ruling: beats 5 and 8 as designed cannot be laid with 80 px stones at 30).
- The hop (flown/hop-*.txt): Normal a tap at a run 0.43 s, 119 px (= the design); from a stand 106 px; 0.28 s on the floor between
  beat hops. Easy 0.43 s, 119 px; 0.39 s between hops (Easy's beat 0.82 s).
- MY MISS, owned: the first bot lanes went up as ONE background run with a shell '&' and `wait` (the box's rule: never). Stopped at
  once (pkill; 0 left), re-run as one background call a bot; then stopped again for the goal finding (their numbers are superseded).

## Session 1 hand-over (history; its steps 0 and 3 (i)-(vii) are done or ruled above)
THE LEAD HAS RULED (its message after G1-G3): G1, G2 and G3 (option A, look 'barge') go to ONE pieces lane, ENG-29-e on t-eng-29; YES
to pads and stones at 50 px on both settings (Normal's stones FLOWN at 50 in READY before use); after GO lay every beat that needs none
of G1-G3; beat 6 and the guard wait for ENG-29-e. G4 (the wheel's Easy R) and G5 (the 's' letter) were sent after: read its reply.
0. G5 decides how the draft's node string is written: if the lead rules (B), the draft's ARC_29 writes the two liana beats `Xr1>:#water`
   and `Wr1>:#water` (2-4's letter) and the REPORT names the change from 2-9.md:50; if (A), wait for the lane's TYPE_OF_LETTER 's'.
1. Re-fetch t-build-29 and the lead's branch; ReadNotifications (D140); read the lead's replies (G4, G5).
2. Read the base gates' results: scratchpad gates-base/summary.txt is LOST with this container, so if the lead has no numbers from
   session 1 for the CI tool line, re-run it once on a frozen worktree of 098047713 (`git worktree add --detach`, chattr +i all but
   src/game/gen2/proven, run_in_background): the 6 `npx tsx` lines of gates.yml's `rolled` job. Session 1's results so far are below.
3. THE DRAFT EXISTS (session 1): `src/game/gen2/worlds/w2Arc29.ts` (2-5's brick form; test seam only, nothing imports it; tsc clean,
   listed.test 3/3, generalitycheck PASS). Rolled once a setting, seeds 1-2 (`npx tsx reference/qa-reports/BUILD-29/probes/draft1.ts`):
   it BUILDS (26.6-27.4k px; Normal 17 enemies, Easy 11; target 15 = the hand build's config, not yet 2-9's goal) with 33-41 gen2 errors
   a roll, by kind. DONE in session 1 (710f7ed59 + the next commit): the lead's rulings G4 (wheel `court29` R160 both settings), G5 (B: `Xr1>`,
   `Wr1>`, a change from 2-9.md:50) and the lock 0.92 (READY (a), TEMPO_29.lock); (i) and (ii) below. The re-roll's errors left: (vi) 74,
   (iii) 26, (vii) 6, (iv) 6, and the P/C beat nodes ('content p: no piece on a clock laid'; 'threat snapper*2: laid N'): the pads brick
   and the snappers brick are both practise + floating, so gen2 may serve either to any P node; give each beat's brick what only its node
   asks (read pipeline's node-to-section match first). FIX IN DATA (mine, in order): (i) the node string's `&turtle*2` -> `&snapper*2` (the cast's id is `snapper`, as
   ARC_25; 'no creature of that id'); (ii) beat 4's river DEEP (`court`, not `court29s`): its node `Xr1>:#water` asks deep ('hazard
   #water: laid soft'; 2-9.md:55 said splash-back, the node string wins: name it); (iii) the snapper patches clear of every higher floor
   in the bonk's landing ('cast: turtle ... a floor N px over its ground'); (iv) fly the court wheel: `npx tsx tools/engine/wheelflights.ts`
   and commit its table ('has not been flown'); (v) the beat-nodes' clocked piece ('content p: no piece on a clock laid'): read which
   node, the weight pads are not a clock (ENG-29d's skip). TO THE LEAD FIRST (rules, never loosened by me): (vi) **snap stones at 50 px
   are refused**: rideLay's snap judge holds 30-40 px of water beside a stone ('not 30-40 (one tap hop)', 74 a roll): the lead's YES to
   50 px holds for the PADS only; my recommendation: stones at 30 (2-5's flown row) and the court's shares flown again at 30; (vii) **the
   barge's log every 5.7 s is over the river judge's 4 s** ('a log every 5.7 s, over 4'): a barge is a carrier, not a log to time; the
   rule's exception for a `barge` look belongs in ENG-29-e with G3, or the barge row becomes two logs a bar (the lead's call).
4. When the draft rolls with no errors: a READY tool `tools/inspect/draft29.ts` on tempoToys.ts's pattern (onToy: plantSeedList + withTestStage + castRun) and run, each ONCE:
   yield first (D125: tools/engine/yield.ts's measure on the draft), drawcheck on the draft (D131), castBots x40 both settings, met order
   (D130: first met, never first by x), teach-first (Dot 800 px+ before beat 1), and FLOWN AGAIN on 098047713 (rule 24): the run row's
   hop 119 px, pad and stone water at 50 px on BOTH settings (my proposal, below), the pads' margin (0.67 s / 1.07 s), the court
   lianas' locked let-go window (riverLay.ts:376 lockedDrops(...).window on each built court liana: 2-9.md's 2.00 / 2.40 s came from 2-1's).
5. Send STEP 0 to the lead (a) gates (b) READY-29 (c) THE PLAN, then WAIT for GO. The level is not laid before GO.

## STEP 0 so far
### (a) Engine gates on the base 098047713 (frozen worktree, chattr +i, 0 chattr errors)
- tsc: exit 0. generalitycheck: exit 0. coveragecheck (tools/difficulty/coveragecheck.ts): exit 0.
- The tempo/drum toys + listed.test (gen2/tempo, gen2/tempoToy, tempo, tempoResume, drum, drumBus, drumEngine, gen2/listed): 32 pass, 0 fail.
- The CI tool line (gates.yml `rolled`): line 1 (the tool tests) 427 tests, 0 fail, 1 todo (= ENG-29's count); lines 2-4 (tipwalk, storyTipScan, teachFirstScan) exit 0; lines 5-6 (registrycheck, tierBots) running at hand-over: re-run them once if no result reached the lead.
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
- **G5 the node letter `s` (swing) is UNLAID** (found after the G4 message): nodeLetters.ts:67 `s: { name: "swing", ..., unlaid: "the swing
  vine (liana) as a content block: its emitter keyed by letter is not built" }`, and nodeAsks.ts:40 TYPE_OF_LETTER has no `s`, so
  askMisses (nodeAsks.ts:131-133) names every `Xs1>` / `Ws1>` node "Later: the swing vine ...": 2-9.md:50's string passes checkCode but
  its two liana beats cannot be laid as written. 2-4 wrote its liana beats with `r` (ARC_24 'A Tr Pg Pr Xw R Pf Wr ...', content
  'rope'). Lead's call: (B, my recommendation, data, reversible) the draft writes `Xr1>:#water` and `Wr1>:#water`, the bricks content
  'rope' as 2-4's; (A) the lane maps `s` to a type. The other letters lay: p (CLOCK_LETTER, a clocked piece: stones, pads, wheel
  buckets), w, f, b; `Uc^<` asks every section of the node be 'climb', so the wheel brick is typed 'climb' (2-6 typed its wheels 'rope').
- NOT a gap (the lead's YES): Easy's 50 px pad water: lay pads and stones at 50 px on BOTH settings (Normal flew clean
  over 30-70, 2-9.md:10-11); Normal's stone shares at 50 must be flown (they were flown at 60).
- ENG-29's NEW item, the child's ~1.25 lives a run on the run-pitch pads on Normal: it WILL show on 2-9's draft (beat 3 is a 5-pad run
  row; the toy's was 4). Rule 4: Normal is never softened for the child; READY measures it on the draft and names it.

### (b) READY-29, measured so far: ENG-29's STILL OPEN (a) and (b) on the court liana 2-9 lays at beat 4
2-9's beat 4 is the toy's liana: 2-4's `first-drop` (anchor 165 px past the bank, 410 over, 410 long) over the `court` row, locked at
COURT_TEMPO.lock 0. Probe `reference/qa-reports/BUILD-29/probes/oneLock.ts` (committed; the tempo toy, seeds 1-2, every court liana,
riverLay.ts lockedLianas; the "sides" = how far the LIANA'S PHASE may move against the bar, each way, before a press on ONE misses:
the lock's margin, NOT a press's lag: a later press also moves the river, so ONE's place inside the press window is NOT yet measured,
and lockedDrops does not report it; the window and share columns ARE lockedDrops' own press-time numbers), on 098047713:
| lock | Normal window / share | ONE early / LATE side | Easy window / share | ONE early / LATE side |
|---|---|---|---|---|
| 0 (today) | 1.23 s / 77% | 0.66 s / **0.29 s** | 1.97 s / 91% | >= 1.65 s (probe cap) / **0.31 s** |
| 0.935 | 1.83 s / 81% | 0.47 s / 0.47 s | 2.10 s / 93% | >= 1.65 s / 0.53 s |
| 0.92 | 1.83 s / 83% | 0.43 s / 0.51 s | 2.13 s / 95% | >= 1.65 s / 0.58 s |
(identical on every court liana of seeds 1-2, 18 lianas a setting.)
- **(a) the let-go window:** at today's lock 0 ONE lands, but the lock sits 0.29 s (Normal) / 0.31 s (Easy) of phase from where ONE
  stops landing, and the press window is 1.23 s Normal (2-9.md's 2.00 / 2.40 s came from 2-1's liana and do not hold on 2-4's). At lock
  0.92 the window is 1.83 s Normal / 2.13 s Easy and the lock's margin 0.43 / 0.51 s. PROPOSAL (the lead's call): (1) the court's lock
  0.92 (data: one number in 2-9's tempo), (2) a gate on the window AND on ONE's place in it: lockedDrops reports ONE's early and late
  margin (a small add, a pieces lane: today it returns only `one`), and tempoFaults refuses a court liana whose press on ONE has under
  0.40 s Normal / 0.50 s Easy either side (Easy never tighter, rule 4), with the window >= 1.5 s Normal / 2.0 s Easy. The numbers are
  proposals until ONE's press margin is measured; re-check on the draft's own lianas (beat 6's over `double` too) and with the bots'
  ONE press (ENG-29d onOne) before the lock is used.
- **(b) the river offset:** ONE's check alone is NOT enough on this liana: it passes at 0.29 s of late margin. The design's 'river 5
  frames ahead' was there to centre ONE; with no offset path, moving the LOCK does the same job for the liana (the river and the drum
  stay on the bar), so no river-offset path is needed if the margin gate above lands and the lock moves. The lead's call.

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
