// R-159.1 show-first (w8-rope2, 2026-11-04): stills of World 1's combat triangle staged in the real game from EXISTING frames only (no
// game code changed). The engine is paused; Pokey and the animals are posed per beat (positions, states, a real punch or kick stepped
// frame by frame), and each beat is shot upright 390x844 and sideways 844x390. The new art (vine snake, rolled boa) is pasted up
// afterwards by compose.py and marked as a paste-up. Needs a dev-hooks build served on <port>.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/combat/mock-triangle.mjs <port> <out dir> [beat prefix] [side|up]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.', only = '', onlyTag = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

// each beat: the stage, and a function run in the page (engine `e`) that poses it; returns notes for the log
const BEATS = [
  // ── stomp vaults: 1-8's long branch, a 212 px gap at x 5570 (ground y 580), a snake sitting on its lip
  { id: 'stomp-1-approach', stage: '1-8', pose: { widen: { at: 5700, dx: 220 }, arc: { x0: 5560, x1: 6010, y: 580, up: 110 }, cam: [5760, 560], px: 5390, py: 580, grounded: true, snake: { x: 5536, y: 580, state: 'patrol', facing: -1 } } },
  { id: 'stomp-2-land-on-it', stage: '1-8', pose: { widen: { at: 5700, dx: 220 }, arc: { x0: 5560, x1: 6010, y: 580, up: 110 }, cam: [5760, 560], px: 5530, py: 528, vy: 380, grounded: false, snake: { x: 5536, y: 580, state: 'patrol', facing: -1, recoil: 0.9 } } },
  { id: 'stomp-3-vault', stage: '1-8', pose: { widen: { at: 5700, dx: 220 }, arc: { x0: 5560, x1: 6010, y: 580, up: 110 }, cam: [5760, 560], px: 5790, py: 440, vy: -260, grounded: false, snake: { x: 5536, y: 580, stagger: 1.4, facing: -1 } } },
  { id: 'stomp-4-across', stage: '1-8', pose: { widen: { at: 5700, dx: 220 }, arc: { x0: 5560, x1: 6010, y: 580, up: 110 }, cam: [5760, 560], px: 6080, py: 580, grounded: true, snake: { x: 5536, y: 580, stagger: 1.0, facing: -1 } } },
  // ── punch stuns: 1-3, the awake ground snake at x 3209 (y 566): its tell, the punch, dazed, walked past
  { id: 'punch-1-tell', stage: '1-3', pose: { px: 3110, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, state: 'rear', facing: -1 } } },
  { id: 'punch-2-punch', stage: '1-3', pose: { px: 3150, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, state: 'rear', facing: -1, hp: 9 }, key: 'KeyJ', steps: 4 } },
  { id: 'punch-3-dazed', stage: '1-3', pose: { px: 3120, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, stagger: 1.5, facing: -1, hp: 9 } } },
  { id: 'punch-4-past', stage: '1-3', pose: { px: 3290, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, stagger: 0.6, facing: -1, hp: 9 } } },
  // ── kick breaks and bowls: 1-9, the boa at x 1770 (y 468) and the snakes behind it
  { id: 'kick-1-coil', stage: '1-9', pose: { cam: [1740, 470], px: 1660, py: 468, grounded: true, boa: { id: 1, x: 1770, y: 468, state: 'coil', facing: -1 } } },
  { id: 'kick-2-stomp-bounces', stage: '1-9', pose: { cam: [1740, 470], px: 1768, py: 400, vy: -380, grounded: false, boa: { id: 1, x: 1770, y: 468, state: 'coil', facing: -1 } } },
  { id: 'kick-3-kick', stage: '1-9', pose: { cam: [1740, 470], px: 1715, py: 468, grounded: true, boa: { id: 1, x: 1770, y: 468, state: 'coil', facing: -1, hp: 9 }, key: 'KeyK', steps: 5 } },
  // the roll itself is a paste-up (compose.py): shot of the stretch it rolls down, the boa moved out of the frame
  { id: 'kick-4-roll-bg', stage: '1-9', pose: { cam: [1990, 470], px: 1760, py: 468, grounded: true, boa: { id: 1, x: 900, y: 468, state: 'coil', facing: -1 } } },
  { id: 'kick-5-switch-bg', stage: '1-9', pose: { cam: [2330, 470], px: 2190, py: 566, grounded: true, boa: { id: 1, x: 900, y: 468, state: 'coil', facing: -1 }, snake: { id: 2, x: 9000, y: 566, facing: -1 } } },
  // ── vine snake: 1-6's first lianas (paste-up of the snake in compose.py)
  { id: 'vine-1-lianas', stage: '1-6', pose: { px: 1900, py: 610, grounded: true } },

  // ── the escalation, one board per stage (round 3): where each move is taught, then combined. `marks` are world points handed to
  // compose.py (as screen points in <out>/marks.json) for the paste-ups; `drop` lowers the ground out of a range so a pit is a fall
  // (mock only); `as: 'boa'` dresses a stage's snake as a coiled boa where the stage has none yet (mock only)
  // 1-3 teaches punch and stomp: the sleeping snake, the lunge stunned, the first vault (over a soft pit)
  { id: 'esc13-1-asleep', stage: '1-3', pose: { px: 2260, py: 476, grounded: true, snake: { id: 1, x: 2383, y: 476, asleep: true, facing: -1 } } },
  { id: 'esc13-2-stun', stage: '1-3', pose: { px: 3120, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, stagger: 1.5, facing: -1, hp: 9 }, marks: { stars: 'foe' } } },
  { id: 'esc13-3-vault', stage: '1-3', pose: { widen: { at: 5212, dx: 430 }, arc: { x0: 5190, x1: 5700, y: 580, up: 110 }, cam: [5430, 560], px: 5420, py: 440, vy: -260, grounded: false, snake: { id: 3, x: 5180, y: 566, stagger: 1.4, facing: -1 } } },
  // 1-4 pairs the stun with the climb: a snake on a narrow climb shelf, passed only while it is dazed (layout 2 has them)
  { id: 'esc14-1-shelf', stage: '1-4', layout: 2, pose: { px: 1560, py: 1589, grounded: true, snake: { id: 4, x: 1700, y: 1589, state: 'rear', facing: -1 } } },
  { id: 'esc14-2-pass', stage: '1-4', layout: 2, pose: { px: 1790, py: 1589, grounded: true, snake: { id: 4, x: 1700, y: 1589, stagger: 1.1, facing: -1, hp: 9 }, marks: { stars: 'foe' } } },
  // 1-5 teaches the kick (the lead's call), then the vault off a snake on a creaking branch, the only way over a real drop
  { id: 'esc15-1-boa', stage: '1-5', pose: { cam: [5300, 560], px: 5262, py: 496, grounded: true, snake: { x: 5335, y: 476, as: 'boa', state: 'coil', facing: -1 }, marks: { glint: 'foe' } } },
  { id: 'esc15-2-kick', stage: '1-5', pose: { cam: [5300, 560], px: 5285, py: 566, grounded: true, snake: { x: 5335, y: 566, as: 'boa', state: 'coil', facing: -1, hp: 9 }, key: 'KeyK', steps: 5 } },
  { id: 'esc15-3-branch-vault', stage: '1-5', pose: { drop: [7500, 10600, 560], widen: { at: 8710, dx: 330 }, arc: { x0: 8650, x1: 9150, y: 445, up: 110 }, cam: [8820, 450], px: 8840, py: 330, vy: -260, grounded: false, snake: { x: 8650, y: 431, stagger: 1.4, facing: -1 } } },
  // 1-6 is lianas and the vine snake (met alone off a safe ledge, then two in the chain)
  { id: 'esc16-1-alone', stage: '1-6', pose: { cam: [1960, 470], px: 1830, py: 566, grounded: true, marks: { vine1: [2050, 470] } } },
  { id: 'esc16-2-chain', stage: '1-6', pose: { cam: [2230, 470], camUp: [2232, 470], px: 1830, py: 566, grounded: true, marks: { vine1: [2050, 450], vine2: [2378, 450] } } },
  // 1-8 combines: the long branch's vaults (the stomp board's 1-8 shots), a stun, a vine snake over a pit
  { id: 'esc18-1-stun', stage: '1-8', pose: { px: 4700, py: 566, grounded: true, snake: { id: 1, x: 4793, y: 566, stagger: 1.5, facing: -1, hp: 9 }, marks: { stars: 'foe' } } },
  { id: 'esc18-2-vine', stage: '1-8', pose: { cam: [14745, 420], px: 14560, py: 566, grounded: true, marks: { vine1: [14745, 430] } } },
  // 1-9 is the master: vault, stun and bowl in a row, and the last bowl opens the way to the lair
  { id: 'esc19-1-vault', stage: '1-9', pose: { widen: { at: 2700, dx: 400 }, arc: { x0: 2680, x1: 3180, y: 580, up: 110 }, cam: [2930, 560], camUp: [2798, 560], px: 2930, py: 440, vy: -260, grounded: false, snake: { id: 2, x: 2665, y: 566, stagger: 1.4, facing: -1 } } },
  { id: 'esc19-2-stun', stage: '1-9', pose: { px: 3060, py: 566, grounded: true, snake: { id: 4, x: 3150, y: 566, stagger: 1.5, facing: -1, hp: 9 }, marks: { stars: 'foe' } } },
  { id: 'esc19-3-bowl', stage: '1-9', pose: { cam: [3700, 470], px: 3580, py: 469, grounded: true, boa: { id: 3, x: 3635, y: 467, state: 'coil', facing: -1, hp: 9 }, key: 'KeyK', steps: 3 } },
  { id: 'esc19-4-lair', stage: '1-9', pose: { cam: [4420, 470], camUp: [4462, 470], px: 4290, py: 566, grounded: true, snake: { id: 4, x: 9000, y: 566, facing: -1 }, marks: { plate: [4440, 580], gate: [4590, 580] } } },

  // ── round 4: the build itself, nothing pasted up. A real punch dazes 1-3's snake (the stars are the game's own), the coiled boa's
  // glint, its tell (the squeeze), and a real kick rolling it
  { id: 'real-1-stun', stage: '1-3', pose: { px: 3150, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, state: 'rear', facing: -1 }, key: 'KeyJ', steps: 4, after: 8 } },
  { id: 'real-2-stun-late', stage: '1-3', pose: { px: 3150, py: 566, grounded: true, snake: { id: 2, x: 3209, y: 566, state: 'rear', facing: -1 }, key: 'KeyJ', steps: 4, after: 38 } },
  { id: 'real-3-coil', stage: '1-9', pose: { cam: [1740, 470], px: 1660, py: 468, grounded: true, boa: { id: 1, x: 1770, y: 468, state: 'coil', facing: -1 } } },
  { id: 'real-4-tell', stage: '1-9', pose: { cam: [1740, 470], px: 1690, py: 468, grounded: true, boa: { id: 1, x: 1770, y: 468, state: 'rear', stateT: 0.5, facing: -1 } } },
  { id: 'real-5-roll', stage: '1-9', pose: { cam: [1900, 470], px: 1715, py: 468, grounded: true, boa: { id: 1, x: 1770, y: 468, state: 'coil', facing: -1 }, key: 'KeyK', steps: 5, after: 10 } },
];
const MARKS = {};

const b = await chromium.launch();
for (const [tag, w, h] of [['side', 844, 390], ['up', 390, 844]].filter(([t]) => !onlyTag || t === onlyTag)) {
  let current = '';
  let page = null;
  for (const beat of BEATS.filter((b) => !only || b.id.startsWith(only))) {
    if (true) {
      if (page) await page.context().close();
      page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
      page.on('pageerror', (e) => console.log('ERR', e.message));
      await page.goto(`http://127.0.0.1:${port}/?lessons=off`);
      await page.waitForTimeout(3000);
      await page.evaluate(([s, l]) => window.__play(s, l), [beat.stage, beat.layout ?? 1]);
      await page.waitForTimeout(8000);
      await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight');
      // (Dot's stage-start line has gone by then: it must not cover the beat)
      await page.waitForTimeout(11000);
      current = beat.stage;
    }
    const note = await page.evaluate((pose) => {
      const e = window.__engine();
      e.isPaused = true;
      const p = e.player;
      Object.assign(p, { x: pose.px, y: pose.py, vx: 0, vy: pose.vy ?? 0, grounded: !!pose.grounded, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
      if (pose.key && pose.grounded) {
        // (a real move is stepped through the engine: he must truly stand on the platform under him, or the kick is an air kick)
        const under = e.platforms.filter((q) => q.x <= p.x + p.width / 2 && q.x + q.width >= p.x + p.width / 2 && q.y >= pose.py - 20).sort((a, c) => a.y - c.y)[0];
        // (his y is his feet: on the platform's top)
        if (under) p.y = under.y;
      }
      if (pose.marks && (pose.marks.vine1 || pose.marks.vine2)) {
        // (mock only: the lianas hang still, so the pasted vine snake sits on its liana and not beside it)
        for (const v of e.vines ?? []) { v.swingAmp = 0; v.swingPhase = 0; v.swingAngle = 0; v.swaySpeed = 0; v.swayPhase = 0; }
      }
      if (pose.drop) {
        // (mock only: the ground under a stretch lowered out of sight, so the drop is real)
        const [x0, x1, y0] = pose.drop;
        for (const q of e.platforms) if (q.x >= x0 - 80 && q.x + q.width <= x1 + 80 && q.y >= y0) q.y += 3000;
      }
      if (pose.widen && !e.__widened) {
        // (mock only: the far side of the vault's gap slid right, so the gap is past any jump; everything on it moves with it)
        const { at, dx } = pose.widen;
        for (const q of e.platforms) if (q.x > at && q.x < at + 1600) q.x += dx;
        for (const q of e.collectibles) if (q.x > at && q.x < at + 1600) q.x += dx;
        e.__widened = true;
      }
      if (pose.arc) {
        // (mock only: the petals laid as an arc from the snake along the bounce)
        const { x0, x1, y, up } = pose.arc;
        const fl = e.collectibles.filter((q) => q.type === 'flower' && !q.collected).sort((a, b) => Math.abs(a.x - (x0 + x1) / 2) - Math.abs(b.x - (x0 + x1) / 2)).slice(0, 5);
        fl.forEach((q, i) => { const u = (i + 1) / (fl.length + 1); q.x = x0 + (x1 - x0) * u; q.y = y - 60 - up * 4 * u * (1 - u); });
      }
      const pick = (type, want) => {
        let en = (want.id !== undefined && e.enemies.find((q) => q.id === want.id)) || e.enemies.filter((q) => q.type === type && !q.defeated).sort((a, c) => Math.abs(a.x - want.x) - Math.abs(c.x - want.x))[0];
        if (!en) return 'none';
        if (want.as) en.type = want.as;
        window.__mockFoe = en;
        Object.assign(en, { x: want.x, y: want.y, facing: want.facing ?? -1, asleep: !!want.asleep, defeated: false, vx: 0, stagger: want.stagger ?? 0, staggerMax: want.stagger ?? 0, recoil: want.recoil ?? 0, hitFlashTimer: 0 });
        if (want.state) { en.state = want.state; en.stateT = want.stateT ?? 0.2; }
        if (want.hp) en.hp = want.hp;
        if (want.asleep) { en.state = 'sleep'; en.stateT = 0.2; }
        if (want.stagger) en.state = 'patrol';
        // (a real move stepped through the engine: no other animal near enough to bump him or take the hit)
        if (pose.key) for (const q of e.enemies) if (q !== en && Math.abs(q.x - want.x) < 400) q.x += 3000;
        // others of its kind out of the way of this shot
        for (const q of e.enemies) if (q !== en && q.type === type && Math.abs(q.x - want.x) < 500 && type !== 'boa') q.x = want.x + 2000;
        return `${type} ${en.id} at ${Math.round(en.x)}`;
      };
      const notes = [];
      if (pose.snake) notes.push(pick('snake', pose.snake));
      if (pose.boa) notes.push(pick('boa', pose.boa));
      const c = e.camera;
      // (pinned on the gap sideways; upright the view is narrow, so it frames the middle of Pokey and the animal)
      const wide = c.viewportWidth > c.viewportHeight;
      const foe = pose.snake ?? pose.boa;
      const near = foe && Math.abs(foe.x - p.x) < 600;
      const [fx, fy] = pose.camUp && !wide ? pose.camUp : pose.cam && wide ? pose.cam : pose.cam && near ? [(p.x + foe.x) / 2, pose.cam[1]] : pose.cam ? [p.x + 120, pose.cam[1]] : [p.x + c.viewportWidth * 0.08, p.y];
      c.x = c.targetX = fx - c.viewportWidth * 0.5;
      c.y = c.targetY = fy - c.viewportHeight * (c.viewportWidth > c.viewportHeight ? 0.62 : 0.55);
      // (the animals' poses follow game time: let a little pass between two draws, nothing moves)
      for (let i = 0; i < 3; i++) { e.gameTime += 0.04; e.render(); }
      return notes.join('; ');
    }, beat.pose);
    if (beat.pose.key) {
      // a real punch or kick, stepped one 30 fps frame at a time with the key held
      await page.keyboard.down(beat.pose.key);
      const camY = await page.evaluate(() => window.__engine().camera.y);
      for (let i = 0; i < beat.pose.steps; i++) await page.evaluate((cy) => { const e = window.__engine(); e.update(1 / 30); const p = e.player; const c = e.camera; c.x = c.targetX = p.x + c.viewportWidth * 0.08 - c.viewportWidth * 0.5; c.y = c.targetY = cy; e.render(); }, camY);
      await page.keyboard.up(beat.pose.key);
      // (then the game runs on a few frames: the stars turn, the ball rolls)
      for (let i = 0; i < (beat.pose.after ?? 0); i++) await page.evaluate((cy) => { const e = window.__engine(); e.update(1 / 30); const p = e.player; const c = e.camera; c.x = c.targetX = p.x + c.viewportWidth * 0.08 - c.viewportWidth * 0.5; c.y = c.targetY = cy; e.render(); }, camY);
    }
    // the paste-up points, as screen points of the shot (CSS px x2 for the deviceScaleFactor)
    if (beat.pose.marks) {
      MARKS[`${beat.id}-${tag}`] = await page.evaluate((marks) => {
        const e = window.__engine();
        const c = e.camera;
        const z = e.zoom ?? 1;
        const sc = (wx, wy) => [Math.round((wx - c.x) * z * 2), Math.round((wy - c.y) * z * 2)];
        const r = { zoom: z };
        for (const [k, v] of Object.entries(marks)) r[k] = v === 'foe' ? sc(window.__mockFoe.x, window.__mockFoe.y) : sc(v[0], v[1]);
        return r;
      }, beat.pose.marks);
    }
    await page.screenshot({ path: path.join(out, `${beat.id}-${tag}.png`) });
    console.log(tag, beat.id, note);
  }
  if (page) await page.context().close();
}
await b.close();
// merged into what an earlier run (another prefix or orientation) left
const mf = path.join(out, 'marks.json');
const old = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : {};
fs.writeFileSync(mf, JSON.stringify({ ...old, ...MARKS }, null, 1));
