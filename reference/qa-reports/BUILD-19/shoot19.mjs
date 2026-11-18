// BUILD-19b: 1-9's stills from the real page (the stage as built by the page's own seed list), each beat shot only when the thing it is
// named for is TRUE on that frame (the boa's phase, the freeze's slow motion, the eagle's eye over a boa), else a SKIP line says why.
// Way: shoot18.mjs / stills-at.mjs (the engine paused and stepped by hand; every step rendered and an animation frame waited, so the
// ground's paint keeps up), 2x, upright 412 x 915 and sideways 915 x 412, the setting from DIFF (normal | easy -> localStorage
// sloth_difficulty before load, D62). The WHOLE screen is shot (D79): the HUD, Dot's words, the edges.
//   DIFF=normal PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/BUILD-19/shoot19.mjs <port> <out dir> [layout]
// Each line printed: the beat, what the engine said on the shot frame (the boa's phase, his hearts lost, slow motion), the file.
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, layout = '1'] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
let skips = 0;
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((v) => window.__play('1-9', v), +layout);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  // the page's helpers: sections by template, the boas in one, the bough under a body, place him, step n frames rendering each
  await p.evaluate((E) => {
    const e = eval(E);
    e.isPaused = true;
    const st = e.currentStage;
    const W = (window.__s19 = {});
    W.e = e;
    W.sec = (id) => {
      const s = st.gen2.sections.find((q) => q.template === id);
      const ps = e.platforms.filter((q) => q.tag?.startsWith(`${s.uid}:`));
      return { uid: s.uid, a: Math.min(...ps.map((q) => q.x)), b: Math.max(...ps.map((q) => q.x + q.width)) };
    };
    W.piece = (id, key) => e.platforms.find((q) => q.tag === `${W.sec(id).uid}:${key}`);
    W.boas = (id) => { const s = W.sec(id); return e.cast.members.filter((m) => m.e.type === 'boa' && m.e.x >= s.a && m.e.x <= s.b).sort((p, q) => p.e.x - q.e.x); };
    W.eagles = () => e.cast.members.filter((m) => m.e.type === 'eagle');
    W.boughOf = (m) => { const cx = m.e.x + m.e.width / 2, foot = m.e.y + m.e.height; return e.platforms.filter((q) => !q.decorative && cx >= q.x && cx <= q.x + q.width && q.y >= foot - 40).sort((p, q) => Math.abs(p.y - foot) - Math.abs(q.y - foot))[0]; };
    W.under = (x, nearY) => e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((p, q) => nearY === undefined ? p.y - q.y : Math.abs(p.y - nearY) - Math.abs(q.y - nearY))[0];
    W.hintsShown = (keep) => { for (const hh of st.proto?.hints ?? []) hh.shown = keep ? keep !== hh.text : true; };
    W.place = (x, plat, facing = 1) => {
      const q = plat ?? W.under(x);
      Object.assign(e.player, { x, y: q ? q.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing, invincibleTimer: 0 });
      Object.assign(e.input.state, { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false });
    };
    W.frame = () => new Promise((r) => requestAnimationFrame(() => r(0)));
    // step until ok() (or n frames), each step rendered; returns the frames stepped, or -1 when ok() never came
    W.until = async (ok, n) => { for (let i = 0; i < n; i++) { if (ok()) return i; e.update(1 / 30); if (!W.keepGuide) e.clearGuide?.(); e.render(); await W.frame(); } return ok() ? n : -1; };
    // (a boa wakes on movement, never on a still sloth: he WALKS in, holding right, and lets go when ok() comes, as a player does)
    W.walk = async (dir, ok, n) => { e.input.state.right = dir > 0; e.input.state.left = dir < 0; const f = await W.until(ok, n); e.input.state.right = false; e.input.state.left = false; return f; };
    W.paint = async (k = 20) => { for (let i = 0; i < k; i++) { e.render(); await W.frame(); } };
    W.hurt = () => e.statHeartsLost;
    W.say = (m) => m ? `${m.e.type}@${Math.round(m.e.x)} ${m.s.phase} t${m.s.t.toFixed(2)}` : 'none';
    console.log('ready');
  }, E);
  const built = await p.evaluate(() => { const e = window.__s19.e; const g = e.currentStage.gen2; return JSON.stringify({ seed: g.seed, easy: !!e.easy, start: Math.round(e.player.x), boas: e.cast.members.filter((m) => m.e.type === 'boa').map((m) => Math.round(m.e.x)), sections: g.sections.map((s) => s.template.replace('w1-19-', '')) }); });
  console.log('BUILT', tag, DIFF, built);
  const shoot = async (name, note) => {
    const file = path.join(out, `19-${DIFF}-${name}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('SHOT', tag, name, note, file);
  };
  const skip = (name, why) => { skips++; console.log('SKIP', tag, name, why); };
  // (each beat: set up in the page, step to its moment, return {ok, note})
  // (Dot's card waits to be read; a player taps it once read (.dg-bub takes the tap after 400 ms): tapped before every beat but the arrival)
  const clearDot = async () => {
    for (let i = 0; i < 4; i++) {
      const bub = p.locator('.dg-bub');
      if (!(await bub.count()) || !(await bub.first().isVisible().catch(() => false))) return;
      await p.waitForTimeout(450);
      await bub.first().click({ timeout: 1500 }).catch(() => {});
      await p.waitForTimeout(350);
    }
  };
  const beat = async (name, fn, arg) => {
    if (!name.startsWith('01')) await clearDot();
    const r = await p.evaluate(fn, arg ?? null).catch((err) => ({ ok: false, note: `threw ${err.message}` }));
    if (r.ok) await shoot(name, r.note); else skip(name, r.note);
  };

  // 1. arrival: where the stage starts him, as the page left him (Dot's arrival words if she is saying them)
  await beat('01-arrival', async () => { const W = window.__s19; await W.paint(30); return { ok: true, note: `x${Math.round(W.e.player.x)} hurt ${W.hurt()}` }; });
  // 2. the freeze teach line on screen: he walks up to Dot's (b) with it unsaid
  await beat('02-teach-line', async () => {
    const W = window.__s19, e = W.e;
    const line = (e.currentStage.proto.hints ?? []).find((hh) => /Don't move/.test(hh.text));
    if (!line) return { ok: false, note: 'no "Don\'t move" line laid' };
    W.hintsShown(line.text);
    W.keepGuide = true;
    W.place(line.x - 200);
    const f = await W.walk(1, () => e.player.x > line.x + 40, 60);
    await W.until(() => false, 12);
    await new Promise((r) => setTimeout(r, 900));
    await W.paint(10);
    W.keepGuide = false;
    return { ok: true, note: `line at ${Math.round(line.x)} "${line.text}" ${f}` };
  });
  // 3-4. beat 2: he stands on the step above the freeze boa; it rears (3), he stays still: the first freeze's slow motion (4)
  await beat('03-freeze-rear', async () => {
    const W = window.__s19, e = W.e;
    W.hintsShown();
    const m = W.boas('w1-19-forest-freeze')[0], step = W.piece('w1-19-forest-freeze', 'e');
    W.place(step.x + 20, step, 1);
    const w = await W.walk(1, () => m.s.phase !== 'rest', 150);
    const f = await W.until(() => m.s.phase === 'tell' && m.s.t >= 0.45, 150);
    if (w < 0) return { ok: false, note: `never woke walking the step: ${W.say(m)} him x${Math.round(e.player.x)}` };
    if (f < 0) return { ok: false, note: `no rear in 5 s: ${W.say(m)}` };
    await W.paint(4);
    return { ok: true, note: `${W.say(m)} him x${Math.round(e.player.x)} hurt ${W.hurt()}` };
  });
  await beat('04-freeze-slowmo', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-forest-freeze')[0];
    const f = await W.until(() => e.slowMoBy === 'freeze' && e.slowMoLeft > 0.25, 90);
    if (f < 0) return { ok: false, note: `no freeze slow motion: ${W.say(m)} slowMo ${e.slowMoLeft.toFixed(2)} by ${e.slowMoBy}` };
    await W.paint(2);
    return { ok: true, note: `slowMo ${e.slowMoLeft.toFixed(2)} ${W.say(m)} hurt ${W.hurt()}` };
  });
  // 4b. 1.5 s after the freeze: does the beaten boa slide off ("Don't move, and it slides off!")?
  await beat('04b-after-freeze', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-forest-freeze')[0];
    const x0 = Math.round(m.e.x);
    await W.until(() => false, 45);
    await W.paint(2);
    return { ok: true, note: `${W.say(m)} moved ${Math.round(m.e.x) - x0} px hurt ${W.hurt()}` };
  });
  // 5. beat 1's trapped boa: he at the trap's handle, the load over the boa (trap-stills.mjs shoots the drop itself)
  await beat('05-trapped-boa', async () => {
    const W = window.__s19, e = W.e;
    W.hintsShown();
    const m = W.boas('w1-19-forest-freeze')[1];
    const t = (e.currentStage.proto.cast?.traps ?? []).find((q) => Math.abs(q.loadX - m.e.x) <= 140);
    if (!t) return { ok: false, note: 'no trap over the second boa' };
    W.place(t.x - 30);
    await W.until(() => false, 30);
    await W.paint(10);
    return { ok: true, note: `handle ${Math.round(t.x)} load ${Math.round(t.loadX)} ${W.say(m)} hurt ${W.hurt()}` };
  });
  // 6. the stair: its first boa rearing as he comes up
  await beat('06-stair', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-stair')[0], q = W.boughOf(m);
    W.place(Math.max(q.x + 8, m.e.x - 320), q, 1);
    await W.walk(1, () => m.s.phase !== 'rest', 150);
    const f = await W.until(() => m.s.phase === 'tell' && m.s.t >= 0.4, 120);
    await W.paint(4);
    return { ok: true, note: `${f < 0 ? 'NO REAR ' : ''}${W.say(m)} hurt ${W.hurt()}` };
  });
  // 7-8. the miss and the bop (beat 5): he waits just outside its strike; its head comes out and misses (7); he steps in and punches (8)
  await beat('07-miss', async (arg) => {
    // (shot on its first strike frame: the act is 0.42 s)
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-miss')[0], q = W.boughOf(m);
    const hurt0 = W.hurt();
    // (he walks in from the left until it rears, then backs off left out of its strike's reach (128) and waits: its head comes out, misses)
    W.place(Math.max(q.x + 8, m.e.x - 320), q, 1);
    await W.walk(1, () => m.s.phase === 'tell', 150);
    // (he keeps moving at the edge of its reach: a step back, a step in, so it strikes at the movement and its head falls short)
    let f = -1;
    for (let i = 0; i < 60 && f < 0; i++) f = await W.walk(i % 2 ? -1 : 1, () => m.s.phase === 'act', 1);
    if (f < 0) return { ok: false, note: `no strike: ${W.say(m)}` };
    await W.paint(2);
    const hit = W.hurt() > hurt0;
    return { ok: !hit, note: `${W.say(m)} him x${Math.round(e.player.x)} ${hit ? 'HIT' : 'missed'}` };
  });
  await beat('08-bop', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-miss')[0], q = W.boughOf(m);
    await W.walk(1, () => m.e.x - (e.player.x + e.player.width) < 20 || m.s.phase === 'recover' && m.s.t > 0.5, 40);
    e.input.state.punchPressed = true;
    const f = await W.until(() => m.s.phase === 'stunned' && m.s.t >= 0.15, 30);
    e.input.state.punchPressed = false;
    if (f < 0) return { ok: false, note: `no bop: ${W.say(m)} him x${Math.round(e.player.x)}` };
    await W.paint(2);
    return { ok: true, note: `${W.say(m)} hurt ${W.hurt()}` };
  });
  // 9. the roost (beat 7): he on the creaky limb as its boa rears, the eagle's roost in view
  await beat('09-roost', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-roost')[0], k = W.piece('w1-19-roost', 'k');
    W.place(k.x + 10, k, 1);
    // (what hurts him here, if anything: the frame, his place, the boa's)
    let h0 = W.hurt(), why = '';
    const watch = () => { if (W.hurt() > h0 && !why) why = `HURT at him x${Math.round(e.player.x)} y${Math.round(e.player.y)} boa ${W.say(m)} boa x${Math.round(m.e.x)} limb ${k.broken ? 'broken' : 'whole'}`; return false; };
    await W.walk(1, () => (watch(), m.s.phase !== 'rest'), 150);
    await W.until(watch, 45);
    const f = await W.until(() => m.s.phase === 'tell' && m.s.t >= 0.45, 150);
    await W.paint(4);
    const r = (e.currentStage.proto.gen2?.roosts ?? []).map((q) => Math.round(q.x));
    return { ok: true, note: `${why} ${f < 0 ? 'NO REAR ' : ''}${W.say(m)} roosts ${r} limb creak ${!!k.creak}/${k.type} hurt ${W.hurt()}` };
  });
  await beat('10-roost-after', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-roost')[0];
    await W.until(() => false, 45);
    await W.paint(4);
    return { ok: true, note: `${W.say(m)} cleared ${m.cleared} him x${Math.round(e.player.x)} y${Math.round(e.player.y)} hurt ${W.hurt()}` };
  });
  // 11. the hunters (beat 11): the eagle's eye crossing the boa
  await beat('11-eye-over-boa', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-hunters')[0];
    const g = W.eagles().filter((q) => q.e.patrolMinX < m.e.x + 400 && q.e.patrolMaxX > m.e.x - 400)[0];
    if (!g) return { ok: false, note: 'no eagle over the hunters' };
    W.place(Math.max(g.e.patrolMinX + 40, m.e.x - 260), undefined, 1);
    const over = () => e.cast.eyeOut() && Math.abs(g.s.eyeX - (m.e.x + m.e.width / 2)) < 160;
    const f = await W.until(over, 300);
    await W.paint(2);
    return { ok: f >= 0, note: `${f < 0 ? 'eye never over it: ' : ''}eye ${Math.round(g.s.eyeX)} ${W.say(g)} boa ${W.say(m)} hurt ${W.hurt()}` };
  });
  // 12. the Old Boa with its eagle's pass
  await beat('12-old-boa', async () => {
    const W = window.__s19, e = W.e;
    const m = W.boas('w1-19-old-boa')[0];
    const g = W.eagles().find((q) => q.e.patrolMinX < m.e.x && q.e.patrolMaxX > m.e.x + m.e.width);
    if (!g) return { ok: false, note: 'no eagle over the Old Boa' };
    W.place(m.e.x - 230, W.boughOf(m), 1);
    const over = () => e.cast.eyeOut() && Math.abs(g.s.eyeX - (m.e.x + m.e.width / 2)) < 200;
    const f = await W.until(over, 300);
    await W.paint(2);
    return { ok: true, note: `${f < 0 ? 'NO EYE OVER IT ' : ''}eye ${Math.round(g.s.eyeX)} ${W.say(g)} old ${W.say(m)} hurt ${W.hurt()}` };
  });
  // 13. the exit
  await beat('13-exit', async () => {
    const W = window.__s19, e = W.e;
    const s = W.sec('w1-19-exit');
    W.place(s.b - 260);
    await W.until(() => false, 30);
    await W.paint(10);
    return { ok: true, note: `exit ${Math.round(s.a)}-${Math.round(s.b)} him x${Math.round(e.player.x)} hurt ${W.hurt()}` };
  });
  await ctx.close();
}
await b.close();
console.log(`DONE skips ${skips}`);
