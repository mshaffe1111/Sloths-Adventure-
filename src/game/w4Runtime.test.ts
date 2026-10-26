/**
 * World 4's pieces in the real engine (realPlay.ts): each module's own comments say what it does (rockfall, patience, waterfalls,
 * w4Kit, capuchin, eaglet, w4Nests, w4Play), and these check the running game does it, on the stages themselves (layout roll 1).
 * Also: Dot's hints show up before each new thing is met, and the flags keep him where they should.
 */
import { RealPlay, DT } from './realPlay.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { rockAt } from './rockfall.ts';
import { FALLS, surgeFlow } from './waterfalls.ts';
import { DOT_HELP } from './w4Kit.ts';
import { CAP } from './capuchin.ts';
import { NEST } from './eaglet.ts';
import { NEST_WIND } from './w4Nests.ts';
import { PATIENCE } from './patience.ts';
import { zoneState } from './zones.ts';
import type { Platform } from './types.ts';
import type { ProtoExtras } from './protoStage.ts';

type W4 = Record<string, any>;
const w4Of = (sim: RealPlay): W4 => sim.w4!.w4;
/** the platform whose top is at y under x */
const floorAt = (sim: RealPlay, x: number, y: number, reach = 8): Platform | undefined =>
  sim.platforms.find((q) => !q.broken && x >= q.x - 8 && x <= q.x + q.width + 8 && Math.abs(q.y - y) <= reach);
/** the next moment after t when a rhythm (period `z.period`, phase at time t: `sz`) starts `phase` */
const nextPhase = (z: { period: number }, t: number, phase: string, sz: (t: number) => string) => {
  let prev = sz(t);
  for (let k = 1; k < z.period * 60 + 60; k++) {
    const u = t + k / 60;
    const cur = sz(u);
    if (cur === phase && prev !== phase) return u;
    prev = cur;
  }
  throw new Error(`no ${phase} after ${t}`);
};

test('rocks (4-1): standing where one lands, the falling rock hurts him once a fall; a step aside, never', () => {
  for (const aside of [false, true]) {
    const sim = new RealPlay('4-1', 1);
    sim.safe = false;
    const r = w4Of(sim).rocks[0];
    const ledge = floorAt(sim, r.x, r.land)!;
    assert.ok(ledge, 'the rock lands on a ledge');
    const x = aside ? (r.x + 120 <= ledge.x + ledge.width ? r.x + 120 : r.x - 120) : r.x;
    // just before its warning starts
    sim.t = nextPhase({ period: r.every }, 0, 'warn', (t) => rockAt(r, t).phase) - 0.1;
    sim.stand(x, ledge.y);
    const hp = sim.p.hp;
    sim.wait(r.every * 0.98);
    assert.equal(hp - sim.p.hp, aside ? 0 : 1, aside ? 'beside the rock' : 'under the rock');
  }
});

test('the frond (4-1): standing still on its spot unrolls the bridge; leaving half way just stops it, and the rest finishes it', () => {
  const sim = new RealPlay('4-1', 1);
  const s = w4Of(sim).patience.find((q: { kind: string }) => q.kind === 'frond');
  const bridge = sim.platforms.find((q) => q.id === s.platformId)!;
  const spot = floorAt(sim, (s.x0 + s.x1) / 2, s.y, PATIENCE.reach)!;
  const mid = (s.x0 + s.x1) / 2;
  assert.ok(bridge.broken, 'the bridge is not there to begin with');
  sim.stand(mid, spot.y);
  sim.wait(PATIENCE.settle + s.fill / 2);
  assert.ok(bridge.broken, 'half way: not yet');
  for (let f = 0; f < 15; f++) sim.frame({ left: s.dir === 1, right: s.dir !== 1 });
  sim.stand(mid, spot.y);
  sim.wait(PATIENCE.settle + s.fill / 2 + 0.3);
  assert.ok(!bridge.broken, 'the rest of the wait unrolled it');
  // and he can walk out onto it
  for (let f = 0; f < 40 && sim.standingOn !== bridge.id; f++) sim.frame(s.dir === 1 ? { right: true } : { left: true });
  assert.equal(sim.standingOn, bridge.id);
});

test('a plugged fall (4-3): sliding the boulder into its channel dries the fall, and its pool drains so the log sinks', () => {
  const sim = new RealPlay('4-3', 1);
  const w4 = w4Of(sim);
  const pool = w4.pools[0];
  const fi = w4.falls.findIndex((w: { id: number }) => w.id === pool.fedBy);
  const fall = w4.falls[fi];
  const boulder = sim.platforms.find((q) => q.id === fall.plug.platformId)!;
  const log = sim.platforms.find((q) => q.id === pool.platformId)!;
  sim.wait(0.5);
  assert.ok(sim.w4!.flow[fi] > 0.9 && Math.abs(log.y - pool.fullY) < 1, 'pouring, the log high');
  const dir = fall.plug.atX > boulder.x ? 1 : -1;
  sim.stand(dir > 0 ? boulder.x - 40 : boulder.x + boulder.width + 40, boulder.y + boulder.height);
  for (let f = 0; f < 600 && (dir > 0 ? boulder.x < fall.plug.atX - 2 : boulder.x > fall.plug.atX + 2); f++) sim.frame(dir > 0 ? { right: true } : { left: true });
  assert.ok(dir > 0 ? boulder.x >= fall.plug.atX - 2 : boulder.x <= fall.plug.atX + 2, 'the boulder reached its slot');
  sim.wait(FALLS.dry + 0.2);
  assert.ok(sim.w4!.flow[fi] <= FALLS.trickle, `the fall dried (${sim.w4!.flow[fi]})`);
  sim.wait(FALLS.drain + 0.2);
  assert.ok(Math.abs(log.y - pool.emptyY) < 1, `the log sank (${log.y})`);
});

test('pouring water (4-3): it pushes him down in the air and folds the leaf; out of it, the leaf opens', () => {
  const sim = new RealPlay('4-3', 1);
  const w4 = w4Of(sim);
  const fi = w4.falls.findIndex((w: { veil?: boolean; surge?: unknown }) => !w.veil && !w.surge);
  const w = w4.falls[fi];
  // a spot in the open air at height y over x (nothing to land on in the next 120 px)
  const air = (x: number) => {
    for (let y = w.top + 80; y < w.bottom - 40; y += 10) if (!sim.platforms.some((q) => x > q.x - 30 && x < q.x + q.width + 30 && q.y > y - 70 && q.y < y + 120)) return y;
    throw new Error(`no open air at ${x}`);
  };
  const fallFor = (x: number) => {
    sim.fly(x, air(x), 0, 60);
    sim.frame({ jump: true });
    const vy = sim.p.vy;
    let leaf = false;
    for (let f = 0; f < 5; f++) {
      sim.frame({ jump: true });
      leaf ||= sim.e.glide.on;
    }
    return { vy, leaf };
  };
  const inside = fallFor(w.x + w.width / 2);
  const outside = fallFor(w.x - 160);
  assert.ok(inside.vy > outside.vy + FALLS.push * DT * 0.9, `pushed down: ${Math.round(inside.vy)} against ${Math.round(outside.vy)}`);
  assert.ok(!inside.leaf && outside.leaf, 'the leaf folds in the water and opens out of it');
});

test('a surging fall (4-3) pours and goes quiet on its own beat, in the running game', () => {
  const sim = new RealPlay('4-3', 1);
  const w4 = w4Of(sim);
  const fi = w4.falls.findIndex((w: { surge?: unknown; plug?: unknown }) => w.surge && !w.plug);
  const w = w4.falls[fi];
  let quiet = 0, pour = 0;
  for (let f = 0; f < 30 * 20; f++) {
    sim.frame();
    assert.ok(Math.abs(sim.w4!.flow[fi] - surgeFlow(w.surge, sim.t - DT)) < 0.05 || Math.abs(sim.w4!.flow[fi] - surgeFlow(w.surge, sim.t)) < 0.05);
    if (sim.w4!.flow[fi] <= FALLS.trickle) quiet++;
    else pour++;
  }
  assert.ok(quiet > 30 && pour > 30, `both: quiet ${quiet}, pouring ${pour} frames`);
});

test('Dot\'s knot (4-4): standing still under it, she flies up and picks it, and the vine drops; passing by does not', () => {
  const sim = new RealPlay('4-4', 1);
  const k = w4Of(sim).knots[0];
  const v = sim.vines.find((q) => q.id === k.releases.id)!;
  const tied = v.bottomY;
  const ground = floorAt(sim, (k.x0 + k.x1) / 2, k.ground, DOT_HELP.reach)!;
  // walking straight through the spot
  sim.stand(k.x0 - 80, ground.y);
  for (let f = 0; f < 40; f++) sim.frame({ right: true });
  sim.wait(0.2);
  assert.equal(sim.w4!.knots[0].phase, 'tied', 'passing by');
  sim.stand((k.x0 + k.x1) / 2, ground.y);
  sim.wait(DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick + 1.2);
  assert.equal(sim.w4!.knots[0].phase, 'free');
  assert.ok(v.bottomY > tied + 100, `the vine came down (${tied} to ${v.bottomY})`);
  assert.ok(sim.said.some((s) => /tied up|knot/i.test(s.text)), 'Dot says so');
});

test('the thief (4-3): it takes the petal when he comes near, drops it when he catches it at a post, and then the petal is his', () => {
  const sim = new RealPlay('4-3', 1);
  const w4 = w4Of(sim);
  const i = w4.monkeys.findIndex((m: { job: string }) => m.job === 'thief');
  const m = w4.monkeys[i];
  const petal = sim.collectibles.find((c) => c.id === m.petalId)!;
  const s = () => sim.w4!.monkeys[i];
  const home = floorAt(sim, m.x, m.y, 30) ?? floorAt(sim, m.x - 100, m.y, 30)!;
  sim.stand(m.x - CAP.snatch + 30, home.y);
  sim.frame();
  assert.ok(petal.collected && s().carrying, 'it grabbed the petal');
  // to the post it runs to: wait there for it
  for (let f = 0; f < 300 && s().mode !== 'tease'; f++) sim.frame();
  assert.equal(s().mode, 'tease');
  const post = { x: s().x, y: s().y };
  const at = floorAt(sim, post.x - 20, post.y, 30)!;
  assert.ok(at, 'the post is on ground');
  const before = sim.p.fruitsCollected;
  sim.stand(post.x - 20, at.y);
  sim.frame();
  // (it drops the petal right at him, so he has it at once)
  assert.ok(!s().carrying && s().mode === 'dropped', 'caught: it dropped the petal');
  assert.ok(petal.collected && sim.p.fruitsCollected === before + 1, 'and the petal is his');
});

test('a lookout (4-5): seen in the open it stares, then screeches and calls her; behind a curtain of water it sees nothing', () => {
  const look = (hide: boolean) => {
    const sim = new RealPlay('4-5', 1);
    const w4 = w4Of(sim);
    const i = w4.monkeys.findIndex((m: { job: string }) => m.job === 'lookout');
    const m = w4.monkeys[i];
    const veil = w4.falls.find((w: { veil?: boolean; x: number; width: number }) => w.veil && w.x + w.width / 2 >= m.x0 && w.x + w.width / 2 <= m.x1);
    const x = hide ? veil.x + veil.width / 2 : m.x0 + 30;
    const fl = floorAt(sim, x, 580, 200)!;
    sim.stand(x, fl.y);
    sim.wait(CAP.stare + 0.5);
    return sim.w4!.monkeys[i];
  };
  assert.ok(look(false).cool > 0, 'out in the open: it screeched');
  const hidden = look(true);
  assert.ok(hidden.cool === 0 && hidden.mode === 'sit', 'behind the water: nothing');
});

test('a guard (4-8): on its feet it will not let him by; once a gust knocks it over he walks past', () => {
  const sim = new RealPlay('4-8', 1);
  const w4 = w4Of(sim);
  const i = w4.monkeys.findIndex((m: { job: string }) => m.job === 'guard');
  const m = w4.monkeys[i];
  const ledge = floorAt(sim, m.x, m.y)!;
  const zone = sim.stage.zones!.find((z) => z.kind === 'wind' && m.x >= z.x0 && m.x <= z.x1 && m.y >= z.top && m.y <= z.bottom)!;
  assert.ok(zone, 'a gust lane blows across the guard');
  const phase = (t: number) => zoneState(zone, t).phase;
  // calm: walk at it from the left
  sim.t = nextPhase(zone, 0, 'idle', phase);
  const from = Math.max(ledge.x + 12, m.x0 - 60);
  const walkPast = () => {
    sim.stand(from, ledge.y);
    for (let f = 0; f < 75; f++) sim.frame({ right: true });
    return sim.p.x > m.x1 + 30;
  };
  assert.ok(!walkPast(), 'blocked while it stands');
  // wait for the gust to knock it over (standing still), then go
  for (let f = 0; f < 30 * 12 && sim.w4!.monkeys[i].mode !== 'blown'; f++) sim.frame();
  assert.equal(sim.w4!.monkeys[i].mode, 'blown');
  sim.t = nextPhase(zone, sim.t, 'idle', phase);
  assert.ok(walkPast(), 'past it once it is down');
});

test('the eaglets (4-6): moving near the nest while they look blows him back; standing still, nothing happens', () => {
  const sim = new RealPlay('4-6', 1);
  const n = w4Of(sim).nests[0];
  const ledge = floorAt(sim, (n.x0 + n.x1) / 2, n.y)!;
  const lookAt = (t: number) => {
    const c = (((t + n.offset) % n.every) + n.every) % n.every;
    return c >= n.every - NEST.look;
  };
  sim.t = nextPhase({ period: n.every }, 0, 'look', (t) => (lookAt(t) ? 'look' : 'no')) + 0.1;
  const x = Math.max(n.x0 + 30, ledge.x + 30);
  sim.stand(x, ledge.y);
  sim.wait(0.6);
  assert.ok(Math.abs(sim.p.x - x) < 1, 'still: not moved');
  const t0 = sim.t;
  sim.stand(x, ledge.y);
  for (let f = 0; f < 12; f++) sim.frame({ right: true });
  const walked = sim.p.x - x;
  assert.ok(lookAt(t0) && walked < 285 * 12 * DT * 0.5, `blown back while they look (moved ${Math.round(walked)} px in 0.4 s)`);
});

test('warm air (4-7): the open leaf rises in it; without the leaf he falls; far below the last ledge he is lost in the mist', () => {
  const sim = new RealPlay('4-7', 1);
  const u = w4Of(sim).updrafts[0];
  const cx = (u.x0 + u.x1) / 2;
  sim.fly(cx, u.bottom - 80, 0, 80);
  const y0 = sim.p.y;
  for (let f = 0; f < 30; f++) sim.frame({ jump: true });
  assert.ok(sim.p.y < y0 - 60 && sim.e.glide.on, `the leaf rose ${Math.round(y0 - sim.p.y)} px`);
  sim.fly(cx, u.bottom - 80, 0, 80);
  for (let f = 0; f < 10; f++) sim.frame({});
  assert.ok(sim.p.y > y0, 'no leaf, no lift');
  // the mist
  // (straight on from standing on the first ledge, without the harness's fresh start: a fresh start forgets the last ledge)
  const ledge = sim.platforms[0];
  sim.stand(ledge.x + 30, ledge.y);
  sim.frame();
  Object.assign(sim.p, { y: ledge.y + w4Of(sim).deepFall - 40, vy: 300, grounded: false });
  sim.frame();
  assert.ok(!sim.died, 'not yet');
  Object.assign(sim.p, { y: ledge.y + w4Of(sim).deepFall + 40 });
  sim.frame();
  assert.ok(sim.died, 'a fall into the mist');
});

test('a freed chick (4-8): two blows tear the netting; once its parent arrives, its wings blow him along the stretch ahead', () => {
  const sim = new RealPlay('4-8', 1);
  const nest = w4Of(sim).cliffNests[0];
  const c = sim.collectibles.find((q) => q.id === nest.cageId)!;
  const ledge = sim.platforms.find((q) => q.id === nest.platformId)!;
  sim.stand(c.x - 36, ledge.y);
  for (let k = 0; k < 4 && !c.collected; k++) {
    sim.frame({ punch: true });
    for (let w = 0; w < 14; w++) sim.frame();
  }
  assert.ok(c.collected && c.freedAt !== undefined && sim.p.crittersRescued === 1, 'freed');
  const windAt = (t: number) => {
    sim.fly(c.x + 300, ledge.y - 120, 0, 0);
    sim.t = t;
    sim.frame();
    return sim.e.windV as number;
  };
  assert.equal(windAt(c.freedAt! + NEST_WIND.arrive * 0.5), 0, 'not before the parent arrives');
  assert.ok(windAt(c.freedAt! + NEST_WIND.arrive + 2) > NEST_WIND.force * 0.9, 'a tailwind once it beats its wings');
});

test('the chimes (4-2): they ring while the gust warns and Dot says what they mean; the gust then pushes him in the air', () => {
  localStorage.clear();
  const sim = new RealPlay('4-2', 1);
  const ch = w4Of(sim).chimes[0];
  const z = sim.stage.zones![ch.zone];
  const phase = (t: number) => zoneState(z, t).phase;
  sim.t = nextPhase(z, 0, 'warn', phase);
  const fl = floorAt(sim, ch.x, ch.y)!;
  sim.stand(ch.x, fl.y);
  sim.frame();
  assert.ok(sim.said.some((s) => /chimes/i.test(s.text)), 'Dot explains the chimes as they ring');
  const drift = (t: number) => {
    sim.t = t;
    sim.fly((z.x0 + z.x1) / 2, (z.top + z.bottom) / 2, 0, 0);
    sim.frame();
    return sim.p.x - (z.x0 + z.x1) / 2;
  };
  const gust = drift(nextPhase(z, 0, 'active', phase) + 0.6);
  const calm = drift(nextPhase(z, 0, 'idle', phase) + 0.2);
  assert.ok(Math.abs(calm) < 0.5 && Math.sign(gust) === z.dir && Math.abs(gust) > z.force * DT * 0.8, `gust ${gust}, calm ${calm}`);
});

/** where Pokey meets each kind of World 4 piece first, and the words of the hint that must come before it */
const PIECES: Array<{ what: string; words: RegExp; at: (w4: W4, st: RealPlay['stage']) => Array<{ x: number; y: number }> }> = [
  { what: 'rocks', words: /rock/i, at: (w) => (w.rocks ?? []).map((r: any) => ({ x: r.x, y: r.air ? r.top : r.land })) },
  { what: 'the frond', words: /fern/i, at: (w) => (w.patience ?? []).filter((s: any) => s.kind === 'frond').map((s: any) => ({ x: s.x0, y: s.y })) },
  { what: 'the mist', words: /mist/i, at: (w) => (w.patience ?? []).filter((s: any) => s.kind === 'mist').map((s: any) => ({ x: s.x0, y: s.y })) },
  { what: 'pouring water', words: /water|fall/i, at: (w) => (w.falls ?? []).map((f: any) => ({ x: f.x, y: f.bottom })) },
  { what: 'knots', words: /tied|knot/i, at: (w) => (w.knots ?? []).map((k: any) => ({ x: k.x0, y: k.ground })) },
  { what: 'monkeys', words: /monkey|lookout|guard|capuchin/i, at: (w) => (w.monkeys ?? []).map((m: any) => ({ x: m.job === 'lookout' ? m.x0 : m.x, y: m.y })) },
  { what: 'eaglets', words: /eaglet/i, at: (w) => (w.nests ?? []).map((n: any) => ({ x: n.x0, y: n.y })) },
  // (he glides into warm air from the side, at about the middle of its height)
  { what: 'warm air', words: /warm air/i, at: (w) => (w.updrafts ?? []).map((u: any) => ({ x: u.x0, y: (u.top + u.bottom) / 2 })) },
  { what: 'chimes', words: /chime|wind/i, at: (w) => (w.chimes ?? []).map((c: any) => ({ x: c.x, y: c.y })) },
  { what: 'netting', words: /netting|chick/i, at: (w) => (w.cliffNests ?? []).map((n: any) => ({ x: n.x, y: n.y + 26 })) },
];

test('Dot explains each World 4 piece before he first meets it, and every one of her hints really shows in the game', () => {
  for (const id of ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8']) {
    localStorage.clear();
    const sim = new RealPlay(id, 1);
    const st = sim.stage;
    const hints = (st as typeof st & { proto: ProtoExtras }).proto.hints;
    const w4 = w4Of(sim);
    // which way the stage goes: up a climb laid out from left to right is still met by x; a stage that winds down is met going down
    const climb = st.config.objectiveType === 'ascent' && Math.abs(st.exitTotemX - st.spawnX) < 3000;
    const descent = !!w4.descent;
    const along = (q: { x: number; y: number }) => (climb ? -q.y : descent ? q.y : q.x);
    // where he is when he comes to the piece (a climb's hint shows as he steps up onto its ledge)
    const before = (q: { x: number; y: number }) => (climb || descent ? q : { x: q.x - 40, y: q.y });
    const fires = (h: (typeof hints)[number], q: { x: number; y: number }) => q.x >= h.x && (h.aboveY === undefined || q.y <= h.aboveY) && (h.belowY === undefined || q.y >= h.belowY);
    for (const piece of PIECES) {
      const all = piece.at(w4, st);
      if (!all.length) continue;
      const first = all.reduce((a, b) => (along(b) < along(a) ? b : a));
      const ok = hints.some((h) => piece.words.test(h.text) && fires(h, before(first)));
      assert.ok(ok, `${id}: nothing says "${piece.words.source}" before the first of ${piece.what} at (${Math.round(first.x)}, ${Math.round(first.y)})`);
    }
    // each hint shows when he stands where it is meant to show (on a ledge in its trigger area), once
    for (const h of hints) {
      const spot = sim.platforms
        .filter((q) => !q.broken && q.x + q.width > h.x + 4 && (h.aboveY === undefined || q.y <= h.aboveY) && (h.belowY === undefined || q.y >= h.belowY))
        .sort((a, b) => Math.abs(a.y - st.spawnY) - Math.abs(b.y - st.spawnY))[0];
      assert.ok(spot, `${id}: nowhere to stand where "${h.text}" shows`);
      // (only this one is due: when several come due in one frame the game says just the furthest, engine.ts, so each is checked alone)
      const said = (q: (typeof hints)[number]) => sim.said.some((s) => s.text === q.text || s.text === q.pad || s.text === q.keys);
      for (const q of hints) q.shown = q === h ? said(q) : true;
      sim.stand(Math.max(h.x + 2, spot.x + 12), spot.y);
      sim.frame();
      // (it may have shown already, standing for an earlier one: each shows once)
      assert.ok(sim.said.some((s) => s.text === h.text || s.text === h.pad || s.text === h.keys), `${id}: "${h.text}" did not show`);
    }
  }
});

test('the flags (World 4): a flag further on replaces the last one, an earlier one never does, and each puts him back on his feet', () => {
  for (const id of ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8']) {
    const sim = new RealPlay(id, 1);
    const st = sim.stage;
    const cps = st.checkpoints ?? [];
    assert.ok(cps.length >= 2, `${id}: flags`);
    const further = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      st.config.objectiveType === 'ascent' ? a.y < b.y : w4Of(sim).descent ? a.y > b.y : a.x > b.x;
    const order = [...cps].sort((a, b) => (further(a, b) ? 1 : further(b, a) ? -1 : 0));
    const touch = (cp: { x: number; y: number; reached?: boolean }) => {
      cp.reached = false;
      sim.stand(cp.x, cp.y);
      sim.frame();
    };
    // the furthest, then an earlier one: the furthest stays
    touch(order[order.length - 1]);
    touch(order[0]);
    const kept = sim.e.checkpoint as { x: number; y: number };
    assert.ok(Math.abs(kept.x - order[order.length - 1].x) < 1 && Math.abs(kept.y - order[order.length - 1].y) < 1, `${id}: an earlier flag replaced a later one`);
    // back at each flag after a fall: he lands on his feet there, and stays
    for (const cp of cps) {
      sim.stand(cp.x, cp.y);
      sim.e.checkpoint = { x: cp.x, y: cp.y };
      sim.e.respawnAtCheckpoint('pit');
      sim.died = false;
      sim.wait(1.2);
      assert.ok(sim.p.grounded && !sim.died && Math.abs(sim.p.x - cp.x) < 40 && Math.abs(sim.p.y - cp.y) < 4, `${id}: the flag at (${Math.round(cp.x)}, ${cp.y}) does not hold him (at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
    }
  }
});

test('walking along the floor under a boulder never moves it, and it is no wall down there', { todo: 'the engine\'s wall check has no bottom: every block 50+ tall is a wall all the way down, so walking under a boulder on a ledge above pushes it (4-3, 4-8) — for the boulder fixer' }, () => {
  const sim = new RealPlay('4-3', 1);
  const b = sim.platforms.find((q) => q.push && sim.platforms.some((f) => f !== q && f.y > q.y + q.height + 48 && f.x < q.x && f.x + f.width > q.x + q.width))!;
  const floor = sim.platforms.filter((f) => f !== b && f.y > b.y + b.height + 48 && f.x < b.x && f.x + f.width > b.x + b.width).sort((p, q) => p.y - q.y)[0];
  const x0 = b.x;
  sim.stand(b.x - 120, floor.y);
  for (let f = 0; f < 60; f++) sim.frame({ right: true });
  assert.equal(b.x, x0, 'the boulder above moved');
  assert.ok(sim.p.x > b.x + b.width, 'he could not walk under it');
});
