/**
 * The music engine.
 *
 * A Theme is a piece of music written as data (key, tempo, a chord loop, and tracks of notation).
 * A Playback performs one theme: it expands the notation bar by bar, a little ahead of the audio clock,
 * and fires instrument voices. Layers fade in and out with an "intensity" value, so the same piece can be
 * calm while exploring and full when enemies are close.
 *
 * The Conductor owns the current Playback and crossfades to a new one when the scene changes.
 */
import { AudioCore } from './core.ts';
import { CHORD_VOICES, DRUM_VOICES, NOTE_VOICES } from './instruments.ts';
import {
  chordMidi,
  chordPcs,
  generateMelodyBar,
  hashStr,
  midiHz,
  noteMidi,
  parseChord,
  parseDrums,
  parseMelodyBar,
  parsePattern,
  rng,
  SCALES,
  toneAt,
  voiceLead,
  type Chord,
  type MelNote,
} from './theory.ts';

export type NoteInstName = keyof typeof NOTE_VOICES;
export type ChordInstName = keyof typeof CHORD_VOICES;
export type DrumName = keyof typeof DRUM_VOICES;

interface TrackBase {
  name: string;
  gain: number;
  pan?: number;
  /** reverb send 0..1 */
  rev?: number;
  /** ping-pong delay send 0..1 */
  dly?: number;
  /** an optional extra layer that low-power devices skip */
  lite?: boolean;
  /** intensity range [fades in from, fully in at]; omit for always on */
  gate?: [number, number];
  /** per-bar on/off across the loop ('x' plays, '.' rests), cycled */
  mask?: string;
}

/** a bass line, arpeggio or comping figure written relative to the current chord */
export interface PatternTrack extends TrackBase {
  kind: 'pattern';
  inst: NoteInstName;
  /** MIDI note the chord root is placed at or above */
  oct: number;
  /** one string per bar, cycled; see parsePattern */
  pats: string[];
  /** note length as a share of the pattern's own length (default 0.9) */
  len?: number;
}

/** a tune in scale degrees; a null bar is composed by the generator in the same key and chord */
export interface MelodyTrack extends TrackBase {
  kind: 'melody';
  inst: NoteInstName;
  bars: Array<string | null>;
  /** range and busyness for the generated bars */
  gen?: { lo: number; hi: number; density?: number };
  /** transpose in semitones */
  shift?: number;
  legato?: number;
  /** on every second pass through the loop, play this instead (variety) */
  altInst?: NoteInstName;
}

/** held chords (pads, strings, choir) or re-struck chord stabs */
export interface ChordTrack extends TrackBase {
  kind: 'chords';
  inst: ChordInstName;
  lo: number;
  hi: number;
  voices?: number;
  /** if set, re-attack the whole chord on these steps instead of holding it (one pattern per bar, 'x' = hit) */
  stabs?: string[];
  stabLen?: number;
}

export interface DrumTrack extends TrackBase {
  kind: 'drums';
  voice: DrumName;
  pats: string[];
  /** pattern for the last bar of every 4 (a fill) */
  fill?: string;
}

export type Track = PatternTrack | MelodyTrack | ChordTrack | DrumTrack;

export interface Theme {
  id: string;
  bpm: number;
  /** where scale degree 1 sits, e.g. 'C4' */
  tonic: string;
  scale: keyof typeof SCALES;
  /** 16 for 4/4, 12 for 3/4 (steps are 16th notes) */
  stepsPerBar?: 16 | 12;
  /** delay of the off 16ths, as a share of a step (0 straight, ~0.3 shuffle) */
  swing?: number;
  /** delay of the off 8ths, as a share of an eighth */
  swing8?: number;
  /** the chord loop, one chord per bar ('Am*2' lasts two bars) */
  chords: string[];
  /** delay time in beats (0.75 = dotted eighth) */
  delay?: number;
  /** master level of the whole piece */
  level?: number;
  tracks: Track[];
}

interface RuntimeTrack {
  spec: Track;
  gate: GainNode;
  lastPitch: number;
  lastVoicing: number[] | null;
  melody?: Array<MelNote[] | null>;
  pats?: ReturnType<typeof parsePattern>[];
  drums?: Array<ReturnType<typeof parseDrums>>;
  fill?: ReturnType<typeof parseDrums>;
  stabs?: ReturnType<typeof parseDrums>[];
}

interface BarChord {
  chord: Chord;
  /** first bar of this chord? */
  start: boolean;
  /** bars from here to the end of this chord */
  left: number;
}

export interface KeyInfo {
  tonic: number;
  scale: number[];
}

/** performs one Theme */
export class Playback {
  readonly theme: Theme;
  readonly out: GainNode;
  private readonly core: AudioCore;
  private readonly c: BaseAudioContext;
  private readonly spb: number;
  readonly stepDur: number;
  private readonly tonic: number;
  private readonly scale: number[];
  private readonly barChords: BarChord[];
  private tracks: RuntimeTrack[] = [];
  private nextTime: number;
  private bar = 0;
  private step = 0;
  private bucket: Array<Array<(t: number) => void>> = [];
  private intensity = 0.4;
  private targetIntensity = 0.4;
  private rand = rng(7);
  /** skip tracks marked `lite` (slow phones) */
  liteMode = false;
  disposed = false;
  /** scheduling stopped: the notes already queued ring out while the piece fades away */
  retired = false;

  constructor(core: AudioCore, theme: Theme, startAt: number, out?: GainNode, fadeIn = false) {
    this.core = core;
    this.c = core.ctx;
    this.theme = theme;
    this.spb = theme.stepsPerBar ?? 16;
    this.stepDur = 60 / theme.bpm / 4;
    this.tonic = noteMidi(theme.tonic);
    this.scale = SCALES[theme.scale];
    this.nextTime = startAt;
    this.out = out ?? core.ctx.createGain();
    this.out.gain.value = fadeIn ? 0 : theme.level ?? 1;
    this.out.connect(core.music);

    const chords = theme.chords.map(parseChord);
    this.barChords = [];
    for (const ch of chords) for (let i = 0; i < ch.bars; i++) this.barChords.push({ chord: ch, start: i === 0, left: ch.bars - i });

    for (const spec of theme.tracks) {
      const gate = this.c.createGain();
      gate.gain.value = 0;
      let node: AudioNode = gate;
      if (spec.pan) {
        const p = this.c.createStereoPanner();
        p.pan.value = spec.pan;
        gate.connect(p);
        node = p;
      }
      const wet = core.withReverb(this.out, spec.rev ?? 0.15);
      node.connect(wet);
      if (spec.dly) {
        const d = this.c.createGain();
        d.gain.value = spec.dly;
        node.connect(d);
        d.connect(core.delayIn);
      }
      const rt: RuntimeTrack = { spec, gate, lastPitch: this.tonic + 12, lastVoicing: null };
      if (spec.kind === 'melody') {
        rt.melody = spec.bars.map((b) => (b === null ? null : parseMelodyBar(b, this.tonic + (spec.shift ?? 0), this.scale, this.spb)));
      } else if (spec.kind === 'pattern') {
        rt.pats = spec.pats.map((p) => parsePattern(p, this.spb));
      } else if (spec.kind === 'drums') {
        rt.drums = spec.pats.map((p) => parseDrums(p, this.spb));
        if (spec.fill) rt.fill = parseDrums(spec.fill, this.spb);
      } else if (spec.kind === 'chords' && spec.stabs) {
        rt.stabs = spec.stabs.map((p) => parseDrums(p, this.spb));
      }
      this.tracks.push(rt);
    }
    core.setDelayTime((60 / theme.bpm) * (theme.delay ?? 0.75));
  }

  get loopBars() {
    return this.barChords.length;
  }

  key(): KeyInfo {
    return { tonic: this.tonic, scale: this.scale };
  }

  setIntensity(v: number, snap = false) {
    this.targetIntensity = Math.max(0, Math.min(1, v));
    if (snap) this.intensity = this.targetIntensity;
  }

  /** the chord sounding at a time that has already been scheduled (for sound effects that want to match) */
  currentChord(): Chord {
    return this.barChords[Math.max(0, this.bar - 1) % this.barChords.length].chord;
  }

  /** schedule everything that falls before `until` (seconds on the audio clock) */
  update(until: number) {
    while (!this.disposed && !this.retired && this.nextTime < until) {
      if (this.step === 0) this.beginBar();
      const list = this.bucket[this.step];
      if (list) {
        const t = this.stepTime(this.nextTime, this.step);
        for (const fire of list) fire(Math.max(t, this.c.currentTime));
      }
      this.step++;
      this.nextTime += this.stepDur;
      if (this.step >= this.spb) {
        this.step = 0;
        this.bar++;
      }
    }
  }

  private stepTime(base: number, step: number) {
    const th = this.theme;
    let t = base;
    if (th.swing && step % 2 === 1) t += th.swing * this.stepDur;
    if (th.swing8 && step % 4 === 2) t += th.swing8 * this.stepDur * 2;
    return t;
  }

  private gateFor(spec: Track): number {
    if (!spec.gate) return 1;
    const [lo, hi] = spec.gate;
    if (hi <= lo) return this.intensity >= lo ? 1 : 0;
    const x = Math.max(0, Math.min(1, (this.intensity - lo) / (hi - lo)));
    return x * x * (3 - 2 * x);
  }

  private beginBar() {
    const barDur = this.stepDur * this.spb;
    // intensity glides toward its target: quicker up than down
    const tau = this.targetIntensity > this.intensity ? 1.2 : 4;
    this.intensity += (this.targetIntensity - this.intensity) * (1 - Math.exp(-barDur / tau));
    // the whole piece also swells a little with intensity
    this.out.gain.setTargetAtTime((this.theme.level ?? 1) * (0.74 + 0.26 * this.intensity), Math.max(this.c.currentTime, this.nextTime - 0.02), 0.4);

    const L = this.barChords.length;
    const barInLoop = this.bar % L;
    const loop = Math.floor(this.bar / L);
    const bc = this.barChords[barInLoop];
    this.bucket = [];
    const push = (step: number, fn: (t: number) => void) => {
      (this.bucket[step] ??= []).push(fn);
    };
    const stepDur = this.stepDur;
    const now = this.c.currentTime;

    for (const rt of this.tracks) {
      const spec = rt.spec;
      const g = this.gateFor(spec) * spec.gain;
      rt.gate.gain.setTargetAtTime(g, Math.max(now, this.nextTime - 0.02), 0.3);
      if (g < 0.02 || (this.liteMode && spec.lite)) continue;
      if (spec.mask && spec.mask[barInLoop % spec.mask.length] === '.') continue;
      const vel = (v: number) => v * (0.9 + this.rand() * 0.2);

      if (spec.kind === 'drums') {
        const isFill = spec.fill && barInLoop % 4 === 3;
        const cells = isFill ? rt.fill! : rt.drums![barInLoop % rt.drums!.length];
        const voice = DRUM_VOICES[spec.voice];
        for (const h of cells) push(h.step, (t) => voice(this.core, rt.gate, t + (this.rand() - 0.5) * 0.006, vel(h.v)));
      } else if (spec.kind === 'pattern') {
        const cells = rt.pats![barInLoop % rt.pats!.length];
        const voice = NOTE_VOICES[spec.inst];
        const n = bc.chord.tones.length;
        for (const cell of cells) {
          let midi: number;
          if (cell.tone === -1) midi = toneAt(bc.chord, spec.oct, n);
          else if (cell.tone === 0 && bc.chord.bassPc !== bc.chord.rootPc) {
            midi = spec.oct + ((bc.chord.bassPc - (spec.oct % 12) + 12) % 12);
          } else midi = toneAt(bc.chord, spec.oct, cell.tone);
          const dur = cell.len * stepDur * (spec.len ?? 0.9);
          const v = cell.ghost ? 0.4 : cell.accent ? 1 : 0.78;
          push(cell.step, (t) => voice(this.core, rt.gate, t + (this.rand() - 0.5) * 0.005, midiHz(midi), dur, vel(v)));
        }
      } else if (spec.kind === 'melody') {
        const mel = rt.melody!;
        let bar = mel[barInLoop % mel.length];
        if (bar === null) {
          const r = rng(hashStr(this.theme.id + spec.name) + barInLoop * 131 + (loop % 2) * 7919);
          bar = generateMelodyBar({
            scalePcs: this.scale.map((s) => (this.tonic + s) % 12),
            chordPcs: chordPcs(bc.chord),
            prev: rt.lastPitch,
            lo: spec.gen?.lo ?? this.tonic,
            hi: spec.gen?.hi ?? this.tonic + 17,
            rand: r,
            steps: this.spb,
            phraseBar: barInLoop % 4,
            density: spec.gen?.density,
          });
        }
        const inst = spec.altInst && loop % 2 === 1 ? spec.altInst : spec.inst;
        const voice = NOTE_VOICES[inst];
        for (const nt of bar) {
          if (nt.midi === null) continue;
          rt.lastPitch = nt.midi;
          const m = nt.midi;
          const dur = nt.len * stepDur * (spec.legato ?? 0.95);
          push(nt.step, (t) => voice(this.core, rt.gate, t + (this.rand() - 0.5) * 0.004, midiHz(m), dur, vel(0.85)));
        }
      } else if (spec.kind === 'chords') {
        const voice = CHORD_VOICES[spec.inst];
        rt.lastVoicing = voiceLead(rt.lastVoicing, bc.chord, spec.lo, spec.hi, spec.voices ?? 4);
        const notes = rt.lastVoicing.map(midiHz);
        if (spec.stabs) {
          const cells = rt.stabs![barInLoop % rt.stabs!.length];
          for (const h of cells) push(h.step, (t) => voice(this.core, rt.gate, t, notes, (spec.stabLen ?? 2) * stepDur, vel(h.v)));
        } else if (bc.start) {
          const dur = bc.left * barDur - 0.05;
          push(0, (t) => voice(this.core, rt.gate, t, notes, dur, vel(0.9)));
        }
      }
    }
  }

  /** fade away and stop composing; dispose() once the fade is over */
  retire(seconds: number) {
    this.retired = true;
    this.fadeOut(seconds);
  }

  fadeOut(seconds: number) {
    const t = this.c.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setValueAtTime(this.out.gain.value, t);
    this.out.gain.linearRampToValueAtTime(0, t + seconds);
  }

  dispose() {
    this.disposed = true;
    try {
      this.out.disconnect();
    } catch {
      /* already gone */
    }
  }
}
