/**
 * The look of the Sky Sovereign's fight (4-10), on top of her lair (lairSovereign*.ts): the rock pillars (World 4's painted pillar and
 * snapped stump, w4Art.ts, with the cracks drawn over them), the screech rolling out of her beak, the gust lane of her wingbeats, the
 * wind chimes that ring before it, and her crest and the shimmering air while she winds up a screech. The rules are sovereignFight.ts's;
 * nothing here changes a box.
 */
import type { BossEntity, Platform } from './types.ts';
import type { BossHazard } from './bossAI.ts';
import { drawW4 } from './w4Art.ts';
import { COVER_LEN, type SkyPillar } from './sovereignFight.ts';
import { screechBeak } from './sovereignSprite.ts';
import { drawFx } from './bossFx.ts';

let live: SkyPillar[] | null = null;
/** the engine hands over the fight's pillars (null when the stage has none), so the lair can draw their cracks */
export function setSovereignPillars(ps: SkyPillar[] | null) {
  live = ps;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// ───────────────────────────── the pillars ─────────────────────────────

/** a rock pillar (or the stump of one), standing on the floor at the platform's foot */
export function drawSkyPillar(ctx: CanvasRenderingContext2D, p: Platform, time: number, storm: number) {
  const st = p.pillar !== undefined ? live?.[p.pillar] : undefined;
  const floor = p.y + p.height;
  const cx = p.x + p.width / 2;
  const broken = !!st?.broken;
  ctx.save();
  // only what stands above the floor shows: the painting is sunk into the cliff top to the pillar's height
  ctx.beginPath();
  ctx.rect(cx - 140, floor - 520, 280, 520);
  ctx.clip();
  const W = p.width + 18;
  const drawn = broken ? drawW4(ctx, 'pillarSnap', cx, floor + (W * 154) / 111 - p.height - 6, W) : drawW4(ctx, 'rockPillar', cx, floor + (W * 361) / 116 - p.height - 8, W);
  if (!drawn) {
    // before the World 4 pieces load: plain banded stone
    const g = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
    g.addColorStop(0, '#5b5168');
    g.addColorStop(0.6, '#a39089');
    g.addColorStop(1, '#d9b48f');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#2a1626';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height + 4, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7c9a3a';
    ctx.fillRect(p.x + 4, p.y - 4, p.width - 8, 8);
  }
  ctx.restore();
  if (storm > 0.02) {
    // the storm dims the rock with the rest of the aerie
    ctx.save();
    ctx.globalAlpha = 0.28 * storm;
    ctx.fillStyle = '#2e2254';
    ctx.fillRect(p.x - 4, p.y - 6, p.width + 8, p.height + 6);
    ctx.restore();
  }
  if (!st) return;
  // the cracks from her slams: one zig-zag down the face, a second one wider and the top chipped
  if (!broken && st.cracks > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(24, 12, 20, 0.85)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let k = 0; k < st.cracks; k++) {
      ctx.lineWidth = 3.2 - k * 0.6;
      ctx.beginPath();
      let x = cx + (k ? 14 : -10);
      let y = p.y + 6;
      ctx.moveTo(x, y);
      for (let i = 0; i < 6; i++) {
        x += (rand(p.id * 7 + k * 13 + i) - 0.5) * 22;
        y += p.height / 7;
        ctx.lineTo(Math.max(p.x + 6, Math.min(p.x + p.width - 6, x)), y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  // the dive's locked mark is on this rock: a warm rim, so "she'll hit the rock" reads
  if (!broken && st.aimed) {
    const pulse = 0.55 + 0.45 * Math.sin(time * 16);
    ctx.save();
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(250, 204, 21, 0.9)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(p.x - 6, p.y - 8, p.width + 12, p.height + 8, 10);
    ctx.stroke();
    ctx.restore();
  }
}

// ───────────────────────────── the screech and the gust ─────────────────────────────

/**
 * Her screech: bright arcs rolling out of her beak, with rings of shimmering air. Behind a standing rock the arcs are cut off below its
 * top for COVER_LEN, so the shelter is drawn where it is. Her gust: streaks of wind and leaves blowing down the lane.
 */
export function drawSkyPush(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  if (h.look === 'gust') return drawGust(ctx, h, time);
  const floor = h.floorY;
  const src = h.src ?? h.x;
  const dir = h.dir >= 0 ? 1 : -1;
  const front = h.x;
  const age = h.maxLife - h.life;
  const fade = clamp01(h.life / 0.5) * clamp01(age / 0.08);
  const rocks = (live ?? []).filter((p) => p.h > 0 && (p.x - dir * (p.w / 2) - src) * dir > 0);
  ctx.save();
  ctx.lineCap = 'round';
  // three arcs, one behind the other
  for (let k = 0; k < 3; k++) {
    const fx = front - dir * k * 46;
    if ((fx - src) * dir < 10) continue;
    const r = Math.abs(fx - src);
    const span = Math.min(1.05, 0.35 + r / 600);
    const cy = floor - 150;
    ctx.globalAlpha = fade * (0.9 - k * 0.25);
    ctx.strokeStyle = k === 0 ? '#f0f9ff' : '#bae6fd';
    ctx.lineWidth = 9 - k * 2.5;
    ctx.shadowColor = 'rgba(125, 211, 252, 0.9)';
    ctx.shadowBlur = 12;
    // draw the arc in short pieces, leaving out what a rock shelters
    const N = 26;
    let open = false;
    for (let i = 0; i <= N; i++) {
      const a = -span + (2 * span * i) / N;
      const x = src + dir * Math.cos(a) * r;
      const y = Math.min(floor - 4, cy + Math.sin(a) * r * 0.8);
      const sheltered = rocks.some((p) => (x - (p.x + dir * p.w / 2)) * dir > 0 && (x - p.x) * dir < COVER_LEN + p.w / 2 && y > floor - p.h - 4);
      if (sheltered || y < floor - 430) {
        if (open) ctx.stroke();
        open = false;
        continue;
      }
      if (!open) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        open = true;
      } else ctx.lineTo(x, y);
    }
    if (open) ctx.stroke();
  }
  ctx.restore();
}

function drawGust(ctx: CanvasRenderingContext2D, h: BossHazard, time: number) {
  const floor = h.floorY;
  const dir = h.dir >= 0 ? 1 : -1;
  const x0 = h.x - h.w / 2;
  const age = h.maxLife - h.life;
  const fade = clamp01(age / 0.25) * clamp01(h.life / 0.35);
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const y = floor - 30 - rand(i * 3) * 290;
    const len = 110 + rand(i * 5) * 120;
    const sp = 520 + rand(i * 7) * 260;
    const u = ((time * sp + rand(i) * h.w) % (h.w + len)) - len;
    const x = dir > 0 ? x0 + u : x0 + h.w - u;
    ctx.globalAlpha = fade * (0.45 + 0.4 * rand(i * 11));
    // the painted streaks of wind, and now and then one of her feathers tumbling along in it
    drawFx(ctx, 'gust', x, y, len, { ax: dir > 0 ? 1 : 0, flipX: dir < 0 });
    if (i % 4 === 0) drawFx(ctx, 'feather', x - dir * len * 0.4, y + 14, 22, { rot: time * 9 + i });
  }
  ctx.restore();
}

// ───────────────────────────── the chimes ─────────────────────────────

/** the chimes' lean: still, then ringing toward the coming gust while she winds it up, then leaning with it while it blows */
export function chimeAngle(b: BossEntity | null, time: number): number {
  const br = b?.ai;
  if (!br || br.move !== 'wingGust' || (br.state !== 'tell' && br.state !== 'act')) return Math.sin(time * 1.3) * 0.03;
  const dir = b!.facing;
  if (br.state === 'tell') return dir * (0.12 + 0.35 * clamp01(br.t / 1.1)) * (0.6 + 0.4 * Math.sin(time * 9));
  return dir * 0.55 + Math.sin(time * 14) * 0.05;
}

/** a chime post standing on the floor: World 4's painted chimes, or a drawn post before they load */
export function drawChimePost(ctx: CanvasRenderingContext2D, x: number, floor: number, angle: number) {
  const swing = Math.abs(angle) > 0.12;
  if (drawW4(ctx, swing ? 'chimesSwing' : 'chimesStill', x, floor + 2, 92, { flip: swing && angle < 0, rot: swing ? angle * 0.15 : angle })) return;
  ctx.save();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x - 20, floor);
  ctx.lineTo(x - 20, floor - 120);
  ctx.lineTo(x + 30, floor - 120);
  ctx.stroke();
  ctx.fillStyle = '#a3a33a';
  for (let k = 0; k < 4; k++) {
    ctx.save();
    ctx.translate(x - 8 + k * 12, floor - 118);
    ctx.rotate(-angle * (0.8 + k * 0.1));
    ctx.fillRect(-3, 12, 7, 26 + k * 5);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────────── her screech wind-up ─────────────────────────────

/**
 * While she winds up a screech: her crest rises (feather tips flicking up over her head), and the air at her beak shimmers in rings
 * that tighten as the scream comes. While she screams, rings burst from the beak.
 */
export function drawScreechCue(ctx: CanvasRenderingContext2D, b: BossEntity, floor: number, time: number, tell: number) {
  const br = b.ai;
  if (!br || br.move !== 'screech' || (br.state !== 'tell' && br.state !== 'act')) return;
  const dir = b.facing;
  const feet = floor - br.air;
  const u = br.state === 'tell' ? clamp01(br.t / Math.max(0.1, tell)) : 1;
  // her beak in the frame she screams in (sovereignSprite.ts), and her crest: the stand-in pose has its crest down, so it is drawn rising
  const beak = screechBeak(!!br.d.perched);
  const bx = b.x + dir * beak.fwd;
  const by = feet - beak.up;
  const hx = bx - dir * 32;
  const hy = by - 28;
  ctx.save();
  // the crest: five feather tips standing up as the wind-up goes on
  if (!beak.painted) {
    ctx.strokeStyle = '#1f2937';
    ctx.fillStyle = '#d6d3d1';
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 - dir * (0.5 - k * 0.22) + Math.sin(time * 30 + k) * 0.05 * u;
      const len = 14 + 26 * u + (k % 2) * 6;
      ctx.save();
      ctx.translate(hx - dir * k * 7, hy + k * 2);
      ctx.rotate(a + Math.PI / 2);
      ctx.globalAlpha = 0.25 + 0.75 * u;
      ctx.beginPath();
      ctx.moveTo(-3.5, 0);
      ctx.quadraticCurveTo(-4, -len * 0.6, 0, -len);
      ctx.quadraticCurveTo(4, -len * 0.6, 3.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  // the air shimmering at the beak
  for (let k = 0; k < 3; k++) {
    const ph = (time * (br.state === 'act' ? 3.2 : 1.6 + 2 * u) + k / 3) % 1;
    const r = br.state === 'act' ? 20 + ph * 120 : 50 - ph * 34 * u;
    ctx.globalAlpha = (br.state === 'act' ? 1 - ph : 0.2 + 0.6 * u) * 0.8;
    ctx.strokeStyle = k % 2 ? '#bae6fd' : '#f0f9ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(bx + dir * 10, by, r * 0.55, r, 0, dir > 0 ? -1.2 : Math.PI - 1.2, dir > 0 ? 1.2 : Math.PI + 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

/** the posts of the two chime stands, px from the left fence (out of the way of the rocks and the storm) */
export const CHIME_POSTS = [210, 1305] as const;

/**
 * While she is stunned, her back is an opening too (bossDefs stompSpot): a ring of light over it and two chevrons pointing down, so
 * "land on her back" reads from up on a rock or a ledge.
 */
export function drawBackCue(ctx: CanvasRenderingContext2D, b: BossEntity, spot: { dx: number; dy: number; w: number; h: number }, floor: number, time: number) {
  const br = b.ai;
  if (!br || br.state !== 'stun') return;
  const cx = b.x + b.facing * spot.dx;
  const top = floor - br.air - spot.dy - spot.h / 2;
  const u = clamp01(br.t / 0.25) * clamp01((br.hold - br.t) / 0.3);
  const pulse = 0.6 + 0.4 * Math.sin(time * 9);
  ctx.save();
  ctx.globalAlpha = u * (0.5 + 0.4 * pulse);
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(134, 239, 172, 0.9)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(cx, top + 6, spot.w * 0.42, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3.5;
  for (let k = 0; k < 2; k++) {
    const y = top - 46 + k * 16 + ((time * 30) % 16);
    ctx.beginPath();
    ctx.moveTo(cx - 10, y - 6);
    ctx.lineTo(cx, y + 3);
    ctx.lineTo(cx + 10, y - 6);
    ctx.stroke();
  }
  ctx.restore();
}
