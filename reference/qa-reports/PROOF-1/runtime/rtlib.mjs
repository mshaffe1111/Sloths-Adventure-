// PROOF-1 runtime helpers (auditor's tool, not production code): drive the SHIPPED static build (no dev hooks) with Playwright.
// The engine is found through React's fiber tree (the App's engineRef hook), so the build under test is exactly the deploy build.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
export const { chromium } = require('playwright');
export const here = path.dirname(fileURLToPath(import.meta.url));
export const HEAD = 'http://127.0.0.1:8801/Sloths-Adventure-/';
export const MAIN = 'http://127.0.0.1:8802/Sloths-Adventure-/';
export const IDS = JSON.parse(fs.readFileSync(path.join(here, 'ids.json'), 'utf8'));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** a finished game (every stage 3 stars, every find, memory, badge), as clipcheck.mjs seeds it */
export function seedDone(IDS) {
  const L = localStorage;
  L.clear();
  L.setItem('sloth_howto_seen', '1');
  L.setItem('sloth_coach_done', '1');
  let n = 0;
  for (let w = 1; w <= 10; w++) {
    for (let m = 1; m <= 10; m++) {
      n++;
      L.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify({ completed: true, stars: 3, highScore: 3000 + n * 50, bestTime: 120 + ((n * 37) % 200) }));
    }
    L.setItem(`sloth_story_w${w}`, '1');
  }
  const seen = IDS.creatures;
  const earned = Object.fromEntries(IDS.badges.map((b, i) => [b, 1793000000000 + i * 60000]));
  L.setItem('sloth_finds', JSON.stringify({ v: 1, found: IDS.finds }));
  L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: IDS.memories }));
  L.setItem('sloth_badges', JSON.stringify({ v: 1, earned, kills: Object.fromEntries(seen.map((s, i) => [s, 3 + i])), seen, counters: {}, quiet: [] }));
}

/** installs window.__probeEngine() in the page: the running GameEngine, found from React's fiber hooks */
export const PROBE = () => {
  window.__probeEngine = () => {
    const root = document.getElementById('root');
    if (!root) return null;
    const k = Object.keys(root).find((x) => x.startsWith('__reactContainer$'));
    if (!k) return null;
    const stack = [root[k]];
    let guard = 0;
    while (stack.length && guard++ < 200000) {
      const f = stack.pop();
      if (!f) continue;
      let h = f.memoizedState;
      let hg = 0;
      while (h && typeof h === 'object' && 'next' in h && hg++ < 200) {
        const v = h.memoizedState;
        const c = v && typeof v === 'object' && 'current' in v ? v.current : null;
        if (c && typeof c === 'object' && c.player && ('clock' in c || 'gameTime' in c) && typeof c.update === 'function') return c;
        h = h.next;
      }
      if (f.sibling) stack.push(f.sibling);
      if (f.child) stack.push(f.child);
    }
    return null;
  };
};

export async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 412, height: 915 }, hasTouch: true, ...(opts.ctx ?? {}) });
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('pageerror', (e) => errors.push(String(e.message ?? e)));
  page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.addInitScript(PROBE);
  return { ctx, page, errors, failed };
}

export const click = async (page, sel) => { await page.locator(sel).first().waitFor({ timeout: 15000 }); await page.locator(sel).first().evaluate((e) => e.click()); await sleep(400); };

/** title -> map */
export async function toMap(page) {
  await page.locator('.ttl-leaf').first().waitFor({ timeout: 30000 });
  await sleep(800);
  await click(page, '.ttl-leaf >> nth=0');
  if (await page.locator('.mp-card').count()) await click(page, '.mp-row button >> nth=1');
  await page.locator('.wm-head').waitFor({ timeout: 15000 });
  await sleep(600);
}

/** on the map: go to the stage's world and play it; skips any story; waits until the engine runs */
export async function playFromMap(page, id) {
  const w = Number(id.split('-')[0]);
  for (let i = 0; i < 12; i++) {
    const t = (await page.locator('.wm-prog-w').first().innerText()).trim();
    const cur = Number(t.match(/World (\d+)/)[1]);
    if (cur === w) break;
    await click(page, `.wm-arrow[aria-label="${cur < w ? 'Next' : 'Previous'} world"]`);
  }
  await click(page, `.map-node[aria-label^="Stage ${id}:"]`);
  await click(page, '.wm-play');
  return waitEngine(page);
}

export async function waitEngine(page, ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const ok = await page.evaluate(() => { const e = window.__probeEngine?.(); return !!(e && e.isRunning); }).catch(() => false);
    if (ok) return true;
    // a story or card in the way: skip it
    for (const s of ['button:has-text("Skip")', 'button:has-text("Continue")', 'button:has-text("Let\'s go")', 'button:has-text("Play")']) {
      if (await page.locator(s).count().catch(() => 0)) { await page.locator(s).first().evaluate((e) => e.click()).catch(() => {}); await sleep(300); }
    }
    await sleep(500);
  }
  return false;
}

/** the game clock of the running engine (head: clock.time(); main: gameTime) */
export const gameTime = (page) => page.evaluate(() => { const e = window.__probeEngine(); return { g: e.gameTime, paused: e.isPaused, run: e.isRunning, ask: !!e.helpAsking, down: !!e.down, hit: e.hitstopTimer, now: performance.now() }; });
