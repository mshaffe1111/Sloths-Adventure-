# ENG-WALL-b REPORT (R-165.380 continued; start 7:47 PM ET by `date`; branch t-eng-wall at c884525bf; box to 8:15 PM ET)
EXACT NEXT STEP: build the lead's ruling C (the frame never flips ground path) against the plant b/flip-probe.mjs, which is RED now.
THE LEAD'S RULING C, four conditions: (1) the plant covers the whole soil: first frame == settled within 1 luma (mean; worst 8-px
column <= 4) on a stage start, a respawn and the fastest descent, upright and sideways; (2) the cold paint measured at 4x CPU, riding
inside the respawn's own frames, never one frame over PERFORMANCE-RULES §1; drawcheck passes; (3) the prefetch margin sized from the
fastest fall/scroll, its constant citing file:line (D116); a square that can still be missing draws from the SAME darkening model,
never the live path; (4) the faint line left at x 20006 on the settled frame: FIX it (the lead saw it on the phone stills). PLUS (the
lead's still notes): (b) the floor's grass strip runs about 25 px past the wall column's right side and ends in a straight vertical
cut (upright CSS ~x585, sideways ~x495, right halves of b/corner20006-*.jpg): the floor ends under the wall's lip or the wall stands
behind the grass. Fix both in the same redraw as C, with before/after stills.
DESIGN (my read, not built): CHUNK 256 (protoArt.ts:1679), CHUNK_BUDGET 3 (:1688), maxFall 950 u/s (physics.ts:27) = 31.7 u a frame
at 30 fps; a 6-square row (sideways) paints in 2 frames at budget 3 while the camera takes 8 frames to cross a square, so ONE square of
margin ahead of the camera's travel covers the fall 4x. CAREFUL: CHUNK_BYTES 40 MB (:1686) keeps only 12 squares at 3.5x (each ~3.4
MB); a full ring of margin (upright ~5x7 = 35 squares) blows it, so the margin is DIRECTIONAL (the side the camera moves to) and the
cap must keep view + margin. Proposed shape: drawGroundChunks paints every missing square IN VIEW that frame (no budget in view, never
returns false for a missing one), spends CHUNK_BUDGET on the margin ahead; the cold burst (respawn/stage start) is measured at 4x CPU
(condition 2); if it breaks §1, spread it over the respawn's own frames (hidden behind its fade) and say so. drawGround's live path
then serves only the no-getTransform case. Re-run the 1-1 seed list and the tests that read the live path (the node recorder has no
getTransform: groundStack/groundEnd/... still exercise the live path; plant (ii) live stays a live-path test).
PLANT (b/flip-probe.mjs, `node flip-probe.mjs <port> <out> upright|sideways` on a vite of the tree): on the scratch merge (same chunk
code as 484199316: no CHUNK/drawGroundChunks/paintTile line differs) upright: cold x 19900 mean 2.09 worstCol 15.7, cold x 14800 2.89 /
7.5, descent x 18990 (40 frames from y 600 at maxFall) worst 7.2 / 12.9: RED. CONTROL (settled vs settled): 0 / 0, GREEN (the measure is
clean). Sideways: cold 19900 1.29 / 16.4, cold 14800 2.99 / 8.4, control 0 / 0, descent 12.0 / 32.6: RED (b/red-flip-scratchmerge.txt,
b/flip-*.json). Not yet in it: a real respawn (respawnAtCheckpoint, engine.ts:6163) and a stage start (the probe's cold case stands in
for both; condition (1) wants each by name).
D96: run it once on a vite of 484199316 itself before the fix (RED expected), then on the fix (GREEN), both ways.
(b) FACTS (browser, 2-97 seed 1 normal): platform 21 the floor x 18666-20006 y 1450 h 90; platform 26 the wall x 20006-20066 y 585
h 865 (its foot on 1450); nothing at that height right of 20066. The grass strip in the stills ends at world ~20067 (the wall
platform's right end), while the column's painted face wobbles at ~20034: the grass runs under the platform's full width and the
face is drawn narrower than its platform. Candidates, not yet measured: the floor's right end piece (GROUND_FRAMES end, cx ~0.94:
the part past cx overhangs the bank's end) or the wall bank's own foot/lip. Measure with the squares' recorder (chunkDark) at
x 20040-20066, y 1440-1458 before any change.
Scratch merge (never pushed): c884525bf + t-art-under 0ebcb8f7e's w2.webp, groundAtlasData.ts, inventory/w2.json, local e3bbf076a.

1. THE CORNER BAND'S SOURCE, NAMED (measured on the scratch merge, 2x, upright and sideways; b/corner20006-firstframe-vs-settled-*.jpg,
   left the first frame, right the settled frame): the band is the LIVE ground path, not the squares and not t-art-under's sheet.
   - protoArt.ts:1860 drawProtoScene: `if (!drawGroundChunks(...)) drawGround(...)`. drawGroundChunks (protoArt.ts:1736) paints at most
     CHUNK_BUDGET = 3 squares a frame (protoArt.ts:1688) and returns false when any square in view is still unpainted (budget out:
     `missing = true`), so that WHOLE frame is drawn by the live drawGround. The squares paint with `groundDepth = groundLine(banks)`
     (protoArt.ts:1825: the soil darkens from the ground line); the live path runs with groundDepth null (one gradient per bank from its
     own top, by design: the comment at protoArt.ts:1819-1820, PERFORMANCE-RULES §8). So on a live frame the wall x 20006-20066's soil
     below the floor's top (1450) is darkened from 585 and stands as a darker strip with a straight left side at the floor's end.
   - Measured (mean luma over 2 world units by 6, x 20010-20030 vs x 19982-20002, y 1460-1740; screen = (world - cam) x 0.936 x 2):
     upright first frame: band 68.1, left 85.6, STEP 17.5 (grass lip step 23.4); after 30 renders (squares in): band 74.1, left 76.9,
     step 2.7. Sideways: first 14.2 (lip 27.2), settled 3.8. Census by first src/ frame: the first frame has the live draws
     (groundPaint.ts, protoArt.ts:1443, sheetBake.ts) and no square blit; settled, the live draws are gone. Switching each of the 21
     draw sources off on a settled frame moves the step by under 1.3: no single scenery/water draw makes it.
   - The plant that sees it, RED on 484199316 (D96): plant (ii) live, red-ii.txt row 0: 'seed 1: the wall x 20006-20066 over the floor
     at 1450: a shade step of 0.36 across the floor's end at y 1490' (the live path). red-ii-chunks (the squares) is GREEN there: both
     are right; the game shows whichever path the frame took.
   - WIDER than the corner (the phone's view): live and squares differ over ALL the soil (left of the corner 85.6 live vs 76.9 squares),
     so any frame that falls back (stage start, respawn, a fast descent outrunning 3 squares a frame) pops the whole ground's shade for
     those frames, the band included.
   - The settled frame still shows a FAINT straight line at x 20006 (step 2.7 of about 77, ~3.5%; visible at 2x in the right half).
     Not judged fixed.
   OPTIONS for the lead (no fix built; the packet says bring it first):
   A. the live path darkens by groundLine too: one model (D80), but per-column gradients live: PERFORMANCE-RULES §8's per-frame limit
      (the reason it was dropped). Needs drawcheck proof.
   B. the live path keeps one gradient a bank, plus one for a wall's soil below a lower floor's top (plant (ii) live): the corner
      matches, the rest of the ground still pops between paths.
   C. (my pick) the frame never flips path: the squares in view are always ready: paint ahead of the camera (the budget spent on
      squares entering the view's margin first) and, on a cold view (stage start, respawn), paint the view's squares before its first
      frame (one-time cost behind the card). The live path stays only for no-canvas cases. Root fix of the pop and the band at once;
      plant: first frame == settled frame at the corner and over a fast descent. Cost: one burst at start/respawn, measured in drawcheck.
3. PUZZLE ROOMS, SHOWN FIRST (b/puzzle-gates-asis-3-2_6-7_7-3-upright-top-sideways-bottom.jpg; b/gate-probe.mjs): rooms with a
   shut gate: 3-2, 6-7, 7-3 (drawWallArt); 2-9 is 'reeds' (drawReedWall, not this); World 5's Butler (drawButler) also calls drawWallArt
   (not shot). Each is a freestanding 90-wide pillar over the door, the world's near-square 'wall' frame blitted to 116 x 256-376: x2.26
   (3-2), x3.53 (6-7), x3.23 (7-3), all past TILE_STRETCH 1.1. At game size they read as tall pillars (the textures' streaks run along
   the stretch); the cap moss (3-2) and the bark's top (6-7) smear.
   MOCK (cap 40% + middle 25% repeated at its own aspect, every other mirrored + foot): REJECTED by me (b/puzzle-gates-asis-vs-
   bandmock-upright-REJECTED.jpg): it reads as wallpaper (diamonds 6-7, zigzag ropes 7-3, stacked glowing bricks 3-2), worse than as is.
   Options sent to the lead: (a) MY PICK: a tall gate-pillar piece per world (3, 6, 7, 5?) painted on Hugging Face at about 1:3, drawn
   at its own shape, fitted by cutting the top behind its cap; (b) as-is under a named exception (only with the lead's ruling);
   (c) whole frames stacked (worse). Not built.
   THE LEAD'S RULING: (a), OUT of this scope: its own row R-165.387 (an art member after release 3; the lead's HF call). puzzlePlay's
   drawWallArt calls stay exactly as they are live. CONFIRMED fix (i) did not touch them: `git diff 484199316 c884525bf --
   src/game/puzzlePlay.ts` is empty, and drawWallArt's body (protoArt.ts:1271) is identical on both; protoArt no longer calls it itself
   (the canopy walls draw through drawWallFace). The as-is and rejected-mock stills are pushed for the art member (b/puzzle-gates-*).
2, 4-5. NOT STARTED: C itself (no src changed by ENG-WALL-b), (ii) wide walls, (iii) water past a face, the stills of item 4,
   lockall, drawcheck, gates. The suite was not run (no src change: nothing to carry, D118).
Done-items (evidence): the band's source named with file:line, measured both ways, census and per-source switch-off (item 1, b/
corner-probe.mjs, b/corner20006-firstframe-vs-settled-*.jpg); the plant for ruling C written and RED both ways with a clean control
(b/flip-probe.mjs, b/red-flip-scratchmerge.txt); puzzle rooms shown first, my mock rejected, ruled out of scope, fix (i) confirmed
not touching them (item 3).
Suggestions: every ground still records which path its frame drew (squares or live) in its file name; and flip-probe joins the
CI gates once C is green (a frame flipping path is a regression no node test can see).
Unresolved: C and its four conditions, (a) the settled line at 20006, (b) the grass past the column, (ii), (iii), item 4 stills,
lockall, drawcheck, the gates. flip-probe does not yet drive a real respawn or stage start by name (condition 1).
Method update (gates.md / methods): a ground plant in node only sees the live path (no getTransform); the frame the phone shows is
the squares OR the live path. Every ground fix is checked in a browser on BOTH: first frame and settled.
Turnover note: reference/handoffs/engine-core.md §0zq-WALL-b added (the two paths; the ruling; browser checks).
Polish check: the x 20006 corner, upright and sideways, 2x: FAILS on the first frames (the band, 14-17 luma); settled still a faint
straight line (2.7-3.8). Nothing else shot. Nothing lands.
Pushback: the packet's 'turn the engine's draws off one at a time' found nothing on a settled frame: the band is TIME-dependent (which
path the frame took), so a still shot after the squares paint hides it (ENG-GROUND's stills caught a live frame). Every ground still
should say which path the frame drew.
Learned: a still of the ground must be shot on a settled frame AND on the first frame; compare both.
Lessons applied: D96 (the plant named before any fix), D102 (read lean), D111 (box by date), D113 (background runs, no waits), D115
(every run on the frozen scratch merge; nothing copied into it), D117 (nothing pushed but the REPORT and its stills), D40.

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
   VERDICT (484199316): tsc PASS; tests 4043, pass 4039, fail 1, todo 3 (R-165.312, 4-3: known TODO). NONE of my plant names ran (the
   toy's 17 ground tests are base's own, all ok): the suite read the clean groundStack.test.ts, so the D115 touch did not reach it.
   The one red: pacerLay.test 'pacer race (the bots)': 'middle normal seed 2: 114.9 s against the boat's 112.21 s' (ENG-27's lane,
   not mine); re-run ALONE on the same frozen tree: RED again, the same numbers (deterministic, not timing): a real red on base.
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
