/**
 * Matt's fig gate (R-165.212, his 1-4 test link, 11-13 5:43 PM ET: "it let me go above the platform. Needs a collision that doesn't open
 * up the platform"): a shut gate is a lid from below (fieldPlay.ts lid, called by the engine each frame after it moves him) until its last
 * fig is pushed free. On the real engine, every gate the stage lays, every field vine under it, every way off its top (up, a jump, a
 * leap either way, a climb then a leap), Normal and Easy. Planted: with the lid taken out, the same case flies up through (red before).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, type Pad } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { GATE } from './vineField.ts';
import type { Vine } from './types.ts';

/** the stages that lay a field gate today, by their tower data (w1Arc14.ts); a new one joins here */
const GATED = [['1-4', 1], ['1-4', 2]] as const;

const PLANS: Record<string, (i: number) => Pad> = {
  up: () => ({ up: true }),
  jump: (i) => ({ press: i % 10 === 0, jump: true }),
  leapLeft: (i) => ({ press: i % 10 === 0, jump: true, left: true }),
  leapRight: (i) => ({ press: i % 10 === 0, jump: true, right: true }),
  climbThenLeap: (i) => ({ up: i < 30, press: i === 30 || i === 45, jump: i >= 30, right: i >= 30 }),
};

/** over 3 s from just under a field vine's top: the highest his feet go (least y) inside the bough's span, and whether he ever stood
 *  at or over the bough's height (past the gate). A leap out past the bough's end may rise beside it; it lands nowhere up there. */
function highest(r: RealPlay, v: Vine, plan: (i: number) => Pad, b: { x: number; y: number; width: number }): { top: number; stood: boolean } {
  r.climb(v, v.topY + 40);
  let top = Infinity, stood = false;
  for (let i = 0; i < 90; i++) {
    r.frame(plan(i));
    if (r.p.x >= b.x - GATE.lidSide && r.p.x <= b.x + b.width + GATE.lidSide) top = Math.min(top, r.p.y);
    if (r.p.grounded && r.p.y <= b.y + 1) stood = true;
  }
  return { top, stood };
}

function fieldVinesUnder(r: RealPlay, bough: { x: number; y: number; width: number }): Vine[] {
  return r.vines.filter((v) => v.field && v.x >= bough.x - 4 && v.x <= bough.x + bough.width + 4 && Math.abs(v.topY - bough.y) <= GATE.under);
}

for (const setting of ['normal', 'easy'] as const)
  for (const [id, seed] of GATED)
    test(`${id} seed ${seed} ${setting}: no way up through a shut fig gate (Matt's case)`, () => {
      setDifficulty(setting);
      try {
        const r = new RealPlay(id, seed);
        const gates = r.stage.gates ?? [];
        assert.ok(gates.length > 0, `${id} lays its fig gates`);
        let cases = 0;
        for (const g of gates) {
          const b = r.platforms.find((q) => q.id === g.platform)!;
          for (const v of fieldVinesUnder(r, b))
            for (const [name, plan] of Object.entries(PLANS)) {
              const { top, stood } = highest(r, v, plan, b);
              assert.ok(top >= b.y - GATE.lid - 0.5, `gate ${g.id} vine ${v.id} ${name}: his feet rose to ${Math.round(top)}, up through the shut bough's ${Math.round(b.y)}`);
              assert.ok(!stood, `gate ${g.id} vine ${v.id} ${name}: he stood at or over the shut bough's height, past the gate`);
              cases++;
            }
        }
        assert.ok(cases >= gates.length * 5, 'every gate is tried');
      } finally {
        setDifficulty('normal');
      }
    });

test('the lid is from below only, and gone the frame the last fig is pushed free', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { field: { lid: (p: unknown, dt: number) => boolean }; clusters: { id: number; falling?: boolean }[]; clusterTorn(c: unknown): void };
  const g = r.stage.gates![0];
  const b = r.platforms.find((q) => q.id === g.platform)!;
  const mid = b.x + b.width / 2;
  const v = fieldVinesUnder(r, b).sort((a, c) => Math.abs(a.x - mid) - Math.abs(c.x - mid))[0];
  // already over the line (a hop from above, a respawn on it): rising is left alone, never pushed down or up
  r.fly(b.x + b.width / 2, b.y - 60, 0, -300);
  const y0 = r.p.y;
  assert.equal(e.field.lid(r.p, 1 / 30), false, 'feet over the line: not its business');
  assert.equal(r.p.y, y0);
  // planted fault: the lid out (as before the fix), the same jump flies up through the shut bough
  const lid = e.field.lid;
  e.field.lid = () => false;
  try {
    assert.ok(highest(r, v, PLANS.jump, b).top < b.y - 60, 'planted: no lid, he passes up through (the bug Matt hit)');
  } finally {
    e.field.lid = lid;
  }
  // open: every fig of this gate pushed free (the engine's own tear: falling, then torn()), the climb vaults onto the bough
  for (const c of e.clusters)
    if (g.clusters.includes(c.id)) {
      c.falling = true;
      e.clusterTorn(c);
    }
  assert.ok(highest(r, v, PLANS.up, b).stood, 'open: the climb vaults onto the bough');
});

test('a fig locks in on the frame it tears free: its own sound, a gold pop, the thorns settle; the last springs the gate (Matt: "an indicator that shows it was locked in")', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as {
    field: { thornsOf: (g: unknown, t: number) => { hold: number; strain: number; pull: number } };
    clusters: { id: number; vine: number; y: number; falling?: boolean }[];
    fieldSfx: (k: string) => void;
    gameTime: number;
  };
  const heard: Array<{ k: string; f: number }> = [];
  let f = 0;
  e.fieldSfx = (k: string) => heard.push({ k, f });
  // (the pods are another piece's business: one over a fig's column knocks him off mid-push)
  (e.field as unknown as { pods: unknown[] }).pods = [];
  // the gate with the most figs: each but the last locks with 'lift', the last springs it with 'open'
  const g = [...r.stage.gates!].sort((a, b) => b.clusters.length - a.clusters.length)[0];
  assert.ok(g.clusters.length >= 2, 'a gate of two figs or more to watch the notches');
  let hold = e.field.thornsOf(g, e.gameTime).hold;
  assert.equal(hold, 1, 'every fig on: the tangle stands whole');
  for (const [n, id] of g.clusters.entries()) {
    const c = e.clusters.find((q) => q.id === id)!;
    const v = r.vines.find((q) => q.id === c.vine)!;
    (e as unknown as { hands: unknown }).hands = null; // (placed on the next fig's vine: his hands are taken afresh there)
    r.climb(v, c.y + 90);
    let strained = 0, tore = -1;
    for (f = 0; f < 150 && tore < 0; f++) {
      r.frame({ up: true });
      strained = Math.max(strained, e.field.thornsOf(g, e.gameTime).strain);
      if (c.falling) tore = f;
    }
    assert.ok(tore >= 0, `fig ${id} pushed up its vine tears free`);
    assert.ok(strained > 0.5, `fig ${id}: the tangle strained as he pushed (${strained.toFixed(2)})`);
    const last = n === g.clusters.length - 1;
    assert.ok(heard.some((h) => h.f === tore && h.k === (last ? 'open' : 'lift')), `fig ${id}: its sound on the very frame it locked (${JSON.stringify(heard.slice(-3))})`);
    const s = e.field.thornsOf(g, e.gameTime);
    if (!last) assert.ok(s.hold < hold, `fig ${id}: the tangle drops a notch`);
    else {
      r.wait(1);
      assert.equal(e.field.thornsOf(g, e.gameTime).pull, 1, 'the last: the tangle has pulled back off the bough');
    }
    hold = s.hold;
  }
});
