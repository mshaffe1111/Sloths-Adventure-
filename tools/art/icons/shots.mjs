// Every screen with icons, upright 412x915 and sideways 915x412, on a fresh save and an old one (tools/art/satchel-seed.js):
//   node tools/art/icons/shots.mjs <out dir> [screen,...]     (dev server on port 4301, PORT= for another)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : null;
const PORT = process.env.PORT || 4301;
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const wait = (p, ms) => p.waitForTimeout(ms);
const click = async (p, sel, ms = 900) => { await p.locator(sel).first().click({ timeout: 4000 }); await wait(p, ms); };
const SCREENS = {
  title: async () => {},
  settings: async (p, shot) => { await click(p, '[data-menu]'); await shot('settings-sound');
    for (const t of ['Game', 'Saves', 'Trophies', 'About']) { try { await click(p, `.st-tab[aria-label="${t}"]`, 400); await shot(`settings-${t.toLowerCase()}`); } catch {} } },
  map: async (p, shot) => { await click(p, '.ttl-leaf >> nth=0', 2500); await shot('map'); try { await click(p, '.map-node, .wm-node, [data-stage]', 700); await shot('map-picked'); } catch {} },
  satchel: async (p, shot) => { await click(p, '.ttl-leaf-satchel', 1500); await shot('satchel-finds');
    for (const t of ['Trophies', 'Journal', 'Scenes', 'Creatures']) { try { await click(p, `[aria-label="${t}"], button:has-text("${t}")`, 600); await shot(`satchel-${t.toLowerCase()}`); } catch {} } },
  howto: async (p, shot) => { await click(p, '.ttl-leaf >> nth=3', 1500); await shot('howto'); },
  hud: async (p, shot) => { await p.evaluate(() => window.__play('1-2')); await wait(p, 6000); await shot('hud'); await p.keyboard.press('Escape'); await wait(p, 1500); await shot('pause');
    for (const t of ['Game', 'Trophies']) { try { await click(p, `.pm-tabs .st-tab[aria-label="${t}"]`, 400); await shot(`pause-${t.toLowerCase()}`); } catch {} } },
};
const b = await chromium.launch();
for (const save of ['fresh', 'old']) for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) for (const [name, fn] of Object.entries(SCREENS)) {
  if (only && !only.includes(name)) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  if (save === 'old') await ctx.addInitScript(seed); else await ctx.addInitScript(() => { try { if (!sessionStorage.__c) { localStorage.clear(); localStorage.setItem('sloth_coach_done', '1'); sessionStorage.__c = 1; } } catch {} });
  const p = await ctx.newPage();
  const shot = (s) => p.screenshot({ path: `${out}/${s}-${save}-${tag}.png` });
  try { await p.goto(`http://127.0.0.1:${PORT}/?lessons=off`); await wait(p, 8000); if (name === 'title') await shot('title'); else await fn(p, shot); }
  catch (e) { console.log('FAIL', name, save, tag, String(e).slice(0, 160)); }
  await ctx.close();
}
await b.close();
