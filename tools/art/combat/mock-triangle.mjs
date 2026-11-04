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
];

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
      await page.evaluate((s) => window.__play(s, 1), beat.stage);
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
        Object.assign(en, { x: want.x, y: want.y, facing: want.facing ?? -1, asleep: false, defeated: false, vx: 0, stagger: want.stagger ?? 0, staggerMax: want.stagger ?? 0, recoil: want.recoil ?? 0, hitFlashTimer: 0 });
        if (want.state) { en.state = want.state; en.stateT = 0.2; }
        if (want.hp) en.hp = want.hp;
        if (want.stagger) en.state = 'patrol';
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
      const [fx, fy] = pose.cam && wide ? pose.cam : pose.cam && near ? [(p.x + foe.x) / 2, pose.cam[1]] : pose.cam ? [p.x + 120, pose.cam[1]] : [p.x + c.viewportWidth * 0.08, p.y];
      c.x = c.targetX = fx - c.viewportWidth * 0.5;
      c.y = c.targetY = fy - c.viewportHeight * (c.viewportWidth > c.viewportHeight ? 0.62 : 0.55);
      // (the animals' poses follow game time: let a little pass between two draws, nothing moves)
      for (let i = 0; i < 3; i++) { e.gameTime += 0.04; e.render(); }
      return notes.join('; ');
    }, beat.pose);
    if (beat.pose.key) {
      // a real punch or kick, stepped one 30 fps frame at a time with the key held
      await page.keyboard.down(beat.pose.key);
      for (let i = 0; i < beat.pose.steps; i++) await page.evaluate(() => { const e = window.__engine(); e.update(1 / 30); const p = e.player; const c = e.camera; c.x = c.targetX = p.x + c.viewportWidth * 0.08 - c.viewportWidth * 0.5; e.render(); });
      await page.keyboard.up(beat.pose.key);
    }
    await page.screenshot({ path: path.join(out, `${beat.id}-${tag}.png`) });
    console.log(tag, beat.id, note);
  }
  if (page) await page.context().close();
}
await b.close();
