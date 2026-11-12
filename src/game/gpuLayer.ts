/**
 * The GPU layer (GPU-RENDERER-PLAN.md stage 0, R-3.1): one WebGL 2 canvas under the game's 2D canvas, drawn by PixiJS (pinned in
 * package.json), moved by the same camera and driven by the same 30 fps loop as the 2D canvas (engine.ts: the loop, resizeCanvas).
 *
 * Stage 0 moves nothing onto it: the 2D canvas is opaque and covers it, so the picture is the same as before. A later stage either puts
 * whole layers into `gpuWorld()` (shown under the 2D canvas), or renders its own container into this canvas and copies it into the 2D
 * canvas with one drawImage (gpuPixi(), gpuCanvas(), gpuFitBuffer(): the 2D canvas is never made see-through, reference/methods/webgl.md).
 *
 *  - WebGL 2 only. The context is made here with getContext('webgl2') and handed to Pixi, so Pixi never falls back to WebGL 1. Never
 *    WebGPU (PERFORMANCE-RULES §4: PowerVR): only Pixi's WebGL renderer is loaded, never its auto-detect.
 *  - Pixi is loaded on its own (a separate file, `import()`), once, for the whole app, and only when something is first put on the
 *    layer (mountGpuLayer): until then the layer costs nothing at all, not even its start-up. The service worker caches that file with
 *    the rest of the app, so it is there offline.
 *  - THE FALLBACK. Whenever the layer cannot run, the game draws on the 2D canvas alone, as it always has, for the rest of the session,
 *    and gpuFallback() says why: no WebGL 2 on this phone, Pixi did not start, or the context was lost and did not come back (or was
 *    lost again). Whoever puts things on the layer asks gpuLive() each frame and listens with onGpuChange().
 *  - A lost context (the phone took the GPU back) draws nothing and costs nothing until the browser gives it back; Pixi rebuilds its own
 *    GPU objects then (its GlContextSystem), and the layer draws again. The 2D game never waits on it.
 *  - Nothing to draw: no GPU work at all. The loop still hands it the camera every frame; it renders, shows its canvas and holds a
 *    full-size drawing buffer only while `world` holds something visible (or a copy layer has asked for the buffer: gpuKeepBuffer).
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

// ───────────────────────────── losing the context: stand down, come back once, or give up for the session ─────────────────────────────
/** the reasons the layer is off for the session (gpuFallback) */
export const FALLBACK = {
  noGl2: 'no WebGL 2',
  pixi: 'Pixi failed',
  notRestored: 'context lost and not restored',
  lostAgain: 'context lost again',
} as const;
/** a lost context that is not given back within this long (ms) is not waited for: the session goes on with the 2D canvas alone */
export const RESTORE_WAIT_MS = 4000;
/** the layer comes back from this many losses in a session; one more and it is off (a GPU that keeps taking the context back) */
export const MAX_RESTORES = 1;

export interface LossState {
  /** the context is lost right now */
  lost: boolean;
  losses: number;
  restores: number;
  /** '' while the layer may run; else why it is off for the session */
  fallback: string;
}
export type LossEvent = 'lost' | 'restored' | 'timeout';
/**
 * The layer's state after a context event. 'lost': it stands down (and is off for good once it has already come back MAX_RESTORES
 * times); 'restored': it runs again; 'timeout' (RESTORE_WAIT_MS after a loss): still lost means off for the session. Once off, nothing
 * turns it back on.
 */
export function lossStep(s: LossState, ev: LossEvent): LossState {
  if (s.fallback) return s;
  if (ev === 'lost') {
    if (s.lost) return s;
    const losses = s.losses + 1;
    return { ...s, lost: true, losses, fallback: losses > MAX_RESTORES ? FALLBACK.lostAgain : '' };
  }
  if (ev === 'restored') return s.lost ? { ...s, lost: false, restores: s.restores + 1 } : s;
  return s.lost ? { ...s, fallback: FALLBACK.notRestored } : s;
}

interface Live {
  renderer: WebGLRenderer;
  stage: Container;
  world: Container;
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
}
/** Pixi's classes a layer's owner needs, and the renderer (gpuPixi) */
export interface GpuPixi {
  Sprite: typeof Sprite;
  Texture: typeof Texture;
  Rectangle: typeof Rectangle;
  Container: typeof Container;
  renderer: WebGLRenderer;
}

let live: Live | null = null;
let P: GpuPixi | null = null;
let starting: Promise<Live | null> | null = null;
let cssW = 0;
let cssH = 0;
let dprNow = 1;
let loss: LossState = { lost: false, losses: 0, restores: 0, fallback: '' };
let lossTimer: ReturnType<typeof setTimeout> | null = null;
let shown = false;
/** a copy layer is using the drawing buffer (gpuKeepBuffer): it stays full-size though `world` is empty */
let kept = false;
/** frames drawn and frames skipped (nothing to draw, or the context lost): for the checks */
export const gpuStats = { drawn: 0, idle: 0, lostFrames: 0, losses: 0, restores: 0 };

/** what happened to the layer: it started, lost its context, got it back, or is off for the session */
export type GpuChange = 'live' | 'lost' | 'restored' | 'fallback';
const listeners = new Set<(what: GpuChange) => void>();
/**
 * Told when the layer starts, loses its context, gets it back, or goes off for the session. A layer's owner drops what it holds on the
 * GPU at 'lost' and 'fallback' (its textures are gone with the context) and uploads again at 'restored'. Returns the way to stop
 * listening.
 */
export function onGpuChange(cb: (what: GpuChange) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function tell(what: GpuChange) {
  for (const cb of [...listeners]) {
    try {
      cb(what);
    } catch (err) {
      console.warn('GPU layer listener failed', err);
    }
  }
}

/** why the layer is off for this session ('' while it is not: running, or not started yet) */
export function gpuFallback(): string {
  return loss.fallback;
}

/** the layer goes off for the session: hidden, its buffer let go, its owners told. The 2D canvas draws everything, as before */
function fallBack(reason: string) {
  loss = { ...loss, fallback: reason };
  if (lossTimer) clearTimeout(lossTimer);
  lossTimer = null;
  const l = live;
  live = null;
  P = null;
  shown = false;
  kept = false;
  if (l) {
    l.canvas.style.visibility = 'hidden';
    try {
      // (its GPU objects go; the canvas itself stays in the page, React's)
      l.renderer.destroy(false);
    } catch {
      /* a renderer whose context is gone may not tear down cleanly: nothing is drawn with it again either way */
    }
    try {
      l.canvas.width = l.canvas.height = 1;
    } catch {
      /* the canvas is the page's */
    }
  }
  console.warn(`GPU layer off for this session (${reason}); the game draws on the 2D canvas alone`);
  tell('fallback');
}

function onLossEvent(ev: LossEvent) {
  const was = loss;
  loss = lossStep(loss, ev);
  if (loss === was) return;
  gpuStats.losses = loss.losses;
  gpuStats.restores = loss.restores;
  if (lossTimer) clearTimeout(lossTimer);
  lossTimer = null;
  if (loss.fallback) {
    // (a second loss: its owners hear 'lost' first, so they drop their textures the same way every time)
    if (ev === 'lost') tell('lost');
    fallBack(loss.fallback);
    return;
  }
  if (ev === 'lost') {
    // (a canvas with no context shows nothing: hidden until the layer next has something to draw)
    shown = false;
    if (live) live.canvas.style.visibility = 'hidden';
    lossTimer = setTimeout(() => onLossEvent('timeout'), RESTORE_WAIT_MS);
    tell('lost');
  } else if (ev === 'restored') {
    // (Pixi has rebuilt its own objects by now: its listener was added first; the buffer takes the game's size again when next used)
    tell('restored');
  }
}

/** the canvas the layer goes on (App.tsx: the one under the game's), told once the page has it; nothing is started by this */
let home: HTMLCanvasElement | null = null;
export function setGpuCanvas(canvas: HTMLCanvasElement | null) {
  if (canvas) home = canvas;
}

/**
 * Start the layer on `canvas` (by default the one setGpuCanvas was given), once: the WebGL 2 context, Pixi loaded and set up. Resolves
 * with whether it is running (false: no WebGL 2, Pixi failed to start, or it is off for the session: the game draws on the 2D canvas
 * alone, as before). Safe to call again. Only called by what puts something on the layer, and under the title card: starting it costs
 * 400-650 ms of main thread with 100-240 ms long tasks, and with nothing to draw that bought nothing. Started on every stage launch, it
 * slowed clipcheck's parallel walks until the World Map missed its 10 s wait (warmup-5m, 2026-11-04).
 */
export function mountGpuLayer(canvas: HTMLCanvasElement | null = home): Promise<boolean> {
  if (loss.fallback) return Promise.resolve(false);
  if (live) return Promise.resolve(true);
  if (!canvas || typeof document === 'undefined') return Promise.resolve(false);
  if (!starting) {
    starting = (async () => {
      const gl = makeGl2(canvas);
      if (!gl) {
        fallBack(FALLBACK.noGl2);
        return null;
      }
      try {
        const pixi = await import('./gpuPixi.ts');
        const renderer = new pixi.WebGLRenderer();
        await renderer.init({
          canvas,
          context: gl,
          // (1x1 until it has something to draw, and always resolution 1: everything on it is in device pixels, gpuFitBuffer)
          width: 1,
          height: 1,
          resolution: 1,
          autoDensity: false,
          backgroundAlpha: 0,
          clearBeforeRender: true,
          antialias: false,
          hello: false,
        });
        const stage = new pixi.Container();
        const world = new pixi.Container();
        stage.addChild(world);
        // (after Pixi's own listeners, added in init: at 'restored' its GPU objects are already rebuilt)
        canvas.addEventListener('webglcontextlost', () => onLossEvent('lost'));
        canvas.addEventListener('webglcontextrestored', () => onLossEvent('restored'));
        canvas.style.visibility = 'hidden';
        P = { Sprite: pixi.Sprite, Texture: pixi.Texture, Rectangle: pixi.Rectangle, Container: pixi.Container, renderer };
        return { renderer, stage, world, gl, canvas };
      } catch (err) {
        console.warn('GPU layer did not start', err);
        fallBack(FALLBACK.pixi);
        return null;
      }
    })();
  }
  return starting.then((l) => {
    if (loss.fallback) return false;
    const first = !live && !!l;
    live = l;
    if (l) resizeGpuLayer(cssW, cssH, dprNow);
    if (first) tell('live');
    return !!l;
  });
}

/** the game's canvas took a new size (engine.ts resizeCanvas): the layer matches it, CSS size and device pixel ratio */
export function resizeGpuLayer(w: number, h: number, dpr: number) {
  cssW = w;
  cssH = h;
  dprNow = dpr;
  if (!live || loss.lost || w <= 0 || h <= 0) return;
  // (while it has nothing to draw its drawing buffer stays 1x1: a full-screen one is about 10 MB the phone holds for nothing)
  if (!shown && !kept) return;
  // (in device pixels, at resolution 1: the game canvas is floor(css * dpr) device px, engine.ts resizeCanvas. Pixi's own resolution
  // handling rounded one px over at q1 and, after a quality step, kept drawing at the old scale (warmup-5m, 11-04): so the layer never
  // uses it, and everything on it is placed in device pixels)
  gpuFitBuffer(Math.floor(w * dpr), Math.floor(h * dpr));
}

/** the layer's drawing buffer made exactly `w` x `h` device px, at resolution 1 (a copy layer hands it the game canvas's own size) */
export function gpuFitBuffer(w: number, h: number) {
  if (!live || loss.lost) return;
  const r = live.renderer;
  if (r.resolution !== 1) r.resolution = 1;
  if (live.canvas.width !== w || live.canvas.height !== h || r.screen.width !== w || r.screen.height !== h) r.resize(w, h, 1);
}

/**
 * A copy layer (one that renders its own container into the layer's canvas and copies it into the 2D canvas) says it is using the
 * drawing buffer, or has stopped: while it is, the buffer keeps the size it was given though `world` is empty; when it stops, the
 * buffer drops back to 1x1.
 */
export function gpuKeepBuffer(on: boolean) {
  if (kept === on) return;
  kept = on;
  if (!on && live && !loss.lost && !shown) live.renderer.resize(1, 1, 1);
}

/** the world container (the layers that are shown under the 2D canvas go here); null when the layer is not running */
export function gpuWorld(): Container | null {
  return live?.world ?? null;
}

/** whether the layer is running (WebGL 2, Pixi started, the context not lost, not off for the session) */
export function gpuLive(): boolean {
  return !!live && !loss.lost && !loss.fallback;
}

/** Pixi's classes and the renderer, for a layer's owner; null whenever the layer is not running (ask each frame, never keep it) */
export function gpuPixi(): GpuPixi | null {
  return gpuLive() ? P : null;
}

/** the layer's canvas (what a copy layer hands to the 2D canvas's drawImage); null whenever the layer is not running */
export function gpuCanvas(): HTMLCanvasElement | null {
  return gpuLive() ? live!.canvas : null;
}

/** whether anything in the world is there to draw */
function hasContent(world: Container): boolean {
  for (const c of world.children) if (c.visible && c.renderable && c.alpha > 0) return true;
  return false;
}

/**
 * One frame of the layer, called by the game's loop right after the 2D canvas is drawn (engine.ts): the world moved to the camera, then
 * rendered, when there is anything to render. Never throws into the loop.
 */
export function drawGpuFrame(tx: number, ty: number, zoom: number) {
  if (!live) return;
  if (loss.lost || live.gl.isContextLost()) {
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
    else if (!kept) renderer.resize(1, 1, 1);
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
  const { Graphics } = await import('./gpuPixi.ts');
  if (!live) return false;
  for (const c of [...live.world.children]) if (c.label === 'probe') c.destroy();
  if (!box) return true;
  const g = new Graphics();
  g.label = 'probe';
  g.rect(box.x, box.y, box.w, box.h).fill(box.color ?? 0xff00ff);
  live.world.addChild(g);
  return true;
}

/** checks only: the layer's sizes, to compare with the game canvas (tools/qa) */
export function gpuSizes() {
  return live ? { css: [cssW, cssH], dpr: dprNow, res: live.renderer.resolution, buf: [live.canvas.width, live.canvas.height], screen: [live.renderer.screen.width, live.renderer.screen.height], kept } : null;
}
