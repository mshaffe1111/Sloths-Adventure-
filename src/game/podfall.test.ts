/**
 * Falling pods (podfall.ts, 1-4.md engine piece 3) and the cluster gate (vineField.ts ClusterGate, piece 7), on toy pieces. Each rule
 * is proven, and each is planted: the same pieces made to break it turn the check red (a check that cannot fail proves nothing).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Platform, Vine } from './types.ts';
import { POD, podAt, podBeat, podFaults, podHits, podOn, type PodColumn } from './podfall.ts';
import { beatClock, beatDef, beatFaults, warnsIn, type OnBeat } from './beat.ts';
import { checkClock } from './clock.ts';
import {
  CLUSTER_OUT, GATE, clusterLand, fallCluster, gateFaults, gateLeft, gateOver, gateSag, gateShut, type ClusterGate, type VineCluster,
} from './vineField.ts';

const vine = (id: number, x: number, top = 0, bottom = 450): Vine =>
  ({ id, x, topY: top, bottomY: bottom, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', field: true });
const plat = (id: number, x: number, y: number, width: number): Platform =>
  ({ id, x, y, width, height: 24, type: 'solid' } as Platform);
/** five vines 80 apart from a bough at 0 to sound wood at 470 (the room's lane) */
const field = () => [vine(1, 600), vine(2, 680), vine(3, 760), vine(4, 840), vine(5, 920)];
const floor = () => [plat(1, 500, 470, 600), plat(2, 560, 0, 400)];
/** 1-4's pods' beat: one every 3.6 s, a 1.0 s tell, Easy 1.5x (tells 1.5 s) */
const BEAT = podBeat('pods', 3.6, 1.0, 470, 1.5);
const pod = (id: number, v: Vine, shift = 0, over: Partial<PodColumn> = {}): PodColumn =>
  ({ id, vine: v.id, x: v.x, top: 0, land: 470, clock: 'pods', shift, cost: 'heart', ...over });
/** a pod's state at game time t on a setting */
const at = (p: PodColumn, t: number, easy = false) => podAt(p, beatClock([BEAT], easy, t).read(p.clock, p.shift));
/** the first moment of a pod's next tell (s), on a setting */
const tellOf = (p: PodColumn, easy = false) => warnsIn(BEAT, p, easy, 0, 20)[0];

test('the beat: quiet, a tell, then the thing; every beat checked fair (a warning before every on); Easy stretched, never faster', () => {
  assert.deepEqual(checkClock(BEAT), []);
  const d = beatDef('x', 3.6, 1.0, 1.2, 1.5);
  assert.deepEqual(d.phases.map((q) => q.name), ['off', 'warn', 'on']);
  assert.ok(Math.abs(d.phases.reduce((n, q) => n + q.seconds, 0) - 3.6) < 1e-9, 'the beat is its period');
  // two pieces on one beat stay in step, a shift apart (Easy: the shift stretched with the beat)
  const a: OnBeat = { clock: 'x' }, b: OnBeat = { clock: 'x', shift: 1.8 };
  const ta = warnsIn(d, a, false, 0, 10), tb = warnsIn(d, b, false, 0, 10);
  assert.ok(ta.every((x) => tb.some((y) => Math.abs(((y - x + 3.6) % 3.6) - 1.8) < 1e-9 || Math.abs(((x - y + 3.6) % 3.6) - 1.8) < 1e-9)), 'half a beat apart');
  const ea = warnsIn(d, a, true, 0, 20), eb = warnsIn(d, b, true, 0, 20);
  assert.ok(Math.abs(ea[1] - ea[0] - 5.4) < 1e-9, 'Easy: every 5.4 s');
  assert.ok(eb.some((y) => Math.abs(Math.abs(y - ea[0]) - 2.7) < 1e-9), 'Easy keeps the lanes half a beat apart (2.7 s)');
  // and the running clock agrees with that schedule (the engine reads beatClock, never warnsIn), on both settings
  for (const easy of [false, true]) {
    for (const sub of [a, b]) {
      const w = warnsIn(d, sub, easy, 0, 20)[1];
      assert.equal(beatClock([d], easy, w + 0.01).read('x', sub.shift).phase, 'warn', `${easy ? 'Easy' : 'Normal'} shift ${sub.shift ?? 0}: warning at ${w.toFixed(2)}`);
      assert.equal(beatClock([d], easy, w - 0.01).read('x', sub.shift).phase, 'off');
    }
  }
  // planted: an 'on' with no warning before it, and an Easy faster than Normal, are refused
  assert.match(checkClock({ id: 'bad', phases: [{ name: 'off', seconds: 2 }, { name: 'on', seconds: 1 }], offset: 0, easyStretch: 1 }).join(), /no warn right before/);
  assert.match(checkClock({ ...d, easyStretch: 0.8 }).join(), /never faster/);
});

test('beatFaults: warnings seen together never start within the rule; a short warning and a missing beat are named', () => {
  const d = beatDef('x', 3.6, 1.0, 1.2);
  const seen = (id: string, x: number, shift: number) => ({ id, clock: 'x', shift, x, y0: 0, y1: 400 });
  const rule = { tellMin: 1.0, apart: 1.5, seen: 480 };
  assert.deepEqual(beatFaults([d], [seen('a', 0, 0), seen('b', 160, 1.8)], rule), []);
  assert.match(beatFaults([d], [seen('a', 0, 0), seen('b', 160, 0.6)], rule).join(), /within 1.5 s/);
  assert.deepEqual(beatFaults([d], [seen('a', 0, 0), seen('b', 900, 0.6)], rule), [], 'out of each other\'s view: free');
  assert.match(beatFaults([beatDef('x', 3.6, 0.7, 1.2)], [seen('a', 0, 0)], rule).join(), /warning is 0.7 s/);
  assert.match(beatFaults([], [seen('a', 0, 0)], rule).join(), /beat x is not in the stage/);
});

test('a pod tells for its whole tell before it lets go, then falls down its column and bursts on the wood', () => {
  const p = pod(1, field()[2]);
  const s0 = tellOf(p);
  assert.ok(s0 > 0, 'quiet first');
  assert.equal(at(p, s0 - 0.01).phase, 'idle');
  assert.equal(at(p, s0 + 0.01).phase, 'warn', 'the tell starts');
  assert.equal(at(p, s0 + 0.99).phase, 'warn', 'and runs its whole length');
  assert.equal(at(p, s0 + 1.01).phase, 'fall', 'then it lets go');
  assert.ok(at(p, s0 + 1.3).y > p.top, 'and falls');
  assert.equal(at(p, s0 + 1 + 470 / POD.speed + 0.1).phase, 'burst', 'and bursts on the wood');
  // Easy: the same pod tells for 1.5 s (the beat's stretch)
  const e0 = tellOf(p, true);
  assert.equal(at(p, e0 + 1.45, true).phase, 'warn');
  assert.equal(at(p, e0 + 1.55, true).phase, 'fall');
  assert.ok(podOn(470) >= 470 / POD.speed + POD.burst, "the beat's on fits the fall and the burst");
});

test('a pod finds him on a vine down its own column only: one hand beside it is safe, two hands across it are not', () => {
  const V = field();
  const p = pod(1, V[2]);
  // the moment it passes his chest on the vine (feet at 300, body 64)
  let t = tellOf(p) + 1.0;
  while (at(p, t).y < 270) t += 1 / 60;
  const s = at(p, t);
  assert.ok(podHits(p, s, [V[2].x], 300, 64, true), 'one hand on its vine: hit');
  assert.ok(!podHits(p, s, [V[1].x], 300, 64, true), 'one hand on the vine beside: safe (80 px)');
  assert.ok(podHits(p, s, [V[1].x, V[2].x], 300, 64, true), 'two hands, one on its vine: hit (the fast way is exposed)');
  assert.ok(!podHits(p, s, [V[0].x, V[1].x], 300, 64, true), 'two hands on two other vines: safe');
  assert.ok(!podHits(p, s, [V[2].x], 120, 64, true), 'above it: it has passed him');
  // planted: the same pod in its tell does not hit (only a falling pod does)
  assert.ok(!podHits(p, at(p, tellOf(p) + 0.2), [V[2].x], 300, 64, true));
  // off a vine, his body's width counts (rockfall's), so standing just beside its line still finds him
  assert.ok(podHits(p, s, [V[2].x + POD.body - 2], 300, 64, false));
  assert.ok(!podHits(p, s, [V[2].x + POD.hands + 2], 300, 64, true), 'on vines only the hand lines count');
});

test('podFaults: a fair field passes; each rule, broken, is named', () => {
  const V = field(), P = floor();
  // two columns of five on ONE steady beat, half a beat apart (beat 4's field): fair, on both settings
  const fair = [pod(1, V[1]), pod(2, V[3], 1.8)];
  assert.deepEqual(podFaults(fair, [BEAT], V, P, 90), []);
  assert.deepEqual(podFaults(fair, [BEAT], V, P, 90, true), []);
  // planted: a short tell
  assert.match(podFaults(fair, [podBeat('pods', 3.6, 0.7, 470, 1.5)], V, P, 90).join(), /warning is 0.7 s/);
  // planted: two tells he can see inside 1.5 s
  assert.match(podFaults([pod(1, V[1]), pod(2, V[3], 0.6)], [BEAT], V, P, 90).join(), /within 1.5 s/);
  // planted: an 'on' too short for the column
  assert.match(podFaults(fair, [beatDef('pods', 3.6, 1.0, 0.4)], V, P, 90).join(), /too short to fall/);
  // planted: every vine within a step of a pod's vine is podded too (no free vine to step to)
  const three = [vine(1, 600), vine(2, 680), vine(3, 760)];
  const all = [pod(1, three[0]), pod(2, three[1], 1.8), pod(3, three[2], 0, { clock: 'p2' })];
  assert.match(podFaults(all, [BEAT, { ...BEAT, id: 'p2' }], three, P, 90).join(), /no free vine within a step/);
  // planted: the wood under a column too far below its vine's foot
  assert.match(podFaults([pod(1, V[1])], [BEAT], V, [plat(1, 500, 1100, 600)], 90).join(), /px down \(over 450\)/);
  // planted: a pod over a vine that is not there; a pod on a beat that is not there
  assert.match(podFaults([{ ...pod(1, V[1]), vine: 99 }], [BEAT], V, P, 90).join(), /not in the stage/);
  assert.match(podFaults([pod(1, V[1], 0, { clock: 'nope' })], [BEAT], V, P, 90).join(), /beat nope is not in the stage/);
});

test('a torn cluster comes down on the sound wood under its column, out of his line, never through a shut bough', () => {
  const V = field(), P = floor();
  const c: VineCluster = { id: 1, vine: V[2].id, y: 40, h: 50, falling: true, vy: 0 };
  // the bough the field hangs from (platform 2 at y 0) is over it; the floor at 470 is under it
  c.land = clusterLand(V[2], c.y, P, new Set([2]));
  assert.equal(c.land, 470);
  let landed = false;
  for (let i = 0; i < 120 && !landed; i++) landed = fallCluster(c, 1 / 30, 2000, V[2].x - 10, V[2].x);
  assert.ok(landed && c.gone && c.y === 470, 'it lands on the wood, once');
  assert.equal(c.dx, CLUSTER_OUT, 'bounced out of his line, away from him');
  // planted: no wood under it at all: it falls out of the world, no landing
  const d: VineCluster = { id: 2, vine: V[2].id, y: 40, h: 50, falling: true, vy: 0 };
  d.land = clusterLand(V[2], d.y, [], new Set());
  assert.equal(d.land, undefined);
  let any = false;
  for (let i = 0; i < 200 && !d.gone; i++) any ||= fallCluster(d, 1 / 30, 900);
  assert.ok(d.gone && !any, 'gone, never landed');
});

test('a gate: shut while any cluster is on it, a notch lifted for each freed, open on the last; no footing while shut', () => {
  const V = field(), P = floor();
  const K: VineCluster[] = [{ id: 1, vine: 2, y: 200, h: 50 }, { id: 2, vine: 4, y: 260, h: 50 }];
  const g: ClusterGate = { id: 1, platform: 2, clusters: [1, 2], far: 1 };
  assert.deepEqual(gateFaults([g], K, V, P), []);
  assert.ok(gateShut(g, K));
  assert.equal(gateSag(g, K), GATE.sag);
  assert.equal(gateOver(V[1], [g], K, P), g, "a vine whose top is at the shut bough is under it");
  K[0].falling = true;
  assert.equal(gateLeft(g, K), 1);
  assert.equal(gateSag(g, K), GATE.sag / 2, 'a notch');
  K[1].gone = true;
  assert.ok(!gateShut(g, K), 'open on the last');
  assert.equal(gateSag(g, K), 0);
  assert.equal(gateOver(V[1], [g], K, P), null, 'open: the climb vaults onto it');
  // planted: a cluster on a vine that does not reach the bough; a gate whose bough is missing; one cluster holding two gates
  const short = [...V.slice(0, 4), vine(5, 920, 120, 450)];
  const K2: VineCluster[] = [{ id: 3, vine: 5, y: 300, h: 50 }];
  assert.match(gateFaults([{ id: 2, platform: 2, clusters: [3], far: 1 }], K2, short, P).join(), /does not reach/);
  assert.match(gateFaults([{ id: 3, platform: 9, clusters: [3], far: 1 }], K2, short, P).join(), /bough 9 is not in the stage/);
  const K3: VineCluster[] = [{ id: 4, vine: 2, y: 200, h: 50 }];
  assert.match(gateFaults([{ id: 4, platform: 2, clusters: [4], far: 1 }, { id: 5, platform: 2, clusters: [4], far: 1 }], K3, V, P).join(), /holds gates 4 and 5/);
});
