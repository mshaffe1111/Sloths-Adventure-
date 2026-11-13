// The seed-list tool takes ANY listed stage (packet E12 item 1, D43): it reads the listed-stage table (src/game/gen2/listed.ts), holds no
// stage id of its own, fails a listed stage with no list BY NAME (never by a throw), and still exits 2 by name for an id with no row.
// The slow proof, 1-1's whole list, is the gate itself: `npx tsx tools/engine/seedlist.ts 1-1 --check`.
//   npx tsx --test tools/engine/seedlist.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { searchYield } from './yield.ts';

const run = (...args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'tools/engine/seedlist.ts', ...args], { encoding: 'utf8' });

test('a listed stage with no list yet fails --check by name, not by a throw (1-2 today)', () => {
  const r = run('1-2', '--check');
  assert.equal(r.status, 1, r.stderr);
  assert.match(r.stdout, /seedlist 1-2: FAIL\n {2}1-2: 0 proven seeds, under \d+/);
  assert.doesNotMatch(r.stdout + r.stderr, /Error|at .*\.ts:\d+/, 'no throw');
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
