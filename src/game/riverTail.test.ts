// npx tsx --test src/game/riverTail.test.ts
/**
 * A river with a TAIL (ENG-24e, R-165.301: gen2/riverLay.ts RiverRow.tail) is never crossed bank to bank on a log alone. BUILD-24c's probe
 * (reference/qa-reports/BUILD-24c/rideAcross.ts) rode 2-4's beats 4 and 6 across on a log 6 times in 6: riverLay carried every log to the
 * far bank's lip, 28 px under its top, so a rider stepped or hopped off and the liana each beat is built on was never needed. Now the logs
 * go under World 2's painted end `tail` px short of the far bank, wider than the farthest a rider reaches off a log's end (riverLay
 * rideReach), and nothing hands him over there (engine.ts's drift loop).
 *
 * The real engine (RealPlay, the game's own build and update): Pokey steps onto the first log that slides out under him at the near bank's
 * lip, rides it, runs the last of it and jumps for the far bank (a held jump, the second at its best frames, the take-off at the logs' end
 * or in his coyote time past it). Planted both ways:
 *   - a TOY: 2-1's first river laid again by riverLay from a row with a tail (its logs' window two spacings shorter, the far bank where it
 *     was), never crossed; the same river as built, crossed (the probe crosses where the river lets him: 2-1 must not move);
 *   - 2-4's beats 4 (up from the log) and 6 (no land): never crossed on a log alone, both settings.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty, type Difficulty } from './difficulty.ts';
import { onRiver, type RiverZone } from './river.ts';
import { layRiver, rideReach, RIVER_LAY, type RiverRow } from './gen2/riverLay.ts';
import type { Platform } from './types.ts';

/** the take-offs flown: px before the logs' end (negative: past it, in his coyote time) and the frame of the second jump */
const BEFORE = [-25, -10, 0, 20, 45];
const DOUBLE = [14, 17, 19, 22];

/** one ride across river `r`: how it ended ('CROSSED' when he stands on the far bank having touched no vine) */
function ride(rp: RealPlay, r: RiverZone, before: number, dbl: number): string {
  const solid = rp.platforms.filter((q) => q.type === 'solid' && !q.broken);
  const near = solid.find((q) => Math.abs(q.x + q.width - r.x0) <= 2 && q.y < r.surfaceY);
  const far = solid.find((q) => Math.abs(q.x - r.x1) <= 2 && q.y < r.surfaceY);
  assert.ok(near && far, `river ${Math.round(r.x0)}-${Math.round(r.x1)} has a bank at each end`);
  const logs = rp.platforms.filter((q) => q.type === 'drift' && q.drift && onRiver(q.drift, r));
  rp.stand(near.x + near.width - 26, near.y);
  let boarded = false, hopped = -1, vine = false;
  for (let f = 0; f < 30 * 40; f++) {
    const p = rp.p;
    if (p.isVineSwinging || p.climbing || p.hanging) vine = true;
    const on = rp.platforms.find((q) => q.id === rp.standingOn);
    // (on ground past the water: the far bank, or a bank beyond it a long jump reached)
    if (on && on.type === 'solid' && on.x >= far.x - 2) return vine ? 'far bank, a vine held' : 'CROSSED';
    if (rp.died || p.y > r.surfaceY + 8) return 'water';
    // (a safe river set him back on the near bank)
    if (boarded && on && on.type === 'solid') return 'back on a bank';
    let pad: { right?: boolean; press?: boolean; jump?: boolean } = {};
    if (!boarded) {
      if (on?.type === 'drift') boarded = true;
      else if (logs.some((q) => q.x < r.x0 + 10 && q.x + q.width > r.x0 + 60)) pad = { right: true };
    } else if (hopped < 0) {
      const end = on?.drift ? on.drift.x1 : logs[0].drift!.x1;
      // (once his log reaches the logs' end, so the run cannot take him off its front into the water between logs, he runs the last 90 px
      //  of the ride, then jumps; past the end he is in the air, in his coyote time)
      const there = !on?.drift || on.x + on.width >= end - 2;
      if (there && p.x > end - before - 90) pad = { right: true };
      if (there && p.x > end - before) { pad = { right: true, press: true }; hopped = 0; }
    } else {
      hopped++;
      pad = hopped === dbl ? { right: true, press: true } : { right: true, jump: true };
    }
    rp.frame(pad);
  }
  return boarded ? 'timeout riding' : 'timeout (never boarded)';
}

/** every take-off over river `r`: the first that crosses, else every ending */
function rideAll(rp: RealPlay, r: RiverZone): { crossed: boolean; ends: string[] } {
  const ends: string[] = [];
  for (const b of BEFORE) for (const k of DOUBLE) {
    const end = ride(rp, r, b, k);
    if (end === 'CROSSED') return { crossed: true, ends: [`${b}/${k}`] };
    ends.push(end);
  }
  return { crossed: false, ends };
}

/** 2-1's first river running with him, as built, and the same water laid again from a row with a tail (the far bank where it was) */
function toyRiver(rp: RealPlay): { plain: RiverZone; tailed: () => RiverZone } {
  const plain = (rp.stage.rivers ?? []).find((q) => q.dir === 1 && q.speed > 0 && !q.open && !q.raft);
  assert.ok(plain, '2-1 lays a river running with him');
  return {
    plain,
    tailed: () => {
      const old = rp.platforms.filter((q) => q.type === 'drift' && q.drift && onRiver(q.drift, plain));
      const d = old[0].drift!;
      const spacing = (d.x1 - d.x0 + d.width) / old.length;
      const near = rp.platforms.find((q) => q.type === 'solid' && Math.abs(q.x + q.width - plain.x0) <= 2)!;
      // (two spacings of its water become the tail: the logs' window two spacings shorter, the far bank where it was. A window of `logs`
      //  spacings carries logs + 1 logs, riverLay's logLayout)
      const row: RiverRow = { dir: 1, speed: d.speed, logW: d.width, logs: old.length - 3, gap: Math.round(spacing - d.width), tail: Math.round(2 * spacing), ...(plain.safe ? { safe: true } : {}) };
      let id = Math.max(...rp.platforms.map((q) => q.id)) + 1;
      const laid = layRiver(row, plain.x0, near.y, () => id++);
      assert.ok(Math.abs(laid.zone.x1 - plain.x1) <= 1, `the toy's far bank is where 2-1's was (${laid.zone.x1} vs ${plain.x1})`);
      const keep = rp.platforms.filter((q) => !old.includes(q));
      rp.platforms.length = 0;
      rp.platforms.push(...keep, ...laid.logs);
      Object.assign(plain, { x1: laid.zone.x1, tail: laid.zone.tail });
      assert.ok(row.tail! >= Math.ceil(rideReach(1, row.speed)) + RIVER_LAY.tailMargin, `the toy's tail ${row.tail} is past a ride's reach`);
      return plain;
    },
  };
}

for (const setting of ['normal', 'easy'] as Difficulty[]) {
  test(`toy (2-1's first river, ${setting}): crossed on a log as built; with a tail of two spacings, never`, () => {
    setDifficulty(setting);
    try {
      const rp = new RealPlay('2-1', 2);
      const { plain, tailed } = toyRiver(rp);
      const before = rideAll(rp, plain);
      assert.ok(before.crossed, `2-1's plain river is ridden bank to bank (the probe crosses where the river lets him): ${before.ends.join(', ')}`);
      const t = tailed();
      const after = rideAll(rp, t);
      assert.ok(!after.crossed, `the tailed river is never crossed on a log alone (crossed at take-off ${after.ends[0]})`);
      assert.ok(after.ends.some((e) => e === 'water' || e === 'back on a bank'), `he boarded and rode into the tail: ${after.ends.join(', ')}`);
    } finally {
      setDifficulty('normal');
    }
  });

  test(`toy, ${setting}: a rider carried into the tail goes on into the water, never stepped up onto a bank that is not there`, () => {
    setDifficulty(setting);
    try {
      const rp = new RealPlay('2-1', 2);
      const r = toyRiver(rp).tailed();
      const near = rp.platforms.find((q) => q.type === 'solid' && Math.abs(q.x + q.width - r.x0) <= 2)!;
      const logs = rp.platforms.filter((q) => q.type === 'drift' && q.drift && onRiver(q.drift, r));
      const d = logs[0].drift!;
      rp.stand(near.x + near.width - 26, near.y);
      let boarded = false, past = false, top = Infinity, end = '';
      for (let f = 0; f < 30 * 40 && !end; f++) {
        const on = rp.platforms.find((q) => q.id === rp.standingOn);
        if (on?.type === 'drift') boarded = true;
        if (boarded && rp.p.x > d.x1) { past = true; top = Math.min(top, rp.p.y); }
        if (rp.died || rp.p.y > r.surfaceY + 8) end = 'water';
        else if (boarded && on?.type === 'solid') end = `on the bank at ${Math.round(on.x)}`;
        // (he steps on as a log reaches back under the lip, then stands still and lets it carry him)
        rp.frame(!boarded && logs.some((q) => q.x < r.x0 + 10 && q.x + q.width > r.x0 + 60) ? { right: true } : {});
      }
      assert.ok(past, 'the log carried him to its end');
      // (engine.ts's drift loop stepped a rider at a log's end up onto the bank there, 28 px over the log: here, onto thin air at x1 + 6)
      assert.ok(top >= d.baseY - 1, `past the logs' end he stays at the log's top or under it (highest ${Math.round(top)}, log top ${d.baseY})`);
      assert.ok(end === 'water' || end.startsWith('on the bank at ' + Math.round(near.x)), `he goes on into the water (a safe river sets him back): ${end}`);
    } finally {
      setDifficulty('normal');
    }
  });

  test(`2-4 beats 4 (up from the log) and 6 (no land), ${setting}: never crossed bank to bank on a log alone`, () => {
    setDifficulty(setting);
    try {
      const rp = new RealPlay('2-4', 1);
      const secs = ((rp.stage as { gen2?: { sections?: Array<{ template: string; x0: number; x1: number }> } }).gen2?.sections ?? []);
      for (const beat of ['up-from-log', 'no-land']) {
        const sec = secs.find((s) => s.template.includes(beat));
        assert.ok(sec, `2-4 lays its ${beat} beat`);
        const rivers = (rp.stage.rivers ?? []).filter((q) => q.speed > 0 && q.x0 >= sec.x0 - 5 && q.x1 <= sec.x1 + 5);
        assert.ok(rivers.length, `${beat}: a river`);
        for (const r of rivers) {
          assert.ok(r.tail, `${beat}: its river at ${Math.round(r.x0)} has a tail`);
          const res = rideAll(rp, r);
          assert.ok(!res.crossed, `${beat}: the river at ${Math.round(r.x0)} is crossed on a log alone (take-off ${res.ends[0]})`);
          assert.ok(res.ends.some((e) => e === 'water' || e === 'back on a bank'), `${beat}: he boarded and rode into the tail: ${res.ends.join(', ')}`);
        }
      }
    } finally {
      setDifficulty('normal');
    }
  });
}

test('a tail is judged against the flown reach: riverFaults names a tail inside it, and passes one past it', async () => {
  const { riverFaults } = await import('./gen2/riverLay.ts');
  const reach = Math.ceil(rideReach(1, 80));
  // (Easy's strongest jump, whatever the setting: 387 px at 80 px/s, the flight in rideReach)
  assert.ok(reach > 370 && reach < 420, `a ride's reach at 80 px/s is ${reach} px`);
  for (const [tail, ok] of [[reach + RIVER_LAY.tailMargin - 1, false], [reach + RIVER_LAY.tailMargin, true]] as const) {
    let id = 1;
    const row: RiverRow = { dir: 1, speed: 80, logW: 150, logs: 3, tail };
    const laid = layRiver(row, 1000, 800, () => id++);
    const banks: Platform[] = [
      { id: id++, x: 0, y: 800, width: 1000, height: 300, type: 'solid' } as Platform,
      { id: id++, x: laid.zone.x1, y: 800, width: 600, height: 300, type: 'solid' } as Platform,
    ];
    const faults = riverFaults({ platforms: [...banks, ...laid.logs], rivers: [laid.zone] });
    const named = faults.some((f) => f.includes('tail'));
    assert.equal(named, !ok, `a tail of ${tail} px: ${faults.join('; ') || 'no fault'}`);
    assert.equal(laid.zone.x1 - laid.zone.x0, laid.logs[0].drift!.x1 - laid.zone.x0 + tail, 'the tail is the water past the logs\' window');
  }
});
