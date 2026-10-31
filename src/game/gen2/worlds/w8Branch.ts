/**
 * gen2/worlds/w8Branch — 8-5 "Next Branch"'s own stretches (Next branch, then the one after: Pokey's answer to Dot). 8-3 Long Swings and
 * 8-5 both swing, and on the look-alike measure (tools/inspect/lookalike.ts) a stretch of lianas is a stretch of lianas: their shared
 * sections made 10 of 16 roll pairs share a 20 s stretch (2026-10-29). So the two keep apart (w8Game.ts forStage): 8-3 has the chains
 * and the hunters' swings (w8Swing.ts), 8-5 the trunks: the climbers' swings, where a liana leads to a trunk to climb (w8Swing.ts's
 * three, and these), and trunks with no liana at all, so a stretch of 8-5 is mostly climbing, one swing at a time, never a chain.
 *
 * The rules are w8Swing.ts's (its header): each liana hangs past its bough's end, its perch raised RAISE px and sized by the core from the
 * release window, a soft pit under it that climbs back to its own bough; a liana section is never mirrored.
 */
import type { SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { darkEnds } from './w6Swing.ts';
import { W8_LESSON } from './w8.ts';
import { W8_THEME } from './w8Sections.ts';

type W = SectionPiece['w'];
/** 8-5's hunters at the trunks' feet (w8.ts W8_STAGE_FOES: its tayras and jaguars) */
const HUNTERS = ['tayra', 'jaguar'];
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Partial<Socket> = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6): Socket => ({ id, role: 'prop', on, t, allow: ['scenery'], chance });
const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/** w8Swing.ts's perch height over the swing's bough */
const RAISE = -80;
const perch = (key: string, after: string, w: W, dy: W = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
const climbWall = (vine: string, on: string, wall: string, h: number, w: W): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
/** a soft gap only the second jump crosses, and one only the leaf crosses (w8Sections.ts's leap and glide) */
const leap = (key: string, after: string, w: W, share: W = [0.5, 0.74]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
const glide = (key: string, after: string, w: W, share: W = [0.8, 0.94]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'glide', share }, { landing: true });
const darkTip = (on: string): Socket => ({ id: 'tip-dark', role: 'tip', on, t: 0.1, allow: [W8_LESSON.dark] });

const branch = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy' | 'archetypes' | 'mirrorable'> & { first: string; last: string }): SectionTemplate => {
  const { first, last, ...rest } = s;
  return { archetypes: ['vine_runner'], ...rest, entry: { piece: first, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: 0, mirrorable: false };
};

/** a moon flower (World 8's bounce plant, bounceArt.ts cap-w8) standing at a bough's end, its cap `up` px over it */
const flower = (key: string, on: string, at: W = [0.78, 0.84], up: W = [22, 28]): SectionPiece => ({ key, shape: 'bouncy', w: [80, 90], place: { kind: 'over', on, at, dy: typeof up === 'number' ? -up : [-up[1], -up[0]] }, main: true });
/** the high bough past it, inside the bounce's own reach (~181: the first-timer bot never found bounce-then-second-jump to 215, 2026-10-31);
 *  the second jump can scrape up too, the flower is the easy way */
const FLOWER_HI = 170;
const high = (key: string, on: string, w: W): SectionPiece => bank(key, w, { kind: 'over', on, at: 1, dy: -FLOWER_HI }, { main: true });
const BOUNCE = W8_LESSON.bounce;
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.25): Socket => ({ id: `tip-${mechanic}`, role: 'tip', on, t, allow: [mechanic] });

/**
 * 8-5's moon flowers (GRAB-BAG.md D, its own theme): a bounce plant at a bough's end throws him up, and the second jump at the top lands him
 * on the high bough a trunk would have taken a climb to reach. A climb skipped: 8-5's rolls with flowers play faster and read apart from
 * its climbing rolls. The first is taught (Dot)
 */
const bounceFirst = branch({
  id: 'w8b-bounce-first',
  name: 'the first moon flower',
  phases: ['ki', 'sho'],
  difficulty: 4,
  teaches: BOUNCE,
  uses: [W8_THEME.bounces],
  maxPerStage: 1,
  pieces: [bank('a', [320, 360]), flower('f', 'a'), high('hi', 'a', [260, 300]), down('b', 'hi', FLOWER_HI, [240, 280])],
  first: 'a',
  last: 'b',
  sockets: [tip(BOUNCE, 'a'), petals('a', 'a', 0.35, 1), petals('hi', 'hi', 0.5, 2, 100), petals('b', 'b', 0.5, 1), scenery('nest', 'b', [0.5, 0.8], 0.5), flag('b', 0.6)],
});

/** two flowers, each up onto its own high bough, a hunter between */
const bouncePair = branch({
  id: 'w8b-bounce-pair',
  name: 'moon flower, hunter, moon flower',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [BOUNCE, W8_THEME.bounces],
  pieces: [bank('a', [240, 280]), flower('f', 'a'), high('hi', 'a', [220, 260]), down('b', 'hi', FLOWER_HI, [320, 360]), flower('f2', 'b'), high('hi2', 'b', [220, 260]), down('c', 'hi2', FLOWER_HI, [220, 260])],
  first: 'a',
  last: 'c',
  sockets: [petals('hi', 'hi', 0.5, 2, 90), foe('foe', 'b', [0.3, 0.4], HUNTERS, 3, { chance: 0.7 }), petals('hi2', 'hi2', 0.5, 2, 90), petals('c', 'c', 0.5, 1)],
});

/** a flower up to the high bough, and a glide off it over a gap down onto the far one */
const bounceGlide = branch({
  id: 'w8b-bounce-glide',
  name: 'moon flower, then glide down',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [BOUNCE, W8_THEME.bounces],
  pieces: [bank('a', [260, 300]), flower('f', 'a'), high('hi', 'a', [220, 260]), glide('g', 'hi', [240, 280], [0.7, 0.8]), down('b', 'g', FLOWER_HI, [240, 280])],
  first: 'a',
  last: 'b',
  sockets: [petals('a', 'a', 0.4, 1), petals('hi', 'hi', 0.5, 1), petals('g', 'g', 0.5, 2, 90), petals('b', 'b', 0.5, 1)],
});

/** a trunk and a flower side by side: climb one, bounce the next (the theme's climbing stays in it) */
const bounceTrunk = branch({
  id: 'w8b-bounce-trunk',
  name: 'up the trunk, down, and up the moon flower',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [BOUNCE, W8_THEME.bounces],
  pieces: [bank('a', [260, 300]), ...climbWall('v', 'a', 'wall', 220, [200, 230]), down('b', 'wall', 220, [300, 340]), flower('f', 'b'), high('hi', 'b', [220, 260]), down('c', 'hi', FLOWER_HI, [220, 260])],
  first: 'a',
  last: 'c',
  sockets: [petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'b', [0.3, 0.4], HUNTERS, 3, { chance: 0.5 }), petals('hi', 'hi', 0.5, 2, 90), petals('c', 'c', 0.5, 1)],
});

/** 8-5's opening: a hunter at the foot of the first trunk, up it, down the far side, and a knot on (no liana yet: 8-3 taught them, and
 *  8-5's stretches are trunks first) */
const trunkHunter = branch({
  id: 'w8b-trunk-hunter',
  name: 'past the hunter and up the first trunk',
  phases: ['ki', 'sho'],
  difficulty: 4,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [320, 360]), ...climbWall('v', 'a', 'wall', 240, [220, 250]), down('b', 'wall', 240, [240, 280]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [foe('foe', 'a', [0.45, 0.55], HUNTERS, 3), petals('wall', 'wall', 0.5, 2, 90), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1), scenery('nest', 'c', [0.5, 0.8], 0.5), flag('c', 0.6)],
});

/** up a trunk, and the swing off the bough past it to the next branch */
const climbSwing = branch({
  id: 'w8b-climb-swing',
  name: 'climb the trunk, then swing to the next branch',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [240, 280]), ...climbWall('v', 'a', 'wall', 240, [250, 280]), down('b', 'wall', 240, [220, 260]), liana('l1', 'b'), perch('c', 'l1', [240, 280]), down('d', 'c', -RAISE, [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('a', 'a', 0.25, 2, 80), foe('foe', 'a', [0.55, 0.65], HUNTERS, 3, { phases: ['sho', 'ten', 'ketsu'] }), petals('wall', 'wall', 0.5, 2, 90), petals('c', 'c', 0.4, 2, 80), scenery('nest', 'd', [0.5, 0.8], 0.5), flag('d', 0.6)],
});

/** two trunks, a bough between: the climbing is the way on, twice */
const trunkPair = branch({
  id: 'w8b-trunk-pair',
  name: 'two trunks to climb',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [
    bank('a', [220, 260]),
    ...climbWall('v', 'a', 'wall', 240, [220, 250]),
    down('b', 'wall', 240, [260, 300]),
    ...climbWall('v2', 'b', 'wall2', 240, [220, 250]),
    down('c', 'wall2', 240, [240, 280]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'b', [0.45, 0.55], HUNTERS, 3, { phases: ['ten', 'ketsu'], chance: 0.6 }), petals('wall2', 'wall2', 0.5, 2, 90), flag('c', 0.5)],
});

/** a hunter's bough under the trunk: climb past it, swing on from the bough beyond */
const climbHunterSwing = branch({
  id: 'w8b-climb-hunter-swing',
  name: 'past the hunter, up the trunk, swing on',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [320, 360]), ...climbWall('v', 'a', 'wall', 240, [250, 280]), down('b', 'wall', 240, [220, 260]), liana('l1', 'b'), perch('c', 'l1', [240, 280]), down('d', 'c', -RAISE, [220, 260])],
  first: 'a',
  last: 'd',
  sockets: [foe('foe', 'a', [0.45, 0.55], HUNTERS, 5, { phases: ['sho', 'ten', 'ketsu'] }), petals('wall', 'wall', 0.5, 2, 90), petals('c', 'c', 0.4, 2, 80)],
});

/** a trunk, then a gap only the second jump crosses from the bough past it (8-5's variety: not every branch is reached by a swing) */
const trunkLeap = branch({
  id: 'w8b-trunk-leap',
  name: 'up the trunk, a second jump to the next branch',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [220, 260]), ...climbWall('v', 'a', 'wall', 240, [220, 250]), down('b', 'wall', 240, [220, 260]), leap('c', 'b', [240, 280]), up('k', 'c', 34, [140, 160]), down('d', 'k', 34, [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('wall', 'wall', 0.5, 2, 90), petals('b', 'b', 0.5, 1), foe('foe', 'c', [0.5, 0.6], HUNTERS, 3, { phases: ['ten', 'ketsu'], chance: 0.5 }), petals('k', 'k', 0.5, 1), flag('d', 0.5)],
});

/** a trunk, then the leaf off its high bough down over a wide gap to the next branch */
const trunkGlide = branch({
  id: 'w8b-trunk-glide',
  name: 'up the trunk, glide to the next branch',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [220, 260]), ...climbWall('v', 'a', 'wall', 240, [220, 250]), glide('b', 'wall', [240, 280]), down('c', 'b', 240, [220, 260])],
  first: 'a',
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), petals('b', 'b', 0.5, 1), scenery('nest', 'c', [0.5, 0.7], 0.5), flag('c', 0.5)],
});

/** 8-5's dark stretch (required on every roll, so it opens no theme): a swing in the dark onto a bough, the trunk climbed in the
 *  firefly's light, and down out of the dark */
const darkBranch = branch({
  id: 'w8b-dark-branch',
  name: 'the next branch in the dark',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  teaches: W8_LESSON.dark,
  weight: 2,
  maxPerStage: 1,
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 0, [180, 220]),
    liana('l1', 'a'),
    perch('b', 'l1', [260, 300]),
    ...climbWall('v', 'b', 'wall', 240, [250, 280]),
    down('c', 'wall', 240 - RAISE, [170, 200]),
    up('out', 'c', 0, [220, 260]),
  ],
  first: 'in',
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'c'), petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), flag('out', 0.6)],
});

/** 8-5's own sections (w8Game.ts adds them to 8-5 alone) */
export const W8_BRANCH_SECTIONS: readonly SectionTemplate[] = [trunkHunter, climbSwing, trunkPair, climbHunterSwing, trunkLeap, trunkGlide, darkBranch, bounceFirst, bouncePair, bounceGlide, bounceTrunk];
