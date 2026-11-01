// The map's stage-type badges, two ways for the lead to pick (2026-11-01): 1) a 26 px painted badge beside the node, 2) none (the type
// is in the stage card's words). Old save, upright and sideways, cropped to the nodes.   node shot-mapbadges.mjs <out>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const OPT = {
  now: '',
  beside: `.map-tbadge { width: 30px !important; height: 30px !important; right: auto !important; left: calc(100% - 6px) !important; top: auto !important; bottom: -4px !important; }
           .map-tbadge .pic { width: 26px !important; height: 26px !important; }`,
  none: `.map-tbadge { display: none !important; }`,
};
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) for (const [k, css] of Object.entries(OPT)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(seed);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${process.env.PORT || 4301}/?lessons=off`); await p.waitForTimeout(7000);
  await p.locator('.ttl-leaf >> nth=0').click(); await p.waitForTimeout(2500);
  if (css) await p.addStyleTag({ content: css });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/badges-${k}-${tag}.png` });
  await ctx.close();
}
await b.close();
