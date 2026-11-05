// Critic's run: what a fresh helper gets when it writes a non-World-1 stage spec with the engine as it is (engine-mixer 7d9ad9a9).
import { checkSpec, linesFor, type StageSpec } from '../../../src/game/mixer/spec.ts';
import { IDEAS, IDEA_KINDS, PIECES } from '../../../src/game/mixer/library.ts';
const base = { story: { beat: 'b', feel: 'f' }, goal: { kind: 'sprint' as const } };
// 2-4 "Over the Water": World 2's vine stage (stagePlan X-4). Best a helper can do: the library has no liana, no drifting log idea.
const s24: StageSpec = { ...base, id: '2-4', name: 'Over the Water',
  profile: { trend: 'level', tempo: 'steady', hills: 'rolling', branching: 'light', water: true, petals: 'trail', look: { lead: 'water', art: 'w2' },
    length: { normal: [150, 200], easyMin: 120 }, mix: { vines: 'lots', water: 'lots' }, theme: 'river', core: ['lily', 'log'] },
  nodes: [ { job: 'warm-up', deck: ['bank hops'] }, { job: 'teach swing', deck: ['liana swing'] }, { job: 'crossing', deck: ['lily-pad hop', 'reed isles'] },
           { job: 'river logs', deck: ['drifting logs'] }, { job: 'test', deck: ['snap dash'] } ] };
// 6-9 the swimming stage (ENGINE-SPEC §D): swims are "quick in-and-out beats".
const s69: StageSpec = { ...base, id: '6-9', name: 'Blackwater',
  profile: { trend: 'level', tempo: 'brisk', hills: 'rolling', branching: 'light', water: true, petals: 'trail', look: { lead: 'water', art: 'w6' },
    length: { normal: [150, 200], easyMin: 120 }, mix: { water: 'lots', enemies: 'some' }, theme: 'swamp', core: ['lily', 'reed'] },
  nodes: [ { job: 'warm-up', deck: ['lily-pad hop'] }, { job: 'swim', deck: ['swim'] }, { job: 'animal', deck: ['caiman log'] }, { job: 'rope', deck: ['rope crossing'] } ] };
for (const s of [s24, s69]) {
  const e = checkSpec(s, IDEAS, PIECES, IDEA_KINDS);
  console.log(`${s.id} ${s.name}: ${e.length} problem(s)`); for (const x of e) console.log('  - ' + x.slice(0, 170));
  console.log('  lines it would be held to:', JSON.stringify(linesFor(s.profile)));
}
console.log('library ideas:', Object.keys(IDEAS).length, '| piece kinds:', Object.keys(PIECES).length, '| kinds with a non-W1 theme:',
  Object.entries(PIECES).filter(([, p]) => p.worlds.some((w) => !['forest', 'river', 'canopy-high', 'swamp'].includes(w))).map(([k]) => k).join(','));
