// node pxdiff.mjs <module.js exporting async run(page-side)>: runs a page-side script that returns [{name, a: dataURL, b: dataURL}], diffs them
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [script, outDir] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await p.goto('http://127.0.0.1:4306/?nodemo=1');
const res = await p.evaluate(fs.readFileSync(script, 'utf8'));
for (const r of res) {
  const [max, mean, over8] = await p.evaluate(async ([a, bb]) => {
    const load = async (u) => { const i = new Image(); i.src = u; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
    const da = await load(a), db = await load(bb);
    let max = 0, sum = 0, o = 0;
    for (let i = 0; i < da.length; i += 4) { const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3])); max = Math.max(max, d); sum += d; if (d > 8) o++; }
    return [max, sum / (da.length / 4), o / (da.length / 4)];
  }, [r.a, r.b]);
  console.log(`${r.name}: max ${max} mean ${mean.toFixed(4)} px>8 ${(over8 * 100).toFixed(3)}%`);
  if (outDir) for (const k of ['a', 'b']) fs.writeFileSync(`${outDir}/${r.name}-${k === 'a' ? 'old' : 'new'}.png`, Buffer.from(r[k].split(',')[1], 'base64'));
}
await b.close();
