# BUILD-16b REPORT: 1-6 First Lianas, finished from BUILD-16's handover (R-165.203). STOPPED at the context box (~40%), NOT GREEN
t-build-16 from 9b167cf2; packet reference/packets/2026-11-14/BUILD-16b.md (lead's branch ccr-ea739a2f-dfcee4). Lead rulings 10:36, 10:40,
10:49, 11:00 (option A: the petal seal) and 11:29 AM ET (move the missed petals; measure the door). Code head 54a41eff. BUILD-16's REPORT
(../BUILD-16/REPORT.md) holds the design and the first build.

## EXACT NEXT STEP (in order; a fresh builder can start here)
1. (This session's relist on 54a41eff wrote 100 of 100 seeds at 11:45 AM ET but was stopped before its `--check` and bots, by the
   lead's 11:43 ruling: the list is NOT committed and was discarded.) Re-run `npx tsx tools/engine/addlevel.ts 1-6 --par 4 --relist` on
   54a41eff (about 14 min: rolls, list, `--check`, bots 1-40 both settings, registry). Give it a 2-hour background limit; 10 min killed
   mine once. Expect the bots to FAIL on "rescued xN" only: the pass rule needs 0 rescues (castBots.ts:48), and the swing bot falls into
   the moss pits and will not climb the root stair back LEFT (seed 4, x 6148: the stair 5611-5911 rises to y 910 under the 854 take-off;
   the bot reads "a 225 px wall ahead"). With the arcs gone the adult met the goal on seeds 4/22/33 (95/89, 88/87, 88/85) at the shrine.
   That is a BOT limit (level.md rule 18). **Lead's ruling 11:43 AM ET: the bot fix FIRST** (castBots' pass stays 0 rescues;
   tools/inspect/firsttimer.ts learns the climb back up a pit's stair, proven by a planted toy test); never list around it. Then
   re-run the bots and report got/need per seed.
1b. **Lead's ruling 11:43 AM ET: the sealed line not showing within 34 s at the door is a 1-6 BLOCKER for Matt's link.** The TIPS member
   owns it (R-165.241) and it lands before 1-6 goes on any link.
2. Commit `src/game/gen2/proven/seeds-1-6.ts` + `provenIndex.ts` from that run (never the 16:06 list: it predates 54a41eff).
3. Full suite on the exact head (3 shards, CLAUDE.md glob). On 56ba2bb0+list it was 1144 ok, 1 red: artUse.test.ts. Root cause: my
   template keys `${k}m${i}u${j}` read as `.*m.*u.*` to tools/art/artuse.mjs:61-64 and marked boss/golem/w4 art "drawn". Fixed in
   54a41eff (keys joined); artuse is back to base's 210. Not yet re-run as a suite.
4. Stills + clips: `node reference/qa-reports/BUILD-16b/shoot.mjs <sha> normal` and `easy` (then CLIP=1), from a side worktree (vite
   reloads on any repo write). Exit stills: `exit.mjs` (done on 56ba2bb0, below; re-shoot on the final head).
5. `bash reference/qa-reports/BUILD-16b/plant.sh <side worktree>`: M1-M8, every one must read RED.
6. The gates: CLAUDE.md "Checks" in order (build with BASE_PATH, chunkcheck, artcheck, drawcheck, clipcheck, knowncheck, generality,
   roadmapcheck, kbdcheck, buildcheck ALONE (R-165.207), seedlist 1-1 --check, the tool tests, tierBots).

## ENGINE LINES (for the xhigh integrator, line by line at merge; the lead's 11:00 condition). Cites checked at 54a41eff
- src/game/goals.ts:72-81 (the function at :77) `goalCountsPetals(cfg)` (harvest, or `stageSpec(world, mini)?.gathers === 'petals'`) and `countedGoal(cfg)`;
  :81 countedGoal; :87 goalHave reads it; :100 normalGoal's share reads it. Imports stagePlan.ts (which imports types only: no cycle).
- src/game/engine.ts:38 import; :3378-3379 `goalType = countedGoal(config)`; :3381 the progress switch on goalType; :3404-3408
  isQuotaType on goalType; :3437 the 'late' goal line on goalType; :3474 the 'sealed' line: `sealedLine(world, objType)` keeps
  objType (SEALED_LINES '1:vine_runner'), goalLine falls back on goalType; :4911 the summary's floraGoal on countedGoal.
- src/components/hud/goalInfo.ts:8 import; :95 `type = countedGoal(cfg)` (the goal card and counter: "collect N petals", petal icon).
- src/game/stagePlan.ts:31-34 `StageSpec.gathers?: 'petals'`; :56 1-6's row `{ ...S(...), gathers: 'petals' }`.
- Proven: goalsGathers.test.ts 2/2 (a gathering row: share, counter, card; a vine run without the field: null stays null; a harvest
  still counts); planted "predicate forced false": RED. generalitycheck PASS (27 known). On the real page (56ba2bb0, seed 2): sealed at
  0/104, Dot's sealed line on screen once the earlier bubbles are tapped away, opens at 104/104, exit reached; Easy 0/80 to 80/80.

## Done-items, heads named per number
1. **Swings to the meter** (step 1, 88cb36f1): Normal lays 14 lianas (was 25), Easy ONE a beat (8, was 24). Length from walked ground:
   a walk-in where a beat follows a beat (P, M, X), root hops between a beat's lianas and after them, one more hop on every rest.
   score.ts seeds 1-4 (1-1 = 4 as SCALE): **Normal 6.3 (6.1-6.6)**, target 6.5; **Easy 4.3 (4.2-4.3)**, target ~3 (accepted for the
   test link only, the lead 11:00; the meter's fixes first, R-165.239). Modelled typical 224 s N / 230 s E; fast 190 / 192 (floor 143).
   libstage 24/24 CLEAN both settings (54a41eff code, 11:37 run).
2. **The seal** (98e2d54d): ENGINE LINES above.
3. **Petals on the path** (54a41eff): BRIEF_16 `petals: 'low'` (types.ts:658, pipeline.ts:3172): no jump arcs over the liana gaps. Before:
   the adult bot missed 21-35 petals a run, mostly arcs over the moss pits (risers 18, first liana 9, snakes met 9, creaky 9 in 3 runs),
   and met the sealed door on all 40 seeds (70-101 of 96-113). After: 7-11 missed, goal met on seeds 4/22/33. Every petal is now a socket
   on a bank or perch he lands on. Not yet checked per seed on 40 seeds (step 1).
4. **LV-3** (88cb36f1): retargeted, not deleted. It played the OLD 1-6's practice ledges via RealPlay('1-6') (dblPractice.test.ts);
   `grep -rn dblPractice src tools .github` finds only protoStage.ts (the dead 1-6 builder, R-165.238's cleanup) and w1.relay.test.ts.
   gen2/stage11gen2.test.ts:49 judges 1-1's double teach by geometry (doubleGap, Normal only), not by play, so the real-engine test now
   plays 1-1's three rolls: from the near bank a single jump drops SAFE (grounded above the death line, short of the far bank), a double
   lands at holds 14/6/9. 4/4 pass; plants "single expected to land" and "no second flick": both RED.
5. **Tests**: w1Arc16.test.ts 7/7 on 88cb36f1 (counts now: 2 creaky limbs, 3 risers, 2 FAR perches on Normal; an Easy row 'none' may
   have no liana) + the meter test (Normal 5.5-7.5; Easy <= 4.5 and <= 0.7 x Normal; tightens with R-165.239). The meter test is
   UNRUN on the final head.
6. **The door, measured** (doorwait.mjs, 56ba2bb0, sideways, default settings): he reaches the door 5.6-5.8 s after starting 400 px
   before the goal section; **Dot's sealed line did NOT show within 34 s on Normal (Tips) or Easy (Help)**, still or reading. Her mark
   line ("Her mark, right where she used to wait for you!", t-mark on the exit's first bank) holds the bubble until tapped, and the
   sealed line waits behind it ("+1"). The door's "N more" tag sits behind Pokey (reads "0 more" at 100 more). Still:
   shots/doorwait-normal-still.jpg. Both are R-165.241 (TIPS member), not changed here.

## Polish check (shot on 56ba2bb0; six kept in reference/qa-reports/BUILD-16b/shots/; re-shoot on the final head)
- THE DOOR, sideways, Pokey at it (the lead's ask): shots/doorwait-normal-still.jpg (her mark line holds the bubble, "+1" queued, the
  tag behind him reads "0 more") and shots/exit-normal-sideways-915x412-2-sealed.jpg.
- Counter reads as PETALS, upright and sideways, both settings: exit-*-1-counter.jpg (petal icon, "0/104", Easy "0/80"; Easy's card
  "1-6 · FIRST LIANAS · Easy · This stage: collect 80 petals").
- Sealed door: exit-*-2-sealed.jpg. Dot's line is on screen only after the earlier bubbles are tapped (above). Rough: the tag behind him.
- Open exit: exit-*-4-open.jpg ("Touch the door!", glow, "The canopy lets you through."). Good.
- Beat stills and clips: NOT SHOT (step 4).

## Meter findings (R-165.239, a tools member's; NOT changed here, LAWS 22)
- **Every liana is scored twice.** tools/inspect/route.ts:402 adds the grab from a bank (`plat` to `liana`, `from` set: beats.ts:120
  labels it "swing on a liana") and :413 the let-go onto a bank (`liana` to `plat`, no `from`: labelled "swing on to the next liana",
  though no liana follows); score.ts:247 scores each as a full 2.32-bit release window.
- **Every swing costs a life**, even over the soft moss with the stair back: score.ts:247 hard-codes `cost: 'life'`; a jump's cost comes
  from costAt(st, softPits, ...) (score.ts:227).
- Effect: the peak half (MIX 0.5/0.5, score.ts:69) sees two beats' lianas in one 30 s (PEAK_WINDOW, score.ts:68) as ~21 points a minute
  even at one liana a beat; Easy ~3 would need every liana 30 s from the next: about 70 s more of root hops on Easy.
- **Tool finding** (artuse.mjs:61-64): any template literal with two letters between holes becomes a wildcard over every art name.

## Pushback / rough spots named
- Easy 4.3, not ~3 (the meter, above). Beat 4's chain is not laid (ENG-S5 not merged). 1-6.md's petal at the liana's FOOT is not laid.
- The goal asks 87.5% of ~100-115 petals on a swing stage; with the arcs gone the adult clears it by 1-6 petals. Watch the kid/child.
- The bots cannot climb back out of a moss pit (step 1).

## Method used / Lessons applied
Method: level.md (rules 3, 5, 12, 14, 16, 18; steps 3-7), gates.md. Lessons: D8/D14 (petals on the natural path), D19 (tests through
the game's builder; LV-3 through RealPlay), D37 (RealPlay stubs loseLife: "safe" judged by ground, not lives), D40 (seal before the
list), D50 (default settings for the door), D52 (cites last), D57 (queue read at pushes), D62 (labels: the engine's flag is `e.easy`,
engine.ts:828, not `easyMode`; fixed in both shooters), D63, D67 (background runs, no wait loops). **Misses**: my 11:03 message time was
typed, not from `date` (D30); a 10-minute background limit killed addlevel once; a debug line in pipeline.ts during diagnosis (reverted
before any commit, `git diff` clean).

## Learned (proposed level.md changes; the lead decides)
1. NEW rule: **Score the stage on the meter (score.ts) as soon as it rolls, before stills**, and look at the peak window, not the count:
   two beats' swings in one 30 s set the number. Evidence: 1-6 at 17 lianas read 8.2 because P and M shared a window; walk-ins moved
   it to 6.3 with no liana cut.
2. NEW World 1 note: **a liana stage lays `petals: 'low'`**: jump arcs over a liana gap are off the swing's path (21-35 missed a run).
3. NEW trap: **template-literal piece keys** like `${k}m${i}u${j}` read as wildcards to artuse.mjs; join keys with `[...].join('')`.
4. BUILD-16's Learned 3 ("the pool is spent = lengthen the bricks with more lianas") is WRONG for a liana stage: lengthen with walked
   ground; more lianas raised the meter to 9.6.
