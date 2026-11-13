// node dump.mjs <port> <stage> <layout> <x> <outdir>: every baked hollow near x as PNG on magenta, plus its gap
import fs from 'node:fs';
const { chromium } = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default;
const [port, id, L, x, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 915, height: 412 } })).newPage();
p.on('console', (m) => console.log('pg', m.text().slice(0,200)));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2000);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +L]); await p.waitForTimeout(3000);
for (let i = 0; i < 40; i++) { await p.evaluate((x) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; e.isPaused = true; e.player.x = x; e.player.y = 300; e.update(1 / 30); e.render(); }, +x); await p.waitForTimeout(50); }
const r = await p.evaluate((x) => {
  console.log('n', globalThis.__bk?.length); return globalThis.__bk.filter(([g]) => Math.abs(g.x0 - x) < 700 && g.floor).map(([g, h]) => { const c = h.hollow?.c; if (!c) return null;
    const k = document.createElement('canvas'); k.width = c.width * 3; k.height = c.height * 3; const t = k.getContext('2d'); t.fillStyle = '#f0f'; t.fillRect(0, 0, k.width, k.height);
    t.imageSmoothingEnabled = false; t.drawImage(c, 0, 0, k.width, k.height);
    return { g: JSON.stringify({ x0: g.x0, x1: g.x1, top: g.top, floor: g.floor, walls: g.walls, lipL: g.lipL, lipR: g.lipR, hx: h.hollow.x, hy: h.hollow.y }), url: k.toDataURL() }; }).filter(Boolean); }, +x);
r.forEach((o, i) => { fs.writeFileSync(`${out}/h${i}.png`, Buffer.from(o.url.split(',')[1], 'base64')); console.log(i, o.g); });
await b.close();
