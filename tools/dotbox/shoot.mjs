// dot-box: walk Pokey up to a Dot tip in the real game and shoot the moment, with the rects of the bubble, Pokey, the next action
// point and the HUD (reference/methods/in-play-text.md). Usage:
//   PW=/opt/node-tools/node_modules/playwright/index.mjs npx tsx tools/dotbox/shoot.mjs <port> <out dir> <tag> [only moment]
// Writes <out>/<moment>-<tag>-<upright|sideways>.png and <out>/<moment>-<tag>.json.
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const { lawRects, aheadZone } = await import('../../src/game/dotGuidePerch.ts');
const { FINDS } = await import('../../src/game/finds.ts');
const FOUND = JSON.stringify({ v: 1, found: FINDS.map((f) => f.id) });
const [port = '4301', out = '.', tag = 'after', only = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

/**
 * The moments. `text`: a piece of the tip's words; `from`: where he starts walking (world x, from the hint's x); `stop`: where he stops
 * once her bubble is up ('lip': 100 px short of the end of the ledge he is on; 'enemy': 170 px short of the first animal ahead; a
 * number: that many ms of walking more).
 */
const MOMENTS = [
  { id: '8-2-rope0', stage: '8-2', layout: 1, text: 'long way down', say: 'long way down', from: 10, stop: 'lip' },
  { id: '1-7-eagle', stage: '1-7', layout: 0, text: 'eagle is watching', say: 'bush to hide', from: 10, stop: 1400 },
  { id: '5-1-gap', stage: '5-1', layout: 0, text: 'A wide gap', say: 'Wide gap', from: 10, stop: 'lip' },
  { id: '4-2-leaf', stage: '4-2', layout: 0, text: 'Your leaf', say: 'thumb on the glass', from: 10, stop: 'lip', move: 'glide' },
];
const SIZES = (process.env.SIZES ?? 'upright:412x915,sideways:915x412').split(',').map((q) => { const [n, d] = q.split(':'); const [w, h] = d.split('x'); return [n, +w, +h]; });

const b = await chromium.launch();
for (const m of MOMENTS) {
  if (only && m.id !== only) continue;
  const rec = { moment: m.id, tag, shots: [] };
  for (const [ori, W, H] of SIZES) {
    const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    // (a player mid-way through the game: the Skip tips offer made long ago, and each stage's story asides heard, so the tip under test is
    // the line up, not a story aside queued ahead of it)
    // (and every note found: picking one up opens it over the stage)
    await p.addInitScript(([stage, found, help]) => { try { localStorage.setItem('sloth_dot_skip_offered', '1'); localStorage.setItem('sloth_dot_help', help); localStorage.setItem(`sloth_way_${stage}`, 'LHF'); localStorage.setItem('sloth_finds', found); } catch {} }, [m.stage, FOUND, m.help ?? 'reminders']);
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 90000 });
    await p.evaluate(([s, l]) => window.__play(s, l), [m.stage, m.layout]);
    await p.waitForFunction(() => typeof window.__engine === 'function' && !!window.__engine(), null, { timeout: 90000 });
    await p.waitForTimeout(3000);
    // (the stage's opening lines first: Dot quiet for 1.5 s, so the tip under test is not queued behind them)
    for (let i = 0, quiet = 0; i < 100 && quiet < 6; i++) {
      await p.waitForTimeout(250);
      quiet = (await p.evaluate(() => !document.querySelector('.dg-bub.in'))) ? quiet + 1 : 0;
    }
    const set = await p.evaluate(({ text, from }) => {
      const e = window.__engine();
      const hints = e.proto?.hints ?? [];
      const h = hints.find((q) => text && q.text.includes(text)) ?? null;
      if (!h) return { err: 'no hint', hints: hints.map((q) => [q.x, q.text]) };
      for (const q of hints) if (q !== h && q.x < h.x) q.shown = true;
      // (a zone's first line, 'So dark...', would queue ahead of it: said already)
      e.zoneHinted = new Proxy({}, { get: () => true });
      const x = h.x + from;
      const under = e.platforms.filter((q) => !q.broken && q.x <= x + 20 && q.x + q.width >= x + 20 && q.type !== 'oneway').sort((a, c) => a.y - c.y);
      const g = under[0];
      Object.assign(e.player, { x, y: g.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1 });
      return { hint: { x: h.x, text: h.text, passX: h.passX }, ground: g.y, x };
    }, m);
    if (process.env.DEBUG) console.log(JSON.stringify(set));
    if (set.err) { console.log(m.id, ori, set.err, JSON.stringify(set.hints)); await p.context().close(); continue; }
    // walk right until her bubble (with these words) is up, then on to the spot he acts at
    await p.keyboard.down('ArrowRight');
    let upAt = -1;
    const seq = {};
    const t0 = Date.now();
    for (let i = 0; i < 200; i++) {
      await p.waitForTimeout(50);
      const s = await p.evaluate(({ text, say, stop }) => {
        const b = document.querySelector('.dg-bub.in');
        const e = window.__engine();
        const q = e.player;
        let at = Infinity;
        if (stop === 'lip') {
          const g = e.platforms.find((k) => !k.broken && k.x <= q.x + q.width && k.x + k.width >= q.x && Math.abs(k.y - q.y) < 8);
          if (g) at = g.x + g.width - q.width - 100;
        } else if (stop === 'enemy') {
          const en = e.enemies.filter((k) => !k.defeated && k.x > q.x).sort((a, c) => a.x - c.x)[0];
          if (en) at = en.x - 170;
        }
        const h = (e.proto?.hints ?? []).find((k) => k.text.includes(text));
        return { up: !!b && b.innerText.includes(say) && getComputedStyle(b).opacity > 0.95, x: q.x, at, due: !!h?.shown };
      }, m);
      if (process.env.DEBUG) console.log(i, await p.evaluate(() => { const r = window.__dotRun; const q = r?.plan; return JSON.stringify({ q: r?.queue?.items?.map?.((l) => l.text.slice(0, 20)) ?? Object.keys(r?.queue ?? {}), show: r?.show?.line?.text?.slice(0, 20), help: r?.help, applies: r?.applies, st: r?.state, mode: q?.mode, sx: q?.sx | 0, sy: q?.sy | 0, bub: q?.bub && [q.bub.x | 0, q.bub.y | 0, q.bub.cost | 0], noPerch: q?.noPerch, dsx: r?.dsx | 0 }); }));
      if (process.env.DEBUG && i % 10 === 0) console.log(i, JSON.stringify(s), await p.evaluate(() => [...document.querySelectorAll('.dg-bub')].map((b) => b.className + ' ' + getComputedStyle(b).opacity + ' ' + b.innerText.slice(0, 30)).join(' / ')));
      if (s.up && upAt < 0) upAt = Date.now();
      // (the bubble's first moments, to see whether it settles or hops: as it opens, +0.3 s and +1.5 s)
      for (const [k, ms] of [['t0', 0], ['t1', 300], ['t2', 1500]]) {
        if (upAt > 0 && !seq[k] && Date.now() - upAt >= ms) {
          seq[k] = true;
          await p.screenshot({ path: path.join(out, `${m.id}-${tag}-${ori}-${k}.png`) });
        }
      }
      const done = upAt > 0 && Date.now() - upAt > 1600 && (typeof m.stop === 'number' ? Date.now() - upAt > m.stop : s.x >= s.at || Date.now() - upAt > 3000);
      // (said, but another line is still up ahead of it: he waits at the spot, as a player reading would)
      if (s.x >= s.at && s.due && upAt < 0) await p.keyboard.up('ArrowRight');
      if (s.up && s.x < s.at && upAt > 0) await p.keyboard.down('ArrowRight');
      if (done || Date.now() - t0 > 25000) break;
    }
    await p.keyboard.up('ArrowRight');
    await p.waitForTimeout(400);
    const file = path.join(out, `${m.id}-${tag}-${ori}.png`);
    await p.screenshot({ path: file });
    const r = await p.evaluate(() => {
      const e = window.__engine();
      const v = e.guideView({});
      const bb = document.querySelector('.dg-bub.in');
      const br = bb ? bb.getBoundingClientRect() : null;
      const hud = [...document.querySelectorAll('.hud-glass, [data-hud-keepout]')].filter((el) => el.getAttribute('data-hud-keepout') !== 'stage').map((el) => el.getBoundingClientRect()).filter((q) => q.width > 0).map((q) => ({ x0: q.left, y0: q.top, x1: q.right, y1: q.bottom }));
      const keep = ['live', 'zoom', 'camX', 'camY', 'cssW', 'cssH', 'px', 'py', 'pw', 'ph', 'vx', 'vy', 'facing', 'grounded', 'climbing', 'swinging', 'hanging', 'gliding'];
      const view = Object.fromEntries(keep.map((k) => [k, v[k]]));
      for (const k of ['platforms', 'ropes', 'vines', 'enemies', 'hazards', 'bushes']) view[k] = JSON.parse(JSON.stringify(v[k] ?? []));
      return { text: bb?.innerText.split('\n').filter((q) => q && q !== 'Dot' && q !== 'Skip tips').join(' ') ?? null, bub: br && { x0: br.left, y0: br.top - 14, x1: br.right, y1: br.bottom }, hud, view };
    });
    // (the way ahead in the shape of the move the tip is about: a glide's cone for 4-2's leaf; the whole of it, the high arc too)
    const gv = { ...r.view, popups: [], collectibles: [] };
    const law = r.view.live ? lawRects(gv, [], 0, m.move ?? 'jump') : [];
    if (law.length) law[1] = aheadZone(gv, undefined, undefined, m.move ?? 'jump');
    const hit = (a, b) => a && b && a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
    const pk = law[0];
    r.checks = r.bub ? { pokey: !hit(r.bub, pk), ahead: !hit(r.bub, law[1]), action: !law.slice(2).some((q) => hit(r.bub, q)), hud: !r.hud.some((q) => hit(r.bub, q)) } : null;
    r.law = law;
    delete r.view;
    rec.shots.push({ ori, file, ...r });
    console.log(m.id, ori, JSON.stringify({ text: r.text, bub: r.bub, checks: r.checks }));
    await p.context().close();
  }
  fs.writeFileSync(path.join(out, `${m.id}-${tag}.json`), JSON.stringify(rec, null, 1));
}
await b.close();
