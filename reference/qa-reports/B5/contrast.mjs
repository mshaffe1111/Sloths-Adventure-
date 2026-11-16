// B5 (packet e): does the chase's baked trailing-edge warning (B4's C4: chasePiece.ts edgeCanvas, an ember disc at the break or the edge,
// at his feet) read on every backdrop, and does it read as EMBER or as SMOKE? Measured on the game canvas (no HUD), with the game's own
// camera (B5's chase lead: him 10-13% across upright, 30% sideways), the front 150 px behind him (full warning, k 1) and 400 px (k 0.5).
// Two draws of the same frame: the edge off, the game's own drawEdge on. CIE76 dE vs the frame with it off (sRGB D65), mean per band:
//   A = the edge (0-9% of the width), B = 20-31% (B2's bands), G = inside the glow's disc (its radius, about its centre)
// and in G the mean shift in L* (darker < 0), a* (redder > 0), b* (yellower > 0) and chroma C* (more colour > 0). Smoke greys and
// darkens (dL < 0, dC <= 0); an ember warms (da > 0, db > 0, dC > 0). B2's bar, set before measuring, not loosened: dE >= 20 in A or B
// on every backdrop (B >= 15 on the darkest).
//   PORT=5199 node reference/qa-reports/B5/contrast.mjs 1-2 2-1 3-1 3-9
import { createRequire } from 'node:module';
import { E, bareBranch, openStage } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const ids = process.argv.slice(2);
const b = await chromium.launch();
const rows = [];
for (const id of ids) {
  for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
    const { ctx, p } = await openStage(b, { id, setting: 'normal', w, h });
    const built = await bareBranch(p);
    await p.evaluate((E) => eval(E).render(), E);
    await p.evaluate(async () => (await import('/src/game/protoArt.ts')).warmProto3());
    await p.waitForFunction(async () => !(await import('/src/game/atlasLoader.ts')).pendingSheets().includes((await import('/src/game/protoArt.ts')).PROTO3_URL), null, { timeout: 20000, polling: 250 }).catch(() => console.log('props3 NOT READY'));
    await p.waitForTimeout(1500);
    for (const gapWant of [150, 400]) {
      const r = await p.evaluate(async ([E, built, gapWant]) => {
        const e = eval(E);
        const st0 = built.lay.stretches[0];
        e.pieces = [];
        Object.assign(e.player, { x: st0.start + 900, y: built.y, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 });
        // (the game's own camera settles on him: the chase lead over the span)
        for (let i = 0; i < 60; i++) e.update(1 / 30);
        e.startPieces();
        const pc = e.pieces.find((q) => q.kind === 'chase');
        Object.assign(pc.run.fronts[0], { front: e.player.x - gapWant, active: true, hold: 0 });
        e.update(1 / 30);
        pc.debris = [];
        const own = pc.drawEdge.bind(pc);
        const cv = e.canvas ?? document.querySelector('canvas');
        const grab = (draw) => { pc.drawEdge = draw; e.render(); return cv.getContext('2d').getImageData(0, 0, cv.width, cv.height); };
        const none = grab(() => {});
        const on = grab(own);
        pc.drawEdge = own;
        const v = e.camera, z = e.zoom || 1;
        const sx = cv.width / (v.viewportWidth * z);
        const behind = pc.run.fronts[0].front;
        const mod = await import('/src/game/pieces/chasePiece.ts');
        const short = Math.min(cv.width, cv.height) / sx;
        const R = mod.GLOW.radius * short * sx;
        const cx = Math.max(0, (behind - v.x) * z) * sx, cy = (e.player.y + e.player.height - v.y) * z * sx;
        const lin = (q) => { q /= 255; return q <= 0.04045 ? q / 12.92 : ((q + 0.055) / 1.055) ** 2.4; };
        const lab = (r, g, b) => {
          const Rr = lin(r), G = lin(g), B = lin(b);
          const X = (Rr * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = Rr * 0.2126 + G * 0.7152 + B * 0.0722, Z = (Rr * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
          const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
          return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)), Y];
        };
        const meas = (inside) => {
          const o = { dE: 0, dL: 0, da: 0, db: 0, dC: 0, Y0: 0, n: 0 };
          for (let y = 0; y < cv.height; y += 3) for (let x = 0; x < cv.width; x += 3) {
            if (!inside(x, y)) continue;
            const i = (y * cv.width + x) * 4;
            const p0 = lab(none.data[i], none.data[i + 1], none.data[i + 2]), p1 = lab(on.data[i], on.data[i + 1], on.data[i + 2]);
            o.dE += Math.hypot(p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]);
            o.dL += p1[0] - p0[0]; o.da += p1[1] - p0[1]; o.db += p1[2] - p0[2];
            o.dC += Math.hypot(p1[1], p1[2]) - Math.hypot(p0[1], p0[2]);
            o.Y0 += p0[3]; o.n++;
          }
          const k = (q) => +(q / Math.max(1, o.n)).toFixed(1);
          return { dE: k(o.dE), dL: k(o.dL), da: k(o.da), db: k(o.db), dC: k(o.dC), Y0: +(o.Y0 / Math.max(1, o.n)).toFixed(3) };
        };
        return {
          gap: Math.round(e.player.x - behind), heroAt: +((e.player.x - v.x) / v.viewportWidth).toFixed(2), edgeAt: Math.round(cx), R: Math.round(R),
          A: meas((x) => x < cv.width * 0.09), B: meas((x) => x >= cv.width * 0.2 && x < cv.width * 0.31), G: meas((x, y) => (x - cx) ** 2 + (y - cy) ** 2 < R * R),
        };
      }, [E, built, gapWant]);
      rows.push({ id, tag, ...r });
      console.log(id, tag, JSON.stringify(r));
    }
    await ctx.close();
  }
}
await b.close();
console.log('\nstage orient    gap  him  | A dE  | B dE  | G dE   dL    da    db    dC   | backdrop Y | bar (A or B >= 20; darkest B >= 15)');
for (const r of rows) {
  const pass = r.gap > 200 ? '(k 0.5: not judged)' : r.A.dE >= 20 || r.B.dE >= 20 ? 'PASS' : 'FAIL';
  console.log(`${r.id.padEnd(5)} ${r.tag.padEnd(9)} ${String(r.gap).padStart(4)} ${String(r.heroAt).padStart(4)} | ${String(r.A.dE).padStart(5)} | ${String(r.B.dE).padStart(5)} | ${[r.G.dE, r.G.dL, r.G.da, r.G.db, r.G.dC].map((q) => String(q).padStart(5)).join(' ')} | ${String(r.A.Y0).padStart(6)}     | ${pass}`);
}
