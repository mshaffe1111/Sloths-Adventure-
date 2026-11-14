/**
 * The one letter grammar (gen2/nodeLetters.ts; ENGINE-678 W0 HOOKS): the code's letters and NODE-KEY.html's rows come from one table
 * and never disagree. Before it the code read liana as `s` while the key put it under `r` and had no s v p t x row (t-nodes NODE-KEY.html:178).
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_LETTERS, CONTENT_WORDS, JOB_LETTERS, PIECE_WORDS, keyBlocks } from './nodeLetters.ts';
import { CONTENT_OF, JOB_OF, checkCode, parseCode } from './nodeCode.ts';
import { LATER_CONTENT, TYPE_OF_LETTER } from './nodeAsks.ts';

const KEY = new URL('../../../reference/engine/NODE-KEY.html', import.meta.url);

/** the key's rows that differ from the table's, by block (empty when they agree) */
function keyMisses(html: string): string[] {
  return Object.entries(keyBlocks()).filter(([, block]) => !html.includes(block)).map(([name]) => name);
}

test('one letter grammar: NODE-KEY.html shows every job and content letter exactly as the table has it (tools/engine/nodekey.ts)', () => {
  const html = readFileSync(KEY, 'utf8');
  assert.deepEqual(keyMisses(html), [], 'run npx tsx tools/engine/nodekey.ts: the key and the letter table disagree');
  // (planted: a key that lost a row, or kept liana under r, is caught)
  assert.deepEqual(keyMisses(html.replace(/\nm:\["Cover".*\n/, '\n')), ['CONTENT']);
  assert.deepEqual(keyMisses(html.replace('"Rope and climbing vine"', '"Rope and vine"')), ['CONTENT']);
  assert.deepEqual(keyMisses(html.replace("chase is 1-8's", "chase is 1-5's")), ['JOBS']);
});

test('one letter grammar: the parser reads exactly the table letters, liana is s (not r), and m is a letter', () => {
  assert.deepEqual(Object.keys(CONTENT_OF), Object.keys(CONTENT_LETTERS));
  assert.deepEqual(Object.keys(JOB_OF), Object.keys(JOB_LETTERS));
  assert.equal(CONTENT_OF.s, 'swing');
  assert.equal(CONTENT_OF.r, 'rope');
  assert.match(CONTENT_WORDS.s[1], /liana/);
  assert.doesNotMatch(PIECE_WORDS.r![0], /liana|past its swing/, "r's MUST is the rope and the climbing vine, not the liana");
  assert.match(CONTENT_WORDS.r[1], /The swinging liana is s\./);
  assert.deepEqual(parseCode('A Pm R S E')[1].content, 'm');
  assert.deepEqual(checkCode(parseCode('A Pm R S E'), { graph: false }).filter((e) => /V22/.test(e)), [], 'V22 reads m as a letter');
});

test('one letter grammar: a job the code refuses (V13 LATER) is never shown as now; K is 1-8 by story', () => {
  for (const [l, j] of Object.entries(JOB_LETTERS)) if ('later' in j && j.later) assert.equal(j.key, 'later', `${l} is LATER in the code but 'now' in the key`);
  assert.deepEqual(Object.entries(JOB_LETTERS).filter(([, j]) => 'later' in j && j.later).map(([l]) => l), ['K', 'Z', 'B', 'Y', 'V', 'G']);
  assert.match(keyBlocks().JOBS, /\nK:\["Chase","later","[^"]*World 1's chase is 1-8's/);
});

test('one letter grammar: a letter the deal does not lay is later in the key and names why (nodeAsks LATER_CONTENT)', () => {
  for (const l of Object.keys(CONTENT_LETTERS)) {
    const laid = !!TYPE_OF_LETTER[l];
    assert.equal(laid, !LATER_CONTENT[l], `${l}: laid by the deal XOR named as later`);
    if (!laid) assert.equal(CONTENT_LETTERS[l as keyof typeof CONTENT_LETTERS].key, 'later', `${l} has no lay but the key says now`);
  }
  assert.deepEqual(Object.keys(LATER_CONTENT), ['s', 'v', 'p', 't', 'x', 'm', 'n']);
  // (ENG-S4: n, the vine snake, names its lay (a stage finish by piece key, gen2/snakeLay.ts) and the false liana as its 'still' route)
  assert.match(CONTENT_LETTERS.n.unlaid, /snakeLay\.ts laySnakes/);
  assert.equal(CONTENT_LETTERS.n.dials.route, 'down-off|down-back|up|still (still: a false liana)');
  // (a letter with a piece rule has all three columns' words where the designer wrote them; one with none shows no Pieces, never an empty Never)
  for (const [l, w] of Object.entries(PIECE_WORDS)) assert.ok(w![0] && w![2], `${l}: a pieces row with an empty Must or Never`);
  assert.deepEqual(['v', 'p', 't', 'x', 'm'].filter((l) => l in PIECE_WORDS), []);
});

test('one letter grammar: m (cover) and h (rolling hazard) name their dials and the packet that lays them', () => {
  const { m, h, s } = CONTENT_LETTERS;
  assert.deepEqual(Object.keys(m.dials), ['kind', 'apart']);
  assert.equal(m.dials.kind, 'bush|carpet|patch|hanging');
  assert.deepEqual(Object.keys(h.dials), ['roll', 'gap', 'teach']);
  assert.equal(h.dials.roll, 'low|bounce');
  assert.deepEqual(Object.keys(s.dials), ['grip', 'phase', 'moss']);
  for (const c of [m, h, s]) assert.match(c.dialsBy, /ENGINE-678 [AB]\d/);
  // (and the key shows them on each letter's row)
  for (const l of ['m', 'h', 's']) assert.match(keyBlocks().CONTENT, new RegExp(`\\n${l}:\\[[^\\n]*Dials, named for ENGINE-678`));
});
