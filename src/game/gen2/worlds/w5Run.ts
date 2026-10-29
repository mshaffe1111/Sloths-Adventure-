/**
 * gen2/worlds/w5Run — 5-6 "Where She Ran" on gen2 (LV-10, ST-3): the stage where Pokey finds what Meeca carved in her own stage (5-M).
 *
 * She got away from the column here for one night, and cut her warnings into the trunks as she ran. The stage's "messages" (its relics,
 * stagePlan.ts relicNoun) are those carvings: a trunk beside the way with her shaky hairpin letters on it (w5Kit.ts Carving, drawn by
 * w5Play.ts), found by walking up to it. Six stand in a roll (the goal is five, pipeline planBudget lays one more): her first trail mark
 * and her five warnings, in the order she cut them (meecaCarved.ts carvingsForPokey, read when the stage is built; her default order
 * from meecaLines.ts MEECA_WARNINGS before her stage has been played). The words only draw: no layout depends on them.
 *
 * Its ground is World 5's (w5Sections.ts) without the stealth pieces 5-7 leans on (threads over sleepers, sheets, the Seamstress) and
 * without the teapots (5-7 teaches them), so the two stages read apart (curation's --apart): 5-6 is a run, awake spiders, gaps,
 * stumps and high boughs, with a carving in most of its sections. Two carvings are where she hid, not on the way: one up on a bough
 * (a climb off the path, `w5-carve-high`) and one down in a dip (`w5-carve-dip`). Both are placed by the plan (WorldManifest.required).
 */
import { MEECA_MARK, MEECA_WARNINGS } from '../../meecaLines.ts';
import { carvingsForPokey } from '../../meecaCarved.ts';
import type { Carving } from '../../w5Kit.ts';
import type { Gen2Stage, SectionPiece, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
import { w5Kit, w5Mood } from './w5.ts';
import { W5_SECTIONS } from './w5Sections.ts';

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 160, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const awake = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: ['awake'], maxThreat: 3, easy: 'soften', ...o });
const chair = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow: ['seat'], ...o });
const cake = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow: ['treat'], easy: 'drop', ...o });
/** a carving's message: walked into at chest height in front of its trunk */
const carving = (id: string, on: string, t: Socket['t']): Socket => ({ id, role: 'objective', on, t, dn: 40 });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });

const bank = (key: string, w: SectionPiece['w']): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'start' } });
const stump = (key: string, on: string, at: SectionPiece['w'], h: SectionPiece['w'], w: SectionPiece['w'] = [120, 160]): SectionPiece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'moss_stone' });
const over = (key: string, on: string, at: SectionPiece['w'], dy: SectionPiece['w'], w: SectionPiece['w']): SectionPiece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, main: false });

const LIVE = ['sho', 'ten', 'ketsu'] as const;

/** a carved trunk beside the way, a stump to hop on the way to it (the sections' names say "alcove": pipeline WANT.relic_hunt) */
const carveTrunk: SectionTemplate = {
  id: 'w5-carve-trunk',
  name: 'carved trunk alcove',
  archetypes: ['relic_hunt'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  pieces: [bank('bank', [820, 980]), stump('st', 'bank', [0.2, 0.26], [50, 70]), stump('st2', 'bank', [0.82, 0.88], [55, 75])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('st', 'st', 0.5, 1),
    carving('m', 'bank', [0.5, 0.58]),
    awake('foe', 'bank', [0.68, 0.74], { phases: [...LIVE], chance: 0.6 }),
    petals('st2', 'st2', 0.5, 1),
  ],
  mirrorable: true,
};

/** a soft gap she jumped, the carving on the far bank past an awake spider */
const carveGap: SectionTemplate = {
  id: 'w5-carve-gap',
  name: 'carving past the gap alcove',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [
    bank('near', [340, 440]),
    { key: 'far', shape: 'bank', w: [760, 900], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.65, 0.9] }, landing: true },
    stump('st', 'far', [0.32, 0.38], [55, 75]),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.45, 2, 90),
    petals('st', 'st', 0.5, 1),
    awake('foe', 'far', [0.5, 0.56], { phases: [...LIVE] }),
    carving('m', 'far', [0.74, 0.8]),
    cake('cake', 'far', [0.9, 0.94], { phases: ['ten', 'ketsu'], chance: 0.5 }),
  ],
  mirrorable: false,
};

/** two tall stumps, the second only the second jump climbs, the carving between them */
const carveStumps: SectionTemplate = {
  id: 'w5-carve-stumps',
  name: 'carving among tall stumps alcove',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  needs: ['double'],
  uses: ['double'],
  pieces: [
    bank('bank', [980, 1120]),
    stump('a', 'bank', [0.1, 0.16], [60, 80]),
    stump('b', 'bank', [0.62, 0.68], [118, 138], [130, 160]),
    stump('c', 'bank', [0.88, 0.92], [55, 70], [110, 130]),
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('pa', 'a', 0.5, 1),
    carving('m', 'bank', [0.36, 0.42]),
    petals('pb', 'b', 0.5, 2, 60),
    awake('foe', 'bank', [0.78, 0.8], { phases: ['ten', 'ketsu'], chance: 0.6 }),
    petals('pc', 'c', 0.5, 1),
  ],
  mirrorable: true,
};

/**
 * Where she hid: the carving up on a bough over the garden (she cut the fourth one up on a branch, meecaCarved.ts `high`), a stump and
 * a step up to it, the way on underneath. The bough is off the way (its message is the search), its petals the reward
 */
const carveHigh: SectionTemplate = {
  id: 'w5-carve-high',
  name: 'carving up on the bough alcove',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  pieces: [
    bank('bank', [1100, 1250]),
    stump('st', 'bank', [0.12, 0.16], [55, 65], [110, 130]),
    over('step', 'bank', [0.24, 0.26], -150, 150),
    over('bough', 'step', [0.74, 0.76], [-90, -80], [360, 420]),
    stump('tail', 'bank', [0.86, 0.9], [50, 60], [110, 130]),
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('st', 'st', 0.5, 1),
    carving('m', 'bough', [0.62, 0.7]),
    petals('bough', 'bough', 0.3, 2, 90),
    awake('foe', 'bank', [0.5, 0.58], { phases: [...LIVE], chance: 0.7 }),
    chair('chair', 'bank', [0.7, 0.76], { phases: ['sho'] }),
    petals('tail', 'tail', 0.5, 1),
  ],
  mirrorable: false,
};

/** Where she hid: down in a soft dip, the carving on a trunk at its foot, a step out the far side */
const carveDip: SectionTemplate = {
  id: 'w5-carve-dip',
  name: 'carving down in the dip alcove',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  pieces: [
    bank('a', [460, 560]),
    { key: 'dip', shape: 'bank', w: [560, 680], place: { kind: 'walk', after: 'a', dy: [70, 80] } },
    { key: 'b', shape: 'bank', w: [620, 760], place: { kind: 'walk', after: 'dip', dy: [-80, -70] } },
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('a', 'a', 0.5, 2, 100),
    carving('m', 'dip', [0.42, 0.5]),
    petals('dip', 'dip', 0.75, 2, 90),
    awake('foe', 'b', [0.55, 0.65], { phases: [...LIVE], chance: 0.7 }),
    flag('b', 0.3),
  ],
  mirrorable: false,
};

export const W5_RUN_SECTIONS: SectionTemplate[] = [carveTrunk, carveGap, carveStumps, carveHigh, carveDip];

/** the ground sections 5-6 leaves to 5-7 (its stealth: threads over sleepers, the sheets, the Seamstress) and the teapots (5-7 teaches them) */
const LEFT_TO_57 = new Set([
  'w5-thread-hop', 'w5-drop', 'w5-high-road', 'w5-sheet-walk', 'w5-thread-gap', 'w5-sleeper-row', 'w5-sheets', 'w5-seamstress',
  'w5-thread-stairs', 'w5-tea-table', 'w5-pot-gap', 'w5-pot-pair', 'w5-pot-stumps', 'w5-gauntlet', 'w5-steps',
]);

/** the two carvings where she hid, placed by the plan (never by weight, never trimmed) */
export const W5_RUN_REQUIRED: NonNullable<WorldManifest['required']> = {
  '5-6': [{ section: 'w5-carve-dip', phase: 'sho' }, { section: 'w5-carve-high', phase: 'ten' }],
};

export const W5_RUN_MANIFEST: WorldManifest = (() => {
  const base = w5Kit(6).manifest;
  return {
    ...base,
    sections: [...base.sections.filter((s) => !LEFT_TO_57.has(s.id)), ...W5_RUN_SECTIONS],
    required: W5_RUN_REQUIRED,
    handBuilt: base.handBuilt.filter((id) => id !== '5-6'),
  };
})();

/** 5-6's kit: World 5's, on the 5-6 manifest (dusk: w5Mood) */
export function w5RunKit(): WorldKit {
  return { ...w5Kit(6), manifest: W5_RUN_MANIFEST };
}

/** the words for the stage's carvings, in the order they stand: her trail mark first, then her warnings as she cut them */
export function runWords(): string[][] {
  const cut = carvingsForPokey();
  const warnings = cut.length ? cut.map((c) => c.lines) : MEECA_WARNINGS.map((w) => [...w.lines]);
  // (any she did not cut this game keep their places after hers, in her default order)
  const rest = MEECA_WARNINGS.filter((w) => !cut.some((c) => c.id === w.id)).map((w) => [...w.lines]);
  return [[...MEECA_MARK.lines], ...(cut.length ? [...warnings, ...rest] : warnings)];
}

/** a carving's trunk and letters (w5Stages.ts: 5-1's "POKEY. DON'T SIT. M." on a trunk 128 wide, 470 tall, the words 196 up) */
const TRUNK = { w: 124, h: 440, up: 196, size: 30 } as const;

/**
 * 5-6's pass after the build: each message gets its carving (a trunk with her words, standing just behind it on its ground), the words
 * in her order left to right. `words` is read when the stage is built (her save), or given (the tests)
 */
export function w5RunFinish(st: Gen2Stage, words: string[][] = runWords()): Gen2Stage {
  let msgs = st.collectibles.filter((c) => c.type === 'relic').sort((a, b) => a.x - b.x);
  // (one carving a message, never two alike: a roll that laid more keeps six, dropping the one closest to its neighbours each time, but
  // never the two where she hid, up on the bough and down in the dip, the highest and the lowest)
  const hid = new Set([msgs.reduce((a, b) => (b.y < a.y ? b : a), msgs[0]), msgs.reduce((a, b) => (b.y > a.y ? b : a), msgs[0])]);
  while (msgs.length > words.length) {
    let drop = -1;
    let best = Infinity;
    msgs.forEach((c, i) => {
      if (hid.has(c)) return;
      const gap = Math.min(i > 0 ? c.x - msgs[i - 1].x : Infinity, i < msgs.length - 1 ? msgs[i + 1].x - c.x : Infinity);
      if (gap < best) {
        best = gap;
        drop = i;
      }
    });
    const gone = msgs[drop];
    st.collectibles = st.collectibles.filter((c) => c !== gone);
    msgs = msgs.filter((c) => c !== gone);
  }
  // (five laid: her five warnings, without the trail mark)
  const said = msgs.length < words.length ? words.slice(words.length - msgs.length) : words;
  const w5 = (st.proto.w5 ??= { mood: w5Mood(6), petals: true });
  const carvings: Carving[] = (w5.carvings ??= []);
  msgs.forEach((c, i) => {
    const ground = groundUnder(st, c.x, c.y);
    c.carving = i;
    const lines = said[i];
    carvings.push({ x: c.x, y: ground - TRUNK.up + (lines.length > 3 ? 0 : 20), lines, size: TRUNK.size, trunk: { ground, w: TRUNK.w, h: TRUNK.h } });
  });
  return st;
}

/** the top of the piece the message floats over */
function groundUnder(st: Gen2Stage, x: number, y: number): number {
  let best = y + 40;
  let d = Infinity;
  for (const p of st.platforms) {
    if (x < p.x || x > p.x + p.width || p.y < y) continue;
    if (p.y - y < d) {
      d = p.y - y;
      best = p.y;
    }
  }
  return best;
}
