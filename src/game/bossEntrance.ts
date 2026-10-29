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

/** when a tea entrance (`tea`) has her poured and risen: the pour fills TEA_POUR, the rise runs to TEA_RISE, then the usual roar at 0.62 */
export const TEA_POUR: [number, number] = [0.34, 0.54];
export const TEA_RISE = 0.62;

/**
 * the five beats, as fractions of the whole so the short version is the same shape, just quicker. A tea entrance (`tea`) is lit
 * early: after the eyes the boss is shown at once and the dark lifts by half, so the cup and the pot read while she pours.
 */
export function entranceBeat(t: number, total: number, tea = false): Beat {
  const u = clamp01(t / Math.max(0.01, total));
  const bars = Math.min(ease(seg(u, 0, 0.1)), 1 - ease(seg(u, 0.93, 1)));
  const lift = tea ? 1 - 0.55 * ease(seg(u, 0.28, 0.36)) : 1;
  const dark = ease(seg(u, 0, 0.18)) * 0.78 * lift * (1 - ease(seg(u, 0.62, 0.78)));
  const eyes = seg(u, 0.2, 0.3) * (1 - seg(u, tea ? 0.3 : 0.5, tea ? 0.36 : 0.6));
  const reveal = tea ? ease(seg(u, 0.28, 0.36)) : ease(seg(u, 0.4, 0.62));
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
  /** the eyes' glow (default a hot orange) and the colour of the dark that falls over the arena */
  eyeRgb?: [number, number, number];
  darkRgb?: [number, number, number];
}

/** over everything, once the frame is drawn */
export function drawEntrance(ctx: CanvasRenderingContext2D, v: EntranceView, b: Beat, time: number) {
  ctx.save();
  if (b.dark > 0) {
    const dk = v.darkRgb ?? [4, 1, 1];
    ctx.fillStyle = `rgba(${dk[0]}, ${dk[1]}, ${dk[2]}, ${b.dark})`;
    ctx.fillRect(0, 0, v.vw, v.vh);
  }
  // the eyes: two slits that open one after the other, and flicker like embers
  if (b.eyes > 0) {
    const flick = 0.8 + 0.2 * Math.sin(time * 23);
    const er = v.eyeRgb ?? [255, 140, 30];
    for (const dx of [-30, 30]) {
      const ex = v.eyeX + dx;
      const g = ctx.createRadialGradient(ex, v.eyeY, 1, ex, v.eyeY, 38);
      g.addColorStop(0, `rgba(255, 235, 150, ${b.eyes * flick})`);
      g.addColorStop(0.3, `rgba(${er[0]}, ${er[1]}, ${er[2]}, ${0.7 * b.eyes})`);
      g.addColorStop(1, `rgba(${er[0]}, ${er[1]}, ${er[2]}, 0)`);
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
    const text = v.name.toUpperCase();
    const { lines, size } = fitName(ctx, text, v.vw - 2 * NAME_MARGIN, Math.min(v.vw * 0.11, 96));
    const s = 1 + b.nameIn * 1.4;
    ctx.translate(v.vw / 2, v.vh * 0.47);
    ctx.scale(s, s);
    ctx.globalAlpha = b.nameAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size}px Fredoka, sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    const lh = size * 1.05;
    const y0 = (-(lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.strokeText(ln, 0, y0 + i * lh);
      ctx.shadowColor = v.color;
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#fff7ed';
      ctx.fillText(ln, 0, y0 + i * lh);
      ctx.restore();
    });
    if (b.nameIn < 0.05) {
      ctx.globalAlpha = b.nameAlpha * 0.5;
      ctx.fillStyle = v.color;
      ctx.fillRect(-v.vw, y0 + (lines.length - 1) * lh + size * 0.62, v.vw * 2, 3);
    }
  }
  ctx.restore();
}

/** the name card keeps at least this far from each side of the view */
export const NAME_MARGIN = 16;

/**
 * The name's lines and font size so it fits `room` wide (its outline included): one line at the full size if it fits, else two lines
 * (split at the space nearest the middle) when that lets it stay bigger, shrunk as far as it must.
 */
export function fitName(ctx: Pick<CanvasRenderingContext2D, 'font' | 'measureText'>, text: string, room: number, full: number): { lines: string[]; size: number } {
  const widest = (lines: string[], size: number) => {
    ctx.font = `bold ${size}px Fredoka, sans-serif`;
    return Math.max(...lines.map((l) => ctx.measureText(l).width)) + size * 0.16;
  };
  const fit = (lines: string[]) => ({ lines, size: Math.min(full, (full * room) / Math.max(1, widest(lines, full))) });
  const one = fit([text]);
  const words = text.split(' ');
  if (one.size >= full || words.length < 2) return one;
  let best = 1;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < Math.abs(words.slice(0, best).join(' ').length - words.slice(best).join(' ').length)) best = i;
  }
  const two = fit([words.slice(0, best).join(' '), words.slice(best).join(' ')]);
  return two.size > one.size ? two : one;
}

const seen = new Set<string>();
/** the length this boss's entrance should be now, and remember that it has been seen */
export function takeEntranceLength(key: string): number {
  const len = seen.has(key) ? ENTRANCE_SHORT : ENTRANCE_LONG;
  seen.add(key);
  return len;
}
