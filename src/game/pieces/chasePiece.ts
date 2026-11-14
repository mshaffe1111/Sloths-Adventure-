/**
 * chasePiece — a laid chase on the piece hook (ENGINE-678 B1; chase.ts ChaseLay; R-165.198: any world lays it by data).
 *
 * The stage's `chase` lay names its stretches; the sections that fall are its platforms marked `chase`. Each stretch's front sets off
 * behind him as he passes its start (a crack), breaks every section of its stretch it passes (the halves tumble into the mist), and
 * stops at its living fork, where nothing falls and nothing catches him. The sections just ahead of a running front quiver (the
 * warning), and the trailing edge of the screen darkens as it closes in. Caught on a stretch, or off the branch: a heart and back to
 * his flag (PieceHurt.toFlag, Matt's rule 2026-10-24), and the branch is whole again from there with the front waiting behind him.
 *
 * Easy runs the Easy row (CHASE_ROWS: at most 200 px/s, never over his run). The hand-built 1-8 (proto.chase) is still the engine's
 * own until 1-8's build replaces it; it lays no `chase` field, so this piece never starts there.
 */
import { sound } from '../audio.ts';
import { caughtInRun, chaseLayProblems, frontBehind, newChaseRun, restartRunAt, sectionInRun, sectionStretch, stepChaseRun, type ChaseRun } from '../chase.ts';
import { drawChaseBroken, drawChaseSection } from '../protoArt.ts';
import type { PieceHost, PieceHurt, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';

/** a fall this far under the branch near him is a fall off it (the old 1-8's line), kept `PIT_MARGIN` above the stage's own pit line */
const OFF_BELOW = 300;
/** the stage's pit takes a life at levelHeight + 120 (engine.ts); the chase's heart comes first: a fall's step (950 px/s, 32 px) is under the margin */
const PIT_LINE = 120;
const PIT_MARGIN = 90;
/** the branch near him: sections whose middle is this close count for the off line */
const NEAR = 800;
/** a broken section's halves tumble for this long (s) */
const DEBRIS_LIFE = 1.8;
/** a creak now and then while a front runs within this of him (px), every `CREAK_EVERY` s */
const CREAK_NEAR = 700;
const CREAK_EVERY = 1.2;
/**
 * The warning at the trailing edge of the screen, by how far the front is behind him: none with it `from` px back, full at `from - span`
 * and closer. A dark core at the edge (it reads on a light, misty backdrop) with a warm rim on its inner side (it reads on a dark one,
 * where a dark tint alone vanished: B1's stills, 11-13), up to `max` alpha; it reaches further in (`wide` + `grow` of the view's width)
 * as the front closes. B2 measured it on 1-2, 2-1 and World 3's darkest backdrop (reference/qa-reports/B2/contrast.mjs).
 */
export const EDGE = { from: 650, span: 500, max: 0.75, wide: 0.3, grow: 0.12 } as const;

/** the edge's strength (0 to 1) with the front `gap` px behind him, its width (a share of the view) and its gradient stops, left to right */
export function edgeTint(gap: number): { k: number; width: number; stops: Array<[number, string]> } {
  const k = Math.max(0, Math.min(1, (EDGE.from - gap) / EDGE.span));
  const a = (f: number) => +(EDGE.max * f * k).toFixed(3);
  return {
    k,
    width: EDGE.wide + EDGE.grow * k,
    stops: [
      // (the dark core at the edge, near black and warm, easing through an ember glow to nothing: one long ramp, no stripe; a short
      // fade after the glow drew a hard orange band, B2's first stills)
      [0, `rgba(14, 4, 2, ${a(1)})`],
      [0.25, `rgba(30, 7, 3, ${a(0.8)})`],
      [0.5, `rgba(110, 32, 10, ${a(0.5)})`],
      [0.72, `rgba(204, 82, 26, ${a(0.26)})`],
      [1, 'rgba(220, 100, 34, 0)'],
    ],
  };
}

interface Section {
  pl: Platform;
  /** its stretch (chase.ts sectionStretch), -1 on a fork: never falls */
  owner: number;
  /** drawn mirrored every other one, so the bark never repeats side by side */
  mirror: boolean;
}

interface Debris {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  t: number;
  right: boolean;
}

class ChasePiece implements StagePiece {
  readonly kind = 'chase';
  readonly layers: readonly PieceLayer[] = ['world', 'screen'];
  private run: ChaseRun;
  private readonly sections: Section[];
  private debris: Debris[] = [];
  private creakAt = 0;

  constructor(
    private readonly lay: NonNullable<import('../stageGenerator.ts').GeneratedStage['chase']>,
    platforms: readonly Platform[],
    private readonly pitY: number,
    easy: boolean,
  ) {
    this.run = newChaseRun(lay, easy);
    this.sections = platforms
      .filter((pl) => pl.chase)
      .sort((a, b) => a.x - b.x)
      .map((pl, i) => ({ pl, owner: sectionStretch(lay, pl.x, pl.x + pl.width), mirror: i % 2 === 1 }));
  }

  step(dt: number, host: PieceHost) {
    const p = host.player;
    const was = this.run.fronts.map((f) => f.active);
    stepChaseRun(this.run, dt, p.x);
    // (a stretch sets off: one long crack)
    if (this.run.fronts.some((f, i) => f.active && !was[i] && f.front < this.lay.stretches[i].end)) sound.playHitImpact(true);
    // (sections its front has passed break, and their halves tumble away)
    const v = host.view;
    for (const s of this.sections) {
      if (s.pl.broken || sectionInRun(this.run, s.owner, s.pl.x, s.pl.x + s.pl.width) !== 'fallen') continue;
      s.pl.broken = true;
      const half = s.pl.width / 2;
      const h = (s.pl.width * 100) / 370;
      // (each half's spin and throw from its own place, so a replay of the same run looks the same)
      const k = ((s.pl.x * 0.618) % 1 + 1) % 1;
      for (const right of [false, true]) {
        this.debris.push({ x: s.pl.x + (right ? half : 0), y: s.pl.y - 8, w: half, h, vx: (right ? 40 : -30) + 30 * k, vy: -40 - 60 * k, rot: 0, vr: (right ? 1 : -1) * (0.8 + k), t: 0, right });
      }
      if (s.pl.x + s.pl.width > v.x - 200 && s.pl.x < v.x + v.w / v.zoom + 200) sound.playHitImpact(false);
    }
    for (const d of this.debris) {
      d.t += dt;
      d.vy += 1500 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
    }
    if (this.debris.length) this.debris = this.debris.filter((d) => d.t < DEBRIS_LIFE);
    const behind = frontBehind(this.run, p.x);
    if (behind !== null && p.x - behind < CREAK_NEAR && host.t >= this.creakAt) {
      this.creakAt = host.t + CREAK_EVERY;
      sound.playTreeClimb();
    }
  }

  /** caught on a stretch, or off the branch: a heart and back to his flag (asked after the step's moves, so where he is now) */
  hurts(host: PieceHost): PieceHurt | null {
    const p = host.player;
    if (p.isVineSwinging || p.climbing) return null;
    if (caughtInRun(this.run, p.x)) return { amount: 1, fromX: frontBehind(this.run, p.x) ?? p.x, toFlag: true };
    let low = -Infinity;
    for (const s of this.sections) if (Math.abs(s.pl.x + s.pl.width / 2 - p.x) < NEAR) low = Math.max(low, s.pl.y);
    return low > -Infinity && p.y > Math.min(low + OFF_BELOW, this.pitY - PIT_MARGIN) ? { amount: 1, fromX: p.x, toFlag: true } : null;
  }

  respawn(host: PieceHost) {
    // (back at his flag: each front waits behind it, and every section is as its front says: whole from there on)
    restartRunAt(this.run, host.player.x);
    for (const s of this.sections) s.pl.broken = sectionInRun(this.run, s.owner, s.pl.x, s.pl.x + s.pl.width) === 'fallen';
    this.debris = [];
  }

  draw(ctx: CanvasRenderingContext2D, layer: PieceLayer, host: PieceHost) {
    if (layer === 'screen') return this.drawEdge(ctx, host);
    const v = host.view;
    const left = v.x - 200;
    const right = v.x + v.w / v.zoom + 200;
    for (const s of this.sections) {
      const pl = s.pl;
      if (pl.broken || pl.x + pl.width < left || pl.x > right) continue;
      const cracked = sectionInRun(this.run, s.owner, pl.x, pl.x + pl.width) === 'cracked';
      // (a quiver in the cracking sections)
      const dy = cracked ? Math.sin(host.t * 40 + pl.x) * 1.2 : 0;
      if (!drawChaseSection(ctx, pl, cracked, s.mirror, dy)) {
        ctx.fillStyle = cracked ? '#7a5532' : '#8a6238';
        ctx.fillRect(pl.x, pl.y + dy, pl.width, 34);
      }
    }
    for (const d of this.debris) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - d.t / DEBRIS_LIFE);
      ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
      ctx.rotate(d.rot);
      if (!drawChaseBroken(ctx, d.right, -d.w / 2, -d.h / 2, d.w, d.h)) {
        ctx.fillStyle = '#7a5532';
        ctx.fillRect(-d.w / 2, -d.h / 4, d.w, d.h / 2);
      }
      ctx.restore();
    }
  }

  /** the danger at the trailing edge of the screen: darker the closer the front behind him (screen px) */
  private drawEdge(ctx: CanvasRenderingContext2D, host: PieceHost) {
    const behind = frontBehind(this.run, host.player.x);
    if (behind === null) return;
    const t = edgeTint(host.player.x - behind);
    if (t.k <= 0.02) return;
    const w = host.view.w * t.width;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    for (const [at, c] of t.stops) g.addColorStop(at, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, host.view.h);
  }
}

export const CHASE_PIECE: PieceKind = {
  id: 'chase',
  start(stage, host) {
    const lay = stage.chase;
    if (!lay) return null;
    // (a lay that cannot run is refused by name, never run broken: the lay's own check, gen2 B5, calls the same function, so a bad
    // lay never reaches a stage; here it is only named, never a crash on his phone)
    const bad = chaseLayProblems(lay);
    if (bad.length) {
      console.error(`chase lay refused: ${bad.join('; ')}`);
      return null;
    }
    return new ChasePiece(lay, host.platforms, stage.config.levelHeight + PIT_LINE, host.easy);
  },
};
