/**
 * bossCues — what of a boss must still be seen through a lair's dark (2026-10-26, QA: in 3-10's last phase the glowcaps go out and a
 * pounce took two hearts with nothing seen coming). The dark is drawn over the whole scene (lairProwler.ts drawProwlerFront), so this
 * draws the Shadow Prowler again on top of it, faintly while he prowls (a shape at the edge of the moonlight, his eyes glinting) and
 * almost fully lit with flaring eyes once he winds up and while he strikes, so every attack is seen coming in the dark, on a phone held
 * either way (it is drawn in the world, so the camera framing both fighters is what puts it on screen).
 */
import type { BossEntity } from './types.ts';
import type { BossDef } from './bossAI.ts';
import { weakOpen } from './bossAI.ts';
import { drawBossFighter } from './bossArt.ts';
import { POUNCE } from './bossDefs.ts';

/** how much of him is drawn back over the dark (0..1): `dark` is how dark the lair is (0 lit, 1 fully dark) */
export function darkReveal(b: BossEntity, def: BossDef, dark: number): number {
  const st = b.ai?.state;
  if (!st || dark <= 0.02 || b.defeated) return 0;
  // winding up, striking, or open to be hit: lit as if by the moon
  if (st === 'tell' || st === 'act' || weakOpen(b, def)) return 0.85 * dark;
  return 0.4 * dark;
}

/** the boss drawn back over the dark, and his eyes (world space: call it inside the camera transform) */
export function drawBossOverDark(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, world: number, floor: number, time: number, dark: number) {
  const k = darkReveal(b, def, dark);
  const br = b.ai;
  if (k <= 0 || !br) return;
  drawBossFighter(ctx, { ...b, ai: { ...br, alpha: br.alpha * k } }, def, time, world, floor);
  drawPounceRing(ctx, b, def, floor, time, dark);
  // the eyes: two glints at the head, flaring as he winds up (the same spot as his glowing-eyes weak point after a shadow step)
  const winding = br.state === 'tell';
  const f = b.facing < 0 ? -1 : 1;
  const ex = b.x + f * 150;
  const ey = floor - br.air - 100;
  const flare = winding ? 0.75 + 0.25 * Math.sin(time * 30) : 0.45 + 0.15 * Math.sin(time * 2.3);
  ctx.save();
  ctx.globalAlpha = Math.min(1, flare * br.alpha * dark * 1.2);
  ctx.globalCompositeOperation = 'lighter';
  for (const dx of [-9, 9]) {
    const g = ctx.createRadialGradient(ex + dx, ey, 0, ex + dx, ey, winding ? 22 : 12);
    g.addColorStop(0, 'rgba(220, 255, 240, 1)');
    g.addColorStop(0.3, 'rgba(125, 255, 224, 0.8)');
    g.addColorStop(1, 'rgba(125, 255, 224, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ex + dx, ey, winding ? 22 : 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * The spot a pounce will land on: a moonlit ring on the floor from the moment he crouches (he picks it then), so the dodge reads as
 * "get out of the ring" (2026-10-26, QA: a double jump on the spot was hit). Drawn for the Shadow Prowler only, in the world.
 */
export function drawPounceRing(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, floor: number, time: number, alpha = 1) {
  const br = b.ai;
  if (def.lair !== 'prowler' || !br || br.move !== 'pounce' || (br.state !== 'tell' && br.state !== 'act') || br.d.aim === undefined) return;
  const x = br.d.aim;
  // it covers the whole of what hurts when he lands, head and paws included, with a margin (bossReach.test.ts)
  const rw = POUNCE.ring;
  const pulse = 0.5 + 0.5 * Math.sin(time * 14);
  ctx.save();
  // the patch: a strong moonlit pool with a red heart, so it reads as "not here" at a glance (QA: "a faint glowing patch")
  const g = ctx.createRadialGradient(x, floor - 2, 4, x, floor - 2, rw);
  g.addColorStop(0, `rgba(255, 120, 120, ${0.55 * alpha})`);
  g.addColorStop(0.55, `rgba(220, 250, 255, ${0.42 * alpha})`);
  g.addColorStop(1, `rgba(220, 250, 255, ${0.12 * alpha})`);
  ctx.translate(x, floor - 2);
  ctx.scale(1, 0.12);
  ctx.translate(-x, -(floor - 2));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, floor - 2, rw, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = '#7dffe0';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6 + 2 * pulse;
  ctx.beginPath();
  ctx.ellipse(x, floor - 2, rw, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 10]);
  ctx.lineDashOffset = -time * 70;
  ctx.beginPath();
  ctx.ellipse(x, floor - 2, rw - 14, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  // chevrons over the edges, pointing out: get out this way
  ctx.setLineDash([]);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  for (const d of [-1, 1]) {
    const cx = x + d * (rw + 26 + 8 * pulse);
    ctx.beginPath();
    ctx.moveTo(cx - d * 12, floor - 34);
    ctx.lineTo(cx, floor - 22);
    ctx.lineTo(cx - d * 12, floor - 10);
    ctx.stroke();
  }
  ctx.restore();
}
