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

test('control test: off unless the address asks for it, and only in a QA build (UI-15)', () => {
  assert.equal(ctestEnabled(), false);
  // (outside a Vite dev or test-link build there is no QA build: the shipped game never opens it)
  assert.equal(qaBuild(), false);
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
