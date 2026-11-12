/**
 * The measuring stick's clock (R-150.4 / R-150.1, GL0 2026-11-12): how long each draw layer of one frame takes, by name.
 *
 * engine.ts render() and scenery.ts call `stickMark(ctx, layer)` at the END of each layer's drawing: everything since the mark before
 * it counts to that layer, so the layers' times add up to the frame's whole draw (nothing counted twice, nothing left out). A `span`
 * is a named stretch INSIDE a layer (the ground's baked squares inside 'ground'): it is reported beside the layers and is already part
 * of its layer's time, never added to the sum.
 *
 * Two readings (tools/perf/layerstick.mjs takes both):
 *  - 'cpu'   the clock alone: our own JS and the canvas calls as the browser records them;
 *  - 'flush' every mark first reads one pixel of the game canvas back, which makes the browser finish everything drawn so far, so a
 *            layer's time includes its raster (PERFORMANCE-RULES §6.2). The read costs time itself: its own share is measured as the
 *            'flushCost' of an empty stretch and reported, never hidden.
 * Off (always, outside the tool): one boolean test a mark, no clock read, no object made.
 */
export const STICK_LAYERS = ['sky', 'far', 'mid', 'ground', 'props', 'creatures', 'pokey', 'front', 'hud'] as const;
export type StickLayer = (typeof STICK_LAYERS)[number];
/** what each name holds, for the tool's legend (the names are the brief's; the lines say exactly what is inside each) */
export const STICK_LEGEND: Record<StickLayer, string> = {
  sky: 'the drawn sky (gradient, sun, clouds): only where no painted strip covers it',
  far: "the far backdrop strip, with its painted sky row above it",
  mid: 'the middle and near backdrop strips, the backdrop haze and light, a boss lair or the abyss behind the world',
  ground: 'water behind, rivers, trees, vines and platforms, the painted ground (its baked squares: span "squares"), pits, trunks',
  props: 'stage dressing, pickups, goals, signs, the puzzle pieces: everything standing on the ground behind the creatures',
  creatures: 'the creatures, predators and a boss, with their shadows and warnings',
  pokey: 'Pokey, his kit and his effects',
  front: 'what is drawn over Pokey inside the world: water in front, front leaves, the tide',
  hud: "the screen-space overlay: the frame's edge foliage, the canvas HUD, vignettes and screen effects",
};
export type StickMode = 'off' | 'cpu' | 'flush';

/** one frame's reading */
export interface StickFrame {
  layers: Record<StickLayer, number>;
  spans: Record<string, number>;
  /** begin to end, by the clock: equals the sum of the layers */
  total: number;
  /** pixel reads made this frame (flush mode: one a mark, one at begin) */
  flushes: number;
}

const zero = (): Record<StickLayer, number> => ({ sky: 0, far: 0, mid: 0, ground: 0, props: 0, creatures: 0, pokey: 0, front: 0, hud: 0 });

/** the clock itself: pure (the time source and the flush are handed in), so its counting is proven without a browser */
export class LayerClock {
  mode: StickMode = 'off';
  frames: StickFrame[] = [];
  /** checks only: a busy wait of this many ms is spent inside the named layer, just before its mark (the tool's planted cost) */
  plant: Partial<Record<StickLayer, number>> = {};
  private cur: StickFrame | null = null;
  private t = 0;
  private t0 = 0;
  private open = new Map<string, number>();

  /** the time source (the tool hands in the real clock: under its harness the page's own clock is a fake one that only moves when told) */
  constructor(public now: () => number = () => performance.now()) {}

  /** the start of a frame's drawing */
  begin(flush?: () => void) {
    if (this.mode === 'off') return;
    this.cur = { layers: zero(), spans: {}, total: 0, flushes: 0 };
    this.open.clear();
    if (this.mode === 'flush' && flush) {
      flush();
      this.cur.flushes++;
    }
    this.t0 = this.t = this.now();
  }

  /** the end of one layer's drawing: the time since the mark before it (or the frame's start) counts to `layer` */
  mark(layer: StickLayer, flush?: () => void) {
    const c = this.cur;
    if (!c) return;
    const w = this.plant[layer];
    if (w) for (const until = this.now() + w; this.now() < until; ) { /* the planted cost */ }
    if (this.mode === 'flush' && flush) {
      flush();
      c.flushes++;
    }
    const n = this.now();
    c.layers[layer] += n - this.t;
    this.t = n;
  }

  /** a named stretch inside a layer starts (it must end before its layer's mark) */
  spanBegin(name: string) {
    if (!this.cur) return;
    this.open.set(name, this.now());
  }

  /** ...and ends: in flush mode its raster is finished first, so the stretch holds its own drawing */
  spanEnd(name: string, flush?: () => void) {
    const c = this.cur;
    if (!c) return;
    const s = this.open.get(name);
    if (s === undefined) return;
    if (this.mode === 'flush' && flush) {
      flush();
      c.flushes++;
    }
    this.open.delete(name);
    c.spans[name] = (c.spans[name] ?? 0) + this.now() - s;
  }

  /** the end of the frame. A frame that left early (a stage that draws its own screen) is dropped: it has no layers to read */
  end(complete = true) {
    const c = this.cur;
    this.cur = null;
    if (!c || !complete) return;
    c.total = this.t - this.t0;
    this.frames.push(c);
  }

  take(): StickFrame[] {
    const f = this.frames;
    this.frames = [];
    return f;
  }
}

/** the middle value of each layer over many frames (a median: one slow frame, a garbage collection, does not move it) */
export function stickMedians(frames: readonly StickFrame[]): { layers: Record<StickLayer, number>; spans: Record<string, number>; total: number; n: number } {
  const med = (v: number[]) => {
    if (!v.length) return 0;
    const s = [...v].sort((a, b) => a - b);
    return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };
  const layers = zero();
  for (const l of STICK_LAYERS) layers[l] = med(frames.map((f) => f.layers[l]));
  const names = new Set<string>();
  for (const f of frames) for (const k of Object.keys(f.spans)) names.add(k);
  const spans: Record<string, number> = {};
  // (a span missing from a frame was not drawn that frame: it counts as 0, not as absent)
  for (const k of names) spans[k] = med(frames.map((f) => f.spans[k] ?? 0));
  return { layers, spans, total: med(frames.map((f) => f.total)), n: frames.length };
}

/** the game's one clock (the tool reaches it through the dev-only window.__stick, App.tsx: nothing in a player's build) */
export const stick = new LayerClock();
const read = (ctx: CanvasRenderingContext2D) => () => void ctx.getImageData(0, 0, 1, 1);

export function stickBegin(ctx: CanvasRenderingContext2D) {
  if (stick.mode !== 'off') stick.begin(read(ctx));
}
export function stickMark(ctx: CanvasRenderingContext2D, layer: StickLayer) {
  if (stick.mode !== 'off') stick.mark(layer, read(ctx));
}
export function stickSpanBegin(name: string) {
  if (stick.mode !== 'off') stick.spanBegin(name);
}
export function stickSpanEnd(ctx: CanvasRenderingContext2D, name: string) {
  if (stick.mode !== 'off') stick.spanEnd(name, read(ctx));
}
export function stickEnd(complete = true) {
  if (stick.mode !== 'off') stick.end(complete);
}
