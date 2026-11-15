# ENG-LOOK2: 1-8 toward link #5 (t-eng-look2 from t-eng-look@0449e838). Report 11:55 AM ET 11-15, context ~40% (estimate)
**EXACT NEXT STEP (in order; the look is the lead's to take to Matt first):**
1. drawcheck on cacf67d4 ran here (results below); then 1-8 SIDEWAYS at x 24036 and the 1-98 fixture (`node tools/perf/drawcheck.mjs 1-98`
   plays any extra stage id), WITH ENG-DR's dressing (merged). A breach prints its call sites: the bough adds one drawImage per tile.
2. 1-8's data: `git merge origin/t-build-18b` (9f7d54bd: the keeper's lines, Dot's beforeX, the book test); give w1Arc18.ts's
   `w1-18-still-fork` and `w1-18-tip` bricks `entry: { piece: 'in', kind: 'ground', join: 'walk' }` (brick() builds entry at w1Arc18.ts:112:
   add an option); then `npx tsx tools/engine/seedlist.ts 1-8` (relist), castBots 1-40 both settings (kid/child/middle/expert), lockall
   (`--intended 1-8`: expect 1-8 only), the WHOLE suite alone (3 shards, timeout = its length). Then the proof: stills + clip both ways,
   Normal + Easy, a caught run and a clean run (tools/engine/runs/chase-clip.mjs; add a `caught` mode: stop holding right mid-stretch).
3. Look items named below (rough spots 1-4) go to the lead as packets; (4) is 1-8 data (Content).
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
- 5 drawcheck: see below. 6: NOT done (step 2 above).
## Polish check (frames: reference/qa-reports/ENG-LOOK2/stills/{first,second,third}/, clips/)
third/b7-...-x5400 both ways: a step between boughs, higher end rounded over the lower, no chevron, knots, swelling underside. x13900: the
dip, mist under, stair as bough stubs (ROUGH 1). x34200: tip tapers in the same bark to a rounded end at the lip; far branch starts living.
clips/1-8-L1-stretch1-normal-{sideways,upright}.mp4 (frames sheet beside): the bough continuous through the run, no seams seen.
ROUGH, named: (1) the dip's climb-out stair reads as a stack of stubs (pit-with-stair geometry on a branch level); (2) a baked bank beside a
stretch keeps a joined end after the stretch falls (no re-bake per fall, for frame cost); (3) cracked sections only quiver (no crack art);
(4) hanging moss under the bough (condition c) needs dressing rows in 1-8's data; (5) the backdrop's waterfall lines read as thin verticals.
## Pushback
- The lead's (1c) "or" was both: a cut bank still counted as a wall leaves the rock's art over the hole once it falls; the settle after the
  lay alone keeps it drawn into falling earth. No piece fits the stair rock's standing ground, so it draws as its ground (named above).
## Suggestions (ready packets)
- BOUGH-FALL: re-bake only the square holding a bank end when a neighbouring section falls (end kinds in the chunk key per square).
- BOUGH-CRACK: the crack line on a cracking bough section (the sheet's chaseCrack lines erased/painted in the bough's bark).
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
