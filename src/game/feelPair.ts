/**
 * feelPair — the feel room's working parts (feelPairStage.ts: the vine field test, R-165.177): the sign at the field's foot (a tap by it
 * switches the one-hand slide between its speeds, on every field vine) and the stopwatch (each climb timed, up from the floor to standing
 * on a bough, or down from the top to the floor, filed under one hand or two by how he spent most of it).
 *
 * The engine makes one FeelRoom from the stage's `feelRoom` and calls `control` once a frame before Pokey moves (it may take the tap)
 * and `drawWorld` with the stage's scenery. The clock's lines live here (`feelClock`), and FeelPairClock.tsx shows them on the screen.
 * Nothing here allocates per frame: the lines are rebuilt only when a time changes by a tenth of a second.
 */
import type { PlayerState, Vine } from './types.ts';
import type { FeelRoomSpec } from './feelPairStage.ts';
import { drawKitArt, kitArtReady, kitSize } from './puzzleArt.ts';
import { canvasLost } from './canvasLost.ts';

/** how near the sign he must stand for a tap to switch it (px from its post) */
export const SIGN_REACH = 60;
/** how near a climb's foot a hold must start for the climb to be timed (px over its bottom) */
const FOOT = 60;
/** the sign's size (times the kit's signpost) */
const SIGN_SCALE = 1.55;

/** up or down, and on one hand or two */
export type ClimbKind = 'up1' | 'up2' | 'down1' | 'down2';
/** one line of the stopwatch: what was climbed, its last time (null: not yet), and whether it is running now */
export interface ClockLine {
  label: string;
  secs: number | null;
  running: boolean;
}
/** what the screen shows: the lines, and the sign's slide now */
export interface FeelClock {
  lines: ClockLine[];
  speed: number;
  /** bumps whenever anything on it changes (the screen redraws only then) */
  rev: number;
}

/** the stopwatch as the screen shows it (one room at a time; reset when a room is made) */
let clock: FeelClock = { lines: [], speed: 2, rev: 0 };
export const feelClock = (): FeelClock => clock;

/** "2x", "1.6x" */
export const speedLabel = (k: number): string => `${Number(k.toFixed(2))}×`;

export class FeelRoom {
  readonly field: Vine[];
  private speedAt = 0;
  /** the climb being timed: up or down, the slide then, when it began, and how long of it was on two hands */
  private run: { up: boolean; speed: number; t0: number; two: number } | null = null;
  private lastY = 0;
  private lastT = 0;
  /** the last time of each climb, by line key */
  private last = new Map<string, number>();
  /** when the sign was last switched (its little wobble) */
  private flippedAt = -10;
  private now = 0;
  private readonly floor: number;

  constructor(readonly spec: FeelRoomSpec, vines: readonly Vine[]) {
    this.field = spec.field.map((id) => {
      const v = vines.find((q) => q.id === id);
      if (!v || !v.field) throw new Error('feel room: a field vine is not in the stage');
      return v;
    });
    this.floor = Math.max(...this.field.map((v) => v.bottomY));
    const at = this.field[0].field;
    this.speedAt = Math.max(0, spec.speeds.indexOf(typeof at === 'object' && at.slide !== undefined ? at.slide : spec.speeds[0]));
    clock = { lines: [], speed: this.speed, rev: clock.rev + 1 };
    this.publish();
  }

  /** the one-hand slide now (times the climb speed) */
  get speed(): number {
    return this.spec.speeds[this.speedAt];
  }

  /** whether he stands where a tap switches the sign */
  bySign(p: PlayerState): boolean {
    return p.grounded && !p.climbing && Math.abs(p.x - this.spec.sign.x) <= SIGN_REACH && Math.abs(p.y - this.spec.sign.y) < 20;
  }

  /**
   * Once a frame, before he moves: a tap by the sign switches the slide (returns true: the tap is taken, no punch), and the stopwatch
   * follows the climb he is on.
   */
  control(p: PlayerState, tap: boolean, t: number): { took: boolean } {
    this.now = t;
    let took = false;
    if (tap && this.bySign(p)) {
      this.speedAt = (this.speedAt + 1) % this.spec.speeds.length;
      for (const v of this.field) v.field = { ...(typeof v.field === 'object' ? v.field : {}), slide: this.speed };
      this.flippedAt = t;
      took = true;
    }
    this.time(p, t);
    this.publish();
    return { took };
  }

  /** the stopwatch: up from the floor to a bough, or down from a bough's height to the floor; dropped if he comes off between */
  private time(p: PlayerState, t: number) {
    const dt = t - this.lastT;
    this.lastT = t;
    const dy = p.y - this.lastY;
    this.lastY = p.y;
    const top = this.spec.top;
    if (this.run && p.climbing && (p.climbPair ?? 0) > 0) this.run.two += dt;
    // (a climb that turns back is no climb: dropped, and the way back may be timed from here)
    if (this.run && p.climbing && (this.run.up ? dy > 0.5 : dy < -0.5)) this.run = null;
    if (!this.run) {
      if (p.climbing && dy < -0.5 && p.y > this.floor - FOOT) this.run = { up: true, speed: this.speed, t0: t, two: 0 };
      else if (p.climbing && dy > 0.5 && p.y < top + FOOT) this.run = { up: false, speed: this.speed, t0: t, two: 0 };
      return;
    }
    if (p.climbing) return;
    const r = this.run;
    const secs = t - r.t0;
    const two = r.two > secs / 2;
    if (r.up && p.grounded && p.y <= top + 8) this.last.set(two ? 'up2' : 'up1', secs);
    // (down: he steps off the vine's foot a few px over the floor, not yet grounded: engine.ts Exit B)
    else if (!r.up && p.y >= this.floor - 12) this.last.set(two ? 'down2' : `down1@${r.speed}`, secs);
    if (p.grounded || !r.up) this.run = null;
  }

  /** the lines, in a fixed order (a line that jumped when the sign was switched read as a new time) */
  private publish() {
    const live = this.run ? this.now - this.run.t0 : 0;
    const lines: ClockLine[] = [];
    const runKey = this.run ? (this.run.up ? (this.run.two > live / 2 ? 'up2' : 'up1') : this.run.two > live / 2 ? 'down2' : `down1@${this.run.speed}`) : '';
    const add = (key: string, label: string) => {
      const running = key === runKey;
      lines.push({ label, secs: running ? live : this.last.get(key) ?? null, running });
    };
    add('up1', 'Up, one hand');
    add('up2', 'Up, two hands');
    for (const s of this.spec.speeds) add(`down1@${s}`, `Slide down ${speedLabel(s)}`);
    add('down2', 'Down, two hands');
    // (only a change a tenth of a second or more is a new picture)
    const same = clock.speed === this.speed && clock.lines.length === lines.length &&
      clock.lines.every((l, i) => l.label === lines[i].label && l.running === lines[i].running && tenths(l.secs) === tenths(lines[i].secs));
    if (same) return;
    clock = { lines, speed: this.speed, rev: clock.rev + 1 };
  }

  /** the sign at the field's foot: the kit's painted signpost, its board lettered with the slide (baked once a speed: lettering()) */
  drawWorld(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number }) {
    const { x, y } = this.spec.sign;
    if (x < view.x0 - 100 || x > view.x1 + 100 || !kitArtReady()) return;
    // (a little knock on its nail when switched)
    const since = t - this.flippedAt;
    const rot = since >= 0 && since < 0.45 ? Math.sin(since * 40) * 0.08 * (1 - since / 0.45) : 0;
    drawKitArt(ctx, 'sign', x, y, { scale: SIGN_SCALE, rot });
    const board = lettering(speedLabel(this.speed));
    if (!board) return;
    const { w, h } = kitSize('sign', SIGN_SCALE);
    // (the board is the sign's upper 60%: its middle at 36% of the height from the top)
    ctx.save();
    ctx.translate(x, y - h * 0.64);
    if (rot) ctx.rotate(rot);
    const bw = w * 0.8;
    const bh = (bw * board.height) / board.width;
    ctx.drawImage(board, -bw / 2, -bh / 2, bw, bh);
    ctx.restore();
  }
}

const tenths = (s: number | null) => (s === null ? -1 : Math.floor(s * 10));

/** the speed lettered as if burnt into the board (baked once per label, again if the phone takes the canvas back: LESSONS D6, and once
 *  more when the game's display font arrives, if it was baked before it had) */
const letters = new Map<string, { c: HTMLCanvasElement; font: boolean }>();
const SIGN_FONT = '60px "Cherry Bomb One", "Outfit", sans-serif';
const fontIn = (): boolean => {
  try {
    return typeof document.fonts?.check !== 'function' || document.fonts.check(SIGN_FONT);
  } catch {
    return true;
  }
};
/** the board's lettering for `label`: `make` gives a canvas, `fontReady` says whether the display font is in (a test gives both) */
export function letteringFrom(label: string, make: () => HTMLCanvasElement, fontReady: () => boolean): HTMLCanvasElement | null {
  const had = letters.get(label);
  const lost = !!had && canvasLost(had.c, 'feel sign lettering');
  if (had && !lost && (had.font || !fontReady())) return had.c;
  // (the same canvas again when only the font changed; a fresh one when the phone took it back)
  const c = had && !lost ? had.c : make();
  c.width = 160;
  c.height = 80;
  const g = c.getContext('2d');
  if (!g) return null;
  g.clearRect(0, 0, c.width, c.height);
  g.font = SIGN_FONT;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // a pale cut edge under dark burnt letters, so it reads on the wood at a glance
  g.fillStyle = 'rgba(255, 236, 200, 0.55)';
  g.fillText(label, 80, 43);
  g.fillStyle = '#2b1608';
  g.fillText(label, 80, 40);
  letters.set(label, { c, font: fontReady() });
  return c;
}
function lettering(label: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  return letteringFrom(label, () => document.createElement('canvas'), fontIn);
}
