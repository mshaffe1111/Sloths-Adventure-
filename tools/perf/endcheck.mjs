/**
 * The bank end check (ENG-24h, R-165.323 2c: "the rock is see-through: the soil's stones and the river bed's band run on across the
 * bank's face", the lead's spots 2-2 pondFar and 2-4 catch). For every world's bank end piece, on the real page (the game's own
 * groundPaint.ts drawEnd and endFace), a right end is drawn twice over its own soil outline: once over magenta soil, once over green.
 * A pixel that differs between the two shows what is behind it.
 *
 *   node tools/perf/endcheck.mjs            (seconds: starts the dev server itself; exit 1 on a failure)
 *   END_URL=http://127.0.0.1:5174 node tools/perf/endcheck.mjs   (use a server already running)
 *
 * The rock: per row of the piece, the band END_BAND units in from its painted face (the right edge of its body, a hanging root left
 * out), from END_TOP units under the walking line down to END_FOOT units above the piece's foot. Pass: under END_MAX of the band's
 * pixels see-through, every world. It also plants a failure: the sheet's own piece drawn as the game drew it before (11-20 base,
 * 4c34eb81) must FAIL, or the check is broken. Also printed, not judged: the soil showing between the rock's face and the soil's outline
 * (the hanging roots' gap, the outline being cut at the roots' tips: tools/art/hfground/pack.py face).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const END_BAND = 40, END_TOP = 20, END_FOOT = 20, END_MAX = 0.005;

async function server() {
  if (process.env.END_URL) return { url: process.env.END_URL.replace(/\/$/, ''), stop: () => {} };
  const port = 5300 + Math.floor(Math.random() * 400);
  const p = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let log = '';
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`dev server did not start:\n${log}`)), 120000);
    const hear = (d) => { log += d; if (/Local:/.test(log.replace(/\x1b\[[0-9;]*m/g, ''))) { clearTimeout(t); res(); } };
    p.stdout.on('data', hear);
    p.stderr.on('data', hear);
  });
  return { url: `http://127.0.0.1:${port}`, stop: () => { try { process.kill(-p.pid); } catch {} } };
}

const srv = await server();
const b = await chromium.launch();
let bad = 0;
try {
  const p = await b.newPage();
  await p.goto(`${srv.url}/`);
  const rows = await p.evaluate(async ([BAND, TOP, FOOT]) => {
    const gp = await import('/src/game/groundPaint.ts');
    const { GROUND_FRAMES } = await import('/src/game/groundAtlasData.ts');
    const out = [];
    for (const w of Object.keys(GROUND_FRAMES).map(Number)) {
      for (let k = 0; k < 200 && !gp.warmGround(w); k++) await new Promise((r) => setTimeout(r, 50));
      if (!gp.warmGround(w)) { out.push({ w, err: 'sheet did not load' }); continue; }
      const e = GROUND_FRAMES[w].end;
      const img = new Image();
      img.src = gp.groundUrl(w);
      await img.decode();
      // (the piece's own alpha, read straight from the sheet: where its rock's face runs)
      const pc = document.createElement('canvas');
      pc.width = e.w; pc.height = e.h;
      const pg = pc.getContext('2d', { willReadFrequently: true });
      pg.drawImage(img, e.x, e.y, e.w, e.h, 0, 0, e.w, e.h);
      const pa = pg.getImageData(0, 0, e.w, e.h).data;
      const face = [];
      for (let y = 0; y < e.h; y++) {
        let mx = 0;
        for (let x = 0; x < e.w; x++) mx = Math.max(mx, pa[(y * e.w + x) * 4 + 3]);
        let edge = -1, run = 0;
        for (let x = 0; x < e.w; x++) { run = pa[(y * e.w + x) * 4 + 3] >= mx / 2 && mx >= 8 ? run + 1 : 0; if (run >= 11) edge = x; }
        face.push(edge);
      }
      // (the scene: a right end at X with the walking line at Y, drawn at S px a unit)
      const S = 2, X = 320, Y = 60, bottom = Y + 420, W = 480, H = 520;
      const k = gp.END_H / e.h, ew = e.w * k, top = Y - e.surf * gp.END_H;
      const sx = (u) => X + (u - e.cx * e.w) * k;
      const render = (fill, how) => {
        const c = document.createElement('canvas');
        c.width = W * S; c.height = H * S;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.scale(S, S);
        g.fillStyle = '#808080';
        g.fillRect(0, 0, W, H);
        const pts = gp.endFace(w, X, Y, bottom, true);
        g.beginPath();
        g.moveTo(0, Y + 6);
        for (const [px, py] of pts) g.lineTo(px, Math.max(Y + 6, py));
        g.lineTo(pts[pts.length - 1][0], bottom);
        g.lineTo(0, bottom);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        if (how === 'game') gp.drawEnd(g, w, X, Y, true);
        else g.drawImage(img, e.x, e.y, e.w, e.h, X - e.cx * ew, top, ew, gp.END_H);
        return { d: g.getImageData(0, 0, W * S, H * S).data, pts };
      };
      for (const how of ['game', 'sheet']) {
        const m = render('#ff00ff', how), gr = render('#00ff00', how);
        const thru = (x, y) => {
          const i = (Math.round(y * S) * W * S + Math.round(x * S)) * 4;
          return Math.abs(m.d[i] - gr.d[i]) + Math.abs(m.d[i + 1] - gr.d[i + 1]) + Math.abs(m.d[i + 2] - gr.d[i + 2]) > 12;
        };
        let n = 0, see = 0, footSee = 0, footN = 0, gapN = 0, gapSee = 0;
        const worst = new Map();
        for (let yy = Y + TOP; yy < top + gp.END_H - FOOT; yy += 0.5) {
          const r = Math.min(e.h - 1, Math.floor(((yy - top) / gp.END_H) * e.h));
          if (face[r] < 0) continue;
          const fx = sx(face[r]);
          for (let xx = fx - BAND; xx <= fx - 1; xx += 0.5) {
            n++;
            const s = thru(xx, yy);
            if (s) { see++; const band = Math.round((yy - Y) / 20) * 20; worst.set(band, (worst.get(band) ?? 0) + 1); }
            if (yy > top + gp.END_H * 0.8) { footN++; if (s) footSee++; }
          }
          // (the gap: from the rock's face out to the soil's outline at this height)
          let ox = fx;
          for (let i = 1; i < m.pts.length; i++) {
            const [ax, ay] = m.pts[i - 1], [bx, by] = m.pts[i];
            if (yy >= ay && yy <= by && by > ay) { ox = ax + ((yy - ay) / (by - ay)) * (bx - ax); break; }
          }
          for (let xx = fx + 1; xx < ox; xx += 0.5) { gapN++; if (thru(xx, yy)) gapSee++; }
        }
        out.push({ w, how, n, see, footN, footSee, gapN, gapSee, worst: [...worst].sort((p, q) => q[1] - p[1]).slice(0, 3) });
      }
    }
    return out;
  }, [END_BAND, END_TOP, END_FOOT]);
  const pct = (a, n) => (n ? ((100 * a) / n).toFixed(2) : '0.00') + '%';
  let plantRed = true;
  for (const r of rows) {
    if (r.err) { console.log(`w${r.w}: FAIL ${r.err}`); bad++; continue; }
    const share = r.n ? r.see / r.n : 1;
    const ok = share < END_MAX;
    const line = `w${r.w} ${r.how.padEnd(5)}: rock see-through ${pct(r.see, r.n)} (${r.see}/${r.n}; lower fifth ${pct(r.footSee, r.footN)})` +
      `${r.worst.length ? ` worst rows (units under the walk) ${r.worst.map(([y, c]) => `${y}:${c}`).join(' ')}` : ''}; roots' gap soil ${pct(r.gapSee, r.gapN)} (info)`;
    if (r.how === 'game') {
      console.log(`${ok ? 'PASS' : 'FAIL'} ${line}`);
      if (!ok) bad++;
    } else {
      console.log(`  plant ${ok ? 'GREEN (the plant did not fail: the check is broken)' : 'RED (as it must)'} ${line}`);
      if (ok) plantRed = false;
    }
  }
  if (!plantRed) { console.log('FAIL: a planted failure did not fail'); bad++; }
  console.log(bad ? `endcheck: FAIL (${bad})` : 'endcheck: PASS (every world\'s bank end is solid rock; the plant is RED)');
} finally {
  await b.close();
  srv.stop();
}
process.exit(bad ? 1 : 0);
