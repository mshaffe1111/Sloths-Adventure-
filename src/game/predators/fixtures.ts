/**
 * predators/fixtures: what the kit's tests share (src/game/predator*.test.ts). Not part of the game: nothing in play imports it.
 * `run` is the important one: it steps a predator and asserts the tell gate on EVERY step, so every test of every habit is also a
 * test that nothing hurts without a full tell right before it.
 */
import assert from 'node:assert/strict';
import { beatAt, beatOf } from '../clock.ts';
import type { ClockDef } from '../stageKit.types.ts';
import { hurt, stepPredator, tellOf } from './core.ts';
import type { PredatorDef, PredatorEvents, PredatorState, Post, Prey, Scene } from './types.ts';

export const DT = 1 / 30;

/** a plain ground animal the tests bend into each habit */
export const base = (over: Partial<PredatorDef> = {}): PredatorDef => ({
  kind: 'test',
  habit: 'patrol',
  sight: { ahead: 200, behind: 80, tall: 80 },
  speed: { rest: 30, hunt: 60 },
  engage: 100,
  tell: 0.5,
  act: { aim: 'ahead', seconds: 0.2, speed: 200, reach: 60, tall: 30 },
  recover: 0.6,
  cool: 1.2,
  giveUp: 2,
  easy: { tell: 1.3, cool: 1.5, speed: 0.85 },
  beatenBy: { punch: { ends: 'stunned', seconds: 2 }, trap: { ends: 'chasedOff' }, stomp: { ends: 'flees', seconds: 5 } },
  first: 'punch',
  ...over,
});
export const post = (over: Partial<Post> = {}): Post => ({ x: 500, y: 300, minX: 300, maxX: 700, ...over });
export const prey = (over: Partial<Prey> = {}): Prey => ({ x: 0, y: 300, facing: 1, still: false, covered: false, ...over });

/** run a predator for `seconds`, with the hero from `at(t)`; returns every event with its time, and checks the tell gate on the way */
export function run(
  def: PredatorDef, s: PredatorState, seconds: number, at: (t: number) => Prey, o: { easy?: boolean; t0?: number; clock?: ClockDef } = {},
): Array<PredatorEvents & { t: number }> {
  const out: Array<PredatorEvents & { t: number }> = [];
  const b = o.clock ? beatOf(o.clock, !!o.easy) : undefined;
  let told = s.phase === 'tell' ? s.t : 0;
  for (let i = 0, t = o.t0 ?? 0; i < Math.round(seconds / DT); i++, t += DT) {
    const before = s.phase;
    const sc: Scene = { t, dt: DT, hero: at(t), easy: !!o.easy, beat: b ? beatAt(b, t) : undefined };
    const ev = stepPredator(def, s, sc);
    if (Object.keys(ev).length) out.push({ ...ev, t });
    // THE GATE, on every step of every test: it can only start to hurt out of a tell that ran its full length
    if (s.phase === 'act' && before !== 'act') {
      assert.equal(before, 'tell', `${def.kind}: act entered from ${before}`);
      assert.ok(told >= tellOf(def, !!o.easy) - 1e-9, `${def.kind}: act after only ${told.toFixed(3)} s of tell`);
    }
    told = s.phase === 'tell' ? (before === 'tell' ? told + DT : DT) : 0;
    if (s.phase !== 'act') assert.equal(hurt(def, s), null, `${def.kind}: a hurt box in ${s.phase}`);
  }
  return out;
}
export const lastT = (ev: Array<PredatorEvents & { t: number }>, k: keyof PredatorEvents): number => {
  const hit = ev.filter((e) => e[k]);
  return hit.length ? hit[hit.length - 1].t : NaN;
};
export const firstT = (ev: Array<PredatorEvents & { t: number }>, k: keyof PredatorEvents): number => ev.find((e) => e[k])?.t ?? NaN;
