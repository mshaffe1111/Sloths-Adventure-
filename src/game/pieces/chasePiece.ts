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
import { canvasLost } from '../canvasLost.ts';
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
/**
 * The tip (1-8 NEW 8, ChaseStretch.tip): as he leaves it, this much real time plays in slow motion (the old 1-8's last liana, engine.ts
 * chaseSlowDone: 0.55 s), and he has left it once his middle is this far past its far end (px) off the ground
 */
export const TIP = { slow: 0.55, past: 4 } as const;
/** a creak now and then while a front runs within this of him (px), every `CREAK_EVERY` s */
const CREAK_NEAR = 700;
const CREAK_EVERY = 1.2;
/**
 * The warning at the trailing edge, by how far the front is behind him: none with it `from` px back, full at `from - span` and closer
 * (`k`, 0 to 1; drawn at `max` alpha at full).
 */
export const EDGE = { from: 650, span: 500, max: 0.8 } as const;

/** the edge's strength (0 to 1) with the front `gap` px behind him */
export function edgeTint(gap: number): { k: number } {
  return { k: Math.max(0, Math.min(1, (EDGE.from - gap) / EDGE.span)) };
}

/**
 * Its look (C4, the lead's pick 11-14 over B2's full-height tint, which read as a "laser" column and vanished on dark backdrops): an
 * ember glow at the BREAK, at his feet (where the branch is going), or at the screen's trailing edge while the break is off it (upright,
 * the usual case: B2's stills), with a narrow dark band at that edge (it reads on a light, misty backdrop where the ember alone fades).
 * The glow's radius is `radius` of the screen's SHORT side, so it is the same size against him both ways (sized by the long side it
 * filled a sideways screen's whole height and turned its sky orange, B4's first sideways clip); the dark core `band` of it wide, `tall` high.
 *
 * Baked ONCE per screen size into a cached canvas and stamped each frame with ONE drawImage at globalAlpha (EDGE.max x k): no gradient a
 * frame (PERFORMANCE-RULES §1; tools/perf/limits.json allows 2 on the whole frame). Baked again when the screen size changes, and when
 * the phone takes the canvas back (D6: canvasLost).
 */
export const GLOW = { radius: 0.46, band: 0.32, tall: 0.22 } as const;

let edgeBaked: { w: number; h: number; cv: HTMLCanvasElement } | null = null;
let edgeBakeCount = 0;
/** how many times the edge has been baked (the tests: once per screen size, again after a loss) */
export const edgeBakes = (): number => edgeBakeCount;

/** the baked edge for a screen `w` x `h` (screen px): a square, the glow's middle at its middle; null with no canvas */
export function edgeCanvas(w: number, h: number): HTMLCanvasElement | null {
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  if (edgeBaked && edgeBaked.w === w && edgeBaked.h === h && !canvasLost(edgeBaked.cv, 'chase edge')) return edgeBaked.cv;
  if (typeof document === 'undefined') return null;
  const r = Math.max(24, Math.round(GLOW.radius * Math.min(w, h)));
  const cv = document.createElement('canvas');
  cv.width = 2 * r;
  cv.height = 2 * r;
  const g = cv.getContext('2d');
  if (!g) return null;
  // (the ember: a disc centred ON the break, hot there and cooling to nothing both ways, so the fallen side darkens into it too and no
  // edge of the picture shows on screen: B4's first clip, drawn from the break rightward only, cut a hard full-height seam at the break)
  const glow = g.createRadialGradient(r, r, 0, r, r, r);
  glow.addColorStop(0, 'rgba(255, 168, 70, 0.95)');
  glow.addColorStop(0.2, 'rgba(236, 104, 34, 0.78)');
  glow.addColorStop(0.55, 'rgba(150, 42, 12, 0.36)');
  glow.addColorStop(1, 'rgba(60, 12, 4, 0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 2 * r, 2 * r);
  // (the dark core: a squat ellipse at the break on the branch line, near black and warm, `band` of the radius wide and `tall` of it high: on a light,
  // misty backdrop the ember alone fades; never a full-height column, which read as a "laser", B2)
  const bw = Math.max(6, Math.round(GLOW.band * r));
  g.save();
  g.translate(r, r);
  g.scale(1, (GLOW.tall * r) / bw);
  const core = g.createRadialGradient(0, 0, 0, 0, 0, bw);
  core.addColorStop(0, 'rgba(14, 4, 2, 0.8)');
  core.addColorStop(1, 'rgba(14, 4, 2, 0)');
  g.fillStyle = core;
  g.fillRect(-bw, -bw, 2 * bw, 2 * bw);
  g.restore();
  edgeBaked = { w, h, cv };
  edgeBakeCount++;
  return cv;
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
  /** the branch's tip tumbling whole (drawn as the tip, not as a broken half) */
  tip?: boolean;
}

class ChasePiece implements StagePiece {
  readonly kind = 'chase';
  readonly layers: readonly PieceLayer[] = ['world', 'screen'];
  private run: ChaseRun;
  private readonly sections: Section[];
  private debris: Debris[] = [];
  private creakAt = 0;
  /** each stretch's tip section (its last, ChaseStretch.tip), or null; and whether that branch end has fallen (he left the tip) */
  private readonly tips: Array<Section | null>;
  private tipFell: boolean[];

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
    // (a stretch that ends at the branch's tip: its last section is the tip, drawn from the sheet's branch end)
    this.tips = lay.stretches.map((st, i) => {
      if (!st.tip) return null;
      const own = this.sections.filter((q) => q.owner === i);
      const t = own[own.length - 1] ?? null;
      if (t) t.pl.chaseTip = true;
      return t;
    });
    this.tipFell = lay.stretches.map(() => false);
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
    // (the tip: he has left it off its end, in the air or on a liana: the whole of its stretch still standing breaks off at once, the tip
    // tumbling whole, in a moment of slow motion)
    this.tips.forEach((tip, i) => {
      if (!tip || this.tipFell[i] || p.grounded || p.x <= tip.pl.x + tip.pl.width + TIP.past) return;
      this.tipFell[i] = true;
      for (const q of this.sections) {
        if (q.owner !== i || q.pl.broken) continue;
        q.pl.broken = true;
        // (only what is within a view's width of him tumbles, the tip always: the rest of the branch end is gone off screen)
        if (q !== tip && Math.abs(q.pl.x + q.pl.width / 2 - p.x) > v.w / v.zoom + 200) continue;
        const k = ((q.pl.x * 0.618) % 1 + 1) % 1;
        const h = (q.pl.width * 100) / 370;
        if (q === tip) this.debris.push({ x: q.pl.x, y: q.pl.y - 8, w: q.pl.width, h: (q.pl.width * 173) / 375, vx: 30, vy: -20, rot: 0, vr: 0.9, t: 0, right: true, tip: true });
        else for (const right of [false, true]) this.debris.push({ x: q.pl.x + (right ? q.pl.width / 2 : 0), y: q.pl.y - 8, w: q.pl.width / 2, h, vx: (right ? 30 : -20) + 20 * k, vy: -30 - 40 * k, rot: 0, vr: (right ? 1 : -1) * (0.6 + k), t: 0, right });
      }
      sound.playHitImpact(true);
      host.slowMo(TIP.slow);
    });
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
    // (a tip whose stretch is ahead of his flag is whole again; one he respawns past stays fallen, as its front does)
    this.tipFell = this.lay.stretches.map((st) => !!st.tip && host.player.x >= st.end);
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
      if (d.tip ? !drawChaseSection(ctx, { x: -d.w / 2, y: -d.h / 2, width: d.w, chaseTip: true }, false, false) : !drawChaseBroken(ctx, d.right, -d.w / 2, -d.h / 2, d.w, d.h)) {
        ctx.fillStyle = '#7a5532';
        ctx.fillRect(-d.w / 2, -d.h / 4, d.w, d.h / 2);
      }
      ctx.restore();
    }
  }

  /** the danger at the trailing edge: the baked ember at the break (or the edge) at his feet, stronger the closer the front (screen px) */
  private drawEdge(ctx: CanvasRenderingContext2D, host: PieceHost) {
    const p = host.player;
    const behind = frontBehind(this.run, p.x);
    if (behind === null) return;
    const { k } = edgeTint(p.x - behind);
    if (k <= 0.02) return;
    const v = host.view;
    const cv = edgeCanvas(v.w, v.h);
    if (!cv) return;
    const was = ctx.globalAlpha;
    ctx.globalAlpha = EDGE.max * k;
    ctx.drawImage(cv, Math.max(0, (behind - v.x) * v.zoom) - cv.width / 2, (p.y + p.height - v.y) * v.zoom - cv.height / 2);
    ctx.globalAlpha = was;
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
