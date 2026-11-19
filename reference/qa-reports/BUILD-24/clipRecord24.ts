// npx tsx reference/qa-reports/BUILD-24/clipRecord24.ts <setting> <variant> <river k,k,...> <out.json>: a tier bot's run over 2-4 (its n-th
// proven seed, layout 1 = the list's first), the engine at 30 fps through the game's own InputEngine (realInput), every frame while he is at
// the chosen log rivers (river index in order: 0 = beat 1's first drop, 3 = beat 4's catch) recorded with Pokey, the clocks and the logs,
// for clip24.mjs to draw on the real page (2-4 built natively there). From ENG-24's clipRecord.ts (relative imports, D83).
import '../../../src/game/headlessDom.ts';
import fs from 'node:fs';
import { runTier } from '../../../tools/inspect/tierBots.ts';
const [setting = 'normal', variant = '1', which = '0,3', out = 'rec24.json', tier = 'middle'] = process.argv.slice(2);
const ks = which.split(',').map(Number);
const frames: unknown[] = [];
const keep = ['x', 'y', 'vx', 'vy', 'width', 'height', 'grounded', 'facing', 'isVineSwinging', 'swingAngle', 'swingAngularVelocity', 'swingLength', 'swingVineId', 'climbing', 'hanging', 'jumpsLeft', 'isDoubleJumping', 'somersaultAngle', 'squashX', 'squashY'];
let at: Array<{ x0: number; x1: number }> = [];
const r = runTier(tier as never, setting as 'normal' | 'easy', Number(variant), '2-4', {
  realInput: true,
  onFrame: (sim: { e: unknown }) => {
    const e = sim.e as Record<string, any>;
    if (!at.length) at = (e.currentStage.rivers ?? []).filter((q: { speed: number }) => q.speed > 0).sort((a: { x0: number }, b: { x0: number }) => a.x0 - b.x0);
    const p = e.player;
    const k = ks.find((i) => at[i] && p.x >= at[i].x0 - 420 && p.x <= at[i].x1 + 260);
    if (k === undefined) return;
    frames.push({ k, t: e.gameTime, vc: e.vineClock, p: Object.fromEntries(keep.map((q) => [q, p[q]])), logs: e.platforms.filter((q: { type: string }) => q.type === 'drift').map((q: { id: number; x: number; y: number }) => [q.id, q.x, q.y]), on: e.standingOnId, lives: e.lives });
  },
} as never) as unknown as { end: string; lives: number; ontoLog?: number; fromLog?: number; finishSeconds?: number };
fs.writeFileSync(out, JSON.stringify({ setting, variant: Number(variant), tier, rivers: ks, frames }));
console.log(`2-4 ${tier} ${setting} v${variant}: ${frames.length} frames; end ${r.end}, lives ${r.lives}, ontoLog ${r.ontoLog} fromLog ${r.fromLog}, ${r.finishSeconds} s`);
