// The designer's asks (nodeAsks.ts, NODES.md §8.9, R-165.198): every mark and dial a node's code writes is LAID or the roll FAILS BY
// NAME, never dropped. Planted: each element asked and not laid is named; each element laid passes; no graph written before the long
// form asks anything, so nothing shipped moves.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { askMisses, asksOf, ELEMENTS, hazardMiss, type LaidNode, type NodeAsks } from './nodeAsks.ts';
import { JOB_OF, parseCode } from './nodeCode.ts';
import { legMarks } from './legs.ts';
import { buildGen2Stage } from './pipeline.ts';
import { SPRINT_CODES } from './graphs.ts';
import { ARC_12 } from './worlds/w1Arc12.ts';
import { ARC_CODE, towerCfg } from './toyTower.ts';
import { DOWN_CODE, MIXED_CODE, mixKit, UP_CODE } from './toyLegs.ts';
import { w1World } from './worlds/w1.ts';
import { readFileSync } from 'node:fs';

const asksOfCode = (code: string) => parseCode(legMarks(code).code).map((t) => asksOf(t, JOB_OF[t.job]));
const ask = (token: string): NodeAsks => asksOf(parseCode(token)[0], JOB_OF[parseCode(token)[0].job])!;
const node = (over: Partial<LaidNode> = {}): LaidNode => ({ id: 'n2', token: 'P', sections: [{ content: 'ground', double: false, dy: 0 }], enemies: [], finds: [], pickups: 0, ...over });
const CAST = [{ id: 'spider' }, { id: 'snake-asleep', tags: ['sleeper'] }];

test('node asks: no graph written before the long form asks anything (every shipped and fixture graph lays as it did)', () => {
  const codes = [...Object.values(SPRINT_CODES), ...Object.values(ARC_12), ARC_CODE, MIXED_CODE, UP_CODE, DOWN_CODE, ...(w1World().manifest.graphs?.list ?? []).map((g) => g.code)];
  for (const code of codes) assert.deepEqual(asksOfCode(code).filter(Boolean), [], code);
  // (a mark the job implies is no ask: a climb's ^, a descent's _)
  assert.equal(asksOf(parseCode('U^')[0], 'climb'), undefined);
  assert.equal(asksOf(parseCode('D_')[0], 'descent'), undefined);
  assert.deepEqual(ask('Pg2^+&&>:7'), { content: 'g', move: '2', shape: '^', find: true, creatures: true, formation: true, tempo: '>', dials: { rating: 7 } });
});

test('node asks (planted): each element asked and not laid is named; laid, it passes', () => {
  const m = (a: string, n: Partial<LaidNode> = {}, easy = false) => askMisses(ask(a), node(n), CAST, easy).join('; ');
  // content: every section the type, an untyped one too is a miss; a building block with no emitter here is Later, named
  assert.equal(m('Pg'), '');
  assert.match(m('Pf'), /content 'f' \(floating\): 1 of 1 sections are ground/);
  assert.match(m('Pg', { sections: [{ double: false, dy: 0 }] }), /1 of 1 sections are untyped/);
  for (const l of ['s', 'v', 'p', 't', 'x']) assert.match(m(`P${l}`), new RegExp(`content '${l}' .*Later`));
  // move, shape
  assert.match(m('Pg2'), /move 2 \(the double\): no section there asks for it/);
  assert.equal(m('Pg2', { sections: [{ content: 'ground', double: true, dy: 0 }] }), '');
  assert.match(m('Pg1', { sections: [{ content: 'ground', double: true, dy: 0 }] }), /move 1 \(plain jumps\)/);
  assert.match(m('P^'), /shape \^ \(rising\): its sections rise 0 px/);
  assert.equal(m('P^', { sections: [{ content: 'ground', double: false, dy: -90 }] }), '');
  assert.match(m('P_', { sections: [{ content: 'ground', double: false, dy: -90 }] }), /shape _ \(falling\)/);
  // find, creatures, formation
  assert.match(m('P+'), /find \(\+\): no find laid/);
  assert.equal(m('P+:+seed', { finds: ['seed'] }), '');
  assert.match(m('P&'), /creatures \(&\): no creature laid/);
  assert.match(m('P&&', { enemies: [{ kind: 'spider', asleep: false }] }), /formation \(&&\): 1 creature laid/);
  // threat: the count exactly on Normal, at most and at least one on Easy; only the kinds named; asleep where the world lays it so
  assert.match(m('P&:&spider*2', { enemies: [{ kind: 'spider', asleep: false }] }), /threat spider\*2: laid 1/);
  assert.equal(m('P&:&spider*2', { enemies: [{ kind: 'spider', asleep: false }] }, true), '');
  assert.match(m('P&:&spider', { enemies: [] }, true), /threat spider\*1: laid 0 on Easy/);
  assert.match(m('P&:&dragon'), /threat dragon: no creature of that id/);
  assert.match(m('P&:&spider', { enemies: [{ kind: 'spider', asleep: false }, { kind: 'snake-asleep', asleep: true }] }), /also laid snake-asleep/);
  assert.match(m('P&:&spider*1z', { enemies: [{ kind: 'spider', asleep: false }] }), /threat spider asleep: this world lays it awake/);
  assert.match(m('P&:&snake-asleep*1!', { enemies: [{ kind: 'snake-asleep', asleep: true }] }), /threat snake-asleep awake/);
  // reward, and the Later dials: always named
  assert.match(m('P+:+seed', { finds: ['mark'] }), /reward \+seed: laid mark/);
  assert.match(m('P:$8', { pickups: 6 }), /reward \$8: laid 6 pickups/);
  assert.equal(m('P:$3', { pickups: 3 }), '');
  assert.match(m('P:t0.9'), /beat t0.9: Later/);
  assert.match(m('P:p5'), /points p5: Later/);
  assert.match(m('P:#pods@beat'), /hazard #pods@beat: Later/);
  assert.match(m('P:#lava'), /hazard #lava: Later/);
  // hazard: a fall of that kind under the node's span
  assert.deepEqual(hazardMiss(ask('P:#water'), 'n2', 'P', [100, 400], [{ x0: 200, x1: 300, kind: 'water' }]), []);
  assert.match(hazardMiss(ask('P:#hurt'), 'n2', 'P', [100, 400], [{ x0: 200, x1: 300, kind: 'water' }]).join(), /hazard #hurt: laid water/);
  assert.match(hazardMiss(ask('P:#void'), 'n2', 'P', [100, 400], []).join(), /no fall in its span/);
});

const ID = '5-95';
const build = (code: string, seed = 1) => buildGen2Stage({ config: towerCfg(ID, 'sprint'), kit: mixKit(ID, code), seed, difficulty: 'normal' });
const asksIn = (code: string) => build(code).gen2.errors.filter((e) => e.startsWith('ask: '));

test('node asks: on a built roll, a threat is laid on the node and a Later element fails the roll by name', () => {
  // (the toy cast's spider on a run node: laid on its creature brick, nothing named)
  const st = build('A P Cg&:&spider*1 R S E');
  assert.deepEqual(st.gen2.errors.filter((e) => e.startsWith('ask: ')), []);
  const n = st.gen2.graph.nodes.find((q) => q.asked)!;
  assert.deepEqual(n.dials?.threat, [{ kind: 'spider', count: 1 }]);
  const span = st.gen2.sections.filter((q) => q.node === n.id);
  assert.equal(st.enemies.filter((e) => span.some((q) => e.x >= q.x0 && e.x <= q.x1)).length, 1);
  assert.match(asksIn('A P Cg:t0.9 R S E').join(), /ask: node n3 "Cg1.?.?": beat t0.9: Later/);
  assert.match(asksIn('A P Cs R S E').join(), /content 's' \(swing\): Later/);
});

test('node asks (planted): an ask the brief would drop, and marks inside a fork road, fail by name before the lay', () => {
  // (the toy brief ends quiet: the rest before the exit goes, and with it a rest that asks for pickups)
  assert.throws(() => build('A P M X R S R:$3 E'), /the brief drops node 7 \(rest\), which asks/);
  assert.doesNotThrow(() => build('A P F[P^+|P] R S E'));
  assert.throws(() => build('A P F[P^+|Pg] R S E'), /a fork's roads are laid as one two-road section; marks inside a road are not laid yet/);
  assert.throws(() => build('A P R ?[M|P] R S E'), /is a pick node, which is not laid yet/);
});

test("node asks: NODE-KEY.html's cards show each element's status from ELEMENTS (one source)", () => {
  const html = readFileSync(new URL('../../../reference/engine/NODE-KEY.html', import.meta.url), 'utf8');
  const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // (tools/engine/nodekey.ts writes them; a card out of step with the table fails here)
  for (const e of ELEMENTS) assert.ok(html.includes(`data-element="${esc(e.element)}" data-status="${e.status}"`), `NODE-KEY.html has no card for "${e.element}" at status ${e.status}: run tools/engine/nodekey.ts`);
});
