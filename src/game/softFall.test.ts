// Easy's soft fall (engine.ts softFall, the red team's F10 on gen2 1-1 Roll A Easy): planted as a toy stage in the real engine.
// He walks off a ledge, lands on a narrow catch log 110 px below it (under 400 px, a fall of more than 100 px), walks off that into the
// pit: he is set back on the LEDGE, clear of its edge, never on the catch log, from which the way on (200 px up) is out of reach.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import type { Platform } from './types.ts';

const P = (id: number, x: number, y: number, width: number, height = 24, style: Platform['style'] = 'log'): Platform => ({ id, x, y, width, height, type: 'solid', style });

test('a soft fall off a catch log reached by falling sets him back on the ledge he fell from, clear of its edge (planted)', () => {
  setDifficulty('easy');
  const r = new RealPlay('1-1', 1);
  const e = (r as unknown as { e: { platforms: Platform[]; enemies: unknown[]; softAt: unknown; collectibles: unknown[] } }).e;
  const ledge = P(9001, 200, 600, 600, 300, 'moss_stone');
  const catchLog = P(9002, 860, 710, 200);
  const wayOn = P(9003, 1180, 510, 400);
  e.platforms.splice(0, e.platforms.length, ledge, catchLog, wayOn);
  e.enemies.splice(0, e.enemies.length);
  e.softAt = null;
  r.stand(700, ledge.y);
  for (let i = 0; i < 10; i++) r.frame({});
  // walk right: off the ledge, onto the catch log, off it into the pit, and the soft fall
  let onCatch = false, back: { x: number; y: number } | null = null;
  for (let i = 0; i < 30 * 8 && !back; i++) {
    const wasY = r.p.y;
    r.frame({ right: true });
    if (r.standingOn === catchLog.id) onCatch = true;
    if (onCatch && r.p.y < wasY - 150) back = { x: r.p.x, y: r.p.y };
  }
  assert.ok(onCatch, 'he landed on the catch log first');
  assert.ok(back, 'a soft fall set him back');
  assert.ok(back!.y < catchLog.y - 60, `set back on the ledge (y ${Math.round(back!.y)}), not the catch log (y ${catchLog.y})`);
  assert.ok(back!.x >= ledge.x && back!.x <= ledge.x + ledge.width - 140, `clear of the ledge's edge (x ${Math.round(back!.x)})`);
  setDifficulty('normal');
});

// a soft heartFalls zone (gen2's level double-gap blocks, the planner's spec): a fall there puts him back on the take-off, no heart lost.
// Planted: the same zone without `soft` costs a heart
for (const soft of [true, false]) {
  test(`a fall at a ${soft ? 'soft' : 'plain (planted)'} heartFalls zone on Normal: ${soft ? 'back on the take-off, no heart lost' : 'a heart lost'}`, () => {
    setDifficulty('normal');
    const r = new RealPlay('1-1', 1);
    const e = (r as unknown as { e: { platforms: Platform[]; enemies: unknown[]; softAt: unknown; softOn: boolean; currentStage: { heartFalls?: unknown } } }).e;
    const ledge = P(9001, 200, 600, 600, 300, 'moss_stone');
    const bank = P(9002, 1100, 600, 600, 300, 'moss_stone');
    e.platforms.splice(0, e.platforms.length, ledge, bank);
    e.enemies.splice(0, e.enemies.length);
    e.currentStage.heartFalls = [{ x0: 800, x1: 1100, ...(soft ? { soft: true } : {}) }];
    e.softAt = null;
    r.stand(600, ledge.y);
    for (let i = 0; i < 10; i++) r.frame({});
    const hp = r.p.hp;
    let fell = false, back: { x: number; y: number } | null = null;
    for (let i = 0; i < 30 * 8 && !back; i++) {
      const wasY = r.p.y;
      r.frame({ right: !fell });
      if (r.p.y > ledge.y + 200) fell = true;
      if (fell && r.p.y < wasY - 150) back = { x: r.p.x, y: r.p.y };
    }
    assert.ok(fell && back, 'he fell into the gap and was set back');
    assert.ok(back!.x >= ledge.x && back!.x <= ledge.x + ledge.width && back!.y <= ledge.y, `on the take-off (${Math.round(back!.x)}, ${Math.round(back!.y)})`);
    assert.equal(r.p.hp, soft ? hp : hp - 1);
    assert.equal(e.softOn, false, 'Normal stays Normal: the soft put-back is for the zone only');
  });
}
