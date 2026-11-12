/**
 * The ground's baked squares as GPU textures (GPU-RENDERER-PLAN stage 2, R-3.3, GL0 2026-11-12).
 *
 * protoArt.ts paints the ground once into squares (drawGroundChunks) and each frame stamps the squares in view. Here the stamps go to
 * the WebGL layer under the game's canvas (gpuLayer.ts): each square is one texture, uploaded once (the frame it is painted, or under
 * the title card), each stamp one sprite, all drawn in one pass into the layer's canvas, which is then copied into the game's 2D canvas
 * with ONE drawImage at the point where the squares used to be stamped. The 2D canvas stays opaque and everything drawn after the
 * ground blends with real ground pixels, as before (the see-through 2D canvas fails the look bar: webgl.md, 2026-11-04).
 *
 * It only ever takes a frame's squares when the layer is running; otherwise drawGroundChunks stamps them on the 2D canvas itself, as it
 * always has: no WebGL 2, Pixi not started, the context lost, or the copy found slow (a 2D canvas that is not on the GPU reads the
 * layer back every frame, which blocks: timed on the first frames, GROUND_COPY_SLOW_MS).
 */
import type { Container, Sprite, Texture } from 'pixi.js';
import { gpuCanvas, gpuFitBuffer, gpuKeepBuffer, gpuLive, gpuPixi, onGpuChange } from './gpuLayer.ts';

/** a copy slower than this (ms, the median of its first COPY_PROBE frames) is a readback: the squares go back to the 2D canvas */
export const GROUND_COPY_SLOW_MS = 2;
const COPY_PROBE = 5;
/**
 * The verdict on the copy's first timings: the median once COPY_PROBE of them are in, when it is over the limit (the copy is a
 * readback); null while too few are in, or when it is quick. A median: one slow first copy (the layer's buffer made) is not a verdict.
 */
export function slowCopy(ms: readonly number[]): number | null {
  if (ms.length < COPY_PROBE) return null;
  const m = [...ms].sort((a, b) => a - b)[ms.length >> 1];
  return m > GROUND_COPY_SLOW_MS ? m : null;
}
/** frames drawn under the title card at most (stageReady.ts) while the copy is still being timed */
export const GROUND_WARM_FRAMES = 8;
/** whether the frames under the card still have something to settle: the layer is running and the copy is not yet judged */
export function groundWarming(): boolean {
  return gpuLive() && !g.off && g.copyMs.length < COPY_PROBE;
}

interface Ground {
  root: Container | null;
  pool: Sprite[];
  used: number;
  /** one texture per painted square */
  tex: Map<HTMLCanvasElement, Texture>;
  /** the source rectangle every texture was framed with (it changes with the view's scale: the squares are painted again then) */
  frame: string;
  copyMs: number[];
  /** given up for this session: why */
  off: string;
  begun: boolean;
}
const g: Ground = { root: null, pool: [], used: 0, tex: new Map(), frame: '', copyMs: [], off: '', begun: false };
export const groundGpuStats = { frames: 0, sprites: 0, uploads: 0, fallbacks: 0 };
/**
 * checks only (the dev server: tools/qa/gpuGround.cjs, tools/perf/layerstick.mjs --ab): `force2d` stamps the squares on the 2D canvas,
 * to compare the two on one frozen frame; `keepGpu` keeps the GPU path where the copy is slow (this container), to judge the look
 */
export const groundCheck = { force2d: false, keepGpu: false };

// (a lost context loses every texture: they are made again from the squares, which the 2D side still holds)
onGpuChange((what) => {
  if (what === 'live') return;
  g.tex.clear();
  g.pool.length = 0;
  g.root = null;
  g.used = 0;
  g.begun = false;
});

/** why the ground is on the 2D canvas for this session ('' while it is not) */
export function groundGpuOff(): string {
  return g.off;
}

/** whether this frame's squares can go to the GPU, for the game canvas `target` (the 2D canvas the layer's own canvas sits under) */
function ready(target: HTMLCanvasElement): boolean {
  if (groundCheck.force2d || (g.off && !groundCheck.keepGpu) || !gpuLive()) return false;
  const cv = gpuCanvas();
  return !!cv && !!target.parentElement && cv.parentElement === target.parentElement;
}

/** the frame's squares start: none pushed yet, the layer's buffer exactly the game canvas's size, so the copy lands pixel for pixel */
export function groundBegin(target: HTMLCanvasElement): boolean {
  g.begun = false;
  if (!ready(target)) return false;
  const P = gpuPixi();
  if (!P) return false;
  if (!g.root) g.root = new P.Container();
  gpuKeepBuffer(true);
  gpuFitBuffer(target.width, target.height);
  g.used = 0;
  g.begun = true;
  return true;
}

function texFor(cv: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number): Texture {
  const P = gpuPixi()!;
  const key = `${sx},${sy},${sw},${sh}`;
  if (g.frame !== key) {
    // (a new scale: the old squares are gone with it, releaseGroundChunks has let their textures go one by one)
    g.frame = key;
  }
  let t = g.tex.get(cv);
  if (!t) {
    const src = P.Texture.from(cv).source;
    t = new P.Texture({ source: src, frame: new P.Rectangle(sx, sy, sw, sh) });
    g.tex.set(cv, t);
    groundGpuStats.uploads++;
  }
  return t;
}

/**
 * One square's stamp, as the 2D canvas would draw it, in DEVICE pixels: the source rectangle (sx, sy, sw, sh) of `cv` to
 * (dx, dy, dw, dh). No object is made per frame once the pool has grown and the square has its texture.
 */
export function groundPush(cv: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
  const P = gpuPixi()!;
  const tex = texFor(cv, sx, sy, sw, sh);
  let sp = g.pool[g.used];
  if (!sp) {
    sp = new P.Sprite(tex);
    g.pool.push(sp);
    g.root!.addChild(sp);
  }
  g.used++;
  if (sp.texture !== tex) sp.texture = tex;
  // (the 2D canvas smooths a stamp that does not land 1:1 on whole device pixels; one that does is the square's own pixels)
  const whole = Math.abs(dw - sw) < 1e-6 && Math.abs(dh - sh) < 1e-6 && Math.abs(dx - Math.round(dx)) < 1e-6 && Math.abs(dy - Math.round(dy)) < 1e-6 && Math.abs(sx - Math.round(sx)) < 1e-6;
  const mode = whole ? 'nearest' : 'linear';
  if (tex.source.scaleMode !== mode) tex.source.scaleMode = mode;
  sp.visible = true;
  sp.position.set(dx, dy);
  sp.scale.set(dw / sw, dh / sh);
}

/**
 * The frame's squares are all pushed: draw them and copy the layer into `ctx` (the game canvas) at whole device pixels. False when it
 * could not: the caller then stamps the squares on the 2D canvas itself, this frame.
 */
export function groundFlush(ctx: CanvasRenderingContext2D): boolean {
  if (!g.begun || !g.root) return false;
  g.begun = false;
  const P = gpuPixi();
  const cv = gpuCanvas();
  if (!P || !cv || !gpuLive()) return false;
  for (let i = g.used; i < g.pool.length; i++) g.pool[i].visible = false;
  try {
    P.renderer.render(g.root);
    const t0 = performance.now();
    ctx.save();
    // (only the transform is reset: the caller's clip, alpha and blend apply to the copy as they applied to each stamp; the squares
    // never overlap, so one copy under them is the same picture as the stamps one by one)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(cv, 0, 0);
    ctx.restore();
    const ms = performance.now() - t0;
    groundGpuStats.frames++;
    groundGpuStats.sprites += g.used;
    if (g.copyMs.length < COPY_PROBE) {
      g.copyMs.push(ms);
      const slow = slowCopy(g.copyMs);
      if (slow !== null) {
        g.off = `copy ${slow.toFixed(1)} ms (a readback: the 2D canvas is not on the GPU)`;
        // (and the layer's full-size drawing buffer is let go: nothing else is on it)
        if (!groundCheck.keepGpu) gpuKeepBuffer(false);
      }
    }
    return true;
  } catch (err) {
    groundGpuStats.fallbacks++;
    g.off = `copy failed: ${String(err).slice(0, 80)}`;
    return false;
  }
}

/** a square is let go (protoArt.ts freeTile): its texture too */
export function groundForget(cv: HTMLCanvasElement | null) {
  const t = cv ? g.tex.get(cv) : undefined;
  if (!t || !cv) return;
  g.tex.delete(cv);
  try {
    t.source.destroy();
    t.destroy(false);
  } catch {
    /* the context went with it */
  }
}

/** checks only: how many squares hold a texture now */
export function groundTextures(): number {
  return g.tex.size;
}
