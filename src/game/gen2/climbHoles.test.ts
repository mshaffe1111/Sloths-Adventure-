// R-165.221: on a stage whose brief says no fall costs a life (1-1), every hole in its earth (no earth at
// any depth, lip to lip: under 1-1's last climb, seed 769 25298..27953) is ONE soft zone and has ONE Drop record, so the per-gap ruler's
// floor.unmarked and drop.untyped read what the engine already does there (a set-back). Planted: red on t-eng-base@204e3dec (no zone, no
// record over the climb's holes), green with pipeline.ts softHoles. A stage without the word lays none.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { earthHoles } from './pipeline.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Platform } from '../types.ts';

const cfg = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
const built = (id: string, setting: 'normal' | 'easy', v: number) => {
  setLayoutVariant(v);
  try { return setting === 'easy' ? easyStage(withGoals(generateStage(cfg(id), 'easy'))) : withGoals(generateStage(cfg(id), 'normal')); } finally { setLayoutVariant(null); }
};
type Built = ReturnType<typeof built> & { heartFalls?: Array<{ x0: number; x1: number; soft?: boolean }>; gen2?: { falls?: Array<{ x0: number; x1: number }>; drops?: Array<{ x0: number; x1: number; ends: { kind: string } }> } };

test('earthHoles: a hole is a span with no earth (90 px deep) at any depth; logs and boughs over it do not fill it (planted)', () => {
  const p = (id: number, x: number, y: number, width: number, height: number): Platform => ({ id, x, y, width, height, type: 'solid' } as Platform);
  const ps = [p(1, 0, 800, 1000, 400), p(2, 1000, 760, 300, 24), p(3, 1400, 900, 200, 24), p(4, 2000, 700, 1000, 400), p(5, 3000, 700, 500, 120)];
  assert.deepEqual(earthHoles(ps), [{ x0: 1000, x1: 2000 }]);
  assert.deepEqual(earthHoles([...ps, p(6, 1500, 1200, 100, 90)]), [{ x0: 1000, x1: 1500 }, { x0: 1600, x1: 2000 }]);
});

for (const setting of ['normal', 'easy'] as const) {
  test(`1-1 ${setting}, layouts 1-4: every hole in its earth is one soft zone and one put-back Drop, lip to lip`, () => {
    for (let v = 1; v <= 4; v++) {
      const st = built('1-1', setting, v) as Built;
      const holes = earthHoles(st.platforms);
      assert.ok(holes.length >= 2, `layout ${v}: 1-1's high road lies over holes (found ${holes.length})`);
      for (const h of holes) {
        assert.ok((st.heartFalls ?? []).some((z) => z.soft && z.x0 <= h.x0 + 4 && z.x1 >= h.x1 - 4), `layout ${v}: hole ${h.x0}..${h.x1} has no soft zone over it`);
        assert.ok((st.gen2?.drops ?? []).some((d) => d.x0 <= h.x0 + 4 && d.x1 >= h.x1 - 4 && d.ends.kind === 'putback'), `layout ${v}: hole ${h.x0}..${h.x1} has no put-back Drop spanning it`);
      }
    }
  });
}

test('1-2 Normal (no softFalls in its brief) lays no soft zone over a hole: its hollows stay hard', () => {
  for (let v = 1; v <= 2; v++) {
    const st = built('1-2', 'normal', v) as Built;
    for (const h of earthHoles(st.platforms)) assert.ok(!(st.heartFalls ?? []).some((z) => z.soft && z.x0 <= h.x0 + 4 && z.x1 >= h.x1 - 4 && z.x1 - z.x0 > 1200), `layout ${v}: hole ${h.x0}..${h.x1} got a soft zone`);
  }
});
