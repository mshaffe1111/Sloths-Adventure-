/**
 * Shared plumbing for the painted bosses (Venom Fang, Crocus Rex, ...): load an atlas, keep a little motion memory per boss
 * (speed and distance walked, for the walk cycle), pick a frame from what the boss brain is doing and draw it on the floor.
 *
 * Each boss supplies its own atlas, scale and `pick` function (which frame goes with which state / move). Like every painted
 * creature it is a switch, not a replacement: `?<param>=sprite|classic`, `localStorage.sloth_<param>`, and a per-boss default.
 * It draws nothing while the atlas loads or when switched off, and bossArt.ts then draws the vector boss.
 */
import type { BossEntity } from './types.ts';
import type { BossBrain, BossDef, MoveDef } from './bossAI.ts';
import { trackAtlas } from './atlasLoader.ts';
import { bossMotion } from './bossMotion.ts';

export interface BossFrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
}

export interface PickContext {
  b: BossEntity;
  def: BossDef;
  br: BossBrain;
  /** the move being wound up / performed (null while idle) */
  m: MoveDef | null;
  moving: boolean;
  /** world units walked so far */
  dist: number;
  time: number;
}

export interface PaintedBossSpec {
  /** the query parameter and localStorage suffix: `?venom=sprite` / `sloth_venom` */
  param: string;
  defaultOn: boolean;
  url: string;
  frames: Record<string, BossFrameRect>;
  /** world units per atlas pixel */
  k: number;
  /** a soft rim of light around a boss that is dark against its arena (shadowBlur colour); none by default */
  glow?: string;
  pick: (c: PickContext) => string;
}

export interface PaintedBoss {
  active(): boolean;
  draw(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, time: number, feetY: number): boolean;
  /** one named frame, anchored at the origin (the middle of the body on the ground line), for the story cards */
  still(ctx: CanvasRenderingContext2D, name: string): boolean;
}

export function createPaintedBoss(spec: PaintedBossSpec): PaintedBoss {
  let enabled: boolean | null = null;
  const isEnabled = () => {
    if (enabled !== null) return enabled;
    let v = spec.defaultOn;
    try {
      const q = new URLSearchParams(location.search).get(spec.param);
      if (q === 'sprite') v = true;
      else if (q === 'classic') v = false;
      else if (localStorage.getItem('sloth_' + spec.param) === 'sprite') v = true;
    } catch {
      /* no window or storage: keep the default */
    }
    enabled = v;
    return v;
  };
  let atlas: HTMLImageElement | null = null;
  let ready = false;
  const load = () => {
    if (atlas || typeof Image === 'undefined') return;
    const img = new Image();
    atlas = img;
    trackAtlas(img, spec.url, () => { ready = true; }, () => { atlas = null; });
  };
  const active = () => {
    if (!isEnabled()) return false;
    load();
    return ready;
  };
  const memory = new WeakMap<BossEntity, { x: number; t: number; vx: number; dist: number }>();

  return {
    active,
    still(ctx, name) {
      if (!active() || !atlas) return false;
      const f = spec.frames[name];
      if (!f) return false;
      if (spec.glow) {
        ctx.shadowColor = spec.glow;
        ctx.shadowBlur = 12;
      }
      ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * spec.k, -f.ay * spec.k, f.w * spec.k, f.h * spec.k);
      return true;
    },
    draw(ctx, b, def, time, feetY) {
      if (!active() || !atlas) return false;
      const br = b.ai;
      if (!br) return false;
      let mem = memory.get(b);
      if (!mem) {
        mem = { x: b.x, t: time, vx: 0, dist: 0 };
        memory.set(b, mem);
      }
      const dt = Math.max(0.001, Math.min(0.1, time - mem.t));
      mem.vx += ((b.x - mem.x) / dt - mem.vx) * Math.min(1, dt * 12);
      mem.dist += Math.abs(mem.vx) * dt;
      mem.x = b.x;
      mem.t = time;
      const m = br.move ? def.moves[br.move] ?? null : null;
      const name = spec.pick({ b, def, br, m, moving: Math.abs(mem.vx) > 12, dist: mem.dist, time });
      const f = spec.frames[name];
      if (!f) return false;
      const mo = bossMotion({
        state: br.state, t: br.t, tell: m?.tell ?? 0, act: m?.act ?? 0, pose: m?.pose ?? null,
        phase: b.phase, time, moving: Math.abs(mem.vx) > 12, hit: b.hitFlashTimer,
      });
      const dir = b.facing < 0 ? -1 : 1;
      ctx.save();
      ctx.translate(b.x + mo.dx * dir, feetY + mo.dy);
      ctx.rotate(-mo.rot * dir);
      ctx.scale(dir * mo.sx, mo.sy);
      if (b.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
      if (spec.glow) {
        ctx.shadowColor = spec.glow;
        ctx.shadowBlur = 9;
      }
      const k = spec.k * (def.scale ?? 1);
      ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
      ctx.restore();
      return true;
    },
  };
}
