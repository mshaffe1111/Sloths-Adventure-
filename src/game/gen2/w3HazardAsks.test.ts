// WORLD 3's HAZARD ROWS, proven on a toy (ENG-ASKS-b; R-165.501): World 3's registry (worlds/w3.ts W3_HAZARDS, the manifest's `hazards`)
// read by the node code's asks. On the legs fixture with World 3's own pieces: the glowworms' dark (gen2/dark.ts darkEnds 'glow', World
// 3's dark props and emitters) and the spore puff's zone brick (gen2/spore.ts). `:#dark` lays the dark on its node; `:#dark@puff` the
// dark with a puff in it; `:#spore@puff` the puff; `:#soft@moon` is refused by name until ENG-MOON's brick is in the pool; an id World 3
// does not register (#vine, #thornvine: ENG-VINE's) is refused by name.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { legsKit, pitHop } from './toyLegs.ts';
import { DARK_EMIT, DARK_GLOW_PROPS, darkEnds } from './dark.ts';
import { W3_HAZARDS, w3Manifest } from './worlds/w3.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const STAGE = '5-95';
const CFG = towerCfg(STAGE, 'sprint');
/** a ground practise brick of the legs fixture in World 3's dark (glowworms) and, `puff`, with a spore puff on its far bank */
const darkBrick = (id: string, puff: boolean): SectionTemplate => ({
  ...pitHop, id, name: id, jobs: ['practise'], content: 'ground',
  sockets: [...darkEnds('near', 'far', 'glow'), ...pitHop.sockets],
  ...(puff ? { zones: [{ kind: 'spore', on: 'far' }] } : {}),
});
const BRICKS = [darkBrick('w3toy-dark', false), darkBrick('w3toy-dark-puff', true)];
const kit = (code: string, bricks: readonly SectionTemplate[] = BRICKS): WorldKit => {
  const k = legsKit(STAGE, code);
  return {
    ...k,
    manifest: { ...k.manifest, sections: [...k.manifest.sections, ...bricks], props: [...k.manifest.props, ...DARK_GLOW_PROPS], hazards: w3Manifest().hazards },
    emit: { ...(k.emit ?? {}), ...DARK_EMIT },
  };
};
const SEEDS = 40;
const roll = (code: string, seed: number, easy: boolean, K = kit(code)) => buildGen2Stage({ config: CFG, kit: K, seed, difficulty: easy ? 'easy' : 'normal' });
const zonesOver = (st: ReturnType<typeof roll>, node: string, kind: string) => {
  const secs = st.gen2.sections.filter((q) => q.node === node);
  const x0 = Math.min(...secs.map((q) => q.x0)), x1 = Math.max(...secs.map((q) => q.x1));
  return (st.zones ?? []).filter((z) => z.kind === kind && z.x1 > x0 && z.x0 < x1);
};
const hazardLines = (st: ReturnType<typeof roll>) => st.gen2.errors.filter((e) => /hazard #/.test(e));
const code = (ask: string) => `A P:${ask} /D D_ P D_ /R M R /U U^ C U^ /R X R S E`;

test("World 3's manifest carries its registry rows: #dark, #spore, the puff clock, #soft@moon; no #vine or #thornvine yet", () => {
  assert.equal(w3Manifest().hazards, W3_HAZARDS);
  const ids = W3_HAZARDS.map((r) => r.id);
  assert.deepEqual(ids, ['dark', 'spore', 'soft']);
  assert.deepEqual(Object.keys(W3_HAZARDS[0].clocks ?? {}), ['puff']);
  assert.deepEqual(Object.keys(W3_HAZARDS[1].clocks ?? {}), ['puff']);
  assert.deepEqual(Object.keys(W3_HAZARDS[2].clocks ?? {}), ['moon']);
});

for (const [ask, kinds, brick] of [
  ['#dark', ['dark'], 'w3toy-dark'], // (either brick: the puff brick lays the dark too)
  ['#dark@puff', ['dark', 'spore'], 'w3toy-dark-puff'],
  ['#spore@puff', ['spore'], 'w3toy-dark-puff'],
] as const) {
  test(`World 3's ${ask} asked on a node lays ${kinds.join(' and ')} over it, on ${SEEDS} seeds x both settings`, () => {
    let laid = 0;
    for (let s = 1; s <= SEEDS; s++) for (const easy of [false, true]) {
      const st = roll(code(ask), s, easy);
      const at = `seed ${s}${easy ? ' Easy' : ''}`;
      assert.deepEqual(hazardLines(st), [], `${at}: no hazard miss named`);
      for (const k of kinds) assert.ok(zonesOver(st, 'n2', k).length, `${at}: a ${k} zone over n2`);
      const secs = st.gen2.sections.filter((q) => q.node === 'n2').map((q) => q.template);
      assert.ok(secs.some((t) => t.startsWith(brick)), `${at}: n2 laid ${brick} (${secs.join(', ')})`);
      laid++;
    }
    assert.equal(laid, SEEDS * 2);
  });
}

test("World 3's #soft@moon is refused by name until a brick lays the moon (ENG-MOON)", () => {
  for (const easy of [false, true]) {
    assert.match(hazardLines(roll(code('#soft@moon'), 1, easy)).join('\n'), /node n2 "[^"]*": hazard #soft@moon: no section in the pool lays @moon/);
  }
});

test('an id World 3 does not register is refused by name (#vine, #thornvine@doze: ENG-VINE; #moon); so is a clock its row does not list', () => {
  for (const [ask, why] of [
    ['#vine', /hazard #vine: #vine is not a registered hazard in this world/],
    ['#thornvine@doze', /hazard #thornvine@doze: #thornvine is not a registered hazard in this world/],
    ['#moon', /hazard #moon: #moon is not a registered hazard in this world/],
    ['#dark@moon', /hazard #dark@moon: @moon is not a clock #dark runs on in this world/],
  ] as const) assert.match(hazardLines(roll(code(ask), 1, false)).join('\n'), why);
});

test("World 3's #spore with no puff brick in the pool is refused by name", () => {
  const c = code('#spore');
  assert.match(hazardLines(roll(c, 1, false, kit(c, [darkBrick('w3toy-dark', false)]))).join('\n'), /hazard #spore: no section in the pool lays #spore/);
});
