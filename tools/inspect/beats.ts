/**
 * Active beats along the main route: things the player must do or time. Movement beats come from the route's own moves (route.ts);
 * everything else (animals, timed hazards, puzzles and interactive pieces) is placed on the route where the route first comes close
 * to it. A beat can carry a duration (a fight, freeing a cage, waiting out a gust), which pushes the rest of the stage later.
 */
import { surfaceOf, jumpEdges } from '../../src/game/stageMetrics.ts';
import { MODEL_FAST, TIME } from '../../src/game/stageTime.ts';
import { idleTime } from '../../src/game/zones.ts';
import { WATCH } from '../../src/game/watcher.ts';
import { DOT_HELP } from '../../src/game/w4Kit.ts';
import { CHAIR, COCOON } from '../../src/game/w5Kit.ts';
import { FALLS } from '../../src/game/waterfalls.ts';
import { VINE } from '../../src/game/thornVine.ts';
import { skillHeldAt } from '../../src/game/skills.ts';
import { RUN, type Route, type Seg } from './route.ts';
import type { Stage } from './stages.ts';

export type Letter = 'W' | 'h' | 'J' | 'V' | 'C' | 'Z' | 'P';
export const WEIGHT: Record<Letter, number> = { W: 0.2, h: 0.5, J: 1, V: 2, C: 2.2, Z: 2, P: 2.8 };

export interface Beat {
  /** seconds from the start, on the clock with every earlier wait and fight added */
  t: number;
  /** seconds of movement alone before it (the route's own clock) */
  base: number;
  dur: number;
  /** seconds the move itself keeps him busy (a glide, a swing, a rope, the first part of a climb): no dead time while it lasts */
  act: number;
  x: number;
  y: number;
  letter: Letter;
  /** 1, or 0.5 for a half beat (a pickup arc over a gap off the route) */
  count: number;
  what: string;
}

export interface Sample { x: number; y: number; base: number; seg: Seg }

/** the route as points about every 24 px, on the movement clock */
export function sampleRoute(route: Route): Sample[] {
  const out: Sample[] = [];
  let t = 0;
  for (const s of route.segs) {
    const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
    const n = Math.max(1, Math.ceil(len / 24));
    for (let i = 0; i < n; i++) {
      const u = i / n;
      out.push({ x: s.x0 + (s.x1 - s.x0) * u, y: s.y0 + (s.y1 - s.y0) * u, base: t + s.dt * u, seg: s });
    }
    t += s.dt;
  }
  const last = route.segs[route.segs.length - 1];
  if (last) out.push({ x: last.x1, y: last.y1, base: t, seg: last });
  return out;
}

interface Box { x0: number; x1: number; y0: number; y1: number }
const inBox = (s: Sample, b: Box) => s.x >= b.x0 && s.x <= b.x1 && s.y >= b.y0 && s.y <= b.y1;

/** the first time the route comes into a box (index into samples), or -1 */
function firstIn(samples: Sample[], b: Box): number {
  for (let i = 0; i < samples.length; i++) if (inBox(samples[i], b)) return i;
  return -1;
}
/** each stretch the route spends inside a box: [enter, leave] sample indexes */
function spansIn(samples: Sample[], b: Box): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let a = -1;
  for (let i = 0; i < samples.length; i++) {
    const inside = inBox(samples[i], b);
    if (inside && a < 0) a = i;
    if (!inside && a >= 0) { out.push([a, i - 1]); a = -1; }
  }
  if (a >= 0) out.push([a, samples.length - 1]);
  return out;
}

export interface BeatResult {
  beats: Beat[];
  /** seconds to the shrine on the beat clock (movement plus every fight and wait) */
  total: number;
  /** seconds of movement alone */
  moveTotal: number;
  /** interactive things the stage holds that the main route never comes near (counted, not beats) */
  offRoute: Record<string, number>;
}

export function findBeats(stage: Stage, route: Route, samples: Sample[]): BeatResult {
  const raw: Array<Omit<Beat, 't'>> = [];
  const offRoute: Record<string, number> = {};
  const off = (k: string) => (offRoute[k] = (offRoute[k] ?? 0) + 1);
  const add = (i: number, letter: Letter, what: string, dur = 0, count = 1) => {
    const s = samples[i];
    raw.push({ base: s.base, dur, act: 0, x: s.x, y: s.y, letter, count, what });
  };
  const cfg = stage.config;
  const mission = (cfg.worldIndex - 1) * 10 + cfg.miniIndex;
  const glideHeld = skillHeldAt('glide', mission);

  // ---- moves ----
  let t = 0;
  let prevFragile = false;
  for (let si = 0; si < route.segs.length; si++) {
    const s = route.segs[si];
    // a move keeps him busy while it lasts; a climb only for its first 2.5 s (a long plain climb past that is quiet)
    const busy = s.kind === 'climb' ? Math.min(2.5, s.dt + (route.segs[si + 1]?.kind === 'climb' ? route.segs[si + 1].dt : 0)) : s.kind === 'lift' ? 0.5 : s.dt;
    const at = { base: t, dur: 0, act: busy, x: s.x0, y: s.y0, count: 1 };
    switch (s.kind) {
      case 'hop': raw.push({ ...at, letter: 'h', what: s.y1 < s.y0 - 16 ? 'hop up a step' : 'small hop' }); break;
      case 'jump': raw.push({ ...at, letter: 'J', what: s.y1 < s.y0 - 100 ? 'big jump up' : 'jump over a gap' }); break;
      case 'bounce': raw.push({ ...at, letter: 'J', what: 'mushroom bounce' }); break;
      case 'timedHop': raw.push({ ...at, letter: 'J', what: 'hop onto a moving log or platform' }); break;
      case 'glide': raw.push({ ...at, letter: 'J', what: glideHeld ? 'leaf glide' : 'long jump' }); break;
      case 'presumed': raw.push({ ...at, letter: 'J', what: 'jump the level check cannot confirm (probably a puzzle piece)' }); break;
      case 'climb': if (s.note === 'grab') raw.push({ ...at, letter: 'V', what: 'grab a trunk or vine and climb' }); break;
      case 'swing': raw.push({ ...at, letter: 'V', what: s.note === 'added' && !s.from ? 'swing on to the next liana' : 'swing on a liana' }); break;
      case 'rope': raw.push({ ...at, letter: 'V', what: 'shimmy along a rope' }); break;
      case 'lift': raw.push({ ...at, letter: 'V', what: 'ride the basket lift' }); break;
      case 'draft': raw.push({ ...at, letter: 'V', what: 'ride the warm air' }); break;
      default: break;
    }
    t += s.dt;
    const fragile = !!s.plat && s.plat.type === 'fragile' && s.kind !== 'walk';
    if (fragile && !prevFragile) raw.push({ base: t, dur: 0, act: 0, x: s.x1, y: s.y1, count: 1, letter: 'Z', what: 'crumbling branch' });
    if (s.kind !== 'walk') prevFragile = fragile;
  }
  const moveTotal = t;

  // ---- animals ----
  for (const e of stage.enemies) {
    let b: Box;
    if (e.type === 'eagle') b = { x0: e.x - 220, x1: e.x + 220, y0: e.y - 100, y1: e.y + 520 };
    else {
      const sf = surfaceOf(e);
      b = { x0: e.patrolMinX - 60, x1: e.patrolMaxX + 60, y0: sf - 130, y1: sf + 60 };
    }
    const i = firstIn(samples, b);
    if (i < 0) { off('animals'); continue; }
    add(i, 'C', e.type === 'eagle' ? 'eagle swoops' : `${e.type === 'turtle' ? 'snapper' : e.type}${e.asleep ? ' (asleep)' : ''}`, e.type === 'eagle' ? MODEL_FAST.fightFlier : MODEL_FAST.fightGround);
  }
  const ring = stage.proto?.ring;
  if (ring) {
    const i = firstIn(samples, { x0: ring.x0, x1: ring.x1, y0: -1e9, y1: 1e9 });
    if (i >= 0) ring.waves.forEach((w, k) => w.forEach((m) => add(i, 'C', `ring wave ${k + 1}: ${m.kind}`, MODEL_FAST.fightGround)));
  }
  for (const m of stage.proto?.w4?.monkeys ?? []) {
    if (m.job === 'guard') {
      const i = firstIn(samples, { x0: (m.x0 ?? m.x) - 60, x1: (m.x1 ?? m.x) + 60, y0: m.y - 160, y1: m.y + 60 });
      if (i < 0) off('capuchin guards'); else add(i, 'C', 'capuchin guard', MODEL_FAST.fightGround);
    } else if (m.job === 'lookout') {
      const i = firstIn(samples, { x0: m.x0 ?? m.x - 300, x1: m.x1 ?? m.x + 300, y0: -1e9, y1: 1e9 });
      if (i < 0) off('capuchin lookouts'); else add(i, 'Z', 'capuchin lookout watching', 1.0);
    } else {
      const pts = [{ x: m.x, y: m.y }, ...(m.path ?? [])];
      let best = -1;
      for (const p of pts) {
        const i = firstIn(samples, { x0: p.x - 150, x1: p.x + 150, y0: p.y - 200, y1: p.y + 80 });
        if (i >= 0 && (best < 0 || i < best)) best = i;
      }
      if (best < 0) off('capuchin thieves'); else add(best, 'P', 'capuchin thief', 1.5);
    }
  }
  for (const s of stage.proto?.w5?.seamstresses ?? []) {
    const i = firstIn(samples, { x0: s.x - 250, x1: s.x + 250, y0: s.y - 200, y1: s.y + 80 });
    if (i < 0) off('seamstress'); else add(i, 'C', 'the Seamstress (slip past)', 1.0);
  }

  // ---- goal pieces and puzzles ----
  for (const c of stage.collectibles) {
    if (c.type === 'cage') {
      const i = firstIn(samples, { x0: c.x - 120, x1: c.x + 120, y0: c.y - 120, y1: c.y + 350 });
      if (i < 0) off('cages'); else add(i, 'P', c.critter === 'eaglet' ? 'free a chick from its nest' : 'free a caged animal', TIME.cageSec + Math.abs(samples[i].y - c.y - 40) / 300);
    } else if (c.type === 'relic') {
      const i = firstIn(samples, { x0: c.x - 120, x1: c.x + 120, y0: c.y - 120, y1: c.y + 350 });
      if (i < 0) off('relics'); else add(i, 'P', 'search a fern for a keepsake', TIME.relicSec + Math.abs(samples[i].y - c.y - 40) / 300);
    }
  }
  for (const c of stage.proto?.w5?.cocoons ?? []) {
    const i = firstIn(samples, { x0: c.x - 120, x1: c.x + 120, y0: c.y - 120, y1: c.y + 350 });
    if (i < 0) off('cocoons'); else add(i, 'P', 'punch a cocoon open', COCOON.hits * 0.6 + 0.6);
  }
  for (const p of stage.platforms) {
    if (!p.push) continue;
    const i = firstIn(samples, { x0: p.push.min - 60, x1: p.push.max + 60, y0: p.y - 260, y1: p.y + p.height + 40 });
    if (i < 0) off('push logs and boulders'); else add(i, 'P', p.art === 'boulder' ? 'push the boulder' : 'push the hollow log', 2.0);
  }
  const w4 = stage.proto?.w4;
  for (const s of w4?.patience ?? []) {
    const i = firstIn(samples, { x0: s.x0 - 30, x1: s.x1 + 30, y0: s.y - 80, y1: s.y + 80 });
    if (i < 0) off('patience spots'); else add(i, 'P', s.kind === 'frond' ? 'stand still: the fern unrolls' : 'stand still: the mist settles', s.fill);
  }
  for (const k of w4?.knots ?? []) {
    const i = firstIn(samples, { x0: k.x0 - 40, x1: k.x1 + 40, y0: k.ground - 80, y1: k.ground + 80 });
    if (i < 0) off("Dot's knots"); else add(i, 'P', "wait under Dot's knot", DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick);
  }
  for (const f of w4?.fruit ?? []) {
    const i = firstIn(samples, { x0: f.x - 90, x1: f.x + 90, y0: f.ground - 120, y1: f.ground + 60 });
    if (i < 0) off('fruit trees'); else add(i, 'P', 'knock down fruit (optional)', 0.6);
  }
  for (const p of w4?.pools ?? []) {
    const plat = stage.platforms.find((q) => q.id === p.platformId);
    if (!plat) continue;
    const i = firstIn(samples, { x0: plat.x - 80, x1: plat.x + plat.width + 80, y0: Math.min(p.fullY, p.emptyY) - 150, y1: Math.max(p.fullY, p.emptyY) + 60 });
    if (i < 0) off('pools'); else add(i, 'P', 'ride the pool log', FALLS.drain);
  }
  for (const w of w4?.falls ?? []) {
    if (w.veil || w.plug || !w.surge) continue;
    const i = firstIn(samples, { x0: w.x - 40, x1: w.x + w.width + 40, y0: w.top - 40, y1: w.bottom + 60 });
    if (i < 0) off('surging falls'); else add(i, 'Z', 'surging waterfall: wait for it to ease', w.surge.pour / 2);
  }
  for (const r of w4?.rocks ?? []) {
    const i = firstIn(samples, { x0: r.x - 70, x1: r.x + 70, y0: r.land - 160, y1: r.land + 40 });
    if (i < 0) off('falling rocks'); else add(i, 'Z', 'falling rock: read the shadow', 0.8);
  }
  for (const n of w4?.nests ?? []) {
    const i = firstIn(samples, { x0: n.x0 - 20, x1: n.x1 + 20, y0: n.y - 100, y1: n.y + 40 });
    if (i < 0) off('eaglet nests'); else add(i, 'Z', 'sneak past the eaglets', 1.0);
  }
  for (const v of stage.proto?.thorns ?? []) {
    const i = firstIn(samples, { x0: v.x - v.reach, x1: v.x + v.reach, y0: v.top, y1: v.bud + (v.below ?? VINE.below) });
    if (i < 0) off('thorn vines'); else add(i, 'Z', 'sleeping thorn vine', 1.0);
  }
  const w5 = stage.proto?.w5;
  for (const c of w5?.chairs ?? []) {
    const i = firstIn(samples, { x0: c.x - CHAIR.reach, x1: c.x + CHAIR.reach, y0: c.y - 90, y1: c.y + 40 });
    if (i < 0) off('chairs'); else add(i, 'P', 'soft chair pulls (keep moving)');
  }
  for (const c of w5?.cakes ?? []) {
    const i = firstIn(samples, { x0: c.x - 50, x1: c.x + 50, y0: c.y - 100, y1: c.y + 50 });
    if (i < 0) off('cakes'); else add(i, 'P', 'jump the cake');
  }
  for (const b of w5?.butlers ?? []) {
    const i = firstIn(samples, { x0: b.x - 220, x1: b.x + 220, y0: b.y - 160, y1: b.y + 60 });
    if (i < 0) off('butlers'); else add(i, 'P', 'butler with a tray', 0.8);
  }
  for (const p of w5?.pots ?? []) {
    const i = firstIn(samples, { x0: p.x - 130, x1: p.x + 130, y0: p.y - 160, y1: p.y + 60 });
    if (i < 0) off('teapots'); else add(i, 'Z', 'teapot steam: go between puffs', 1.0);
  }
  for (const th of w5?.threads ?? []) {
    const i = firstIn(samples, { x0: th.x0 - 20, x1: th.x1 + 20, y0: th.y - 110, y1: th.y + 60 });
    if (i < 0) off('humming threads'); else add(i, 'Z', 'humming thread: jump it');
  }
  for (const o of w5?.orchids ?? []) {
    const i = firstIn(samples, { x0: o.x - o.w / 2 - 40, x1: o.x + o.w / 2 + 40, y0: o.y - 160, y1: o.y + 60 });
    if (i < 0) off('orchids'); else add(i, 'P', 'closing orchid: time the jump', 0.6);
  }

  // ---- stretches under timed pressure: a beat on entry and one each cycle while inside ----
  const span = (b: Box, every: number, letter: Letter, what: string, dur: number, label: string) => {
    const spans = spansIn(samples, b);
    if (!spans.length) { off(label); return; }
    for (const [a, z] of spans) {
      add(a, letter, what, dur);
      const t0 = samples[a].base;
      let next = t0 + every;
      for (let i = a + 1; i <= z; i++) if (samples[i].base >= next) { add(i, letter, `${what} (again)`, dur); next += every; }
    }
  };
  for (const z of stage.zones ?? []) {
    const b = { x0: z.x0, x1: z.x1, y0: z.top - 30, y1: z.bottom + 30 };
    if (z.kind === 'dark') span(b, 1e9, 'Z', 'darkness: wake the glowworms, find the way', 0.8, 'dark zones');
    else if (z.kind === 'web') span(b, 1e9, 'Z', 'sticky web slows him', (z.x1 - z.x0) * (1 / (RUN * TIME.webSpeed) - 1 / RUN), 'webs');
    else if (z.kind === 'crumble') span(b, 1e9, 'Z', 'crumbling floor', 0, 'crumbling floors');
    else {
      const every = Math.max(2, z.period);
      const wait = Math.min(TIME.zoneExtra[z.kind] ?? 0.7, idleTime(z));
      span(b, every, 'Z', z.kind === 'wind' ? 'wind gust' : z.kind === 'spore' ? 'spore cloud' : `${z.kind} zone`, wait, `${z.kind} zones`);
    }
  }
  for (const w of stage.proto?.watch ?? []) {
    const cycle = (w.calm[0] + w.calm[1]) / 2 + WATCH.warn + WATCH.pass;
    span({ x0: w.x0, x1: w.x1, y0: -1e9, y1: 1e9 }, cycle, 'Z', 'eagle sweep: duck into a bush', 1.5, 'watched stretches');
  }
  for (const r of stage.rivers ?? []) {
    span({ x0: r.x0, x1: r.x1, y0: -1e9, y1: 1e9 }, 1e9, 'Z', 'river crossing: read the logs', 1.0, 'rivers');
  }
  for (const s of w5?.sheets ?? []) span({ x0: s.x0, x1: s.x1, y0: s.top - 20, y1: s.bottom + 20 }, 1e9, 'Z', 'silk sheet: do not stop', 0, 'silk sheets');
  const chase = stage.proto?.chase;
  if (chase) span({ x0: chase.start, x1: chase.end, y0: -1e9, y1: 1e9 }, 1.5, 'Z', 'the branch collapses behind him: keep running', 0, 'chase');

  // ---- half beats: a pickup arc over a gap that the route does not jump ----
  const pickups = stage.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
  const routeJumps = raw.filter((b) => b.letter === 'J' || b.letter === 'h');
  for (const j of jumpEdges(stage)) {
    if (j.gap < 40) continue;
    const lo = Math.min(j.from.y, j.to.y) - 260, hi = Math.max(j.from.y, j.to.y);
    const n = pickups.filter((c) => c.x > j.takeoffX && c.x < j.landX && c.y > lo && c.y < hi).length;
    if (n < 2) continue;
    if (routeJumps.some((b) => Math.abs(b.x - j.takeoffX) < 160 && Math.abs(b.y - j.from.y) < 200)) continue;
    const i = firstIn(samples, { x0: j.takeoffX - 40, x1: j.landX + 40, y0: lo - 120, y1: hi + 320 });
    if (i >= 0) add(i, 'h', 'pickup arc over a gap (optional jump)', 0, 0.5);
  }

  // ---- the clock: every wait and fight pushes what comes after it later ----
  raw.sort((a, b) => a.base - b.base);
  let delay = 0;
  const beats: Beat[] = raw.map((b) => {
    const out = { ...b, t: b.base + delay };
    delay += b.dur;
    return out;
  });
  return { beats, total: moveTotal + delay, moveTotal, offRoute };
}
