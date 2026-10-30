import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/tmp/claude-0/kit3/shots'; fs.mkdirSync(out, { recursive: true });
const CSS = `
.gx2-post, .gx2-credit, .gx2-tag, .gx2-top-r { visibility: hidden !important; }
#mk { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; font-family: var(--font-fun); }
#mk * { box-sizing: border-box; }
#mk .sign { position: absolute; display: flex; align-items: flex-end; justify-content: center; background: center / 100% 100% no-repeat; filter: drop-shadow(0 6px 8px rgba(0,0,0,.45)); }
#mk .sign span { display: flex; align-items: center; gap: 10px; color: #fff4d8; text-shadow: 0 2px 0 #4a2208, 2px 0 0 #4a2208, -2px 0 0 #4a2208, 0 -2px 0 #4a2208, 0 3px 4px rgba(0,0,0,.4); letter-spacing: .02em; white-space: nowrap; }
#mk .sign i { display: block; background: center / contain no-repeat; filter: drop-shadow(0 2px 1px rgba(0,0,0,.4)); }
#mk .big { background-image: url(/mock/signBig.png); aspect-ratio: 700 / 361; }
#mk .big span { font-size: clamp(24px, 6.4vw, 34px); padding-bottom: 12%; }
#mk .big i { width: 1.15em; height: 1.15em; background-image: url(/mock/icon-play.png); }
#mk .sm { aspect-ratio: 260 / 272; background-image: url(/mock/signSm0.png); }
#mk .sm.s1 { background-image: url(/mock/signSm1.png); } #mk .sm.s2 { background-image: url(/mock/signSm2.png); }
#mk .sm span { flex-direction: column; gap: 2px; font-size: 16px; padding-bottom: 9%; }
#mk .sm i { width: 30px; height: 30px; }
#mk .tok { position: absolute; width: 52px; height: 52px; background: url(/mock/token.png) center / contain no-repeat; display: grid; place-items: center; filter: drop-shadow(0 3px 4px rgba(0,0,0,.45)); }
#mk .tok i { width: 28px; height: 28px; background: center / contain no-repeat; display: block; }
@media (max-height: 700px) and (orientation: portrait) { #mk .big.a-up { width: 280px !important; bottom: 124px !important; } }
#mk .tok.leaf { background-image: url(/mock/leafToken.png); }
#mk .lbl { position: absolute; font-size: 16px; color: #fff4d8; text-shadow: 0 2px 0 #2a1608, 1.5px 0 0 #2a1608, -1.5px 0 0 #2a1608, 0 0 6px rgba(0,0,0,.6); text-align: center; white-space: nowrap; }
#mk .tag { position: absolute; width: 196px; height: 44px; white-space: nowrap; background: url(/mock/tag.png) center / 100% 100% no-repeat; display: grid; place-items: center; padding-top: 4px; font: 900 12px var(--font-ui); letter-spacing: .06em; color: #fff1cf; text-shadow: 0 1px 0 #2a1608; }
`;
const ic = (n) => `<i style="background-image:url(/mock/icon-${n}.png)"></i>`;
// A: signs on vines. B: a staked trail sign and round tokens
const HTML = {
  A: (up) => up ? `
    <div class="tag" style="left:16px;top:max(12px,env(safe-area-inset-top))">10 WORLDS · 100 STAGES</div>
    <div class="tok" style="right:76px;top:10px">${ic('speaker')}</div><div class="tok" style="right:16px;top:10px">${ic('gear')}</div>
    <div class="sign big a-up" style="left:50%;transform:translateX(-50%);width:min(86vw,340px);bottom:150px"><span>${ic('play')}START ADVENTURE</span></div>
    <div class="sign sm" style="left:calc(50% - 168px);width:108px;bottom:max(18px,4vh)"><span>${ic('map')}World Map</span></div>
    <div class="sign sm s1" style="left:calc(50% - 54px);width:108px;bottom:max(18px,4vh)"><span>${ic('scroll')}Story</span></div>
    <div class="sign sm s2" style="left:calc(50% + 60px);width:108px;bottom:max(18px,4vh)"><span>${ic('bulb')}How to Play</span></div>`
  : `
    <div class="tag" style="left:16px;top:10px">10 WORLDS · 100 STAGES</div>
    <div class="tok" style="right:76px;top:8px">${ic('speaker')}</div><div class="tok" style="right:16px;top:8px">${ic('gear')}</div>
    <div class="sign big" style="right:7vw;width:min(44vw,360px);top:12vh"><span style="font-size:26px">${ic('play')}START ADVENTURE</span></div>
    <div class="sign sm" style="right:calc(7vw + 238px);width:104px;bottom:14px"><span>${ic('map')}World Map</span></div>
    <div class="sign sm s1" style="right:calc(7vw + 126px);width:104px;bottom:14px"><span>${ic('scroll')}Story</span></div>
    <div class="sign sm s2" style="right:calc(7vw + 14px);width:104px;bottom:14px"><span>${ic('bulb')}How to Play</span></div>`,
  B: (up) => up ? `
    <div class="tok" style="right:76px;top:10px">${ic('speaker')}</div><div class="tok" style="right:16px;top:10px">${ic('gear')}</div>
    <div class="sign big" style="left:50%;transform:translateX(-50%);width:min(88vw,380px);bottom:calc(6vh + 92px)"><span>${ic('play')}START ADVENTURE</span></div>
    <div class="tok leaf" style="left:calc(50% - 130px);bottom:calc(4vh + 26px);width:60px;height:60px">${ic('map')}</div><div class="lbl" style="left:calc(50% - 150px);width:100px;bottom:4vh">World Map</div>
    <div class="tok leaf" style="left:calc(50% - 30px);bottom:calc(4vh + 26px);width:60px;height:60px">${ic('scroll')}</div><div class="lbl" style="left:calc(50% - 50px);width:100px;bottom:4vh">Story</div>
    <div class="tok leaf" style="left:calc(50% + 70px);bottom:calc(4vh + 26px);width:60px;height:60px">${ic('bulb')}</div><div class="lbl" style="left:calc(50% + 50px);width:100px;bottom:4vh">How to Play</div>`
  : `
    <div class="tok" style="right:76px;top:8px">${ic('speaker')}</div><div class="tok" style="right:16px;top:8px">${ic('gear')}</div>
    <div class="sign big" style="right:8vw;width:min(40vw,330px);top:13vh"><span style="font-size:24px">${ic('play')}START ADVENTURE</span></div>
    <div class="tok leaf" style="right:calc(8vw + 234px);bottom:40px;width:58px;height:58px">${ic('map')}</div><div class="lbl" style="right:calc(8vw + 214px);width:98px;bottom:14px">World Map</div>
    <div class="tok leaf" style="right:calc(8vw + 136px);bottom:40px;width:58px;height:58px">${ic('scroll')}</div><div class="lbl" style="right:calc(8vw + 116px);width:98px;bottom:14px">Story</div>
    <div class="tok leaf" style="right:calc(8vw + 38px);bottom:40px;width:58px;height:58px">${ic('bulb')}</div><div class="lbl" style="right:calc(8vw + 18px);width:98px;bottom:14px">How to Play</div>`,
};
const b = await chromium.launch();
for (const L of ['A', 'B']) for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390], ['small', 360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6500);
  await p.addStyleTag({ content: CSS });
  await p.evaluate((html) => { const d = document.createElement('div'); d.id = 'mk'; d.innerHTML = html; document.body.appendChild(d); }, HTML[L](h > w));
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/${L}-${tag}.png` });
  await p.close();
}
await b.close();
