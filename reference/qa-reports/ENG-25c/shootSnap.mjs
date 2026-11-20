// node reference/qa-reports/ENG-25c/shootSnap.mjs [outDir]   (ENG-25c: stills of the snap toy row on the REAL page, upright and sideways)
// TEST-ONLY, nothing in the game changes: a dev vite; in the page's own module instances it builds the snap toy's kit (tools/inspect/snapToys.ts's
// `step` pond: the toy kit's meadow and one pond of three snap stones, 30 px of water, laid by gen2) and plants it as 2-5's listed roll
// (LISTED + a one-seed list, W2_STAGES' hand-built 2-5 set aside in page memory), so __play('2-5') rolls the toy with World 2's finish and
// sheets. 2-5 itself is not laid yet: this is the TOY under 2-5's slot. Pokey is pinned on a stone; the built stage, setting and orientation
// are printed from the game (D62).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

// (the container's own Playwright, as require finds it: an ESM import does not read NODE_PATH)
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const outDir = path.resolve(process.argv[2] ?? path.join(root, 'reference/qa-reports/ENG-25c'));
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 5191;
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let t = Date.now(); !vout.includes('Local') && Date.now() - t < 120000; ) await sleep(500);

const ORIENTS = [
  { id: 'upright', viewport: { width: 412, height: 915 } },
  { id: 'sideways', viewport: { width: 915, height: 412 } },
];
const browser = await chromium.launch();
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(2000);
  const planted = await page.evaluate(async () => {
    const L = await import('/src/game/gen2/listed.ts');
    const SL = await import('/src/game/gen2/seedList.ts');
    const P = await import('/src/game/gen2/pipeline.ts');
    const W2S = await import('/src/game/w2Stages.ts');
    const TW = await import('/src/game/gen2/toyWorld.ts');
    const W2 = await import('/src/game/gen2/worlds/w2.ts');
    const LV = await import('/src/game/levels.ts').catch(() => null);
    const row = { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 } };
    const pond = {
      id: 'toy-snap-step', name: 'snap stones (step)', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
      pieces: [
        { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true },
        { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'pads', after: 'near', row: 'step' }, main: true, landing: true },
      ],
      entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false,
    };
    const kit = {
      ...TW.kit,
      manifest: {
        ...TW.kit.manifest, world: 2, pads: { step: row }, creatures: [], props: [], pairs: [], tips: {},
        sections: [{ ...TW.meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: TW.meadow.sockets.filter((k) => k.role !== 'prop') }, pond],
      },
    };
    const cfg = { ...TW.cfg('2-5', 'sprint'), unlocked: true };
    let seed = 0, st = null;
    for (let s = 1; s <= 60 && !st; s++) {
      const b = P.buildGen2Stage({ config: cfg, kit, seed: s, difficulty: 'normal' });
      if (!b.gen2.errors?.length && b.platforms.some((p) => p.pad?.on === 'bites')) { seed = s; st = b; }
    }
    if (!st) return { err: 'no clean roll lays the pond' };
    const dict = [];
    const packed = SL.packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...P.keptFoes(st)] }, dict);
    L.LISTED['2-5'] = { kit: () => kit, world: (s, _sq, d) => W2.w2Finish(s, d) };
    SL.plantSeedList('2-5', { dict, seeds: [seed], plans: [packed] });
    delete W2S.W2_STAGES['2-5'];
    return { seed, levels: !!LV };
  });
  console.log(o.id, 'planted', JSON.stringify(planted));
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate(() => window.__play('2-5'));
    await sleep(5000);
    ok = await page.evaluate(() => { const e = window.__engine(); return !!(e && e.currentStage && e.currentStage.platforms.some((p) => p.pad?.on === 'bites')); });
  }
  if (!ok) {
    const why = await page.evaluate(async () => {
      const L = await import('/src/game/gen2/listed.ts');
      const W2S = await import('/src/game/w2Stages.ts');
      const SG = await import('/src/game/stageGenerator.ts');
      const e = window.__engine();
      const s = e?.currentStage;
      return { engine: !!e, id: s?.id ?? e?.config?.id, gen2: !!s?.gen2, plats: s?.platforms?.length, listed: !!L.LISTED['2-5'], w2: '2-5' in W2S.W2_STAGES, roll: !!SG.listedRoll({ id: '2-5' }) };
    });
    console.log(o.id, 'the toy did not load', JSON.stringify(why));
    continue;
  }
  const info = await page.evaluate(() => {
    const e = window.__engine();
    const s = e.currentStage;
    const stones = s.platforms.filter((p) => p.pad?.on === 'bites').sort((a, b) => a.x - b.x);
    const bank = s.platforms.find((p) => p.type === 'solid' && !p.pad && Math.abs(p.x + p.width - (stones[0].x - 30)) <= 1);
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 48); p.vx = 0; p.vy = 0; p.grounded = true; if (this.lives < 5) this.lives = 9; p.invincibleTimer = 99; }
      R.call(this);
    };
    let diff = null;
    try { diff = localStorage.getItem('sloth_difficulty'); } catch { /* none */ }
    return { stones: stones.map((p) => [p.x, p.y, p.width]), bank: bank ? [bank.x, bank.y, bank.width] : null, id: e.config?.id ?? e.levelConfig?.id, easy: !!e.easy, diff, w: innerWidth, h: innerHeight };
  });
  console.log(o.id, 'built', JSON.stringify(info));
  // (Pokey on the middle stone, his middle over it; then on the near bank's lip, the stones and banks level in one frame)
  const spots = [
    { name: 'stone', x: info.stones[1][0] + info.stones[1][2] / 2, y: info.stones[1][1] },
    { name: 'bank', x: info.stones[0][0] - 30 - 20, y: info.bank ? info.bank[1] : info.stones[0][1] },
  ];
  for (const sp of spots) {
    await page.evaluate((p) => { window.__pin = p; }, sp);
    await sleep(2500);
    const f = path.join(outDir, `snaprow-${o.id}-${o.viewport.width}x${o.viewport.height}-${sp.name}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await ctx.close();
}
await browser.close();
vite.kill();
