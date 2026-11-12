// The proof that moving a timer onto the one clock (clock.ts cycleRead) changed no number: each timer's old arithmetic is frozen here,
// word for word as it shipped before the move, and the live function must give the very same values (Object.is, not "close") on the
// engine's own frame times, on times that land on a phase edge, and on a seeded spread of lengths, offsets and moments.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ROCK, rockAt, type RockDrop, type RockPhase } from './rockfall.ts';
import { ZONE_RAMP, idleTime, isStatic, zoneState, type Zone, type ZoneState } from './zones.ts';
import { vinePeriod, vinePhase, type ThornVine, type VinePhase } from './thornVine.ts';

// ── frozen: rockfall.ts rockAt as of 347d50fa ──
function oldRockAt(r: RockDrop, t: number): { phase: RockPhase; u: number; y: number } {
  const fallT = Math.max(0.01, (r.land - r.top) / ROCK.speed);
  const c = (((t + r.offset) % r.every) + r.every) % r.every;
  const warnAt = r.every - r.warn - fallT - ROCK.shatter;
  if (c < warnAt) return { phase: 'idle', u: c / Math.max(0.01, warnAt), y: r.top };
  if (c < warnAt + r.warn) return { phase: 'warn', u: (c - warnAt) / r.warn, y: r.top };
  const f = c - warnAt - r.warn;
  if (f < fallT) return { phase: 'fall', u: f / fallT, y: r.top + f * ROCK.speed };
  return { phase: 'shatter', u: (f - fallT) / ROCK.shatter, y: r.land };
}
// ── frozen: zones.ts zoneState as of 347d50fa ──
function oldZoneState(z: Zone, t: number): ZoneState {
  if (z.shut) return { phase: 'idle', u: 0, strength: 0, untilActive: Infinity };
  if (isStatic(z)) return { phase: 'active', u: 0, strength: 1, untilActive: 0 };
  const s = (((t + z.offset) % z.period) + z.period) % z.period;
  const idle = idleTime(z);
  if (s < idle) return { phase: 'idle', u: s / idle, strength: 0, untilActive: z.period - z.active - s };
  if (s < idle + z.warn) return { phase: 'warn', u: (s - idle) / z.warn, strength: 0, untilActive: idle + z.warn - s };
  const a = s - idle - z.warn;
  const r = Math.min(ZONE_RAMP, z.active / 3);
  const ramp = Math.min(1, a / r, (z.active - a) / r);
  return { phase: 'active', u: a / z.active, strength: Math.max(0, ramp), untilActive: 0 };
}
// ── frozen: thornVine.ts vinePhase as of 347d50fa ──
function oldVinePhase(v: ThornVine, t: number): { phase: VinePhase; u: number } {
  const T = vinePeriod(v);
  const c = (((t + v.offset) % T) + T) % T;
  if (c < v.sleep) return { phase: 'sleep', u: c / v.sleep };
  if (c < v.sleep + v.stir) return { phase: 'stir', u: (c - v.sleep) / v.stir };
  return { phase: 'look', u: (c - v.sleep - v.stir) / v.look };
}

/** a small seeded roll (mulberry32): the same spread every run */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
/** the moments to compare at: the engine's own running sum of frames (30 and 60 a second), tenths (where the stages' lengths put a phase
 * edge), a time before 0, and loose rolls */
function moments(roll: () => number): number[] {
  const out: number[] = [-0.4, 0];
  let t30 = 0;
  let t60 = 0;
  for (let n = 0; n < 1500; n++) { t30 += 1 / 30; out.push(t30); }
  for (let n = 0; n < 1500; n++) { t60 += 1 / 60; out.push(t60); }
  for (let n = 0; n < 600; n++) out.push(n / 10, n * 0.1, n / 20);
  for (let n = 0; n < 400; n++) out.push(roll() * 300);
  return out;
}
/** a length the way a stage writes one (a tenth, a twentieth) or a loose roll */
const len = (roll: () => number, lo: number, hi: number): number => {
  const v = lo + roll() * (hi - lo);
  const k = roll();
  return k < 0.45 ? Math.round(v * 10) / 10 : k < 0.7 ? Math.round(v * 20) / 20 : v;
};
function same(a: Record<string, unknown>, b: Record<string, unknown>, what: () => string): number {
  const ka = Object.keys(a);
  assert.deepEqual(ka, Object.keys(b), 'the same fields in the same order');
  for (const k of ka) if (!Object.is(a[k], b[k])) assert.fail(`${k}: ${a[k]} is not the old ${b[k]} (${what()})`);
  return 1;
}

test('rocks on the clock: every drop does exactly what it did, to the last bit', () => {
  const roll = rng(4101);
  const ts = moments(roll);
  let n = 0;
  const seen = new Set<string>();
  const drops: RockDrop[] = [{ x: 500, top: 100, land: 720, every: 5, warn: 1.4, offset: 0 }, { x: 0, top: 0, land: 6, every: 3, warn: 1, offset: 0.5 }];
  for (let i = 0; i < 400; i++) {
    const top = Math.round(roll() * 400);
    drops.push({ x: 0, top, land: top + Math.round(40 + roll() * 900), every: len(roll, 2.6, 8), warn: len(roll, 0.6, 1.8), offset: len(roll, 0, 8) });
  }
  for (const r of drops) for (const t of ts) {
    const now = rockAt(r, t);
    seen.add(now.phase);
    n += same(now, oldRockAt(r, t), () => `${JSON.stringify(r)} at ${t}`);
  }
  assert.deepEqual([...seen].sort(), ['fall', 'idle', 'shatter', 'warn']);
  assert.ok(n > 2_000_000, `${n} reads compared`);
});

test('zones on the clock (spores, wind, the tide, geysers, bolts): every zone does exactly what it did', () => {
  const roll = rng(6202);
  const ts = moments(roll);
  let n = 0;
  const seen = new Set<string>();
  const zone = (o: Partial<Zone>): Zone => ({ kind: 'spore', x0: 0, x1: 100, top: 0, bottom: 100, dir: 1, force: 0, period: 6.4, warn: 1, active: 2.2, offset: 0, ...o } as Zone);
  // the catalogue's own rhythms (zones.ts: spore 6.4/1.0/2.2, wind idle + 1.1 + active, columns idle + warn + active, tide low + 1.8 + 2.2)
  const zs: Zone[] = [
    zone({}), zone({ kind: 'wind', period: 2.4 + 1.1 + 1.8, warn: 1.1, active: 1.8 }), zone({ kind: 'geyser', period: 2 + 1.2 + 1, warn: 1.2, active: 1 }),
    zone({ kind: 'bolt', period: 2.6 + 1.6 + 0.3, warn: 1.6, active: 0.3 }), zone({ kind: 'tide', period: 3 + 1.8 + 2.2, warn: 1.8, active: 2.2 }),
    zone({ kind: 'web', period: 1, warn: 0, active: 1 }), zone({ kind: 'dark', period: 1, warn: 0, active: 1 }), zone({ kind: 'crumble', period: 1, warn: 0, active: 1 }),
    zone({ kind: 'wind', shut: true }),
  ];
  for (let i = 0; i < 400; i++) {
    const warn = len(roll, 0.3, 2);
    const active = len(roll, 0.2, 3);
    const idle = len(roll, 0.4, 5);
    const kind = (['spore', 'wind', 'geyser', 'bolt', 'tide'] as const)[i % 5];
    // half written as a sum (the catalogue's way), half as a round period
    zs.push(zone({ kind, warn, active, period: i % 2 ? idle + warn + active : Math.round((idle + warn + active) * 10) / 10, offset: len(roll, 0, 9) }));
  }
  for (const z of zs) for (const t of ts) {
    const now = zoneState(z, t);
    seen.add(now.phase);
    n += same(now as unknown as Record<string, unknown>, oldZoneState(z, t) as unknown as Record<string, unknown>, () => `${JSON.stringify(z)} at ${t}`);
  }
  assert.deepEqual([...seen].sort(), ['active', 'idle', 'warn']);
  assert.ok(n > 2_000_000, `${n} reads compared`);
});

test('thorn vines on the clock: every vine does exactly what it did, the one that never sleeps too', () => {
  const roll = rng(3303);
  const ts = moments(roll);
  let n = 0;
  const seen = new Set<string>();
  const vine = (sleep: number, stir: number, look: number, offset: number, awake?: boolean): ThornVine => ({ x: 0, top: 0, bud: 100, reach: 120, sleep, stir, look, offset, awake });
  const vs: ThornVine[] = [vine(3, 1.2, 1.6, 0), vine(2.4, 1, 1.4, 1.7), vine(0, 0, 1, 0, true), vine(0, 0, 2.5, 0.3, true)];
  for (let i = 0; i < 400; i++) vs.push(vine(len(roll, 0.8, 5), len(roll, 0.4, 2), len(roll, 0.4, 3), len(roll, 0, 9)));
  for (const v of vs) for (const t of ts) {
    const now = vinePhase(v, t);
    seen.add(now.phase);
    n += same(now, oldVinePhase(v, t), () => `${JSON.stringify(v)} at ${t}`);
  }
  assert.deepEqual([...seen].sort(), ['look', 'sleep', 'stir']);
  assert.ok(n > 2_000_000, `${n} reads compared`);
});

// ───────────── the second round: nests, teapots, orchids, surging falls, Dot's gusts, river logs, lifts ─────────────
import { NEST, nestAt, type Nest, type NestPhase } from './eaglet.ts';
import { ORCHID, orchidAt, potAt, type Orchid, type OrchidPhase, type PotPhase, type Teapot } from './w5Kit.ts';
import { surgeFlow, type Waterfall } from './waterfalls.ts';
import { GUST_WARN, gustState, type Gust } from './dotFlightStage.ts';
import { driftCycle, driftProgress, driftX, type DriftInfo } from './river.ts';
import { liftCycle, liftY, type LiftInfo } from './lift.ts';

// ── frozen as of 347d50fa: eaglet.ts nestAt, w5Kit.ts potAt and orchidAt, waterfalls.ts surgeFlow, dotFlightStage.ts gustState,
//    river.ts driftX and driftProgress, lift.ts liftY ──
function oldNestAt(n: Nest, t: number): { phase: NestPhase; u: number } {
  const c = (((t + n.offset) % n.every) + n.every) % n.every;
  const sleep = n.every - NEST.stir - NEST.look;
  if (c < sleep) return { phase: 'sleep', u: c / sleep };
  if (c < sleep + NEST.stir) return { phase: 'stir', u: (c - sleep) / NEST.stir };
  return { phase: 'look', u: (c - sleep - NEST.stir) / NEST.look };
}
function oldPotAt(p: Teapot, t: number): { phase: PotPhase; u: number } {
  const cyc = p.idle + p.warn + p.puff;
  const s = (((t + p.offset) % cyc) + cyc) % cyc;
  if (s < p.idle) return { phase: 'idle', u: s / p.idle };
  if (s < p.idle + p.warn) return { phase: 'warn', u: (s - p.idle) / p.warn };
  return { phase: 'puff', u: (s - p.idle - p.warn) / p.puff };
}
function oldOrchidAt(o: Orchid, t: number): { phase: OrchidPhase; open: number; solid: boolean; picks: boolean } {
  const s = (((t + o.offset) % o.period) + o.period) % o.period;
  const tell = ORCHID.tell;
  if (s < o.open) return { phase: 'open', open: 1, solid: true, picks: true };
  if (s < o.open + tell) {
    const u = (s - o.open) / tell;
    return { phase: 'closing', open: 1 - 0.55 * u, solid: true, picks: true };
  }
  if (s < o.period - tell) return { phase: 'shut', open: 0, solid: false, picks: false };
  const u = (s - (o.period - tell)) / tell;
  return { phase: 'opening', open: u, solid: false, picks: false };
}
type Surge = NonNullable<Waterfall['surge']>;
function oldSurgeFlow(s: Surge, t: number): number {
  const T = s.pour + s.ease + s.quiet;
  const c = (((t + s.offset) % T) + T) % T;
  if (c < s.pour) return Math.min(1, c / 0.4);
  if (c < s.pour + s.ease) return 1 - (c - s.pour) / s.ease;
  return 0;
}
function oldGustState(g: Gust, t: number): { blowing: boolean; warn: number } {
  const c = (((t + g.phase) % g.period) + g.period) % g.period;
  if (c < g.on) return { blowing: true, warn: 1 };
  const until = g.period - c;
  return { blowing: false, warn: until < GUST_WARN ? 1 - until / GUST_WARN : 0 };
}
function oldDriftX(d: DriftInfo, t: number): number {
  const T = driftCycle(d);
  const u = (((t + d.offset) % T) + T) % T;
  const travelled = u * d.speed;
  return d.dir === 1 ? d.x0 - d.width + travelled : d.x1 - travelled;
}
function oldDriftProgress(d: DriftInfo, t: number): number {
  const T = driftCycle(d);
  return ((((t + d.offset) % T) + T) % T) / T;
}
function oldLiftY(l: LiftInfo, t: number): number {
  const ride = (l.bottom - l.top) / l.speed;
  const T = liftCycle(l);
  const u = (((t + l.phase) % T) + T) % T;
  const ease = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, k)));
  if (u < l.wait) return l.bottom;
  if (u < l.wait + ride) return l.bottom - (l.bottom - l.top) * ease((u - l.wait) / ride);
  if (u < 2 * l.wait + ride) return l.top;
  return l.top + (l.bottom - l.top) * ease((u - 2 * l.wait - ride) / ride);
}

test('eagle nests, teapots and orchids on the clock: each does exactly what it did', () => {
  const roll = rng(5404);
  const ts = moments(roll);
  let n = 0;
  const seen = new Set<string>();
  for (let i = 0; i < 150; i++) {
    const nest = { x: 0, y: 0, x0: -200, x1: 200, every: i ? len(roll, 4, 9) : 6, offset: i ? len(roll, 0, 9) : 0 } as Nest;
    const pot = { x: 0, y: 0, dir: 1, idle: len(roll, 1, 4), warn: len(roll, 0.4, 1.6), puff: len(roll, 0.4, 2), offset: len(roll, 0, 7) } as Teapot;
    const period = i % 3 ? 6 : len(roll, 4.5, 8);
    const orchid = { x: 0, y: 0, w: 120, period, open: Math.min(period - 2 * ORCHID.tell - 0.6, len(roll, ORCHID.minOpen, 4.2)), offset: len(roll, 0, 7) } as Orchid;
    for (const t of ts) {
      const a = nestAt(nest, t);
      const b = potAt(pot, t);
      const c = orchidAt(orchid, t);
      seen.add('nest ' + a.phase).add('pot ' + b.phase).add('orchid ' + c.phase);
      n += same(a, oldNestAt(nest, t), () => `${JSON.stringify(nest)} at ${t}`);
      n += same(b, oldPotAt(pot, t), () => `${JSON.stringify(pot)} at ${t}`);
      n += same(c, oldOrchidAt(orchid, t), () => `${JSON.stringify(orchid)} at ${t}`);
    }
  }
  assert.equal(seen.size, 3 + 3 + 4, [...seen].join());
  assert.ok(n > 2_000_000, `${n} reads compared`);
});

test('surging falls, Dot\'s gusts, river logs and lifts on the clock: each does exactly what it did', () => {
  const roll = rng(7505);
  const ts = moments(roll);
  let n = 0;
  const is = (now: number, old: number, what: () => string) => { if (!Object.is(now, old)) assert.fail(`${now} is not the old ${old} (${what()})`); n++; };
  for (let i = 0; i < 120; i++) {
    const surge: Surge = { pour: len(roll, 1, 4), ease: len(roll, 0.5, 1.5), quiet: len(roll, 1, 4), offset: len(roll, 0, 8) };
    const gust = { id: 1, x0: 0, x1: 100, y0: 0, y1: 100, wx: 0, wy: 0, period: len(roll, 2.5, 6), on: len(roll, 0.6, 2), phase: len(roll, 0, 6) } as Gust;
    const dir: 1 | -1 = i % 2 ? 1 : -1;
    const log = { x0: 100, x1: 100 + Math.round(300 + roll() * 900), dir, speed: Math.round(30 + roll() * 90), width: 96 + (i % 3) * 24, offset: len(roll, 0, 20), baseY: 0 } as DriftInfo;
    const lift = { x: 0, top: 100, bottom: 100 + Math.round(120 + roll() * 500), speed: Math.round(60 + roll() * 120), wait: len(roll, 0.8, 2.5), phase: len(roll, 0, 9) } as LiftInfo;
    for (const t of ts) {
      is(surgeFlow(surge, t), oldSurgeFlow(surge, t), () => `${JSON.stringify(surge)} at ${t}`);
      same(gustState(gust, t), oldGustState(gust, t), () => `${JSON.stringify(gust)} at ${t}`);
      is(driftX(log, t), oldDriftX(log, t), () => `${JSON.stringify(log)} at ${t}`);
      is(driftProgress(log, t), oldDriftProgress(log, t), () => `${JSON.stringify(log)} at ${t}`);
      is(liftY(lift, t), oldLiftY(lift, t), () => `${JSON.stringify(lift)} at ${t}`);
    }
  }
  assert.ok(n > 2_000_000, `${n} reads compared`);
});
