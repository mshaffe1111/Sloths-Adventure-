// A section whose laid exit leaves the corridor is first re-laid at its slot with its other versions, one by one, and only then swapped
// out (the porter's Round 10, 11-06: 1-1 seed 5 reached the corridor's top before the goal; quiet-arrival's 'step' version climbed out of
// it where its level 'short' fitted, and banning the template, then the other two goal sections, threw "no section fits node n14 (goal)").
// Planted on the goal: a quiet-arrival whose drawn version climbs 24-30 px, as Round 10 lays it.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, versionCombos } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

test('versionCombos: every drawable combination, an Easy-only twin left out', () => {
  const t = { subBlocks: [{ id: 'a', versions: [{ id: '1' }, { id: '2' }, { id: 'e', easyOnly: true }] }, { id: 'b', versions: [{ id: 'x' }, { id: 'y' }] }] } as unknown as SectionTemplate;
  assert.deepEqual(versionCombos(t), [{ a: '1', b: 'x' }, { a: '1', b: 'y' }, { a: '2', b: 'x' }, { a: '2', b: 'y' }]);
});

test("1-1 with a goal version that climbs out of the corridor: re-laid with its level version, never a throw (24 seeds, both settings)", () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const base = w1World();
  // (quiet-arrival's versions as Round 10 lays them: 'short' level, 'step' up 24-30 px; its walk-on 100-130 px)
  const sections = base.manifest.sections.map((t) => {
    if (t.id !== 'w1-quiet-arrival' || !t.subBlocks?.length) return t;
    const sb = t.subBlocks[0];
    const level = sb.versions[0];
    const step = { ...level, id: 'step', pieces: level.pieces.map((p) => (p.place.kind === 'walk' ? { ...p, place: { ...p.place, dy: [-30, -24] as [number, number] } } : p)) };
    return { ...t, subBlocks: [{ ...sb, versions: [{ ...level, id: 'short' }, step] }, ...t.subBlocks.slice(1)] };
  });
  const kit: WorldKit = { ...base, manifest: { ...base.manifest, sections } };
  const threw: string[] = [];
  for (let seed = 1; seed <= 24; seed++) for (const difficulty of ['normal', 'easy'] as const) {
    try { buildGen2Stage({ config: c, kit, seed, difficulty }); } catch (e) { threw.push(`seed ${seed} ${difficulty}: ${(e as Error).message.slice(0, 100)}`); }
  }
  assert.deepEqual(threw, []);
});
