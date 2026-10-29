/**
 * w4Play — World 4's pieces of play, run together during a stage (the Mist Cascades): falling rocks, the patience fern and the mist,
 * the falls that can be turned off and the pools they feed, the wind chimes, Dot's knots, the capuchins and the fruit that distracts
 * them. The rules live in their own pure modules (rockfall, patience, waterfalls, w4Kit, capuchin); this file keeps their state for one
 * run, steps them against Pokey each frame, and draws them. The engine only hands it what it needs through `W4Host`, so engine.ts gains
 * a field, a step call and two draw calls rather than seven mechanics.
 *
 * The pieces are painted (w4Art.ts, art batches 1 and 2); each draw keeps a plain-shape stand-in for the moment before the atlas loads.
 * The falls are the painted waterfall set (w4FallsArt.ts) laid on each fall's box: its lip, its bodies pouring, easing and drying, and
 * the white water and mist where it lands.
 */
import { drawDotFrame, flyFrame } from './dotSprite.ts';
import { sovereignSprite } from './sovereignSprite.ts';
import { drawW4, w4ArtReady, w4Height, type W4Piece } from './w4Art.ts';
import { drawFallBodies, drawFallFoot, drawFallLips } from './w4FallsArt.ts';
import { drawLogArt } from './protoArt.ts';
import { NEST, nearNest, nestAt, nestCycle, type Nest, type NestPhase } from './eaglet.ts';
import { capBlocks, newCapuchin, stepGuard, stepLookout, stepThief, type CapState, type Capuchin } from './capuchin.ts';
import { frondSolid, isStill, mistReveal, newPatience, onSpot, stepPatience, type PatienceSpot, type PatienceState } from './patience.ts';
import { ROCK, rockAt, rockHits, type RockDrop } from './rockfall.ts';
import { FALLS, fallPush, fallWall, inColumn, inFall, plugged, poolLogY, stepFlow, stepPool, type Pool, type Waterfall } from './waterfalls.ts';
import { chimeLean, dotAtKnot, DOT_HELP, KNOT_TEACH, knotMark, knotSpotX, newKnot, stepKnot, underKnot, type Chime, type DotKnot, type KnotState } from './w4Kit.ts';
import { zoneState, type Zone } from './zones.ts';
import { nestWind, type CliffNest } from './w4Nests.ts';
import { TIMED } from './physics.ts';
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

/**
 * a sign of the Sky Sovereign overhead (4-9, the climb to her aerie), played once when he first passes x: she glides high across the
 * view while her shadow races along the ledge at y, or one of her feathers drifts down from above him to settle on that ledge
 */
export interface Omen {
  x: number;
  y: number;
  kind: 'shadow' | 'feather';
}
/** an omen's length (s): the shadow's pass, and the feather's drift down (it lies on the ledge a while after) */
export const OMEN = { shadow: 3.2, feather: 6, rest: 8 } as const;

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
  /** the stage goes down, back and forth across the cliff (4-7): a lower flag is further on, wherever it stands */
  descent?: boolean;
  /** the ledges in the order the path takes them (4-7): the view always shows the next one as well as him (engine landingToShow) */
  route?: number[];
  /** a wider view than usual (4-7, where the next ledge is far across and far down): the world shown, held sideways (its height) and
   *  upright (its width), in place of the engine's 540 and 440 */
  view?: { land: number; port: number };
  /** 4-3: the tree up to the shelf beside a fall (the fall's id, the trunk's x): standing at the foot of the pouring fall, the
   *  view turns to show the tree too, so it is on screen when Dot says to climb it, held upright as well (QA 2026-10-29) */
  fallTrees?: Array<{ fall: number; x: number }>;
  /** the climb trunks are the waterfall set's wet stone pillar, with the trunk's vine on it (4-3, beside its falls: protoArt.ts) */
  pillarTrunks?: boolean;
  /** 4-3: what Dot says as the first boulder stops its fall, in place of the plain line (its dry steps are each a double jump up) */
  dryTip?: string;
  /** 4-6: sleeping eaglets (eaglet.ts) */
  nests?: Nest[];
  decor?: W4Decor[];
  /** 4-8's nests on the cliff (w4Nests.ts): which cage each one is and the puzzle around it; a freed chick's parent blows a tailwind */
  cliffNests?: CliffNest[];
  /** 4-9: the Sovereign overhead (her shadow, a feather) */
  omens?: Omen[];
  /**
   * 4-6: the forest floor (its height) and the trunk by the start that climbs back up from it (x): back on the floor after a fall,
   * far from that trunk, Dot says which way the climb starts again (and a trail of petals on the floor leads there)
   */
  floor?: { y: number; trunkX: number };
  /** the stage's own hint about the rocks (4-3): said when the first rock he meets starts its warning, if the stage has not said it yet */
  rockTip?: string;
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
  sfx(kind: 'rock' | 'chime' | 'monkey' | 'frond' | 'knot' | 'splash' | 'gust' | 'cry'): void;
  /** he fell into the mist (deepFall) */
  fellOff?(): void;
  /** 4-9: a guard he was close to was blown off its ledge (the aerie's goal counts them) */
  defeat?(x: number, y: number): void;
}

const FRUIT_BACK = 9;
/** the mist bank: how thick it is (alpha) where it has not settled, the haze left where it has, and how softly its edges fade (px) */
const MIST_THICK = 0.9;
const MIST_HAZE = 0.12;
const MIST_EDGE = 70;
const CLEAR_EDGE = 24;
/** a band over one stretch of the stage (4-9) thins out over this far past each end (px) */
const MIST_SIDE = 260;
/** how far y is outside a band of mist (0 inside it) */
const bandGap = (b: { top: number; bottom: number }, y: number) => (y < b.top ? b.top - y : y > b.bottom ? y - b.bottom : 0);
/** how much of a band reaches x (1 over its stretch, fading out past its ends; a band across the whole stage reaches everywhere) */
const sideFade = (b: { x0?: number; x1?: number }, x?: number) => {
  if (b.x0 === undefined || b.x1 === undefined) return 1;
  if (x === undefined) return 0;
  const out = x < b.x0 ? b.x0 - x : x > b.x1 ? x - b.x1 : 0;
  const k = Math.max(0, 1 - out / MIST_SIDE);
  return k * k * (3 - 2 * k);
};
const KNOT_DROP = 0.8;
/** how far a terrace's pool basin sits down behind the terrace's top edge (px), so it stands back from the path in front of it */
const POOL_SET_BACK = 14;
/** a guard on its feet leaps up and shoves him back if he tries to jump over it: it reaches this far above its feet (px) */
export const GUARD_LEAP = 200;
/** 4-9: a guard blown off its ledge counts for the goal when he is this close to it (px): any further, and he could not get past it */
export const BLOWN_NEAR = 1000;

/** where a knotted vine ends while it is tied: at its knot, never shorter than a rolled-up bundle at its top, never longer than itself */
export const tiedBottom = (topY: number, bottomY: number, knotY: number): number => Math.min(bottomY, Math.max(topY + 24, knotY));

export class W4Play {
  private patience: PatienceState[];
  private flow: number[];
  private pool: number[];
  private knots: Array<KnotState & { freedAt?: number }>;
  /** a knotted vine's own swing (physics.ts swingSetup), kept while it hangs tied up and still */
  private vineSwing = new Map<number, number>();
  /** the host's clock at the last step (s) */
  private clock = 0;
  private vineFull = new Map<number, number>();
  private vineTied = new Map<number, number>();
  private monkeys: CapState[];
  private fruit: Array<{ state: 'hang' | 'fall' | 'ground' | 'gone'; x: number; y: number; vy: number; at: number }>;
  private chimeRang: number[];
  private rockHit = new Set<string>();
  /**
   * a rock on the ground ahead has shown its warning to him (its shadow and grit, with Dot's line the first time): until then no rock
   * that falls to the ground hurts him, so the first one he meets can never hit before it was warned
   */
  private rockWarned = false;
  /** 4-6: he has been well up off the forest floor (so being back on it is a fall, not the start) */
  private wasUp = false;
  /** the height of the ground he last stood on (deepFall) */
  private groundY = NaN;
  /** the view drawBack last drew (drawFront culls by it) */
  private view = { x0: -Infinity, x1: Infinity };
  /** the first boulder's line (dryTip) has been said */
  private dryTold = false;
  /** each nest: the last look that blew him back, and when its latest flurry started and which way it pushes */
  private nestBlow: Array<{ cycle: number; at: number; dir: number }>;
  /** 4-9: the guards that have been blown off their ledges while he was close (each counts once), and when each omen began */
  private blownOff = new Set<number>();
  private omenAt: number[];
  /** each fall: the side he is on (-1 left, 1 right), kept while he is in its water: the side he came in from, that it throws him out of */
  private fallSide: Array<-1 | 1>;
  private splashAt = -9;

  constructor(private readonly w4: W4Extras, platforms: Platform[], private readonly vines: Vine[]) {
    // (start loading World 4's pieces now, so the painted ones are up before the first nest or boulder is on screen)
    w4ArtReady();
    this.patience = (w4.patience ?? []).map(() => newPatience());
    this.flow = (w4.falls ?? []).map(() => 1);
    this.fallSide = (w4.falls ?? []).map(() => -1);
    this.pool = (w4.pools ?? []).map(() => 1);
    this.knots = (w4.knots ?? []).map(() => newKnot());
    this.monkeys = (w4.monkeys ?? []).map((m) => newCapuchin(m));
    this.fruit = (w4.fruit ?? []).map((f) => ({ state: 'hang', x: f.x, y: f.y, vy: 0, at: 0 }));
    this.chimeRang = (w4.chimes ?? []).map(() => -9);
    this.nestBlow = (w4.nests ?? []).map(() => ({ cycle: -1, at: -9, dir: 1 }));
    this.omenAt = (w4.omens ?? []).map(() => NaN);
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
      // (tied up it hangs still: the self-swing, physics.ts, starts as Dot frees it, growing to the swing the stage gave it)
      this.vineSwing.set(v.id, v.swingAmp ?? TIMED.amp);
      v.swingAmp = 0;
    }
  }

  /**
   * one frame. Returns how much of his walking speed is left (shallow water slows a wade), any push the stage's own winds give him on
   * top of the gust lanes (a freed eaglet's parent beating its wings: px/s, + to the right), and whether pouring water threw him back
   * this frame (the engine takes his steering for a moment, FALLS.stagger, so the knock reads)
   */
  step(dt: number, h: W4Host): { speed: number; wind: number; knocked: boolean } {
    const p = h.player;
    const w4 = this.w4;
    this.clock = h.t;
    let speed = 1;
    let knocked = false;

    // into the mist: well below the last ledge, with nothing under him, is a fall
    if (w4.deepFall !== undefined) {
      if (p.grounded || p.climbing || !Number.isFinite(this.groundY)) this.groundY = p.y;
      else if (p.y > this.groundY + w4.deepFall) {
        this.groundY = NaN;
        h.fellOff?.();
      }
    }

    // 4-6: back down on the forest floor after a fall, away from the one trunk that climbs up from it: Dot points the way
    if (w4.floor) {
      if (p.y < w4.floor.y - 200) this.wasUp = true; // (up the first trunk, 280 px or more)
      else if (this.wasUp && p.grounded && Math.abs(p.y - w4.floor.y) < 4 && Math.abs(p.x - w4.floor.trunkX) > 350) {
        const way = p.x > w4.floor.trunkX ? 'left' : 'right';
        h.tip('w4:floor', `Back on the ground! Follow the petals ${way}, to the trunk by the start, and climb back up`, 4.2);
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
      // the warning, shown to him: a rock on the ground he is on (or nearly), not far ahead, while it is in its warning. The first time,
      // Dot says what it means (the stage's own hint, said here if it was not said already)
      if (!r.air && s.phase === 'warn' && Math.abs(r.x - p.x) < 520 && Math.abs(r.land - p.y) < 160) {
        this.rockWarned = true;
        if (w4.rockTip) h.tip(`tip:${w4.rockTip}`, w4.rockTip, 3.6);
      }
      // (round 4's rocks down the climbs, 2026-10-28: an air rock in a stage with a rock tip is taught the same way, its grit warning near
      // him says the tip, and it does not hurt before that: Dot's queue once held the stage's line back past the first climb rock)
      if (r.air && w4.rockTip && s.phase === 'warn' && Math.abs(r.x - p.x) < 520 && p.y > r.top - 160 && p.y < r.land + 40) {
        this.rockWarned = true;
        h.tip(`tip:${w4.rockTip}`, w4.rockTip, 3.6);
      }
      if ((!r.air || w4.rockTip) && !this.rockWarned) return;
      if (!this.rockHit.has(cycle) && p.invincibleTimer <= 0 && rockHits(r, h.t, p.x, p.y, 64)) {
        this.rockHit.add(cycle);
        // in the air (4-7's glides) a rock costs a heart, never the ledge: he keeps the way and the speed he was gliding. It knocked him
        // back from the rock at 200 px/s, and with the thumb held still on the leaf (no steer to win it back) he drifted back over the
        // drop and down into the mist: a heart turned into a life (QA: Matt, "Twist: falling rocks", 5 pit lives in 9 visits)
        const air = !p.grounded;
        const vx = p.vx;
        h.hurt(air ? 0 : p.x >= r.x ? 1 : -1);
        if (air) p.vx = vx;
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
      // past the top of a plug fall's stair (only a stopped fall lets him there): its boulder is in its slot, and it stays dry
      if (w.plug && w.past && p.grounded && p.x > w.past.x && p.y <= w.past.y && !plugged(w, platX)) {
        const b = h.platforms.find((q) => q.id === w.plug!.platformId);
        if (b) b.x = w.plug.atX;
        this.flow[i] = 0;
      }
      const before = this.flow[i];
      this.flow[i] = stepFlow(w, before, plugged(w, platX), h.t, dt);
      if (before > FALLS.trickle && this.flow[i] <= FALLS.trickle && Math.abs(w.x - p.x) < 900) {
        h.sfx('splash');
        // a boulder he has just rolled in: say it worked (the water is a long way down from the shelf, and easy to miss)
        if (w.plug && Math.abs(w.x - p.x) < 700) {
          // (the first one, in a stage whose steps need it: the double jump told now, before he is down at them)
          if (this.w4.dryTip && !this.dryTold) {
            this.dryTold = true;
            h.tip('w4:drySteps', this.w4.dryTip, 3.6);
          } else h.tip('w4:plugged', 'That stopped the water! Now the steps under it are dry: climb them', 3.4);
        }
      }
      // pouring water is a wall: it throws him back out the side he came in from (waterfalls.ts fallWall); out of it, that side is
      // simply the side he is on
      if (!inColumn(w, p.x, p.y)) this.fallSide[i] = p.x < w.x + w.width / 2 ? -1 : 1;
      else if (!w.veil && !p.climbing && !p.hanging && !p.isVineSwinging) {
        const hit = fallWall(w, this.flow[i], this.fallSide[i], p, dt);
        if (hit) {
          p.x = hit.x;
          p.vx = hit.vx;
          p.vy = hit.vy;
          knocked = true;
          if (!hit.washed && h.t - this.splashAt > 0.6) {
            this.splashAt = h.t;
            h.sfx('splash');
          }
          h.tip(w.surge ? 'w4:surge' : 'w4:fall', w.surge ? 'Too strong to climb! Wait in the cave for the water to ease' : 'The water pushes you back. Can you stop it at the top?', 3.4);
        }
      }
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
      if (was.phase === 'tied' && underKnot(k, p.x, p.y)) h.tip('w4:knot', KNOT_TEACH, 3.6);
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
          // its swing grows as it drops, from hanging still to the vine's own (the default) once it is down
          v.swingAmp = (this.vineSwing.get(v.id) ?? TIMED.amp) * u * u;
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
          h.tip('w4:thief', 'Hey! That monkey took a petal! Run after it, and touch it when it stops to tease you', 3.4);
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
          if (!m.blowOff) h.float('WHOOOA!', s.x, s.y - 60, '#99f6e4');
          else {
            // (4-9) blown clean off the ledge: it counts for the goal, once, if he was near enough to get past it
            h.float('OFF THE LEDGE!', s.x, s.y - 60, '#99f6e4');
            if (Math.abs(p.x - s.x) < BLOWN_NEAR && !this.blownOff.has(i)) {
              this.blownOff.add(i);
              h.defeat?.(s.x, s.y);
            }
            if (Math.abs(p.x - s.x) < 400) h.tip('w4:blowOff', 'Now! Run past before it climbs back up', 2.6);
          }
        }
        if (capBlocks(m, s, p.x) && p.y < s.y + 40 && p.y > s.y - GUARD_LEAP) {
          // a guard on its feet will not let him by: he bumps back off it (and a jump over it meets it leaping up at him)
          p.x = s.x + (p.x >= s.x ? 30 : -30);
          p.vx = 0;
          h.tip('w4:guard', 'The guard will not let you pass. Wait for the wind to blow it over', 3.2);
        }
      }
    });
    // the Sovereign overhead (4-9): each omen plays once, the first time he passes it
    (w4.omens ?? []).forEach((o, i) => {
      if (!Number.isNaN(this.omenAt[i]) || p.x < o.x) return;
      this.omenAt[i] = h.t;
      if (o.kind === 'shadow') h.sfx('cry');
    });
    return { speed, wind: w4.cliffNests?.length ? nestWind(h.collectibles, p.x, p.y, p.grounded, h.t) : 0, knocked };
  }

  /**
   * under the ground (before the stage's platforms are painted): the pool basins that stand on a terrace (4-3). He walks along the
   * terrace in front of a basin, so its foot sits behind the terrace's top edge and it reads as standing back against the cliff, not
   * as something he is walking through.
   */
  drawUnder(ctx: CanvasRenderingContext2D, view: { x0: number; x1: number }) {
    (this.w4.pools ?? []).forEach((pool, i) => {
      if (!pool.art || pool.art.cx < view.x0 - pool.art.w || pool.art.cx > view.x1 + pool.art.w) return;
      drawPool(ctx, pool.art.cx, pool, this.pool[i], { ...pool.art, b: pool.art.b + POOL_SET_BACK });
    });
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
      // (a basin painted where the stage says stands back on its terrace, behind the ground: drawUnder)
      if (!pool.art && fall && near(fall.x)) drawPool(ctx, fall.x + fall.width / 2, pool, this.pool[i]);
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
      // (a fall whose stream runs along a painted channel, 4-3, has its spout in that painting, and plugged it simply runs dry: 4-8's
      // spout high on the cliff, with the water landing on the boulder and running back along the shelf, would say it still flows)
      if (!(w4.decor ?? []).some((d) => d.wet === w.id)) drawSpout(ctx, b, w, this.flow[i], t);
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
    (w4.omens ?? []).forEach((o, i) => {
      const since = t - this.omenAt[i];
      if (!(since >= 0)) return;
      if (o.kind === 'shadow' && since < OMEN.shadow) drawSovereignPass(ctx, view, o, since / OMEN.shadow);
      else if (o.kind === 'feather' && since < OMEN.feather + OMEN.rest) drawFeather(ctx, o, since);
    });
    (w4.nests ?? []).forEach((n, i) => near(n.x) && drawNest(ctx, n, t, t - this.nestBlow[i].at));
    // the mist bank over everything in it (ledges and trunks alike), behind Pokey so he can always be seen in it
    if (view.y0 !== undefined && view.y1 !== undefined) this.drawMistBank(ctx, t, { x0: view.x0, x1: view.x1, y0: view.y0, y1: view.y1 });
    // the places that settle the mist: a soft glow on the ledge, over the mist, so he can tell which ledges to stand still on
    (w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist' || !s.area || !near((s.x0 + s.x1) / 2, s.x1 - s.x0)) return;
      drawSettleGlow(ctx, s, mistReveal(this.patience[i]), t);
    });
  }

  /**
   * the mist's thickness at height y (0 clear .. 1 thick): the bands it covers, less what standing still has settled. A band that only
   * spans part of the stage (4-9, `area.x0/x1`) counts only when x is given, and fades out past its ends.
   */
  mistAt(y: number, x?: number): number {
    let mist = 0, clear = 0;
    (this.w4.patience ?? []).forEach((s, i) => {
      if (s.kind !== 'mist' || !s.area) return;
      const side = sideFade(s.area, x);
      if (side <= 0) return;
      const gap = bandGap(s.area, y);
      mist = Math.max(mist, (1 - gap / MIST_EDGE) * side);
      // (what it settles ends more sharply than the bank does, so a settled spot shows nothing of the next column up)
      clear = Math.max(clear, Math.max(0, 1 - gap / CLEAR_EDGE) * mistReveal(this.patience[i]));
    });
    return mist * (1 - clear);
  }

  private drawMistBank(ctx: CanvasRenderingContext2D, t: number, v: { x0: number; x1: number; y0: number; y1: number }) {
    const spots = (this.w4.patience ?? []).map((s, i) => ({ s, i })).filter(({ s }) => s.kind === 'mist' && s.area);
    // the bands across the whole stage (4-6) are one bank; a band over one stretch (4-9) is a bank of its own, over that stretch
    const across = spots.filter(({ s }) => s.area!.x0 === undefined || s.area!.x1 === undefined).map(({ s }) => s.area!);
    if (across.length) this.drawBank(ctx, t, v, across, (y) => this.mistAt(y), v.x0 - 20, v.x1 + 20);
    for (const { s, i } of spots) {
      const a = s.area!;
      if (a.x0 === undefined || a.x1 === undefined) continue;
      const x0 = Math.max(v.x0 - 20, a.x0 - MIST_SIDE), x1 = Math.min(v.x1 + 20, a.x1 + MIST_SIDE);
      if (x1 <= x0) continue;
      const reveal = mistReveal(this.patience[i]);
      const at = (y: number) => {
        const gap = bandGap(a, y);
        return Math.max(0, 1 - gap / MIST_EDGE) * (1 - Math.max(0, 1 - gap / CLEAR_EDGE) * reveal);
      };
      this.drawBank(ctx, t, v, [a], at, x0, x1, a);
    }
  }

  /** one bank of mist over [xa, xb]: a wash of fog as thick as `at` says at each height, with drifting puffs on top */
  private drawBank(
    ctx: CanvasRenderingContext2D, t: number, v: { x0: number; x1: number; y0: number; y1: number },
    bands: Array<{ top: number; bottom: number }>, at: (y: number) => number, xa: number, xb: number, ends?: { x0?: number; x1?: number },
  ) {
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
      const a = Math.min(1, MIST_THICK * at(y) + MIST_HAZE * inside);
      g.addColorStop(k / stops, `rgba(223,231,238,${a.toFixed(3)})`);
    }
    ctx.fillStyle = g;
    if (!ends || ends.x0 === undefined || ends.x1 === undefined) ctx.fillRect(xa, top, xb - xa, bottom - top);
    else {
      // a band over one stretch: solid over the stretch, thinning out over MIST_SIDE past each end
      const STRIPS = 20;
      const w = MIST_SIDE / STRIPS;
      const lo = Math.max(xa, ends.x0), hi = Math.min(xb, ends.x1);
      if (hi > lo) ctx.fillRect(lo, top, hi - lo, bottom - top);
      for (let k = 0; k < STRIPS; k++) {
        const q = 1 - (k + 0.5) / STRIPS;
        ctx.globalAlpha = q * q * (3 - 2 * q);
        const l = ends.x0 - (k + 1) * w, rr = ends.x1 + k * w;
        if (l + w > xa && l < xb) ctx.fillRect(Math.max(xa, l), top, Math.min(xb, l + w) - Math.max(xa, l), bottom - top);
        if (rr + w > xa && rr < xb) ctx.fillRect(Math.max(xa, rr), top, Math.min(xb, rr + w) - Math.max(xa, rr), bottom - top);
      }
      ctx.globalAlpha = 1;
    }
    // drifting puffs on top, so it reads as mist rather than a wall
    const gx = 170, gy = 64;
    const span = ends && ends.x0 !== undefined && ends.x1 !== undefined ? { x0: ends.x0, x1: ends.x1 } : null;
    for (let y = Math.floor(top / gy) * gy; y < bottom + gy; y += gy) {
      // (as thin as the mist is anywhere across a puff, so none shows as a disc where the mist has settled or at its edges)
      const m = Math.min(at(y - 34), at(y), at(y + 34));
      if (m <= 0.03) continue;
      const row = Math.round(y / gy);
      const drift = (t * (14 + (Math.abs(row) % 3) * 6) + Math.abs(row) * 53) % gx;
      const pic = softPuff(row % 2 ? '248,250,252' : '203,213,225');
      ctx.globalAlpha = 0.4 * m * m;
      // (feathered puffs, not flat ovals: hard-edged white ovals read as shapes over the scene, testers 2026-10-25)
      for (let x = Math.floor(xa / gx) * gx - gx; x < xb + gx; x += gx) {
        const px = x + drift;
        // (past the ends of a stretch the puffs thin out with the bank)
        const side = span ? sideFade(span, px) : 1;
        if (side <= 0.02) continue;
        ctx.globalAlpha = 0.4 * m * m * side;
        ctx.drawImage(pic, px - 150, y + Math.sin(t * 0.5 + x * 0.01) * 6 - 46, 300, 92);
      }
    }
    ctx.restore();
  }

  /** standing still on a mist spot, the view drifts over to the way up it is showing him: where to look, and how much (0..1) */
  look(px: number, feetY: number): { x: number; y: number; u: number; leftX?: number } | null {
    let best: { x: number; y: number; u: number; leftX?: number } | null = null;
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
      // (aimed a little below the knot rather than halfway down to him: held upright, Dot's speech bubble covers the top of the screen,
      // and the knot and her flight up to it must show below it; the engine keeps his feet in view. Held sideways there is no room
      // under the bubble, so `leftX`: the view puts the knot near its left edge, beside the bubble in the middle)
      if (u > 0 && (!best || u > best.u)) best = { x: k.x, y: Math.min((k.y + feetY) / 2, k.y + 60), u, leftX: k.x };
    });
    // 4-3's tree falls: on the terrace at the foot of a fall that still pours (or jumping up into it), far enough from the tree that it would be behind the
    // view, the view centres between him and the tree, a little toward the tree (they are 340-360 px apart there: both fit the 440 px of
    // an upright phone, the trunk clear of the edge). The engine keeps him in view
    for (const ft of this.w4.fallTrees ?? []) {
      const i = (this.w4.falls ?? []).findIndex((q) => q.id === ft.fall);
      const w = (this.w4.falls ?? [])[i];
      if (!w || this.flow[i] <= 0.5 || feetY > w.bottom + 24 || feetY < w.bottom - 280 || px < ft.x || px > w.x + 80) continue;
      const u = Math.max(0, Math.min(1, (px - ft.x - 110) / 140));
      if (u > 0 && (!best || u > best.u)) best = { x: ft.x + (px - ft.x) * 0.46, y: feetY - 120, u };
    }
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

/**
 * a mist spot's glow (4-6, 4-9): a soft pale light along the ledge where standing still settles the mist, breathing slowly, with a few
 * motes rising; it fades as the mist settles (he has found it), and comes back as the mist rises again
 */
function drawSettleGlow(ctx: CanvasRenderingContext2D, s: PatienceSpot, reveal: number, t: number) {
  const a = (1 - reveal) * (0.55 + 0.2 * Math.sin(t * 2.2 + s.x0 * 0.01));
  if (a <= 0.02) return;
  const cx = (s.x0 + s.x1) / 2, half = (s.x1 - s.x0) / 2 + 20;
  ctx.save();
  ctx.translate(cx, s.y - 4);
  ctx.scale(1, 0.22);
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, half);
  g.addColorStop(0, `rgba(254, 249, 195, ${0.7 * a})`);
  g.addColorStop(0.6, `rgba(253, 230, 138, ${0.32 * a})`);
  g.addColorStop(1, 'rgba(253, 230, 138, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, half, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = `rgba(254, 249, 195, ${0.8 * a})`;
  for (let k = 0; k < 5; k++) {
    const u = (t * 0.45 + k * 0.2) % 1;
    const mx = cx + (((k * 53) % 100) / 100 - 0.5) * (half * 1.4);
    ctx.globalAlpha = Math.sin(u * Math.PI);
    ctx.beginPath();
    ctx.arc(mx, s.y - 6 - u * 46, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * A fall: the painted waterfall set (w4FallsArt.ts) on its box, its bodies, the lip along its top edge and the white water and mist at
 * its foot; the old shapes and World 4's lip pieces as the stand-in while the set loads
 */
function drawFall(ctx: CanvasRenderingContext2D, w: Waterfall, flow: number, t: number) {
  if (drawFallBodies(ctx, w, flow, t)) {
    drawFallLips(ctx, w, flow);
    drawFallFoot(ctx, w, flow, t);
    return;
  }
  drawFallWater(ctx, w, flow, t);
  drawLip(ctx, w, flow);
}

/**
 * the stand-in's lips over a fall: one for about every `span` px of its width (a wide fall pours off a row of them), each `pad` px
 * wider than its share so they overlap, their rock's underside `below` px down the water (hiding where it starts)
 */
const LIP = { span: 300, pad: 50, below: 40 };

/**
 * The stand-in's lip at a fall's top (World 4's lip pieces): the rock pouring a full fall while it flows, the same rock trickling once
 * it is stopped, the one fading into the other with the flow. A fall a boulder plugs already pours out of its painted channel (the
 * stage's decor), so it gets none. Nothing before the atlas loads.
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

/** the stand-in's water: a see-through sheet with streaks running down it and foam at its foot */
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
 * a curtain of water in front of him (4-5): the painted set's bodies see-through enough to show him standing behind it, its lip up on
 * the cliff and its white water and mist on the path; the old sheet with rippling edges as the stand-in while the set loads
 */
function drawVeil(ctx: CanvasRenderingContext2D, w: Waterfall, t: number) {
  if (drawFallBodies(ctx, w, 1, t, 0.8)) {
    drawFallLips(ctx, w, 1);
    drawFallFoot(ctx, w, 1, t);
    return;
  }
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

/** the log floating on a pool (the painted log, bobbing as it rides up and down on the water; a plain drawn one while the kit loads) */
function drawFloatLog(ctx: CanvasRenderingContext2D, p: Platform, t: number) {
  const { width: w, height: h } = p;
  const x = p.x;
  const bob = Math.sin(t * 2.2 + p.x) * 1.5;
  const y = p.y + bob;
  ctx.save();
  ctx.translate(0, bob);
  const painted = drawLogArt(ctx, p, false);
  ctx.restore();
  if (painted) {
    // ripples where it sits in the water
    ctx.save();
    ctx.strokeStyle = 'rgba(224,242,254,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 2, w * 0.6 + Math.sin(t * 3) * 4, 5, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
    return;
  }
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
    // the shadow on the ground grows as the rock comes: plain from the first moment of the warning (dark, and as wide as the rock),
    // with a pale ring round it so it reads on dark rock as well as pale
    const u = s.phase === 'warn' ? 0.35 + 0.35 * s.u : 0.7 + 0.3 * s.u;
    ctx.fillStyle = `rgba(255, 251, 235, ${0.4 + 0.3 * u})`;
    ctx.beginPath();
    ctx.ellipse(r.x, r.land - 2, 30 + 24 * u, 10 + 6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(15,23,42,${0.5 + 0.4 * u})`;
    ctx.beginPath();
    ctx.ellipse(r.x, r.land - 2, 24 + 22 * u, 7 + 6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (s.phase === 'warn' && !r.air) {
    // grit pattering down onto the spot, through the last stretch above it (in view on a phone held either way, however far up the
    // rock lets go), and little stones hopping where it lands
    const span = Math.min(260, r.land - r.top);
    const n = 8 + Math.round(10 * s.u);
    ctx.strokeStyle = 'rgba(30, 27, 24, 0.85)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < n; k++) {
      const gx = r.x - 14 + ((k * 7) % 28);
      const gy = r.land - span + ((t * 330 + k * (span / n)) % span);
      const sz = 5 + (k % 3) * 2;
      ctx.fillStyle = k % 2 ? '#d6d3d1' : '#78716c';
      ctx.fillRect(gx, gy, sz, sz);
      ctx.strokeRect(gx, gy, sz, sz);
    }
    for (let k = 0; k < 3; k++) {
      const h = Math.abs(Math.sin(t * 9 + k * 2.1)) * (4 + 4 * s.u);
      ctx.fillStyle = '#d6d3d1';
      ctx.fillRect(r.x - 18 + k * 16, r.land - 7 - h, 6, 6);
    }
  }
  if (s.phase === 'warn') {
    ctx.fillStyle = '#9ca3af';
    if (r.air) {
      // through open air: a pale band down the whole of its path with grit streaming through it, so the warning is in view on any
      // screen and reads against grey rock as well as pale mist; it thickens as the rock comes
      // (the band fades out at its sides and at both ends: a hard-edged bright strip read as a seam in the backdrop, testers
      // 2026-10-25; and the grit is little round stones and dust, not grey squares)
      const span = r.land - r.top;
      const band = ctx.createLinearGradient(r.x - 30, 0, r.x + 30, 0);
      const a = 0.12 + 0.2 * s.u;
      band.addColorStop(0, 'rgba(255,251,235,0)');
      band.addColorStop(0.5, `rgba(255,251,235,${a.toFixed(3)})`);
      band.addColorStop(1, 'rgba(255,251,235,0)');
      ctx.fillStyle = band;
      ctx.fillRect(r.x - 30, r.top + 40, 60, span - 80);
      const n = 8 + Math.round(14 * s.u);
      for (let k = 0; k < n; k++) {
        const gx = r.x + Math.sin(k * 2.3) * 11;
        const gy = r.top + ((t * 360 + k * (span / n)) % span);
        // (fading in and out at the ends of its fall)
        const end = Math.min(1, (gy - r.top) / 60, (r.land - gy) / 60);
        if (end <= 0) continue;
        const rad = 1.6 + (k % 3) * 0.9;
        ctx.globalAlpha = end;
        ctx.fillStyle = k % 3 === 0 ? 'rgba(214,211,209,0.55)' : k % 2 ? '#57534e' : '#78716c';
        ctx.beginPath();
        ctx.ellipse(gx, gy, k % 3 === 0 ? rad * 2.2 : rad, k % 3 === 0 ? rad * 1.4 : rad * 1.15, k * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
      ctx.beginPath();
      ctx.arc(r.x + Math.cos(a) * d * (k % 2 ? 1 : -1), r.land - Math.sin(a) * d * (1 - s.u) - 4, 4 + (k % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawUpdraft(ctx: CanvasRenderingContext2D, u: Updraft, t: number) {
  // a faint warm glow up the column (soft at its sides and ends), and pale wisps rising, thicker in the middle of it
  ctx.save();
  const w = u.x1 - u.x0;
  const glow = ctx.createLinearGradient(u.x0, 0, u.x1, 0);
  glow.addColorStop(0, 'rgba(253,230,190,0)');
  glow.addColorStop(0.5, 'rgba(253,230,190,0.16)');
  glow.addColorStop(1, 'rgba(253,230,190,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(u.x0, u.top + 60, w, u.bottom - u.top - 60);
  for (let k = 0; k < 9; k++) {
    const x = u.x0 + w * ((k + 0.5) / 9) + Math.sin(t * 1.7 + k) * 8;
    const span = u.bottom - u.top;
    const y = u.bottom - ((t * 160 + k * 97) % span);
    const a = (0.22 + 0.2 * Math.sin((Math.PI * (k + 0.5)) / 9)) * Math.min(1, (y - u.top) / 80);
    if (a <= 0) continue;
    ctx.fillStyle = `rgba(255, 247, 237, ${a.toFixed(3)})`;
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

function drawKnot(ctx: CanvasRenderingContext2D, k: DotKnot, st: KnotState & { freedAt?: number }, t: number) {
  ctx.save();
  // the spot he waits on: a soft glow on the ground with Dot's little landing mark in it, and a ring round it that fills as he keeps still
  const mark = knotMark(st, st.freedAt === undefined ? 0 : t - st.freedAt);
  if (mark > 0) {
    const cx = knotSpotX(k);
    const rx = Math.max(34, (k.x1 - k.x0) / 2 + 16);
    const gy = k.ground - 2;
    const pulse = 0.75 + 0.25 * Math.sin(t * 3.2);
    const lit = st.phase === 'tied' ? Math.min(1, st.t / DOT_HELP.ask) : 1;
    ctx.globalAlpha = mark;
    const g = ctx.createRadialGradient(cx, gy, 2, cx, gy, rx);
    g.addColorStop(0, `rgba(190, 255, 220, ${0.7 * pulse + 0.25 * lit})`);
    g.addColorStop(0.6, `rgba(110, 231, 183, ${0.38 * pulse + 0.2 * lit})`);
    g.addColorStop(1, 'rgba(110, 231, 183, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, gy, rx, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // the landing mark: three little strokes, like a hummingbird's footprint
    ctx.strokeStyle = `rgba(236, 253, 245, ${0.7 + 0.3 * lit})`;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (const a of [-0.55, 0, 0.55]) {
      ctx.beginPath();
      ctx.moveTo(cx, gy + 3);
      ctx.lineTo(cx + Math.sin(a) * 11, gy + 3 - Math.cos(a) * 7);
      ctx.stroke();
    }
    // its rim, faint, so the spot reads as a place to stand; and how long he has kept still: the ring fills, and stays full while she
    // is up there
    ctx.strokeStyle = `rgba(167, 243, 208, ${0.35 + 0.2 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, gy, rx - 6, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (lit > 0) {
      ctx.strokeStyle = 'rgba(236, 253, 245, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, gy, rx - 6, 10, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (st.phase !== 'free') {
    // the knot: it shakes while she picks at it, and comes loose a strand at a time
    const shake = st.phase === 'picking' ? Math.sin(t * 40) * 2.5 : 0;
    const left = st.phase === 'picking' ? 1 - 0.5 * Math.min(1, st.t / DOT_HELP.pick) : 1;
    ctx.strokeStyle = '#7c4a1e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(k.x + shake, k.y, 10, 0, Math.PI * 2 * left);
    ctx.stroke();
    if (st.phase === 'picking') {
      // bits of fibre flicking off
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const u = (st.t * 2.4 + i / 3) % 1;
        const a = i * 2.1 + 0.6;
        ctx.globalAlpha = 1 - u;
        ctx.beginPath();
        ctx.moveTo(k.x + Math.cos(a) * (12 + u * 20), k.y + Math.sin(a) * 8 + u * 26);
        ctx.lineTo(k.x + Math.cos(a) * (18 + u * 20), k.y + Math.sin(a) * 8 + u * 30);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  // Dot: out by his head while he waits, flying up to the knot, then pecking it loose
  const d = dotAtKnot(k, st, t);
  if (d) {
    if (st.phase === 'flying') {
      // a faint trail behind her, so the flight reads
      const back = dotAtKnot(k, { phase: 'flying', t: Math.max(0, st.t - 0.12) }, t);
      if (back) {
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.5)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(back.x, back.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
    }
    if (!drawDotFrame(ctx, flyFrame(t), d.x, d.y, 0.6, d.face, d.pecking ? 0.25 : 0)) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 11, 0, Math.PI * 2);
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
  if (s.mode === 'blown' && m.blowOff) {
    drawBlownOff(ctx, m, s);
    return;
  }
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
  // feathered puffs, thick in the middle so the ledge is still hidden (two layers), soft at the rim
  const pic = softPuff('226,232,240');
  for (let layer = 0; layer < 2; layer++) {
    for (let k = 0; k < 5; k++) {
      const x = pl.x + (k / 4) * pl.width + Math.sin(t * 0.6 + k + layer) * 10;
      const rx = pl.width / 3 + 40, ry = 52;
      ctx.drawImage(pic, x - rx, pl.y - 6 - ry, rx * 2, ry * 2);
    }
  }
  ctx.restore();
}

/** a soft round puff of mist ('r,g,b'), painted once: opaque in the middle, feathered to nothing at its rim */
const puffs = new Map<string, HTMLCanvasElement>();
function softPuff(rgb: string): HTMLCanvasElement {
  let cv = puffs.get(rgb);
  if (cv) return cv;
  const N = 128;
  cv = document.createElement('canvas');
  cv.width = N;
  cv.height = N;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.4, `rgba(${rgb},0.8)`);
  g.addColorStop(0.75, `rgba(${rgb},0.25)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, N, N);
  puffs.set(rgb, cv);
  return cv;
}

/**
 * 4-7: what lies under the ledges is a drop, not a floor. Over the backdrop (whose painted rocks, pools and feather read as ground a
 * tester tried to stand on), from a little under the ledge he last stood on down to the bottom of the view: thick mist that deepens
 * to a blue-grey dark, with soft banks drifting along its top so it is no flat line. Drawn in screen space, before the ledges, so every
 * ledge (and Pokey) stands out in front of it. `lip`: the screen height of that ledge.
 */
export function drawAbyss(ctx: CanvasRenderingContext2D, vw: number, vh: number, lip: number, t: number) {
  const top = lip + 26;
  if (top >= vh) return;
  ctx.save();
  const g = ctx.createLinearGradient(0, top, 0, Math.max(top + 400, vh));
  g.addColorStop(0, 'rgba(222,231,238,0)');
  g.addColorStop(0.3, 'rgba(214,225,234,0.82)');
  g.addColorStop(0.6, 'rgba(170,188,204,0.93)');
  g.addColorStop(1, 'rgba(96,114,136,0.97)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, vw, Math.max(400, vh - top));
  const pic = softPuff('236,242,247');
  ctx.globalAlpha = 0.55;
  for (let k = 0; k < 7; k++) {
    const w = vw * 0.5;
    const x = ((((k * 0.37 + t * 0.012 * (1 + (k % 3) * 0.3)) % 1.3) + 1.3) % 1.3) * (vw + w) - w;
    ctx.drawImage(pic, x, top + 40 + (k % 3) * 34 - 60, w, 120);
  }
  ctx.restore();
}

/**
 * 4-7: in the air, a soft shadow on the ledge under him (if there is one before the mist), darker as he comes down to it, so he can
 * see where a glide is taking him. (x, feet) is Pokey, `ledge` the top of what is under him.
 */
export function drawLandingShadow(ctx: CanvasRenderingContext2D, x: number, feet: number, ledgeY: number) {
  const h = ledgeY - feet;
  if (h < 30) return;
  const u = Math.max(0, 1 - h / 700);
  ctx.save();
  ctx.globalAlpha = 0.18 + 0.4 * u;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(x, ledgeY + 2, 16 + 16 * u, 4 + 3 * u, 0, 0, Math.PI * 2);
  ctx.fill();
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
  // (a stand-in until the painted nest loads, made to read as the same bird: one big grey harpy eaglet with a pale face, in a deep nest,
  // so the eaglets never look like two different birds on two screens)
  const chick = (dx: number, up: number, eyes: boolean, flap: number) => {
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#334155';
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
  ctx.save();
  ctx.translate(0, -26);
  ctx.scale(1.5, 1.5);
  chick(-4, up1, phase !== 'sleep', flap);
  ctx.restore();
  // the nest: a deep bowl of woven sticks in front of it
  ctx.fillStyle = '#7c5a36';
  ctx.beginPath();
  ctx.ellipse(0, -30, 56, 30, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3420';
  ctx.lineWidth = 3;
  for (let k = 0; k < 7; k++) {
    ctx.beginPath();
    ctx.moveTo(-50 + k * 14, -30 + (k % 2) * 8);
    ctx.lineTo(-36 + k * 14, -6 - (k % 2) * 8);
    ctx.stroke();
  }
}

/**
 * 4-9: a guard blown off its ledge. It is flung up and over the way the gust blows and drops out of sight below the ledge, then, just
 * before it is back on its feet, it hauls itself up over the edge at its post.
 */
function drawBlownOff(ctx: CanvasRenderingContext2D, m: Capuchin, s: CapState) {
  const back = m.blowOff ?? 0;
  const dir = s.fell ?? 1;
  const climb = 0.7;
  if (s.t < 1.1) {
    const k = s.t;
    const x = s.x + dir * 230 * k;
    const y = s.y - 200 * k + 380 * k * k;
    const a = Math.max(0, Math.min(1, (1.1 - k) / 0.35));
    if (drawW4(ctx, 'capStartled', x, y, 64, { rot: dir * k * 9, alpha: a, flip: dir < 0 })) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y - 20);
    ctx.rotate(dir * k * 9);
    ctx.fillStyle = '#3b2416';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    ctx.beginPath();
    ctx.arc(6, -18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (s.t < back - climb) return;
  // hauling itself up over the edge of the ledge, at its post
  const u = Math.min(1, (s.t - (back - climb)) / climb);
  const y = m.y + 46 * (1 - u);
  if (drawW4(ctx, 'capHang', m.x, y + 10, 62, { alpha: Math.min(1, u * 2.5) })) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, u * 2.5);
  ctx.fillStyle = '#3b2416';
  ctx.beginPath();
  ctx.ellipse(m.x, y - 16, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5e6c8';
  ctx.beginPath();
  ctx.arc(m.x + 6, y - 36, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 4-9: the Sovereign passing high overhead: she glides across the top of the view (her painted glide frame, small with the height;
 * a dark silhouette until her atlas has loaded), and her shadow sweeps along the ledge he stands on, under her
 */
function drawSovereignPass(ctx: CanvasRenderingContext2D, view: { x0: number; x1: number; y0?: number; y1?: number }, o: Omen, u: number) {
  const span = view.x1 - view.x0;
  const x = view.x0 - 220 + (span + 440) * u;
  const y0 = view.y0 ?? o.y - 400, y1 = view.y1 ?? o.y + 100;
  // (below the stage card and the hearts; held upright, below Dot's line at the top of the screen too)
  const tall = y1 - y0 > span;
  const y = y0 + (tall ? (y1 - y0) * 0.4 : Math.max(130, (y1 - y0) * 0.3)) + Math.sin(u * Math.PI) * 16;
  const fade = Math.min(1, Math.sin(Math.PI * u) * 2.5);
  if (fade <= 0.01) return;
  // her shadow on the ledge: a long dark oval racing ahead of where he stands
  ctx.save();
  ctx.fillStyle = `rgba(8, 12, 8, ${(0.42 * fade).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(x, o.y - 3, 110, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(8, 12, 8, ${(0.25 * fade).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(x, o.y - 3, 170, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // her, gliding
  const size = Math.max(0.42, Math.min(0.6, span / 1500));
  ctx.save();
  ctx.globalAlpha = 0.92 * fade;
  ctx.translate(x, y);
  ctx.scale(size, size);
  const ok = sovereignSprite.still(ctx, 'glide');
  ctx.restore();
  if (ok) return;
  ctx.save();
  ctx.globalAlpha = 0.8 * fade;
  ctx.fillStyle = '#1c1917';
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(40, -4, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, -4);
  ctx.quadraticCurveTo(-40, -50, -110, -60);
  ctx.quadraticCurveTo(-60, -20, -26, 4);
  ctx.moveTo(14, -4);
  ctx.quadraticCurveTo(30, -50, 90, -66);
  ctx.quadraticCurveTo(50, -22, 20, 4);
  ctx.fill();
  ctx.restore();
}

/** 4-9: one of the Sovereign's feathers, drifting down from high above him, rocking as it falls, and lying on the ledge a while */
function drawFeather(ctx: CanvasRenderingContext2D, o: Omen, since: number) {
  const u = Math.min(1, since / OMEN.feather);
  const fall = 520;
  const y = o.y - 14 - fall * (1 - u);
  const x = o.x + 120 + Math.sin(since * 1.7) * 46 * (1 - u) - 60 * u;
  const rot = u < 1 ? Math.sin(since * 1.7 + 0.6) * 0.7 : 1.45;
  const a = since > OMEN.feather + OMEN.rest - 1 ? Math.max(0, OMEN.feather + OMEN.rest - since) : 1;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  // the vane: dark brown, barred, a pale tip; the quill down its middle
  ctx.fillStyle = '#4a3423';
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(12, -12, 6, 22);
  ctx.lineTo(0, 26);
  ctx.lineTo(-6, 22);
  ctx.quadraticCurveTo(-12, -12, 0, -30);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e7e5e4';
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(7, -22, 6, -16);
  ctx.lineTo(-6, -16);
  ctx.quadraticCurveTo(-7, -22, 0, -30);
  ctx.fill();
  ctx.strokeStyle = '#2b1d14';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(-8, -6 + k * 9);
    ctx.lineTo(8, -2 + k * 9);
    ctx.stroke();
  }
  ctx.strokeStyle = '#f5f5f4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(0, 34);
  ctx.stroke();
  ctx.restore();
}
