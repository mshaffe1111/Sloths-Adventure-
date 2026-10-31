// World plate starts (hf-cutscenes): each world's story scenery for a mood at the plate shape (1600 x 1700), nobody in it, from the dev server.
// node tools/art/hfstory/worldstarts.mjs <outDir> 1/day,8/night,...   (dev server on 4301)
import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
const { chromium } = createRequire('/home/user/Sloths-Adventure-/package.json')('playwright');
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const pairs = process.argv[3].split(',').map((s) => s.split('/'));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 800, height: 800 } });
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4301/?lessons=off');
await p.waitForTimeout(3000);
for (const [w, mood] of pairs) {
  const url = await p.evaluate(async ([w, mood]) => {
    const m = await import('/src/game/storyArt.ts');
    const W = 960, H = 960 * 572 / 1024, TOP = 960 * 1290 / 2560, K = 1600 / 960;
    const c = document.createElement('canvas'); c.width = 1600; c.height = Math.round((H + TOP) * K);
    const ctx = c.getContext('2d');
    const scene = { world: +w, mood, actors: [], particles: 'none', zoom: 1, focusX: 0.5 };
    for (let i = 0; i < 12; i++) {
      ctx.setTransform(K, 0, 0, K, 0, TOP * K);
      m.drawStoryScene(ctx, scene, 3, W, H, 0, 1, TOP);
      await new Promise((r) => setTimeout(r, 400));
    }
    return c.toDataURL('image/png');
  }, [w, mood]);
  writeFileSync(`${out}/w${w}-${mood}.png`, Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', w, mood);
}
await b.close();
