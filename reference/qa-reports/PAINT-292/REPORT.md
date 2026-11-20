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

## PAINT-292b: the gates on the final head (written 7:35 PM ET 11-19)
Final code head **25c23536** (t-paint-292; this section's commit is docs only). Base for the lock and diffs: ce4ad461 (t-int-12; src = t-gate-292 65a5fc21).
No art changed; src: only the ruled first-run re-record (below). HF plank upscale (EXACT NEXT STEP 4): dropped by the lead's ruling, not attempted.

| Gate | Head | Result | Log / numbers |
|---|---|---|---|
| paintcheck 1-1,1-6,1-9 --known --unpainted | cf917b7b (src = 95bafdd0) | PASS | 722 builds, 0 breaches, 0 unpainted |
| 46 ids off paintcheck.known.json (42 of 1-1, 4 of 1-6; 1-9 had none) | 95bafdd0 | done | 429 -> 383 ids |
| paintcheck --part 0/3, 1/3, 2/3 | 95bafdd0 (src as 25c23536 bar a 1-1 lock constant) | PASS x3 | 1714/1860/1760 builds; 170+107+106 = 383 known ids seen, none stale |
| lockall --layouts 16 vs ce4ad461 | 95bafdd0 src* | PASS | 99/102 unchanged; 1-1, 1-6, 1-8 'platforms' only (intended) |
| field diff (cut stripped), every World 1 listed seed, both settings | 95bafdd0 src* | draw-only | 2054 builds; every part equal with cut stripped; cut moved on 1-1 261, 1-6 200, 1-8 100 builds |
| castBots 1-1, 1-6, 1-8 seeds 1-10, all 5 bots, both settings | 95bafdd0 src* vs ce4ad461 | unchanged | 90 runs each, JSON byte-identical base vs head (proof: same rows, cmp) |
| seedlist --check 1-1 | 25c23536 | PASS | 161 seeds (on 95bafdd0: FAIL first-run.drift Easy; fixed below) |
| seedlist --check 1-2..1-9, 2-1, 2-2 | 95bafdd0/25c23536 | PASS | 100/100/100/150/100/100/100/100, 100, 100 seeds |
| tsc | 25c23536 | PASS | |
| suite, 3 shards | 25c23536 | PASS | 3840 tests: 3838 pass, 0 fail, 2 todo (18:45-19:30) |
| vite build (BASE_PATH) + chunkcheck | 25c23536 | PASS | |
| artcheck, knowncheck, generality, roadmapcheck | 25c23536 | PASS | generality 26/26 known |
| drawcheck (all stages) | 25c23536 | PASS | 753 s; screens 1-1 land 5.32 / port 5.40, 1-6 land 5.29 / port 4.98 (limit 7.5); calls 49-86 (limit 400) |
| clipcheck | 25c23536 | PASS | 83 known, 273 s (first run under suite load: 3 goto timeouts, exit 2; re-run quiet: PASS) |
| kbdcheck | 25c23536 | PASS | 136 s |
| buildcheck | 25c23536 | PASS | 1-1 p95 normal 107 ms, easy 57 ms (budget 150) |
| engine tool tests (gates.yml rolled list) | 25c23536 | PASS | 234 pass, 0 fail |
| tipwalk --layouts 4, registrycheck, coveragecheck | 25c23536 | PASS | registry 11 lists |
| tierBots.test | 25c23536 | PASS | 7 pass |

\* 95bafdd0's src = 25c23536's but for firstRun11.ts's lock hashes, which only verdicts.ts firstRunVerdicts reads (grep: every other reader uses its seed and plan), so no build differs.

**The red and its fix (lead's ruling):** seedlist 1-1 --check failed first-run.drift on Easy (91fcb58a12c2c26a recorded, a9525e8f62636c3a built). Traced: base
rebuilds both old hashes exactly; on the head only 'platforms' moves, and with every cut stripped both trees hash alike. The one change: platform 44 at
x10051, a 266x54 moss_stone, now cut 'w1-rock-root-block' (the bar's item 3 working). Easy re-recorded in src/game/gen2/firstRun11.ts with its proof line
(25c23536); proof: firstrun-lock.txt + firstrun-lock.mts here.

**Polish check:** none of mine: no art or look changed; the stills are PAINT-292's (showfirst/, stills2/), approved by the lead.
**Pushback:** none. **Unresolved:** the HF upscale of the two thick planks (a later art job, the lead's ruling). **Turnover note:** none written (the packet's
WRITE list is this REPORT); suggested line for handoffs/engine-core.md §3 below.
**Lessons applied:** D30 (times from date), D57/D87 (inbox at each push), D59 (no gate left running), D86 (the full list, plus CI's extras), D90 (only the
EXACT NEXT STEP read; logs to files), D91 (check && commit in one chain).
**Learned / Suggestions:** (1) a draw-only change still moves 1-1's first-run lock: stageParts hashes 'platforms' with its draw field 'cut'. Either hash the
lock without draw-only fields, or name it in every World 1 draw packet's checks (engine-core.md §3 trap). (2) clipcheck under the suite's load (4 CPUs, load
~15) times out on goto; run it after the suite, never beside it (gates.md pitfalls). (3) a src edit mid-run invalidates every running gate: restart them.
**Method update (gates.md, proposed):** add (2) and (3) to "Pitfalls we already paid for".
