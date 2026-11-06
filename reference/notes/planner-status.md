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
