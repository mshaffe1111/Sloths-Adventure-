// UI-372 SHOW FIRST: the proposed edge marker drawn OVER the real 2-3 frame (nothing built in): one spooked little one off screen,
// a small arrow at the screen edge on its side, at its height, carrying its own face (w2-props Happy painting) in an amber ring.
//   node reference/qa-reports/UI-372/mock372.mjs <out dir> [easy]     (a vite dev server on 5181)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, easy] = process.argv.slice(2);
const set = easy ? 'easy' : 'normal';
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  if (easy) await p.addInitScript(() => localStorage.setItem('sloth_difficulty', 'easy'));
  await p.goto('http://127.0.0.1:5181/?lessons=off');
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', 1]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.evaluate((E) => { const e = eval(E); const cs = e.collectibles.filter((c) => c.type === 'cage').sort((a, c) => a.x - c.x).slice(0, 3); for (const c of cs) { e.freeCritter(c); c.collected = true; } }, E);
  for (const side of ['left', 'right']) {
    const note = await p.evaluate(([E, side]) => {
      const e = eval(E);
      e.isPaused = true;
      const bed = e.proto.bushes[0];
      const x = bed.x + bed.w - 30;
      const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 120; i++) e.update(1 / 30);
      const f = e.follow.line[1];
      const vw = e.camera.viewportWidth;
      // (spooked and hiding where it ran to, off the screen on this side, at the ground's height)
      f.state = 'spooked'; f.back = true; f.backX = side === 'left' ? e.camera.x - 330 : e.camera.x + vw + 330; f.x = f.backX;
      e.render();
      return { kind: f.kind, fx: Math.round(f.x), fy: Math.round(f.y), cam: [Math.round(e.camera.x), Math.round(e.camera.y)], vw, vh: e.camera.viewportHeight, zoom: e.zoom, faces: e.lineFaces() };
    }, [E, side]);
    await p.waitForTimeout(600);
    // the mock marker, drawn on the game canvas in screen px
    await p.evaluate(async ([E, side, note]) => {
      const e = eval(E);
      const cv = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height)[0];
      const ctx = cv.getContext('2d');
      const im = new Image();
      im.src = new URL('/src/assets/props/w2-props.webp', location.href).href;
      await im.decode();
      const FR = { duck: { x: 1503, y: 1262, w: 185, h: 260 }, otter: { x: 1692, y: 1262, w: 190, h: 260 }, capy: { x: 1317, y: 1262, w: 182, h: 260 } }[note.kind];
      const k = cv.width / cv.clientWidth;
      ctx.save();
      ctx.setTransform(k, 0, 0, k, 0, 0);
      const W = cv.clientWidth, H = cv.clientHeight;
      const R = 22; // a 44 px face: the smallest tap-size circle the HUD uses, read at arm's length
      const sy = (note.fy - 30 - e.camera.y) * e.zoom;
      const top = 150, bot = H - 200; // clear of the HUD's top band and the pad's bottom band
      const cy = Math.max(top + R, Math.min(bot - R, sy));
      const dir = side === 'left' ? -1 : 1;
      const cx = side === 'left' ? 10 + 12 + R : W - 10 - 12 - R;
      const pulse = 1;
      // the arrow: a rounded amber wedge from the face out to the edge
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = 'rgba(40, 20, 4, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dir * (R + 13), cy);
      ctx.lineTo(cx + dir * (R - 3), cy - 13);
      ctx.lineTo(cx + dir * (R - 3), cy + 13);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // the plate under the face
      ctx.fillStyle = '#3f3a33';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.clip();
      const s = (2 * R * 1.25) / FR.w;
      ctx.drawImage(im, FR.x, FR.y, FR.w, FR.h, cx - (FR.w * s) / 2, cy - R + 2 * R * 0.08, FR.w * s, FR.h * s);
      ctx.restore();
      ctx.lineWidth = 3.5 * pulse;
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(40, 20, 4, 0.8)';
      ctx.beginPath(); ctx.arc(cx, cy, R + 2.5, 0, Math.PI * 2); ctx.stroke();
      // the '!' badge, the HUD face's own
      const bx = cx - dir * (R * 0.7), by = cy - R * 0.75;
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(40, 20, 4, 0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#1c1206'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by + 1);
      ctx.restore();
    }, [E, side, note]);
    const file = `${out}/ui372-mock-${set}-${side}-${tag}.jpg`;
    await p.screenshot({ path: file, type: 'jpeg', quality: 85 });
    console.log(tag, side, JSON.stringify(note));
  }
  await p.context().close();
}
await b.close();
