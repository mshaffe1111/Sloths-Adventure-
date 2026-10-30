import test from 'node:test';
import assert from 'node:assert/strict';
import { fallsWords, noticed } from './storyNotice.ts';
import { INTRO_PANELS, WORLD_STORIES, bossPanels } from './story.ts';
import { MEMORIES } from './storyChapters.ts';
import { POKEY_JOURNAL, journalWritten } from './pokeyJournal.ts';
import { emptyStore, recordStage, type StageStats } from './badges.ts';
import { POCKET_FINDS, SNAIL_FINDS, findForStage } from './finds.ts';
import { finalePanels } from './storyFinale.ts';

test('the General says a count in words, and past ninety-nine "more than a hundred"', () => {
  assert.equal(fallsWords(1), 'one');
  assert.equal(fallsWords(14), 'fourteen');
  assert.equal(fallsWords(41), 'forty-one');
  assert.equal(fallsWords(90), 'ninety');
  assert.equal(fallsWords(99), 'ninety-nine');
  assert.equal(fallsWords(100), 'more than a hundred');
  assert.equal(fallsWords(512), 'more than a hundred');
});

test('the General counts the falls only once there are any, at the gates and before the fight (not on a retry)', () => {
  const gates = MEMORIES.gates.panels;
  const quiet = noticed(gates, [], 0).map((p) => p.text).join('\n');
  assert.ok(!/fall/.test(quiet), 'no falls, no count');
  const counted = noticed(gates, [], 41).map((p) => p.text).join('\n');
  assert.ok(counted.includes('every fall. Forty-one of them.'));
  assert.ok(noticed(gates, [], 300).some((p) => p.text.includes('every fall. More than a hundred of them.')));
  const boss = noticed(bossPanels(10, 'intro', 'General Iron-Claw'), [], 7)[0].text;
  assert.ok(boss.includes('Seven falls, boy. Seven times you got up.'), boss);
  assert.ok(!noticed(bossPanels(10, 'intro', 'General Iron-Claw', true), [], 7)[0].text.includes('falls'), 'a retry is short');
});

test('the world notices: Dot knows about the soup only if the World 6 note was found', () => {
  const soup = (found: string[]) => noticed(WORLD_STORIES[8].panels, found, 0).some((p) => p.text.includes("don't eat that soup"));
  assert.equal(soup([]), false);
  assert.equal(soup(['w6_note']), true);
  assert.ok(noticed(INTRO_PANELS, [], 0).length === INTRO_PANELS.length, 'nothing else changes');
});

test('the soldiers come back at the gates, and the finale pays off the pocket and the snail', () => {
  assert.ok(MEMORIES.gates.panels.some((p) => p.speaker === 'Soldier' && p.text === 'Where?'));
  const all = POCKET_FINDS.map((f) => f.id);
  assert.ok(finalePanels(all).some((p) => p.text.includes("I've had you in my pocket the whole time.")));
  assert.ok(!finalePanels(all.slice(1)).some((p) => p.text.includes('in my pocket the whole time')), 'all six, or nothing');
  assert.ok(finalePanels(SNAIL_FINDS.map((f) => f.id)).some((p) => p.text.includes('He never once stopped for tea.')));
  assert.equal(finalePanels([]).at(-1)!.text, "Dot went to get snacks. She was back before they'd finished sitting down.");
});

test('Dot\'s pocket is in the 6th stage of Worlds 4 to 9, and nowhere else', () => {
  for (let w = 1; w <= 10; w++) {
    const f = findForStage(w, 6);
    if (w >= 4 && w <= 9) assert.equal(f?.kind, 'pocket', `world ${w}`);
    else assert.equal(f, null, `world ${w}`);
  }
  for (const f of POCKET_FINDS) assert.ok(f.said && f.said.who === 'Dot' && f.said.text.length > 40, `${f.id}: Dot says something`);
});

test('the journal has a line for every world, written as each guardian falls', () => {
  for (let w = 1; w <= 10; w++) assert.ok(POKEY_JOURNAL[w] && POKEY_JOURNAL[w].length < 110, `world ${w}`);
  const levels = [{ worldIndex: 1, miniIndex: 10, completed: true }, { worldIndex: 2, miniIndex: 9, completed: true }, { worldIndex: 3, miniIndex: 10, completed: false }];
  assert.deepEqual(journalWritten(levels), [1]);
});

test('every life lost is counted for the General, across stages', () => {
  const st = (livesLost: number) => ({ kills: {}, seen: [], stomps: 0, maxCombo: 0, floraCollected: 0, timeSec: 10, win: false, livesLost, heartsLost: 0 }) as unknown as StageStats;
  const a = recordStage(emptyStore(), st(3));
  const b = recordStage(a, st(2));
  assert.equal(b.counters.falls, 5);
});

test('the Under the Ruins note crosses out "I\'m fine" like her World 7 note, and pays off at tea', async () => {
  const { RUINS_NOTE, FIND_BY_ID } = await import('./finds.ts');
  assert.ok(RUINS_NOTE.text.includes("~~I'm fine.~~"));
  assert.ok(FIND_BY_ID.w7_note.pages[0].text!.includes("~~I'm fine.~~"), 'the same strike-through as hers');
  assert.ok(finalePanels([RUINS_NOTE.id]).some((p) => p.text === "Mine wasn't either."));
  assert.ok(!finalePanels([]).some((p) => p.text === "Mine wasn't either."));
});
