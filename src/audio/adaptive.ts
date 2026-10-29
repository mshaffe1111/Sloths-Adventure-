/**
 * Adaptive music: the piece that is playing follows what is happening in the stage.
 *
 * The game tells the music its state (MusicState) and the Playback mixes its parts to match, always on a bar line and with a fade, never a
 * cut. A part's role (what it does in the music: the tune, the drums, the bass, a figure) decides how it answers each state:
 *
 *   danger   animals close, a tide rising, a chase, a timed zone waking, crumbling tiles: the DRIVE layer comes in (a string ostinato, a
 *            timpani pulse, a snare) and the music gets a little fuller
 *   dark     dark zones and underground: thinner and lower. The figures and the high parts leave, the chords are voiced lower, the treble
 *            is filtered off
 *   exit     near the exit: lifted. The SHINE layer comes in (a glockenspiel and harp figure up high, the violins on the tune an octave up)
 *   puzzle   a puzzle room: a quiet bed (the held chords and a soft figure) so the player can think; the tune, drums and bass rest
 *   boss     a boss fight's phase, 1 to 3: phase 2 brings in the drive layer, phase 3 the BOSS layer (taiko, brass hits) on top
 *   mood     a story beat in play: 'sad' (the tune alone over the strings, a touch slower), 'tense' (the drive layer low, the tune thin),
 *            'warm' (strings and figures, no drums)
 *
 * The layers are parts of the same piece (written from its own chords and tune, in its key), added by `layerTracks`, so nothing ever
 * clashes with what is playing. Pure functions: tested without audio.
 */
import type { ChordTrack, DrumTrack, MelodyTrack, PatternTrack, Theme, Track } from './music.ts';
import { VOICE_RANGE } from './scoreKit.ts';
import { DOUBLES, realVoice } from './realize.ts';

export type Mood = 'sad' | 'tense' | 'warm';

export interface MusicState {
  danger: number;
  dark: number;
  exit: number;
  puzzle: number;
  /** 0 = no boss; 1..3 = the fight's phase */
  boss: number;
  mood: Mood | null;
}

export const CALM: MusicState = { danger: 0, dark: 0, exit: 0, puzzle: 0, boss: 0, mood: null };

/** what a part does in the piece */
export type Role = 'lead' | 'counter' | 'perc' | 'low' | 'bed' | 'stab' | 'color' | 'drive' | 'shine' | 'boss' | 'dark';

const LOW_INSTS = new Set<string>(['bass', 'subBass', 'synthBass', 'cello', 'contra', 'contraPizz', 'tuba', 'celloStac', 'bassoon']);

export function roleOf(t: Track): Role {
  if (t.layer) return t.layer;
  if (t.kind === 'drums') return 'perc';
  if (t.kind === 'chords') {
    if (t.stabs) return 'stab';
    return t.name === 'bedLow' ? 'low' : 'bed';
  }
  if (t.kind === 'melody') {
    if (t.name === 'counter' || t.genKey === 'counter') return 'counter';
    return 'lead';
  }
  // pattern tracks: the bass lines are the low end, every other figure is colour
  if (/bass/i.test(t.name) || (LOW_INSTS.has(t.inst) && t.oct < 44)) return 'low';
  return 'color';
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** how loud (0..1) a part of each role plays in a state: multiplied into the part's own level, on the bar line */
export function layerMix(role: Role, s: MusicState): number {
  let m = 1;
  // the layers come in with their state
  if (role === 'drive') m = Math.max(s.danger, s.boss >= 2 ? 1 : 0, s.mood === 'tense' ? 0.55 : 0);
  else if (role === 'shine') m = s.exit;
  else if (role === 'boss') m = s.boss >= 3 ? 1 : 0;
  else if (role === 'dark') m = s.dark;
  // (Matt, 2026-10-29, on v1: "I can't tell the difference". Each state now changes the music outright, so a player notices it untold)
  // danger: the tune gives way to the tense ostinato of the drive layer, the drums and the low brass
  if (role === 'lead' || role === 'counter') m *= 1 - 0.85 * s.danger;
  // a layer takes the place of what it answers, so it adds no voices on a phone: the drive's ostinato replaces the piece's own figures,
  // and the exit's high doubling of the tune replaces the countermelody
  if (role === 'color') m *= 1 - s.danger;
  if (role === 'counter') m *= 1 - s.exit;
  // a puzzle room: only the held chords and a soft figure
  const p = s.puzzle;
  const puzzleCut: Partial<Record<Role, number>> = { lead: 0.9, counter: 1, perc: 0.92, stab: 1, low: 0.55, color: 0.45, drive: 1, shine: 1, boss: 1 };
  m *= 1 - p * (puzzleCut[role] ?? 0);
  // dark and underground: the music falls away to a low drone and a sparse high bell (the dark layer)
  const d = s.dark;
  const darkCut: Partial<Record<Role, number>> = { color: 1, counter: 1, shine: 1, lead: 1, stab: 1, perc: 0.85, bed: 0.6, drive: 0.5 };
  m *= 1 - d * (darkCut[role] ?? 0);
  if (s.mood === 'sad') m *= ({ perc: 0, stab: 0, drive: 0, counter: 0.3, color: 0.45, low: 0.6, boss: 0 } as Partial<Record<Role, number>>)[role] ?? 1;
  else if (s.mood === 'tense') m *= ({ lead: 0.35, counter: 0, color: 0.4, perc: 0.6, stab: 0.5 } as Partial<Record<Role, number>>)[role] ?? 1;
  else if (s.mood === 'warm') m *= ({ perc: 0.3, stab: 0.3, drive: 0, boss: 0, low: 0.9 } as Partial<Record<Role, number>>)[role] ?? 1;
  return clamp01(m);
}

/** how much fuller (+) or emptier (-) the state makes the piece: added to its intensity before the intensity gates are read */
export function intensityLift(s: MusicState): number {
  // (small for danger and the exit: the game already raises the intensity when an animal is near, and their layers carry the change)
  // (near the exit the whole arrangement swells: every part comes in)
  return 0.25 * s.danger + 0.5 * s.exit - 0.2 * s.puzzle - 0.12 * s.dark + (s.boss >= 3 ? 0.1 : 0) + (s.mood === 'sad' ? -0.2 : s.mood === 'warm' ? -0.05 : 0);
}

/** the top of the music's treble in a state (Hz): the dark closes it */
export const toneCutoff = (s: MusicState) => (s.dark > 0.02 ? Math.round(18000 * Math.pow(4500 / 18000, s.dark)) : 18000);

/** semitones the held chords are voiced lower in a state */
export const voiceDrop = (s: MusicState) => Math.round(7 * clamp01(s.dark));

/** a story beat's speed: a sad one breathes a little slower */
export const moodTempo = (s: MusicState) => (s.mood === 'sad' ? 0.95 : 1) * (1 + 0.1 * s.danger);

/**
 * Bring a state toward its target by one bar: the layers rise quickly (a danger is heard at once) and fall slowly (it lingers a bar or two
 * after the animal has gone), so a part never jumps.
 */
export function stepState(cur: MusicState, target: MusicState): MusicState {
  const ease = (a: number, b: number) => {
    const k = b > a ? 0.7 : 0.4;
    const x = a + (b - a) * k;
    return Math.abs(b - x) < 0.02 ? b : x;
  };
  return {
    danger: ease(cur.danger, target.danger),
    dark: ease(cur.dark, target.dark),
    exit: ease(cur.exit, target.exit),
    puzzle: ease(cur.puzzle, target.puzzle),
    boss: target.boss,
    mood: target.mood,
  };
}

/** a 3/4 piece plays the first 12 steps of a figure */
const fit = (spb: number, s: string) => (spb === 12 ? s.replace(/\s/g, '').slice(0, 12) : s);

/**
 * The layers a piece gains for the states: written from its own chords and its own tune, on instruments it already plays where it can (so
 * no new recordings have to be fetched and decoded for them: the phones' memory).
 */
export function layerTracks(theme: Theme): Track[] {
  const spb = theme.stepsPerBar ?? 16;
  const f = (s: string) => fit(spb, s);
  const has = (inst: string) => theme.tracks.some((t) => (t.kind === 'pattern' || t.kind === 'melody') && t.inst === inst);
  const lead = theme.tracks.find((t): t is MelodyTrack => t.kind === 'melody');
  const out: Track[] = [];
  // ---- drive: a string ostinato on the off-beats and the beat, a timpani pulse, a snare that pushes
  const ostInst = has('celloStac') ? 'celloStac' : has('violinStac') ? 'violinStac' : 'figR';
  out.push({ kind: 'pattern', name: 'driveOst', layer: 'drive', inst: ostInst as PatternTrack['inst'], oct: 48, pats: [f('r.r. r.r. r.r. r.r.'), f('r.r. r.f. r.r. f.r.')], gain: 0.56, rev: 0.12, len: 0.5, pan: 0.15 } as PatternTrack);
  out.push({ kind: 'drums', name: 'drivePulse', layer: 'drive', voice: 'timpani', pats: [f('x... x... x... x...'), f('x... x... x..x x...')], gain: 0.56, rev: 0.25 } as DrumTrack);
  out.push({ kind: 'drums', name: 'driveSnare', layer: 'drive', voice: 'snare', pats: [f('.... x..x .... x.xx'), f('..x. x... ..x. x.x.')], gain: 0.4, rev: 0.2 } as DrumTrack);
  // ---- shine: the glockenspiel and harp up high, and the violins on the tune an octave up
  out.push({ kind: 'pattern', name: 'shineGlock', layer: 'shine', inst: 'bell', oct: 79, pats: [f('r... t... f... o...'), f('o... f... t... f...')], gain: 0.16, rev: 0.5, dly: 0.2, len: 1 } as PatternTrack);
  if (has('harp')) out.push({ kind: 'pattern', name: 'shineHarp', layer: 'shine', lite: true, inst: 'harp', oct: 67, pats: [f('r.t.f.o.f.t.r.t.')], gain: 0.26, rev: 0.45, len: 1, pan: -0.35 } as PatternTrack);
  // the tune an octave up, on a high voice the piece already has (the phones' memory: no instrument is fetched for a layer alone)
  const plays = new Set<string>(theme.tracks.flatMap((t) => (t.kind === 'melody' ? [t.inst, t.altInst ?? ''] : t.kind === 'pattern' ? [t.inst] : [])));
  if (lead) for (const d of DOUBLES[realVoice(lead)] ?? []) plays.add(d.inst);
  for (const p of theme.form ?? []) for (const i of Object.values(p.inst ?? {})) plays.add(i);
  const high = ['violins', 'flute', 'violas', 'oboe', 'clarinet'].find((x) => plays.has(x));
  if (lead && high) {
    out.push({
      kind: 'melody', name: 'lead+shine', layer: 'shine', inst: high as MelodyTrack['inst'], bars: lead.bars, gen: lead.gen, genKey: lead.genKey ?? lead.name,
      shift: (lead.shift ?? 0) + 12, legato: lead.legato, fold: VOICE_RANGE[high], gain: Math.round(lead.gain * 0.42 * 1000) / 1000, rev: 0.5,
    } as MelodyTrack);
  }
  // ---- the exit: a high string chord swells over everything (the strings are loaded with every piece)
  out.push({ kind: 'chords', name: 'shineBed', layer: 'shine', inst: 'orchStrings', lo: 60, hi: 81, voices: 4, gain: 0.32, rev: 0.6 } as ChordTrack);
  // ---- danger also brings the low brass in, punching the beat
  out.push({ kind: 'chords', name: 'driveBrass', layer: 'drive', inst: 'orchBrass', lo: 36, hi: 55, voices: 3, stabs: [f('X... ..x. X... x...'), f('X..x ..x. X... X...')], stabLen: 2, gain: 0.45, rev: 0.25 } as ChordTrack);
  // ---- dark: a low drone on the home chord and a sparse high bell, all that is left when the music falls away
  out.push({ kind: 'chords', name: 'darkDrone', layer: 'dark', inst: 'orchLow', lo: 31, hi: 48, voices: 2, gain: 0.5, rev: 0.6 } as ChordTrack);
  out.push({ kind: 'pattern', name: 'darkSpark', layer: 'dark', inst: 'bell', oct: 84, pats: [f('.... .... o... ....'), f('.... .... .... ..t.'), f('.... .... .... ....')], gain: 0.14, rev: 0.8, len: 1, pan: 0.4 } as PatternTrack);
  // ---- boss: the taiko and brass hits of a fight's last phase
  out.push({ kind: 'drums', name: 'bossTaiko', layer: 'boss', voice: 'taiko', pats: [f('X... ..x. X..x x.x.'), f('X... x... X.x. xxx.')], gain: 0.5, rev: 0.3 } as DrumTrack);
  out.push({ kind: 'chords', name: 'bossBrass', layer: 'boss', inst: 'orchBrass', lo: 43, hi: 64, voices: 3, stabs: [f('x... .... x.x. ....'), f('x... ..x. .... x...')], stabLen: 2, gain: 0.42, rev: 0.35 } as ChordTrack);
  return out;
}
