/**
 * gen2/worlds/w8Swing — World 8's lianas (DESIGN.md B11), for 8-3 "Long Swings" (Swing through the dark treetops) and 8-5 "Next Branch"
 * (Next branch, then the one after: Pokey's answer to Dot, the world's halfway scene).
 *
 * Each liana swings by itself (physics.ts, World 6's vine-fix) and hangs past a bough's end; its perch is sized by the core from the
 * release window (pipeline lianaBand: Easy 300 ms, Normal 167 ms) and lies past every jump and the leaf glide, raised about 80 px (RAISE,
 * World 6's lesson), so the swing is the way over. Under it is a soft pit that climbs back to the swing's own bough (pipeline backPit),
 * never on to the perch: a miss costs a climb and another go. Chains keep a perch between every two swings (levelCheck follows ledge ->
 * liana -> ledge). World 8's own: swings in the dark (the firefly lights the gap under the liana: the dark zone's lights, w6Swing.ts), and
 * longer chains than World 6's. A liana section is never mirrored.
 */
import type { SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { darkEnds } from './w6Swing.ts';
import { W8_LESSON } from './w8.ts';
import { W8_THEME } from './w8Sections.ts';

type W = SectionPiece['w'];
const SMALL = ['ocelot', 'tayra', 'boa'];
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Partial<Socket> = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6): Socket => ({ id, role: 'prop', on, t, allow: ['scenery'], chance });
const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
const hop = (key: string, after: string, w: W, share: W = [0.32, 0.42]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share });
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/** World 6's perch height over the swing's bough (w6Swing.ts RAISE) */
const RAISE = -80;
const perch = (key: string, after: string, w: W, dy: W = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
const climbWall = (vine: string, on: string, wall: string, h: number, w: W): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const darkTip = (on: string): Socket => ({ id: 'tip-dark', role: 'tip', on, t: 0.1, allow: [W8_LESSON.dark] });

const swingSection = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy' | 'archetypes' | 'mirrorable'> & { first: string; last: string; archetypes?: SectionTemplate['archetypes'] }): SectionTemplate => {
  const { first, last, archetypes, ...rest } = s;
  return { archetypes: archetypes ?? ['vine_runner'], ...rest, entry: { piece: first, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: 0, mirrorable: false };
};

/** one swing between boughs, a knot past it (the vine stages' first) */
const firstSwing = swingSection({
  id: 'w8s-first-swing',
  name: 'one long swing',
  phases: ['ki', 'sho'],
  difficulty: 3,
  weight: 2,
  pieces: [bank('a', [220, 260]), liana('l1', 'a'), perch('b', 'l1', [260, 300]), up('k', 'b', 40, [120, 150]), down('c', 'k', 40 - RAISE, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.4, 2, 80), petals('k', 'k', 0.5, 1), scenery('nest', 'c', [0.5, 0.8], 0.5), flag('c', 0.6)],
});

/** two swings with a perch between */
const swingPair = swingSection({
  id: 'w8s-swing-pair',
  name: 'two swings, a bough between',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  uses: [W8_THEME.chains],
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('p1', 'l1', [180, 220]), down('p1d', 'p1', -RAISE, [140, 170]), liana('l2', 'p1d'), perch('b', 'l2', [220, 260]), down('c', 'b', -RAISE, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.4, 2, 90), flag('c', 0.5)],
});

/** three swings, perches between (the long swings) */
const swingChain = swingSection({
  id: 'w8s-swing-chain',
  name: 'three long swings',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  weight: 2,
  extraSeconds: 2,
  uses: [W8_THEME.chains],
  pieces: [
    bank('a', [160, 190]),
    liana('l1', 'a'),
    perch('p1', 'l1', [150, 180]),
    down('p1d', 'p1', -RAISE, [110, 130]),
    liana('l2', 'p1d'),
    perch('p2', 'l2', [150, 180]),
    down('p2d', 'p2', -RAISE, [110, 130]),
    liana('l3', 'p2d'),
    perch('b', 'l3', [170, 200]),
    down('c', 'b', -RAISE, [160, 190]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('p2', 'p2', 0.5, 1), petals('b', 'b', 0.4, 2, 90), flag('c', 0.5)],
});

/** a swing onto a bough, a climbing vine up the trunk past it, down the far side */
const swingClimb = swingSection({
  id: 'w8s-swing-climb',
  name: 'swing, then climb the trunk',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('b', 'l1', [260, 320]), ...climbWall('v', 'b', 'wall', 230, [220, 260]), down('c', 'wall', 230 - RAISE, [400, 440])],
  first: 'a',
  last: 'c',
  sockets: [petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'c', [0.55, 0.65], SMALL, 3, { phases: ['sho', 'ten', 'ketsu'], chance: 0.5 })],
});

/** a swing onto a hunter's bough */
const swingHunter = swingSection({
  id: 'w8s-swing-hunter',
  name: 'swing onto the hunter\'s bough',
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('b', 'l1', [480, 540]), hop('c', 'b', [180, 220]), down('d', 'c', -RAISE, [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('b', 'b', 0.15, 2, 80), foe('foe', 'b', [0.55, 0.65], ['ocelot', 'jaguar', 'tayra'], 5), petals('c', 'c', 0.5, 1), flag('d', 0.6)],
});

/** knots and short gaps, then a swing, a step down and back up */
const knotsSwing = swingSection({
  id: 'w8s-knots-swing',
  name: 'knots, then a swing',
  phases: ['sho', 'ten'],
  difficulty: 5,
  weight: 2,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [150, 180]), hop('k1', 'a', [150, 180]), hop('k2', 'k1', [170, 200]), liana('l1', 'k2'), perch('b', 'l1', [200, 230]), down('b2', 'b', 35 - RAISE, [130, 160]), up('c', 'b2', 35, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), flag('c', 0.5)],
});

/** a swing, then a quick run of knots and gaps (swing, hop, hop, hop) */
const swingRun = swingSection({
  id: 'w8s-swing-run',
  name: 'a swing, then the knots (run)',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('b', 'l1', [200, 240]), up('k1', 'b', 45, [100, 130]), down('c', 'k1', 45 - RAISE, [130, 160]), hop('d', 'c', [160, 190]), hop('e', 'd', [400, 440])],
  first: 'a',
  last: 'e',
  sockets: [petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), foe('foe', 'e', [0.55, 0.65], ['tayra', 'ocelot'], 3, { phases: ['sho', 'ten', 'ketsu'], chance: 0.5 })],
});

/** a swing in the dark: a lit bough, the dark, the liana over a gap the firefly lights, the perch, up into the light */
const darkSwing = swingSection({
  id: 'w8s-dark-swing',
  name: 'a swing in the dark',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: W8_LESSON.dark,
  weight: 2,
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [200, 240]),
    liana('l1', 'a'),
    perch('b', 'l1', [220, 260]),
    down('c', 'b', -RAISE, [170, 200]),
    hop('d', 'c', [170, 200]),
    up('out', 'd', 30, [220, 260]),
  ],
  first: 'in',
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'd'), petals('b', 'b', 0.4, 2, 80), petals('c', 'c', 0.5, 1), petals('d', 'd', 0.5, 1), flag('out', 0.6)],
});

/** two swings in the dark */
const darkSwingPair = swingSection({
  id: 'w8s-dark-swing-pair',
  name: 'two swings in the dark',
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  teaches: W8_LESSON.dark,
  weight: 2,
  maxPerStage: 1,
  uses: [W8_THEME.chains],
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [200, 240]),
    liana('l1', 'a'),
    perch('p1', 'l1', [180, 220]),
    down('p1d', 'p1', -RAISE, [140, 170]),
    liana('l2', 'p1d'),
    perch('b', 'l2', [200, 240]),
    down('c', 'b', -RAISE, [180, 210]),
    up('out', 'c', 30, [220, 260]),
  ],
  first: 'in',
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'c'), petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.4, 2, 80), flag('out', 0.6)],
});

/** World 8's liana sections (the vine stages: w8Game.ts) */
export const W8_SWING_SECTIONS: readonly SectionTemplate[] = [firstSwing, swingPair, swingChain, swingClimb, swingHunter, knotsSwing, swingRun, darkSwing, darkSwingPair];
