// The stage walk's draw-call log (tools/inspect/walk.mjs puts it in the page before the game loads).
//
// While window.__wlog is an array, every draw on the game's own canvas (window.__wmain) is written into it in canvas pixels:
//   img    a picture drawn (its file, the part of it used, where it lands, how much it is blown up)
//   fill   a shape filled by code (rect, circle/ellipse, path), with its colour or gradient
//   stroke a line drawn by code (its width, dashed or not)
//   text   words drawn on the canvas
// The seam detector (seams.py) checks the finished frame against these: a hard line exactly where two pictures meet, a code shape
// that is still showing, a picture drawn far bigger than its pixels, a prop with nothing under it.
// which function made a canvas (the build is unminified for the walk, so the names are the source's): the first two callers
// outside this file, at its first getContext
const __wWho = () => {
  const lines = String(new Error().stack || '').split('\n').slice(1);
  const names = [];
  for (const l of lines) {
    const m = /at (?:new )?([A-Za-z0-9_$.]+) /.exec(l);
    if (!m || /__w|walkHook|getContext|Object\.|HTMLCanvasElement/.test(m[1])) continue;
    names.push(m[1].replace(/^.*\./, ''));
    if (names.length >= 2) break;
  }
  return names.join('<');
};
for (const C of [typeof HTMLCanvasElement !== 'undefined' && HTMLCanvasElement, typeof OffscreenCanvas !== 'undefined' && OffscreenCanvas]) {
  if (!C) continue;
  const o = C.prototype.getContext;
  C.prototype.getContext = function (...a) {
    if (!this.__who) {
      try { this.__who = __wWho(); } catch {}
    }
    return o.apply(this, a);
  };
}
const __wInstall = (P) => {
  const on = (ctx) => window.__wlog && ctx.canvas === window.__wmain;
  // a cache canvas filled by code says so (a ground column built from fills and a pattern)
  const mark = (ctx) => {
    try {
      if (ctx.canvas && ctx.canvas !== window.__wmain) ctx.canvas.__codeFills = true;
    } catch {}
  };
  const nameOf = (img) => {
    if (!img) return '?';
    if (img.__wname) return img.__wname;
    if (typeof HTMLImageElement !== 'undefined' && img instanceof HTMLImageElement) {
      const s = img.currentSrc || img.src || '';
      return s.startsWith('data:') ? 'data:' + s.length : s.replace(/^.*\/assets\//, '').replace(/^https?:\/\/[^/]+\//, '');
    }
    const who = img.__who ? `(${img.__who})` : '';
    if (img.__srcs && img.__srcs.size) return 'cache[' + [...img.__srcs].slice(0, 4).join('+') + ']' + who;
    if (img.__codeFills) return `codecanvas${who}:${img.width}x${img.height}`;
    if (typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement) return 'canvas' + who;
    if (typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas) return 'offscreen' + who;
    if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) return 'bitmap';
    return 'other';
  };
  const box = (m, x, y, w, h) => {
    const xs = [], ys = [];
    for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      xs.push(m.a * px + m.c * py + m.e);
      ys.push(m.b * px + m.d * py + m.f);
    }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const styleOf = (s) => {
    if (typeof s === 'string') return s;
    if (s && s.__g) return s.__g;
    if (typeof CanvasGradient !== 'undefined' && s instanceof CanvasGradient) return 'gradient';
    if (typeof CanvasPattern !== 'undefined' && s instanceof CanvasPattern) return 'pattern:' + (s.__src || '?');
    return 'other';
  };
  // in the world (drawn under the camera's translate) or not (backdrop strips, overlays): walk.mjs sets window.__wcam before a frame
  const oSave = P.save, oRestore = P.restore, oTranslate = P.translate, oSetT = P.setTransform;
  P.save = function () {
    if (on(this)) (this.__ws ||= []).push([!!this.__w, this.__clip || null]);
    return oSave.call(this);
  };
  P.restore = function () {
    if (on(this) && this.__ws && this.__ws.length) [this.__w, this.__clip] = this.__ws.pop();
    return oRestore.call(this);
  };
  P.translate = function (x, y) {
    const c = window.__wcam;
    if (on(this) && c && Math.abs(x + c[0]) < 3 && Math.abs(y + c[1]) < 3) this.__w = true;
    return oTranslate.call(this, x, y);
  };
  P.setTransform = function (...a) {
    if (on(this)) this.__w = false;
    return oSetT.apply(this, a);
  };
  const st = (ctx) => ({ w: !!ctx.__w, c: ctx.__clip ? ctx.__clip.map((v) => Math.round(v)) : undefined, a: +ctx.globalAlpha.toFixed(3), op: ctx.globalCompositeOperation, f: ctx.filter && ctx.filter !== 'none' ? ctx.filter : undefined });

  // gradients and patterns say what they are
  for (const [fn, tag] of [['createLinearGradient', 'grad:lin'], ['createRadialGradient', 'grad:rad'], ['createConicGradient', 'grad:conic']]) {
    const o = P[fn];
    if (!o) continue;
    P[fn] = function (...a) {
      const g = o.apply(this, a);
      try { g.__g = tag; } catch {}
      return g;
    };
  }
  const oPat = P.createPattern;
  P.createPattern = function (img, rep) {
    const p = oPat.call(this, img, rep);
    try { if (p) p.__src = nameOf(img); } catch {}
    return p;
  };

  const oDraw = P.drawImage;
  P.drawImage = function (img, ...a) {
    // an offscreen cache remembers which pictures went into it, so a later draw of the cache can be traced
    if (this.canvas && this.canvas !== window.__wmain && img) {
      try {
        const c = this.canvas;
        if (!c.__srcs) c.__srcs = new Set();
        const n = nameOf(img);
        if (c.__srcs.size < 8) c.__srcs.add(n.length > 60 ? n.slice(-60) : n);
      } catch {}
    }
    if (on(this)) {
      try {
        const iw = img.naturalWidth || img.videoWidth || img.width || 0;
        const ih = img.naturalHeight || img.videoHeight || img.height || 0;
        let sx = 0, sy = 0, sw = iw, sh = ih, dx, dy, dw, dh;
        if (a.length === 2) [dx, dy] = a, dw = iw, dh = ih;
        else if (a.length === 4) [dx, dy, dw, dh] = a;
        else [sx, sy, sw, sh, dx, dy, dw, dh] = a;
        const m = this.getTransform();
        const b = box(m, dx, dy, dw, dh);
        const rot = Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6;
        window.__wlog.push({
          k: 'img', n: nameOf(img), b, rot, flip: m.a * dw < 0 || m.d * dh < 0,
          s: [sx, sy, sw, sh], iw, ih,
          // canvas pixels per picture pixel (above 1: blown up, soft)
          up: +(Math.hypot(m.a, m.b) * Math.abs(dw) / Math.max(1e-6, Math.abs(sw))).toFixed(3),
          ...st(this), _img: img,
        });
      } catch {}
    }
    return oDraw.call(this, img, ...a);
  };

  const oFillRect = P.fillRect;
  P.fillRect = function (x, y, w, h) {
    mark(this);
    if (on(this)) window.__wlog.push({ k: 'fill', shape: 'rect', b: box(this.getTransform(), x, y, w, h), rot: Math.abs(this.getTransform().b) > 1e-6, style: styleOf(this.fillStyle), ...st(this) });
    return oFillRect.call(this, x, y, w, h);
  };
  const oStrokeRect = P.strokeRect;
  P.strokeRect = function (x, y, w, h) {
    if (on(this)) window.__wlog.push({ k: 'stroke', shape: 'rect', b: box(this.getTransform(), x, y, w, h), lw: this.lineWidth * Math.hypot(this.getTransform().a, this.getTransform().b), dash: this.getLineDash().length > 0, style: styleOf(this.strokeStyle), ...st(this) });
    return oStrokeRect.call(this, x, y, w, h);
  };

  // the current path, as a box in canvas pixels and the kinds of pieces in it
  const path = (ctx) => (ctx.__wp ||= { b: [Infinity, Infinity, -Infinity, -Infinity], ops: [] });
  const grow = (ctx, bb, op) => {
    const p = path(ctx);
    p.b = [Math.min(p.b[0], bb[0]), Math.min(p.b[1], bb[1]), Math.max(p.b[2], bb[2]), Math.max(p.b[3], bb[3])];
    if (p.ops.length < 40) p.ops.push(op);
  };
  const pt = (ctx, x, y, op) => grow(ctx, box(ctx.getTransform(), x, y, 0, 0), op);
  const oBegin = P.beginPath;
  P.beginPath = function () {
    if (on(this)) this.__wp = null;
    return oBegin.call(this);
  };
  for (const fn of ['moveTo', 'lineTo']) {
    const o = P[fn];
    P[fn] = function (x, y) {
      if (on(this)) pt(this, x, y, fn === 'moveTo' ? 'M' : 'L');
      return o.call(this, x, y);
    };
  }
  for (const fn of ['quadraticCurveTo', 'bezierCurveTo']) {
    const o = P[fn];
    P[fn] = function (...a) {
      if (on(this)) for (let i = 0; i < a.length; i += 2) pt(this, a[i], a[i + 1], 'C');
      return o.apply(this, a);
    };
  }
  const oArc = P.arc;
  P.arc = function (x, y, r, ...a) {
    if (on(this)) grow(this, box(this.getTransform(), x - r, y - r, 2 * r, 2 * r), 'A');
    return oArc.call(this, x, y, r, ...a);
  };
  const oEll = P.ellipse;
  P.ellipse = function (x, y, rx, ry, ...a) {
    if (on(this)) grow(this, box(this.getTransform(), x - Math.max(rx, ry), y - Math.max(rx, ry), 2 * Math.max(rx, ry), 2 * Math.max(rx, ry)), 'E');
    return oEll.call(this, x, y, rx, ry, ...a);
  };
  const oRect = P.rect;
  P.rect = function (x, y, w, h) {
    if (on(this)) grow(this, box(this.getTransform(), x, y, w, h), 'R');
    return oRect.call(this, x, y, w, h);
  };
  if (P.roundRect) {
    const oRR = P.roundRect;
    P.roundRect = function (x, y, w, h, ...a) {
      if (on(this)) grow(this, box(this.getTransform(), x, y, w, h), 'RR');
      return oRR.call(this, x, y, w, h, ...a);
    };
  }
  const shapeOf = (ops) => {
    const k = ops.filter((o) => o !== 'M');
    if (k.length === 1 && (k[0] === 'A' || k[0] === 'E')) return 'ellipse';
    if (k.length === 1 && (k[0] === 'R' || k[0] === 'RR')) return 'rect';
    if (k.every((o) => o === 'L') && k.length <= 4) return 'poly';
    return 'path';
  };
  // a clip: what is drawn after it shows only inside (kept as a box, in canvas pixels)
  const oClip = P.clip;
  P.clip = function (...a) {
    if (on(this)) {
      if (a[0] && typeof a[0] === 'object') this.__clip = this.__clip || null;
      else if (this.__wp && Number.isFinite(this.__wp.b[0])) {
        const b = this.__wp.b, c = this.__clip;
        this.__clip = c ? [Math.max(b[0], c[0]), Math.max(b[1], c[1]), Math.min(b[2], c[2]), Math.min(b[3], c[3])] : b.slice();
      }
    }
    return oClip.apply(this, a);
  };
  const oFill = P.fill;
  P.fill = function (...a) {
    mark(this);
    if (on(this)) {
      if (a[0] && typeof a[0] === 'object') window.__wlog.push({ k: 'fill', shape: 'path2d', b: null, style: styleOf(this.fillStyle), ...st(this) });
      else if (this.__wp && Number.isFinite(this.__wp.b[0])) window.__wlog.push({ k: 'fill', shape: shapeOf(this.__wp.ops), b: this.__wp.b, style: styleOf(this.fillStyle), ...st(this) });
    }
    return oFill.apply(this, a);
  };
  const oStroke = P.stroke;
  P.stroke = function (...a) {
    if (on(this) && this.__wp && Number.isFinite(this.__wp.b[0]) && !(a[0] && typeof a[0] === 'object')) {
      const m = this.getTransform();
      window.__wlog.push({ k: 'stroke', shape: shapeOf(this.__wp.ops), b: this.__wp.b, lw: +(this.lineWidth * Math.hypot(m.a, m.b)).toFixed(2), dash: this.getLineDash().length > 0, style: styleOf(this.strokeStyle), ...st(this) });
    }
    return oStroke.apply(this, a);
  };
  const oText = P.fillText;
  P.fillText = function (t, x, y, ...a) {
    if (on(this)) {
      const w = this.measureText(String(t)).width;
      window.__wlog.push({ k: 'text', text: String(t).slice(0, 60), b: box(this.getTransform(), x - w / 2, y - 20, w, 24), style: styleOf(this.fillStyle), ...st(this) });
    }
    return oText.call(this, t, x, y, ...a);
  };

  // how solid a picture's borders are (0-1 per side: the share of the border row or column that is opaque), cached per picture part
  const edgeCache = new Map();
  const scratch = document.createElement('canvas');
  window.__wedges = (img, sx, sy, sw, sh) => {
    const key = (img.__wkey ||= Math.random().toString(36).slice(2)) + `|${sx}|${sy}|${sw}|${sh}`;
    if (edgeCache.has(key)) return edgeCache.get(key);
    let out = null;
    try {
      const W = Math.max(1, Math.min(256, Math.round(sw))), H = Math.max(1, Math.min(256, Math.round(sh)));
      scratch.width = W;
      scratch.height = H;
      const c = scratch.getContext('2d', { willReadFrequently: true });
      c.clearRect(0, 0, W, H);
      oDraw.call(c, img, sx, sy, sw, sh, 0, 0, W, H);
      const d = c.getImageData(0, 0, W, H).data;
      const a = (x, y) => d[(y * W + x) * 4 + 3];
      const share = (n, f) => {
        let k = 0;
        for (let i = 0; i < n; i++) if (f(i) > 160) k++;
        return +(k / n).toFixed(2);
      };
      // (two rows in from each border: the outermost row is often half-covered by the resampling)
      const r = (v, n) => Math.min(n - 1, v);
      out = {
        top: share(W, (x) => a(x, r(1, H))), bottom: share(W, (x) => a(x, Math.max(0, H - 2))),
        left: share(H, (y) => a(r(1, W), y)), right: share(H, (y) => a(Math.max(0, W - 2), y)),
        // the lowest opaque row, as a share of the height (a prop's feet)
        foot: (() => {
          for (let y = H - 1; y >= 0; y--) for (let x = 0; x < W; x++) if (a(x, y) > 160) return +((y + 1) / H).toFixed(3);
          return 0;
        })(),
      };
    } catch {
      out = null;
    }
    edgeCache.set(key, out);
    return out;
  };
};
if (typeof OffscreenCanvasRenderingContext2D !== 'undefined') __wInstall(OffscreenCanvasRenderingContext2D.prototype);
__wInstall(CanvasRenderingContext2D.prototype);
// the running engine (older builds set window.__engine to the engine itself, newer ones to a function that returns it)
window.__weng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
