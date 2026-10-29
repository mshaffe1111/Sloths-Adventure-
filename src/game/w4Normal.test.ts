/**
 * World 4 on Normal (LV-2, w4Normal.ts): the Sovereign quicker, the gusts stronger, the rocks more often, but never at a stage's first of
 * a kind, never past the level check's own limits, every rock still warned, and Easy untouched (it is never run for Easy).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { w4Normal, W4_NORMAL } from './w4Normal.ts';
import { validateStage } from './levelCheck.ts';
import { idleTime } from './zones.ts';
import { WATCH } from './watcher.ts';

const levels = generateAllLevels();
const build = (id: string, s: number) => {
  const c = levels.find((l) => l.id === id)!;
  return buildProtoStage({ ...c, unlocked: true }, s, HAND_STAGES[id]);
};

test('World 4 on Normal: quicker Sovereign, stronger gusts, rocks more often; the first of each kind as it was taught', () => {
  for (const id of ['4-2', '4-5', '4-6', '4-9']) {
    for (const s of [1, 2]) {
      const before = build(id, s);
      const st = w4Normal(build(id, s));
      const watch = [...(st.proto.watch ?? [])].sort((a, b) => a.x0 - b.x0);
      if (watch.length) {
        assert.equal(watch[0].warn, undefined, `${id}: the first stretch keeps WATCH's ${WATCH.warn} s`);
        for (const z of watch.slice(1)) assert.deepEqual([z.warn, z.pass], [W4_NORMAL.warn, W4_NORMAL.pass]);
      }
      const gusts = (st.zones ?? []).filter((z) => z.kind === 'wind').sort((a, b) => a.x0 - b.x0);
      const was = (before.zones ?? []).filter((z) => z.kind === 'wind').sort((a, b) => a.x0 - b.x0);
      gusts.forEach((z, i) => {
        if (i === 0) assert.equal(z.force, was[0].force, `${id}: the first gust as taught`);
        assert.ok(z.force <= 160 && idleTime(z) > 2, `${id}: within the level check's limits`);
      });
      // (the rocks it had, matched by place: the pairs below may add more)
      const rocks = st.proto.w4?.rocks ?? [];
      const r0 = [...(before.proto.w4?.rocks ?? [])].sort((a, b) => a.x - b.x);
      r0.forEach((w, i) => {
        const r = rocks.find((q) => q.x === w.x && q.land === w.land)!;
        assert.ok(r, `${id}: rock at ${w.x} still there`);
        assert.equal(r.warn, w.warn, `${id}: every rock keeps its warning`);
        if (i === 0) assert.equal(r.every, w.every, `${id}: the first rock as taught`);
        else assert.ok(r.every <= w.every, `${id}: rocks more often`);
      });
      for (const r of rocks) assert.ok(r.warn >= 1.4, `${id}: every rock warned`);
      assert.ok(validateStage(st).errors.length <= validateStage(before).errors.length, `${id} roll ${s}: nothing new for the level check`);
    }
  }
});

test('taught moves together (option A): gusts over the plain jumps of 4-2, rocks over the landings of 4-8, in each second half', () => {
  for (const [id, kind] of [['4-2', 'gusts'], ['4-8', 'rocks']] as const) {
    let added = 0;
    for (const s of [1, 2, 3, 4, 5]) {
      const before = build(id, s);
      const st = w4Normal(build(id, s));
      const half = (st.spawnX + st.exitTotemX) / 2;
      const zs = (st.zones ?? []).slice((before.zones ?? []).length);
      const rs = (st.proto.w4?.rocks ?? []).slice((before.proto.w4?.rocks ?? []).length);
      for (const z of zs) assert.ok(z.kind === 'wind' && z.x0 > half - 200, `${id}: a gust in the second half`);
      for (const r of rs) assert.ok(r.x > half && r.warn >= 1.4 && !r.air, `${id}: a warned rock on a landing in the second half`);
      added += kind === 'gusts' ? zs.length : rs.length;
      assert.ok(validateStage(st).errors.length <= validateStage(before).errors.length, `${id} roll ${s}`);
    }
    assert.ok(added >= 3, `${id}: ${added} ${kind} over five rolls`);
  }
});

test('outside World 4 the pass changes nothing', () => {
  const st = build('3-2', 1);
  const json = JSON.stringify(st);
  assert.equal(JSON.stringify(w4Normal(st)), json);
});
