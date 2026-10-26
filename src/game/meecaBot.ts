/**
 * meecaBot — a player for Meeca's stage (5-M), for the tests (meecaReal.test.ts) and the screenshot tool: it plays the real engine
 * (realPlay.ts) with the pad's controls and a thumb held still to carve, and reads only what a player can see on the screen: where the
 * trees, the ferns and her place in line are, and each watching guard's ring (how full it is, and whether he is turning or looking).
 *
 * It waits in line until the column halts by a tree with every ring low enough, slips out, carves, and when a ring is about to fill it
 * either crouches in a fern close by or runs back to her place. With `careless` it ignores the rings (to be caught, on purpose).
 */
import type { RealPlay, Pad } from './realPlay.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import { TELL, TURN_BACK, type MeecaTrunk } from './meecaStage.ts';

export interface BotLog {
  /** the frames, as the tests want them: time, her x, the phase, in line, the cuts so far */
  frames: Array<{ t: number; x: number; y: number; phase: string; inLine: boolean; done: number }>;
}

const RUN = 285;

type Mode = 'line' | 'out' | 'carve' | 'hide' | 'back';

export class MeecaBot {
  mode: Mode = 'line';
  readonly log: BotLog = { frames: [] };
  private tap = 0;
  private lastDone = 0;
  constructor(readonly sim: RealPlay, readonly careless = false) {}
  get mc(): MeecaPlay {
    return this.sim.e.mc as MeecaPlay;
  }

  /** the least time (s) before any watching guard on screen could start to look (0 if one is turning or looking now) */
  private safeFor(): number {
    const mc = this.mc;
    const s = mc.st.stretches[Math.min(mc.done, mc.st.stretches.length - 1)];
    let least = Infinity;
    for (const w of s.watch) {
      const st = mc.watchOf(w.who);
      if (!st) {
        least = Math.min(least, w.away - w.offset + TELL);
        continue;
      }
      if (st.ph === 'away') least = Math.min(least, (1 - st.k) * w.away + TELL);
      else if (st.ph === 'turn') least = Math.min(least, (1 - st.k) * TELL);
      else if (st.ph === 'back') least = Math.min(least, (1 - st.k) * TURN_BACK + w.away + TELL);
      else return 0;
    }
    return least;
  }
  /** every ring has just started over (a look is over): a fresh window */
  private freshWindow(need: number): boolean {
    return this.safeFor() > need;
  }

  private fernNear(): { x: number; y: number } | null {
    const p = this.sim.p;
    let best: { x: number; y: number } | null = null;
    for (const f of this.mc.st.ferns) {
      if (Math.abs(f.y - p.y) > 6 || Math.abs(f.x - p.x) > 150) continue;
      if (!best || Math.abs(f.x - p.x) < Math.abs(best.x - p.x)) best = f;
    }
    return best;
  }

  /** time to get out of sight from here: into a fern close by, or back into line */
  private escape(): { kind: 'hide' | 'back'; s: number } {
    const p = this.sim.p;
    const f = this.fernNear();
    const back = (Math.abs(this.mc.slotX - p.x) + (p.y < 560 ? 160 : 0)) / RUN + 0.45;
    if (f) {
      const hide = Math.abs(f.x - p.x) / RUN + 0.25;
      if (hide < back) return { kind: 'hide', s: hide };
    }
    return { kind: 'back', s: back };
  }

  /** go toward x on the ground (or the branch she is on) */
  private toward(x: number, pad: Pad) {
    const p = this.sim.p;
    if (x < p.x - 6) pad.left = true;
    else if (x > p.x + 6) pad.right = true;
  }

  /** where she stands to carve this tree, and the way there (up the tree first, for the one on a branch) */
  private approach(tr: MeecaTrunk, pad: Pad): boolean {
    const p = this.sim.p;
    if (tr.climb) {
      const onBranch = Math.abs(p.y - tr.standY) < 4 && p.grounded;
      if (!onBranch) {
        if (p.climbing) {
          pad.up = true;
          if (p.y <= tr.standY + 4) pad.right = true;
          return false;
        }
        if (Math.abs(p.x - tr.climb.treeX) > 10) this.toward(tr.climb.treeX, pad);
        else pad.up = true;
        return false;
      }
    }
    if (Math.abs(p.x - tr.standX) > 8) {
      this.toward(tr.standX, pad);
      return false;
    }
    return true;
  }

  /** one frame */
  step() {
    const sim = this.sim;
    const mc = this.mc;
    const p = sim.p;
    const pad: Pad = {};
    if (mc.phase === 'card') {
      if (mc.t > 1.2) pad.punch = true;
    } else if (mc.phase === 'ending') {
      if (++this.tap % 24 === 0) pad.punch = true;
    } else if (mc.phase === 'play') {
      const tr = mc.next;
      const free = this.careless ? Infinity : this.safeFor();
      if (mc.done === 0 && tr) {
        // the opening: finish the 5-1 carving where she stands
        if (this.approach(tr, pad)) pad.hold = true;
      } else if (this.mode === 'line') {
        const halted = tr && !mc.marching && mc.slotX >= tr.x + tr.haltPast - 1;
        if (!mc.inLine) this.mode = 'back';
        else if (tr && halted) {
          const need = (Math.abs(mc.slotX - tr.standX) + (tr.climb ? 260 : 0)) / RUN + 1.2;
          if (this.careless || this.freshWindow(need + 1.2)) this.mode = 'out';
        }
      }
      // a warning finished: back to her place
      if (mc.done !== this.lastDone) {
        if (this.lastDone >= 1 && this.mode !== 'line') this.mode = 'back';
        this.lastDone = mc.done;
      }
      if (mc.done > 0 && tr && this.mode !== 'line') {
        const esc = this.escape();
        if ((this.mode === 'out' || this.mode === 'carve') && free < esc.s + 0.35) this.mode = esc.kind;
        if (this.mode === 'out') {
          if (this.approach(tr, pad)) this.mode = 'carve';
        }
        if (this.mode === 'carve') {
          if (this.approach(tr, pad)) pad.hold = true;
        }
        if (this.mode === 'hide') {
          const f = this.fernNear();
          if (!f) this.mode = 'back';
          else if (Math.abs(f.x - p.x) > 12) this.toward(f.x, pad);
          else pad.down = true;
          // the look is over and every ring has started again: out again
          const tr2 = mc.next;
          if (tr2 && this.safeFor() > Math.abs(tr2.standX - p.x) / RUN + this.escape().s + 1.0) this.mode = 'out';
        }
        if (this.mode === 'back') {
          if (mc.inLine) this.mode = 'line';
          else if (p.climbing) pad.down = true;
          else this.toward(mc.slotX, pad);
        }
      }
      if (mc.done > 0 && !mc.inLine && this.mode === 'line') this.mode = 'back';
    }
    sim.frame(pad);
    this.log.frames.push({ t: mc.t, x: p.x, y: p.y, phase: mc.phase, inLine: mc.inLine, done: mc.done });
  }

  /** play to the clear (or `maxS` seconds) */
  play(maxS = 400): boolean {
    for (let i = 0; i < maxS * 30 && this.mc.phase !== 'done'; i++) this.step();
    return this.mc.phase === 'done';
  }
}
