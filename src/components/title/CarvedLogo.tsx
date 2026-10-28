import React, { useEffect, useRef } from 'react';
import { CARVE_GLYPHS, GROOVE, STRETCH, TITLE_LINES, cutSoFar, fitRows, planCarve, type PlannedLetter } from './carvePlan.ts';
import { drawPaintedLeaf, warmLeaves } from '../../game/leafSprites.ts';
import { HUD_PIECES } from '../../game/hudAtlasData.ts';
import { sound } from '../../game/audio.ts';

/**
 * The title's name, carved into a mossy log (Matt's pick, 2026-10-28: "can we actually make it look like it's being carved in there?").
 * The log is the W2 prop sheet's long log; the letters the game's own carving alphabet (carvePlan.ts).
 *
 *   the carve    the first title of a visit: SLOTHS cut stroke by stroke, the knife following each letter's path, chips and dust
 *                flicking off the cutting point; each fresh groove dark, then filling with a warm gold glow from inside; one gold pulse
 *                across the word when the last letter lands and a few leaves shaken loose; then RAINFOREST ADVENTURES cut smaller and
 *                quicker on its own line beneath, and a vine curling over the log's end. About three seconds. A tap finishes it at once.
 *   after that   (back from a menu or a stage) the name is simply there, carved; the title's glints play over it
 *   reduced motion   shown carved, faded in
 *
 * One canvas, drawn only while something is moving; once carved it is a still picture.
 */
export const TITLE_SLAB_URL = new URL('../../assets/title/slab.webp', import.meta.url).href;
const HUD_URL = new URL('../../assets/hud/hud-atlas.webp', import.meta.url).href;

/** the log's picture, fetched as soon as the title's code arrives (the splash holds until it is in: carvedLogoReady) */
let slabPic: HTMLImageElement | null = null;
let slabIn = false;
function warmSlab(done?: () => void) {
  if (slabIn) return done?.();
  if (!slabPic && typeof Image !== 'undefined') {
    slabPic = new Image();
    slabPic.decoding = 'async';
    slabPic.src = TITLE_SLAB_URL;
  }
  const pic = slabPic;
  if (!pic) return;
  const fin = () => {
    slabIn = true;
    done?.();
  };
  if (pic.complete && pic.naturalWidth) fin();
  else pic.addEventListener('load', () => (pic.decode ? pic.decode().then(fin, fin) : fin()), { once: true });
  pic.addEventListener('error', fin, { once: true });
}
export function carvedLogoReady(): boolean {
  warmSlab();
  return slabIn;
}

/** carved once a visit: every later title shows it done */
let carvedThisVisit = false;

const PLAN = planCarve(TITLE_LINES);
/** the moment the name is finished, and when the pulse, the leaves and the vine come */
const NAME_END = PLAN.lineEnds[0];
const PULSE_AT = NAME_END + 0.05;
const VINE_AT = PLAN.end + 0.05;
const ALL_DONE = VINE_AT + 0.9;

/** a steady shake per letter (the same every frame) */
const wob = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};

/**
 * One letter chisel-cut into the bark (in the letter's own space, units of `u`): each stroke a wide V-groove, its two walls meeting at
 * a dark floor (the wall facing the light lit, the other in shadow), the ends cut in a wedge the way a knife goes in and comes out,
 * the edges a little rough; the bark's lip catching the light along the lower edge; and the gold glow living down in the floor.
 * `open`: the knife is still in the last stroke (its leading end is the knife's wedge).
 */
function chisel(g: CanvasRenderingContext2D, strokes: number[][], u: number, wg: number, glow: number, seed: number, dpr: number, scratch: HTMLCanvasElement, open: boolean) {
  if (!strokes.length) return;
  const m = wg + 3;
  const bw = 4 * u + m * 2, bh = 6 * u + m * 2;
  const pw = Math.ceil(bw * dpr), ph = Math.ceil(bh * dpr);
  if (scratch.width < pw || scratch.height < ph) {
    scratch.width = Math.max(scratch.width, pw);
    scratch.height = Math.max(scratch.height, ph);
  }
  // the strokes in this letter's pixels, roughed up a touch (the same every frame)
  const pts = strokes.map((st, si) => {
    const out: number[] = [];
    for (let k = 0; k < st.length; k += 2) {
      const j = wob(seed * 13 + si * 5 + k, 7) * wg * 0.06;
      out.push(m + st[k] * u + j, m + st[k + 1] * u - j * 0.7);
    }
    return out;
  });
  const lines = (c: CanvasRenderingContext2D, dx = 0, dy = 0) => {
    c.beginPath();
    for (const p of pts) {
      if (p.length < 4) continue;
      c.moveTo(p[0] + dx, p[1] + dy);
      for (let k = 2; k < p.length; k += 2) c.lineTo(p[k] + dx, p[k + 1] + dy);
    }
  };
  const wedges = (c: CanvasRenderingContext2D, dx = 0, dy = 0) => {
    c.beginPath();
    pts.forEach((p, pi) => {
      if (p.length < 4) return;
      const ends: Array<[number, number, number, number]> = [[p[0], p[1], p[0] - p[2], p[1] - p[3]]];
      const n = p.length;
      ends.push([p[n - 2], p[n - 1], p[n - 2] - p[n - 4], p[n - 1] - p[n - 3]]);
      ends.forEach(([x, y, vx, vy], ei) => {
        const l = Math.hypot(vx, vy) || 1;
        const ux = vx / l, uy = vy / l;
        // (the knife's own end, still moving, is a sharper, longer wedge)
        const reach = wg * (open && pi === pts.length - 1 && ei === 1 ? 0.7 : 0.5);
        c.moveTo(x + dx - uy * wg * 0.5, y + dy + ux * wg * 0.5);
        c.lineTo(x + dx + ux * reach, y + dy + uy * reach);
        c.lineTo(x + dx + uy * wg * 0.5, y + dy - ux * wg * 0.5);
        c.closePath();
      });
    });
  };
  // the bark's lip: light along the lower edge of the cut, a little shade along the upper
  g.save();
  g.translate(-m, -m);
  g.lineJoin = 'round';
  g.lineCap = 'butt';
  g.lineWidth = wg * 1.14;
  g.strokeStyle = 'rgba(255, 228, 180, .34)';
  lines(g, wg * 0.08, wg * 0.13);
  g.stroke();
  g.fillStyle = 'rgba(255, 228, 180, .34)';
  wedges(g, wg * 0.08, wg * 0.13);
  g.fill();
  g.strokeStyle = 'rgba(20, 8, 2, .3)';
  g.lineWidth = wg * 1.1;
  lines(g, -wg * 0.05, -wg * 0.08);
  g.stroke();
  g.restore();
  // the groove itself, made on its own (its walls and floor are painted only inside it)
  const s = scratch.getContext('2d')!;
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.clearRect(0, 0, pw, ph);
  s.setTransform(dpr, 0, 0, dpr, 0, 0);
  s.globalCompositeOperation = 'source-over';
  s.lineJoin = 'round';
  s.lineCap = 'butt';
  s.lineWidth = wg;
  s.strokeStyle = '#3b1d0c';
  s.fillStyle = '#3b1d0c';
  lines(s);
  s.stroke();
  wedges(s);
  s.fill();
  s.globalCompositeOperation = 'source-atop';
  // the wall that faces the light (up and to the left): the lower right half of every groove
  s.strokeStyle = '#a5703f';
  s.fillStyle = '#a5703f';
  s.lineWidth = wg * 0.78;
  lines(s, wg * 0.24, wg * 0.32);
  s.stroke();
  wedges(s, wg * 0.24, wg * 0.32);
  s.fill();
  // fresh-cut wood just under the lit edge
  s.strokeStyle = 'rgba(232, 190, 130, .55)';
  s.lineWidth = wg * 0.16;
  lines(s, wg * 0.36, wg * 0.44);
  s.stroke();
  // the floor: a dark line where the walls meet, filling with gold
  const gl = Math.min(1, glow);
  const floor = [Math.round(22 + 233 * gl), Math.round(10 + 190 * gl), Math.round(4 + 80 * gl)];
  s.strokeStyle = `rgb(${floor[0]},${floor[1]},${floor[2]})`;
  s.lineCap = 'round';
  s.lineWidth = wg * (0.12 + 0.1 * gl);
  if (glow > 0) {
    s.shadowColor = `rgba(255, 190, 60, ${0.9 * gl})`;
    s.shadowBlur = wg * 0.45 * dpr * Math.min(1.3, glow);
  }
  lines(s);
  s.stroke();
  s.shadowBlur = 0;
  if (glow > 0.3) {
    s.strokeStyle = `rgba(255, 246, 205, ${0.85 * Math.min(1, glow - 0.3)})`;
    s.lineWidth = wg * 0.07;
    lines(s);
    s.stroke();
  }
  s.globalCompositeOperation = 'source-over';
  g.drawImage(scratch, 0, 0, pw, ph, -m, -m, pw / dpr, ph / dpr);
  // the warm light from the groove on the bark round it
  if (glow > 0) {
    g.save();
    g.translate(-m, -m);
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(255, 170, 50, ${0.1 * Math.min(1.3, glow)})`;
    g.lineWidth = wg * 0.5;
    g.lineCap = 'round';
    g.shadowColor = 'rgba(255, 170, 50, .6)';
    g.shadowBlur = wg * 1.2 * dpr;
    lines(g);
    g.stroke();
    g.restore();
  }
}

interface Chip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  age: number;
  c: string;
  dust: boolean;
}

function load(url: string, done: (im: HTMLImageElement | null) => void) {
  const im = new Image();
  im.decoding = 'async';
  im.onload = () => (im.decode ? im.decode().then(() => done(im), () => done(im)) : done(im));
  im.onerror = () => done(null);
  im.src = url;
}

export const CarvedLogo: React.FC<{
  /** start carving now (the title's entrance has begun); before that the bare log shows */
  go: boolean;
  /** told once the name is carved (or was already): the title brings its buttons up then */
  onName?: () => void;
  /** told once the carve is finished (or was already) */
  onCarved?: () => void;
}> = ({ go, onName, onCarved }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const goRef = useRef(go);
  goRef.current = go;
  const doneRef = useRef(onCarved);
  doneRef.current = onCarved;
  const nameRef = useRef(onName);
  nameRef.current = onName;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const play = !carvedThisVisit && !reduced;
    warmLeaves();
    let slab: HTMLImageElement | null = null;
    let hud: HTMLImageElement | null = null;
    let haveSlab = false;
    let raf = 0;
    // (a function, so the pictures' load callbacks above may call it even when they answer at once)
    function kick() {
      if (!raf) raf = requestAnimationFrame(draw);
    }
    let t0: number | null = null;
    const bake = document.createElement('canvas');
    const scratch = document.createElement('canvas');
    const baked = new Set<number>();
    let bakeKey = '';
    let finished = !play;
    let told = false;
    let named = false;
    let lastSound = -1;
    let lastNow = 0;
    const chips: Chip[] = [];
    const fallers = Array.from({ length: 4 }, (_, i) => ({ x: 0.2 + i * 0.2 + wob(i, 9) * 0.05, s: 0.6 + (i % 2) * 0.3, p: i * 1.7, c: 1000 + i * 137 }));
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const finish = () => {
      finished = true;
      carvedThisVisit = true;
      chips.length = 0;
      kick();
    };
    const onTap = () => {
      if (!finished && t0 !== null) finish();
    };
    window.addEventListener('pointerdown', onTap, { capture: true, passive: true });

    const draw = (now: number) => {
      raf = 0;
      if (!haveSlab) return;
      const W = cv.clientWidth, Hc = cv.clientHeight;
      if (!W || !Hc) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hc * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hc * dpr);
      }
      const c = cv.getContext('2d');
      if (!c) return;
      if (play && t0 === null && goRef.current) t0 = now;
      const t = finished ? ALL_DONE + 10 : t0 === null ? -1 : (now - t0) / 1000;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
      lastNow = now;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, Hc);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';

      // ---- the log (and the vines it hangs from), painted once into the still layer with every settled letter ----
      const sx = W * 0.02, sw = W * 0.96;
      const sh = slab ? sw * (slab.naturalHeight / slab.naturalWidth) * STRETCH : sw * 0.42;
      const sy = W * 0.03;
      const bkey = `${cv.width}x${cv.height}|${hud ? 1 : 0}`;
      if (bakeKey !== bkey) {
        bakeKey = bkey;
        baked.clear();
        bake.width = cv.width;
        bake.height = cv.height;
        const g = bake.getContext('2d')!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        if (hud) {
          const ten = HUD_PIECES.tendril;
          const tk = (W / 380) * 0.5;
          for (const ux of [0.2, 0.84]) {
            const x = sx + sw * ux;
            const bottom = sy + sh * 0.3;
            const segH = ten.h * tk;
            for (let y = -2; y < bottom; y += segH - 2) {
              const hgt = Math.min(segH, bottom - y);
              g.drawImage(hud, ten.x, ten.y, ten.w, (hgt / segH) * ten.h, x - ten.w * tk * 0.5, y, ten.w * tk, hgt);
            }
          }
        }
        if (slab) {
          g.save();
          g.shadowColor = 'rgba(10, 6, 2, .45)';
          g.shadowBlur = 14 * dpr;
          g.shadowOffsetY = 5 * dpr;
          g.drawImage(slab, sx, sy, sw, sh);
          g.restore();
        }
      }
      c.drawImage(bake, 0, 0, W, Hc);
      // the bark below the moss, where the words go
      const faceTop = sy + sh * 0.37, faceH = sh * 0.56;
      const faceCx = sx + sw * 0.53;
      const rows = fitRows(PLAN, faceTop, faceH, sw * 0.8);
      // ---- the letters ----
      const pulseX = t >= PULSE_AT && t < PULSE_AT + 0.75 ? (t - PULSE_AT) / 0.6 : -9;
      let tip: [number, number] | null = null;
      let cutting: PlannedLetter | null = null;
      PLAN.letters.forEach((l, i) => {
        const row = rows[l.line];
        const u = row.h / 6;
        const x0 = faceCx - (row.w * u) / 2 + l.x0 * u;
        const cut = cutSoFar(l, t);
        if (!cut.strokes.length) return;
        const g = l.line === 0 ? Math.min(1, Math.max(0, (t - l.end) / 0.35)) : Math.min(0.7, Math.max(0, (t - l.end) / 0.3) * 0.7);
        // the pulse: brighter as it passes over this letter
        const across = (l.x0 + 2) / row.w;
        const boost = l.line === 0 && pulseX > -1 ? Math.exp(-((across - pulseX) ** 2) / (2 * 0.09 * 0.09)) : 0;
        const paintLetter = (g2: CanvasRenderingContext2D, glow: number) => {
          g2.save();
          g2.translate(x0, row.y + wob(i, 3) * row.h * 0.04);
          g2.rotate(wob(i, 5) * 0.045);
          chisel(g2, cut.strokes, u, row.h * GROOVE[l.line], glow, i, dpr, scratch, !cut.done);
          g2.restore();
        };
        const settled = finished || (t > l.end + 0.4 && (l.line === 1 || t > PULSE_AT + 0.8));
        if (settled) {
          // a settled letter is painted once into the still layer (and this frame), never again
          if (!baked.has(i)) {
            baked.add(i);
            const bg = bake.getContext('2d')!;
            bg.setTransform(dpr, 0, 0, dpr, 0, 0);
            bg.imageSmoothingEnabled = true;
            paintLetter(bg, l.line === 0 ? 1 : 0.7);
            paintLetter(c, l.line === 0 ? 1 : 0.7);
          }
          return;
        }
        paintLetter(c, Math.min(1.25, g + boost * 0.8));
        if (cut.tip && !finished) {
          // where the knife is, on the screen
          const a = wob(i, 5) * 0.045;
          const lx = cut.tip[0] * u, ly = cut.tip[1] * u;
          tip = [x0 + lx * Math.cos(a) - ly * Math.sin(a), row.y + wob(i, 3) * row.h * 0.04 + lx * Math.sin(a) + ly * Math.cos(a)];
          cutting = l;
        }
      });

      // ---- chips and dust off the knife ----
      if (tip && cutting && dt > 0) {
        const big = (cutting as PlannedLetter).line === 0;
        const n = big ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const ang = -Math.PI / 2 + (rnd() - 0.5) * 2.4;
          const sp = (big ? 60 : 35) + rnd() * (big ? 110 : 55);
          const pal = ['#7a4a22', '#b98454', '#e8c48c', '#5a3416'];
          chips.push({ x: tip[0], y: tip[1], vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: (big ? 1.6 : 1) + rnd() * (big ? 2.2 : 1.2), life: 0.45 + rnd() * 0.4, age: 0, c: pal[Math.floor(rnd() * pal.length)], dust: false });
        }
        if (rnd() < 0.6) chips.push({ x: tip[0], y: tip[1], vx: (rnd() - 0.5) * 20, vy: -10 - rnd() * 15, r: 2, life: 0.55, age: 0, c: 'rgba(236, 214, 170,', dust: true });
        // a faint scratch, a letter at a time, only once a tap has let the game make sound
        const li = PLAN.letters.indexOf(cutting);
        if (li !== lastSound && !sound.locked && (cutting as PlannedLetter).line === 0) {
          lastSound = li;
          try {
            sound.playTreeClimb();
          } catch {
            /* no sound: silent */
          }
        }
      }
      for (let k = chips.length - 1; k >= 0; k--) {
        const p = chips[k];
        p.age += dt;
        if (p.age >= p.life) {
          chips.splice(k, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (!p.dust) p.vy += 420 * dt;
        const u = p.age / p.life;
        if (p.dust) {
          const r = p.r + u * 9;
          c.fillStyle = `${p.c}${(0.32 * (1 - u)).toFixed(3)})`;
          c.beginPath();
          c.arc(p.x, p.y, r, 0, Math.PI * 2);
          c.fill();
        } else {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.age * 14 + k);
          c.globalAlpha = 1 - u * u;
          c.fillStyle = p.c;
          c.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
          c.restore();
        }
      }

      // ---- leaves shaken loose by the last letter ----
      if (!finished && t > NAME_END && t < NAME_END + 2.2) {
        const k = t - NAME_END;
        for (const f of fallers) {
          const y = sy + sh * 0.2 + k * k * 60 * f.s + k * 30;
          const x = sx + sw * f.x + Math.sin(k * 3 + f.p) * 14;
          drawPaintedLeaf(c, 1, { s: f.s, p: f.p, c: f.c }, x, y, k + f.p, W / 380, Math.max(0, 1 - k / 2.2));
        }
      }

      // ---- the vine draped over the log's left end, and a curl off the right ----
      const vineK = finished ? 1 : Math.min(1, Math.max(0, (t - VINE_AT) / 0.8));
      if (hud && vineK > 0) {
        const lead = HUD_PIECES.vineLead, end = HUD_PIECES.vineEnd;
        const k = (W / 380) * 0.34;
        c.save();
        // draped over the log's left end, its leaves on top, growing in from the left
        c.beginPath();
        c.rect(0, 0, sx + (lead.w * k + 10) * vineK, Hc);
        c.clip();
        c.translate(sx - lead.w * k * 0.08, sy + sh * 0.08);
        c.rotate(0.32);
        c.drawImage(hud, lead.x, lead.y, lead.w, lead.h, 0, -lead.h * k * 0.55, lead.w * k * 0.62, lead.h * k);
        c.restore();
        c.save();
        // and a curl hanging off the right end
        const ex = sx + sw * 0.9, ey = sy + sh * 0.3;
        c.beginPath();
        c.rect(ex - 6, ey - end.h * k, end.w * k + 12, (end.h * k * 2.2 + 6) * vineK);
        c.clip();
        c.translate(ex, ey);
        c.rotate(1.1);
        c.drawImage(hud, end.x, end.y, end.w, end.h, 0, -end.h * k * 0.5, end.w * k * 0.8, end.h * k * 0.8);
        c.restore();
      }

      if (!named && (finished || t >= NAME_END)) {
        named = true;
        nameRef.current?.();
      }
      if (!finished && t >= ALL_DONE) finish();
      if (finished && !told) {
        told = true;
        carvedThisVisit = true;
        doneRef.current?.();
      }
      // keep drawing while anything moves; once carved it is a still
      // (before the go the bare log is drawn once and the wait is the poll's)
      if ((!finished && t0 !== null) || chips.length) kick();
    };
    warmSlab(() => {
      slab = slabPic && slabPic.naturalWidth ? slabPic : null;
      haveSlab = true;
      kick();
    });
    load(HUD_URL, (im) => {
      hud = im;
      kick();
    });
    // (the leaves' sheet may land after the still was drawn: nothing to do, the leaves only fall during the carve)
    kick();
    // a new size (the phone turned) redraws the still
    const ro = new ResizeObserver(() => kick());
    ro.observe(cv);
    // wait for the go, then carve
    const poll = window.setInterval(() => {
      if (goRef.current && t0 === null && !finished) kick();
    }, 100);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.clearInterval(poll);
      window.removeEventListener('pointerdown', onTap, { capture: true });
    };
  }, []);

  return <canvas ref={ref} className="gx2-carve" role="img" aria-label="Sloths: Rainforest Adventures" />;
};

/** for the tests: the glyphs it carves */
export { CARVE_GLYPHS };
