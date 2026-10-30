/**
 * The game's sound alone, through its own front door (src/game/audio.ts), for measuring what the music costs (tools/music/perf.mjs).
 * The same file runs against the old build and the new one: a stage's music starts, and the game's calls come as they do in play
 * (the intensity and the state four times a second, footsteps and pickups). Nothing else runs on the page. Not shipped.
 */
import { sound } from '../../src/game/audio.ts';

function start(world: number, levelId: string, mini: number, objective: string) {
  sound.unlock();
  sound.screen('playing', world, objective === 'boss_lair', levelId, mini, 0, objective);
  if (!location.search.includes('noamb')) sound.setAmbient('river_flow' as never);
  let i = 0;
  // the engine's sound tick: every 0.25 s
  setInterval(() => {
    i++;
    const phase = Math.floor(i / 40) % 4;
    sound.setIntensity(0.45 + 0.2 * Math.sin(i / 7));
    sound.setMusicState({ danger: phase === 1 ? 1 : 0, dark: phase === 2 ? 1 : 0, exit: phase === 3 ? 1 : 0, puzzle: 0, boss: 0 });
    if (i % 2 === 0) sound.playStep();
    if (i % 9 === 0) sound.playJump();
    if (i % 13 === 0) sound.playFlowerPickup(1);
  }, 250);
}
Object.assign(window, { startBench: start, __sound: sound });
document.getElementById('s')!.textContent = 'ready';
