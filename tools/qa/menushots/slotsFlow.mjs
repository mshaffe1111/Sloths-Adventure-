// Save slots, end to end in the real game: an old single save (Worlds 1-3, no slot list) shows as Explorer 1; a new explorer starts
// fresh after the reload; going back to Explorer 1 brings every one of their storage keys back exactly; sound stays the phone's.
// Run: npx vite --port=8816 --host=127.0.0.1 (another shell), then: node tools/qa/menushots/slotsFlow.mjs
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const lvl = (stars) => JSON.stringify({ completed: true, stars, bestTime: 95, highScore: 1400 });
const old = Object.fromEntries([...Array(30)].map((_, i) => [`sloth_lvl_${Math.floor(i / 10) + 1}-${(i % 10) + 1}`, lvl(3)]));
Object.assign(old, { sloth_difficulty: 'normal', sloth_howto_seen: '1', sloth_story_w1: '1', sloth_finds: '["w1-note"]', 'sloth_seed_2-4_a': '1', sloth_music_vol: '0.3' });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
await p.addInitScript((d) => {
  if (sessionStorage.getItem('seeded')) return;
  sessionStorage.setItem('seeded', '1');
  localStorage.clear();
  for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v);
}, old);
const ok = (name, v, extra = '') => console.log(`${v ? 'PASS' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`);
const dump = () => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => /^sloth_(lvl|story|finds|seed|difficulty)/.test(k)).sort().map((k) => [k, localStorage.getItem(k)])));
await p.goto('http://127.0.0.1:8816/?lessons=off');
await p.waitForTimeout(6000);
const before = await dump();
ok('old save: title says Continue', (await p.textContent('.ttl-play')).includes('CONTINUE'));
ok('old save: shows as Explorer 1', (await p.textContent('.ttl-who-n')).trim() === 'Explorer 1');
await p.click('.ttl-new');
await p.waitForTimeout(500);
await p.getByRole('button', { name: 'A new explorer' }).click();
await p.waitForTimeout(500);
await p.fill('#sl-name-in', 'Mia');
await p.getByRole('button', { name: 'Start their adventure' }).click();
await p.waitForTimeout(6500);
ok('new explorer: the game reloaded as Mia', (await p.textContent('.ttl-who-n')).trim() === 'Mia');
ok('new explorer: a fresh start', (await p.textContent('.ttl-play')).includes('START ADVENTURE'));
const fresh = await dump();
ok('new explorer: no stage results or finds', !Object.keys(fresh).some((k) => /^sloth_(lvl|finds|seed)/.test(k)), JSON.stringify(Object.keys(fresh)));
ok('the phone keeps its sound', (await p.evaluate(() => localStorage.getItem('sloth_music_vol'))) === '0.3');
await p.click('.ttl-whobtn');
await p.waitForTimeout(500);
await p.locator('.sl-card:has-text("Explorer 1") .sl-play').click();
await p.waitForTimeout(6500);
ok('back to Explorer 1', (await p.textContent('.ttl-who-n')).trim() === 'Explorer 1');
const after = await dump();
ok('Explorer 1 comes back exactly', JSON.stringify(after) === JSON.stringify(before), `${Object.keys(after).length} of ${Object.keys(before).length} keys`);
ok('no switch left half done', (await p.evaluate(() => localStorage.getItem('sloth_slot_switch'))) === null);
console.log('page errors:', errs.length ? errs : 'none');
await b.close();
