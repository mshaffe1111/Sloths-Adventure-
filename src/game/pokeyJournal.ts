/**
 * Pokey's journal (Matt, 2026-10-31: "a page for every world, and after every level, it should have a note about how he played it or
 * what happened... turn the page for every world, and it does a little review of what we did and the story").
 *
 *   - After each stage, an entry in Pokey's short, dry voice, built from how that stage was actually played (playRecords.ts): time,
 *     falls, flowers, finds, medals, the creature he dealt with most, and the story beat the stage is known for.
 *   - At a world's end, its review page: the story so far, the creatures met, the best moments, the numbers.
 *
 * Every line comes from a template with several variants, picked by the stage's id, so the entries don't repeat and a page reads the
 * same each time it is opened. The world lines (POKEY_JOURNAL) are Matt's approved words (2026-10-29 story report); the templates and
 * story beats were approved by Matt on 2026-11-01. Change them only with his OK.
 */
import type { FirstClear, PlayRecord } from './playRecords.ts';

export const POKEY_JOURNAL: Record<number, string> = {
  1: "Left home. Dot says I forgot something. I didn't. I checked.",
  2: "The village is building me a raft. They agreed on the wood. I'll walk.",
  3: 'Dark in there. The glowworms helped. So did Dot. Loudly.',
  4: 'Fell off a ledge. Climbed back up. Dot held one claw the whole way.',
  5: 'Had tea with a spider. Good tea. Found out who the empty chair is for.',
  6: "We stopped for tea. It cost a night. Dot left. I'm going to keep writing in here like she didn't.",
  7: "A firefly sits on my strap. He doesn't say much. Found a photograph I didn't want to find.",
  8: "Dot came back. She won't sit down. Meeca knows who he is.",
  9: "A thousand steps tomorrow. I'm going to take them one at a time. There isn't another way.",
  10: 'Got there. Tea at four.',
};

/** the worlds whose page is written: the ones whose guardian (stage 10) has been beaten */
export function journalWritten(levels: readonly { worldIndex: number; miniIndex: number; completed: boolean }[]): number[] {
  return levels.filter((l) => l.miniIndex === 10 && l.completed).map((l) => l.worldIndex).sort((a, b) => a - b);
}

// ───────────────────────────── the line templates (Matt-approved, 2026-11-01) ─────────────────────────────

/** {s} the stage's name, {n} a number, {t} a time, {f}/{ft} flowers, {c} a creature, {x} a find or medal */
export const LINES = {
  clean: [
    "{s}. Didn't fall once. Dot checked twice.",
    "{s}. Not a scratch. I'm writing that down before Dot argues.",
    '{s}. Clean. Slow, but clean.',
    '{s}. Nothing went wrong. I kept waiting for it to.',
  ],
  fewFalls: [
    '{s}. Fell {n}. Got up {n}.',
    '{s}. The ground and I met {n}. We are not friends.',
    '{s}. Slipped {n}. Dot pretended not to see.',
    '{s}. Went down {n}. Came back up {n}. The sums work out.',
  ],
  manyFalls: [
    '{s}. Fell {n} times. Slow is not stopped.',
    '{s}. Lots of falling. Lots of getting up. Mostly the second one.',
    "{s}. {n} falls. Dot stopped counting out loud after three. I didn't.",
    '{s}. Took {n} goes at the hard part. The hard part lost.',
  ],
  quick: ['Took {t}. Dot called it a sprint. It was not a sprint.', 'Done in {t}. A personal best for a sloth, probably.', 'Only {t}. Felt like longer. That was the nice part.'],
  long: ['Took {t}. Some of that was looking at things.', '{t}, start to finish. No regrets about any of it.', 'Took {t}. Meeca would have taken longer. She stops for everything.'],
  allFlowers: ['Picked every flower. All {ft}.', 'Every flower, {ft} of {ft}. I went back for the last one.', "Didn't leave one flower behind. All {ft}."],
  mostFlowers: ['{f} flowers of {ft}.', 'Picked {f} flowers. Left a few for the bees.', '{f} of {ft} flowers. Good ones.'],
  fewFlowers: ['Only {f} flowers. The rest are still there. That\'s fine.', '{f} flowers. I was busy.', 'Picked {f}. Dot says that\'s "a start".'],
  foes: ['{n} {c} didn\'t get their way.', 'Met {n} {c}. Sent them all to bed early.', '{c}: {n}. Pokey: still here.'],
  freed: ['Let {n} out of their cages. They said thank you. One of them twice.', 'Opened {n} cages. Nobody should be kept in a box.'],
  find: ['Found {x}. Put it in the satchel.', 'Found {x}. Meeca left it for me. I know she did.', '{x}. In the satchel now, next to the others.'],
  medal: ['Dot says I earned the {x} medal. She made a speech.', 'Got the {x} medal. Dot wants to wear it.', 'A medal: {x}. Dot polished it with her wing.'],
  unrecorded: [
    "{s}. Cleared it. I didn't write it down at the time. I remember it was green.",
    '{s}. Done. The details are fuzzy. The ending was good.',
    '{s}. Got through. Dot remembers more of it than I do. She would.',
  ],
  replayed: ['Went back {n} since. It\'s a good stage.', 'Played it again {n}. Some places you visit again.'],
} as const;

/** the stage the story is known for in each world: the opener (1), halfway (5), the guardian's door (9) and the guardian (10) */
export const BEATS: Record<number, Partial<Record<number, string>>> = {
  1: { 1: 'A petal on a tree. Meeca was here.', 5: "Dot found a note. She read it to me twice. I didn't mind." },
  2: { 1: 'The village wants everyone to wait. I am good at that, usually.', 5: 'Another note. Meeca is walking faster than I am. Of course she is.' },
  3: { 1: 'The grotto glows. Something is watching. I watched it back.', 5: 'Dot sang to the glowworms. They lit up. So did she.' },
  4: { 1: 'Mist. Falls. Wings above the clouds. Dot is not afraid of heights. She told me so many times.', 5: 'Dot flew the netting on her own. Nine scratches. She showed me every one.' },
  5: { 1: 'Orchids everywhere. Cobwebs too. The Butler offered cake. I said no.', 5: 'The Queen\'s house is quiet. Too quiet. I like quiet, but not this quiet.' },
  6: { 1: 'Black water. A spear. A very strict lunch.', 5: "No Dot. I keep turning to tell her things." },
  7: { 1: 'Ten stone chairs in a ring, and an eleventh with a dent in it.', 5: 'Flicker lights the way. He doesn\'t say much. Neither do I.' },
  8: { 1: 'Fireflies. Moonlight. I dreamt of a petal.', 5: 'Dot is back. She brought a note and an apology. Mostly the note.' },
  9: { 1: 'Lava rivers. A dragon who is bad at visitors. So am I.', 5: 'Hot. Very hot. Meeca was here. The rocks are still warm.' },
  10: { 1: 'A thousand steps. One lit window. No hummingbird.', 5: 'Halfway up. I can see the window now.', 9: 'The fortress gate. Dot went around the back. Flicker stayed.' },
};

// ───────────────────────────── building the entries ─────────────────────────────

/** a stable small number from a string (the same stage always picks the same variant) */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
const pick = <T,>(list: readonly T[], id: string, salt: number): T => list[(seedOf(id) + salt * 7) % list.length];
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

/** "2:35", or "45 seconds" under a minute */
export function fmtTime(sec: number): string {
  if (sec < 60) return `${sec} seconds`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

export interface EntryNames {
  /** a creature id to its plural name, for "3 golden tree snakes" */
  creature: (id: string, n: number) => string;
  find: (id: string) => string | undefined;
  medal: (id: string) => string | undefined;
}

export interface StageEntry {
  id: string;
  stage: string;
  /** the lines of the entry, in order */
  lines: string[];
  /** the record had nothing to go on (a save from before the journal kept records) */
  plain: boolean;
  stars: number;
}

/** the journal entry for one cleared stage */
export function stageEntry(stage: { id: string; name: string; worldIndex: number; miniIndex: number; stars: number }, rec: PlayRecord | null, names: EntryNames): StageEntry {
  const id = stage.id;
  const s = stage.name;
  const f: FirstClear | undefined = rec?.first;
  const lines: string[] = [];
  const beat = BEATS[stage.worldIndex]?.[stage.miniIndex];
  if (!f) {
    lines.push(fill(pick(LINES.unrecorded, id, 0), { s }));
    if (beat) lines.push(beat);
    if (stage.miniIndex === 10 && POKEY_JOURNAL[stage.worldIndex]) lines.push(POKEY_JOURNAL[stage.worldIndex]);
    return { id, stage: s, lines, plain: true, stars: stage.stars };
  }
  const falls = f.ll;
  lines.push(fill(pick(falls === 0 && f.hl === 0 ? LINES.clean : falls <= 2 ? LINES.fewFalls : LINES.manyFalls, id, 1), { s, n: falls <= 2 ? times(Math.max(1, falls)) : falls }));
  if (beat) lines.push(beat);
  const roomy = !beat;
  if (roomy && f.t > 0 && f.t < 100) lines.push(fill(pick(LINES.quick, id, 2), { t: fmtTime(f.t) }));
  else if (roomy && f.t >= 240) lines.push(fill(pick(LINES.long, id, 2), { t: fmtTime(f.t) }));
  if (f.ft > 0) {
    const share = f.fl / f.ft;
    lines.push(fill(pick(share >= 1 ? LINES.allFlowers : share >= 0.6 ? LINES.mostFlowers : LINES.fewFlowers, id, 3), { f: f.fl, ft: f.ft }));
  }
  if (f.kt && f.k >= 2) lines.push(fill(pick(LINES.foes, id, 4), { n: f.k, c: names.creature(f.kt, f.k) }));
  if (f.fr > 0) lines.push(fill(pick(LINES.freed, id, 5), { n: f.fr }));
  for (const fd of f.fd.slice(0, 2)) {
    const t = names.find(fd);
    if (t) lines.push(fill(pick(LINES.find, id + fd, 6), { x: `“${t}”` }));
  }
  const md = f.md.map(names.medal).filter((x): x is string => !!x);
  if (md.length) lines.push(fill(pick(LINES.medal, id, 7), { x: md[0] }));
  if (rec && rec.w > 1 && lines.length < 6) lines.push(fill(pick(LINES.replayed, id, 8), { n: times(rec.w - 1) }));
  if (stage.miniIndex === 10 && POKEY_JOURNAL[stage.worldIndex]) lines.push(POKEY_JOURNAL[stage.worldIndex]);
  return { id, stage: s, lines, plain: false, stars: stage.stars };
}

export interface WorldReview {
  world: number;
  /** the story so far: the world's teaser and, once its guardian is down, Pokey's line for it */
  story: string[];
  creatures: string[];
  best: string[];
  stats: { cleared: number; total: number; stars: number; time: number; falls: number; flowers: number; flowerTotal: number; finds: number; findTotal: number };
  done: boolean;
}

/** the review page at a world's end */
export function worldReview(
  world: number,
  stages: readonly { id: string; name: string; worldIndex: number; miniIndex: number; completed: boolean; stars: number }[],
  records: Record<string, PlayRecord>,
  extra: { teaser?: string; creatures: string[]; finds: number; findTotal: number },
): WorldReview {
  const mine = stages.filter((l) => l.worldIndex === world && l.miniIndex <= 10);
  const cleared = mine.filter((l) => l.completed);
  const done = mine.some((l) => l.miniIndex === 10 && l.completed);
  const stats = { cleared: cleared.length, total: mine.length, stars: 0, time: 0, falls: 0, flowers: 0, flowerTotal: 0, finds: extra.finds, findTotal: extra.findTotal };
  let fastest: { name: string; t: number } | null = null;
  let flowers: { name: string; f: number; ft: number } | null = null;
  const clean: string[] = [];
  for (const l of cleared) {
    stats.stars += l.stars;
    const f = records[l.id]?.first;
    if (!f) continue;
    stats.time += f.t;
    stats.falls += f.ll;
    stats.flowers += f.fl;
    stats.flowerTotal += f.ft;
    if (f.t > 0 && (!fastest || f.t < fastest.t)) fastest = { name: l.name, t: f.t };
    if (f.ft > 0 && (!flowers || f.fl / f.ft > flowers.f / flowers.ft)) flowers = { name: l.name, f: f.fl, ft: f.ft };
    if (f.ll === 0 && f.hl === 0) clean.push(l.name);
  }
  const best: string[] = [];
  if (clean.length) best.push(clean.length === 1 ? `Not a scratch in ${clean[0]}.` : `Not a scratch in ${clean.length} stages.`);
  if (fastest) best.push(`Quickest: ${fastest.name}, in ${fmtTime(fastest.t)}.`);
  if (flowers && flowers.f > 0) best.push(flowers.f === flowers.ft ? `Every flower in ${flowers.name}.` : `Most flowers: ${flowers.f} of ${flowers.ft} in ${flowers.name}.`);
  if (extra.finds) best.push(`${extra.finds} of Meeca's things found here.`);
  const story: string[] = [];
  if (extra.teaser) story.push(extra.teaser);
  if (done && POKEY_JOURNAL[world]) story.push(POKEY_JOURNAL[world]);
  return { world, story, creatures: extra.creatures, best, stats, done };
}
