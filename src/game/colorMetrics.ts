/**
 * colorMetrics — how far apart two colours look (CIEDE2000), so art rules can be checked with numbers.
 *
 * Used by the platform palette to keep every standable top clearly different from Pokey's fur (#a66b43), and by the
 * test that holds that line for all ten worlds.
 */

/** Pokey's mean fur colour (measured from the standard hero sheet) */
export const FUR = '#a66b43';

export type Lab = [number, number, number];

function hexToRgb(hex: string): [number, number, number] {
  let s = hex.trim();
  const m = s.match(/^rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  s = s.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const lin = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** sRGB colour (hex or rgb()) to CIE L*a*b* (D65) */
export function toLab(color: string): Lab {
  const [r, g, b] = hexToRgb(color).map(lin);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** CIEDE2000 between two Lab colours (Sharma, Wu and Dalal 2005) */
export function deltaE00Lab(a: Lab, b: Lab): number {
  const [L1, a1, b1] = a;
  const [L2, a2, b2] = b;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h = (y: number, x: number) => {
    if (x === 0 && y === 0) return 0;
    const t = deg(Math.atan2(y, x));
    return t >= 0 ? t : t + 360;
  };
  const h1p = h(b1, a1p);
  const h2p = h(b2, a2p);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hbp += h1p + h2p < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T = 1 - 0.17 * Math.cos(rad(hbp - 30)) + 0.24 * Math.cos(rad(2 * hbp)) + 0.32 * Math.cos(rad(3 * hbp + 6)) - 0.2 * Math.cos(rad(4 * hbp - 63));
  const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;
  const kl = dLp / Sl;
  const kc = dCp / Sc;
  const kh = dHp / Sh;
  return Math.sqrt(kl * kl + kc * kc + kh * kh + Rt * kc * kh);
}

/** CIEDE2000 between two hex / rgb() colours */
export function deltaE00(a: string, b: string): number {
  return deltaE00Lab(toLab(a), toLab(b));
}

/** how far a colour sits from Pokey's fur */
export const furDistance = (color: string) => deltaE00(color, FUR);

/** the lightness (L*) of a colour, 0 to 100 */
export const lightness = (color: string) => toLab(color)[0];
