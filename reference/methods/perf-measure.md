# Method: measuring performance (frame times, first frames, quality steps)
Last proven: 2026-11-01, branch warmup-5m (efa3f4ef). It produced the first-frame fix (1-1 and 8-1: a 1.2-1.6 s frozen first frame down
to 100-200 ms), the quality-step fix (the governor's step 117-183 ms down to 50-100 ms), and the proof that the leftover 100-ms frames
are the container. Owner of the last update: warmup-5m helper.

## When to use it
Any change that should make play smoother: stage start, sheet loading/baking, the frame governor, anything that draws. Also any
"is this hitch the game or the machine?" question. It doesn't replace a real phone: it ranks causes and proves a before/after in the
same container.

## Steps (exact: tools, commands, settings, sizes)
1. **Two production builds side by side**, never the dev server, for frame times:
   ```
   git stash   # or check out the before commit
   npx vite build && cp -r dist /tmp/dist-before
   npx vite preview --outDir /tmp/dist-before --port 4501 --host 127.0.0.1 --strictPort &
   # the same for the after build on 4502
   ```
2. **Frame times of the first 10 s of play:** `node tools/perf/firstframes.cjs http://127.0.0.1:4501/ <stage> 448x998 1 3`
   - What it does: a fresh browser profile per run, one untimed load (so sheets come from the cache: it measures decode and upload, not
     the network), all world stories marked seen, then `?autostart=1&level=<stage>&layout=1`.
   - It walks right with a hop every second and logs every rAF gap from `sloth-stage-live` (ScreenVeil's event; only the first counts:
     it can fire twice).
   - It prints JSON per run: `loadMs` (opened to live), avg, p95, max, frames over 50 and over 100, first-2-s worst, `stepWin` (worst
     frame 3.4-6 s in, where the governor steps), `early` (0.3-3.4 s), and `big` (every gap over 100 ms with its time).
   - Run 3 per stage per build, at least one stage from W1, W5 (5-M) and W8.
3. **Find what a bad frame is:** `node tools/perf/frameprof.cjs http://127.0.0.1:4303/ <stage>` against the **dev server** (readable
   function names), then `python3 tools/perf/frameprof.py 0 1300`.
   - It is a CPU profile at 0.5 ms samples. A 4 ms busy marker at the live moment lines the profile up with the frame log.
   - Read TOTAL for the call chain, SELF for where the time lands.
   - `restore`/`drawImage` self time under one draw function is the browser rasterizing or uploading that draw's source, not our JS.
4. **Find which draw paints a pixel** (for "what is that thing on screen?"): the `who` mode of the room script pattern.
   - Wrap `CanvasRenderingContext2D.prototype.drawImage` for one `engine.render()`.
   - Keep the calls whose destination rectangle (through `getTransform().inverse()`) covers the CSS point.
   - Print the source (src rect for an `<img>`, size for a canvas) and the stack.
   - Then match the src rect in the `*AtlasData.ts` files. That found the World 5 kit trunk sliver in 5 minutes.
5. **Game or container?** `node tools/perf/warmreplay.cjs http://127.0.0.1:4303/ <stage>` plays the stage cold, then again in the same
   page forced to q0 (everything decoded, uploaded and baked).
   - A frame over 100 ms in the warm play too means the container's raster, not a first draw.
   - Log the quality per frame (`engine.quality`) with each gap: a hitch that lands on a quality change is the governor, not art.
6. **A quality step on demand:** `node tools/perf/qstep.cjs http://127.0.0.1:4303/ <stage> [prof]` steps down by hand 2.4 s in and
   prints the worst frame in the 0.45 s after the step and in the second before. Run it 4 times; single runs are noise.
7. **Write the table** (format below) with every run's number, not just the best, plus the medians of the load times.

## The bar (what "done" looks like)
- The before/after table, one row per stage and build, every run listed:

  | Stage | Build | Worst frame | First 2 s worst | >100 ms frames | Avg frame | Load (open to stage live) |
  |---|---|---|---|---|---|---|
  | 1-1 | before | 1367, 1233, 1183 | 1367, 1233, 1183 | 3, 3, 4 | 30.5, 30.9, 29.4 | 5376, 4424, 4804 (median 4804) |
  | 1-1 | after | 167, 117, 217 | 83, 100, 100 | 1, 2, 1 | 25.9, 24.4, 26.8 | 4316, 4966, 4745 (median 4745) |

- The added load time, stated as medians, with a plain sentence about whether a player would see it.
- Every frame still over 100 ms is explained: profiled, or shown to be the container by the warm replay.

## Checks before reporting
- The same stage, the same size (448x998 at dpr 2), the same build mode, and nothing else running. A test run in parallel adds
  30-100 ms to frames.
- Never time anything while the gate is running on the same working tree; the gate also reads files you are editing.
- `gpuprof`-style flushes or profiling runs are for ranking causes only, never for the numbers in the table (PERFORMANCE-RULES §6.2).

## Pitfalls we already paid for
- 2026-11-01: **CPU throttling swamps this container.**
  - 6x ran at about 500 ms a frame and 4x at 220-310 ms a frame in every build, so frame pacing was meaningless.
  - At 4x the stage start also ran past stageReady's 6.5 s deadline, which skipped deadline-bound warm-up and made the "after" look
    like the "before".
  - Use 1x: this container (4 cores, software GPU raster) already runs the game at 23-34 ms a frame, old-phone class. Quote 4x only as
    supporting evidence.
- 2026-11-01: **Software raster (SwiftShader).** Headless Chromium has no phone GPU, so ordinary q0 frames here are 67-117 ms on
  5-M and 1-1, warm or cold. A sub-50-ms bar can't be shown in this container for those stages; show that the frame no longer stands
  out from the ordinary frames, and leave the absolute number to the phone.
- 2026-11-01: **The frame governor steps down here at about 4 s** (GOV_WARMUP_MS), because headless frames are over 40 ms. Its step
  shows up as a hitch at ~4 s in every stage. Don't mistake it for a late sheet: log the quality per frame.
- 2026-11-01: **A warm replay must force q0.** The second play starts at the quality the governor learned (often q2), which makes
  it look fast for the wrong reason.
- 2026-11-01: **The live event can fire twice.** Count only the first, or two rAF loops interleave their gaps.
- 2026-11-01: **A world's story plays before the stage on autostart.** Set `sloth_story_{w,m,g,n}<1..11>` = '1' in localStorage
  first, or the stage never goes live.
- 2026-11-01: **Production has no `window.__engine` or `__play`.** Anything that pokes the engine (qstep, warmreplay, frameprof, room
  stills) runs on the dev server; frame-time tables come from production builds.

## Tried and didn't work
- CPU throttle 4x/6x for the frame-time table (above).
- Judging a quality step on the dev server against a 50 ms bar: dev frames at steady q0 are already 50-83 ms here.
- The first warm-up guarded by the ready deadline (`left() > -1000`): on a slow start it skipped exactly where it was needed.

## To try
- An in-browser GPU-timed run (a real Chrome with GPU via `chromium.launch({ args: ['--use-gl=angle'] })` on a machine with a GPU) to
  get absolute numbers closer to a phone.
- Recording `chrome://tracing` "Decode Image" and "GPU" slices headless, to tell an upload from a raster without a profile.
