/**
 * w2Arc28.test — 2-8 "Before the Water Rises": the story keeper's words, held word for word (BUILD-28 step 2; level.md rule 17).
 * The keeper's file is reference/story/lines-2-8.md (KEEPER-28, t-keeper-28@943984c2f). The stage's lay tests come with its first clean roll.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLOOD_CARD_28, GOAL_LINES_28, LINES_28, MISSION_28, PAGE_28, lineId28 } from './w2Arc28.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

/** the keeper's rows: id (`w28.<key>`) -> the Line column, from both tables (the lines, and the keeper's additions) */
function keeperRows(): Map<string, string> {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-8.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const line of md.split('\n')) {
    const cells = line.split(' | ');
    const id = /`(w28\.[A-Za-z0-9]+)`/.exec(cells.find((c) => /`w28\./.test(c)) ?? '')?.[1];
    if (!id || !line.startsWith('|') || cells.length < 4) continue;
    rows.set(id, cells[cells.length - 2].trim());
  }
  return rows;
}

test("2-8's words are the story keeper's, word for word (lines-2-8.md, t-keeper-28@943984c2f), and no keeper line is left out", () => {
  const rows = keeperRows();
  const held = new Map<string, string>([
    ...Object.entries(LINES_28).map(([k, v]) => [lineId28(k as keyof typeof LINES_28), v] as [string, string]),
    ['w28.mission', MISSION_28],
    ['w28.goalStart', GOAL_LINES_28.goalStart],
    ['w28.goalLate', GOAL_LINES_28.goalLate],
    ['w28.floodCard', FLOOD_CARD_28.text],
    ['w28.page', PAGE_28],
  ]);
  assert.equal(rows.size, 12, "the keeper's file has 12 w28 rows (10 lines, the card, the page)");
  for (const [id, line] of rows) assert.equal(held.get(id), line, `${id} is the keeper's line, verbatim`);
  for (const id of held.keys()) assert.ok(rows.has(id), `${id} is a keeper row (no player word that is not the keeper's)`);
  assert.ok(/card name \*\*Rising Water\*\*/.test(fs.readFileSync(path.join(root, 'reference/story/lines-2-8.md'), 'utf8')), 'the card name is the keeper\'s');
  assert.equal(FLOOD_CARD_28.name, 'Rising Water');
});

test('no placeholder ships in 2-8\'s words', () => {
  const all = [...Object.values(LINES_28), MISSION_28, GOAL_LINES_28.goalStart, GOAL_LINES_28.goalLate, FLOOD_CARD_28.name, FLOOD_CARD_28.text, PAGE_28];
  for (const line of all) {
    assert.ok(line.trim().length > 0, 'a line is empty');
    assert.ok(!/TODO|TBD|XXX|placeholder|lorem/i.test(line), `a placeholder: ${line}`);
  }
});
