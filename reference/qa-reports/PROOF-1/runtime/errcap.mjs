// a stage stood in for N seconds on the shipped build: every 'frame error' the engine logs, with the game time it happened at
import { chromium, newPage, seedDone, IDS, toMap, playFromMap, sleep, HEAD, MAIN } from './rtlib.mjs';
const which = process.argv[2] ?? 'head', id = process.argv[3] ?? '4-1', secs = Number(process.argv[4] ?? 30);
const url = which === 'main' ? MAIN : HEAD;
const browser = await chromium.launch();
const { page, errors } = await newPage(browser);
await page.addInitScript(() => {
  window.__fe = [];
  const ce = console.error.bind(console);
  console.error = (...a) => { const s = a.map((x) => String(x?.stack ?? x)).join(' '); if (/frame error/.test(s)) { const e = window.__probeEngine?.(); window.__fe.push({ t: e ? +e.gameTime.toFixed(3) : null, s: s.slice(0, 400) }); } ce(...a); };
});
await page.goto(url);
await page.evaluate(seedDone, IDS);
await page.reload();
await toMap(page);
await playFromMap(page, id);
const t0 = await page.evaluate(() => window.__probeEngine().gameTime);
await sleep(secs * 1000);
const r = await page.evaluate(() => ({ fe: window.__fe, t: window.__probeEngine().gameTime, rocks: (window.__probeEngine().w4?.rocks ?? window.__probeEngine().proto?.rocks ?? []).map((q) => ({ x: Math.round(q.x), every: q.every, offset: q.offset, warn: q.warn })) }));
console.log(`${which} ${id}: game time ${t0.toFixed(2)} -> ${r.t.toFixed(2)}; frame errors ${r.fe.length}; console/page errors ${errors.length}`);
for (const f of r.fe.slice(0, 6)) console.log('  at t', f.t, f.s.replace(/\s+/g, ' ').slice(0, 260));
console.log('  rocks', JSON.stringify(r.rocks).slice(0, 600));
await browser.close();
