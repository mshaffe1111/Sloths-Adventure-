// (b, in the browser) a phone's storage from 0.9.6 / 0.9.5 / a 34-find game opened by the shipped build: the map, the Satchel, and every
// storage entry before vs after the app ran (lost / changed). Then the Save/Load dialog: copy the save code, paste it into a fresh phone.
import fs from 'node:fs';
import { chromium, newPage, toMap, click, sleep, HEAD, MAIN, here } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = which === 'main' ? MAIN : HEAD;
const cases = {
  '096-finished': JSON.parse(fs.readFileSync(`${here}/saves/096/finished.storage.json`, 'utf8')),
  '096-finds34': JSON.parse(fs.readFileSync(`${here}/saves/096/finds34.storage.json`, 'utf8')),
  '095-mid': JSON.parse(fs.readFileSync(`${here}/saves/095/save-0.9.5-mid.json`, 'utf8')).data,
};
const PHONE = { sloth_music_vol: '0.3', sloth_sfx_vol: '0.25', sloth_howto_seen: '1', sloth_coach_done: '1' };
const browser = await chromium.launch();
const dumpLS = (page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
let fails = 0;
for (const [name, store] of Object.entries(cases)) {
  const { ctx, page, errors } = await newPage(browser, { ctx: { permissions: ['clipboard-read', 'clipboard-write'] } });
  await page.goto(url);
  const seeded = { ...store, ...PHONE };
  await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, seeded);
  await page.reload();
  await toMap(page);
  // every world on the map: stages shown done and stars
  const worlds = [];
  for (let i = 0; i < 12 && (await page.locator('.wm-arrow[aria-label="Previous world"]:not([disabled])').count()); i++) await click(page, '.wm-arrow[aria-label="Previous world"]');
  for (let w = 1; w <= 10; w++) {
    const done = await page.locator('.map-node.done').count();
    const stars = await page.locator('.map-stars .ic.on').count();
    worlds.push(`${done}/${stars}`);
    if (!(await page.locator('.wm-arrow[aria-label="Next world"]:not([disabled]):not([data-locked])').count())) break;
    await click(page, '.wm-arrow[aria-label="Next world"]');
  }
  await page.screenshot({ path: `${here}/shots/save-${which}-${name}-map.png` });
  const after = await dumpLS(page);
  const lost = Object.keys(seeded).filter((k) => !(k in after));
  const changed = Object.keys(seeded).filter((k) => k in after && after[k] !== seeded[k]);
  const added = Object.keys(after).filter((k) => !(k in seeded));
  // the dialog: Settings -> Saves -> Save / Load -> Copy save code; then a fresh phone pastes it
  await page.goto(url);
  await page.locator('.ttl-token[aria-label="Settings"]').waitFor({ timeout: 20000 });
  await sleep(600);
  await click(page, '.ttl-token[aria-label="Settings"]');
  await click(page, '.st-tab[aria-label="Saves"]');
  await click(page, '.st-row:has-text("Save / Load") .st-btn');
  const shown = (await page.locator('.ui-stats').first().innerText()).replace(/\s+/g, ' ');
  await click(page, 'button:has-text("Copy save code")');
  const code = await page.evaluate(() => navigator.clipboard.readText());
  const before2 = await dumpLS(page);
  await ctx.close();
  const f = await newPage(browser);
  await f.page.goto(url);
  await f.page.evaluate((p) => { localStorage.clear(); for (const [k, v] of Object.entries(p)) localStorage.setItem(k, v); localStorage.setItem('sloth_music_vol', '0.9'); }, PHONE);
  await f.page.reload();
  await f.page.locator('.ttl-token[aria-label="Settings"]').waitFor({ timeout: 20000 });
  await sleep(600);
  await click(f.page, '.ttl-token[aria-label="Settings"]');
  await click(f.page, '.st-tab[aria-label="Saves"]');
  await click(f.page, '.st-row:has-text("Save / Load") .st-btn');
  await click(f.page, '.ui-saveload button:has-text("Load")');
  await f.page.fill('#sl-paste', code);
  await click(f.page, 'button:has-text("Read code")');
  const pendingShown = (await f.page.locator('.ui-stats').first().innerText()).replace(/\s+/g, ' ');
  await f.page.locator('.ui-saveload .ui-btn-gold').first().evaluate((e) => e.click());
  await sleep(1500);
  const loaded = await dumpLS(f.page);
  const saveKeys = Object.keys(JSON.parse(code).data);
  const miss = saveKeys.filter((k) => loaded[k] !== JSON.parse(code).data[k]);
  const progLost = Object.keys(before2).filter((k) => /^sloth_(lvl|play|finds|memories|badges|story|secret|thorn|seed|cosmetic|w5)/.test(k) && loaded[k] !== before2[k]);
  const line = `${which} ${name}: map done/stars per world ${worlds.join(' ')}; storage ${Object.keys(seeded).length} -> lost ${lost.length} [${lost.slice(0, 5)}] changed ${changed.length} [${changed.slice(0, 5)}] added ${added.length} [${added.slice(0, 6)}]; dialog shows "${shown}"; paste-load shows "${pendingShown}", after Load ${miss.length} save entries differ, progress entries lost vs the source phone ${progLost.length} [${progLost.slice(0, 5)}], phone music vol kept ${loaded.sloth_music_vol}; errors ${errors.length + f.errors.length} ${[...errors, ...f.errors].slice(0, 2)}`;
  console.log(line);
  if (lost.length || miss.length || progLost.length || errors.length || f.errors.length) fails++;
  await f.ctx.close();
}
await browser.close();
console.log(fails ? `FAIL ${fails}` : 'PASS');
