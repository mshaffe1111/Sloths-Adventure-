// The court's drum on the conductor (conductor.ts drumTick / drumHold; reference/design/2-9.md NEW 2, R-165.449; ENG-29c): every hit on
// the drum's own bus under the effects, ONE the taiko's boom and the rest the woodblock's tok, each on the audio clock at its beat; a lost
// life's hold fades the bus and lets it go (the cut hits never sound); no audio core (headless), muted, or a context not running: nothing.
// And the layering: nothing in src/audio imports the game (tempo.ts would pull river, physics and the wheel into the audio chunk).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const g = globalThis as unknown as Record<string, unknown>;
const timers: Array<() => void> = [];
g.window ??= { setTimeout: (f: () => void) => (timers.push(f), 0), clearTimeout: () => {} };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
const { Conductor } = await import('./conductor.ts');
const { drumHits } = await import('./drum.ts');

const NORMAL = { beats: 4, beat: 0.7125 };
const START = 5;
interface FakeBus { gain: { value: number; calls: string[]; cancelScheduledValues(): void; setValueAtTime(): void; linearRampToValueAtTime(v: number, t: number): void }; to: unknown; gone: boolean; connect(d: unknown): void; disconnect(): void }
function rig(running = true) {
  const buses: FakeBus[] = [];
  const sfx = { name: 'sfx' };
  const ctx = {
    currentTime: START,
    state: running ? 'running' : 'suspended',
    createGain(): FakeBus {
      const b: FakeBus = {
        gain: { value: 1, calls: [], cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime(v, t) { this.calls.push(`ramp ${v} by ${(t - ctx.currentTime).toFixed(3)}`); } },
        to: null, gone: false, connect(d) { this.to = d; }, disconnect() { this.gone = true; },
      };
      buses.push(b);
      return b;
    },
  };
  const c = new Conductor() as unknown as { core: unknown; muted: boolean; drumVoice: unknown; drumTick: (b: typeof NORMAL, g: number) => void; drumHold: (g: number) => void };
  c.core = { ctx, sfx };
  c.muted = false;
  const hits: Array<{ kind: string; at: number; bus: FakeBus }> = [];
  c.drumVoice = (_core: unknown, bus: FakeBus, kind: string, at: number) => void hits.push({ kind, at, bus });
  return { c, ctx, sfx, buses, hits };
}

test('the conductor\'s drum: every hit on its own bus to the effects, at its beat on the audio clock, ONE the boom; the hold fades and lets the bus go', () => {
  const r = rig();
  for (let f = 1; f <= 30 * 10; f++) {
    r.ctx.currentTime = START + f / 30;
    r.c.drumTick(NORMAL, f / 30);
  }
  assert.equal(r.buses.length, 1, 'one bus');
  assert.equal(r.buses[0].to, r.sfx, 'the bus goes to the effects bus');
  const want = drumHits(NORMAL, 1 / 30, 10 + 3 / 30);
  assert.deepEqual(r.hits.map((h) => h.kind), want.map((h) => h.kind), 'ONE a boom, the rest a tok');
  r.hits.forEach((h, k) => assert.ok(Math.abs(h.at - (START + want[k].g)) < 1e-9, `hit ${k} at its beat (${h.at} for ${want[k].g})`));
  // (a life lost with a hit ahead on the audio clock: the bus fades in 20 ms and is let go; the hits on it never sound)
  const before = r.hits.length;
  let f = 30 * 10;
  while (!r.hits.some((h) => h.at > r.ctx.currentTime)) {
    f++;
    r.ctx.currentTime = START + f / 30;
    r.c.drumTick(NORMAL, f / 30);
  }
  r.c.drumHold(f / 30);
  assert.deepEqual(r.buses[0].gain.calls, ['ramp 0 by 0.020'], 'the bus fades out in 20 ms');
  timers.splice(0).forEach((t) => t());
  assert.ok(r.buses[0].gone, 'and is let go');
  // (game time stands through the down: nothing new; then it runs on, on a NEW bus, the next hit on the clocks' next beat)
  for (let k = 1; k <= 22; k++) {
    r.ctx.currentTime = START + (f + k) / 30;
    r.c.drumTick(NORMAL, f / 30);
  }
  const held = r.hits.length;
  for (let k = 1; k <= 60; k++) {
    r.ctx.currentTime = START + (f + 22 + k) / 30;
    r.c.drumTick(NORMAL, (f + k) / 30);
  }
  assert.ok(held >= before && r.hits.length > held, 'it plays on after the down');
  assert.equal(r.buses.length, 2, 'on a new bus');
  const after = r.hits.slice(held);
  assert.ok(after.every((h) => h.bus === r.buses[1]), 'every hit after the down on the new bus');
  after.forEach((h) => {
    // (game time ran 22 frames behind the audio clock after the down: each hit at its beat on the new distance)
    const gHit = h.at - START - 22 / 30;
    assert.ok(Math.abs(gHit / NORMAL.beat - Math.round(gHit / NORMAL.beat)) < 1e-6, `a hit after the down on a beat (${gHit})`);
  });
});

test('the conductor\'s drum: headless (no core), muted, or the context not running: nothing scheduled, nothing thrown', () => {
  const bare = new Conductor() as unknown as { drumTick: (b: typeof NORMAL, g: number) => void; drumHold: (g: number) => void };
  bare.drumTick(NORMAL, 1);
  bare.drumHold(1);
  const m = rig();
  m.c.muted = true;
  for (let f = 1; f <= 60; f++) m.c.drumTick(NORMAL, f / 30);
  const s = rig(false);
  for (let f = 1; f <= 60; f++) s.c.drumTick(NORMAL, f / 30);
  assert.equal(m.hits.length + s.hits.length + m.buses.length + s.buses.length, 0);
});

test('the layering: nothing in src/audio imports the game (the drum takes the engine\'s beat; never tempo.ts)', () => {
  const dir = new URL('./', import.meta.url);
  const bad = readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    // (a value import, which bundles the game's code; `import type` is erased. And tempo.ts by any road)
    .filter((f) => /^import (?!type )[^;]*from '\.\.\/game\//m.test(readFileSync(new URL(f, dir), 'utf8')) || /game\/tempo/.test(readFileSync(new URL(f, dir), 'utf8')));
  assert.deepEqual(bad, []);
});
