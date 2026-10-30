/**
 * Orchestration: dresses a tune in the recorded orchestra.
 *
 * The composer (composer.ts) and the written themes (themes.ts) decide the notes: key, chords, melody. This decides who plays
 * the accompaniment and how it moves, and that depends on what the player is doing:
 *
 *   run    a stage that is about getting somewhere: a driving staccato ostinato, pizzicato bass, timpani on the beat
 *   fight  a stage that is about beating things up: the same drive, heavier (bass drum, snare, low brass stabs)
 *   climb  a stage that goes up (and the big scenes: title, map, cutscenes): broad and slow, sustained strings and horns
 *   sneak  a quiet stage: pizzicato, soft timpani, a hush
 *   boss   the lair: the fight pace with the whole low brass, a gong on every phrase and everything pushed forward
 *
 * How it is scored (the habits of a film or game orchestrator, in rules):
 *   - Every voice sits in its own register: basses and tuba below 130 Hz, cellos and bassoon and trombone from there up to the
 *     middle of the staff, horns and violas and clarinet in the middle, violins, flute and oboe on top. Nothing is doubled in
 *     the same octave except to make a section.
 *   - The tune is doubled in contrasting colours (a reed on it, strings an octave up, cellos an octave down) by the fuller
 *     orchestra (realize.ts), each only as the stage heats up, so the arrangement grows on its own with the intensity gates.
 *   - Something always moves: a sustained bed holds the harmony, a short-note ostinato gives the pulse, and the percussion marks
 *     the beat and the phrase (timpani on the beat, bass drum under the downbeats, a gong or crash at the top of a phrase).
 *   - Percussion that is not pitched stays out of the way of the tune: the high, hissy parts are kept low.
 * Each world keeps its own flavour (which strings, reeds and brass, how heavy the drums, whether a harp is in the room), and
 * every stage varies it a little by its seed, so the same world is never exactly the same twice.
 *
 * Pure data in, data out: nothing here touches audio, so it is all testable without a sound card.
 */
import { hashStr, rng } from './theory.ts';
import type { ChordTrack, DrumTrack, NoteInstName, PatternTrack, Theme, Track } from './music.ts';

export type Pace = 'run' | 'fight' | 'climb' | 'sneak' | 'boss';

export const PACES: Pace[] = ['run', 'fight', 'climb', 'sneak', 'boss'];
export const PACE_CODE: Record<Pace, string> = { run: 'r', fight: 'f', climb: 'c', sneak: 's', boss: 'b' };
export const paceFromCode = (c: string): Pace | null => PACES.find((p) => PACE_CODE[p] === c) ?? null;

/** how a stage's objective sets its pace */
export function paceFor(objective?: string): Pace {
  switch (objective) {
    case 'ascent':
      return 'climb';
    case 'stealth':
      return 'sneak';
    case 'purge':
    case 'gauntlet':
      return 'fight';
    case 'boss_lair':
      return 'boss';
    default:
      return 'run';
  }
}

/** playing speed for a pace, on top of the per-stage nudge (scenes.ts) */
export const PACE_TEMPO: Record<Pace, number> = { run: 1.04, fight: 1.07, climb: 0.94, sneak: 0.9, boss: 1 };

interface Flavour {
  /** the low voice that plays the bass line: the usual one, and one a stage may use instead */
  bass: [NoteInstName, NoteInstName];
  /** the staccato voice of the ostinato (usual, alternative), and the one that answers it high */
  ost: [NoteInstName, NoteInstName];
  ostHi: NoteInstName;
  /** brass colour for stabs and swells */
  brass: 'horn' | 'trombone';
  /** how much drum: 0 light .. 2 heavy */
  weight: 0 | 1 | 2;
  /** the string pad: strings, or brass for the darker worlds */
  pad: 'orchStrings' | 'orchBrass';
  /** how present the harp is (0 = not in this world) */
  harp: number;
  snare: boolean;
  triangle: boolean;
  /** a choir sings over the biggest moments */
  choir: boolean;
}

const FLAVOUR: Record<number, Flavour> = {
  // ---- Act I, The Trail: sunny and light on its feet. Pizzicato, clarinet and flute, a lot of harp
  // 1 Emerald Canopy: pizzicato, a lot of harp
  1: { bass: ['contraPizz', 'cello'], ost: ['violinStac', 'celloStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 1, snare: false, triangle: true, choir: false },
  // 2 Sunlit Riverbank: lazy and flowing. Oboe and harp over violas, no snare
  2: { bass: ['contraPizz', 'bassoon'], ost: ['celloStac', 'violinStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 1, snare: false, triangle: false, choir: false },
  // 3 the deep minor world: cellos and bassoon, sparse
  3: { bass: ['cello', 'contra'], ost: ['celloStac', 'celloStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 0.6, snare: false, triangle: false, choir: false },
  // ---- Act II, The Cost: somber. Bowed basses (no bouncing pizzicato), cellos for the pulse, nothing glittering, no snare
  // 4 the mystery: bowed cello and bass, a little harp, no drums to speak of
  4: { bass: ['cello', 'contra'], ost: ['celloStac', 'celloStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 0.6, snare: false, triangle: false, choir: false },
  // 5 the cost gets personal (orchid and silk): pizzicato strings under the oboe, a heavier timpani
  5: { bass: ['contraPizz', 'cello'], ost: ['violinStac', 'violinStac'], ostHi: 'violinStac', brass: 'horn', weight: 1, pad: 'orchStrings', harp: 0.4, snare: false, triangle: false, choir: false },
  // 6 low and slow-hearted (the mangrove): the bassoon's tune over plucked double basses, a thin harp
  6: { bass: ['contraPizz', 'contraPizz'], ost: ['celloStac', 'celloStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 0.5, snare: false, triangle: false, choir: false },
  // 7 the General: tuba, trombone and a marching snare under a choir. The march is coming
  7: { bass: ['tuba', 'contra'], ost: ['celloStac', 'hornStac'], ostHi: 'hornStac', brass: 'trombone', weight: 1, pad: 'orchBrass', harp: 0, snare: true, triangle: false, choir: true },
  // ---- Act III, The Iron Road: heavy
  // 8 the night world, the rest: violas and violins, harp, a choir, hardly any drum
  8: { bass: ['cello', 'contra'], ost: ['violinStac', 'violinStac'], ostHi: 'violinStac', brass: 'horn', weight: 0, pad: 'orchStrings', harp: 1, snare: false, triangle: true, choir: true },
  // 9 driving phrygian (the volcano march): tuba under the trombone's tune, 16th cellos, trombone stabs and snare
  9: { bass: ['tuba', 'contra'], ost: ['celloStac', 'celloStac'], ostHi: 'hornStac', brass: 'trombone', weight: 2, pad: 'orchStrings', harp: 0, snare: true, triangle: false, choir: false },
  // 10 the final world: tuba, trombone and horns, a choir, timpani, bass drum
  10: { bass: ['tuba', 'contra'], ost: ['celloStac', 'hornStac'], ostHi: 'hornStac', brass: 'trombone', weight: 2, pad: 'orchBrass', harp: 0.4, snare: true, triangle: false, choir: true },
};

const pick = <T>(r: () => number, a: readonly T[]): T => a[Math.min(a.length - 1, Math.floor(r() * a.length))];

/** the gates of an existing groove are moved earlier, so the exploring level (about .35) already has most of it */
const earlier = (g?: [number, number]): [number, number] | undefined => (g ? [Math.max(0, g[0] - 0.15), Math.max(0.1, g[1] - 0.2)] : undefined);

// ---- patterns. One string per bar: pattern tracks use r t f s o (chord tones), stabs and drums use x X o.

type Pool = Record<Pace, string[]>;

const OST: Pool = {
  // eighth notes with a push: the engine of a run
  run: ['R.r. R.r. R.r. R.rr', 'R.rr .r.r R.rr .r.r', 'R.r. r.R. R.r. r.rR'],
  fight: ['RrRr RrRr RrRr RrRr', 'R.rr R.rr R.rr R.rr', 'RrR. RrR. RrRr R.rr'],
  climb: ['r... .... r... ....', 'r... r... r... r...', 'r... .... r... t...'],
  sneak: ['r... .... .... ....', '.... .... r... ....'],
  boss: ['RrRr RrRr RrRr RrRr', 'R.rR .rR. R.rR .rRr', 'RrrR rRrr RrrR rRrr'],
};
const OST_HI: Pool = {
  run: ['.... t... .... t...', '..t. ..f. ..t. ..f.', '.t.. .t.. .t.. .t.t'],
  fight: ['..t. ..t. ..t. ..tt', '.t.t .t.t .t.t .t.t'],
  climb: ['.... .... t... ....', '.... f... .... t...'],
  sneak: ['.... .... .... t...'],
  boss: ['..t. ..t. ..t. ..tt', 't.f. t.f. t.f. t.ft'],
};
const BASS: Pool = {
  run: ['R... ..r. R... ..f.', 'R... R... ..r. f...', 'R.-. ..r. ..f. r...'],
  fight: ['R..R ..r. R..R .f.r', 'R... R... R..r .f.r'],
  climb: ['R--- ---- ---- ----', 'R--- ---- r--- ----'],
  sneak: ['R... .... ..r. ....', 'R... .... .... ....'],
  boss: ['R.RR ..r. R.RR .f.r', 'R.Rr R.Rr R.Rf R.r.'],
};
const TIMP: Pool = {
  run: ['X... .... x... ..x.', 'X... .... X... ....', 'X... .... x... x...'],
  fight: ['X... x... X... x.xx', 'X... .... x..x ..X.'],
  climb: ['X... .... .... ....', 'X... .... x... ....'],
  sneak: ['.... .... x... ....', 'x... .... .... ....'],
  boss: ['X... x... X... x.xx', 'X..x ..x. X... xxxx'],
};
const BDRUM: Pool = {
  run: ['x... .... x... ....', 'X... .... .... ..x.'],
  fight: ['X... X... X... X...', 'X... ..x. X... ..x.', 'X..x X... X... ..xx'],
  climb: ['.... .... .... X...'],
  sneak: ['.... .... .... ....'],
  boss: ['X... X... X... X..x', 'X.x. X... X.x. X.xx'],
};
const STAB: Pool = {
  run: ['x... .... ..x. ....', 'x... .... x... ..x.'],
  fight: ['X... ..x. X... ..x.', 'X..x ..X. ..x. X...'],
  climb: ['X... .... .... ....', 'X... .... X... ....'],
  sneak: ['.... .... .... ....'],
  boss: ['X... ..x. X... ..x.', 'X..x ..X. ..x. X.xx'],
};
const HARP: Pool = {
  run: ['r.t. f.o. f.t. r.t.', 'r.tf o.tf r.tf o.t.'],
  fight: ['r... .... t... ....'],
  climb: ['r.tf o.tf r.tf o.tf', 'rtfo .... rtfo ....'],
  sneak: ['r... t... f... t...', 'r... .... f... ....'],
  boss: ['r... .... t... ....'],
};
const SNARE: Pool = {
  run: ['.... .... .... x...', '.... x... .... x..x'],
  fight: ['.... x... .... x..x', '.... x... ..x. x.xx'],
  climb: [],
  sneak: [],
  boss: ['.... X... .... X..x', '.... X... ..x. xxxx'],
};
const TRI: Pool = {
  run: ['.... ..x. .... ..x.', '.... .... ..x. ....'],
  fight: ['.... ..x. .... ....'],
  climb: ['x... .... .... ....'],
  sneak: ['.... .... ..x. ....'],
  boss: [],
};

/** jungle percussion stays (it is each world's sound); only the high, hissy parts are kept low */
const HISS = new Set(['hat', 'ohat', 'brush', 'clave']);

export function orchestrate(theme: Theme, o: { world: number; pace: Pace; seed: number }): Theme {
  const f = FLAVOUR[Math.max(1, Math.min(10, Math.floor(o.world) || 1))];
  const r = rng((hashStr(`orch${theme.id}${o.pace}`) ^ Math.imul(o.seed >>> 0, 2246822519)) >>> 0);
  const p = o.pace;
  const big = p === 'fight' || p === 'boss';
  const waltz = theme.stepsPerBar === 12;
  /** a pattern for a 3/4 piece is its first 12 steps */
  const fit = (s: string) => (waltz ? s.replace(/\s/g, '').slice(0, 12) : s);
  /** a stage's own dice: the same stage always gets the same picks, another stage another */
  const chance = (q: number) => r() < q;
  const tracks: Track[] = [];
  const hasInst = (inst: string) => theme.tracks.some((t) => t.kind === 'pattern' && t.inst === inst);
  const hasVoice = (v: string) => theme.tracks.some((t) => t.kind === 'drums' && t.voice === v);

  for (const t of theme.tracks) {
    if (t.kind === 'chords' && (t.inst === 'pad' || t.inst === 'strings')) continue; // replaced below
    if (t.kind === 'pattern' && ['bass', 'subBass', 'synthBass'].includes(t.inst)) continue; // replaced below
    if (t.kind === 'pattern' && t.lite) {
      // the tinkling arpeggios are the treble that was complained about: only the slow, quiet paces keep them
      if (big || p === 'run') continue;
      tracks.push({ ...t, gain: t.gain * 0.75 });
      continue;
    }
    if (t.kind === 'drums') {
      const d = t as DrumTrack;
      tracks.push({ ...d, gain: d.gain * (HISS.has(d.voice) ? 0.6 : p === 'sneak' ? 0.6 : 1), gate: earlier(d.gate) } as Track);
      continue;
    }
    if (t.kind === 'melody' && t.lite) {
      tracks.push({ ...t, gate: earlier(t.gate) } as Track);
      continue;
    }
    tracks.push(t);
  }

  // ---- the foundation: always on, so a stage is full from the first bar
  const padHi = f.pad === 'orchBrass' ? 66 : 70;
  tracks.push({ kind: 'chords', name: 'orchPad', inst: f.pad, lo: 44, hi: padHi, voices: 4, gain: p === 'climb' ? 0.52 : p === 'sneak' ? 0.34 : 0.4, rev: 0.62 } as ChordTrack);
  // horns held underneath, quiet: the warmth that makes the strings sound like part of an orchestra and not a pad
  if (p !== 'sneak' && (big || chance(0.75))) {
    tracks.push({ kind: 'chords', name: 'hornBed', lite: true, inst: 'orchBrass', lo: 41, hi: 62, voices: 3, gain: p === 'climb' ? 0.3 : 0.2, rev: 0.6, gate: [0, 0.3] } as ChordTrack);
  }
  const bassInst: NoteInstName = p === 'climb' ? 'contra' : p === 'boss' ? 'tuba' : chance(0.7) ? f.bass[0] : f.bass[1];
  tracks.push({
    kind: 'pattern', name: 'orchBass', inst: bassInst, oct: bassInst === 'contraPizz' ? 36 : bassInst === 'bassoon' ? 38 : 33,
    pats: [fit(pick(r, BASS[p])), fit(pick(r, BASS[p]))], gain: bassInst === 'contraPizz' ? 0.8 : 0.7, rev: 0.06, len: 1,
  } as PatternTrack);
  if (p === 'run' || big) {
    // a sustained cello under the pizzicato gives the bass a body that holds
    tracks.push({ kind: 'pattern', name: 'orchBass2', inst: 'cello', oct: 36, pats: [fit('R--- ---- ---- ----')], gain: 0.4, rev: 0.1, gate: [0.1, 0.35] } as PatternTrack);
  }
  const ostInst = chance(0.7) ? f.ost[0] : f.ost[1];
  tracks.push({ kind: 'pattern', name: 'ost', inst: ostInst, oct: 48, pats: [fit(pick(r, OST[p])), fit(pick(r, OST[p]))], gain: big ? 0.7 : p === 'sneak' ? 0.4 : 0.62, rev: 0.12, len: 0.5, pan: -0.15 } as PatternTrack);
  if (big || chance(0.8)) {
    tracks.push({ kind: 'pattern', name: 'ostHi', lite: true, inst: f.ostHi, oct: 66, pats: [fit(pick(r, OST_HI[p])), fit(pick(r, OST_HI[p]))], gain: 0.34, rev: 0.2, len: 0.5, pan: 0.2, gate: [0.1, 0.4] } as PatternTrack);
  }

  // ---- more of the orchestra: harp, a reed on the tune, bassoon under the bass, snare and triangle
  if (f.harp > 0 && !hasInst('harp') && (p === 'sneak' || p === 'climb' || chance(0.5 + 0.5 * f.harp))) {
    tracks.push({
      kind: 'pattern', name: 'harpArp', inst: 'harp', oct: 60, pats: HARP[p].map(fit), gain: (p === 'sneak' ? 0.45 : 0.6) * (0.6 + 0.4 * f.harp), rev: 0.45, dly: 0.12, pan: -0.3, len: 1,
      gate: big ? [0.3, 0.6] : [0.1, 0.4],
    } as PatternTrack);
  }
  if (p !== 'sneak' && bassInst !== 'bassoon') {
    tracks.push({ kind: 'pattern', name: 'bassoonBed', lite: true, inst: 'bassoon', oct: 38, pats: [fit('R--- ---- r--- ----')], gain: 0.45, rev: 0.2, pan: 0.2, gate: [0.1, 0.4] } as PatternTrack);
  }
  if (f.snare && SNARE[p].length && !hasVoice('snare')) {
    tracks.push({ kind: 'drums', name: 'snareR', voice: 'snare', pats: SNARE[p].map(fit), gain: big ? 0.65 : 0.5, rev: 0.25, gate: [0.15, 0.45] } as DrumTrack);
  }
  if (f.triangle && TRI[p].length) {
    tracks.push({ kind: 'drums', name: 'triR', lite: true, voice: 'triangle', pats: TRI[p].map(fit), gain: 0.4, rev: 0.4, gate: [0.3, 0.6] } as DrumTrack);
  }

  // ---- the timpani, bass drum, and for a boss the gong
  const drumW = 0.6 + 0.15 * f.weight;
  tracks.push({ kind: 'drums', name: 'timpR', voice: 'timpani', pats: TIMP[p].map(fit), gain: drumW, rev: 0.3 } as DrumTrack);
  if (p !== 'sneak') tracks.push({ kind: 'drums', name: 'bdrumR', voice: 'bassDrum', pats: BDRUM[p].map(fit), gain: 0.55 + 0.1 * f.weight, rev: 0.2, gate: [0.1, 0.4] } as DrumTrack);
  if (p === 'boss') tracks.push({ kind: 'drums', name: 'gongR', voice: 'gong', pats: ['X... .... .... ....'].map(fit), gain: 0.5, rev: 0.5, mask: 'x...' } as DrumTrack);

  // ---- arrives with intensity: brass, and the choir in the worlds that have one
  if (p !== 'sneak') {
    tracks.push({
      kind: 'chords', name: 'brassStab', inst: 'orchBrass', lo: f.brass === 'trombone' ? 38 : 43, hi: f.brass === 'trombone' ? 60 : 64, voices: 3, stabs: STAB[p].map(fit),
      stabLen: p === 'climb' ? 6 : 2, gain: big ? 0.5 : 0.4, rev: 0.35, gate: big ? [0.2, 0.5] : [0.3, 0.6],
    } as ChordTrack);
  }
  if (f.choir && (p === 'climb' || big) && !theme.tracks.some((t) => t.kind === 'chords' && t.inst === 'choir')) {
    tracks.push({ kind: 'chords', name: 'choirR', lite: true, inst: 'choir', lo: 55, hi: 74, voices: 3, gain: 0.26, rev: 0.6, gate: [0.45, 0.85] } as ChordTrack);
  }
  return { ...theme, tracks };
}
