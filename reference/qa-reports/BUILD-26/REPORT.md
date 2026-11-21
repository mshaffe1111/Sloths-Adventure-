# BUILD-26f (on t-build-26 from 42304b76d, rebased on 2f188c552): the Progress rewind, toy first, four cuts on 2-6 x40. Started 6:32 PM ET 11-21 (by `date`)
Commits on t-build-26: 0bc969bce (the first cut, pushed too early: before 1-4's rows, against the packet), 79e596bf2 (b26f/dbgOff.txt,
b26f/win.mts), 007480469 (rows), **d18b03d5f (the lead's ruling: 0bc969bce REVERTED; the bot equals 2f188c552's)**, this REPORT.
NOT on the branch (local branch b26f-wip, the lead's three conditions first): e5fc37273 (= bbc21cb2d, the third cut) and
30ada3574 (the fourth cut) and **fe3d3d6ca (the fifth cut, the candidate)**. Rows (castBots x40 both settings, `--par 2`) in b26f/rows/, by the tree's hash.
Trees (D115, frozen detached worktrees, node_modules linked): base 2f188c552, fix4 30ada3574, fix5 fe3d3d6ca (scratchpad; deleted at the box).

## EXACT NEXT STEP (the next level builder)
1. **The candidate is fe3d3d6ca on the local branch b26f-wip (NOT on t-build-26; t-build-26's bot = 2f188c552's since the revert
   d18b03d5f).** Recreate it on the new tree: `git cherry-pick 0bc969bce 144d79032 bbc21cb2d 30ada3574 fe3d3d6ca` will conflict; take
   instead the net diff `git diff 2f188c552 fe3d3d6ca -- tools/inspect/firsttimer.ts tools/inspect/castBots.test.ts` (fe3d3d6ca
   is in this clone's objects; if the clone is gone, the change is: Progress.under + UNDER_REACH; relocate's `band`; in after() the
   `far`/`under`/`rides` lines and `fell = far`; the toy, last test of castBots.test.ts, as this REPORT describes).
2. **Trace the 7 lost 2-6 rows on fe3d3d6ca, two runs per cause** (b26/trace.ts with a stderr print at the rewind, as b26f's cut-3/4
   traces): adult N 11 + kid N 23 (fell back 3 times at x ~1140), adult N 37 (x 295/842), kid E 12, kid E 30 + adult E 26 (the dips).
   Fix the bot cause generally, toy first, then 2-6 x40 again against b26f/rows/r26-2f188c552.jsonl: no tier drop, lost rows named.
3. **1-4 x40 against b26f/rows/r14-2f188c552.jsonl:** RUNNING on fe3d3d6ca when this was written (rows to b26f/rows/r14-fe3d3d6ca.jsonl, diff with b26e/diff.py). The moved rows to the lead BEFORE the fix lands (packet; the lead's ruling).
4. The lead's three conditions to land: 2-6 no tier drop (cut 5 meets it), toy and plant hold (they do on fe3d3d6ca), 1-4's moved rows
   with the lead. Then push as ONE commit on t-build-26 (rebase; never force) and send the hash.
5. Then rule 28 on the landed bot: castBots x40 both settings on 2-1..2-5 against 2f188c552 (2-3 ends at a sealed door on base too:
   KNOWN, compare rows only), tierBots 1-1 9/9, castBots.test.ts whole.
6. Then the lead's 1-4 spot C (PROVEN BOT by ENG-26o, ff826a914): tools/inspect/towerRoute.ts:86, the squeeze's strict span
   `Math.min(a.x, b.x) <= d.x && d.x <= Math.max(a.x, b.x)` becomes 'within a hand's reach of the span' (pick and justify the number;
   ENG-26o's trial used 30 px each side), a toy and its plant, x40 on 1-4 and 2-6, 1-4's moved rows to the lead before it lands. A and
   B: whatever class ENG-26o names. Then the 2-6 relist under --proven and its yield (packet step 4).

## The cause (BOT, settled by a print, b26f/dbgOff.txt: 2-6 adult N 26 on 2f188c552)
After his fall from the leg (y 3741) to the floor (y 4118), the fall-back rewind (`prog.off(p) > 260` for 0.5 s, then grounded) never
fired: each of his hops along the floor brought `off` under 260 in the air (221, 230, 302 ...), and `offRoute` went back to 0 (0.17,
0.20, 0.50 -> 0); a hop's top also pulled cur along the leg (Progress.step, `bd < 160`): cur 424 (1167,3741) -> 420 (1262,3741). So
cur stayed on the leg 379 px over his head and he hopped under it until a late still moment or a rescue (19.6 s there).
## The fix (bot, general, firsttimer.ts): Progress.under
He stands more than a double's reach (UNDER_REACH 175 px) under cur's point and a route point lies about his height (|dy| <= 80, within
LEVEL_REACH): the rewind clock runs through his hops; the rewind takes only points within 80 px of his height; and a rewind by `under`
alone is never counted toward 'fell back down from here 3 times'.
- **Toy (castBots.test.ts, the last test):** 2-6 seed 26's ground there (floors, the leg with its dips; the seams opened to 40 px gaps
  so he hops as he did; the vine 790 px off so no hop drifts him to it). **RED on 2f188c552** (his place goes back to the floor at
  4.5 s); **GREEN** on the fix (1.23 s, he climbs onto the leg, no rescue). **Plant** (`prog.under = () => false`): his place stays on
  the leg through the hops (> 2.5 s). Honest limit: in the toy the planted bot does get back late (a still moment at ~5.6 s); on 2-6
  none came. castBots.test.ts 16/16; tsc clean.
## 2-6 x40, row for row against 2f188c552 (rule 28; b26e/diff.py)
| tier | 2f188c552 | 0bc969bce (cut 1) | 144d79032 (cut 2) | bbc21cb2d (cut 3) | 30ada3574 (cut 4) | fe3d3d6ca (cut 5) |
|---|---|---|---|---|---|---|
| kid N / E | 29 / 24 | 20 / 17 | 29 / 24 | 29 / 25 | 30 / 26 | **31 / 26** |
| adult N / E | 33 / 24 | 23 / 27 | 32 / 30 | 32 / 30 | **32** / 28 | **33 / 29** |
| child N / E | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 | 40 / 40 |
| middle N / E | 40 / 40 | 40 / 39 | 40 / 39 | 40 / 39 | 40 / 40 | 40 / 40 |
| expert N | 40 | 40 | 40 | 40 | 40 | 40 |
- Cut 1: every `under` rewind counted as a fall-back: three hops = 'fell back down from here 3 times' and a rescue (most at x ~1102).
- Cut 2 (counted only after a takeoff 175 px over the landing): falls of 175-370 px the old rewind never saw became counted rescues.
- Cut 3 (never counted): adult N 3, 11, 37 still lost. Traced (adult N 3, a print on a copy of bbc21cb2d): at t 104.3, x 1023 y 1076,
  the `under` rewind took cur to (1024,1577), **500 px UNDER him** (relocate's level rule takes any point at his height or below);
  from there the far-off rewinds were three falls and a rescue. Cut 4: the band (|dy| <= 80) for an `under` rewind.
- Cut 4: 16 gained, 10 lost; adult N still 33 -> 32 (3, 11, 37 lost; 33 gained). Traced again (adult N 3 on a copy of 30ada3574): at
  t 104.3 he rides the great wheel's car at its bottom (x 1023, y 1076; wheel cx 1101 cy 879 R 200), under the route over the wheel by
  design; the `under` rewind took cur 400 px on (1422,1002), then far-off rewinds, three falls, a rescue (base: no rescue, 119.8 s).
  Cut 5: `under` never fires while he stands on a moving piece (type moving or drift, or a wheel's car).
- **Cut 5 (fe3d3d6ca): NO tier drops against 2f188c552; 16 rows GAINED, 7 LOST** (b26f/rows, b26e/diff.py). Gains: kid N +2, kid E +2,
  adult E +5. The 7 lost rows (each a rescue, not yet traced, two runs per cause still owed): adult N 11 and 37, kid N 23 and 27, all
  'fell back down from here 3 times' at x 1132-1146 (the same leg's foot, y ~3740) or 295/842; kid E 12 at 926; kid E 30 and adult E 26
  in the dips at x 1151-1208. Lost rows that are not a tier drop are still rows that moved: traced next, before the lead is asked to land.

# ENG-26o (on t-build-26 from 4b6ce810f): 1-4 cause C PROVEN **BOT**, not LAY: the bot's tower route (tools/inspect/towerRoute.ts line 86, the out-and-back squeeze) misses by 5 px; one line widened clears all six of C's rows. No src change, no fix committed (BUILD-26f owns the bot). Started 6:40 PM ET 11-21 (by `date`)
Commits: this REPORT and eng26o/ (trace-c-kid-easy-10.txt: the route's points around s17:top and the bot frame by frame; shape.mts: every
climbable vine near a spot and the bough at each vine's top; towerRoute-oneline.diff: the line tried). Trees (D115): frozen detached
worktrees at 4b6ce810f (head), 4ea253b8c (OLD), and a COPY of 4b6ce810f with stderr prints (never committed). Nothing on 0bc969bce.

## EXACT NEXT STEP (BUILD-26f, the bot member; base t-build-26 after its revert of 0bc969bce)
1. **The fix is the bot's, in tools/inspect/towerRoute.ts line 86** (towerCorners, "no going on past the climb and back along one floor"):
   `Math.min(a.x, b.x) <= d.x && d.x <= Math.max(a.x, b.x)` drops the walk out to the leg's exit b only when the next turn's vine d lies
   BETWEEN where he came onto the floor (a) and b. On 1-4 Easy 10 he comes onto s17:top up the field vine f1 at a.x 781, the leg's exit is
   the bough's left end b.x 481, and the way on d.x 786 stands **5 px past a**: the squeeze does not fire, the route walks 781 to 481 and
   back to 786 over the same bough, and Progress flips between the outbound point 874 (619, next 596) and the return point 885 (598, next
   622), 21 px apart, every 1.2 s: he stands at x 607-610 from 95.1 s to the rescue at 117.9 s (eng26o/trace-c-kid-easy-10.txt).
   **The general form:** d within a hand's reach of the span, not strictly inside it. Tried on the COPY: `- 30` / `+ 30` (30 px: about half
   GRAB_REACH 54, so a vine he could take from where he stands on arrival counts as "here"; the bot member picks the final number and says
   why, GRAB_REACH itself is the other candidate). Result on the copy, castBots' own call (cap 1200, dotSetting), Easy:
   kid 10 shrine 128.2 s no rescue (was rescued at 610); adult 10 115.7 s none; middle 10 134.3 s rescued only at 1102 (the head: 1102
   AND 559; 1102 is a different, older spot: x 1190 y 5005 "fell back down 8 times"); kid 37 125.0 s, adult 37 118.3 s, middle 37
   132.1 s, all with no rescue. Then the plant (a toy in the towerRoute test: a turn's vine 5 px past the arrival, RED on today's line),
   castBots 1-4 and 2-6 x40 both settings row for row (any tower stage's route can move; 2-6 is a tower), rule 28.
2. **Then 1-4 relists ONCE** (the lead's ruling), after every fix for its spots lands, and the yield on 1-400 (methods/seed-list.md).
3. **Spots A (x 1036 Normal) and B (x 1115 Easy): ONE shape, and NOT C's** (no two vines a few px apart; eng26o/trace-a-b.txt,
   plats.mts). Section s3 is a raised row r1, r2, r3, z, 80 px over a lower floor s3:s, with the way-on vine 5 standing on z.
   A (kid Normal 7): r1 364-474 @9987, r2 634-744, r3 744-854, z 854-1054, s3:s 334-974 @10067, vine 5 x 1036 (9706-9987). His hop
   off r1 (a press at x 478, 15.07 s) rises 57 px and comes down at x 613 y 10058, short of r2's left end 634: onto s3:s. He walks
   right on s3:s with the route 80 px over his head (pad {right}, no jump), off s3:s's end at 974 (62 px short of the vine) and down
   281 px to 10348; rescued onto s4:b at 19.3 s. B (adult Easy 17): r1 366-524 @10139, r2 657-815, r3 775-933, z 933-1181, s3:s 334-1022
   @10219, vine 5 x 1163: the same, a jump off r1 lands at x 682 on s3:s, he walks under z and off at 1022 (141 px short), 281 px down.
   The vine's foot is out of his grab band from s3:s (80 px over him; the engine takes up to 25 px under a foot), so only a hop up
   onto r2, r3 or z gets him to it, and in these traces no bot makes that hop. **BOT or LAY: NOT proven.** BOT if decide has no "the route is a
   hop over my head on a thin bough: hop up" choice (the likelier, since 80 px is one plain jump); LAY if the floor under a hop row may
   end short of the row's way on over a 281 px drop (a child walking it falls off the same end). Next: print decide's branch per frame
   while he walks s3:s under z (A, kid Normal 7, 15.9-17.2 s), as C was traced.
   **A third spot, middle Easy 10 at x 1102 (also on the head):** a 40 px step UP from s14:b (520-960 @5045) to s14:c (960-1208 @5005,
   the turn vine 41 x 1190 on it). He walks right under s14:c's lip off s14:b's end and drops 320 px to 5365, 8 times. Same family as A
   and B (a thin bough a hop above the floor he walks, never hopped onto). Not proven either.

## How C was proven (packet step 1)
- **The placement probe again: still not a proof, and not used.** RealPlay.stand(x, y) takes his FEET (y = the bough's top; the bots'
  own takeoff harness calls stand(sx, from.y)); ENG-26n's drop was real, but on this tree a stand on s17:top still settles off it at
  x 600-790 (y 3359 after 3 frames), and on OLD an up press took no vine anywhere, so a hand placement says nothing about the engine's
  pick. I traced the real run instead.
- **The real run, frame by frame** (kid Easy 10, head copy): he climbs field vine 53 (x 541) to the bough, lands at 610 @3342 at 95.1 s,
  and from then to 117.9 s his pad is {} or a brief {right} while Progress' cur flips 874 <-> 885. The route (towerRoutePts, the
  tower's own laid route) is: up f1 x 781 to 3366, out onto the bough at 758, LEFT to 481, back RIGHT to 763, up x 786. So the engine
  never got an up press at the way on: the stall is the bot's route, not the vine pick (the engine's pick skips f1 from on the shut gate:
  overShut, fromAbove; ENG-26n read the same).
- **Why OLD passed and Normal passes:** OLD's field was 889-1055 under the gate 712-1072: he came on at a field vine right of 786 and the
  exit 712 lay left of it, so 786 was inside the span and the squeeze fired. Normal: the way on 451, f4 at 493: inside again. gateRun
  moving the field left put the arrival vine 5 px short of the way on: the lay made the case, the bot's rule failed it.
- **Is the 5 px pair itself LAY?** My read: no. The two do not overlap in height: f1 hangs 3342-3702 under the bough, the way on stands
  3061-3342 over it, so at any height there is one vine; a child sees one vine running up through the bough, and that IS the way on.
  The engine never offers f1 from on the bough. The lead rules (below).

## For the lead (rulings, priority 'next')
- C is BOT: the exact line is above for BUILD-26f; no src change from me, so no src suite was run (packet step 3: "if src changed").
- Do you want the lay to keep a stand-off between a way-on vine and a field vine hung under the same bough anyway (the packet's step 2)?
  I advise NO for this release: the pair is vertically disjoint, it reads as one way up, and the bot fix alone clears all six rows.

## Lessons applied
D111 (the box by `date`), D113 (the install in the background; the trace runs were seconds, not heavy runs: no heavy run used), D115
(every measurement on frozen 4b6ce810f / 4ea253b8c or a copy of 4b6ce810f, none on 0bc969bce, per the lead's heads-up), D109 (no clock
times to the lead), D102 (read lean), rule 28 (traced before fixed; the fix not mine to land), rule 22 (the fix is the general squeeze,
not a 1-4 case). I did not find D96, D107 or D114 by those ids in reference/LESSONS.md on this checkout and did not read them: said plainly.

## Learned (for level.md, proposed)
- A route squeeze that asks "is the next point strictly between" fails when two pieces stand a few px apart: compare within a reach,
  not strictly inside. When a lay change moves pieces closer (gateRun), re-run the bots' route corners on the moved spots first.

# ENG-26n (on t-build-26 from 30570b384): 1-4 cause C: the gate-band verdict planted RED and the lay fixed GREEN, BUT THE BOTS STILL STALL (0/6): cause C is NOT the bridge and stays OPEN. Started 6:22 PM ET 11-21 (by `date`)
Commits: 2f188c552 (the verdict towerGateRoofs, the band gateBand, the lay's keep-out, the unit test), this REPORT. Saved: eng26n/gate.mts
(`npx tsx eng26n/gate.mts <tree> 1-4 <setting> <seeds...>`: the gen2 roll, its tower misses, the gate-band refusals, the lay's wood by s17).
Tree (D115): frozen detached worktree at 2f188c552, node_modules linked.

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit; long runs in the BACKGROUND on frozen worktrees)
0. **The lead rules first** (below, 'For the lead'): keep 2f188c552 (the verdict is the types.ts promise's own; it moves 10 of 1-4's 100
   listed layouts) or revert it, since it does NOT clear the stall. Then the stall itself: **trace the bot on s17:top, Easy seed 10**
   (frozen 2f188c552 and OLD 4ea253b8c side by side; `FT_TRACE=1 npx tsx reference/qa-reports/BUILD-26/eng26m/trace.mts <tree> 1-4
   "kid easy 10"`, plus a stderr print in the bot's decide on a COPY, as BUILD-26e's dbg tree did, never committed): from his arrival on
   the gate (about 98 s, x 607, y 3342) to the rescue (about 121 s) there is NO jump and no climb, though the way on, the vine x 786
   (3342 up to 3061), stands on the same bough 179 px away. Name it BOT (BUILD-26e) or LAY by what decide chooses there.
   **The lead suspect (LAY, found at the box, not yet proven):** the way-on vine x 786 stands **5 px from the field's own vine f1 at
   x 781** (f1 hangs 3342-3702 under the gate, the way on climbs 3342-3061 over it: two vines at one x, one ending where the other
   starts). On OLD 4ea253b8c the gate was 712-1072, its field vines 889-1055, and the way on x 786 stood 103 px from the nearest
   (OLD's kid: on the gate, a single jump from s18:b at 94.2 s, no rescue; eng26n/trace-kid-easy-10-OLD.txt). gateRun moved the field
   left under the same turn. On Normal (all pass) the way on x 451 is 42 px from f4 at 493. So first: print which vine the engine
   grabs when he presses up at x 781-790 on s17:top (the vine finder), on a COPY of 2f188c552. If it is f1 (or he flips between them),
   the fix is general in the lay: a vine standing on a piece keeps a stand-off (at least his body, 44 px; CLIMB_CLEAR's sense) from every
   vine hung under that piece, with a verdict planted RED on Easy 10 and 37; then the relist, the yield and castBots x40 as below.
   What I read at the box: the engine's pick (src/game/engine.ts, the tree_climb loop near `fromAbove`) skips a field vine from on top of
   its gate (`fromAbove`: not taken by its very top from above; `overShut`: not from on a shut gate's bough), and takes the FIRST vine in
   the list within climbReach. So the engine alone may well take the way on; the bot's choice is then the suspect (BOT), and the 5 px
   pair still the likeliest thing that misleads it. My probe (eng26n/probe.mts: stand him on s17:top at x 600-764, hold up 60 frames)
   is **INCONCLUSIVE, not claimed**: `RealPlay.stand(x, y)` sets his body's top, and both my placements dropped him off the bough on
   BOTH trees (OLD too), so it says nothing yet. Fix the placement (feet on the bough: y = bough.y - p.height, then settle a frame on it)
   before reading it.
1. **Seed lists (heavy run 1, done):** 2-6 PASS 100/100 (it has no sealed piece; nothing of it moved). 1-4: the verdicts refuse 0 of 100
   listed seeds, but 10 replay a different layout from their search (seeds 1, 2, 5, 6, 7, 8, 10, 14, 16, 18, both settings: "rebuild the
   list"), so 1-4 MUST be relisted if 2f188c552 stays.
2. **1-4's yield on seeds 1-400** (keep it high; compare with ENG-26m's relist count) and **1-4 relisted once more** (methods/seed-list.md:
   survivors in their order first), **pins re-pointed after the whole suite** (D29, rule 20), **lockall** (only 1-4 and 2-6 may move).
3. **castBots 1-4 x40 both settings** (the final bar): OLD 4ea253b8c with the old bot vs the new head with every bot fix (BUILD-26e's
   42304b76d and after) on one chain, frozen trees, `--par 4`, eng26m/rowdiff.mjs: no tier's pass count may drop; seeds 10 and 37 Easy
   (kid, adult, middle) are cause C's rows and must pass; any miss left traced and named BOT (BUILD-26e) or LAY.
4. **The src suite** on the new head, run_in_background, its verdict appended.

## Step 1: the plant, then the fix (frozen nothing: single rolls on this checkout, seconds each)
- **Where the bridge came from.** 1-4 Easy seed 10 (gen2 19018) on 30570b384: s17:top 481-841 @3342 (sealed), its foot 295-1027 @3702
  (gateRun's run-out at both ends), the way on the vine x 786 (3342 up to 3061), s18:b 360-760 @3061, and the lay's run-on of s18:b to the
  right wall, 760-1280 @3061 (towerCatches step 3, "the piece itself run on to the wall": the run off s18:b at full speed comes down
  past the gate's end). Seed 37 (46261) is the same shape 377 px higher (bridge 760-1280 @2684 over s17:top @2965).
- **Why nothing refused it.** towerCatches' byGate keeps the lay's wood out from just under a gate's level (GATE_LEVEL 30) up to
  LEAP.up (221 px) over it, within a hop ACROSS of the bough's own span. The bridge is 281 px up (the storey the gate's way on climbs
  to), so it was outside; and towerGates only asks whether wood above the gate is REACHED by a hop, so a roof was never its question.
- **The verdict (planted first):** tower.ts `gateBand(g, own, vines)` = across the sealed section's FULL width (its own wood: the foot
  with gateRun), from g.y + GATE_LEVEL up to the higher of LEAP.up over it and the top of a vine standing on it (minus 8 px);
  `towerGateRoofs` names any of the lay's own wood (towerCatches' boughs, recorded as tower.lay; each gate's own section as tower.gates)
  in it: `tower: the shut gate at x .., y .. has the lay's wood in its band (x ..-.., y ..-..): the piece at ...`. Judged with the
  tower's other verdicts (pipeline: towerMiss), so a roll with one is refused by name.
- **RED** (the verdict in, the lay's keep-out out, on this checkout): 1-4 Easy seeds 10 and 37 both THROW "no seed of 24 ... builds
  cleanly (... tower: the shut gate at x 540-980, y 7895 has the lay's wood in its band (x 354-1166, y 7606-7925): the piece at x 0-584,
  y 7614 ...)": every roll of the search is refused, listed ones included.
- **The fix in the lay (rule 22: general, every sealed piece, no stage named):** the same bands go into towerCatches' keepOut before it
  lays (pipeline: one box per sealed id, in the column's frame), so its run-ons, bridges and shelves are placed outside them and the roll
  is not thrown away.
- **GREEN** (2f188c552): Easy 10 builds on 19018 and Easy 37 on 46261 (their listed rolls), no tower miss, no band refusal; Normal 10
  and 37 the same (19018, 46261). The bridge is gone: the gate 481-841 now has 81 px of open sky past s18:b's end (760), as Normal's
  passing layout had 44 px, and the run off s18:b is caught at 843-1023 @3441 + 1023-1280 @3441 (under the gate's level, outside the band;
  a hop back onto the gate's end, which is the gate's own way on again, not a way round it).
- **Tests:** `npx tsc --noEmit -p .` clean; tower.test.ts `towerGateRoofs (planted, ENG-26n, 1-4 cause C)` with seed 10's numbers
  (the band 295-1027 x 3053-3372; the bridge named; the next storey, past the foot, and under the level clear; a shelf over gateRun's
  run-out named; with no way on, LEAP.up) and towerGates' planted test: 2/2.
- **NOT RUN here** (the box): the castBots rows for seeds 10 and 37 (so the bots' pass on the new layout is NOT claimed), the yield,
  the relist, pins, lockall, the src suite (D96: none is claimed).

## Heavy run 1: seed lists (frozen 2f188c552; eng26n/list-1-4.txt, list-2-6.txt)
- `seedlist.ts 2-6 --check`: **PASS** (100 seeds, each clean on both settings), 15 s.
- `seedlist.ts 1-4 --check`: **FAIL**, 125 s: "the verdicts refuse 0 of 100 listed seeds", but seeds 1, 2, 5, 6, 7, 8, 10, 14, 16, 18
  replay differently from their search on both settings (the lay's catches by the gates moved): the relist's input.

## Heavy run 2: castBots 1-4, cause C's six rows (frozen 2f188c552 = BUILD-26e's 42304b76d with every bot fix + this lay fix; eng26n/cast-c.jsonl)
`castBots.ts --stage 1-4 --seeds 10,37 --bots kid,adult,middle --setting easy --json`, 9 s:

| bot | Easy 10 | Easy 37 |
|---|---|---|
| kid | FAIL, rescued 1, stuck x 607 "in a dip 281 px deep" | FAIL, rescued 1, stuck x 607 the same |
| adult | FAIL, rescued 1, stuck x 610 the same | FAIL, rescued 1, stuck x 610 the same |
| middle | FAIL, rescued 2 (x 1190 fell back 8; x 617 the dip) | FAIL, rescued 1, stuck x 580 and 583 the dip |

**0 of 6: the stall is unchanged.** All six reach the shrine with the goal 1/1 but are rescued off s17:top. The kid's trace
(eng26n/trace-kid-easy-10.txt): jumps at 87.4 s (814,4023 -> 943,3983) and then none until 121.6 s, from s18:b (377,3061) after the
rescue. So the bridge was not what held them: with it gone the gate has 81 px of open sky (760-841) and the way on, the vine x 786, stands
in it, its top 26 px past s18:b's right end (760) (cause A's shape: a vine top 26 px past a bough's end). On Normal, where all three pass,
the way on is the vine x 451 standing on the gate 433-793, its top 26 px past s18:b's LEFT end (477): the mirror. What differs is not yet
known; it is the next step's trace.

## For the lead (rulings, priority 'next')
- **Cause C is NOT fixed; ENG-26m's table read the roof as the cause and the bots say otherwise** (0/6 with the roof gone). My view as
  the one who built it: keep the verdict and the keep-out (the promise in types.ts was broken silently and now has a check), but it is
  not the stall's fix, and it costs a 1-4 relist (10 listed layouts moved). If the relist cannot ride with the stall's real fix, revert
  2f188c552 rather than relist twice.
- **The band's height is the gate's own way on, not a hop.** The packet says "within a hop"; by the tower's own numbers 281 px is past a
  hop (LEAP.up 221; TOWER.clear 257), so a hop-tall band would have stayed GREEN on the base. I measured it by the vine standing on the
  gate (the storey it opens onto), which is what roofs it. Your call whether that is the rule's wording in types.ts SectionPiece.sealed.
- **Under the gate's level is not in the band** (GATE_LEVEL 30, as towerGates reads level): the lay's shelves 39 px under s17:top at
  246-426 @3381 (55 px from its end) stay, as on the base. Wood within a hop UNDER a gate is a way ONTO it that skips the field's vines;
  whether that is a sealed piece's promise too is the lead's ruling (widening it moves more of 1-4's rolls).

## Lessons applied
D102 (read lean: the packet's list only), D111 (the box by `date`: start 6:22 PM ET, hand over by 6:50), D113 (every long run in the
background), D115 (the heavy run on a frozen detached worktree), D109 (no clock times to the lead), D96 (nothing claimed that did not run),
D29/rule 20 (no pins re-pointed: the relist and the suite are not done), rule 22 (the fix is general: every sealed piece's band),
rule 19 (the refusal sits in the roll's own verdicts, which the list's check asks).

## Learned (for level.md, proposed)
- A promise in a doc comment ("the lay adds nothing within a hop of a sealed piece") needs its own verdict, or a change elsewhere (here
  gateRun's wider foot moving the gate under the next storey's run-on) breaks it silently. Proposed check: every SectionPiece flag that
  restricts the lay has a named verdict in the roll's tower misses, planted with a toy.

# BUILD-26e (on t-build-26 from ea8ed97fd): cause A planted, cause C fixed (one fault behind 12 rows), 2-6's child, middle and expert 40/40. Started 6:08 PM ET 11-21 (by `date`)
Commits: cc62d6b99 (the vine-foot toy planted in castBots.test.ts), cef59bafe (bot: the climb-jump for a vine steers to the vine's x and
lets go there), this REPORT. Saved: b26e/ (rows/: castBots rows r26-*/r14-* for base 5be367dd8, head ea8ed97fd, fix cef59bafe; diff.py: row for row
on (bot, setting, seed), per tier pass counts; win.mts: platforms and vines in a window; ft*.txt, traceC.txt: the traces).
Trees (D115, frozen detached worktrees, node_modules linked): base 5be367dd8, head ea8ed97fd, fixc cef59bafe; traces on copies (tr, dbg:
cef59bafe plus a stderr print in decide/startJump, never committed).

## EXACT NEXT STEP (the next level builder; base t-build-26 at this REPORT's commit; long runs in the BACKGROUND on frozen worktrees)
1. **2-1..2-5 x40, base 5be367dd8 vs cef59bafe, row for row** (`castBots.ts --stage 2-N --seeds 1-40 --setting both --par 2 --rows ...`,
   then `python3 reference/qa-reports/BUILD-26/b26e/diff.py <base rows> <fix rows>`): **2-1 and 2-2 DONE: unmoved, no row moved** (2-1: kid N 32, every other tier 40/40; 2-2: kid N 24, every
   other tier 40/40; rows in b26e/rows/). **2-3: all 360 rows IDENTICAL base vs fix (unmoved), but RED on BOTH: 359 of 360 runs end
   at a 'sealed door' with the goal 0/5** (one 'time'), every bot, both settings, on 5be367dd8 too: a finding for the lead, not caused
   by this branch's bot (not traced: is castBots playing 2-3's goal at all?). 2-4 and 2-5 remain (stopped at the box). What may not move: any tier's pass count.
2. **2-6's remaining misses are all kid and adult (the lead: the adult is the bar), unmoved by both fixes** (no kid or adult row moved).
   On cef59bafe: kid N 29/40, kid E 24/40, adult N 33/40, adult E 24/40. Spread over many spots, not one fault (grouped by the
   fell-back x or the last stuck x): adult E stuck near x 900 (4) and x 300 (3); kid N fell back at x 1130-1145 (3); kid E fell back
   at x 1480 (2), 1070 (2), 960 (2), 930-1000 (2); many "in a dip ~300-350 px deep, a drop ahead, water ahead". Trace two runs per
   spot (`tools/inspect/b26/trace.ts <bot> <setting> <seeds>` on a frozen tree, FT_TRACE=1 for the jumps), BOT causes fixed generally,
   LAY causes to the lead.
   **The first adult spot, TRACED (two runs, b26e/ftAd.txt, on cef59bafe):** adult N 26 t 52.1, x 1109, y 4120, 19.6 s; adult N 33
   t 73.8, x 1099, y 4116, 9.2 s; the same: on the floor #28/#35/#36/#84 (x 825-1700, y 4118) with "the way on is 379 px up" (the
   floor #37/#38/#39 at y 3739, dips #41/#42 at 3809). The way up there is the climbing vine V#6 at x **1587** (3739-4118) at the floor's
   right, or the edge wheel at the left (cx 668, cy 4270). He jumps to and fro along the floor between x ~1040-1130 and x 1270-1540
   (FT_TRACE: 11 and 13 jumps, every one FELL BACK, none reaching x 1587), then is rescued.
   **What turns him (b26e/dbgAd.txt, a stderr print in decide/startJump, adult N 26 t 52-58):** every jump comes from the EDGE branch
   (firsttimer.ts:2839 `if (!drops) return this.decide(dir, ...)`, the floor's seams at x 1125 and 1385 read as edges), and his `way`
   flips +1 / -1 between x ~1120 and ~1290-1350: the route's next point is straight UP at about x 1250 (under #41, y 3809), where no
   vine or step climbs; the vine at x 1587 is never his target (climbUpVine: undefined at every jump, it is 300+ px off). (My first
   reading, that the route slants up through the floors, was WRONG: see the next paragraph.)
   **SETTLED (b26e/dbgAd2.txt: `this.prog.target(p, 200)` and the route's points from cur, same frames): a BOT cause, Progress.**
   His Progress point is ALREADY on the floor above: cur at (1167, 3741), then (1262, 3741), the points running LEFT along y 3741
   (#38/#37's leg). He fell from that leg onto the y 4118 floor, and Progress kept cur up there instead of rewinding to the way up
   (the climb of V#6 at x 1587; printed on adult N 26; adult N 33 is the same floor, the same 'way on 379 px up', not yet printed), so he steers under a point 379 px over his head, turning at it, and jumps the floor's seams. Not the
   route's shape and not the lay. **Fix next (bot, general, a toy first, rule 21):** when he stands on ground well under the route's
   current point (more than a double's reach, about 175 px) and no climb leads up within reach of it, Progress rewinds to the route's
   last point on or near his own floor (the start of the climb that leads up: here x 1587) (`prog.relocate` and how cur advances,
   firsttimer.ts Progress). Toy: two floors 379 px apart, a vine at one end, Progress on the upper leg, him on the lower floor; plant
   (no rewind) RED = he never climbs. Then 2-6 and 1-4 x40 row for row, as above (1-4 is SHIPPED: rows to the lead before the push).
   **Then ENG-26m's 1-4 cause table (064911bf1; the lead: these are this branch's BOT causes):** A at x 1036 Normal (kid 7, 12, 13,
   18, 19, 34; adult 36) and B at x 1115 Easy (adult 17, 19), both by the s3 vine whose top is 26 px past s4:b's end (he falls back off
   it 3 times); D on seed 29 middle (a wall strip now reaching the wall; the route reads 'the way on is 281 px down' instead of the
   vines). C (Easy 10, 37) is a LAY defect, ENG-26n's in src/game/gen2: do not touch; rebase on its pushes.
3. **Then the --proven relist and the yield** (methods/seed-list.md; `castBots --proven <file>` keeps a roll only when EVERY bot,
   kid and adult included, holds at 100 s+): with kid E at 24/40 and adult E at 24/40 on the listed rolls, the yield on today's list
   would be under 60%, so the plan goes to the lead FIRST (packet step 3).
4. Then the stills (packet step 4) only on green bots (rule 29).

## Step 1: cause A planted, cause C traced and fixed
- **The toy, planted (cc62d6b99, castBots.test.ts, the last test):** BUILD-26d's toy decided from the vine's RIGHT (he drifted right in
  his 1.2 s look delay), so both runs climbed. Now he decides from the traced frame's own state: x 236 (14 px left of the vine at 250),
  `way` -1 (he came along the ledge going left), no look delay (mid-run), facing left. **RED on 5be367dd8's bot** (no climbUpVine; a
  copy at 5be367dd8 with the test appended): "lowest y 1351", he doubles off the ledge's end onto the street. **GREEN** on ea8ed97fd and
  on cef59bafe (never below y 1100, ends on the floor over the vine). The plant in the test (climbUpVine taken away) drops to the street.
- **Cause C traced (two runs and more; all the same frame):** child N 23 t 130.5, child N 24 t 119.6 (child N 4 t 133.8, middle N 27
  t 116.0 the same): on #66 (x 1327-1547, y 1556) the climb-jump branch (firsttimer.ts climb-jump, `intend`) fires at x 1495-1497 with
  dir +1 toward the vine at x 1529 (the trial's direction was right), but he HOLDS right the whole double and flies past the vine and
  off #66's end at 1547, to #90 175 px down (FT_TRACE `119.57 double from 1543,1556 hold 0.41 -> 1680,1731 FELL BACK`), 8 times,
  rescued. The vine stands 18 px in from the ledge's end: cause A mirrored.
- **Fix (cef59bafe, bot, general):** in that branch, with a climbing vine and no ledge, `climbToX = trunk.x`: he steers to the vine's x
  and lets go there, as he already did for a ledge (startJump's toX). One line of logic; no stage data.
- **Cause A's leftovers (child N 5, 7, 18)** traced on cef59bafe: all three now 0 rescues (153.3, 156.3, 151.4 s): the same overshoot.

## Step 2: castBots x40 both settings, row for row (rule 28)
| 2-6 tier | base 5be367dd8 | ea8ed97fd (26d trial) | cef59bafe (fix) |
|---|---|---|---|
| kid N / E | 29 / 24 | 29 / 24 | 29 / 24 (no row moved) |
| adult N / E | 33 / 24 | 33 / 24 | 33 / 24 (no row moved) |
| child N / E | 32 / 38 | 31 / 37 | **40 / 40** |
| middle N / E | 39 / 40 | 39 / 40 | **40 / 40** |
| expert N | 39 | 40 | **40** |
2-6, base vs fix: **12 GAINED, 0 LOST** (child N 3, 5, 7, 8, 9, 18, 24, 28; child E 10, 11; expert N 12; middle N 29).
| 1-4 tier (SHIPPED; sent to the lead before the push) | base 5be367dd8 | ea8ed97fd | cef59bafe |
|---|---|---|---|
| kid N / E | 19 / 32 | 19 / 32 | 19 / 32 |
| adult N / E | 38 / 36 | 38 / 36 | 38 / 36 |
| child N / E | 34 / 33 | 33 / 32 | **40 / 36** |
| middle N / E | 37 / 37 | 38 / 38 | **39 / 38** |
| expert N | 40 | 40 | 40 |
1-4, base vs fix: 14 GAINED, **2 LOST: child E 4 and 24**, each rescued once, traced (one line each, two runs, the same cause):
- child E 24: t 116.8, x 231 on #39 (x 234-1164, y 4644): he walks off its LEFT end and the tier bot's late press (the `lateArmed`
  branch, firsttimer.ts ~2502) comes after the coyote time: a double left from the air, down to 20,4948, fell back 8 times, rescued t 121.8.
- child E 4: t 145.5, x 852,2931: the same branch (a late single right off a ledge), down to 1045,3004, rescued t 152.5 at x 958 over #46.
- No vine within 60 px at either (climbUpVine undefined), so neither is the new branch: the earlier decisions changed his random draws,
  and the late press drawn there missed. A child-tier late press failing is the calibrated child (testers' late presses), not a bot
  fault; the tier rose 33 -> 36. **Not fixed** (no cause to fix in the bot); the lead accepted the push (no tier drop vs 5be367dd8).
- **The lead's 1-4 bar (OLD 4ea253b8c with the old bot vs the head) is NOT run here.**
- **castBots.test.ts WHOLE on cef59bafe: 15/15 pass, 0 fail** (the toy included, GREEN with the steer).
- **The hearts test (06096c3b4, w2Arc26 "the climb up the bank village"): GREEN; planted RED** (the rivers term counting `v.safe`
  instead of `!v.safe`: "seed 1: nothing on Normal 2-6 costs a heart" fails), then restored (git checkout; no diff left).
- **tierBots 1-1 on cef59bafe: 9/9 pass.** 2-1..2-5: NOT finished (EXACT NEXT STEP 1).

## Steps 3-4: NOT STARTED (the box): the --proven relist and yield; the stills.

## Lessons applied
D111 (handed over at the box with the exact next step), D113 (runs in the background; one slip: I started one castBots run with a
shell '&' inside a commit command; I killed it within the minute and re-ran it with run_in_background; its rows were never used),
D115 (every run on a frozen worktree at a named hash; the traces on separate copies), D102 (read lean: BUILD-26d's section only),
rule 21 (the plant RED on the base bot before the toy is called proof), rule 28 (row for row, every lost row traced before calling it clean).
## Learned (for level.md, proposed)
- A climb-jump "toward" a target must also STOP at it: a direction held for a whole double carries him about 140 px; at a vine within
  20 px of a ledge's end, toward-the-vine still runs off the end. Proposed check: the toy's lowest y, not only where he ends.
- FT_TRACE's time is the takeoff; a debug print keyed on `decide` misses jumps that come through `startJump` directly (the late
  press). Print in startJump with its two callers.

# ENG-26m (on t-build-26 from a840ac5ff): 1-4 (relisted) measured on two FIXED frozen trees. Started 5:43 PM ET 11-21 (by `date`)
Trees (D115, frozen, never edited but as named): OLD = 4ea253b8c (1-4 before the walk-off judge), RELISTED = 626fac5ac (1-4 relisted, before
BUILD-26c's bot fixes), each a detached worktree with the checkout's node_modules linked. ONE heavy run at a time, all in the background
(D113), in one serial chain. Commits: 75d68eea8 (engine-core.md §0zr-26, the tower lines), this REPORT. No game code changed.
Saved: eng26m/ (rowdiff.mjs: castBots rows row for row, rowdiff.txt; trace.mts: one line a run, traces.txt (26 x 2); near.mts: the wood
and vines at a spot, near.txt; jumps.txt: FT_TRACE OLD vs RELISTED; rows-old/rel.jsonl; the locks; every run's log).

## EXACT NEXT STEP (STOPPED on the lead's word after step 3's cause table; every number below is on the two frozen trees)
1. **1-4's relist does NOT ship (the lead's ruling): six tiers drop** (kid N 24 -> 18, kid E 34 -> 32, adult N 40 -> 39, adult E 40 -> 36,
   middle N 39 -> 37, middle E 39 -> 37). The cause table is in step 3: A, B, D are **BOT** -> BUILD-26e (the bot's recovery after a first
   miss that the judge's new catches and wall wood now hold near the spot); C is **LAY** -> the lead (s17's moved gate, fully roofed on
   Easy by a new bridge 760-1280 @3061). 9 singles are traced but UNCLASSED: compare each on OLD with
   `npx tsx reference/qa-reports/BUILD-26/eng26m/near.mts <tree> 1-4 <setting> <seed> <x> <y>` and
   `FT_TRACE=1 npx tsx reference/qa-reports/BUILD-26/eng26m/trace.mts <tree> 1-4 "<bot> <setting> <seed>"` (stderr: every jump).
2. **The final bar for 1-4** (the lead): castBots 1-4 seeds 1-40 both settings every tier, OLD 4ea253b8c with the old bot vs the release head
   with the relist and every bot fix (one chain, frozen trees, `--par 4`, eng26m/rowdiff.mjs): no tier's pass count may drop.
3. **1-4's build over the 150 ms 4x-CPU budget on both trees** (step 1): the lead's call (a packet or a known item).
4. **THE FULL SET** runs in release 3's integration on the head that ships (not run here: none is claimed, D96).

## Step 1: the phone's load speed (OLD vs RELISTED)
| run | OLD 4ea253b8c | RELISTED 626fac5ac | limit | verdict |
|---|---|---|---|---|
| loadtime.mts 1-4 Normal (100 listed seeds, best of 3, desktop) | p50 39.2, p95 46.6, max 60.2 ms | p50 41.4, p95 48.2, max 50.0 ms | fell to search 0 | 0 fell, both |
| loadtime.mts 1-4 Easy | 38.7 / 44.9 / 48.1 | 40.1 / 45.1 / 46.6 | 0 | 0 fell, both |
| loadtime.mts 2-6 Normal | 7.8 / 10.1 / 13.2 | 6.3 / 7.9 / 15.0 | 0 | 0 fell, both |
| loadtime.mts 2-6 Easy | 8.2 / 9.4 / 11.6 | 7.4 / 8.9 / 11.8 | 0 | 0 fell, both |
| buildcheck 1-4 (4x CPU, 30 builds a setting) Normal | p50 192, p95 **581**, max 596 ms | p50 197, p95 **455**, max 791 ms | p95 150 ms | **FAIL on BOTH** |
| buildcheck 1-4 Easy | p50 162, p95 **210**, max 251 | p50 175, p95 **205**, max 218 | 150 | **FAIL on BOTH** |
| buildcheck 2-6 Normal | p50 34, p95 48, max 76 | p50 30, p95 44, max 60 | 150 | PASS both |
| buildcheck 2-6 Easy | p50 39, p95 53, max 66 | p50 31, p95 39, max 41 | 150 | PASS both |
- **The breach, named (sent to the lead):** 1-4's build at the start of Play is over PERFORMANCE-RULES §1's 150 ms p95 at 4x CPU on BOTH
  trees, Normal and Easy; even the p50 is over (162-197 ms). It was over on OLD, before the walk-off judge, so the relist did not cause it
  and is not worse (p50 +5 / +13 ms, p95 lower; one run each, so the p95s are noisy). CI's buildcheck times 1-1 only (gates.yml), so no
  job reds. The lead's call: a packet (the build's own cost on a tower: ENG-26h's profile, reachTable and roofedDrop), or a known item.
- OLD's tree had no BUILDCHECK_STAGE (93246fa93 came after it): its tools/perf/buildcheck.mjs and buildtime.ts were replaced by
  93246fa93's for these two runs (measurement tools only; OLD's src untouched; the page builds the stage on its own kit, listed.ts).

## Step 2: CI timing (D99)
| run | OLD 4ea253b8c | RELISTED 626fac5ac | CI limit | verdict |
|---|---|---|---|---|
| `seedlist.ts 1-4 --check`, ALONE (nothing else running) | **PASS**, 100 seeds clean on both settings, verdicts refuse 0; **152 s** | **PASS**, same; **99 s** | the seedlists job's 45 min (gates.yml line 113), a SHARD | inside |
| `lockall.ts --layouts 16`, alone | 452 s (3,264 builds of 102 stages) | 435 s | **none: lockall is in no workflow** (grep of .github/) | no CI limit to breach |
- 1-4 is in **shard 3 of 4** on RELISTED (`registrycheck.ts --shards --print`: 1-2, 1-4, 1-9, 2-5). The relist made 1-4's check 53 s
  FASTER here (gateRun: no rerolls), so the shard's time cannot have grown from 1-4. A CI runner is slower than this container (D99:
  1-6 was 17.6 min on a runner); the shard's whole time on a runner is R-165.352's measure, not taken here.

## Step 3: castBots 1-4 seeds 1-40, both settings, every tier, OLD vs RELISTED (rule 28); tierBots
**VERDICT: FAIL (the lead's ruling: 1-4's relist cannot ship while any tier drops; 1-4 is live).** castBots 1-4, seeds 1-40, both
settings, every tier, `--par 4`, run alone in the chain on each tree (87 s OLD, 82 s RELISTED). The bot code is identical on both
trees (`git diff 4ea253b8c 626fac5ac -- tools/inspect/` is empty), so every move comes from the stage. Rows: eng26m/rows-old.jsonl,
rows-rel.jsonl; diff: `node eng26m/rowdiff.mjs` (eng26m/rowdiff.txt).

| tier | OLD 4ea253b8c | RELISTED 626fac5ac | lost (seeds) | won |
|---|---|---|---|---|
| kid Normal | 24/40 | **18/40 DROP** | 3, 7, 12, 13, 18, 19, 34 | 16 |
| kid Easy | 34/40 | **32/40 DROP** | 10, 37 | - |
| adult Normal | 40/40 | **39/40 DROP** | 36 | - |
| adult Easy | 40/40 | **36/40 DROP** | 10, 17, 19, 37 | - |
| child Normal | 28/40 | 35/40 | 24, 26, 30, 32 | 2, 5, 7, 10, 15, 19, 20, 34, 36, 39, 40 |
| child Easy | 28/40 | 33/40 | 3, 12 | 4, 8, 17, 21, 28, 29, 40 |
| middle Normal | 39/40 | **37/40 DROP** | 6, 15, 29 | 23 |
| middle Easy | 39/40 | **37/40 DROP** | 10, 29, 37 | 4 |
| expert Normal | 40/40 | 40/40 | - | - |
| tierBots 1-1 (RELISTED) | | **9/9 PASS** (every one of the 200 committed runs replays exactly), 180 s | | |

**The cause table (rule 28).** All 26 new misses were re-run TWICE on RELISTED with eng26m/trace.mts: both runs are identical, line for
line (eng26m/traces.txt). All but one end "shrine rescued x1"; child Normal 26 ends "time, goal 0/1". Each spot was compared on BOTH
trees: the wood and vines at the spot (eng26m/near.mts) and the bot's jumps (FT_TRACE) for one run each, OLD vs RELISTED (eng26m/jumps.txt).
| spot | runs (bot setting seed) | one line: x, y, frame, what took him | class |
|---|---|---|---|
| **A: x 1036, Normal** (section s3's vine from s3:z up to s4:b, its top 26 px past s4:b's end) | kid 7, 12, 13, 18, 19, 34; adult 36 | kid 12: the first jump 15.3 s (316,9706 -> 516,9786) FELL BACK on BOTH trees (same jump, same miss); OLD: the fall leaves him at 10348, he re-does the double at 26.8 s and passes. RELISTED: he stays at x 1036, y 9706 and "fell back down from here 3 times" by f570, rescued at x 1067. adult 36: the same (first jump 13.9 s fails on both; RELISTED stuck x 1036 y 10043 f525). New wood on RELISTED beside the spot, not on OLD: 1154-1245 @9706 and 1088-1280 @10067 (seed 12), 1110-1280 @9762 and 996-1176 @10042 (seed 36), untagged (the walk-off judge's catches) | **BOT** (trigger: LAY's new catches). The vine and s4:b are the same on both trees, and OLD's kid already failed here on 15 seeds (21 on RELISTED). The judge's catches now hold him by it after the first miss, and the bot's recovery takes the vine and falls back from its top. -> BUILD-26e |
| **B: x 1115, Easy** (the same s3 vine, x 1163, 26 px past s4:b's end 1137) | adult 17, 19 | adult 17: the first miss 14.8 s (485,10139 -> 655,10219) is identical on both; OLD falls to 10764 and re-does it (26.3 s ok); RELISTED stuck x 1115 y 10139 f546, "fell back down 3 times", rescued x 982. New on RELISTED under the spot: 1136-1256 @10500 | **BOT** (trigger: LAY), the same cause as A -> BUILD-26e |
| **C: x 583-610, Easy, seeds 10 and 37** (s17's gate under s18) | kid 10, 37; adult 10, 37; middle 10, 37 | kid 10: on the gate s17:top (481-841 @3342), "in a dip 281 px deep" at x 607, f2946, 34 s with no jump (OLD: 10 s), rescued x 610. middle 10: the same at x 583, rescued x 609. **The plan moved**: OLD's gate 712-1072 stood out past s18:b (360-760 @3061) into the open; RELISTED's gate is 481-841 (gateRun's foot 295-1027, 732 px wide against OLD's 520), and a NEW bridge 760-1280 @3061 (untagged, not on OLD) roofs the rest. So every inch of the gate is under wood 281 px up, and the one way up is the vine x 786. On Normal the same seeds lay the gate at 433-793 @2965 under s18:b (477-877 @2684) with its left 44 px open and no bridge, and adult, middle and expert pass both seeds there | **LAY** (a moved plan plus the judge's new bridge roof the gate; three bots, two seeds, Easy only) -> the lead |
| **D: x 61-135, seed 29** (a wall pocket) | middle Normal 29, middle Easy 29 | Normal: the double from 145,9458 toward x 20 FELL BACK on both trees (29.7 s / 30.4 s). OLD's wall strip was 36-150 @9746 (a 36 px gap at the wall) and he fell through it to 10388 and re-did it; RELISTED's strip is 0-150 @9858, up to the wall, so the same miss lands on it (beside the gate foot s5:foot 150-590), stuck x 61 f867, "the way on is 281 px down", rescued x 134 (the gate's vines up are 149 px away). Easy: the plan moved (OLD's 0-378 @4925 alone at that height); RELISTED: a double at 84.6 s toward x 43 lands on the wall pocket 0-281 @5285 (under 0-345 @4925, 360 px up), "in a dip 360 px deep, the way on is 341 px down", then 8 fall-backs at the vine x 135, rescued x 138 | **BOT** (trigger: LAY's wall wood, which reaches the wall where OLD's left a gap): from wood that joins a gate's foot, the bot's route says "down" instead of the vines -> BUILD-26e |
| singles, traced, NOT compared on OLD (the box) | kid Normal 3; middle Normal 6, 15; child Normal 24, 26, 30, 32; child Easy 3, 12 | kid N 3: x 182, y 1885, f3630, fell back 3 times, rescued x 228. middle N 6: x 801, y 6799, f1845, fell back 8 times, rescued x 884. middle N 15: x 1183, y 7273, f1638, "the way on is 301 px down", then 1187, y 6853 fell back 8 times, rescued x 1260. child N 24: x 463, y 6753, f2709, fell back 8. child N 26: time (1200 s) at x 600, 83%, goal 0/1, a life lost at x 772, y 2733. child N 30: x 996, y 9441, "a dip 400 px deep, the way on is 321 px down", then 936 fell back 8. child N 32: x 60, y 9666, "the way on is 321 px down" (a wall, like D), then 388 fell back 8. child E 3: x 442, y 596, f5343, fell back 8. child E 12: x 1044, y 1602, f5001, fell back 8 | **UNCLASSED** (the lead's next member compares each on OLD with near.mts + FT_TRACE, as A to D). The child tiers did not drop (+7, +5) |
- **What this says** (for the lead and BUILD-26e): the same first misses happen on both trees. What changed is where a miss leaves him.
  The walk-off judge's catches and wall wood (ENG-26g's towerCatches, the [20, W-20] sides) now hold a falling Pokey near the spot
  instead of dropping him to the floor below, where on OLD he re-did the jump. From there the bot's recovery takes a way it cannot do
  (A, B: the s3 vine whose top is 26 px past s4:b's end; D: "the way on is down" from wood joined to a gate's foot). One spot, C, is the
  layout itself: the moved gate fully roofed by the new bridge on Easy.
- **The bar going forward** (the lead's ruling): OLD 4ea253b8c with the old bot, against the release head with the relist and every bot
  fix; no tier's pass count may drop. Bot causes go to BUILD-26e, LAY causes to the lead.

## Step 4: lockall --layouts 16, RELISTED vs OLD; engine-core.md's tower lines
- **lockall RELISTED `--check` OLD's lock: 100/102 stages unchanged; the movers are 1-4 and 2-6 only (both intended)**, the same as
  ENG-26h's lock. 1-4: size, platforms, vines, collectibles, exitTotemX, checkpoints, gen2, clusters, gates, pods, proto.hints,
  proto.beats, proto.kitDecor, proto.dress, spawnY (the relist re-laid it). 2-6: platforms, collectibles, proto.decor. Exit 1 only
  because no `--intended` was passed (on purpose: so every mover is printed). "gen2 gained verdicts and drops (not hashed)" lists 37
  stages: that is the field the lock strips, not a change.
- **engine-core.md §0zr-26 written** (75d68eea8): ENG-26g's judge list (walkOff, wall faces, water by his middle, caps bounce,
  openEnds step + run, towerCatches runX / takes, clearFoot), ENG-26j's gateRun (164/173/191 px flown run -> 186/195/214 px foot) and "the lay
  adds nothing by a sealed piece", ENG-26h's cost findings (refused rolls, not flights; the profile; the three exact speed-ups d12ffcacf,
  checked on the branch and in RELISTED, not in OLD), the seed-2 / stand.mjs traps, and the 1-4 build breach above.

## Lessons applied
D96 (no gate called run that was not: THE FULL SET is release 3's), D99 (CI time measured alone against each job's limit), D102 (lean reads:
the packet's sections only), D105/D57/D87 (ReadNotifications at every step boundary and push), D107/D111 (the 28-minute box by `date`),
D109 (no clock times to the lead), D113 (every run in the background; the chain waits, I do not), D114 (no second suite: step 0 carried),
D115 (two frozen trees at fixed hashes; BUILD-26c's towerRoute moves on the branch, not under these runs), rule 28 (40 seeds, both
settings, every new miss run twice and its spot compared on both trees), law 3 (the named commits checked as ancestors before they were
written into engine-core.md; the bot code checked identical on both trees before the drops were called the stage's).
**Own miss (law zero): one D113 slip.** Once, after the box, I waited in the FOREGROUND for 20 s (`sleep 20` before reading the
jump traces). The inbox was empty before and after it. Countermeasure: a trace's result is read only from its completion notice.
**Changed on the way (named):** castBots' default is `--par 1` (one seed at a time). The chain was taken over at its castBots step by a
second chain with `--par 4` (still one heavy run at a time), after lockall had finished; nothing measured was lost.

# BUILD-26d (on t-build-26 from 5be367dd8): the lost runs traced (2-6 and 1-4), one bot fix as an UNPLANTED TRIAL. Started 5:52 PM ET 11-21 (by `date`); handed over at the 28-minute box
Commits: this one (TRIAL: firsttimer.ts climbUpVine, the climb-jump toward a vine beside him, never his facing; this REPORT; b26d/).
Saved: b26d/ (trace-childN-base.txt, trace-childN-trial.txt, trace-14-base.txt; traceS.ts, framesS.ts, dumpS.ts, cornersS.mts: the b26
tools with a stage argument (STAGE env / 4th arg), copy them back to tools/inspect/b26/ to run; toy-vinefoot.test.ts.txt: the toy, NOT in CI).

## EXACT NEXT STEP (the next level builder; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees
1. **Make the toy's PLANT RED, then plant it (rule 21).** b26d/toy-vinefoot.test.ts.txt: with the fix he climbs (GREEN); with the skill
   taken away (`climbUpVine = () => undefined`) he ALSO climbs, so the toy does not show the fault yet. The toy misses what set
   `dir = -1` (firsttimer.ts:2230 fdir) at x 235 on the real run: on 2-6 child Normal seed 8 he lands at x 235 at t ~56.2 from a single
   jump left off x 397 (FT_TRACE line `56.23 single from 397,4927 -> 235,4927 ok`) and at once doubles LEFT (`57.53 double from 235,4927
   hold 0.52 -> 20,5278 FELL BACK`). Find dir's source there (FT_FRAMES on frames 1688-1692, or a one-line stderr print of dir, tgt,
   far in the climb-jump branch, firsttimer.ts ~2612), build that into the toy (likely: he arrives moving left from a jump, the target
   within 16 px across so d falls to his facing), confirm plant RED / fix GREEN, then append it to castBots.test.ts.
   **Found after the first push (a DBG print in the branch, removed):** on the trial run of seed 8 the branch fires at x 289 with `fdir -1,
   tgt 250,4835, far 250,4720, way -1` (he came along the leg going LEFT, so `this.way` is -1); from x 235 `far.x - p.x` is 15, inside the
   16 px dead band, so d falls to fdir = way = -1: away from the vine. The toy with `way = -1` set by hand STILL climbs on the plant: in
   the toy, during his look delay (1.2 s) he drifts right to x 277, so both runs decide from the vine's RIGHT, and toward the vine is left
   either way. The toy must have him DECIDE from 1-15 px left of the vine with way -1: e.g. land him there from a jump (as seed 8 did,
   397 -> 235), or skip the look delay, then plant.
2. **Then castBots 2-6 x40 both settings on a frozen worktree of the trial** vs b26c/rows/cast-fix2.jsonl, row for row (python3 on
   (bot, setting, seed)); and 1-4 x40 vs b26c/rows/c14-fix2.jsonl: the fix is in the bot, so 1-4 MAY move: the lead is told before it lands.
3. Then the packet's steps 1 (the remaining causes, below), 2, 3 and 4 as written (BUILD-26d.md).

## Step 0: the suite on 5be367dd8, frozen (D114)
Running in the background at hand-over: **1,247 ok, 0 failed** at hand-over, not finished (log lost with the container). It does not
carry to this commit (the trial changes tools/inspect/firsttimer.ts). Run it WHOLE on the head after the fix is planted.

## Step 1: the 15 lost runs, traced (rule 28; frozen 5be367dd8, single-bot traces; t in s, frame = t x 30)
**Cause A (2-6, the edge-wheel turn's vine foot; child N 3, 5, 7, 8, 18).** Leg s5 runs left along y 4927 to the turn's vine (x 250,
4422-4927), which stands 25 px in from the ledge's left end (#22 x 225-465; the street #82 is 351 px under it).
- seed 8: t 56.2 lands at x 235 (15 px left of the vine, facing left), at once a double LEFT (the tier bot's climb-jump: no ledge
  60-260 px over him, the target within 16 px across, so firsttimer.ts:2611 falls back to his facing); a jump away from a trunk never
  grabs it (engine.ts wantGrab), off the end at x 225, down to the street; from the street the vine's foot is 351 px up: 8 falls, rescued t 65.8.
- seed 3: t 68.0, x 233, y 4856, the same spot (fell back 8 times), rescued. seeds 5 (x 401), 7 (x 243), 18 (x 248): the same ledge, the same line.
- **Trial fix (this commit, bot):** in that branch, no ledge and a climbing vine within 60 px leading up from his feet: the jump goes
  toward the vine (straight up within 6 px), never his facing. Measured on frozen head-to-be: seed 3 GAINED (151.9 s, 0 rescues);
  seed 8 passes the vine (60.5 s on the next floor) and is now rescued LATER at a second spot (cause C); seeds 5, 7, 18 still rescued
  (5: still at #22, x 401, t 76.9: not yet traced on the trial). Not x40, not planted: a TRIAL.
**Cause C (2-6, the high wheel; child N 24; seed 8 on the trial):** seed 24 t 124.1, x 1529, y 1395, fell back 8 times under #65/#66
(x 1067-1547, y 1556; wheel `edge` cx 430 cy 1886); seed 8 (trial) t 150.7, x 1529, y 1418, the same spot. Not yet traced frame by frame.
**Child N 28:** t 138.9, x 1557, y 1736, 20 s stuck, "an open drop ahead, water ahead, the way on is 180 px up" (#90's floor). Not traced.
**Child E 11, expert N 12:** not traced (rows: E 11 x 1482 fell back 8 times; expert 12 x 635 y ~ in a dip 353 px, x 1419 in a dip 179 px).
**Cause B (1-4, a leg's exit past a gap; child E 17, 35; middle E 35 and child E 37 the same x):** child E 17: corners `534,5005
1190,4965 1190,4684` (leg s14 entry 560,5005, exit 1208,4965; the next turn's vine x 1190, 4684-4965). He walks right along y 5005,
at x 1025 doubles right with up held 0.35 s, passes x 1200 at y 5140 (under the vine's foot), lands at 1260,5325 (FT_TRACE `112.13
double from 1025,5105 -> 1260,5325 FELL BACK`), rescued t 116.4. child E 35: t 104.1, x 1190, y 4588, fell back 8 times (#39 x 234-1164).
Not yet read why the floor ends at about x 1025-1050 under a leg that runs to 1208: dumpS.ts and cornersS.mts disagree on 1-4's
heights (dumpS builds through listedStage/buildGen2Stage, cornersS through RealPlay; about 337 px apart): settle which is the PLAYED
stage first.
**1-4 adult N 23:** t 86.6, x 899, y 4411, fell back 3 times, hits 2 ('other'). **1-4 child N 20:** t 108.6, x 1137, y 6896, 17.6 s
"the way on is 301 px down"; t 164.2, x 245, y 6079, fell back 8 times. Not yet traced frame by frame.

## On the trial (this commit's tree, before commit): `npx tsc --noEmit -p .` clean; castBots.test.ts `tower` tests 3/3; tierBots 1-1 **9/9**.
## Steps 2-4: NOT STARTED (box): 2-1..2-5 x40, the WHOLE castBots.test.ts, the --proven relist and yield, the stills. The hearts test (06096c3b4) is still UNRUN.

## Lessons applied
D111 (handed over at the box with the exact next step), D113 (every run in the background), D114 (the base's suite started first),
D115 (traces on a frozen worktree at 5be367dd8 before the edit), rule 21 (a toy whose plant is not RED is not landed as proof).
## Learned (for level.md, proposed)
- A bot fix's toy must be built from the traced frame's own state (how he arrived, his facing, where Progress points), not the
  stage's shape alone: my first toy reproduced the ledge and vine and still climbed with the skill removed.
- The b26 tools hard-code '2-6': a stage argument (b26d/*S.ts) saves every later builder the copy.

# BUILD-26c (on t-build-26 from fd3ce98b1): 2-6's bots on the current engine, every miss traced, the beat table, the hearts question. Started 5:27 PM ET 11-21 (by `date`)
Commits: 06096c3b4 (hearts test counts every cost), 2b123df7c (towerRoute: no entry corner beside a turn's top), b039ee3fb (its planted
test), 4ed9af678 (TRIAL: the bots take a tower's own route on every tower), ca9ba7d38 (that choice as takesTowerRoute, planted
test RED/GREEN), this REPORT. Saved: b26c/ (beats.mts: a bot's run as footing
segments with seconds; hearts.mts: each risk term per stage and setting; corners.mts, rivers.mts, route.mts: the tower route, the rivers
and the inspector's traced route on the PLAYED stage; rows/: castBots rows, base and each fix).

## EXACT NEXT STEP (the next level builder; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees
## BUILD-26d: land the bot fix (4ed9af678), then the 15th beat. The lead's rulings above stand. In this order:
1. **The trial fix, proven (rule 28; the lead's (b)).** 4ed9af678 (tools/inspect/firsttimer.ts:1446): the bots take a tower's own
   route (towerRoutePts) whenever towerCorners is non-null, not only when the inspector's trace fails. 2-6 x40 vs the base, row for
   row: 139 runs gained, 9 lost (b26c/rows/cast-base.jsonl vs cast-fix2.jsonl, compared by `python3` on (bot, setting, seed); the table
   is above). Then:
   a. **Trace the 9 lost runs** (child N 3, 5, 7, 8, 18, 24, 28; child E 11; expert N 12), two runs per cause, one line each.
      `npx tsx tools/inspect/b26/trace.ts child normal 3,5` and `b26/frames.ts` on a frozen worktree of 4ed9af678 (or later).
      Fix each where its cause is; a planted test for each.
   b. **1-4 diff: MEASURED at hand-over, and 1-4 MOVES** (b26c/rows/c14-base.jsonl vs c14-fix2.jsonl, 360 rows, frozen fd3ce98b1 vs
      4ed9af678). My expectation that it would be identical was WRONG: 1-4's trace does not fail on most rolls either, so its bots also
      followed the trace until now. 110 rows moved. Gained 5: child E 2, 12, 30; kid N 3; middle E 37. Lost 6: adult N 23; child E 17,
      35, 37; child N 20; middle E 35. 64 passes changed time only, on 37 of 40 seeds (-41.2 to +32.8 s, mean -1.0). Pass counts
      base -> trial: kid 18 -> 19 N, 32 E; adult 39 -> 38 N, 36 E; child 35 -> 34 N, 33 E; middle 37, 37; expert 40/40 (MIN 125.8 on
      both). Rule 28: trace the 6 lost runs (two runs per cause), and confirm the time moves follow from the route change. 1-4 is a
      shipped tower, so its seed list may need `seedlist.ts 1-4 --check` re-run on the fix and the lead told before landing (rule 22).
   c. **2-1..2-5 x40**: no tower there, so towerCorners is null and nothing should move. Prove it (castBots base vs head per stage),
      then tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9).
   d. DONE at ca9ba7d38: the choice is `takesTowerRoute` (firsttimer.ts), its planted test in castBots.test.ts: GREEN 3/3 (the
      `tower` tests), RED with the base's rule (`traced === 'failed'` alone). Still run the WHOLE castBots.test.ts once.
   e. The hearts test (06096c3b4) is UNRUN: `npx tsx --test --test-name-pattern="bank village" src/game/gen2/worlds/w2Arc26.test.ts`;
      plant it RED (count `v.safe` rivers instead of `!v.safe`), then restore.
   f. Drop the "(trial)" from 4ed9af678's subject in the REPORT. Commit messages stay as they are; no rewriting of history.
2. **Step 0's suite**: frozen fd3ce98b1, still running at hand-over: 2,559 ok, 0 failed (one TODO, R-165.312) (`scratchpad/suite.log`, lost with the
   container). ENG-26l's 626fac5ac run reached 3,214 ok, 0 failed. Run it WHOLE on the head after step 1, since it then carries code
   (D114).
3. **THE BAR (the lead's correction, after the trial, replaces the 125 s bar and the two-beat plan):** Matt's STAGE-RULES.md:84,
   a climb's floor is 100 s: EVERY bot at or above 100 s on every listed roll (`castBots --proven`, castBots.ts:107, eraRoll.ts:30),
   and as a margin the expert MIN over 80 runs at or above 105 s. On the trial the expert MIN is 103.1 s (seed 32), 2 s short. The
   two new beats are NOT needed for release 3. In this order:
   (1) **The 8 adult Normal runs under 100 s, measured at hand-over (b26c/rows/cast-fix2.jsonl): all REAL runs, none rescued.**
       seed 29: 96.1 s, 14: 96.2, 21: 98.8, 5: 98.9, 10: 99.1, 12: 99.1, 18: 99.1, 23: 99.2. Every one has 0 rescues and 0 turn-backs
       (23 has 1 stuck spot). On the same seeds the expert takes 111.1-133.9 s, so the adult is 12-35 s FASTER than the expert. The
       likely reason: FT_ADULT has no stand time (no standQ; the tier bots stand 0.2-0.8 of the time from the testers' numbers), so it
       boards and walks without a pause. To check: is the adult (not tester-calibrated) a quick player by Matt's rule, or a bot
       quicker than any tester? Bring it to the lead; do not change the stage for it.
   **The lead's ruling on the fast adult (it REPLACES (2) and the 105 s margin):** a route with no standing is one a quick player
   can really play, so the adult is a fair quick-player bound, and the tool's floor applies to it as on every shipped stage (no rule
   change). The expert +5 s margin is retired.
   (2) After the 9 lost runs (step 1a) are fixed: **relist 2-6 under `castBots --proven`** (a roll where ANY bot runs under 100 s is
       refused; methods/seed-list.md, `tools/engine/seedlist.ts 2-6 --merge <proven.json>`) and report the YIELD (rolls kept of
       rolls tried). At about 60% or more, no content is needed for release 3. Below that, bring the lead a plan for the smallest
       honest content (a longer street between two wheels, or one beat) FIRST (rule 25).
   (3) Then the 1-4 base-vs-trial row diff (rule 28; 1b above).
4. **ENGINE-WORTHY (for the lead's roadmap)**: easyMode.ts:431 costsHere counts safe rivers (Easy lays 8 hearts on 2-6 where nothing
   costs one; Normal's stageGenerator.ts:2952 `risky` leaves rivers out); one shared reading of risk, a survey of every stage first.
   And the inspector's route (tools/inspect/route.ts) slants a tower turn's climb through the floors (`traced: extended` on 2-6):
   any tool reading findRoute on a tower reads a wrong way on.

## The lead's rulings (received after the cause table)
(a) castBots beside the suite, two heavy runs only, pause castBots under ~1.5 GB free. (b) Causes 1-3 are BUILD-26c's, on t-build-26:
two runs per cause, the fix where the cause is, general, planted, rule 28's row-for-row diff on 2-1..2-6 x40 and 1-4, tierBots 1-1 9/9.
2-MINUTE: no slowing the wheels, no filler; the lever is CONTENT: a 15th beat that turns the wheel idea a new way (two wheels turning
opposite ways, a hop bucket to bucket), ~12-15 s for the expert, before the crest, taught per rule 2; its plan to the lead FIRST (rule
25) and wait for the GO; the new MIN over 80 runs after causes 1-3. HEARTS: Normal 0 is correct; the test says why; the Easy defect is
ENGINE-WORTHY (roadmap, an engine member, a survey first), not touched here.

## Step 0: the full src suite on frozen fd3ce98b1
Running in the background at hand-over: **2,559 ok, 0 failed** (one `not ok` is the known TODO R-165.312, not a failure; not finished; see the EXACT NEXT STEP 2). ENG-26l's REPORT section
was not on fd3ce98b1 (only its stills), so it had no verdict to read.

## Step 1: castBots 2-6, seeds 1-40, both settings (rule 28), frozen fd3ce98b1 (rows: b26c/rows/cast-base.jsonl)
| head | kid N/E | adult N/E | child N/E | middle N/E | expert N | expert MIN |
|---|---|---|---|---|---|---|
| 8f3bcb3b6 (BUILD-26b) | 0/40, 0/40 | 0/40, 0/40 | 28/40, 27/40 | 38/40, 33/40 | 39/40 | 112.3 s |
| fd3ce98b1 (this base) | 0/40, 0/40 | 0/40, 0/40 | 34/40, 28/40 | 35/40, 33/40 | 38/40 (17, 26) | **108.8 s** (seed 10; 30: 110.9; 34: 111.2; median 121.5, seed 1) |
| 2b123df7c (entry corner) | identical, row for row (0 gained, 0 lost, every tier's rescues the same): the bots do not read towerRoute on 2-6 (below) | | | | | |
| **4ed9af678 (TRIAL: the tower's own route)** | **29/40, 24/40** | **33/40, 24/40** | 32/40, **38/40** | **39/40, 40/40** | **39/40** (12) | **103.1 s** (seed 32; median 114.2) |
Trial vs base, row for row: 139 runs gained, 9 lost (child N 3, 5, 7, 8, 18, 24, 28; child E 11; expert N 12); rescues kid 199 -> 34,
adult 202 -> 29, child 21 -> 10, middle 14 -> 1, expert 2 -> 1. Adult N: 8 runs under the 100 s climb floor (median 105.6 s).
Every miss is a rescue (hits 0, lives 0).

## Step 2: the cause table (rule 28; frame = t x 30; single-bot traces on frozen fd3ce98b1)
| # | runs (bot setting seed: t, frame, x, y) | what took him | cause |
|---|---|---|---|
| 1 | adult E 2: 83.2, f 2496, x 1527 y 4315, 20 s; adult E 20: 80.4, f 2412, x 1526 y 4316; the same on more turns (adult E 2/20 x ~1065 y 1799, x ~1059-1073 y 3067; kid N 11: 119.3, x 1087 y 2824) | short of a tower turn's vine (x 1612) he dithers L/R 1512-1535, never presses up | **BOT (the route it follows)**: 2-6's route TRACES (`traced: extended`, tools/inspect/route.ts), so firsttimer.ts:1446 never takes the tower's own route (towerRoutePts, only on `failed`); the trace draws the turn's climb as a SLANT, `climb 1612,4315 -> 1346,4034`, through the floors, and the way on 120 px ahead is on the slant over x ~1530: he stands under it. (1-4's trace fails, so 1-4's bots use the tower route and pass: kid/adult 1-4 seeds 1-2 PASS 7/8.) Not ENG-27m's (no hop) |
| 2 | child E 2: 139.8, f 4194, x 635 y 4315 (8 falls, rescued at 141.1) | up the vine x 573 (4624 -> 4315), off at 635, he turns LEFT and walks into the vine's hole at 553 | **BOT (the same traced route)**: its climb is `573,4624 -> 859,4315`, a slant; first diagnosed as the tower route's entry corner (599, 26 px past the vine): 2b123df7c fixed that corner and moved NOTHING, so it is the trace. Second run: TO DO |
| 3 | expert N 1: 60.4, f 1812, x 1562 -> 1618 y 3741 (twice, ~8 s); expert N 8: 56.8, x 1610 y 3740 (once, ~2.7 s) | up a rest street's turn, off left at 1509, walks right and runs off the ledge's end into the shaft, falls ~360 px, climbs again | **BOT (the same traced route)**, as 2. Costs time, not a miss: fixed, the expert is FASTER |
The vines and the tower's own route are right (b26c/corners.mts on the played Easy 2: `1127,4315 1612,4315 1612,3964 1586,3964 376,3964`,
vine x 1612 3964-4315): not the engine, not the lay.

## Step 3: the 2-minute beat table (expert N; b26c/beats.mts, footing segments; design seconds in [])
| beat | seed 8 (117.7 s) | seed 1 (121.5 s, the median) | design |
|---|---|---|---|
| 0 millpond | 8.3 | 7.9 | 10 |
| 1 the first wheel | 7.5 (ride 6.2) | 10.6 (ride 9.4) | 18 |
| 2 the first street | 5.0 | 4.4 | 10 |
| 3 through a house | 8.3 | 7.7 | 12 |
| 4 the millrace | 14.0 | 12.7 | 12 |
| 5 off at the edge | 9.1 (7.7) | 8.8 (7.3) | 18+6 |
| rest | 7.3 (2.7 of it cause 3) | 13.5 (~8 of it cause 3) | - |
| 7 the hanging porches | 11.0 | 9.1 | 10 |
| 8 jump off the top | 7.3 (5.6) | 8.4 (6.2) | 16+6 |
| rest | 1.9 | 1.9 | - |
| 10 wheel to bounce | 16.5 (9.3) | 13.8 (7.2) | 16+6 |
| rest | 4.9 | 6.2 | - |
| 12 the great wheel | 11.3 (10.2) | 10.4 (9.1) | 20 |
| 13 the crest | 5.3 | 6.1 | 8 |
The walking beats sit near the design; the five wheel beats are ~51 s against the design's 106: he boards at once and rides under half a
turn (the design's seconds are a watcher's). A ride swings ~3 s with the bucket's phase (the teach wheel 6.2 vs 9.4). The MIN seed (10,
108.8 s) is 16.2 s short of 125, more once cause 3 stops costing the expert time. (MIN seed 10's own beat table: TO DO, after the fix.)

## Step 4: the hearts question
- **Normal**: stageGenerator.ts:2952 `risky` (a creature, `waterY`, a heartFall that is not soft, deadly proto water, a gen2 pit that is
  not soft; not rivers); :2955 lays a heart by every second flag when risky or the stage is in GEN2_STAGES. Normal 2-6 (b26c/hearts.mts,
  layout 1): 0 creatures, no waterY, 0 heartFalls, pit soft, 6 rivers ALL `safe` (splash, back to the bank, no life: engine.ts:2965);
  listed, not in GEN2_STAGES: **0 hearts, correct by Matt's 11-05 rule** (2-4's 6 come from waterY 1186; 2-5's 7 from 9 creatures and
  waterY 897).
- **Easy (ENGINE-WORTHY, the lead's ruling: roadmap, an engine member, a survey first; not touched)**: easyMode.ts:431 `costsHere`
  counts `(stage.rivers ?? []).length > 0` with no `safe` test, so flagHeartsOwed (:438) is true and :560 lays a heart at all 8 flags
  where nothing on Easy 2-6 costs one. Two copies of the one H1 reading disagree on rivers.
- The test (06096c3b4, the lead's ruling): w2Arc26.test.ts now counts every way a heart is lost (adds a river without `safe` and a
  non-soft pit), so its 0 is the rule's answer. NOT RUN yet (two heavy runs going).

## Polish check
No stills (rule 29: the bots are red).

## Owned miss
I fixed a route the bots never read (2b123df7c). I diagnosed the overrun from towerCorners' output without first checking which route the bot
FOLLOWS on 2-6 (firsttimer.ts:1446 takes the tower route only when the trace fails). The row-for-row diff caught it: 0 moved.
Countermeasure (for level.md rule 28, the lead decides): a bot trace names the route the bot follows (traced, or the tower's own) before
any route is blamed.

## Learned (proposed, the lead decides)
- A tower whose inspector trace succeeds is still a tower: the bots read its own laid route (the trial fix; a planted test to come).
- Run castBots 1-40 on the fix BEFORE writing its planted test: it took 1.5 min at --par 2 beside the suite and showed the first fix moved nothing.

## Lessons applied
D111 (the box from Sat Nov 21 22:44:57 UTC 2026: started 5:27 PM ET, handed over at the box with the EXACT NEXT STEP), D113 (every long run with
run_in_background), D115 (every run on a frozen worktree: base, fix1, fix2, t3, plant), D114 (the suite as step 0), D57/D87/D105
(ReadNotifications at every step and push; the ruling was read the moment it came), D109 (no clock times to the lead), D102 (read lean),
D40 (the Easy hearts defect left for the engine member who will survey it), law 3 (the route the bot follows measured, after the miss).

# ENG-26l (on t-build-26 from 626fac5ac): step 0 the full suite, step 1 the stills. Started 5:06 PM ET 11-21 (by `date`)
Commits: ea3d7e7a2 (the head stills, stand.mjs, order.mts), fd3ce98b1 (the base stills), this REPORT. No game code changed. Saved: eng26l/
(stand.mjs: the stills tool to use, Pokey set down and left to stand with Dot's cards tapped away; order.mts: a listed stage's order; stills/).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND (D113), never with '&'
## ENG-26m: step 2 of ENG-26l's packet (load speed, bots, lockall, THE FULL SET) on this head; the suite verdict and the stills are below
0. **Step 0 WHOLE (D114): the full src suite on 626fac5ac ended exit 0: 4,035 tests, 4,032 pass, 0 fail, 0 cancelled, 3 TODO (R-165.312's roost boa; 4-3's boulder wall check, two), 32 min on 4 cores beside the stills; src/ and tools/ are unchanged 626fac5ac..71cbb9bda (git diff empty); after it BUILD-26c's 06096c3b4 and 2b123df7c changed only src/game/gen2/worlds/w2Arc26.test.ts (re-run on this head: 5/5, 0 fail) and tools/inspect/towerRoute.ts (no src file imports it), so the verdict carries to this head and the next member skips a second suite (the lead's ruling); no red, no re-pin (rule 20).**
1. **Frozen trees** (D99 needs quiet: nothing else running): `git worktree add --detach <S>/base 4ea253b8c` and `<S>/head <this head>`,
   each with `ln -s <checkout>/node_modules <tree>/node_modules` (`npm ci --legacy-peer-deps` once in the checkout, 5 s; package.json and the
   lock are the same on both). Then ONE heavy run at a time, base first, each with run_in_background:
   `OUT=<f> npx tsx reference/qa-reports/BUILD-26/eng26h/tools/loadtime.mts <tree> 1-4 3`, then `... 2-6 3` (every listed seed, both
   settings; p50/p95/max per setting, "fell to search" must be 0);
   `BUILDCHECK_STAGE=1-4 node tools/perf/buildcheck.mjs` then `=2-6`, base first;
   `time npx tsx tools/engine/seedlist.ts 1-4 --check` ALONE (CI's seedlists job limit 45 min, gates.yml line 113) and the lock timed
   against its own limit (D99). A breach: name it.
2. **castBots, one chain (rule 28):** `npx tsx tools/inspect/castBots.ts --stage 1-4 --seeds 1-40 --setting both --rows <f>` on base,
   then head; row for row: no tier's pass count may drop, every moved row explained (two runs per cause, one line each: seed, x, frame,
   what took him). tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9). qaW123 ran in the suite (step 0).
3. **THE FULL SET** (gates.md, D96; `git fetch --unshallow` first so roadmapcheck sees proofs), CI's tool line (gates.yml line 157)
   included; lockall `npx tsx tools/engine/lockall.ts --layouts 16 --check reference/qa-reports/BUILD-26/eng26j/lock-8e21145f1.json.gz`:
   only 1-4 and 2-6 may move. engine-core.md's tower lines (ENG-26g's list, ENG-26h's cost findings, ENG-26j's gateRun).
4. Then BUILD-26c runs 2-6's bots.
5. Any later stills: `node reference/qa-reports/BUILD-26/eng26l/stand.mjs <tree> <out> <stage> <layout> normal <port> <name:x:y,...>` (the
   lead's ruling), never eng26h's pin.mjs (it draws Pokey frozen in the air under a paused card). The page's `?layout=N` builds the seed the
   stills tool prints (layout 1 is seed 2 on 1-4): measure spots on THAT seed (eng26k/feet.mts, eng26j/gates.mts).

## Step 0 (D114): the full src suite on 626fac5ac
- **Step 0 WHOLE (D114): the full src suite on 626fac5ac ended exit 0: 4,035 tests, 4,032 pass, 0 fail, 0 cancelled, 3 TODO (R-165.312's roost boa; 4-3's boulder wall check, two), 32 min on 4 cores beside the stills; src/ and tools/ are unchanged 626fac5ac..71cbb9bda (git diff empty); after it BUILD-26c's 06096c3b4 and 2b123df7c changed only src/game/gen2/worlds/w2Arc26.test.ts (re-run on this head: 5/5, 0 fail) and tools/inspect/towerRoute.ts (no src file imports it), so the verdict carries to this head and the next member skips a second suite (the lead's ruling); no red, no re-pin (rule 20).**
- `npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts
  src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts` on 626fac5ac (frozen: this REPORT changes no game code), started at the step's
  start with run_in_background, beside the stills.
- **At the box (D111) it was still running: 3,214 ok, 0 failed.** The one `not ok` is the R-165.312 TODO ("raw seed 1 keeps the roost boa on
  its roost (flag placer) # TODO", not a failure; the same one ENG-26k saw). The two 2-6 tests ENG-26k re-pointed (listedWheelSheet,
  towerWater) are among the passes; no 1-4 red. Still running at the box: the last src/game files (stageQuality, stageSheets, storyFrame
  and on).
- **NOT a whole run yet, so no re-pin is taken from it (rule 20)** and none was needed (no red). The lead's call: the next member finishes
  step 0 (a whole run on this head, run_in_background, its totals in its REPORT) before anything in step 2, or the lead takes this 3,214/0.

## Step 1: stills, 1-4 layout 1, base 4ea253b8c vs head 626fac5ac, 2x, upright and sideways
- **Layout 1 on the page plays SEED 2, not seed 1** (the engine's own `gen2.seed`, printed by the stills tool on both trees; eng26l/order.mts:
  the list is 1, 2, 3, 4 ... on both). ENG-26k's spots (`gate:1000:8215,land:1238:7293` / `gate:860:8159,land:1094:7293`) were measured on
  seed 1, so on the page they would have put Pokey in the air. Seed 2's gates, measured (eng26k/feet.mts on both trees, eng26j/gates.mts on
  the head):
  - base: the bottom gate 646-1086@8120 over its foot 566-1166@8480 (80 px past each end); the next gate 310-750@7214 over 492-872@7313.
  - head: the bottom gate 540-980@8120 over its foot 354-1166@8480 (186 px past each end); a run off its right end lands at x 1144 on its
    own foot (the foot's tip 22 px past him). The next gate 319-759@7214: a run off its right end lands at x 840 on 501-978@7313.
  - Spots (Pokey set down there and left to land): base `gate:1096:8480,land:831:7313` (the land spot is the head's run distance added to
    the base gate's end; the base has no walkOff to measure it); head `gate:1080:8480,land:840:7313`. Grounded true at every spot, x unchanged.
- **The stills tool was wrong two ways, fixed in eng26l/stand.mjs** (a copy of eng26h/tools/pin.mjs): (1) Dot's "Tap here when you've read it"
  card was up and pauses the game, so Pokey was drawn frozen in his jump pose; (2) the render pin put him about 48 px above the wood. stand.mjs
  taps her cards and Skip tips, sets him down once and lets the game land him. The pin stills are not used.
- Stills (2x, 390x844 and 844x390), in reference/qa-reports/BUILD-26/eng26l/stills/: `head-1-4-normal-L1-{gate,land}-{up,side}.webp`,
  `base-...` the same.
- **Polish check, the way Matt sees it on a phone:**
  - head gate-up: Pokey stands on the long log well past the fig branch's end; the log carries on to its post. It is the same log he walks
    the field on, not a shelf, and it reads as wood he can stand on at his size (the log about a third of his height thick). PASS.
  - head gate-side: the foot is one long log from the left of the trunk to the post, the branch above ending well before it. PASS.
  - head land-up / land-side: he stands on the log just right of the gate's end with about 140 px of wood still ahead of him: a place to land,
    not a tip. PASS.
  - base gate: he stands at the very end of a shorter foot, by the post (80 px past the gate's end): this is what the fix lengthens.
  - The base stills carry Dot's creak tip ("Hear it creak? Scoot a vine over!") in mid-screen: stand.mjs's Skip tips tap took on the head
    but not on the base. It covers neither the foot nor the gate's end; kept as the before.
  - **The lead's ruling: both head upright stills ACCEPTED** (the foot runs on past the gate's end to the post, solid wood to his scale, the
    field's ground; at the landing he stands on a long log with room past him). stand.mjs is the stills tool to use. The nit (the fig branch's
    hanging end drawn over the log 99 px under the 7214 gate, on the base too): the lead reads it as foliage in front of the wood, natural
    layering: no row.

## Lessons applied
D114 (step 0 first: the full suite on the base, in the background, before anything else), D113 (every long run with run_in_background,
no foreground wait: the waits were background until-loops), D111 (the box from `date`: started 5:06 PM ET, handed over inside 28 minutes
with the EXACT NEXT STEP), D102 (read lean), D29 and rule 20 (no re-pin taken from a partial run), D109 (no clock times to the lead),
D105/D57/D87 (ReadNotifications at every step and push), law 2 and law 3 (judged the real screen and checked the fact: the page's layout 1
plays seed 2, not the seed 1 the spots were measured on; the old stills tool drew Pokey frozen in the air under a paused card, so the
stills were re-shot with him standing), law 1 (no still sent with a card over the spot).

# ENG-26k (on t-build-26 from 3310f3ac9): 1-4 relisted ONCE on the gate section's own catch. Started 4:46 PM ET 11-21 (by `date`)
Commits: 5981c26c0 (the relist), c45496570 (the two 2-6 tests), this REPORT. Saved: eng26k/ (cmp.mts: an old and a new list compared seed by seed and plan by
plan; feet.mts: each gate on a built roll and the wood under it, works on trees without walkOff).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND (D113), never with '&'
## ENG-26l: steps 1 (rest) to 4 of ENG-26k's packet, on this head (the relist DONE and checked)
1. **The re-pins.** The full src suite on 5981c26c0 (the relist) was still running at the box (D111): **2,003 ok when the box ended, no 1-4 red**; the only reds
   were the two 2-6 tests below (fixed in c45496570) and one TODO (R-165.312, not a failure). **Step 0 (D114): re-run the FULL suite on
   this head in the background** (`npx tsx --test src/audio/*.test.ts src/game/*.test.ts src/components/*.test.ts src/components/**/*.test.ts
   src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts`, about 20+ min on 4 cores; its result is what the re-pins
   are taken on, rule 20).
   **DONE on 5981c26c0: the tools tests that read 1-4 pass 55/55, none needs a re-pin** (`npx tsx --test tools/engine/tipwalk.test.ts
   tools/difficulty/coveragecheck.test.ts tools/difficulty/score.test.ts tools/inspect/bands.test.ts tools/inspect/castBots.test.ts
   tools/inspect/travelBots.test.ts`).
   Then the whole CI tool line (gates.yml line 157) in THE FULL SET. A red that names a 1-4 roll or seed: re-pin it from the new list (eng26k/cmp.mts
   says which seeds' plans moved), never loosen it. **Two reds that are NOT the relist** (the same two fail on 3310f3ac9, measured):
   listedWheelSheet.test.ts and towerWater.test.ts, `withTestStage: 2-6 is already listed` (2-6 is listed, n 100; the tests still lay 2-6
   as a draft). FIXED in c45496570 on the lead's ruling (re-pointed at the listed 2-6); they are not re-pins.
2. **Load speed (quiet: nothing else running).** Frozen trees: `git worktree add --detach <dir> 4ea253b8c` and `... 5981c26c0` (or the
   head with the re-pins: same src/game/gen2), each with a node_modules link (`npm ci --legacy-peer-deps` once in the checkout; plain
   `npm ci` fails ERESOLVE). Then, one at a time:
   `npx tsx reference/qa-reports/BUILD-26/eng26h/tools/loadtime.mts <tree> 1-4 3` and `... 2-6 3`, base then head (OUT=file for rows);
   `BUILDCHECK_STAGE=1-4 node tools/perf/buildcheck.mjs` and `=2-6`, base first. Time `seedlist.ts 1-4 --check` alone: 1 m 44 s here WITH
   the suite beside it (CI's seedlists limit 45 min, gates.yml line 113); the lock timed against its own limit (D99). A breach: name it.
3. **Stills at 2x (eng26h/tools/pin.mjs, 390x844 and 844x390), layout 1 = seed 1 on both** (eng26k/feet.mts found the wood):
   base 4ea253b8c: the gate 534-974@7855 over its foot 454-1054@8215 (80 px past each end); the gate 634-1074@6893 over 554-1154 and
   1154-1280@7293. Head: the gate 300-740@7799 over its foot 114-926@8159 (186 px past each end); the gate 481-921@6893 over 286-1116@7293,
   whose run off the right end lands at x 1094 (eng26j/gates.mts). Spots (Pokey's feet on the wood):
   base `gate:1000:8215,land:1238:7293`; head `gate:860:8159,land:1094:7293`
   `node reference/qa-reports/BUILD-26/eng26h/tools/pin.mjs <tree> <out> 1-4 1 normal 5191 <spots>` (a different port per tree). Judge:
   the longer foot reads as the field's own ground, not a shelf; the landing reads as a place to land.
   castBots, one chain (rule 28): `npx tsx tools/inspect/castBots.ts --stage 1-4 --seeds 1-40 --setting both --rows <f>` base, then head;
   no tier's pass count may drop, every moved row explained. tierBots 1-1 (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9); qaW123
   is in the src suite (src/game/qaW123.test.ts).
4. **THE FULL SET** (gates.md, D96; `git fetch --unshallow` first so roadmapcheck can see proofs); lockall `--layouts 16 --check` against
   eng26j/lock-8e21145f1.json.gz: only 1-4 and 2-6 may move; engine-core.md's tower lines (ENG-26g's list, ENG-26h's cost findings,
   ENG-26j's gateRun: a sealed piece's own wood catches its full-speed run). Then BUILD-26c runs 2-6's bots.

## Step 1: the relist (methods/seed-list.md)
- Candidates: seeds 1-100 in their old order (all 100 build clean on both settings on 3310f3ac9's code, eng26j/sweep-1-400-8e21145f1.json:
  no new seed needed). `npx tsx tools/engine/seedlist.ts 1-4 --merge cand.json --in-order --count 100`: **100 proven of 100 tried, 43 s**;
  quiet line longest 2.8 s (median 2 s, under 4 s on 100 of 100); outro 420 px.
- Proof nothing moved but what the fix moves (eng26k/cmp.mts, old list vs new): **the seeds are the same 100 in the same order** (layout
  variant N is still seed N); **45 of 100 packed plans changed** (seeds 6, 7, 8, 9, 10, 14, 18, 19, 20, 21, 22, 23, 27, 28, 29, 31, 34, 42,
  46, 48, 50, 52, 54, 59, 60, 62, 63, 64, 66, 67, 69, 72, 75, 76, 79, 81, 83, 84, 86, 89, 91, 94, 95, 97, 100), 55 the same; it includes
  ENG-26j's seven that replayed differently (8, 18, 22, 31, 54, 59, 66). provenIndex 1-4: n 100, version 6b772e6e -> b3feea99.
- `seedlist.ts 1-4 --check`: **PASS** (the verdicts refuse 0 of 100 listed seeds; 100 seeds, each clean on both settings; 1 m 44 s on a
  4-core container with the suite starting beside it).

## The lead's ruling: two 2-6 tests re-pointed at the LISTED 2-6 (c45496570)
- Found in the suite: `listedWheelSheet.test.ts` and `towerWater.test.ts` failed `withTestStage: 2-6 is already listed`. **Measured on
  3310f3ac9 itself: the same 2 fail there** (not the relist; 2-6 is listed, n 100, and the hand-built 2-6 is gone from W2_STAGES).
- listedWheelSheet: asserts no hand-built 2-6 is routed and the listed row asks for 'w2-wheel'. **RED with stageSheets.ts line 235 reading
  GEN2_STAGES alone** (planted, measured: "the listed row asks for the wheel sheet (kit:1, ... gate:2)"), green restored.
- towerWater: the listed 2-6, layouts 1-3 from the real list (`loadSeedList`), both settings: water is stacked over the spawn and the first
  4 frames keep him there, no life lost. **RED with river.ts riverAt reading x alone** (planted, measured: "layout 1 easy: at the spawn
  (140, 7551), not set on a pond's jetty (he is at 234, 2281)"), green restored. Both files 3/3, tsc clean.

## Gates on this head
| Gate | Result | Where |
|---|---|---|
| seedlist 1-4 --check | **PASS** (0 of 100 refused, 100 clean on both settings) | 5981c26c0 |
| full src suite | 2,003 ok at the box, still running; reds only the two 2-6 tests (fixed) | 5981c26c0; RE-RUN as step 0 |
| listedWheelSheet + towerWater | 3/3; each RED on its planted cause | c45496570 |
| tsc | clean | c45496570 |
| tools tests that read 1-4 (tipwalk, coveragecheck, score, bands, castBots, travelBots) | **55/55** | 5981c26c0 |
| load speed, stills, castBots, tierBots, lockall, THE FULL SET | NOT RUN (the box) | the EXACT NEXT STEP |

## Lessons applied
D111 (the box from `date`: started 4:46 PM ET, handed over at 28 minutes with the EXACT NEXT STEP), D113 (every long run with
run_in_background; none waited on in the foreground), D102 (read lean), D29 (the full suite after the relist; the pins it names re-pinned
once, rule 20), D57/D87 (ReadNotifications at every step and push), D109 (no clock times to the lead), law 3 (the two reds measured on
the base before calling them not mine), D114 (the lead's new step 0, named for the next member).

# ENG-26j (on t-build-26 from e420a2794): the lead's ruling (a): a gate section catches its own running exit; the lay adds nothing by a sealed piece. Started 4:23 PM ET 11-21 (by `date`)
Commits: ecb86074e (revert of b73600b56 + 97bb2b73e, one commit), 8e21145f1 (the fix and its plants), this REPORT. Step 1 DONE and
measured (the lead accepted it); **the speed-ups PROVEN EXACT and on the branch** (d12ffcacf, the pick of 91e6c584e); the relist and after NOT started (the
28-minute box, D111). Saved: eng26j/ (gates.mts: each gate's step and run off both ends on a built roll, and whose wood catches it;
near.mts: what lies within a hop of each gate; onto.mts: the lead's question, can wood within a hop of a gate be reached from under it; sweep-1-400-8e21145f1.json).

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the BACKGROUND on frozen worktrees (D113)
## ENG-26k: step 4 of ENG-26j's packet, on this head (steps 1-3 done: the fix accepted by the lead; (b) NOT needed: the section catches
## every running exit, the yield is 400/400)
1. **The speed-ups are DONE (ENG-26j)**: `git cherry-pick 91e6c584e` onto 8e21145f1, then `lockall.ts --layouts 16 --out` WITHOUT
   (8e21145f1) and WITH (the pick) on frozen worktrees in parallel (~8 min each): **3,264 builds of 102 stages, 66,457 part hashes, 0
   differ** (eng26j/lock-8e21145f1.json.gz, the WITHOUT record). Picked onto the branch as d12ffcacf (its src/tools identical to the tested
   tree; tsc clean). Nothing to do but use them: the relist and CI's check now run with them.
2. **1-4 relisted ONCE** (methods/seed-list.md): the old list is seeds 1-100 and **all 100 build clean on both settings on this head**
   (eng26j/sweep-1-400-8e21145f1.json), so the survivors in their old order are 1-100 and no new seed is needed: `seedlist.ts 1-4
   --merge <the four parts or the saved sweep> --in-order --count 100` (n 100) re-lays them and writes the list with the new plans (each
   gate's foot is 106-134 px longer at each end, so every 1-4 layout moves). `seedlist.ts 1-4 --check` FAILS on this head until then
   (measured on 8e21145f1: the verdicts refuse 0 of 100 listed seeds; 7 seeds' replays differ from their search on both settings,
   seeds 8, 18, 22, 31, 54, 59, 66: "rebuild the list"; the other 93 replay as they search). Then every test pinning a 1-4 roll (D29; `grep -rln "'1-4'" src tools --include=*.test.ts`:
   20 files) and the FULL suite, re-pinned once on the final list (rule 20).
3. **Then as the packet**: the phone's load speed of the listed 1-4 and 2-6 seeds (eng26h/tools/loadtime.mts base e420a2794 vs head;
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck), CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit (D99); stills of 1-4
   layout 1 before (e420a2794) and after at a gate, 2x, 390x844 and 844x390 (eng26h/tools/pin.mjs): judge the longer foot under the gate
   reads as the field's own ground, not a shelf; castBots 1-4 seeds 1-40 both settings base vs head (rule 28), tierBots 1-1, qaW123,
   generality, THE FULL SET (gates.md), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines (a sealed piece's own wood
   catches its full-speed run: gateRun). Then BUILD-26c runs 2-6's bots.

## Step 1: the gate section catches its own running exit (ruling (a))
- **Cause, measured** (landFlights' walk, the flight towerFalls / walkOff fly, frame by frame): a run off a gate's end at full speed is
  **164 px out at the frame he lands 360 px down, 173 px at 400, 191 px at 440** (the same on Normal and Easy; 8e21145f1's commit
  message says 164-183: 183 is the frame BEFORE he reaches 440, the code takes the landing frame). A gate field's foot ran
  out `GATE_RUN = GAP` = 80 px past its gate. So every gate's run came down past its own foot: where other wood was under the arc it was
  caught by that (most gates), where there was none (the foot's tip at the tower's wall, the turn's vine hanging from it) it fell 641-721
  px and the roll was refused. Not the lay: the section's own wood was simply too short for the run.
- **Fix** (w1Arc14.ts `gateRun(H)`, replacing `GATE_RUN`): the foot runs out, at each end, the flown run at the frame he lands H px down
  (the larger of the two settings) plus half his body (22 px), never under one vine spacing: **H 360 -> 186 px, 400 -> 195, 440 -> 214** (computed by gateRun on 8e21145f1).
  So both feet land on the foot, never its lip. The foot is still walked onto, never landed on (`landing: false`: Easy's widening rules
  unchanged, so Easy never pulls its vines out of two hands' reach); its vines stay 80 apart under the gate.
- **The lay adds nothing by a sealed piece** (ecb86074e reverts the lay's gate-run catch, 97bb2b73e, and its proof, b73600b56, together).
  tower.test.ts' 'towerCatches leaves a gate alone' (kept) and the new toy plant both check it.
- **Found on the way and fixed (rule 22's "every place the pattern lives")**: `w1-14-drop-one` hand-sized its foot (520 px) for a
  run-out of 0, and scaled field()'s vines to fit. Since GATE_RUN = 80 that put its four vines **55 px apart** (the design's 70-90) and
  left its gate's run-out at 80 / 80 by coincidence. Rebuilt on field()'s own layout (vines 80 apart, gateRun at both ends), the snake
  150 px past the figs' vine as before (within TRAP.scare 170), the foot run on further only if the snake's spot needs it (it does not).
- **Planted** (w1Arc14.test.ts, three tests): (1) the toy (1-4 seed 2's first refused gate: 646-1086 @1000, the foot 400 px down, a vine
  hanging from its tip to the storey under, out to the wall): the lay lays nothing by the gate with either foot; with the old 80 px foot
  the run is named by towerFalls and comes down past it; with gateRun(400) towerFalls is clean and both runs land on the gate's own foot,
  both feet on it; (2) every gate field's foot runs gateRun(H) past its gate at each end, and gateRun covers the flown run on both
  settings; (3) **1-4 seed 2 builds on both settings, errors []**, and each gate's run, flown against the gate and its foot ALONE, lands on
  its foot (the section's own wood catches it), and on the stage as laid within TOWER.fall. **RED**: with gateRun = GAP the three fail
  (9/12); on e420a2794 seed 2 is refused (4 running walk-offs Normal, 8 Easy; eng26j/gates.mts). **GREEN**: 12/12; seed 2 Normal builds
  in 0.7 s against 3.9 s on e420a2794 (no rerolls).
- **Every tower (rule 22)**: the only other sealed piece in any world is toyTower.ts' gateKit (tests only, not shipped); its built-tower
  test ('a sealed piece (a gate bough) in a built tower') runs its runs through towerFalls in the build (errors [] on every seed; 32/32 on 8e21145f1).
- **Measured harmless (the lead asked: can it be reached without the gate's finish?)**: on seed 2 (head) wood lies within a hop under
  three gates' level: a 180 px bough of the storey above **39 px under one end and 28 px beside it** (gates at y 2300 and 3342) and a row
  99 px under the gate at 7214 (11 pieces Normal, 9 Easy). From each, a hop onto the gate is possible. But **nothing reaches any of them
  from under** (eng26j/onto.mts: no lower wood within tower.ts `leaps`, generous: a double, a fall included, rise to 220 px; no vine top
  within a hop), and each gate's own foot is 360-440 px under it. The only way onto that wood is a drop from the storey above, which is
  past the gate. So no way ON to judge, and towerGates is not changed (the lead: harmless if only from past the gate).

## Measures
| what | result | where |
|---|---|---|
| 1-4 yield, seeds 1-400 | **400 kept of 400 (100%)**, each worker 100 of 100 in 137-139 s (the reverted cure: 400 in ~500 s under load; e420a2794's judge on 95cafaabc: 49, 12%). The old list (seeds 1-100): all 100 kept | eng26j/sweep-1-400-8e21145f1.json |
| 2-6's list | **PASS** (100 seeds, each clean on both settings) | seedlist.ts 2-6 --check on 8e21145f1 |
| tower.test.ts on 8e21145f1 | **32/32** (33 with the cure, less its plant, reverted with it); fieldGate.test.ts + vineFeel.test.ts 26/26 | |
| w1Arc14.test.ts | RED 9/12 (gateRun = GAP), GREEN 12/12 | |
| tsc | clean | |
| generality | PASS (26 literals, 26 known) | |
| knowncheck | PASS | |
| the speed-ups' lock (91e6c584e) | WITH vs WITHOUT: 3,264 builds, 66,457 part hashes, **0 differ**; tsc clean on d12ffcacf | eng26j/lock-8e21145f1.json.gz |
| seedlist 1-4 --check on 8e21145f1 | FAIL as expected: verdicts refuse 0 of 100; seeds 8, 18, 22, 31, 54, 59, 66 replay differently from their search (rebuild the list) | |
| roadmapcheck | FAIL on this shallow clone only ("proofs cannot be checked (fetch-depth 0)"): ROADMAP not touched | |

## Lessons applied
D111 (the box from `date`, handed over with the EXACT NEXT STEP), D113 (no foreground waits: the sweep and suites in the background, the
REPORT written meanwhile), D102 (read lean), D40 (the lay's catch reverted before the fix, nothing patched that is replaced), D57/D87
(ReadNotifications at every step and push), D109 (no clock times to the lead), D112 (the invariant, a sealed piece's ends caught by its
own section's wood, named and tested: plant 3 flies each gate's run against its own wood alone).

## Learned (for level.md, the lead decides)
- A section that owns its own catches must size them from the FLOWN exit at full speed, not a spacing: proposed rule, "a sealed piece's
  own wood under it runs out at least the flown full-speed run off its ends plus half his body", checked by plant 3's flight against the
  section's own wood alone (a check, not a number in a comment).
- A piece that rewrites field()'s output by hand must be rebuilt when field() grows (drop-one sat on GATE_RUN for days with vines 55 px
  apart): world code should extend a builder's numbers, never re-derive them.

# ENG-26i (on t-build-26 from deaaf3a7c): the walk-off judge REPAIRS a gate's run instead of refusing it; the lead's gate proof added. Started 3:55 PM ET 11-21 (by `date`)
Commits: 97bb2b73e (the cure and its plant), b73600b56 (the lead's proof: towerGateCatches), this REPORT. Steps 2-4 NOT started
(the 28-minute box, D111). Saved: eng26i/ (the cure's sweep; why2.mts prints each catch rule's verdict per end, with the
`__tcWhy` lines of 97bb2b73e's debug, re-added by hand; plant.mts lays the plant). **The head refuses 1-4 seed 2 again** (the proof); the lead has the numbers and three options.

## EXACT NEXT STEP (the next engine member; base t-build-26 at this REPORT's commit). Long runs in the background on frozen worktrees.
## ENG-26j: THE LEAD'S RULING IS (a) (it reached ENG-26i's queue during a foreground wait and was read about 5 min late: D87 repeated)
0. **(a), not (c)**: a catch the gate's own foot can jump to is a stepping stone from the foot to the gate that skips the vine climb the
   gate section exists for; a gate must be a gate. types.ts already promises it for a sealed piece: "its open ends are caught by its own
   section's wood under them, or the roll is refused by name". The running walk-off judge showed that the section's own wood does not
   catch a FULL-SPEED exit. So:
   - **The lay adds nothing by a sealed piece again**: revert the lay-catch path for gates with its proof (`git revert --no-edit
     b73600b56 97bb2b73e`, keeping 97bb2b73e's plant re-cast as a test that the lay lays nothing by a sealed piece, its run's fall named).
   - **The fix goes in the gate section** (w1Arc14's field with a gate): GATE_RUN or the foot's reach sized from the flown full-speed
     run-off, or the foot run on to the wall so the 10-46 px gap past the vine is gone, whichever the flights show (seed 2's four gates:
     the foot 400-440 px under the gate, the vine hanging from the foot's tip at the wall side, the run coming down at x 1259 / x 20).
     General (rule 22), planted (RED on this head: seed 2 refused; GREEN: its four gates' runs land on the gate's own wood).
   - **Measure** 1-4's yield on seeds 1-400 with it (before 49, the reverted cure 400) and keep 2-6's list at 100/100.
   - **Only if the section cannot catch a running exit** (no room before the wall): try (b), ways ON judged by real flown jumps from wood
     UNDER the gate only (a drop from the storey above is already past the gate, not a bypass), and send the lead the numbers before any
     relist.
1. **Then** the yield and the 2-6 list on the ruled head, as in step 0.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` onto the ruled head; lockall --layouts 16 --out on a frozen copy WITH them and
   one WITHOUT (the ruled head): every part hash of every build identical; any difference, drop the piece that made it.
3. **1-4 relisted ONCE** (methods/seed-list.md: old survivors in their order, then new seeds lowest first, --merge --in-order, n 100),
   every test pinning a 1-4 seed (D29), the full suite; then on a quiet machine: loadtime.mts base vs head for 1-4 and 2-6,
   `BUILDCHECK_STAGE=1-4` / `2-6` buildcheck, CI's `seedlist.ts 1-4 --check` timed against its 45-minute limit, and the lock's time.
4. **Stills** at 2x, upright 390x844 and sideways 844x390 (eng26h/tools/pin.mjs): 1-4 layout 1 before (4ea253b8c, seed 2:
   `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`) and after, pinned at a catch the cure laid (on seed 2, about 100 to 140 px
   under each gate's end, at the wall). Judge each: the catch must read as a bough he was meant to land on, not a shelf stuck to the
   wall. Then castBots 1-4 seeds 1-40 both settings base vs head, tierBots 1-1, qaW123, generality, the CI tool line (gates.md
   "THE FULL SET"), lockall (only 1-4 and 2-6 may move), engine-core.md's tower lines. Then BUILD-26c runs 2-6's bots.

## The cure (step 1)
- **Cause, measured** (a dump of towerCatches' inputs for 1-4 seed 2 Normal, every rule's verdict per end): all four refused ends
  (646-1086 @8120, 194-714 @4208, 670-1030 @3342, 196-716 @2300) are **shut gates** (sealed). The step off each lands on the storey
  400-440 px under it; the RUN off it comes down at the tower's wall (x 1259 / x 20), past that storey's tip. A vine hangs DOWN from
  that tip (its top at the storey's height, bottom 281 px under), so rule 2's bridge must start a hop past the vine, which is past the
  wall (spans 1256-1266, 14-24, 1210-1256, 16-24: under the 60 px floor). Rules 3 and 4 were barred for every sealed piece, so
  nothing was laid and the roll was refused. Not the arc, not the flights: one rule (`if (sealed(e.p)) continue`) shut both fallbacks.
- **Cure** (tower.ts towerCatches, every tower, rule 22): a sealed piece's RUNNING walk-off (its step already caught) may take rule 4,
  a 180 px bough of its own under where the arc comes down. It must pass every rule of a fair lay: not cramped, no storey climbed,
  out of `byGate` and any kept-out box. `towerGates` judges after. The step off a gate is still its own section's; a gate is still
  never run on (rule 3 skips sealed pieces). On seed 2 each gate gets a bough about 100 to 140 px under its end, at the wall; seed 2
  Normal builds with errors [].
- **Plant** (tower.test.ts, 'a gate's RUNNING walk-off that lands by the wall past a vine-topped bough gets a catch under the arc'):
  seed 2's first gate in a toy tower (gate 646-1086 @1000, storey 566-1166 @1400 with a vine hanging from its tip, the vine's storey
  700-1280 @1681). **RED on deaaf3a7c (fail 1), GREEN on 97bb2b73e**; it also checks nothing lies by the gate or over the vine's top,
  towerGates is clean, and a lone gate still gets no catch (its two step falls named, as before). tower.test.ts **33/33**.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| 1-4 seed 2 | before: 4 running walk-offs off gates refused (641-721 px). After: **errors [] on Normal and Easy** (Easy's own build 1,245 ms, under load) | scratch why-dump (debug hook, not committed); eng26h/tools/why.mts |
| generality | **PASS** on 97bb2b73e and b73600b56 (26 literals, 26 known) | |
| plant | RED on deaaf3a7c, GREEN on 97bb2b73e and b73600b56 (with the proof's two checks); tower.test.ts 33/33 | |
| tsc | **PASS** on 97bb2b73e and b73600b56 (after `npm ci --legacy-peer-deps`; this container had no node_modules) | |
| 1-4 yield, seeds 1-400 | before 49 kept (12%, eng26h/sweep-1-400.json). **The cure alone (97bb2b73e): 400 kept (100%)**, none of the 49 lost; each worker 100 of 100. **With the proof (b73600b56): NOT MEASURED**: its sweep was still running when the box closed (slower: refused rolls make every search re-roll); re-run it, step 1 | scratch sweep, `--worker i/4`, under load |
| 1-4 seed 2 with the proof | **refused again, both settings, all four gates** (every fair height reached: the storey under from 180 px under the gate down, a drop from the storey above from 160 px up); the variant counting only wood under the gate's level: still 4 of 4 | why.mts; a scratch log in the lay (not committed) |
| 2-6 list | `seedlist.ts 2-6 --check` on 97bb2b73e: **PASS** (100 seeds, both settings), 43 s. Not re-run on b73600b56 | |

## Lessons applied
D40 (cure the judge before relisting: no relist was started), D57/D87/D105 (ReadNotifications at each step and push; long runs in the
background so the queue is read), D96 (step 4 names the full CI set, gates.md), D102 (read lean: the packet, the REPORT's top, rules
19/20/22/28, the code by line range), D107/D111 (handed over at the 28-minute box with the exact next step), D109 (no clock times in
messages to the lead; this REPORT's start time is from `date`), D30 (times from `date`), law 3 (checked the fact: tsc was not counted
as a pass until it ran with its dependencies), law 22 (the gate rule kept by its own reading, the stricter reading put to the lead
instead of chosen quietly).

# ENG-26h (on t-build-26 from 95cafaabc): the walk-off judge's price. HANDED OVER by D111 (40 min), written 3:52 PM ET 11-21
Commits: 93246fa93 (buildcheck takes BUILDCHECK_STAGE), 91e6c584e (three EXACT speed-ups, proof NOT run) REVERTED off the head by
the lead's ruling (cherry-pick it in step 2), this REPORT. The branch's src is 95cafaabc's, proven.
Saved for the next member: reference/qa-reports/BUILD-26/eng26h/ (both locks gzipped, the 1-400 sweep, the scratch tools in tools/).

## EXACT NEXT STEP (ENG-26i; the lead's ruling by D40: the 401-1000 sweep and the relist STOPPED, never relist against a judge that throws
## 88% of rolls away and then again after the cure). Long runs in the background on frozen worktrees (4 cores). In this order:
1. **towerCatches lays a catch where a refused RUNNING walk-off lands**, so rolls pass instead of being thrown away: general (every tower,
   rule 22), planted first (a toy tower whose run-off end drops past TOWER.fall with a fair catch in reach: RED on 95cafaabc, GREEN after).
   The refused ends to start from, 1-4 seed 2 Normal on 95cafaabc (eng26h/tools/why.mts prints a build's errors; ends.mts judges named
   pieces with the head's walkOff): 646-1086 @8120 (runs off both ends land y 8761, 641 px: left at x 400, right at x 1260), 194-714
   @4208 (left run to x 20 y 4909, 701 px; right to x 979 y 4909), 670-1030 @3342 (right run to x 1260 y 3983, 641 px), 196-716 @2300
   (left run to x 20 y 3021, 721 px). Read why towerCatches' run branch (tower.ts `runs`/`takes`/`exAt`, the bridge, run-on and own-bough
   rules) lays none there: the arc comes down at the tower's side (x 20 / x 1260) or past the lower storey's wood. **Measure 1-4's yield
   before and after** on the same seeds: before, seeds 1-400 kept 49 (12%; eng26h/sweep-1-400.json, `seedlist.ts 1-4 --count 100000
   --from 1 --to 401 --worker i/4 --part p<i>.json`, ~500 s a worker under load); and rerolls per search build (repairs.mts prints
   gen2.rerolls: seed 5 was 0 on base, 7 on the head). 2-6 rides the same judge: its list passed 100/100 on the head; re-check it after.
2. **The three exact speed-ups**: `git cherry-pick 91e6c584e` (fly's piece box; roofedDrop's run once a piece a walk; physics reach
   tables indexed) onto step 1's head; prove them: lockall --layouts 16 --out on a frozen copy WITH them vs one WITHOUT them (step 1's
   head), every part hash of all 3264 builds identical. (Against 95cafaabc's lock only if step 1 is not in yet:
   eng26h/lock-head-95cafaabc.json.gz.) Any difference: drop the piece that made it.
3. **Then relist 1-4 ONCE** (methods/seed-list.md; the survivors of the old list in their old order first, then new seeds lowest
   first, --merge --in-order, n 100), every test that pins a 1-4 roll or seed (D29), then on a QUIET machine: the phone's load
   (eng26h/tools/loadtime.mts <worktree> 1-4 3 and 2-6: every listed seed's replay as stageGenerator builds it, both settings, any seed
   that fell to the search), base 4ea253b8c vs head; buildcheck alone (BUILDCHECK_STAGE=1-4 / 2-6 node tools/perf/buildcheck.mjs, base
   first: 1-4 may be over 150 ms already); CI's seedlist 1-4 job timed (D99, the 45-minute limit: `seedlist.ts 1-4 --check` base vs
   head on one machine) and the lock's time (486 s base vs 1431 s head here, side by side).
4. **Stills** of 1-4 layout 1 before and after (eng26h/tools/pin.mjs <root> <out> 1-4 1 normal <port> name:x:y,...; dsf 2, sideways and
   upright; prints the seed it built): before on 4ea253b8c (listed seed 2): `storey1:1006:10984,walkoff:1070:8120,walkoff2:220:4208`;
   after on the relisted head (layout 1 = the new list's seeds[1]: say which), its spots from its own platforms. Then castBots 1-4 seeds
   1-40 both settings base vs head in one chain (no tier's pass count may drop), tierBots 1-1 9/9, qaW123 (19/19 at 95cafaabc), the
   full suite, tsc, generality, the CI tool line (methods/gates.md "THE FULL SET"), engine-core.md's tower lines (ENG-26g's list plus
   this REPORT's cost findings). Then BUILD-26c runs 2-6's bots.

- **The lead's proof** (b73600b56, tower.ts `gateCatchReached` / `towerGateCatches`, pipeline `gen2.tower.gateCatches`: each catch with
  its gate's id, so the verdict needs no guess). Planted in the same test: the plant's own catch passes; a toy catch 150 px over the
  storey under the gate is refused by name ('reached by the piece at x 566-1166, y 1400, not only by a fall off the gate').

## Findings (numbers)
| item | result | evidence |
|---|---|---|
| step 1: the full lock | lockall --layouts 16, 95cafaabc vs 4ea253b8c, both frozen: **100/102 unchanged; movers 1-4 and 2-6 only (both intended)**. 1-4: 32/32 builds moved; **layout 12 (seed 13) FAILS to build on both settings** ("no seed of 24 from 13 builds cleanly", first: flags none before the hard node n6). 2-6: 32/32 moved (platforms, collectibles, proto.decor). Lock time 486 s base vs 1431 s head (side by side) | eng26h/lock-*.json.gz; sent to the lead, accepted |
| 2-6's list | `seedlist.ts 2-6 --check` on 95cafaabc: **PASS (100 seeds, each clean on both settings)**, 43 s | |
| 1-4's list | seed 2 refused on the head: 4 running walk-offs drop 641-721 px (limit 450). Sweep 1-400 on 95cafaabc: **49 kept (12%)**; old list 1-100: **14 survive, 86 refused** | eng26h/sweep-1-400.json |
| why 1-4 is slow | NOT mainly the flights. The judge refuses most ROLLS: seed 5's search build has rerolls 0 (base) vs **7** (head); each refused roll is a full lay + Normal and Easy checks: the stage check runs 4x a build on base, **32-56x** on head. Warm head search build ~10x base (seed 1 2678 vs 160 ms; seed 5 1535 vs 96 ms; under load). Pieces 97-105 -> 127-142 (the catches). This is paid by every SEARCH: relists, the lock, CI's seedlist job (it re-runs each listed seed's full search), the no-list fallback. The phone replays one plan: not measured yet (step 3) | eng26h/tools/repairs.mts, hot.sh |
| profile of a head build (before 91e6c584e) | physics reachTable's linear scan ~27%, levelCheck roofedDrop ~20% (P^3 in a tower: every pair, each a pass over every piece), tower.ts fly ~13% (every piece every frame) | hot.sh |
| 91e6c584e (exact by construction, PROOF NOT RUN; reverted off the head) | fly reads only pieces in its path's box (x: the way out, a stop steps back <= 2 px a frame; y: its depths); roofedDrop's run and closed ends found once a piece a walk (cleared each walk); reach tables in Map<v0, Map<vx, list>>. Head build ~1.8x faster (seed 1 2678 -> 1469 ms, seed 5 1535 -> 932 ms, warm, under load); fly 1180 -> 114 samples. tsc PASS | lock proof: step 1 |
| buildcheck | takes BUILDCHECK_STAGE=<listed stage> (its own kit, gen2/listed.ts); 1-1 unchanged by default. Not yet run for 1-4/2-6 | 93246fa93 |

## Pushback
- The packet's remedy (cache the flown arcs) aims at the wrong cost: the flights were ~13% of a head build; the price is the refused
  rolls (7 of 8 for seed 5) and the check over the extra wood. Suggest (an engine packet, rule 22, every tower): towerCatches lays a
  catch a refused run's arc lands on (seed 2's four ends, 'drops 641-721 px'), so rolls pass instead of being thrown away: that cures
  the 12% yield, the search cost and the CI time together. A search that refuses a roll before its checks is NOT exact (the checks
  repair the stage first: repairLandings takes caps up, and caps bounce a walk-off), so it is not a free speed-up.
- Note for whoever reads the lock: its 1-4 builds ARE the game's path with the list in (layout 12 asked seed 13, the list's seeds[12];
  with no list it would ask 12); a listed seed whose plan no longer replays falls to the search, as a phone would.

## Lessons applied
D57/D87/D105 (ReadNotifications at every step and push: the lead's D111 hand-over read at the push), D94 (base = 4ea253b8c, the
integration base ENG-26g's lock used), D96 (the full CI set named in step 5), D102 (read lean: code by grep and line ranges; profiled
instead of reading), D107/D109 (no clock times in messages), rule 22 (the cost fix goes in engine code every stage reads, not in 1-4).
Owned miss: I did not time-box the investigation against D111's 28 minutes; the relist and the quiet measures are not done.

# ENG-26g (on t-build-26 from 44dcbb41a): the tower's walk-off judge. HANDED OVER at the context line, STOPPED on step 3 (1-4 moves)
Commits: de009b9f5 (the judge), ac2fd73b6 (water by his middle, a cap bounces him on), this REPORT.

## EXACT NEXT STEP (the next engine member, in this order)
1. **WAIT for the lead's ruling on 1-4** (packet step 3: a shipped stage's lay changes only on the lead's ruling). 1-4 MOVES: Normal
   layout 1 was seed 2 at 44dcbb41a, is seed 7921 at ac2fd73b6 (seed 2 refused by the walk-off judge, so another tower is drawn). The
   lead asked for: which towers move (the full lock), before/after stills of the moved spots (upright and sideways, 2x), 1-4's seed list
   --check. None of the three is finished: they were started in the background on a frozen ac2fd73b6 in MY container and die with it,
   so RE-RUN them on a fresh frozen worktree of ac2fd73b6:
   - `npx tsx tools/engine/lockall.ts --layouts 16 --intended 2-6 --check lock-base.json` where lock-base.json is
     `git worktree add <dir> 4ea253b8c` + `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` there (7.5 min each).
     Note: on de009b9f5 the lock sat on 1-4 for over 10 min (one 1-4 build is 1.4 s at the head, 5.5 s on ac2fd73b6; the list's
     seeds now fail and a build searches on): expect 1-4 to be slow; time it, it is a perf finding for the judge (towerCatches calls
     walkOff per end per pass and per candidate catch).
   - `npx tsx tools/engine/seedlist.ts 1-4 --check` and `2-6 --check` (how many listed seeds the judge now refuses, by name).
   - stills: which spots moved come from a platform diff of the same build before/after (a script that dumps `generateStage` platforms
     for a stage/layout/setting the lockall way, then a set diff); pin Pokey there with a dsf-2 copy of tools/art/kitaudit/shoot.mjs
     (pin at {x, y}, `localStorage sloth_difficulty` for Easy), upright 390x844 and sideways 844x390, on both worktrees.
   Send the lead: the lock's movers, the seed-list counts, the stills. Then do as ruled (relist 1-4 under the judge, or not).
2. **qaW123 '2-6: a plain walk to a street's dead end'** (TOWER.fall, the lead's ruling): on de009b9f5 it fell from every Normal end
   and 5-6 Easy ends (406-761 px) to 2 ends a Normal roll and 1 an Easy roll, all walking LEFT, ~505 px, at the same two spots on rolls
   1/2/3/7/12: (a) the left end x 114 by the turn vine's top (x 88): the run is held by the wall at x 20 and fell past the wheel pond,
   which starts at x 30 (water takes him by his middle, river.ts riverAt; the judge had given it a foot's 11 px): FIXED in ac2fd73b6;
   (b) the end at x 827, y 1556: the run comes down on a mushroom cap (706-776, y 1704) the judge read as a landing; the engine bounces
   him on (roll 1 lands 150 px down, others 505-510): FIXED in ac2fd73b6 (walkOff flies the flown 'bounce' off a cap). qaW123 on
   ac2fd73b6: **GREEN** (with towerFoot, towerCatchWater, wheel*.test.ts: 19/19 pass, 0 fail, on a frozen ac2fd73b6). Done unless
   the lead's 1-4 ruling changes the judge.
3. Gates (packet step 4), on the head after 1-2: tsc (PASS at ac2fd73b6), generality, the FULL suite and the CI tool line
   (reference/methods/gates.md "THE FULL SET, named"), lockall again.
4. engine-core.md's tower lines: NOT rewritten (no context left). Write: tower.ts walkOff (the flown run; wall faces flown straight down
   and on again, the deeper judged; water by his middle; caps bounce along the flown bounce, BOUNCES 3), openEnds judges step + run,
   towerCatches lays a run's catch where the arc comes down (runX) and only if the flown run lands on it (`takes`), a contiguous bridge
   needs no 60 px; BUILD-26b's clearFoot (TOWER.foot) in pipeline.ts towerJoin.
5. Then BUILD-26c runs the bots (the cause table, the 2-minute beat table) on the ruled head.

## Done
| item | result | evidence |
|---|---|---|
| step 1: turn's-foot piece re-checked | lockall --layouts 16 --intended 2-6, 44dcbb41a vs 4ea253b8c: **102/102 unchanged** (2-6's 32 builds too: clearFoot moves none of them); generality PASS (26 literals, 26 known) | /tmp/claude-0/-home-user-Sloths-Adventure-/65bc8b33-3d54-5e90-8b15-8de7c46842d6/scratchpad/lock-head.log (my container) |
| step 2: the walk-off judge | tower.ts `walkOff` flies the engine's own full-speed walk-off (landFlights.data.ts 'walk', proven the engine's by landFlights.test.ts; the same path both settings, asserted), held at the tower's sides [20, W-20] and at a wall's face; `openEnds` judges the step AND the run; `towerFalls` names "a running walk-off"; `towerCatches` lays each run's catch where the arc comes down to its height (`runX`), only if the flown run lands on it; a bridge that runs its own wood on needs no 60 px (2 gate rolls had a 16 px slot by the wall) | de009b9f5 |
| planted RED/GREEN (toy tower) | new test "a running walk-off off any end of a built tower..." judged by landings.ts `Landings.walk` (an independent flier): **old code 24/24 rolls, 420/4376 ends past 450 px; judge 0/24, 0/5307**; none of the 24 refused (BUILD-26b's draft: 13/24 left open). Unit plants: 200-wide step catches named as runs, 300-wide close them; wall clamp, wall face (down / hoist), pond from x 30 (falls) vs x 10 (caught), cap with nothing past (floor) / wood past (lands there), a cap end named | tower.test.ts 32/32 at ac2fd73b6 |
| #16 filter | 'every piece of a storey, its hops' catch boughs included...' took every seam piece in a y band; a run's catch (a lower-storey bough by `fair`, judged by towerSkips) was filed in the upper section's seam ("hangs under") and read as a storey piece 41 px over the ledge. The filter now takes its hops' catch boughs lip to lip (its own words); the assertion is unchanged | ac2fd73b6 |
| step 3 | **STOPPED: 1-4 moves** (seed 2 -> 7921 on Normal layout 1). Full lock, seed lists, stills: UNFINISHED (see EXACT NEXT STEP 1) | |

## Pushback
- A walk-off at less than full speed (a kid starting to walk near an end) lands between the step and the run; the judge flies only
  those two (the packet's), so a gap between the step's wood and the run's catch could still drop a slow walker. Suggest: judge a
  second flown walk-off from a short run-up (flyLandFlights could fly it) if the bots show it.
- After a wall stops him the engine's air drive (how fast he goes on) is not flown; the judge flies both bounds and takes the deeper.

## Unresolved
1-4's ruling, the full lock, seed-list checks, stills, the full suite and CI line, engine-core.md (all above).

## Learned
- The running walk-off already had an engine-true model in the repo (landings.ts, landFlights 'walk'): reuse a flown path, never a
  second closed form; and an independent flier makes the planted test honest.
- Water, caps and walls are where a walk-off model goes wrong: trace the real engine on every end a model says is caught.

## Lessons applied
D57/D87/D105 (inbox at each step and push), D102 (lean reads: line ranges and greps), D107/D109 (no clock times to the lead), D96
(gates named from gates.md, not run: named UNRUN), rule 26 (engine gap fixed in the engine, every tower), rule 28 (each 2-6 miss traced
in the real engine before its fix), LAWS 3 (the BUILD-26b draft's model checked against the flown table before reuse).

# BUILD-26b (on t-build-26 from 4ea253b8c): HANDED OVER at the context line
Commits: c29b8332d (step 1 deletion), 60234ead0 (6 pins re-pointed), 1be132415 (step 2 ENGINE: turn's foot clear), this REPORT
(+ walkoff-wip.patch, + qaW123 dead-end test on TOWER.fall).

## EXACT NEXT STEP (BUILD-26c, in this order)
1. **The walk-off ENGINE PIECE (lead's ruling; rule 26), NOT LANDED.** Ruling: the tower judges a walk-off where a RUNNING walk-off lands
   (STAGE-RULES :418), one general place, planted RED/GREEN, generality PASS; **if lockall moves a shipped tower (1-4, 2-6, any), STOP and
   send the lead which.** My draft: `git apply reference/qa-reports/BUILD-26/walkoff-wip.patch` (tower.ts: `walkOffLand` arc at
   PHYS.maxRun/gravDown/maxFall inside the walls; openEnds judges the step AND the run; towerCatches lays its catch where the arc crosses
   its height; towerFalls names "a running walk-off"). It is RED: tower.test.ts 5 fail (#2, #5, #10, #16, #28), the toy tower `up`
   13/24 rolls keep an uncaught running walk-off (e.g. normal 1: the piece x 708-888 y 4475 drops 604 px): towerCatches finds no FAIR
   catch on the arc (the arc lands 90-200 px out, by the next turn's vine / under the storey above, where `fair` refuses). #10's planted
   catches (200 wide at x 380/640) are the old model's and must widen to cover the arc (it lands ~182 px out at 400 px down). The 1-4
   seed list check against the draft: UNRUN (stopped). Expect it to move 1-4: ask the lead before landing.
2. **qaW123 '2-6: a plain walk to a street's dead end'** now reads TOWER.fall (lead's ruling) and stays RED until step 1 lands
   (Normal ~505/617 px ends every roll; Easy 5-6 ends, 406-761 px; walked in the real engine).
3. **Step 2 (turn's foot)** landed at 1be132415: clearFoot in pipeline.ts towerJoin slides a block off a turn's foot (TOWER.foot 70 +
   CLIMB_CLEAR) clear of every climb on its ledge, else the roll fails by name. towerFoot.test.ts: RED 530 misses without, GREEN with
   (37/48 toy rolls; 11 Easy refused by towerSkips: a slid boulder can be a step under the next storey; named, never laid). generality
   and lockall --intended 2-6 vs 4ea253b8c: see "Gates" (LOCKALL_RESULT). If lockall shows any other stage moved, STOP and tell the lead.
4. Then the packet's steps 3-5 as written (cause table to the lead BEFORE fixing a bot/engine cause; the expert's beat-by-beat seconds
   on the MIN seed; stills only on a green head). Run castBots 1-40 both settings on the head after steps 1-3 first: the turn's foot
   and the walk-off both change what the kid/adult dither 87-90 px short of a turn's vine may be (not traced: no time).

## Done
| item | result | evidence |
|---|---|---|
| base gates, frozen 8b2438c74 | tsc PASS; shards 1/2 PASS, 3: 1 fail `listed.test.ts` 'nothing in the game calls withTestStage' (w2Arc26.ts header comment, ENG-26f's): GONE on this head (BUILD-26 rewrote the header); CI tools/generality/coverage/knowncheck/roadmap/timecheck/tipwalk/registrycheck/seedlist 1-1: G0_TAIL | scratchpad g0out/ (this container) |
| deletion | buildKapok `village` param and every branch (first post + log, windows, porch dressing, knots' floor/doubt walk-off, doubt-knot judging, bankWall, decor); stageSheets '2-6' goldsnake; levelSeeds '2-6': 0 READ, KEPT (registrycheck needs LEVEL_ATTEMPTS per row stage; 2-5 the same); 2-6.md :47-48 hearts ruling, :59 deletion | c29b8332d |
| pins | qaW123: the first climb (only climb from the bank, tops on the first wheel's jetty, a hopping walk rests by it) + Dot's ride line on the bank before the climb (both settings/views/taught): PASS; dotBox 2-6 'Ride a bucket up!' at 200 (where the boulder stops a plain walk) and the ground pick honours the hint's band (it took the tower's TOP storey): 9/9; towerBots climb framing (4-1 for the old climb, 2-6 held as a tower): PASS; w2Arc26 hearts (nothing costs one on Normal, 0 laid): 5/5; edgeFooting, w1NewArt, wheel.test read: still true | 60234ead0 |

## Pushback
- lines-2-6.md "Why" 5 says the new 2-6 has no post before the first wheel; the BUILT stage has one (the tower's first turn, x 1562
  Normal / 1610 Easy, from the bank to the jetty): so dotBox stands him where the line goes up, not at 'lip' (rule 27).

## Owned miss
Started step 2 before the lead's walk-off ruling was read (it sat 8 min in the queue while I wrote the turn's-foot test). Nothing built
on a stop; the order cost the walk-off piece its box. Countermeasure: ReadNotifications before starting each new piece, not only at pushes.

## Learned
- A turned storey's vine stands TOWER.vineIn (44) in from the ledge end, exactly where an end boulder sits: moving the vine can't keep the
  storey's room, moving the block can (toy: 48/48 refused vs 37/48 built).
- The running walk-off is the tower's real fall: a catch under the end does not catch him at a run.

## Lessons applied
D57/D105 (inbox at each step), D59 (the stopped 1-4 check named UNRUN), D102 (lean reads), D109 (no clock times), D40, rule 27 (built
numbers: spawn 140, jetty 1296-1536 y 6161, vine 1562), rule 26 (engine gaps reported, fixed in the engine).

## Turnover note
engine-core.md NOT rewritten (no context left): BUILD-26c writes clearFoot + walkOffLand there.

# BUILD-26 REPORT: 2-6 "Up the Bank Houses: The Water Wheels", laid by its design on a real row (HANDED OVER at the context line)
Branch t-build-26 from 8b2438c74. Commits: 0c906c4ff (step 0 probe), fab3a8a20 (the lay, the row, the seed list, the hand build's route
deleted), 8f3bcb3b6 (rule 28: the rest lays no boulder), 4a9e38e67 (the words), this REPORT.

## EXACT NEXT STEP (for the next member; in this order)
1. **Finish the deletion (new replaces old)**: protoStage.ts buildKapok's `village` parameter and its branches (grep `village` in
   protoStage.ts: 21 hits; the hint at :4859, the first post :4858/:4867, windows :4900, the dressing block :5317-5345, villageKnots :5551,
   bankWall :5676) and the `village` doc at :4615. KEEP ProtoExtras.ladders/bankWall and drawLadder/drawEarthWall: finish26 USES them
   (w2Arc26.ts finish26), so the lead's condition for keeping them holds. stageSheets.ts:89 `'2-6': ['foe:goldsnake']` (the hand build's
   cast; 2-6 has none) and levelSeeds.ts:22 `'2-6': 0` are UNCHECKED: read what each is for, then delete/move. Update design 2-6.md:59.
2. **Re-point the pinning tests, each assertion kept** (all RED on 4a9e38e67 against the new 2-6, run in this session):
   - qaW123.test.ts :123 (first ladder on screen from the start), :141 (Dot's climb line by the first ladder), :203 (a porch's dead end:
     no fall >= 400 px). The first two were the hand build's posts; KEEPER-26 re-pointed the moment to the ride (lines-2-6.md "Why" 5).
     Suggested: :123/:141 -> the first wheel's jetty is the first thing to use and Dot's `ride` goes up before it; :203 run as written
     on the new streets and READ its failures (they may be real: a plain walk off a street end).
   - dotBox.test.ts:199 -> `{ stage: '2-6', layout: 0, hint: 'Ride a bucket up!', at: 'lip' }` (the keeper's line AND spot; if the
     ground under the hint is the millpond bank and not the jetty, `at: <px to the jetty's end>`; lines-2-6.md "Why" 5).
   - the test "the climb framing is a tower's alone: a shipped climb of the old generator ... keep the framing" (#22 in the pins run;
     towerBots.test.ts:150 lists ['2-6', 'up']): 2-6 is a tower now; re-point.
   - edgeFooting.test.ts:17, w1NewArt.test.ts:92, gen2/wheel.test.ts:57 use RealPlay('2-6'): they PASSED on the new 2-6 in the pins run
     (only the 6 above failed); read each once to check its comment still says true things.
   - w2Arc26.test.ts 'the climb up the bank village' (moved from w2Stages.test.ts): RED on its hearts assertion only, kept as written.
     **For the lead:** the PLAYED 2-6 lays 0 hearts on Normal (2-4: 6, 2-5: 7; 2-6 Easy 8; tools/inspect/b26/played-hearts.ts). The
     design asks a heart after beat 10. Is 0 the live rule (nothing on Normal 2-6 costs a heart: every wheel's pond and the millrace are
     soft), or a gap? Do not loosen the assertion; get the ruling.
3. **Bots (rule 28), RED, traced so far** (castBots 1-40 both settings; rows in rows/):
   | head | kid N/E | adult N/E | child N/E | middle N/E | expert N | expert min |
   |---|---|---|---|---|---|---|
   | fab3a8a20 | 32/40, 0/40 | 35/40, 0/40 | 13/40, 6/40 | 4/40, 9/40 | 11/40 | 123.1 s |
   | 8f3bcb3b6 | 0/40, 0/40 | 0/40, 0/40 | 28/40, 27/40 | 38/40, 33/40 | 39/40 | **112.3 s** |
   Every miss is a rescue (hits 0, lives 0). Traces (tools/inspect/b26/trace.ts, frames.ts, dump.ts, route.ts):
   - FIXED at 8f3bcb3b6: kid N 11 (x 1490 y 4192), middle N 1 (x 1509 y 4192, x 1635 y 4242): the rest street's boulder stood 36 px from
     the tower turn's vine; the bot stood on it under the climb. **ENGINE-WORTHY:** the tower lay keeps no turn's foot clear of a block
     (pipeline tower turn, wheelLay/tower.ts): any stage's brick with a block near its storey end can hit it.
   - OPEN, kid/adult (0/40 after the fix; adult was 35/40 before it): they stop ~87-90 px short of a tower turn's vine and dither for
     20 s: adult E 2 at x 1525 y 4465 (vine x 1612, pad alternates right/left around x 1514-1538, standingOn #39; the route is right:
     route.ts shows the next points ON the vine), adult N 20 at x 1074 y 2825 on the top wheel's street (vine x 1161, a flag at x 1099).
     Not yet found: why the bot will not walk the last 90 px. Next: FT_FRAMES=83.4,85 with the bot's chosen step printed in
     firsttimer.ts, or compare with 1-4's turns. The kid is not the bar (level.md rule 4; 2-5's report); adult passed 40/40 on 2-5.
   - OPEN, child E 2: rides the edge wheel round and falls back 8 times (x 748 y 4435, "fell back down from here").
   - The 2-minute rule: the expert's MIN is 112.3 s (the lead's bar: 125 s over 80 runs). Bring the lead beat-by-beat seconds before
     changing anything (the lead's ruling: no slowing the wheels, no filler).
4. Then step 3 (the FIRST LOOK: upright + sideways at 2x, beats 1, 5, 8, 12 at the top of each ride; the four upright to the lead), only
   on a head whose bots are green (rule 29). Then the full set and the beat-1 clip.
5. engine-core.md: write ENG-26f's 'For engine-core.md' lines (ENG-26f REPORT :28-43), not done here.

## The plan as ruled (STEP 0, the lead's GO with rulings)
Node string verbatim (2-6.md:43). G3: the 1700 px tower. G4: the live flag rule wins, never a flag on a jetty; the millrace near bank
>= 260 px built (laid 300); flagMiss re-read on every roll (empty on every probe). 2-minute: expert MIN >= 125 s over 80 runs. Deletion as
listed; ladders/drawLadder/bankWall/drawEarthWall stay only if finish26 uses them (it does). Clue: a World 2 sign TAKE YOUR TIME on the
top house (laid: SIGN_26). Art: the bucket trough is painted from the w2-wheel sheet (wheelDraw.ts:8-11): not missing. Words: approved.

## Done
| step | result | evidence |
|---|---|---|
| 0 gates (base 8b2438c74) | tsc PASS; ENG-26f's planted tests 27/27 PASS; seedlist 1-1 --check PASS (161). The unit suite, CI tool line, generality, coverage, knowncheck, roadmap, timecheck: RE-RUN on a frozen worktree of 8b2438c74 (my first run read the live tree I was editing: owned miss below); results in the scratchpad g0b/, NOT read before hand-over | this session |
| 1 lay | w2Arc26.ts real bricks (millpond 560+380 with a boulder and Dot's `ride` 800+ px before the jetty; the teach wheel; the first street: step up, boulder, hop; through a house: foot, ladder, roof; the millrace near 300 / far 240; the edge wheel; the hanging porches, 4 spans, Dot's `jump`; the top wheel; wheel to bounce; the great wheel with Pokey's `view`; rest streets; the crest), stageTable '2-6' { kit 'w2-26' }, listed.ts KITS/WORLD/FINISH, finish26 (bank wall, ladders, doors/lanterns/windows/washing clear of every wheel's sweep, the crest's rooftop, bell, Gruntlewick, the sign) | fab3a8a20, 4a9e38e67 |
| 1 addlevel | 24/24 clean both settings, one beat order; seconds (modelled) 172.5-172.9 N, 189.5-189.9 E; seed list 100 of 101; registry: nothing missing; MISSING: bots, and its row is not `judged` (fly: `FLIGHT_STAGE=2-6 npx tsx reference/specs/sims/flight.ts normal all`) | rows/addlevel.txt |
| 1 deletion (part) | w2Stages.ts '2-6' route, clearFlags, its note; W2Plan '2-6' and its Exclude/flavour lines (w2Sections.ts); riverLay.test's '2-6' skip | fab3a8a20 |
| 2 words | LINES_26 ride/jump/view, MISSION_26 (stagePlan), CLUE_26 (stageClue), JOURNAL_26 (pokeyJournal), NORIA_PAGE_26 (held; no journal page surface exists in code, as 2-2's lily page), SIGN_26; hint.2-6.climb deleted, way.2-6 kept; w2Arc26.test.ts holds each equal to lines-2-6.md | 4a9e38e67 |

## Polish check
No stills shot (rule 29: the bots are red). Nothing judged on screen yet.

## Pushback
- The packet's step 0 gates: I ran the long ones against the live working tree, then edited it: owned below.

## Unresolved (named plainly)
buildKapok's village branch not deleted; 6 pinning tests red; hearts on Normal 0 (lead's ruling); bots red (kid/adult turn-vine stall,
child E edge wheel, expert min 112.3 s); no judged row (flight not run); no stills; engine-core.md not written; the frozen-base gates not read.

## Owned miss
Step 0's unit suite ran in the live working tree while I edited it after the GO, so its result would not have been the base head's.
Caught before reading it; killed; re-run on a frozen worktree (git worktree add --detach). Countermeasure (level.md step 7 already says
it for step 7): every background gate runs on a frozen worktree, step 0 included.

## Learned (proposed level.md rules, for the lead)
- A tower storey's last brick decides where the turn's vine stands: no block (boulder) in a brick that can end a storey, until the tower
  lay keeps the turn's foot clear (ENGINE-WORTHY above).
- Run castBots 1-40 the moment the row lists (it took ~3 minutes at --par 3): the draft's 2-seed table hid what 40 seeds showed.

## Lessons applied
D57/D87/D105 (inbox at every step and push), D75/D101 (laid on the real row), D102 (grep and line ranges after the lead's context read),
D109 (no clock times in messages), D40 (nothing patched that is being replaced).

## Turnover note
reference/handoffs/engine-core.md: NOT rewritten (step 5 above).
