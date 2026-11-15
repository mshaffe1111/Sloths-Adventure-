// R-165.251 (TOOLS-2 11-14): every per-setting engine dial (settingDials.ts; today the swing, physics setTimedSwing) is set by ONE
// helper, and every build entry builds on its own setting's dials whoever calls it. TOOLS-1 found the tools building Easy on Normal's
// swing (seedlist.ts, lockall.ts: only the engine set it), so an Easy list could prove a stage no phone builds (a D19 case).
// Planted: each build entry is watched from inside (a config read, a stage read, the pipeline's own `also` rule) with the caller's dials
// at the OTHER setting, as a tool's are; on the code before this change every one of them saw the caller's dials (red), now its own.
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { applySetting, dialsSetting, withSetting } from './settingDials.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';
import { generateAllLevels } from './worldsData.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { listedStage } from './gen2/listed.ts';
import type { Difficulty } from './difficulty.ts';
import type { LevelConfig } from './types.ts';

const cfgOf = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/** a config that writes down the dials each time the build reads it (the build reads its config from start to end) */
function watched(c: LevelConfig, seen: Array<Difficulty | null>): LevelConfig {
  return new Proxy(c, { get(t, k, r) { seen.push(dialsSetting()); return Reflect.get(t, k, r); } });
}
const other = (d: Difficulty): Difficulty => (d === 'easy' ? 'normal' : 'easy');

test('R-165.251: the helper sets the swing for each setting and puts the caller\'s dials back', () => {
  applySetting('normal');
  assert.equal(dialsSetting(), 'normal');
  assert.equal(withSetting('easy', () => dialsSetting()), 'easy');
  assert.equal(dialsSetting(), 'normal', 'withSetting puts the dials back');
  applySetting('easy');
  assert.equal(withSetting('normal', () => dialsSetting()), 'normal');
  assert.equal(dialsSetting(), 'easy');
  assert.throws(() => withSetting('normal', () => { throw new Error('x'); }));
  assert.equal(dialsSetting(), 'easy', 'put back after a throw too');
  applySetting('normal');
});

// (1-7 a listed World 1 stage with lianas, 7-2 a gen2 world rolled with no list, 2-1 an old-generator stage: each path of generateStage)
for (const id of ['1-7', '7-2', '2-1']) for (const d of ['easy', 'normal'] as const) {
  test(`R-165.251: generateStage builds ${id} ${d} on ${d}'s dials while the caller's stand at ${other(d)} (a tool's)`, () => {
    applySetting(other(d));
    const seen: Array<Difficulty | null> = [];
    setLayoutVariant(1);
    try { generateStage(watched(cfgOf(id), seen), d); } finally { setLayoutVariant(null); }
    assert.ok(seen.length > 0, 'the build read its config');
    assert.deepEqual([...new Set(seen)], [d], `every read of the config during the build saw ${d}'s dials`);
    assert.equal(dialsSetting(), other(d), "and the caller's dials are put back");
    applySetting('normal');
  });
}

test("R-165.251: easyStage makes a stage gentler on Easy's dials while the caller's stand at Normal", () => {
  applySetting('normal');
  setLayoutVariant(2);
  let st;
  try { st = withGoals(generateStage(cfgOf('2-1'), 'easy')); } finally { setLayoutVariant(null); }
  const seen: Array<Difficulty | null> = [];
  const spy = new Proxy(st, { get(t, k, r) { seen.push(dialsSetting()); return Reflect.get(t, k, r); } });
  easyStage(spy);
  assert.ok(seen.length > 0);
  assert.deepEqual([...new Set(seen)], ['easy']);
  assert.equal(dialsSetting(), 'normal');
});

for (const d of ['easy', 'normal'] as const) {
  test(`R-165.251: buildGen2Stage (the seed list's own build) judges 1-7 ${d} on ${d}'s dials while the caller's stand at ${other(d)}`, () => {
    applySetting(other(d));
    const row = listedStage('1-7')!;
    const seen: Array<[Difficulty, Difficulty | null]> = [];
    buildGen2Stage({ config: cfgOf('1-7'), kit: row.kit(), seed: 1, difficulty: d, also: (_st, dd) => { seen.push([dd, dialsSetting()]); return []; } });
    const own = seen.filter(([dd]) => dd === d);
    assert.ok(own.length > 0, "the pipeline asked the caller's rule on the build's own setting");
    assert.deepEqual(own.map(([, s]) => s), own.map(() => d));
    assert.equal(dialsSetting(), other(d));
    applySetting('normal');
  });
}

test('R-165.251: the stage a tool builds for Easy (lockall, its dials at Normal) is the one the engine builds (its dials at Easy)', () => {
  const c = cfgOf('1-7');
  const build = (dials: Difficulty) => {
    applySetting(dials);
    setLayoutVariant(3);
    try { return JSON.stringify(easyStage(withGoals(generateStage(c, 'easy')))); } finally { setLayoutVariant(null); applySetting('normal'); }
  };
  assert.equal(build('normal'), build('easy'));
});

test('R-165.251: ONE helper sets the dials: no setTimedSwing call outside settingDials.ts (and the tests), in src/ or tools/', () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const bad: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx|mjs|js)$/.test(e.name) && !/\.test\.ts$/.test(e.name)) {
        const rel = path.relative(root, p);
        if (rel === 'src/game/settingDials.ts') continue;
        fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
          if (/setTimedSwing\(/.test(l) && !/export function setTimedSwing/.test(l) && !/^\s*(\*|\/\/)/.test(l)) bad.push(`${rel}:${i + 1}`);
        });
      }
    }
  };
  walk(path.join(root, 'src'));
  walk(path.join(root, 'tools'));
  assert.deepEqual(bad, [], 'set the dials with settingDials.ts applySetting / withSetting');
});

// (the layouts the validator passed are kept by the dials too, stageGenerator.ts variantAttemptFor: on the code before, a process that
// built 10-6 layout 1 on Normal first handed Normal's pick to Easy, so a tool building both settings, or a phone that switched setting,
// got another Easy stage than a fresh phone; on base 11-14 so did 9-3 layouts 4 and 14, 9-4 layout 12 and 10-6 layouts 6 and 10)
test('R-165.251: Easy built after Normal in one process is the Easy a fresh phone builds (10-6 layout 1)', async () => {
  const { spawnSync } = await import('node:child_process');
  const os = await import('node:os');
  const root = path.resolve(import.meta.dirname, '../..');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dials-')), 'order.mts');
  fs.writeFileSync(file, `
import ${JSON.stringify(path.join(root, 'src/game/headlessDom.ts'))};
import { createHash } from 'node:crypto';
const { generateAllLevels } = await import(${JSON.stringify(path.join(root, 'src/game/worldsData.ts'))});
const { generateStage, setLayoutVariant } = await import(${JSON.stringify(path.join(root, 'src/game/stageGenerator.ts'))});
const { easyStage } = await import(${JSON.stringify(path.join(root, 'src/game/easyMode.ts'))});
const { withGoals } = await import(${JSON.stringify(path.join(root, 'src/game/goals.ts'))});
const c = { ...generateAllLevels().find((l) => l.id === '10-6'), unlocked: true };
for (const d of process.argv[2].split(',')) {
  setLayoutVariant(1);
  const st = d === 'easy' ? easyStage(withGoals(generateStage(c, 'easy'))) : withGoals(generateStage(c, 'normal'));
  setLayoutVariant(null);
  if (d === 'easy') console.log(createHash('sha256').update(JSON.stringify([st.config.levelWidth, st.platforms, st.vines, st.enemies, st.collectibles])).digest('hex'));
}
`);
  const run = (order: string) => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', file, order], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  assert.equal(run('normal,easy'), run('easy'));
});

// R-165.258 (TOOLS-2 11-14, the lead's ruling): an Easy gen2 build first builds Normal's plan, then lays Easy from it ("Easy is Normal's
// stage under Easy's rules", pipeline buildRolled). That Normal build ran on the CALLER's dials (a phone's are Easy's, the engine sets
// them first), so Easy's swing re-planned Normal: on 8-5 a swing section moved and Easy lost its only tayra (easyMode.test.ts "keeps a
// tayra" passed only while the tests built Easy on Normal's swing). And Normal's own search checked Easy's lay on Normal's swing. Every
// lay and check now runs on its own setting's dials. Planted: on the code before, both 8-5 tests were red; 6-1, 7-5 and 8-3 (whose
// Easy also moved, but not its plan) are guards, green before and after.
const plan = (st: unknown) => (st as { gen2: { plan: Array<{ template: string }> } }).gen2.plan.map((p) => p.template);
const kinds = (st: { enemies: Array<{ type: string }> }) => [...new Set(st.enemies.map((e) => e.type))].sort();
test("R-165.258: 8-5 lays its tayra on Easy as on Normal, built as a phone builds each (the engine's dials set first)", () => {
  const c = cfgOf('8-5');
  applySetting('easy');
  const e = generateStage(c, 'easy');
  applySetting('normal');
  const n = generateStage(c, 'normal');
  assert.deepEqual(kinds(n), ['tayra']);
  assert.deepEqual(kinds(e), kinds(n), '8-5 Easy keeps every kind Normal lays');
  assert.deepEqual(plan(e), plan(n), "and lays Normal's plan");
});
for (const id of ['8-5', '6-1', '7-5', '8-3']) {
  test(`R-165.258: ${id} Easy lays Normal's plan and only Normal's kinds of animal, whatever the caller's dials (layouts 1-2)`, () => {
    const c = cfgOf(id);
    for (const v of [1, 2]) for (const dials of ['easy', 'normal'] as const) {
      applySetting(dials);
      setLayoutVariant(v);
      try {
        const n = generateStage(c, 'normal');
        const e = generateStage(c, 'easy');
        assert.deepEqual(plan(e), plan(n), `${id} layout ${v} (dials at ${dials}): Easy's plan is Normal's`);
        for (const t of kinds(e)) assert.ok(kinds(n).includes(t), `${id} layout ${v}: Easy's ${t} is one of Normal's`);
      } finally {
        setLayoutVariant(null);
        applySetting('normal');
      }
    }
  });
}
