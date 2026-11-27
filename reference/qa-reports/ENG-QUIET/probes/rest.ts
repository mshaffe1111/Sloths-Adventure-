// ENG-QUIET: restCheck no-rest bursts per listed stage, seeds 1-6 Normal, on the tree as it stands (run before and after a change, diff)
// for) is a move beat busy for its whole time, as a swing is; C = at one base, a wait (dur) comes before a move (the move's busy starts
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { LISTED, playFinish } from '../../../../src/game/gen2/listed.ts';
import { withGoals } from '../../../../src/game/goals.ts';
import { pickRoute } from '../../../../tools/inspect/eraRoll.ts';
import { deadTime, restCheck, NORMAL_GAP } from '../../../../tools/inspect/analyze.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
import { QUIET_MAX } from '../../../../src/game/gen2/seedList.ts';
const n = Number(process.argv[2] ?? 6); const only = process.argv.slice(3);
const ids = only.length ? only : Object.keys(LISTED);
const worst = (beats: any[], total: number, samples: any[], gx: number) => {
  const dn = deadTime(beats, total, NORMAL_GAP, samples); let w = 0, at = 0;
  for (const d of dn.list) { const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1); if (lo >= gx) continue;
    const c = d.counted * (hi > gx ? (gx - lo) / Math.max(1, hi - lo) : 1); if (c > w) { w = c; at = (lo + Math.min(hi, gx)) / 2; } }
  return { q: Math.round(w * 10) / 10, at };
};
const reclock = (raw: any[], waitFirst: boolean) => {
  const r = raw.map((b, i) => ({ b, i })).sort((p, q) => p.b.base - q.b.base || (waitFirst ? (q.b.dur > 0 ? 1 : 0) - (p.b.dur > 0 ? 1 : 0) : 0) || p.i - q.i);
  let delay = 0; return r.map(({ b }) => { const o = { ...b, t: b.base + delay }; delay += b.dur; return o; });
};
for (const id of ids) {
  let src: any; try { src = stageSource(id); } catch { console.log(`${id}: no source`); continue; }
  const row = LISTED[id]; const cells: string[] = []; let flips = 0, drops = 0;
  for (let seed = 1; seed <= n; seed++) {
    try {
      const st0 = buildGen2Stage({ config: src.cfg, kit: src.kit(), seed, difficulty: 'normal' }) as any;
      const st = playFinish(row, structuredClone(st0), 'normal') as any;
      const R = pickRoute(src.cfg.objectiveType, withGoals({ ...st } as never) as never) as any; const U = R.used;
      const goal = st.gen2.sections.filter((q: any) => q.phase === 'goal').pop(); const gx = goal ? goal.x0 : Infinity;
      const base = U.br.beats as any[]; const total = U.br.total;
      const raw = base.map(({ t, ...b }) => b);
      let tt = 0; const add: any[] = [];
      for (const s of U.route.segs) { if (s.kind === 'lianaDrop' || s.kind === 'logCatch') { drops++; add.push({ base: tt, dur: 0, act: s.dt, x: s.x0, y: s.y0, letter: 'V', count: 1, what: s.kind, fam: `move:${s.kind}` }); } tt += s.dt; }
      cells.push(`s${seed} ${restCheck(base, total, U.samples).noRest}`);
    } catch (e: any) { cells.push(`s${seed} throw`); }
  }
  console.log(`${id}: ${cells.join(' ')}`);
}
