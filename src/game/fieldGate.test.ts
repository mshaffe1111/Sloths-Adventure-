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
import { GATE, gateSag, gateShut, type ClusterGate, type VineCluster } from './vineField.ts';
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

test('a fig locks in on the frame it tears free: its own sound, its tie strains then SNAPS, the thatch shudders; the last throws the thatch and springs the gate (Matt: "something that is tying down the thatch, and it shows that it\'s breaking")', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as {
    field: { lockOf: (g: unknown, t: number) => { strain: number; settle: number; pull: number }; ties: { x: number; strain: number; age: number }[] };
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
  const tieOf = (x: number) => (e.field.lockOf(g, e.gameTime), e.field.ties.find((q) => q.x === x)!);
  for (const [n, id] of g.clusters.entries()) {
    const c = e.clusters.find((q) => q.id === id)!;
    const v = r.vines.find((q) => q.id === c.vine)!;
    (e as unknown as { hands: unknown }).hands = null; // (placed on the next fig's vine: his hands are taken afresh there)
    r.climb(v, c.y + 90);
    assert.equal(tieOf(v.x).age, -1, `fig ${id}: its tie is whole before he pushes`);
    assert.ok(tieOf(v.x).strain < 0.1, `fig ${id}: its tie is taut, not straining, before he pushes`);
    let strained = 0, tore = -1;
    for (f = 0; f < 150 && tore < 0; f++) {
      r.frame({ up: true });
      strained = Math.max(strained, e.field.lockOf(g, e.gameTime).strain);
      if (c.falling) tore = f;
    }
    assert.ok(tieOf(v.x).age >= 0 && tieOf(v.x).age < 0.1, `fig ${id}: its tie snapped on the frame it tore free`);
    assert.ok(tore >= 0, `fig ${id} pushed up its vine tears free`);
    assert.ok(strained > 0.9, `fig ${id}: its tie strained to breaking as he pushed (${strained.toFixed(2)})`);
    const last = n === g.clusters.length - 1;
    assert.ok(heard.some((h) => h.f === tore && h.k === (last ? 'open' : 'lift')), `fig ${id}: its sound on the very frame it locked (${JSON.stringify(heard.slice(-3))})`);
    if (!last) {
      r.wait(0.1);
      assert.ok(e.field.lockOf(g, e.gameTime).settle > 0, `fig ${id}: the thatch shudders as it locks in`);
      assert.equal(e.field.lockOf(g, e.gameTime).pull, 0, `fig ${id}: the thatch stays tied by the rest`);
    } else {
      r.wait(1);
      assert.equal(e.field.lockOf(g, e.gameTime).pull, 1, 'the last: the thatch is thrown off the bough');
    }
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

// ───────────── FIX-15 (R-165.212; INT-8's TRY lines, 11-14 11:39 AM ET): a shut bough is wood from EVERY approach ─────────────
// INT-8, real touch presses on 1-4 (layout 0 Normal sideways, gate 6): from a ledge beside the sagged far end, a straight-up flick with
// the gate's way held put his feet over the shut bough; a second flick carried him over the thatch and he dropped THROUGH it; on that
// ledge under the end his head was drawn in the thatch. Today's lid stopped only a rise that STARTED under the drawn top. Each case below
// is laid against each gate's own drawn wood (its two ends, both settings, three rolls; no x of any roll): planted, today's lid (from
// below only, no footing) goes red on each; the fix (fieldPlay.ts lid + footings) is green.

/** the stages that lay a field gate today, by layout (layout 0 is the clip's build, INT-8's) */
const ROLLS = [['1-4', 0], ['1-4', 1], ['1-4', 2]] as const;

type Shut = { lid: (p: unknown, dt: number, x0?: number) => boolean; footings: (x: number) => readonly unknown[]; shutBoughAt: (x: number, y: number) => { top: number; under: number } | null };

/** today's lid as it shipped (from below only: a rise that starts under the drawn top; no wall, no footing): the planted fault */
function todaysLid(f: Shut): void {
  f.lid = (p0: unknown, dt: number) => {
    const p = p0 as { climbing: boolean; vy: number; y: number; x: number };
    if (p.climbing || p.vy >= 0) return false;
    const was = p.y - p.vy * dt;
    const s = f.shutBoughAt(p.x, was);
    if (!s) return false;
    const line = s.under + GATE.head;
    if (was > s.top && p.y < line) {
      p.y = line;
      p.vy = 0;
      return true;
    }
    return false;
  };
  f.footings = () => [];
}

/** a shut gate's DRAWN wood, read as the screen draws it (vineFieldArt.ts drawGateLock topAt: the near end put, the far end sagged) */
function woodOf(r: RealPlay, g: ClusterGate) {
  const b = r.platforms.find((q) => q.id === g.platform)!;
  const cl = (r.e as unknown as { clusters: VineCluster[] }).clusters;
  const top = (x: number) => b.y + gateSag(g, cl) * Math.max(0, Math.min(1, g.far > 0 ? (x - b.x) / b.width : (b.x + b.width - x) / b.width));
  return { b, top, under: (x: number) => top(x) + GATE.depth * b.width, x0: b.x, x1: b.x + b.width };
}

/**
 * Plays `plan` for `frames` and reads, each frame his middle is over the drawn bough, which side of its wood his body is on: over (feet at
 * or over the drawn top), under (drawn head at or under the drawn underside), or IN it. Bad: in it, or over and under on two frames in a
 * row (through it). Going round an end is not through it: off the span the side is forgotten.
 */
function through(r: RealPlay, w: ReturnType<typeof woodOf>, plan: (i: number) => Pad, frames: number): string | null {
  let prev: string | null = null;
  for (let i = 0; i < frames; i++) {
    r.frame(plan(i));
    const p = r.p;
    let st: string | null = null;
    if (p.x >= w.x0 && p.x <= w.x1) {
      st = p.y <= w.top(p.x) + 1 ? 'over' : p.y - GATE.head >= w.under(p.x) - 1 ? 'under' : 'in';
      if (st === 'in') return `frame ${i}: his body is IN the shut bough's drawn wood (feet ${Math.round(p.y - w.top(p.x))} px under its top, head ${Math.round(w.under(p.x) - (p.y - GATE.head))} px over its underside)`;
      if (prev && prev !== st) return `frame ${i}: ${prev} it, then ${st} it: through the shut bough`;
    }
    prev = st;
  }
  return null;
}

/** INT-8's TRY lines, laid at one end of one gate: `end` +1 its right end, -1 its left. Each case: [name, set up, plan, frames] */
function cases(r: RealPlay, g: ClusterGate, end: 1 | -1) {
  const w = woodOf(r, g);
  const ex = end > 0 ? w.x1 : w.x0;
  const top = w.top(ex), under = w.under(ex);
  const toward: Pad = end > 0 ? { left: true } : { right: true };
  const away: Pad = end > 0 ? { right: true } : { left: true };
  const ledge = (y: number, from: number) => {
    const a = ex + end * from, z = ex + end * 220;
    return { id: 99999, x: Math.min(a, z), y, width: Math.abs(z - a), height: 24, type: 'solid', style: 'branch' } as never;
  };
  const out: Array<[string, () => void, (i: number) => Pad, number]> = [];
  // (the far-end ledge flick: a ledge beside the end whose top is 45 px under the drawn end (INT-8's), clear of the wood; straight up
  // with the gate's way held, a flick and a held jump, from near and further along (INT-8: x 986 and 1030, 52 and 96 px out))
  for (const out0 of [52, 96, 140])
    for (const [kind, held] of [['flick', 2], ['held jump', 14]] as const) {
      out.push([`ledge ${out0} px out, ${kind} up, the gate's way held`, () => { r.platforms.push(ledge(top + 45, GATE.lidSide + 2)); r.stand(ex + end * out0, top + 45); }, (i) => ({ ...toward, press: i === 0, jump: i < held }), 75]);
      out.push([`ledge ${out0} px out, ${kind} up + a second flick`, () => { r.platforms.push(ledge(top + 45, GATE.lidSide + 2)); r.stand(ex + end * out0, top + 45); }, (i) => ({ ...toward, press: i === 0 || i === 10, jump: i < held || (i >= 10 && i < 12) }), 75]);
    }
  // (the fall onto the bough: dropped from over its middle)
  const mid = (w.x0 + w.x1) / 2;
  out.push(['dropped onto its middle from over it', () => r.fly(mid, w.top(mid) - 120, 0, 0, 0), () => ({}), 45]);
  // (the vine-top leap: from the field vine nearest this end, as high as the climb goes, out past the end with a second flick, then back)
  const v = fieldVinesUnder(r, w.b).sort((a, c) => Math.abs(a.x - ex) - Math.abs(c.x - ex))[0];
  if (v)
    for (const second of [9, 14, 18])
      out.push([`the end vine's top: leap out past the end, a second flick at frame ${second}, steer back over it`, () => r.climb(v, Math.max(v.topY + 40, fieldOf(r).capY(v.x, v.bottomY))), (i) => ({ ...(i < second + 4 ? away : toward), press: i === 0 || i === second, jump: i < 6 || (i >= second && i < second + 8) }), 75]);
  // (walked in under the sagged end: a ledge whose top is 40 px under the drawn underside there, running in under the bough; his body
  // stands level with the wood, as INT-8's ledge put his head in the thatch)
  out.push(['walked in level with the wood from a ledge beside the end', () => { r.platforms.push(ledge(under + 40, -80)); r.stand(ex + end * 100, under + 40); }, () => ({ ...toward }), 60]);
  return { w, out };
}

for (const setting of ['normal', 'easy'] as const)
  for (const [id, layout] of ROLLS)
    test(`${id} layout ${layout} ${setting}: a shut fig gate is wood from every approach: never through it, never into it (INT-8's TRY lines, both ends of every gate; planted: today's lid goes red on each)`, () => {
      setDifficulty(setting);
      try {
        const runAll = (planted: boolean) => {
          const r = new RealPlay(id, layout);
          (fieldOf(r) as unknown as { topOf: () => number }).topOf = () => -Infinity;
          if (planted) todaysLid(fieldOf(r) as unknown as Shut);
          const res: Array<{ name: string; bad: string | null; landed?: boolean }> = [];
          const cl = (r.e as unknown as { clusters: VineCluster[] }).clusters;
          for (const g of r.stage.gates ?? [])
            for (const end of [1, -1] as const) {
              const { w, out } = cases(r, g, end);
              for (const [name, setUp, plan, frames] of out) {
                const n = r.platforms.length;
                setUp();
                const bad = through(r, w, plan, frames);
                const landed = r.p.grounded && Math.abs(r.p.y - w.top(r.p.x)) < 1.5 && r.p.x >= w.x0 - 12 && r.p.x <= w.x1 + 12;
                r.platforms.length = n;
                assert.ok(gateShut(g, cl), `gate ${g.id} stayed shut`);
                res.push({ name: `gate ${g.id} ${end > 0 ? 'right' : 'left'} end: ${name}`, bad, landed });
              }
            }
          return res;
        };
        const fixed = runAll(false);
        assert.ok(fixed.length >= 6 * 2 * 15, `every gate, both ends, every case (${fixed.length})`);
        for (const c of fixed) assert.equal(c.bad, null, `${c.name}: ${c.bad}`);
        // (dropped onto it: he LANDS on the drawn wood, never through it)
        for (const c of fixed.filter((q) => q.name.includes('dropped onto'))) assert.ok(c.landed, `${c.name}: he did not land on its drawn top`);
        // planted: today's lid, the same cases: every KIND of case goes red on some gate (each kind is a way through it today). The end
        // vine's leap is not one: today's lid already held it (INT-8's TRY lines: head -1 and -4, never over; and here at three second-flick
        // frames), so it stays as a case that must stay green now that the shut bough is footing from above, not as a planted red
        const old = runAll(true);
        const kinds = ['flick up, the gate', 'flick up + a second', 'held jump up, the gate', 'held jump up + a second', 'dropped onto', 'walked in level'];
        for (const k of kinds) {
          const red = old.filter((c) => c.name.includes(k) && c.bad);
          assert.ok(red.length > 0, `planted: today's lid lets no "${k}" case through: the case is not testing the fault`);
        }
      } finally {
        setDifficulty('normal');
      }
    });
