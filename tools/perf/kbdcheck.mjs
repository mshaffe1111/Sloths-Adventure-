/**
 * The keyboard check (Matt, 11-06: "the keyboard covers the text box while typing"): the testers' page (#ctest) with a phone keyboard
 * up, simulated by shrinking the visual viewport (its height, then a resize event, as a phone's keyboard does), for every text field:
 * the name on the front page, "What looked wrong?" and "Anything else?" on the end questions.
 *
 *   node tools/perf/kbdcheck.mjs            (about 2 minutes: starts the dev server itself; exit 1 on a failure)
 *   KBD_URL=http://127.0.0.1:5179 node tools/perf/kbdcheck.mjs   (use a server already running)
 *
 * Keyboards take 30%, 40% and 50% of a 412 x 915 phone upright, and 50% and 60% of 915 x 412 sideways. For each field, focused, and
 * again after three lines are typed into it (the box grows with its words), the field's whole box with its character count must lie
 * inside the visible part of the screen: its top not scrolled off above, its bottom at least 16 px above the keyboard's top.
 * Every run also plants a failure: with the keep-in-view turned off (window.__ctNoKeep, ControlTestGate.tsx useAboveKeyboard) the
 * check must go red, or the check itself is broken. Stills go to reference/qa/tester-page-1106/keyboard/.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const OUT = path.join(root, 'reference/qa/tester-page-1106/keyboard');
fs.mkdirSync(OUT, { recursive: true });
const GAP = 16;
const CASES = [
  { o: 'up', w: 412, h: 915, kb: [0.3, 0.4, 0.5] },
  { o: 'side', w: 915, h: 412, kb: [0.5, 0.6] },
];
const THREE_LINES = 'The log jumped out of nowhere.\nPokey fell through the second gap.\nThe mushroom bounce felt great though!';

async function server() {
  if (process.env.KBD_URL) return { url: process.env.KBD_URL.replace(/\/$/, ''), stop: () => {} };
  const port = 5300 + Math.floor(Math.random() * 400);
  const p = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('dev server did not start')), 60000);
    p.stdout.on('data', (d) => { if (/Local:/.test(String(d))) { clearTimeout(t); res(); } });
  });
  return { url: `http://127.0.0.1:${port}`, stop: () => { try { process.kill(-p.pid); } catch { /* gone */ } } };
}

/** the keyboard up: the visual viewport `keep` px tall from the top */
const keyboard = (page, keep) => page.evaluate((k) => {
  const vv = window.visualViewport;
  Object.defineProperty(vv, 'height', { configurable: true, get: () => k });
  Object.defineProperty(vv, 'offsetTop', { configurable: true, get: () => 0 });
  vv.dispatchEvent(new Event('resize'));
}, keep);

/** where a field's box (with its count) is, against what the keyboard leaves */
const judge = (page, id, keep) => page.evaluate(([id, keep, GAP]) => {
  const box = document.querySelector(`[data-kbd-box="${id}"]`);
  if (!box) return { ok: false, why: 'no box' };
  const r = box.getBoundingClientRect();
  const why = [];
  if (r.top < 0) why.push(`top ${Math.round(r.top)} is above the screen`);
  if (r.bottom > keep - GAP) why.push(`bottom ${Math.round(r.bottom)} is not ${GAP} px above the keyboard at ${keep}`);
  return { ok: !why.length, why: why.join('; '), top: Math.round(r.top), bottom: Math.round(r.bottom) };
}, [id, keep, GAP]);

async function field(page, id, keep, tag, results, shoot) {
  // (scrolled to the top first, so the field starts out of place, as when a tester taps it after reading down the page)
  await page.evaluate(() => { const s = document.querySelector('.ct-scene'); if (s) s.scrollTop = 0; });
  await page.focus('#' + id);
  await keyboard(page, keep);
  await page.waitForTimeout(500);
  const a = await judge(page, id, keep);
  results.push({ tag: `${tag} ${id} focused`, ...a });
  await page.keyboard.type(id === 'ctest-name' ? 'Matt the long-named tester' : THREE_LINES);
  await page.waitForTimeout(400);
  const b = await judge(page, id, keep);
  results.push({ tag: `${tag} ${id} after typing`, ...b });
  if (shoot) await page.screenshot({ path: path.join(OUT, `${tag.replace(/ /g, '-')}-${id}.png`), clip: { x: 0, y: 0, width: page.viewportSize().width, height: keep } });
  await page.evaluate(() => document.activeElement?.blur());
}

async function run(browser, base, c, kb, plant) {
  const keep = Math.round(c.h * (1 - kb));
  const tag = `${c.o} ${Math.round(kb * 100)}pc`;
  const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, hasTouch: true, isMobile: true, deviceScaleFactor: plant ? 1 : 2 });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const results = [];
  try {
    await page.goto(`${base}/?lessons=off#ctest`);
    await page.waitForSelector('#ctest-name', { timeout: 60000 });
    if (plant) await page.evaluate(() => { window.__ctNoKeep = true; });
    await page.waitForTimeout(800);
    await field(page, 'ctest-name', keep, tag, results, !plant);
    // back to full height, Start, and the end questions
    await keyboard(page, c.h);
    await page.click('button[type=submit]');
    await page.waitForTimeout(7000);
    await page.locator("button:has-text(\"I'm done\")").click();
    await page.locator('button:has-text("Tap again to finish")').click();
    await page.waitForSelector('#ctest-note', { timeout: 20000 });
    await page.locator('[role=group][aria-label="Did anything look wrong or out of place?"] button:text-is("Yes")').click();
    await page.waitForSelector('#ctest-looked');
    if (plant) await page.evaluate(() => { window.__ctNoKeep = true; });
    for (const id of ['ctest-looked', 'ctest-note']) await field(page, id, keep, tag, results, !plant);
  } catch (e) {
    results.push({ tag: `${tag} could not run`, ok: false, why: String(e.message).split('\n')[0] });
  }
  await ctx.close();
  return results;
}

const t0 = Date.now();
const srv = await server();
const browser = await chromium.launch();
let fails = 0;
try {
  for (const c of CASES)
    for (const kb of c.kb) {
      for (const r of await run(browser, srv.url, c, kb, false)) {
        if (!r.ok) fails++;
        console.log(`${r.ok ? '✓' : '✗'} ${r.tag}${r.top !== undefined ? ` (box ${r.top}-${r.bottom})` : ''}${r.ok ? '' : `: ${r.why}`}`);
      }
    }
  // the planted failure: keep-in-view off, upright with the 50% keyboard: the note must be caught
  const planted = await run(browser, srv.url, CASES[0], 0.5, true);
  const caught = planted.some((r) => !r.ok && /ctest-note/.test(r.tag));
  console.log(`${caught ? '✓' : '✗'} planted: with the keep-in-view off, the check ${caught ? 'goes red as it must' : 'STAYS GREEN: the check is broken'}`);
  if (!caught) fails++;
} finally {
  await browser.close();
  srv.stop();
}
console.log(`\n${fails ? `FAIL: ${fails}` : 'PASS'} (${Math.round((Date.now() - t0) / 1000)} s; stills in reference/qa/tester-page-1106/keyboard/)`);
process.exit(fails ? 1 : 0);
