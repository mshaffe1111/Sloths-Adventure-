// AUDIT-B (2026-11-11, ENGINE-AUDIT-B.md B-01). FAILING ON PURPOSE: in 1-1 a first-timer who never falls gets no help at all. The help ladder counts PUT-BACKS only
// (helpLadder.ts putBack, called from engine.ts softFall), and while it is on it silences both older helpers (engine.ts watchForStuck
// `&& !this.help`; DotGuide.tsx `helpLadderOn() ? null : run.struggle.step`). At the double's teach the miss is a jump against a wall on
// solid ground: no fall, no put-back, so no rung ever fires, and the old "Too tall for one jump!" line that would have come at 3 misses
// is muted. Expected to FAIL until a failed try at a face counts on the ladder (or the old watch speaks where the ladder cannot).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import { withPlaySeed } from '../../testlink1_1.ts';
import { recorder } from '../../playRecorder.ts';
import { maxGap } from '../pipeline.ts';
import { skyline, HELP_LINES } from '../../helpLadder.ts';
import { FIRST_RUN_11 } from '../firstRun11.ts';

const SEED = FIRST_RUN_11.seed; // (the first-run layout, Roll A: it lays w1-dip-double-teach)
for (const setting of ['easy', 'normal'] as const) {
  test(`1-1 seed ${SEED} on ${setting}: 15 single jumps at the double teach's wall (no fall) bring some help`, () => {
    setDifficulty(setting);
    const r = withPlaySeed(SEED, () => new RealPlay('1-1', 1));
    const e = r.e as unknown as { currentStage: { meta: { pieces: Array<{ k: string; x0: number; x1: number }> }; gen2?: { budget?: { margin?: number } } }; roadBoxes(): Array<{ x: number; y: number; width: number; height: number }>; helpState(): { on: boolean; grown: unknown[] }; stuck: { told: boolean }; stop(): void };
    // (RealPlay stubs watchForStuck as cosmetic, realPlay.ts COSMETIC: the engine's own runs here, so the old watch counts as it does in play)
    delete (r.e as unknown as { watchForStuck?: unknown }).watchForStuck;
    const events: string[] = [];
    const was = recorder.event;
    recorder.event = function (this: typeof recorder, what: string, detail?: string | number) { events.push(`${what} ${detail ?? ''}`.trim()); return was.call(this, what, detail); } as typeof recorder.event;
    try {
      assert.ok(e.helpState().on, 'the ladder is on');
      const piece = e.currentStage.meta.pieces.find((q) => /double-teach/.test(q.k))!;
      assert.ok(piece, 'the seed lays a double teach');
      const margin = e.currentStage.gen2?.budget?.margin ?? (setting === 'easy' ? 0.65 : 0.82);
      const segs = skyline(piece, e.roadBoxes());
      // (the wall: a join inside the piece no single jump climbs, the lower side wide enough to stand on)
      let wall: { x: number; y: number; rise: number } | null = null;
      for (let i = 0; i + 1 < segs.length; i++) {
        const a = segs[i], b = segs[i + 1];
        if (b.x0 - a.x1 > 1 || a.x1 < piece.x0 || a.x1 > piece.x1 || a.x1 - a.x0 < 120) continue;
        if (a.y - b.y > 0 && maxGap(a.y - b.y, false, margin) < 0) { wall = { x: a.x1, y: a.y, rise: a.y - b.y }; break; }
      }
      assert.ok(wall, 'the piece has a wall one jump cannot climb');
      r.stand(wall.x - 60, wall.y);
      for (let i = 0; i < 6; i++) r.frame({});
      let jumps = 0;
      for (let i = 0; i < 30 * 40 && jumps < 15; i++) {
        const press = r.p.grounded && i % 2 === 0;
        if (press) jumps++;
        r.frame({ right: true, jump: press, press });
        for (let k = 0; k < 12 && press; k++) r.frame({ right: true, jump: true });
        for (let k = 0; k < 60 && !r.p.grounded; k++) r.frame({ right: true });
      }
      const falls = events.filter((v) => v.startsWith('softFall')).length;
      const helped = events.filter((v) => v.startsWith('help ') || v.startsWith('stuckHelp'));
      const lines = r.said.filter((s) => HELP_LINES.has(s.text) || /Too tall/.test(s.text));
      assert.ok(r.p.x < wall.x, `he is still under the wall (x ${Math.round(r.p.x)}, wall ${Math.round(wall.x)}, rise ${Math.round(wall.rise)})`);
      assert.ok(
        helped.length > 0 || lines.length > 0,
        `${jumps} single jumps at a ${Math.round(wall.rise)} px wall in ${piece.k}: ${falls} put-backs, no help event, no line (the old watch reached its line: stuck.told=${e.stuck.told}, muted by the ladder)`,
      );
    } finally {
      recorder.event = was;
      e.stop();
      setDifficulty('normal');
    }
  });
}
