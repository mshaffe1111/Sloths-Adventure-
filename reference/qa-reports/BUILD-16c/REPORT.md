# BUILD-16c REPORT: 1-6 First Lianas, the bot fixes and petals (R-165.203). STOPPED at the context line, NOT GREEN
t-build-16 from 9cf588da (BUILD-16b's head); packet reference/packets/2026-11-14/BUILD-16c.md (lead's branch ccr-ea739a2f-dfcee4).
Lead rulings followed: 11:43 AM (bot fix first, never list around it), 12:26 PM (order; (a) FAR, (b) petals), 12:41 PM (A then B in this
box, box to ~2:15 PM; C only for the first liana; never list 1-6 with Normal bots red), 12:44 PM (ENG-S5 chains ready: beat 4 by its
recipe if it fits, else first in EXACT NEXT STEP). Heads: c8f67aa7 (bot part 1), 8002b130 (petals), 5b0b1121 (catch model).

## EXACT NEXT STEP (in order; a fresh builder can start here)
1. **(a) FAR nearer the band's middle** (the lead's ruling 12:26, confirmed by the numbers below: it now earns it). FAR is
   `W1_LIANA_GAP.far` in src/game/gen2/worlds/w1Swing.ts:37 (`share: [0.85, 1]`, window normal 0.3 / easy 0.55). Move the share toward
   the middle, re-roll (`npx tsx tools/engine/libstage.ts --stage 1-6`), re-score on the meter (score.ts, the meter test in
   w1Arc16.test.ts), tell the lead the new px of the X perch and the gorge's first perch and the score. w1Swing.ts is World 1's: check
   no other stage lays FAR (grep `gap: 'far'`).
2. **The gorge and the creaky landing** (the other Normal cluster): after the limb crumbles the way out is the pit's stair to the next
   liana's catch. The bot now only climbs to a catch ledge its own hop catches from (pitWayUp); count again with
   `npx tsx reference/qa-reports/BUILD-16c/first.ts` (pit falls by beat). If the gorge stays the top cluster, it is the lead's call
   whether the stair's top step sits nearer the next liana (stage data), as ruling C does for the first liana.
3. **Beat 4's chain**: merge origin/t-eng-s5 (a2743943, GREEN) into t-build-16 and lay beat 4 by "the BUILD-16 recipe" in ENG-S5's
   REPORT (note its topShort pushback). The bot's catch model (lianaWait) is for a catch off a LIP; a liana-to-liana catch is the let-go
   (LET_GO_AT) and the engine's catch in the air: count chain misses the same way (hops.ts) before trusting the bots on it.
4. castBots 1-6 seeds 1-6 both settings from a FRESH process per bot (see the leak below): all must pass with 0 rescues before any
   relist. Then `npx tsx tools/engine/addlevel.ts 1-6 --par 4 --relist` (about 14 min; background limit 2 h), bots 1-40 both settings,
   commit `src/game/gen2/proven/seeds-1-6.ts` + `provenIndex.ts` from that run only.
5. The whole suite on the final head (3 shards, CLAUDE.md glob), `bash reference/qa-reports/BUILD-16b/plant.sh <side worktree>` (M1-M8
   RED), stills + clips (`node reference/qa-reports/BUILD-16b/shoot.mjs <sha> normal|easy`, CLIP=1; `exit.mjs` for the door) from a side
   worktree, then the CLAUDE.md Checks in order (buildcheck ALONE). The sealed line at the door (R-165.241) is the TIPS member's.

## Done-items (each with its head and evidence)
1. **The climb back out of a pit** (c8f67aa7, refined 5b0b1121). tools/inspect/firsttimer.ts `pitWayBack`/`pitWayUp`: in a pit whose far
   wall is over a double's rise (DOUBLE_RISE+10), off the route, he climbs the pit's own stair (plain hops, JUMP_RISE-8) back to the bank
   the route walks; a catch ledge only where no bank is left (a crumbled creaky limb) and only one his hop catches from. Three falls into
   one pit = a loop, put past it (as any loss three times is); the climb is not "stuck" time. Proof: tools/inspect/pitClimb.test.ts
   tests 1-2 (toy pit, 225 px far wall, 56 px stair): **planted "climb-back off": RED** (rescued at the wall); control cases (on the
   route; a shallow dip) never turn back. In CI: .github/workflows/gates.yml tools-tests line (ciTests.test.ts 3/3).
2. **The let-go at the swing's forward end** (c8f67aa7): `LET_GO_AT = 0.75` (was 0.4 in code). Evidence: physics.ts RELEASE note (testers
   let go at the forward end); castBots 1-6 seeds 1-6 adult Easy 0/6 -> 6/6, kid Easy 4/6 -> 6/6 at that step.
3. **Hang low** (c8f67aa7, 5b0b1121): learned from Dot's "Hang low, fly far!" or a let-go that dropped him into a pit; down alone (never
   with a steer or the press) to the liana's foot, only after 0.5 s on it and clear of a ledge (down at a lip had the engine set him
   down or drop him: seed 2 x 14029).
4. **The catch off a lip by the engine's own catch** (5b0b1121, ruling B): `hopCatches` (exported) flies his hop with physics.ts airStep,
   his flick's hold and the engine's cut (PHYS.cutV) to canGrabSwing on the vines' clock. A tier bot stands and presses when it
   catches; KID/ADULT press on the run (they cannot stand: thumbify R-165.59). Measured (hops.ts, seeds 1-6): these hops catch 99%
   (adult) and 85-89% (kid). Proof: pitClimb.test.ts test 3 (a tier bot catches at every phase of a swing; **planted "model off":
   misses phases 0, 0.7, 0.8, 0.9, RED**) and test 4 (the hop model catches some moments, not all).
5. **Petals where he sets down** (8002b130, ruling (b)): perch and root-top petals at `LANDED 0.88`, pairs 60 px apart (the SHORT leap
   sets him 247 px into a 280 px perch); take-off and landing petals on the snake on your vine, the creaky landing, the false liana and
   the gorge, so the shared petal pass (petals.ts fillGaps, FILL_GAP 1050) stops filling those stretches onto pit floors. Measured
   (petals.ts, middle+expert Normal seeds 1-6): root-top misses 34 -> 7, perch 53 -> 35; tier sealed doors from 6-10 of 18 runs to 3.
   libstage 24/24 CLEAN both settings; w1Arc16.test + goalsGathers 10/10.
6. **Ruling C** (the first liana): zero pit falls at w1-16-first-liana for kid and adult, both settings, seeds 1-6 (first.ts). No change.
7. **Regression**: tierBots 7/7 (1-1's calibration unmoved) on 5b0b1121; castBots, travelBots, firsttimer, pitClimb, firstTimerBot,
   w6Stages, teachSpoken 54/54; tsc clean; generality, knowncheck, roadmapcheck PASS; ciTests 3/3.

## Where 1-6 stands (castBots 1-6, seeds 1-6, 5b0b1121; pass = shrine, goal met, 0 rescues)
| bot | Normal | Easy |
|---|---|---|
| kid | 4/6 (rescued x1 s2, x2 s6) | 5/6 (rescued x1 s4) |
| adult | 4/6 (rescued x1 s3, x3 s6) | 6/6 |
| child | 3/6 (sealed 79/81 s1, 83/91 s4; rescued s5) | 6/6 |
| middle | 5/6 (sealed 89/91 s4) | 6/6 |
| expert | 3/6 (sealed 86/89 s2, 85/91 s4, 84/88 s5) | 6/6 |
Normal pit falls by beat (kid/adult, first.ts): gorge 9/18, creaky landing 4/9, snake on your vine (FAR) 8/4, false liana 5/3, hang
low 4/2, risers 2/4, snakes met 2/3, first liana 0/0.

## Polish check
- **No stills or clips were shot in this box.** The stage changed only in petal placement (8002b130); BUILD-16b's door and counter
  stills (../BUILD-16b/shots/) are from 56ba2bb0 and are not re-shot. Every beat still and every clip is step 5 above. This is the
  biggest gap in this report: nothing here has been judged on a phone screen.

## Pushback
- The packet's step 1 ("the bot won't climb the stair back") was the first of four bot limits on lianas; the climb-back alone moved no
  run to a pass. Each later one was found by counting, not guessing: let-go moment, hang low, the catch, and the way-up goal.
- KID/ADULT never let go of a held steer (thumbify R-165.59). For a liana stage that means they can never wait for a swing; a real
  first-timer does. It is a calibrated behaviour I did not change (it would move every stage's numbers), but it caps the first-timers
  on 1-6. The lead's call whether that model is right for lianas.

## Suggestions (ready packets)
- **TOOLS: castBots' per-seed build leaks state between runs.** Objective: the same stage, seed and setting builds the same in any run
  order. Evidence: seed 1 Easy goal "need" 73 in a both-settings run, 78 with `--setting easy` alone; Normal seed 1 96 vs 81. Files:
  tools/inspect/castBots.ts, src/game/realPlay.ts (setDifficulty / freshPhone order). Done: a test that builds seed 1 Easy after a
  Normal run and alone and gets the same collectibles.
- **ENGINE (petals.ts): honour a brief's `petals: 'low'` in fillGaps** (no pit floors, no arcs), or name why not. Most of 1-6's petals
  come from the fill on seed 5 before 8002b130 (110 petals, 30 socket fills of 1-2 petals each), though types.ts:657-658 says a 'low'
  stage's pickups "come only from the sections' `pickup` sockets". Touches 1-2.

## Unresolved (named plainly)
- Normal bots red (above). Not relisted (the lead's 12:41 rule). FAR not moved. Beat 4 not laid. Suite, plant.sh, stills, clips and the
  perf gates not run on this head. The sealed line at the door (R-165.241) is the TIPS member's.
- Up to 2 fill petals stay on a pit floor on some seeds at the creaky landing and the gorge: a creaky limb cannot hold a petal
  (flowerReach.ts:140) to break the stretch.
- My rough context estimate passed 40% around 1:10 PM ET; I stopped building there.

## Method update (level.md)
- Worked: classify every failure by cause before changing anything (a fall into a pit: after a let-go, after a model hop, after another
  jump; by beat). Two of my changes that "should" have helped measured worse (a double on a retried let-go; a longer look-ahead) and
  were taken out the same hour. The scripts are in this folder (they import by absolute path from /home/user/Sloths-Adventure-).
- Failed: tuning a bot rule against pass counts on 6 seeds: the counts move by 1-2 runs from noise. Measure the mechanism (hops.ts:
  how often the model's hops catch) instead.

## Learned (proposed level.md changes; the lead decides)
1. NEW rule: **before a new mechanic's stage is listed, prove the bots can do the mechanic in a toy test** (a liana catch, a let-go, a
   climb back), each with a planted fault. Evidence: 1-6 is the first liana stage in World 1; the bots had never caught a swinging liana
   on purpose, so every red run read as the stage's fault until each skill was counted.
2. NEW World 1 note: **a petal on a piece he lands on goes where the landing sets him down (0.88 of a perch or root), not the middle**;
   and **no stretch over 1050 px without a socket petal**, or the shared fill lays petals on a pit floor.
3. NEW trap: **a creaky limb cannot hold a petal** (flowerReach.ts:140): it is dropped after the lay.

## Lessons applied
LAWS 3 (every claim from a run or a file:line), 5 (tierBots and the bot tests after every bot change; planted faults), 18 (each wrong
guess measured and removed), 22 (no list around a bot limit; the share kept). LESSONS D30 (times from `date`), D36 (status before
commit, ls-remote after push), D52, D55 (context % in every message), D57 (queue read at every push), D67 (no wait loops).
**Misses**: a commit's session line typed wrong (fixed by amend before the push); one context estimate given by eye, not measured.

## Turnover note
Level builders have no handoff file in reference/handoffs/; this REPORT is the handover (as BUILD-16b's was).
