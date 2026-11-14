# ENG-16F REPORT: 1-6's bot reds traced frame by frame and fixed where they live; FAR ruled; the old 1-6 retired (R-165.246, R-165.238)
t-build-16 from ENG-16E's 88da57f1; packet reference/packets/2026-11-14/ENG-16F.md (lead's branch ccr-ea739a2f-dfcee4). Start 3:50 PM ET (`date`).
Heads: 7904cb65 (FAR), c84ca45f (harness + two bot fixes), 045b8a93 (1-1 calibration + the 1-6 table rows), 92417f14 (the pit step),
af672cc1..b89dee5d (the old 1-6 retired, a helper subagent in its own worktree, reviewed and cherry-picked), 8f429a6a (the liana's foot),
e4322053 (the face count, 1-1 recalibrated again), then this REPORT.

## EXACT NEXT STEP (in order; engine tier, xhigh)
1. **The self-swing lay rule (the lead's ruling (b), 4:42 PM ET).** vineSelfSwing.test.ts is RED on the new 1-6: on rolls 1-3 the false
   liana (the still snake, stillOne, w1Arc16.ts:158, amp 0, ~165 px) hangs 78-85 px in front of the real liana (420 px, amp 0.45) in the
   false-liana beat and the gorge (`where/` probe selfswing: x 38624/38702, 44947/45030 on roll 1). Write a height-aware swingClearance in
   physics.ts: the sweep of each vine at every depth Pokey can hang on it (SWING.minLen to the foot), plus SWING_CLEAR.body + margin,
   against the other vine at that depth. Plant it both ways: the 78 px pair RED, a correct pair GREEN, a swinging-swinging pair unchanged.
   Then the lay rule from it, in pipeline.ts, global (any still or swinging vine beside a swinging one), then relist 1-6. The
   integrator reviews the measure line by line.
2. **artUse.test.ts is RED** (the helper's F1, retire-old-16.md): W6's `w6balt.json#seesaw-b` has no draw site. The scanner had only
   counted it through the deleted old-1-6 string `` `seesaw-${ROOMS.length}` ``; there is no W6 seesaw room in the code (grep: only
   kitStage.ts's test room and the deleted 1-6). It was never drawn; the gate was fooled. The allow-list only shrinks, so it was NOT
   added. It needs the art owner's ruling: draw it where W6 wants a seesaw, or take the piece out of the inventory.
3. **No bot is rescued on 1-6 any more** (castBots seeds 1-6, e4322053). What is left is sealed doors only, petals 2-7 short: child
   Normal s1 (93/95) and s2 (90/94), middle Normal s1 (90/95), expert Normal s1 (92/95), s2 (91/94), s3 (95/102) and s5 (86/90). This is
   BUILD-16d's (b), petals hopped over on perches and banks, not traced in this box. Trace first with petalmiss.ts / where-petals:
   which petals, and whether a person's hop over a petal 34 px up takes it (then it is the tier bot's pickup). If not, they are stage
   petals off the walked path (the socket petals ENG-16E's pushback named: `pa`, `pc`, `pg`, w1Arc16.ts).
4. Then 1-6 to GREEN as the packet's item 3: `npx tsx tools/engine/addlevel.ts 1-6 --par 4 --relist`, castBots 1-40 both settings,
   the whole suite, stills of every beat upright and sideways on Normal and Easy, the clips (first liana, the chain, the snake on your
   vine, the false liana, the gorge, the sealed and open exits; name the frame).

## Done-items (each with its evidence)
### 0(a) FAR: the testers' let-go from the foot (the lead's ruling (b), 3:55 PM ET), 7904cb65
- w1Swing.test.ts :48 keeps its cache intent (the foot's band must reach past the top's, low[1] >= high[1] + 60) and now holds FAR: the
  testers' let-go (forwardEndLands, FORWARD_END 0.75) from the foot lands him on the band's last perch, and one 20 px step further it
  does not, on both settings. :123 finds each section's own liana; the let-go lands him on the built FAR perch, and 60 px further it
  does not (the 60 is the band's 10% share, at most 34 px, plus one lay step).
  Probes: band Normal [40, 380], let-go lands 310-380 and not 390; built perches 359-385 px out, all `Y...`.
- Plants (side worktree): P1 guard off, both tests RED (460 px, 424 px). P2 cache without the grip, RED. P3 FAR laid 80 px short, both
  RED. level.md World 1 notes carry the rule. `git merge-file` against the lead's copy (ccr-ea739a2f-dfcee4) from their merge base
  7f453671: 0 conflicts, and both the FAR note and the lead's rules 21-22 are in the result. (My first try ran on the shallow clone with
  no merge base, so it proved nothing; it was re-run once the clone was unshallowed.)
### 0(b) the start head's reds
- **The old hand-built 1-6 deleted whole** (R-165.238, a helper subagent; its report is `retire-old-16.md`; I reviewed the diff and
  greps before the cherry-pick). Gone: protoStage's 'proto' plan, its default and pieces (kapok, logPuzzle, seesawRoom, seesawTwist,
  canopy, highRun, mixed, dblPractice), w1Sections' '1-6', 8 hint.1-6 lines (grep: no reader), dotTips FIRST_OF 'hint.1-6.log', and
  W1_ROOMS '1-6'. Kept and named: hint.1-6.grabVine and .shiny (live readers), way.1-6, stageClue, pokeyJournal, levelSeeds, stageTable.
- **Retired with it:** stage16.test.ts, roomLogReset's two P-02 1-6 cases, protoStage.test.ts, and dblPractice's three old ledge tests.
  **Moved with the same asserts:** vineFollowUps (7) and vineFlickMirror to the new 1-6's first liana; writtenKeys, dotTips, sectionTrack,
  flowerReach, forgive G8, levelWalls and artDress to live stages. puzzleCamera drops 1-6 (no rooms on seeds 1-8). Each moved test was
  RED on a planted fault (retire-old-16.md).
- **The new 1-6's row** (045b8a93): judgedTable/listed/verdicts move their test-only fixture id off 1-6 (now listed and flown) to 1-7, as
  it moved off 1-3 and 1-4 before; JUDGED holds '1-6': 'normal-1-6'. flownArcs.ts's 1-6 rows now cite chain.md §1 like every other stage
  (verdicts.test.ts:177). The numbers are unchanged, copied into chain.md from flownArcs.ts. 44/44.
- w4RealReach's TODO stays a TODO. vineSelfSwing is not test debt: it is a real fault in the new 1-6 (EXACT NEXT STEP 1).
### 1-2. kid Normal's rescues, frame by frame (castBots is the record; where.ts and FT_FRAMES locate)
| # | Where (seed, beat, frames) | What the frames show | Class | Fix, plant |
|---|---|---|---|---|
| H | kid s1, the chain's first liana, 63.3-67.1 | after a put-back his hops went straight up for 0.2 s (vx 0 to the apex), so he missed the liana twice. The bot's own model said "catch" (hop probe: actualHoldCatches true). The engine's 0.35 s steer pause outlasted his press. In the game the jump flick is a fresh input and ends the pause (inputEngine.ts:335 fresh; touchGestures.ts setDir sends a move only on a change). The harness never counted one. | HARNESS (the measuring tool, any stage) | realPlay.ts FakeInput counts fresh inputs as InputEngine does. src/game/graceFresh.test.ts: 2/3 RED without it; the third holds the pause's own intent, a held thumb still paused |
| B1 | kid s4, the risers' liana, 187-208 | caught at the foot, climbed high ahead of a rising snake (right), then back down to his learned foot; the 7 s let-go then fired at the BACK of the swing, into the pit, round and round to a rescue. forwardEndLands from every hold 0.19-0.95 lands on b2, so the stage is fine | BOT | the 7 s let-go waits until the swing carries him out in front (a still liana 7 s as before; 14 s cap). pitClimb test 7: RED with the old line |
| B2 | kid s6, the gorge's gl1, 246.5-248.4 | the route's point at gl1 was the cut liana's foot (44495, 590), 85 px behind the anchor; swung past it, the steer flipped LEFT. The press went out facing back, the engine gave no leap (vx 145, flat), and he fell short of gb1 | BOT | `pastLiana`: on a liana he steers by the first route point past where the route crosses THAT liana. pitClimb test 8: RED with the plain target |
| B4 | kid s5, the pit under the first liana, 10.8-19.6 | a lip hop that missed (a running kid can't wait at the lip: honest), then in the pit the liana's foot 179 px up read as a ledge within DOUBLE_RISE + 10, so the climb back never started: 7 untimed jumps at the swinging foot, a rescue | BOT | `pitWayBack`: a swinging liana's foot is no ledge; the stair back to the bank, then the lip's timed catch. pitClimb test 10 (the seed's own pit): RED at b89dee5d |
| B5 | child s2, the rest-stumps, 370.4-372.6 | he pressed against a 53 px stump's face for 20 s and never jumped: his thumb lifts now and then (rhythm), and each lift reset his "stopped at a face" count. P13 had made a lift hold the count only on stages with a cast object, and 1-6's snakes are pieces | BOT | the count holds through a lift on every stage (rule 22). pitClimb test 11 (a toy with no cast): RED at 8f429a6a. 1-1 recalibrated: see below |
| B3 | adult s1, the gorge pit, 232.7-240.9 | gb1 crumbled; out of the pit he climbed to the NEAREST stair step that catches gl2 at some moment (961: 14/48 moments) instead of the top step (901: 29/48), and missed 3 times | BOT | `pitWayUp` climbs to the step that catches it most often. pitClimb test 9 (the seed's own pit numbers): RED with the nearest step |
None of these was a timing tweak to fit the stage, and no stage data moved.

**castBots 1-6 seeds 1-6** (`cast-*.out.txt` on e4322053; earlier heads in `at-045b8a93/`, `at-92417f14/`, `at-8f429a6a/`; ENG-16E's start in its own REPORT):
| bot | Normal ENG-16E | Normal now | Easy now |
|---|---|---|---|
| kid | 1/6 | **6/6** | 6/6 |
| adult | 5/6 | **6/6** | 6/6 |
| child | 5/6 | 4/6 (sealed s1 93/95, s2 90/94; no rescue) | 6/6 |
| middle | 5/6 | 5/6 (sealed s1 90/95) | 6/6 |
| expert | 3/6 | 2/6 (sealed s1, s2, s3, s5) | (Normal only) |
The kid Normal goal (at least 5/6) is MET at 6/6. "Every other bot 6/6 both settings" is NOT: child, middle and
expert Normal fail on sealed doors only (EXACT NEXT STEP 3). There are no rescues left, down from 11 in ENG-16E's runs. B5 turned the
child's s2 rescue into a sealed door and showed two more (child s1, expert s2): playing on his own instead of being put past spots, he
misses petals the bots already missed elsewhere.

### The 1-1 calibration (the lead's ruling (1)), twice
- The harness fix (H) moved 1-1's tier replays: tierBots.test.ts test 7 went red (child Normal v1 finished in 429 s, not 435.1). Toggled
  file by file: the harness moves it, the bot fixes B1-B4 do not. Re-run per BOTS.md (`tierBots.ts --calibrate`, all tiers, both
  settings, v1-40, 5 blocks in parallel, assembled in the committed order: `cal/`): every check kept its pass/fail (045b8a93).
- B5 moved them again. Re-run (`cal2/`, committed in e4322053, which replaces the first): all 200 runs end at the shrine; the child
  Normal's rescues across 40 runs drop 13 -> 0; its put-backs per run go 1.93 -> 2.9 and now MATCH the testers' 3.4 (that check fail ->
  pass); finish p50 476.9 -> 420.3 (testers 444, inside 12% both times). **Every other check keeps its pass/fail; the child, middle and
  expert tiers still match the testers, one check better.** tierBots 7/7.

## The gates (LAWS 5; game code changed (the deletion), so everything the box allowed)
- tsc clean on every head. generalitycheck PASS, knowncheck PASS, roadmapcheck PASS (`gates/`; the clone was unshallowed first, since
  it could not run shallow, the helper's F2).
- seedlist --check 1-1..1-5: PASS (257/100/100/100/150; `gates/seedlist-check.out.txt`).
- Engine-tool and bot tests (library, seedlist, yield, travelBots, pitClimb, firsttimer, castBots): 57/57. tierBots 7/7.
- Plants: P1-P3 (FAR), graceFresh, pitClimb 7-11: each RED without its fix (run in a side worktree, never the measured tree).
- **The whole suite on b89dee5d:** SUITE_LINE
- castBots 1-1..1-5, both settings, seeds 1-6 (`w1/` on e4322053): 1-2, 1-3 and 1-5 every combo 6/6; 1-4 child E 2/6, kid E 5/6, middle E
  5/6, middle N 5/6; 1-1 kid and adult 0/6 on both settings. Each of these is identical on the start head 7904cb65 (pass count and failing
  seeds, `w1/at-7904cb65/`): pre-existing (1-1 kid/adult: ENG-16E found them on main too). Two got better with B5: 1-1 child N 5/6 -> 6/6,
  1-2 child N 4/6 -> 6/6. Nothing got worse (`w1/at-b89dee5d/`, `w1/at-8f429a6a/`).
- NOT run in this box: the vite build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck. The deletion removed code and
  one preload entry (W1_ROOMS '1-6'), and drew nothing new. INT-9 runs the full set on the integration head before any link.

## Polish check
- No stills or clips were shot in this box: nothing I changed draws, and the deletion removed only paths the game no longer reached (the
  helper probed the new 1-6 on seeds 1-8: no rooms, no kit decor). The preload change (W1_ROOMS '1-6') is covered by the suite's sheet
  tests. The packet's stills and clips of every beat are EXACT NEXT STEP 4, after the relist; shooting them before it would be redone
  (D40).

## Pushback
- Ruling (2) as first given (fix the overlaps "from the two swings' sweeps") could not be met as measured: the foot-sweep swingClearance
  wants 233 px, and keeping the false liana in front would re-lay the catch. Sent with the numbers; the lead ruled (b).
- The packet listed vineSelfSwing among tests that only need the new 1-6's row: it is a real stage fault (above).

## Suggestions (each a ready packet)
1. **ENGINE: the height-aware swingClearance and its lay rule** (EXACT NEXT STEP 1; the lead's ruling (b)). Files: physics.ts,
   pipeline.ts, vineSelfSwing.test.ts plants. Done: the plants both ways, 1-6 relisted, every stage with vines re-checked.
2. **BOT or STAGE: the sealed doors** (EXACT NEXT STEP 3), traced first.
3. **ENGINE: buildProtoStage throws on a plan HAND_STAGES does not hold** (the helper's F3: four tests had quietly built the old 1-6
   through `HAND_STAGES[id]` undefined). Test first.
4. **P-02's signpost log reset** has no live test now (F5): the kit test room's seesaw push log (kitStage.ts:344) can host it.

## Unresolved (named plainly)
- 1-6 is NOT green: vineSelfSwing and artUse are RED, and the rescues and sealed doors above remain. No relist, no 40-seed bots, no
  stills, no clips in this box.
- Not run: the build and perf gates (above).
- The helper's F4: a running jump at the first liana's lip catches it on seeds 2 and 4 but not 1 and 3, so the moved control tests wait
  on the ledge for a catching jump (`catchWait`). It matches kid s5's first miss: a running hop off that lip misses on some rolls (honest for a kid who can't wait at the lip); the pit after it was the bot's fault and is fixed (B4).

## My misses (each with what changes)
1. 045b8a93 mixed the 1-1 calibration (tools) with the new-1-6 row edits. The lead's ruling to keep tools-only commits separate sat in
   my queue 4 minutes before that commit; I read the queue at pushes, not before each commit. I told INT-9b the exact paths to take.
   Countermeasure: read the queue before every commit, not just every push. Commits that can be cherry-picked never carry stage data.
2. My first commit carried the lead's session id; caught and amended before any push (session_01FhBbYNHM3zg2cqxN8NoKn4 is mine).
3. The times in my messages to the lead (4:28, 4:46 PM) and to INT-9b (4:39 PM) were typed by hand, not pasted from `date` (D30): the
   4:46 one ran ahead of the clock (date read 4:37-4:43 around it). Countermeasure: every message's time comes from a `date` run in the
   same step, as the REPORT's times do.
4. where.ts's 360 s cap made the child read "time" on every seed. I spent one run chasing it before checking castBots' cap (1200);
   no change was made on it. Countermeasure in the turnover note: castBots decides pass/fail.

## Method update (the lead decides)
- stage-fix.md / level.md: **before blaming the stage for a bot's miss, run the bot's own prediction against the engine's frames.**
  hopCatches said "catch" while the frames showed a straight-up hop; the gap was the harness, not the stage.
- gates.md: **a harness that stands in for the game's input must count what the game counts** (fresh inputs, presses, buffers). Planted
  tests drive the engine through the harness, so a harness gap is a measuring-tool fault in every bot and every real-engine test (D15, D19).

## Learned (proposed rule changes)
1. NEW (level.md): a decoration vine (a still snake, a cut liana) is laid clear of a swinging liana's sweep at every depth Pokey can hang.
   Check: vineSelfSwing with the height-aware measure.
2. Keep ENG-16E's "trace by frame first": all four faults here were found from frames; two looked like stage faults first.

## Method used / Lessons applied
reference/methods/level.md (rules 21-22), stage-fix.md, gates.md. LAWS 3 (every claim from a run or a file:line), 5 (every gate named,
and the ones not run listed), 18, 22 (no data workaround: the overlaps went back to the lead as a rule question). LESSONS D15 and D19
(the harness tested against the game), D21 (spread: every stage's harness, every liana), D29 (1-1's pins and lists re-run after a
harness change), D30 (times from `date`), D36 (status before commit, ls-remote after push), D40 (no relist before the lay rule), D43
(generalitycheck PASS), D55 (the context line stated), D57 (the queue read at every push; miss 1 above).

## Turnover note
reference/handoffs/engine-core.md §0za (this REPORT's commit).
