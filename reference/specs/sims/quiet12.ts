/**
 * quiet12.ts: does a run of steps DOWN keep the 4 s quiet line (seedList.ts QUIET_MAX) when each step carries its own hop? (the Designer,
 * after the packet Critic's attempt-2 line 1 and its quiet11.ts; nothing in the game imports it)
 *   FLOWN=1 npx tsx reference/specs/sims/quiet12.ts [seeds=120]
 * Two hand-built test sections with the same climb (`w H c D c D`: up 416 px) and six steps back down, laid in 1-2's kit in the
 * test/climb cell (supply12's kit, FLOWN: the flown reach and the counted double, as after Engine items 3 and 5):
 *   bare:  six `n` (a bank one step down, 260-320 wide, nothing on it)       1-1's test-back run-out, the Critic's finding
 *   hops:  six `N` (a bank one step down, 300-360 wide, a 50-56 px hop stump at its middle, a petal on the stump)
 * For every roll that lays one, the worst quiet stretch touching it, measured as tools/engine/seedlist.ts measures the quiet line
 * (tools/inspect/analyze.ts deadTime on the picked route).
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../../../tools/inspect/analyze.ts';
import type { SectionPiece } from '../../../src/game/gen2/types.ts';
import { kit12 } from './supply12.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const bank = (key: string, after: string, dy: [number, number], w: [number, number]): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'walk', after, dy }, style: 'moss_stone', main: true, landing: true });
const stump = (key: string, on: string): SectionPiece => ({ key, shape: 'block', w: [120, 160], place: { kind: 'on', on, at: [0.45, 0.55], h: [50, 56] }, style: 'moss_stone', landing: true });
function pieces(hops: boolean): SectionPiece[] {
  const ps: SectionPiece[] = [{ key: 'in', shape: 'bank', w: [260, 320], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }];
  let prev = 'in';
  const walk = (k: string, dy: [number, number], w: [number, number]) => { ps.push(bank(k, prev, dy, w)); prev = k; };
  walk('hf', [0, 0], [300, 360]); ps.push(stump('hs', 'hf'));
  walk('c1', [-78, -62], [260, 320]);
  walk('d1f', [0, 0], [260, 300]);
  ps.push({ key: 'd1', shape: 'bank', w: [320, 380], place: { kind: 'double', after: 'd1f', dy: [-140, -137], gapPx: [0, 0] }, style: 'moss_stone', main: true, landing: true, block: 'double' }); prev = 'd1';
  walk('c2', [-78, -62], [260, 320]);
  walk('d2f', [0, 0], [260, 300]);
  ps.push({ key: 'd2', shape: 'bank', w: [320, 380], place: { kind: 'double', after: 'd2f', dy: [-140, -137], gapPx: [0, 0] }, style: 'moss_stone', main: true, landing: true, block: 'double' }); prev = 'd2';
  for (let j = 0; j < 6; j++) {
    walk(j === 5 ? 'out' : `n${j}`, [62, 78], hops ? [300, 360] : [260, 320]);
    if (hops) ps.push(stump(`s${j}`, prev));
  }
  return ps;
}
const mk = (id: string, hops: boolean): Any => {
  const all = pieces(hops);
  return { id, name: id, phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], archetypes: 'any', jobs: ['test'], content: 'climb', feel: ['1-2'], not: [], rating: 6, source: 'quiet12', pieces: [all[0]],
    subBlocks: [{ id: 'body', versions: [{ id: 'v', pieces: all.slice(1), sockets: hops ? [0, 1, 2, 3, 4, 5].map((j) => ({ id: `p${j}`, role: 'pickup', on: `s${j}`, t: 0.5, dn: 34, count: 1 })) : [] }] }],
    entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false };
};
const N = Number(process.argv[2] ?? 120);
const FLOWN = !!process.env.FLOWN;
const c12 = generateAllLevels().find((c) => c.id === '1-2')!;
const config = (FLOWN ? { ...c12, id: '1-1', miniIndex: 1 } : c12) as typeof c12;
for (const [id, hops] of [['q-bare', false], ['q-hops', true]] as Array<[string, boolean]>) {
  const worst: number[] = []; let laid = 0, builds = 0;
  for (let seed = 1; seed <= N; seed++) {
    try {
      const kit: Any = kit12(undefined, FLOWN);
      // (the probe section is the only test/climb in the pool)
      kit.manifest.sections = kit.manifest.sections.filter((s: Any) => !((s.jobs ?? []).includes('test') && s.content === 'climb'));
      const sec = mk(id, hops); if (FLOWN) sec.feel = ['1-1'];
      kit.manifest.sections.push(sec);
      const st: Any = buildGen2Stage({ config, kit, seed, difficulty: 'normal' });
      builds++;
      const qs = (st.gen2.sections as Any[]).filter((q) => q.template === id);
      if (!qs.length) continue;
      laid++;
      const R: Any = pickRoute(config.objectiveType, withGoals(st as never) as never);
      const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
      for (const q of qs) worst.push(Math.round(10 * Math.max(0, ...dn.list.filter((d: Any) => Math.max(d.x0, d.x1) > q.x0 && Math.min(d.x0, d.x1) < q.x1).map((d: Any) => d.counted))) / 10);
    } catch { /* a roll that throws is not measured */ }
  }
  worst.sort((a, b) => a - b);
  console.log(`${id} (${hops ? 'six N: each step down has a hop stump' : 'six bare n'}): ${builds} builds of ${N}, laid on ${laid}; worst quiet stretch touching it: ${worst.length ? `min ${worst[0]} median ${worst[worst.length >> 1]} max ${worst[worst.length - 1]} s; over 4 s on ${worst.filter((x) => x > 4).length} of ${worst.length}` : 'never laid'}`);
}
