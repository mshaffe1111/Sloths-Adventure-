/**
 * ENG-FORK28 (rule 26: the engine piece 2-8's build found missing): a DESIGNED node string's F nodes ARE its forks. A designed graph
 * (GraphBrief.dealExact, a level's arc) lays exactly the forks its code writes, at the places it writes them, on every roll; the brief's
 * `branching` (none 0, some 1 + a coin for a 2nd, lots 3-4) is the fork count of a ROLLED graph only, and a designed brief that asks
 * one is refused by name. Each way: 2-8's real code (one F[P+|P]) lays one fork at its node on 40 seeds x both settings; 1-1 (rolled,
 * branching 'some') keeps the fork counts it rolled before the piece (pinned below from the pipeline at e878b1f45).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { missionGraph, planBudget } from './pipeline.ts';
import { parseCode, JOB_OF } from './nodeCode.ts';
import { legMarks } from './legs.ts';
import { w1World } from './worlds/w1.ts';
import { ARC_28, BRIEF_28, STAGE_28, kitLib28 } from './worlds/w2Arc28.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Difficulty, WorldManifest } from './types.ts';

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const SETTINGS: Difficulty[] = ['normal', 'easy'];
const cfgOf = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id && !l.secret)!, unlocked: true });

test('a designed code with one F lays exactly one fork, at its node, on 40 seeds x both settings (2-8)', () => {
  const M = kitLib28().manifest;
  const code = Object.values(ARC_28)[0];
  const written = parseCode(legMarks(code).code).map((t) => JOB_OF[t.job]);
  assert.equal(written.filter((j) => j === 'fork').length, 1, "2-8's code writes one F");
  // (its node: the F stands between the same written neighbours on every roll)
  const at = written.indexOf('fork');
  const before = written.slice(0, at).filter((j) => j !== 'rest').length;
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const jobs = missionGraph(planBudget(cfgOf(STAGE_28), M, d), M, seed).nodes.map((n) => n.job);
    assert.equal(jobs.filter((j) => j === 'fork').length, 1, `${d} seed ${seed}: one fork (${jobs.join(' ')})`);
    const f = jobs.indexOf('fork');
    assert.equal(jobs.slice(0, f).filter((j) => j !== 'rest').length, before, `${d} seed ${seed}: the fork at its written node (${jobs.join(' ')})`);
    assert.equal(jobs[f - 1], written[at - 1], `${d} seed ${seed}: the node before the fork as written`);
    assert.equal(jobs[f + 1], written[at + 1], `${d} seed ${seed}: the node after the fork as written`);
  }
});

test('a designed brief that asks a branching is refused by name (the count is its code\'s F nodes)', () => {
  const k = kitLib28();
  const M: WorldManifest = { ...k.manifest, graphs: { ...k.manifest.graphs!, briefs: { ...k.manifest.graphs!.briefs, [STAGE_28]: { ...BRIEF_28, branching: 'some' } } } };
  assert.throws(() => missionGraph(planBudget(cfgOf(STAGE_28), M, 'normal'), M, 1), /designed graph.*branching 'some'/);
});

test("a rolled code's fork count is unchanged (1-1, branching 'some': the counts it rolled at e878b1f45, 40 seeds)", () => {
  const M = w1World().manifest;
  const counts = SEEDS.map((seed) => missionGraph(planBudget(cfgOf('1-1'), M, 'normal'), M, seed).nodes.filter((n) => n.job === 'fork').length);
  assert.deepEqual(counts, PINNED_11);
  const easy = SEEDS.map((seed) => missionGraph(planBudget(cfgOf('1-1'), M, 'easy'), M, seed).nodes.filter((n) => n.job === 'fork').length);
  assert.deepEqual(easy, PINNED_11, 'Easy keeps Normal\'s graph');
});

/** 1-1's fork count on seeds 1-40, read from the pipeline before the piece (e878b1f45) */
const PINNED_11: number[] = [2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 2, 2, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1, 1, 2, 1];
