// BUILD-25d scratch: the page's own positions for a stage layout (420 px banks, moss stones, flags, water), for stills
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, id, layout] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 915, height: 412 } })).newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]); await p.waitForTimeout(5000);
const out = await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const R = Math.round;
  const P = e.platforms;
  return { seed: e.currentStage?.gen2?.seed, banks420: P.filter((q) => q.type === 'solid' && Math.abs(q.width - 420) < 2).map((q) => `${R(q.x)}..${R(q.x + q.width)}`),
    stones: P.filter((q) => q.style === 'moss_stone').map((q) => R(q.x)), flags: (e.currentStage?.checkpoints ?? []).map((c) => R(c.x)),
    drift: P.filter((q) => q.drift || q.type === 'drift').map((q) => R(q.x)).slice(0, 40) };
});
console.log(JSON.stringify(out));
await b.close();
