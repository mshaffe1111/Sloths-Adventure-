/**
 * The music engine alone, playing live as on a phone (lite arrangement, light room), for measuring what it costs (tools/audio/perf.mjs
 * --live). Nothing else runs on the page, so the CPU and memory it takes are the sound's. Not shipped.
 */
import { AudioCore } from '../../src/audio/core.ts';
import { Playback } from '../../src/audio/music.ts';
import { Ambience, type AmbientType } from '../../src/audio/ambience.ts';
import { themeById } from '../../src/audio/themes.ts';
import { groupsFor, loadOrch } from '../../src/audio/orchLoader.ts';
import { loadSamples } from '../../src/audio/sampleLoader.ts';
import { stageMusic } from '../../src/audio/scenes.ts';

async function start(world: number, level: string, amb: string) {
  const ctx = new AudioContext({ latencyHint: 'balanced' });
  await ctx.resume();
  const core = new AudioCore(ctx, { lightRoom: true });
  core.lite = true;
  core.music.gain.value = 0.32;
  await loadSamples(core);
  const s = stageMusic(world, level, 4, 0);
  const theme = themeById(s.id)!;
  await loadOrch(core, groupsFor(theme));
  const pb = new Playback(core, theme, ctx.currentTime + 0.1, undefined, false, { seed: s.seed, tempo: s.tempo, form: true } as never);
  pb.liteMode = true;
  pb.setIntensity(0.45, true);
  const a = new Ambience(core);
  a.lite = true;
  a.start(amb as AmbientType);
  setInterval(() => {
    pb.update(ctx.currentTime + 0.6);
    a.update(ctx.currentTime + 0.6);
  }, 25);
  const anyPb = pb as unknown as { setState?: (s: Record<string, unknown>) => void };
  return {
    id: s.id,
    setState: (st: Record<string, unknown>) => anyPb.setState?.(st),
    hasState: !!anyPb.setState,
  };
}
(window as unknown as { startLive: typeof start; live?: Awaited<ReturnType<typeof start>> }).startLive = start;
document.getElementById('s')!.textContent = 'ready';
