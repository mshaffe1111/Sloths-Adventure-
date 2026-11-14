/**
 * fieldPlay — a vine field's threats and its gates, run each frame (1-4.md engine pieces 3 and 7; vineField.ts is the climb itself).
 *
 *   - Falling pods (podfall.ts): each pod's tell is heard once a beat when he is near (the creak, its fluff trickling down the column);
 *     a pod that finds him costs what its piece says (`cost`): the host knocks him off his vine to the catch bough, and on 'heart' a heart
 *     too. One hit a pod a beat.
 *   - Clusters (vineField.ts): one torn free bounces out of its column (never through him) and comes down on the sound wood under it,
 *     thumped down there as a drop-trap load (the host scares any animal beside it off: castPlay.ts loadLands).
 *   - Gates (vineField.ts ClusterGate): a shut gate's bough is no footing (it is `broken` while shut: every collision and the painted
 *     ground already leave a broken platform out); each cluster freed lifts it a notch, the last springs it open, sound and level.
 *
 * No stage ids, no world numbers, no x: everything is the stage's data (GeneratedStage.pods / gates / clusters). The engine hosts it
 * (engine.ts, its `field` hooks); RealPlay drives it through the engine in the tests.
 */
import type { Platform, PlayerState, Vine } from './types.ts';
import { POD, podAt, podHits, type PodColumn, type PodCost } from './podfall.ts';
import type { ClockRead } from './clock.ts';
import { GATE, HANDS_UP, clusterLand, fallCluster, gateLeft, gateOver, gateSag, gateShut, type ClusterGate, type Hands, type VineCluster } from './vineField.ts';
import { drawGate, drawGateLock, drawPod, type LockState, type TieState } from './vineFieldArt.ts';

/** what the field asks of its host (the engine) */
export interface FieldHost {
  readonly t: number;
  readonly player: PlayerState;
  readonly hands: Hands | null;
  /** where a beat stands now for a subscriber's lane (the engine's StageClock.read: beat.ts) */
  beat(clock: string, shift?: number): ClockRead;
  /** a pod found him: knock him off his vine (and a heart on 'heart') */
  knock(cost: PodCost, fromX: number): void;
  sfx(kind: 'creak' | 'burst' | 'thump' | 'lift' | 'open'): void;
  /** a torn cluster came down at (x, y): what stands beside it is chased off (a drop-trap load) */
  loadLands(x: number, y: number): void;
  spark(x: number, y: number, color: string): void;
}

/** how near (px across, and up or down) a pod's tell is heard: about a screen */
const HEAR = { x: 520, y: 600 };

export class FieldPlay {
  /** the lines a hit or a tell was counted on, by pod and beat (cleared as it grows) */
  private told = new Set<string>();
  private hit = new Set<string>();
  /** where a gate's sag is easing to, and from (px), for its lift */
  private readonly lift = new Map<number, { from: number; to: number; t0: number; len: number }>();
  private readonly gateIds: Set<number>;
  /** where each cluster was laid (its y), to read how far up its vine he has pushed it */
  private readonly laid = new Map<number, number>();
  /** a kept lock state and its ties (no allocation a frame) */
  private readonly lock: LockState = { strain: 0, settle: 0, pull: 0 };
  private readonly ties: TieState[] = [];
  /** when each fig tore free (game time), for its tie's snap */
  private readonly snapAt = new Map<number, number>();

  constructor(
    readonly pods: readonly PodColumn[],
    readonly gates: readonly ClusterGate[],
    private readonly platforms: Platform[],
    private readonly vines: readonly Vine[],
    private readonly clusters: VineCluster[],
  ) {
    this.gateIds = new Set(gates.map((g) => g.platform));
    for (const c of clusters) this.laid.set(c.id, c.y);
    // a shut gate is no footing until its clusters are freed
    for (const g of gates) {
      const b = platforms.find((q) => q.id === g.platform);
      const shut = gateLeft(g, clusters) > 0;
      if (b) b.broken = shut;
      for (const id of g.with ?? []) {
        const q = platforms.find((x) => x.id === id);
        if (q) q.broken = shut;
      }
      for (const id of g.ways ?? []) {
        const w = vines.find((q) => q.id === id);
        if (w) w.off = shut;
      }
    }
  }

  /** a shut gate's bough is over this vine's top: the climb stops short of the vault (there is nothing to vault onto) */
  blocksTop(v: Vine): boolean {
    return !!this.gates.length && !!gateOver(v, this.gates, this.clusters, this.platforms);
  }

  /** the DRAWN top and underside of the shut gate bough over (x, y): the nearest one whose drawn top is above y (sagged as it is drawn
   *  at x), or null when no shut gate is over him there (its bough and the boughs held with it, and GATE.lidSide past either end: his
   *  body's half width, so a leap from an end vine cannot round it) */
  shutBoughAt(x: number, y: number): { top: number; under: number } | null {
    let best: { top: number; under: number } | null = null;
    for (const g of this.gates) {
      if (!gateShut(g, this.clusters)) continue;
      const sag = gateSag(g, this.clusters);
      for (const id of [g.platform, ...(g.with ?? [])]) {
        const b = this.platforms.find((q) => q.id === id);
        if (!b || x < b.x - GATE.lidSide || x > b.x + b.width + GATE.lidSide) continue;
        // (the near end stays put, the far end sags: drawGate's tilt; a bough held with it is level)
        const f = id !== g.platform ? 0 : Math.max(0, Math.min(1, g.far > 0 ? (x - b.x) / b.width : (b.x + b.width - x) / b.width));
        const top = b.y + sag * f;
        if (top < y && (!best || top > best.top)) best = { top, under: top + GATE.depth * b.width };
      }
    }
    return best;
  }

  /** the highest his FEET may rise at x from y (least y): under a shut gate, his drawn head at its drawn underside (GATE.head); else
   *  -Infinity */
  capY(x: number, y: number): number {
    const s = this.shutBoughAt(x, y);
    return s ? s.under + GATE.head : -Infinity;
  }

  /** where a fig (`h` px tall, its bottom at `y`) pushed up this vine tears free: under a shut bough, as high as his hands push it with
   *  his head held at the wood (Matt: "just enough to get the fruit up"; the bough's drawn top if he could push it past that), less
   *  GATE.slack for the tilt between his two hands' lines; else the vine's own top */
  readonly topOf = (v: Vine, h: number, y: number): number => {
    const s = this.shutBoughAt(v.x, y);
    return s ? Math.max(s.top, s.under + GATE.head - HANDS_UP - h + GATE.slack) : v.topY;
  };

  /** the drawn top of gate `g`'s own bough `b` at x (clamped to its span), sagged as drawGate tilts it */
  private drawnTop(g: ClusterGate, b: Platform, sag: number, x: number): number {
    const f = Math.max(0, Math.min(1, g.far > 0 ? (x - b.x) / b.width : (b.x + b.width - x) / b.width));
    return b.y + sag * f;
  }

  /** is a body standing at (x, feet y) inside a shut gate's drawn wood: over its span (and GATE.lidSide past its ends: his body's half
   *  width), his feet under the drawn top and his drawn head (GATE.head) over the drawn underside? */
  private inWood(g: ClusterGate, b: Platform, sag: number, x: number, y: number): boolean {
    if (x < b.x - GATE.lidSide || x > b.x + b.width + GATE.lidSide) return false;
    const top = this.drawnTop(g, b, sag, x);
    return y > top && y - GATE.head < top + GATE.depth * b.width;
  }

  /** is he (feet at x, y) on or over a shut gate whose bough is over this field vine's top? Then the vine is not his to take: its top is
   *  under the wood he stands on (FIX-15: walking along a shut bough, up held after a jump took the vine under it and put him through the
   *  wood; down there would climb down through it) */
  overShut(v: Vine, x: number, y: number): boolean {
    for (const g of this.gates) {
      const b = this.platforms.find((q) => q.id === g.platform);
      if (!b || v.x < b.x - 4 || v.x > b.x + b.width + 4 || Math.abs(b.y - v.topY) > GATE.under || !gateShut(g, this.clusters)) continue;
      if (x >= b.x - GATE.lidSide && x <= b.x + b.width + GATE.lidSide && y <= this.drawnTop(g, b, gateSag(g, this.clusters), x) + 1) return true;
    }
    return false;
  }

  /** kept floors for footings() (no allocation a frame) */
  private readonly floors: Platform[] = [];
  private readonly floorOf = new Map<number, Platform>();

  /**
   * The shut gates' boughs as wood met from ABOVE (FIX-15, R-165.212; Matt: "a collision that doesn't open up the platform"): each at its
   * DRAWN top under x, sagged as drawn, for the engine's floors (engine.ts, the platform collisions). A shut bough is no footing from
   * under it (lid: his head stops at its underside) nor through its end (lid: a wall), and a body that is over it lands on the wood the
   * player sees, never through it. Only its own drawn bough: the boughs held with it are not drawn while it is shut, so they are no
   * footing (a floor nobody can see). Kept objects, refreshed each call.
   */
  footings(x: number): readonly Platform[] {
    const out = this.floors;
    out.length = 0;
    for (const g of this.gates) {
      if (!gateShut(g, this.clusters)) continue;
      const b = this.platforms.find((q) => q.id === g.platform);
      if (!b) continue;
      let f = this.floorOf.get(b.id);
      if (!f) this.floorOf.set(b.id, (f = { id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, type: 'solid', style: b.style } as Platform));
      f.x = b.x;
      f.width = b.width;
      f.y = this.drawnTop(g, b, gateSag(g, this.clusters), x);
      out.push(f);
    }
    return out;
  }

  /**
   * A shut gate is wood from every side, met by his DRAWN body (Matt, R-165.212: "it let me go above the platform... a collision that
   * doesn't open up the platform"; 11-14: "it cannot go above the platform above it... like on Pokey's head"; "a head/shoulder stop so
   * only the fruit passes"). The engine calls it once a frame, just after it moves him (engine.ts, after `p.y += p.vy * dt`), with
   * where he was across (`x0`):
   *   - BESIDE: a move across that would put his body into the bough's drawn wood (its span and GATE.lidSide past its ends; his feet
   *     under the drawn top, his head over the drawn underside) is stopped at its end, as a wall stops him: he never walks, leaps or
   *     drifts into it from the side (FIX-15: INT-8's leap from the far-end ledge went in over the sagged end). Coming across from over
   *     its top is no wall: he is over it, and lands on it (footings).
   *   - FROM BELOW: rising through the air under its bough (and the boughs held with it), his DRAWN head stops at the drawn underside
   *     (capY), as a head meets wood; the climb stops there too (engine.ts, the field climb). "Under" is read against the drawn TOP: the
   *     line falls toward the sagging end, so a leap along it would start over the line there.
   *   - FROM ABOVE: feet over the drawn top are never pushed up or down here; coming down onto it, he lands on its drawn top (footings,
   *     the engine's floors), never through it.
   * The frame its last fig locks it, it is gone (torn() opens it): a sound bough, footing as any.
   */
  lid(p: PlayerState, dt: number, x0: number = p.x): boolean {
    if (p.climbing || !this.gates.length) return false;
    const was = p.y - p.vy * dt;
    if (x0 !== p.x)
      for (const g of this.gates) {
        if (!gateShut(g, this.clusters)) continue;
        const b = this.platforms.find((q) => q.id === g.platform);
        if (!b) continue;
        const sag = gateSag(g, this.clusters);
        // (the move across put him in, where the move up or down alone did not: the end of the wood, a wall)
        if (!this.inWood(g, b, sag, p.x, p.y) || this.inWood(g, b, sag, x0, p.y)) continue;
        const L = b.x - GATE.lidSide, R = b.x + b.width + GATE.lidSide;
        p.x = x0 < L ? L - 0.01 : x0 > R ? R + 0.01 : x0;
        p.vx = 0;
        return true;
      }
    if (p.vy >= 0) return false;
    const s = this.shutBoughAt(p.x, was);
    if (!s) return false;
    const line = s.under + GATE.head;
    // (started under it: his feet under the drawn top by more than GATE.stand, the slope a frame's walk climbs along a sagged bough; a
    // jump off the bough's own top, walking up its slope, starts ON it, never under it: read as under, he was put down through the wood)
    if (was > s.top + GATE.stand && p.y < line) {
      p.y = line;
      p.vy = 0;
      return true;
    }
    return false;
  }

  /** the lines he occupies: each hand's vine on a field, else his middle */
  private lines(h: FieldHost): { xs: number[]; onVines: boolean } {
    const p = h.player;
    if (p.climbing && h.hands) return { xs: h.hands.b ? [h.hands.a.x, h.hands.b.x] : [h.hands.a.x], onVines: true };
    return { xs: [p.x], onVines: p.climbing };
  }

  /** one frame (`floor`: the stage's bottom, where a cluster with no wood under it is gone) */
  step(h: FieldHost, dt: number, floor: number): void {
    const p = h.player;
    const t = h.t;
    if (this.pods.length) {
      const { xs, onVines } = this.lines(h);
      for (const pod of this.pods) {
        const s = podAt(pod, h.beat(pod.clock, pod.shift));
        const key = `${pod.id}:${s.cycle}`;
        const near = Math.abs(pod.x - p.x) < HEAR.x && p.y > pod.top - HEAR.y && p.y < pod.land + HEAR.y;
        if (s.phase === 'warn' && near && !this.told.has(key)) {
          this.told.add(key);
          h.sfx('creak');
        }
        if (s.phase === 'burst' && near && !this.told.has(key + 'b')) {
          this.told.add(key + 'b');
          h.sfx('burst');
        }
        if (!this.hit.has(key) && p.invincibleTimer <= 0 && podHits(pod, s, xs, p.y, 64, onVines)) {
          this.hit.add(key);
          h.knock(pod.cost, pod.x);
        }
      }
      if (this.told.size > 256) this.told.clear();
      if (this.hit.size > 256) this.hit.clear();
    }
    // the torn clusters fall, bounce out of the column (never through him), and come down on the wood under them
    for (const c of this.clusters) {
      if (!c.falling || c.gone) continue;
      const v = this.vines.find((q) => q.id === c.vine);
      const colX = v ? v.x : p.x;
      if (fallCluster(c, dt, floor, p.x, colX)) {
        const x = colX + (c.dx ?? 0);
        h.sfx('thump');
        h.spark(x, c.y - 10, '#c4b5fd');
        h.loadLands(x, c.y);
      }
    }
  }

  /**
   * A cluster pushed up to its vine's top tears free (the engine's climb: vineField.ts pushClusters): it falls from here onto the wood
   * under its column, and every gate it held lifts a notch, or springs open on its last.
   */
  torn(c: VineCluster, h: FieldHost): void {
    this.snapAt.set(c.id, h.t);
    const v = this.vines.find((q) => q.id === c.vine);
    if (v) c.land = clusterLand(v, c.y, this.platforms, this.gateIds);
    // (it locks in: ONE signal, its tie snapping (drawGateLock: the painted snap and Matt's bark chips) and its sound; the old gold pop
    // here and at the open made two at once: gone, the lead 11-14)
    for (const g of this.gates) {
      if (!g.clusters.includes(c.id)) continue;
      const left = gateLeft(g, this.clusters);
      const prev = (GATE.sag * (left + 1)) / g.clusters.length;
      const now = gateSag(g, this.clusters);
      this.lift.set(g.id, { from: prev, to: now, t0: h.t, len: left ? GATE.lift : GATE.spring });
      const b = this.platforms.find((q) => q.id === g.platform);
      if (left === 0) {
        if (b) b.broken = false;
        for (const id of g.with ?? []) {
          const q = this.platforms.find((x) => x.id === id);
          if (q) q.broken = false;
        }
        // (the way up it held down springs up with it)
        for (const id of g.ways ?? []) {
          const w = this.vines.find((q) => q.id === id);
          if (w) {
            w.off = false;
            h.spark(w.x, (w.topY + w.bottomY) / 2, '#86efac');
          }
        }
        h.sfx('open');
      } else h.sfx('lift');
    }
  }

  /** the sag a gate is drawn at now (px), easing between notches */
  sagOf(g: ClusterGate, t: number): number {
    const l = this.lift.get(g.id);
    const target = gateSag(g, this.clusters);
    if (!l) return target;
    const u = Math.min(1, (t - l.t0) / l.len);
    // (a spring overshoots a little and settles: the bough "springs open")
    const e = l.to === 0 ? 1 - Math.cos(u * Math.PI * 2.5) * (1 - u) : 1 - (1 - u) * (1 - u);
    return l.from + (l.to - l.from) * e;
  }

  /** how a gate's lock stands at `t` (vineFieldArt.ts drawGateLock): straining while a fig is pushed, a shudder as one locks in, the
   *  thatch thrown after the last; and each fig's tie (its strain to where it tears free, and how long since it snapped) */
  lockOf(g: ClusterGate, t: number): LockState {
    const s = this.lock;
    const left = gateLeft(g, this.clusters);
    const l = this.lift.get(g.id);
    const since = l ? t - l.t0 : Infinity;
    s.pull = left === 0 ? (l ? Math.min(1, since / GATE.pull) : 1) : 0;
    s.settle = left > 0 && since < GATE.settle ? Math.sin((since / GATE.settle) * Math.PI) * (1 - since / GATE.settle) : 0;
    s.strain = 0;
    this.ties.length = 0;
    for (const id of g.clusters) {
      const c = this.clusters.find((q) => q.id === id);
      const v = c ? this.vines.find((q) => q.id === c.vine) : undefined;
      const y0 = c ? this.laid.get(c.id) : undefined;
      if (!c || !v || y0 === undefined) continue;
      const at = this.snapAt.get(c.id);
      let strain = 1;
      if (!c.falling && !c.gone) {
        const way = y0 - (this.topOf(v, c.h, c.y) + c.h);
        strain = way > 1 ? Math.max(0, Math.min(1, (y0 - c.y) / way)) : 0;
        s.strain = Math.max(s.strain, strain);
      }
      this.ties.push({ x: v.x, strain, age: at === undefined ? (c.falling || c.gone ? 9 : -1) : t - at });
    }
    return s;
  }

  /** the pods and the shut gates on screen (stand-ins: vineFieldArt.ts); `beat` reads a subscriber's beat */
  draw(ctx: CanvasRenderingContext2D, t: number, x0: number, x1: number, beat: (clock: string, shift?: number) => ClockRead): void {
    for (const g of this.gates) {
      const b = this.platforms.find((q) => q.id === g.platform);
      if (!b || b.x > x1 + 60 || b.x + b.width < x0 - 60) continue;
      // (a gate's bough is always the field's own picture, shut and sagging or open and level: the stage marks it `art: 'hidden'` so the
      // ground's painter leaves it to this, and it never swaps look as it springs open)
      const sag = this.sagOf(g, t);
      if (!b.broken && sag < 0.5 && b.art !== 'hidden') continue;
      drawGate(ctx, b, g.far, sag);
      if (g.clusters.length) drawGateLock(ctx, b, g.far, sag, GATE.depth * b.width, this.lockOf(g, t), this.ties, t);
    }
    for (const pod of this.pods) {
      if (pod.x < x0 - 60 || pod.x > x1 + 60) continue;
      drawPod(ctx, pod, podAt(pod, beat(pod.clock, pod.shift)), t, this.vines.find((v) => v.id === pod.vine));
    }
  }

  /** the pods' radius, for a test's eye */
  static readonly radius = POD.radius;
}
