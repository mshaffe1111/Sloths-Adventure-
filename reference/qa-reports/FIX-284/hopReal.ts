// FIX-284 probe: Pokey's tap hop and held jump on flat ground, the real engine at 30 fps, through FakeInput (hopAir.ts's way) and through
// the game's InputEngine (RealPlay.useRealInput: the touch layer's press with its minimum hold); and a chain of tap hops (the pond pace).
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import type { Platform } from '../../../src/game/types.ts';
const FLOOR = 400;
function make(real: boolean | number) {
  const r = new RealPlay('1-3', 1);
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 20000, height: 200, type: 'solid' } as Platform]);
  r.stand(600, FLOOR);
  if (real === true) r.useRealInput(); else if (typeof real === 'number') r.useRealInput(real);
  for (let i = 0; i < 10; i++) r.frame();
  return r;
}
for (const real of [false, true, 80] as const) for (const [name, hold] of [['tap hop', 1], ['held jump', 30]] as const) for (const run of [false, true]) {
  const r = make(real);
  if (run) for (let i = 0; i < 40; i++) r.frame({ right: true });
  const x0 = r.p.x; let f = 0, top = r.p.y, left = -1;
  r.frame({ press: true, jump: hold > 1, right: run }); f++;
  for (; f < 120; f++) {
    if (left < 0 && !r.p.grounded) left = f;
    if (left >= 0 && r.p.grounded) break;
    r.frame({ jump: f < hold, right: run }); top = Math.min(top, r.p.y);
  }
  console.log(`${real === 80 ? 'Pad button (PAD_HOP_MS 80)' : real ? 'InputEngine touch flick' : 'FakeInput'} ${name}${run ? ' at a run' : ' standing'}: press to landing ${f} frames (${(f / 30).toFixed(2)} s), left the ground frame ${left}, ${Math.round(r.p.x - x0)} px along, ${Math.round(FLOOR - top)} px up`);
}
// a chain: hop again the frame he lands, at a run, 6 hops; pace over the chain
for (const real of [false, true, 80] as const) {
  const r = make(real);
  for (let i = 0; i < 40; i++) r.frame({ right: true });
  const x0 = r.p.x; let f = 0, hops = 0, wasAir = false;
  r.frame({ press: true, right: true }); f++;
  while (hops < 6 && f < 600) {
    const g = r.p.grounded;
    if (wasAir && g) { hops++; if (hops < 6) { r.frame({ press: true, right: true }); f++; wasAir = false; continue; } else break; }
    if (!g) wasAir = true;
    r.frame({ right: true }); f++;
  }
  console.log(`${real === 80 ? 'Pad button (PAD_HOP_MS 80)' : real ? 'InputEngine touch flick' : 'FakeInput'} chain of ${hops} tap hops at a run: ${f} frames (${(f / 30).toFixed(2)} s), ${Math.round(r.p.x - x0)} px: ${Math.round((r.p.x - x0) / (f / 30))} px/s`);
}
