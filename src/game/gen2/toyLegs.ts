/**
 * gen2/toyLegs: a tiny test world for a stage of LEGS (R-165.196; pipeline.ts layStage, legs.ts): a designed graph whose code names
 * each leg's travel, laid from the toy tower's plain pieces (toyTower.ts) and three plain run pieces. Enough for the lay, the
 * verdicts, the route, the flags and the flyer to be proven across mixed legs on many rolls. Nothing here is played, and it is no
 * stage of the game: a level's own pieces come with that level's build.
 */
import type { SectionTemplate, WorldKit } from './types.ts';
import { dropsDown, hopsUp, landing, stretch, upManifest, vineDown, vineUp } from './toyTower.ts';

type Job = NonNullable<SectionTemplate['jobs']>[number];
type Content = NonNullable<SectionTemplate['content']>;
const brick = (of: SectionTemplate, id: string, job: Job, content: Content, more: Partial<SectionTemplate> = {}): SectionTemplate => {
  const { teaches: _t, uses: _u, ...plain } = of;
  return { ...plain, id, name: id, jobs: [job], content, phases: ['ki', 'sho', 'ten', 'ketsu'], ...more };
};

/** a run piece: two banks and a pit between them, a plain jump over (a soft pit with its step out, as any run's) */
export const pitHop: SectionTemplate = {
  id: 'legs-pit-hop',
  name: 'pit hop',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  pieces: [
    { key: 'near', shape: 'bank', w: [260, 320], place: { kind: 'start' } },
    { key: 'far', shape: 'bank', w: [300, 380], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.5, 0.75] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [{ id: 'petals', role: 'pickup', on: 'far', t: 0.5, dn: 34, count: 3, span: 120, allow: ['pickups'] }],
  mirrorable: false,
};

/** a run piece: a bank, a step up onto a second, a jump to a third at the first one's height (every run piece here ends at the
 *  height it began: one brick a job leaves the lay no other section to bring the route back with) */
export const stepRun: SectionTemplate = {
  id: 'legs-step-run',
  name: 'step run',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [
    { key: 'a', shape: 'bank', w: [220, 280], place: { kind: 'start' } },
    { key: 'b', shape: 'bank', w: [200, 260], place: { kind: 'walk', after: 'a', dy: -50 } },
    { key: 'c', shape: 'bank', w: [260, 340], place: { kind: 'jump', after: 'b', dy: 50, share: [0.45, 0.7] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }],
  mirrorable: false,
};

/** a run piece: three floating logs over a long soft pit, bank to bank */
export const logRun: SectionTemplate = {
  id: 'legs-log-run',
  name: 'log run',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [
    { key: 'a', shape: 'bank', w: [220, 280], place: { kind: 'start' } },
    { key: 'l1', shape: 'branch', w: [150, 190], place: { kind: 'jump', after: 'a', dy: -20, share: [0.45, 0.65] }, landing: true },
    { key: 'l2', shape: 'branch', w: [150, 190], place: { kind: 'jump', after: 'l1', dy: 0, share: [0.45, 0.65] }, landing: true },
    { key: 'z', shape: 'bank', w: [260, 340], place: { kind: 'jump', after: 'l2', dy: 20, share: [0.4, 0.6] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'z', kind: 'ground' },
  exitDy: 0,
  sockets: [{ id: 'petal', role: 'pickup', on: 'l2', t: 0.5, dn: 34 }],
  mirrorable: false,
};

/** the bricks, one job each (a designed level: one brick a beat). The run jobs take run pieces, the climb and the descent the toy
 *  tower's own; a leg lays whatever its nodes hold by the lay its travel calls for */
export const LEG_BRICKS: SectionTemplate[] = [
  brick(pitHop, 'legs-practise', 'practise', 'ground'),
  brick(stepRun, 'legs-flow', 'flow', 'ground'),
  brick(logRun, 'legs-test', 'test', 'floating'),
  brick(logRun, 'legs-signature', 'signature', 'floating'),
  // (a level stretch narrow enough for a column's storey)
  brick(stretch, 'legs-combine', 'combine', 'floating', { sockets: [] }),
  brick(vineUp, 'legs-climb-vine', 'climb', 'climb'),
  brick(hopsUp, 'legs-climb-hops', 'climb', 'climb'),
  brick(dropsDown, 'legs-descent-drops', 'descent', 'climb'),
  brick(vineDown, 'legs-descent-vine', 'descent', 'climb'),
];

/** fixture graphs, as a designer writes them (NODES.md §8 with the leg marks): a level, a descent, a level, an ascent, a level */
export const MIXED_CODE = 'A P /D D_ P D_ /R M R /U U^ C U^ /R X R S E';
/** a run up a column and on to the right: the smallest stage of legs */
export const UP_CODE = 'A P /U U^ C U^ /R M R S E';
/** a run down a shaft and on to the right */
export const DOWN_CODE = 'A M /D D_ C D_ /R P R S E';

/** a kit whose one graph is `code`, for the stage `stageId` (the brief is keyed by the stage's id, which the test names) */
export const legsKit = (stageId: string, code: string, width?: number, chunkSeconds = 10): WorldKit => ({
  manifest: {
    ...upManifest,
    name: 'Toy legs',
    sections: [landing, ...LEG_BRICKS],
    ...(width ? { tower: { width } } : {}),
    graphs: {
      list: [{ id: 'legs', archetype: 'sprint', code }],
      briefs: { [stageId]: { ends: 'quiet', trend: 'level', branching: 'none', teaches: [], deal: { ground: 40, floating: 20, climb: 40 }, dealExact: true } },
      chunkSeconds,
    },
  },
  emit: {},
});
