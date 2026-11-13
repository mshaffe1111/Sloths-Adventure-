// FIX-A stills (R-165.175, .158, .147, .155, .171): the real page (vite dev: window.__play / __engine / __dotRun), upright 412x915 and
// sideways 915x412, on a fresh save and an old one (World 1-3 cleared; for Dot, a player who has tapped a card before).
//   node tools/dotbox/fixaStills.mjs <outDir> [port] [only: about|dot|teach|goal|jump]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [out = 'reference/qa-reports/FIX-A/stills', portArg = '5251', only = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const port = Number(portArg);
const base = `http://127.0.0.1:${port}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const SIZES = [['upright', 412, 915], ['sideways', 915, 412]];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
const log = [];
const note = (s) => { console.log(s); log.push(s); };

async function open(ori, W, H, save, extra = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', (e) => note(`pageerror ${e.message.slice(0, 160)}`));
  await p.addInitScript(([save, extra]) => {
    if (sessionStorage.getItem('fixa_seeded')) return;
    sessionStorage.setItem('fixa_seeded', '1');
    const L = localStorage;
    L.clear();
    L.setItem('sloth_howto_seen', '1');
    if (save === 'old') {
      L.setItem('sloth_coach_done', '1');
      for (let w = 1; w <= 3; w++) for (let m = 1; m <= 10; m++) L.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify({ completed: true, stars: 2, highScore: 4000, bestTime: 150 }));
      L.setItem('sloth_finds', JSON.stringify({ v: 1, found: ['w1_keepsake'] }));
      L.setItem('sloth_badges', JSON.stringify({ v: 1, earned: {}, kills: { snake: 5 }, seen: ['snake'], counters: {}, quiet: [] }));
    }
    for (const [k, v] of Object.entries(extra)) L.setItem(k, v);
  }, [save, extra]);
  return p;
}

async function about() {
  for (const [ori, W, H] of SIZES) for (const save of ['fresh', 'old']) {
    const p = await open(ori, W, H, save);
    await p.goto(`${base}/?lessons=off`, { timeout: 300000 });
    await p.locator('.ttl-play').waitFor({ state: 'visible', timeout: 300000 });
    await sleep(2500);
    await p.locator('.ttl-token[aria-label="Settings"]').first().evaluate((e) => e.click());
    await sleep(600);
    await p.locator('.st-tab[aria-label="About"]').evaluate((e) => e.click());
    await sleep(600);
    await p.screenshot({ path: path.join(out, `about-${save}-${ori}.png`) });
    for (const [id, label] of [['story', 'Our story'], ['inspired', 'Inspired by']]) {
      await p.locator(`.ab-link:has-text("${label}")`).evaluate((e) => e.click());
      await sleep(600);
      await p.screenshot({ path: path.join(out, `about-${id}-${save}-${ori}.png`) });
      await p.locator('.st-page').evaluate((e) => (e.scrollTop = e.scrollHeight));
      await sleep(300);
      await p.screenshot({ path: path.join(out, `about-${id}-end-${save}-${ori}.png`) });
      const m = await p.evaluate(() => { const pg = document.querySelector('.st-page'); const bk = document.querySelector('.ab-back')?.getBoundingClientRect(); return { scroll: pg.scrollHeight, view: pg.clientHeight, back: bk && [Math.round(bk.width), Math.round(bk.height)] }; });
      note(`about ${id} ${save} ${ori}: page ${m.scroll}px in a ${m.view}px view (scrolls), Back ${m.back}`);
      await p.keyboard.press('Escape');
      await sleep(400);
      const onAbout = await p.locator('.ab-ours').count();
      note(`  Esc from ${id}: ${onAbout ? 'back on About' : 'NOT back on About'}`);
    }
    await p.context().close();
  }
}

/** walk right in a stage until `want(state)` holds (checked every 100 ms), hopping at walls and ledges; returns the state or null */
async function walkTo(p, want, ms = 60000) {
  await p.keyboard.down('ArrowRight');
  let lastX = 0, still = 0, hopT = 0, s = null;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await sleep(100);
    s = await p.evaluate(`(() => { const e = ${E}; const q = e.player; const r = window.__dotRun; const c = r?.queue?.cur; const el = document.querySelector('.dg-bub.in');
      const g = e.platforms.find((k) => !k.broken && k.x <= q.x + q.width && k.x + k.width >= q.x && Math.abs(k.y - (q.y + q.height)) < 10);
      return { x: q.x, grounded: q.grounded, edge: g ? g.x + g.width - (q.x + q.width) : 999, key: c?.line.key, text: c?.line.text, move: c?.line.move ?? null, hint: c?.hint ?? null, shown: !!el && getComputedStyle(el).opacity > 0.95 }; })()`);
    if (want(s)) break;
    still = Math.abs(s.x - lastX) < 1 ? still + 100 : 0;
    lastX = s.x;
    if (s.grounded && (still > 300 || s.edge < 40) && Date.now() - hopT > 500) { hopT = Date.now(); await p.keyboard.down('Space'); await sleep(260); await p.keyboard.up('Space'); }
    s = null;
  }
  await p.keyboard.up('ArrowRight');
  return s;
}

async function play(p, stage, q = '') {
  await p.goto(`${base}/${q}`, { timeout: 300000 });
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
  await sleep(1500);
  await p.evaluate((s) => window.__play(s), stage);
  await p.waitForFunction(`!!${E}?.player`, null, { timeout: 120000 });
  await sleep(1500);
}

async function dot() {
  for (const [ori, W, H] of SIZES) for (const [save, extra] of [['fresh', {}], ['old', { sloth_dot_tapped: '1' }]]) {
    const p = await open(ori, W, H, save, extra);
    await play(p, '1-1');
    const s = await walkTo(p, (s) => s.shown && !s.move && !!s.text, 90000);
    if (!s) { note(`dot ${save} ${ori}: no card that waits to be read came in 90 s`); await p.context().close(); continue; }
    await p.keyboard.up('ArrowRight');
    await sleep(500);
    await p.screenshot({ path: path.join(out, `dot-card-${save}-${ori}.png`) });
    // (+N: two more of her real lines queued behind it, to show the badge)
    await p.evaluate(() => { const r = window.__dotRun; const n = r.clock; r.queue.push({ key: 'fixa:heart', text: 'Hurt? Grab a heart to heal.', kind: 'info', who: 'Dot', source: 'lesson', waitMs: 60000 }, n); r.queue.push({ key: 'fixa:shrine', text: 'Reach the shrine to finish the stage.', kind: 'info', who: 'Dot', source: 'lesson', waitMs: 60000 }, n); });
    await sleep(400);
    await p.screenshot({ path: path.join(out, `dot-card-more-${save}-${ori}.png`) });
    const m = await p.evaluate(() => { const el = document.querySelector('.dg-bub.in'); const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), more: document.querySelector('.dg-more')?.textContent, hint: document.querySelector('.dg-hint')?.textContent ?? null, pe: getComputedStyle(el).pointerEvents }; });
    note(`dot ${save} ${ori}: "${s.text}" hint=${m.hint ? 'yes' : 'no'} card ${m.w}x${m.h} px, pointer-events ${m.pe}, badge "${m.more}"`);
    // tap it: it goes, and the next comes
    const r = await p.evaluate(() => { const b = document.querySelector('.dg-bub.in').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await p.touchscreen.tap(r[0], r[1]);
    await sleep(1500);
    const next = await p.evaluate(() => window.__dotRun?.queue?.cur?.line.text ?? null);
    note(`  tapped: next card "${next}"`);
    await p.screenshot({ path: path.join(out, `dot-card-next-${save}-${ori}.png`) });
    await p.context().close();
  }
}

/** a stage's own teach line on the real page at the default settings: walk from the start; is it up before the first trap? */
async function teach() {
  for (const [ori, W, H] of SIZES) for (const diff of ['normal', 'easy']) {
    const p = await open(ori, W, H, 'old', diff === 'easy' ? { sloth_difficulty: 'easy' } : {});
    await play(p, '1-3');
    const info = await p.evaluate(`(() => { const e = ${E}; const h = (e.proto?.hints ?? []).find((q) => q.teach); const t = (e.dropTraps ?? e.traps ?? [])[0]; return { help: window.__dotRun?.help, hint: h && { x: h.x, text: h.text }, trapX: t ? (t.x ?? t.post?.x) : null }; })()`);
    const s = await walkTo(p, (s) => s.shown && !!s.text && !!info.hint && s.text !== null && (s.key || '').includes('engine:') && /hive|vine/i.test(s.text), 60000);
    if (s) await p.screenshot({ path: path.join(out, `teach-1-3-${diff}-${ori}.png`) });
    note(`teach 1-3 ${diff} ${ori} (Dot's help ${info.help}): teach line ${JSON.stringify(info.hint)}, first trap x ${info.trapX}; ${s ? `SHOWN "${s.text}" with Pokey at x ${Math.round(s.x)}` : 'NOT shown in 60 s'}`);
    await p.context().close();
  }
}

/** the goal sign at its goal and past it (R-165.155, 80f0a5d1): the HUD never reads more than the goal */
async function goal() {
  for (const [ori, W, H] of SIZES) {
    const p = await open(ori, W, H, 'old');
    await play(p, '1-3', '?lessons=off');
    const t = await p.evaluate(`${E}.currentStage.config.targetCount`);
    for (const n of [t, t + 2]) {
      await p.evaluate(`${E}.player.enemiesDefeated = ${n}`);
      await sleep(1200);
      const label = await p.evaluate(() => [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label')).find((a) => / of \d+ /.test(a)) ?? null);
      await p.screenshot({ path: path.join(out, `goal-1-3-${n > t ? 'past' : 'at'}-${ori}.png`) });
      note(`goal 1-3 ${ori}: ${n} cleared of ${t}: the sign reads "${label}"`);
    }
    await p.context().close();
  }
}

/** the first-jump lesson's words where it fires on a fresh save (R-165.171): at 1-2's first raised step */
async function jump() {
  for (const [ori, W, H] of SIZES) {
    const p = await open(ori, W, H, 'fresh', { sloth_coach_done: '1' });
    await play(p, '1-2');
    const s = await walkTo(p, (s) => s.shown && (s.key || '').startsWith('lesson:gap'), 60000);
    if (s) await p.screenshot({ path: path.join(out, `jump-1-2-${ori}.png`) });
    note(`jump 1-2 fresh ${ori}: ${s ? `"${s.text}" at x ${Math.round(s.x)}` : 'the gap lesson did not come in 60 s'}`);
    await p.context().close();
  }
}

const jobs = { about, dot, teach, goal, jump };
for (const [k, f] of Object.entries(jobs)) if (!only || only.split(',').includes(k)) { try { await f(); } catch (e) { note(`${k} FAILED ${e.message.slice(0, 200)}`); } }
fs.writeFileSync(path.join(out, `stills-log${only ? `-${only.replace(/,/g, '-')}` : ''}.txt`), log.join('\n') + '\n');
await b.close();
try { process.kill(-vite.pid); } catch { vite.kill(); }
process.exit(0);
