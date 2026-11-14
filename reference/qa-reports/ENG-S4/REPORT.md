# ENG-S4 REPORT (t-eng-s4 from origin/t-eng-s3@dd252669; packet reference/packets/2026-11-14/ENG-S4.md on the lead's branch)
Start 8:00 AM ET. Code head **99b7fb56**. Context at the report: about 25% of the 1M window (my estimate; the lead has the real figure).
Nothing left running at the stop (D59): GATES below.

## Done-items
1. **The snake view verdict counts the level's top (and foot), both ways** (vineSnake.ts snakeViewFaults; cameraFollow.ts usualZoom,
   settledView, VIEW_PHONES).
   - `usualZoom(w, h, levelH, wide)` is engine.ts applyZoom's own base zoom now (applyZoom calls it; PORTRAIT_VIEW_W moved beside it),
     so the verdict judges the zoom the screen plays. `settledView(w, h, levelH, widen)` gives the view's height, the HUD band in world
     px and the least/most its top may be (a normal stage never shows past its top; upright a swing's widened view may show sky over a
     level shorter than the view). A test pins it to the REAL engine at rest on a 520, a 900 and a 1600 px level, every phone, both ways.
   - The verdict takes the liana's site (`{ anchorY, levelH }`: snakeFaults passes the Vine's topY and the stage's levelHeight) and
     judges on the phones the framing names: the squattest sideways one (782x288) and three upright ones (320x782, 390x844, 412x915),
     each upright view at no widening, at SWING_CAM.out and where it first shows sky. Two rules: the snake in the clear view SNAKE.seen
     (1 s) before it reaches his hands (or all it gives at a high hold); and, NEW, wherever the focus box fits the clear view's height,
     the whole tell in it (a tell no view can show is no tell, PREDATORS §2). The second rule is what refused 412x915 held at 200 on
     6-3's geometry (the trip was in view 1 s+ while the tell hid behind the HUD).
   - **The upright 0/6 cause, confirmed on the page:** on a 900 px level at 412x915 the zoom is floored at h / levelH, so the view IS
     the level (camera top pinned at 0); the 138 px HUD band covers 6-3's anchor (124) and its tell (top 64). Same root as sideways:
     the level's top. Shot labels print it (view top 0, band 138, tell top 64).
   - Tests (snakeCam.test.ts, 11): 6-3's REAL first liana with a 7 s trip is refused, naming 782x288 sideways and an upright tell 0 of
     N frames; hung 176 px lower (300) it passes; on the real engine with 6-3's geometry the tell is 0 frames on all 5 phones and the
     verdict refuses each, and hung at 300 the engine shows the tell >= 90% held high and the snake >= 1 s held low on all 5.
   - ENG-S3's M9 made discriminating: the false lianas keep their laid swing data, so only levelCheck's own filter leaves them out
     (red without it).
2. **SNAKE-LAY** (gen2/snakeLay.ts `laySnakes(st, table, easy)`): 1-4's finish pattern (finish14): a world's table names, per section
   template, which of its lianas (by piece key; the stage's brief must be tagged, GraphBrief.tags) carry a snake: route, beat, reach,
   stagger; Easy rows ('none', or Easy's own values; 1-6.md: none rise on Easy). It lays them, lists each beat once, makes a false liana
   hang still (swingAmp 0: its tell), and THROWS when snakeFaults refuses the result, so an unfair roll is never listed. Named errors:
   an untagged stage, a climbing vine, a beat not in the table, a beat quicker on Easy. Easy's beat is Normal's stretched, never less
   seen, so the view is judged on Normal's (written in the file). Tests: snakeLay.test.ts (4).
   **NODE letter `n`** (gen2/nodeLetters.ts): "Vine snake", key later (no emitter keyed by a letter: the lay is a stage finish, named in
   `unlaid`), dials route down-off|down-back|up|still (still = a false liana), reach, beat; its Pieces row (Must / Never). NODE-KEY.html
   rewritten by tools/engine/nodekey.ts; nodeLetters.test.ts pins n.
   **Brown catalog rows** (reference/art/catalog-rows-eng-s4.csv): hf678/w16-vinesnake-hang-brown and -slide-brown, the master's 30
   columns, in the green cuts' own engine slot (a "false liana" slot of 2 pieces made a new World 1 gap: the inventory test refused it,
   and it is the same snake). Proven: t-art-678b's CATALOG-MASTER.csv + these 2 rows through `python3 tools/art/catalog_master.py --emit`,
   inventory.test.ts 9/9. NOT appended to the master here: t-art-678b appends 26 rows at the same end of the same file (a merge
   conflict). INTEGRATOR: after t-art-678b, `tail -n +2 reference/art/catalog-rows-eng-s4.csv >> reference/art/CATALOG-MASTER.csv`,
   then `python3 tools/art/catalog_master.py --emit`, then inventory.test.ts.
3. **Item 3, in part.**
   - (b) **LIANA length per row**: the swing rule takes `len` (gen2/types.ts), the pipeline lays it (rolled ONLY when a row sets one,
     so every shipped roll is unchanged: the lock below); `w1Liana(key, after, gap, len?)`. Test (w1Swing.test.ts): a 420 px row on all
     three W1 gaps, both settings, 3 rolls: the length reaches the liana, the anchor and reach rolls are the plain row's, the perch still
     flies at the row's grip.
   - (c) **LONG with a dial: NOT built, pushback.** 1-6.md (origin/t-16-design, its REVISED 11-14 lines) lays LONG "under it on Normal
     (340-364, no dial: A1 pushback c)" and says "A 240 px bough is never laid past ~340 (cap-seen.out.txt)": a dial brings the far-end
     cap (SWING_SEEN 414, the whole perch in view as he presses), and a 220-260 px LONG perch under it lies no further than dial-free
     LONG already does. The dial buys nothing; the design source says no dial. Lead to rule if it wants it anyway.
   - (d) **Chains: NOT STARTED** (scope cut to keep the full gates; EXACT NEXT STEP 1).
4. **Planted** (planted.out.txt, plant.sh): M1-M6, M9-M13 every one RED, the tree restored after each. (M7-M8 are ENG-S3's numbers,
   not reused.)
5. **Lock**: base recorded on dd252669 (3264 builds of 102 stages). --check on 99b7fb56: see GATES.

## GATES on 99b7fb56 (its own worktree; gates.out.txt)
(filled from the run: see the GATES section at the end)

## Polish check (real page, 6-3, Normal from localStorage (unset); shots/, shot.log; every label prints what the game built, the level's
top, the view's top, the HUD band, the clear view, the widening and the verdict on that phone)
- **6-3 as laid (anchor 124 under a 900 top): FAILS, as the verdict says.** Sideways 782x288 tell 0/4 (still), 0/23 (clip
  sideways-782x288-anchor124-hold200-clip.mp4): the snake rears behind the HUD's timeline sign. Upright 412x915 0/6: the same, the view
  pinned at the level's top. Verdict printed on both: REFUSES.
- **Hung 300 down (the same liana moved 176 px lower AT RUNTIME: no lay hangs one there yet): the verdict ALLOWS and the page agrees.**
  Tell whole in the clear view 5/5 (782x288), 4/4 (915x412), 5/5 (412x915), 5/5 (390x844) stills; clips 26/26 sideways (782x288) and
  22/22 upright (412x915). The clips show the whole action (D63): he swings, the green snake rears on the leafy bough, mouth open, in
  clear view; it comes down HIS liana; it reaches his hands; he lets go with a hop; he lands on the moss; lives lost 0 (read from the
  game). Judged from contact sheets of every 13th frame and the full-size stills (shots/*-1-tell.jpg).
- Named rough spots (harness, not the game): the liana is moved at runtime, so 6-3's petals float beside it and the ground under it is
  cleared (a hole in the swamp floor upright); a pale hard-edged rectangle in 6-3's far backdrop shows at the top middle of the
  sideways 782x288 still (camera top 24): 6-3's own backdrop art, not engine (not checked further).
- **My own miss, caught and fixed before reporting:** the first clip run put the shooter's moss (liana foot + 140) under 6-3's water once
  the liana was lowered: Pokey drowned after the let-go and the old label still read "DOWN ON THE MOSS (no heart lost)". The shooter now
  keeps its moss above the water and reads lives from the game; the 4 stills carrying the old unverified label were deleted; the clips
  were re-shot. Also: two clip runs died because my planted mutations edited src/ while the shooter's vite served it (the page reloaded):
  re-shot after the plants (Method update 2).
- NOT shot on the page: a low hold (380/400): the page harness never caught him on the lowered liana at those holds (he fell past it).
  The low hold is proven on the real engine in the unit test only (hung 300, held 400: snake in view >= 1 s on all 5 phones).
- Stills are JPEG q90 (converted from 2x PNG after shooting: 28 MB -> 7.3 MB).

## Builder note: what 1-6 can lay now
- Lianas: W1_SWING_SECTIONS (SHORT / LONG / FAR, withSwing on the kit), each row's length via w1Liana's 4th argument (1-6.md's measured
  liana is 420; LIANA.len 410 otherwise).
- Snakes and the false liana: a 'w1-16' kit whose brief is tagged and whose finish (listed.ts FINISH) calls
  `laySnakes(st, W1_SNAKES, difficulty === 'easy')` with a table by section template id and liana key. It refuses the roll, by name,
  when a snake is unfair. **The numbers it holds a lay to (depth-table.md, the verdict on all four phones):** a snake from the bough needs
  its liana's anchor **at least 270 px under the level's top** and a trip of **6 s or more (down-off) / 7 s (down-back, reach 0.6)** on a
  410 or 420 px liana with a 0.6 s tell (5 s is refused at any depth); a riser ('up', reach 0.7) lays anywhere 40 px down or more.
  **Today's 1-6 lianas hang 132-222 px under a 900 top** (the stage table's current 1-6 roll; the anchor is 400-420 over its take-off bough), so a
  liana carrying a snake from the bough needs its take-off bough about 670-690 px down a 900 level or lower (or the level taller: the
  depth under the top is what counts, not the height). 1-6.md beat 7's "a whole swing (2.85 s) before it reaches his grip" is under
  what the verdict asks: lay 6 s+.
- The false liana is drawn its liana's length (ENG-S2): a 410 px one draws the snake 4.6x Pokey's height. ENG-S2 recommends 115-170 px
  (1.29-1.91x). OPEN for the lead / Designer: a false liana short enough to read as a snake, or long enough to pass for a liana.
- NOT layable yet: liana-to-liana chains (beat 4, the gorge): gen2 lays a perch between every two lianas.
- 1-6 must join drawcheck and every stage-walking gate the day it is built (D51).

## Pushback
- (c) above: no LONG dial (the design's own revised text).
- The verdict now refuses every snake from the bough on every liana the game lays today (all hang 74-222 px under the top: 6-3, 6-1,
  2-4, 1-6's roll). That is the level's geometry, not the camera: D40 says fix the lay (hang the snake's liana lower), not let the view
  show past the level's top. If the lead wants the camera to show sky over the top while a snake threatens, that is a ruling (it moves
  every liana stage's view) and a new packet.

## Unresolved
1. Chains (item 3d) not started. 2. The catalog rows are a rows file, not yet in the master (integration step above). 3. Real-page low
hold not shot. 4. The false liana's drawn length (OPEN above).

## Method used / Lessons applied / Method update / Learned
- Method: reference/methods/stage-piece.md (data first: the lay by a world's table, a letter in nodeLetters.ts and nodekey.ts; planted
  tests first; look at it both ways; gates in their own worktree), gates.md.
- Lessons applied: D19 (the verdict calls applyZoom's own usualZoom; settledView pinned to the real engine at rest), D40 (the verdict and
  the lay, no camera stopgap past the level's top), D43 (any stage: site and phones are data; no stage id), D49/D60 (the LONG pushback
  quotes 1-6.md's lines), D51 (named for the builder), D57 (queue read at every push: empty each time), D59 (gates waited for in their
  own worktree), D61 (rough spots named, none passed as noise), D62 (labels print what the game built and the verdict on that phone),
  D63 (clips of the whole action; the drowning was caught on the clip, not a still), D64 (context % from the 1M base), D65 (judged the
  green snake on the tan liana in the stills: it reads).
- Method update (proposed for stage-piece.md step 5 and the shooters): (1) a shooter that moves a piece at runtime keeps whatever the
  action lands on above the stage's water and reads lives/hearts from the game before any "no heart lost" label (my first clip drowned
  him under a passing label). (2) Never edit src/ (planted mutations included) while a vite-served shooter runs: the page reloads and
  the run dies (cost: two re-shoots); §0t's "never edit the tree while the gate script runs" extends to shooters. (3) A camera promise's
  verdict models the level's top and foot through the zoom function applyZoom itself calls, and a test pins it to the engine at rest
  on a short, a tall and a sideways-short level.
- Learned (for the next builder): the depth table; a snake from the bough is a level-geometry decision (anchor 270+ under the top),
  made when the sections are laid, not after.

## Turnover
reference/handoffs/engine-core.md §0x (this commit).

## EXACT NEXT STEP
1. **Chains (1-6 beat 4, the gorge):** gen2 types: a swing place whose `after` is a liana (`{ kind: 'swing', after: '<liana key>' }`);
   pipeline swing branch: the next anchor past the previous liana at a spacing where pressWindow(A, canGrabSwing on B, LETGO_FLIGHTS)
   (physics.ts chainPhase's own measure, :855) gives LIANA.window or more on the setting, B's phase chainPhase(A, B) (swingSetup does
   it at stage start, :601-623); no perch or pit between unless the row asks (the soft pit under the whole chain, backPit). levelCheck:
   vine nodes: ledge -> A (today's catch), A -> B (a chain catch: canGrabSwing over A's release flights, >= 6 lines as swing edges),
   B -> ledge (today's swingLandingsIn from B's hold); a test from 1-6.md beat 4 (SHORT, SHORT, LONG) on W1 and W6 kits, both settings,
   planted; lockall unchanged (no shipped stage lays a chain).
2. Integrate: t-art-678b first, then the rows file (step above). 3. The 1-6 builder: the builder note.
