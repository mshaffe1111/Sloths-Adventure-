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
  const { listedStage, playFinish } = await import('../../src/game/gen2/listed.ts');
  const { w1Finish } = await import('../../src/game/gen2/worlds/w1.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { provenSeeds } = await import('../../src/game/gen2/seedList.ts');
  const { FIRST_RUN_11 } = await import('../../src/game/gen2/firstRun11.ts');
  const { helpRoomBreaches, quietJudge } = await import('./listRules.ts');
  const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
  const lay = (seed: number, difficulty: 'normal' | 'easy') => buildGen2Stage({ config: cfg, kit: listedStage('1-1')!.kit(), seed, difficulty, also: quietJudge(cfg, (st, d) => playFinish(listedStage('1-1')!, st, d)) });
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

// ENG-CL (7), BUILD-18 8:34 PM 11-14: the quiet line could not see a chase. findBeats knew only the hand-built chase (proto.chase), not a
// LAID one (stage.chase) or its rolling nuts and fruit (stage.rolling), and the judge measured the roll before its finish, so 1-8's K3
// read "18.2 s with nothing to do" on every Normal roll. Planted on the dev fixture (chaseFixtureStage.ts), seed 2: 10.8 s of "nothing"
// inside its first stretch before the fix.
test('the quiet line sees a laid chase: each stretch and each rolling nut and fruit a beat, judged on the roll as its finish lays it', async () => {
  await import('../../src/game/headlessDom.ts');
  const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
  const { buildChaseFixtureStage, chaseFixtureKit, chaseFixtureLevel, CHASE_FIXTURE_CODE } = await import('../../src/game/chaseFixtureStage.ts');
  const { quietJudge, quietOf } = await import('./listRules.ts');
  const { pickRoute } = await import('../inspect/eraRoll.ts');
  const { deadTime, NORMAL_GAP } = await import('../inspect/analyze.ts');
  const { withGoals } = await import('../../src/game/goals.ts');
  const { rollMeetX } = await import('../../src/game/rolling.ts');
  const { QUIET_MAX } = await import('../../src/game/gen2/seedList.ts');
  const cfg = chaseFixtureLevel();
  const seed = 2;
  // (a) the fixture as the page plays it: every stretch has its pressure beats, every hazard the route meets is a beat where it meets
  // him, and no quiet stretch inside a stretch runs over the line
  const st = buildChaseFixtureStage(cfg, seed, 'normal') as never as Parameters<typeof quietOf>[1];
  const lay = (st as unknown as { chase: { stretches: Array<{ start: number; end: number }> } }).chase;
  const rolling = (st as unknown as { rolling: Array<Parameters<typeof rollMeetX>[0]> }).rolling;
  assert.ok(lay.stretches.length >= 2 && rolling.length >= 4, `the fixture lays a chase (${lay.stretches.length} stretches) and hazards (${rolling.length})`);
  const R = pickRoute(cfg.objectiveType, withGoals({ ...st } as never) as never).used;
  const beats = R.br.beats;
  for (const s of lay.stretches) assert.ok(beats.some((b) => b.what.startsWith('the branch collapses') && b.x >= s.start && b.x <= s.end), `a pressure beat on the stretch ${s.start}-${s.end}`);
  for (const h of rolling) {
    const what = h.kind === 'low' ? 'a rolling nut: hop it' : 'a bouncing fruit: run on under it';
    assert.ok(beats.some((b) => b.what === what && b.x >= rollMeetX(h) - 24 && b.x <= h.dropX), `${h.kind} at ${h.dropX}: a beat where it meets him (from ${Math.round(rollMeetX(h))})`);
  }
  for (const d of deadTime(beats, R.br.total, NORMAL_GAP, R.samples).list) {
    const mid = (d.x0 + d.x1) / 2;
    if (lay.stretches.some((s) => mid >= s.start && mid <= s.end)) assert.ok(d.sec <= QUIET_MAX, `${d.sec.toFixed(1)} s of "nothing" at x ${Math.round(mid)}, inside a stretch`);
  }
  // (b) the judge measures the roll as its finish lays it, on a copy: the bare roll (its chase, no hazards: a finish lays them) is over
  // the line until a finish that lays a nut each 300 px is handed to it; the search's own build keeps no hazard of the finish's
  // (a line of 2 s: the bare roll's own longest stretch is under 4)
  const bare = buildGen2Stage({ config: { ...cfg, id: '1-1' }, kit: chaseFixtureKit(CHASE_FIXTURE_CODE, '1-1'), seed, difficulty: 'normal' });
  const line = 2;
  assert.ok(quietOf(cfg, bare).quiet > line, `the bare roll is over a ${line} s line (${quietOf(cfg, bare).quiet} s)`);
  const x1 = Math.max(...bare.platforms.map((p) => p.x + p.width));
  const finish = (s: typeof bare) => {
    (s as unknown as { rolling: unknown[] }).rolling = Array.from({ length: Math.floor(x1 / 300) }, (_, i) => ({ kind: 'low', dropX: 600 + i * 300, speed: 140, bounce: 8 }));
    return s;
  };
  assert.equal(quietJudge(cfg, undefined, line)(bare, 'normal').length, 1, 'no finish: the judge refuses the bare roll');
  assert.deepEqual(quietJudge(cfg, finish, line)(bare, 'normal'), [], `its finish handed over, the hazards are beats (${quietOf(cfg, bare, finish).quiet} s)`);
  assert.equal((bare as unknown as { rolling?: unknown }).rolling, undefined, 'the judge worked on a copy');
});
