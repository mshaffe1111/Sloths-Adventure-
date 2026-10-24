import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTERS, PAGES, isOpen, takeNewlyOpened, isNew, markLooked, type Progress } from './movesJournal.ts';
import { LESSONS } from './lessons.ts';

const none: Progress = { lessons: new Set(), tipHeard: () => false, cleared: () => false, skills: new Set(), finds: [] };

test('every page is complete: an id, a chapter, words and moves for touch, pad and keyboard', () => {
  const ids = new Set<string>();
  for (const p of PAGES) {
    assert.ok(!ids.has(p.id), `${p.id} is unique`);
    ids.add(p.id);
    assert.ok(CHAPTERS.some((c) => c.id === p.chapter), `${p.id} has a chapter`);
    assert.ok(p.title && p.intro.length > 20, `${p.id} has a title and an intro`);
    for (const mode of ['screen', 'pad', 'keys'] as const) assert.ok(p.lines[mode].length > 0, `${p.id} has ${mode} lines`);
    if (!p.open.always) assert.ok(p.where && p.riddle, `${p.id} says where it is learned, with a riddle`);
  }
  for (const c of CHAPTERS) assert.ok(PAGES.filter((p) => p.chapter === c.id).length >= 2, `${c.name} has pages`);
});

test('every lesson card the game can show opens a journal page', () => {
  const opened = new Set<string>(PAGES.flatMap((p) => p.open.lesson ?? []));
  for (const id of Object.keys(LESSONS)) assert.ok(opened.has(id), `lesson ${id} has a page`);
});

test('every tip a page waits for is one the game really says', () => {
  const proto = readFileSync(new URL('./protoStage.ts', import.meta.url), 'utf8');
  const engine = readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  for (const p of PAGES) {
    for (const [, id] of p.open.tip ?? []) {
      if (id.startsWith('tip:')) assert.ok(proto.includes(`'${id.slice(4)}'`), `${p.id}: the stage hint "${id.slice(4)}" exists`);
      else assert.ok(engine.includes(`'${id.split(':')[0]}:`) || engine.includes(`'${id}'`), `${p.id}: the engine says ${id}`);
    }
  }
});

test('a new player has only the basics; the game teaching something opens its page', () => {
  const basics = PAGES.filter((p) => isOpen(p, none)).map((p) => p.id);
  assert.deepEqual(basics.sort(), ['duck', 'jump', 'punch', 'run']);
  const afterFoe = PAGES.filter((p) => isOpen(p, { ...none, lessons: new Set(['foe']) })).map((p) => p.id);
  for (const id of ['kick', 'mega', 'stomp']) assert.ok(afterFoe.includes(id));
  assert.ok(isOpen(PAGES.find((p) => p.id === 'shimmy')!, { ...none, skills: new Set(['shimmy']) }));
  assert.ok(isOpen(PAGES.find((p) => p.id === 'hide')!, { ...none, cleared: (s) => s === '1-7' }));
  assert.ok(isOpen(PAGES.find((p) => p.id === 'ferns')!, { ...none, finds: ['w1_keepsake'] }));
  assert.ok(!isOpen(PAGES.find((p) => p.id === 'ferns')!, { ...none, finds: ['w1_note'] }));
});

test('new pages are announced once, and an older save meeting the journal is not flooded', () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  try {
    assert.deepEqual(takeNewlyOpened(new Set(['run', 'jump', 'kick'])), [], 'the first look takes what is open as known');
    assert.deepEqual(takeNewlyOpened(new Set(['run', 'jump', 'kick', 'climb'])).map((p) => p.id), ['climb']);
    assert.deepEqual(takeNewlyOpened(new Set(['run', 'jump', 'kick', 'climb'])), [], 'only once');
    const open = new Set(['run', 'kick']);
    assert.equal(isNew('run', open), false, 'the basics are never NEW');
    assert.equal(isNew('kick', open), true);
    markLooked('kick');
    assert.equal(isNew('kick', open), false);
  } finally {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  }
});
