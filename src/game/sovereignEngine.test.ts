/**
 * The Sky Sovereign (4-10) in the real engine (engine.ts, its own update at 30 fps, no screen): Matt's opening rule measured where it
 * happens, and the fight played to the end.
 *
 *   Every opening (the weak point glowing) stays open at least as long as it takes Pokey to get to it from where he really stood when it
 *   opened, plus 0.8 s to see it and 0.6 s to land the hit (sovereignReach.ts OPENING_RULE); and it opens only after a wind-up he could see.
 *   A scripted player who only dodges (so no opening is cut short by a hit) is played through all three phases.
 *
 *   A scripted player who dodges and hits each opening after a human's 0.8 s wins, in portrait and in landscape, with no stuck state.
 */
import './bossPlayDom.ts';
import { headlessScreen } from './bossPlayDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './engine.ts';
import { generateAllLevels } from './worldsData.ts';
import { weakOpen, weakRect } from './bossAI.ts';
import type { BossDef } from './bossAI.ts';
import type { BossEntity, InputState, LevelConfig, PlayerState } from './types.ts';
import { heroReach, openingNeeds, OPENING_RULE } from './sovereignReach.ts';
import type { SkyPillar } from './sovereignFight.ts';
import { DIVE_LOCK, RAKE_COMMIT } from './bossDefs.ts';

const DT = 1 / 30;

interface Pad {
  left?: boolean;
  right?: boolean;
  down?: boolean;
  jump?: boolean;
  press?: boolean;
  punch?: boolean;
}

/** the pad, with the real input's buffers (a jump press waits 0.16 s to be used, a punch 0.12 s: inputEngine.ts) */
class FakeInput {
  state: InputState = {
    left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false,
    kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0,
  };
  source: 'keys' | 'pad' | 'gesture' = 'gesture';
  airJumpReady = false;
  kickNear = true;
  onVine = false;
  megaReady = true;
  onFocusLost = null;
  jumpBuffer = 0;
  punchBuffer = 0;
  update(dt: number) {
    if (this.jumpBuffer > 0 && (this.jumpBuffer -= dt) <= 0) this.state.jumpPressed = false;
    else if (this.jumpBuffer <= 0) this.state.jumpPressed = false;
    if (this.punchBuffer > 0 && (this.punchBuffer -= dt) <= 0) this.state.punchPressed = false;
    else if (this.punchBuffer <= 0) this.state.punchPressed = false;
    this.state.kickPressed = false;
    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
  }
  triggerHaptic() {}
  clearAll() {
    Object.assign(this.state, { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false });
    this.jumpBuffer = 0;
    this.punchBuffer = 0;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Engine = Record<string, any>;
const COSMETIC = ['updateSound', 'spawnSparkBurst', 'spawnJumpDust', 'spawnDoubleJumpBurst', 'spawnDebrisBurst', 'spawnKickHitBurst', 'spawnClawHitSparks', 'recordPokey'];

interface Opening {
  move: string;
  state: string;
  t0: number;
  dur: number;
  /** Pokey's feet when it opened (x, and height above the floor) */
  px: number;
  up: number;
  /** the wind-up he saw before it (s): the move's tell, or the dive's for a slam */
  tell: number;
  /** the quickest he could get there from where he stood, against the spot as it was once he had seen it */
  reach: number;
  cut: boolean;
}

function fight(o: { screen: { w: number; h: number }; hit: boolean; hpShare?: number; seconds: number; seed?: number }) {
  const lvl = generateAllLevels().find((l) => l.id === '4-10')!;
  const input = new FakeInput();
  let won = false;
  const e = new GameEngine(headlessScreen(o.screen.w, o.screen.h), { ...lvl, unlocked: true } as LevelConfig, input as never, {
    onProgressUpdate: () => {}, onVictory: () => (won = true), onDefeat: () => {}, onGameOver: () => {},
  } as never) as unknown as Engine;
  for (const m of COSMETIC) e[m] = () => {};
  e.inputGrace = 0;
  e.introT = 99;
  const p = (): PlayerState => e.player;
  const b = (): BossEntity => e.boss;
  const def = (): BossDef => e.bossDef;
  const A = () => e.currentStage.arena as { left: number; right: number; floor: number };
  const frame = (pad: Pad) => {
    const s = input.state;
    s.left = !!pad.left && !pad.right;
    s.right = !!pad.right && !pad.left;
    s.down = !!pad.down;
    s.up = !!pad.jump || !!pad.press;
    s.jumpHeld = !!pad.jump || !!pad.press;
    if (pad.press) {
      s.jumpPressed = true;
      input.jumpBuffer = 0.16;
    }
    if (pad.punch) {
      s.punchPressed = true;
      input.punchBuffer = 0.12;
    }
    if (e.hitstopTimer > 0) e.hitstopTimer -= DT;
    else {
      let sdt = DT * (e.speedScale ?? 1);
      if (e.slowMoLeft > 0) {
        e.slowMoLeft -= DT;
        sdt *= 0.3;
      }
      e.update(sdt);
    }
  };
  // the entrance is a cut scene
  for (let i = 0; (e.entrance || !e.entranceDone) && i < 30 * 40; i++) frame({});
  if (o.hpShare) b().hp = Math.round(b().maxHp * o.hpShare);
  let rs = (o.seed ?? 1) >>> 0;
  const rnd = () => ((rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296);

  const openings: Opening[] = [];
  let cur: Opening | null = null;
  let openSince = -1;
  let hurts = 0;
  let lastHp = p().hp;
  let lastLives = e.lives;
  let stuck = 0;
  let longest = 0;
  let lastState = '';
  let lastMark: { x: number; w: number } | null = null;
  let lastJump = -9;
  let lastPunch = -9;
  const t0 = e.gameTime;
  let lastMove = '';
  let lastTell = 0;
  while (e.gameTime - t0 < o.seconds && !won && !b().defeated && b().ai?.state !== 'dying' && e.lives > 0) {
    const br = b().ai!;
    const P = p();
    const floor = A().floor;
    const up = floor - P.y;
    const ps: SkyPillar[] = e.skyPillars ?? [];
    const stand = ps.filter((q) => !q.broken);
    const now = e.gameTime;
    if (br.state === 'tell') {
      lastMove = br.move ?? '';
      lastTell = (def().moves[lastMove]?.tell ?? 0) * (e.bossCtx?.tellMul ?? 1);
    }
    // ── the openings, as they come and go ──
    const open = weakOpen(b(), def()) && br.state !== 'dying';
    if (open && !cur) {
      cur = { move: br.state === 'stun' ? `${br.move}:slam` : br.move ?? '?', state: br.state, t0: now, dur: 0, px: P.x, up, tell: lastTell, reach: -1, cut: false };
      openSince = now;
    }
    if (open && cur && cur.reach < 0 && now - cur.t0 >= OPENING_RULE.react) {
      // the spot as it is once he has seen it (she has settled by then)
      const r = weakRect(b(), def(), floor)!;
      const rocks = ps.filter((q) => q.h > 0).map((q) => ({ x: q.x, w: q.w, h: q.h }));
      cur.reach = heroReach(cur.px, cur.up, { kind: 'punch', box: { x: r.x, y: floor - (r.y + r.h), w: r.w, h: r.h } }, rocks);
    }
    if (open && cur) cur.dur = now - cur.t0;
    if (!open && cur) {
      cur.cut = br.state === 'roar' || br.state === 'dying' || b().hp <= 0;
      openings.push(cur);
      cur = null;
      openSince = -1;
    }
    // ── stuck: no state lasts long ──
    const st = `${br.state}:${br.move}`;
    if (st === lastState) stuck += DT;
    else stuck = 0;
    lastState = st;
    longest = Math.max(longest, stuck);

    // ── the player: lure her by a rock, step off the locked mark, crouch for the screech, back off the lunge ──
    let tx = P.x;
    const pad: Pad = {};
    const goHit = o.hit && open && openSince >= 0 && now - openSince >= OPENING_RULE.react;
    if (goHit) {
      const r = weakRect(b(), def(), floor)!;
      const cx = r.x + r.w / 2;
      tx = cx + (P.x <= cx ? -34 : 34);
      const bot = floor - (r.y + r.h);
      const top = floor - r.y;
      const jab = (f: number) => f + 54 > bot && f + 8 < top;
      const near = Math.abs(P.x - cx) < r.w / 2 + 50;
      if (near && jab(up) && now - lastPunch > 0.3) {
        pad.punch = true;
        lastPunch = now;
      } else if (near && !jab(up)) {
        if (P.grounded && now - lastJump > 0.45) {
          pad.press = true;
          lastJump = now;
        } else if (!P.grounded && P.vy >= -40 && (P.jumpsLeft ?? 0) > 0 && up + 54 < bot + 20 && now - lastJump > 0.25) {
          pad.press = true;
          lastJump = now;
        } else if (!P.grounded) pad.jump = true;
      }
    } else if ((br.move === 'diveBomb' || br.move === 'snatch') && (br.state === 'tell' || br.state === 'act')) {
      const mk = (e.hazards ?? []).find((h: { kind: string }) => h.kind === 'mark');
      if (mk) lastMark = { x: mk.x, w: mk.w };
      if (lastMark && (br.state === 'act' || br.t > DIVE_LOCK + 0.3)) {
        if (Math.abs(P.x - lastMark.x) < lastMark.w / 2 + 50) {
          const q = [...stand].sort((a, z) => Math.abs(a.x - lastMark!.x) - Math.abs(z.x - lastMark!.x))[0];
          let dir = q ? Math.sign(lastMark.x - q.x) || 1 : Math.sign((A().left + A().right) / 2 - P.x) || 1;
          if (lastMark.x + dir * 220 > A().right - 30 || lastMark.x + dir * 220 < A().left + 30) dir = -dir;
          tx = lastMark.x + dir * (lastMark.w / 2 + 80);
        }
      } else if (br.state === 'tell') {
        const q = [...stand].sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
        if (q) tx = q.x + (b().x >= q.x ? 60 : -60);
      }
    } else if (br.state === 'tell' || br.state === 'act') {
      lastMark = null;
      if (br.move === 'screech' && P.grounded) pad.down = true;
      if (br.move === 'talonRake' && (br.state === 'act' || br.t > RAKE_COMMIT + 0.3)) tx = P.x + Math.sign(P.x - b().x || 1) * 200;
      if (br.state === 'act' && br.move !== 'diveBomb' && Math.abs(P.x - b().x) < b().width / 2 + 20) tx = b().x + Math.sign(P.x - b().x || 1) * (b().width / 2 + 60);
    } else if (!open) {
      lastMark = null;
      const q = [...stand].sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
      if (q) tx = q.x + (b().x >= q.x ? 60 : -60) + (rnd() - 0.5) * 10;
      else if (Math.abs(P.x - b().x) < 260) tx = b().x + Math.sign(P.x - b().x || 1) * 300;
    }
    // falling stones: out from under them
    for (const h of e.hazards ?? []) if (h.kind === 'drop' && Math.abs(tx - h.x) < h.w / 2 + 30) tx = h.x + Math.sign(P.x - h.x || 1) * (h.w / 2 + 45);
    // the storm at the edges
    tx = Math.max(A().left + (b().phase >= 3 ? 230 : 30), Math.min(A().right - (b().phase >= 3 ? 230 : 30), tx));
    if (Math.abs(tx - P.x) > 10) {
      if (tx > P.x) pad.right = true;
      else pad.left = true;
      // a rock in the way: hop it
      for (const q of ps) {
        if (q.h <= 0) continue;
        const ahead = (q.x - P.x) * (pad.right ? 1 : -1);
        if (P.grounded && up < q.h - 20 && ahead > 0 && ahead < q.w / 2 + 45 && Math.abs(tx - P.x) > ahead - q.w / 2 && now - lastJump > 0.4 && br.move !== 'skySweep') {
          pad.press = true;
          lastJump = now;
        }
      }
      if (!P.grounded && now - lastJump < 0.6) pad.jump = true;
    }
    frame(pad);
    if (p().hp < lastHp || e.lives < lastLives) hurts++;
    lastHp = p().hp;
    lastLives = e.lives;
  }
  if (cur) openings.push({ ...cur, cut: true });
  return { won: won || !!b().defeated || b().ai?.state === 'dying', t: e.gameTime - t0, openings, hurts, longest, lives: e.lives, hp: b().hp, maxHp: b().maxHp };
}

const LAND = { w: 844, h: 390 };
const PORT = { w: 400, h: 720 };

test('in the real engine every opening stays open for the reach from where he stood, plus 0.8 s to see it and 0.6 s to hit, after a wind-up', (t) => {
  const all: Opening[] = [];
  for (const [share, seed] of [[1, 1], [0.6, 2], [0.3, 3], [0.3, 4]] as const) {
    const r = fight({ screen: LAND, hit: false, hpShare: share, seconds: 75, seed });
    all.push(...r.openings.filter((x) => !x.cut));
  }
  const kinds = new Map<string, { n: number; open: number; need: number }>();
  for (const x of all) {
    const k = kinds.get(x.move) ?? { n: 0, open: Infinity, need: 0 };
    k.n++;
    k.open = Math.min(k.open, x.dur);
    k.need = Math.max(k.need, openingNeeds(x.reach));
    kinds.set(x.move, k);
  }
  for (const [k, w] of kinds) t.diagnostic(`${k}: ${w.n} times, open at least ${w.open.toFixed(2)} s, needs at most ${w.need.toFixed(2)} s`);
  // every kind of opening came up
  for (const m of ['diveBomb:slam', 'featherVolley', 'talonRake', 'screech', 'skySweep', 'snatch', 'wingGust']) assert.ok(kinds.has(m), `${m} came up (${[...kinds.keys()].join(', ')})`);
  for (const x of all) {
    assert.ok(Number.isFinite(x.reach), `${x.move} at ${x.t0.toFixed(1)} s: he could get to it at all (from ${Math.round(x.px)}, ${Math.round(x.up)} up)`);
    assert.ok(x.dur + DT >= openingNeeds(x.reach), `${x.move} at ${x.t0.toFixed(1)} s: open ${x.dur.toFixed(2)} s, needs ${openingNeeds(x.reach).toFixed(2)} s`);
    assert.ok(x.tell >= 0.8, `${x.move}: it opened after a ${x.tell} s wind-up`);
  }
});

test('in the real engine a player who dodges and hits each opening after 0.8 s wins, upright and sideways, and nothing gets stuck', (t) => {
  for (const [name, screen] of [['landscape', LAND], ['portrait', PORT]] as const) {
    const r = fight({ screen, hit: true, seconds: 300, seed: 7 });
    t.diagnostic(`${name}: ${r.won ? 'won' : 'not won'} in ${r.t.toFixed(0)} s, hurt ${r.hurts} times, ${r.lives} lives left, her bar ${r.hp}/${r.maxHp}, longest state ${r.longest.toFixed(1)} s`);
    assert.ok(r.won, `${name}: won`);
    assert.ok(r.longest < 8, `${name}: no state lasts ${r.longest.toFixed(1)} s`);
  }
});
