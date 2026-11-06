// E3: logs on stumps (the designer's 12:52 ruling (a), ENGINE-SPEC 3951b0f9f) and every trunk's foot, on every stage the engine builds
// from its spec, 16 layouts x Normal and Easy:
//   1. a log on a stump is thin (the kit's stumpLog height) and its stump meets the log's underside;
//   2. every trunk (a stump, a kapok, a post) stands on the first ground under its piece (a bank, a stone, the floor or a creek's water; it passes behind logs and boughs) and
//      never runs on down through one; the surface's drawn body (terrain.ts footingOf) reaches its foot;
//   3. (the stumps draw in the trunk layer, protoArt.ts drawProtoScene's deco trunks, before the hero: engine.ts draw order, by
//      construction; seen in the stills);
//   4. every soft pit has a way out (w1Pits.test's vault-pit rule) on every layout, not layout 1 alone.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { findW1Pits, SUNK_STEP } from '../w1Pits.ts';
import { footingsFor } from '../terrain.ts';
import { fitTrunks } from '../protoArt.ts';
import { trunkGround } from '../trunkFit.ts';
import { SPECS } from './stages.ts';
import { kitFor } from './kits.ts';
import type { Platform } from '../types.ts';

const builds = () => {
  const levels = generateAllLevels();
  const out: Array<{ name: string; st: any; world: number }> = [];
  for (const { id } of SPECS) {
    const c = levels.find((l) => l.id === id)!;
    for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
      setLayoutVariant(v);
      const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
      setLayoutVariant(null);
      out.push({ name: `${id} ${setting} layout ${v}`, st, world: c.worldIndex });
    }
  }
  return out;
};
const all = builds();

test('a log on a stump is thin and its stump meets its underside (conditions 1)', () => {
  const bad: string[] = [];
  let n = 0;
  for (const { name, st, world } of all) {
    const thin = kitFor(world).heights.stumpLog;
    for (const p of st.platforms as Array<Platform & { stump?: boolean }>) {
      if (!p.stump) continue;
      n++;
      if (p.height !== thin) bad.push(`${name}: log ${p.id} at x ${p.x} is ${p.height} px, not ${thin}`);
      const mid = p.x + p.width / 2, under = p.y + p.height;
      const t = (st.proto.trunks ?? []).find((q: any) => Math.abs(q.x - mid) <= 1 && q.topY <= under && q.topY >= under - 8);
      if (!t) bad.push(`${name}: log ${p.id} at x ${p.x}: no stump meets its underside (${under})`);
    }
  }
  assert.ok(n > 0, 'no log on a stump was laid: the test reads nothing');
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} breaches`);
});

// (as drawn: the draw fits every trunk to the pieces really there (protoArt.ts fitTrunks), which on Easy include what Easy's own pass
// widens or adds after the mixer (easyMode.ts); on Normal the mixer's own trunks must already be exactly what is drawn)
test('every trunk stands on the first ground under it, inside that surface\'s drawn body, and Normal\'s are drawn as laid (condition 2)', () => {
  const bad: string[] = [];
  for (const { name, st, world } of all) {
    const foot = footingsFor(st, world);
    const water = st.proto.water ?? [];
    const drawn = fitTrunks(st.proto.trunks ?? [], st.platforms, water);
    if (name.includes('normal')) {
      const moved = (st.proto.trunks ?? []).filter((t: any) => !drawn.some((d) => d.x === t.x && d.topY === t.topY && d.bottomY === t.bottomY));
      for (const t of moved.slice(0, 2)) bad.push(`${name}: trunk at x ${t.x} (${t.topY}-${t.bottomY}) is not drawn as laid`);
    }
    for (const t of drawn) {
      const at = (q: Platform) => t.x >= q.x - 2 && t.x <= q.x + q.width + 2 && q.type !== 'bouncy' && !q.broken;
      // (the piece it holds: its body is at the trunk's piece, holdY (a crowned tree rises over its bough) or its top)
      const from = t.holdY ?? t.topY;
      const held = (st.platforms as Platform[]).filter((q) => at(q) && q.y <= from + 4 && q.y + q.height >= from - 4);
      // (the first GROUND under it: a bank, a stone or the floor; it passes behind a log or a bough (trunkFit.ts trunkGround))
      const under = (st.platforms as Platform[]).filter((q) => at(q) && !held.includes(q) && trunkGround(q) && q.y > from + 8);
      const tops = [...under.map((q) => ({ y: q.y, q: q as Platform | null })), ...water.filter((z: any) => t.x > z.x0 && t.x < z.x1 && z.y > from + 8).map((z: any) => ({ y: z.y, q: null }))];
      if (!tops.length) continue;
      const first = tops.reduce((a, b) => (b.y < a.y ? b : a));
      // (its foot a few px into the first surface: never short of it, never on through it)
      if (t.bottomY < first.y || t.bottomY > first.y + 12) bad.push(`${name}: trunk at x ${t.x} (${t.topY}-${t.bottomY}): the first surface under it is at ${first.y}`);
      else if (first.q) {
        const f = foot.get(first.q.id);
        if (f && f.bodyBottom < t.bottomY) bad.push(`${name}: trunk at x ${t.x}: its foot (${t.bottomY}) is under the drawn body of piece ${first.q.id} (${f.drawn}, to ${f.bodyBottom})`);
      }
    }
  }
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} breaches`);
});

test('every soft pit has a way out, every layout (condition 4: the vault-pit rule on 16 layouts)', () => {
  const bad: string[] = [];
  for (const { name, st } of all) {
    for (const q of findW1Pits(st.platforms).filter((g) => g.kind === 'soft')) if (!(q.steps ?? []).length && q.floor! - q.top > SUNK_STEP) bad.push(`${name}: soft pit at x ${q.x0}, floor ${q.floor} under a lip at ${q.top}, no step out`);
  }
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} breaches`);
});
