import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Bags, Gate, recFor, ruleFor, WORLD_SURFACE } from './sfxRec.ts';
import { TAKE_DB, BED_DB } from './sfxRecLevels.ts';
import { ENEMY_ORDER, hitArg, MATERIALS } from './combat.ts';
import { AMB_SHOTS, AMB_WORLD, AMBIENT_TYPES } from './ambience.ts';

// the takes are packed in takes.mp3 (tools/audio/sfxv1/pack.py); the beds are their own files
const pack = fs.readFileSync(new URL('../assets/sfxrec/takes.mp3', import.meta.url));
const headLen = pack.readUInt32LE(0);
const packed = JSON.parse(pack.subarray(4, 4 + headLen).toString('utf8')) as Array<[string, number]>;
const beds = fs.readdirSync(new URL('../assets/sfxrec/', import.meta.url)).filter((f) => /^bed\d+_\d+\.mp3$/.test(f));
const files = [...packed.map(([n]) => n), ...beds];
const takes = (fx: string) => files.filter((f) => new RegExp(`^${fx}_\\d+\\.mp3$`).test(f)).length;

test('every effect the game asks for has recorded takes, and every take its level', () => {
  const calls: Array<[string, number | undefined]> = [
    ['jump', undefined], ['doubleJump', undefined], ['punch', undefined], ['kick', undefined], ['megaPunch', undefined], ['whoosh', undefined],
    ['flower', 3], ['leaf', undefined], ['fruit', undefined], ['heart', undefined], ['superHeart', undefined], ['relic', undefined],
    ['critter', undefined], ['hurt', undefined], ['eagle', undefined], ['climb', undefined], ['checkpoint', undefined], ['oneUp', undefined],
    ['uiTap', undefined], ['uiConfirm', undefined], ['uiBack', undefined], ['pauseIn', undefined], ['pauseOut', undefined], ['respawn', undefined],
    ['vine', undefined], ['shrine', undefined], ['bossAppear', 1], ['rock', undefined], ['rockWarn', undefined], ['windChime', undefined],
    ...Array.from({ length: 11 }, (_, i) => ['bossTell', i + 1] as [string, number]),
    ['bounce', undefined], ['log', undefined], ['crumble', undefined], ['thorns', undefined], ['gate', undefined],
    ...[0, 1, 2].map((a) => ['glide', a] as [string, number]), ...[0, 1, 2].map((a) => ['power', a] as [string, number]),
    ...[0, 1, 2].map((a) => ['star', a] as [string, number]), ...[0, 1, 2].map((a) => ['splash', a] as [string, number]),
    ...[0.1, 0.5, 0.9].map((a) => ['land', a] as [string, number]),
    ...MATERIALS.flatMap((m) => [hitArg(false, m), hitArg(true, m)].map((a) => ['hit', a] as [string, number])),
    ...ENEMY_ORDER.map((_, i) => ['defeat', i] as [string, number]), ['defeat', 99],
  ];
  for (const [name, arg] of calls) {
    const r = recFor(name, arg);
    assert.ok(r, `${name} is recorded`);
    const n = takes(r!.fx);
    assert.ok(n >= 1, `${name} -> ${r!.fx} has takes`);
    for (const k of r!.takes ?? []) assert.ok(k < n, `${name} -> ${r!.fx} take ${k} of ${n}`);
    assert.equal(TAKE_DB[r!.fx]?.length, n, `${r!.fx}: a level for every take`);
  }
  for (const s of ['moss', 'wood', 'stone', 'water'] as const) assert.ok(takes(recFor('step', undefined, s)!.fx) >= 6, s);
  // the few the recorded set leaves to their synthesized versions
  for (const n of ['roar', 'ocelotCall', 'levelStart', 'heartbeat']) assert.equal(recFor(n, 0), null, n);
});

test('the effects that fire often have three or more takes, and every hit is its own body (no shared generic hit)', () => {
  for (const fx of ['jump', 'doubleJump', 'swish', 'flower', 'stepMoss', 'stepWood', 'stepStone', 'stepWater', 'rock', 'vine', 'leaf', 'climb', 'uiTap', 'windChime']) {
    assert.ok(takes(fx) >= 3, `${fx}: ${takes(fx)} takes`);
  }
  assert.equal(recFor('hit', hitArg(false, 'fur'))!.fx, 'hit_fur');
  assert.deepEqual(recFor('hit', hitArg(true, 'scale'))!.takes, [3, 4, 5]);
  assert.equal(recFor('defeat', ENEMY_ORDER.indexOf('jaguar'))!.fx, 'ko_jaguar');
  assert.equal(recFor('defeat', ENEMY_ORDER.indexOf('ant_hazard'))!.fx, 'ko_ant');
});

test('a landing is picked by how far he fell; footsteps by the ground', () => {
  assert.deepEqual(recFor('land', 0.1)!.takes, [0, 1]);
  assert.deepEqual(recFor('landing', 0.5)!.takes, [2, 3]);
  assert.deepEqual(recFor('land', 1)!.takes, [4, 5]);
  assert.equal(recFor('step', undefined, WORLD_SURFACE[4])!.fx, 'stepStone');
  assert.equal(recFor('step', undefined, WORLD_SURFACE[8])!.fx, 'stepWood');
});

test('the shuffle bag plays every take once before any repeats, and never the same one twice in a row', () => {
  let seed = 7;
  const bags = new Bags(() => ((seed = (seed * 16807) % 2147483647) / 2147483647));
  const seq: number[] = [];
  for (let i = 0; i < 60; i++) seq.push(bags.next('x', [0, 1, 2, 3, 4, 5]));
  for (let i = 0; i < 60; i += 6) assert.equal(new Set(seq.slice(i, i + 6)).size, 6);
  for (let i = 1; i < 60; i++) assert.notEqual(seq[i], seq[i - 1]);
});

test('rocks never stack: four inside 0.7 s play at most three, and two inside the gap play one', () => {
  const g = new Gate();
  const played = [0, 0.13, 0.26, 0.29].filter((t) => g.allow('rock', t)).length;
  assert.equal(played, 3);
  const g2 = new Gate();
  assert.equal([0, 0.05].filter((t) => g2.allow('rock', t)).length, 1);
  assert.equal(ruleFor('windChime').gap, 1.4);
});

test('every place has its recorded bed and level, and its one-shots exist', () => {
  for (const t of AMBIENT_TYPES) {
    const w = AMB_WORLD[t];
    assert.equal(takes(`bed${w}`), 1, t);
    assert.ok(Number.isFinite(BED_DB[w]), `${t}: level`);
    const s = AMB_SHOTS[t];
    if (s) assert.ok(takes(s.fx) >= 2, `${t}: ${s.fx}`);
  }
});

test('the recorded set stays small: under 3 MB in all, no take over 200 KB, and the pack adds up', () => {
  let total = pack.length;
  for (const [n, len] of packed) assert.ok(len < 200_000, `${n}: ${len}`);
  assert.equal(4 + headLen + packed.reduce((a, [, n]) => a + n, 0), pack.length);
  for (const f of beds) {
    total += fs.statSync(new URL(`../assets/sfxrec/${f}`, import.meta.url)).size;
  }
  assert.ok(total < 3_000_000, `${total}`);
});
