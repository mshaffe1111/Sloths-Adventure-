// Shared soft-shaded creature kit: colour mixing, volumetric blobs and glossy eyes.

export const hexRgb = (h: string): [number, number, number] => {
  if (h.startsWith('rgb')) {
    const m = h.match(/\d+/g) || ['0', '0', '0'];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  const f = h.replace('#', '');
  const v = f.length === 3 ? f.split('').map((c) => c + c).join('') : f;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
/** Mix two #hex colours (t=0 -> a, t=1 -> b). */
export const mixc = (a: string, b: string, t: number): string => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};

/** Soft volumetric blob: lit from the upper-left, rimmed with a thin darker edge. */
export function softBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  base: string,
  rim: number = 0.42
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, Math.min(rx, ry) * 0.1, 0, 0, Math.max(rx, ry) * 1.05);
  g.addColorStop(0, mixc(base, '#ffffff', 0.4));
  g.addColorStop(0.45, base);
  g.addColorStop(1, mixc(base, '#2a1408', 0.38));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (rim > 0) {
    ctx.strokeStyle = mixc(base, '#2a1408', rim);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Big glassy eye: coloured iris ring, dark pupil, large catchlight, tiny bounce light. */
export function glossEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  iris: string,
  o: { sclera?: boolean; ring?: string; lookX?: number; lookY?: number; lash?: boolean } = {}
) {
  const lx = (o.lookX ?? 0.4) * r * 0.2;
  const ly = (o.lookY ?? 0) * r * 0.2;
  if (o.sclera) {
    ctx.fillStyle = '#fbfbf4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 40, 20, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const ir = o.sclera ? r * 0.72 : r;
  const g = ctx.createRadialGradient(x + lx, y + ly, ir * 0.15, x + lx, y + ly, ir);
  g.addColorStop(0, mixc(iris, '#000000', 0.55));
  g.addColorStop(0.6, iris);
  g.addColorStop(1, o.ring ?? mixc(iris, '#ffffff', 0.35));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + lx, y + ly, ir, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#120a06';
  ctx.beginPath();
  ctx.arc(x + lx, y + ly, ir * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + lx - ir * 0.3, y + ly - ir * 0.32, ir * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + lx + ir * 0.32, y + ly + ir * 0.34, ir * 0.14, 0, Math.PI * 2);
  ctx.fill();
  if (o.lash) {
    ctx.strokeStyle = '#1a0e08';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, r + 0.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
}
