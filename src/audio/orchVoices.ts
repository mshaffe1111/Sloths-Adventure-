/**
 * Sampler voices for the recorded orchestra. A voice finds the nearest recorded note, bends it to the pitch it was asked for,
 * loops the steady part of a sustained note for as long as the music holds it, and shapes it with an envelope. Every voice takes a
 * stand-in (a synthesized voice): until an instrument has been loaded, the stand-in plays, so the music never has a hole in it.
 */
import { envelope, type AudioCore, type OrchSample } from './core.ts';
import type { ChordVoice, DrumVoice, NoteVoice } from './instruments.ts';

const FLOOR = 0.0001;
const hzMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const hasOrch = (core: AudioCore, inst: string) => (core.orch.get(inst)?.length ?? 0) > 0;

/** the recording closest to a note (the one that has to be bent the least) */
export function nearestSample(list: OrchSample[], midi: number): OrchSample {
  let best = list[0];
  let bd = Infinity;
  for (const s of list) {
    const d = Math.abs(midi - s.midi);
    if (d < bd - 1e-9) {
      bd = d;
      best = s;
    }
  }
  return best;
}

interface Shape {
  /** loudness of the voice (the recordings are all levelled to the same loudness) */
  gain: number;
  /** low-pass cutoff in Hz at the softest and at the loudest playing: soft notes are darker, as on the real instrument */
  bright?: [number, number];
}

interface SusShape extends Shape {
  /** seconds to reach full level and to die away after the note ends */
  a: number;
  r: number;
  /** how many players share the note: each is a little out of tune and out of time and sits a little to one side, which is what makes a section sound like a section and not one instrument */
  copies?: number;
}

function source(core: AudioCore, s: OrchSample, rate: number, t: number, stop: number, loop: boolean) {
  const src = core.ctx.createBufferSource();
  src.buffer = s.buf;
  src.playbackRate.value = rate;
  if (loop && s.loopStart > 0) {
    src.loop = true;
    src.loopStart = s.loopStart;
    src.loopEnd = s.loopEnd;
  }
  src.start(t);
  src.stop(stop);
  return src;
}

/** the filter and the pan position a note passes through are shared by all the notes that go to the same place: a note then costs a source and a gain, not five nodes (a busy piece plays over a hundred notes a second) */
const buses = new WeakMap<AudioNode, Map<string, AudioNode>>();
function bus(core: AudioCore, dst: AudioNode, vel: number, bright: [number, number] | undefined, pan: number): AudioNode {
  const level = vel < 0.5 ? 0 : vel < 0.85 ? 1 : 2;
  const key = `${bright ? bright.join('-') + ':' + level : '-'}|${pan}`;
  let m = buses.get(dst);
  if (!m) buses.set(dst, (m = new Map()));
  let node = m.get(key);
  if (!node) {
    const c = core.ctx;
    let out: AudioNode = dst;
    if (pan) {
      const p = c.createStereoPanner();
      p.pan.value = pan;
      p.connect(out);
      out = p;
    }
    if (bright) {
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = bright[0] + (bright[1] - bright[0]) * [0.25, 0.65, 1][level];
      lp.Q.value = 0.4;
      lp.connect(out);
      out = lp;
    }
    m.set(key, (node = out));
  }
  return node;
}

/** a held note: attack, loop the steady stretch while the note lasts, release */
export function playSustained(core: AudioCore, dst: AudioNode, t: number, inst: string, hz: number, dur: number, vel: number, o: SusShape): boolean {
  const list = core.orch.get(inst);
  if (!list?.length) return false;
  const midi = hzMidi(hz);
  const s = nearestSample(list, midi);
  const hold = Math.max(0.14, dur);
  const n = core.lite ? 1 : Math.max(1, o.copies ?? 1);
  const share = (1 / Math.sqrt(n)) * (n > 1 ? 1.15 : 1);
  for (let i = 0; i < n; i++) {
    // players: a few cents apart, a few hundredths of a second apart, spread across the stage
    const cents = n > 1 ? (i - (n - 1) / 2) * 9 + (Math.random() - 0.5) * 4 : 0;
    const at = t + (n > 1 ? i * 0.013 + Math.random() * 0.01 : 0);
    const src = source(core, s, Math.pow(2, (midi - s.midi + cents / 100) / 12), at, at + hold + o.r + 0.06, true);
    const g = core.ctx.createGain();
    envelope(g.gain, at, { a: o.a * (1 + i * 0.12), peak: o.gain * share * (0.3 + 0.7 * clamp(vel, 0, 1.2)), hold, r: o.r });
    src.connect(g);
    g.connect(bus(core, dst, vel, o.bright, n > 1 ? Math.round((i - (n - 1) / 2) * 55) / 100 : 0));
  }
  return true;
}

interface ShortShape extends Shape {
  /** how long the note rings before it is damped (s) and how fast the damping is (s) */
  ring: number;
  damp?: number;
}

/** a plucked or staccato note: the recording as it is, damped after `ring` */
export function playShortNote(core: AudioCore, dst: AudioNode, t: number, inst: string, hz: number, vel: number, o: ShortShape): boolean {
  const list = core.orch.get(inst);
  if (!list?.length) return false;
  const midi = hzMidi(hz);
  const s = nearestSample(list, midi);
  const damp = o.damp ?? 0.12;
  const src = source(core, s, Math.pow(2, (midi - s.midi) / 12), t, t + o.ring + damp + 0.05, false);
  const g = core.ctx.createGain();
  g.gain.setValueAtTime(o.gain * (0.35 + 0.65 * clamp(vel, 0, 1.2)), t);
  g.gain.setTargetAtTime(FLOOR, t + o.ring, damp / 3);
  src.connect(g);
  g.connect(bus(core, dst, vel, o.bright, 0));
  return true;
}

interface PercShape {
  gain: number;
  /** pick the recording by how hard it is hit (soft ... loud) or at random */
  by: 'vel' | 'random';
  /** random speed change, +-share, so a roll of the same drum is never one sample repeated */
  jitter?: number;
  /** indices that may be chosen (default all) */
  only?: number[];
  /** longest it may ring (s) */
  ring?: number;
}

export function playPerc(core: AudioCore, dst: AudioNode, t: number, inst: string, vel: number, o: PercShape): boolean {
  const all = core.orch.get(inst);
  if (!all?.length) return false;
  const list = o.only ? all.filter((_, i) => o.only!.includes(i)) : all;
  if (!list.length) return false;
  const idx = o.by === 'vel' ? Math.min(list.length - 1, Math.floor(clamp(vel, 0, 0.999) * list.length)) : Math.floor(Math.random() * list.length);
  const s = list[idx];
  const j = 1 + ((Math.random() * 2 - 1) * (o.jitter ?? 0.02));
  const ring = o.ring ?? s.buf.duration;
  const src = source(core, s, j, t, t + ring + 0.1, false);
  const g = core.ctx.createGain();
  g.gain.setValueAtTime(o.gain * (0.4 + 0.6 * clamp(vel, 0, 1.2)), t);
  if (o.ring) g.gain.setTargetAtTime(FLOOR, t + o.ring * 0.7, o.ring * 0.1);
  src.connect(g);
  g.connect(dst);
  return true;
}

// ---- makers: a recorded voice with its stand-in

export const sustained = (inst: string, shape: SusShape, stand: NoteVoice): NoteVoice => (core, dst, t, hz, dur, vel) => {
  if (!playSustained(core, dst, t, inst, hz, dur, vel, shape)) stand(core, dst, t, hz, dur, vel);
};

export const plucked = (inst: string, shape: ShortShape, stand: NoteVoice): NoteVoice => (core, dst, t, hz, dur, vel) => {
  if (!playShortNote(core, dst, t, inst, hz, vel, shape)) stand(core, dst, t, hz, dur, vel);
};

/** the strings as a section: each note of the chord goes to the instrument that sits in its register, with a little spread so they do not start as one */
export const stringSection = (stand: ChordVoice, notes: { cello: NoteVoice; violas: NoteVoice; violins: NoteVoice }): ChordVoice => (core, dst, t, hzs, dur, vel) => {
  if (!hasOrch(core, 'cello') || !hasOrch(core, 'violas') || !hasOrch(core, 'violins')) {
    stand(core, dst, t, hzs, dur, vel);
    return;
  }
  const share = 0.9 / Math.sqrt(Math.max(1, hzs.length) / 2);
  const sorted = [...hzs].sort((a, b) => a - b);
  const play = (hz: number, k: number, d = t) => {
    const m = hzMidi(hz);
    const v = m < 54 ? notes.cello : m < 66 ? notes.violas : notes.violins;
    v(core, dst, d + Math.random() * 0.012, hz * Math.pow(2, ((Math.random() - 0.5) * 8) / 1200), dur, vel * k);
  };
  hzs.forEach((hz, i) => play(hz, share, t + 0.006 * i));
  // the basses of the section an octave below the lowest note, the first violins an octave above the highest: the width of an orchestra
  if (sorted.length && !core.lite) {
    if (hzMidi(sorted[0]) - 12 >= 36) play(sorted[0] / 2, share * 0.7);
    if (hzMidi(sorted[sorted.length - 1]) + 12 <= 88) play(sorted[sorted.length - 1] * 2, share * 0.5);
  }
};

export const brassSection = (stand: ChordVoice, notes: { horn: NoteVoice; trombone: NoteVoice }): ChordVoice => (core, dst, t, hzs, dur, vel) => {
  if (!hasOrch(core, 'horn') || !hasOrch(core, 'trombone')) {
    stand(core, dst, t, hzs, dur, vel);
    return;
  }
  const share = 0.9 / Math.sqrt(Math.max(1, hzs.length) / 2);
  hzs.forEach((hz, i) => {
    const v = hzMidi(hz) < 50 ? notes.trombone : notes.horn;
    v(core, dst, t + 0.004 * i + Math.random() * 0.008, hz, dur, vel * share);
  });
};

export const drum = (inst: string, shape: PercShape, stand: DrumVoice, extra?: DrumVoice): DrumVoice => (core, dst, t, vel) => {
  if (playPerc(core, dst, t, inst, vel, shape)) extra?.(core, dst, t, vel);
  else stand(core, dst, t, vel);
};
