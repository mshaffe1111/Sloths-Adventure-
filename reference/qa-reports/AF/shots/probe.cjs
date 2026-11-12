const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2], tag = process.argv[3] || 'x';
const IDS = JSON.parse(fs.readFileSync(S + '/ids.json', 'utf8'));
const SIZES = [
  ['side915', 915, 412, { top: 0, bottom: 21, left: 48, right: 48 }],
  ['side844', 844, 390, { top: 0, bottom: 21, left: 47, right: 47 }],
  ['side800', 800, 360, { top: 0, bottom: 21, left: 40, right: 40 }],
  ['side740', 740, 360, { top: 0, bottom: 21, left: 32, right: 32 }],
  ['side667', 667, 375, { top: 0, bottom: 21, left: 0, right: 0 }],
  ['up412', 412, 915, { top: 48, bottom: 24, left: 0, right: 0 }],
  ['up360', 360, 640, { top: 24, bottom: 24, left: 0, right: 0 }],
  ['up390', 390, 844, { top: 47, bottom: 34, left: 0, right: 0 }],
  ['up375', 375, 812, { top: 47, bottom: 34, left: 0, right: 0 }],
  ['up360x780', 360, 780, { top: 24, bottom: 24, left: 0, right: 0 }],
  ['up360x740', 360, 740, { top: 24, bottom: 24, left: 0, right: 0 }],
  ['up375x667', 375, 667, { top: 20, bottom: 0, left: 0, right: 0 }],
];
(async () => {
  const b = await chromium.launch();
  for (const [id, w, h, ins] of SIZES.filter((x) => !process.env.ONLY || process.env.ONLY.split(',').includes(x[0]))) {
    for (const card of (process.env.CARDS || 'win,lost').split(',')) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(e.message));
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: ins });
    const base = 'http://127.0.0.1:4791';
    await page.goto(base + '/?lessons=off');
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_coach_done', '1'); });
    await page.goto(base + '/?lessons=off');
    await page.waitForFunction(() => typeof window.__win === 'function', null, { timeout: 60000 });
    if (process.env.CSS) await page.addStyleTag({ content: fs.readFileSync(process.env.CSS, 'utf8') });
    if (card === 'win') {
      await page.evaluate((m) => window.__win('1-2', 3, m), IDS.badges.slice(0, 2));
      await page.locator('.clr-medals.in').first().waitFor({ state: 'visible', timeout: 20000 });
    } else {
      await page.evaluate(() => window.__play('1-3'));
      await page.waitForFunction(() => typeof window.__engine === 'function' && !!window.__engine(), null, { timeout: 30000 });
      await page.waitForTimeout(2500);
      for (let k = 0; k < 12 && !(await page.locator('.clr-card.lost').count()); k++) { await page.evaluate(() => window.__kill()); await page.waitForTimeout(1500); }
    }
    await page.waitForTimeout(900);
    const r = await page.evaluate((ins) => {
      const H = innerHeight, W = innerWidth;
      const c = document.querySelector('.clr-card').getBoundingClientRect();
      const sc = document.querySelector('.clr-scrim');
      const bad = [...document.querySelectorAll('.clr-card button, .clr-card a')].map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 20), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width) }; })
        .filter((x) => x.bottom > H - ins.bottom || x.top < ins.top || x.h < 44);
      return { card: [Math.round(c.top), Math.round(c.bottom), Math.round(c.height)], H, scroll: sc ? [sc.scrollHeight, sc.clientHeight] : null, bad };
    }, ins);
    console.log(id, card, JSON.stringify(r), errs.length ? 'ERR ' + errs.join('|') : '');
    await page.screenshot({ path: `${S}/shot-${tag}-${id}-${card}.png` });
    await ctx.close();
    }
  }
  await b.close();
})();
