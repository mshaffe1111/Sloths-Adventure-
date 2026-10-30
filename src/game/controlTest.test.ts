import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { reachJump } from './physics.ts';
import { maxRise } from './protoCheck.ts';
import { ctestEnabled, qaBuild } from './playRecorder.ts';
import { validateStage } from './levelCheck.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 2, id: '1-2', name: 'Control test', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;

test('control test: off unless the address asks for it (#ctest or ?ctest=1), and then on in any build, the live site too', () => {
  assert.equal(ctestEnabled(), false);
  assert.equal(qaBuild(), false);
  const g = globalThis as unknown as { location?: unknown };
  const was = g.location;
  g.location = { hash: '#ctest', search: '' };
  assert.equal(ctestEnabled(), true, 'the testers\' link opens it on the live site');
  g.location = { hash: '', search: '?level=1-2' };
  assert.equal(ctestEnabled(), false, 'the full game is unaffected');
  g.location = was;
});

const SEEDS = Array.from({ length: 40 }, (_, i) => 1 + i * 7919);

test('control test: the basics every run, then six stretches (two moving, two fighting, two other), a flag after each, one exit', () => {
  const seen = new Set<string>();
  const bad: string[] = [];
  for (const s of SEEDS) {
    const a = buildProtoStage(cfg, s, 'ctest');
    assert.equal(JSON.stringify(buildProtoStage(cfg, s, 'ctest')), JSON.stringify(a), 'the same seed builds the same run');
    const names = a.proto.beats.map((b) => b[2]);
    assert.deepEqual(names.slice(0, 3), ['Run and stop', 'Short hops', 'Long jumps']);
    assert.equal(names[names.length - 1], 'Finish');
    assert.equal(names.length, 10, names.join(', '));
    names.slice(3, 9).forEach((n) => seen.add(n));
    assert.ok(a.proto.mix?.includes(String(s)), 'the mix names its seed');
    assert.deepEqual(a.proto.grant, ['shimmy']);
    assert.equal(a.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.ok((a.checkpoints ?? []).length >= 9, `seed ${s}: a flag after every stretch`);
    assert.equal(a.collectibles.filter((c) => c.type === 'seed' || c.type === 'find').length, 0, 'no secrets in a test');
    assert.ok(a.platforms.every((p) => p.y <= 720), 'every floor is above the water');
    // every river in a test is safe: a splash puts him back on the bank
    assert.ok((a.rivers ?? []).every((r) => r.safe), `seed ${s}: safe water`);
    // (checked with every move the test allows: the second jump, and the rope it lends)
    // (the checker cannot push the log: check that stretch with the log already pushed against the wall)
    const pushed = a.platforms.map((p) => (p.push ? { ...p, x: p.push.max - p.width } : p));
    const res = validateStage({ ...a, platforms: pushed, config: { ...a.config, miniIndex: 9 } });
    // (and flowers on the floor the pushed log now covers are picked up on the way to it)
    const logIds = new Set(a.platforms.filter((p) => p.push).map((p) => `platform ${p.id}`));
    res.errors = res.errors.filter((e) => ![...logIds].some((id) => e.endsWith(id)));
    res.ok = res.errors.length === 0;
    if (!res.ok || a.proto.movedPickups) bad.push(`${a.proto.mix} moved ${a.proto.movedPickups}: ${res.errors.join('; ')}`);
  }
  assert.equal(bad.length, 0, bad.join('\n'));
  // across forty runs, every stretch turns up
  assert.equal(seen.size, 20, [...seen].join(', '));
});

test('control test: the long jumps get wider, and the last two need the second jump but can be made with it', () => {
  const a = buildProtoStage(cfg, 7, 'ctest');
  const [x0, x1] = a.proto.beats[2];
  // the ground banks in the long-jump stretch, left to right: the gaps are the spaces between them
  const banks = a.platforms.filter((p) => p.y === G && p.x + p.width > x0 && p.x < x1).sort((p, q) => p.x - q.x);
  const gaps = banks.slice(1).map((b, i) => b.x - (banks[i].x + banks[i].width));
  assert.equal(gaps.length, 4, `gaps ${gaps}`);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] > gaps[i - 1], `gaps ${gaps}`);
  const one = reachJump(0, false), two = reachJump(0, true);
  assert.ok(gaps[0] < one * 0.6 && gaps[2] > one && gaps[3] < two * 0.9, `gaps ${gaps}, reach ${one} / ${two}`);
  // and from the moss below each gap, a double jump climbs back out
  assert.ok(720 - G - 10 < maxRise() + 26);
});

test("control test, Easy: the long jumps are sized to Easy's own jump (Matt, 2026-10-29), Normal's stay; a flag before each double-jump gap", async () => {
  const { reachJumpHeld } = await import('./physics.ts');
  const gapsOf = (a: ReturnType<typeof buildProtoStage>) => {
    const [x0, x1] = a.proto.beats[2];
    const banks = a.platforms.filter((p) => p.y === G && p.x + p.width > x0 && p.x < x1).sort((p, q) => p.x - q.x);
    return { banks, gaps: banks.slice(1).map((b, i) => Math.round(b.x - (banks[i].x + banks[i].width))), x0, x1 };
  };
  for (const s of [1, 7, 56672, 681171, 44053]) {
    const easy = gapsOf(buildProtoStage(cfg, s, 'ctest', true));
    const one = reachJumpHeld(0, false), two = reachJumpHeld(0, true);
    assert.deepEqual(easy.gaps.map((g, i) => Math.abs(g - [one * 0.5, one * 0.75, two * 0.7, two * 0.85][i]) <= 1), [true, true, true, true], `seed ${s}: ${easy.gaps}`);
    const normal = gapsOf(buildProtoStage(cfg, s, 'ctest'));
    assert.ok(normal.gaps[3] > 260 && normal.gaps[0] > 85, `seed ${s}: Normal's are as they were (${normal.gaps})`);
    // the same mix either way: only the long jumps differ
    assert.equal(buildProtoStage(cfg, s, 'ctest', true).proto.mix, buildProtoStage(cfg, s, 'ctest').proto.mix);
    for (const [name, a] of [['Easy', buildProtoStage(cfg, s, 'ctest', true)], ['Normal', buildProtoStage(cfg, s, 'ctest')]] as const) {
      const { banks } = gapsOf(a);
      const cps = a.checkpoints ?? [];
      // on the bank after the second gap, and on the bank before the last
      for (const k of [2, 3]) assert.ok(cps.some((c) => c.x > banks[k].x && c.x < banks[k].x + banks[k].width - 60), `${name} seed ${s}: a flag on bank ${k}`);
    }
  }
});

test('control test: every roll passes the stage check on Easy too, with a 70% hold (and Normal on the QA rolls)', async () => {
  const { easyStage } = await import('./easyMode.ts');
  const { setDifficulty } = await import('./difficulty.ts');
  const { EASY_HOLD } = await import('./physics.ts');
  // (as the stage check above: the log already pushed against its wall)
  const check = (a: Parameters<typeof validateStage>[0], hold?: number) => {
    const pushed = a.platforms.map((p) => (p.push ? { ...p, x: p.push.max - p.width } : p));
    const res = validateStage({ ...a, platforms: pushed, config: { ...a.config, miniIndex: 9 } }, hold ? { hold } : {});
    const logIds = new Set(a.platforms.filter((p) => p.push).map((p) => `platform ${p.id}`));
    return res.errors.filter((e) => ![...logIds].some((id) => e.endsWith(id)));
  };
  // (QA batch E's rolls: a river bank Easy grew out over the water, 681171; a step Easy built over a flower, 44053)
  const qa = [681171, 44053, 56672, 1, 7920];
  const bad: string[] = [];
  try {
    setDifficulty('easy');
    for (const s of [...qa, ...SEEDS]) {
      const e = check(easyStage(buildProtoStage(cfg, s, 'ctest', true)), EASY_HOLD);
      if (e.length) bad.push(`Easy ${s}: ${e.join('; ')}`);
    }
    setDifficulty('normal');
    for (const s of qa) {
      const e = check(buildProtoStage(cfg, s, 'ctest'));
      if (e.length) bad.push(`Normal ${s}: ${e.join('; ')}`);
    }
  } finally {
    setDifficulty('normal');
  }
  assert.equal(bad.length, 0, bad.join('\n'));
});
