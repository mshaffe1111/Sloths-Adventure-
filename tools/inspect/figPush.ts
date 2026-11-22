/**
 * figPush — what the first-timer and tier bots (firsttimer.ts) do in a vine field (1-4.md; vineField.ts, fieldPlay.ts, podfall.ts),
 * as a player who has been told the field's two lines ("Reach for the next vine!", "Climb under the figs and push them free!"):
 *   - under a shut gate (its bough is no footing until its figs are freed), he goes for the nearest snagged fig bunch on it: down his
 *     own vine until his hands are under it, across vine by vine (Matt's rule: a push toward the next vine takes it in the other hand,
 *     again lets go of the old), then up under it until it tears free; then the next, until the bough springs open;
 *   - a pod's tell on a column he holds: he steps a vine over, to one no pod is telling or falling on, and waits there for it to drop
 *     (the tier's reaction comes first: `react` s after the tell starts).
 * Anywhere else it hands back null, and the bot climbs as it always did. No stage, seed or x here: everything is read off the engine.
 */
import type { Pad } from '../../src/game/realPlay.ts';
import type { PlayerState, Vine } from '../../src/game/types.ts';
import type { ClockRead } from '../../src/game/clock.ts';
import { HANDS_UP, gateLeft, type ClusterGate, type Hands, type VineCluster } from '../../src/game/vineField.ts';
import { podAt, type PodColumn } from '../../src/game/podfall.ts';

/** what figPush reads off the engine (its private fields, read as data: firsttimer.ts hands it the engine) */
export interface FieldView {
  hands: Hands | null;
  clusters: VineCluster[];
  vines: Vine[];
  field: { gates: readonly ClusterGate[]; pods: readonly PodColumn[]; blocksTop(v: Vine): boolean; capY(x: number, y: number): number } | null;
  clock: { read(id: string, shift?: number): ClockRead };
  /** seconds a pod's knock still keeps the climbs out of his hands (engine.ts knocked): > 0 just after a knock */
  knocked?: number;
}

/** how far below a fig bunch his hands go before he steps across to its vine (px) */
const UNDER = 34;
/** a push is a press and a let-go: the frames each lasts (the engine steps on the press, engine.ts sideLatch) */
const PRESS = 3;
/** s of pressing down without moving before he takes the way across instead */
const DOWN_STALL = 0.6;

export class FigPush {
  private target: VineCluster | null = null;
  private pressT = 0;
  private dodgeUntil = -1;
  private seenTell = new Map<number, number>();
  /** when it last acted (a push, a step aside, a climb for a fig) and when a pod last knocked him off */
  private lastAct = -1e9;
  private lastKnock = -1e9;
  /** where he last moved and when (a push or a climb that does not move him is stalled) */
  private movedAt = { x: -1e9, y: -1e9, t: 0 };

  /** it is at work (going for a fig, or stepping off a pod's column): the bot's no-progress clock is not running (firsttimer.ts) */
  busy(t: number): boolean {
    return !!this.target || t - this.lastAct < 4;
  }

  /** when the field last moved under his work (a fig bunch torn free or gone, a gate sprung open): the bot's no-progress clock lets his
   *  work off only while it gets somewhere (firsttimer.ts figsWork; BUILD-26l, 1-4 adult N 39's shuffle under a gate, 1200 s) */
  changedAt = -1e9;
  private sig = -1;

  /** a knock read off the engine (FieldView.knocked) on any frame, climbing or not: the knock's own frame takes him off the vine */
  sawKnock(knocked: number | undefined, t: number): void {
    if ((knocked ?? 0) > 0) this.lastKnock = t;
  }

  /** a pod knocked him off in the last few seconds: a fall that is a hit, not a missed climb (the bot's fell-back count leaves it out) */
  knockedRecently(t: number): boolean {
    return t - this.lastKnock < 6;
  }
  /** `react`: seconds from a pod's tell starting to his step aside (the tier's reaction; Infinity: he never dodges) */
  constructor(private readonly react = 0.45) {}

  /** a push toward `dir`, alternating press and let-go so each press is a new step (null between presses) */
  private push(dir: -1 | 1): Pad {
    this.pressT++;
    const on = this.pressT % (2 * PRESS) < PRESS;
    return on ? (dir > 0 ? { right: true } : { left: true }) : {};
  }

  /** the snagged figs that hold a shut gate */
  private held(v: FieldView): VineCluster[] {
    if (!v.field) return [];
    const out: VineCluster[] = [];
    for (const g of v.field.gates) {
      if (gateLeft(g, v.clusters) === 0) continue;
      for (const id of g.clusters) {
        const c = v.clusters.find((q) => q.id === id && !q.falling && !q.gone);
        if (c) out.push(c);
      }
    }
    return out;
  }

  /** this frame's thumb, or null (the bot's own climb) */
  step(v: FieldView, p: PlayerState, t: number): Pad | null {
    if ((v.knocked ?? 0) > 0) this.lastKnock = t;
    if (v.field) {
      const sig = v.clusters.filter((c) => c.falling || c.gone).length * 1000 + v.field.gates.filter((g) => gateLeft(g, v.clusters) === 0).length;
      if (sig !== this.sig) {
        if (this.sig >= 0) this.changedAt = t;
        this.sig = sig;
      }
    }
    if (Math.abs(p.x - this.movedAt.x) > 2 || Math.abs(p.y - this.movedAt.y) > 2) this.movedAt = { x: p.x, y: p.y, t };
    const pad = this.choose(v, p, t);
    if (pad) this.lastAct = t;
    return pad;
  }

  private choose(v: FieldView, p: PlayerState, t: number): Pad | null {
    if (!p.climbing || !v.hands || !v.field) {
      this.target = null;
      return null;
    }
    const h = v.hands;
    const holds = (id: number) => h.a.id === id || h.b?.id === id;
    // a pod telling or falling on a column he holds (and over him): step aside, toward a free vine
    const threat = this.podOn(v, p, t, holds);
    if (threat !== null || t < this.dodgeUntil) {
      if (threat !== null) this.dodgeUntil = t + 0.6;
      const dir = this.freeSide(v, p, t, h);
      if (dir !== 0 && (h.b || this.sideVine(v, h.a, dir, p.y))) return this.push(dir);
      return {};
    }
    // the figs: only under a shut gate's bough, or on the way to one already chosen, and only one on a vine he can reach from his hands'
    // row (one he holds, or one spanning the height his hands are at: the way across to it his own). A fall off the gate's row with the
    // target held left him pushing left and right between two vines of a lower row under its x for ever, the no-progress clock held by
    // the target, until a rescue (BUILD-26m/n, 1-4 adult N 9 and expert N 20 at x 871, child N 38); out of reach, his own climb takes him
    const reach = (c: VineCluster) => {
      const cv = v.vines.find((q) => q.id === c.vine);
      return !!cv && (holds(cv.id) || (p.y >= cv.topY - 4 && p.y <= cv.bottomY + 4));
    };
    if (this.target && !this.target.falling && !this.target.gone && !reach(this.target)) this.target = null;
    if (!this.target || this.target.falling || this.target.gone) {
      this.target = null;
      const top = h.b && h.b.topY > h.a.topY ? h.b : h.a;
      // (stuck at the climb's stop: the vine's top, or, under a shut gate, where his drawn head meets the bough: fieldPlay.ts capY)
      const stop = Math.max(top.topY, v.field.capY(p.x, p.y));
      const stuck = p.y <= stop + 16 && v.field.blocksTop(top);
      if (!stuck) return null;
      let best: VineCluster | null = null, bd = Infinity;
      for (const c of this.held(v)) {
        const cv = v.vines.find((q) => q.id === c.vine);
        if (!cv || !reach(c)) continue;
        const d = Math.abs(cv.x - p.x) + Math.abs(c.y - p.y) * 0.5;
        if (d < bd) { bd = d; best = c; }
      }
      this.target = best;
      if (!best) return null;
    }
    const c = this.target as VineCluster;
    const cv = v.vines.find((q) => q.id === c.vine)!;
    // on its vine, one hand, hands under it: up (it is pushed up to the top and tears free)
    if (h.a.id === cv.id && !h.b && p.y - HANDS_UP >= c.y - 2) return { up: true };
    // hands not yet under it: down this vine first (a vine he holds with the bunch on it cannot be climbed down past it)
    if (p.y - HANDS_UP < c.y + UNDER) {
      if (holds(cv.id)) {
        // (on its vine above it: off to a neighbour first, then down there)
        const dir = this.sideVine(v, cv, -1, p.y) ? -1 : 1;
        return this.push(dir);
      }
      // (down does not take him: a bunch on a vine he holds is under his hands, and no vine is climbed down past its figs. A player
      // goes across, toward the fig he wants, and down there: 1-4 seed 2, two vines held over a bunch, he pressed down for 1200 s)
      if (t - this.movedAt.t > DOWN_STALL) return this.push(cv.x > p.x + 1 ? 1 : cv.x < p.x - 1 ? -1 : (h.a.x < p.x ? 1 : -1));
      return { down: true };
    }
    // under it: across toward its vine
    return this.push(cv.x > p.x + 1 ? 1 : cv.x < p.x - 1 ? -1 : h.b ? (h.b.id === cv.id ? (h.b.x > h.a.x ? 1 : -1) : h.a.x > h.b.x ? 1 : -1) : 1);
  }

  /** a field vine beside `from` on side dir, within a step, spanning height y */
  private sideVine(v: FieldView, from: Vine, dir: -1 | 1, y: number): Vine | null {
    let best: Vine | null = null;
    for (const q of v.vines) {
      if (!q.field || q === from) continue;
      const d = (q.x - from.x) * dir;
      if (d <= 0 || d > 90 || y < q.topY - 4 || y > q.bottomY + 4) continue;
      if (!best || d < (best.x - from.x) * dir) best = q;
    }
    return best;
  }

  /** a pod in its tell (seen `react` s ago) or falling above him on a column he holds: its x, else null */
  private podOn(v: FieldView, p: PlayerState, t: number, holds: (id: number) => boolean): number | null {
    for (const pod of v.field!.pods) {
      if (pod.vine === undefined || !holds(pod.vine)) continue;
      const s = podAt(pod, v.clock.read(pod.clock, pod.shift));
      if (s.phase === 'warn') {
        const k = pod.id * 1e4 + s.cycle;
        if (!this.seenTell.has(k)) this.seenTell.set(k, t);
        if (t - this.seenTell.get(k)! >= this.react) return pod.x;
      } else if (s.phase === 'fall' && s.y < p.y) return pod.x;
    }
    if (this.seenTell.size > 64) this.seenTell.clear();
    return null;
  }

  /** the side with a vine no pod is telling or falling on (0: none in reach) */
  private freeSide(v: FieldView, p: PlayerState, t: number, h: Hands): -1 | 0 | 1 {
    const busy = (q: Vine) => v.field!.pods.some((pod) => pod.vine === q.id && (() => { const s = podAt(pod, v.clock.read(pod.clock, pod.shift)); return s.phase === 'warn' || s.phase === 'fall'; })());
    if (h.b) {
      // (on two hands: keep the one with no pod on it)
      if (!busy(h.a) && busy(h.b)) return h.a.x < h.b.x ? -1 : 1;
      if (!busy(h.b)) return h.b.x < h.a.x ? -1 : 1;
    }
    // (toward the fig he is going for first, when that side is free: a dodge that always tried the left first stepped him away from a
    //  fig to his right at every tell, back and forth over the same three vines, never reaching it. BUILD-26l, 1-4 adult N 32 and
    //  middle N 14, fig 7 on vine 48 from vines 43-46)
    const cv = this.target ? v.vines.find((q) => q.id === this.target!.vine) : undefined;
    const first: -1 | 1 = cv && cv.x > p.x + 1 ? 1 : -1;
    for (const dir of [first, -first as -1 | 1]) {
      const q = this.sideVine(v, h.a, dir, p.y);
      if (q && !busy(q)) return dir;
    }
    return 0;
  }
}
