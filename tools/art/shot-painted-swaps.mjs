// node tools/art/shot-painted-swaps.mjs <tag> [only]: the painted hazard swaps (3-1's spore mushrooms, 5-6's web patch and bridge,
// 4-3's pool log), upright and sideways, from the dev server on :4301 -> reference/prop-sheets/qa-notes/painted-swaps/<name>-<tag>-*.png
import { chromium } from 'playwright';
const tag = process.argv[2];
const out = new URL('../../reference/prop-sheets/qa-notes/painted-swaps/', import.meta.url).pathname;
const only = process.argv[3];
const jobs = [
  // [name, stage, find target {x,y} in the engine]
  ['spore', '3-1', `(() => { const z = e.currentStage.zones.find((z) => z.kind === 'spore' && z.emit); return { x: z.emit[0] + 60, y: z.baseY, z }; })()`],
  ['web-patch', '5-6', `(() => { const z = e.currentStage.zones.find((z) => z.kind === 'web' && z.bottom === z.baseY + 16); return z && { x: (z.x0 + z.x1) / 2 - 60, y: z.baseY }; })()`],
  ['web-bridge', '5-6', `(() => { const z = e.currentStage.zones.find((z) => z.kind === 'web' && z.bottom === z.baseY + 18); return z && { x: (z.x0 + z.x1) / 2 - 60, y: z.baseY }; })()`],
  ['poollog', '4-3', `(() => { const p = e.platforms.find((q) => q.art === 'poolLog'); return p && { x: p.x + p.width / 2, y: p.y }; })()`],
];
const b = await chromium.launch();
for (const [orient, vp] of [['sideways', { width: 844, height: 390 }], ['upright', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
  p.on('pageerror', (er) => { if (!/AudioParam/.test(er.message)) console.log('ERR', er.message); });
  await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
  await p.waitForTimeout(3000);
  for (const [name, stage, find] of jobs) {
    if (only && !name.startsWith(only)) continue;
    await p.evaluate(([s]) => window.__play(s, 1), [stage]);
    await p.waitForTimeout(3500);
    for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
    const park = () => p.evaluate((find) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      const t = eval(find);
      if (!t) return null;
      e.player.x = t.x; e.player.y = t.y - 2; e.player.vx = 0; e.player.vy = 0; e.player.health = 5; e.player.invulnerable = 9;
      return [Math.round(t.x), Math.round(t.y)];
    }, find);
    const at = await park();
    console.log(orient, name, at);
    if (!at) continue;
    await p.waitForTimeout(1500);
    await park();
    if (name !== 'spore') {
      await p.waitForTimeout(300);
      await p.screenshot({ path: out + `${name}-${tag}-${orient}.png` });
      continue;
    }
    // the spore zones held in each beat: idle, the warning (mushrooms swelling) and the cloud
    for (const beat of ['idle', 'warn', 'cloud']) {
      await p.evaluate((beat) => {
        let e = window.__engine; if (typeof e === 'function') e = e();
        for (const z of e.currentStage.zones) {
          if (z.kind !== 'spore') continue;
          const idle = z.period - z.warn - z.active;
          const s = beat === 'idle' ? idle * 0.3 : beat === 'warn' ? idle + z.warn * 0.7 : idle + z.warn + z.active * 0.45;
          z.offset = s - e.gameTime - 0.15;
        }
      }, beat);
      await p.waitForTimeout(150);
      await p.screenshot({ path: out + `${name}-${tag}-${orient}-${beat}.png` });
    }
  }
  await p.close();
}
await b.close();
