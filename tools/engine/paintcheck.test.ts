// R-165.330 planted: paintcheck never passes having checked nothing. '--part 3/3' (parts are 0-based) once built 0 stages and PASSED
// (ENG-25d, 11-19); a --stages id that is no stage, and a stage with 0 builds, checked nothing the same way. Each is RED before the fix.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const run = (...a: string[]) => {
  const r = spawnSync('npx', ['tsx', 'tools/engine/paintcheck.ts', ...a], { encoding: 'utf8', timeout: 120_000 });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
};

test('a part out of range fails (parts are 0-based: 3/3 is no part)', () => {
  const r = run('--part', '3/3');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /paintcheck: FAIL, --part 3\/3 is not a part/);
});

test('a --stages id that is no stage fails: checked nothing', () => {
  const r = run('--stages', 'no-such-stage', '--part', '1/3');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /stages per part 0\/3: 0, 1\/3: 0, 2\/3: 0/);
  assert.match(r.out, /paintcheck: FAIL, checked nothing: 0 builds/);
});

test('a stage with 0 builds fails (an unlisted stage on 0 layouts)', () => {
  const r = run('--stages', '3-1', '--layouts', '0');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /EMPTY: 3-1 had 0 builds/);
  assert.doesNotMatch(r.out, /paintcheck: PASS/);
});
