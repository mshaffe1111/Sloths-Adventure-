// Draw-size probe (tools/assets/drawprobe.mjs): injected before the game loads. For every image the game draws, it records the
// largest scale it is ever drawn at, in DEVICE pixels per stored pixel, following canvases drawn into other canvases up to the screen.
(() => {
  window.__eng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine) || null;
  const P = (window.__probe = { src: new Map(), edges: new Map(), dom: new Map(), fetched: new Map(), phase: 'boot', sizes: {}, life: Math.random().toString(36).slice(2) });
  const tag = new WeakMap(); // image/bitmap/blob -> url
  let nextId = 1;
  const cid = new WeakMap();
  // a canvas is a new identity whenever its size changes (pooled canvases are reused for different jobs)
  const idOf = (c) => { let i = cid.get(c); if (!i || i.w !== c.width || i.h !== c.height) { i = { id: nextId++, w: c.width, h: c.height }; cid.set(c, i); P.sizes[i.id] = [c.width, c.height]; } return i.id; };
  const canvases = new Map(); // id -> WeakRef(canvas)
  const ob = Response.prototype.blob;
  Response.prototype.blob = async function () { const b = await ob.call(this); try { tag.set(b, this.url); } catch {} return b; };
  const cib = window.createImageBitmap;
  window.createImageBitmap = async function (s, ...a) {
    const bm = await cib.call(this, s, ...a);
    const u = tag.get(s) || (s && s.src) || (s && tag.get(s));
    if (u) tag.set(bm, u); else if (s && cid.has(s)) tag.set(bm, 'canvas:' + idOf(s));
    return bm;
  };
  const of = window.fetch;
  window.fetch = function (u, ...a) { try { const k = String(u.url || u); if (!P.fetched.has(k)) P.fetched.set(k, P.phase); } catch {} return of.call(this, u, ...a); };
  const urlOf = (img) => {
    if (typeof HTMLImageElement !== 'undefined' && img instanceof HTMLImageElement) return img.currentSrc || img.src;
    const t = tag.get(img); if (t) return t;
    if ((typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement) || (typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas)) return 'canvas:' + idOf(img);
    return null;
  };
  const wrap = (proto) => {
    if (!proto) return;
    const d = proto.drawImage;
    proto.drawImage = function (img, ...a) {
      try {
        const u = urlOf(img);
        if (u) {
          let sw, dw, sh, dh;
          const iw = img.naturalWidth || img.videoWidth || img.width, ih = img.naturalHeight || img.videoHeight || img.height;
          if (a.length === 2) { sw = iw; sh = ih; dw = iw; dh = ih; }
          else if (a.length === 4) { sw = iw; sh = ih; dw = a[2]; dh = a[3]; }
          else { sw = a[2]; sh = a[3]; dw = a[6]; dh = a[7]; }
          // (a decode warm-up draws 4x4 px of a sheet 1:1 into a corner: atlasLoader.ts warmSheets. It says nothing about drawn size)
          if (Math.abs(sw) <= 4 && Math.abs(sh) <= 4) return d.call(this, img, ...a);
          const m = this.getTransform();
          const k = Math.max(Math.abs(dw * Math.hypot(m.a, m.b)) / Math.max(1, Math.abs(sw)), Math.abs(dh * Math.hypot(m.c, m.d)) / Math.max(1, Math.abs(sh)));
          const tgt = idOf(this.canvas);
          if (!canvases.has(tgt)) canvases.set(tgt, new WeakRef(this.canvas));
          if (u.startsWith('canvas:')) {
            const from = Number(u.slice(7));
            let e = P.edges.get(from); if (!e) P.edges.set(from, (e = new Map()));
            if (!(e.get(tgt) >= k)) e.set(tgt, k);
          } else {
            let r = P.src.get(u); if (!r) P.src.set(u, (r = { w: iw, h: ih, at: new Map(), n: 0, phase: P.phase }));
            r.n++;
            if (!(r.at.get(tgt) >= k)) r.at.set(tgt, k);
            // the largest SOURCE rectangle used (a sheet's frame), to compare frame sizes
            r.sw = Math.max(r.sw || 0, Math.abs(sw)); r.sh = Math.max(r.sh || 0, Math.abs(sh));
          }
        }
      } catch {}
      return d.call(this, img, ...a);
    };
  };
  wrap(window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype);
  wrap(window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype);
  // the canvas -> screen factor of every canvas on the page now
  P.screenFactor = () => {
    const out = {};
    for (const [id, ref] of canvases) {
      const c = ref.deref();
      if (c && c instanceof HTMLCanvasElement && c.isConnected && cid.get(c) && cid.get(c).id === id) {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && c.width > 0) out[id] = Math.max((r.width * devicePixelRatio) / c.width, (r.height * devicePixelRatio) / c.height);
      }
    }
    return out;
  };
  P.screens = {};
  // DOM images and CSS backgrounds: box size on screen, in device px
  P.scanDom = () => {
    const sf = P.screenFactor();
    for (const [id, f] of Object.entries(sf)) if (!(P.screens[id] >= f)) P.screens[id] = f;
    const dpr = devicePixelRatio;
    for (const el of document.querySelectorAll('*')) {
      let u = null, kind = 'img', bs = '';
      if (el instanceof HTMLImageElement) u = el.currentSrc || el.src;
      else {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundImage;
        if (bg && bg !== 'none') { const m = bg.match(/url\("?([^")]+)"?\)/); if (m) { u = new URL(m[1], location.href).href; kind = 'bg'; bs = cs.backgroundSize; } }
      }
      if (!u) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const w = r.width * dpr, h = r.height * dpr;
      let rec = P.dom.get(u); if (!rec) P.dom.set(u, (rec = { w: 0, h: 0, kind, bs, phase: P.phase }));
      if (w * h > rec.w * rec.h) { rec.w = w; rec.h = h; rec.bs = bs; }
    }
  };
  // the largest screen scale reached by each image, along canvas chains (depth 5)
  P.result = () => {
    P.scanDom();
    const sf = P.screens;
    const best = new Map();
    const reach = (c, depth) => {
      if (best.has(c)) return best.get(c);
      let v = sf[c] || 0;
      if (depth < 5) for (const [t, m] of P.edges.get(c) || []) v = Math.max(v, m * reach(t, depth + 1));
      best.set(c, v);
      return v;
    };
    const out = {};
    for (const [u, r] of P.src) {
      let s = 0;
      for (const [c, k] of r.at) s = Math.max(s, k * reach(c, 0));
      out[u] = { w: r.w, h: r.h, scale: s, n: r.n, sw: r.sw, sh: r.sh, phase: r.phase };
    }
    const dom = {};
    for (const [u, r] of P.dom) dom[u] = r;
    const raw = {};
    for (const [u, r] of P.src) raw[u] = Object.fromEntries(r.at);
    const edges = {};
    for (const [c, e] of P.edges) edges[c] = Object.fromEntries(e);
    return { life: P.life, canvas: out, dom, fetched: Object.fromEntries(P.fetched), raw, edges, screens: sf, sizes: P.sizes };
  };
})();
