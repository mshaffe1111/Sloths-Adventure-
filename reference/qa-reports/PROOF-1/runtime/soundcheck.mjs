// (e) the sound sliders and limiter, measured in the SHIPPED build (?audiodebug=1 exposes window.__sound, audio.ts:279): new-game defaults,
// the gains the real slider sets at each position (a real tap on the bar), and the peak after the limiter (core.meter, the tap after
// the limiter) with a square wave driven 18 dB over full scale into the effects bus.
import { chromium, sleep, HEAD, MAIN, here } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = (which === 'main' ? MAIN : HEAD) + '?audiodebug=1';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url);
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_coach_done', '1'); });
await page.reload();
await page.locator('.ttl-token[aria-label="Settings"]').waitFor({ timeout: 30000 });
await sleep(800);
await page.mouse.click(5, 5);
await sleep(800);
const defaults = await page.evaluate(() => ({ music: window.__sound.musicVolume, sfx: window.__sound.sfxVolume, muted: window.__sound.isMuted }));
console.log(which, 'new-game defaults', JSON.stringify(defaults));
if (defaults.muted) { await page.evaluate(() => window.__sound.toggleMute()); }
await page.locator('.ttl-token[aria-label="Settings"]').evaluate((e) => e.click());
await sleep(600);
const tabs = await page.locator('.st-tab').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
const soundTab = tabs.find((t) => /sound/i.test(t ?? ''));
if (soundTab) await page.locator(`.st-tab[aria-label="${soundTab}"]`).evaluate((e) => e.click());
await sleep(600);
const core = () => page.evaluate(() => { const c = window.__sound.c.core; return c && { out: c.out.gain.value, music: c.music.gain.value, sfx: c.sfx.gain.value, master: c.master.gain.value, state: c.ctx.state }; });
const rows = [];
for (const f of [1, 0.9, 0.8, 0.5, 0.25, 0.1, 0.02]) {
  for (const id of ['#pm-sfx', '#pm-music']) {
    const r = await page.locator(id).boundingBox();
    await page.mouse.click(r.x + Math.max(0.5, Math.min(r.width - 0.5, f * r.width)), r.y + r.height / 2);
  }
  await sleep(400);
  const g = await core();
  const v = await page.evaluate(() => ({ m: window.__sound.musicVolume, s: window.__sound.sfxVolume }));
  const db = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(2) : '-inf');
  rows.push(`bar ${String(Math.round(f * 100)).padStart(3)}%: set m=${v.m.toFixed(3)} s=${v.s.toFixed(3)} -> out ${db(g.out)} dB (curve says ${db(Math.pow(10, -40 * (1 - Math.max(v.m, v.s)) / 20))}), music bus ${g.music.toFixed(4)}, sfx bus ${g.sfx.toFixed(4)}; ctx ${g.state}`);
}
console.log(rows.join('\n'));
// the limiter: sliders to the top, a square wave 18 dB over full scale into the effects bus; peak on the meter (after the limiter)
for (const id of ['#pm-sfx', '#pm-music']) { const r = await page.locator(id).boundingBox(); await page.mouse.click(r.x + r.width - 0.5, r.y + r.height / 2); }
await sleep(300);
const lim = await page.evaluate(async () => {
  const c = window.__sound.c.core;
  const ctx = c.ctx;
  if (ctx.state !== 'running') await ctx.resume();
  const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 220;
  const g = ctx.createGain(); g.gain.value = 8; // +18 dB
  o.connect(g); g.connect(c.sfx); o.start();
  const buf = new Float32Array(c.meter.fftSize);
  let peak = 0, peakFirst100 = 0; const t0 = performance.now();
  while (performance.now() - t0 < 2500) {
    await new Promise((r) => setTimeout(r, 15));
    c.meter.getFloatTimeDomainData(buf);
    let m = 0; for (const x of buf) m = Math.max(m, Math.abs(x));
    if (performance.now() - t0 < 120) peakFirst100 = Math.max(peakFirst100, m); else peak = Math.max(peak, m);
  }
  o.stop();
  return { state: ctx.state, sr: ctx.sampleRate, peakDb: 20 * Math.log10(peak), onsetDb: 20 * Math.log10(peakFirst100), outGain: c.out.gain.value };
});
console.log(`${which} limiter: square wave +18 dB into the effects bus -> peak after the limiter ${lim.peakDb.toFixed(2)} dBFS steady, ${lim.onsetDb.toFixed(2)} dBFS in the first 120 ms (ctx ${lim.state} ${lim.sr} Hz; out gain ${lim.outGain.toFixed(3)})`);
console.log('page errors', errors.length, errors.slice(0, 2));
await browser.close();
