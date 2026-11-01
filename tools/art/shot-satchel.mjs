// Mock-up and proof shots of the satchel (2026-11-01), upright 412x915 and sideways 915x412, against a dev server on port 4301:
//   node tools/art/shot-satchel.mjs <outDir> [only]
// Seeds a sample save (satchel-seed.js), then: the start screen, each Satchel tab, a medal close-up, a creature's story, the journal's
// stage page and review page, the scene list, and the in-game medal pop.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [OUT, only] = process.argv.slice(2);
const seed = readFileSync(new URL('./satchel-seed.js', import.meta.url), 'utf8');
const b = await chromium.launch();
const sizes = [[412, 915, 'up'], [915, 412, 'side']];
for (const [w, h, tag] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await ctx.addInitScript(`if (!sessionStorage.getItem('seeded')) { ${seed}; sessionStorage.setItem('seeded', '1'); }`);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  const shot = async (name) => { if (!only || name.includes(only)) await p.screenshot({ path: `${OUT}/${name}-${tag}.png` }); };
  await p.goto('http://127.0.0.1:4301/?lessons=off');
  await p.waitForTimeout(7000);
  await shot('01-title');
  await p.click('.ttl-leaf-satchel');
  await p.waitForTimeout(1500);
  await shot('02-finds');
  const tab = async (name) => { await p.click(`.sh-tab:has-text("${name}")`); await p.waitForTimeout(900); };
  await tab('Trophies');
  await shot('03-trophies');
  await p.click('.st-medal.got >> nth=0').catch(() => p.click('.st-medal >> nth=0'));
  await p.waitForTimeout(900);
  await shot('04-medal-closeup');
  await p.click('.sp-x');
  await p.waitForTimeout(400);
  await tab('Journal');
  await shot('05-journal');
  if (tag === 'up') {
    await p.click('.jb-arrow >> nth=1').catch(() => {});
    await p.waitForTimeout(800);
    await shot('06-journal-review');
  } else {
    await p.click('.jb-arrow >> nth=0').catch(() => {});
    await p.waitForTimeout(800);
    await shot('06-journal-world3');
  }
  await tab('Scenes');
  await shot('07-scenes');
  await tab('Creatures');
  await shot('08-creatures');
  await p.click('.tr-card.sc-tap >> nth=0');
  await p.waitForTimeout(900);
  await shot('09-creature-story');
  await p.click('.sp-x');
  await p.waitForTimeout(300);
  // the in-game medal pop, over a stage
  await p.click('.ui-x');
  await p.waitForTimeout(800);
  await p.evaluate(() => window.__play && window.__play('1-2'));
  await p.waitForTimeout(9000);
  await p.evaluate(() => window.__medals && window.__medals(['first_steps']));
  await p.waitForTimeout(700);
  await shot('10-medal-pop');
  await ctx.close();
}
await b.close();
