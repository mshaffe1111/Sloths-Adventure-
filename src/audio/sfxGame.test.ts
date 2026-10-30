import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PUZZLE_KIND, PUZZLE_SOUNDS } from './sfxGame.ts';
import { recForPuzzle } from './sfxRec.ts';
import { CUE_NAMES, cuePlan, degreeMidi } from './cues.ts';
import { parseOrchName } from './orchNames.ts';

const KEYS = [
  { tonic: 60, scale: [0, 2, 4, 5, 7, 9, 11] },
  { tonic: 62, scale: [0, 2, 3, 5, 7, 9, 10] },
  { tonic: 64, scale: [0, 1, 3, 5, 7, 8, 10] },
  { tonic: 57, scale: [0, 2, 3, 5, 7, 8, 11] },
];

test('the stingers are in the music\'s key: every note and chord tone is a note of its scale', () => {
  for (const key of KEYS) {
    const scale = new Set(key.scale.map((x) => (x + key.tonic) % 12));
    for (const name of CUE_NAMES) {
      const p = cuePlan(name, key, 0.5);
      for (const n of p.notes) assert.ok(scale.has(n.midi % 12), `${name}: ${n.midi}`);
      for (const c of p.chords) for (const m of c.midi) assert.ok(scale.has(m % 12), `${name}: ${m}`);
    }
  }
  assert.equal(degreeMidi(KEYS[0], 0, 60), 60);
  assert.equal(degreeMidi(KEYS[0], 7, 60), 72);
  assert.equal(degreeMidi(KEYS[0], -1, 60), 59);
});

test('the checkpoint stinger is about a second, and bright (it climbs to the octave and above)', () => {
  for (const key of KEYS) {
    const p = cuePlan('checkpoint', key, 0.5);
    assert.ok(p.length >= 0.8 && p.length <= 1.2, `${p.length}s`);
    assert.ok(Math.max(...p.notes.map((n) => n.midi)) >= key.tonic + 19);
  }
});

test('twelve puzzle sounds, and every puzzle event the stages fire has one of them', () => {
  assert.equal(PUZZLE_SOUNDS.length, 12);
  for (const s of Object.values(PUZZLE_KIND)) assert.ok(PUZZLE_SOUNDS.includes(s));
  // the kits' sfx hooks in the engine: every `kind === '...'` they test
  const src = fs.readFileSync(new URL('../game/engine.ts', import.meta.url), 'utf8');
  const hooks = [...src.matchAll(/sfx: \(kind\) => \{([\s\S]*?)\n {6}\},/g)].map((m) => m[1]);
  assert.ok(hooks.length >= 3, 'found the kits\' sound hooks');
  const kinds = new Set(hooks.flatMap((h) => [...h.matchAll(/kind === '([a-z]+)'/g)].map((m) => m[1])));
  for (const k of kinds) {
    // the animals' own calls keep their animal sounds
    if (['cry', 'monkey', 'scratch', 'cut', 'blink', 'card', 'next', 'step', 'blanket'].includes(k)) continue;
    assert.ok(PUZZLE_KIND[k], `the puzzle event '${k}' has no sound of its own`);
  }
  assert.equal(PUZZLE_KIND.wrap, 'wrap', "a vine wrapping is not the player's hurt sound any more");
  assert.notEqual(PUZZLE_KIND.reset, undefined);
});

test('every puzzle sound has its recorded takes (sfxRec.ts recForPuzzle)', () => {
  const pack = fs.readFileSync(new URL('../assets/sfxrec/takes.mp3', import.meta.url));
  const files = (JSON.parse(pack.subarray(4, 4 + pack.readUInt32LE(0)).toString('utf8')) as Array<[string, number]>).map(([n]) => n);
  for (const k of PUZZLE_SOUNDS) {
    const fx = recForPuzzle(k).fx;
    assert.ok(files.some((f) => f.startsWith(fx + '_')), `${k} -> ${fx} has no takes`);
  }
});

test('an orchestra file names its loop exactly (SN-8): start in ms and, for a held note, length in samples', () => {
  assert.deepEqual(parseOrchName('/x/oboe_89_300_80157.mp3'), { inst: 'oboe', midi: 89, loop: 0.3, len: 80157 / 44100 });
  assert.deepEqual(parseOrchName('/x/harp_60_0.mp3'), { inst: 'harp', midi: 60, loop: 0, len: 1.8 });
  // every held note in the bank says its length, and every loop is a little under or over 1.8 s
  const dir = new URL('../assets/orch/', import.meta.url);
  const held = fs.readdirSync(dir).map((f) => parseOrchName('/' + f)).filter((n) => n && n.loop > 0);
  assert.ok(held.length >= 100);
  for (const n of held) assert.ok(n!.len > 1.75 && n!.len < 1.85, `${n!.inst} ${n!.midi}: ${n!.len}`);
});
