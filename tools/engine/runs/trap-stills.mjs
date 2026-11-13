// W1C: stills of a drop trap over a cast animal in the real page (the stage as built; the engine paused and stepped by hand, as
// stills-at.mjs does): BEFORE (he stands at the handle, the load hangs over the animal), THE TRAP (his blow has landed, the load is
// on its way down) and THE GLIDE (the animal leaving), 2x, upright 412 x 915 and sideways 915 x 412.
//   node tools/engine/runs/trap-stills.mjs <port> <out dir> <prefix> <stage> <layout> [trap index, default 0] [easy]
// Prints one line a still, and what the engine said happened (the trap's phase, the animal's state, his hearts): a still is only
// written when the thing it is named for is true on that frame.
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, prefix, id, layout, idx = '0', easy] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
let bad = 0;
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => { console.log('ERR', e.message); bad++; });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  if (process.env.PAGE_SETUP) await p.evaluate(process.env.PAGE_SETUP);
  await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  const shot = async (name, note) => {
    const file = path.join(out, `${prefix}-${id}-L${layout}-trap${idx}-${name}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('wrote', file, JSON.stringify(note));
  };
  // BEFORE: he stands a step short of the handle, facing it
  const before = await p.evaluate(([i, E]) => {
    const e = eval(E);
    if (!e?.cast?.traps?.[i]) return { error: `no trap ${i}: ${e?.cast ? e.cast.traps.length + ' traps' : 'this stage has no cast'}` };
    const t = e.cast.traps[i], q = t.post;
    e.isPaused = true;
    const dir = q.loadX >= q.x ? 1 : -1;
    Object.assign(e.player, { x: q.x - dir * 34, y: q.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: dir, invincibleTimer: 9 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    for (let k = 0; k < 60; k++) e.update(1 / 30);
    e.clearGuide?.();
    e.player.invincibleTimer = 0;
    e.player.facing = dir;
    e.render();
    const m = e.cast.members.filter((c) => Math.abs(c.s.x - q.loadX) <= 170 && Math.abs(c.s.y - q.landY) <= 60 && c.s.phase !== 'gone');
    return { trap: t.phase, kind: q.kind, load: q.load, handleX: q.x, loadX: q.loadX, animals: m.map((c) => ({ x: Math.round(c.s.x), state: c.e.state })), hp: e.player.hp, heroX: Math.round(e.player.x) };
  }, [+idx, E]);
  if (before.error) { console.log('FAIL', before.error); bad++; await p.context().close(); continue; }
  await shot('1-before', before);
  // (ONLY=before: the one frame, for a beat that only needs to be seen as he meets it)
  if (process.env.ONLY === 'before') { await p.context().close(); continue; }
  // THE TRAP: his own punch (the real input), stepped until the load is about half-way down
  const fall = await p.evaluate(([i, E]) => {
    const e = eval(E);
    const t = e.cast.traps[i], q = t.post;
    // (the page's own touch punch: the input engine buffers it, so a raw flag would be cleared before the engine read it)
    e.inputGrace = 0;
    if (typeof e.input.triggerTouchPunch === 'function') e.input.triggerTouchPunch();
    else e.input.state.punchPressed = true;
    e.update(1 / 30);
    let n = 0;
    while (n++ < 90 && !(t.phase === 'falling' && t.y >= (q.loadY + q.landY) / 2 - 20)) e.update(1 / 30);
    e.render();
    return { trap: t.phase, y: Math.round(t.y), from: q.loadY, to: q.landY, steps: n, hp: e.player.hp };
  }, [+idx, E]);
  if (fall.trap !== 'falling') { console.log('FAIL the punch did not let the load go', JSON.stringify(fall)); bad++; }
  else await shot('2-trap', fall);
  // THE GLIDE: stepped until an animal under it is about a third of the way through leaving
  const glide = await p.evaluate(([i, E]) => {
    const e = eval(E);
    const t = e.cast.traps[i];
    let n = 0, g;
    while (n++ < 120 && !((g = e.enemies.find((q) => q.glide !== undefined && !q.defeated && q.glide >= 0.3)))) e.update(1 / 30);
    e.render();
    return { trap: t.phase, glide: g ? Math.round(g.glide * 100) / 100 : null, steps: n, hp: e.player.hp, cleared: e.player.enemiesDefeated };
  }, [+idx, E]);
  if (glide.glide === null) { console.log('FAIL nothing glided off', JSON.stringify(glide)); bad++; }
  else await shot('3-glide', glide);
  // AFTER: the load lying where it fell, the branch clear
  const after = await p.evaluate(([i, E]) => { const e = eval(E); for (let k = 0; k < 90; k++) e.update(1 / 30); e.render(); return { trap: e.cast.traps[i].phase, hp: e.player.hp, cleared: e.player.enemiesDefeated }; }, [+idx, E]);
  await p.waitForTimeout(900); // (the HUD's count is the page's own: give it its frame)
  await shot('4-after', after);
  await p.context().close();
}
await b.close();
process.exit(bad ? 1 : 0);
