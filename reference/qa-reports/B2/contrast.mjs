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
      const none = grab(() => {});
      const b1 = grab(old);
      const b2 = grab(own);
      pc.drawEdge = own;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lab = (r, g, b) => {
        const R = lin(r), G = lin(g), B = lin(b);
        const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
        const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)), Y];
      };
      const band = (img, a, z) => {
        const out = { dE: 0, Y: 0, Y0: 0, n: 0 };
        const x0 = Math.round(cv.width * a), x1 = Math.round(cv.width * z);
        for (let y = 0; y < cv.height; y += 3) for (let x = x0; x < x1; x += 3) {
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
      return { gap: Math.round(e.player.x - pc.run.fronts[0].front), canvas: [cv.width, cv.height], b1: { A: band(b1, 0, 0.09), B: band(b1, 0.2, 0.31) }, b2: { A: band(b2, 0, 0.09), B: band(b2, 0.2, 0.31) } };
    }, [E, built]);
    const row = { id, tag, world: built.world, easy: built.easy, ...r };
    rows.push(row);
    console.log(JSON.stringify(row));
    await ctx.close();
  }
}
await b.close();
console.log('\nstage  orient    backdrop Y | B1 dE A/B  | B2 dE A/B  | B2 ratio A');
for (const r of rows) console.log(`${r.id.padEnd(6)} ${r.tag.padEnd(9)} ${String(r.b2.A.Y0).padEnd(10)} | ${String(r.b1.A.dE).padStart(4)} / ${String(r.b1.B.dE).padEnd(4)} | ${String(r.b2.A.dE).padStart(4)} / ${String(r.b2.B.dE).padEnd(4)} | ${r.b2.A.ratio}`);
