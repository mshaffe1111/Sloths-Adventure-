/**
 * w4Play — World 4's pieces of play, run together during a stage (the Mist Cascades): falling rocks, the patience fern and the mist,
 * the falls that can be turned off and the pools they feed, the wind chimes, Dot's knots, the capuchins and the fruit that distracts
 * them. The rules live in their own pure modules (rockfall, patience, waterfalls, w4Kit, capuchin); this file keeps their state for one
 * run, steps them against Pokey each frame, and draws them. The engine only hands it what it needs through `W4Host`, so engine.ts gains
 * a field, a step call and two draw calls rather than seven mechanics.
 *
 * The pieces are painted (w4Art.ts, art batches 1 and 2); each draw keeps a plain-shape stand-in for the moment before the atlas loads.
 * The falling water itself stays drawn here, because it has to pour, ease and dry; only the lip it pours over is painted.
 */
import { drawDotFrame, flyFrame } from './dotSprite.ts';
import { drawW4, w4ArtReady, w4Height, type W4Piece } from './w4Art.ts';
import { NEST, nearNest, nestAt, nestCycle, type Nest, type NestPhase } from './eaglet.ts';
import { capBlocks, newCapuchin, stepGuard, stepLookout, stepThief, type CapState, type Capuchin } from './capuchin.ts';
import { frondSolid, isStill, mistReveal, newPatience, onSpot, stepPatience, type PatienceSpot, type PatienceState } from './patience.ts';
import { ROCK, rockAt, rockHits, type RockDrop } from './rockfall.ts';
import { FALLS, fallPush, inFall, plugged, poolLogY, stepFlow, stepPool, type Pool, type Waterfall } from './waterfalls.ts';
import { chimeLean, DOT_HELP, newKnot, stepKnot, underKnot, type Chime, type DotKnot, type KnotState } from './w4Kit.ts';
import { zoneState, type Zone } from './zones.ts';
import { nestWind, type CliffNest } from './w4Nests.ts';
import type { Collectible, Platform, PlayerState as Player, Vine } from './types.ts';

/** a fruit hanging in a tree: punch near it and it drops to `ground`, where a capuchin can smell it; it grows back after a while */
export interface FruitTree {
  x: number;
  y: number;
  ground: number;
  /** which side of its fruit the trunk stands (drawn only): -1 left (the default), 1 right */
  trunk?: 1 | -1;
}

/** warm air rising out of the mist (4-7): an open leaf inside it is lifted, like the vents' warm air in World 9 */
export interface Updraft {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
}

/** a painted World 4 piece standing in the scene, behind Pokey (a channel along a shelf, a cave): bottom middle at (x, b), `w` wide */
export interface W4Decor {
  n: W4Piece;
  x: number;
  b: number;
  w: number;
  flip?: boolean;
  /** the id of the fall whose water it shows: drawn faint once that fall runs dry */
  wet?: number;
}

/** what a World 4 stage adds (ProtoExtras.w4) */
export interface W4Extras {
  rocks?: RockDrop[];
  patience?: PatienceSpot[];
  falls?: Waterfall[];
  /** `art`: where the basin is painted (its middle, its bottom, its width), when it is not centred under its fall */
  pools?: Array<Pool & { art?: { cx: number; b: number; w: number } }>;
  chimes?: Chime[];
  knots?: DotKnot[];
  monkeys?: Array<Capuchin & { petalId?: number }>;
  fruit?: FruitTree[];
  updrafts?: Updraft[];
  /** a fall this far below the ledge he last stood on is a fall into the mist (4-7: the gaps have no floor) */
  deepFall?: number;
  /** 4-6: sleeping eaglets (eaglet.ts) */
  nests?: Nest[];
  decor?: W4Decor[];
  /** 4-8's nests on the cliff (w4Nests.ts): which cage each one is and the puzzle around it; a freed chick's parent blows a tailwind */
  cliffNests?: CliffNest[];
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
  sfx(kind: 'rock' | 'chime' | 'monkey' | 'frond' | 'knot' | 'splash' | 'gust'): void;
  /** he fell into the mist (deepFall) */
  fellOff?(): void;
}

const FRUIT_BACK = 9;
/** the mist bank: how thick it is (alpha) where it has not settled, the haze left where it has, and how softly its edges fade (px) */
const MIST_THICK = 0.9;
const MIST_HAZE = 0.12;
const MIST_EDGE = 70;
const CLEAR_EDGE = 24;
/** how far y is outside a band of mist (0 inside it) */
const bandGap = (b: { top: number; bottom: number }, y: number) => (y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0);
const KNOT_DROP = 0.8;
/** a guard on its feet leaps up and shoves him back if he tries to jump over it: it reaches this far above its feet (px) */
export const GUARD_LEAP = 200;

/** where a knotted vine ends while it is tied: at its knot, never shorter than a rolled-up bundle at its top, never longer than itself */
export const tiedBottom = (topY: number, bottomY: number, knotY: number): number => Math.min(bottomY, Math.max(topY + 24, knotY));

export class W4Play {
  private patience: PatienceState[];
  private flow: number[];
  private pool: number[];
  private knots: Array<KnotState & { freedAt?: number }>;
  /** the host's clock at the last step (s) */
  private clock = 0;
  private vineFull = new Map<number, number>();
  private vineTied = new Map<number, number>();
  private monkeys: CapState[];
  private fruit: Array<{ state: 'hang' | 'fall' | 'ground' | 'gone'; x: number; y: number; vy: number; at: number }>;
  private chimeRang: number[];
  private rockHit = new Set<string>();
  /** the height of the ground he last stood on (deepFall) */
  private groundY = NaN;
  /** the view drawBack last drew (drawFront culls by it) */
  private view = { x0: -Infinity, x1: Infinity };
  /** each nest: the last look that blew him back, and when its latest flurry started and which way it pushes */
  private nestBlow: Array<{ cycle: number; at: number; dir: number }>;

  constructor(private readonly w4: W4Extras, platforms: Platform[], private readonly vines: Vine[]) {
    this.patience = (w4.patience ?? []).map(() => newPatience());
    this.flow = (w4.falls ?? []).map(() => 1);
    this.pool = (w4.pools ?? []).map(() => 1);
    this.knots = (w4.knots ?? []).map(() => newKnot());
    this.monkeys = (w4.monkeys ?? []).map((m) => newCapuchin(m));
    this.fruit = (w4.fruit ?? []).map((f) => ({ state: 'hang', x: f.x, y: f.y, vy: 0, at: 0 }));
    this.chimeRang = (w4.chimes ?? []).map(() => -9);
    this.nestBlow = (w4.nests ?? []).map(() => ({ cycle: -1, at: -9, dir: 1 }));
    // a frond's bridge is not there until it unrolls
    for (const s of w4.patience ?? []) {
      const pl = s.kind === 'frond' ? platforms.find((q) => q.id === s.platformId) : undefined;
      if (pl) pl.broken = true;
    }
    // a knotted vine hangs tied up, down to its knot (or rolled up at its top when the knot is there), until Dot frees it
    for (const k of w4.knots ?? []) {
      if (k.releases.kind !== 'vine') continue;
      const v = vines.find((q) => q.id === k.releases.id);
      if (!v) continue;
      this.vineFull.set(v.id, v.bottomY);
      v.bottomY = tiedBottom(v.topY, v.bottomY, k.y);
      this.vineTied.set(v.id, v.bottomY);
    }
  }

  /**
   * one frame. Returns how much of his walking speed is left (pouring water slows a wade), and any push the stage's own winds give him
   * on top of the gust lanes (a freed eaglet's parent beating its wings: px/s, + to the right)
   */
  step(dt: number, h: W4Host): { speed: number; wind: number } {
    const p = h.player;
    const w4 = this.w4;
    this.clock = h.t;
    let speed = 1;

    // into the mist: well below the last ledge, with nothing under him, is a fall
    if (w4.deepFall !== undefined) {
      if (p.grounded || p.climbing || !Number.isFinite(this.groundY)) this.groundY = p.y;
      else if (p.y > this.groundY + w4.deepFall) {
        this.groundY = NaN;
        h.fellOff?.();
      }
    }

    // falling rocks: the shadow warns, the rock falls, and it hurts only if it reaches him
    (w4.rocks ?? []).forEach((r, i) => {
      if (Math.abs(r.x - p.x) > 900) return;
      const s = rockAt(r, h.t);
      const cycle = `${i}:${Math.floor((h.t + r.offset) / r.every)}`;
      // (the stage's own hint teaches the rocks where the first one falls; this is only the line after a hit)
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
      const now = stepPatience(s, was, here, still, dt);
      this.patience[i] = now;
      if (s.kind === 'frond' && now.done && !was.done) {
        const pl = h.platforms.find((q) => q.id === s.platformId);
        if (pl) pl.broken = false;
        h.sfx('frond');
        h.float('SLOW IS NOT STOPPED', p.x, p.y - 100, '#bbf7d0');
      }
      // the mist rising again after it has shown him the way: Dot says to remember it (once)
      if (s.kind === 'mist' && was.level >= 0.99 && now.level < was.level) h.tip('w4:mist', 'The mist is coming back! Remember where the ledges were', 3.2);
    });

    // the eaglets: moving near the nest while they look about blows him back a few steps, again and again while he keeps moving there
    // (a flurry holds him where he is, so a look cannot be walked through); standing still, nothing happens. Once he is out of their
    // sight no new flurry starts, so he is never blown further than one flurry past the edge of it (eaglet.ts)
    (w4.nests ?? []).forEach((n, i) => {
      const b = this.nestBlow[i];
      const near = nearNest(n, p.x, p.y);
      const phase = nestAt(n, h.t).phase;
      if (near && phase === 'stir') h.tip('w4:nestStir', 'Shh! One is waking. Stand still while they look', 3);
      if (near && !still && phase === 'look' && h.t - b.at >= NEST.blow) {
        const cycle = nestCycle(n, h.t);
        if (b.cycle !== cycle) {
          h.float('PEEP PEEP!', n.x, n.y - 100, '#fde68a');
          h.tip('w4:nestBlow', 'Whoa! Stand still while they look, and go while they sleep', 3.4);
        }
        b.cycle = cycle;
        b.at = h.t;
        b.dir = p.x >= n.x ? 1 : -1;
        h.sfx('gust');
      }
      const u = (h.t - b.at) / NEST.blow;
      if (u >= 0 && u < 1) {
        p.x += b.dir * NEST.push * (1 - u) * dt;
        p.vx = 0;
        speed = Math.min(speed, 0.1);
      }
    });

    // the falls: plugged by their boulder, or pouring on their own rhythm; the pools follow them, and the logs float on the pools
    const platX = (id: number) => h.platforms.find((q) => q.id === id)?.x;
    (w4.falls ?? []).forEach((w, i) => {
      const before = this.flow[i];
      this.flow[i] = stepFlow(w, before, plugged(w, platX), h.t, dt);
      if (before > FALLS.trickle && this.flow[i] <= FALLS.trickle && Math.abs(w.x - p.x) < 900) h.sfx('splash');
      if (!inFall(w, p.x, p.y, 64)) return;
      // a curtain of water to hide behind (4-5): it hides him and leaves him be
      if (w.veil) h.tip('w4:veil', 'Behind the water nobody can see you. Wait here while she goes by', 3.2);
      else if (this.flow[i] > FALLS.trickle) {
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
        const tied = this.vineTied.get(k.releases.id);
        if (v && full !== undefined && tied !== undefined) {
          const u = Math.min(1, (h.t - now.freedAt) / KNOT_DROP);
          v.bottomY = tied + (full - tied) * u * u;
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
        if (capBlocks(m, s, p.x) && p.y < s.y + 40 && p.y > s.y - GUARD_LEAP) {
          // a guard on its feet will not let him by: he bumps back off it (and a jump over it meets it leaping up at him)
          p.x = s.x + (p.x >= s.x ? 30 : -30);
          p.vx = 0;
          h.tip('w4:guard', 'The guard will not let you pass. Wait for the wind to blow it over', 3.2);
        }
      }
    });
    return { speed, wind: w4.cliffNests?.length ? nestWind(h.collectibles, p.x, p.y, p.grounded, h.t) : 0 };
  }

  /** behind Pokey: the falls, the pools, the chimes, the rock shadows and rocks, the fern, the knots and Dot, the monkeys, the fruit */
  drawBack(ctx: CanvasRenderingContext2D, t: number, view: { x0: number; x1: number; y0?: number; y1?: number }, zones: readonly Zone[], platforms: Platform[]) {
    const w4 = this.w4;
    this.view = view;
    const near = (x: number, pad = 300) => x > view.x0 - pad && x < view.x1 + pad;
    for (const d of w4.decor ?? []) {
      if (!near(d.x, d.w)) continue;
      const wi = d.wet !== undefined ? (w4.falls ?? []).findIndex((w) => w.id === d.wet) : -1;
      drawW4(ctx, d.n, d.x, d.b, d.w, { flip: d.flip, ...(wi >= 0 ? { alpha: 0.35 + 0.65 * this.flow[wi] } : {}) });
    }
    // (a curtain's water is drawn in front of him, drawFront; behind it, the hollow in the cliff he stands in)
    (w4.falls ?? []).forEach((w, i) => near(w.x, w.width + 300) && (w.veil ? drawHollow(ctx, w) : drawFall(ctx, w, this.flow[i], t)));
    const treePainted = (w4.fruit ?? []).map((tree, i) => near(tree.x) && drawFruitTree(ctx, tree, this.fruit[i].state === 'hang'));
    (w4.pools ?? []).forEach((pool, i) => {
      const fall = (w4.falls ?? []).find((w) => w.id === pool.fedBy);
      if (pool.art && near(pool.art.cx)) drawPool(ctx, pool.art.cx, pool, this.pool[i], pool.art);
      else if (fall && near(fall.x)) drawPool(ctx, fall.x + fall.width / 2, pool, this.pool[i]);
      const log = pool.art ? platforms.find((q) => q.id === pool.platformId && q.art === 'poolLog') : undefined;
      if (log && near(log.x)) drawFloatLog(ctx, log, t);
    });
    // the boulders that plug the falls (pushed platforms painted as boulders, rolling as they go)
    for (const p of platforms) if (p.art === 'boulder' && near(p.x)) drawBoulder(ctx, p);
    (w4.chimes ?? []).forEach((c) => {
      const z = zones[c.zone];
      if (near(c.x)) drawChime(ctx, c, z ? chimeLean(z, t).angle : 0);
    });
    for (const u of w4.updrafts ?? []) if (near((u.x0 + u.x1) / 2)) drawUpdraft(ctx, u, t);
    for (const r of w4.rocks ?? []) if (near(r.x)) drawRock(ctx, r, t);
    (w4.patience ?? []).forEach((s, i) => {
      if (s.kind === 'frond' && near(s.x1)) drawFrond(ctx, s, this.patience[i], platforms);
    });
    for (const v of this.vines) if (v.rope && near(v.x)) drawCliffVine(ctx, v, t);
    (w4.knots ?? []).forEach((k, i) => near(k.x) && drawKnot(ctx, k, this.knots[i], t));
    // a fall's plug: the boulder he rolls under its water (the push platform; painted over the log the scene would draw), the spout
    // the water pours from, and the water running off the boulder once it is in
    (w4.falls ?? []).forEach((w, i) => {
      const b = w.plug ? platforms.find((q) => q.id === w.plug!.platformId) : undefined;
      if (!b || !near(w.x)) return;
      drawSpout(ctx, b, w, this.flow[i], t);
      if (!drawW4(ctx, 'boulderMoss', b.x + b.width / 2, b.y + b.height + 8, b.width * 1.3)) {
        ctx.save();
        ctx.fillStyle = '#78716c';
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(b.x + b.width / 2, b.y + b.height / 2 + 4, b.width / 2 + 6, b.height / 2 + 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });
    this.fruit.forEach((f, i) => {
      if (!near(f.x)) return;
      // (eaten: the peel it left, until the fruit grows back)
      if (f.state === 'gone') return drawPeel(ctx, f.x, f.y + 10, t - f.at);
      // (hanging in a painted tree: that tree's low orange is this one)
      if (f.state === 'hang' && treePainted[i]) return;
      // (a painted monkey eating it holds it in its hands)
      if (f.state === 'ground' && w4ArtReady() && this.monkeys.some((s) => s.mode === 'eat' && s.fruit?.x === f.x && s.fruit?.y === f.y)) return;
      drawFruit(ctx, f.x, f.y);
    });
    (w4.monkeys ?? []).forEach((m, i) => near(this.monkeys[i].x) && drawMonkey(ctx, m, this.monkeys[i], t));
    (w4.nests ?? []).forEach((n, i) => near(n.x) && drawNest(ctx, n, t, t - this.nestBlow[i].at));
    // the mist bank over everything in it (ledges and trunks alike), behind Pokey so he can always be seen in it
    if (view.y0 !== undefined && view.y1 !== undefined) this.drawMistBank(ctx, t, { x0: view.x0, x1: view.x1, y0: view.y0, y1: view.y1 });
  }

  /** the mist's thickness at height y (0 clear .. 1 thick): the bands it covers, less what standing still has settled */
  mistAt(y: number): number {
    let mist = 0, clear = 0;
    (this.w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist' || !s.area) return;
      const gap = bandGap(s.area, y);
      mist = Math.max(mist, 1 - gap / MIST_EDGE);
      // (what it settles ends more sharply than the bank does, so a settled spot shows nothing of the next column up)
      clear = Math.max(clear, Math.max(0, 1 - gap / CLEAR_EDGE) * mistReveal(this.patience[i]));
    });
    return mist * (1 - clear);
  }

  private drawMistBank(ctx: CanvasRenderingContext2D, t: number, v: { x0: number; x1: number; y0: number; y1: number }) {
    const bands = (this.w4.patience ?? []).filter((s) => s.kind === 'mist' && s.area).map((s) => s.area!);
    if (!bands.length) return;
    const top = Math.max(v.y0, Math.min(...bands.map((b) => b.top)) - MIST_EDGE);
    const bottom = Math.min(v.y1, Math.max(...bands.map((b) => b.bottom)) + MIST_EDGE);
    if (bottom <= top) return;
    ctx.save();
    // the bank: one wash of fog from top to bottom, as thick as the mist is at each height (a thin haze stays where it has settled)
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    const stops = Math.max(2, Math.ceil((bottom - top) / 12));
    for (let k = 0; k <= stops; k++) {
      const y = top + ((bottom - top) * k) / stops;
      const inside = Math.max(0, ...bands.map((b) => 1 - bandGap(b, y) / MIST_EDGE));
      const a = Math.min(1, MIST_THICK * this.mistAt(y) + MIST_HAZE * inside);
      g.addColorStop(k / stops, `rgba(223,231,238,${a.toFixed(3)})`);
    }
    ctx.fillStyle = g;
    ctx.fillRect(v.x0 - 20, top, v.x1 - v.x0 + 40, bottom - top);
    // drifting puffs on top, so it reads as mist rather than a wall
    const gx = 170, gy = 64;
    for (let y = Math.floor(top / gy) * gy; y < bottom + gy; y += gy) {
      // (as thin as the mist is anywhere across a puff, so none shows as a disc where the mist has settled or at its edges)
      const m = Math.min(this.mistAt(y - 34), this.mistAt(y), this.mistAt(y + 34));
      if (m <= 0.03) continue;
      const row = Math.round(y / gy);
      const drift = (t * (14 + (Math.abs(row) % 3) * 6) + Math.abs(row) * 53) % gx;
      ctx.fillStyle = row % 2 ? '#f8fafc' : '#cbd5e1';
      ctx.globalAlpha = 0.4 * m * m;
      for (let x = Math.floor(v.x0 / gx) * gx - gx; x < v.x1 + gx; x += gx) {
        ctx.beginPath();
        ctx.ellipse(x + drift, y + Math.sin(t * 0.5 + x * 0.01) * 6, 120, 34, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /** standing still on a mist spot, the view drifts over to the way up it is showing him: where to look, and how much (0..1) */
  look(px: number, feetY: number): { x: number; y: number; u: number } | null {
    let best: { x: number; y: number; u: number } | null = null;
    (this.w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist' || !s.area || !onSpot(s, px, feetY)) return;
      const u = Math.min(1, this.patience[i].level * 2);
      if (u > 0 && (!best || u > best.u)) best = { x: s.view?.x ?? (s.x0 + s.x1) / 2, y: s.view?.y ?? (s.y + s.area.top) / 2, u };
    });
    // 4-4's knots: waiting under one (and while Dot flies up and picks it), the view tilts up between him and the knot, so the knot and
    // Dot are on screen even held sideways (the engine keeps him in view)
    (this.w4.knots ?? []).forEach((k, i) => {
      const st = this.knots[i];
      if (!underKnot(k, px, feetY) || (st.phase === 'free' && (st.freedAt === undefined || this.clock - st.freedAt > 1.2))) return;
      const u = st.phase === 'tied' ? Math.min(1, st.t / DOT_HELP.ask) : 1;
      if (u > 0 && (!best || u > best.u)) best = { x: k.x, y: (k.y + feetY) / 2, u };
    });
    return best;
  }

  /** in front of Pokey: the mist that hides the high ledges until he stands still */
  drawFront(ctx: CanvasRenderingContext2D, platforms: Platform[], t: number) {
    const v = this.view;
    (this.w4.falls ?? []).forEach((w) => w.veil && w.x + w.width > v.x0 - 300 && w.x < v.x1 + 300 && drawVeil(ctx, w, t));
    (this.w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist' || s.area) return; // (a band of mist is drawn as one bank, behind him: drawBack)
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

  /** is he in a fall that is pouring now (not a curtain)? Its weight folds the leaf: a glide does not carry him through it */
  inPour(px: number, feetY: number): boolean {
    return (this.w4.falls ?? []).some((w, i) => !w.veil && this.flow[i] > FALLS.trickle && inFall(w, px, feetY, 64));
  }

  /** is he in rising warm air (an updraft)? */
  inUpdraft(px: number, y: number): boolean {
    return (this.w4.updrafts ?? []).some((u) => px >= u.x0 && px <= u.x1 && y >= u.top && y <= u.bottom);
  }

  /** a frond that has unrolled (for the tests and the stage check) */
  frondDone(i: number): boolean {
    return frondSolid(this.patience[i] ?? newPatience());
  }
}

// ───────────────────────────── drawing ─────────────────────────────

/** a fall: its water, then the painted lip it pours over */
function drawFall(ctx: CanvasRenderingContext2D, w: Waterfall, flow: number, t: number) {
  drawFallWater(ctx, w, flow, t);
  drawLip(ctx, w, flow);
}

/**
 * the painted lips over a fall: one for about every `span` px of its width (a wide fall pours off a row of them), each `pad` px wider
 * than its share so they overlap, their rock's underside `below` px down the water (hiding where it starts)
 */
const LIP = { span: 300, pad: 50, below: 40 };

/**
 * The painted lip at a fall's top: the rock pouring a full fall while it flows, the same rock trickling once it is stopped, the one
 * fading into the other with the flow. Only the lip: the water under it is drawn by drawFallWater. A fall a boulder plugs already
 * pours out of its painted channel (the stage's decor), so it gets none. Nothing before the atlas loads.
 */
function drawLip(ctx: CanvasRenderingContext2D, w: Waterfall, flow: number) {
  if (w.plug || !w4ArtReady()) return;
  const n = Math.max(1, Math.round(w.width / LIP.span));
  const lw = w.width / n + LIP.pad;
  for (let k = 0; k < n; k++) {
    const cx = w.x + ((k + 0.5) / n) * w.width;
    // (the trickle under the pour, so halfway through they are both solid rock rather than two see-through ones)
    if (flow < 1) drawW4(ctx, 'lipTrickle', cx, w.top + LIP.below, lw, { flip: k % 2 === 1, alpha: Math.min(1, 2 * (1 - flow)) });
    if (flow > 0) drawW4(ctx, 'lipPour', cx, w.top + LIP.below, lw, { flip: k % 2 === 1, alpha: Math.min(1, 2 * flow) });
  }
}

function drawFallWater(ctx: CanvasRenderingContext2D, w: Waterfall, flow: number, t: number) {
  if (flow <= 0.02) return;
  ctx.save();
  const width = w.width * (0.25 + 0.75 * flow);
  const x = w.x + (w.width - width) / 2;
  ctx.globalAlpha = 0.25 + 0.4 * flow; // (see-through: the steps behind the water show)
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

/**
 * a curtain of water in front of him (4-5): a sheet with rippling edges, thicker at its sides and thin enough in the middle to see him
 * standing behind it, streaks pouring down it, and spray and mist where it lands on the path
 */
function drawVeil(ctx: CanvasRenderingContext2D, w: Waterfall, t: number) {
  const x0 = w.x, x1 = w.x + w.width, top = w.top, bot = w.bottom;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, top);
  for (let y = top; y < bot; y += 28) ctx.lineTo(x0 + 5 * Math.sin(y * 0.045 + t * 5), y);
  ctx.lineTo(x0 - 14, bot);
  ctx.lineTo(x1 + 14, bot);
  for (let y = bot; y > top; y -= 28) ctx.lineTo(x1 + 5 * Math.sin(y * 0.045 + t * 5 + 2.1), y);
  ctx.lineTo(x1, top);
  ctx.closePath();
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, 'rgba(147, 197, 253, 0.85)');
  g.addColorStop(0.18, 'rgba(219, 234, 254, 0.62)');
  g.addColorStop(0.5, 'rgba(240, 249, 255, 0.42)');
  g.addColorStop(0.82, 'rgba(219, 234, 254, 0.62)');
  g.addColorStop(1, 'rgba(125, 211, 252, 0.85)');
  ctx.fillStyle = g;
  ctx.fill();
  // streaks pouring down, at different speeds and lengths
  ctx.lineCap = 'round';
  for (let k = 0; k < 9; k++) {
    const sx = x0 + ((k + 0.5) / 9) * w.width;
    const speed = 420 + ((k * 53) % 160);
    const len = 46 + ((k * 31) % 50);
    const period = 150 + ((k * 37) % 70);
    ctx.strokeStyle = k % 3 === 0 ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = k % 3 === 0 ? 3.5 : 1.8;
    ctx.beginPath();
    const off = (t * speed + k * 71) % period;
    for (let y = top + off; y < bot - 10; y += period) {
      ctx.moveTo(sx, y);
      ctx.lineTo(sx, Math.min(bot - 10, y + len));
    }
    ctx.stroke();
  }
  // where it lands: a cloud of mist, and spray bouncing up off the stone
  const cx = (x0 + x1) / 2;
  const mist = ctx.createRadialGradient(cx, bot - 10, 10, cx, bot - 10, w.width);
  mist.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  mist.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mist;
  ctx.beginPath();
  ctx.ellipse(cx, bot - 12, w.width * 0.95, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let k = 0; k < 8; k++) {
    const u = (t * 1.6 + k * 0.37) % 1;
    const sx = x0 - 6 + ((k * 0.61) % 1) * (w.width + 12);
    ctx.globalAlpha = 1 - u;
    ctx.beginPath();
    ctx.arc(sx + (k % 2 ? 1 : -1) * u * 18, bot - 6 - Math.sin(u * Math.PI) * 26, 3 + 3 * (1 - u), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** the hollow in the cliff behind a curtain of water (the painted cave, a dark arch until the atlas loads) */
function drawHollow(ctx: CanvasRenderingContext2D, w: Waterfall) {
  const cx = w.x + w.width / 2;
  if (drawW4(ctx, 'cave', cx, w.bottom + 10, w.width + 110)) return;
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(cx, w.bottom, w.width / 2 + 40, 130, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

/**
 * where the painted fruit trees' parts sit, as fractions of the painting: the full tree's low orange (the one that drops, drawn at the
 * fruit's place) and its trunk; the picked tree's trunk, so it stands where the full one did
 */
const TREE_ART = { orangeX: 0.803, orangeY: 0.534, trunkFull: 0.43, trunkPicked: 0.37 };
/** how long a peel lies there fading (s), from when the monkey finishes the fruit (it grows back after FRUIT_BACK) */
const PEEL_FADE = 2;

/**
 * A fruit tree: painted with its oranges while its fruit hangs (its low orange is the fruit), with one left high up once that is knocked
 * down. Returns whether it was painted (the hanging fruit is then not drawn again). The stand-in: a trunk, a leafy crown, and the bough
 * its fruit hangs from (the fruit drawn on its own).
 */
function drawFruitTree(ctx: CanvasRenderingContext2D, tree: FruitTree, hanging: boolean): boolean {
  const side = tree.trunk ?? -1;
  if (w4ArtReady()) {
    // (the trunk stands left of the fruit as painted; trunk 1 mirrors it)
    const m = side === 1 ? -1 : 1;
    const h = (tree.ground + 4 - tree.y) / (1 - TREE_ART.orangeY);
    const wFull = h / w4Height('fruitTree4', 1);
    const cx = tree.x - (TREE_ART.orangeX - 0.5) * wFull * m;
    if (hanging) return drawW4(ctx, 'fruitTree4', cx, tree.ground + 4, wFull, { flip: m < 0 });
    const trunkX = cx + (TREE_ART.trunkFull - 0.5) * wFull * m;
    const wPicked = h / w4Height('fruitTree1', 1);
    drawW4(ctx, 'fruitTree1', trunkX - (TREE_ART.trunkPicked - 0.5) * wPicked * m, tree.ground + 4, wPicked, { flip: m < 0 });
    return false;
  }
  const tx = tree.x + 46 * side;
  const top = tree.y - 70;
  ctx.save();
  ctx.lineCap = 'round';
  for (const [ink, grow] of [['#1c140c', 5], ['#5b3a1e', 0]] as const) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 14 + grow;
    ctx.beginPath();
    ctx.moveTo(tx, tree.ground + 4);
    ctx.quadraticCurveTo(tx + 6, (tree.ground + top) / 2, tx - 4, top);
    ctx.stroke();
    ctx.lineWidth = 6 + grow;
    ctx.beginPath();
    ctx.moveTo(tx, top + 26);
    ctx.quadraticCurveTo(tx - 30 * side, top + 18, tree.x, tree.y - 30);
    ctx.stroke();
  }
  // the crown: overlapping leaf clumps inked round the outside like the painted pieces, darker underneath, lit on top
  const clumps: Array<[number, number, number]> = [[-30, 6, 40], [34, 10, 38], [-6, -14, 46], [40, -18, 34], [-44, -22, 30]];
  ctx.fillStyle = '#1c2b17';
  for (const [dx, dy, r] of clumps) {
    ctx.beginPath();
    ctx.arc(tx + dx, top + dy, r + 3, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [shade, lift, k] of [['#2f5d27', 0, 1], ['#4d8f33', -8, 0.78], ['#6aa84f', -16, 0.45]] as const) {
    ctx.fillStyle = shade;
    for (const [dx, dy, r] of clumps) {
      ctx.beginPath();
      ctx.arc(tx + dx - (1 - k) * 6, top + dy + lift, r * k, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // the stem the fruit hangs on
  ctx.strokeStyle = '#3f6212';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tree.x, tree.y - 30);
  ctx.lineTo(tree.x, tree.y - 9);
  ctx.stroke();
  ctx.restore();
  return false;
}

/** the peel a monkey leaves (`age` s after it finished), fading before the fruit grows back; nothing before the atlas loads */
function drawPeel(ctx: CanvasRenderingContext2D, x: number, ground: number, age: number) {
  const a = Math.min(1, (FRUIT_BACK - age) / PEEL_FADE);
  if (a > 0) drawW4(ctx, 'orangeEaten', x, ground + 2, 50, { alpha: a });
}

function drawPool(ctx: CanvasRenderingContext2D, cx: number, pool: Pool, level: number, art?: { b: number; w: number }) {
  const b = art?.b ?? pool.emptyY + 40;
  const w = art?.w ?? 260;
  if (drawW4(ctx, 'poolEmpty', cx, b, w) && drawW4(ctx, 'poolFull', cx, b, w, { alpha: level })) return;
  const y = poolLogY(pool, level) + 14;
  ctx.save();
  ctx.fillStyle = 'rgba(56,189,248,0.45)';
  ctx.fillRect(cx - w / 2 + 20, y, w - 40, Math.max(0, b - 10 - y));
  ctx.restore();
}

/** the log floating on a pool (a plain drawn log: it rides up and down on the water) */
function drawFloatLog(ctx: CanvasRenderingContext2D, p: Platform, t: number) {
  const { width: w, height: h } = p;
  const x = p.x;
  const y = p.y + Math.sin(t * 2.2 + p.x) * 1.5;
  const r = h / 2;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#9a6a3c');
  g.addColorStop(0.5, '#7a4f2a');
  g.addColorStop(1, '#4f321b');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2e1d0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the cut end, with its rings
  ctx.fillStyle = '#c89a62';
  ctx.beginPath();
  ctx.ellipse(x + w - r, y + r, r * 0.55, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(46,29,15,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x + w - r, y + r, r * 0.28, r * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  // moss, and ripples where it sits in the water
  ctx.fillStyle = '#5f9a3a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.4, y + 2, w * 0.25, 5, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,242,254,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 2, w * 0.6 + Math.sin(t * 3) * 4, 5, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

/** a boulder that is pushed along a shelf: it turns as it rolls */
function drawBoulder(ctx: CanvasRenderingContext2D, p: Platform) {
  const cx = p.x + p.width / 2;
  const cy = p.y + p.height / 2;
  const turn = (p.x - (p.push?.min ?? 0)) / (p.width / 2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(turn);
  if (!drawW4(ctx, 'boulderRound', 0, p.height * 0.62, p.width * 1.25)) {
    ctx.fillStyle = '#78716c';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, p.height / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
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
  if ((s.phase === 'warn' || s.phase === 'fall') && !r.air) {
    // the shadow on the ground grows as the rock comes
    const u = s.phase === 'warn' ? s.u * 0.6 : 0.6 + 0.4 * s.u;
    ctx.fillStyle = `rgba(15,23,42,${0.15 + 0.4 * u})`;
    ctx.beginPath();
    ctx.ellipse(r.x, r.land - 2, 10 + 26 * u, 4 + 6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (s.phase === 'warn') {
    ctx.fillStyle = '#9ca3af';
    if (r.air) {
      // through open air: a pale band down the whole of its path with grit streaming through it, so the warning is in view on any
      // screen and reads against grey rock as well as pale mist; it thickens as the rock comes
      const span = r.land - r.top;
      ctx.fillStyle = `rgba(255, 251, 235, ${0.1 + 0.18 * s.u})`;
      ctx.fillRect(r.x - 24, r.top, 48, span);
      const n = 8 + Math.round(14 * s.u);
      ctx.strokeStyle = 'rgba(30, 27, 24, 0.75)';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < n; k++) {
        const gx = r.x - 12 + ((k * 7) % 24);
        const gy = r.top + ((t * 360 + k * (span / n)) % span);
        const sz = 4 + (k % 3) * 2;
        ctx.fillStyle = k % 2 ? '#a8a29e' : '#78716c';
        ctx.fillRect(gx, gy, sz, sz);
        ctx.strokeRect(gx, gy, sz, sz);
      }
    } else {
      // grit trickling from the ledge above
      for (let k = 0; k < 4; k++) ctx.fillRect(r.x - 8 + k * 5, r.top + ((t * 300 + k * 40) % 90), 3, 3);
    }
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

function drawUpdraft(ctx: CanvasRenderingContext2D, u: Updraft, t: number) {
  // pale wisps rising, thicker in the middle of the column
  ctx.save();
  const w = u.x1 - u.x0;
  for (let k = 0; k < 9; k++) {
    const x = u.x0 + w * ((k + 0.5) / 9) + Math.sin(t * 1.7 + k) * 8;
    const span = u.bottom - u.top;
    const y = u.bottom - ((t * 160 + k * 97) % span);
    const a = 0.14 + 0.14 * Math.sin((Math.PI * (k + 0.5)) / 9);
    ctx.fillStyle = `rgba(241, 245, 249, ${a})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFrond(ctx: CanvasRenderingContext2D, s: PatienceSpot, st: PatienceState, platforms: Platform[]) {
  const u = st.done ? 1 : st.level;
  // the four paintings, curled to bridge; the bridge lies across the gap past the spot, the others stand on the spot's edge
  const d = s.dir ?? 1;
  const edge = d === 1 ? s.x1 + 20 : s.x0 - 20;
  const bridge = s.platformId !== undefined ? platforms.find((q) => q.id === s.platformId) : undefined;
  if (u >= 1 && bridge ? drawW4(ctx, 'frondBridge', bridge.x + bridge.width / 2, s.y + 14, bridge.width + 40, { flip: d < 0 }) : drawW4(ctx, u < 0.34 ? 'frondCurl' : u < 0.67 ? 'frondUncurl' : 'frondHalf', edge, s.y + 4, 64 + 30 * u, { rot: d * u * 0.6, flip: d < 0 })) return;
  if (d < 0) return; // (the plain-shape stand-in only draws the rightward frond; the atlas is there long before anyone reaches one)
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

/** a vine hanging down the cliff (4-8): tied up in a coil under its knot until Dot frees it, then it drops to the ground (v.bottomY moves) */
function drawCliffVine(ctx: CanvasRenderingContext2D, v: Vine, t: number) {
  ctx.save();
  ctx.lineCap = 'round';
  const sway = (y: number) => Math.sin(t * 1.2 + y * 0.012 + v.x * 0.01) * Math.min(6, (y - v.topY) * 0.03);
  for (const [ink, w] of [['#1a2e05', 9], ['#4d7c0f', 5]] as const) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(v.x, v.topY);
    for (let y = v.topY; y <= v.bottomY; y += 14) ctx.lineTo(v.x + sway(y), y);
    ctx.stroke();
  }
  // leaves along it
  ctx.fillStyle = '#65a30d';
  ctx.strokeStyle = '#1a2e05';
  ctx.lineWidth = 1.5;
  for (let y = v.topY + 30, k = 0; y < v.bottomY - 10; y += 46, k++) {
    const s = k % 2 ? 1 : -1;
    ctx.beginPath();
    ctx.ellipse(v.x + sway(y) + s * 9, y, 9, 4.5, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (v.bottomY - v.topY < 60) {
    // rolled up in a bundle under the knot
    ctx.fillStyle = '#4d7c0f';
    ctx.strokeStyle = '#1a2e05';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(v.x, v.topY + 22 + k * 7, 18 - k * 2, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * a plugged fall's water (4-8): the spout high on the cliff it pours from, and once the boulder sits under it, the water landing on the
 * boulder's top and running off back along the shelf instead of down the gap
 */
function drawSpout(ctx: CanvasRenderingContext2D, b: Platform, w: Waterfall, flow: number, t: number) {
  const sx = w.x + 40;
  if (!drawW4(ctx, 'channelFall', sx, w.top + 40, 150, { flip: true })) {
    ctx.save();
    ctx.fillStyle = '#57534e';
    ctx.fillRect(sx - 70, w.top - 30, 140, 34);
    ctx.restore();
  }
  const off = 1 - flow;
  if (off < 0.05) return;
  const top = b.y;
  ctx.save();
  ctx.globalAlpha = off;
  // a thin stream from the spout onto the boulder
  ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
  ctx.fillRect(sx - 14, w.top + 20, 28, top - w.top - 16);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const y = w.top + 20 + ((t * 380 + k * 70) % Math.max(1, top - w.top - 40));
    ctx.beginPath();
    ctx.moveTo(sx - 6 + k * 6, y);
    ctx.lineTo(sx - 6 + k * 6, y + 30);
    ctx.stroke();
  }
  // spray off the boulder's top, and the water running away left along the shelf
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let k = 0; k < 5; k++) {
    const u = (t * 1.8 + k * 0.23) % 1;
    ctx.beginPath();
    ctx.arc(sx - u * 50, top - 4 - Math.sin(u * Math.PI) * 18, 3 + 2 * (1 - u), 0, Math.PI * 2);
    ctx.fill();
  }
  const y = b.y + b.height;
  ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
  ctx.fillRect(b.x - 220, y - 6, 220, 6);
  ctx.restore();
}

function drawFruit(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // (the painted orange, its middle at (x, y), the size of the ones in the painted tree)
  if (drawW4(ctx, 'orange', x, y + 14, 32)) return;
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

/** a nest of harpy eaglets: asleep (heads tucked, a z), one stirring (a head up), both looking about, and a flurry of wings */
function drawNest(ctx: CanvasRenderingContext2D, n: Nest, t: number, sinceBlow: number) {
  const { phase, u } = nestAt(n, t);
  const blowing = sinceBlow >= 0 && sinceBlow < NEST.blow + 0.3;
  const painted = drawPaintedNest(ctx, n, phase, u, blowing, t);
  ctx.save();
  ctx.translate(n.x, n.y);
  ctx.scale(1.3, 1.3);
  if (!painted) drawStandInNest(ctx, phase, u, blowing, t);
  // (over the painted eaglet's head, which stands taller than the stand-in's, and higher still over it flying)
  else ctx.translate(0, phase === 'look' ? -84 : -48);
  // what they are doing, over their heads
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  if (phase === 'sleep') {
    const z = (t * 0.8) % 1;
    ctx.globalAlpha = 1 - z * 0.8;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeText('z', 18 + z * 14, -50 - z * 26);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('z', 18 + z * 14, -50 - z * 26);
  } else if (phase === 'stir') {
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('?', -12, -80);
  } else {
    ctx.fillStyle = '#dc2626';
    ctx.fillText('!', 0, -86);
  }
  // a flurry of wind lines when they blow him back
  if (blowing) {
    ctx.globalAlpha = Math.max(0, 1 - sinceBlow / (NEST.blow + 0.3));
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    for (let k = 0; k < 4; k++) {
      for (const side of [-1, 1]) {
        const x0 = side * (50 + sinceBlow * 260 + k * 8);
        ctx.beginPath();
        ctx.moveTo(x0, -20 - k * 12);
        ctx.lineTo(x0 + side * 40, -22 - k * 12);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/** the painted nest is drawn this wide (the stand-in's bowl, a little wider); its bowl's underside is this far up the painting */
const NEST_ART = { w: 150, bowlFull: 0.28, bowlEmpty: 0.05 };

/**
 * The painted nest: the eaglet in it while it sleeps (bobbing up as it stirs), and once it looks about, the empty nest with the eaglet
 * up and flapping over it (harder in a flurry), until it settles back in. False before the atlas loads.
 */
function drawPaintedNest(ctx: CanvasRenderingContext2D, n: Nest, phase: NestPhase, u: number, blowing: boolean, t: number): boolean {
  if (!w4ArtReady()) return false;
  if (phase !== 'look') {
    const hop = phase === 'stir' ? Math.abs(Math.sin(u * Math.PI * 3)) * 6 : 0;
    return drawW4(ctx, 'nestEaglet', n.x, n.y + w4Height('nestEaglet', NEST_ART.w) * NEST_ART.bowlFull - hop, NEST_ART.w);
  }
  drawW4(ctx, 'nestEmpty', n.x, n.y + w4Height('nestEmpty', NEST_ART.w) * NEST_ART.bowlEmpty, NEST_ART.w);
  // (it lifts out over the first moment of the look, then hovers, bobbing with its wingbeats)
  const lift = Math.min(1, u * 5);
  const beat = Math.sin(t * (blowing ? 30 : 12));
  return drawW4(ctx, 'eagletFly', n.x + (blowing ? beat * 3 : 0), n.y - 20 - 70 * lift + beat * 4, 130, { rot: blowing ? beat * 0.12 : beat * 0.04 });
}

/** the stand-in nest: two chicks, asleep (heads tucked), one stirring (a head up), both looking about, flapping in a flurry */
function drawStandInNest(ctx: CanvasRenderingContext2D, phase: NestPhase, u: number, blowing: boolean, t: number) {
  // the chicks: white down, dark beaks; heads tucked asleep, up when they look
  const chick = (dx: number, up: number, eyes: boolean, flap: number) => {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    if (flap) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(dx + side * 18, -28, 15, 6, side * (0.5 + flap), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.ellipse(dx, -22, 17, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const hy = -30 - up * 18;
    ctx.beginPath();
    ctx.arc(dx + 4, hy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // the little crest
    ctx.beginPath();
    ctx.moveTo(dx, hy - 9);
    ctx.lineTo(dx - 3, hy - 17);
    ctx.lineTo(dx + 5, hy - 10);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(dx + 13, hy - 1);
    ctx.lineTo(dx + 20, hy + 2);
    ctx.lineTo(dx + 13, hy + 4);
    ctx.fill();
    if (eyes) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dx + 7, hy - 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(dx + 4, hy - 2);
      ctx.lineTo(dx + 10, hy - 2);
      ctx.stroke();
    }
  };
  const flap = blowing ? 0.5 * Math.sin(t * 40) : 0;
  const up1 = phase === 'look' ? 1 : phase === 'stir' ? Math.min(1, u * 3) : 0;
  const up2 = phase === 'look' ? Math.min(1, u * 4) : 0;
  chick(-16, up1, phase !== 'sleep', flap);
  chick(14, up2, phase === 'look', flap);
  // the nest: a bowl of woven sticks in front of them
  ctx.fillStyle = '#7c5a36';
  ctx.beginPath();
  ctx.ellipse(0, -12, 54, 18, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3420';
  ctx.lineWidth = 3;
  for (let k = 0; k < 7; k++) {
    ctx.beginPath();
    ctx.moveTo(-50 + k * 14, -14 + (k % 2) * 5);
    ctx.lineTo(-36 + k * 14, -2 - (k % 2) * 5);
    ctx.stroke();
  }
}
