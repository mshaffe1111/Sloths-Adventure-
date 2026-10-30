/**
 * Does every screen fit every phone? (polish-c, Matt's foldable, 2026-10-29: "when I died ... the box didn't fit"; "make sure we're not
 * putting things underneath where the clock is, or where we have icons from the phone".)
 *
 *   node tools/qa/fit.mjs <port> <outDir> [screen,screen...] [size,size...]
 *
 * Opens each screen at each phone shape, with the system bars simulated as safe-area insets (Android: a 28 px status bar on top and
 * a 48 px nav bar at the bottom; iPhone: notch and home bar), takes a screenshot with the bars drawn in, and checks the page:
 *   - every button and every card lies inside the screen (or inside a scrolling box that can bring it into view);
 *   - no button, and no card text, sits under a system bar.
 * Writes <outDir>/fit.json (every problem found) and the screenshots, and exits 1 when anything does not fit: the layout test.
 * Needs the dev server (npx vite --port <port>), which has the __win / __story / __play hooks.
 */
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const [port, out, onlyScreens, onlySizes] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

// phone shapes (CSS px) and their system bars
const ANDROID = { top: 28, bottom: 48, left: 0, right: 0 };
const ANDROID_LAND = { top: 28, bottom: 0, left: 0, right: 48 };
export const SIZES = [
  ['fold-open-land', 884, 736, ANDROID_LAND],
  ['fold-open-port', 736, 884, ANDROID],
  ['fold-cover-port', 344, 882, ANDROID],
  ['fold-cover-land', 882, 344, ANDROID_LAND],
  ['se-port', 375, 667, { top: 20, bottom: 0, left: 0, right: 0 }],
  ['promax-port', 430, 932, { top: 59, bottom: 34, left: 0, right: 0 }],
  ['promax-land', 932, 430, { top: 0, bottom: 21, left: 59, right: 59 }],
  ['small-land', 640, 320, ANDROID_LAND],
  ['tablet-port', 820, 1180, { top: 24, bottom: 20, left: 0, right: 0 }],
];

const play = (id) => async (p) => {
  await p.evaluate((i) => window.__play(i), id);
  await p.waitForTimeout(6500);
};
const SCREENS = {
  title: async () => {},
  menu: async (p) => p.getByText('Menu', { exact: true }).first().click(),
  map: async (p) => p.getByText('World Map', { exact: false }).first().click(),
  journal: async (p) => p.getByText('How to Play', { exact: false }).first().click(),
  trophies: async (p) => p.getByText('Trophies', { exact: false }).first().click(),
  story: async (p) => {
    await p.evaluate(() => window.__story('2-1', 'world_story'));
    await p.waitForTimeout(3200);
  },
  play: play('1-2'),
  pause: async (p) => {
    await play('1-2')(p);
    await p.keyboard.press('Escape');
  },
  lifelost: async (p) => {
    await play('1-2')(p);
    await p.evaluate(() => {
      const e = window.__engine();
      e.player.hp = 1;
      e.player.invincibleTimer = 0;
      e.stompGrace = 0;
      e.damagePlayer(1, e.player.x + 40);
    });
    await p.waitForTimeout(900);
  },
  gameover: async (p) => {
    await play('1-2')(p);
    await p.evaluate(() => {
      const e = window.__engine();
      e.lives = 1;
      e.player.hp = 1;
      e.player.invincibleTimer = 0;
      e.stompGrace = 0;
      e.damagePlayer(1, e.player.x + 40);
    });
    await p.waitForTimeout(1600);
  },
  win: async (p) => p.evaluate(() => window.__win('1-3', 3, ['not_one_scratch'])),
  bosscard: async (p) => p.evaluate(() => window.__story('1-10', 'boss_card')),
  boss: play('1-10'),
};

/** in the page: what does not fit */
function check(ins) {
  const vw = innerWidth, vh = innerHeight;
  const safe = { l: ins.left, t: ins.top, r: vw - ins.right, b: vh - ins.bottom };
  const bad = [];
  const visible = (el) => {
    // (hidden by an ancestor too: the title's buttons fade out under a dialog, and those are not on screen)
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  /** a box that scrolls and so can bring this element into view */
  const scroller = (el) => {
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (a.scrollHeight > a.clientHeight + 1 || a.scrollWidth > a.clientWidth + 1)) return a;
    }
    return null;
  };
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.className || el.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40);
  const tappable = [...document.querySelectorAll('button, a[href], [role="button"], input, select')].filter(visible);
  const cards = [...document.querySelectorAll('.clr-card, .pm-card, .ui-panel, .tr-inner, .sk-card, .map-card, .way, .dg-bub, .sp-box, .gx2-ui')].filter(visible);
  for (const el of [...tappable, ...cards]) {
    const r = el.getBoundingClientRect();
    const sc = scroller(el);
    const box = sc ? sc.getBoundingClientRect() : null;
    // off the screen (and no scrolling box to bring it back)
    const out = r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1;
    if (out && !(box && box.top >= -1 && box.bottom <= vh + 1 && box.left >= -1 && box.right <= vw + 1)) {
      bad.push({ kind: 'off-screen', what: name(el), rect: [r.left, r.top, r.right, r.bottom].map(Math.round) });
      continue;
    }
    // under a system bar (a card's frame may reach into one; its buttons and words may not)
    const isCard = cards.includes(el);
    const vr = box ? { left: Math.max(r.left, box.left), top: Math.max(r.top, box.top), right: Math.min(r.right, box.right), bottom: Math.min(r.bottom, box.bottom) } : r;
    if (vr.right <= vr.left || vr.bottom <= vr.top) continue;
    // (inside a box that scrolls up and down, what is below the fold or under a bar scrolls clear of it: only the sides count there)
    const vert = sc && sc.scrollHeight > sc.clientHeight + 1 ? false : vr.top < safe.t - 1 || vr.bottom > safe.b + 1;
    const under = vert || vr.left < safe.l - 1 || vr.right > safe.r + 1;
    if (under && (!isCard || el.matches('.way, .dg-bub, .sp-box'))) bad.push({ kind: 'under-bar', what: name(el), rect: [vr.left, vr.top, vr.right, vr.bottom].map(Math.round) });
  }
  return bad;
}

const screens = onlyScreens ? onlyScreens.split(',') : Object.keys(SCREENS);
const sizes = onlySizes ? SIZES.filter((s) => onlySizes.split(',').includes(s[0])) : SIZES;
const b = await chromium.launch();
const report = {};
let fails = 0;
for (const [sz, w, h, ins] of sizes) {
  for (const sc of screens) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: ins }).catch(() => {});
    let err = null;
    try {
      await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
      await p.waitForTimeout(4500);
      await SCREENS[sc](p);
      await p.waitForTimeout(1800);
    } catch (e) {
      err = String(e).slice(0, 160);
    }
    const bad = err ? [{ kind: 'could-not-open', what: err }] : await p.evaluate(check, ins);
    report[`${sz}/${sc}`] = bad;
    if (bad.length) fails++;
    // the bars drawn in (after the check, so they never count)
    await p.evaluate((ins) => {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999';
      const add = (css) => { const e = document.createElement('div'); e.style.cssText = 'position:absolute;background:rgba(255,0,90,.38);' + css; d.appendChild(e); };
      if (ins.top) add(`left:0;right:0;top:0;height:${ins.top}px`);
      if (ins.bottom) add(`left:0;right:0;bottom:0;height:${ins.bottom}px`);
      if (ins.left) add(`top:0;bottom:0;left:0;width:${ins.left}px`);
      if (ins.right) add(`top:0;bottom:0;right:0;width:${ins.right}px`);
      document.body.appendChild(d);
    }, ins).catch(() => {});
    await p.screenshot({ path: `${out}/${sz}--${sc}.png` }).catch(() => {});
    await p.close();
    console.log(`${sz}/${sc}: ${bad.length ? bad.length + ' problem(s)' : 'fits'}`);
  }
}
await b.close();
fs.writeFileSync(`${out}/fit.json`, JSON.stringify(report, null, 1));
console.log(fails ? `${fails} screen(s) do not fit (see ${out}/fit.json)` : 'every screen fits');
process.exit(fails ? 1 : 0);
