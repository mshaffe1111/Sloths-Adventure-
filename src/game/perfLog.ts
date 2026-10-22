/**
 * perfLog — a frame-time check for hunting slowdowns on a real phone (off unless switched on in the menu).
 *
 * It keeps: how long each frame took (a rolling window), every freeze longer than HITCH_MS with what the game was doing, a timeline
 * (every 10 s: average frame time, memory, live particles) so a slowdown that GROWS through a stage shows as a rising line, and a few
 * notes (stage start, a painted sheet becoming ready). Pure: the engine feeds it, the readout panel shows it.
 */

export const HITCH_MS = 100;
const WINDOW = 300;
const MAX_HITCHES = 14;
const MAX_NOTES = 16;
const MAX_SAMPLES = 60;
const SAMPLE_EVERY_MS = 10_000;

export interface Hitch {
  /** seconds since the stage started */
  at: number;
  gap: number;
  upd: number;
  rnd: number;
  what: string;
}
export interface Sample {
  at: number;
  avg: number;
  worst: number;
  heapMB: number | null;
  parts: number;
}
export interface Note {
  at: number;
  msg: string;
}
export interface FrameInfo {
  what: string;
  parts: number;
}

export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function heapMB(): number | null {
  const m = (typeof performance !== 'undefined' ? (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory : undefined);
  return m ? Math.round((m.usedJSHeapSize / 1048576) * 10) / 10 : null;
}

export class PerfLog {
  private gaps: number[] = [];
  private t0 = 0;
  private lastSample = 0;
  private winSum = 0;
  private winN = 0;
  private winWorst = 0;
  hitches: Hitch[] = [];
  hitchCount = 0;
  frames = 0;
  samples: Sample[] = [];
  notes: Note[] = [];

  reset(now = 0) {
    this.gaps = [];
    this.t0 = now;
    this.lastSample = now;
    this.winSum = this.winN = this.winWorst = 0;
    this.hitches = [];
    this.hitchCount = 0;
    this.frames = 0;
    this.samples = [];
    this.notes = [];
  }

  /** one frame: `gap` ms since the last frame, `upd`/`rnd` ms spent in our own update and draw, `now` the clock, `info` asked for only when needed */
  record(gap: number, upd: number, rnd: number, now: number, info: () => FrameInfo) {
    this.frames++;
    this.gaps.push(gap);
    if (this.gaps.length > WINDOW) this.gaps.shift();
    this.winSum += gap;
    this.winN++;
    if (gap > this.winWorst) this.winWorst = gap;
    if (gap > HITCH_MS) {
      this.hitchCount++;
      this.hitches.push({ at: (now - this.t0) / 1000, gap: Math.round(gap), upd: Math.round(upd * 10) / 10, rnd: Math.round(rnd * 10) / 10, what: info().what });
      if (this.hitches.length > MAX_HITCHES) this.hitches.shift();
    }
    if (now - this.lastSample >= SAMPLE_EVERY_MS) {
      this.samples.push({ at: Math.round((now - this.t0) / 1000), avg: Math.round((this.winSum / Math.max(1, this.winN)) * 10) / 10, worst: Math.round(this.winWorst), heapMB: heapMB(), parts: info().parts });
      if (this.samples.length > MAX_SAMPLES) this.samples.shift();
      this.lastSample = now;
      this.winSum = this.winN = this.winWorst = 0;
    }
  }

  note(msg: string, now: number) {
    this.notes.push({ at: Math.round(((now - this.t0) / 1000) * 10) / 10, msg });
    if (this.notes.length > MAX_NOTES) this.notes.shift();
  }

  /** seconds since the stage started, and the average of the last second's frames (what a screen recording should show) */
  live(now: number) {
    const last = this.gaps.slice(-30);
    const avg = last.length ? last.reduce((x, y) => x + y, 0) / last.length : 0;
    return { secs: Math.max(0, Math.round((now - this.t0) / 1000)), recent: Math.round(avg), heap: heapMB() };
  }

  stats() {
    const s = [...this.gaps].sort((a, b) => a - b);
    const avg = s.length ? s.reduce((x, y) => x + y, 0) / s.length : 0;
    return { fps: avg > 0 ? Math.round(1000 / avg) : 0, p50: Math.round(percentile(s, 0.5)), p95: Math.round(percentile(s, 0.95)), max: Math.round(s[s.length - 1] ?? 0), hitches: this.hitchCount, frames: this.frames };
  }

  /** plain text to paste or screenshot */
  report(header = ''): string {
    const st = this.stats();
    const lines: string[] = [];
    if (header) lines.push(header);
    lines.push(`frames ${st.frames}, now ${st.fps} fps (median ${st.p50} ms, 95th ${st.p95} ms, worst ${st.max} ms), freezes over ${HITCH_MS} ms: ${st.hitches}`);
    if (this.samples.length) {
      lines.push('every 10 s: time, average ms, worst ms, memory MB, particles');
      for (const x of this.samples) lines.push(`${x.at}s  avg ${x.avg}  worst ${x.worst}  mem ${x.heapMB ?? '?'}  parts ${x.parts}`);
    }
    if (this.hitches.length) {
      lines.push('freezes: time, length, our update ms / draw ms, what was happening');
      for (const h of this.hitches) lines.push(`${h.at.toFixed(1)}s  ${h.gap} ms  upd ${h.upd} / draw ${h.rnd}  ${h.what}`);
    }
    if (this.notes.length) {
      lines.push('notes:');
      for (const n of this.notes) lines.push(`${n.at}s  ${n.msg}`);
    }
    return lines.join('\n');
  }
}

export const perfLog = new PerfLog();

declare const __PERF_DEFAULT__: boolean | undefined;

let on: boolean | null = null;
export function perfEnabled(): boolean {
  if (on !== null) return on;
  // off, except in the test (artifact) build, where it starts on so a screen recording shows the numbers; the menu switch overrides it either way
  let v = typeof __PERF_DEFAULT__ !== 'undefined' && __PERF_DEFAULT__ === true;
  try {
    const s = localStorage.getItem('sloth_perf');
    if (s === 'on') v = true;
    else if (s === 'off') v = false;
  } catch {
    /* no storage: keep the default */
  }
  on = v;
  return v;
}
export function setPerfPref(v: boolean) {
  on = v;
  try {
    localStorage.setItem('sloth_perf', v ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('sloth-perf'));
}

/** a note from anywhere (a sheet became ready, a stage began); free when the check is off */
export function perfNote(msg: string) {
  if (perfEnabled() && typeof performance !== 'undefined') perfLog.note(msg, performance.now());
}
