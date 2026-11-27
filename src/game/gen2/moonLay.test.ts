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
    // (the foot runs under the whole stair: the walkable floor a closing flower drops him onto; the top stands 400 up over its far end)
    { key: 'foot', shape: 'stone', w: [600, 620], place: { kind: 'start' } },
    { key: 'top', shape: 'stone', w: [240, 260], place: { kind: 'over', on: 'foot', at: [1, 1], dy: [-400, -400] }, landing: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' },
  exit: { piece: 'top', kind: 'ledge' },
  exitDy: -400,
  sockets: [],
  zones: [{ kind: 'moon', on: 'foot', n: 3, rise: 100, step: 120, w: 120, band, ...(band === 'swing' ? { far: 600 } : {}) }],
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
      // the stair is EXACT (100 on 120, 120 wide) and over its own storey's stone
      for (let i = 0; i < fl.length; i += 3) {
        const [a, b, c] = fl.slice(i, i + 3).map((f) => f.p);
        assert.ok(a.y - b.y === 100 && b.y - c.y === 100, `${band} ${difficulty} ${seed}: rises ${a.y - b.y}, ${b.y - c.y}`);
        assert.ok(Math.abs(b.x - a.x) === 120 && Math.abs(c.x - b.x) === 120 && a.width === 120, `${band} ${difficulty} ${seed}: steps on 120`);
        const under = st.platforms.find((q) => !q.moonflower && q.y === a.y + 100 && q.x <= Math.min(a.x, c.x) && q.x + q.width >= Math.max(a.x, c.x) + 120);
        assert.ok(under, `${band} ${difficulty} ${seed}: the stair at x ${a.x} stands over its stone`);
      }
      if (band === 'swing') {
        const bands = (st.zones ?? []).filter((z) => z.moon).map((z) => JSON.stringify(z.moon!.band));
        assert.equal(new Set(bands).size, 1, `${band} ${difficulty} ${seed}: one beam`);
      }
      assert.deepEqual(st.gen2.errors, [], `${band} ${difficulty} ${seed}: the roll's own checks`);
    }
    assert.ok(laid > 0, `${band} ${difficulty}: no roll laid the moon's storey`);
  }
});
