// ENG-LOOK2: a clip of a chase stage's run from the real game (the look: the bough, its ends, the collapse behind him), through the real
// touch pad (clipPress.mjs pressFrame: every press checked for lift). He starts on the flag before a stretch and holds right; he jumps
// where the ground ahead ends (a gap, a step up) and when a rolling nut is close and low. 30 fps, every 2nd frame kept, 2x.
//   PW=... node tools/engine/runs/chase-clip.mjs <port> <out dir> <stage> <layout> <stretch k> <seconds> [up|side] [easy]
import fs from 'node:fs';
import path from 'node:path';
import { pressFrame } from '../../inspect/clipPress.mjs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, id, layout, K = '0', SECS = '10', ori = 'side', diff = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [w, h] = ori === 'up' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.evaluate((d) => localStorage.setItem('sloth_difficulty', d), diff);
await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.currentStage.chase); }, E, { timeout: 60000 });
const built = await p.evaluate(([E, K]) => {
  const e = eval(E); e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const s = e.currentStage.chase.stretches[+K];
  const flag = [...e.currentStage.checkpoints].filter((c) => c.x < s.start).sort((a, z) => z.x - a.x)[0];
  const x = flag ? flag.x + 30 : s.start - 300;
  const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width).sort((a, z) => a.y - z.y)[0];
  Object.assign(e.player, { x, y: under.y - e.player.height, vx: 0, vy: 0, grounded: true, facing: 1 });
  return { stage: e.currentStage.config.id, seed: e.currentStage.gen2?.seed, difficulty: localStorage.getItem('sloth_difficulty'), built: e.currentStage.gen2?.budget?.difficulty, from: x, stretch: [s.start, s.end], view: [innerWidth, innerHeight] };
}, [E, K]);
console.log('BUILT', JSON.stringify(built));
let frame = 0;
for (let i = 0; i < +SECS * 30; i++) {
  const want = await p.evaluate((E) => {
    const e = eval(E), P = e.player;
    if (!P.grounded) return false;
    const foot = P.y + P.height, ahead = P.x + P.width + 46;
    const ground = e.platforms.some((q) => !q.broken && q.type !== 'decorative' && ahead >= q.x && ahead <= q.x + q.width && q.y >= foot - 4 && q.y <= foot + 60);
    const wall = e.platforms.some((q) => !q.broken && ahead >= q.x && ahead <= q.x + q.width && q.y < foot - 8 && q.y > foot - 200);
    const nut = (e.pieces ?? []).some((pc) => pc.kind === 'rolling' && (pc.items ?? pc.hazards ?? []).some?.((r) => r.x > P.x && r.x - P.x < 150 && r.y > P.y));
    return !ground || wall || nut;
  }, E);
  await p.evaluate(([src, E, inp]) => (new Function(`return (${src})`)())(eval(E), inp, {}, false), [pressFrame.toString(), E, { right: true, ...(want ? { jump: true, holdMs: 320 } : {}) }]);
  if (i % 2 === 0) {
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    await p.screenshot({ path: path.join(out, `f${String(frame++).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
}
const end = await p.evaluate((E) => { const e = eval(E); return { x: Math.round(e.player.x), hearts: e.player.health ?? e.health, lives: e.lives }; }, E);
console.log('END', JSON.stringify(end), 'frames', frame);
await b.close();
