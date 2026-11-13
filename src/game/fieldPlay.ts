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
import { GATE, clusterLand, fallCluster, gateLeft, gateOver, gateSag, type ClusterGate, type Hands, type VineCluster } from './vineField.ts';
import { drawGate, drawPod } from './vineFieldArt.ts';

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

  constructor(
    readonly pods: readonly PodColumn[],
    readonly gates: readonly ClusterGate[],
    private readonly platforms: Platform[],
    private readonly vines: readonly Vine[],
    private readonly clusters: VineCluster[],
  ) {
    this.gateIds = new Set(gates.map((g) => g.platform));
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
    const v = this.vines.find((q) => q.id === c.vine);
    if (v) c.land = clusterLand(v, c.y, this.platforms, this.gateIds);
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
        if (b) h.spark(b.x + b.width / 2, b.y - 20, '#fde68a');
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
    }
    for (const pod of this.pods) {
      if (pod.x < x0 - 60 || pod.x > x1 + 60) continue;
      drawPod(ctx, pod, podAt(pod, beat(pod.clock, pod.shift)), t);
    }
  }

  /** the pods' radius, for a test's eye */
  static readonly radius = POD.radius;
}
