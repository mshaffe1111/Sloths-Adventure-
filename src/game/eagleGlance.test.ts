/**
 * The watcher is a real red light, green light (ENG-WATCH, R-165.267 / R-165.266; Matt 11-14 9:29-9:32 PM, 1-7: "once it moved its head,
 * you could literally just walk right up to it ... I didn't even really hide in the bushes and it still didn't get me"). The kit's rules,
 * every sweeper, every stage (predators/core.ts):
 *   - a pass starts from the end of its stretch FARTHER from him, so its eye crosses toward him (from the near end, behind a walker, it
 *     never reached him: 0 hearts at 8 of 1-7's 9 eagles, reference/qa-reports/ENG-WATCH/proof/PROOF.md);
 *   - between passes its head glances on an uneven rhythm, seeded by its post (every run of a seed the same): away, a head-cock (its tell,
 *     tellOf, never under TELL_MIN), a look; a share of turns are fake-out half-turns; moving in its view while it looks starts its dive's
 *     tell, a still sloth is not seen; Easy: a longer tell, a slower rhythm, no fake-outs;
 *   - one act, one heart (core.ts landed);
 * and on the real engine: walking forward through 1-7 costs hearts; walking out from cover the moment its look ends is caught by a glance;
 * the tier bots freeze on the tell (the toy: the same bot without the freeze loses more to the eagle).
 * Planted: each rule's red run on the base (origin/t-build-16 9de5e4aa) is in reference/qa-reports/ENG-WATCH/REPORT.md.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { TELL_MIN, checkGlance, checkPredator, glanceRoll, landed, newPredator, stepPredator, tellOf } from './predators/core.ts';
import { EAGLE } from './predators/world1.ts';
import type { Glance, PredatorEvents, PredatorState, Prey, Scene } from './predators/types.ts';
import { probe } from '../../tools/inspect/eagleProbe.ts';
import { firstTimer, FT_MIDDLE } from '../../tools/inspect/firsttimer.ts';

const DT = 1 / 30;
const G: Glance = EAGLE.glance!;

function rig(o: { heroX: number; perched?: boolean; glance?: Glance | false; easy?: boolean; cool?: number }) {
  const s = newPredator(EAGLE, { x: o.perched ? 500 : 0, y: 800, minX: 0, maxX: 1000, cool: o.cool ?? 6, perched: o.perched, glance: o.glance });
  const hero: Prey = { x: o.heroX, y: 800, facing: 1, still: false, covered: false, moving: false };
  const sc: Scene = { t: 0, dt: DT, hero, easy: !!o.easy };
  return { s, hero, sc };
}

/** step until `until` says stop (or `max` frames): the events of the frame it stopped on */
function run(s: PredatorState, sc: Scene, max: number, until: (ev: PredatorEvents, s: PredatorState) => boolean): { ev: PredatorEvents; f: number } {
  for (let f = 0; f < max; f++) {
    sc.t += DT;
    const ev = stepPredator(EAGLE, s, sc);
    if (until(ev, s)) return { ev, f };
  }
  return { ev: {}, f: -1 };
}

test('its pass starts from the end of its stretch farther from him: its eye crosses toward him, from either side', () => {
  for (const [heroX, end, facing] of [[-60, 1000, -1], [200, 1000, -1], [1060, 0, 1], [800, 0, 1]] as const) {
    const { s, sc } = rig({ heroX, glance: false, cool: 0 });
    s.cool = 0;
    // (out of its stretch it only waits; he steps in where he stands, or just inside its near end)
    sc.hero.x = Math.min(1000, Math.max(0, heroX));
    const { f } = run(s, sc, 30 * 6, (ev) => !!ev.notice);
    assert.ok(f >= 0, `hero ${heroX}: its pass was called`);
    assert.equal(s.eyeX, end, `hero ${heroX}: its eye starts at ${end}, the end farther from him`);
    assert.equal(s.facing, facing, `hero ${heroX}: it crosses toward him`);
  }
});

test('the glance: seeded (every run of a post the same), uneven, every turn told for its whole tell, a share of fake-outs', () => {
  const trace = () => {
    const { s, sc } = rig({ heroX: 400, cool: 1e9 });
    const turns: Array<{ kind: string; at: number; tell: number; away: number }> = [];
    let lastAway = 0, startAt = 0, kind = '';
    for (let f = 0; f < 30 * 400; f++) {
      sc.t += DT;
      const was = s.gl!.phase;
      stepPredator(EAGLE, s, sc);
      const now = s.gl!.phase;
      if (was === 'away' && now !== 'away') {
        startAt = sc.t;
        kind = now;
        turns.push({ kind, at: sc.t, tell: 0, away: sc.t - lastAway });
      }
      if ((was === 'cock' && now === 'look') || (was === 'fake' && now === 'away')) turns[turns.length - 1].tell = sc.t - startAt;
      if (now === 'away' && was !== 'away') lastAway = sc.t;
    }
    return turns;
  };
  const a = trace(), b = trace();
  assert.deepEqual(a, b, 'the same post glances the same every run');
  assert.ok(a.length >= 60, `${a.length} turns in 400 s`);
  const real = a.filter((t) => t.kind === 'cock'), fakes = a.filter((t) => t.kind === 'fake');
  for (const t of real) assert.ok(t.tell >= Math.max(TELL_MIN, tellOf(EAGLE, false)) - DT - 1e-9, `a turn told ${t.tell.toFixed(2)} s before its look`);
  const share = fakes.length / a.length;
  assert.ok(Math.abs(share - G.fake) < 0.1, `fake-outs ${fakes.length}/${a.length} (dial ${G.fake})`);
  for (const t of fakes) assert.ok(t.tell < tellOf(EAGLE, false), 'a fake-out stops short of the look');
  const waits = a.slice(1).map((t) => t.away);
  assert.ok(Math.min(...waits) < G.away[0] + 1.5 && Math.max(...waits) > G.away[1] - 0.6, `uneven: away ${Math.min(...waits).toFixed(2)}-${Math.max(...waits).toFixed(2)} s`);
});

test('Easy glances slower, tells longer, never fakes (Easy is never harder)', () => {
  const turns = (easy: boolean) => {
    const { s, sc } = rig({ heroX: 400, cool: 1e9, easy });
    const out: Array<{ kind: string; tell: number }> = [];
    let start = 0, n = 0;
    for (let f = 0; f < 30 * 200; f++) {
      sc.t += DT;
      const was = s.gl!.phase;
      stepPredator(EAGLE, s, sc);
      const now = s.gl!.phase;
      if (was === 'away' && now !== 'away') {
        start = sc.t;
        out.push({ kind: now, tell: 0 });
        n++;
      }
      if (was === 'cock' && now === 'look') out[n - 1].tell = sc.t - start;
    }
    return out;
  };
  const e = turns(true), nrm = turns(false);
  assert.ok(e.every((t) => t.kind !== 'fake'), 'no fake-outs on Easy');
  assert.ok(e.length < nrm.length, `Easy turns ${e.length} < Normal ${nrm.length} in 200 s`);
  for (const t of e.filter((q) => q.kind === 'cock')) assert.ok(t.tell >= tellOf(EAGLE, true) - DT - 1e-9 && tellOf(EAGLE, true) > tellOf(EAGLE, false));
});

test('in its look: moving in its view starts its dive\'s tell; still, out of reach, or in its head-cock, nothing', () => {
  const toLook = (heroX: number, perched = true) => {
    const r = rig({ heroX, perched, cool: 1e9 });
    run(r.s, r.sc, 30 * 20, (_e, s) => s.gl!.phase === 'look');
    return r;
  };
  // moving in view while it looks: the tell, told
  let r = toLook(600);
  r.hero.moving = true;
  let { ev } = run(r.s, r.sc, 3, (e) => !!e.tell);
  assert.ok(ev.tell && r.s.phase === 'tell', 'moving in its look: its dive\'s tell');
  // still in the open while it looks: not seen
  r = toLook(600);
  r.hero.moving = false;
  ({ ev } = run(r.s, r.sc, 30 * 3, (e) => !!e.tell));
  assert.ok(!ev.tell, 'frozen in the open: a glance does not see him');
  // moving beyond a perched one's reach: not seen
  r = toLook(500 + G.reach + 40);
  r.hero.moving = true;
  ({ ev } = run(r.s, r.sc, 30 * 3, (e) => !!e.tell));
  assert.ok(!ev.tell, 'out of its reach: not seen');
  // moving through its head-cock (the tell of the glance): not seen yet
  const c = rig({ heroX: 600, perched: true, cool: 1e9 });
  run(c.s, c.sc, 30 * 20, (_e, s) => s.gl!.phase === 'cock');
  c.hero.moving = true;
  for (let f = 0; f < 5; f++) {
    c.sc.t += DT;
    assert.ok(!stepPredator(EAGLE, c.s, c.sc).tell, 'moving in its head-cock is not seen: the cock is the warning');
  }
});

test('the fairness check holds a glance to its dials; one act, one heart', () => {
  assert.deepEqual(checkPredator(EAGLE), []);
  assert.ok(checkGlance({ ...G, away: [0, 2] }).length && checkGlance({ ...G, fake: 1 }).length && checkGlance({ ...G, reach: 0 }).length);
  const { s } = rig({ heroX: 0 });
  s.phase = 'act';
  landed(s);
  assert.equal(s.phase, 'recover', 'its act took a heart: it pulls up');
  assert.ok(glanceRoll(1, 1) !== glanceRoll(1, 2) && glanceRoll(7, 3) === glanceRoll(7, 3));
});

test('1-7 on the real engine: walking forward through every stretch past the lesson costs hearts (Normal)', () => {
  let i = 0, walked = 0;
  for (;;) {
    const r = probe('1-7', 1, 'normal', 'walk', i++);
    if (!r) break;
    if (r.walk < 150) continue; // stuck on a step: standing in the open, not the walk this asks about
    const free = r.events.some((e) => e.what.includes(', free'));
    if (free) continue;
    walked++;
    assert.ok(r.hits >= 1, `eagle #${i - 1} (${r.stretch.join('-')}): a walker went through unhurt: ${JSON.stringify(r.events)}`);
  }
  assert.ok(walked >= 5, `${walked} stretches walked`);
});

test('1-7 on the real engine: out of cover the moment its look ends, he is caught by its glance, told first', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = probe('1-7', 1, setting, 'sneak', 7)!;
    assert.ok(r.perched, 'the perched one');
    const tell = r.events.find((e) => e.what.startsWith('rest->tell'));
    const hit = r.events.find((e) => e.what.startsWith('HEART'));
    assert.ok(tell && hit && hit.f - tell.f >= Math.round(tellOf(EAGLE, setting === 'easy') * 30), `${setting}: ${JSON.stringify(r.events)}`);
  }
});

test('the tier bots freeze on the glance\'s tell: without the freeze the same bot loses more to the eagle (the toy), and a dive is counted as the eagle\'s', () => {
  const hits = (freeze: boolean) => {
    const all: string[] = [];
    for (const seed of [1, 2]) all.push(...firstTimer('1-7', seed, { ...FT_MIDDLE, freeze }, { cap: 1200, dotSetting: true }).harms.filter((h) => h.kind === 'hit').map((h) => h.cause));
    return all;
  };
  const withIt = hits(true), without = hits(false);
  const eagle = (a: string[]) => a.filter((c) => c === 'foe:eagle').length;
  assert.ok(eagle(without) > eagle(withIt) + 4, `eagle hits with the freeze ${eagle(withIt)}, without ${eagle(without)}: ${without.join(' ')}`);
  // (the count's own check: 1-7 has no other animal, so every hit there is the eagle's or a fall's, never 'other')
  assert.ok(without.every((c) => c !== 'other'), `every hit named: ${without.join(' ')}`);
});
