/**
 * The game's signature music (Matt, 2026-10-29: "We also need some for the menu and start screen that is bold and unique", and then "still
 * fits the theme, just stands out. So it's not repetitive within the game"): in the game's own family (marimba, flute, harp, strings, hand
 * drums, Pokey's motif) but in a key and a groove of its own, with a tune of its own, so the menus never sound like a stage.
 *
 *   signature   the start screen, the full statement (about 55 s, then round again): the 12/8 groove alone, the hook on the marimba, a warm
 *               section on violins and cellos, the hook again with the flute above it, a quiet passage where the harp
 *               plays the motif over the hand drums, and the hook to close
 *   menu        the menus (settings, journal, pause from the title): the same tune and key, lighter (marimba, flute, harp, soft hand drums),
 *               as chunks the Playback strings together in a never-repeating order (form.ts), so minutes of sitting never tire
 *   map-<w>     the world map: the menu music with the tune handed to the lead of the world Pokey is on (styles.ts), so moving between
 *               worlds changes the voice
 *
 * All in B-flat major and 12/8 (no world is in either); the hook opens with Pokey's motif, the thread every world's music carries.
 */
import type { ChordTrack, DrumTrack, FormPart, MelodyTrack, NoteInstName, PatternTrack, Theme } from './music.ts';
import { ornament, POKEY_MOTIF12 } from './form.ts';
import { rng } from './theory.ts';
import { trim } from './scoreKit.ts';

/** the signature is in 12/8: twelve sixteenth-steps to a bar, four groups of three */
const STEPS = 12;
const REST = 'r:12';
const rests = (n: number) => Array.from({ length: n }, () => REST);

/**
 * The signature tune: Pokey's two-bar motif, in three (form.ts), carried on into a tune of its own. B-flat major, a key no world plays in,
 * so the menus never sound like a stage (Matt, 2026-10-29: "still fits the theme, just stands out. So it's not repetitive within the game").
 */
const HOOK = [
  POKEY_MOTIF12[0], POKEY_MOTIF12[1],
  "3:2 5:2 1':2 7:3 6:3", '5:6 r:2 4:2 3:2',
  "5:3 6:1 5:2 3:2 5:2 1':2", "2':3 1':3 6:2 5:4",
  '4:3 6:3 5:2 3:2 2:2', '1:9 r:3',
];
/** the hook's chords: I V vi IV, I IV V I */
const HOOK_CHORDS = ['Bb', 'F', 'Gm', 'Eb', 'Bb', 'Eb', 'F', 'Bb'];
/** the warm section: from the relative minor, home through the dominant */
const SING_CHORDS = ['Gm', 'Eb', 'Bb', 'F', 'Eb', 'F', 'Gm', 'F'];
const SING = ['3:6 2:3 3:3', '4:9 3:3', '5:3 4:3 3:3 2:3', '3:12', '6:6 5:3 4:3', '5:9 r:3', '3:3 4:3 5:3 6:3', '5:12'];
/** the motif alone, for the quiet passage */
const MOTIF4 = [POKEY_MOTIF12[0], POKEY_MOTIF12[1], POKEY_MOTIF12[0], '2:3 3:1 2:2 1:6'];

const mel = (name: string, inst: NoteInstName, gain: number, o: Partial<MelodyTrack> = {}): MelodyTrack =>
  ({ kind: 'melody', name, inst, bars: rests(8), gain: Math.round(gain * trim(inst) * 1000) / 1000, rev: 0.4, ...o }) as MelodyTrack;
const pat = (name: string, inst: NoteInstName, oct: number, pats: string[], gain: number, o: Partial<PatternTrack> = {}): PatternTrack =>
  ({ kind: 'pattern', name, inst, oct, pats, gain, rev: 0.2, ...o }) as PatternTrack;
const drum = (name: string, voice: DrumTrack['voice'], pats: string[], gain: number, o: Partial<DrumTrack> = {}): DrumTrack =>
  ({ kind: 'drums', name, voice, pats, gain, rev: 0.2, ...o }) as DrumTrack;

/** the groove no world has: a 12/8 hand-drum groove under a clave-like bell (woodblock), the bass rolling with it */
const GROOVE = (soft: number) => [
  drum('bell', 'woodJ', ['x.x.xx.x.x.x'], 0.36 * soft),
  drum('low', 'handLo', ['x.....x..x..', 'x.....x..x.x'], 0.55 * soft),
  drum('high', 'handHi', ['..x..x...x.x', '..x..x..xx.x'], 0.45 * soft),
  drum('shaker', 'shakerJ', ['xoxoxoxoxoxo'], 0.3 * soft),
  drum('kick', 'kickJ', ['x.....x.....'], 0.5 * soft),
];

/** the start screen: the full statement */
export function signatureTheme(): Theme {
  const tracks = [
    { kind: 'chords', name: 'strings', inst: 'orchStrings', lo: 50, hi: 72, voices: 4, gain: 0.3, rev: 0.55 } as ChordTrack,
    // a soft bed of horns: warmth, not a fanfare
    { kind: 'chords', name: 'horns', inst: 'orchBrass', lo: 46, hi: 63, voices: 3, gain: 0.18, rev: 0.6 } as ChordTrack,
    pat('bass', 'contraPizz', 34, ['R....r..R.f.', 'R....r.R..t.'], 0.85, { len: 0.7 }),
    pat('ripple', 'harp', 58, ['r.t.f.o.f.t.', 'r.f.o.t.o.f.'], 0.3, { rev: 0.45, pan: -0.3 }),
    // the hook on the marimba, the flute an octave above it the second time
    mel('hook', 'marimbaR', 0.72, { rev: 0.35 }),
    mel('flute', 'flute', 0.42, { shift: 12, genKey: 'hook' }),
    // the warm section: violins, the cellos an octave below
    mel('sing', 'violins', 0.42, { shift: 12, legato: 0.98, rev: 0.5 }),
    mel('singLo', 'cello', 0.45, { genKey: 'sing', legato: 0.98, rev: 0.5 }),
    mel('motif', 'harp', 0.6, { shift: 12, rev: 0.5 }),
    ...GROOVE(1),
  ];
  const all = ['hook', 'flute', 'sing', 'singLo', 'motif'];
  const only = (...keep: string[]) => all.filter((n) => !keep.includes(n));
  const form: FormPart[] = [
    // the groove alone: the bell, the hand drums and the bass
    { name: 'intro', chords: ['Bb', 'Eb', 'F', 'F'], rest: [...all, 'choir', 'strings', 'horns', 'ripple'] },
    { name: 'A', chords: HOOK_CHORDS, lines: { hook: HOOK }, rest: [...only('hook'), 'choir'] },
    // the warm part: the drums thin out, the strings sing
    { name: 'B', chords: SING_CHORDS, lines: { sing: SING }, rest: [...only('sing', 'singLo'), 'kick', 'high'], lift: -0.1 },
    { name: 'A2', chords: HOOK_CHORDS, lines: { hook: HOOK }, rest: only('hook', 'flute'), lift: 0.15 },
    // the quiet passage: the motif on the harp over the hand drums
    { name: 'break', chords: ['Bb', 'Bb', 'Eb', 'F'], lines: { motif: MOTIF4 }, rest: [...only('motif'), 'strings', 'horns', 'choir', 'bass', 'kick'] },
    { name: 'A3', chords: HOOK_CHORDS, lines: { hook: HOOK }, rest: only('hook', 'flute'), lift: 0.2 },
  ];
  // (light orchestra: the low strings and string beds only. A choir and the woodwind and horn beds were another 8 MB of recordings to hold
  // in a phone's memory for the start screen alone)
  return { id: 'signature', bpm: 132, tonic: 'Bb3', scale: 'major', stepsPerBar: STEPS, delay: 0.75, chords: HOOK_CHORDS, form, tracks, level: 0.9, orch: 'light' };
}

/** the menus and (with the world's lead) the map: the same tune and groove, lighter, as chunks that never come round in the same order */
function lightTheme(id: string, lead: NoteInstName, leadShift: number): Theme {
  const r = rng(77);
  const tracks = [
    { kind: 'chords', name: 'pad', inst: 'orchStrings', lo: 52, hi: 72, voices: 3, gain: 0.22, rev: 0.6 } as ChordTrack,
    pat('bass', 'contraPizz', 34, ['R....r..R...', 'R....r..f...'], 0.7, { len: 0.7 }),
    pat('ripple', 'harp', 58, ['r.t.f.o.f.t.', 'r.f.o.t.o.f.'], 0.3, { rev: 0.45, pan: -0.3 }),
    mel('tune', lead, 0.62, { ...(leadShift ? { shift: leadShift } : {}), rev: 0.4 }),
    mel('tune2', 'flute', 0.5, { shift: 12, rev: 0.45 }),
    { ...mel('counter', 'clarinet', 0.36, { rev: 0.5 }), bars: Array.from({ length: 8 }, () => null), gen: { lo: 65, hi: 78, density: 0.3 } } as MelodyTrack,
    ...GROOVE(0.6).filter((d) => d.name !== 'kick'),
  ];
  const all = ['tune', 'tune2', 'counter'];
  const only = (...keep: string[]) => all.filter((n) => !keep.includes(n));
  const form: FormPart[] = [
    { name: 'A', chords: HOOK_CHORDS, lines: { tune: HOOK }, rest: only('tune') },
    { name: 'B', chords: SING_CHORDS, lines: { tune2: SING }, rest: only('tune2') },
    { name: 'C', chords: ['Bb', 'Eb', 'Cm', 'F', 'Bb', 'Eb', 'Cm', 'F'], rest: [...only('counter'), 'low'] },
    { name: 'A2', chords: HOOK_CHORDS, lines: { tune: HOOK.map((b) => ornament(b, r)) }, rest: only('tune') },
    { name: 'B2', chords: SING_CHORDS, lines: { tune: SING.map((b) => ornament(b, r)) }, rest: only('tune') },
    { name: 'break', chords: ['Bb', 'Bb', 'Eb', 'F', 'Bb', 'Bb', 'Eb', 'F'], lines: { tune: [...MOTIF4, REST, REST, REST, REST] }, rest: [...only('tune'), 'low', 'high', 'bass'], lift: -0.3 },
    // (two more, so a menu sat on for minutes goes about 100 s before anything comes back)
    { name: 'C2', chords: ['Gm', 'Eb', 'Cm', 'F', 'Gm', 'Eb', 'F', 'F'], rest: [...only('counter'), 'high'] },
    { name: 'A3', chords: HOOK_CHORDS, lines: { tune2: HOOK.map((b) => ornament(b, r)) }, rest: only('tune2') },
  ];
  return { id, bpm: 116, tonic: 'Bb3', scale: 'major', stepsPerBar: STEPS, delay: 0.75, chords: HOOK_CHORDS, form, chain: true, tracks, level: 0.9, orch: 'light' };
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
