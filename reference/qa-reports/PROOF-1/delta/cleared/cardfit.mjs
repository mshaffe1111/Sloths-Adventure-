// PROOF-1 delta: the Stage Cleared card (violation 2), measured by the auditor, not by clipcheck. A dev server of the tree given
// (argv[2], default /home/user/plant-wt), the game's own dev hook window.__win(stage, stars, medals) opens the card; at each phone size
// with its safe-area insets (CDP Emulation.setSafeAreaInsetsOverride) and NOTHING scrolled, every button on the card must sit fully
// inside the screen less the insets and be >= 44 px tall; the card itself must not need scrolling. Prints one line a size; exit 1 on any miss.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const root = process.argv[2] ?? '/home/user/plant-wt';
const outDir = new URL('.', import.meta.url).pathname;
const { chromium } = createRequire(root + '/package.json')('playwright');
const port = 5400 + Math.floor(Math.random() * 300);
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; vite.stdout.on('data', (d) => (log += d)); vite.stderr.on('data', (d) => (log += d));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIDE = { top: 0, bottom: 21, left: 47, right: 47 }, UP = { top: 47, bottom: 34, left: 0, right: 0 };
const SIZES = [[844, 390, SIDE], [915, 412, SIDE], [800, 360, SIDE], [740, 360, SIDE], [667, 375, SIDE], [640, 360, SIDE], [932, 430, SIDE],
  [390, 844, UP], [412, 915, UP], [375, 812, UP], [360, 780, UP], [375, 667, UP], [360, 640, UP], [430, 932, UP]];
let bad = 0;
try {
  for (let i = 0; i < 120 && !/Local:|ready in/.test(log.replace(/\x1b\[[0-9;]*m/g, '')); i++) await sleep(500);
  const browser = await chromium.launch();
  const errors = [];
  for (const [medals, label] of [[3, 'medals3'], [0, 'medals0']]) for (const [w, h, ins] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: ins });
    await page.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await page.waitForFunction(() => typeof window.__win === 'function', null, { timeout: 90000 });
    const ids = await page.evaluate(() => (window.__badgeIds ? window.__badgeIds() : null));
    await page.evaluate(([m]) => window.__win('1-2', 3, m), [medals ? ['first_steps','flawless','green_thumb'].slice(0, medals) : []]);
    await page.locator('.clr-card.clr-won').first().waitFor({ state: 'visible', timeout: 30000 });
    await sleep(2500);
    const r = await page.evaluate((ins) => {
      const vw = innerWidth, vh = innerHeight;
      const card = document.querySelector('.clr-card.clr-won');
      const sc = [card, ...card.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY));
      const btns = [...card.querySelectorAll('button')].filter((b) => b.offsetParent);
      const miss = btns.map((b) => { const q = b.getBoundingClientRect(); const t = (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 18);
        const out = q.top < ins.top - 0.5 || q.left < ins.left - 0.5 || q.right > vw - ins.right + 0.5 || q.bottom > vh - ins.bottom + 0.5;
        return (out || b.offsetHeight < 44) ? `${t}[${Math.round(q.left)},${Math.round(q.top)}-${Math.round(q.right)},${Math.round(q.bottom)} h${b.offsetHeight}]` : null; }).filter(Boolean);
      const c = card.getBoundingClientRect();
      return { n: btns.length, miss, scroll: sc.map((e) => `${e.className.toString().split(' ')[0]}+${e.scrollHeight - e.clientHeight}`), card: `${Math.round(c.top)}-${Math.round(c.bottom)} of ${vh}` };
    }, ins);
    const ok = !r.miss.length && !r.scroll.length;
    if (!ok) bad++;
    console.log(`${ok ? 'ok  ' : 'MISS'} ${label} ${w}x${h} insets ${JSON.stringify(ins)}: ${r.n} buttons, card ${r.card}${r.miss.length ? ' | outside/short: ' + r.miss.join('; ') : ''}${r.scroll.length ? ' | scrolls: ' + r.scroll.join(',') : ''}`);
    if (!ok || (medals === 3 && [844, 640, 360, 390, 667].includes(w))) await page.screenshot({ path: `${outDir}/${root.split('/').pop()}-card-${label}-${w}x${h}.png` });
    await ctx.close();
  }
  await browser.close();
  console.log(`${bad ? 'FAIL' : 'PASS'}: ${bad} size(s) with a button outside the safe area / under 44 px, or a card that scrolls; page errors ${errors.length} ${JSON.stringify(errors.slice(0, 3))}`);
} catch (e) { console.log('could not run: ' + e.message.split('\n')[0]); bad = 99; }
finally { try { process.kill(-vite.pid); } catch {} }
process.exit(bad ? 1 : 0);
