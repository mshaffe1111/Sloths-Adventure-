/**
 * The game's signature music (Matt, 2026-10-29: "We also need some for the menu and start screen that is bold and unique"): not a world's
 * style reused, but Pokey's own tune as the hook of the whole game, with Donkey Kong Country swagger (a strong groove, a bass that struts,
 * brass punches) and Ori's warmth (a singing string section, a choir).
 *
 *   signature   the start screen, the full statement (about 70 s at 140, then round again): a groove intro, Pokey's tune on horns and violins two
 *               octaves apart, a warm singing section on cellos and violins, the hook again with the choir and the flute on top, a
 *               breakdown where the marimba plays the motif over the drums alone, and the hook to close
 *   menu        the menus (settings, journal, pause from the title): the same tune and key, lighter (marimba, flute, harp, soft hand drums),
 *               as chunks the Playback strings together in a never-repeating order (form.ts), so minutes of sitting never tire
 *   map-<w>     the world map: the menu music with the tune handed to the lead of the world Pokey is on (styles.ts), so moving between
 *               worlds changes the voice
 *
 * All in D major; Pokey's tune is SLOMATT_A (tunes.ts), its first two bars the motif every world's music carries.
 */
import type { ChordTrack, DrumTrack, FormPart, MelodyTrack, NoteInstName, PatternTrack, Theme } from './music.ts';
import { SLOMATT_A } from './tunes.ts';
import { ornament } from './form.ts';
import { rng } from './theory.ts';
import { trim } from './scoreKit.ts';

const REST = 'r:16';
const rests = (n: number) => Array.from({ length: n }, () => REST);

/** the hook's chords (Pokey's: I V vi IV I V IV V) */
const HOOK_CHORDS = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'];
/** the warm section: it starts on the relative minor and comes home through the dominant */
const SING_CHORDS = ['Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'A'];
const SING = ['3:6 2:2 3:4 5:4', '4:8 3:4 2:4', '1:6 2:2 3:4 1:4', '2:12 r:4', '4:6 5:2 6:4 4:4', '5:6 6:2 7:4 5:4', "1':8 7:4 6:4", '5:12 r:4'];
/** the motif alone, for the breakdown */
const MOTIF4 = [SLOMATT_A[0], SLOMATT_A[1], SLOMATT_A[0], '2:3 3:1 2:2 1:2 1:8'];

const mel = (name: string, inst: NoteInstName, gain: number, o: Partial<MelodyTrack> = {}): MelodyTrack =>
  ({ kind: 'melody', name, inst, bars: rests(8), gain: Math.round(gain * trim(inst) * 1000) / 1000, rev: 0.4, ...o }) as MelodyTrack;
const pat = (name: string, inst: NoteInstName, oct: number, pats: string[], gain: number, o: Partial<PatternTrack> = {}): PatternTrack =>
  ({ kind: 'pattern', name, inst, oct, pats, gain, rev: 0.2, ...o }) as PatternTrack;
const drum = (name: string, voice: DrumTrack['voice'], pats: string[], gain: number, o: Partial<DrumTrack> = {}): DrumTrack =>
  ({ kind: 'drums', name, voice, pats, gain, rev: 0.2, ...o }) as DrumTrack;

/** the start screen: the full statement */
export function signatureTheme(): Theme {
  const tracks = [
    { kind: 'chords', name: 'strings', inst: 'orchStrings', lo: 50, hi: 74, voices: 4, gain: 0.3, rev: 0.55 } as ChordTrack,
    { kind: 'chords', name: 'brass', inst: 'orchBrass', lo: 45, hi: 66, voices: 3, gain: 0.42, rev: 0.35, stabs: ['X... ..x. ..X. ....', 'X... ..x. .x.. X...'], stabLen: 2 } as ChordTrack,
    { kind: 'chords', name: 'choir', inst: 'choir', lo: 57, hi: 76, voices: 3, gain: 0.26, rev: 0.6 } as ChordTrack,
    pat('bass', 'contraPizz', 38, ['R..r ..R. .r.. R.f.', 'R..r ..R. .r.R .f.r'], 0.85, { len: 0.6 }),
    // the hook: horns, with the violins two octaves above them; the flute joins it the second time
    mel('hook', 'horn', 0.62, { shift: -12, legato: 0.92 }),
    mel('hookHi', 'violins', 0.36, { shift: 12, genKey: 'hook', legato: 0.95 }),
    mel('flute', 'flute', 0.4, { shift: 12, genKey: 'hook' }),
    // the warm section: cellos, the violins an octave up
    mel('sing', 'cello', 0.6, { shift: -12, legato: 0.98, rev: 0.5 }),
    mel('singHi', 'violins', 0.32, { genKey: 'sing', legato: 0.98, rev: 0.5 }),
    mel('motif', 'marimbaR', 0.7, { rev: 0.35 }),
    // a bright glint over the hook: the glockenspiel on its long notes
    mel('glint', 'glockR', 0.22, { shift: 12, genKey: 'hook', rev: 0.6 }),
    drum('kick', 'kickJ', ['X... ..x. X... ..x.', 'X... ..x. X..x ..x.'], 0.66),
    drum('snare', 'snare', ['.... X... .... X...', '.... X... .... X..x'], 0.58, { fill: '.... X... X.x. XXXX' }),
    drum('toms', 'tomJ', ['.... .... .... ..xx', '.... .... .... ....'], 0.45),
    drum('conga', 'handHi', ['..x. ..x. ..xx ..x.', '..x. .x.. ..x. x.x.'], 0.45),
    drum('shaker', 'shakerJ', ['xoxo xoxo xoxo xoxo'], 0.32),
    drum('timp', 'timpani', ['X... .... .... ....'], 0.55),
    drum('crash', 'crash', ['X... .... .... ....'], 0.34, { mask: 'x...x...x...x...' }),
  ];
  const all = ['hook', 'hookHi', 'flute', 'glint', 'sing', 'singHi', 'motif'];
  const only = (...keep: string[]) => all.filter((n) => !keep.includes(n));
  const form: FormPart[] = [
    // a strutting groove: drums, bass and brass punches
    { name: 'intro', chords: ['D', 'G', 'A', 'A'], rest: [...all, 'choir', 'strings'] },
    { name: 'A', chords: HOOK_CHORDS, lines: { hook: SLOMATT_A }, rest: [...only('hook', 'hookHi'), 'choir'] },
    // Ori's warmth: the drums step back, the strings sing
    { name: 'B', chords: SING_CHORDS, lines: { sing: SING }, rest: [...only('sing', 'singHi'), 'brass', 'snare', 'kick'], lift: -0.1 },
    { name: 'A2', chords: HOOK_CHORDS, lines: { hook: SLOMATT_A }, rest: only('hook', 'hookHi', 'flute', 'glint'), lift: 0.15 },
    // the breakdown: the marimba plays the motif over the drums alone
    { name: 'break', chords: ['D', 'D', 'G', 'A'], lines: { motif: MOTIF4 }, rest: [...only('motif'), 'brass', 'strings', 'choir', 'bass'] },
    { name: 'A3', chords: HOOK_CHORDS, lines: { hook: SLOMATT_A }, rest: only('hook', 'hookHi', 'flute', 'glint'), lift: 0.2 },
  ];
  // (140: a tempo no world plays at, so the title belongs to none of them)
  return { id: 'signature', bpm: 140, tonic: 'D4', scale: 'major', delay: 0.75, chords: HOOK_CHORDS, form, tracks, level: 0.8 };
}

/** the menus and (with the world's lead) the map: the same tune, lighter, as chunks that never come round in the same order */
function lightTheme(id: string, lead: NoteInstName, leadShift: number): Theme {
  const r = rng(77);
  const tracks = [
    { kind: 'chords', name: 'pad', inst: 'orchStrings', lo: 52, hi: 72, voices: 3, gain: 0.22, rev: 0.6 } as ChordTrack,
    pat('bass', 'contraPizz', 38, ['R... ..r. R... ....', 'R... ..r. ..f. r...'], 0.7, { len: 0.7 }),
    pat('harp', 'harp', 60, ['r.t.f.o. f.t.r.t.', 'r.f.o.f. t.f.r.f.'], 0.32, { rev: 0.45, pan: -0.3 }),
    mel('tune', lead, 0.62, { ...(leadShift ? { shift: leadShift } : {}), rev: 0.4 }),
    mel('tune2', 'flute', 0.5, { shift: 12, rev: 0.45 }),
    { ...mel('counter', 'clarinet', 0.36, { rev: 0.5 }), bars: Array.from({ length: 8 }, () => null), gen: { lo: 66, hi: 79, density: 0.3 } } as MelodyTrack,
    drum('conga', 'handLo', ['x... ..x. .... ..x.', 'x... ..x. ..x. ....'], 0.36),
    drum('shaker', 'shakerJ', ['..o. ..o. ..o. ..o.'], 0.22),
  ];
  const all = ['tune', 'tune2', 'counter'];
  const only = (...keep: string[]) => all.filter((n) => !keep.includes(n));
  const form: FormPart[] = [
    { name: 'A', chords: HOOK_CHORDS, lines: { tune: SLOMATT_A }, rest: only('tune') },
    { name: 'B', chords: SING_CHORDS, lines: { tune2: SING }, rest: only('tune2') },
    { name: 'C', chords: ['D', 'G', 'Em', 'A', 'D', 'G', 'Em', 'A'], rest: [...only('counter'), 'conga'] },
    { name: 'A2', chords: HOOK_CHORDS, lines: { tune: SLOMATT_A.map((b) => ornament(b, r)) }, rest: only('tune') },
    { name: 'B2', chords: SING_CHORDS, lines: { tune: SING.map((b) => ornament(b, r)) }, rest: only('tune') },
    { name: 'break', chords: ['D', 'D', 'G', 'A', 'D', 'D', 'G', 'A'], lines: { tune: [...MOTIF4, REST, REST, REST, REST] }, rest: [...only('tune'), 'conga', 'bass'], lift: -0.3 },
  ];
  return { id, bpm: 92, tonic: 'D4', scale: 'major', delay: 0.75, chords: HOOK_CHORDS, form, chain: true, tracks, level: 0.9 };
}

export const menuTheme = (): Theme => lightTheme('menu', 'marimbaR', 0);

/** each world's lead (styles.ts) and where it sings: the map hands the tune to the world Pokey is on */
const WORLD_LEAD: Record<number, [NoteInstName, number]> = {
  1: ['flute', 12], 2: ['clarinet', 0], 3: ['harp', 0], 4: ['horn', -12], 5: ['oboe', 0],
  6: ['bassoon', -12], 7: ['cello', -12], 8: ['violins', 12], 9: ['trombone', -12], 10: ['horn', -12],
};
export function mapTheme(world: number): Theme {
  const w = Math.max(1, Math.min(10, Math.floor(world) || 1));
  const [inst, shift] = WORLD_LEAD[w];
  return lightTheme(`map-${w}`, inst, shift);
}

/** 'signature', 'menu' or 'map-<world>' -> the piece; anything else is not ours */
export function signatureById(id: string): Theme | null {
  if (id === 'signature') return signatureTheme();
  if (id === 'menu') return menuTheme();
  const m = /^map-(\d{1,2})$/.exec(id);
  return m ? mapTheme(Number(m[1])) : null;
}
