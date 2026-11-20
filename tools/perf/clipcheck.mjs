/**
 * The clip check (PERFORMANCE-RULES.md §8.7, CONTINUOUS-IMPROVEMENT.md defect 4): a gate step that opens every menu screen and pop-up
 * on a phone-sized page and fails when text is cut off or a button is too small or under the notch.
 *
 *   node tools/perf/clipcheck.mjs                 (about 2-3 minutes; exit 1 on a new breach, 2 when a screen could not be opened)
 *   CLIPCHECK_URL=http://127.0.0.1:4301 node tools/perf/clipcheck.mjs   (use a server that is already running)
 *   CLIPCHECK_ONLY=journal node tools/perf/clipcheck.mjs                 (only judge screens whose name contains "journal")
 *   CLIPCHECK_WALKS=fresh:up,done:side node tools/perf/clipcheck.mjs     (only these walks)
 *   CLIPCHECK_OUT=<dir> node tools/perf/clipcheck.mjs                    (results there instead of a temp folder)
 *   CLIPCHECK_STEPS="Dot's first tip" node tools/perf/clipcheck.mjs    (only the steps whose name holds these words, comma-separated)
 *   CLIPCHECK_CPU=6 node tools/perf/clipcheck.mjs                        (each page's CPU slowed 6x, Chrome's own throttle: a busy phone)
 *   CLIPCHECK_SHOTS=1 node tools/perf/clipcheck.mjs                      (also shoot every judged screen, breach or not, into shots/)
 *
 * It builds the game into a temp folder and serves it with vite preview on a free port, then walks the menus at 412x915 (upright) and 915x412 (sideways) on three
 * seeded saves, six walks side by side:
 *   fresh   nothing played
 *   old     Worlds 1-3 cleared the old way: stage records only, no play records (the save that showed Matt the filler journal)
 *   done    every stage cleared with play records, every find, scene and creature, every medal
 * Screens: the start screen; Settings and every tab (Save / Load and the New Game question); About and its pop-ups; How to Play and
 * its tabs; the World Map, every world and the Worlds pop-up; every Satchel tab with the find reader, a keepsake, a medal close-up and
 * a creature's story; every Journal page; Pause over a live stage (with a planted 26 px button that must be caught); on the fresh save
 * Dot's first tip with its Skip button over 1-3, and the testers' link (?ctest=1): its front page, the "I'm
 * done" badge, the end questions and the sent screen, with a planted 26 px button that must be caught every run. Every scroll box on a screen is also judged scrolled to the bottom.
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
import { pressFrame } from '../inspect/clipPress.mjs';

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
// (a step's own proof runs, R-165.245: only the named steps; and every page slowed by Chrome's CPU throttle, a busy machine on purpose)
const STEPS = (process.env.CLIPCHECK_STEPS || '').split(',').filter(Boolean);
const CPU = Number(process.env.CLIPCHECK_CPU || 0);
const SHOTS = !!process.env.CLIPCHECK_SHOTS;
const MIN_TAP = 44;
const SIZES = [
  { id: 'up', viewport: { width: 412, height: 915 }, insets: { top: 48, bottom: 24, left: 0, right: 0 } },
  { id: 'side', viewport: { width: 915, height: 412 }, insets: { top: 0, bottom: 21, left: 48, right: 48 } },
];
const SAVES = ['fresh', 'old', 'done'];
/** cards that must fit with nothing scrolled are also judged at these phones, the same way up (an iPhone 12-15's screen and insets) */
const FIT_SIZES = {
  up: [{ id: 'up390', viewport: { width: 390, height: 844 }, insets: { top: 47, bottom: 34, left: 0, right: 0 } }],
  side: [{ id: 'side844', viewport: { width: 844, height: 390 }, insets: { top: 0, bottom: 21, left: 47, right: 47 } }],
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

// a production build served by vite preview: six pages load it far faster than the dev server's thousand modules
// (`dev`: a development build, NODE_ENV=development, built as the store build (no service worker: its 4.5 MB unminified main chunk
// is over the PWA's precache limit, and the walks block service workers anyway), for the one step that needs the dev-only engine handle: the help offer, R-165.62)
async function startServer(dev = false) {
  const dist = path.join(out, dev ? 'dist-dev' : 'dist');
  const b = spawn('npx', ['vite', 'build', '--outDir', dist, '--emptyOutDir', '--logLevel', 'error'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: dev ? { ...process.env, NODE_ENV: 'development', VITE_STORE_BUILD: '1' } : process.env });
  let blog = '';
  b.stdout.on('data', (d) => (blog += d));
  b.stderr.on('data', (d) => (blog += d));
  const code = await new Promise((r) => b.on('exit', r));
  if (code) throw new Error(`vite build failed:\n${blog}`);
  // the route to the help offer drives real put-backs through window.__engine, which only a development build has: the production
  // build must not carry it (fails closed), and the development build must
  const js = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n');
  if (!dev && js.includes('__engine')) throw new Error('the production build carries the dev-only window.__engine handle');
  if (dev && !js.includes('__engine')) throw new Error('the development build has no window.__engine: the help-offer route cannot run');
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
// (scope: a selector to judge only inside, for a screen laid over another one: the testers' end questions over the stopped level)
function audit({ minTap, insets, scope, fit }) {
  const W = innerWidth, H = innerHeight, TOL = 2;
  const within = (scope && document.querySelector(scope)) || document.body;
  const shown = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
    }
    return true;
  };
  const vis = (el) => {
    if (!shown(el)) return false;
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
  const all = [...within.querySelectorAll('*')].filter((el) => !el.closest('[data-clipcheck-skip],svg,canvas,script,style,.cc-overlay'));
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
  for (const el of within.querySelectorAll(TAP)) {
    // (`fit`: a card that must fit the safe area with nothing scrolled, PROOF-1 violation 2: a tappable in it is judged where it sits
    // when the card opens, a scroll box gives it no pass, and one wholly off the screen counts too)
    const pinned = !!(fit && el.closest(fit));
    if (el.closest('[data-clipcheck-skip],.cc-overlay') || el.disabled || el.getAttribute('aria-disabled') === 'true' || !(pinned ? shown(el) && el.getBoundingClientRect().width > 0 : vis(el))) continue;
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
    for (let a = el.parentElement; !pinned && a && a !== document.documentElement; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (/auto|scroll/.test(acs.overflowY) && a.scrollHeight > a.clientHeight + 4) sy = true;
      if (/auto|scroll/.test(acs.overflowX) && a.scrollWidth > a.clientWidth + 4) sx = true;
    }
    const inT = !sy && r.top < insets.top - TOL && (insets.top > 0 || pinned), inB = !sy && r.bottom > H - insets.bottom + TOL && (insets.bottom > 0 || pinned);
    const inL = !sx && r.left < insets.left - TOL && (insets.left > 0 || pinned), inR = !sx && r.right > W - insets.right + TOL && (insets.right > 0 || pinned);
    if ((inT || inB || inL || inR) && (pinned || (r.top < H && r.bottom > 0))) add('inset', el, label(el), `inside the ${[inT && 'top', inB && 'bottom', inL && 'left', inR && 'right'].filter(Boolean).join('+')} inset${pinned ? ' (nothing scrolled)' : ''}${pinned && (r.top >= H || r.bottom <= 0) ? ', off the screen' : ''}`);
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

// ---- waiting on the page's own state, never on the clock (R-165.215 / R-165.245 / R-165.325, GATE-FLAKE 11-19) -----------------------
// Until 11-19 the walk slept a fixed time after each tap (300-7000 ms) and gave each screen 10-30 s to open. Beside 4 heavy jobs a
// screen still loading was judged (4 'stale' known entries on INT-13b's head) and one only slow to open ran out its 30 s (ENG-PROWL's).
// Now every wait ends on the page's own state, counted in the page's own animation frames (a starved box draws fewer frames, so the
// wait stretches with the load by itself):
//   STILL  no request in flight (the browser's own request events, counted per page below), every picture loaded, the fonts in, no
//          finite CSS animation or transition running, no short one-shot timer the page set still pending (the app's own delays: a card
//          armed after 1.2 s, the title's leaves), and the DOM unchanged for a run of frames in a row
//   OPEN   a screen opens when its selector shows. It FAILS when the page goes still for a long run (STILL_FAIL frames: nothing loading,
//          nothing pending, nothing moving) without it: nothing left could ever open it. A slow screen is never still: its script or
//          pictures are still coming or its card still animating, so it is waited for however long the box takes.
//   A page that never goes still (a live stage's HUD can change every frame) is bounded in FRAMES too (MAX_FRAMES: a busy box draws
//   them slower, so the bound stretches with it), and HANG_MS is only the guard against a page whose frames stopped altogether.
const SHORT_TIMER_MS = 3000;
const QUIET_FRAMES = 12;
const STILL_FAIL = 240;
const MAX_FRAMES = 4500;
const SETTLE_MAX = 300;
const HANG_MS = 600000;
// (every page of a walk: counts the DOM's changes and the page's pending short timers; installed before any of the game's own script)
function instrumentPage(SHORT) {
  if (window.__cc) return;
  const cc = (window.__cc = { mut: 0, timers: new Map() });
  const st = window.setTimeout, ct = window.clearTimeout;
  window.setTimeout = function (fn, ms, ...a) {
    const d = Number(ms) || 0;
    const id = st.call(window, function () { cc.timers.delete(id); return typeof fn === 'function' ? fn.apply(this, arguments) : (0, eval)(String(fn)); }, ms, ...a);
    if (d > 0 && d <= SHORT) cc.timers.set(id, d);
    return id;
  };
  window.clearTimeout = function (id) { cc.timers.delete(id); return ct.call(window, id); };
  new MutationObserver((l) => { cc.mut += l.length; }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
}
// (in the page: `max` frames; returns how many of the last ones in a row were still, and what moved last)
function stillFrames({ max }) {
  const cc = window.__cc;
  const moving = () => {
    if ([...document.images].some((i) => !i.complete)) return 'a picture loading';
    if (document.fonts && document.fonts.status !== 'loaded') return 'fonts loading';
    if (cc && cc.timers.size) return `${cc.timers.size} short timer(s) pending`;
    if (document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity)) return 'an animation running';
    return '';
  };
  return new Promise((done) => {
    let n = 0, run = 0, lastMut = cc ? cc.mut : 0, why = '';
    const tick = () => {
      const m = cc ? cc.mut : 0;
      const w = m !== lastMut ? 'the page changing' : moving();
      lastMut = m;
      if (w) { why = w; run = 0; } else run++;
      if (++n >= max) return done({ n, run, why });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ---- one walk: one save at one size -----------------------------------------------------------------------------------------------
async function walk(browser, base, save, size, devBase) {
  const tag = `${save} ${size.id}`;
  const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(instrumentPage, SHORT_TIMER_MS);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: size.insets });
  if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const found = [];
  const missed = [];
  let shotN = 0;
  // requests in flight on this page (a sound streaming is not the screen; an aborted one ends with requestfailed)
  const inflight = new Set();
  page.on('request', (r) => { if (r.resourceType() !== 'media') inflight.add(r); });
  page.on('requestfinished', (r) => inflight.delete(r));
  page.on('requestfailed', (r) => inflight.delete(r));
  // (a request of the page before a navigation gets neither event: without this the count only grew, 34 to 96 in one walk)
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) inflight.clear(); });
  // (what the waits did on this walk, printed at its end: settles that went still, ones that met SETTLE_MAX and what kept them busy)
  const waits = { settled: 0, capped: [], frames: 0 };
  let net = 0;
  for (const ev of ['request', 'requestfinished', 'requestfailed']) page.on(ev, () => net++);
  const hung = () => new Promise((_, no) => setTimeout(() => no(new Error(`the page drew no frame for ${HANG_MS / 1000} s (hung)`)), HANG_MS).unref());
  // (frames in a batch, and the run of still frames carried across batches: a request in flight or any request event since the last
  //  batch breaks the run)
  const stillRun = () => {
    let run = 0, f = 0, seen = net, why = '';
    return async (batch) => {
      const r = await Promise.race([page.evaluate(stillFrames, { max: batch }), hung()]);
      f += r.n;
      run = r.run === r.n ? run + r.n : r.run;
      if (r.why) why = r.why;
      if (inflight.size || net !== seen) { run = 0; why = inflight.size ? `${inflight.size} request(s) in flight: ${[...inflight][0].url().replace(/^.*\//, '').slice(0, 40)}` : 'a request'; }
      seen = net;
      return { run, f, why };
    };
  };
  // settle: until the page is STILL for QUIET_FRAMES frames in a row, or SETTLE_MAX frames of a page that never is (a live stage's HUD);
  // it never fails: the judge after it decides
  const settle = async () => {
    const step = stillRun();
    for (;;) {
      const r = await step(QUIET_FRAMES);
      if (r.run >= QUIET_FRAMES) { waits.settled++; waits.frames += r.f; return; }
      if (r.f >= SETTLE_MAX) { waits.capped.push(r.why); waits.frames += r.f; return; }
    }
  };
  const shows = async (selector, state) => {
    const l = page.locator(selector).first();
    return state === 'attached' ? (await l.count()) > 0 : l.isVisible();
  };
  // opens: until `selector` shows (as Playwright's own waitFor judged it); FAILS when the page went STILL for STILL_FAIL frames in a row
  // without it (nothing loading, nothing pending, nothing moving: nothing left could open it), or after MAX_FRAMES frames of a page that
  // never went still
  const opens = async (selector, state = 'visible') => {
    const step = stillRun();
    for (;;) {
      if (await shows(selector, state)) return;
      const r = await step(10);
      if (r.run >= STILL_FAIL) {
        if (await shows(selector, state)) return;
        throw new Error(`${selector} never showed: the page went still without it (${STILL_FAIL} frames in a row, nothing loading, pending or moving)`);
      }
      if (r.f >= MAX_FRAMES) throw new Error(`${selector} never showed in ${MAX_FRAMES} frames (the page never went still: ${r.why})`);
    }
  };
  // until: the game's own state, in the page: frames until `fn(arg)` has been true `hold` frames in a row (a React effect that follows
  // the same commit lands within a frame or two); FAILS after MAX_FRAMES frames
  const until = async (what, fn, arg = null, hold = 1) => {
    const ok = await Promise.race([
      page.evaluate(({ src, arg, max, hold }) => new Promise((done) => {
        const f = new Function(`return (${src})`)();
        let n = 0, run = 0;
        const tick = () => {
          let v = false;
          try { v = !!f(arg); } catch {}
          run = v ? run + 1 : 0;
          if (run >= hold) return done(true);
          if (++n >= max) return done(false);
          requestAnimationFrame(tick);
        };
        tick();
      }), { src: fn.toString(), arg, max: MAX_FRAMES, hold }),
      hung(),
    ]);
    if (!ok) throw new Error(`${what}: not so in ${MAX_FRAMES} frames`);
  };
  // frames: `n` of the page's own frames (a live stage's own clock: the engine steps once a frame), where a fixed sleep stood in for
  // the game moving on
  const frames = (n) => until(`${n} frames`, (k) => --k.n <= 0, { n }, 1);
  // running: a stage is up and playing (its vine HUD is up, the stage's goal card gone, for 10 frames in a row)
  const running = () => until('a stage running (its HUD up, its goal card gone)', () => document.documentElement.dataset.hud === 'vine' && document.documentElement.dataset.hudCard !== '1', null, 10);
  // (judge only inside this, when set: a screen laid over another)
  let scope = '';
  // (a card that must fit the safe area with nothing scrolled, when set; and a phone size tried on top of this walk's, when set)
  let fit = '';
  let extra = null;

  const judge = async (screen) => {
    if (ONLY && !screen.includes(ONLY)) return;
    const take = async (name) => {
      // let the pictures load and every finite animation and transition end (a card popping in, the map panning): the page STILL
      // (until 11-19 at most 2.5 s, so a loaded box judged a card still popping in)
      await settle();
      const b = await page.evaluate(audit, { minTap: MIN_TAP, insets: extra?.insets ?? size.insets, scope, fit });
      // (CLIPCHECK_SHOTS=1: every judged screen shot as judged, breach or not, so a step's own run can be looked at, not only passed)
      if (SHOTS) await page.screenshot({ path: path.join(out, 'shots', `seen-${save}-${extra?.id ?? size.id}-${name.replace(/\W+/g, '_')}.png`) });
      if (!b.length) return;
      // the contact sheet: outline each breach, number it, shoot the screen
      const file = path.join(out, 'shots', `${save}-${extra?.id ?? size.id}-${String(++shotN).padStart(2, '0')}.png`);
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
      b.forEach((x, i) => found.push({ ...x, n: i + 1, screen: name, save, size: extra?.id ?? size.id, shot: file }));
    };
    await take(screen);
    if (await scrollAll(page)) {
      await settle();
      await take(`${screen} (scrolled to the end)`);
    }
  };
  const tryStep = async (what, fn) => {
    if (STEPS.length && !STEPS.some((w) => what.includes(w))) return;
    try { await fn(); } catch (e) {
      const m = String(e.message).split('\n');
      const loc = m.find((l) => /waiting for locator/.test(l)) || '';
      const file = path.join(out, 'shots', `miss-${save}-${size.id}-${what.replace(/\W+/g, '_')}.png`);
      await page.screenshot({ path: file }).catch(() => {});
      missed.push(`${what}: ${m[0].slice(0, 100)} ${loc.trim().slice(0, 120)} (screen: ${file})`);
    }
  };
  const back = async () => { await page.keyboard.press('Escape'); await settle(); };
  // (20 s: on a busy machine the title's leaves can arrive well after the Play board)
  // navigation taps go straight to the element (the check judges what is on screen, not Playwright's hit-testing; a toast over an
  // arrow must not stall the walk)
  // (still = false: the next tap must follow at once, as a player's does: the testers' "I'm done" asks "Tap again to finish" for 3 s
  //  only, and a settle over a live stage can outlast that)
  const click = async (selector, still = true) => {
    await opens(selector, 'attached');
    await page.locator(selector).first().evaluate((e) => e.click());
    if (still) await settle();
  };
  const home = async () => {
    await page.goto(`${base}/?lessons=off`);
    await opens('.ttl-play');
    await settle();
  };

  await page.goto(`${base}/?lessons=off`);
  await seed(page, save);
  await home();
  await judge('start screen');
  // the planted screen that never opens, every run (R-165.215): waiting on a selector nothing will ever show must FAIL, and fail as a
  // page gone still (not by a clock, not as a page that never settled), or the open wait itself is broken
  if (!ONLY && !STEPS.length) {
    const said = await opens('.cc-never-opens').then(() => 'it opened', (e) => String(e.message));
    if (!/went still without it/.test(said)) missed.push(`planted never-opening screen: not failed as gone still (${said.slice(0, 120)})`);
  }

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
    await opens('.wm-head');
    await settle();
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
          await settle();
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

  // a planted failure on the screen up now: a 26 px button inside `within` must be caught by the small-tap rule, or the check is broken
  const plant = async (name, within) => {
    if (ONLY && !name.includes(ONLY)) return;
    await page.evaluate((w) => { const b = document.createElement('button'); b.className = 'cc-plant'; b.textContent = 'planted'; b.style.cssText = 'height:26px;width:120px;padding:0;display:block'; (document.querySelector(w) ?? document.body).appendChild(b); }, within);
    const caught = (await page.evaluate(audit, { minTap: MIN_TAP, insets: size.insets, scope })).some((x) => x.kind === 'small' && /cc-plant/.test(x.sel));
    await page.evaluate(() => document.querySelector('.cc-plant')?.remove());
    if (!caught) missed.push(`${name}: the planted 26 px button was NOT caught: the small-tap rule is broken`);
  };

  // Pause, over a live stage: opened with the game's own route (?autostart=1&level=1-1: the built game has no window.__play, so until
  // 11-06 this step judged the start screen). Fails closed: no pause card up is a screen that could not be opened
  await tryStep('pause', async () => {
    await page.goto(`${base}/?lessons=off&autostart=1&level=1-1`);
    // (until 11-19 a 7 s sleep stood in for the stage starting: now the stage's own HUD up and its goal card gone)
    await opens('canvas', 'attached');
    // (a fresh save's autostart opens World 1's prologue first: Escape finishes a story (StoryPlayer.tsx), as the old sleep's Escape did)
    await until('the prologue or the stage up', () => !!document.querySelector('.sp-next') || (document.documentElement.dataset.hud === 'vine' && document.documentElement.dataset.hudCard !== '1'), null, 10);
    // (that Escape also leaves the stage paused, on the keyboard: Pause is pressed for only when it is not up already, or the press
    //  would resume the stage)
    if (await page.locator('.sp-next').count()) await page.keyboard.press('Escape');
    await until('the stage running (its HUD up, its goal card gone) or paused', () => !!document.querySelector('.pm-card') || (document.documentElement.dataset.hud === 'vine' && document.documentElement.dataset.hudCard !== '1'), null, 10);
    if (!(await page.locator('.pm-card').count())) await page.keyboard.press('Escape');
    await opens('.pm-card');
    await settle();
    await judge('pause');
    await plant('pause: planted', '.pm-card');
  });

  // Normal's help offer in 1-1 (R-165.62, HelpOffer.tsx): real put-backs, 12 at one piece, until it comes up. Each put-back is the engine's
  // own fall: he is dropped below the stage where he stands, and A1's soft fall sets him back. On the development build only (it alone has
  // window.__engine; startServer proves the production build does not). Fails closed: no offer up is a screen that could not be opened
  if (save === 'fresh' && devBase) await tryStep('help offer', async () => {
    await page.goto(`${devBase}/?lessons=off`);
    await seed(page, 'fresh');
    await page.evaluate(() => localStorage.setItem('sloth_difficulty', 'normal'));
    // (the development build's own route into 1-1: a fresh save's autostart opens World 1's story first)
    await page.goto(`${devBase}/?lessons=off`);
    await until('the game loaded (window.__play)', () => typeof window.__play === 'function');
    await page.evaluate(() => window.__play('1-1'));
    await opens('canvas', 'attached');
    await until("the help offer's watch on", () => typeof window.__engine === 'function' && !!window.__engine()?.helpState?.().on);
    await running();
    for (let n = 0; n < 16 && !(await page.locator('.ho-scrim').count()); n++) {
      // (dropped under the middle of the first piece where a step can be offered (the engine's canGrowAt: re-pinned on the re-laid 1-1,
      // INT-1-1; the second piece offered nothing there): the fall's x is the piece it counts at; A1 sets him back where he stood)
      await page.evaluate(() => { const e = window.__engine(); const p = e.player; const pc = e.currentStage.meta.pieces.find((q) => e.canGrowAt(q) && (q.x1 - q.x0) > 400); p.x = (pc.x0 + pc.x1) / 2; p.y = e.currentStage.config.levelHeight + 140; p.vy = 300; p.grounded = false; });
      await until('set back on the stage (or the offer up)', () => { const e = window.__engine(); return !!document.querySelector('.ho-scrim') || (e.player.grounded && e.player.y < e.currentStage.config.levelHeight); });
      // (a moment of the game's own frames before the next fall: until 11-19, 700 ms of the clock)
      await frames(42);
    }
    await opens('.ho-card');
    await settle();
    await judge('play: help offer');
    await plant('help offer: planted', '.ho-card');
  });

  // Dot's very first tip, with its Skip tips button (once per device, never on 1-1: dotGuideHelp.ts offersSkip): 1-3 on the fresh save,
  // lessons on. Judged inside her layer only. Sideways its Skip sat inside the right 48 px inset until 11-06 (VineHud's guide safe area
  // now keeps the phone's insets). Fails closed: no Skip up is a screen not opened.
  // (1-3 is a designed level since 11-12: it opens on a quiet walk, so her first tip comes as he walks in, never while he stands at the
  //  spawn. R-165.245 (TOOLS-1, 11-14): he is walked by GAME FRAMES, not wall-clock key hops. The hops raced Dot: her clock is the
  //  game's (DotGuide.tsx, at most 100 ms a screen frame), so how far he got before each line depended on how busy the machine was, and
  //  2 runs in 3 on t-fix-15 met the snake/hive teach card first, a card that waits to be read (no Skip) and that no key ever tapped.
  //  Now: the development build (its engine handle), the engine's own loop stopped the moment it exists, the stage-start card left to
  //  finish (its own timer: no line starts under it), then ONE game frame a screen frame through the touch pad's own calls
  //  (clipPress.mjs pressFrame, as tools/inspect/clip.mjs): right, a hop when he has stood blocked for 6 frames, never hurt (`safe`),
  //  and a card up 3 s of game time without a Skip is tapped, as a player taps a card that waits. 90 s of game time at most.)
  if (save === 'fresh' && devBase) await tryStep("Dot's first tip", async () => {
    await page.goto(`${devBase}/?lessons=off`);
    await seed(page, 'fresh');
    await page.evaluate(() => localStorage.setItem('sloth_difficulty', 'normal'));
    // (stop the engine's own loop at its first frame: a page script that pauses it as soon as the engine is there; only on this step's
    //  own address, clipHold=1, since a page keeps its init scripts for every later step)
    await page.addInitScript(() => {
      if (!location.search.includes('clipHold=1')) return;
      const hold = () => {
        const e = typeof window.__engine === 'function' ? window.__engine() : null;
        if (e && e.currentStage && e.player) { e.isPaused = true; window.__clipHeld = true; } else requestAnimationFrame(hold);
      };
      requestAnimationFrame(hold);
    });
    await page.goto(`${devBase}/?autostart=1&level=1-3&clipHold=1`);
    await until('1-3 up and held at its first frame', () => window.__clipHeld === true && window.__engine()?.currentStage?.config?.id === '1-3');
    await until("the stage's goal card gone", () => document.documentElement.dataset.hudCard !== '1', null, 10);
    const walked = await page.evaluate((src) => new Promise((done) => {
      const e = window.__engine();
      e.isPaused = true;
      const press = new Function(`return (${src})`)();
      let n = 0, card = '', upAt = 0, still = 0, lastX = e.player.x, hop = 0, taps = 0;
      const tick = () => {
        if (document.querySelector('.dg-skip')) return done({ n, taps, x: Math.round(e.player.x), tip: document.querySelector('.dg-bub:not(.dg-toast) .dg-bub-body')?.textContent?.replace('Skip tips', '').trim().slice(0, 60) });
        if (n >= 30 * 90) return done({ n, taps, x: Math.round(e.player.x), none: true });
        const bub = document.querySelector('.dg-bub:not(.dg-toast)');
        const now = bub ? bub.textContent : '';
        if (now !== card) { card = now; upAt = n; }
        if (bub && n - upAt >= 90) { bub.click(); taps++; upAt = n; }
        still = e.player.grounded && Math.abs(e.player.x - lastX) < 0.5 ? still + 1 : 0;
        lastX = e.player.x;
        const jump = hop === 0 && still >= 6;
        if (jump) hop = 12;
        press(e, { right: true, jump, release: hop === 6 }, { safe: true }, false);
        if (hop > 0) hop--;
        n++;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), pressFrame.toString());
    if (walked.none) throw new Error(`no Skip tips button in 90 s of game time (x ${walked.x}, ${walked.taps} cards tapped)`);
    console.log(`  Dot's first tip (${tag}): game frame ${walked.n}, x ${walked.x}, ${walked.taps} card${walked.taps === 1 ? '' : 's'} tapped: "${walked.tip}"`);
    // (the Skip is faded and lets touches through for its first 1.2 s, a real-time timer: judged once it is armed)
    await opens('.dg-skip:not(.unarmed)', 'attached');
    await settle();
    scope = '.dg-root';
    await judge("play: Dot's first tip");
    scope = '';
  });

  // the stories and the cards of a run (audit C saves #11: never walked, and they held tap targets under 44 px and in the notch band):
  // a story picture and its Skip and Back, the guardian's card, The End, the stage-cleared card with medals, the Game Over card and its
  // extra-lives offer. Opened with the development build's own hooks (window.__story, __win, __play, __kill), on every save, both ways up
  if (devBase) await tryStep('stories and run cards', async () => {
    await page.goto(`${devBase}/?lessons=off`);
    await seed(page, save);
    await page.goto(`${devBase}/?lessons=off`);
    await until('the game loaded (window.__story, __win)', () => typeof window.__story === 'function' && typeof window.__win === 'function');
    await page.evaluate(() => window.__story('1-1', 'story_cutscene'));
    await opens('.sp-next');
    for (let i = 0; i < 12 && !(await page.locator('.sp-back').count()); i++) {
      await page.locator('.sp-next').first().evaluate((e) => e.click());
      await settle();
    }
    await settle();
    await judge('cards: a story picture, with Skip and Back');
    await page.evaluate(() => window.__story('10-10', 'boss_card'));
    await opens('.boss-card');
    await settle();
    await judge("cards: the guardian's card");
    await page.evaluate(() => window.__story('10-10', 'story_ending'));
    await opens('.ending-card');
    await settle();
    await judge('cards: The End');
    await page.evaluate((m) => window.__win('1-2', 3, m), IDS.badges.slice(0, 2));
    await opens('.clr-medals.in');
    await settle();
    // the card fits the safe area with nothing scrolled (PROOF-1 violation 2: sideways at 844x390 its bottom row sat in the home bar,
    // and at 915x412 and upright under 915 px it started off the screen, while this walk's scroll pass called it fine): judged as
    // opened at this walk's size and at a common shorter phone, the same way up
    fit = '.clr-card.clr-won';
    await judge('cards: stage cleared, with medals');
    for (const ex of FIT_SIZES[size.id] ?? []) {
      extra = ex;
      await page.setViewportSize(ex.viewport);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: ex.insets });
      await settle();
      // (back to nothing scrolled: the judge before this one scrolled every box to its end)
      await page.evaluate(() => { for (const e of document.querySelectorAll('*')) if (e.scrollTop || e.scrollLeft) { e.scrollTop = 0; e.scrollLeft = 0; } });
      await settle();
      await judge(`cards: stage cleared, with medals, at ${ex.viewport.width}x${ex.viewport.height}`);
    }
    // the planted failure, every run: the card made 200 px taller must put its bottom row in the inset, or this rule itself is broken
    if (!ONLY || 'cards: stage cleared, planted'.includes(ONLY)) {
      await page.evaluate(() => { const s = document.createElement('style'); s.id = 'cc-plant-tall'; s.textContent = '.clr-card.clr-won .clr-main { padding-top: 200px !important; }'; document.head.appendChild(s); });
      await settle();
      // (as opened, nothing scrolled: the scrim's scroll anchoring follows the grown card, so the scroll is reset after the plant)
      await page.evaluate(() => { for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; });
      await settle();
      const caught = (await page.evaluate(audit, { minTap: MIN_TAP, insets: extra?.insets ?? size.insets, fit })).some((x) => x.kind === 'inset' && /clr-btn2|pm-go/.test(x.sel));
      await page.evaluate(() => document.getElementById('cc-plant-tall')?.remove());
      if (!caught) missed.push('cards: the planted too-tall stage-cleared card was NOT caught: the nothing-scrolled inset rule is broken');
    }
    if (extra) {
      extra = null;
      await page.setViewportSize(size.viewport);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: size.insets });
      await settle();
    }
    fit = '';
    // Game Over, then again until the extra-lives offer (assist.ts OFFER_AFTER_FAILS)
    await page.evaluate(() => window.__play('1-3'));
    for (let n = 0; n < 4 && !(await page.locator('.clr-help').count()); n++) {
      await until('the engine up', () => typeof window.__engine === 'function' && !!window.__engine());
      await running();
      // (__kill takes the lives it can: one a respawn, so it is asked again until the card is up)
      for (let k = 0; k < 12 && !(await page.locator('.clr-card.lost').count()); k++) {
        await page.evaluate(() => window.__kill());
        // (his fall and the respawn or the card, in the game's own frames: until 11-19, 1.5 s of the clock)
        await frames(90);
      }
      await opens('.clr-card.lost');
      await settle();
      if (n === 0) await judge('cards: Game Over');
      if (await page.locator('.clr-help').count()) break;
      await page.evaluate(() => window.__play('1-3'));
    }
    await opens('.clr-help');
    await judge('cards: Game Over, the extra-lives offer');
  });

  // the testers' link (?ctest=1, as #ctest): the front page, the "I'm done" badge over the level, the end questions (blank, and with
  // "looked wrong" opened), and the sent screen. On the fresh save only: the link starts from nothing. A 26 px "I'm done" slipped
  // past because these screens were never walked (tester-page, 11-06)
  if (save === 'fresh') await tryStep('testers link', async () => {
    await page.goto(`${base}/?lessons=off&ctest=1`);
    await opens('#ctest-name');
    await settle();
    await judge('testers: front page');
    await page.fill('#ctest-name', 'clipcheck');
    await click('button[type=submit]');
    // (until 11-19 a 7 s sleep stood in for the level starting: now its own HUD up and its goal card gone)
    await running();
    // (the level under the badge is the game's own HUD, judged by Pause; only the badge is the testers' page)
    if (!ONLY || 'testers: done badge'.includes(ONLY)) {
      const b = (await page.evaluate(audit, { minTap: MIN_TAP, insets: size.insets })).filter((x) => /done|Tap again/i.test(x.text));
      if (b.length) {
        const file = path.join(out, 'shots', `${save}-${size.id}-${String(++shotN).padStart(2, '0')}.png`);
        await page.screenshot({ path: file });
        b.forEach((x, i) => found.push({ ...x, n: i + 1, screen: 'testers: done badge', save, size: size.id, shot: file }));
      }
    }
    // Dot's first tip over the level, a fresh save's (with its Skip tips button): inside her layer only. The walk above opens stages with
    // lessons off, so this is where her bubble is really up
    scope = '.dg-root';
    await judge("testers: Dot's bubble");
    scope = '';
    await click('button:has-text("I\'m done")', false);
    await click('button:has-text("Tap again to finish")');
    await opens('button:text-is("Send")');
    await settle();
    // (the end questions lie over the stopped level: only the testers' card is judged; the level's HUD is Pause's)
    scope = '.fixed.inset-0.z-\\[60\\]';
    await judge('testers: end questions');
    // the planted failure, every run: a 26 px button on the end questions must be caught, or the check itself is broken
    if (!ONLY || 'testers: planted'.includes(ONLY)) {
      await page.evaluate(() => { const b = document.createElement('button'); b.className = 'cc-plant'; b.textContent = 'planted'; b.style.cssText = 'height:26px;width:120px;padding:0;display:block'; document.querySelector('#ctest-note')?.before(b); });
      const caught = (await page.evaluate(audit, { minTap: MIN_TAP, insets: size.insets, scope })).some((x) => x.kind === 'small' && /cc-plant/.test(x.sel));
      await page.evaluate(() => document.querySelector('.cc-plant')?.remove());
      if (!caught) missed.push('testers: the planted 26 px button was NOT caught: the small-tap rule is broken');
    }
    await click('[role=group][aria-label="Did anything look wrong or out of place?"] button:text-is("Yes")');
    await judge('testers: end questions, looked wrong');
    await click('button:text-is("Send")');
    await judge('testers: sent');
    scope = '';
  });

  await ctx.close();
  const why = [...new Set(waits.capped)].slice(0, 3).join('; ');
  console.log(`  waits (${tag}): ${waits.settled} settled still, ${waits.capped.length} met ${SETTLE_MAX} frames${why ? ` (${why})` : ''}, ${waits.frames} frames waited`);
  return { tag, found, missed, errors };
}

// ---- run ----------------------------------------------------------------------------------------------------------------------------
const t0 = Date.now();
console.log(`clip check: every menu screen at 412x915 and 915x412, on a fresh, an old and a finished save`);
const server = process.env.CLIPCHECK_URL ? { url: process.env.CLIPCHECK_URL.replace(/\/$/, ''), stop: () => {} } : await startServer();
// (the help offer's route: a development build of its own; CLIPCHECK_DEV_URL points at a dev server instead)
const devServer = process.env.CLIPCHECK_DEV_URL ? { url: process.env.CLIPCHECK_DEV_URL.replace(/\/$/, ''), stop: () => {} } : await startServer(true);
const browser = await chromium.launch();
let results;
try {
  // warm vite's dependency pass once, so six pages don't race it
  { const p = await browser.newPage(); await p.goto(`${server.url}/?lessons=off`); await p.locator('.ttl-play').waitFor({ timeout: 90000 }).catch(() => {}); await p.close(); }
  const jobs = SAVES.flatMap((s) => SIZES.map((z) => [s, z])).filter(([s, z]) => !process.env.CLIPCHECK_WALKS || process.env.CLIPCHECK_WALKS.split(',').includes(`${s}:${z.id}`));
  results = await Promise.all(jobs.map(([s, z]) => walk(browser, server.url, s, z, devServer.url).catch((e) => ({ tag: `${s} ${z.id}`, found: [], missed: [`walk: ${e.message.split('\n')[0]}`], errors: [] }))));
} finally {
  await browser.close();
  server.stop();
  devServer.stop();
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
