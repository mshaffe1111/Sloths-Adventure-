/**
 * feelPair — the feel room's working parts (feelPairStage.ts; R-165.170): the speed sign at the pair's foot (a tap by it switches the
 * pair between its speeds) and the stopwatch (each climb timed from taking hold at its foot to standing on the bough).
 *
 * The engine makes one FeelRoom from the stage's `feelRoom` and calls `control` once a frame before Pokey moves (it may take the tap)
 * and `drawWorld` with the stage's scenery. The clock's lines live here (`feelClock`), and FeelPairClock.tsx shows them on the screen.
 * Nothing here allocates per frame: the lines are rebuilt only when a time changes by a tenth of a second.
 */
import type { PlayerState, Vine } from './types.ts';
import type { FeelRoomSpec } from './feelPairStage.ts';
import { CLIMB_SPEED, climbSpeedOf } from './vinePair.ts';
import { drawKitArt, kitArtReady, kitSize } from './puzzleArt.ts';
import { canvasLost } from './canvasLost.ts';

/** how near the sign he must stand for a tap to switch it (px from its post) */
export const SIGN_REACH = 60;
/** how near a climb's foot a hold must start for the climb to be timed (px over its bottom) */
const FOOT = 60;
/** the sign's size (times the kit's signpost) */
const SIGN_SCALE = 1.55;

export type ClimbKind = 'single' | 'pair';
/** one line of the stopwatch: what was climbed, its last time (null: not yet), and whether it is running now */
export interface ClockLine {
  label: string;
  secs: number | null;
  running: boolean;
}
/** what the screen shows: the lines, and the sign's speed now */
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
  readonly single: Vine;
  readonly pair: Vine;
  private speedAt = 0;
  /** the climb being timed: which, at what speed, and when it began */
  private run: { kind: ClimbKind; speed: number; t0: number } | null = null;
  private lastY = 0;
  /** the last time of each climb, by line key ('single', 'pair@2', 'pair@1.6') */
  private last = new Map<string, number>();
  /** when the sign was last switched (its little wobble) */
  private flippedAt = -10;
  private now = 0;

  constructor(readonly spec: FeelRoomSpec, vines: readonly Vine[]) {
    const s = vines.find((v) => v.id === spec.single);
    const p = vines.find((v) => v.id === spec.pair);
    if (!s || !p) throw new Error('feel room: its two climbs are not in the stage');
    this.single = s;
    this.pair = p;
    this.speedAt = Math.max(0, spec.speeds.indexOf(climbSpeedOf(p) / CLIMB_SPEED));
    clock = { lines: [], speed: this.speed, rev: clock.rev + 1 };
    this.publish();
  }

  /** the pair's speed now (times the single's) */
  get speed(): number {
    return this.spec.speeds[this.speedAt];
  }

  /** whether he stands where a tap switches the sign */
  bySign(p: PlayerState): boolean {
    return p.grounded && !p.climbing && Math.abs(p.x - this.spec.sign.x) <= SIGN_REACH && Math.abs(p.y - this.spec.sign.y) < 20;
  }

  /**
   * Once a frame, before he moves: a tap by the sign switches the pair's speed (returns true: the tap is taken, no punch), and the
   * stopwatch follows the climb he is on.
   */
  control(p: PlayerState, tap: boolean, t: number): { took: boolean } {
    this.now = t;
    let took = false;
    if (tap && this.bySign(p)) {
      this.speedAt = (this.speedAt + 1) % this.spec.speeds.length;
      this.pair.climbSpeed = CLIMB_SPEED * this.speed;
      this.flippedAt = t;
      took = true;
    }
    this.time(p, t);
    this.publish();
    return { took };
  }

  /** the stopwatch: starts as he climbs up from a climb's foot, stops when he stands on the bough, is dropped if he comes off below it */
  private time(p: PlayerState, t: number) {
    const on = p.climbing ? (Math.abs(p.x - this.single.x) < 1 ? this.single : Math.abs(p.x - this.pair.x) < 1 ? this.pair : null) : null;
    const goingUp = p.y < this.lastY - 0.5;
    this.lastY = p.y;
    if (!this.run && on && goingUp && p.y > on.bottomY - FOOT) {
      this.run = on === this.pair ? { kind: 'pair', speed: this.speed, t0: t } : { kind: 'single', speed: 1, t0: t };
      return;
    }
    if (!this.run || p.climbing) return;
    if (p.grounded && p.y <= this.spec.top + 8) {
      this.last.set(keyOf(this.run.kind, this.run.speed), t - this.run.t0);
      this.run = null;
    } else if (p.grounded || p.y > this.spec.top + 40) this.run = null;
  }

  /** the lines: the single, then the pair at each of the room's speeds */
  private publish() {
    const live = this.run ? this.now - this.run.t0 : 0;
    const lines: ClockLine[] = [];
    const add = (kind: ClimbKind, speed: number, label: string) => {
      const running = !!this.run && this.run.kind === kind && this.run.speed === speed;
      lines.push({ label, secs: running ? live : this.last.get(keyOf(kind, speed)) ?? null, running });
    };
    add('single', 1, 'One vine');
    // (in a fixed order, the room's: a line that jumped when the sign was switched read as a new time)
    for (const s of this.spec.speeds) add('pair', s, `Two vines ${speedLabel(s)}`);
    // (only a change a tenth of a second or more is a new picture)
    const same = clock.speed === this.speed && clock.lines.length === lines.length &&
      clock.lines.every((l, i) => l.label === lines[i].label && l.running === lines[i].running && tenths(l.secs) === tenths(lines[i].secs));
    if (same) return;
    clock = { lines, speed: this.speed, rev: clock.rev + 1 };
  }

  /** the sign at the pair's foot: the kit's painted signpost, its board lettered with the speed (baked once a speed: lettering()) */
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

const keyOf = (kind: ClimbKind, speed: number) => (kind === 'single' ? 'single' : `pair@${speed}`);
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
