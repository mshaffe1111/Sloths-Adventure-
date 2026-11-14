/**
 * The two-vine climb's reward (R-165.229, Matt 11-14 12:09 AM: "there's really no benefit of doing two vines at the same time... you can't
 * collect petals doing two arms"; DK Jr.'s rule). On the real engine, every 1-4 roll tried, Normal and Easy: every petal on a vine field's
 * paired stretch hangs between the pair, and a climb that takes the second hand WHILE climbing (a side push with up held, no stop)
 * collects it; two hands climb up 1.6x one hand. Planted: a petal left on a vine's line (as laid before) is missed two-handed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { FIELD_FEEL, type Hands } from './vineField.ts';
import type { Collectible, Vine } from './types.ts';

type E = { hands: Hands | null; field: { pods: unknown[] } | null };
/** how far over the foot a petal is still taken by him standing there (px): his pickup reach 38 from his middle, half his body 24 up */
const STAND = 60;

/** the field petals of a roll: each with the pair of field vines (in reach of each other, both spanning it) it hangs between, the pair
 *  whose middle is nearest it */
function paired(r: RealPlay): Array<{ c: Collectible; a: Vine; b: Vine }> {
  const fv = r.vines.filter((v) => v.field);
  const out: Array<{ c: Collectible; a: Vine; b: Vine }> = [];
  for (const c of r.collectibles) {
    if (c.type !== 'flower') continue;
    // (a petal on a STRETCH: out of reach of him standing on the foot. A ground petal (the trail's, 34 px over the wood) in front of a
    //  field's first vines is taken standing, by design; with the 80 px field margin (R-165.206) one fell inside a pair's span and was
    //  counted as a climb petal, taken by one hand before the push: FIX-14c, seed 1 Easy, 259,8552 by the vine at 237)
    const span = fv.filter((v) => c.y >= v.topY + 10 && c.y <= v.bottomY - STAND && Math.abs(v.x - c.x) <= FIELD_FEEL.reach);
    let best: { a: Vine; b: Vine } | null = null;
    for (const a of span)
      for (const b of span)
        if (a.x < b.x && b.x - a.x <= FIELD_FEEL.reach && c.x >= a.x && c.x <= b.x && (!best || Math.abs((a.x + b.x) / 2 - c.x) < Math.abs((best.a.x + best.b.x) / 2 - c.x))) best = { a, b };
    if (best) out.push({ c, ...best });
  }
  return out;
}

/** from 150 px under the petal on vine a, climb with up held, then a push toward b with up still held: did he take it, with two hands? */
function twoHandClimb(r: RealPlay, c: Collectible, a: Vine, b: Vine): { got: boolean; two: boolean } {
  const e = r.e as unknown as E;
  e.hands = null;
  c.collected = false;
  r.climb(a, Math.min(a.bottomY - 4, c.y + 150));
  let two = false;
  for (let i = 0; i < 40 && !c.collected; i++) {
    // (climbing first: a push held through the grab itself is latched there, engine.ts; then the push, up still held)
    const side = i >= 3;
    r.frame({ up: true, right: side && b.x > a.x, left: side && b.x < a.x });
    if ((e.hands as Hands | null)?.b) two = true;
  }
  return { got: !!c.collected, two };
}

for (const setting of ['normal', 'easy'] as const)
  test(`1-4 ${setting}: every petal on a paired stretch hangs between the pair and a two-hand climb takes it`, () => {
    setDifficulty(setting);
    try {
      let n = 0;
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const r = new RealPlay('1-4', seed);
        (r.e as unknown as E).field!.pods = [];
        for (const { c, a, b } of paired(r)) {
          // (none left on a vine's own line, 40 px off a two-hand hang)
          assert.ok(Math.abs(c.x - a.x) >= 4 && Math.abs(c.x - b.x) >= 4, `seed ${seed}: petal at ${c.x},${c.y} sits on a vine's line (${a.x}/${b.x})`);
          const { got, two } = twoHandClimb(r, c, a, b);
          assert.ok(two, `seed ${seed}: a side push held WHILE climbing took the second hand (${a.x} -> ${b.x})`);
          assert.ok(got, `seed ${seed}: the two-hand climb took the petal at ${c.x},${c.y}`);
          n++;
        }
      }
      assert.ok(n >= 6, `petals on paired stretches tried: ${n}`);
    } finally {
      setDifficulty('normal');
    }
  });

test('planted: a petal left on a vine\'s line (as 0.9.8 laid it) is missed by the two-hand climb', () => {
  const r = new RealPlay('1-4', 1);
  (r.e as unknown as E).field!.pods = [];
  const { c, a, b } = paired(r)[0];
  c.x = b.x; // back on the far vine's line
  assert.equal(twoHandClimb(r, c, a, b).got, false, 'red: 40 px off his middle, out of reach');
});

test('two hands climb up 1.6x one hand, one hand slides down 2x (DK Jr.\'s rule, measured on the engine)', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as E;
  e.field!.pods = [];
  const { a, b } = paired(r)[0];
  const rise = (side: boolean) => {
    e.hands = null;
    r.climb(a, a.bottomY - 4);
    for (let i = 0; i < 3; i++) r.frame({ up: true });
    r.frame({ up: true, right: side });
    const y0 = r.p.y;
    for (let i = 0; i < 15; i++) r.frame({ up: true });
    return y0 - r.p.y;
  };
  const one = rise(false), two = rise(true);
  assert.ok(Math.abs(two / one - FIELD_FEEL.twoUp) < 0.1, `two hands ${two.toFixed(0)} px vs one ${one.toFixed(0)} px in 0.5 s (${(two / one).toFixed(2)}x)`);
});

// The lead 11-14 (vines-normal-up.mp4, seed 1 Normal: 2 of 3): the WHOLE column climbed from the vine's foot, stepping across while
// climbing, takes every petal of it, the top one too (he vaults onto the bough at the top: a petal too near it was passed first).
for (const setting of ['normal', 'easy'] as const)
  test(`1-4 ${setting}: a two-hand climb up the whole paired column takes every petal in it, the top one too`, () => {
    setDifficulty(setting);
    try {
      let cols = 0;
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const r = new RealPlay('1-4', seed);
        const e = r.e as unknown as E;
        e.field!.pods = [];
        const seen = new Set<string>();
        for (const { a, b } of paired(r)) {
          const key = `${a.id}:${b.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const col = paired(r).filter((q) => q.a === a && q.b === b).map((q) => q.c);
          for (const c of col) c.collected = false;
          e.hands = null;
          r.climb(a, a.bottomY - 4);
          for (let i = 0; i < 150 && r.p.climbing; i++) r.frame({ up: true, right: i >= 3 && b.x > a.x, left: i >= 3 && b.x < a.x });
          const missed = col.filter((c) => !c.collected).map((c) => `${c.x},${c.y} (top ${Math.min(a.topY, b.topY)})`);
          assert.equal(missed.length, 0, `seed ${seed} pair ${a.x}/${b.x}: missed ${missed.join(' ')}`);
          cols++;
        }
      }
      assert.ok(cols >= 3, `columns climbed: ${cols}`);
    } finally {
      setDifficulty('normal');
    }
  });
