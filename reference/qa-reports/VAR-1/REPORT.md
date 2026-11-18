# VAR-1: variety for 1-6, 1-7, 1-8 (R-165.276). Level builder, 2026-11-18

Branch `t-var-1` (from origin/main 6e7b85f8f). Stage data head **afb9f2e69** (the climb-top fix, the lead's 2:45 PM ruling). STOPPED at
3:50 PM ET before the gates (context; the lead's rule): flags, bots, lists below are from afb9f2e69; the suite, lock, drawcheck and
seedlist --check were NOT run on it (the runs on 1a1df995b were stopped as void). See section 10.
Method: reference/methods/level.md (rules 1-29), the lead's GO 10:19 AM ET and rulings 10:00 / 10:50 AM ET.
Lessons applied: D57 (read the inbox: I missed the 10:00 and 10:19 messages until 10:50, my miss), D79 (stills of the whole screen,
both ways, both settings), D81 (drawcheck both ways), D83 (probe scripts use relative imports: reference/qa-reports/VAR-1/probes/).

## 1. What was wrong (measured, main 6e7b85f8f, `funcheck-main-6e7b85f8.txt`)
A runs probe (`probes/runs.ts`: every 4-move run a stage repeats more than 3 times, with the sections each copy spans) and a steps probe
(`probes/steps.ts`: the route's moves by section) found four causes, none of them the stage's idea:
1. **1-7's eagle read as a fight.** `tools/inspect/beats.ts` read every eagle as "eagle swoops" (F, the letter of 1-2's snakes); 1-7's
   eagles are kit sweepers (stillLay.ts castWatches) laid over watched stretches. So 1-7, the hide stage, read "nothing new" and "like 1-2".
2. **1-7 and 1-8 each laid ONE rest five times** (w1-17-rest, w1-18-rest: four root hops, "JJJJ" every time).
3. **1-6 laid the same root hops after every liana** (`hops()`): Easy read 9 swings and ~55 identical jumps ("JVJJ" 7 times).
4. **The rolled join into every beat was a jump**, and every rest ended on root jumps: "rest JJ | join J | liana V" on every roll.

## 2. What changed
### A. The eagle fix (own commit cac760957, the lead's ruling 10:00 AM ET)
- beats.ts: a kit sweeper (isKitSweeper) is skipped as an animal; its stretch (sweptZones) is read as a watched stretch (E), its beat
  family kept `creature:eagle` (the bot and meter channel that already serve it).
- score.ts: that beat is skipped where a kit watcher's ground lies, exactly as the old fight beat was (watchChallenges prices the eye).
  Without it the meter refused 1-7/1-8 ("unpriced beat:watched stretches") and coveragecheck failed: a gate went red and was fixed at
  the root, no list edited (told to the lead 11:03).
- Planted test `tools/inspect/sweeper.test.ts`, in gates.yml: red on main ("1-7: 9 kit sweepers read as a fight"), green with the fix.
- What it moves (only 1-7 and 1-8 lay kit sweepers; every stage-table row checked): funcheck on main+fix: 1-7 "nothing new" cleared
  Normal + Easy (16 -> 0); 1-8 Easy "like the stage before" 16 -> 15; no flag added. Meter seeds 1-4: 1-7 Normal 2.2 -> 2.1 (the
  eagle's fight seconds leave the beat clock), 1-7 Easy 1.4, 1-8 and 1-1 unchanged. coveragecheck PASS, seedlist --check 1-7/1-8 PASS.

### B. The level data (the lead's GO 10:19, conditions: rests stay rests, each rest looks different, 1-6's swing load unchanged)
Every piece is World 1's own inventory (moss banks, branches, World 1 climb vines, the hollow log, mushrooms, log and moss-stone blocks):
no new art, no Hugging Face. Climb (taught in 1-4) added to the three kits' moves.

| Stage | New or reworked | What it is | What it serves |
|---|---|---|---|
| 1-6 | each beat's walked ground (`hops` step strings) | each beat walks its OWN ground after its lianas: root up/down, stepping stones over a soft fern gap, a vine up a tall root, the drop | the lianas' rhythm: a different walk between each beat's swings, same swing count |
| 1-6 | `w1-16-rest-dip` (reworked) | down the dip between the roots, up a vine at the foot of its far wall | "the vines": a rest that climbs |
| 1-6 | `w1-16-rest-hump` (reworked) | up the great root by its vine, along its hump, a step down | the vines, at rest |
| 1-6 | `w1-16-rest-stumps` | ends on its mossy floor past the second stump | (the closing root jumps made every rest read alike) |
| 1-6 | beats' entry join | each beat asks `entry.join: 'walk'` (ENG-LOOK2) | the liana's take-off reached on the level, not past a rolled jump |
| 1-7 | `w1-17-rest-hollow` (new) | a long mossy floor, a stone, a hollow log walked through, a stone | a green place to hide in, at rest |
| 1-7 | `w1-17-rest-shelf` (new) | a mushroom up onto a mossy shelf (150 px, as the bounce ships), a root and down | (a rest; a missed bounce is the same ground) |
| 1-7 | `w1-17-rest-dip` (new) | down a fern dip, a vine at its far wall, a root up and down | the moss and the climb, at rest |
| 1-7 | `w1-17-rest-moss` (new) | a long mossy floor, two mossy rocks, a fallen log | a quiet floor, nothing watching |
| 1-7 | `w1-17-rest` (kept) | the roots, now laid ONCE a roll (each rest maxPerStage 1) | |
| 1-7 | beats' entry join | the beats but the two liana beats ask `entry.join: 'walk'` | (the two liana beats walked into stuck the first-timer bots) |
| 1-8 | `w1-18-rest-knots` (new) | the knotted bough: a long sound fork, three burls to hop | a living fork: breathe |
| 1-8 | `w1-18-rest-crook` (new) | up to the high crook by a vine at the trunk's foot, two roots down | a living fork: breathe, high |
| 1-8 | `w1-18-rest-split` (new) | the fork splits: a high limb over the low one, either way | a choice while he breathes |
| 1-8 | `w1-18-rest-saddle` (new) | the fork sags into a mossy saddle and rises out by a high root | a living fork's own shape |
| 1-8 | `w1-18-rest` (kept) | the roots, now laid ONCE a roll | |

Every rest is a rest (the lead's condition 10:19): no pit, no heart on either setting; each rest that climbs has the vine at the foot of
its wall (a miss is the ground he stood on). Removed on the way: stepping-stone RESTS (soft gaps are pits), a hide in a rest.

## 3. Flags before / after (funcheck, layouts 1-16, both settings; `funcheck-main-6e7b85f8.txt` vs `funcheck-final-fb7008fc.txt`)
| Flag (the 11) | main | fb7008fc2 |
|---|---|---|
| 1-6 Normal repeat ("JVJ" back to back) | 14/16 (new) | 0 |
| 1-6 Easy repeat ("JVJJ" 7 times) | 16/16 (new) | 0 |
| 1-7 Normal repeat ("FjJJ") | 16 (known 13) | 0 |
| 1-7 Easy repeat | 16 (known 13) | 0 |
| 1-7 Normal like an earlier stage (1-2) | 6 (known 2) | 0 |
| 1-7 Easy like the stage before (1-6, 68%) | 16 (known 1) | 0 |
| 1-7 Normal nothing new | 16 (new) | 0 (the eagle fix) |
| 1-7 Easy nothing new | 16 (new) | 0 (the eagle fix) |
| 1-8 Normal like the stage before (1-7) | 13 (new) | 0 |
| 1-8 Easy like the stage before (1-7) | 16 (new) | 0 |
| 1-8 Easy like an earlier stage (1-6, 75%) | 11 (new) | 0 |

- The gate's worse-or-new lines: 34 on main, **23** now: exactly these 11 gone; **no other stage's line changed** (diffed, every
  stage but 1-6/1-7/1-8). Not in the 11 and still there: 1-6 Normal "nothing bites", 15 layouts (main 16; known 1): the walked ground
  costs nothing when missed, by design of a rest. 1-8's repeats (its chase, known 16) unchanged at 16.
- funknown.json only shrinks: 21 entries of 1-6/1-7/1-8 that the gate reads as gone deleted, 1-8 Normal "pacing" 16 -> 14 (135 -> 114
  entries; knowncheck PASS). Other stages' entries untouched (not mine).
- **1-9 (BUILD-19's) moved, under its known counts**: "nothing new" 3 -> 5 Normal, 3 -> 6 Easy (known 15 / 13). Its only "new" move on
  those layouts was a climb, new only because the validator reads 1-4 as no moves (R-165.283); 1-6..1-8 now really climb.

## 4. Bots (castBots seeds 1-40 on each final list, afb9f2e69; main's run where a tier missed, same command on main + the eagle fix)
| Stage | kid N | kid E | adult N | adult E | child N | child E | middle N | middle E | expert N |
|---|---|---|---|---|---|---|---|---|---|
| 1-6 | 33 (main 36) | 40 (39) | 36 (39) | 40 (40) | 40 | 40 | **39** (40) | 40 (40) | 40 |
| 1-7 | 38 (main 35) | 38 | 38 (main 38) | 40 | 40 | 40 | 40 | 40 | 40 |
| 1-8 (at fb7008fc2's 1-8, unchanged since) | 40 | 40 | 40 | 40 | 40 (main 36) | 40 | 40 | 40 | 40 |

Every miss traced (castBots --json, the stuck x mapped to its section):
- 1-6 middle N 34: the gorge's liana pit, "fell into this pit 8 times" (the gorge beat is unchanged; the stage before it moved). OPEN.
- 1-6 kid N 13: **the dip rest's vine, "fell back down from here 3 times", a sealed door (28/30 petals): MY climb, OPEN.**
- 1-6 kid N 15, 26, adult N 3, 24, 29: the creaky landing's pit, the snake on your vine's pit, the first liana (unchanged liana beats;
  main misses there too, but fewer: kid 36, adult 39).
- 1-7 kid N 4, 25, kid E 18, 35, adult N 15, 32: the creak, the mossy lianas, the light gap (unchanged beats).
- Fixed on the way (each found by the bots or the stage's own test): a vine 140-220 px back from its wall (child stalled at the wall);
  a 60 px knot of bough then the root's top at the vine's top (child/middle failed the step off; now the root's top is laid over the
  vine, a flat landing at the vine); the walk-in join into liana beats (first-timers stuck); a hide in a rest (the child waited in it).
## 5. Meter (score.ts seeds 1-4, on fb7008fc2 (before the climb-top fix); before = main + the eagle fix, the same stage set)
| Stage | Before Normal | After Normal | Before Easy | After Easy |
|---|---|---|---|---|
| 1-6 | 5.7 (20 swings) | **7.0** (20 swings) | 3.2 (10 swings) | 3.1 (9 swings) |
| 1-7 | 2.1 | 1.9 | 1.2 | 1.3 |
| 1-8 | 6.8 | 6.7 | 3.3 | 3.3 |

DIFFICULTY.md:67 targets: 1-6 6.5, 1-7 5.5, 1-8 7.5. 1-6 Normal went from 0.8 under to 0.5 over: the swing load is unchanged (20 swings,
the lead's condition) but the walked ground now asks moves (climbs 4, hops) inside the busiest 30 s (peak 29.95 -> 37.1 points a
minute). 1-6 Easy scored 9 swings over seeds 1-4 against 10: NOT traced (named, not explained). 1-7 stays far under its 5.5, as on main.

## 6. Gates
NOT complete on any head: cut by the stop, never passed off as run.
- On afb9f2e69: funcheck (all 11 clear, nothing new or worse anywhere; the shrunk funknown.json matches exactly), castBots (section 4).
- On fb7008fc2 / 1a1df995b (before the climb-top fix, stage data since changed): tsc PASS, coveragecheck PASS, registrycheck PASS,
  generalitycheck PASS, roadmapcheck PASS (after `git fetch --unshallow`), knowncheck PASS, w1Arc17/18 tests 22/22. The suite, the
  seedlist checks, the lock and drawcheck were started on 1a1df995b and stopped unfinished (the lead's 2:45 ruling made them void).
- The eagle fix's own commit cac760957 (section 2A): coveragecheck PASS, seedlist --check 1-7 and 1-8 PASS, the planted test, ciTests.

## 7. Polish check (stills from the real game, layout 1, 412x915 and 915x412 at 2x, Normal and Easy; `stills/sheet-<stage>-<setting>-<way>.jpg`,
each sheet one still per new piece in stage order; shot on the final data of each stage: 1-7 at a39c90dac's list (1-7 unchanged since),
1-6 and 1-8 at fb7008fc2. Script: `probes/stills.mjs` (tools/engine/runs/stills-at.mjs with EASY=1))
- 1-7 (`sheet-1-7-*`): the moss shelf (mushroom by a tall mossy shelf), the mossy floor (rocks, a fallen log), the fern dip (a vine trunk
  at the foot of the dip's wall), the hollow log: four different pictures, every one a floor he walks, no pit. The round thing on the
  mossy floor is World 1's cracked-nut decoration, not an animal (checked zoomed). Dot's arrival line is on screen in most stills (the
  page's own line, not a defect of the rests).
- 1-8 (`sheet-1-8-*`): the knotted bough, the split fork (high limb over burls), the saddle: each reads. ROUGH, named: the knots draw as
  flat grey stone slabs on the bough (moss_stone blocks in a world drawn as boughs), and the bough's long seams draw like small breaks
  over the mist though the floor is continuous (checked: one 1,400 px platform).
- 1-6 (`sheet-1-6-*`): the beat-ground climb, the great root, the stumps, the log rest, the dip. ROUGH, named: every vine climb
  (the great root, the dip, the beat-ground climbs) is the same picture, a vine trunk at a tall root wall; the dip differs only by
  standing in a dip. They read as "climb here" on both phones, but they are one look three times.
- Before/after of the flag spots: the flags are move strings, not a spot on screen; the runs probe output before (main) and after is
  the evidence (section 3). Rule 29: these stills are BEFORE the climb-top fix (1-6/1-7 vine tops now differ: a flat root top laid
  over the vine, no knot); re-shoot the climbs on the green head.

## 8. Learned (for the next builder)
- **Map a repeat to its sections before changing anything.** `probes/runs.ts` (each 4-move run repeated over 3 times, with the
  sections every copy spans) found the real causes in one run: "rest JJ | rolled join J | liana V" on every roll. Two hours of
  guessing at piece shapes before it moved nothing.
- **The route reads what a player holding right does**, not the pieces: root banks with no gap still read as jumps (the route jumps
  root-top to root-top over the low banks). A rest "looks different" to the eye long before it reads different to the reader.
- **A vine must stand at the foot of its wall**, never 140-220 px back: the child bot walks to the wall, finds it too high and never
  looks back (rescued). And the bank he reaches the vine from must be walked onto, not hopped onto (he lands past the vine).
- **A walk-in join into a liana beat stuck the first-timer bots** (1-6 kid 6/16 vs 15/16 rolled; 1-7's two liana beats). Asked
  joins are fine before ground beats (1-7's eagle beats).
- **1-8's chase is tuned to its fork length.** Shorter rests moved the flag chain so a stretch stopped early (the still fork's moss
  26 px past its line); a rest much longer, with a climb, was never laid. Keep a chase stage's rests near the length the chase was
  designed for, and run the stage's own tests (w1Arc18.test.ts caught it, the bots did not).
- **Read the inbox** (D57): I worked 50 minutes past the lead's GO and ruling.
- **Two relists at once clobber the proven index** (each rewrites the whole file from its start-time copy): relist one stage at a
  time, or re-run the last one; seedlist --check catches it.
- **The validator's blind spots move verdicts across stages**: 1-4 reads no moves, 1-2's bounces read as jumps, so a climb anywhere
  later reads as "new" (R-165.283). Real climbs in 1-6..1-8 took 1-9's false "new" away (1-9 "nothing new" 3 -> 5 N, 3 -> 6 E).

## 9. Proposed level.md rules
1. **Before a variety fix, run the runs probe** (`reference/qa-reports/VAR-1/probes/runs.ts <stage> <layout> <setting>`): every
   repeated run with its sections. Check: the REPORT carries its output before and after. (Proposed as a tool:
   tools/validate/runs.ts, ENGINE tier, so it is not a probe copied per builder.)
2. **A climb vine stands within 60 px of the foot of its wall, reached on a bank he walks onto.** Check: a test on the built stage
   (vine x to wall x), and the child bot 40/40.
3. **No two rests of a stage alike: each rest maxPerStage 1, and the stage's test asserts the rests of every roll are different.**
   (w1Arc17.test.ts / w1Arc18.test.ts now do.)
4. **A chase stage's rests stay near the fork length its chase was laid for** (1-8: about 2,600-2,900 px). Check: the stage's
   teach-line test and a stretch-count probe over 40 rolls.

## 10. EXACT NEXT STEP (open; for the member who takes it on, from afb9f2e69)
1. 1-6's dip rest vine (w1Arc16.ts `w1-16-rest-dip`, `wallClimb` in the same file): the kid bot falls back from the top on layout 13
   (sealed door). Look at the kid's climb-off at the top (tools/inspect castBots --stage 1-6 --seeds 13-13 --bots kid --setting normal
   --json, then a still at the vine). If the helper changes, 1-7's dip uses the same shape (w1Arc17.ts `wallClimb`): change both.
2. 1-6 middle N layout 34: the gorge's liana pit (8 falls). Unchanged beat; compare with main's middle on the same plan.
3. Then, ONCE, on the new head: relist only what changed (one stage at a time: two relists clobber provenIndex.ts), castBots 1-6 all
   tiers both settings (child, middle, expert 40/40; Easy never under Normal), funcheck (all 11 clear; `funcheck-final-afb9f2e6.txt` is
   today's), then the gates: tsc, the suite, seedlist --check 1-6 1-7 1-8 1-1, lockall --layouts 16 --intended 1-6,1-7,1-8 --check
   against main's lock (`npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json` on origin/main first, about 12 minutes),
   coveragecheck, registrycheck, knowncheck, generality, roadmapcheck (needs a full clone: git fetch --unshallow), drawcheck.
4. The meter on the final head (section 5 is from fb7008fc2), and 1-6 Easy's 9 scored swings against 10 (not traced).
5. Lead: rule on section 9's proposed rules.

## Method update (law 4)
- Worked: the runs probe (section 8); a fresh-roll probe for a stage's own test rule (`probes/split18.ts`, 40 rolls in a minute) found
  1-8's chase problem that 40 bot seeds did not.
- Failed: relisting two stages at once (the index clobbered, caught and redone); measuring with 8- and 16-seed lists before the bots (the
  flags were right, the bots then found three defects: run the first-timer and child bots on the 16-seed list in the same loop).
- Edit for level.md step 6: "run castBots on the 16-seed list (seeds 1-16, every tier) in the tuning loop, before any 100-seed relist".

# VAR-1b: the finish (level builder, 11-18, 3:46-5:45 PM ET by `date`). STOPPED by the lead (5:42 PM): INT-12 relists, bots and gates

**Hash: e3b96a8b4 (data), this REPORT on top.** Branch t-var-1. 1-8 = origin/main exactly (data, tests, list, index line; the lead 5:03
PM). funknown.json = main's minus 19 entries of 1-6/1-7 this work cleared (0 lowered, 0 added; the lead 5:07 PM).
**Logged miss:** my first five messages to the lead carried estimated times, not `date`. Lessons applied: D57, D79, D81, D83, D86.

## Fixes and their roots
| Fix | Root |
|---|---|
| 1-7 mossy floor: the middle piece is Matt's painted boulder (moss_stone exactly 50 px, isPaintedRock) | The lead's look question: the "fallen log" (`landing: true`) grew to 53 px, and protoArt paints a log-style block only under 50, so terrain drew a code slab. As a 25 px painted log it was walked over, the floor went quiet, the relist refused 37/137 seeds and funcheck read 1-7 "nothing bites" new. Planted test |
| 1-7 hollow-log rest: stone 230+ px before the log's mouth | castBots child EASY seed 4 (Normal 40/40) stood in a 93 px gap under the log's 124 px face: the route ran stone -> the log's top. Planted test |
| 1-6 walk-ins: a non-flat walk-in ends on main's root down | VAR-1's soft jump down left a 60 px slot level with the stone after it: pitJoinWall.test (1-6 N seed 1) and a narrow landing |
| 1-6 stepping-stone fern gap 80-90 px (share 0.42-0.46) | A 60 px gap's floor was a landing under 64 px: stageQuality "1-6: 2 narrow landings before World 5" |
| 1-7 moss beat: a petal on `b`, before the eye's stretch | The beat ran ~1,950 px bare (a hair under the 2-screen rule): walkedPath.test E's low fill on 1-7 layout 1 laid inside it |
| 1-8 knots: REVERTED to main (4 shapes tried) | They are scenery doing a gate's job: the list's quiet line counts them as hop points, the route walks through them, the gated 5 s pacing grid moved 14 -> 15/16 with every real shape. R-165.293 |

Items 1-2 of the packet: **bot defects, not level defects, NOT touched** (the lead's ruling pending; packet BOT-1 below). Kid N L13:
`Progress.relocate(level=true)` (firsttimer.ts:414) has no distance limit and sent a liana-pit fall at x 5800 to the dip floor 35,000 px
on. Middle N L34: the gorge is main's byte for byte; a 19 px short let-go, then `pitWayBack`'s `off < 120` early return kept it under
the far wall. 1-6 Easy 9 vs 10 swings: 10 lianas laid; the meter's route catches the chain's 2nd liana off the bank (phase +0.48).

## The three tests on e3b96a8b4 (run in its tree)
- pitJoinWall.test.ts (1-6 rolls 1-4): **PASS** (3/3).
- stageQuality.test.ts "narrow landings are rare and late": **PASS**.
- walkedPath.test.ts "E: a LOW stage..." (1-6, 1-7): **PASS** (on the OLD 1-7 list; the relist may move layout 1).
- **STILL RED, found late, NOT fixed:** w1Pits.test.ts "World 1, layout 1: the vault pits are soft pits with steps": "1-6 26199: a soft pit
  with no step out" (red on 2cec5f64d too, so it is VAR-1's 1-6 data; likely a stepping-stone fern gap with no step out of its floor).

## UNRUN on e3b96a8b4
Relists 1-6 and 1-7 (the data changed; the committed lists are the old ones, so seedlist --check may refuse), castBots, funcheck, the
meter, every CLAUDE.md gate, lockall, stills. On 2cec5f64d (before these fixes): tsc, build, chunkcheck, artcheck, knowncheck,
generality, coveragecheck, roadmapcheck PASS; suite 3784/3790 (the 4 above + 1 TODO); lockall PASS (100/102 unchanged: only 1-6/1-7, 1-8
unchanged vs main); funcheck = VAR-1's final (the 11 cleared, nothing new); castBots 1-7 (2a8413391's data, before the moss petal):
child/middle/expert 40/40 both settings, kid/adult N 39 E 40 (light gap). Meter: 1-6 6.5/3.2, 1-7 1.9/1.3, 1-8 (main) 6.8/3.3.
Stills: reference/qa-reports/VAR-1/stills-b/ (1-7 sheets on 2a8413391 data; 1-6 climbs and rests; 1-8 knots before the revert).

## Packets
- **BOT-1 (Critic):** firsttimer.ts `relocate(level)` limited to ~600 px of him; `pitWayBack` no early return when the next point is out of
  reach. Planted: 1-6 kid N L13, middle N L34. Then tierBots + castBots 1-6.
- **1-6 w1Pits:** the fern gap's pit needs its step out (or the fern gap is laid as no pit); run w1Pits.test.ts with the relist.
- **1-8 rests, bough-native:** after R-165.293 (the pacing gate on the truer rule).

## Learned
- A piece's draw path decides its look: check the real footing (probes/rockdraw.ts) before calling it painted.
- `landing: true` grows a thin block to a step's height.
- Scenery can be doing a gate's job: read what the quiet line and the route each see before replacing a piece (`seedlist --count 3 --to 12`).
- A bot's stuck x is where its progress tracker points, not where it was: read FT_TRACE first.
- Run the suite on the first data commit, not at the end (VAR-1's 4 reds were there all day).
- Stamp times from `date`, never from memory.
