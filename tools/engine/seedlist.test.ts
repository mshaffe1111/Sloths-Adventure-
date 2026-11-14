// The seed-list tool takes ANY listed stage (packet E12 item 1, D43): it reads the listed-stage table (src/game/gen2/listed.ts), holds no
// stage id of its own, fails a listed stage with no list BY NAME (never by a throw), and still exits 2 by name for an id with no row.
// The slow proof, 1-1's whole list, is the gate itself: `npx tsx tools/engine/seedlist.ts 1-1 --check`.
//   npx tsx --test tools/engine/seedlist.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { searchYield } from './yield.ts';

const run = (...args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'tools/engine/seedlist.ts', ...args], { encoding: 'utf8' });

test('a listed stage with no list yet fails --check by name, not by a throw (a list taken out of the index, in a scratch worktree)', () => {
  // (every stage-table row holds a list now: registrycheck.ts fails one that does not, ADD-LEVEL 11-13. A stage between its row and its
  // list is still real (addlevel.ts step 3), so the check runs on a scratch worktree of HEAD with one list's line taken out of the index)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seedlist-nolist-'));
  const wt = path.join(dir, 'wt');
  try {
    const add = spawnSync('git', ['worktree', 'add', '--detach', '-q', wt, 'HEAD'], { encoding: 'utf8' });
    assert.equal(add.status, 0, add.stderr);
    fs.symlinkSync(path.resolve('node_modules'), path.join(wt, 'node_modules'));
    const ix = path.join(wt, 'src/game/gen2/provenIndex.ts');
    const lines = fs.readFileSync(ix, 'utf8').split('\n');
    const line = lines.find((l) => /^\s*'[^']+': \{ n: \d+/.test(l))!;
    const id = line.match(/'([^']+)'/)![1];
    fs.writeFileSync(ix, lines.filter((l) => l !== line).join('\n'));
    const r = spawnSync(process.execPath, ['--import', 'tsx', 'tools/engine/seedlist.ts', id, '--check'], { encoding: 'utf8', cwd: wt });
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stdout, new RegExp(`seedlist ${id}: FAIL\\n {2}${id}: 0 proven seeds, under \\d+`));
    assert.doesNotMatch(r.stdout + r.stderr, /Error|at .*\.ts:\d+/, 'no throw');
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', wt]);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('an id with no row exits 2, by name', () => {
  const r = run('9-9', '--check');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /seedlist: no listed stage "9-9" \(src\/game\/gen2\/listed\.ts\)/);
  const y = spawnSync(process.execPath, ['--import', 'tsx', 'tools/engine/yield.ts', '9-9'], { encoding: 'utf8' });
  assert.equal(y.status, 2);
  assert.match(y.stderr, /yield: no listed stage "9-9" \(src\/game\/gen2\/listed\.ts\)/);
});

test('neither tool holds a stage id or a table of its own: both read the listed-stage table', () => {
  for (const f of ['tools/engine/seedlist.ts', 'tools/engine/yield.ts']) {
    const code = fs.readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    assert.doesNotMatch(code, /['"`]\d-\d['"`]/, `${f}: a stage id literal`);
    assert.doesNotMatch(code, /\bKITS\b|w1World/, `${f}: its own kit table`);
    assert.match(code, /listedStage\(/, `${f}: reads the table`);
  }
});

test('searchYield: per graph, seeds tried and kept, and how many each refusing rule refused (a roll once per rule)', () => {
  const V19B = 'V19b: the end log at y 865 is not above y 657, where the bough window begins (x 23126)';
  const V19B2 = 'V19b: the end log at y 876 is not above y 607, where the bough window begins (x 24629)';
  const UNMARKED = 'verdict floor.unmarked (normal): an unmarked floorless gap at x 25890..25933';
  const lines = searchYield([
    { graph: 'g2', refused: [] },
    { graph: 'g1', refused: [V19B, V19B2, UNMARKED] },
    { graph: 'g1', refused: [UNMARKED] },
    { graph: 'g1', refused: [] },
    { graph: 'g1', refused: ['the quiet line'] },
  ]);
  assert.deepEqual(lines, [
    '  yield, graph g1: 1 kept of 4 fresh seeds tried (25%); refused by: verdict floor.unmarked 2, the quiet line 1, V19b: the end is not above the bough window 1',
    '  yield, graph g2: 1 kept of 1 fresh seeds tried (100%)',
  ]);
  assert.deepEqual(searchYield([]), []);
});

// (POLISH-9b, R-165.228, the lead's ruling 8:21 AM 11-14: the list's judge and the relay test's (b) disagreed, so POLISH-7's relist
// listed 4 Easy 1-1 layouts with a rise the help ladder had no room for. The rule is now the judge's own: listRules.ts helpRoomBreaches,
// ONE definition with the test, src/game/gen2/helpRoom.ts)
test('room for help is the list judge\'s own rule: planted on 1-1 seed 33825 Easy, as the list\'s search lays it (dropped by the relist that added it)', async () => {
  await import('../../src/game/headlessDom.ts');
  const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
  const { listedStage } = await import('../../src/game/gen2/listed.ts');
  const { w1Finish } = await import('../../src/game/gen2/worlds/w1.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { provenSeeds } = await import('../../src/game/gen2/seedList.ts');
  const { FIRST_RUN_11 } = await import('../../src/game/gen2/firstRun11.ts');
  const { helpRoomBreaches, quietJudge } = await import('./listRules.ts');
  const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
  const lay = (seed: number, difficulty: 'normal' | 'easy') => buildGen2Stage({ config: cfg, kit: listedStage('1-1')!.kit(), seed, difficulty, also: quietJudge(cfg) });
  // (the planted roll: the search with the list's own quiet rule lays it as POLISH-7's relist listed it, 4 rerolls, seed 34161101)
  const bad = lay(33825, 'easy');
  assert.equal(bad.gen2.seed, 34161101, 'the roll POLISH-7 listed');
  const lines = helpRoomBreaches(bad, 'easy', w1Finish as never);
  assert.ok(lines.some((l) => /rise at x 26674, 221 px \(thin\): room 17 px of 320/.test(l)), lines.join('; '));
  assert.deepEqual(helpRoomBreaches(lay(33825, 'normal'), 'normal', w1Finish as never), [], 'Normal has the room');
  assert.ok(!provenSeeds('1-1').includes(33825), 'and it is no longer listed');
  // (the first run, as listed, has room on both settings)
  for (const d of ['normal', 'easy'] as const) assert.deepEqual(helpRoomBreaches(lay(FIRST_RUN_11.seed, d), d, w1Finish as never), [], `first run ${d}`);
});
