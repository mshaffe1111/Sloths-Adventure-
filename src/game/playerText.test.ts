/**
 * Player-facing text: no repeats, no filler (CONTINUOUS-IMPROVEMENT.md, defects 1 and 2: the journal on an old save showed the same
 * three filler lines down the page, and every locked find hint read "Crouch beside a fern.").
 *
 * For every list the player reads (Dot's lines, find hints and titles, creature cards and stories, medal names and descriptions, the
 * journal's lines and the pages it builds, story beats), three rules:
 *   1. no exact duplicates in a list;
 *   2. no two lines that differ only in a number or a name ("World 3, hidden..." vs "World 4, hidden..."): numbers, number words,
 *      world names and stage names are masked before comparing. Lines of one family (the I/II/III steps of a tiered medal) may differ
 *      only in their number, by design;
 *   3. no banned filler (BANNED below: add a phrase the moment one is caught).
 * A generated journal page (every world, on an old save with no play records and on a save with records) must not repeat a line
 * either, after the same masking.
 *
 * KNOWN lists what fails on main today, so the suite stays green while the owners fix them. It only shrinks: when a fix lands, the
 * "known failure now passes" test tells you to delete its line. A new failure fails the suite at once.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_DOT_LINES } from './dotLines.ts';
import { FINDS, POCKET_FINDS, NOTCH_FIND, SNAIL_FINDS } from './finds.ts';
import { PREDATOR_ENTRIES, ROAD_ENTRIES } from './journal.ts';
import { CREATURE_LORE } from './creatureLore.ts';
import { BADGES, WORLD_NAMES } from './badges.ts';
import { LINES, BEATS, POKEY_JOURNAL, stageEntry, type EntryNames } from './pokeyJournal.ts';
import type { PlayRecord } from './playRecords.ts';
import { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, BOSS_STORIES } from './story.ts';
import { MEMORIES } from './storyChapters.ts';
import { KEEPSAKE_LINES, finalePanels } from './storyFinale.ts';
import { WORLDS_DATA, generateAllLevels } from './worldsData.ts';

/** filler that says nothing: never on screen. Add to it freely. */
export const BANNED: readonly string[] = [
  "I didn't write it down",
  'the details are fuzzy',
  'I remember it was green',
  'the ending was good',
];

/**
 * Failing on main when this test was written (2026-11-01). Keys are "<list>: <rule>". The lead assigns each; delete the line when fixed.
 */
const KNOWN: ReadonlySet<string> = new Set([
  'Dot lines: exact duplicates',
  'find hints: exact duplicates',
  'find hints: differ only in a number or name',
  'find titles: exact duplicates',
  'medal descriptions: differ only in a number or name',
  'journal lines: banned filler',
  'story beats: exact duplicates',
  'journal page World 1 (old save): repeated lines',
  'journal page World 1 (old save): banned filler',
  'journal page World 2 (old save): repeated lines',
  'journal page World 2 (old save): banned filler',
  'journal page World 3 (old save): repeated lines',
  'journal page World 3 (old save): banned filler',
  'journal page World 4 (old save): repeated lines',
  'journal page World 4 (old save): banned filler',
  'journal page World 5 (old save): repeated lines',
  'journal page World 5 (old save): banned filler',
  'journal page World 6 (old save): repeated lines',
  'journal page World 6 (old save): banned filler',
  'journal page World 7 (old save): repeated lines',
  'journal page World 7 (old save): banned filler',
  'journal page World 8 (old save): repeated lines',
  'journal page World 8 (old save): banned filler',
  'journal page World 9 (old save): repeated lines',
  'journal page World 9 (old save): banned filler',
  'journal page World 10 (old save): repeated lines',
  'journal page World 10 (old save): banned filler',
  'journal page World 1 (save with records): repeated lines',
  'journal page World 2 (save with records): repeated lines',
  'journal page World 3 (save with records): repeated lines',
  'journal page World 4 (save with records): repeated lines',
  'journal page World 5 (save with records): repeated lines',
  'journal page World 6 (save with records): repeated lines',
  'journal page World 7 (save with records): repeated lines',
  'journal page World 8 (save with records): repeated lines',
  'journal page World 9 (save with records): repeated lines',
  'journal page World 10 (save with records): repeated lines',
]);

// ---- the lists ------------------------------------------------------------------------------------------------------------------
interface Item {
  text: string;
  where: string;
  family?: string;
  /** a Satchel replay of a scene shown elsewhere (a memory, a keepsake's lines in the finale): the same words by design */
  replay?: boolean;
}
const LEVELS = generateAllLevels();
const STAGE_NAMES = [...new Set(LEVELS.map((l) => l.name))].sort((a, b) => b.length - a.length);
const WORLD_WORDS = [...new Set([...WORLD_NAMES, ...WORLDS_DATA.map((w) => w.name)])].filter(Boolean).sort((a, b) => b.length - a.length);

const items = (o: Record<string, string | null | undefined>, prefix = ''): Item[] =>
  Object.entries(o).filter(([, t]) => !!t && t.trim()).map(([k, t]) => ({ text: t as string, where: `${prefix}${k}` }));
const panelsText = (ps: readonly { text: string }[] | undefined, where: string): Item[] => (ps ?? []).map((p, i) => ({ text: p.text, where: `${where}#${i}` }));

const ALL_FINDS = [...FINDS, ...POCKET_FINDS, NOTCH_FIND, ...SNAIL_FINDS];
// a tiered medal's id ends in its count (ladder_10, ladder_50, ladder_all) or its world (world_3): those are one family
const family = (id: string) => id.replace(/_(\d+|all)$/, '');

const LISTS: Record<string, Item[]> = {
  'Dot lines': ALL_DOT_LINES.flatMap((l) => [
    ...(l.text ? [{ text: l.text, where: l.id }] : []),
    ...(l.then ? [{ text: l.then, where: `${l.id} (then)` }] : []),
  ]),
  'find hints': ALL_FINDS.map((f) => ({ text: f.hint, where: f.id })),
  'find titles': ALL_FINDS.map((f) => ({ text: f.title, where: f.id })),
  'creature cards': [...Object.values(PREDATOR_ENTRIES), ...ROAD_ENTRIES].map((e) => ({ text: e.tip, where: e.id })),
  'creature names': [...Object.values(PREDATOR_ENTRIES), ...ROAD_ENTRIES].map((e) => ({ text: e.name, where: e.id })),
  'creature stories': items(CREATURE_LORE),
  'medal names': BADGES.map((b) => ({ text: b.name, where: b.id, family: family(b.id) })),
  'medal descriptions': BADGES.map((b) => ({ text: b.desc, where: b.id, family: family(b.id) })),
  'journal lines': [
    ...Object.entries(LINES).flatMap(([k, ls]) => (ls as readonly string[]).map((t, i) => ({ text: t, where: `LINES.${k}[${i}]` }))),
    ...Object.entries(BEATS).flatMap(([w, b]) => items(b as Record<string, string>, `BEATS.${w}.`)),
    ...items(POKEY_JOURNAL as Record<string, string>, 'POKEY_JOURNAL.'),
  ],
  'story beats': [
    ...panelsText(INTRO_PANELS, 'intro'),
    ...Object.entries(WORLD_STORIES).flatMap(([w, s]) => [{ text: s.teaser, where: `world ${w} teaser` }, ...panelsText(s.panels, `world ${w}`)]),
    ...Object.entries(WORLD_MID).flatMap(([w, ps]) => panelsText(ps, `world ${w} mid`)),
    ...Object.entries(WORLD_GATE).flatMap(([w, ps]) => panelsText(ps, `world ${w} gate`)),
    ...Object.entries(BOSS_STORIES).flatMap(([w, s]) => [...panelsText(s.intro, `boss ${w} intro`), ...panelsText(s.defeat, `boss ${w} defeat`)]),
    ...Object.values(MEMORIES).flatMap((m) => panelsText(m.panels, `memory ${m.id}`).map((x) => ({ ...x, replay: true }))),
    ...Object.entries(KEEPSAKE_LINES).flatMap(([id, bs]) => (bs ?? []).map((b, i) => ({ text: b.t, where: `keepsake ${id}#${i}`, replay: true }))),
    ...panelsText(finalePanels(ALL_FINDS.map((f) => f.id)), 'finale'),
  ],
  // What's New: add its items here when the list lands on main (the whatsnew branch)
};

// ---- the rules ------------------------------------------------------------------------------------------------------------------
const NUMBER_WORDS = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|hundred|thousand|once|twice|thrice|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|i{1,3}|iv|v|vi{0,3}|ix|x)\b/gi;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAMES_RE = new RegExp(`(${[...WORLD_WORDS, ...STAGE_NAMES].map(esc).join('|')})`, 'gi');
const clean = (s: string) => s.replace(/[“”"‘’']/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
/** the line with every number and name masked: two lines with the same mask differ only in those */
export const mask = (s: string) => clean(s.replace(NAMES_RE, '<name>')).replace(/\d[\d,.]*/g, '#').replace(NUMBER_WORDS, '#');

/** story dialogue: a reply under this many words ("No.", "Dot?", "You came.") may come back; a line of story may not */
const STORY_MIN_WORDS = 5;
const words = (s: string) => s.trim().split(/\s+/).length;
const dupes = (list: Item[], key: (t: string) => string, sameFamilyOk: boolean, minWords = 1): string[] => {
  const by = new Map<string, Item[]>();
  for (const it of list) {
    const k = key(it.text);
    if (k.length < 3 || words(it.text) < minWords) continue;
    by.set(k, [...(by.get(k) ?? []), it]);
  }
  const out: string[] = [];
  for (const [, its] of by) {
    if (its.length < 2) continue;
    if (sameFamilyOk && its.every((x) => x.family && x.family === its[0].family)) continue;
    if (its.filter((x) => !x.replay).length < 2) continue;
    out.push(`${its.map((x) => x.where).join(', ')}: "${its[0].text.slice(0, 80)}"${its.length > 2 ? ` (x${its.length})` : ''}`);
  }
  return out;
};
const banned = (list: Item[]): string[] =>
  list.flatMap((it) => BANNED.filter((b) => clean(it.text).includes(clean(b))).map((b) => `${it.where}: "${b}"`));

// ---- the journal's pages, built the way the Satchel builds them ------------------------------------------------------------------
const NAMES: EntryNames = {
  creature: (id, n) => `${id}${n === 1 ? '' : 's'}`,
  find: (id) => ALL_FINDS.find((f) => f.id === id)?.title,
  medal: (id) => BADGES.find((b) => b.id === id)?.name,
} as EntryNames;
const record = (n: number): PlayRecord => {
  const ft = 30 + (n % 12), ll = n % 4;
  return { v: 1, n: 1 + (n % 3), w: 1 + (n % 2), bt: 100, bs: 3, first: { t: 70 + ((n * 41) % 230), ll, hl: ll + (n % 2), fl: ft - (n % 7) * 3, ft, st: 3, k: n % 5, kt: 'snake', ch: 0, fr: n % 6 === 0 ? 2 : 0, sw: 0, fd: [], md: [], d: 0 } as PlayRecord['first'] };
};
function journalPages(withRecords: boolean): Record<string, Item[]> {
  const pages: Record<string, Item[]> = {};
  for (const w of WORLDS_DATA.map((x) => x.id)) {
    const stages = LEVELS.filter((l) => l.worldIndex === w && l.miniIndex <= 10).sort((a, b) => a.miniIndex - b.miniIndex);
    pages[`World ${w}`] = stages.flatMap((l, i) =>
      stageEntry({ id: l.id, name: l.name, worldIndex: l.worldIndex, miniIndex: l.miniIndex, stars: 3 }, withRecords ? record(w * 10 + i) : null, NAMES).lines.map((t, j) => ({ text: t, where: `${l.id}#${j}` })),
    );
  }
  return pages;
}

// ---- the checks, each one a named result so KNOWN can hold it --------------------------------------------------------------------
const results = new Map<string, string[]>();
for (const [name, list] of Object.entries(LISTS)) {
  const minW = name === 'story beats' ? STORY_MIN_WORDS : 1;
  results.set(`${name}: exact duplicates`, dupes(list, clean, false, minW));
  results.set(`${name}: differ only in a number or name`, dupes(list, mask, true, minW).filter((d) => !results.get(`${name}: exact duplicates`)!.some((x) => x.startsWith(d.split(':')[0]))));
  results.set(`${name}: banned filler`, banned(list));
}
for (const [save, recs] of [['old save', false], ['save with records', true]] as const) {
  for (const [page, list] of Object.entries(journalPages(recs))) {
    results.set(`journal page ${page} (${save}): repeated lines`, dupes(list, mask, false));
    results.set(`journal page ${page} (${save}): banned filler`, banned(list));
  }
}

// (PLAYERTEXT_DUMP=1: print every failure in full, known or not)
if (process.env.PLAYERTEXT_DUMP) for (const [k, f] of results) if (f.length) console.log(`\n## ${k}\n  ${f.join('\n  ')}`);

test('player text: every list has lines in it', () => {
  for (const [name, list] of Object.entries(LISTS)) assert.ok(list.length > 0, `${name} is empty: the import broke`);
});

for (const [key, fails] of results) {
  if (KNOWN.has(key)) {
    test(`player text (known, to fix): ${key}`, () => {
      assert.ok(fails.length > 0, `known failure now passes: delete "${key}" from KNOWN in playerText.test.ts`);
    });
  } else {
    test(`player text: ${key}`, () => {
      assert.deepEqual(fails, [], `${key}:\n  ${fails.join('\n  ')}`);
    });
  }
}
