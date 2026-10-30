/**
 * gen2/toyWorld — a tiny test world for the pipeline: four toy sections (a meadow rest, stumps with a linked pebble-and-bell pair, a
 * pit hop with a spider, and the puzzle kit's carry room as a section). Used by pipeline.test.ts, and by helpers who need a world to
 * build from before World 5's real building blocks exist. Nothing here is played.
 */
import type { LevelConfig } from '../types.ts';
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';

const G = 580;

export const meadow: SectionTemplate = {
  id: 'toy-meadow',
  name: 'meadow',
  archetypes: 'any',
  phases: ['start', 'rest', 'ki', 'goal'],
  difficulty: 1,
  pieces: [{ key: 'bank', shape: 'bank', w: [520, 760], place: { kind: 'start' } }],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'bank', t: [0.3, 0.7], dn: 34, count: 3, span: 240, allow: ['pickups'] },
    { id: 'flag', role: 'flag', on: 'bank', t: 0.8 },
    { id: 'chair', role: 'prop', on: 'bank', t: [0.15, 0.25], allow: ['seat'], chance: 0.6 },
  ],
  mirrorable: true,
};

export const stumps: SectionTemplate = {
  id: 'toy-stumps',
  name: 'stumps',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  pieces: [
    { key: 'bank', shape: 'bank', w: [700, 900], place: { kind: 'start' } },
    { key: 'a', shape: 'block', w: [120, 170], place: { kind: 'on', on: 'bank', at: [0.15, 0.3], h: [45, 70] } },
    { key: 'b', shape: 'block', w: [120, 170], place: { kind: 'on', on: 'bank', at: [0.65, 0.8], h: [55, 85] } },
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'pa', role: 'pickup', on: 'a', t: 0.5, dn: 34 },
    { id: 'pb', role: 'pickup', on: 'b', t: 0.5, dn: 34 },
    { id: 'cake', role: 'prop', on: 'bank', t: 0.5, allow: ['treat'], easy: 'drop', phases: ['sho', 'ten'] },
    // a linked pair (A7): the pebbles are only laid with the bell they ring, never alone
    { id: 'pile', role: 'source', on: 'bank', t: 0.05 },
    { id: 'bell', role: 'receptor', on: 'bank', t: 0.97, link: 'pile', allow: ['bell'], chance: 0.5 },
  ],
  mirrorable: true,
};

export const pitHop: SectionTemplate = {
  id: 'toy-pithop',
  name: 'pit hop',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: 'spider',
  uses: ['spider'],
  pieces: [
    { key: 'near', shape: 'bank', w: [260, 360], place: { kind: 'start' } },
    { key: 'far', shape: 'bank', w: [620, 820], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.6, 0.95] }, landing: true },
    { key: 'road', shape: 'branch', w: [220, 300], place: { kind: 'over', on: 'far', at: [0.45, 0.55], dy: -80 }, main: false },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'tip', role: 'tip', on: 'near', t: 0.2, allow: ['spider'] },
    { id: 'foe', role: 'enemy', on: 'far', t: [0.55, 0.75], maxThreat: 3, easy: 'soften' },
    { id: 'roadPetals', role: 'pickup', on: 'road', t: 0.5, dn: 34, count: 2, span: 120 },
  ],
  mirrorable: false,
};

/** the puzzle kit's carry room (kitStage.ts), as a section: anchors on its own pieces by key */
export const carryRoom: SectionTemplate = {
  id: 'toy-carry',
  name: 'carry room',
  archetypes: 'any',
  phases: ['sho'],
  difficulty: 2,
  teaches: 'carry',
  maxPerStage: 1,
  extraSeconds: 12,
  pieces: [{ key: 'floor', shape: 'bank', w: 760, place: { kind: 'start' } }],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'floor', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: {
    id: 'carry',
    left: { on: 'floor', at: 0.05 },
    right: { on: 'floor', at: 0.78 },
    above: 380,
    below: 60,
    pieces: [
      { kind: 'reset', id: 'post', at: { on: 'floor', at: 0.09 } },
      { kind: 'source', id: 'oak', variant: 'acorn', at: { on: 'floor', at: 0.22 }, look: 'tree' },
      { kind: 'item', id: 'acorn', variant: 'acorn', source: 'oak', for: 'plate' },
      { kind: 'plate', id: 'plate', at: { on: 'floor', at: 0.46 } },
      { kind: 'gate', id: 'gate', at: { on: 'floor', at: 0.68 }, open: 'plate' },
    ],
    exit: 'gate',
    beyond: { on: 'floor', at: 0.85 },
    ground: ['floor'],
    tips: { enter: "The gate's shut. Hmm, that stone plate.", nudge: 'Something heavy for the plate?', move: 'Fetch the acorn. Set it on the plate.' },
  },
  mirrorable: false,
};

export const manifest: WorldManifest = {
  world: 5,
  name: 'Toy garden',
  moves: ['double', 'punch', 'carry', 'throw'],
  ground: { y: G, bankH: 90, style: 'log' },
  pit: 'soft',
  pitDepth: 130,
  corridor: { top: G - 260, bottom: G + 60, soft: 80 },
  creatures: [{ id: 'spider', enemy: 'spider', threat: 2, terrain: 'flat', minGround: 160, w: 34, h: 22, hp: 1, footY: 12, extra: { hitW: 60, stompable: true }, easyFirst: true }],
  props: [
    { id: 'chair', tags: ['seat'], w: 70, minApart: 300 },
    { id: 'cake', tags: ['treat'], w: 30, minApart: 300, hazard: true, beat: true },
    { id: 'pebbles', tags: ['pile'], w: 40, minApart: 200 },
    { id: 'bell', tags: ['bell'], w: 40, minApart: 400, beat: true },
  ],
  pairs: [{ id: 'pebble-bell', source: 'pebbles', receptor: 'bell', minApart: 200, maxApart: 1000 }],
  decor: [
    { id: 'bushes', job: 'garden', items: [{ n: 'blossom', w: [70, 110] }, { n: 'fern', w: [80, 120] }], every: [170, 300] },
    { id: 'roots', job: 'garden', items: [{ n: 'mossRoot', w: [90, 120] }], every: [200, 320] },
  ],
  flowers: ['orchid', 'hibiscus'],
  sections: [meadow, stumps, pitHop, carryRoom],
  handBuilt: ['5-6', '5-10'],
  tips: { spider: "A spider! Hop over it. (new, needs Matt's approval)" },
};

/** the toy world's one emitter: chairs go into the stage's extras the way World 5's would go into proto.w5.chairs */
export const kit: WorldKit = {
  manifest,
  emit: { chair: (f, _p, out) => void ((out.extras.chairs ??= []) as Array<{ x: number; y: number }>).push({ x: f.x, y: f.y }) },
};

export const cfg = (id: string, type: LevelConfig['objectiveType'], target = 1): LevelConfig => {
  const [w, s] = id.split('-').map(Number);
  return {
    worldIndex: w, miniIndex: s, id, name: 'toy', objectiveType: type, targetCount: target, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
    description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  };
};
