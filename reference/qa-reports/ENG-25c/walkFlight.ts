// npx tsx reference/qa-reports/ENG-25c/walkFlight.ts   (ENG-25c: can he WALK across a snap row with no hop? The real engine at 30 fps with the game's
// InputEngine: steer right held, never a jump, from a stand at the bank's lip and from a run; three 80 px stones, the far bank; level or 34 px under)
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import type { Platform } from '../../../src/game/types.ts';
const r = new RealPlay('2-5', 1);
const inp = new InputEngine();
for (const [g, drop] of [[40, 34], [30, 34], [30, 0], [40, 0], [44, 0], [50, 0], [56, 0], [60, 0], [70, 0]] as const) {
  for (const startV of ['stand', 'run']) {
    const pl: Platform[] = [{ id: 1, x: 0, y: 800, width: 2000, height: 300, type: 'solid' } as Platform];
    for (let i = 0; i < 3; i++) pl.push({ id: 10 + i, x: 2000 + g + i * (80 + g), y: 800 + drop, width: 80, height: 40, type: 'solid' } as Platform);
    pl.push({ id: 2, x: 2000 + g + 3 * (80 + g), y: 800, width: 3000, height: 300, type: 'solid' } as Platform);
    r.bare(pl);
    r.stand(startV === 'stand' ? 1990 : 1700, 800);
    inp.clearAll(); inp.source = 'gesture'; r.e.input = inp;
    inp.triggerTouchMove('right');
    let fell = false;
    for (let f = 0; f < 120; f++) { r.e.update(DT); if (r.p.y > 830 + drop) { fell = true; break; } }
    console.log(`gap ${g} drop ${drop}, walking right from a ${startV}, no jump: ${fell ? `falls in at x ${r.p.x.toFixed(0)}` : `crosses dry to x ${r.p.x.toFixed(0)} (far bank at ${2000 + g + 3 * (80 + g)})`}`);
  }
}
