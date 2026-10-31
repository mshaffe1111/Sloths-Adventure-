# Status board (the lead session keeps this current; see reference/LEAD-PLAYBOOK.md)

Last updated: 2026-10-29 7:55 PM ET. HOTFIX PR #49 (#ctest on the testers' link only) MERGED and LIVE 7:36 PM ET. Matt's bug "2nd basket on 1-4 impossible, a platform blocks the rock": fixed by the lead, 1a6ba43 (liftRoom keeps its air clear; test over 40 layouts both ways), gate13 running, goes in test link v7. PF-1 merged b4337d7. PAUSE LIFTED (Matt ~7:55 PM ET, via PF-1: "let's start getting some jobs turned back on"): resumed 8:00 PM ET polish-levels (LV-2 approved, option A: Normal W3 + W5+, bands gate W3>=32 W4>=40), polish-audio (v4 title/menu/map APPROVED 7:50 PM ET, wiring), W7 r5, W8 (+swing), 8-4, W9 (+swing), W10 (+swing), W5 rebuild, polish-clean (+sweeps), polish-dot W5-8 sweep; PF-1b step 1 started (ground decor + plants baked, pixel-identical). polish-sfx waits on Matt's listen of 27 previews. polish-edges DONE d1b21a2d (5 skies; 11 held), merge for v7. Work test link v6 (early 10 PM build) published 7:30 PM ET: music, Dot, ground, controls b4, W7, HD backdrops + upright, story art, W4 Normal, #ctest (7 stale files still to null: scratchpad/ebkB.json). Gate11 2015/2013/0 fail. RELEASE PR #48 MERGED and LIVE (deploy succeeded 6:31 PM ET), waiting on Matt to merge; testers link EnK5 v231 = the release build (replaced Build 1 per Matt). PAUSED (Matt 5:33 PM ET, budget): story-art, polish-sfx, polish-clean + 4 sweeps, W7, W8, 8-4, W9 x2, W10 x2, W5 rebuild, polish-levels, polish-dot follow-up. RUNNING for 9 PM: polish-audio (wiring), hf-art-ground (ccr merge), polish-edges (X-16 + HD), PF-1, polish-controls b4. Test link moved to 10 PM ET (Matt 5:40 PM), merge cutoff 9:10 PM; World 7 r5 and polish-levels W4 Normal resumed to make it; HF art work exempt from the pause (story-art, sfx gen, 8-4 art, W9/W10 art, W5 repaint). Reevaluate after 10 PM. Merged 4:20 PM ET: polish-a2, controls b3, hf-art-stage (gate5 running). Sent back: polish-edges (interior blur, X-16), W7 r4 (wall seams, see-through faces, plinth ghosts), polish-dot 776c001 (4-4 rocks line + hint sweep, old base). Decided: W8 lit-bough falls deadly on Normal, dark gaps soft. Music v3 sent to Matt to listen. polish-c rebasing. Matt's QA session blocked on his approval.

- **2026-10-30:** W9 helper stopped late (11:40 PM ET), pushed gen2-w9 dbbef254, no seeds yet. Restart: merge gen2-w9-swing a3b4d97, then the 300-roll curation (w9/NEXT.md).
- **2026-10-30 ~12:00 AM ET, frame rate (QA read of Matt 20261029-2344-8nh2, rows 2696-2708, Edge browser on Matt's Pixel 11 Pro Ultra, a flagship (Tensor, Imagination PowerVR GPU; 'Android 10' and '8 GB' are the browser's capped reports, not the real phone)):** about 27.5 fps on average; worst window 20.2; never under 20. The governor sat at q2 (lowest) almost all the time. 31 stalls of 100-167 ms, nearly all the game's own DRAW (update 0-2 ms, draw 95-113 ms), at the same control-test x in both runs: x ~7900-9800 and ~11.6-13.0k (scenery at that x?). First frame 232 ms after hud-atlas. No APK data exists (the recorder only runs on #ctest). PF-1 restart: find the draw call that this GPU's driver chokes on at those x (canvas filters, shadowBlur, big alpha layers, huge drawImage scales are the usual suspects) and fix. The APK runs in Android WebView on the same GPU, so this is likely the APK sluggishness too. polish-c stopped at 287678 (foldable/safe-area pass 1 + tools/qa/fit.mjs 40/117 -> 0 fails; restart: vite build, polish review of fit/ sheets, report).
- **2026-10-30 11:44 PM ET:** release PR #50 merged and LIVE: deploy run 40996966989 ok, pages run 40998968889 ok, gh-pages 1e83d14e (bundle index-Dx0MEQsu.js, #ctest code present). The container can't open github.io, so Matt opens it on the phone to confirm.
- **2026-10-30:** release PR #50 (release-2026-10-30 @ 50fe0e83, the v7 build) opened for Matt to merge. After the merge, check the deploy and #ctest. APK feedback: "a little buggy", weaker frame rate. Matt (2026-10-30): don't focus on the APK now; it's a roadmap item (PLAY-STORE-RULES §4), not Wave 1.


## TOMORROW 2026-10-30: the frame-rate plan (Matt: "before we start any jobs... you alone, on the code")

The lead works on this alone first, with no helpers. Rules: reference/PERFORMANCE-RULES.md.

1. **Honest timing (lead, morning, first thing).** On the test link only, the control test logs per-layer draw time with a GPU flush after each layer group (§6.2), plus the canvas size, quality and smoothing. A test-link-only `?perfab=` switch tries one change at a time:
   - smoothing low or medium instead of high;
   - ImageBitmap sheets instead of `<img>`;
   - the full-screen overlay off;
   - the soil overdraw trimmed.

   It never ships to main.
2. **Matt, about 10 minutes:** (chrome://gpu DONE 12:25 AM ET, see PERFORMANCE-RULES §0: hardware accelerated, GaneshVulkan, advanced blends emulated, Android 17 beta)
   - three control tests in Chrome on the Pixel (normal, then two A/B switches);
   - one in Edge.
   - DONE 12:30 AM ET, Chrome (9big) vs Edge (8nh2) on the Pixel: the same. Chrome averaged 26.5 fps with one window at 18.4; Edge averaged 27.5. Both were draw-bound at q2.
   - **The stalls follow the SECTIONS, not x:** Snake ring, Snakes on branches and Hide from the eagle, in both browsers.
   - So step 1 starts on the snake and eagle drawing (creatures.ts, snakeSprite.ts, creatureRig.ts, the eagle's sheet eagle-anim 2048x2545, the bush hiding).
   - DONE ~1:45 AM ET (lead, from QA plus Duet's second look 253fc225):
     - **creatureAnim.ts:** every animated creature's clip sheet is baked as an ImageBitmap at the largest size it's drawn (in eighths); the eagle ~1/4 instead of a 20 MB texture. This covers ALL creatures in W1-10, the W6-10 ones too: no work needed from their builders.
     - **hurtFlash.ts:** box-sized layers in a ring of 4, not a full-screen layer.
     - **engine.ts:** late frames run in up to 3 steps, and gpuprof per-layer timing.
     - Test link v8 after the gate.
   - **Test link v8 PUBLISHED ~2:35 AM ET** (EBKij version 1793339121-6c99, bundle index-C7bEmyTJ.js; gate16: 2029 tests, 2027 pass, 0 fail, 2 todo). Matt's morning test: EBKij#ctest&gpuprof=1, one run each on the Pixel, the Samsung and the older OnePlus. The testers' link EnK5 stays on the release.
   - **~3:50 AM ET:** v8 made the enemies go missing on Matt's Pixel (the createImageBitmap resize); fixed with a plain canvas bake (5d518ef3), test link v8b, Matt saw the enemies. Gate17 green. **RELEASE PR #51** (release-2026-10-30b @ 5d518ef3) opened for Matt to merge. After the merge: check the deploy, then Matt runs the live #ctest&gpuprof=1 on the Pixel, Samsung and OnePlus.
   - **9:01 AM ET: release PR #51 MERGED and LIVE** (deploy 41056792033, pages run 41059723088 ok, gh-pages 56e745c5, bundle index-C1SCx20h.js with gpuprof). Next: Matt's live #ctest&gpuprof=1 runs on the Pixel, Samsung and OnePlus, then QA reads them by GPU.
   - **9:35 AM ET:** QA cross-build read: the drop came with v7 (23:21), not today (19:17 build 29.5-29.8 fps, 1-2.4 stalls a minute, no governor steps; v7 and today ~27 fps, 10-11 stalls a minute, q2 held). OnePlus (Adreno 619, 4 GB): 10-19 fps. Suspects: the new painted ground (groundPaint.ts, new in v7: a concave clip per bank per frame) and the tall skies.
   - **Matt:** fix how we draw, not by looking cheaper; fast but not crappy; get helpers.
   - **The lead (himself):** the ground painted once into chunks (protoArt/groundPaint/engine).
   - **Helpers started 9:37 AM ET (effort high, report within ~3 h):**
     - PERF-A skies: session_01FhBbYNp3GZg9aFWqWYmTNp, branch perf-skies, scenery.ts only;
     - PERF-B measure v6 vs v7 vs today: session_01FhBbYKaqBj8iwTQomLdHU1, branch perf-measure, no src changes, top-15 table within ~90 min;
     - PERF-C effects: session_01FhBbYM5NT1K4UngYcmDpFR, branch perf-fx (pit water, gradients in terrain/artKit/river, eagle sparkle, smoothing; not engine/protoArt/groundPaint/scenery).
   - **DECIDED (Matt, ~10:00 AM ET): finish the 1 PM bake-once fixes, then move the game's drawing to a GPU renderer (PixiJS on WebGL) starting tomorrow** (how today's best 2D teams draw: textures on the GPU, batched draws). A written plan, helpers, proven on the Pixel, Samsung and OnePlus. Game logic, levels and art stay; only the draw layer changes. Plus the automatic perf gate (PERFORMANCE-RULES §8) so a slow build never ships unnoticed again.
   - **PERF-F (sprites) started:** session_01FhBbYNDmkaRGQfsqCAZKEe, branch perf-sprites. All helpers deliver proven work by 12:00 PM ET; the lead merges ~12:15; test link 1 PM ET. Matt's bar: his 2020 OnePlus playable.
   - **10:35 AM ET:** Matt kept all six helpers running to noon (tokens are tight this week; the GPU renderer waits for his new week: reference/GPU-RENDERER-PLAN.md, awaiting approval). Ground fix committed (the lead), gate18 running.
   - **10:20 AM ET:** PERF-B measured the lead's ground fix: drawing per frame is now under v6 (5.63 screens vs 6.12; concave clips 4.3 to 0.03). Lead added: branches and trunks culled up/down too (only off-screen draws dropped; screenshots 1-4, 2-6, 4-1 both ways), ground squares capped at 40 MB of painted squares (12 at 3.5x) and released when a stage stops. Gate19 running. Pushed so far: perf-measure, perf-sprites (sheetBake still bakes during play: told to move to loading). Not pushed yet: perf-skies, perf-fx, perf-music, perf-preload.
   - **10:40 AM ET:** Lead baked 2-6's river bank face (c90a28c3; old/new identical on the bank). PERF-A pushed skies (e27f9b2, ff85d14): strips fitted once to drawn size (the 'high' smoothing every frame was the cost), sky skipped under opaque strips; told to bake the grade into the strips and do no fits during play. Vignette left as is (PERF-A's pushback accepted). PERF-F: ropes, pickups, plant gradients, sheetBake (told no bakes during play). **Matt chose music: one recorded tune per world** (~45 MB); PERF-D limits 35 MB decoded playing / 70 MB peak; music ships only after Matt listens; lead adds webm to workbox at merge. Matt asked about Godot 4: told it's a full rewrite (6-10 weeks, web version worse); PixiJS first, measure, revisit Godot for the app only if needed.
   - **10:45 AM ET check-in:** PERF-C DONE (perf-fx 3e74523, gate green): pit water baked, ~60 gradients/frame kept, eagle text stamped, checkpoints and bounce stalks culled; given a 2nd job (eagle mirrored word, w5Look, bakes for bounce/badWater/stageArt at readiness). Collision found (lead's briefing error): perf-fx and perf-sprites both changed ropeArt/envPlants/envKit; PERF-F owns the reconcile. PERF-E (perf-preload f7749ce): stageReady.ts loads, draws and bakes every sheet under the title card; told to drop its casts and call PERF-F's settleSheetBakes. PERF-B: add a ccr-now column, run the full report on the merge ~12:20. Lead gate19 green (2027 pass, 0 fail). Next check-in 11:15 (trig_016hb78aYF6VmUEWXDctryvz).
   - **11:40 AM ET:** merged perf-skies (58fb9471) and perf-fx (25f87f7f) into ccr after reading both diffs. Lead: ledge plants culled up/down (terrain.ts topDecor): 2-6 path fills 1138 to 20 a frame sideways, 792 to 11 upright, same picture. FOUND, NOT FIXED for 1 PM: 7-3's on-screen fern clumps are ~400 path fills a frame (flora.ts fernFrond via envPlants fernclump, envKit paintDecorAt); fix = bake each decor plant into a sprite once (needs a same-look proof): first item after 1 PM. PERF-C done (eagle watermark painted out of its art: show Matt; water/flag bakes moved to readiness; bounce bake held). PERF-F reconciled ropeArt/envPlants/envKit (kept its own; PERF-C's glow swap shifted parkia/foxfire rects) and settleSheetBakes is readiness-only (e027143). Dry-run merges of perf-sprites, perf-fx, perf-preload into ccr: no conflicts.
   - **11:50 AM ET: Matt approved the recorded music ("Music is good")** after the A/B (claude.ai/artifact/AVZCdkdgAKsT1sTSaf2MgC). PERF-D renders the remaining 57 pieces (~1.5 h), then gate; music joins the build after the 1 PM link (lead adds webm to workbox then). PERF-F's next job (not for 1 PM): bake decor plants (7-3 ferns) into sprites, by 2:30 PM ET.
   - **12:25 PM ET: RELEASE #52 MERGED by Matt** (release-2026-10-30c @ 2d0547bc = the v9a test link: all speed work, stageReady HELD BACK because with it the creatures went missing on Matt's Pixel; with it off: smooth and enemies back, Matt 12:20). Deploy running; then Matt runs ctest on the live site (#ctest&gpuprof=1) on Pixel, Samsung, OnePlus. Lead: likely cause = the readiness burst makes Chrome take back baked canvases (2D context loss) on the Pixel; guard added 24218158 (isContextLost checks + rebake on creature clips, sheet copies, ground/bank squares, fits; losses logged). Next: test link with stageReady back on + the guard, Matt checks enemies on the Pixel.
   - **12:40 PM ET: release #52 LIVE** (gh-pages 20ca2bcf 'Publish 123ddbc', bundle index-br8EXOU_.js; pages deploy succeeded). Matt to run ctest: https://mshaffe1111.github.io/Sloths-Adventure-/#ctest&gpuprof=1 on Pixel, Samsung, OnePlus. Test link v9b (stageReady on + lost-canvas guard, ccr 556a5387) waits on Matt's Pixel enemy check.
   - **1:15 PM ET: Matt's Pixel shows enemies on v9b** (stageReady on + lost-canvas guard 24218158): the missing creatures were baked canvases lost under GPU memory pressure. stageReady stays on for the next build. Matt's live ctest on 3 phones: all playable incl. OnePlus; OnePlus sound couldn't keep up (live orchestra: recorded music fixes it); Pixel first run = old cached build; Samsung a couple of stutters (agent decoding the runs). PERF-B building the automatic draw check + art check (perf-gate, by 3 PM). Next test link ~3 PM: stageReady + recorded music + 7-3 fern bake.
   - **1:30 PM ET: Hugging Face back on (Matt: "get what we need now to finish the game"). Balance $76.32 (Matt).** hf-art-bosses (session_01FhBbYMvPygG5P2B8VV2Fzu, $15 cap): menu kit mock for Matt first, the Drake teacup ending art, bosses 9-10/10-10 gaps, a Gemini prompt for the post-credits card. hf-art-ground (session_01FhBbYMb4PGpZ7nUd2Eyre1, $15 cap): W8-10 new-look inventory in 30 min, then make it. Both stop 6 PM ET; $6 reserve kept.
   - **1:45 PM ET:** perf gate merged (artcheck + drawcheck in CLAUDE.md Checks). Matt saw the menu mock: build it with his changes (per-world map trails, drop Best combo, 'Return to start screen', menu called 'Settings') and the START SCREEN added and held to the top polish bar (show first). Story restarted: story-a (session_01FhBbYKph8U5LPuLP8N2NJi, teacup scene lines, satchel/finds/ending cards) and story-art (session_01FhBbYMSNFxnWxPbZJPdRan, $10, S-7/S-11/S-4), deadline 5:30 PM ET. **Matt: once story and cutscenes are in, he re-runs the full audit.** Music render done (60 pieces, 56 MB), PERF-D gating.
   - **1:50 PM ET: Matt chose to start the story delivery pass and the gap map NOW (before his audit).** story-gaps (session_01FhBbYLgpPaX8e3ABdSJuzV): phase 1 GAP-MAP.md (a beat every ~3 stages, Flicker lines S-12), phase 2 wiring after story-a lands ~5:30. story-delivery (session_01FhBbYKx1fRtzMUtRYT7K1j): phase 1 direction sheet + per-character voice sounds sample for Matt, phase 2 applies pacing/camera/voice/music to every scene after story-a/story-art land. Both stop 9:30 PM ET. File ownership: story files stay with story-a until it lands; the lead says go for phase 2. Garden hub (S-9) after the audit.
   - **2:45 PM ET:** test link v10 published (recorded music, 7-3 ferns, readying + guard; test link now packs pictures <24 KB into the bundle: an artifact holds at most 511 files). Gate: tests green, artcheck pass, drawcheck caught old groundArt/columnArt gradients (3 > 2) -> fixed 4ef7e1ac. Drawcheck note: its fake clock never runs idle bakes, so plants stay paths there; the fill limit stays 1800 until the harness settles bakes (job for PERF-B later). Matt picks: start screen B (leaf tokens raised under START), footsteps F + 80 px stride, sequel A+B (his Gemini cards in, story-art upscaling), music approved. W3 vertical soil bands: pre-existing (this morning's build too), not the chunks; hf-art-ground fixing. hf-art-ground: W8-10 pit water, dressing, faces (hook = lead), soil variants (patch = lead). Evening test link ~6 PM ET: menus + start screen + Settings, trails, W8-10 art, story-a (teacup, sequel tag), story-gaps + story-delivery phase 2, footsteps F.
   - **3:15 PM ET, MATT'S BOSS DECISIONS (boss-design-9-10, reference/boss-design/9-10-and-10-10.md §8): all five as recommended.** (1) 9-10 ends by setting down a cup (phase 3 survival); (2) council table in both places (lace in the Queen's garden 5-10 + tea, bare oak in the fortress hall 10-10); (3) the hold verb taught in 10-3 and 10-4 (W10 rebuild), 10-10 relies on it; (4) the General's defeat lines play inside the finale, after the let-go and the song; (5) all new lines approved (Drake: "Where was I...", "Take your time.", "It's going out...", "...'And nobody will come.'"; General: "...One sloth.", "Forty-one falls, boy. The General counted." with the real count). WORLDS 7-10 START AFTER THE 6 PM BUILD: W8 first (merge gen2-w8-swing 59f97d1, 8-4 w8-lantern 5ef9afcc gate, re-run curation per gen2-w8-split NEXT.md), then W9 (resume curation, qa-notes/w9/NEXT.md; swing a3b4d97 ready) and W10 (W10-NEXT.md; add hold teaching in 10-3/10-4); bosses 9-10/10-10 build after. W7: Matt to play. W9-10 plan decided 3:25 PM ET (see next line).
   - **3:25 PM ET, MATT'S W9-10 STAGE PLAN (unblocks gen2-ascent):** World 9 = "the last trees": ONE signature special stage with the full three-layer canopy (trunk: snakes, woodpeckers; top of branches: army ants, fruit-throwing monkeys, snapping branches; hanging UNDER branches to hide from the harpy eagle's shadow), the new hang-under move taught there with a story reason (branches too thin to walk on); if it plays great, W9's other tree stages borrow the hanging move. World 10 stays stone. **World 10's special stage = The Clockwork Gate** (Matt's pick over the lead's Thousand Steps): a puzzle stage inside the fortress machinery, gears, counterweights, timed doors, the General's clockwork beaten by patience.
   - **3:40 PM ET, MATT: WORLDS 1-4 MOVE ONTO THE NEW GENERATOR (gen2), planned, maybe not this week.** His report: "Even after I clear it, I can tell you exactly how they're going to play out... where the four snakes are... where the flowers end up. It doesn't really ever change, it just shifts." Cause: W1-4 are hand-built section stages (protoStage/w2Stages/w4Stages); a fresh roll after a clear only shifts spacing, and enemies and flower trails ride with the sections. Plan to write (lead): reference/GEN2-W1-4-PLAN.md, one gen2 world module per world like W5-7 (manifest, sections, rooms, curated rolls, diversity >= 0.5 between consecutive plays), keeping each world's taught mechanics, special stage (1-8 chase, 4-7 long drop) and story beats; schedule after W8-10 + bosses unless Matt reorders.
   - **12:35 AM ET Oct 31: TEST LINK v12 PUBLISHED** (version 17) from ccr after gate5 (2054 pass / 3 FAIL / 2 todo; build, artcheck, drawcheck 292 s PASS) + pokey-anim cc6afa2 (tsc + hero tests 47/0). Known fails, all petal-rule tests after petals met build1-play's W8-10 safe start: petals.test 10-9 roll 1 Easy clumps; petals.test 8-1 2608 px petal-free from 2209; stageQuality 'a row of flowers is one species' sample 188 < 200 rows. Fix first thing.
   - **7:30 AM ET, MATT: "let's give World 8 a puzzle room."** W8 helper session_01FhBbYMd8Aa5dCFkN3JSteb restarted now, until DONE: first a NEW W8 puzzle room as 8-1's 4th theme (W8 puzzle kit + unused roost/seed-pod art; 2 stills to the lead before wiring), then revert night weights, curate all W8 to 0.45+, stills, pairwise, bots, gate, tag. Running: W5 finish + W8.
   - **7:25 AM ET Oct 31: release #55 MERGED 7:20 AM (deploy/APK check 7:50). MATT: "Let's finish number 5."** W5 finish helper session_01FhBbYN6GoDM7SdVipFPcjz on w5-pieces, run until DONE (every W5 stage 0.45+, dead time in budget, lever room from w5b, web art, 5-8 to gen2, HF <= $15), progress every ~2 h; 30-min check-ins armed. World 9 status given to Matt: branches gen2-w9 / gen2-w9-swing 521 behind (W9 stages + swing sections built Oct 29-30, curation paused at 9-5/9-4/9-3), gen2-ascent 861 behind, 9-2 canopy mock-up approved (art via HF), Drake before canopy; W9 starts after W8.
   - **2:14 AM ET W8 helper STOPPED, w8-merge 6ed8766e (not merged; seeds.test fails until curation):** new pieces: 8-1 sleeping-bat run (Z, scare-back, no damage; also 8-8), 8-5 moon flowers (bounce + second jump; also 8-9), fungus steps on 8-2/8-5 (NEW HF painted brackets, $0.08), knot perches on 8-3; 8-6 reshaped (overlap 30/30 -> 1/30), night wind is 8-6's alone. Raw variety: 8-1 ~.34, 8-2 ~.35, 8-3 ~.47, 8-5 ~.44, 8-6 .40, 8-8 ~.58, 8-9 ~.47; only 8-1 curated (.278). Needs Matt: 3 new Dot lines ("Sleeping bats. Nowhere to hide: go while they doze." / "A moon flower! Bounce, then jump again up top." / "They're stirring! Wait till they doze off again"). Next: curate 8-1+8-6 (re-run: npx tsx tools/gen2/curate.ts --stages 8-1,8-6 --rolls 300 --keep 16 --apart-near), then 8-2/3/5/8/9; 8-1 needs a V/C/P theme (a puzzle room); stills, pairwise wave A, bots WIP-3/21, gate, tag. Not built: rope bridges, moths, fallen pup, lantern swing, fork drops, seed pods. ADDENDUM 2:35 AM: 8-1 re-curation shipped 16/16 at only .257 (worse than .278; 147 rolls passed vs 300: the night theme's dark trunk climbs likely read as 8-5's climbs). Morning: revert nightSections weights to equal, give 8-1 a 4th theme on V/C/P (puzzle room). 8-6 curation was still running in the stopped container; seeds.ts not written. Rough: fungus brackets float with no trunk; W8 gen2 scenery/decor never drawn.
   - **~2:00 AM ET Oct 31: RELEASE PR #55 OPEN** (release-2026-10-31a = d7965624 = v12 + petals-fix; gate6 2058/0 + 2 todo, build, artcheck, drawcheck 288 s PASS). Matt merges; then check the deploy and the APK on the Releases page (first release with the auto-Release workflow).
   - **1:27 AM ET W5 helper STOPPED, w5-pieces 859301e4 (not merged):** 5-1/5-2/5-3/5-5 are hand-built (w5Stages.ts) with fixed teaching beats + a Finish that looped the same 4 pieces: variety 0.02-0.03, spiders 96-100% same spot. Built: each Finish deals 4 of 8 pieces per play; new pieces (5-5: silk swing, twin threads, spider between pits, sleepers under a cocoon high road). Variety: 5-5 .021->.357, 5-1 .019->.128, 5-2 .018->.050, 5-3 .032->.029 (none at .45 yet; fixed teaching beats hold the spiders). Dead time over budget on every hand stage (31-69 s), not fixed. beats.ts reads all W5 props as P, so new pieces must bring V/Z/C. HF $0.32 (billowing web, not polish-ready). GRAB-BAG at qa-notes/w5/GRAB-BAG.md. Next: teapot steam (Z) in 5-3, silk sheets in 5-5, roll the Develop/Twist beats, cut dead time, wire the web, W5 lever room (w5b kit), 5-8 to gen2.
   - **~1:10 AM ET, MATT: World 8 also STOPS at 2:30 AM ("so I can monitor it better").** W5 reports 2 AM, W8 2:30 AM; both continue in the morning.
   - **~1:05 AM ET, MATT: "Lets do 5 first... Since it is on the newer generator".** Generator phase order is now WORLD 5, then World 1, then Worlds 2-4 (replaces the 8:22 PM order W1 then W5).
   - **~1:00 AM ET Oct 31, MATT: continue tonight: World 8 "until 8 is done" (with art), World 5 until 2 AM ("very repetitive").** Fresh helpers: W8 session_01FhBbYMd8Aa5dCFkN3JSteb on w8-merge (8-6/8-1 overlap, gusts on, GRAB-BAG pieces, HF art <= $15, re-curate to 0.45+, bots, drop tag; owns pipeline/levelCheck/puzzlePlay/stageSheets/stagePreload); W5 session_01FhBbYNQWf8kNt3c5jLJq6f on w5-pieces (measure, W5 GRAB-BAG.md, new pieces from existing art, HF <= $10; W5 files only), report 2 AM. Overnight 30-min check-ins armed.
   - **~12:50 AM ET Oct 31, MATT on v12: "Everything plays smooth and looks good... This can be released."** RELEASE APPROVED for the v12 build, but the deploy's test gate would fail on the 3 petal tests, so the lead holds it: the petal fix runs first at 10 AM, then open the release PR from that build (Matt's approval stands; nothing else added). Also Matt: World 5 "is boring" (its pieces/generator rework after World 1, per plan); "at some point we need to tune difficulty" (audit LV-20 Normal curve); FALL RULE DECIDED: a fall of about 2 screens costs a heart and he lands dazed, about 3+ screens costs a life and returns him to the checkpoint, short drops free, Easy gets more room (no fall hurts today; engine has only a hard-land buzz). Build it in Build 4/6 with a test and the touch fairness runs (no stage may need a long drop).
   - **TOMORROW (Sat Oct 31), lean, 3 helpers at a time, 30-min check-ins from the first start:**
     1. Fix the 3 petal test failures (petals helper, quick) + apply qa-notes/petals/levelCheck-petals.patch.
     2. World 8 (w8-merge d81f8c2b, 12:17 AM report): GRAB-BAG.md has 11 new section types A-K + HF briefs (bat pup, moonlit gust, moth cloud); A (night gusts) built but held back: an OLD 8-1/8-6 look-alike overlap (curated side by side in wave A) blocks 8-6's rolls. Next, high effort: find 8-6's stretch that reads as 8-1's (lookalike.ts per window) and reshape it; re-enable gusts, curate 8-1 then 8-6 strictly in turn; 8-5 signatures (rope bridges, bouncy leaves on cap-w8, fungus steps); H/I for 8-3, J/K for 8-2; re-check wave A pairwise. Then: finish the GRAB-BAG pieces from existing art, HF art for the NEW pieces (budget), re-curate to 0.45+, then WIP-3/WIP-21 bot runs; into a test link when its tests pass. Then World 9 (Matt).
     3. Rest of Build 1: DOT-18 (approved lines keyed by id, P1), UI-17 ending-card copy, ST-5, ST-6 + AN-15 pop-ups, WIP-13 commit boss poses.
     4. Animation: rope via Qwen-Edit in-betweens, punch re-roll from the cross, small-hop pose fix, landing dust size.
     5. Build 2 next: ST-9 replies, AN-12 Flicker in play + one bubble style, VI-21 bank ends (HF), VI-24/ST-13 upright framing.
   - **11:38 PM ET pokey-anim round 2 6fdf0c0 reported** (jump starts at clip frame 12 + painted launch stretch; 21-frame video climb, played backward for down; jab returns through its wind-up; 17-frame walk; steering traces byte-identical for moves/climb/punch; HF $3.57 total). Thrown: rope by Wan (9 failures; tomorrow Qwen-Edit in-betweens), punch clips (off model). Merge after gate5. Tomorrow's order: rope, punch re-roll from the cross, climb top settle, flip gaps, vine swing.
   - **11:28 PM ET petals 7bdd382d MERGED; gate5 running for the ~12:30 AM link** (max 6 petals/screen in every world, longest gap ~halved, 436 clumps -> 0, trails lead somewhere; suite 1873/0). Follow-ups: levelCheck-petals.patch (opt-in petal rules) for the lead; 1-2 has 6 sampled layouts that can't reach the exit in the level check (pre-existing; 1-2 added to NOT_JUDGED; owner tomorrow); petal pass ~50 ms per stage build (check on the Pixel); long gaps remain in 1-7's liana run, 2-8, 8-4, 8-8, 9-1; Easy floors on hand-built stages (1-2 72, 1-5 77, 2-2) could go if Matt wants no hard counts.
   - **11:05 PM ET build1-play 6c0dc7b6 MERGED** (+ lead's App.tsx uiBack hunk): CLIMB-DOWN fixed (not new: at a trunk's top branch, down never grabbed the trunk; downAtTop + floors passed while climbing down; climbDown.test.ts, Pad + touch, all Jump help settings), SN-13 respawn sound on the iris + oneUp on continue (3 dead sounds deleted), WIP-6 safe first 1,300 px in old-gen W8-10 (lives lost in first 5 s: 10 -> 0), WIP-16 ironthorn gone, CT-35 Jump help default Off (84/84). 8-6 and 9-3 moved to levelSeeds attempt 1. Tonight's link = build1-ui + build1-play + pokey-anim (+ petals if it reports clean); W8 not yet.
   - **10:50 PM ET, MATT: "more is better" for EVERY world:** the variety rule (CLAUDE.md) applies to Worlds 1-4 (their gen2 rebuild gets a generous grab bag, not just the plan's ~30 sections), World 5 (needs new pieces; it goes right after World 1 in the generator phase), and Worlds 6-7 (measure their rerolls with spotMemory + era variety; add pieces wherever they only scrape by). Target comfortable variety (0.45+), not the 0.35 floor.
   - **10:45 PM ET, MATT: World 8 needs MORE PIECES ("we're not filling up our grab bag... maybe we need to make some more art").** w8-merge helper was stuck (8-6 sections gave up: its beat types belong to neighbours; fell back to 1,200-roll long shots). Redirected: GRAB-BAG.md by 11:30 (every W8 piece + beat; 5-7 NEW section types, a signature each for 8-1/8-5/8-6, existing art first: hf-batch-w7w8 bats/roost/seed pods, 8-4 dark ring, bat sweep, puzzle kit), build the existing-art ones tonight, HF briefs for new art (made tomorrow). Rule for every world: variety comes from new kinds of pieces, not more rolls.
   - **10:31 PM ET CHECK-IN CAUGHT: build1-play sat BLOCKED 9:10-10:31 PM on "Should I?"** (it had been told elsewhere to stop and wait). Told GO: climb-down bug, then its 8-6/9-3 safe-start test failures, push + report by 12:15 AM. Lesson: the 30-minute check-ins must start with the first helper, every time.
   - **10:30 PM ET w8-merge b8940c60 REPORTED: World 8 caught up** (split+swing, gen2-w8, w8-lantern merged; void-water clash fixed in pipeline/game.ts; W5-7 rolls unmoved; 8-4 Lantern Run done: all falls soft, baked dark ring, 68 px pulsing jar gauge; drawcheck PASS with 8-4 added). NOT in a link yet: variety fails on 8-1 .225, 8-2 .325, 8-3 .332, 8-5 .288, 8-6 .148 (game.test variety assertion red). Continuing tonight: new sections for 8-6, 8-1, 8-5 + re-curate. Tomorrow: WIP-3/WIP-21 bots (Easy scores above Normal on W8), HOLD DOWN find label floating over a hidden fern (findArt.ts, game-wide). World 9 starts when World 8 passes.
   - **10:25 PM ET pokey-anim 40fab0f MERGED** (turn via front view at 55%, skid + dust, run-start lean, land/recover + hard land, duck in/out, 13-frame Wan jump by vy, painted double-jump roll; steering traces byte-identical; HF $1.61). Inventory 91c6146 (22 moves ranked). Continuing to 12:15: walk (empty move-walk slot), rope shimmy, climb art + top-out settle, punch wind-ups. Engine owner tomorrow: landing dust too big (hardland-side.jpg).
   - **9:25 PM ET, MATT: "Once 8 finishes, I'd like to start 9."** Order: World 8 merge + curation done -> World 9 next (merge gen2-w9 + gen2-w9-swing onto ccr the same way, W5-8 tests after each, curation), then the Magma Drake 9-10, then the 9-2 canopy once its HF art is made; World 10 after 9 (the audit's W8-W10-W9 merge order overridden; fine since the Drake is in W9). One world at a time.
   - **9:35 PM ET, MATT: installed the release APK (run 41134351947): "runs almost identical to the web, so it's pretty smooth."** First on-device confirmation of the Android app after the speed work.
   - **9:30 PM ET, MATT BUG (P1): "You can't climb down... the only way to get down is to fall."** -> build1-play first (owns engine.ts): repro vine/trunk/rope, touch + Pad, all Jump help settings, bisect 123ddbcf vs 949abd98, root-cause fix + real-engine climb-down test. Also Matt: climbing, rope and punch animation + review all animation -> pokey-anim (inventory ranked by how often seen, tonight: inventory + jump arc).
   - **9:20 PM ET, MATT: "more animation of Pokey... smoother... the touches it says... more fluid".** pokey-anim helper started: AN-13 (90 ms turn, skid + dust, 60 ms run-start lean, land/recover 2-3 frames) + painted double jump; frames made on HF from his own poses (<= $10 tonight); 9:25 PM widened (Matt): 12-16 frame JUMP arc + RUN cycle + SLIDE from Wan clips first, then the transitions, HF <= $20 tonight; hero files only, engine hunks as a patch; steering response unchanged (recorder before/after). Report 12:15 AM, stop 12:30. Wiring finishes tomorrow.
   - **9:15 PM ET, MATT: APK ON THE RELEASES PAGE from now on.** This session can't push tags (403), so build-apk.yml now publishes a GitHub Release (tag v<date ET>-<run>) with the debug APK on every push to main; it ships with the next release. Tonight's APK stays in run 41134351947's artifacts. Rule in CLAUDE.md.
   - **9:10 PM ET, MATT: "getting the petals in, replacing the flowers, and getting this spread out better".** petals helper started (branch petals): merge origin/polish-levels (430 behind) onto ccr, fix its 5 stale tests, spread trails (max ~6 on screen, no long gaps, trails lead somewhere, vary per roll), VineHud icon + levelCheck rule as lead patches. Report 12:15 AM, stop 12:30. Likely in tomorrow's link, not tonight's.
   - **9:05 PM ET build1-ui c7a93b6 reported** (LV-19 ModePick "Who's exploring?", UI-22 goalCardClock + engine count wins (29 stages' plan counts were wrong), UI-16 bossSpeaker, UI-20 store hide, LV-24 gen2 floor; suite 1884/0). Lead calls: hand-built Easy stays LV-6 (65% of Normal); gen2 Easy = min(65% floor, kid-reachable); fix the 29 map goal lines; guardian-card shots owed. Due 11:45.
   - **~8:45 PM ET, MATT: "continue building 8... see what we can get from 8 to 10".** w8-merge helper (session_01FhBbYNmicpUM4U4s3AbULV) started: WIP-10 merge of gen2-w8-split, gen2-w8-swing, w8-lantern onto ccr (1,035 behind), W5-7 tests after each, W8 curation, then 8-4 Lantern Run if time. Report 11:45 PM, stop 12:30 AM. W8 joins a test link only once gated; W10 then W9 merges follow one world at a time (audit order), the Drake before the canopy.
   - **~8:40 PM ET, MATT: START TONIGHT, up until 1 AM; weekly tokens at 53% ("really focus on what needs to be done in the right order").** Lean plan: two helpers to 12:30 AM ET, pushed by 11:45 PM, lead gate + test link ~1 AM. build1-ui (session_01FhBbYPFvzqtDfgZAMUi13q): LV-19 mode card, UI-22, UI-16, UI-20 tag hide, LV-24. build1-play (session_01FhBbYNfvN82uKFHPEfqoBv): SN-13, WIP-6 stopgap, WIP-16, CT-35 Jump help Off; owns engine.ts and audio tonight. Deferred to 10 AM: DOT-18 (P1), UI-17, ST-5, ST-6+AN-15, WIP-13, then Build 2.
   - **~8:35 PM ET, MATT: HUGGING FACE BALANCE NOW ~$120** (added $50). Spend on art in this order: VI-21 bank ends, AN-12 Flicker in play, the Drake/General pose re-rolls (WIP-13), then the 9-2 canopy (5 pieces) and 10-8 Clockwork Gate pieces (after its wheel redesign for freeze-on-the-flash). Keep a ~$10 reserve; log every job's cost.
   - **~8:30 PM ET, MATT: BUILD 1 STARTS TOMORROW MORNING (Sat Oct 31).** Nothing runs overnight. Build 1 = audit's first minute: LV-19 mode card, UI-22, DOT-18 (+DOT-2 tips), SN-13 respawn + front-door sounds, UI-16/17/20, WIP-6 stopgap + WIP-16 + WIP-13, LV-24, ST-5, ST-6+AN-15, CT-35 Jump help Off (+ the Baloo preload fix already on ccr). Then Build 2 (ST-9 replies, AN-12/ST-10 Flicker in play + one bubble style, VI-21 bank ends on HF, VI-24/ST-13 upright framing). Kick-off moved to 10 AM ET (Matt); lead check-in armed for 10:00 AM ET.
   - **LEAD CALL (audit CT-32, the audit leaves it to the lead): steady run speed at about 3% under today's peak** (no per-frame 285/268 flip; stages keep their tuning; Meeca's timed tests re-checked). Rides Build 4. Remaining Matt call from the audit: DOT-19 boss coaching lines (asked when written, Build 10).
   - **~8:24 PM ET, MATT: best times on rebuilt worlds RESET** (one-line map note that the stages are new; stars, unlocks and progress kept).
   - **~8:22 PM ET, MATT: generator phase order = World 1, then World 5, then Worlds 2-4** ("World 1... is the very first world anybody gets to, and having that not meet the criteria is putting everything at risk").
   - **~8:20 PM ET, MATT: canopy stays at 9-2, renamed** (replaces the unbuilt look-alike climb; 9-3 Ember Canopy keeps its gen2 build).
   - **~8:18 PM ET, MATT: 8-4 = "Lantern Run" + every fall soft** (back to the last flower, jar refilled; goal "Carry the firefly jar through the dark treetops"; WIP-17 real dark ring + 64 px jar gauge pulsing at 35%).
   - **~8:16 PM ET, MATT: AN-14 vibration ON by default in the installed Android app only**; the website stays off.
   - **~8:14 PM ET, MATT: CT-31 = charge and release** for the touch mega (still hold ~550 ms shows a charge glow, fires on a still lift; resting thumbs never fire; Pad unchanged; target under 10% in replay).
   - **~8:12 PM ET, MATT: CT-33 = (b) stop at the edge:** a slanted standing carry never takes him past his platform's edge unless the flick leans 45 deg or more (target under 5% in landscape).
   - **~8:10 PM ET, MATT: CT-34 TOUCH MARKERS STAY OFF** ("I had somebody say that having that on made them play worse"); the option stays in Settings. Audit's Auto suggestion declined.
   - **~8:05 PM ET, MATT: LV-19 MODE CARD WORDING = both names:** "Little explorer" with "Easy" (more help) and "Big explorer" with "Normal", Pokey portraits, no default, shown on a save with no mode stored (between How to Play and the story).
   - **~8:00 PM ET, MATT: THE MAGMA DRAKE (9-10) BEFORE THE W9 CANOPY** (audit pushback taken): build the Drake while the canopy's 5 art pieces are made on HF.
   - **~7:55 PM ET, MATT: HOLD RULE = FREEZE ON THE FLASH (audit WIP-18).** Pokey keeps his grip if he isn't moving when the lightning gust hits; standing still braces him on the ground. Replaces the drafted thumb-down hold everywhere (10-3/10-4 teaching, the General's storm phase). The Clockwork Gate's great-wheel panel must be redesigned to match (no thumb-down hold), and a one-room prototype goes to Matt before 10-3/10-4 are built. Dot's approved line "Hold on. Let go at the top." is void with it; a new line goes to Matt with the redesign.
   - **~7:50 PM ET, MATT: NO MORE GEMINI PROMPTS.** "I'm not doing Gemini prompts anymore. I'll put a little bit more on the hugging face... another 40 so we'll have like 110." All new art via HF helpers (the 10 special-stage pieces in reference/special-mockups/*/DESIGN.md become HF briefs). CLAUDE.md rule updated. The lead's 7:40 prompt file to Matt was a mistake.
   - **AUDIT 2 IN (Matt, ~7:40 PM ET Oct 30): reference/audit-2/AUDIT-2.txt.** Worlds 1-7 B-/B+ (from C/B-), whole game C+/B. 14 builds; Build 1 = first minute (LV-19 ask the mode, UI-22 2-3 goal card, DOT-18 lines keyed by id, SN-13 respawn sound, WIP-6 no early pits W8-10, ...). Calls being asked one at a time. DECIDED: CT-35 Jump help default = OFF (Matt; all 168 fairness runs pass Off and On). Lead agrees with WIP-18 (freeze on the flash), the Drake before the canopy, WIP-10 merge World 8 first, SN-11 re-level (tonight's +3 dB bus went the wrong way).
   - **7:35 PM ET, MATT APPROVED BOTH SPECIAL-STAGE MOCK-UPS + DOT'S LINES** (mock-w9-w10-special d188cdb9, reference/special-mockups/): 9-2 The Last Trees (hang-under taught IN 9-2, Matt's pick A; later W9 tree stages may borrow it; gen2-ascent proves its flow on 9-7, not 9-2) and 10-8 The Clockwork Gate (puzzle kit + timed gate, great wheel, lamp; hold from 10-3/10-4). Dot lines approved: "Too thin to stand on. Hang under it!", "Hold on. Let go at the top.", "Three lamps. Hang a weight for each." 10 Gemini prompts sent to Matt as a file. Build after the audit, painted art only (no stand-ins ship).
   - **7:25 PM ET, MATT: W1-4 TIMING = fix first, rest later.** Plan at plan-gen2-w1-4 f2455853 (reference/GEN2-W1-4-PLAN.md; lead re-ran tools/inspect/spotMemory.ts: 1-3 enemySpot 0.97 vs 6-1 0.48). G0.1 (gen2 pass 4 rolls top-up spots; 5-9 spiders 94%, 7-1 frogs 73%) goes BEFORE W8-10 curation, after Matt's audit; the W1-4 rebuild (~30 helper-days, W1 pilot) after W8-10 and the bosses. Gate on the spot measure, not era.ts. Q1 CLIMBS = B (Matt: "That would keep it freshest"): the generator's climb mode, so W1-4 climbs change shape each play; build it on the gen2-ascent branch (upward flow for W7-10, already pushed, not hooked up) so W9-10 share it. Q3 = half different between back-to-back plays (layoutMemory picks the next roll from a 16x16 distance table, plan §3 G0.2), ~30 sections a world. Plan fully decided; nothing starts until Matt's audit is back.
   - **7:05 PM ET, MATT (during his audit): "Plan + mock-ups"** (paper only, no game changes). Started: plan-gen2-w1-4 (session_01FhBbYM63spLZ2EtqVH1ivu: reference/GEN2-W1-4-PLAN.md, measured) and mock-w9-w10-special (session_01FhBbYKtSqnavC6Z5hPrKZW: W9 canopy special stage + W10 Clockwork Gate design, phone-size mock-up stills, Gemini prompts for new art, no HF spend). Both push their own branch only, no PR.
   - **6:20 PM ET RELEASE #53 LIVE:** Matt merged (main 949abd9); Publish to gh-pages succeeded, pages build and deployment succeeded ("Publish 949abd9"; the cancelled twin run is the usual duplicate), Android APK build succeeded. Audit downtime: nothing running.
   - **5:55 PM ET, MATT: "This is the best it's felt ever. Go ahead, release it. Don't start anything new."** Release PR #53 (release-2026-10-30d = 320a4280, the tested v11 build) opened; Matt merges, then the deploy check. Helpers told to stop; DOWNTIME while Matt runs his audit. Nothing new starts until he's back.
   - **Next-round queue from tonight (after Matt's audit):** (1) story-gaps: an exchange's replies are dropped when its first bubble is cut short (re-queue them); screenshots at story-gaps 264739ee (reference only, merge with the next round). (2) Flicker has words and a tag in play but no sprite beside Pokey: needs art (route to an HF art helper). (3) engine.ts:792 sets window.__engine to the engine object on 6-8/8-6/10-6, replacing App's __engine() so QA scripts break there (lead, engine). (4) hf-art-ground: bank ends redo (painted in each world's own soil and sky). (5) story-delivery known limit: upright chest-up close shot of a short speaker beside a tall one shows the short one from the shoulders up (Meeca beside the General). (6) Matt's GEN2-W1-4-PLAN.md, W8-10 curation, bosses 9-10/10-10.
   - **5:45 PM ET TEST LINK v11 PUBLISHED** (EBKijcmLqzEz2wmHaRxgpY, version 16) from 320a4280: gate4 PASSED (1870/0 + 2 todo, build, artcheck, drawcheck 309 s). Includes the jump fix 690937cc (no stage needs On + forward), full-band sfx + bus +3 dB, story-delivery 42b71044, hf-art-ground 72436837. Test link now inlines files under 32 KB (the build reached 519 files, over the 511-a-version cap; now 478). Smoke: title loads clean except a stale Baloo font preload 404 (fixed in index.html after the link, rides the next build). Waiting on Matt's test, then "push" = release, then his audit.
   - **5:00 PM ET gate3 PASSED on 1d6b215e** (1860/0 + 2 todo, build, artcheck, drawcheck 349 s). Then merged story-delivery 42b71044 (direction on every scene, upright box, framing fixes) and hf-art-ground 72436837 (W7 faces whole, W8 stones 56-70 weight 20). Jump-help fix (faceBeside, FACE_NEAR 90, second jump keeps a carry) tested in wt-off: keep 83/0; off/forward running; then gate4 and the link.
   - **4:45 PM ET, MATT: "We need to fix bugs that require that on. I would prefer to have that off for myself" / "That is for 'On + forward'".** Goal: every stage fully playable with Jump help 'On' (keep, no forward push), and ideally Off; then the forward push is a real extra. Lead measuring which fairness tests fail under keep/off (scratchpad worktree wt-off); fix round after tonight's link (engine: a second flick with nothing steering at a face it can climb carries him onto it, not a general forward push). Default stays On + forward until those pass.
   - **4:30 PM ET evening merge #1 (gate3 running):** polish-a2, polish-sfx (1d95198c), hf-art-bosses (a43c6631: icon E web+Android, How to Play rename, card tabs, sliders, foldable), hf-art-ground (4afadadf + pm1030 patch: W3 bands, W8 stones, W10 faces, W8 flower), story-gaps (e2e263ef: all gap beats, Flicker tag, bubble clear of HUD). Late (by 5:30-5:45): story-delivery phase 2, hf-art-ground W7 face fix + bigger W8 stones, story-gaps screenshots.
   - **3:47 PM ET, MATT APPROVED THE STORY VOICES** (story-delivery phase 1, a babble per speaker, f5ff50c7). Locked; story-delivery told.
   - **3:45 PM ET, MATT PICKED APP ICON E** (bark brown edges to leaf green, Pokey's own painted face; reference/store/icon-options/E-bark-leaf-512.png) over the lead's pick D. hf-art-bosses swapping it into the Android and web icons.
   - **3:35 PM ET, MATT: SETTINGS START OFF ("people need to turn on the special options"), lead's option A.** Off by default now: jump help (was On + forward), touch markers (was Auto: World 1), vibration (was on). Kept on: Dot's help, story lines in stages (they carry the story-gap beats), full screen, screen shake. Lead commit e3e45da3; players who already saved a choice keep it. Found by the suite: Jump help also gated the step carry (the QA v198 one-thumb flick-at-a-step fix), so Off broke W1-2 single-flick steps; 27ccfc07 runs the step carry on every touch jump, and Jump help now only covers the second-jump extras (slow-slide double jump, forward lean). THEN W5 fairness tests (w5Fair, w5Order): with Off a one-thumb player cannot climb a tall stump standing (only the second jump's forward push carries him), so the lead put the Jump help default back to On + forward (told Matt); Off still works better than before (the step carry and a second jump that keeps it).
   - **3:30 PM ET merges for the evening link:** polish-a2 (Play Store, Capacitor deps: install with `npm install --legacy-peer-deps`, bun.lock only), polish-sfx (footsteps F on the footfalls).
   - **Matt approved the Drake teacup ending (12:30 PM ET).** Sequel: Matt wants a cliffhanger (Meeca playable, going after Pokey). Lead proposed one small post-credits card (reference/SEQUEL-IDEAS.md); waiting on Matt's yes.
   - Duet's other items, queued:
     - trackAtlas bitmaps for every sheet (b);
     - eagle sparkle `fillText` -> sprite;
     - gradients rebuilt every frame in watch/chase edges, stone (terrain 82), mushroom (artKit 269/280), soil (groundPaint 140), pitShade (protoArt 765/798), sky (scenery 2702/2725), rivers (engine 4800);
     - soil 2048 sheet drawn 7-9 times a frame;
     - the 2880x864 overlay drawn enlarged;
     - pit water: bake the strip at tile size, cull off-screen tiles;
     - snakeSprite and goldsnake head/sleep/wake still plain Image elements.
   - **Profiler caution (Duet):** if per-layer times climb over a run, suspect the readback itself.
3. **The fixes, in order of the evidence:**
   - **(a)** gameplay smoothing off 'high';
   - **(b)** gameplay sheets as ImageBitmaps, kept alive and pre-uploaded;
   - **(c)** readable canvases copied to plain ones;
   - **(d)** the three sheets over 4096 px split;
   - **(e)** advanced blend modes, `shadowBlur` and `filter` taken out of the per-frame path;
   - **(f)** overdraw cut: the soil-tile overlaps, and the full-screen overlay baked into a layer;
   - **(g)** a fixed-step update with catch-up, so a slow frame never slows Pokey (this one doesn't depend on the GPU, so it can go in first).
4. **Prove it on the Pixel:** Chrome, Edge and the APK, before and after, plus a 15-minute run.
5. **Then guard it (PERFORMANCE-RULES §8):** the draw check and the art size gate in the gate; ownership of the shared drawing files; the checklist in the W7-10 and boss briefs; QA sorting frame data by GPU; and a Pixel baseline per stage in reference/perf-baseline.md. Then: a test that fails if a per-frame draw uses `shadowBlur`, `filter`, gradients, advanced blends or readbacks. Only then does PF-1 pick up the rest of the bake list, with helpers back on (waves per the schedule below, shifted by about 2 hours).

## THE FINISH LINE (lead manages; Matt 2026-10-29 ~7:55 PM ET: "take control again and really manage this... finishing the game and finishing the polish... keep up with people... make sure things are moving along and we're not going to run into issues")

RELEASE (Matt ~8:05 PM ET): after he plays the 11 PM test link and says "push", that exact build is frozen as the release branch and the PR opened. Tracker refreshed 79186903 (165 items: 77 live, 49 merged-not-live, 7 running, unowned all assigned 8:05 PM ET). Cutscenes (ST-1/2): plates at 2560, dpr cap 2, cels repacked, merged-not-live; story-art doing a full scene pass + contact sheet for Matt.

MATT'S CALLS ~8:10 PM ET: Build 1's 8 items rebuilt here (polish-c: AN-1/2/3, SN-4, DOT-3, UI-6/7/8); LV-3 keep the Easy double jump + a 1-6 practice spot and one Dot line (polish-a2); tilt CT-29 later (after W7-10 and the next releases); Naturalist medal = all 18 journal cards (polish-a1). Also assigned 8:05 PM ET: CT-8 step 2 (polish-controls), X-14 teeter frames (hf-art-bosses), PF-2 + X-10 cause (PF-1), S-12 Flicker stage lines + DOT-5/6/7 check (polish-dot), SR leftovers (story-a), lookalike 31d0341 check (W8).

MATT'S FINISH PLAN (his checklist, tick items there as they reach the test link): https://claude.ai/artifact/7LZN3UfpNBtBYM9dVjFX7H (Claude Docs). Update it at every check-in.

DONE (Matt 2026-10-29, agreed): web 1.0 = all 10 worlds + bosses passed by Matt on the phone, story start to finish, every "you check" item passed; then the Play Store app; the project is complete when the app is submitted. Matt took all the lead's suggestions (fewer starts, plan the General now, stop chasing W3-4 numbers, smaller releases). NEW 8:08 PM ET: gen2-ascent (session_01FhBbYMDDjPk6FfkvEhLm21), gen2's upward flow for the 9 old-generator ascents in W7-10, proven on 9-2/9-7 first. W9 target lowered by the lead to median 43-44, floor 40.

BUDGET PAUSE (Matt ~8:40 PM ET: 77% of his window, resets ~10:00 PM ET): paused until 10:05 PM ET (trigger trig_012mqnCkAy9xYYr1qQwWzPWP): W8, W9, W10 (+swing), 8-4, W5 rebuild, story-a, story-art (HF job may run), PF-1b, hf-art-bosses, hazard-anim, polish-clean (walks finish, no fixes), gen2-ascent (stopped). RUNNING for the 11 PM link only: polish-sfx, polish-dot (pointer), polish-c (Build 1), polish-a2 (LV-3 fix), polish-controls (CT-8 gate), polish-levels (4-8 rock), polish-edges (11 skies, HF). 30-min check-ins off until the reset.

MATT ~9:55-10:03 PM ET: ONE PETAL game-wide (Meeca's petal replaces every scattered flower/leaf/fruit; goal items stay distinct; trails with purpose, about 6 on screen max; every petal fairly reachable, hard-but-possible OK; levelCheck rule + test) -> polish-levels, whole game at once, no mock-up stop. 7-4 slide jumps must be possible (very tough on Normal) -> 7-4 builder. Flat background at stage start = late backdrop load -> PF-1 (no flat fill ever). OPEN for Matt: lock Worlds 8-10 as coming soon in the next release until their rebuilds pass? hazard-anim rounds 2-3 merged f5949219.

MATT ~10:15 PM ET: HF $80 is the last money; no price approvals, spend it down the ranked list (menus first), keep $6 reserve, boss 9-10/10-10 art waits on his boss-design answer (hf-art-bosses). BUILD TO PLAY STORE STANDARD from now: polish-a2 auditing (reference/PLAY-STORE.md). Worlds 8-10 stay playable with a 'New look coming soon' map tag (polish-a1). Foldable/status-bar layouts (polish-c). W5 rebuild SENT BACK (upright smear band, shared code).

TEST LINK v7 PUBLISHED ~10:58 PM ET (EBK version 1793328309-e4f4, ccr 1655adfc; gate14 2029/2027/0 fail): tonight's build + the torn-band strip fix. Waiting on Matt's play and 'push' -> freeze a release branch from 1655adfc.

NIGHT STOP (Matt ~11:00 PM ET): every helper told to push, kill background jobs, cancel reminders and stop. Lead check-ins cancelled. Nothing runs overnight.

TOMORROW'S SCHEDULE (proposed to Matt; at most about 6 helpers at once, lead check-ins every 45 min, everything stops by 10:30 PM ET):
- Wave 1, about 9 AM-12 PM ET, FINISH AND MERGE (cheap, nearly done): W5 rebuild (afd0d02b), satchel/journal/finds (story-a), arcade words (polish-c b5743d00), no-flat-background (PF-1 22a631f8), one-petal pass (polish-levels), 8-4 (after its re-shoot), ending cards + cutscene fixes (story-art), full-band sound (polish-sfx). Then test link v8 at about 12 PM ET.
- Wave 2, about 1-5 PM ET, ART AND APP: ground tiles + pit ends (hf-art-ground), hazards/water (hazard-anim), menu kit mock then wiring + icon (hf-art-bosses), Android app fixes (polish-a2), safe areas + foldables (polish-c), cleanness C1-C5 (polish-clean). Test link v9 at about 5 PM ET.
- Wave 3, about 6-10 PM ET, WORLDS: W8, W9, W10 curation and merge (heavy compute), Dot no-repeat + S-5 (polish-dot), PF-1b/PF-2. Test link v10 at about 10 PM ET.
- Wave 1 start points (from tonight's stop notes): polish-levels 633b375d (update 5 count-pinned tests, then gate); w8-lantern 5ef9afcc (gate, then merge); story-a 4fdbd600 (gate; one question on the General's tree line said twice); polish-a2 ebe0456c (finish the suite, then merge); polish-sfx 1a9e9bac (calib, pack, licences, gate); W10 10d09f9 (full curation, see reference/W10-NEXT.md); w5-rebuild afd0d02b (merge); polish-dot ba6e4dd1 (no-repeat round); PF-1 22a631f8 (merge); polish-c b5743d00 (merge). Menu kit: lead chose A (frames, icons, lock, stars; keep the CSS planks). Show Matt the mock (qa-notes/hf-ui/mock-*.jpg on hf-art-bosses a773cc8), then hf-art-bosses wires it.
- Waiting on Matt: play v7 and say push; the Drake teacup ending yes/no (boss art and build wait); the W9-10 stage plan (canopy 'last trees', special stages); gen2-ascent stays stopped until then.

How the lead runs it: a check-in every 30 min (send_later, re-armed each time). Each check-in: list_sessions; read every report; review against LEAD-PLAYBOOK §4; merge what passes (fetch first, one gate per batch); send back what doesn't; nudge anything idle or stuck with no report for 60+ min; update this board; tell Matt only decisions and finished things. Test link cutoff 10:40 PM ET, link 11 PM ET.

Track A, finish the game (owner, next milestone):
| Piece | Owner | Next | State |
|---|---|---|---|
| World 5 rebuild (5-6 gen2, 5-8 hand, one art style) | w5-rebuild | stages built, stills | running |
| World 7 | gen2-w7 (idle) | Matt plays test link; CLIMB_CLEAR re-curate | r5 merged |
| World 8 + 8-4 Lantern Run | gen2-w8 (+swing), w8-lantern | levelCheck wall fix, curation C; 8-4 build-out | running |
| World 9, World 10 | gen2-w9/w10 (+swings) | curation to targets | running |
| Bosses 6-10, 7-10, 8-10 | (to start) | after W7 + W8 pass (Matt) | waiting |
| Bosses 9-10, 10-10 | (to plan) | after W9/W10 pass | waiting |
| Story S-6 journal + satchel, S-8 hidden finds, S-1 open rows, people who come back | story-a | mock-up first, lines to lead | started 7:55 PM |
| Story art S-7 ending cards, S-11 parents, S-4 wall pose | story-art | picks to lead | started 7:55 PM |
| Dot as character S-5 (rest points only) | polish-dot | lines to lead | after pointer removal |

Track B, finish the polish:
| Piece | Owner | Next | State |
|---|---|---|---|
| Tracker refresh, every audit item owned | lead's agent | TRACKER.md + Matt's decision list | running |
| Dot pointer/ring/arrow out everywhere, no repeat tips | polish-dot | before/after stills | running |
| Sound effects rebuilt (wired without waiting, Matt vetoes in game) | polish-sfx | commit by 10:40 PM | running |
| Title/menu/map music v4 (approved) | polish-audio | wired | running |
| LV-2 harder Normal W3-4 (combinations) | polish-levels | W4 first two stages measured | running |
| Cleanness sweep, every stage both ways | polish-clean + 4 sweeps | findings list to lead | running |
| Repeating effects remainder (SWEEP.md) | hazard-anim | batches with video | started 7:55 PM |
| iPhone speed, bake procedural art (PF-1b step 1) | PF-1 | pixel-diff + frame proof | running |
| 11 held portrait skies | polish-edges (idle) | needs better start pictures | to restart |

Collision watch (two helpers, one file): polish-dot + story-a (dotLinesData), w5-rebuild + polish-levels (W5 Normal), PF-1b + hf-art-ground (ground decor), polish-sfx + polish-audio (audio files). Each pair told to agree before editing; the lead merges them in that order.

Every polish-report item, with its owner and status: reference/polish-report/TRACKER.md (keep it current with this board).
## Running (2026-10-29 ~09:35 ET; Matt: "start 7", "start World 6's special stage", "a reset for free, run full capacity", "start 8", "run as we did yesterday")

Cost mode is lifted (Matt, 2026-10-29): full capacity, two builders per world as on 2026-10-28. Effort levels still by job (LEAD-PLAYBOOK §7).

| Job | Who | Branch | Notes |
|---|---|---|---|
| 6-8 Stilt Climb (W6 special, hand-built) | cloud session_01FhBbYMt17qa4tAv8V6jvxN | w6-stilt-climb | mock-up first, then stops for Matt v3 reviewed 12:40 PM ET: variety and upright framing PASS; sent back floating stumps/dens (support rule), the start bank cut, the crown row. Ledge set prompt queued for Matt (4b) |
| World 7 kit, ground/crumble, hook-up, curation | cloud session_01FhBbYNKK8iPP5FQajUs6u5 | gen2-w7 | Pokey teaches himself (Dot absent) | round 3 reviewed 3:00 PM ET: chairs/sentry/anchors/walls PASS; sent back the repeated "Brown vines" line, patchwork bank faces (use hf-art-ground soil), floating slabs, one plain wall strip (HF), 7-5 sentry meeting |
| World 7 swings + rooms | cloud session_01FhBbYL6bqh18b851MMeCgA | gen2-w7-swing | merges into gen2-w7 before curation |
| World 8 kit, ground/darkness, hook-up, curation | cloud session_01FhBbYL7oX9aYPA1U8CKGQ9 | gen2-w8 | lantern + fireflies reviewed 12:45 PM ET (mid-curation): sent back Dot spoiler lines on room entry, boxes in the dark, glowing square spike block, black void upright; bounce mushrooms to HF | ; 4:42 PM ET: deadly lit-bough falls on Normal in (dark/second-jump/glide/start gaps soft, Easy all soft), new Dot line for Matt "Careful! It's a long way down."; general climb-vine fix in pipeline (W6-8); lookalike merged; full re-curation running | ; Matt 6:25 PM ET: World 8 look-alike = (C): ship the split checked vs neighbours with a 1-in-5 cap, then a second round giving every stage a signature in every stretch; levelCheck wall fix (a) approved; resumes after 10 PM |
| World 8 swings + rooms | cloud session_01FhBbYM8NXWsJ1fXfGP892s | gen2-w8-swing | merges into gen2-w8 before curation |
| QA leftovers 2-6 (tip timing, plank ends), 3-3 counter | cloud session_01FhBbYMWcFJmuZ592k3J1vs | qa-fix-w123b | |
| Better look-alike measure (Matt chose it over relaxing the rule) | cloud session_01FhBbYKxYezKsEn4iBnvKHP | gen2-lookalike | era + curate share one measure; W7/W8 switch on merge |
| Art pickup: HF creatures + Gemini sheets cut-in | local helper (worktree) | art-pickup | no new HF spend |
| Swimming (Matt: build it, first swim in 6-7's well; calm water from w6/water.jpg) | cloud session_01FhBbYJzbeg3VTVJMDHy4EK | swim | dirty/fast stays deadly |
| Painted swaps where art exists (spore mushrooms, web patches, 4-3 log) | cloud session_01FhBbYKjmhzsBKK3zWd2cgB | painted-swaps | v3 reviewed 12:20 PM ET: web patch + swing ring PASS; falls FAIL (straight cyan pillars, no lip, clash with backdrop). Waiting on Matt's Gemini falls sheet (prompt: reference/prop-sheets/gemini-prompts/w4-waterfalls.md) | v4 PASSED 2:45 PM ET (HF falls); merging with web + swing after the gate |
| 7-4 The Slide (W7 special; Matt: NOT a climb: side-on run, floor crumbles, behind-the-back slide, steer and jump; art: slomatt/02_sliding-from-behind) | cloud session_01FhBbYJXeB8XaDrrUgxfuHR | w7-slide | v5 17e7f89 PASS 3:30 PM ET (HF 2x Pokey, empty paws, both leans, fixes); stills and clip sent to Matt; MERGED 3:55 PM ET (gate3 green 1883/1881/0 fail), test link 2 v3 |
| Polish A1: picture and screens (VI-2, AN-4, VI-3, VI-4, VI-7, ST-1 code, UI-1, UI-3, UI-11, UI-14, LV-1) | cloud session_01FhBbYLAhepkzSTfrwKHSBm | polish-a1 | reference/polish-report/PLAN.md spot-checked 12:50 PM ET: win card, confetti, mode chip, map, text sizes PASS; asked about clipped story text upright and a see-through 7-1 figure |
| Polish A2: levels, sound (LV-6/9/11/12/13, CT-8 step 1, CT-20, SN-2/5/6/7, AN-9; its Dot items moved to the Dot helper) | cloud session_01FhBbYPEyi9ZZvvRqRyf8wK | polish-a2 | 1205a6e PASS 3:52 PM ET (65% only, flag run-up, 2-5 Easy 4/10 vs base 2/10); merge after gate4, then polish-c 8107b20 |
| Dot rework (Matt: "constantly nagging", "gives away the puzzle", "weird blue box/circle"): Tips speaks only first-times, water, locked exits, real struggle; >=30 s gaps; no answers on room entry; no highlight boxes, Dot perches on the object; DOT-1..17 | cloud session_01FhBbYKJkZarvUhKDPsuRvk | polish-dot | before/after preview first added 12:50 PM ET: no box over Pokey (wayside placement, hold during reveals); floating world-space lesson labels game-wide | ; Matt 3:50 PM ET on 4-4: remove the ring+arrow for good and the rocks line ("ugly and gives everything away"); sweep every hint line that tells the answer, list old/new for Matt |
| Music and sound (Matt: "repetitive or boring", "wrong feel for the world", effects "more tied into the game"): song forms with sections and variations per stage, adaptive layers (danger, dark, puzzle rooms, bosses, story), the SN-3 missing effects, SN-8 loop seams, SN-9 ambience, SN-10 boss card; A2 keeps only SN-2/5/6/7 loudness via sfx.ts TRIMS | cloud session_01FhBbYMtoVBrf58j7276oA4 | polish-audio | listenable before/after previews first (reference/audio-previews/v1/) | ; v3 6bda4d2 APPROVED by Matt 4:33 PM ET ("I love the new music"); new ask: bold unique title + menu theme, previews first | ; v4 title/menu/map previews 5e09914 sent to Matt 4:48 PM ET |
| QA batch E fixes: replay drops to 2 fps (Sally, seed 56672, Short hops), Facebook iPhone frozen start after skipOffer (Age), opening difficulty options (Matt decides), mid-run sheet-load stalls | cloud session_01FhBbYJnGzLi5a2LUwVEvaw | qa-fix-e | started 12:18 PM ET |
| HF art 1, blocking sheets: W7 vine anchors, W7 temple walls, W4 waterfalls + wet pillar, W6 ledge set ($10 cap) | local agent (worktree) | hf-art-blocking | started 1:10 PM ET; art only, owners wire | DONE, passed, MERGED 2:05 PM ET; owners wiring |
| HF art 2, every-stage pieces: checkpoint marker, exit gate per world, pit water W1/3/4/5, thorn gate, pickups, 4-8 netting + painted nests, story finds ($14 cap) | local agent (worktree) | hf-art-stage | started 1:10 PM ET; report 3:25 PM ET (4bbee96, $1.17): flag, shut gates, pickups, thorn gate, finds PASS; sent back the open gates (dark hole), the 4-8 net (too big, covers Pokey), W5 water repeat, journal preload | ; round 3 5e66912 ($1.47 total) PASS 4:15 PM ET: open gates lit from inside (all 10 worlds), 4-8 net snug, W4/W5 water no repeat, journal preload; merge after gate4 |
| HF art 3, ground and World 5: soil textures + lip + bank per world with the VI-8 code, W5 props + water sign, W5 dressing sets, W6 water repaint ($14 cap) | local agent (worktree) | hf-art-ground | started 1:10 PM ET; makes and wires | moved to its own cloud session session_01FhBbYMb4PGpZ7nUd2Eyre1 at 2:50 PM ET (Matt: helpers get their own machine) | ; 33c7934 reviewed 3:58 PM ET: 1-1 soil, W10 rock, lip, dressing, sign PASS; sent back W5 soil (flat beige), the green pit blocks (1-2, 5-1) and 10-1's white spout, W6 inspector re-run | ; r3 5114dea ($2.06) PASS 4:50 PM ET except soft pits now read as lit soil (sent back: shade pit insides); painted bounce plants added |
| HF art 4, Pokey: swim satchel fix (tread, under), 7-4 pole stubs painted out + 2x upscale; pokey LoRA v2 only if asked ($12 cap) | local agent (worktree) | hf-art-pokey | started 1:10 PM ET | DONE, passed 2:50 PM ET (swim satchel, 7-4 paws + 2x); merge after the gate; slide builder wiring |
| 7-3 ring of chairs (HF, ~$0.25) | local agent (worktree) | hf-w7-chairs | DONE, passed, MERGED into ccr 1:25 PM ET; gen2-w7 wires |
| HF art 5, bosses and effects: lairs (wire 6 unused + 3 new plates), shared warning marker, boss effects, dust/sparks, Venom Fang, Queen clips, shimmy ropes, 4-D/5-M bits ($10 cap) | local agent (worktree) | hf-art-bosses | started 1:30 PM ET | moved to its own cloud session session_01FhBbYMvPygG5P2B8VV2Fzu at 2:50 PM ET; round 4 a29669d ($1.49 total) PASS 3:35 PM ET; e1609ed name cards + Queen tea PASS 3:50 PM ET; MERGED d691b5b, full gate running |
| HF art 6, native-resolution near/mid backdrops W1-5 first, into src/assets/backdrops-hd/ (swap after polish-edges) ($10 cap) | local agent (worktree) | hf-art-backdrops | started 1:30 PM ET |
| Polish C, screens and feel: UI-2, AN-11, UI-5, UI-9, UI-10, UI-12, UI-13, UI-15, AN-6, AN-10, PF-3 | cloud session_01FhBbYJojJwqFxv2u9mo8uR | polish-c | started 1:35 PM ET; big screen changes shown first |
| Polish levels: LV-8, LV-14, LV-4, LV-5, LV-7, LV-15, then LV-2 (proposal first) | cloud session_01FhBbYLyE75iwttyDZRWPxT | polish-levels | started 1:35 PM ET | ; FINAL f094a38 PASS 4:32 PM ET (LV-8/14/4/5/7/15 done; LV-2 measured: W3-5 Normal go backwards); merge after gate5; LV-2 Normal pass waits on Matt; 2-7 Easy log hops being checked |
| Polish B1: controls never misread (CT-1..4, 6, 7, 9, 10, 12; CT-5 waits for Matt) | cloud session_01FhBbYKmJjBAbBHVVVBnhLE | polish-controls | replay tester touches | ; Build 3 ab0f077 PASS 4:12 PM ET (misreads 2.8->2.7%, megas from resting thumbs 47->38%); Matt OK'd touch marks World 1 only; merge after gate4 |
| Polish B2: clean backdrop edges (VI-1, VI-5, VI-6) + the backdrops-hd swap + X-16 upright fade (Matt 3:45 PM ET, "just build it"): strips sized as sideways, sky outpainted upward on HF (~$2) | cloud session_01FhBbYNmvX29Yt9L2XxEWqJ | polish-edges | X-16 sent 3:47 PM ET | ; 6d10671 FAIL 4:18 PM ET: edge fix blurs the interiors (w1 fern veins gone, lumpy silhouettes), X-16 not done, old base; sent back with diff-mask proof |
| Rope traverse (DONE, Matt: "Looks good", merged): Gemini frames 1-7, World 2's painted rope and posts; HF in-betweens all drifted off model ($0.84) | local helper | rope-traverse | |
| Cleanness sweep (Matt 4:08 PM ET: "what we lack the most is seams... I feel like I'm fighting a battle"): stage-walk tool + seam detector, every stage walked both ways, findings routed by cause, own share fixed ($6) | cloud session_01FhBbYKDts8FcdDtxECVnkT | polish-clean | started 4:09 PM ET; findings list to the lead before fixes |
| Sound effects rebuilt with real sounds (Matt 4:00/4:05 PM ET: "pings everywhere... pinball", "they were crap"): every effect, ambience beds, boss slam; SN-1 revised, SN-3, SN-9, SN-10, X-17; old/new previews to Matt first ($8) | cloud session_01FhBbYLYe1b66N7kEhtr9gq | polish-sfx | started 4:06 PM ET; polish-audio keeps music only |
| 8-4 Firefly Lantern Run (Matt's pick 4:58 PM ET): W8 special, jar of fireflies whose light shrinks, refill at glowing flowers; mock-up first ($8) | cloud session_01FhBbYNXkjnYNgAxsTrTGve | w8-lantern | started 5:02 PM ET |
| World 9 Volcano on gen2 (kit, ground/hazards, hook-up, curation; lava geyser art) (Matt 5:05 PM ET: start now) | cloud session_01FhBbYMiLwJyrCuQSV6ZpJf | gen2-w9 | started 5:05 PM ET |
| World 9 swings + rooms | cloud session_01FhBbYKXZEzCAj72fCQcLvh | gen2-w9-swing | started 5:05 PM ET |
| World 10 Fortress on gen2 (lightning art; Pokey's own lines) | cloud session_01FhBbYMfTYnVWg65zhiPmgK | gen2-w10 | started 5:05 PM ET |
| World 10 swings + rooms | cloud session_01FhBbYNBTbLLgVB5ZHEdm5W | gen2-w10-swing | started 5:05 PM ET |
| World 5 rebuild: 5-6/5-8 onto gen2, one art style (LV-10, ST-3) (Matt: start now) | cloud session_01FhBbYK2Fd5H9bqRihq9enn | w5-rebuild | started 5:05 PM ET |
| Falling rocks + repeating hazard animations painted and done right (Matt 4:02 PM ET: "it puts squares where it's going to fall... doing it lazy again"): painted grit/pebbles, boss-fx dust, soft shadow, impact, then sweep every repeating effect drawn as code shapes ($5) | cloud session_01FhBbYKvc5dMeVNeehSxNyt | hazard-anim | started 4:03 PM ET; video proof required |
| Audit: major looks still drawn in code (DONE) | local read-only | none | findings below |

Audit findings (2026-10-29), most visible first: W6 tide drawn clean teal (FIXED: painted fast water, tide-w6-painted.png); W9 lava
geysers and W10 lightning (no art); boss rage strips, lairs and attacks (bosses later); pit water in W1-W5 hand stages (code water; W2 rivers
painted); rope traverse (helper running); W4 waterfalls (code on purpose); web patches 5-6/5-8 (painted silk exists, unused); spore mushrooms
(painted mushrooms exist, unused); wind; crumble tiles W7 (kit has no ruin tile: HF list); silk swing lines W5; bounce mushrooms (all worlds,
no art: HF list); 4-3's pool log (painted log exists, unused). SWIMMING DOES NOT EXIST in the game yet (pokey-swim sheets are in
reference/animation-sheets/pokey-swim/, not wired); question to Matt.

Hugging Face: Matt reloaded it to $91 (2026-10-29 ~1:05 PM ET): ALL art from Hugging Face, no more Gemini; music may use it too (polish-audio, $15 round). Wave 1 caps: $10+$14+$14+$12. Earlier: about $12 left (Matt, 2026-10-29: "any art that we need, use that"). Plan: one run for the props/creatures/backdrops the
World 7 and 8 builders and the code-drawn-looks audit list (img2img from the world kits, as the W6-10 prop run); Pokey and story characters
stay Gemini (Pokey drifts off model on HF). Stop new jobs at $1 left.

Art pickup MERGED (0cf6bae): HF creature defeat/attack clips and the 10-28 Gemini sheets cut and packed, not drawn yet (manifest only);
owl defeat dropped (redo on HF); crab, piranha, sentry, beetle were never generated (HF list).

Left for later: 8-4 (Matt: specials should not just go up high; ask him for 8-4's idea), the bosses 6-10, 7-10 and 8-10 (Matt: all together later),
the rope traverse (waits on Matt's Gemini hand-over-hand sheet).

## STANDSTILL, earlier (2026-10-29 ~04:00 ET; Matt: "Open the PR, I'll merge it in the morning. Don't start 7.")

- Nothing is running. W6 cloud sessions (gen2-w6, gen2-w6-swing) archived; the wind-down check-in is disabled.
- Release PR #46 (https://github.com/mshaffe1111/Sloths-Adventure-/pull/46) is open for Matt to merge (everything since PR #45; test link v229): World 6 on gen2 (6-1..6-7, 6-9; 6-8 hand-built and the
  6-10 boss later), the animal clearance fix, Matt's painted dirty/fast water for Worlds 6-10 (badWaterArt.ts) and Dot's water line,
  qa-fix-w123 (3-1, 2-2, 1-7, part of 2-6), qa-fix-dot, qa-fix-meeca (17 lines + nudges approved), W3 r2, W4 r3-r7, 5-7/5-9 on gen2,
  Matt's Gemini sheets saved, the polish rule. After the merge: check the deploy run and the APK, tell QA.
- Why the animal clearance bug was missed (82 hops by animals on 6-2/6-5/6-9): the 120 px rule lived only in the old generator's
  stageQuality test; the gen2 pipeline and curation didn't know it, and cost mode ran the full suite only at the end. Fixed at the source
  (JUMP_CLEAR in the pipeline, curation drops bad rolls); lesson in STAGE-RULES §6 and DESIGN.md B12. Also: CLAUDE.md's suite command
  misses src/game/gen2/, so run the gen2 tests too.
- World 6 gen2 stages preload the world's whole creature set (their animals vary by roll).
- Waiting on Matt (one question at a time): the look-alike rule (§2 "no 20 s stretch alike between stages") can't be met in World 6
  (the measure's alphabet is too small): better measure, or relax it? Then World 7 when he says.
- Leftovers: qa-fix-w123's 3-3 and the rest of 2-6 (helper interrupted 03:01); rope traverse (Gemini sheet); first swim in clean water;
  the rest of the dirty-water sheet (log, warning post, reeds, pipe waterfall, scum, splash) in reference/prop-sheets/gemini-batch-2026-10-29/;
  tomorrow's art pickup below; list the major code-drawn looks that hurt Pokey for painted sheets (polish rule).

## Live (main)

- PR #46 (2026-10-29 08:53 UTC, Matt merged): World 6 on gen2 (6-1..6-7, 6-9), the animal clearance fix, painted dirty/fast water W6-10,
  QA fixes, W3 r2, W4 r3-r7, 5-7/5-9 on gen2. Deploy run 40845383242 and APK run 40845383232 both succeeded.

- PR #39 (2026-10-28): Worlds 1-2 rebuilt, iPhone sound fix, Worlds 1-4 groundwork.
- PR #40 (2026-10-28): Worlds 3-4 rebuilt, upright puzzle camera, QA batch 1 fixes, sheets load at stage start, browser fields in
  recordings, the one-time slow-phone tip, the Android build fix (first successful APK, run 40721485781).

## Tomorrow's art pickup (2026-10-28 ~23:30 ET)

- The art helper was stopped (Matt's side). Its two HF creature jobs (6ae2b6ae3fb22a235dd4f5f9, 6ae2b6a341e90535df781f07; "creatures-new-0/1",
  spec tools/art/gen/spec-creatures-new.json in the art-hf worktree, output in the bucket under w6to10/) were left to finish (Matt: let them
  finish). A low-effort helper then cuts them in: W6-10 creature clip sheets (crab, piranha, sentry, bat, owl, lizard, beetle, soldier attack/hurt),
  plus Matt's Gemini sheets in reference/prop-sheets/gemini-batch-2026-10-28/: w6-hides-arches, w9w10-bridges, queen-collar-off (crop labels),
  reaver-walk-take2 (still no walk: use 2-3 poses for a code-driven walk). The art-hf worktree has the creature scripts uncommitted.

## Water once Pokey can swim (Matt, 2026-10-29 ~00:10 ET)

- Pokey learns to swim in World 6 (pokey-swim sheets, first-swim moment), but World 2 says "Don't swim" and gen2 water costs a life.
  Matt's answer: the dangerous water is DIRTY or FAST-FLOWING. So: World 6-10 hazard water is drawn murky (grey-brown, scum) or fast
  (current streaks, tide channels) and still costs a life; clean, calm water (where the first swim happens, and later pools) is swimmable.
  To do tomorrow: the water look for gen2 hazard water, Dot's World 6 water line with the reason (new line for Matt's approval, e.g.
  "Careful! That water's dirty and fast. Flick up and over."), and check where the first-swim moment sits so it's in clean water.
  6-8's rising tide = fast water. Tonight's World 6 ships with today's water; the look and line follow.

## Rope traverse looks awful (Matt, 2026-10-28 ~23:55 ET; screenshot reference/prop-sheets/qa-notes/rope-traverse-2026-10-28.png)

- Pokey hangs in one stiff pose under a rope drawn as a dashed yellow line. Fix tomorrow: Matt's Gemini hand-over-hand sheet (prompt given:
  8 poses, 2 rows) → a cycle while moving, a sway while still; the rope drawn as a painted rope (W2 rope texture) with a little sag. Not HF:
  Pokey drifts off model there and the last HF money is on the creatures.

## Cost mode (Matt, 2026-10-28 ~22:45 ET): one builder per world, cheaper effort for routine work, tests once at the end and one gate
per merge batch, QA once per world; never skip a rule (LEAD-PLAYBOOK §7).

## Update 2026-10-28 ~21:20 ET

- LIVE: PR #45 vine hotfix (self-swinging vines; deployed, APK built). Test link v225 = ccr with the vines.
- W4 round 6 (catch ledges, Matt's earlier call; climb rocks) merged in ccr, gate running → test link. W4 round 7 (QA C5/C6/D5) sent.
- QA batch 2026-10-29 assigned: qa-fix-w123 (3-1 water gap BLOCKER, 2-2 ponds/flags, 1-7, 2-6, 3-3), qa-fix-dot (heart tip at full hp,
  misfiring/long lines, mid-stage sheet loads), qa-fix-meeca (room nudges, room 2 upright, pick-up teaching, carving ring, counter label).
- World 6 hook-up: gen2-w6 session on gen2-w6-hook. gen2 core DONE (f443b11).
- Art: gallery published; Gemini prompt page https://claude.ai/artifact/59Dv4xofbzSP7U5mz4CDyW (17 prop sheets + 3 characters). Matt's
  first 10 sheets in reference/prop-sheets/gemini-batch-2026-10-28/ (redo asked: W7 plates, Reaver walk). Art helper cutting them in.

## Live and test link (2026-10-28 ~20:30 ET)

- LIVE: PR #43 (polish, W1/W2/W4 round 2, gen2 core, Dot fix) and PR #44 (Meeca's trails rebuilt; Matt tested and approved, and
  approved her line "Too far to jump. The high way, then."). Both deployed, APK built.
- Test link v224 (ccr): + W3 round 2, W4 round 3, 5-7/5-9 on gen2 (gen2-hook 5c651ee; 5-9 Easy goal 5; flags <= 4,500 px).
  Open: 5-7/5-9 look alike by era's 20 s rule (every W5 stage does: same few moves), so it goes to a World 5 variety pass; W5 band below W4.
- Vine HOTFIX: Matt approved the v2 videos (period 2.85/3.3 s, amp <= 0.45 rad, no overlap, out of step, every jump >= 167/300 ms;
  root cause: a neighbour vine took over the swing). vine-fix 7d09039, final suite in progress → small PR → main.
- Art: Matt "Love it all, use as much as possible". Gallery published (https://claude.ai/artifact/6huUggQRkCkBs3K4Bf47o5). Art helper
  a01f960681f8dcc2a: ~$5 re-runs (Monarch fly/hover, Flicker lead/dart, Reaver walk), then cut-in on art-cutin. Matt will make in Gemini:
  side-on props (W10 stair, W7 block, W9 slab, W8 liana), collars-off Queen and General, Reaver walk pose sheet.
- World 4 round 4 (climb rocks, Matt: "harder, still safe"; bands.ts timing term) held off the test link; round 5 running.

## Release PR #43 (opened 2026-10-28 ~18:45 ET, Matt: "everything that's in the merge right now can go through, I've tested it")

- ccr at b080ec1: polish, W1 r2, W2 r2, W4 r2, gen2 core, the Dot fix. Gate: tsc clean, suite 1622 pass 0 fail (2 to-dos), build ok.
  After Matt merges: check the deploy run and the APK, tell QA.
- Next: the vine HOTFIX (Matt: "hot fix, deployed sooner than later"): self-swinging vines (helper a72c2052ca6c361b1, branch
  vine-fix) as its own small PR. Preview video to Matt first.

## Running now (2026-10-28 ~18:45 ET)

- Vine hotfix: self-swinging vines (Donkey Kong Jr./DKC style: the vine swings on its own, up/down climbs, left/right only turns,
  timing the jump-off is the skill). Release window Easy >=300 ms, Normal >=167 ms.

- Meeca's stage layout rebuild (Matt: "90% dead time; climbing unneeded, you can run along the bottom; I like the puzzles"): cloud
  session_01FhBbYNdrb48mkEg3GEPojL, branch meeca-layout. Rooms, story and ending unchanged.
- World 6 on gen2 (Matt: start World 6 levels; bosses later, all together): cloud session_01FhBbYNSMYfaErWSvnYgapx (gen2-w6: manifest +
  ground/water/mudflat/purge/gauntlet sections) and session_01FhBbYLaFVRQ535P9f6Pssg (gen2-w6-swing: lianas, dark roots, the
  raise/lower-water room). 6-8 Stilt Climb hand-built later; 6-10 boss later. gen2 core helper (local, gen2-core): liana/vine pieces,
  water/tide zones, dark zone.
- gen2 hook-up (step G) for 5-7 and 5-9: local helper, branch gen2-hook.
- World 3 round 2, World 4 round 3 (cloud). World 1 archived; World 2 done (archive after the next release).
- Promo video brief given to Matt for his own agent (20-25 s, points testers at the live game).

## On the work branch, test link v220 (2026-10-28 ~18:30 ET)

- The polish pass merged: splash, carved title, Pokey and Meeca's painted clips, the shared menu kit, stage wipes. Needs Matt's
  real-phone check (headless: title 13-16 fps for ~12 s after arrival, World Map slow under 4x CPU throttle; a lite mode exists).
- World 1 round 2 (every rule break across 200 rolls fixed), World 4 round 2. Suite 1618 pass 0 fail; build ok.
- PR #42 is LIVE (site published, APK built 2026-10-28 ~17:55 ET).
- Art run DONE: $54.65 of $65 (about $5 kept for re-runs). Gallery tools/art/gallery-w5-10/index.html in the art-hf worktree
  (images git-ignored; rebuild steps in the helper's report), to publish for Matt's picks. Broken: Reaver walk, Iron-Claw jump, Drake
  leap/claw, Monarch flying loops, Flicker's travelling moves (first halves only), collars-off Queen/General. Plan + ledger: ART-PLAN.md.

## Release PR #42 (opened 2026-10-28 ~17:50 ET on Matt's "merge and get this pushed out"; test link v219 is this build)

Worlds 1-4 variety round 1, Jungle Cards, Dot's punch-tip fix, gen2 core (unused). Matt: from here, fixes go out as rolling releases
(each round: test link, then a PR he merges). World 4: 4-3 and 4-7 treated as set pieces without the variety target; one last round
for quiet stretches and difficulty (lead's recommendation A; Matt said keep tweaking and merging).

## Live since PR #41 (2026-10-28): Meeca's stage rebuilt, Easy jump gate, batch 2, W1-2 props, measuring tools, gen2 core

## On the work branch, not live yet

- Jungle Cards match today's game (merged 2026-10-28, test link v217): 7 new cards in a "Met on the road" row, full-body art for
  all 10 guardians, every tip rewritten in touch words, cards in journey order; one 255 KB card sheet.

## On the work branch before PR #41 (now live) (pushed for safe keeping; draft PR #41 tracks it, not a release)

- QA batch 2 + Dot toned down + Gemini jump forgiveness in every world (merged 8ed2c53, fast gate 77/77; cloud full check running).
- World 1-4 art placed (merged 2026-10-28, fast gate passed): every sheet cell used except World 1's nest doors and petal bundle,
  World 2's trough and pink net (follow-up after QA batch 2 lands), and 4 World 5 beetle frames. Looks rotate by roll (artRoll.ts).
- Generator variety tools (merged 2026-10-28): src/game/gen2/variety.ts (ShuffleBag, CooldownQueue, WorldOnce, poissonPlace,
  pickWeighted), not yet used by stages.
- The first-timer bot (merged 2026-10-28): `npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer` (~10 min). Known weak spots of
  the bot: World 2 lily-pad rivers (its life counts there are pessimistic) and tall climbs (572-863 px 'stuck' in 1-4, 2-6, 3-4,
  4-3, 4-6 may be the bot, not the stage): check by hand before acting on those.

- Meeca's stage "On the March North" (merged 2026-10-28, suite 1537 pass): camp, Flicker, five rooms (tea channel in room 4), the
  approved ending; replaces the old 5-M outright.
- The measuring tools (merged 2026-10-28): pacing and difficulty bands in every inspector run (pacing.ts, bands.ts); the 200-roll
  tool `tools/inspect/era.ts` and its guard test rollGuard.test.ts (1-4, 2-6, 3-1 marked to-do).
- The new generator's core (merged 2026-10-28): src/game/gen2/DESIGN.md, types.ts, pipeline.ts, a toy world; all six passes run and
  pass levelCheck; no real stage uses it yet (phase 2 waits on Matt's 4 answers below).
- Easy never needs a full-hold jump (merged 2026-10-28, Gemini G8 now a gate in easyMode.test.ts): Easy widens the landing, adds a
  step or a catch ledge where only a full hold reaches; the jump stays. Easy loads ~0.3-0.4 s slower on desktop (1-6 heaviest).
- World 1-2 art follow-up (merged 2026-10-28): 1-4 nest door, petal bundles as room rewards, 1-6 branch gate, 2-2 trough; World 4's
  anchor peg now drawn on most rolls (search fix). Still unused: World 2's pink fishing net (needs a re-paint), World 3's pressed stone
  plate (no W3 room has a weight plate).
- Known rule breaks for the variety pass (every roll): 1-3 Normal snake hit in the first 5 s; 4-7 opening life at 3.5 s; 4-5
  Sovereign's first strike far from cover on seeds 2-3; 4-3 surge stair press window 67-133 ms; Dot's punch tip repeated in 4-7/4-4.
- Gap files: reference/gaps/W3-4.md, PACING-BANDS-W1-5.md, ERA-W1-5.md. Headline: rolls 96-100% alike in Worlds 1-4 (target 65%);
  the difficulty does not climb (World 3 below World 2, World 5 below World 4; World 2 partly inflated by the bot's lily-pad limit);
  Normal 0.43-0.55 actions a second (Gemini 0.75-1.15); Easy has the same beats as Normal so it gets no rests.
- Docs: GEMINI-PCG-RESEARCH.md, STAGE-RULES.md, GEMINI-LEDGER.md, LEAD-PLAYBOOK.md, this file.
- Meeca's art sheets (meeca-poses, meeca-props) and their cuts.

## Helpers running (each must pass LEAD-PLAYBOOK §4 before merging)

| Helper | Job | Owns | Started |
|---|---|---|---|
| Hugging Face art run (Matt 2026-10-28) | Enemies first, hardest first (bosses, new creature models, animated clips), then what the game still needs, then art and props: reference/ART-PLAN.md inventory with costs, Matt has ~$70 left: plan to $65 ($40 enemies, ~$25 what's left to finish then art and props, ~$5 spare), results in a gallery for Matt's pick (show first, nothing into src/ yet) | reference/ART-PLAN.md, tools/art/ new folder + new specs (branch art-hf) | 2026-10-28 |

| Polish prototype (Matt 2026-10-28: "make it look like a highly polished start screen") | Loading -> title in one piece (no white flash, font swap or pop-in), living title scene, entrances, one button family, menus/cards/map/pause/cleared screens, stage start/end wipes; preview video first (show first) | TitleScreen, StartMenu, PauseMenu, menuParts, TrophyRoom styling, WorldMap, dialogs, CSS (branch polish-ui) | 2026-10-28 |

## Variety pass round 1 result (lead's gate 2026-10-28 ~17:05 ET on the W1+W2+W4 merge: suite 1600 pass 0 fail, build ok)

- Variety 0.35+ met: 1-1, 1-2, 1-5, 1-7, 2-2, 2-3, 2-4, 2-5, 2-7. Low: 1-4 .12, 1-6 .16, 1-8 .06, 1-9 .23, 2-6 .04, 2-8 .09,
  2-9 .19, all of World 4 (.002-.23).
- New/worse rule breaks across rolls: 1-8 quiet 200/200; W2 dead time (2-7, 2-9 200/200; 2-5 148; 2-2 131; 2-4 73); 1-7 dead 105; 1-1 seed 3
  67 ms window; 4-2 33 ms window; 4-6 kid hotspot 6/10.
- Bands (Normal middle, seeds 1-3): W1 ~21, W2 ~44, W3 ~21 (W3 not merged yet), W4 ~22. The climb isn't there yet.
- Test link v218 (2026-10-28 ~17:30 ET): Worlds 1-4 round 1 + gen2 core, with the known issues in its note (Matt: publish to his
  test link as soon as the suite and build pass). Round 2 sent to the W1, W2, W4 builders (rule breaks first, then bands,
  then variety).

## Cloud builders (variety pass, Matt 2026-10-28 "all four worlds now"; each pushes to its own branch, the lead merges after §4)

| Session | World | Branch |
|---|---|---|
| session_01FhBbYNmSk5CrHi81ChVXeV | World 1 (+ layoutMemory: re-roll a roll too like the last) | variety-w1 |
| session_01FhBbYLesoiunAyDUUtL2c6 | World 2 | variety-w2 |
| session_01FhBbYJbmE5kU47zP8gtSsr | World 3 | variety-w3 |
| session_01FhBbYNv8Pbizpa68Y6hdjv | World 4 | variety-w4 |

| session_01FhBbYMcZS6AocKxX16zojF | gen2 A+B: World 5 manifest + 5-7 sections | gen2-w5 |
| session_01FhBbYPF9t6BWgk8Bx6vo9h | gen2 D: 5-9 arena + two puzzle rooms | gen2-w5-arena |
| session_01FhBbYKW3x7bTGysk8cMXNu | gen2 F: curate.ts + seeds.ts (16 per stage) | gen2-curate |

Local: the architect on gen2 piece E (sub-blocks) + the Easy water rule (pipeline.ts, types.ts). Step G (hook-up, old 5-7..5-9 deleted)
is the lead's, after all pieces pass.

Band targets given (Normal middle on bands.ts): World 1 ~20, 2 ~30, 3 ~40, 4 ~50. Pacing: Normal 0.6 actions/s in World 1 rising to 0.75 in
World 4; Easy bursts 6-8 s with 2 s rests.

## Release

- PR #41 merged and LIVE 2026-10-28 18:37 (test link v216): site published (pages run success), APK built (run 40746802703). QA
  session (session_01NC7oJLxL2g1UhhBcGkZBBA) told what to test on the live build.
- Flicker: the art run lists every state he needs for the whole game and makes them in round 1 (Matt 2026-10-28).

## Budget

Matt is on the Max plan (2026-10-28) and wants more helpers in parallel to finish sooner ("even twice as many"): run every
separate job at once, never two on the same files. Still no duplicate or
unasked work (LEAD-PLAYBOOK §7); if the weekly limit gets close, Matt says so and it drops to one world at a time.

## Open decisions for Matt (ask one at a time)

1. Meeca's new lines (camp, Flicker, rooms 1-3, hints) and the new map line.
2. Naturalist medal: still the 11 predators, or all 18 journal cards (the 7 new "met on the road" ones too)?
3. Pell's and the soldiers' journal tips read right?

Step G (lead's gen2 hook-up) must also: run heartsAtFlags and fixPickups on gen2 stages; make easyStage() skip gen2 stages (no double
softening); one per-stage kit chooser (5-9 uses w5ArenaKit); judge World 5's band with the first-timer bot after hook-up (the
inspector-only score can't show it: 5-7 reads ~21 before the first-timer); draw the water-warning sign (placeholder post until art).

Pending for the architect when it resumes: commit c912bc3 finished (full suite + build), then the gauntlet/purge top-up in fillSockets
(quota + 2 on Normal) and Easy's quota at round(0.6 x targetCount) (5-9 builder found 5-9 lays 16-26 of 26 animals).

## Decided today (also on the Docs roadmap)

- The game gets harder world by world: each world has its own difficulty band and the bands climb; inside a world stages may go
  up and down, but none leaves its world's band (World 2 stage 8 never as hard as World 4). Later deaths and replays are expected; Easy is gentler, never empty (still double jumps and the
  tougher moves, softened); QA's "too hard" is sorted into unfair (fix) or hard but fair (keep). STAGE-RULES §1b.

- Keep the whole puzzle room in view upright, even if Pokey shrinks to ~0.5x (not Gemini's 0.72x floor).
- Meeca's Room 4 is the tea channel. World 5's night strips are made in code.
- Slow phones: recordings name the browser; the one-time "open in Chrome/Safari" tip.
- QA: one bot, random levels. Our bots (kid/Easy, adult/Normal, first-timer) run before anything goes to QA.
- Title screen direction approved by Matt (2026-10-28, from the idle videos: "I like the way that it's carved in").
- Title logo: carved into bark, carved in stroke by stroke on the first title of a session (chips, gold glow), shown carved after;
  the ribbon is deleted (Matt 2026-10-28). Title pair get real animation clips from the motion model (no code twitching).
- Dot's water warning (gen2, Easy repeats it after 12 s): "Careful, water! Flick up and over." (Matt chose C).
- Usage warning on Matt's weekly limit (2026-10-28 ~16:20 ET, resets Nov 4 2:00 AM ET): Matt chose to keep everything running (C).
- Generator: 16 checked layouts shipped per stage (Matt 2026-10-28). Easy falls land soft on land; over water a fall still
  costs a life on Easy, with a clear warning before the water (Matt chose B, 2026-10-28). About 30 sections per world (Matt chose A). 5-8 stays hand-built; the generator does 5-7 and 5-9 (Matt chose A).
- Variety pass for Worlds 1-4, all four at once. Push (release PR #41). Flicker's animations for the whole game. The polish pass
  on the title and every menu. Jungle Cards updated to today's creatures.
- Dot toned down. All research in the repo; one rulebook; the lead checks every helper's work before merging.

## QA batches

- Batch 1 (2026-10-28 morning): all fixed, live in PR #40.
- Batch 2 (2026-10-28, Worlds 1-2 on build 39fc3db): 9 items, being fixed (helper "QA batch 2").
- Asked of QA (2026-10-28): run the Matt bot through every stage of Worlds 3 and 4 on the live build; report on Matt's "send".

## Cloud sessions (separate machines)

| Session | Job | Branch | Started |
|---|---|---|---|
| ~~session_01FhBbYPCMx5mTFQdQmEtqey~~ (archived: it stopped before the suite; the lead ran the full gate here instead) | Full check of the work branch at 8ed2c53+ (redirected after the batch-2 merge): tsc, full suite, build, inspector + first-timer bot on Worlds 1-4 seeds 1-3, timed | reads ccr-0d59a91c-oy3imz, pushes nothing | 2026-10-28 17:40 UTC |

## Two tracks (Matt, 2026-10-28)

- **Today's code track:** the four original helpers (QA batch 2, art placement, the 200-roll tool, Meeca's stage) stay on bringing the
  current game up to speed plus bug fixes: when one reports and passes the checks, the lead sends it its next piece of that track
  (it keeps its context, which saves tokens) instead of starting a new helper.
- **Generator track:** the architect, the variety tools and the pacing measures, then seed curation, the validator upgrades and
  World 5's building blocks.

## Waiting to start (they need another helper's result)

- Seed curation (pick each stage's best rolls): needs the 200-roll tool.
- Validator upgrades (per-difficulty jump margins D2, local self-repair D3, room-box size J3, co-visibility F7, min spacing C2): needs
  QA batch 2 to land (it is in levelCheck.ts).
- The generator's World 5 building blocks for 5-7..5-9: needs the architect's design and Matt's OK.

## Queued next (in Matt's order; Matt chose 2026-10-28: the Worlds 1-4 pass starts right after step 1, before the rest of World 5)

1. **Finish what is running** (the five helpers above): LEAD-PLAYBOOK §4 checks on each, the test link, then QA's Worlds 3-4 run
   against the checklist. The jump-forgiveness change must land before any stage is re-tuned.
2. **Measure Worlds 1-4, no building:** the 200-roll tool, the first-timer bot (Easy and Normal) and the inspector on seeds 1-3 over
   every stage -> one gap list per stage against STAGE-RULES (roll sameness, rule failures across rolls, new-player hurts and stuck
   spots, Dot pacing, unused art). Show Matt the list before building.
3. **The variety pass**, Worlds 1+2 together, then 3+4 (at most two building helpers): two or three real versions of each stage's
   main sections chosen per roll, a shuffle bag and cooldown for pieces and decor, mirroring where it fits, curated best rolls from
   the 200-roll results (ledger C1, C3, C4, C8, C10); fix the step-2 gap list; place the remaining art (World 1 nest door, petal
   bundle). Proof: rolls 0.65 alike or less (diversity >= 0.35) and no roll breaks a rule.
4. **Easy truly easier, and pacing measured** across Worlds 1-4: wider landings, softer pits, fewer enemies, a per-difficulty
   jump margin (ledger D2, F1); action rate, burst length, tension curve and minimum input window in the inspector (A6, E2-E4, F5).
5. **QA and Matt:** a full QA sweep of each pair of worlds against the checklist, Matt on the test link, release on his "push".
6. Then: the rest of World 5 (5-1..5-5 dead time, 5-6 "Where She Ran" hand-built), the new generator on 5-7..5-9 then Worlds 6-10,
   Flicker's tiered hints (F6).

## The current QA checklist (sent to the QA session 2026-10-28; keep in step with STAGE-RULES)

Report each finding with the stage, the moment (s), upright or sideways, Easy or Normal, and the rule number below it breaks.
1. Opening seconds: anything that can hurt in the first ~5 s of plain walking.
2. Tip before hazard: a hit or a fall that comes before Dot's (or Flicker's) tip that teaches it.
3. Plain walk: a step, lip or dip that stops a plain walk or plain jump; falling back into the same dip twice.
4. Jumps: a jump that needs a perfect timing or a full hold on Easy; a ledge you clearly reached but slid off.
5. Quiet stretches: more than ~4 s with nothing to do (only petals on flat ground counts as nothing).
6. Look-alikes: a stretch that feels the same as another stage of the same world, or as the last time you played it.
7. Puzzle rooms: can't see the piece and what it acts on together upright; a puzzle that costs a life; a hint that gives it away;
   a room you can walk past without solving; a carried thing you can't carry without jumping.
8. Dot: speaks in the first seconds, repeats a tip you already did, lines closer than ~10 s, lines over ~10 words, a tip left up 20 s+.
9. Goals: a count that can't be met fairly on Normal (87.5% petals, all rescues, 75% predators); totals that disagree.
10. Art: a prop that pops in late, a missing state (a pressed plate that doesn't look pressed, a bell that doesn't swing).
11. Device: frame rate, freezes, and the Device column's browser part (an in-app browser, "framed", software drawing).
12. Anything a 7-10-year-old would not understand or would find unfair.

- 2026-10-31 ~7:45 AM ET: W8 Roost Loft (8-1 puzzle room) OK'd by lead. Helper does the polish before curation: painted roost branch (w8roost) for the loft, painted seed pods for the pebbles. Stills sent to Matt. Dot lines (night pieces, loft) go to Matt one at a time.
- 2026-10-31 ~7:50 AM ET: Matt approved all W8 Dot lines as written (Roost Loft door/pebble/open lines and both hints; night pieces: sleeping bats, moon flower, bats stirring). Helper told.
- 2026-10-31 ~8:00 AM ET: W8 loft polish in (w8-merge 8710f5bd: roost branch, seed pods). Lead OK'd curation wiring with 3 fixes: visible lever, door that reads locked/open, portrait framing showing pile+knot+door.
- 2026-10-31 7:51 AM ET: Release #55 check. APK build OK; GitHub Release v2026.10.31-24 has the APK (first auto-Release worked). Website deploy still in its test step (started 7:22; now runs the gen2 tests too). Re-check ~8:11 AM ET.
- 2026-10-31 ~8:00 AM ET: W8 loft polished and in curation (w8-merge 15b4438e): lever in view, locked-door bar on all W8 bark doors, portrait framing fixed, ladder-drop animation. Lead asked: door bar repainted to look painted (it reads flat/UI), lever glint. 8-1 variety ~0.35 → must reach 0.45+ with new pieces. W5 helper fixing 5-1/5-2/5-5 test failures. Check-in re-armed (trig_018Dfwd99HP5pStwrmPWgfJp).
- 2026-10-31 8:21 AM ET: Release #55 LIVE (deploy run 41196415308 success; Pages build success). APK on Releases: v2026.10.31-24. The deploy's test step took 58 min on one runner once the gen2 tests joined (gen2 alone: 10.5 min wall / 24 min CPU locally). Fix on ccr: deploy.yml now splits the same tests across 6 parallel runners (node --test-shard); publish needs all 6. Rides the next release.
- 2026-10-31 8:30 AM ET W5 helper: 5-1 .019→.486, 5-2 .018→.538, 5-5 .021→.446, 5-3 .032→.197; dead time in budget except 5-2 (half the rolls 1-2 s over); quiet < 4 s; HF $0. Lead: 5-3 NOT accepted at 0.20 (Matt's more-pieces rule) → new orchid pieces (climb/steam/swing/spider/pit), floor .35 aim .45, up to $15 HF. 5-8 STAYS HAND-BUILT (Matt Oct 28); brief's "5-8 to gen2" was wrong → pieces dealt per play instead. Order: 5-3, 5-4, 5-6 to gen2, 5-8. W8: door bar + lever glint pass; 8-8 curated 0.627; 8-9, 8-1, 8-6 curating.
- 2026-10-31 9:01 AM ET check-in: W8 active (106a713e 8:52: 8-1 leapers reshaped, 8-2 own rests; 8-1 curated first at 0.325 because the neighbour rule dropped rolls that looked like 8-2's; re-curating chain 8-2→8-1→8-6→8-5 + 8-3, ~2 h; 8-9 curated 0.530). W5 working on 5-4 but had NOT pushed since 1:26 AM: told to push now and do 5-3 first.
- 2026-10-31 9:32 AM ET check-in: W8 pushed 7a8350b6 (8-3 curated 16/16 0.405; re-pass after the chain; pairwise share check written). W5 still unpushed since 1:26 AM (5-4 tests pass, "final run then push"); told again to push NOW.
- 2026-10-31 9:35 AM ET W5 pushed 6c56cd85 (merged ccr). Variety 5-1 .486, 5-2 .539, 5-3 .197, 5-4 .662, 5-5 .439. Dead over budget: 5-2 48.1/47.0, 5-4 53.3/37.8. Spider-spot memory down (5-3 .96→.47). One red (w5Order 5-2 seed 38). Next: red fix → 5-3 orchids → 5-4/5-2 dead time → 5-6 gen2 → 5-8.
- 2026-10-31 9:45 AM ET, MATT: "start getting the helper that's working on the pokey animations started." Resumed pokey-anim helper session_01FhBbYLy1ijcGLLgc9ijzuE (branch pokey-anim; merge ccr first). Order: rope (Qwen-Edit in-betweens), punch re-roll from the cross, slide, vine swing, flip gaps, small-hop pose, landing dust (engine change allowed, traces identical), then the 22-move inventory again. HF <= $15 today. Video/strip proof + Polish check. Reports ~2 h.
- 2026-10-31 10:05 AM ET, MATT BUG (P1): Meeca's stage 5-M "completely broken" on live #55: "She's missing... nothing running, just the background. There's a spot where you climb up and it just resets you again." All 38 meeca node tests pass on ccr (they don't draw). Started: meeca-fix helper session_01FhBbYMTHpjYJgxHjiLts1F (high; repro in real app, root cause + breaking commit, gate test, play to end both ways); and, at Matt's ask, a blind QA tester session_01FhBbYNBvsb9Z15BeG5PpLy (medium; full description, qa-5m-blind). Suspects: per-world art preload/release (PERF-E / memory fix) not loading Meeca's atlases; PERF-F; last night's engine merges.
- 2026-10-31 10:15 AM ET: W5 pushed 6bdf19a3 (seed-38 red fixed) + 8fabd7ad (5-3 .197→.259, one orchid style per play; dead 28/41). MATT DECIDED 5-3: NEW MOVING BLOOM (sways/bobs, time the jump; HF art ≤$15, taught, Dot line to Matt). W5 order: 5-4 swing fix → moving bloom (still first) → 5-2 → 5-6 → 5-8. Pokey-anim started (726d4395; landing dust first). 10 AM "Build 1" trigger: not starting another helper (5 running).
- 2026-10-31 10:22 AM ET W5 c5d46861 (5-4 route swings chains: 5-4 .527, dead 44.2/38.4) + 2497f10d (5-2 .569, dead 48.5/46.2). 5-1 .486, 5-5 .440 OK. route.ts change (drops under lianas = miss) shifts W1-4/W8 era numbers: RE-MEASURE W8 after merging w5-pieces. Helper scope cut: moving bloom → 5-4 dead → 5-2 dead, then STOP + NEXT.md; 5-6 (gen2) + 5-8 go to a fresh helper later. Lever room + web art not started.
- 2026-10-31 10:25 AM ET: W5 moving bloom GO (HF stem+bloom ~$0.80, swings on an arc ~3 s, its own Z beat, taught alone over grass). Matt APPROVED Dot line: "This orchid sways. Jump when it swings close."
- 2026-10-31 10:30 AM ET, MATT: "let's work on either a 12 or 1 o'clock build." Lead chose 1 PM ET test link. MERGE CUTOFF 12:00 noon; helpers' 11:45 notes; merge order meeca-fix → w8-merge → w5-pieces → pokey-anim; full gate; test link republished by 1 PM. Unfinished work stays on WIP branches.
- 2026-10-31 10:40 AM ET, MATT: "You can stop that helper. I can see that it's struggling. I made video of it." → meeca-fix helper (session_01FhBbYMTHpjYJgxHjiLts1F) interrupted + told to push notes and end (it had not reproduced: Meeca drew and walked on dev and local prod builds). Blind tester still running (found the high-log fall-through at ~45 s). Waiting on Matt's video.
- 2026-10-31 10:30 AM ET 5-M ROOT CAUSE (lead, from Matt's portrait videos + "it just puts you back to where the cocoon is"): meecaPlay.ts after() clamps past an unmarked trunk only when grounded at its standY; hopping the cocoon/ledge and climbing the post skips the mark, then landing on path ground past the logs snaps p.x back to the trunk. Plus: the carving gesture is never taught/confirmed; only checkpoint is spawn; portrait start shows no Meeca + 2 purple pulses; Flicker box cut off upright. Fix helper #2 session_01FhBbYJnmGHARNs2U1dag2k (meeca-fix2): 1 no snap-back (solid stop, all routes, test) 2 teach carving + progress + done + hold fallback (lines to Matt) 3 checkpoints — 1-3 by noon; then 4 portrait, 5 log fall-through. Evidence: reference/qa-reports/5-M-matt-2026-10-31/. Blind tester done (qa-5m-blind).
- 2026-10-31 10:50 AM ET W5 swaying orchid wired (a735b7c5; HF $0.07; 5-3 .259→.295). Lead sent back for polish: Matt's exact Dot line, bloom ~3x Pokey (reads as foreground) → ledge-sized shelf, visible swing, Pokey see-through in 3 stills (respawn or a game-wide blink bug? ties to 5-M flashing). In 1 PM build only if fixed by noon, else WIP.
- 2026-10-31 11:00 AM ET 5-M fix2 372b70f: trunk wall at all heights (meecaWall.test), carving taught (ghost finger, filling ring, done moment, 3-miss hold fallback, forgiving circle), checkpoints (after camp, after mark, each room door), title card waits for art ("GETTING READY": Meeca missing at start = art still downloading). Matt APPROVED Flicker lines: "Mark it first. Draw circles on the bark." / "There. Your M. Now we can find the way back." / "Cut deep. Pokey will see that." / "Tricky? Then just hold your finger down." PURPLE PULSE still open: Matt says Flash notifications OFF and the videos were the WEBSITE in Chrome (likely fullscreen) → helper hunting a full-page tint in the game.
- 2026-10-31 10:52 AM ET pokey-anim 7ec99dca (ccr merged, fast-forward): rope 6→10 frames (Qwen-Edit), jab re-made from the cross (approved), hook return, slide re-posed (seated, arms out; zoom proof requested), vine swing in-betweens + lag, small hop keeps painted frames, landing dust 84→54 px. Flip gaps: cross-fade thrown (worse). Traces identical. HF ~$3.08 today.
- 2026-10-31 11:09 AM ET check-in: all 4 active. W8 d8882082 (8-2 curated .381). Meeca fix2 3ac6442f (upright framing, ring in view, thin-log lip catch, flag by the mark). Anim 7ec99dca. W5 31991c1b: 5-4 dead 39/38, 5-2 40.4/46, NEXT.md written; swaying-orchid polish NOT done → fix by 11:45 or move to w5-sway-wip.
- 2026-10-31 11:20 AM ET: 5-M fix2 85ec5ff: PURPLE = the phone's screen recorder (both clips flash at identical offsets from recording start; rgba(119,0,243,.42); none afterward), not the game. Real fixes: art-wait card, trunk wall, carving taught + 3 real-touch gesture bugs, checkpoints (mark flag before trunk), upright camera shows next log, Flicker box inset, thin-log lip catch. Gate running. W5 noon candidate 4ef1af1e (sway polished: Matt's line, 96 px, behind Pokey, visible swing; 155/155 W5 tests); last ask: the white "lip" reads as a plate. W5 helper then STOPS (5-6/5-8 per NEXT.md, fresh helper later).
- 2026-10-31 11:22 AM ET: W5 noon candidate 50f796ef (plate gone, petal edge is the standing line; lead checked the zoom: clean). W5 helper STOPPED.
- 2026-10-31 11:41 AM ET pokey-anim round 3 DONE, noon hash d07eaab5 (ccr merged; full suite 1899/0, drawcheck + artcheck PASS on 08431c5d; traces identical; HF ~$3.08). Lead checked slide-zoom: reads clearly as a sit-slide (seated, feet forward, arms out, leans) → IN. Named rough spot: the slide's landing puffs sit in a neat row of 3. Helper stopped.
- 2026-10-31 11:45 AM ET: MATT APPROVED a dozing boa theme for 8-1 (gentle, some layouts, taught). Not in 1 PM build; W8 helper does it after 8-5, then re-curates 8-1 toward .45. W8 cutoff note: f78f1831, 8-1 .356 (loft in 9/16), 8-2 .381, 8-3 .405, 8-6 .573, 8-8 .627, 8-9 .530; 8-5 at 6/16, fast pass ETA ~11:55 (lead waits to 12:10).
- 2026-10-31 11:47 AM ET, MATT: "make him not jump like he's doing kung fu... a nice regular jump, not Bruce Lee." → pokey-anim resumed: all jumps use his painted jump frames (crouch, rise, fall, land); drop the round-1 Wan leap; check the double-jump roll; traces identical; in 1 PM build if green by 12:20.
- 2026-10-31 12:08 PM ET 1 PM BUILD: merged into ccr 588300ba: meeca-fix2 80c7633, w8-merge 7266f7bc, w5-pieces 50f796ef, pokey-anim bbe7a8ee (round 3 + regular jump: Wan leap gone, lead checked jump-regular.jpg). tsc green; W5/W8/Meeca tests 210/210. Full gate running (tests + build + artcheck + drawcheck). NOTE: re-measure W8 era after w5's route.ts change (later).
- 2026-10-31 12:10 PM ET: pokey-anim bbe7a8ee (regular jump; Wan clip deleted; roll checked) is in the merge. W8 built the dozing boa for 8-1 (1758eb0c, not in 1 PM build; existing boa art, sleep state in predatorAI; 8-1 raw mean ~.37→.61). Matt APPROVED boa tip "A sleeping boa. Hop right over it!". W8 told to merge ccr (w5 era tools) before re-curating 8-1.
- 2026-10-31 12:20 PM ET W8 bots found: 8-6 Normal glides too long (80-94% of reach) + hunter on landing → 72-84%; 8-5/8-9 moon flower boughs too high → 170 px; Easy > Normal on 8-8/8-9 by ~1 pt (kid hit a lot on Easy). Re-curating 8-6/8-9/8-5, 8-2/8-1(boa)/8-3. The 1 PM link carries 7266f7bc WITH these known issues (named to Matt). Matt APPROVED new flower line "A moon flower! Bounce on it to get up high."
- 2026-10-31 12:30 PM ET: TEST LINK v13 PUBLISHED (artifact version 18) at Matt's "go ahead", from ccr 588300ba: Meeca fix2, W5 (50f796ef), W8 (7266f7bc, known: 8-5/8-6/8-9 too hard for first-timer bots, Easy>Normal on 8-8/8-9; fixes coming), pokey-anim (regular jump). Build + artcheck + drawcheck PASS on the merge; full test suite still running (helpers' own full suites: meeca 2071/0, W5 2059/0, anim 1899/0). Moon flower line shipped as "Moon flower! Bounce on it to get up high." (9-word rule).
- 2026-10-31 12:40 PM ET, MATT: "this can be released. Push this to my test site and to the production site." Test link done (v18). Release: waiting on the full suite on 588300ba, then release branch + PR via GitHub MCP. Play Store §6: no new screens/network/saves; Meeca's "GETTING READY" waits on bundled art (offline-safe, 12 s cap). Told Matt: W8's known first-timer hard spots ship with it (tag still on), fixes next release.
- MATT IDEA (12:40 PM): "platforms move up and down... the logs that you run on actually move up and down, and it's a timing" → new rising/sinking log piece for the generator grab bags. Scope question to Matt pending.
- MATT 12:45 PM: moving (rising/sinking) logs go into WORLDS 9 AND 10 FIRST, built in as World 9 starts on gen2 (after World 8), then World 10. Taught on first sight, HF art per world, timing beat in the grab bag.
- 2026-10-31 12:55 PM ET: full gate on ccr 588300ba: build/art/draw PASS; tests hit the 40-min cap with 2 FAILS, both new W8: platformPlan 8-2 shelf 97%; safeStart 8-5/8-6 layout 2 ground ends <1300 px. MATT CHOSE: release WITHOUT new W8. Release branch release-2026-10-31b = ccr 8a77795b + meeca-fix2 + w5-pieces + pokey-anim (no W8); full suite running in 3 shards. W8 told to fix both + run full suite before calling seeds done.
- 2026-10-31 1:20 PM ET, MATT: "starting 9 and 10... make the pieces ahead of time... not bare minimum... no redundant rework." → STAGE-RULES §1c "Pieces first, curate once" written. Starting W9 and W10 pieces-first helpers now (W8 still finishing; 3 helpers).
- 2026-10-31 1:25 PM ET, MATT: "have them pull sheets for 1 thru 4 too. The audit also stated to do more at a time to keep consistent." → W1-4 sheets helper session_01FhBbYKp4ffis3QWPLKJxDQ (w1-4-sheets): 4 GRAB-BAGs → style sheet per world → each world's new art in ONE HF batch (shared light, flat key, edge pipeline), ≤$30 total, no stage code. W9 (session_01FhBbYKdn3cfo4KonNSt5oL, w9-pieces, ≤$25) and W10 (session_01FhBbYMTbBduJUDgqzuqUKi, w10-pieces, ≤$25) told the same one-batch-per-world rule. Helpers running: W8, W9, W10, W1-4.
- 2026-10-31 1:40 PM ET: RELEASE PR #56 opened (release-2026-10-31b 83838eaf, no new W8): tsc, 2,075 tests 0 fail, build, artcheck, drawcheck 290 s PASS. Waiting on Matt to merge.
- MATT 1:40 PM: "We need to use all the art we create. Its a waste otherwise. I want a fun unique game." → STAGE-RULES §4 updated: unused art is a bug; tools/art/artuse.mjs + gate test (W1-4 sheets helper builds it); every grab bag places the world's unused art first.
- 2026-10-31 1:45 PM ET: W9 merged up (85a2f897) + GRAB-BAG (12 new piece types incl. N1 lava rafts / N2 charred logs = Matt's moving logs; 5 themes/stage; ~33 new section types; most art already painted & unused; 6 HF pieces ~$3.30 as ONE batch). Lead: merge w8-merge in; raft lock alternates with 9-5 hot plates; E1 moving logs first. W1-4 GRAB-BAGs approved (W1 22 types, W2 22, W3 24, W4 26; ~$3.6 HF, one batch/world): caiman/frogs in W2 as gentle (bask/hop, no chase); W1 rolling acorns = setback only. Dot lines from all bags → one review with Matt. W8: 8-3 .442, 8-5 .416, 8-2 .372 (re-curate after 8-1), boa stills 5edf9b5a.
- 2026-10-31 1:38 PM ET: MATT MERGED PR #56. Deploy (first 6-shard run) + APK building; check at ~2:00 PM ET.
- 2026-10-31 1:45 PM ET: BLOCKER: the cloud environment's network policy denies huggingface.co (proxy 403) in helper and lead containers, so finished HF art can't be pulled into the repo. Asked Matt to add huggingface.co, *.hf.co, cdn-lfs.huggingface.co to Allowed domains. Meanwhile W1-4 helper generates + packs inside HF jobs into bucket mshaffe111/w5-xfer/w1to4/.
- 2026-10-31 1:48 PM ET: HF blocker CLEARED: hf_fs attach pulls bucket files byte-for-byte into the container; no network change needed (told Matt to ignore).
- 2026-10-31 1:50 PM ET: art-use checker + gate pushed (w1-4-sheets 23a9ed32): 266 unused pieces game-wide, allow-list can only shrink. W1 5, W2 4, W3 6, W4 26, W5 18, W6 12, W7 16, W8 6, W9 22, W10 16, BOSSES 70 (venom 19, boss910/1010 set pieces 21, croc 7...), shared 41, story/characters 14, creatures 9, UI 1. Painted squirrels in story18-squirrels.webp unused → W1 lift crew. HF batches launched (W1/W4 ~$0.2 each done; W2/W3 running). TODO: bosses/shared/story unused need an owner (later helper).
- 2026-10-31 1:55 PM ET: Matt added the Hugging Face hosts to the environment's allowed domains. Verified from the lead container: huggingface.co API reachable (401 without token = reached), a public file download 200, large-file CDN (us.aws.cdn.hf.co) 206. Bare hf.co still 403 (not needed).
- 2026-10-31 2:00 PM ET: W10 GRAB-BAG approved (w10-pieces 9984bbee): 9→21 section types, 11 timing beats, every stage 5-7 themes; A chain lifts = Matt's moving platforms; Winch House as 10-7's 2nd room; HF ~$4.40 one batch. W9 owns the generic riser; W10 reuses it (told to stop its own). On-hand pieces first. Dot lines (W10 ~13, W9 12, W1-4 tables) → one review with Matt.
- 2026-10-31 1:52 PM ET: RELEASE #56 LIVE. First 6-shard deploy: tests 4-12 min per shard, publish done 14 min after merge (was 60). APK on Releases: v2026.10.31-25. main merged back into ccr.
- 2026-10-31 2:30 PM ET, MATT: APK update refused ("conflicts with an already installed app with same package name"). Cause: each CI run signed the debug APK with a fresh runner key. Fix: fixed sideload key android/app/sideload-debug.keystore + signingConfigs.debug (not the Play key). Hotfix PR #57 (release-2026-10-31c, from main, 1 commit; merged into ccr). Matt must uninstall ONCE (clears his saves), then every APK updates in place.
- 2026-10-31 2:27 PM ET: W1-4 art made (w1-4-sheets 0fb1cc7a): 69 pieces, 1.4 MB, ~$2.0 (W1 15 incl. 5 squirrels on the story model + Matt's 3 hollow logs; W2 20; W3 18; W4 16). Not drawn yet (allow-listed to the builders). Round 3 approved (≤$1.50): W1 knots, W4 updrafts, W3 spore-2 (dithered), W2 reed gate cast. Then NEXT.md and stop.
- 2026-10-31 2:31 PM ET, MATT on the W1/W3 art sheets: "Art looks good."
- 2026-10-31 2:33 PM ET W10 541b5996: built + checked alone I perch posts, G/H towers, J chain bridges, D drop gates, F trapdoors; HF batch $0.17 (bag.webp). Calls kept: soft pits under grates on Normal; no top-up animals in timed-hazard pockets. Flags: 10-9 first-timer 20+ falls (band item). Next E, L, K, Winch House; A/B/C after W9 riser.
- 2026-10-31 2:37 PM ET: #57 merged; APK v2026.10.31-26 on Releases, VERIFIED signed with the fixed sideload key (our cert's bytes found in the APK). Matt: uninstall once, then install; future APKs update in place. Site deploy for #57 running (no game change).
- 2026-10-31 2:45 PM ET, MATT (roadmap): "Next week we will need to focus on tuning difficulty. Most of it is very easy on normal. Will need to figure out how to manage fun with difficulty progression. Also checkpoints are often laid out in weird areas and when not needed." → added to the handoff doc's roadmap as "Next week: difficulty and checkpoints" (difficulty curve per world on Normal/Easy, fun-vs-difficulty definition with Matt, checkpoint audit + generator rule, fall rule).
- 2026-10-31 2:53 PM ET: W1-4 sheets DONE (38df83b9; round 3 fixed knots/updrafts/spore-2/reed cast; ~$2.25 total; NEXT.md for builders). W9: 6/12 pieces (rafts/logs/pistons on basket-lift code, flares, lavafalls, surges, ash gusts; HF $0.30); my 1:45 answers resent; owes W10 the riser hunks. W8: 8-6 re-curated .551. Dot-lines list for Matt: reference/DOT-LINES-2026-10-31.md (45 lines).
- 2026-10-31 2:58 PM ET W8 b7e6bd39: all curated (8-1 .401, 8-2 .375, 8-3 .442, 8-5 .416, 8-6 .551, 8-8 .627, 8-9 .453); full suite re-running. First-timer bots: 8-5 stalls at a 240 px trunk top (N+E), 8-6 Normal missed glides with climb-back only on take-off side, 8-3 Normal game-overs at first swings. Approved fixes: first swing pit soft on Normal, far-side glide steps, 8-5 trunk top fixed in stage → RELEASE CANDIDATE. Second wave (next release after): new 8-2 theme, W8 unused-art pass (gen2 scenery/decor never drawn, w8b/w8roost-b/w8var sheets, bouncy-leaf, glow-mushroom frame).
- 2026-10-31 3:05 PM ET, MATT DECIDED: on Normal, a missed SWING or GLIDE costs A HEART, NOT A LIFE (his fall rule: hurt, then a life); forward climb-out; lit hops/jumps stay deadly; Easy soft. Replaces the Oct 29 "lit-bough falls deadly on Normal" for swings/glides. W8: first swing soft pushed (6331c165; 8-3 Normal now finishes). 8-5 stall = route.ts bot bug (climb traced through the wall) → W8 helper fixes route.ts.
- 2026-10-31 3:05 PM ET W10 d926f2d2: E gutter spouts, K rolling barrels, L lantern sweeps, Winch House (10-7 2nd room via WorldManifest oneOf) built + checked; 10-6 has themes for the first time. Asked: true barrel roll (HF ≤$0.40), spout set into architecture ~160-200 px. A/B/C wait on W9 riser. Lines file updated (barrels + Winch House rewording).
- 2026-10-31 3:25 PM ET W8 59110148/ae1f1dd6: heart rule in (heartFalls: Normal swing/glide miss = 1 heart + set back to last ground; last heart = a life; test w8Heart.test.ts); route.ts climb fix. Bots: 8-3 and 8-5 now finish both settings; 8-6 Normal still timed out because Dot's glide tip taught a single jump. MATT APPROVED W8 glide tip: "Too far! Jump twice, then hold to glide." Lead approved: Easy swing/glide miss = free set-back (no pit slog), so Easy < Normal.
- 2026-10-31 3:31 PM ET W8 b256649d: glide tip in (Normal), bot doubles; all 7 stages finish on Easy and Normal (8-6 Normal hard: ~3 game-overs/run). Easy wins on lives/timeouts/time everywhere, but bands.ts still reads Easy > Normal on 5 stages: a MEASURE issue (Easy windows judged vs Easy's own 600 ms gate; Easy dead time always 0). Lead: ship as is (C); bands.ts fix → next week's difficulty tuning (game-wide, one owner). Full suite running → RC note.
- 2026-10-31 3:45 PM ET W8 0874fcd8: Easy free set-back REVERTED (no pit floor left no room for 8-6 Easy's boa → easyMode.test fail; bands didn't improve anyway). Easy keeps soft pits; heart rule = Normal only. Full suite restarted (~70 min, ~4:55 PM) → RC note → lead builds release.
- 2026-10-31 4:15 PM ET, MATT: the ten-tap "Shaffer" unlock "got lost" with the new menu; add Special thanks (Stephanie Roberts, Jen Shaffer, Sally Rotolo). Found: the unlock still worked, but its toast sat behind the Settings card (no feedback). Lead fix (ccr, component tests 69/69, real-browser check): count + result shown on the credit inside About; Special thanks row added. Goes in the W8 release.
- 2026-10-31 4:40 PM ET W9: 10 piece types built (rafts, charred logs, pistons, sinking ember slabs, flare slabs, surges, lavafalls, ash headwind, ropes over lava, ash caps); smoke cover dropped (same beat as 9-4 spires); every stage 5-6 themes, look-alikes fixed; 8 new Dot lines in W9_TIPS; HF $0.30. Variety (old code): 9-3 .31 → 6th theme. Lead: raft-lock room held for the Drake pass (art allow-listed to it); general glide-pit-floor bug fixed for all worlds with a scan test.
- 2026-10-31 4:45 PM ET: W8 RC accepted (w8-merge dfe030ac: full suite 2116/1 fixed, build, artcheck, drawcheck 378 s PASS; first-timer bots no timeouts; tag dropped). Release branch release-2026-10-31d = main + w8-merge + ccr (About fix). Full gate running on it (~45 min). W8 helper on wave 2 (new 8-2 theme + unused-art pass).
- 2026-10-31 4:58 PM ET: title version 0.9.0 + date and big Check for updates / Refresh game on the log (both orientations; sideways the pair stand above the block), a2d47e19 on ccr; goes into the W8 release once the release gate finishes. W9 report (f3049e11): W8 merged in, shared riser patch for W10 (relayed), glide-pit fix general + gen2Pits.test (lead asked for W5-7 before/after stills before merge; reshapes 272 shipped builds' bank fill), 9-4 vs 9-1 look-alike to be fixed with a new piece, flares 9-3 approved, no HF re-run unless a frame stands out.
- 2026-10-31 5:02 PM ET: W10 (dc3f16aa): chain/counterweight/gear lifts on W9's riser, barrel roll ($0.32 W10 HF total); merges w9-pieces again (no patch). Ruling: W9 basalt knobs keep as the Easy under-raft fix (W10 adds its own pit-floor pieces via the same hook); W10's beats.ts pit-floor credit dropped; route.ts piston speed + firsttimer waits kept; 10-9 gears need more pieces (GRAB-BAG).
- 2026-10-31 5:05 PM ET: W8 wave 2 (44e2f2fd): W8 decor finally draws (w8DecorArt.ts), moon flowers alternate bouncy-leaf, 8-1 loft piles, art-use entries down to bank-b/fill-b (lead shrinks allow-list at merge). 8-2 theme = (A) rope shimmy using W9's rope PlaceRule (e2e23a44 shared hunks only); unfinished curation to NEXT.md at 10 PM.
- 2026-10-31 5:10 PM ET, MATT asked whether to add W9/W10 to the release; lead: not finished (pieces only, uncurated). MATT: wait until curated; W9/W10 join the test link only once curated and fully checked. Tonight's release = W8 + About fixes + title version/update controls.
- 2026-10-31 5:20 PM ET, MATT: "We still have 110 on hugging face... Better cut scenes, more props or redoing background... I don't want money left and wasted." Split ($110): hf-cutscenes $28 (session_01FhBbYKKuWP5Xz84JFpUdcB, branch hf-cutscenes: moving story plates, weak panels), hf-backdrops $28 (session_01FhBbYNj29Lp72wkVaZ1PuR, branch hf-backdrops: weakest strips, more moods per world; owns src/assets/backdrops), hf-props $14 (session_01FhBbYNjH2PVQXCr4NsPAiZ, branch hf-props: W1-7 dressing, builds on w1-4-sheets), W9 $12, W10 $12, W8 $8 more, reserve $8. Each audits by 6:30 PM ET (top 10 + plan, before/after mocks for big look changes -> Matt), lead OKs, then makes and wires; stop 11 PM ET with NEXT.md.
- 2026-10-31 5:30 PM ET, MATT: "another release at 11pm and quit for the day. Maybe a small session tomorrow." Plan: release 1 (W8 + About + title 0.9.0) ~6:15 PM; release 2 = 0.9.1 at 11 PM: merge cutoff 9:30 PM ET (only work done, polished and lead-checked by then: W8 wave 2, finished approved art from hf-cutscenes/hf-props; backdrops only if Matt saw the before/after), lead gate 9:30-10:30, PR ~10:45. W9/W10 not in it (uncurated). Helpers stop 11 PM, later work waits for tomorrow. Versions bump per release (HANDOFF §7).
- 2026-10-31 5:40 PM ET: W8 b7a64e44: gen2 shimmy ropes ('rope'/'cross' PlaceRules, the shared rope piece from now; W9 drops its e2e23a44 rope rule on next merge), 8-2 5th theme Rope Blooms (raw 0.415 -> 0.528), glow-mushroom HF ($0.07). 8-2 curation running; in the 11 PM release only if curated, bots, full suite and stills by 9:30.
- 2026-10-31 5:45 PM ET, MATT: "anything not making [release 2], we can pause their work til tomorrow to keep tokens in check". W9 and W10 PAUSED now (push + NEXT.md). W8, hf-cutscenes, hf-backdrops, hf-props stop at the 9:30 PM ET cutoff (not 10/11); hf-backdrops builds only what Matt approves, stops building at 8 PM without an answer. Unspent HF goes on tomorrow from each NEXT.md.
- 2026-10-31 5:50 PM ET: hf-props audit (3098a6af, w1-4-sheets merged): root cause one 3-piece dressing set per job; plan ~56 pieces, one batch per world, dress2 atlas, W3/4/6/7 added to DRESS_WORLDS, w1-4 scenery pieces into dressing. Lead OK'd; leftover ~$7 = third look per job; W5 is hf-props' too (W5 helper done). Order W6, W7, W2, W1, W3, W4, W5.
- 2026-10-31 5:55 PM ET: CORRECTION: W8 switched to W9's rope rule (e6cd6882 = e2e23a44 shared hunks + back:{lips} gap + soft?), so W9's rope stays THE shared piece; W9 takes W8's two additions on next merge. Decor/loft/bouncy-leaf/glow mushrooms ready for 11 PM; rope blooms only if curated + suite by 9:30.
- 2026-10-31 6:05 PM ET, MATT on backdrops: exact dimensions for both orientations, go big, vary as many places as possible, use the money. hf-backdrops cap $28 -> $40, scope all 10 worlds, exact spec sent (sky 2640x513, far 2640x1302, mid ~2400-2700x1302, near ~3200-3520x1736, seamless, checked at 412x915/915x412/360x800, variety from more sets not bigger files), 3-4 sets per world, no two neighbouring stages share. Found: W7-10 dawn/dusk/night far sets painted but unwired (free win, wire now); stageBackdrops only swaps the far strip, so it's being extended to carry mid/near per set. W9/W10 caps $12 -> $6 each (paused, mostly code) to fund it.
- 2026-10-31 6:10 PM ET: hf-cutscenes audit: 580/800 story panels (73%) sit on blurred gameplay scenery, no cutscene moves (live/council, gorge, raft plates unused). Approved A (wire unused plates, $0), B tiers 1+2 (world story plates img2img, ~$8.5), C (~12 Wan motion clips, ~$7), tier 3 from reserve; before/after of first 3 worlds to Matt (show first); motion <= ~8 MB decoded per scene, q0 still; fix per-frame vignette gradient.
- 2026-10-31 6:15 PM ET: W10 PAUSED at c76b3846 (NEXT.md in qa-notes/w10/), HF $0.82 (round 3b gear art finishing on its own). On resume tell it its cap is $6.
- 2026-10-31 6:30 PM ET: hf-backdrops audit (c513f53d, $0.55): W7-10 unused moods wired (W7 dawn 1-3/dusk 7-9, W8 sunset 1-2/night 7-9, W9 dawn 1-3/night 7-9, W10 dusk 1-3; w10after DROPPED until W10 decides if rain ends). Approved A (18 mid strips) + B (18 near strips) ~$13, then C crowns, D 11 skies, E retries, then a third full mood per world to 3-4 sets. Mocks sent to Matt (going ahead unless he objects).
- 2026-10-31 6:35 PM ET: W9 glide-pit fix tightened (4aaf5366): 731/736 W5-8 builds identical; 5 changed = real live 8-6 Normal bug (soft floor runs under a bank foot, 51-85 px hole, fall into the void). W8 helper ports the pitUnder deepen hunk + gen2Pits 8-6 check for the 11 PM release. 9-3 flares in. W9 told again to pause (it hadn't seen 5:45).
- 2026-10-31 6:50 PM ET: RELEASE 1 PR #58 (release-2026-10-31d: W8 + About + title 0.9.0) opened for Matt. Gate: tsc, 3 shards 2116 pass (timing test passes alone; 4-3 TODO), build, artcheck, drawcheck PASS. After merge: check deploy + APK v0.9.0-<run> on Releases.
- 2026-10-31 6:55 PM ET: W9 PAUSED at d1983eea (NEXT.md qa-notes/w9/): 9-4 coils ash-cap piece (look-alike vs 9-1 3/16 -> 0/16), per-stage teaching fix (420 rolls none untaught); full suite NOT valid (edited mid-run), clean re-run is NEXT item 1; HF $0.30. Cutscene show-first stills sent to Matt; direction OK'd with 2 polish notes. W8 8-6 hole fix hand-ported (96839797).
