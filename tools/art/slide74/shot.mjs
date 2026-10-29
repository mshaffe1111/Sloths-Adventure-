import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const out = process.env.OUT ?? '/home/user/Sloths-Adventure-/reference/prop-sheets/qa-notes/7-4-slide-mockup/';
const [mode] = process.argv.slice(2);
const vp = mode === 'up' ? { width: 390, height: 844 } : { width: 844, height: 390 };
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
await p.waitForTimeout(4000);
await p.evaluate(() => window.__play('7-4'));
await p.waitForTimeout(4000);
const gotIt = async () => { for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click({ force: true }); await p.waitForTimeout(300); } else break; } };
await gotIt();
await p.addStyleTag({ content: ".dg-root{display:none!important}" });
const E = (fn, arg) => p.evaluate(([f, a]) => { const e = window.__engine(); return new Function('e', 'a', f)(e, a); }, [fn, arg]);
await E('e.player.x = 1500; e.player.y = 580;');
await p.waitForTimeout(1500);
await p.screenshot({ path: out + `${mode}-1-hall.jpg`, type: 'jpeg', quality: 82 });
// the crumble, frame by frame (the page's own loop stopped, the engine stepped at its 30 fps): three as it cracks, three as it goes
await E('e.player.x = 3305; e.player.y = 580; e.player.vx = 0; e.isPaused = true;');
const stepTo = (n) => E(`for (let i = 0; i < ${n}; i++) e.update(1 / 30); e.render();`);
let at = 0;
for (const [name, f] of [['2a-crumble-crack', 6], ['2b-crumble-cracking', 20], ['2c-crumble-about-to-go', 32], ['2d-crumble-breaking', 40], ['2e-crumble-falling', 48], ['2f-crumble-dark', 56]]) {
  await stepTo(f - at);
  at = f;
  await p.screenshot({ path: out + `${mode}-${name}.jpg`, type: 'jpeg', quality: 82 });
}
await E('e.isPaused = false;');
for (let i = 0; i < 40; i++) { const s = await E('return e.slideRun.phase'); if (s === 'slide') break; await p.waitForTimeout(300); }
console.log('phase', await E('return e.slideRun.phase'));
const shots = JSON.parse(process.argv[3] ?? '[]');
for (const [name, code] of shots) {
  await E(`const s = e.slideRun.sim; const at = (k, n = 0, back = 8) => { const o = s.sorted.filter((o) => o.kind === k)[n]; s.z = o.z - back; return o; }; s.safeT = 0; ${code}; e.player.hp = e.player.maxHp;`);
  await p.waitForTimeout(250);
  await p.screenshot({ path: out + `${mode}-${name}.jpg`, type: 'jpeg', quality: 82 });
}
await b.close();
