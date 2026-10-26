/**
 * World 4's smaller pieces of play (the Mist Cascades):
 *
 *   chimes   bamboo wind chimes on wooden posts beside a gust lane (4-2, 4-4). They hang still between gusts, start to swing and ring the
 *            way the next gust will blow while it warns, and lean hard with it while it blows. Reading them is the whole lesson: open
 *            the leaf, or let go of the vine, with the wind behind you.
 *   dot help a knot Pokey cannot reach (a vine tied up high, a rope looped over a branch): standing still under it for a moment sends
 *            Dot up to pick it loose, and the vine or rope drops down for him (4-4, 4-8). No button: stand in the right place and she
 *            knows what to do.
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on what each one is doing.
 */
import { zoneState, type Zone } from './zones.ts';

// ───────────────────────────── chimes ─────────────────────────────

export interface Chime {
  /** the post's foot (world px) and the gust lane it listens to (an index into the stage's zones) */
  x: number;
  y: number;
  zone: number;
}

/** the chimes' lean (radians, + toward the right) at time t: still, then swinging and ringing toward the gust, then leaning with it */
export function chimeLean(z: Zone, t: number): { angle: number; ringing: boolean } {
  const s = zoneState(z, t);
  if (s.phase === 'idle') return { angle: Math.sin(t * 1.3) * 0.03, ringing: false };
  if (s.phase === 'warn') {
    // a swing that grows, and tips further toward the coming wind each time
    const amp = 0.12 + 0.35 * s.u;
    return { angle: z.dir * amp * (0.6 + 0.4 * Math.sin(t * 9)), ringing: true };
  }
  return { angle: z.dir * (0.25 + 0.4 * s.strength) + Math.sin(t * 14) * 0.05, ringing: s.strength > 0.5 };
}

// ───────────────────────────── Dot's help ─────────────────────────────

export interface DotKnot {
  /** the knot (world px) Dot flies up to; a knotted vine hangs tied up down to it until she frees it (w4Play.ts tiedBottom) */
  x: number;
  y: number;
  /** where Pokey stands to ask: his middle within [x0, x1], his feet near `ground` */
  x0: number;
  x1: number;
  ground: number;
  /** what comes free: the vine or rope it releases (by id) */
  releases: { kind: 'vine' | 'rope'; id: number };
}

export const DOT_HELP = {
  /** seconds of standing still under the knot before Dot goes */
  ask: 0.6,
  /** seconds she takes to fly up, and to pick the knot */
  fly: 0.9,
  pick: 1.1,
  /** feet this far from the ground line still count as standing there (px) */
  reach: 40,
} as const;

/**
 * what Dot says about a knot, the same wherever it is heard: the stage's lesson as he comes up to the first one (protoStage.ts) and her
 * line once he is on its spot (w4Play.ts). Asking, flying up and picking take DOT_HELP's 2.6 s, and the vine drops in under a second.
 */
export const KNOT_TEACH = "That vine is tied up too high! Stand still on the glowing spot beside it, and I'll fly up and untie it. It takes me about three seconds";

export type KnotPhase = 'tied' | 'flying' | 'picking' | 'free';

export interface KnotState {
  phase: KnotPhase;
  /** seconds in the current phase (or of asking, while tied) */
  t: number;
}

export const newKnot = (): KnotState => ({ phase: 'tied', t: 0 });

/** one frame: `asking` = he stands still in the knot's spot */
export function stepKnot(k: KnotState, asking: boolean, dt: number): KnotState {
  if (k.phase === 'free') return k;
  if (k.phase === 'tied') {
    const t = asking ? k.t + dt : 0;
    return t >= DOT_HELP.ask ? { phase: 'flying', t: 0 } : { phase: 'tied', t };
  }
  // once she has gone she finishes, whatever he does
  const t = k.t + dt;
  if (k.phase === 'flying') return t >= DOT_HELP.fly ? { phase: 'picking', t: 0 } : { phase: 'flying', t };
  return t >= DOT_HELP.pick ? { phase: 'free', t: 0 } : { phase: 'picking', t };
}

/** is he standing in the knot's spot? */
export const underKnot = (k: DotKnot, px: number, feetY: number): boolean =>
  px >= k.x0 && px <= k.x1 && Math.abs(feetY - k.ground) <= DOT_HELP.reach;

/** the middle of a knot's spot, where its glowing mark is painted on the ground */
export const knotSpotX = (k: DotKnot): number => (k.x0 + k.x1) / 2;

/** how long the mark under a freed knot takes to fade away (s) */
export const KNOT_MARK_FADE = 0.5;

/** how bright the knot's mark on the ground is (0 = gone): it glows while the knot is tied or Dot is at it, and fades once it is free */
export function knotMark(st: KnotState, sinceFree: number): number {
  if (st.phase === 'free') return Math.max(0, 1 - sinceFree / KNOT_MARK_FADE);
  return 1;
}

/**
 * where Dot is while she helps (null when she is not out): hovering by his head as he waits on the spot, then flying up in an arc to
 * the knot, then pecking at it from beside it. `face` is the way she looks (toward the knot).
 */
export function dotAtKnot(k: DotKnot, st: KnotState, t: number): { x: number; y: number; face: -1 | 1; pecking: boolean } | null {
  const sx = knotSpotX(k);
  const face: -1 | 1 = k.x <= sx ? -1 : 1;
  // beside the knot, on his side of it
  const px = k.x - face * 26;
  const py = k.y + 4;
  const hx = sx + face * 22;
  const hy = k.ground - 92;
  if (st.phase === 'tied') {
    if (st.t <= 0) return null;
    // she comes out and hovers by his head while he keeps still
    const u = Math.min(1, st.t / DOT_HELP.ask);
    return { x: hx, y: hy + 14 * (1 - u) + Math.sin(t * 6) * 3, face, pecking: false };
  }
  if (st.phase === 'flying') {
    const u = Math.min(1, st.t / DOT_HELP.fly);
    const e = u * u * (3 - 2 * u);
    // an arc: up first, then across to the knot
    const x = hx + (px - hx) * e;
    const y = hy + (py - hy) * Math.sin((e * Math.PI) / 2) - 30 * Math.sin(e * Math.PI);
    return { x, y, face, pecking: false };
  }
  if (st.phase === 'picking') {
    // darting in to peck at the knot and back, a few times a second
    const peck = Math.max(0, Math.sin(st.t * 16));
    return { x: px + face * 8 * peck, y: py + Math.sin(t * 9) * 2, face, pecking: true };
  }
  return null;
}
