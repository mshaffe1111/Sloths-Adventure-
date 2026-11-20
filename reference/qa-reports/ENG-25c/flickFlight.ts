// npx tsx reference/qa-reports/ENG-25c/flickFlight.ts   (ENG-25c: the testers' straight-up flick from a stand on a snap stone, old lay vs new)
// The real engine at 30 fps (RealPlay) with the game's own InputEngine as a thumb drives it: Pokey stands still on an 80 px stone (every
// 2 px of the stone he can stand on), flicks straight up (a touch flick, held MIN_TOUCH_JUMP_HOLD_MS 220 ms, the thumb off at frame 2) and
// his steer right arrives `late` frames after the press (the bots' upOnlyT: 0.08-0.2 s, 2-6 frames). Where he lands: any floor ahead (the
// next stone, one past it, the far bank), the stone he left, or the water (below the floors). A full row: bank, three stones, far bank.
// Rows: ENG-25's lay (stones 34 px under the banks, 40 px of water) and ENG-25c's (level, 30 px), plus the two halves of the change alone.
// From the first stone (stone to stone) and from the last (up, or across, to the far bank). Output: flickFlight.txt.
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import type { Platform } from '../../../src/game/types.ts';

setDifficulty('normal');
const BANK = 800, W = 80;
const r = new RealPlay('2-5', 1);
const inp = new InputEngine();

type Lay = { name: string; drop: number; gap: number };
const LAYS: Lay[] = [
  { name: "ENG-25's lay (34 px under, 40 px water)", drop: 34, gap: 40 },
  { name: 'level, 40 px water', drop: 0, gap: 40 },
  { name: '34 px under, 30 px water', drop: 34, gap: 30 },
  { name: "ENG-25c's lay (level, 30 px water)", drop: 0, gap: 30 },
];

/** one flick from a stand at `sx` (a centre x) on stone `from` (0..2) of a full row: the near bank, three stones, the far bank (top BANK) */
function flick(lay: Lay, from: number, sx: number, late: number): 'ahead' | 'back' | 'water' | 'none' {
  const top = BANK + lay.drop;
  const x0 = 2000;
  const sxs = [0, 1, 2].map((i) => x0 + lay.gap + i * (W + lay.gap));
  const farX = x0 + lay.gap + 3 * (W + lay.gap);
  const pl: Platform[] = [
    { id: 1, x: 0, y: BANK, width: x0, height: 300, type: 'solid' } as Platform,
    ...sxs.map((x, i) => ({ id: 10 + i, x, y: top, width: W, height: 40, type: 'solid' }) as Platform),
    { id: 2, x: farX, y: BANK, width: 3000, height: 300, type: 'solid' } as Platform,
  ];
  r.bare(pl);
  r.stand(sxs[from] + sx, top);
  inp.clearAll();
  inp.source = 'gesture';
  r.e.input = inp;
  for (let i = 0; i < 4; i++) r.e.update(DT);
  if (!r.p.grounded || r.standingOn !== 10 + from) return 'none';
  inp.triggerTouchUp(0, 220);
  for (let f = 0; f < 90; f++) {
    if (f === 2) inp.releaseTouchUp();
    if (f === late) inp.triggerTouchMove('right');
    r.e.update(DT);
    if (f > 2 && r.p.grounded) {
      const on = r.standingOn;
      return on === 10 + from ? 'back' : on === 2 || (on >= 10 + from + 1 && on <= 12) ? 'ahead' : 'none';
    }
    if (r.p.y > top + 60) return 'water';
  }
  return 'none';
}

const out: string[] = [];
for (const from of [0, 2]) {
  out.push(from === 0 ? 'from the first stone (stone to stone)' : '\nfrom the last stone (to the far bank)');
  for (const lay of LAYS) {
    const parts: string[] = [];
    let tot = { ahead: 0, water: 0, back: 0, n: 0 };
    for (const late of [2, 3, 4, 5, 6]) {
      const c = { ahead: 0, water: 0, back: 0, n: 0 };
      for (let sx = -30; sx <= W + 30; sx += 2) {
        const res = flick(lay, from, sx, late);
        if (res === 'none') continue;
        c.n++;
        c[res]++;
      }
      parts.push(`late ${late}: ${c.ahead}/${c.n} ahead, ${c.water} water, ${c.back} back`);
      tot = { ahead: tot.ahead + c.ahead, water: tot.water + c.water, back: tot.back + c.back, n: tot.n + c.n };
    }
    out.push(`  ${lay.name}: ${tot.ahead}/${tot.n} landed ahead (${Math.round((100 * tot.ahead) / tot.n)}%), ${tot.water} into the water, ${tot.back} back on the stone | ${parts.join(' | ')}`);
  }
}
console.log(out.join('\n'));
