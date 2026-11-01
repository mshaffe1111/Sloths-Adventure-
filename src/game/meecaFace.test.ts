/**
 * 5-M room 5 (2026-11-01): Meeca walked into the far wall (the bank face, from the pit under the dark steps) is drawn against it,
 * never half inside the dirt (meecaFaceDraw.ts). Her drawn frame's reach toward the face, plus the sideways shift she is drawn with,
 * stays on her side of the face's edge, upright and sideways, on Easy and Normal; and away from the wall she is drawn where she stands.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import { meecaPose } from './meecaArt.ts';
import { meecaReach } from './meecaFaceDraw.ts';
import { setDifficulty } from './difficulty.ts';
import type { Platform } from './types.ts';

function sim5(seed: number, w: number, h: number) {
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  sim.e.introT = 99;
  sim.e.applyZoom();
  new MeecaBot(sim).card();
  const e = sim.e as unknown as { mc: MeecaPlay; kit: KitPlay | null; platforms: Platform[]; meecaOff?: number; gameTime: number };
  return { sim, e };
}

for (const [diff, seed, w, h] of [['normal', 1, 448, 998], ['easy', 7, 844, 390], ['normal', 3, 844, 390], ['easy', 2, 448, 998]] as const) {
  test(`5-M room 5 (${diff}, seed ${seed}, ${w}x${h}): walked into the far wall she is drawn against the bank face, not inside it`, () => {
    setDifficulty(diff);
    try {
      const { sim, e } = sim5(seed, w, h);
      const st = e.mc.st;
      const bank = e.platforms.filter((q) => q.x > st.darkX0 && q.type === 'solid' && q.height > 400).sort((a, b) => a.x - b.x)[0];
      assert.ok(bank, 'the bank');
      const pit = e.platforms.filter((q) => Math.abs(q.x + q.width - bank.x) <= 1 && q.y > bank.y).sort((a, b) => b.y - a.y)[0];
      assert.ok(pit, 'the pit floor under the face');
      sim.stand(bank.x - 80, pit.y);
      for (let f = 0; f < 45; f++) sim.frame({ right: true });
      for (let f = 0; f < 30; f++) sim.frame();
      const p = sim.p;
      assert.ok(Math.abs(p.x + 19 - bank.x) <= 1, `she is flush against the face (x ${p.x.toFixed(1)}, face ${bank.x})`);
      assert.ok(p.facing > 0, 'facing it');
      const pose = meecaPose(p, e.mc, e.kit, e.gameTime);
      const reach = meecaReach(pose.sheet, pose.name);
      const off = e.meecaOff ?? 0;
      const edge = p.x + off + reach.front;
      assert.ok(edge <= bank.x + 1, `her picture reaches ${(edge - bank.x).toFixed(1)} px into the face (reach ${reach.front.toFixed(1)}, shift ${off.toFixed(1)})`);
      assert.ok(edge >= bank.x - 4, `and stands against it, not off it (${(bank.x - edge).toFixed(1)} px short)`);
      // back away from the wall: drawn where she stands again
      for (let f = 0; f < 30; f++) sim.frame({ left: true });
      for (let f = 0; f < 30; f++) sim.frame();
      assert.ok(Math.abs(e.meecaOff ?? 0) < 0.5, `away from the wall, no shift (${(e.meecaOff ?? 0).toFixed(2)})`);
    } finally {
      setDifficulty('normal');
    }
  });
}
