/**
 * A BARGE row (RiverRow.look 'barge', ENG-29-e G3, the lead's ruling on 2-9's King's Barge, 2-9.md:25): a carrier he boards from a safe
 * stand, never a log in a hop chain. riverFaults judges its wait by its own bound, a barge every two bars at most at the stage's tempo on
 * that setting, never a blanket exception: the 4 s rule stands for every log chain, and for a barge with no tempo to count it by.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import type { Difficulty } from '../difficulty.ts';
import { BARGE_BARS, layRiver, riverFaults, riverRowOn, type RiverRow } from './riverLay.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow } from './worlds/w2TempoToy.ts';
import { buildGen2Stage } from './pipeline.ts';
import { withTestStage } from './listed.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const ids = () => { let n = 100; return () => n++; };
const bank = (id: number, x: number, w: number, y: number): Platform => ({ id, x, y, width: w, height: 90, type: 'solid', style: 'log' });

/** 2-9's barge row as BUILD-29 drafted it: one barge every two court bars (Normal 80 px/s, 384 px: 5.7 s; Easy its own 70/390) */
const BARGE: RiverRow = { dir: 1, speed: 80, logW: 384, gap: 72, logs: 2, safe: true, look: 'barge', easy: { speed: 70, logW: 390, gap: 72 } };

function crossing(row: RiverRow, d: Difficulty, opts: { near?: boolean; tempo?: boolean; crumbling?: boolean } = {}): { platforms: Platform[]; rivers: RiverZone[]; tempo?: typeof COURT_TEMPO } {
  const r = layRiver(riverRowOn(row, d), 2000, 500, ids());
  const near = { ...bank(1, 1700, 300, 500), ...(opts.crumbling ? { crumbleAfter: 0.6 } : {}) }, far = bank(2, r.zone.x1, 300, 500);
  return { platforms: [...(opts.near === false ? [] : [near]), ...r.logs, far], rivers: [r.zone], ...(opts.tempo === false ? {} : { tempo: COURT_TEMPO }) };
}
const waitFaults = (f: string[]) => f.filter((e) => / every [\d.]+ s, over /.test(e));

test('a barge every two bars, boarded from the bank, passes on both settings (its wait, 5.7 s, is over the log beat of 4 s)', () => {
  for (const d of ['normal', 'easy'] as const) {
    const st = crossing(BARGE, d);
    const lg = st.platforms.filter((p) => p.type === 'drift');
    const wait = (lg[0].drift!.x1 - lg[0].drift!.x0 + lg[0].width) / lg.length / lg[0].drift!.speed;
    const bar = COURT_TEMPO.bar * (d === 'easy' ? COURT_TEMPO.easyStretch : 1);
    assert.ok(wait > 4, `${d}: the barge's wait ${wait.toFixed(2)} s is past the log beat (the rule this row needs its own bound for)`);
    assert.ok(wait <= BARGE_BARS * bar + 1e-6, `${d}: ${wait.toFixed(2)} s within two bars (${(BARGE_BARS * bar).toFixed(2)} s)`);
    assert.deepEqual(riverFaults(st, d), [], d);
  }
});

test('the same barge row is refused with no safe stand (none, or a crumbling one), with no tempo to count it by, or past two bars; a log chain at 5.7 s is refused', () => {
  for (const d of ['normal', 'easy'] as const) {
    const none = riverFaults(crossing(BARGE, d, { near: false }), d);
    assert.ok(none.some((e) => /no bank at one end/.test(e)), `${d}: no stand to board from`);
    assert.match(waitFaults(none).join(' | '), /a log every [\d.]+ s, over 4/, `${d}: no stand: the log's beat`);
    assert.match(waitFaults(riverFaults(crossing(BARGE, d, { crumbling: true }), d)).join(' | '), /a log every [\d.]+ s, over 4/, `${d}: a crumbling stand is no safe stand`);
    assert.match(waitFaults(riverFaults(crossing(BARGE, d, { tempo: false }), d)).join(' | '), /a log every [\d.]+ s, over 4/, `${d}: no tempo: the log's beat`);
    const slow: RiverRow = { ...BARGE, gap: 300, easy: { ...BARGE.easy!, gap: 300 } };
    assert.match(waitFaults(riverFaults(crossing(slow, d), d)).join(' | '), /a barge every [\d.]+ s, over 2 bars/, `${d}: past two bars`);
    const chain: RiverRow = { ...BARGE, look: undefined };
    assert.match(waitFaults(riverFaults(crossing(chain, d), d)).join(' | '), /a log every [\d.]+ s, over 4/, `${d}: the same spacing as a log chain`);
  }
});

/** the tempo toy (2-4's court pieces under the court's tempo, w2TempoToy.ts) with its stones' pond laid as a barge crossing: a 420 px bank,
 *  the barge river (BARGE as the `barge` row), a 300 px far bank, the shape 2-9 lays (w2Arc29 'barge') */
function bargeKit(): WorldKit {
  const k = tempoKit(), M = k.manifest;
  const sections = M.sections.map((s) => (s.id !== 'toy-court-stones' ? s : {
    ...s, pieces: [
      { key: 'in', shape: 'bank', w: [420, 420], place: { kind: 'start' }, style: 'log', main: true },
      { key: 'c', shape: 'bank', w: [360, 360], place: { kind: 'river', after: 'in', row: 'barge' }, style: 'log', main: true, landing: true },
      { key: 'out', shape: 'bank', w: [300, 300], place: { kind: 'walk', after: 'c', dy: [0, 0] }, style: 'log', main: true },
    ], exit: { piece: 'out', kind: 'ground' },
  } as SectionTemplate));
  return { ...k, manifest: { ...M, sections, rivers: { ...M.rivers, barge: BARGE } } } as WorldKit;
}

test('built through the pipeline (the brief\'s tempo only: checkStage judges before st.tempo is set), a barge every two bars is judged by its bound, never the log\'s beat, on both settings (BUILD-29-c\'s find)', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
    const at = `${d} seed ${seed}`;
    const k = bargeKit();
    const st = withTestStage({ [TEMPO_ID]: { ...tempoRow(), kit: () => k } }, () => buildGen2Stage({ config: tempoCfg(), kit: k, seed, difficulty: d }));
    assert.ok(st.platforms.some((p) => p.drift && p.width >= BARGE.logW), `${at}: the toy lays its barge crossing`);
    assert.equal(st.gen2.rerolls, 0, `${at}: no roll refused`);
    const wait = [...st.gen2.errors, ...(st.gen2.repairs ?? []).map(String)].filter((e) => / every [\d.]+ s, over /.test(e));
    assert.deepEqual(wait, [], `${at}: the barge's wait refused`);
  }
});
