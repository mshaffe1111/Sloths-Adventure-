# METER-4 REPORT: the meter prices 2-3's line (the `line` channel: walk them home past the herons)

Meter/tools, branch `t-meter-4` from origin/t-eng-23 9e306581 (follow.ts, followPlay.ts, lineFaults.ts). Packet
reference/packets/2026-11-19/METER-4.md. Started 7:26 PM ET 11-18 (by `date`). Tools only: no src/ file changed, no stage moved.
Commits: 36ba0590 (the channel, the toy, the planted tests), d8a482e0 (gates.yml's tool line, lineToy --read, turnover), then this
report's commit (hash: the push's `git ls-remote` in the lead message).

## 1. Done-items, with evidence

**The formulas as coded** (tools/difficulty/score.ts; every number read from the code the game and lineFaults run):

| What | Where | Form |
|---|---|---|
| The crossings | score.ts:594 `lineCrossings` | as lineFaults walks them (lineFaults.ts:115-120): each watched stretch's start -> first reed clump, clump -> clump, last clump -> its end; a crossing two herons watch priced once, with both (key a:b) |
| N | score.ts:612 | the cages before the crossing, at most the built stage's goal (`config.targetCount`: the easiest way he has; Easy brings 3 home) |
| Crossing time | score.ts:617 | (G + N x gap) / pace, gap and pace from the stage's own follow row (`rp.e.follow.row`: W2_FOLLOW, w2.ts:50) |
| The herons' cycle | score.ts:621 | calm[0] (the hardest) + warn + pass, as safeWindow takes them (lineFaults.ts:63-64; WATCH, watcher.ts:58) |
| THE LEAVE (kind `line`) | score.ts:626, :643 | `safeWindow(row, easy, A, B, herons, platforms, safeWater, N)` (lineFaults.ts:62: FollowPlay flown, the game's own line and herons); bits = `windowBits(cycle, safe)`, a timed press he may wait for in the reeds (the ride-board form). Off the stretch the heron reads nobody (followPlay.ts:150, :159), so its start / end fly as a clump of their own |
| The first crossing of a stretch | score.ts:642-643 | before any look (stepWatch gives a stretch's first calm whole, watcher.ts:106): `deadlineBits(calm[0] + warn - cross)` |
| The heron's eye on the line | score.ts:645 | `span: [leave, leave + cross]`, a lasting threat: every move inside it is done watched (OVERLAP) |
| THE STOP (kind `line-stop`) | score.ts:585 `stopSpan`, :648-649 | px of let-go spots where he and all N bunched behind him are inside the reeds by `lineInCover` (follow.ts:388, the game's test) = W - N x gap - 20; bits `deadlineBits(px / PHYS.maxRun)` (a press he cannot wait out at a run) |
| A SPOOK | score.ts:628-629, :640 | no heart (cost 'soft'); its fetch 2 x (crossing's far side - WatchZone.setback, else x0) / PHYS.maxRun, priced at the meter's replay rate: stakes STAKES.soft + fetch x STAKES.replayPerSec. A stretch whose first look only warns (freeFirst; every heron on Easy, followPlay.ts:157) makes its first crossing a free retry (:627) |
| In scoreStage | score.ts:886, :914-918 | on a follow stage (`rp.e.follow`, the engine's own FollowPlay) the `beat:watched stretches` beat is skipped (the heron never reads him) and lineChallenges is added |
| Coverage | score.ts:1004; coveragecheck.ts:84-88; meter-coverage.json:325 | piece `line:follow` (read from ProtoExtras' field typed FollowRow, never a hand list); bot `firsttimer.ts#LINE_SKILL`, channel `score.ts#lineChallenges`; on a follow stage `beat:watched stretches` is the line's |
| The toy | tools/difficulty/lineToy.ts | ENG-23's marsh (lineBot.test.ts's numbers) laid over a built stage through scoreStage's new `prep` hook (score.ts:828), so the meter reads it as any stage; `--read` prints both toys on the meter's scale |

**Planted tests** (tools/difficulty/lineChannel.test.ts, 6 tests, all green; added to gates.yml's CI tool line after rideChannel.test.ts).
Each plant below was made in score.ts, run, and restored (`git checkout`):

| Plant | RED |
|---|---|
| no skip of the watched-stretch beat on a follow stage | test 6 (the follow toy is refused: UnpricedPiece beat:watched stretches) |
| a spook costs no fetch | test 4 |
| the leave a constant (WATCH.pass), not lineFaults' flight | tests 1, 2 |
| the stop holds him alone (not the line) | test 3 |

What they pin: the leave IS safeWindow's number; G 200 leaves more than G 500 and prices lower; a second heron out of step (3.2 s, G 350:
2-3's beat 7) narrows and raises it; stopSpan = W - N x gap - 20 (300/3: 178; 260/5: 70 as 2-3.md says; 160/5: 0); a setback 500 px
further back adds exactly 2 x 500 / 285 s of fetch at the replay rate; the first crossing is free on Easy and freeFirst; no cage before a
stretch, nothing asked; N capped at the goal; end to end (the engine's FollowPlay) 3 crossings + 2 stops on both settings, `line:follow`
a piece, Easy's line points < Normal's; and the same marsh with no follow row is still refused (the old behaviour, named).

**Every shipped stage's meter unchanged** (score.ts --seeds 1-4 --settings normal,easy, base 9e306581 in a worktree vs this branch;
reference/qa-reports/METER-4/score-before.txt / score-after.txt; the --json output byte-identical, `cmp`):

| Stage | Normal before -> after | Easy before -> after |
|---|---|---|
| 1-1 | 4 -> 4 | 2.6 -> 2.6 |
| 1-2 | 0.9 -> 0.9 | 0.3 -> 0.3 |
| 1-3 | 1.1 -> 1.1 | 0.5 -> 0.5 |
| 1-4 | 4.3 -> 4.3 | 3.2 -> 3.2 |
| 1-5 | 4 -> 4 | 1 -> 1 |
| 1-6 | 5.7 -> 5.7 | 3.2 -> 3.2 |
| 1-7 | 2.2 -> 2.2 | 1.2 -> 1.2 |
| 1-8 | 6.7 -> 6.7 | 3.2 -> 3.2 |
| 1-9 | 4.9 -> 4.9 | 5.8 -> 5.8 |
| 1-10 | 0 -> 0 (route check) | 0 -> 0 |
| 2-1 | 2.8 -> 2.8 | 2.1 -> 2.1 |
| 2-2 | 6.4 -> 6.4 | 4.7 -> 4.7 |

SCALE 0.28194 on both. No stage on this base carries a follow row, so nothing else could move: the new code runs only where
`rp.e.follow` exists.

**The toys read by the meter** (reference/qa-reports/METER-4/toy-read.txt; `npx tsx tools/difficulty/lineToy.ts --read`), beside 2-3.md's
targets (Normal 14.5, band 9-21; Easy at most 8.7, from DIFFICULTY.md:61-63 as 2-3.md pastes them). Named, not tuned:

| Toy | Normal: line points / toy meter | Easy: line points / toy meter | Easy / Normal |
|---|---|---|---|
| ENG-23's marsh (3 following, W 300, G 400, one heron) | 2.98 / 1.7 | 2.77 / 1.6 | 0.93 |
| 2-3.md's beats 4 + 7 (5 following; N: W 260, G 500 then two herons out of step G 350; E: W 340, G 350, one heron) | 26.84 / 12.5 | 9.45 / 4.3 | 0.35 |

- A toy's "meter" is its raw load on the meter's scale over the TOY's own route minutes (0.4-0.8 min), so it is a density, not 2-3's
  score: on the built stage (~150 s + waits) the mean dilutes and the peak (the busiest 30 s, beat 7) carries. The useful number for the
  builder is the line's POINTS: beats 4 + 7 carry ~27 points on Normal and ~9.5 on Easy.
- What prices: the STOP dominates. W 260 holding five is 70 px = 0.25 s at a run, 2.34 bits each, x2.0-2.5 overlap (inside the heron's
  eye): 3.5-4.7 points a stop. The LEAVE: one heron over G 500 leaves 6.4 s of 9.6 s (1.32 bits); two herons out of step over G 350 leave
  2.2 s (2.42 bits, the beat's hardest moment; lineFaults' floor is 2.0 s) and 3.6 s at the second crossing. Easy's W 340 holds five in
  150 px (0.53 s: 1.54 bits) and one heron leaves ~7 s: the Easy side reads 0.35 x Normal, inside "at most 0.6 x".
- The marsh barely prices (W 300 holds three in 178 px; one heron over G 400 leaves 6.7 s): it is the teach-sized crossing, as ENG-23 built it.

## 2. Polish check
No screen changed (tools only). I read every toy challenge line above (toy-read.txt) the way the builder will: each names the crossing,
the line's length, its crossing time, the leave window out of the cycle and the fetch; each stop names its clump, its width and its px /
seconds. One rough spot fixed: the first toy run carried 2-3's hand stage's puzzle-room beat into the toy (stale `kit`); lineToy clears it.

## 3. Pushback
- **"the line's crossing time against lineFaults' safeWindow"** is read as: the crossing time is already INSIDE safeWindow (its flight
  times the line out), so the leave is priced as the window it leaves, windowBits(cycle, safeWindow) (the meter's form for every
  wait-for-it press: a log's board), and the crossing time is the heron's `span` over the line (the overlap window) and the note. Pricing
  log2(1 + cross / safe) as well would count the crossing twice. If the lead wants the Fitts form instead, it is one line (score.ts:643).
- **The stop is priced at a run** (the packet's 285 px/s). He can also stop short and creep on with taps (he stops in 3 frames / 8 px),
  so the stop's bits are an upper bound on a careful player; a bot run on 2-3 will show whether players overshoot the reeds (the tail
  left out) or not.
- **A spook's fetch at the replay rate is small** (stakes 1.006-1.06): the meter's one rule (1/240 per second of walking back, the same as a
  lost life's replay). That matches 2-3's "nobody hurt"; if the testers find a spook stings more than that, the rate is the lead's/Designer's.

## 4. Suggestions (outside my walls)
- **The 2-3 builder** (rule 23): run `npx tsx tools/difficulty/score.ts --stages 1-1,2-3 --seeds 1-4 --settings normal,easy --detail`
  on the laid stage; the `line` / `line-stop` rows name every crossing. The dial is the reed width (the stop) more than the open mud
  (the leave): W 260 -> 300 drops a stop from 2.34 to 1.84 bits (110 px, 0.39 s); beat 7's second heron is the leave's peak. If Normal reads under 14.5,
  the line alone will not lift it (beats 4 + 7 carry ~27 points); the cages, the paddle and the post are priced as before.
- **Integration:** this branch and t-meter-3 both add a test to gates.yml line 100 and both edit engine-core.md: two one-line conflicts
  (`git merge-tree` vs origin/t-meter-3); score.ts and meter-coverage.json auto-merge. Clean vs origin/main and the lead's branch.

## 5. Unresolved (named plainly)
- **2-3 is not laid** (its builder's): nothing here is a real stageTable row; the meter reads the engine's FollowPlay, so it reads 2-3 the
  day it is built, but its stage numbers wait on that.
- **Left-running follow stages are refused** (UnpricedPiece line:follow): safeWindow flies to the right only.
- **The pond crossing (beat 6)** is priced with the same flight (FollowPlay paddles over splash-back water); its stones and pads are priced by
  their own channels, but no toy here proves the pond's leave against 2-3.md's 3.0 s; the builder's laid stage will.
- **`timecheck`**: no file of that name on t-eng-23 or the lead's branch; not run.
- **Bots**: the line's bot is ENG-23's LINE_SKILL (lineBot.test.ts, in the CI tool line, run there); no new bot run on the design toy.

## 6. Gates (on d8a482e0, the code head; this report adds only reference/qa-reports/METER-4/)
| Gate | Result |
|---|---|
| tsc --noEmit | PASS |
| roadmapcheck (unshallowed) | PASS |
| knowncheck | PASS |
| generalitycheck | PASS (62 engine files, 26 literals, 26 known) |
| score.ts --check | PASS (14 planted cases) |
| touched tests: lineChannel, score, coveragecheck, rideChannel, src/game/ciTests | PASS (exit 0, 10.7 s) |
| coveragecheck | PASS (12 built stages, 25 pieces used, 6 known gaps; 42 s) |
| the CI tool line, exactly as gates.yml line 100 has it (with lineChannel.test.ts), CI=1 FORCE_COLOR=1 | GATE-CI |
| before/after meter, 12 stages x 2 settings x seeds 1-4 | byte-identical JSON |
| timecheck | not in the tree (above) |

## 7. Method used / Lessons applied / Method update
- **Method:** METER-3's way of adding a channel (route/score, coverage row, planted tests, gates.yml list) + reference/methods/gates.md
  "Scoped by what changed".
- **Lessons applied:** a gate must call the same code the screen calls (D19: safeWindow, lineInCover, the engine's own FollowPlay stage);
  planted failure first (4 plants, each RED); test the measuring tool before its numbers (the toy reproduces stopSpan = 2-3.md's 70 px
  and safeWindow to the number); long commands in the background, ReadNotifications at every push (D57/D59); times from `date` (D20/D30).
- **Method update (proposed):** a channel for a piece the engine runs as an object (FollowPlay, CastPlay) reads that object off `rp.e`,
  not the stage data: the meter then reads exactly the stage the game built (safe water, covers, zones), and a toy can be laid through
  scoreStage's `prep` hook instead of a stage row.

## 8. Turnover note
reference/handoffs/engine-core.md, the follow section: "The meter reads the line (METER-4...)" added, "a `line` meter channel" taken off
the Open list (commit d8a482e0).

## Learned
- The meter's form decides the dial: on 2-3 the line's cost is mostly the STOP (how wide the reeds are for the line's length), not the
  leave; a builder tuning open mud will move the meter less than one tuning the reeds.
- Read a piece off the engine object the game built (`rp.e.follow.stage`), never rebuild it from proto data: the safe-water list, the
  covers and the zones are then the game's own, and the toy and the real stage run the same path.
