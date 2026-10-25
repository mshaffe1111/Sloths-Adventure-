/**
 * w4Play — World 4's pieces of play, run together during a stage (the Mist Cascades): falling rocks, the patience fern and the mist,
 * the falls that can be turned off and the pools they feed, the wind chimes, Dot's knots, the capuchins and the fruit that distracts
 * them. The rules live in their own pure modules (rockfall, patience, waterfalls, w4Kit, capuchin); this file keeps their state for one
 * run, steps them against Pokey each frame, and draws them. The engine only hands it what it needs through `W4Host`, so engine.ts gains
 * a field, a step call and two draw calls rather than seven mechanics.
 *
 * The pieces are painted (w4Art.ts, art batch 1); each draw keeps a plain-shape stand-in for the moment before the atlas loads. The
 * falling water itself stays drawn here, because it has to pour, ease and dry.
 */
import { drawDotFrame, flyFrame } from './dotSprite.ts';
import { drawW4, type W4Piece } from './w4Art.ts';
import { capBlocks, newCapuchin, stepGuard, stepLookout, stepThief, type CapState, type Capuchin } from './capuchin.ts';
import { frondSolid, isStill, mistReveal, newPatience, onSpot, stepPatience, type PatienceSpot, type PatienceState } from './patience.ts';
import { ROCK, rockAt, rockHits, type RockDrop } from './rockfall.ts';
import { FALLS, fallPush, inFall, plugged, poolLogY, stepFlow, stepPool, type Pool, type Waterfall } from './waterfalls.ts';
import { chimeLean, DOT_HELP, newKnot, stepKnot, underKnot, type Chime, type DotKnot, type KnotState } from './w4Kit.ts';
import { zoneState, type Zone } from './zones.ts';
import type { Collectible, Platform, PlayerState as Player, Vine } from './types.ts';

/** a fruit hanging in a tree: punch near it and it drops to `ground`, where a capuchin can smell it; it grows back after a while */
export interface FruitTree {
  x: number;
  y: number;
  ground: number;
}

/** what a World 4 stage adds (ProtoExtras.w4) */
export interface W4Extras {
  rocks?: RockDrop[];
  patience?: PatienceSpot[];
  falls?: Waterfall[];
  pools?: Pool[];
  chimes?: Chime[];
  knots?: DotKnot[];
  monkeys?: Array<Capuchin & { petalId?: number }>;
  fruit?: FruitTree[];
}

/** what the engine lends World 4 each frame */
export interface W4Host {
  t: number;
  player: Player;
  platforms: Platform[];
  vines: Vine[];
  collectibles: Collectible[];
  zones: readonly Zone[];
  /** his punch landed this frame (at his fist: x, y) */
  punch: { x: number; y: number } | null;
  /** he is hidden from watchers (in a bush, or behind pouring water) */
  hidden: boolean;
  hurt(dir: number): void;
  /** a Dot line, once per stage (`key` remembers it) */
  tip(key: string, text: string, seconds: number): void;
  float(text: string, x: number, y: number, color: string): void;
  /** a lookout called the Sovereign */
  screech(x: number): void;
  sfx(kind: 'rock' | 'chime' | 'monkey' | 'frond' | 'knot' | 'splash'): void;
}

const FRUIT_BACK = 9;
const KNOT_DROP = 0.8;

export class W4Play {
  private patience: PatienceState[];
  private flow: number[];
  private pool: number[];
  private knots: Array<KnotState & { freedAt?: number }>;
  private vineFull = new Map<number, number>();
  private monkeys: CapState[];
  private fruit: Array<{ state: 'hang' | 'fall' | 'ground' | 'gone'; x: number; y: number; vy: number; at: number }>;
  private chimeRang: number[];
  private rockHit = new Set<string>();

  constructor(private readonly w4: W4Extras, platforms: Platform[], vines: Vine[]) {
    this.patience = (w4.patience ?? []).map(() => newPatience());
    this.flow = (w4.falls ?? []).map(() => 1);
    this.pool = (w4.pools ?? []).map(() => 1);
    this.knots = (w4.knots ?? []).map(() => newKnot());
    this.monkeys = (w4.monkeys ?? []).map((m) => newCapuchin(m));
    this.fruit = (w4.fruit ?? []).map((f) => ({ state: 'hang', x: f.x, y: f.y, vy: 0, at: 0 }));
    this.chimeRang = (w4.chimes ?? []).map(() => -9);
    // a frond's bridge is not there until it unrolls
    for (const s of w4.patience ?? []) {
      const pl = s.kind === 'frond' ? platforms.find((q) => q.id === s.platformId) : undefined;
      if (pl) pl.broken = true;
    }
    // a knotted vine hangs rolled up under its knot until Dot frees it
    for (const k of w4.knots ?? []) {
      if (k.releases.kind !== 'vine') continue;
      const v = vines.find((q) => q.id === k.releases.id);
      if (!v) continue;
      this.vineFull.set(v.id, v.bottomY);
      v.bottomY = v.topY + 24;
    }
  }

  /** one frame. Returns how much of his walking speed is left (pouring water slows a wade) */
  step(dt: number, h: W4Host): { speed: number } {
    const p = h.player;
    const w4 = this.w4;
    let speed = 1;

    // falling rocks: the shadow warns, the rock falls, and it hurts only if it reaches him
    (w4.rocks ?? []).forEach((r, i) => {
      if (Math.abs(r.x - p.x) > 900) return;
      const s = rockAt(r, h.t);
      const cycle = `${i}:${Math.floor((h.t + r.offset) / r.every)}`;
      if (s.phase === 'warn' && Math.abs(r.x - p.x) < 500) h.tip('w4:rock', 'Rocks! Watch for the shadow on the ground, and wait for it to pass', 3.2);
      if (s.phase === 'shatter' && !this.rockHit.has(cycle + 's')) {
        this.rockHit.add(cycle + 's');
        if (Math.abs(r.x - p.x) < 700) h.sfx('rock');
      }
      if (!this.rockHit.has(cycle) && p.invincibleTimer <= 0 && rockHits(r, h.t, p.x, p.y, 64)) {
        this.rockHit.add(cycle);
        h.hurt(p.x >= r.x ? 1 : -1);
        h.tip('w4:rockHit', 'Ouch! Stop before the shadow, and go once the rock has fallen', 3.2);
      }
    });
    if (this.rockHit.size > 64) this.rockHit.clear();

    // patience: the fern frond unrolls for a sloth who waits on its spot; the mist settles for one who stands still
    const still = isStill(p);
    (w4.patience ?? []).forEach((s, i) => {
      const was = this.patience[i];
      const here = onSpot(s, p.x, p.y);
      if (here && !was.done && Math.abs(p.vx) >= 18) h.tip(`w4:${s.kind}`, s.kind === 'frond' ? 'This frond is curled up tight. Stand still beside it, and be patient' : 'The mist hides the way. Stand still and let it settle', 3.4);
      const now = stepPatience(s, was, here, still, dt);
      this.patience[i] = now;
      if (s.kind === 'frond' && now.done && !was.done) {
        const pl = h.platforms.find((q) => q.id === s.platformId);
        if (pl) pl.broken = false;
        h.sfx('frond');
        h.float('SLOW IS NOT STOPPED', p.x, p.y - 100, '#bbf7d0');
      }
    });

    // the falls: plugged by their boulder, or pouring on their own rhythm; the pools follow them, and the logs float on the pools
    const platX = (id: number) => h.platforms.find((q) => q.id === id)?.x;
    (w4.falls ?? []).forEach((w, i) => {
      const before = this.flow[i];
      this.flow[i] = stepFlow(w, before, plugged(w, platX), h.t, dt);
      if (before > FALLS.trickle && this.flow[i] <= FALLS.trickle && Math.abs(w.x - p.x) < 900) h.sfx('splash');
      if (!inFall(w, p.x, p.y, 64)) return;
      if (this.flow[i] > FALLS.trickle) {
        const v = fallPush(this.flow[i], p, dt);
        p.vy = v.vy;
        speed = Math.min(speed, 1 - (1 - FALLS.wade) * this.flow[i]);
        h.tip(w.surge ? 'w4:surge' : 'w4:fall', w.surge ? 'Too strong to climb! Wait in the cave for the water to ease' : 'The water pushes you back. Can you stop it at the top?', 3.4);
      }
    });
    (w4.pools ?? []).forEach((pool, i) => {
      const fi = (w4.falls ?? []).findIndex((w) => w.id === pool.fedBy);
      this.pool[i] = stepPool(this.pool[i], fi >= 0 ? this.flow[fi] : 1, dt);
      const log = h.platforms.find((q) => q.id === pool.platformId);
      if (log) log.y = poolLogY(pool, this.pool[i]);
    });

    // the chimes: ring when a gust is coming (on screen)
    (w4.chimes ?? []).forEach((c, i) => {
      const z = h.zones[c.zone];
      if (!z || Math.abs(c.x - p.x) > 700) return;
      const lean = chimeLean(z, h.t);
      if (lean.ringing && h.t - this.chimeRang[i] > 0.6) {
        this.chimeRang[i] = h.t;
        h.sfx('chime');
        if (zoneState(z, h.t).phase === 'warn') h.tip('w4:chime', 'Hear the chimes? The wind is coming, and they swing the way it blows', 3.4);
      }
    });

    // Dot and the knots: stand still under one and she flies up and picks it loose
    (w4.knots ?? []).forEach((k, i) => {
      const was = this.knots[i];
      const asking = underKnot(k, p.x, p.y) && still;
      if (was.phase === 'tied' && underKnot(k, p.x, p.y)) h.tip('w4:knot', 'That vine is tied up too high! Stand still under it and I will fly up', 3.2);
      const now: KnotState & { freedAt?: number } = stepKnot(was, asking, dt);
      if (now.phase === 'free' && was.phase !== 'free') {
        now.freedAt = h.t;
        h.sfx('knot');
        h.float('DOT PICKED THE KNOT!', k.x, k.y - 30, '#a7f3d0');
      } else if (was.freedAt !== undefined) now.freedAt = was.freedAt;
      this.knots[i] = now;
      if (now.freedAt !== undefined && k.releases.kind === 'vine') {
        const v = h.vines.find((q) => q.id === k.releases.id);
        const full = this.vineFull.get(k.releases.id);
        if (v && full !== undefined) {
          const u = Math.min(1, (h.t - now.freedAt) / KNOT_DROP);
          v.bottomY = v.topY + 24 + (full - v.topY - 24) * u * u;
        }
      }
    });

    // fruit: a punch near a hanging fruit knocks it down; it lies there until a monkey eats it, then grows back
    (w4.fruit ?? []).forEach((tree, i) => {
      const f = this.fruit[i];
      if (f.state === 'hang' && h.punch && Math.hypot(h.punch.x - f.x, h.punch.y - f.y) < 70) {
        f.state = 'fall';
        f.vy = 0;
      } else if (f.state === 'fall') {
        f.vy += 1400 * dt;
        f.y = Math.min(tree.ground - 10, f.y + f.vy * dt);
        if (f.y >= tree.ground - 10) f.state = 'ground';
      } else if (f.state === 'gone' && h.t - f.at > FRUIT_BACK) {
        f.state = 'hang';
        f.x = tree.x;
        f.y = tree.y;
      }
    });
    const lying = this.fruit.filter((f) => f.state === 'ground');

    // the capuchins
    (w4.monkeys ?? []).forEach((m, i) => {
      const s = this.monkeys[i];
      if (Math.abs(s.x - p.x) > 1200 && s.mode !== 'flee') return;
      if (m.job === 'thief') {
        const hit = !!h.punch && Math.abs(h.punch.x - s.x) < 50 && Math.abs(h.punch.y - (s.y - 20)) < 50;
        const ev = stepThief(m, s, p.x, p.y, hit, dt);
        const petal = m.petalId !== undefined ? h.collectibles.find((c) => c.id === m.petalId) : undefined;
        if (ev.grabbed) {
          if (petal) petal.collected = true;
          h.sfx('monkey');
          h.tip('w4:thief', 'Hey! That monkey took a petal! Catch it when it stops to tease you', 3.2);
        }
        if (ev.dropped) {
          if (petal) {
            petal.collected = false;
            petal.x = s.x;
            petal.y = s.y - 30;
          }
          h.sfx('monkey');
          h.float('IT DROPPED IT!', s.x, s.y - 60, '#fde68a');
        }
      } else if (m.job === 'lookout') {
        const ev = stepLookout(m, s, p.x, h.hidden, lying, dt);
        if (s.mode === 'stare') h.tip('w4:lookout', 'That monkey is watching! Get under cover before it shouts', 3);
        if (ev.screech) {
          h.sfx('monkey');
          h.float('EEK EEK!', s.x, s.y - 70, '#fca5a5');
          h.screech(s.x);
          h.tip('w4:screech', 'It gave you away! Knock some fruit down, and it will be too busy to look', 3.6);
        }
        if (ev.ate) {
          const f = this.fruit.find((q) => q.state === 'ground' && q.x === ev.ate!.x && q.y === ev.ate!.y);
          if (f) {
            f.state = 'gone';
            f.at = h.t;
          }
        }
      } else {
        const z = h.zones.find((q) => q.kind === 'wind' && s.x >= q.x0 && s.x <= q.x1 && s.y >= q.top && s.y <= q.bottom);
        const gust = z ? zoneState(z, h.t).phase === 'active' ? z.dir * zoneState(z, h.t).strength : 0 : 0;
        if (stepGuard(m, s, gust, dt).knocked) {
          h.sfx('monkey');
          h.float('WHOOOA!', s.x, s.y - 60, '#99f6e4');
        }
        if (capBlocks(m, s, p.x) && Math.abs(p.y - s.y) < 40) {
          // a guard on its feet will not let him by: he bumps back off it
          p.x = s.x + (p.x >= s.x ? 30 : -30);
          p.vx = 0;
          h.tip('w4:guard', 'The guard will not let you pass. Wait for the wind to blow it over', 3.2);
        }
      }
    });
    return { speed };
  }

  /** behind Pokey: the falls, the pools, the chimes, the rock shadows and rocks, the fern, the knots and Dot, the monkeys, the fruit */
  drawBack(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number }, zones: readonly Zone[]) {
    const w4 = this.w4;
    const near = (x: number, pad = 300) => x > view.x0 - pad && x < view.x1 + pad;
    (w4.falls ?? []).forEach((w, i) => near(w.x) && drawFall(ctx, w, this.flow[i], t));
    (w4.pools ?? []).forEach((pool, i) => {
      const fall = (w4.falls ?? []).find((w) => w.id === pool.fedBy);
      if (fall && near(fall.x)) drawPool(ctx, fall.x + fall.width / 2, pool, this.pool[i]);
    });
    (w4.chimes ?? []).forEach((c) => {
      const z = zones[c.zone];
      if (near(c.x)) drawChime(ctx, c, z ? chimeLean(z, t).angle : 0);
    });
    for (const r of w4.rocks ?? []) if (near(r.x)) drawRock(ctx, r, t);
    (w4.patience ?? []).forEach((s, i) => {
      if (s.kind === 'frond' && near(s.x1)) drawFrond(ctx, s, this.patience[i]);
    });
    (w4.knots ?? []).forEach((k, i) => near(k.x) && drawKnot(ctx, k, this.knots[i], t));
    this.fruit.forEach((f) => f.state !== 'gone' && near(f.x) && drawFruit(ctx, f.x, f.y));
    (w4.monkeys ?? []).forEach((m, i) => near(this.monkeys[i].x) && drawMonkey(ctx, m, this.monkeys[i], t));
  }

  /** in front of Pokey: the mist that hides the high ledges until he stands still */
  drawFront(ctx: CanvasRenderingContext2D, platforms: Platform[], t: number) {
    (this.w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist') return;
      const show = mistReveal(this.patience[i]);
      for (const id of s.hides ?? []) {
        const pl = platforms.find((q) => q.id === id);
        if (pl) drawMist(ctx, pl, 1 - show, t);
      }
    });
  }

  /** is he behind a pouring fall? (a hiding place from lookouts and the Sovereign) */
  behindFall(px: number, feetY: number): boolean {
    return (this.w4.falls ?? []).some((w, i) => this.flow[i] > 0.5 && inFall(w, px, feetY, 64));
  }

  /** a frond that has unrolled (for the tests and the stage check) */
  frondDone(i: number): boolean {
    return frondSolid(this.patience[i] ?? newPatience());
  }
}

// ───────────────────────────── drawing ─────────────────────────────

function drawFall(ctx: CanvasRenderingContext2D, w: Waterfall, flow: number, t: number) {
  if (flow <= 0.02) return;
  ctx.save();
  const width = w.width * (0.25 + 0.75 * flow);
  const x = w.x + (w.width - width) / 2;
  ctx.globalAlpha = 0.35 + 0.5 * flow;
  const g = ctx.createLinearGradient(x, 0, x + width, 0);
  g.addColorStop(0, '#93c5fd');
  g.addColorStop(0.5, '#e0f2fe');
  g.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = g;
  ctx.fillRect(x, w.top, width, w.bottom - w.top);
  // streaks running down
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 5; k++) {
    const sx = x + ((k + 0.5) / 5) * width;
    const off = ((t * 420 + k * 97) % 160) - 80;
    ctx.beginPath();
    for (let y = w.top + off; y < w.bottom; y += 160) {
      ctx.moveTo(sx, Math.max(w.top, y));
      ctx.lineTo(sx, Math.min(w.bottom, y + 60));
    }
    ctx.stroke();
  }
  // foam at the foot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    ctx.arc(x + (k / 5) * width, w.bottom - 4 + Math.sin(t * 8 + k) * 3, 8 * flow + 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPool(ctx: CanvasRenderingContext2D, cx: number, pool: Pool, level: number) {
  if (drawW4(ctx, 'poolEmpty', cx, pool.emptyY + 40, 260) && drawW4(ctx, 'poolFull', cx, pool.emptyY + 40, 260, { alpha: level })) return;
  const y = poolLogY(pool, level) + 14;
  ctx.save();
  ctx.fillStyle = 'rgba(56,189,248,0.45)';
  ctx.fillRect(cx - 120, y, 240, Math.max(0, pool.emptyY + 30 - y));
  ctx.restore();
}

function drawChime(ctx: CanvasRenderingContext2D, c: Chime, angle: number) {
  // the swinging painting leans its tubes to the right: mirrored for a gust blowing left, still between gusts
  const swing = Math.abs(angle) > 0.12;
  if (drawW4(ctx, swing ? 'chimesSwing' : 'chimesStill', c.x + 30, c.y, 96, { flip: swing && angle < 0, rot: swing ? angle * 0.15 : angle })) return;
  ctx.save();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x, c.y - 120);
  ctx.lineTo(c.x + 56, c.y - 120);
  ctx.stroke();
  for (let k = 0; k < 4; k++) {
    const hx = c.x + 14 + k * 13;
    ctx.save();
    ctx.translate(hx, c.y - 118);
    ctx.rotate(-angle * (0.8 + k * 0.1));
    ctx.strokeStyle = '#4b5320';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.fillStyle = '#a3a33a';
    ctx.fillRect(-3, 12, 7, 26 + k * 5);
    ctx.restore();
  }
  ctx.restore();
}

const SHARDS: W4Piece[] = ['shardA', 'shardB', 'shardC', 'shardD'];

function drawRock(ctx: CanvasRenderingContext2D, r: RockDrop, t: number) {
  const s = rockAt(r, t);
  ctx.save();
  const painted = s.phase === 'fall' ? drawW4(ctx, r.x % 2 ? 'rockMoss' : 'rock', r.x, s.y, ROCK.radius * 2.4, { rot: s.u * 2.5 }) : false;
  if (s.phase === 'shatter' && SHARDS.every((n, k) => drawW4(ctx, n, r.x + (k - 1.5) * (14 + 50 * s.u), r.land - 30 * Math.sin(Math.PI * Math.min(1, s.u * 1.4)) * (k % 2 ? 1 : 0.6), 20, { rot: s.u * (k - 1.5) * 3, alpha: 1 - s.u }))) {
    ctx.restore();
    return;
  }
  if (s.phase === 'warn' || s.phase === 'fall') {
    // the shadow on the ground grows as the rock comes
    const u = s.phase === 'warn' ? s.u * 0.6 : 0.6 + 0.4 * s.u;
    ctx.fillStyle = `rgba(15,23,42,${0.15 + 0.4 * u})`;
    ctx.beginPath();
    ctx.ellipse(r.x, r.land - 2, 10 + 26 * u, 4 + 6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (s.phase === 'warn') {
    // grit trickling from the ledge above
    ctx.fillStyle = '#9ca3af';
    for (let k = 0; k < 4; k++) ctx.fillRect(r.x - 8 + k * 5, r.top + ((t * 300 + k * 40) % 90), 3, 3);
  }
  if (s.phase === 'fall' && !painted) {
    ctx.fillStyle = '#6b7280';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r.x, s.y - ROCK.radius, ROCK.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(r.x - 4, s.y - ROCK.radius * 1.6, ROCK.radius * 0.5, Math.PI, 0);
    ctx.fill();
  }
  if (s.phase === 'shatter') {
    ctx.fillStyle = '#6b7280';
    ctx.globalAlpha = 1 - s.u;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI;
      const d = 10 + 40 * s.u;
      ctx.fillRect(r.x + Math.cos(a) * d * (k % 2 ? 1 : -1) - 4, r.land - Math.sin(a) * d * (1 - s.u) - 8, 8, 8);
    }
  }
  ctx.restore();
}

function drawFrond(ctx: CanvasRenderingContext2D, s: PatienceSpot, st: PatienceState) {
  const u = st.done ? 1 : st.level;
  // the four paintings, curled to bridge; the bridge lies across the gap past the spot, the others stand on the spot's edge
  if (u >= 1 ? drawW4(ctx, 'frondBridge', s.x1 + 90, s.y + 10, 200) : drawW4(ctx, u < 0.34 ? 'frondCurl' : u < 0.67 ? 'frondUncurl' : 'frondHalf', s.x1 + 10, s.y + 4, 64 + 30 * u, { rot: u * 0.6 })) return;
  const x0 = s.x1;
  const len = 160 * u;
  ctx.save();
  ctx.strokeStyle = '#3f7d2a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, s.y);
  ctx.lineTo(x0 + len, s.y - 2);
  ctx.stroke();
  // the tight curl still to unroll, at its tip
  const r = 26 * (1 - u) + 6;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2 * (2.2 - 1.6 * u); a += 0.2) {
    const rr = r * (1 - a / (Math.PI * 4.4));
    const px = x0 + len + Math.cos(a - Math.PI / 2) * rr;
    const py = s.y - r + Math.sin(a - Math.PI / 2) * rr + r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // leaflets along what has unrolled
  ctx.fillStyle = '#65a30d';
  for (let x = x0 + 10; x < x0 + len - 6; x += 16) {
    ctx.beginPath();
    ctx.ellipse(x, s.y - 8, 6, 12, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawKnot(ctx: CanvasRenderingContext2D, k: DotKnot, st: KnotState, t: number) {
  ctx.save();
  if (st.phase !== 'free') {
    ctx.strokeStyle = '#7c4a1e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(k.x, k.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Dot on her way up, then picking at it
  if (st.phase === 'flying' || st.phase === 'picking') {
    const u = st.phase === 'flying' ? Math.min(1, st.t / DOT_HELP.fly) : 1;
    const dx = k.x - 30 + Math.sin(t * 10) * (st.phase === 'picking' ? 6 : 0);
    const dy = k.ground - 90 + (k.y - (k.ground - 90)) * u;
    if (!drawDotFrame(ctx, flyFrame(t), dx, dy, 0.5, 1)) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(dx, dy, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawFruit(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** the painted pose for what a monkey is doing */
function monkeyPose(m: Capuchin, s: CapState): W4Piece {
  switch (s.mode) {
    case 'flee': return s.carrying ? 'capRunPetal' : 'capWalk';
    case 'tease': return s.carrying ? 'capHoldPetal' : 'capFists';
    case 'dropped': case 'blown': return 'capStartled';
    case 'stare': return 'capWorried';
    case 'screech': return 'capScreech';
    case 'lured': return 'capWalk';
    case 'eat': return 'capEat';
    case 'pace': return 'capGuard';
    default: return m.job === 'lookout' ? 'capPoint' : 'capSitBranch';
  }
}

function drawMonkey(ctx: CanvasRenderingContext2D, m: Capuchin, s: CapState, t: number) {
  const moving = s.mode === 'flee' || s.mode === 'lured' || s.mode === 'pace';
  const left = m.job === 'guard' ? s.dir < 0 : s.mode === 'flee' ? (m.path?.[s.post]?.x ?? s.x) < s.x : s.mode === 'lured' ? (s.fruit?.x ?? s.x) < s.x : false;
  const bob = moving ? Math.abs(Math.sin(t * 14)) * 3 : 0;
  if (s.mode === 'blown') {
    if (drawW4(ctx, 'capStartled', s.x + s.t * 300, s.y - s.t * 60, 64, { rot: s.t * 8, alpha: Math.max(0, 1 - s.t / 0.8) })) return;
  } else if (drawW4(ctx, monkeyPose(m, s), s.x, s.y - bob, 70, { flip: left })) {
    if (s.mode === 'stare') {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('?', s.x - 5, s.y - 82);
      ctx.restore();
    }
    return;
  }
  ctx.save();
  ctx.translate(s.x, s.y);
  if (s.mode === 'blown') {
    ctx.globalAlpha = Math.max(0, 1 - s.t / 0.8);
    ctx.translate(s.t * 300, -s.t * 60);
    ctx.rotate(s.t * 8);
  }
  // tail, body, cream face under a dark cap
  ctx.strokeStyle = '#3b2416';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.quadraticCurveTo(-30, -20, -24, -40 + Math.sin(t * 3) * 4);
  ctx.stroke();
  ctx.fillStyle = '#3b2416';
  ctx.beginPath();
  ctx.ellipse(0, -16 - bob, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5e6c8';
  ctx.beginPath();
  ctx.arc(6, -38 - bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2416';
  ctx.beginPath();
  ctx.arc(6, -44 - bob, 8, Math.PI, 0);
  ctx.fill();
  // what it is up to
  if (s.carrying) {
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(16, -34 - bob, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (s.mode === 'stare' || s.mode === 'screech') {
    ctx.fillStyle = s.mode === 'screech' ? '#ef4444' : '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(s.mode === 'screech' ? '!!' : '?', 0, -60);
  }
  if (m.job === 'guard' && s.mode === 'pace') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(10, -8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMist(ctx: CanvasRenderingContext2D, pl: Platform, a: number, t: number) {
  if (a <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#e2e8f0';
  for (let k = 0; k < 5; k++) {
    const x = pl.x + (k / 4) * pl.width + Math.sin(t * 0.6 + k) * 10;
    ctx.beginPath();
    ctx.ellipse(x, pl.y - 6, pl.width / 3, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
