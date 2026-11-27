// BUILD-29-m probe: 2-9 layout 1 on a setting: Dot's hints (x, text, kind) and every dressing item whose record names a frog or turtle
const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, diff] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-9', 1)); await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
console.log(await p.evaluate((E) => { const e = eval(E); const st = e.currentStage; const pr = st.proto ?? {};
  const hints = (pr.hints ?? []).map((h) => ({ x: Math.round(h.x), text: h.text, teach: h.teach, story: h.story }));
  const dress = []; for (const [k, v] of Object.entries(pr)) if (Array.isArray(v)) for (const it of v) { const j = JSON.stringify(it ?? null); if (/frog|turtle/i.test(j)) dress.push(k + ' ' + j.slice(0, 200)); }
  return JSON.stringify({ seed: st.gen2?.seed, hints, dress }, null, 1); }, E));
await b.close();
