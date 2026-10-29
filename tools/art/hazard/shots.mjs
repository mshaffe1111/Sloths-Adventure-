// Stills of the repeating hazard effects swept on hazard-anim (2026-10-29), upright 390x844 and sideways 844x390, on the game's own
// clock (stepped 1/30 s at a time, so each shot is a set moment): 4-7's rock through open air and its updraft, 4-8's spout running onto
// the boulder, 4-4's rock warning, and the shared particles (double-jump leaves, a splash, wood and stone debris, a feather burst, kick
// sparks). Needs a dev server on <port>; run it against the base branch for the "before" set.
//   node tools/art/hazard/shots.mjs <port> <out dir> <tag> [scene,...]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '5173', out = '.', tag = 'after', only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// rockfall.ts rockAt, for the page (to step to a set moment of a drop's cycle)
const ROCKAT = `(r, t) => { const fallT = Math.max(0.01, (r.land - r.top) / 620); const c = (((t + r.offset) % r.every) + r.every) % r.every;
  const warnAt = r.every - r.warn - fallT - 0.5; if (c < warnAt) return { phase: 'idle', u: c / warnAt }; if (c < warnAt + r.warn) return { phase: 'warn', u: (c - warnAt) / r.warn };
  const f = c - warnAt - r.warn; if (f < fallT) return { phase: 'fall', u: f / fallT }; return { phase: 'shatter', u: (f - fallT) / 0.5 }; }`;

const SCENES = {
  // 4-7: the first rock through open air, three moments of its warning and fall
  air: { stage: '4-7', setup: `const r = e.proto.w4.rocks.find((q) => q.air); const hold = { x: r.x - 170, y: (r.top + r.land) / 2 + 60 };
      // (held in the air beside its path, out of reach, so the whole fall is in view; he would otherwise drop into the mist)
      setInterval(() => Object.assign(e.player, hold, { vx: 0, vy: 0, invincibleTimer: 9 }), 4); Object.assign(e.player, hold); return r;`,
    moments: [['warn', 0.55], ['warn', 0.95], ['fall', 0.5]] },
  // 4-4: the ground rock, its warning half way and late, its impact
  rock: { stage: '4-4', setup: `const r = e.proto.w4.rocks.filter((q) => !q.air)[0]; Object.assign(e.player, { x: r.x - 120, y: r.land, vx: 0, vy: 0, facing: 1 }); return r;`,
    moments: [['warn', 0.5], ['warn', 0.95], ['shatter', 0.1]] },
  // 4-7: an updraft, from its foot
  updraft: { stage: '4-7', setup: `const u = e.proto.w4.updrafts[0]; const lp = e.platforms.filter((p) => p.x + p.width <= u.x0 + 10).sort((a, b) => b.x + b.width - a.x - a.width)[0];
      Object.assign(e.player, { x: lp.x + lp.width - 30, y: lp.y, vx: 0, vy: 0, facing: 1, grounded: true }); return null;`, wait: [1.5] },
  // 4-8: the boulder rolled under the spout, the water running onto it
  spout: { stage: '4-8', setup: `const w = e.proto.w4.falls.find((f) => f.plug); const b = e.platforms.find((p) => p.id === w.plug.platformId); b.x = w.plug.atX;
      Object.assign(e.player, { x: b.x - 160, y: b.y + b.height, vx: 0, vy: 0, facing: 1 }); return null;`, wait: [3] },
  // the shared particles, all at once beside him (4-4's ledge)
  fx: { stage: '4-4', setup: `const r = e.proto.w4.rocks.filter((q) => !q.air)[0]; Object.assign(e.player, { x: r.x - 120, y: r.land, vx: 0, vy: 0, facing: 1 });
      window.__fx = () => { const p = e.player; e.spawnDoubleJumpBurst(p.x - 70, p.y - 60); e.spawnWaterSplash(p.x + 110, p.y); e.spawnDebrisBurst(p.x + 230, p.y - 40, '#a16207');
        e.spawnDebrisBurst(p.x - 190, p.y - 40, '#a8a29e'); e.spawnEagleFeatherBurst(p.x + 20, p.y - 170); e.spawnKickHitBurst(p.x + 60, p.y - 110); }; return null;`, fx: true, wait: [0.1, 0.3] },
  // 4-4: in a wind lane while it blows (and in its warning)
  gust: { stage: '4-4', setup: `const z = e.currentStage.zones.find((q) => q.dir); const x = (z.x0 + z.x1) / 2;
      const pl = e.platforms.filter((p) => p.x < x && p.x + p.width > x).sort((a, b) => a.y - b.y).pop(); Object.assign(e.player, { x, y: pl.y, vx: 0, vy: 0 });
      window.__z = z; return null;`, gust: true },
  // 4-9: the Sovereign's pass overhead (her shadow racing along the ledge) and her feather drifting down
  omen: { stage: '4-9', setup: `const o = e.proto.w4.omens.find((q) => q.kind === 'shadow'); const i = e.proto.w4.omens.indexOf(o);
      const pl = e.platforms.filter((p) => p.x < o.x - 60 && p.x + p.width > o.x - 60 && Math.abs(p.y - o.y) < 40)[0];
      Object.assign(e.player, { x: o.x - 60, y: pl ? pl.y : o.y, vx: 0, vy: 0 });
      window.__arm = () => { e.w4.omenAt[i] = NaN; e.player.x = o.x + 4; }; return null;`, wait: [1.2, 1.7] },
  feather: { stage: '4-9', setup: `const o = e.proto.w4.omens.find((q) => q.kind === 'feather'); const i = e.proto.w4.omens.indexOf(o);
      const pl = e.platforms.filter((p) => p.x < o.x - 60 && p.x + p.width > o.x - 60 && Math.abs(p.y - o.y) < 40)[0];
      Object.assign(e.player, { x: o.x - 60, y: pl ? pl.y : o.y, vx: 0, vy: 0 });
      window.__arm = () => { e.w4.omenAt[i] = NaN; e.player.x = o.x + 4; }; return null;`, wait: [3, 7] },
  // the eagle's shadow sweeping the grass (World 1's watch; shown here on 4-4's ledge, the same drawing)
  watch: { stage: '4-4', setup: `const r = e.proto.w4.rocks.filter((q) => !q.air)[0]; Object.assign(e.player, { x: r.x - 120, y: r.land, vx: 0, vy: 0, facing: 1 });
      Object.defineProperty(e, 'watchShadowAt', { get: () => ({ x: e.player.x + 150, a: 0.5 }), set: () => {} }); return null;`, wait: [0.5] },
};

const b = await chromium.launch();
for (const [name, sc] of Object.entries(SCENES)) {
  if (only && !only.split(',').includes(name)) continue;
  for (const [ori, w, h] of [['side', 844, 390], ['up', 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    p.on('pageerror', (er) => console.log('ERR', er.message));
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((s) => window.__play(s), sc.stage);
    await p.waitForTimeout(6000);
    for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
    const r = await p.evaluate(`(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.invincibleTimer = 0; ${sc.setup} })()`);
    await p.waitForTimeout(2500);
    // (the fake clock for set moments of a rock's cycle; the particle scene runs on real time, which the fake clock stalled)
    if (!sc.fx) await p.clock.install();
    const shots = [];
    if (sc.gust) {
      // step to the middle of its warning, then to its strongest
      for (const want of ['warn', 'active']) {
        for (let i = 0; i < 600; i++) {
          const ph = await p.evaluate(`(async () => { let e = window.__engine; if (typeof e === 'function') e = e(); const Z = await import('/src/game/zones.ts');
            const s = Z.zoneState(window.__z, e.gameTime); return s.phase + ':' + (s.u ?? 0).toFixed(2) + ':' + (s.strength ?? 0).toFixed(2); })()`);
          const [phh, u, st] = ph.split(':').map((v, k) => (k ? Number(v) : v));
          if (phh === want && (want === 'warn' ? u >= 0.5 : st >= 0.95)) break;
          await p.clock.runFor(1000 / 30);
        }
        shots.push(want);
        await p.screenshot({ path: join(out, `${tag}-${name}-${ori}-${want}.png`) });
      }
    } else if (sc.moments) {
      for (const [ph, uu] of sc.moments) {
        // step until the drop is at that moment of its cycle (within a frame)
        for (let i = 0; i < 400; i++) {
          const s = await p.evaluate(`(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.invincibleTimer = 9; return (${ROCKAT})(${JSON.stringify(r)}, e.gameTime); })()`);
          if (s.phase === ph && s.u >= uu) break;
          await p.clock.runFor(1000 / 30);
        }
        shots.push(`${ph}${Math.round(uu * 100)}`);
        await p.screenshot({ path: join(out, `${tag}-${name}-${ori}-${shots.at(-1)}.png`) });
      }
    } else {
      if (sc.fx) await p.evaluate('window.__fx()');
      await p.evaluate('window.__arm && window.__arm()');
      let at = 0;
      for (const s of sc.wait) {
        if (sc.fx) await p.waitForTimeout((s - at) * 1000);
        else await p.clock.runFor((s - at) * 1000);
        at = s;
        shots.push(`${Math.round(s * 100)}`);
        await p.screenshot({ path: join(out, `${tag}-${name}-${ori}-${shots.at(-1)}.png`) });
      }
    }
    console.log(name, ori, shots.join(' '));
    await p.close();
  }
}
await b.close();
