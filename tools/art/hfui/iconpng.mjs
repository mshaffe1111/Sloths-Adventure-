import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const icons = JSON.parse(fs.readFileSync('/tmp/claude-0/kit/icons.json', 'utf8'));
fs.mkdirSync('/tmp/claude-0/kit/png', { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 300, height: 300 } });
for (const [n, svg] of Object.entries(icons)) {
  // cream glyph with a dark brown outline (as the game draws them on wood), on magenta
  await p.setContent(`<body style="margin:0;background:#ff00ff;width:300px;height:300px;display:flex;align-items:center;justify-content:center;color:#f4dfaa">
    <div style="filter:drop-shadow(0 0 3px #3a1f0c) drop-shadow(0 0 3px #3a1f0c) drop-shadow(0 4px 0 #3a1f0c)">${svg}</div></body>`);
  await p.screenshot({ path: `/tmp/claude-0/kit/png/${n}.png` });
}
await b.close();
