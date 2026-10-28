/**
 * The title's animation player (2026-10-28, Matt: "polish the actual Pokey and Meeca so they're not just twitching around"). The two of
 * them are drawn only from real painted frames, played as clips on a timeline: an idle clip loops, and every few seconds one "moment"
 * clip (a blink and a look, Meeca's wave, Pokey's cheer, the two of them together) plays once and hands back to the idle, or to the
 * clip it names next. No code-made bobbing, squashing or tilting: what moves is what was painted.
 *
 * A cast is plain data, so new sheets from the art helper drop in by editing a list:
 *
 *   sheets   name -> picture (a URL, or a canvas made at run time)
 *   clips    name -> { sheet, frames: [{ x, y, w, h, ax, ay }], fps, loop?, next? }
 *              x y w h  where the frame sits in its sheet;  ax ay  the point between its feet (where it stands)
 *              loop     plays round for as long as it is the clip on show (the idle)
 *              next     the clip that follows when it ends (default: the idle)
 *   idle     the clip it rests in
 *   moments  the clips it plays now and then, one at a time
 *   gap      seconds of idle between two moments, [shortest, longest]
 *   height   how tall the figure stands in the sheet's pixels (the title scales that to the size it wants)
 *
 * Everything here is pure (the same seed always gives the same timeline), so it is tested without a screen.
 */
export interface ClipFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
}
export interface Clip {
  sheet: string;
  frames: ClipFrame[];
  fps: number;
  loop?: boolean;
  next?: string;
}
export interface Cast {
  sheets: Record<string, string | CanvasImageSource>;
  clips: Record<string, Clip>;
  idle: string;
  moments: string[];
  gap: [number, number];
  height: number;
}

/** one stretch of the timeline: a clip from `start` to `end` seconds (a looping idle runs until the next moment) */
export interface Segment {
  clip: string;
  start: number;
  end: number;
}

function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** how long a clip takes to play once */
export function clipLength(c: Clip): number {
  return c.frames.length / Math.max(0.01, c.fps);
}

/** the timeline from 0 to `until` seconds: idle, a moment (and whatever it chains to), idle, ... */
export function timeline(cast: Cast, seed: number, until: number): Segment[] {
  const next = rng(seed);
  const out: Segment[] = [];
  const [g0, g1] = cast.gap;
  let t = 0;
  let last = '';
  while (t < until) {
    const rest = g0 + next() * Math.max(0, g1 - g0);
    out.push({ clip: cast.idle, start: t, end: t + rest });
    t += rest;
    if (!cast.moments.length) break;
    // a moment, never the same one twice running when there is a choice
    let pick = cast.moments[Math.floor(next() * cast.moments.length) % cast.moments.length];
    if (pick === last && cast.moments.length > 1) pick = cast.moments[(cast.moments.indexOf(pick) + 1) % cast.moments.length];
    last = pick;
    // play it, then whatever it names next, until the chain comes back to the idle (a chain is cut off after six clips)
    let name: string | undefined = pick;
    for (let hops = 0; name && name !== cast.idle && hops < 6; hops++) {
      const c: Clip | undefined = cast.clips[name];
      if (!c) break;
      const d = clipLength(c);
      out.push({ clip: name, start: t, end: t + d });
      t += d;
      name = c.next;
    }
  }
  return out;
}

/** which clip and which of its frames is on show at time t */
export function frameAt(cast: Cast, segs: Segment[], t: number): { clip: string; frame: number } {
  const total = segs.length ? segs[segs.length - 1].end : 0;
  const u = total > 0 ? ((t % total) + total) % total : 0;
  // (a binary search would do, but a timeline is a few dozen segments)
  let seg = segs[0];
  for (const s of segs) {
    if (u >= s.start && u < s.end) {
      seg = s;
      break;
    }
  }
  if (!seg) return { clip: cast.idle, frame: 0 };
  const c = cast.clips[seg.clip];
  if (!c || !c.frames.length) return { clip: cast.idle, frame: 0 };
  const i = Math.floor((u - seg.start) * c.fps);
  return { clip: seg.clip, frame: c.loop ? i % c.frames.length : Math.min(c.frames.length - 1, Math.max(0, i)) };
}
