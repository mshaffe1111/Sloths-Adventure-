/**
 * rollingPiece — the rolling nut and the bouncing fruit on the piece hook (1-8.md NEW 2; rolling.ts RollSpec; any world lays it by data).
 *
 * Each hazard waits until he comes within `rollAhead` of where it lands, then drops in from above (never from behind the HUD band),
 * lands with a thunk and comes at him: the nut rolls along the ground (it rattles once or twice as it lands, and spins as it rolls),
 * the fruit bounces in tall arcs phased to him (rolling.ts phasedPace), its shadow on the ground under it all the way. Off a ledge
 * or a broken section either falls; under the stage's pit line, or far behind him, it is gone.
 *
 * A touch: before the first crack a bump (back and a little up, no heart: the piece moves him, as a ride carries him); after it a
 * heart through the engine's damagePlayer (PieceHurt). Either way that hazard is spent. On a respawn every hazard ahead of his flag
 * waits again, and every one behind it is gone.
 *
 * The art is the inventory's (no new picture): the nut is the shell of World 1's nut pod (dressnew-w1 w1NutPod), the fruit one of the
 * cannonball tree's own fruits (M-10-d, the tree 1-8 stands at), each cut round once into a small canvas (baked, D6: re-baked when the
 * phone takes its canvases back) and stamped with one drawImage a frame. The shadow is one baked soft ellipse. Painted pieces for both
 * (1-8.md NEW 3) are the lead's Hugging Face call.
 */
import { sound } from '../audio.ts';
import { trackAtlas } from '../atlasLoader.ts';
import { canvasLost } from '../canvasLost.ts';
import { HUD_BAND } from '../cameraFollow.ts';
import { DRESS_NEW_FRAMES, DRESS_NEW_URLS } from '../dressNewData.ts';
import { phasedPace, rollAhead, rollProblems, rollRadius, rollRow, rollTeaches, rollTell, ROLL, type RollSpec } from '../rolling.ts';
import type { PieceHost, PieceHurt, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';

/** the stage's pit takes a life at levelHeight + 120 (engine.ts): a hazard under it is gone */
const PIT_LINE = 120;
/** his pace is smoothed over this long (s) for the fruit's phasing */
const PACE_S = 0.2;

/** one hazard as it runs */
export interface Rolling {
  readonly spec: RollSpec;
  /** a touch only bumps him */
  readonly teach: boolean;
  /** waiting (not yet set off), dropping (the tell), down (on the ground or bouncing), gone */
  phase: 'wait' | 'drop' | 'down' | 'gone';
  x: number;
  /** its middle */
  y: number;
  vx: number;
  vy: number;
  /** the drop: its start and its length (s), and where it starts and lands (its middle's y) */
  t: number;
  dropY0: number;
  landY: number;
  /** the way it goes, toward him (set as it lands) */
  dir: -1 | 1;
  /** the fruit: seconds into its current arc */
  air: number;
  /** the nut's rattle left (px) */
  rattle: number;
  spin: number;
  /** it has touched him once: harmless from now on */
  spent: boolean;
  /** the ground under it (its top's y), or null over a gap */
  ground: number | null;
}

// ───── the art: cut once, stamped each frame ─────
type Pic = { url: string; img: HTMLImageElement | null; ready: boolean };
const pics: Record<'nut' | 'tree', Pic> = {
  nut: { url: DRESS_NEW_URLS[1] ?? '', img: null, ready: false },
  tree: { url: typeof URL === 'undefined' ? '' : new URL('../../assets/w1-1109/M-10-d.png', import.meta.url).href, img: null, ready: false },
};
function pic(p: Pic): HTMLImageElement | null {
  if (!p.img && p.url && typeof Image !== 'undefined') {
    const im = new Image();
    p.img = im;
    trackAtlas(im, p.url, () => { p.ready = true; }, () => { p.img = null; }, () => { p.img = null; p.ready = false; baked.nut = baked.high = null; });
  }
  return p.ready ? p.img : null;
}
/** where each is cut from its picture: a circle (px of the picture). The nut: the round shell of the nut pod (its kernel showing
 *  through the crack), clear of the moss at its foot; the fruit: the lowest-left fruit on the cannonball tree, clear of the trunk */
export const CUT = {
  nut: { x: DRESS_NEW_FRAMES.w1NutPod.x + 96, y: DRESS_NEW_FRAMES.w1NutPod.y + 86, r: 78 },
  high: { x: 192, y: 599, r: 29 },
} as const;
/** baked at this many px across per px of world across (a phone at 3x density at a zoom over 1 still reads it sharp) */
const BAKE_K = 3;
const baked: { nut: HTMLCanvasElement | null; high: HTMLCanvasElement | null; shadow: HTMLCanvasElement | null } = { nut: null, high: null, shadow: null };
let bakeCount = 0;
/** how many times the art has been cut (a test reads it: once a load, never a frame) */
export const rollBakes = (): number => bakeCount;

function bake(kind: 'nut' | 'high'): HTMLCanvasElement | null {
  const was = baked[kind];
  if (was && !canvasLost(was, `rolling ${kind}`)) return was;
  const im = pic(kind === 'nut' ? pics.nut : pics.tree);
  if (!im || typeof document === 'undefined') return null;
  const r = kind === 'nut' ? ROLL.lowR : ROLL.highR;
  const size = Math.ceil(r * 2 * BAKE_K);
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d');
  if (!c) return null;
  const cut = CUT[kind];
  c.beginPath();
  c.arc(size / 2, size / 2, size / 2 - 0.5, 0, Math.PI * 2);
  c.clip();
  c.drawImage(im, cut.x - cut.r, cut.y - cut.r, cut.r * 2, cut.r * 2, 0, 0, size, size);
  // (a thin dark rim, so it never melts into the bark it rolls on)
  c.lineWidth = Math.max(2, size * 0.04);
  c.strokeStyle = 'rgba(40, 22, 10, 0.85)';
  c.stroke();
  baked[kind] = cv;
  bakeCount++;
  return cv;
}

/** the ground shadow: a soft dark ellipse, baked once (no gradient a frame) */
function shadowCanvas(): HTMLCanvasElement | null {
  if (baked.shadow && !canvasLost(baked.shadow, 'rolling shadow')) return baked.shadow;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = 96;
  cv.height = 24;
  const c = cv.getContext('2d');
  if (!c) return null;
  c.save();
  c.translate(48, 12);
  c.scale(1, 0.25);
  const g = c.createRadialGradient(0, 0, 4, 0, 0, 46);
  g.addColorStop(0, 'rgba(20, 12, 4, 0.55)');
  g.addColorStop(1, 'rgba(20, 12, 4, 0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 46, 0, Math.PI * 2);
  c.fill();
  c.restore();
  baked.shadow = cv;
  bakeCount++;
  return cv;
}

/** the ground's top under x for a body whose bottom is at `bottom` (a step up of a few px is taken, as he takes it), or null */
function groundAt(plats: readonly Platform[], x: number, bottom: number): number | null {
  let best: number | null = null;
  for (const pl of plats) {
    if (pl.broken || x < pl.x || x > pl.x + pl.width) continue;
    if (pl.y < bottom - 10) continue;
    if (best === null || pl.y < best) best = pl.y;
  }
  return best;
}

export class RollingPiece implements StagePiece {
  readonly kind = 'rolling';
  readonly layers: readonly PieceLayer[] = ['world'];
  /** every hazard of the stage, left to right (the bots read them: what is on screen) */
  readonly list: Rolling[];
  /** his pace across, smoothed over about PACE_S (a thumb on and off is a walk, not a stop and a run): the fruit phases to it */
  private pace = 0;

  constructor(specs: readonly RollSpec[], chase: import('../chase.ts').ChaseLay | undefined, private readonly plats: readonly Platform[], private readonly pitY: number, private readonly easy: boolean) {
    this.list = [...specs].sort((a, b) => a.dropX - b.dropX).map((spec) => this.fresh(spec, rollTeaches(spec, chase)));
    // (start the art's load now: the first drop is seconds away)
    pic(pics.nut);
    pic(pics.tree);
  }

  private fresh(spec: RollSpec, teach: boolean): Rolling {
    return { spec, teach, phase: 'wait', x: spec.dropX, y: 0, vx: 0, vy: 0, t: 0, air: 0, dropY0: 0, landY: 0, dir: -1, rattle: 0, spin: 0, spent: false, ground: null };
  }

  step(dt: number, host: PieceHost) {
    const p = host.player;
    // (his x is his middle and his y his feet: engine.ts's landing, 'the player's CENTRE')
    const mid = p.x;
    this.pace += (p.vx - this.pace) * Math.min(1, dt / PACE_S);
    for (const h of this.list) {
      if (h.phase === 'gone') continue;
      const r = rollRadius(h.spec.kind);
      if (h.phase === 'wait') {
        if (Math.abs(h.spec.dropX - mid) > rollAhead(h.spec, this.easy)) continue;
        // (set off: it lands on the ground under its drop x; it starts over it, never higher than the HUD band leaves in view)
        // (the ground there at about his height: a top no more than a step's climb over his feet, as the branch rises)
        const top = groundAt(this.plats, h.spec.dropX, p.y - 150);
        if (top === null) { h.phase = 'gone'; continue; }
        const v = host.view;
        const band = (v.h > v.w ? HUD_BAND.port : HUD_BAND.land) / (v.zoom || 1);
        h.landY = top - r;
        h.dropY0 = Math.min(h.landY - 40, Math.max(h.landY - ROLL.dropH, v.y + band + r + 4));
        h.x = h.spec.dropX;
        h.y = h.dropY0;
        h.t = 0;
        h.phase = 'drop';
        h.ground = top;
        continue;
      }
      if (h.phase === 'drop') {
        // (the tell: it falls as a thing falls, faster and faster, over exactly the setting's tell)
        h.t += dt;
        const tell = rollTell(this.easy);
        const u = Math.min(1, h.t / tell);
        h.y = h.dropY0 + (h.landY - h.dropY0) * u * u;
        if (u >= 1) this.land(h, host);
        continue;
      }
      // (down: across, and under gravity; a fruit in the air eases its pace to meet him mid-arc as he goes on)
      const { speed, bounce } = rollRow(h.spec, this.easy);
      if (h.spec.kind === 'high') {
        h.air += dt;
        const want = phasedPace(h.x, mid, this.pace, h.dir, speed, bounce, h.air);
        const dv = ROLL.phaseAcc * dt;
        h.vx += Math.max(-dv, Math.min(dv, want - h.vx));
      }
      h.x += h.vx * dt;
      h.spin += (h.vx * dt) / r;
      const top = groundAt(this.plats, h.x, h.y + r);
      h.ground = top;
      h.vy = Math.min(ROLL.maxFall, h.vy + ROLL.grav * dt);
      h.y += h.vy * dt;
      if (top !== null && h.y + r >= top && h.vy >= 0) {
        h.y = top - r;
        if (h.spec.kind === 'high') {
          // (each landing: up again to the same top, its pace across phased so it meets him mid-arc)
          h.vy = -Math.sqrt(2 * ROLL.grav * bounce);
          h.air = 0;
          if (this.near(h, host)) sound.playLand(0.55);
        } else if (h.rattle > 2) {
          h.vy = -Math.sqrt(2 * ROLL.grav * h.rattle);
          h.rattle *= 0.45;
        } else {
          h.vy = 0;
        }
      }
      if (h.y - r > this.pitY || (h.x - mid) * h.dir < -ROLL.behindGone) h.phase = 'gone';
    }
  }

  /** the thunk: it lands, and turns toward him */
  private land(h: Rolling, host: PieceHost) {
    const p = host.player;
    const mid = p.x;
    h.y = h.landY;
    h.dir = mid < h.x ? -1 : 1;
    h.phase = 'down';
    const { speed, bounce } = rollRow(h.spec, this.easy);
    if (h.spec.kind === 'high') {
      h.vy = -Math.sqrt(2 * ROLL.grav * bounce);
      h.air = 0;
      h.vx = phasedPace(h.x, mid, this.pace, h.dir, speed, bounce, 0);
    } else {
      h.vx = h.dir * speed;
      h.rattle = h.spec.bounce;
      h.vy = h.rattle > 2 ? -Math.sqrt(2 * ROLL.grav * h.rattle) : 0;
      h.rattle *= 0.45;
    }
    sound.playLand(h.spec.kind === 'high' ? 0.9 : 0.7);
  }

  private near(h: Rolling, host: PieceHost): boolean {
    const v = host.view;
    return h.x > v.x - 100 && h.x < v.x + v.w / (v.zoom || 1) + 100;
  }

  /** a touch: his box (shrunk by ROLL.forgive) against its round */
  private touching(h: Rolling, p: PieceHost['player']): boolean {
    const r = rollRadius(h.spec.kind);
    const f = ROLL.forgive;
    // (against the fruit, his DRAWN height (89.1, D41): a fruit through his hair reads as a hit, so it is one, and one that clears it is not)
    const feet = p.y;
    const x0 = p.x - p.width / 2 + f, x1 = p.x + p.width / 2 - f, y0 = feet - (h.spec.kind === 'high' ? ROLL.head : p.height) + f, y1 = feet - f;
    const cx = Math.max(x0, Math.min(x1, h.x)), cy = Math.max(y0, Math.min(y1, h.y));
    return (h.x - cx) ** 2 + (h.y - cy) ** 2 < r * r;
  }

  hurts(host: PieceHost): PieceHurt | null {
    const p = host.player;
    if (p.isVineSwinging || p.climbing) return null;
    for (const h of this.list) {
      if (h.phase !== 'down' || h.spent || !this.touching(h, p)) continue;
      h.spent = true;
      if (h.teach) {
        // (a teach: back from it and a little up, no heart; the nut keeps rolling, harmless now)
        const away = p.x < h.x ? -1 : 1;
        p.vx = away * ROLL.bumpVx;
        p.vy = -ROLL.bumpVy;
        p.grounded = false;
        sound.playHitImpact(false);
        return null;
      }
      return { amount: 1, fromX: h.x };
    }
    return null;
  }

  respawn(host: PieceHost) {
    // (back at his flag: every hazard ahead of it waits to drop again; every one behind it is gone)
    const mid = host.player.x;
    for (let i = 0; i < this.list.length; i++) {
      const h = this.list[i];
      this.list[i] = h.spec.dropX > mid ? this.fresh(h.spec, h.teach) : { ...h, phase: 'gone' };
    }
  }

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: PieceHost) {
    const v = host.view;
    const left = v.x - 100, right = v.x + v.w / (v.zoom || 1) + 100;
    const sh = shadowCanvas();
    for (const h of this.list) {
      if (h.phase === 'wait' || h.phase === 'gone' || h.x < left || h.x > right) continue;
      const r = rollRadius(h.spec.kind);
      // (its shadow on the ground under it: smaller and fainter the higher it is, so its height reads at a glance)
      if (sh && h.ground !== null) {
        const up = Math.max(0, h.ground - (h.y + r));
        const k = Math.max(0.35, 1 - up / 260);
        const w = r * 2.4 * k;
        const was = ctx.globalAlpha;
        ctx.globalAlpha = was * (0.35 + 0.65 * k);
        ctx.drawImage(sh, h.x - w / 2, h.ground - w * 0.125, w, w * 0.25);
        ctx.globalAlpha = was;
      }
      const cv = bake(h.spec.kind === 'low' ? 'nut' : 'high');
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.spin);
      if (cv) ctx.drawImage(cv, -r, -r, r * 2, r * 2);
      else {
        // (the art still loading: a plain nut of its colour, for the first frame or two)
        ctx.fillStyle = h.spec.kind === 'low' ? '#9a6a3a' : '#6e4a2e';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

export const ROLLING_PIECE: PieceKind = {
  id: 'rolling',
  start(stage, host) {
    const specs = stage.rolling;
    if (!specs?.length) return null;
    // (a lay that cannot run fair is refused by name, never run: the same check the lay calls)
    const bad = rollProblems(specs);
    if (bad.length) {
      console.error(`rolling lay refused: ${bad.join('; ')}`);
      return null;
    }
    return new RollingPiece(specs, stage.chase, host.platforms, stage.config.levelHeight + PIT_LINE, host.easy);
  },
};
