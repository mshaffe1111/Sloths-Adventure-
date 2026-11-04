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


### What the lead's own check of the code found (2026-10-30, headless Chromium, the control test upright at q1)

These are measured facts about our code. A desktop browser can't reproduce the Pixel's GPU, so the timings themselves aren't comparable.

- **The screen is painted 6.7 to 10.6 times over every frame, by `drawImage` alone** (visible pixels only; fills and gradients come on top). The biggest layers:
  - the soil tiles (`groundPaint.ts` 128-133), 1 to 3.2 screens where banks overlap;
  - a full-screen overlay stretched from a 54x112 image (`scenery.ts` 2893, 1 screen);
  - the three backdrop layers (about 2.5 screens);
  - a 160x160 haze (0.35 screens).
- **The main canvas draws everything with `imageSmoothingQuality = 'high'`** (`engine.ts` `resizeCanvas`). In Chrome that's bicubic when enlarging and mipmaps when shrinking, on every scaled draw, every frame. This breaks §2.8.
- **Gameplay sheets are plain `<img>` elements** (74 files use `new Image()`; 5 use `createImageBitmap`). Chrome may throw a decoded image away and decode it again in the middle of play.
- **The decoded art adds up to about 3.5 GB in total**, and the control test pulls sheets from every world.
- **Three sheets are taller than 4096 px**, the safe GPU texture limit (§2.7):
  - `queen-anim` 2048x8172;
  - `seamstress-anim` 2048x6664;
  - `soldier-anim` 2048x5721.
- **Five canvases are made with `willReadFrequently: true`** (CPU canvases), and four of them read pixels back with `getImageData`:
  - `protoArt.ts` 413 and 732;
  - `riverArt.ts` 320;
  - `heroTint.ts` 76;
  - `w4FallsArt.ts` 63.

  `scenery.ts` 1610 reads pixels back from a baked layer. Any of these drawn every frame stays on the CPU.
- **"Advanced" blend modes** (`multiply`, `overlay`, `soft-light`, `saturation`) are used in `w7SlideArt.ts`, `storyArt.ts`, `meecaArt.ts`, `scenery.ts` 1363, `w4Grit.ts`, `ropeArt.ts`, `polish.ts` and `bossFx.ts`. They're fine while baking, but expensive on a tile-based GPU (PowerVR) if they run every frame.

### Matt's Pixel, from its own `chrome://gpu` (2026-10-30, 12:25 AM ET)

- **The phone:**
  - Pixel 11 Pro XL running **Android 17 Developer Preview** (DP11.261002.005), a beta, so its GPU driver is beta too;
  - Chrome 157;
  - GPU: PowerVR C-Series CXTP-48-1536, Vulkan driver 1.693.3716.
- **Canvas, compositing and rasterization are all "Hardware accelerated"**, so this isn't a software fallback.
  - **"Multiple Raster Threads: Disabled".**
  - **Skia backend: GaneshVulkan.** Canvas 2D runs on Skia's older backend straight over the PowerVR Vulkan driver.
  - **Graphite is disabled on PowerVR** "due to rendering glitches" (crbug 496616828).
- **`GL_KHR_blend_equation_advanced` is disabled** by a Chrome workaround (crbug 661715). Every `multiply`, `overlay`, `soft-light`, `saturation` and similar blend has to be emulated with a copy of what's behind it, so §2.10 is confirmed on this phone.
- **Textures are limited to 8192 px.** `queen-anim` (8172) only just fits, and §2.7's 4096 still stands for older phones.
- **Edge on the same phone (`edge://gpu`, Edge 156) takes a different route:**
  - Skia backend **GaneshGL** with **Vulkan: Disabled**, so Edge draws through OpenGL, which ANGLE then translates onto the same PowerVR Vulkan driver: one extra layer on every draw.
  - Chrome draws on Vulkan directly (GaneshVulkan).
  - Edge has the same advanced-blend workaround, the same 8192 limit and the same Graphite block.
  - Measured: it makes no real difference (Chrome 26.5 fps, Edge 27.5, the same stalls). The stalls follow the snake and eagle sections in both browsers, so the cause is what we draw there, not the browser's route. Edge isn't slower; and the APK's WebView may take either route: check `chrome://gpu` inside the app (the WebView's own report) when testing the APK.
- **No GPU process crashes, and no software rendering.** The stalls are slow GPU work or decode/upload, as §6's third row says.

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

9. **Readbacks never touch a canvas that's drawn every frame.**
   - `getImageData`, `toDataURL` and `willReadFrequently: true` put a canvas on the CPU, and Chrome may keep it there.
   - After any bake that reads pixels, copy the result into a fresh canvas made without the hint (or into `createImageBitmap(canvas)`), and draw only the copy.
   - Never read back from the main canvas outside the debug timing (§6).
10. **Only cheap blend modes every frame.**
    - `source-over`, `lighter`, `screen`, `destination-*` and `source-atop` are "coefficient" modes the GPU blends for free.
    - `multiply`, `overlay`, `soft-light`, `hard-light`, `color-*`, `hue`, `saturation` and `luminosity` make the GPU copy what's behind them. On a tile-based GPU that can split the frame into several passes. Bake them.
11. **Clips:** rectangles only every frame. Curved or concave clips are slow on the GPU canvas; bake the clipped result instead.
12. **Images live as `ImageBitmap`s.**
    - Load each gameplay sheet with `createImageBitmap(await (await fetch(url)).blob())`. That decodes off the main thread and keeps the decoded copy alive, so Chrome can't throw it away and decode it again in the middle of play.
    - Stamp each new one once (a 1x1 draw in a corner) while the stage loads, so its GPU upload happens before play.
    - Release it with `.close()` when the world is left.
13. **The decoded art is budgeted.**
    - A sheet's cost is width x height x 4 bytes, however small the WebP file is.
    - Keep what one stage has loaded under about 300 MB.
    - Split any sheet over 4096 px on a side (three are over today: §0).

## 3. The rules for code (no hitches)

1. **No allocations in the frame loop.** No new arrays, objects, closures (`forEach` with an arrow inside the loop), strings or gradients per frame in hot paths. Reuse objects (pools) for particles, petals, dust and pop-ups. Garbage-collection pauses of 5-30 ms are the classic "it hitches every few seconds".
2. **A fixed-step update, so a slow frame never slows the game.**
   - Update in steps of exactly 1/30 s. A long frame runs up to 3 catch-up steps, and anything longer is dropped.
   - Today a 100 ms frame moves the game only 50 ms (the 0.05 s cap). That makes Pokey truly slower on a struggling phone, which is the "sluggish" feeling.
   - Each step stays the same small size, so nothing passes through walls.
   - At a steady 30 fps the game plays exactly as it does now.
   - Our update costs 0-2 ms, so the catch-up steps can't snowball.
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

- **Android display rate (the APK):**
  - pin the window to 60 Hz while playing (`WindowManager.LayoutParams.preferredDisplayModeId` / `preferredRefreshRate`), so the 30 fps lock lands on every second refresh and the phone saves power;
  - from Android 15, apps marked as games get 60 Hz by default;
  - check on the phone that it works inside the WebView.
- **Debug builds of the APK** turn on `webContentsDebuggingEnabled`, so Chrome's remote DevTools can trace the app. Store builds turn it off.
- **No WebGPU on PowerVR phones.** Chrome's WebGPU layer and PlayCanvas both work around or block this GPU family, and its drivers have known crashes. If we ever move off Canvas 2D, it's WebGL2.
- **Heat:** the Pixel 11's GPU slows after a few minutes of stress. Every measurement includes a 15-minute run, judged at minute 10 as well as at the start.

## 5. The phones every release is measured on

Measured with the control test (`#ctest`; QA reads it with `tools/playtesters/`) and the in-game frame check:

| Phone | GPU family | Why |
|---|---|---|
| Matt's Pixel 11 Pro Ultra, Chrome and the APK | Imagination PowerVR (Tensor) | where tonight's walls were; every Pixel from the 10 on |
| Matt's other Android (Chrome) | different GPU | the held-30 baseline |
| Matt's Samsung Galaxy | Mali or Adreno | most of the Android market (Matt has one, 2026-10-30) |
| An iPhone, Safari, Low Power Mode on and off | Apple | the iPhone testers (Kelsinator, Sally, Age) |
| Matt's older OnePlus | Adreno (likely) | the "older phone" floor a paid game must still run on (Matt, 2026-10-30) |

A stage passes only if it meets §1 on all of them in both orientations.

## 6. How a slow spot is hunted (PF-1's method)

1. **Find where:** the control-test stall lines give the x position and the update/draw split. Draw-bound plus the same x in different runs means scenery at that x.
2. **Find what, timed honestly.** Our JS timer can't see GPU time: Chrome records our calls and runs them on the GPU later, so a slow "draw" is often the GPU or a decode that the timer only catches when the frame flushes.
   - In the debug timing (test link only), force a flush after each layer group (`getImageData(0, 0, 1, 1)` on the main canvas, made with `willReadFrequently: false` stated outright), so each layer's time includes its GPU work.
   - Log it per layer: backdrop far/mid/near, ground, props, creatures, effects, HUD.
   - **Never judge speed or feel from a profiled run** (`gpuprof=1`). The flushes themselves wreck the frame rate: on Matt's Pixel, 2026-10-30, the same build ran 4-13 fps with it on and a steady 30 fps without it. Use it only in separate runs, labelled as profiled, for the ranking of the layers, not their milliseconds. The ctest link given to Matt for frame rate never carries it.
   - Then strip or swap one thing at a time (smoothing low vs high, `ImageBitmap` vs `<img>`, one layer off) and compare at the same spot.
3. **The tools on a real phone:**
   - **Chrome/Edge on Android:** `chrome://inspect` on a desktop with USB debugging, then the Performance panel on the device.
     - "Decode Image" under `drawImage` means a decode;
     - GC blocks mean garbage collection;
     - long script time means our code;
     - a long draw with little script inside it means the GPU.
   - **The phone's GPU state:** `chrome://gpu` (`edge://gpu`) shows "Canvas: Hardware accelerated" or "Software only", plus "Problems Detected".
   - **The APK:**
     - `adb shell dumpsys gfxinfo <package> framestats` shows the last 120 frames;
     - Android Performance Analyzer (Google's new profiler, Pixel 6 and later) records GPU counters and supports Imagination GPUs;
     - Perfetto system traces with the Chrome probe.
   - **iPhone:** Safari Web Inspector (Settings, Safari, Advanced) on a Mac, using the Timelines tab and its Frames view.

| Bound by | How it looks | Usual fix |
|---|---|---|
| Our code (CPU) | script time fills the frame | less work per frame, culling |
| GPU fill | better at a lower picture | less overdraw, cheaper blends |
| Decode / upload / CPU canvas | no better at a lower picture; tied to particular art | ImageBitmaps, pre-upload, no readbacks |
| Garbage collection | sawtooth memory; GC blocks at the hitches | no allocations per frame, pools |

Matt's Pixel fits the third row: the stalls didn't get better at q2 and sit at the same art every run.
4. **Fix it the §2 way:** bake it, swap a blur or filter for a sprite, cache the gradient, or cull it. Never by lowering the picture for everyone.
5. **Prove it:** the same spot on the same phone, before and after numbers, and a frame-time strip in the report.
6. **Guard it:** a test that fails if the per-frame path calls `shadowBlur`, `filter`, `create*Gradient`, an advanced blend mode or a readback (a headless check of the draw calls over a stage), so the slow paths can't creep back.

## 7. The bigger lever, if §2 isn't enough

Canvas 2D with baked layers can hold 30 fps for a game our size. If, after the §2 hunt, a flagship still can't hold q0, the next step is drawing the baked layers through WebGL (for example PixiJS, which batches sprites that share a texture into a few GPU calls). That's an engine change of days, not hours, so it's Matt's call, made with numbers in hand, never started on a hunch. A poorly built WebGL scene (many textures, per-frame uploads) can even be slower than Canvas, so §2's rules apply either way.

## 8. Keeping it fast while three groups keep adding art and code

The rules above say how to draw well; this section keeps them holding (Duet's second look, 2026-10-30, agreed by the lead).

1. **An automatic draw check on every gate (built 2026-10-30: `node tools/perf/drawcheck.mjs`, limits and allowlist in `tools/perf/limits.json`):** a headless run of the control test and one stage per world, with every canvas call counted per frame. It fails when the per-frame path:
   - creates gradients;
   - sets `shadowBlur` or `filter`;
   - uses an advanced blend;
   - reads pixels back;
   - draws onto a full-screen offscreen layer;
   - draws any sheet shrunk more than 2.5x at q0.

   It runs with the gate (`tools/inspect`), not only at deploy, so a helper finds out before reporting.
2. **An art size gate in the build and in the art packers (first rule built 2026-10-30: `node tools/perf/artcheck.mjs`; the other two are still to build):** fail on any of these:
   - a sheet over 4096 px on a side;
   - a creature clip sheet more than about 2x its on-screen size at q0;
   - a world whose decoded sheets add up to more than its budget (§2.13).

   This alone would have caught the eagle and the gold snake.
3. **One owner for the shared drawing files:** the lead.
   - Files: `engine.ts` render path, `creatureAnim.ts`, `atlasLoader.ts`, `hurtFlash.ts`, `gpuProf.ts`, `scenery.ts`, `groundPaint.ts`, `stageArt.ts`.
   - Helpers propose changes to these in their report and don't merge them themselves.
   - The lead's merge check (LEAD-PLAYBOOK §4) asks, for any drawing change: which §2 rules does it touch, and what are the draw check's numbers before and after.
4. **Every helper brief that adds art or creatures** (Worlds 7-10, bosses 6-10) carries this doc as a checklist, with §2 and §8.2 called out. Their creatures load through the same loaders, so they get the fixes for free and must not route around them.
5. **Tester frame data sorted by GPU.** The control test already records the GPU name next to the frame times (QA reads it), so QA reports stalls by GPU family (PowerVR, Mali, Adreno, Apple) and we can see whether only one family stalls.
6. **A frame-time baseline per stage.** Once the Pixel fixes are in, save the Pixel's control-test numbers (average, worst window, stall count, per layer) in `reference/perf-baseline.md`. QA compares each new test link's numbers against it, and a build that gets worse by more than 10% on any stage doesn't go to the testers.

   This doesn't mean asking Matt for numbers on every change. Matt's own control runs, and testers on other phones, supply the device numbers; the headless draw check covers each change in between.

7. **An automatic clip check on every gate (built 2026-11-01: `node tools/perf/clipcheck.mjs`, about 4 minutes; CONTINUOUS-IMPROVEMENT.md defect 4).** Pass/fail, like the draw check. It builds the game and opens every menu screen and pop-up (start screen, Settings and every tab, About and its pop-ups, How to Play, the World Map and every world, the Worlds pop-up, Pause, every Satchel tab and its pop-ups, every Journal page) at 412x915 and 915x412, on a fresh, an old (no play records) and a finished save, with the phone's safe-area insets set (upright 48 px top and 24 px bottom, sideways 48 px each side and 21 px bottom). Every scroll box is also judged scrolled to its end. It fails when:
   - text overflows its box (scrollWidth/scrollHeight past clientWidth/clientHeight, in a box that does not scroll);
   - text is cut off by an ancestor with overflow hidden, or runs off the side of the screen;
   - a tappable thing is under 44 px on a side;
   - a tappable thing sits inside the unsafe insets.

   Each breach prints with the screen, size, save, selector and text, and a contact sheet of the breaches (outlined, numbered) is written next to the results. `tools/perf/clipknown.json` holds the breaches on main when the check was built: they print as "known" and don't fail. The list only shrinks (LAWS.md law 5): an entry that no longer shows up fails the check until it is deleted, and `node tools/perf/knowncheck.mjs` fails if one is added. Each entry has a group and an owner. It runs in CI before every publish (`.github/workflows/gates.yml`); how to read a breach: `reference/methods/gates.md`. A new screen or pop-up gets a step in the check's walk in the same change that adds it.

## Where the evidence is thin

- Chrome's rule for moving a canvas to the CPU has changed over the years.
- Its decode-cache budget on Android isn't documented.
- No Canvas-2D bug specific to PowerVR has been found; the Pixel reports are about WebGL, WebGPU and compute.
- Edge vs Chrome on the same phone has never been compared.
- Whether a WebView can be held at 60 Hz needs testing on the phone.

So every fix is proven on Matt's Pixel with before-and-after numbers, not assumed from this list.

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
- [Chromium GPU driver bug list](https://chromium.googlesource.com/chromium/src/+/main/gpu/config/gpu_driver_bug_list.json)
- [Chromium issue 349853784: canvas moved to CPU after readbacks](https://issuetracker.google.com/issues/349853784)
- [willReadFrequently explained](https://www.schiener.io/2024-08-02/canvas-willreadfrequently)
- [Skia blend modes (coefficient vs advanced)](https://github.com/google/skia/blob/main/include/core/SkBlendMode.h)
- [Blink: imageSmoothingQuality](https://groups.google.com/a/chromium.org/g/blink-dev/c/PuXQBnfWRus/m/q6kXzSeYDQAJ)
- [Non-blocking image decode for canvas (PerfPlanet 2025)](https://calendar.perfplanet.com/2025/non-blocking-image-canvas/)
- [Image loading on the web (Castaño, 2026)](https://www.ludicon.com/castano/blog/2026/05/image-loading-on-the-web/)
- [Fix your timestep (Gaffer on Games)](https://gafferongames.com/post/fix_your_timestep/)
- [The spiral of death](https://www.gamedev.net/blogs/entry/2262574-thoughts-on-fix-your-timestep-and-the-spiral-of-death)
- [web.dev: a performance mystery (GC)](https://web.dev/articles/performance-mystery)
- [PowerVR: sorting objects on tile-based hardware](https://blog.imaginationtech.com/sorting-objects-and-geometry-on-powervr-hardware/)
- [PlayCanvas: WebGPU blocked on img-tec GPUs](https://github.com/playcanvas/engine/issues/8874)
- [Tensor G6 GPU tests (Android Authority)](https://www.androidauthority.com/tensor-g6-benchmarks-tests-3699714/)
- [Pixel 10 GPU and old drivers (Android Police)](https://www.androidpolice.com/google-pixel-10-gpu-struggles-might-stem-from-old-drivers/)
- [Android display refresh rate for games](https://developer.android.com/games/optimize/display-refresh-rate-change)
- [Android adaptive refresh rate](https://developer.android.com/develop/ui/views/animations/adaptive-refresh-rate)
- [Android Performance Analyzer](https://developer.android.com/android-performance-analyzer/run)
- [WebView accessibility lag (Capacitor discussion 3899)](https://github.com/ionic-team/capacitor/discussions/3899)
- [ADPF thermal best practices](https://developer.android.com/games/optimize/adpf/best-practices-adpf)
- [Safari canvas memory limit (PQINA)](https://www.pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/)
- [Safari GPU-process canvas regression (cordova-ios 1246)](https://github.com/apache/cordova-ios/issues/1246)
- [Construct: boosting mobile HTML5 games](https://www.construct.net/en/blogs/construct-official-blog-1/boosting-mobile-html5-game-791)
- [Construct: WebGPU vs WebGL on Pixel 7](https://github.com/Scirra/Construct-bugs/issues/7874)
- [Tensor G5 GPU benchmarks (Notebookcheck)](https://www.notebookcheck.net/Tensor-G5-Disappointing-CPU-performance-and-atrocious-GPU-numbers-in-Google-Pixel-10-Pro-XL-hands-on-benchmarks.1097374.0.html)
