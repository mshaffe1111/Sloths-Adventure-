// throwaway mock-up compositor: scenes (world coords) -> upright 390x844 and sideways 844x390 stills at 2x
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
import fs from 'fs';
import path from 'path';
const SP = path.resolve('.');
const A = '/home/user/Sloths-Adventure-/src/assets/';
const C = (n) => `file://${SP}/crops/${n}.png`;
const AS = (n) => `file://${A}${n}`;
const FONT = `file://${A}fonts/`;
const { scenes } = await import(path.resolve(process.argv[2]));
const outDir = process.argv[3]; const only = process.argv[4];
fs.mkdirSync(outDir, { recursive: true });
const VIEWS = { upright: [390, 844], sideways: [844, 390] };

function itemHtml(it, cam, s, vw, vh) {
  const src = !it.src ? null : it.src.startsWith('A:') ? AS(it.src.slice(2)) : C(it.src);
  const sx = (x) => (x - cam.x) * s + vw / 2, sy = (y) => (y - cam.y) * s + vh / 2;
  const w = it.w * s, h = it.h * s;
  // anchor: x,y is the bottom-centre unless it.anchor === 'tl'
  const left = it.anchor === 'tl' ? sx(it.x) : sx(it.x) - w / 2;
  const top = it.anchor === 'tl' ? sy(it.y) : sy(it.y) - h;
  const tf = [it.flip ? 'scaleX(-1)' : '', it.rot ? `rotate(${it.rot}deg)` : ''].join(' ');
  const st = `position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;transform:${tf};transform-origin:${it.origin ?? '50% 50%'};opacity:${it.op ?? 1};filter:${it.filter ?? 'none'};`;
  if (it.svg) return `<div style="${st}">${it.svg}</div>`;
  if (it.tile) return `<div style="${st}background:url('${src}') ${it.tile === 'y' ? 'repeat-y' : 'repeat-x'};background-size:${it.tile === 'y' ? '100% auto' : 'auto 100%'};"></div>`;
  return `<img src="${src}" style="${st}object-fit:fill;">`;
}

function page(scene, view) {
  const [vw, vh] = VIEWS[view];
  const cam = scene.cam[view] ?? scene.cam;
  const s = (scene.scale?.[view]) ?? (view === 'upright' ? 0.66 : 0.62);
  const bg = (scene.bg?.[view] ?? scene.bg ?? []).map((b) => {
    const src = b.src.startsWith('A:') ? AS(b.src.slice(2)) : C(b.src);
    return `<div style="position:absolute;inset:0;background:url('${src}') ${b.pos ?? 'center'} / ${b.size ?? 'cover'} no-repeat;filter:${b.filter ?? 'none'};opacity:${b.op ?? 1};-webkit-mask-image:${b.mask ?? 'none'};"></div>`;
  }).join('');
  const items = [...scene.items].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).filter((i) => !i.only || i.only === view).map((i) => itemHtml(i, cam, s, vw, vh)).join('');
  const sx = (x) => (x - cam.x) * s + vw / 2, sy = (y) => (y - cam.y) * s + vh / 2;
  const tags = (scene.tags ?? []).filter((t) => !t.only || t.only === view).map((t) => `<div class="tag" style="left:${sx(t.x)}px;top:${sy(t.y)}px">${t.text}</div>`).join('');
  const bubbles = (scene.bubbles ?? []).filter((t) => !t.only || t.only === view).map((b) => `<div class="bub" style="left:${sx(b.x)}px;top:${sy(b.y)}px;${b.right ? 'transform:translateX(-100%)' : ''}"><b>${b.who ?? 'Dot'}</b> ${b.text}${b.isNew ? '<i>new line, needs Matt</i>' : ''}</div>`).join('');
  const over = scene.overlay ? `<div style="position:absolute;inset:0;${scene.overlay}"></div>` : '';
  return `<!doctype html><html><head><style>
@font-face{font-family:Outfit;src:url('${FONT}outfit-latin-700-normal.woff2')}
@font-face{font-family:Atk;src:url('${FONT}atkinson-hyperlegible-next-latin-600-normal.woff2')}
html,body{margin:0;width:${vw}px;height:${vh}px;overflow:hidden;background:#111}
#v{position:absolute;inset:0;overflow:hidden}
.tag{position:absolute;font:600 9px Atk,sans-serif;color:#1d1400;background:#ffd84a;border:1px solid #6a5000;border-radius:3px;padding:1px 4px;white-space:nowrap;z-index:50;box-shadow:0 1px 2px #0008}
.bub{position:absolute;max-width:${view === 'upright' ? 210 : 260}px;font:600 12.5px Atk,sans-serif;color:#2b1d0e;background:#fff7e3;border:2px solid #5a3b1c;border-radius:10px;padding:5px 8px;z-index:40;box-shadow:0 2px 4px #0007}
.bub b{font:700 11px Outfit,sans-serif;color:#2f8a6a;margin-right:3px}
.bub i{display:block;font:600 8.5px Atk,sans-serif;color:#a0522d;font-style:normal;margin-top:2px}
#mk{position:absolute;left:8px;top:8px;font:700 10px Outfit,sans-serif;color:#fff;background:#c2410cdd;border-radius:4px;padding:2px 6px;z-index:60;letter-spacing:.5px}
#cap{position:absolute;left:0;right:0;bottom:0;font:600 ${view === 'upright' ? 11.5 : 11}px Atk,sans-serif;color:#fff;background:linear-gradient(#0000,#000c 35%);padding:16px 10px 8px;z-index:60;line-height:1.3}
#cap b{font:700 12px Outfit,sans-serif;color:#ffd84a}
</style></head><body><div id="v">${bg}${items}${over}${tags}${bubbles}
<script>addEventListener('load',()=>{for(const e of document.querySelectorAll('.tag,.bub')){const r=e.getBoundingClientRect();let dx=0,dy=0;if(r.right>innerWidth-6)dx=innerWidth-6-r.right;if(r.left+dx<6)dx=6-r.left;if(r.top<34)dy=34-r.top;if(r.bottom>innerHeight-50)dy=innerHeight-50-r.bottom;e.style.left=(parseFloat(e.style.left)+dx)+'px';e.style.top=(parseFloat(e.style.top)+dy)+'px';e.style.transform='none'}})</script><div id="mk">MOCK-UP · ${scene.stage}</div><div id="cap"><b>${scene.title}</b> ${scene.caption ?? ''}</div></div></body></html>`;
}

const browser = await chromium.launch();
for (const sc of scenes) {
  if (only && !sc.name.includes(only)) continue;
  for (const view of Object.keys(VIEWS)) {
    const [vw, vh] = VIEWS[view];
    const pg = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
    const f = `${SP}/tmp-${sc.name}-${view}.html`;
    fs.writeFileSync(f, page(sc, view));
    await pg.goto('file://' + f); await pg.waitForLoadState('networkidle'); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: `${outDir}/${sc.name}-${view}.jpg`, type: 'jpeg', quality: 84 });
    await pg.close();
  }
  console.log('done', sc.name);
}
await browser.close();
