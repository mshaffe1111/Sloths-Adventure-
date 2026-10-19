/**
 * Slomatt's reward coats. The painted hero is one picture sheet, so a coat is made by recolouring the warm fur
 * pixels once (browns and tans) and leaving everything else (backpack, eyes, claws, outlines) as painted.
 */
export type Coat = 'none' | 'berry' | 'golden' | 'moonlight';

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** is this a fur colour? warm hues with some colour in them, not near-black outlines and not near-white highlights */
export function isFur(h: number, s: number, l: number): boolean {
  return (h <= 62 || h >= 340) && s > 0.14 && l > 0.1 && l < 0.93;
}

/** recolour one pixel for a coat (returns the same colour for a non-fur pixel) */
export function tintPixel(r: number, g: number, b: number, coat: Coat): [number, number, number] {
  if (coat === 'none') return [r, g, b];
  const [h, s, l] = rgbToHsl(r, g, b);
  if (!isFur(h, s, l)) return [r, g, b];
  switch (coat) {
    case 'berry':
      // browns to a rosy berry: hue to magenta-pink, a little more colour
      return hslToRgb(334 + (h > 180 ? h - 360 : h) * 0.25, Math.min(1, s * 1.15 + 0.1), l);
    case 'golden':
      // tan to bright gold, a touch lighter
      return hslToRgb(44 + (h - 30) * 0.2, Math.min(1, s * 1.25 + 0.2), Math.min(0.9, l * 1.1 + 0.05));
    case 'moonlight':
      // a cool silvery blue
      return hslToRgb(214 + (h - 30) * 0.15, Math.min(0.5, s * 0.55), Math.min(0.92, l * 1.08 + 0.06));
  }
}

/** recolour a whole RGBA buffer in place */
export function tintImageData(data: Uint8ClampedArray, coat: Coat) {
  if (coat === 'none') return;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [r, g, b] = tintPixel(data[i], data[i + 1], data[i + 2], coat);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

/** a recoloured copy of a picture, as a canvas (null when no canvas is available) */
export function makeTintedCanvas(img: HTMLImageElement, coat: Coat): HTMLCanvasElement | null {
  if (coat === 'none' || typeof document === 'undefined') return null;
  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d', { willReadFrequently: true });
    if (!x) return null;
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height);
    tintImageData(d.data, coat);
    x.putImageData(d, 0, 0);
    return c;
  } catch {
    return null;
  }
}
