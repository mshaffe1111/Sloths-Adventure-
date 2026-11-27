/**
 * CREEP UNDER A WATCHER (ENG-ROOT item 3; 3-2.md beat 9; level.md rules 21, 23): the first-timer on World 3's root row (toyRoot.ts, laid by
 * gen2 on World 3's real kit) plays it in the real engine.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keptFoes } from './pipeline.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { withFixtureConfig, type RealPlay } from '../realPlay.ts';
import { ROOT_TOY, rootBuilt, rootCfg, rootKit } from './toyRoot.ts';
import { firstTimer, FT_ADULT, type FirstTimer } from '../../../tools/inspect/firsttimer.ts';
import type { Rope } from '../types.ts';
import type { CastPlay } from '../castPlay.ts';

interface Frame { t: number; x: number; onRoot: boolean; phases: string[]; lit: boolean; ms: string }
interface Opts { world?: <T>(st: T) => T; noLit?: boolean; cap?: number }
/** the first-timer's run on the row, every frame recorded; `noLit` plants the cast's 'lit = seen' read away (Prey.lit always false) */
function play(who: FirstTimer, o: Opts = {}, from = 1) {
  const { st, seed } = rootBuilt(who.setting, rootKit, from);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ROOT_TOY]: { kit: () => rootKit, world: o.world ?? ((s) => s), seeds: [] } }, () => {
    const undo = plantSeedList(ROOT_TOY, { dict, seeds: [seed], plans: [packed] });
    try {
      const root = st.ropes!.find((q) => q.look === 'root')!;
      return withFixtureConfig(rootCfg, () => {
        const frames: Frame[] = [];
        let planted = false;
        const r = firstTimer(ROOT_TOY, seed, who, { cap: o.cap ?? 120, onFrame(sim: RealPlay) {
          const e = sim.e as unknown as { ropes: Rope[]; ropeId: number; castHero: { lit?: boolean }; cast: CastPlay | null };
          if (o.noLit && !planted && e.cast) {
            planted = true;
            const step = e.cast.step.bind(e.cast);
            e.cast.step = (h, ...a) => step({ ...h, lit: false }, ...a);
          }
          const rope = sim.p.hanging ? e.ropes.find((q) => q.id === e.ropeId) : undefined;
          // (the row's watcher: an animal of the cast on the root's floor whose patrol crosses the root's span)
          const members = ((e.cast as unknown as { members: Array<{ def: { kind: string }; s: { phase: string; x: number; y: number; minX: number; maxX: number; facing: number } }> } | null)?.members ?? [])
            .filter((m) => Math.abs(m.s.y - root.g0) < 40 && m.s.minX < root.x1 && m.s.maxX > root.x0);
          frames.push({ t: sim.t, x: sim.p.x, onRoot: rope?.look === 'root', phases: members.map((m) => m.s.phase), lit: !!e.castHero.lit, ms: members.map((m) => `${m.def.kind}@${Math.round(m.s.x)},${Math.round(m.s.y)}f${m.s.facing}`).join(' ') });
        } });
        return { r, frames, root };
      });
    } finally {
      undo();
    }
  });
}

const ALERT = new Set(['tell', 'act', 'hunt']);
/** the verdicts on his crossing: took the root near its near end, left it near its far end, the cast alerted while he was on it or
 *  under it, and his creep's pace on it (px/s over the frames he moved) */
function crossing(run: ReturnType<typeof play>) {
  const { frames, root } = run;
  const on = frames.filter((f) => f.onRoot);
  const under = frames.filter((f) => f.x >= root.x0 - 400 && f.x <= root.x1 + 60);
  const seen = under.filter((f) => f.phases.some((ph) => ALERT.has(ph)));
  let dist = 0, time = 0;
  for (let k = 1; k < frames.length; k++) {
    if (!frames[k].onRoot || !frames[k - 1].onRoot) continue;
    const dx = Math.abs(frames[k].x - frames[k - 1].x);
    if (dx > 0.5) { dist += dx; time += frames[k].t - frames[k - 1].t; }
  }
  return {
    took: on.length > 0 && on[0].x - root.x0 < 120, crossed: on.length > 0 && root.x1 - on.at(-1)!.x < 120,
    seen: seen.length, litOn: on.filter((f) => f.lit).length, pace: time ? dist / time : 0,
    hits: run.r.harms.filter((h) => h.x >= root.x0 - 60 && h.x <= root.x1 + 60).length,
  };
}
const ADULT = { ...FT_ADULT, setting: 'normal' as const };

test('probe', () => {
  for (const [name, who, o] of [['green', ADULT, {}], ['noRootWait', { ...ADULT, noRootWait: true }, {}], ['noRootWait+noLit', { ...ADULT, noRootWait: true }, { noLit: true }]] as const) {
    const t0 = Date.now();
    const out: string[] = [];
    for (const setting of ['normal', 'easy'] as const) for (let from = 1; from <= 40; from += 5) {
      const c = crossing(play({ ...who, setting }, o, from));
      out.push(`${setting[0]}${from}:${c.took ? 'T' : '-'}${c.crossed ? 'X' : '-'}s${c.seen}h${c.hits}p${Math.round(c.pace)}`);
    }
    console.log('RUN', name, out.join(' '), Date.now() - t0, 'ms');
  }
});
test.skip('probe2', () => {
  for (const [st, from] of [['easy', 36]] as const) {
    const run = play({ ...ADULT, setting: st }, {}, from);
    const { root } = run;
    console.log('P2', st, from, 'root', root.x0, root.x1, root.y, root.g0, run.frames.filter((f) => f.x >= root.x0 - 400 && f.x <= root.x1 + 100).filter((f, i) => i % 8 === 0 || f.phases.some((q) => q !== 'rest')).map((f) => `${f.t.toFixed(1)}:${Math.round(f.x)}${f.onRoot ? 'R' : ''}${f.lit ? 'L' : ''}:${f.phases.join('/')}:${f.ms}`).join(' | '));
  }
});
