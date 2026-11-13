/**
 * Falling pods (podfall.ts, 1-4.md engine piece 3) and the cluster gate (vineField.ts ClusterGate, piece 7), on toy pieces. Each rule
 * is proven, and each is planted: the same pieces made to break it turn the check red (a check that cannot fail proves nothing).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Platform, Vine } from './types.ts';
import { POD, podAt, podFaults, podFits, podHits, tellStart, tellsIn, type PodColumn } from './podfall.ts';
import {
  CLUSTER_OUT, GATE, clusterLand, fallCluster, gateFaults, gateLeft, gateOver, gateSag, gateShut, type ClusterGate, type VineCluster,
} from './vineField.ts';

const vine = (id: number, x: number, top = 0, bottom = 450): Vine =>
  ({ id, x, topY: top, bottomY: bottom, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', field: true });
const plat = (id: number, x: number, y: number, width: number): Platform =>
  ({ id, x, y, width, height: 24, type: 'solid' } as Platform);
/** five vines 80 apart from a bough at 0 to sound wood at 450 (the room's lane) */
const field = () => [vine(1, 600), vine(2, 680), vine(3, 760), vine(4, 840), vine(5, 920)];
const floor = () => [plat(1, 500, 470, 600), plat(2, 560, 0, 400)];
const pod = (id: number, v: Vine, over: Partial<PodColumn> = {}): PodColumn =>
  ({ id, vine: v.id, x: v.x, top: v.topY, land: 470, every: 3.6, warn: 1.0, offset: 0, air: true, cost: 'heart', ...over });

test('a pod tells for its whole tell before it lets go, then falls down its column and bursts on the wood', () => {
  const p = pod(1, field()[2]);
  const s0 = tellStart(p);
  assert.ok(s0 > 0, 'quiet first');
  assert.equal(podAt(p, s0 - 0.01).phase, 'idle');
  assert.equal(podAt(p, s0 + 0.01).phase, 'warn', 'the tell starts');
  assert.equal(podAt(p, s0 + p.warn - 0.01).phase, 'warn', 'and runs its whole length');
  assert.equal(podAt(p, s0 + p.warn + 0.01).phase, 'fall', 'then it lets go');
  assert.ok(podAt(p, s0 + p.warn + 0.3).y > p.top, 'and falls');
  assert.ok(podFits(p));
  // planted: a beat too short for its tell, fall and burst
  assert.equal(podFits({ ...p, every: 1.6 }), false);
});

test('a pod finds him on a vine down its own column only: one hand beside it is safe, two hands across it are not', () => {
  const V = field();
  const p = pod(1, V[2]);
  // the moment it passes his chest on the vine (feet at 300, body 64)
  let t = tellStart(p) + p.warn;
  while (podAt(p, t).y < 270) t += 1 / 60;
  assert.ok(podHits(p, t, [V[2].x], 300, 64, true), 'one hand on its vine: hit');
  assert.ok(!podHits(p, t, [V[1].x], 300, 64, true), 'one hand on the vine beside: safe (80 px)');
  assert.ok(podHits(p, t, [V[1].x, V[2].x], 300, 64, true), 'two hands, one on its vine: hit (the fast way is exposed)');
  assert.ok(!podHits(p, t, [V[0].x, V[1].x], 300, 64, true), 'two hands on two other vines: safe');
  assert.ok(!podHits(p, t, [V[2].x], 120, 64, true), 'above it: it has passed him');
  // planted: the same pod in its tell does not hit (only a falling pod does)
  assert.ok(!podHits(p, tellStart(p) + 0.2, [V[2].x], 300, 64, true));
  // off a vine, his body's width counts (rockfall's), so standing just beside its line still finds him
  assert.ok(podHits(p, t, [V[2].x + POD.body - 2], 300, 64, false));
  assert.ok(!podHits(p, t, [V[2].x + POD.hands + 2], 300, 64, true), 'on vines only the hand lines count');
});

test('podFaults: a fair field passes; each rule, broken, is named', () => {
  const V = field(), P = floor();
  // two columns of five on ONE steady beat, half a beat apart (beat 4's field): fair
  const fair = [pod(1, V[1]), pod(2, V[3], { offset: 1.8 })];
  assert.deepEqual(podFaults(fair, V, P, 90), []);
  // planted: a short tell
  assert.match(podFaults([pod(1, V[1], { warn: 0.7 })], V, P, 90).join(), /tell is 0.7 s/);
  // planted: two tells he can see inside 1.5 s
  assert.match(podFaults([pod(1, V[1]), pod(2, V[3], { offset: 0.6 })], V, P, 90).join(), /tells start within 1.5 s/);
  // planted: every vine within a step of a pod's vine is podded too (no free vine to step to)
  const three = [vine(1, 600), vine(2, 680), vine(3, 760)];
  const all = [pod(1, three[0], { offset: 0 }), pod(2, three[1], { offset: 1.8 }), pod(3, three[2], { offset: 0 })];
  assert.match(podFaults(all, three, P, 90).join(), /no free vine within a step/);
  // planted: the wood under a column too far below its vine's foot
  assert.match(podFaults([pod(1, V[1])], V, [plat(1, 500, 1100, 600)], 90).join(), /px down \(over 450\)/);
  // planted: a pod over a vine that is not there
  assert.match(podFaults([{ ...pod(1, V[1]), vine: 99 }], V, P, 90).join(), /not in the stage/);
});

test('tellsIn lists every tell start once, on the beat', () => {
  const p = pod(1, field()[0], { offset: 0.5 });
  const ts = tellsIn(p, 0, 3 * p.every);
  assert.ok(ts.length >= 2 && ts.length <= 3);
  for (let i = 1; i < ts.length; i++) assert.ok(Math.abs(ts[i] - ts[i - 1] - p.every) < 1e-9, 'one a beat');
  for (const t of ts) assert.equal(podAt(p, t + 0.01).phase, 'warn');
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
