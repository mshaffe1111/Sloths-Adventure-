// Save slots ("Who's playing?"): the title with New game, the slot card, New game's choice, a new explorer's name and the erase
// question, on four saves (fresh; an old single save from before slots; a family of two; all three spots taken, one finished), at
// 412x915, 915x412, 360x640 and 640x360. Prints a small clip check per shot. Method: reference/methods/save-slots.md.
// Run: npx vite --port=8816 --host=127.0.0.1 (another shell), then: node tools/qa/menushots/slots.mjs reference/menus/save-slots/mock
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : null;

const lvl = (stars) => JSON.stringify({ completed: true, stars, bestTime: 95, highScore: 1400 });
const worlds = (n, stars = 3) => Object.fromEntries([...Array(n * 10)].map((_, i) => [`sloth_lvl_${Math.floor(i / 10) + 1}-${(i % 10) + 1}`, lvl(i % 3 === 0 ? 2 : stars)]));
const DAY = 86_400_000;
const SAVES = {
  // a phone that has never played (the mode is picked, so the title shows rather than the mode card)
  fresh: () => ({ sloth_difficulty: 'easy', sloth_howto_seen: '1' }),
  // an old single save from before slots: Worlds 1-3, no slot list at all (it simply becomes Explorer 1)
  old: () => ({ ...worlds(3), sloth_difficulty: 'normal', sloth_howto_seen: '1', sloth_story_w1: '1', sloth_story_w2: '1', sloth_story_w3: '1' }),
  // a family: Matt playing (Worlds 1-3), Mia saved in slot 2 (World 1 and four of World 2), slot 3 free
  family: (now) => ({
    ...worlds(3),
    sloth_difficulty: 'normal',
    sloth_howto_seen: '1',
    sloth_slots: JSON.stringify([{ name: 'Matt', playedAt: now }, { name: 'Mia', playedAt: now - DAY }, { name: '', playedAt: 0 }]),
    sloth_slot_data_2: JSON.stringify({ v: 1, data: { ...worlds(1, 2), 'sloth_lvl_2-1': lvl(3), 'sloth_lvl_2-2': lvl(1), 'sloth_lvl_2-3': lvl(2), 'sloth_lvl_2-4': lvl(3), sloth_difficulty: 'easy' } }),
  }),
  // all three taken: Grandma Jo playing has finished all ten worlds; Matt and Mia saved
  full: (now) => ({
    ...worlds(10),
    sloth_difficulty: 'normal',
    sloth_howto_seen: '1',
    sloth_slot_active: '3',
    sloth_slots: JSON.stringify([{ name: 'Matt', playedAt: now - 3 * DAY }, { name: 'Mia', playedAt: now - DAY }, { name: 'Grandma Jo', playedAt: now }]),
    sloth_slot_data_1: JSON.stringify({ v: 1, data: { ...worlds(3), sloth_difficulty: 'normal' } }),
    sloth_slot_data_2: JSON.stringify({ v: 1, data: { ...worlds(1, 2), sloth_difficulty: 'easy' } }),
  }),
};
const SIZES = [['up', 412, 915], ['side', 915, 412], ['sup', 360, 640], ['sside', 640, 360]];

/** text running past its box, or a tap target under 44 px, inside the open pop-ups and the title's row */
const clip = (p) =>
  p.evaluate(() => {
    const bad = [];
    const scope = document.querySelectorAll('.nv-card, .ttl-row');
    for (const root of scope) {
      const rb = root.getBoundingClientRect();
      if (rb.left < -1 || rb.right > innerWidth + 1 || rb.top < -1 || rb.bottom > innerHeight + 1) bad.push(['off screen', root.className, Math.round(rb.top), Math.round(rb.bottom)]);
      for (const e of root.querySelectorAll('b, small, span, button, p, label, input')) {
        if (e.children.length && e.tagName !== 'BUTTON') continue;
        const r = document.createRange();
        r.selectNodeContents(e);
        const t = r.getBoundingClientRect();
        const q = e.getBoundingClientRect();
        if (t.width && (t.right > q.right + 1.5 || t.left < q.left - 1.5) && getComputedStyle(e).overflow !== 'visible') bad.push(['cut', e.className || e.tagName, e.textContent.slice(0, 30)]);
        const card = e.closest('.sl-card, .nv-card');
        if (card && e.tagName === 'BUTTON' && !e.classList.contains('nv-x')) {
          const c = card.getBoundingClientRect();
          if (q.right > c.right + 1 || q.left < c.left - 1 || q.bottom > c.bottom + 1) bad.push(['out of its card', e.className, e.textContent.slice(0, 20)]);
        }
        if ((e.tagName === 'BUTTON' || e.tagName === 'INPUT') && (q.width < 44 || q.height < 44) && q.width > 0) bad.push(['small', e.className, Math.round(q.width), Math.round(q.height), e.textContent.slice(0, 20)]);
      }
    }
    return bad;
  });

const b = await chromium.launch();
const errs = [];
for (const [save, seed] of Object.entries(SAVES)) {
  if (only && !only.includes(save)) continue;
  for (const [tag, w, h] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    p.on('pageerror', (e) => errs.push(`${save} ${tag}: ${e}`));
    await p.addInitScript((d) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v);
    }, seed(Date.now()));
    await p.goto('http://127.0.0.1:8816/?lessons=off');
    await p.waitForTimeout(6000);
    const shot = async (name) => {
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/${save}-${name}-${tag}.png` });
      const bad = await clip(p);
      console.log(`${bad.length ? 'ROUGH' : 'ok   '} ${save} ${name} ${tag}${bad.length ? ' ' + JSON.stringify(bad) : ''}`);
    };
    await shot('title');
    await p.click('.ttl-whobtn');
    await shot('who');
    if (save === 'family' || save === 'full') {
      await p.click('.sl-erase >> nth=0');
      await shot('erase');
      await p.keyboard.press('Escape');
    }
    if (save !== 'full') {
      await p.click('.sl-empty .sl-go >> nth=0');
      await shot('newname');
      await p.keyboard.press('Escape');
    }
    await p.keyboard.press('Escape');
    await p.waitForTimeout(400);
    if (save !== 'fresh') {
      await p.click('.ttl-new');
      await shot('newgame');
      await p.keyboard.press('Escape');
    }
    await p.close();
  }
}
console.log('page errors:', errs.length ? errs : 'none');
await b.close();
