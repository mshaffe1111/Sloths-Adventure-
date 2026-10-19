/**
 * A giant boss makes an entrance. The first time you meet it in a session it takes about five seconds: the screen goes dark under
 * two black bars, a pair of eyes opens in the dark, the boss is revealed, it roars, and its name slams down. Trying again after a
 * fall plays the short version (a second and a half) so a hard boss never makes you sit through it twice.
 *
 * `entranceBeat` is the timeline (pure, so it can be tested); `drawEntrance` paints it over the finished frame.
 */

export const ENTRANCE_LONG = 5.0;
export const ENTRANCE_SHORT = 1.5;

export interface Beat {
  /** how far through it is, 0..1 */
  u: number;
  /** the black bars at the top and bottom, 0 (gone) .. 1 (in) */
  bars: number;
  /** darkness over the arena, 0..1 */
  dark: number;
  /** the pair of eyes, 0..1 */
  eyes: number;
  /** how much of the boss is visible, 0..1 */
  reveal: number;
  /** 1 on the frame band where it roars, else 0 (the engine shakes the screen from it) */
  roaring: boolean;
  /** the name: 0 = not yet, then 1..0 settles from huge to its size */
  nameIn: number;
  /** how visible the name is, 0..1 */
  nameAlpha: number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const seg = (u: number, a: number, b: number) => clamp01((u - a) / (b - a));

/** the five beats, as fractions of the whole so the short version is the same shape, just quicker */
export function entranceBeat(t: number, total: number): Beat {
  const u = clamp01(t / Math.max(0.01, total));
  const bars = Math.min(ease(seg(u, 0, 0.1)), 1 - ease(seg(u, 0.93, 1)));
  const dark = ease(seg(u, 0, 0.18)) * 0.78 * (1 - ease(seg(u, 0.62, 0.78)));
  const eyes = seg(u, 0.2, 0.3) * (1 - seg(u, 0.5, 0.6));
  const reveal = ease(seg(u, 0.4, 0.62));
  const roaring = u >= 0.62 && u < 0.7;
  const nameIn = 1 - ease(seg(u, 0.78, 0.84));
  const nameAlpha = seg(u, 0.78, 0.8) * (1 - seg(u, 0.93, 1));
  return { u, bars, dark, eyes, reveal, roaring, nameIn, nameAlpha };
}

export interface EntranceView {
  vw: number;
  vh: number;
  /** where the boss's eyes are, in the view (not the world) */
  eyeX: number;
  eyeY: number;
  name: string;
  color: string;
}

/** over everything, once the frame is drawn */
export function drawEntrance(ctx: CanvasRenderingContext2D, v: EntranceView, b: Beat, time: number) {
  ctx.save();
  if (b.dark > 0) {
    ctx.fillStyle = `rgba(4, 1, 1, ${b.dark})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  // the eyes: two slits that open one after the other, and flicker like embers
  if (b.eyes > 0) {
    const flick = 0.8 + 0.2 * Math.sin(time * 23);
    for (const dx of [-30, 30]) {
      const ex = v.eyeX + dx;
      const g = ctx.createRadialGradient(ex, v.eyeY, 1, ex, v.eyeY, 38);
      g.addColorStop(0, `rgba(255, 235, 150, ${b.eyes * flick})`);
      g.addColorStop(0.3, `rgba(255, 140, 30, ${0.7 * b.eyes})`);
      g.addColorStop(1, 'rgba(255, 90, 20, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ex, v.eyeY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 250, 220, ${b.eyes})`;
      ctx.beginPath();
      ctx.ellipse(ex, v.eyeY, 11 * b.eyes, 3.5 * b.eyes, dx > 0 ? -0.18 : 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // letterbox
  if (b.bars > 0) {
    const bh = v.vh * 0.12 * b.bars;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, v.vw, bh);
    ctx.fillRect(0, v.vh - bh, v.vw, bh);
  }
  // the name, slamming down from huge and landing with a flash
  if (b.nameAlpha > 0) {
    const size = Math.min(v.vw * 0.11, 96);
    const s = 1 + b.nameIn * 1.4;
    ctx.translate(v.vw / 2, v.vh * 0.47);
    ctx.scale(s, s);
    ctx.globalAlpha = b.nameAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size}px Fredoka, sans-serif`;
    const text = v.name.toUpperCase();
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = 'rgba(0,0,0,.85)';
    ctx.strokeText(text, 0, 0);
    ctx.shadowColor = v.color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#fff7ed';
    ctx.fillText(text, 0, 0);
    if (b.nameIn < 0.05) {
      ctx.globalAlpha = b.nameAlpha * 0.5;
      ctx.fillStyle = v.color;
      ctx.fillRect(-v.vw, size * 0.62, v.vw * 2, 3);
    }
  }
  ctx.restore();
}

const seen = new Set<string>();
/** the length this boss's entrance should be now, and remember that it has been seen */
export function takeEntranceLength(key: string): number {
  const len = seen.has(key) ? ENTRANCE_SHORT : ENTRANCE_LONG;
  seen.add(key);
  return len;
}
