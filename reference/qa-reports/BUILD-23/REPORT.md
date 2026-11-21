# BUILD-23e REPORT: 2-3 GREEN (t-build-23 from 777b55d4b; this section written 12:26 PM ET by `date`)

**Final hash: see the last commit on t-build-23 (this REPORT's own commit); code unchanged since e9b1b5778.**

## EXACT NEXT STEP (for the integrator)
Merge t-build-23 (2-3 GREEN). Nothing open on 2-3 from this packet. Named, not fixed (rule 4 / ruled): kid 0/40 both (spook loops,
rescued); adult N s10 (accepted 10:17); 2-3's meter far under World 2's band (accepted 10:17); funcheck = main's World 1 debt.

## Done (each pushed on t-build-23)
| Commit | What |
|---|---|
| 5ba9ef44d | ENGINE PIECE (bot: no line, no wait): LINE_SKILL.noLineGo in lineMove; planted toy in lineBot.test (clump 60 px before the stretch, cages shut): GREEN middle+adult s1-3 'sealed door'; off -> the middle stands at x 860-900 until 'time' (the adult's late thumb slides him onto the stretch, where the calm runs) |
| e9b1b5778 | ENGINE PIECE b: narrowed to 'nobody out of home'. The first cut (follow|join) also sent him on when his WHOLE line was spooked and running back: castBots moved 10 non-kid runs' times + every kid run. Narrowed: those runs give BUILD-23d's exact rows. cageBot 4/4 (skill off = 'sealed door' at cap 600), lineBot 10/10, tierBots 9/9 CI=1 with no calibration change |
| a7e6f4093 | UI-22 (the lead ACCEPTED 10:36): root BUILD-23 81dd325de took the keeper's line 8 (no count: the goal counts who gets HOME) but stagePlanGoals still pinned 'Free 5 little ones' + a floor of 6. Now floor 5, 2-3 == MISSION_23 with no digit, every named count checked on Easy too. Planted 'Free 3 little ones' -> RED |
| f9bafa012 | castBots 2-3 1-40 x 5 bots x both on e9b1b5778 (castbots23e.txt + rows) |
| ebd221955 | THE FULL SET logs (gates23e/) + final stills and clip (stills/23e/, CAPTIONS.md) + the still tools (final23e, parade23e, look17e, clip23e; stills23/faces23/post23c now set Easy by localStorage) |

## castBots 2-3 1-40 on e9b1b5778 (the fixed bot): ALL 360 ROWS IDENTICAL to castbots23d-rows
| bot | Normal | Easy |
|---|---|---|
| child | 40/40 (median 404.8 s) | 40/40 (291.8 s) |
| middle | 40/40 (237.3 s) | 40/40 (223.4 s) |
| expert | 40/40 (230.2 s) | - |
| adult | 39/40 (s10, accepted) | 40/40 |
| kid | 0/40 (rescued, named) | 0/40 (named) |

## THE FULL SET (gates23e/, verdicts.txt; head 9191d988b, code = e9b1b5778; started 10:41 AM ET)
| Gate | Verdict |
|---|---|
| tsc; artcheck; vite build (BASE_PATH) + chunkcheck; knowncheck; generalitycheck; coveragecheck; roadmapcheck; timecheck (unshallowed); registrycheck; tipwalk --layouts 4 | PASS each |
| tierBots (CI=1) 9/9; the CI tool line (gates.yml:157) 346/0 | PASS |
| paintcheck 0/3, 1/3, 2/3 | PASS each |
| every seed list, today's 4 shards (1-1 161, 1-5 150, the other 12 at 100, 2-3 100/100) | PASS (my first 3-shard try VOID: today is 4) |
| unit suite, 3 shards: 4014 tests, 4011 pass, 0 fail, 3 TODO (4-3/4-8 boulder wall x2, R-165.312 flag placer; none 2-3) | PASS |
| clipcheck; kbdcheck; drawcheck; buildcheck ALONE (p95 109 ms of 150) | PASS each |
| lockall --layouts 16 vs main 107870f5d --intended 2-3,2-5 | PASS (the lead's ruling 11:48 AM: 2-5 inherited from t-int-15; lockall --stages 2-5 vs origin/t-int-15: 32/32 unchanged) |
| funcheck | FAIL = main's line for line (22 World 1 breaches, 77 known; the ruled debt). 2-3 flags: none (funcheck reads World 1 only) |

## Stills + clip (stills/23e/; CAPTIONS.md names the setting the page BUILT for each)
Normal and Easy, upright and sideways: the whole stage at 8 points; the first cage shut and open; the line behind him; the heron's look over
the reeds; a spooked one out on the mud and its fetch; the HUD faces (open, hiding, spooked); the mooring post (foot, on the rope; Easy too);
the parade swim; the jetty home ("Touch the door!", every face lit). 1-7's eagle look beside 2-3's heron look. The clip: beat 4 under the
heron, two looks, nobody spooked.

## Polish check
- Fixed before handing over: Dot's cards stayed up in my first stills (a tap in a card's first 400 ms of GAME time does nothing, and the
  shots step paused): the tool steps half a second, then taps. stills23's '4-parade' took a 131 px gap and splashed: replaced by the
  parade-swim still on the pond. Pokey drawn half-transparent (the tool's invincible flicker) and floating over the water: fixed. The
  video recorder drew the game into 60% of the frame: the clip is now stepped frames.
- Named: upright, the spooked one 330 px back is off the 412 px screen (the HUD's grey face with its amber '!' carries it); sideways it
  reads small at the left edge. The look languages differ: 1-7's eagle is a ground shadow, 2-3's heron a dotted sight line and a pale
  wash (the lead's call whether that is the family look).

## Learned (for the next builder) + proposed level.md rules
- A bot fix is judged by castBots row for row against the last table, not by pass counts: my first cut passed every count and still
  moved 10 runs; the diff showed it did more than the ruling. PROPOSED: "A bot change ships with a row-for-row castBots diff against the
  last committed rows; any moved row is traced or the change is narrowed."
- Easy is a saved setting (localStorage sloth_difficulty), not a URL switch: a still tool must set it and the caption must say what the
  page BUILT (its geometry), not what was asked. PROPOSED: "Every Easy still names the page's built setting by a fact on the page."
- Read the shard count from registrycheck --shards --print; never assume 3.
- Dot's cards need game time to take a tap; paused shots must step before tapping.

## Lessons applied
D30 (one slip: my 12:04 message stamp was typed, not from date; caught by the lead; every stamp here and in commits from date), D57/D87
+ D103/D105 (ReadNotifications at every step boundary and push; gates in the background so rulings reached me), D76 (handing over at the
lead's 320k line), D86/D96 (THE FULL SET named, every line run), D94 (UI-22 traced to its source commit; 2-5 checked against t-int-15,
its base), D102 (reads by grep and line ranges).

---

# BUILD-23d REPORT: 2-3 toward GREEN (t-build-23 from b173bd298; this section written 10:21 AM ET 11-21 by `date`)

## EXACT NEXT STEP (for BUILD-23e), in order. Head: the last BUILD-23d commit on t-build-23.
1. **ENGINE PIECE (bot: no line, no wait)** (the lead's ruling 9:57 + 10:09 AM ET, rule-26 amendment; its OWN commit with that name):
   tools/inspect/firsttimer.ts lineMove (~:2216-2245): with an empty line (inLine empty) he does not wait for a look: return null before
   the wait. Cause (traced, tools/engine/runs/_plant23.ts 300): cageBot 'bank cage, skill off' (middle, seed 1, no line) stops in beat 7's
   first clump at x 20300, before the stretch's x0 (clipWatches puts x0 40 px in); the heron's calm runs only with him or a follower ON
   its stretch (followPlay.ts:151 active, watcher.ts:108), so the look he waits for never comes: 'time' at 900 s, not 'sealed door'.
   PLANT a toy (lineBot.test or cageBot.test): he stops in a clump's first 40 px before x0 with an empty line: RED times out, GREEN walks
   on. Then tierBots 9/9 with NO calibration change (CI=1 npx tsx --test tools/inspect/tierBots.test.ts), cageBot.test 'skill off' back to
   'sealed door' at its own cap 600, the CI tool line (gates.yml:157) green.
2. **castBots 2-3 1-40 x 5 bots x both on the fixed bot** (the lead: the table must be on the fixed bot): compare with castbots23d.txt
   (below); any moved run traced (rule 28).
3. **stagePlanGoals UI-22** ("a stage's map line names a count only where it is the engine's goal on every layout roll"): RED on
   t-build-23, PASS on origin/t-int-15 0eefc707e (checked 10:20 AM ET): born in BUILD-23/23b/23c, 2-3's (ENG-CAGE: 5 stages name a count,
   it needs 6): fix at the source (D94).
4. **THE FULL SET on that head** (gates.md, D96): every gates.yml run line + the suite in 3 shards + funcheck (name 2-3's flags) + lockall
   --layouts 16 vs main --intended 2-3 (any other stage moving: stop, tell the lead) + castBots + coveragecheck + registrycheck + tipwalk
   + paintcheck 0/3 1/3 2/3 + timecheck (`git fetch --unshallow` first). My partial runs below were on 981e214d7's code, BEFORE the fix:
   they do not count for the head.
5. **Final stills + clip once GREEN** (packet step 7, rule 29): the whole stage both ways, Normal + Easy, incl. the post on Easy and a
   1-7 watched-stretch side-by-side with the heron look (walk him into 1-7's, the eagle stays at 'rest' when forced); one clip of the line
   crossing under the heron. NOT SHOT by me (the bots were not final).

## Done (each pushed on t-build-23)
| Commit | What |
|---|---|
| c53fda1e3 | step 0: merged t-eng-cage @ 1fb53d026 (conflict engine-core.md: both entries kept) |
| b4e375d1f | step 1 R-165.365: registrycheck realSheetMisses reads the FINISHED roll (PLAY_FINISH = listed.ts playFinish, as listJudge); planted test (the unfinished read asks foe:eagle). No stageSheets eagle entry |
| e0af13f2e | step 2 R-165.363: lineFaults childCross (flown with FollowPlay: LINE_RULE.child 40 px/s, 3 s at a face, rise 12; tail = gap x the little ones led, a cage on the stretch joins as reached; waits at a clump end for a look to come and go, freezes when the line is hidden; over water his hop, maxRun/1.3) + no face on watched mud. Planted RED on the old lays (check off -> 2 red). LAY (the lead ACCEPTED 9:57): boulders off the watched mud; beat 4 G 400/350 -> 200/180 (CLUMPS_G_23); beat 7 calm 5-5.5 -> 8.5-9 s both settings (CALM_TWO_23), lag 3.2 kept, G 350 -> 180/160 (EVERY_G_23); the width moved to the bank after each stretch. lineBot: hop-back toy sets the 117 px moss_stone in-test (accepted); fetch-clock toy on beat 7 |
| 9ef1612ff | step 3: score.ts cageChallenges + CAGE_BITS {punch 0.5 = OTHER_BITS.puzzle, vine = climb + punch 0.75} (cageVine: the engine's airKick reach); meter-coverage beat:cages.channel; cageChannel.test on gates.yml:157; coveragecheck PASS |
| edbfcecbe | step 4: FLIGHT_STAGE=2-3 flight.ts normal all (fly-2-3.txt; easy too, fly-2-3-easy.txt); flownArcs normal-2-3 (8 rows); chain.md §1; stageTable judged; judgedTable.test |
| 981e214d7 | step 4: seedlist 2-3: 6 fresh builds 6/6 first, then 100 of 100 kept, --check PASS; registrycheck PASS (14 stages); stageSheets/sheetWarm/registrycheck tests 23/23 |
| b09c213db | timecheck: ENG-CAGE-b REPORT's stamp 10:00 PM was 4.5 min after its commit: corrected to 9:55 PM |
| ba3f88a03, 42bf7e832 | trace tools (tools/engine/runs/_*23*.ts, not gates); castbots23d.txt + rows, meter23d.txt |

## castBots 2-3 1-40 on 981e214d7 (BEFORE the bot fix; castbots23d.txt) — every run shrine, goal 5/5
| bot | Normal | Easy |
|---|---|---|
| child | 40/40 (ENG-CAGE head: 1/40) | 40/40 |
| middle | 40/40 | 40/40 |
| expert | 40/40 | - |
| adult | 39/40 | 40/40 |
| kid | 0/40 | 0/40 |
Traces (rule 28; _trace23.ts): adult N s10: beat 7, leaves as heron A's look ends, B looks 0.6 s later: 8 spooks t166-259, rescued x20666
t262.8 (accepted by the lead 10:17). Kid N s5/s9, E s5/s9: spook loops at beat 4 (x11100-12000, t104-134), the pond (x16800-17900,
t177-280) and beat 7 (x20400-21500, t258-377), each rescued after 20 s no progress (rule 4: not the bar; named).

## Meter (game order 1-1..2-3, seeds 1-4; meter23d.txt)
2-3 N 3.0 (2.8-3.4), E 0.9; the old lay on the merge base: N 3.2, E 0.7. World 2 band 9..21, slot target 14.5: far under before and after
(the lead 10:17: named, not tuned). Easy/Normal 0.30 (<= 0.6). Since the judged rows the meter's route doubles over the pond (269 px)
instead of boarding the sinking pad (the lead: a fair skill reward, kept).

## Gates (partial, on 981e214d7's code, BEFORE the bot fix: they do not count for the final head)
tsc PASS; artcheck PASS; vite build (BASE_PATH) PASS; chunkcheck PASS; knowncheck PASS; generalitycheck PASS; coveragecheck PASS;
roadmapcheck PASS (unshallowed); timecheck PASS after b09c213db; registrycheck PASS; 2-3 test files 106/107 (red: cageBot skill-off plant =
NEXT STEP 1); stagePlanGoals UI-22 RED (NEXT STEP 3). UNRUN to completion by me: the suite shards, every seed list, tipwalk, drawcheck,
clipcheck, kbdcheck, buildcheck, paintcheck, tierBots, the CI tool line, lockall vs main, funcheck.

## Polish check
No stills or clips taken: the bots are not final (rule 29). Rough spots named: beat 7 is now three clumps with 180 px gaps and a long calm
(a quieter climax than the design's 350 px; the lead accepted); 2-3's meter reads far under World 2's band.

## Learned (for the next builder) + proposed level.md rules
- Fly a design's crossing at the CALIBRATED CHILD's pace with the line's tail before laying it: the design's 350-500 px of open mud were
  flown at the adult's run; the child needs about (calm + screech) x 40 px/s minus the tail. PROPOSED rule: "Every timed crossing is flown at
  the calibrated child's pace (lineFaults childCross for a line) as well as the adult's; check: the kit's fault function, planted."
- Two independent herons out of step leave a window no gap can fix at a child's pace (3.8 s): the lever is the rhythm (the calm), not the
  gap. Find the lever by a toy sweep (_toy23.ts) before editing the lay.
- A bot that waits for a world clock must know when that clock does not run (out of its stretch): a wait with nothing to protect deadlocks.
- Read the lead's rulings as they come: mine arrived while I worked through long tool calls (D103); check notifications between steps.

## Lessons applied
D30 (two times I typed from memory were caught and corrected to the lead the same minute; every stamp here from date), D76 (handing over
before 350k with the next step on top), D94 (UI-22 checked on origin/t-int-15, not on my own commits), D96 (the full set named, the partial
runs marked as not counting), D101 (the lay judged on the built stage), D102 (reads by grep and line ranges), D103 (rulings read and acted on).

---

# BUILD-23c REPORT: 2-3 items (a)-(d) (t-build-23 from 6db2da0fd; this section written 9:59 PM ET by `date`)

## EXACT NEXT STEP (for BUILD-23d), in order
1. **Read the lead's newest rulings first** (they arrive with priority 'next', D103). Head: the last BUILD-23c commit on t-build-23.
2. **Child Normal 0/10 (every run rescued, goal 5/5, shrine reached)**: castBots 2-3 1-10 on 2c9a0197d (rows:
   reference/qa-reports/BUILD-23/castbots23c-rows.jsonl). ENG-CAGE-b's trace names the boulder spot (cause B): if it is data, fix it in
   w2Arc23.ts (a rock's place); a bot cause is ENG-CAGE-b's (firsttimer.ts), routed by the lead.
3. **registrycheck FAIL on 2-3 (3 left)**: (i) no proven seed list: relist (`npx tsx tools/engine/seedlist.ts 2-3`) once (ii) is done;
   (ii) its row not `judged`: fly it (`FLIGHT_STAGE=2-3 npx tsx reference/specs/sims/flight.ts normal all`, then easy); (iii) 'sheets:
   foe:eagle (seeds 1-3 both)': NOT a missing sheet. registrycheck.ts:86 builds the roll with libstage.buildStage, which returns the
   roll BEFORE its finish (playFinish runs only on a clone inside listJudge, listRules.ts:80), so finish23 never sets proto.follow and
   sheetWarm.ts stageAnims (:57) counts 2-3's watch zones as an eagle. Root fix (a gate change: the lead routes it, never a stageSheets
   eagle entry to make it pass, law 22): the sheet check reads the FINISHED roll (`playFinish(listedStage(id)!, structuredClone(st), d)`),
   as Play draws it. Both CI tool-line reds (registrycheck.test.ts 'the shipped table passes the gate' and 'planted on the real builds')
   are these 2-3 entries.
4. tierBots RED (2 of 200 1-1 runs moved: ENG-CAGE's set-down-loop fix, Gates below): the recalibration lands before the full set.
   castBots 2-3 1-40 x 5 bots x both, the meter 2-3 N + E (DIFFICULTY.md), THE FULL SET on the exact head (D96), lockall --layouts 16
   --intended 2-3 vs main, the full clipcheck, drawcheck WITH 2-3 now in limits.json (see Gates).
5. Final stills on the GREEN head (rule 29): Easy post stills (my Easy shot caught the title card on a loaded machine: the mooring beat has
   ONE lay for both settings, so the geometry is the same, but no Easy still exists); a 1-7 eagle-shadow still beside the new heron look
   (the lead: BUILD-23d's stills; 1-7's eagle stays at 'rest' when he is forced in place: walk him in instead).
6. Named for the lead, not 2-3's: the HUD vine strip (VineHud.tsx:393, below).

## Done (each pushed on t-build-23)
| Commit | What | Evidence |
|---|---|---|
| ac4d299d8 | (a) merge t-eng-cage @ b34352b58 (its newest pushed head) | tsc clean |
| ecf09ba77 | (b) cage 4 SITS on the post's painted shelf: POST_H 230 -> 150; the cage's dn and x computed from the sheet's alpha (shelf top 0.43 of the picture at the cage's place, trunk's right edge 75/215): SHELF_DX 45 px right of the rope, its foot on the shelf. Bots: firsttimer.ts `vineReaches` (the engine's airKick box from fight.ts MOVES, 8 px inside) replaces the 30/40 px window (lead 9:40 PM: stays) | stills b23c-normal-post-{foot,rope}-{upright,sideways}.jpg + BEFORE-sideways (the cage behind the plank); sideways at his foot the cage's top is ~13 css px under the plank's slider. cageBot.test 4/4; planted: the old 30 px window -> the post test RED. w2Arc23.test 6/6 (the shelf assert). ACCEPTED by the lead 9:40 PM |
| 91e5a31fa | (c) the heron look: gaze 5 px dash at 0.95 over an 8 px dark warm edge at 0.5; wash core 0.57 + 2 px warm rim, wide 0.38 (was 0.275 each, gaze 3 px at 0.45) | stills b23c-normal-look-{A-reeds-shaded,B-open-sunlit}-{before,after}-{upright,sideways}.jpg + two side-by-side crops; shot by state (lookX within 30 px of the place). followArt.test 5/5. ACCEPTED by the lead 9:45 PM |
| a3af5a5b7 | (d) the upright vine strip is a HUD defect: 2-5 at 0eefc707e has it too; 1-1 (trail counter) does not | still b23c-hud-vine-strip-upright-2-5-base-0eefc707e-vs-2-5-mine-vs-1-1.jpg; source VineHud.tsx:393 (painted counter on the LOWER row: a straight PaintedVine 2..cw-2, no curl or leaf; the unpainted branch at :397 curls) |
| 2c9a0197d | '2-3' in tools/perf/limits.json scenarios (registrycheck: 'drawcheck never plays it') | registrycheck's drawcheck line gone |
| f8397e13c | castBots 2-3 1-10 child/middle/expert both settings | rows file; table below |

## castBots 2-3 seeds 1-10 (2c9a0197d; every one of 50 runs reached the shrine with the goal 5/5: the shelf cage freed in all)
| bot | Normal | Easy |
|---|---|---|
| child | 0/10 (all rescued: 1-5 rescues a run) | 9/10 |
| middle | 10/10 | 10/10 |
| expert | 9/10 (seed 2: one rescue) | - |
In line with ENG-CAGE's 1-40 at fix4 (child N 0/40, child E 37/40, middle 36/40 + 40/40, expert 35/40): no loss from the post move.

## Gates (on my head; THE FULL SET is BUILD-23d's)
| Gate | Head | Verdict |
|---|---|---|
| tsc --noEmit | ecf09ba77, 91e5a31fa | PASS |
| gen2 unit tests (src/game/gen2/*.test.ts + worlds/*.test.ts) | 91e5a31fa tree | PASS 944/944 (R-165.312 a marked TODO) |
| w2Arc23.test, followArt.test, cageBot.test (+ its plant) | ecf09ba77 / 91e5a31fa | PASS 6/6, 5/5, 4/4 (plant RED as it must be) |
| CI tool line (gates.yml:157, CI=1 FORCE_COLOR=1) | a3af5a5b7 tree | **FAIL 336 pass / 2 fail**: both registrycheck.test.ts, 2-3's 'sheets: foe:eagle' (the unfinished roll: NEXT STEP 3 iii) |
| registrycheck | 2c9a0197d | **FAIL** on 2-3: seeds, flown, sheets (drawcheck line fixed in 2c9a0197d) |
| drawcheck (the 19 listed) | 91e5a31fa tree | PASS (901 s) |
| drawcheck 2-3 alone (list edited for the run, restored) | 2c9a0197d | PASS (49 s), BUT followArt.ts is not among its call sites: its 4 fixed spots never catch a heron look, so the look's 3 added strokes (gaze edge, rim) are UNMEASURED by the gate. They add no gradient, shadow or readback (the gate's hard limits); a spot on a look is a drawcheck harness change (the Critic's) |
| castBots 2-3 1-10 child/middle/expert both | 2c9a0197d | table above |
| tierBots.test.ts (1-1 calibration) | bcfcb4c2a AND ac4d299d8 (the merge, before any BUILD-23c change) | **FAIL 8/9 on both**: '2 of 200 runs moved' (child Normal variants 1 and 12: putbacks 9->8, 10->9). Same on the merge head, so born of ENG-CAGE's SET-DOWN LOOP fix (46bb80a30, its REPORT step 2 predicted it), not of vineReaches. Re-run the calibration and recommit calibration-main.jsonl (BOTS.md): ENG-CAGE-b's, the lead routes |
| generalitycheck | bcfcb4c2a | PASS (26 literals, 26 known) |
| knowncheck | bcfcb4c2a | PASS |
| roadmapcheck | bcfcb4c2a | UNRUN: this container's clone is shallow ('proofs cannot be checked (fetch-depth 0)') |
| The rest of THE FULL SET (the CLAUDE.md unit list in full, the shipping build, chunkcheck, artcheck, clipcheck, knowncheck, generalitycheck, roadmapcheck, kbdcheck, buildcheck, seedlist 1-1, tierBots, coveragecheck, tipwalk, lockall) | - | UNRUN (BUILD-23d) |

## Polish check
- Post, sideways at his foot: the cage stands on the shelf against the trunk, its bars clear of the plank; the shelf's free end right of
  the cage (~22 css px) does not read as a step. Upright: lots of room. On the rope: his paw at the cage, both in view. PASS.
- Heron look, before: the gaze nearly invisible on the pink sky, the wash a smear. After: the gaze reads beak to spot, the wash ring marks
  the place, on the reeds and the open mud, both ways. PASS. The ring's warm rim reads a little like a drawn plate up close; at phone size it
  reads as a spot of light (judged, kept).
- Named, not checked: Easy post stills; a 1-7 side-by-side.

## Learned (for the next builder)
- Measure a painted piece's standing place on the sheet's alpha (a column scan) and derive the socket from it in code: the cage sat right
  on the first try, and a future POST_H change keeps it there.
- A bot's reach rule copied as a pixel window drifts from the engine; read it from the engine's own move box (fight.ts MOVES).
- A gate red on your stage can be the gate reading the wrong stage (the unfinished roll): check what the gate builds before adding data
  to make it pass.

## Lessons applied
D30 (every time from `date`), D76 (stopped clean before 10:45 with the next step on top), D101 (the post's geometry checked on the real
page before calling it done), D102 (lean reads: grep and line ranges only), D103 (the lead's rulings read and answered as they came).

---

# BUILD-23b REPORT: 2-3 continued (t-build-23 from b51e4f0df; this section written 9:25 PM ET by `date`)

## EXACT NEXT STEP (for BUILD-23c), in the lead's order (9:21 PM ET message)
(a) **Merge t-eng-cage @ 1f276d32e** (or ENG-CAGE-b's later GREEN hash) into t-build-23: NOT merged by BUILD-23b. It touches
    firsttimer.ts and the bot tests, not 2-3's files.
(b) **The lead's 9:00 PM rulings:** (1) NO reed-isle picture on 2-3: nothing lays it (layW2New23 lays only the post); w2-new#reed-isle-a
    is kept for a stage with water on both sides. (2) The cage SITS on the post's painted shelf (move cage4's socket height/x in
    w2Arc23.ts `mooring` so the cage rests on the shelf drawn by layW2New23: shelf top is about 0.42 of the post picture down from its
    top, on the trunk's right). If the shelf is still wider than the cage with standable-looking room, name it with a crop still (art
    fix: tomorrow's art member). (3) Post + cage LOWER (POST_H 230 and the cage's dn) until the cage is fully clear below the goal plank
    with him at the post's foot, upright AND sideways, keeping a real climb (ENG-CAGE: punches land 0-80 px below the cage from the
    vine). Stills both ways (reference/qa-reports/BUILD-23/w2new23.mjs shoots the post).
(c) **The heron look's strength** (the lead's 8:45 PM send-back, a number the lead ruled): the dashed gaze is thin and the wash nearly
    invisible on a sunlit bank. Raise followArt.ts LOOK (alpha / gaze weight) until it reads at phone size on a sunlit and a shaded bank,
    matching 1-7's watched stretch's strength (its own heron colour). One small commit, before/after stills both ways (stills23.mjs 3/3a).
    Also the lead's 8:45 item 2 (NOT checked by BUILD-23b): upright, a straight vine strip runs above the goal plank (x ~225-600 px) and
    stops square (stills/b23-L1-normal-3-heron-look-upright.jpg, top). Check 2-5 at 0eefc707e upright: there too means a HUD defect (name
    it with a still for the lead); only on 2-3 means yours.
(d) **Child Normal stops at a boulder's face on the watched mud** and the line is caught (ENG-CAGE's castBots): ENG-CAGE-b names the spot;
    if it is data, fix it in w2Arc23.ts.
Then relist (seedlist.ts; 2-3's row has no `judged` yet), castBots 1-40 both settings, the meter, THE FULL SET on the exact head (D96:
CLAUDE.md's list AND every CI gate incl. coveragecheck, registrycheck, tipwalk; full clipcheck; lockall --layouts 16 --intended 2-3
--check lock-main.json vs main, UNRUN tonight), then the final stills on the GREEN head (rule 29), the HUD faces with a REAL spook.
Full suite at 3d714c920 (started 9:12 PM on 1974d9294's tree): see 'Suite' below.

## Done (each pushed on t-build-23)
| Commit | What | Evidence |
|---|---|---|
| ad2d9e15a | **ENGINE PIECE (designed cage socket)**: the planted test for 3f958e630 (the branch itself is BUILD-23's, kept unrewritten) | src/game/gen2/designedCage.test.ts: a rolled 2-3, seeds 1-2 both settings: 5 designed cages each with its little one, goal Normal 5 / Easy 3, a burst one joins the line. Branch off: 'expected 5, actual 0' RED; on GREEN. generalitycheck PASS. No STOPGAP. lockall UNRUN (step 3) |
| cd44b43fa | **ENGINE PIECE (heron look)**: the cause, found on the page: pose and art were right (w2HeronLook drawn, riverArtReady true); drawHerons culled the whole look while its wash (70 px sight) was off view, and the sweep starts 160 px past its stretch. BUILD-23's still was shot 8 frames in (lookX 5464, view 5620-6820). followArt.ts lookInView: wash OR heron in view | followArt.test.ts planted (old rule RED, new GREEN); stills/b23-L1-normal-3-heron-look-*.jpg (mid-sweep, wash over his bed) and 3a-heron-look-start-*.jpg (the gaze off the left edge), both ways |
| 14839fa18 | **w2-new wired** (ruling 8:05 PM): w2NewArt.ts; W2Decor.nw + one branch in drawW2Decor; 2-3's STAGE_DRAWS 'w2-new'; stagePreload. The mooring post stands over beat 5's rope as its look (vine.rope true: no kapok trunk doubled). **sheetWarm**: no eagle on a follow stage, no props2 for reed clumps (stageSheets.test.ts was RED on t-build-23 @ b51e4f0df from BUILD-23's own 2-3, not inherited: D94) | w2Arc23.test.ts test 6 (planted x3); on the page 1 drawImage from w2-new on the post's frame, both ways (w2new23.mjs); stills/b23-L1-normal-w2new-mooring-post-*.jpg; stageSheets.test 8/8 |
| 9bb9e851a + cc9288f9b | **Planted faults** (rule 12): reference/qa-reports/BUILD-23/planted-faults.py, 16 plants: all six w2Arc23 tests, the three engine pieces, sheetWarm x2, the find, the HUD face | planted-faults.txt (14/14 CAUGHT at 9bb9e851a; the 2 added at cc9288f9b each CAUGHT by hand) |
| 1974d9294 | **The HUD faces** (BUILD-23.md item 2): followFaces.ts (pure, the heron's own rule: in cover and still is hidden), engine.ts lineFaces(), App -> GameHUD -> VineHud prop (polled 150 ms, redrawn only on change), LineFace.tsx (cut from w2-props' Happy paintings; the sheet's size read, not assumed: it is 2592 tall now, the mock assumed 2166) | followFaces.test.ts planted; stills/b23-L1-normal-hud-faces-{open,hiding,spooked}-*.jpg and -plank-crops.jpg: dim / lit green / grey with amber ring and '!', both ways; clipcheck step '2-3 HUD faces' seen both ways, no breaches |
| cc9288f9b | 2-3's find off the rest's boulder: finds.test.ts and flowerReach.test.ts were RED on b51e4f0df (find #15 at (7020, 627) inside platform 26: the rest brick's findSpot sat on its own boulder) | finds + flowerReach + w2Arc23 + designedCage 17/17; planted |
| (this commit) | REPORT, engine-core.md 0zq-23b | |

## Suite (NOT complete: name it as unrun)
CLAUDE.md's unit list started 9:12 PM ET on 1974d9294's tree; at 9:25 PM ET it had 1981 results and was still running when I stopped (D76
hand-over). Its only reds so far: finds.test.ts x2 and flowerReach.test.ts (2-3's find inside a boulder: red on b51e4f0df too, fixed in
cc9288f9b, those files 17/17 with w2Arc23 + designedCage). planted-faults.py and w2Arc23 edits ran WHILE it ran, so a red it reports
later must be re-run on the head before it is trusted. Not run tonight: the shipping build, chunkcheck (the HUD chunk now imports
followFaces.ts -> follow.ts), the perf gates, the full clipcheck, lockall. BUILD-23c runs THE FULL SET.

## Polish check (each still looked at, as Matt will on a phone)
- 3-heron-look (both): head-up heron, dashed gaze down to the reed bed, the three little ones' heads in the reeds: reads. **Named:** the
  ground wash is faint (cream at alpha 0.55/2 on a sunlit bank, mostly behind the reeds); the gaze carries it. Colour: a Designer number.
- 3a-heron-look-start (both): the gaze runs off the left edge toward where it looks: reads (before the fix: no gaze at all).
- w2new-mooring-post (both): one post, cage 4 on its top, Pokey to scale beside it; upright reads well. **Named:** the plank shelf reads
  as a ledge (step 1b); sideways the cage is under the HUD plank (step 1c, rule 8).
- w2new-reed-isle-a-REJECTED: the isle mound sunk in dry soil: rejected, not laid (step 1a).
- hud-faces open / hiding / spooked (both): match ENG-23's mock. First try: the '!' was grey (the face's grayscale greyed it): moved the
  tone to an inner layer. Second: blank discs (.vh-slot's silhouette rule): filter none inline. Final crops: plank-crops.jpg.
- World 2's neon stems and teal sprouts (ENV[2]) are on screen in these stills: R-165.362's member, not mine (named, not fixed).
- Every still is a LOOK CHECK on a RED-bot head (rule 29): the final shoot waits for GREEN.

## Pushback
- Two touches outside a builder's walls, named: riverArt.ts's W2Decor type gained one optional field (`nw`) for the ruled "one painter",
  and tools/perf/clipcheck.mjs (the Critic's gate) gained the '2-3 HUD faces' step the packet asked for. Both small; the Architect and
  the Critic may want to review.
- The isle as designed (the pond's far end) cannot carry an isle picture made to stand in water: the design and the art disagree.

## Suggestions
- level.md rule 11 could say: a painted piece made to stand in water is laid only where water surrounds it; a still with the piece in
  place is the check (the isle cost one round here).

## Unresolved
- The shelf and the cage under the HUD (ruled 9:00 PM: step b); the isle ruled NOT laid (kept for a stage with water on both sides). The bots RED (ENG-CAGE). Full set, lockall and full clipcheck UNRUN tonight.
- Faint heron wash (Designer's colour). Dot's `spooked` line on the first spook and the locked-gate line by state (BUILD-23's ENGINE-WORTHY 4) still open.
- The art inventory still says w2-new#mooring-post 'ready (not in the build: no code loads the sheet)': Content's file, now stale.

## Method update (level.md)
- Shoot a watcher's look at the middle of its sweep, by state (lookX over the cover), never N frames after the phase flips.
- A designed objective is proven on a ROLLED row with its plant (designedCage.test.ts is the model).

## Learned (for the next builder)
- A still that "shows nothing" can be a timing artifact: read the state at the frame (lookX vs the view) before blaming the art.
- A full-suite red on your own stage is yours even when it predates you on the branch: check it on the branch's pre-you head (D94).

## Lessons applied
D30 (every time from `date`), D94 (stageSheets and finds reds checked on b51e4f0df, worded as BUILD-23's, not inherited), D96 (the full
CI list named as UNRUN, not "the gates"), D101 (the isle and shelf reported, not coded around), D102 (lean reads: grep and line ranges).
Turnover note: reference/handoffs/engine-core.md 0zq-23b (this commit).

---

# BUILD-23 REPORT: 2-3 "Stuck in the Reeds: Walk Them Home" (handover at the lead's STOP, 8:31 PM ET 11-20, D76: context past 400k)

## EXACT NEXT STEP (for BUILD-23b)
1. **The lead's rulings (8:10 and 8:21 PM ET, read by BUILD-23 only after its STOP):** ruling (a): the designed-cage branch is the
   BUILDER's, kept as a GENERAL engine piece. Its conditions are NOT yet met, all for BUILD-23b: (1) its own commit with a message starting
   'ENGINE PIECE (designed cage socket)': 3f958e630 is pushed with a "PENDING" message, and ENG-CAGE branches from it, so do NOT rewrite
   it: add a follow-up commit with that message that holds the planted test, and name both in this REPORT; (2) the plant: branch off ->
   a 2-3 roll lays 0 cages (RED); on -> Normal 5 / Easy 3 with critters (GREEN); plus one assert that a designed cage's little one joins
   the line (engine.ts:4517 c.critter); (3) generalitycheck PASS; (4) lockall vs main shows ONLY 2-3 moving (any other stage moving: stop
   and tell the lead); (5) no STOPGAP. The cage BOT skill is ENG-CAGE's (t-eng-cage, from 3f958e630), with the climb-punch question:
   do NOT touch firsttimer.ts or castBots. (A) the startFollow move is KEPT, in its own commit affa08d81; ENG-CAGE reviews it.
   (B) reeds as h: accepted, R-165.360 carries realisedCode 'm'. The 9:45 PM stills are a LOOK CHECK; the final shoot waits for green
   bots (rule 29). Until ENG-CAGE lands, 2-3's bots are RED (0/18) and nothing is GREEN.
2. **The heron's look is not visible on the real page.** stills/b23-L1-normal-3-heron-look-*.jpg are taken while the engine says the
   first heron is in its `pass` phase (followPlay herons[0].s.phase), but the heron is drawn in its CALM pose with no gaze and no wash.
   There is NO dress heron in 2-3 (proto.dress has none, checked). The heron's foot is at x 6290, b 653 (seed 1). So drawHerons
   (engine.ts:7838 -> followArt.ts:122) falls back to drawDress (riverArtReady() false?) and/or h.lookX is null at render time.
   Find which one, on the page (log heronPose(h), riverArtReady(), h.lookX in the stills script), and fix it where the cause is. If the
   cause is engine code, it is ENGINE-WORTHY: tell the lead. A look the player cannot see fails the polish bar.
3. **Wire w2-new.webp** (the lead's ruling (1), 8:05 PM: the builder does it, data + one painter, planted: the sheet preloads on 2-3 and
   the mooring post and the reed isle draw from it). Do it BEFORE any still of beats Pr or Wf. Not started.
4. **Planted faults** for w2Arc23.test.ts (level.md rule 12): a planted-faults.py with each of the five tests RED under its plant.
   Not started.
5. Then continue the packet in order: the HUD faces (item 2), the bots once the skill lands, relist (seedlist.ts, fly the judged rows
   first: 2-3's row has NO `judged` yet), castBots 1-40, the meter, THE FULL SET.

## Where it stands (branch t-build-23, base 0eefc707e; every commit pushed)
| Commit | What |
|---|---|
| 858684675 | 2-3 laid through World 2's kit: src/game/gen2/worlds/w2Arc23.ts (ARC_23 `A Tg Th R Pw Xh R Pr Wf R Ch R S E`; kitLib23, kit 'w2-23'; finish23), the stageTable row, listed.ts KITS/WORLD/FINISH; tools/engine/runs/line23.ts, quiet23.ts |
| 3f958e630 | **THE ENGINE PIECE, PENDING the lead's ruling:** pipeline.ts, a DESIGNED cage (socket allow 'cage' + its critter) laid where it stands, every one, with its critter. Without it a rolled graph lays NO cage (only missionGraph's fallback spine sets node.objectives). Planted test not written yet. Revert this commit if the lead rules (b). |
| affa08d81 | **engine.ts startFollow moved after the player is made** (it ran in the constructor before this.player: every real proto.follow stage threw). Engine code: for an engine member's review. |
| 6a88626d9 | The hand build's 2-3 deleted (w2Sections plan '2-3', W2Plan, W2_FLAVOURS/BY_DRAW rows, W2_STAGES '2-3', CAGES_23, W2_PUZZLES '2-3' (ruling (2)), the LV-11 post step) and the tests re-pointed (below). |
| 81dd325de | The keeper's lines: reference/story/lines-2-3.md (from t-keeper-23-29@e5f754d8); the stage card, Pokey's page, the clue; hint.2-3.cage/post/open retired (way.2-3 stays); w2Arc23.test.ts (5 tests, PASS). |
| (this commit) | This REPORT, stills23.mjs, the early stills. |

**The beats as laid** (one brick each, Normal / Easy): A the marsh (`follow` tip). Tg the first cage (duck) on a flat bank, a flag before.
Th the heron, safe: `heron` + `look` 800+ px before one reed bed 300 / 340, watch socket 'teach-heron' (free first look, calm 8-9 s).
R rests (a boulder each). Pw the parade: two stones over splash-back water, cage 2 (otter) on the far bank. Xh clump to clump: reeds
300 / 340 over open mud 400 / 350, cage 3 (capy) in the far clump. Pr the mooring post: a tree_climb vine 230 px with cage 4 (otter) up it
(geometry only, NO post art yet). Wf the pond: ONE sinking pad (two read 500 px of open pond, over lineFaults' 360) to an isle bank with reeds;
finish23 stretches its watch zone across the pond to the isle. Ch everything: three clumps over G 350, cage 5 (capy), Normal's second heron
LAG_23 3.2 s (finish23), Easy one. S home: the boardwalk (NO jetty or families drawn yet). E the gate.
**Numbers (head 81dd325de):** libstage 2-3 12/12 CLEAN both settings (172.7-177.7 s modelled, 27.5-28.4k px); lineFaults clean on seeds 1-3
both settings; w2Arc23.test.ts 5/5.
**Tests re-pointed:** w2Puzzles.test.ts (pulley tests to 2-8's cages; the two-stone "halfway" step retires, no stage lays one now; the
across-room water check reads 2-8's one basin river; the room-camera test to 2-9's bell room), w2Stages.test.ts (PLANS without 2-3; its
2-3 test's still-true assertions moved into w2Arc23.test.ts: five cages, the three kinds, no animal near the first, the post),
dipWayOut.test.ts (2-3's step test retires with the step), puzzleCamera.test.ts, writtenKeys.test.ts (golden seed set-up to 2-8).
Ran green: those files plus layoutMemory, w1NewArt, dotStuckHelp, stagePlanGoals, dotTipSession, jumpTrails, follow, followArt, bands,
lineBot, lineChannel (103 tests, 4 red, all 4 since fixed). **NOT run: the whole suite** (dotLinesData row removal may move counts elsewhere).

## Rulings and GO (verbatim sources: the lead's messages)
- GO 8:05 PM ET on the plan as written; (1) w2-new.webp: the builder wires it, before stills of Pr/Wf; (2) 2-3 out of W2_PUZZLES: yes;
  (3) prove the cage punch early: done, the answer is NO (below).
- The designed-cage branch: ruling (a) at 8:10 PM ET (the builder's, a general engine piece; conditions in step 1). The 8:21 PM ruling:
  the bot skill goes to ENG-CAGE; startFollow kept; reeds as h accepted (R-165.360).

## ENGINE-WORTHY (named, not coded around)
1. **The bots cannot punch a cage** (castBots 2-3 seeds 1-3, child/middle/expert x both: 0/18, every run "sealed door, goal 0/5 (Easy
   0/3)"): tools/inspect/firsttimer.ts punches only an animal walking at him (:2833) and a drop trap's load (:3206, :3224); a cage is only a
   distance topic (:2058). Plus: whether he can punch while climbing (the post's cage) is unproven. Sent to the lead 8:19 PM.
2. pipeline.ts realisedCode (:1085) cannot realise content 'm' (cover): the reed beats were laid as h (1-7's precedent) so V11 passes.
3. **World 2's neon-green stems and teal sprouts (packet item 4) are World 2-wide**, not 2-3's: envKit.ts ENV[2] near/decor (reedclump,
   nipa, proproot, hyacinth: code-drawn, envPlants.ts:266). Proven: stills/w2-env-plants-ON-2-5.jpg vs -OFF-2-5.jpg (the same 2-5 frame
   with ENV[2]'s lists emptied: the stems and sprouts go, the painted pebbles and flowers stay). Rule 22: a world-wide fix, the lead's call.
   NOT yet sent to the lead.
4. No engine hook says Dot's `spooked` line on the first spook, or picks `missingCage` / `missingReed` at the locked gate by state,
   or says Pokey's `post` / Dot's quiet `home` (keeper: on every Tips setting); goalStart/goalLate and countWord 'home' not wired;
   the heron's journal card not added. All named for BUILD-23b / an engine member.
5. The time model does not count a watched stretch's waits; 2-3 met the 2:00 floor by length (1-7's way), Easy's quick player 144-146 s.

## Polish check (early stills, head 81dd325de's stage, seed 1 L1, Normal; stills/ in this folder; Easy NOT shot)
- 1-cage-shut (both): the duck in its painted cage on a flat bank, him a step short: reads. A rolled flag stands beside the cage: clutter, look again.
- 2-line-behind-running / 2b-caught-up (both): the duckling trails him and closes up: reads.
- 3-heron-look (both): three little ones hidden in the bed, ears showing: reads. **The heron's look is NOT visible** (Next step 2): FAILS.
- 4-parade: the run reached the far side with the line bunched (the script's hop is crude): not judged, reshoot.
- The HUD's goal plank shows five blank slots: the faces (item 2) are not built.
- World 2's neon stems and teal sprouts are on screen (ENGINE-WORTHY 3).

## Learned (proposed level.md rules)
- A real stage row is the first proof of an engine piece: 2-3's first roll found three gaps the toys could not (no cage laid on a rolled
  graph, startFollow before the player, no bot cage skill). Rule 23's "ready" should require one roll of the real row plus one bot run.
- Lay the length first: a stage that is mostly walking needs 1-7's / 2-5's width (27-32k px) to meet the 2:00 floor; check libstage's
  seconds before the beats' details.

## Lessons applied / missed
Applied: D40 (engine gaps reported, not worked around in data, except the h-for-m precedent named), D30 for most times. **Missed D30 once:**
my "8:15 PM" message to the lead was a typed-ahead time; it arrived at 8:05 PM by the clock (the lead's note). D76 handover at the lead's STOP.
