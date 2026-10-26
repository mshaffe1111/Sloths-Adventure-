/**
 * Meeca's stage (5-M): the rules of the run on their own (meecaPlay.ts), with a stand-in for the engine: a guard never turns round
 * while he is not in full view (his ring waits, full), his turn is the tell before any look, she cannot fight, the line carries her,
 * and the carving keeps what was cut.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MeecaPlay, type MeecaControls, type MeecaView } from './meecaPlay.ts';
import { buildMeecaStage, carveSeconds, MARCH, MEECA_G, TELL } from './meecaStage.ts';
import type { PlayerState } from './types.ts';

const DT = 1 / 30;
function rig(view: MeecaView) {
  const st = buildMeecaStage(1);
  const player = { x: st.spawn.x, y: MEECA_G, vx: 0, vy: 0, grounded: true, climbing: false, ducking: false, facing: 1, hp: 3, maxHp: 3, walkCycle: 0 } as unknown as PlayerState;
  let won = 0;
  const host = { stageId: 'test-5-M', view, player, win: () => void won++ };
  const mc = new MeecaPlay(st, host);
  const controls = (c: Partial<MeecaControls> = {}): MeecaControls => ({ left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false, megaPunchPressed: false, ...c });
  const frame = (c: Partial<MeecaControls> = {}) => {
    const s = controls(c);
    mc.filter(s);
    mc.after();
    mc.step(DT);
    return s;
  };
  return { st, mc, player, host, frame, won: () => won };
}

test('5-M rules: the card waits for a tap; she cannot punch, kick or mega; in line the column carries her', () => {
  const { mc, frame, player, st } = rig({ x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 });
  for (let i = 0; i < 60; i++) frame();
  assert.equal(mc.phase, 'card');
  const s = frame({ punchPressed: true });
  assert.equal(mc.phase, 'play');
  assert.ok(!s.punchPressed && !s.kickPressed && !s.megaPunchPressed);
  const k = frame({ kickPressed: true, megaPunchPressed: true });
  assert.ok(!k.kickPressed && !k.megaPunchPressed, 'no fighting');
  // the opening carving: two characters, held
  for (let i = 0; i < 40; i++) frame({ hold: true });
  assert.equal(mc.done, 1);
  // into her place: the line carries her at its pace
  mc.inLine = true;
  mc.everInLine = true;
  const x0 = mc.slotX;
  for (let i = 0; i < 30; i++) frame();
  assert.ok(Math.abs(player.x - mc.slotX) <= MARCH * DT + 1e-6, 'in her place, a step behind the column\'s own step this frame');
  assert.ok(Math.abs(mc.slotX - x0 - MARCH) < 3, 'a second of marching');
  // a slide back takes her out of line; a slide forward does not
  frame({ right: true });
  assert.ok(mc.inLine);
  frame({ left: true });
  assert.ok(!mc.inLine);
  void st;
});

test('5-M rules: a guard out of full view never turns round (his ring waits, full); in view, his turn is the tell before a look', () => {
  const view: MeecaView = { x0: -1e9, x1: 0, y0: -1e9, y1: 1e9 };
  const { mc, frame, player } = rig(view);
  for (let i = 0; i < 30; i++) frame();
  frame({ punchPressed: true });
  for (let i = 0; i < 40; i++) frame({ hold: true });
  mc.inLine = true;
  mc.everInLine = true;
  for (let i = 0; i < 30 * 30; i++) frame();
  const w = mc.watchOf(mc.pell)!;
  assert.equal(w.ph, 'away');
  assert.equal(w.k, 1, 'his ring is full, and he waits');
  assert.equal(mc.looks.length, 0);
  // now in full view: the turn comes first, TELL long, then the look; out of line and in sight, she is caught at the look, not before
  Object.assign(view, { x0: -1e9, x1: 1e9 });
  mc.inLine = false;
  player.x = mc.slotX - 200;
  let turnAt = -1;
  for (let i = 0; i < 4 * 30 && mc.phase === 'play'; i++) {
    frame();
    if (turnAt < 0 && mc.watchOf(mc.pell)?.ph === 'turn') turnAt = mc.t;
  }
  assert.ok(turnAt > 0, 'he turned');
  assert.equal(mc.phase, 'caught');
  assert.ok(mc.catches[0].t - turnAt >= TELL - 2 * DT, `the tell lasted ${(mc.catches[0].t - turnAt).toFixed(2)} s`);
  assert.ok(TELL >= 0.6);
  // walked back into line, no heart lost
  for (let i = 0; i < 12 * 30 && mc.phase === 'caught'; i++) frame();
  assert.equal(mc.phase, 'play');
  assert.ok(mc.inLine);
  assert.equal(player.hp, 3);
});

test('5-M rules: what is cut stays cut; a letter at a time; the meter counts characters', () => {
  const { mc, frame, player, st } = rig({ x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 });
  for (let i = 0; i < 30; i++) frame();
  frame({ punchPressed: true });
  for (let i = 0; i < 40; i++) frame({ hold: true });
  const tr = st.trunks[1];
  player.x = tr.standX;
  mc.slotX = tr.x + tr.haltPast;
  mc.everInLine = true;
  for (let i = 0; i < 15; i++) frame({ hold: true });
  const part = mc.cutChars(1);
  assert.ok(part > 1 && part < 3, `${part.toFixed(2)} characters`);
  // let go: nothing more is cut, and nothing is lost
  for (let i = 0; i < 30; i++) frame();
  assert.equal(mc.cutChars(1), part);
  for (let i = 0; i < Math.ceil(carveSeconds(tr.lines) * 30) + 2; i++) frame({ hold: true });
  assert.equal(mc.done, 2);
});
