/**
 * Openings measured from the WORST place a hero can realistically be, not from beside the spot (2026-10-26, QA gate: in 1-10 the dazed
 * head lay by the far tree while Steph had dodged on the right; in 3-10 the tail was out of reach for a hero who had jumped the dash;
 * a double jump on the spot was hit by the pounce). Real engine, real physics, a 0.8 s reaction: each opening must stay open for the
 * reach + 0.8 s + 0.6 s, upright and sideways.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay } from './bossPlay.ts';
import { BossBot, prowlerTactic, seeded, type Tactic } from './bossBot.ts';
import { lungeAim } from './venomFang.ts';
import { POUNCE } from './bossDefs.ts';

const LAND = { w: 844, h: 390 };
const PORT = { w: 390, h: 844 };
const VIEWS = [['sideways', LAND], ['upright', PORT]] as const;

function checkOpenings(sim: BossPlay, what: string, only?: string) {
  const list = sim.openings.filter((o) => !only || o.move === only);
  assert.ok(list.length > 0, `${what}: no openings`);
  for (const o of list) {
    if (o.cut && o.reach < 0) continue;
    assert.ok(o.reach >= 0, `${what} ${o.move}: closed before he got there (${Math.round(Math.abs(o.px - o.spot.x - o.spot.w / 2))} px away)`);
    assert.ok(o.full >= o.reach + 1.4, `${what} ${o.move}: open ${o.full.toFixed(2)} s < reach ${o.reach.toFixed(2)} + 1.4`);
  }
}

function run(id: string, screen: { w: number; h: number }, tactic: Tactic, seed: number, setup?: (sim: BossPlay) => void, seconds = 120) {
  const rand = Math.random;
  Math.random = seeded(seed * 7 + 1);
  try {
    const sim = new BossPlay(id, false, screen);
    sim.skipEntrance();
    setup?.(sim);
    const bot = new BossBot(sim, tactic, { rnd: seeded(seed), reactOpen: 0.8, jitter: 0 });
    const r = bot.play(seconds);
    return { sim, r };
  } finally {
    Math.random = rand;
  }
}

// Venom: the hero waits at one refuge all fight and leaves it only to hit the dazed head
const refuge = (where: 'tree' | 'stump' | 'coils' | 'cradle'): Tactic => (bot) => {
  const a = bot.sim.arena;
  if ((bot.belief.state === 'rec' || bot.belief.state === 'stun') && bot.sim.open) return { kind: 'hit', spot: bot.sim.spot! };
  if (where === 'tree') return { kind: 'climb', x: a.left + 20, y: a.floor - 260 };
  if (where === 'stump' || where === 'cradle') {
    const l = bot.ledgeAt(where === 'stump' ? 330 : 36);
    return { kind: 'stand', x: (l.x0 + l.x1) / 2, ledge: l };
  }
  // the far side: right by the coils, hopping the head as it comes
  const b = bot.sim.boss;
  if (b.ai!.state === 'act' && bot.p.grounded) return { kind: 'hop', dbl: true };
  return { kind: 'stand', x: b.x - b.width / 2 - 40, ledge: null };
};

for (const [view, screen] of VIEWS) {
  test(`1-10 ${view}: the dazed head comes down where the hero dodged, so it is in reach from every refuge`, () => {
    for (const where of ['tree', 'cradle', 'stump', 'coils'] as const) {
      const { sim, r } = run('1-10', screen, refuge(where), 1);
      assert.ok(r.won, `${where}: not won`);
      checkOpenings(sim, `1-10 ${view} from the ${where}`);
    }
  });

  test(`3-10 ${view}: after the dash he turns his tail to the hero, even one who jumped it and stands at his head`, () => {
    const jumper: Tactic = (bot) => {
      const b = bot.sim.boss;
      const br = b.ai!;
      const p = bot.p;
      if (br.move === 'streak' && (br.state === 'tell' || br.state === 'act')) {
        const close = Math.abs(b.x - p.x) < 330 && Math.sign(p.x - b.x) === b.facing;
        if (br.state === 'act' && close && p.grounded) return { kind: 'hop', dbl: true };
        return { kind: 'stand', x: p.x, ledge: null };
      }
      if (br.move === 'streak' && br.state === 'rec') assert.ok(Math.sign(p.x - b.x) !== b.facing, 'he faces the hero in the opening');
      return prowlerTactic(bot);
    };
    for (const seed of [1, 3]) {
      let keep: Record<string, unknown> = {};
      let moves: Record<string, unknown> = {};
      try {
        const { sim } = run('3-10', screen, jumper, seed, (s) => {
          // the dash only: phase 2 on, and nothing else to pick (the def is shared: put the moves back after)
          s.boss.hp = Math.floor(s.boss.maxHp * 0.6);
          moves = s.def.moves as Record<string, unknown>;
          keep = { ...moves };
          for (const k of ['shadowStep', 'clawCombo', 'pounce']) delete moves[k];
        }, 60);
        checkOpenings(sim, `3-10 ${view} seed ${seed}`, 'streak');
      } finally {
        Object.assign(moves, keep);
      }
    }
  });
}

test('1-10: the lunge stops just past the hero, and goes the full length only for a hero by the far fence', () => {
  const sim = new BossPlay('1-10');
  sim.skipEntrance();
  const b = sim.boss;
  const a = sim.arena;
  const f = b.facing < 0 ? -1 : 1;
  const mid = a.left + 600;
  const tip = lungeAim(b, mid, a.left, a.right);
  assert.ok(Math.abs(tip - (mid + f * 90)) < 1, `the head stops at ${Math.round(tip)} for a hero at ${mid}`);
  const far = lungeAim(b, f < 0 ? a.left + 5 : a.right - 5, a.left, a.right);
  assert.ok(f < 0 ? far <= a.left + 20 : far >= a.right - 20, 'the full length for a hero at the far fence');
});

test("3-10: the pounce lands on the ring marked as he crouches: standing still is hit, running out after a 0.8 s reaction is not", () => {
  const go = (runAfter: number | null) => {
    const sim = new BossPlay('3-10');
    sim.skipEntrance();
    const b = sim.boss;
    const a = sim.arena;
    const br = b.ai!;
    for (let i = 0; i < 20; i++) sim.frame();
    const moves = { ...sim.def.moves };
    for (const k of Object.keys(sim.def.moves)) if (k !== 'pounce') delete (sim.def.moves as Record<string, unknown>)[k];
    try {
      sim.p.x = a.left + 500;
      b.x = a.left + 800;
      br.state = 'idle';
      br.idle = 0.05;
      br.recent = ['streak'];
      // (read through a function: the state changes inside the engine)
      const state = (): string => br.state;
      const hp0 = sim.p.hp;
      let aim: number | undefined;
      let px0 = 0;
      for (let i = 0; i < 90; i++) {
        const sinceTell = state() === 'tell' ? br.t : state() === 'act' ? br.t + POUNCE.tell : -1;
        if (state() === 'tell' && aim === undefined) {
          aim = br.d.aim;
          px0 = sim.p.x;
        }
        sim.frame(runAfter !== null && sinceTell >= runAfter ? { left: true } : {});
        if (state() === 'rec') break;
      }
      assert.ok(aim !== undefined && Math.abs(aim - px0) < 2, 'the ring is where he stood as the crouch began');
      return sim.p.hp < hp0;
    } finally {
      Object.assign(sim.def.moves, moves);
    }
  };
  assert.equal(go(null), true, 'standing in the ring is hit');
  assert.equal(go(0.9), false, 'running out 0.9 s after the crouch began gets clear');
  assert.ok(POUNCE.tell >= 0.6);
});

test('1-10: no hiding place the head cannot reach, a short way down the tree, and a cradle at its top', () => {
  const sim = new BossPlay('1-10');
  sim.skipEntrance();
  const a = sim.arena;
  const b = sim.boss;
  // the coils sit against the right fence: no room to stand behind them (QA gate: the gap there left the head 600 px away)
  assert.ok(a.right - (b.x + b.width / 2) < 20, `${Math.round(a.right - (b.x + b.width / 2))} px behind the coils`);
  const vine = (sim.e.vines as Array<{ x: number; topY: number; vineType: string }>).find((v) => v.vineType === 'tree_climb' && Math.abs(v.x - (a.left + 20)) < 2);
  assert.ok(vine, 'the wall vine');
  assert.ok(a.floor - vine.topY <= 280, `the vine reaches ${a.floor - vine.topY} up (the climb down from there must fit the daze)`);
  // pushing on at the top hops him off: a ledge right there catches him, off the floor the lunge sweeps
  const top = (sim.e.platforms as Array<{ x: number; y: number; width: number }>).find((p) => p.x <= vine.x + 40 && p.x + p.width >= vine.x + 60 && Math.abs(p.y - vine.topY) < 20);
  assert.ok(top, 'a cradle at the top of the vine');
  // Dot's first tip fits her bubble in three lines
  assert.ok(sim.def.guide!.start!.length <= 100, sim.def.guide!.start!);
});

/**
 * The slowest first hit measured BY TOUCH (tools/qa/bossReach.cjs: Steph's thumbs upright, Jen's sideways, a 0.8 s pause before going,
 * getting down the tree or off a shelf included; 2026-10-26), in seconds from the opening. Each window must leave 0.6 s after it.
 */
const TOUCH_WORST: Array<[string, string, number]> = [
  ['1-10', 'sweep', 3.14],
  ['3-10', 'shadowStep', 2.56],
  ['3-10', 'shadowStep:stun', 2.3],
  ['3-10', 'clawCombo', 2.43],
  ['3-10', 'pounce', 2.18],
];
test('every window covers the slowest first hit measured by touch, plus 0.6 s to hit', () => {
  for (const [id, mv, worst] of TOUCH_WORST) {
    const sim = new BossPlay(id);
    const [name, stun] = mv.split(':');
    const m = sim.def.moves[name];
    const win = stun ? m.stunAfter!(sim.boss) : m.rec;
    assert.ok(win >= worst + 0.6, `${id} ${mv}: open ${win} s < ${worst} + 0.6`);
  }
});

test('1-10: his coils are a wall (no getting behind them, nor up the fence tree there), and holding up at the treetop is a safe perch', () => {
  for (const screen of [{ w: 844, h: 390 }, { w: 390, h: 844 }]) {
    // into the coils, and up: he stops at their face and never climbs the fence tree behind them
    const sim = new BossPlay('1-10', false, screen);
    sim.skipEntrance();
    const b = sim.boss;
    const face = b.x - b.width / 2;
    sim.p.x = face - 120;
    for (let i = 0; i < 30 * 4; i++) {
      sim.frame({ right: true, up: i > 30 });
      assert.ok(sim.p.x <= face + 2, `he got to ${Math.round(sim.p.x - face)} px into the coils`);
      assert.ok(!sim.p.climbing, 'he climbed something behind the coils');
    }
    // the treetop: up the wall vine and keep holding up for 4 s; he ends up on the cradle at the top and stays there
    const t = new BossPlay('1-10', false, screen);
    t.skipEntrance();
    const a = t.arena;
    t.p.x = a.left + 20;
    for (let i = 0; i < 30 * 4; i++) t.frame({ up: true });
    const feet = a.floor - t.p.y;
    assert.ok(t.p.grounded && feet > 250, `after holding up he is ${Math.round(feet)} px up (grounded ${t.p.grounded})`);
    assert.ok(t.p.x < a.left + 160, `and at ${Math.round(t.p.x - a.left)} px from the left fence`);
  }
});
