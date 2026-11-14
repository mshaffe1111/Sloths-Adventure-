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
