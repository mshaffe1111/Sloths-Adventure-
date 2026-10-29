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
import { fullOrchestra, realVoice, STAGE, trimOf } from './realize.ts';
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
  shiftChord,
  toneAt,
  voiceLead,
  type Chord,
  type MelNote,
} from './theory.ts';
import { CALM, intensityLift, layerMix, layerTracks, moodTempo, roleOf, stepState, toneCutoff, voiceDrop, type MusicState, type Role } from './adaptive.ts';
import { autoForm, nextChunk } from './form.ts';

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
  /** an adaptive layer (adaptive.ts): it comes in with the game's state instead of with intensity */
  layer?: 'drive' | 'shine' | 'boss';
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
  /** what the composed (null) bars are seeded by, instead of the track's name: a track that doubles another one uses the other's, so both play the same notes */
  genKey?: string;
  /** every note is moved by octaves into this range (MIDI): the span an instrument really plays in */
  fold?: [number, number];
  /** play the nearest chord tone below the tune (no more than this many semitones down, at least a minor third) instead of the tune itself: a harmony part */
  harmonize?: number;
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

/**
 * One section of a piece's form (form.ts): its chords, its tune lines, and how it is dressed. A piece with a form plays its sections in order
 * instead of going round its one chord loop; tracks with no line of their own in a section play their patterns from the section's first bar.
 */
export interface FormPart {
  /** 'A', 'A2', 'B', 'C', 'bridge', 'break'... (for the debug overlay and tests) */
  name: string;
  /** one chord per bar, as Theme.chords ('Am*2' lasts two bars) */
  chords: string[];
  /** written tune bars, by the line they replace (a melody track's genKey, or its name): the doublings of a tune follow it */
  lines?: Record<string, Array<string | null>>;
  /** the instrument a melody track (by name) plays in this section */
  inst?: Record<string, NoteInstName>;
  /** roles (adaptive.ts: 'perc', 'low', 'stab', 'counter', 'drive'...) or track names that rest through the section */
  rest?: string[];
  /** added to the intensity the parts' gates read: a fuller bridge (+), a quiet passage (-) */
  lift?: number;
  /** which of the stage's tunes it comes from (0 = the first) */
  tune?: number;
}

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
  /**
   * a piece that keeps its shape however long it plays: no breakdown, no key lift and no bell echo on the later passes
   * (the stage music is dressed differently on every pass through its loop; the story's cue pieces are not)
   */
  still?: boolean;
  /** the speed of each bar of the loop as a share of the written tempo (cycled): a slowing down, a held bar, a broadening. 1 = as written */
  tempoMap?: number[];
  /** the piece's sections in the order they play (see FormPart); without it the piece goes round `chords` */
  form?: FormPart[];
  /** the form is a pool of chunks the Playback strings together as it plays, never in the same order (form.ts nextChunk) */
  chain?: boolean;
  tracks: Track[];
}

interface RuntimeTrack {
  spec: Track;
  /** what it does in the piece (adaptive.ts): how it answers the game's state */
  role: Role;
  /** the tune lines a form's sections give this track (by section; null = the track's own bars) */
  partMel?: Array<Array<MelNote[] | null> | null>;
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

export interface PlaybackOpts {
  /** per-stage number: the same world theme then differs from stage to stage */
  seed?: number;
  /** playing speed, 1 = as written */
  tempo?: number;
  /** begin at this pass through the loop (for testing a particular arrangement) */
  startLoop?: number;
  /** play every part on the recording of its instrument instead of the built-in synthesized voices (default: yes; false is the old sound) */
  real?: boolean;
  /** a piece written as one loop is laid out as a form (form.ts autoForm): the stage music */
  form?: boolean;
}

/** a note moved by whole octaves into a range */
export function foldInto(m: number, [lo, hi]: [number, number]): number {
  let x = m;
  while (x < lo) x += 12;
  while (x > hi) x -= 12;
  return x;
}

/** the nearest chord tone below a tune note, at least a minor third down and no more than `most` semitones (an octave down when no tone is that close) */
export function harmonyBelow(m: number, pcs: number[], most: number): number {
  for (let d = 3; d <= most; d++) if (pcs.includes((((m - d) % 12) + 12) % 12)) return m - d;
  return m - 12;
}

const clampTempo = (x: number) => Math.max(0.8, Math.min(1.25, x));

/** instruments that carry the low end: they drop out in a breakdown */
const LOW_INSTS = new Set<string>(['bass', 'subBass', 'synthBass', 'cello', 'contra', 'contraPizz', 'tuba', 'celloStac', 'bassoon']);

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
  private readonly tonic: number;
  /** which stage this is: shifts where in the arrangement the piece starts and which generated bars it gets */
  readonly seed: number;
  /** playing speed (1 = as written); eases toward `tempoTarget` one bar at a time */
  private tempoScale = 1;
  private tempoTarget = 1;
  /** the current bar's share of the written tempo (the theme's tempoMap) */
  private barTempo = 1;
  /** semitones the piece is currently lifted by (the final-pass key change) */
  private sh = 0;
  /** riser and crash for the breakdown bars */
  private readonly accent: GainNode;
  private readonly scale: number[];
  private readonly barChords: BarChord[];
  /** a piece with a form: which section (index into theme.form) and which bar of it every bar of the timeline is */
  private partAt: Array<{ p: number; b: number; len: number }> | null = null;
  /** a chained piece: the chunks played so far, and the dice that choose the next */
  private readonly chain: boolean = false;
  private readonly chainHistory: number[] = [];
  private readonly chainRand: () => number = () => 0;
  /** the game's state (adaptive.ts), as asked for and as the music has reached it (one bar at a time) */
  private stateTarget: MusicState = CALM;
  private state: MusicState = CALM;
  private lastBoss = 0;
  /** closes the treble in the dark (adaptive.ts toneCutoff) */
  private readonly tone: BiquadFilterNode;
  private tracks: RuntimeTrack[] = [];
  private nextTime: number;
  private bar = 0;
  private step = 0;
  private bucket: Array<Array<(t: number) => void>> = [];
  private intensity = 0.4;
  private targetIntensity = 0.4;
  private rand = rng(7);
  /** every part plays the recording of its instrument (see realize.ts) */
  private readonly real: boolean;
  /** skip tracks marked `lite` (slow phones) */
  liteMode = false;
  disposed = false;
  /** scheduling stopped: the notes already queued ring out while the piece fades away */
  retired = false;

  constructor(core: AudioCore, theme: Theme, startAt: number, out?: GainNode, fadeIn = false, opts: PlaybackOpts = {}) {
    this.core = core;
    this.c = core.ctx;
    this.seed = Math.abs(Math.floor(opts.seed ?? 0));
    // the stage music plays as a form (form.ts): a piece written as one loop is laid out as one here
    if (opts.form && !theme.form && !theme.still) {
      const form = autoForm(theme, this.seed);
      if (form) theme = { ...theme, form, chain: true };
    }
    this.theme = theme;
    this.spb = theme.stepsPerBar ?? 16;
    this.real = opts.real !== false;
    this.tempoScale = this.tempoTarget = clampTempo(opts.tempo ?? 1);
    this.tonic = noteMidi(theme.tonic);
    this.scale = SCALES[theme.scale];
    this.nextTime = startAt;
    this.out = out ?? core.ctx.createGain();
    this.out.gain.value = fadeIn ? 0 : theme.level ?? 1;
    this.tone = this.c.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = toneCutoff(CALM);
    this.tone.Q.value = 0.5;
    this.out.connect(this.tone);
    this.tone.connect(core.music);
    this.accent = this.c.createGain();
    this.accent.gain.value = 0.8;
    this.accent.connect(core.withReverb(this.out, 0.25, 'music'));

    this.barChords = [];
    const addChords = (list: string[]) => {
      for (const ch of list.map(parseChord)) for (let i = 0; i < ch.bars; i++) this.barChords.push({ chord: ch, start: i === 0, left: ch.bars - i });
    };
    if (theme.form?.length && theme.chain) {
      // the timeline grows chunk by chunk as the piece plays (appendChunk)
      this.chain = true;
      this.partAt = [];
      this.chainRand = rng((hashStr(`chain${theme.id}`) ^ Math.imul(this.seed, 2654435761)) >>> 0);
      this.appendChunk();
    } else if (theme.form?.length) {
      // the timeline is the sections one after another
      const at: Array<{ p: number; b: number; len: number }> = [];
      theme.form.forEach((part, p) => {
        const from = this.barChords.length;
        addChords(part.chords);
        const len = this.barChords.length - from;
        for (let b = 0; b < len; b++) at.push({ p, b, len });
      });
      this.partAt = at;
    } else addChords(theme.chords);

    // the real orchestra plays more than the theme wrote (see fullOrchestra), and every part sits where its instrument sits on the stage;
    // and every piece but the story's still ones carries the layers the game's state brings in (adaptive.ts)
    const layers = theme.still ? [] : layerTracks(theme);
    const specs: Track[] = [...(this.real ? [...theme.tracks, ...fullOrchestra(theme)] : theme.tracks), ...layers];
    for (const spec of specs) {
      const gate = this.c.createGain();
      gate.gain.value = 0;
      let node: AudioNode = gate;
      const seat = this.real ? STAGE[realVoice(spec)] : undefined;
      const depth = seat?.depth ?? 0;
      const pan = spec.pan ?? seat?.pan ?? 0;
      if (pan) {
        const p = this.c.createStereoPanner();
        p.pan.value = pan;
        gate.connect(p);
        node = p;
      }
      // the further back a part sits, the more the air has taken from its treble, the less of it comes straight at the listener and the more arrives off the hall
      if (depth >= 0.4) {
        const air = this.c.createBiquadFilter();
        air.type = 'lowpass';
        air.frequency.value = 17000 - 11000 * depth;
        air.Q.value = 0.3;
        node.connect(air);
        node = air;
      }
      const direct = 1 - 0.28 * depth;
      const wet = core.withReverb(this.out, Math.min(1.1, ((spec.rev ?? 0.15) + 0.22 * depth) / direct), 'music');
      wet.gain.value = direct;
      node.connect(wet);
      if (spec.dly) {
        const d = this.c.createGain();
        d.gain.value = spec.dly;
        node.connect(d);
        d.connect(core.musicEchoSend);
      }
      const rt: RuntimeTrack = { spec, role: roleOf(spec), gate, lastPitch: this.tonic + 12, lastVoicing: null };
      if (spec.kind === 'melody') {
        const parse = (b: string | null) => (b === null ? null : parseMelodyBar(b, this.tonic + (spec.shift ?? 0), this.scale, this.spb));
        rt.melody = spec.bars.map(parse);
        if (theme.form) rt.partMel = theme.form.map((part) => part.lines?.[spec.genKey ?? spec.name]?.map(parse) ?? null);
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
    core.setDelayTime(this.stepDur * 4 * (theme.delay ?? 0.75));
    this.bar = Math.max(0, Math.floor(opts.startLoop ?? 0)) * this.barChords.length;
  }

  /** a chained piece: choose the next chunk and add its bars to the timeline */
  private appendChunk() {
    const form = this.theme.form!;
    const barSec = (60 / this.theme.bpm) * 4 * ((this.theme.stepsPerBar ?? 16) / 16);
    const p = nextChunk(form, this.chainHistory, this.chainRand, barSec);
    this.chainHistory.push(p);
    const from = this.barChords.length;
    for (const ch of form[p].chords.map(parseChord)) for (let i = 0; i < ch.bars; i++) this.barChords.push({ chord: ch, start: i === 0, left: ch.bars - i });
    const len = this.barChords.length - from;
    for (let b = 0; b < len; b++) this.partAt!.push({ p, b, len });
  }

  /** the chunks a chained piece has played, in order (for tests and the previews' timelines) */
  get chunks(): string[] {
    const form = this.theme.form;
    return form ? this.chainHistory.map((i) => form[i].name) : [];
  }

  /** current playing speed (1 = as written) */
  get tempo() {
    return this.tempoScale;
  }

  /** seconds per 16th note at the current tempo */
  get stepDur() {
    return 60 / (this.theme.bpm * this.tempoScale * this.barTempo) / 4;
  }

  /** ask for a different playing speed (1 = as written); it eases in over a few bars */
  setTempo(scale: number) {
    this.tempoTarget = clampTempo(scale);
  }

  /** which pass of the 4-pass arrangement a loop is: 0 statement, 1 answer, 2 breakdown, 3 lift */
  static phaseOf(loop: number, seed: number) {
    return (loop + (seed % 2)) % 4;
  }

  get loopBars() {
    return this.barChords.length;
  }

  key(): KeyInfo {
    return { tonic: this.tonic + this.sh, scale: this.scale };
  }

  /** the game's state (adaptive.ts): the parts follow it from the next bar line, fading, never cutting */
  setState(s: Partial<MusicState>, snap = false) {
    this.stateTarget = { ...this.stateTarget, ...s };
    if (snap) this.state = this.stateTarget;
  }

  /** the section of the form playing now ('A', 'bridge'...; '' for a piece without a form) */
  get section(): string {
    if (!this.partAt || !this.theme.form) return '';
    const at = this.partAt[Math.max(0, this.bar - 1) % this.partAt.length];
    return this.theme.form[at.p].name;
  }

  /** seconds per beat at the current tempo */
  get beatDur() {
    return this.stepDur * 4;
  }

  /**
   * The first point of the music's grid (every `steps` sixteenths: 2 = the eighths, 4 = the beats) at or after `t`, so a stinger lands
   * in time with the band; but never more than `most` seconds away (a stinger must answer the moment).
   */
  gridAfter(t: number, steps = 2, most = 0.3): number {
    const dur = this.stepDur;
    // the time of the step being scheduled next, and its index counted from the bar line
    let tt = this.nextTime;
    let s = this.step;
    while (tt - dur >= t) {
      tt -= dur;
      s--;
    }
    while (tt < t || ((s % steps) + steps) % steps !== 0) {
      tt += dur;
      s++;
      if (tt - t > most) return t;
    }
    return tt;
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
    // far behind the clock (the page was frozen for a while): carry on from now rather than replaying the gap
    if (this.nextTime < this.c.currentTime - 1.5) this.nextTime = this.c.currentTime;
    while (!this.disposed && !this.retired && this.nextTime < until) {
      if (this.step === 0) this.beginBar();
      const list = this.bucket[this.step];
      if (list) {
        const t = this.stepTime(this.nextTime, this.step);
        const now = this.c.currentTime;
        // a note that is already well in the past is dropped: firing a pile of them at once is a burst, not music
        if (t >= now - 0.1) for (const fire of list) fire(Math.max(t, now));
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

  private gateFor(spec: Track, lift = 0): number {
    if (!spec.gate) return 1;
    const k = Math.max(0, Math.min(1, this.intensity + lift));
    const [lo, hi] = spec.gate;
    if (hi <= lo) return k >= lo ? 1 : 0;
    const x = Math.max(0, Math.min(1, (k - lo) / (hi - lo)));
    return x * x * (3 - 2 * x);
  }

  private beginBar() {
    // tempo glides toward its target, half the remaining distance each bar
    let retime = false;
    // the game's state moves one bar's worth toward what was asked for
    this.state = stepState(this.state, this.stateTarget);
    const want = clampTempo(this.tempoTarget * moodTempo(this.state));
    if (Math.abs(want - this.tempoScale) > 0.0005) {
      this.tempoScale += (want - this.tempoScale) * 0.5;
      retime = true;
    }
    // a piece may slow or broaden bar by bar (its tempoMap)
    const map = this.theme.tempoMap;
    const bt = map?.length ? map[this.bar % this.barChords.length % map.length] ?? 1 : 1;
    if (bt !== this.barTempo) {
      this.barTempo = bt;
      retime = true;
    }
    if (retime) this.core.setDelayTime(this.stepDur * 4 * (this.theme.delay ?? 0.75));
    const barDur = this.stepDur * this.spb;
    // intensity glides toward its target: quicker up than down
    const tau = this.targetIntensity > this.intensity ? 1.2 : 4;
    this.intensity += (this.targetIntensity - this.intensity) * (1 - Math.exp(-barDur / tau));
    // the whole piece also swells a little with intensity
    this.out.gain.setTargetAtTime((this.theme.level ?? 1) * (0.74 + 0.26 * this.intensity), Math.max(this.c.currentTime, this.nextTime - 0.02), 0.4);

    // a chained piece adds its next chunk as the last one ends: it never comes round
    if (this.chain) while (this.bar >= this.partAt!.length) this.appendChunk();
    const L = this.barChords.length;
    const barInLoop = this.chain ? this.bar : this.bar % L;
    const loop = this.chain ? Math.floor(this.chainHistory.length / 8) : Math.floor(this.bar / L);
    // the section of the form and the bar within it (a piece without a form is one section: its loop)
    const form = this.theme.form;
    const at = this.partAt?.[barInLoop];
    const part = at && form ? form[at.p] : undefined;
    const bip = at ? at.b : barInLoop;
    const prevPart = at && form && this.partAt ? form[this.partAt[this.chain ? Math.max(0, barInLoop - 1) : (barInLoop - 1 + L) % L].p] : undefined;
    const lift = (part?.lift ?? 0) + intensityLift(this.state);
    const st = this.state;
    const drop = voiceDrop(st);
    this.tone.frequency.setTargetAtTime(toneCutoff(st), Math.max(this.c.currentTime, this.nextTime - 0.02), 0.35);
    // the arrangement: every pass through the loop is dressed differently, and each stage starts at a different pass
    // (a chained piece has its quiet passages and its variety written in: it is never lifted a key or broken down as a loop is)
    const phase = this.theme.still || this.chain ? 0 : Playback.phaseOf(loop, this.seed);
    const lp = loop + (this.seed % 2);
    const sh = phase === 3 ? 2 : 0;
    this.sh = sh;
    const calm = this.targetIntensity < 0.3;
    /** the breakdown: first bars of the pass lose drums and bass, then a riser and a crash bring them back */
    const win = Math.min(4, Math.floor(L / 2));
    // (a piece with a form has its quiet passage written in: the riser ends it and the crash brings the next section in)
    // (and a boss fight past its first phase, or a danger, never drops into the breakdown: the music only builds then)
    const driven = st.boss >= 2 || st.danger >= 0.5;
    const inBreak = !form && phase === 2 && !calm && !driven && barInLoop < win;
    const riserBar = form ? part?.name === 'break' && at!.b === at!.len - 1 && !calm : phase === 2 && !calm && !driven && barInLoop === win - 1;
    const crashBar = form ? prevPart?.name === 'break' && part?.name !== 'break' && bip === 0 && !calm : phase === 2 && !calm && !driven && barInLoop === win;
    // a boss's new phase is marked on the bar line it is heard from: the cymbal and the taiko
    const phaseHit = st.boss > this.lastBoss && this.lastBoss > 0;
    this.lastBoss = st.boss;
    /** two-pattern tracks swap their order on the answer pass and on alternating stages */
    const swap = (phase === 1 ? 1 : 0) + ((this.seed >> 3) & 1);
    const bc0 = this.barChords[barInLoop];
    const bc: BarChord = sh ? { ...bc0, chord: shiftChord(bc0.chord, sh) } : bc0;
    this.bucket = [];
    const push = (step: number, fn: (t: number) => void) => {
      (this.bucket[step] ??= []).push(fn);
    };
    const stepDur = this.stepDur;
    const now = this.c.currentTime;

    if (riserBar) {
      push(Math.max(0, this.spb - 12), (t) => this.drum('riser')(this.core, this.accent, t, 0.9));
      for (let i = 0; i < 8; i++) push(this.spb - 8 + i, (t) => this.drum('tom')(this.core, this.accent, t, 0.25 + 0.075 * i));
    }
    if (crashBar || phaseHit) {
      push(0, (t) => {
        this.drum('crash')(this.core, this.accent, t, 0.9);
        this.drum('taiko')(this.core, this.accent, t, 0.8);
      });
    }
    // the first melody track is the lead: on the lift pass a bell answers it an octave up
    const lead = this.tracks.find((r) => r.spec.kind === 'melody');

    for (const rt of this.tracks) {
      const spec = rt.spec;
      // a layer comes in with the game's state alone; every other part with the intensity (and the section's lift), shaped by the state
      const resting = !!part?.rest && (part.rest.includes(rt.role) || part.rest.includes(spec.name));
      const shape = resting ? 0 : layerMix(rt.role, st);
      const g = (spec.layer ? 1 : this.gateFor(spec, lift)) * shape * spec.gain * (this.real ? trimOf(spec.kind === 'drums' ? spec.voice : spec.inst) : 1);
      rt.gate.gain.setTargetAtTime(g, Math.max(now, this.nextTime - 0.02), 0.3);
      if (g < 0.02 || (this.liteMode && spec.lite)) continue;
      if (spec.mask && spec.mask[bip % spec.mask.length] === '.') continue;
      if (inBreak && (spec.kind === 'drums' || (spec.kind === 'pattern' && LOW_INSTS.has(spec.inst)))) continue;
      const vel = (v: number) => v * (0.9 + this.rand() * 0.2);

      if (spec.kind === 'drums') {
        const isFill = spec.fill && bip % 4 === 3;
        const n = rt.drums!.length;
        const cells = isFill ? rt.fill! : rt.drums![(bip + (n === 2 ? swap : 0)) % n];
        const voice = DRUM_VOICES[this.real ? realVoice(spec) : spec.voice];
        for (const h of cells) push(h.step, (t) => voice(this.core, rt.gate, t + (this.rand() - 0.5) * 0.006, vel(h.v)));
      } else if (spec.kind === 'pattern') {
        const n2 = rt.pats!.length;
        const cells = rt.pats![(bip + (n2 === 2 ? swap : 0)) % n2];
        const voice = NOTE_VOICES[this.real ? realVoice(spec) : spec.inst];
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
        // a section's own line for this track, or the track's own bars
        const own = at ? rt.partMel?.[at.p] : null;
        const mel = own ?? rt.melody!;
        const mi = own ? bip % own.length : barInLoop % mel.length;
        let bar = mel[mi];
        if (bar === null) {
          const r = rng(hashStr(this.theme.id + (spec.genKey ?? spec.name)) + barInLoop * 131 + (lp % 4) * 7919 + this.seed * 17);
          bar = generateMelodyBar({
            scalePcs: this.scale.map((x) => (this.tonic + sh + x) % 12),
            chordPcs: chordPcs(bc.chord),
            prev: rt.lastPitch,
            lo: (spec.gen?.lo ?? this.tonic) + sh,
            hi: (spec.gen?.hi ?? this.tonic + 17) + sh,
            rand: r,
            steps: this.spb,
            phraseBar: bip % 4,
            density: spec.gen?.density,
          });
        }
        const inst = part?.inst?.[spec.name] ?? (spec.altInst && lp % 2 === 1 ? spec.altInst : spec.inst);
        const voice = NOTE_VOICES[this.real ? realVoice(spec, inst) : inst];
        const echo = phase === 3 && rt === lead && !this.liteMode ? NOTE_VOICES[this.real ? 'glockR' : 'bell'] : null;
        for (const nt of bar) {
          if (nt.midi === null) continue;
          const composed = mel[mi] === null;
          // written bars carry the track's transposition from the notation; composed ones get it here, after they are made, so a track that doubles another a few octaves away plays the same notes
          const m = nt.midi + (composed ? spec.shift ?? 0 : sh);
          rt.lastPitch = composed ? m - (spec.shift ?? 0) : m;
          const dur = nt.len * stepDur * (spec.legato ?? 0.95);
          // a part that sings below the tune or plays in a narrower range than the tune does (see fullOrchestra) is moved to where it can: the tune itself stays as it was
          let pm = m;
          if (spec.harmonize) pm = harmonyBelow(pm, chordPcs(bc.chord), spec.harmonize);
          if (spec.fold) pm = foldInto(pm, spec.fold);
          push(nt.step, (t) => voice(this.core, rt.gate, t + (this.rand() - 0.5) * 0.004, midiHz(pm), dur, vel(nt.vel ?? 0.85)));
          if (echo && nt.len >= 2) push(nt.step, (t) => echo(this.core, rt.gate, t + stepDur * 1.5, midiHz(m + 12), Math.min(dur, stepDur * 4), 0.3));
        }
      } else if (spec.kind === 'chords') {
        const voice = CHORD_VOICES[this.real ? realVoice(spec) : spec.inst];
        // (in the dark the chords are voiced lower: adaptive.ts voiceDrop)
        rt.lastVoicing = voiceLead(rt.lastVoicing, bc.chord, spec.lo - drop, spec.hi - drop, spec.voices ?? 4);
        const notes = rt.lastVoicing.map(midiHz);
        if (spec.stabs) {
          const cells = rt.stabs![bip % rt.stabs!.length];
          for (const h of cells) push(h.step, (t) => voice(this.core, rt.gate, t, notes, (spec.stabLen ?? 2) * stepDur, vel(h.v)));
        } else if (bc.start) {
          const dur = bc.left * barDur - 0.05;
          push(0, (t) => voice(this.core, rt.gate, t, notes, dur, vel(0.9)));
        }
      }
    }
  }

  /** a drum voice by its written name, as this performance plays it (the recording that stands for it when the music is the real orchestra) */
  private drum(name: string) {
    return DRUM_VOICES[this.real ? realVoice({ kind: 'drums', voice: name }) : name];
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
      this.tone.disconnect();
    } catch {
      /* already gone */
    }
  }
}
