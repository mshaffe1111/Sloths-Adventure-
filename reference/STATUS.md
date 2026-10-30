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
