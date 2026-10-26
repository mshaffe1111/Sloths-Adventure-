/**
 * Every attack is seen coming (2026-10-26, QA play of 1-10 and 3-10): Venom Fang's lunge has a rear-back of at least 0.6 s with a hiss,
 * and Dot's tip for it comes well before the first one; in 3-10's dark the Shadow Prowler is drawn back over the dark, lit as he winds up.
 * The idle gap and the on-screen wind-ups are checked in the real fights in bossFair.test.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from './bossPlay.ts';
import { venomPose, VF } from './venomFang.ts';
import { darkReveal } from './bossCues.ts';
import { hitLabel, hitsLeft } from './bossHits.ts';
import { bodyHurts } from './bossAI.ts';
import { POUNCE } from './bossDefs.ts';
import type { BossEntity } from './types.ts';

test("1-10: Dot's tip comes before the first lunge, which rears back for at least 0.6 s with a hiss", () => {
  const sim = new BossPlay('1-10');
  sim.skipEntrance();
  for (let i = 0; i < 30 * 30 && sim.tells.filter((t) => t.move === 'sweep').length < 3; i++) sim.frame();
  const tip = sim.guides.find((g) => /rears back/i.test(g.text));
  assert.ok(tip, "Dot's lunge tip was never said");
  const lunges = sim.tells.filter((t) => t.move === 'sweep');
  assert.ok(lunges.length >= 2);
  assert.ok(lunges[0].t0 - tip.t >= 3, `the first lunge came ${(lunges[0].t0 - tip.t).toFixed(1)} s after Dot's tip`);
  for (const l of lunges.slice(0, -1)) assert.ok(l.dur >= 0.6, `a wind-up of ${l.dur.toFixed(2)} s`);
  assert.equal(sim.def.tellCall, 'boa');
  // the head draws up and back over the first 0.6 s of the wind-up, so it reads as a rear-back, not a twitch
  assert.ok(VF.rear >= 0.6);
  const b = sim.boss;
  const at = (t: number) => venomPose({ ...b, ai: { ...b.ai!, state: 'tell', move: 'sweep', t } } as BossEntity, sim.arena.floor, 0);
  const moved = (t: number) => Math.hypot(at(t).jx - at(0).jx, at(t).jy - at(0).jy);
  const rise = moved(VF.rear);
  const half = moved(VF.rear / 2);
  assert.ok(rise > 80 && half < rise * 0.85, `the head moves ${rise.toFixed(0)} px (half way ${half.toFixed(0)})`);
});

test('3-10: in the dark the Prowler is drawn back over it, faintly while he prowls and lit as he winds up and strikes', () => {
  const sim = new BossPlay('3-10');
  sim.skipEntrance();
  const b = sim.boss;
  const as = (state: string, move: string | null) => ({ ...b, ai: { ...b.ai!, state, move, t: 0 } }) as BossEntity;
  assert.equal(darkReveal(as('tell', 'pounce'), sim.def, 0), 0, 'nothing extra while the cave is lit');
  for (const mv of ['pounce', 'clawCombo', 'shadowStep', 'streak']) {
    assert.ok(darkReveal(as('tell', mv), sim.def, 1) >= 0.8, `${mv} wind-up in the dark`);
    assert.ok(darkReveal(as('act', mv), sim.def, 1) >= 0.8, `${mv} in the dark`);
  }
  const idle = darkReveal(as('idle', null), sim.def, 1);
  assert.ok(idle > 0.2 && idle < 0.6, 'a shape at the edge of the moonlight while he prowls');
  assert.ok(sim.def.moves.pounce.tell >= 0.6, 'the pounce crouch lasts long enough to read');
});

test('the hit pop says what came off the bar: half a hit, one, or two', () => {
  // Venom: 12 hit points, 6 segments (2 a segment). A jab (1) from full takes half, the next one a whole segment
  assert.equal(hitsLeft(12, 12, 6), 6);
  assert.equal(hitsLeft(11, 12, 6), 6);
  assert.equal(hitsLeft(10, 12, 6), 5);
  assert.match(hitLabel(6, 6, false, 100), /½ HIT/);
  assert.match(hitLabel(6, 5, false, 100), /BOSS HIT!/);
  // a hook on a stunned boss (3) can take two at once: it says so
  assert.equal(hitsLeft(3, 12, 6) - hitsLeft(0, 12, 6), 2);
  assert.match(hitLabel(2, 0, true, 100), /CRITICAL ×2!/);
});

test('3-10: his body never hurts by touch, before a move or during one: only his strikes do', () => {
  const sim = new BossPlay('3-10');
  sim.skipEntrance();
  const b = sim.boss;
  for (const mv of Object.keys(sim.def.moves)) {
    for (const [state, t] of [['tell', 0.5], ['act', 0.1], ['rec', 0.2], ['idle', 0]] as const) {
      const as = { ...b, ai: { ...b.ai!, state, move: mv, t } } as BossEntity;
      assert.equal(bodyHurts(as, sim.def), false, `${mv} ${state}`);
    }
  }
  for (const [mv, m] of Object.entries(sim.def.moves)) assert.ok(m.tell >= 0.6, `${mv} winds up for only ${m.tell} s`);
});

test('3-10: everything that hurts when the pounce lands is inside the ring, and nothing hurts before he comes down onto it', () => {
  for (const screen of [{ w: 844, h: 390 }, { w: 390, h: 844 }]) {
    const sim = new BossPlay('3-10', false, screen);
    sim.skipEntrance();
    const b = sim.boss;
    const a = sim.arena;
    const br = b.ai!;
    for (let i = 0; i < 20; i++) sim.frame();
    const moves = { ...sim.def.moves };
    for (const k of Object.keys(sim.def.moves)) if (k !== 'pounce') delete (sim.def.moves as Record<string, unknown>)[k];
    try {
      // phase 2: the landing sends ripples too
      b.hp = Math.floor(b.maxHp * 0.6);
      sim.p.x = a.left + 400;
      b.x = a.left + 900;
      br.state = 'idle';
      br.idle = 0.05;
      br.recent = ['streak'];
      const state = (): string => br.state;
      let hurtFrames = 0;
      let peak = 0;
      for (let i = 0; i < 200; i++) {
        sim.frame();
        if (state() === 'act' && br.move === 'pounce') {
          peak = Math.max(peak, br.air);
          for (const h of br.hurt) {
            hurtFrames++;
            assert.ok(br.t >= POUNCE.act * POUNCE.strikeFrom - 0.04, `hurts at ${br.t.toFixed(2)} s, on the way`);
            assert.ok(h.x >= br.d.aim - POUNCE.ring + 30 && h.x + h.w <= br.d.aim + POUNCE.ring - 30, `a box at ${Math.round(h.x - br.d.aim)}..${Math.round(h.x + h.w - br.d.aim)} from the ring's middle`);
          }
        }
        if (state() === 'rec') break;
      }
      assert.ok(hurtFrames > 0, 'the landing hurts');
      // no ripples cross a hero coming back in for the opening, and he turns his back on him to show the glowing spot
      assert.equal((sim.e.hazards as Array<{ kind: string }>).filter((h) => h.kind === 'shock').length, 0);
      for (let i = 0; i < 5; i++) sim.frame();
      assert.equal(state(), 'rec');
      assert.ok(Math.sign(sim.p.x - b.x) !== b.facing, 'he lands facing away from the hero');
      // sideways, the top of the leap stays below the boss bar (the top ~80 world px of the view)
      if (screen.w > screen.h) {
        // (in screen px: the painted cat stands about 180 world px tall in the leap; the bar takes the top 60 px of the screen)
        const vh = sim.e.camera.viewportHeight as number;
        const zoom = screen.h / vh;
        const top = (vh * (sim.def.floorAt ?? 0.7) - peak - 180) * zoom;
        assert.ok(top > 70, `the leap's top is ${Math.round(top)} px from the top of the screen`);
      }
    } finally {
      Object.assign(sim.def.moves, moves);
    }
  }
});

test("3-10 on a fresh phone: Dot's first-time tips are said (the opening, and each move the first time), and the new look keeps them", async () => {
  const { swapLine } = await import('./dotLines.ts');
  const sim = new BossPlay('3-10');
  sim.skipEntrance();
  // every move once
  const seen = new Set<string>();
  for (let i = 0; i < 30 * 120 && seen.size < Object.keys(sim.def.moves).length; i++) {
    sim.frame(i % 40 < 20 ? { left: true } : { right: true });
    if (sim.boss.ai!.state === 'tell' && sim.boss.ai!.move) seen.add(sim.boss.ai!.move);
    if (i === 30 * 20) sim.boss.hp = Math.floor(sim.boss.maxHp * 0.6);
  }
  const said = sim.guides.map((g) => g.text);
  const want = [sim.def.guide!.start!, ...Object.entries(sim.def.moves).filter(([k, m]) => m.guide && seen.has(k)).map(([, m]) => m.guide!)];
  assert.ok(want.length >= 2, `tips to check: ${want.length}`);
  for (const w of want) {
    assert.ok(said.includes(w), `never said: "${w}"`);
    // the new look says Matt's words for a line, or the line itself; it never cuts a boss tip
    const sw = swapLine(w, '3-10');
    assert.ok(!sw || sw.text, `the new look cuts "${w}"`);
  }
});

test('1-10 upright: the tree, the stump and the vine stay in view through every lunge', () => {
  const sim = new BossPlay('1-10', false, { w: 390, h: 844 });
  sim.skipEntrance();
  const a = sim.arena;
  const c = sim.e.camera as { x: number; viewportWidth: number };
  let lunges = 0;
  let quiet = 0;
  // Pokey goes to different spots through the fight (by the tree, the stump, the middle, near the coils)
  const spots = [a.left + 40, a.left + 400, a.left + 800, a.left + 1100];
  for (let i = 0; i < 30 * 40; i++) {
    const x = spots[Math.floor(i / 150) % spots.length];
    sim.frame(Math.abs(sim.p.x - x) > 20 ? (sim.p.x < x ? { right: true } : { left: true }) : {});
    const st = sim.boss.ai!.state;
    // (not just after he is hurt or comes back from a lost life: the view snaps to him then and eases back)
    if ((sim.p as { invincibleTimer: number }).invincibleTimer > 0) quiet = 30;
    if (quiet > 0) quiet--;
    else if ((st === 'tell' || st === 'act') && sim.boss.ai!.move === 'sweep' && sim.boss.ai!.t > 0.4) {
      lunges++;
      const v0 = c.x, v1 = c.x + c.viewportWidth;
      for (const dx of [20, 330, 660]) assert.ok(a.left + dx > v0 && a.left + dx < v1, `refuge at ${dx} out of view (${Math.round(v0 - a.left)}..${Math.round(v1 - a.left)}) with Pokey at ${Math.round(sim.p.x - a.left)}`);
    }
  }
  assert.ok(lunges > 10);
});

test('3-10: a hero near him who dodges LEFT out of the ring to the wall still meets his back when he lands (QA repro), both ways up', () => {
  for (const screen of [{ w: 844, h: 390 }, { w: 390, h: 844 }]) {
    const sim = new BossPlay('3-10', false, screen);
    sim.skipEntrance();
    const moves = { ...sim.def.moves };
    for (const k of Object.keys(sim.def.moves)) if (k !== 'pounce') delete (sim.def.moves as Record<string, unknown>)[k];
    try {
      const br = sim.boss.ai!;
      const state = (): string => br.state;
      let checked = 0;
      // walk right toward him; at each crouch, steer left for 1 s; read his facing when he has landed
      let mode: 'right' | 'left' | 'none' = 'right';
      let leftAt = 0;
      for (let i = 0; i < 30 * 40 && checked < 3; i++) {
        if (state() === 'tell' && mode !== 'left' && mode !== 'none') {
          mode = 'left';
          leftAt = sim.t;
        }
        if (mode === 'left' && sim.t - leftAt > 1) mode = 'none';
        const was = state();
        sim.frame(mode === 'right' ? { right: true } : mode === 'left' ? { left: true } : {});
        if (was === 'act' && state() === 'rec') {
          checked++;
          assert.ok(Math.sign(sim.p.x - sim.boss.x) !== sim.boss.facing, `he landed at ${Math.round(sim.boss.x)} facing ${sim.boss.facing}, Pokey at ${Math.round(sim.p.x)}`);
        }
        if (state() === 'idle' && mode === 'none') mode = 'right';
      }
      assert.ok(checked >= 2, `pounces checked: ${checked}`);
    } finally {
      Object.assign(sim.def.moves, moves);
    }
  }
});

test("1-10: his coils never hurt by touch, and Dot's cracking-stump line waits until Pokey stands on the cracking stump", () => {
  const sim = new BossPlay('1-10');
  sim.skipEntrance();
  const b = sim.boss;
  for (const mv of Object.keys(sim.def.moves)) {
    for (const [state, t] of [['tell', 0.8], ['act', 0.2], ['rec', 0.2], ['idle', 0]] as const) {
      assert.equal(bodyHurts({ ...b, ai: { ...b.ai!, state, move: mv, t } } as BossEntity, sim.def), false, `${mv} ${state}`);
    }
  }
  assert.equal(sim.def.guide?.[3], undefined, 'no cracking line at the phase change');
  // into phase 3, on open ground: nothing said about the stump
  b.hp = Math.floor(b.maxHp * 0.3);
  for (let i = 0; i < 90; i++) sim.frame();
  const crack = sim.def.crackTip!;
  assert.ok(!sim.guides.some((g) => g.text === crack), 'said while on open ground');
  // up on the stump: said
  const stump = (sim.e.platforms as Array<{ x: number; y: number; width: number; crackFrom?: number }>).find((p) => p.crackFrom !== undefined)!;
  sim.p.x = stump.x + stump.width / 2;
  sim.p.y = stump.y - 30;
  sim.p.vy = 0;
  for (let i = 0; i < 30; i++) sim.frame();
  assert.ok(sim.guides.some((g) => g.text === crack), 'not said on the cracking stump');
});

test("3-10: a move's first wind-up, when Dot names it, runs long enough to read her line before it strikes", () => {
  const sim = new BossPlay('3-10');
  sim.skipEntrance();
  const moves = { ...sim.def.moves };
  for (const k of Object.keys(sim.def.moves)) if (k !== 'pounce') delete (sim.def.moves as Record<string, unknown>)[k];
  try {
    for (let i = 0; i < 30 * 30 && sim.tells.length < 3; i++) sim.frame(i % 60 < 30 ? { left: true } : { right: true });
    const [first, second] = sim.tells;
    assert.ok(first.dur >= 1.5, `the first pounce winds up for ${first.dur.toFixed(2)} s`);
    assert.ok(Math.abs(second.dur - sim.def.moves.pounce.tell) < 0.1, `later ones for ${second.dur.toFixed(2)} s`);
    const tip = sim.guides.find((g) => /ring/.test(g.text))!;
    assert.ok(tip && tip.t <= first.t0 + 0.05, 'the tip comes as the wind-up begins');
  } finally {
    Object.assign(sim.def.moves, moves);
  }
});
