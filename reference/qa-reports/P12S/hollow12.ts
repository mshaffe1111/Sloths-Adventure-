/**
 * P12S, the measuring tool tested first (D15): drop Pokey into 1-2's first thorn hollow in the real engine on each setting and read what
 * it costs (Normal: a heart, the hurt floor; Easy: soft, back to the ledge, no heart), and what the first-timer bot's harm hook records.
 *   npx tsx reference/qa-reports/P12S/hollow12.ts
 */
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
for (const d of ['normal', 'easy'] as const) {
  setDifficulty(d);
  const r = new RealPlay('1-2', 1);
  const z = (r.stage as any).heartFalls?.[0];
  const hp0 = (r.p as any).hp, lives0 = (r.e as any).lives;
  let hits = 0;
  const dp = (r.e as any).damagePlayer.bind(r.e);
  (r.e as any).damagePlayer = (a: number, fx?: number) => { hits++; dp(a, fx); };
  // (on the ledge the hollow opens off, a step back from its lip, as a player stands; then he walks off it)
  const ledge = r.platforms.find((q: any) => q.type === 'solid' && q.pit !== 'hurt' && Math.abs(q.x + q.width - z.x0) < 4)!;
  r.stand(ledge.x + ledge.width - 40, ledge.y);
  for (let i = 0; i < 15; i++) r.frame({});
  let minY = 0;
  for (let i = 0; i < 90; i++) { r.frame({ right: i < 8 }); minY = Math.max(minY, r.p.y); }
  const walk = `walked off: feet to y ${Math.round(minY)} at x ${Math.round(r.p.x)} (width ${(r.p as any).width})`;
  // (and dropped dead centre in it from the ledge's height, after standing on the ledge: the way a short hop falls in)
  r.stand(ledge.x + ledge.width - 40, ledge.y);
  for (let i = 0; i < 15; i++) r.frame({});
  r.fly(Math.round((z.x0 + z.x1) / 2 - (r.p as any).width / 2), ledge.y - 10, 0, 0, 0);
  for (let i = 0; i < 90; i++) { r.frame({}); minY = Math.max(minY, r.p.y); }
  console.log(walk);
  console.log(`${d}: hollow ${z.x0}..${z.x1} hurt line y ${z.y} soft ${!!z.soft}; fell to y ${Math.round(minY)}; hp ${hp0} -> ${(r.p as any).hp}, lives ${lives0} -> ${(r.e as any).lives}, damagePlayer calls ${hits}; now at x ${Math.round(r.p.x)}`);
}
