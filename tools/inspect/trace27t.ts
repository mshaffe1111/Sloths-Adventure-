// ENG-27t scratch: a race-leg fall that still pays under the hold: every frame from 40 before the life is lost to 60 after he is back
import '../../src/game/headlessDom.ts';
import { homeRun } from './homeToys.ts';
import { SKILLS } from './firsttimer.ts';
import { HOME_CODE, POST_CODE } from '../../src/game/gen2/toyHome.ts';
import { pacerMargin } from '../../src/game/pacer.ts';
const [bot, which, setting, seedS, fx] = process.argv.slice(2);
if (bot === 'ride') Object.assign(SKILLS, { race: false, rideOnly: true });
const rows: string[] = [];
let piece: any, lives: number | undefined, f = 0, fellAt = -1;
homeRun(bot === 'expert' ? 'expert' : 'middle', setting as never, Number(seedS), 1, { onFrame: (sim: any) => {
  f++; const e = sim.e, p = e.player;
  piece ??= e.pieces.find((q: any) => q.kind === 'pacer');
  if (!piece) return;
  const m = piece.clock === null ? null : pacerMargin(piece.pacer, p.x, piece.clock + piece.owed);
  const near = Math.abs(p.x - Number(fx)) < 700;
  if (lives !== undefined && e.lives < lives) { fellAt = f; rows.push(`--- LIFE LOST frame ${f} x ${p.x.toFixed(0)}`); }
  if (near || (fellAt > 0 && f - fellAt < 200))
    rows.push(`${f} x ${p.x.toFixed(0)} y ${p.y.toFixed(0)} g ${p.grounded ? 1 : 0} down ${e.down ? 1 : 0} lives ${e.lives} clock ${piece.clock?.toFixed(2)} owed ${piece.owed.toFixed(2)} m ${m?.toFixed(2)} holds ${JSON.stringify(piece.holds.map((h: any) => [Math.round(h.x), +h.m.toFixed(2)]))} v ${piece.verdict ? 1 : 0}`);
  lives = e.lives;
} } as never, which === 'post' ? POST_CODE : HOME_CODE);
console.log(rows.join('\n'));
