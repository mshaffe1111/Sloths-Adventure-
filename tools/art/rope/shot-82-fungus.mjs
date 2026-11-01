// 8-2's fungus steps on their trunks (w8-rope2, 2026-11-01): stills of a fungus stair and of a stair's foot with its knot, upright and
// sideways, in the real game (engine paused and stepped). Needs a dev-hooks build served on <port>.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/rope/shot-82-fungus.mjs <port> <out dir> <layout>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.', layout = '2'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['sideways', 844, 390], ['upright', 390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate((l) => window.__play('8-2', Number(l)), layout);
  await p.waitForTimeout(9000);
  for (const [name, which] of [['stair', 'stair'], ['foot', 'foot']]) {
    const ok = await p.evaluate((which) => {
      const e = window.__engine();
      const st = e.currentStage;
      const sec = st.gen2.sections.filter((s) => s.template === 'w8-fungus-blooms' && !s.mirrored)[1] ?? st.gen2.sections.find((s) => /^w8-fungus-/.test(s.template));
      if (!sec) return false;
      const ground = e.platforms.filter((q) => q.id < 70000 && q.x >= sec.x0 - 2 && q.x + q.width <= sec.x1 + 2).sort((a, b) => a.x - b.x);
      const steps = ground.filter((q) => q.height <= 30);
      const at = which === 'stair' ? steps[1] : ground.filter((q) => q.height > 30).slice(-3)[0];
      Object.assign(e.player, { x: at.x + (which === 'stair' ? at.width / 2 : 60), y: at.y, vx: 0, vy: 0, grounded: true, hanging: false, facing: 1 });
      e.isPaused = true;
      for (let i = 0; i < 45; i++) e.update(1 / 30);
      e.render();
      return true;
    }, which);
    if (ok) await p.screenshot({ path: path.join(out, `8-2-fungus-${name}-${tag}.png`) });
    console.log(tag, name, ok ? 'shot' : 'no fungus section');
  }
  await p.context().close();
}
await b.close();
