// ENG-LOOK2 step 2 (the lead's ruling (a), 11-14 10:24 PM; BUILD-18b's root for gen2Pits seed 2, rollGuard and skills v3): a section asks
// for the join INTO it (SectionTemplate.entry.join), and the pipeline lays it, never rolls it. Any stage, by data: proven on 1-8's real row,
// whose still fork and tip must be walked onto (seed 2 rolled a pit into the still fork, layout 3 a step into the tip).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { listedStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { WorldKit } from './types.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-8')!;
// (the two sections 1-8's design has him walk onto: the still fork and the tip)
const ASKED = new Set(['w1-18-still-fork', 'w1-18-tip']);
const asking = (k: WorldKit, on: boolean): WorldKit => ({ ...k, manifest: { ...k.manifest, sections: k.manifest.sections.map((t) => (ASKED.has(t.id) ? { ...t, entry: { piece: t.entry.piece, kind: t.entry.kind, ...(on ? { join: 'walk' as const } : {}) } } : t)) } });
const joinsInto = (kit: WorldKit, seed: number) => buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' }).gen2.plan.filter((p) => ASKED.has(p.template)).map((p) => p.join);
const SEEDS = [1, 2, 3, 4, 5, 6];

test('a section that asks to be walked onto is joined by a walk on every roll; one that does not ask is rolled as before', () => {
  const k = listedStage('1-8')!.kit();
  const plain = SEEDS.flatMap((s) => joinsInto(asking(k, false), s));
  const asked = SEEDS.flatMap((s) => joinsInto(asking(k, true), s));
  assert.ok(plain.length >= SEEDS.length && asked.length >= SEEDS.length, `the sections are laid: ${plain} / ${asked}`);
  // (planted: unasked, the roll lays a pit or a step into one on these seeds, BUILD-18b's seed 2)
  assert.ok(plain.some((j) => j === 'pit' || j === 'step'), `the control rolls only walks: ${plain}`);
  assert.deepEqual([...new Set(asked)], ['walk'], `asked: ${asked}`);
});
