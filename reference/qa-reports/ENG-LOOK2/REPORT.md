# ENG-LOOK2: 1-8 toward link #5 (t-eng-look2 from t-eng-look@0449e838). Report 11:48 AM ET 11-15; real context ~50% (the lead's read)
**EXACT NEXT STEP (the lead 11:44 + 11:48 AM; a fresh member from e403928f or later; my real context ~50%, past the box):**
1. **(m) the dip's stair (x 13900, layout 1, both ways): the worst thing on screen.** On a bough stage each stair step is its OWN short
   branch stub, rounded at BOTH ends, mist visible between steps; where a step meets a bough it grows out as a fork, never a square notch.
   Where: protoArt.ts drawBoughGround / boughEnds / eraseBoughEnd (BOUGH_END_MIN). Today a step whose end touches a higher or lower piece
   is 'under'/'living' and narrow steps (< 160 px) are capped at a third of their width, so stacked steps (1-8 L1: ids 52/51/50 at x 14000
   over the floor 49) read as merged blocks. Try: a boughPiece narrower than ~2 thicknesses draws as a stub (bough slice, both ends rounded,
   its body trimmed to ~0.6 of BOUGH_THICK so the mist shows between steps), never extended under another. If the geometry can't take it,
   ask the lead (they will rule on whether bough stages lay pit-stairs at all).
2. **(k) no exposed end is ever a straight vertical cut:** x5400 sideways right edge ~1800 px (and the piece under it ~1755-1830); x34200
   sideways the far branch's LEFT end ~1353 px (it IS 'living', but the cap's ellipse (ry 0.62 T) barely rounds a full-thickness end: give
   the living cap a real taper/round, e.g. ry 0.5 T centred at 0.5 T, and round the underside corner); x13900 upright several pieces.
3. **(l) the tip's underside (x34200, ~560-675 px, y 470-590) is stair-stepped:** drawBough(taper) slices at 3 px still step because each
   slice's height is a whole drawImage; draw the taper at the section bake's full screen resolution with a per-pixel column (or bake the
   straight bough into the section canvas, then reshape it with a destination-in path along the taper curve: one smooth edge).
4. Then x13900 + x34200 both ways again (`PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/runs/stills-at.mjs 5199
   <out> b8 1-8 1 13900 34200` with `npx vite --port 5199` up; never save a src file while it shoots) to the lead.
5. drawcheck (results of my run on cacf67d4 below), then 1-8 SIDEWAYS at x 24036 and the 1-98 fixture (`node tools/perf/drawcheck.mjs 1-98`).
6. 1-8's data: `git merge origin/t-build-18b` (9f7d54bd); in w1Arc18.ts give `w1-18-still-fork` and `w1-18-tip` `entry: { piece: 'in',
   kind: 'ground', join: 'walk' }` (brick() builds entry at w1Arc18.ts:112: add an option); the crack art on a cracking bough (rough 3) and
   the hanging-moss dressing rows (rough 4) go with this data step; then `npx tsx tools/engine/seedlist.ts 1-8` (relist),
   `npx tsx tools/inspect/castBots.ts --stage 1-8 --seeds 1-40` both settings, `npx tsx tools/engine/lockall.ts --layouts 16 --intended 1-8
   --check <lock of the base>` (expect 1-8 only), the WHOLE suite alone (3 shards, timeout = its length). Proof: stills + clip both ways,
   Normal + Easy, a caught run and a clean run (tools/engine/runs/chase-clip.mjs; add a caught mode). Do NOT touch hf18-palm-crown (Matt
   flagged it; a new art job replaces it).
Rough spots and owners: (1) = (m) engine; (2) a baked bank keeps a joined end after its neighbouring section falls (engine, packet
BOUGH-FALL below); (3) crack art on a cracking bough (the 1-8 data step's engine member); (4) hanging-moss rows (1-8 data, Content);
(5) the backdrop's waterfall reads as thin verticals (Content, art).
## Done-items
- **1 (1c) ffa353e3:** groundRun counts no chase section as a wall; pipeline.ts settleLaid re-runs the kit's settle after the chase lay (all
  three paths); a stone no piece keeps on standing ground is drawn as its ground (cut ''), never moved, the roll never refused. Planted red
  first: w1Overhang.test 'groundRun: a bank the chase breaks...' and chaseLay.test 'ENG-LOOK2 (1c)' (84 px past with settleLaid a no-op).
  w1Overhang 1-8: 23 -> 0. Lock at the (1c)+(2)+DR head: 101/102 unchanged, 1-8 (intended): platforms.
- **2 68cf8d29:** SectionTemplate.entry.join 'walk' (types.ts) laid by the join roll, its draw still made, pacing skipped. Planted on 1-8's
  REAL row (entryJoin.test, seeds 1-6): asked-but-ignored rolled walk,pit,pit,walk,step,...; with it every join a walk. No brick asks yet.
- **3 6dd25d90:** layTip marks the far branch `pit: 'drop'`; w1Pits chaseGaps honours it; w1Pits.test holds 1-8 to 0 unmarked falls (the
  deleted builder's >= 10 pin gone: stricter, law 15) and to exactly one marked drop, the far branch. Planted: chaseTipLay.test 'ENG-LOOK2 3'
  red (no drop) -> green. w1Pits.test + chaseTipLay.test 26/26.
- **4 0244dca5..cacf67d4:** t-eng-dr merged clean (1ddc1263). ONE HF job (~$0.28, HF-SPEND.md); hf18/hf18-bough catalogued at scale
  (pokey_scale 1.45, CATALOG-MASTER + emit). WorldManifest.ground.look 'bough' -> GeneratedStage.groundLook (kitLib18, the fixture kit);
  protoArt.ts: banks baked as the bough by world x (3 variants, no mirroring), chase sections the same bough (baked per section when they
  have an end), ends by what meets them (joined / step: lower runs under, higher living / torn: splintered erase in the bark / living:
  rounded), the tip the bark tapering, mist band under the bough line (one drawImage), no pit paint and no soil on a bough stage, thin plain
  steps bough too. SHOWN FIRST 11:22 (first set); the lead's A + (f)-(j) done; third set 11:44.
- **5 drawcheck on cacf67d4 (frozen worktree, all 13 scenarios both ways): PASS (588 s).** 1-8 sideways (land): gradients 0.00 (BUILD-18's
  head 6.88-8.25 > 2), drawImageScreens 5.60 / 7.5 (was 10.04), calls 229.56 / 400; upright 5.36 / 7.5, gradients 0. Its spots were
  x 12449 / 24988, not x 24036, and the 1-98 fixture was not played: both still owed (step 5). Targeted tests on cacf67d4 (chaseLay,
  chaseTipLay, w1Pits, w1Overhang, entryJoin, chasePiece, invDress, stageBackdrops, w1Arc18, w1CutArt): 90/90. Art/inventory tests 16/16.
  Fast gates on the branch: tsc, knowncheck, generalitycheck (26 known, 0 new), artcheck PASS; roadmapcheck could NOT judge (shallow clone).
  The whole suite was NOT run. 6: NOT done.
## Polish check (frames: stills/{first,second,third}/, clips/) / Pushback / Suggestions
third/x5400: step, higher end rounded over the lower, no chevron, knots, swell. x13900: mist under; stair = (m). x34200: tip tapers in the
same bark; far branch living (but see (k)). Clips: the bough continuous through the run. Pushback: the lead's (1c) "or" was both (a cut bank
still counted as a wall keeps the rock's art over the hole once it falls). Suggestions: BOUGH-FALL (re-bake only the square with a bank end
when its neighbour falls, end kinds in that square's key); BOUGH-CRACK (crack lines in the bough's bark on a cracking section).
## Unresolved
Step 6 entirely (data, relist, bots, lock, suite); the full suite was NOT run on this head; drawcheck 1-98 and x 24036 not run.
## Method used / Lessons applied / Method update
stage-fix.md, render-fix.md, hf-art.md; level.md 21-29. Lessons: D19 (tests drive the real engine and RealPlay), D36 (frozen worktrees for
lock/draw/tests), D40 (the tip's mark landed with the look that paints it), D41 (MASS from Pokey's DRAWN 89.1), D57 (queue read at each push:
the lead's (f)-(j) taken at 11:34), D59 (nothing left running: see the end), D65 (every look ruling on the real still), D69 (clip frames named,
real touch pad), D75 (entry.join proven on 1-8's real row), law 22 (w1Pits rule made stricter, never loosened).
Method update (render-fix.md): "A ground look's shaped ends (tears, caps) are ERASED (destination-out) only inside a baked canvas, never live
(it cuts the backdrop); and a baked layer must not include pieces that change every few frames (chase sections), or the bake never
completes and the live fallback (no ends) is what ships." (hf-art.md): "hf_sandbox_fs cat of more than ~100 KB saves to a tool-results file:
pull pictures as base64 chunks that way, no context cost; grade a take to a sheet's palette in HSV (hue set, saturation scaled, value kept)."
## Learned (for the next builder)
A level's MATERIAL is world data (ground.look) and an engine piece; its proof is a still of every end kind (joined, step, torn, living) and
of every piece kind he stands on, both ways, before any builder lays on it.
Proposed level.md rule: "A stage's ground material is shown on a still of every end kind and every footing piece before laying (one material
on screen)."
## Turnover note
reference/handoffs/engine-core.md section 0LOOK2 (this commit).
