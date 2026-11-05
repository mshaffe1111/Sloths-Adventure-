// The stone check's page side (tools/engine/stonecheck.mjs runs it in Chromium on the real game, dev build): for the stage now running,
// draw the world's own layers (engine.ts supportProbe: no backdrop, water, pickups, creatures or Pokey) onto a clear canvas, and for
// every piece read off the real draw
//   what it is drawn as: the painted frame (kit sheet, World 1's atlases, the crumble frames) or the baked sprite (platformPlan's look),
//     from the drawImage calls that cover its face, so its material is the art's and not the data's style (a W9 "branch" is a basalt slab;
//     a W8 "moss_stone" is a purple log);
//   what holds it up: the pixels under it, a column of paint running from the piece down to a landing's top or the bottom of the
//     drawn world, with no open gap (a drawn column, a trunk, a wall, a bank all count; a hanging tuft that stops in the air does not).
// Exposed as window.__stoneProbe(opts) -> { world, pieces: [...] }.
(() => {
  // the material of each painted frame, by sheet (Matt's kits: the thin piece is the kit's `branch`, so a world's thin pieces all share it)
  const KIT_MAT = {
    branch: { 2: 'wood', 3: 'stone', 4: 'stone', 6: 'wood', 7: 'stone', 8: 'wood', 9: 'stone', 10: 'metal' },
    boulder: { 2: 'stone', 3: 'stone', 4: 'stone', 5: 'wood', 6: 'earth', 7: 'stone', 8: 'wood', 9: 'stone', 10: 'stone' },
  };
  for (const n of ['branchCreak', 'snapL', 'snapR']) KIT_MAT[n] = KIT_MAT.branch;
  KIT_MAT.stump = KIT_MAT.boulder;
  // World 1's painted atlases, and the baked looks of platformPlan (terrain.ts drawThin)
  const W1_MAT = { trunk: 'wood', branch: 'wood', branchCreak: 'wood', snapL: 'wood', snapR: 'wood', log: 'wood', boulder: 'stone', perch: 'wood', hollow: 'wood' };
  const LOOK_MAT = {
    stone: 'stone', ruin: 'stone', slate: 'stone', basalt: 'stone', steps: 'stone', island: 'earth',
    branch: 'wood', log: 'wood', plank: 'wood', slices: 'wood', lashed: 'wood', bridge: 'wood', jetty: 'wood', root: 'wood', raft: 'wood',
    barge: 'wood', drift: 'wood', canoe: 'wood', shelf: 'plant', toadstool: 'plant', parasol: 'plant', bloom: 'plant', pad: 'plant',
    reeds: 'plant', silk: 'plant',
  };
  const PIECE_FRAMES = new Set(['branch', 'branchCreak', 'snapL', 'snapR', 'boulder', 'stump', 'perch', 'trunk', 'log', 'hollow']);
  // the other painted sheets a piece can be drawn from (labelled by eye from the probe's crops, 2026-11-05)
  const SHEET_MAT = {
    'puzzle-kit.webp': 'wood', 'props2-atlas.webp': 'wood', 'props3-atlas.webp': 'wood', 'w2-props.webp': 'wood', 'ledges.webp': 'wood',
    'w6d.webp': 'wood', 'w6var.webp': 'wood', 'w8b.webp': 'wood', 'w5-props.webp': 'plant', 'dot-props.webp': 'plant', 'bounce.webp': 'plant',
    'w3-props.webp': 'plant', 'w4-props.webp': 'stone', 'w1.webp': 'earth', 'w3.webp': 'earth',
  };
  const PERCH_MAT = { 7: 'stone', 10: 'metal' };
  const mods = {};
  async function load() {
    if (mods.KF) return;
    mods.KF = (await import('/src/game/kitAtlasData.ts')).KIT_FRAMES;
    mods.PF = (await import('/src/game/protoAtlasData.ts')).PROTO_FRAMES;
    mods.plan = await import('/src/game/platformPlan.ts');
    mods.seed = await import('/src/game/sceneSeed.ts');
  }
  const frameName = (src, sx, sy) => {
    const m = /\/kits\/w(\d+)\.webp/.exec(src);
    if (m) {
      const fr = mods.KF[m[1]] || {};
      for (const [n, f] of Object.entries(fr)) if (Math.abs(f.x - sx) < 1.5 && Math.abs(f.y - sy) < 1.5) return { sheet: 'w' + m[1], n };
      // (a branch's slices start inside the frame)
      for (const [n, f] of Object.entries(fr)) if (sx >= f.x - 1 && sx < f.x + f.w && Math.abs(f.y - sy) < 1.5) return { sheet: 'w' + m[1], n };
      return { sheet: 'w' + m[1], n: '?' };
    }
    if (/props-atlas/.test(src)) {
      for (const [n, f] of Object.entries(mods.PF)) if (sx >= f.x - 1 && sx < f.x + f.w && Math.abs(f.y - sy) < 1.5) return { sheet: 'w1', n };
      return { sheet: 'w1', n: '?' };
    }
    const b = (src.split('/').pop() || '').split('?')[0];
    return { sheet: b, n: b };
  };

  window.__stoneProbe = async (opts = {}) => {
    await load();
    const S = opts.scale || 0.5;
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
    const st = e.currentStage;
    const world = st.config.worldIndex;
    const plats = e.platforms;
    const land = (p) => !p.soil && !p.decorative && !p.isDecor && !p.ghost && !p.lily && !p.lilyPad && p.type !== 'drift' && !p.broken;
    const rockish = (p) => (p.height === 50 && p.style === 'moss_stone') || p.art === 'rock';
    const cands = plats.filter((p) => land(p) && (p.height < 50 || rockish(p)) && p.type !== 'moving');
    // the plan terrain.ts draws its thin pieces from (the same list engine.ts hands renderWorldObjects)
    let drawn = plats;
    try { drawn = e.withoutPaintedLogs(world, e.paintKit ? e.paintedPlats : e.drawPlats); } catch { /* */ }
    const drawnSet = new Set(drawn);
    const plan = mods.plan.planStage(drawn, world, mods.seed.getSceneSeed());
    // the drawn world's extent
    let y0 = Infinity, y1 = -Infinity;
    for (const p of plats) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y + Math.min(p.height, 4000)); }
    y0 = Math.floor(y0 - 300); y1 = Math.ceil(Math.max(y1, st.config.levelHeight || 0) + 200);
    const W = st.config.levelWidth;
    const WIN = opts.win || 4000, PAD = 400;
    const keep = { ctx: e.ctx, cam: { ...e.camera }, probe: e.supportProbe, zoom: e.zoom };
    const out = new Map();
    for (const p of cands) out.set(p, { id: p.id, x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: Math.round(p.height), style: p.style || null, type: p.type, crumble: p.crumbleAfter !== undefined, frame: null, mat: null, held: null, run: 0, gapGround: null, gapAny: null });
    for (let wx = 0; wx < W; wx += WIN) {
      const vx0 = wx - PAD, vw = WIN + PAD * 2, vh = y1 - y0;
      const here = cands.filter((p) => p.x + p.width / 2 >= wx && p.x + p.width / 2 < wx + WIN);
      if (!here.length) continue;
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(vw * S); cv.height = Math.ceil(vh * S);
      const c = cv.getContext('2d');
      const draws = [];
      const di = c.drawImage.bind(c);
      c.drawImage = function (img, ...a) {
        let sx = 0, sy = 0, sw = 0, sh = 0, dx, dy, dw, dh;
        if (a.length >= 8) [sx, sy, sw, sh, dx, dy, dw, dh] = a;
        else if (a.length >= 4) [dx, dy, dw, dh] = a;
        else { [dx, dy] = a; dw = img.width; dh = img.height; }
        const m = c.getTransform();
        const px = [[dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh]].map(([u, v]) => [(m.a * u + m.c * v + m.e) / S + vx0, (m.b * u + m.d * v + m.f) / S + y0]);
        const xs = px.map((q) => q[0]), ys = px.map((q) => q[1]);
        const src = img instanceof HTMLImageElement ? img.currentSrc || img.src : img instanceof HTMLCanvasElement || (typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas) ? 'canvas' : 'other';
        draws.push({ src, sx, sy, sw, sh, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
        return di(img, ...a);
      };
      e.ctx = c;
      e.renderDpr = () => S;
      e.zoom = 1;
      e.camera.x = vx0; e.camera.y = y0; e.camera.viewportWidth = vw; e.camera.viewportHeight = vh;
      e.supportProbe = true;
      try { e.render(); } finally {
        e.ctx = keep.ctx; delete e.renderDpr; e.zoom = keep.zoom; Object.assign(e.camera, keep.cam); e.supportProbe = keep.probe;
      }
      const img = c.getImageData(0, 0, cv.width, cv.height).data;
      const A = (x, y) => {
        const ix = Math.round((x - vx0) * S), iy = Math.round((y - y0) * S);
        if (ix < 0 || iy < 0 || ix >= cv.width || iy >= cv.height) return 0;
        return img[(iy * cv.width + ix) * 4 + 3];
      };
      for (const p of here) {
        const r = out.get(p);
        // what is drawn on its face: the last image over its middle, a little under its top
        const fx = p.x + p.width / 2, fy = p.y + Math.min(p.height, 16) / 2;
        // (the piece's own frame first: a bounce cap, a fern or an orchid set on it is dressing, not what it is made of)
        let face = null, own = null, sprite = null;
        for (const d of draws) {
          if (!(fx >= d.x0 && fx <= d.x1 && fy >= d.y0 && fy <= d.y1 && d.y1 - d.y0 < 400 && d.x1 - d.x0 < p.width * 3 + 300)) continue;
          if (d.src === 'canvas') { sprite = d; continue; }
          if (d.src === 'other') continue;
          const f = frameName(d.src, d.sx, d.sy);
          if (PIECE_FRAMES.has(f.n) || /crumble/.test(f.sheet)) own = d;
          else face = d;
        }
        face = own || sprite || face;
        if (face && face.src !== 'canvas' && face.src !== 'other') {
          const f = frameName(face.src, face.sx, face.sy);
          r.frame = f.sheet + ':' + f.n;
          r.src = { u: face.src.replace(/^https?:\/\/[^/]+/, '').split('?')[0], sx: Math.round(face.sx), sy: Math.round(face.sy), sw: Math.round(face.sw), sh: Math.round(face.sh) };
          const wn = +(f.sheet.slice(1)) || 0;
          r.mat = f.sheet === 'w1' ? W1_MAT[f.n] || 'w1:' + f.n : /^w\d+$/.test(f.sheet) ? (KIT_MAT[f.n]?.[wn] || (f.n === 'perch' || f.n === 'trunk' ? PERCH_MAT[wn] || 'wood' : 'kit:' + f.n)) : /crumble/.test(f.sheet) ? 'stone' : SHEET_MAT[f.sheet] || 'img:' + f.sheet;
        } else if (face) {
          const tp = plan.thin.get(p), gp = plan.ground.get(p);
          const look = tp ? tp.look : gp ? gp.role : drawnSet.has(p) ? 'island' : '?';
          r.frame = 'sprite:' + look;
          r.mat = LOOK_MAT[look] || look;
        } else { r.frame = 'live'; r.mat = drawnSet.has(p) ? 'live:' + (plan.thin.get(p)?.look || '?') : '?'; }
        // (a crop of what is drawn there, once per kind of art, for labelling: opts.crops)
        if (opts.crops) {
          const key = r.frame + '|' + (r.src ? r.src.u + ':' + r.src.sx + ',' + r.src.sy : st.config.id);
          window.__stoneCrops = window.__stoneCrops || {};
          if (!window.__stoneCrops[key]) {
            const cc = document.createElement('canvas');
            const bw = p.width + 80, bh = Math.max(p.height, 30) + 120;
            cc.width = Math.ceil(bw * S); cc.height = Math.ceil(bh * S);
            cc.getContext('2d').drawImage(cv, (p.x - 40 - vx0) * S, (p.y - 60 - y0) * S, bw * S, bh * S, 0, 0, bw * S, bh * S);
            window.__stoneCrops[key] = { stage: st.config.id, id: p.id, style: p.style, mat: r.mat, url: cc.toDataURL() };
          }
        }
        // what holds it up: walk down a band under its middle half
        const bx0 = p.x + p.width * 0.25, bx1 = p.x + p.width * 0.75, n = Math.max(4, Math.round((bx1 - bx0) / 4));
        const step = 2;
        const covered = (y) => { let k = 0; for (let i = 0; i <= n; i++) if (A(bx0 + ((bx1 - bx0) * i) / n, y) >= 128) k++; return k / (n + 1) >= 0.5; };
        const tops = plats.filter((q) => q !== p && !q.broken && q.x < bx1 && q.x + q.width > bx0 && q.y > p.y + 2).map((q) => q.y).sort((a, b) => a - b);
        const ground = plats.filter((q) => q !== p && !q.broken && (q.height >= 50 || q.soil) && q.x < bx1 && q.x + q.width > bx0 && q.y > p.y + 2).map((q) => q.y).sort((a, b) => a - b);
        r.gapAny = tops.length ? Math.round(tops[0] - (p.y + p.height)) : null;
        r.gapGround = ground.length ? Math.round(ground[0] - (p.y + p.height)) : null;
        let y = p.y + 1, open = 0, held = false;
        for (; y < y1 - 4; y += step) {
          if (tops.length && y >= tops[0] - 4) { held = true; break; }
          if (covered(y)) open = 0;
          else if ((open += step) > (opts.gap || 12)) break;
        }
        if (y >= y1 - 4) held = true;
        r.held = held;
        // (paint above it too: a wall or a blanket layer behind it, looked at by eye, never taken on trust)
        r.backed = covered(p.y - 50) && covered(p.y - 90);
        r.run = Math.round(y - p.y);
      }
    }
    // a span: a row of pieces end to end (a stone bridge, a lintel) is held when the row meets a bank or a held piece at each end, and a
    // ledge set into a bank's face (its end against a bank that stands above its underside) is held by that bank
    const solid = (q) => !q.broken && (q.height >= 50 || q.soil) && !rockish(q);
    const meets = (p, q, side) => (side < 0 ? Math.abs(q.x + q.width - p.x) <= 6 : Math.abs(p.x + p.width - q.x) <= 6) && q !== p;
    const isHeld = (q) => solid(q) || out.get(q)?.held === true;
    const face = (p, side) => plats.some((q) => solid(q) && meets(p, q, side) && q.y <= p.y + p.height && q.y + q.height >= p.y + p.height);
    const rowOf = (p) => {
      const row = [p];
      for (const side of [-1, 1]) {
        let cur = p;
        for (;;) {
          const nx = cands.find((q) => !row.includes(q) && meets(cur, q, side) && Math.abs(q.y - cur.y) <= 6);
          if (!nx) break;
          side < 0 ? row.unshift(nx) : row.push(nx);
          cur = nx;
        }
      }
      return row;
    };
    for (const p of cands) {
      const r = out.get(p);
      if (r.held || r.mat === null) continue;
      const row = rowOf(p);
      const end = (q, side) => face(q, side) || plats.some((z) => meets(q, z, side) && Math.abs(z.y - q.y) <= 6 && isHeld(z) && !row.includes(z));
      const L = end(row[0], -1), R = end(row[row.length - 1], 1);
      if (L && R) { r.held = true; r.by = 'span'; }
      else if (row.length === 1 && (face(p, -1) || face(p, 1))) { r.held = true; r.by = 'face'; }
    }
    for (const r of out.values()) if (r.held && !r.by) r.by = r.backed ? 'below-backed' : 'below';
    return { world, id: st.config.id, W, H: y1 - y0, pieces: [...out.values()] };
  };

  // a still of a window of the probe render (world coordinates), for the by-eye check that the probe sees what the game draws
  window.__stoneStill = (x, y, w, h, S = 1, full = false) => {
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(w * S); cv.height = Math.ceil(h * S);
    const c = cv.getContext('2d');
    const keep = { ctx: e.ctx, cam: { ...e.camera }, probe: e.supportProbe, zoom: e.zoom };
    e.ctx = c; e.renderDpr = () => S; e.zoom = 1;
    e.camera.x = x; e.camera.y = y; e.camera.viewportWidth = w; e.camera.viewportHeight = h; e.supportProbe = !full;
    try { e.render(); } finally { e.ctx = keep.ctx; delete e.renderDpr; e.zoom = keep.zoom; Object.assign(e.camera, keep.cam); e.supportProbe = keep.probe; }
    return cv.toDataURL('image/png');
  };
})();
