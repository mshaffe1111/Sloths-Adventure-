// THE HAZARD REGISTRY, proven on a toy (ENG-ASKS, R-165.501; AUDIT-W3 finding 1): a designed node code asks any hazard its world's data
// registers (`:#id`) and any named clock the row lists (`:#id@clock`). The deal draws a section that lays it, the built roll holds its
// zone over the node's span, or the roll fails BY NAME. Proven with the dark as the kit already lays it (World 6's dark ends, a pair of
// props whose emitters push the zone: worlds/w6Swing.ts), on the legs fixture with one dark brick and one dark brick under a wind zone,
// the toy's 'puff' clock. (World 3's own rows, the glowworms' dark and the spore puff, are its data's when those pieces land.)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { legsKit, pitHop } from './toyLegs.ts';
import { darkEnds, W6S_EMIT, W6S_PROPS } from './worlds/w6Swing.ts';
import type { HazardDef } from './nodeAsks.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const STAGE = '5-95';
const CFG = towerCfg(STAGE, 'sprint');
/** a ground practise brick of the legs fixture that lays the dark over its two banks (and, `gust`, a wind zone on its far bank) */
const darkBrick = (id: string, gust: boolean): SectionTemplate => ({
  ...pitHop, id, name: id, jobs: ['practise'], content: 'ground',
  sockets: [...darkEnds('near', 'far', false), ...pitHop.sockets],
  ...(gust ? { zones: [{ kind: 'wind', on: 'far' }] } : {}),
});
/** the toy's registry: the dark, by its start prop, on the puff clock (kept here by a wind zone); a spore no brick lays */
const HAZ: HazardDef[] = [
  { id: 'dark', zone: 'dark', props: ['darkFrom'], clocks: { puff: { zone: 'wind', zones: ['wind'] } } },
  { id: 'spore', zone: 'spore', zones: ['spore'] },
];
const kit = (code: string, bricks: readonly SectionTemplate[] = [darkBrick('legs-dark', false), darkBrick('legs-dark-gust', true)], hazards: readonly HazardDef[] = HAZ): WorldKit => {
  const k = legsKit(STAGE, code);
  return {
    ...k,
    manifest: { ...k.manifest, sections: [...k.manifest.sections, ...bricks], props: [...k.manifest.props, ...W6S_PROPS], hazards },
    emit: { ...(k.emit ?? {}), ...W6S_EMIT },
  };
};
const SEEDS = 40;
const roll = (code: string, seed: number, easy: boolean, K = kit(code)) => buildGen2Stage({ config: CFG, kit: K, seed, difficulty: easy ? 'easy' : 'normal' });
/** node n's sections' span on the built stage, and the zones of `kind` over it */
const zonesOver = (st: ReturnType<typeof roll>, node: string, kind: string) => {
  const secs = st.gen2.sections.filter((q) => q.node === node);
  const x0 = Math.min(...secs.map((q) => q.x0)), x1 = Math.max(...secs.map((q) => q.x1));
  return (st.zones ?? []).filter((z) => z.kind === kind && z.x1 > x0 && z.x0 < x1);
};
const hazardLines = (st: ReturnType<typeof roll>) => st.gen2.errors.filter((e) => /hazard #/.test(e));

for (const [code, node, kinds] of [
  ['A P:#dark /D D_ P D_ /R M R /U U^ C U^ /R X R S E', 'n2', ['dark']],
  ['A P:#dark@puff /D D_ P D_ /R M R /U U^ C U^ /R X R S E', 'n2', ['dark', 'wind']],
] as const) {
  test(`a node asking ${code.split(' ')[1]} draws a section that lays it, its zone${kinds.length > 1 ? 's' : ''} over the node, on ${SEEDS} seeds x both settings`, () => {
    let laid = 0;
    for (let s = 1; s <= SEEDS; s++) for (const easy of [false, true]) {
      const st = roll(code, s, easy);
      assert.deepEqual(hazardLines(st), [], `seed ${s}${easy ? ' Easy' : ''}: no hazard miss named`);
      for (const k of kinds) assert.ok(zonesOver(st, node, k).length, `seed ${s}${easy ? ' Easy' : ''}: a ${k} zone over ${node}`);
      const secs = st.gen2.sections.filter((q) => q.node === node).map((q) => q.template);
      assert.ok(secs.some((t) => t.startsWith('legs-dark')), `seed ${s}: ${node} laid a dark brick (${secs.join(', ')})`);
      laid++;
    }
    assert.equal(laid, SEEDS * 2);
  });
}

test('an id the world does not register, and a clock its row does not list, are refused by name', () => {
  const st = roll('A P:#moon /D D_ P D_ /R M R /U U^ C U^ /R X R S E', 1, false);
  assert.match(hazardLines(st).join('\n'), /node n2 "[^"]*": hazard #moon: #moon is not a registered hazard in this world/);
  const c = roll('A P:#dark@doze /D D_ P D_ /R M R /U U^ C U^ /R X R S E', 1, false);
  assert.match(hazardLines(c).join('\n'), /hazard #dark@doze: @doze is not a clock #dark runs on in this world/);
});

test('a registered id no section of the pool lays is refused by name; so is a clock no section lays', () => {
  const st = roll('A P:#spore /D D_ P D_ /R M R /U U^ C U^ /R X R S E', 1, false);
  assert.match(hazardLines(st).join('\n'), /hazard #spore: no section in the pool lays #spore/);
  const code = 'A P:#dark@puff /D D_ P D_ /R M R /U U^ C U^ /R X R S E';
  const c = roll(code, 1, false, kit(code, [darkBrick('legs-dark', false)]));
  assert.match(hazardLines(c).join('\n'), /hazard #dark@puff: no section in the pool lays @puff/);
});

test('a world with no registry rows: the four falls as ever, any other id refused by name', () => {
  const code = 'A P:#dark /D D_ P D_ /R M R /U U^ C U^ /R X R S E';
  const st = roll(code, 1, false, kit(code, [darkBrick('legs-dark', false)], []));
  assert.match(hazardLines(st).join('\n'), /#dark is not a registered hazard in this world/);
});
