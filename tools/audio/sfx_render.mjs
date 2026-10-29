// SN-2: render every effect named in argv (or all with TRIMS) to tools/audio/out/<name>_<variant>.f32 (48 kHz mono float32), via the
// dev server on port 4302 serving tools/audio/render/. Usage: node tools/audio/sfx_render.mjs <outDir> name[:arg] ...
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const [outDir, ...names] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:4302/tools/audio/render/index.html');
await p.waitForFunction(() => !!window.renderFx, null, { timeout: 60000 });
for (const n of names) {
  const [name, a] = n.split(':');
  for (let v = 0; v < 4; v++) {
    const b64 = await p.evaluate(([nm, vv, ar]) => window.renderFx(nm, vv, ar), [name, v, a === undefined ? undefined : Number(a)]);
    fs.writeFileSync(`${outDir}/${n.replace(':', '@')}_${v}.f32`, Buffer.from(b64, 'base64'));
  }
}
await b.close();
