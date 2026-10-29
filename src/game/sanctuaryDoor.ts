import { FONT_UI } from './fonts.ts';
/**
 * The way out at the end of a stage: each world's own painted gate (stageArt.ts drawGateArt, hf-art-stage 2026-10-29, VI-10), shut while
 * the stage's goal is not done and open after. Shut, a small plate on it says how many are still missing; open, "Touch the door!" floats
 * in the way through.
 *
 * The origin of the call is the old door's origin (its ground 24 below it), so the stage generator, the door-reach test (rules.ts) and
 * the camera are unchanged.
 */
import { drawGateArt, GATE_H } from './stageArt.ts';

/** where the gate's ground-centre lands relative to the call's origin */
const BASE_Y = 24;

/**
 * how many are still missing, on a small wooden plate hung on the shut gate (QA: "the door is sealed but nothing says why"; the HUD's
 * "Sanctuary sealed" is up in the corner, and a player at the door is looking at the door)
 */
let plateN = -1;
let plateText = '';
let plateW = 0;
function missingPlate(ctx: CanvasRenderingContext2D, n: number) {
  ctx.save();
  ctx.font = `700 16px ${FONT_UI}`;
  // (the words and their width only change with the number, so nothing new is made each frame)
  if (n !== plateN) {
    plateN = n;
    plateText = `${n} more`;
    plateW = Math.max(46, ctx.measureText(plateText).width + 18);
  }
  const text = plateText, w = plateW;
  const y = BASE_Y - GATE_H * 0.3;
  const x = -w / 2;
  ctx.fillStyle = '#7a4e26';
  ctx.strokeStyle = '#3a2414';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 23, 6);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3a2414';
  ctx.strokeText(text, 0, y + 12);
  ctx.fillStyle = '#fff3d6';
  ctx.fillText(text, 0, y + 12);
  ctx.restore();
}

/**
 * Draw the gate with its ground-centre BASE_Y below the call's origin. `locked` = shut (the stage's goal is not done yet). `world` picks
 * the world's gate.
 */
export function drawSanctuaryDoor(ctx: CanvasRenderingContext2D, time: number, locked: boolean, missing?: number, world = 1) {
  if (!drawGateArt(ctx, world, BASE_Y, locked, time)) return;
  if (locked) {
    if (missing && missing > 0) missingPlate(ctx, missing);
    // A shut gate says nothing more here: the HUD already shows "Sanctuary sealed", and the text used to collide with it near the top
    // of the screen.
    return;
  }
  const bounce = Math.sin(time * 5) * 4;
  ctx.save();
  ctx.font = `bold 15px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(6,30,22,.85)';
  ctx.lineJoin = 'round';
  const text = 'Touch the door!';
  // (inside the way through, a little over his head, not above the gate: on a phone held sideways the top of the gate is up under the
  // HUD when he stands at it, and the prompt was crowded in with it)
  const y = BASE_Y - GATE_H * 0.62 + bounce;
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
