// botrec — the first-timer bot's run (botlog.ts) replayed in the real game in a browser, recorded as a clip a person can watch.
// Pokey follows the logged run exactly (his fields are put back each frame before the engine's own update, so the rest of the stage,
// the camera, Dot, the HUD and the art all run and draw as on a phone). Captions: stage, time, lives lost, the bot's rescues.
//   node tools/quality/botrec.mjs <port> <run.json> <out dir> [side|up|both] [every=2]
// (dev server: npx vite --port=<port> --host=127.0.0.1 --strictPort). Writes <id>-<side|up>.mp4 at 30/every fps (real time) and stills.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port, runPath, out, oriArg = 'both', everyS = '2'] = process.argv.slice(2);
const every = Number(everyS);
const run = JSON.parse(readFileSync(runPath, 'utf8'));
mkdirSync(out, { recursive: true });
const ORIS = [['side', 844, 390], ['up', 390, 844]].filter(([o]) => oriArg === 'both' || oriArg === o);
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
// captions: a harm or a rescue stays on screen 2.5 s
const events = [
  ...run.harms.filter((h) => h.kind === 'life').map((h) => ({ t: h.t, text: `life lost (${h.cause})` })),
  ...run.stuck.map((s) => ({ t: s.t, text: `bot stuck ${Math.round(s.dur)}s: ${s.what}${s.rescued ? ' (put further on)' : ''}`.slice(0, 90) })),
];
const b = await chromium.launch();
for (const [ori, w, h] of ORIS) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }); // a phone: touch wording and controls
  p.on('pageerror', (er) => console.log('PAGE', er.message));
  await p.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, run.who === 'KID' ? 'easy' : 'normal');
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function' && typeof window.__engine === 'function', null, { timeout: 120000 });
  await p.waitForTimeout(1500);
  await p.evaluate(([s, l]) => window.__play(s, l), [run.id, run.seed]);
  await p.waitForFunction(() => { const e = typeof window.__engine === 'function' ? window.__engine() : null; return !!(e && e.currentStage && e.player); }, null, { timeout: 120000 });
  await p.waitForTimeout(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
  await p.evaluate(() => {
    const e = window.__engine();
    if (!e) throw new Error('no engine');
    const st = { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false, kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0 };
    const inp = { state: st, source: 'gesture', airJumpReady: false, kickNear: true, onVine: false, megaReady: true, onFocusLost: null, jumpBuffer: 0, punchBuffer: 0, kickBuffer: 0,
      update(dt) { for (const [b, k] of [['jumpBuffer', 'jumpPressed'], ['punchBuffer', 'punchPressed'], ['kickBuffer', 'kickPressed']]) { if (this[b] > 0) { this[b] -= dt; if (this[b] <= 0) st[k] = false; } else st[k] = false; } st.megaPunchPressed = false; st.layerSwitchPressed = false; },
      triggerHaptic() {}, clearAll() {} };
    e.input = inp;
    e.isRunning = false; // the game's own loop stops (its rAF returns at once); we step and draw it ourselves
    e.loseLife = () => {};
    e.inputGrace = 0;
    const cap = document.createElement('div');
    cap.id = '__qcap';
    Object.assign(cap.style, { position: 'fixed', left: '50%', bottom: '6px', transform: 'translateX(-50%)', zIndex: 99999, font: 'bold 12px sans-serif', color: '#fff', background: 'rgba(0,0,0,.55)', padding: '2px 8px', borderRadius: '6px', pointerEvents: 'none', whiteSpace: 'nowrap' });
    document.body.appendChild(cap);
    window.__qboss = () => { e.introT = 99; let n = 0; while ((e.entrance || !e.entranceDone) && n++ < 900) e.update(1 / 30); return n; };
    window.__qstep = (fr, prev, text) => {
      if (prev) Object.assign(e.player, prev);
      const pad = fr.pad || {};
      st.left = !!pad.left && !pad.right; st.right = !!pad.right && !pad.left; st.down = !!pad.down;
      st.up = !!pad.up || !!pad.jump || !!pad.press; st.jumpHeld = !!pad.jump || !!pad.press;
      if (pad.press) { st.jumpPressed = true; inp.jumpBuffer = 0.16; }
      if (pad.punch) { st.punchPressed = true; inp.punchBuffer = 0.12; }
      if (pad.kick !== undefined) { st.kickPressed = true; st.kickDir = pad.kick; inp.kickBuffer = 0.14; }
      e.player.invincibleTimer = 1e9;
      e.update(1 / 30);
      Object.assign(e.player, fr.p);
      if (fr.boss && e.boss) { Object.assign(e.boss, fr.boss); if (e.boss.ai && fr.ai) Object.assign(e.boss.ai, fr.ai); }
      e.player.invincibleTimer = 0;
      cap.textContent = text;
    };
    window.__qdraw = () => e.render();
  });
  if (run.boss) console.log('entrance frames', await p.evaluate(() => window.__qboss()));
  const dir = join(out, `${run.id}-${ori}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  let n = 0;
  for (let i = 0; i < run.frames.length; i++) {
    const fr = run.frames[i];
    const ev = events.filter((q) => fr.t >= q.t && fr.t < q.t + 2.5).map((q) => q.text).join(' · ');
    const jumped = i > 0 && Math.hypot(fr.p.x - run.frames[i - 1].p.x, fr.p.y - run.frames[i - 1].p.y) > 150;
    const text = `${run.id} · bot ${run.who === 'KID' ? 'Easy' : 'Normal'} · ${mmss(fr.t)}${ev ? ' · ' + ev : ''}`;
    await p.evaluate(([f, pr, tx]) => window.__qstep(f, pr, tx), [fr, i > 0 && !jumped ? run.frames[i - 1].p : fr.p, text]);
    if (i % every === 0) {
      await p.evaluate(() => window.__qdraw());
      await p.screenshot({ path: join(dir, `f${String(n++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 80 });
    }
  }
  await p.close();
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(30 / every), '-i', join(dir, 'f%05d.jpg'), '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', join(out, `${run.id}-${ori}.mp4`)]);
  console.log(run.id, ori, n, 'frames');
}
await b.close();
