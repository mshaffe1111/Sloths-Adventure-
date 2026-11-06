// The secondary half of Matt's floating rule (2026-11-05): no prop or dressing piece over open air. A planted floating prop is caught.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { propBreaches } from './propSupport.ts';

const build = (id: string, v: number, setting: 'normal' | 'easy') => {
  const c = generateAllLevels().find((l) => l.id === id)!;
  setLayoutVariant(v);
  const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  return st;
};

test('a planted floating prop is caught: a fern 200 px over open air, and a rock with nothing under it', () => {
  const st = build('1-1', 1, 'normal');
  const before = propBreaches(st).length;
  const list = st.proto?.mixDress ?? st.proto?.dress ?? (st.proto.dress = []);
  const P = st.platforms as Array<{ x: number; y: number; width: number }>;
  const hi = Math.min(...P.map((p) => p.y)) - 400;
  list.push({ n: 'w1Fern', x: P[0].x + 40, b: hi }, { n: 'w1Rock', x: P[0].x + 80, b: hi });
  const after = propBreaches(st);
  assert.equal(after.length, before + 2, `planted 2, found ${after.length - before}: ${JSON.stringify(after.slice(-2))}`);
});

// (the engine-built stages themselves are judged by tools/engine/stage.ts's gate, 16 layouts x 2: the mixed 1-1 and 1-5 fail it today,
// props hung past a piece's edge, the porter's report of 11-05)

test('nothing dressed over the exit door: a planted fern on the door is caught, one well clear of it is not', async () => {
  const { dressOverDoor } = await import('./propSupport.ts');
  const st = build('1-1', 1, 'normal');
  const list = st.proto?.mixDress ?? st.proto?.dress ?? (st.proto.dress = []);
  const before = dressOverDoor(st).length;
  list.push({ n: 'w1Fern', x: st.exitTotemX + 60, b: st.exitTotemY }, { n: 'w1Fern', x: st.exitTotemX - 900, b: st.exitTotemY });
  assert.equal(dressOverDoor(st).length, before + 1);
});

test('a prop hung UNDER a floating log is caught (its foot at the log underside), one standing on its top is not', () => {
  const log = { id: 9001, x: 5000, y: 600, width: 300, height: 24, type: 'solid', style: 'log' };
  const st: any = { platforms: [log], proto: { mixDress: [{ n: 'w1Fern', x: 5150, b: 624 }, { n: 'w1Fern', x: 5100, b: 600 }] } };
  const b = propBreaches(st);
  assert.equal(b.length, 1, JSON.stringify(b));
  assert.equal(b[0].b, 624);
});

test('nothing dressed through a thin platform: a tall mushroom on the floor drawn up behind a floating log is caught, one beside it is not', async () => {
  const { dressThroughPlatform } = await import('./propSupport.ts');
  const floorP = { id: 1, x: 0, y: 900, width: 2000, height: 200, type: 'solid', style: 'moss_stone' };
  const log = { id: 2, x: 1000, y: 860, width: 200, height: 24, type: 'solid', style: 'log' };
  const st: any = { platforms: [floorP, log], proto: { mixDress: [{ n: 'w1Mushroom', x: 1100, b: 900 }, { n: 'w1Mushroom', x: 1500, b: 900 }, { n: 'w1Fern', x: 1100, b: 860 }] } };
  const b = dressThroughPlatform(st);
  assert.equal(b.length, 1, JSON.stringify(b));
  assert.equal(b[0].x, 1100);
});

test('a dressing piece on the exit door is moved off it along its surface, away from the door (planted); one clear of it stays', async () => {
  const { placeDress } = await import('../protoStage.ts');
  const { dressOverDoor } = await import('./propSupport.ts');
  const st: any = { spawnX: 100, spawnY: 900, exitTotemX: 1500, exitTotemY: 900, platforms: [{ id: 1, x: 0, y: 900, width: 2000, height: 200, type: 'solid', style: 'moss_stone' }], proto: {} };
  const ds = [{ n: 'w1Fern', x: 1520, b: 900 }, { n: 'w1Fern', x: 800, b: 900 }];
  assert.equal(dressOverDoor({ ...st, proto: { dress: ds.map((d) => ({ ...d })) } }).length, 1);
  const { kept, dropped } = placeDress(ds, st);
  assert.deepEqual(dropped, []);
  assert.equal(kept.find((d) => d.x === 800)?.x, 800);
  assert.ok(kept.some((d) => d.x > 1520), 'moved to the right, away from the door');
  assert.deepEqual(dressOverDoor({ ...st, proto: { dress: kept } }), []);
});
