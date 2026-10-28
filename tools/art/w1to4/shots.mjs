// Screenshots of the puzzle kit's phase 2a test rooms (upright 390 x 844 and sideways 844 x 390) and of each new far backdrop in a
// stage, for Matt, from a preview of the production build:
//   npx vite build && npx vite preview --port 4388 &   then   node tools/art/w1to4/shots.mjs <out dir> [port] [playwright module path]
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4388';
const { chromium } = await import(process.argv[4] ?? 'playwright');
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
// each room: how long to walk in from its door (s), and what to do there before the shot
const ROOMS = [
  ['seesaw', 1.6, []],
  ['bell', 0.7, []], // (stopping by the pebbles, the bell still ahead of him: 1.2 s took him onto it, hiding it)
  ['light', 1.4, []],
  ['wind', 1.3, []],
  ['sluice', 1.2, []],
  ['trade', 1.4, []],
];
const BACKDROPS = [['w1sunrise', '1-2'], ['w1kapok', '1-7'], ['w2rapids', '2-4'], ['w2evening', '2-7'], ['w3cavern', '3-6'], ['w4terraces', '4-2'], ['w4mist', '4-7']];
const b = await chromium.launch();
const walk = async (p, seconds) => {
  await p.keyboard.down('ArrowRight');
  await p.waitForTimeout(seconds * 1000);
  await p.keyboard.up('ArrowRight');
};
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const [room, secs] of ROOMS) {
    await p.goto(`http://127.0.0.1:${port}/?autostart=1&level=kit&room=${room}&nodemo=1`);
    await p.waitForTimeout(4500);
    await walk(p, secs);
    await p.waitForTimeout(1400);
    await p.screenshot({ path: `${out}/kit-${room}-${size}.png` });
  }
  if (size === 'sideways') {
    for (const [stem, id] of BACKDROPS) {
      await p.goto(`http://127.0.0.1:${port}/?autostart=1&level=${id}&nodemo=1`);
      await p.waitForTimeout(7000);
      await p.screenshot({ path: `${out}/backdrop-${stem}-${id}.png` });
    }
  }
  await ctx.close();
}
await b.close();
