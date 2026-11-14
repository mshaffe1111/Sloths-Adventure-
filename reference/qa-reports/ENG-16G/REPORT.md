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

### 4. 1-6 relisted, bots 1-40 both settings, the whole suite (PENDING)

## Polish check (PENDING)

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
