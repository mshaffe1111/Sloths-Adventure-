// A WORLD'S OWN VERDICTS, declared on its manifest and run by the pipeline into gen2.errors on every roll (R-165.537, worldVerdicts.ts).
// Each judge has a planted red through the REAL pipeline: a bad roll is refused by its line while the manifest names the judge, and is
// no longer refused by it once the judge is taken off the manifest.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { readyDraft } from '../../../tools/engine/draft.ts';
import { buildGen2Stage } from './pipeline.ts';
import { draftListed, listedStage } from './listed.ts';
import { DARK_EMIT, darkGaps } from './dark.ts';
import { moonVerdicts } from '../moon.ts';
import { towerCfg, upManifest } from './toyTower.ts';
import { generateAllLevels } from '../worldsData.ts';
import { WORLD_VERDICTS, worldVerdictLines } from './worldVerdicts.ts';
import { w3Manifest } from './worlds/w3.ts';
import type { PropEmitter, SectionTemplate, WorldKit } from './types.ts';

/** World 3's first stage, as the tools ready a draft */
const W3_STAGE = '3-1';
const w3Row = () => listedStage(W3_STAGE) ?? (readyDraft(W3_STAGE), draftListed(W3_STAGE)!);
const w3Cfg = () => ({ ...generateAllLevels().find((c) => c.id === W3_STAGE && !c.secret)!, unlocked: true });
const off = (kit: WorldKit): WorldKit => ({ ...kit, manifest: { ...kit.manifest, verdicts: undefined } });

test('World 3 declares its judges on its manifest: the dark brick\'s three and the moon\'s, every one a judge in the registry', () => {
  const named = w3Manifest().verdicts ?? [];
  assert.deepEqual([...named], ['darkGaps', 'darkLandings', 'darkFlags', 'moon']);
  for (const n of named) assert.equal(typeof WORLD_VERDICTS[n], 'function', n);
  assert.deepEqual(worldVerdictLines(undefined, { platforms: [], zones: [] } as never, 'normal'), [], 'a manifest that names none judges nothing');
});

test('darkGaps through the pipeline (planted): a World 3 roll whose glowworms hang far over its landings is refused by name on both settings; with darkGaps off the manifest it is not', () => {
  const row = w3Row();
  const kit = row.kit();
  // (the plant: the kit's own glowworm end, every light it lays lifted 3000 px, so no landing in the dark has a light over it)
  const glow: PropEmitter = (f, p, out) => {
    const n = out.zones.length;
    DARK_EMIT.darkToGlow(f, p, out);
    for (const z of out.zones.slice(n)) z.lights = z.lights?.map((l) => ({ ...l, y: l.y - 3000 }));
  };
  const bad: WorldKit = { ...kit, emit: { ...kit.emit, darkToGlow: glow } };
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: w3Cfg(), kit: bad, seed: 1, difficulty });
    const lines = darkGaps(st, difficulty);
    assert.ok(lines.length > 0, `${difficulty}: the planted roll has an unlit gap`);
    for (const l of lines) assert.ok(st.gen2.errors.includes(l), `${difficulty}: refused by its line: ${l}`);
    const was = buildGen2Stage({ config: w3Cfg(), kit: off(bad), seed: 1, difficulty });
    assert.deepEqual(was.gen2.errors.filter((e) => e.startsWith('dark: a gap')), [], `${difficulty}: darkGaps off the manifest: the gap is not refused`);
  }
  // (and the kit as it is: the same seed is clean through its judges on both settings)
  for (const difficulty of ['normal', 'easy'] as const) assert.deepEqual(buildGen2Stage({ config: w3Cfg(), kit, seed: 1, difficulty }).gen2.errors, [], difficulty);
});

/** a moon storey whose steps stand `step` apart (the moon's own is 120); at 300 the first step hangs off its stone's near end */
const storey = (step: number): SectionTemplate => ({
  id: `moon-plant-${step}`, name: `a moon storey, steps ${step} apart`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, content: 'climb',
  pieces: [
    { key: 'foot', shape: 'stone', w: [600, 620], place: { kind: 'start' } },
    { key: 'top', shape: 'stone', w: [240, 260], place: { kind: 'over', on: 'foot', at: [1, 1], dy: [-400, -400] }, landing: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'top', kind: 'ledge' }, exitDy: -400, sockets: [],
  zones: [{ kind: 'moon', on: 'foot', n: 3, rise: 100, step, w: 120, band: 'rest' }],
  mirrorable: false,
});
const moonKit = (step: number, verdicts: boolean): WorldKit => ({
  manifest: { ...upManifest, name: 'Toy tower, moon', sections: [...upManifest.sections, storey(step)], ...(verdicts ? { verdicts: ['moon'] as const } : {}) },
  emit: {},
});

test('moonVerdicts through the pipeline (planted): a storey whose steps stand off their stone is refused by name on both settings; with moon off the manifest it is not; its own stair (120) is clean', () => {
  let planted = 0;
  for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
    // (a roll the planted storey cannot fit throws, 'no section fits': it lays no moon, and is no plant)
    let st;
    try { st = buildGen2Stage({ config: towerCfg('5-93', 'ascent'), kit: moonKit(300, true), seed, difficulty }); } catch { continue; }
    const lines = moonVerdicts(st as never, difficulty);
    if (!lines.length) continue;
    planted++;
    for (const l of lines) assert.ok(st.gen2.errors.includes(l), `${difficulty} ${seed}: refused by its line: ${l}`);
    const was = buildGen2Stage({ config: towerCfg('5-93', 'ascent'), kit: moonKit(300, false), seed, difficulty });
    assert.deepEqual(was.gen2.errors.filter((e) => e.startsWith('moon:')), [], `${difficulty} ${seed}: moon off the manifest: not refused`);
    const good = buildGen2Stage({ config: towerCfg('5-93', 'ascent'), kit: moonKit(120, true), seed, difficulty });
    assert.deepEqual(good.gen2.errors.filter((e) => e.startsWith('moon:')), [], `${difficulty} ${seed}: the moon's own stair is clean`);
  }
  assert.ok(planted > 0, 'no roll laid the planted storey');
});
