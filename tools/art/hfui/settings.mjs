import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/tmp/claude-0/kit3/shots'; fs.mkdirSync(out, { recursive: true });
const CSS = `
.gx2-ui { visibility: hidden !important; }
#st { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; padding: max(12px, env(safe-area-inset-top)) 16px 12px; background: rgba(6, 14, 8, .55); font-family: var(--font-ui); color: var(--gx-ink, #3b2412); }
#st * { box-sizing: border-box; }
#st .card { position: relative; width: min(100%, 560px); max-height: 100%; border: 22px solid transparent; border-image: url(/mock/card.png) 70 fill / 22px stretch; padding: 30px 6px 8px; display: flex; flex-direction: column; gap: 12px; filter: drop-shadow(0 16px 30px rgba(0,0,0,.5)); }
#st .plq { position: absolute; left: 50%; top: -46px; transform: translateX(-50%); } #st .plq h2 { font-size: 26px; }
#st .x { position: absolute; right: -30px; top: -34px; width: 52px; height: 52px; background: url(/mock/token.png) center / contain no-repeat; display: grid; place-items: center; }
#st .x i { width: 24px; height: 24px; background: url(/mock/icon-cross.png) center / contain no-repeat; display: block; }
#st .tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }
#st .tab { height: 56px; background: url(/mock/chipOff.png) center / 100% 100% no-repeat; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; font: 400 14px var(--font-fun); color: #fff4d8; text-shadow: 0 1.5px 0 #3a200c; }
#st .tab.on { background-image: url(/mock/chipOn.png); }
#st .tab i, #st .row i { width: 24px; height: 24px; background: center / contain no-repeat; display: block; flex: none; }
#st .row { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 6px 4px; border-bottom: 2px solid rgba(120, 80, 30, .2); font: 700 17px var(--font-ui); }
#st .row:last-child { border-bottom: none; }
#st .row b { font: 400 18px var(--font-fun); color: #4a2a10; flex: none; width: 92px; }
#st .row small { display: block; font: 600 13px var(--font-ui); color: #7a5a38; }
#st .track { position: relative; flex: 1; height: 22px; background: url(/mock/sliderTrack.png) center / 100% 100% no-repeat; }
#st .knob { position: absolute; top: 50%; width: 44px; height: 44px; transform: translate(-50%, -50%); background: url(/mock/sliderKnob.png) center / contain no-repeat; }
#st .pill { margin-left: auto; min-width: 88px; height: 44px; display: grid; place-items: center; font: 400 16px var(--font-fun); color: #fff4d8; text-shadow: 0 2px 0 #1d4a1b; border: 3px solid #1d4a1b; border-radius: 12px; background: linear-gradient(180deg, #7cc35a, #4f9a39 52%, #357525); }
#st .pill.wood { text-shadow: 0 2px 0 #3a200c; border-color: #3a200c; background: linear-gradient(180deg, #c99256, #9b6331 52%, #74461f); }
#st .go { min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 10px; font: 400 22px var(--font-fun); color: #fff4d8; text-shadow: 0 2px 0 #1d4a1b; border: 3px solid #1d4a1b; border-radius: 12px 16px 13px 10px; background: linear-gradient(180deg, #7cc35a, #4f9a39 52%, #357525); }
#st .modal { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(6, 14, 8, .6); }
#st .modal .card { width: min(100%, 360px); text-align: center; padding-top: 18px; }
#st .modal h3 { margin: 0; font: 400 24px var(--font-fun); color: #8a3b10; }
#st .modal p { margin: 0; font: 600 16px var(--font-ui); }
`;
const ic = (n) => `<i style="background-image:url(/mock/icon-${n}.png)"></i>`;
const tabs = (on) => `<div class="tabs">${[['speaker', 'Sound'], ['gear', 'Game'], ['save', 'Saves'], ['trophy', 'Trophies'], ['sloth', 'About']].map(([i, n]) => `<div class="tab${n === on ? ' on' : ''}">${ic(i)}${n}</div>`).join('')}</div>`;
const slider = (v) => `<div class="track"><div class="knob" style="left:${v}%"></div></div>`;
const PAGES = {
  sound: `${tabs('Sound')}
    <div class="row">${ic('speaker')}<b>Sound</b><div class="pill">On</div></div>
    <div class="row">${ic('leaf')}<b>Music</b>${slider(80)}</div>
    <div class="row">${ic('star')}<b>Effects</b>${slider(65)}</div>`,
  saves: `${tabs('Saves')}
    <div class="row">${ic('save')}<div style="flex:1">Save / Load<small>A file or a save code, to keep your game safe</small></div><div class="pill wood">Open</div></div>
    <div class="row">${ic('leaf')}<div style="flex:1">New Game<small>Start again from the very beginning</small></div><div class="pill wood">New</div></div>`,
  about: `${tabs('About')}
    <div class="row">${ic('sloth')}<div style="flex:1">Sloths Rainforest Adventures<small>Created and made by Matt Shaffer</small></div></div>
    <div class="row">${ic('restart')}<div style="flex:1">Updated Oct 30, 2026<small>You have the newest version</small></div><div class="pill wood">Check</div></div>`,
};
const page = (k, modal) => `<div class="card"><div class="plq"><h2 class="kit-plaque"><span>Settings</span></h2></div><div class="x">${ic('cross')}</div>${PAGES[k]}<div class="go">${ic('play')}Back to the game</div>
  ${modal ? `<div class="modal"><div class="card"><h3>Start a new game?</h3><p>This wipes your stages, stars and trophies on this phone.</p><div class="go">Keep my game</div><div class="pill wood" style="margin:0 auto;width:70%">Yes, start over</div></div></div>` : ''}</div>`;
const b = await chromium.launch();
for (const [k, modal] of [['sound', 0], ['saves', 0], ['saves', 1], ['about', 0]]) for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  if (tag === 'side' && k !== 'sound') continue;
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6000);
  await p.addStyleTag({ content: CSS });
  await p.evaluate((html) => { const d = document.createElement('div'); d.id = 'st'; d.innerHTML = html; document.body.appendChild(d); }, page(k, modal));
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/settings-${k}${modal ? '-confirm' : ''}-${tag}.png` });
  await p.close();
}
await b.close();
