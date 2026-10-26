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
import { bodyHurts, hazardBox, weakOpen, weakRect } from './bossAI.ts';
import { playerHurtRect } from './fight.ts';
import type { BossDef } from './bossAI.ts';
import type { BossEntity, InputState, LevelConfig, PlayerState } from './types.ts';
import { heroReach, openingNeeds, OPENING_RULE } from './sovereignReach.ts';
import { pillarFor, type SkyPillar } from './sovereignFight.ts';
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
  /** where she was when it opened */
  bx: number;
  /** he was hurt (or lost a life and stood up at the flag) during the move that opened it: he did not dodge it */
  hit: boolean;
}

/** the real game on 4-10, with the pad's controls, one 30 fps frame at a time (the game loop's hitstop and slow motion included) */
function makeGame(screen: { w: number; h: number }, onGuide?: (text: string) => void) {
  const lvl = generateAllLevels().find((l) => l.id === '4-10')!;
  const input = new FakeInput();
  const out = { won: false };
  const e = new GameEngine(headlessScreen(screen.w, screen.h), { ...lvl, unlocked: true } as LevelConfig, input as never, {
    onProgressUpdate: () => {}, onVictory: () => (out.won = true), onDefeat: () => {}, onGameOver: () => {},
    ...(onGuide ? { onGuide } : {}),
  } as never) as unknown as Engine;
  for (const m of COSMETIC) e[m] = () => {};
  e.inputGrace = 0;
  e.introT = 99;
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
  return { e, frame, out };
}

/** where a player waits out an attack he can take cover from: by the rocks (the lure), behind the rock on the far side from her, or
 * back at the chimes by the left fence */
type Stance = 'lure' | 'rock' | 'chimes';
const CHIMES_DX = 150;

function fight(o: { screen: { w: number; h: number }; hit: boolean; hpShare?: number; seconds: number; seed?: number; stance?: Stance }) {
  const { e, frame, out } = makeGame(o.screen);
  let won = false;
  const p = (): PlayerState => e.player;
  const b = (): BossEntity => e.boss;
  const def = (): BossDef => e.bossDef;
  const A = () => e.currentStage.arena as { left: number; right: number; floor: number };
  // (her choices come from the fight's dice: seeded here, so a run is the same every time)
  let rs = (o.seed ?? 1) >>> 0;
  const rnd = () => ((rs = (rs * 1664525 + 1013904223) >>> 0) / 4294967296);
  const seedDice = () => {
    if (e.bossCtx) e.bossCtx.rnd = rnd;
  };
  // the entrance is a cut scene
  for (let i = 0; (e.entrance || !e.entranceDone) && i < 30 * 40; i++) {
    seedDice();
    frame({});
  }
  if (o.hpShare) b().hp = Math.round(b().maxHp * o.hpShare);

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
  let tellAt = 0;
  let hurtAt = -99;
  let hopping = 0;
  const hits: Array<{ t: number; what: string; warn: number }> = [];
  const spentSeen = new Set<number>();
  /** everything that would hurt him where he is now, with how long it has been on show: a boss's blow from the start of its wind-up; the
   * stones bursting where she lands from when the mark locked (GET OFF!); a feather from its volley's wind-up; a falling stone or a
   * storm from its warning */
  const sources = () => {
    const out: Array<{ what: string; warn: number }> = [];
    const P = p();
    const br = b().ai!;
    const pb = playerHurtRect(P);
    const over = (r: { x: number; y: number; w: number; h: number }) => r.x < pb.x + pb.w && r.x + r.w > pb.x && r.y < pb.y + pb.h && r.y + r.h > pb.y;
    const since = e.gameTime - tellAt;
    const bb = b();
    if (bodyHurts(bb, def()) && over({ x: bb.x - bb.width / 2, y: bb.y - bb.height / 2, w: bb.width, h: bb.height })) out.push({ what: `her body (${br.state} ${br.move})`, warn: since });
    for (const r of br.hurt) if (over(r)) out.push({ what: `${br.move} (${br.state})`, warn: since });
    for (const h of e.hazards ?? []) {
      const r = hazardBox(h);
      if (!r || !(h.dmg > 0) || !over(r)) continue;
      const age = h.maxLife - h.life;
      const warn = h.look === 'shards' ? since - DIVE_LOCK : h.kind === 'bolt' ? age + 0.85 : (h.warnMax ?? 0) + age;
      out.push({ what: `${h.kind}/${h.look}`, warn });
    }
    return out;
  };
  let track: Array<{ x: number; y: number; w: number; h: number }> = [];
  let rocksNow: Array<{ x: number; w: number; h: number }> = [];
  while (e.gameTime - t0 < o.seconds && !(won = won || out.won) && !b().defeated && b().ai?.state !== 'dying' && e.lives > 0) {
    const br = b().ai!;
    const P = p();
    const floor = A().floor;
    const up = floor - P.y;
    const ps: SkyPillar[] = e.skyPillars ?? [];
    const stand = ps.filter((q) => !q.broken);
    const now = e.gameTime;
    if (br.state === 'tell') tellAt = now - br.t;
    if (br.state === 'tell') {
      lastMove = br.move ?? '';
      lastTell = (def().moves[lastMove]?.tell ?? 0) * (e.bossCtx?.tellMul ?? 1);
    }
    // ── the openings, as they come and go ──
    const open = weakOpen(b(), def()) && br.state !== 'dying';
    if (open && !cur) {
      track = [];
      cur = { move: br.state === 'stun' ? `${br.move}:slam` : br.move ?? '?', state: br.state, t0: now, dur: 0, px: P.x, up, tell: lastTell, reach: -1, cut: false, bx: b().x, hit: hurtAt >= tellAt };
      openSince = now;
    }
    if (open && cur) {
      // where the spot is, frame by frame (she settles, and comes to him)
      const r = weakRect(b(), def(), floor)!;
      track.push({ x: r.x, y: floor - (r.y + r.h), w: r.w, h: r.h });
      rocksNow = ps.filter((q) => q.h > 0).map((q) => ({ x: q.x, w: q.w, h: q.h }));
    }
    if (open && cur) cur.dur = now - cur.t0;
    if (!open && cur) {
      // he sets off once he has seen it (0.8 s in), from where he stood when it opened, after the spot as it really moved
      const k0 = Math.round(OPENING_RULE.react / DT);
      if (track.length > k0) {
        const at = (tt: number) => track[Math.min(track.length - 1, k0 + Math.round(tt / DT))];
        cur.reach = heroReach(cur.px, cur.up, { kind: 'punch', box: at(0), boxAt: at }, rocksNow);
      }
      track = [];
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
        // what bursts where she lands: the mark, and the rock it touches (bossDefs.ts skySlam); out of it on the near side, or the far
        // side when the near one is the fence or the storm (over the rock if need be)
        const rock = pillarFor(ps, lastMark.x);
        const lo = Math.min(lastMark.x - 65, rock ? rock.x - rock.w / 2 : Infinity);
        const hi = Math.max(lastMark.x + 65, rock ? rock.x + rock.w / 2 : -Infinity);
        if (P.x + 19 > lo - 12 && P.x - 19 < hi + 12) {
          const edge = b().phase >= 3 ? 178 : 30;
          // (on the mark: away from the rock; already off it to one side: on out that side)
          let dir: number = Math.abs(P.x - lastMark.x) > 40 ? Math.sign(P.x - lastMark.x) : rock ? Math.sign(lastMark.x - rock.x) || 1 : 1;
          const to = (d: number) => (d < 0 ? lo - 50 : hi + 50);
          if (to(dir) > A().right - edge || to(dir) < A().left + edge) dir = -dir;
          tx = to(dir);
        }
      } else if (br.state === 'tell') {
        const q = [...stand].sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
        if (q) tx = q.x + (b().x >= q.x ? 60 : -60);
      }
    } else if (br.state === 'tell' || br.state === 'act') {
      lastMark = null;
      const cover = br.move === 'featherVolley' || br.move === 'skySweep' || br.move === 'wingGust' || br.move === 'screech';
      if (cover && o.stance === 'chimes') tx = A().left + CHIMES_DX;
      if (cover && o.stance === 'rock') {
        // the rock nearest him, and behind it (the side away from her)
        const q = [...stand].sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
        if (q) tx = q.x + Math.sign(q.x - b().x || 1) * (q.w / 2 + 30);
      }
      if ((br.move === 'screech' || br.move === 'featherVolley') && P.grounded && Math.abs(tx - P.x) < 12) pad.down = true;
      if (br.move === 'talonRake' && (br.state === 'act' || br.t > RAKE_COMMIT + 0.3)) {
        const away = Math.sign(P.x - b().x || 1);
        // back out of the bite, or with a rock at his back, double jump over it (it reaches RAKE_TOP)
        const walled = ps.some((q) => q.h > 0 && (q.x - P.x) * away > 0 && (q.x - P.x) * away < q.w / 2 + 170);
        if (!walled) tx = P.x + away * 200;
        else if ((br.state === 'act' || br.t > (def().moves.talonRake.tell ?? 1) - 0.3) && P.grounded && now - lastJump > 0.4) {
          pad.press = true;
          lastJump = now;
        } else if (!P.grounded && (P.jumpsLeft ?? 0) > 0 && now - lastJump > 0.2) {
          pad.press = true;
          lastJump = now;
        } else if (!P.grounded) pad.jump = true;
      }
      if (br.state === 'act' && br.move !== 'diveBomb' && Math.abs(P.x - b().x) < b().width / 2 + 20) tx = b().x + Math.sign(P.x - b().x || 1) * (b().width / 2 + 60);
    } else if (!open && o.stance === 'chimes') {
      lastMark = null;
      tx = A().left + CHIMES_DX;
    } else if (!open) {
      lastMark = null;
      const q = [...stand].sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
      if (q) tx = q.x + (b().x >= q.x ? 60 : -60) + (rnd() - 0.5) * 10;
      else if (Math.abs(P.x - b().x) < 260) tx = b().x + Math.sign(P.x - b().x || 1) * 300;
    }
    // falling stones: out from under them
    for (const h of e.hazards ?? []) if (h.kind === 'drop' && Math.abs(tx - h.x) < h.w / 2 + 30) tx = h.x + Math.sign(P.x - h.x || 1) * (h.w / 2 + 45);
    // the storm at the edges
    tx = Math.max(A().left + (b().phase >= 3 ? 195 : 30), Math.min(A().right - (b().phase >= 3 ? 195 : 30), tx));
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
          hopping = q.h;
        }
      }
      // (a whole rock is taller than one jump: the second jump on the way up)
      if (!P.grounded && hopping > 100 && up < hopping + 10 && (P.jumpsLeft ?? 0) > 0 && now - lastJump > 0.2 && now - lastJump < 0.5) {
        pad.press = true;
        hopping = 0;
      }
      if (P.grounded && now - lastJump > 0.2) hopping = 0;
      if (!P.grounded && now - lastJump < 0.6) pad.jump = true;
    }
    seedDice();
    const before = sources();
    frame(pad);
    const after = sources();
    // (a feather that hit him is used up in that frame: the one by him that just went)
    for (const h of e.hazards ?? []) if (h.kind === 'bolt' && (h.spent || h.life <= 0) && !spentSeen.has(h.id) && Math.abs(h.x - p().x) < 60) {
      spentSeen.add(h.id);
      after.push({ what: `bolt/${h.look}`, warn: h.maxLife - h.life + 0.85 });
    }
    if (e.lives < lastLives) hurtAt = e.gameTime;
    // (a hit is the heart it costs; the life lost after the last heart is that same hit)
    if (p().hp < lastHp && e.lives === lastLives) {
      hurts++;
      hurtAt = e.gameTime;
      // what hit him, and how long he could have seen it coming
      const all = [...before, ...after];
      const warned = all.length ? Math.max(...all.map((x) => x.warn)) : -1;
      hits.push({ t: e.gameTime, what: all.map((x) => x.what).join(' + ') || `nothing seen (${b().ai!.state} ${b().ai!.move} ${b().ai!.t.toFixed(2)} ${Math.round(p().x - b().x)} ${(e.hazards ?? []).map((h: { kind: string; look: string; x: number; y: number; life: number }) => `${h.kind}/${h.look}@${Math.round(h.x - p().x)},${Math.round(h.y - p().y)} life ${h.life.toFixed(2)}`).join(' ')})`, warn: warned });
    }
    lastHp = p().hp;
    lastLives = e.lives;
  }
  if (cur) openings.push({ ...cur, cut: true });
  return { hits, won: won || out.won || !!b().defeated || b().ai?.state === 'dying', t: e.gameTime - t0, openings, hurts, longest, lives: e.lives, hp: b().hp, maxHp: b().maxHp };
}

const LAND = { w: 844, h: 390 };
const PORT = { w: 400, h: 720 };

test('in the real engine every opening stays open for the reach from where he stood, plus 0.8 s to see it and 0.6 s to hit, after a wind-up', (t) => {
  const all: Opening[] = [];
  let dodged = 0;
  const allHits: Array<{ t: number; what: string; warn: number }> = [];
  // every phase, several fights each (her moves are dice rolls: different fights put him in different places)
  // (and from where a real player waits: by a rock to lure her, behind the far side of a rock, or back at the chimes; upright and sideways)
  const runs: Array<[number, number, Stance, { w: number; h: number }]> = [];
  const n = Number(process.env.SOV_FIGHTS ?? 12);
  const stances: Stance[] = ['lure', 'rock', 'chimes'];
  for (let k = 0; k < n; k++) for (const share of [1, 0.6, 0.3]) runs.push([share, 1 + k * 3 + Math.round(share * 10), stances[k % 3], k % 2 ? PORT : LAND]);
  for (const [share, seed, stance, screen] of runs) {
    const r = fight({ screen, hit: false, hpShare: share, seconds: 75, seed, stance });
    all.push(...r.openings.filter((x) => !x.cut));
    dodged += r.openings.filter((x) => !x.cut && !x.hit).length;
    allHits.push(...r.hits);
  }
  const kinds = new Map<string, { n: number; open: number; need: number }>();
  for (const x of all) {
    const k = kinds.get(x.move) ?? { n: 0, open: Infinity, need: 0 };
    k.n++;
    k.open = Math.min(k.open, x.dur);
    if (!x.hit) k.need = Math.max(k.need, openingNeeds(x.reach));
    kinds.set(x.move, k);
  }
  for (const [k, w] of kinds) t.diagnostic(`${k}: ${w.n} times, open at least ${w.open.toFixed(2)} s, needs at most ${w.need.toFixed(2)} s`);
  // every kind of opening came up
  for (const m of ['diveBomb:slam', 'featherVolley', 'talonRake', 'screech', 'skySweep', 'snatch', 'wingGust']) assert.ok(all.some((x) => x.move === m && !x.hit), `${m} came up after he dodged it (${[...kinds.keys()].join(', ')})`);
  // Matt's rule is about where he stands once he has dodged what opened it. A move that hit him knocked him back (or he stood up again
  // at the flag), so that opening is not one he was in place for; those are few, and are left out of the timing
  const hitBy = all.filter((x) => x.hit);
  t.diagnostic(`${all.length} openings, ${hitBy.length} after a move that hit him (${[...new Set(hitBy.map((x) => x.move))].map((m) => `${m} ${hitBy.filter((x) => x.move === m).length}`).join(", ")})`);
  assert.equal(dodged, all.length - hitBy.length);
  // every hit he took came with a warning he could read for 0.6 s or more (QA, 2026-10-26)
  const unwarned = allHits.filter((h) => h.warn < 0.6);
  const kindsHit = new Map<string, number>();
  for (const h of allHits) kindsHit.set(h.what.replace(/\(.*?\)/g, '').trim(), (kindsHit.get(h.what.replace(/\(.*?\)/g, '').trim()) ?? 0) + 1);
  t.diagnostic(`${allHits.length} hits: ${[...kindsHit].map(([k, n]) => `${k} ${n}`).join(', ')}`);
  for (const h of unwarned.slice(0, 10)) t.diagnostic(`UNWARNED at ${h.t.toFixed(1)}: ${h.what}, ${h.warn.toFixed(2)} s`);
  assert.equal(unwarned.length, 0, `${unwarned.length} hits with under 0.6 s of warning`);
  const bad = all.filter((x) => !x.hit && !(x.dur + DT >= openingNeeds(x.reach)));
  for (const x of bad.slice(0, 12)) t.diagnostic(`SHORT ${x.hit ? '(he was hit) ' : ''}${x.move} at ${x.t0.toFixed(1)}: open ${x.dur.toFixed(2)} needs ${openingNeeds(x.reach).toFixed(2)}, he ${Math.round(x.px)} (${Math.round(x.up)} up), she ${Math.round(x.bx)}`);
  assert.ok(hitBy.length <= all.length * 0.1, `${hitBy.length} of ${all.length} openings came after a move that hit him`);
  for (const x of all.filter((o) => !o.hit)) {
    assert.ok(Number.isFinite(x.reach), `${x.move} at ${x.t0.toFixed(1)} s: he could get to it at all (from ${Math.round(x.px)}, ${Math.round(x.up)} up)`);
    assert.ok(x.dur + DT >= openingNeeds(x.reach), `${x.move} at ${x.t0.toFixed(1)} s: open ${x.dur.toFixed(2)} s, needs ${openingNeeds(x.reach).toFixed(2)} s (he was at ${Math.round(x.px)}, ${Math.round(x.up)} up; she at ${Math.round(x.bx)})`);
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

test('in the real engine her hoarse head after a screech can be hit from the ground with a hop, from either side, upright and sideways', (t) => {
  for (const [name, screen] of [['landscape', LAND], ['portrait', PORT]] as const) {
    for (const side of [-1, 1] as const) {
      const { e, frame } = makeGame(screen);
      for (let i = 0; (e.entrance || !e.entranceDone) && i < 30 * 40; i++) frame({});
      const A = e.currentStage.arena as { left: number; right: number; floor: number };
      const b = e.boss as BossEntity;
      // she screeches from the open floor between the middle rock and the right one, at him
      e.bossDef.opener = 'screech';
      b.ai!.recent = [];
      b.ai!.state = 'idle';
      b.ai!.idle = 0;
      b.x = A.left + 1030;
      e.player.x = b.x + side * 330;
      let n = 0;
      while (!((b.ai!.state as string) === 'rec' && b.ai!.move === 'screech' && b.ai!.t >= OPENING_RULE.react) && n++ < 30 * 8) frame({ down: true });
      assert.equal(b.ai!.move, 'screech', `${name}: she screeched`);
      const hp0 = b.hp;
      // he sees it, runs at the glow, hops, and taps as the jab comes level with it
      let jumped = false;
      let lastTap = -9;
      let taken = -1;
      for (let k = 0; k < 30 * 2.1 && weakOpen(b, e.bossDef); k++) {
        const r = weakRect(b, e.bossDef, A.floor)!;
        const cx = r.x + r.w / 2;
        const P = e.player as PlayerState;
        const tx = cx + (P.x <= cx ? -30 : 30);
        const pad: Pad = {};
        if (Math.abs(tx - P.x) > 8) pad[tx > P.x ? 'right' : 'left'] = true;
        const near = Math.abs(P.x - cx) < r.w / 2 + 40;
        const up = A.floor - P.y;
        if (near && P.grounded && !jumped) {
          pad.press = true;
          jumped = true;
        } else if (!P.grounded) pad.jump = true;
        if (near && up + 54 > A.floor - (r.y + r.h) && up + 8 < A.floor - r.y && e.gameTime - lastTap > 0.25) {
          pad.punch = true;
          lastTap = e.gameTime;
        }
        if (P.grounded && jumped && k % 20 === 0) jumped = false;
        frame(pad);
        if (b.hp < hp0 && taken < 0) taken = k * DT;
      }
      const r = weakRect(b, e.bossDef, A.floor)!;
      t.diagnostic(`${name}, from the ${side > 0 ? 'right' : 'left'}: head ${Math.round(A.floor - (r.y + r.h))}..${Math.round(A.floor - r.y)} up, ${taken >= 0 ? `hit ${taken.toFixed(2)} s after setting off` : 'not hit'}`);
      assert.ok(b.hp < hp0, `${name}, from the ${side > 0 ? 'right' : 'left'}: a hop and a jab land on her head`);
    }
  }
});

test("in the real engine Dot's fight line goes when the next attack begins or a life is lost, upright and sideways", () => {
  for (const screen of [LAND, PORT]) {
    // (a new player: Dot's fight lines are said once per device)
    localStorage.clear();
    let line = '';
    let said = 0;
    const { e, frame } = makeGame(screen, (text) => {
      line = text;
      said++;
    });
    for (let i = 0; (e.entrance || !e.entranceDone) && i < 30 * 40; i++) frame({});
    const b = e.boss as BossEntity;
    let prev = b.ai!.state;
    let lines = 0;
    let lives = e.lives;
    let lostAt = -1;
    // he stands still in the open: lines come (each move's first time), and so do hits and lost lives
    for (let k = 0; k < 30 * 90 && e.lives > 0 && b.ai!.state !== 'dying'; k++) {
      const n0 = said;
      const fromFight = line !== '' && e.bossGuideUp;
      frame({});
      if (said > n0 && line) lines++;
      // a new attack began: the line from before it is down (unless this attack brought its own)
      if (b.ai!.state === 'tell' && prev !== 'tell' && fromFight && said === n0) assert.fail(`"${line}" is still up as ${b.ai!.move} begins`);
      if (e.lives < lives) lostAt = k;
      if (lostAt === k && fromFight) assert.equal(line, '', 'a lost life takes her line down');
      lives = e.lives;
      prev = b.ai!.state;
    }
    assert.ok(lines >= 3, `${lines} lines`);
  }
});
