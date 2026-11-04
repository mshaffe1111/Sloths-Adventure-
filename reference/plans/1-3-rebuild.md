# 1-3 Branch Snakes, rebuilt (w8-rope2, plan for the lead, 2026-11-04)

Source: reference/W1-REBUILD-PLAN.md (the lead's table, the corrections of 12:50 PM ET), research 11-04 lines 59, 100, 531, 585,
596-603, and the accepted R-159.1 combat teach. Built in `src/game/protoStage.ts` (plan '1-3') with the World 1 kit, no `fillTo()`.
Top-down still: reference/plans/1-3-rebuild-topdown.png (the ledges are beatTrace's real landings).

## The row (must differ from 1-2 and 1-4 in at least four columns)
| Job | Map shape | Moves fall on (1-3's music, 130 BPM: quarter 0.46 s, half 0.92 s) | Beat feel | Main pair | Look | Signature |
|---|---|---|---|---|---|---|
| tight terrain + the combat teach | high/low split: a high road (snakes, the vault) over a low road (safer, slower, longer) | hops on half notes, with the punch and the stomp on the quarter between | off-beat | punch-daze + stomp: they meet in one move (punch on the quarter, hop on the dazed snake on the next half) | mid-canopy branches, snake country | the first stomp vault, onto a raised bank only the spring reaches |

## The nodes (7; a checkpoint on a 200 px safe apron at every node's entrance)
The order is the research's (intro, ramp, spike, rest, counter-melody, climax, cool-down), but 1-3 places its parts its own way: the
spike comes EARLY and is the split itself (1-2 builds to its drop), its rest is SHORT (one Dot line), and its counter-melody is ropes.

| # | Node | Seconds (first-timer, Normal) | Density (actions) | What is in it | Beat | Hazard on the line he avoids |
|---|---|---|---|---|---|---|
| 1 | Intro | 0-20 | 1 / 2.5 s | Floor to the first branches; the sleeping snake to learn on. Dot: "Punch to daze it, then hop on it!" | half-note hops, one punch | none (teach) |
| 2 | Ramp | 20-40 | 1 / 1.2 s | Branch hops on the half note; two awake lunge snakes on the branches, each met punch (quarter) + hop on (next half). | half + quarter (off-beat) | where the trace hops a branch, a snake waits on the walk-under line |
| 3 | Spike: the split | 40-75 | dense (high) / light (low) | The road forks. HIGH: narrow branches, three snakes, then THE TEACHING VAULT (Dot: "Stomp it, thumb on the glass, and fly!"): the raised bank only the spring reaches, its petals on top. LOW: the root floor under it, wider, slower, one soft pit and a mushroom, no petals. They rejoin at node 4. | high: quarters between halves; the vault breaks it (a 1.4 s spring = 3 quarters held) | high: the snake on the lip of every short hop; low: a snake where the trace runs, so the low road is slower, not free |
| 4 | Rest | 75-83 | none | A wide branch with a view back over both roads; Dot's wayside line; the keepsake seed seen up high, out of reach (teased). | none | none |
| 5 | Counter-melody: ropes | 83-110 | 1 / 1.5 s | The shimmy rope (the move 1-3's clear teaches) over a gap, a snake guarding its far end: a different pair (rope + snake), on a slower whole-note pulse. | whole notes on the rope, the punch on the drop-off | a snake on the rope's landing, punched from the rope's end |
| 6 | Climax | 110-130 | densest, 15-20 s | Everything taught: snakes on branches at the off-beat, a punch-daze-stomp chain of three, ending AT the exit run. | quarters between halves, no gap repeated 4 times | snakes on every skip line |
| 7 | Cool-down | 130-135 | none | A downhill branch, a slide to the shrine. | none | none |

About 2:15 for a first-timer on Normal; a skilled player never under 2:00 (the high road cut is measured, not assumed).

## Rules it meets
- Every flow and tight node (2, 3, 5, 6) is laid on beatTrace's run at 130 BPM, from `stageMusic()`, never a typed number. Its feet
  land where the branches go, and no jump gap repeats 4 times in a row.
- Hazards sit on the line the trace avoided (line 59): holding right past a snake, or skipping a hop, costs a hit.
- No flat walk over 2.5 s with no input: a slope, a hop or a critter goes in, never only a flag.
- Something bites from node 2 on. Easy stays a cruise: soft pits under every vault and gap, Easy's longer daze and tell (R-159.1).
- The goal (snakes) sits on the natural path. Both roads carry enough snakes to make the goal. It is set from bot-fix's re-measured
  bot after the thumb fix, never provisional.
- The combat teach is unchanged and accepted: the sleeping snake, Matt's three lines, the raised teaching vault (crossable on the
  spring alone; proven in w1TricksPlay.test.ts and firstTimerBot.test.ts).
- Existing World 1 art only; no Hugging Face spend.

## Proof before report
- The node table measured from the bot run: seconds and actions per node, and the beat hits against the 130 BPM grid.
- The fun gate's 1-3 counts down (funknown.json lowered), and 1-3's "like the stage before" flag gone against the new 1-2.
- Stills of every node, upright and sideways, and a top-down still of the whole stage with the two roads coloured.
- The full gate, every line pasted.

## Traced (beatTrace on w1-rhythm, `stageBpm` = 132.9 BPM for 1-3, not 130: the music's tempo times its stage factor)
| Node | Bars (8 eighths each) | x (px) | Take-offs per s | Skip-line hazard spots | Dead walks over 2.5 s | checkTrace |
|---|---|---|---|---|---|---|
| 1 Intro | h......./......../h......./........ | 400-2859 | 0.28 | 2 | 2 (filled: the sleeping snake, a critter) | ok |
| 2 Ramp | h...h.../h......./h...h.../h....... | 2859-5318 | 0.83 | 9 | 0 | ok |
| 3 High road | h...h... x3 | 5318-7262, up to 150 px high | 1.11 | 14 | 0 | ok |
| 3 Low road | h......./....h... x2 | 5318-7777 | 0.55 | 0 (a snake set on its run) | 0 | ok |
| 6 Climax | h...h.../h..o..../... (5 bars) | 9800-12773 | 1.11 | 14 | 0 | ok |
Nodes 4 (rest), 5 (ropes: the kit's shimmy rope) and 7 (cool-down slope) aren't traced; ropes and rests aren't beat placements.
The twist (rule 2): the vault's spring holds about 3 quarters in the air, so it breaks the half-note hops he has just learned.

## For the lead to rule on
- The pair "in the same move" (rule 1). Your example is a stomp-vault off a snake onto a crumbling branch, but W1-REBUILD-PLAN gives
  1-4 the job of teaching creaking limbs. So 1-3 can't require a crumble before it's taught. My proposal: 1-3's pair is punch-daze +
  stomp, meeting in one move (punch on the quarter, hop onto the dazed snake on the next half). The climax ends on a vault off a snake
  onto a branch. Or, if you want the crumble, it's taught first in 1-3 (a soft one over a soft pit) and 1-4 reuses it.

## Goal band, proven per road (2026-11-04, the lead's ruling: Matt's 70-80% band, reachable on either road)
Normal asks 75% of the snakes (goals.ts withGoals); Easy asks the fixed kid bot's lowest run on five rolls (8; it made 8-10).
Each road carries three snakes of its own (high: two on its branches and the vault's lip; low: three on the floor), and the ramp's
branches stand over ground with a pit under each gap alone (one long pit under them was a floor to walk along beneath every snake).
The fixed adult first-timer, seeds 1-8, steered down one road (its route traced with the other shut; on the low road the high road's
branches and snakes are out of play, the goal as loaded, so its three count as missed):

| Seed | High road: snakes / goal | Low road: snakes / goal |
|---|---|---|
| 1 | 19 / 17 | 19 / 17 |
| 2 | 17 / 17 | 18 / 17 |
| 3 | 20 / 18 | 20 / 18 |
| 4 | 18 / 17 | 18 / 17 |
| 5 | 17 / 17 | 18 / 17 |
| 6 | 18 / 17 | 18 / 17 |
| 7 | 20 / 18 | 20 / 18 |
| 8 | 19 / 17 | 19 / 17 |
Every run reached the shrine in 135-179 s. The high road's margin is thin (two rolls at exactly the goal).
