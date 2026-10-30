# Performance rules: silky smooth on every phone

Matt (2026-10-30): "really nail it down so that we don't keep hitting these walls and we can run silky smooth. Because as soon as somebody tries to play this and they test it and the frame rate's crap, they're going to think it's junk."

Read this before building or changing anything that draws: stages, props, creatures, effects, backdrops, menus, story scenes. A change that breaks the budget in §1 isn't done, however good it looks. Researched 2026-10-30 (sources at the bottom) and checked against our own engine the same night.

## 0. Where we stand (2026-10-30)

- **The engine:** one Canvas 2D (not WebGL), `alpha: false` (good), the loop locked at 30 fps (good: it matches iOS Low Power Mode, which caps animation at 30 anyway, and saves battery).
  - The picture is drawn at up to 2x the CSS size (q0), then 1.5x (q1), then 1x (q2); the frame governor (`frameGovernor.ts`) steps down when frames average over 40 ms.
- **Matt's Pixel 11 Pro Ultra (Tensor, Imagination PowerVR GPU), Edge, upright** (QA read of 20261029-2344-8nh2):
  - about 27.5 fps on average, at q2 (the lowest picture) for nearly both runs;
  - 31 stalls of 100-167 ms, every one of them the game's own DRAW (update 0-2 ms, draw 95-113 ms);
  - the stalls sit at the same two stretches of the control-test course in both runs;
  - his other Android (Chrome) held 30.

  So this phone isn't slow: one or more of our draw calls hits a slow path on the PowerVR driver. The Tensor G5's PowerVR GPU had known driver problems at launch that later updates eased, so this may get better on its own, but we can't count on that. The APK runs in Android WebView on the same GPU, so this is very likely Matt's sluggish APK too.
- **What the code uses, counted in `src` (not tests):**
  - 466 `createLinearGradient`/`createRadialGradient`;
  - 437 `globalAlpha`;
  - 137 `globalCompositeOperation`;
  - 35 `shadowBlur`;
  - 12 `ctx.filter`;
  - 747 `save()`;
  - 321 `drawImage`.

  Many run only while baking, but any of them that runs every frame is a suspect.

## 1. The budget

- 30 fps means **33 ms per frame, all in**. Our own update plus draw must fit in **12 ms on a mid-range phone at q0**. That leaves room for the browser, the compositor, garbage collection and a busy or warm phone.
- **No single frame over 50 ms** in normal play (stage start and the first second after a sheet loads excepted, up to 120 ms).
- **The picture stays at q0** on a 2023-or-newer phone for a whole stage. If the governor has to step down on a flagship, that's a bug to fix, not the governor doing its job.
- **Never under 20 fps.** Below 20, `dt` hits its 0.05 s cap and Pokey truly runs slower (`engine.ts` loop). That's the "sluggish" feeling.
- Memory stays flat through a stage (QA saw 28 MB, good). No growth from stage to stage.

## 2. The rules for drawing (most important first)

1. **Bake, don't redraw.** Anything that doesn't change from frame to frame (ground, soil, plants, props, backdrop layers, a creature's body parts, glows, signs) is drawn ONCE into an offscreen canvas or image when the stage starts, then stamped with one `drawImage` per frame. This is the single biggest win in every source and in our own PF-1b work.
2. **No `shadowBlur` and no `ctx.filter` in the per-frame path.** They're among the most expensive things Canvas can do, and they're exactly the kind of call a GPU driver falls off a cliff on.
   - A glow or soft shadow is a pre-blurred sprite (painted, or baked once with the blur), drawn with `globalAlpha`.
   - A tint or flash is a pre-tinted copy (as `hurtFlash.ts` already does instead of `filter: brightness`).
   - `filter` and `shadowBlur` are allowed only while baking.
3. **No gradients created per frame.** `createLinearGradient`/`createRadialGradient` build a new object and a new shader every call.
   - A gradient that never changes is made once and kept.
   - A sky or water gradient is baked into the strip.
   - A moving glow is a baked sprite.
4. **Few state changes.**
   - Group draws that share a composite mode or alpha.
   - Avoid a `save()`/`restore()` pair around a single shape.
   - `globalCompositeOperation` other than `source-over` (screen, lighter, multiply, overlay) forces the GPU to read back what's under it: use it only on small areas, or bake the result.
5. **Draw only what's on screen.** Skip anything whose box is outside the camera (with a margin). Don't draw a whole tall backdrop when only a slice shows.
6. **Big images at their drawn size.** A source image several times larger than its drawn size wastes the GPU's time every frame. Keep a picture's pixels near what it covers on screen at q0 (2x CSS).
7. **Sprite sheets (atlases), not hundreds of small files.** Fewer textures means less switching. Any single texture stays at or under 4096 px on its longer side (the safe GPU limit on older iPhones and Androids).
8. **Image smoothing:** `imageSmoothingQuality = 'high'` costs more on every scaled draw. Use 'high' only where a picture is scaled down a lot; use the default ('low') for anything drawn near its own size.

## 3. The rules for code (no hitches)

1. **No allocations in the frame loop.** No new arrays, objects, closures (`forEach` with an arrow inside the loop), strings or gradients per frame in hot paths. Reuse objects (pools) for particles, petals, dust and pop-ups. Garbage-collection pauses of 5-30 ms are the classic "it hitches every few seconds".
2. **Time-based movement, capped.** Movement uses the real `dt`, capped at 0.05 s (as now). The fix for slow phones is making frames cheaper, never raising the cap; raising it would make Pokey jump through things.
3. **Load before play, not during.** Every sheet, sound and backdrop a stage needs is decoded before its first frame (`stagePreload.ts`), so nothing decodes mid-run (the 232 ms first-frame stall after `hud-atlas` breaks this).
4. **Text is baked.** The HUD numbers, Dot's bubble and the cards are drawn to a small canvas when they change, not re-measured and re-drawn every frame.
5. **Nothing runs behind a menu** (already true since the memory work: the loop stops behind menus). Nothing keeps the screen or CPU awake when the app is in the background.

## 4. Settings and platform notes

- **All phones:**
  - keep the 30 fps lock and `alpha: false`;
  - keep the picture at most 2x (a 3x phone at full 3x is 2.25 times the pixels for little visible gain).
- **iPhone (Safari and the iOS app if we ever do one):**
  - Low Power Mode caps animation at 30 fps (our lock already matches it);
  - a hot or busy phone also slows animation down;
  - Safari limits total canvas memory, so release canvases we no longer need (already done: `zeroCanvas`);
  - test with Low Power Mode both on and off.
- **Android browsers and the APK (Android WebView, Capacitor):**
  - the WebView draws on the GPU (hardware acceleration is on by default; never turn it off in the manifest);
  - WebView builds vary by phone, so the APK is tested on at least two GPU makers;
  - turn off accessibility services while measuring (they can slow WebView), then test once with them on.
- **High-refresh screens (90 and 120 Hz):** the 30 fps cap skips frames evenly (every 3rd or 4th), which is fine. Never assume 60 Hz.

## 5. The phones every release is measured on

Measured with the control test (`#ctest`; QA reads it with `tools/playtesters/`) and the in-game frame check:

| Phone | GPU family | Why |
|---|---|---|
| Matt's Pixel 11 Pro Ultra, Chrome and the APK | Imagination PowerVR (Tensor) | where tonight's walls were; every Pixel from the 10 on |
| Matt's other Android (Chrome) | different GPU | the held-30 baseline |
| A Samsung Galaxy (Exynos/Snapdragon) | Mali or Adreno | most of the Android market |
| An iPhone, Safari, Low Power Mode on and off | Apple | the iPhone testers (Kelsinator, Sally, Age) |
| One three-to-four-year-old mid-range Android | any | the "cheap phone" floor a paid game must still run on |

A stage passes only if it meets §1 on all of them in both orientations.

## 6. How a slow spot is hunted (PF-1's method)

1. **Find where:** the control-test stall lines give the x position and the update/draw split. Draw-bound plus the same x in different runs means scenery at that x.
2. **Find what:** turn the frame-time check on (`perf` menu switch) and log draw time per layer (backdrop far/mid/near, ground, props, creatures, effects, HUD) at that x. Strip layers one at a time until the time drops.
3. **Fix it the §2 way:** bake it, swap a blur or filter for a sprite, cache the gradient, or cull it. Never by lowering the picture for everyone.
4. **Prove it:** the same spot on the same phone, before and after numbers, and a frame-time strip in the report.
5. **Guard it:** a test that fails if the per-frame path calls `shadowBlur`, `filter` or `create*Gradient` (a headless check of the draw calls over a stage), so the slow paths can't creep back.

## 7. The bigger lever, if §2 isn't enough

Canvas 2D with baked layers can hold 30 fps for a game our size. If, after the §2 hunt, a flagship still can't hold q0, the next step is drawing the baked layers through WebGL (for example PixiJS, which batches sprites that share a texture into a few GPU calls). That's an engine change of days, not hours, so it's Matt's call, made with numbers in hand, never started on a hunch. A poorly built WebGL scene (many textures, per-frame uploads) can even be slower than Canvas, so §2's rules apply either way.

## Sources

- [Construct: performance tips for mobile games](https://construct.net/en/tutorials/performance-tips-mobile-games-163)
- [Increase the performance of your games using canvas (GitNation talk)](https://gitnation.com/contents/increase-the-performance-of-your-games-using-canvas)
- [Canvas performance tips (gist)](https://gist.github.com/easylogic/38114c071e8d3f2fa191)
- [Myths and realities of canvas performance (html5gamedevs)](https://www.html5gamedevs.com/topic/7735-myths-and-realities-of-canvas-javascript-performance)
- [Canvas shadow attributes and their cost](https://essential-books.onrender.com/essential/htmlcanvas/shadowcolor-shadowblur-shadowoffsetx-shadowoffsety-path-styling-attributes-ac46104d7d584c9abc0714146c4e9653.html)
- [A game's shadowBlur performance patch (devlog)](https://zapjackson.itch.io/cy-gerber-cyber-burglar/devlog/158533/performance-patch)
- [Mozilla bug 1978851 (canvas filter cost)](https://bugzilla.mozilla.org/show_bug.cgi?id=1978851)
- [Phaser CE issue 356 (WebGL vs Canvas on phones, draw calls)](https://github.com/phaserjs/phaser-ce/issues/356)
- [JS game rendering benchmark](https://github.com/Shirajuki/js-game-rendering-benchmark)
- [PixiJS for fast 2D on the web](https://abratabia.com/pixijs/)
- [WebKit bug 215745: rAF at 30 fps in iOS Low Power Mode](https://bugs.webkit.org/show_bug.cgi?id=215745)
- [When browsers throttle requestAnimationFrame](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe)
- [Fixing GC stutter on mobile Safari](https://bugnet.io/blog/how-to-fix-web-game-stutter-from-garbage-collection-on-mobile-safari)
- [Web game memory management and pooling](https://www.abratabia.com/web-game-performance/memory-management.php)
- [Animation performance in Capacitor apps](https://capgo.app/blog/ultimate-guide-to-animation-performance-in-capacitor-apps/)
- [Pixel 10 GPU driver updates (TechRadar)](https://www.techradar.com/phones/google-pixel-phones/google-promises-pixel-10-owners-that-more-gpu-updates-are-on-the-way)
- [Tensor G5 GPU benchmarks (Notebookcheck)](https://www.notebookcheck.net/Tensor-G5-Disappointing-CPU-performance-and-atrocious-GPU-numbers-in-Google-Pixel-10-Pro-XL-hands-on-benchmarks.1097374.0.html)
