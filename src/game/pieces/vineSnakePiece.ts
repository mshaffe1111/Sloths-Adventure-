/**
 * pieces/vineSnakePiece — the vine snake (vineSnake.ts; 1-6.md NEW 2, ENG-S2) on the piece hook: every liana whose data carries a
 * `snake` gets one, keeping its beat on the stage's one clock and riding the liana's grip line wherever the liana's swing has it now.
 *
 *   step    reads its beat (its tell, its trip) and, if he swings on that liana and any of it reaches his hands while it travels, makes
 *           him let go (host.letGo: a startle hop off, never a bite). It never hurts him: no `hurts`.
 *   draw    'world' (over the liana, behind him): the tell is the hiss pose, reared at the end it starts from (on the bough at the
 *           anchor, or at the liana's foot), turned to face him; the trip is the hanging pose laid along the liana at its swing angle,
 *           head first, fading in and out only where it is off the vine (into the bough or the ferns).
 *   respawn a travelling snake has nothing to put back (where it is comes from the clock alone); a startled false liana hangs again.
 *
 * A FALSE liana (vineSnake.ts isFalseLiana, 1-6.md beat 13) is the snake itself hanging stiff from a bough: brown (its disguise), drawn
 * the liana's length, head at its foot. The engine catches it like any liana; the step after he takes it, it startles: he lets go (the
 * same letGo hop), the liana is `off` (not there, not caught), and the snake drops with him onto what is below, slithers off away from him
 * unhurt and is gone. It is whole again when he respawns.
 *
 * The liana's geometry is the stage's own Vine (the engine draws, catches and swings that same object; engine.ts writes swingAngle on
 * it from the vines' clock every step, before the pieces step). No stage id, world, seed or x here: all of it is the stage's data.
 */
import { VINE_HANG } from '../heroVine.ts';
import type { PieceHost, PieceKind, StagePiece } from '../stagePiece.types.ts';
import type { Vine } from '../types.ts';
import type { Platform } from '../types.ts';
import { FALSE_LIANA, isFalseLiana, onVine, SNAKE, snakeNow, snakeTouches, type SnakeNow } from '../vineSnake.ts';
import { VINE_SNAKE_ART, vineSnakeImg } from '../vineSnakeArt.ts';

/** how far down the liana (px from its anchor) his hands are while he swings on it: grip to toes is VINE_HANG (heroVine.ts) */
export function handsAlong(swingLength: number, len: number): number {
  return Math.max(0, Math.min(len, swingLength - VINE_HANG));
}

type Snaked = Vine & { snake: NonNullable<Vine['snake']> };

/** a false liana startled off its bough: falling with him, then slithering off, then gone */
interface Startle {
  /** where its hanging pose's middle is (falling) or its belly is (slithering), px */
  x: number;
  y: number;
  vy: number;
  /** -1 or 1: the way it slithers off, away from him */
  away: number;
  /** the top of what it lands on, once it has */
  floor: number | null;
  /** seconds slithering */
  t: number;
}

/** the top of the highest platform under (x, y) within `reach` px, or null */
function floorUnder(platforms: readonly Platform[], x: number, y: number, reach: number): number | null {
  let best: number | null = null;
  for (const pl of platforms) {
    if (pl.broken || x < pl.x || x > pl.x + pl.width || pl.y < y || pl.y > y + reach) continue;
    if (best === null || pl.y < best) best = pl.y;
  }
  return best;
}

class VineSnakePiece implements StagePiece {
  readonly kind = 'vine-snake';
  readonly layers = ['world'] as const;
  /** each snake's place this step (drawn from it, so the draw never reads the clock again) */
  readonly now: SnakeNow[];
  /** how many times a snake has made him let go (the recorder and the tests) */
  letGos = 0;
  /** each false liana's startle (null while it hangs; done once gone) */
  readonly startled: Array<Startle | null>;
  constructor(readonly vines: readonly Snaked[]) {
    this.now = vines.map(() => ({ shown: false, tell: false, live: false, head: 0, tail: 0, dir: 1 }));
    this.startled = vines.map(() => null);
  }

  step(dt: number, host: PieceHost) {
    const p = host.player;
    for (let i = 0; i < this.vines.length; i++) {
      const v = this.vines[i];
      const len = v.bottomY - v.topY;
      if (isFalseLiana(v)) {
        this.stepFalse(i, v, dt, host);
        continue;
      }
      const n = v.snake.clock ? snakeNow(v.snake, len, host.clock.read(v.snake.clock, v.snake.shift ?? 0)) : this.now[i];
      this.now[i] = n;
      if (p.isVineSwinging && p.swingVineId === v.id && snakeTouches(n, len, handsAlong(p.swingLength ?? 0, len)) && host.letGo()) this.letGos++;
    }
  }

  private stepFalse(i: number, v: Snaked, dt: number, host: PieceHost) {
    const p = host.player;
    const s = this.startled[i];
    if (!s) {
      // (he took it for a liana: it startles, he lets go, and it drops with him)
      if (p.isVineSwinging && p.swingVineId === v.id && host.letGo()) {
        this.letGos++;
        v.off = true;
        this.startled[i] = { x: v.x, y: (v.topY + v.bottomY) / 2, vy: Math.min(p.vy, 0), away: p.x < v.x ? 1 : -1, floor: null, t: 0 };
      }
      return;
    }
    if (s.floor === null) {
      const half = (v.bottomY - v.topY) / 2;
      const under = floorUnder(host.platforms, s.x, s.y + half - 2, 1600);
      s.vy += FALSE_LIANA.fall * dt;
      s.y += s.vy * dt;
      // (down on the floor: it slithers off away from where he is NOW, never back through him; he has fallen on past it meanwhile)
      if (under !== null && s.y + half >= under) (s.floor = under), (s.y = under), (s.away = p.x <= s.x ? 1 : -1);
      else if (under === null && s.vy * dt > 0 && s.y > v.bottomY + 1600) s.t = FALSE_LIANA.slither;
      return;
    }
    s.t += dt;
    s.x += s.away * FALSE_LIANA.speed * dt;
  }

  respawn() {
    for (let i = 0; i < this.vines.length; i++) {
      if (!isFalseLiana(this.vines[i])) continue;
      this.startled[i] = null;
      this.vines[i].off = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, _layer: 'world' | 'front' | 'screen', host: PieceHost) {
    for (let i = 0; i < this.vines.length; i++) {
      const v = this.vines[i];
      if (isFalseLiana(v)) {
        this.drawFalse(ctx, i, v);
        continue;
      }
      const n = this.now[i];
      if (!n.shown) continue;
      const len = v.bottomY - v.topY;
      const a = v.swingAngle ?? 0;
      const ux = Math.sin(a), uy = Math.cos(a);
      if (n.tell) {
        const img = vineSnakeImg('hiss');
        if (!img) continue;
        const A = VINE_SNAKE_ART.hiss;
        const h = A.drawH, w = (A.w / A.h) * h;
        // (reared where it starts: its coil's foot on the anchor, on the bough; or on the liana's foot. Its head turned toward him)
        const d = n.dir === 1 ? 0 : len;
        const x = v.x + ux * d, y = v.topY + uy * d;
        const face = host.player.x < x ? -1 : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(face, 1);
        ctx.drawImage(img, -w / 2, -h, w, h);
        ctx.restore();
        continue;
      }
      const img = vineSnakeImg('hang');
      if (!img) continue;
      const on = onVine(n, len);
      // (only where it is off the vine does it fade: going into the bough, or off the foot into the ferns)
      const alpha = on ? Math.min(1, ((on.to - on.from) / SNAKE.body) * 1.5) : 0;
      if (alpha <= 0.01) continue;
      const A = VINE_SNAKE_ART.hang;
      const h = SNAKE.body, w = (A.w / A.h) * h;
      const mid = (n.head + n.tail) / 2;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(v.x + ux * mid, v.topY + uy * mid);
      // (the pose hangs head-down: turned to the liana's angle; heading up, it is turned end for end so its head leads)
      ctx.rotate(-a);
      if (n.dir === -1) ctx.scale(1, -1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  /** a false liana: hanging the liana's length, brown, head at its foot; startled, falling with him, then slithering off and fading */
  private drawFalse(ctx: CanvasRenderingContext2D, i: number, v: Snaked) {
    const s = this.startled[i];
    const len = v.bottomY - v.topY;
    if (!s || s.floor === null) {
      const img = vineSnakeImg('hang-brown');
      if (!img) return;
      const A = VINE_SNAKE_ART.hang;
      const h = len, w = (A.w / A.h) * h;
      const cy = s ? s.y : (v.topY + v.bottomY) / 2;
      ctx.drawImage(img, (s ? s.x : v.x) - w / 2, cy - h / 2, w, h);
      return;
    }
    if (s.t >= FALSE_LIANA.slither) return;
    const img = vineSnakeImg('slide-brown');
    if (!img) return;
    const A = VINE_SNAKE_ART.slide;
    // (slithering off, its belly on the floor it landed on, head the way it goes, at the scale its hanging pose was drawn (the two cuts share
    // one scale, 3 px a unit: a 115 px false liana slithers off 130 px long); it fades over the last 40% of its slither)
    const k = len / VINE_SNAKE_ART.hang.h;
    const w = A.w * k, h = A.h * k;
    const fade = Math.min(1, (FALSE_LIANA.slither - s.t) / (FALSE_LIANA.slither * 0.4));
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.translate(s.x, s.floor);
    ctx.scale(s.away, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  }
}

export const VINE_SNAKE_PIECE: PieceKind = {
  id: 'vine-snake',
  start(stage) {
    const vines = (stage.vines ?? []).filter((v): v is Snaked => !!v.snake && v.vineType !== 'tree_climb');
    return vines.length ? new VineSnakePiece(vines) : null;
  },
};
