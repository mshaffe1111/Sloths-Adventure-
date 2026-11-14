/**
 * 1-6 First Lianas (BUILD-16, reference/design/1-6.md): the arc beat for beat on every roll, both settings; Easy never harder than Normal
 * in any number the design names (FAR laid as LONG, no riser, a sound bough for every creaky one); the snakes on the lianas the design
 * names, every one fair by the snake view verdict (finish16 throws otherwise) and hung deep enough under the level's top; the false liana
 * still and short. Planted faults: reference/qa-reports/BUILD-16/planted.out.txt.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { finish16, kitLib16, W1_SNAKES_16 } from './w1Arc16.ts';
import { isFalseLiana } from '../../vineSnake.ts';
import type { Vine } from '../../types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true };
/** seeds that roll clean on both settings (libstage 1-6, 11-14: 1, 3, 4, 7, 8, 9, 10, 12) */
const SEEDS = [1, 3, 4];
type Built = ReturnType<typeof buildGen2Stage> & { vines: Vine[]; gen2: { sections: Array<{ uid: string; template: string }> } };
const cache = new Map<string, Built>();
const built = (seed: number, d: 'normal' | 'easy'): Built => {
  const k = `${seed}:${d}`;
  if (!cache.has(k)) cache.set(k, finish16(buildGen2Stage({ config: cfg, kit: kitLib16(), seed, difficulty: d }) as Built, d));
  return cache.get(k)!;
};
const beats = (st: Built) => st.gen2.sections.map((s) => s.template.replace('w1-16-', '')).filter((t) => !t.startsWith('rest-'));
const ofSection = (st: Built, tpl: string) => {
  const uid = st.gen2.sections.find((s) => s.template === `w1-16-${tpl}`)!.uid;
  return st.vines.filter((v) => v.tag?.startsWith(`${uid}:`));
};

test('1-6: the arc beat for beat on every roll, both settings (1-6.md "The arc", less the chain): arrive, first liana, hang low, snakes met, snake on your vine, creaky landing, risers, false liana, gorge, far bank; a rest between the hard ones', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    assert.deepEqual(beats(st), ['arrival', 'first-liana', 'hang-low', 'snakes-met', 'snake-on-vine', 'creaky-landing', 'risers', 'false-liana', 'gorge', 'far-bank'], `${d} seed ${seed}`);
    const all = st.gen2.sections.map((s) => s.template.replace('w1-16-', ''));
    for (const hard of ['snake-on-vine', 'creaky-landing', 'risers', 'false-liana', 'gorge']) assert.ok(all[all.indexOf(hard) - 1].startsWith('rest-') || hard === 'snake-on-vine', `${d} seed ${seed}: no rest before ${hard}`);
    assert.deepEqual((st as { gen2: { errors?: string[] } }).gen2.errors ?? [], [], `${d} seed ${seed}`);
  }
});

test('1-6: every liana is 1-6.md\'s measured liana (420 px), the false liana a short still snake (150-170 px: it reads as a snake, not a vine 4.6x his height)', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    for (const v of built(seed, d).vines.filter((x) => x.vineType === 'swing_liana' || isFalseLiana(x))) {
      const len = v.bottomY - v.topY;
      if (isFalseLiana(v)) assert.ok(len >= 150 && len <= 170 && v.swingAmp === 0, `${d} seed ${seed}: the false liana ${v.tag} is ${len} px, amp ${v.swingAmp}`);
      else assert.ok(Math.abs(len - 420) <= 1 || v.bottomY <= v.topY + 420, `${d} seed ${seed}: liana ${v.tag} is ${len} px`);
    }
  }
});

test('1-6: the snakes ride the lianas the design names (W1_SNAKES_16), each fair by the snake view verdict, and every snake from the anchor hangs 270+ px under the level\'s top (ENG-S4 depth table)', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d);
    for (const s of st.gen2.sections) for (const row of W1_SNAKES_16.sections[s.template] ?? []) {
      const v = st.vines.find((x) => x.tag === `${s.uid}:${row.liana}`);
      assert.ok(v, `${d} seed ${seed}: ${s.template} laid no ${row.liana}`);
      if (d === 'easy' && row.easy === 'none') { assert.equal(v!.snake, undefined, `${d} seed ${seed}: a riser on Easy`); continue; }
      assert.equal(v!.snake?.route, row.route, `${d} seed ${seed}: ${s.template} ${row.liana}`);
      if (row.route === 'down-off' || row.route === 'down-back') assert.ok(v!.topY >= 270, `${d} seed ${seed}: ${s.template} ${row.liana} hangs ${v!.topY} px under the top`);
    }
  }
});

test('1-6: Easy is never harder than Normal: no riser, no creaky limb, no FAR perch (FAR laid as LONG), every snake beat as slow or slower', () => {
  for (const seed of SEEDS) {
    const n = built(seed, 'normal'), e = built(seed, 'easy');
    const creaks = (st: Built) => st.platforms.filter((p) => (p as { creak?: unknown }).creak).length;
    assert.ok(creaks(n) >= 3, `seed ${seed}: Normal lays ${creaks(n)} creaky limbs`);
    assert.equal(creaks(e), 0, `seed ${seed}: Easy lays a creaky limb`);
    const risers = (st: Built) => st.vines.filter((v) => v.snake?.route === 'up').length;
    assert.ok(risers(n) >= 3 && risers(e) === 0, `seed ${seed}: risers ${risers(n)} Normal, ${risers(e)} Easy`);
    const narrow = (st: Built) => st.platforms.filter((p) => p.width >= 120 && p.width <= 140 && (p as { tag?: string }).tag && /:(?:g?b\d)$/.test((p as { tag?: string }).tag!)).length;
    assert.ok(narrow(n) >= 3, `seed ${seed}: Normal lays ${narrow(n)} FAR perches`);
    assert.equal(narrow(e), 0, `seed ${seed}: Easy lays a FAR perch`);
    for (const [id, b] of Object.entries(W1_SNAKES_16.beats)) assert.ok((b.easyStretch ?? 1) >= 1, `${id} is quicker on Easy`);
  }
});

test('1-6: the floor is the gorge\'s (GORGE px under World 1\'s line) and the stage is long enough: 2 minutes on the fast clock\'s model, both settings', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const st = built(seed, d) as Built & { gen2: { modelled?: { fast: number } } };
    assert.ok((st.gen2.modelled?.fast ?? 0) >= 120, `${d} seed ${seed}: ${st.gen2.modelled?.fast} s on the fast model`);
  }
});
