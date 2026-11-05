// World 1's per-roll tempo in gen2 (CHUNK-POOL-BRIEF step 3, the tempo dial): the manifest's rollRanges, read only where a world declares
// it. Each roll draws its median gap share and its rise band (the designer's measured ranges from old 1-1); a section's jumps and the
// joins between sections scale by them, inside the jump's own limits. On the toy world: a long-gap roll lays wider jumps than a
// short-gap one, a hilly roll taller rises than a flat one, every stage still passes the level check, and a world without rollRanges
// builds exactly as before. That every shipped world builds as before is the every-stage lock's proof (tools/engine/lockall.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, checkStage } from './pipeline.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import type { Platform } from '../types.ts';

type RR = NonNullable<WorldManifest['rollRanges']>;
const ranges = (gap: number, rise: number): RR => ({
  gap: { min: gap, mode: gap, max: gap + 1e-6, p90: 0.99, centre: 0.65 },
  rise: { home: [rise, rise], hilly: [rise, rise], hillyShare: 0, centre: 0.67 },
});
// (the toy world's sections are nearly all walks and steps; a required run of three banks up, each a jump, gives the dial something to scale)
const climb: SectionTemplate = {
  id: 'toy-tempo-climb', name: 'three banks up', archetypes: 'any', phases: ['sho', 'ten', 'ketsu', 'ki', 'rest'], difficulty: 3,
  pieces: [
    { key: 'a', shape: 'bank', w: [300, 300], place: { kind: 'start' } },
    { key: 'b', shape: 'bank', w: [300, 300], place: { kind: 'jump', after: 'a', dy: [-60, -60], share: [0.6, 0.6] } },
    { key: 'c', shape: 'bank', w: [300, 300], place: { kind: 'jump', after: 'b', dy: [-60, -60], share: [0.6, 0.6] } },
    { key: 'd', shape: 'bank', w: [300, 300], place: { kind: 'jump', after: 'c', dy: [-60, -60], share: [0.6, 0.6] } },
  ],
  entry: { piece: 'a', kind: 'ground' }, exit: { piece: 'd', kind: 'ground' }, exitDy: -180, sockets: [], mirrorable: false,
};
const base = { ...manifest, sections: [...manifest.sections, climb], required: { '5-7': [{ section: 'toy-tempo-climb' }] } } as WorldManifest;
const withRR = (r: RR): WorldKit => ({ ...kit, manifest: { ...base, rollRanges: r } as WorldManifest });
const SEEDS = Array.from({ length: 16 }, (_, i) => 3 + i * 41);
const build = (k: WorldKit, seed: number) => buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'normal' });

/** the route's air: for each pair of x-neighbouring platforms that do not overlap, the gap between them and how far up the next one is */
function air(ps: Platform[]): { gaps: number[]; rises: number[] } {
  // (the ground's banks of earth only: a pit's floor, its steps and a stone on a bank are not the route's lips)
  const route = ps.filter((p) => p.type === 'solid' && p.height >= 120).sort((a, b) => a.x - b.x);
  const gaps: number[] = [], rises: number[] = [];
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1], b = route[i], g = b.x - (a.x + a.width);
    if (g < 20 || g > 600) continue;
    gaps.push(g);
    if (a.y - b.y > 10) rises.push(a.y - b.y);
  }
  return { gaps, rises };
}
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);

test('a long-gap roll lays wider jumps than a short-gap roll, and both pass the level check', () => {
  const long = withRR(ranges(0.95, 0.67)), short = withRR(ranges(0.4, 0.67));
  const gl: number[] = [], gs: number[] = [];
  for (const s of SEEDS) {
    const a = build(long, s), b = build(short, s);
    for (const st of [a, b]) assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `seed ${s}`);
    gl.push(...air(a.platforms).gaps);
    gs.push(...air(b.platforms).gaps);
  }
  assert.ok(gl.length > 20 && gs.length > 20, `${gl.length} / ${gs.length} gaps measured`);
  assert.ok(mean(gl) > 1.25 * mean(gs), `long roll's mean gap ${mean(gl).toFixed(0)} px, short roll's ${mean(gs).toFixed(0)} px`);
});

test('a hilly roll lays taller rises than a flat roll, and both pass the level check', () => {
  const hilly = withRR(ranges(0.65, 0.94)), flat = withRR(ranges(0.65, 0.35));
  const rh: number[] = [], rf: number[] = [];
  for (const s of SEEDS) {
    const a = build(hilly, s), b = build(flat, s);
    for (const st of [a, b]) assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `seed ${s}`);
    rh.push(...air(a.platforms).rises);
    rf.push(...air(b.platforms).rises);
  }
  assert.ok(rh.length > 10 && rf.length > 10, `${rh.length} / ${rf.length} rises measured`);
  assert.ok(mean(rh) > 1.2 * mean(rf), `hilly roll's mean rise ${mean(rh).toFixed(0)} px, flat roll's ${mean(rf).toFixed(0)} px`);
});

test('a roll at the centres (no cap) lays exactly what no roll lays: the dial is a pure scale (16 seeds)', () => {
  // (that a world without rollRanges builds as before on every shipped stage is the every-stage lock's proof, tools/engine/lockall.ts)
  const centred: RR = { gap: { min: 0.65, mode: 0.65, max: 0.65 + 1e-9, p90: 1, centre: 0.65 }, rise: { home: [0.67, 0.67], hilly: [0.67, 0.67], hillyShare: 0, centre: 0.67 } };
  for (const s of SEEDS) {
    const a = build({ ...kit, manifest: base }, s).platforms, b = build(withRR(centred), s).platforms;
    assert.deepEqual(b, a, `seed ${s}`);
  }
});
