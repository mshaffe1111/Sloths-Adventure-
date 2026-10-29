/**
 * touchRig — the whole touch chain with no screen, for the control tests (polish report Build 2, 2026-10-29): scripted fingers go into
 * the real recogniser (touchGestures.ts), which drives the real InputEngine (its minimum jump hold, its buffers), which the real engine
 * (realPlay.ts) reads at its locked 30 fps. Time is a virtual clock shared by all three, so a finger lifted 10 ms before a frame reaches
 * the engine before that frame, as it does on a phone.
 *
 * It wires the recogniser exactly as TouchController.tsx does (the same sink and the same questions to the game). Nothing in the game
 * imports this file.
 */
import './headlessDom.ts';
import { RealPlay, DT } from './realPlay.ts';
import { InputEngine } from './inputEngine.ts';
import { TouchGestures, type GestureSink } from './touchGestures.ts';
import { refinedControls } from './refinedControls.ts';
import { jumpHelp } from './jumpHelp.ts';

// ───────────────────────────── the virtual clock ─────────────────────────────

let clock = 0;
let timerSeq = 1;
const timers = new Map<number, { at: number; fn: () => void }>();
const w = (globalThis as unknown as { window: Record<string, unknown> }).window;
Object.defineProperty(globalThis.performance, 'now', { value: () => clock, configurable: true, writable: true });
w.setTimeout = (fn: () => void, ms = 0) => {
  const id = timerSeq++;
  timers.set(id, { at: clock + Math.max(0, ms), fn });
  return id;
};
w.clearTimeout = (id: number) => void timers.delete(id);

const FRAME_MS = 1000 / 30;
const TICK_MS = 30;

/** one finger's event: down, move, up or cancel, at a time in ms */
export interface TouchEv {
  t: number;
  k: 'd' | 'm' | 'u' | 'c';
  id: number;
  x: number;
  y: number;
}

/** a stroke through waypoints [ms, x, y], sampled every `every` ms as a phone reports it; `lift` ends it with the finger up */
export function stroke(id: number, pts: Array<[number, number, number]>, lift = true, every = 8): TouchEv[] {
  const out: TouchEv[] = [{ t: pts[0][0], k: 'd', id, x: pts[0][1], y: pts[0][2] }];
  for (let i = 1; i < pts.length; i++) {
    const [t0, x0, y0] = pts[i - 1];
    const [t1, x1, y1] = pts[i];
    const n = Math.max(1, Math.round((t1 - t0) / every));
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      out.push({ t: t0 + (t1 - t0) * f, k: 'm', id, x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f });
    }
  }
  const last = pts[pts.length - 1];
  if (lift) out.push({ t: last[0], k: 'u', id, x: last[1], y: last[2] });
  return out;
}

export class TouchRig {
  readonly r: RealPlay;
  readonly input: InputEngine;
  readonly g: TouchGestures;
  /** every decision the recogniser made, with the time */
  readonly said: Array<{ t: number; what: string; arg?: unknown }> = [];
  private queue: TouchEv[] = [];
  private nextFrame: number;
  private nextTick: number;
  /** frames run so far */
  frames = 0;

  constructor(stage = '1-1', seed = 1, readonly width = 1034) {
    this.r = new RealPlay(stage, seed);
    const inp = new InputEngine();
    inp.source = 'gesture';
    this.input = inp;
    this.r.e.input = inp;
    const say = (what: string, arg?: unknown) => this.said.push({ t: clock, what, arg });
    const sink: GestureSink = {
      move: (d) => (say('move', d), inp.triggerTouchMove(d)),
      duck: (on) => (say('duck', on), inp.triggerTouchDuck(on)),
      jumpPress: (lean) => (say('jump', lean ?? 0), inp.triggerTouchUp(lean ?? 0)),
      jumpRelease: () => (say('jumpUp'), inp.releaseTouchUp()),
      punch: () => (say('punch'), inp.triggerTouchPunch()),
      kick: (dir) => (say('kick', dir ?? 0), inp.triggerTouchKick(dir ?? 0)),
      mega: () => (say('mega'), inp.triggerTouchMega()),
      climb: (d) => (say('climb', d), inp.triggerTouchClimb(d)),
      feedback: () => {},
    };
    this.g = new TouchGestures(sink, () => this.width, {
      assist: () => jumpHelp() !== 'off', air: () => inp.airJumpReady, megaReady: () => inp.megaReady, refined: refinedControls,
      kickNear: () => inp.kickNear, onVine: () => inp.onVine, onSwing: () => inp.onSwing, onRope: () => inp.onRope, inCover: () => inp.inCover,
    });
    inp.onFocusLost = () => this.g.cancelAll();
    inp.onCleared = () => this.g.cancelAll();
    this.nextFrame = clock + FRAME_MS;
    this.nextTick = clock + TICK_MS;
  }

  get now(): number {
    return clock;
  }
  get p() {
    return this.r.p;
  }

  /** drop every held input and finger (after placing him) */
  clear() {
    this.input.clearAll();
    this.queue = [];
    this.said.length = 0;
  }

  /** queue finger events, their times measured from now */
  push(evs: TouchEv[]) {
    const t0 = clock;
    for (const e of evs) this.queue.push({ ...e, t: t0 + e.t });
    this.queue.sort((a, b) => a.t - b.t);
  }

  /** run the clock this many ms: finger events, the recogniser's ticks, timers and engine frames, in time order */
  run(ms: number, onFrame?: () => void) {
    const end = clock + ms;
    for (;;) {
      const ev = this.queue[0];
      let timer: { id: number; at: number } | null = null;
      for (const [id, tm] of timers) if (!timer || tm.at < timer.at) timer = { id, at: tm.at };
      const tEv = ev ? ev.t : Infinity;
      const tTm = timer ? timer.at : Infinity;
      const next = Math.min(tEv, tTm, this.nextTick, this.nextFrame);
      if (next > end) break;
      clock = next;
      if (tEv === next) {
        this.queue.shift();
        if (ev.k === 'd') this.g.down(ev.id, ev.x, ev.y, clock);
        else if (ev.k === 'm') this.g.move(ev.id, ev.x, ev.y, clock);
        else if (ev.k === 'u') this.g.up(ev.id, ev.x, ev.y, clock);
        else this.g.cancelFinger(ev.id, clock);
      } else if (tTm === next && timer) {
        const tm = timers.get(timer.id)!;
        timers.delete(timer.id);
        tm.fn();
      } else if (this.nextTick === next) {
        this.nextTick += TICK_MS;
        if (this.g.active) this.g.tick(clock);
      } else {
        this.nextFrame += FRAME_MS;
        this.r.e.update(DT);
        this.frames++;
        onFrame?.();
      }
    }
    clock = end;
  }

  /** run until the engine has run this many frames more */
  runFrames(n: number, onFrame?: () => void) {
    const target = this.frames + n;
    while (this.frames < target) this.run(Math.max(1, this.nextFrame - clock + 0.001), onFrame);
  }

  /** the decisions said so far, as short words ("move:right", "jump:0", ...) */
  words(): string[] {
    return this.said.map((s) => (s.arg === undefined ? s.what : `${s.what}:${String(s.arg)}`));
  }
}
