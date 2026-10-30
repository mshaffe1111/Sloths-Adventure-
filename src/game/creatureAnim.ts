/**
 * Animated creature sheets (2026-10-25): each regular creature's own painted poses turned into short Wan 2.2 clips with the motion
 * model, cut into sequences of frames (<creature>-anim.webp + <creature>AnimData.ts, made by scratchpad/reanim/pack.py).
 *
 * A clip frame carries its old start frame's anchor and is ANIM_UP times the old frame's pixel size, so a sprite that drew an old
 * frame at K draws a clip frame at K / up in the same place. Sprites ask for a sequence by name and either a progress (0..1, held
 * at the ends) or a looping clock; while the sheet loads they draw their old frames, so nothing ever disappears.
 */
import { trackAtlas } from './atlasLoader.ts';

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

/** a creature's clip sheet address, by its name (undefined for a creature with no clips) */
export const creatureAnimUrl = (name: string): string | undefined => URLS.get(name);
const URLS = new Map<string, string>();

export function makeCreatureAnim(url: string, frames: Record<string, AnimFrame>, seqs: Record<string, readonly string[]>, up: number): CreatureAnim {
  let img: HTMLImageElement | null = null;
  // the sheet as a decoded bitmap, held for as long as the world is: drawn from the <img>, Chrome may throw the decoded 20 MB away and
  // decode it again in the middle of play, which stalled the snake and eagle stretches 100-170 ms at a time on a Pixel 11
  // (PERFORMANCE-RULES.md §2.12)
  let bmp: ImageBitmap | null = null;
  let loaded = false;
  const drop = () => {
    bmp?.close();
    bmp = null;
  };
  const load = () => {
    if (img || typeof Image === 'undefined') return;
    const im = new Image();
    img = im;
    const ready = () => {
      if (img === im) loaded = true;
    };
    trackAtlas(
      im,
      url,
      () => {
        if (typeof createImageBitmap !== 'function') return ready();
        createImageBitmap(im).then(
          (b) => {
            if (img !== im) return b.close();
            bmp = b;
            ready();
          },
          ready
        );
      },
      () => { img = null; },
      () => { img = null; loaded = false; drop(); }
    );
  };
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
      ctx.drawImage(bmp ?? img, f.x, f.y, f.w, f.h, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
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
