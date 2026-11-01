/**
 * The clip check (PERFORMANCE-RULES.md §8.7, CONTINUOUS-IMPROVEMENT.md defect 4): a gate step that opens every menu screen and pop-up
 * on a phone-sized page and fails when text is cut off or a button is too small or under the notch.
 *
 *   node tools/perf/clipcheck.mjs                 (about 2-3 minutes; exit 1 on a new breach, 2 when a screen could not be opened)
 *   CLIPCHECK_URL=http://127.0.0.1:4301 node tools/perf/clipcheck.mjs   (use a server that is already running)
 *   CLIPCHECK_ONLY=journal node tools/perf/clipcheck.mjs                 (only judge screens whose name contains "journal")
 *   CLIPCHECK_WALKS=fresh:up,done:side node tools/perf/clipcheck.mjs     (only these walks)
 *   CLIPCHECK_OUT=<dir> node tools/perf/clipcheck.mjs                    (results there instead of a temp folder)
 *
 * It builds the game into a temp folder and serves it with vite preview on a free port, then walks the menus at 412x915 (upright) and 915x412 (sideways) on three
 * seeded saves, six walks side by side:
 *   fresh   nothing played
 *   old     Worlds 1-3 cleared the old way: stage records only, no play records (the save that showed Matt the filler journal)
 *   done    every stage cleared with play records, every find, scene and creature, every medal
 * Screens: the start screen; Settings and every tab (Save / Load and the New Game question); About and its pop-ups; How to Play and
 * its tabs; the World Map, every world and the Worlds pop-up; every Satchel tab with the find reader, a keepsake, a medal close-up and
 * a creature's story; every Journal page; Pause in a stage. Every scroll box on a screen is also judged scrolled to the bottom.
 * Phone insets are set through Chrome's own safe-area override (upright: 48 px top, 24 px bottom; sideways: 48 px each side, 21 px
 * bottom), so env(safe-area-inset-*) in the CSS gets real numbers.
 *
 * A breach is one of:
 *   overflow   an element's own text is wider or taller than its box (scrollWidth/scrollHeight past clientWidth/clientHeight) and the
 *              box does not scroll that way
 *   cut        a line of text runs past an ancestor whose overflow is hidden or clip, or off the side of the screen
 *   small      a tappable thing (button, link, tab, input, role=button...) under 44 px on a side (a pseudo-element hit area counts)
 *   inset      a tappable thing inside the unsafe insets (notch, status bar, gesture bar); inside a scroll box it can scroll clear,
 *              so only the insets across the box's scroll axis count (a vertical list in the sideways notch band still fails)
 * Each breach prints with the screen, the size, the save, a selector and the text. Breaches listed in clipknown.json (the debt on main
 * when the check was built, each with a group and an owner) print as "known" and don't fail. The list only shrinks (LAWS.md law 5): an
 * entry that no longer shows up fails the check until it is deleted, and knowncheck.mjs fails when one is added. A contact sheet of every
 * screen with a breach (outlined red, numbered) is written to <out>/contact.jpg.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
// (playwright is installed globally in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = require('playwright');
const KNOWN = JSON.parse(fs.readFileSync(path.join(here, 'clipknown.json'), 'utf8'));
// (CLIPCHECK_OUT=<dir>: write the results there, e.g. for CI to keep; else a fresh temp folder)
const out = process.env.CLIPCHECK_OUT ? path.resolve(process.env.CLIPCHECK_OUT) : fs.mkdtempSync(path.join(os.tmpdir(), 'clipcheck-'));
fs.mkdirSync(path.join(out, 'shots'), { recursive: true });
const ONLY = process.env.CLIPCHECK_ONLY || '';
const MIN_TAP = 44;
const SIZES = [
  { id: 'up', viewport: { width: 412, height: 915 }, insets: { top: 48, bottom: 24, left: 0, right: 0 } },
  { id: 'side', viewport: { width: 915, height: 412 }, insets: { top: 0, bottom: 21, left: 48, right: 48 } },
];
const SAVES = ['fresh', 'old', 'done'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

// a production build served by vite preview: six pages load it far faster than the dev server's thousand modules
async function startServer() {
  const dist = path.join(out, 'dist');
  const b = spawn('npx', ['vite', 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  let blog = '';
  b.stdout.on('data', (d) => (blog += d));
  b.stderr.on('data', (d) => (blog += d));
  const code = await new Promise((r) => b.on('exit', r));
  if (code) throw new Error(`vite build failed:\n${blog}`);
  const port = await freePort();
  const p = spawn('npx', ['vite', 'preview', '--outDir', dist, '--port', String(port), '--host', '127.0.0.1', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let log = '';
  p.stdout.on('data', (d) => (log += d));
  p.stderr.on('data', (d) => (log += d));
  for (let i = 0; i < 120; i++) {
    if (/Local:/.test(log.replace(/\x1b\[[0-9;]*m/g, ''))) return { url: `http://127.0.0.1:${port}`, stop: () => { try { process.kill(-p.pid); } catch { /* gone */ } } };
    await sleep(500);
  }
  throw new Error(`vite preview did not start:\n${log}`);
}

// the ids the saves need, read from the game's own data (clipseed.ts), so they never go stale
const IDS = await new Promise((res, rej) => {
  const p = spawn('npx', ['tsx', path.join(here, 'clipseed.ts')], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
  let s = '';
  p.stdout.on('data', (d) => (s += d));
  p.on('exit', (c) => (c ? rej(new Error('clipseed.ts failed')) : res(JSON.parse(s))));
});

// ---- the saves --------------------------------------------------------------------------------------------------------------------
async function seed(page, kind) {
  await page.evaluate(({ kind, IDS }) => {
    const L = localStorage;
    L.clear();
    L.setItem('sloth_howto_seen', '1');
    L.setItem('sloth_coach_done', '1');
    if (kind === 'fresh') return;
    const worlds = kind === 'old' ? 3 : 10;
    const kinds = ['snake', 'boa', 'turtle', 'ocelot', 'jaguar'];
    let n = 0;
    for (let w = 1; w <= worlds; w++) {
      for (let m = 1; m <= 10; m++) {
        n++;
        const id = `${w}-${m}`;
        const stars = kind === 'done' ? 3 : 1 + ((w * 7 + m * 3) % 3);
        L.setItem(`sloth_lvl_${id}`, JSON.stringify({ completed: true, stars, highScore: 3000 + n * 50, bestTime: 120 + ((n * 37) % 200) }));
        if (kind === 'done') {
          const ft = 30 + (n % 12), t = 80 + ((n * 41) % 230), ll = n % 3;
          const first = { t, ll, hl: ll + 1, fl: ft - (n % 5), ft, st: stars, k: 2 + (n % 6), kt: kinds[(w + m) % kinds.length], ch: n % 4, fr: m === 6 ? 2 : 0, sw: n % 9, fd: [], md: [], d: 1793000000000 + n * 3600000 };
          L.setItem(`sloth_play_${id}`, JSON.stringify({ v: 1, n: 1 + (n % 3), w: 1 + (n % 2), bt: t - 10, bs: stars, first }));
        }
      }
      L.setItem(`sloth_story_w${w}`, '1');
    }
    if (kind === 'old') {
      L.setItem('sloth_finds', JSON.stringify({ v: 1, found: ['w1_note', 'w1_keepsake', 'w2_note'] }));
      L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: ['waiting', 'horn'] }));
      L.setItem('sloth_badges', JSON.stringify({ v: 1, earned: {}, kills: { snake: 5 }, seen: ['snake'], counters: {}, quiet: [] }));
      return;
    }
    const seen = IDS.creatures;
    const earned = Object.fromEntries(IDS.badges.map((b, i) => [b, 1793000000000 + i * 60000]));
    L.setItem('sloth_finds', JSON.stringify({ v: 1, found: IDS.finds }));
    L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: IDS.memories }));
    L.setItem('sloth_badges', JSON.stringify({ v: 1, earned, kills: Object.fromEntries(seen.map((s, i) => [s, 3 + i])), seen, counters: {}, quiet: [] }));
  }, { kind, IDS });
}

// ---- the judge, run in the page ---------------------------------------------------------------------------------------------------
// returns the breaches on screen now; with scrolled=true every scroll box was first scrolled to its end
function audit({ minTap, insets }) {
  const W = innerWidth, H = innerHeight, TOL = 2;
  const vis = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < H && r.left < W;
  };
  const sel = (el) => {
    const one = (e) => {
      const c = [...e.classList].filter((k) => !/^(on|got|open|lock|sel|active)$/.test(k) && !/[:[\]/]/.test(k)).slice(0, 2);
      return c.length ? `.${c.join('.')}` : e.getAttribute('role') ? `${e.tagName.toLowerCase()}[role=${e.getAttribute('role')}]` : e.tagName.toLowerCase();
    };
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) parts.unshift(one(e));
    return parts.join(' > ');
  };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const label = (el) => (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 70);
  const scrolls = (cs, axis) => /auto|scroll/.test(axis === 'x' ? cs.overflowX : cs.overflowY);
  const out = [];
  const seen = new Set();
  const add = (kind, el, text, detail, box) => {
    const s = sel(el);
    const k = `${kind}|${s}|${text}`;
    if (seen.has(k)) return;
    seen.add(k);
    const r = box || el.getBoundingClientRect();
    out.push({ kind, sel: s, text, detail, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
  };
  const all = [...document.body.querySelectorAll('*')].filter((el) => !el.closest('[data-clipcheck-skip],svg,canvas,script,style,.cc-overlay'));
  for (const el of all) {
    const t = ownText(el);
    if (!t || !vis(el)) continue;
    const cs = getComputedStyle(el);
    // glyphs reach past a tight line box (a plaque at line-height 1) by up to about a third of the font size; that is not a cut
    const tolY = Math.max(TOL + 2, parseFloat(cs.fontSize) * 0.34);
    // overflow: the element's own text spills out of its box
    if (cs.display !== 'inline' && cs.display !== 'contents') {
      const ox = el.scrollWidth - el.clientWidth, oy = el.scrollHeight - el.clientHeight;
      if (el.clientWidth > 0 && ox > TOL && !scrolls(cs, 'x')) add('overflow', el, t.slice(0, 70), `${ox}px wider than its box`);
      else if (el.clientHeight > 0 && oy > tolY && !scrolls(cs, 'y')) add('overflow', el, t.slice(0, 70), `${oy}px taller than its box`);
    }
    // cut: a line of the text past a hidden/clip ancestor, or off the screen's side. Walking out, a scroll box ends the search on its
    // axis: text past a scroll box's edge is only scrolled away, and the check scrolls every box to its end as well.
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const rects = [...rg.getClientRects()].filter((r) => r.width > 1);
      let done = false;
      for (const r of rects) {
        let canX = true, canY = true, hit = null, side = '';
        for (let a = el; a && a !== document.documentElement && (canX || canY); a = a.parentElement) {
          const acs = getComputedStyle(a);
          const hx = canX && /hidden|clip/.test(acs.overflowX), hy = canY && /hidden|clip/.test(acs.overflowY);
          if (hx || hy) {
            const ar = a.getBoundingClientRect();
            const L = ar.left + a.clientLeft, T = ar.top + a.clientTop, R = L + a.clientWidth, B = T + a.clientHeight;
            if (hx && r.left < L - TOL) side = 'left';
            else if (hx && r.right > R + TOL) side = 'right';
            else if (hy && r.top < T - tolY) side = 'top';
            else if (hy && r.bottom > B + tolY) side = 'bottom';
            if (side) { hit = a; break; }
          }
          if (/auto|scroll/.test(acs.overflowX)) canX = false;
          if (/auto|scroll/.test(acs.overflowY)) canY = false;
        }
        if (hit) { add('cut', el, t.slice(0, 70), `${side} cut by ${hit === el ? 'its own box' : sel(hit)} (overflow hidden)`, r); done = true; }
        else if (canX && (r.left < -TOL || r.right > W + TOL)) { add('cut', el, t.slice(0, 70), 'runs off the side of the screen', r); done = true; }
        if (done) break;
      }
    }
  }
  // tappables
  const TAP = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [role=slider], [role=checkbox], [role=link], [role=radio]';
  for (const el of document.body.querySelectorAll(TAP)) {
    if (el.closest('[data-clipcheck-skip],.cc-overlay') || el.disabled || el.getAttribute('aria-disabled') === 'true' || !vis(el)) continue;
    if (el.parentElement?.closest(TAP)) continue; // a tappable inside another tappable: the outer one is the target
    if (getComputedStyle(el).pointerEvents === 'none') continue;
    const r = el.getBoundingClientRect();
    // a pseudo-element can make the hit area bigger than the box
    let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (const ps of ['::before', '::after']) {
      const p = getComputedStyle(el, ps);
      if (p.content === 'none' || p.position !== 'absolute' || p.pointerEvents === 'none') continue;
      const px = (v) => (v.endsWith('px') ? parseFloat(v) : NaN);
      const [pl, pt, pr, pb] = [px(p.left), px(p.top), px(p.right), px(p.bottom)];
      if (!isNaN(pl)) L = Math.min(L, r.left + pl);
      if (!isNaN(pt)) T = Math.min(T, r.top + pt);
      if (!isNaN(pr)) R = Math.max(R, r.right - pr);
      if (!isNaN(pb)) B = Math.max(B, r.bottom - pb);
    }
    // the layout size, so a pop-in scale doesn't count (offsetWidth ignores transforms; SVG has none, so its box is used)
    const w = Math.max(R - L, el.offsetWidth || 0), h = Math.max(B - T, el.offsetHeight || 0);
    if (w < minTap - 0.5 || h < minTap - 0.5) add('small', el, label(el), `${Math.round(w)}x${Math.round(h)} px tap area`);
    // inside a scroll box it scrolls clear of the insets on that box's axis (a list that scrolls up and down still sits in the
    // notch band at the side)
    let sx = false, sy = false;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (/auto|scroll/.test(acs.overflowY) && a.scrollHeight > a.clientHeight + 4) sy = true;
      if (/auto|scroll/.test(acs.overflowX) && a.scrollWidth > a.clientWidth + 4) sx = true;
    }
    const inT = !sy && r.top < insets.top - TOL && insets.top > 0, inB = !sy && r.bottom > H - insets.bottom + TOL && insets.bottom > 0;
    const inL = !sx && r.left < insets.left - TOL && insets.left > 0, inR = !sx && r.right > W - insets.right + TOL && insets.right > 0;
    if ((inT || inB || inL || inR) && r.top < H && r.bottom > 0) add('inset', el, label(el), `inside the ${[inT && 'top', inB && 'bottom', inL && 'left', inR && 'right'].filter(Boolean).join('+')} inset`);
  }
  // text both overflowing and cut: report the cut only
  const cuts = new Set(out.filter((x) => x.kind === 'cut').map((x) => `${x.sel}|${x.text}`));
  return out.filter((x) => x.kind !== 'overflow' || !cuts.has(`${x.sel}|${x.text}`));
}

// scroll every scroll box (and the page) to its end; returns how many moved
const scrollAll = (page) => page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if ((/auto|scroll/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 4) || (/auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 4)) {
      el.scrollTop = el.scrollHeight;
      el.scrollLeft = el.scrollWidth;
      n++;
    }
  }
  if (document.scrollingElement && document.scrollingElement.scrollHeight > innerHeight + 4) { document.scrollingElement.scrollTop = 1e6; n++; }
  return n;
});

// ---- one walk: one save at one size -----------------------------------------------------------------------------------------------
async function walk(browser, base, save, size) {
  const tag = `${save} ${size.id}`;
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: size.insets });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const found = [];
  const missed = [];
  let shotN = 0;
  const settle = (ms = 550) => page.waitForTimeout(ms);

  const judge = async (screen) => {
    if (ONLY && !screen.includes(ONLY)) return;
    const take = async (name) => {
      // let the pictures load and every finite animation and transition end (a card popping in, the map panning), at most 2.5 s
      await page.evaluate(() => Promise.race([
        Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))).then(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {})))),
        new Promise((r) => setTimeout(r, 2500)),
      ]));
      const b = await page.evaluate(audit, { minTap: MIN_TAP, insets: size.insets });
      if (!b.length) return;
      // the contact sheet: outline each breach, number it, shoot the screen
      const file = path.join(out, 'shots', `${save}-${size.id}-${String(++shotN).padStart(2, '0')}.png`);
      await page.evaluate((b) => {
        const o = document.createElement('div');
        o.className = 'cc-overlay';
        o.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
        b.forEach((x, i) => {
          const d = document.createElement('div');
          d.style.cssText = `position:fixed;left:${x.box[0]}px;top:${x.box[1]}px;width:${x.box[2]}px;height:${x.box[3]}px;outline:2px solid #f0f;background:rgba(255,0,255,.12)`;
          d.innerHTML = `<b style="position:absolute;left:-2px;top:-15px;font:bold 11px/13px sans-serif;background:#f0f;color:#fff;padding:0 3px">${i + 1}</b>`;
          o.appendChild(d);
        });
        document.body.appendChild(o);
      }, b);
      await page.screenshot({ path: file });
      await page.evaluate(() => document.querySelector('.cc-overlay')?.remove());
      b.forEach((x, i) => found.push({ ...x, n: i + 1, screen: name, save, size: size.id, shot: file }));
    };
    await take(screen);
    if (await scrollAll(page)) {
      await settle(300);
      await take(`${screen} (scrolled to the end)`);
    }
  };
  const tryStep = async (what, fn) => {
    try { await fn(); } catch (e) {
      const m = String(e.message).split('\n');
      const loc = m.find((l) => /waiting for locator/.test(l)) || '';
      const file = path.join(out, 'shots', `miss-${save}-${size.id}-${what.replace(/\W+/g, '_')}.png`);
      await page.screenshot({ path: file }).catch(() => {});
      missed.push(`${what}: ${m[0].slice(0, 100)} ${loc.trim().slice(0, 120)} (screen: ${file})`);
    }
  };
  const back = async () => { await page.keyboard.press('Escape'); await settle(450); };
  // navigation taps go straight to the element (the check judges what is on screen, not Playwright's hit-testing; a toast over an
  // arrow must not stall the walk)
  const click = async (selector) => {
    await page.locator(selector).first().waitFor({ state: 'attached', timeout: 8000 });
    await page.locator(selector).first().evaluate((e) => e.click());
    await settle();
  };
  const home = async () => {
    await page.goto(`${base}/?lessons=off`);
    await page.locator('.ttl-play').waitFor({ state: 'visible', timeout: 30000 });
    await settle(2500);
  };

  await page.goto(`${base}/?lessons=off`);
  await seed(page, save);
  await home();
  await judge('start screen');

  // Settings, every tab, and the pop-ups behind its buttons
  await tryStep('settings', async () => {
    await click('.ttl-token[aria-label="Settings"]');
    const tabs = await page.locator('.st-tab').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || e.textContent.trim()));
    for (const t of tabs) {
      await click(`.st-tab[aria-label="${t}"]`);
      await judge(`settings: ${t}`);
      if (t === 'Saves') {
        await tryStep('save/load', async () => { await click('.st-row:has-text("Save / Load") .st-btn'); await judge('settings: Save / Load'); await back(); });
        if (save !== 'fresh') await tryStep('new game question', async () => { await click('.st-row:has-text("New Game") .st-btn'); await judge('settings: New Game question'); await back(); });
      }
      if (t === 'About') {
        // every pop-up the About page opens (not the tester credit, not Install, not the update check)
        const n = await page.locator('.st-page button:not(.title-credit-btn):not(:has-text("Install")):not(:has-text("update"))').count();
        for (let i = 0; i < n; i++) {
          await tryStep(`about pop-up ${i + 1}`, async () => {
            const b = page.locator('.st-page button:not(.title-credit-btn):not(:has-text("Install")):not(:has-text("update"))').nth(i);
            const name = (await b.innerText()).trim().slice(0, 30);
            await b.evaluate((e) => e.click());
            await settle();
            await judge(`about: ${name}`);
            await scrollAll(page);
            await back();
          });
        }
      }
    }
    await back();
  });

  // How to Play and its tabs
  await tryStep('how to play', async () => {
    await home();
    await click('.ttl-leaf:has-text("How to Play")');
    await judge('how to play');
    const tabs = page.locator('[role=dialog] [role=tab], .jr-intro-tabs [role=tab]');
    const n = await tabs.count();
    for (let i = 1; i < n; i++) { await tabs.nth(i).evaluate((e) => e.click()); await settle(); await judge(`how to play: tab ${i + 1}`); }
  });

  // the World Map: every world, then the Worlds pop-up
  await tryStep('world map', async () => {
    await home();
    await click('.ttl-leaf >> nth=0');
    // a fresh save asks who is exploring first
    if (await page.locator('.mp-card').count()) {
      await judge('who is exploring');
      await click('.mp-row button >> nth=1');
    }
    await page.locator('.wm-head').waitFor({ timeout: 10000 });
    await settle(900);
    // start from World 1
    for (let i = 0; i < 12 && (await page.locator('.wm-arrow[aria-label="Previous world"]:not([disabled])').count()); i++) await click('.wm-arrow[aria-label="Previous world"]');
    const NEXT = '.wm-arrow[aria-label="Next world"]:not([disabled]):not([data-locked])';
    for (let w = 1; w <= 12; w++) {
      const name = (await page.locator('.wm-prog-w').first().innerText().catch(() => `world ${w}`)).trim();
      await judge(`world map: ${name}`);
      if (!(await page.locator(NEXT).count())) break;
      await click(NEXT);
    }
    await click('.wm-name');
    await judge('world map: Worlds pop-up');
    await back();
  });

  // the Satchel: every tab and its pop-ups; the Journal page by page
  await tryStep('satchel', async () => {
    await home();
    await click('.ttl-leaf-satchel');
    const tabs = await page.locator('.sh-tab').evaluateAll((els) => els.map((e) => e.innerText.trim()));
    for (const t of tabs) {
      await click(`.sh-tab:has-text("${t}")`);
      await judge(`satchel: ${t}`);
      if (t === 'Finds') {
        await tryStep('find reader', async () => {
          if (!(await page.locator('.tr-find.open').count())) return;
          await click('.tr-sec:has-text("Notes from Meeca") + .tr-grid .tr-find.open, .tr-sec:has-text("Photo albums") + .tr-grid .tr-find.open');
          await judge('satchel: find reader');
          await back();
        });
        await tryStep('keepsake', async () => {
          if (!(await page.locator('.tr-sec:has-text("Keepsakes") + .tr-grid .tr-find.open').count())) return;
          await click('.tr-sec:has-text("Keepsakes") + .tr-grid .tr-find.open');
          await page.evaluate(() => document.querySelector('.sc-page')?.scrollIntoView({ block: 'start' }));
          await settle(300);
          await judge('satchel: keepsake story');
        });
      }
      if (t === 'Trophies') {
        await tryStep('medal close-up', async () => { await click('.st-medal.got, .st-medal'); await judge('satchel: medal close-up'); await back(); });
      }
      if (t === 'Creatures') {
        await tryStep('creature story', async () => {
          if (!(await page.locator('.tr-card.sc-tap').count())) return;
          await click('.tr-card.sc-tap');
          await judge('satchel: creature story');
          await back();
        });
      }
      if (t === 'Journal') {
        // back to the first page, then every page to the last
        for (let i = 0; i < 40 && (await page.locator('.jb-arrow[aria-label="Turn back a page"]:not([disabled])').count()); i++) await click('.jb-arrow[aria-label="Turn back a page"]');
        for (let pg = 1; pg <= 40; pg++) {
          const pn = (await page.locator('.jb-pn').first().innerText().catch(() => String(pg))).replace(/\s+/g, ' ').trim();
          if (pg > 1) await judge(`journal: page ${pn}`);
          if (!(await page.locator('.jb-arrow[aria-label="Turn the page"]:not([disabled])').count())) break;
          await click('.jb-arrow[aria-label="Turn the page"]');
        }
      }
    }
  });

  // Pause, over a stage
  await tryStep('pause', async () => {
    await home();
    await page.evaluate(() => window.__play && window.__play('1-1'));
    await settle(7000);
    await page.keyboard.press('Escape');
    await settle(900);
    await judge('pause');
  });

  await ctx.close();
  return { tag, found, missed, errors };
}

// ---- run ----------------------------------------------------------------------------------------------------------------------------
const t0 = Date.now();
console.log(`clip check: every menu screen at 412x915 and 915x412, on a fresh, an old and a finished save`);
const server = process.env.CLIPCHECK_URL ? { url: process.env.CLIPCHECK_URL.replace(/\/$/, ''), stop: () => {} } : await startServer();
const browser = await chromium.launch();
let results;
try {
  // warm vite's dependency pass once, so six pages don't race it
  { const p = await browser.newPage(); await p.goto(`${server.url}/?lessons=off`); await p.locator('.ttl-play').waitFor({ timeout: 90000 }).catch(() => {}); await p.close(); }
  const jobs = SAVES.flatMap((s) => SIZES.map((z) => [s, z])).filter(([s, z]) => !process.env.CLIPCHECK_WALKS || process.env.CLIPCHECK_WALKS.split(',').includes(`${s}:${z.id}`));
  results = await Promise.all(jobs.map(([s, z]) => walk(browser, server.url, s, z).catch((e) => ({ tag: `${s} ${z.id}`, found: [], missed: [`walk: ${e.message.split('\n')[0]}`], errors: [] }))));
} finally {
  await browser.close();
  server.stop();
}

// ---- report: one line per distinct breach, with every place it was seen ------------------------------------------------------------
const norm = (s) => s.replace(/\d+/g, '#').slice(0, 40);
const keyOf = (b) => `${b.kind}|${b.sel}|${norm(b.text)}`;
// a known tap-size or inset breach matches by its element type (selector) alone: the same kind of map node or tab, whichever one the
// walk happened to land on; text breaches match by their text too
const knownKey = (b) => (b.kind === 'small' || b.kind === 'inset' ? `${b.kind}|${b.sel}` : keyOf(b));
const knownKeys = new Set(KNOWN.known.map(knownKey));
const groups = new Map();
for (const r of results) for (const b of r.found) {
  const k = keyOf(b);
  if (!groups.has(k)) groups.set(k, { b, where: [] });
  groups.get(k).where.push(`${b.screen} @ ${b.size}/${b.save}`);
}
let fresh = 0, known = 0;
const lines = [];
const order = { cut: 0, overflow: 1, small: 2, inset: 3 };
for (const [k, { b, where }] of [...groups].sort((a, z) => order[a[1].b.kind] - order[z[1].b.kind] || a[0].localeCompare(z[0]))) {
  const isKnown = knownKeys.has(knownKey(b));
  isKnown ? known++ : fresh++;
  const uniq = [...new Set(where)];
  lines.push(`${isKnown ? '  known' : '✗'} ${b.kind} ${b.sel}  "${b.text}"  (${b.detail})`);
  lines.push(`      ${uniq.slice(0, 4).join('; ')}${uniq.length > 4 ? `; +${uniq.length - 4} more` : ''}`);
}
const missed = results.flatMap((r) => r.missed.map((m) => `${r.tag}: ${m}`));
const errs = [...new Set(results.flatMap((r) => r.errors))];
console.log('\n' + (lines.join('\n') || '✓ no breaches'));
if (missed.length) console.log(`\ncould not open:\n  ${missed.join('\n  ')}`);
if (errs.length) console.log(`\npage errors:\n  ${errs.slice(0, 6).join('\n  ')}`);
// known entries that no longer show up: delete them from clipknown.json
const live = new Set([...groups.values()].map(({ b }) => knownKey(b)));
const stale = KNOWN.known.filter((k) => !live.has(knownKey(k)));
// (only a full walk can say an entry is gone: CLIPCHECK_ONLY / CLIPCHECK_WALKS runs skip this)
const fullRun = !ONLY && !process.env.CLIPCHECK_WALKS;
if (stale.length && fullRun) console.log(`\n✗ stale known entries: fixed, so delete them from tools/perf/clipknown.json (the list only shrinks):\n  ${stale.map((k) => `${k.kind} ${k.sel} "${k.text}"`).join('\n  ')}`);
const staleN = fullRun ? stale.length : 0;
fs.writeFileSync(path.join(out, 'breaches.json'), JSON.stringify([...groups.values()].map(({ b, where }) => ({ kind: b.kind, sel: b.sel, text: b.text, detail: b.detail, where: [...new Set(where)] })), null, 1));

// the contact sheet: every screen with a breach, the breaches listed under it
const shots = new Map();
for (const r of results) for (const b of r.found) {
  if (!shots.has(b.shot)) shots.set(b.shot, { name: `${b.screen} @ ${b.size}/${b.save}`, size: b.size, items: [] });
  shots.get(b.shot).items.push(`${b.n}. ${knownKeys.has(knownKey(b)) ? '(known) ' : ''}${b.kind}: ${b.text || b.sel} (${b.detail})`);
}
if (shots.size) {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const cells = [...shots].map(([f, s]) => `<figure class="${s.size}"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"><figcaption><b>${esc(s.name)}</b>${s.items.map((i) => `<br>${esc(i)}`).join('')}</figcaption></figure>`);
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:8px;background:#222;color:#eee;font:11px/1.3 sans-serif;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
figure{margin:0;background:#333;padding:4px;width:260px}figure.side{width:420px}img{width:100%;display:block}figcaption{padding-top:4px;word-break:break-word}</style>${cells.join('')}`;
  fs.writeFileSync(path.join(out, 'contact.html'), html);
  const b2 = await chromium.launch();
  const p = await b2.newPage({ viewport: { width: 1400, height: 900 } });
  await p.setContent(html);
  await p.screenshot({ path: path.join(out, 'contact.jpg'), fullPage: true, type: 'jpeg', quality: 70 });
  await b2.close();
}
const secs = Math.round((Date.now() - t0) / 1000);
const verdict = fresh ? `FAIL: ${fresh} new breach(es)` : staleN ? `FAIL: ${staleN} stale known entr${staleN === 1 ? 'y' : 'ies'}` : missed.length ? 'FAIL: some screens could not be opened' : 'PASS';
console.log(`\n${verdict}${known ? ` (${known} known)` : ''} (${secs} s; contact sheet and breaches.json in ${out})`);
process.exit(fresh || staleN ? 1 : missed.length ? 2 : 0);
