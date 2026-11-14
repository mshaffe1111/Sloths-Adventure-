// B1 CHASE-CORE stills: the chase piece drawing in the real game (dev server), on a stage's own backdrop with a test branch swapped in
// (no stage lays a chase yet: B5's lay does). Upright 412x915 and sideways 915x412 at 2x, Normal and Easy; every still has its stage,
// setting, orientation, moment and the front's gap printed on it (D62). Moments: the crack just set off, the front close, on the fork.
//   node reference/qa-reports/B1/stills.mjs <port> <out dir> <stage>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, id] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const setting of ['normal', 'easy']) {
  for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await ctx.addInitScript((s) => localStorage.setItem('sloth_difficulty', s), setting);
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id, 1), id);
    await p.waitForTimeout(4000);
    // (no stage line over the piece: every hint counts as said, as tools/engine/runs/stills-at.mjs does; the stage card waited out)
    await p.evaluate((E) => { const e = eval(E); for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; e.clearGuide?.(); }, E);
    const card = await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).then(() => 'gone', () => 'STILL UP');
    console.log('stage card', card);
    await p.waitForTimeout(3000);
    // (the branch: a run-up, a stretch of 200 px sections, a living fork, the next stretch; at the player's own ground height)
    const built = await p.evaluate((E) => {
      const e = eval(E);
      e.isPaused = true;
      const y = Math.round(e.player.y);
      const x0 = Math.round(e.player.x) - 600;
      const plats = [];
      let pid = 90000;
      const put = (a, z, chase) => { for (let x = a; x < z; x += 200) plats.push({ id: pid++, x: x0 + x, y, width: Math.min(200, z - x), height: 40, type: 'solid', ...(chase ? { chase: true } : {}) }); };
      put(0, 400, false);
      put(400, 3000, true);
      plats.push({ id: pid++, x: x0 + 3000, y, width: 400, height: 40, type: 'solid' });
      put(3400, 6000, true);
      plats.push({ id: pid++, x: x0 + 6000, y, width: 600, height: 40, type: 'solid' });
      const solid = plats.filter((q) => !q.chase);
      Object.assign(e, { platforms: plats, vines: [], ropes: [], enemies: [], collectibles: [], drawPlats: solid, paintedPlats: solid });
      e.currentStage.chase = { stretches: [{ start: x0 + 900, end: x0 + 3000 }, { start: x0 + 3400, end: x0 + 6000, last: true }] };
      e.checkpoint = { x: x0 + 3200, y };
      return { x0, y, easy: e.easy };
    }, E);
    const shots = [
      // [name, where he stands (from x0), seconds the chase runs before the still, the first front set here (from x0) as a scene setup]
      ['crack', 910, 0.35, null],
      ['close', 910, 1.6, null],
      ['fork', 3150, 2.0, 2700],
    ];
    // (the camera: the game's own, centred on him, except 'close', which is framed from the front so the falling sections are in
    // view: the chase camera that looks back is B6's, measured there)
    const lookBack = (name) => name === 'close';
    for (const [name, at, secs, preset] of shots) {
      const info = await p.evaluate(([E, built, at, secs, preset]) => {
        const e = eval(E);
        // (no piece runs while he is placed and the camera settles on him)
        e.pieces = [];
        for (const q of e.platforms) q.broken = false;
        Object.assign(e.player, { x: built.x0 + at, y: built.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9, hp: e.player.maxHp ?? e.player.hp });
        for (let i = 0; i < 45; i++) e.update(1 / 30);
        e.startPieces();
        if (preset !== null) Object.assign(e.pieces.find((q) => q.kind === 'chase').run.fronts[0], { front: built.x0 + preset, active: true, hold: 0 });
        const n = Math.round(secs * 30);
        for (let i = 0; i < n - 12; i++) e.update(1 / 30);
        return { n, kinds: e.pieces.map((q) => q.kind) };
      }, [E, built, at, secs, preset]);
      for (let i = 0; i < 12; i++) {
        await p.evaluate(([E, back]) => {
          const e = eval(E);
          e.update(1 / 30);
          e.clearGuide?.();
          e.player.invincibleTimer = 0;
          const pc = e.pieces.find((q) => q.kind === 'chase');
          const f = pc?.run.fronts.find((q) => q.active);
          if (back && f) e.camera.x = e.camera.targetX = f.front - e.camera.viewportWidth * 0.12;
          e.render();
        }, [E, lookBack(name)]);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
      }
      const gap = await p.evaluate(([E, id, setting, tag, name]) => {
        const e = eval(E);
        const pc = e.pieces.find((q) => q.kind === 'chase');
        const fronts = pc ? pc.run.fronts.filter((f) => f.active).map((f) => Math.round(e.player.x - f.front)) : [];
        let el = document.getElementById('b1cap');
        if (!el) {
          el = document.createElement('div');
          el.id = 'b1cap';
          el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;font:600 12px/1.3 monospace;color:#fff;background:rgba(0,0,0,.7);padding:4px 6px;border-radius:4px;pointer-events:none';
          document.body.appendChild(el);
        }
        el.textContent = `B1 chase piece | ${id} | built ${e.easy ? 'EASY' : 'NORMAL'} (asked ${setting}) | ${tag} | ${name}${name === 'close' ? ' (camera framed on the front)' : ''} | front ${fronts.join(', ') || 'none'} px behind | hp ${e.player.hp}`;
        return { fronts, easy: e.easy, hp: e.player.hp, x: Math.round(e.player.x) };
      }, [E, id, setting, tag, name]);
      const file = path.join(out, `${id}-${setting}-${name}-${tag}.jpg`);
      await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
      console.log('wrote', file, JSON.stringify({ ...gap, kinds: info.kinds }));
    }
    await ctx.close();
  }
}
await b.close();
