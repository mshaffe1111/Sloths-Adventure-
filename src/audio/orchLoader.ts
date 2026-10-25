/**
 * Loads the recorded orchestra (src/assets/orch/<instrument>_<midi note>_<loop start ms>.mp3, from VSCO 2 Community Edition, CC0;
 * see scripts/prepOrch.py and CREDITS.txt there) into the audio core.
 *
 * Unlike the effects, the orchestra is large, so an instrument is only fetched and decoded when a piece that plays it is about to
 * start (see groupsFor). Until it has arrived every voice uses its synthesized stand-in, and in tests and the offline renderer that
 * never call this the bank simply stays empty.
 */
import type { AudioCore, OrchSample } from './core.ts';
import { bytesOf } from './sampleLoader.ts';
import type { Theme } from './music.ts';
import { fullOrchestra, realVoice } from './realize.ts';

const files = import.meta.glob('../assets/orch/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** how long a looped steady stretch is, in seconds (prepOrch.py's LOOP_LEN) */
const LOOP_LEN = 1.8;

/** "cello_50_1300.mp3" -> instrument, MIDI note, loop start in seconds */
export function parseOrchName(path: string): { inst: string; midi: number; loop: number } | null {
  const m = /\/([A-Za-z]+)_(\d+)_(\d+)\.mp3$/.exec(path);
  return m ? { inst: m[1], midi: Number(m[2]), loop: Number(m[3]) / 1000 } : null;
}

const started = new WeakMap<AudioCore, Map<string, Promise<void>>>();

/**
 * The rate each recording is decoded at. A decoded note is raw 32-bit sound at the rate it is decoded at, and the context's own rate (48 kHz on
 * an iPhone) made the orchestra 75 to 100 MB (memory audit, 2026-10-25). Every pitched voice already filters its top away (the `bright`
 * caps in instruments.ts reach 13 kHz at most, most stop under 10 kHz), so they keep nothing a lower rate loses: 24 kHz holds sound up to
 * 12 kHz, about half the memory. The violin staccato reaches 11 kHz, so it gets 32 kHz for room when a note is pitched up; the drums and
 * bells are not filtered and keep the full rate.
 */
const FULL_RATE = new Set(['cymbal', 'snare', 'triangle', 'gong', 'glock', 'timp', 'bdrum']);
export function decodeRate(inst: string): number | null {
  if (FULL_RATE.has(inst)) return null;
  return inst === 'violinStac' ? 32000 : 24000;
}
const lowDecoders = new Map<number, BaseAudioContext | null>();
/** an offline context at `rate`, only for decoding (a buffer plays in any context; the source resamples it as it plays) */
function decoderAt(rate: number): BaseAudioContext | null {
  if (lowDecoders.has(rate)) return lowDecoders.get(rate)!;
  let d: BaseAudioContext | null = null;
  try {
    if (typeof OfflineAudioContext !== 'undefined') d = new OfflineAudioContext(1, 1, rate);
  } catch {
    d = null;
  }
  lowDecoders.set(rate, d);
  return d;
}
async function decodeFor(core: AudioCore, inst: string, bytes: ArrayBuffer): Promise<AudioBuffer> {
  const rate = decodeRate(inst);
  const low = rate && core.ctx.sampleRate > rate ? decoderAt(rate) : null;
  if (low) {
    try {
      // (a copy: decoding takes the bytes over, and the context's own decoder needs them if this one fails)
      const buf = await low.decodeAudioData(bytes.slice(0));
      if (buf && typeof buf.duration === 'number') return buf;
    } catch {
      /* this browser will not decode at that rate: the context's own rate it is */
    }
  }
  return core.ctx.decodeAudioData(bytes);
}

function store(core: AudioCore, inst: string, midi: number, loop: number, buf: AudioBuffer) {
  const list = core.orch.get(inst) ?? [];
  list.push({ buf, midi, loopStart: loop, loopEnd: loop > 0 ? Math.min(buf.duration, loop + LOOP_LEN) : 0 });
  list.sort((a, b) => a.midi - b.midi);
  core.orch.set(inst, list);
}

/** fetch and decode these instruments (each only once per core); resolves when all of them are ready or have failed */
export function loadOrch(core: AudioCore, insts: Iterable<string>): Promise<void> {
  let per = started.get(core);
  if (!per) started.set(core, (per = new Map()));
  const jobs: Promise<void>[] = [];
  for (const inst of insts) {
    let job = per.get(inst);
    if (!job) {
      job = (async () => {
        await Promise.all(
          Object.entries(files).map(async ([path, url]) => {
            const n = parseOrchName(path);
            if (!n || n.inst !== inst) return;
            try {
              store(core, inst, n.midi, n.loop, await decodeFor(core, inst, await bytesOf(url)));
            } catch {
              /* a note that will not decode is just missing: the nearest one is used instead */
            }
          })
        );
      })();
      per.set(inst, job);
    }
    jobs.push(job);
  }
  return Promise.all(jobs).then(() => undefined);
}

/** for tests and the offline renderer: load from in-memory data instead of urls */
export async function loadOrchFrom(core: AudioCore, data: Record<string, ArrayBuffer>): Promise<void> {
  for (const [path, bytes] of Object.entries(data)) {
    const n = parseOrchName('/' + path);
    if (n) store(core, n.inst, n.midi, n.loop, await core.ctx.decodeAudioData(bytes.slice(0)));
  }
}

/** every recorded instrument there is, for a renderer that wants the lot */
export const ALL_ORCH = ['cello', 'contra', 'violins', 'violas', 'horn', 'trombone', 'tuba', 'celloStac', 'violinStac', 'hornStac', 'contraPizz', 'timp', 'bdrum', 'gong', 'cymbal', 'harp', 'flute', 'oboe', 'clarinet', 'bassoon', 'snare', 'triangle', 'glock', 'marimba'];

/** which recordings each voice draws on */
export const VOICE_GROUPS: Record<string, string[]> = {
  cello: ['cello'], contra: ['contra'], violins: ['violins'], violas: ['violas'], horn: ['horn'], trombone: ['trombone'], tuba: ['tuba'],
  celloStac: ['celloStac'], violinStac: ['violinStac'], hornStac: ['hornStac'], contraPizz: ['contraPizz'],
  orchStrings: ['cello', 'violas', 'violins'], orchBrass: ['horn', 'trombone'],
  harp: ['harp'], flute: ['flute'], oboe: ['oboe'], clarinet: ['clarinet'], bassoon: ['bassoon'], snare: ['snare'], triangle: ['triangle'],
  timpani: ['timp'], taiko: ['bdrum'], bassDrum: ['bdrum'], crash: ['cymbal'], gong: ['gong'],
  marimbaR: ['marimba'], glockR: ['glock'], bassR: ['contra'], harpSoft: ['harp'], figR: ['violinStac', 'celloStac'], orchLow: ['contra', 'cello'], orchWinds: ['bassoon', 'clarinet', 'flute'], snareSoft: ['snare'],
};

/** the instruments a piece will need */
export function groupsFor(theme: Theme, real = true): string[] {
  const out = new Set<string>();
  for (const t of real ? [...theme.tracks, ...fullOrchestra(theme)] : theme.tracks) {
    const key = t.kind === 'drums' ? t.voice : t.kind === 'melody' ? [t.inst, t.altInst ?? ''] : t.inst;
    for (const k of Array.isArray(key) ? key : [key]) {
      // the voice the music really plays (see realize.ts)
      const v = !real || !k ? k : realVoice(t, k);
      for (const g of VOICE_GROUPS[v] ?? []) out.add(g);
    }
  }
  // the breakdown's crash and its drum roll, and the bell that answers the lead on the lift pass
  out.add('cymbal');
  out.add('bdrum');
  if (real) {
    out.add('timp');
    out.add('glock');
  }
  return [...out];
}
