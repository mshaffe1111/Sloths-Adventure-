// Every screen with icons, upright 412x915 and sideways 915x412, on a fresh save and an old one (tools/art/satchel-seed.js):
//   node tools/art/icons/shots.mjs <out dir> [screen,...]     (dev server on port 4301, PORT= for another)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const only = process.argv[3] ? process.argv[3].split(',') : null;
const PORT = process.env.PORT || 4301;
import { spawn } from 'child_process';
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
// a finished save (every stage, find, scene, creature and medal), built like clipcheck's "done" from the game's own ids
const ROOT = new URL('../../../', import.meta.url).pathname;
const IDS = await new Promise((res, rej) => {
  const p = spawn('npx', ['tsx', ROOT + 'tools/perf/clipseed.ts'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] });
  let o = ''; p.stdout.on('data', (d) => (o += d)); p.on('exit', (c) => (c ? rej(new Error('clipseed')) : res(JSON.parse(o))));
});
const doneSeed = (IDS) => {
  const L = localStorage; L.clear(); L.setItem('sloth_howto_seen', '1'); L.setItem('sloth_coach_done', '1'); L.setItem('sloth_difficulty', 'normal');
  const kinds = ['snake', 'boa', 'turtle', 'ocelot', 'jaguar']; let n = 0;
  for (let w = 1; w <= 10; w++) { for (let m = 1; m <= 10; m++) { n++; const id = `${w}-${m}`;
    L.setItem(`sloth_lvl_${id}`, JSON.stringify({ completed: true, stars: 3, highScore: 3000 + n * 50, bestTime: 120 + ((n * 37) % 200) }));
    const ft = 30 + (n % 12), t = 80 + ((n * 41) % 230), ll = n % 3;
    L.setItem(`sloth_play_${id}`, JSON.stringify({ v: 1, n: 1 + (n % 3), w: 1 + (n % 2), bt: t - 10, bs: 3, first: { t, ll, hl: ll + 1, fl: ft - (n % 5), ft, st: 3, k: 2 + (n % 6), kt: kinds[(w + m) % 5], ch: n % 4, fr: m === 6 ? 2 : 0, sw: n % 9, fd: [], md: [], d: 1793000000000 + n * 3600000 } }));
  } L.setItem(`sloth_story_w${w}`, '1'); }
  const seen = IDS.creatures;
  L.setItem('sloth_finds', JSON.stringify({ v: 1, found: IDS.finds }));
  L.setItem('sloth_memories', JSON.stringify({ v: 1, seen: IDS.memories }));
  L.setItem('sloth_badges', JSON.stringify({ v: 1, earned: Object.fromEntries(IDS.badges.map((b, i) => [b, 1793000000000 + i * 60000])), kills: Object.fromEntries(seen.map((x, i) => [x, 3 + i])), seen, counters: {}, quiet: [] }));
};
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
for (const save of (process.env.SAVES || 'fresh,old,done').split(',')) for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) for (const [name, fn] of Object.entries(SCREENS)) {
  if (only && !only.includes(name)) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  if (save === 'old') await ctx.addInitScript(seed); else if (save === 'done') await ctx.addInitScript(`if (!sessionStorage.__c) { (${doneSeed})(${JSON.stringify(IDS)}); sessionStorage.__c = 1; }`); else await ctx.addInitScript(() => { try { if (!sessionStorage.__c) { localStorage.clear(); localStorage.setItem('sloth_coach_done', '1'); sessionStorage.__c = 1; } } catch {} });
  const p = await ctx.newPage();
  const shot = (s) => p.screenshot({ path: `${out}/${s}-${save}-${tag}.png` });
  try { await p.goto(`http://127.0.0.1:${PORT}/?lessons=off`); await wait(p, 8000); if (name === 'title') await shot('title'); else await fn(p, shot); }
  catch (e) { console.log('FAIL', name, save, tag, String(e).slice(0, 160)); }
  await ctx.close();
}
await b.close();
