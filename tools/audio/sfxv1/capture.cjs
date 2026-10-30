/**
 * Record the game's own sound while a bot plays (polish-sfx, 2026-10-29): the whole mix off the master (core.meter passes it through),
 * and the effects and music buses on their own, as webm/opus, for the polish clips and for checking the effects' loudness against the
 * music in real play. Dev server on 127.0.0.1:4303.
 *
 *   node tools/audio/sfxv1/capture.cjs <stage> <seconds> <out prefix> [start x] [pace]
 *
 * With `pace`, he is put at start x (on World 4's rock ground, y 575), can't be hurt, and paces a few steps back and forth: the rocks fall
 * around him on their own rhythm (the 4-4 clip).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const [stage, secs, out, startX, pace] = [process.argv[2], Number(process.argv[3] || 30), process.argv[4], process.argv[5], process.argv[6] === 'pace'];
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 844, height: 390 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${process.env.PORT || 4303}/?audiodebug=1&lessons=off`);
  await p.waitForFunction(() => window.__play && window.__sound, null, { timeout: 120000 });
  await p.mouse.click(400, 200);
  await p.waitForTimeout(6000); // (the recorded set decodes)
  await p.evaluate((id) => window.__play(id), stage);
  await p.waitForTimeout(3000);
  for (const t of ['Got it!', 'Continue', "Let's go!"]) {
    const x = p.getByText(t, { exact: true });
    if (await x.count()) await x.first().click({ timeout: 500 }).catch(() => {});
  }
  if (startX) {
    await p.evaluate(([x, pace]) => {
      const e = window.__engine();
      e.player.x = Number(x);
      // (the checkpoint too, the play-test harness's way: any reset puts him back here)
      e.checkpoint = { x: Number(x), y: pace ? 560 : e.player.y - 200 };
      if (pace) { e.player.y = 560; e.player.vy = 0; window.__keepSafe = setInterval(() => { e.player.invincibleTimer = 5; e.lives = Math.max(e.lives || 0, 3); }, 200); }
      else { e.player.y -= 200; e.player.vy = 0; }
    }, [startX, pace]);
    await p.waitForTimeout(1500);
  }
  await p.evaluate((ms) => {
    const core = window.__sound.c.core;
    const ctx = core.ctx;
    window.__rec = {};
    const tap = (node, key) => {
      const d = ctx.createMediaStreamDestination();
      node.connect(d);
      const r = new MediaRecorder(d.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 });
      const chunks = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = async () => {
        const buf = new Uint8Array(await new Blob(chunks).arrayBuffer());
        let s = '';
        for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        window.__rec[key] = btoa(s);
      };
      r.start();
      setTimeout(() => r.stop(), ms);
    };
    tap(core.meter, 'mix');
    tap(core.sfx, 'sfx');
    tap(core.music, 'music');
    tap(core.amb, 'amb');
    window.__fxlog = [];
    const c = window.__sound.c, orig = c.fx.bind(c);
    c.fx = (n, a) => { window.__fxlog.push([Math.round(performance.now()), n]); return orig(n, a); };
  }, secs * 1000);
  const t0 = Date.now();
  if (pace) {
    while (Date.now() - t0 < secs * 1000) {
      for (const k of ['ArrowRight', 'ArrowLeft']) {
        await p.keyboard.down(k);
        await p.waitForTimeout(700);
        await p.keyboard.up(k);
        await p.waitForTimeout(900 + Math.random() * 600);
      }
    }
  }
  // the bot: run right, jump now and then, back up when stuck
  if (!pace) await p.keyboard.down('ArrowRight');
  let lastX = null, stuck = 0, i = 0;
  while (!pace && Date.now() - t0 < secs * 1000) {
    i++;
    const x = await p.evaluate(() => window.__engine().player.x);
    await p.keyboard.press('Space', { delay: 140 });
    if (i % 3 === 0) { await p.waitForTimeout(200); await p.keyboard.press('Space', { delay: 80 }); }
    if (lastX !== null && Math.abs(x - lastX) < 8) stuck++; else stuck = 0;
    if (stuck >= 3) { await p.keyboard.up('ArrowRight'); await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(400); await p.keyboard.up('ArrowLeft'); await p.keyboard.down('ArrowRight'); stuck = 0; }
    lastX = x;
    await p.waitForTimeout(500 + Math.random() * 300);
  }
  await p.keyboard.up('ArrowRight');
  await p.waitForFunction(() => window.__rec && Object.keys(window.__rec).length === 4, null, { timeout: 30000 });
  const rec = await p.evaluate(() => window.__rec);
  for (const [k, v] of Object.entries(rec)) fs.writeFileSync(`${out}-${k}.webm`, Buffer.from(v, 'base64'));
  const log = await p.evaluate(() => window.__fxlog);
  fs.writeFileSync(`${out}-fx.json`, JSON.stringify(log));
  await p.screenshot({ path: `${out}.png` });
  const counts = {};
  for (const [, n] of log) counts[n] = (counts[n] || 0) + 1;
  console.log('effects asked for:', JSON.stringify(counts));
  console.log('ERRS', errs.slice(0, 5));
  await b.close();
})();
