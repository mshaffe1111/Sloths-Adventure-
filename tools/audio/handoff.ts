/**
 * The music's hand-offs between screens, through the game's own sound front door (game/audio.ts), on a phone's audio path
 * (tools/audio/handoff.mjs opens it with an iPhone user agent): which pieces are sounding, sampled every 100 ms, while the screens change.
 * A piece counts as sounding while it is scheduling notes and not fading out; two at once (outside a crossfade) is music playing twice.
 */
import { sound } from '../../src/game/audio.ts';
import { Playback } from '../../src/audio/music.ts';

const live = new Map<Playback, number>();
const origUpdate = Playback.prototype.update;
Playback.prototype.update = function (this: Playback, until: number) {
  if (!this.retired && !this.disposed) live.set(this, performance.now());
  return origUpdate.call(this, until);
};
const sounding = () => {
  const now = performance.now();
  return [...live].filter(([p, t]) => !p.retired && !p.disposed && now - t < 200).map(([p]) => p.theme.id);
};

async function run(steps: Array<[number, string, number?]>) {
  sound.unlock();
  const log: Array<{ t: number; step: string; sounding: string[] }> = [];
  const t0 = performance.now();
  let i = 0;
  let worst = 0;
  const doubles: string[] = [];
  await new Promise<void>((done) => {
    const tick = setInterval(() => {
      const t = (performance.now() - t0) / 1000;
      while (i < steps.length && steps[i][0] <= t) {
        const [, screen, world] = steps[i++];
        sound.screen(screen, world ?? 3, false, screen === 'playing' || screen === 'paused' ? '3-4' : '', 4, 11);
        log.push({ t: Math.round(t * 10) / 10, step: `${screen}${world ? ' w' + world : ''}`, sounding: [] });
      }
      const s = sounding();
      worst = Math.max(worst, s.length);
      if (s.length > 1) doubles.push(`${t.toFixed(1)}s: ${s.join(' + ')}`);
      if (log.length) log[log.length - 1].sounding = s;
      if (t > steps[steps.length - 1][0] + 4) {
        clearInterval(tick);
        done();
      }
    }, 100);
  });
  return { log, worst, doubles: doubles.slice(0, 10), report: sound.report(), debug: sound.debug() };
}
(window as unknown as { runHandoff: typeof run }).runHandoff = run;
document.getElementById('s')!.textContent = 'ready';
