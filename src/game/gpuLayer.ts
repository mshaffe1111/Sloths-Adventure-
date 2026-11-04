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
 *  - Pixi is loaded on its own (a separate chunk, `import()`), once, for the whole app; the first stage asks for it.
 *  - A lost context (the phone took the GPU back) draws nothing and costs nothing until the browser gives it back; Pixi rebuilds its
 *    GPU objects then (its GlContextSystem), and the layer draws again. The 2D game never waits on it.
 *  - Nothing to draw: no GPU work at all. The loop still hands it the camera every frame; it renders, shows its canvas and holds a
 *    full-size drawing buffer only while `world` holds something visible. An empty full-screen WebGL layer would still be cleared and
 *    composited every frame, and its buffer (about 10 MB at q0) held.
 */
import type { Container, WebGLRenderer } from 'pixi.js';

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
let starting: Promise<Live | null> | null = null;
let cssW = 0;
let cssH = 0;
let dprNow = 1;
let lost = false;
let shown = false;
/** frames drawn and frames skipped (nothing to draw, or the context lost): for the checks */
export const gpuStats = { drawn: 0, idle: 0, lostFrames: 0, losses: 0, restores: 0 };

/**
 * Put the layer on `canvas` (App.tsx: the canvas under the game's), once. Resolves with whether it is running (false: no WebGL 2, or
 * Pixi failed to start: the game draws on the 2D canvas alone, as before). Safe to call again.
 */
export function mountGpuLayer(canvas: HTMLCanvasElement | null): Promise<boolean> {
  if (live) return Promise.resolve(true);
  if (!canvas || typeof document === 'undefined') return Promise.resolve(false);
  if (!starting) {
    starting = (async () => {
      const gl = makeGl2(canvas);
      if (!gl) return null;
      try {
        const { WebGLRenderer, Container } = await import('pixi.js');
        const renderer = new WebGLRenderer();
        await renderer.init({
          canvas,
          context: gl,
          // (1x1 until it has something to draw: resizeGpuLayer)
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
  if (!shown) return;
  live.renderer.resolution = dpr;
  live.renderer.resize(w, h, dpr);
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
  // (worldPlace, written out: no object a frame)
  world.position.set(tx * zoom, ty * zoom);
  world.scale.set(zoom);
  const any = hasContent(world);
  if (any !== shown) {
    shown = any;
    canvas.style.visibility = any ? 'visible' : 'hidden';
    // (the full-size drawing buffer only while it draws; back to 1x1 when it empties)
    if (any) resizeGpuLayer(cssW, cssH, dprNow);
    else {
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
