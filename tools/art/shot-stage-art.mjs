// hf-art-stage: before/after shots of the every-stage pieces, upright (390x844) and sideways (844x390) at dpr 3 like a phone.
//   node tools/art/shot-stage-art.mjs <port> <outPrefix> <stage> <what> [layout]
// what: flag | flaglit | heart | super_heart | powerup_speed | powerup_invincible | powerup_magnet | exit | exitopen | water | thorn |
//       fern | bell | nest | nesttorn
// Pokey is set down just left of the thing (on the ground under it), kept from harm, and the shot taken when the camera has caught up.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, what, layout] = process.argv.slice(2);
const b = await chromium.launch();
const place = (what) => {
  const e = typeof window.__engine === "function" ? window.__engine() : window.__engine;
  const st = e.currentStage;
  const items = e.collectibles;
  let tx, ty;
  const pick = (f) => items.find(f);
  if (what === 'flag' || what === 'flaglit') {
    const cp = st.checkpoints?.[0];
    if (!cp) return 'no checkpoint';
    if (what === 'flaglit') cp.reached = true;
    tx = cp.x - 70; ty = cp.y;
  } else if (what === 'exit' || what === 'exitopen') {
    const c = pick((c) => c.type === 'exit_totem');
    if (!c) return 'no exit';
    c.isLocked = what === 'exit';
    if (what === 'exit') c.missing = 3;
    // (open: the goal counted as met, so the engine unlocks it itself)
    if (what === 'exitopen') st.config.targetCount = 0;
    tx = c.x - 110; ty = c.y + 24;
  } else if (what === 'water') {
    const wy = st.waterY;
    if (wy === undefined) return 'no water';
    // the first gap in the low ground (platforms whose foot is within 260 of the water) where the pit water shows: Pokey on its left lip
    const near = e.platforms.filter((p) => p.y + p.height >= wy - 260 && p.y < wy).sort((a, b) => a.x - b.x);
    let best = null;
    for (let i = 0; i + 1 < near.length; i++) if (near[i + 1].x - (near[i].x + near[i].width) > 100) { best = near[i]; break; }
    if (!best) return 'no gap';
    tx = best.x + best.width - 40; ty = best.y;
    // (a hand-built stage's pit water mostly sits deep under its banks: for the shot it is raised to just under this lip, so the
    // painting shows across the gap beside him)
    if (best.y < wy - 140) st.waterY = best.y + 90;
  } else if (what === 'nest' || what === 'nesttorn') {
    const c = pick((c) => c.type === 'cage' && c.critter === 'eaglet');
    if (!c) return 'no nest';
    if (what === 'nesttorn') c.cageHp = 1;
    tx = c.x - 90; ty = c.y + 26;
  } else {
    const type = what === 'fern' || what === 'bell' ? 'find' : what === 'thorn' ? 'thorn_gate' : what;
    let c = what === 'bell' ? null : pick((c) => c.type === type && !c.collected && (what === 'fern' ? c.hidden : what === 'bell' ? !c.hidden : true));
    if (!c) {
      // (none on this stage: one is set down by Pokey's start, on the ground in front of him)
      const p = e.player;
      c = { id: 9001, type, x: p.x + (what === 'bell' ? 150 : 90), y: p.y - (type === 'find' ? 30 : 40), collected: false, bobPhase: 0, hidden: what === 'fern', findId: 'w1_note' };
      items.push(c);
      return 'placed';
    }
    tx = c.x - 80; ty = c.y + 30;
  }
  const p = e.player;
  p.x = tx; p.y = ty - p.height; p.vx = 0; p.vy = 0;
  p.invincibleTimer = 999;
  return 'ok';
};
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 30000 });
  await p.waitForTimeout(1000);
  await p.evaluate(([id, l]) => window.__play(id, l === undefined ? undefined : +l), [stage, layout]);
  await p.waitForTimeout(4500);
  console.log(tag, await p.evaluate(place, what));
  for (let i = 0; i < 6; i++) {
    await p.waitForTimeout(300);
    await p.evaluate(() => { const e = typeof window.__engine === "function" ? window.__engine() : window.__engine; e.player.invincibleTimer = 999; });
  }
  await p.screenshot({ path: `${out}-${tag}.jpg`, type: 'jpeg', quality: 82 });
  await p.close();
}
await b.close();
