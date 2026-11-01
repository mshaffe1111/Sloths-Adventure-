// The painted tick with its in-game filter (index.css .pic-tick) at real size on cream, wood and leaf green, beside the old look and
// the star and lock (2x density).   node tools/art/icons/shot-tick.mjs <out.png>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { requireLiveBase, stampBase, writeBase } from './base.mjs';
import fs from 'fs';
const R = new URL('../../../', import.meta.url).pathname;
const d = (n) => 'data:image/webp;base64,' + fs.readFileSync(R + `src/assets/icons/${n}.webp`).toString('base64');
const css = fs.readFileSync(R + 'src/index.css', 'utf8').match(/\.pic\.pic-tick \{[^}]*\}/)[0];
const row = (bg, tick) => `<div style="background:${bg};display:flex;gap:18px;align-items:center;padding:10px 14px">
  ${[14, 16, 24].map((s) => `<img class="pic ${tick ? 'pic-tick' : ''}" src="${d('checkmark')}" width="${s}" height="${s}">`).join('')}
  <span style="width:20px"></span><img class="pic" src="${d('star')}" width="16"><img class="pic" src="${d('lock')}" width="16"></div>`;
const html = `<style>body{margin:0;font:600 13px sans-serif;color:#fff;background:#140e08}.pic{display:inline-block} ${css} td{padding:4px 8px}</style>
<table><tr><td>before</td><td>${row('#f4e4c4', false)}</td><td>${row('#5c3a1e', false)}</td><td>${row('#2e5c2c', false)}</td></tr>
<tr><td>after</td><td>${row('#f4e4c4', true)}</td><td>${row('#5c3a1e', true)}</td><td>${row('#2e5c2c', true)}</td></tr></table>`;
const BASE = requireLiveBase();
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 130 }, deviceScaleFactor: 2 });
await p.setContent(html); await p.waitForTimeout(300); await stampBase(p, BASE); await p.screenshot({ path: process.argv[2] }); await b.close();
