/**
 * Loads the recorded effect set into recBank. The effect takes come packed in one file, src/assets/sfxrec/takes.mp3 (named .mp3 so every
 * host serves it as audio; it is a pack, not one mp3), made by tools/audio/sfxv1/pack.py: [4-byte header length][JSON [[<effect>_<n>.mp3,
 * bytes], ...]][the mp3s]. It is fetched and decoded as soon as the
 * audio is unlocked, the frequent moves first, so the first jump already has its sound (270 separate files took 11 s to arrive). The
 * world beds (bed<world>_0.mp3, 20 s each) are separate files, fetched only when that world's ambience starts (loadBed).
 *
 * Everything is decoded at 24 kHz where the browser allows it: the recordings carry nothing above 8 kHz, and a decoded second at the
 * context's own 48 kHz (an iPhone) costs twice the memory (the orchestra's memory audit, 2026-10-25).
 */
import type { AudioCore } from './core.ts';
import { bytesOf } from './sampleLoader.ts';
import { recBank } from './sfxRec.ts';

const files = import.meta.glob('../assets/sfxrec/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const packs = import.meta.glob('../assets/sfxrec/takes.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** split a pack into its takes: [[file name, bytes], ...] */
export function unpack(buf: ArrayBuffer): Array<[string, ArrayBuffer]> {
  const n = new DataView(buf).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n))) as Array<[string, number]>;
  const out: Array<[string, ArrayBuffer]> = [];
  let at = 4 + n;
  for (const [name, len] of head) {
    out.push([name, buf.slice(at, at + len)]);
    at += len;
  }
  return out;
}

/** "hit_fur_3.mp3" -> effect "hit_fur", take 3 */
export function parseRecName(path: string): { fx: string; i: number } | null {
  const m = /\/([A-Za-z0-9_]+)_(\d+)\.mp3$/.exec(path);
  return m ? { fx: m[1], i: Number(m[2]) } : null;
}

const RATE = 24000;
let decoder: BaseAudioContext | null | undefined;
function lowDecoder(): BaseAudioContext | null {
  if (decoder !== undefined) return decoder;
  try {
    decoder = typeof OfflineAudioContext !== 'undefined' ? new OfflineAudioContext(1, 1, RATE) : null;
  } catch {
    decoder = null;
  }
  return decoder;
}

async function decode(core: AudioCore, bytes: ArrayBuffer): Promise<AudioBuffer> {
  const low = core.ctx.sampleRate > RATE ? lowDecoder() : null;
  if (low) {
    try {
      const b = await low.decodeAudioData(bytes.slice(0));
      if (b && typeof b.duration === 'number') return b;
    } catch {
      /* this browser will not decode at that rate: the context's own it is */
    }
  }
  return core.ctx.decodeAudioData(bytes);
}

function store(fx: string, i: number, buf: AudioBuffer) {
  const list = recBank.get(fx) ?? [];
  list[i] = buf;
  recBank.set(fx, list);
}

const isBed = (fx: string) => /^bed\d+$/.test(fx);
const started = new WeakMap<AudioCore, Promise<void>>();

/** fetch and decode every recorded effect once (the beds wait for loadBed) */
export function loadRec(core: AudioCore): Promise<void> {
  const have = started.get(core);
  if (have) return have;
  const job = (async () => {
    const url = Object.values(packs)[0];
    if (!url) return;
    const entries = unpack(await bytesOf(url))
      .map(([name, bytes]) => ({ n: parseRecName('/' + name), bytes }))
      .filter((e): e is { n: { fx: string; i: number }; bytes: ArrayBuffer } => !!e.n && !isBed(e.n.fx));
    // the frequent moves first, so they are ready by the first jump
    const first = (fx: string) => (/^(jump|step|landing|swish|flower|uiTap)/.test(fx) ? 0 : 1);
    entries.sort((a, b) => first(a.n.fx) - first(b.n.fx));
    const queue = [...entries];
    const worker = async () => {
      for (let e = queue.shift(); e; e = queue.shift()) {
        try {
          store(e.n.fx, e.n.i, await decode(core, e.bytes));
        } catch {
          /* a take that will not decode is simply missing: its effect plays its other takes */
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    for (const [fx, list] of recBank) recBank.set(fx, list.filter(Boolean));
  })();
  started.set(core, job);
  return job;
}

/**
 * A bed made to loop with no seam: the silence an mp3 decoder pads at both ends is trimmed (it would be a gap at every loop), and the
 * last XF seconds are cross-faded (equal power) into the first, so the loop point is inside continuous sound.
 */
const XF = 0.1;
export function seamless(ctx: BaseAudioContext, buf: AudioBuffer): AudioBuffer {
  const x = buf.getChannelData(0);
  let a = 0;
  let b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < 1e-4) a++;
  while (b > a && Math.abs(x[b]) < 1e-4) b--;
  const k = Math.round(XF * buf.sampleRate);
  const n = b + 1 - a - k;
  if (n <= k * 2) return buf;
  const out = ctx.createBuffer(1, n, buf.sampleRate);
  const y = out.getChannelData(0);
  y.set(x.subarray(a, a + n));
  for (let i = 0; i < k; i++) {
    const w = (i / k) * (Math.PI / 2);
    // the head fades in while the tail that would follow the loop point fades out over it
    y[i] = x[a + i] * Math.sin(w) + x[a + n + i] * Math.cos(w);
  }
  return out;
}

const beds = new Map<number, Promise<AudioBuffer | null>>();
/** a world's bed (1..10), fetched and decoded once */
export function loadBed(core: AudioCore, world: number): Promise<AudioBuffer | null> {
  let p = beds.get(world);
  if (!p) {
    const url = Object.entries(files).find(([path]) => parseRecName(path)?.fx === `bed${world}`)?.[1];
    p = url
      ? bytesOf(url)
          .then((b) => decode(core, b))
          .then((buf) => seamless(core.ctx, buf))
          .catch(() => null)
      : Promise.resolve(null);
    beds.set(world, p);
  }
  return p;
}
