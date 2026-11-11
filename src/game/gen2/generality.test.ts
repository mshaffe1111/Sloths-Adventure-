/**
 * The generality gate (tools/engine/generalitycheck.ts, R-165.123, D43): engine code never names one stage. These tests plant each kind
 * of literal into the real engine and require the gate to fail on it, and prove what must not trip it (comments, Dot's words, offsets).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KNOWN_FILE, ROOT, judge, knownIds, scan, scope, tokenize, type Known } from '../../../tools/engine/generalitycheck.ts';

const known: Known[] = JSON.parse(fs.readFileSync(path.join(ROOT, KNOWN_FILE), 'utf8')).known;
const today = () => scope().files.flatMap((f) => scan(fs.readFileSync(path.join(ROOT, f), 'utf8'), f));
const ENGINE = 'src/game/engine.ts';
const engineSrc = fs.readFileSync(path.join(ROOT, ENGINE), 'utf8');

test("today's engine passes with its known debt, and the debt is all counted", () => {
  const { fresh, stale } = judge(today(), known);
  assert.deepEqual(fresh.map((h) => `${h.file}:${h.line} ${h.code}`), [], 'a literal not on the known list');
  assert.deepEqual(stale.map((s) => s.entry.code), [], 'a known literal that is gone');
  assert.ok(known.every((e) => e.count >= 1 && e.why && e.owner), 'every entry has a count, a why and an owner (LAWS.md law 5)');
});

const PLANTED: Array<[string, string, string]> = [
  ['stage id', "if (this.currentStage.config.id === '3-4') this.lives++;", 'stage-id'],
  ["a world's prefix", "const deep = this.currentStage.config.id.startsWith('7-');", 'stage-id'],
  ['a stage id inside a name', "const scope = 'normal-2-5';", 'stage-id'],
  ['a stage-keyed map', "const KITS = { '6-3': 1 };", 'stage-id'],
  ['a world number', 'if (this.currentStage.config.worldIndex === 6) this.lives++;', 'world-key'],
  ['a world number, reversed', 'if (6 <= cfg.worldIndex) this.lives++;', 'world-key'],
  ['a world list', 'if ([2, 5].includes(cfg.worldIndex)) this.lives++;', 'world-key'],
  ['a world switch', 'switch (cfg.worldIndex) { case 7: break; }', 'world-key'],
  ['a seed compared', 'if (seed === 4106) return;', 'seed'],
  ['a seed given', 'const req = { layoutSeed: 777 };', 'seed'],
  ['a seed list', 'const seeds = [172, 476, 323];', 'seed'],
  ['a layout roll picked', 'setLayoutVariant(31);', 'seed'],
  ['an x place compared', 'if (this.player.x > 30784) this.lives++;', 'x-pos'],
  ['an x place given', 'const flag = { x: 12000, y: 300 };', 'x-pos'],
  ['an x place set', 'this.player.x = 4500;', 'x-pos'],
];

for (const [name, line, kind] of PLANTED) {
  test(`a planted literal fails the gate: ${name}`, () => {
    const hits = [...today().filter((h) => h.file !== ENGINE), ...scan(`${engineSrc}\n${line}\n`, ENGINE)];
    const { fresh } = judge(hits, known);
    assert.equal(fresh.length, 1, `${line} -> ${fresh.map((h) => h.code).join(' | ') || 'nothing'}`);
    assert.equal(fresh[0].kind, kind);
  });
}

test('what is not code, or not one place, does not trip it', () => {
  const quiet = [
    "// on 3-4 he meets the snake (a comment)",
    '/* worldIndex === 6 */',
    "const say = 'Wait 3-4 seconds, then jump!';", // Dot's words
    'const t = `${n} of 5-6 flowers`;',
    'if (p.x > camX + 900) this.lives++;', // an offset from the camera, under X_MIN
    'if (dx > 4000) this.lives++;', // a distance, not a place
    'const SEED_LIST_MIN = 100;', // a count of seeds
    'const r = rngFor(seed, 67);', // a stream salt
    'const half = k.high! / 0.73; const ok = /1-1/.test(id);', // division after a non-null mark; a regex is not a string
  ];
  for (const line of quiet) assert.deepEqual(scan(line, ENGINE).map((h) => h.code), [], line);
});

test('a known literal that is fixed must leave the list (shrink-only)', () => {
  const hits = today();
  const e = known[0];
  const fixed = hits.filter((h) => !(h.file === e.file && h.kind === e.kind && h.code === e.code));
  const { stale } = judge(fixed, known);
  assert.equal(stale.length, 1);
  assert.equal(stale[0].entry.code, e.code);
});

test('a new file in an engine folder is checked from its first commit; world data, seed lists and tests are not', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'generality-'));
  for (const f of ['src/game/gen2/newMachine.ts', 'src/game/gen2/worlds/w9.ts', 'src/game/gen2/seeds.ts', 'src/game/gen2/newMachine.test.ts']) {
    fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
    fs.writeFileSync(path.join(tmp, f), "export const S = '9-1';\n");
  }
  const s = scope(tmp);
  assert.deepEqual(s.files, ['src/game/gen2/newMachine.ts']);
  assert.deepEqual(s.exempt.map(([f]) => f).sort(), ['src/game/gen2/newMachine.test.ts', 'src/game/gen2/seeds.ts', 'src/game/gen2/worlds/w9.ts']);
  fs.rmSync(tmp, { recursive: true });
});

test('the tokenizer reads templates, regexes and comments the way the language does', () => {
  const ts = tokenize("const a = `x ${b ? `in ${c}` : '9-9'} y`; // '1-1'\nconst r = /'/; const s = '2-2';");
  const strs = ts.filter((t) => t.t === 'str').map((t) => t.v);
  assert.deepEqual(strs, ['x ', 'in ', '', '9-9', ' y', '2-2']);
});

test("knowncheck counts this list's entries, so an added literal or a raised count fails it", () => {
  const kc = fs.readFileSync(path.join(ROOT, 'tools/perf/knowncheck.mjs'), 'utf8');
  assert.ok(kc.includes(KNOWN_FILE), 'tools/perf/knowncheck.mjs lists the generality known list');
  const ids = knownIds(known);
  assert.equal(ids.length, known.reduce((a, e) => a + e.count, 0));
  assert.equal(new Set(ids).size, ids.length);
});
