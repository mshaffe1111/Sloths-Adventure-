// node reference/qa-reports/ENG-25d/fallShot.mjs [outDir]   (ENG-25d: the snap toy row with NO pin: Pokey lands by a real fall (no pin); is he drawn on the floor?)
// TEST-ONLY, nothing in the game changes: a dev vite; in the page's own module instances it builds the snap toy's kit (tools/inspect/snapToys.ts's
// ENG-25d: __play('2-5') could not start the toy: the engine builds with 2-5's REAL config (purge, 12 enemies) and the toy has no animals
// ("no seed of 24 from 1 builds cleanly (the first: not enough enemies for the quota)"). So the toy is planted under 2-7 (a sprint, not laid
// yet) and rolled with 2-7's real config (worldsData.generateAllLevels), the config the engine itself builds with. Page memory only.
// `step` pond: the toy kit's meadow and one pond of three snap stones, 30 px of water, laid by gen2) and plants it as STAGE's listed roll
// (LISTED + a one-seed list, W2_STAGES' hand-built STAGE set aside in page memory), so __play(STAGE) rolls the toy with World 2's finish and
// sheets. 2-5 is not laid yet: this is the TOY under 2-7's slot. Pokey is pinned on a stone; the built stage, setting and orientation
// are printed from the game (D62).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

// (the container's own Playwright, as require finds it: an ESM import does not read NODE_PATH)
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const outDir = path.resolve(process.argv[2] ?? path.join(root, 'reference/qa-reports/ENG-25d'));
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 5194;
const STAGE = '2-7';
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
  page.on('response', (r) => { if (r.status() === 404) console.log('404', r.url().slice(0, 200)); });
  page.on('console', (m) => { if (m.type() === 'error') console.log('console error', m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(2000);
  const plantFn = async (STAGE) => {
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
    const WD = await import('/src/game/worldsData.ts');
    const cfg = { ...WD.generateAllLevels().find((l) => l.id === STAGE), unlocked: true };
    let seed = 0, st = null;
    for (let s = 1; s <= 60 && !st; s++) {
      const b = P.buildGen2Stage({ config: cfg, kit, seed: s, difficulty: 'normal' });
      if (!b.gen2.errors?.length && b.platforms.some((p) => p.pad?.on === 'bites')) { seed = s; st = b; }
    }
    if (!st) return { err: 'no clean roll lays the pond' };
    const dict = [];
    const packed = SL.packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...P.keptFoes(st)] }, dict);
    L.LISTED[STAGE] = { kit: () => kit, world: (s, _sq, d) => W2.w2Finish(s, d) };
    SL.plantSeedList(STAGE, { dict, seeds: [seed], plans: [packed] });
    delete W2S.W2_STAGES[STAGE];
    return { seed, levels: !!LV, stage: STAGE, cfg: [cfg.objectiveType, cfg.targetCount, cfg.levelWidth] };
  };
  let planted = await page.evaluate(plantFn, STAGE);
  console.log(o.id, 'planted', JSON.stringify(planted));
  let ok = false;
  await page.evaluate((id) => window.__play(id), STAGE);
  // (ENG-25d: the dev server can reload the page on the stage's first launch (a dependency it optimises then), which forgets the plant:
  // when the page's hooks are gone, wait for the new page and plant again, at most twice)
  for (let t = Date.now(), tries = 0; !ok && Date.now() - t < 180000; ) {
    await sleep(1000);
    const st = await page.evaluate(() => {
      if (typeof window.__engine !== 'function') return 'gone';
      const e = window.__engine();
      return e && e.currentStage && e.currentStage.platforms.some((p) => p.pad?.on === 'bites') ? 'ok' : 'wait';
    }).catch(() => 'gone');
    if (st === 'ok') ok = true;
    else if (st === 'gone' && tries < 2) {
      for (let w = Date.now(); Date.now() - w < 300000; ) {
        if (await page.evaluate(() => typeof window.__play === 'function').catch(() => false)) break;
        await sleep(1000);
      }
      if (await page.evaluate(() => typeof window.__play === 'function').catch(() => false)) {
        tries++;
        await sleep(2000);
        planted = await page.evaluate(plantFn, STAGE);
        console.log(o.id, 'the page reloaded: planted again', JSON.stringify(planted));
        await page.evaluate((id) => window.__play(id), STAGE);
      }
    }
  }
  if (!ok) {
    const why = await page.evaluate(async (STAGE) => {
      const L = await import('/src/game/gen2/listed.ts');
      const W2S = await import('/src/game/w2Stages.ts');
      const SG = await import('/src/game/stageGenerator.ts');
      const e = typeof window.__engine === 'function' ? window.__engine() : null;
      const s = e?.currentStage;
      return { engine: !!e, id: s?.id ?? e?.config?.id, gen2: !!s?.gen2, plats: s?.platforms?.length, listed: !!L.LISTED[STAGE], w2: STAGE in W2S.W2_STAGES, roll: !!SG.listedRoll({ id: STAGE }) };
    }, STAGE);
    console.log(o.id, 'the toy did not load', JSON.stringify(why));
    continue;
  }
  // (ENG-25d: NO pin. He is set down once in the air over the floor and the game runs; the update after the frame he lands is held, so
  // the shot is that landing as the engine left it. Each shot logs the engine's numbers: his feet, the floor's top, and both on screen by the camera and zoom)
  const setup = await page.evaluate(() => {
    const e = window.__engine();
    const s = e.currentStage;
    const stones = s.platforms.filter((p) => p.pad?.on === 'bites').sort((a, b) => a.x - b.x);
    const bank = s.platforms.find((p) => p.type === 'solid' && !p.pad && Math.abs(p.x + p.width - (stones[0].x - 30)) <= 1);
    const U = Object.getPrototypeOf(e).update;
    window.__hold = null;
    e.update = function (dt) {
      if (window.__hold) return;
      const p = this.player;
      const was = p.grounded;
      U.call(this, dt);
      if (this.lives < 5) this.lives = 9;
      const want = window.__want;
      if (want && !was && p.grounded) {
        const mid = p.x + p.width / 2;
        const f = this.currentStage.platforms.find((q) => mid >= q.x && mid <= q.x + q.width && Math.abs(q.y - p.y) <= 2);
        if (f && (want === 'stone' ? f.pad?.on === 'bites' : !f.pad)) {
          const c = this.camera, z = this.zoom;
          window.__hold = { want, feet: p.y, top: f.y, mid, floor: [f.x, f.y, f.width], pad: !!f.pad, invincible: p.invincibleTimer,
            cam: [c.x, c.y], zoom: z, feetOnScreen: (p.y - c.y) * z, topOnScreen: (f.y - c.y) * z, h: p.height, w: p.width };
        }
      }
    };
    return { stones: stones.map((p) => [p.x, p.y, p.width]), bank: bank ? [bank.x, bank.y, bank.width] : null, id: e.config?.id ?? e.levelConfig?.id, easy: !!e.easy, w: innerWidth, h: innerHeight };
  });
  console.log(o.id, 'built', JSON.stringify(setup));
  for (const want of ['bank', 'stone']) {
    const ok = await page.evaluate(({ want, setup }) => {
      const e = window.__engine();
      const p = e.player;
      window.__hold = null;
      window.__want = want;
      // (set down ONCE, his feet 40 px over the floor (p.y is his FEET: engine.ts cy = p.y - p.height / 2), then the game runs: he falls
      // and lands by the engine's own rules. bank: his middle 60 px short of the near bank's lip; stone: over the middle stone's middle)
      const lip = setup.stones[0][0] - 30;
      const mx = want === 'stone' ? setup.stones[1][0] + setup.stones[1][2] / 2 : lip - 60;
      p.x = mx - p.width / 2; p.y = (want === 'stone' ? setup.stones[1][1] : setup.bank[1]) - 40; p.vx = 0; p.vy = 0; p.grounded = false;
      return true;
    }, { want, setup });
    let held = null;
    for (let t = Date.now(); !held && Date.now() - t < 15000; ) { await sleep(100); held = await page.evaluate(() => window.__hold); }
    if (!held) { console.log(o.id, want, 'no landing seen', JSON.stringify(await page.evaluate(() => { const p = window.__engine().player; return [p.x, p.y, p.grounded]; }))); continue; }
    await sleep(600);
    const f = path.join(outDir, `fall-${o.id}-${o.viewport.width}x${o.viewport.height}-${want}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, JSON.stringify(held));
  }
  await ctx.close();
}
await browser.close();
console.log('vite:', vout.split('\n').filter((l) => /reload|optimi/i.test(l)).join(' | ').slice(0, 600));
vite.kill();
