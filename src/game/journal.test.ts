import test from 'node:test';
import assert from 'node:assert/strict';
import { GUARDIANS, PREDATORS } from './badges.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER, ROAD_ENTRIES, predatorMet, roadMet } from './journal.ts';
import { CREATURE_ART } from './creatureArt.ts';
import { JOURNAL_CARDS, JOURNAL_CARDS_SIZE } from './journalCardsData.ts';

const words = (s: string) => s.trim().split(/\s+/).length;
const tips = [...Object.values(PREDATOR_ENTRIES).map((e) => [e.id, e.tip]), ...ROAD_ENTRIES.map((e) => [e.id, e.tip])];

test('every saved predator id has one card, in journey order, and the count is all of them', () => {
  assert.deepEqual([...PREDATOR_ORDER].sort(), [...PREDATORS].sort());
  for (const id of PREDATORS) assert.equal(PREDATOR_ENTRIES[id].id, id);
  const firsts = PREDATOR_ORDER.map((id) => PREDATOR_ENTRIES[id].first);
  assert.deepEqual(firsts, [...firsts].sort((a, b) => a - b));
});

test('every card has its painted picture, inside the sheet', () => {
  const ids = [...PREDATORS, ...ROAD_ENTRIES.map((r) => r.id), ...GUARDIAN_ENTRIES.map((g) => g.art)];
  for (const id of ids) {
    const a = CREATURE_ART[id];
    assert.ok(a, `${id} has no picture`);
    assert.ok(a.frame.x >= 0 && a.frame.y >= 0 && a.frame.x + a.frame.w <= JOURNAL_CARDS_SIZE.w && a.frame.y + a.frame.h <= JOURNAL_CARDS_SIZE.h, id);
  }
  assert.deepEqual(Object.keys(JOURNAL_CARDS).sort(), [...new Set(ids)].sort(), 'no unused pictures in the sheet');
  assert.equal(GUARDIAN_ENTRIES.length, GUARDIANS.length);
});

test('tips are 12 words or fewer and use touch words, not keys', () => {
  for (const [id, tip] of tips) {
    assert.ok(words(tip) <= 12, `${id}: ${words(tip)} words`);
    assert.doesNotMatch(tip, /\b(press|key|button|space|arrow|click)\b/i, id);
  }
});

test('a predator is met when seen, or when a stage that holds it another way is cleared', () => {
  assert.equal(predatorMet('snake', ['snake'], []), true);
  assert.equal(predatorMet('snake', [], [{ id: '1-3', completed: true }]), false);
  assert.equal(predatorMet('eagle', [], [{ id: '1-7', completed: false }]), false);
  assert.equal(predatorMet('eagle', [], [{ id: '1-7', completed: true }]), true);
});

test('a road card opens once a stage that holds it is cleared', () => {
  const pell = ROAD_ENTRIES.find((r) => r.id === 'pell')!;
  assert.equal(roadMet(pell, [{ id: '5-M', completed: false }]), false);
  assert.equal(roadMet(pell, [{ id: '5-M', completed: true }]), true);
  assert.equal(new Set(ROAD_ENTRIES.map((r) => r.id)).size, ROAD_ENTRIES.length);
  for (const r of ROAD_ENTRIES) assert.ok(!(PREDATORS as readonly string[]).includes(r.id), `${r.id} clashes with a saved predator id`);
});
