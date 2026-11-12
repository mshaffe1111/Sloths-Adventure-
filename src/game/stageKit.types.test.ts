// ADR-003: the stage kit's types refuse the states they promise to refuse. Checked by tsc (`@ts-expect-error` fails the build if the
// line ever compiles); the node test only proves the file loads.
import { test } from 'node:test';
import type { MechanicUse, MissionKindOf, Mutator, ReachMovingMutator, SpatialProfile, StageBrief } from './stageKit.types.ts';

type Eq<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const yes = <T extends true>(t: T) => t;

const hand = { kind: 'hand', builder: 'w4LongDrop' } as const;
export const ok: SpatialProfile[] = [
  { shape: 'run', travel: 'left', source: { kind: 'gen2' } },
  { shape: 'switchback', travel: 'down', source: hand },
  { shape: 'arena', travel: 'stay', source: hand },
];
// @ts-expect-error a tower only goes up
export const badTower: SpatialProfile = { shape: 'tower', travel: 'down', source: hand };
// @ts-expect-error an arena does not travel
export const badArena: SpatialProfile = { shape: 'arena', travel: 'right', source: hand };

export const clocked: MechanicUse = { id: 'rocks', clock: 'c1' };
// @ts-expect-error a timed piece names its clock
export const unclocked: MechanicUse = { id: 'crosser' };

// @ts-expect-error a tether moves reach: its kind fixes that
export const tetherSame: Mutator = { kind: 'tether', reach: 'same', lengthPx: 200, breaks: ['thorn'] };

export const brief: StageBrief = {
  id: '4-7', mission: { kind: 'reach-exit' }, profile: { shape: 'switchback', travel: 'down', source: hand },
  clocks: [{ id: 'c1', phases: [{ name: 'warn', seconds: 0.8 }, { name: 'on', seconds: 1 }, { name: 'off', seconds: 2 }], offset: 0, easyStretch: 1.3 }],
  mutators: [], mechanics: [{ id: 'rocks', clock: 'c1' }], fall: 'per-gap', reach: { kind: 'unflown' }, teaches: ['rocks'],
};
// @ts-expect-error a flown claim may only list mutators that move reach
export const badClaim: StageBrief['reach'] = { kind: 'flown', settings: ['easy'], mutators: ['chase'] };

yes<Eq<ReachMovingMutator, 'tether' | 'time-scale'>>(true);
yes<Eq<MissionKindOf<'harvest'>, 'collect'>>(true);
yes<Eq<MissionKindOf<'ascent'>, 'reach-exit'>>(true);
yes<Eq<MissionKindOf<'boss_lair'>, 'boss'>>(true);

test('stage kit types load (the checks are tsc)', () => {});
