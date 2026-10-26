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
