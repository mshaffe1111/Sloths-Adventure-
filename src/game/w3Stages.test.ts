import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, PROWLER_GOAL_33 } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { GLOW_REACH } from './zones.ts';
import type { LevelConfig } from './types.ts';

type W3 = '3-1' | '3-2' | '3-3';
const TYPE: Record<W3, LevelConfig['objectiveType']> = { '3-1': 'sprint', '3-2': 'stealth', '3-3': 'purge' };
const cfg = (id: W3): LevelConfig =>
  ({
    worldIndex: 3, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: TYPE[id], targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const PLANS: W3[] = ['3-1', '3-2', '3-3'];

test('World 3 trio: every roll passes the reachability check, has one exit, and is at least two minutes for a quick player', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg(plan), s, plan);
      const res = validateStage(st);
      assert.ok(res.ok, `${plan} seed ${s}: ${res.errors.join('; ')}`);
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `${plan} seed ${s}`);
      assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS, `${plan} seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
      assert.ok((st.proto.w3decor ?? []).length > 10, `${plan} seed ${s}: the grotto is undressed`);
    }
  }
});

test('World 3 trio: the beats are always there, in order', () => {
  const want: Record<W3, string[]> = {
    '3-1': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-2': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-3': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
  };
  for (const plan of PLANS) for (const s of SEEDS.slice(0, 6)) {
    assert.deepEqual(buildProtoStage(cfg(plan), s, plan).proto.beats.map((b) => b[2].split(':')[0]), want[plan], `${plan} seed ${s}`);
  }
});

test('World 3 dark: the glowworms are asleep, one hangs over the way in, and one stop always lights the next gap', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg(plan), s, plan);
      const darks = (st.zones ?? []).filter((z) => z.kind === 'dark');
      if (plan !== '3-3') assert.ok(darks.length >= 2, `${plan} seed ${s}: ${darks.length} dark stretches`);
      for (const z of darks) {
        const ls = z.lights ?? [];
        assert.ok(ls.length && ls.every((l) => l.sleep && l.id !== undefined), `${plan} seed ${s}: a light that is not a glowworm`);
        assert.ok(ls.some((l) => l.x < z.x0 + 400), `${plan} seed ${s}: nothing to wake at the way into the dark at ${Math.round(z.x0)}`);
        // standing anywhere on the floor of the dark, the next glowworm ahead is within reach of a stop
        const xs = ls.map((l) => l.x).sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] < GLOW_REACH.ahead, `${plan} seed ${s}: ${xs[i] - xs[i - 1]} px between glowworms`);
      }
      const ids = darks.flatMap((z) => z.lights!.map((l) => l.id));
      assert.equal(new Set(ids).size, ids.length, `${plan} seed ${s}: two glowworms share an id`);
    }
  }
});

test('3-2: the eyes watch the ferns, and every fern in the dark stands where he stops before a gap', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-2'), s, '3-2');
    const ferns = st.proto.bushes ?? [];
    assert.ok(ferns.length >= 8 && ferns.every((b) => b.kind === 'grotto'), `seed ${s}`);
    assert.ok((st.proto.watch ?? []).length >= 3, `seed ${s}`);
    // every watched stretch has somewhere to hide
    for (const w of st.proto.watch!) assert.ok(ferns.some((b) => b.x > w.x0 && b.x < w.x1), `seed ${s}: a watched stretch with no fern`);
  }
});

test('3-3: about one and a half times the prowlers it asks for, and jaguars among them', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-3'), s, '3-3');
    const prowlers = st.enemies.filter((e) => e.type === 'ocelot' || e.type === 'jaguar');
    assert.equal(st.config.targetCount, PROWLER_GOAL_33);
    assert.ok(prowlers.length >= Math.ceil(PROWLER_GOAL_33 * 1.5), `seed ${s}: ${prowlers.length} prowlers`);
    assert.ok(prowlers.some((e) => e.type === 'jaguar'), `seed ${s}: no jaguar`);
  }
});
