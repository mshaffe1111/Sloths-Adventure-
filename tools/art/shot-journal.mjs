// Shots of the Trophy Room's Jungle Journal with everything met (or half, with a third argument), upright and sideways, against a running vite dev server: node tools/art/shot-journal.mjs <port> <outPrefix> [half]
import { chromium } from 'playwright';
const [port, prefix, half] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h, tag] of [[390, 844, 'upright'], [844, 390, 'sideways']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate(async (half) => {
    const src = await (await fetch('/src/components/TrophyRoom.tsx')).text();
    const reactUrl = /from\s+"(\/node_modules\/\.vite\/deps\/react\.js[^"]*)"/.exec(src)[1];
    const msrc = await (await fetch('/src/main.tsx')).text();
    const domUrl = /from\s+"(\/node_modules\/\.vite\/deps\/react-dom_client\.js[^"]*)"/.exec(msrc)[1];
    const React = (await import(reactUrl)).default;
    const dm = await import(domUrl); const createRoot = dm.createRoot ?? dm.default.createRoot;
    const { TrophyRoom } = await import('/src/components/TrophyRoom.tsx');
    const { emptyStore, PREDATORS } = await import('/src/game/badges.ts');
    const store = emptyStore();
    const preds = half ? PREDATORS.slice(0, 6) : PREDATORS;
    store.seen = [...preds];
    preds.forEach((k, i) => (store.kills[k] = 3 + i * 4));
    const levels = [];
    for (let wo = 1; wo <= 10; wo++) for (let m = 1; m <= 10; m++) levels.push({ id: `${wo}-${m}`, worldIndex: wo, miniIndex: m, completed: !half || wo <= 4, stars: 3 });
    levels.push({ id: '5-M', worldIndex: 5, miniIndex: 11, completed: !half, stars: 3 });
    levels.push({ id: '4-D', worldIndex: 4, miniIndex: 11, completed: !half, stars: 3 });
    document.body.innerHTML = '<div id="jr"></div>';
    createRoot(document.getElementById('jr')).render(
      React.createElement(TrophyRoom, { store, levels, gateFound: false, thornHeart: false, choice: { coat: 'none', trail: false }, onChoice() {}, onBack() {}, initialTab: 'journal', finds: [], onOpenFind() {} }),
    );
  }, !!half);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${prefix}-${tag}.png` });
  // the whole journal, top to bottom
  const el = await p.$('.tr-screen');
  const full = await p.evaluate(() => { const s = document.querySelector('.tr-screen'); return s ? s.scrollHeight : 0; });
  await p.setViewportSize({ width: w, height: Math.min(6000, Math.max(h, full)) });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${prefix}-${tag}-full.png`, fullPage: true });
  await p.close();
}
await b.close();
