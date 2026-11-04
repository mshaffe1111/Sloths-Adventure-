/**
 * The GPU layer (GPU-RENDERER-PLAN.md stage 0, R-3.1, 2026-11-04): one WebGL 2 canvas under the game's 2D canvas, drawn by PixiJS
 * (pinned in package.json), moved by the same camera and drawn by the same 30 fps loop as the 2D canvas (engine.ts render, resizeCanvas).
 *
 * Stage 0 moves nothing onto it: the 2D canvas is opaque and covers it, so the picture is the same as before. Later stages put whole
 * layers into `world` (the backdrop, then the ground, then the creatures), and the 2D canvas carries only what is above them.
 *
 *  - WebGL 2 only. The context is made here with getContext('webgl2') and handed to Pixi, so Pixi never falls back to WebGL 1; a phone
 *    without WebGL 2 keeps the 2D canvas alone, as before. Never WebGPU (PERFORMANCE-RULES §4: PowerVR): only Pixi's WebGL renderer is
 *    loaded, never its auto-detect.
 *  - Pixi is loaded on its own (a separate chunk, `import()`), once, for the whole app, and only when something is first put on the
 *    layer (mountGpuLayer): until then the layer costs nothing at all, not even its start-up.
 *  - A lost context (the phone took the GPU back) draws nothing and costs nothing until the browser gives it back; Pixi rebuilds its
 *    GPU objects then (its GlContextSystem), and the layer draws again. The 2D game never waits on it.
 *  - Nothing to draw: no GPU work at all. The loop still hands it the camera every frame; it renders, shows its canvas and holds a
 *    full-size drawing buffer only while `world` holds something visible. An empty full-screen WebGL layer would still be cleared and
 *    composited every frame, and its buffer (about 10 MB at q0) held.
 */
import type { Container, Rectangle, Sprite, Texture, WebGLRenderer } from 'pixi.js';

/** what the layer needs of the camera each frame: the same translate and scale the 2D canvas draws the world with (CSS px) */
export interface GpuCam {
  /** -snapCam(camera.x) + shake, world units */
  tx: number;
  ty: number;
  /** world units to CSS px */
  zoom: number;
}

/** the world container's place for a camera: the 2D canvas does scale(zoom) then translate(tx, ty), so a world point p lands at (p + t) * zoom */
export function worldPlace(c: GpuCam): { x: number; y: number; s: number } {
  return { x: c.tx * c.zoom, y: c.ty * c.zoom, s: c.zoom };
}

/** the context attributes the layer asks for: see-through (the 2D canvas is over it), no antialias (sprites), no preserved buffer */
export const GL_ATTRS: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  powerPreference: 'default',
};

/** a WebGL 2 context on `cv`, or null (no WebGL 2: the layer is not used). Never a WebGL 1 or WebGPU one */
export function makeGl2(cv: HTMLCanvasElement, get = (c: HTMLCanvasElement) => c.getContext('webgl2', GL_ATTRS)): WebGL2RenderingContext | null {
  try {
    const gl = get(cv);
    return gl && !gl.isContextLost() ? gl : null;
  } catch {
    return null;
  }
}

interface Live {
  renderer: WebGLRenderer;
  stage: Container;
  world: Container;
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
}

let live: Live | null = null;
/** Pixi's classes the backdrop needs, kept once the layer starts (only the WebGL side of Pixi is ever loaded) */
let P: { Sprite: typeof Sprite; Texture: typeof Texture; Rectangle: typeof Rectangle; Container: typeof Container } | null = null;
let starting: Promise<Live | null> | null = null;
let cssW = 0;
let cssH = 0;
let dprNow = 1;
let lost = false;
let shown = false;
/** frames drawn and frames skipped (nothing to draw, or the context lost): for the checks */
export const gpuStats = { drawn: 0, idle: 0, lostFrames: 0, losses: 0, restores: 0 };

/** the canvas the layer goes on (App.tsx: the one under the game's), told once the page has it; nothing is started by this */
let home: HTMLCanvasElement | null = null;
export function setGpuCanvas(canvas: HTMLCanvasElement | null) {
  if (canvas) home = canvas;
}

/**
 * Start the layer on `canvas` (by default the one setGpuCanvas was given), once: the WebGL 2 context, Pixi loaded and set up. Resolves
 * with whether it is running (false: no WebGL 2, or Pixi failed to start: the game draws on the 2D canvas alone, as before). Safe to call
 * again. Only called by what puts something on the layer (gpuProbe now; from stage 1, under the title card): starting it costs 400-650 ms
 * of main thread with 100-240 ms long tasks here, and with nothing to draw that bought nothing. Started on every stage launch, it slowed
 * clipcheck's parallel walks until the World Map missed its 10 s wait (3 of 3; 2 of 2 green without it: warmup-5m, 2026-11-04).
 */
export function mountGpuLayer(canvas: HTMLCanvasElement | null = home): Promise<boolean> {
  if (live) return Promise.resolve(true);
  if (!canvas || typeof document === 'undefined') return Promise.resolve(false);
  if (!starting) {
    starting = (async () => {
      const gl = makeGl2(canvas);
      if (!gl) return null;
      try {
        const pixi = await import('pixi.js');
        const { WebGLRenderer, Container } = pixi;
        P = { Sprite: pixi.Sprite, Texture: pixi.Texture, Rectangle: pixi.Rectangle, Container };
        const renderer = new WebGLRenderer();
        await renderer.init({
          canvas,
          context: gl,
          // (1x1 until it has something to draw, and always resolution 1: everything on it is in device pixels, fitBuffer)
          width: 1,
          height: 1,
          resolution: 1,
          autoDensity: false,
          backgroundAlpha: 0,
          clearBeforeRender: true,
          antialias: false,
          hello: false,
        });
        const stage = new Container();
        const world = new Container();
        stage.addChild(world);
        canvas.addEventListener('webglcontextlost', () => {
          lost = true;
          gpuStats.losses++;
        });
        canvas.addEventListener('webglcontextrestored', () => {
          lost = false;
          gpuStats.restores++;
        });
        canvas.style.visibility = 'hidden';
        return { renderer, stage, world, gl, canvas };
      } catch (err) {
        console.warn('GPU layer did not start; the game draws on the 2D canvas alone', err);
        return null;
      }
    })();
  }
  return starting.then((l) => {
    live = l;
    if (l) resizeGpuLayer(cssW, cssH, dprNow);
    return !!l;
  });
}

/** the game's canvas took a new size (engine.ts resizeCanvas): the layer matches it, CSS size and device pixel ratio */
export function resizeGpuLayer(w: number, h: number, dpr: number) {
  cssW = w;
  cssH = h;
  dprNow = dpr;
  if (!live || lost || w <= 0 || h <= 0) return;
  // (while it has nothing to draw its drawing buffer stays 1x1: a full-screen one is about 10 MB the phone holds for nothing)
  if (!shown && !bd.on) return;
  // (in device pixels, at resolution 1: the game canvas is floor(css * dpr) device px, engine.ts resizeCanvas. Pixi's own resolution
  // handling rounded one px over at q1 and, after a quality step, kept drawing at the old scale (warmup-5m, 11-04): so the layer never
  // uses it, and everything on it is placed in device pixels)
  fitBuffer(Math.floor(w * dpr), Math.floor(h * dpr));
}

/** the layer's drawing buffer made exactly `w` x `h` device px, at resolution 1 */
function fitBuffer(w: number, h: number) {
  if (!live) return;
  const r = live.renderer;
  if (r.resolution !== 1) r.resolution = 1;
  if (live.canvas.width !== w || live.canvas.height !== h || r.screen.width !== w || r.screen.height !== h) r.resize(w, h, 1);
}

/** the world container (stage 1 on: the layers that move here); null when the layer is not running */
export function gpuWorld(): Container | null {
  return live?.world ?? null;
}

/** whether the layer is running (WebGL 2, Pixi started, the context not lost) */
export function gpuLive(): boolean {
  return !!live && !lost;
}

/** whether anything in the world is there to draw */
function hasContent(world: Container): boolean {
  for (const c of world.children) if (c.visible && c.renderable && c.alpha > 0) return true;
  return false;
}

/**
 * One frame of the layer, drawn by the game's loop right after the 2D canvas (engine.ts): the world moved to the camera, then rendered,
 * when there is anything to render. Never throws into the loop.
 */
export function drawGpuFrame(tx: number, ty: number, zoom: number) {
  if (!live) return;
  if (lost || live.gl.isContextLost()) {
    gpuStats.lostFrames++;
    return;
  }
  const { world, stage, renderer, canvas } = live;
  // (worldPlace, written out, in device pixels: no object a frame)
  const k = zoom * (dprNow || 1);
  world.position.set(tx * k, ty * k);
  world.scale.set(k);
  const any = hasContent(world);
  if (any !== shown) {
    shown = any;
    canvas.style.visibility = any ? 'visible' : 'hidden';
    // (the full-size drawing buffer only while it draws; back to 1x1 when it empties)
    if (any) resizeGpuLayer(cssW, cssH, dprNow);
    else if (!bd.on) {
      renderer.resize(1, 1, 1);
    }
  }
  if (!any) {
    gpuStats.idle++;
    return;
  }
  try {
    renderer.render(stage);
    gpuStats.drawn++;
  } catch (err) {
    gpuStats.idle++;
    console.warn('GPU layer frame failed', err);
  }
}

/**
 * Checks only (dev builds: App.tsx window.__gpu): a solid box on the layer at a world rectangle, to prove the camera moves the layer as it
 * moves the 2D canvas. `null` takes it off.
 */
export async function gpuProbe(box: { x: number; y: number; w: number; h: number; color?: number } | null): Promise<boolean> {
  // (putting something on the layer is what starts it)
  if (!live && (!box || !(await mountGpuLayer()))) return false;
  if (!live) return false;
  const { Graphics } = await import('pixi.js');
  for (const c of [...live.world.children]) if (c.label === 'probe') c.destroy();
  if (!box) return true;
  const g = new Graphics();
  g.label = 'probe';
  g.rect(box.x, box.y, box.w, box.h).fill(box.color ?? 0xff00ff);
  live.world.addChild(g);
  return true;
}

// ───────────────────────────── stage 1: the backdrop, drawn underneath and copied in ─────────────────────────────
/*
 * GPU-RENDERER-PLAN stage 1 (R-3.2, 2026-11-04). The painted backdrop strips (scenery.ts, the fitted copies drawFitted stamps) are drawn
 * by the GPU into this layer's canvas, which is then copied into the game's 2D canvas with ONE drawImage at the point where the strips
 * used to be stamped. The 2D canvas stays opaque and everything after the copy (the world, every glow and blend, 5-M's night grade)
 * blends with real backdrop pixels, exactly as before. The plan's first idea, the 2D canvas made see-through over this layer, changes how
 * every additive glow and multiply grade looks (they would blend with nothing): measured and rejected 2026-11-04 (webgl.md).
 *
 * The copy is a GPU-to-GPU blit only while the 2D canvas is on the GPU. A 2D canvas on the CPU (old phones, a software fallback) would
 * read the GL pixels back every frame, which blocks the call: the copy's own time is watched, and over COPY_SLOW_MS (median of the
 * first frames) the backdrop goes back to the 2D canvas for good (backdropGpuOff). Same while the context is lost.
 */
/** a copy slower than this (ms, the median of its first COPY_PROBE frames) is a readback: the 2D canvas draws the backdrop itself */
export const COPY_SLOW_MS = 2;
/** copies timed before it decides: the frames drawn under the title card (stageReady.ts), so a slow phone never plays a slow frame */
const COPY_PROBE = 3;

interface Backdrop {
  /** used this frame (between begin and flush) */
  on: boolean;
  /** given up for this session: the reason */
  off: string;
  root: Container | null;
  pool: Sprite[];
  used: number;
  /** a texture per fitted canvas, uploaded under the title card (stampSceneryFits) */
  tex: Map<HTMLCanvasElement, Texture>;
  copyMs: number[];
}
const bd: Backdrop = { on: false, off: '', root: null, pool: [], used: 0, tex: new Map(), copyMs: [] };
export const backdropStats = { frames: 0, sprites: 0, copies: 0, fallbacks: 0 };

/** whether this frame's strips can go to the GPU (the layer running, not lost, not given up on) */
export function backdropGpuReady(): boolean {
  return !!live && !lost && (!bd.off || backdropCheck.keepGpu) && !backdropCheck.force2d && !!P && !live.gl.isContextLost();
}
/**
 * checks only (dev builds: window.__gpu): `force2d` draws the backdrop on the 2D canvas, to compare the two (tools/qa/gpuLook.cjs);
 * `keepGpu` keeps the GPU path even where the copy is a readback (this container: its 2D canvas is software), to judge the look there
 */
export const backdropCheck = { force2d: urlForces2d(), keepGpu: false };
/** `?gpuback=0` in the address: the backdrop on the 2D canvas, to compare a phone's frame times both ways (as `?preload=0` does) */
function urlForces2d(): boolean {
  try {
    return typeof location !== 'undefined' && /[?&]gpuback=0\b/.test(location.search);
  } catch {
    return false;
  }
}
/** one line for the frame-time readout (perfLog): where the backdrop is drawn, and what its copy costs */
export function backdropLine(): string {
  if (backdropCheck.force2d) return 'backdrop: 2D (?gpuback=0)';
  if (!live) return 'backdrop: 2D (no WebGL 2 layer)';
  if (bd.off) return `backdrop: 2D (${bd.off})`;
  const m = bd.copyMs.length ? [...bd.copyMs].sort((a, b) => a - b)[bd.copyMs.length >> 1] : NaN;
  return `backdrop: GPU, copy ${Number.isFinite(m) ? m.toFixed(2) : '?'} ms (median of ${bd.copyMs.length})`;
}
/** why the backdrop is back on the 2D canvas for this session ('' while it is not) */
export function backdropGpuOff(): string {
  return bd.off;
}

function texFor(cv: HTMLCanvasElement): Texture {
  let t = bd.tex.get(cv);
  if (!t) {
    t = P!.Texture.from(cv);
    bd.tex.set(cv, t);
  }
  return t;
}

/** a fitted canvas is let go (scenery.ts makeFit, a lost fit): its texture too */
export function backdropForget(cv: HTMLCanvasElement) {
  const t = bd.tex.get(cv);
  if (!t) return;
  bd.tex.delete(cv);
  t.destroy(true);
}

/** each fitted canvas handed to the GPU now (under the title card), so no upload lands on a frame of play */
export function backdropUpload(canvases: readonly HTMLCanvasElement[]): number {
  if (!backdropGpuReady()) return 0;
  let n = 0;
  for (const cv of canvases) {
    if (!cv.width) continue;
    try {
      live!.renderer.texture.initSource(texFor(cv).source);
      n++;
    } catch {
      /* uploaded on its first draw instead */
    }
  }
  return n;
}

/**
 * The frame's strips start, for the game canvas `target`: none pushed yet. The layer's buffer is made exactly the target's size (a quality
 * step resizes the game canvas at the start of the next frame: engine.ts resizeDue), so the copy lands pixel for pixel.
 */
export function backdropBegin(target: HTMLCanvasElement): boolean {
  if (!backdropGpuReady()) return false;
  if (!bd.root) bd.root = new P!.Container();
  bd.on = true;
  fitBuffer(target.width, target.height);
  bd.used = 0;
  return true;
}

/**
 * One stamp of a fitted canvas, as drawFitted would draw it on the 2D canvas, in DEVICE pixels: source rectangle (sx, sy, sw, sh) of `cv`
 * to (dx, dy, dw, dh), at `alpha`. No object is made per frame once the pool has grown.
 */
export function backdropPush(cv: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, alpha: number) {
  const tex = texFor(cv);
  let sp = bd.pool[bd.used];
  if (!sp) {
    // (dynamic: a sprite only hears that its texture's frame changed when the texture says it is dynamic; without it every pooled sprite
    // kept the size of the first stamp it drew, and the backdrop came out scaled after a quality step: warmup-5m, 11-04)
    sp = new P!.Sprite(new P!.Texture({ source: tex.source, frame: new P!.Rectangle(0, 0, 1, 1), dynamic: true }));
    bd.pool.push(sp);
    bd.root!.addChild(sp);
  }
  bd.used++;
  const t = sp.texture;
  if (t.source !== tex.source) t.source = tex.source;
  t.frame.x = sx;
  t.frame.y = sy;
  t.frame.width = sw;
  t.frame.height = sh;
  t.update();
  // (stamped 1:1 on whole device pixels in gameplay: nearest gives the very pixels the 2D canvas stamps; a resized stamp, an older fit
  // while the new one is made, is smoothed as the 2D canvas smooths it)
  tex.source.scaleMode = Math.abs(dw - sw) < 1e-6 && Math.abs(dh - sh) < 1e-6 ? 'nearest' : 'linear';
  // (the layer works in device pixels: fitBuffer)
  sp.visible = true;
  sp.alpha = alpha;
  sp.position.set(dx, dy);
  sp.scale.set(dw / sw, dh / sh);
}

/**
 * The frame's strips are all pushed: render them and copy the layer into `ctx` (the game canvas) at whole device pixels. False when it
 * could not (the caller then stamps the strips on the 2D canvas itself, this frame).
 */
export function backdropFlush(ctx: CanvasRenderingContext2D): boolean {
  if (!bd.on || !live || !bd.root) return false;
  for (let i = bd.used; i < bd.pool.length; i++) bd.pool[i].visible = false;
  try {
    live.renderer.render(bd.root);
    const t0 = performance.now();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(live.canvas, 0, 0);
    ctx.restore();
    const ms = performance.now() - t0;
    backdropStats.frames++;
    backdropStats.sprites += bd.used;
    backdropStats.copies++;
    if (bd.copyMs.length < COPY_PROBE) {
      bd.copyMs.push(ms);
      if (bd.copyMs.length === COPY_PROBE) {
        const m = [...bd.copyMs].sort((a, b) => a - b)[COPY_PROBE >> 1];
        if (m > COPY_SLOW_MS) bd.off = `copy ${m.toFixed(1)} ms (a readback: the 2D canvas is not on the GPU)`;
      }
    }
    return true;
  } catch (err) {
    backdropStats.fallbacks++;
    bd.off = `copy failed: ${String(err).slice(0, 80)}`;
    return false;
  }
}

/** the backdrop is drawn on the 2D canvas again (a stage with no painted strips, a menu): the layer goes back to 1x1 */
export function backdropIdle() {
  if (!bd.on) return;
  bd.on = false;
  if (live && !shown) live.renderer.resize(1, 1, 1);
}

/** checks only: the layer's sizes, to compare with the game canvas (tools/qa) */
export function gpuSizes() {
  return live ? { css: [cssW, cssH], dpr: dprNow, res: live.renderer.resolution, buf: [live.canvas.width, live.canvas.height], screen: [live.renderer.screen.width, live.renderer.screen.height], bdOn: bd.on } : null;
}
