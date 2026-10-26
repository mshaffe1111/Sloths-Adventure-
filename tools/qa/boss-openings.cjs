/**
 * Boss fairness retest (QA): every weak-point opening in a fight, how long it stays open, and where it is from Pokey.
 *   node tools/qa/boss-openings.cjs <stage> [port|land] [seconds] [game url]     e.g. 3-10 port 75 'http://127.0.0.1:4304/?proto=1'
 * Pokey is held invincible and stands still at spawn, so the boss comes to him. 'Open' = stun, or rec after a move in openAfter.
 */

const { chromium } = require('playwright');
const [stage, view, secs, URL] = [process.argv[2], process.argv[3] || 'port', Number(process.argv[4] || 90), process.argv[5] || 'http://127.0.0.1:4304/?proto=1'];
const VIEWS = { port: { width: 400, height: 720 }, land: { width: 844, height: 390 } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: VIEWS[view], isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const T0 = Date.UTC(2026, 9, 25, 12);
  await page.clock.install({ time: T0 }); await page.clock.pauseAt(T0 + 1000);
  await page.goto(URL + '&layout=1');
  await page.clock.runFor(3500);
  await page.evaluate((s) => window.__play(s), stage);
  await page.clock.runFor(3000);
  const wins = []; let cur = null; let t = 0; const states = {};
  for (let i = 0; i < secs * 30; i++) {
    await page.clock.runFor(33); t += 1 / 30;
    const s = await page.evaluate(() => {
      const e = window.__engine();
      if (e.isPaused && e.lessonClosed) e.lessonClosed();
      const btn = [...document.querySelectorAll('button')].find((x) => /Got it/.test(x.textContent) && !x.disabled); if (btn) btn.click();
      const p = e.player; p.invincibleTimer = 5; p.hp = Math.max(p.hp, 3);
      const B = e.boss, def = e.bossDef; if (!B || !def) return null;
      const st = B.ai?.state, mv = B.ai?.move;
      const open = st === 'stun' || (st === 'rec' && (!def.openAfter || (mv && def.openAfter.includes(mv))));
      const floor = p.grounded ? p.y : null;
      let r = null;
      try {
        if (def.weakAt) r = def.weakAt(B, floor ?? p.y);
        else { const k = st === 'stun' && def.weakStun ? def.weakStun : (st === 'rec' && mv && def.weakByMove?.[mv]) || def.weak; if (k) { const cx = B.x + B.facing * k.dx; const cy = (floor ?? p.y) - (B.ai?.air ?? 0) - k.dy; r = { x: cx - k.w / 2, y: cy - k.h / 2, w: k.w, h: k.w }; } }
      } catch (err) {}
      return { st, mv, open, hp: B.hp, maxHp: B.maxHp, bx: Math.round(B.x), px: Math.round(p.x), py: Math.round(p.y), weak: r && { cx: Math.round(r.x + r.w / 2), cy: Math.round(r.y + r.h / 2), bottom: Math.round(r.y + r.h) }, name: def.name || def.id };
    });
    if (!s) continue;
    states[s.st] = (states[s.st] || 0) + 1;
    if (s.open && !cur) cur = { start: t, at: s, move: s.mv, state: s.st };
    if (!s.open && cur) { cur.len = +(t - cur.start).toFixed(2); wins.push(cur); cur = null; }
  }
  console.log(JSON.stringify({ stage, view, secs, states, boss: wins[0]?.at.name, hp: wins[0]?.at.maxHp }));
  for (const w of wins) {
    const a = w.at; const dx = a.weak ? Math.abs(a.weak.cx - a.px) : Math.abs(a.bx - a.px);
    const up = a.weak ? a.py - a.weak.bottom : null;
    console.log(`t ${w.start.toFixed(1)}s | ${w.state}${w.move ? ' after ' + w.move : ''} | open ${w.len}s | weak point ${dx}px away, its bottom ${up}px above his feet`);
  }
  await b.close();
})();
