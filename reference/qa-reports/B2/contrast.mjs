// B2: does the chase's trailing-edge warning read on every backdrop? Measured on the game canvas (the HUD is not on it), the front 150 px
// behind him (full warning), three draws of the same frame: no warning, B1's (rgba(70,18,8) to 0.55) and B2's (edgeTint: dark core +
// warm rim to 0.75). Per band of the view's width, the mean colour difference from the unwarned frame (CIE76 dE, sRGB D65) and the mean
// luminance ratio: band A = the edge (0-9%), band B = the inner side (20-31%, where B2's rim sits). Bar: dE >= 20 in A or B on every
// backdrop (clearly seen at a glance; 2.3 is the least a person can see), and B >= 15 on the darkest (a dark tint alone vanishes there).
//   PORT=5199 node reference/qa-reports/B2/contrast.mjs 1-2 2-1 3-1 3-2 3-4 3-9
import { createRequire } from 'node:module';
import { E, bareBranch, openStage } from './world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const ids = process.argv.slice(2);
const b = await chromium.launch();
const rows = [];
for (const id of ids) {
  for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
    const { ctx, p } = await openStage(b, { id, setting: 'normal', w, h });
    const built = await bareBranch(p);
    // (the long-branch sheet loaded before any frame is measured: without this the branch drew as flat bars in some frames and not in
    // others, B2's first tables)
    await p.evaluate((E) => eval(E).render(), E);
    await p.evaluate(async () => (await import('/src/game/protoArt.ts')).warmProto3());
    await p.waitForFunction(async () => !(await import('/src/game/atlasLoader.ts')).pendingSheets().includes((await import('/src/game/protoArt.ts')).PROTO3_URL), null, { timeout: 20000, polling: 250 }).catch(() => console.log('props3 NOT READY'));
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async ([E, built]) => {
      const e = eval(E);
      const st0 = built.lay.stretches[0];
      e.pieces = [];
      Object.assign(e.player, { x: st0.start + 600, y: built.y, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 });
      for (let i = 0; i < 45; i++) e.update(1 / 30);
      e.startPieces();
      const pc = e.pieces.find((q) => q.kind === 'chase');
      Object.assign(pc.run.fronts[0], { front: e.player.x - 150, active: true, hold: 0 });
      e.update(1 / 30);
      pc.debris = [];
      const own = pc.drawEdge.bind(pc);
      const old = (c, host) => {
        const g = c.createLinearGradient(0, 0, host.view.w * 0.32, 0);
        g.addColorStop(0, 'rgba(70, 18, 8, 0.55)');
        g.addColorStop(1, 'rgba(70, 18, 8, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, host.view.w * 0.32, host.view.h);
      };
      const cv = e.canvas ?? document.querySelector('canvas');
      const grab = (draw) => {
        pc.drawEdge = draw;
        e.render();
        return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height);
      };
      // (candidates for the fix, drawn here only: C1 = B2's core with a brighter ember rim; C2 = B2's core with an additive ember glow)
      const cand = (rim, add) => (c, host) => {
        const gap = host.player.x - pc.run.fronts[0].front;
        const k = Math.max(0, Math.min(1, (650 - gap) / 500));
        const w = host.view.w * (0.3 + 0.12 * k);
        const g = c.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(14, 4, 2, ${0.75 * k})`);
        g.addColorStop(0.25, `rgba(30, 7, 3, ${0.6 * k})`);
        g.addColorStop(add ? 0.6 : 0.5, add ? 'rgba(30, 7, 3, 0)' : `rgba(150, 44, 12, ${0.45 * k})`);
        if (!add) g.addColorStop(0.72, `rgba(232, 104, 32, ${rim * k})`);
        g.addColorStop(1, 'rgba(232, 104, 32, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, w, host.view.h);
        if (add) {
          const r = c.createLinearGradient(0, 0, w, 0);
          r.addColorStop(0.2, 'rgba(255, 96, 24, 0)');
          r.addColorStop(0.55, `rgba(255, 96, 24, ${rim * k})`);
          r.addColorStop(1, 'rgba(255, 96, 24, 0)');
          c.save();
          c.globalCompositeOperation = 'lighter';
          c.fillStyle = r;
          c.fillRect(0, 0, w, host.view.h);
          c.restore();
        }
      };
      // C3 (the lead 1:38 AM: "the air behind him is falling apart", not a dirty filter): a lighter core, a strong ember rim, and bark
      // specks drifting down through it (the painted grit every stage preloads, w4Grit.ts drawGritBit, tinted bark and ember-lit)
      const grit = await import('/src/game/w4Grit.ts');
      const c3 = (c, host) => {
        const gap = host.player.x - pc.run.fronts[0].front;
        const k = Math.max(0, Math.min(1, (650 - gap) / 500));
        const w = host.view.w * (0.3 + 0.12 * k);
        const g = c.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(20, 6, 2, ${0.6 * k})`);
        g.addColorStop(0.3, `rgba(60, 16, 5, ${0.36 * k})`);
        g.addColorStop(0.55, `rgba(176, 54, 14, ${0.34 * k})`);
        g.addColorStop(0.74, `rgba(236, 108, 34, ${0.32 * k})`);
        g.addColorStop(1, 'rgba(236, 108, 34, 0)');
        c.fillStyle = g;
        c.fillRect(0, 0, w, host.view.h);
        const t = window.__b2t ?? 0;
        const H = host.view.h;
        const n = Math.round(18 * k);
        for (let i = 0; i < n; i++) {
          const a = (i * 0.618034) % 1, b = (i * 0.371 + 0.13) % 1;
          const x = w * (0.06 + 0.86 * b) + Math.sin(t * 1.7 + i) * 6;
          const y = ((a * (H + 40) + t * (40 + 50 * a)) % (H + 40)) - 20;
          grit.drawGritBit(c, a + i * 0.001, x, y, 7 + 9 * a, t * (1 + 2 * b) * (i % 2 ? 1 : -1), k * (0.5 + 0.45 * (1 - x / w)), i % 3 === 0 ? '#e0803e' : '#6e4428');
        }
      };
      // C4: the glow anchored where the branch breaks (an ember ellipse at the branch's height at the trailing edge), a narrow dark edge,
      // bark chips falling from the branch line and a few ember-lit bits rising
      const c4 = (c, host) => {
        const gap = host.player.x - pc.run.fronts[0].front;
        const k = Math.max(0, Math.min(1, (650 - gap) / 500));
        const W = host.view.w, H = host.view.h;
        const by = (host.player.y - host.view.y) * host.view.zoom;
        const d = c.createLinearGradient(0, 0, W * 0.2, 0);
        d.addColorStop(0, `rgba(20, 6, 2, ${0.55 * k})`);
        d.addColorStop(1, 'rgba(20, 6, 2, 0)');
        c.fillStyle = d;
        c.fillRect(0, 0, W * 0.2, H);
        const rx = W * (0.36 + 0.16 * k);
        c.save();
        c.translate(0, by);
        c.scale(1, 1.25);
        const gl = c.createRadialGradient(0, 0, 0, 0, 0, rx);
        gl.addColorStop(0, `rgba(255, 122, 40, ${0.5 * k})`);
        gl.addColorStop(0.45, `rgba(206, 72, 20, ${0.3 * k})`);
        gl.addColorStop(1, 'rgba(160, 40, 10, 0)');
        c.fillStyle = gl;
        c.fillRect(0, -rx, rx, rx * 2);
        c.restore();
        const t = window.__b2t ?? 0;
        const n = Math.round(22 * k);
        for (let i = 0; i < n; i++) {
          const a = (i * 0.618034) % 1, b = (i * 0.371 + 0.13) % 1;
          const ember = i % 3 === 0;
          const x = rx * (0.05 + 0.85 * b) + Math.sin(t * 1.7 + i) * 8;
          const span = H * 0.5;
          const u = (a + t * (ember ? 0.12 : 0.3 + 0.2 * a)) % 1;
          const y = ember ? by - u * span * 0.8 : by - 10 + u * span;
          grit.drawGritBit(c, a + i * 0.001, x, y, ember ? 6 + 5 * a : 11 + 9 * a, t * (1 + 2 * b) * (i % 2 ? 1 : -1), k * (1 - u) * (ember ? 0.95 : 0.9) * (1 - 0.5 * x / rx), ember ? '#ffb060' : '#5a3620');
        }
      };
      window.__b2t = 1.3;
      const none = grab(() => {});
      const b1 = grab(old);
      const b2 = grab(own);
      const c1 = grab(cand(0.34, false));
      const c2 = grab(cand(0.22, true));
      const c3d = grab(c3);
      const c4d = grab(c4);
      // (and the bands only around the branch, where he looks: +-30% of the height about his feet)
      const by = Math.round(((e.player.y - e.camera.y) * (e.zoom || 1)) / (e.camera.viewportHeight) * cv.height);
      pc.drawEdge = own;
      pc.__own = own;
      pc.__c3 = c3;
      pc.__c4 = c4;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lab = (r, g, b) => {
        const R = lin(r), G = lin(g), B = lin(b);
        const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
        const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)), Y];
      };
      const band = (img, a, z, mid) => {
        const out = { dE: 0, Y: 0, Y0: 0, n: 0 };
        const x0 = Math.round(cv.width * a), x1 = Math.round(cv.width * z);
        const y0 = mid === undefined ? 0 : Math.max(0, mid - Math.round(cv.height * 0.3)), y1 = mid === undefined ? cv.height : Math.min(cv.height, mid + Math.round(cv.height * 0.3));
        for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) {
          const i = (y * cv.width + x) * 4;
          const p0 = lab(none.data[i], none.data[i + 1], none.data[i + 2]);
          const p1 = lab(img.data[i], img.data[i + 1], img.data[i + 2]);
          out.dE += Math.hypot(p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]);
          out.Y += p1[3];
          out.Y0 += p0[3];
          out.n++;
        }
        return { dE: +(out.dE / out.n).toFixed(1), ratio: +(((out.Y0 / out.n) + 0.05) / ((out.Y / out.n) + 0.05)).toFixed(2), Y0: +(out.Y0 / out.n).toFixed(3) };
      };
      return { gap: Math.round(e.player.x - pc.run.fronts[0].front), canvas: [cv.width, cv.height], b1: { A: band(b1, 0, 0.09), B: band(b1, 0.2, 0.31) }, b2: { A: band(b2, 0, 0.09), B: band(b2, 0.2, 0.31) }, c1: { A: band(c1, 0, 0.09), B: band(c1, 0.2, 0.31) }, c2: { A: band(c2, 0, 0.09), B: band(c2, 0.2, 0.31) }, c3: { A: band(c3d, 0, 0.09), B: band(c3d, 0.2, 0.31) }, c4: { A: band(c4d, 0, 0.09), B: band(c4d, 0.2, 0.31) }, win: { b2: { A: band(b2, 0, 0.09, by), B: band(b2, 0.2, 0.31, by) }, c4: { A: band(c4d, 0, 0.09, by), B: band(c4d, 0.2, 0.31, by) } } };
    }, [E, built]);
    if (process.env.SHOTS) {
      for (const [nm, which] of [['b2', 'own'], ['c3', 'c3'], ['c4', 'c4']]) {
        await p.evaluate(([E, which]) => { const e = eval(E); const pc = e.pieces.find((q) => q.kind === 'chase'); pc.drawEdge = which === 'own' ? pc.__own : which === 'c3' ? pc.__c3 : pc.__c4; e.render(); }, [E, which]);
        await p.screenshot({ path: `${process.env.SHOTS}/tint-${nm}-${id}-${tag}.jpg`, type: 'jpeg', quality: 82 });
      }
    }
    const row = { id, tag, world: built.world, easy: built.easy, ...r };
    rows.push(row);
    console.log(JSON.stringify(row));
    await ctx.close();
  }
}
await b.close();
console.log('\nstage  orient    backdrop Y | B1 dE A/B  | B2 dE A/B  | B2 ratio A');
for (const r of rows) console.log(`${r.id.padEnd(6)} ${r.tag.padEnd(9)} ${String(r.b2.A.Y0).padEnd(10)} | ${String(r.b1.A.dE).padStart(4)} / ${String(r.b1.B.dE).padEnd(4)} | ${String(r.b2.A.dE).padStart(4)} / ${String(r.b2.B.dE).padEnd(4)} | ${r.b2.A.ratio}`);
