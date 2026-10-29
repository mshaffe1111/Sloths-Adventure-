// node bossshots.mjs <url> <outdir> <tag> [levels comma] [count] [views up,side]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [url, out, tag, lv = '1-10,2-10,3-10,4-10,5-10', cnt = '10', views = 'up,side', gap = '700'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const VP = { up: { width: 390, height: 844 }, side: { width: 844, height: 390 } };
const b = await chromium.launch();
for (const vn of views.split(',')) {
  for (const id of lv.split(',')) {
    const p = await b.newPage({ viewport: VP[vn], deviceScaleFactor: 1 });
    p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
    await p.goto(url);
    await p.waitForTimeout(2500);
    await p.evaluate((i) => window.__play(i), id);
    await p.waitForTimeout(5000);
    const n = Number(cnt);
    for (let i = 0; i < n; i++) {
      const s = await p.evaluate((frac) => {
        let e = window.__engine; if (typeof e === 'function') e = e();
        if (!e) return 'noengine';
        e.player.health = 5; e.player.invincibleTimer = 5;
        const bo = e.boss ?? e.bosses?.[0];
        if (bo && bo.hp > bo.maxHp * frac) bo.hp = Math.max(1, Math.round(bo.maxHp * frac));
        return bo ? `${bo.ai?.state} ${bo.ai?.move ?? ''} ph${bo.phase} hp${bo.hp}/${bo.maxHp}` : 'noboss';
      }, i < n / 2 ? 1 : 0.2);
      await p.screenshot({ path: `${out}/${tag}-${id}-${vn}-${String(i).padStart(2, "0")}.jpg`, quality: 82 });
      console.log(id, vn, i, s);
      await p.waitForTimeout(Number(gap));
    }
    await p.close();
  }
}
await b.close();
