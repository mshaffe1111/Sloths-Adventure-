# Planner status (engine-chunks)

Times are Eastern, each read from `TZ=America/New_York date` when the line was written.

## 4:27 PM ET, 11-06

- **The double teach (top priority, due 5:15).** Root cause found on the game's road: gen2 says 1-1's coach lines as stage hints, and Dot swapped
  only stage-hint words for Matt's (dotLines.ts SAID), so coach.jump's old 19-word line held the screen 11 s and coach.nice (cut by Matt) was
  said as a jump tip; the double's own line waited behind them and the first flag's lesson, and a double made before it came took it away
  unsaid. Fix in the tree, being gated now: coach lines swapped by their words, the double line on the teach's entry, said TEACH_LEAD 450 px
  early, the flag before a hard node 1500-2400 px ahead. Planted in gen2/teachSpoken.test.ts (red on 75472091, green). dotGuide's own rules
  unchanged (its v198 test caught my first try). With the porter's 195-203 px band the full bot is rescued 0 times in the teach, 3 of 3 layouts.
- **Floorless spans (w1Pits), next commit.** Each span World 1's pit reader calls a fall gets a soft put-back zone and its banks marked a
  painted drop (the lead's "soft zone and the painted pit"); a floor cannot do it, as findW1Pits reads a floor from one ground line. In the
  scratch tree: 0 unmarked spans on layouts 1-3, w1Pits.test PASS; planted gen2/w1Floorless.test.ts red without the pass, green with it.
- **Branch share:** with floorRoll.catchStyles ['log', 'branch'], median 24%, worst 29%, 0 of 16 seeds over 30% (as is: 32 / 38%, 9 over).
  The one data line goes in with the floors.
- Pushed today: V19 (063f5ef6), the rescue gate and rulers (aa1b2286), V19b one window (15dc6534), no-mirror (148be65d), gapPx and flags
  (76d46d52), flags by hard nodes, forks, catch styles, builtOnGen2 (75472091), Easy twins and the version re-lay (a9592ebd), the quiet line
  binding and the route-wall bot reds (bb55a0a7).

## 5:13 PM ET, 11-06

- **The double teach fix is pushed** (this commit): coach lines in Matt's words (coach.nice cut), the double line on the teach's entry, the
  flag before a hard node 1500-2400 px ahead, Easy carrying Normal's verdicts. teachSpoken.test (red on bb55a0a7, green): the word swap, the
  game-road bot on layouts 1-3, seed 158 at build level. Gen2 suite + Dot + dotGuide tests 395 pass, 0 fail. List rebuilt: 300 of 4094 (7%).
- SAID scope: gen2-only in effect (coach.* rows are 1-1's; old 1-1's CoachOverlay keeps its own text, no swap). Roadmap for next release:
  CoachOverlay (Old 1-1) still shows coach.jump's old words and the cut coach.nice.
- Next: the branch-share line (catchStyles), then the floors by the lead's 4:23 ruling if they fit by 5:30.

## 5:37 PM ET, 11-06: standing down (the lead's 5:21, 5:27 and 5:37)

Tonight's candidate is engine-core 6c5232eca (138 seeds, the Dot fix 25d2d115 in). Nothing below is in it; the work is saved, not live, in
reference/notes/planner-wip/.

### Next week, first: the floors (the lead's 4:23 ruling)

- **The put-back kind.** findW1Pits (src/game/w1Pits.ts) reads platforms only, so a level double gap's soft put-back zone (heartFalls soft,
  no floor by ruling A) reads as a floorless fall, painted water. It learns a third kind, 'putback': it takes the stage's heartFalls, and a
  gap a soft zone covers is that kind. It is painted as a pit floor and needs no step out, since the put-back fires before the floor
  matters. Planted failure: the same gap with its put-back zone removed must read as a fall again (w1Pits.test). The painter
  (protoArt/groundPaint, which calls findW1Pits) paints the new kind.
- **The other 6 spots** (1-1 layout 1 on 11-06; other rolls have their own): mushroom-bank-teach x2 (87 and 109 px slots off its banks),
  hollow-twoway (119 px), the meadow (87 px), drop-bounce-twist (60 px), and log-stair-test-back's 1121 px under its floating logs.
  - Each gets a real soft pit: a floor and steps back up to the NEAR lip (backPit), so a fall has a way out and the stair test cannot be
    walked round.
  - The blocker found on 11-06: findW1Pits judges a floor against ONE ground line, the stage's commonest bank top. gen2's ground rises and
    falls, so a floor laid lip-relative on raised or low ground still reads as water. Fix: findW1Pits reads each gap against its own lips
    (the floor band measured from the lower lip, not from G). It's a shared ruler, so: planted cases first, and every hand-built W1 stage
    must read exactly as before (w1Pits.test and the lock).
  - Interim pass, scratch, in floors-putback-drop.ts.txt: a soft put-back plus a painted drop for every floorless span. It isn't the ruling,
    only the evidence. w1Floorless.test.ts.txt went red without it and green with it, and gave 0 unmarked spans on layouts 1-3.
- **Expected yield.** engine-core's no-unwarned-fall filter passed 1 roll in 80. With every floorless span a pit or a put-back, that filter
  stops cutting for this cause; the bound list now keeps 7% of tries (quiet line, 4 s). I expect the filtered pool to return to about that,
  and I'll measure it rather than promise it.

### Held: the branch bar (Round 11, open)

- branch-bar.patch holds three things:
  - W1 manifest `branchMax: 0.3` (passed through w1World);
  - `floorRoll.catchStyles: ['log', 'branch']`;
  - the verdict in applyVerdicts (gen2.branchMiss, folded by rollErrors), with branchShare.test.
- **My measure:** branch / every platform 60 px tall or less (not broken, bouncy, drift or soil), catches included: median 24%, worst 29% on
  16 proven seeds with catchStyles. engine-core measures 30 px or less and gets a median of 38% even with catchStyles.
- **Waits on the designer** ruling what height "thin" means. Then: switch the filter (one line), re-measure, report the yield, and push it
  with the floors.

### Also open

- Old 1-1 (Matt's "Old" pick): CoachOverlay.tsx still shows coach.jump's old 19-word line and the cut coach.nice. Roadmap, next release.
- The porter: Easy twins (rise 110-114 px), the double gap bands (Normal TEACH 195-205, TEST 205-228), catchStyles data.
- V19c/d/e, the 1-6 neighbour pair (1-1 seed 7 against 1-6, 0.275: the designer is ruling), the seed list's stale "binds at FR9" wording.
