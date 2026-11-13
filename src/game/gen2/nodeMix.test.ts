// MIX AND MATCH, proven (packet NODES-2 item 2; R-165.198, Matt 12:10-1:01 PM 11-13: "there's a lot of other elements that can go
// into a node, and they all can be mixed and matched"). A generator writes many node strings from the key's elements (any job x
// content x move x shape x find x creatures x tempo x dials, NODES.md §8.0 and §8.9), each checked by §8.3's rules as the lay checks a
// graph, and lays every one on two worlds' kits (the legs fixture with its creature bricks, and World 1's real kit at 1-1 with the
// string as its graph). Every string either lays clean or fails by NAME: refused by a V-rule, refused by the lay with its reason, or
// built with each miss named in its errors. No crash, no silent drop: what a clean roll was asked (its content, its creatures) is
// re-checked here on the built stage, apart from the check that named it. The count of strings that lay clean is the variety number.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { checkCode, parseCode } from './nodeCode.ts';
import { TYPE_OF_LETTER } from './nodeAsks.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { mixKit } from './toyLegs.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig } from '../types.ts';
import type { WorldKit } from './types.ts';

/** a small seeded stream (mulberry32): the strings are the same on every run */
const stream = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** one node token from the key's elements: a content job and any mix of the marks and dials, the cast's kinds for its threat */
function token(r: () => number, cast: readonly string[], jobs: readonly string[]): string {
  const of = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const job = of(jobs);
  // (each element on about a third of the nodes or fewer: a node mixes one to four of them, so what lays and what is named can be told)
  const content = r() < 0.35 ? of(['g', 'f', 'c', 'b', 'r', 'k', 'w', 'h', 's', 'v', 'p', 't', 'x']) : '';
  const move = r() < 0.25 ? of(['1', '2']) : '';
  const shape = r() < 0.3 ? of(['^', '_']) : '';
  const find = r() < 0.1 ? '+' : '';
  const creatures = r() < 0.25 ? of(['&', '&', '&&']) : '';
  const tempo = r() < 0.5 ? of(['<', '>']) : '';
  const dials: string[] = [];
  if (r() < 0.2) dials.push(`${1 + Math.floor(r() * 10)}`);
  if (creatures && r() < 0.5) dials.push(`&${of(cast)}${creatures === '&&' ? '*2' : r() < 0.5 ? '' : '*1'}${of(['', '', '!', 'z'])}`.replace(/^(&[a-z-]+)(z)$/, '$1*1z'));
  if (r() < 0.1) dials.push(`#${of(['soft', 'water', 'hurt', 'void'])}`);
  if (find && r() < 0.5) dials.push('+seed');
  if (r() < 0.1) dials.push(`$${Math.floor(r() * 7)}`);
  if (r() < 0.03) dials.push('t0.9');
  if (r() < 0.03) dials.push('p5');
  return `${job}${content}${move}${shape}${find}${creatures}${tempo}${dials.map((d) => `:${d}`).join('')}`;
}

/** the elements a node's asks hold, by the key's names */
function elementsOf(a: NonNullable<import('./types.ts').MissionNode['asked']>): string[] {
  const d = a.dials;
  return [
    ...(a.content ? [`content ${a.content}`] : []), ...(a.move ? [`move ${a.move}`] : []), ...(a.shape ? [`shape ${a.shape}`] : []),
    ...(a.find ? ['find'] : []), ...(a.formation ? ['&&'] : a.creatures ? ['&'] : []), ...(a.tempo ? ['tempo'] : []),
    ...(d?.rating !== undefined ? ['rating'] : []), ...(d?.threat ? ['threat'] : []), ...(d?.hazard ? [`hazard ${d.hazard.kind}`] : []),
    ...(d?.reward?.find ? ['reward +find'] : []), ...(d?.reward?.pickups !== undefined ? ['pickups'] : []), ...(d?.beat !== undefined ? ['beat'] : []),
    ...(d?.points !== undefined ? ['points'] : []),
  ];
}

/** each element's miss line (nodeAsks.ts askMisses, hazardMiss) */
const MISS_OF: Readonly<Record<string, RegExp>> = {
  content: /: content '/, move: /: move [12]/, shape: /: shape /, find: /: find \(\+\)/, '&': /: creatures \(&\)/, '&&': /: formation \(&&\)/,
  tempo: /: tempo/, rating: /: rating/, threat: /: threat/, hazard: /: hazard #/, reward: /: reward \+/, pickups: /: reward \$/, beat: /: beat /,
  points: /: points /,
};
const cfgs = generateAllLevels();
interface Kit { name: string; config: LevelConfig; kit: (code: string) => WorldKit; cast: readonly string[] }
const W1 = w1World();
const KITS: Kit[] = [
  { name: 'the legs fixture', config: towerCfg('5-95', 'sprint'), kit: (code) => mixKit('5-95', code), cast: ['spider'] },
  {
    name: "World 1's kit at 1-1",
    config: cfgs.find((l) => l.id === '1-1')!,
    kit: (code) => ({ ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code }] } } }),
    cast: W1.manifest.creatures.map((c) => c.id),
  },
];
const PER_KIT = 60;

for (const K of KITS) {
  test(`mix and match: ${PER_KIT} node strings on ${K.name} each lay clean or fail by name, and what a clean roll asked is laid`, () => {
    const r = stream(0x51071 + K.name.length);
    const tally = { refused: 0, named: 0, built: 0, clean: 0, asks: 0, cleanAsks: 0 };
    // (per element: on how many built nodes it was laid with every ask of its node, and on how many its node named a miss)
    const laid = new Map<string, number>(), missed = new Map<string, number>();
    const examples: string[] = [];
    const castOf = (code: string) => K.kit(code).manifest;
    for (let s = 0; s < PER_KIT; s++) {
      // (§8.3's frame: a test, then a twist only after it (V4), each followed by a rest (V5); the signature in the last third (V6))
      const pmc = ['P', 'M', 'C'];
      const code = `A ${token(r, K.cast, pmc)} ${token(r, K.cast, pmc)} R ${token(r, K.cast, ['X'])} R ${token(r, K.cast, ['W', ...pmc])} R S E`;
      const M = castOf(code);
      const v = checkCode(parseCode(code), { graph: true, creatures: M.creatures.length > 0 });
      if (v.length) {
        // (refused by §8.3, each line its rule and token)
        for (const line of v) assert.match(line, /^V\d+ at token \d+: /, `${code}: ${line}`);
        tally.refused++;
        if (process.env.MIXDBG) for (const l of v) console.log('V', l.replace(/ at token \d+/, '').slice(0, 70));
        continue;
      }
      let st;
      try {
        st = buildGen2Stage({ config: K.config, kit: K.kit(code), seed: 1 + s, difficulty: 'normal' });
      } catch (e) {
        // (refused by the lay: an Error that names the stage and its reason, never a crash in the engine's own code)
        assert.ok(e instanceof Error && !(e instanceof TypeError) && !(e instanceof RangeError), `${code}: ${String(e)}`);
        assert.match(e.message, /^gen2 |^node code/, `${code}: ${e.message}`);
        tally.named++;
        continue;
      }
      tally.built++;
      const errs = st.gen2.errors;
      const asked = st.gen2.graph.nodes.filter((n) => n.asked);
      tally.asks += asked.length;
      const named = (id: string) => errs.some((e) => e.startsWith(`ask: node ${id} `));
      for (const n of asked) {
        const a = n.asked!;
        // (each element against its own miss line: "content 'f'", "move 2", "shape ^", "find (+)", "creatures (&)", "threat", ...)
        const lines = errs.filter((e) => e.startsWith(`ask: node ${n.id} `));
        for (const el of elementsOf(a)) { const m = lines.some((l) => MISS_OF[el.split(' ')[0]]?.test(l)) ? missed : laid; m.set(el, (m.get(el) ?? 0) + 1); }
        // (a Later element is never laid: always named)
        const later = (a.content && !TYPE_OF_LETTER[a.content]) || a.dials?.beat !== undefined || a.dials?.points !== undefined || a.dials?.hazard?.clock;
        if (later) assert.ok(named(n.id), `${code}: node ${n.id} asks a Later element and nothing names it`);
        // (no silent drop, re-checked on the built stage: its content type on every section, its creatures by kind and count)
        const secs = st.gen2.sections.filter((q) => q.node === n.id);
        const type = a.content ? TYPE_OF_LETTER[a.content] : undefined;
        if (type && secs.some((q) => M.sections.find((t) => t.id === q.template)?.content !== type)) assert.ok(named(n.id), `${code}: node ${n.id} asked '${a.content}' and laid another type unnamed`);
        for (const k of a.dials?.threat ?? []) {
          const def = M.creatures.find((c) => c.id === k.kind);
          const got = def ? st.enemies.filter((e) => e.type === def.enemy && secs.some((q) => e.x >= q.x0 && e.x <= q.x1)).length : 0;
          if (got !== k.count) assert.ok(named(n.id), `${code}: node ${n.id} asked ${k.kind}*${k.count}, ${got} stand there, unnamed`);
        }
        if (a.creatures && !st.enemies.some((e) => secs.some((q) => e.x >= q.x0 && e.x <= q.x1))) assert.ok(named(n.id), `${code}: node ${n.id} asked creatures, none stand there, unnamed`);
      }
      if (process.env.MIXDBG) for (const l of errs) console.log('E', l.replace(/node n\d+ "[^"]*"/, 'node').replace(/\d+/g, '#').slice(0, 90));
      if (!errs.length) {
        tally.clean++;
        tally.cleanAsks += asked.length;
        if (examples.length < 3) examples.push(code);
      }
    }
    // (the variety number: how many of the strings lay clean, each a different mix the designer wrote)
    console.log(`mix and match on ${K.name}: ${PER_KIT} strings; refused by a V-rule ${tally.refused}; refused by the lay, named ${tally.named}; built ${tally.built}, of which clean ${tally.clean} (holding ${tally.cleanAsks} asked nodes)${examples.length ? `; e.g. ${examples.join(' / ')}` : ''}`);
    const els = [...new Set([...laid.keys(), ...missed.keys()])].sort();
    console.log(`  per element (node laid whole / node named a miss): ${els.map((e) => `${e} ${laid.get(e) ?? 0}/${missed.get(e) ?? 0}`).join(', ')}`);
    assert.equal(tally.refused + tally.named + tally.built, PER_KIT);
    assert.ok(tally.built > 0, `no string built on ${K.name}`);
  });
}
