// 1-2 The Petal Trail, held to its design (reference/design/1-2.md; D12): ONE graph, one brick a beat, its own pool, every roll the same
// level in the same order on both settings, clean on its own setting's verdicts (chain.mount, landing.dead-zone, bounce.no-purpose,
// hazard.untaught, the rolled flags), the chains inside chain.md §3's bands, petals low the whole way, the story keeper's lines said
// where the design says. Planted faults prove the checks bind.
//   npx tsx --test tools/engine/library.test.ts          (about a minute)
import test from 'node:test';
import assert from 'node:assert/strict';
import { BEATS_12, EXIT_12, LINES_12, QUIET_12, SECTIONS_12, STAGE_12, TEACH_12, build, config12, kitLib12, poolReport, roll } from './library.ts';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const SEEDS = [1, 2, 3, 4];
const SETTINGS = ['normal', 'easy'] as const;
const built = new Map(SETTINGS.flatMap((d) => SEEDS.map((s) => [`${d}:${s}`, build(s, d)] as const)));
const each = (fn: (st: Any, d: (typeof SETTINGS)[number], seed: number) => void) => { for (const d of SETTINGS) for (const s of SEEDS) fn(built.get(`${d}:${s}`), d, s); };
const ARC = ['w1-12-arrival', 'w1-12-lesson', 'w1-12-again', 'R', 'w1-12-up', 'R', 'w1-12-long', 'R', 'w1-12-hollow', 'R', 'w1-12-crossing', 'R', 'w1-12-finale', 'w1-12-exit'];
const RESTS = new Set(QUIET_12.filter((t) => t.jobs?.includes('rest')).map((t) => t.id));
const secOf = (st: Any, id: string) => st.gen2.sections.find((q: Any) => q.template === id);

test("1-2's pool is its own: its seven beats, its arrival, its five rests, its exit; no World 1 library section", () => {
  assert.deepEqual(poolReport().pool.sort(), SECTIONS_12.map((t) => t.id).sort());
  assert.equal(BEATS_12.length, 7);
  assert.ok(RESTS.size >= 5, `${RESTS.size} rests for the graph's five`);
  assert.deepEqual(stagePool(kitLib12().manifest, STAGE_12).filter((t) => !t.id.startsWith('w1-12-')), []);
});

test('every roll is this level: the fourteen beats in the designed order on both settings, a different rest each time', () => {
  each((st, d, s) => {
    const plan: string[] = st.gen2.sections.map((q: Any) => q.template);
    assert.deepEqual(plan.map((t) => (RESTS.has(t) ? 'R' : t)), ARC, `${d} seed ${s}: ${plan.join(' ')}`);
    const rests = plan.filter((t) => RESTS.has(t));
    assert.equal(new Set(rests).size, rests.length, `${d} seed ${s}: a rest laid twice`);
  });
});

test("every roll is clean on its own setting's verdicts (Matt's chain.mount, landing.dead-zone, bounce.no-purpose; hazard.untaught; the flags)", () => {
  each((st, d, s) => assert.deepEqual(st.gen2.errors ?? [], [], `${d} seed ${s}`));
});

test('the thorn bed lies only under the chain beats: never in the twist, the arrival or a rest, and none within 1,300 px of the spawn', () => {
  each((st, d, s) => {
    const chainy = new Set(['w1-12-lesson', 'w1-12-again', 'w1-12-up', 'w1-12-long', 'w1-12-crossing', 'w1-12-finale']);
    for (const z of st.heartFalls ?? []) {
      const q = st.gen2.sections.find((x: Any) => z.x0 >= x.x0 - 2 && z.x1 <= x.x1 + 2);
      assert.ok(q && chainy.has(q.template), `${d} seed ${s}: a thorn hollow at x ${Math.round(z.x0)} in ${q?.template}`);
      assert.ok(z.x0 >= st.spawnX + 1300, `${d} seed ${s}: a thorn hollow ${Math.round(z.x0 - st.spawnX)} px from the spawn`);
      assert.equal(!!z.soft, d === 'easy', `${d} seed ${s}: thorns ${z.soft ? 'soft' : 'cost a heart'}`);
    }
    // (the twist: no gap at all in the hollow beat, so nothing to fall into; its far face 160-180 px over its floor, a mushroom at its foot)
    const w = secOf(st, 'w1-12-hollow');
    assert.ok(!(st.heartFalls ?? []).some((z: Any) => z.x1 > w.x0 && z.x0 < w.x1), `${d} seed ${s}: thorns in the twist`);
  });
});

test("every chain inside chain.md §3's bands: cap to cap by the step, stumps 110 | 160 (the lesson and again 160 on both), the pit between pillars 75-110 | 35-70, caps per chain 2-5 | 2-3", () => {
  const band = (dy: number) => (dy > 45 ? [185, 200] : dy > 6 ? [195, 210] : dy < -6 ? [215, 225] : [205, 220]);
  each((st, d, s) => {
    // (a chain's caps are the ones on stumps, 200 px or narrower; a floor mushroom stands on its bank, the entry, chain.md §2 f)
    const under = (c: Any) => st.platforms.find((p: Any) => p.type !== 'bouncy' && Math.abs(p.y - (c.y + c.height)) <= 2 && p.x <= c.x && p.x + p.width >= c.x + c.width);
    const caps = st.platforms.filter((p: Any) => p.type === 'bouncy' && (under(p)?.width ?? 999) <= 200).sort((a: Any, b: Any) => a.x - b.x);
    assert.ok(caps.length >= (d === 'easy' ? 18 : 22), `${d} seed ${s}: only ${caps.length} caps on stumps found (the check would be empty)`);
    let run = 1;
    for (let i = 1; i <= caps.length; i++) {
      const a = caps[i - 1], b = caps[i], S = b ? b.x + b.width / 2 - (a.x + a.width / 2) : Infinity, dy = b ? a.y - b.y : 0;
      if (S > 270) { assert.ok(run <= (d === 'easy' ? 3 : 5), `${d} seed ${s}: a chain of ${run} caps ending at x ${Math.round(a.x)}`); run = 1; continue; }
      run++;
      const [lo, hi] = band(dy);
      assert.ok(S >= lo && S <= hi, `${d} seed ${s}: caps ${Math.round(S)} px apart at x ${Math.round(a.x)} (step ${Math.round(dy)}: ${lo}-${hi})`);
      // (the pit between two pillars, by the pillars' width: chain.md §3, 75-110 between 110-130 px pillars, 35-70 between 150-170 px)
      const ua = under(a), ub = under(b), pit = ub.x - (ua.x + ua.width), [p0, p1] = ua.width >= 150 ? [35, 70] : [75, 110];
      assert.ok(pit >= p0 - 0.5 && pit <= p1 + 0.5, `${d} seed ${s}: ${Math.round(pit)} px of pit between pillars at x ${Math.round(ua.x + ua.width)} (${p0}-${p1})`);
    }
    for (const sec of st.gen2.sections.filter((q: Any) => q.template.startsWith('w1-12-'))) {
      const wide = d === 'easy' || ['w1-12-lesson', 'w1-12-again'].includes(sec.template);
      for (const c of caps.filter((p: Any) => p.x > sec.x0 && p.x < sec.x1)) assert.equal(Math.round(under(c).width), wide ? 160 : 110, `${d} seed ${s}: ${sec.template}'s stump at x ${Math.round(c.x)}`);
    }
  });
});

/** the bare wood beside each cap on a stump, by beat: Normal from the petals going up on lays NONE (the caps are his only footing over the
 *  thorns: the lead's ruling A, 11-12; any bed the generator lays is one a full jump clears, so purpose comes from cap-only footing); the
 *  lesson and again on both settings, and Easy everywhere, keep 20 px or more each side (the gentle lesson, the forgiving miss) */
const capOnly = new Set(['w1-12-up', 'w1-12-long', 'w1-12-crossing', 'w1-12-finale']);
function woodFaults(st: Any, d: string): string[] {
  const out: string[] = [];
  const under = (c: Any) => st.platforms.find((p: Any) => p.type !== 'bouncy' && Math.abs(p.y - (c.y + c.height)) <= 2 && p.x <= c.x + 0.5 && p.x + p.width >= c.x + c.width - 0.5);
  let seen = 0;
  for (const sec of st.gen2.sections.filter((q: Any) => q.template.startsWith('w1-12-'))) {
    for (const c of st.platforms.filter((p: Any) => p.type === 'bouncy' && p.x > sec.x0 && p.x < sec.x1)) {
      const u = under(c);
      if (!u || u.width > 200) continue; // a floor mushroom on its bank (the walk-on), not a cap over thorns
      seen++;
      const left = c.x - u.x, right = u.x + u.width - (c.x + c.width);
      const none = d === 'normal' && capOnly.has(sec.template);
      if (none ? Math.max(left, right) > 0.5 : Math.min(left, right) < 20) out.push(`${sec.template} at x ${Math.round(c.x)}: wood ${Math.round(left)} | ${Math.round(right)} px beside a ${Math.round(c.width)} px cap on a ${Math.round(u.width)} px stump`);
    }
  }
  if (seen < (d === 'easy' ? 18 : 22)) out.push(`only ${seen} caps on stumps (the check would be empty)`);
  return out;
}

test("the caps are his only footing over the thorns from the petals going up on, Normal (each cap its stump's width); the lesson, again and Easy keep their wood", () => {
  each((st, d, s) => assert.deepEqual(woodFaults(st, d), [], `${d} seed ${s}`));
});

test('PLANTED: a 70 px cap left on a 110 px stump in the long chain (Normal) is bare wood a plain jump could use, and is caught', () => {
  const st = build(1, 'normal');
  const sec = secOf(st, 'w1-12-long');
  const cap = st.platforms.filter((p: Any) => p.type === 'bouncy' && p.x > sec.x0 && p.x < sec.x1).sort((a: Any, b: Any) => a.x - b.x)[2];
  const planted = { ...st, platforms: st.platforms.map((p: Any) => (p === cap ? { ...p, x: p.x + (p.width - 70) / 2, width: 70 } : p)) };
  assert.deepEqual(woodFaults(st, 'normal'), []);
  assert.equal(woodFaults(planted, 'normal').length, 1, woodFaults(planted, 'normal').join('; '));
});

test('petals low on bark the whole way: no petal arc over a gap, every petal within 110 px over a standable top', () => {
  each((st, d, s) => {
    const tops = st.platforms.filter((p: Any) => p.type !== 'bouncy' && !p.broken);
    for (const c of st.collectibles.filter((q: Any) => q.type === 'flower')) {
      const under = tops.filter((p: Any) => c.x >= p.x && c.x <= p.x + p.width && p.y >= c.y && p.y - c.y <= 110);
      assert.ok(under.length, `${d} seed ${s}: a petal in the air at x ${Math.round(c.x)}`);
    }
  });
});

test("the story keeper's lines, verbatim, said where the design says: the lesson's two; the roots line held until the note is in the hollow; main's cut \"The petals go up\" never laid", () => {
  assert.equal(LINES_12.thorns, 'Ooh, thorns. Don\'t touch those, not even a little.');
  assert.equal(LINES_12['thorns.then'], 'Hop on and let the mushrooms do the jumping!');
  assert.equal(LINES_12.roots, 'There\'s something down by the roots...');
  const tips = kitLib12().manifest.tips!;
  // (main's "The petals go up" is cut in the new look: never laid on 1-2, which would put a line on the stair the game drops)
  assert.equal(tips['hint.1-2.up'], 'The petals go up');
  each((st, d, s) => {
    const said = (id: string) => st.gen2.fills.filter((f: Any) => f.role === 'tip' && f.what === id);
    assert.equal(said('roots').length, 0, `${d} seed ${s}: Dot promises something by the roots over an empty floor`);
    assert.equal(said('hint.1-2.up').length, 0, `${d} seed ${s}: the cut "The petals go up" laid on the stair`);
    for (const [id, beat] of [['thorns', 'w1-12-lesson'], ['thorns.then', 'w1-12-lesson']] as const) {
      const f = said(id);
      assert.equal(f.length, 1, `${d} seed ${s}: "${id}" said ${f.length} times`);
      const sec = secOf(st, beat);
      assert.ok(f[0].x >= sec.x0 && f[0].x <= sec.x1, `${d} seed ${s}: "${id}" outside ${beat}`);
    }
    // (Dot's first line 800 px and more before the lesson's mushroom: she speaks before he can be past it, 1-3's lesson)
    const m = st.platforms.filter((p: Any) => p.type === 'bouncy').sort((a: Any, b: Any) => a.x - b.x)[0];
    assert.ok(m.x - said('thorns')[0].x >= 800, `${d} seed ${s}: the thorn line ${Math.round(m.x - said('thorns')[0].x)} px before the mushroom`);
  });
});

/** the lesson's lines as the stage lays them (proto.hints): each once, and marked a TEACH line (the kit's teachTips), so Dot waits for a
 *  clear moment and no stock lesson or her spacing takes the card */
const teachOf = (st: Any) => {
  const hs: Any[] = st.proto?.hints ?? [];
  return Object.fromEntries(['thorns', 'thorns.then'].map((id) => {
    const text = id in LINES_12 ? (LINES_12 as Any)[id] : kitLib12().manifest.tips![id];
    const h = hs.filter((q) => q.text === text);
    return [id, h.length === 1 ? (h[0].teach ? 'teach' : 'hint') : `said ${h.length} times`];
  }));
};
test("Dot's thorn lines are 1-2's TEACH lines on every roll, both settings (the kit's teachTips: the lead's blocker 11-12)", () => {
  assert.deepEqual([...TEACH_12], ['thorns', 'thorns.then']);
  each((st, d, s) => assert.deepEqual(teachOf(st), { thorns: 'teach', 'thorns.then': 'teach' }, `${d} seed ${s}`));
});

test('PLANTED: with the thorn lines left out of teachTips they are laid as ordinary hints, and that is caught', () => {
  const st = plant((k) => ({ ...k, manifest: { ...k.manifest, teachTips: (k.manifest.teachTips ?? []).filter((m) => !m.startsWith('thorns')) } }))(1, 'normal');
  assert.deepEqual(teachOf(st), { thorns: 'hint', 'thorns.then': 'hint' });
});

test('the length: at least 2 minutes for a quick player on every roll, under 4 for a first-timer (the time model)', () => {
  each((st, d, s) => {
    assert.ok(st.gen2.modelled.fast >= 120, `${d} seed ${s}: ${st.gen2.modelled.fast} s fast`);
    assert.ok(st.gen2.modelled.typical <= 240, `${d} seed ${s}: ${st.gen2.modelled.typical} s typical`);
  });
});

test('Easy is never harder than Normal: no more caps, no narrower stump, no thorn that costs a heart', () => {
  for (const s of SEEDS) {
    const n = built.get(`normal:${s}`), e = built.get(`easy:${s}`);
    const caps = (st: Any) => st.platforms.filter((p: Any) => p.type === 'bouncy').length;
    assert.ok(caps(e) <= caps(n), `seed ${s}: Easy ${caps(e)} mushrooms, Normal ${caps(n)}`);
    assert.ok((e.heartFalls ?? []).every((z: Any) => z.soft), `seed ${s}: an Easy thorn costs a heart`);
  }
});

test('the quiet line (the seed list binds 4 s on Normal) holds on these rolls', () => {
  for (const s of SEEDS.slice(0, 2)) { const r = roll(s, 'normal'); assert.ok(r.quiet! <= 4, `seed ${s}: ${r.quiet} s quiet`); }
});

// ───────────── planted faults: each check above must catch its own break ─────────────
const plant = (edit: (k: WorldKit) => WorldKit) => (seed: number, d: 'normal' | 'easy') => buildGen2Stage({ config: config12() as Any, kit: edit(kitLib12()), seed, difficulty: d }) as Any;

test('PLANTED: a beat missing from the pool fails the roll by name (the arc cannot be dealt round it)', () => {
  const st = (() => { try { return plant((k) => ({ ...k, manifest: { ...k.manifest, sections: k.manifest.sections.filter((t) => t.id !== 'w1-12-hollow') } }))(1, 'normal'); } catch (e) { return { thrown: String(e) }; } })();
  assert.ok(st.thrown || (st.gen2.errors ?? []).length, 'a roll with no twist brick passed');
});

test('PLANTED: a line with no words in the kit fails the roll (the tip is never shown)', () => {
  const st = plant((k) => ({ ...k, manifest: { ...k.manifest, tips: Object.fromEntries(Object.entries(k.manifest.tips!).filter(([id]) => id !== 'thorns.then')) } }))(1, 'normal');
  assert.ok((st.gen2.errors ?? []).some((e: string) => /thorns\.then/.test(e)), JSON.stringify(st.gen2.errors));
});

test('PLANTED: a thorn hollow laid in the twist is caught (a chain brick in the hollow beat\'s place)', () => {
  const swap = plant((k) => ({ ...k, manifest: { ...k.manifest, sections: k.manifest.sections.map((t) => (t.id === 'w1-12-hollow' ? { ...BEATS_12.find((b) => b.id === 'w1-12-long')!, id: 'w1-12-hollow', jobs: ['twist'], content: 'ground' } : t)) } }))(1, 'normal');
  const w = secOf(swap, 'w1-12-hollow');
  assert.ok((swap.heartFalls ?? []).some((z: Any) => z.x1 > w.x0 && z.x0 < w.x1), 'the planted thorns in the twist were not laid, so the check above could not see them');
});

test("the exit is the stage's own, the last section on every roll", () => {
  each((st, d, s) => assert.equal(st.gen2.sections.at(-1).template, EXIT_12.id, `${d} seed ${s}`));
});
