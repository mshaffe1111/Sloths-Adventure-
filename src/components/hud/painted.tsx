/**
 * The painted pieces of the new HUD and of Dot's guide (Matt approved them on 2026-10-26), from two sheets:
 *   assets/hud/hud-atlas.webp                the vine, its tendrils and end curl, the Menu leaf, the number and goal plates, the goal
 *                                            card, Dot's bubble (a 9-slice) and its tail, the teal ring and arrow (game/hudAtlasData.ts)
 *   assets/characters/dot-perch-atlas.webp   Dot perched: sitting, pointing ahead, up and down, and talking (game/dotPerchAtlasData.ts)
 * About 5 MB and 1.3 MB once decoded. Neither is fetched until the new look first draws something with it (the old look never asks),
 * and until a sheet has loaded and decoded the callers keep drawing their stand-ins (hudArt.tsx, the CSS plates and bubble).
 */
import React from 'react';
import { BUBBLE_INSET, HUD_ART_SCALE, HUD_ATLAS_SIZE, HUD_PIECES, type HudPieceName } from '../../game/hudAtlasData.ts';
import { DOT_PERCH_ATLAS_SIZE, DOT_PERCH_FRAMES, type PerchPose } from '../../game/dotPerchAtlasData.ts';
import { trackAtlas } from '../../game/atlasLoader.ts';

export const HUD_ATLAS_URL = new URL('../../assets/hud/hud-atlas.webp', import.meta.url).href;
export const DOT_PERCH_URL = new URL('../../assets/characters/dot-perch-atlas.webp', import.meta.url).href;
export { DOT_PERCH_FRAMES, type PerchPose };

interface Sheet {
  url: string;
  img: HTMLImageElement | null;
  ready: boolean;
  subs: Set<() => void>;
}
const hud: Sheet = { url: HUD_ATLAS_URL, img: null, ready: false, subs: new Set() };
const perch: Sheet = { url: DOT_PERCH_URL, img: null, ready: false, subs: new Set() };

/** (a test or a comparison screenshot can ask for the stand-ins: ?standins=1) */
const standIns = (): boolean => {
  try {
    return typeof location !== 'undefined' && /[?&]standins=1\b/.test(location.search);
  } catch {
    return false;
  }
};

function load(s: Sheet) {
  if (s.img || typeof Image === 'undefined' || standIns()) return;
  const img = new Image();
  s.img = img;
  trackAtlas(
    img,
    s.url,
    () => {
      s.ready = true;
      for (const f of s.subs) f();
    },
    // (a failed fetch: the next ask tries again)
    () => {
      s.img = null;
      s.ready = false;
    },
  );
}

/** the HUD sheet has loaded and decoded (starts the load on the first ask) */
export function hudArtReady(): boolean {
  load(hud);
  return hud.ready;
}
export function hudArtImage(): HTMLImageElement | null {
  return hudArtReady() ? hud.img : null;
}
/** Dot's perched poses have loaded and decoded (starts the load on the first ask) */
export function perchArtReady(): boolean {
  load(perch);
  return perch.ready;
}

function useSheet(s: Sheet, ready: () => boolean): boolean {
  const [r, set] = React.useState(ready);
  React.useEffect(() => {
    if (ready()) {
      set(true);
      return;
    }
    const f = () => set(true);
    s.subs.add(f);
    return () => {
      s.subs.delete(f);
    };
  }, [s, ready]);
  return r;
}
/** re-renders once the HUD sheet is ready */
export const useHudArt = (): boolean => useSheet(hud, hudArtReady);

const AW = HUD_ATLAS_SIZE.w;
const AH = HUD_ATLAS_SIZE.h;
const URL_CSS = `url(${HUD_ATLAS_URL})`;

/** one piece drawn `w` px wide (its height follows, unless `h` is given: then it stretches) */
export function pieceStyle(name: HudPieceName, w: number, h?: number): React.CSSProperties {
  const p = HUD_PIECES[name];
  const kx = w / p.w;
  const hh = h ?? p.h * kx;
  const ky = hh / p.h;
  return {
    width: w,
    height: hh,
    backgroundImage: URL_CSS,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${(AW * kx).toFixed(2)}px ${(AH * ky).toFixed(2)}px`,
    backgroundPosition: `${(-p.x * kx).toFixed(2)}px ${(-p.y * ky).toFixed(2)}px`,
  };
}

/** a piece stretched to fill its element, whatever size that turns out to be (pure CSS: for boxes sized by their text) */
export function fillStyle(name: HudPieceName): React.CSSProperties {
  const p = HUD_PIECES[name];
  return {
    backgroundImage: URL_CSS,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${((AW / p.w) * 100).toFixed(3)}% ${((AH / p.h) * 100).toFixed(3)}%`,
    backgroundPosition: `${((p.x / (AW - p.w)) * 100).toFixed(3)}% ${((p.y / (AH - p.h)) * 100).toFixed(3)}%`,
  };
}

export const Piece: React.FC<{ name: HudPieceName; w: number; h?: number; flip?: boolean; style?: React.CSSProperties; className?: string }> = ({ name, w, h, flip, style, className }) => (
  <span
    aria-hidden="true"
    className={className}
    style={{ position: 'absolute', ...pieceStyle(name, w, h), ...(flip ? { transform: 'scaleX(-1)' } : null), ...style }}
  />
);

/** css px of the vine pieces at k = 1 (they are painted at 3x) */
const S = HUD_ART_SCALE;
const LEAD = HUD_PIECES.vineLead;
const TILE = HUD_PIECES.vineTile;
const END = HUD_PIECES.vineEnd;
/** the end curl is drawn a little smaller than painted (as in the review scenes) */
const END_K = 0.8;

/**
 * A painted vine from x0 to x1 with its centre line at y (px in its box), at scale k: the lead piece (with its leaves) where it starts
 * at the screen edge, the tile repeated along, and the curl at either end when asked.
 */
export const PaintedVine: React.FC<{ x0: number; x1: number; y: number; k?: number; lead?: boolean; endL?: boolean; endR?: boolean; style?: React.CSSProperties; className?: string }> = React.memo(
  ({ x0, x1, y, k = 1, lead = false, endL = false, endR = false, style, className }) => {
    const lw = (LEAD.w / S) * k;
    const th = (TILE.h / S) * k;
    const tx0 = lead ? x0 + lw - 1 : x0;
    const ew = (END.w / S) * k * END_K;
    const ey = y - (82 / S) * k * END_K;
    return (
      <span aria-hidden="true" className={className} style={{ position: 'absolute', left: 0, top: 0, ...style }}>
        {x1 > tx0 && (
          <span
            style={{
              position: 'absolute',
              left: tx0,
              top: y - th / 2,
              width: x1 - tx0 + (endR ? 1 : 0),
              height: th,
              backgroundImage: URL_CSS,
              backgroundRepeat: 'repeat-x',
              backgroundSize: `${((AW / S) * k).toFixed(3)}px ${((AH / S) * k).toFixed(3)}px`,
              backgroundPosition: '0 0',
            }}
          />
        )}
        {lead && <Piece name="vineLead" w={lw} style={{ left: x0, top: y - (57 / S) * k }} />}
        {endR && <Piece name="vineEnd" w={ew} style={{ left: x1 - 1, top: ey }} />}
        {endL && <Piece name="vineEnd" w={ew} flip style={{ left: tx0 - ew + 1, top: ey }} />}
      </span>
    );
  },
);
PaintedVine.displayName = 'PaintedVine';

/** a painted tendril hanging from (x, y), `len` long: the top of the painted one, cropped (stretched only past its painted length) */
export const Tendril: React.FC<{ x: number; y: number; len: number; k?: number }> = ({ x, y, len, k = 1 }) => {
  const p = HUD_PIECES.tendril;
  const w = 7 * k;
  const kx = w / p.w;
  const ky = Math.max(kx, len / p.h);
  return (
    <span
      aria-hidden="true"
      className="vh-tendril"
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        height: len,
        backgroundImage: URL_CSS,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${(AW * kx).toFixed(2)}px ${(AH * ky).toFixed(2)}px`,
        backgroundPosition: `${(-p.x * kx).toFixed(2)}px ${(-p.y * ky).toFixed(2)}px`,
      }}
    />
  );
};

/**
 * The goal plate at w x h: drawn whole when that is about its own shape; wider, its rounded ends keep their shape and the plain middle
 * of the log slice stretches.
 */
export const PlateArt: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const p = HUD_PIECES.goalPlate;
  const nat = (h * p.w) / p.h;
  if (w <= nat * 1.04) return <Piece name="goalPlate" w={w} h={h} className="vh-plate-art" style={{ left: 0, top: 0 }} />;
  const capSrc = Math.round(p.w * 0.34);
  const cap = (capSrc * h) / p.h;
  const ky = h / p.h;
  const part = (sx: number, sw: number, dx: number, dw: number, key: string, z = 0) => {
    const kx = dw / sw;
    return (
      <span
        key={key}
        style={{
          position: 'absolute',
          left: dx,
          top: 0,
          width: dw,
          height: h,
          zIndex: z,
          backgroundImage: URL_CSS,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${(AW * kx).toFixed(2)}px ${(AH * ky).toFixed(2)}px`,
          backgroundPosition: `${(-(p.x + sx) * kx).toFixed(2)}px ${(-p.y * ky).toFixed(2)}px`,
        }}
      />
    );
  };
  return (
    <span aria-hidden="true" className="vh-plate-art" style={{ position: 'absolute', left: 0, top: 0, width: w, height: h }}>
      {part(capSrc, p.w - 2 * capSrc, cap - 1, w - 2 * cap + 2, 'm')}
      {part(0, capSrc, 0, cap, 'l', 1)}
      {part(p.w - capSrc, capSrc, w - cap, cap, 'r', 1)}
    </span>
  );
};

/**
 * Dot's bubble body: the painted 9-slice drawn into `canvas` at w x h css px, crisp at the screen's pixel ratio. The corners keep their
 * painted size (the inset is 44 atlas px, about 14.7 css px); the edges and the parchment stretch. Returns false while the sheet loads.
 */
export function drawBubble(canvas: HTMLCanvasElement, w: number, h: number): boolean {
  const img = hudArtImage();
  if (!img || w < 4 || h < 4) return false;
  const dpr = Math.min(3, Math.max(1, (typeof window !== 'undefined' && window.devicePixelRatio) || 1));
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const p = HUD_PIECES.bubble;
  const s = BUBBLE_INSET;
  // the inset on screen, never more than half the box
  const d = Math.min(Math.round((s / S) * dpr), Math.floor(W / 2), Math.floor(H / 2));
  const sx = [0, s, p.w - s, p.w];
  const sy = [0, s, p.h - s, p.h];
  const dx = [0, d, W - d, W];
  const dy = [0, d, H - d, H];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const sw = sx[c + 1] - sx[c];
      const sh = sy[r + 1] - sy[r];
      const dw = dx[c + 1] - dx[c];
      const dh = dy[r + 1] - dy[r];
      if (sw > 0 && sh > 0 && dw > 0 && dh > 0) ctx.drawImage(img, p.x + sx[c], p.y + sy[r], sw, sh, dx[c], dy[r], dw, dh);
    }
  return true;
}

/** the tail's size on screen (css px) */
export const TAIL_W = HUD_PIECES.tail.w / S;
export const TAIL_H = HUD_PIECES.tail.h / S;

/** the ring piece drawn for a ring of radius r (its line is the middle 68%) */
export const ringBox = (r: number) => (2 * r) / 0.68;

/** the same as pieceStyle, written straight onto an element (for the pieces the guide moves itself, outside React) */
export function setPiece(el: HTMLElement, name: HudPieceName, w: number, h?: number): void {
  const s = pieceStyle(name, w, h);
  el.style.width = `${(s.width as number).toFixed(2)}px`;
  el.style.height = `${(s.height as number).toFixed(2)}px`;
  el.style.backgroundImage = URL_CSS;
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundSize = s.backgroundSize as string;
  el.style.backgroundPosition = s.backgroundPosition as string;
}

/** one of Dot's perched poses as a background (css px per atlas px `k`) */
export function perchStyle(pose: PerchPose, k: number): { w: number; h: number; size: string; pos: string } {
  const f = DOT_PERCH_FRAMES[pose];
  return {
    w: f.w * k,
    h: f.h * k,
    size: `${(DOT_PERCH_ATLAS_SIZE.w * k).toFixed(2)}px ${(DOT_PERCH_ATLAS_SIZE.h * k).toFixed(2)}px`,
    pos: `${(-f.x * k).toFixed(2)}px ${(-f.y * k).toFixed(2)}px`,
  };
}
