/**
 * quiet12.ts: does a run of steps DOWN keep the 4 s quiet line (seedList.ts QUIET_MAX) when each step carries its own hop? (the Designer,
 * after the packet Critic's attempt-2 line 1 and its quiet11.ts; nothing in the game imports it)
 *   FLOWN=1 npx tsx reference/specs/sims/quiet12.ts [seeds=120]
 * Hand-built test sections with the same climb (`w H c D c D`: up 398-436 px) and a way back down, laid in 1-2's kit in the test/climb
 * cell (supply12's kit, FLOWN: the flown reach and the counted double, as after Engine items 3 and 5). The way down is a string of
 * letters, one run per string (DOWN=JNJN,JNYN picks them; BEATS=1 prints the beats the inspector reads on the first two rolls):
 *   n  a bare step down: a bank 62-78 px lower, 260-320 wide, nothing on it     (1-1's test-back run-out, the Critic's finding)
 *   N  a hop step: a bank 62-78 px lower, 300-360 wide, a 50-56 px hop stump at its middle, a petal on the stump
 *   Y  the kit's jump down a step (w1.ts:1007): a bank 62-70 px lower across a soft gap 0.5-0.6 of a single's reach, a petal on it
 *   J  the drop: a ledge 130-140 px lower and 180-220 px wide, no gap (he walks off the lip and lands on it), a petal on it; one
 *      drop pays back two steps
 *   G  the drop across a soft gap 95-110 px wide (flown and NOT used: the inspector reads it as no beat, like Y, and it is longer)
 *   c  a step up (62-78), H a level bank with a 50-56 px hop stump (the kit's hop wall): to fly a drop between two beats
 * Default runs: six bare n; six N; and the packet's mixed ways down (the lead's ruling 5:10 PM ET 11-11: no beat repeated to fill time).
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
/** the way down, one piece (or two) per letter: n a bare step, N a hop step, Y the kit's jump down a step (w1.ts:1007), J the drop */
function pieces(down: string): { ps: SectionPiece[]; sockets: Any[] } {
  const ps: SectionPiece[] = [{ key: 'in', shape: 'bank', w: [260, 320], place: { kind: 'start' }, style: 'moss_stone', main: true, landing: true }];
  const sockets: Any[] = [];
  let prev = 'in';
  const walk = (k: string, dy: [number, number], w: [number, number]) => { ps.push(bank(k, prev, dy, w)); prev = k; };
  const jump = (k: string, place: Any) => { ps.push({ key: k, shape: 'bank', w: [300, 360], place: { kind: 'jump', after: prev, soft: true, ...place }, style: 'moss_stone', main: true, landing: true }); prev = k; };
  walk('hf', [0, 0], [300, 360]); ps.push(stump('hs', 'hf'));
  walk('c1', [-78, -62], [260, 320]);
  walk('d1f', [0, 0], [260, 300]);
  ps.push({ key: 'd1', shape: 'bank', w: [320, 380], place: { kind: 'double', after: 'd1f', dy: [-140, -137], gapPx: [0, 0] }, style: 'moss_stone', main: true, landing: true, block: 'double' }); prev = 'd1';
  walk('c2', [-78, -62], [260, 320]);
  walk('d2f', [0, 0], [260, 300]);
  ps.push({ key: 'd2', shape: 'bank', w: [320, 380], place: { kind: 'double', after: 'd2f', dy: [-140, -137], gapPx: [0, 0] }, style: 'moss_stone', main: true, landing: true, block: 'double' }); prev = 'd2';
  [...down].forEach((ch, j) => {
    const k = j === down.length - 1 ? 'out' : `x${ch}${j}`;
    if (ch === 'n') walk(k, [62, 78], [260, 320]);
    else if (ch === 'N') { walk(k, [62, 78], [300, 360]); ps.push(stump(`s${j}`, k)); sockets.push({ id: `p${j}`, role: 'pickup', on: `s${j}`, t: 0.5, dn: 34, count: 1 }); }
    else if (ch === 'Y') { jump(k, { dy: [62, 70], share: [0.5, 0.6] }); sockets.push({ id: `p${j}`, role: 'pickup', on: k, t: 0.5, dn: 34, count: 1 }); }
    else if (ch === 'J') { walk(k, [130, 140], [180, 220]); sockets.push({ id: `p${j}`, role: 'pickup', on: k, t: 0.5, dn: 34, count: 1 }); }
    else if (ch === 'c') { walk(k, [-78, -62], [260, 320]); sockets.push({ id: `p${j}`, role: 'pickup', on: k, t: 0.5, dn: 34, count: 1 }); }
    else if (ch === 'H') { walk(k, [0, 0], [300, 360]); ps.push(stump(`s${j}`, k)); sockets.push({ id: `p${j}`, role: 'pickup', on: `s${j}`, t: 0.5, dn: 34, count: 1 }); }
    else if (ch === 'G') { jump(k, { dy: [130, 140], gapPx: [95, 110] }); sockets.push({ id: `a${j}`, role: 'arc', on: k, t: 0 }); }
    else throw new Error(`no down beat ${ch}`);
  });
  return { ps, sockets };
}
const mk = (id: string, down: string): Any => {
  const { ps: all, sockets } = pieces(down);
  return { id, name: id, phases: ['ketsu'], difficulty: 6, needs: ['double'], uses: ['double'], archetypes: 'any', jobs: ['test'], content: 'climb', feel: ['1-2'], not: [], rating: 6, source: 'quiet12', pieces: [all[0]],
    subBlocks: [{ id: 'body', versions: [{ id: 'v', pieces: all.slice(1), sockets }] }],
    entry: { piece: 'in', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false };
};
const N = Number(process.argv[2] ?? 120);
const FLOWN = !!process.env.FLOWN;
const c12 = generateAllLevels().find((c) => c.id === '1-2')!;
const config = (FLOWN ? { ...c12, id: '1-1', miniIndex: 1 } : c12) as typeof c12;
const RUNS = (process.env.DOWN ? process.env.DOWN.split(',') : ['nnnnnn', 'NNNNNN', 'JNJN', 'JNYN', 'NJNJ', 'NJJN', 'NYNJ', 'NJYJ', 'JNJY', 'JNcJcN', 'JNHJN']);
for (const down of RUNS) {
  const id = `q-${down}`;
  const worst: number[] = []; let laid = 0, builds = 0;
  for (let seed = 1; seed <= N; seed++) {
    try {
      const kit: Any = kit12(undefined, FLOWN);
      // (the probe section is the only test/climb in the pool)
      kit.manifest.sections = kit.manifest.sections.filter((s: Any) => !((s.jobs ?? []).includes('test') && s.content === 'climb'));
      const sec = mk(id, down); if (FLOWN) sec.feel = ['1-1'];
      kit.manifest.sections.push(sec);
      const st: Any = buildGen2Stage({ config, kit, seed, difficulty: 'normal' });
      builds++;
      const qs = (st.gen2.sections as Any[]).filter((q) => q.template === id);
      if (!qs.length) continue;
      laid++;
      const R: Any = pickRoute(config.objectiveType, withGoals(st as never) as never);
      const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
      if (process.env.BEATS && laid <= 2) for (const q of qs) console.log(`  ${id} seed ${seed} x ${Math.round(q.x0)}-${Math.round(q.x1)}: ` + (R.used.br.beats as Any[]).filter((b) => b.x > q.x0 - 50 && b.x < q.x1 + 50).map((b) => `${b.letter}@${Math.round(b.x - q.x0)},t${b.t.toFixed(1)}(${b.what})`).join(' | '));
      for (const q of qs) worst.push(Math.round(10 * Math.max(0, ...dn.list.filter((d: Any) => Math.max(d.x0, d.x1) > q.x0 && Math.min(d.x0, d.x1) < q.x1).map((d: Any) => d.counted))) / 10);
    } catch (e) { if (process.env.BEATS) console.log(`  seed ${seed}: ${String((e as Error).message).slice(0, 300)}`); /* a roll that throws is not measured */ }
  }
  worst.sort((a, b) => a - b);
  console.log(`${id} (the climb, then ${[...down].join(' ')}): ${builds} builds of ${N}, laid on ${laid}; worst quiet stretch touching it: ${worst.length ? `min ${worst[0]} median ${worst[worst.length >> 1]} max ${worst[worst.length - 1]} s; over 4 s on ${worst.filter((x) => x > 4).length} of ${worst.length}` : 'never laid'}`);
}
