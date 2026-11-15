// METER-2a (R-165.272; reference/design/METER-COVERAGE.md §3): the meter's coverage gate and the meter's refusal of a piece it has no
// channel for. Each test plants the fault the gate exists for and expects it named; the real-stage tests run score.ts as the gate does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { judge, unionOf, fieldUnionOf, beatFamiliesOf, resolves, vocabulary, TABLE_FILE, KNOWN_FILE, type Table } from './coveragecheck.ts';
import { scoreStage, unpriced, UnpricedPiece, COVERAGE_KNOWN, type CoverageKnown } from './score.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
const TABLE: Table = JSON.parse(fs.readFileSync(path.join(ROOT, TABLE_FILE), 'utf8'));
const uses = (...xs: Array<[string, string]>) => new Map(xs.map(([id, st]) => [id, new Set([st])]));
const faults = (vocab: string[], table: Table, known: CoverageKnown[], u: Map<string, Set<string>>, refused: string[] = []) => judge(vocab, table, known, u, refused).faults;
const VOCAB = vocabulary();
const known = (id: string, missing: Array<'bot' | 'channel'>): CoverageKnown => ({ id, missing, R: 'R-165.272', owner: 'test', stages: ['1-1'], why: 'planted' });

test('the vocabulary is read from the code: a new ZoneKind with no table entry fails (a)', () => {
  // (the parser reads a union with comments between; a new kind in a fixture source comes out)
  assert.deepEqual(unionOf("export type ZoneKind = 'spore' | 'wind' // a gust\n | 'fog';", 'ZoneKind'), ['spore', 'wind', 'fog']);
  assert.deepEqual(fieldUnionOf("export interface Platform {\n  id: number;\n  type: 'solid' | 'raft';\n}", 'Platform', 'type'), ['solid', 'raft']);
  assert.ok(VOCAB.includes('zone:wind') && VOCAB.includes('move:timedHop') && VOCAB.includes('platform:drift') && VOCAB.includes('beat:rivers'));
  const f = faults([...VOCAB, 'zone:fog'], TABLE, [...COVERAGE_KNOWN], new Map());
  assert.ok(f.some((x) => x.startsWith('(a) zone:fog: in the code, no entry')), f.join('\n'));
  // (and the table naming a piece the code dropped)
  const f2 = faults(VOCAB.filter((x) => x !== 'zone:wind'), TABLE, [...COVERAGE_KNOWN], new Map());
  assert.ok(f2.some((x) => x.startsWith('(a) zone:wind: in reference/design/meter-coverage.json, but the code has no such piece')), f2.join('\n'));
});

test("beats.ts's families are its off() labels: addAs, a 'beat:' literal and a span's label; a zone span passes its own", () => {
  const src = "if (i < 0) off('owls'); else addAs('owls', i, 'Z', 'owl');\nadd(i, 'h', 'arc', 0, 0.5, 'beat:arcs');\nspan(b, 1e9, 'Z', 'a river', 1.0, 'rivers');\nspan(b, 2, 'Z', 'fog', 0, 'fogs', `zone:${z.kind}`);";
  assert.deepEqual(beatFamiliesOf(src).sort(), ['beat:arcs', 'beat:owls', 'beat:rivers']);
});

test('a symbol the table names must resolve: a renamed channel fails (e)', () => {
  assert.equal(resolves('tools/difficulty/score.ts#moveOf'), null);
  assert.equal(resolves('tools/difficulty/score.ts#OTHER_BITS.climb'), null);
  assert.equal(resolves('tools/inspect/firsttimer.ts#FirstTimerRun.lianaWait'), null);
  assert.match(resolves('tools/difficulty/score.ts#moveOfRenamed') ?? '', /declares no moveOfRenamed/);
  assert.match(resolves('tools/difficulty/score.ts#OTHER_BITS.hover') ?? '', /has no hover/);
  const t: Table = { ...TABLE, pieces: { ...TABLE.pieces, 'move:jump': { ...TABLE.pieces['move:jump'], channel: 'tools/difficulty/score.ts#moveOfRenamed' } } };
  assert.ok(faults(VOCAB, t, [...COVERAGE_KNOWN], new Map()).some((x) => x.startsWith('(e) move:jump.channel')));
});

test('a piece a built stage uses needs a bot AND a channel, or a known-list entry for the missing half (b)', () => {
  const t: Table = { ...TABLE, pieces: { ...TABLE.pieces, 'zone:fog': { bot: 'tools/inspect/firsttimer.ts#FirstTimerRun.intend', channel: null, rows: [] } } };
  const f = faults([...VOCAB, 'zone:fog'], t, [], uses(['zone:fog', '9-9']));
  assert.ok(f.some((x) => x === '(b) zone:fog on 9-9: no channel (a built stage uses it: give it one, METER-COVERAGE §2)'), f.join('\n'));
  assert.ok(!f.some((x) => x.startsWith('(b) zone:fog on 9-9: no bot')), 'the bot half is there');
  // (the pushback the lead approved: EITHER half missing fails, not only both)
  const g = faults([...VOCAB, 'zone:fog'], t, [known('zone:fog', ['channel'])], uses(['zone:fog', '9-9']));
  assert.ok(!g.some((x) => x.startsWith('(b) zone:fog')), g.join('\n'));
});

test('the known list only shrinks: a covered entry, or one no built stage uses, fails (d)', () => {
  const f = faults(VOCAB, TABLE, [known('move:jump', ['channel'])], uses(['move:jump', '1-1']));
  assert.ok(f.some((x) => x.startsWith('(d) known move:jump channel: covered now')), f.join('\n'));
  const g = faults(VOCAB, TABLE, [known('zone:tide', ['channel'])], new Map());
  assert.ok(g.some((x) => x === '(d) known zone:tide: no built stage uses it now: take it off tools/difficulty/coverage.known.json'), g.join('\n'));
  // (and knowncheck holds the file to shrink-only against main)
  assert.match(fs.readFileSync(path.join(ROOT, 'tools/perf/knowncheck.mjs'), 'utf8'), /tools\/difficulty\/coverage\.known\.json/);
  for (const k of COVERAGE_KNOWN) assert.ok(k.R === 'R-165.272' && k.owner && k.why, `${k.id}: R-165.272, owner, why`);
});

test('the meter refuses a piece it has no channel for: unpriced throws, a known one keeps its old price; a refusal is a fault (c)', () => {
  assert.throws(() => unpriced('zone:fog', 'test', 2), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'zone:fog' && /^unpriced piece zone:fog/.test(e.message));
  const k = COVERAGE_KNOWN.find((x) => x.missing.includes('channel'))!;
  assert.deepEqual(unpriced(k.id, 'test', 2), { bits: 2, note: ` [unpriced: ${k.id}, known R-165.272]` });
  assert.ok(faults(VOCAB, TABLE, [...COVERAGE_KNOWN], new Map(), ['1-1 normal seed 1: unpriced piece zone:fog']).includes('(c) 1-1 normal seed 1: unpriced piece zone:fog'));
});

test("on real stages: a stage with an unpriced piece is refused (4-2's wind), never a flat 2; 1-4's known crumbling branch keeps its 2 bits, marked", () => {
  assert.throws(() => scoreStage('4-2', 'normal', 1, new Map()), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'zone:wind');
  const r = scoreStage('1-4', 'normal', 1, new Map());
  const crumble = r.challenges.filter((c) => c.kind === 'hazard' && /crumbling branch/.test(c.note));
  assert.ok(crumble.length > 0, '1-4 has its crumbling branch');
  for (const c of crumble) { assert.equal(c.bits, 2); assert.match(c.note, /\[unpriced: beat:crumbling branches, known R-165\.272\]/); }
  assert.ok(r.pieces.includes('beat:crumbling branches') && r.pieces.includes('platform:fragile') && r.pieces.includes('move:climb'));
});
