/**
 * Shots: what makes a cutscene picture move. A scene can carry
 *  - a camera move (push in, pull out, pan) that runs over the picture's first seconds,
 *  - a timeline of painted poses for an actor (a punch, a stagger, a fall, a walk) with its movement between them,
 *  - effects at a moment (a flash, a shake, an impact burst, a puff of dust, dizzy stars, glints).
 * Everything here is a pure function of the time since the picture appeared, so the picture is the same every time it plays and a
 * slow frame never loses a beat. Times are in seconds.
 */

export interface Cam {
  zoom: number;
  /** 0..1 across and down the scene */
  fx: number;
  fy: number;
}

export interface CameraMove {
  from: Cam;
  to: Cam;
  /** seconds the move takes (it holds the end shot afterwards) */
  dur: number;
  delay?: number;
  ease?: Ease;
}

export type Ease = 'inOut' | 'in' | 'out' | 'linear';

/** one beat of an actor's performance: from `at` it shows `frame` and moves toward the offsets given here over `dur` seconds */
export interface PoseKey {
  at: number;
  /** a painted frame name, or several that play as a loop at `fps`. A list of walk or run frames that travels (`dx` with `dur`) is a gait: the frames follow the ground, not the clock. */
  frame?: string | string[];
  /** instead of a frame: a mood of the actor (storyActors.ts), played from the moment this beat starts */
  mood?: string;
  fps?: number;
  /** offset from the actor's place, as a share of the scene width / height; stays until a later key changes it */
  dx?: number;
  dy?: number;
  /** lean in radians (positive tips forward) */
  rot?: number;
  /** size multiplier */
  sc?: number;
  /** draw facing the other way from the actor's own facing */
  flip?: boolean;
  /** seconds to get to this key's offsets from the last key's (0 = at once) */
  dur?: number;
  ease?: Ease;
}

export type FxKind = 'flash' | 'shake' | 'burst' | 'dust' | 'stars' | 'glints';

export interface SceneFx {
  at: number;
  kind: FxKind;
  /** where, as a share of the scene (burst, dust, stars, glints) */
  x?: number;
  y?: number;
  /** how long it lasts (stars and glints last until the picture ends when unset) */
  dur?: number;
  /** strength: shake in px, flash opacity, burst size */
  amount?: number;
}

const clamp01 = (u: number) => Math.max(0, Math.min(1, u));
export function easeFn(u: number, e: Ease = 'inOut'): number {
  const x = clamp01(u);
  switch (e) {
    case 'linear': return x;
    case 'in': return x * x;
    case 'out': return 1 - (1 - x) * (1 - x);
    default: return x * x * (3 - 2 * x);
  }
}

/** where the camera is `t` seconds into a picture */
export function cameraAt(m: CameraMove, t: number): Cam {
  const u = m.dur <= 0 ? 1 : clamp01((t - (m.delay ?? 0)) / m.dur);
  const k = easeFn(u, m.ease);
  return {
    zoom: m.from.zoom + (m.to.zoom - m.from.zoom) * k,
    fx: m.from.fx + (m.to.fx - m.from.fx) * k,
    fy: m.from.fy + (m.to.fy - m.from.fy) * k,
  };
}

export interface PoseNow {
  /** the painted frame ('' when the beat is a mood) */
  frame: string;
  /** the mood the beat plays, and how long it has been playing (seconds) */
  mood?: string;
  since: number;
  /** a list of walk or run frames that travels: how far it has gone in this beat and how far it goes, as shares of the scene width, and how long it takes */
  travel?: { done: number; total: number; dur: number; frames: string[]; arrived: boolean };
  dx: number;
  dy: number;
  rot: number;
  sc: number;
  /** undefined = the actor's own facing */
  flip: boolean | undefined;
}

/** the pose and offsets of an actor `t` seconds into a picture (keys are in time order) */
export function poseAt(keys: PoseKey[], t: number): PoseNow {
  // the resolved values at the END of each key, carried forward from the one before
  let prev = { dx: 0, dy: 0, rot: 0, sc: 1, flip: undefined as boolean | undefined };
  let active = 0;
  for (let i = 0; i < keys.length; i++) if (keys[i].at <= t) active = i;
  let from = prev;
  let to = prev;
  for (let i = 0; i <= active; i++) {
    const k = keys[i];
    from = prev;
    to = {
      dx: k.dx ?? prev.dx,
      dy: k.dy ?? prev.dy,
      rot: k.rot ?? prev.rot,
      sc: k.sc ?? prev.sc,
      flip: k.flip ?? prev.flip,
    };
    prev = to;
  }
  const k = keys[active];
  const u = (k.dur ?? 0) <= 0 ? 1 : clamp01((t - k.at) / (k.dur as number));
  const e = easeFn(u, k.ease);
  let frame = '';
  let travel: PoseNow['travel'];
  if (Array.isArray(k.frame)) {
    const n = k.frame.length;
    frame = k.frame[Math.floor(Math.max(0, t - k.at) * (k.fps ?? 8)) % n];
    const total = Math.abs(to.dx - from.dx);
    if (total > 1e-4 && (k.dur ?? 0) > 0) {
      travel = { done: Math.abs(from.dx + (to.dx - from.dx) * e - from.dx), total, dur: k.dur as number, frames: k.frame, arrived: u >= 1 };
    }
  } else if (k.frame !== undefined) {
    frame = k.frame;
  }
  return {
    frame,
    mood: k.mood,
    since: Math.max(0, t - k.at),
    travel,
    dx: from.dx + (to.dx - from.dx) * e,
    dy: from.dy + (to.dy - from.dy) * e,
    rot: from.rot + (to.rot - from.rot) * e,
    sc: from.sc + (to.sc - from.sc) * e,
    flip: to.flip,
  };
}

/** how far the whole picture is shaken at this moment, in px */
export function shakeAt(fx: SceneFx[] | undefined, t: number): [number, number] {
  let x = 0;
  let y = 0;
  for (const f of fx ?? []) {
    if (f.kind !== 'shake') continue;
    const d = f.dur ?? 0.35;
    const u = (t - f.at) / d;
    if (u < 0 || u > 1) continue;
    const a = (f.amount ?? 8) * (1 - u) * (1 - u);
    x += Math.sin(t * 83 + f.at * 7) * a;
    y += Math.cos(t * 71 + f.at * 3) * a * 0.7;
  }
  return [x, y];
}

/** the white-out of an impact, 0..1 */
export function flashAt(fx: SceneFx[] | undefined, t: number): number {
  let a = 0;
  for (const f of fx ?? []) {
    if (f.kind !== 'flash') continue;
    const d = f.dur ?? 0.22;
    const u = (t - f.at) / d;
    if (u < 0 || u > 1) continue;
    a = Math.max(a, (f.amount ?? 0.85) * (1 - u));
  }
  return a;
}

/** draws the effects that live in the picture (burst, dust, stars, glints), in scene px */
export function drawFx(ctx: CanvasRenderingContext2D, fx: SceneFx[] | undefined, t: number, w: number, h: number) {
  for (const f of fx ?? []) {
    if (f.kind === 'flash' || f.kind === 'shake') continue;
    const age = t - f.at;
    if (age < 0) continue;
    const x = (f.x ?? 0.5) * w;
    const y = (f.y ?? 0.6) * h;
    ctx.save();
    ctx.translate(x, y);
    if (f.kind === 'burst') {
      // an impact star: spikes that shoot out and fade
      const d = f.dur ?? 0.45;
      const u = age / d;
      if (u > 1) { ctx.restore(); continue; }
      const size = (f.amount ?? 1) * 90;
      const r1 = size * (0.25 + 0.9 * easeFn(u, 'out'));
      ctx.globalAlpha = 1 - u;
      ctx.fillStyle = '#fff6c8';
      ctx.strokeStyle = '#ff9a2e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const n = 12;
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2 + 0.2;
        const r = i % 2 ? r1 * 0.42 : r1 * (0.8 + 0.3 * Math.sin(i * 2.7));
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (f.kind === 'dust') {
      // puffs that roll outward along the ground and thin out
      const d = f.dur ?? 1.1;
      const u = age / d;
      if (u > 1) { ctx.restore(); continue; }
      for (let i = 0; i < 9; i++) {
        const side = i % 2 ? 1 : -1;
        const reach = (28 + (i * 17) % 40) * easeFn(u, 'out');
        const rad = (10 + (i * 7) % 12) * (0.6 + u * 1.4);
        ctx.globalAlpha = 0.5 * (1 - u);
        ctx.fillStyle = '#e8dcc2';
        ctx.beginPath();
        ctx.arc(side * reach * (0.5 + i / 9), -rad * 0.4 - u * 18 * ((i % 3) + 1) * 0.5, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (f.kind === 'stars') {
      // dizzy stars circling a head
      const d = f.dur;
      if (d !== undefined && age > d) { ctx.restore(); continue; }
      const fade = d !== undefined ? clamp01((d - age) / 0.4) : 1;
      ctx.globalAlpha = Math.min(1, age / 0.25) * fade;
      for (let i = 0; i < 4; i++) {
        const a = age * 2.6 + (i / 4) * Math.PI * 2;
        const sx = Math.cos(a) * 46;
        const sy = Math.sin(a) * 12;
        const r = 7 + (Math.sin(a) > 0 ? 3 : 0);
        ctx.fillStyle = '#ffe36a';
        ctx.strokeStyle = '#d99a14';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * Math.PI * 2 - Math.PI / 2 + age * 2;
          const rr = k % 2 ? r * 0.45 : r;
          const px = sx + Math.cos(ang) * rr;
          const py = sy + Math.sin(ang) * rr;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (f.kind === 'glints') {
      // sparkles winking around a spot (a freed path, a reward)
      const d = f.dur;
      if (d !== undefined && age > d) { ctx.restore(); continue; }
      for (let i = 0; i < 6; i++) {
        const ph = (age * 0.9 + i * 0.37) % 1;
        const a = i * 2.4;
        const gx = Math.cos(a) * (30 + i * 9);
        const gy = Math.sin(a * 1.3) * (22 + i * 6) - ph * 24;
        const r = 9 * Math.sin(ph * Math.PI);
        ctx.globalAlpha = Math.sin(ph * Math.PI);
        ctx.fillStyle = '#fff7c4';
        ctx.beginPath();
        ctx.moveTo(gx, gy - r);
        ctx.lineTo(gx + r * 0.28, gy - r * 0.28);
        ctx.lineTo(gx + r, gy);
        ctx.lineTo(gx + r * 0.28, gy + r * 0.28);
        ctx.lineTo(gx, gy + r);
        ctx.lineTo(gx - r * 0.28, gy + r * 0.28);
        ctx.lineTo(gx - r, gy);
        ctx.lineTo(gx - r * 0.28, gy - r * 0.28);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
