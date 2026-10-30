/**
 * Ambience: the sound of the place itself, under the music (polish report SN-9: the synthesized noise beds are replaced by real places).
 *
 * Each world has a recorded bed (src/assets/sfxrec/bed<world>_0.mp3: a seamless 20 s loop made from CC0 field recordings, see
 * tools/audio/sfxv1/build.py BEDS) and, for most, real one-shots (bird calls, cave drips, frog croaks, far thunder) scattered at random
 * over it, panned around the stereo field, so the loop is never heard as a loop. The beds are levelled to the old places' loudness
 * (about -28 LUFS in the game's mix; BED_DB). A bed is fetched only when its world's ambience starts.
 */
import type { AudioCore } from './core.ts';
import { BED_DB } from './sfxRecLevels.ts';
import { recBank } from './sfxRec.ts';

export type AmbientType =
  | 'gentle_breeze'
  | 'river_flow'
  | 'deep_cave'
  | 'waterfall'
  | 'tropical_birds'
  | 'swamp_croaks'
  | 'ancient_echo'
  | 'twilight_crickets'
  | 'volcanic_hum'
  | 'thunderstorm';

/** each place's recorded bed: the world it was made for */
export const AMB_WORLD: Readonly<Record<AmbientType, number>> = {
  gentle_breeze: 1, river_flow: 2, deep_cave: 3, waterfall: 4, tropical_birds: 5,
  swamp_croaks: 6, ancient_echo: 7, twilight_crickets: 8, volcanic_hum: 9, thunderstorm: 10,
};
export const AMBIENT_TYPES = Object.keys(AMB_WORLD) as AmbientType[];

/** a place's one-shots: which recorded set, seconds between them [min, max], and dB on top of the bed's level */
export const AMB_SHOTS: Readonly<Partial<Record<AmbientType, { fx: string; gap: [number, number]; db: number }>>> = {
  gentle_breeze: { fx: 'shotBirds', gap: [3, 8], db: 0 },
  river_flow: { fx: 'shotBirds', gap: [4, 9], db: 0 },
  deep_cave: { fx: 'shotDrips', gap: [1.2, 3.5], db: -6 },
  waterfall: { fx: 'shotBirds', gap: [6, 12], db: 0 },
  tropical_birds: { fx: 'shotBirds', gap: [2, 5], db: 0 },
  swamp_croaks: { fx: 'shotCroaks', gap: [2, 6], db: 0 },
  ancient_echo: { fx: 'shotBirdsFar', gap: [5, 10], db: 0 },
  thunderstorm: { fx: 'shotThunder', gap: [7, 13], db: 0 },
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const dbGain = (db: number) => Math.pow(10, db / 20);

interface Running {
  type: AmbientType;
  mix: GainNode;
  src: AudioBufferSourceNode | null;
  nextAt: number;
  last: number;
}

export class Ambience {
  private cur: Running | null = null;
  private readonly core: AudioCore;
  /** a slow phone: the one-shots are skipped (the bed alone still plays) */
  lite = false;

  constructor(core: AudioCore) {
    this.core = core;
  }

  get type(): AmbientType | null {
    return this.cur?.type ?? null;
  }

  start(type: AmbientType, fade = 1.6) {
    if (this.cur?.type === type) return;
    this.stop(fade);
    const c = this.core.ctx;
    const now = c.currentTime;
    const world = AMB_WORLD[type];
    const mix = c.createGain();
    mix.gain.value = 0;
    mix.connect(this.core.amb);
    const run: Running = { type, mix, src: null, nextAt: now + rnd(1, 3), last: -1 };
    this.cur = run;
    // (the loader is imported here, not at the top: only the browser can resolve its files, and the tests import this module)
    void import('./sfxRecLoader.ts').then((m) => m.loadBed(this.core, world)).catch(() => null).then((buf) => {
      if (!buf || this.cur !== run) return;
      const t = c.currentTime;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(mix);
      // (a random point in the loop, so a restart is not the same opening every time)
      src.start(t, Math.random() * Math.max(0, buf.duration - 0.5));
      run.src = src;
      mix.gain.setValueAtTime(0, t);
      mix.gain.linearRampToValueAtTime(dbGain(BED_DB[world] ?? 0), t + fade);
    });
  }

  /** scatter the place's one-shots that fall before `until` */
  update(until: number) {
    const r = this.cur;
    if (!r || !r.src) return;
    const shot = AMB_SHOTS[r.type];
    if (!shot) return;
    const list = recBank.get(shot.fx);
    if (!list?.length) return;
    const c = this.core.ctx;
    let guard = 0;
    while (r.nextAt < until && guard++ < 4) {
      const t = Math.max(r.nextAt, c.currentTime + 0.02);
      if (!this.lite) {
        let k = Math.floor(Math.random() * list.length);
        if (list.length > 1 && k === r.last) k = (k + 1) % list.length;
        r.last = k;
        const src = c.createBufferSource();
        src.buffer = list[k];
        src.playbackRate.value = 1 + rnd(-0.05, 0.05);
        const g = c.createGain();
        // (the bed's own level is on the mix already; a shot adds its own dB and a little spread)
        g.gain.value = dbGain(shot.db + rnd(-2, 2));
        src.connect(g);
        let node: AudioNode = g;
        if ('createStereoPanner' in c) {
          const p = c.createStereoPanner();
          p.pan.value = rnd(-0.6, 0.6);
          g.connect(p);
          node = p;
        }
        node.connect(r.mix);
        src.start(t);
      }
      r.nextAt += rnd(shot.gap[0], shot.gap[1]);
    }
  }

  stop(fade = 0.8) {
    const r = this.cur;
    if (!r) return;
    this.cur = null;
    const t = this.core.ctx.currentTime;
    r.mix.gain.cancelScheduledValues(t);
    r.mix.gain.setValueAtTime(r.mix.gain.value, t);
    r.mix.gain.linearRampToValueAtTime(0, t + fade);
    try {
      r.src?.stop(t + fade + 0.1);
    } catch {
      /* already stopped */
    }
    setTimeout(() => {
      try {
        r.mix.disconnect();
      } catch {
        /* gone */
      }
    }, (fade + 1) * 1000);
  }
}
