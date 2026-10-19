/**
 * The Night-Wing Monarch, drawn as what its title says: a giant bat. It faces +x (the caller mirrors it).
 * A fruit-bat build (the flying foxes that roost in the World 8 figs): fox face, big ears, thick shoulder mane,
 * leathery wings with finger bones and a scalloped trailing edge, and a crown. Coordinates are in the boss's
 * local units, centred a little above the floor; the caller scales it 1.5x like the other bosses.
 */
const FUR = '#3a2a5c';
const FUR_HI = '#6a4f96';
const MANE = '#8a6ab8';
const MEMBRANE = '#2a1c4a';
const MEMBRANE_HI = '#4a3478';
const BONE = '#1a1030';

/** one wing: shoulder (sx,sy) -> wrist -> fingertips fanned out, scalloped membrane between them */
function wing(ctx: CanvasRenderingContext2D, sx: number, sy: number, flap: number, near: boolean) {
  // flap in -1..1: 1 = wing up, -1 = wing down
  const up = flap;
  const wristX = sx - 16;
  const wristY = sy - 18 - up * 16;
  const tips: Array<[number, number]> = [
    [sx - 52, sy - 34 - up * 30],
    [sx - 58, sy - 10 - up * 22],
    [sx - 50, sy + 12 - up * 12],
    [sx - 34, sy + 26 - up * 4],
  ];
  const g = ctx.createLinearGradient(sx, sy - 40, sx - 50, sy + 24);
  g.addColorStop(0, near ? MEMBRANE_HI : MEMBRANE);
  g.addColorStop(1, near ? MEMBRANE : '#1a1030');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(wristX, wristY);
  // along the leading edge to the first fingertip, then scallops between tips back to the body
  ctx.lineTo(tips[0][0], tips[0][1]);
  for (let i = 0; i < tips.length - 1; i++) {
    const a = tips[i];
    const b = tips[i + 1];
    ctx.quadraticCurveTo((a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2 + 8, b[0], b[1]);
  }
  ctx.quadraticCurveTo(sx - 16, sy + 22, sx - 2, sy + 12);
  ctx.closePath();
  ctx.fill();
  // finger bones
  ctx.strokeStyle = BONE;
  ctx.lineWidth = near ? 2 : 1.6;
  ctx.lineCap = 'round';
  tips.forEach(([tx, ty]) => {
    ctx.beginPath();
    ctx.moveTo(wristX, wristY);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(wristX, wristY);
  ctx.stroke();
  // wrist thumb claw
  ctx.fillStyle = '#d8d0e8';
  ctx.beginPath();
  ctx.moveTo(wristX, wristY);
  ctx.lineTo(wristX + 5, wristY - 8);
  ctx.lineTo(wristX + 1, wristY + 1);
  ctx.fill();
}

export function drawGiantBat(ctx: CanvasRenderingContext2D, time: number, angry: boolean) {
  const beat = Math.sin(time * (angry ? 9 : 4.2));
  const bob = Math.sin(time * (angry ? 9 : 4.2) + 1.2) * 2.5;
  ctx.save();
  ctx.translate(0, -18 + bob);
  ctx.lineJoin = 'round';

  // far wing (behind the body, a little out of phase)
  wing(ctx, -2, -6, Math.sin(time * (angry ? 9 : 4.2) - 0.5) * 0.9, false);

  // feet, hanging clawed
  ctx.strokeStyle = FUR;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  [[-8, 12], [2, 13]].forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.moveTo(fx, fy - 4);
    ctx.lineTo(fx + 1, fy + 5);
    ctx.stroke();
    ctx.strokeStyle = '#d8d0e8';
    ctx.lineWidth = 1.6;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(fx + 1 + c * 2, fy + 5);
      ctx.lineTo(fx + 1 + c * 3, fy + 10);
      ctx.stroke();
    }
    ctx.strokeStyle = FUR;
    ctx.lineWidth = 3.4;
  });

  // body: a pear of fur, heavy at the shoulders
  const bg = ctx.createRadialGradient(6, -10, 2, 0, -2, 24);
  bg.addColorStop(0, FUR_HI);
  bg.addColorStop(1, FUR);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, -2, 15, 20, -0.25, 0, Math.PI * 2);
  ctx.fill();
  // lighter chest ruff
  ctx.fillStyle = MANE;
  ctx.beginPath();
  ctx.ellipse(9, -6, 9, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // shoulder mane tufts
  ctx.fillStyle = MANE;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(8 + i * 2, -18 + i * 5);
    ctx.lineTo(18 + i * 2, -14 + i * 5);
    ctx.lineTo(10 + i * 2, -10 + i * 5);
    ctx.fill();
  }

  // head: fox muzzle, forward and a little down
  const hx = 20;
  const hy = -22;
  ctx.fillStyle = FUR;
  ctx.beginPath();
  ctx.ellipse(hx, hy, 12, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // muzzle
  ctx.fillStyle = FUR_HI;
  ctx.beginPath();
  ctx.moveTo(hx + 4, hy - 4);
  ctx.quadraticCurveTo(hx + 20, hy - 2, hx + 21, hy + 5);
  ctx.quadraticCurveTo(hx + 12, hy + 10, hx + 2, hy + 7);
  ctx.closePath();
  ctx.fill();
  // nose
  ctx.fillStyle = '#12091f';
  ctx.beginPath();
  ctx.ellipse(hx + 20, hy + 2, 3.4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // ears: tall, pointed, with a pale inner
  [[-4, -1], [5, 3]].forEach(([ox, tilt], i) => {
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(hx + ox - 5, hy - 6);
    ctx.lineTo(hx + ox + tilt - 1, hy - 28 - i * 2);
    ctx.lineTo(hx + ox + 6, hy - 7);
    ctx.fill();
    ctx.fillStyle = '#c8a8e8';
    ctx.beginPath();
    ctx.moveTo(hx + ox - 2, hy - 8);
    ctx.lineTo(hx + ox + tilt, hy - 23 - i * 2);
    ctx.lineTo(hx + ox + 3, hy - 8.5);
    ctx.fill();
  });
  // eye: glowing violet slit, narrower when angry
  ctx.shadowColor = '#d090ff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = angry ? '#ff9ae8' : '#d8a0ff';
  ctx.beginPath();
  ctx.ellipse(hx + 7, hy - 2, 4, angry ? 2 : 3.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a0a2a';
  ctx.beginPath();
  ctx.ellipse(hx + 7.6, hy - 2, 1.2, angry ? 1.8 : 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // mouth and fangs: open and screeching when angry
  ctx.fillStyle = '#12091f';
  ctx.beginPath();
  if (angry) {
    ctx.moveTo(hx + 8, hy + 5);
    ctx.quadraticCurveTo(hx + 20, hy + 6, hx + 20, hy + 7);
    ctx.quadraticCurveTo(hx + 16, hy + 17, hx + 8, hy + 13);
  } else {
    ctx.moveTo(hx + 8, hy + 6);
    ctx.quadraticCurveTo(hx + 16, hy + 9, hx + 20, hy + 7);
    ctx.quadraticCurveTo(hx + 14, hy + 10, hx + 8, hy + 7.5);
  }
  ctx.fill();
  ctx.fillStyle = '#f4efff';
  [[hx + 10, hy + 5.6, 4.2], [hx + 17, hy + 6.6, 4.6]].forEach(([fx, fy, len]) => {
    ctx.beginPath();
    ctx.moveTo(fx - 1.6, fy);
    ctx.lineTo(fx, fy + (angry ? len : len * 0.55));
    ctx.lineTo(fx + 1.6, fy);
    ctx.fill();
  });

  // crown, tilted between the ears
  ctx.save();
  ctx.translate(hx - 1, hy - 11);
  ctx.rotate(-0.12);
  ctx.fillStyle = '#e8a31a';
  ctx.strokeStyle = '#8a5a08';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, 3);
  ctx.lineTo(-8, -6);
  ctx.lineTo(-4, -2);
  ctx.lineTo(0, -9);
  ctx.lineTo(4, -2);
  ctx.lineTo(8, -6);
  ctx.lineTo(8, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c04aff';
  ctx.beginPath();
  ctx.arc(0, -1, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // near wing over the body
  wing(ctx, 4, -8, beat, true);
  ctx.restore();
}
