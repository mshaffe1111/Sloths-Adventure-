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
import { drawGritBit } from '../w4Grit.ts';
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
 * and closer. Where the branch breaks, not a column over the scene (the lead, 11-14: "the air behind him is falling apart", not a dirty
 * filter): one ember glow anchored at the trailing edge at his feet' height (a dark ember core that reads on a light, misty backdrop and a
 * warm rim that reads on a dark one, where B1's dark tint vanished), an ellipse `tall` times as high as wide, sized by the screen's larger
 * side so upright gets the glow sideways gets; and bark chips falling from the branch line through it, a few lit by it rising. One
 * gradient and at most `bits` painted chips a frame (drawcheck's gradient limit is 2 a frame). Measured: reference/qa-reports/B2/contrast.mjs.
 */
export const EDGE = { from: 650, span: 500, core: 0.62, reach: 0.4, grow: 0.18, upright: 0.55, tall: 1.3, bits: 22 } as const;

export interface EdgeBit {
  /** the chip's pick on the grit sheet (w4Grit.ts drawGritBit `c`), its middle in screen px, size, turn, alpha and tint */
  c: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  alpha: number;
  tint: string;
  ember: boolean;
}

/**
 * The edge's look with the front `gap` px behind him, on a screen `w` x `h`, his feet at screen y `feetY`, at time `t` (s): its strength
 * (0 to 1), the glow (centre, radius across, height over width, stops from the centre out) and the chips.
 */
export function edgeLook(gap: number, w: number, h: number, feetY: number, t: number): {
  k: number;
  glow: { x: number; y: number; r: number; tall: number; stops: Array<[number, string]> };
  bits: EdgeBit[];
} {
  const k = Math.max(0, Math.min(1, (EDGE.from - gap) / EDGE.span));
  const a = (f: number) => +(EDGE.core * f * k).toFixed(3);
  const r = Math.max(w, EDGE.upright * h) * (EDGE.reach + EDGE.grow * k);
  const bits: EdgeBit[] = [];
  const n = Math.round(EDGE.bits * k);
  const span = h * 0.5;
  for (let i = 0; i < n; i++) {
    // (each chip from its own number: the same run looks the same)
    const p = (i * 0.618034) % 1;
    const q = (i * 0.371 + 0.13) % 1;
    const ember = i % 3 === 0;
    const x = r * (0.04 + 0.7 * q) + Math.sin(t * 1.7 + i) * 8;
    // (bark falls from the branch line; the lit bits rise from it)
    const u = (p + t * (ember ? 0.12 : 0.3 + 0.2 * p)) % 1;
    const y = ember ? feetY - u * span * 0.8 : feetY - 10 + u * span;
    bits.push({
      c: p + i * 0.001, x, y, size: ember ? 6 + 5 * p : 11 + 9 * p, rot: t * (1 + 2 * q) * (i % 2 ? 1 : -1),
      alpha: +(k * (1 - u) * 0.9 * (1 - (0.5 * x) / r)).toFixed(3), tint: ember ? '#ffb060' : '#5a3620', ember,
    });
  }
  return {
    k,
    glow: {
      x: 0, y: feetY, r, tall: EDGE.tall,
      stops: [
        // (a dark ember core at the break, its warm rim, then nothing)
        [0, `rgba(44, 11, 3, ${a(1)})`],
        [0.32, `rgba(120, 34, 9, ${a(0.8)})`],
        [0.58, `rgba(222, 92, 28, ${a(0.55)})`],
        [0.8, `rgba(244, 128, 44, ${a(0.22)})`],
        [1, 'rgba(244, 128, 44, 0)'],
      ],
    },
    bits,
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
    const v = host.view;
    const look = edgeLook(host.player.x - behind, v.w, v.h, (host.player.y - v.y) * v.zoom, host.t);
    if (look.k <= 0.02) return;
    const gl = look.glow;
    ctx.save();
    ctx.translate(gl.x, gl.y);
    ctx.scale(1, gl.tall);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, gl.r);
    for (const [at, c] of gl.stops) g.addColorStop(at, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, -gl.r, gl.r, gl.r * 2);
    ctx.restore();
    for (const b of look.bits) drawGritBit(ctx, b.c, b.x, b.y, b.size, b.rot, b.alpha, b.tint);
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
