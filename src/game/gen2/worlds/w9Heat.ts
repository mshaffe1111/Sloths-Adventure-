/**
 * gen2/worlds/w9Heat — World 9's heat hazards on the geyser's rhythm (GRAB-BAG.md, reference/prop-sheets/qa-notes/w9/):
 *   flares     (9-5 teaches them, 9-8 again)   a hot slab lies on the route: its cracks glow (the warning) and it flares for a second; cross
 *                                               while it is dark, or jump it (the flare is low). Two on a flat are out of step
 *   lavafalls  (9-6 teaches them, 9-9 again)   lava pours from far above onto the route: drips first, then the column; wait it out
 * Each is a `prop` socket whose emitter lays a geyser zone with its `look` (w9.ts emitters, zones.ts Zone.look): the engine burns whoever
 * is in it while it fires, levelCheck holds it to the geyser's rules (2 s quiet, 1.1 s warning, 1.2 s firing at most, 110 px between two),
 * the inspector names it by its look (`flare zone`, `lavafall zone`: their own kinds on the look-alike measure), and w9HeatArt.ts paints it.
 * Each theme has its own gate (w9Ground W9_HEAT_GATES); its first section teaches it on a long quiet spell with Dot's line on the way in.
 */
import type { SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { W9_LESSON } from './w9.ts';
import { W9_HEAT_GATES, W9_THEME, W9H } from './w9Ground.ts';

const { bank, up, down, petals, prop, tip, foe, thread, section, LIVE, MID, ANY, SMALL, CATS } = W9H;
const ALL5 = W9H.ALL;
type T = Socket['t'];

/** a flare slab on `on`, `t` along it (Easy keeps it: it is the theme's beat, softened by its beat, never removed) */
const flare = (id: string, on: string, t: T) => prop(id, on, t, ['flare'], { easy: 'keep' });
const lavafall = (id: string, on: string, t: T) => prop(id, on, t, ['lavafall'], { easy: 'keep' });
const FLARE = W9_LESSON.flare;
const FALL = W9_LESSON.lavafall;
/** the time model's wait at one: about half its quiet spell */
const WAIT = 1.6;
const flat = (key: string, after: string, dy: number, w: SectionPiece['w']) => (dy >= 0 ? down(key, after, dy, w) : up(key, after, -dy, w));

// ───────────────────────────── flares (9-5, 9-8) ─────────────────────────────

/** the first flare (every flares roll): one slab on a wide flat, a long quiet spell, Dot's line on the way in, petals either side */
const firstFlare = section({
  id: 'w9-first-flare',
  name: 'the first flare slab',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: FLARE,
  uses: [W9_THEME.flares],
  maxPerStage: 1,
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [220, 260]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [520, 560]), up('k2', 'f', 30, [140, 160]), down('b', 'k2', 30, [200, 240])],
  last: 'b',
  sockets: [tip(FLARE, 'a', 0.2), petals('k', 'k', 0.5, 1), prop('flareLesson', 'f', 0.5, ['flare'], { easy: 'keep' }), petals('p1', 'f', 0.18, 1), petals('p2', 'f', 0.82, 1), thread('r', 'b', 0.5)],
  mirrorable: false,
});

/** two slabs on one long flat, out of step (the pocket between them is the check's) */
const flarePair = section({
  id: 'w9-flare-pair',
  name: 'two flare slabs',
  archetypes: ['sprint', 'relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.flares, FLARE],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [200, 240]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [700, 760]), up('k2', 'f', 32, [140, 160]), down('b', 'k2', 32, [200, 240])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), flare('fl1', 'f', 0.22), flare('fl2', 'f', 0.74), petals('mid', 'f', 0.48, 1), petals('k2', 'k2', 0.5, 1), thread('r', 'b', 0.5)],
  mirrorable: true,
});

/** a flare on each of two flats with a lava chasm between */
const flareChasm = section({
  id: 'w9-flare-chasm',
  name: 'flare, chasm, flare',
  archetypes: ['sprint', 'relic_hunt'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.flares, FLARE],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [380, 420]), W9H.lava('b', 'a', [380, 420]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [flare('fl1', 'a', 0.45), petals('a', 'a', 0.85, 1), flare('fl2', 'b', 0.55), petals('k', 'k', 0.5, 1), thread('r', 'c', 0.5)],
  mirrorable: true,
});

/** 9-5: a slab on the take-off before a glide (wait for it to cool, then go) */
const flareGlide = section({
  id: 'w9-flare-glide',
  name: 'flare, then the leaf',
  archetypes: ['sprint'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.flares, FLARE],
  extraSeconds: WAIT,
  pieces: [bank('a', [420, 460]), W9H.glide('b', 'a', [320, 360], [0.55, 0.65]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [flare('fl', 'a', 0.5), petals('a', 'a', 0.15, 1), petals('b', 'b', 0.5, 2, 80)],
  mirrorable: false,
});

/** 9-8: a slab up on a ledge a thread lies past */
const flareLedge = section({
  id: 'w9-flare-ledge',
  name: 'flare on the high ledge',
  archetypes: ['relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.flares, FLARE],
  extraSeconds: WAIT,
  pieces: [bank('a', [220, 260]), up('s', 'a', 60, [140, 160]), up('t', 's', 60, [440, 480]), flat('d', 't', 60, [160, 180]), flat('c', 'd', 60, [200, 240])],
  last: 'c',
  sockets: [petals('s', 's', 0.5, 1), flare('fl', 't', 0.45), thread('r', 't', 0.88), petals('d', 'd', 0.5, 1)],
  mirrorable: false,
});

// ───────────────────────────── lavafalls (9-6, 9-9) ─────────────────────────────

/** the first lavafall (every lavafalls roll): one fall on a wide flat, a long quiet spell, Dot's line on the way in */
const firstFall = section({
  id: 'w9-first-lavafall',
  name: 'the first lavafall',
  archetypes: ['stealth', 'purge', 'gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: FALL,
  uses: [W9_THEME.lavafalls],
  maxPerStage: 1,
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [220, 260]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [480, 520]), up('k2', 'f', 30, [140, 160]), down('b', 'k2', 30, [340, 380])],
  last: 'b',
  sockets: [foe('foe', 'b', [0.55, 0.65], ANY, 3, { phases: ['sho'], chance: 0.8 }), tip(FALL, 'a', 0.2), petals('k', 'k', 0.5, 1), prop('lavafallLesson', 'f', 0.5, ['lavafall'], { easy: 'keep' }), petals('p1', 'f', 0.2, 1), petals('p2', 'f', 0.8, 1)],
  mirrorable: false,
});

/** two falls on one long flat, out of step */
const fallPair = section({
  id: 'w9-lavafall-pair',
  name: 'two lavafalls',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.lavafalls, FALL],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [200, 240]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [620, 680]), up('k2', 'f', 32, [140, 160]), down('b', 'k2', 32, [220, 260])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), lavafall('lf1', 'f', 0.25), lavafall('lf2', 'f', 0.72), petals('mid', 'f', 0.5, 1), foe('foe', 'b', [0.55, 0.65], ANY, 3.5, { chance: 0.9 })],
  mirrorable: true,
});

/** a fall, then a hunter on the next flat (9-6's cats and small hunters, 9-9's guards) */
const fallGuard = section({
  id: 'w9-lavafall-guard',
  name: 'lavafall, then the guard',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.lavafalls, FALL],
  extraSeconds: WAIT,
  pieces: [bank('a', [360, 400]), up('k', 'a', 32, [140, 160]), down('f', 'k', 32, [380, 420]), up('k2', 'f', 30, [140, 160]), down('b', 'k2', 30, [200, 240])],
  last: 'b',
  sockets: [lavafall('lf', 'a', 0.5), petals('k', 'k', 0.5, 1), foe('foe', 'f', [0.5, 0.6], ANY, 3.5, { chance: 0.9 }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a fall on the landing past a lava chasm (wait on the near side, or land in the quiet) */
const fallChasm = section({
  id: 'w9-lavafall-chasm',
  name: 'lavafall past the chasm',
  archetypes: ['purge', 'gauntlet'],
  phases: MID,
  difficulty: 6,
  uses: [W9_THEME.lavafalls, FALL],
  extraSeconds: WAIT,
  pieces: [bank('a', [300, 340]), W9H.lava('b', 'a', [460, 500]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [340, 380])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), lavafall('lf', 'b', 0.6), petals('b', 'b', 0.2, 1), foe('foe', 'c', [0.5, 0.6], CATS, 3.5, { chance: 0.9 })],
  mirrorable: true,
});

// ───────────────────────────── surges (9-6) ─────────────────────────────

const SURGE = W9_LESSON.surge;
/** a cooled channel after `after`: down to its floor `${p}ch` (where the surge runs), a step out `${p}s` and the basalt on, level again */
const channel = (p: string, after: string, floor: SectionPiece['w']): SectionPiece[] => [
  down(`${p}ch`, after, 120, floor), up(`${p}s`, `${p}ch`, 60, [100, 120]), up(`${p}b`, `${p}s`, 60, [220, 260]),
];

/** the first surge (every surges roll): one channel, a long quiet spell, Dot's line on the way in */
const firstSurge = section({
  id: 'w9-first-surge',
  name: 'the first lava surge',
  archetypes: ['stealth', 'purge'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: SURGE,
  uses: [W9_THEME.surges],
  maxPerStage: 1,
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [300, 340]), ...channel('', 'a', [320, 360])],
  last: 'b',
  zones: [{ kind: 'surge', on: 'ch', lesson: true }],
  sockets: [tip(SURGE, 'a', 0.2), petals('ch', 'ch', 0.5, 2, 90), petals('s', 's', 0.5, 1)],
  mirrorable: false,
});

/** a channel, then a hunter on the basalt past it */
const surgeRun = section({
  id: 'w9-surge-run',
  name: 'surge channel',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.surges, SURGE],
  extraSeconds: WAIT,
  pieces: [bank('a', [240, 280]), ...channel('', 'a', [360, 400]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [320, 360])],
  last: 'c',
  zones: [{ kind: 'surge', on: 'ch' }],
  sockets: [petals('ch', 'ch', 0.5, 2, 100), foe('foe', 'c', [0.5, 0.6], ANY, 3.5, { chance: 0.9 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** two channels, a guard on the basalt between them */
const surgeTwin = section({
  id: 'w9-surge-twin',
  name: 'two surge channels',
  archetypes: ['purge'],
  phases: MID,
  difficulty: 7,
  uses: [W9_THEME.surges, SURGE],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [220, 260]), ...channel('', 'a', [300, 340]), ...channel('t', 'b', [300, 340])],
  last: 'tb',
  zones: [{ kind: 'surge', on: 'ch' }, { kind: 'surge', on: 'tch' }],
  sockets: [petals('ch', 'ch', 0.5, 1), foe('foe', 'b', [0.45, 0.6], SMALL, 2.5, { chance: 0.8 }), petals('tch', 'tch', 0.5, 1), petals('tb', 'tb', 0.5, 1)],
  mirrorable: true,
});

/** a channel with a lava chasm on its far basalt */
const surgeChasm = section({
  id: 'w9-surge-chasm',
  name: 'surge, then the chasm',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.surges, SURGE],
  extraSeconds: WAIT,
  pieces: [bank('a', [240, 280]), ...channel('', 'a', [340, 380]), W9H.lava('c', 'b', [340, 380]), up('k', 'c', 30, [140, 160]), down('d', 'k', 30, [200, 240])],
  last: 'd',
  zones: [{ kind: 'surge', on: 'ch' }],
  sockets: [petals('ch', 'ch', 0.5, 1), foe('foe', 'c', [0.5, 0.6], CATS, 3.5, { chance: 0.8 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── the hot ash wind (9-1, 9-5) ─────────────────────────────

const GUST = W9_LESSON.gust;
/** the gust over the gap before `on`: a headwind (blowing back at him, 9-1: wait for the lull) or a tailwind (9-5: it carries the glide) */
const head = (on: string, idle: SectionPiece['w'] = [2.8, 3.4]) => ({ kind: 'wind' as const, on, dir: -1 as const, idle, force: 110, look: 'ash' as const });
const tail = (on: string) => ({ kind: 'wind' as const, on, dir: 1 as const, idle: [2.6, 3.2] as const, force: 100, look: 'ash' as const });

/** the first gust (every gusts roll of 9-1): a headwind over a wide crust chasm (soft on every setting), a long lull, Dot's line on the way in */
const firstGust = section({
  id: 'w9-first-gust',
  name: 'the first hot wind',
  archetypes: ['sprint'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: GUST,
  uses: [W9_THEME.gusts],
  maxPerStage: 1,
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [340, 380]), W9H.wide('b', 'a', [320, 360], [0.6, 0.7]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  zones: [head('b', [3.8, 4.2])],
  sockets: [tip(GUST, 'a', 0.2), petals('a', 'a', 0.6, 1), petals('b', 'b', 0.4, 2, 80), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** a lava chasm with a headwind across it */
const gustGap = section({
  id: 'w9-gust-gap',
  name: 'hot wind over the chasm',
  archetypes: ['sprint'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.gusts, GUST],
  extraSeconds: WAIT,
  pieces: [bank('a', [320, 360]), W9H.lava('b', 'a', [320, 360], [0.55, 0.7]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  zones: [head('b')],
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** two chasms, each with its own wind, out of step */
const gustPair = section({
  id: 'w9-gust-pair',
  name: 'two hot winds',
  archetypes: ['sprint'],
  phases: MID,
  difficulty: 7,
  uses: [W9_THEME.gusts, GUST],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [300, 340]), W9H.lava('b', 'a', [380, 420], [0.55, 0.7]), W9H.lava('c', 'b', [300, 340], [0.55, 0.7])],
  last: 'c',
  zones: [head('b'), head('c')],
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('c', 'c', 0.5, 1)],
  mirrorable: false,
});

/** 9-5: a tailwind carrying a glide over the vents' chasm (it only helps: the leaf crosses without it) */
const gustGlide = section({
  id: 'w9-gust-glide',
  name: 'hot wind behind the leaf',
  archetypes: ['sprint'],
  phases: ALL5,
  difficulty: 5,
  uses: [W9_THEME.gusts],
  extraSeconds: WAIT,
  pieces: [bank('a', [300, 340]), W9H.glide('b', 'a', [320, 360], [0.6, 0.72]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  zones: [tail('b')],
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** 9-5: two glides, a tailwind over each */
const gustTwin = section({
  id: 'w9-gust-twin',
  name: 'two glides on the hot wind',
  archetypes: ['sprint'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.gusts],
  extraSeconds: WAIT * 2,
  pieces: [bank('a', [300, 340]), W9H.glide('b', 'a', [360, 400], [0.6, 0.72]), W9H.glide('c', 'b', [300, 340], [0.6, 0.72])],
  last: 'c',
  zones: [tail('b'), tail('c')],
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('c', 'c', 0.5, 1)],
  mirrorable: false,
});

// ───────────────────────────── 9-4: lavafalls and surges on the watched doorstep ─────────────────────────────

const { watch, hideAt } = W9H;
/** 9-4: a watched bank with a spire, a lavafall on the flat past it, and a fern on the far bank (hide, wait out the pour, hide again) */
const watchFall = section({
  id: 'w9-watch-lavafall',
  name: 'watched lavafall',
  archetypes: ['stealth'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.lavafalls, FALL],
  extraSeconds: WAIT + 3,
  pieces: [bank('a', [340, 380]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [440, 480]), up('k2', 'f', 30, [140, 160]), down('b', 'k2', 30, [320, 360])],
  last: 'b',
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.62), petals('k', 'k', 0.5, 1), lavafall('lf', 'f', 0.5), petals('f', 'f', 0.18, 1), hideAt('h2', 'b', 0.55), petals('k2', 'k2', 0.5, 1)],
  mirrorable: false,
});

/** 9-4: a watched bank, a surge channel, a watched bank past it */
const watchSurge = section({
  id: 'w9-watch-surge',
  name: 'watched surge channel',
  archetypes: ['stealth'],
  phases: W9H.ALL,
  difficulty: 6,
  uses: [W9_THEME.surges, SURGE],
  extraSeconds: WAIT + 3,
  pieces: [bank('a', [340, 380]), ...channel('', 'a', [340, 380]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [320, 360])],
  last: 'c',
  zones: [{ kind: 'surge', on: 'ch' }],
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.6), petals('ch', 'ch', 0.5, 2, 100), hideAt('h2', 'c', 0.55), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** 9-4: two lavafalls on a long flat between two watched hides */
const watchFallPair = section({
  id: 'w9-watch-lavafall-pair',
  name: 'watched lavafalls',
  archetypes: ['stealth'],
  phases: MID,
  difficulty: 7,
  uses: [W9_THEME.lavafalls, FALL],
  extraSeconds: WAIT * 2 + 3,
  pieces: [bank('a', [320, 360]), up('k', 'a', 30, [140, 160]), down('f', 'k', 30, [640, 700]), up('k2', 'f', 30, [140, 160]), down('b', 'k2', 30, [300, 340])],
  last: 'b',
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.6), lavafall('lf1', 'f', 0.27), lavafall('lf2', 'f', 0.73), petals('mid', 'f', 0.5, 1), hideAt('h2', 'b', 0.5)],
  mirrorable: false,
});

export const W9_HEAT_SECTIONS: readonly SectionTemplate[] = [
  W9_HEAT_GATES.lavafalls4, W9_HEAT_GATES.surges4, watchFall, watchSurge, watchFallPair,
  W9_HEAT_GATES.gusts1, W9_HEAT_GATES.gusts5, firstGust, gustGap, gustPair, gustGlide, gustTwin,
  W9_HEAT_GATES.surges6, firstSurge, surgeRun, surgeTwin, surgeChasm,
  W9_HEAT_GATES.flares5, W9_HEAT_GATES.flares8, firstFlare, flarePair, flareChasm, flareGlide, flareLedge,
  W9_HEAT_GATES.lavafalls6, W9_HEAT_GATES.lavafalls9, firstFall, fallPair, fallGuard, fallChasm,
];

/** which stages hold which (GRAB-BAG.md §4: neighbours in play share none) */
export const W9_HEAT_STAGE: Readonly<Record<string, readonly number[]>> = {
  [W9_HEAT_GATES.flares5.id]: [5], [W9_HEAT_GATES.flares8.id]: [8], [firstFlare.id]: [5, 8], [flarePair.id]: [5, 8], [flareChasm.id]: [5, 8], [flareGlide.id]: [5], [flareLedge.id]: [8],
  [W9_HEAT_GATES.gusts1.id]: [1], [firstGust.id]: [1], [gustGap.id]: [1], [gustPair.id]: [1], [W9_HEAT_GATES.gusts5.id]: [5], [gustGlide.id]: [5], [gustTwin.id]: [5],
  [W9_HEAT_GATES.lavafalls4.id]: [4], [W9_HEAT_GATES.surges4.id]: [4], [watchFall.id]: [4], [watchSurge.id]: [4], [watchFallPair.id]: [4],
  [W9_HEAT_GATES.surges6.id]: [6], [firstSurge.id]: [4, 6], [surgeRun.id]: [6], [surgeTwin.id]: [6], [surgeChasm.id]: [6],
  [W9_HEAT_GATES.lavafalls6.id]: [6], [W9_HEAT_GATES.lavafalls9.id]: [9], [firstFall.id]: [4, 6, 9], [fallPair.id]: [6, 9], [fallGuard.id]: [6, 9], [fallChasm.id]: [6, 9],
};
