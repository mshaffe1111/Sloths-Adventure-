# B2 REPORT (ENG-B2, t-b2-chase from t-b1-chase@a951fdfb, session_01FhBbYMh3oasGDykQhmpZty). Written 2:18 AM ET.
**Done 1, the chase on screen (D63, clips): lead PASS 1:38 AM ("clips PASS for the mechanic").** 8 clips shots/{1-2,2-1}-{normal,easy}-clip-
{upright,sideways}.mp4 (6.5 s, 30 fps, 2x, frame by frame) + 28 stills (crack: the opening right behind him, his section cracking;
collapse: halves mid-fall; fork both ways). Each clip: front closes to 48 px Normal / 57 px Easy, he runs at 2.1 s / 3.3 s, pulls away to
249 / 393 px, hp 5. Sheets: sheet-clips-*.jpg, sheet-stills-*.jpg. Scene: RealPlay.bare-equivalent in the real page (world.mjs: realPlay.ts
:328-340 + engine.ts:1061-1081 draw lists), the stage's own backdrop and height, nothing of its layout; an old save that has seen its story
aside; caption = what the game built. Camera = the shooter's, max(front - 0.4 vw, him - 0.6 vw); B6 owns the real chase camera.
**Done 2, found and fixed:** a laid chase's long-branch sheet loaded on the first section drawn (flat brown bars on its first frames):
builtStageKeys 'props3' -> stagePreload start -> warmProto3 gets it behind the card (stageManifest.test.ts, red without).
**Step 2 tint: NOT DONE.** Head = edgeTint (dark core + ember rim, 0 at 650 px, 0.75 at 150 px; chasePiece.test.ts, red at B1's 0.55): beats B1
on the inner band everywhere but FAILS the bar I set before measuring (dE >= 20 in a band on every backdrop) on 2-1 upright and World 3,
and the lead reads it as a full-height "laser" column. Lead chose C4 (glow anchored at the break + bark chips, tint/compare-*.jpg). I built
it twice: both FAIL upright (build 2 below B1: upright the front is off-screen), so the head is back on B2's tint. contrast.txt has all.
**Gates** (gates/RESULTS.txt, head 62ff9080, src identical to 0db5fa22, the clips' head): 0 = tsc, build, chunkcheck,
artcheck, knowncheck, generality, roadmap, kbdcheck; clipcheck PASS; drawcheck PASS 834 s; lockall 102/102 unchanged vs a951fdfb. CUT at
the lead's 2:25 deadline, nothing left running (D59): unit PARTIAL 1,432 ok / 0 not ok (chasePiece + stageManifest alone: 24/24);
seedlists PARTIAL (1-1 cut); UNRUN registry, tooltests, tierBots, buildcheck. The full suite is owed before any merge.
**Polish check (my look at the sheets):** reads: the crack, halves falling, the front stopping at the fork, the pull-away, both
orientations and settings. Rough, named: the tint (above); forks draw as the world's kit ground (W1 grass island, W2 planks), not branch
(lead logged a W1 split-branch fork art need); on 2-1 the halves read weaker on its brown foreground; 1-2 Easy shows Dot's held petal
reminder 0.47 s mid-clip, tapped away (1-2's goal in a bare world); a faint seam between log sections.
**Not done:** the tint (above); B5 CHASE-LAY (~3 h, ENGINE-678 §5). **Pushback:** the 2-gradient frame limit decides the tint's design.
**Method:** stage-piece.md 1-6. **Lessons:** D19 (the tint test drives the piece's own draw), D23/D36, D30, D40 (old 1-8 untouched; props3 only
for a laid chase), D43, D50 (Easy's default Dot help shows its line), D57, D59 (gates waited past the box, lead OK), D61 (my run-up drew as
flat code bars: fixed), D62, D63, D64 (my first % used the wrong base), law 22 (the tint bar was never moved). **Method update:**
stage-piece.md step 5: clips frame by frame (shoot.mjs), never Playwright's recordVideo (page in a corner, game time lost); never edit
src/ while a dev-server shoot runs (Vite reloads the page) and restart Vite after edits (a plain-address import became a second module
copy); tap Dot's held line before EVERY frame; an old save for story asides; one platform per piece of ground; a contrast bar written
before measuring, measured after every sheet has loaded (my first table did not wait: flat bars in some frames).
**Learned:** a chase reads only in motion; a dark tint vanishes on dark backdrops and a full-height one reads as a filter; upright the
front is usually off-screen, so a warning must live at the edge; check the frame budget (limits.json) BEFORE designing a look, not after
two builds; the shooter's own traps cost more than the piece (4 reshoots).
**EXACT NEXT STEP:** 1. Tint (lead's C4): bake a radial ember glow (anchored at the trailing edge at his feet, sized by max(w, 0.55 h)) and a
narrow edge band once per screen size into a cached canvas; each frame ONE drawImage at globalAlpha = k (no gradient a frame) + edgeLook-style
painted bark chips (<= 22); re-bake on canvas restore (D6). Planted test: no gradient a frame, alpha by gap, re-bake. Measure with
contrast.mjs 1-2 2-1 3-1 3-9 (fresh Vite, no src edits meanwhile): dE >= 20 in A or B on every row, upright too; reshoot with shoot.mjs; lead
pass. 2. B5 CHASE-LAY per ENGINE-678 (gen2/chaseLay.ts, K out of LATER in nodeCode.ts, pipeline.ts hook, refuse by chaseLayProblems, the
in-play check that drawPlats holds none of its sections, flags at forks per STAGE-RULES:105-109); then drawcheck covers the chase on 1-8.
