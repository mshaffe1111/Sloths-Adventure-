// PROOF-1 item 5: the shipping build played as a player, touch only, real time (30 fps loop), upright 390x844 and sideways 844x390.
//   node menus.mjs <base url> <tag> <save: fresh|done> <view: up|side> [stages comma list]
// Title -> Play -> map -> (each stage: tap it on the map, Play, play ~8 s by touch, pause, quit to map) -> satchel tabs + journal pages.
// Writes shots to play/shots/<tag>-<save>-<view>-NN-<name>.png and a JSON log (errors, steps) to play/logs/.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(import.meta.url)('playwright');
const [base, tag, save, viewId, stagesArg] = process.argv.slice(2);
const VIEWS = { up: { width: 390, height: 844 }, side: { width: 844, height: 390 } };
const vp = VIEWS[viewId];
const IDS = JSON.parse(fs.readFileSync(path.join(here, tag === 'main' ? 'ids-main.json' : 'ids-head.json'), 'utf8'));
const stages = (stagesArg || '').split(',').filter(Boolean);
const shotsDir = path.join(here, 'shots'); fs.mkdirSync(shotsDir, { recursive: true });
const logsDir = path.join(here, 'logs'); fs.mkdirSync(logsDir, { recursive: true });
const name = `${tag}-${save}-${viewId}`;
const log = { name, base, steps: [], errors: [], console: [], misses: [] };
let n = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
page.on('pageerror', (e) => log.errors.push({ at: log.steps.at(-1) ?? 'start', msg: e.message }));
page.on('console', (m) => { if (m.type() === 'error') log.console.push({ at: log.steps.at(-1) ?? 'start', msg: m.text().slice(0, 300) }); });
const shot = async (what) => {
  const f = path.join(shotsDir, `${name}-${String(++n).padStart(2, '0')}-${what.replace(/\W+/g, '_')}.png`);
  await page.screenshot({ path: f });
  log.steps.push(what);
  return f;
};
const tap = async (sel, timeout = 20000) => {
  const l = page.locator(sel).first();
  await l.waitFor({ state: 'visible', timeout });
  const b = await l.boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(700);
};
const tryStep = async (what, fn) => {
  try { await fn(); } catch (e) {
    log.misses.push(`${what}: ${String(e.message).split('\n')[0].slice(0, 200)}`);
    await shot(`MISS-${what}`).catch(() => {});
  }
};
// touch: steering thumb (left) slid right, action thumb flick up (TouchController.tsx)
let steer = null;
const pts = () => (steer ? [{ x: steer.x, y: steer.y, id: 1 }] : []);
async function steerRight() {
  steer = { x: Math.round(vp.width * 0.18), y: Math.round(vp.height * 0.72) };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts() });
  for (let k = 1; k <= 4; k++) { steer.x += 18; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts() }); await sleep(25); }
}
async function lift() { if (!steer) return; const p = { x: steer.x, y: steer.y, id: 1 }; steer = null; await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [p] }); }
async function flickUp() {
  let a = { x: Math.round(vp.width * 0.78), y: Math.round(vp.height * 0.62), id: 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [...pts(), a] });
  for (let k = 0; k < 4; k++) { await sleep(15); a = { ...a, y: a.y - 20 }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [...pts(), a] }); }
  await sleep(40);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [a] });
}

async function seed(kind) {
  await page.evaluate(({ kind, IDS }) => {
    const L = localStorage;
    L.clear();
    if (kind === 'fresh') return;
    L.setItem('sloth_howto_seen', '1');
    L.setItem('sloth_coach_done', '1');
    L.setItem('sloth_difficulty', 'normal');
    const kinds = ['snake', 'boa', 'turtle', 'ocelot', 'jaguar'];
    let n = 0;
    for (let w = 1; w <= 10; w++) {
      for (const m of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'M']) {
        n++;
        const id = `${w}-${m}`;
        L.setItem(`sloth_lvl_${id}`, JSON.stringify({ completed: true, stars: 3, highScore: 3000 + n * 50, bestTime: 120 + ((n * 37) % 200) }));
        const ft = 30 + (n % 12), t = 80 + ((n * 41) % 230), ll = n % 3;
        const first = { t, ll, hl: ll + 1, fl: ft - (n % 5), ft, st: 3, k: 2 + (n % 6), kt: kinds[(w + n) % kinds.length], ch: n % 4, fr: 0, sw: n % 9, fd: [], md: [], d: 1793000000000 + n * 3600000 };
        L.setItem(`sloth_play_${id}`, JSON.stringify({ v: 1, n: 1 + (n % 3), w: 1 + (n % 2), bt: t - 10, bs: 3, first }));
      }
      L.setItem(`sloth_story_w${w}`, '1');
    }
    const seen = IDS.creatures;
    L.setItem('sloth_finds', JSON.stringify({ v: 1, found: IDS.finds }));
    L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: IDS.memories }));
    L.setItem('sloth_badges', JSON.stringify({ v: 1, earned: Object.fromEntries(IDS.badges.map((b, i) => [b, 1793000000000 + i * 60000])), kills: Object.fromEntries(seen.map((s, i) => [s, 3 + i])), seen, counters: {}, quiet: [] }));
  }, { kind, IDS });
}
const home = async () => {
  await page.goto(base);
  await page.locator('.ttl-play').waitFor({ state: 'visible', timeout: 40000 });
  await sleep(3000);
};
const toMap = async () => {
  await home();
  await tap('.ttl-leaf >> nth=0');
  await sleep(800);
  if (await page.locator('.mp-card').count()) { await shot('who-is-exploring'); await tap('.mp-row button >> nth=1'); }
  // a fresh save may show a story first
  for (let i = 0; i < 12 && !(await page.locator('.wm-head').count()); i++) {
    if (i === 0) await shot('before-map');
    const skip = page.locator('button:has-text("Skip"), .sp-skip').first();
    if (await skip.count()) await skip.evaluate((e) => e.click()); else await page.touchscreen.tap(vp.width / 2, vp.height / 2);
    await sleep(1200);
  }
  await page.locator('.wm-head').waitFor({ timeout: 20000 });
  await sleep(1200);
};
const toWorld = async (w) => {
  for (let i = 0; i < 12; i++) {
    const t = await page.locator('.wm-name').first().getAttribute('aria-label');
    const cur = Number(/World (\d+)/.exec(t)?.[1]);
    if (cur === w) return;
    await tap(cur > w ? '.wm-arrow[aria-label="Previous world"]' : '.wm-arrow[aria-label="Next world"]');
    await sleep(500);
  }
  throw new Error('could not reach world ' + w);
};


// from wherever we are to a live stage: the explorer question, the map's Play, story pages skipped the way a player skips them
async function intoStage(id, fromMap) {
  let played = !fromMap;
  for (let i = 0; i < 40; i++) {
    if (await page.locator('.vh-menu').count() && await page.locator('.vh-menu').first().isVisible()) return;
    if (await page.locator('.mp-card').count()) { await shot('who-is-exploring'); await tap('.mp-row button >> nth=1'); continue; }
    if (!played && await page.locator('.wm-head').count()) { await shot('map-fresh'); await tap(`[aria-label^="Stage ${id}:"]`); await shot(`map-${id}-picked`); if (await page.locator('.wm-play').count()) await tap('.wm-play', 5000).catch(() => {}); played = true; continue; }
    const skip = page.locator('button:has-text("Skip")').first();
    if (await skip.count() && await skip.isVisible()) { await shot(`${id}-before-${i}`); await skip.evaluate((e) => e.click()); await sleep(1200); continue; }
    const go = page.locator('.boss-card button, button:has-text("Fight"), button:has-text("Let\'s go"), button:has-text("Start")').first();
    if (await go.count() && await go.isVisible()) { await shot(`${id}-card-${i}`); await go.evaluate((e) => e.click()); await sleep(1200); continue; }
    await sleep(1000);
  }
  throw new Error('no live stage after 40 tries: ' + id);
}

const t0 = Date.now();
await page.goto(base);
await seed(save);
await home();
await shot('title');

if (save === 'fresh') {
  // a first player: Play, through whatever comes first, to the map and into 1-1
  await tryStep('fresh-play', async () => {
    await tap('.ttl-leaf >> nth=0');
    await sleep(1500);
    await shot('after-play-tap');
    await intoStage('1-1', true);
    await sleep(5000);
    await shot('1-1-fresh-start');
    await steerRight();
    await sleep(2500);
    await flickUp();
    await sleep(1500);
    await shot('1-1-fresh-playing');
    await lift();
    await sleep(800);
    await tap('.vh-menu');
    await sleep(900);
    await shot('pause-fresh');
  });
} else {
  await tryStep('map', async () => { await toMap(); await shot('map'); });
  for (const id of stages) {
    await tryStep(`stage-${id}`, async () => {
      const w = Number(id.split('-')[0]);
      if (!(await page.locator('.wm-head').count())) await toMap();
      await toWorld(w);
      await tap(`[aria-label^="Stage ${id}:"]`);
      await shot(`map-${id}-picked`);
      if (await page.locator('.wm-play').count()) await tap('.wm-play', 5000).catch(() => {});
      await intoStage(id, false);
      await sleep(5000);
      await shot(`${id}-start`);
      await steerRight();
      await sleep(2000);
      await flickUp();
      await sleep(1800);
      await shot(`${id}-playing`);
      await lift();
      await tap('.vh-menu');
      await sleep(900);
      await shot(`${id}-pause`);
      // quit to the map from the pause menu
      const q = page.locator('.pm-card button:has-text("Map"), .pm-card button:has-text("Quit"), .pm-card button:has-text("Leave")').first();
      await q.evaluate((e) => e.click());
      await sleep(1500);
      const yes = page.locator('button:has-text("Yes"), button:has-text("Leave")').first();
      if (!(await page.locator('.wm-head').count()) && (await yes.count())) { await yes.evaluate((e) => e.click()); await sleep(1500); }
      if (!(await page.locator('.wm-head').count())) await toMap();
    });
  }
}

// the satchel: every tab, the journal's first pages
await tryStep('satchel', async () => {
  await home();
  await tap('.ttl-leaf-satchel');
  await sleep(1200);
  const tabs = await page.locator('.sh-tab').evaluateAll((els) => els.map((e) => e.innerText.trim()));
  for (const t of tabs) {
    await tap(`.sh-tab:has-text("${t}")`);
    await sleep(900);
    await shot(`satchel-${t}`);
    if (t === 'Journal') {
      for (let pg = 0; pg < 3 && (await page.locator('.jb-arrow[aria-label="Turn the page"]:not([disabled])').count()); pg++) {
        await tap('.jb-arrow[aria-label="Turn the page"]');
        await sleep(900);
        await shot(`journal-p${pg + 2}`);
      }
    }
  }
});

log.seconds = Math.round((Date.now() - t0) / 1000);
fs.writeFileSync(path.join(logsDir, `${name}.json`), JSON.stringify(log, null, 2));
console.log(`${name}: ${log.steps.length} shots, ${log.errors.length} page errors, ${log.console.length} console errors, ${log.misses.length} misses, ${log.seconds}s`);
for (const e of log.errors) console.log('  PAGEERROR', e.at, e.msg.slice(0, 200));
for (const e of log.console) console.log('  CONSOLE', e.at, e.msg.slice(0, 200));
for (const m of log.misses) console.log('  MISS', m);
await browser.close();
