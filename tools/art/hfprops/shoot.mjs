// hf-props: in-play stills of a stage at phone size, upright (390x844) and sideways (844x390) at dpr 2, Pokey set down at fractions
// of the run (on the platform under him), hurt-proof and frozen in place.
//   node tools/art/hfprops/shoot.mjs <port> <outDir> <stage> [layout] [fractions, e.g. 0.2,0.5,0.8]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, layout, fr] = process.argv.slice(2);
const fracs = (fr ?? '0.25,0.5,0.75').split(',').map(Number);
const b = await chromium.launch();
const eng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
  await p.waitForTimeout(800);
  await p.evaluate(([id, l]) => window.__play(id, l === undefined || l === '' ? undefined : +l), [stage, layout]);
  await p.waitForTimeout(5000);
  for (const f of fracs) {
    const r = await p.evaluate(([f, src]) => {
      const e = (0, eval)(src)();
      const ps = e.platforms.filter((q) => q.type === 'solid' || q.type === undefined);
      const xs = e.platforms.map((q) => q.x + q.width);
      const end = Math.max(...xs);
      const tx = end * f;
      const under = ps.filter((q) => q.x < tx && q.x + q.width > tx).sort((a, b) => a.y - b.y);
      const pl = e.player;
      if (under.length) { pl.x = tx; pl.y = under[under.length - 1].y - pl.height; for (const q of under) if (q.y > 200) { pl.y = q.y - pl.height; break; } }
      else { pl.x = tx; }
      pl.vx = 0; pl.vy = 0; pl.invincibleTimer = 999;
      return `${Math.round(tx)}/${Math.round(end)}`;
    }, [f, `(${eng.toString()})`]);
    for (let i = 0; i < 7; i++) {
      await p.waitForTimeout(250);
      await p.evaluate((src) => { const e = (0, eval)(src)(); e.player.invincibleTimer = 999; e.player.vx = 0; }, `(${eng.toString()})`);
    }
    await p.evaluate((src) => { (0, eval)(src)().player.invincibleTimer = 0; }, `(${eng.toString()})`);
    await p.waitForTimeout(100);
    const file = `${out}/${stage}-${tag}-${Math.round(f * 100)}.jpg`;
    await p.screenshot({ path: file, type: 'jpeg', quality: 70 });
    console.log(file, r);
  }
  await p.close();
}
await b.close();
