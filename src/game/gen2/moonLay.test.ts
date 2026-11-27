// THE MOON'S STOREY, laid (ENG-MOON, 3-4.md NEW 1; R-165.449): a section whose 'moon' zone names its steps, in the up tower fixture
// (toyTower.ts). The pipeline lays the zone over the steps, marks them moonflowers and gives the beam each setting's band (moon.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg, upManifest } from './toyTower.ts';
import { moonFlowers, flowerOpen } from '../moon.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

/** a storey of the moon: stone, three moonflower steps (rise 100 on 120, 120 wide), stone (3-4.md beat 2-4) */
export const moonStorey = (band: 'rest' | 'swing' | 'rise'): SectionTemplate => ({
  id: `moon-${band}`,
  name: `the moon's storey (${band})`,
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 2,
  content: 'climb',
  pieces: [
    { key: 'foot', shape: 'stone', w: [240, 260], place: { kind: 'start' } },
    { key: 'f1', shape: 'stone', w: [120, 120], place: { kind: 'jump', after: 'foot', dy: [-100, -100], gapPx: [0, 0] }, landing: true },
    { key: 'f2', shape: 'stone', w: [120, 120], place: { kind: 'jump', after: 'f1', dy: [-100, -100], gapPx: [0, 0] }, landing: true },
    { key: 'f3', shape: 'stone', w: [120, 120], place: { kind: 'jump', after: 'f2', dy: [-100, -100], gapPx: [0, 0] }, landing: true },
    { key: 'top', shape: 'stone', w: [240, 260], place: { kind: 'jump', after: 'f3', dy: [-100, -100], gapPx: [0, 0] }, landing: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' },
  exit: { piece: 'top', kind: 'ledge' },
  exitDy: -400,
  sockets: [],
  zones: [{ kind: 'moon', steps: ['f1', 'f2', 'f3'], band, ...(band === 'swing' ? { far: 600 } : {}) }],
  mirrorable: false,
});

const ID = '5-93';
const kit = (band: 'rest' | 'swing' | 'rise'): WorldKit => ({ manifest: { ...upManifest, name: 'Toy tower, moon', sections: [...upManifest.sections, moonStorey(band)] }, emit: {} });

test('a moon storey in the up tower: its steps are moonflowers in a moon zone, read on both settings', () => {
  for (const band of ['rest', 'swing', 'rise'] as const) for (const difficulty of ['normal', 'easy'] as const) {
    let laid = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const st = buildGen2Stage({ config: towerCfg(ID, 'ascent'), kit: kit(band), seed, difficulty });
      const fl = moonFlowers(st, difficulty);
      if (!fl.length) continue;
      laid++;
      assert.equal(fl.length % 3, 0, `${band} ${difficulty} ${seed}: three steps a storey`);
      assert.ok(fl.every((f) => f.clocks.length > 0), `${band} ${difficulty} ${seed}: every flower opens on its beam`);
      assert.ok((st.zones ?? []).some((z) => z.kind === 'moon' && z.moon), 'the moon zone is on the built stage');
      if (band === 'rest') assert.ok(fl.every((f) => flowerOpen(f.clocks, 1)));
    }
    assert.ok(laid > 0, `${band} ${difficulty}: no roll laid the moon's storey`);
  }
});
