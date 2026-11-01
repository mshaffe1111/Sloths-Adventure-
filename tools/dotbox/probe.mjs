// Probe: play a stage to a Dot tip and report the bubble, Pokey and the spot ahead (dot-box helper). Usage:
//   node tools/dotbox/probe.mjs <port> <stage> <layout> <text substring> <w> <h> <out.png>
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, stage, layout, text, W, H, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForFunction(() => typeof window.__play === "function", null, { timeout: 60000 });
await p.evaluate(([s, l]) => window.__play(s, Number(l)), [stage, layout]);
await p.waitForFunction(() => typeof window.__engine === "function" && window.__engine(), null, { timeout: 60000 }); await p.waitForTimeout(3000);
const info = await p.evaluate((t) => {
  const e = window.__engine();
  const h = e.proto?.hints?.find((q) => q.text.includes(t));
  return { hints: (e.proto?.hints ?? []).map((q) => [q.x, q.text]), h, px: e.player.x };
}, text);
console.log(JSON.stringify(info));
await b.close();
