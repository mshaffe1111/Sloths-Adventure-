// HANG-SPEC (R-165.449, WORLD-3-PLAN §6 Q1): a show-first mock-up of 3-2's roof-root creep, on the REAL engine (3-1's grotto floor as a
// dev scene). NOT the lay (ENG-ROOT builds that after Matt answers).
//   node hangclip.mjs <port> <out dir> a|b|c up|side
// What is real: the engine, its rope hold (updateRope: Pokey's painted hang frames, the hold, the camera), the kit ocelot run by the
// creature kit (CastPlay, OCELOT: sight.up 40) on the fixed step, the HUD, 3-1's painted grotto.
// What is the mock (code-drawn, named on every frame's caption bar): the root itself (the engine's rope is hidden while drawing and a
// root is drawn in its place, behind him), the glowworm light pool (ENG-DARK is not built), and in (b) the speed (the engine's
// ROPE_SPEED is 120; the clip moves him at 85 after each step), in (c) the slope (the engine's rope is flat with a 12 px sag; the clip
// puts him on the curve after each step).
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, OPT, ori = 'up'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('3-1'));
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player); }, E, { timeout: 60000 });
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);

// the scene: floor y 580 from x 0 to 1002 (3-1's start); the root from x 180 to 900; the ocelot patrols 300..820 under it
const S = { floor: 580, x0: 180, x1: 900, ropeY: 399, ring: { x: 560, r: 74 }, dip: 45, speed: OPT === 'b' ? 85 : 120, opt: OPT };
const info = await p.evaluate(([E, S]) => {
  const e = eval(E);
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  // clear the raised ledge (x 550, y 540) out of the stretch, and the petals over it, so the floor under the root is one plain floor
  e.platforms.splice(0, e.platforms.length, ...e.platforms.filter((q) => !(q.x > 300 && q.x < 900 && q.y < S.floor && q.y > S.floor - 120)));
  if (e.collectibles) e.collectibles.splice(0, e.collectibles.length, ...e.collectibles.filter((c) => !(c.x > 150 && c.x < 950)));
  const rope = { id: 999, x0: S.x0, x1: S.x1, y: S.ropeY, g0: S.floor, g1: S.floor, required: false };
  e.ropes.splice(0, e.ropes.length, rope);
  e.skills.add('shimmy');
  // the kit ocelot (stageGenerator.ts ocelot(): 48 x 28, centre 18 over the floor), run by the creature kit (castPlay.ts)
  const oc = { id: 777, type: 'ocelot', x: 700, y: S.floor - 18, vx: -55, vy: 0, width: 48, height: 28, hp: 2, maxHp: 2, facing: -1,
    patrolMinX: 330, patrolMaxX: 820, attackCooldown: 2.5, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0,
    defeated: false, koTimer: 0, behaviorTimer: 0 };
  e.enemies.splice(0, e.enemies.length, oc);
  e.proto.cast = { kinds: ['ocelot'], traps: [] };
  e.startCast();
  // Pokey on the root's left end
  const P = e.player;
  const sagY = (x) => { const t = Math.max(0, Math.min(1, (x - S.x0) / (S.x1 - S.x0))); return S.ropeY + 12 * 4 * t * (1 - t); };
  const rootY = (x) => { const t = Math.max(0, Math.min(1, (x - S.x0) / (S.x1 - S.x0))); return S.opt === 'c' ? S.ropeY + S.dip * (1 - Math.cos(2 * Math.PI * t)) / 2 + 12 * 4 * t * (1 - t) * 0 : sagY(x); };
  window.__hs = { S, rootY };
  P.x = S.x0 + 24; P.y = rootY(P.x) + 86; P.vx = 0; P.vy = 0; P.hanging = true; P.grounded = false; P.facing = 1;
  e.ropeId = 999; e.ropeGrace = 0; e.ropeCooldown = 0;
  // the caption bar (a page overlay, like tools/inspect/clip.mjs)
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: window.innerWidth > window.innerHeight ? '10px' : '28px', zIndex: 99999,
    font: '700 17px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.80)', borderRadius: '12px', padding: '8px 12px', lineHeight: '1.3', pointerEvents: 'none' });
  document.body.appendChild(d);
  return { ocelots: e.enemies.length, cast: !!e.cast, hanging: P.hanging, zoom: e.zoom };
}, [E, S]);
console.log('scene', JSON.stringify(info));

const cap = (h) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, h);
const LABEL = { a: "A: today's creep (1-3's speed, flat root)", b: 'B: slower, tense creep (85 instead of 120)', c: 'C: the root dips toward the floor and rises' };
const MOCK = '<span style="font-weight:500;font-size:13px;opacity:.85">mock-up: the root and the glow are stand-in drawings</span>';

// one frame on the real engine; after the step, (b) and (c) put him where their option says; the render draws the root and glow
// behind him (the engine's own rope hidden while it draws)
const frame = (dir) => p.evaluate(([E, dir]) => {
  const e = eval(E); const P = e.player; const { S, rootY } = window.__hs;
  e.input.triggerTouchMove(dir > 0 ? 'right' : 'none');
  const x0 = P.x;
  P.invincibleTimer = 9;
  e.update(1 / 30);
  P.invincibleTimer = 0;
  if (P.hanging) {
    if (S.opt === 'b' && dir) { const nx = Math.min(S.x1, x0 + dir * S.speed / 30); P.walkCycle -= (P.x - nx) * 0.08; P.x = nx; P.vx = dir * S.speed; }
    P.y = rootY(P.x) + 86;
  }
  const rope = e.ropes[0]; const keep = { y: rope.y, g0: rope.g0, g1: rope.g1 };
  rope.y = rope.g0 = rope.g1 = -9000;
  e.slideRun = { sliding: false, overlay() {}, draw() {}, drawHero(c) { drawScene(c, e, S, rootY); return false; } };
  try { e.render(); } finally { e.slideRun = null; Object.assign(rope, keep); }
  const o = e.enemies[0];
  return { x: Math.round(P.x), y: Math.round(P.y), hanging: !!P.hanging, ox: Math.round(o.x), of: o.facing, ost: o.kit?.phase ?? o.state ?? '', hurt: P.hurtTimer ?? 0, lit: Math.hypot(P.x - S.ring.x, Math.max(0, S.floor - P.y)) < S.ring.r };
  function drawScene(c, e, S, rootY) {
    const t = e.gameTime;
    // the glowworm pool: a cluster of worms on the floor and the light they throw (a half-disc of radius r over the floor)
    const R = S.ring;
    c.save();
    const g = c.createRadialGradient(R.x, S.floor, 4, R.x, S.floor, R.r * 1.15);
    g.addColorStop(0, 'rgba(170,255,210,0.7)'); g.addColorStop(0.6, 'rgba(120,235,190,0.36)'); g.addColorStop(1, 'rgba(120,235,190,0)');
    c.fillStyle = g; c.beginPath(); c.arc(R.x, S.floor, R.r * 1.15, Math.PI, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(200,255,225,0.8)'; c.lineWidth = 2.5; c.setLineDash([6, 6]);
    c.beginPath(); c.arc(R.x, S.floor, R.r, Math.PI, 0); c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 9; i++) {
      const wx = R.x - 26 + i * 6.5, wy = S.floor - 3 - (i % 3) * 2, a = 0.7 + 0.3 * Math.sin(t * 3 + i);
      c.fillStyle = `rgba(200,255,225,${a})`; c.beginPath(); c.arc(wx, wy, 2.4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
    // the root: hangers up into the roof at its ends and twice between, then the root itself, thick and knotted
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const hx of [S.x0 + 6, S.x0 + (S.x1 - S.x0) * 0.27, S.x0 + (S.x1 - S.x0) * 0.73, S.x1 - 6]) {
      const hy = rootY(hx);
      c.strokeStyle = '#3b2a1d'; c.lineWidth = 9; c.beginPath(); c.moveTo(hx, hy); c.bezierCurveTo(hx - 10, hy - 120, hx + 14, hy - 260, hx - 6, hy - 520); c.stroke();
      c.strokeStyle = '#6b4c33'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx + 2, hy); c.bezierCurveTo(hx - 8, hy - 120, hx + 16, hy - 260, hx - 4, hy - 520); c.stroke();
    }
    const path = () => { c.beginPath(); for (let x = S.x0 - 30; x <= S.x1 + 30; x += 8) { const y = rootY(Math.max(S.x0, Math.min(S.x1, x))) + Math.sin(x * 0.05) * 1.5; if (x === S.x0 - 30) c.moveTo(x, y); else c.lineTo(x, y); } };
    c.strokeStyle = '#2e2117'; c.lineWidth = 15; path(); c.stroke();
    c.strokeStyle = '#5a3f2a'; c.lineWidth = 11; path(); c.stroke();
    c.strokeStyle = 'rgba(160,120,80,0.75)'; c.lineWidth = 3; c.save(); c.translate(0, -3); path(); c.stroke(); c.restore();
    for (let x = S.x0 + 40; x < S.x1; x += 70) {
      const y = rootY(x);
      c.fillStyle = '#3b2a1d'; c.beginPath(); c.ellipse(x, y, 7, 5, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(70,50,32,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 5, y + 4); c.quadraticCurveTo(x + 9, y + 16, x + 4, y + 26 + (x % 3) * 6); c.stroke();
    }
    c.restore();
  }
}, [E, dir]);

let n = 0, k = 0, litWas = false;
const log = [];
const shoot = async () => { await p.screenshot({ path: `${out}/f${String(n++).padStart(3, '0')}.png` }); };
await cap(`${LABEL[OPT]}<br>${MOCK}`);
// half a second still on the root, then the creep to the far end, then half a second still
for (let i = 0; i < 16; i++) { const r = await frame(0); if (i % 2 === 0) await shoot(); log.push(r); }
for (let i = 0; i < 400; i++) {
  const r = await frame(1); log.push(r);
  if (OPT === 'c' && r.lit !== litWas) { litWas = r.lit; await cap(r.lit ? `${LABEL[OPT]}<br><span style="color:#b9ffd9">In the glow: a prowler facing him would see him</span>` : `${LABEL[OPT]}<br>${MOCK}`); }
  if (k++ % 2 === 0) await shoot();
  if (!r.hanging || r.x >= S.x1 - 4) break;
}
for (let i = 0; i < 16; i++) { const r = await frame(0); if (i % 2 === 0) await shoot(); log.push(r); }
fs.writeFileSync(`${out}/log.json`, JSON.stringify(log));
const cross = log.filter((r) => r.hanging).length;
console.log('frames', n, 'steps', log.length, 'hanging steps', cross, 'last', JSON.stringify(log[log.length - 1]), 'hurt', log.some((r) => r.hurt > 0));
await b.close();
