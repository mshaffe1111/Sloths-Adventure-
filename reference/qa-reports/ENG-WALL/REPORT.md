# ENG-WALL-d REPORT (R-165.380 continued; start 9:13 PM ET by `date`; branch t-eng-wall; box to 9:41 PM ET)
EXACT NEXT STEP: on an IDLE machine (nothing else running), time the candidate's burst: `node d/burst-ms.mjs <port> upright|sideways 4`
against a vite on t-eng-wall (afdd5060c) and one on t-eng-wall-c2 (b04579a95), PERFORMANCE-RULES §1 (no frame over 50 ms in play, 120
at a stage start); then fix d/flip-layers.mjs to keep and restore each frame's ZOOM with its camera (it restores x,y only) and re-judge
the descent's frame 0 (d/zoom0.mjs: sideways it is drawn at zoom 0.7316 and re-rendered at 0.763; upright the zoom holds at 0.9364,
upright's 2.62 is the plant band in front of the left column, the soil 0.0-0.2: d/frame0.mjs; the mask must leave out cells where
another layer draws over a bank). If both hold, the lead judges stills of t-eng-wall-c2 and it lands with a planted test; then item 3 (the corner (a)/(b), (ii), (iii)).
**The suite and drawcheck on the head did NOT finish inside the box** (rows below): re-run them on afdd5060c before anything merges.
MY MISS: I started the suite (about 35 min) 23 minutes before the box's end, and drawcheck after the lead's "no long run you can't
finish" message, sure of about 6 minutes; under the suite's load it ran at about a stage a minute (3 of 19 stages done at the hand-over).
At hand-over: shards 414 / 387 / 444 tests passed, 0 failed so far (still running); drawcheck 10 of 19 stages, no breach printed so
far. Neither is a verdict. On the frozen head afdd5060c also: tsc 0; generalitycheck PASS; knowncheck PASS; artcheck PASS; roadmapcheck
could not check (exit 2: "shallow clone, proofs cannot be checked"): NOT a pass, needs a full-depth clone.

## 1. C's first half LANDED (done, pushed: t-eng-wall afdd5060c; `git ls-remote` = HEAD at the push)
- 018086a32: one seam, no change in behaviour: protoArt.ts groundBakeKey (the key's scale and view), engine.ts groundView (what the
  render hands setDepthView). Its planted test src/game/groundBake.test.ts drives the real engine through the intro dolly upright
  412x915 and sideways 915x412: the zoom eases (plant), and the key's scale and view must not change on any dolly frame and must equal
  the settled frame's. **RED on a fresh worktree at 018086a32: 0/2, "the ground's key changes on 36 of 40 dolly frames (0.8427|1086 ->
  0.9364|977)" upright, (0.6867|600 -> 0.7630|540) sideways** (ENG-WALL-c's measured 1086 -> 977 and 600 -> 540 exactly).
- afdd5060c: the accepted prototype's hunks WITHOUT its log (restZoom from roomWant/revealWant/swimWant/swingWideWant in applyZoom;
  groundView = viewCssH / restZoom, over restZoom / zoom; the bake scale m.a * bakeOver). **GREEN on a fresh worktree: 2/2.** tsc 0.
- Gates on the frozen head afdd5060c: seed list 1-1 **PASS (161 seeds)**; the suite and drawcheck NOT finished (see the top).
- The per-frame look BY LAYER (d/flip-layers.mjs: b/flip-probe.mjs plus a ground-only mask: 8-px cells in a painted bank, 16 under its
  top, over 160 from Pokey; plus the stage start: squares released, the dolly's first frame), 2-97 seed 1, DSF 2, on afdd5060c
  (d/before-C2-*.txt). Ground mean luma, first frame vs settled; bar 1:
  upright: start 4.85, cold x19900 5.34, cold x14800 3.68, descent 10.49 (5 of 40 frames over 1). sideways: 12.17, 2.79, 2.96,
  20.14 (7 of 40). Control 0 both. **RED on the ground: C's first half alone does not make the first frame equal settled** (the budget).

## 2. C's second half: CANDIDATE, measured, NOT landed (branch t-eng-wall-c2 at b04579a95, pushed)
- protoArt.ts drawGroundChunks: every square IN view is painted that frame from paintTile (the same groundLine darkening as every square),
  so a late square never sends the frame to the live path; the margin ahead (CHUNK_AHEAD 1 square past each edge the view moved toward,
  none on a cut) is painted at CHUNK_BUDGET 3 a frame while the memory (CHUNK_BYTES) holds it, and kept from eviction. Sized from the
  fastest fall: maxFall 950 a second (physics.ts:27) = 31.7 a frame at 30 fps, so a 256 square takes at least 8 frames to cross and the
  row ahead (at most 5 squares) is painted in 2.
- Layer probe on b04579a95 (d/after-C2-*.txt): **GREEN 0.00 on the ground at the stage start and both cold respawns, upright and
  sideways; descent frames 1-39 at most 0.03 upright, 0.40 sideways** (were 10.49 / 20.14). **Descent frame 0 RED: 2.62 upright, 9.33
  sideways**: the probe's own teleport from the previous case (cam 14663 -> 18594); its other layers differ too (5.11 / 3.17). Most
  likely the PROBE: d/zoom0.mjs (same moves, sideways) reads that frame at zoom 0.7316 and the end at 0.763 (an ease from the x 14800
  case still unwinding), and the probe re-renders every frame at the END zoom (it restores the camera's x,y, not the zoom). UPRIGHT the
  zoom does not move (0.9364 on every frame), so upright's 2.62 is NOT that; nor is it the re-render's Pokey at the descent's end (the
  probe now leaves those cells out too: the same 12139 ground cells, 2.74; d/after-C2-upright-v2.txt). LOCATED (d/frame0.mjs, the still
  d/descent-frame0-left-vs-settled-right-upright.jpg, DSF 1): by 40-px row band the frame differs only in rows 280-600 (3.6-15.2 luma),
  the reeds and plants in front of the left rock column; the soil under the grass line is 0.0-0.2. The mask counts that band as ground
  (the column's bank runs down through it). So the SOIL equals settled on frame 0; the plant layer differs on its own first frame
  (ENG-WALL-b's other lazily painted layer): a separate item, not the ground's.
- NOT measured: the burst's cost (up to all in-view squares painted in one frame at a cold view). d/burst-ms.mjs ran once under the
  suite's load and its numbers are void (the settled frame read 45.9 ms, the descent 1105 ms at 4x); stopped, nothing recorded.
  drawcheck on b04579a95: started, NOT finished in the box.

## 3. The corner (a)/(b), (ii), (iii): NOT started (this box went to items 1 and 2).
**Polish check:** one still judged (d/descent-frame0-left-vs-settled-right-upright.jpg: the soil identical, the reeds band differs);
item 1 changes no settled look (the lead judged ENG-WALL-c's dolly stills); the candidate needs 2x stills, first frame and settled.
**Learned:** land a no-behaviour seam first so a planted test is RED at an assertion on the base; judge the ground by its mask and
check the mask (a bank's column runs under the plant band); never time on a machine running the suite (4x numbers read 10x).
**Lessons applied:** D40 (C's second half on the landed first half), D102/D111 (the box by `date`), D109, D113/D122 (background runs
with timeouts; one launch with a shell '&' inside was stopped and relaunched as three), D115 (frozen worktrees wt-red, wt-green, wt-c2),
D117 (the candidate on its own branch), D119, D120. **Suggestion:** flip-layers' descent starts with a camera cut from the previous
case; judge that as its own respawn case and add a warm descent that starts settled at the column's top.

# ENG-WALL-c REPORT (R-165.380 continued; start 8:54 PM ET by `date`; branch t-eng-wall; box to 9:22 PM ET)
EXACT NEXT STEP: land C's first half on t-eng-wall from c/proto-C-bake-at-target.patch (apply c/exp-log.patch first: the
prototype's context carries the two log lines; write the three hunks into src WITHOUT the log), then the suite (3 shards), the 1-1 seed list, drawcheck and the CLAUDE.md gates on the head. Then C's second
half (no square in view ever missing: the burst at 4x CPU, the directional margin) against b/flip-probe.mjs split by layer (suspect 3).
**No src pushed in this box.** Item 1 done and measured; C's first half PROTOTYPED and measured (below), not landed.

## 1. Why a played frame falls to the live ground path (DONE, measured in the browser on real play)
METHOD: a local experiment tree (6e2df514b + two commits, never pushed: 3ceab3337 drawGroundChunks pushes its exit reason, which
test sent it, and the key's old/new values when it was reset; 6828d98de the ground block's ms and squares painted per frame) served by
vite; c/exit-probe.mjs runs the GAME'S OWN LOOP (not paused, no settled re-renders), 2-97 seed 1, DSF 2, upright 412x915 and
sideways 915x412, and counts every frame's reason (c/exit-*.txt, c/exit-*.json).
RESULT (three runs each way; c/exit-*.txt holds run 3, with timing):
- Standing still: 60/60 frames on the squares, both ways. **Not every played frame is live. Suspect (1) chunks.plats is REFUTED.**
- **THE CAUSE: suspect (2), the KEY, on the stage start.** The camera's intro dolly (engine.ts:1335-1345, INTRO_ZOOM_SECS 1.3 at :280)
  eases the zoom in, and protoArt.ts:1743's key carries `scale.toFixed(4)` and `Math.round(depthView)` (depthView = the live
  viewportHeight, engine.ts:7598 -> protoArt.ts:1440). So EVERY eased frame changes the key: upright scale 1.6855 -> 1.8727 with
  depthView 1086 -> 977 over 28-29 frames; sideways 1.3733 -> 1.5259 with depthView 600 -> 540 over 25. Each of those frames throws
  every square away (releaseGroundChunks), paints CHUNK_BUDGET (3) new ones the next frame throws away again, and draws the whole
  ground LIVE. Stage start: 34 of 69 frames live upright, 31 of 76 sideways (run 1); 35/72, 32/69 (run 2).
- The same key break comes from EVERY zoom ease, not only the start, by the code (not yet measured in play): revealZoom (engine.ts:8672,
  :8800), swimZoom (:7245), swingWide (:6613), roomZoom (:9506), bossZoom (:4360) each ease per frame into this.zoom (:1345).
- Fast descent (x 18990 from y 600 at maxFall, 2.5 s): 4/75 live upright and 8/75 sideways (run 1), 0/76 and 3/75 (run 2): all
  'missing' (the budget, key unchanged). Real-time play varies run to run.
- Respawn to a cached view (respawnAtCheckpoint): 91/91 squares. COLD respawn (33 far views painted first so the checkpoint's squares
  are pushed out, then respawnAtCheckpoint): 4/90 live upright, 3/89 sideways, all 'missing' (the budget).
- **PERFORMANCE FACT (§8), every stage start of every stage drawn by the squares (the bank and the bough looks both):**
the ground block alone (drawGroundChunks + the live drawGround, per frame, this container's CPU; c/exit-*.txt run 3):
  upright: the dolly's 30 key-reset frames cost 363 ms of ground in all (12.1 ms a frame, worst 29.6), 90 squares painted and thrown
  away; sideways 24 frames, 628 ms (26.2 ms a frame, worst 33.3), 72 squares wasted. A settled frame's ground: 0.06 ms (60 frames 3.7
  ms). So for about a second at every stage start the GROUND ALONE is at or past §1's 12 ms for our whole update and draw.
  At 4x CPU (THROTTLE=4, c/exit-*-x4.txt; the page loads so slowly the dolly lands in the 'standing still' window): upright 9
  key-reset frames, 465 ms (51.6 ms a frame, worst 55.2: past §1's 50 ms frame limit on the ground alone), 27 squares wasted; the game
  ran 11 frames in 2 s there. Sideways at 4x: 12 key-reset frames (9 + 3 across the windows), 1414 ms of ground, worst frame 143.4 ms
  (past even the stage start's 120 ms allowance), 36 squares wasted.
  The fix's AFTER numbers (the same probe on the fix) are C's done-item: 0 key-reset frames, no square painted twice.
- Suspect (3) STANDS for the flip-probe: ENG-WALL-b's no-budget tree gave the SAME flip-probe numbers, and its probe renders paused
  at a settled zoom (no key break there). So what flip-probe sees on its cold view and descent is NOT (only) the ground path: another
  lazily painted layer differs (sheetBake.ts:104 is in both censuses; the backdrop). flip-probe must be split by layer (ground-only
  pixels, e.g. render with the ground block alone, or diff a mask of the squares' rects) before it can judge C. Not done.

## 2. C, designed to the lead's condition (its first half prototyped: 2b)
The lead's condition (this box): bake at the ease's TARGET scale and draw scaled during the ease; stills at the stage start's first
frame, mid-ease and settled, both ways, 2x: no blur settled, no pop at the ease's end, no shade jump; the start's wasted work before
and after (§8) stated.
DESIGN:
(a) engine.ts: keep each ease's target in a field (the `want` locals at :4360 bossZoom, :6613 swingWideWant exists, :7245 swimZoom,
    :8672/:8800 revealZoom, :9506 roomZoom) and in applyZoom (:1327) compute restZoom = the same formula as :1344-1345 with dolly = 1
    and every eased factor at its want. Pass protoArt the ratio rest/zoom each frame (a new setGroundRest beside setDepthView at :7598)
    and setDepthView(this.viewCssH / restZoom) instead of the live viewportHeight: the darkening's band (protoArt.ts:1466, :1027,
    :1069) then holds through every ease (no shade jump, and the live soil elsewhere follows the same depth).
(b) protoArt.ts drawGroundChunks (:1736): bakeScale = m.a * rest/zoom; the key (:1743) carries bakeScale and the rest depthView, so it
    holds through the ease; paintTile at bakeScale (keep, :1782, sized from bakeScale); the blit's source rect (:1793-1794) px =
    CHUNK * bakeScale, pad = CHUNK_PAD * bakeScale, dest CHUNK world units as now: the live transform scales it. The dolly runs
    WIDE -> close (zoom up to rest), so during it the squares are drawn DOWN-scaled (sharp); at the ease's end live == bake, the very
    same pixels: no pop. An ease OUTWARD (reveal 0.86/0.7, a swim, a room pulling back) has its target BELOW the live scale, so its
    squares are drawn UP-scaled while it moves (by at most live/target: 1/0.86 = 1.16 upright at the firefly tree), sharp again when
    it lands. If the lead's stills find that soft: bake at max(live, target) for an outward ease and re-key once when it lands.
(c) Memory: CHUNK_BYTES (:1686) keep is computed from the bake side, so a 2x-3.5x phone keeps as now once settled.
(d) Then C's second half: no square in view ever missing (paint every missing in-view square, no budget in view; CHUNK_BUDGET for a
    directional margin, ENG-WALL-b's numbers), the cold burst measured at 4x CPU (THROTTLE=4 in c/exit-probe.mjs does it), the
    corner's (a) and (b), the plant flip-probe split by layer and run with a respawn and a stage start by name.
Checks to run on the fix: the suite (the node recorder has no getTransform, so groundStack/groundEnd still run the live path), the
1-1 seed list, drawcheck (the ease's per-frame paint must drop, not rise), and the CLAUDE.md gates on the head.

## 2b. C's first half PROTOTYPED and measured (local tree, never pushed as src; the diff is c/proto-C-bake-at-target.patch)
WHAT: engine.ts keeps each ease's want (roomWant, revealWant, swimWant; swingWideWant already) and applyZoom computes restZoom (the
zoom every ease is heading to, the dolly at its end); the frame passes setDepthView(viewCssH / restZoom, restZoom / zoom); protoArt's
drawGroundChunks bakes at m.a * restZoom/zoom and blits with the live transform (22 lines, tsc clean). Bosses keep the live bossZoom
(its target moves every frame). NOT RUN on it yet: the suite, the gates, drawcheck, the 1-1 seed list.
AFTER (c/exit-probe.mjs on the prototype + the log; scratch numbers copied into c/after-*.txt):
| stage start (first 6 s) | key-reset frames | live frames | ground ms in all | squares painted |
|---|---|---|---|---|
| upright BEFORE | 30 | 36 of 78 | 578 | 111 |
| upright AFTER  | 0  | 4 of 81 (the first frame + 3 missing: C's second half) | 231 | 21 |
| sideways BEFORE | 24 | 31 of 70 | 944 | 96 |
| sideways AFTER  | 0  | 6 of 83 | 295 | 23 |
| 4x CPU, upright, the window the dolly lands in: BEFORE 9 key-reset frames, 465 ms, worst 55.2 ms, 11 frames ran in 2 s; AFTER 0, 8.5 ms in all, worst 1.0 ms, 18 frames ran |||||
| 4x CPU, sideways, same window: BEFORE 12 key-reset frames, 1414 ms, worst 143.4 ms; AFTER 0, 33.3 ms in all, worst 29.3 ms |||||
Standing, respawn, cold respawn, descent: unchanged (all still 'missing' on the budget only: C's second half). The one key reset the 4x upright
respawn AFTER shows is NAMED (c/after-upright-x4-keys.txt): the key goes 1.8727|977 -> 1.4045|977: the bake scale drops x0.75 with the
rest view unchanged, i.e. the canvas's own scale fell (render dpr 2 -> 1.5: the quality governor stepping down on the slow CPU), not an
ease. A new resolution needs new squares: one true re-key, correct; it still draws one frame live until C's second half paints every
in-view square at once.
STILLS (the lead's condition; c/dolly-before-top-after-bottom-early-mid-settled-{upright,sideways}.jpg, 2x shots, sheet halved;
shot at the dolly's early (introT ~0.3), mid (~0.7-1.1) and settled (1.3 + 2 s), zoom read with each shot):
- No blur settled: the settled soil before vs after differs by mean 0.30 luma upright (worst 8-css-px column 0.4) and 0.28 sideways
  (worst column 2.2, the animated grass and flowers in the crop): inside the lead's 1 / 4 bar. At rest bakeOver is 1: the same bake.
- No pop at the ease's end and no shade jump: by construction the key never changes through the dolly (0 key-reset frames measured)
  and depthView is the rest view's all the way (the shade's band never moves); the stills show no step between mid and settled. NOT
  yet measured frame by frame by layer (the plant, C's second half).
- My judgment of the sheets: the before and after rows read the same at phone size; the card covers the left of the view through the
  dolly in both. Nothing rough found; the early sideways frame's left column (x ~155, the wall) is the same in both rows.

## Polish check
No shipped picture changed (no src pushed). The prototype's dolly stills (2b) judged on the contact sheets the way the phone shows them:
the before and after rows read the same, the settled soil matches within 0.3 luma; nothing rough found. c/ease-stills.mjs shoots them.

## Learned
- A settled, paused probe cannot see a zoom ease: ENG-WALL-b's why-probe ruled the zoom out because it read scale AFTER settling. Log
  the reason inside the function on the game's own loop first; it named the cause in one run.
- Real-time play varies run to run (the descent: 4 vs 0 live frames upright): run every play probe at least twice and give both.

## Lessons applied (their meaning as the packet words them: grep found no D-number lines for them on this tree's LESSONS.md)
D96 (the measure before the fix, RED/before numbers first), D102 (read lean), D109 (no clock times to the lead), D111 (the box),
D113 (every long run in the background), D115 (the experiment tree frozen during each run; the probe in the report tree, which no
run reads as code), D116 (every number cites file:line), D120 (the lead's answer did not end the box: its condition was built into the prototype).

# ENG-WALL-b REPORT (R-165.380 continued; start 7:47 PM ET by `date`; branch t-eng-wall at c884525bf; box to 8:15 PM ET)
EXACT NEXT STEP: FIRST find WHY the frame takes the live path (my 'budget' trigger is REFUTED, see CORRECTION), then build the
lead's ruling C (the frame never flips ground path) against the plant b/flip-probe.mjs, which is RED now.
CORRECTION (measured last, after the ruling): an experiment tree (scratch merge + drawGroundChunks painting every in-view square
whatever CHUNK_BUDGET, local c8ee2297f, never pushed, served on its own port; the served protoArt.ts carried the change) gave the SAME
flip-probe numbers to the decimal (b/flip-experiment-nobudget-STILL-RED.txt: upright descent 7.17/12.9, sideways 11.97/29.7). So the
budget is NOT what sends those frames to the live path. The live path is still the source (census: first frame = live draws, no
square blit). The other ways drawGroundChunks gives up: protoArt.ts:1738 (the canvas transform has a turn/skew or unequal scale:
camera shake / trauma?), and a chunk KEY change (protoArt.ts:1741: kitWorld, groundLook, scale.toFixed(4), depthView, bankSig): a zoom
ease or a depthView change drops every square each frame. Next member: log drawGroundChunks' exit reason per frame in the browser on
the descent and the cold view, name it, then design C around it (the margin/budget design below only matters if the budget shows up).
RULED OUT (b/why-probe.mjs, cold x 19900 upright, 6 first frames and settled): the transform drawGroundChunks reads is a plain
1.87273 scale every frame (no turn/skew: protoArt.ts:1738 is not it); zoom 1 = targetZoom; trauma 0 (the scale part of the key holds).
LEFT: (1) the key's depthView or bankSig changing after an update; (2) `chunks.plats !== platforms` (protoArt.ts:1742): a new platforms
array after e.update() would drop every square each played frame (the probe's settled renders have no update, so they keep them);
(3) the experiment's frames no longer take the live path but ANOTHER lazily painted layer differs (sheetBake.ts:104 is in both
censuses; the backdrop): flip-probe compares the whole canvas, so split it by layer (ground pixels only) before judging C.
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
