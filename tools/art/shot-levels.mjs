// polish-levels: stills of a stage with Pokey stood at a spot, upright (390 x 844) and sideways (844 x 390), from a dev-hooks build
// (NODE_ENV=development npx vite build && npx vite preview --port <port>). Each shot: a stage, its layout, Easy or Normal, where he
// stands (world x; y from the ground there), and how long to wait (s) for Dot's line or the sign to be on screen.
//   node tools/art/shot-levels.mjs <port> <out dir> <spec.json>
// spec: [{ "name": "2-3-sign", "id": "2-3", "layout": 1, "mode": "normal", "x": 1350, "y": 580, "walk": 0.8, "wait": 1.5 }, ...]
import { createRequire } from 'module';
import { mkdirSync, readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, specFile] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specFile, 'utf8'));
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const s of spec) {
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1${s.lessons === false ? '&lessons=off' : ''}`);
    await p.evaluate((m) => { localStorage.setItem('sloth_difficulty', m); for (const k of Object.keys(localStorage)) if (k.startsWith('sloth_tips') || k.startsWith('sloth_tip')) localStorage.removeItem(k); }, s.mode ?? 'normal');
    if (s.ease) await p.evaluate((v) => localStorage.setItem('sloth_ease_in', v), s.ease);
    await p.reload();
    await p.waitForTimeout(2500);
    await p.evaluate(([id, layout]) => window.__play(id, layout), [s.id, s.layout ?? 1]);
    await p.waitForTimeout(s.start ?? 6000);
    // (a key sends the stage's goal card to its counter, so it is not over the shot)
    await p.keyboard.press('ArrowDown');
    // (the engine is up once the stage's sheets are in: wait for it, at most 20 s more)
    await p.waitForFunction(() => !!(typeof window.__engine === 'function' ? window.__engine() : window.__engine), null, { timeout: 20000 });
    if (s.x !== undefined) {
      // (stood on the lowest still top under x: the floor, not a branch above it)
      await p.evaluate(([x, y]) => {
        // (the app's hook is a function; the engine also leaves itself there)
        const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
        const pl = e.player;
        // (the top nearest `y` when the spec gives one, else the lowest)
        const u = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width).sort((a, c) => (y === undefined ? c.y - a.y : Math.abs(a.y - y) - Math.abs(c.y - y)));
        pl.x = x;
        if (u[0]) pl.y = u[0].y;
        pl.vx = 0;
        pl.vy = 0;
        pl.invincibleTimer = 3;
      }, [s.x, s.y]);
    }
    if (s.walk) {
      await p.keyboard.down('ArrowRight');
      await p.waitForTimeout(s.walk * 1000);
      await p.keyboard.up('ArrowRight');
    }
    await p.waitForTimeout((s.wait ?? 1.2) * 1000);
    await p.screenshot({ path: `${out}/${s.name}-${tag}.png` });
    console.log('shot', s.name, tag);
  }
  await ctx.close();
}
await b.close();
