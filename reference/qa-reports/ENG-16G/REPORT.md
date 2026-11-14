# ENG-16G REPORT: 1-6 finished from ENG-16F's EXACT NEXT STEP: the height-aware swing clearance and its lay rule, seesaw-b parked, the sealed doors' petals on the path (R-165.246)
t-build-16 from 68e4bce1; packet reference/packets/2026-11-14/ENG-16G.md (lead's branch ccr-ea739a2f-dfcee4). Start 5:30 PM ET (`date`).
DRAFT: numbers marked (PENDING) are filled from the runs on the final head.

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
- first-liana: the pair on b1 (0.77 + 0.99) -> one at b1@0.99 (its far end; the fly-overs' arc takes it: ENG-16F's misses never named
  it) + one on d1@0.6. gorge (Normal): b1@0.88 -> 0.45 (FAR_WALKED). Easy's gorge unchanged. Count and the 87.5% share unchanged. The
  pickup reach is 46 px from his hips (engine.ts:3219), so each spot is inside every observed stand span. (f80c535a)

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
a dip). hitBy is empty on all six: nothing took a heart; these are falls into the soft pits. A miss into a soft pit is the stage's designed
cost (1-6.md: "a miss drops to the moss with the stair back"), so the shared fault is the climb out (BOT, firsttimer.ts pitWayUp /
pitWayBack, as ENG-16F's B3/B4) unless the stair back is missing under these lianas (STAGE). First check for the next engineer: on s20
and s36, is there a stair back to the take-off bank under that liana (w1Pits.ts / pipeline backPit), and does the kid take it?

## Polish check
- No stills or clips were shot: the lead's ruling 6:23 PM ET (the walked-span petal lay will move 1-6; no polish on what is being
  replaced). The shoot scripts are ready for the next engineer: `node reference/qa-reports/ENG-16G/shoot.mjs <sha> normal|easy` (CLIP=1
  for clips; beats first, chain, hanglow, met, snake, creak, risers, false, falsereal, gorge; the clip prints and saves its CLEARANCE
  FRAME, swinging on the real liana nearest the false one) and `exit.mjs` (CLIP=1 records the sealed and open door).

## Pushback
- (PENDING)

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
- (PENDING)

## Method update (the lead decides)
- Before moving a petal, measure where the bots STAND (onperch.ts), not only what they miss: the miss list said "b1@0.77" and read like
  "he lands past it"; the stand data showed most runs never touch b1 at all.

## Learned (proposed rule changes)
- (PENDING)

## Method used / Lessons applied
- Method: reference/methods/level.md (rules 12, 13, 14, 20, 21, 22), stage-fix.md; the role card's day one (lock saved first on the
  start head, planted failure first).
- Lessons: D19 (the gate calls the same code the screen calls: the lay calls physics.ts swingClearance, the one the test calls), D20/D30
  (times from `date`), D29 (the whole suite after the relist), D36 (`git status -sb` before commits, ls-remote after pushes), D55
  (context % in every message), D57 (queue read at every push).

## Turnover note
- reference/handoffs/engine-core.md §0zb (PENDING commit).
