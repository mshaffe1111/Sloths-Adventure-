/**
 * World 5's jumping spiders, seen through the real camera (QA, 2026-10-26: a blind first-timer on a 320 x 782 phone held upright lost 7
 * hearts to them in 5-1 and 5-2, and every one of their crouches, the warning, had happened off the screen: the spiders roused 430 px
 * away either way, while upright the view shows only about 80 px behind Pokey and under 300 ahead).
 *
 * The real engine with its real camera (realPlay.ts) at each phone size, upright and sideways, playing 5-1, 5-2 and 5-3 the way QA's run did:
 * holding right and hopping every 1.5 s, from the start to the shrine (a fall goes back to the flag, as in the game). Every heart a spider
 * takes must come after a crouch that was fully on the screen for at least 0.6 s.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DT, RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { SPIDER5, type W5Extras } from './w5Kit.ts';
import type { Enemy } from './types.ts';

const VIEWS: Array<[number, number]> = [[320, 782], [390, 844], [844, 390], [640, 320]];
/** the least warning a crouch must give on screen (World 5's rule for every attack) */
const WARN = 0.6;

interface Hit {
  id: number;
  t: number;
  /** how long the crouch before this rush was on screen, unbroken up to the rush (s); -1: there was no crouch */
  warned: number;
  dx: number;
}

/** 5-1 or 5-2 at a view size, held right and hopping every `every` s (first hop at `phase` s): the spider hits, and how far he got */
function playThrough(id: string, w: number, h: number, every = 1.5, phase = 0.5) {
  const r = new RealPlay(id, 1);
  const e = r.e;
  // the camera runs (the gate reads it), and a fall goes back to the flag as in the game; plenty of lives, so the run goes on
  delete e.updateCamera;
  delete e.loseLife;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  r.safe = false;
  const p = r.p;
  p.invincibleTimer = 0;
  e.camera.x = Math.max(0, p.x - e.camera.viewportWidth * 0.45);
  e.camera.y = Math.max(0, p.y - e.camera.viewportHeight * 0.55);
  const w5: W5Extras = (r.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
  const ids = new Set((w5.spiders ?? []).map((s) => s.id));
  assert.ok(ids.size > 0, `${id} has no spiders`);
  const gates = e.w5.gates as Map<number, { phase: string }>;
  const spiders = (): Enemy[] => (e.enemies as Enemy[]).filter((q) => ids.has(q.id));
  /** per spider: the crouch frames on screen, unbroken, so far; and the warning the rush now under way had */
  const shown = new Map<number, number>();
  const warned = new Map<number, number>();
  const prev = new Map<number, string>();
  let rushes = 0;
  const hits: Hit[] = [];
  const hurt = e.damagePlayer.bind(e);
  e.damagePlayer = (amount: number, fromX?: number) => {
    const lost = e.statHeartsLost;
    hurt(amount, fromX);
    if (e.statHeartsLost === lost) return;
    const s = spiders().find((q) => !q.defeated && q.x === fromX);
    if (s) hits.push({ id: s.id, t: r.t, warned: warned.get(s.id) ?? -1, dx: Math.round(p.x - s.x) });
    // (never down to no hearts: the run goes on to the end)
    p.hp = p.maxHp;
  };
  const end = r.stage.exitTotemX;
  const hopEvery = Math.round(every / DT), hopAt = Math.round(phase / DT);
  let best = p.x, bestAt = 0;
  for (let i = 0; i < 9000 && p.x < end - 60; i++) {
    e.lives = 9;
    // (a hop is a full jump: the thumb's flick, held a moment; stuck at a wall or under a ledge a while, a double jump too)
    const stuck = r.t - bestAt > 2;
    const k = (i - hopAt + hopEvery * 1000) % hopEvery;
    const press = k === 0 || (stuck && k === 9);
    r.frame({ right: true, press, jump: k < 16 });
    if (p.x > best + 20) {
      best = p.x;
      bestAt = r.t;
    }
    const cam = e.camera;
    for (const s of spiders()) {
      const g = gates.get(s.id)!;
      const on = !s.defeated && s.x - s.width / 2 >= cam.x && s.x + s.width / 2 <= cam.x + cam.viewportWidth && s.y - s.height / 2 >= cam.y && s.y + s.height / 2 <= cam.y + cam.viewportHeight;
      if (g.phase === 'windup') shown.set(s.id, on ? (shown.get(s.id) ?? 0) + 1 : 0);
      if (g.phase === 'go' && prev.get(s.id) !== 'go') rushes++;
      if (g.phase === 'go' && prev.get(s.id) !== 'go') warned.set(s.id, prev.get(s.id) === 'windup' ? (shown.get(s.id) ?? 0) * DT : -1);
      if (g.phase !== 'windup') shown.set(s.id, 0);
      prev.set(s.id, g.phase);
    }
  }
  return { hits, rushes, reached: p.x >= end - 60, x: Math.round(p.x), end };
}

for (const id of ['5-1', '5-2', '5-3']) {
  test(`${id}: every spider hit, upright and sideways, comes after a crouch on screen for ${WARN} s or more`, () => {
    assert.ok(SPIDER5.tell >= WARN);
    let all = 0;
    const bad: string[] = [];
    for (const [w, h] of VIEWS) {
      // (QA's hop every 1.5 s, and a quicker one, so the spiders meet him at other moments of a hop)
      for (const every of [1.5, 1.1]) {
        const run = playThrough(id, w, h, every, 0.5);
        assert.ok(run.reached, `${id} ${w}x${h}: the run stopped at x ${run.x} of ${Math.round(run.end)}`);
        // (still a threat at every size: they come, and a player who never fights them back is caught)
        // (5-3's spiders are a reminder among the orchids, a few of them: they come, but a quick hop can clear every one)
        if (id === '5-3') assert.ok(run.rushes >= 2, `${id} ${w}x${h}: ${run.rushes} rushes`);
        else assert.ok(run.rushes > 5 && run.hits.length > 0, `${id} ${w}x${h}: ${run.rushes} rushes, ${run.hits.length} hits`);
        all += run.hits.length;
        for (const hit of run.hits) {
          if (hit.warned < WARN) bad.push(`${w}x${h} hop ${every} s: spider ${hit.id} at ${hit.t.toFixed(1)} s (dx ${hit.dx}) warned ${hit.warned.toFixed(2)} s`);
        }
      }
    }
    assert.deepEqual(bad, [], `${bad.length} of ${all} spider hits came without a crouch on screen first`);
  });
}

/**
 * QA: "kicks (flick left) at a spider still cost a heart; taps were more reliable". Running right (the steering thumb holding right), a
 * spider rushing from just behind, and the other thumb flicks left to kick it: the kick used to go the way he was steering, away from
 * the spider (a held steer outranked the flick), so it whiffed and the spider bit. A flicked kick goes the way it was flicked.
 */
test('5-1: holding right, a kick flicked left at a spider rushing from just behind knocks it out', () => {
  for (const gap of [50, 70, 90]) {
    const r = new RealPlay('5-1', 1);
    r.safe = false;
    const w5: W5Extras = (r.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
    const sid = w5.spiders!.find((s) => !s.doze)!.id;
    const sp = (r.e.enemies as Enemy[]).find((q) => q.id === sid)!;
    r.e.enemies = [sp];
    r.stand(sp.x + gap, G);
    r.p.invincibleTimer = 0;
    r.p.facing = 1;
    // (its crouch done: it rushes at him)
    (r.e.w5.gates as Map<number, unknown>).set(sid, { phase: 'go', t: 0.5, dozing: false, called: 0, lost: 0 });
    Object.assign(sp, { state: 'run', stateT: 0, alertT: 4, facing: 1, patrolMinX: sp.x - 2000, patrolMaxX: sp.x + 2000 });
    const hp = r.p.hp;
    for (let i = 0; i < 30 && !sp.defeated && r.p.hp === hp; i++) r.frame({ right: true, kick: i === 0 ? -1 : undefined });
    assert.ok(sp.defeated, `gap ${gap}: the kick went ${r.p.facing > 0 ? 'right, away from it' : 'left'} and ${r.p.hp < hp ? 'it bit him' : 'missed'}`);
    assert.equal(r.p.hp, hp);
  }
});

/** 5-1 sideways (844 x 390), only its `n`th awake spider left, Pokey standing `gap` px to its left facing it */
function faceSpider(n: number, gap: number) {
  const r = new RealPlay('5-1', 1);
  const e = r.e;
  e.viewCssW = 844;
  e.viewCssH = 390;
  e.introT = 99;
  e.applyZoom();
  r.safe = false;
  const w5: W5Extras = (r.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
  const sid = w5.spiders!.filter((s) => !s.doze)[n].id;
  const sp = (e.enemies as Enemy[]).find((q) => q.id === sid)!;
  e.enemies = [sp];
  r.stand(sp.x - gap, G);
  r.p.facing = 1;
  r.p.invincibleTimer = 0;
  return { r, sp, gate: () => (e.w5.gates as Map<number, { phase: string }>).get(sid)!.phase, zoom: e.zoom as number };
}

/**
 * QA v195 (5-1 sideways, Pokey 60 screen px left of each of the first 4 spiders): the first tap during the crouch did nothing; the
 * second killed it as it rushed in. Its body was 34 px wide while its painted legs reach about 30 px out from its middle, so a jab whose
 * fist was on its legs whiffed. A crouching spider can be punched or kicked: reading the tell is rewarded.
 */
test('5-1 sideways: a tap or kick at a crouching spider lands while it crouches, as far off as the fist reaches its legs', () => {
  for (let n = 0; n < 4; n++) {
    for (const gapPx of [60, 66]) {
      for (const kick of [false, true]) {
        const gap = Math.round(gapPx / faceSpider(n, 0).zoom);
        const { r, sp, gate } = faceSpider(n, gap);
        const hp = r.p.hp;
        r.frame();
        assert.equal(gate(), 'windup', `spider ${n}: it crouches`);
        for (let i = 0; i < 5; i++) r.frame(i > 0 ? {} : kick ? { kick: 1 } : { punch: true });
        assert.ok(sp.defeated, `spider ${n}, ${gapPx} screen px (${gap} world): the ${kick ? 'kick' : 'tap'} during its crouch did nothing (now ${gate()})`);
        assert.equal(r.p.hp, hp);
      }
    }
  }
});

/**
 * QA v195: a heart lost on the frame he beat it. A spider rushing in, a tap or kick at every moment of its rush from several distances:
 * one thrown before it bit (his hearts full as he threw it) that beats it never costs a heart as well, and nothing hurts him once it is
 * beaten.
 */
test('5-1: a punch or kick thrown at a rushing spider before it bites wins, never a trade', () => {
  const trades: string[] = [];
  let wins = 0;
  for (const kick of [false, true]) {
    for (const gap of [40, 55, 70, 90]) {
      for (let tapAt = 18; tapAt < 34; tapAt++) {
        const { r, sp } = faceSpider(0, gap);
        const hp = r.p.hp;
        let whole = false, killF = -1, hurtF = -1;
        for (let i = 0; i < 50 && (killF < 0 || i < killF + 6); i++) {
          if (i === tapAt) whole = r.p.hp === hp;
          r.frame(i !== tapAt ? {} : kick ? { kick: 1 } : { punch: true });
          if (sp.defeated && killF < 0) killF = i;
          if (r.p.hp < hp && hurtF < 0) hurtF = i;
        }
        const what = `${kick ? 'kick' : 'tap'} from ${gap} px at frame ${tapAt}`;
        if (killF >= 0 && hurtF >= killF) trades.push(`${what}: hurt on or after the kill`);
        else if (whole && killF >= 0 && hurtF >= tapAt) trades.push(`${what}: bitten at ${hurtF}, beaten at ${killF}`);
        else if (whole && killF >= 0) wins++;
      }
    }
  }
  assert.deepEqual(trades, []);
  assert.ok(wins > 20, `${wins} clean wins`);
});
