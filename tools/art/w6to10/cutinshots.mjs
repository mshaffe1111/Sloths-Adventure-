// Screenshots of each in-game use of the 2026-10-29 cut-in (art-cutin), upright 390 x 844 and sideways 844 x 390, for Matt:
// the Seamstress's clips on 5-4 (knitting, the tell, the cast), Flicker's moves in Meeca's stage 5-M, the water's-edge signs (World 5's
// and the jungle one), and World 6's dawn and dusk far strips. Each shot also gets a 2x close-up of the piece it is about.
//   npx vite --port 4391 &   then   node tools/art/w6to10/cutinshots.mjs <out dir> [port] [playwright module path]
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4391';
const { chromium } = await import(process.argv[4] ?? 'playwright');
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const wait = (p, ms) => p.waitForTimeout(ms);
const eng = (p, fn, arg) => p.evaluate(([src, a]) => {
  let e = window.__engine;
  if (typeof e === 'function') e = e();
  return new Function('e', 'a', src)(e, a);
}, [fn, arg]);
async function dismiss(p) {
  for (let i = 0; i < 4; i++) {
    let hit = false;
    for (const t of ['Got it!', 'Skip', 'Continue', 'OK']) {
      const g = p.getByText(t, { exact: true });
      if (await g.count()) { await g.first().click().catch(() => {}); hit = true; await wait(p, 400); }
    }
    if (!hit) break;
  }
}
/** the screen point of a world point (the engine's camera), for the close-ups */
const toScreen = (p, x, y) => eng(p, `
  const c = e.camera ?? {}; const z = e.zoom ?? 1;
  return { x: (a.x - (c.x ?? 0)) * z, y: (a.y - (c.y ?? 0)) * z, z };`, { x, y });
const crops = {};
async function shot(p, name, focus) {
  // (the game is held still for the shot, so the camera and the piece stay where the close-up is worked out: it keeps drawing while
  // paused. One screenshot; the close-up is cut from it afterwards, cutinclose.py)
  await eng(p, `e.isPaused = true;`);
  await wait(p, 120);
  let s = null;
  if (focus) {
    const at = focus.code ? await eng(p, focus.code) : focus;
    s = await toScreen(p, at.x, at.y);
  }
  await p.screenshot({ path: `${out}/${name}.png` });
  await eng(p, `e.isPaused = false;`);
  if (!focus) return;
  const vw = p.viewportSize().width, vh = p.viewportSize().height;
  const w = Math.min(vw, Math.max(120, (focus.w ?? 160) * s.z)), h = Math.min(vh, Math.max(120, (focus.h ?? 160) * s.z));
  const clip = { x: Math.max(0, Math.min(vw - w, s.x - w / 2)), y: Math.max(0, Math.min(vh - h, s.y - h / 2)), width: w, height: h };
  crops[name] = clip;
}
async function play(p, id) {
  await p.evaluate((id) => window.__play(id), id);
  // (a new world can open with its story first: wait for the stage itself, skipping what stands in front of it)
  for (let i = 0; i < 30; i++) {
    await wait(p, 700);
    const on = await p.evaluate((id) => { let e = window.__engine; if (typeof e === 'function') e = e(); return !!e && e.currentStage?.config?.id === id; }, id);
    if (on) break;
    await dismiss(p);
    if (i % 4 === 3) await p.evaluate((id) => window.__play(id), id);
  }
  await wait(p, 2500);
  await dismiss(p);
}

const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?seed=7`);
  await wait(p, 4000);

  // ── the Seamstress, 5-4: knitting, the tell (needles up), the cast (the lace flies) ──
  await play(p, '5-4');
  const sm = await eng(p, `const s = e.proto.w5.seamstresses[0]; e.player.x = s.x + (s.dir < 0 ? -230 : 230); e.player.y = s.y; e.player.vx = 0; return s;`);
  await wait(p, 2500);
  for (const [pose, st] of [['knit', { phase: 'knit', t: 0, watched: 0 }], ['tell', { phase: 'tell', t: 0.3, watched: 0 }], ['cast', { phase: 'cast', t: 0.15, watched: 0 }]]) {
    await eng(p, `e.w5.seams[0] = { ...a }; e.player.x = ${sm.x + (sm.dir < 0 ? -230 : 230)};`, st);
    await shot(p, `seamstress-${pose}-${size}`, { x: sm.x, y: sm.y - 70, w: 220, h: 200 });
  }

  // ── Flicker, 5-M ──
  await play(p, '5-M');
  // (past the title card: a tap, and if the tap did not land, the card's own way out)
  await p.mouse.click(w / 2, h / 2);
  await wait(p, 1500);
  await eng(p, `if (e.mc.phase === 'card') { e.mc.tapped = true; e.mc.cardT = 1; }`);
  await wait(p, 1200);
  await eng(p, `if (e.mc.phase === 'card') { e.mc.phase = 'play'; e.mc.cardOut = 1; }`);
  await wait(p, 600);
  console.log('meeca phase', await eng(p, `return e.mc.phase;`));
  const st = await eng(p, `const s = e.mc.st; e.player.x = s.flickerX + 10; e.player.y = s.spawn.y; return { fx: s.flickerX, trunk: s.trunks[0] && { x: s.trunks[0].standX, y: s.trunks[0].standY } };`);
  await wait(p, 900);
  const FL = `return { x: e.mc.flicker.x, y: e.mc.flicker.y };`;
  // his first words (smug), then keeping her company (blink)
  await shot(p, `flicker-smug-${size}`, { code: FL, w: 140, h: 140 });
  await eng(p, `e.mc.bubble = null; e.player.x += 120;`);
  await wait(p, 4000);
  await shot(p, `flicker-blink-${size}`, { code: FL, w: 140, h: 140 });
  // at the first trunk: he glows
  if (st.trunk) {
    await eng(p, `e.player.x = a.x; e.player.y = a.y; e.player.vx = 0;`, st.trunk);
    await wait(p, 4000);
    await shot(p, `flicker-glow-${size}`, { code: FL, w: 160, h: 140 });
  }
  // a line of his (talk) and the reminder (shrug)
  await eng(p, `e.mc.bubble = { who: 'flicker', text: 'Stay in my light. The steps are shy.', at: e.mc.t, until: e.mc.t + 30 };`);
  await wait(p, 900);
  await shot(p, `flicker-talk-${size}`, { code: FL, w: 140, h: 140 });
  await eng(p, `e.mc.bubble = { who: 'flicker', text: 'Mark it. Then you can find your way back.', at: e.mc.t, until: e.mc.t + 30 };`);
  await wait(p, 1200);
  await shot(p, `flicker-shrug-${size}`, { code: FL, w: 140, h: 140 });
  // the moonflower (happy), Pell stepping out (startled), the scene (worried), small at the end (sad)
  await eng(p, `const c = e.mc.st.clearing; e.mc.bubble = null; e.mc.carveSpot = false; e.mc.ringOn = -1; e.player.x = c.moonX - 120; e.player.y = c.y; e.player.vx = 0; e.mc.phase = 'look'; e.mc.lookT = 0;`);
  await wait(p, 2500);
  await shot(p, `flicker-happy-${size}`, { code: FL, w: 140, h: 140 });
  await eng(p, `e.mc.startScene(e.mc.scene, 'endingA');`);
  await wait(p, 500);
  await shot(p, `flicker-startled-${size}`, { code: FL, w: 140, h: 140 });
  await wait(p, 2200);
  await shot(p, `flicker-worried-${size}`, { code: FL, w: 140, h: 140 });
  await eng(p, `e.mc.phase = 'endingB'; e.mc.small = true;`);
  await wait(p, 4200);
  await shot(p, `flicker-sad-${size}`, { code: FL, w: 160, h: 140 });

  // ── the water's-edge signs: World 5's garden sign (5-7, a gen2 stage), the jungle one (no World 6-10 stage is built by gen2 yet, and
  // a generated stage has no proto to lay signs in: shown on 2-1, a hand-built stage, which stands the jungle sign as 6-10 will) ──
  for (const id of ['5-7', '2-1']) {
    await play(p, id);
    const at = await eng(p, `
      const pl = e.player; const y = pl.y;
      const w = [{ x: pl.x + 150, y }, { x: pl.x + 300, y }];
      e.proto.gen2 = { ...(e.proto.gen2 ?? {}), waterWarnings: w };
      return { x: pl.x + 225, y: y - 50 };`);
    await wait(p, 4000);
    await dismiss(p);
    await shot(p, `watersign-w${id[0]}-${size}`, { ...at, w: 360, h: 180 });
  }

  // ── World 6's far strips: dawn on 6-1 to 6-3, dusk on 6-7 to 6-9 ──
  for (const id of ['6-1', '6-7']) {
    await play(p, id);
    await wait(p, 2500);
    await shot(p, `far-${id}-${size}`);
  }
  await p.close();
}
await b.close();
(await import('node:fs')).writeFileSync(`${out}/crops.json`, JSON.stringify(crops));
console.log('done', out);
