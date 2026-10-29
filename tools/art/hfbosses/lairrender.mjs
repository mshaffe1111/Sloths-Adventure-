// node lairrender.mjs <outdir>: renders the code-drawn lair backs (croc, sovereign; phase 1 and 3) at 2048x1152 as img2img starts
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
p.on('console', (m) => console.log('PAGE', m.text()));
await p.goto('http://127.0.0.1:4320/');
await p.waitForTimeout(1500);
for (const [kind, phase] of [['croc', 1], ['croc', 3], ['sovereign', 1], ['sovereign', 3], ['queen', 1]]) {
  const data = await p.evaluate(async ([kind, phase]) => {
    const m = await import('/src/game/lairArt.ts');
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 1152;
    const ctx = c.getContext('2d');
    const v = { x: 0, y: 0, vw: 2048, vh: 1152 };
    const a = { left: 60, right: 1988, floor: 960 };
    for (let i = 0; i < 3; i++) m.drawLairBack(ctx, kind, v, a, 10 + i * 0.01, 1300, phase);
    return c.toDataURL('image/png');
  }, [kind, phase]);
  fs.writeFileSync(`${out}/code-${kind}-p${phase}.png`, Buffer.from(data.split(',')[1], 'base64'));
  console.log(kind, phase);
}
await b.close();
