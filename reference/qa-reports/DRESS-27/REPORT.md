# DRESS-27 REPORT (Engine, art/dress code). Started 2:43 PM ET 11-23. Branch t-eng-27-wip-dress.
## DRESS-27d (Engine, draw code; DRESS-27c's successor). Started 4:48 PM ET 11-23 by `date`. Branch t-eng-27-wip-dress27d.
### EXACT NEXT STEP (pushed at the 28-minute box; the gates run in THIS container only)
- The candidate: t-eng-27-wip-dress27d **8d441aa43** (DRESS-27c's f3649a092 + 3aa389ad9 + (2b) taken out). Not yet on t-eng-27.
- Frozen gate trees: /home/user/wt-merge = t-build-27e 793ddf246 + dress27d (clean merge) = **a21dbcf34**; /home/user/wt-base = 793ddf246.
  DONE on a21dbcf34: tsc 0, generalitycheck PASS, knowncheck PASS, stackViewFloor 5/5, related suites 61/61, 2-7 seedlist --check PASS.
  RUNNING: lockall --out on both trees (compare the two JSONs key by key: every build equal = 102 stages unchanged), drawcheck
  (limits.json scenarios, 2-7 included), clipcheck. A successor in another container re-runs those four on a fresh merge.
- Then: `git fetch origin t-eng-27`; in a worktree of dress27d `git merge --no-edit origin/t-eng-27` if it moved (+ tsc), `git push origin
  HEAD:t-eng-27` (fast-forward, no force), `git ls-remote` = HEAD, send the lead the hash and stills-27d/'s paths.
### Polish check (stills-27d/: 2-7 layout 0 = seed 1, phone 2x, tools/engine/runs/stills-at-setting.mjs, ONE spot a run; BEFORE = t-build-27e 793ddf246, AFTER = the same + dress27d = a21dbcf34)
- **Upright out-leg bottoms** (Normal x4500, Easy x5419): pair-2-7-L0-normal-x4500-upright.jpg, pair-2-7-L0-easy-x5419-upright.jpg,
  zoom-bottom-x4500-upright.jpg. Before: the bottom of the screen ends in the stand-in's column streaks and a dark band. After: painted
  earth, roots and stones to the screen's foot; Pokey stands lower (feet about two thirds down), sky and village above. PASS.
- **The out leg's underside from the race leg** (Normal x9085 upright): pair-...-x9085-upright.jpg, zoom-under-x9085-upright.jpg.
  Before: evenly spaced vertical seams along the underside. After: one smooth darkening, no seams. PASS.
- **The deep river's wall** (Normal x9085 sideways = the finding's x9080 bank): pair-...-x9085-sideways.jpg, zoom-river-x9080-sideways.jpg.
  Before: a lighter teal strip from the surface down beside the bank's roots. After: one dark teal right to the wall. PASS. The logs keep
  their old ends (the id's flip): (2b) is out, as the lead cut it.
- (pending) Easy x9600 river wall, re-shot with a build wait.
- (pending) sideways out-leg spots.
- (pending) 2-4 x15990 and 2-5 x21020 deep-river banks.
- Seen, not mine, unchanged before and after (named for the lead): the out leg's soil shows two soil pieces meeting as vertical tone steps
  (x9085 upright, zoom-under); a lighter flat strip under the right-hand grass lip at x4500 upright with a hard left edge (the grass
  ledge's own art). Neither moved with this change.
### What landed
1. (2b) the log-end flip taken out on top of DRESS-27c's two commits (8d441aa43, no history rewrite): engine.ts `logLead`/`logLeads` and
   the two calls' 4th argument gone; riverArt.ts back to 9fe64614e's byte for byte (no `LOG_BROKEN_RIGHT`, no `lead?`, `p.id % 2 === 1`);
   `grep -rn "logLead\|LOG_BROKEN_RIGHT" src` empty. engine-core.md 0zq-floor: the log bullet replaced by "Held out".
2. What stays: (1) the camera's view floor over a stacked upper leg (groundStack.ts viewFloor/underReach, protoArt.ts stackViewFloor,
   engine.ts STACK_FEET_MAX + the clamp) and the continuous stand-in underside (standInBand); (2a) a deep river's over pass under its
   banks' faces in the box's one clip. Code diff vs t-eng-27 9fe64614e: engine.ts, groundStack.ts, protoArt.ts, stackViewFloor.test.ts.
### Gates (frozen trees, chattr +i on src: /home/user/wt-merge = t-build-27e 793ddf246 merged with dress27d (clean) = a21dbcf34;
### /home/user/wt-base = 793ddf246)
- tsc 0; generalitycheck PASS (26 known); knowncheck PASS; planted stackViewFloor.test.ts 5/5; related suites (groundStack,
  deepRiverLid, cameraFollow, cameraReach, cameraLead, riverLook, riverRaft, drawThrift, stackViewFloor) 61/61.
- 2-7 seedlist --check on a21dbcf34: PASS (100 seeds, each clean on both settings; the verdicts refuse 0).
- (pending) lockall, drawcheck, clipcheck: running on the frozen trees.
### Pushback
- The packet says 2-4 and 2-5's deep-river banks stay UNCHANGED. (2a) is general (every deep, moving river against a bank wall), so where
  2-4's deep river had the same lighter strip (x15990, DRESS-27c's zoom-2-4-deep), it is gone there too: the same fix, not a new look.
  Everything else at those banks is unchanged. If the lead wants 2-4 untouched, (2a) needs a 2-7-only switch, which law 22 and "new
  replaces old" argue against.
### Learned
- A still tool run under load prints BUILT before the stage is ready ({"stored":"normal"} only); the still itself is right (it waits
  for the HUD card): judge the file, not the line.
- On this container the ESM import of playwright needs PW=/opt/node-tools/node_modules/playwright/index.mjs (index.js gives no
  named `chromium`).
### Lessons applied: D115 (every gate on chattr-frozen trees), D119 (no heredoc in a commit chain), D109 (no clock times to the lead),
D131 (drawcheck with 2-7 on the merged head), D36 (branch named, ls-remote), law 22 (no limit moved).
### Turnover note: reference/handoffs/engine-core.md 0zq-floor (8d441aa43).

## DRESS-27c (Engine, draw code; a fresh member). Started 4:12 PM ET 11-23 by `date`; STOPPED by the lead at 35 min (real context 350k).
### EXACT NEXT STEP (for the successor; the lead's SCOPE CUT: land (1) + (2a), HOLD (2b) the log-end flip)
Branch t-eng-27-wip-dress27c (local name dress27c) on t-eng-27 **9fe64614e** (t-eng-27 had not moved at the stop: fast-forward possible).
- **f3649a092** carries all three: (1) the camera floor [groundStack.ts `STAND_IN_BAND`, `underReach`, `viewFloor`; protoArt.ts
  `stackViewFloor` + its import; engine.ts the protoArt import `stackViewFloor`, `STACK_FEET_MAX` after `NO_W5_THINGS`, the 6-line clamp
  before "his head stays under the HUD"]; (2a) [engine.ts drawRivers: the `const [ul, ur] = over && (r.safe || floodsOnly) ? ...` line
  with its comment, and the foam's `fa`/`fz` span]; and **(2b) the log flip** [riverArt.ts: `LOG_BROKEN_RIGHT` + its doc, the `lead?`
  param of drawRiverLog + its doc, the line `const flip = lead ? ... : p.id % 2 === 1;` used by the blit; engine.ts: `logLead()` +
  `logLeads` (the block just above "the logs (or rafts) that ride river `r`"), and the two calls `drawRiverLog(ctx, pl, this.gameTime,
  this.logLead(pl))`].
- **3aa389ad9**: (1)'s second half, the continuous underside (groundStack.ts `standInBand`, `STAND_IN_LAYERS`, `bandAlpha`,
  `standInStyles`; drawUnderside's `painted` branch), test case 5, engine-core.md 0zq-floor.
- **TO TAKE (2b) OUT CLEANLY** (a new commit on top, no history rewrite): engine.ts: both calls back to `drawRiverLog(ctx, pl,
  this.gameTime)`, delete `logLead`/`logLeads`; riverArt.ts: delete `LOG_BROKEN_RIGHT` and its doc, the `lead?` param and the doc lines
  that name it (restore the one-line doc "a drifting log: ..."), and blit with `p.id % 2 === 1` again. `grep -n "logLead\|LOG_BROKEN_RIGHT"
  src` must be empty; tsc. engine-core.md 0zq-floor: delete its third bullet ("A deep river's log trails ..."). Nothing else uses them.
- **Gates** on the frozen merged head t-build-27e 793ddf246 + dress27c = **93ae6d052** (/home/user/wt-d27c-f2, THIS container only; the
  merge was clean, only my 5 files differ). DONE: tsc 0, generalitycheck 0, seedlist 2-7 --check PASS (100 seeds, both settings; on
  17055a8c1 = the merge of f3649a092: 3aa389ad9 is draw only), lockall RECORD on the base (667 s, exit 0). LOST (stopped mid-run, the
  lead's order): lockall --check; drawcheck (36 of 42 scenario-orientations done, 0 breaches printed; 2-4, 2-5, 2-7 not reached);
  clipcheck; knowncheck; the full unit suite. The successor runs every one on the final head (after (2b) is out), frozen (D115).
- **Planted test** src/game/stackViewFloor.test.ts, 5 cases: 1 the floor is the line less the reach (flat and rising line); 2 null on the
  lower leg, past the run, with no ceilings; 3 a view past the run's end keeps the run's line; 4 `underReach(-1)` = 56; 5 the stand-in
  is whole layers with no images (fails on the old columns: proven by stashing groundStack.ts alone, 4 pass 1 fail). The file fails on
  the base (no viewFloor). Related suites 44/44 (groundStack, deepRiverLid, cameraFollow, cameraReach, cameraLead), riverLook +
  riverRaft 8/8 PASS on dress27c.
- **Stills done** (stills-27c/; all INCLUDE (2b), so re-shoot the river ones): sheets of 2-7's out-leg spots N/E upright and sideways;
  zoom-bottom-x4500-upright, zoom-under-x9085-upright (the seams from the race leg, gone), zoom-river-x9085/x13508-sideways (the strip,
  gone), zoom-2-4-deep (2-4 HAD the strip too, fainter: gone). **To shoot for (1)+(2a)** after (2b) is out, tools/engine/runs/
  stills-at-setting.mjs layout 0, ONE spot per run (a life lost at one spot carries to the next in the same page): Normal x4500 4960
  6780 9080 11376 13508 (`:high`) + x9085 (`:low`, the river wall = the finding's x9080 bank); Easy x4960 5419 7239 8900 9553 14205
  (`:high`) + x9600 (`:low`); each upright AND sideways; zooms: x4500 upright bottom, x9085 sideways wall (the log keeps its old end).
- **2-5's 21-41% is explained, not the change** (life27c.mjs, both servers, the same placement): at page clock 10.1 s a drifting log is
  under x9260, lower than the bank, so the tool's `low` puts Pokey on it and he falls in (lives 3 -> 2, respawn x140), on the base AND
  on this build; at 5.0 s he stands on the bank. Both rivers there are safe. Re-shot one spot a page, 2-4 x3620 0.29/0.46% and Easy
  2-7 x9600 0.08/1.49% (moving things only). (2b)'s hold is the lead's call; this is the evidence for its follow-up.

### DRAFT written before the stop (includes (2b); for the successor and the lead)
### Polish check (stills-27c/: 2-7 LIST VARIANT layout 0 = seed 1, phone 2x, tools/engine/runs/stills-at-setting.mjs; BEFORE = t-build-27e 793ddf246, AFTER = the same + dress27c = 93ae6d052)
- **Upright out-leg bottoms, every named spot** (N x4500 4960 6780 9080 11376 13508; E x4960 5419 7239 8900 9553 14205):
  sheet-2-7-normal-upright.jpg, sheet-2-7-easy-upright.jpg (top row before, bottom row after). Before: every one ends in the band
  (column streaks, the dark strip, the orange line, the sliver). After: painted earth to the screen's bottom at all twelve; Pokey stands
  a little lower (feet about 62-66% down instead of 55%), sky above. Zoom: zoom-bottom-x4500-upright.jpg (before over after).
- **The underside seen from the race leg** (N x9085 upright, E x9560 upright): zoom-under-x9085-upright.jpg. Before: the same evenly
  spaced column seams along the out leg's underside (the finding's streaks, from below). After: one smooth darkening, no seams.
- **The deep river's wall** (N x9085 sideways, the finding's x9080 river; N x13508 sideways, the out leg's lidded deep river):
  zoom-river-x9085-sideways.jpg, zoom-river-x13508-sideways.jpg (before | after). Before: a lighter teal strip from the surface to the
  floor beside each bank wall (two at x13508). After: one dark teal right to the wall. The log at the x9085 bank: before its broken end
  stood flat against the bank; after its sawn, round end (rings showing) trails out of the bank.
- **Sideways out-leg spots** (sheet-2-7-normal-sideways.jpg, sheet-2-7-easy-sideways.jpg): unchanged (the floor never binds sideways);
  the only differences are moving things (logs, petals, the hummingbird) and E x9560, where the tool placed Pokey on a drifting log of a
  SAFE river (untouched code): re-shot on the bank, see below.
- **2-4 and 2-5** at BUILD-27f's comparison spots (2-4 x140 3620 11380, 2-5 x140 9260, both ways): pixels over 40 apart, before vs after: 2-4 x140 0.44/0.40%, x3620 0.29/0.46%
  (re-shot one spot a page), x11380 0.31/2.06%; 2-5 x140 0.56/0.49% (upright/sideways): moving things only (logs, petals, birds,
  reeds). UNCHANGED. 2-5 x9260 differed 21/41%: the still tool, not the change. Probed on both servers (.life.mjs: the same placement,
  lives and position over the 90 steps): when the page's clock is at 10.1 s a drifting log is under x9260, lower than the bank, so
  `low` puts him on it and he falls in (lives 3 -> 2, respawn at x140), on the base AND on this build; at 5.0 s he stands on the bank.
  Both rivers there are safe (code this change does not draw).
- **Deep rivers elsewhere** (the fix is general: every deep, moving river against a bank wall: 2-1/2-2/2-4/2-5 Normal and 2-9): 2-4
  x15990/x17170 and 2-5 x21020/x21830 before | after: sheet deep-2425-sideways.jpg, zoom zoom-2-4-deep.jpg (before | after):
  2-4's deep river at x15990 HAD the same lighter strip beside the bank's roots, fainter (BUILD-27f's "2-7-only" missed it): gone after,
  one dark teal to the wall. Nothing else moves. The upright pairs differ only where the tool lost a life on an earlier spot in the same page (lives x2 vs x3).
- Easy x9560 sideways, re-shot on the bank (x9600): 0.08/1.49%, unchanged (a safe river).
- Seen and NOT fixed (not from this change, in both before and after): a faint vertical tone step in the out leg's soil above the race leg
  (x9085 upright, screen x about 285 of 412 css): two soil pieces meeting. Named for the lead.
### Done-items
1. **Finding 1, the upright out-leg bottom band, fixed at its cause in general code (no stage, seed or x).** The out leg's soil ends at the
   ceiling (groundStack.ts): HEADROOM + UNDER_HANG over the race leg, the lower leg's air, so the soil cannot reach lower (fork 1 would
   break the race leg's headroom). FORK TAKEN: the camera's floor is clamped to the fill. groundStack.ts `viewFloor` (pure) +
   `underReach`, protoArt.ts `stackViewFloor`, engine.ts's camera (before the HUD clamp): standing over a ceiling (inside its run, feet
   above its line) the target never frames below the line less the underside's reach up into the soil (the stand-in's 56; the painted
   strips over their edge once a world has them); guard: his feet never below 0.85 of the view. Upright x4500 the view rose 98 units.
   None where no leg is stacked (every other stage frames as before), none on the lower leg, never binds sideways.
   The streaks themselves had a second cause, also fixed: the stand-in underside (World 2 has no painted `unders` yet, so 2-7 ships it)
   was a 4 x 64 gradient laid a sheared 16-unit column at a time with half-unit overlaps, and every overlap doubled its alpha into a
   seam. They showed from the race leg looking up too (x9085 upright). groundStack.ts `standInBand`: 12 continuous layers along the
   line, one fill each, their alphas stacked to the old gradient, made once per deep colour (no per-frame gradient).
   The orange line and the white sliver were things in the race leg's air (below the soil's end): out of view now.
2. **Finding 2, the deep river's wall strip and the log's flat end, fixed at the cause for every deep river against a wall.**
   engine.ts drawRivers: a deep river's over pass (the sheet that sinks its logs) now reaches under its banks like its water does, clipped
   to the same bank faces in the box's ONE clip (DRESS-27b's polygonInBox: no new clip, no new gradient); it had stopped at the lip's x,
   so where the bank's face slopes back the water showed undarkened. The foam keeps the river's own span. The "flat cut" was the long
   log painting's own broken end, trailing out of the bank half the time (the flip came from the log's id): engine.ts `logLead` +
   riverArt.ts drawRiverLog `lead` (LOG_BROKEN_RIGHT: logLong's broken end is its right, logShort's its left): on a deep, moving river
   whose upstream end meets a bank, the broken end leads and the sawn, round end trails out of the bank. Safe rivers keep the id's flip.
3. **Planted test** src/game/stackViewFloor.test.ts (5): the floor (on the upper earth, the lower leg, past the run, a view past the run's
   end, no ceilings), the reach, and the stand-in drawn as whole layers with no images. Fails on the base (no viewFloor); case 5 fails on
   the old columns (stash of groundStack.ts only: 4 pass, 1 fail). Related suites: groundStack, deepRiverLid, riverLook, riverRaft,
   cameraFollow, cameraReach, cameraLead: 44/44 + 8/8 + 21/21 PASS on dress27c.
4. **Gates** (frozen trees, D115): see EXACT NEXT STEP
5. **Landed**: NOT landed (stopped by the lead; see EXACT NEXT STEP)
### Pushback
- The packet says "the deep river is READY-27's (2-7 the first stage that lays it)" and BUILD-27f "2-2/2-4/2-5 lay the shallow river
  only": the built stages say otherwise. Layout 0 Normal lays deep, moving rivers against bank walls on 2-1 (4), 2-2 (1), 2-4 (4), 2-5 (1),
  2-9 (8, both settings). The fix is general, so those change too (darker under the bank's face, logs' round ends out of the bank);
  stills of 2-4's and 2-5's are in Polish check. What READY-27 added is the LIDDED deep river (2-7's out leg, x13508).
### Suggestions
- ART (Content): World 2's painted underside strips (`w2#under0..2`, `w2#undercorner`; groundStack.ts's hook) so 2-7 stops shipping the
  stand-in. The painted path still lays 16-unit columns with half-unit overlaps: if the strips have soft alpha at their top, the same
  seams will come back there; the layer approach (or one pattern fill sheared per run) is the fix to carry over.
- A drawcheck-style seam probe for any draw laid column by column (count columns' overlaps where alpha < 1).
### Unresolved
- The faint vertical tone step in the out leg's soil above the race leg (x9085 upright, about x 285 css): pre-existing, not chased.
- The out-leg framing upright is now about 8-11% lower for Pokey on 2-7's out leg; looks right in the stills, but not judged on a run.
### Method update (render-fix.md)
- Step 4 add: "When a band of evenly spaced vertical lines shows, measure their spacing in world units first: 16 = groundStack's column
  step. A draw laid in overlapping translucent columns doubles its alpha at each overlap; draw whole paths instead."
- Add: "A still tool that places Pokey on 'low' can put him on a drifting log or in water: check the lives counter in every still
  (x3 -> x2 '-1' means he died and the shot is at his respawn, not the spot)."
### Turnover note
- reference/handoffs/engine-core.md 0zq-floor (commits f3649a092, 3aa389ad9).
Lessons applied: D115 (every gate on a chattr-frozen tree), D119 (no heredoc in a commit chain), D109 (no clock times to the lead), D131
(drawcheck with 2-7 on the merged head), the box (an exact next step pushed at the 28-minute mark).

## DRESS-27b (Engine, draw code; DRESS-27's successor). Started 3:42 PM ET 11-23. Branch t-eng-27-wip-dress27b.
### Polish check (stills-27b/: 2-7 seed 1 Normal, phone 2x, BEFORE = t-build-27-wip + 80dbc46d8, AFTER = the same + this fix)
- Both breach spots, x9061 and x13298, Pokey on the low ledge and the high one, upright and sideways: sheet-*.jpg (before | after |
  pixels over 40 apart) and zoom-*.jpg (the rivers, before over after). Same look: the deep river, the still pool, its stones, the soil
  under its bed, the wedge under each bank, the roots, the logs' waterline and foam. The only pixels that differ are animation phase
  (the logs drift, the reeds and the hummingbird move: 0.1-1.6% of pixels, all on moving things). Nothing rough found; nothing changed.
### Done-items
1. LANDED: t-eng-27 = **cfa555cc9** (fast-forward, no force; ls-remote equal) = DRESS-27's 1bb560fb8 + t-eng-27 d1fad7e65 (ENG-BOT27b;
   engine-core.md conflict, both sections kept). tsc 0; planted 10/10. lockall 16 layouts, 80dbc46d8 vs 09c23c1b0: 102/102 stages,
   3264/3264 builds unchanged; cfa555cc9's src/ and tools/engine byte-identical to 80dbc46d8 (the new commits: tools/inspect + reports).
2. 2-7's 6 breaches fixed at their cause, the shared river draw (engine.ts drawRivers, riverArt.ts drawRiverWater/drawSafeRiverOver),
   with three general helpers (drawThrift.ts): gradients made once (vGradient), a picture cut by its source rect instead of a clip
   (cropToBox: the soil under a bed via groundPaint.ts drawSoilCut, a log's waterline), and the river's box, ceiling and bank faces in
   one clip where one does (polygonInBox; groundStack.ts aboveLinesPath; a TAIL's clip folded into the box). No limit raised, no piece
   moved, no stage id/seed/x. Planted: drawThrift.test.ts (4): RED on the base (module missing), GREEN now.
3. 2-7 drawcheck, 16 spots (drawcheck27b-2-7-before.txt / -after.txt, worst spot each):
   | | gradients | drawImageScreens | clips | verdict |
   |---|---|---|---|---|
   | port before / after | 4.13 / 0.25 | 7.61 / 6.04 | 21.00 / 10.00 | 3 breaches / PASS |
   | land before / after | 5.00 / 0.00 | 7.90 / 6.56 | 24.13 / 10.00 | 3 breaches / PASS |
   Gates on frozen 152e53549 (= cfa555cc9 + the fix): drawcheck on the listed stages PASS (866 s); clipcheck
   PASS (83 known, 770 s); vite build (BASE_PATH) 0, chunkcheck PASS, artcheck PASS.
   tsc 0; generalitycheck PASS (26 known); knowncheck PASS; draw/river/ground tests (28 files) 192/195: the 3 reds (pacerLay x2 'bot
   (planted)', stumps 'a log on a stump') are the same 3 on cfa555cc9 without the fix: inherited.
### Pushback: none. ### Suggestions: other per-frame gradients and clips could use drawThrift.ts (vGradient, cropToBox): the remaining
   clip sites in the limits.json notes (temple runs) are the next candidates; a packet when the lead wants the clip limit lowered to 6.
### Unresolved: none of the 6. Not run: the full suite (item 3's list does not name it; drawing only, as DRESS-27's landing).
### Lessons applied: D115 (every run on a chattr-frozen worktree), D119 (no heredoc in a commit chain), D36 (branch named, ls-remote),
   law 22 (cause fixed, no limit moved), D51/D81 (2-7 drawchecked as a listed stage would be).
### Turnover note: reference/handoffs/engine-core.md §0zq-thrift (this commit).

## EXACT NEXT STEP (handover at the lead's word, 3:41 PM ET: context past the line; nothing landed on t-eng-27 yet)
- Merged head to land: **80dbc46d8** on t-eng-27-wip-dress (= my work 09865f026 + origin/t-eng-27 09c23c1b0, one note conflict, both
  sections kept; tsc 0; planted tests 10/10). Later commits on the branch are REPORT text only.
- lockall: NOT done on the merged head (both runs, 09c23c1b0 --out and 80dbc46d8 --out, stopped unfinished at handover: no result).
  Do: freeze a worktree at 09c23c1b0, `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-eng27.json`; freeze one at the branch
  head, `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-eng27.json`; expect 102/102 unchanged (my code draws only; READY-27's
  merge was 102/102 unchanged on 49d92b572 against 6b84c98f3).
- Then land (lead's ruling: drawing only; a clean merge + tsc + lockall, no fresh suite): `git fetch origin t-eng-27`; if it moved,
  `git merge --no-edit origin/t-eng-27` + tsc; then `git push origin HEAD:t-eng-27` (a fast-forward, no force); `git ls-remote` equal to
  HEAD; send the lead the hash.
- 2-7's own draw breaches (pristine t-build-27-wip, drawcheck with limits.json scenarios ['2-7'], spots 16; the same with this fix):
  port: gradients 4.13 > 2 at spot 11 x13298 (spot 7 x9061 with the fix, same value); drawImageScreens 7.61 > 7.5 at spot 7 x9061;
  clips 21 > 19 at spot 7 x9061. land: gradients 5.00 > 2 at spot 11 x13298; drawImageScreens 7.90 > 7.5 at spot 11 x13298; clips
  24.13 > 19 at spot 7 x9061 (24.00 with the fix). Files: reference/qa-reports/DRESS-27/drawcheck-2-7-16spots-base.txt and -fix.txt.


## Polish check (stills: reference/qa-reports/DRESS-27/stills/, 2-7 seed 1, phone 2x, BEFORE from t-build-27-wip 51ff9c43f)
- **Seam:** zoom-weir-pool-and-pole-before-after.jpg (Normal x15950, Easy x16700, sideways): the thin dark line with specks is gone across
  the whole falls; the foam runs into the pool with nothing new along the line. Upright and sideways: sheet-*-before-after.jpg.
- **Pole:** same zoom. It now goes down behind the weir's white water and fades out 56 px over the floor; the frog on its
  stone is untouched. Still plainly the World 2 bamboo climb (same art, same reach to grab). Fork taken: rooted behind the weir's foam,
  because it keeps the climb's own art and covers nothing else (the foam-in-front try hid the frog on Easy and made a darker box in the pool).
- **Porches:** zoom-porch-posts-before-after.jpg (Normal x11376, Easy x12002): every plank stands on two bamboo posts into the river;
  the water's own surface covers their feet. Rough spot I fixed on the way: the pole's fade first showed bands against white water (strips
  drawn one by one); it is now baked once under a soft gradient.
- Looked at on 2-1..2-6 (probe, both settings): no porch over water, no dress, so no look change there. Not looked at: 2-7 on other seeds.

## Done-items
1. Seam: cause in the CUT (rows 329-331 of the weir, fully transparent across the falls). weirseam.py repairs it, sheet repacked with
   READY-27's packer (frames/JSON unchanged). seamcheck.py: RED on the old sheet, GREEN now. PASS.
2. Pole: columnDress.ts dressFeet/footCut/cachedBake + protoArt.ts (general: any climb standing in any column dress). PASS.
3. Porches: porchPosts.ts (general: any solid canopy_bridge end over any river), drawn before the water. PASS.
4. Notch: NOT fixed (budget). It is every World 2 step, not 2-7 only: 2-3 x10600 shows the same square end of the pale band
   (stills/item4-notch-zoom-2-7-and-2-3.jpg). Cause area: the painted ground's cap at a leg's end (protoArt ground painter).
- Planted tests: columnDressFoot.test.ts (3), porchPosts.test.ts (2), columnDressLay.test.ts (+dressFeet): RED on the base (exports
  missing), GREEN on the head.
- lockall (base = my merge 6b84c98f3, 16 layouts, 102 stages): 102/102 unchanged on 49d92b572 (later commits draw code only).
- GATES (on the frozen candidate): see "Gates" below.

## Gates (frozen worktrees; logs in the session scratchpad)
- 34568db5c: drawcheck PASS (930 s, the listed stages); clipcheck PASS (83 known, 809 s). Later code commits: the bake's cache
  (canvas-loss re-bake) and posts with no clip (fewer canvas calls, the same look: stills redone).
- 2-7 is not a listed stage on t-eng-27, so I ran drawcheck on t-build-27-wip plus this fix, 2-7 alone at 16 spots (porches and
  weir included). FOUND AND FIXED: one clip a post took 2-7's porches to 28 clips a frame (limit 19); posts now draw with no clip.
  After: 6 breaches, the SAME 6 as pristine 2-7 (drawcheck-2-7-16spots-base.txt vs -fix.txt: gradients 4.13/5.00 at x13298 or x9061,
  drawImageScreens 7.61/7.90, clips 21/24 at x9061). These are BUILD-27's, inherited, none at the porches or weir: for the lead.
- tsc 0; generalitycheck, knowncheck, artcheck PASS; engine tools tests 39/39; seedlist 1-1 PASS (161); roadmapcheck FAIL (13)
  IDENTICAL on the base 6b84c98f3 (commits not in this history: inherited).
- Landing (the lead's ruling: drawing only, so a clean merge plus tsc and lockall on the merged head; no fresh suite): merged
  t-eng-27 09c23c1b0 (one note conflict, both sections kept), tsc 0, planted tests 10/10; lockall merged vs 09c23c1b0: see below.
  The suite shards I had started on 09865f026 were stopped unfinished (no results claimed).

## Pushback
- The column dress (W2_WEIR, columnDress*.ts) was not on t-eng-27, only on t-build-27 via t-ready-27-wip; I merged t-ready-27-wip
  into this branch (READY-27's six commits land on t-eng-27 with mine). W2_WEIR is in w2.ts, not w2Sections.ts.
- Item 1's cause is art (the cut), Content's lane: fixed in the shipped sheet; the cut file on main still has the gap (Suggestion 1).

## Suggestions
1. Content: replace reference/art/hfnext/cut/weir.png on main with the repaired cut (python3 -I reference/qa-reports/DRESS-27/weirseam.py
   in out); then the sheet and the cut agree.
2. Critic: add seamcheck.py's rule (a see-through row across a frame) to tools/perf/artcheck for every sheet; done: it never ships again.
3. Engine packet: item 4 (the step's notch) in the painted ground's cap, every World 2 step; done when 2-3 x10600 and 2-7 x1300 show the
   floor's band ending under the bank's overhang with no square end, lockall unchanged.
4. Also seen (not mine): a thin black sliver on top of the raised bank's grass at 2-3 x10600 and 2-5 x14250 (stills/notch-*.jpg).

## Unresolved
- Item 4 (above). 2-7 checked on seed 1 only.

## Method used / Lessons applied / Method update
- Used: stage-fix, render-fix; stills: DRESS-27/stills-live.mjs (BUILD-27's, its playwright import fixed for a CJS build).
- Lessons: D6 (a baked canvas re-bakes on loss, tested), D16 (every prop stands on something: the porches), judge every state
  (Normal and Easy, upright and sideways), freeze the tree before a heavy run (D115).
- Method update (render-fix): when a painted piece shows a line, decode its frame's alpha first: a see-through row in the cut is
  invisible in code review and costs minutes to find with seamcheck.py.

## Turnover note
reference/handoffs/engine-core.md: section 0zq-dress (this commit).
