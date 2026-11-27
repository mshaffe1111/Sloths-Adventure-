/**
 * w3Level.test — World 3's LEVEL bricks (KIT-W3b, R-165.505), counted where a level's TRIMMED code asks for them (AUDIT-W3,
 * codes-trim-rolled.txt), through the real pipeline (buildGen2Stage), never placed by hand.
 *
 * THE OCELOT'S GROUND (w3-prowl-floor, w3-prowl-pair): 3-2's C beat, a ground node asking two ocelots ('Cg1&>:&ocelot*2'), is laid from
 * them with both ocelots, and no refusal names it. The pool is the audit's "nearest piece" pool (World 3's bricks over every typed World
 * 1-2 section) until World 3's own climb and rope bricks land: the other beats' refusals are those bricks' to clear, not this test's.
 * PLANTED RED: the same roll without World 3's level bricks refuses the C node by name (no ground section left / its sections floating /
 * its ocelots not laid).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { parseCode } from '../nodeCode.ts';
import { TYPE_OF_LETTER } from '../nodeAsks.ts';
import type { ContentType, GraphBrief, SectionTemplate, WorldKit } from '../types.ts';
import { w1World } from './w1.ts';
import { w2World } from './w2.ts';
import { W3_LEVEL, W3_LEVEL_STAGES, w3Ledge, w3World } from './w3.ts';

/** 3-2's trimmed code as the audit rolls it (codes-trim-rolled.txt: the asks the base can check; #dark joins with ENG-ASKS-b) */
const CODE_32 = 'A Tc1< Pg1> Pf1< Xc1&<:&ocelot*1 R Pg1< Wf1&>:&ocelot*1 R Pc1&<:&ocelot*1 Cg1&>:&ocelot*2 R Sf1&<:&ocelot*3 E';
const BOTH = ['normal', 'easy'] as const;
const SEEDS = [1, 2];

/** the audit's "nearest piece" kit for one stage and one code: World 3's arrival/rest/exit ledge, `own` (World 3's typed bricks), and
 *  every typed World 1-2 section as a stand-in for the bricks still to come (their tips left off: World 3 has none) */
function rollKit(stage: string, code: string, own: readonly SectionTemplate[]): WorldKit {
  const k = w3World(), M = k.manifest;
  const cap = 20;
  const arrive: SectionTemplate = { ...w3Ledge, id: 'lv-arrive', jobs: ['arrive'], content: 'structural', phases: ['start'] };
  const rest: SectionTemplate = { ...w3Ledge, id: 'lv-rest', jobs: ['rest'], content: 'structural', phases: ['rest'], maxPerStage: cap };
  const exit: SectionTemplate = { ...w3Ledge, id: 'lv-exit', jobs: ['exit'], content: 'structural', phases: ['goal'] };
  const typed = (s: SectionTemplate) => !!s.jobs?.length && !!s.content && s.content !== 'structural';
  const wide = [...w1World().manifest.sections, ...w2World().manifest.sections].filter(typed)
    .map((s) => ({ ...s, feel: undefined, own: undefined, maxPerStage: cap, sockets: (s.sockets ?? []).filter((q) => q.role !== 'tip') }));
  const deal: Partial<Record<ContentType, number>> = {};
  for (const t of parseCode(code)) { const ty = t.content ? TYPE_OF_LETTER[t.content] : undefined; if (ty) deal[ty] = (deal[ty] ?? 0) + 1; }
  const brief = { ends: 'quiet', trend: 'level', branching: 'none', teaches: [], deal, dealExact: true } as unknown as GraphBrief;
  return { ...k, manifest: { ...M, sections: [arrive, rest, exit, ...own, ...wide] as SectionTemplate[], required: {},
    graphs: { list: [{ id: `lv-${stage}`, archetype: 'stealth' as never, code }], briefs: { [stage]: brief }, maxPerStage: cap } } } as WorldKit;
}

type Built = { gen2: { errors?: string[]; nodes: Array<{ token: string }>; graph: { nodes: Array<{ id: string }> }; sections: Array<{ uid: string; template: string; node?: string }>; fills: Array<{ role: string; section: string; socket: string; what?: string }> } };
type Rolled = { errors: string[]; secs: string[]; onSockets: number };
/** one roll of a code; a stand-in World 1-2 section that throws on World 3's budget by name is left out and the seed re-rolled (the
 *  audit's raw.ts way). Returns the C node's laid sections and the ocelots standing on `own`'s OWN sockets there (not a top-up) */
function roll(stage: string, code: string, own: readonly SectionTemplate[], seed: number, d: (typeof BOTH)[number]): Rolled {
  const config = generateAllLevels().find((c) => c.id === stage && !c.secret)!;
  const out = new Set<string>();
  for (let tries = 0; tries < 60; tries++) {
    try {
      const k = rollKit(stage, code, own);
      k.manifest.sections = k.manifest.sections.filter((q) => !out.has(q.id));
      const g = (buildGen2Stage({ config, kit: k, seed, difficulty: d }) as unknown as Built).gen2;
      const i = g.nodes.findIndex((n) => n.token.startsWith('C'));
      const id = g.graph.nodes[i].id;
      const here = g.sections.filter((q) => q.node === id);
      const uids = new Set(here.map((q) => q.uid));
      const mine = new Set(own.flatMap((q) => q.sockets.filter((x) => x.role === 'enemy').map((x) => x.id)));
      const onSockets = g.fills.filter((f) => f.role === 'enemy' && f.what === 'ocelot' && uids.has(f.section) && mine.has(f.socket)).length;
      return { errors: [...(g.errors ?? [])], secs: here.map((q) => q.template), onSockets };
    } catch (e) {
      // (a roll the pipeline cannot finish for want of a node's content is a refusal too: "no section fits node")
      const m = String((e as Error).message);
      const w = /^gen2 section (w[12]-\S+?):? |section (w[12]-\S+) is \d+ px wide, wider than the tower/.exec(m);
      if (!w) return { errors: [m], secs: [], onSockets: 0 };
      out.add(w[1] ?? w[2]);
    }
  }
  return { errors: ['60 stand-ins thrown'], secs: [], onSockets: 0 };
}

/** the refusals that name 3-2's C node (the ground beat with two ocelots) or the pool's ground at it */
const cRefusals = (r: Rolled) => r.errors.filter((e) => /node n\d+ "C[^"]*": (threat ocelot|creatures|content 'g')|no ground section left|no section fits/.test(e));
const LEVEL_IDS = new Set(W3_LEVEL.map((s) => s.id));
/** the same bricks with no animal socket (planted red 1: the count on them drops to 0) */
const NO_SOCKETS = W3_LEVEL.map((s) => ({ ...s, sockets: s.sockets.filter((q) => q.role !== 'enemy') }));

test("World 3's level bricks are in its level stages' pools only (feel), so the towers' rolls (3-1, 3-4, 3-5) never move", () => {
  assert.deepEqual([...W3_LEVEL_STAGES], ['3-2', '3-3', '3-6', '3-7', '3-8', '3-9']);
  for (const s of W3_LEVEL) {
    assert.deepEqual([...(s.feel ?? [])], [...W3_LEVEL_STAGES], s.id);
    assert.equal(s.content, 'ground', s.id);
    assert.ok(!s.jobs?.includes('teach'), `${s.id}: the first ocelot is the build's (level.md rule 7)`);
    const foes = s.sockets.filter((q) => q.role === 'enemy');
    assert.ok(foes.length >= 1 && foes.every((q) => q.allow?.length === 1 && q.allow[0] === 'ocelot'), `${s.id}: ocelot sockets only`);
    // (the ocelot prowls its own floor: past its minGround and its sight ahead, W3_CAST / predators/world3.ts)
    for (const q of foes) { const p = s.pieces.find((x) => x.key === q.on)!; assert.ok((p.w as [number, number])[0] >= 240, `${s.id}: ${q.on} floor`); }
    // (plain steps only: nothing asks for the double, AUDIT-W3 finding 4)
    for (const p of s.pieces) if (p.place.kind === 'walk') for (const v of p.place.dy as [number, number]) assert.ok(Math.abs(v) <= 60, `${s.id}: ${p.key} step`);
  }
});

test("3-2's C beat ('Cg1&>:&ocelot*2'): laid from World 3's ocelot ground, both ocelots on its own sockets, on every roll (planted reds)", () => {
  let red = 0;
  for (const seed of SEEDS) for (const d of BOTH) {
    const r = roll('3-2', CODE_32, W3_LEVEL, seed, d);
    assert.deepEqual(cRefusals(r), [], `seed ${seed} ${d}`);
    assert.ok(r.secs.length > 0 && r.secs.every((t) => LEVEL_IDS.has(t)), `seed ${seed} ${d}: C laid ${r.secs.join(', ')}`);
    if (d === 'normal') assert.equal(r.onSockets, 2, `seed ${seed} ${d}: ocelots on the bricks' sockets`);
    else assert.ok(r.onSockets >= 1 && r.onSockets <= 2, `seed ${seed} ${d}: ${r.onSockets} on Easy`);
    // (planted red 1: the bricks' ocelot sockets taken out, the count on them drops to 0)
    assert.equal(roll('3-2', CODE_32, NO_SOCKETS, seed, d).onSockets, 0, `seed ${seed} ${d}: sockets removed`);
    // (planted red 2: no level bricks at all; World 1-2's stand-ins refuse the C beat on some rolls, AUDIT-W3 rolls/3-2-trim.txt)
    const none = roll('3-2', CODE_32, [], seed, d);
    assert.ok(none.secs.every((t) => !LEVEL_IDS.has(t)));
    if (cRefusals(none).length) red++;
  }
  assert.ok(red > 0, 'the planted red (no level bricks) refused the C beat on no roll');
});
