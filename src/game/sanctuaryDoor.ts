import { FONT_UI } from './fonts.ts';
/**
 * The sanctuary door at the end of a stage: a mossy stone temple arch with carved runes, hung with vines and
 * hibiscus. Open, it holds a swirling emerald portal; sealed, it is bound with vines and a golden padlock.
 *
 * Drawn from one design (260 x 340 units, ground at y = 306, door opening 92..168 wide) that is scaled to the
 * world in `drawSanctuaryDoor`. The origin of the call is the old door's origin, so the stage generator, the
 * door-reach test (rules.ts) and the camera are unchanged.
 */

const SCALE = 0.72;
/** where the design's ground-centre lands relative to the call's origin */
const BASE_Y = 24;

const paths = new Map<string, Path2D>();
const P = (d: string): Path2D => {
  let p = paths.get(d);
  if (!p) {
    p = new Path2D(d);
    paths.set(d, p);
  }
  return p;
};

const OPENING = 'M92 276V126A38 38 0 0 1 168 126V276Z';
const VOUSSOIRS: Array<{ d: string; fill: string }> = [
  { d: 'M62 126A68 68 0 0 1 68.7 96.5L95.8 109.5A38 38 0 0 0 92 126Z', fill: '#cdbd9c' },
  { d: 'M68.7 96.5A68 68 0 0 1 87.6 72.8L106.3 96.3A38 38 0 0 0 95.8 109.5Z', fill: '#c0af8d' },
  { d: 'M87.6 72.8A68 68 0 0 1 114.9 59.7L121.5 89A38 38 0 0 0 106.3 96.3Z', fill: '#cdbd9c' },
  { d: 'M145.1 59.7A68 68 0 0 1 172.4 72.8L153.7 96.3A38 38 0 0 0 138.5 89Z', fill: '#cdbd9c' },
  { d: 'M172.4 72.8A68 68 0 0 1 191.3 96.5L164.2 109.5A38 38 0 0 0 153.7 96.3Z', fill: '#c0af8d' },
  { d: 'M191.3 96.5A68 68 0 0 1 198 126L168 126A38 38 0 0 0 164.2 109.5Z', fill: '#cdbd9c' },
  { d: 'M114.9 59.7A68 68 0 0 1 145.1 59.7L138.5 89A38 38 0 0 0 121.5 89Z', fill: '#e0d2b2' },
];
const BLOCK_LINES =
  'M62 150H92M62 176H92M62 202H92M62 228H92M62 250H92M168 150H198M168 176H198M168 202H198M168 228H198M168 250H198' +
  'M74 124V150M82 150V176M72 176V202M84 202V228M76 228V250M186 124V150M178 150V176M188 176V202M176 202V228M184 228V250';
const RUNES =
  'M72 140q5 -6 10 0q-5 6 -10 0M71 164l11 0m-5.5 -6v12M72 190a5 5 0 1 1 10 0a3 3 0 1 1 -6 0M71 214l5 -8 5 8m-8 -3h6M72 238l10 0m-10 -5l10 10' +
  'M178 140q5 -6 10 0q-5 6 -10 0M177 164l11 0m-5.5 -6v12M178 190a5 5 0 1 1 10 0a3 3 0 1 1 -6 0M177 214l5 -8 5 8m-8 -3h6M178 238l10 0m-10 -5l10 10';
const MOSS: Array<{ d: string; fill: string }> = [
  { d: 'M55 276q4 -14 12 -10q4 -12 12 -4q6 -10 14 2q3 6 -2 12z', fill: '#5aa845' },
  { d: 'M161 276q4 -14 12 -10q4 -12 12 -4q6 -10 14 2q3 6 -2 12z', fill: '#5aa845' },
  { d: 'M58 122q8 -10 20 -4q10 -8 20 2l-2 8h-36z', fill: '#67b84f' },
  { d: 'M162 122q8 -10 20 -4q10 -8 20 2l-2 8h-36z', fill: '#67b84f' },
  { d: 'M118 58q6 -8 14 -2q8 -4 12 4l-4 4h-18z', fill: '#67b84f' },
];
const MOSS_DRIPS = 'M70 126q-2 12 1 20M80 126q0 8 -1 14M96 112q-1 8 1 12M164 112q1 8 -1 12M186 126q2 10 0 18M194 126q-1 8 1 12';
const VINES = ['M50 70C52 110 40 130 52 170S48 230 56 262', 'M60 56C80 46 100 58 118 52', 'M206 78C208 120 216 150 204 190S212 236 206 264'];
const LEAVES: Array<[number, number, number]> = [
  [46, 96, -35], [56, 124, 30], [44, 152, -30], [50, 196, 30], [54, 236, -25], [72, 52, -20], [96, 56, 25],
  [212, 104, 30], [214, 160, -30], [210, 214, 30], [208, 248, -25],
];
const BLOSSOMS: Array<[number, number, string]> = [
  [44, 118, '#f472b6'], [214, 132, '#fb923c'], [52, 214, '#f472b6'], [206, 226, '#f472b6'],
];
const GRASS = 'M28 308l4 -16l4 16zM38 308l3 -12l5 12zM214 308l4 -14l4 14zM224 308l3 -17l4 17zM232 308l4 -11l3 11zM20 308l3 -10l4 10z';

const SEAL_VINES = ['M88 150C112 176 148 168 172 196', 'M172 158C148 184 112 178 88 208', 'M88 232C120 214 146 244 172 226', 'M130 92V270'];

function frame(ctx: CanvasRenderingContext2D, time: number, locked: boolean) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const edge = '#5b4a35';

  // steps
  const stepG = ctx.createLinearGradient(0, 288, 0, 306);
  stepG.addColorStop(0, '#d2c1a0');
  stepG.addColorStop(1, '#a39172');
  ctx.fillStyle = stepG;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2.4;
  ctx.fill(P('M36 306L40 288H220L224 306Z'));
  ctx.stroke(P('M36 306L40 288H220L224 306Z'));
  ctx.fillStyle = '#c8b794';
  ctx.fill(P('M50 288L54 272H206L210 288Z'));
  ctx.stroke(P('M50 288L54 272H206L210 288Z'));
  ctx.strokeStyle = 'rgba(143,126,98,.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke(P('M44 296H216M58 280H202'));

  // pillars and their bases
  for (const x of [62, 168]) {
    const g = ctx.createLinearGradient(x, 0, x + 30, 0);
    g.addColorStop(0, '#d9c9a8');
    g.addColorStop(0.55, '#b9a685');
    g.addColorStop(1, '#8f7e62');
    ctx.fillStyle = g;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(x, 124, 30, 150, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#b9a685';
    ctx.beginPath();
    ctx.roundRect(x - 7, 262, 44, 14, 3);
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(107,90,67,.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke(P(BLOCK_LINES));

  // the arch
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2.4;
  for (const v of VOUSSOIRS) {
    ctx.fillStyle = v.fill;
    ctx.fill(P(v.d));
    ctx.stroke(P(v.d));
  }
  // capitals
  ctx.fillStyle = '#cdbb99';
  for (const x of [55, 161]) {
    ctx.beginPath();
    ctx.roundRect(x, 116, 44, 12, 3);
    ctx.fill();
    ctx.stroke();
  }

  // the carved sun on the keystone (it glows when the door is open)
  const sunG = ctx.createLinearGradient(120, 65, 140, 85);
  sunG.addColorStop(0, '#fde68a');
  sunG.addColorStop(1, '#d4972a');
  if (!locked) {
    ctx.save();
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10 + Math.sin(time * 3) * 4;
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(130, 75, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = locked ? '#a8a29e' : sunG;
  ctx.strokeStyle = '#7c5a14';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(130, 75, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineCap = 'round';
  ctx.stroke(P('M130 62.5v-3M130 87.5v3M117.5 75h-3M142.5 75h3M121 66l-2-2M139 66l2-2M121 84l-2 2M139 84l2 2'));
  ctx.fillStyle = 'rgba(124,90,20,.55)';
  ctx.beginPath();
  ctx.arc(130, 75, 3.6, 0, Math.PI * 2);
  ctx.fill();

  // runes: they glow when open, and sit dull and grey while the door is sealed
  ctx.save();
  ctx.lineWidth = 2.6;
  if (locked) {
    ctx.strokeStyle = 'rgba(122,135,148,.85)';
    ctx.stroke(P(RUNES));
  } else {
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#6ee7b7';
    ctx.globalAlpha = 0.72 + Math.sin(time * 4) * 0.28;
    ctx.stroke(P(RUNES));
  }
  ctx.restore();

  // moss
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#2f6b2b';
  for (const m of MOSS) {
    ctx.fillStyle = m.fill;
    ctx.fill(P(m.d));
    ctx.stroke(P(m.d));
  }
  ctx.strokeStyle = '#3f8a3a';
  ctx.lineWidth = 2;
  ctx.stroke(P(MOSS_DRIPS));

  // vines draped over the sides and the top
  ctx.strokeStyle = '#3d7a35';
  ctx.lineWidth = 3.4;
  for (const v of VINES) ctx.stroke(P(v));
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#1f6b3a';
  ctx.lineWidth = 1.1;
  for (const [x, y, deg] of LEAVES) {
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 3.6, (deg * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // hibiscus
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#9d174d';
  for (const [bx, by, col] of BLOSSOMS) {
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(bx + Math.cos(a) * 5, by + Math.sin(a) * 5, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // grass and a couple of flowers in front
  ctx.fillStyle = '#58b447';
  ctx.strokeStyle = '#2f7a2e';
  ctx.lineWidth = 1;
  ctx.fill(P(GRASS));
  ctx.stroke(P(GRASS));
  ctx.fillStyle = '#fde047';
  for (const [x, y] of [[34, 296], [226, 294]]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function portal(ctx: CanvasRenderingContext2D, time: number) {
  // a column of light rising out of the doorway
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;
  const ray = ctx.createLinearGradient(0, 200, 0, -10);
  ray.addColorStop(0, `rgba(167,243,208,${0.55 * pulse})`);
  ray.addColorStop(1, 'rgba(167,243,208,0)');
  ctx.fillStyle = ray;
  ctx.beginPath();
  ctx.moveTo(130, 200);
  ctx.lineTo(40, -10);
  ctx.lineTo(220, -10);
  ctx.closePath();
  ctx.fill();

  // the doorway: deep emerald at the rim, white-hot in the middle
  const g = ctx.createRadialGradient(130, 207, 0, 130, 207, 90);
  g.addColorStop(0, '#f0fff8');
  g.addColorStop(0.25, '#8af0c4');
  g.addColorStop(0.6, '#18a37a');
  g.addColorStop(1, '#064e3b');
  ctx.fillStyle = g;
  ctx.fill(P(OPENING));

  ctx.save();
  ctx.clip(P(OPENING));
  ctx.strokeStyle = '#d1fae5';
  ctx.lineCap = 'round';
  const swirls: Array<[number, number, number, number, number, number]> = [
    [30, 64, 2.6, 26, 14, -0.21],
    [21, 46, 2.4, 18, 12, 0.24],
    [12, 28, 2.2, 12, 9, -0.35],
  ];
  swirls.forEach(([rx, ry, lw, dash, gap, rot], i) => {
    ctx.save();
    ctx.translate(130, 200);
    ctx.rotate(rot + Math.sin(time * (0.9 + i * 0.3) + i) * 0.35);
    ctx.lineWidth = lw;
    ctx.globalAlpha = 0.8 + i * 0.05;
    ctx.setLineDash([dash, gap]);
    ctx.lineDashOffset = -time * (14 + i * 9) * (i % 2 ? -1 : 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
  ctx.setLineDash([]);
  // a soft bright core
  const core = ctx.createRadialGradient(130, 204, 0, 130, 204, 34);
  core.addColorStop(0, `rgba(255,255,255,${0.8 * pulse})`);
  core.addColorStop(1, 'rgba(110,231,183,0)');
  ctx.fillStyle = core;
  ctx.fillRect(92, 120, 76, 160);
  ctx.restore();
}

function sealed(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0f1f1b';
  ctx.fill(P(OPENING));
  const g = ctx.createRadialGradient(130, 200, 0, 130, 200, 80);
  g.addColorStop(0, '#1f3b34');
  g.addColorStop(1, '#0b1a17');
  ctx.fillStyle = g;
  ctx.fill(P(OPENING));
  ctx.save();
  ctx.clip(P(OPENING));
  ctx.lineCap = 'round';
  for (const [dark, w] of [['#3b2d17', 9], ['#5f7d2a', 4]] as const) {
    ctx.strokeStyle = dark;
    SEAL_VINES.forEach((d, i) => {
      ctx.lineWidth = i === 3 ? (dark === '#3b2d17' ? 7 : 3) : w;
      ctx.stroke(P(d));
    });
  }
  ctx.fillStyle = '#7a9a32';
  ctx.strokeStyle = '#3b2d17';
  ctx.lineWidth = 1;
  for (const d of ['M100 168l-4 -8 8 3z', 'M158 176l4 -8 -8 3z', 'M104 216l-3 -8 7 2z', 'M154 228l5 -7 -8 1z']) {
    ctx.fill(P(d));
    ctx.stroke(P(d));
  }
  ctx.restore();
}

function padlock(ctx: CanvasRenderingContext2D) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#b9770e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(118, 188);
  ctx.lineTo(118, 179);
  ctx.arc(130, 179, 12, Math.PI, 0);
  ctx.lineTo(142, 188);
  ctx.stroke();
  const g = ctx.createLinearGradient(112, 186, 148, 216);
  g.addColorStop(0, '#fde68a');
  g.addColorStop(1, '#d4972a');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#7c5a14';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(112, 186, 36, 30, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4a3410';
  ctx.beginPath();
  ctx.arc(130, 198, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(128.2, 199, 3.6, 9, 1.4);
  ctx.fill();
}

/**
 * The new HUD (beta): a small carved plate under the padlock with how many are still missing ("3 more"), so a sealed door says
 * why it is shut to a player who never looked up at the counter (HUD spec D, "the goal in the world").
 */
let plateN = -1;
let plateText = '';
let plateW = 0;
function missingPlate(ctx: CanvasRenderingContext2D, n: number) {
  ctx.save();
  ctx.font = `700 21px ${FONT_UI}`;
  // (the words and their width only change with the number, so nothing new is made each frame)
  if (n !== plateN) {
    plateN = n;
    plateText = `${n} more`;
    plateW = Math.max(62, ctx.measureText(plateText).width + 24);
  }
  const text = plateText, w = plateW;
  const x = 130 - w / 2, y = 222;
  ctx.fillStyle = '#7a4e26';
  ctx.strokeStyle = '#3a2414';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 31, 8);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,170,.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 5);
  ctx.lineTo(x + w - 6, y + 5);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#3a2414';
  ctx.strokeText(text, 130, y + 16.5);
  ctx.fillStyle = '#fff3d6';
  ctx.fillText(text, 130, y + 16.5);
  ctx.restore();
}

/** drifting sparkles around an open door */
function motes(ctx: CanvasRenderingContext2D, time: number) {
  const spots: Array<[number, number, number]> = [[82, 104, 0], [188, 92, 1.7], [104, 40, 3.1], [160, 34, 4.4], [64, 250, 5.2], [130, 150, 2.4], [112, 230, 0.9]];
  for (const [x, y, ph] of spots) {
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 2.2 + ph));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + Math.sin(time * 0.8 + ph) * 3, y - ((time * 6 + ph * 10) % 14), 2.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw the door with its ground-centre at the call's origin (translated down by BASE_Y).
 * `locked` = sealed (the stage's goal is not done yet).
 */
export function drawSanctuaryDoor(ctx: CanvasRenderingContext2D, time: number, locked: boolean, missing?: number) {
  ctx.save();
  ctx.translate(0, BASE_Y);
  ctx.scale(SCALE, SCALE);
  ctx.translate(-130, -306);

  if (locked) sealed(ctx);
  else portal(ctx, time);
  frame(ctx, time, locked);
  if (locked) padlock(ctx);
  else motes(ctx, time);
  if (locked && missing && missing > 0) missingPlate(ctx, missing);

  ctx.restore();

  // the prompt floating above the arch (it bobs; the door itself stays still). A sealed door says nothing here: the HUD
  // already shows "Sanctuary sealed", and the text used to collide with it near the top of the screen.
  if (locked) return;
  const bounce = Math.sin(time * 5) * 4;
  ctx.save();
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(6,30,22,.85)';
  ctx.lineJoin = 'round';
  const text = 'Touch the door!';
  // (inside the glowing arch, a little over his head, not above the door: on a phone held sideways the top of the arch is up under the
  // HUD when he stands at the door, and the prompt was crowded in with it)
  const y = BASE_Y + (150 - 306) * SCALE + bounce;
  ctx.strokeText(text, 0, y);
  ctx.fillStyle = '#fde047';
  ctx.fillText(text, 0, y);
  ctx.beginPath();
  ctx.moveTo(-6, y + 12);
  ctx.lineTo(6, y + 12);
  ctx.lineTo(0, y + 19);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
