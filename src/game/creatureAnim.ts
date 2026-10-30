/**
 * Animated creature sheets (2026-10-25): each regular creature's own painted poses turned into short Wan 2.2 clips with the motion
 * model, cut into sequences of frames (<creature>-anim.webp + <creature>AnimData.ts, made by scratchpad/reanim/pack.py).
 *
 * A clip frame carries its old start frame's anchor and is ANIM_UP times the old frame's pixel size, so a sprite that drew an old
 * frame at K draws a clip frame at K / up in the same place. Sprites ask for a sequence by name and either a progress (0..1, held
 * at the ends) or a looping clock; while the sheet loads they draw their old frames, so nothing ever disappears.
 */
import { trackAtlas } from './atlasLoader.ts';
import { canvasLost } from './canvasLost.ts';

export interface AnimFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
}

export interface CreatureAnim {
  /** true once the sheet has loaded (asking starts the load) */
  ready(): boolean;
  has(seq: string): boolean;
  /** the frame at progress p through a sequence, held at the ends */
  at(seq: string, p: number): string;
  /** looping at fps on clock t */
  loop(seq: string, t: number, fps: number): string;
  /** back and forth at fps on clock t (for a clip whose ends do not meet) */
  ping(seq: string, t: number, fps: number): string;
  /** draw a frame with its anchor at the origin, at the old frames' scale k; false while loading */
  draw(ctx: CanvasRenderingContext2D, name: string, k: number): boolean;
}

/** every creature's clip sheet, by its name (the file's name before -anim: 'ocelot', 'jaguar', 'boa', 'turtle', 'guard', ...) */
const ALL = new Map<string, CreatureAnim>();

/**
 * Start loading the clip sheets of the creatures a stage holds, as the stage starts. They used to start loading the first time each
 * creature came on screen, so the swap from its still frames to its clips (and handing a 13 to 46 MB sheet to the graphics) landed in
 * the middle of meeting it.
 */
export function warmCreatureAnims(names: Iterable<string>) {
  for (const n of names) ALL.get(n)?.ready();
}

/** each sheet's settle: a smaller bake once its draws have shown the size it is really drawn at (makeCreatureAnim) */
const settlers = new Set<() => void>();
/**
 * While a stage loads (stageReady.ts), never during play: each clip sheet shrinks its bake to the size its draws so far have needed
 * (its first bake, at half size as it arrived, is the guess; a draw that needs more bakes it bigger at once, as before).
 */
export function settleCreatureBakes() {
  for (const f of settlers) f();
}

/** whether every one of these creatures that has clips has its sheet loaded and baked (asking starts the load) */
export function creatureAnimsReady(names: Iterable<string>): boolean {
  let all = true;
  for (const n of names) if (ALL.has(n) && !ALL.get(n)!.ready()) all = false;
  return all;
}

/** a creature's clip sheet address, by its name (undefined for a creature with no clips) */
export const creatureAnimUrl = (name: string): string | undefined => URLS.get(name);
const URLS = new Map<string, string>();

export function makeCreatureAnim(url: string, frames: Record<string, AnimFrame>, seqs: Record<string, readonly string[]>, up: number): CreatureAnim {
  let img: HTMLImageElement | null = null;
  // The sheet, decoded, at the size the screen needs (PERFORMANCE-RULES.md §2.12, §2.13). Drawn straight from the <img>, a
  // 20 MB clip sheet shrunk 2 to 5 times with smoothing 'high' needed mipmaps over the whole texture, rebuilt each time Chrome dropped
  // and re-uploaded it: the snake and eagle stretches stalled 100-170 ms at a time on a Pixel 11, at every picture quality (QA and
  // Duet, 2026-10-30). So it is baked once, shrunk to the largest size it is actually drawn at (in eighths, a little over), and
  // baked again only if a later draw needs it bigger; it shrinks to the size seen so far only while the next stage loads (settleCreatureBakes).
  // (baked by drawing the sheet once into a plain canvas, which works in every browser: with createImageBitmap's own resize the creatures
  // went missing on Matt's Pixel, 2026-10-30)
  let baked: HTMLCanvasElement | null = null;
  let bakedR = 0;
  let loaded = false;
  let need = 0;
  let checks = 0;
  const sizeFor = (n: number) => Math.min(1, Math.max(1 / 8, Math.ceil(n * 1.1 * 8) / 8));
  const bake = (r: number) => {
    const im = img;
    if (!im || typeof document === 'undefined') return;
    const w = Math.max(1, Math.round((im.naturalWidth || im.width) * r));
    const h = Math.max(1, Math.round((im.naturalHeight || im.height) * r));
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(im, 0, 0, w, h);
    if (baked) baked.width = baked.height = 0;
    baked = cv;
    bakedR = r;
  };
  const drop = () => {
    if (baked) baked.width = baked.height = 0;
    baked = null;
    bakedR = 0;
    need = 0;
    checks = 0;
  };
  const load = () => {
    if (img || typeof Image === 'undefined') return;
    const im = new Image();
    img = im;
    trackAtlas(
      im,
      url,
      () => {
        if (img !== im) return;
        // (a first guess: half size covers most creatures; the draws then set the real size)
        bake(0.5);
        loaded = true;
      },
      () => { img = null; },
      () => { img = null; loaded = false; drop(); }
    );
  };
  // (a bake smaller than the one held, once enough draws have shown it is all the screen needs: done while a stage loads, settleCreatureBakes,
  // never in play, where redrawing a 13 to 20 MB sheet was a freeze of its own)
  settlers.add(() => {
    if (loaded && img && checks >= 120 && sizeFor(need) < bakedR) bake(sizeFor(need));
  });
  const seqOf = (s: string) => seqs[s] ?? [];
  const anim: CreatureAnim = {
    ready() {
      load();
      return loaded && !!img;
    },
    has: (s) => seqOf(s).length > 0,
    at(s, p) {
      const f = seqOf(s);
      return f[Math.max(0, Math.min(f.length - 1, Math.floor(p * f.length)))];
    },
    loop(s, t, fps) {
      const f = seqOf(s);
      return f[((Math.floor(t * fps) % f.length) + f.length) % f.length];
    },
    ping(s, t, fps) {
      const f = seqOf(s);
      const n = f.length;
      if (n < 2) return f[0];
      const i = ((Math.floor(t * fps) % (2 * n - 2)) + 2 * n - 2) % (2 * n - 2);
      return f[i < n ? i : 2 * n - 2 - i];
    },
    draw(ctx, name, k) {
      if (!loaded || !img) return false;
      const f = frames[name];
      if (!f) return false;
      const s = k / up;
      // how many device pixels one sheet pixel covers here (looked at for the first 120 draws, then every 30th)
      if ((checks < 120 || checks % 30 === 0) && typeof ctx.getTransform === 'function') {
        const m = ctx.getTransform();
        const n = s * Math.hypot(m.a, m.b);
        if (n > need) need = n;
        if (sizeFor(need) > bakedR) bake(sizeFor(need));
      }
      checks++;
      // (a bake the phone took back draws nothing: drawn from the sheet until it is baked again)
      if (baked && canvasLost(baked, 'creature clips')) drop();
      if (baked) {
        // (half a pixel in from the frame's edge when shrunk, so a neighbour frame never bleeds in)
        const r = bakedR;
        const e = r < 1 ? 0.5 : 0;
        ctx.drawImage(baked, f.x * r + e, f.y * r + e, f.w * r - 2 * e, f.h * r - 2 * e, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
      } else ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
      return true;
    },
  };
  const name = /([a-z0-9]+)-anim[^/]*$/.exec(url.split('?')[0])?.[1];
  if (name) {
    ALL.set(name, anim);
    URLS.set(name, url);
  }
  return anim;
}
