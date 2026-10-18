import type { PlayerState, Enemy, BossEntity, Collectible } from './types.ts';

/**
 * Ultra-Upgraded Procedural Vector Character & Entity Renderer
 * Features rich multi-tone textures, martial arts hero bandana with trailing flutter ribbons,
 * glossy anime eyes, detailed anatomy, and expressive enemy personalities.
 */

// Helper to draw a rich glossy eye with dual specular catchlights & iris gradient
function drawGlossyEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  pupilDx: number = 0,
  pupilDy: number = 0,
  isBlinking: boolean = false
) {
  if (isBlinking) {
    ctx.strokeStyle = '#2b1d0c';
    ctx.lineWidth = Math.max(2.2, radius * 0.4);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.2, radius * 0.9, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    return;
  }

  // Sclera / eye background
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dark Amber-Brown Iris
  const irisRadius = radius * 0.82;
  const irisX = x + pupilDx * radius * 0.25;
  const irisY = y + pupilDy * radius * 0.25;

  const grad = ctx.createRadialGradient(
    irisX, irisY, irisRadius * 0.15,
    irisX, irisY, irisRadius
  );
  grad.addColorStop(0, '#92400e');
  grad.addColorStop(0.35, '#78350f');
  grad.addColorStop(0.85, '#291404');
  grad.addColorStop(1, '#0c0a09');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#050302';
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisRadius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Primary Big Catchlight (glossy shine)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(irisX - irisRadius * 0.35, irisY - irisRadius * 0.35, irisRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary Small Catchlight
  ctx.beginPath();
  ctx.arc(irisX + irisRadius * 0.35, irisY + irisRadius * 0.3, irisRadius * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Procedural Vector Renderer for Upgraded Hero Sloth
 * Full of charm, energy, and personality:
 * - Dynamic crimson martial-arts headband with fluttering trailing tails
 * - Layered plush chestnut/honey fur with soft tufts
 * - Soulful dark teardrop eye patches and warm hero smile
 * - 3 sharp curved ivory claws on hands and feet
 * - Dynamic anime slash trails and dropkick aura
 */
export function drawHeroSloth(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  time: number
) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Dynamic vine swinging rotation
  if (p.isVineSwinging && p.swingAngle !== undefined) {
    ctx.rotate(p.swingAngle * 0.75);
  }

  // Ground Drop Shadow on Platform
  if (p.grounded && !p.climbing && !p.isVineSwinging) {
    ctx.save();
    const shadowScale = (1 / p.squashY) * (p.ducking ? 1.35 : 1.05);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.scale(p.facing * p.squashX, p.squashY);

  // Mid-air somersault rotation when double jumping
  if (p.isDoubleJumping) {
    ctx.rotate(p.somersaultAngle);

    // Somersault glowing leaf vortex halo
    ctx.save();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -25, 42, time * 14, time * 14 + Math.PI * 1.4);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -25, 36, -time * 12, -time * 12 + Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }

  const isRunning = p.grounded && Math.abs(p.vx) > 10;
  const bob = isRunning
    ? Math.sin(p.walkCycle * 2) * 3.2
    : Math.sin(time * 3.2) * 1.6;
  const isHurt = p.invincibleTimer > 0;
  const isBlinking = !isHurt && Math.sin(time * 1.8) > 0.95;

  // Hurt flash
  if (isHurt && Math.floor(time * 24) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }

  // --- ACTIVE POWER-UP AURAS ---
  if (p.activePowerUp === 'speed') {
    // Neon Emerald Cheetah Speed Wind Stream
    ctx.save();
    const windPhase = time * 14;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    for (let w = 0; w < 3; w++) {
      const wy = -38 + w * 14;
      const wx = -p.facing * (28 + Math.sin(windPhase + w) * 16);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx - p.facing * 35, wy + Math.sin(windPhase + w * 2) * 5);
      ctx.stroke();
    }
    // Speed afterimage glow
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -25, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (p.activePowerUp === 'invincible') {
    // Dazzling Golden Solar Radiance Aura
    ctx.save();
    const pulse = Math.sin(time * 12) * 0.15 + 0.85;
    const starAngle = time * 4;
    const auraGrad = ctx.createRadialGradient(0, -26, 8, 0, -26, 62 * pulse);
    auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
    auraGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.45)');
    auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -26, 62 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Golden Stars
    for (let s = 0; s < 4; s++) {
      const sa = starAngle + (s * Math.PI) / 2;
      const sx = Math.cos(sa) * 44;
      const sy = -26 + Math.sin(sa) * 32;
      ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 4.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (p.activePowerUp === 'magnet') {
    // Bioluminescent Violet-Cyan Magnetic Rings
    ctx.save();
    const ring1 = (time * 2.5) % 1;
    const ring2 = (time * 2.5 + 0.5) % 1;
    [ring1, ring2].forEach((r) => {
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - r})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, -26, 25 + r * 35, 18 + r * 25, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Mega Punch Whirlwind Aura
  if (p.punching && p.punchType === 'mega') {
    ctx.save();
    const auraGrad = ctx.createRadialGradient(0, -25, 10, 0, -25, 75);
    auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
    auraGrad.addColorStop(0.5, 'rgba(74, 222, 128, 0.35)');
    auraGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -25, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -25, 55, time * 12, time * 12 + Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // --- 1. DUCKING STANCE (Adorable Furry Ball) ---
  // ==========================================
  if (p.ducking) {
    // Round cuddly fur ball
    const duckGrad = ctx.createRadialGradient(0, -14, 4, 0, -14, 26);
    duckGrad.addColorStop(0, '#be8753');
    duckGrad.addColorStop(0.7, '#925c2b');
    duckGrad.addColorStop(1, '#653813');
    ctx.fillStyle = duckGrad;
    ctx.beginPath();
    ctx.ellipse(0, -14, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft Cream Tummy Patch underneath
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(2, -10, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head curled down cutely
    ctx.fillStyle = '#be8753';
    ctx.beginPath();
    ctx.arc(10, -18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Dark-brown teardrop eye mask
    ctx.fillStyle = '#3c2010';
    ctx.beginPath();
    ctx.ellipse(14, -18, 9, 6.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Peeking glossy eye
    drawGlossyEye(ctx, 15, -18, 5.0, 0.5, -0.1, false);

    // Cute cream snout & nose
    ctx.fillStyle = '#fff0dd';
    ctx.beginPath();
    ctx.ellipse(20, -14, 6.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(22, -15, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // 3 Curled pearly paws
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#573315';
    ctx.lineWidth = 0.8;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(18 + c * 3.8, -4, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  // ==========================================
  // --- 2. CLIMBING STANCE (Hugging Tree Vine) ---
  // ==========================================
  if (p.climbing) {
    const climbSwing = Math.sin(time * 8.0);

    // Chubby cuddly body hugging the tree
    const bodyGrad = ctx.createRadialGradient(0, -26, 4, 0, -26, 28);
    bodyGrad.addColorStop(0, '#c7925e');
    bodyGrad.addColorStop(0.7, '#966030');
    bodyGrad.addColorStop(1, '#653813');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -26, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft Cream Tummy Patch
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(0, -24, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Alternating Climbing Arms hugging tree trunk
    const leftArmY = -42 + climbSwing * 10;
    const rightArmY = -42 - climbSwing * 10;

    ctx.strokeStyle = '#966030';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';

    // Left Arm
    ctx.beginPath();
    ctx.moveTo(-6, -32);
    ctx.quadraticCurveTo(-18, leftArmY + 6, -12, leftArmY);
    ctx.stroke();

    // Right Arm
    ctx.beginPath();
    ctx.moveTo(6, -32);
    ctx.quadraticCurveTo(18, rightArmY + 6, 12, rightArmY);
    ctx.stroke();

    // 3 Curved Ivory Claws gripping vine on hands
    [-12, 12].forEach((handX, i) => {
      const handY = i === 0 ? leftArmY : rightArmY;
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#573315';
      ctx.lineWidth = 0.8;
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.ellipse(handX + c * 3.2, handY - 2, 2.2, 4.2, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Cute Round Head looking up
    ctx.fillStyle = '#be8753';
    ctx.beginPath();
    ctx.arc(0, -45, 18, 0, Math.PI * 2);
    ctx.fill();

    // Soft round ears
    ctx.fillStyle = '#8c5a32';
    ctx.beginPath();
    ctx.arc(-15, -46, 5, 0, Math.PI * 2);
    ctx.arc(15, -46, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(-15, -46, 2.5, 0, Math.PI * 2);
    ctx.arc(15, -46, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Two distinct teardrop dark-brown eye masks angled cutely
    ctx.fillStyle = '#3c2010';
    ctx.beginPath();
    ctx.ellipse(-7, -46, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(7, -46, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    drawGlossyEye(ctx, -7, -46, 4.6, 0, -0.8, isBlinking);
    drawGlossyEye(ctx, 7, -46, 4.6, 0, -0.8, isBlinking);

    // Cute smiling peach muzzle
    ctx.fillStyle = '#fff0dd';
    ctx.beginPath();
    ctx.ellipse(0, -39, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(0, -41, 4.0, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // ==========================================
  // --- 3. NORMAL RUN / JUMP / PUNCH STANCE ---
  // ==========================================
  const legAngle = p.grounded ? Math.sin(p.walkCycle) * 0.45 : 0.30;

  // Back Leg
  ctx.save();
  ctx.translate(-7, -14);
  ctx.rotate(-legAngle);
  ctx.fillStyle = '#78461b';
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // 3 Curved Back Claws
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#573315';
  ctx.lineWidth = 0.8;
  for (let c = -1; c <= 1; c++) {
    ctx.beginPath();
    ctx.ellipse(c * 3.4, 20, 2.0, 3.8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Back Arm
  ctx.save();
  ctx.translate(-5, -28 + bob);
  const backArmAngle = p.grounded ? -Math.sin(p.walkCycle) * 0.50 : -0.35;
  ctx.rotate(backArmAngle);
  ctx.fillStyle = '#78461b';
  ctx.beginPath();
  ctx.ellipse(0, 12, 7, 13, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Hero Blossom or Red Quest Ribbon behind ear
  ctx.save();
  const ribbonWind = Math.sin(time * 8) * 3;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-11, -50 + bob, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-11, -50 + bob, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Cute fluttering quest ribbon tail
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, -50 + bob);
  ctx.quadraticCurveTo(-19, -48 + bob + ribbonWind, -26, -44 + bob);
  ctx.stroke();
  ctx.restore();

  // Plush, Huggable Rounded Body
  const bodyGrad = ctx.createRadialGradient(2, -26 + bob, 4, 2, -26 + bob, 27);
  bodyGrad.addColorStop(0, '#dcb285');
  bodyGrad.addColorStop(0.65, '#a57342');
  bodyGrad.addColorStop(1, '#653813');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -26 + bob, 22, 26, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Soft Cream Chest & Tummy Patch
  const chestGrad = ctx.createRadialGradient(5, -24 + bob, 2, 5, -24 + bob, 15);
  chestGrad.addColorStop(0, '#fff6ec');
  chestGrad.addColorStop(0.75, '#fed7aa');
  chestGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(5, -23 + bob, 14, 16, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Front Leg / Kick
  ctx.save();
  ctx.translate(7, -14);
  if (p.kicking) {
    // Flying Kung-Fu Dropkick extension!
    const kickProgress = p.kickTimer / 0.28;
    const kickReach = Math.sin(kickProgress * Math.PI) * 26;
    ctx.rotate(0.82);
    ctx.translate(kickReach, 0);

    ctx.fillStyle = '#a57342';
    ctx.beginPath();
    ctx.ellipse(9, 0, 11, 22, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // 3 Sharp Curved Sloth Kick Claws!
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(18, c * 6.0);
      ctx.quadraticCurveTo(32, c * 7.0 + 1, 36, c * 5.0);
      ctx.quadraticCurveTo(25, c * 2.8, 18, c * 2.8);
      ctx.fill();
      ctx.stroke();
    }

    // Fiery Kick Speed Flame Arc
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(20, 0, 20, -0.45 * Math.PI, 0.45 * Math.PI);
    ctx.stroke();
  } else {
    ctx.rotate(legAngle);
    ctx.fillStyle = '#966030';
    ctx.beginPath();
    ctx.ellipse(0, 10, 8, 14, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3 Curved Front Foot Claws
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#573315';
    ctx.lineWidth = 0.8;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.ellipse(c * 3.4, 20, 2.0, 3.8, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();

  // Cute Rounded Head
  ctx.save();
  ctx.translate(8, -45 + bob);

  // Soft Head Fur
  const headGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
  headGrad.addColorStop(0, '#dcb285');
  headGrad.addColorStop(0.7, '#a57342');
  headGrad.addColorStop(1, '#6f421a');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy Cheek Tufts
  ctx.fillStyle = '#a57342';
  ctx.beginPath();
  ctx.ellipse(-14, 4, 5.5, 7.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Soft Round Ears with Pink Inside
  ctx.fillStyle = '#8c5a32';
  ctx.beginPath();
  ctx.arc(-14, -13, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(-14, -13, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Two Signature Sloth Teardrop Eye Masks
  ctx.fillStyle = '#3c2010';
  ctx.beginPath();
  ctx.ellipse(4, -1, 10, 7.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Soft Cream Muzzle
  const muzzleGrad = ctx.createRadialGradient(9, 4, 2, 9, 4, 12);
  muzzleGrad.addColorStop(0, '#fffdfa');
  muzzleGrad.addColorStop(0.85, '#fff0dd');
  muzzleGrad.addColorStop(1, '#fed7aa');
  ctx.fillStyle = muzzleGrad;
  ctx.beginPath();
  ctx.ellipse(8, 5, 11, 8.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shiny Button Nose
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(12, 3.5, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(11, 2.8, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Joyful Hero Smile
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(8, 6.2, 5.0, 0.15 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();

  // Sweet Rosy Cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
  ctx.beginPath();
  ctx.arc(3, 7, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Soulful Glossy Eye with Dual Catchlights
  if (isHurt) {
    ctx.strokeStyle = '#2b1608';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(1, -3);
    ctx.lineTo(6, 0);
    ctx.lineTo(1, 3);
    ctx.stroke();
  } else {
    drawGlossyEye(ctx, 4, -1, 6.4, p.facing * 0.45, 0, isBlinking);
  }

  ctx.restore();

  // Front Arm / Claw Punch
  ctx.save();
  ctx.translate(7, -28 + bob);

  if (p.punching) {
    const punchProgress = p.punchTimer / (p.punchType === 'mega' ? 0.35 : 0.22);
    const punchExtension = Math.sin(punchProgress * Math.PI) * 28;

    ctx.translate(punchExtension, 0);

    // Punch Arm
    ctx.fillStyle = '#a57342';
    ctx.beginPath();
    ctx.ellipse(9, 0, 17, 8.0, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3 Sharp Curved Sloth Claws Striking!
    ctx.fillStyle = p.punchType === 'mega' ? '#fef08a' : '#fef3c7';
    ctx.strokeStyle = p.punchType === 'mega' ? '#ca8a04' : '#78350f';
    ctx.lineWidth = 1.5;

    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(23, c * 5.2);
      ctx.quadraticCurveTo(36, c * 6.2 + 1, 40, c * 4.2);
      ctx.quadraticCurveTo(30, c * 2.8, 23, c * 2.8);
      ctx.fill();
      ctx.stroke();
    }

    // Glowing Slash Speed Arc
    ctx.save();
    ctx.strokeStyle = p.punchType === 'mega'
      ? 'rgba(250, 204, 21, 0.95)'
      : 'rgba(52, 211, 153, 0.92)';
    ctx.lineWidth = p.punchType === 'mega' ? 6.5 : 4.0;
    ctx.beginPath();
    ctx.arc(28, 0, 22, -0.45 * Math.PI, 0.45 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(30, 0, 18, -0.3 * Math.PI, 0.3 * Math.PI);
    ctx.stroke();
    ctx.restore();
  } else {
    // Idle / Running Arm
    const frontArmAngle = p.grounded ? Math.sin(p.walkCycle) * 0.50 : 0.35;
    ctx.rotate(frontArmAngle);
    ctx.fillStyle = '#a57342';
    ctx.beginPath();
    ctx.ellipse(3, 12, 7.0, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Relaxed Claws
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#573315';
    ctx.lineWidth = 0.8;
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.ellipse(c * 3.4, 23, 2.0, 4.0, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
  ctx.restore();
}

/**
 * Procedural Vector Renderer for Emerald Tree Snake / Golden Boa
 * Dynamic diamond scales, golden belly plates, big expressive glossy eyes,
 * pink forked flickering tongue, and spring-loaded coiled strike posture!
 */
export function drawTreeSnake(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);

  if (enemy.hitFlashTimer > 0) {
    ctx.filter = 'brightness(2.2)';
  }

  const isCoiled = enemy.isAttacking;
  const undulate = Math.sin(time * 6 + enemy.id) * 3;

  // Snake Drop Shadow on branch
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snake Body: Lush Emerald Green with Gold Belly Underlayer
  ctx.strokeStyle = '#15803d'; // Emerald Green
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  if (isCoiled) {
    ctx.moveTo(-18, 0);
    ctx.bezierCurveTo(-10, -18, 10, -18, 14, 0);
    ctx.bezierCurveTo(18, 12, 0, 16, -6, 8);
  } else {
    ctx.moveTo(-22, undulate * 0.5);
    ctx.quadraticCurveTo(-10, -8 + undulate, 4, undulate * 0.7);
    ctx.quadraticCurveTo(16, 6 - undulate, 22, -2);
  }
  ctx.stroke();

  // Yellow-Gold Belly Under-Scales
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4.2;
  ctx.stroke();

  // Diamond Pattern on Spine
  ctx.fillStyle = '#166534';
  [-12, -4, 4, 12].forEach(dx => {
    ctx.beginPath();
    ctx.moveTo(dx, -2 + undulate * 0.4);
    ctx.lineTo(dx + 3, -5 + undulate * 0.4);
    ctx.lineTo(dx + 6, -2 + undulate * 0.4);
    ctx.lineTo(dx + 3, 1 + undulate * 0.4);
    ctx.closePath();
    ctx.fill();
  });

  // Expressive Snake Head
  const headX = 22;
  const headY = -2 + (isCoiled ? -8 : undulate * 0.5);

  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(headX, headY, 12, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Cheek scale spots
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(headX - 4, headY - 3, 2.5, 0, Math.PI * 2);
  ctx.arc(headX - 6, headY + 3, 2, 0, Math.PI * 2);
  ctx.fill();

  // Big Glossy Anime Eyes
  drawGlossyEye(ctx, headX + 2, headY - 3, 4.8, 0.6, 0, false);

  // Forked pink tongue flicking out
  if (Math.sin(time * 8 + enemy.id) > 0.4) {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX + 11, headY);
    ctx.lineTo(headX + 18, headY);
    ctx.lineTo(headX + 21, headY - 3);
    ctx.moveTo(headX + 18, headY);
    ctx.lineTo(headX + 21, headY + 3);
    ctx.stroke();
  }

  // Attack Telegraph Warning
  if (enemy.telegraphTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(headX, headY, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Harpy Eagle / Sky Predator
 * Overhauled with majestic presence, royal feather crest, articulated layered wings,
 * fierce raptor beak, and distinct visual phases for swoop & vulnerable hover!
 */
export function drawHarpyEagle(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);

  if (enemy.hitFlashTimer > 0) {
    ctx.filter = 'brightness(2.4)';
  }

  const wingFlap = Math.sin(time * 10 + enemy.id);
  const isSwooping = enemy.swoopPhase === 'swoop' || enemy.isAttacking;
  const isHovering = enemy.swoopPhase === 'hover';
  const isTelegraphing = enemy.swoopPhase === 'telegraph' || enemy.telegraphTimer > 0;

  if (isSwooping) {
    ctx.rotate(0.38); // pitched aerodynamic dive angle
  } else if (isHovering) {
    ctx.rotate(Math.sin(time * 6) * 0.1); // gentle flutter tilt
  }

  // Vulnerable Hover Glow Indicator
  if (isHovering) {
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -6, 38, 0, Math.PI * 2);
    ctx.stroke();

    // Floating little stun stars around head
    for (let s = 0; s < 3; s++) {
      const starAngle = time * 5 + (s * Math.PI * 2) / 3;
      const sx = 16 + Math.cos(starAngle) * 22;
      const sy = -14 + Math.sin(starAngle) * 12;
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✨', sx, sy);
    }
    ctx.restore();
  }

  // Rear Layered Wings (Midnight Slate with Silver Barbs)
  const wingYOffset = isHovering
    ? Math.sin(time * 14) * 8
    : isSwooping
    ? 6
    : wingFlap * 14;

  ctx.fillStyle = '#334155'; // Deep Slate
  ctx.beginPath();
  ctx.ellipse(-6, -14 + wingYOffset, 32, 14, -0.25 + wingFlap * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Silver Wing Feather Tips
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(-8, -16 + wingYOffset, 24, 9, -0.2 + wingFlap * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // White Feathered Breast Mantle (Layered Chevron Plumage)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(3, 0, 19, 23, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Subtle gray chevron feather marks on chest
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.8;
  [-6, 0, 6].forEach(cy => {
    ctx.beginPath();
    ctx.moveTo(-4, cy);
    ctx.lineTo(2, cy + 4);
    ctx.lineTo(8, cy);
    ctx.stroke();
  });

  // Tail Feathers
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(-16, 8);
  ctx.lineTo(-34, 18);
  ctx.lineTo(-28, 25);
  ctx.lineTo(-12, 17);
  ctx.closePath();
  ctx.fill();

  // Eagle Head with Majestic Crowned Crest
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(16, -13, 15, 0, Math.PI * 2);
  ctx.fill();

  // Royal Double Spiky Feather Crest Tipped with Gold!
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(9, -23);
  ctx.lineTo(2, -36);
  ctx.lineTo(12, -28);
  ctx.lineTo(8, -40);
  ctx.lineTo(18, -26);
  ctx.closePath();
  ctx.fill();

  // Gold Crest Feather Tips
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(2, -36, 2.5, 0, Math.PI * 2);
  ctx.arc(8, -40, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Piercing Golden Raptor Eye
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(18, -14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Slit Pupil
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(19, -14, 1.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular Eye Highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(17.5, -15.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Powerful Hooked Raptor Beak
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(25, -16);
  ctx.quadraticCurveTo(39, -13, 36, -2);
  ctx.quadraticCurveTo(28, -6, 25, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril slit
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(28, -13, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Sharp Golden Talons
  ctx.fillStyle = '#ca8a04';
  const talonY = isSwooping ? 20 : 14;
  for (let t = -1; t <= 1; t++) {
    ctx.beginPath();
    ctx.arc(8 + t * 6, talonY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Curved claw tips
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8 + t * 6, talonY + 2);
    ctx.lineTo(8 + t * 6 + 3, talonY + 7);
    ctx.stroke();
  }

  // Telegraph Warning Ring & Alert Badge
  if (isTelegraphing) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.stroke();

    // Golden exclamation badge above eagle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(16, -46, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 16, -46);
  }

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Jaguar / Ocelot
 * Athletic bounding predator with true leopard rosettes, emerald feline eyes,
 * white ear spots (ocelli), and animated bounding paws!
 */
export function drawOcelot(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);

  if (enemy.hitFlashTimer > 0) {
    ctx.filter = 'brightness(2.2)';
  }

  const runCycle = Math.sin(time * 12 + enemy.id);
  const tailSwish = Math.sin(time * 5 + enemy.id) * 0.3;

  // Drop shadow on platform
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 28, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spotted Muscular Tail
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-18, -4);
  ctx.quadraticCurveTo(-34, -18 + tailSwish * 10, -30, -30 + tailSwish * 12);
  ctx.stroke();

  // Tail white tip
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-32, -27 + tailSwish * 12);
  ctx.lineTo(-30, -30 + tailSwish * 12);
  ctx.stroke();

  // Body: Warm Honey Amber
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(0, -6, 24, 16, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Cream belly undercoat
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(2, -2, 16, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaguar Rosettes (dark chocolate rings with warm center)
  ctx.fillStyle = '#78350f';
  [
    [-11, -11], [-4, -13], [5, -9], [-8, -4], [7, -4], [-13, -2]
  ].forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3.5, 2.6, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Legs with running gait
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-18 + runCycle * 7, 14);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(16 - runCycle * 7, 14);
  ctx.stroke();

  // Cute Feline Head
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(20, -15, 14, 0, Math.PI * 2);
  ctx.fill();

  // Pricked Ears with black back and white spot (Ocelli)
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(14, -25);
  ctx.lineTo(18, -35);
  ctx.lineTo(23, -25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.moveTo(16, -25);
  ctx.lineTo(18, -31);
  ctx.lineTo(21, -25);
  ctx.closePath();
  ctx.fill();

  // Cream Muzzle & Pink Nose
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(26, -11, 7, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(28, -12, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Sparkling Emerald Feline Eye
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(21, -16, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.ellipse(21.5, -16, 1.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(20, -17.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Hazards (Frog, Spider)
 */
export function drawHazardEntity(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(enemy.facing, 1);

  if (enemy.type === 'frog') {
    // Poison Dart Frog (Electric Jewel Cobalt & Neon Cyan)
    const hopY = Math.sin(time * 8 + enemy.id) * 4;
    ctx.translate(0, hopY);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neon Yellow/Gold Warning Spots
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-4, -3, 3.5, 0, Math.PI * 2);
    ctx.arc(4, -2, 3.0, 0, Math.PI * 2);
    ctx.arc(-8, 3, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Throat sac pulse
    const throatPulse = (Math.sin(time * 6) + 1) * 2;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(10, 2, 4 + throatPulse, 0, Math.PI * 2);
    ctx.fill();

    drawGlossyEye(ctx, 9, -6, 4.2, 0.2, 0, false);
  } else if (enemy.type === 'spider') {
    // Canopy Spider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Fuzzy Abdomen
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(0, -2, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(-4, -4, 3.5, 0, Math.PI * 2);
    ctx.arc(4, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 8 Legs
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.8;
    [-1, 1].forEach(side => {
      for (let leg = 0; leg < 4; leg++) {
        const legWave = Math.sin(time * 6 + leg) * 2;
        ctx.beginPath();
        ctx.moveTo(side * 6, -2);
        ctx.lineTo(side * 19, -4 + leg * 4 + legWave);
        ctx.lineTo(side * 25, 7 + leg * 3);
        ctx.stroke();
      }
    });

    drawGlossyEye(ctx, -3.5, 2, 3.2, 0, 0, false);
    drawGlossyEye(ctx, 3.5, 2, 3.2, 0, 0, false);
  }

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Stage Bosses
 */
export function drawBossEntity(
  ctx: CanvasRenderingContext2D,
  boss: BossEntity,
  time: number
) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.scale(boss.facing * 1.5, 1.5);

  if (boss.hitFlashTimer > 0) {
    ctx.filter = 'brightness(2.5)';
  }

  const breath = Math.sin(time * 3) * 2.5;

  // Boss Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cape
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-18, -32);
  ctx.lineTo(-35, 22);
  ctx.lineTo(12, 26);
  ctx.lineTo(18, -32);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(0, -10 + breath, 26, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armored Gold Chestplate
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.roundRect(-14, -22 + breath, 28, 20, 4);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Face
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(7, -34, 19, 0, Math.PI * 2);
  ctx.fill();

  // Mandrill Facial Ridges
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.ellipse(13, -30, 7, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(9, -30, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Glowing fierce eyes
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(5, -38, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(6, -38, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Spiked Iron Gauntlet
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(24, -10, 15, 13, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Spikes
  ctx.fillStyle = '#94a3b8';
  [16, 24, 32].forEach(sx => {
    ctx.beginPath();
    ctx.moveTo(sx - 3, -19);
    ctx.lineTo(sx, -28);
    ctx.lineTo(sx + 3, -19);
    ctx.closePath();
    ctx.fill();
  });

  // Attack Telegraph
  if (boss.telegraphTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.95)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -10, 58, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Sloth's Girlfriend Daisy
 */
export function drawGirlfriendDaisy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  isRescued: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(time * 4) * 2;

  // Furry Body
  const bodyGrad = ctx.createRadialGradient(0, -20 + bob, 4, 0, -20 + bob, 24);
  bodyGrad.addColorStop(0, '#ebd0b5');
  bodyGrad.addColorStop(0.8, '#ba8a5d');
  bodyGrad.addColorStop(1, '#865128');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -20 + bob, 19, 23, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#ebd0b5';
  ctx.beginPath();
  ctx.arc(0, -39 + bob, 17, 0, Math.PI * 2);
  ctx.fill();

  // Eye mask
  ctx.fillStyle = '#4c260f';
  ctx.beginPath();
  ctx.ellipse(-5, -39 + bob, 6.5, 5, -0.15, 0, Math.PI * 2);
  ctx.ellipse(5, -39 + bob, 6.5, 5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Big Shiny Eyes with pretty eyelashes
  drawGlossyEye(ctx, -5, -39 + bob, 4.5, 0, 0, false);
  drawGlossyEye(ctx, 5, -39 + bob, 4.5, 0, 0, false);

  // Eyelashes
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-10, -43 + bob);
  ctx.lineTo(-13, -46 + bob);
  ctx.moveTo(10, -43 + bob);
  ctx.lineTo(13, -46 + bob);
  ctx.stroke();

  // Signature Pink Hibiscus Flower behind ear
  ctx.fillStyle = '#f43f5e';
  for (let p = 0; p < 5; p++) {
    const pAngle = (p * 0.4) * Math.PI;
    ctx.beginPath();
    ctx.ellipse(13 + Math.cos(pAngle) * 5.5, -48 + bob + Math.sin(pAngle) * 5.5, 4.5, 3.2, pAngle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(13, -48 + bob, 2.8, 0, Math.PI * 2);
  ctx.fill();

  if (isRescued) {
    const waveArm = Math.sin(time * 10) * 13;
    ctx.strokeStyle = '#ba8a5d';
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(13, -27 + bob);
    ctx.lineTo(25, -42 + bob + waveArm);
    ctx.stroke();

    ctx.fillStyle = '#ec4899';
    ctx.font = '18px sans-serif';
    ctx.fillText('❤️', -9, -60 + Math.sin(time * 5) * 4);
  }

  ctx.restore();
}

/**
 * Procedural Vector Renderer for Collectibles
 */
export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  time: number
) {
  if (item.collected) return;

  ctx.save();
  ctx.translate(item.x, item.y);
  const bobY = Math.sin(time * 4 + item.bobPhase) * 4;
  ctx.translate(0, bobY);

  switch (item.type) {
    case 'flower':
    case 'fruit': {
      // Blooming Tropical Rainforest Orchid & Hibiscus
      const isHibiscus = item.botanicalVariant === 'hibiscus';
      const pColor1 = isHibiscus ? '#ef4444' : '#ec4899';
      const pColor2 = isHibiscus ? '#be123c' : '#a855f7';

      // 5 Blooming Petals with radial glow
      const numPetals = 5;
      for (let i = 0; i < numPetals; i++) {
        const pAngle = (i * Math.PI * 2) / numPetals + time * 1.5;
        const px = Math.cos(pAngle) * 9;
        const py = Math.sin(pAngle) * 9;

        const petalGrad = ctx.createRadialGradient(px * 0.4, py * 0.4, 1, px, py, 11);
        petalGrad.addColorStop(0, '#fef08a');
        petalGrad.addColorStop(0.35, pColor1);
        petalGrad.addColorStop(1, pColor2);
        ctx.fillStyle = petalGrad;

        ctx.beginPath();
        ctx.ellipse(px, py, 7.5, 4.5, pAngle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Golden Pollen Stamen Core
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Nectar Sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'leaf': {
      // Golden Rainforest Monstera Frond / Split-Leaf
      ctx.save();
      ctx.rotate(0.2);

      // Deep emerald to golden green leaf gradient
      const leafGrad = ctx.createLinearGradient(0, -18, 0, 18);
      leafGrad.addColorStop(0, '#86efac');
      leafGrad.addColorStop(0.5, '#22c55e');
      leafGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = leafGrad;
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.2;

      // Broad heart-shaped Monstera leaf silhouette
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(16, -14, 18, 6, 0, 18);
      ctx.bezierCurveTo(-18, 6, -16, -14, 0, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central Golden Vein
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(0, 16);
      ctx.stroke();

      // Cut-leaf fenestrations / perforations
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(-6, -4, 3.5, 1.2, 0.4, 0, Math.PI * 2);
      ctx.ellipse(6, -4, 3.5, 1.2, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-5, 4, 3, 1.1, 0.3, 0, Math.PI * 2);
      ctx.ellipse(5, 4, 3, 1.1, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'relic': {
      // Ancient Golden Jungle Idol with Rotating Gleam
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-13, -20, 26, 38, 5);
      ctx.fill();
      ctx.stroke();

      // Glowing Ruby Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-5.5, -7, 2.8, 0, Math.PI * 2);
      ctx.arc(5.5, -7, 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-7, 5, 14, 4);

      // Rotating sparkle gleam
      const gleamAngle = time * 2.5;
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(gleamAngle) * 16, -6 + Math.sin(gleamAngle) * 16);
      ctx.lineTo(-Math.cos(gleamAngle) * 16, -6 - Math.sin(gleamAngle) * 16);
      ctx.stroke();
      break;
    }

    case 'cage': {
      // Bamboo Critter Cage with Cute Animated Furry Critter Inside
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      drawGlossyEye(ctx, -3.5, -2, 3.2, 0, 0, false);
      drawGlossyEye(ctx, 3.5, -2, 3.2, 0, 0, false);

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.strokeRect(-19, -21, 38, 42);

      [-10, 0, 10].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx, -21);
        ctx.lineTo(bx, 21);
        ctx.stroke();
      });

      if ((item.cageHp ?? 2) > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`HP: ${item.cageHp}`, -15, -26);
      }
      break;
    }

    case 'heart': {
      // Sacred Healing Lotus & Ruby Heart Crystal
      const pulse = Math.sin(time * 5 + item.bobPhase) * 0.12 + 0.88;
      ctx.save();
      ctx.scale(pulse, pulse);

      // Soft pink lotus petals framing heart
      ctx.fillStyle = '#f472b6';
      [-0.4, 0, 0.4].forEach((rot) => {
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 10, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ruby Heart Crystal
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-5.5, -4, 6.8, Math.PI, 0, false);
      ctx.arc(5.5, -4, 6.8, Math.PI, 0, false);
      ctx.lineTo(0, 12);
      ctx.closePath();
      ctx.fill();

      // White glassy shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5, -6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'super_heart': {
      // Golden Dragonfruit / Sacred Max Vitality Lotus
      const pulse = Math.sin(time * 6 + item.bobPhase) * 0.18 + 0.85;
      ctx.save();
      ctx.scale(pulse, pulse);

      // Golden Halo Flare
      const haloGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
      haloGrad.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
      haloGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      // Golden Lotus Petals
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 6; i++) {
        const pa = (i * Math.PI) / 3 + time * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(pa) * 11, Math.sin(pa) * 11, 4.5, 8, pa, 0, Math.PI * 2);
        ctx.fill();
      }

      // Large Ruby Jewel Heart
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-6.5, -5, 8, Math.PI, 0, false);
      ctx.arc(6.5, -5, 8, Math.PI, 0, false);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();

      // Golden Heart Crown
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.lineTo(0, -16);
      ctx.lineTo(6, -11);
      ctx.lineTo(3, -8);
      ctx.lineTo(-3, -8);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'powerup_speed': {
      // Cheetah Speed Orchid: Neon Emerald Flower + Wind Vortex
      const pulse = Math.sin(time * 8 + item.bobPhase) * 0.12 + 0.9;
      ctx.save();
      ctx.scale(pulse, pulse);

      // Spinning wind trails
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, time * 8, time * 8 + Math.PI);
      ctx.stroke();

      // 4 Emerald Arrow Petals
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 4; i++) {
        const pa = (i * Math.PI) / 2 + time * 3;
        ctx.beginPath();
        ctx.ellipse(Math.cos(pa) * 9, Math.sin(pa) * 9, 4.5, 9, pa, 0, Math.PI * 2);
        ctx.fill();
      }

      // Electric Lightning Stamen
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-3, -8);
      ctx.lineTo(2, -1);
      ctx.lineTo(-1, 0);
      ctx.lineTo(3, 8);
      ctx.lineTo(-2, 1);
      ctx.lineTo(1, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'powerup_invincible': {
      // Golden Sun Radiance Star Flower
      const pulse = Math.sin(time * 10 + item.bobPhase) * 0.15 + 0.9;
      ctx.save();
      ctx.scale(pulse, pulse);

      // Rotating Solar Beams
      const rot = time * 2.5;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.75)';
      for (let i = 0; i < 8; i++) {
        const pa = (i * Math.PI) / 4 + rot;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(pa - 0.2) * 19, Math.sin(pa - 0.2) * 19);
        ctx.lineTo(Math.cos(pa + 0.2) * 19, Math.sin(pa + 0.2) * 19);
        ctx.closePath();
        ctx.fill();
      }

      // Golden Star Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'powerup_magnet': {
      // Nectar Magnet Spore Bloom
      const pulse = Math.sin(time * 6 + item.bobPhase) * 0.12 + 0.9;
      ctx.save();
      ctx.scale(pulse, pulse);

      // Magnetic Orbit Rings
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, time * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Deep Violet & Cyan Flower Petals
      ctx.fillStyle = '#818cf8';
      for (let i = 0; i < 5; i++) {
        const pa = (i * Math.PI * 2) / 5 + time * 1.5;
        ctx.beginPath();
        ctx.ellipse(Math.cos(pa) * 8, Math.sin(pa) * 8, 4.5, 7, pa, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Cyan Stamen
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'exit_totem': {
      // Magnificent Ancient Sacred Victory Portal & Shrine
      const isLocked = item.isLocked;
      const pulse = Math.sin(time * 3) * 0.15 + 0.85;

      if (!isLocked) {
        // 1. Radiant Golden-Emerald God-Ray Column (When Unlocked)
        const grad = ctx.createLinearGradient(0, -180, 0, 30);
        grad.addColorStop(0, 'rgba(52, 211, 153, 0)');
        grad.addColorStop(0.5, `rgba(52, 211, 153, ${0.35 * pulse})`);
        grad.addColorStop(1, `rgba(251, 191, 36, ${0.5 * pulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(-45, -180, 90, 210);

        // 2. Swirling Central Portal Vortex
        const swirl = time * 3.2;
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.9 * pulse})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, -25, 26, 44, swirl * 0.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 78, 59, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, -25, 20, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, -25, 10, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Sealed Portal Background (Dormant Dark Stone)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.ellipse(0, -25, 20, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Entangled Thorny Rainforest Vines Sealing the Entrance
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-25, -45);
        ctx.lineTo(25, -5);
        ctx.moveTo(25, -45);
        ctx.lineTo(-25, -5);
        ctx.stroke();

        // Glowing Ancient Aztec Jade Padlock Seal
        ctx.fillStyle = '#ca8a04';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -25, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Keyhole
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -27, 2.5, 0, Math.PI * 2);
        ctx.rect(-1.5, -26, 3, 5);
        ctx.fill();
      }

      // 3. Ancient Stone Shrine Pillars
      // Left Pillar
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-38, -90, 16, 110);
      ctx.strokeRect(-38, -90, 16, 110);
      // Right Pillar
      ctx.fillRect(22, -90, 16, 110);
      ctx.strokeRect(22, -90, 16, 110);

      // Carved Glowing Jade Runes on pillars
      ctx.fillStyle = isLocked ? '#94a3b8' : '#34d399';
      [-75, -55, -35, -15].forEach((ry, i) => {
        const runeGlow = isLocked ? 0.4 : Math.sin(time * 4 + i) * 0.3 + 0.7;
        ctx.globalAlpha = runeGlow;
        ctx.fillRect(-35, ry, 10, 4);
        ctx.fillRect(25, ry, 10, 4);
      });
      ctx.globalAlpha = 1.0;

      // 4. Carved Temple Lintel / Overhead Arch
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isLocked ? '#64748b' : '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-46, -112, 92, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Golden Sun Emblem on Lintel
      ctx.fillStyle = isLocked ? '#71717a' : '#fde047';
      ctx.beginPath();
      ctx.arc(0, -100, 7, 0, Math.PI * 2);
      ctx.fill();

      // Badge Text
      ctx.fillStyle = isLocked ? '#f87171' : '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isLocked ? 'SEALED' : 'SANCTUARY', 0, -100);

      // 5. Indicator Above Portal
      const bounceY = Math.sin(time * 5) * 6;
      if (isLocked) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('🔒 [COMPLETE MISSION]', 0, -125 + bounceY);
      } else {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✨ TOUCH TO CLEAR ➔', 0, -125 + bounceY);

        // Fluttering Checkered Victory Ribbons
        ctx.fillStyle = '#ef4444';
        const flutterL = Math.sin(time * 6) * 5;
        ctx.beginPath();
        ctx.moveTo(-38, -90);
        ctx.lineTo(-52 + flutterL, -75);
        ctx.lineTo(-38, -65);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        const flutterR = Math.sin(time * 6 + 1) * 5;
        ctx.beginPath();
        ctx.moveTo(38, -90);
        ctx.lineTo(52 + flutterR, -75);
        ctx.lineTo(38, -65);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}
