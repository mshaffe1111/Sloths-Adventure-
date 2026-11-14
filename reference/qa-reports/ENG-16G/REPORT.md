# ENG-16G REPORT: 1-6 finished from ENG-16F's EXACT NEXT STEP: the height-aware swing clearance and its lay rule, seesaw-b parked, the sealed doors' petals on the path (R-165.246)
t-build-16 from 68e4bce1; packet reference/packets/2026-11-14/ENG-16G.md (lead's branch ccr-ea739a2f-dfcee4). Start 5:30 PM ET (`date`).
**1-6 is NOT GREEN.** Bots 1-40 on Normal: sealed doors (expert 18/40, middle 30/40, child 36/40) and rescues (kid 34/40, adult 39/40).
Easy: kid 39/40, the rest 40/40; **Easy proof pending R-165.251**. The lead's ruling 6:23 PM ET: no stills or clips (the walked-span petal
lay, a fresh engine member's from 7:30, will move 1-6); this box is the gates, the ranked misses, the kid's rescues, and the next step.

## EXACT NEXT STEP (in order; engine tier, xhigh)
The next engine packet carries three global items (the lead, 6:29 PM ET), then 1-6 to GREEN.
1. **The walked-span petal lay (an engine piece for every stage; rule 22).** The rule, in one sentence: *a petal goes inside its piece's
   walked span, after the farthest point the leap onto that piece can set him down and before the earliest point the jump off it
   leaves, and on a piece the leap clears, onto the next piece he walks.* Where petals are laid for gen2: `src/game/gen2/pipeline.ts:2551`
   (each socket's x from its `t` along its piece: `placed.sockets.push({ socket: s, x: R(p.x + t * p.width), ... })`) and
   `pipeline.ts:3199-3214` (a 'pickup' socket's flowers laid at that x, span around it, clamped 20 px inside the piece); the stage's own
   fill pass is `src/game/petals.ts:378` fillGaps (FILL_GAP 1050, :213). The landings are already known to the lay: `lianaBand`
   (pipeline.ts, the release window's band of perch near ends) and the release flights in `lianaRelease`; the take-off is where the
   next piece's ask starts (the section's `asks`, x0). The pickup reach is 46 px from his hips (`engine.ts:3219`, distance2D(p.x, p.y - 20, c.x, c.y) < 46).
   The evidence to plant from (`petals/expert-spans-40.txt`, `petals/miss-expert-40.out.txt`; expert Normal seeds 1-40, misses of 40):

| petal (section:piece@t; socket) | missed | where he lands on the piece / leaves it (t) | the walked span says |
|---|---|---|---|
| gorge:in@0.70 (pa) | 26 | enters walking at 0; leaves median 0.56, 10% before 0.05 (respawns) | a take-off bank: at or before ~0.4 |
| creaky-landing:in@0.70 (pa) | 24 | leaves median 0.57, 10% before 0.51 | at or before ~0.4 |
| false-liana:in@0.70 (pa) | 21 | leaves median 0.58 | at or before ~0.4 |
| risers:hu1@0.75 (ph) | 19 | stood on in 30/40; lands median 0.42, 90% by 1.00; leaves 0.97-1.00 | flown over in 10: the next walked piece |
| snakes-met:b2@0.77 (the near one of a LANDED pair) | 19 | stood on in 23/40; lands median 0.85, 90% by 0.93; leaves 0.97-1.00 | past ~0.93, or the next piece |
| rest-dip:c@0.50 | 13 | stood on in 18/40; lands 0.34-0.50; leaves 0.87-1.00 | flown over in 22: past 0.5 |
| rest-log:d@0.50 | 12 | stood on in 21/40; lands median 0.46; leaves 0.96-1.00 | flown over in 19: past 0.5 |
| snake-on-vine:b1@0.85 | 12 | stood on in 34/40; lands median 0.33; leaves median 0.55, 10% before 0.42 | 0.33-0.42 |
| chain:cb@0.60 | 12 | stood on in 28/40; lands median 0.28, 90% by 0.38; leaves median 0.51, 10% before 0.43 | 0.38-0.43 |
| rest-dip:b@0.86 | 11 | stood on in 21/40; lands median 0.42; leaves 0.96-1.00 | flown over in 19 |
| risers:b1@0.88 | 10 | stood on in 24/40; lands median 0.86, 90% by 0.92; leaves 0.97-1.00 | past ~0.92, or the next piece |
| snakes-met:b1@0.10 | 10 | stood on in 22/40; lands median 0.89 | 0.10 is behind every landing: past ~0.9 |

   Plant it on a toy stage both ways (a petal before the leap's far landing RED, inside the span GREEN), lay every stage of every world
   by it, run the lock (it will move every stage with LANDED-style petals: list them), relist what moves, bots 1-40 both settings.
2. **The way back out of a liana's soft pit** (the lead, 6:29 PM ET; item 5 below: 5 of 6 kid rescues "fell into this pit 3 times").
   First check s20 and s36: is there a stair to the take-off bank under that liana, and does the kid take it? Stair missing = a lay rule;
   stair there = a bot fix. The stair is laid by `src/game/gen2/pipeline.ts:2857` backPit (floor + steps), applied to a soft pit at
   `pipeline.ts:1857` (and read for a perch's least distance at `pipeline.ts:1461`); W1's pit art finds pits at `src/game/w1Pits.ts:117`
   findW1Pits. The bot's climb: tools/inspect/firsttimer.ts pitWayUp / pitWayBack (ENG-16F B3, B4).
3. **Vine creatures never start a hop inside TELL_MIN of his catch, planted** (the lead, 6:29 PM ET: a hop the frame after he catches,
   s21, s23, s25, s36, is a fairness fault, no player reacts in 33 ms). The hop is triggered at `src/game/pieces/vineSnakePiece.ts:95`
   (`if (snakeTouches(n, len, hands) && host.letGo())`, checked every step while he swings on that liana, with no time since his catch)
   and, for a false liana, `vineSnakePiece.ts:111`; the snake's beat and tell are in `src/game/vineSnake.ts` (tell 0.5 at :48). Plant:
   a catch onto a liana whose travelling snake is within its reach of his hands: RED with today's line, GREEN with the rule.
4. Then 1-6 to GREEN: relist, bots 1-40 both settings (0 rescues, 0 sealed), the whole suite, the lock; stills of every beat upright
   and sideways on Normal and Easy, the clips with `shoot.mjs` (CLIP=1: it names the clearance frame) and `exit.mjs` (CLIP=1); the
   Easy proof once R-165.251 lands.


## Done-items (each with its evidence)
### 1. The height-aware swingClearance and its lay rule (the lead's ruling (b), 4:42 PM ET)
- physics.ts `swingClearance`: for each vine as the one he hangs on, the deepest hold (SWING.minLen to its foot) whose body
  (SWING_CLEAR.body above and below) still meets the other vine's rope; that hold's sweep plus the other rope's sweep where his body is,
  plus body + margin, against how far apart they hang; the least over both vines. Infinity when no depth meets.
- pipeline.ts `clearSwings` (in layLocal, every world): the stiller vine of a pair under 0 moves straight away from the other by the
  deficit (only a liana hung past a ledge that nothing else is laid from, never back over that ledge); else the section throws, so the
  roll is never listed. 1-6's false liana is laid still (stillOne `amp: 0`, a number: no roll taken, every other roll the same).
- Planted (src/game/swingClearance.test.ts, 6/6): the 78 px pair from 1-6 roll 1 (pasted from the stage at 68e4bce1) RED; the same pair
  laid clear (137 px) GREEN, where the old foot-to-foot measure read -96 (RED); 27 swinging pairs of one top and one length read the
  old value exactly, 45 mixed pairs never stricter, 1-6's chain pair exactly as before; the lay on every roll 1-40 of 1-6's false-liana
  and gorge sections, both settings, clear. `python3 reference/qa-reports/ENG-16G/planted-faults.py`: 3/3 CAUGHT (the old measure; no
  lay rule; the false liana laid swinging).
- 1-6 rolls 1-3 (the proven list at 68e4bce1): the false liana's pairs read -42 to -62 before, +1.0 to +1.9 after (it moved 43-63 px
  toward its bank); the chain pairs 0.0 / 5.5 / 7.0 / 8.0 before and after.

### 2. seesaw-b out of the shipped set (the lead's ruling (b), 5:08 PM ET)
- tools/art/w6to10/park.py (tools-only commit c7e4cec3): w6balt repacked with geminicut.pack (2048x608 -> 2048x417, 53 KB); the five
  kept frames' visible pixels PSNR 46-50 dB against the old sheet, alpha exact; the gauge post (the one frame the game draws, a
  hard-coded x 769 in w6StiltArt.ts:159) did not move (it is before the parked frame).
- CATALOG-MASTER.csv: status "parked: no draw site since the old 1-6 left; for a W6 seesaw piece", file src/game/art/parked/
  w6balt-seesaw-b.png (+ .json: its frame, take and why), ship kb 0; `python3 tools/art/catalog_master.py --emit` (w2, w6, w8 rows).
- artUse.test.ts + src/game/art/*.test.ts: 10/10; artcheck PASS; knowncheck PASS. No allow-list entry. (data commit 57d07fb2)

### 3. The sealed doors' petals on the path (the lead's ruling)
- The probe (reference/qa-reports/ENG-16G/petals/onperch.ts; runs on-*.out.txt, 5 bots x seeds 1-6, Normal): first-liana's b1 is mostly
  flown OVER (seeds 1 and 3: no bot stood on it; the expert stood on it only at 0.96-0.99); every bot lands on d1 at 0.28-0.52 (the
  expert s1 at 0.80) and leaves at 0.53-0.92. The gorge's FAR bough: bots land at 0.19-0.57 and leave at 0.44-0.86 (the expert and
  middle hop on early: 0.44-0.58), so 0.84 was behind them.
- first-liana: the pair on b1 (0.77 + 0.99) -> one at b1@0.99 + one on d1@0.6. gorge (Normal): b1@0.88 -> 0.45 (FAR_WALKED). Easy's
  gorge unchanged. Count and the 87.5% share unchanged. (f80c535a)
- **Checked afterwards on 40 seeds: the b1 one did NOT move** (Pushback 1: the lay's 20 px clamp on a b1 that is built ~83-118 px wide puts
  it back at 0.76-0.83; 11/40 expert misses). d1@0.6: 1/40. gorge b1@0.45: 7/40. Not patched again: the lead's ruling, 6:23 PM ET, gives
  every petal to the walked-span lay (EXACT NEXT STEP 1), which must read the BUILT piece's width, not the data's.

### 4. 1-6 relisted; bots 1-40 both settings NOT green
- `npx tsx tools/engine/addlevel.ts 1-6 --par 4 --relist` on f80c535a (5:51-6:20 PM ET, 1735 s; `relist-bots.txt`): rolls 24/24 Normal,
  24/24 Easy clean; seed list 100 proven of 100 tried, version c23bd231, `--check` PASS, the verdicts refuse 0 of 100; flown: judged on
  normal-1-6; registered everywhere. Committed ebbb3eb2 (src/game/gen2/proven/seeds-1-6.ts + provenIndex.ts) from this run only.
  **Easy proof pending R-165.251**: seedlist.ts and lockall.ts never call setTimedSwing (grep), so their Easy builds use Normal's swing
  outside pipeline.ts's own local switches (248, 274, 337). The bots play the real engine, which sets it (engine.ts:966).
- castBots 1-6 seeds 1-40 (addlevel step 4):

| bot | Normal | Easy |
|---|---|---|
| kid | 34/40 (6 rescued shrines: s14, 20, 21, 23, 25, 36) | 39/40 (1 rescued shrine: s18) |
| adult | 39/40 (1 rescued shrine: s38) | 40/40 |
| child | 36/40 (4 sealed doors, 1-2 petals short) | 40/40 |
| middle | 30/40 (10 sealed doors, 1-5 short; s34 also rescued) | 40/40 |
| expert | 18/40 (22 sealed doors, 1-6 short) | (Normal only) |

  Seeds 1-6 had hidden this: on them the expert failed 4 and the kid none. The two petals ruled on are on the path now; the expert still
  misses 4-6 a run across the stage. That is stage-wide petal placement (Suggestion 2), not two spots.

### 5. The kid's 6 Normal rescues, traced (the lead's ruling 6:23 PM ET, item 3; `rescues/kidrescue.ts`, `rescues/where.ts`, outputs beside them)
One line each: seed, x, frame (30 fps, from his run clock), the beat and the liana over the pit, what put him in, whether it repeats.
- s14, x 39223, f~5747: false-liana beat, the pit under the REAL liana sl1. He let go on the BACKSWING twice (f5710 vx -234, f5882 vx -277)
  into the pit; then he fell back into it 3 times climbing out (its far wall 248 px up) -> rescue. RELEASE. Only seed there.
- s20, x 24025, f~3808: snake-on-vine, the pit under l1 (down-off snake). Let go on the backswing three times (f3603 vx -294, f3772 vx -210,
  f3944 vx -252); fell into the pit 3 times (far wall 258 px up). RELEASE (the snake never touched him: no -157 hop). Repeats: s21.
- s21, x 23717, f~3707: snake-on-vine, the same pit under l1. The snake's startle hop the frame after he caught (f3436 caught, f3437 let go vy
  -157), then a backswing let-go (f3601 vx -210) and another hop (f3841); pit 3 times (far wall 259 px up). SNAKE + RELEASE. Repeats s20.
- s23, x 34525, f~4681: risers, the pit under l2 (a riser). The riser's hop the frame after he caught (f4507 -> f4508 vy -157), again after
  he climbed high (f4793); stuck in a dip 49 px deep, the way on 145 px up. SNAKE. Repeats the riser pattern of s25, s36.
- s25, x 44000, f~7348: gorge, the pit under l2 (a riser). The riser's hop (f6874 vy -157); back on l1, then l2 from high (y 526), a short leap
  (f7416 vx 340); pit 3 times (far wall 202 px up). SNAKE. Same spot as s36.
- s36, x 44311, f~7391: gorge, the same pit under l2. The riser's hop the frame after he caught (f7349 -> f7350 vy -157); pit 3 times (far
  wall 196 px up). SNAKE. Same spot as s25.
- (adult s38, x 43262: gorge, the pit under l1 (down-off); pit 3 times, far wall 253 px up. kid Easy s18, x 18610: a dip 54 px deep under a
  241 px wall, the way on 153 px up.)
**Read together:** two ways IN (a let-go on the backswing: s14, s20, s21; a snake already at his hands as he catches: s21, s23, s25, s36),
and one way it becomes a RESCUE: he cannot climb out of a liana's pit (five of six "fell into this pit 3 times", far wall 196-259 px up; s23
a dip). hitBy is empty on all six: nothing took a heart; these are falls into the soft pits. The lead's correction (6:29 PM ET): a snake
hop the frame after he catches (s21, s23, s25, s36) is not an honest mistake but a fairness fault in the vine-creature rule (EXACT NEXT
STEP 3). A miss into a soft pit is the stage's designed cost (1-6.md: "a miss drops to the moss with the stair back"), so the shared fault is the climb out (BOT, firsttimer.ts pitWayUp /
pitWayBack, as ENG-16F's B3/B4) unless the stair back is missing under these lianas (STAGE). First check for the next engineer: on s20
and s36, is there a stair back to the take-off bank under that liana (w1Pits.ts / pipeline backPit), and does the kid take it?

### 6. The gates on 498f8d61 (the final code head; later commits are reference/ only)
- Lock re-check vs 68e4bce1 on 498f8d61 (`lock-check-498f8d61.txt`; covers the petal commit and the relist): 101/102 stages unchanged,
  1-6 intended, exit 0. The first check (`lock-check.txt`, before the petal commit): 101/102, 1-6 intended (vines only).
- The whole suite (CLAUDE.md's glob, 6 shards as CI, 2 workers, from a side worktree at 498f8d61, 6:14-6:48 PM ET): **3438 pass, 1 fail**
  (shards 649/0, 618/0, 494/0, 463/1, 597/0, 617/0). (A first start on ebbb3eb2 was stopped at 2 min when artCutin.test.ts went red on the
  w6to10 packing record's sizes; fixed in 8e6a4ea9 + 943adfd4 and restarted on 498f8d61.)
- The other CLAUDE.md checks on 498f8d61: tsc PASS; `BASE_PATH=/Sloths-Adventure-/ npx vite build` PASS; chunkcheck PASS; artcheck PASS;
  knowncheck PASS; generalitycheck PASS; buildcheck PASS (easy p95 69 ms); `seedlist.ts 1-1 --check` PASS (257); the engine tools' tests
  33/33; tierBots 7/7; kbdcheck (`CI=1 FORCE_COLOR=1`) PASS; roadmapcheck PASS (after `git fetch --unshallow` and every branch fetched:
  on the shallow clone it cannot check proofs and names 8 cited commits on unfetched branches; this branch does not touch ROADMAP.md).
  drawcheck and clipcheck: (DRAWCLIP)
- **RED: src/game/requiredMove.test.ts:8** ("the limited bot: without the double or the bounce, it stops short on 1-6"): "without the
  bounce: shrine on 0 rescues, 0 mushroom bounces". Its premise ("1-6 on main needs both the second jump and the bounce") is the OLD
  hand-built 1-6's, deleted by ENG-16F; the new 1-6 lays no mushroom, and on the relisted seed 1 the no-bounce bot reaches the shrine on
  its own. It passed on the old list only because that seed's no-bounce run fell (a soft fall counts against "on its own"). Not patched
  (law 22; and 1-6 moves again with the petal lay): the next packet retargets the test to a stage whose route needs the bounce (the
  gate's intent), and checks the double half on the new 1-6 still bites.

## Polish check
- No stills or clips were shot: the lead's ruling 6:23 PM ET (the walked-span petal lay will move 1-6; no polish on what is being
  replaced). The shoot scripts are ready for the next engineer: `node reference/qa-reports/ENG-16G/shoot.mjs <sha> normal|easy` (CLIP=1
  for clips; beats first, chain, hanglow, met, snake, creak, risers, false, falsereal, gorge; the clip prints and saves its CLEARANCE
  FRAME, swinging on the real liana nearest the false one) and `exit.mjs` (CLIP=1 records the sealed and open door).

## Pushback
- **My first-liana move did not take (my miss, found by checking the built stage, `pet.ts` in the REPORT's evidence):** the socket now
  says b1@0.99, but pipeline.ts:3212 clamps a petal 20 px inside its piece, and b1 as built is ~83-118 px wide (not its 280 in the data),
  so the petal still sits at b1@0.76-0.83, the same spot: 11 of 40 expert runs still miss it. The d1@0.6 petal is missed once in 40. The
  gorge's FAR bough petal at 0.45 is missed in 7 of 40. Beyond those, the 40-seed run shows the doors are stage-wide: 12 spots each missed
  in 10-26 of 40 expert runs. Two spots were the wrong scope; the walked-span lay is the
  root (EXACT NEXT STEP 1). Seeds 1-6 alone hid it (expert 4 of 6 sealed there, 22 of 40 over forty).
- The w6to10 packing record (manifest.json `files` sizes, artCutin.test.ts) was not in the ruling's list for parking a frame; park.py
  now keeps it (8e6a4ea9). The ruling's list should name it.

## Suggestions (each a ready packet)
1. **CONTENT or ENGINE: are raft-b, sluice-wheel-b, stone-b, lily-pads-b drawn?** grep finds no draw site by name for any of them
   (only the gauge post is drawn, at a hard-coded x); artuse counts them through some dynamic name, the way it counted seesaw-b through
   the old 1-6. Files: tools/art/artuse.mjs (print which dynamic pattern marks each frame used), src/game/w6StiltArt.ts. Done: each
   is drawn somewhere a test names, or parked with park.py.
2. **ENGINE: petals on a landing perch by the walked span** (rule 22: any world's perch a leap can clear). petals.ts places LANDED
   petals at a fixed share; a lay could place them where the release window's landings and the walk off overlap (lianaBand already
   knows the landings). Files: gen2/petals.ts, pipeline.ts lianaBand. Done: a planted test (a perch the leap clears has no petal before
   the walk's start).

## Unresolved (named plainly)
- 1-6 is NOT GREEN (above). No stills or clips (the lead's ruling). Easy proof pending R-165.251 (seedlist.ts and lockall.ts build Easy
  with Normal's swing). The kid's rescues are traced, not fixed. The walked-span lay is not started.
- The relist (ebbb3eb2) will be redone after the petal lay moves 1-6.

## Method update (the lead decides)
- Before moving a petal, measure where the bots STAND (onperch.ts), not only what they miss: the miss list said "b1@0.77" and read like
  "he lands past it"; the stand data showed most runs never touch b1 at all.

## Learned (proposed rule changes)
- Proposed level.md rule: **prove a stage's goal on 40 seeds before ruling on spots.** Seeds 1-6 showed 4 expert doors and 0 kid rescues;
  1-40 showed 22 and 6. A spot fix from six seeds treats a symptom.
- Proposed level.md rule (with EXACT NEXT STEP 1's check): **a petal is laid in its piece's walked span**, measured, never a fixed share.

## Method used / Lessons applied
- Method: reference/methods/level.md (rules 12, 13, 14, 20, 21, 22), stage-fix.md; the role card's day one (lock saved first on the
  start head, planted failure first).
- Lessons: D19 (the gate calls the same code the screen calls: the lay calls physics.ts swingClearance, the one the test calls), D20/D30
  (times from `date`), D29 (the whole suite after the relist), D36 (`git status -sb` before commits, ls-remote after pushes), D55
  (context % in every message), D57 (queue read at every push).

## Turnover note
- reference/handoffs/engine-core.md §0zb (db000670).
