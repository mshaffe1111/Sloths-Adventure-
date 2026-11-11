# Engine audit A (core runtime): PARTIAL, stopped by Matt's scope

Written 2026-11-11 3:59 PM ET. Base: t-int-1-1 @ fa5ad9d1 (main 181d2846 is its ancestor). Branch: t-audit-engine-a. No game code changed.
The lead stopped this audit at 5:00 PM ET (Matt narrowed it to gen2). Everything below is what was already found; nothing was added after the stop.

**What was read:** src/game/engine.ts lines 96-3440, 3928-4055, 4586-5310, 5546-5815, 5960-6300, 7220-7310, 7357-7611, 7700-7780, 7981-8145, 8377-8445
(the loop, update, physics, landing, water and pits, checkpoints, respawn, soft falls, the camera, the chase, the tide, thorn vines), plus
regrow.ts, chase.ts, cameraFollow.ts HUD_BAND, physics.ts constants, frameGovernor.ts constants, realPlay.ts.
**Not read (do not treat as clean):** engine.ts render (6300-6840), Meeca / slide / Dot's flight (6840-7180), lessonTick, the fight code, the kit host;
scenery.ts, terrain.ts, soil.ts; the save and input files. Three sub-auditors (draw, save, input) were stopped before they wrote findings; their
proof tests are on the branch, listed at the end as UNREVIEWED leads.

Proof tests: reference/audits/2026-11-11/tests-a/ (outside the suite's globs, so they cannot turn CI red). Run one with
`npx tsx --test reference/audits/2026-11-11/tests-a/<file>`. Every engine-*.test.ts fails today on purpose.

## Summary

| # | Sev | Status | What | Where | Fix size | Replace soon? |
|---|---|---|---|---|---|---|
| A-01 | S1 | CONFIRMED (test) | The frame loop simulates more game time than really passed: one late frame leaves a 30 fps phone at 1.5x speed and feeds the governor 50 ms | engine.ts:1284-1295 | S | no (R-3.1 keeps this loop) |
| A-07 | S2 | CONFIRMED (test) | 1-8 chase: a life lost to a snake respawns him twice and takes an extra heart | engine.ts:5238-5305, 7596-7611 | S | no |
| A-04 | S2 | CONFIRMED (test) | Two ground-jump paths; the buffered one ignores webs and spores and skips the landing effects | engine.ts:2241 vs 2469-2478 | S | no |
| A-05 | S2 | CONFIRMED (test) | The camera's "11 px a frame" cap is per update: 22 px in one drawn frame when a frame is late (sibling camera Critic owns it) | engine.ts:404, 5706-5712 | S | in flight on t-int-1-1 |
| A-03 | S2 | CONFIRMED (test), latent | A soft fall does not make crumbled platforms whole; only a lost life does | engine.ts:5180-5218 vs 5259-5265; regrow.ts:1-8 | S | no; goes live with R-150.5 |
| A-02 | S3 | CONFIRMED (test) | Jump height changes with frame time (92.3 to 101.0 px); every reach tool steps at 1/30 only | engine.ts:2284-2305, 1295; realPlay.ts:22 | M (same fix as A-01 if fixed steps) | no |
| A-06 | S3 | CONFIRMED (test) | A paused stage is redrawn every frame and a shake never settles behind the menu | engine.ts:1303, 1328, 6264, 1800 | S | no |
| A-08 | S3 | CONFIRMED (quotes) | Leftovers of removed fixes and comments that now lie | engine.ts:516-520, 526, 528-529, 1221, 1468 | S | no |
| A-09 | S3 | CONFIRMED (quotes) | A false Dot line is silenced by matching its English text, not its id; no test | engine.ts:915; gen2/worlds/w1.ts:672, 1218, 1222 | S | no |
| A-11 | S3 | CONFIRMED (quotes), cost unmeasured | Per-frame allocations in update, against PERFORMANCE-RULES §3.1 | engine.ts:2418, 2855, 5746, 8008, 8084-8137 | M | no |
| A-17 | S3 | CONFIRMED (quotes) | imageSmoothingQuality 'high' set for every draw, against PERFORMANCE-RULES §2.8 | engine.ts:1076 | S | wait for replacement (R-3.1 to R-3.7) |
| A-10 | S3 | SUSPECT | The engine's screen-space numbers ignore the safe-area inset the CSS adds (HUD band, Dot's banner slot) | cameraFollow.ts:194-199; engine.ts:3319; index.css:706, 736-745 | S | sibling camera Critic |
| A-12 | S3 | SUSPECT | The loop's catch hides a recurring update error unless 20 frames in a row fail | engine.ts:1350-1358 | S | no |
| A-14 | S3 | SUSPECT | State a respawn does not clear | engine.ts:5238-5305 | S | no |
| A-15 | S3 | SUSPECT | Gameplay numbers with no source | engine.ts:2516, 2717, 4660, 4671, 5720, 7236 | S | no |
| A-16 | S3 | SUSPECT | Rules keyed to one world or stage | engine.ts:849, 2289, 2525, 7708-7710 | S each | 849 is in flight (help ladder) |

Counts: 16 findings. S1: 1. S2: 4. S3: 11. CONFIRMED: 11 (7 by failing test, 4 by quoted lines). SUSPECT: 5.

## Findings

### A-01 (S1, CONFIRMED) The loop double-counts time after any late frame
- **Where:** engine.ts:1284-1295.
  `const elapsed = now - this.lastRenderTime;` ... `this.lastRenderTime = elapsed < this.frameIntervalMs + 2 ? now : now - (elapsed % this.frameIntervalMs);` ...
  `const steps = ... Math.min(3, Math.round(elapsed / this.frameIntervalMs)); const dt = Math.min(elapsed / steps / 1000, 0.05);`
- **What is wrong:** two fixes fight. The older line sets lastRenderTime BACK by the remainder to keep the 30 fps rhythm. The newer "up to three steps"
  fix (PERFORMANCE-RULES §3.2) simulates the whole `elapsed`. So the remainder is simulated now and counted again in the next frame's `elapsed`.
  On a phone whose frame takes 17 to 33 ms (it holds 30 fps but cannot run two frames one refresh apart), the remainder never drains: every later
  frame reads 50 ms while frames really arrive every 33.3 ms.
- **Failure:** one dropped refresh on such a phone, then a steady 30 fps: the game plays at 1.50x (enemies, vines, the tide, the chase all faster) until
  another odd late frame flips it back. The governor is fed 50 ms frames, so it steps the picture from q0 to q2 on a phone that is keeping up, and the
  control test's fps line under-reports. This fits the QA read of Matt's Pixel ("about 27.5 fps ... at q2 for nearly both runs", PERFORMANCE-RULES §0):
  that link is SUSPECT, the mechanism is proved.
- **Proof:** tests-a/engine-loop-time.test.ts (6 fail, 3 controls pass). Output:
  "after one 50 ms frame, 9 s of steady 33.3 ms frames played at 1.50x; the governor was fed 50.0 ms frames (real gap 33.3 ms); picture quality went q0 -> q2";
  60 Hz with 50 ms frames: 49.7% fast; frame work 36-60 ms: 32.9% fast; 48 Hz screen: 25.0% fast; 75 Hz: 10.0% fast; 60/90/120 Hz steady: exact.
- **Problem with which fix:** the three-step change (PERFORMANCE-RULES §3.2) layered on the phase-keeping line. §3.2 also says "steps of exactly 1/30 s"; the code steps 22 to 50 ms.
- **Root fix:** update in fixed 1/30 s steps from an accumulator fed by the true gap (now minus the last frame that ran), up to 3 steps, as §3.2 says;
  feed the governor and recorder the true gap. Size S. A test like the one above belongs in the suite.

### A-07 (S2, CONFIRMED) 1-8: a death to an animal during the chase respawns him twice
- **Where:** engine.ts:5238-5305 (respawnAtCheckpoint restarts the tide and the lantern, not the chase); 7596-7611 (only chaseCaught restores the branch and calls restartAt).
- **Failure:** Normal 1-8 has 5 snakes on the branch (4793, 9602, 12248, 18918, 25735). A snake takes his last heart with the collapse past his flag:
  he loses a life, appears at the flag, the next frame the chase "catches" him, takes a heart and respawns him again (two iris openings, two respawn sounds).
- **Proof:** tests-a/engine-chase-respawn.test.ts: "one death to a snake in the chase: 2 respawns, and he stands at the flag with 4 of 5 hearts".
- **Root fix:** respawnAtCheckpoint restarts every stage-run state in one place (chase: sections whole from the flag, restartAt), as it does the tide. Size S.

### A-04 (S2, CONFIRMED) The buffered jump is an older second jump path that missed the later fixes
- **Where:** engine.ts:2241 `p.vy = -PHYS.jumpV * drowsyJump(this.drowsy) * this.dragJump;` versus engine.ts:2471 `p.vy = -PHYS.jumpV;` (inside the landing block at 2469-2478,
  which then skips the else branch holding the bounce and the crumble timer, 2489-2503).
- **Failure:** double jump, press again just before landing in a 5-6 web: he leaves at the full 640 px/s instead of the web's 544 (about 108 px of rise instead of 78).
  The same in a spore cloud, where it also keeps the old flight's "awake" flag. A crumbling platform landed on with a buffered press never starts to crumble.
- **Proof:** tests-a/engine-buffered-jump.test.ts: "in a web (jump x0.85): pressed on the ground he leaves at -481 px/s, pressed just before landing at -640 px/s";
  "five buffered landings on a crumbling platform never started its crumble timer".
- **Root fix:** one take-off function for both paths; run the landing effects before a buffered jump leaves. Size S. (Defect log D21: spread a fix to its pair.)

### A-05 (S2, CONFIRMED) CAM_RISE_STEP is per update, not per drawn frame (sibling camera Critic owns this fix)
- **Where:** engine.ts:404 `const CAM_RISE_STEP = 11;`, used at 5706 and 5710 as a per-call step; the loop runs up to 3 updates before one draw (1294, 1303).
- **Failure:** on a late frame the view rises 22 or 33 px in one drawn frame: the snap INT-1-1 delta 2 says cannot happen ("never more than 11 px a frame").
- **Proof:** tests-a/engine-frame-rate.test.ts A-05: "with 67 ms frames (two updates a draw) the view rose 22.0 px in one drawn frame (the cap is 11)".
- **Root fix:** falls out of A-01's fixed steps only if the cap is written per second (330 px/s) and applied per drawn frame. Size S.

### A-03 (S2, CONFIRMED, latent) A soft fall leaves crumbled platforms broken
- **Where:** engine.ts:5259-5265 (respawnAtCheckpoint: "planks that crumbled since the checkpoint come back") has no twin in softFall (5180-5218), which is also what
  heartFall (7470-7475, 7486) and lanternSetBack (7493-7500) use. regrow.ts:3-5 still says "Crumbling platforms are never needed to finish a stage".
- **The contradiction:** CLAUDE.md stage rules (Matt, 11-02): crumbling may be required anywhere, pits included, and "a required one is whole again when he respawns".
- **Failure:** a required crumbling platform over a soft pit: it breaks, he is set back beside it, and it stays gone for 30 to 35 s and until it is 80 px off screen (regrow.ts:10-15, mayRegrow).
- **Reach today:** none found. A scan of all 200 stage builds (100 stages, Normal and Easy) found 14 Easy stages with soft falls and crumbling platforms; in each the fall under
  them ends in water (a life, so they are restored) or on a lower ledge. It goes live the day R-150.5 (blocked) or a soft-fall world lays a required crumble.
- **Proof:** tests-a/engine-softfall-crumble.test.ts: the control (lost life) passes, the soft-fall case fails.
- **Root fix:** one "set back" routine shared by respawn and soft fall that restores crumbled platforms; correct regrow.ts's header. Size S. Cross-area B: levelCheck still treats crumbling as never required.

### A-02 (S3, CONFIRMED) Jump height depends on frame time
- **Where:** engine.ts:2284-2305 (gravity added to vy, then the move, with the loop's variable dt); realPlay.ts:22 `export const DT = 1 / 30;` (every bot and reach test).
- **Proof:** tests-a/engine-frame-rate.test.ts A-02: held jump apex 101.0 px at 22 ms, 100.3 at 25 ms, 97.8 at 33 ms, 93.9 at 45 ms, 92.3 at 50 ms (spread 8.7 px).
  physics.ts:138 `JUMP_RISE = apex(PHYS.jumpV, PHYS.gravUp); // ~108` is 10 px over the real 30 fps jump and 15.5 px over a 20 fps phone's.
- **Failure:** none shown today: the 0.82 margin (rise1 = 88 px) and the 26 px lip hoist cover it. It eats the margin on slow phones, and no gate would see it shrink.
- **Root fix:** fixed 1/30 s steps (A-01). Size M with a re-run of the reach tests. Cross-area C: dotGuidePerch.ts:537-539 keeps its own JUMP_RISE = 190 and JUMP_RISE_1 = 110 beside physics.ts's 185 and 107.8.

### A-06 (S3, CONFIRMED) Paused, the scene is still drawn every frame and a shake never stops
- **Where:** engine.ts:1303 (updates skipped while paused) but 1328 `this.render();` runs regardless; 6264 `shakeOffset(this.camera.trauma, performance.now() / 1000, 16)`;
  trauma decays only in update (1800) and hitstop (1307).
- **The contradiction:** PERFORMANCE-RULES §3.5 "Nothing runs behind a menu (already true ...: the loop stops behind menus)".
- **Proof:** tests-a/engine-frame-rate.test.ts A-06: "2 s paused: the scene was drawn 60 times; trauma is still 0.6, so the picture sits at (0.3, 0.5) then (1.8, -0.9) half a second later".
- **Root fix:** while paused draw one still frame (shake zeroed) and skip render until resume or resize. Size S. Battery and heat on every pause, lesson card and help offer.

### A-08 (S3, CONFIRMED) Leftovers of removed fixes
- engine.ts:516-520 `STEP = 1 / 60` ("frames longer than this are cut into equal parts") and `acc`: STEP is never read, acc is only zeroed (1221). An old accumulator's remains, and its comment describes a loop that no longer exists.
- engine.ts:526 `lastPausedRender` is never read (an old paused-draw throttle; see A-06).
- engine.ts:528-529 "Only ever steps down" against 1341-1347, which steps the quality back up.
- engine.ts:1468 "Main Physics & Simulation Tick (30 FPS)" against the variable dt of 1295.
- Twelve `input.triggerHaptic(<ms>)` call sites with raw durations beside five `buzz(kind)` ones (haptics.ts): the named table did not replace the old path.
- Root fix: delete; size S.

### A-09 (S3, CONFIRMED) A false line silenced by its English text
- engine.ts:915 `if (h.text === 'No soft moss up here!') h.shown = true;` while the stage still lays the line by id: gen2/worlds/w1.ts:672, 1218, 1222 `'hint.1-1.noMoss'` (text in dotLinesData.ts:101).
- **Failure:** the copy is edited (the story keeper rewrites Dot's lines) and Dot says "no soft moss" on a stage where every fall is soft. No test names the line.
- **Root fix:** take the socket out of w1.ts's sections (new replaces old), or match by id. Size S. Cross-area B (w1.ts).

### A-11 (S3, CONFIRMED as rule breaches; cost not measured) Allocations every update
PERFORMANCE-RULES §3.1: "No new arrays, objects, closures ... per frame in hot paths."
- engine.ts:2418 `const floors = (...).filter((plat) => {...})`: a new array and closure over every platform, every update.
- engine.ts:2855 `this.proto.hints.filter(...)` every update on hand-built stages.
- engine.ts:8084-8137 stepW4 builds an object with 8 fresh closures every update on World 4. The kit's twin was fixed with a kept object (8148 `this.kitHostObj ??=`); the fix was not spread.
- engine.ts:8008 `{ ...p, swinging: p.isVineSwinging }` copies the whole player per thorn vine per update (World 3).
- engine.ts:5746 `this.vines.filter((v) => v !== sv)` every update while swinging.
- Root fix: reuse scratch arrays and a kept host object. Size M. A-01's slow phones run 2 or 3 updates a frame, so this is paid 2 or 3 times there.

### A-17 (S3, CONFIRMED) Smoothing set to 'high' for everything: wait for replacement
engine.ts:1075-1076 sets `imageSmoothingQuality = 'high'` on the one context after every resize; PERFORMANCE-RULES §2.8 says 'high' only where a picture is scaled down a lot.
The 2D draw path is being moved to PixiJS (R-3.1 to R-3.7): Matt's rule D40, do not patch.

### A-10 (S3, SUSPECT) Screen-space numbers that ignore the notch (sibling camera Critic)
- cameraFollow.ts:194-199 `HUD_BAND = { land: 112, port: 140 }`, "Measured 2026-10-26 ... (844 x 390) ... (400 x 720)" in a browser with no inset; index.css:706 `.game-hud { padding-top: max(6px, env(safe-area-inset-top)); }`.
  On a notched phone upright the HUD sits lower by the inset and the camera's band does not know.
- engine.ts:3319 `const slot = boss ? 64 : w <= 520 ? 132 : h <= 430 ? 110 : 96;` copies index.css:736-745, which adds `env(safe-area-inset-top)`.
- Not proved on a device. Root fix: read the inset once at resize and add it to both. Size S.

### A-12 (S3, SUSPECT) The loop's catch
engine.ts:1350-1358: an error in update or render is logged to the console (and the recorder only when it is on), and `failStreak` is reset by any good frame (1349). An error on every other frame
never ends the stage and is never reported; an update that throws part-way leaves that frame half-applied (moved, not yet landed). Not proved with a real throwing path.

### A-14 (S3, SUSPECT) State a respawn does not clear
respawnAtCheckpoint (5238-5305) does not reset jumpBufferTimer, coyoteTimer, atk / atkQueue, launched, camLandX / camLandY / camLookX, the ring fight (ring, ringDrops) or the watcher. Reasoned only.
The stopped input sub-auditor's tests-a/input-ghost-press.test.ts (2 fail, 1 control passes) points the same way for presses made during the 0.75 s beat; I have not reviewed it.

### A-15 (S3, SUSPECT) Numbers with no source
- engine.ts:2516 `g.y > prev.y + 100 && g.width < 400`: tuned to one red-team case (F10, gen2 1-1 Roll A Easy).
- engine.ts:4660, 4671 stomp bounces `-430`, `-700`, `-620`, `-460`: outside PHYS, so no reach tool knows them.
- engine.ts:7236 ring ids `9500 + n * 10 + k`: collide if a wave ever has more than 10 animals.
- engine.ts:2717 `e.homeY ?? 310`; 5720 `(this.mc ? 600 : 0)`.

### A-16 (S3, SUSPECT) Rules keyed to one world or stage
- engine.ts:2289 `worldIndex === 9 && ventLift(...)`: a geyser lifts a glide only in World 9.
- engine.ts:2525 mud splash only when `worldIndex === 1`.
- engine.ts:7708-7710 the watcher's voice and hiding rule by `worldIndex === 3` / `=== 4`.
- engine.ts:849 the help ladder by `config.id === '1-1'` (deliberate and in flight: INT-1-1).
No failure shown; each is a patch that should be data on the stage.

## Checked and found clean (so nobody re-checks)
- No stage has ground, flags or pickups past the exit-door clamp (engine.ts:2315-2318), and no quota stage approaches its sealed door from the right (scan of all 100 stages on Normal).
- Landing cannot tunnel at any dt: engine.ts:2442 catches any drop from above (no upper bound on the fall).
- Difficulty cannot change mid-stage: PauseMenu's ModeChip only displays it.
- generateStage hands each engine a fresh stage (the `ahead` cache is one-shot, stageGenerator.ts:2851-2857). Read, not tested.

## UNREVIEWED leads: the stopped sub-auditors' tests (run once at the stop; I have not checked that each failure is a real defect)
24 of 26 fail today (`npx tsx --test reference/audits/2026-11-11/tests-a/{draw,save,input}-*.test.ts`):
- input-loop-clock.test.ts (5 fail, 1 control): the same root as A-01, with a worse trigger: a stage started or resumed 8 ms off a refresh on a perfect 60 Hz phone.
- input-ghost-press.test.ts (2 fail): a flick or tap during the life-lost beat acts at the flag.
- input-held-thumb-at-start.test.ts (2 fail): a thumb already held under the title card.
- draw-paused-redraw.test.ts (2 fail): the same as A-06. draw-boss-9-10-gradients.test.ts (1 fail): gradients a frame in the 9-10 fight.
- save-continue-double-count, save-flag-resume (2), save-full-game-refused (2), save-hydrate-and-summary (3), save-load-not-atomic, save-meeca-tips-never-kept, save-newgame-leaks (2): all fail. save-engine.ts is their harness.
A later session should read each test's header and confirm before acting on it.

## Not done
The ranked write-up of the draw path, save/load and input; the REPORT.json; the critic turnover note. Stopped by scope.
