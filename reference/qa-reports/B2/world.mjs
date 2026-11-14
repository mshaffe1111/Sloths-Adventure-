// B2: the chase on a RealPlay.bare-equivalent world in the real page (dev server), shared by shoot.mjs and contrast.mjs.
// The stage is started by the game (__play), then swapped for a bare branch the same way RealPlay.bare does (realPlay.ts:328-340:
// platforms, no vines/ropes/pickups, no World 4 pieces, no proto; zones, water, rivers, checkpoints and the shrine cleared; the walls
// and the stage's runtime pieces started again), plus the draw lists the engine makes from its platforms at stage start
// (engine.ts:1061-1081), so nothing of the stage's own layout (its river, its props, its animals) is left under the branch.
// The stage keeps its own backdrop and its own height (the camera frames the branch as it frames that stage's ground).
export const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";

/** start a stage in the page with this difficulty set the way the game reads it (localStorage sloth_difficulty, D62) */
export async function openStage(b, { id, setting, w, h, video }) {
  // (a clip records at 1x: Playwright's recorder at 2x drew the page into a corner of a grey frame, B2 11-14)
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: video ? 1 : 2, ...(video ? { recordVideo: { dir: video, size: { width: w, height: h } } } : {}) });
  await ctx.addInitScript((s) => localStorage.setItem('sloth_difficulty', s), setting);
  const p = await ctx.newPage();
  // (the clip's recording starts with the page: its offset is measured from here)
  p.__t0 = Date.now();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${process.env.PORT ?? 5199}/?lessons=off`);
  await p.waitForTimeout(2500);
  // (an old save that has already seen this stage's story asides, wayside.ts: 1-2's line came up over the chase, B2's first clips)
  await p.evaluate(async (id) => {
    const w = await import('/src/game/wayside.ts');
    const [world, mini] = id.split('-').map(Number);
    for (const f of ['L', 'H', 'F']) w.markShown(world, mini, f);
  }, id);
  await p.evaluate((id) => window.__play(id, 1), id);
  // (the engine is made, however busy the machine: a fixed wait found none under the gates, B2)
  await p.waitForFunction((E) => !!eval(E)?.currentStage, E, { timeout: 60000, polling: 250 });
  await p.waitForTimeout(3000);
  await p.evaluate((E) => { const e = eval(E); for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; e.clearGuide?.(); }, E);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => console.log('stage card STILL UP'));
  await p.waitForTimeout(2500);
  const tapped = await p.getByText(/Tap here when you/).first().click({ timeout: 2500 }).then(() => 'tapped', () => 'none');
  if (tapped === 'tapped') await p.waitForTimeout(600);
  return { ctx, p };
}

/**
 * the bare branch: a run-up, stretch 1 (200 px sections), a living fork, stretch 2 (the last), a far fork; at his ground height.
 * Returns x0 (the branch's left end), y and the lay. Section length is the lay's (B5 lays the stage's own platforms).
 */
export async function bareBranch(p) {
  return p.evaluate(async (E) => {
    const e = eval(E);
    e.isPaused = true;
    const art = await import('/src/game/protoArt.ts');
    const st = e.currentStage;
    const y = Math.round(e.player.y);
    const x0 = Math.max(400, Math.round(e.player.x) - 600);
    const plats = [];
    let pid = 90000;
    const put = (a, z, chase) => { for (let x = a; x < z; x += 200) plats.push({ id: pid++, x: x0 + x, y, width: Math.min(200, z - x), height: 40, type: 'solid', ...(chase ? { chase: true } : {}) }); };
    // (the run-up is one piece, as the forks are, so the painted kit draws it: 200 px solids were left to the plain code-drawn
    // platform, flat bars in B2's first sideways clips)
    plats.push({ id: pid++, x: x0, y, width: 600, height: 40, type: 'solid' });
    put(600, 3000, true);
    plats.push({ id: pid++, x: x0 + 3000, y, width: 400, height: 40, type: 'solid' });
    put(3400, 6000, true);
    plats.push({ id: pid++, x: x0 + 6000, y, width: 600, height: 40, type: 'solid' });
    const lay = { stretches: [{ start: x0 + 900, end: x0 + 3000 }, { start: x0 + 3400, end: x0 + 6000, last: true }] };
    // (RealPlay.bare's swap, realPlay.ts:328-340)
    Object.assign(e, { platforms: plats, vines: [], ropes: [], collectibles: [], w4: null, proto: null, enemies: [] });
    Object.assign(st, { zones: [], waterY: undefined, rivers: [], exitTotemX: 0, checkpoints: [], chase: lay });
    e.walls = e.mode.bounds({ levelWidth: st.config.levelWidth, exit: { x: 0, y: st.exitTotemY }, spawn: { x: st.spawnX, y: st.spawnY } });
    // (the engine's own draw lists from these platforms, engine.ts:1061-1081)
    e.drawPlats = plats.filter((pl) => !pl.push && !pl.chase && !pl.crown && !pl.art);
    if (e.paintKit) {
      const painted = art.paintedPlatforms(plats);
      e.paintedPlats = plats.filter((pl) => !painted.has(pl.id) && !pl.chase && !pl.crown && !pl.art);
      e.swingVines = [];
    }
    e.startPieces();
    e.checkpoint = { x: x0 + 300, y };
    return { x0, y, lay, secs: plats.filter((q) => q.chase).map((q) => ({ x0: q.x, x1: q.x + q.width })), easy: e.easy, world: st.config.worldIndex, levelHeight: st.config.levelHeight, levelWidth: st.config.levelWidth, kinds: e.pieces.map((q) => q.kind) };
  }, E);
}

/** the caption (D62): what the game BUILT, read from the engine and the page */
export async function caption(p, text) {
  await p.evaluate((text) => {
    let el = document.getElementById('b2cap');
    if (!el) {
      el = document.createElement('div');
      el.id = 'b2cap';
      el.style.cssText = 'position:fixed;left:6px;right:6px;bottom:6px;z-index:99999;font:600 11px/1.3 monospace;color:#fff;background:rgba(0,0,0,.72);padding:3px 6px;border-radius:4px;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent = text;
  }, text);
}
