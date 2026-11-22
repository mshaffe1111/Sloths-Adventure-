# ENG-WALL REPORT (R-165.380; start 7:03 PM ET by `date`; branch t-eng-wall off 484199316)
EXACT NEXT STEP: (a) at the x 20006 corner is in NO fill or picture drawProtoScene makes on 484199316 (measured, item 2 ii-c): in the
squares, x 20000-20025 y 1600 is one soil cell under one clip with equal darkening both sides; over the squares the frame draws only
the stamped squares there. So the band is from (1) t-art-under's w2.webp sheet (ENG-GROUND's stills were on that scratch merge; my
probes ran on the repo's sheets), or (2) a draw outside drawProtoScene (engine scenery or water). Next: a 2x still of that corner on
the scratch merge, sample its pixels in the band and left of the floor's end, then turn the engine's draws off one at a time to name
the source; bring the lead that and a plant RED on 484199316 before any fix. Separately: the two wide walls' unshaded soil (item 2 ii).
THE LEAD'S RULING on the pushback: what is ruled is the LOOK (no straight shade seam at a floor's end on the game's screen); the fix
follows the measurement. If the band is in t-art-under's sheet (the under corner), the fix is in how that piece is drawn or cut: name it.
THE BASE SUITE (item 1): when its verdict lands, check whether any red is groundStack.test.ts (the file copied in, D115); if one is,
re-run that file alone on a clean frozen tree at 484199316 before the verdict counts.

1. Step 0 (D114): the CLAUDE.md suite on 484199316, frozen worktree, in the background: tsc PASS; tests still running at hand-over
   (scratch suite-base.test). BREACH (D115): I copied a test file into that frozen worktree for about 10 s to re-check plant (i) RED,
   while the suite ran there. Restored at once (git checkout); its verdict must be read with that in mind: if any of my plant names
   ('own aspect', 'no seam at the floor's end, ', 'no water fill shows', 'ground's squares') shows in it, it read the touched file.
   The base check that followed was done in a second worktree (base2).
2. PLANTS, each RED on 484199316 (D96), kept as files until the fix that greens them (plants-R-165.380.ts.txt, 4 blocks):
   (i) no wall's face stretched past its frame's aspect (both ways) nor showing past its bank's span. TILE_STRETCH 1.1 cites
       STAGE-RULES.md:275 ('no texture stretched in strips') + 10% beside the constant (D116). red-i.txt: 7 walls normal, x3.31-3.80,
       each 164 past a 60-wide column; NEW: seed 2's wall x14604-15024 squashed to 244x36 (x6.59 the other way).
   (ii) the soil below a lower floor darkens from that floor's top. Live path: red-ii.txt (0.36-0.45). The lead's ruling: read the
       squares the game draws: chunkDark hands paintTile recording canvases (document.createElement swapped for the run) and reads each
       square's own fills plus the frame's last-call fills. My first chunk run (0.18-0.70) was WRONG: inclusive box edges counted a
       16-unit strip twice at its edge, it kept the live fallback draws of the calls before the squares were painted, and it compared
       points where a stacked leg leaves no soil. Fixed: half-open boxes, the frame's last call only, soil both sides. red-ii-chunks.txt
       on 484199316: easy PASS; normal RED on 2 wide walls only (14604-15024, 13775-14415: 0.45 at floor+40, the wall's soil there
       has no depth band). Every narrow descent wall, the x 20006 corner included: equal darkening both sides, no step.
   (ii-c) probes (not committed: scratch zzProbe, deleted): at seed 1 normal, view 19706-20506 x 385-1950: squares at
       (20000|20012|20025, 1600): the soil cell src 1027,3,1018,1018 only; the frame over them: the stamped squares only.
   (iii) no water fill shows past a wall's end face inside its bank (stage.waterY, drawn across the view by engine
       drawWaterAndFlags): red-iii.txt, 6 walls, 170-184 spots each below the water line. Not fixed.
3. FIX (i), the lead's ruling (A), commit 5a8f86166: protoArt drawWallFace: the wall frame once at its own shape (244 x 244*h/w), drawn
   by drawBankArt INSIDE the soil's outline after the soil, its foot faded over the lower 45% (WALL_FADE) on a copy baked once per world
   (wallFaces, keyed by the sheet; nothing new per frame), plus the yard-side lip strip (x-14..x-1) clipped in drawGround (World 5 keeps
   its cut to the face). The old blit before the soil is gone. Plant (i) GREEN; ground tests (groundEnd, groundSeams, groundStack,
   groundwork, riverLook, riverTail, w1Pits, puzzleGateWall) 68/68 (green-i-ground68.txt); tsc PASS; generalitycheck PASS.
4. NOT DONE: puzzle rooms (puzzlePlay 2093, 2482 still call the old stretched drawWallArt: a wall over a door, no bank soil behind it,
   so it needs its own treatment, not the fade); (ii) and (iii) fixes; stills (none shot: Polish check below is empty); lockall
   --intended; drawcheck; the gates incl. CI's (coveragecheck, registrycheck, tipwalk: D96).
Polish check: none. No stills were taken, so nothing is judged and nothing can land.
Learned: the test recorder has no getTransform, so drawProtoScene in a test never reaches drawGroundChunks; a ground plant must read
the squares (chunkDark) or it proves only the fallback path.
Lessons applied: D96, D102, D111, D113, D115 (breached once, item 1), D116, D40 (puzzle rooms left for their own step).
