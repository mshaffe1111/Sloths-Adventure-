// Backdrop audit shots (hf-backdrops, 2026-10-31): every world in play, upright 390x844 and sideways 844x390, at the stage start
// and with Pokey placed 45% along. npx vite --port=4301 ... &  node tools/art/hfbackdrops/audit.mjs <out dir> [stage ...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [out, ...ids] = process.argv.slice(2);
const stages = ids.length ? ids : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((w) => [2, 5, 8].map((s) => `${w}-${s}`));
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h, tag] of [[390, 844, 'up'], [844, 390, 'side']].filter((o) => !process.env.ORIENT || o[2] === process.env.ORIENT)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${process.env.PORT ?? 4301}/?lessons=off`);
  await p.waitForTimeout(3000);
  for (const id of stages) {
    await p.evaluate((id) => window.__play(id), id);
    await p.waitForTimeout(7500);
    await p.screenshot({ path: `${out}/${id}-${tag}-a.png` });
    const ok = await p.evaluate(() => {
      const e = window.__engine?.(); if (!e?.platforms?.length) return false;
      const xs = e.platforms.map((q) => q.x + q.width); const end = Math.max(...xs);
      const x = end * 0.45;
      const top = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0]
        ?? e.platforms.sort((a, c) => Math.abs(a.x - x) - Math.abs(c.x - x))[0];
      Object.assign(e.player, { x: Math.max(top.x + 4, Math.min(x, top.x + top.width - 4)), y: top.y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      e.camCut = true; return true;
    }).catch(() => false);
    await p.waitForTimeout(1500);
    if (ok) await p.screenshot({ path: `${out}/${id}-${tag}-b.png` });
    console.log(id, tag, ok);
  }
  await p.close();
}
await b.close();
