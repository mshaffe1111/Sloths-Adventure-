/**
 * Count the sound effects a stage plays in a minute of play (polish-sfx, 2026-10-29).
 *
 *   node tools/audio/sfxv1/fxcount.cjs <out.json> 1-2 4-4 ...      (dev server on 127.0.0.1:4303)
 *
 * A simple bot plays each stage for 60 s of game time on the keyboard: it runs right, jumps every 0.6-1 s (a double jump now and then),
 * punches near enemies' height every 1.5 s, climbs when on a vine, and backs up when it has not moved. Every call into the effects
 * (Conductor.fx) is logged with the game line that asked for it (from the dev build's stack), so "hit" from a rock and "hit" from a
 * punch are told apart. A bot is not a person: rates are a floor for movement and an estimate for the rest.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [out, ...stages] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const errs = [];
  const res = {};
  for (const id of stages) {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  page.on('pageerror', (e) => errs.push(id + ': ' + String(e)));
  await page.goto('http://127.0.0.1:4303/?audiodebug=1&lessons=off', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__play && window.__sound, null, { timeout: 120000 });
  await page.evaluate(() => {
    const s = window.__sound;
    const c = s.c;
    const orig = c.fx.bind(c);
    window.__fxlog = [];
    c.fx = (name, arg) => {
      const st = (new Error().stack || '').split('\n').slice(2).map((l) => (/\/src\/([^?]+)\?[^:]*:(\d+)/.exec(l) || /\/src\/([^:]+):(\d+)/.exec(l)));
      const at = st.filter(Boolean).map((m) => m[1].replace(/^.*\//, '') + ':' + m[2]).filter((x) => !/^(audio|conductor)\.ts/.test(x)).slice(0, 2).join(' < ');
      window.__fxlog.push([performance.now(), name, arg, at]);
      return orig(name, arg);
    };
  });
    await page.evaluate((id) => { window.__fxlog = []; window.__play(id); }, id);
    await page.waitForTimeout(2500);
    // dismiss any card
    for (const t of ['Got it!', 'Start', 'Play', "Let's go!", 'OK', 'Continue']) {
      const b = page.getByText(t, { exact: true });
      if (await b.count()) await b.first().click({ timeout: 500 }).catch(() => {});
    }
    const t0 = Date.now();
    await page.evaluate(() => { window.__fxlog = []; window.__t0 = performance.now(); });
    await page.keyboard.down('ArrowRight');
    let lastX = null, stuck = 0, i = 0;
    while (Date.now() - t0 < 60000) {
      i++;
      const st = await page.evaluate(() => { const e = window.__engine && window.__engine(); const p = e && e.player; return p ? { x: p.x, y: p.y, climb: !!(p.isClimbing || p.climbing || p.onVine), boss: !!(e.currentStage && e.currentStage.config && e.currentStage.config.isBoss) } : null; });
      for (const t of ['Got it!', 'Continue', 'Try again', 'Retry']) {
        const b = page.getByText(t, { exact: true });
        if (await b.count().catch(() => 0)) await b.first().click({ timeout: 300 }).catch(() => {});
      }
      if (st && st.climb) { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp'); }
      await page.keyboard.press('Space', { delay: 120 + Math.random() * 120 });
      if (Math.random() < 0.3) { await page.waitForTimeout(220); await page.keyboard.press('Space', { delay: 80 }); }
      if (i % 2 === 0) await page.keyboard.press('KeyJ', { delay: 60 });
      if (i % 7 === 0) await page.keyboard.press('KeyK', { delay: 60 });
      if (st && lastX !== null && Math.abs(st.x - lastX) < 8) stuck++; else stuck = 0;
      if (stuck >= 4) { await page.keyboard.up('ArrowRight'); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(500); await page.keyboard.press('Space'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft'); await page.keyboard.down('ArrowRight'); stuck = 0; }
      lastX = st ? st.x : null;
      await page.waitForTimeout(450 + Math.random() * 400);
    }
    await page.keyboard.up('ArrowRight');
    const log = await page.evaluate(() => (window.__fxlog || []).map((x) => [Math.round(x[0] - window.__t0), x[1], x[2], x[3]]));
    res[id] = log;
    const by = {};
    for (const [, n, , at] of log) { const k = n + ' @ ' + at; by[k] = (by[k] || 0) + 1; }
    console.log('STAGE', id, log.length, 'calls');
    for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log('   ', v, k);
    fs.writeFileSync(out, JSON.stringify({ res, errs }, null, 0));
    await page.close();
  }
  fs.writeFileSync(out, JSON.stringify({ res, errs }, null, 0));
  console.log('ERRS', errs.slice(0, 5));
  await browser.close();
})();
