// The thorn bed is a SET-BACK hurt floor, not a dip and not a landing (the lead's ruling 11-12, D12). Every hurt floor a stage lays:
//   - is taught first: the stage's own teach line about it is laid 800 px or more before the first one (level.md rule 6);
//   - can really be fallen into: dropped into its middle he reaches the thorns, never caught on a lip (a danger that cannot hurt is
//     decoration, Matt's purpose rule: 49-66 px hollows caught him on the lip, P12S 11-12);
//   - sets him back safely: on the real engine the fall costs a heart on Normal (none on Easy) and puts him back standing on ground
//     that is not a hurt floor, the ledge he left (engine.ts heartFall, softAt).
// And stageMetrics' jumpEdges never counts a hurt floor as a landing, while a real narrow landing is still counted.
// Planted faults prove each check binds both ways.
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty, type Difficulty } from './difficulty.ts';
import { jumpEdges } from './stageMetrics.ts';
import type { Platform } from './types.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Zone = { x0: number; x1: number; y?: number };
const STAGES = ['1-1', '1-2', '1-3'];
const SEEDS = [1, 2];

function sim(id: string, seed: number, d: Difficulty): RealPlay {
  setDifficulty(d);
  try { return new RealPlay(id, seed); } finally { setDifficulty('normal'); }
}
const hurtZones = (s: RealPlay): Zone[] => (s.stage.heartFalls ?? []).filter((z: Zone) => z.y !== undefined).sort((a: Zone, b: Zone) => a.x0 - b.x0);

/** how far (px) before the first hurt floor the stage's first teach line lies, or null when none lies before it */
function taughtBy(s: RealPlay): number | null {
  const z = hurtZones(s)[0];
  const teach = (((s.e as Any).proto as Any)?.hints ?? []).filter((h: Any) => h.teach && h.x < z.x0);
  return teach.length ? z.x0 - Math.min(...teach.map((h: Any) => h.x)) : null;
}

/**
 * Stand him on the last safe ground before the zone (so the engine records the ledge he left), then drop him into the zone's middle,
 * between its walls, still: what happens. `noLedge` forgets the ledge first (a planted fault: nowhere to put him back). The player's
 * x is his centre and y his feet (engine.ts: the hurt floor is met when his centre is inside the zone and his feet reach its line).
 */
function dropInto(s: RealPlay, z: Zone, noLedge = false): { fell: boolean; heart: boolean; backOn: Platform | null } {
  const e = s.e as Any, p = s.p;
  const safe = s.platforms.filter((q) => q.type === 'solid' && !q.broken && q.pit !== 'hurt' && q.width >= 200 && q.x + q.width <= z.x0 + 2 && q.x + q.width > z.x0 - 1600)
    .sort((a, b) => b.x + b.width - (a.x + a.width))[0];
  assert.ok(safe, `no ground before the hurt floor at ${Math.round(z.x0)}`);
  p.x = safe.x + 60; p.y = safe.y; p.vx = 0; p.vy = 0;
  for (let i = 0; i < 10; i++) s.frame();
  if (noLedge) e.softAt = null;
  // (a heart is counted where the engine counts it, heartFall's statHeartsLost: a heart picked up on the ledge he is put back on would
  // hide it from his hp, as her island's heart did on INT-2's head)
  const hp = p.hp, lost = e.statHeartsLost ?? 0;
  p.x = (z.x0 + z.x1) / 2; p.y = z.y! - 140; p.vx = 0; p.vy = 0; p.grounded = false;
  const inside = () => p.x > z.x0 && p.x < z.x1;
  let fell = false;
  for (let i = 0; i < 75 && !fell; i++) {
    s.frame();
    // (the fall: his feet at the hurt line inside the zone, a heart gone, or put back out of it)
    if (p.hp < hp || (e.statHeartsLost ?? 0) > lost || !inside() || p.y >= z.y! - 1) fell = true;
    if (p.grounded && inside() && p.y < z.y! - 20) break; // caught on a lip or a cap, above the thorns
  }
  for (let i = 0; i < 45; i++) s.frame();
  const on = p.grounded ? s.platforms.find((q) => q.id === e.standingOnId) ?? null : null;
  return { fell, heart: (e.statHeartsLost ?? 0) > lost, backOn: on && on.pit !== 'hurt' && !inside() ? on : null };
}

test('every hurt floor is taught first: its stage\'s teach line lies 800 px or more before the first one, both settings', () => {
  let n = 0;
  for (const id of STAGES) for (const seed of SEEDS) for (const d of ['normal', 'easy'] as const) {
    const s = sim(id, seed, d);
    if (!hurtZones(s).length) continue;
    n++;
    const by = taughtBy(s);
    assert.ok(by !== null && by >= 800, `${id} seed ${seed} ${d}: ${by === null ? 'no teach line before the first hurt floor' : `taught ${Math.round(by)} px before it`}`);
  }
  assert.ok(n >= 4, `${n} stages with hurt floors checked (1-2 lays them)`);
});

test('every hurt floor can really be fallen into and sets him back safely: a heart on Normal, none on Easy, back on a ledge that is not a hurt floor', () => {
  let n = 0;
  for (const id of STAGES) for (const seed of SEEDS) for (const d of ['normal', 'easy'] as const) {
    const zones = hurtZones(sim(id, seed, d));
    for (const z of zones) {
      const r = dropInto(sim(id, seed, d), z);
      n++;
      assert.ok(r.fell, `${id} seed ${seed} ${d}: dropped into the hurt floor at ${Math.round(z.x0)}..${Math.round(z.x1)} he never reached it (caught on a lip)`);
      assert.equal(r.heart, d === 'normal', `${id} seed ${seed} ${d}: the fall at ${Math.round(z.x0)} ${r.heart ? 'cost' : 'did not cost'} a heart`);
      assert.ok(r.backOn, `${id} seed ${seed} ${d}: after the fall at ${Math.round(z.x0)} he is not standing on safe ground`);
    }
  }
  assert.ok(n >= 40, `${n} hurt floors dropped into`);
});

test('PLANTED: a hurt floor narrower than Pokey cannot be fallen into, and with no ledge recorded he is never set back: both caught', () => {
  const s0 = sim('1-2', 1, 'normal');
  const z = hurtZones(s0).find((q) => q.x1 - q.x0 >= 90)!;
  assert.ok(z, 'a wide hurt floor to narrow');
  // (narrowed to 36 px: the right lip slid left, the zone and its floor with it)
  const s1 = sim('1-2', 1, 'normal');
  const z1 = hurtZones(s1).find((q) => q.x0 === z.x0)!;
  const lipR = s1.platforms.find((q) => q.type === 'solid' && Math.abs(q.x - z1.x1) < 3 && q.pit !== 'hurt')!;
  const cap = s1.platforms.find((q) => q.type === 'bouncy' && Math.abs(q.x - lipR.x) < 3);
  const dx = z1.x1 - z1.x0 - 36;
  lipR.x -= dx; lipR.width += dx; if (cap) { cap.x -= dx; cap.width += dx; }
  z1.x1 -= dx;
  for (const f of s1.platforms.filter((q) => q.pit === 'hurt' && Math.abs(q.x - z1.x0) < 3)) f.width = 36;
  assert.equal(dropInto(s1, z1).fell, false, 'a 36 px hurt floor was fallen into');
  // (no ledge recorded: the set-back has nowhere to put him)
  const s2 = sim('1-2', 1, 'normal');
  assert.equal(dropInto(s2, hurtZones(s2).find((q) => q.x0 === z.x0)!, true).backOn, null, 'set back with no ledge recorded');
});

test('PLANTED: a teach line moved past the first hurt floor is caught', () => {
  const s = sim('1-2', 1, 'normal');
  assert.ok((taughtBy(s) ?? 0) >= 800);
  const z = hurtZones(s)[0];
  for (const h of (((s.e as Any).proto as Any).hints ?? []).filter((q: Any) => q.teach)) h.x = z.x0 + 50;
  assert.equal(taughtBy(s), null);
});

test('jumpEdges never counts a hurt floor as a landing; a real narrow landing (a 50 px ledge) is still counted (PLANTED both ways)', () => {
  const P = (id: number, x: number, y: number, width: number, o: Partial<Platform> = {}): Platform => ({ id, x, y, width, height: 300, type: 'solid', style: 'moss_stone', ...o });
  const narrow = (ps: Platform[]) => jumpEdges(ps).filter((j) => j.to.width < 64 && j.gap >= 24).length;
  // (a chain's pits as 1-2 lays them: a bank, a 56 px hurt floor 160 px down, a 160 px stump, another 56 px hurt floor, a bank. Read as
  // footing, the second floor is a "landing" from the first, 160 px across the stump: the nine 1-2 counted; as hurt floors, none)
  const pits = [P(1, 0, 600, 400), P(2, 400, 760, 56, { pit: 'hurt' }), P(3, 456, 600, 160), P(4, 616, 760, 56, { pit: 'hurt' }), P(5, 672, 600, 400)];
  assert.equal(narrow(pits), 0);
  assert.equal(narrow(pits.map((q) => (q.pit ? { ...q, pit: undefined } : q))), 1, 'the same floors, not hurt floors, are a narrow landing');
  // (a real narrow ledge reached by a hop)
  assert.equal(narrow([P(1, 0, 600, 400), P(2, 470, 600, 50), P(3, 600, 600, 400)]), 1);
});
