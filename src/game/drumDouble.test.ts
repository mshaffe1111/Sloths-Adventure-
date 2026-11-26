// The twist's doubled drum (ENG-29-e G1; reference/design/2-9.md beat 6, "the drum doubles"): the brief's section mark (TempoSpec.doubleIn)
// laid as x spans on the built stage's tempo (tempo.ts doubleSpans), and the REAL engine passing `doubled` to the drum while Pokey's middle
// is inside one, on BOTH settings (Easy's drum doubles too). On the tempo toy (gen2/worlds/w2TempoToy.ts) with its stones' section marked:
// the engine's own drumTicks are run through the drum's schedule (audio/drum.ts DrumSchedule), and every hit inside the span is within a
// frame of a half-beat, every half-beat there has its hit; outside, only the whole beats. RED with the field ignored (no off-beat hit).
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { sound } from './audio.ts';
import { doubleSpans, drumDoubled, tempoBeat, type TempoSpec } from './tempo.ts';
import { buildGen2Stage, keptFoes } from './gen2/pipeline.ts';
import { withTestStage } from './gen2/listed.ts';
import { packPlan, plantSeedList } from './gen2/seedList.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow } from './gen2/worlds/w2TempoToy.ts';
import { DrumSchedule, type DrumBeat, type DrumCue } from '../audio/drum.ts';

const SEED = 1;
const FRAME = 1 / 30;
const MARKED: TempoSpec = { ...COURT_TEMPO, doubleIn: ['toy-court-stones'] };

test('doubleSpans: the mark\'s placed sections as spans, touching ones merged; a mark that lays nothing is named; no mark, no spans', () => {
  const secs = [{ template: 'a', x0: 0, x1: 100 }, { template: 'b', x0: 100, x1: 300 }, { template: 'b', x0: 300, x1: 400 }, { template: 'b', x0: 900, x1: 1000 }];
  assert.deepEqual(doubleSpans({ ...COURT_TEMPO, doubleIn: ['b'] }, secs), { spans: [{ x0: 100, x1: 400 }, { x0: 900, x1: 1000 }], problems: [] });
  assert.deepEqual(doubleSpans({ ...COURT_TEMPO, doubleIn: ['z'] }, secs).problems, ["tempo: the drum doubles in 'z', which this roll lays nowhere"]);
  assert.deepEqual(doubleSpans(COURT_TEMPO, secs), { problems: [] });
  const t: TempoSpec = { ...COURT_TEMPO, double: [{ x0: 100, x1: 400 }] };
  assert.ok(drumDoubled(t, 100) && drumDoubled(t, 399) && !drumDoubled(t, 400) && !drumDoubled(t, 99) && !drumDoubled(COURT_TEMPO, 200));
});

test('the real engine doubles the drum inside the twist\'s span, on both settings: every hit there within a frame of a half-beat, every half-beat struck; outside, whole beats only', () => {
  for (const d of ['normal', 'easy'] as const) {
    const row = tempoRow({ tempo: MARKED });
    const st = withTestStage({ [TEMPO_ID]: row }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit({ tempo: MARKED }), seed: SEED, difficulty: 'normal' }));
    assert.deepEqual(st.gen2.errors, [], d);
    const dict: string[] = [];
    const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
    withTestStage({ [TEMPO_ID]: row }, () => {
      const undo = plantSeedList(TEMPO_ID, { dict, seeds: [SEED], plans: [packed] });
      setDifficulty(d);
      const s = sound as unknown as { drumTick: (b: DrumBeat, g: number, doubled?: boolean) => void };
      const t0 = s.drumTick;
      const ticks: Array<{ b: DrumBeat; g: number; doubled: boolean }> = [];
      s.drumTick = (b, g, doubled = false) => void ticks.push({ b, g, doubled });
      try {
        const sim = new RealPlay(TEMPO_ID, SEED, tempoCfg());
        const tempo = sim.stage.tempo!;
        const span = tempo.double?.[0];
        assert.ok(span && span.x1 - span.x0 > 200, `${d}: the built stage carries the twist's span (${JSON.stringify(tempo.double)})`);
        const P = sim.e.player;
        /** stand his middle at x on the ground there, again each frame (he is held, not played: the drum reads where he is) */
        const at = (x: number) => {
          const pl = sim.stage.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, b) => a.y - b.y)[0];
          assert.ok(pl, `${d}: ground at x ${x}`);
          return () => sim.stand(x - P.width / 2, pl.y);
        };
        const outside = at(Math.max(span.x0 - 120, 40)), inside = at(span.x0 + 120);
        const phase: Array<'out' | 'in'> = [];
        for (let f = 0; f < 150; f++) { outside(); sim.frame(); phase.push('out'); }
        for (let f = 0; f < 150; f++) { inside(); sim.frame(); phase.push('in'); }
        assert.equal(ticks.length, phase.length, `${d}: a drumTick every step`);
        // (the engine's ticks through the drum's own schedule: the hits it would put on the audio clock)
        const sched = new DrumSchedule();
        const hits: Array<DrumCue & { where: 'out' | 'in' }> = [];
        ticks.forEach((k, i) => { for (const c of sched.step(k.b, k.g, k.g + 5, k.doubled).play) hits.push({ ...c, where: phase[i] }); });
        const B = tempoBeat(COURT_TEMPO, d === 'easy');
        assert.ok(ticks.every((k) => Math.abs(k.b.beat - B) < 1e-9), `${d}: the court's beat on the setting`);
        const gIn = ticks[150].g, gEnd = ticks[ticks.length - 1].g;
        const inHits = hits.filter((h) => h.g >= gIn + 0.2 && h.g < gEnd), outHits = hits.filter((h) => h.g < gIn - 0.2);
        const off = (g: number, step: number) => Math.abs(g / step - Math.round(g / step)) * step;
        // (inside: every hit on a half-beat, and every half-beat in the window struck, off-beats included)
        assert.ok(inHits.every((h) => off(h.g, B / 2) <= FRAME), `${d}: a hit inside off the half-beat`);
        const halves: number[] = [];
        for (let k = Math.ceil((gIn + 0.2) / (B / 2)); k * (B / 2) < gEnd - 0.2; k++) halves.push(k * (B / 2));
        assert.ok(halves.some((g) => off(g, B) > FRAME), `${d}: the window holds an off-beat`);
        for (const g of halves) assert.ok(inHits.some((h) => Math.abs(h.g - g) <= FRAME), `${d}: the half-beat at ${g.toFixed(3)} s inside the span has no hit (the drum did not double)`);
        // (outside: whole beats only)
        assert.ok(outHits.length >= 2 && outHits.every((h) => off(h.g, B) <= FRAME), `${d}: outside the span a hit off the whole beat`);
      } finally {
        s.drumTick = t0;
        undo();
        setDifficulty('normal');
      }
    });
  }
});
