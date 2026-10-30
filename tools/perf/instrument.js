/*
 * In-page Canvas 2D call recorder for the perf harness (tools/perf/run.mjs). Injected with addInitScript BEFORE the fake clock, so
 * `__perf.realNow` is the real performance.now (the game's clock is Playwright's fake one).
 *
 * __perf.install() wraps CanvasRenderingContext2D.prototype; __perf.uninstall() puts the originals back (the timing pass runs with
 * nothing wrapped). While installed, every call made between __perf.beginFrame() and __perf.endFrame() is counted per call site:
 *   site   = the first frame of the stack inside /src/ (generated file:line:col, mapped back to the .ts source in Node)
 *   layer  = the line of Engine.render that the call came from (which layer of the frame it belongs to)
 *   target = 'main' (the game's canvas) or 'off' (any other canvas: something baked during the frame)
 */
(() => {
  const realNow = performance.now.bind(performance);
  const P = CanvasRenderingContext2D.prototype;
  const S = (window.__perf = { realNow, installed: false, inFrame: false, main: null, sites: new Map(), frames: [], cur: null });

  // ---- stacks -------------------------------------------------------------------------------------------------------------
  const stackInfo = () => {
    const oldP = Error.prepareStackTrace, oldL = Error.stackTraceLimit;
    Error.stackTraceLimit = 60;
    Error.prepareStackTrace = (_e, cs) => cs;
    const cs = new Error().stack;
    Error.prepareStackTrace = oldP;
    Error.stackTraceLimit = oldL;
    let top = null, fn = '', caller = null, layer = null;
    for (let i = 0; i < cs.length; i++) {
      const f = cs[i].getFileName() || '';
      if (!f.includes('/src/')) continue;
      const here = `${f.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '')}:${cs[i].getLineNumber()}:${cs[i].getColumnNumber()}`;
      if (!top) { top = here; fn = cs[i].getFunctionName() || cs[i].getMethodName() || ''; continue; }
      if (!caller) caller = here;
      const name = cs[i].getFunctionName() || cs[i].getMethodName() || '';
      if (f.includes('/engine.ts') && /(^|\.)render$/.test(name)) { layer = here; break; }
    }
    // (a call made inside Engine.render itself: its own line is the layer)
    if (!layer && top && top.includes('/engine.ts') && /(^|\.)render$/.test(fn)) layer = top;
    return { top: top || '?', fn, caller: caller || '', layer: layer || '(outside render)' };
  };

  const rec = (ctx) => {
    const st = stackInfo();
    const target = ctx.canvas === S.main ? 'main' : 'off';
    const key = `${st.top}|${st.layer}|${target}`;
    let r = S.sites.get(key);
    if (!r) {
      r = { site: st.top, fn: st.fn, caller: st.caller, layer: st.layer, target, n: {}, area: {}, clipKinds: {}, gco: {}, special: {}, srcMax: 0, srcMaxDims: '', upMax: 0, offSize: '' };
      S.sites.set(key, r);
    }
    if (target === 'off') r.offSize = `${ctx.canvas.width}x${ctx.canvas.height}`;
    return r;
  };
  const inc = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };
  const fr = () => S.cur;

  // ---- geometry -----------------------------------------------------------------------------------------------------------
  // visible device-pixel area of a user-space rect under the current transform (its bounding box, clipped to the canvas)
  const visArea = (ctx, x, y, w, h) => {
    const m = getT.call(ctx);
    const xs = [], ys = [];
    for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      xs.push(m.a * px + m.c * py + m.e);
      ys.push(m.b * px + m.d * py + m.f);
    }
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    const x0 = Math.max(0, Math.min(...xs)), x1 = Math.min(cw, Math.max(...xs));
    const y0 = Math.max(0, Math.min(...ys)), y1 = Math.min(ch, Math.max(...ys));
    return { area: x1 > x0 && y1 > y0 ? (x1 - x0) * (y1 - y0) : 0, dw: Math.max(...xs) - Math.min(...xs), dh: Math.max(...ys) - Math.min(...ys) };
  };

  // the current path, in device space (points are transformed when added, as the canvas does)
  const pathOf = new WeakMap();
  const newPath = () => ({ rects: 0, lines: 0, curves: 0, arcs: 0, subs: [], cur: null, x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, skew: false });
  const path = (ctx) => { let p = pathOf.get(ctx); if (!p) { p = newPath(); pathOf.set(ctx, p); } return p; };
  const addPt = (ctx, p, x, y) => {
    const m = getT.call(ctx);
    if (m.b !== 0 || m.c !== 0) p.skew = true;
    const X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f;
    if (!p.cur) { p.cur = []; p.subs.push(p.cur); }
    p.cur.push([X, Y]);
    if (X < p.x0) p.x0 = X; if (X > p.x1) p.x1 = X; if (Y < p.y0) p.y0 = Y; if (Y > p.y1) p.y1 = Y;
  };
  const convex = (pts) => {
    if (pts.length < 4) return true;
    let sign = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n], [cx, cy] = pts[(i + 2) % n];
      const cr = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
      if (Math.abs(cr) < 1e-6) continue;
      const s = cr > 0 ? 1 : -1;
      if (sign && s !== sign) return false;
      sign = s;
    }
    return true;
  };
  const classify = (p) => {
    const shapes = p.rects + p.lines + p.curves + p.arcs;
    if (!shapes) return 'empty';
    if (p.rects && !p.lines && !p.curves && !p.arcs) return p.rects === 1 && !p.skew ? 'rect' : p.skew ? 'rect-rotated' : 'multi-rect';
    const allConvex = p.subs.every(convex);
    const subs = p.subs.filter((s) => s.length > 1).length;
    const base = p.curves || p.arcs ? 'curved' : 'polygon';
    return `${base}-${allConvex ? 'convex' : 'concave'}${subs > 1 ? '-multi' : ''}`;
  };

  // ---- wrapping -----------------------------------------------------------------------------------------------------------
  const getT = P.getTransform;
  const origs = {};
  const descs = {};
  const wrap = (name, fn) => { origs[name] = P[name]; P[name] = fn(origs[name]); };
  const wrapSet = (prop, onSet) => {
    const d = Object.getOwnPropertyDescriptor(P, prop);
    descs[prop] = d;
    Object.defineProperty(P, prop, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { if (S.inFrame) onSet(this, v); d.set.call(this, v); } });
  };
  const stateOf = (ctx) => ({
    gco: descs.globalCompositeOperation.get.call(ctx),
    shadow: descs.shadowBlur.get.call(ctx),
    filter: descs.filter ? descs.filter.get.call(ctx) : 'none',
    alpha: ctx.globalAlpha,
  });
  const noteSpecial = (ctx, r, what) => {
    const s = stateOf(ctx);
    if (s.gco !== 'source-over') inc(r.special, `${what}@${s.gco}`);
    if (s.shadow > 0) inc(r.special, `${what}@shadowBlur`);
    if (s.filter && s.filter !== 'none') inc(r.special, `${what}@filter`);
    return s;
  };
  const srcDims = (img) => {
    const w = img.naturalWidth || img.videoWidth || img.displayWidth || img.width || 0;
    const h = img.naturalHeight || img.videoHeight || img.displayHeight || img.height || 0;
    return [w, h];
  };
  const kindOf = (img) => (img instanceof HTMLImageElement ? 'img' : img instanceof HTMLCanvasElement ? 'canvas' : typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap ? 'bitmap' : typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas ? 'offscreen' : 'other');

  function install() {
    if (S.installed) return;
    S.installed = true;
    wrap('drawImage', (o) => function (img, ...a) {
      if (S.inFrame) {
        const r = rec(this);
        const [sw0, sh0] = srcDims(img);
        let dx, dy, dw, dh, sw = sw0, sh = sh0;
        if (a.length === 2) { [dx, dy] = a; dw = sw0; dh = sh0; }
        else if (a.length === 4) { [dx, dy, dw, dh] = a; }
        else { [, , sw, sh, dx, dy, dw, dh] = a; }
        const v = visArea(this, dx, dy, dw, dh);
        const ready = !(img instanceof HTMLImageElement) || (img.complete && img.naturalWidth > 0);
        inc(r.n, ready ? 'drawImage' : 'drawImage(notReady)');
        if (ready) {
          inc(r.area, 'drawImage', v.area);
          inc(r.n, `src:${kindOf(img)}`);
          if (sw0 * sh0 > r.srcMax) { r.srcMax = sw0 * sh0; r.srcMaxDims = `${sw0}x${sh0}`; }
          const up = Math.max(v.dw / Math.max(1, Math.abs(sw)), v.dh / Math.max(1, Math.abs(sh)));
          if (v.area > 0 && up > r.upMax) r.upMax = up;
          // a sheet shrunk on the way in (source pixels per device pixel, the larger side): PERFORMANCE-RULES §8.1
          const down = v.area > 0 ? Math.min(Math.abs(sw) / Math.max(1e-6, v.dw), Math.abs(sh) / Math.max(1e-6, v.dh)) : 0;
          if (down > 2.5) { inc(r.n, 'shrunk>2.5x'); if (down > (r.downMax || 0)) r.downMax = down; if (r.target === 'main') fr().shrunk++; }
          const s = noteSpecial(this, r, 'drawImage');
          if (r.target === 'main') {
            const f = fr();
            f.drawImage++;
            f.drawImageArea += v.area;
            if (s.gco !== 'source-over') f.blendArea += v.area;
          }
        }
      }
      return o.call(this, img, ...a);
    });
    const areaOp = (name) => wrap(name, (o) => function (x, y, w, h) {
      if (S.inFrame) {
        const r = rec(this);
        inc(r.n, name);
        const v = visArea(this, x, y, w, h);
        inc(r.area, name, v.area);
        const s = noteSpecial(this, r, name);
        if (r.target === 'main' && name !== 'clearRect') { const f = fr(); f.fills++; f.fillArea += v.area; if (s.gco !== 'source-over') f.blendArea += v.area; }
      }
      return o.call(this, x, y, w, h);
    });
    areaOp('fillRect'); areaOp('strokeRect'); areaOp('clearRect');
    wrap('fill', (o) => function (...a) {
      if (S.inFrame) {
        const r = rec(this);
        inc(r.n, 'fill');
        let area = 0;
        if (!(a[0] instanceof Path2D)) {
          const p = path(this);
          const cw = this.canvas.width, ch = this.canvas.height;
          const x0 = Math.max(0, p.x0), x1 = Math.min(cw, p.x1), y0 = Math.max(0, p.y0), y1 = Math.min(ch, p.y1);
          area = x1 > x0 && y1 > y0 ? (x1 - x0) * (y1 - y0) : 0;
          inc(r.area, 'fill(bbox)', area);
        } else inc(r.n, 'fill(Path2D)');
        const fs = this.fillStyle;
        if (typeof fs === 'object' && fs) inc(r.n, fs instanceof CanvasGradient ? 'fill@gradient' : 'fill@pattern');
        const s = noteSpecial(this, r, 'fill');
        if (r.target === 'main') { const f = fr(); f.fills++; f.fillArea += area; if (s.gco !== 'source-over') f.blendArea += area; }
      }
      return o.apply(this, a);
    });
    wrap('stroke', (o) => function (...a) {
      if (S.inFrame) { const r = rec(this); inc(r.n, 'stroke'); noteSpecial(this, r, 'stroke'); if (r.target === 'main') fr().strokes++; }
      return o.apply(this, a);
    });
    for (const t of ['fillText', 'strokeText']) wrap(t, (o) => function (...a) {
      if (S.inFrame) { const r = rec(this); inc(r.n, t); noteSpecial(this, r, t); }
      return o.apply(this, a);
    });
    wrap('clip', (o) => function (...a) {
      if (S.inFrame) {
        const r = rec(this);
        inc(r.n, 'clip');
        let kind = 'Path2D';
        if (!(a[0] instanceof Path2D)) {
          const p = path(this);
          kind = classify(p);
          const cw = this.canvas.width, ch = this.canvas.height;
          const x0 = Math.max(0, p.x0), x1 = Math.min(cw, p.x1), y0 = Math.max(0, p.y0), y1 = Math.min(ch, p.y1);
          inc(r.area, 'clip(bbox)', x1 > x0 && y1 > y0 ? (x1 - x0) * (y1 - y0) : 0);
          inc(r.n, 'clip:pathPoints', p.subs.reduce((s, q) => s + q.length, 0));
        }
        inc(r.clipKinds, kind);
        if (r.target === 'main') { const f = fr(); f.clips++; if (kind !== 'rect' && kind !== 'multi-rect') f.complexClips++; }
      }
      return o.apply(this, a);
    });
    // path tracking (always on while installed: a path can be begun just before a frame)
    wrap('beginPath', (o) => function () { pathOf.set(this, newPath()); return o.call(this); });
    wrap('moveTo', (o) => function (x, y) { const p = path(this); p.cur = null; addPt(this, p, x, y); return o.call(this, x, y); });
    wrap('lineTo', (o) => function (x, y) { const p = path(this); p.lines++; addPt(this, p, x, y); return o.call(this, x, y); });
    wrap('closePath', (o) => function () { return o.call(this); });
    wrap('rect', (o) => function (x, y, w, h) { const p = path(this); p.rects++; p.cur = null; addPt(this, p, x, y); addPt(this, p, x + w, y); addPt(this, p, x + w, y + h); addPt(this, p, x, y + h); p.cur = null; return o.call(this, x, y, w, h); });
    if (P.roundRect) wrap('roundRect', (o) => function (x, y, w, h, ...rr) { const p = path(this); p.arcs++; p.cur = null; addPt(this, p, x, y); addPt(this, p, x + w, y); addPt(this, p, x + w, y + h); addPt(this, p, x, y + h); p.cur = null; return o.call(this, x, y, w, h, ...rr); });
    wrap('quadraticCurveTo', (o) => function (cx, cy, x, y) { const p = path(this); p.curves++; addPt(this, p, cx, cy); addPt(this, p, x, y); return o.call(this, cx, cy, x, y); });
    wrap('bezierCurveTo', (o) => function (a1, b1, a2, b2, x, y) { const p = path(this); p.curves++; addPt(this, p, a1, b1); addPt(this, p, a2, b2); addPt(this, p, x, y); return o.call(this, a1, b1, a2, b2, x, y); });
    wrap('arc', (o) => function (x, y, rad, a0, a1, ccw) {
      const p = path(this); p.arcs++;
      const steps = 8;
      let sweep = a1 - a0;
      if (ccw && sweep > 0) sweep -= Math.PI * 2; if (!ccw && sweep < 0) sweep += Math.PI * 2;
      sweep = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, sweep));
      for (let i = 0; i <= steps; i++) { const t = a0 + (sweep * i) / steps; addPt(this, p, x + rad * Math.cos(t), y + rad * Math.sin(t)); }
      return o.call(this, x, y, rad, a0, a1, ccw);
    });
    wrap('ellipse', (o) => function (x, y, rx, ry, rot, a0, a1, ccw) {
      const p = path(this); p.arcs++;
      for (let i = 0; i <= 8; i++) { const t = a0 + ((a1 - a0) * i) / 8; const ex = rx * Math.cos(t), ey = ry * Math.sin(t); addPt(this, p, x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)); }
      return o.call(this, x, y, rx, ry, rot, a0, a1, ccw);
    });
    wrap('arcTo', (o) => function (x1, y1, x2, y2, rad) { const p = path(this); p.arcs++; addPt(this, p, x1, y1); addPt(this, p, x2, y2); return o.call(this, x1, y1, x2, y2, rad); });
    const counted = (name, frameKey) => wrap(name, (o) => function (...a) {
      if (S.inFrame) { const r = rec(this); inc(r.n, name); if (frameKey && r.target === 'main') fr()[frameKey]++; if (frameKey === 'readbacks') inc(r.area, name, (a[2] || 0) * (a[3] || 0)); }
      return o.apply(this, a);
    });
    counted('createLinearGradient', 'gradients'); counted('createRadialGradient', 'gradients');
    if (P.createConicGradient) counted('createConicGradient', 'gradients');
    counted('createPattern', 'patterns');
    counted('save', 'saves'); counted('restore');
    counted('getImageData', 'readbacks'); counted('putImageData', 'readbacks');
    counted('setTransform'); counted('drawFocusIfNeeded');
    wrapSet('shadowBlur', (ctx, v) => { if (v > 0) { const r = rec(ctx); inc(r.n, 'set shadowBlur>0'); if (r.target === 'main') fr().shadowSets++; } });
    if (Object.getOwnPropertyDescriptor(P, 'filter')) wrapSet('filter', (ctx, v) => { if (v && v !== 'none') { const r = rec(ctx); inc(r.n, 'set filter'); inc(r.gco, `filter:${String(v).slice(0, 40)}`); if (r.target === 'main') fr().filterSets++; } });
    wrapSet('globalCompositeOperation', (ctx, v) => { if (v !== 'source-over') { const r = rec(ctx); inc(r.n, 'set gco'); inc(r.gco, v); if (r.target === 'main') fr().gcoSets++; } });
    wrapSet('imageSmoothingQuality', (ctx, v) => { const r = rec(ctx); inc(r.gco, `smoothing:${v}`); });
    // new canvases made during a frame (a bake per frame)
    const ce = Document.prototype.createElement;
    origs.__createElement = ce;
    Document.prototype.createElement = function (tag, ...a) {
      if (S.inFrame && String(tag).toLowerCase() === 'canvas') { const st = stackInfo(); inc(S.cur, 'newCanvas'); const k = `newCanvas ${st.top}`; S.cur.newCanvasSites[k] = (S.cur.newCanvasSites[k] || 0) + 1; }
      return ce.call(this, tag, ...a);
    };
  }

  function uninstall() {
    if (!S.installed) return;
    for (const [k, v] of Object.entries(origs)) if (k !== '__createElement') P[k] = v;
    Document.prototype.createElement = origs.__createElement;
    for (const [k, d] of Object.entries(descs)) Object.defineProperty(P, k, d);
    for (const k of Object.keys(origs)) delete origs[k];
    for (const k of Object.keys(descs)) delete descs[k];
    S.installed = false;
  }

  // (window.__engine is a function in App.tsx, but the engine also sets it to itself as it is made (dev only), so it can be either)
  S.engine = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine || null);
  S.install = install;
  S.uninstall = uninstall;
  S.reset = () => { S.sites = new Map(); S.frames = []; };
  S.beginFrame = (meta) => {
    S.cur = { ...meta, drawImage: 0, drawImageArea: 0, fills: 0, fillArea: 0, blendArea: 0, shrunk: 0, strokes: 0, clips: 0, complexClips: 0, gradients: 0, patterns: 0, saves: 0, readbacks: 0, shadowSets: 0, filterSets: 0, gcoSets: 0, newCanvas: 0, newCanvasSites: {} };
    S.inFrame = true;
  };
  S.endFrame = () => { S.inFrame = false; S.frames.push(S.cur); S.cur = null; };
  S.dump = () => ({ sites: [...S.sites.values()], frames: S.frames });
})();
