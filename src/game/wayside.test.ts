import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { isSaveKey } from './saveFile.ts';
import {
  WAYSIDE,
  HURT_DELAY_MS,
  HURT_WINDOW_MS,
  START_AFTER_MS,
  dueLine,
  hurtLine,
  markShown,
  setWaysidePref,
  showMs,
  stageLine,
  wasShown,
  waysideApplies,
  waysideEnabled,
} from './wayside.ts';

const levels = generateAllLevels();
const memStore = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  };
};

/** is Dot in the story at this point? Away from the second half of world 6 (after the Last Note), through world 7, and in the net in world 10 */
const dotHere = (world: number, mini: number) => !(world === 6 && mini >= 6) && world !== 7 && world !== 10;

test('every world has lines, in the right places and the right lengths', () => {
  for (let w = 1; w <= 10; w++) {
    const way = WAYSIDE[w];
    assert.ok(way, `world ${w} has lines`);
    const minis = Object.keys(way.stages).map(Number);
    assert.ok(minis.length >= 4, `world ${w} has at least four stage lines`);
    for (const m of minis) assert.ok(m >= 2 && m <= 9, `world ${w} stage ${m} is a playable stage after the first`);
    assert.ok(way.hurt.length >= 3, `world ${w} has a pool of fall lines`);
    for (const s of Object.values(way.stages)) {
      assert.ok(s.text.length >= 20 && s.text.length <= 125, `world ${w}: "${s.text}" fits a glance`);
    }
  }
});

test('the story decides who can speak: Dot is not where he is not, and the petal tells it in the third person', () => {
  for (let w = 1; w <= 10; w++) {
    for (const [m, s] of Object.entries(WAYSIDE[w].stages)) {
      const mini = Number(m);
      if (s.who === 'Dot') assert.ok(dotHere(w, mini), `Dot speaks at ${w}-${mini} but is away`);
      if (s.who === 'Petal') assert.ok(!/\b(I|I'm|I've|my|me)\b/.test(s.text.replace(/"[^"]*"/g, '')), `${w}-${mini}: the petal does not say "I": ${s.text}`);
      if (s.who === 'Pokey') assert.ok(/\b(I|I'm|I've|my|me|I'd)\b/.test(s.text), `${w}-${mini}: Pokey's own thought is in the first person: ${s.text}`);
    }
    for (let mini = 1; mini <= 9; mini++) {
      const line = hurtLine(w, mini);
      assert.ok(line, `${w}-${mini} has a fall line`);
      if (line.who === 'Dot') assert.ok(dotHere(w, mini), `Dot answers a fall at ${w}-${mini} but is away`);
      if (line.who === 'Petal') assert.ok(!/\b(I|I'm|my|me)\b/.test(line.text.replace(/"[^"]*"/g, '')), `${w}-${mini}: ${line.text}`);
    }
  }
});

test('no line is used twice, and none leans on the habits that read as machine-made', () => {
  const all: string[] = [];
  for (let w = 1; w <= 10; w++) {
    for (const s of Object.values(WAYSIDE[w].stages)) all.push(s.text);
    for (const h of WAYSIDE[w].hurt) all.push(h.text);
  }
  assert.equal(new Set(all).size, all.length, 'every line is its own');
  const tells = [/\bchoos(e|ing) to\b/i, /\bcouldn't help but\b/i, /\bheart (skipped|sank|swelled)\b/i, /\btestament\b/i, /\bsomething shifted\b/i, /\bfelt a\b/i];
  for (const t of all) for (const re of tells) assert.ok(!re.test(t), `"${t}" has a tell: ${re}`);
});

test('the first stage, the guardians and the hidden Hollow stay quiet; the rest speak', () => {
  const find = (id: string) => levels.find((l) => l.id === id)!;
  assert.equal(waysideApplies(find('1-1')), false, 'the guided first stage');
  assert.equal(waysideApplies(find('1-10')), false, 'a guardian fight');
  assert.equal(waysideApplies(find('10-10')), false);
  assert.equal(waysideApplies({ worldIndex: 3, miniIndex: 4, secret: 'thornbark' }), false);
  assert.equal(waysideApplies(find('1-2')), true);
  assert.equal(waysideApplies(find('2-1')), true);
  assert.equal(waysideApplies(find('10-9')), true);
  // and every stage that applies has a way to be answered after a fall
  for (const l of levels) if (waysideApplies(l)) assert.ok(hurtLine(l.worldIndex, l.miniIndex), l.id);
});

test('the lines know which stage they are in: flowers, cages, sneaking', () => {
  assert.match(stageLine(1, 2)!.text, /flowers/);
  assert.match(stageLine(1, 5)!.text, /[Qq]uiet/);
  for (const w of [5, 7, 8, 9, 10]) assert.ok(/cage|bars|door|freed/i.test(stageLine(w, 8)!.text), `world ${w} stage 8 is the rescue`);
  assert.equal(hurtLine(6, 3)!.who, 'Dot');
  assert.equal(hurtLine(6, 8)!.who, 'Petal');
  assert.equal(hurtLine(8, 9)!.who, 'Dot');
  assert.match(hurtLine(8, 9)!.text, /One branch/);
});

test('plants and payoffs are where the story needs them', () => {
  // Dot's pouch is seen before the scene that explains it (world 5 halfway), and again after
  assert.match(stageLine(3, 3)!.text, /pouch/);
  assert.match(stageLine(5, 6)!.text, /still there/);
  assert.match(stageLine(9, 6)!.text, /pouch/);
  // his tail: denial before the halfway scene in world 4, the bare patch after it
  assert.match(stageLine(4, 3)!.text, /tail/);
  assert.ok(Number(Object.entries(WAYSIDE[4].stages).find(([, s]) => /bare patch/.test(s.text))![0]) > 5);
  // the joke he saves for the halfway of world 6 is a line before stage 5 ends, and he has lost it by world 8
  assert.match(stageLine(6, 5)!.text, /joke/);
  assert.match(stageLine(8, 2)!.text, /joke/);
  // the cages: tied with a bow, unlocked, sewn shut
  assert.match(stageLine(8, 8)!.text, /bow/);
  assert.match(stageLine(9, 8)!.text, /isn't locked/);
  assert.match(stageLine(10, 8)!.text, /sewn/);
});

test('a scripted line waits for its moment', () => {
  const base = { world: 2, mini: 3, ratio: 0, playedMs: 0, shownL: false, shownH: false };
  // world 2 stage 3 is a "half" line
  assert.equal(dueLine({ ...base, ratio: 0.3, playedMs: 30_000 }), null);
  const half = dueLine({ ...base, ratio: 0.5 });
  assert.equal(half?.flag, 'L');
  assert.match(half!.line.text, /PLEASE BE PATIENT/);
  assert.equal(dueLine({ ...base, ratio: 0.9, shownL: true }), null, 'once heard, never again');
  // a "start" line (world 1 stage 2) comes a couple of seconds in, not at once
  const start = { world: 1, mini: 2, ratio: 0, shownL: false, shownH: false };
  assert.equal(dueLine({ ...start, playedMs: START_AFTER_MS - 1 }), null);
  assert.equal(dueLine({ ...start, playedMs: START_AFTER_MS })?.flag, 'L');
  // a "near" line (world 5 stage 8)
  const near = { world: 5, mini: 8, playedMs: 60_000, shownL: false, shownH: false };
  assert.equal(dueLine({ ...near, ratio: 0.8 }), null);
  assert.equal(dueLine({ ...near, ratio: 0.86 })?.flag, 'L');
});

test('a fall is answered a beat later, once, and before the scripted line', () => {
  // world 4 stage 3 has a "start" line; before it is due, only a fall can bring a line
  const early = { world: 4, mini: 3, ratio: 0, playedMs: 1000, shownL: false, shownH: false };
  assert.equal(dueLine({ ...early, hurtAgoMs: HURT_DELAY_MS - 1 }), null, 'not in the middle of the knock-back');
  const h = dueLine({ ...early, hurtAgoMs: HURT_DELAY_MS });
  assert.equal(h?.flag, 'H');
  assert.equal(h?.line.who, hurtLine(4, 3)!.who);
  // once the scripted line is due as well, the fall is answered first, then the scripted line, then nothing
  const late = { ...early, playedMs: 8000 };
  assert.equal(dueLine({ ...late, hurtAgoMs: HURT_DELAY_MS })?.flag, 'H');
  assert.equal(dueLine({ ...late, hurtAgoMs: HURT_DELAY_MS, shownH: true })?.flag, 'L');
  assert.equal(dueLine({ ...late, hurtAgoMs: HURT_DELAY_MS, shownH: true, shownL: true }), null);
  assert.equal(dueLine({ ...late, hurtAgoMs: HURT_WINDOW_MS + 1, shownL: true }), null, 'old news is dropped');
});

test('the same stage always says the same thing', () => {
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 9; m++) assert.deepEqual(hurtLine(w, m), hurtLine(w, m));
});

test('lines stay up long enough to read, but not forever', () => {
  for (let w = 1; w <= 10; w++) {
    for (const s of Object.values(WAYSIDE[w].stages)) {
      const ms = showMs(s.text);
      assert.ok(ms >= 4500 && ms <= 7600, `${ms}ms for "${s.text}"`);
      // at 250 words a minute (about 20 characters a second) it can be read well inside the time
      assert.ok(ms / 1000 > s.text.length / 20, s.text);
    }
  }
});

test('what has been heard is remembered per stage, and the switch is a device setting', () => {
  const st = memStore();
  assert.equal(wasShown(3, 4, 'L', st), false);
  markShown(3, 4, 'L', st);
  assert.equal(wasShown(3, 4, 'L', st), true);
  assert.equal(wasShown(3, 4, 'H', st), false);
  markShown(3, 4, 'H', st);
  markShown(3, 4, 'H', st);
  assert.equal(st.getItem('sloth_way_3-4'), 'LH');
  assert.equal(wasShown(3, 5, 'L', st), false);
  // a broken or missing store never throws
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.equal(wasShown(1, 2, 'L', broken), false);
  assert.doesNotThrow(() => markShown(1, 2, 'L', broken));
  assert.equal(wasShown(1, 2, 'L', null), false);
  // on by default; off when turned off; on again
  assert.equal(waysideEnabled(st), true);
  setWaysidePref(false, st);
  assert.equal(waysideEnabled(st), false);
  setWaysidePref(true, st);
  assert.equal(waysideEnabled(st), true);
});

test('a saved game carries what was heard, but the switch stays on the device', () => {
  assert.equal(isSaveKey('sloth_way_3-7'), true);
  assert.equal(isSaveKey('sloth_way_10-9'), true);
  assert.equal(isSaveKey('sloth_wayside_off'), false);
  assert.equal(isSaveKey('sloth_way_3-10x'), false);
});
