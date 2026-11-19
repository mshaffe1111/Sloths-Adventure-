# PAINT-292 REPORT (stopped at the lead's context hand-off, written 6:10 PM ET; the final hash goes on PAINT-292b's report)

## EXACT NEXT STEP (PAINT-292b: read only this section)
Pushed: t-paint-292, its head is the commit that adds this file (base 2502c8252 before it). Built and unit-green; gates NOT yet run on this code:
1. FIRST run `npx tsx tools/engine/paintcheck.ts --stages 1-1,1-6,1-9 --known --unpainted` (4 min). At 5:58 PM ET, before the last
   stone change (STONE_PART_W 150 -> 100, ENDS_SLACK), it left 3 ids: 1-1 easy h52/h55/h58 (seeds 1249998 x17306, 22275 x16316, 29807 x17932).
   The change fits all 3 inside OVERHANG_MAX (probe: 5, -2, -5 px). Expect 0 breaches on 1-1/1-6/1-9; then take every 1-1 and 1-6 id OFF
   tools/engine/paintcheck.known.json (46 ids: 42 of 1-1, 4 of 1-6; 1-9 had none) and run paintcheck in all 3 CI parts (--part 0/3, 1/3, 2/3).
2. Lock vs ce4ad461 (src identical to t-gate-292): lockall --layouts 16 --out on a worktree of origin/t-gate-292, then --check on this head.
   Expect 1-1, 1-6, 1-8 'platforms' only. Prove 'cut' is the ONLY field moving: the field diff I used (scratch, recreate it): build every
   listed seed both settings on both trees, compare platforms minus cut, collectibles, proto.dress. At 5:50 PM ET (150 px pieces) the diff
   was cut-only on 1-1 (261 builds), 1-6 (200), 1-8 (100: wide stones newly cut '' = no piece, drawn exactly as before). Re-run it on 100 px pieces.
3. `npx tsx tools/engine/seedlist.ts <id> --check` for 1-1..1-9 (every World 1 list), castBots unchanged, drawcheck 1-1 + 1-6 both ways (new
   draws: a 538 log is 2-3 drawImage, a wide stone 3-4), then THE CLAUDE.md CHECK LIST, every item, once on the final head.
4. HF upscale of the two thick planks (lead's ruling 4, cap $1, ~$0.01 spent): NOT done. This container cannot reach huggingface.co or the sandbox
   URL; the input reached the sandbox only as base64 through my context. To finish: a member with context room creates a cpu-upgrade sandbox,
   sends the ORIGINAL frames (atlas at origin/t-gate-292, w1-log-plank-a 1726,362 197x60 and -b 1526,362 198x65) as lossless webp base64
   (11-12 KB each), runs Real-ESRGAN x4 (spandrel + ai-forever/Real-ESRGAN RealESRGAN_x4.pth, colour-bled RGB, alpha run as grey), brings
   back a 2.5x lossy webp per frame, then re-runs tools/art/flattenlogs.py on the bigger frames (they need new atlas room: extend the sheet's
   height; MAX_H and the empty-space assert in flattenlogs.py) and `flattenlogs.py --check`. Or the lead names it a later job.
5. Stills for the lead (whole + 3x): reference/qa-reports/PAINT-292/showfirst/ (logs; the lead approved them 5:39 PM) and stills2/ (wide stones, 100 px pieces).

## The rule as coded (src/game/w1CutArt.ts)
- Logs 50-89 px (THICK_LOG_MAX): the two thick painted planks, their tops levelled in the sheet by tools/art/flattenlogs.py (within 1.3 px).
  Each piece is scaled by the log's height (top on the collider top, body to the foot + 3 via the frame's fb row); thickParts pieces of one
  length; drawn right to left so each piece's rounded end lies over the next. Under 50 unchanged (the thin ledges).
- Stones: up to 260 unchanged. 261-400 wide (STONE_W_MAX) and under 90 (BANK_FROM: from 90 the bank painter already paints them) are laid
  as stoneParts pieces about STONE_PART_W (100) wide, flat-topped stones only (never a boulder or stump); the end pieces are the ones whose
  art reaches least past the end (ENDS_SLACK). A wide stone is never moved and its roll never refused (settleCut): where its pieces would
  reach past their ground it gets cut '' (no piece), pipeline.ts settleLaid's rule.
- Sheet re-encoded at q95 (other pieces: 77 visible px move > 8/255; +35 KiB).
- Tests: w1CutArt.test.ts (2 new), paintFall.test.ts (the old '266 RED' pin now the new rule: 266 GREEN, STONE_W_MAX+1 RED; thick logs GREEN);
  red on the base (planted), 29/29 green here with w1Overhang.test.

## Named, not fixed
- LIVE defect, the lead put it on the roadmap 5:39 PM: w1-rock-block-big's painted top is flat across ~280 of 291 px but its stand span is
  95-257, so every block-big draws a walkable-looking top ~0.4x its width past each collider end (over ground). Not changed here.
- The thick planks are soft (60 px frames drawn 70-140 game px): item 4.
- The code box's mushroom/worm/leaf dressing goes with it (the lead: fine).

## Lessons applied
D30 (every time from date), D57/D87 (inbox read at every push), D62 (stills labelled by the built seed: one before-shot built 9652 and was
re-shot), D79 (whole-screen pass: found the block-big top), D81/D86 (drawcheck + the full list handed on, not skipped), D90 (lean reads), law 22
(OVERHANG_MAX not loosened: the misses were fixed by narrower end pieces).

## Learned
- Painted cuts can be crooked: check a frame's top line by its alpha before laying it as a floor (flattenlogs.py --check does it).
- A piece blown past its painted size reads blurry; a wide block is better as several normal-size pieces.
- A new pick can MOVE a stage through settleCut: a look change needs a field-level diff (cut vs everything else), not just the lock's hash.
- This container cannot reach huggingface.co: HF results come back only through context. Budget it, or give it its own member.

## Method update (proposed)
- level.md / stage-piece.md: "a new painted piece on an existing block is a look only: never moved, the roll never refused; no fit = no piece".
- gates.md: the lock names stages, not fields; keep a field-diff tool (tools/engine) for draw-only packets.
