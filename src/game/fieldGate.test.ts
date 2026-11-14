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
import { GATE, gateShut, type ClusterGate, type VineCluster } from './vineField.ts';
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

type Field = { shutBoughAt: (x: number, y: number) => { top: number; under: number } | null; capY: (x: number, y: number) => number; lid: (p: unknown, dt: number) => boolean };
const fieldOf = (r: RealPlay) => (r.e as unknown as { field: Field }).field;

/** how far his DRAWN head (his feet less GATE.head) rose over a shut bough's DRAWN underside this frame (px; <= 0 is under it) */
function headOver(r: RealPlay): number {
  const s = fieldOf(r).shutBoughAt(r.p.x, r.p.y);
  // (only while his feet are under the bough's drawn top: through it from below; a leap that comes back over it from far above is not
  // through it, and it lands nowhere: `stood`)
  // (and only rising, or on a vine: a fall down through a shut bough from over it is no footing by design, not a way up)
  return s && r.p.y > s.top && (r.p.vy < 0 || r.p.climbing) ? s.under - (r.p.y - GATE.head) : -Infinity;
}

/** over 3 s from just under a field vine's top: the highest his feet go (least y) inside the bough's span, how far his drawn head ever
 *  rose over the shut bough's drawn underside, and whether he ever stood at or over the bough's height (past the gate). A leap out past
 *  the bough's end may rise beside it; it lands nowhere up there. */
function highest(r: RealPlay, v: Vine, plan: (i: number) => Pad, b: { x: number; y: number; width: number }, g?: ClusterGate): { top: number; over: number; stood: boolean } {
  const clusters = (r.e as unknown as { clusters: VineCluster[] }).clusters;
  // (from as high up the vine as a climb can take him: 0.9.8 placed him 40 px under its top, over the drawn sagged bough, where no climb
  // reaches now; such a start is through already)
  r.climb(v, Math.max(v.topY + 40, fieldOf(r).capY(v.x, v.bottomY)));
  let top = Infinity, over = -Infinity, stood = false;
  for (let i = 0; i < 90; i++) {
    r.frame(plan(i));
    if (r.p.x >= b.x - GATE.lidSide && r.p.x <= b.x + b.width + GATE.lidSide) top = Math.min(top, r.p.y);
    over = Math.max(over, headOver(r));
    // (a fig pushed full from his hands' reach tears free and opens the gate: that is the way, not past it)
    if (r.p.grounded && r.p.y <= b.y + 1 && (!g || gateShut(g, clusters))) stood = true;
  }
  return { top, over, stood };
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
        // (the figs held on for the probe: a fig pushed full opens the gate, the way through (Matt's case below); this asks only whether
        // the SHUT gate can be passed, on every vine and every way off it, so every case starts and stays shut)
        (fieldOf(r) as unknown as { topOf: () => number }).topOf = () => -Infinity;
        let cases = 0, met = 0;
        for (const g of gates) {
          const b = r.platforms.find((q) => q.id === g.platform)!;
          for (const v of fieldVinesUnder(r, b))
            for (const [name, plan] of Object.entries(PLANS)) {
              const { over, stood } = highest(r, v, plan, b, g);
              assert.ok(over <= 0.5, `gate ${g.id} vine ${v.id} ${name}: his drawn head rose ${Math.round(over)} px over the shut bough's drawn underside`);
              assert.ok(!stood, `gate ${g.id} vine ${v.id} ${name}: he stood at or over the shut bough's height, past the gate`);
              assert.ok(gateShut(g, (r.e as unknown as { clusters: VineCluster[] }).clusters), `gate ${g.id} stayed shut through the probe`);
              cases++;
              if (over > -40) met++;
            }
        }
        assert.ok(cases >= gates.length * 5, 'every gate is tried');
        // (the probe reaches the wood: on most cases his head comes within 40 px of the underside, or the test is not testing)
        assert.ok(met >= cases / 2, `his head met the shut bough on ${met} of ${cases} cases`);
      } finally {
        setDifficulty('normal');
      }
    });

test('the lid is from below only, and gone the frame the last fig is pushed free', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { field: Field; clusters: { id: number; falling?: boolean }[]; clusterTorn(c: unknown): void };
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
    assert.ok(highest(r, v, PLANS.jump, b).over > 20, 'planted: no lid, his head goes up through (the bug Matt hit)');
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

// Matt's case (11-14 12:06 AM, his clip: "It still goes over the top... it cannot go above the platform above it... on Pokey's head as a
// collision thing with the platform... his shoulders... Just enough to get the fruit up"), and R-165.223's skip probe for this gate: on
// the gate of the most figs, push the first fig full until it tears, hold up on, jump, then climb every other vine under the shut bough
// and jump off its top: his DRAWN head never rises over the bough's DRAWN underside, he never stands up there, and the fig still tears
// free with his head held under the wood. Planted: with the head stop out (the feet rule of 0.9.8), the same case puts his head through.
function mattsCase(r: RealPlay): { over: number; stood: boolean; tore: boolean } {
  const e = r.e as unknown as { clusters: { id: number; vine: number; y: number; falling?: boolean }[]; hands: unknown; field: { pods: unknown[] } };
  e.field.pods = []; // (the pods are another piece's business: one over a fig's column knocks him off mid-push)
  const g = [...r.stage.gates!].sort((a, b) => b.clusters.length - a.clusters.length)[0];
  const b = r.platforms.find((q) => q.id === g.platform)!;
  const c = e.clusters.find((q) => q.id === g.clusters[0])!;
  const fig = r.vines.find((q) => q.id === c.vine)!;
  let over = -Infinity, stood = false;
  const watch = () => {
    over = Math.max(over, headOver(r));
    if (r.p.grounded && r.p.y <= b.y + 1) stood = true;
  };
  e.hands = null;
  r.climb(fig, c.y + 90);
  for (let i = 0; i < 150; i++) (r.frame({ up: true }), watch()); // push full, hold up on
  const tore = !!c.falling;
  for (let i = 0; i < 40; i++) (r.frame({ up: i < 5, press: i === 5, jump: i >= 5 }), watch()); // then jump
  for (const v of fieldVinesUnder(r, b)) {
    e.hands = null;
    r.climb(v, v.topY + 120);
    for (let i = 0; i < 70; i++) (r.frame({ up: i < 45, press: i === 45 || i === 55, jump: i >= 45 }), watch());
  }
  return { over, stood, tore };
}

for (const setting of ['normal', 'easy'] as const)
  for (const [id, seed] of GATED)
    test(`${id} seed ${seed} ${setting}: Matt's case: push full, hold up, jump, climb the rest: his head stays under the shut bough`, () => {
      setDifficulty(setting);
      try {
        const m = mattsCase(new RealPlay(id, seed));
        assert.ok(m.tore, 'the fig still tears free with his head held under the bough ("just enough to get the fruit up")');
        assert.ok(m.over <= 0.5, `his drawn head rose ${Math.round(m.over)} px over the shut bough's drawn underside`);
        assert.ok(!m.stood, 'he stood up on the shut bough');
      } finally {
        setDifficulty('normal');
      }
    });

test('planted: the head stop taken out (the feet rule of 0.9.8), Matt\'s case puts his head through the shut bough', () => {
  const r = new RealPlay('1-4', 1);
  const f = fieldOf(r) as unknown as { capY: (x: number, y: number) => number; shutBoughAt: (x: number, y: number) => { top: number } | null };
  // (the feet rule: his feet stop 4 px under the bough's top, as GATE.lid did)
  f.capY = (x: number, y: number) => {
    const s = f.shutBoughAt(x, y);
    return s ? s.top + 4 : -Infinity;
  };
  assert.ok(mattsCase(r).over > 40, 'red: his head goes over the bough');
});

test('his head stop is his drawn height (heroSprite.ts), not a guess', async () => {
  const { HERO_UNITS, HERO_SPRITE_SCALE } = await import('./heroSprite.ts');
  assert.equal(GATE.head, Math.round(HERO_UNITS * HERO_SPRITE_SCALE));
});
