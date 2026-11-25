// BUILD-23e: 2-3's final stills on the real page (a vite dev server on 5181), the engine paused and stepped by hand (stills23.mjs's way),
// 2x, upright 412 x 915 and sideways 915 x 412, Normal or Easy. Each still is written with what is true on its frame printed beside it:
//   0-whole-k   the whole stage, him stood at 8 points from the start to the exit (the camera on him)
//   5-spooked   one little one spooked back to its stretch's start (the engine's own spook state), him on in the reeds
//   5b-fetched  him walked back to it: it has rejoined the line
//   6-jetty     him at the jetty with the whole line behind him, stepped until they are home
//   (1-7's eagle look for the side-by-side: look17e.mjs)
//   node reference/qa-reports/BUILD-23/final23e.mjs <out dir> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const [out, easy] = process.argv.slice(2);
const set = easy ? 'easy' : 'normal';
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const open = async (id) => {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
  // (Easy is the saved setting (difficulty.ts DIFFICULTY_KEY in localStorage); the page has no URL switch for it: '&difficulty=easy' alone
  // loaded Normal, BUILD-23e found)
  if (easy) await p.addInitScript(() => localStorage.setItem('sloth_difficulty', 'easy'));
    await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
    await p.waitForTimeout(2500);
    await p.evaluate(([id]) => window.__play(id, 1), [id]);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    return p;
  };
  const tools = (p) => {
    const shot = async (name, note) => {
      const file = path.join(out, `b23e-${set}-${name}-${tag}.jpg`);
      // (Dot's cards tapped through, as a player does, then one paint without stepping)
      // (twice: a card can come up on the paint after the first pass)
      for (let pass = 0; pass < 2; pass++) {
        for (let k = 0; k < 4; k++) {
          const card = p.getByText("Tap here when you've read it", { exact: false });
          if (!(await card.count())) break;
          // (a tap in a card's first TAP_MIN_MS of GAME time does nothing (dotGuide.ts tap): half a second of steps first, him held still)
          const hold = (n) => p.evaluate(([E, n]) => { const e = eval(E); const x = e.player.x, y = e.player.y; for (let i = 0; i < n; i++) { e.update(1 / 30); Object.assign(e.player, { x, y, vx: 0, vy: 0 }); } }, [E, n]);
          await hold(15);
          await card.first().click({ timeout: 2000 }).catch(() => {});
          await hold(3);
          await p.waitForTimeout(400);
        }
        await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
        await p.waitForTimeout(600);
      }
      await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
      console.log('wrote', path.basename(file), JSON.stringify(note));
    };
    const settle = async (n = 20) => {
      for (let i = 0; i < n; i++) {
        await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
      }
    };
    const stand = (x, n = 60) => p.evaluate(([x, n, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < n; i++) e.update(1 / 30);
      return { x: Math.round(e.player.x), y: Math.round(e.player.y), ground: !!under };
    }, [x, n, E]);
    const info = () => p.evaluate((E) => {
      const e = eval(E), f = e.follow;
      return { px: Math.round(e.player.x), line: f ? f.line.map((q) => `${q.kind}:${q.state}@${Math.round(q.x)}`) : [], home: f ? f.home() : null, herons: f ? f.herons.map((hh) => `${hh.s.phase}${hh.lookX !== null ? '~' + Math.round(hh.lookX) : ''}`) : [], watch: e.watch ? e.watch.phase : null };
    }, E);
    return { shot, settle, stand, info };
  };

  // ---- 2-3
  const p = await open('2-3');
  const { shot, settle, stand, info } = tools(p);
  const g = await p.evaluate((E) => {
    const e = eval(E);
    return { spawn: Math.round(e.currentStage.spawnX), exit: Math.round(e.currentStage.exitTotemX), bushes: (e.proto?.bushes ?? []).map((q) => [q.x, q.w]),
      herons: e.follow.herons.map((hh) => [Math.round(hh.z.x0), Math.round(hh.z.x1)]), cages: e.collectibles.filter((c) => c.type === 'cage').map((c) => Math.round(c.x)).sort((a, c) => a - c) };
  }, E);
  console.log(tag, 'geometry', JSON.stringify(g));
  // 0. the whole stage, 8 points from the start to the exit
  for (let k = 0; k < 8; k++) {
    const x = Math.round(g.spawn + ((g.exit - 120 - g.spawn) * k) / 7);
    const s = await stand(x, 30);
    await settle(8);
    await shot(`0-whole-${k}`, { x, ...s });
  }
  // 5. a spooked one and its fetch: every cage freed by the engine's own freeing, him in the first heron's reeds with the line behind
  await p.evaluate((E) => { const e = eval(E); for (const c of e.collectibles.filter((q) => q.type === 'cage' && !q.collected)) { e.freeCritter(c); c.collected = true; } }, E);
  const hz = g.herons[0];
  const bed = g.bushes.find((q) => q[0] >= hz[0] - 1 && q[0] <= hz[1]) ?? g.bushes[0];
  await stand(bed[0] - 200, 10);
  // (walk him into the bed so the trail carries the line in behind him)
  await p.evaluate(([E, to]) => { const e = eval(E); for (let i = 0; i < 200 && e.player.x < to; i++) { e.player.x += 8; e.player.facing = 1; e.update(1 / 30); } for (let i = 0; i < 60; i++) e.update(1 / 30); }, [E, bed[0] + bed[1] - 30]);
  // (the engine's own spook state (follow.ts spook): the last little one runs back to its stretch's start and hides there; him held
  // still at the bed's far end, so no look is needed to stage it)
  const sp = await p.evaluate(([E, x0]) => {
    const e = eval(E);
    const f = e.follow.line.filter((q) => q.state === 'follow').at(-1);
    if (!f) return null;
    Object.assign(f, { state: 'spooked', backX: x0, back: false, slot: f.s });
    // (the engine's own mark over a spooked one, engine.ts updateFollow: '!' at its head)
    e.addFloatingText('!', f.x, f.y - 50, '#fde68a');
    const px = e.player.x;
    // (shot while it is still running back, out of the reed bed on the open mud: 330 px behind him, the bed starts 270 px back)
    for (let i = 0; i < 240 && !f.back && f.x > px - 330; i++) { e.update(1 / 30); e.player.x = px; e.player.vx = 0; }
    return { kind: f.kind, x: Math.round(f.x), back: f.back, behind: Math.round(px - f.x) };
  }, [E, hz[0]]);
  await shot('5-spooked', { sp, ...(await info()) });
  // (then on to where it hides: its stretch's start)
  await p.evaluate(([E, kind]) => { const e = eval(E); const f = e.follow.line.find((q) => q.kind === kind && q.state === 'spooked'); const px = e.player.x; for (let i = 0; i < 240 && f && !f.back; i++) { e.update(1 / 30); e.player.x = px; e.player.vx = 0; } }, [E, sp?.kind]);
  // 5b. him back to it: it rejoins the line (follow.ts rejoin, within the row's rejoin reach)
  const fx = await p.evaluate(([E, kind]) => {
    const e = eval(E);
    const f = e.follow.line.find((q) => q.kind === kind && q.state === 'spooked');
    if (!f) return null;
    for (let i = 0; i < 300 && f.state === 'spooked'; i++) { const d = f.x - e.player.x; e.player.facing = d < 0 ? -1 : 1; e.player.x += Math.sign(d) * Math.min(8, Math.abs(d)); e.update(1 / 30); }
    for (let i = 0; i < 25; i++) e.update(1 / 30);
    return { kind, state: f.state };
  }, [E, sp?.kind]);
  await settle(2);
  await shot('5b-fetched', { fx, ...(await info()) });
  // 6. the jetty home: him walked to the exit with the whole line, stepped until they are home
  await stand(g.exit - 420, 10);
  await p.evaluate(([E, to]) => {
    const e = eval(E);
    for (const q of e.follow.line) if (q.state !== 'home') Object.assign(q, { state: 'follow', x: e.player.x - 40, back: undefined });
    for (let i = 0; i < 160 && e.player.x < to; i++) { e.player.x += 6; e.player.facing = 1; e.update(1 / 30); }
    for (let i = 0; i < 150 && e.follow.home() < e.follow.line.length; i++) e.update(1 / 30);
  }, [E, g.exit - 60]);
  await settle(2);
  await shot('6-jetty', await info());
  await p.context().close();

}
await b.close();
