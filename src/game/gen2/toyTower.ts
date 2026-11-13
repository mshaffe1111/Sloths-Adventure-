/**
 * gen2/toyTower: a tiny test world for a stage laid UP or DOWN (R-165.170; the tower lay, pipeline.ts layStage and tower.ts). Plain
 * boughs, climbing vines, hops and drops, a spider: enough for the lay, the level check, the time model, the flags and the bots to be
 * proven both ways on many rolls. Nothing here is played, and it is no stage of the game: 1-4's own pieces come with 1-4's build.
 */
import type { LevelConfig } from '../types.ts';
import type { SectionTemplate, WorldKit, WorldManifest } from './types.ts';

const G = 580;

/** the arrival, a rest, the goal: one plain bough with a flag (on an ascent's floor it is ground) */
export const landing: SectionTemplate = {
  id: 'tower-landing',
  name: 'landing',
  archetypes: 'any',
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [{ key: 'bough', shape: 'bank', w: [320, 420], place: { kind: 'start' } }],
  entry: { piece: 'bough', kind: 'ground' },
  exit: { piece: 'bough', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'bough', t: [0.3, 0.6], dn: 34, count: 3, span: 160, allow: ['pickups'] },
    { id: 'flag', role: 'flag', on: 'bough', t: 0.75 },
  ],
  mirrorable: false,
};

/** a vine up to a bough: the plain climb */
export const vineUp: SectionTemplate = {
  id: 'tower-vine-up',
  name: 'vine up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 2,
  content: 'climb',
  pieces: [
    { key: 'foot', shape: 'branch', w: [240, 300], place: { kind: 'start' } },
    { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: [0.75, 0.85], h: [230, 300] } },
    // (`main`: a bough laid `over` a vine is off the road unless it says so, and only a main piece holds a flag or an animal)
    { key: 'top', shape: 'branch', w: [240, 300], place: { kind: 'over', on: 'vine', at: 0, dy: 0 }, landing: true, main: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' },
  exit: { piece: 'top', kind: 'ledge' },
  exitDy: -265,
  sockets: [{ id: 'petals', role: 'pickup', on: 'top', t: 0.5, dn: 34, count: 2, span: 90 }],
  mirrorable: false,
};

/** two hops up */
export const hopsUp: SectionTemplate = {
  id: 'tower-hops-up',
  name: 'hops up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [
    { key: 'a', shape: 'branch', w: [200, 260], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [180, 230], place: { kind: 'jump', after: 'a', dy: [-70, -55], share: [0.4, 0.6] }, landing: true },
    { key: 'c', shape: 'branch', w: [200, 260], place: { kind: 'jump', after: 'b', dy: [-70, -55], share: [0.4, 0.6] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: -125,
  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }],
  mirrorable: false,
};

/** a level stretch with a spider on its far bough */
export const stretch: SectionTemplate = {
  id: 'tower-stretch',
  name: 'stretch',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: 'spider',
  uses: ['spider'],
  pieces: [
    { key: 'near', shape: 'branch', w: [200, 240], place: { kind: 'start' } },
    { key: 'far', shape: 'branch', w: [300, 380], place: { kind: 'jump', after: 'near', dy: 0, share: [0.45, 0.7] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ledge' },
  exit: { piece: 'far', kind: 'ledge' },
  exitDy: 0,
  sockets: [
    { id: 'tip', role: 'tip', on: 'near', t: 0.2, allow: ['spider'] },
    { id: 'foe', role: 'enemy', on: 'far', t: [0.55, 0.75], maxThreat: 3, easy: 'soften' },
  ],
  mirrorable: false,
};

/** two drops down, each landing in view under the bough he leaves */
export const dropsDown: SectionTemplate = {
  id: 'tower-drops-down',
  name: 'drops down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  pieces: [
    { key: 'a', shape: 'branch', w: [200, 260], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [200, 250], place: { kind: 'jump', after: 'a', dy: [110, 150], share: [0.25, 0.4] }, landing: true },
    { key: 'c', shape: 'branch', w: [200, 260], place: { kind: 'jump', after: 'b', dy: [110, 150], share: [0.25, 0.4] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 260,
  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }],
  mirrorable: false,
};

/** a vine climbed down to a bough: its top beside the tip of the bough he leaves */
export const vineDown: SectionTemplate = {
  id: 'tower-vine-down',
  name: 'vine down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 2,
  content: 'climb',
  pieces: [
    { key: 'top', shape: 'branch', w: [240, 300], place: { kind: 'start' } },
    { key: 'foot', shape: 'branch', w: [260, 320], place: { kind: 'jump', after: 'top', dy: 260, gapPx: [22, 28] }, landing: true },
    { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: 0.02, h: 260 } },
  ],
  entry: { piece: 'top', kind: 'ledge' },
  exit: { piece: 'foot', kind: 'ledge' },
  exitDy: 260,
  sockets: [{ id: 'petals', role: 'pickup', on: 'foot', t: 0.6, dn: 34, count: 2, span: 90 }],
  mirrorable: false,
};

const base: Omit<WorldManifest, 'sections' | 'name'> = {
  world: 5,
  moves: ['double', 'climb'],
  ground: { y: G, bankH: 90, style: 'log' },
  pit: 'soft',
  pitDepth: 130,
  corridor: { top: G - 260, bottom: G + 60, soft: 80 },
  creatures: [{ id: 'spider', enemy: 'spider', threat: 2, terrain: 'flat', minGround: 160, w: 34, h: 22, hp: 1, footY: 12, extra: { hitW: 60, stompable: true }, easyFirst: true }],
  props: [],
  pairs: [],
  decor: [{ id: 'bushes', job: 'garden', items: [{ n: 'blossom', w: [70, 110] }, { n: 'fern', w: [80, 120] }], every: [170, 300] }],
  flowers: ['orchid', 'hibiscus'],
  handBuilt: [],
  tips: { spider: "A spider! Hop over it. (new, needs Matt's approval)" },
};

/** a GATE: a wide foot, a vine up to a bough that says `sealed` (as 1-4's fig gates do): the lay adds nothing beside that bough, and
 *  the section after it is a storey up by a vine standing on it. The foot runs under both its ends, so a step off it is caught */
export const gated: SectionTemplate = {
  id: 'tower-gated',
  name: 'a gate bough',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  content: 'climb',
  pieces: [
    { key: 'foot', shape: 'branch', w: [520, 560], place: { kind: 'start' } },
    { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: [0.45, 0.5], h: [300, 300] } },
    { key: 'top', shape: 'branch', w: [200, 220], place: { kind: 'over', on: 'vine', at: 0, dy: 0 }, landing: true, main: true, sealed: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' },
  exit: { piece: 'top', kind: 'ledge' },
  exitDy: -300,
  sockets: [{ id: 'petals', role: 'pickup', on: 'foot', t: 0.25, dn: 34, count: 2, span: 90 }],
  mirrorable: false,
};
/** the tower going up with gates in its pool (its sections all narrow enough to turn from a gate anywhere in the tower: a section
 *  that is not, laid after a gate, fails its roll by name) */
export const gateKit: WorldKit = { manifest: { ...base, name: 'Toy tower, gates', sections: [landing, vineUp, gated] }, emit: {} };

/** the test tower going up, and the same going down */
export const upManifest: WorldManifest = { ...base, name: 'Toy tower, up', sections: [landing, vineUp, hopsUp, stretch] };
export const downManifest: WorldManifest = { ...base, name: 'Toy tower, down', sections: [landing, vineDown, dropsDown, stretch] };
export const upKit: WorldKit = { manifest: upManifest, emit: {} };
export const downKit: WorldKit = { manifest: downManifest, emit: {} };

/** the fixture tower with a ROLLED graph, as a designed level has (level.md: ONE graph, one brick a beat, a brief keyed by the
 *  stage's id, which the test names): the arc (teach, practise, flow, a test, a twist, a signature and a combine, rests between),
 *  laid up. Each brick is one of the toy shapes with its own job and content type, so every roll is the same beats in order */
export const ARC_CODE = 'A T P M R X R W R S R C E';
const brick = (of: SectionTemplate, id: string, job: NonNullable<SectionTemplate['jobs']>[number], content: NonNullable<SectionTemplate['content']>, more: Partial<SectionTemplate> = {}): SectionTemplate => {
  const { teaches: _t, uses: _u, ...plain } = of;
  return { ...plain, id, name: id, jobs: [job], content, phases: ['ki', 'sho', 'ten', 'ketsu'], ...more };
};
export const ARC_BRICKS: SectionTemplate[] = [
  brick(vineUp, 'arc-teach', 'teach', 'climb', { teaches: 'climb' }),
  brick(hopsUp, 'arc-practise', 'practise', 'floating'),
  brick(stretch, 'arc-flow', 'flow', 'ground', { sockets: stretch.sockets.filter((k) => k.role !== 'enemy' && k.role !== 'tip') }),
  brick(vineUp, 'arc-test', 'test', 'climb'),
  brick(hopsUp, 'arc-twist', 'twist', 'floating'),
  brick(stretch, 'arc-signature', 'signature', 'ground', { sockets: stretch.sockets.filter((k) => k.role !== 'tip') }),
  brick(hopsUp, 'arc-combine', 'combine', 'hazard'),
];
export const arcKit = (stageId: string): WorldKit => ({
  manifest: {
    ...base,
    name: 'Toy tower, an arc',
    sections: [landing, ...ARC_BRICKS],
    tips: { ...base.tips, climb: "Hold up to climb. (new, needs Matt's approval)" },
    graphs: {
      list: [{ id: 'tower-arc', archetype: 'ascent', code: ARC_CODE }],
      briefs: { [stageId]: { ends: 'quiet', trend: 'up', branching: 'none', teaches: ['climb'], deal: { climb: 29, floating: 29, ground: 28, hazard: 14 }, dealExact: true } },
      chunkSeconds: 30,
    },
  },
  emit: {},
});

/** a test stage's config: an ascent goes up by its kind; `travel` 'down' lays any other kind down */
export const towerCfg = (id: string, type: LevelConfig['objectiveType'], travel?: 'up' | 'down'): LevelConfig => {
  const [w, s] = id.split('-').map(Number);
  return {
    worldIndex: w, miniIndex: s, id, name: 'toy tower', objectiveType: type, targetCount: 1, timeLimit: 0, levelWidth: 1100, levelHeight: 900,
    description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0, ...(travel ? { travel } : {}),
  };
};
