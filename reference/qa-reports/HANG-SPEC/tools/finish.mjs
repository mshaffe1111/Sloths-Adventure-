// HANG-SPEC: from the six clip folders (hangclip.mjs), make the six videos, the key stills and ONE contact sheet.
//   node finish.mjs <frames root (holds a-up, a-side, ...)> <out dir (reference/qa-reports/HANG-SPEC)>
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [root, out] = process.argv.slice(2);
fs.mkdirSync(`${out}/stills`, { recursive: true });
fs.mkdirSync(`${out}/video`, { recursive: true });
const WORDS = {
  a: { t: "A. Today's creep, as 1-3 has it", s: 'Flat root, 120 px a second. The whole root takes about 6 seconds.' },
  b: { t: 'B. Slower and tense', s: 'Flat root, 85 px a second. The whole root takes about 9 seconds: the pass over the prowler is a held breath.' },
  c: { t: 'C. The root dips and rises', s: "Same speed as today (about 6 seconds). At the low point he swings into the glow's ring: time it for the prowler's back." },
};
// the step -> frame map hangclip.mjs used: 16 still steps (every 2nd kept), the creep (every 2nd kept), 16 still steps (every 2nd kept)
const frameOf = (log) => { const m = []; let n = 0; const creep = log.length - 32;
  for (let i = 0; i < log.length; i++) { const j = i < 16 ? i : i < 16 + creep ? i - 16 : i - 16 - creep; m.push(j % 2 === 0 ? n++ : -1); } return m; };
const pick = (o, r) => {
  const dir = `${root}/${o}-${r}`; const log = JSON.parse(fs.readFileSync(`${dir}/log.json`, 'utf8')); const fm = frameOf(log);
  const near = (want) => { let best = -1, bd = 1e9; log.forEach((q, i) => { if (fm[i] >= 0) { const d = want(q); if (d < bd) { bd = d; best = fm[i]; } } }); return best; };
  const over = o === 'c' ? near((q) => (q.lit ? Math.abs(q.x - 560) : 1e6 + Math.abs(q.x - 560))) : near((q) => (q.hanging ? Math.abs(q.x - q.ox) : 1e9));
  return { dir, start: near((q) => Math.abs(q.x - 330)), over, end: near((q) => Math.abs(q.x - 820) + (q.x < 820 ? 0 : 0)), crossSteps: log.filter((q) => q.hanging && q.x > 180 && q.x < 896).length };
};
const sheet = [];
for (const o of ['a', 'b', 'c']) {
  const row = { o, ...WORDS[o], up: pick(o, 'up'), side: pick(o, 'side') };
  for (const r of ['up', 'side']) {
    const P = row[r];
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '15', '-i', `${P.dir}/f%03d.png`, '-vf', 'scale=trunc(iw/4)*2:trunc(ih/4)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', `${out}/video/${o}-${r}.mp4`]);
    for (const k of ['start', 'over', 'end']) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${P.dir}/f${String(P[k]).padStart(3, '0')}.png`, '-q:v', '3', `${out}/stills/${o}-${r}-${k}.jpg`]);
  }
  sheet.push(row);
}
const img = (f) => `data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}`;
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#14200f;color:#f2f5ea;font:16px system-ui,sans-serif;width:1700px;padding:24px;box-sizing:border-box}
h1{font-size:30px;margin:0 0 4px} .q{font-size:19px;opacity:.9;margin:0 0 18px}
.row{display:flex;gap:14px;align-items:flex-start;margin:0 0 22px;padding:14px;background:#1f2e18;border-radius:16px}
.lab{width:250px;flex:none} .lab b{display:block;font-size:24px;margin-bottom:8px} .lab span{font-size:17px;line-height:1.35}
.up img{height:520px;border-radius:10px;display:block} .side img{width:520px;border-radius:10px;display:block}
.cap{font-size:14px;opacity:.8;margin-top:4px;text-align:center}
.note{font-size:15px;opacity:.85;margin-top:6px}</style>
<h1>3-2 Glowworm Path: how should creeping under the root feel?</h1>
<p class=q>Pokey hangs from a roof root over a prowling ocelot. Prowlers never look up, but the glowworms' light gives him away. Real game, 3-1's cave as the test room; the root and the glow are stand-in drawings.</p>
${sheet.map((r) => `<div class=row><div class=lab><b>${r.t}</b><span>${r.s}</span></div>
${['start', 'over', 'end'].map((k) => `<div class=up><img src="${img(`${out}/stills/${r.o}-up-${k}.jpg`)}"><div class=cap>${k === 'over' ? (r.o === 'c' ? 'low point, in the glow' : 'right over the prowler') : k === 'start' ? 'creeping in' : 'past it'}</div></div>`).join('')}
<div class=side><img src="${img(`${out}/stills/${r.o}-side-over.jpg`)}"><div class=cap>sideways, ${r.o === 'c' ? 'low point' : 'over the prowler'}</div></div></div>`).join('')}
<p class=note>Videos of each, upright and sideways: video/a-up.mp4, a-side.mp4, b-up.mp4, b-side.mp4, c-up.mp4, c-side.mp4.</p>`;
fs.writeFileSync(`${root}/sheet.html`, html);
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1700, height: 800 }, deviceScaleFactor: 1 })).newPage();
await pg.goto(`file://${root}/sheet.html`);
await pg.waitForTimeout(500);
await pg.screenshot({ path: `${out}/CONTACT-SHEET.png`, fullPage: true });
await b.close();
console.log(JSON.stringify(sheet.map((r) => ({ o: r.o, upCross: r.up.crossSteps, sideCross: r.side.crossSteps, up: [r.up.start, r.up.over, r.up.end], side: [r.side.start, r.side.over, r.side.end] }))));
