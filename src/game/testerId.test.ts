// The tester code (the lead, 11-06): 6 random letters made once per device, on every row the recorder sends (the Player cell and the
// data), shown on the testers' front page; where storage is blocked, one for the visit only, marked '~'.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { ID_ABC, playerCell, recorder, testerId } from './playRecorder.ts';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

test('the tester code is 6 easy letters, made once and the same on every later visit (a reload reads it back)', () => {
  const s = mem();
  const a = testerId(s);
  assert.match(a, /^[A-Z2-9]{6}$/);
  for (const ch of a) assert.ok(ID_ABC.includes(ch) && !'01OI'.includes(ch), ch);
  assert.equal(s.m.get('sloth_qa_tester_id'), a, 'kept under sloth_qa_tester_id');
  // (a reload: a fresh read of the same storage)
  assert.equal(testerId(s), a);
  assert.equal(testerId(s, () => 0.99), a, 'never remade once kept');
  // two devices: two codes (random, nothing read from the phone)
  let n = 0;
  const b = testerId(mem(), () => ((n += 0.137) % 1));
  assert.notEqual(b, a);
});

test("blocked storage: a code for this visit only, marked with '~', the same all visit long", () => {
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  const a = testerId(blocked);
  assert.match(a, /^~[A-Z2-9]{6}$/);
  assert.equal(testerId(blocked), a);
  assert.equal(testerId(null), a, 'no storage at all: the same visit code');
  // a store that takes the write but keeps nothing (a private mode) counts as blocked
  const forgetful = { getItem: () => null, setItem: () => {} };
  assert.equal(testerId(forgetful), a);
});

test('every row the recorder sends carries the code: in the Player cell ("Name · CODE") and in the data', async () => {
  const id = testerId();
  assert.equal(playerCell('Matt', id), `Matt · ${id}`);
  const rec = recorder as unknown as { on: boolean; who: string; lines: unknown[][]; send: (b: { who: string; d: string }, l: boolean) => void; push: (l: unknown[]) => void; flush: (l: boolean) => Promise<void> };
  const was = { on: rec.on, who: rec.who, send: rec.send };
  const rows: Array<{ who: string; d: string }> = [];
  // (the device line reads the screen's size: a plain one for the test)
  const g = globalThis as unknown as { screen?: unknown; matchMedia?: unknown };
  const hadScreen = 'screen' in g, hadMM = 'matchMedia' in g;
  if (!hadScreen) g.screen = { width: 412, height: 915 };
  if (!hadMM) g.matchMedia = () => ({ matches: false });
  try {
    rec.on = true;
    rec.who = 'Matt';
    rec.send = (b) => rows.push(b);
    rec.push(['e', 0, 'tester', id]);
    rec.push(['e', 5, 'section', 'x']);
    await rec.flush(false);
    rec.push(['e', 9, 'hurt', 2]);
    await rec.flush(false);
  } finally {
    rec.on = was.on;
    rec.who = was.who;
    rec.send = was.send;
    if (!hadScreen) delete g.screen;
    if (!hadMM) delete g.matchMedia;
  }
  assert.equal(rows.length, 2);
  for (const r of rows) assert.equal(r.who, `Matt · ${id}`);
  // the data: start() writes the 'tester' moment first thing (read from the source: start() needs a whole page)
  const src = (await import('node:fs')).readFileSync(new URL('./playRecorder.ts', import.meta.url), 'utf8');
  assert.match(src, /this\.push\(\['e', 0, 'tester', testerId\(\)\]\)/);
});
