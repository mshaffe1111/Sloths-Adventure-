// node proof.mjs [trials] -> 7-4's whole slide played in the real engine (the dev server on 4301) by a bot with a real thumb, Normal and
// Easy, upright and sideways. The bot sees an obstacle only once it is readable on screen; it steers after a reaction time (0.35 s plus
// up to 0.2 s); it aims each jump at the middle of that jump's window (measured by jumps.ts on the same course) and presses late by the
// house thumb plus judgement noise (Normal N(+30 ms, 76 ms), Easy N(+90 ms, 96 ms)); it holds down for a beam from about 0.45 s before.
// Nothing is frame-perfect: every press is a draw. Prints, for each run, the hits, falls, hearts and lives left and whether he got out.
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const trials = Number(process.argv[2] ?? 3);
const b = await chromium.launch();
const out = [];
for (const easy of [false, true]) {
  for (const vp of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    for (let trial = 0; trial < trials; trial++) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
      await p.addInitScript((d) => localStorage.setItem('sloth_difficulty', d), easy ? 'easy' : 'normal');
      await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
      await p.waitForTimeout(3000);
      await p.evaluate(() => window.__play('7-4'));
      await p.waitForTimeout(3000);
      for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click({ force: true }); await p.waitForTimeout(200); } else break; }
      // the course, to measure each jump's window in node (the same SlideSim)
      const course = await p.evaluate(() => { const e = window.__engine(); e.isPaused = true; e.player.x = 3320; e.player.y = 580; for (let i = 0; i < 600 && e.slideRun.phase !== 'slide'; i++) e.update(1 / 30); return JSON.stringify(e.slideRun.sim.c); });
      const centres = JSON.parse(execFileSync('npx', ['tsx', new URL('./centres.ts', import.meta.url).pathname], { input: course }).toString());
      const r = await p.evaluate(([centres, easy, seed]) => {
        const e = window.__engine();
        const run = e.slideRun, sim = run.sim, v = sim.c.speed;
        let a = seed >>> 0;
        const rnd = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
        const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
        const mu = easy ? 0.09 : 0.03, sd = easy ? 0.0955 : 0.0762;
        const obs = sim.sorted;
        const plan = new Map(); // i -> { seenAt, pressAt (s before arrival), react }
        const base = e.input.update.bind(e.input);
        let want = 1, steerAt = 0, t = 0;
        let lives0 = e.lives ?? e.livesLeft ?? null, hearts = [];
        e.input.update = (dt) => {
          base(dt);
          const s = e.input.state;
          Object.assign(s, { left: false, right: false, jumpPressed: false, jumpHeld: false, down: false });
          if (run.phase !== 'slide') return;
          t += dt;
          const camZ = sim.z - 4.2;
          for (let i = 0; i < obs.length; i++) {
            const o = obs[i];
            if (o.z + o.len < sim.z) continue;
            if (o.z - camZ > 20) break;
            if (!plan.has(i)) plan.set(i, { seenAt: t, react: 0.35 + rnd() * 0.2, press: (centres[i] ?? 0.3) - (mu + sd * gauss()), duck: 0.45 + (rnd() - 0.5) * 0.2, done: false });
          }
          // steering: the next head or column in view, once reacted to
          const next = obs.findIndex((o, i) => plan.has(i) && o.z + o.len > sim.z && (o.kind === 'head' || o.kind === 'column'));
          if (next >= 0) {
            const o = obs[next], pl = plan.get(next);
            if (t - pl.seenAt >= pl.react && o.lanes.includes(want)) {
              const free = [0, 1, 2].filter((l) => !o.lanes.includes(l));
              want = free.sort((x, y) => Math.abs(x - want) - Math.abs(y - want))[0];
            }
          }
          const tx = (want - 1) * 1.2;
          if (tx < sim.x - 0.1) s.left = true;
          else if (tx > sim.x + 0.1) s.right = true;
          for (const [i, pl] of plan) {
            const o = obs[i];
            const tt = (o.z - sim.z) / v;
            if (o.z + o.len < sim.z || pl.done) continue;
            const jump = o.kind === 'rubble' || o.kind === 'gap' || (o.kind === 'column' && o.lanes.includes(Math.round(sim.x / 1.2) + 1));
            if (jump && tt <= pl.press) { s.jumpPressed = true; s.jumpHeld = true; pl.done = true; }
            if (o.kind === 'beam' && tt <= pl.duck) s.down = true;
          }
        };
        e.player.hp = e.player.maxHp;
        let frames = 0, minHp = e.player.hp;
        while (run.phase === 'slide' && frames < 30 * 400) {
          e.update(1 / 30);
          frames++;
          minHp = Math.min(minHp, e.player.hp);
          if (frames % 30 === 0) hearts.push(e.player.hp);
        }
        e.input.update = base;
        return { phase: run.phase, out: run.phase === 'out' || sim.outT >= 0, hits: sim.hits, stumbles: sim.stumbles, hp: e.player.hp, maxHp: e.player.maxHp, minHp, lives0, lives: e.lives ?? e.livesLeft ?? null, secs: (frames / 30).toFixed(1) };
      }, [centres, easy, 1000 + trial * 77 + (vp.width > vp.height ? 7 : 0)]);
      const row = { setting: easy ? 'Easy' : 'Normal', view: vp.width > vp.height ? 'sideways' : 'upright', trial, ...r };
      console.log(JSON.stringify(row));
      out.push(row);
      await p.close();
    }
  }
}
await b.close();
